import {Alert, Input, DialogPlugin} from "tdesign-vue-next";
import AppLink from "@/components/AppLink/AppLink.vue";
import i18n from "@/i18n";

export function indexAliasAdd(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const name = ref('')
    const d = DialogPlugin.confirm({
      default: () => <div class="domain-prompt">
        <div>{i18n.global.t('home.index_alias.input_new_alias')}</div>
        <Input type="text" v-model={name.value} style={{marginTop: '8px'}}/>
        <Alert title={i18n.global.t('home.index_alias.not_enough')} style={{marginTop: '8px'}}>
          <span>⚙️ </span>
          <AppLink event="create-alias"/>
          <span>{i18n.global.t('home.index_alias.advanced_desc')}</span>
        </Alert>
      </div>,
      header: i18n.global.t('home.index_alias.prompt'),
      placement: "center",
      draggable: true,
      onConfirm: () => {
        resolve(name.value);
        d.destroy();
      },
      onCancel: () => {
        reject('cancel');
        d.destroy();
      },
      onClose: () => {
        reject('close');
        d.destroy();
      }
    })
  })
}
