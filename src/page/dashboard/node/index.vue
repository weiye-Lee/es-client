<template>
  <div class="dashboard-node">
    <t-card :title="$t('module.dashboard.node_statistics')">
      <template #title>
        <span>{{ $t('module.dashboard.node') }}</span>
        <t-button
          variant="text"
          theme="primary"
          shape="square"
          size="large"
          :disabled="nodeStateLoad"
          @click="getNodeState()"
        >
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
      </template>
      <template #actions>
        <refresh-icon v-if="nodeStateLoad"/>
        <span v-if="nodeStateLoad" style="margin-left: 7px">{{ $t('common.loading') }}</span>
      </template>
      <t-row>
        <t-col :span="4">
          <t-statistic :title="$t('module.dashboard.total')" :value="total"/>
        </t-col>
        <t-col :span="4">
          <t-statistic :title="$t('module.dashboard.success')" :value="successful"/>
        </t-col>
        <t-col :span="4">
          <t-statistic :title="$t('module.dashboard.failed')" :value="failed"/>
        </t-col>
      </t-row>
    </t-card>
    <t-alert style="margin-top: 7px">{{ $t('module.dashboard.node') }}</t-alert>
    <!-- 每一个节点 -->
    <t-card v-for="item in nodeItems" :key="item.name" style="margin-top: 7px">
      <template #title>
        {{ item.node.name }}
      </template>
      <template #actions>
        {{ item.name }}
      </template>
      <!-- 基础信息 -->
      <t-descriptions :column="1">
        <t-descriptions-item :label="$t('module.dashboard.timestamp')">{{
            dateFormat(item.node.timestamp)
          }}
        </t-descriptions-item>
        <t-descriptions-item :label="$t('module.dashboard.ip_address')">{{ item.node.host }}</t-descriptions-item>
        <t-descriptions-item :label="$t('module.dashboard.role')">
          <t-space>
            <t-tag v-for="role in item.node.roles" :key="role" theme="primary">{{ role }}</t-tag>
          </t-space>
        </t-descriptions-item>
        <t-divider>{{ $t('module.dashboard.system_info') }}</t-divider>
        <t-descriptions-item v-if="item.node.os.cpu.load_average" :label="$t('module.dashboard.load')">
          <t-space>
            <span>{{ item.node.os.cpu.load_average["1m"] }}</span>
            <span>{{ item.node.os.cpu.load_average["5m"] }}</span>
            <span>{{ item.node.os.cpu.load_average["15m"] }}</span>
            <template #split>
              <t-divider direction="vertical"/>
            </template>
          </t-space>
        </t-descriptions-item>
        <t-descriptions-item :label="$t('module.dashboard.cpu')">
          <t-progress
            :percent="item.node.os.cpu.percent / 100"
            :status="calcStatus(item.node.os.cpu.percent)"
          />
        </t-descriptions-item>
        <t-descriptions-item :label="$t('module.dashboard.memory')">
          <div>
            <span>{{ prettyDataUnit(item.node.os.mem.used_in_bytes) }}</span>
            <span> / </span>
            <span>{{ prettyDataUnit(item.node.os.mem.total_in_bytes) }}</span>
          </div>
          <t-progress
            :percentage="item.node.os.mem.used_percent"
            :status="calcStatus(item.node.os.mem.used_percent)"
          />
        </t-descriptions-item>
        <t-descriptions-item :label="$t('module.dashboard.swap')">
          <div>
            <span>{{ prettyDataUnit(item.node.os.swap.used_in_bytes) }}</span>
            <span> / </span>
            <span>{{ prettyDataUnit(item.node.os.swap.total_in_bytes) }}</span>
          </div>
          <t-progress
            :percentage="
              Math.floor((item.node.os.swap.used_in_bytes / item.node.os.swap.total_in_bytes) * 100)
            "
            :status="
              nodeStateMemStatus(item.node.os.swap.used_in_bytes, item.node.os.swap.total_in_bytes)
            "
          />
        </t-descriptions-item>
      </t-descriptions>
    </t-card>
  </div>
</template>
<script lang="ts" setup>
import {IndexNodeState, Node} from "$/shared/elasticsearch";
import MessageUtil from "@/utils/model/MessageUtil";
import {useUrlStore} from "@/store";
import {prettyDataUnit} from "@/utils/BrowserUtil";
import {toDateString} from "xe-utils";
import {RefreshIcon} from "tdesign-icons-vue-next";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

interface NodeItem {
  name: string;
  node: Node;
}

const empty = computed(() => useUrlStore().empty);

const nodeState = ref<IndexNodeState>();
const nodeStateLoad = ref(false);

const total = computed(() => (nodeState.value ? nodeState.value._nodes.total : 0));
const successful = computed(() => (nodeState.value ? nodeState.value._nodes.successful : 0));
const failed = computed(() => (nodeState.value ? nodeState.value._nodes.failed : 0));
const nodeItems = computed<Array<NodeItem>>(() => {
  if (!nodeState.value) {
    return [];
  }
  const items = new Array<NodeItem>();
  for (let nodeKey in nodeState.value.nodes) {
    items.push({
      name: nodeKey,
      node: nodeState.value.nodes[nodeKey]
    });
  }
  return items;
});

function getNodeState() {
  if (empty.value) {
    return;
  }
  nodeStateLoad.value = true;
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  client.getJson<IndexNodeState>("/_nodes/stats")
    .then((rsp) => (nodeState.value = rsp))
    .catch((e) => MessageUtil.error(t('module.dashboard.node_state_fetch_error'), e))
    .finally(() => (nodeStateLoad.value = false));
}

watch(
  () => useUrlStore().current,
  () => getNodeState()
);
getNodeState();

function nodeStateMemStatus(use: number, total: number): "success" | "warning" | "error" {
  const percent = Math.floor((use / total) * 100);
  return calcStatus(percent);
}

function calcStatus(percent: number): "success" | "warning" | "error" {
  if (percent >= 80) {
    return "error";
  }
  if (percent >= 60) {
    return "warning";
  }
  return "success";
}

function dateFormat(date: number): string {
  return toDateString(date);
}
</script>
<style scoped>
.dashboard-node {
  padding: 7px;
}
</style>
