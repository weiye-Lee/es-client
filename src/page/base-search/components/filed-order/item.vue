<template>
  <div class="flex gap-8px items-center">
    <!-- 是否启用 -->
    <t-switch v-model="order.isEnable">
      <template #label="slotProps">{{ slotProps.value ? $t('module.base_search.enable') : $t('module.base_search.disable') }}</template>
    </t-switch>
    <t-select
      v-model="order.field"
      filterable
      creatable
      clearable
      :placeholder="$t('module.base_search.sort_field_placeholder')"
      style="width: 250px"
      :options="fieldOptions"
    />
    <t-select v-model="order.type" filterable :placeholder="$t('module.base_search.sort_type_placeholder')" style="width: 80px">
      <t-option label="asc" value="asc"></t-option>
      <t-option label="desc" value="desc"></t-option>
    </t-select>
    <t-button theme="primary" shape="square" @click="add()">
      <template #icon>
        <plus-icon />
      </template>
    </t-button>
    <t-button theme="danger" shape="square" @click="remove(order.id)">
      <template #icon>
        <minus-icon />
      </template>
    </t-button>
    <t-button theme="success" shape="square" @click="search()">
      <template #icon>
        <search-icon />
      </template>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import { BaseSearchInstanceResult } from "@/hooks";
import { useIndexStore } from "@/store";
import { MinusIcon, PlusIcon, SearchIcon } from "tdesign-icons-vue-next";
import { BaseQueryOrder } from "$/elasticsearch-client";

const props = defineProps({
  modelValue: Object as PropType<BaseQueryOrder>,
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});
const emits = defineEmits(["update:modelValue", "add", "remove"]);

const order = ref<BaseQueryOrder>(
  props.modelValue
    ? props.modelValue
    : {
        id: new Date().getTime(),
        field: "",
        type: "asc",
        isEnable: true
      }
);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      order.value = value;
    }
  }
);
watch(
  () => order.value,
  (value) => {
    emits("update:modelValue", value);
  },
  { deep: true }
);

const fieldOptions = computed(() => {
  const { fieldOptionMap } = useIndexStore();
  return fieldOptionMap[props.tab.index.value] || [];
});

function add() {
  emits("add");
}

function remove(id: number) {
  emits("remove", id);
}

function search() {
  props.tab.run();
}
</script>
<style scoped></style>
