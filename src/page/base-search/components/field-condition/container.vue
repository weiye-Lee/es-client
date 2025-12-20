<template>
  <div class="field-condition-container">
    <div v-if="query.length === 0">
      <t-button theme="primary" @click="add()">{{ $t('module.base_search.add') }}</t-button>
    </div>
    <div v-for="(_item, idx) in query" :key="_item.id" style="margin-bottom: 10px">
      <field-condition-item
        v-model="query[idx]"
        :index="idx"
        :tab="tab"
        @add="add"
        @remove="remove"
        @edit-text-area="editTextArea"
      />
    </div>
    <t-dialog
      v-model:visible="condition.dialog"
      :header="$t('module.base_search.terms_condition_input')"
      placement="center"
      :footer="false"
    >
      <monaco-editor
        v-if="condition.dialog"
        v-model="query[condition.index].value"
        language="json"
        height="200px"
      />
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import FieldConditionItem from "./item.vue";
import MonacoEditor from "@/components/monaco-editor/index.vue";
import { BaseSearchInstanceResult } from "@/hooks";

const props = defineProps({
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});

const { query } = props.tab;

const condition = ref({
  dialog: false,
  index: 0
});

function add() {
  query.value.push({
    id: new Date().getTime(),
    type: "must",
    field: "",
    condition: "term",
    value: "",
    isEnable: true
  });
}

function remove(id: number) {
  if (query.value.length === 0) {
    return;
  }
  query.value.splice(
    query.value.findIndex((item) => item.id === id),
    1
  );
}

function editTextArea(index: number) {
  condition.value.dialog = true;
  condition.value.index = index;
}
</script>
<style scoped>
.field-condition-container {
  display: block;
}
</style>
