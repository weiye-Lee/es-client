/**
 * 备份设置
 */
export default interface BackupSetting {

    url: string;

    username: string;

    password: string;

}

export function getDefaultBackupSetting(): BackupSetting {
    return {
        url: '',
        username: '',
        password: ''
    };
}
