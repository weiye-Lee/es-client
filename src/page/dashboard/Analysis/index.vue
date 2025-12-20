<template>
  <div class="abs-07">
    <t-tabs v-model="activeKey" hide-content>
      <t-tab-panel :value="ActiveKey.FIELD_TYPE" :label="$t('module.dashboard.field_type')" />
      <t-tab-panel :value="ActiveKey.ANALYZER" :label="$t('module.dashboard.analyzer')" disabled />
      <template #action>
        <t-button variant="text" theme="primary" @click="action()">
          <template #icon>
            <questionnaire-icon />
          </template>
        </t-button>
      </template>
    </t-tabs>
    <div class="container-47">
      <da-field-type v-show="activeKey === ActiveKey.FIELD_TYPE" />
      <da-analyzer v-show="activeKey === ActiveKey.ANALYZER" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { QuestionnaireIcon } from "tdesign-icons-vue-next";
import DaFieldType from "@/page/dashboard/Analysis/DaFieldType.vue";
import DaAnalyzer from "@/page/dashboard/Analysis/DaAnalyzer.vue";
import { showAnalyzer, showFieldType } from "@/page/dashboard/Analysis/ShowQuestion";

enum ActiveKey {
  FIELD_TYPE = "field type",
  ANALYZER = "analyzer"
}

const activeKey = ref(ActiveKey.FIELD_TYPE);

function action() {
  if (activeKey.value === ActiveKey.ANALYZER) {
    showAnalyzer();
  } else if (activeKey.value == ActiveKey.FIELD_TYPE) {
    showFieldType();
  }
}
</script>
<style scoped></style>
