import {
  createChangelog,
  deleteChangelog,
  listAdminChangelogs,
  publishChangelog,
  updateChangelog
} from "@/api/changelog";
import { hasPermission } from "@/api/announcement";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "变更日志" }];

const statusText: Record<string, string> = {
  draft: "草稿",
  published: "已发布"
};

function formatTime(value?: string | null) {
  if (!value) return "—";
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

const ChangelogAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const canWrite = hasPermission("changelog:write");
  const canRead = hasPermission("changelog:read");

  const load = (nextPage = page) => {
    if (!canRead) return;
    setLoading(true);
    const { keyword, status } = filterForm.getFieldsValue();
    listAdminChangelogs({ page: nextPage, page_size: 20, keyword, status })
      .then(res => {
        const data = res.data?.data || {};
        setList(data.list || []);
        setTotal(data.total || 0);
        setPage(data.page || nextPage);
      })
      .catch(() => {
        setList([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    if (!draft) {
      editForm.resetFields();
      return;
    }
    editForm.setFieldsValue({
      version: draft.version || "",
      title: draft.title || "",
      body: draft.body || "",
      notify_mail: Boolean(draft.notify_mail)
    });
  }, [draft, editForm]);

  const openCreate = () => setDraft({ id: "", status: "draft" });

  const save = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        version: values.version.trim(),
        title: values.title.trim(),
        body: values.body || "",
        notify_mail: Boolean(values.notify_mail)
      };
      if (draft?.id) await updateChangelog(String(draft.id), payload);
      else await createChangelog(payload);
      message.success("已保存");
      setDraft(null);
      load(draft?.id ? page : 1);
    } finally {
      setSaving(false);
    }
  };

  const confirmAction = (title: string, action: () => Promise<any>) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: title,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await action();
        message.success("操作成功");
        load();
      }
    });
  };

  const columns: any = [
    { title: "版本", dataIndex: "version", width: 120 },
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: string) => <Tag color={status === "published" ? "green" : "default"}>{statusText[status] || status}</Tag>
    },
    {
      title: "发布邮件",
      dataIndex: "notify_mail",
      width: 90,
      render: (v: boolean) => (v ? "是" : "否")
    },
    {
      title: "发布时间",
      dataIndex: "published_at",
      width: 150,
      render: (v: string) => formatTime(v)
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      width: 150,
      render: (v: string) => formatTime(v)
    },
    {
      title: "操作",
      width: 220,
      render: (row: any) => (
        <Space wrap>
          {canWrite && row.status === "draft" ? (
            <Button type="link" size="small" onClick={() => setDraft(row)}>
              编辑
            </Button>
          ) : null}
          {canWrite && row.status === "draft" ? (
            <Button type="link" size="small" onClick={() => confirmAction("发布后将对登录用户可见。若勾选了邮件通知，会向有邮箱的用户抽样发送。", () => publishChangelog(row.id))}>
              发布
            </Button>
          ) : null}
          {canWrite ? (
            <Button
              danger
              type="link"
              size="small"
              onClick={() =>
                confirmAction("确认删除该变更日志？", async () => {
                  await deleteChangelog(row.id);
                })
              }>
              删除
            </Button>
          ) : null}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="维护版本变更说明与运维手册条目。发布后登录用户可在「关于」页查看；可选向有邮箱的启用用户发邮件（最多抽样 50）。" />
      <div className="admin-card">
        <div className="admin-toolbar">
          <Form form={filterForm} layout="inline" className="admin-filter-form" onFinish={() => load(1)}>
            <Form.Item name="keyword" label="关键字">
              <Input allowClear placeholder="版本/标题" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 120 }}
                options={[
                  { value: "draft", label: "草稿" },
                  { value: "published", label: "已发布" }
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
            </Form.Item>
          </Form>
          {canWrite ? (
            <Button type="primary" onClick={openCreate}>
              新建
            </Button>
          ) : null}
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: next => load(next)
          }}
        />
      </div>

      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑变更日志" : "新建变更日志"}
        onCancel={() => setDraft(null)}
        onOk={() => editForm.submit()}
        confirmLoading={saving}
        destroyOnHidden
        width={640}>
        <Form form={editForm} layout="vertical" onFinish={save}>
          <Form.Item name="version" label="版本号" rules={[{ required: true, message: "请填写版本号" }]}>
            <Input placeholder="例如 1.8.0" />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请填写标题" }]}>
            <Input placeholder="本轮更新摘要" />
          </Form.Item>
          <Form.Item name="body" label="正文" rules={[{ required: true, message: "请填写正文" }]}>
            <Input.TextArea rows={8} placeholder="支持纯文本 / Markdown" />
          </Form.Item>
          <Form.Item name="notify_mail" valuePropName="checked">
            <Checkbox>发布时邮件通知（抽样）</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChangelogAdmin;
