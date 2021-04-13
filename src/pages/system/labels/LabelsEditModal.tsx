import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message, Select } from 'antd';
import { addnewlabelbyuser, putlabelbyuser } from 'api/nest-admin/Labels';
const { Option } = Select;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const { TextArea } = Input;
const LabelsEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initLabelItem } = props;
  const [form] = Form.useForm();
  const [title, setTitle] = useState('添加');

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    var result: any = null;
    const payload = {
      ...initLabelItem,
      ...data
    };
    if (isEdit) {
      result = await putlabelbyuser(payload);
    } else {
      result = await addnewlabelbyuser(payload);
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
  const hiddMenuChange = (value: string) => {
    form.setFieldsValue({ dontshow: value });
  };

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  useEffect(() => {
    if (isEdit) {
      setTitle('编辑');
      form.setFieldsValue({
        ...initLabelItem
      });
    } else {
      setTitle('添加');
    }
  }, [initLabelItem, isEdit, visible, form]);

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
      <Form form={form} onFinish={handleSubmit} initialValues={initLabelItem} {...layout} autoComplete="off">
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
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="visible" label="是否显示" rules={[{ required: false }]} initialValue="1">
              <Select placeholder="请选择是否在菜单中显示" onChange={hiddMenuChange}>
                <Option value="1">显示</Option>
                <Option value="0">隐藏</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default LabelsEditModal;
