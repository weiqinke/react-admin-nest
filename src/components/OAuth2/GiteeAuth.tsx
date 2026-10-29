import { oauthAuthorizeUrl } from "@/api/oauth";
import IconFont from "@/components/IconFont";
import { Button } from "antd";

const GiteeAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("gitee")}>
      <IconFont type="icon-gitee2" />
      Gitee
    </Button>
  );
};

export default GiteeAuth;
