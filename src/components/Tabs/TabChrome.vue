<template>
  <div
    class="tab-chrome flex items-end h-[44px] bg-[var(--td-bg-color-secondarycontainer)] overflow-x-auto"
    role="tablist"
  >
    <div
      v-for="item in tabs"
      :key="item.value"
      role="tab"
      :aria-selected="item.value === current"
      tabindex="0"
      :class="item.value === current
        ? 'group relative flex items-center px-4 h-[44px] bg-[var(--td-bg-color-container)] text-[var(--td-text-color-primary)] rounded-t-[var(--td-radius-extraLarge)]'
        : 'group relative flex items-center px-4 h-[44px] text-[var(--td-text-color-secondary)] cursor-pointer hover:bg-[var(--td-bg-color-component-hover)]'"
      @click="select(item.value)"
      @keydown.enter.prevent="select(item.value)"
    >
      <span class="max-w-[200px] truncate mr-8px" :title="item.label ?? item.value">{{ item.label ?? item.value }}</span>
      <t-button
        theme="primary"
        variant="text"
        shape="circle"
        size="small"
        aria-label="关闭标签"
        @click.stop="onRemove(item)"
      >
        <CloseIcon size="14px" class="text-[var(--td-text-color-secondary)] hover:text-[var(--td-text-color-primary)]" />
      </t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { CloseIcon } from "tdesign-icons-vue-next";
import {SelectOption} from "$/shared/common";
const props = defineProps<{ modelValue: string; tabs: SelectOption[] }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'remove', tab: SelectOption): void }>();
const current = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v)
});
const select = (v: string) => current.value = v;
const onRemove = (tab: SelectOption) => emit('remove', tab);
</script>
<style scoped lang="less">

</style>
