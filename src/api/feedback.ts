type ApiErrorReporter = (text: string) => void;

let report: ApiErrorReporter = () => undefined;

/** 由应用入口注入。请求模块不直接依赖界面组件。 */
export function setApiErrorReporter(next: ApiErrorReporter) {
  report = next;
}

export function reportApiError(text: string) {
  report(text);
}
