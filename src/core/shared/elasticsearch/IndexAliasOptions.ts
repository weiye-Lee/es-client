/**
 * 表示一个索引别名的配置
 */
export interface IndexAliasOptions {
  /**
   * 可选：查询过滤器，所有通过该别名的查询都会自动应用此过滤器
   */
  filter?: Record<string, any>;

  /**
   * 可选：默认路由值（同时用于索引和搜索）
   */
  routing?: string;

  /**
   * 可选：用于写入（索引）操作的路由值
   */
  index_routing?: string;

  /**
   * 可选：用于搜索操作的路由值
   */
  search_routing?: string;

  /**
   * 可选：是否为该别名的写入索引（当别名指向多个索引时必须指定一个为 true）
   */
  is_write_index?: boolean;
}

/**
 * 索引别名创建参数
 */
export interface IndexCreateAliasOptions extends IndexAliasOptions {
  /**
   * 别名名称
   */
  alias: string;
}

/**
 * 索引别名创建参数
 */
export interface IndexAliasCreateOptions extends IndexAliasOptions {
  /**
   * 别名名称
   */
  alias: string;
  /**
   * 索引名称
   */
  index: string;
}

/**
 * 索引别名删除参数
 */
export interface IndexAliasRemoveOptions {
  /**
   * 索引名称
   */
  index: string;
  /**
   * 别名名称
   */
  alias: string;
}

export interface IndexAliasAtomAddOptions {
  add: IndexAliasCreateOptions;
}
export interface IndexAliasAtomRemoveOptions {
  remove: IndexAliasRemoveOptions;
}

/**
 * 索引别名原子操作参数
 */
export type IndexAliasAtomOptions = IndexAliasAtomAddOptions | IndexAliasAtomRemoveOptions;

export function indexCreateAliasObjectify(
  aliases: Array<IndexCreateAliasOptions>
): Record<string, IndexAliasOptions> {
  const aliasObject: Record<string, IndexAliasOptions> = {};
  aliases.forEach((item) => {
    const { alias, ...aliasOptions } = item;
    aliasObject[alias] = aliasOptions;
  });
  return aliasObject;
}

export function indexCreateAliasListify(
  aliasObject: Record<string, IndexAliasOptions>
): Array<IndexCreateAliasOptions> {
  const aliases: Array<IndexCreateAliasOptions> = [];
  for (const aliasName in aliasObject) {
    aliases.push({
      alias: aliasName,
      ...aliasObject[aliasName]
    });
  }
  return aliases;
}
