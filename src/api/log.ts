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

function todayISO() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 访问日志总数。已按 data_scope 过滤，self / dept 不含匿名。无 stats:read 时静默失败。 */
export async function apiCount() {
  const empty = { status: 200, data: { code: 0, message: "ok", data: { total: 0, today: 0, data_scope: "" } } };
  try {
    const today = todayISO();
    const logs = await request("/api/stats/access/logs", "GET", { page: 1, page_size: 1 }, { skipErrorMessage: true });
    let todayCount = 0;
    let scope = logs.data?.data?.data_scope || "";
    try {
      const daily = await request("/api/stats/access/daily", "GET", { from: today, to: today }, { skipErrorMessage: true });
      const list = daily.data?.data?.list || [];
      const row = list.find((item: any) => String(item.day || "").slice(0, 10) === today) || list[0];
      todayCount = Number(row?.total_count || 0);
      scope = scope || daily.data?.data?.data_scope || "";
    } catch {
      todayCount = 0;
    }
    return {
      status: 200,
      data: { code: 0, message: "ok", data: { total: logs.data?.data?.total || 0, today: todayCount, data_scope: scope } }
    };
  } catch {
    return empty;
  }
}
