import { createDictItem, updateDictItem } from "@/api/dict";
import { Col, Form, Input, InputNumber, Modal, Row, Select, message } from "antd";
import { FC, useEffect } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const OperationDictItemModal: FC<any> = ({ typeId, item, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const editing = Boolean(item?.id);

  const onFinish = async (data: any) => {
    const payload = {
      value: data.value,
      label: data.label,
      color: data.color || "",
      sort: Number(data.sort || 0),
      status: data.status || "enabled",
      remark: data.remark || ""
    };
    const result = editing ? await updateDictItem(item.id, payload) : await createDictItem(typeId, payload);
    if (result.data.code !== 0) {
      message.error(result.data.message || "操作失败");
      return;
    }
    message.success("操作成功");
    onOk();
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      id: item?.id,
      value: item?.value,
      label: item?.label,
      color: item?.color,
      sort: item?.sort ?? 0,
      status: item?.status || "enabled",
      remark: item?.remark
    });
  }, [form, item]);

  return (
    <Modal open forceRender title={`${editing ? "编辑" : "添加"}字典项`} onOk={() => form.submit()} onCancel={onCancel} width={720} getContainer={false}>
      <Form form={form} onFinish={onFinish} {...layout} autoComplete="off">
        <Row>
          {editing && (
            <Col span={20}>
              <Form.Item name="id" label="条目 ID">
                <Input readOnly />
              </Form.Item>
            </Col>
          )}
          <Col span={20}>
            <Form.Item name="value" label="值 value" rules={[{ required: true, message: "请输入值" }]}>
              <Input placeholder="如 male、pending" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="label" label="显示名" rules={[{ required: true, message: "请输入显示名" }]}>
              <Input placeholder="如 男、待支付" maxLength={64} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name="color"
              label="颜色"
              rules={[
                {
                  pattern: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
                  message: "请输入 #RGB 或 #RRGGBB"
                }
              ]}>
              <Input placeholder="#1677ff" maxLength={7} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sort" label="排序">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="status" label="状态" initialValue="enabled">
              <Select
                options={[
                  { value: "enabled", label: "启用" },
                  { value: "disabled", label: "停用" }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default OperationDictItemModal;
