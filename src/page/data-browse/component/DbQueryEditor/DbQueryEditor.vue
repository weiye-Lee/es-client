<template>
  <div class="db-query-editor">
    <div class="header">
      <t-space size="small">
        <t-button theme="success" variant="text" shape="square" size="small">
          <template #icon>
            <play-icon/>
          </template>
        </t-button>
        <t-button theme="success" variant="text" shape="square" size="small">
          <template #icon>
            <history-icon />
          </template>
        </t-button>
        <t-select v-model="mode" size="small" auto-width>
          <t-option value="SQL" label="SQL"></t-option>
          <t-option value="ES|QL" label="ES|QL"></t-option>
        </t-select>
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
      <sql-editor v-model="content" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {HistoryIcon, PlayIcon, QuestionnaireIcon} from "tdesign-icons-vue-next";
import {UseDataBrowserQueryContent} from "@/hooks";
import SqlEditor from "@/components/SqlEditor/SqlEditor.vue";

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
