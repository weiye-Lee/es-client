/**
 * 全局设置
 */
export interface GlobalSetting {
  /*--------------------------------- 系统设置 ---------------------------------*/

  /**
   * 保存上次选择的连接
   */
  lastUrl: boolean;

  /*--------------------------------- 全局索引查询条件 ---------------------------------*/

  /**
   * 概览 => 搜索 => 状态
   */
  homeSearchState: number;

  /**
   * 概览 => 搜索 => 排除的索引
   */
  homeExcludeIndices: Array<string>;

  /**
   * 概览 => 搜索 => 显示的索引
   */
  homeIncludeIndices: Array<string>;

  /**
   * 索引排序
   */
  indexOrderBy: "asc" | "desc";

  /**
   * 索引分组内排序
   */
  indexGroupOrderBy: "asc" | "desc";

  /**
   * 索引显示模式：group-分组，list-列表
   */
  indexShowMode: "group" | "list";

  /*--------------------------------- 新建索引 ---------------------------------*/

  /**
   * 默认分片
   */
  defaultShard: number;

  /**
   * 默认副本
   */
  defaultReplica: number;

  /*--------------------------------- 请求 ---------------------------------*/

  /**
   * 超时时间
   */
  timeout: number;

  /**
   * 通知关闭时间
   */
  notificationTime: number;

  /*--------------------------------- track_total_hits设置 ---------------------------------*/

  /**
   * track_total_hits模式
   */
  trackTotalHitsMode: "true" | "false" | "custom";

  /**
   * 当模式为custom时，track_total_hits值
   */
  trackTotalHitsValue: number;

  /*--------------------------------- 显示设置 ---------------------------------*/

  /**
   * 默认分页大小
   */
  pageSize: number;

  /**
   * 字体大小，单位px，默认14
   */
  fontSize: number;

  /**
   * JSON是否自动换行
   */
  wrap: boolean;

  /**
   * 表格表头渲染模式
   */
  tableHeaderMode: number;
}
