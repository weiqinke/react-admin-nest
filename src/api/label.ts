import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const listLabels = (query: Record<string, any> = {}) => request("/api/labels", "GET", compact(query));

export const getLabel = (id: string) => request(`/api/labels/${enc(id)}`, "GET");

export const listLabelOptions = () => request("/api/labels/options", "GET");

export const createLabel = (payload: Record<string, any>) => request("/api/labels", "POST", payload);

export const updateLabel = (id: string, payload: Record<string, any>) => request(`/api/labels/${enc(id)}`, "PUT", payload);

export const setLabelStatus = (id: string, status: "enabled" | "disabled") => request(`/api/labels/${enc(id)}/status`, "PUT", { status });

export const deleteLabel = (id: string) => request(`/api/labels/${enc(id)}`, "DELETE");
