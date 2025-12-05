<template>
  <t-tooltip :content="tip" placement="bottom">
    <t-button
      theme="primary"
      variant="text"
      shape="square"
      size="small"
      :disabled="disable"
      @click="click()"
    >
      <template #icon>
        <slot />
      </template>
    </t-button>
  </t-tooltip>
</template>
<script lang="ts">
export default defineComponent({
  name: "DbSimpleItem",
  props: {
    disable: {
      type: Boolean,
      required: false,
      default: false
    },
    tip: {
      type: String,
      required: false,
      default: ""
    }
  },
  emits: ["click"],
  data: () => ({}),
  methods: {
    click() {
      if (!this.disable) {
        this.$emit("click");
      }
    }
  }
});
</script>
<style scoped></style>
