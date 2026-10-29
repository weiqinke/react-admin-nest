import { oauthAuthorizeUrl } from "@/api/oauth";
import { GithubOutlined } from "@ant-design/icons";
import { Button } from "antd";

const GithubAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("github")}>
      <GithubOutlined />
      Github
    </Button>
  );
};

export default GithubAuth;
