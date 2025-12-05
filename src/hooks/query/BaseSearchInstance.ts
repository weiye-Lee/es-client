import type { Ref } from "vue";
import { useGlobalSettingStore, useIndexStore, useUrlStore } from "@/store";
import MessageUtil from "@/utils/model/MessageUtil";
import { clientSearchBaseApi } from "@/api";
import { stringifyJsonWithBigIntSupport, useSnowflake } from "$/util";
import { cloneDeep } from "es-toolkit";
import {
  buildBaseSearchData,
  buildBaseSearchOrder,
  buildBaseSearchQuery
} from "$/elasticsearch-client/components/BaseSearchQuery";
import { decodeIndexType, encodeIndexType } from "$/elasticsearch-client/utils";
import { BaseQueryItem, BaseQueryOrder } from "$/elasticsearch-client";

export interface BaseSearchInstanceResult {
  id: string;
  // 索引:类型
  index: Ref<string>;
  // 条件
  query: Ref<Array<BaseQueryItem>>;
  // 排序
  orders: Ref<Array<BaseQueryOrder>>;
  // 页码
  pageNum: Ref<number>;
  // 每页大小
  pageSize: Ref<number>;
  // 总数
  total: Ref<number>;
  // 结果
  result: Ref<string>;

  run: () => void;

  buildQuery: () => any;
  buildSort: () => any;
  buildData: () => string;
}

export const useBaseSearchInstance = (): BaseSearchInstanceResult => {
  const index = ref("");
  const query = ref(new Array<BaseQueryItem>());
  const orders = ref(new Array<BaseQueryOrder>());
  const pageNum = ref(1);
  const pageSize = ref(useGlobalSettingStore().pageSize);

  const total = ref(0);
  const loading = ref(false);
  const result = ref("");

  const run = () => {
    const { id } = useUrlStore();
    if (!id) return MessageUtil.warning("请选择索引");
    if (loading.value) return;
    let templateIndex = index.value;
    if (!useIndexStore().mappingMap.has(templateIndex)) {
      // 自定义模板
      templateIndex = encodeIndexType(templateIndex, "");
    }
    const { index: idx, type } = decodeIndexType(templateIndex);
    const { trackTotalHitsMode, trackTotalHitsValue } = useGlobalSettingStore();
    clientSearchBaseApi(
      id,
      cloneDeep({
        index: idx,
        type: type,
        query: query.value,
        order: orders.value,
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        trackTotalHitsMode,
        trackTotalHitsValue
      })
    )
      .then((r) => {
        total.value = r.total;
        result.value = r.data;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const buildQuery = () => buildBaseSearchQuery({ query: query.value });
  const buildSort = () => buildBaseSearchOrder({ order: orders.value });

  const buildData = () => {
    const { index: idx, type } = decodeIndexType(index.value);
    const { trackTotalHitsMode, trackTotalHitsValue } = useGlobalSettingStore();
    const { versionFirst } = useUrlStore();
    return stringifyJsonWithBigIntSupport(
      buildBaseSearchData(
        {
          index: idx,
          type: type,
          query: query.value,
          order: orders.value,
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          trackTotalHitsMode,
          trackTotalHitsValue
        },
        versionFirst
      )
    );
  };

  return {
    id: useSnowflake().nextId(),
    index,
    query,
    orders,
    pageNum,
    pageSize,
    total,
    result,
    run,
    buildQuery,
    buildSort,
    buildData
  };
};
