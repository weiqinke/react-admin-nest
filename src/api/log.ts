import { getLoginLogs } from "@/api/goadmin";
import { request } from "@/api/request";

export async function loginlog(payload: any = {}) {
  const res = await getLoginLogs({
    page: payload.page || 1,
    page_size: Math.min(Number(payload.page_size || payload.pageSize || 100), 100),
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
  return {
    ...res,
    data: {
      ...res.data,
      data: list,
      total: res.data?.data?.total || list.length,
      data_scope: res.data?.data?.data_scope || ""
    }
  };
}

/** 访问日志总数。无 stats:read 时静默失败，不打断工作台。 */
export function apiCount() {
  return request("/api/stats/access/logs", "GET", { page: 1, page_size: 1 }, { skipErrorMessage: true })
    .then(res => ({ ...res, data: { ...res.data, data: { total: res.data?.data?.total || 0, today: 0 } } }))
    .catch(() => ({ status: 200, data: { code: 0, message: "ok", data: { total: 0, today: 0 } } }));
}
