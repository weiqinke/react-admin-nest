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

/** 置顶/取消置顶。每用户最多 5 条。 */
export const setNoticePin = (id: string, pinned: boolean) => request(`/api/me/notices/${enc(id)}/pin`, "PUT", { pinned });

/** 清除当前用户全部置顶。 */
export const unpinAllNotices = () => request("/api/me/notices/unpin-all", "PUT", {});

/** 归档站内信。body: { ids: string[] } */
export const archiveNotices = (ids: string[]) => request("/api/me/notices/archive", "PUT", { ids });

export const listNotices = (query: Record<string, any> = {}) => request("/api/notices", "GET", compact(query));

export const getNotice = (id: string) => request(`/api/notices/${enc(id)}`, "GET");

export const sendNotice = (payload: Record<string, any>) => request("/api/notices", "POST", payload);

export const closeNotice = (id: string) => request(`/api/notices/${enc(id)}/close`, "PUT", {});
