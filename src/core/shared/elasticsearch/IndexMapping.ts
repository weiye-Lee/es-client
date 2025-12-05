// 支持的字段类型（不完全列举）
type FieldType =
  | "text"
  | "keyword"
  | "long"
  | "integer"
  | "short"
  | "byte"
  | "double"
  | "float"
  | "half_float"
  | "scaled_float"
  | "boolean"
  | "date"
  | "date_nanos"
  | "binary"
  | "object"
  | "nested"
  | "geo_point"
  | "geo_shape"
  | "ip"
  | "completion"
  | "token_count"
  | "dense_vector"
  | "sparse_vector"
  | "alias"
  | "constant_keyword"
  | "wildcard";

// 通用字段属性
interface BaseField {
  type: FieldType;
  index?: boolean;
  store?: boolean;
  doc_values?: boolean;
  copy_to?: string | string[];
  meta?: Record<string, any>;
  fields?: Record<string, IndexMappingFieldMapping>; // multi-fields
}

// text 类型特有
interface TextField extends BaseField {
  type: "text";
  analyzer?: string;
  search_analyzer?: string;
  search_quote_analyzer?: string;
  term_vector?:
    | "no"
    | "yes"
    | "with_offsets"
    | "with_positions"
    | "with_positions_offsets"
    | "with_positions_offsets_payloads";
  norms?: boolean;
  fielddata?: boolean;
  eager_global_ordinals?: boolean;
  index_options?: "docs" | "freqs" | "positions" | "offsets";
  similarity?: string; // e.g., "BM25"
}

// keyword 类型特有
interface KeywordField extends BaseField {
  type: "keyword";
  ignore_above?: number;
  normalizer?: string;
  split_queries_on_whitespace?: boolean;
  eager_global_ordinals?: boolean;
}

// date 类型
interface DateField extends BaseField {
  type: "date" | "date_nanos";
  format?: string;
  locale?: string;
}

// numeric 类型
interface NumericField extends BaseField {
  type: "long" | "integer" | "short" | "byte" | "double" | "float" | "half_float";
  coerce?: boolean;
  scaling_factor?: number; // only for scaled_float
}

// scaled_float 是特例
interface ScaledFloatField extends BaseField {
  type: "scaled_float";
  scaling_factor: number; // required
  coerce?: boolean;
}

// dense_vector
interface DenseVectorField extends Omit<BaseField, "index"> {
  type: "dense_vector";
  dims: number;
  index?:
    | boolean
    | {
        type: "hnsw" | "int8_hnsw";
        similarity?: "l2_norm" | "dot_product" | "cosine";
        m?: number;
        ef_construction?: number;
      };
  similarity?: "l2_norm" | "dot_product" | "cosine";
}

// object / nested
interface ObjectField extends BaseField {
  type: "object" | "nested";
  enabled?: boolean;
  dynamic?: boolean | "true" | "false" | "strict";
  properties?: IndexMappingProperties; // 递归
}

// 其他简单类型（无特殊属性）
interface SimpleField extends BaseField {
  type:
    | "boolean"
    | "ip"
    | "binary"
    | "completion"
    | "token_count"
    | "geo_point"
    | "geo_shape"
    | "alias"
    | "constant_keyword"
    | "wildcard"
    | "sparse_vector";
  // 可能有少量属性，这里简化
}

// 联合类型：根据 type 自动推断
export type IndexMappingFieldMapping =
  | TextField
  | KeywordField
  | DateField
  | NumericField
  | ScaledFloatField
  | DenseVectorField
  | ObjectField
  | SimpleField;

// Properties 是字段名到 FieldMapping 的映射
export interface IndexMappingProperties {
  [fieldName: string]: IndexMappingFieldMapping;
}

// 完整的 Mapping 结构（ES 7+ / 8）
export interface IndexMapping {
  properties: IndexMappingProperties;
  dynamic?: boolean | "true" | "false" | "strict";
  _source?: { enabled?: boolean };
  // 其他顶层 mapping 设置（如 _routing, dynamic_templates 等可扩展）
}
