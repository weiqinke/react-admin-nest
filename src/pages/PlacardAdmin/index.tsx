import { PlacardEditModal } from "@/components/Modals";
import {
  deleteAnnouncement,
  listAnnouncementReads,
  listAnnouncements,
  nudgeAnnouncement,
  publishAnnouncement,
  republishAnnouncement,
  revokeAnnouncement
} from "@/api/announcement";
import { exportAnnouncementReadsCsv } from "@/api/impexp";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import PageIntroduction from "@/components/PageIntroduction";
import LabelBind from "@/components/LabelBind";
import { Button, Drawer, Input, Modal, Radio, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统设置" }, { title: "公告管理" }];

const visibilityText: Record<string, string> = {
  draft: "草稿",
  revoked: "已撤回",
  scheduled: "未生效",
  expired: "已过期",
  active: "生效中"
};

function formatTime(value?: string | null) {
  if (!value) return "----";
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

const PlacardAdmin: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [placard, setPlacard] = useState<any>();
  const [readsFor, setReadsFor] = useState<any>();
  const [readFlag, setReadFlag] = useState("1");
  const [username, setUsername] = useState("");
  const [reads, setReads] = useState<any>({ list: [], total: 0, read_count: 0, unread_count: 0 });
  const [labelFor, setLabelFor] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const findAllPlacards = (nextPage = page) => {
    listAnnouncements({ page: nextPage, page_size: 20 })
      .then(result => {
        if (result.data.code !== 0) return;
        setDataSource(result.data.data?.list || []);
        setTotal(result.data.data?.total || 0);
      })
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAllPlacards(1);
  }, []);

  const loadReads = (item = readsFor, flag = readFlag, name = username) => {
    if (!item?.id) return;
    listAnnouncementReads(item.id, { read: flag, username: name, page: 1, page_size: 20 }).then(result => {
      if (result.data.code === 0) setReads(result.data.data);
    });
  };

  const confirmAction = (title: string, action: () => Promise<any>) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: title,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await action();
        message.success("操作成功");
        findAllPlacards();
      }
    });
  };

  const columns: any = [
    { title: "标题", dataIndex: "title" },
    { title: "内容", dataIndex: "content", ellipsis: true },
    {
      title: "类型",
      dataIndex: "type",
      render: (text: string) => (text === "notification" ? <Tag color="#108ee9">普通通知</Tag> : <Tag color="#87d068">系统公告</Tag>)
    },
    {
      title: "等级",
      dataIndex: "level",
      render: (text: string) => (text === "required" ? <Tag color="#f50">必须确认</Tag> : <Tag>普通</Tag>)
    },
    {
      title: "状态",
      dataIndex: "visibility",
      render: (text: string, row: any) => (row.status === "expired" ? "已过期" : visibilityText[text] || text)
    },
    {
      title: "发布时间",
      dataIndex: "published_at",
      width: 150,
      render: (value: string) => formatTime(value)
    },
    {
      title: "已读 / 未读",
      render: (row: any) => `${row.read_count} / ${row.unread_count}`
    },
    {
      title: "操作",
      width: 320,
      render: (row: any) => (
        <Space wrap>
          {row.status === "draft" && (
            <Button type="link" size="small" onClick={() => confirmAction("是否发布该公告？", () => publishAnnouncement(row.id))}>
              发布
            </Button>
          )}
          {row.status !== "draft" && (
            <Button type="link" size="small" onClick={() => confirmAction("是否再次发布？将生成一条新公告。", () => republishAnnouncement(row.id))}>
              再次发布
            </Button>
          )}
          {row.status === "published" && (
            <Button type="link" size="small" onClick={() => confirmAction("是否撤回该公告？", () => revokeAnnouncement(row.id))}>
              撤回
            </Button>
          )}
          {row.status === "published" && Number(row.unread_count) > 0 ? (
            <Button
              type="link"
              size="small"
              onClick={() =>
                Modal.confirm({
                  title: "提示",
                  icon: <ExclamationCircleOutlined />,
                  content: "向未读受众发送催办提醒？同一公告 24 小时内只会催办一次。",
                  onOk: async () => {
                    const res = await nudgeAnnouncement(row.id);
                    const sent = res.data?.data?.sent;
                    message.success(typeof sent === "number" ? `已催办 ${sent} 人` : "已催办");
                    findAllPlacards();
                  }
                })
              }>
              催办
            </Button>
          ) : null}
          {row.status === "draft" && (
            <Button type="link" size="small" onClick={() => setPlacard(row)}>
              编辑
            </Button>
          )}
          {row.status === "published" && (
            <Button type="link" size="small" onClick={() => setPlacard(row)}>
              生效时间
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => {
              setReadsFor(row);
              setReadFlag("1");
              setUsername("");
              loadReads(row, "1", "");
            }}>
            阅读情况
          </Button>
          <Button type="link" size="small" onClick={() => setLabelFor(row)}>
            标签
          </Button>
          <Button
            danger
            type="link"
            size="small"
            onClick={() =>
              confirmAction("是否删除该公告？", async () => {
                await deleteAnnouncement(row.id);
              })
            }>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="本页面是操作系统中的公告，可以用来添加、发布和查看已读情况。到期任务会把已过窗口的公告标成已过期，已过期的可以再次发布。可对未读受众催办（24h 去重），并导出阅读明细。"
      />
      <div className="admin-card">
        <div className="admin-toolbar">
          <Button type="primary" onClick={() => findAllPlacards()}>
            查询公告
          </Button>
          <Button type="primary" onClick={() => setPlacard({})}>
            添加公告
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          bordered
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: next => {
              setPage(next);
              findAllPlacards(next);
            }
          }}
        />
      </div>
      {placard && (
        <PlacardEditModal
          placard={placard}
          onCancel={() => setPlacard(null)}
          onOk={() => {
            setPlacard(null);
            findAllPlacards();
          }}
        />
      )}
      <Drawer title={readsFor ? `${readsFor.title} 的阅读情况` : "阅读情况"} open={Boolean(readsFor)} width={520} onClose={() => setReadsFor(null)}>
        <Space direction="vertical" className="w-full">
          <Space wrap>
            <Radio.Group
              value={readFlag}
              onChange={event => {
                const next = event.target.value;
                setReadFlag(next);
                loadReads(readsFor, next, username);
              }}>
              <Radio.Button value="1">已读 {reads.read_count}</Radio.Button>
              <Radio.Button value="0">未读 {reads.unread_count}</Radio.Button>
            </Radio.Group>
            <Button
              loading={exporting}
              onClick={async () => {
                if (!readsFor?.id) return;
                setExporting(true);
                try {
                  await exportAnnouncementReadsCsv(String(readsFor.id), `announcement-${readsFor.id}-reads.csv`);
                  message.success("已导出");
                } finally {
                  setExporting(false);
                }
              }}>
              导出 CSV
            </Button>
          </Space>
          <Input.Search
            placeholder="按用户名查询"
            allowClear
            onSearch={value => {
              setUsername(value);
              loadReads(readsFor, readFlag, value);
            }}
          />
          <Table
            rowKey="user_id"
            dataSource={reads.list || []}
            pagination={false}
            columns={[
              { title: "用户", dataIndex: "username" },
              { title: "已读时间", dataIndex: "read_at", render: (value: string) => (readFlag === "1" ? formatTime(value) : "----") }
            ]}
          />
        </Space>
      </Drawer>
      <Modal open={Boolean(labelFor)} title={`标签：${labelFor?.title || ""}`} footer={null} destroyOnHidden onCancel={() => setLabelFor(null)}>
        {labelFor ? <LabelBind targetType="announcement" targetId={String(labelFor.id)} /> : null}
      </Modal>
    </div>
  );
};

export default PlacardAdmin;
