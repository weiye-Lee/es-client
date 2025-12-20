export interface DevToolProp {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}
