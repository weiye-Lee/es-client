<template>
  <t-loading :loading="loading">
    <div style="overflow-x: hidden" class="mt-8px">
      <t-form :data="config">
        <t-form-item :label="$t('module.dashboard.index')">
          <t-select v-model="config.index" clearable filterable :options="indices"/>
        </t-form-item>
        <t-form-item :label="$t('module.dashboard.field')">
          <t-select v-model="config.field" clearable filterable creatable :options="fields"/>
        </t-form-item>
        <t-form-item :label="$t('module.dashboard.analyze_string')">
          <t-input v-model="config.text" allow-clear :placeholder="$t('module.dashboard.input_analyze_string')"/>
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" :disabled="disabled" @click="exec()">{{ $t('module.dashboard.start_analyze') }}</t-button>
            <t-button theme="primary" :disabled="disabled" variant="text" @click="jumpTo()"
            >{{ $t('module.dashboard.jump_to_dev_tool') }}
            </t-button
            >
          </t-space>
        </t-form-item>
      </t-form>
      <t-table :columns :data="tokens" class="mt-8px"/>
    </div>
  </t-loading>
</template>
<script lang="ts" setup>
import {useIndexStore, useUrlStore} from "@/store";
import {Token} from "$/elasticsearch-client/domain/Analyze";
import MessageUtil from "@/utils/model/MessageUtil";
import {showJson} from "@/utils/model/DialogUtil";
import {stringifyJsonWithBigIntSupport} from "$/util";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const config = ref({
  index: "",
  field: "",
  text: ""
});
const tokens = ref<Array<Token>>(new Array<Token>());
const loading = ref(false);

const columns = [
  {
    title: "token",
    colKey: "token"
  },
  {
    title: "position",
    colKey: "position"
  },
  {
    title: "start_offset",
    colKey: "start_offset"
  },
  {
    title: "end_offset",
    colKey: "end_offset"
  },
  {
    title: "type",
    colKey: "type"
  }
];

const indices = computed(() => useIndexStore().indexOptions);
const fields = computed(() => useIndexStore().fieldOptionMap[config.value.index]);
const disabled = computed(() => config.value.index === "" || config.value.field === "");

function exec() {
  tokens.value = [];
  loading.value = true;
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(t('placeholder.select_link'));
  client.indexAnalyze(config.value.index, config.value.field, config.value.text)
    .then((rsp) => (tokens.value = rsp.tokens))
    .catch((e) => MessageUtil.error(t('module.dashboard.execute_failed'), e))
    .finally(() => (loading.value = false));
}

function jumpTo() {
  showJson(
    t('module.dashboard.query_statement'),
    stringifyJsonWithBigIntSupport({
      method: "POST",
      link: `/${config.value.index}/_analyze`,
      body: `{
    "field": "${config.value.field}",
    "text": "${config.value.text}"
}`
    })
  );
}
</script>
<style scoped></style>
