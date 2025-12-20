<template>
  <t-badge :count="hasUnread ? 1 : 0" dot>
    <t-button variant="text" theme="primary" shape="square" @click="openDrawer">
      <template #icon>
        <notification-icon />
      </template>
    </t-button>
  </t-badge>

  <t-drawer
    v-model:visible="drawerVisible"
    :header="$t('module.system_notify.title')"
    size="500px"
    placement="right"
    :footer="false"
  >
      <t-list>
        <t-list-item v-for="a in pageItems" :key="a.id" @click="handleItemClick(a)" class="notification-item">
          <t-list-item-meta
            :title="renderTitle(a)"
            :description="a.description"
          />
          <div class="notification-item-footer">
            <span class="publish-date">{{ formatDate(a.published_at) }}</span>
            <t-tag v-if="isUnread(a.id)" theme="danger" size="small">{{ $t('module.system_notify.new') }}</t-tag>
          </div>
          <div class="notification-actions">
            <t-button v-if="isUnread(a.id)" size="small" @click.stop="markAsRead(a.id)">{{ $t('module.system_notify.mark_read') }}</t-button>
            <t-button v-if="a.link" theme="primary" size="small" @click.stop="openLink(a)">{{ $t('module.system_notify.open_link') }}</t-button>
          </div>
        </t-list-item>
      </t-list>

      <div class="pagination-wrapper" v-if="total > limit">
        <t-pagination
          :total="total"
          :page-size="limit"
          :current="currentPage"
          @current-change="handlePageChange"
          size="small"
        />
      </div>
  </t-drawer>
</template>

<script lang="tsx" setup>
import {Button, NotifyPlugin} from 'tdesign-vue-next';
import {AnnouncementResponse, getAnnouncements} from './AnnouncementApi';
import {Announcement} from './AnnouncementTypes';
import {openUrl} from "@/utils/BrowserUtil";
import {NotificationIcon} from "tdesign-icons-vue-next";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const drawerVisible = ref(false);
const currentPage = ref(1);
const offset = ref(0);
const limit = ref(10);
const total = ref(0);
const rawItems = ref<Announcement[]>([]);
const readAnnouncementIds = useLocalStorage<string[]>('readAnnouncementIds', []);
const readSet = computed(() => new Set(readAnnouncementIds.value));
const hasUnread = ref(false);
const firstPageNotified = ref(false);
const lastNotifiedId = useLocalStorage<string | null>('announcementLastNotifiedId', null);
const scanning = ref(false);

const visibleItems = computed(() => rawItems.value.filter(a => !isExpired(a)));
const sortedItems = computed(() => [...visibleItems.value].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()));
const pageItems = computed(() => sortedItems.value);

const isExpired = (a: Announcement) => {
  if (!a.expires_at) return false;
  return new Date() >= new Date(a.expires_at);
};

const isUnread = (id: string) => !readSet.value.has(id);

const formatDate = (s: string) => new Date(s).toLocaleString('zh-CN');

const markAsRead = (id: string) => {
  if (!readSet.value.has(id)) {
    readAnnouncementIds.value = [...readAnnouncementIds.value, id];
  }
  recomputeUnreadBadge();
  scanForUnreadAcrossPages();
};

const handleItemClick = (a: Announcement) => {
  markAsRead(a.id);
  if (a.link) {
    openUrl(a.link);
  }
};

const openLink = (a: Announcement) => {
  markAsRead(a.id);
  openUrl(a.link!);
};

const openDrawer = () => {
  drawerVisible.value = true;
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  offset.value = (page - 1) * limit.value;
  await fetchPage();
};

const fetchPage = async () => {
  const r: AnnouncementResponse = await getAnnouncements(offset.value, limit.value);
  if (r && r.success) {
    rawItems.value = r.data.announcements;
    total.value = r.data.count;
    recomputeUnreadBadge();
    if (currentPage.value === 1) maybeNotifyOnce();
    if (currentPage.value === 1) await scanForUnreadAcrossPages();
  }
};

const recomputeUnreadBadge = () => {
  hasUnread.value = sortedItems.value.some(a => isUnread(a.id));
};

const maybeNotifyOnce = () => {
  if (firstPageNotified.value) return;
  const unread = sortedItems.value.filter(a => isUnread(a.id));
  if (unread.length === 0) {
    firstPageNotified.value = true;
    return;
  }
  const latest = unread[0];
  const within7Days = (new Date().getTime() - new Date(latest.published_at).getTime()) <= 7 * 24 * 60 * 60 * 1000;
  if (within7Days) {
    let notif: any;
    notif = NotifyPlugin.info({
      title: latest.title,
      default: () => (
        <div>
          <div style="margin-bottom:8px;">{latest.description ?? latest.title}</div>
          <div>
            <Button size="small" onClick={() => { markAsRead(latest.id); notif?.close?.(); }}>{t('module.system_notify.close')}</Button>
            {latest.link && (
              <Button theme="primary" size="small" style="margin-left:8px" onClick={() => {
                markAsRead(latest.id);
                window.open(latest.link as string, '_blank');
                notif?.close?.();
              }}>{t('module.system_notify.view')}</Button>
            )}
          </div>
        </div>
      ),
      placement: 'top-right',
      closeBtn: false,
      duration: 3600000
    });
    lastNotifiedId.value = latest.id;
  }
  firstPageNotified.value = true;
};

const scanForUnreadAcrossPages = async () => {
  if (scanning.value) return;
  scanning.value = true;
  try {
    let foundUnread = sortedItems.value.some(a => isUnread(a.id));
    const pages = Math.ceil(total.value / limit.value);
    if (!foundUnread) {
      for (let p = 2; p <= pages; p++) {
        const r: AnnouncementResponse = await getAnnouncements((p - 1) * limit.value, limit.value);
        if (r && r.success) {
          const list = r.data.announcements.filter(a => !isExpired(a));
          const unreadExists = list.some(a => !readSet.value.has(a.id));
          if (unreadExists) {
            foundUnread = true;
            break;
          }
        } else {
          break;
        }
      }
    }
    hasUnread.value = foundUnread;
  } finally {
    scanning.value = false;
  }
};

const renderTitle = (a: Announcement) => isUnread(a.id) ? `${t('module.system_notify.unread_prefix')}${a.title}` : a.title;

onMounted(() => {
  fetchPage();
});
</script>

<style scoped lang="less">
.notification-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.notification-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.publish-date {
  font-size: 12px;
  color: #888;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.notification-item {
  cursor: pointer;
}
</style>
