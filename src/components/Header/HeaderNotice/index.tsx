import { BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, DropdownProps, Flex, Listy, MenuProps, Tabs } from "antd";
import { FC, useEffect, useRef, useState } from "react";

import { userNotice } from "@/api/microservice/log";
import styles from "./index.module.scss";

const HeaderNotice: FC = () => {
  const [open, setOpen] = useState(false);

  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const noticeCount = 10;
  const intervalHandle: any = useRef(null);
  const [noticeNum, setNoticeNum] = useState(0);
  const [activeKey, setActiveKey] = useState("notification");
  const [dataSource, setDataSource] = useState<any[]>([]);

  const noticeListFilter = <T extends string>(type: T) => {
    return noticeList.filter(notice => notice.type === type) as any[];
  };

  const getNotice = async () => {
    //查看我是否有新消息 无论如何
    setLoading(true);
    //无论如何，清掉定时器,使用了 ref,肯定能拿到指针。
    //并且启动一个定时器，定时刷新我的消息
    clearTimeout(intervalHandle.current);
    intervalHandle.current = setTimeout(
      () => {
        setNoticeNum(Math.ceil(Math.random() * 1000));
      },
      1000 * 60 * 60
    );
    userNotice({ delete: 0 })
      .then(result => {
        setLoading(false);
        if (result.status && result.data && Array.isArray(result.data.data)) {
          setNoticeList(result.data.data);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getNotice();
  }, [noticeNum]);

  useEffect(() => {
    const result = noticeListFilter(activeKey);
    setDataSource(result.slice(0, 6));
  }, [activeKey]);

  useEffect(() => {
    return () => {
      clearTimeout(intervalHandle.current);
    };
  }, []);

  const clearMessage = () => {
    setDataSource([]);
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="[&_.ant-tabs-tab]:w-[130px] [&_.ant-tabs-tab-btn]:mx-auto">
          <Tabs
            destroyOnHidden
            defaultActiveKey="notification"
            centered
            type="card"
            onChange={(key: string) => setActiveKey(key)}
            items={[
              { label: "通知", type: "notification" },
              { label: "消息", type: "message" },
              { label: "待办", type: "event" }
            ].map(tab => {
              return {
                label: tab.label,
                key: tab.type
              };
            })}
          />
          <div>
            <Listy
              items={dataSource}
              rowKey="id"
              itemRender={item => (
                <Flex align="center" gap={12}>
                  <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />
                  <Flex vertical>
                    <a href="https://ant.design">{item.title}</a>
                    <span>{item.description}</span>
                  </Flex>
                </Flex>
              )}
            />
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

  const onClick: MenuProps["onClick"] = e => {
    if (e.key === "3") {
      setOpen(false);
    }
  };

  const handleOpenChange: DropdownProps["onOpenChange"] = (nextOpen, info) => {
    if (info.source === "trigger" || nextOpen) {
      setOpen(nextOpen);
    }
  };

  return (
    <div className="float-right mr-5 cursor-pointer select-none">
      <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["hover"]} onOpenChange={handleOpenChange} open={open}>
        <Badge count={noticeList.length || noticeCount} overflowCount={999} offset={[0, 10]}>
          <Avatar shape="square" size="large" src={<BellOutlined />} className={styles.icon} />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HeaderNotice;
