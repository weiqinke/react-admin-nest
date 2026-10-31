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
  { value: "custom", label: "指定部门" },
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

export const setUserDepartment = (id: string, departmentId: string) => request(`/api/users/${segment(id)}/department`, "PUT", { department_id: departmentId || "" });

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

export const listConfigGroups = () => request("/api/configs/groups", "GET");

export const updateConfig = (key: string, value: string) => request(`/api/configs/${segment(key)}`, "PUT", { value });

export const listMailTemplates = () => request("/api/mail/templates", "GET");

export const upsertMailTemplate = (payload: Record<string, any>) => request("/api/mail/templates", "PUT", payload);

export const testMail = (payload: { to: string; subject: string; body: string }) => request("/api/mail/test", "POST", payload);

export const getDashboard = (query: Record<string, any> = {}) => request("/api/stats/dashboard", "GET", compact(query));

export const listTickets = (query: Record<string, any> = {}) => request("/api/tickets", "GET", compact(query));

export const getTicket = (id: string) => request(`/api/tickets/${segment(id)}`, "GET");

export const assignTicket = (id: string, payload: { assignee_id?: string; department_id?: string }) => request(`/api/tickets/${segment(id)}/assign`, "PUT", payload);

export const processTicket = (id: string, note?: string) => request(`/api/tickets/${segment(id)}/process`, "PUT", { note: note || "" });

export const closeTicket = (id: string, close_reason: string) => request(`/api/tickets/${segment(id)}/close`, "PUT", { close_reason });

export const createTicket = (payload: { title: string; content: string; priority: string; due_at?: string; template_id?: string }) =>
  request("/api/tickets", "POST", compact(payload));

/** 批量分派。最多 100。data: { ok, failed } */
export const batchAssignTickets = (payload: { ids: string[]; assignee_id?: string; department_id?: string }) => request("/api/tickets/batch-assign", "POST", payload);

/** 批量操作：assign | close | priority。data: { results } */
export const batchTickets = (payload: {
  ids: string[];
  action: "assign" | "close" | "priority";
  assignee_id?: string;
  department_id?: string;
  priority?: string;
  close_reason?: string;
}) => request("/api/tickets/batch", "POST", payload);

/** 批量启停用户。禁用需 step-up。data: { ok, failed } */
export const batchUserStatus = (payload: { ids: string[]; status: number; reason?: string }) => request("/api/users/batch-status", "PUT", payload);

export const listTicketTemplates = (enabledOnly = false) => request("/api/ticket-templates", "GET", enabledOnly ? { enabled: "1" } : {});

export const upsertTicketTemplate = (payload: { id?: string; name: string; title?: string; content?: string; priority?: string; enabled?: boolean }) =>
  request("/api/ticket-templates", "PUT", payload);

export const deleteTicketTemplate = (id: string) => request(`/api/ticket-templates/${segment(id)}`, "DELETE");

export const listTicketAssignRules = () => request("/api/ticket-assign-rules", "GET");

export const upsertTicketAssignRule = (payload: {
  id?: string;
  name: string;
  priority?: string;
  label_id?: string;
  department_id?: string;
  assignee_pool: string[];
  enabled?: boolean;
}) => request("/api/ticket-assign-rules", "PUT", payload);

export const deleteTicketAssignRule = (id: string) => request(`/api/ticket-assign-rules/${segment(id)}`, "DELETE");

export const listMyTickets = (query: Record<string, any> = {}) => request("/api/me/tickets", "GET", compact(query));

export const getMyTicket = (id: string) => request(`/api/me/tickets/${segment(id)}`, "GET");

export const closeMyTicket = (id: string, close_reason: string) => request(`/api/me/tickets/${segment(id)}/close`, "PUT", { close_reason });

/** 创建人或处理人留言。不改变状态。已关闭的工单会被拒绝。 */
export const commentMyTicket = (id: string, content: string) => request(`/api/me/tickets/${segment(id)}/comments`, "POST", { content });

/** 管理端留言。需要 ticket:write，并先过数据范围。 */
export const commentTicket = (id: string, content: string) => request(`/api/tickets/${segment(id)}/comments`, "POST", { content });

/** 管理端重开已关闭工单。 */
export const reopenTicket = (id: string, reason = "") => request(`/api/tickets/${segment(id)}/reopen`, "PUT", { reason });

/** 创建人重开自己的工单。 */
export const reopenMyTicket = (id: string, reason = "") => request(`/api/me/tickets/${segment(id)}/reopen`, "PUT", { reason });

/** 管理端改优先级。 */
export const setTicketPriority = (id: string, priority: string) => request(`/api/tickets/${segment(id)}/priority`, "PUT", { priority });

/** 创建人对已关闭工单评分 1–5。 */
export const rateMyTicket = (id: string, rating: number, comment = "") => request(`/api/me/tickets/${segment(id)}/rate`, "POST", { rating, comment });

/** 关注工单（管理端）。user_id 走 query，缺省为自己。 */
export const addTicketWatcher = (id: string, user_id?: string) => {
  const q = user_id ? `?user_id=${segment(user_id)}` : "";
  return request(`/api/tickets/${segment(id)}/watchers${q}`, "POST", {});
};

export const removeTicketWatcher = (id: string, user_id: string) => request(`/api/tickets/${segment(id)}/watchers/${segment(user_id)}`, "DELETE");

export const listTicketWatchers = (id: string) => request(`/api/tickets/${segment(id)}/watchers`, "GET");

/** 我的工单关注（创建人/处理人）。 */
export const addMyTicketWatcher = (id: string) => request(`/api/me/tickets/${segment(id)}/watchers`, "POST", {});

export const removeMyTicketWatcher = (id: string) => request(`/api/me/tickets/${segment(id)}/watchers`, "DELETE");

export const listMyTicketWatchers = (id: string) => request(`/api/me/tickets/${segment(id)}/watchers`, "GET");

/** 全局搜索。登录即可。data: { query, list:[{type,id,title,extra?}] } */
export const globalSearch = (q: string) => request("/api/search", "GET", { q });

export const listJobs = () => request("/api/jobs", "GET");

export const setJobEnabled = (code: string, enabled: boolean) => request(`${jobPath(code)}/status`, "PUT", { enabled });

export const runJob = (code: string) => request(`${jobPath(code)}/run`, "POST", {});

export const listJobRuns = (code: string, limit = 20) => request(`${jobPath(code)}/runs`, "GET", { limit });

/** 取消进行中的任务执行。需要 job:write。 */
export const cancelJobRun = (runId: string) => request(`/api/jobs/runs/${segment(runId)}/cancel`, "POST", {});

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
