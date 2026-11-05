import { Avatar, Flex, Listy, Tabs } from "antd";

type NoticePanelProps = {
  activeKey: string;
  onChangeKey: (key: string) => void;
  announcementUnread: number;
  inboxUnread: number;
  todoPending: number;
  noticeList: any[];
  inboxList: any[];
  todoList: any[];
  onOpenAnnouncement: (item: any) => void;
  onOpenInbox: (item: any) => void;
  onOpenPath: (path: string) => void;
  onFinishTodo: (item: any, status: "done" | "dismissed") => void;
  onClear: () => void;
  onMore: () => void;
};

const NoticePanel = ({
  activeKey,
  onChangeKey,
  announcementUnread,
  inboxUnread,
  todoPending,
  noticeList,
  inboxList,
  todoList,
  onOpenAnnouncement,
  onOpenInbox,
  onOpenPath,
  onFinishTodo,
  onClear,
  onMore
}: NoticePanelProps) => {
  const listBody =
    activeKey === "notification" ? (
      <Listy
        items={noticeList}
        rowKey="id"
        itemRender={item => (
          <Flex align="center" gap={12} onClick={() => onOpenAnnouncement(item)}>
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
            <Flex align="center" gap={12} onClick={() => onOpenInbox(item)}>
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
            <Flex vertical style={{ flex: 1 }} onClick={() => item.link_path && onOpenPath(item.link_path)}>
              <span>{item.title}</span>
              <span>{item.content}</span>
            </Flex>
            <Flex gap={4}>
              <a onClick={() => onFinishTodo(item, "done")}>完成</a>
              <a onClick={() => onFinishTodo(item, "dismissed")}>忽略</a>
            </Flex>
          </Flex>
        )}
      />
    ) : (
      <div className="py-6 text-center text-[#999]">暂无待办</div>
    );

  return (
    <div className="[&_.ant-tabs-tab]:w-[130px] [&_.ant-tabs-tab-btn]:mx-auto" onClick={event => event.stopPropagation()}>
      <Tabs
        destroyOnHidden
        activeKey={activeKey}
        centered
        type="card"
        onChange={onChangeKey}
        items={[
          { label: `通知${announcementUnread ? `(${announcementUnread})` : ""}`, key: "notification" },
          { label: `消息${inboxUnread ? `(${inboxUnread})` : ""}`, key: "message" },
          { label: `待办${todoPending ? `(${todoPending})` : ""}`, key: "event" }
        ]}
      />
      <div>
        {listBody}
        <div className="w-full rounded-b border-t border-[#f0f0f0] transition-all duration-300">
          <div className="float-left w-[49%] cursor-pointer border-r border-[#f0f0f0] py-3 text-center" onClick={onClear}>
            <span>清空</span>
          </div>
          <div className="float-left w-[49%] cursor-pointer py-3 text-center" onClick={onMore}>
            <span>查看更多</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePanel;
