import { listMyAnnouncements, markAnnouncementRead } from "@/api/announcement";
import { listPublishedChangelogs } from "@/api/changelog";
import { listMyNotices, markNoticeRead, setNoticeTodo } from "@/api/notice";
import { TICKET_PRIORITY, formatDueInSeconds, listMyTickets, ticketOverdue } from "@/api/platform";
import { getUserState } from "@/api/session";
import TicketStatusTag from "@/components/TicketStatusTag";
import { Button, Col, Empty, Modal, Row, Skeleton, Space, Tag, Timeline, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import styles from "./index.module.css";

const NOTICE_CATEGORY: Record<string, string> = {
  system: "系统",
  task: "任务",
  mention: "提及",
  approval: "审批",
  security: "安全"
};

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

function announcementRank(item: any) {
  return item.level === "required" && !item.read ? 0 : item.read ? 2 : 1;
}

function sortAnnouncements(list: any[]) {
  return list.sort((left, right) => {
    const leftRank = announcementRank(left);
    const rightRank = announcementRank(right);
    if (leftRank !== rightRank) return leftRank - rightRank;
    return (Date.parse(right.published_at || "") || 0) - (Date.parse(left.published_at || "") || 0);
  });
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

function PanelBody({ ready, children }: { ready: boolean; children: ReactNode }) {
  return (
    <div className={styles.feedSlot}>
      <Skeleton active loading={!ready} title={false} paragraph={{ rows: 4 }}>
        {children}
      </Skeleton>
    </div>
  );
}

const Feeds = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTotal, setAnnouncementTotal] = useState(0);
  const [current, setCurrent] = useState<any>(null);
  const linkedId = params.get("announcement_id");
  const linkedAnnouncement = linkedId ? (announcements.find(item => String(item.id) === linkedId) ?? null) : null;
  const activeAnnouncement = current ?? linkedAnnouncement;
  const [todos, setTodos] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [acting, setActing] = useState("");
  const [announcementsReady, setAnnouncementsReady] = useState(false);
  const [todosReady, setTodosReady] = useState(false);
  const [inboxReady, setInboxReady] = useState(false);
  const [ticketsReady, setTicketsReady] = useState(false);
  const [changelogsReady, setChangelogsReady] = useState(false);
  const viewerId = String(getUserState().uid || "");

  const loadAnnouncements = () => {
    Promise.all([listMyAnnouncements({ page: 1, page_size: 20 }), listMyAnnouncements({ page: 1, page_size: 20, level: "required", unread: 1 }).catch(() => null)])
      .then(([all, required]) => {
        const base = all.data?.data?.list || [];
        const extra = required?.data?.data?.list || [];
        const merged = new Map<string, any>();
        [...extra, ...base].forEach(item => merged.set(String(item.id), item));
        const list = sortAnnouncements(Array.from(merged.values()));
        setAnnouncements(list);
        setAnnouncementTotal(Math.max(Number(all.data?.data?.total || 0), list.length));
      })
      .catch(() => {
        setAnnouncements([]);
        setAnnouncementTotal(0);
      })
      .finally(() => setAnnouncementsReady(true));
  };

  const loadTodos = () => {
    listMyNotices({ kind: "todo", todo_status: "pending", page: 1, page_size: 8 })
      .then(res => setTodos(res.data?.data?.list || []))
      .catch(() => setTodos([]))
      .finally(() => setTodosReady(true));
  };

  const loadInbox = () => {
    listMyNotices({ kind: "inbox", unread: 1, page: 1, page_size: 8 })
      .then(res => setInbox(res.data?.data?.list || []))
      .catch(() => setInbox([]))
      .finally(() => setInboxReady(true));
  };

  const loadTickets = () => {
    listMyTickets({ page: 1, page_size: 30 })
      .then(res => setTickets(res.data?.data?.list || []))
      .catch(() => setTickets([]))
      .finally(() => setTicketsReady(true));
  };

  useEffect(() => {
    loadAnnouncements();
    loadTodos();
    loadInbox();
    loadTickets();
    listPublishedChangelogs({ page: 1, page_size: 5 })
      .then(res => setChangelogs(res.data?.data?.list || []))
      .catch(() => setChangelogs([]))
      .finally(() => setChangelogsReady(true));
  }, []);

  const openAnnouncement = async (item: any) => {
    setCurrent(item);
    if (item.read) return;
    try {
      await markAnnouncementRead(String(item.id));
      setAnnouncements(list => sortAnnouncements(list.map(row => (String(row.id) === String(item.id) ? { ...row, read: true } : row))));
      setCurrent(current => (current && String(current.id) === String(item.id) ? { ...current, read: true } : current));
    } catch {
      // 拦截器已提示
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
      setTodos(list => list.filter(item => String(item.id) !== id));
    } catch {
      // 拦截器已提示
    } finally {
      setActing("");
    }
  };

  const openNotice = async (item: any) => {
    if (!item.read) {
      try {
        await markNoticeRead(String(item.id));
        setInbox(list => list.filter(row => String(row.id) !== String(item.id)));
      } catch {
        return;
      }
    }
    openInternal(item.link_path);
  };

  const visibleAnnouncements = announcements.slice(0, 6);
  const openTicketRows = tickets.filter(item => item.status !== "closed").slice(0, 6);

  return (
    <>
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
            <PanelBody ready={todosReady}>
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
            </PanelBody>
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
            <PanelBody ready={inboxReady}>
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
            </PanelBody>
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
            <PanelBody ready={ticketsReady}>
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
            </PanelBody>
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
            <PanelBody ready={announcementsReady}>
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
            </PanelBody>
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
            <PanelBody ready={changelogsReady}>
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
            </PanelBody>
          </Panel>
        </Col>
      </Row>

      <Modal
        open={Boolean(activeAnnouncement)}
        title={activeAnnouncement?.title || "公告"}
        okText="知道了"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={closeAnnouncement}
        onCancel={closeAnnouncement}
        destroyOnHidden>
        <div className="whitespace-pre-wrap">{activeAnnouncement?.content || ""}</div>
      </Modal>
    </>
  );
};

export default Feeds;
