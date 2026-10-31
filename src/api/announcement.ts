import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const listAnnouncements = (query: Record<string, any> = {}) => request("/api/announcements", "GET", compact(query));

export const createAnnouncement = (payload: Record<string, any>) => request("/api/announcements", "POST", payload);

export const updateAnnouncement = (id: string, payload: Record<string, any>) => request(`/api/announcements/${enc(id)}`, "PUT", payload);

export const updateAnnouncementSchedule = (id: string, payload: Record<string, any>) => request(`/api/announcements/${enc(id)}/schedule`, "PUT", payload);

export const publishAnnouncement = (id: string) => request(`/api/announcements/${enc(id)}/publish`, "PUT", {});

export const republishAnnouncement = (id: string) => request(`/api/announcements/${enc(id)}/republish`, "POST", {});

export const revokeAnnouncement = (id: string) => request(`/api/announcements/${enc(id)}/revoke`, "PUT", {});

export const deleteAnnouncement = (id: string) => request(`/api/announcements/${enc(id)}`, "DELETE");

export const listAnnouncementReads = (id: string, query: Record<string, any> = {}) => request(`/api/announcements/${enc(id)}/reads`, "GET", compact(query));

/** 向未读受众催办，同公告 24h 去重。data: { sent } */
export const nudgeAnnouncement = (id: string) => request(`/api/announcements/${enc(id)}/nudge`, "POST", {});

/** 预估受众人数。data: { estimated_users } */
export const estimateAnnouncementAudience = (payload: { target_depts?: string[]; target_roles?: string[] }) =>
  request("/api/announcements/audience-estimate", "POST", payload);

export const listMyAnnouncements = (query: Record<string, any> = {}) => request("/api/me/announcements", "GET", compact(query));

export const markAnnouncementRead = (id: string) => request(`/api/me/announcements/${enc(id)}/read`, "PUT", {});

export const markAnnouncementsRead = (ids: string[]) => request("/api/me/announcements/read", "PUT", { ids });

export const markAllAnnouncementsRead = (type?: string) => request("/api/me/announcements/read-all", "PUT", {}, type ? { params: { type } } : {});

export function hasPermission(code: string) {
  try {
    const list = JSON.parse(localStorage.getItem("permissions") || "[]");
    return Array.isArray(list) && list.includes(code);
  } catch {
    return false;
  }
}
