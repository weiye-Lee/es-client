<template>
  <div class="dashboard-info">
    <t-row style="width: 100%">
      <t-col :span="24" :xs="24" :lg="24" :xl="24" :xxl="12">
        <dashboard-card :title="$t('module.dashboard.node_info')" :loading="infoLoad" @render="getInfoData()">
          <t-descriptions
            v-if="info !== null"
            :column="1"
            style="width: 100%"
            :align="{ value: 'right' }"
          >
            <t-descriptions-item label="name">{{ info.name }}</t-descriptions-item>
            <t-descriptions-item label="cluster_name">{{ info.cluster_name }}</t-descriptions-item>
            <t-descriptions-item label="cluster_uuid">{{ info.cluster_uuid }}</t-descriptions-item>
            <t-descriptions-item label="tagline">{{ info.tagline }}</t-descriptions-item>
            <t-descriptions-item label="version.number">{{
                info.version.number
              }}
            </t-descriptions-item>
            <t-descriptions-item label="version.build_flavor"
            >{{ info.version.build_flavor }}
            </t-descriptions-item>
            <t-descriptions-item label="version.build_type"
            >{{ info.version.build_type }}
            </t-descriptions-item>
            <t-descriptions-item label="version.build_hash"
            >{{ info.version.build_hash }}
            </t-descriptions-item>
            <t-descriptions-item label="version.build_date"
            >{{ info.version.build_date }}
            </t-descriptions-item>
            <t-descriptions-item label="version.build_snapshot"
            >{{ info.version.build_snapshot }}
            </t-descriptions-item>
            <t-descriptions-item label="version.lucene_version"
            >{{ info.version.lucene_version }}
            </t-descriptions-item>
            <t-descriptions-item label="version.minimum_wire_compatibility_version">
              {{ info.version.minimum_wire_compatibility_version }}
            </t-descriptions-item>
            <t-descriptions-item label="version.minimum_index_compatibility_version">
              {{ info.version.minimum_index_compatibility_version }}
            </t-descriptions-item>
          </t-descriptions>
          <t-empty v-else :description="$t('placeholder.select_link')" style="padding-top: 150px"/>
        </dashboard-card>
      </t-col>

      <t-col :span="24" :xs="24" :lg="24" :xl="24" :xxl="12">
        <dashboard-card :title="$t('module.dashboard.cluster_health')" :loading="clusterHealthLoad" @render="getClusterHealth()">
          <t-descriptions
            v-if="clusterHealth !== null"
            :column="1"
            style="width: 100%"
            :align="{ value: 'right' }"
          >
            <t-descriptions-item label="cluster_name">{{
                clusterHealth.cluster_name
              }}
            </t-descriptions-item>
            <t-descriptions-item label="status">{{ clusterHealth.status }}</t-descriptions-item>
            <t-descriptions-item label="timed_out">{{
                clusterHealth.timed_out
              }}
            </t-descriptions-item>
            <t-descriptions-item label="number_of_nodes"
            >{{ clusterHealth.number_of_nodes }}
            </t-descriptions-item>
            <t-descriptions-item label="number_of_data_nodes"
            >{{ clusterHealth.number_of_data_nodes }}
            </t-descriptions-item>
            <t-descriptions-item label="active_primary_shards"
            >{{ clusterHealth.active_primary_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="active_shards"
            >{{ clusterHealth.active_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="relocating_shards"
            >{{ clusterHealth.relocating_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="initializing_shards"
            >{{ clusterHealth.initializing_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="unassigned_shards"
            >{{ clusterHealth.unassigned_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="delayed_unassigned_shards">
              {{ clusterHealth.delayed_unassigned_shards }}
            </t-descriptions-item>
            <t-descriptions-item label="number_of_pending_tasks"
            >{{ clusterHealth.number_of_pending_tasks }}
            </t-descriptions-item>
            <t-descriptions-item label="number_of_in_flight_fetch">
              {{ clusterHealth.number_of_in_flight_fetch }}
            </t-descriptions-item>
            <t-descriptions-item label="task_max_waiting_in_queue_millis">
              {{ clusterHealth.task_max_waiting_in_queue_millis }}
            </t-descriptions-item>
            <t-descriptions-item label="active_shards_percent_as_number">
              {{ clusterHealth.active_shards_percent_as_number }}
            </t-descriptions-item>
          </t-descriptions>
          <t-empty v-else :description="$t('placeholder.select_link')" style="padding-top: 150px"/>
        </dashboard-card>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="ts" setup>
import MessageUtil from "@/utils/model/MessageUtil";
import {useUrlStore} from "@/store";
import {ClusterHealth, Overview} from "$/elasticsearch-client";
import DashboardCard from "@/page/dashboard/components/DashboardCard.vue";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const empty = computed(() => useUrlStore().empty);

const info = ref<Overview | null>(null);
const infoLoad = ref(false);
const clusterHealth = ref<ClusterHealth | null>(null);
const clusterHealthLoad = ref(false);

function getInfoData() {
  if (empty.value) {
    return;
  }
  infoLoad.value = true;
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  client.info()
    .then((rsp) => (info.value = rsp))
    .catch((e) => MessageUtil.error(t('module.dashboard.node_info_fetch_error'), e))
    .finally(() => (infoLoad.value = false));
}

getInfoData();

function getClusterHealth() {
  if (empty.value) {
    return;
  }
  clusterHealthLoad.value = true;
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  client.clusterHealth()
    .then((rsp) => (clusterHealth.value = rsp))
    .catch((e) => MessageUtil.error(t('module.dashboard.cluster_health_fetch_error'), e))
    .finally(() => (clusterHealthLoad.value = false));
}

getClusterHealth();

watch(
  () => useUrlStore().current,
  () => {
    getInfoData();
    getClusterHealth();
  }
);
</script>
<style scoped>
.dashboard-info {
  padding: 8px;
}
</style>
