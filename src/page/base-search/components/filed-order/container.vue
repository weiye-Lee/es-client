<template>
  <div class="file-orders-container">
    <div v-if="orders.length === 0">
      <t-button theme="primary" @click="add()"> {{ $t('module.base_search.add') }} </t-button>
    </div>
    <div
      v-for="(_order, idx) in orders"
      :key="_order.id"
      style="display: flex; margin-bottom: 10px; width: 100%"
    >
      <field-order-item v-model="orders[idx]" :tab @add="add" @remove="remove" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import FieldOrderItem from "./item.vue";
import { BaseSearchInstanceResult } from "@/hooks";

const props = defineProps({
  tab: {
    type: Object as PropType<BaseSearchInstanceResult>,
    required: true
  }
});

const { orders } = props.tab;

const add = () =>
  orders.value.push({
    id: new Date().getTime(),
    field: "",
    type: "asc",
    isEnable: true
  });

const remove = (id: number) => {
  if (orders.value.length === 0) {
    return;
  }
  orders.value = orders.value.filter((item) => {
    return item.id !== id;
  });
};
</script>
<style scoped></style>
