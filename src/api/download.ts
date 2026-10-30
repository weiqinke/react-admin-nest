import { getAccessToken } from "@/api/session";

function compact(query: Record<string, any> = {}) {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ""));
}

export function withQuery(path: string, query: Record<string, any> = {}) {
  const params = new URLSearchParams();
  Object.entries(compact(query)).forEach(([key, value]) => params.set(key, String(value)));
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}`;
}

/** 下载后端直接写出的 CSV（非 JSON 信封）。 */
export async function downloadCsv(path: string, filename: string, query: Record<string, any> = {}) {
  const token = getAccessToken();
  const resp = await fetch(withQuery(path, query), {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!resp.ok) throw new Error("export failed");
  const blob = await resp.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}
