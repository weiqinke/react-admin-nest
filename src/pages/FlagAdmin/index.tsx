import { hasPermission } from "@/api/announcement";
import { listFlags, upsertFlag } from "@/api/ops";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, Form, Input, Modal, Switch, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "Feature Flag" }];

const FlagAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canWrite = hasPermission("config:write");

  const load = () => {
    listFlags()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      code: draft.code || "",
      name: draft.name || "",
      description: draft.description || "",
      enabled: draft.enabled !== false
    });
  }, [draft, form]);

  const save = async (values: any) => {
    setSaving(true);
    try {
      await upsertFlag({
        code: values.code,
        name: values.name,
        description: values.description || "",
        enabled: Boolean(values.enabled)
      });
      message.success("已保存");
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns: any = [
    { title: "编码", dataIndex: "code", width: 180 },
    { title: "名称", dataIndex: "name" },
    { title: "说明", dataIndex: "description", ellipsis: true, responsive: ["lg"] },
    {
      title: "状态",
      dataIndex: "enabled",
      width: 90,
      render: (value: boolean) => (value ? <Tag color="blue">开启</Tag> : <Tag>关闭</Tag>)
    },
    {
      title: "操作",
      width: 160,
      render: (row: any) =>
        canWrite ? (
          <>
            <Button size="small" type="link" onClick={() => setDraft(row)}>
              编辑
            </Button>
            <Switch
              size="small"
              checked={Boolean(row.enabled)}
              onChange={async checked => {
                await upsertFlag({
                  code: row.code,
                  name: row.name,
                  description: row.description || "",
                  enabled: checked
                });
                message.success(checked ? "已开启" : "已关闭");
                load();
              }}
            />
          </>
        ) : null
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="功能开关按编码 upsert。业务侧可通过 GET /api/me/flags 读取当前用户生效集合。" />
      <div className="admin-card">
        <div className="admin-toolbar">
          <Button onClick={load}>刷新</Button>
          {canWrite ? (
            <Button type="primary" onClick={() => setDraft({ enabled: true })}>
              新建 Flag
            </Button>
          ) : null}
        </div>
        <Table rowKey="code" columns={columns} dataSource={list} pagination={false} />
      </div>
      <Modal
        open={Boolean(draft)}
        title={draft?.code ? "编辑 Flag" : "新建 Flag"}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: "请填写编码" }]}>
            <Input disabled={list.some(item => item.code === draft?.code)} placeholder="例如 ai.chat" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="开启" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FlagAdmin;
