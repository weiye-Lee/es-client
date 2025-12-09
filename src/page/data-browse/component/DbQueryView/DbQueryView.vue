<template>
  <div class="abs-0" ref="containerRef">
    <!-- tab -->
    <TabChrome v-model="current" :tabs="tabs" @remove="onRemove"/>
    <!-- 表格 -->
    <div class="db-query-view-content">
      <div v-for="instance in instances" :key="instance.id" v-show="current === instance.id">
        <DbQueryTable :columns="instance.columns.value" :records="instance.records.value" :height/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {UseDataBrowserQueryInstance} from "@/hooks/query/DataBrowserQueryInstance";
import {SelectOption} from "$/shared/common";
import DbQueryTable from "@/page/data-browse/component/DbQueryView/DbQueryTable.vue";

const props = defineProps({
  instances: {
    type: Object as PropType<Array<UseDataBrowserQueryInstance>>,
    required: true
  }
});
const emit = defineEmits(['empty']);

const current = ref<string>('');

const containerRef = ref<HTMLElement>();

const containerSize = useElementSize(containerRef);

const height = computed(() => containerSize.height.value - 44);

const tabs = computed<Array<SelectOption>>(() => {
  if (props.instances.length === 0) return [];
  current.value = props.instances[0].id;
  return props.instances.map((e, i) => ({
    label: `结果-${i + 1}`,
    value: e.id
  }));
})

const onRemove = (tab: SelectOption) => {
  const index = tabs.value.findIndex(e => e.value === tab.value);
  if (index === -1) return;
  tabs.value.splice(index, 1);
  if (tabs.value.length === 0) {
    current.value = '';
    emit('empty');
    return;
  }
  current.value = tabs.value[index].value;
}
</script>
<style scoped lang="less">
.db-query-view-content {
  height: calc(100% - 44px);
}
</style>
