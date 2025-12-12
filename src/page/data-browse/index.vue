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
import LocalNameEnum from "@/enumeration/LocalNameEnum";
import DataBrowserLeft from "@/page/data-browse/layouts/DataBrowserLeft.vue";
import DataBrowserRight from "@/page/data-browse/layouts/DataBrowserRight.vue";

const size = useLocalStorage(LocalNameEnum.PAGE_DATA_BROWSER_SIZE, 400);
</script>
<style lang="less">
.data-browse {
  background-color: var(--td-bg-color-page);
}
.db-card {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-1);
}
</style>
