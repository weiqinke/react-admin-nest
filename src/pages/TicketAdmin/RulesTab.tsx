import { hasPermission } from "@/api/announcement";
import { TICKET_PRIORITY, deleteTicketAssignRule, flattenDepts, listDepts, listTicketAssignRules, toDeptTree, upsertTicketAssignRule } from "@/api/platform";
import { findUserOptions } from "@/api/user";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, TreeSelect, message } from "antd";
import { FC, useEffect, useState } from "react";

const RulesTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const load = () => {
    setLoading(true);
    listTicketAssignRules()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (hasPermission("user:read")) {
      findUserOptions()
        .then(res => setUsers(res.data?.data || []))
        .catch(() => setUsers([]));
    }
    if (hasPermission("dept:read")) {
      listDepts()
        .then(res => setDepts(res.data?.data?.list || []))
        .catch(() => setDepts([]));
    }
  }, []);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      name: draft.name || "",
      priority: draft.priority || undefined,
      department_id: draft.department_id || undefined,
      assignee_pool: draft.assignee_pool || [],
      enabled: draft.enabled !== false
    });
  }, [draft, form]);

  const save = async (values: any) => {
    setSaving(true);
    try {
      await upsertTicketAssignRule({
        id: draft?.id,
        name: values.name,
        priority: values.priority || "",
        department_id: values.department_id || "",
        assignee_pool: values.assignee_pool || [],
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
      title: "删除规则",
      icon: <ExclamationCircleOutlined />,
      content: `确认删除「${row.name}」？`,
      okText: "删除",
      okType: "danger",
      onOk: async () => {
        await deleteTicketAssignRule(String(row.id));
        message.success("已删除");
        load();
      }
    });
  };

  const userName = (id: string) => users.find(item => String(item.uid || item.id) === String(id))?.username || id;

  return (
    <>
      <div className="admin-toolbar">
        <Button onClick={load}>刷新</Button>
        {canWrite ? (
          <Button type="primary" onClick={() => setDraft({ enabled: true, assignee_pool: [] })}>
            新建规则
          </Button>
        ) : null}
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        locale={{ emptyText: loading ? "加载中…" : "暂无规则" }}
        columns={[
          { title: "名称", dataIndex: "name" },
          { title: "优先级匹配", dataIndex: "priority", width: 110, render: (v: string) => (v ? TICKET_PRIORITY[v] || v : "全部") },
          {
            title: "部门",
            dataIndex: "department_id",
            width: 140,
            render: (id: string) => (id ? flattenDepts(depts).find(item => String(item.id) === String(id))?.name || id : "—")
          },
          {
            title: "处理人池",
            dataIndex: "assignee_pool",
            render: (pool: string[] = []) => pool.map(userName).join("、") || "—"
          },
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
        title={draft?.id ? "编辑规则" : "新建规则"}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="priority" label="匹配优先级" extra="空表示匹配全部">
            <Select allowClear options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="department_id" label="部门">
            <TreeSelect allowClear treeDefaultExpandAll treeData={toDeptTree(depts, { disableOff: true })} />
          </Form.Item>
          <Form.Item name="assignee_pool" label="处理人池" rules={[{ required: true, message: "至少选一人" }]}>
            <Select mode="multiple" showSearch optionFilterProp="label" options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RulesTab;
