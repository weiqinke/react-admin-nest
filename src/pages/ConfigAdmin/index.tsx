import { hasPermission } from "@/api/announcement";
import { listConfigGroups, listConfigs, listMailTemplates, testMail, updateConfig, upsertMailTemplate } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, Form, Input, Modal, Select, Switch, Table, Tabs, message } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

const infos = [{ title: "系统管理" }, { title: "系统参数" }];

const ConfigAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [group, setGroup] = useState<string | undefined>();
  const [editing, setEditing] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [mailDraft, setMailDraft] = useState<any>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [form] = Form.useForm();
  const [mailForm] = Form.useForm();
  const [testForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const canWrite = hasPermission("config:write");
  const canRead = hasPermission("config:read");
  const navigate = useNavigate();

  const load = () => {
    listConfigs()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
    listConfigGroups()
      .then(res => setGroups(res.data?.data?.list || []))
      .catch(() => setGroups([]));
  };

  const loadMail = () => {
    if (!canRead) return;
    listMailTemplates()
      .then(res => setTemplates(res.data?.data?.list || []))
      .catch(() => setTemplates([]));
  };

  useEffect(() => {
    load();
    loadMail();
  }, []);

  useEffect(() => {
    if (!mailDraft) return;
    mailForm.setFieldsValue({
      code: mailDraft.code || "",
      channel: mailDraft.channel || "mail",
      name: mailDraft.name || "",
      subject: mailDraft.subject || "",
      body: mailDraft.body || "",
      enabled: mailDraft.enabled !== false
    });
  }, [mailDraft, mailForm]);

  const groupOptions = useMemo(() => {
    if (groups.length) {
      return groups.map(item => ({ value: item.code, label: item.name ? `${item.name}（${item.code}）` : item.code }));
    }
    return Array.from(new Set(list.map(item => item.group).filter(Boolean))).map(code => ({ value: code, label: code }));
  }, [groups, list]);

  const rows = group ? list.filter(item => item.group === group) : list;

  const save = async (values: any) => {
    setSaving(true);
    try {
      await updateConfig(editing.key, String(values.value ?? ""));
      message.success("已保存");
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const saveMail = async (values: any) => {
    setSaving(true);
    try {
      await upsertMailTemplate({
        code: values.code,
        channel: values.channel || "mail",
        name: values.name,
        subject: values.subject || "",
        body: values.body || "",
        enabled: Boolean(values.enabled)
      });
      message.success("模板已保存");
      setMailDraft(null);
      loadMail();
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async (values: any) => {
    setSaving(true);
    try {
      await testMail(values);
      message.success("已发送（mail.enabled=false 时只打日志）");
      setTestOpen(false);
      testForm.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const columns: any = [
    { title: "分组", dataIndex: "group", width: 120 },
    { title: "名称", dataIndex: "name" },
    { title: "键", dataIndex: "key", responsive: ["lg"] },
    { title: "值", dataIndex: "value", ellipsis: true },
    { title: "说明", dataIndex: "remark", ellipsis: true, responsive: ["lg"] },
    { title: "类型", dataIndex: "value_type", width: 90 },
    {
      title: "操作",
      width: 90,
      render: (row: any) =>
        canWrite ? (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue({ value: row.value });
            }}>
            修改
          </Button>
        ) : null
    }
  ];

  const mailColumns: any = [
    { title: "编码", dataIndex: "code", width: 160 },
    { title: "名称", dataIndex: "name" },
    { title: "通道", dataIndex: "channel", width: 90 },
    { title: "主题", dataIndex: "subject", ellipsis: true },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 80,
      render: (value: boolean) => (value ? "是" : "否")
    },
    {
      title: "操作",
      width: 90,
      render: (row: any) =>
        canWrite ? (
          <Button size="small" type="primary" onClick={() => setMailDraft(row)}>
            编辑
          </Button>
        ) : null
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="站点、安全、日志、邮件参数在这里改。密码最短长度与有效期天数、SMTP 都在系统参数里。密码超期登录会返回 40305。mail.enabled=false 时只记日志不发信。"
      />
      <div className="admin-card">
        <div className="admin-toolbar mb-3">
          <Button onClick={() => navigate("/management/webhookadmin")}>Webhook</Button>
          <Button onClick={() => navigate("/management/flagadmin")}>Feature Flag</Button>
        </div>
        <Tabs
          items={[
            {
              key: "params",
              label: "系统参数",
              children: (
                <>
                  <div className="admin-toolbar">
                    <Select allowClear placeholder="分组" style={{ width: 220 }} value={group} options={groupOptions} onChange={value => setGroup(value)} />
                    <Button onClick={() => load()}>刷新</Button>
                  </div>
                  <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 960 }} />
                </>
              )
            },
            {
              key: "mail",
              label: "邮件模板",
              children: (
                <>
                  <div className="admin-toolbar">
                    <Button onClick={() => loadMail()}>刷新</Button>
                    {canWrite ? (
                      <Button type="primary" onClick={() => setMailDraft({ channel: "mail", enabled: true })}>
                        新建模板
                      </Button>
                    ) : null}
                    {canWrite ? <Button onClick={() => setTestOpen(true)}>发送测试</Button> : null}
                  </div>
                  <Table rowKey="id" columns={mailColumns} dataSource={templates} pagination={false} scroll={{ x: 800 }} />
                </>
              )
            }
          ]}
        />
      </div>
      <Modal
        open={Boolean(editing)}
        title={editing ? `修改 ${editing.name || editing.key}` : "修改参数"}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setEditing(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item label="键">
            <Input value={editing?.key} disabled />
          </Form.Item>
          {editing?.value_type === "bool" ? (
            <Form.Item name="value" label="值" rules={[{ required: true, message: "请选择" }]}>
              <Select
                options={[
                  { value: "true", label: "true" },
                  { value: "false", label: "false" }
                ]}
              />
            </Form.Item>
          ) : (
            <Form.Item name="value" label="值" rules={[{ required: editing?.value_type === "int", message: "请填写数值" }]}>
              {editing?.value_type === "int" ? <Input /> : <Input.TextArea rows={4} maxLength={2000} />}
            </Form.Item>
          )}
          {editing?.remark ? <div className="text-neutral-500">{editing.remark}</div> : null}
        </Form>
      </Modal>
      <Modal
        open={Boolean(mailDraft)}
        title={mailDraft?.id ? "编辑邮件模板" : "新建邮件模板"}
        confirmLoading={saving}
        onOk={() => mailForm.submit()}
        onCancel={() => setMailDraft(null)}
        destroyOnHidden>
        <Form form={mailForm} layout="vertical" onFinish={saveMail}>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: "请填写编码" }]}>
            <Input disabled={Boolean(mailDraft?.id)} placeholder="例如 ticket.due" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="channel" label="通道" initialValue="mail">
            <Select
              options={[
                { value: "mail", label: "mail" },
                { value: "log", label: "log" }
              ]}
            />
          </Form.Item>
          <Form.Item name="subject" label="主题">
            <Input placeholder="可用 {{key}} 占位" />
          </Form.Item>
          <Form.Item name="body" label="正文">
            <Input.TextArea rows={6} placeholder="可用 {{key}} 占位" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={testOpen} title="发送测试邮件" confirmLoading={saving} onOk={() => testForm.submit()} onCancel={() => setTestOpen(false)} destroyOnHidden>
        <Form form={testForm} layout="vertical" onFinish={sendTest}>
          <Form.Item name="to" label="收件人" rules={[{ required: true, message: "请填写收件人" }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="subject" label="主题" rules={[{ required: true, message: "请填写主题" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="正文" rules={[{ required: true, message: "请填写正文" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigAdmin;
