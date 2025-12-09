/**
 * 实例平台
 */
export type UrlPlatform = "elasticsearch" | "opensearch" | "easysearch";

export interface Url {
  /**
   * ID
   */
  id: string;

  /**
   * 创建时间
   */
  created_at: number;

  /**
   * 更新时间
   */
  updated_at: number;

  /**
   * 链接名称
   */
  name: string;

  /**
   * 链接值
   */
  value: string;

  /**
   * 排序
   */
  sequence: number;
  /**
   * 是否需要认证
   */
  is_auth: 0 | 1;

  /**
   * 认证类型那个，默认Basic认证
   * 1-Basic认证,2-请求头认证,3-Cookie认证
   */
  auth_type: 1 | 2 | 3;

  /**
   * 用户名
   */
  auth_user: string;

  /**
   * 密码
   */
  auth_password: string;

  /**
   * 实例平台
   */
  platform: UrlPlatform;

  /**
   * 版本信息
   */
  version: string;
}

