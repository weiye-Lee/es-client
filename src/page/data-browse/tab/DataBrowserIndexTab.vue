<template>
  <div class="w-full data-browse">
    <!-- 顶部按钮 -->
    <db-header :tab/>
    <!-- 输入条件 -->
    <db-condition :tab/>
    <!-- 数据表格 -->
    <db-container :tab/>
  </div>
</template>
<script lang="ts" setup>
import DbCondition from "@/page/data-browse/component/DbCondition/DbCondition.vue";
import DbContainer from "@/page/data-browse/component/DbContainer/index.vue";
import DbHeader from "@/page/data-browse/component/DbHeader/DbHeader.vue";
import {UseDataBrowserInstance} from "@/hooks";

defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});
</script>
<style scoped lang="less">
.data-browse {
  height: calc(100vh - 96px);
}
</style>
