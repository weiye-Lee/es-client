import type { Ref } from "vue";
import { useSnowflake } from "$/util";
import { useGlobalSettingStore, useUrlStore, useIndexStore } from "@/store";
import MessageUtil from "@/utils/model/MessageUtil";
import { conditionBuild, orderBuild } from "@/utils/convert/data-browser-condition";
import {
  buildDataBrowserData,
  buildDataBrowserOrder,
  buildDataBrowserQuery
} from "$/elasticsearch-client/components/DataBrowserQuery";
import { DataSearchColumnConfig, DataSourceRecord } from "$/elasticsearch-client";
import { BaseBrowserBaseType } from "@/store/components/DataBrowseStore";
import {metaColumn} from "@/global/Constant";

export interface UseDataBrowserInstance {
  id: string;
  index: string;
  type: BaseBrowserBaseType;

  pageNum: Ref<number>;
  pageSize: Ref<number>;
  total: Ref<number>;

  must: Ref<string>;
  should: Ref<string>;
  mustNot: Ref<string>;
  order: Ref<string>;
  columns: Ref<Array<DataSearchColumnConfig>>;
  records: Ref<Array<Record<string, any>>>;

  loading: Ref<boolean>;
  run: (renderColumn?: boolean) => void;

  add: (data: string) => void;
  update: (record: DataSourceRecord, data: string) => void;
  remove: (record: DataSourceRecord) => void;
  clear: () => void;

  // 构建查询条件，JSON字符串
  buildSearchQuery: () => Record<string, any>;
  // 构建排序条件，JSON字符串
  buildSearchOrder: () => Array<Record<string, any>>;
  // 构建查询条件
  buildSearch: () => Record<string, any>;
}

export const useDataBrowserInstance = (
  index: string,
  type: BaseBrowserBaseType
): UseDataBrowserInstance => {
  // 唯一ID
  const id = useSnowflake().nextId();
  // 当前查询的索引

  const pageNum = ref(1);
  const pageSize = ref(useGlobalSettingStore().pageSize);
  const total = ref(0);

  // 查询条件
  const must = ref("");
  const should = ref("");
  const mustNot = ref("");
  const order = ref("");

  const loading = ref(false);

  // 显示的列
  const columns = ref<Array<DataSearchColumnConfig>>([]);
  // 数据
  const records = ref<Array<Record<string, any>>>([]);

  const run = (renderColumn = false) => {
    const {client} = useUrlStore();
    if (!client) return MessageUtil.warning("请选择链接");
    // if (loading.value) return MessageUtil.warning("正在查询中，请稍后");
    if (loading.value) return;
    loading.value = true;
    const {trackTotalHitsMode, trackTotalHitsValue} = useGlobalSettingStore();
    client.dataSearch({
      index,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      must: conditionBuild(must.value),
      should: conditionBuild(should.value),
      mustNot: conditionBuild(mustNot.value),
      order: orderBuild(order.value),
      trackTotalHitsMode,
      trackTotalHitsValue
    })
      .then((r) => {
        if (renderColumn) {
          const {dataBrowserShowMeta} = useGlobalSettingStore();
          const indexStore = useIndexStore();
          const metaCols = (dataBrowserShowMeta ? metaColumn() : []).map(c => ({ ...c, show: true } as DataSearchColumnConfig));
          // 使用 Map 去重，确保 _id 等字段不会重复
          const resultColsMap = new Map(r.columns.map(c => [c.field, { ...c, show: true }]));
          const resultCols = Array.from(resultColsMap.values());
          // 过滤掉 _id 字段，因为它会在 resultCols 中单独处理
          const allFields = indexStore.field(index).filter(f => f.dataIndex !== '_id');
          const colMap = new Map<string, DataSearchColumnConfig>();
          
          // Add meta columns
          metaCols.forEach(col => colMap.set(col.field, col));
          
          // Add all index fields with show: false (跳过已存在于 resultCols 中的字段)
          allFields.forEach(f => {
            // 如果该字段已经在 resultCols 中或 colMap 中，则跳过，避免重复
            if (!resultColsMap.has(f.dataIndex) && !colMap.has(f.dataIndex)) {
              colMap.set(f.dataIndex, {
                field: f.dataIndex,
                title: f.label,
                show: false,
                width: 120,
                ellipsis: true,
                cellClass: ''
              });
            }
          });
          
          // Override with result columns show: true
          resultCols.forEach(col => {
            if (!colMap.has(col.field)) {
              colMap.set(col.field, col);
            }
          });
          
          columns.value = Array.from(colMap.values());
        } else {
          // Merge new fields from result
          const resultCols = Array.from(new Map(r.columns.map(c => [c.field, { ...c, show: true }])).values());
          const currentCols = columns.value;
          const colMap = new Map(currentCols.map(c => [c.field, c]));
          resultCols.forEach(col => {
            if (!colMap.has(col.field)) {
              colMap.set(col.field, col);
            }
          });
          columns.value = Array.from(colMap.values());
        }
        records.value = r.records;
        total.value = r.total;
      })
      .catch(() => {
        clear();
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const add = (data: string) => {
    const {client} = useUrlStore();
    if (!client) return MessageUtil.warning("请选择链接");
    if (loading.value) return;
    loading.value = true;
    client.insertDoc(index, data)
      .then(() => {
        MessageUtil.success("添加成功");
      })
      .catch((e) => {
        MessageUtil.error("添加失败", e);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const update = (record: DataSourceRecord, data: string) => {
    const { client } = useUrlStore();
    if (!client) return MessageUtil.warning("请选择链接");
    if (loading.value) return;
    loading.value = true;
    client.updateDoc(
      record["_index"],
      record["_id"],
      data,
      record["_type"]
    )
      .then(() => {
        MessageUtil.success("修改成功");
        // 延迟1m
        setTimeout(() => run(), 1000);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const remove = (record: DataSourceRecord) => {
    const { client } = useUrlStore();
    if (!client) return MessageUtil.warning("请选择链接");
    if (loading.value) return;
    (() => {
      return client.deleteDoc(
        record["_index"],
        record["_id"],
        record["_type"]
      );
    })()
      .then(() => {
        MessageUtil.success("删除成功");
        run();
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const clear = () => {
    // 此处只是
    columns.value = [];
    records.value = [];
    total.value = 0;
  };

  const buildSearchQuery = () => {
    return buildDataBrowserQuery({
      must: conditionBuild(must.value),
      should: conditionBuild(should.value),
      mustNot: conditionBuild(mustNot.value)
    });
  };
  const buildSearchOrder = () => {
    return buildDataBrowserOrder({
      order: orderBuild(order.value)
    });
  };
  const buildSearch = () => {
    const { trackTotalHitsMode, trackTotalHitsValue } = useGlobalSettingStore();
    const { versionFirst } = useUrlStore();
    return buildDataBrowserData(
      {
        index,
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        must: conditionBuild(must.value),
        should: conditionBuild(should.value),
        mustNot: conditionBuild(mustNot.value),
        order: orderBuild(order.value),
        trackTotalHitsMode,
        trackTotalHitsValue
      },
      versionFirst
    );
  };

  return {
    id,
    index,
    type,
    pageNum,
    pageSize,
    total,
    must,
    should,
    mustNot,
    order,
    columns,
    records,
    loading,
    run,
    add,
    update,
    remove,
    clear,
    buildSearchQuery,
    buildSearchOrder,
    buildSearch
  };
};
