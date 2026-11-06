import { listMyAnnouncements, markAllAnnouncementsRead, markAnnouncementRead } from "@/api/announcement";
import { listMyNotices, markAllNoticesRead, markNoticeRead, noticeSummary, setNoticeTodo } from "@/api/notice";
import { createStaleRefresh } from "@/utils/staleRefresh";
import { BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, DropdownProps, MenuProps, message } from "antd";
import { FC, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router";

const HeaderNotice: FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("notification");
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [inboxList, setInboxList] = useState<any[]>([]);
  const [todoList, setTodoList] = useState<any[]>([]);
  const [announcementUnread, setAnnouncementUnread] = useState(0);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [todoPending, setTodoPending] = useState(0);
  const [Panel, setPanel] = useState<ComponentType<any> | null>(null);
  const openRef = useRef(false);
  openRef.current = open;

  const refreshCounts = useMemo(
    () =>
      createStaleRefresh(async () => {
        try {
          const [ann, sum] = await Promise.all([listMyAnnouncements({ type: "notification", level: "normal", unread: 1, page: 1, page_size: 1 }), noticeSummary()]);
          if (ann.data.code === 0) setAnnouncementUnread(ann.data.data?.unread_count || 0);
          if (sum.data.code === 0) {
            setInboxUnread(sum.data.data?.inbox_unread || 0);
            setTodoPending(sum.data.data?.todo_pending || 0);
          }
        } catch {
          // 数字刷新失败时保留上次角标。
        }
      }),
    []
  );

  const refreshLists = useMemo(
    () =>
      createStaleRefresh(async () => {
        try {
          const [ann, inbox, todo, sum] = await Promise.all([
            listMyAnnouncements({ type: "notification", level: "normal", unread: 1, page: 1, page_size: 6 }),
            listMyNotices({ kind: "inbox", unread: 1, page: 1, page_size: 8 }),
            listMyNotices({ kind: "todo", todo_status: "pending", page: 1, page_size: 8 }),
            noticeSummary()
          ]);
          if (ann.data.code === 0) {
            setNoticeList((ann.data.data?.list || []).slice(0, 6));
            setAnnouncementUnread(ann.data.data?.unread_count || 0);
          }
          if (inbox.data.code === 0) setInboxList((inbox.data.data?.list || []).slice(0, 6));
          if (todo.data.code === 0) setTodoList((todo.data.data?.list || []).slice(0, 6));
          if (sum.data.code === 0) {
            setInboxUnread(sum.data.data?.inbox_unread || 0);
            setTodoPending(sum.data.data?.todo_pending || 0);
          }
        } catch {
          setNoticeList([]);
          setInboxList([]);
          setTodoList([]);
        }
      }),
    []
  );

  useEffect(() => {
    void refreshCounts(true);
    const onFocus = () => {
      if (openRef.current) void refreshLists();
      else void refreshCounts();
    };
    const onNotice = () => {
      if (openRef.current) void refreshLists(true);
      else void refreshCounts(true);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("notice:refresh", onNotice);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notice:refresh", onNotice);
    };
  }, [refreshCounts, refreshLists]);

  const openAnnouncement = async (item: any) => {
    await markAnnouncementRead(item.id);
    void refreshLists(true);
  };

  const openInbox = async (item: any) => {
    await markNoticeRead(item.id);
    const announcementId = item.payload?.announcement_id;
    if (announcementId) {
      navigate(`/workplace?announcement_id=${encodeURIComponent(String(announcementId))}`);
    } else if (item.link_path) {
      navigate(item.link_path);
    }
    void refreshLists(true);
  };

  const finishTodo = async (item: any, status: "done" | "dismissed") => {
    await setNoticeTodo(item.id, status);
    message.success(status === "done" ? "已完成" : "已忽略");
    void refreshLists(true);
  };

  const clearCurrent = async () => {
    if (activeKey === "notification") {
      await markAllAnnouncementsRead("notification");
    } else if (activeKey === "message") {
      await markAllNoticesRead("inbox");
    } else {
      // pending todos: mark read only, keep pending
      await markAllNoticesRead("todo");
    }
    void refreshLists(true);
  };

  const badgeCount = announcementUnread + inboxUnread + todoPending;

  const ensurePanel = () => {
    if (Panel) return;
    void import("./NoticePanel").then(mod => setPanel(() => mod.default));
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: Panel ? (
        <Panel
          activeKey={activeKey}
          onChangeKey={setActiveKey}
          announcementUnread={announcementUnread}
          inboxUnread={inboxUnread}
          todoPending={todoPending}
          noticeList={noticeList}
          inboxList={inboxList}
          todoList={todoList}
          onOpenAnnouncement={openAnnouncement}
          onOpenInbox={openInbox}
          onOpenPath={path => navigate(path)}
          onFinishTodo={finishTodo}
          onClear={clearCurrent}
          onMore={() => {
            setOpen(false);
            navigate("/account");
          }}
        />
      ) : (
        <div className="px-6 py-4 text-center text-[#999]">加载中</div>
      )
    }
  ];

  const handleOpenChange: DropdownProps["onOpenChange"] = (nextOpen, info) => {
    if (nextOpen) ensurePanel();
    if (info.source === "trigger" || nextOpen) {
      setOpen(nextOpen);
      if (nextOpen) void refreshLists(true);
    }
  };

  return (
    <div className="flex h-12 cursor-pointer select-none items-center px-2">
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["hover"]} onOpenChange={handleOpenChange} open={open}>
        <Badge count={badgeCount} overflowCount={999}>
          <Avatar shape="square" size={32} src={<BellOutlined />} className="text-base text-header-icon! hover:bg-header-icon-hover-bg! hover:text-header-icon-hover!" />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HeaderNotice;
