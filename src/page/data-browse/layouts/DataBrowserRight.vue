<template>
  <div class="abs-8">
    <!--    顶部tab-->
    <t-tabs v-model="tabId" @remove="removeTab">
      <t-tab-panel v-for="tab in tabs" :value="tab.value" :label="tab.label" removable>
        <EmptyResult v-if="!tab.instance" title="系统异常，实例不存在"/>
        <div v-else-if="tab.type === 'query'">query</div>
        <DataBrowserIndexTab v-else :tab="tab.instance"></DataBrowserIndexTab>
      </t-tab-panel>
    </t-tabs>
    <empty-result v-if="tabs.length === 0" title="请双击选择索引"/>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import { TabsProps } from 'tdesign-vue-next';
import {DataBrowseTab, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import DataBrowserIndexTab from "@/page/data-browse/tab/DataBrowserIndexTab.vue";
import EmptyResult from "@/components/Result/EmptyResult.vue";

const {tabId} = storeToRefs(useDataBrowseStore());
const tabs = computed<Array<DataBrowseTab>>(() => useDataBrowseStore().tabs);

const removeTab: TabsProps['onRemove'] = ({ value }) => {
  useDataBrowseStore().closeTab(`${value}`);
}
</script>
<style scoped lang="less">

</style>
