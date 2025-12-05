import {defineStore} from "pinia";
import {getDefaultGlobalSetting, GlobalSetting} from "@/entity/setting/GlobalSetting";
// 工具类
import {contains} from "@/utils/ArrayUtil";
import Optional from "@/utils/Optional";
// 枚举
import ViewTypeEnum from "@/enumeration/ViewTypeEnum";
import {getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import LocalNameEnum from "@/enumeration/LocalNameEnum";
import {computed, ref} from "vue";

let lock = false;
let todo = false;

export const useGlobalSettingStore = defineStore('global-setting', () => {
  const globalSetting = ref<GlobalSetting>(getDefaultGlobalSetting());

  // Getters
  const getDefaultShard = computed(() => globalSetting.value.defaultShard);
  const getDefaultReplica = computed(() => globalSetting.value.defaultReplica);
  const getPageSize = computed((): number => globalSetting.value.pageSize);
  const getTimeout = computed((): number => Optional.ofNullable(globalSetting.value.timeout).orElse(5000));
  const getNotificationTime = computed((): number => Optional.ofNullable(globalSetting.value.notificationTime).orElse(5000));
  const getHomeSearchState = computed((): number => contains([0, 1, 2], globalSetting.value.homeSearchState) ? globalSetting.value.homeSearchState : 0);
  const getHomeExcludeIndices = computed((): Array<string> => Optional.ofNullable(globalSetting.value.homeExcludeIndices).orElse(new Array<string>()));
  const getHomeIncludeIndices = computed((): Array<string> => Optional.ofNullable(globalSetting.value.homeIncludeIndices).orElse(new Array<string>()));
  const pageSize = computed((): number => Optional.ofNullable(globalSetting.value.pageSize).orElse(20));
  const baseDefaultViewer = computed((): ViewTypeEnum => Optional.ofNullable(globalSetting.value.baseDefaultViewer).orElse(ViewTypeEnum.EDITOR));
  const seniorDefaultViewer = computed((): ViewTypeEnum => Optional.ofNullable(globalSetting.value.seniorDefaultViewer).orElse(ViewTypeEnum.EDITOR));
  const trackTotalHitsMode = computed(() => globalSetting.value.trackTotalHitsMode);
  const trackTotalHitsValue = computed(() => globalSetting.value.trackTotalHitsValue);

  // track_total_hits
  const trackTotalHits = computed(() => {
    if (globalSetting.value.trackTotalHitsMode === "custom") {
      return globalSetting.value.trackTotalHitsValue;
    } else {
      return globalSetting.value.trackTotalHitsMode === "true";
    }
  });

  const getLastUrl = computed((): boolean => globalSetting.value.lastUrl);

  // Actions
  async function init() {
    let globalSettingWrap = await getFromOneByAsync<GlobalSetting>(LocalNameEnum.SETTING_GLOBAL, getDefaultGlobalSetting());
    globalSetting.value = globalSettingWrap.record;
  }

  function setGlobalSetting(setting: GlobalSetting) {
    globalSetting.value = setting;
    sync();
  }

  function sync() {
    if (lock) {
      todo = true
      return;
    }
    lock = true
    saveOneByAsync(LocalNameEnum.SETTING_GLOBAL, globalSetting.value)
      .finally(() => {
        lock = false;
        if (todo) {
          todo = false;
          sync();
        }
      });
  }

  return {
    // State
    globalSetting,

    // Getters
    getDefaultShard,
    getDefaultReplica,
    getPageSize,
    getTimeout,
    getNotificationTime,
    getHomeSearchState,
    getHomeExcludeIndices,
    getHomeIncludeIndices,
    pageSize,
    baseDefaultViewer,
    seniorDefaultViewer,
    trackTotalHitsMode,
    trackTotalHitsValue,
    trackTotalHits,
    getLastUrl,

    // Actions
    init,
    setGlobalSetting,
  }
});