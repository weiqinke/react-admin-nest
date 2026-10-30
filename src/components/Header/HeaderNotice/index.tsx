import { listMyAnnouncements, markAllAnnouncementsRead, markAnnouncementRead } from "@/api/announcement";
import { listMyNotices, markAllNoticesRead, markNoticeRead, noticeSummary, setNoticeTodo } from "@/api/notice";
import { BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, DropdownProps, Flex, Listy, MenuProps, Tabs, message } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
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

  const refresh = useCallback(async () => {
    try {
      const [ann, inbox, todo, sum] = await Promise.all([
        listMyAnnouncements({ type: "notification", level: "normal", unread: 1, page: 1, page_size: 6 }),
        listMyNotices({ kind: "inbox", unread: 1, page: 1, page_size: 6 }),
        listMyNotices({ kind: "todo", todo_status: "pending", page: 1, page_size: 6 }),
        noticeSummary()
      ]);
      if (ann.data.code === 0) {
        setNoticeList(ann.data.data?.list || []);
        setAnnouncementUnread(ann.data.data?.unread_count || 0);
      }
      if (inbox.data.code === 0) setInboxList(inbox.data.data?.list || []);
      if (todo.data.code === 0) setTodoList(todo.data.data?.list || []);
      if (sum.data.code === 0) {
        setInboxUnread(sum.data.data?.inbox_unread || 0);
        setTodoPending(sum.data.data?.todo_pending || 0);
      }
    } catch {
      setNoticeList([]);
      setInboxList([]);
      setTodoList([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onNotice = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("notice:refresh", onNotice);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notice:refresh", onNotice);
    };
  }, [refresh]);

  const openAnnouncement = async (item: any) => {
    await markAnnouncementRead(item.id);
    refresh();
  };

  const openInbox = async (item: any) => {
    await markNoticeRead(item.id);
    if (item.link_path) navigate(item.link_path);
    refresh();
  };

  const finishTodo = async (item: any, status: "done" | "dismissed") => {
    await setNoticeTodo(item.id, status);
    message.success(status === "done" ? "已完成" : "已忽略");
    refresh();
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
    refresh();
  };

  const badgeCount = announcementUnread + inboxUnread + todoPending;

  const listBody =
    activeKey === "notification" ? (
      <Listy
        items={noticeList}
        rowKey="id"
        itemRender={item => (
          <Flex align="center" gap={12} onClick={() => openAnnouncement(item)}>
            <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />
            <Flex vertical>
              <span>{item.title}</span>
              <span>{item.content}</span>
            </Flex>
          </Flex>
        )}
      />
    ) : activeKey === "message" ? (
      inboxList.length ? (
        <Listy
          items={inboxList}
          rowKey="id"
          itemRender={item => (
            <Flex align="center" gap={12} onClick={() => openInbox(item)}>
              <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />
              <Flex vertical>
                <span>{item.title}</span>
                <span>{item.content}</span>
              </Flex>
            </Flex>
          )}
        />
      ) : (
        <div className="py-6 text-center text-[#999]">暂无消息</div>
      )
    ) : todoList.length ? (
      <Listy
        items={todoList}
        rowKey="id"
        itemRender={item => (
          <Flex align="center" gap={12} justify="space-between">
            <Flex vertical style={{ flex: 1 }} onClick={() => item.link_path && navigate(item.link_path)}>
              <span>{item.title}</span>
              <span>{item.content}</span>
            </Flex>
            <Flex gap={4}>
              <a onClick={() => finishTodo(item, "done")}>完成</a>
              <a onClick={() => finishTodo(item, "dismissed")}>忽略</a>
            </Flex>
          </Flex>
        )}
      />
    ) : (
      <div className="py-6 text-center text-[#999]">暂无待办</div>
    );

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="[&_.ant-tabs-tab]:w-[130px] [&_.ant-tabs-tab-btn]:mx-auto" onClick={event => event.stopPropagation()}>
          <Tabs
            destroyOnHidden
            activeKey={activeKey}
            centered
            type="card"
            onChange={(key: string) => setActiveKey(key)}
            items={[
              { label: `通知${announcementUnread ? `(${announcementUnread})` : ""}`, key: "notification" },
              { label: `消息${inboxUnread ? `(${inboxUnread})` : ""}`, key: "message" },
              { label: `待办${todoPending ? `(${todoPending})` : ""}`, key: "event" }
            ]}
          />
          <div>
            {listBody}
            <div className="w-full rounded-b transition-all duration-300 border-t border-[#f0f0f0]">
              <div className="float-left w-[49%] cursor-pointer border-r border-[#f0f0f0] py-3 text-center" onClick={clearCurrent}>
                <span>清空</span>
              </div>
              <div
                className="float-left w-[49%] cursor-pointer py-3 text-center"
                onClick={() => {
                  setOpen(false);
                  navigate("/account");
                }}>
                <span>查看更多</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleOpenChange: DropdownProps["onOpenChange"] = (nextOpen, info) => {
    if (info.source === "trigger" || nextOpen) {
      setOpen(nextOpen);
      if (nextOpen) refresh();
    }
  };

  return (
    <div className="float-right mr-5 cursor-pointer select-none">
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["hover"]} onOpenChange={handleOpenChange} open={open}>
        <Badge count={badgeCount} overflowCount={999} offset={[0, 10]}>
          <Avatar
            shape="square"
            size={32}
            src={<BellOutlined />}
            className="text-base text-header-icon! hover:bg-header-icon-hover-bg! hover:text-header-icon-hover!"
          />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HeaderNotice;
