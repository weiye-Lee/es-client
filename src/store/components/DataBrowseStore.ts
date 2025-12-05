import {defineStore} from "pinia";
import {SelectOption} from "$/shared/common";
import {UseDataBrowserInstance, useDataBrowserInstance} from "@/hooks";


export type DataBrowserType = "folder" | "index" | "alias" | "view" | "query";

export interface DataBrowseTab extends SelectOption {
  type: DataBrowserType;
  instance?: UseDataBrowserInstance;
}

export const useDataBrowseStore = defineStore("data-browser", () => {
  // 标签页
  const tabs = ref<Array<DataBrowseTab>>([]) as Ref<Array<DataBrowseTab>>;
  const tabId = ref('');


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
      tab.instance = useDataBrowserInstance(val);
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
  }

  return {tabId, tabs, openTab, closeTab};


})