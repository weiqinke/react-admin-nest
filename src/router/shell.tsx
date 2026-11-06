import { useAppStore } from "@/stores/app";
import { resolveTitle } from "@/router/session";
import { useLayoutEffect } from "react";
import { Outlet, useMatches } from "react-router";

export default function AppShell() {
  const session = useAppStore(state => state.session);
  const matches = useMatches();
  const title = resolveTitle(matches, session);

  useLayoutEffect(() => {
    document.title = title;
  }, [title]);

  return <Outlet />;
}
