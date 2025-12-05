export function encodeIndexType(index: string, type: string): string {
  return `${type}:${index}`;
}

export function decodeIndexType(indexType: string): { index: string; type: string } {
  const [type, ...index] = indexType.split(":");
  return { type, index: index.join(":") };
}

export function encodeTypeField(type: string, field: string): string {
  return `${type}:${field}`;
}

export function decodeTypeField(typeField: string): { type: string; field: string } {
  const [type, ...field] = typeField.split(":");
  return { type, field: field.join(":") };
}
