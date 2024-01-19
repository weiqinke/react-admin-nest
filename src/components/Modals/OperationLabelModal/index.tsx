import React, { useEffect, FC } from "react";
import { Form, Row, Col, Input, Modal, message, Select } from "antd";
import { addnewlabelbyuser, putlabelbyuser } from "@/api/caravan/Labels";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const OperationLabelModal: FC<any> = ({ label, onCancel, onOk }) => {
  const [form] = Form.useForm();

  const onFinish = async data => {
    const payload = { ...label, ...data };
    const result = label?.id ? await putlabelbyuser(payload) : await addnewlabelbyuser(payload);
    if (result.data.code !== 200) return message.info("操作失败");
    message.info("操作成功");
    onOk();
  };

  const hiddMenuChange = (dontshow: string) => form.setFieldsValue({ dontshow });

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  return (
    <Modal visible forceRender title={`${label?.id ? "编辑" : "添加"}标签`} onOk={() => form.submit()} onCancel={onCancel} width={800} getContainer={false}>
      <Form form={form} onFinish={onFinish} initialValues={{ ...label }} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="id" label="标签ID" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="title" label="标签名称" rules={[{ required: true }]}>
              <Input placeholder="请输入标签名称" autoComplete="off" />
            </Form.Item>
          </Col>

          <Col span={20}>
            <Form.Item name="sort" label="序号" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="标签描述" rules={[{ required: false }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="visible" label="是否显示" rules={[{ required: false }]} initialValue="1">
              <Select placeholder="请选择是否在菜单中显示" onChange={hiddMenuChange}>
                <Select.Option value="1">显示</Select.Option>
                <Select.Option value="0">隐藏</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default OperationLabelModal;
