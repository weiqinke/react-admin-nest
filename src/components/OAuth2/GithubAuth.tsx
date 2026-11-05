import { oauthAuthorizeUrl } from "@/api/oauth";
import { GithubIcon } from "@/components/OAuth2/brand-icons";
import { Button } from "antd";

const GithubAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("github")}>
      <GithubIcon />
      Github
    </Button>
  );
};

export default GithubAuth;
