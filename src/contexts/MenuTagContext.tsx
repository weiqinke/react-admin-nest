import type { RouteHandle } from "@/router/session";
import { formatURL, getMenuItemByID, pageTagName } from "@/utils/menuUtils";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useMatches, useNavigate } from "react-router";

export type MenuTagItem = {
  url: string;
  name: string;
};

type MenuTagContextValue = {
  tags: MenuTagItem[];
  setTags: React.Dispatch<React.SetStateAction<MenuTagItem[]>>;
  activeUrl: string;
  addTag: (urls: string[], id: string | number) => void;
  switchTo: (url: string) => void;
  removeTag: (url: string) => void;
  closeOtherTags: (url: string) => void;
  closeLeftTags: (url: string) => void;
  closeRightTags: (url: string) => void;
  /** 递增后布局用 key 强制重挂当前页 */
  refreshKey: number;
  /** 真刷新过程中：先出 loading，再重挂 */
  refreshing: boolean;
  refreshPage: () => void;
};

const MenuTagContext = React.createContext<MenuTagContextValue>({
  tags: [],
  setTags: () => null,
  activeUrl: "",
  addTag: () => null,
  switchTo: () => null,
  removeTag: () => null,
  closeOtherTags: () => null,
  closeLeftTags: () => null,
  closeRightTags: () => null,
  refreshKey: 0,
  refreshing: false,
  refreshPage: () => null
});

export const MenuTagContextProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();
  const activeUrl = location.pathname;
  const missed = Boolean((matches[matches.length - 1]?.handle as RouteHandle | undefined)?.miss);

  const [tags, setTags] = useState<MenuTagItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearRefreshTimers = useCallback(() => {
    refreshTimersRef.current.forEach(clearTimeout);
    refreshTimersRef.current = [];
  }, []);

  useEffect(() => clearRefreshTimers, [clearRefreshTimers]);

  useEffect(() => {
    const url = location.pathname;
    if (!url) return;
    const name = pageTagName(url, missed);
    if (!name) return;
    setTags(prev => {
      if (!prev.some(tag => tag.url === url)) return [...prev, { url, name }];
      if (prev.some(tag => tag.url === url && tag.name === name)) return prev;
      return prev.map(tag => (tag.url === url ? { ...tag, name } : tag));
    });
  }, [location.pathname, missed]);

  const switchTo = useCallback(
    (url: string) => {
      if (url !== location.pathname) navigate(url);
    },
    [location.pathname, navigate]
  );

  const addTag = useCallback((urls: string[], id: string | number) => {
    const path = formatURL("/" + urls.join("/"));
    setTags(prev => {
      if (prev.some(v => v.url === path)) return prev;
      const item = getMenuItemByID(id);
      if (!item) return prev;
      return [...prev, { url: path, name: item.name }];
    });
  }, []);

  const removeTag = useCallback(
    (url: string) => {
      if (tags.length <= 1) return;
      const next = tags.filter(tag => tag.url !== url);
      setTags(next);
      if (url === location.pathname) navigate(next[next.length - 1].url);
    },
    [tags, location.pathname, navigate]
  );

  const closeOtherTags = useCallback(
    (url: string) => {
      const item = tags.find(v => v.url === url);
      if (!item) return;
      setTags([item]);
      switchTo(url);
    },
    [tags, switchTo]
  );

  const closeLeftTags = useCallback(
    (url: string) => {
      const index = tags.findIndex(v => v.url === url);
      if (index < 0) return;
      const next = tags.slice(index);
      setTags(next);
      if (!next.some(v => v.url === location.pathname)) navigate(next[0].url);
    },
    [tags, location.pathname, navigate]
  );

  const closeRightTags = useCallback(
    (url: string) => {
      const index = tags.findIndex(v => v.url === url);
      if (index < 0) return;
      const next = tags.slice(0, index + 1);
      setTags(next);
      if (!next.some(v => v.url === location.pathname)) navigate(next[next.length - 1].url);
    },
    [tags, location.pathname, navigate]
  );

  const refreshPage = useCallback(() => {
    clearRefreshTimers();
    setRefreshing(true);
    // 先展示 loading，再换 key 重挂页面，最后收起 loading
    const remountTimer = setTimeout(() => {
      setRefreshKey(key => key + 1);
      const doneTimer = setTimeout(() => setRefreshing(false), 280);
      refreshTimersRef.current.push(doneTimer);
    }, 180);
    refreshTimersRef.current.push(remountTimer);
  }, [clearRefreshTimers]);

  const value = useMemo(
    () => ({
      tags,
      setTags,
      activeUrl,
      addTag,
      switchTo,
      removeTag,
      closeOtherTags,
      closeLeftTags,
      closeRightTags,
      refreshKey,
      refreshing,
      refreshPage
    }),
    [tags, activeUrl, addTag, switchTo, removeTag, closeOtherTags, closeLeftTags, closeRightTags, refreshKey, refreshing, refreshPage]
  );

  return <MenuTagContext.Provider value={value}>{children}</MenuTagContext.Provider>;
};

export default MenuTagContext;
