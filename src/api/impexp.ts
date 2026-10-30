import { downloadCsv } from "@/api/download";
import { request } from "@/api/request";

function asForm(file: File) {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export const exportUsersCsv = (query: Record<string, any> = {}, filename = "users.csv") =>
  downloadCsv("/api/users/export", filename, query);

export const exportLoginLogsCsv = (query: Record<string, any>, filename = "login-logs.csv") =>
  downloadCsv("/api/login/logs/export", filename, query);

export const exportAccessLogsCsv = (query: Record<string, any>, filename = "access-logs.csv") =>
  downloadCsv("/api/stats/access/logs/export", filename, query);

export const exportDeptsCsv = (filename = "depts.csv") => downloadCsv("/api/export/depts", filename);

export const exportDictsCsv = (filename = "dicts.csv") => downloadCsv("/api/export/dicts", filename);

export const downloadUserImportTemplate = () => downloadCsv("/api/import/users/template", "users-template.csv");

export const downloadDeptImportTemplate = () => downloadCsv("/api/import/depts/template", "depts-template.csv");

export const downloadDictImportTemplate = () => downloadCsv("/api/import/dicts/template", "dicts-template.csv");

export const previewUserImport = (file: File) => request("/api/import/users/preview", "POST", asForm(file));

export const commitUserImport = (file: File) => request("/api/import/users", "POST", asForm(file));

export const previewDeptImport = (file: File) => request("/api/import/depts/preview", "POST", asForm(file));

export const commitDeptImport = (file: File) => request("/api/import/depts", "POST", asForm(file));

export const previewDictImport = (file: File) => request("/api/import/dicts/preview", "POST", asForm(file));

export const commitDictImport = (file: File) => request("/api/import/dicts", "POST", asForm(file));
