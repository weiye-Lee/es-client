import {TreeNodeModel} from "tdesign-vue-next";
import {AddIcon, CopyIcon, DeleteIcon, HighlightIcon} from "tdesign-icons-vue-next";
import Cxt, {type MenuItem} from "@imengyu/vue3-context-menu";
import {useGlobalStore} from "@/store/GlobalStore";
import {copyText} from "@/utils/BrowserUtil";
import {decodeValue, useDataBrowseStore} from "@/store/components/DataBrowseStore";
import {useDataBrowserViewStore} from "@/store/components/DataBrowserViewStore";
import {useDataBrowserQueryStore} from "@/store/components/DataBrowserQueryStore";
import MessageUtil from "@/utils/model/MessageUtil";
import {useUrlStore} from "@/store";

export function openContextmenu(node: TreeNodeModel, e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();
  const {empty} = useUrlStore();
  if (empty) return;
  const {isDark} = useGlobalStore();
  const items: MenuItem[] = [];
  const {type, id} = decodeValue(`${node.value}`);
  switch (type) {
    case "folder":
      switch (id) {
        case "view":
          items.push({
            label: '新建视图',
            icon: () => <AddIcon/>,
            onClick: () => useDataBrowserViewStore().add()
          });
          break;
        case "query":
          items.push({
            label: '新建查询',
            icon: () => <AddIcon/>,
            onClick: () => useDataBrowserQueryStore().add()
          });
      }
      break;
    case "view":
    case "query":
      items.push({
        label: "重命名",
        icon: () => <HighlightIcon/>,
        onClick: () => {
          if (type === 'view') {
            MessageUtil.error("暂不支持重命名视图");
          } else {
            useDataBrowserQueryStore().rename(id, node.label!).catch(e => MessageUtil.error("重命名失败", e));
          }
        }
      }, {
        label: '删除',
        icon: () => <DeleteIcon/>,
        onClick: () => {
          if (type === 'view') {
            useDataBrowserViewStore().remove(id, node.label!).catch(e => MessageUtil.error("删除失败", e));
          } else {
            useDataBrowserQueryStore().remove(id, node.label!).catch(e => MessageUtil.error("删除失败", e));
          }
        }
      });
    case "index":
    case "alias":
      if (type === "index" || type === "alias") {
        items.unshift({
          label: '复制名称',
          icon: () => <CopyIcon/>,
          onClick: () => {
            node.label && copyText(node.label)
          }
        });
      }
      items.unshift({
        label: "打开",
        icon: () => <HighlightIcon/>,
        onClick: () => {
          useDataBrowseStore().openTab(`${node.value}`, node.label || `${Date.now()}`);
        }
      });
      break;
  }
  if (items.length === 0) return;
  Cxt.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark ? 'mac dark' : 'mac',
    items: items
  })
}