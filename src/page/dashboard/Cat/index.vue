<template>
  <t-card class="dashboard-cat" size="small">
    <t-loading dot :tip="$t('module.dashboard.data_loading')" :loading="loading">
      <div class="header">
        <t-space>
          <t-select v-model="activeKey" allow-search>
            <t-option v-for="tab in tabs" :key="tab.key" :value="tab.key">
              {{ tab.title }}
            </t-option>
          </t-select>
          <t-select v-if="needIndex" v-model="index" allow-search allow-clear>
            <t-option v-for="idx in indices" :key="idx" :value="idx">{{ idx }}</t-option>
          </t-select>
        </t-space>
        <div>
          <t-tooltip :content="$t('module.dashboard.jump_to_dev_tool')" position="br">
            <t-button variant="text" theme="primary" shape="square" @click="jumpTo()">
              <template #icon>
                <filter-icon />
              </template>
            </t-button>
          </t-tooltip>
          <t-button
            variant="text"
            theme="primary"
            shape="square"
            :loading="loading"
            @click="refresh()"
          >
            <template #icon>
              <refresh-icon />
            </template>
          </t-button>
        </div>
      </div>
      <t-table :columns="columns" :data="records" :height="virtualListHeight" />
    </t-loading>
  </t-card>
</template>
<script lang="ts" setup>
import { BaseTableCol, TableRowData } from "tdesign-vue-next";
import { cat, tabs } from "@/page/dashboard/Cat/func";
import MessageUtil from "@/utils/model/MessageUtil";
import { useIndexStore, useUrlStore } from "@/store";
import PageNameEnum from "@/enumeration/PageNameEnum";
import { FilterIcon, RefreshIcon } from "tdesign-icons-vue-next";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const size = useWindowSize();
const router = useRouter();

const loading = ref(false);

const activeKey = ref("/_cat/allocation?v");
const index = ref("");

const columns = ref(new Array<BaseTableCol>());
const records = ref(new Array<TableRowData>());

const virtualListHeight = computed(() => size.height.value - 124);
const indices = computed(() => useIndexStore().list.map((e) => e.name));
const needIndex = computed(() => activeKey.value.indexOf("{index}") > -1);

watch(
  () => activeKey.value,
  (key) => handler(key),
  { immediate: true }
);
watch(() => index.value, refresh);

watch(() => useUrlStore().current, refresh);

function refresh() {
  handler(activeKey.value);
}

function handler(url: string) {
  // 清空数据
  columns.value = new Array<BaseTableCol>();
  records.value = new Array<TableRowData>();
  // 未选择链接不处理
  if (useUrlStore().current.trim() === "") {
    return;
  }
  // 需要索引，但是没选择
  if (needIndex.value) {
    if (index.value === "") {
      return;
    } else {
      url = url.replace("{index}", index.value);
    }
  }
  loading.value = true;
  cat(url)
    .then((data) => {
      columns.value = data.columns;
      records.value = data.records;
    })
    .catch((e) => MessageUtil.error(t('module.dashboard.fetch_data_error'), e))
    .finally(() => (loading.value = false));
}

function jumpTo() {
  router.push(PageNameEnum.SENIOR_SEARCH);
  useSeniorSearchStore().loadEvent({
    method: "GET",
    link: activeKey.value,
    body: ""
  });
}
</script>
<style scoped lang="less">
.dashboard-cat {
  margin: 8px;

  .header {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
  }
}
</style>
