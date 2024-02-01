import { BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, DropdownProps, List, MenuProps, Tabs } from "antd";
import { FC, useEffect, useRef, useState } from "react";

import { userNotice } from "@/api/microservice/log";
import styles from "./index.module.scss";

const HeaderNotice: FC = () => {
  const [open, setOpen] = useState(false);

  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const noticeCount = 10;
  const intervalHandle: any = useRef(null);
  const [noticeNum, setNoticeNum] = useState(0);
  const [activeKey, setActiveKey] = useState("notification");
  const [dataSource, setDataSource] = useState([]);

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

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className={styles.container}>
          <Tabs
            destroyInactiveTabPane
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
            <List
              itemLayout="horizontal"
              size="small"
              footer={
                <div className={styles.bottomBar}>
                  <div className={styles.doLeftBtn}>
                    <span>清空</span>
                  </div>
                  <div className={styles.dobtn}>
                    <span>查看更多</span>
                  </div>
                </div>
              }
              dataSource={dataSource}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />}
                    title={<a href="https://ant.design">{item.title}</a>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
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
    <div className={styles.notice}>
      <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["hover"]} onOpenChange={handleOpenChange} open={open}>
        <Badge count={noticeList.length || noticeCount} overflowCount={999}>
          <span>
            <BellOutlined style={{ fontSize: "22px", color: "#fff" }} />
          </span>
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HeaderNotice;
