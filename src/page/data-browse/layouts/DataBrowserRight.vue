<template>
  <div class="abs-8">
    <!--    顶部tab-->
    <t-tabs v-model="tabId">
      <t-tab-panel v-for="tab in tabs" :key="tab.value" :name="tab.value">
        <EmptyResult v-if="!tab.instance" title="系统异常，实例不存在"/>
        <div v-else-if="tab.type === 'query'">query</div>
        <DataBrowserIndexTab v-else :instance="tab.instance"></DataBrowserIndexTab>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {DataBrowseTab, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import DataBrowserIndexTab from "@/page/data-browse/tab/DataBrowserIndexTab.vue";
import EmptyResult from "@/components/Result/EmptyResult.vue";

const {tabId} = storeToRefs(useDataBrowseStore());
const tabs = computed<Array<DataBrowseTab>>(() => useDataBrowseStore().tabs);
</script>
<style scoped lang="less">

</style>
