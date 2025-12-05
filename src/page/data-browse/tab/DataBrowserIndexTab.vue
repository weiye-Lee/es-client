<template>
  <div class="w-full h-full">
    <!-- 顶部按钮 -->
    <db-header/>
    <!-- 输入条件 -->
    <db-condition/>
    <!-- 数据表格 -->
    <db-container/>
  </div>
</template>
<script lang="ts" setup>
import DbHeader from "@/page/data-browse/component/DbHeader/index.vue";
import DbCondition from "@/page/data-browse/component/DbCondition.vue";
import DbContainer from "@/page/data-browse/component/DbContainer/index.vue";
import {UseDataBrowserInstance} from "@/hooks";

defineProps({
  instance: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});
</script>
<style scoped lang="less">

</style>
