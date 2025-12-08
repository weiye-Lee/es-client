import { TableColumn } from "$/shared/common/TableColumn";
import { searchResultToTable } from "@/core/elasticsearch-client/components/SearchResultToTable";
import { parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport } from "@/core/util";
import { conditionToES, parseSQL } from "@/core/util/file/SqlParser";
import { DocumentSearchResult } from "@/domain/es/DocumentSearchResult";
import { getDataBrowserQuery } from "@/service/DataBrowser/DataBrwoserQueryService";
import { useGlobalSettingStore, useUrlStore } from "@/store";
import type { Ref } from "vue";

export interface UseDataBrowserQueryInstance {
  urlId: number;
  id: number;

  // 查询内容
  content: Ref<string>;

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

export function useDataBrowserQueryInstance(urlId: number, id: number) {

  const content = ref('');

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


  // 获取内容
  getDataBrowserQuery(id).then((r) => {
    content.value = r.record.content;
  });

  async function run(sql: string) {
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
      records.value = table.records;
      // 表头需要特殊处理，因为sql中的字段存在别名等情况
      // 如果查询的是*，则直接处理
      if (query.select === "*") {
        columns.value = table.columns;
      }
    } finally {
      loading.value = false;
    }
  }


}