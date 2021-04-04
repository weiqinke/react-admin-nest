import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message, Select } from 'antd';
import { addMenuItem, editMenuItem } from 'api/nest-admin/MenuApi';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const { Option } = Select;
const { TextArea } = Input;
const MenuEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initMenuItem, parentUid } = props;
  const [form] = Form.useForm();
  const [title, setTitle] = useState('添加');

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    var result: any = null;
    const payload = {
      parentUid,
      ...data
    };
    if (isEdit) {
      result = await editMenuItem(payload);
    } else {
      result = await addMenuItem(payload);
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
  const hiddMenuChange = (value: string) => {
    form.setFieldsValue({ hiddMenu: value });
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
      onOk={creatRoleSubmit}
      onCancel={CancelSubmit}
      width={800}
      getContainer={false}
      forceRender
    >
      <Form form={form} onFinish={handleSubmit} initialValues={initMenuItem} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="menuUid" label="菜单ID" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="name" label="菜单名称" rules={[{ required: true }]}>
              <Input placeholder="最好使用字母路径" autoComplete="off" />
            </Form.Item>
          </Col>

          <Col span={20}>
            <Form.Item name="url" label="菜单路径" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="序号" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="menu">
              <Select placeholder="请选择类型" onChange={onGenderChange}>
                <Option value="menu">菜单</Option>
                <Option value="page">页面</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="hiddMenu" label="是否显示" rules={[{ required: true }]} initialValue="1">
              <Select placeholder="请选择是否在菜单中显示" onChange={hiddMenuChange}>
                <Option value="1">显示</Option>
                <Option value="0">隐藏</Option>
              </Select>
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
export default MenuEditModal;
