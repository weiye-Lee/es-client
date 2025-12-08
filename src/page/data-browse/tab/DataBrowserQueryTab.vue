<template>
  <div class="abs-0">
    <vertical-split-panel v-model="size">
      <template #top>
        <DbQueryEditor :tab/>
      </template>
      <template #bottom>
        表格
      </template>
    </vertical-split-panel>
  </div>
</template>
<script lang="ts" setup>
import {UseDataBrowserQueryContent} from "@/hooks";
import VerticalSplitPanel from "@/components/SplitPanel/VerticalSplitPanel.vue";
import DbQueryEditor from "@/page/data-browse/component/DbQueryEditor/DbQueryEditor.vue";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserQueryContent>,
    required: true
  }
});


const size = ref(0);
</script>
<style scoped lang="less">

</style>