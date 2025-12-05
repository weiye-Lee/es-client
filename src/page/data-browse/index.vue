<template>
  <SplitPanel class="data-browse" v-model="size">
    <!-- 顶部按钮 -->
    <!--    <db-header/>-->
    <!-- 输入条件 -->
    <!--    <db-condition/>-->
    <!-- 数据表格 -->
    <!--    <db-container/>-->
    <template #left>
      <DataBrowserLeft/>
    </template>
    <template #right>
      右侧表格
    </template>

  </SplitPanel>
</template>
<script lang="ts" setup>
import DataBrowserLeft from "@/page/data-browse/layouts/DataBrowserLeft.vue";

const size = useLocalStorage("/page/data-browser/size", 400);
</script>
<style lang="less">
@import url(./index.less);
</style>
