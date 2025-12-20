<template>
  <!-- 查询条件 -->
  <div class="base-search-display">
    <t-form :model="{}" class="m-8px">
      <!-- 条件 -->
      <t-form-item :label="$t('module.base_search.condition')" label-align="top">
        <field-condition-container :tab />
      </t-form-item>
      <!-- 排序 -->
      <t-form-item :label="$t('module.base_search.sort')" label-align="top">
        <field-order-container :tab />
      </t-form-item>
      <div class="flex gap-8px">
        <t-pagination
          v-model:page-size="pageSize"
          :total="total"
          :current="pageNum"
          :page-size-options="pageSizeOptions"
          show-total
          show-jumper
          @change="pageChange"
          @page-size-change="sizeChange"
        />
      </div>
    </t-form>
  </div>
</template>
<script lang="ts" setup>
import FieldOrderContainer from "@/page/base-search/components/filed-order/container.vue";
import FieldConditionContainer from "@/page/base-search/components/field-condition/container.vue";
import { BaseSearchInstanceResult } from "@/hooks";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const props = defineProps({
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});

const { pageNum, pageSize, total, run } = props.tab;

const pageSizeOptions = computed(() => [
  { label: t('module.base_search.page_size_20'), value: 20 },
  { label: t('module.base_search.page_size_100'), value: 100 },
  { label: t('module.base_search.page_size_250'), value: 250 },
  { label: t('module.base_search.page_size_500'), value: 500 },
  { label: t('module.base_search.page_size_1000'), value: 1000 }
]);

function pageChange(props: { current: number }) {
  pageNum.value = props.current;
  run();
}

function sizeChange(size?: number) {
  if (typeof size !== "undefined") {
    pageSize.value = size;
    run();
  }
}
</script>
<style scoped></style>
