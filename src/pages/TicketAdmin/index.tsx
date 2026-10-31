import { hasPermission } from "@/api/announcement";
import {
  TICKET_PRIORITY,
  TICKET_STATUS,
  batchAssignTickets,
  batchTickets,
  dataScopeLabel,
  deleteTicketAssignRule,
  deleteTicketTemplate,
  flattenDepts,
  listDepts,
  listTicketAssignRules,
  listTicketTemplates,
  listTickets,
  ticketOverdue,
  toDeptTree,
  upsertTicketAssignRule,
  upsertTicketTemplate
} from "@/api/platform";
import { findUserOptions } from "@/api/user";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Alert, Button, Form, Input, Modal, Select, Space, Switch, Table, Tabs, Tag, TreeSelect, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "工单处理" }];

const statusColor: Record<string, string> = {
  open: "gold",
  assigned: "blue",
  processing: "cyan",
  closed: "default"
};

const TicketListTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [overdue, setOverdue] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [dataScope, setDataScope] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<"assign" | "close" | "priority">("assign");
  const [batchForm] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const query = (nextPage = page) => ({
    page: nextPage,
    page_size: 20,
    keyword: keyword.trim() || undefined,
    status,
    priority,
    overdue
  });

  const load = (nextPage = page) => {
    listTickets(query(nextPage))
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setDataScope(res.data?.data?.data_scope || "");
        setPage(nextPage);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    load(1);
    if (canWrite && hasPermission("user:read")) {
      findUserOptions()
        .then(res => setUsers(res.data?.data || []))
        .catch(() => setUsers([]));
    }
    if (canWrite && hasPermission("dept:read")) {
      listDepts()
        .then(res => setDepts(res.data?.data?.list || []))
        .catch(() => setDepts([]));
    }
  }, []);

  const openBatch = (action: "assign" | "close" | "priority") => {
    if (!selectedKeys.length) {
      message.warning("请先勾选工单");
      return;
    }
    setBatchAction(action);
    batchForm.resetFields();
    setBatchOpen(true);
  };

  const submitBatch = async (values: any) => {
    if (batchAction === "assign") {
      if (!values.assignee_id && !values.department_id) {
        message.warning("处理人和部门至少填一个");
        return;
      }
      const res = await batchAssignTickets({
        ids: selectedKeys,
        assignee_id: values.assignee_id || "",
        department_id: values.department_id || ""
      });
      const failed = res.data?.data?.failed || [];
      if (failed.length) message.warning(`分派完成，失败 ${failed.length} 个`);
      else message.success("已分派");
    } else {
      const res = await batchTickets({
        ids: selectedKeys,
        action: batchAction,
        priority: values.priority,
        close_reason: values.close_reason
      });
      const results = res.data?.data?.results || [];
      const fail = results.filter((item: any) => !item.ok).length;
      if (fail) message.warning(`完成，失败 ${fail} 个`);
      else message.success("已更新");
    }
    setBatchOpen(false);
    setSelectedKeys([]);
    load();
  };

  const columns: any = [
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 90,
      render: (value: string) => TICKET_PRIORITY[value] || value
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: string) => <Tag color={statusColor[value] || "default"}>{TICKET_STATUS[value] || value}</Tag>
    },
    {
      title: "截止",
      dataIndex: "due_at",
      width: 180,
      responsive: ["lg"],
      render: (value: string, row: any) => {
        if (!value) return "—";
        return (
          <span>
            {dayjs(value).format("YYYY-MM-DD HH:mm")}
            {ticketOverdue(row) ? (
              <Tag color="red" className="ml-1">
                已过期
              </Tag>
            ) : null}
          </span>
        );
      }
    },
    { title: "更新时间", dataIndex: "updated_at", responsive: ["xl"], width: 180 },
    {
      title: "操作",
      width: 90,
      render: (row: any) => (
        <Button size="small" type="primary" onClick={() => setCurrent(String(row.id))}>
          处理
        </Button>
      )
    }
  ];

  return (
    <>
      {dataScope ? <Alert className="mb-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} /> : null}
      <div className="admin-toolbar">
        <Input allowClear placeholder="标题包含" style={{ width: 180 }} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => load(1)} />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          options={Object.entries(TICKET_STATUS).map(([value, label]) => ({ value, label }))}
          onChange={value => setStatus(value)}
        />
        <Select
          allowClear
          placeholder="优先级"
          style={{ width: 120 }}
          value={priority}
          options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))}
          onChange={value => setPriority(value)}
        />
        <Select
          allowClear
          placeholder="截止"
          style={{ width: 140 }}
          value={overdue}
          options={[{ value: "1", label: "仅已过期" }]}
          onChange={value => setOverdue(value)}
        />
        <Button type="primary" onClick={() => load(1)}>
          查询
        </Button>
        {canWrite && selectedKeys.length ? (
          <Space>
            <Button onClick={() => openBatch("assign")}>批量分派</Button>
            <Button onClick={() => openBatch("priority")}>批量改优先级</Button>
            <Button danger onClick={() => openBatch("close")}>
              批量关闭
            </Button>
          </Space>
        ) : null}
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        scroll={{ x: 900 }}
        pagination={{ current: page, total, pageSize: 20, onChange: next => load(next) }}
        rowSelection={
          canWrite
            ? {
                selectedRowKeys: selectedKeys,
                onChange: keys => setSelectedKeys(keys.map(String))
              }
            : undefined
        }
      />
      {current ? <TicketPanel ticketId={current} onClose={() => setCurrent("")} onChanged={() => load()} /> : null}
      <Modal
        open={batchOpen}
        title={batchAction === "assign" ? "批量分派" : batchAction === "close" ? "批量关闭" : "批量改优先级"}
        onOk={() => batchForm.submit()}
        onCancel={() => setBatchOpen(false)}
        destroyOnHidden>
        <Form form={batchForm} layout="vertical" onFinish={submitBatch}>
          {batchAction === "assign" ? (
            <>
              <Form.Item name="assignee_id" label="处理人">
                <Select allowClear showSearch optionFilterProp="label" options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))} />
              </Form.Item>
              <Form.Item name="department_id" label="部门">
                <TreeSelect allowClear treeDefaultExpandAll treeData={toDeptTree(depts, { disableOff: true })} />
              </Form.Item>
            </>
          ) : null}
          {batchAction === "priority" ? (
            <Form.Item name="priority" label="优先级" rules={[{ required: true, message: "请选择" }]} initialValue="normal">
              <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          ) : null}
          {batchAction === "close" ? (
            <Form.Item name="close_reason" label="关闭原因" rules={[{ required: true, message: "请填写关闭原因" }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

const TemplatesTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const load = () => {
    listTicketTemplates()
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
        dataSource={list}
        pagination={false}
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
                  <Button
                    size="small"
                    danger
                    onClick={async () => {
                      await deleteTicketTemplate(String(row.id));
                      message.success("已删除");
                      load();
                    }}>
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

const RulesTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const load = () => {
    listTicketAssignRules()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
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
        dataSource={list}
        pagination={false}
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
                  <Button
                    size="small"
                    danger
                    onClick={async () => {
                      await deleteTicketAssignRule(String(row.id));
                      message.success("已删除");
                      load();
                    }}>
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

const TicketAdmin: FC = () => {
  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="列表已按当前角色的数据范围过滤。支持批量分派/关闭/改优先级。模板用于创建工单预填；自动分派规则按优先级轮询处理人池。"
      />
      <div className="admin-card">
        <Tabs
          items={[
            { key: "list", label: "工单列表", children: <TicketListTab /> },
            { key: "templates", label: "工单模板", children: <TemplatesTab /> },
            { key: "rules", label: "自动分派", children: <RulesTab /> }
          ]}
        />
      </div>
    </div>
  );
};

export default TicketAdmin;
