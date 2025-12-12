<template>
  <div class="flex justify-between db-header">
    <!-- 左侧条件 -->
    <div class="left flex">
      <db-page :tab />
      <div class="sep"></div>
      <db-simple-item tip="刷新" :disable="!index" @click="executeQuery">
        <refresh-icon />
      </db-simple-item>
      <div class="sep"></div>
      <db-simple-item tip="新增" :disable="!index" @click="recordAdd">
        <add-icon />
      </db-simple-item>
    </div>
    <!-- 右侧条件 -->
    <div class="right">
      <!-- 打印 -->
      <db-simple-item :disable="!index" tip="打印" @click="openExportDialog">
        <print-icon />
      </db-simple-item>
      <!-- 显示查询条件 -->
      <db-simple-item tip="显示查询条件" @click="showQuery">
        <search-icon />
      </db-simple-item>
      <!-- 筛选 -->
      <db-table-header :tab />
      <!-- 帮助 -->
      <t-button
        variant="text"
        theme="primary"
        shape="square"
        size="small"
        @click="openDbOperatorDoc"
      >
        <template #icon>
          <questionnaire-icon />
        </template>
      </t-button>
      <!-- 操作 -->
      <t-dropdown trigger="click">
        <t-button variant="text" theme="primary" shape="square" size="small">
          <template #icon>
            <more-icon />
          </template>
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item @click="openHelp()">更多</t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {Constant} from "@/global/Constant";
import MessageUtil from "@/utils/model/MessageUtil";
import { execAdd } from "@/page/data-browse/component/DbHeader/DbContextmenu";
import DbSimpleItem from "@/page/data-browse/component/DbHeader/components/DbSimpleItem.vue";
import DbPage from "@/page/data-browse/component/DbHeader/components/DbPage.vue";
import DbTableHeader from "@/page/data-browse/component/DbHeader/components/DbTableHeader.vue";
import {
  AddIcon,
  MoreIcon,
  PrintIcon,
  QuestionnaireIcon,
  RefreshIcon,
  SearchIcon
} from "tdesign-icons-vue-next";
import { UseDataBrowserInstance } from "@/hooks";
import { showDataExportDrawer } from "@/components/DataExport";
import { showJson } from "@/utils/model/DialogUtil";
import { stringifyJsonWithBigIntSupport } from "$/util";
import { openDbOperatorDoc } from "@/page/data-browse/component/DbCondition/DbOperatorDoc";
import { decodeIndexType } from "$/elasticsearch-client/utils";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { index, total, run, add, buildSearch } =
  props.tab as UseDataBrowserInstance;

const executeQuery = () => run();
const showQuery = () => {
  showJson("查询条件", stringifyJsonWithBigIntSupport(buildSearch()));
};

function recordAdd() {
  if (!index) {
    return;
  }
  execAdd(index, props.tab)
    .then((data) => add(data))
    .catch((e) => MessageUtil.error("打开新增失败", e));
}

function openExportDialog() {
  // 选择了索引
  if (!index) {
    MessageUtil.error("请选择索引");
    return;
  }
  // 有记录
  if (total.value === 0) {
    MessageUtil.warning("数据为空");
    return;
  }
  const { index: idx } = decodeIndexType(index);
  // 显示导出对话框
  showDataExportDrawer({
    name: `${idx} - 数据浏览导出`,
    index: idx,
    search: buildSearch() as any,
  });
}

const openHelp = () => window.open(Constant.doc.dataBrowse);
</script>
<style scoped>
.db-header {
  border-bottom: 1px solid var(--td-border-level-2-color);
}
</style>
