import { createTicket, listMyTickets, listTicketTemplates, ticketOverdue, TICKET_PRIORITY, TICKET_STATUS } from "@/api/platform";
import { getUserState } from "@/api/session";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Button, DatePicker, Form, Input, Modal, Segmented, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "工单" }, { title: "我的工单" }];

const statusColor: Record<string, string> = {
  open: "gold",
  assigned: "blue",
  processing: "cyan",
  closed: "default"
};

const MyTickets: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [overdue, setOverdue] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [side, setSide] = useState("all");
  const [templates, setTemplates] = useState<any[]>([]);
  const [form] = Form.useForm();
  const viewerId = String(getUserState().uid || "");

  const query = () => ({
    page: 1,
    page_size: 100,
    keyword: keyword.trim() || undefined,
    status,
    priority,
    overdue
  });

  const load = () => {
    listMyTickets(query())
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
    listTicketTemplates(true)
      .then(res => setTemplates(res.data?.data?.list || []))
      .catch(() => setTemplates([]));
  }, []);

  const applyTemplate = (id: string) => {
    const tpl = templates.find(item => String(item.id) === String(id));
    if (!tpl) return;
    form.setFieldsValue({
      template_id: id,
      title: tpl.title || form.getFieldValue("title"),
      content: tpl.content || form.getFieldValue("content"),
      priority: tpl.priority || form.getFieldValue("priority") || "normal"
    });
  };

  const submit = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {
        title: values.title,
        content: values.content,
        priority: values.priority || "normal"
      };
      if (values.template_id) payload.template_id = values.template_id;
      if (values.due_at) payload.due_at = dayjs(values.due_at).format("YYYY-MM-DDTHH:mm:ssZ");
      await createTicket(payload);
      message.success("已提交");
      setCreating(false);
      form.resetFields();
      load();
    } finally {
      setSaving(false);
    }
  };

  const visible = list.filter(row => {
    const created = String(row.creator_id) === viewerId;
    const assigned = String(row.assignee_id || "") === viewerId;
    if (side === "created") return created;
    if (side === "assigned") return assigned;
    return true;
  });

  const columns: any = [
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "关系",
      width: 120,
      render: (row: any) => {
        const created = String(row.creator_id) === viewerId;
        const assigned = String(row.assignee_id || "") === viewerId;
        if (created && assigned) return "我提交并处理";
        if (assigned) return "分派给我";
        if (created) return "我提交的";
        return "—";
      }
    },
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
          查看
        </Button>
      )
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction
        infos={infos}
        introduction="这里同时列出你提交的工单和分派给你的工单。可按标题、优先级和是否过期筛选。截止到点不会自动关单。有处理人时留言会通知对方。"
      />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          <Button type="primary" onClick={() => setCreating(true)}>
            提交工单
          </Button>
          <Segmented
            value={side}
            options={[
              { label: "全部", value: "all" },
              { label: "我提交的", value: "created" },
              { label: "分派给我", value: "assigned" }
            ]}
            onChange={value => setSide(String(value))}
          />
          <Input allowClear placeholder="标题包含" style={{ width: 160 }} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => load()} />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
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
            style={{ width: 120 }}
            value={overdue}
            options={[{ value: "1", label: "仅已过期" }]}
            onChange={value => setOverdue(value)}
          />
          <Button onClick={() => load()}>查询</Button>
        </Space>
        {total > list.length ? <div className="mb-2 text-neutral-500">还有更早的工单未加载，可用筛选缩小范围。</div> : null}
        <Table rowKey="id" columns={columns} dataSource={visible} pagination={{ pageSize: 20 }} />
      </div>
      <Modal open={creating} title="提交工单" confirmLoading={saving} onOk={() => form.submit()} onCancel={() => setCreating(false)} destroyOnHidden>
        <Form form={form} layout="vertical" initialValues={{ priority: "normal" }} onFinish={submit}>
          {templates.length ? (
            <Form.Item name="template_id" label="使用模板" extra="选择后会预填标题、内容和优先级，仍可修改。">
              <Select
                allowClear
                placeholder="可选模板"
                options={templates.map(item => ({ value: String(item.id), label: item.name }))}
                onChange={value => value && applyTemplate(String(value))}
              />
            </Form.Item>
          ) : null}
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请填写标题" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="due_at" label="截止时间" extra="可选。到点不会自动关单。">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请填写内容" }]}>
            <Input.TextArea rows={5} maxLength={4000} />
          </Form.Item>
        </Form>
      </Modal>
      {current ? <TicketPanel mine ticketId={current} onClose={() => setCurrent("")} onChanged={() => load()} /> : null}
    </div>
  );
};

export default MyTickets;
