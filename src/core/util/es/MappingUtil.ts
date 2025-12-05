import {
  IndexMapping,
  IndexMappingFieldMapping,
  IndexMappingProperties
} from "$/shared/elasticsearch";
import { TableColumn } from "$/shared/common/TableColumn";
import { TableRecord } from "$/shared/common/TableRecord";
import { stringifyJsonWithBigIntSupport } from "$/util";

export interface MappingTableResult {
  dynamic?: boolean | "true" | "false" | "strict";
  name?: string;
  columns: Array<TableColumn>;
  data: Array<TableRecord>;
}

function propertyHandle(
  data: Array<TableRecord>,
  properties: IndexMappingProperties | IndexMappingFieldMapping,
  parentName: Array<string>
) {
  const keys = Object.keys(properties);
  for (const key of keys) {
    const record: TableRecord = {
      name: [...parentName, key].join(".")
    };
    const field = properties[key];

    Object.entries(field).map(([key, value]) => {
      if (key === "properties") return;
      if (key === "fields") return;
      if (key === "meta") {
        record.meta = value ? stringifyJsonWithBigIntSupport(value) : "";
      }
      record[key] = String(value);
    });

    if (field.properties) {
      record.type = "object";
      record.children = [];
      propertyHandle(record.children, field.properties, []);
    }
    if (field.fields) {
      // 子字段
      if (!record.children) record.children = [];
      propertyHandle(record.children, field.fields, [...parentName, key]);
    }

    data.push(record);
  }
}

export function mappingToTable(mapping: IndexMapping, name?: string): MappingTableResult {
  const result: MappingTableResult = {
    dynamic: mapping.dynamic,
    name,
    columns: [
      {
        field: "name",
        title: "字段名",
        width: 200,
        fixed: "left",
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "type",
        title: "字段类型",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "analyzer",
        title: "分词器",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "index",
        title: "索引",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "doc_values",
        title: "存储",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "meta",
        title: "元数据",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "copy_to",
        title: "复制到",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "similarity",
        title: "相似度",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "index_options",
        title: "索引选项",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "coerce",
        title: "强制转换",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      },
      {
        field: "scaling_factor",
        title: "缩放因子",
        width: 100,
        ellipsis: true,
        tooltip: true,
        sortable: {
          sortDirections: ["ascend", "descend"]
        },
        cellClass: "text-left",
        show: true
      }
    ],
    data: []
  };
  propertyHandle(result.data, mapping.properties, []);

  return result;
}
