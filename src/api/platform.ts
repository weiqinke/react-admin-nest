import { encryptPassword } from "@/api/crypto";
import { getPublicKey } from "@/api/goadmin";
import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

/** 含点号的 code / key 必须作为单个路径段，不能拆成 /stats/daily。 */
function segment(value: string) {
  return enc(value);
}

export const DATA_SCOPE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "dept", label: "本部门及下级" },
  { value: "self", label: "仅本人" }
];

export function dataScopeLabel(scope?: string) {
  return DATA_SCOPE_OPTIONS.find(item => item.value === scope)?.label || scope || "—";
}

export const TICKET_STATUS: Record<string, string> = {
  open: "待处理",
  assigned: "已分派",
  processing: "处理中",
  closed: "已关闭"
};

export const TICKET_PRIORITY: Record<string, string> = {
  low: "低",
  normal: "普通",
  high: "高"
};

export const API_KEY_SCOPES = [
  { value: "user:read", label: "用户" },
  { value: "dict:read", label: "字典" },
  { value: "label:read", label: "标签" },
  { value: "announcement:read", label: "公告" },
  { value: "dept:read", label: "部门" },
  { value: "stats:read", label: "统计" }
];

export const getSite = () => request("/api/site", "GET");

/** 工作台摘要：未读站内信、待办、未关闭工单、未读公告。 */
export const getHomeSummary = () => request("/api/me/home", "GET");

/** due_at 已过且未关闭。 */
export function ticketOverdue(ticket?: { due_at?: string; status?: string } | null) {
  if (!ticket?.due_at || ticket.status === "closed") return false;
  const due = Date.parse(ticket.due_at);
  return Number.isFinite(due) && due < Date.now();
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const keyRes = await getPublicKey();
  const pem = keyRes.data?.data?.public_key;
  const old_password_encrypted = await encryptPassword(pem, oldPassword);
  const new_password_encrypted = await encryptPassword(pem, newPassword);
  return request("/api/me/password", "POST", { old_password_encrypted, new_password_encrypted });
}

export const listSessions = () => request("/api/me/sessions", "GET");

export const revokeSession = (id: string) => request(`/api/me/sessions/${segment(id)}`, "DELETE");

export const listDepts = () => request("/api/depts", "GET");

export const createDept = (payload: Record<string, any>) => request("/api/depts", "POST", payload);

export const updateDept = (id: string, payload: Record<string, any>) => request(`/api/depts/${segment(id)}`, "PUT", payload);

export const listPositions = (department_id?: string) => request("/api/positions", "GET", compact({ department_id }));

export const createPosition = (payload: Record<string, any>) => request("/api/positions", "POST", payload);

export const updatePosition = (id: string, payload: Record<string, any>) => request(`/api/positions/${segment(id)}`, "PUT", payload);

export const deletePosition = (id: string) => request(`/api/positions/${segment(id)}`, "DELETE");

/** 任职。position_id 传空字符串表示取消，并清空资料里的岗位名称。 */
export const setUserPosition = (id: string, position_id: string) => request(`/api/users/${segment(id)}/position`, "PUT", { position_id });

export const deleteDept = (id: string) => request(`/api/depts/${segment(id)}`, "DELETE");

export const setUserDepartment = (id: string, departmentId: string) =>
  request(`/api/users/${segment(id)}/department`, "PUT", { department_id: departmentId || "" });

export function toDeptTree(nodes: any[] = [], options?: { disableOff?: boolean; keepId?: string }): any[] {
  return (nodes || []).map(node => {
    const id = String(node.id);
    const children = toDeptTree(node.children || [], options);
    const item: any = {
      title: node.code ? `${node.name}（${node.code}）` : node.name,
      value: id,
      key: id,
      disabled: Boolean(options?.disableOff) && Number(node.status) !== 1 && id !== options?.keepId
    };
    if (children.length) item.children = children;
    return item;
  });
}

export function flattenDepts(nodes: any[] = [], bucket: any[] = []) {
  (nodes || []).forEach(node => {
    bucket.push(node);
    if (node.children?.length) flattenDepts(node.children, bucket);
  });
  return bucket;
}

export const listConfigs = (group?: string) => request("/api/configs", "GET", compact({ group }));

export const updateConfig = (key: string, value: string) => request(`/api/configs/${segment(key)}`, "PUT", { value });

export const listTickets = (query: Record<string, any> = {}) => request("/api/tickets", "GET", compact(query));

export const getTicket = (id: string) => request(`/api/tickets/${segment(id)}`, "GET");

export const assignTicket = (id: string, payload: { assignee_id?: string; department_id?: string }) =>
  request(`/api/tickets/${segment(id)}/assign`, "PUT", payload);

export const processTicket = (id: string, note?: string) => request(`/api/tickets/${segment(id)}/process`, "PUT", { note: note || "" });

export const closeTicket = (id: string, close_reason: string) => request(`/api/tickets/${segment(id)}/close`, "PUT", { close_reason });

export const createTicket = (payload: { title: string; content: string; priority: string; due_at?: string }) =>
  request("/api/tickets", "POST", compact(payload));

export const listMyTickets = (query: Record<string, any> = {}) => request("/api/me/tickets", "GET", compact(query));

export const getMyTicket = (id: string) => request(`/api/me/tickets/${segment(id)}`, "GET");

export const closeMyTicket = (id: string, close_reason: string) => request(`/api/me/tickets/${segment(id)}/close`, "PUT", { close_reason });

/** 创建人或处理人留言。不改变状态。已关闭的工单会被拒绝。 */
export const commentMyTicket = (id: string, content: string) => request(`/api/me/tickets/${segment(id)}/comments`, "POST", { content });

/** 管理端留言。需要 ticket:write，并先过数据范围。 */
export const commentTicket = (id: string, content: string) => request(`/api/tickets/${segment(id)}/comments`, "POST", { content });

export const listJobs = () => request("/api/jobs", "GET");

export const setJobEnabled = (code: string, enabled: boolean) => request(`${jobPath(code)}/status`, "PUT", { enabled });

export const runJob = (code: string) => request(`${jobPath(code)}/run`, "POST", {});

export const listJobRuns = (code: string, limit = 20) => request(`${jobPath(code)}/runs`, "GET", { limit });

function jobPath(code: string) {
  return `/api/jobs/${segment(code)}`;
}

export const listApiKeys = () => request("/api/api-keys", "GET");

export const createApiKey = (payload: { name: string; scopes: string[]; expires_at?: string }) => request("/api/api-keys", "POST", payload);

export const revokeApiKey = (id: string) => request(`/api/api-keys/${segment(id)}`, "DELETE");

export const listAiModels = () => request("/api/ai/models", "GET");

export const listAiModelOptions = () => request("/api/ai/models/options", "GET");

export const createAiModel = (payload: Record<string, any>) => request("/api/ai/models", "POST", payload);

export const updateAiModel = (id: string, payload: Record<string, any>) => request(`/api/ai/models/${segment(id)}`, "PUT", payload);

export const deleteAiModel = (id: string) => request(`/api/ai/models/${segment(id)}`, "DELETE");

export const listAiConversations = () => request("/api/ai/conversations", "GET");

export const createAiConversation = (payload: { model_id: string; content: string }) => request("/api/ai/conversations", "POST", payload);

export const getAiConversation = (id: string) => request(`/api/ai/conversations/${segment(id)}`, "GET");

export const sendAiMessage = (id: string, content: string) => request(`/api/ai/conversations/${segment(id)}/messages`, "POST", { content });
