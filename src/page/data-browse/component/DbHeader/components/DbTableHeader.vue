<template>
  <t-popup trigger="click" placement="top-right" show-arrow>
    <db-simple-item :disable="index === ''" tip="自定义表头">
      <check-rectangle-icon />
    </db-simple-item>
    <template #content>
      <div class="table-view-trigger">
        <t-list split style="width: 250px">
          <template #header>
            <t-button block theme="danger" size="small"> 重置 </t-button>
          </template>
          <div style="height: 341px; overflow: auto; width: 250px">
            <div
              v-for="column in columns"
              :key="column.field"
              style="width: 220px; margin: 5px 5px"
            >
              <t-checkbox v-model="column.show">{{ column.title }}</t-checkbox>
            </div>
          </div>
        </t-list>
      </div>
    </template>
  </t-popup>
</template>
<script lang="ts" setup>
import DbSimpleItem from "@/page/data-browse/component/DbHeader/components/DbSimpleItem.vue";
import { UseDataBrowserInstance } from "@/hooks";
import { CheckRectangleIcon } from "tdesign-icons-vue-next";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { columns, index } = props.tab as UseDataBrowserInstance;
</script>
<style scoped lang="less"></style>
