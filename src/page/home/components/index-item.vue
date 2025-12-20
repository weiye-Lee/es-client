<template>
  <div class="home-index-card material-card" :class="{close: closed}">
    <!-- 标题 -->
    <div class="title items-center" :style="{maxWidth: maxWidth}">
      <t-link :theme="closed ? 'default' : 'primary'" size="large" @click="indexInfo()" class="!font-bold"
              :title="index.name">{{ index.name }}
      </t-link>
      <t-button shape="round" variant="dashed" size="small" @click="execCopy()" class="ml-8px">{{ $t('home.index_item.copy') }}</t-button>
    </div>
    <!-- 别名 -->
    <div class="alias">
      <t-tag theme="primary" :closable="!closed" @close="removeAlias(item)" variant="outline"
             v-for="(item, idx) in index.alias" :key="idx" style="margin-right: 8px">
        {{ item }}
      </t-tag>
      <t-button theme="primary" size="small" :disabled="closed" @click="newAlias()">{{ $t('home.index_item.add') }}
      </t-button>
    </div>
    <!-- 操作 -->
    <div class="option">
      <t-tooltip :effect="theme" :content="$t('home.index_item.migrate')" placement="bottom">
        <t-button variant="text" theme="primary" shape="square" :disabled="closed" @click="indexReindex(index.name)">
          <template #icon>
            <folder-move-icon/>
          </template>
        </t-button>
      </t-tooltip>
      <t-tooltip :effect="theme" :content="indexStateTooltip" placement="bottom">
        <t-popconfirm :content="$t('home.index_item.confirm_status', {status: indexStateTooltip})" @confirm="indexOperation"
                      :confirm-btn="indexStateTooltip">
          <t-button variant="text" shape="square" :theme="indexStateBtn">
            <template #icon>
              <pause-icon v-if="indexStateBtn === 'danger'"/>
              <play-icon v-else/>
            </template>
          </t-button>
        </t-popconfirm>
      </t-tooltip>
      <t-tooltip :effect="theme" :content="$t('home.index_item.delete')" placement="bottom">
        <t-button variant="text" theme="primary" :disabled="closed" shape="square" @click="removeIndex()">
          <template #icon>
            <delete-icon/>
          </template>
        </t-button>
      </t-tooltip>
    </div>
    <!-- 拓展面板按钮 -->
    <div class="expand-btn">
      <!-- 查询跳转 -->
      <div class="flex">
        <t-tooltip :effect="theme" :content="$t('home.index_item.jump_to_data_browser')" placement="bottom">
          <t-button theme="success" variant="text" :disabled="closed" shape="square" @click="jumpToDataBrowser()"
                    style="border: none">
            <template #icon>
              <table2-icon/>
            </template>
          </t-button>
        </t-tooltip>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {mapState} from "pinia";
import MessageUtil from "@/utils/model/MessageUtil";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import {useIndexStore, useUrlStore} from "@/store";
import {useGlobalStore} from "@/store/GlobalStore";
import {encodeValue, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import {useIndexManageEvent} from "@/global/BeanFactory";
import {indexReindex} from "@/page/home/components/IndexReindex";
import PageNameEnum from "@/enumeration/PageNameEnum";
import {copyText} from "@/utils/BrowserUtil";
import {indexAliasAdd} from "@/page/home/components/IndexAliasAdd";
import {
  AppIcon,
  DeleteIcon,
  FilterIcon,
  FolderMoveIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  Table2Icon
} from "tdesign-icons-vue-next";
import {IndexItem} from "$/elasticsearch-client";
import i18n from "@/i18n";

export default defineComponent({
  name: 'index-item',
  components: {
    FolderMoveIcon,
    Table2Icon, FilterIcon, SearchIcon, AppIcon, DeleteIcon, PlayIcon, PauseIcon
  },
  props: {
    index: {
      type: Object as PropType<IndexItem>,
      required: true,
    }
  },
  data: () => ({
    state: false,
    open: true,
  }),
  computed: {
    ...mapState(useGlobalStore, ['isDark', 'width']),
    maxWidth() {
      return (this.width.value - 210) + 'px'
    },
    indexStateBtn(): 'danger' | 'success' | 'primary' {
      if (this.index.state === 'open') {
        return 'danger';
      } else if (this.index.state === 'close') {
        return 'success';
      } else {
        return 'primary'
      }
    },
    closed() {
      return this.index.state === 'close';
    },

    indexStateTooltip(): string {
      if (this.index.state === 'open') {
        return this.$t('home.index_item.close');
      } else if (this.index.state === 'close') {
        return this.$t('home.index_item.open');
      } else {
        return this.$t('home.index_item.unknown_status')
      }
    },
    theme() {
      return this.isDark ? 'dark' : 'light';
    }
  },
  methods: {
    indexReindex,
    indexInfo() {
      useIndexManageEvent.emit(this.index.name);
    },
    newAlias() {
      const {client} = useUrlStore();
      if (!client) return MessageUtil.error(this.$t('home.index_item.select_link'));
      indexAliasAdd().then((value) => {
          client.indexAlias([{
            add: {
              index: this.index.name,
              alias: value
            }
          }]).then(res => {
            MessageUtil.success(res);
            // 刷新指定索引
            useIndexStore().refreshIndex(this.index.name);
          })
            .catch(e => MessageUtil.error(this.$t('home.index_item.new_alias_error'), e))
        }
      );
    },
    removeAlias(alias: string) {
      const {client} = useUrlStore();
      if (!client) return MessageUtil.error(this.$t('home.index_item.select_link'));
      MessageBoxUtil.confirm(this.$t('home.index_item.confirm_delete_alias'), this.$t('home.index_item.prompt'), {
        confirmButtonText: this.$t('home.index_item.confirm'),
        cancelButtonText: this.$t('home.index_item.cancel'),
      })
        .then(() => {
          client.indexAlias([{
            remove: {
              index: this.index.name,
              alias: alias
            }
          }])
            .then(res => {
              MessageUtil.success(res);
              useIndexStore().refreshIndex(this.index.name);
            })
            .catch(e => MessageUtil.error(this.$t('home.index_item.delete_alias_error'), e))
        })
        .catch(() => console.log('取消删除'));
    },
    removeIndex() {
      const {client} = useUrlStore();
      if (!client) return MessageUtil.error(this.$t('home.index_item.select_link'));
      MessageBoxUtil.confirm(this.$t('home.index_item.confirm_delete_index'), this.$t('home.index_item.prompt'), {
        confirmButtonText: this.$t('home.index_item.confirm'),
        cancelButtonText: this.$t('home.index_item.cancel')
      }).then(() => {
        client.deleteBatchIndex([this.index.name])
          .then(() => {
            MessageUtil.success(this.$t('home.index_item.delete_success'));
            useIndexStore().refreshIndex(this.index.name, true);
          })
          .catch(e => MessageUtil.error(this.$t('home.index_item.delete_index_error'), e))
      });
    },
    indexOperation() {
      if (this.index.state === 'open') {
        this.closeIndex();
      } else if (this.index.state === 'close') {
        this.openIndex();
      } else {
        MessageUtil.warning(this.$t('home.index_item.unknown_status_error'));
      }
    },
    openIndex() {
      const {client} = useUrlStore();
      if (!client) return MessageUtil.error(this.$t('home.index_item.select_link'));
      client.indexOpen(this.index.name)
        .then(res => {
          MessageUtil.success(res);
          useIndexStore().refreshIndex(this.index.name);
        })
        .catch(e => MessageUtil.error(this.$t('home.index_item.open_error'), e));
    },
    closeIndex() {
      const {client} = useUrlStore();
      if (!client) return MessageUtil.error(this.$t('home.index_item.select_link'));
      client.indexClose(this.index.name)
        .then((res) => {
          MessageUtil.success(res);
          useIndexStore().refreshIndex(this.index.name);
        })
        .catch(e => MessageUtil.error(this.$t('home.index_item.close_error'), e));
    },
    execCopy() {
      copyText(this.index.name);
      MessageUtil.success(this.$t('home.index_item.copy_success'));
    },
    jumpToDataBrowser() {
      if (this.index) {
        useDataBrowseStore().openTab(encodeValue("index", this.index.name), this.index.name);
        this.$router.push(PageNameEnum.DATA_BROWSE);
      }
    },
  }
});
</script>
<style lang="less">
.home-index-card {
  width: 100%;
  margin: 0;
  padding: 10px;
  border: var(--td-border-level-2-color) solid 1px;
  position: relative;
  min-width: 700px;
  border-left: 5px solid var(--td-brand-color);

  &.close {
    border-color: var(--td-text-color-placeholder);
  }

  .title {
    display: flex;
    height: 40px;

  }

  .alias {
    margin-top: 7px;
    flex-wrap: wrap;

  }

  .detail {
    margin-top: 14px;
    color: var(--td-text-color-primary);
  }

  .option {
    position: absolute;
    top: 8px;
    right: 12px;
    background-color: var(--td-bg-color-component);
    border-radius: var(--td-radius-medium);
  }

  .expand-btn {
    position: absolute;
    top: 48px;
    right: 12px;
  }

  .expand {
    margin-top: 10px;
    position: relative;


    .shard {
      border: #000000 solid 4px;
      background-color: aquamarine;
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 34px;
      margin: 4px;
      cursor: pointer;
    }

    .replica {
      border: #666666 solid 4px;
      background-color: #f2f2f2;
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 34px;
      margin: 4px;
      cursor: pointer;
    }

  }
}
</style>
