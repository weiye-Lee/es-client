import {DATA_BROWSER_VIEW_KEY, DataBrowserView} from "@/entity/DataBrowser/DataBrowserView";
import {listByAsync} from "@/utils/utools/DbStorageUtil";

export async function listDataBrowserViews(id: number) {
  const {list} = await listByAsync<DataBrowserView>(DATA_BROWSER_VIEW_KEY(id));
  return list;
}