import { createTicket, listMyTickets, TICKET_PRIORITY, TICKET_STATUS } from "@/api/platform";
import { getUserState } from "@/api/session";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Button, Form, Input, Modal, Segmented, Select, Space, Table, Tag, message } from "antd";
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
  const [status, setStatus] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [side, setSide] = useState("all");
  const [form] = Form.useForm();
  const viewerId = String(getUserState().uid || "");

  const load = (nextStatus = status) => {
    listMyTickets({ page: 1, page_size: 100, status: nextStatus })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    listMyTickets({ page: 1, page_size: 100 })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
      })
      .catch(() => setList([]));
  }, []);

  const submit = async (values: any) => {
    setSaving(true);
    try {
      await createTicket({ title: values.title, content: values.content, priority: values.priority || "normal" });
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
    { title: "更新时间", dataIndex: "updated_at", responsive: ["lg"], width: 180 },
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
      <PageIntroduction infos={infos} introduction="这里同时列出你提交的工单和分派给你的工单。只有提单人可以关闭自己的工单；被分派的人可以查看，处理仍走工单管理。" />
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
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 140 }}
            value={status}
            options={Object.entries(TICKET_STATUS).map(([value, label]) => ({ value, label }))}
            onChange={value => setStatus(value)}
          />
          <Button onClick={() => load(status)}>查询</Button>
        </Space>
        {total > list.length ? <div className="mb-2 text-neutral-500">还有更早的工单未加载，可用状态缩小范围。</div> : null}
        <Table rowKey="id" columns={columns} dataSource={visible} pagination={{ pageSize: 20 }} />
      </div>
      <Modal open={creating} title="提交工单" confirmLoading={saving} onOk={() => form.submit()} onCancel={() => setCreating(false)} destroyOnHidden>
        <Form form={form} layout="vertical" initialValues={{ priority: "normal" }} onFinish={submit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请填写标题" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
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
