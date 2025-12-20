import {Button, Link, Popconfirm, Space, Tag, TdPrimaryTableProps} from "tdesign-vue-next";
import { openUpdateLink } from "@/page/setting/pages/link/components/EditLink";
import MessageUtil from "@/utils/model/MessageUtil";
import {copyText} from "@/utils/BrowserUtil";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

export const linkTableColumn: TdPrimaryTableProps["columns"] = [
  {
    title: t('setting.name'),
    colKey: "name",
    width: 120,
    fixed: "left"
  },
  {
    title: t('setting.link'),
    colKey: "value",
    cell: (_h, { row }) => (
      <Link theme={"primary"}
        onClick={() => {
          copyText(row.value);
          MessageUtil.success(t('setting.copied'));
        }}
      >
        {row.value}
      </Link>
    )
  },
  {
    title: t('setting.platform'),
    colKey: "platform",
    cell: (_h, { row }) => (
      <Tag theme={"primary"}>{row.platform || 'elasticsearch'}</Tag>
    )
  },
  {
    title: t('setting.version'),
    colKey: "version"
  },
  {
    title: t('setting.auth'),
    colKey: "isAuth",
    width: 100,
    cell: (_h, { row }) => <div>{row.isAuth ? t('setting.yes') : t('setting.no')}</div>
  },
  {
    title: t('setting.operation'),
    colKey: "action",
    width: 170,
    fixed: "right",

    cell: (_h, { row }) => (
      <Space>
        <Button theme={"primary"} size={"small"} onClick={() => openUpdateLink(row as any)}>
          {t('setting.edit')}
        </Button>
        <Popconfirm confirmBtn={t('setting.delete')} content={t('setting.delete_confirm')}>
          <Button theme={"danger"} size={"small"}>{t('setting.delete')}</Button>
        </Popconfirm>
      </Space>
    )
  }
];
