import type { UserState } from "@/api/session";
import { useAppStore } from "@/stores/app";
import type { UIMatch } from "react-router";

export type RouteHandle = {
  title?: string;
  auth?: boolean;
  /** 没有匹配到具体页面，由 404 页承接。 */
  miss?: boolean;
};

export function isSessionValid(state: UserState) {
  const authEndTime = state.exp ? state.exp * 1000 : 0;
  return Boolean(state.uid && authEndTime && authEndTime > Date.now());
}

export function useRouteSession() {
  return useAppStore(state => state.session);
}

/** 从外向内取标题；某一层 auth 且会话无效时停在该层，不再采用更深层的标题。 */
export function resolveTitle(matches: UIMatch[], session: UserState) {
  let title = "welcome";
  const authed = isSessionValid(session);
  for (const match of matches) {
    const handle = match.handle as RouteHandle | undefined;
    title = handle?.title ?? "welcome";
    if (handle?.auth && !authed) break;
  }
  return title;
}
