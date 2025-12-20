<template>
  <div class="px-16px">
    <t-typography-title level="h1" align="center">{{ t('more.privacy.title') }}</t-typography-title>

    <t-typography-paragraph>{{ t('more.privacy.update_date') }}</t-typography-paragraph>

    <t-typography-paragraph>{{ t('more.privacy.effective_date') }}</t-typography-paragraph>

    <t-typography-title level="h3">{{ t('more.privacy.introduction_title') }}</t-typography-title>

    <t-typography-paragraph>
      {{ t('more.privacy.introduction_content') }}
    </t-typography-paragraph>

    <t-typography-paragraph>
      {{ t('more.privacy.introduction_agreement') }}
    </t-typography-paragraph>

    <t-typography-title level="h3">{{ t('more.privacy.collect_title') }}</t-typography-title>

    <t-typography-paragraph>
      {{ t('more.privacy.collect_intro') }}
    </t-typography-paragraph>

    <t-typography-paragraph>
      <ul>
        <li>{{ t('more.privacy.collect_time') }}</li>
        <li>{{ t('more.privacy.collect_platform') }}</li>
        <li>{{ t('more.privacy.collect_os') }}</li>
        <li>{{ t('more.privacy.collect_es_version') }}</li>
        <li>{{ t('more.privacy.collect_plugin_usage') }}</li>
      </ul>
    </t-typography-paragraph>

    <t-typography-title level="h3">{{ t('more.privacy.storage_title') }}</t-typography-title>

    <t-typography-paragraph>
      {{ t('more.privacy.storage_content') }}
    </t-typography-paragraph>

  </div>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<style scoped>

</style>
