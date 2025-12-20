<template>
  <div class="ss-display-quick">
    <t-row :gutter="8">
      <t-col flex="auto">
        <t-input allow-clear v-model="keyword" placeholder="请输入记录名"/>
      </t-col>
      <t-col flex="60px">
        <t-button theme="primary" @click="openQuickAdd()">新增</t-button>
      </t-col>
    </t-row>
    <t-list style="margin-top: 8px;">
      <t-list-item v-for="request in requests" :key="request.id">
        <t-list-item-meta :title="request.name" :description="request.description"/>
        <t-space>
          <t-button variant="text" theme="success" @click="loadQuickOpera(request.id)">
            <template #icon>
              <chevron-left-double-s-icon/>
            </template>
            载入
          </t-button>
          <t-button variant="text" theme="primary" @click="openQuickAdd(request.id)">编辑</t-button>
          <t-popconfirm content="是否立即删除此记录？" @confirm="openQuickDelete(request.id)">
            <t-button variant="text" theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      </t-list-item>
    </t-list>
  </div>
</template>
<script lang="ts" setup>
import {useSeniorSearchRequestStore} from "@/store/history/SeniorSearchRequestStore";
import {
  loadQuickOpera,
  openQuickAdd,
  openQuickDelete
} from "@/page/senior-search/layout/senior-search-display/SsDisplayQuickOpera";
import {ChevronLeftDoubleSIcon} from "tdesign-icons-vue-next";

const keyword = ref('');
const requests = computed(() => useSeniorSearchRequestStore().requests);


</script>
<style scoped lang="less">
.ss-display-quick {
  position: relative;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  padding: 8px;
}
</style>
