<template>
  <div class="senior-search">
    <t-alert class="mb-8px" theme="warning">高级搜索下一个版本将会移除，请尽快迁移到开发者工具中</t-alert>

    <SplitPanel v-model="panelSize">
      <template #left>
        <senior-search-editor/>
      </template>
      <template #right>
        <senior-search-display/>
      </template>
    </SplitPanel>

  </div>
</template>

<script lang="ts" setup>
import './index.less';
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
// 布局组件
import SeniorSearchEditor from '@/page/senior-search/layout/senior-search-editor/index.vue';
import SeniorSearchDisplay from '@/page/senior-search/layout/senior-search-display/index.vue';
import LocalNameEnum from '@/enumeration/LocalNameEnum';


const panelSize = useLocalStorage<number>(LocalNameEnum.VALUE_SENIOR_SEARCH_SPLIT_PANEL_SIZE, 400);


useSeniorSearchStore().init();

</script>

<style lang="less"></style>
