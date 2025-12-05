import {defineStore} from "pinia";
import {SelectOption} from "$/shared/common";
import {UseDataBrowserInstance, useDataBrowserInstance} from "@/hooks";


export type DataBrowserType = "folder" | "index" | "alias" | "view" | "query";

export interface DataBrowseTab extends SelectOption {
  type: DataBrowserType;
}

export const useDataBrowseStore = defineStore("data-browser", () => {
  // 标签页
  const tabs = ref<Array<DataBrowseTab>>([]) as Ref<Array<DataBrowseTab>>;
  const tabId = ref('');
  const tabMap = shallowRef(new Map<string, UseDataBrowserInstance>());


  const openTab = (value: string, label: string) => {
    const split = value.indexOf("-");
    const type = value.substring(0, split) as DataBrowserType;
    const val = value.substring(split + 1);
    if (type === 'folder') return;
    const tab: DataBrowseTab = {
      label: label,
      value: value,
      type: type,
    };
    tabId.value = value;
    if (type === 'query') {
    }else {
      const instance = useDataBrowserInstance(val);
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