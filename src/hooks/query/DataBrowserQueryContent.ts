import type {Ref} from "vue";
import {getDataBrowserQuery, saveDataBrowserQueryContent} from "@/service/DataBrowser/DataBrwoserQueryService";
import MessageUtil from "@/utils/model/MessageUtil";
import {DataBrowserQueryBodyMode} from "@/entity/DataBrowser/DataBrowserQuery";
import {cloneDeep} from "es-toolkit";
import {useDataBrowserQueryInstance, UseDataBrowserQueryInstance} from "@/hooks/query/DataBrowserQueryInstance";

export interface UseDataBrowserQueryContent {
  size: Ref<number>;
  content: Ref<string>;
  records: Ref<Array<string>>;
  mode: Ref<DataBrowserQueryBodyMode>;
  loading: Ref<boolean>;
  instances: ShallowRef<Array<UseDataBrowserQueryInstance>>

  execute(sql: string): void;
}

export const useDataBrowserQueryContent = (id: number): UseDataBrowserQueryContent => {

  const size = ref(0);

  const content = ref('');
  const records = ref(new Array<string>());
  const mode = ref<DataBrowserQueryBodyMode>("SQL");

  const instances = shallowRef(new Array<UseDataBrowserQueryInstance>());

  const loading = ref(false);

  getDataBrowserQuery(id).then((r) => {
    const {record} = r;
    content.value = record.content;
    records.value = record.records;
    mode.value = record.mode;
  });

  watchDebounced([content, records, mode], () => {
    loading.value = true;
    saveDataBrowserQueryContent(id, cloneDeep({
      content: content.value,
      records: records.value,
      mode: mode.value
    })).catch(e => MessageUtil.error(`查询「${id}」保存失败`, e))
      .finally(() => loading.value = false);
  });

  const execute = (sql: string) => {
    // TODO：此处要拆分sql
    instances.value = [useDataBrowserQueryInstance(sql, Date.now() + '')];
    if (size.value < 100) {
      size.value = 400;
    }
  }

  return {
    size,

    content,
    records,
    mode,
    loading,
    instances,

    execute
  }
}