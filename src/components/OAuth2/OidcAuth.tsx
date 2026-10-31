import { oauthAuthorizeUrl } from "@/api/oauth";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { Button } from "antd";

const OidcAuth = () => {
  return (
    <Button type="link" href={oauthAuthorizeUrl("oidc")}>
      <SafetyCertificateOutlined />
      企业 SSO
    </Button>
  );
};

export default OidcAuth;
