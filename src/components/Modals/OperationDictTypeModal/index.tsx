import { createDictType, updateDictType } from "@/api/dict";
import { Col, Form, Input, InputNumber, Modal, Row, Select, message } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const OperationDictTypeModal: FC<any> = ({ dictType, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const editing = Boolean(dictType?.id);

  const onFinish = async (data: any) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || "",
      sort: Number(data.sort || 0),
      status: data.status || "enabled"
    };
    const result = editing ? await updateDictType(dictType.id, payload) : await createDictType(payload);
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
      id: dictType?.id,
      code: dictType?.code,
      name: dictType?.name,
      description: dictType?.description,
      sort: dictType?.sort ?? 0,
      status: dictType?.status || "enabled"
    });
  }, [form, dictType]);

  return (
    <Modal
      open
      forceRender
      title={`${editing ? "编辑" : "添加"}字典类型`}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={720}
      getContainer={false}
    >
      <Form form={form} onFinish={onFinish} {...layout} autoComplete="off">
        <Row>
          {editing && (
            <Col span={20}>
              <Form.Item name="id" label="类型 ID">
                <Input readOnly />
              </Form.Item>
            </Col>
          )}
          <Col span={20}>
            <Form.Item
              name="code"
              label="编码 code"
              rules={[
                { required: true, message: "请输入编码" },
                { pattern: /^[a-z][a-z0-9_]{1,63}$/, message: "须为 snake_case，如 gender" }
              ]}
            >
              <Input placeholder="如 gender、order_status" maxLength={64} disabled={editing} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
              <Input placeholder="如 性别" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="排序">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="描述">
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

export default OperationDictTypeModal;
