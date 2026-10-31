import { hasPermission } from "@/api/announcement";
import { createAiModel, deleteAiModel, listAiModels, updateAiModel } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "模型管理" }];

const emptyModel = { provider: "none", enabled: true };

const AiAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canWrite = hasPermission("ai:write");

  const load = () => {
    listAiModels()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      name: draft.name || "",
      provider: draft.provider || "none",
      base_url: draft.base_url || "",
      model: draft.model || "",
      api_key: "",
      enabled: draft.enabled !== false
    });
  }, [draft, form]);

  const save = async (values: any) => {
    setSaving(true);
    try {
      const body: any = {
        name: values.name,
        provider: values.provider,
        base_url: values.base_url || "",
        model: values.model || "",
        enabled: Boolean(values.enabled)
      };
      if (values.api_key) body.api_key = values.api_key;
      if (draft?.id) await updateAiModel(String(draft.id), body);
      else await createAiModel(body);
      message.success("已保存");
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: any) => {
    Modal.confirm({
      title: "删除模型",
      icon: <ExclamationCircleOutlined />,
      content: `删除「${row.name}」。已有对话的模型无法删除。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deleteAiModel(String(row.id));
        message.success("已删除");
        load();
      }
    });
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "提供方", dataIndex: "provider", width: 100 },
    { title: "模型", dataIndex: "model", render: (value: string) => value || "—" },
    { title: "地址", dataIndex: "base_url", ellipsis: true, responsive: ["lg"], render: (value: string) => value || "—" },
    {
      title: "密钥",
      width: 120,
      render: (row: any) => (row.api_key_set ? <Tag color="blue">{row.api_key_hint || "已配置"}</Tag> : <Tag>未配置</Tag>)
    },
    {
      title: "状态",
      dataIndex: "enabled",
      width: 90,
      render: (enabled: boolean) => (enabled ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>)
    },
    {
      title: "操作",
      width: 150,
      render: (row: any) =>
        canWrite ? (
          <Space>
            <Button size="small" type="primary" onClick={() => setDraft(row)}>
              编辑
            </Button>
            <Button size="small" danger onClick={() => remove(row)}>
              删除
            </Button>
          </Space>
        ) : null
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="未填写接口地址，或提供方选「未接入」时，对话会回复固定说明并记一笔调用。密钥不会回显。" />
      <div className="admin-card">
        {canWrite ? (
          <div className="admin-toolbar">
            <Button type="primary" onClick={() => setDraft(emptyModel)}>
              添加模型
            </Button>
          </div>
        ) : null}
        <Table rowKey="id" columns={columns} dataSource={list} pagination={false} scroll={{ x: 900 }} />
      </div>
      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑模型" : "添加模型"}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="provider" label="提供方" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "none", label: "未接入" },
                { value: "openai", label: "OpenAI 兼容" }
              ]}
            />
          </Form.Item>
          <Form.Item name="base_url" label="接口地址" extra="OpenAI 兼容接口填服务根地址即可，系统会补 /v1/chat/completions。未接入可留空。">
            <Input placeholder="https://api.example.com" />
          </Form.Item>
          <Form.Item name="model" label="模型名">
            <Input placeholder="gpt-4o-mini" />
          </Form.Item>
          <Form.Item name="api_key" label="密钥" extra={draft?.id ? "留空则保留原来的密钥。" : ""}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AiAdmin;
