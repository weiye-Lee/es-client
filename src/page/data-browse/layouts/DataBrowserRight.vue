<template>
  <div class="abs-4 db-card">
    <div class="data-browser-right abs-4">
      <div class="abs-0">
        <!--    顶部tab-->

        <TabChrome v-model="tabId" :tabs="tabs" @remove="removeTab" :class="{'theme-dark': isDark}"/>

        <div class="dbr-container" >
          <div v-for="tab in tabs" :key="tab.value" v-show="tabId === tab.value">
            <DataBrowserQueryTab v-if="tab.type === 'query'" :tab="tabMap.get(tab.value)! as UseDataBrowserQueryContent" />
            <DataBrowserIndexTab v-else :tab="tabMap.get(tab.value)! as UseDataBrowserInstance" />
          </div>
        </div>

        <empty-result v-if="tabs.length === 0" title="请双击选择索引"/>
      </div>
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

const {tabMap} = useDataBrowseStore();
const {tabId} = storeToRefs(useDataBrowseStore());
const tabs = computed<Array<DataBrowseTab>>(() => useDataBrowseStore().tabs);
const isDark = computed(() => useGlobalStore().isDark);

const removeTab = ({ value }: any) => {
  useDataBrowseStore().closeTab(`${value}`);
}
</script>
<style scoped lang="less">
.dbr-container {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
