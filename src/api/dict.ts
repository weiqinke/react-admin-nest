import { request } from "@/api/request";

const enc = encodeURIComponent;

function compact(query: Record<string, any>) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export const listDictTypes = (query: Record<string, any> = {}) => request("/api/dicts", "GET", compact(query));

export const getDictType = (id: string) => request(`/api/dicts/${enc(id)}`, "GET");

export const listDictOptions = (code: string) => request("/api/dicts/options", "GET", { code });

export const createDictType = (payload: Record<string, any>) => request("/api/dicts", "POST", payload);

export const updateDictType = (id: string, payload: Record<string, any>) => request(`/api/dicts/${enc(id)}`, "PUT", payload);

export const setDictTypeStatus = (id: string, status: "enabled" | "disabled") => request(`/api/dicts/${enc(id)}/status`, "PUT", { status });

export const deleteDictType = (id: string) => request(`/api/dicts/${enc(id)}`, "DELETE");

export const listDictItems = (typeId: string, query: Record<string, any> = {}) => request(`/api/dicts/${enc(typeId)}/items`, "GET", compact(query));

export const createDictItem = (typeId: string, payload: Record<string, any>) => request(`/api/dicts/${enc(typeId)}/items`, "POST", payload);

export const updateDictItem = (id: string, payload: Record<string, any>) => request(`/api/dict-items/${enc(id)}`, "PUT", payload);

export const setDictItemStatus = (id: string, status: "enabled" | "disabled") => request(`/api/dict-items/${enc(id)}/status`, "PUT", { status });

export const deleteDictItem = (id: string) => request(`/api/dict-items/${enc(id)}`, "DELETE");
