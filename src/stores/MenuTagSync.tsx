import type { RouteHandle } from "@/router/session";
import { bindMenuTagNavigate, useMenuTagStore } from "@/stores/menuTag";
import { useLayoutEffect } from "react";
import { useLocation, useMatches, useNavigate } from "react-router";

/** 页签数据在 store 里。当前地址和跳转仍从 React Router 写进来。 */
export default function MenuTagSync() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();
  const missed = Boolean((matches[matches.length - 1]?.handle as RouteHandle | undefined)?.miss);

  useLayoutEffect(() => bindMenuTagNavigate(navigate), [navigate]);

  useLayoutEffect(() => {
    useMenuTagStore.getState().syncRoute(pathname, missed);
  }, [pathname, missed]);

  return null;
}
