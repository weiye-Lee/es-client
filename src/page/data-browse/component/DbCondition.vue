<template>
  <div class="condition">
    <a-split :default-size="0.5" :min="0" :max="1">
      <template #first>
        <a-split :default-size="0.5" :min="0" :max="1">
          <template #first>
            <div class="condition-item">
              <div :class="must === '' ? 'disable' : ''" class="key">MUST</div>
              <db-field-autocomplete
                v-model="must"
                placeholder="field1='str',field2=num"
                @enter="executeQuery()"
                @clear="clear()"
              />
            </div>
          </template>
          <template #second>
            <div class="condition-item">
              <div :class="should === '' ? 'disable' : ''" class="key">SHOULD</div>
              <db-field-autocomplete
                v-model="should"
                placeholder="field1='str',field2=num"
                @enter="executeQuery()"
                @clear="clear()"
              />
            </div>
          </template>
        </a-split>
      </template>
      <template #second>
        <a-split :default-size="0.5" :min="0" :max="1">
          <template #first>
            <div class="condition-item">
              <div :class="mustNot === '' ? 'disable' : ''" class="key">MUST_NOT</div>
              <db-field-autocomplete
                v-model="mustNot"
                placeholder="field1='str',field2=num"
                @enter="executeQuery()"
                @clear="clear()"
              />
            </div>
          </template>
          <template #second>
            <div class="condition-item">
              <div :class="orderBy === '' ? 'disable' : ''" class="key">ORDER</div>
              <db-field-autocomplete
                v-model="orderBy"
                placeholder="field1 asc,field2 desc"
                @enter="executeQuery()"
                @clear="clear()"
              />
            </div>
          </template>
        </a-split>
      </template>
    </a-split>
  </div>
</template>
<script lang="ts" setup>
import {useDataBrowseStore} from "@/store/components/DataBrowseStore";
// import {useDbConditionStore} from "@/page/data-browse/store/DbConditionStore";
import DbFieldAutocomplete from "@/page/data-browse/component/DbFieldAutocomplete.vue";

// const {must, should, mustNot, orderBy} = useDbConditionStore()

const must = ref('');
const should = ref('');
const mustNot = ref('');
const orderBy = ref('');

// const executeQuery = () => useDataBrowseStore().executeQuery(false);
// const clear = () => nextTick(() => useDataBrowseStore().executeQuery(false));

const executeQuery = () => {};
const clear = () => {};


</script>
<style scoped></style>
