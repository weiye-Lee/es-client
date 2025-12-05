import { DataSearchResult } from "$/elasticsearch-client";
import { flattenObject, parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport } from "$/util";

/**
 * 搜索结果转为表格
 * @param response 搜索结果
 */
export function searchResultToTable(response: string): DataSearchResult {
  const result = parseJsonWithBigIntSupport(response);
  const hits = result.hits.hits || [];

  // 提取所有字段名
  const allFields = new Set<string>();
  allFields.add("_type");
  allFields.add("_score");
  allFields.add("_index");
  hits.forEach((hit: any) => {
    if (hit._source) {
      // 扁平化对象后加入集合
      Object.keys(flattenObject(hit._source)).forEach((key) => allFields.add(key));
    }
  });

  // 构建列配置
  const columns = Array.from(allFields).map((field) => ({
    field,
    title: field,
    width: Math.max(field.length * 16, 80),
    ellipsis: true,
    cellClass: "",
    show: true,
    sortable: {
      sortDirections: ["ascend", "descend"] as ("ascend" | "descend")[]
    }
  }));

  // 构建记录数据
  const records = hits.map((hit: any) => ({
    _id: hit._id,
    _index: hit._index,
    _type: hit._type,
    _score: hit._score,
    _source: stringifyJsonWithBigIntSupport(hit._source),
    ...flattenObject(hit._source)
  }));

  return {
    columns,
    records,
    total:
      typeof result.hits.total.value === "undefined" ? result.hits.total : result.hits.total.value,
    source: response
  };
}
