<template>
  <div class="flex items-center h-24px overflow-hidden">
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="isFirst || loading"
      @click="toFirst()"
    >
      <template #icon>
        <chevron-left-double-icon />
      </template>
    </t-button>
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="isFirst || loading"
      @click="prePage()"
    >
      <template #icon>
        <chevron-left-icon />
      </template>
    </t-button>
    <t-dropdown trigger="click">
      <t-button
        theme="primary"
        variant="text"
        size="small"
        style="font-size: 12px; line-height: 20px"
        :disabled="loading"
      >
        {{ begin }} - {{ end }}
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item value="1" @click="limitChange(20)">20</t-dropdown-item>
        <t-dropdown-item value="2" @click="limitChange(100)">100</t-dropdown-item>
        <t-dropdown-item value="3" @click="limitChange(250)">250</t-dropdown-item>
        <t-dropdown-item value="4" @click="limitChange(500)">500</t-dropdown-item>
        <t-dropdown-item value="5" @click="limitChange(1000)">1,000</t-dropdown-item>
        <t-dropdown-item value="6" @click="limitCustom">自定义</t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
    <t-button theme="primary" variant="text" size="small" style="font-size: 12px">
      / {{ total }}
    </t-button>
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="isLast || loading"
      @click="nextPage()"
    >
      <template #icon>
        <chevron-right-icon />
      </template>
    </t-button>
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="isLast || loading"
      @click="toLast()"
    >
      <template #icon>
        <chevron-right-double-icon />
      </template>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import {
  ChevronLeftDoubleIcon,
  ChevronLeftIcon,
  ChevronRightDoubleIcon,
  ChevronRightIcon
} from "tdesign-icons-vue-next";

const props = defineProps({
  limit: {
    type: Number,
    default: 20
  },
  offset: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update:limit', 'update:offset']);

const isFirst = computed(() => props.offset === 0);
const isLast = computed(() => props.offset + props.limit >= props.total);

const begin = computed(() => props.offset + 1);
const end = computed(() => Math.min(props.offset + props.limit, props.total));

function toFirst() {
  emit('update:offset', 0);
}

function prePage() {
  if (isFirst.value) return;
  emit('update:offset', Math.max(props.offset - props.limit, 0));
}

function nextPage() {
  // 最后一页
  if (isLast.value) return;
  emit('update:offset', Math.min(props.offset + props.limit, props.total - props.limit))
}

function toLast() {
  emit('update:offset', props.total - props.limit);
}

function limitChange(res: number) {
  emit('update:limit', res)
}

function limitCustom() {
  MessageBoxUtil.prompt("请输入自定义分页大小", "自定义分页", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /\d+/,
    inputErrorMessage: "请输入正确的数字",
    inputValue: props.limit + ""
  })
    .then((value) => {
      emit('update:limit', parseInt(value));
    })
    .catch(() => {});
}
</script>
<style scoped></style>
