import {TableColumn} from "$/shared/common/TableColumn";
import {searchResultToTable} from "@/core/elasticsearch-client/components/SearchResultToTable";
import {stringifyJsonWithBigIntSupport} from "$/util";
import {conditionToES, ExprFunctionCall, parseSQL, Query} from "@/core/util/file/SqlParser";
import {useGlobalSettingStore, useUrlStore} from "@/store";
import type {Ref} from "vue";
import MessageUtil from "@/utils/model/MessageUtil";
import dayjs from "dayjs";

export interface UseDataBrowserQueryInstance {
  id: string;
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
  offset: Ref<number>;
  // 每页记录数
  limit: Ref<number>;

  /**
   * 刷新数据
   */
  refresh(): Promise<void>;

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

function renderFunctionForDataFormat(expr: ExprFunctionCall, record: Record<string, any>): string {
  let date = '';
  const [field, format] = expr.args;
  if (field.type === 'Identifier') {
    date = record[field.name];
  } else if (field.type === 'StringLiteral') {
    date = field.value;
  } else if (field.type === 'NumberLiteral') {
    date = field.value.toString();
  } else if (field.type === 'FunctionCall') {
    date = renderFunctionForConcat(field, record);
  }
  let f = 'YYYY-MM-DD HH:mm:ss';
  if (format && format.type === 'StringLiteral') {
    f = format.value;
  }
  return dayjs(date).format(f);
}

function renderFunctionCall(expr: ExprFunctionCall, record: Record<string, any>): string {
  switch (expr.name.toUpperCase().trim()) {
    case "CONCAT":
      return renderFunctionForConcat(expr, record);
    case "DATE_FORMAT":
      return renderFunctionForDataFormat(expr, record);
    default:
      console.warn("不支持的函数调用：" + expr.name);
      return "";
  }
}

export function useDataBrowserQueryInstance(sql: string, id: string): UseDataBrowserQueryInstance {

  let parse = true;
  const loading = ref(false);
  // 显示的列
  const columns = ref<Array<TableColumn>>([]);
  // 查询结果
  const records = ref<Array<Record<string, any>>>([]);
  // 总记录数
  const total = ref(0);
  // 当前页码
  const offset = ref(0);
  // 每页记录数
  const limit = ref(useGlobalSettingStore().pageSize);

  const dsl: Record<string, any> = {};
  let query: Query | null = null;

  try {
    // 第一步解析查询
    query = parseSQL(sql);
    // 第二部，将查询语句转为DSL
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
    // 第三步，处理track_total_hits
    const {versionFirst} = useUrlStore();
    const {trackTotalHitsMode, trackTotalHitsValue} = useGlobalSettingStore();
    if (versionFirst >= 7) {
      if (trackTotalHitsMode === "custom") {
        dsl.track_total_hits = trackTotalHitsValue;
      } else {
        dsl.track_total_hits = trackTotalHitsMode === "true";
      }
    }
    // 第四步处理排序
    if (query.orderBy) {
      dsl.sort = query.orderBy.map(item => {
        return {
          [item.field]: {
            order: item.direction,
          }
        }
      })
    }
    // 第五步，解析limit和offset
    if (typeof query.limit === 'number') limit.value = query.limit;
    if (typeof query.offset === 'number') offset.value = query.offset;
  } catch (e) {
    MessageUtil.error(`解析「${sql}」失败`, e)
    parse = false;
  }

  async function refresh() {
    if (!query) return MessageUtil.error(`请先解析SQL「${sql}」`);
    if (loading.value) return;
    loading.value = true;
    try {
      // 第一步，添加分页
      dsl.from = offset.value;
      dsl.size = limit.value;
      // 第二步，执行查询
      const {client} = useUrlStore();
      if (!client) return Promise.reject(new Error("请选择链接"));
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
      const c: Array<TableColumn> = [{
        field: "_id",
        title: "_id",
        width: 240,
        ellipsis: true,
        cellClass: "",
        show: true,
        sortable: {
          sortDirections: ["ascend", "descend"] as ("ascend" | "descend")[]
        }
      }];
      // 表头需要特殊处理，因为sql中的字段存在别名等情况
      if (query.select.length === 1 && query.select[0].expr.type === 'Star') {
        // 如果查询的是*，则直接处理
        c.push(...table.columns);
      } else {
        // 需要遍历select，去寻找别名，并且还要支持方法
        query.select.forEach(item => {
          const {expr, alias} = item;
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
              const k = alias || expr.name;
              c.push({
                title: k,
                field: k,
              })
              r.forEach((e, i) => {
                e[k] = renderFunctionCall(expr, table.records[i]);
              });
              break;
          }
        });
      }
      columns.value = c;
      records.value = r;
    } catch (e) {
      MessageUtil.error(`运行「${sql}」失败`, e)
    } finally {
      loading.value = false;
    }
  }

  if (parse) {
    // 第一次运行
    refresh().then(() => console.debug("运行成功")).catch(e => MessageUtil.error(`运行「${sql}」失败`, e));
  }

  watch([limit, offset], refresh);

  return {
    id,
    sql,
    loading,
    columns,
    records,
    total,
    offset,
    limit,
    refresh
  };


}