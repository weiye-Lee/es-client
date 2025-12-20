import { DialogPlugin, Paragraph } from "tdesign-vue-next";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

export function showFieldType() {
  DialogPlugin({
    header: t('module.dashboard.field_type_analysis'),
    placement: "center",
    default: () => (
      <Paragraph>{t('module.dashboard.analysis_help')}</Paragraph>
    ),
    draggable: true,
    footer: false
  });
}

export function showAnalyzer() {
  DialogPlugin({
    header: t('module.dashboard.analyzer_analysis'),
    placement: "center",
    default: () => (
      <Paragraph>{t('module.dashboard.analysis_help')}</Paragraph>
    ),
    draggable: true,
    footer: false
  });
}
