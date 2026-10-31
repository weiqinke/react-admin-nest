import { request } from "@/api/request";

const enc = encodeURIComponent;

function segment(value: string) {
  return enc(value);
}

/** 常见出站事件（创建订阅时可勾选）。 */
export const WEBHOOK_EVENT_OPTIONS = [
  { value: "ticket.closed", label: "工单关闭" },
  { value: "ticket.reopened", label: "工单重开" },
  { value: "audit.written", label: "审计写入" },
  { value: "audit.export", label: "用户导出" },
  { value: "webhook.ping", label: "测试 ping" }
];

export const listWebhooks = () => request("/api/webhooks", "GET");

export const createWebhook = (payload: { name: string; url: string; secret?: string; events: string[] }) => request("/api/webhooks", "POST", payload);

export const deleteWebhook = (id: string) => request(`/api/webhooks/${segment(id)}`, "DELETE");

export const testWebhook = (id: string) => request(`/api/webhooks/${segment(id)}/test`, "POST", {});

export const listWebhookDeliveries = (query: { status?: string; limit?: number } = {}) => request("/api/webhooks/deliveries", "GET", query);

export const replayWebhookDelivery = (id: string) => request(`/api/webhooks/deliveries/${segment(id)}/replay`, "POST", {});

export const listFlags = () => request("/api/flags", "GET");

/** 当前用户生效的 flag 映射。登录即可。 */
export const listMyFlags = () => request("/api/me/flags", "GET");

export const upsertFlag = (payload: { code: string; name: string; description?: string; enabled: boolean }) => request("/api/flags", "PUT", payload);

/** 侧栏固定 / 最近。data: { pins, recent } */
export const getMenuPins = () => request("/api/me/menu-pins", "GET");

export const putMenuPins = (payload: { pins?: string[]; recent?: string[] }) => request("/api/me/menu-pins", "PUT", payload);

export const recordMenuRecent = (path: string) => request("/api/me/menu-recent", "POST", { path });
