import { createLabel, updateLabel } from "@/api/label";
import { Col, Form, Input, InputNumber, Modal, Row, Select, message } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const OperationLabelModal: FC<any> = ({ label, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const editing = Boolean(label?.id);

  const onFinish = async (data: any) => {
    const payload = {
      name: data.name,
      code: data.code || "",
      color: data.color || "",
      description: data.description || "",
      sort: Number(data.sort || 0),
      status: data.status || "enabled"
    };
    const result = editing ? await updateLabel(label.id, payload) : await createLabel(payload);
    if (result.data.code !== 0) {
      message.error(result.data.message || "操作失败");
      return;
    }
    message.success("操作成功");
    onOk();
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      id: label?.id,
      name: label?.name,
      code: label?.code,
      color: label?.color,
      description: label?.description,
      sort: label?.sort ?? 0,
      status: label?.status || "enabled"
    });
  }, [form, label]);

  return (
    <Modal open forceRender title={`${editing ? "编辑" : "添加"}标签`} onOk={() => form.submit()} onCancel={onCancel} width={720} getContainer={false}>
      <Form form={form} onFinish={onFinish} {...layout} autoComplete="off">
        <Row>
          {editing && (
            <Col span={20}>
              <Form.Item name="id" label="标签ID">
                <Input readOnly />
              </Form.Item>
            </Col>
          )}
          <Col span={20}>
            <Form.Item name="name" label="标签名称" rules={[{ required: true, message: "请输入标签名称" }]}>
              <Input placeholder="请输入标签名称" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="code" label="标识 code">
              <Input placeholder="可选，稳定标识" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name="color"
              label="颜色"
              rules={[
                {
                  pattern: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
                  message: "请输入 #RGB 或 #RRGGBB"
                }
              ]}>
              <Input placeholder="#1677ff" maxLength={7} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="排序">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="标签描述">
              <Input.TextArea rows={3} maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="status" label="状态" initialValue="enabled">
              <Select
                options={[
                  { value: "enabled", label: "启用" },
                  { value: "disabled", label: "停用" }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default OperationLabelModal;
