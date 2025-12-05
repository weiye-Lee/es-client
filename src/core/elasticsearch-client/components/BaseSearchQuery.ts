import { BaseSearchProp } from "$/elasticsearch-client";
import { decodeTypeField } from "$/elasticsearch-client/utils";

export function buildBaseSearchQuery(props: Pick<BaseSearchProp, "query">) {
  const { query } = props;

  // 构建bool查询
  const boolQuery: any = {
    bool: {}
  };

  // 分组查询条件
  const mustQueries: any[] = [];
  const shouldQueries: any[] = [];
  const mustNotQueries: any[] = [];

  query
    .filter((item) => item.isEnable)
    .forEach((item) => {
      let queryClause: any = {};

      const { field } = decodeTypeField(item.field);

      switch (item.condition) {
        case "match":
          queryClause = { match: { [field]: item.value } };
          break;
        case "term":
          queryClause = { term: { [field]: item.value } };
          break;
        case "terms":
          queryClause = { terms: { [field]: item.value.split(",").map((v) => v.trim()) } };
          break;
        case "exists":
          queryClause = { exists: { field: field } };
          break;
        case "missing":
          queryClause = { bool: { must_not: { exists: { field: field } } } };
          break;
        case "wildcard":
          queryClause = { wildcard: { [field]: item.value } };
          break;
        case "range_lt":
          queryClause = { range: { [field]: { lt: item.value } } };
          break;
        case "range_lte":
          queryClause = { range: { [field]: { lte: item.value } } };
          break;
        case "range_gt":
          queryClause = { range: { [field]: { gt: item.value } } };
          break;
        case "range_gte":
          queryClause = { range: { [field]: { gte: item.value } } };
          break;
      }

      switch (item.type) {
        case "must":
          mustQueries.push(queryClause);
          break;
        case "should":
          shouldQueries.push(queryClause);
          break;
        case "must_not":
          mustNotQueries.push(queryClause);
          break;
      }
    });

  // 设置bool查询条件
  if (mustQueries.length > 0) boolQuery.bool.must = mustQueries;
  if (shouldQueries.length > 0) boolQuery.bool.should = shouldQueries;
  if (mustNotQueries.length > 0) boolQuery.bool.must_not = mustNotQueries;

  return Object.keys(boolQuery.bool).length > 0 ? boolQuery : { match_all: {} };
}

export function buildBaseSearchOrder(props: Pick<BaseSearchProp, "order">) {
  const { order } = props;

  // 构建排序
  const sort: any[] = [];
  order
    .filter((item) => item.isEnable)
    .forEach((item) => {
      const { field } = decodeTypeField(item.field);
      sort.push({ [field]: { order: item.type } });
    });

  return sort;
}

export function buildBaseSearchData(props: BaseSearchProp, versionFirst: number) {
  const { pageNum, pageSize } = props;

  // 构建搜索请求体
  const searchBody: any = {
    query: buildBaseSearchQuery(props),
    from: (pageNum - 1) * pageSize,
    size: pageSize
  };
  // 构建排序
  const sort = buildBaseSearchOrder(props);

  if (sort.length > 0) {
    searchBody.sort = sort;
  }

  if (versionFirst >= 7) {
    if (props.trackTotalHitsMode === "custom") {
      searchBody.track_total_hits = props.trackTotalHitsValue;
    } else {
      searchBody.track_total_hits = props.trackTotalHitsMode === "true";
    }
  }

  return searchBody;
}
