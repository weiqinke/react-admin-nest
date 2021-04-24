import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message, Select } from 'antd';
import { editMenuItem } from 'api/nest-admin/MenuApi';
import { addPlacard } from 'api/nest-admin/placard';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const { Option } = Select;
const { TextArea } = Input;
const PlacardEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initMenuItem, parentUid } = props;
  const [form] = Form.useForm();
  const [title, setTitle] = useState('添加');

  const handleSubmit = () => {};
  const submitForm = async () => {
    const data = await form.validateFields();
    var result: any = null;
    const payload = {
      parentUid,
      ...data
    };
    if (isEdit) {
      result = await editMenuItem(payload);
    } else {
      result = await addPlacard(payload);
    }
    if (result.data.code !== 200) {
      message.info('操作失败');
      return;
    }
    message.info('操作成功');
    pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };

  const onGenderChange = (value: string) => {
    form.setFieldsValue({ type: value });
  };

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  useEffect(() => {
    if (isEdit) {
      setTitle('编辑');
      form.setFieldsValue({
        ...initMenuItem
      });
    } else {
      setTitle('添加');
    }
  }, [initMenuItem, isEdit, visible, form]);

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={submitForm}
      onCancel={CancelSubmit}
      width={800}
      getContainer={false}
      forceRender
    >
      <Form form={form} onFinish={handleSubmit} initialValues={initMenuItem} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="placardId" label="公告ID" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="title" label="公告名称" rules={[{ required: true }]}>
              <Input placeholder="公告名称" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="system">
              <Select placeholder="请选择类型" onChange={onGenderChange}>
                <Option value="system">公告</Option>
                <Option value="notification">通知</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="详情" rules={[{ required: false }]}>
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default PlacardEditModal;
