import Base from "@/entity/Base";
import LocalNameEnum from "@/enumeration/LocalNameEnum";

export const DATA_BROWSER_VIEW_KEY = (urlId: number) => `${LocalNameEnum.ITEM_DATA_BROWSER_VIEW}/${urlId}`;

/**
 * 数据浏览 - 视图
 *
 * @id /item/data-browser/view/${urlId}
 */
export interface DataBrowserView extends Base {
  /**
   * 匹配模式
   */
  pattern: string;
}