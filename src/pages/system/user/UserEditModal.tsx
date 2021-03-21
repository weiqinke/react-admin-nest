import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message } from 'antd';
import { addOneUser, editOneUser } from 'api/nest-admin/User';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const UserEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initUser } = props;
  const [form] = Form.useForm();
  const [type, setType] = useState('text');
  const [title, setTitle] = useState('添加');

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.getFieldsValue();
    var result: any = null;
    if (isEdit) {
      const { nick, title, phone, email } = data;
      const payload = {
        ...initUser,
        nick,
        title,
        phone,
        email
      };
      result = await editOneUser(payload);
    } else {
      result = await addOneUser(data);
    }
    if (result.data.code !== 200) {
      message.info('操作失败');
      return;
    }
    message.info('操作成功');
    pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(true);
  };

  const setInputType = () => {
    setType('password');
  };

  useEffect(() => {
    if (isEdit) {
      setTitle('编辑');
    } else {
      setTitle('添加');
    }
    if (visible) {
      form.resetFields();
    }
  }, [initUser, isEdit, visible, form]);

  return (
    <Modal title={title} visible={visible} onOk={creatRoleSubmit} onCancel={CancelSubmit} width={800}>
      <Form form={form} onFinish={handleSubmit} initialValues={initUser} {...layout}>
        <Row>
          <Col span={20}>
            <Form.Item name="id" label="用户编号" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="name" label="账号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="password" label="账号" rules={[{ required: true }]}>
              <Input type={type} placeholder="请输入密码" onChange={setInputType} />
            </Form.Item>
          </Col>

          <Col span={20}>
            <Form.Item name="nick" label="昵称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="email" label="电子邮箱" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="group" label="联系地址" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="title" label="职称" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default UserEditModal;
