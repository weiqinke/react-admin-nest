import { getMe, getMyMenus } from "@/api/goadmin";
import { saveLoginSession } from "@/api/session";
import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { getUserState } from "@/utils/core";
import { adaptApiMenus, saveMenus } from "@/utils/menuUtils";
import { webSocketManager } from "@/utils/ws";
import { Alert, Spin, message } from "antd";
import { useContext, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

async function hydrateSession() {
  try {
    const me = await getMe();
    const user = me.data?.data;
    if (user) {
      saveLoginSession({ user });
    }
  } catch {
    /* token 已写入，/api/me 失败时仍可进站，权限可能不全 */
  }
  try {
    const menus = await getMyMenus();
    const list = adaptApiMenus(menus.data?.data?.list || []);
    saveMenus(JSON.stringify(list));
  } catch {
    /* 菜单拉取失败不阻断登录 */
  }
}

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setValue }: any = useContext(ProjectContext);
  const { setTags } = useContext(MenuTagContext);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const mode = params.get("mode") || "login";
    const provider = params.get("provider") || "github";

    (async () => {
      if (mode === "bind") {
        if (params.get("bound") === "1") {
          message.success(`${provider} 绑定成功`);
          navigate("/account", { replace: true });
          return;
        }
        message.error("绑定失败");
        navigate("/oauth/error", { replace: true });
        return;
      }

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (!access_token || !refresh_token) {
        message.error("OAuth 回调缺少 token");
        navigate("/oauth/error?message=" + encodeURIComponent("缺少 access_token / refresh_token"), { replace: true });
        return;
      }

      saveLoginSession({
        token: access_token,
        refresh_token,
        expires_at: params.get("expires_at") || undefined,
        refresh_expires_at: params.get("refresh_expires_at") || undefined,
        user: {
          id: params.get("user_id") || undefined,
          username: params.get("username") || undefined
        }
      });

      await hydrateSession();
      setValue(getUserState());
      setTags?.([]);
      webSocketManager.create();
      message.success("登录成功");
      navigate("/workplace", { replace: true });
    })();
  }, [navigate, params, setTags, setValue]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spin description="正在完成第三方登录…">
        <Alert message="OAuth 回调处理中" description="请稍候，完成后会自动跳转。" type="info" />
      </Spin>
    </div>
  );
};

export default OAuthCallback;
