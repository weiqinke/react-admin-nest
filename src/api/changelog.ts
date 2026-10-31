import { request } from "@/api/request";

const enc = encodeURIComponent;

/** 已发布变更日志（登录即可）。 */
export const listPublishedChangelogs = (query: { keyword?: string; page?: number; page_size?: number } = {}) =>
  request("/api/changelogs", "GET", query);

export const getChangelog = (id: string) => request(`/api/changelogs/${enc(id)}`, "GET");

/** 管理端列表。需要 changelog:read。 */
export const listAdminChangelogs = (query: { status?: string; keyword?: string; page?: number; page_size?: number } = {}) =>
  request("/api/admin/changelogs", "GET", query);

export const createChangelog = (payload: { version: string; title: string; body: string; notify_mail?: boolean }) =>
  request("/api/admin/changelogs", "POST", payload);

export const updateChangelog = (id: string, payload: { version: string; title: string; body: string; notify_mail?: boolean }) =>
  request(`/api/admin/changelogs/${enc(id)}`, "PUT", payload);

export const deleteChangelog = (id: string) => request(`/api/admin/changelogs/${enc(id)}`, "DELETE");

export const publishChangelog = (id: string) => request(`/api/admin/changelogs/${enc(id)}/publish`, "POST", {});
