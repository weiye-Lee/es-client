<template>
  <div class="abs-8 overflow-auto" ref="dataBrowserLeft">
    <t-input placeholder="请输入关键字" clearable></t-input>
    <div class="absolute top-40px left-0 right-0 bottom-0 overflow-auto">
      <t-tree :data activable line :scroll="{
        rowHeight: 34,
        bufferSize: 10,
        threshold: 10,
        type: 'virtual'
      }" :height="height" :actived="actives">
        <template #label="{ node }">
          <div class="flex items-center w-full" @click="onClick(node)" @dblclick="onDbClick(node)">
            <div class="mr-8px">
              <folder-icon v-if="node.value.startsWith('folder-')"/>
              <file-icon v-else/>
            </div>
            <div>
              <div class="text-12px">{{ node.label }}</div>
            </div>
          </div>
        </template>
        <template #operations="{ node }">
          <t-button v-if="node.value === 'folder-view'" theme="primary" size="small" variant="text" shape="square"
                    :disabled="!urlId" @click="onAddView">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
          <t-button v-else-if="node.value === 'folder-query'" theme="primary" size="small" variant="text" shape="square"
                    :disabled="!urlId" @click="onAddQuery">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
          <t-button v-else-if="node.value.startsWith('view')" theme="danger" size="small" variant="text" shape="square"
                    :disabled="!urlId" @click="onRemoveView(node)">
            <template #icon>
              <delete-icon/>
            </template>
          </t-button>
          <div v-else-if="node.value.startsWith('query')" class="flex">
            <t-button theme="primary" size="small" variant="text" shape="square" :disabled="!urlId"
                      @click="onRenameQuery(node)">
              <template #icon>
                <edit-icon/>
              </template>
            </t-button>
            <t-button theme="danger" size="small" variant="text" shape="square" :disabled="!urlId"
                      @click="onRemoveQuery(node)">
              <template #icon>
                <delete-icon/>
              </template>
            </t-button>
          </div>
        </template>
      </t-tree>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {TreeNodeModel, TreeOptionData} from "tdesign-vue-next";
import {useIndexStore, useUrlStore} from "@/store";
import {AddIcon, DeleteIcon, EditIcon, FileIcon, FolderIcon} from "tdesign-icons-vue-next";
import {useDataBrowseStore} from "@/store/components/DataBrowseStore";
import {useDataBrowserViewStore} from "@/store/components/DataBrowserViewStore";
import {useDataBrowserQueryStore} from "@/store/components/DataBrowserQueryStore";

const dataBrowserLeftRef = useTemplateRef<HTMLDivElement>("dataBrowserLeft");

const elementSize = useElementSize(dataBrowserLeftRef);

const actives = useSessionStorage<Array<string>>("/home/data-browser/left/active-value", []);

const height = computed(() => elementSize.height.value - 40);

const index = computed(() => {
  const {list} = useIndexStore();
  return list.map(e => e.name).sort((a, b) => a.localeCompare(b, 'zh'));
});
const alias = computed(() => {
  const {list} = useIndexStore();
  return Array.from(new Set(list.flatMap(e => e.alias))).sort((a, b) => a.localeCompare(b, 'zh'));
});

const view = computed(() => useDataBrowserViewStore().views);
const query = computed(() => useDataBrowserQueryStore().query);
const data = computed<Array<TreeOptionData>>(() => ([
  {
    label: '索引',
    value: 'folder-index',
    children: index.value.map(e => ({
      label: e,
      value: `index-${e}`
    }))
  }, {
    label: '别名',
    value: 'folder-alias',
    children: alias.value.map(e => ({
      label: e,
      value: `alias-${e}`
    }))
  }, {
    label: '视图',
    value: 'folder-view',
    children: view.value.map(e => ({
      label: e.pattern,
      value: `view-${e.pattern}`,
      sourceId: e.id
    }))
  }, {
    label: '查询',
    value: 'folder-query',
    children: query.value.map(e => ({
      label: e.name,
      value: `query-${e.id}`
    }))
  }
]));
const urlId = computed(() => useUrlStore().id);

watch(() => useUrlStore().id, value => {
  useDataBrowserViewStore().init(value);
  useDataBrowserQueryStore().init(value);
}, {immediate: true});

function onClick(node: TreeNodeModel) {
  actives.value = [`${node.value}`];
}

function onDbClick(node: TreeNodeModel) {
  actives.value[0] = `${node.value}`;
  useDataBrowseStore().openTab(`${node.value}`, node.label || `${Date.now()}`);
}

function onAddView() {
  useDataBrowserViewStore().add();
}

function onRemoveView(node: TreeNodeModel) {
  useDataBrowserViewStore().remove(node.data.sourceId!, node.label!);
}

function onAddQuery() {
  useDataBrowserQueryStore().add();
}

function onRenameQuery(node: TreeNodeModel) {
  const {label, value} = node;
  const id = Number(`${value}`.split('-')[1]);
  useDataBrowserQueryStore().rename(id, label!);
}

function onRemoveQuery(node: TreeNodeModel) {
  const {label, value} = node;
  const id = Number(`${value}`.split('-')[1]);
  useDataBrowserQueryStore().remove(id, label!);
}

</script>
<style scoped lang="less"></style>
