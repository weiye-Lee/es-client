import LocalNameEnum from "@/enumeration/LocalNameEnum";

export const DATA_BROWSER_QUERY_KEY = (urlId: string) => `${LocalNameEnum.LIST_DATA_BROWSER_QUERY}/${urlId}`;
export const DATA_BROWSER_QUERY_ITEM_KEY = ( id: string) => `${LocalNameEnum.ITEM_DATA_BROWSER_QUERY}/${id}`;

/**
 * 数据浏览 - 查询
 */
export interface DataBrowserQueryItem {
  id: string;
  created_at: number;
  updated_at: number;

  url_id: string;

  /**
   * 文件名
   */
  name: string;
}

export type DataBrowserQueryBodyMode = "SQL" | "ES|QL";

export interface DataBrowserQueryBody {
  id: string;
  url_id: string;
  /**
   * 文件内容
   */
  content: string;
  /**
   * 最近50条查询记录
   * @type Array<string>
   */
  records: Array<string>;
  /**
   * 查询模式
   */
  mode: DataBrowserQueryBodyMode;
}

export interface DataBrowserQuery extends DataBrowserQueryItem, DataBrowserQueryBody {
}
