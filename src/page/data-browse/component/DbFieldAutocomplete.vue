<template>
  <div class="db-field-autocomplete" ref="containerRef">
    <a-input
      v-model="inputValue"
      :placeholder="placeholder"
      class="autocomplete-input"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      allow-clear
      ref="inputRef"
    />
    <!-- 使用 Teleport 将下拉框传送到 body，使其在最顶层显示 -->
    <Teleport to="body">
      <div
        v-if="showDropdown && filteredFields.length > 0"
        class="db-autocomplete-dropdown-portal"
        :style="dropdownStyle"
        ref="dropdownRef"
      >
        <div class="autocomplete-dropdown-content">
          <div
            v-for="(field, index) in filteredFields"
            :key="field.name"
            class="autocomplete-item"
            :class="{ 'autocomplete-item-active': index === activeIndex }"
            @mousedown.prevent="selectField(field)"
            @mouseenter="activeIndex = index"
          >
            <span class="field-name">{{ field.name }}</span>
            <span class="field-type">{{ field.type }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import useIndexStore from '@/store/IndexStore';
import { useDataBrowseStore } from '@/store/components/DataBrowseStore';
import Field from '@/view/Field';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'enter'): void;
  (e: 'clear'): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<any>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const inputValue = ref(props.modelValue);
const showDropdown = ref(false);
const activeIndex = ref(-1);
const cursorPosition = ref(0);

// 下拉框位置
const dropdownPosition = ref({ top: 0, left: 0, width: 280 });

// 获取原生 input 元素
function getNativeInput(): HTMLInputElement | null {
  if (!inputRef.value) return null;
  // Arco Design Input 组件的内部 input 元素
  return inputRef.value.$el?.querySelector('input') ||
         inputRef.value.$el ||
         null;
}

// 更新光标位置
function updateCursorPosition() {
  const nativeInput = getNativeInput();
  if (nativeInput) {
    cursorPosition.value = nativeInput.selectionStart || (inputValue.value?.length || 0);
  } else {
    cursorPosition.value = inputValue.value?.length || 0;
  }
}

// 更新下拉框位置
function updateDropdownPosition() {
  const nativeInput = getNativeInput();
  if (!nativeInput) return;
  
  const rect = nativeInput.getBoundingClientRect();
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY + 4, // 输入框底部 + 滚动偏移 + 间距
    left: rect.left + window.scrollX,
    width: Math.max(rect.width, 280) // 至少 280px 宽度
  };
}

// 计算下拉框样式 - 使用固定定位在 body 层级
const dropdownStyle = computed(() => {
  return {
    position: 'fixed' as const,
    top: `${dropdownPosition.value.top}px`,
    left: `${dropdownPosition.value.left}px`,
    width: `${dropdownPosition.value.width}px`,
    zIndex: 9999
  };
});

// 监听窗口滚动和调整大小，更新下拉框位置
function handleWindowScroll() {
  if (showDropdown.value) {
    updateDropdownPosition();
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, true);
  window.addEventListener('resize', handleWindowScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll, true);
  window.removeEventListener('resize', handleWindowScroll);
});

// 获取当前索引的字段列表
const fields = computed<Field[]>(() => {
  const index = useDataBrowseStore().index;
  if (!index) return [];
  return useIndexStore().field(index);
});

// 获取当前输入位置的关键字
const currentKeyword = computed(() => {
  const value = inputValue.value || '';
  if (!value) return '';
  
  // 使用光标位置或整个字符串长度
  const len = value.length || 0;
  const pos = Math.min(cursorPosition.value || len, len);
  
  // 找到光标前的最后一个分隔符位置
  const beforeCursor = value.substring(0, pos);
  const lastComma = beforeCursor.lastIndexOf(',');
  const lastEquals = beforeCursor.lastIndexOf('=');
  const lastSpace = beforeCursor.lastIndexOf(' ');
  
  // 取最后一个分隔符的位置
  const lastSeparator = Math.max(lastComma, lastEquals, lastSpace);
  
  // 如果光标在等号后面，不显示字段建议
  if (lastEquals > lastComma && lastEquals > lastSpace) {
    return '';
  }
  
  // 获取当前正在输入的字段名
  const keyword = beforeCursor.substring(lastSeparator + 1).trim();
  return keyword;
});

// 过滤字段
const filteredFields = computed(() => {
  // 如果没有字段，不显示建议
  if (fields.value.length === 0) return [];
  
  const keyword = currentKeyword.value.toLowerCase();
  if (!keyword) {
    // 如果没有关键字但有焦点，返回前10个字段
    return fields.value.slice(0, 10);
  }
  
  return fields.value
    .filter(field => field.name.toLowerCase().includes(keyword))
    .slice(0, 10);
});

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue;
});

// 监听 inputValue 变化
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue);
});

// Arco Design Input 的 @input 事件传递的是值，不是事件对象
function handleInput(value: string | number) {
  // 同步更新 inputValue
  inputValue.value = String(value);
  
  // 等待 DOM 更新后获取光标位置
  nextTick(() => {
    updateCursorPosition();
    
    // 只要有字段数据就可以显示建议（即使没有输入关键字也显示）
    if (fields.value.length > 0) {
      const keyword = currentKeyword.value;
      // 如果有关键字，显示匹配的字段；如果没有关键字（刚输入逗号等），也显示建议
      if (keyword || inputValue.value === '') {
        showDropdown.value = true;
        activeIndex.value = 0;
      } else {
        // 检查是否刚完成一个字段值输入（等号后面）
        showDropdown.value = false;
      }
    } else {
      showDropdown.value = false;
    }
  });
}

function handleFocus() {
  nextTick(() => {
    updateCursorPosition();
    updateDropdownPosition(); // 聚焦时更新下拉框位置
    // 聚焦时，如果有字段就显示建议
    if (fields.value.length > 0) {
      showDropdown.value = true;
      activeIndex.value = 0;
    }
  });
}

function handleBlur() {
  // 延迟关闭，以便处理点击事件
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

function handleKeydown(e: KeyboardEvent) {
  // 更新光标位置
  nextTick(() => {
    updateCursorPosition();
  });
  
  if (!showDropdown.value || filteredFields.value.length === 0) {
    // 如果下拉框未显示，允许 Enter 键触发查询
    if (e.key === 'Enter') {
      emit('enter');
    }
    return;
  }
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % filteredFields.value.length;
      scrollToActiveItem();
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = activeIndex.value <= 0
        ? filteredFields.value.length - 1
        : activeIndex.value - 1;
      scrollToActiveItem();
      break;
    case 'Enter':
      if (activeIndex.value >= 0 && activeIndex.value < filteredFields.value.length) {
        e.preventDefault();
        selectField(filteredFields.value[activeIndex.value]);
      } else {
        emit('enter');
      }
      break;
    case 'Escape':
      e.preventDefault();
      showDropdown.value = false;
      break;
  }
}

function handleClear() {
  cursorPosition.value = 0;
  showDropdown.value = false;
  emit('clear');
}

function selectField(field: Field) {
  const value = inputValue.value || '';
  const pos = Math.min(cursorPosition.value, value.length);
  const beforeCursor = value.substring(0, pos);
  const afterCursor = value.substring(pos);
  
  // 找到当前正在输入的字段开始位置
  const lastComma = beforeCursor.lastIndexOf(',');
  const lastSpace = beforeCursor.lastIndexOf(' ');
  const lastSeparator = Math.max(lastComma, lastSpace);
  
  // 构建新的值
  const prefix = beforeCursor.substring(0, lastSeparator + 1);
  const suffix = afterCursor;
  
  // 插入字段名（不添加等号）
  const newValue = prefix + field.name + suffix;
  inputValue.value = newValue;
  
  // 更新光标位置
  const newCursorPos = prefix.length + field.name.length;
  cursorPosition.value = newCursorPos;
  
  // 关闭下拉框
  showDropdown.value = false;
  activeIndex.value = -1;
  
  // 聚焦并设置光标位置
  nextTick(() => {
    const nativeInput = getNativeInput();
    if (nativeInput) {
      nativeInput.focus();
      nativeInput.setSelectionRange(newCursorPos, newCursorPos);
    }
  });
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
.db-field-autocomplete {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  
  .autocomplete-input {
    width: 100%;
    height: 100%;
    
    .arco-input-wrapper {
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
      height: 100%;
      
      &:hover, &:focus-within {
        border: none !important;
        background: transparent !important;
      }
      
      .arco-input {
        padding: 0 4px;
        font-size: 13px;
        height: 100%;
        
        &::placeholder {
          color: var(--color-text-4);
          font-size: 13px;
        }
      }
      
      .arco-input-suffix {
        padding-right: 4px;
      }
    }
  }
}

// 下拉框样式 - 需要在全局作用域，因为使用了 Teleport 到 body
.db-autocomplete-dropdown-portal {
  max-height: 320px;
  background-color: var(--color-bg-1);
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  .autocomplete-dropdown-content {
    max-height: 320px;
    overflow-y: auto;
  }
  
  .autocomplete-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover,
    &.autocomplete-item-active {
      background-color: var(--color-fill-2);
    }
    
    .field-name {
      color: var(--color-text-1);
      font-weight: 500;
    }
    
    .field-type {
      color: var(--color-text-3);
      font-size: 12px;
      background-color: var(--color-fill-3);
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
}
</style>