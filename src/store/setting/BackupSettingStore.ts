import {defineStore} from "pinia";
import BackupSetting, {getDefaultBackupSetting} from "@/entity/setting/BackupSetting";
import {getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import LocalNameEnum from "@/enumeration/LocalNameEnum";
import {ref} from "vue";

export const useBackupSettingStore = defineStore('backup-setting', () => {
  const backupSetting = ref<BackupSetting>(getDefaultBackupSetting());

  // Getters
  const getUrl = () => backupSetting.value.url;
  const getUsername = () => backupSetting.value.username;
  const getPassword = () => backupSetting.value.password;

  // Actions
  async function init() {
    const res = await getFromOneByAsync<BackupSetting>(LocalNameEnum.SETTING_BACKUP, getDefaultBackupSetting());
    backupSetting.value = res.record;
  }

  async function save(setting: BackupSetting) {
    backupSetting.value = setting;
    await saveOneByAsync(LocalNameEnum.SETTING_BACKUP, setting);
  }

  return {
    backupSetting,
    getUrl,
    getUsername,
    getPassword,
    init,
    save
  };
});