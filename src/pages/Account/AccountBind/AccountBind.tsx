import { listOAuthBindings, OAUTH_PROVIDERS, oauthBindUrl, type OAuthProvider, unbindOAuth } from "@/api/oauth";
import IconFont from "@/components/IconFont";
import { GithubOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Listy, Spin, message } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type Binding = {
  provider: string;
  provider_user_id?: string;
  provider_login?: string;
  email?: string;
  avatar_url?: string;
};

function providerIcon(provider: OAuthProvider) {
  if (provider === "gitee") {
    return <IconFont type="icon-gitee2" className="mt-3 text-[40px]" />;
  }
  if (provider === "oidc") {
    return <SafetyCertificateOutlined className="mt-3 text-[40px]" />;
  }
  return <GithubOutlined className="mt-3 text-[40px]" />;
}

const AccountBind: React.FC = function () {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>("");
  const [bindings, setBindings] = useState<Binding[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOAuthBindings();
      setBindings(res.data?.data?.items || []);
    } catch {
      setBindings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byProvider = useMemo(() => {
    const map = new Map<string, Binding>();
    bindings.forEach(item => map.set(item.provider, item));
    return map;
  }, [bindings]);

  const onBind = (provider: OAuthProvider) => {
    window.location.href = oauthBindUrl(provider);
  };

  const onUnbind = async (provider: OAuthProvider, label: string) => {
    setBusy(provider);
    try {
      await unbindOAuth(provider);
      message.success(`已解绑 ${label}`);
      setBindings(prev => prev.filter(item => item.provider !== provider));
    } catch {
      /* 拦截器已提示 */
    } finally {
      setBusy("");
    }
  };

  const items = OAUTH_PROVIDERS.map(({ key, label }) => {
    const bound = byProvider.get(key);
    const description = bound
      ? `已绑定：${bound.provider_login || bound.provider_user_id || label}${bound.email ? `（${bound.email}）` : ""}`
      : `当前未绑定 ${label} 账号`;
    return {
      key,
      label,
      icon: providerIcon(key),
      title: `绑定 ${label}`,
      description,
      bound: Boolean(bound)
    };
  });

  return (
    <div>
      <Divider titlePlacement="left" plain>
        第三方账号
      </Divider>
      <Spin spinning={loading || Boolean(busy)}>
        <Listy
          className="pr-3 text-[17px]"
          items={items}
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
              {item.bound ? (
                <Button type="link" danger onClick={() => onUnbind(item.key, item.label)}>
                  解绑
                </Button>
              ) : (
                <Button type="link" onClick={() => onBind(item.key)}>
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
