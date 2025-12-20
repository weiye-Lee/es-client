<template>
  <div class="flex gap-8px items-center">
    <t-tooltip :content="$t('module.base_search.show_query_condition')" position="bottom">
      <t-button theme="default" shape="square" @click="showBody()">
        <template #icon>
          <search-icon/>
        </template>
      </t-button>
    </t-tooltip>
  </div>
</template>
<script lang="ts" setup>
import MessageUtil from "@/utils/model/MessageUtil";
import {showJson} from "@/utils/model/DialogUtil";
import {SearchIcon} from "tdesign-icons-vue-next";
import {useUmami} from "@/plugins/umami";
import {BaseSearchInstanceResult} from "@/hooks";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const props = defineProps({
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});

const {buildData} = props.tab;

function showBody() {
  useUmami.track("func_base_search", "显示查询条件");
  try {
    showJson("查询条件", buildData());
  } catch (e) {
    MessageUtil.error(t('module.base_search.condition_construct_error'), e);
  }
}
</script>
<style scoped></style>
