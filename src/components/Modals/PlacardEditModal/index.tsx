import { createAnnouncement, estimateAnnouncementAudience, updateAnnouncement, updateAnnouncementSchedule } from "@/api/announcement";
import { listDictOptions } from "@/api/dict";
import { listDepts, toDeptTree } from "@/api/platform";
import { findRoles } from "@/api/role";
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Space, TreeSelect, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function toIso(value) {
  if (!value) return null;
  return dayjs(value).toISOString();
}

const PlacardEditModal: FC<any> = ({ placard, onOk, onCancel }: any) => {
  const [form] = Form.useForm();
  const locked = placard?.status === "published" || placard?.status === "revoked";
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([
    { value: "system", label: "系统公告" },
    { value: "notification", label: "普通通知" }
  ]);
  const [levelOptions, setLevelOptions] = useState<{ value: string; label: string }[]>([
    { value: "normal", label: "普通" },
    { value: "required", label: "必须确认" }
  ]);
  const [depts, setDepts] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);

  useEffect(() => {
    listDictOptions("announcement_type")
      .then(result => {
        if (result.data.code !== 0) return;
        const list = (result.data.data || []).map((row: any) => ({ value: row.value, label: row.label }));
        if (list.length) setTypeOptions(list);
      })
      .catch(() => undefined);
    listDictOptions("announcement_level")
      .then(result => {
        if (result.data.code !== 0) return;
        const list = (result.data.data || []).map((row: any) => ({ value: row.value, label: row.label }));
        if (list.length) setLevelOptions(list);
      })
      .catch(() => undefined);
    listDepts()
      .then(res => setDepts(res.data?.data?.list || []))
      .catch(() => setDepts([]));
    findRoles()
      .then(res =>
        setRoles(
          (res.data?.data || []).map((item: any) => ({
            value: String(item.code),
            label: item.name ? `${item.name}（${item.code}）` : String(item.code)
          }))
        )
      )
      .catch(() => setRoles([]));
  }, []);

  const runEstimate = async () => {
    const values = form.getFieldsValue();
    setEstimating(true);
    try {
      const res = await estimateAnnouncementAudience({
        target_depts: values.target_dept_ids || [],
        target_roles: values.target_role_codes || []
      });
      const count = Number(res.data?.data?.estimated_users ?? 0);
      setEstimate(count);
      message.info(`预估受众约 ${count} 人（空部门/角色表示全员启用账号）`);
    } finally {
      setEstimating(false);
    }
  };

  const onFinish = async payload => {
    const body = {
      title: payload.title,
      content: payload.content || "",
      type: payload.level === "required" ? "system" : payload.type,
      level: payload.level,
      starts_at: toIso(payload.starts_at),
      expires_at: toIso(payload.expires_at),
      target_dept_ids: payload.target_dept_ids || [],
      target_role_codes: payload.target_role_codes || []
    };
    const result = !placard?.id
      ? await createAnnouncement(body)
      : locked
        ? await updateAnnouncementSchedule(placard.id, { starts_at: body.starts_at, expires_at: body.expires_at })
        : await updateAnnouncement(placard.id, body);
    if (result.data.code !== 0) {
      message.info("操作失败");
      return;
    }
    message.success("操作成功");
    onOk();
  };

  useEffect(() => {
    form.resetFields();
    setEstimate(null);
    if (placard?.id) {
      form.setFieldsValue({
        ...placard,
        content: placard.content,
        starts_at: placard.starts_at ? dayjs(placard.starts_at) : null,
        expires_at: placard.expires_at ? dayjs(placard.expires_at) : null,
        target_dept_ids: placard.target_dept_ids || [],
        target_role_codes: placard.target_role_codes || []
      });
    }
  }, [placard, form]);

  return (
    <Modal
      open
      forceRender
      title={`${placard?.id ? (locked ? "生效时间" : "编辑") : "新增"}公告`}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={800}
      getContainer={false}>
      <Form form={form} onFinish={onFinish} initialValues={{ type: "system", level: "normal" }} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="title" label="公告名称" rules={[{ required: true, message: "请填写公告名称" }]}>
              <Input placeholder="公告名称" autoComplete="off" disabled={locked} maxLength={100} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="level" label="等级" rules={[{ required: true }]}>
              <Select
                disabled={locked}
                options={levelOptions}
                onChange={level => {
                  if (level === "required") form.setFieldsValue({ type: "system" });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.level !== next.level}>
              {() => (
                <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                  <Select disabled={locked || form.getFieldValue("level") === "required"} options={typeOptions} />
                </Form.Item>
              )}
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name="content"
              label="详情"
              dependencies={["level"]}
              rules={[
                ({ getFieldValue }) => ({
                  required: getFieldValue("level") === "required",
                  message: "必须确认的公告需要填写正文"
                })
              ]}>
              <Input.TextArea rows={4} disabled={locked} maxLength={2000} />
            </Form.Item>
          </Col>
          {!locked ? (
            <>
              <Col span={20}>
                <Form.Item name="target_dept_ids" label="目标部门" extra="留空表示不限部门">
                  <TreeSelect
                    allowClear
                    treeCheckable
                    treeDefaultExpandAll
                    placeholder="可选"
                    treeData={toDeptTree(depts, { disableOff: true })}
                    onChange={() => setEstimate(null)}
                  />
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item name="target_role_codes" label="目标角色" extra="留空表示不限角色">
                  <Select mode="multiple" allowClear optionFilterProp="label" placeholder="可选" options={roles} onChange={() => setEstimate(null)} />
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item label="受众预估">
                  <Space>
                    <Button loading={estimating} onClick={runEstimate}>
                      预估人数
                    </Button>
                    {estimate != null ? <span>约 {estimate} 人</span> : null}
                  </Space>
                </Form.Item>
              </Col>
            </>
          ) : null}
          <Col span={20}>
            <Form.Item name="starts_at" label="生效时间">
              <DatePicker showTime className="w-full" disabled={placard?.status === "revoked"} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="expires_at" label="过期时间">
              <DatePicker showTime className="w-full" disabled={placard?.status === "revoked"} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PlacardEditModal;
