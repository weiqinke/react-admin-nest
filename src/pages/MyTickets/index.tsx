import { createTicket, listMyTickets, TICKET_PRIORITY, TICKET_STATUS } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
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
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = (next = page, nextStatus = status) => {
    listMyTickets({ page: next, page_size: 20, status: nextStatus })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setPage(next);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    listMyTickets({ page: 1, page_size: 20 })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setPage(1);
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
      load(1);
    } finally {
      setSaving(false);
    }
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
      <PageIntroduction infos={infos} introduction="在这里提交问题。工单关闭前可以补充关闭原因并自行结束。" />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          <Button type="primary" onClick={() => setCreating(true)}>
            提交工单
          </Button>
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 140 }}
            value={status}
            options={Object.entries(TICKET_STATUS).map(([value, label]) => ({ value, label }))}
            onChange={value => setStatus(value)}
          />
          <Button onClick={() => load(1, status)}>查询</Button>
        </Space>
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{ current: page, total, pageSize: 20, onChange: next => load(next) }} />
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
