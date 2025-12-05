import { Url } from "$/entity";

export const getVersionFirst = (url: Url) => {
  const [r1] = (url.version || "").split(".");
  if (r1) return Number(r1);
  else return 0;
};

/**
 * 构建搜索URL
 * @param url
 * @param index
 * @param type
 */
export function buildSearchUrl(url: Url, index: string, type: string) {
  return getVersionFirst(url) >= 8 ? `/${index}/_search` : `/${index}/${type || "_doc"}/_search`;
}

export function buildDeleteByQueryUrl(url: Url, index: string, type: string) {
  return getVersionFirst(url) >= 8
    ? `/${index}/_delete_by_query`
    : `/${index}/${type || "_doc"}/_delete_by_query`;
}

export function buildUpdateByQueryUrl(url: Url, index: string, type: string) {
  return getVersionFirst(url) >= 8
    ? `/${index}/_update_by_query`
    : `/${index}/${type || "_doc"}/_update_by_query`;
}
