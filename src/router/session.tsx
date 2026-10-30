import { getUserState, subscribeSession, type UserState } from "@/api/session";
import { createContext, useContext, useEffect, useState } from "react";
import type { UIMatch } from "react-router";

export type RouteHandle = {
  title?: string;
  auth?: boolean;
};

export const SessionContext = createContext<UserState>({});

export function isSessionValid(state: UserState) {
  const authEndTime = state.exp ? state.exp * 1000 : 0;
  return Boolean(state.uid && authEndTime && authEndTime > Date.now());
}

export function useSessionState() {
  const [state, setState] = useState<UserState>(getUserState);
  useEffect(() => {
    const unsubscribe = subscribeSession(setState);
    return () => {
      unsubscribe();
    };
  }, []);
  return state;
}

export function useRouteSession() {
  return useContext(SessionContext);
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
