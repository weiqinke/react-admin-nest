import { hasPermission } from "@/api/announcement";
import { TICKET_PRIORITY, deleteTicketTemplate, listTicketTemplates, upsertTicketTemplate } from "@/api/platform";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, message } from "antd";
import { FC, useEffect, useState } from "react";

const TemplatesTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const load = () => {
    setLoading(true);
    listTicketTemplates()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      name: draft.name || "",
      title: draft.title || "",
      content: draft.content || "",
      priority: draft.priority || "normal",
      enabled: draft.enabled !== false
    });
  }, [draft, form]);

  const save = async (values: any) => {
    setSaving(true);
    try {
      await upsertTicketTemplate({
        id: draft?.id,
        name: values.name,
        title: values.title,
        content: values.content,
        priority: values.priority,
        enabled: Boolean(values.enabled)
      });
      message.success("已保存");
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: any) => {
    Modal.confirm({
      title: "删除模板",
      icon: <ExclamationCircleOutlined />,
      content: `确认删除「${row.name}」？`,
      okText: "删除",
      okType: "danger",
      onOk: async () => {
        await deleteTicketTemplate(String(row.id));
        message.success("已删除");
        load();
      }
    });
  };

  return (
    <>
      <div className="admin-toolbar">
        <Button onClick={load}>刷新</Button>
        {canWrite ? (
          <Button type="primary" onClick={() => setDraft({ enabled: true, priority: "normal" })}>
            新建模板
          </Button>
        ) : null}
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        locale={{ emptyText: loading ? "加载中…" : "暂无模板" }}
        columns={[
          { title: "名称", dataIndex: "name" },
          { title: "标题", dataIndex: "title", ellipsis: true },
          { title: "优先级", dataIndex: "priority", width: 90, render: (v: string) => TICKET_PRIORITY[v] || v },
          { title: "启用", dataIndex: "enabled", width: 80, render: (v: boolean) => (v ? "是" : "否") },
          {
            title: "操作",
            width: 140,
            render: (row: any) =>
              canWrite ? (
                <Space>
                  <Button size="small" onClick={() => setDraft(row)}>
                    编辑
                  </Button>
                  <Button size="small" danger onClick={() => remove(row)}>
                    删除
                  </Button>
                </Space>
              ) : null
          }
        ]}
      />
      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑模板" : "新建模板"}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="默认标题">
            <Input />
          </Form.Item>
          <Form.Item name="content" label="默认内容">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="normal">
            <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TemplatesTab;
