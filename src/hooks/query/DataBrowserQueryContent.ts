import type {Ref} from "vue";
import {getDataBrowserQuery, saveDataBrowserQueryContent} from "@/service/DataBrowser/DataBrwoserQueryService";
import MessageUtil from "@/utils/model/MessageUtil";
import {DataBrowserQueryBodyMode} from "@/entity/DataBrowser/DataBrowserQuery";

export interface UseDataBrowserQueryContent {
  content: Ref<string>;
  records: Ref<Array<string>>;
  mode: Ref<DataBrowserQueryBodyMode>;
  loading: Ref<boolean>;
}

export const useDataBrowserQueryContent = (id: number): UseDataBrowserQueryContent => {
  const content = ref('');
  const records = ref(new Array<string>());
  const mode = ref<DataBrowserQueryBodyMode>("SQL");

  const loading = ref(false);

  getDataBrowserQuery(id).then((r) => {
    const {record} = r;
    content.value = record.content;
    records.value = record.records;
    mode.value = record.mode;
  });

  watchDebounced([content, records, mode], () => {
    loading.value = true;
    saveDataBrowserQueryContent(id, {
      content: content.value,
      records: records.value,
      mode: mode.value
    }).catch(e => MessageUtil.error(`查询「${id}」保存失败`, e))
      .finally(() => loading.value = false);
  });

  return {
    content,
    records,
    mode,
    loading
  }
}