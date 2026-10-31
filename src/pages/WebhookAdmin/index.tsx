import { hasPermission } from "@/api/announcement";
import { WEBHOOK_EVENT_OPTIONS, createWebhook, deleteWebhook, listWebhookDeliveries, listWebhooks, replayWebhookDelivery, testWebhook } from "@/api/ops";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "Webhook" }];

const WebhookAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const [form] = Form.useForm();
  const canWrite = hasPermission("config:write");

  const load = () => {
    listWebhooks()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  const loadDeliveries = () => {
    listWebhookDeliveries({ status, limit: 50 })
      .then(res => setDeliveries(res.data?.data?.list || []))
      .catch(() => setDeliveries([]));
  };

  useEffect(() => {
    load();
    loadDeliveries();
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
      width: 80,
      render: (value: boolean) => (value ? <Tag color="blue">是</Tag> : <Tag>否</Tag>)
    },
    {
      title: "操作",
      width: 180,
      render: (row: any) =>
        canWrite ? (
          <Space>
            <Button
              size="small"
              onClick={async () => {
                await testWebhook(String(row.id));
                message.success("已投递 ping");
                loadDeliveries();
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
            }}>
            重放
          </Button>
        ) : null
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="出站 Webhook 按事件投递；失败由 webhook.retry 退避重试，死信可手动重放。测试会投递 webhook.ping。" />
      <div className="admin-card">
        <div className="admin-toolbar">
          <Button onClick={load}>刷新订阅</Button>
          {canWrite ? (
            <Button type="primary" onClick={() => setCreating(true)}>
              新建订阅
            </Button>
          ) : null}
        </div>
        <Table rowKey="id" columns={columns} dataSource={list} pagination={false} scroll={{ x: 900 }} />
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
          <Button
            onClick={() => {
              loadDeliveries();
            }}>
            刷新投递
          </Button>
        </div>
        <Table rowKey="id" columns={deliveryColumns} dataSource={deliveries} pagination={false} scroll={{ x: 860 }} />
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
