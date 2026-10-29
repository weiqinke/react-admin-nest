import { CloseCircleFilled, HomeOutlined, LoginOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import styles from "./error.module.scss";

type ErrorMeta = {
  title: string;
  hint: string;
  action?: string;
};

const OAUTH_META: Record<string, ErrorMeta> = {
  "40105": {
    title: "授权已失效",
    hint: "登录会话过期或被重复使用，请重新发起第三方登录。",
    action: "重新授权"
  },
  "40106": {
    title: "授权未完成",
    hint: "与第三方平台换取凭证失败，可能是取消授权或网络异常。",
    action: "再试一次"
  },
  "40302": {
    title: "账号已禁用",
    hint: "该账号已被停用，无法通过第三方登录进入系统。",
    action: "返回登录"
  },
  "40402": {
    title: "登录方式不可用",
    hint: "当前环境未启用该第三方登录，请改用账号密码或其他方式。",
    action: "返回登录"
  },
  "40907": {
    title: "账号已被绑定",
    hint: "这个第三方账号已经关联到其他用户，请换一个账号或先解绑后再试。",
    action: "返回登录"
  },
  "40901": {
    title: "绑定冲突",
    hint: "当前用户已绑定该平台，无需重复绑定。",
    action: "返回登录"
  },
  "50001": {
    title: "服务暂时异常",
    hint: "服务器处理授权时出错，请稍后再试；若持续失败请联系管理员。",
    action: "稍后再试"
  }
};

function friendlyRawMessage(raw: string) {
  const text = raw.trim();
  if (!text) return "";
  if (/no rows in result set/i.test(text)) return "未找到对应账号数据";
  if (/invalid or expired oauth state/i.test(text)) return "授权状态无效或已过期";
  if (/oauth exchange failed/i.test(text)) return "第三方换票失败";
  if (/provider not found/i.test(text)) return "第三方登录未启用";
  if (/already bound/i.test(text)) return "第三方身份已绑定其他账号";
  if (/user is disabled/i.test(text)) return "账号已禁用";
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

const OAuthError = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get("code") || "";
  const rawMessage = params.get("message") || "";

  const meta = useMemo<ErrorMeta>(() => {
    if (OAUTH_META[code]) return OAUTH_META[code];
    const fallback = friendlyRawMessage(rawMessage);
    return {
      title: "第三方登录失败",
      hint: fallback || "授权过程中出现问题，请返回登录页重试。",
      action: "返回登录"
    };
  }, [code, rawMessage]);

  const detail = useMemo(() => {
    const parts: string[] = [];
    if (code) parts.push(`错误码 ${code}`);
    const raw = friendlyRawMessage(rawMessage);
    if (raw && raw !== meta.hint) parts.push(raw);
    return parts.join(" · ");
  }, [code, meta.hint, rawMessage]);

  const goLogin = () => navigate("/login", { replace: true });

  return (
    <div className={styles.page}>
      <div aria-hidden className={styles.glowA} />
      <div aria-hidden className={styles.glowB} />

      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.iconWrap}>
            <span className={styles.iconRing} aria-hidden />
            <CloseCircleFilled />
          </div>
          <div className={styles.headText}>
            <Typography.Title level={3} className={styles.title}>
              {meta.title}
            </Typography.Title>
            <Typography.Text type="secondary" className={styles.subtitle}>
              第三方 OAuth 登录
            </Typography.Text>
          </div>
        </div>

        <div className={styles.body}>
          <Typography.Paragraph className={styles.hint}>{meta.hint}</Typography.Paragraph>
        </div>

        {detail ? (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>详情：</span>
            {detail}
          </div>
        ) : (
          <div className={styles.spacer} />
        )}

        <div className={styles.actions}>
          <Button type="primary" className={`${styles.actionBtn} ${styles.actionPrimary}`} icon={<ReloadOutlined />} onClick={goLogin}>
            {meta.action || "返回登录"}
          </Button>
          <Button className={styles.actionBtn} icon={<LoginOutlined />} onClick={goLogin}>
            账号密码登录
          </Button>
          <Button className={styles.actionBtn} type="text" icon={<HomeOutlined />} onClick={() => navigate("/", { replace: true })}>
            回首页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
