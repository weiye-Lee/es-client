import { EsRequestError } from "$/shared";

export class Result<T> {
  /**
   * 200: 成功
   * 500: 错误
   * 501：es请求错误
   */
  code: number;
  msg: string;
  data?: T;

  constructor(code: number, msg: string, data?: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }

  public static success<T>(data?: T) {
    return new Result<T>(200, "success", data);
  }

  public static error(msg: string) {
    return new Result<null>(500, msg, null);
  }

  public static fail(error: Error | any) {
    if (error instanceof EsRequestError) {
      return new Result<string>(501, error.message, error.body);
    }
    return new Result<null>(500, error instanceof Error ? error.message : String(error), null);
  }

  public static errorWithData<T>(msg: string, data: T) {
    return new Result<T>(500, msg, data);
  }

  public static notAuth() {
    return new Result(401, "未登录", null);
  }

  // 登录过期
  public static tokenExpired() {
    return new Result(403, "登录过期", null);
  }

  // 认证信息错误
  public static authError() {
    return new Result(402, "认证信息错误", null);
  }

  // 认证信息错误
  public static notFound() {
    return new Result(404, "未找到", null);
  }
}
