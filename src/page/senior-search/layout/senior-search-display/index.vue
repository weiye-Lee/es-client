<template>
  <div class="senior-search-display material-card">
    <div class="view">
      <!-- 结果集渲染 -->
      <senior-search-data-view v-show="displayActive === 'result'" :view="seniorSearchView" :data="show" :error="error"/>
      <!-- 请求记录 -->
      <display-record v-show="displayActive === 'record'"/>
      <!-- 历史记录 -->
      <display-history v-show="displayActive === 'history'"/>
      <!-- 快捷命令 -->
      <ss-display-quick v-if="displayActive === 'quick'"/>
    </div>
    <div class="tabs">
      <a-button type="text" @click="fullscreen = !fullscreen">
        <template #icon>
          <fullscreen-exit-icon v-if="fullscreen"/>
          <fullscreen-icon v-else/>
        </template>
      </a-button>
      <div class="tab" :class="displayActive === 'result' ? 'active' : ''" @click="displayActive = 'result'">
        结果
      </div>
      <div class="tab" :class="displayActive === 'record' ? 'active' : ''" @click="displayActive = 'record'">
        请求记录
      </div>
      <div class="tab" :class="displayActive === 'history' ? 'active' : ''" @click="displayActive = 'history'">
        历史记录
      </div>
      <div class="tab" :class="displayActive === 'quick' ? 'active' : ''" @click="displayActive = 'quick'">
        快捷命令
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import DisplayRecord from "@/page/senior-search/layout/senior-search-display/display-record.vue";
import SeniorSearchDataView from '@/page/senior-search/layout/senior-search-display/DataView.vue'
import DisplayHistory from "@/page/senior-search/layout/senior-search-display/display-history.vue";
import {useSeniorShowResultEvent} from "@/global/BeanFactory";
import SsDisplayQuick from "@/page/senior-search/layout/senior-search-display/SsDisplayQuick.vue";
import {useGlobalSettingStore} from "@/store";
import {FullscreenExitIcon, FullscreenIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  fullscreen: Boolean
});
const emits = defineEmits(['update:fullscreen']);


const displayActive = ref('result');
const fullscreen = ref(false);

const show = computed(() => useSeniorSearchStore().show);
const error = computed(() => useSeniorSearchStore().error);
const seniorSearchView = computed(() => useGlobalSettingStore().seniorDefaultViewer);

watch(() => fullscreen.value, value => emits('update:fullscreen', value));
watch(() => props.fullscreen, value => fullscreen.value = value);

useSeniorShowResultEvent.reset();
useSeniorShowResultEvent.on(() => displayActive.value = 'result');


</script>
<style scoped lang="less">
.senior-search-display {
  height: calc(100vh - 118px);
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 32px;
  overflow: hidden;

  .view {
    position: relative;
    padding: 0 4px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .tabs {
    width: 32px;
    display: block;

    .tab {
      writing-mode: vertical-lr;
      width: 32px;
      margin: 5px 0;
      cursor: pointer;
      padding: 8px 6px;

      &.active {
        background-color: var(--td-bg-color-container-active);
      }

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
  }
}
</style>
