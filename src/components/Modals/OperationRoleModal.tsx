import { flattenDepts, listDepts, DATA_SCOPE_OPTIONS, toDeptTree } from "@/api/platform";
import { createRole, findRoles, getRoleScopeDepts, setRoleScopeDepts, updateRole } from "@/api/role";
import { Col, Form, Input, Modal, Row, Select, TreeSelect, message } from "antd";
import { FC, useEffect, useState } from "react";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const RoleEditModal: FC<any> = ({ role, onCancel, onOk }: any) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const isEdit = Boolean(role?.code);
  const dataScope = Form.useWatch("data_scope", form);

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
    listDepts()
      .then(res => setDepts(res.data?.data?.list || []))
      .catch(() => setDepts([]));
  }, []);

  useEffect(() => {
    form.resetFields();
    if (role?.code || role?.name) {
      form.setFieldsValue({
        code: role.code,
        name: role.name,
        inherits: role.inherits || [],
        data_scope: role.data_scope || "self",
        department_ids: []
      });
      if (role.code && role.data_scope === "custom") {
        getRoleScopeDepts(role.code)
          .then(res => {
            const ids = (res.data?.data?.department_ids || []).map(String);
            form.setFieldsValue({ department_ids: ids });
          })
          .catch(() => undefined);
      }
    }
  }, [role, form]);

  const onFinish = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        code: data.code,
        name: data.name,
        inherits: data.inherits || [],
        data_scope: data.data_scope || "self"
      };
      const result: any = isEdit ? await updateRole(payload) : await createRole(payload);
      if (result.data?.code !== 0) {
        message.error(result.data?.message || "操作失败");
        return;
      }
      if (payload.data_scope === "custom") {
        await setRoleScopeDepts(payload.code, (data.department_ids || []).map(String));
      } else if (isEdit) {
        await setRoleScopeDepts(payload.code, []);
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
    <Modal open title={`${isEdit ? "编辑" : "新增"}角色`} onOk={() => form.submit()} onCancel={onCancel} confirmLoading={saving} width={640} destroyOnHidden>
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
          <Col span={24}>
            <Form.Item name="data_scope" label="数据范围" initialValue="self" extra="多个角色同时激活时，取最宽的一个。">
              <Select options={DATA_SCOPE_OPTIONS} />
            </Form.Item>
          </Col>
          {dataScope === "custom" ? (
            <Col span={24}>
              <Form.Item
                name="department_ids"
                label="指定部门"
                rules={[{ required: true, message: "请选择至少一个部门" }]}
                extra={flattenDepts(depts).length ? "仅这些部门及数据可见。" : "无部门数据时可先维护部门。"}>
                <TreeSelect
                  treeCheckable
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  allowClear
                  treeDefaultExpandAll
                  placeholder="选择部门"
                  treeData={toDeptTree(depts, { disableOff: true })}
                />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
};

export default RoleEditModal;
