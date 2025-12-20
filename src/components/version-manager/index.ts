import LocalNameEnum from "@/enumeration/LocalNameEnum";
import {getItemByDefault, setItem} from "@/utils/utools/DbStorageUtil";
import {Constant} from "@/global/Constant";
import MessageUtil from "@/utils/model/MessageUtil";
import {updateTo3ByWeb} from "@/components/version-manager/updateTo3";
import {statistics} from "@/global/BeanFactory";
import {useLoading} from "@/hooks/UseLoading";
import i18n from "@/i18n";

const t = (key: string, named?: Record<string, unknown>) => i18n.global.t(key, named || {});

export enum VersionStatus {
  // 新用户
  NEW = 1,
  // 版本更新
  UPDATE = 2,
  // 最新版本
  NONE = 3
}

const OLD_KEY: string = 'es-client.version';

export function versionManager(): VersionStatus {
  const oldVersion = getItemByDefault(OLD_KEY, '');
  let version = getItemByDefault(LocalNameEnum.KEY_VERSION, '');
  if (version == '') {
    version = oldVersion;
  }
  if (version === '') {
    setItem(LocalNameEnum.KEY_VERSION, Constant.version);
    MessageUtil.success(t('module.version_manager.welcome'));
    updateTo();
    statistics.access("update", `新用户使用`);
    statistics.register();
    return VersionStatus.NEW;
  } else if (version != Constant.version) {
    setItem(LocalNameEnum.KEY_VERSION, Constant.version);
    MessageUtil.success(t('module.version_manager.welcome_update', { version: Constant.version }));
    updateTo();
    statistics.access("update", `从${version}更新到${Constant.version}`);
    statistics.login();
    return VersionStatus.UPDATE;
  } else {
    return VersionStatus.NONE;
  }


}


function updateTo() {
  if (Constant.sign === 300) {
    updateTo3();
  }
}

export function updateTo3() {
  const loading = useLoading(t('module.version_manager.migration'))
  updateTo3ByWeb().then(() => MessageUtil.success(t('module.version_manager.migration_success')))
    .catch(e => MessageUtil.error(t('module.version_manager.migration_failed'), e))
    .finally(() => loading.close());
}

