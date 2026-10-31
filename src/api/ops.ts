import { encryptPassword } from "@/api/crypto";
import { getPublicKey } from "@/api/auth";
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

/** 更新启用 / 重试。需要 config:write。 */
export const updateWebhook = (id: string, payload: { enabled?: boolean; retry_enabled?: boolean }) => request(`/api/webhooks/${segment(id)}`, "PUT", payload);

export const deleteWebhook = (id: string) => request(`/api/webhooks/${segment(id)}`, "DELETE");

export const testWebhook = (id: string) => request(`/api/webhooks/${segment(id)}/test`, "POST", {});

export const listWebhookDeliveries = (query: { status?: string; limit?: number } = {}) => request("/api/webhooks/deliveries", "GET", query);

export const replayWebhookDelivery = (id: string) => request(`/api/webhooks/deliveries/${segment(id)}/replay`, "POST", {});

/** 各订阅投递统计。data: { days, list } */
export const listWebhookStats = (days = 7) => request("/api/webhooks/stats", "GET", { days });

export const listFlags = () => request("/api/flags", "GET");

/** 当前用户生效的 flag 映射。登录即可。 */
export const listMyFlags = () => request("/api/me/flags", "GET");

export const upsertFlag = (payload: { code: string; name: string; description?: string; enabled: boolean }) => request("/api/flags", "PUT", payload);

/** 侧栏固定 / 最近。data: { pins, recent } */
export const getMenuPins = () => request("/api/me/menu-pins", "GET");

export const putMenuPins = (payload: { pins?: string[]; recent?: string[] }) => request("/api/me/menu-pins", "PUT", payload);

export const recordMenuRecent = (path: string) => request("/api/me/menu-recent", "POST", { path });

/** 邀请用户。需要 user:write，且 mail.enabled。 */
export const createInvite = (payload: { email: string; role_codes?: string[]; department_id?: string; hours?: number }) => request("/api/invites", "POST", payload);

/** 公开接受邀请。密码需加密。 */
export async function acceptInvite(token: string, username: string, password: string) {
  const keyRes = await getPublicKey();
  const password_encrypted = await encryptPassword(keyRes.data.data.public_key, password);
  return request("/api/invites/accept", "POST", { token, username, password_encrypted });
}

/** 个人 UI 偏好。白名单：theme locale home_layout timezone sidebar_collapsed */
export const getPreferences = () => request("/api/me/preferences", "GET");

export const putPreferences = (prefs: Record<string, any>) => request("/api/me/preferences", "PUT", prefs);

export const NOTIFY_EVENT_LABELS: Record<string, string> = {
  "ticket.assign": "工单分派",
  "ticket.comment": "工单留言",
  "ticket.status": "工单状态",
  "ticket.due": "工单到期",
  announcement: "公告",
  "security.login_new_ip": "新 IP 登录",
  "job.failure": "任务失败"
};

export const NOTIFY_CHANNEL_LABELS: Record<string, string> = {
  inbox: "站内信",
  mail: "邮件",
  bot: "机器人",
  sms: "短信"
};

/** 事件/渠道/类别目录。登录即可。 */
export const getNotifyPrefsCatalog = () => request("/api/me/notify-prefs/catalog", "GET");

/** 通知偏好。data: { list, quiet_hours_start?, quiet_hours_end? } */
export const getNotifyPrefs = () => request("/api/me/notify-prefs", "GET");

export const putNotifyPrefs = (payload: {
  items?: { event: string; channel: string; enabled: boolean }[];
  categories?: { category: string; channel: string; enabled: boolean }[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}) => request("/api/me/notify-prefs", "PUT", payload);

/** 通知路由最近投递日志。需要 config:read。 */
export const listNotifyDispatches = (limit = 50) => request("/api/notify/dispatches", "GET", { limit });

/** 邮件模板预览（不发送）。需要 config:read。 */
export const previewMailTemplate = (payload: { code: string; channel?: string; vars?: Record<string, any> }) => request("/api/mail/templates/preview", "POST", payload);
