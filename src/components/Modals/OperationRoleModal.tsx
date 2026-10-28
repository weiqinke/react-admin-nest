import { createRole, findRoles, updateRole } from "@/api/microservice/role";
import { Col, Form, Input, Modal, Row, Select, message } from "antd";
import { FC, useEffect, useState } from "react";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const RoleEditModal: FC<any> = ({ role, onCancel, onOk }: any) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const isEdit = Boolean(role?.code);

  useEffect(() => {
    findRoles()
      .then(res => {
        const list = (res.data?.data || [])
          .map((item: any) => ({
            label: item.name ? `${item.name} (${item.code})` : String(item.code),
            value: String(item.code)
          }))
          .filter((item: any) => item.value && item.value !== role?.code);
        setRoleOptions(list);
      })
      .catch(() => setRoleOptions([]));
  }, [role?.code]);

  useEffect(() => {
    form.resetFields();
    if (role?.code || role?.name) {
      form.setFieldsValue({
        code: role.code,
        name: role.name,
        inherits: role.inherits || []
      });
    }
  }, [role, form]);

  const onFinish = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        code: data.code,
        name: data.name,
        inherits: data.inherits || []
      };
      const result: any = isEdit ? await updateRole(payload) : await createRole(payload);
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
    <Modal
      open
      title={`${isEdit ? "编辑" : "新增"}角色`}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={saving}
      width={640}
      destroyOnHidden>
      <Form form={form} onFinish={onFinish} {...layout} autoComplete="off">
        <Row>
          <Col span={24}>
            <Form.Item name="code" label="角色编码" rules={[{ required: true, message: "请输入角色编码" }]}>
              <Input placeholder="例如 cashier" disabled={isEdit} autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="name" label="角色名称" rules={[{ required: true, message: "请输入角色名称" }]}>
              <Input placeholder="显示名称" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="inherits" label="继承角色" extra="可选。子角色会继承父角色权限（以后端为准）。">
              <Select mode="multiple" allowClear options={roleOptions} placeholder="选择要继承的角色" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RoleEditModal;
