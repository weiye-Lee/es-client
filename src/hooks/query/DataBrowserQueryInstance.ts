import { TableColumn } from "$/shared/common/TableColumn";
import { searchResultToTable } from "@/core/elasticsearch-client/components/SearchResultToTable";
import { stringifyJsonWithBigIntSupport } from "@/core/util";
import { conditionToES, ExprFunctionCall, parseSQL } from "@/core/util/file/SqlParser";
import { useGlobalSettingStore, useUrlStore } from "@/store";
import type { Ref } from "vue";

export interface UseDataBrowserQueryInstance {
  // 查询内容
  sql: string;

  // ---------------------------------------- 结果相关 ----------------------------------------
  loading: Ref<boolean>;
  // 查询结果
  records: Ref<Array<Record<string, any>>>;
  columns: Ref<Array<TableColumn>>;
  // 总记录数
  total: Ref<number>;
  // 当前页码
  pageNum: Ref<number>;
  // 每页记录数
  pageSize: Ref<number>;

  /**
   * 运行查询语句
   * @param sql 查询语句
   */
  run(sql: string): Promise<void>;

}

function renderFunctionForConcat(expr: ExprFunctionCall, record: Record<string, any>): string {
  let val = '';
  expr.args.forEach(arg => {
    if (arg.type === 'Identifier') {
      val += record[arg.name];
    } else if (arg.type === 'StringLiteral') {
      val += arg.value;
    } else if (arg.type === 'NumberLiteral') {
      val += arg.value.toString();
    } else if (arg.type === 'FunctionCall') {
      val += renderFunctionForConcat(arg, record);
    }
  })
  return val;
}


function renderFunctionCall(expr: ExprFunctionCall, record: Record<string, any>): string {
  if (expr.name.toUpperCase().trim() === 'CONCAT') {
    return renderFunctionForConcat(expr, record);
  } else {
    console.warn("不支持的函数调用：" + expr.name);
    return "";
  }
}

export function useDataBrowserQueryInstance(sql: string): UseDataBrowserQueryInstance {


  const loading = ref(false);
  // 显示的列
  const columns = ref<Array<TableColumn>>([]);
  // 查询结果
  const records = ref<Array<Record<string, any>>>([]);
  // 总记录数
  const total = ref(0);
  // 当前页码
  const pageNum = ref(1);
  // 每页记录数
  const pageSize = ref(useGlobalSettingStore().pageSize);

  async function run() {
    if (loading.value) return;
    loading.value = true;
    try {
      // 第一步解析查询
      const query = parseSQL(sql);
      // 第二部，将查询语句转为DSL
      let dsl: Record<string, any> = {}
      if (query.where) {
        dsl.query = conditionToES(query.where);
      } else {
        // 默认查询全部
        dsl.query = {
          bool: {
            must: [],
            must_not: [],
            should: [],
          },
        };
      }
      // 第三步，添加分页
      dsl.from = (pageNum.value - 1) * pageSize.value;
      dsl.size = pageSize.value;
      // 第四步，处理track_total_hits
      const { client, versionFirst } = useUrlStore();
      const { trackTotalHitsMode, trackTotalHitsValue } = useGlobalSettingStore();
      if (versionFirst >= 7) {
        if (trackTotalHitsMode === "custom") {
          dsl.track_total_hits = trackTotalHitsValue;
        } else {
          dsl.track_total_hits = trackTotalHitsMode === "true";
        }
      }
      // 第四步，执行查询
      if (!client) return Promise.reject(new Error("请先连接ES"));
      const res = await client.seniorSearch({
        method: 'POST',
        url: `${query.from}/_search`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: stringifyJsonWithBigIntSupport(dsl),
      });
      // 查询成功，处理结果
      const table = searchResultToTable(res);
      total.value = table.total;
      const r = table.records;
      // 表头需要特殊处理，因为sql中的字段存在别名等情况
      if (query.select.length === 1 && query.select[0].expr.type === 'Star') {
        // 如果查询的是*，则直接处理
        columns.value = table.columns;
      } else {
        // 需要遍历select，去寻找别名，并且还要支持方法
        const c = new Array<TableColumn>();
        query.select.forEach(item => {
          const { expr, alias } = item;
          switch (expr.type) {
            case "Star":
            case "QualifiedStar":
              table.columns.forEach(e => c.push(e));
              break;
            case "Identifier":
              c.push({
                title: alias || expr.name,
                field: expr.name,
              })
              break;
            case "StringLiteral":
            case "NumberLiteral":
              c.push({
                title: alias || expr.value.toString(),
                field: expr.value.toString(),
              })
              break;
            case "FunctionCall":
              // 最麻烦的方法调用，要适配多种方法，但是方法调用之会导致结果发生变化。
              r.forEach((e, i) => {
                const column = alias || expr.name;
                e[column] = renderFunctionCall(expr, table.records[i]);
              });
              break;
          }
        });
        columns.value = c;
        records.value = r;
      }
    } finally {
      loading.value = false;
    }
  }

  run().then(()=>console.debug("运行成功")).catch(e => console.error("运行失败", e));

  return {
    sql,
    loading,
    columns,
    records,
    total,
    pageNum,
    pageSize,
    run,
  };


}