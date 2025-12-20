import { TableColumn } from "$/shared/common/TableColumn";
import { TableRecord } from "$/shared/common/TableRecord";

export interface DataSearchQueryItem {
  /**
   * 字段
   */
  field: string;
  /**
   * 操作符
   */
  operator: string;
  /**
   * 值
   */
  value: string;
  /**
   * 值类型
   */
  valueType: "string" | "number" | "boolean";
}

export interface DataSearchOrderItem {
  /**
   * 字段
   */
  field: string;
  /**
   * 操作符
   */
  operator: "asc" | "desc";
}

/**
 * 表格视图列配置
 */
export interface DataSearchColumnConfig extends TableColumn {}

export interface DataSourceRecord extends TableRecord {
  _id: string;
  // 元数据
  _type?: string;
  _store: string;
  _index: string;
  // 原始数据
  _source: string;
}

export interface DataSearchResult {
  // 表头
  columns: Array<DataSearchColumnConfig>;
  // 记录
  records: Array<DataSourceRecord>;
  // 总数
  total: number;
  // 原始数据
  source: string;
}

export interface DataSearchProp {
  must: Array<DataSearchQueryItem>;
  should: Array<DataSearchQueryItem>;
  mustNot: Array<DataSearchQueryItem>;
  order: Array<DataSearchOrderItem>;
  index: string;
  pageNum: number;
  pageSize: number;

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
