<template>
  <div class="about">
    <div class="header-section">
      <h1 class="main-title">{{ $t('more.about.title') }}</h1>
      <div class="version-info">
        <t-tag theme="primary">{{ $t('more.about.version', { version: data.version }) }}</t-tag>
        <t-tag theme="success" class="build-tag">{{ $t('more.about.build', { build: data.build }) }}</t-tag>
      </div>
    </div>

    <!-- 专业版推广卡片 -->
    <div class="feature-card professional-card">
      <div class="card-content">
        <h2 class="card-title">{{ $t('more.about.pro_title') }}</h2>
        <p class="card-description">
          {{ $t('more.about.pro_desc') }}
        </p>
        <ul class="feature-list">
          <li>{{ $t('more.about.pro_feature_1') }}</li>
          <li>{{ $t('more.about.pro_feature_2') }}</li>
          <li>{{ $t('more.about.pro_feature_3') }}</li>
          <li>{{ $t('more.about.pro_feature_4') }}</li>
        </ul>
        <t-button theme="primary" @click="open(data.url.price)" class="download-btn">
          {{ $t('more.about.pro_btn') }}
        </t-button>
      </div>
    </div>

    <!-- 功能介绍卡片 -->
    <div class="info-cards">
      <div class="feature-card">
        <div class="card-content">
          <h2 class="card-title">{{ $t('more.about.help_title') }}</h2>
          <p class="card-description">
            {{ $t('more.about.help_desc') }}
          </p>
          <t-button @click="open(data.doc.index)" variant="outline" theme="primary" class="action-btn">
            {{ $t('more.about.help_btn') }}
          </t-button>
        </div>
      </div>

      <div class="feature-card">
        <div class="card-content">
          <h2 class="card-title">{{ $t('more.about.feedback_title') }}</h2>
          <p class="card-description">
            {{ $t('more.about.feedback_desc') }}
          </p>
          <div class="feedback-actions">
            <t-button @click="open(data.url.feedback)" variant="outline" theme="primary" class="action-btn">
              {{ $t('more.about.feedback_btn') }}
            </t-button>
            <t-button @click="open('mailto:' + data.email)" variant="outline" theme="primary" class="action-btn">
              {{ $t('more.about.email_btn') }}
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 社区互动 -->
    <div class="feature-card community-card">
      <div class="card-content">
        <h2 class="card-title">{{ $t('more.about.community_title') }}</h2>
        <p class="card-description">
          {{ $t('more.about.community_desc') }}
        </p>
        <div class="community-links">
          <template v-for="(repository, index) in data.repositories" :key="index">
            <t-link theme="primary" target="_blank" @click="open(repository.url)">{{ repository.name }}</t-link>
            <span v-if="index < data.repositories.length - 1" class="separator">|</span>
          </template>
        </div>
        <t-button @click="licenseDialog = true" variant="outline" theme="primary" class="license-btn">
          {{ $t('more.about.license_btn') }}
        </t-button>
      </div>
    </div>

    <!-- 相关资源 -->
    <div class="resources-section">
      <h2 class="section-title">{{ $t('more.about.resources_title') }}</h2>
      <div class="resource-list">
        <div class="community-links">
          <template v-for="(url, name, index) in data.distributes" :key="name">
            <t-link theme="primary" target="_blank" @click="open(url)">{{ name }}</t-link>
            <span v-if="index < Object.keys(data.distributes).length - 1" class="separator">|</span>
          </template>
        </div>
      </div>
    </div>

    <t-dialog :header="$t('more.about.license_dialog_title')" v-model:visible="licenseDialog" placement="center"
              :close-on-overlay-click="false" width="800px" :footer="false">
      <div class="license-content">
        <license-apache2_0/>
      </div>
    </t-dialog>
  </div>
</template>

<script lang="ts">
import {Constant} from "@/global/Constant";
import LicenseApache2_0 from "@/components/License/Apache2_0.vue";
import {openUrl} from "@/utils/BrowserUtil";
import { defineComponent } from 'vue';

export default defineComponent({
  name: "setting-about",
  components: {LicenseApache2_0},
  data: () => ({
    data: Constant,
    licenseDialog: false,
  }),
  methods: {
    open(url: string) {
      openUrl(url);
    }
  }
});
</script>

<style lang="less" scoped>
.about {
  margin: 20px auto;
  max-width: 800px;
  padding: 0 20px;

  .header-section {
    text-align: center;
    margin-bottom: 30px;

    .main-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 20px;
      color: var(--td-text-color-primary);
    }

    .version-info {
      display: flex;
      justify-content: center;
      gap: 15px;

      .build-tag {
        margin-left: 0;
      }
    }
  }

  .feature-card {
    background: var(--td-bg-color-component);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 24px;
    margin-bottom: 20px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .card-content {
      .card-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--td-text-color-secondary);
      }

      .card-description {
        color: var(--td-text-color-secondary);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 20px 0;

        li {
          padding: 6px 0 6px 20px;
          position: relative;
          color: #4e5969;

          &::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--td-success-color);
            font-weight: bold;
          }
        }
      }

      .download-btn, .action-btn {
        margin-top: 10px;
      }

      .feedback-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .action-btn {
          flex: 1;
          min-width: 120px;
        }
      }

      .community-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin: 10px 0;

        .separator {
          color: var(--td-text-color-primary);
        }
      }

      .license-btn {
        margin-top: 15px;
      }
    }
  }

  .professional-card {
    border: 1px solid var(--td-border-level-2-color);
    background: linear-gradient(120deg, var(--td-brand-color-3) 0%, var(--td-brand-color-5) 100%);

    .card-title {
      color: var(--td-success-color);
    }
  }

  .community-card {
    .card-title {
      color: var(--td-warning-color);
    }
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .resources-section, .feedback-section {
    background: var(--td-bg-color-component);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 24px;
    margin-bottom: 20px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--td-text-color-primary);
    }

    .resource-list {
      color: var(--td-text-color-secondary);
      line-height: 1.6;

      .separator {
        margin: 0 8px;
        color: var(--td-border-level-2-color);
      }
    }
  }

  .license-content {
    height: calc(80vh - 60px - 54px);
  }
}
</style>
