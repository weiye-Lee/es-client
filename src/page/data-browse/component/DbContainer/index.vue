<template>
  <div class="content-table">
    <vxe-table
      ref="tableRef"
      :data="records"
      :height="height"
      :column-config="columnConfig"
      :row-config="rowConfig"
      :empty-text="emptyText"
      :loading="loading"
      :menu-config="menuConfig"
      :virtual-y-config="virtualYConfig"
      @menu-click="contextMenuClickEvent"
    >
      <vxe-column field="_id" title="_id" fixed="left" :width="200" show-overflow="tooltip" />
      <vxe-column type="expand" width="80" title="详细">
        <template #content="{ row }">
          <div class="expand-wrapper h-300px">
            <MonacoView :value="row['_source']" />
          </div>
        </template>
      </vxe-column>
      <vxe-column
        v-for="column in columns"
        :key="column.title"
        :field="column.field"
        :title="column.title"
        :visible="column.show"
        :width="column.field === '_id' ? 200 : column.width"
        show-overflow="tooltip"
      />
    </vxe-table>
  </div>
</template>
<script lang="ts" setup>
import { VxeTableInstance, VxeTablePropTypes } from "vxe-table";
import { useUrlStore } from "@/store";
import { UseDataBrowserInstance } from "@/hooks";
import MonacoView from "@/components/view/MonacoView/index.vue";
import { buildContextMenuClickEvent } from "@/page/data-browse/component/DbContainer/func";
import { columnConfig, menuConfig, rowConfig } from "@/page/data-browse/component/DbContainer/args";

const size = useWindowSize();

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { loading, records, columns } = props.tab as UseDataBrowserInstance;

const tableRef = ref<VxeTableInstance | null>(null);

const height = computed(() => size.height.value - 159);
const emptyText = computed(() => {
  if (!useUrlStore().url) {
    return "请先选择链接";
  }
  return "什么也没有";
});

// 菜单点击事件
const contextMenuClickEvent = buildContextMenuClickEvent(tableRef, props.tab);

const virtualYConfig: VxeTablePropTypes.VirtualYConfig = {
  enabled: true,
  gt: 30
}
</script>
<style scoped></style>
