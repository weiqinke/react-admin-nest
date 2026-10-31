import { hasPermission, listMyAnnouncements, markAnnouncementRead } from "@/api/announcement";
import { listPublishedChangelogs } from "@/api/changelog";
import { getMe, getMyProfile } from "@/api/goadmin";
import { listMyNotices, markNoticeRead, setNoticeTodo } from "@/api/notice";
import { TICKET_PRIORITY, formatDueInSeconds, listMyTickets, ticketOverdue } from "@/api/platform";
import { getUserState } from "@/api/session";
import TicketStatusTag from "@/components/TicketStatusTag";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Empty, Modal, Row, Space, Tag, Timeline, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";

import styles from "./index.module.scss";

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const NOTICE_CATEGORY: Record<string, string> = {
  system: "系统",
  task: "任务",
  mention: "提及",
  approval: "审批",
  security: "安全"
};

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

function snippet(value?: string, max = 72) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatTime(value?: string) {
  if (!value) return "";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : "";
}

function roleLabel(role: any) {
  if (typeof role === "string") return role;
  return String(role?.name || role?.code || "");
}

function dueLabel(item: any) {
  if (item?.due_in_seconds != null && Number.isFinite(Number(item.due_in_seconds))) {
    return formatDueInSeconds(Number(item.due_in_seconds));
  }
  if (!item?.due_at) return "";
  const time = formatTime(item.due_at);
  return ticketOverdue(item) ? `已过期 ${time}` : time;
}

function Bits({ bits }: { bits: ReactNode[] }) {
  const items = bits.filter(bit => bit !== null && bit !== undefined && bit !== false && bit !== "");
  return (
    <span className={styles.bits}>
      {items.map((bit, index) => (
        <span key={index}>{bit}</span>
      ))}
    </span>
  );
}

function Feed({ items, empty, render }: { items: any[]; empty: ReactNode; render: (item: any) => ReactNode }) {
  if (!items.length) return <>{empty}</>;
  return (
    <ul className={styles.feed}>
      {items.map(item => (
        <li key={item.id} className={styles.feedItem}>
          {render(item)}
        </li>
      ))}
    </ul>
  );
}

function Panel({ id, title, extra, children }: { id: string; title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-card" id={id}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

const Workplace = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTotal, setAnnouncementTotal] = useState(0);
  const [current, setCurrent] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [acting, setActing] = useState("");
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
  const viewerId = String(getUserState().uid || "");
  const entries = ENTRIES.filter(item => !item.permission || hasPermission(item.permission));
  const orgLine = [profile.department, profile.jobTitle].filter(Boolean).join("，");

  const loadAnnouncements = () => {
    Promise.all([listMyAnnouncements({ page: 1, page_size: 20 }), listMyAnnouncements({ page: 1, page_size: 20, level: "required", unread: 1 }).catch(() => null)])
      .then(([all, required]) => {
        const base = all.data?.data?.list || [];
        const extra = required?.data?.data?.list || [];
        const merged = new Map<string, any>();
        [...extra, ...base].forEach(item => merged.set(String(item.id), item));
        const list = Array.from(merged.values()).sort((left, right) => {
          const leftRank = left.level === "required" && !left.read ? 0 : left.read ? 2 : 1;
          const rightRank = right.level === "required" && !right.read ? 0 : right.read ? 2 : 1;
          if (leftRank !== rightRank) return leftRank - rightRank;
          return (Date.parse(right.published_at || "") || 0) - (Date.parse(left.published_at || "") || 0);
        });
        setAnnouncements(list);
        setAnnouncementTotal(Math.max(Number(all.data?.data?.total || 0), list.length));
      })
      .catch(() => {
        setAnnouncements([]);
        setAnnouncementTotal(0);
      });
  };

  const loadTodos = () => {
    listMyNotices({ kind: "todo", todo_status: "pending", page: 1, page_size: 8 })
      .then(res => setTodos(res.data?.data?.list || []))
      .catch(() => setTodos([]));
  };

  const loadInbox = () => {
    listMyNotices({ kind: "inbox", unread: 1, page: 1, page_size: 8 })
      .then(res => setInbox(res.data?.data?.list || []))
      .catch(() => setInbox([]));
  };

  const loadTickets = () => {
    listMyTickets({ page: 1, page_size: 30 })
      .then(res => setTickets(res.data?.data?.list || []))
      .catch(() => setTickets([]));
  };

  useEffect(() => {
    loadAnnouncements();
    loadTodos();
    loadInbox();
    loadTickets();
    listPublishedChangelogs({ page: 1, page_size: 5 })
      .then(res => setChangelogs(res.data?.data?.list || []))
      .catch(() => setChangelogs([]));
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

  useEffect(() => {
    const id = params.get("announcement_id");
    if (!id || !announcements.length) return;
    const found = announcements.find(item => String(item.id) === id);
    if (found) setCurrent(found);
  }, [params, announcements]);

  const openAnnouncement = async (item: any) => {
    setCurrent(item);
    if (!item.read) {
      await markAnnouncementRead(String(item.id));
      loadAnnouncements();
    }
  };

  const closeAnnouncement = () => {
    setCurrent(null);
    if (params.get("announcement_id")) {
      params.delete("announcement_id");
      setParams(params, { replace: true });
    }
  };

  const openInternal = (path?: string) => {
    if (!path || !path.startsWith("/") || path.startsWith("//")) return;
    navigate(path);
  };

  const finishTodo = async (id: string, status: "done" | "dismissed") => {
    setActing(`${id}:${status}`);
    try {
      await setNoticeTodo(id, status);
      message.success(status === "done" ? "已办结" : "已忽略");
      loadTodos();
    } finally {
      setActing("");
    }
  };

  const openNotice = async (item: any) => {
    if (!item.read) {
      await markNoticeRead(String(item.id));
      loadInbox();
    }
    openInternal(item.link_path);
  };

  const visibleAnnouncements = announcements.slice(0, 6);
  const openTicketRows = tickets.filter(item => item.status !== "closed").slice(0, 6);

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

      <Row gutter={[12, 12]} className={styles.block}>
        <Col xs={24} lg={14}>
          <Panel
            id="workplace-todos"
            title="待办"
            extra={
              <Button type="link" size="small" onClick={() => navigate("/account?tab=MessageCenter")}>
                消息中心
              </Button>
            }>
            <Feed
              items={todos}
              empty={<Empty description="没有待办。分派给你的工单会记在这里。" />}
              render={item => (
                <>
                  <div className={styles.feedMain}>
                    <div className={styles.feedTitle}>
                      {item.pinned ? <Tag color="blue">置顶</Tag> : null}
                      {item.title}
                    </div>
                    <Bits bits={[NOTICE_CATEGORY[item.category] || item.category, formatTime(item.created_at), snippet(item.content, 48)]} />
                  </div>
                  <div className={styles.feedActions}>
                    {item.link_path ? (
                      <Button type="link" size="small" onClick={() => openInternal(item.link_path)}>
                        打开
                      </Button>
                    ) : null}
                    <Button type="link" size="small" loading={acting === `${item.id}:done`} onClick={() => finishTodo(String(item.id), "done")}>
                      办结
                    </Button>
                    <Button type="link" size="small" loading={acting === `${item.id}:dismissed`} onClick={() => finishTodo(String(item.id), "dismissed")}>
                      忽略
                    </Button>
                  </div>
                </>
              )}
            />
          </Panel>
        </Col>
        <Col xs={24} lg={10}>
          <Panel
            id="workplace-inbox"
            title="未读消息"
            extra={
              <Button type="link" size="small" onClick={() => navigate("/account?tab=MessageCenter")}>
                全部
              </Button>
            }>
            <Feed
              items={inbox}
              empty={<Empty description="没有未读消息。" />}
              render={item => (
                <>
                  <div className={styles.feedMain}>
                    <div className={styles.feedTitle}>{item.title}</div>
                    <Bits bits={[NOTICE_CATEGORY[item.category] || item.category, formatTime(item.created_at), snippet(item.content, 42)]} />
                  </div>
                  <div className={styles.feedActions}>
                    <Button type="link" size="small" onClick={() => openNotice(item)}>
                      {item.link_path ? "查看" : "标为已读"}
                    </Button>
                  </div>
                </>
              )}
            />
          </Panel>
        </Col>
      </Row>

      <Row gutter={[12, 12]} className={styles.block}>
        <Col xs={24} lg={14}>
          <Panel
            id="workplace-tickets"
            title="未关闭工单"
            extra={
              <Button type="link" size="small" onClick={() => navigate("/mytickets")}>
                我的工单
              </Button>
            }>
            <Feed
              items={openTicketRows}
              empty={
                <Empty description="没有未关闭的工单。">
                  <Button type="primary" onClick={() => navigate("/mytickets")}>
                    提交工单
                  </Button>
                </Empty>
              }
              render={item => {
                const mine = String(item.creator_id) === viewerId;
                const due = dueLabel(item);
                return (
                  <>
                    <div className={styles.feedMain}>
                      <div className={styles.feedTitle}>{item.title}</div>
                      <Space size={6} wrap>
                        <TicketStatusTag status={item.status} />
                        <Tag>{TICKET_PRIORITY[item.priority] || "普通"}</Tag>
                        <span>{mine ? "我提交的" : "分派给我"}</span>
                        {due ? <span>{due}</span> : null}
                      </Space>
                    </div>
                    <div className={styles.feedActions}>
                      <Button type="link" size="small" onClick={() => navigate("/mytickets")}>
                        处理
                      </Button>
                    </div>
                  </>
                );
              }}
            />
          </Panel>
        </Col>
        <Col xs={24} lg={10}>
          <Panel
            id="workplace-announcements"
            title="公告"
            extra={
              announcementTotal > visibleAnnouncements.length ? (
                <Button type="link" size="small" onClick={() => navigate("/account?tab=MessageCenter")}>
                  还有 {announcementTotal - visibleAnnouncements.length} 条
                </Button>
              ) : (
                <Button type="link" size="small" onClick={() => navigate("/account?tab=MessageCenter")}>
                  消息中心
                </Button>
              )
            }>
            <Feed
              items={visibleAnnouncements}
              empty={<Empty description="暂无公告" />}
              render={item => (
                <>
                  <div className={styles.feedMain}>
                    <div className={styles.feedTitle}>
                      {item.level === "required" ? <Tag color="red">必须确认</Tag> : null}
                      {item.title} {item.read ? null : <Tag color="blue">未读</Tag>}
                    </div>
                    <Bits bits={[formatTime(item.published_at), snippet(item.content, 42)]} />
                  </div>
                  <div className={styles.feedActions}>
                    <Button type="link" size="small" onClick={() => openAnnouncement(item)}>
                      查看
                    </Button>
                  </div>
                </>
              )}
            />
          </Panel>
        </Col>
      </Row>

      <Row gutter={[12, 12]} className={styles.block}>
        <Col xs={24} lg={12}>
          <Panel
            id="workplace-changelog"
            title="最近变更"
            extra={
              <Button type="link" size="small" onClick={() => navigate("/about")}>
                关于
              </Button>
            }>
            {changelogs.length === 0 ? (
              <Empty description="还没有已发布的变更。" />
            ) : (
              <Timeline
                items={changelogs.map(item => ({
                  color: "blue",
                  children: (
                    <div>
                      <div className={styles.changeTitle}>
                        <Tag color="blue">{item.version}</Tag>
                        {item.title}
                      </div>
                      <div className={styles.meta}>{formatTime(item.published_at)}</div>
                      {item.body ? <div className={styles.clamp}>{item.body}</div> : null}
                    </div>
                  )
                }))}
              />
            )}
          </Panel>
        </Col>
      </Row>

      <Modal
        open={Boolean(current)}
        title={current?.title || "公告"}
        okText="知道了"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={closeAnnouncement}
        onCancel={closeAnnouncement}
        destroyOnHidden>
        <div className="whitespace-pre-wrap">{current?.content || ""}</div>
      </Modal>
    </div>
  );
};

export default Workplace;
