import { listMyAnnouncements, markAllAnnouncementsRead, markAnnouncementRead } from "@/api/announcement";
import { BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, DropdownProps, Flex, Listy, MenuProps, Tabs } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import styles from "./index.module.scss";

const HeaderNotice: FC = () => {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("notification");
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getNotice = useCallback(async () => {
    try {
      const result = await listMyAnnouncements({ type: "notification", level: "normal", unread: 1, page: 1, page_size: 6 });
      if (result.data.code !== 0) return;
      setNoticeList(result.data.data?.list || []);
      setUnreadCount(result.data.data?.unread_count || 0);
    } catch {
      setNoticeList([]);
    }
  }, []);

  useEffect(() => {
    getNotice();
    const onFocus = () => getNotice();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [getNotice]);

  const openNotice = async (item: any) => {
    await markAnnouncementRead(item.id);
    getNotice();
  };

  const clearMessage = async () => {
    await markAllAnnouncementsRead("notification");
    getNotice();
  };

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
              { label: "通知", key: "notification" },
              { label: "消息", key: "message" },
              { label: "待办", key: "event" }
            ]}
          />
          <div>
            {activeKey === "notification" ? (
              <Listy
                items={noticeList}
                rowKey="id"
                itemRender={item => (
                  <Flex align="center" gap={12} onClick={() => openNotice(item)}>
                    <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />
                    <Flex vertical>
                      <span>{item.title}</span>
                      <span>{item.content}</span>
                    </Flex>
                  </Flex>
                )}
              />
            ) : (
              <div className="py-6 text-center text-[#999]">暂无数据</div>
            )}
            <div className="w-full rounded-b transition-all duration-300 border-t border-[#f0f0f0]">
              <div className="float-left w-[49%] cursor-pointer border-r border-[#f0f0f0] py-3 text-center" onClick={clearMessage}>
                <span>清空</span>
              </div>
              <div className="float-left w-[49%] cursor-pointer py-3 text-center">
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
      if (nextOpen) getNotice();
    }
  };

  return (
    <div className="float-right mr-5 cursor-pointer select-none">
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["hover"]} onOpenChange={handleOpenChange} open={open}>
        <Badge count={unreadCount} overflowCount={999} offset={[0, 10]}>
          <Avatar shape="square" size="large" src={<BellOutlined />} className={styles.icon} />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HeaderNotice;
