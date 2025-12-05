<template>
  <div class="db-input">
    <input
      ref="inputRef"
      v-model="modelValue"
      class="db-input__inner"
      :placeholder="placeholder"
      @keydown.enter="onEnter"
    />
    <button v-if="showClear" class="db-input__clear" @click="clear">×</button>
  </div>
</template>
<script lang="ts" setup>
const modelValue = defineModel<string>({
  type: String,
  default: ""
});
defineProps({
  placeholder: String
});
const emit = defineEmits(["enter", "clear"]);

const inputRef = ref<HTMLInputElement | null>(null);
const showClear = computed(() => !!modelValue.value);

function onEnter() {
  emit("enter", modelValue.value);
}

function clear() {
  modelValue.value = "";
  emit("clear");
  // 重新聚焦到输入框
  inputRef.value?.focus();
}
</script>
<script lang="ts">
export default {
  name: "DbInput"
};
</script>
<style scoped lang="less">
.db-input {
  width: 100%;
  position: relative;
}

.db-input__inner {
  width: 100%;
  height: 32px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--td-text-color-primary);
  font-size: 14px;
  box-sizing: border-box;
  padding-right: 32px; // 为清空按钮预留空间
  padding-left: 8px;
}

.db-input__clear {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  line-height: 22px;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  color: var(--td-text-color-secondary);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.db-input__clear:hover {
  background-color: var(--td-bg-color-component);
  color: var(--td-text-color-primary);
}
</style>
