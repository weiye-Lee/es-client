<template>
  <div class="abs-8 !left-0 material-card overflow-hidden">
    <!-- 空状态 -->
    <empty-result
      v-if="activeIds.length === 0"
      :title="isConnected ? $t('dev_tool.select_dev_tool_file') : $t('dev_tool.select_link')"
    >
      <t-space v-if="isConnected" direction="vertical" size="large">
        <div class="empty-actions">
          <t-button theme="primary" @click="handleCreate">
            <template #icon>
              <add-icon/>
            </template>
            {{ $t('dev_tool.new_dev_tool') }}
          </t-button>
        </div>
      </t-space>
    </empty-result>

    <!-- 标签页 -->
    <div v-else class="tabs-container">
      <!-- 标签页内容 -->
      <t-tabs
        v-model="activeId"
        class="file-tabs"
        drag-sort
        @drag-sort="handleDragend"
        @change="handleTabChange"
      >
        <template #action>
          <t-button
            variant="outline"
            size="small"
            class="mt-12px mr-8px"
            theme="danger"
            :disabled="activeIds.length === 0"
            @click="handleCloseAll"
          >
            <template #icon>
              <close-icon/>
            </template>
            {{ $t('dev_tool.close_all') }}
          </t-button>
        </template>
        <t-tab-panel
          v-for="tab in activeIds"
          :key="tab.value"
          :value="tab.value"
          removable
          draggable
          @remove="handleRemove"
        >
          <template #label>
            <div class="tab-label">
              <file-code-icon class="tab-icon"/>
              <span class="tab-name">{{ tab.label }}</span>
            </div>
          </template>
          <ss-file-content
            :content="getFileContent(tab.value)"
            :file-id="tab.value"
          />
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useDevToolFileItemStore, useDevToolStore, useUrlStore} from "@/store";
import SsFileContent from "@/page/dev-tool/components/SsFileContent.vue";
import EmptyResult from "@/components/Result/ErrorResult.vue";
import MessageUtil from "@/utils/model/MessageUtil";
import {TabsProps, TdTabPanelProps} from "tdesign-vue-next";
import {AddIcon, CloseIcon, FileCodeIcon} from "tdesign-icons-vue-next";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const searchStore = useDevToolStore();
const fileItemStore = useDevToolFileItemStore();

const {activeId, activeIds} = toRefs(searchStore);

// 状态管理
const creating = ref(false);

// 当前是否进行了连接
const isConnected = computed(() => !!useUrlStore().id);

// 监听activeId变化
watch(activeId, () => {
  // 可以在这里添加切换标签页时的逻辑
});

// 获取文件内容
const getFileContent = (fileId: string) => {
  return searchStore.getFileContent(fileId);
};


// 标签页操作
const handleRemove: TdTabPanelProps["onRemove"] = async ({value}) => {
  const fileId = `${value}`;
  searchStore.onFileItemClose(fileId);
};

const handleTabChange = (value: string | number) => {
  // 标签页切换时的逻辑
  console.log("Tab changed to:", value);
};

const handleDragend: TabsProps["onDragSort"] = ({currentIndex, targetIndex}) => {
  [activeIds.value[currentIndex], activeIds.value[targetIndex]] = [
    activeIds.value[targetIndex],
    activeIds.value[currentIndex]
  ];
};

// 文件操作
const handleCreate = async () => {
  creating.value = true;
  try {
    await fileItemStore.create("0", false);
    MessageUtil.success(t('dev_tool.create_success'));
  } catch (error) {
    if (error !== "cancel") {
      MessageUtil.error(t('dev_tool.create_failed'), error);
    }
  } finally {
    creating.value = false;
  }
};

const handleCloseAll = async () => {
  // 关闭所有标签页
  activeIds.value.forEach((tab) => {
    searchStore.onFileItemClose(tab.value);
  });
};
</script>
<style scoped lang="less">

// 空状态样式
.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.recent-files {
  max-width: 400px;

  .recent-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin-bottom: 12px;
    text-align: center;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--td-radius-medium);
    background-color: var(--td-bg-color-container);
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }

    .recent-icon {
      color: var(--td-text-color-secondary);
      flex-shrink: 0;
    }

    .recent-name {
      font-size: 14px;
      color: var(--td-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

// 标签页容器样式
.tabs-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid var(--td-border-level-1-color);
  flex-shrink: 0;
}

.file-tabs {
  flex: 1;
  height: 0; // 确保flex布局正常工作
}

// 标签页标签样式
.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;

  .tab-icon {
    color: var(--td-text-color-secondary);
    font-size: 14px;
    flex-shrink: 0;
  }

  .tab-name {
    font-size: 14px;
    color: var(--td-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .tab-modified-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--td-warning-color);
    flex-shrink: 0;
    margin-left: 2px;
  }
}

// 覆盖TDesign Tabs组件的默认样式
:deep(.t-tabs) {
  height: 100%;

  .t-tabs__header {
    background-color: var(--td-bg-color-container);
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  .t-tabs__content {
    height: calc(100% - 48px);
    background-color: var(--td-bg-color-page);

    .t-tab-panel {
      height: 100%;
      padding: 0;
    }
  }

  .t-tabs__nav-item {
    &.t-is-active {
      .tab-label {
        .tab-icon {
          color: var(--td-brand-color);
        }

        .tab-name {
          color: var(--td-brand-color);
          font-weight: 500;
        }
      }
    }
  }
}
</style>
