<template>
  <vxe-table
    ref="tableRef"
    :data="records"
    :height="height"
    stripe
    :column-config="columnConfig"
    :row-config="rowConfig"
    empty-text="什么也没有"
  >
    <vxe-column type="expand" width="80" title="详细" fixed="left">
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
      :width="column.field === '_id' ? 180 : column.width"
      show-overflow="tooltip"
    />
  </vxe-table>
</template>
<script lang="ts" setup>
import {columnConfig, rowConfig} from "@/page/data-browse/component/DbContainer/args";
import {DataSearchColumnConfig} from "$/elasticsearch-client";
import MonacoView from "@/components/view/MonacoView/index.vue";

defineProps({
  columns: {
    type: Object as PropType<Array<DataSearchColumnConfig>>,
    default: () => ([])
  },
  records: {
    type: Object as PropType<Array<Record<string, any>>>,
    default: () => ([])
  },
  height: {type: Number, default: 500}
});

</script>
<script lang="ts">
export default {
  name: "TableViewer"
};
</script>
<style scoped lang="less"></style>
