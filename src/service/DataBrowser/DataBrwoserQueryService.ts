import {
  DATA_BROWSER_QUERY_ITEM_KEY,
  DATA_BROWSER_QUERY_KEY,
  DataBrowserQueryBody,
  DataBrowserQueryItem
} from "@/entity/DataBrowser/DataBrowserQuery";
import {
  getFromOneByAsync,
  listByAsync,
  removeOneByAsync,
  saveListByAsync,
  saveOneByAsync
} from "@/utils/utools/DbStorageUtil";

export async function listDataBrowserQuery(urlId: number) {
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  return list;
}

export async function getDataBrowserQuery(id: number) {
  return await getFromOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(id), {
    content: '',
    records: [],
    mode: 'SQL'
  });
}

export async function addDataBrowserQuery(urlId: number, view: DataBrowserQueryItem) {
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  list.push(view);
  await saveListByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId), list);
  // 保存本地存储项
  await saveOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(view.id), {
    content: '',
    records: [],
    mode: 'SQL'
  });
}

export async function renameDataBrowserQuery(urlId: number, viewId: number, newName: string) {
  // 先查询到记录
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  const index = list.findIndex(e => e.id === viewId);
  if (index === -1) {
    return;
  }
  // 更新记录
  list[index].name = newName;
  await saveListByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId), list);
}

export async function saveDataBrowserQueryContent(viewId: number, body: DataBrowserQueryBody) {
  await saveOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(viewId), body);
}

export async function deleteDataBrowserQuery(urlId: number, viewId: number) {
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  const index = list.findIndex(e => e.id === viewId);
  if (index === -1) {
    return;
  }
  // 删除列表项
  list.splice(index, 1);
  await saveListByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId), list);
  // 删除本地存储项
  await removeOneByAsync(DATA_BROWSER_QUERY_ITEM_KEY(viewId));
}
