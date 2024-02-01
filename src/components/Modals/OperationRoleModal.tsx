import { createRole, updateRole } from "@/api/microservice/role";
import { Col, Form, Input, Modal, Row, message } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const RoleEditModal: FC<any> = ({ role, onCancel, onOk }: any) => {
  const [form] = Form.useForm();

  const onFinish = async data => {
    const result: any = role?.id ? await updateRole({ ...role, ...data }) : await createRole({ ...role, ...data });
    if (result.data.code !== 200) return message.info("操作失败");
    message.info("操作成功");
    onOk();
  };

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  useEffect(() => {
    if (role?.id) form.setFieldsValue({ ...role });
  }, [role, form]);

  return (
    <Modal open title={`${role?.id ? "编辑" : "新增"}角色 `} onOk={() => form.submit()} onCancel={onCancel} width={800}>
      <Form form={form} onFinish={onFinish} initialValues={{ ...role }} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="id" label="角色ID" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
              <Input placeholder="最好使用字母路径" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="序号" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="remake" label="备注" rules={[{ required: false }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RoleEditModal;
