import { beginTotpSetup, confirmTotpSetup, disableTotp, getTotpStatus } from "@/api/security";
import { changePassword, listSessions, revokeSession } from "@/api/platform";
import { expireSession } from "@/api/session";
import { Alert, Button, Col, Divider, Form, Input, Modal, Row, Space, Table, Tag, Typography, message } from "antd";
import { FC, useEffect, useState } from "react";

const SecuritySetting: FC = function () {
  const [form] = Form.useForm();
  const [totpForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [setup, setSetup] = useState<{ secret?: string; otpauth_uri?: string } | null>(null);
  const [totpBusy, setTotpBusy] = useState(false);
  const mustChange = localStorage.getItem("must_change_password") === "1";

  const load = () => {
    listSessions()
      .then(res => setSessions(res.data?.data?.list || []))
      .catch(() => setSessions([]));
    getTotpStatus()
      .then(res => setTotpEnabled(Boolean(res.data?.data?.enabled)))
      .catch(() => setTotpEnabled(false));
  };

  useEffect(() => {
    load();
  }, []);

  const savePassword = async (values: { old_password: string; new_password: string }) => {
    setSaving(true);
    try {
      await changePassword(values.old_password, values.new_password);
      message.success("密码已更新，其他设备需要重新登录");
      localStorage.removeItem("must_change_password");
      form.resetFields();
      load();
    } finally {
      setSaving(false);
    }
  };

  const startTotp = async () => {
    setTotpBusy(true);
    try {
      const res = await beginTotpSetup();
      setSetup(res.data?.data || null);
      totpForm.resetFields();
    } finally {
      setTotpBusy(false);
    }
  };

  const confirmTotp = async (values: { code: string }) => {
    setTotpBusy(true);
    try {
      await confirmTotpSetup(values.code.trim());
      message.success("双因素认证已启用");
      setSetup(null);
      load();
    } finally {
      setTotpBusy(false);
    }
  };

  const turnOffTotp = () => {
    Modal.confirm({
      title: "关闭双因素认证",
      content: (
        <Form form={totpForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="code" label="当前 TOTP" rules={[{ required: true, message: "请输入验证码" }]}>
            <Input placeholder="6 位验证码" maxLength={8} />
          </Form.Item>
        </Form>
      ),
      okText: "关闭",
      okType: "danger",
      onOk: async () => {
        const values = await totpForm.validateFields();
        await disableTotp(values.code.trim());
        message.success("已关闭双因素认证");
        load();
      }
    });
  };

  const revoke = (row: any) => {
    Modal.confirm({
      title: row.current ? "下线当前设备？" : "下线该设备？",
      content: row.current ? "当前登录会立即失效，需要重新登录。" : "该设备上的登录会立即失效。",
      okText: "下线",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await revokeSession(String(row.id));
        if (row.current) {
          expireSession();
          return;
        }
        message.success("已下线");
        load();
      }
    });
  };

  return (
    <Row gutter={[16, 16]}>
      {mustChange ? (
        <Col span={24}>
          <Alert type="warning" showIcon title="管理员要求你立即修改密码，改密前无法进行其它写操作。" />
        </Col>
      ) : null}
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          修改密码
        </Divider>
      </Col>
      <Col span={24} lg={12}>
        <Form form={form} layout="vertical" onFinish={savePassword}>
          <Form.Item name="old_password" label="当前密码" rules={[{ required: true, message: "请填写当前密码" }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6, max: 64, message: "密码长度为 6–64 位" }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="再输入一次"
            dependencies={["new_password"]}
            rules={[
              { required: true, message: "请再输入一次新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                  return Promise.reject(new Error("两次输入的密码不一致"));
                }
              })
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            更新密码
          </Button>
        </Form>
      </Col>
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          双因素认证（TOTP）
        </Divider>
      </Col>
      <Col span={24} lg={12}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            状态：{totpEnabled ? <Tag color="green">已启用</Tag> : <Tag>未启用</Tag>}
          </div>
          {totpEnabled ? (
            <Button danger onClick={turnOffTotp}>
              关闭双因素
            </Button>
          ) : setup ? (
            <Form form={totpForm} layout="vertical" onFinish={confirmTotp}>
              <Typography.Paragraph copyable={{ text: setup.secret }}>密钥：{setup.secret}</Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ wordBreak: "break-all" }}>
                {setup.otpauth_uri}
              </Typography.Paragraph>
              <Form.Item name="code" label="验证码" rules={[{ required: true, message: "请输入 App 中的 6 位码" }]}>
                <Input placeholder="6 位验证码" maxLength={8} />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={totpBusy}>
                  确认启用
                </Button>
                <Button onClick={() => setSetup(null)}>取消</Button>
              </Space>
            </Form>
          ) : (
            <Button type="primary" loading={totpBusy} onClick={startTotp}>
              开始绑定
            </Button>
          )}
        </Space>
      </Col>
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          登录设备
        </Divider>
      </Col>
      <Col span={24}>
        <Table
          rowKey="id"
          dataSource={sessions}
          pagination={false}
          columns={[
            { title: "IP", dataIndex: "ip", width: 140 },
            { title: "设备", dataIndex: "user_agent", ellipsis: true },
            { title: "登录时间", dataIndex: "created_at", responsive: ["lg"], width: 180 },
            { title: "最近活动", dataIndex: "last_seen_at", responsive: ["lg"], width: 180 },
            {
              title: "",
              dataIndex: "current",
              width: 100,
              render: (current: boolean) => (current ? <Tag color="blue">当前设备</Tag> : null)
            },
            {
              title: "操作",
              width: 90,
              render: (row: any) => (
                <Button size="small" danger onClick={() => revoke(row)}>
                  下线
                </Button>
              )
            }
          ]}
        />
      </Col>
    </Row>
  );
};

export default SecuritySetting;
