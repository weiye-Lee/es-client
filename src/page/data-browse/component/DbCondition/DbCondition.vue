<template>
  <t-row class="condition">
    <t-col :span="3" class="condition-item">
      <div :class="must === '' ? 'disable' : ''" class="key">MUST</div>
      <db-input
        v-model="must"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="should === '' ? 'disable' : ''" class="key">SHOULD</div>
      <db-input
        v-model="should"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="mustNot === '' ? 'disable' : ''" class="key">MUST_NOT</div>
      <db-input
        v-model="mustNot"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="order === '' ? 'disable' : ''" class="key">ORDER</div>
      <db-input
        v-model="order"
        placeholder="field1 asc,field2 desc"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
  </t-row>
</template>
<script lang="ts" setup>
import { UseDataBrowserInstance } from "@/hooks";
import DbInput from "@/page/data-browse/component/DbInput.vue";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { run, must, mustNot, should, order } = props.tab as UseDataBrowserInstance;
</script>
<style scoped lang="less">
.condition-item {
  display: flex;
  line-height: 32px;
  border-right: 1px solid var(--td-border-level-2-color);

  &:last-child {
    border-right: none;
  }

  .key {
    font-weight: bold;
    padding-left: 6px;
  }
}
</style>
