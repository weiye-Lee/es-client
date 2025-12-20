<template>
  <div class="ss-file-content">
    <t-loading :loading="!init" class="w-full h-full relative" :tip="$t('dev_tool.initializing')">
      <SplitPanel v-model="size">
        <template #left>
          <RestEditor
            v-if="init"
            v-model="content"
            @run="handleRun"
          />
        </template>
        <template #right>
          <TableViewer v-if="devToolViewer === ViewTypeEnum.TABLE" :data="data" :show-meta="devToolShowMeta"
                       height="100%"/>
          <monaco-view v-else :value="data"/>
        </template>
      </SplitPanel>
    </t-loading>
  </div>
</template>
<script lang="ts" setup>
import {UseSeniorFileItemContent} from "@/hooks/query/DevToolFileItemContent";
import {useGlobalSettingStore} from "@/store";
import ViewTypeEnum from "@/enumeration/ViewTypeEnum";

const props = defineProps({
  content: {
    type: Object as PropType<UseSeniorFileItemContent>,
    required: true
  },
  fileId: {
    type: String,
    required: true
  }
});


const {content, data, init, size} = props.content;
const devToolViewer = computed(() => useGlobalSettingStore().devToolViewer);
const devToolShowMeta = computed(() => useGlobalSettingStore().devToolShowMeta);

// 跟踪原始内容以检测修改状态
const originalContent = ref("");
const isModified = ref(false);

// 监听初始化完成，记录原始内容
watch(init, (newInit) => {
  if (newInit) {
    originalContent.value = content.value;
    isModified.value = false;
  }
});

// 运行查询
const handleRun = (index: number) => {
  props.content.run(index);
};

</script>
<style scoped lang="less">
.ss-file-content {
  height: 100%;
  width: 100%;
}
</style>
