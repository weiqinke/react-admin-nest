import { hasPermission, listMyAnnouncements, markAnnouncementRead } from "@/api/announcement";
import { logout as apiLogout } from "@/api/user";
import { clearSession } from "@/api/session";
import { createStaleRefresh } from "@/utils/staleRefresh";
import { Checkbox, Modal } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type Item = {
  id: string;
  title: string;
  content: string;
};

async function loadUnread(query: Record<string, any>) {
  const result = await listMyAnnouncements({ ...query, unread: 1, page: 1, page_size: 20 });
  if (result.data.code !== 0) return [];
  return (result.data.data?.list || []) as Item[];
}

const AnnouncementGate: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [required, setRequired] = useState<Item[]>([]);
  const [normal, setNormal] = useState<Item | null>(null);
  const [agreed, setAgreed] = useState(false);

  const refresh = useMemo(
    () =>
      createStaleRefresh(async () => {
        const blocking = await loadUnread({ level: "required" });
        setRequired(blocking);
        setAgreed(false);
        if (blocking.length > 0) {
          setNormal(null);
          return;
        }
        const notices = await loadUnread({ type: "system", level: "normal" });
        setNormal(notices[0] || null);
      }),
    []
  );

  useEffect(() => {
    void refresh(true).catch(() => undefined);
    const onFocus = () => {
      void refresh().catch(() => undefined);
    };
    const onRefresh = () => {
      void refresh(true).catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("announcements:refresh", onRefresh);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("announcements:refresh", onRefresh);
    };
  }, [refresh]);

  const adminBypass = location.pathname.startsWith("/management/placardadmin") && hasPermission("announcement:write");
  const current = required[0];
  const showRequired = Boolean(current) && !adminBypass;

  const confirmRequired = async () => {
    if (!current) return;
    await markAnnouncementRead(current.id);
    await refresh(true);
  };

  const confirmNormal = async () => {
    if (!normal) return;
    await markAnnouncementRead(normal.id);
    await refresh(true);
  };

  const leave = () => {
    apiLogout()
      .catch(() => undefined)
      .finally(() => {
        clearSession();
        navigate("/login");
      });
  };

  return (
    <>
      <Modal
        open={showRequired}
        title={current?.title || "系统公告"}
        closable={false}
        maskClosable={false}
        keyboard={false}
        okText="我已阅读并同意"
        cancelText="退出登录"
        okButtonProps={{ disabled: !agreed }}
        onOk={confirmRequired}
        onCancel={leave}
        width={640}>
        <div className="max-h-[360px] overflow-auto whitespace-pre-wrap">{current?.content}</div>
        <Checkbox className="mt-4" checked={agreed} onChange={event => setAgreed(event.target.checked)}>
          我已阅读上述内容
        </Checkbox>
      </Modal>
      <Modal
        open={Boolean(normal) && !showRequired}
        title={normal?.title}
        closable={false}
        maskClosable={false}
        keyboard={false}
        okText="确认收到"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={confirmNormal}
        width={600}>
        <div className="max-h-[360px] overflow-auto whitespace-pre-wrap">{normal?.content}</div>
      </Modal>
    </>
  );
};

export default AnnouncementGate;
