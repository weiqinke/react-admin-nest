import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const listAuditLogs = (query: Record<string, any> = {}) => request("/api/audit/logs", "GET", compact(query));

export const getAuditLog = (id: string) => request(`/api/audit/logs/${enc(id)}`, "GET");

export const listAuditModules = () => request("/api/audit/modules", "GET");

export const exportAuditLogsURL = (query: Record<string, any> = {}) => {
  const params = new URLSearchParams();
  Object.entries(compact(query)).forEach(([key, value]) => params.set(key, String(value)));
  const qs = params.toString();
  return `/api/audit/logs/export${qs ? `?${qs}` : ""}`;
};
