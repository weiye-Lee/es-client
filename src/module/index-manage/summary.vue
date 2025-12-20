<template>
  <t-loading :loading="loading" :text="$t('common.loading_data')">
    <t-descriptions :title="$t('module.index_manage.tab.overview')" :column="2" class="index-manage-summary" bordered>
      <t-descriptions-item :label="$t('module.index_manage.summary.health')">
        <div class="health">
          <div class="dot" :style="{ backgroundColor: health }"/>
          <div>{{ health }}</div>
        </div>
      </t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.status')">{{ state }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.node_count')">{{ numberOfNodes }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.data_node_count')">{{ numberOfDataNodes }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.active_primary_shards')">{{ activePrimaryShards }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.active_shards')">{{ activeShards }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.relocating_shards')">{{ relocatingShards }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.initializing_shards')">{{ initializingShards }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.unassigned_shards')">{{ unassignedShards }}</t-descriptions-item>
      <t-descriptions-item :label="$t('module.index_manage.summary.alias')" :span="2">
        <t-tag theme="primary" closable @close="removeAlias(item)" variant="outline"
               v-for="(item, idx) in aliasItems" :key="idx" style="margin-right: 5px">
          {{ item }}
        </t-tag>
        <t-button theme="primary" size="small" @click="newAlias()">{{ $t('action.add') }}
        </t-button>
      </t-descriptions-item>
    </t-descriptions>
  </t-loading>
</template>
<script lang="ts">
import {useIndexStore} from "@/store";
import Assert from "@/utils/Assert";
import IndexApi from "@/components/es/IndexApi";
import MessageUtil from "@/utils/model/MessageUtil";
import {mapState} from "pinia";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import {stringifyJsonWithBigIntSupport} from "$/util";
import i18n from '@/i18n';

const t = (key: string) => i18n.global.t(key);

export default defineComponent({
  name: 'index-manage-summary',
  props: {
    index: String,
    state: String
  },
  data: () => ({
    loading: false,
    health: '',
    numberOfNodes: 0,
    numberOfDataNodes: 0,
    activePrimaryShards: 0,
    activeShards: 0,
    relocatingShards: 0,
    initializingShards: 0,
    unassignedShards: 0,
    aliasItems: new Array<string>()
  }),
  created() {
    this.init();
  },
  computed: {
    ...mapState(useIndexStore, ['indicesMap']),
  },
  watch: {
    indicesMap() {
      this.init()
    }
  },
  methods: {
    init() {
      this.loading = true;
      let indexView = useIndexStore().indicesMap.get(this.index!)!;
      Assert.notNull(indexView, t('error.index_not_exist'), () => this.loading = false);

      // 获取索引健康状态
      IndexApi(this.index!).health().then(health => {
        this.health = health.status;
        this.numberOfNodes = health.number_of_nodes;
        this.numberOfDataNodes = health.number_of_data_nodes;
        this.activePrimaryShards = health.active_primary_shards;
        this.activeShards = health.active_shards;
        this.relocatingShards = health.relocating_shards;
        this.initializingShards = health.initializing_shards;
        this.unassignedShards = health.unassigned_shards;
        this.aliasItems = indexView.alias;
      }).catch(e => MessageUtil.error(t('error.get_health_error'), e))
        .finally(() => this.loading = false);
    },

    newAlias() {
      MessageBoxUtil.prompt(t('message.input_new_alias'), t('common.tips'), {
        confirmButtonText: t('action.confirm'),
        cancelButtonText: t('action.cancel'),
      }).then((value) => IndexApi(this.index!).newAlias(value)
        .then(res => {
          MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset);
        })
        .catch(e => MessageUtil.error(t('error.create_alias_error'), e)));
    },
    removeAlias(alias: string) {
      MessageBoxUtil.confirm(t('message.confirm_delete_alias'), t('common.tips'), {
        confirmButtonText: t('action.confirm'),
        cancelButtonText: t('action.cancel'),
      })
        .then(() => IndexApi(this.index!).removeAlias(alias)
          .then(res => MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset))
          .catch(e => MessageUtil.error(t('error.delete_alias_error'), e)))
        .catch(() => console.log('取消删除别买'));
    },
    reset() {
      useIndexStore().reset();
    },
  }
});
</script>
<style scoped lang="less">
.index-manage-summary {
  margin-top: 20px;


  .health {
    display: flex;
  }


  .alias {
    margin-right: 5px;
    margin-bottom: 5px;
  }

}
</style>
