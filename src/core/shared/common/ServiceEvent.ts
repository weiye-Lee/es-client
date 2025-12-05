/**
 * 服务端事件
 */
export enum ServiceEvent {
  // url重新载入
  URL_RELOAD = "/url/reload",

  /**
   * 任务完成
   */
  TASK_COMPLETE = "/task/complete",

  // 任务失败
  TASK_FAIL = "/task/fail",

  // 任务取消
  TASK_CANCEL = "/task/cancel"
}
