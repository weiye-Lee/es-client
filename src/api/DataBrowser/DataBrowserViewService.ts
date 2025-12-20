import {DATA_BROWSER_VIEW_KEY, DataBrowserView} from "@/entity/DataBrowser/DataBrowserView";
import {listByAsync, removeOneByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {useSnowflake} from "$/util";

export async function listDataBrowserViews(id: string) {
  const {list} = await listByAsync<DataBrowserView>(DATA_BROWSER_VIEW_KEY(id));
  return list;
}

export async function addDataBrowserView(id: string, view: Pick<DataBrowserView, "name" | "pattern">) {
  const {list} = await listByAsync<DataBrowserView>(DATA_BROWSER_VIEW_KEY(id));
  list.push({
    ...view,
    id: useSnowflake().nextId(),
    created_at: Date.now(),
    updated_at: Date.now(),
    url_id: id
  });
  await saveListByAsync(DATA_BROWSER_VIEW_KEY(id), list);
}

export async function deleteDataBrowserView(id: string, viewId: string) {
  const {list} = await listByAsync<DataBrowserView>(DATA_BROWSER_VIEW_KEY(id));
  list.splice(list.findIndex(e => e.id === viewId), 1);
  await saveListByAsync(DATA_BROWSER_VIEW_KEY(id), list);
}

export function clearDataBrowserViews(id: string | number) {
  return removeOneByAsync(DATA_BROWSER_VIEW_KEY(`${id}`));
}
