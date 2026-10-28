import { formatURL, getMenuItemByID, getMenuItemByUrl } from "@/utils/menuUtils";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

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
  refresh: boolean;
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
  refresh: false,
  refreshPage: () => null
});

export const MenuTagContextProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeUrl = location.pathname;

  const [tags, setTags] = useState<MenuTagItem[]>([]);
  const [refresh, setRefresh] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const url = location.pathname;
    if (!url) return;
    setTags(prev => {
      if (prev.length) return prev;
      const initItem = getMenuItemByUrl(url.split("/").pop());
      return [{ url, name: initItem?.name }];
    });
  }, [location.pathname]);

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
    setRefresh(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => setRefresh(false), 2000);
  }, []);

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
      refresh,
      refreshPage
    }),
    [tags, activeUrl, addTag, switchTo, removeTag, closeOtherTags, closeLeftTags, closeRightTags, refresh, refreshPage]
  );

  return <MenuTagContext.Provider value={value}>{children}</MenuTagContext.Provider>;
};

export default MenuTagContext;
