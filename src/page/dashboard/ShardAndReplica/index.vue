<template xmlns="">
  <div class="shard-and-replica">
    <div class="header">
      <t-input-group>
        <t-input style="width: 350px;" v-model="keyword" clearable>
          <template #suffix>
            <search-icon />
          </template>
        </t-input>
      </t-input-group>
    </div>
    <div class="container">
      <!-- 标题 -->
      <div class="index">
        <div class="info">
          <div class="name"></div>
        </div>
        <div class="shards">
          <div v-for="node in nodeKeys" class="shard-title">
            <t-typography-paragraph class="icon">
              <t-tooltip :content="$t('module.dashboard.master_node')" v-if="node === masterNode">
                <star-filled-icon style="color: var(--td-brand-color)"/>
              </t-tooltip>
              <t-tooltip :content="$t('module.dashboard.unassigned_node')" v-else-if="node === UNASSIGNED">
                <info-circle-icon />
              </t-tooltip>
              <!-- 标准节点 -->
              <t-tooltip :content="$t('module.dashboard.work_node')" v-else>
                <info-circle-icon />
              </t-tooltip>
            </t-typography-paragraph>
            <t-typography-paragraph bold>
              <t-button variant="text" theme="primary" v-if="node === UNASSIGNED">
                {{ nodes[node] ? nodes[node].name : node }}
              </t-button>
              <t-dropdown placement="bottom-right" trigger="click" v-else :title="node">
                <t-button variant="text" theme="primary">
                  {{ nodes[node] ? nodes[node].name : node }}
                  <template #suffix>
                    <chevron-down-icon />
                  </template>
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item @click="showClusterNode(node)">{{ $t('module.dashboard.cluster_node_info') }}</t-dropdown-item>
                  <t-dropdown-item @click="showNode(node)">{{ $t('module.dashboard.node_info') }}</t-dropdown-item>
                </t-dropdown-menu>
              </t-dropdown>
            </t-typography-paragraph>
          </div>
        </div>
      </div>
      <!-- 每一个索引 -->
      <div class="index" v-for="index in items" :key="index.name">
        <div class="info">
          <div class="name">
            <t-link theme="primary" class="link" @click="openIndexInfo(index.name)">{{ index.name }}</t-link>
          </div>
        </div>
        <!-- 每一个副本 -->
        <div class="shards">
          <div class="shard" v-for="nodeKey in nodeKeys">
            <div class="item" v-for="(shard, idx) in index.nodes[nodeKey]" @click="openJsonDialog(shard)"
                 :class="handlerReplicaClass(shard)">
              {{ shard ? shard.shard : idx }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useGlobalSettingStore, useIndexStore, useUrlStore} from "@/store";
import {showJson, showJsonDialogByAsync} from "@/utils/model/DialogUtil";
import {Shard} from "@/domain/es/ClusterState";
import {useFuse} from "@vueuse/integrations/useFuse";
import {useIndexManageEvent} from "@/global/BeanFactory";
import {stringifyJsonWithBigIntSupport} from "$/util";
import MessageUtil from "@/utils/model/MessageUtil";
import {ChevronDownIcon, InfoCircleIcon, SearchIcon, StarFilledIcon} from "tdesign-icons-vue-next";
import {ClusterNode} from "$/elasticsearch-client";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const UNASSIGNED = "Unassigned";

interface IndexItem {
  name: string;
  // 节点ID => 节点内全部的分片
  nodes: Record<string, Array<Shard | null>>;

}

const keyword = ref('');
const order = ref(useGlobalSettingStore().indexOrderBy);
const hasUnAssigned = ref(false);
// 节点信息
const nodeKeys = computed<Array<string>>(() => {
  let keys = Object.keys(useIndexStore().nodes);
  if (hasUnAssigned.value) {
    keys.push(UNASSIGNED)
  }
  return keys;
});
const nodes = computed<Record<string, ClusterNode>>(() => useIndexStore().nodes);
const masterNode = computed(() => useIndexStore().masterNode);
// 索引信息
const indices = computed(() => {
  hasUnAssigned.value = false;
  const items = new Array<IndexItem>();
  useIndexStore().list.forEach(index => {
    const item: IndexItem = {
      name: index.name,
      nodes: {}
    }
    for (let shardsKey in index.shards) {
      // shardsKey: 分片编号
      let shards = index.shards[shardsKey];
      for (let shard of shards) {
        if (!shard.node) {
          hasUnAssigned.value = true;
        }
        const value = shard.node || UNASSIGNED;
        let temp = item.nodes[value];
        if (!temp) {
          item.nodes[value] = new Array<Shard | null>();
          temp = item.nodes[value];
        }
        temp.push(shard)
      }
    }
    items.push(item);
  });
  return items.sort((a, b) => order.value === 'asc' ? a.name.localeCompare(b.name, "zh-CN") : b.name.localeCompare(a.name, "zh-CN"));
});

const {results} = useFuse(keyword, indices, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [{
      name: 'name'
    }]
  }
});
const items = computed(() => results.value.map(e => e.item));

function openJsonDialog(shard: Shard | null) {
  if (shard) {
    showJson(`${shard.index}/${shard.node}[${shard.shard}]`, shard ? stringifyJsonWithBigIntSupport(shard) : "", {
      width: '600px'
    });
  }
}

function openIndexInfo(name: string) {
  useIndexManageEvent.emit(name);
}

function handlerReplicaClass(shard: Shard | null): string {
  if (!shard) {
    return 'empty';
  }
  if (shard.state === 'UNASSIGNED') {
    return "unassigned"
  }
  if (shard.primary) {
    return 'primary';
  }
  return "";
}

function showClusterNode(node: string) {
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  showJsonDialogByAsync(`${t('module.dashboard.cluster_node_info')}【${node}】`, client.getJson('/_nodes').then(e => e.nodes[node]).then(stringifyJsonWithBigIntSupport),)
}

function showNode(node: string) {
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  showJsonDialogByAsync(`${t('module.dashboard.node_info')}【${node}】`, client.getJson('/_nodes/stats').then(e => e.nodes[node]).then(stringifyJsonWithBigIntSupport))
}

</script>
<style scoped lang="less">
@import url(./index.less);
</style>
