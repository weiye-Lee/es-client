<template>
  <div class="db-query-editor">
    <div class="header">
      <t-space size="small">
        <t-button theme="success" variant="text" shape="square" size="small">
          <template #icon>
            <play-icon/>
          </template>
        </t-button>
        <t-divider theme="vertical" />
        <t-button theme="success" variant="text" shape="square" size="small">
          <template #icon>
            <history-icon />
          </template>
        </t-button>
        <t-divider theme="vertical" />
        <t-switch v-model="mode" :custom-value="['SQL', 'ES|QL']">
          <template #label="slotProps">{{ slotProps.value ? 'SQL模式' : 'ES|QL模式' }}</template>
        </t-switch>
      </t-space>
      <t-space>
        <t-button theme="primary" variant="text" shape="square" size="small">
          <template #icon>
            <questionnaire-icon />
          </template>
        </t-button>
      </t-space>
    </div>
    <div class="content">

    </div>
  </div>
</template>
<script lang="ts" setup>
import {HistoryIcon, PlayIcon, QuestionnaireIcon} from "tdesign-icons-vue-next";
import {UseDataBrowserQueryContent} from "@/hooks";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserQueryContent>,
    required: true
  }
});

const {content, records, mode} = props.tab;
</script>
<style scoped lang="less">
.db-query-editor {
  height: 100%;
  width: 100%;

  .header {
    height: 32px;
    gap: 8px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content {
    width: 100%;
    height: calc(100% - 33px);
  }
}
</style>
