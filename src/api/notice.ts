import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const listMyNotices = (query: Record<string, any> = {}) => request("/api/me/notices", "GET", compact(query));

export const noticeSummary = () => request("/api/me/notices/summary", "GET");

export const markNoticeRead = (id: string) => request(`/api/me/notices/${enc(id)}/read`, "PUT", {});

export const markAllNoticesRead = (kind?: string) => request("/api/me/notices/read-all", "PUT", kind ? { kind } : {});

export const setNoticeTodo = (id: string, status: "done" | "dismissed") => request(`/api/me/notices/${enc(id)}/todo`, "PUT", { status });

export const listNotices = (query: Record<string, any> = {}) => request("/api/notices", "GET", compact(query));

export const getNotice = (id: string) => request(`/api/notices/${enc(id)}`, "GET");

export const sendNotice = (payload: Record<string, any>) => request("/api/notices", "POST", payload);

export const closeNotice = (id: string) => request(`/api/notices/${enc(id)}/close`, "PUT", {});
