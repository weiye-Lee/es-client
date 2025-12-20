import { DrawerPlugin, Paragraph } from "tdesign-vue-next";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

export function openDbOperatorDoc() {
  DrawerPlugin({
    header: t('module.data_browse.doc_title'),
    placement: "right",
    size: "600px",
    footer: false,
    default: () => (
      <div class="p-4 space-y-4">
        <div class="text-lg font-bold">{t('module.data_browse.doc_overview')}</div>
        <Paragraph>
          {t('module.data_browse.doc_overview_content')}
        </Paragraph>

        <div class="text-lg font-bold">{t('module.data_browse.doc_condition_syntax')}</div>
        <Paragraph v-html={t('module.data_browse.doc_condition_syntax_content')} />

        <div class="text-lg font-bold">{t('module.data_browse.doc_must')}</div>
        <Paragraph v-html={t('module.data_browse.doc_must_content')} />

        <div class="text-lg font-bold">{t('module.data_browse.doc_should')}</div>
        <Paragraph v-html={t('module.data_browse.doc_should_content')} />

        <div class="text-lg font-bold">{t('module.data_browse.doc_must_not')}</div>
        <Paragraph v-html={t('module.data_browse.doc_must_not_content')} />

        <div class="text-lg font-bold">{t('module.data_browse.doc_order')}</div>
        <Paragraph v-html={t('module.data_browse.doc_order_content')} />

        <div class="text-lg font-bold">{t('module.data_browse.doc_operators')}</div>
        <div>
          <div class="font-bold">{t('module.data_browse.doc_operators_subtitle')}</div>
          <ul class="list-disc pl-4 space-y-2">
            <li v-html={t('module.data_browse.doc_operator_eq')} />
            <li v-html={t('module.data_browse.doc_operator_ne')} />
            <li v-html={t('module.data_browse.doc_operator_range')} />
            <li v-html={t('module.data_browse.doc_operator_like')} />
            <li v-html={t('module.data_browse.doc_operator_match')} />
            <li v-html={t('module.data_browse.doc_operator_term')} />
            <li v-html={t('module.data_browse.doc_operator_exists')} />
            <li v-html={t('module.data_browse.doc_operator_missing')} />
            <li v-html={t('module.data_browse.doc_operator_in')} />
          </ul>
          <Paragraph class="text-gray">
            {t('module.data_browse.doc_operator_tip')}
          </Paragraph>
        </div>

        <div class="text-lg font-bold">{t('module.data_browse.doc_example')}</div>
        <ul class="list-disc pl-4 space-y-2">
          <li>
            <span class="font-bold">MUST: </span>
            <code>status = 'success', amount &gt;= 100, active = true</code>
          </li>
          <li>
            <span class="font-bold">SHOULD: </span>
            <code>title match 'Elasticsearch', title match 'ES'</code>
          </li>
          <li>
            <span class="font-bold">MUST_NOT: </span>
            <code>level = 'debug'</code>
          </li>
          <li>
            <span class="font-bold">ORDER: </span>
            <code>@timestamp desc, level asc</code>
          </li>
        </ul>

        <div class="text-lg font-bold">{t('module.data_browse.doc_tips')}</div>
        <ul class="list-disc pl-4 space-y-2">
          <li v-html={t('module.data_browse.doc_tips_1')} />
          <li v-html={t('module.data_browse.doc_tips_2')} />
          <li v-html={t('module.data_browse.doc_tips_3')} />
        </ul>
      </div>
    )
  });
}
