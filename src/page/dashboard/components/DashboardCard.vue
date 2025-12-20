<template>
  <t-card class="dashboard-card">
    <template #title>
      <t-space class="items-center">
        <span>{{ props.title }}</span>
        <t-button variant="text" theme="primary" shape="square" @click="emits('render')">
          <template #icon>
            <refresh-icon />
          </template>
        </t-button>
      </t-space>
    </template>
    <template #actions>
      <refresh-icon v-if="props.loading" spin />
      <span v-if="props.loading" style="margin-left: 7px">{{ $t('common.loading') }}</span>
    </template>
    <slot name="default" />
  </t-card>
</template>
<script lang="ts" setup>
import { RefreshIcon } from "tdesign-icons-vue-next";

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: ""
  },
  loading: Boolean
});
const emits = defineEmits(["render"]);
</script>
<style scoped lang="less">
.dashboard-card {
  margin: 2px;

  &:first-child {
    margin-top: 4px;
    margin-left: 4px;
  }

  &:last-child {
    margin-right: 4px;
    margin-bottom: 4px;
  }
}
</style>
