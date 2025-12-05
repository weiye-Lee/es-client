
export type BaseQueryItemType = "must" | "should" | "must_not";

export type BaseQueryItemCondition =
  | "match"
  | "term"
  | "terms"
  | "exists"
  | "missing"
  | "wildcard"
  | "range_lt"
  | "range_lte"
  | "range_gt"
  | "range_gte";

/**
 * 基础查询
 */
export interface BaseQueryItem {
  /**
   * 唯一标识，时间戳
   */
  id: number;
  /**
   * 查询类型 <br />
   * ['must', 'should', 'must_not']
   */
  type: BaseQueryItemType;

  /**
   * 字段
   */
  field: string;

  /**
   * 条件 <br />
   * 'match', 'wildcard', 'prefix', 'range', 'fuzzy', 'query_string', 'text', 'missing'
   */
  condition: BaseQueryItemCondition;

  /**
   * 值
   */
  value: string;

  /**
   * 是否启用
   */
  isEnable: boolean;
}

export type BaseQueryOrderType = "asc" | "desc";

/**
 * 基础排序
 */
export interface BaseQueryOrder {
  id: number;
  /**
   * 排序的字段
   */
  field: string;

  /**
   * 排序的方式
   */
  type: BaseQueryOrderType;

  /**
   * 是否启用
   */
  isEnable: boolean;
}

/**
 * 基础搜索的结果
 */
export interface BaseSearchResult {
  /**
   * 总数
   */
  total: number;
  // 原始数据，用于编辑
  data: string;
}

/**
 * 基础搜索参数
 * @param query 查询条件
 * @param order 排序条件
 * @param index 索引名称
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @returns 搜索结果
 */
export interface BaseSearchProp {
  query: Array<BaseQueryItem>;
  order: Array<BaseQueryOrder>;
  index: string;
  pageNum: number;
  pageSize: number;
  /**
   * 索引类型，v6之前必须
   */
  type?: string;

  /*--------------------------------- track_total_hits设置 ---------------------------------*/

  /**
   * track_total_hits模式
   */
  trackTotalHitsMode: "true" | "false" | "custom";

  /**
   * 当模式为custom时，track_total_hits值
   */
  trackTotalHitsValue: number;
}

export function getDefaultBaseQueryItem(): BaseQueryItem {
  return {
    id: new Date().getTime(),
    condition: "match",
    field: "",
    isEnable: true,
    type: "must",
    value: ""
  };
}