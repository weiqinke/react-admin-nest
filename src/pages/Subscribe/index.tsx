import { getUsers } from "@/api/goadmin";
import { webSocketManager } from "@/utils/ws";
import { Button, Form, Input, Modal, Select, Table, Tabs } from "antd";
import { useEffect, useState } from "react";

const levelOptions = [
  { value: "all", label: "上线和下线都提醒" },
  { value: "online_only", label: "只提醒上线" },
  { value: "mute", label: "免打扰" }
];

const Subscribe = () => {
  const [following, setFollowing] = useState<any[]>([]);
  const [fans, setFans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const data = payload?.data || {};
      if (payload?.type === "subscribe.snapshot") setFollowing(data.items || []);
      if (payload?.type === "subscribe.fans_snapshot") setFans(data.items || []);
      if (payload?.type === "subscribe.added" || payload?.type === "subscribe.updated" || payload?.type === "subscribe.removed") {
        webSocketManager.postMessage({ type: "subscribe.list" });
      }
    });
    webSocketManager.postMessage({ type: "subscribe.list" });
    webSocketManager.postMessage({ type: "subscribe.fans" });
    getUsers()
      .then(result => setUsers(result?.data?.data?.list || []))
      .catch(() => setUsers([]));
    return () => removeHandler();
  }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      webSocketManager.postMessage({
        type: "subscribe.update",
        data: { target_user_id: editing.target_user_id, note: values.note || "", notify_level: values.notify_level }
      });
    } else {
      webSocketManager.postMessage({
        type: "subscribe.add",
        data: { target_user_id: values.target_user_id, note: values.note || "", notify_level: values.notify_level || "all" }
      });
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <div className="p-4">
      <Tabs
        items={[
          {
            key: "following",
            label: "我订阅的",
            children: (
              <>
                <Button
                  className="mb-3"
                  type="primary"
                  onClick={() => {
                    setEditing(null);
                    form.resetFields();
                    setOpen(true);
                  }}>
                  添加订阅
                </Button>
                <Table
                  rowKey="target_user_id"
                  dataSource={following}
                  pagination={false}
                  columns={[
                    { title: "用户", dataIndex: "username" },
                    { title: "备注", dataIndex: "note" },
                    { title: "在线", dataIndex: "online", render: value => (value ? "在线" : "离线") },
                    {
                      title: "提醒",
                      dataIndex: "notify_level",
                      render: value => levelOptions.find(item => item.value === value)?.label || value
                    },
                    {
                      title: "操作",
                      render: (_, record) => (
                        <>
                          <Button
                            type="link"
                            onClick={() => {
                              setEditing(record);
                              form.setFieldsValue({ note: record.note, notify_level: record.notify_level || "all" });
                              setOpen(true);
                            }}>
                            编辑
                          </Button>
                          <Button
                            type="link"
                            danger
                            onClick={() => webSocketManager.postMessage({ type: "subscribe.remove", data: { target_user_id: record.target_user_id } })}>
                            取消
                          </Button>
                        </>
                      )
                    }
                  ]}
                />
              </>
            )
          },
          {
            key: "fans",
            label: "谁订阅了我",
            children: (
              <Table
                rowKey="subscriber_user_id"
                dataSource={fans}
                pagination={false}
                columns={[
                  { title: "用户", dataIndex: "username" },
                  { title: "备注", dataIndex: "note" },
                  { title: "在线", dataIndex: "online", render: value => (value ? "在线" : "离线") }
                ]}
              />
            )
          }
        ]}
      />
      <Modal title={editing ? "编辑订阅" : "添加订阅"} open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          {editing ? null : (
            <Form.Item name="target_user_id" label="用户" rules={[{ required: true, message: "请选择用户" }]}>
              <Select showSearch optionFilterProp="label" options={users.map(user => ({ value: String(user.id), label: user.username }))} />
            </Form.Item>
          )}
          <Form.Item name="note" label="备注">
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item name="notify_level" label="提醒" initialValue="all">
            <Select options={levelOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subscribe;
