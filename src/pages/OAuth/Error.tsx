import { Button, Result } from "antd";
import { useNavigate, useSearchParams } from "react-router";

const OAUTH_HINTS: Record<string, string> = {
  "40105": "授权状态无效或已过期，请重试",
  "40106": "与 GitHub 换票失败，请重试",
  "40302": "账号已禁用",
  "40402": "GitHub 登录未启用",
  "40907": "该 GitHub 账号已绑定其他用户"
};

const OAuthError = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get("code") || "";
  const message = params.get("message") || "";
  const hint = OAUTH_HINTS[code] || message || "第三方登录失败";

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Result
        status="error"
        title="第三方登录失败"
        subTitle={code ? `${hint}（${code}）` : hint}
        extra={[
          <Button type="primary" key="login" onClick={() => navigate("/login", { replace: true })}>
            返回登录
          </Button>
        ]}
      />
    </div>
  );
};

export default OAuthError;
