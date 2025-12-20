<template>
  <div class="db-query-editor">
    <div class="header">
      <t-space size="small" class="items-center">
        <t-button theme="success" variant="text" shape="square" size="small" @click="onPlay">
          <template #icon>
            <play-icon/>
          </template>
        </t-button>
        <t-button theme="success" variant="text" shape="square" size="small">
          <template #icon>
            <history-icon/>
          </template>
        </t-button>
        <div style="border-left: 2px solid var(--td-border-level-2-color);padding-left: 8px">{{ $t('module.data_browse.parser') }}：</div>
        <t-select v-model="mode" size="small" auto-width>
          <t-option value="SQL" label="SQL"></t-option>
          <t-option value="ES|QL" label="ES|QL"></t-option>
        </t-select>
      </t-space>
      <t-space>
        <t-button theme="primary" variant="text" shape="square" size="small">
          <template #icon>
            <help-circle-icon/>
          </template>
        </t-button>
      </t-space>
    </div>
    <div class="content">
      <sql-editor v-model="content" ref="sqlEditor" @run="onRun"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {HelpCircleIcon, HistoryIcon, PlayIcon} from "tdesign-icons-vue-next";
import {UseDataBrowserQueryContent} from "@/hooks";
import SqlEditor from "@/components/SqlEditor/SqlEditor.vue";
import {SqlEditorFunc} from "@/components/SqlEditor";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserQueryContent>,
    required: true
  }
});

const {content, records, mode, execute} = props.tab;

const sqlEditor = ref<SqlEditorFunc>();

const onRun = ({instance, index}: any) => {
  console.log(instance, index)
}

const onPlay = () => {
  const instance = sqlEditor.value?.getInstance();
  if (!instance) return;
  // 假设 editor 是你的 Monaco Editor 实例
  const selection = instance.getSelection();
  if (selection && !selection.isEmpty()) {
    const selectedText = instance.getModel()?.getValueInRange(selection);
    if (selectedText) {
      execute(selectedText);
      return;
    }
  }
  execute(content.value);
}
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
