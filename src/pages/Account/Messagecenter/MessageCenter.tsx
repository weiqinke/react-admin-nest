import { listMyAnnouncements, markAllAnnouncementsRead, markAnnouncementsRead } from "@/api/announcement";
import { Button, Col, Divider, Table, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

import "./style.scss";

const typeText: Record<string, string> = {
  system: "系统公告",
  notification: "普通通知"
};

const MessageCenter: FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);

  const load = () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const markSelected = async () => {
    const ids = selectedRowKeys.filter(id => {
      const row = dataSource.find(item => item.id === id);
      return row && row.level !== "required";
    });
    if (ids.length === 0) {
      message.info("必须确认的公告需要在弹窗中阅读");
      return;
    }
    await markAnnouncementsRead(ids);
    setSelectedRowKeys([]);
    load();
  };

  const markAll = async () => {
    await markAllAnnouncementsRead();
    setSelectedRowKeys([]);
    load();
  };

  return (
    <div className="inner-message">
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          消息中心
        </Divider>
      </Col>
      <Table
        columns={[
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
        ]}
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
