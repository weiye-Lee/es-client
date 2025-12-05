<template>
  <SplitPanel class="data-browse" v-model="size">

    <template #left>
      <DataBrowserLeft/>
    </template>
    <template #right>
      <DataBrowserRight />
    </template>

  </SplitPanel>
</template>
<script lang="ts" setup>
import DataBrowserLeft from "@/page/data-browse/layouts/DataBrowserLeft.vue";
import DataBrowserRight from "@/page/data-browse/layouts/DataBrowserRight.vue";

const size = useLocalStorage("/page/data-browser/size", 400);
</script>
<style lang="less">
@import url(./index.less);
</style>
