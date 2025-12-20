import {
  Button,
  DialogPlugin,
  Form,
  FormItem,
  Input,
  LoadingPlugin,
  Radio,
  RadioButton,
  RadioGroup,
  Space,
  Switch
} from "tdesign-vue-next";
import {getDefaultUrl, Url} from "@/entity/Url";
import "./EditLink.less";
import {useUrlStore} from "@/store";
import MessageUtil from "@/utils/model/MessageUtil";
import {cloneDeep} from "es-toolkit";
import NotificationUtil from "@/utils/model/NotificationUtil";
import {buildEsRequestConfig, useRequestJson} from "@/plugins/native/axios";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

export function openAddLink() {
  const link = ref(getDefaultUrl());

  function submit() {
    if (!link.value.name) {
      MessageUtil.error(t('setting.name_required'));
      return;
    }
    if (!link.value.value) {
      MessageUtil.error(t('setting.link_required'));
      return;
    }
    if (!link.value.version) {
      MessageUtil.error(t('setting.test_first'));
      return;
    }

    useUrlStore()
      .add(cloneDeep(link.value))
      .then(() => {
        MessageUtil.success(t('setting.add_success'));
        modalReturn.destroy();
      })
      .catch((e) => MessageUtil.error(t('setting.add_failed'), e));
  }

  const modalReturn = DialogPlugin({
    header: t('setting.add_link'),
    placement: "center",
    draggable: true,
    default: () => buildForm(link),
    footer: () => buildFooter(link, 0, submit)
  });
}

export function openUpdateLink(record: Url) {
  const link = ref(cloneDeep({...record, platform: record.platform || "elasticsearch"}));

  function submit() {
    useUrlStore()
      .update(record.id, cloneDeep(link.value))
      .then(() => {
        MessageUtil.success(t('setting.update_success'));
        modalReturn.destroy();
      })
      .catch((e) => MessageUtil.error(t('setting.update_failed'), e));
  }

  const modalReturn = DialogPlugin({
    header: t('setting.add_link'),
    placement: "center",
    draggable: true,
    default: () => buildForm(link),
    footer: () => buildFooter(link, record.id, submit)
  });
}

function buildForm(link: Ref<Url>) {
  const authUser = computed(() => {
    if (link.value.authType === 1) {
      return t('setting.username');
    } else if (link.value.authType === 2) {
      return t('setting.header_key');
    } else {
      return "";
    }
  });
  const authPassword = computed(() => {
    if (link.value.authType === 2) {
      return t('setting.header_value');
    } else if (link.value.authType === 3) {
      return t('setting.cookie_value');
    } else {
      return t('setting.password');
    }
  });

  return (
    <Form data={link.value} layout={"vertical"}>
      <FormItem label={t('setting.name')} labelAlign={"top"}>
        <Input v-model={link.value.name} clearable/>
      </FormItem>
      <FormItem label={t('setting.link')} labelAlign={"top"}>
        {{
          default: () => <Input v-model={link.value.value} clearable/>,
          help: () =>
            link.value.value.endsWith("/") && (
              <span style={{color: "rgb(var(--danger-6))"}}>
                {t('setting.slash_warning')}
              </span>
            )
        }}
      </FormItem>
      <FormItem label={t('setting.platform')} labelAlign={"top"}>
        <RadioGroup variant="primary-filled" v-model={link.value.platform} defaultValue={"elasticsearch"}>
          <RadioButton value={"elasticsearch"}>elasticsearch</RadioButton>
          <RadioButton value={"opensearch"} disabled>
            opensearch
          </RadioButton>
          <RadioButton value={"easysearch"} disabled>
            easysearch
          </RadioButton>
        </RadioGroup>
      </FormItem>
      <FormItem label={t('setting.version')} labelAlign={"top"}>
        <Input v-model={link.value.version} readonly/>
      </FormItem>
      <FormItem label={t('setting.is_auth')} labelAlign={"top"}>
        <Switch v-model={link.value.isAuth}/>
      </FormItem>
      {link.value.isAuth && (
        <>
          <FormItem label={t('setting.auth_type')} labelAlign={"top"}>
            <RadioGroup v-model={link.value.authType}>
              <Radio value={1}>{t('setting.basic_auth')}</Radio>
              <Radio value={2}>{t('setting.header_auth')}</Radio>
              <Radio value={3}>{t('setting.cookie_auth')}</Radio>
            </RadioGroup>
          </FormItem>
          {link.value.authType !== 3 && (
            <FormItem label={authUser.value} labelAlign={"top"}>
              <Input v-model={link.value.authUser} clearable/>
            </FormItem>
          )}
          <FormItem label={authPassword.value} labelAlign={"top"}>
            <Input type={"password"} v-model={link.value.authPassword}/>
          </FormItem>
        </>
      )}
    </Form>
  );
}

function buildFooter(link: Ref<Url>, id: number, submit: () => void) {
  const loading = ref(false);

  function test() {
    if (loading.value) return;
    loading.value = true;
    const lp = LoadingPlugin({content: t('setting.loading')});
    useRequestJson("/", buildEsRequestConfig({}, cloneDeep(link.value)))
      .then((response) => {
        link.value.version = `${response.version.number}`;
        NotificationUtil.success(
          () => (
            <div>
              <div>{t('setting.name')}：{response.name.name}</div>
              <div>{t('setting.version')}：{response.version.number}</div>
              <div>Lucene {t('setting.version')}：{response.version.lucene_version}</div>
            </div>
          ),
          t('setting.test_success')
        );
      })
      .catch((e) => {
        NotificationUtil.error(`${t('setting.link_unavailable')}: ${e}`, t('setting.test_failed'));
      })
      .finally(() => {
        loading.value = false;
        lp.hide();
      });
  }

  return (
    <Space>
      <Button variant={"outline"} onClick={test}>
        {t('setting.test')}
      </Button>
      <Button theme={"primary"} onClick={submit}>
        {id === 0 ? t('setting.add') : t('setting.update')}
      </Button>
    </Space>
  );
}
