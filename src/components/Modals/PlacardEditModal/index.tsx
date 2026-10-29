import { createAnnouncement, updateAnnouncement, updateAnnouncementSchedule } from "@/api/announcement";
import { listDictOptions } from "@/api/dict";
import { Col, DatePicker, Form, Input, Modal, Row, Select, message } from "antd";
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
  }, []);

  const onFinish = async payload => {
    const body = {
      title: payload.title,
      content: payload.content || "",
      type: payload.level === "required" ? "system" : payload.type,
      level: payload.level,
      starts_at: toIso(payload.starts_at),
      expires_at: toIso(payload.expires_at)
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
    if (placard?.id) {
      form.setFieldsValue({
        ...placard,
        content: placard.content,
        starts_at: placard.starts_at ? dayjs(placard.starts_at) : null,
        expires_at: placard.expires_at ? dayjs(placard.expires_at) : null
      });
    }
  }, [placard, form]);

  return (
    <Modal open forceRender title={`${placard?.id ? (locked ? "生效时间" : "编辑") : "新增"}公告`} onOk={() => form.submit()} onCancel={onCancel} width={800} getContainer={false}>
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
              ]}
            >
              <Input.TextArea rows={4} disabled={locked} maxLength={2000} />
            </Form.Item>
          </Col>
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
