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
import {useSnowflake} from "$/util";

export async function listDataBrowserQuery(urlId: string) {
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  return list;
}

export async function getDataBrowserQuery(id: string) {
  return await getFromOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(id), {
    id,
    url_id: '',
    content: '',
    records: [],
    mode: 'SQL'
  });
}

export async function addDataBrowserQuery(urlId: string, res: Pick<DataBrowserQueryItem, "name">) {
  const {list} = await listByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId));
  const view = {
    id: useSnowflake().nextId(),
    url_id: urlId,
    created_at: Date.now(),
    updated_at: Date.now(),
    name: res.name
  };
  list.push(view);
  await saveListByAsync<DataBrowserQueryItem>(DATA_BROWSER_QUERY_KEY(urlId), list);
  // 保存本地存储项
  await saveOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(view.id), {
    id: view.id,
    url_id: '',
    content: '',
    records: [],
    mode: 'SQL'
  });
}

export async function renameDataBrowserQuery(urlId: string, viewId: string, newName: string) {
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

export async function saveDataBrowserQueryContent(viewId: string, body: Pick<DataBrowserQueryBody, "content" | "mode" | "records">) {
  await saveOneByAsync<DataBrowserQueryBody>(DATA_BROWSER_QUERY_ITEM_KEY(viewId), {
    id: viewId,
    url_id: '',
    ...body
  });
}

export async function deleteDataBrowserQuery(urlId: string, viewId: string) {
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

export async function clearDataBrowserQuery(urlId: string | number) {
  const query = await listDataBrowserQuery(`${urlId}`);
  for (let item of query) {
    await removeOneByAsync(DATA_BROWSER_QUERY_ITEM_KEY(item.id));
  }
  await removeOneByAsync(DATA_BROWSER_QUERY_KEY(`${urlId}`));
}
