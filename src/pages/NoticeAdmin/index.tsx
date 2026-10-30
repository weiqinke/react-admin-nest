import { closeNotice, listNotices, sendNotice } from "@/api/notice";
import { getUsers } from "@/api/goadmin";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "站内信管理" }];

const NoticeAdmin: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [form] = Form.useForm();

  const findAll = (nextPage = page) => {
    listNotices({ page: nextPage, page_size: 20, kind, status, keyword })
      .then(result => {
        if (result.data.code !== 0) return;
        setDataSource(result.data.data?.list || []);
        setTotal(result.data.data?.total || 0);
        setPage(nextPage);
      })
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAll(1);
    getUsers()
      .then(result => {
        if (result.data.code !== 0) return;
        const list = result.data.data?.list || [];
        setUserOptions(
          list.map((u: any) => ({
            value: String(u.uid || u.id),
            label: u.username || String(u.uid || u.id)
          }))
        );
      })
      .catch(() => undefined);
  }, []);

  const onSend = async (values: any) => {
    const result = await sendNotice({
      kind: values.kind,
      title: values.title,
      content: values.content || "",
      category: values.category || "system",
      level: values.level || "info",
      link_path: values.link_path || "",
      user_ids: values.user_ids || []
    });
    if (result.data.code !== 0) {
      message.error(result.data.message || "发送失败");
      return;
    }
    message.success("已发送");
    setOpen(false);
    form.resetFields();
    findAll(1);
  };

  const columns: any = [
    {
      title: "类型",
      dataIndex: "kind",
      width: 90,
      render: (v: string) => (v === "todo" ? <Tag color="#fa8c16">待办</Tag> : <Tag color="#2db7f5">消息</Tag>)
    },
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "分类",
      dataIndex: "category",
      width: 100,
      responsive: ["lg"]
    },
    {
      title: "投递",
      width: 120,
      render: (row: any) => `${row.read_count}/${row.recipient_count}`
    },
    {
      title: "待办完成",
      width: 100,
      responsive: ["md"],
      render: (row: any) => (row.kind === "todo" ? row.todo_done_count : "—")
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (v: string) => (v === "closed" ? <Tag>已关闭</Tag> : <Tag color="#87d068">开放</Tag>)
    },
    {
      title: "操作",
      width: 100,
      render: (row: any) =>
        row.status === "open" ? (
          <Button
            size="small"
            danger
            onClick={() =>
              Modal.confirm({
                title: "提示",
                icon: <ExclamationCircleOutlined />,
                content: "关闭后收件人不可再办结该待办。",
                onOk: async () => {
                  await closeNotice(row.id);
                  message.success("已关闭");
                  findAll();
                }
              })
            }>
            关闭
          </Button>
        ) : null
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} />
      <Space size={[8, 16]} className="mb-3" wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          发送
        </Button>
        <Select
          allowClear
          placeholder="类型"
          value={kind}
          onChange={setKind}
          style={{ width: 120 }}
          options={[
            { value: "inbox", label: "消息" },
            { value: "todo", label: "待办" }
          ]}
        />
        <Select
          allowClear
          placeholder="状态"
          value={status}
          onChange={setStatus}
          style={{ width: 120 }}
          options={[
            { value: "open", label: "开放" },
            { value: "closed", label: "已关闭" }
          ]}
        />
        <Input allowClear placeholder="搜索标题/内容" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 180 }} />
        <Button type="primary" onClick={() => findAll(1)}>
          查询
        </Button>
      </Space>
      <Table columns={columns} dataSource={dataSource} rowKey="id" pagination={{ current: page, total, pageSize: 20, onChange: next => findAll(next) }} />
      <Modal open={open} title="发送站内信 / 待办" onCancel={() => setOpen(false)} onOk={() => form.submit()} width={640} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={onSend} initialValues={{ kind: "inbox", level: "info", category: "system" }}>
          <Form.Item name="kind" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "inbox", label: "消息" },
                { value: "todo", label: "待办" }
              ]}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={4} maxLength={2000} />
          </Form.Item>
          <Form.Item name="user_ids" label="收件人" rules={[{ required: true, message: "请选择收件人" }]}>
            <Select mode="multiple" options={userOptions} optionFilterProp="label" placeholder="选择用户" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select
              options={[
                { value: "system", label: "系统" },
                { value: "task", label: "任务" },
                { value: "mention", label: "提及" },
                { value: "approval", label: "审批" }
              ]}
            />
          </Form.Item>
          <Form.Item name="level" label="级别">
            <Select
              options={[
                { value: "info", label: "普通" },
                { value: "important", label: "重要" }
              ]}
            />
          </Form.Item>
          <Form.Item name="link_path" label="跳转路径">
            <Input placeholder="如 /account" maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoticeAdmin;
