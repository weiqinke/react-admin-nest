import { createPermissionItem, updatePermissionItem } from "@/api/permission";
import { Col, Form, Input, Modal, Row, message } from "antd";
import { FC, useEffect, useState } from "react";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

type Props = {
  permission: { code?: string; name?: string } | null;
  onOk: () => void;
  onCancel: () => void;
};

const PermissionEditModal: FC<Props> = ({ permission, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(permission?.code);

  useEffect(() => {
    form.resetFields();
    if (permission?.code || permission?.name) {
      form.setFieldsValue({
        code: permission.code,
        name: permission.name
      });
    }
  }, [permission, form]);

  const onFinish = async (data: { code: string; name: string }) => {
    setSaving(true);
    try {
      const result: any = isEdit
        ? await updatePermissionItem(String(permission?.code), { name: data.name })
        : await createPermissionItem({ code: data.code, name: data.name });
      if (result.data?.code !== 0) {
        message.error(result.data?.message || "操作失败");
        return;
      }
      message.success("操作成功");
      onOk();
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`${isEdit ? "编辑" : "新增"}权限`} onOk={() => form.submit()} onCancel={onCancel} confirmLoading={saving} width={640} destroyOnHidden>
      <Form form={form} onFinish={onFinish} {...layout} autoComplete="off">
        <Row>
          <Col span={24}>
            <Form.Item name="code" label="权限码" rules={[{ required: true, message: "请输入权限码" }]} extra="例如 menu:read、user:write；创建后不可修改。">
              <Input placeholder="resource:action" disabled={isEdit} autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="name" label="显示名称" rules={[{ required: true, message: "请输入名称" }]}>
              <Input placeholder="便于识别的中文或英文名" autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PermissionEditModal;
