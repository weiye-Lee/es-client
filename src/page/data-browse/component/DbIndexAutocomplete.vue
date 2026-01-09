<template>
  <div class="db-index-autocomplete" ref="containerRef">
    <input
      ref="inputRef"
      v-model="keyword"
      :placeholder="placeholder"
      class="index-autocomplete-input"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <!-- 使用 Teleport 将下拉框传送到 body，使其在最顶层显示 -->
    <Teleport to="body">
      <div
        v-if="showDropdown && items.length > 0"
        class="db-index-autocomplete-dropdown"
        :style="dropdownStyle"
        ref="dropdownRef"
      >
        <div class="autocomplete-dropdown-content">
          <!-- 自定义输入项 -->
          <div
            v-if="customItem"
            class="autocomplete-item autocomplete-item-custom"
            :class="{ 'autocomplete-item-active': activeIndex === -1 }"
            @mousedown.prevent="selectItem(customItem)"
            @mouseenter="activeIndex = -1"
          >
            <span class="item-name">{{ customItem.name }}</span>
            <span class="item-tag custom-tag">自定义</span>
          </div>
          <!-- 索引/别名列表 -->
          <div
            v-for="(item, index) in items"
            :key="item.name"
            class="autocomplete-item"
            :class="{ 'autocomplete-item-active': index === activeIndex }"
            @mousedown.prevent="selectItem(item)"
            @mouseenter="activeIndex = index"
          >
            <span class="item-name">{{ item.name }}</span>
            <div class="item-tags">
              <span v-if="isFrequentlyUsed(item.name)" class="item-tag frequent-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c1.1 0 2 .9 2 2 0 .55-.22 1.05-.59 1.41L13 5.83V9h4v2h-4v7.17l.41-.41c.37-.37.88-.59 1.41-.59 1.1 0 2 .9 2 2s-.9 2-2 2c-.55 0-1.05-.22-1.41-.59L12 17.17l-1.41 1.42c-.37.36-.87.58-1.41.58-1.1 0-2-.9-2-2s.9-2 2-2c.55 0 1.05.22 1.41.59l.41.41V11H7V9h4V5.83l-.41-.42C10.22 5.05 10 4.55 10 4c0-1.1.9-2 2-2z"/>
                </svg>
                常用
              </span>
              <span v-if="item.type === 'index'" class="item-tag index-tag">索引</span>
              <span v-else-if="item.type === 'alias'" class="item-tag alias-tag">别名</span>
              <span v-if="getUsageCount(item.name) > 0" class="usage-count">
                {{ getUsageCount(item.name) }}次
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useIndexStore } from '@/store';
import useIndexUsageStore from '@/store/IndexUsageStore';
import { useDataBrowseStore, encodeValue } from '@/store/components/DataBrowseStore';
import { useFuse } from '@vueuse/integrations/useFuse';
import IndexView from '@/view/index/IndexView';

interface IndexItem {
  name: string;
  type: 'index' | 'alias' | 'custom';
  index?: IndexView;
  usageCount?: number;
}

const props = withDefaults(defineProps<{
  placeholder?: string;
}>(), {
  placeholder: '请输入索引'
});

const emit = defineEmits<{
  (e: 'select', item: IndexItem): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const keyword = ref('');
const showDropdown = ref(false);
const activeIndex = ref(0);
// 懒加载：只有在用户交互时才初始化索引列表
const isInitialized = ref(false);

// 下拉框位置
const dropdownPosition = ref({ top: 0, left: 0, width: 320 });

const indexUsageStore = useIndexUsageStore();

// 初始化索引使用存储
onMounted(() => {
  indexUsageStore.init();
  window.addEventListener('scroll', handleWindowScroll, true);
  window.addEventListener('resize', handleWindowScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll, true);
  window.removeEventListener('resize', handleWindowScroll);
});

// 获取索引使用次数
const getUsageCount = (indexName: string): number => {
  return indexUsageStore.getUsageCount(indexName);
};

// 检查索引是否为常用索引
const isFrequentlyUsed = (indexName: string): boolean => {
  return indexUsageStore.isFrequentlyUsed(indexName);
};

// 获取所有索引和别名
const indexStore = useIndexStore();

const indices = computed<Array<IndexItem>>(() => {
  // 懒加载：如果没有初始化，则返回空数组，避免不必要的计算和 fuse 索引构建
  // 这可以显著提高页面进入时的性能，特别是当索引数量很大时
  if (!isInitialized.value) {
    return [];
  }

  const items = new Set<IndexItem>();
  const names = new Set<string>();
  const indexList = indexStore.list;
  
  if (indexList.length === 0) {
    return Array.from(items);
  }
  
  for (const index of indexList) {
    // 索引不会重名
    items.add({
      name: index.name,
      type: 'index',
      index,
      usageCount: indexUsageStore.getUsageCount(index.name)
    });
    
    if (index.alias) {
      for (const alias of index.alias) {
        // 别名可能重复
        if (!names.has(alias)) {
          names.add(alias);
          items.add({
            name: alias,
            type: 'alias',
            index,
            usageCount: indexUsageStore.getUsageCount(alias)
          });
        }
      }
    }
  }
  
  // 按使用频率排序（降序），使用次数相同则按名称排序
  return Array.from(items).sort((e1, e2) => {
    const count1 = e1.usageCount || 0;
    const count2 = e2.usageCount || 0;
    
    // 首先按使用次数降序排列
    if (count2 !== count1) {
      return count2 - count1;
    }
    
    // 使用次数相同，按名称字母顺序排列
    return e1.name.localeCompare(e2.name, 'zh');
  });
});

// 使用 useFuse 进行模糊搜索
const { results } = useFuse(keyword, indices, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [{ name: 'name' }]
  }
});

// 搜索结果
const items = computed(() => {
  const searchResults = results.value.map(e => e.item);
  // 如果有搜索关键词，保持搜索相关性排序；否则按使用频率排序
  if (keyword.value.trim()) {
    return searchResults;
  }
  return searchResults.sort((e1, e2) => {
    const count1 = e1.usageCount || 0;
    const count2 = e2.usageCount || 0;
    if (count2 !== count1) {
      return count2 - count1;
    }
    return e1.name.localeCompare(e2.name, 'zh');
  });
});

// 自定义输入项（当输入的内容不在索引列表中时显示）
const customItem = computed<IndexItem | null>(() => {
  if (!keyword.value.trim()) return null;
  // 检查是否已存在这个索引名
  if (indices.value.some(e => e.name === keyword.value.trim())) {
    return null;
  }
  return {
    name: keyword.value.trim(),
    type: 'custom'
  };
});

// 更新下拉框位置
function updateDropdownPosition() {
  if (!inputRef.value) return;
  
  const rect = inputRef.value.getBoundingClientRect();
  dropdownPosition.value = {
    top: rect.bottom + 4,
    left: rect.left,
    width: Math.max(rect.width, 320)
  };
}

// 计算下拉框样式
const dropdownStyle = computed(() => {
  return {
    position: 'fixed' as const,
    top: `${dropdownPosition.value.top}px`,
    left: `${dropdownPosition.value.left}px`,
    width: `${dropdownPosition.value.width}px`,
    zIndex: 9999
  };
});

// 监听窗口滚动和调整大小
function handleWindowScroll() {
  if (showDropdown.value) {
    updateDropdownPosition();
  }
}

function handleInput() {
  if (!isInitialized.value) {
    isInitialized.value = true;
  }
  nextTick(() => {
    updateDropdownPosition();
    showDropdown.value = true;
    activeIndex.value = customItem.value ? -1 : 0;
  });
}

function handleFocus() {
  if (!isInitialized.value) {
    isInitialized.value = true;
  }
  nextTick(() => {
    updateDropdownPosition();
    showDropdown.value = true;
    activeIndex.value = customItem.value ? -1 : 0;
  });
}

function handleBlur() {
  // 延迟关闭，以便处理点击事件
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value || items.value.length === 0) {
    if (e.key === 'Enter' && keyword.value.trim()) {
      // 如果没有下拉框但有输入，使用自定义输入
      if (customItem.value) {
        selectItem(customItem.value);
      }
    }
    return;
  }
  
  const totalItems = items.value.length + (customItem.value ? 1 : 0);
  const minIndex = customItem.value ? -1 : 0;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (activeIndex.value < items.value.length - 1) {
        activeIndex.value++;
      } else {
        activeIndex.value = minIndex;
      }
      scrollToActiveItem();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (activeIndex.value > minIndex) {
        activeIndex.value--;
      } else {
        activeIndex.value = items.value.length - 1;
      }
      scrollToActiveItem();
      break;
    case 'Enter':
      e.preventDefault();
      if (activeIndex.value === -1 && customItem.value) {
        selectItem(customItem.value);
      } else if (activeIndex.value >= 0 && activeIndex.value < items.value.length) {
        selectItem(items.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      showDropdown.value = false;
      break;
  }
}

function selectItem(item: IndexItem) {
  // 记录使用次数
  indexUsageStore.recordUsage(item.name);
  
  // 打开新 Tab
  const value = encodeValue(item.type === 'custom' ? 'index' : item.type, item.name);
  useDataBrowseStore().openTab(value, item.name);
  
  // 清空输入并关闭下拉框
  keyword.value = '';
  showDropdown.value = false;
  activeIndex.value = 0;
  
  emit('select', item);
}

function scrollToActiveItem() {
  nextTick(() => {
    if (dropdownRef.value) {
      const activeItem = dropdownRef.value.querySelector('.autocomplete-item-active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  });
}
</script>

<style lang="less">
.db-index-autocomplete {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 300px;
  
  .index-autocomplete-input {
    width: 100%;
    height: 24px;
    border: 1px solid var(--td-border-level-2-color);
    border-radius: 4px;
    padding: 0 8px;
    font-size: 13px;
    background: var(--td-bg-color-container);
    color: var(--td-text-color-primary);
    outline: none;
    transition: border-color 0.2s;
    
    &::placeholder {
      color: var(--td-text-color-placeholder);
    }
    
    &:focus {
      border-color: var(--td-brand-color);
    }
  }
}

// 下拉框样式
.db-index-autocomplete-dropdown {
  max-height: 400px;
  background-color: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-2-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  .autocomplete-dropdown-content {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .autocomplete-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--td-border-level-1-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover,
    &.autocomplete-item-active {
      background-color: var(--td-bg-color-container-hover);
    }
    
    .item-name {
      flex: 1;
      color: var(--td-text-color-primary);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }
    
    .item-tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    
    .item-tag {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 500;
      
      &.index-tag {
        background-color: var(--td-brand-color-1);
        color: var(--td-brand-color);
      }
      
      &.alias-tag {
        background-color: var(--td-success-color-1);
        color: var(--td-success-color);
      }
      
      &.custom-tag {
        background-color: var(--td-warning-color-1);
        color: var(--td-warning-color);
      }
      
      &.frequent-tag {
        background-color: var(--td-brand-color-1);
        color: var(--td-brand-color);
        
        svg {
          width: 12px;
          height: 12px;
        }
      }
    }
    
    .usage-count {
      font-size: 11px;
      color: var(--td-text-color-secondary);
    }
  }
  
  .autocomplete-item-custom {
    background-color: var(--td-bg-color-component);
  }
}
</style>