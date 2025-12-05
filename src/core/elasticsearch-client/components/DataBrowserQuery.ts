import { DataSearchProp } from "$/elasticsearch-client";

export function buildDataBrowserQuery(props: Pick<DataSearchProp, "must" | "should" | "mustNot">) {
  const { must, should, mustNot } = props;

  const boolQuery: any = { bool: {} };

  const buildQueryClause = (item: any) => {
    const { field, operator, value, valueType } = item;
    let actualValue: any = value;

    if (valueType === "number") {
      actualValue = Number(value);
    } else if (valueType === "boolean") {
      actualValue = value === "true";
    }

    switch (operator) {
      case "=":
      case "eq":
        return { term: { [field]: actualValue } };
      case "!=":
      case "ne":
        return { bool: { must_not: { term: { [field]: actualValue } } } };
      case ">":
      case "gt":
        return { range: { [field]: { gt: actualValue } } };
      case ">=":
      case "gte":
        return { range: { [field]: { gte: actualValue } } };
      case "<":
      case "lt":
        return { range: { [field]: { lt: actualValue } } };
      case "<=":
      case "lte":
        return { range: { [field]: { lte: actualValue } } };
      case "like":
        return { wildcard: { [field]: `*${value}*` } };
      case "match":
        return { match: { [field]: value } };
      case "exists":
        return { exists: { field } };
      case "missing":
        return { bool: { must_not: { exists: { field } } } };
      case "in": {
        const values = value.split(",").map((v: string) => v.trim());
        return { terms: { [field]: values } };
      }
      default:
        return { term: { [field]: actualValue } };
    }
  };

  if (must.length > 0) {
    boolQuery.bool.must = must.map(buildQueryClause);
  }
  if (should.length > 0) {
    boolQuery.bool.should = should.map(buildQueryClause);
  }
  if (mustNot.length > 0) {
    boolQuery.bool.must_not = mustNot.map(buildQueryClause);
  }
  return Object.keys(boolQuery.bool).length > 0 ? boolQuery : { match_all: {} };
}

export function buildDataBrowserOrder(props: Pick<DataSearchProp, "order">) {
  const { order } = props;
  const sort: any[] = [];
  order.forEach((item) => {
    sort.push({ [item.field]: { order: item.operator } });
  });
  return sort;
}

export function buildDataBrowserData(props: DataSearchProp, versionFirst: number) {
  const { pageNum, pageSize } = props;

  const searchBody: any = {
    query: buildDataBrowserQuery(props),
    from: (pageNum - 1) * pageSize,
    size: pageSize,
    _source: true
  };

  const sort = buildDataBrowserOrder(props);

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
