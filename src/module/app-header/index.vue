<template>
  <a-layout-header id="header">
    <div class="left">
      <div class="logo" :title="name || 'ES-client'">
        {{ name || 'ES-client' }}
      </div>
      <!-- 索引服务器选择 -->
      <t-select v-model="urlId" placeholder="请选择链接" filterable clearable @change="selectUrl"
                class="url-select" :style="{width: width + 'px'}">
        <t-option v-for="url in urls" :key="url.id" :label="url.name" :value="url.id"/>
        <template #panel-bottom-content>
          <div class="select-panel-footer">
            <t-button theme="primary" variant="text" block @click="openAddLink()">
              新增链接
            </t-button>
          </div>
        </template>
      </t-select>
      <!-- 刷新按钮 -->
      <t-button theme="primary" class="refresh" @click="refresh()" :disabled="loading || !urlId || urlId === ''">刷新
      </t-button>
      <t-progress v-if="total_shards > 0" :percentage="Math.round(active_shards / total_shards * 100)"
                  :status="status" class="mt-9px w-220px ml-14px">
        <template #label>
          {{ active_shards }} / {{ total_shards }}
        </template>
      </t-progress>
    </div>
    <div class="right">
      <LinkExtend style="margin-right: 8px;"/>
      <!-- 系统通知 -->
      <SystemNotify/>
      <!-- 各种信息弹框 -->
      <app-info class-name="menu-item" :disabled="loading"/>
      <!-- 主题切换 -->
      <t-dropdown trigger="click">
        <t-button shape="square" variant="text" theme="primary">
          <template #icon>
            <sunny-icon v-if="mode === 'light'"/>
            <moon-icon v-else-if="mode === 'dark'"/>
            <fill-color-icon v-else/>
          </template>
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item @click="setMode('light')">
            <template #prefix-icon>
              <sunny-icon/>
            </template>
            日间
          </t-dropdown-item>
          <t-dropdown-item @click="setMode('dark')">
            <template #prefix-icon>
              <moon-icon/>
            </template>
            黑夜
          </t-dropdown-item>
          <t-dropdown-item @click="setMode('auto')">
            <template #prefix-icon>
              <fill-color-icon/>
            </template>
            跟随系统
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
      <!-- 版本 -->
      <t-dropdown @select="versionCommand" position="br">
        <t-button class="menu-item" variant="text" theme="primary" :disabled="loading" style="padding: 0 7px;">
          {{ Constant.version }}
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item @click="versionCommand('feedback')">
            <template #prefix-icon>
              <chat-message-icon/>
            </template>
            问题反馈
          </t-dropdown-item>
          <t-dropdown-item @click="versionCommand('log')">
            <template #prefix-icon>
              <chat-bubble-history-icon/>
            </template>
            更新日志
          </t-dropdown-item>
          <t-dropdown-item @click="versionCommand('repository')">
            <template #prefix-icon>
              <logo-github-icon/>
            </template>
            代码仓库
          </t-dropdown-item>
          <t-dropdown-item @click="versionCommand('about')">
            <template #prefix-icon>
              <InfoCircleIcon/>
            </template>
            关于
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
    <!-- 问题反馈 -->
    <t-dialog v-model:visible="feedbackDialog" header="问题反馈" placement="center" :close-on-overlay-click="false"
              render-to-body
              draggable unmount-on-close :footer="false">
      <feedback-module v-if="feedbackDialog"/>
    </t-dialog>
  </a-layout-header>
</template>
<script lang="ts" setup>
import {useRouter} from 'vue-router';
import Constant from '@/global/Constant';
// 枚举
import PageNameEnum from "@/enumeration/PageNameEnum";
import LocalNameEnum from '@/enumeration/LocalNameEnum';
// 组件
import FeedbackModule from "@/module/Feedback/index.vue";
import AppInfo from './app-info.vue';
// 引入状态管理
import {useIndexStore, useUrlStore} from "@/store";
import useLoadingStore from "@/store/LoadingStore";
import {useColorMode} from "@/hooks";
// 工具类
import Assert from "@/utils/Assert";
import {setItem} from '@/utils/utools/DbStorageUtil';
import {openAddLink} from "@/page/setting/pages/link/components/EditLink";
import {openUrl} from "@/utils/BrowserUtil";
import LinkExtend from "@/components/AppExtend/LinkExtend.vue";
import {
  ChatBubbleHistoryIcon,
  ChatMessageIcon,
  FillColorIcon,
  InfoCircleIcon,
  LogoGithubIcon,
  MoonIcon,
  SunnyIcon
} from "tdesign-icons-vue-next";

const router = useRouter();
const size = useWindowSize();

const urlId = ref<number | string | undefined>(useUrlStore().id);
const feedbackDialog = ref<boolean>(false);

const urls = computed(() => useUrlStore().urls);
const loading = computed(() => useLoadingStore().loading);
const {colorMode} = useColorMode();
const mode = computed(() => colorMode.value);
const name = computed(() => useIndexStore().name);
const status = computed(() => {
  const status = useIndexStore().status;
  if (status === 'yellow') {
    return 'warning';
  } else if (status === 'green') {
    return 'success';
  } else if (status === 'red') {
    return 'error';
  }
  return 'active';
});
const active_shards = computed(() => useIndexStore().active_shards);
const total_shards = computed(() => useIndexStore().total_shards);
const width = computed(() => size.width.value / 5);

watch(() => urlId.value, value => setItem(LocalNameEnum.KEY_LAST_URL, value));
watch(() => useUrlStore().id, value => {
  if (value !== urlId.value) {
    urlId.value = value;
  }
})

const refresh = () => useIndexStore().reset();

function setMode(m: 'light' | 'dark' | 'auto') {
  colorMode.value = m;
}

async function selectUrl(value: any) {
  // 清空链接
  if (value === '') {
    // 清空链接选择
    useUrlStore().clear();
    // 清空索引信息
    useIndexStore().clear();
    // 发哦送清空事件
    return
  }
  // 选择链接
  Assert.isTrue(useUrlStore().choose(value as number), "链接未找到");
  // 索引刷新
  await useIndexStore().reset();
}

function versionCommand(command: string) {
  switch (command) {
    case 'about':
      router.push(PageNameEnum.MORE_ABOUT)
      break;
    case 'log':
      router.push(PageNameEnum.MORE_UPDATE)
      break;
    case 'repository':
      openUrl(Constant.repositories[1].url)
      break;
    case 'update':
      alert('检查更新')
      break;
    case 'feedback':
      feedbackDialog.value = true;
      break;
  }
}

</script>
<style scoped>
.select-panel-footer {
  border-top: 1px solid var(--td-component-stroke);
  padding: 6px;
}
</style>
