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
      <span class="max-w-[200px] truncate mr-8px" :title="item.label ?? item.value">{{
          item.label ?? item.value
        }}</span>
      <t-button
        theme="primary"
        variant="text"
        shape="circle"
        size="small"
        aria-label="关闭标签"
        @click.stop="onRemove(item)"
      >
        <CloseIcon size="14px"/>
      </t-button>
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

  .tab-chrome-pane {
    //group relative flex items-center px-4 h-32px
    color: var(--td-text-color-primary) /* var(--td-text-color-primary) */;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--td-bg-color-container) /* var(--td-bg-color-container) */;
    border-top-left-radius: var(--td-radius-medium);
    border-top-right-radius: var(--td-radius-medium);
    align-items: center;
    display: flex;
    height: 32px;
    position: relative;
    cursor: pointer;

    &.active {
      background-color: var(--td-bg-color-container-active);
    }
  }
}
</style>
