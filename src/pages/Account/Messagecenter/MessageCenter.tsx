import { listMyAnnouncements, markAllAnnouncementsRead, markAnnouncementsRead } from "@/api/announcement";
import { listMyNotices, markAllNoticesRead, markNoticeRead, setNoticeTodo } from "@/api/notice";
import { Button, Col, Divider, Space, Table, Tabs, Tag, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

import "./style.scss";

const typeText: Record<string, string> = {
  system: "系统公告",
  notification: "普通通知"
};

const MessageCenter: FC = () => {
  const [tab, setTab] = useState("announcement");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);

  const load = () => {
    setSelectedRowKeys([]);
    if (tab === "announcement") {
      listMyAnnouncements({ page: 1, page_size: 50 })
        .then(result => {
          if (result.data.code !== 0) return;
          setDataSource(
            (result.data.data?.list || []).map((item: any) => ({
              ...item,
              hasRead: Boolean(item.read),
              createdAt: item.published_at ? dayjs(item.published_at).format("YYYY-MM-DD HH:mm") : "----",
              typeTitle: item.level === "required" ? "必须确认" : typeText[item.type] || item.type
            }))
          );
        })
        .catch(() => setDataSource([]));
      return;
    }
    const query =
      tab === "inbox"
        ? { kind: "inbox", page: 1, page_size: 50 }
        : { kind: "todo", page: 1, page_size: 50 };
    listMyNotices(query)
      .then(result => {
        if (result.data.code !== 0) return;
        setDataSource(
          (result.data.data?.list || []).map((item: any) => ({
            ...item,
            hasRead: Boolean(item.read),
            createdAt: item.created_at ? dayjs(item.created_at).format("YYYY-MM-DD HH:mm") : "----",
            typeTitle: item.kind === "todo" ? item.todo_status || "pending" : item.category
          }))
        );
      })
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    load();
  }, [tab]);

  const markSelected = async () => {
    if (tab === "announcement") {
      const ids = selectedRowKeys.filter(id => {
        const row = dataSource.find(item => item.id === id);
        return row && row.level !== "required";
      });
      if (ids.length === 0) {
        message.info("必须确认的公告需要在弹窗中阅读");
        return;
      }
      await markAnnouncementsRead(ids);
    } else {
      for (const id of selectedRowKeys) {
        await markNoticeRead(id);
      }
    }
    setSelectedRowKeys([]);
    load();
  };

  const markAll = async () => {
    if (tab === "announcement") {
      await markAllAnnouncementsRead();
    } else if (tab === "inbox") {
      await markAllNoticesRead("inbox");
    } else {
      await markAllNoticesRead("todo");
    }
    setSelectedRowKeys([]);
    load();
  };

  const columns =
    tab === "announcement"
      ? [
          {
            title: "",
            dataIndex: "hasRead",
            width: 12,
            className: "unread-row",
            render: (hasRead: boolean) => !hasRead && <i className="unread-dot">●</i>
          },
          { title: "标题内容", dataIndex: "content" },
          { title: "提交时间", dataIndex: "createdAt", width: 150 },
          { title: "类型", dataIndex: "typeTitle", width: 130 }
        ]
      : [
          {
            title: "",
            dataIndex: "hasRead",
            width: 12,
            className: "unread-row",
            render: (hasRead: boolean) => !hasRead && <i className="unread-dot">●</i>
          },
          { title: "标题", dataIndex: "title" },
          { title: "内容", dataIndex: "content", ellipsis: true },
          { title: "时间", dataIndex: "createdAt", width: 150 },
          {
            title: tab === "todo" ? "状态" : "分类",
            dataIndex: "typeTitle",
            width: 120,
            render: (text: string) => <Tag>{text}</Tag>
          },
          tab === "todo"
            ? {
                title: "操作",
                width: 140,
                render: (row: any) =>
                  row.todo_status === "pending" ? (
                    <Space size={8}>
                      <a
                        onClick={async () => {
                          await setNoticeTodo(row.id, "done");
                          message.success("已完成");
                          load();
                        }}
                      >
                        完成
                      </a>
                      <a
                        onClick={async () => {
                          await setNoticeTodo(row.id, "dismissed");
                          message.success("已忽略");
                          load();
                        }}
                      >
                        忽略
                      </a>
                    </Space>
                  ) : null
              }
            : { title: "", width: 1, render: () => null }
        ];

  return (
    <div className="inner-message">
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          消息中心
        </Divider>
      </Col>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "announcement", label: "公告" },
          { key: "inbox", label: "消息" },
          { key: "todo", label: "待办" }
        ]}
      />
      <Table
        columns={columns as any}
        dataSource={dataSource}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys: any) => setSelectedRowKeys(selectedKeys)
        }}
        rowKey="id"
      />
      <div className="action-group">
        <Button onClick={markSelected} disabled={selectedRowKeys.length <= 0}>
          标记已读
        </Button>
        <Button onClick={markAll}>全部已读</Button>
      </div>
    </div>
  );
};

export default MessageCenter;
