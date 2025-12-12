import {defineStore} from "pinia";
import {SelectOption} from "$/shared/common";
import {
  UseDataBrowserInstance,
  useDataBrowserInstance,
  UseDataBrowserQueryContent,
  useDataBrowserQueryContent
} from "@/hooks";
import {useUrlStore} from "@/store";

export type BaseBrowserBaseType = "index" | "alias" | "view";
export type DataBrowserType = "folder" | BaseBrowserBaseType | "query";

export interface DataBrowseTab extends SelectOption {
  type: DataBrowserType;
}

type DataBrowserTab = UseDataBrowserInstance | UseDataBrowserQueryContent;

export function decodeValue(value: string): { type: DataBrowserType, id: string } {
  const split = value.indexOf("-");
  const type = value.substring(0, split) as DataBrowserType;
  const id = value.substring(split + 1);
  return {type, id};
}

export function encodeValue(type: DataBrowserType, id: string | number): string {
  return `${type}-${id}`;
}

export const useDataBrowseStore = defineStore("data-browser", () => {
  // 标签页
  const tabs = ref<Array<DataBrowseTab>>([]) as Ref<Array<DataBrowseTab>>;
  const tabId = ref('');
  const tabMap = shallowRef(new Map<string, DataBrowserTab>());

  watch(() => useUrlStore().id, () => {
    // 每次变化时清空
    tabs.value = [];
    tabMap.value.clear();
  })


  const openTab = (value: string, label: string) => {
    const {type, id: val} = decodeValue(value);

    if (tabs.value.some(e => e.value === value)) {
      tabId.value = value;
      return;
    }

    if (type === 'folder') return;
    const tab: DataBrowseTab = {
      label: label,
      value: value,
      type: type as DataBrowserType,
    };
    tabId.value = value;
    if (type === 'query') {
      const instance = useDataBrowserQueryContent(val);
      tabMap.value.set(value, instance);
    } else {
      const instance = useDataBrowserInstance(val, type);
      tabMap.value.set(value, instance);
      instance.run(true);
    }

    tabs.value.push(tab);
  }

  const closeTab = (value: string) => {
    const index = tabs.value.findIndex(e => e.value === value);
    if (index === -1) return;
    tabs.value.splice(index, 1);
    if (tabs.value.length === 0) {
      tabId.value = '';
    } else {
      tabId.value = tabs.value[tabs.value.length - 1].value;
    }
    tabMap.value.delete(value);
  }

  return {tabId, tabs, tabMap, openTab, closeTab};


})