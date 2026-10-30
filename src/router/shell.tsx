import { Outlet, useMatches } from "react-router";
import { useLayoutEffect } from "react";
import { resolveTitle, SessionContext, useSessionState } from "@/router/session";

export default function AppShell() {
  const session = useSessionState();
  const matches = useMatches();
  const title = resolveTitle(matches, session);

  useLayoutEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <SessionContext.Provider value={session}>
      <Outlet />
    </SessionContext.Provider>
  );
}
