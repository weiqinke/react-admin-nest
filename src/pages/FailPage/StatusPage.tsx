import { getIndexUrl } from "@/utils/menuUtils";
import { Button, Result } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const COPY = {
  "404": { title: "404", subTitle: "此页面丢失了。" },
  "403": { title: "无权限", subTitle: "当前账号不能打开这个页面。" }
} as const;

function homeTarget() {
  try {
    const target = getIndexUrl();
    if (target?.pathname) return target.pathname;
  } catch {
    // 没有菜单时回到工作台；会话无效会再被带到登录页。
  }
  return "/workplace";
}

const StatusPage = ({ status }: { status: keyof typeof COPY }) => {
  const navigate = useNavigate();
  const copy = COPY[status];
  useEffect(() => {
    if (status === "403") document.title = "无权限";
  }, [status]);
  return (
    <Result
      status={status}
      title={copy.title}
      subTitle={copy.subTitle}
      extra={
        <Button type="primary" onClick={() => navigate(homeTarget())}>
          返回主页
        </Button>
      }
    />
  );
};

export default StatusPage;
