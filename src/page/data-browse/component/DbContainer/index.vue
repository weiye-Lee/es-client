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
      :menu-config="menuConfig(tab)"
      :virtual-y-config="virtualYConfig"
      @menu-click="contextMenuClickEvent"
    >
      <vxe-column field="_id" title="_id" fixed="left" :width="200" show-overflow="tooltip" />
      <vxe-column type="expand" width="80" :title="$t('module.table_viewer.detail')" fixed="left">
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
import { buildContextMenuClickEvent } from "@/page/data-browse/component/DbContainer/args";
import { columnConfig, menuConfig, rowConfig } from "@/page/data-browse/component/DbContainer/args";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

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
    return t('module.data_browse.please_select_link');
  }
  return t('module.table_viewer.empty');
});

// 菜单点击事件
const contextMenuClickEvent = buildContextMenuClickEvent(tableRef, props.tab);

const virtualYConfig: VxeTablePropTypes.VirtualYConfig = {
  enabled: true,
  gt: 30
}
</script>
<style scoped></style>
