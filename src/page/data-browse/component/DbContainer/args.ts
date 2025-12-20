import { VxeTableEvents, VxeTableInstance } from "vxe-table";
import type { Ref } from "vue";
import MessageUtil from "@/utils/model/MessageUtil";
import { execUpdate } from "@/page/data-browse/component/DbHeader/DbContextmenu";
import { UseDataBrowserInstance } from "@/hooks";
import {
  addCondition,
  addOrder,
  removeCondition,
  removeOrder
} from "@/utils/convert/data-browser-condition";
import { useUmami } from "@/plugins/umami";
import { formatJsonString } from '$/util'
import {copyText} from "@/utils/BrowserUtil";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import i18n from "@/i18n";
import {VxeTablePropTypes} from "vxe-table/types/all";

const t = (key: string) => i18n.global.t(key);

export function buildContextMenuClickEvent(
  instance: Ref<VxeTableInstance | null>,
  tab: UseDataBrowserInstance
): VxeTableEvents.MenuClick {
  return ({ menu, row, column }) => {
    const $table = instance.value;
    const field = column.field;
    useUmami.track("func_data_browser", "使用右键菜单");
    const { index, must, should, mustNot, order, update, remove, run } = tab;
    switch (menu.code) {
      case "copy":
        // 示例
        if (row && column) {
          copyText(row[column.field]);
          MessageUtil.info(t('module.data_browse.copy_to_clipboard'));
        }
        break;
      case "copy-row":
        if (row) {
          copyText(row._source);
          MessageUtil.info(t('module.data_browse.copy_to_clipboard'));
        }
        break;
      case "operation-edit":
        execUpdate(index, row["_id"], formatJsonString(row["_source"])).then(({ id, data }) =>
          update(id, data, row["_source"])
        );
        break;
      case "operation-delete":
        MessageBoxUtil.alert(t('module.data_browse.confirm_delete'), t('action.delete'), {
          confirmButtonText: t('action.confirm'),
        }).then(() => {
          remove(row["_id"], row["_source"]);
        })
        break;
      case "expand":
        if ($table) {
          $table.toggleRowExpand(row).then(() => console.log("切换行展收状态成功"));
        }
        break;
      case "must-clear": {
        must.value = removeCondition(must.value, field);
        run();
        break;
      }
      case "should-clear": {
        should.value = removeCondition(should.value, field);
        run();
        break;
      }
      case "must_not-clear": {
        mustNot.value = removeCondition(mustNot.value, field);
        run();
        break;
      }
      case "sort-clear": {
        order.value = removeOrder(order.value, field);
        run();
        break;
      }
      case "must-term": {
        must.value = addCondition(must.value, field, "term", row[field]);
        run();
        break;
      }
      case "must-match": {
        must.value = addCondition(must.value, field, "match", row[field]);
        run();
        break;
      }
      case "should-term": {
        should.value = addCondition(should.value, field, "term", row[field]);
        run();
        break;
      }
      case "should-match": {
        should.value = addCondition(should.value, field, "match", row[field]);
        run();
        break;
      }
      case "must_not-term": {
        mustNot.value = addCondition(mustNot.value, field, "term", row[field]);
        run();
        break;
      }
      case "must_not-match": {
        mustNot.value = addCondition(mustNot.value, field, "match", row[field]);
        run();
        break;
      }
      case "sort-asc": {
        order.value = addOrder(order.value, field, "asc");
        run();
        break;
      }
      case "sort-desc": {
        order.value = addOrder(order.value, field, "desc");
        run();
        break;
      }
      default:
        MessageUtil.info(`点击了 ${menu.name} 选项`);
    }
  };
}

export const menuConfig = (tab: UseDataBrowserInstance): VxeTablePropTypes.MenuConfig => {
  return {
    header: {
      options: [
        [
          {
            code: "must",
            name: "must",
            visible: true,
            disabled: false,
            children: [{code: "must-clear", name: "清除筛选", visible: true, disabled: false}]
          },
          {
            code: "should",
            name: "should",
            visible: true,
            disabled: false,
            children: [{code: "should-clear", name: "清除筛选", visible: true, disabled: false}]
          },
          {
            code: "must_not",
            name: "must not",
            visible: true,
            disabled: false,
            children: [{code: "must_not-clear", name: "清除筛选", visible: true, disabled: false}]
          },
          {
            code: "sort",
            name: "排序",
            visible: true,
            disabled: false,
            children: [
              {code: "sort-clear", name: "清除排序", visible: true, disabled: false},
              {code: "sort-asc", name: "升序", visible: true, disabled: false},
              {code: "sort-desc", name: "倒序", visible: true, disabled: false}
            ]
          }
        ]
      ]
    },
    body: {
      options: [
        [
          {code: "copy", name: "复制", prefixIcon: "vxe-icon-copy", visible: true},
          {code: "copy-row", name: "复制当前行", prefixIcon: "vxe-icon-copy", visible: true}
        ],
        [
          {code: "operation-edit", name: "编辑", prefixIcon: "vxe-icon-edit", visible: true},
          {code: "operation-delete", name: "删除", prefixIcon: "vxe-icon-delete", visible: true}
        ],
        [{code: "expand", name: "展开/收起当前行", visible: true}],
        [
          {
            code: "must",
            name: "must",
            visible: true,
            disabled: false,
            children: [
              {code: "must-clear", name: "清除筛选", visible: true, disabled: false},
              {code: "must-term", name: "term", visible: true, disabled: false},
              {code: "must-match", name: "match", visible: true, disabled: false}
            ]
          },
          {
            code: "should",
            name: "should",
            visible: true,
            disabled: false,
            children: [
              {code: "should-clear", name: "清除筛选", visible: true, disabled: false},
              {code: "should-term", name: "term", visible: true, disabled: false},
              {code: "should-match", name: "match", visible: true, disabled: false}
            ]
          },
          {
            code: "must_not",
            name: "must not",
            visible: true,
            disabled: false,
            children: [
              {code: "must_not-clear", name: "清除筛选", visible: true, disabled: false},
              {code: "must_not-term", name: "term", visible: true, disabled: false},
              {code: "must_not-match", name: "match", visible: true, disabled: false}
            ]
          },
          {
            code: "sort",
            name: "排序",
            visible: true,
            disabled: false,
            children: [
              {code: "sort-clear", name: "清除筛选", visible: true, disabled: false},
              {code: "sort-asc", name: "正序", visible: true, disabled: false},
              {code: "sort-desc", name: "倒序", visible: true, disabled: false}
            ]
          }
        ]
      ]
    }
  }
};

export const columnConfig: VxeTablePropTypes.ColumnConfig = {
  resizable: true,
};

export const rowConfig: VxeTablePropTypes.RowConfig = {
  keyField: "_id",
  isCurrent: true,
  isHover: true
};
