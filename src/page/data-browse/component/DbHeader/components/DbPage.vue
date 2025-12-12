<template>
  <db-page-help v-model:offset="offset" v-model:limit="limit" :total="total"/>
</template>
<script lang="ts" setup>
import { UseDataBrowserInstance } from "@/hooks";
import DbPageHelp from "@/page/data-browse/component/DbPageHelp/DbPageHelp.vue";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { pageNum, pageSize, total, run } = props.tab as UseDataBrowserInstance;

const limit = computed({
  get: () => pageSize.value,
  set: (value) => {
    pageSize.value = value;
    run();
  }
});
const offset = computed({
  get: () => (pageNum.value - 1) * pageSize.value,
  set: (value) => {
    pageNum.value = Math.ceil(value / pageSize.value);
    run();
  }
});
</script>
<style scoped></style>
