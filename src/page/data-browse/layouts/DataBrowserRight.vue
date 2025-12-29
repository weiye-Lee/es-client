<template>
  <div class="data-browser-right material-card abs-8">
    <div class="abs-0">
      <!-- 顶部栏：索引选择 + Tab -->
      <div class="db-top-bar" :class="{'theme-dark': isDark}">
        <!-- 索引选择自动完成 -->
        <DbIndexAutocomplete placeholder="请输入索引..." />
        <!-- Tab 栏 -->
        <TabChrome v-model="tabId" :tabs="tabs" @remove="removeTab" class="db-tabs"/>
      </div>

      <div class="dbr-container">
        <div v-for="tab in tabs" :key="tab.value" v-show="tabId === tab.value">
          <DataBrowserQueryTab v-if="tab.type === 'query'" :tab="tabMap.get(tab.value)! as UseDataBrowserQueryContent"/>
          <DataBrowserIndexTab v-else :tab="tabMap.get(tab.value)! as UseDataBrowserInstance"/>
        </div>
      </div>

      <empty-result v-if="tabs.length === 0" :title="$t('module.data_browse.please_select_index')"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {DataBrowseTab, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import DataBrowserIndexTab from "@/page/data-browse/tab/DataBrowserIndexTab.vue";
import EmptyResult from "@/components/Result/EmptyResult.vue";
import {useGlobalStore} from "@/store/GlobalStore";
import DataBrowserQueryTab from "../tab/DataBrowserQueryTab.vue";
import {UseDataBrowserInstance, UseDataBrowserQueryContent} from "@/hooks";
import DbIndexAutocomplete from "@/page/data-browse/component/DbIndexAutocomplete.vue";

const {tabMap} = useDataBrowseStore();
const {tabId} = storeToRefs(useDataBrowseStore());
const tabs = computed<Array<DataBrowseTab>>(() => useDataBrowseStore().tabs);
const isDark = computed(() => useGlobalStore().isDark);

const removeTab = ({value}: any) => {
  useDataBrowseStore().closeTab(`${value}`);
}
</script>
<style scoped lang="less">
.db-top-bar {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  gap: 8px;
  background-color: var(--td-bg-color-component);
  border-radius: var(--td-radius-medium);
  
  .db-tabs {
    flex: 1;
    min-width: 0;
  }
}

.dbr-container {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
