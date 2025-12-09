<template>
  <div class="home-index-card">
    <!-- 标题 -->
    <div class="title items-center" :style="{maxWidth: maxWidth}">
      <t-link theme="primary" size="large" @click="indexInfo()"
              :title="index.name">{{ index.name }}
      </t-link>
      <t-button shape="round" variant="dashed" size="small" @click="execCopy(index.name)" class="ml-8px">复制</t-button>
    </div>
    <!-- 别名 -->
    <div class="alias">
      <t-space v-if="index.alias && index.alias.length > 0" size="small" class="mr-8px">
        <div class="arco-tag arco-tag-size-medium arco-tag-blue arco-tag-checked"
             v-for="(item, idx) in index.alias" :key="idx">
          {{ item }}
          <icon-close :size="16" @click="removeAlias(item)" class="alias-close"/>
        </div>
      </t-space>
      <t-button theme="primary" size="small" @click="newAlias()">新增
      </t-button>
    </div>
    <!-- 操作 -->
    <div class="option">
      <t-tooltip :effect="theme" content="迁移索引" placement="bottom">
        <t-button variant="text" theme="primary" shape="square" @click="indexReindex(index.name)">
          <template #icon>
            <git-branch-icon/>
          </template>
        </t-button>
      </t-tooltip>
      <t-tooltip :effect="theme" :content="indexStateTooltip" placement="bottom">
        <t-popconfirm :content="`确认${indexStateTooltip}索引？`" @confirm="indexOperation"
                      :confirm-btn="indexStateTooltip">
          <t-button variant="text" shape="square" :theme="indexStateBtn">
            <template #icon>
              <pause-icon v-if="indexStateBtn === 'danger'"/>
              <play-icon v-else/>
            </template>
          </t-button>
        </t-popconfirm>
      </t-tooltip>
      <t-tooltip :effect="theme" content="删除索引" placement="bottom">
        <t-button variant="text" theme="primary" shape="square" @click="removeIndex()">
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
        <t-tooltip :effect="theme" content="跳转到数据浏览" placement="bottom">
          <t-button theme="success" variant="text" shape="square" @click="jumpToDataBrowser()" style="border: none">
            <template #icon>
              <table2-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip :effect="theme" content="跳转到基础查询" placement="bottom">
          <t-button theme="success" variant="text" shape="square" @click="jumpToBaseSearch()" style="border: none">
            <template #icon>
              <search-icon/>
            </template>
          </t-button>
        </t-tooltip>
        <t-tooltip :effect="theme" content="跳转到高级查询" placement="bottom">
          <t-button theme="success" variant="text" shape="square" @click="jumpToSeniorSearch()" style="border: none">
            <template #icon>
              <filter-icon/>
            </template>
          </t-button>
        </t-tooltip>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {mapState} from "pinia";
import IndexApi from '@/components/es/IndexApi'
import {getDefaultDocumentSearchQueryStr} from "@/domain/es/DocumentSearchQuery";
import BaseOrder from "@/entity/BaseOrder";
import {BaseQuery} from "@/entity/BaseQuery";
import MessageUtil from "@/utils/model/MessageUtil";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import Optional from "@/utils/Optional";
import {useIndexStore} from "@/store";
import {useGlobalStore} from "@/store/GlobalStore";
import {encodeValue, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import {baseSearchLoadEvent} from "@/store/components/BaseSearchStore";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import IndexView from "@/view/index/IndexView";
import {useIndexManageEvent} from "@/global/BeanFactory";
import {indexReindex} from "@/page/home/components/IndexReindex";
import PageNameEnum from "@/enumeration/PageNameEnum";
import {stringifyJsonWithBigIntSupport} from "$/util";
import {copyText} from "@/utils/BrowserUtil";
import {indexAliasAdd} from "@/page/home/components/IndexAliasAdd";
import {
  AppIcon,
  DeleteIcon,
  FilterIcon,
  GitBranchIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  Table2Icon
} from "tdesign-icons-vue-next";

export default defineComponent({
  name: 'index-item',
  components: {Table2Icon, FilterIcon, SearchIcon, AppIcon, DeleteIcon, PlayIcon, PauseIcon, GitBranchIcon},
  props: {
    index: {
      type: Object as PropType<IndexView>,
      required: false,
      default: {}
    }
  },
  data: () => ({
    state: false,
    open: true,
  }),
  computed: {
    ...mapState(useGlobalStore, ['isDark', 'width']),
    maxWidth() {
      return (this.width - 210) + 'px'
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

    indexStateTooltip(): string {
      if (this.index.state === 'open') {
        return '关闭';
      } else if (this.index.state === 'close') {
        return '打开';
      } else {
        return '未知状态'
      }
    },
    indexStateTitle(): 'gray' | '' {
      if (this.index.state === 'close') {
        return 'gray';
      } else {
        return ''
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
      indexAliasAdd().then((value) => IndexApi(this.index.name!).newAlias(value)
        .then(res => MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset))
        .catch(e => MessageUtil.error('新建别名错误', e)));
    },
    removeAlias(alias: string) {
      MessageBoxUtil.confirm("此操作将永久删除该别名, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => IndexApi(this.index.name!).removeAlias(alias)
          .then(res => {
            MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset);
          })
          .catch(e => MessageUtil.error('删除别名错误', e)))
        .catch(() => console.log('取消删除'));
    },
    removeIndex() {
      MessageBoxUtil.confirm("此操作将永久删除该索引, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(() => IndexApi(this.index.name!).delete()
        .then(res => MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset))
        .catch(e => MessageUtil.error('索引删除错误', e)));
    },
    indexOperation() {
      if (this.index.state === 'open') {
        this.closeIndex();
      } else if (this.index.state === 'close') {
        this.openIndex();
      } else {
        MessageUtil.warning(`未知索引状态【${this.index.state}】，无法完成操作`);
      }
    },
    openIndex() {
      IndexApi(this.index.name!)._open()
        .then(res => MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset))
        .catch(e => MessageUtil.error('打开索引失败', e));
    },
    closeIndex() {
      IndexApi(this.index.name!)._close()
        .then((res: any) => MessageUtil.success(stringifyJsonWithBigIntSupport(res), this.reset))
        .catch(e => MessageUtil.error('关闭索引失败', e));
    },
    reset() {
      useIndexStore().reset();
    },
    execCopy(url?: string) {
      copyText(Optional.ofNullable(url).orElse(''));
      MessageUtil.success("已成功复制到剪切板");
    },
    jumpToBaseSearch() {
      if (this.index) {
        baseSearchLoadEvent({
          index: this.index.name,
          conditions: new Array<BaseQuery>(),
          orders: new Array<BaseOrder>(),
          execute: true
        }, this.$router)
      }
    },
    jumpToDataBrowser() {
      if (this.index) {
        useDataBrowseStore().openTab(encodeValue("index", this.index.name), this.index.name);
        this.$router.push(PageNameEnum.DATA_BROWSE);
      }
    },
    jumpToSeniorSearch() {
      if (this.index) {
        useSeniorSearchStore().loadEvent({
          link: `/${this.index.name}/_search`,
          method: 'POST',
          body: getDefaultDocumentSearchQueryStr()
        }, false);
        this.$router.push(PageNameEnum.SENIOR_SEARCH);
      }
    }
  }
});
</script>
<style lang="less">
.home-index-card {
  margin: 0;
  padding: 10px;
  border: var(--color-border-2) solid 1px;
  border-radius: 2px;
  position: relative;
  min-width: 700px;


  .title {
    display: flex;
    height: 40px;

    .index-item-title {
      font-size: 24px;
      font-weight: bold;

      padding: 1px 4px;
      color: rgb(var(--link-6));
      line-height: 1.5715;
      text-decoration: none;
      background-color: transparent;
      border-radius: var(--border-radius-small);
      cursor: pointer;
      transition: all .1s cubic-bezier(0, 0, 1, 1);

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        color: rgb(var(--link-6));
        background-color: var(--color-fill-2);
      }
    }

    .arco-btn {
      margin: 6px;
    }

  }

  .alias {
    margin-top: 7px;
    flex-wrap: wrap;

    .alias-close {
      margin-left: 4px;
      padding: 2px;

      &:hover {
        background-color: var(--color-fill-3);
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }

  .detail {
    margin-top: 14px;
    color: var(--color-text-1);
  }

  .option {
    position: absolute;
    top: 8px;
    right: 12px;
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
