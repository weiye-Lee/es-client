import LocalNameEnum from "@/enumeration/LocalNameEnum";
import Base from "../Base";

export const DATA_BROWSER_QUERY_KEY = (urlId: number) => `${LocalNameEnum.LIST_DATA_BROWSER_QUERY}/${urlId}`;
export const DATA_BROWSER_QUERY_ITEM_KEY = (id: number) => `${LocalNameEnum.ITEM_DATA_BROWSER_QUERY}/${id}`;

/**
 * 数据浏览 - 查询
 */
export interface DataBrowserQueryItem extends Base {

  /**
   * 文件名
   */
  name: string;

}

export interface DataBrowserQueryBody {
  content: string;
}

export interface DataBrowserQuery extends DataBrowserQueryItem, DataBrowserQueryBody {
}