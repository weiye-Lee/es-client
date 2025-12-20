<template>
  <div class="field-condition-item flex gap-8px items-center">
    <!-- 是否启用 -->
    <t-switch v-model="condition.isEnable">
      <template #label="slotProps">{{ slotProps.value ? "启用" : "禁用" }}</template>
    </t-switch>
    <!-- 选择查询模式 -->
    <t-select v-model="condition.type" placeholder="请选择查询条件" style="width: 120px">
      <t-option label="must" value="must" />
      <t-option label="should" value="should" :disabled="condition.condition === 'missing'" />
      <t-option label="must not" value="must_not" />
    </t-select>
    <!-- 选择查询字段 -->
    <t-select
      v-model="condition.field"
      filterable
      clearable
      creatable
      placeholder="请选择查询字段"
      style="width: 250px"
      :options="fieldOptions"
    />
    <!-- 选择查询条件 -->
    <t-select
      v-model="condition.condition"
      filterable
      clearable
      placeholder="请选择查询条件"
      style="width: 110px"
    >
      <!-- 分词查询 -->
      <t-option label="match" value="match" />
      <!-- 精准查询 -->
      <t-option label="term" value="term" />
      <!-- 可以搜索多个值 -->
      <t-option label="terms" value="terms" />
      <!-- 是否存在 -->
      <t-option label="exists" value="exists" />
      <!-- 是否不存在 -->
      <t-option label="missing" value="missing" />
      <!-- 通配符查询 -->
      <t-option label="wildcard" value="wildcard" />
      <t-option label="range lt" value="range_lt" />
      <t-option label="range lte" value="range_lte" />
      <t-option label="range gt" value="range_gt" />
      <t-option label="range gte" value="range_gte" />
    </t-select>
    <!-- 值 -->
    <div v-if="condition.condition === 'terms'" class="condition-terms" @click="textArea">
      {{ condition.value }}
    </div>
    <t-input
      v-else-if="condition.condition !== 'exists' && condition.condition !== 'missing'"
      v-model="condition.value"
      style="width: 180px"
      allow-clear
    />
    <!-- 操作 -->
    <t-button theme="primary" shape="square" @click="add()">
      <template #icon>
        <add-icon />
      </template>
    </t-button>
    <t-button theme="danger" shape="square" @click="remove(condition.id)">
      <template #icon>
        <minus-icon />
      </template>
    </t-button>
    <t-button theme="success" shape="square" @click="tab.run()">
      <template #icon>
        <search-icon />
      </template>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import { AddIcon, MinusIcon, SearchIcon } from "tdesign-icons-vue-next";
import { useIndexStore } from "@/store";
import { BaseSearchInstanceResult } from "@/hooks";
import { BaseQueryItem, getDefaultBaseQueryItem } from "$/elasticsearch-client";

const props = defineProps({
  modelValue: Object as PropType<BaseQueryItem>,
  index: Number,
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});
const emits = defineEmits(["add", "remove", "editTextArea", "update:modelValue"]);

const condition = ref<BaseQueryItem>(getDefaultBaseQueryItem());

condition.value = Object.assign(condition.value, props.modelValue);

watch(
  () => condition.value,
  (value) => emits("update:modelValue", value),
  { deep: true }
);
watch(
  () => props.modelValue,
  (value) => (condition.value = Object.assign(condition.value, value))
);
watch(
  () => condition.value.condition,
  (value) => {
    if (value === "missing") {
      condition.value.type = "must";
    }
  }
);

const fieldOptions = computed(() => {
  const { fieldOptionMap } = useIndexStore();
  return fieldOptionMap[props.tab.index.value] || [];
});

const add = () => emits("add");
const remove = (id: number) => emits("remove", id);
const textArea = () => emits("editTextArea", props.index);
</script>
<style scoped lang="less">
.field-condition-item {
  .condition-terms {
    width: 180px;
    height: 32px;
    line-height: 32px;
    margin-left: 10px;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 0 8px;
    color: var(--td-text-color-primary);
    background-color: var(--td-bg-color-container);
    border: 1px solid var(--td-border-level-2-color);
    border-radius: var(--td-radius-medium);
  }
}
</style>
