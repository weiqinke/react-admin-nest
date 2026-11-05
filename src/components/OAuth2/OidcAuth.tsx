import { oauthAuthorizeUrl } from "@/api/oauth";
import { SsoIcon } from "@/components/OAuth2/brand-icons";
import { Button } from "antd";

const OidcAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("oidc")}>
      <SsoIcon />
      企业 SSO
    </Button>
  );
};

export default OidcAuth;
