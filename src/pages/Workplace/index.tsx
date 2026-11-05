import { hasPermission } from "@/api/announcement";
import { getMe, getMyProfile } from "@/api/goadmin";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Space, Tag } from "antd";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./index.module.scss";

const Feeds = lazy(() => import("./Feeds"));

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const ENTRIES: { title: string; desc: string; path: string; permission?: string }[] = [
  { title: "消息中心", desc: "站内信、待办和公告", path: "/account?tab=MessageCenter" },
  { title: "我的工单", desc: "提交、跟踪和评价", path: "/mytickets" },
  { title: "个人资料", desc: "昵称、部门和联系方式", path: "/account" },
  { title: "AI 对话", desc: "向已启用的模型提问", path: "/aichat", permission: "ai:use" },
  { title: "数据看板", desc: "登录与访问趋势", path: "/workbench", permission: "stats:read" },
  { title: "用户管理", desc: "账号、角色和状态", path: "/management/useradmin", permission: "user:read" },
  { title: "工单处理", desc: "分派、处理和关闭", path: "/management/ticketadmin", permission: "ticket:read" },
  { title: "公告管理", desc: "起草、发布和催办", path: "/management/placardadmin", permission: "announcement:read" }
];

type ProfileCard = {
  nick: string;
  department: string;
  jobTitle: string;
  avatar: string;
  roles: string[];
};

function greet(hour: number) {
  if (hour < 5) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function roleLabel(role: any) {
  if (typeof role === "string") return role;
  return String(role?.name || role?.code || "");
}

const Workplace = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileCard>({
    nick: localStorage.getItem("nick") || "",
    department: "",
    jobTitle: "",
    avatar: localStorage.getItem("avatar") || "",
    roles: []
  });

  const now = new Date();
  const dateLabel = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`;
  const hello = profile.nick ? `${greet(now.getHours())}，${profile.nick}` : greet(now.getHours());
  const entries = ENTRIES.filter(item => !item.permission || hasPermission(item.permission));
  const orgLine = [profile.department, profile.jobTitle].filter(Boolean).join("，");

  useEffect(() => {
    Promise.all([getMe(), getMyProfile()])
      .then(([me, profileRes]) => {
        const user = me.data?.data || {};
        const detail = profileRes.data?.data || {};
        const roles = (Array.isArray(user.active_roles) && user.active_roles.length ? user.active_roles : user.roles || []).map(roleLabel).filter(Boolean);
        setProfile({
          nick: detail.nickname || user.profile?.nickname || user.username || localStorage.getItem("nick") || "",
          department: detail.department || "",
          jobTitle: detail.job_title || "",
          avatar: detail.avatar || localStorage.getItem("avatar") || "",
          roles
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className={styles.container}>
      <div className={`admin-card ${styles.welcomeCard}`}>
        <div className={styles.welcome}>
          <Avatar size={48} src={profile.avatar || undefined} icon={<UserOutlined />} alt={profile.nick || "头像"} />
          <div className={styles.welcomeMain}>
            <div className={styles.hello}>{hello}</div>
            <div className={styles.identity}>
              {orgLine ? (
                <span>{orgLine}</span>
              ) : (
                <Button className={styles.linkish} type="link" size="small" onClick={() => navigate("/account")}>
                  补充部门和岗位
                </Button>
              )}
              <Space size={4} wrap>
                {profile.roles.slice(0, 4).map(role => (
                  <Tag key={role}>{role}</Tag>
                ))}
              </Space>
            </div>
          </div>
          <div className={styles.dateLabel}>{dateLabel}</div>
        </div>
        <div className={styles.entries}>
          {entries.map(item => (
            <button key={item.path} type="button" className={styles.entry} onClick={() => navigate(item.path)}>
              <span className={styles.entryTitle}>{item.title}</span>
              <span className={styles.entryDesc}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <Suspense fallback={null}>
        <Feeds />
      </Suspense>
    </div>
  );
};

export default Workplace;
