import React, { useEffect, FC } from "react";
import { Form, Row, Col, Input, Modal, message, Select } from "antd";
import { editMenuItem } from "@/api/caravan/MenuApi";
import { addPlacard } from "@/api/caravan/Placard";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const PlacardEditModal: FC<any> = ({ placard, onOk, onCancel }: any) => {
  const [form] = Form.useForm();

  const onGenderChange = (type: string) => form.setFieldsValue({ type });

  const onFinish = async payload => {
    const result = placard?.id ? await editMenuItem({ ...placard, ...payload }) : await addPlacard(payload);
    if (result.data.code !== 200) return message.info("操作失败");
    message.success("操作成功");
    onOk();
  };

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  useEffect(() => {
    if (placard?.id) {
      form.setFieldsValue({ ...placard });
    }
  }, [placard, form]);

  return (
    <Modal open forceRender title={`${placard?.id ? "编辑" : "新增"}公告`} onOk={() => form.submit()} onCancel={onCancel} width={800} getContainer={false}>
      <Form form={form} onFinish={onFinish} initialValues={placard} {...layout} autoComplete="off">
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
                <Select.Option value="system">公告</Select.Option>
                <Select.Option value="notification">通知</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="详情" rules={[{ required: false }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PlacardEditModal;
