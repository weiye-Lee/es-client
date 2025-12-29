<template>
  <t-row class="condition">
    <t-col :span="3" class="condition-item">
      <div :class="must === '' ? 'disable' : ''" class="key">MUST</div>
      <db-field-autocomplete
        v-model="must"
        :index="index"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="should === '' ? 'disable' : ''" class="key">SHOULD</div>
      <db-field-autocomplete
        v-model="should"
        :index="index"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="mustNot === '' ? 'disable' : ''" class="key">MUST_NOT</div>
      <db-field-autocomplete
        v-model="mustNot"
        :index="index"
        placeholder="field1 = str,field2 term str"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
    <t-col :span="3" class="condition-item">
      <div :class="order === '' ? 'disable' : ''" class="key">ORDER</div>
      <db-field-autocomplete
        v-model="order"
        :index="index"
        placeholder="field1 asc,field2 desc"
        @enter="run()"
        @clear="run()"
      />
    </t-col>
  </t-row>
</template>
<script lang="ts" setup>
import { UseDataBrowserInstance } from "@/hooks";
import DbFieldAutocomplete from "@/page/data-browse/component/DbFieldAutocomplete.vue";

const props = defineProps({
  tab: {
    type: Object as PropType<UseDataBrowserInstance>,
    required: true
  }
});

const { run, must, mustNot, should, order, index } = props.tab as UseDataBrowserInstance;
</script>
<style scoped lang="less">
.condition {
  height: 35px;
  border-bottom: 1px solid var(--td-border-level-2-color);
}

.condition-item {
  display: flex;
  align-items: center;
  height: 100%;
  border-right: 1px solid var(--td-border-level-2-color);

  &:last-child {
    border-right: none;
  }

  .key {
    flex-shrink: 0;
    font-weight: bold;
    padding: 0 8px 0 6px;
    font-size: 12px;
    color: #ff92bb;
    user-select: none;
    
    &.disable {
      color: #787878;
    }
  }
  
  // 确保 DbFieldAutocomplete 占满剩余空间
  :deep(.db-field-autocomplete) {
    flex: 1;
    height: 100%;
    min-width: 0;
    
    .autocomplete-input {
      height: 100%;
      
      .arco-input-wrapper {
        height: 100%;
        border: none !important;
        background: transparent !important;
        
        .arco-input {
          height: 100%;
        }
      }
    }
  }
}
</style>
