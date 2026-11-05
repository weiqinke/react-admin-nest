import { message } from "antd";

export function showApiError(text: string) {
  message.error({ content: text, duration: 2 });
}

export function showWarning(text: string) {
  message.warning(text);
}
