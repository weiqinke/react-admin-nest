import { getLoginLogs } from "@/api/goadmin";
import { emptyOk, removedApi } from "@/api/removed";
import { request } from "@/api/request";

export async function loginlog(payload: any = {}) {
  const res = await getLoginLogs({
    page: payload.page || 1,
    page_size: payload.page_size || payload.pageSize || 200,
    from: payload.from || payload.st,
    to: payload.to || payload.et,
    username: payload.username,
    user_id: payload.user_id,
    success: payload.success,
    ip: payload.ip
  });
  const list = (res.data?.data?.list || []).map(item => ({
    ...item,
    name: item.username,
    bowser: item.browser || item.user_agent,
    host: item.ip,
    created: item.created_at || item.created
  }));
  return { ...res, data: { ...res.data, data: list } };
}

export const userNotice = () => emptyOk([]);

export const userPlacard = () => emptyOk([]);

export const getPlacard = () => emptyOk([]);

export const createPlacard = () => removedApi("公告");

export const updatePlacard = () => removedApi("公告");

export const pushPlacard = () => removedApi("公告");

export const submitPlacard = () => removedApi("公告");

/** 访问日志总数。无 stats:read 时静默失败，不打断工作台。 */
export function apiCount() {
  return request("/api/stats/access/logs", "GET", { page: 1, page_size: 1 }, { skipErrorMessage: true })
    .then(res => ({ ...res, data: { ...res.data, data: { total: res.data?.data?.total || 0, today: 0 } } }))
    .catch(() => emptyOk({ total: 0, today: 0 }));
}
