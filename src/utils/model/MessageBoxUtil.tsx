import { DialogPlugin, Input, Paragraph } from "tdesign-vue-next";
import i18n from "@/i18n";

export default {
  confirm(
    content: string,
    title: string,
    config?: Partial<{
      confirmButtonText: string;
      cancelButtonText: string;
    }>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const p = DialogPlugin({
        default: content,
        header: title,
        draggable: true,
        placement: "center",
        confirmBtn: {
          default: config?.confirmButtonText || ""
        },
        cancelBtn: {
          default: config?.cancelButtonText || ""
        },
        onConfirm: () => {
          p.destroy();
          resolve();
        },
        onCancel: () => {
          p.destroy();
          reject("cancel");
        },
        onClose: () => {
          p.destroy();
          reject("close");
        }
      });
    });
  },

  alert(
    content: string,
    title?: string,
    config?: {
      confirmButtonText?: string;
      cancelButtonText?: string;
    }
  ) {
    const { confirmButtonText = i18n.global.t('utils.dialog.confirm'), cancelButtonText = i18n.global.t('utils.dialog.cancel') } = config || {};
    return new Promise<void>((resolve) => {
      const res = DialogPlugin({
        default: () => <Paragraph>{content}</Paragraph>,
        top: "auto",
        header: title,
        draggable: true,
        placement: "center",
        confirmBtn: {
          default: confirmButtonText
        },
        cancelBtn: {
          default: cancelButtonText
        },
        onConfirm: () => {
          resolve();
          res.destroy();
        },
        onCancel() {
          res.destroy();
        },
        onClose() {
          res.destroy();
        }
      });
    });
  },

  prompt(
    content: string,
    title?: string,
    config?: {
      confirmButtonText?: string;
      cancelButtonText?: string;
      inputPattern?: RegExp;
      inputErrorMessage?: string;
      inputValue?: string;
      onClose?: () => void;
    }
  ): Promise<string> {
    const {
      inputValue = "",
      confirmButtonText = i18n.global.t('utils.dialog.confirm'),
      cancelButtonText = i18n.global.t('utils.dialog.cancel'),
      onClose
    } = config || {};
    return new Promise<string>((resolve, reject) => {
      const value = ref(inputValue);

      function onKeydown(val: string | number) {
        resolve(`${val}`);
        res.destroy();
      }

      const res = DialogPlugin({
        default: () => (
          <div>
            <Paragraph>{content}</Paragraph>
            <Input
              autofocus={true}
              v-model={value.value}
              clearable={true}
              onEnter={onKeydown}
            ></Input>
          </div>
        ),
        header: title,
        draggable: true,
        placement: "center",
        confirmBtn: {
          default: confirmButtonText
        },
        cancelBtn: {
          default: cancelButtonText
        },
        onConfirm: () => {
          resolve(value.value);
          res.destroy();
        },
        onCancel() {
          res.destroy();
          reject("cancel");
        },
        onClose() {
          res.destroy();
          onClose && onClose();
          console.log("onClose");
          reject("cancel");
        }
      });
    });
  }
};
