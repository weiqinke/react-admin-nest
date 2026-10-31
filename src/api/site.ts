import { request } from "./request";

/** 公开站点配置（注册开关等）。 */
export const getSite = () => request("/api/site", "GET");
