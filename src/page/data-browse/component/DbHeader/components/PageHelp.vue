<template>
  <div class="flex items-center">
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="pageNum === 1"
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
      :disabled="pageNum === 1"
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
      >
        {{ (pageNum - 1) * pageSize }} - {{ Math.min(pageNum * pageSize, total) }}
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item value="1" @click="pageSizeChange('1')">20</t-dropdown-item>
        <t-dropdown-item value="2" @click="pageSizeChange('2')">100</t-dropdown-item>
        <t-dropdown-item value="3" @click="pageSizeChange('3')">250</t-dropdown-item>
        <t-dropdown-item value="4" @click="pageSizeChange('4')">500</t-dropdown-item>
        <t-dropdown-item value="5" @click="pageSizeChange('5')">1,000</t-dropdown-item>
        <t-dropdown-item value="6" @click="pageSizeChange('6')">自定义</t-dropdown-item>
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
      :disabled="pageNum * pageSize > total"
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
      :disabled="pageNum * pageSize > total"
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
import { UseDataBrowserInstance } from "@/hooks";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { pageNum, pageSize, total, run } = props.tab as UseDataBrowserInstance;

function updatePage(value: number) {
  pageNum.value = value;
}

function updateSize(value: number) {
  pageSize.value = value;
}

function toFirst() {
  if (pageNum.value === 1) {
    return;
  }
  updatePage(1);
  run();
}

function prePage() {
  if (pageNum.value === 1) {
    return;
  }
  updatePage(pageNum.value - 1);
  run();
}

function pageSizeChange(command: any) {
  pageSizeChangeExec(command, run, (p, s) => {
    updatePage(p);
    updateSize(s);
  });
}

function nextPage() {
  if (pageNum.value * pageSize.value > total.value) {
    return;
  }
  updatePage(pageNum.value + 1);
  run();
}

function toLast() {
  updatePage(Math.ceil(total.value / pageSize.value));
  run();
}

function pageSizeChangeExec(
  command: string,
  executeQuery: () => void,
  callback: (page: number, size: number) => void
) {
  switch (command) {
    case "1":
      callback(1, 20);
      executeQuery();
      break;
    case "2":
      callback(1, 100);
      executeQuery();
      break;
    case "3":
      callback(1, 250);
      executeQuery();
      break;
    case "4":
      callback(1, 500);
      executeQuery();
      break;
    case "5":
      callback(1, 1000);
      executeQuery();
      break;
    case "6":
      MessageBoxUtil.prompt("请输入自定义分页大小", "自定义分页", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\d+/,
        inputErrorMessage: "请输入正确的数字",
        inputValue: pageSize.value + ""
      })
        .then((value) => {
          callback(1, parseInt(value));
          executeQuery();
        })
        .catch(() => {});
      break;
  }
}
</script>
<style scoped></style>
