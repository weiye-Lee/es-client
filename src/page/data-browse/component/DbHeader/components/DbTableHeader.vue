<template>
  <t-popup trigger="click" placement="top-right" show-arrow>
    <db-simple-item :disable="index === ''" :tip="$t('module.data_browse.custom_header')">
      <check-rectangle-icon />
    </db-simple-item>
    <template #content>
      <div class="table-view-trigger">
        <div class="search-section">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索字段"
            size="small"
            clearable
          />
        </div>
        <div class="select-all-section">
          <t-checkbox v-model="allSelected" @change="handleAllChange">全选</t-checkbox>
        </div>
        <div class="fields-list">
          <div
            v-for="column in filteredColumns"
            :key="column.field"
            class="field-item"
          >
            <t-checkbox v-model="column.show">{{ column.title }}</t-checkbox>
            <span class="field-type" :style="getTypeStyle(getFieldType(column.field))">{{ getFieldType(column.field) }}</span>
          </div>
        </div>
      </div>
    </template>
  </t-popup>
</template>
<script lang="ts" setup>
import DbSimpleItem from "@/page/data-browse/component/DbHeader/components/DbSimpleItem.vue";
import { UseDataBrowserInstance } from "@/hooks";
import { CheckRectangleIcon } from "tdesign-icons-vue-next";
import { computed, ref, watch } from "vue";
import { useIndexStore } from "@/store";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  },
  index: {
    type: String,
    default: ''
  }
});

const { columns } = props.tab as UseDataBrowserInstance;
const indexRef = ref(props.index);

watch(() => props.index, (newIndex) => {
  indexRef.value = newIndex;
});
const indexStore = useIndexStore();

const searchKeyword = ref('');

const allSelected = ref(false);

watch(() => columns.value, () => {
  allSelected.value = columns.value.every(col => col.show);
}, { immediate: true });

const handleAllChange = (checked: boolean) => {
  columns.value.forEach(col => {
    col.show = checked;
  });
  allSelected.value = checked;
};

const filteredColumns = computed(() => {
  if (!searchKeyword.value) return columns.value;
  return columns.value.filter(col =>
    col.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    col.field.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const getFieldType = (field: string) => {
  if (field === '_id') {
    return 'text';
  }
  if (!indexRef.value) {
    return 'unknown';
  }
  const fields = indexStore.field(indexRef.value);
  const fieldInfo = fields.find(f => f.dataIndex === field || f.name === field);
  return fieldInfo?.type || 'unknown';
};

const getTypeStyle = (type: string) => {
  let bgColor = 'var(--color-fill-3)';
  let textColor = 'var(--color-text-3)';
  
  switch (type) {
    case 'keyword':
      bgColor = 'var(--td-brand-color-1)';
      textColor = 'var(--td-brand-color)';
      break;
    case 'text':
      bgColor = 'var(--td-success-color-1)';
      textColor = 'var(--td-success-color)';
      break;
    case 'long':
    case 'integer':
    case 'short':
    case 'byte':
    case 'double':
    case 'float':
    case 'half_float':
    case 'scaled_float':
      bgColor = 'var(--td-warning-color-1)';
      textColor = 'var(--td-warning-color)';
      break;
    case 'date':
    case 'date_nanos':
      bgColor = '#fff3e0';
      textColor = '#e65100';
      break;
    case 'boolean':
      bgColor = 'var(--td-error-color-1)';
      textColor = 'var(--td-error-color)';
      break;
    case 'object':
    case 'nested':
      bgColor = 'var(--td-text-color-1)';
      textColor = 'var(--td-text-color-primary)';
      break;
    case 'ip':
    case 'geo_point':
    case 'geo_shape':
      bgColor = 'var(--td-chart-color-1)';
      textColor = 'var(--td-chart-color)';
      break;
    case 'binary':
      bgColor = 'var(--td-gray-color-1)';
      textColor = 'var(--td-gray-color)';
      break;
    default:
      bgColor = 'var(--color-fill-3)';
      textColor = 'var(--color-text-3)';
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor
  };
};
</script>
<style scoped lang="less">
:deep(.t-popup__content) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.table-view-trigger {
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: 280px;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-2);
}

.select-all-section {
  margin-bottom: 8px;
}

.fields-list {
  flex: 1;
  overflow-y: auto;
  max-height: 320px;
}

.field-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  
  .field-type {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
  }
}
</style>
