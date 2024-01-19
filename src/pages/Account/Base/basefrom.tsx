import React, { FC, useEffect, useState } from "react";
import { Button, Col, Form, Input } from "antd";
const { TextArea } = Input;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};
const BaseFrom: FC<any> = (props: any) => {
  const [form] = Form.useForm();
  const { initFormItem, pendingCallback } = props;
  const [editFlag, setEditFlag] = useState(false);
  const onRequiredTypeChange = () => {
    setEditFlag(true);
  };
  const onFinish = async () => {
    if (!editFlag) {
      return;
    }
    setEditFlag(false);
    const result = await form.validateFields();
    pendingCallback(result);
  };
  useEffect(() => {
    form.setFieldsValue(initFormItem);
  }, [form, initFormItem]);

  return (
    <Form
      form={form}
      initialValues={initFormItem}
      onValuesChange={onRequiredTypeChange}
      onFinish={onFinish}
      {...layout}
      className="formdom"
    >
      <Col span={24} className="formitem">
        <Form.Item
          label="昵称"
          name="nick"
          rules={[{ required: true, message: "请填写昵称!" }]}
        >
          <Input placeholder="" autoComplete="off" />
        </Form.Item>
      </Col>

      <Col span={24} className="formitem">
        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ required: true, message: "请填写邮箱!" }]}
        >
          <Input placeholder="" autoComplete="off" />
        </Form.Item>
      </Col>
      <Col span={24} className="formitem">
        <Form.Item
          label="电话"
          name="phone"
          rules={[{ required: true, message: "请填写电话!" }]}
        >
          <Input placeholder="" autoComplete="off" />
        </Form.Item>
      </Col>

      <Col span={24} className="formitem">
        <Form.Item label="地区" name="address">
          <Input placeholder="" autoComplete="off" />
        </Form.Item>
      </Col>

      <Col span={24} className="formitem">
        <Form.Item label="个人签名" name="signature">
          <TextArea rows={4} />
        </Form.Item>
      </Col>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          更新基本信息
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BaseFrom;
