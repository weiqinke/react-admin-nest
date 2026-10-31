import { hasPermission } from "@/api/announcement";
import {
  WEBHOOK_EVENT_OPTIONS,
  createWebhook,
  deleteWebhook,
  listWebhookDeliveries,
  listWebhookStats,
  listWebhooks,
  replayWebhookDelivery,
  testWebhook,
  updateWebhook
} from "@/api/ops";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "Webhook" }];

const WebhookAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [statsDays, setStatsDays] = useState(7);
  const [listLoading, setListLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const [form] = Form.useForm();
  const canWrite = hasPermission("config:write");

  const load = () => {
    setListLoading(true);
    listWebhooks()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]))
      .finally(() => setListLoading(false));
  };

  const loadDeliveries = () => {
    setDeliveryLoading(true);
    listWebhookDeliveries({ status, limit: 50 })
      .then(res => setDeliveries(res.data?.data?.list || []))
      .catch(() => setDeliveries([]))
      .finally(() => setDeliveryLoading(false));
  };

  const loadStats = (days = statsDays) => {
    setStatsLoading(true);
    listWebhookStats(days)
      .then(res => setStats(res.data?.data?.list || []))
      .catch(() => setStats([]))
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => {
    load();
    loadDeliveries();
    loadStats();
  }, []);

  const submit = async (values: any) => {
    setSaving(true);
    try {
      await createWebhook({
        name: values.name,
        url: values.url,
        secret: values.secret || "",
        events: values.events || []
      });
      message.success("已创建");
      setCreating(false);
      form.resetFields();
      load();
      loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: any) => {
    Modal.confirm({
      title: "删除订阅",
      icon: <ExclamationCircleOutlined />,
      content: `确认删除「${row.name}」？`,
      okText: "删除",
      okType: "danger",
      onOk: async () => {
        await deleteWebhook(String(row.id));
        message.success("已删除");
        load();
        loadStats();
      }
    });
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "URL", dataIndex: "url", ellipsis: true },
    {
      title: "事件",
      dataIndex: "events",
      render: (events: string[] = []) => (
        <Space size={4} wrap>
          {events.map(event => (
            <Tag key={event}>{WEBHOOK_EVENT_OPTIONS.find(item => item.value === event)?.label || event}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 90,
      render: (value: boolean, row: any) => (
        <Switch
          size="small"
          checked={Boolean(value)}
          disabled={!canWrite}
          onChange={async checked => {
            await updateWebhook(String(row.id), { enabled: checked });
            message.success(checked ? "已启用" : "已停用");
            load();
          }}
        />
      )
    },
    {
      title: "失败重试",
      dataIndex: "retry_enabled",
      width: 100,
      render: (value: boolean, row: any) => (
        <Switch
          size="small"
          checked={value !== false}
          disabled={!canWrite}
          onChange={async checked => {
            await updateWebhook(String(row.id), { retry_enabled: checked });
            message.success(checked ? "已开启重试" : "失败将直接死信");
            load();
          }}
        />
      )
    },
    {
      title: "操作",
      width: 160,
      render: (row: any) =>
        canWrite ? (
          <Space>
            <Button
              size="small"
              onClick={async () => {
                await testWebhook(String(row.id));
                message.success("已投递 ping");
                loadDeliveries();
                loadStats();
              }}>
              测试
            </Button>
            <Button size="small" danger onClick={() => remove(row)}>
              删除
            </Button>
          </Space>
        ) : null
    }
  ];

  const deliveryColumns: any = [
    { title: "事件", dataIndex: "event", width: 140 },
    { title: "状态", dataIndex: "status", width: 100, render: (value: string) => <Tag>{value}</Tag> },
    { title: "尝试", dataIndex: "attempts", width: 70 },
    { title: "创建时间", dataIndex: "created_at", responsive: ["lg"] },
    { title: "错误", dataIndex: "last_error", ellipsis: true, responsive: ["xl"], render: (value: string) => value || "—" },
    {
      title: "操作",
      width: 90,
      render: (row: any) =>
        canWrite && (row.status === "dead" || row.status === "failed") ? (
          <Button
            size="small"
            onClick={async () => {
              await replayWebhookDelivery(String(row.id));
              message.success("已重放");
              loadDeliveries();
              loadStats();
            }}>
            重放
          </Button>
        ) : null
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="出站 Webhook 按事件投递；失败由 webhook.retry 退避重试，关闭重试则失败直接死信。测试会投递 webhook.ping。" />
      <div className="admin-card">
        <div className="admin-toolbar">
          <Button onClick={load}>刷新订阅</Button>
          {canWrite ? (
            <Button type="primary" onClick={() => setCreating(true)}>
              新建订阅
            </Button>
          ) : null}
        </div>
        <Table
          rowKey="id"
          loading={listLoading}
          columns={columns}
          dataSource={list}
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{ emptyText: listLoading ? "加载中…" : "暂无订阅" }}
        />
      </div>
      <div className="admin-card mt-3">
        <div className="admin-toolbar">
          <Select
            value={statsDays}
            style={{ width: 120 }}
            options={[
              { value: 7, label: "近 7 天" },
              { value: 14, label: "近 14 天" },
              { value: 30, label: "近 30 天" }
            ]}
            onChange={value => {
              setStatsDays(value);
              loadStats(value);
            }}
          />
          <Button onClick={() => loadStats()}>刷新统计</Button>
        </div>
        <Table
          rowKey="subscription_id"
          loading={statsLoading}
          dataSource={stats}
          pagination={false}
          locale={{ emptyText: statsLoading ? "加载中…" : "暂无统计" }}
          columns={[
            { title: "订阅", dataIndex: "name" },
            { title: "成功", dataIndex: "success", width: 90 },
            { title: "失败", dataIndex: "fail", width: 90 },
            { title: "死信", dataIndex: "dead", width: 90 },
            { title: "合计", dataIndex: "total", width: 90 },
            {
              title: "成功率",
              dataIndex: "success_rate",
              width: 100,
              render: (value: number) => `${Math.round((Number(value) || 0) * 100)}%`
            }
          ]}
        />
      </div>
      <div className="admin-card mt-3">
        <div className="admin-toolbar">
          <Select
            allowClear
            placeholder="投递状态"
            style={{ width: 160 }}
            value={status}
            options={[
              { value: "pending", label: "pending" },
              { value: "success", label: "success" },
              { value: "failed", label: "failed" },
              { value: "dead", label: "dead" }
            ]}
            onChange={value => setStatus(value)}
          />
          <Button onClick={() => loadDeliveries()}>刷新投递</Button>
        </div>
        <Table
          rowKey="id"
          loading={deliveryLoading}
          columns={deliveryColumns}
          dataSource={deliveries}
          pagination={false}
          scroll={{ x: 860 }}
          locale={{ emptyText: deliveryLoading ? "加载中…" : "暂无投递记录" }}
        />
      </div>
      <Modal open={creating} title="新建 Webhook" confirmLoading={saving} onOk={() => form.submit()} onCancel={() => setCreating(false)} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="url" label="回调 URL" rules={[{ required: true, message: "请填写 URL" }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="secret" label="签名密钥">
            <Input.Password placeholder="可选" />
          </Form.Item>
          <Form.Item name="events" label="事件" rules={[{ required: true, message: "至少选一个事件" }]}>
            <Select mode="multiple" options={WEBHOOK_EVENT_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebhookAdmin;
