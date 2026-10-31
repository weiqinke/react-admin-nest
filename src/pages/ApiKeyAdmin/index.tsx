import { hasPermission } from "@/api/announcement";
import { API_KEY_SCOPES, createApiKey, listApiKeys, revokeApiKey } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "API 密钥" }];

const ApiKeyAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canWrite = hasPermission("apikey:write");

  const load = () => {
    listApiKeys()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = { name: values.name, scopes: values.scopes };
      if (values.expires_at) payload.expires_at = dayjs(values.expires_at).format("YYYY-MM-DDTHH:mm:ssZ");
      const res = await createApiKey(payload);
      setSecret(res.data?.data?.key || "");
      setCreating(false);
      form.resetFields();
      load();
    } finally {
      setSaving(false);
    }
  };

  const revoke = (row: any) => {
    Modal.confirm({
      title: "吊销密钥",
      icon: <ExclamationCircleOutlined />,
      content: `吊销「${row.name}」后，使用该密钥的调用会立即失败。`,
      okText: "吊销",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await revokeApiKey(String(row.id));
        message.success("已吊销");
        load();
      }
    });
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "前缀", dataIndex: "key_prefix" },
    {
      title: "范围",
      dataIndex: "scopes",
      render: (scopes: string[] = []) => (
        <Space size={4} wrap>
          {scopes.map(scope => (
            <Tag key={scope}>{API_KEY_SCOPES.find(item => item.value === scope)?.label || scope}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: number) => (Number(status) === 0 ? <Tag>已吊销</Tag> : <Tag color="blue">有效</Tag>)
    },
    {
      title: "过期",
      dataIndex: "expires_at",
      responsive: ["lg"],
      render: (value: string, row: any) => {
        if (!value) return "不过期";
        const days = row.days_left;
        if (days == null) return value;
        const color = Number(days) <= 7 ? "red" : Number(days) <= 30 ? "orange" : "default";
        return (
          <span>
            {value}{" "}
            <Tag color={color}>{Number(days) < 0 ? "已过期" : `剩余 ${days} 天`}</Tag>
          </span>
        );
      }
    },
    { title: "最近使用", dataIndex: "last_used_at", responsive: ["xl"], render: (value: string) => value || "—" },
    {
      title: "操作",
      width: 90,
      render: (row: any) =>
        canWrite && Number(row.status) !== 0 ? (
          <Button size="small" danger onClick={() => revoke(row)}>
            吊销
          </Button>
        ) : null
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} introduction="密钥只在创建时完整显示一次。调用读接口时放在 Authorization: Bearer，或请求头 X-Api-Key。" />
      <div className="mt-3 bg-white p-3">
        {canWrite ? (
          <Button type="primary" className="mb-3" onClick={() => setCreating(true)}>
            创建密钥
          </Button>
        ) : null}
        <Table rowKey="id" columns={columns} dataSource={list} pagination={false} scroll={{ x: 860 }} />
      </div>
      <Modal open={creating} title="创建密钥" confirmLoading={saving} onOk={() => form.submit()} onCancel={() => setCreating(false)} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="scopes" label="可读范围" rules={[{ required: true, message: "至少选一个范围" }]}>
            <Checkbox.Group options={API_KEY_SCOPES} />
          </Form.Item>
          <Form.Item name="expires_at" label="过期时间">
            <DatePicker showTime className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={Boolean(secret)} title="密钥已创建" footer={null} onCancel={() => setSecret("")} maskClosable={false}>
        <p>这是唯一一次看到完整密钥。关闭后列表里只保留前缀。</p>
        <Typography.Paragraph copyable={{ text: secret }} code>
          {secret}
        </Typography.Paragraph>
      </Modal>
    </div>
  );
};

export default ApiKeyAdmin;
