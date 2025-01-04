import { GithubOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useState } from "react";

const GithubAuth = () => {
  const [link, setLink] = useState<any>("");
  useEffect(() => {
    const client_id = "Ov23liFaKrYrVi01nfLN";
    const authorize_uri = "https://github.com/login/oauth/authorize";
    const redirect_uri = "https://nest-admin.com/login";
    setLink(`${authorize_uri}?client_id=${client_id}&scope=user:email&redirect_uri=${redirect_uri}&state=github`);
  }, []);
  return (
    <Button type="link" href={link}>
      <GithubOutlined />
      Github
    </Button>
  );
};

export default GithubAuth;
