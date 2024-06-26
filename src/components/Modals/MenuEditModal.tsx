import { createMenuItem, updateMenuItem } from "@/api/microservice/menu";
import { Col, Form, Input, Modal, Row, Select, message } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const { Option } = Select;
const { TextArea } = Input;

const MenuEditModal: FC<any> = ({ onOk, initMenuItem, parentUid, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {};

  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    let result: any = null;
    const payload = {
      parentUid,
      ...data,
      version: 1,
      delete:0,
    };
    if (payload.id) {
      result = await updateMenuItem(payload);
    } else {
      result = await createMenuItem(payload);
    }
    if (result.data.code !== 200) {
      message.info("操作失败");
      return;
    }
    message.info("操作成功");
    onOk(true);
  };

  const onGenderChange = (value: string) => {
    form.setFieldsValue({ type: value });
  };

  const hiddMenuChange = (value: string) => {
    form.setFieldsValue({ show: value });
  };

  useEffect(() => {
    form.resetFields();
    form.getFieldsValue();
  }, [form]);

  return (
    <Modal open title={initMenuItem.id ? "编辑" : "添加"} onOk={creatRoleSubmit} onCancel={onCancel} width={800} getContainer={false} forceRender>
      <Form form={form} onFinish={handleSubmit} initialValues={initMenuItem} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="version" label="菜单版本" rules={[{ required: false }]} hidden>
              <Input readOnly placeholder="自动生成" defaultValue={1} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="id" label="菜单ID" rules={[{ required: false }]} hidden>
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
              <Input type="number" max={100} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue={1}>
              <Select placeholder="请选择类型" onChange={onGenderChange}>
                <Option value={1}>菜单</Option>
                <Option value={2}>页面</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="show" label="是否显示" rules={[{ required: true }]} initialValue={1}>
              <Select placeholder="请选择是否在菜单中显示" onChange={hiddMenuChange}>
                <Option value={1}>显示</Option>
                <Option value={0}>隐藏</Option>
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
