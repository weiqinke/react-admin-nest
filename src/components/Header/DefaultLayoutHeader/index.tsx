import ProjectContext from "@/contexts/ProjectContext";
import { webSocketManager } from "@/utils/ws";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Modal, notification } from "antd";
import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import HeaderNotice from "../HeaderNotice";

import { uploadWsScreenshot } from "@/api/goadmin";
import { logout as apiLogout } from "@/api/user";
import { clearSession } from "@/api/session";
import MenuTagContext from "@/contexts/MenuTagContext";
import styles from "./index.module.scss";
import ThemeColor from "../ThemeColor";

const statusText: Record<string, string> = {
  idle: "未连接",
  connecting: "连接中",
  connected: "在线",
  reconnecting: "重连中",
  offline: "离线"
};

function toJpeg(source: HTMLCanvasElement) {
  const max = 1920;
  const scale = Math.min(1, max / Math.max(source.width, source.height, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise<{ blob: Blob; width: number; height: number }>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) reject(new Error("截屏失败"));
        else resolve({ blob, width: canvas.width, height: canvas.height });
      },
      "image/jpeg",
      0.7
    );
  });
}

const DefaultLayoutHeader = () => {
  const { profile, setValue } = useContext<any>(ProjectContext);
  const { addTag, setTags, switchTo } = useContext(MenuTagContext);
  const navigate = useNavigate();

  const [wsStatus, setWsStatus] = useState(webSocketManager.status || "idle");

  const toggleLanguage = () => {
    const language = localStorage.getItem("language");
    if (language === "zh") {
      localStorage.setItem("language", "en");
    } else {
      localStorage.setItem("language", "zh");
    }
  };

  const logout = useCallback(() => {
    apiLogout()
      .catch(() => undefined)
      .finally(() => {
        clearSession();
        setValue({});
        navigate("/login");
      });
  }, [setValue, navigate]);

  const items: MenuProps["items"] = [
    {
      label: "个人中心",
      key: "1"
    },
    {
      label: "切换语言",
      key: "2"
    },
    {
      label: "退出登录",
      key: "3"
    },
    {
      label: "订阅",
      key: "4"
    }
  ];
  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      addTag(["profile"], 145);
      return navigate("/profile");
    }
    if (key === "2") return toggleLanguage();
    if (key === "3") return logout();
    if (key === "4") {
      setTags((prev: { url: string }[]) => (prev.some(tag => tag.url === "/subscribe") ? prev : [...prev, { url: "/subscribe", name: "订阅" }]));
      switchTo("/subscribe");
    }
  };

  const captureScreen = async (requestId: string) => {
    const { domToCanvas } = await import("modern-screenshot");
    const result = await domToCanvas(document.body, {
      scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2
    });
    const shot = await toJpeg(result);
    const uploaded = await uploadWsScreenshot(shot.blob, requestId);
    const file = uploaded?.data?.data || {};
    webSocketManager.postMessage({
      type: "screen.ready",
      data: {
        request_id: requestId,
        url: file.url,
        expires_at: file.expires_at,
        width: shot.width,
        height: shot.height
      }
    });
  };

  const askScreen = (data: any) => {
    const requestId = data?.request_id;
    if (!requestId) return;
    const name = data.from_username || "管理员";
    Modal.confirm({
      title: `${name} 请求查看当前界面`,
      okText: "允许",
      cancelText: "拒绝",
      onOk: () => {
        webSocketManager.postMessage({ type: "screen.accept", data: { request_id: requestId } });
        window.setTimeout(() => {
          captureScreen(requestId).catch(() => {
            webSocketManager.postMessage({ type: "screen.error", data: { request_id: requestId, message: "capture failed" } });
          });
        }, 300);
      },
      onCancel: () => {
        webSocketManager.postMessage({ type: "screen.denied", data: { request_id: requestId } });
      }
    });
  };

  useEffect(() => {
    setWsStatus(webSocketManager.status || "idle");
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const data = payload?.data || {};
      if (payload?.type === "connection.status") {
        setWsStatus(data.status || "idle");
      }
      if (payload?.type === "admin.force_offline") {
        webSocketManager.close();
        logout();
      }
      if (payload?.type === "screen.request") {
        askScreen(data);
      }
      if (payload?.type === "notify.message") {
        notification.info({ message: data.title || "通知", description: data.content });
      }
      if (payload?.type === "notice.message") {
        notification.info({
          message: data.title || (data.kind === "todo" ? "新待办" : "新消息"),
          description: data.content
        });
        window.dispatchEvent(new Event("notice:refresh"));
      }
      if (payload?.type === "presence.user_online" || payload?.type === "presence.user_offline") {
        const who = data.note ? `${data.note}（${data.username}）` : data.username;
        notification.info({ message: `${who || "用户"} ${payload.type === "presence.user_online" ? "已上线" : "已下线"}` });
      }
      if (payload?.type === "presence.catch_up") {
        const items = data.items || [];
        notification.info({
          message: `你关注的 ${items.length} 人有上线/下线动态`,
          onClick: () => {
            Modal.info({
              title: "订阅动态",
              content: (
                <div>
                  {(webSocketManager.catchUpItems || items).map((item: any) => (
                    <div key={`${item.user_id}-${item.at}`}>{(item.note || item.username) + (item.event_type === "offline" ? " 下线" : " 上线")}</div>
                  ))}
                </div>
              )
            });
          }
        });
      }
    });
    return () => removeHandler();
  }, [logout]);

  return (
    <div className={`${styles.layoutHeader} bg-header-bg text-header-text`}>
      <div className={styles.logo} onClick={() => navigate("/workplace")}>
        <span className={styles.title}>nest-admin</span>
      </div>
      <div className={`${styles.user} bg-header-bg text-header-icon hover:bg-header-icon-hover-bg hover:text-header-icon-hover`}>
        <Dropdown menu={{ items, onClick }}>
          <div className={styles.nameContainer}>
            <Avatar src={profile?.avatar || "https://dr.cdnux.com/18510675/i/2025/01/04/65a29b436889b.jpg"} icon={<UserOutlined />} />
            <span className={styles.name}>{profile?.nick}</span>
            <span className="ml-2 text-xs text-[#898989]">{statusText[wsStatus] || wsStatus}</span>
          </div>
        </Dropdown>
      </div>
      <HeaderNotice />
      <ThemeColor />
    </div>
  );
};

export default DefaultLayoutHeader;
