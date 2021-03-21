import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message } from 'antd';
import { addrole, updaterole } from 'api/nest-admin/Rbac';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const { TextArea } = Input;
const RoleEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initRoleItem } = props;
  const [form] = Form.useForm();
  const [title, setTitle] = useState('添加');

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    var result: any = null;
    const payload = {
      ...initRoleItem,
      ...data
    };
    if (isEdit) {
      result = await updaterole(payload);
    } else {
      result = await addrole(payload);
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

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  useEffect(() => {
    if (isEdit) {
      setTitle('编辑');
      form.setFieldsValue({
        ...initRoleItem
      });
    } else {
      setTitle('添加');
    }
  }, [initRoleItem, isEdit, visible, form]);

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={creatRoleSubmit}
      onCancel={CancelSubmit}
      width={800}
      getContainer={false}
      forceRender
    >
      <Form form={form} onFinish={handleSubmit} initialValues={initRoleItem} {...layout} autoComplete="off">
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
            <Form.Item name="roleCode" label="角色编码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="序号" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="remarks" label="备注" rules={[{ required: false }]}>
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default RoleEditModal;
