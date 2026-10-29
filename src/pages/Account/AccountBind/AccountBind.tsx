import { listOAuthBindings, oauthBindUrl, unbindOAuth } from "@/api/oauth";
import { GithubOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Listy, Spin, message } from "antd";
import React, { useCallback, useEffect, useState } from "react";

type Binding = {
  provider: string;
  provider_user_id?: string;
  provider_login?: string;
  email?: string;
  avatar_url?: string;
};

const AccountBind: React.FC = function () {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [github, setGithub] = useState<Binding | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOAuthBindings();
      const items: Binding[] = res.data?.data?.items || [];
      setGithub(items.find(item => item.provider === "github") || null);
    } catch {
      setGithub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onBind = () => {
    window.location.href = oauthBindUrl("github");
  };

  const onUnbind = async () => {
    setBusy(true);
    try {
      await unbindOAuth("github");
      message.success("已解绑 GitHub");
      setGithub(null);
    } catch {
      /* 拦截器已提示 */
    } finally {
      setBusy(false);
    }
  };

  const bound = Boolean(github);
  const description = bound
    ? `已绑定：${github?.provider_login || github?.provider_user_id || "GitHub"}${github?.email ? `（${github.email}）` : ""}`
    : "当前未绑定 GitHub 账号";

  return (
    <div>
      <Divider titlePlacement="left" plain>
        第三方账号
      </Divider>
      <Spin spinning={loading || busy}>
        <Listy
          className="pr-3 text-[17px]"
          items={[
            {
              key: "github",
              icon: <GithubOutlined className="mt-3 text-[40px]" />,
              title: "绑定 GitHub",
              description
            }
          ]}
          rowKey="key"
          itemRender={item => (
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={16}>
                {item.icon}
                <Flex vertical>
                  <span className="text-[17px]">{item.title}</span>
                  <span className="text-[17px]">{item.description}</span>
                </Flex>
              </Flex>
              {bound ? (
                <Button type="link" danger onClick={onUnbind}>
                  解绑
                </Button>
              ) : (
                <Button type="link" onClick={onBind}>
                  绑定
                </Button>
              )}
            </Flex>
          )}
        />
      </Spin>
    </div>
  );
};

export default AccountBind;
