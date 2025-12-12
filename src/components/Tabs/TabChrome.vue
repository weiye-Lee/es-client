<template>
  <div class="tab-chrome" role="tablist">
    <div
      v-for="item in tabs"
      :key="item.value"
      role="tab"
      :aria-selected="item.value === current"
      tabindex="0"
      class="tab-chrome-pane"
      :class="{'tab-chrome-pane': true, 'active': item.value === current}"
      @click="select(item.value)"
      @keydown.enter.prevent="select(item.value)"
    >
      <div class="tab-title" :title="item.label ?? item.value">{{ item.label ?? item.value }}</div>
      <div class="close-icon pl-2px" @click.stop="onRemove(item)">
        <CloseIcon aria-label="关闭标签" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {CloseIcon} from "tdesign-icons-vue-next";
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
.tab-chrome {
  display: flex;
  align-items: flex-end;
  height: 32px;
  line-height: 32px;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--td-bg-color-component);
  border-radius: var(--td-radius-medium);

  .tab-chrome-pane {
    //group relative flex items-center px-4 h-32px
    color: var(--td-text-color-primary) /* var(--td-text-color-primary) */;
    padding-left: 8px;
    padding-right: 4px;
    background-color: var(--td-bg-color-container) /* var(--td-bg-color-container) */;
    border-radius: var(--td-radius-medium);
    align-items: center;
    display: flex;
    height: 20px;
    position: relative;
    cursor: pointer;
    margin: 4px;
    border: 2px solid var(--td-border-level-1-color);
    transition: all 0.2s ease-in-out;
    line-height: 16px;
    gap: 4px;

    .tab-title {
      height: 16px;
    }

    .close-icon {
      width: 16px;
      height: 16px;
      border-radius: 8px;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: var(--td-bg-color-container);
      }
    }

    &.active {
      background-color: var(--td-brand-color-2);
      border: 2px solid var(--td-brand-color);
      color: var(--td-brand-color);
      &:hover {
        background-color: var(--td-brand-color-2);
      }
    }

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }
  }
}
</style>
