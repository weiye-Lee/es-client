import type {Ref} from "vue";
import {getDataBrowserQuery, saveDataBrowserQueryContent} from "@/api/DataBrowser/DataBrwoserQueryService";
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

export const useDataBrowserQueryContent = (id: string): UseDataBrowserQueryContent => {

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

  function splitSQLStatements(input: string): string[] {
    const res: string[] = [];
    let buf = '';
    let i = 0;
    let inSingle = false;
    let inBacktick = false;
    let inLineComment = false;
    while (i < input.length) {
      const ch = input[i];
      const prev = i > 0 ? input[i - 1] : '';
      const next = i + 1 < input.length ? input[i + 1] : '';
      if (inLineComment) {
        if (ch === '\n') {
          inLineComment = false;
          buf += ch;
        }
        i++;
        continue;
      }
      if (!inSingle && !inBacktick && ch === '/' && next === '/') {
        inLineComment = true;
        i += 2;
        continue;
      }
      if (!inBacktick && ch === "'" && prev !== '\\') {
        inSingle = !inSingle;
        buf += ch;
        i++;
        continue;
      }
      if (!inSingle && ch === '`') {
        if (prev !== '\\') {
          inBacktick = !inBacktick;
        }
        buf += ch;
        i++;
        continue;
      }
      if (!inSingle && !inBacktick && ch === ';') {
        const s = buf.trim();
        if (s.length) res.push(s);
        buf = '';
        i++;
        continue;
      }
      buf += ch;
      i++;
    }
    const s = buf.trim();
    if (s.length) res.push(s);
    return res;
  }

  const execute = (sql: string) => {
    const statements = splitSQLStatements(sql);
    const ts = Date.now();
    instances.value = statements.map((s, idx) => useDataBrowserQueryInstance(s, `${ts}_${idx}`));
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
