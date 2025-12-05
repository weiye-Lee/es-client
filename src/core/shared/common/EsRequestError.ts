/**
 * es请求错误
 */
export class EsRequestError extends Error {
  body: string;

  constructor(message: string, body: string) {
    super(message);
    this.name = "EsRequestError";
    this.body = body;
  }
}
