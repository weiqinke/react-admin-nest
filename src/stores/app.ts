import { getUserState, subscribeSession, type UserState } from "@/api/session";
import { applyHeaderTheme, readStoredTheme, type ThemeName } from "@/theme/palette";
import { create } from "zustand";

export type UserProfile = {
  avatar?: string;
  nick?: string;
  [key: string]: any;
};

type AppState = {
  session: UserState;
  profile: UserProfile;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  session: getUserState(),
  profile: {},
  theme: readStoredTheme(),
  setTheme: theme => {
    if (get().theme === theme) return;
    applyHeaderTheme(theme);
    set({ theme });
  }
}));

let profileController: AbortController | null = null;

async function loadProfile(uid?: string) {
  profileController?.abort();
  if (!uid) {
    profileController = null;
    if (Object.keys(useAppStore.getState().profile).length > 0) useAppStore.setState({ profile: {} });
    return;
  }
  const controller = new AbortController();
  profileController = controller;
  try {
    const { userinfo } = await import("@/api/user");
    const res = await userinfo({ signal: controller.signal });
    if (!controller.signal.aborted) useAppStore.setState({ profile: res.data?.data?.profile || {} });
  } catch {
    /* 取消或失败时保留上一次资料 */
  }
}

// 模块热更新时卸掉上一次的订阅，避免登录态被通知多次。
const sessionHost = globalThis as typeof globalThis & { __nestAdminUnsubSession?: () => void };
sessionHost.__nestAdminUnsubSession?.();
sessionHost.__nestAdminUnsubSession = subscribeSession(session => {
  const prevUid = useAppStore.getState().session.uid;
  useAppStore.setState({ session });
  if (session.uid !== prevUid) void loadProfile(session.uid);
});

void loadProfile(useAppStore.getState().session.uid);
