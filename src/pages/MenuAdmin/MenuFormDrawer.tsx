import { createMenuItem, updateMenuItem } from "@/api/microservice/menu";
import { AdminMenuNode } from "@/types/menu";
import { Button, Drawer, Form, Input, InputNumber, Space, Switch, message } from "antd";
import { FC, useEffect, useState } from "react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  parentId: string | null;
  node?: AdminMenuNode | null;
  onClose: () => void;
  onSuccess: () => void;
};

const MenuFormDrawer: FC<Props> = ({ open, mode, parentId, node, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && node) {
      form.setFieldsValue({
        title: node.title,
        segment: node.segment,
        icon: node.icon || "",
        remark: node.remark || "",
        sort: node.sort ?? 0,
        is_hot: Number(node.is_hot) === 1,
        has_update: Number(node.has_update) === 1,
        visible_in_menu: Number(node.visible_in_menu) !== 0
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      sort: 10,
      is_hot: false,
      has_update: false,
      visible_in_menu: true
    });
  }, [open, isEdit, node, form]);

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const shared = {
        title: values.title,
        icon: values.icon || "",
        remark: values.remark || "",
        sort: Number(values.sort ?? 0),
        is_hot: values.is_hot ? 1 : 0,
        has_update: values.has_update ? 1 : 0,
        visible_in_menu: values.visible_in_menu ? 1 : 0
      };
      const result =
        isEdit && node?.id
          ? await updateMenuItem(node.id, shared)
          : await createMenuItem({ ...shared, segment: values.segment, parent_id: parentId });
      if (result.data?.code !== 0) {
        message.error(result.data?.message || "操作失败");
        return;
      }
      message.success("操作成功");
      onSuccess();
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      width={480}
      title={isEdit ? "编辑菜单" : parentId ? "添加子菜单" : "添加根菜单"}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={submitting} onClick={onSubmit}>
            保存
          </Button>
        </Space>
      }>
      {isEdit && node ? (
        <div style={{ marginBottom: 16, color: "rgba(0,0,0,0.45)", fontSize: 12, lineHeight: 1.7 }}>
          <div>ID：{node.id}</div>
          <div>路径：{node.full_path}</div>
          <div>
            层级 weight：{node.weight}　链 chain_id：{node.chain_id}
          </div>
          <div>
            状态：{Number(node.status) === 1 ? "启用" : "禁用"}　{node.is_public ? "公开" : "受控"}
          </div>
        </div>
      ) : null}
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item name="title" label="菜单名称" rules={[{ required: true, message: "请输入名称" }]}>
          <Input placeholder="显示名称，允许重复" />
        </Form.Item>
        <Form.Item
          name="segment"
          label="路由段 segment"
          rules={[
            { required: true, message: "请输入路由段" },
            {
              validator: async (_, value) => {
                const v = String(value || "").trim();
                if (!v) return;
                if (v.includes("/") || v.includes("\\")) {
                  throw new Error("只填本级段名，例如 permissionadmin，不要写 /management/permissionadmin");
                }
                if (!/^[A-Za-z0-9_-]+$/.test(v)) {
                  throw new Error("segment 仅允许字母、数字、下划线和中划线");
                }
              }
            }
          ]}
          extra={
            parentId
              ? "只填本级段名（如 permissionadmin）。完整路径由父级自动拼接为 /management/permissionadmin。"
              : "根菜单只填首段（如 workplace），不要带前导 /。"
          }>
          <Input placeholder="例如 permissionadmin" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="icon" label="图标">
          <Input placeholder="图标名或留空" />
        </Form.Item>
        <Form.Item name="sort" label="同级排序">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="visible_in_menu" label="侧栏显示" valuePropName="checked">
          <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
        </Form.Item>
        <Form.Item name="is_hot" label="热点" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="has_update" label="有更新标记" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MenuFormDrawer;
