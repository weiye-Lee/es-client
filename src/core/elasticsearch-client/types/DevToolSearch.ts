export interface DevToolProp {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  /**
   * 索引类型，v6之前必须
   */
  type?: string;
}
