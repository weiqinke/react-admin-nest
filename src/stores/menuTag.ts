import { formatURL, getMenuItemByID, pageTagName } from "@/utils/menuUtils";
import type { NavigateFunction } from "react-router";
import { create } from "zustand";

export type MenuTagItem = {
  url: string;
  name: string;
};

type TagUpdater = MenuTagItem[] | ((prev: MenuTagItem[]) => MenuTagItem[]);

type MenuTagState = {
  tags: MenuTagItem[];
  activeUrl: string;
  refreshKey: number;
  refreshing: boolean;
  setTags: (next: TagUpdater) => void;
  syncRoute: (url: string, missed: boolean) => void;
  addTag: (urls: string[], id: string | number) => void;
  switchTo: (url: string) => void;
  removeTag: (url: string) => void;
  closeOtherTags: (url: string) => void;
  closeLeftTags: (url: string) => void;
  closeRightTags: (url: string) => void;
  refreshPage: () => void;
};

let navigateTo: NavigateFunction | null = null;

export function bindMenuTagNavigate(navigate: NavigateFunction) {
  navigateTo = navigate;
  return () => {
    if (navigateTo === navigate) navigateTo = null;
  };
}

function go(url: string) {
  navigateTo?.(url);
}

const refreshTimers: ReturnType<typeof setTimeout>[] = [];

function clearRefreshTimers() {
  refreshTimers.forEach(timer => clearTimeout(timer));
  refreshTimers.length = 0;
}

export const useMenuTagStore = create<MenuTagState>((set, get) => ({
  tags: [],
  activeUrl: "",
  refreshKey: 0,
  refreshing: false,
  setTags: next => {
    set(state => {
      const tags = typeof next === "function" ? next(state.tags) : next;
      return tags === state.tags ? state : { tags };
    });
  },
  syncRoute: (url, missed) => {
    if (!url) return;
    const name = pageTagName(url, missed);
    set(state => {
      let tags = state.tags;
      if (name) {
        const existing = tags.find(tag => tag.url === url);
        if (!existing) tags = [...tags, { url, name }];
        else if (existing.name !== name) tags = tags.map(tag => (tag.url === url ? { ...tag, name } : tag));
      }
      if (tags === state.tags && state.activeUrl === url) return state;
      return { tags, activeUrl: url };
    });
  },
  addTag: (urls, id) => {
    const path = formatURL("/" + urls.join("/"));
    set(state => {
      if (state.tags.some(tag => tag.url === path)) return state;
      const item = getMenuItemByID(id);
      if (!item) return state;
      return { tags: [...state.tags, { url: path, name: item.name }] };
    });
  },
  switchTo: url => {
    if (url !== get().activeUrl) go(url);
  },
  removeTag: url => {
    const { tags, activeUrl } = get();
    if (tags.length <= 1) return;
    const next = tags.filter(tag => tag.url !== url);
    set({ tags: next });
    if (url === activeUrl) go(next[next.length - 1].url);
  },
  closeOtherTags: url => {
    const item = get().tags.find(tag => tag.url === url);
    if (!item) return;
    set({ tags: [item] });
    get().switchTo(url);
  },
  closeLeftTags: url => {
    const { tags, activeUrl } = get();
    const index = tags.findIndex(tag => tag.url === url);
    if (index < 0) return;
    const next = tags.slice(index);
    set({ tags: next });
    if (!next.some(tag => tag.url === activeUrl)) go(next[0].url);
  },
  closeRightTags: url => {
    const { tags, activeUrl } = get();
    const index = tags.findIndex(tag => tag.url === url);
    if (index < 0) return;
    const next = tags.slice(0, index + 1);
    set({ tags: next });
    if (!next.some(tag => tag.url === activeUrl)) go(next[next.length - 1].url);
  },
  refreshPage: () => {
    clearRefreshTimers();
    set({ refreshing: true });
    // 先展示 loading，再换 key 重挂页面，最后收起 loading
    const remountTimer = setTimeout(() => {
      set(state => ({ refreshKey: state.refreshKey + 1 }));
      const doneTimer = setTimeout(() => set({ refreshing: false }), 280);
      refreshTimers.push(doneTimer);
    }, 180);
    refreshTimers.push(remountTimer);
  }
}));
