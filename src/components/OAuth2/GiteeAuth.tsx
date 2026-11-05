import { oauthAuthorizeUrl } from "@/api/oauth";
import { GiteeIcon } from "@/components/OAuth2/brand-icons";
import { Button } from "antd";

const GiteeAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("gitee")}>
      <GiteeIcon />
      Gitee
    </Button>
  );
};

export default GiteeAuth;
