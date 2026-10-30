import { findPermissionOptions, findRolePermissions, saveRolePermissions } from "@/api/role";
import { Alert, Checkbox, Modal, Spin, Typography, message } from "antd";
import { FC, useEffect, useState } from "react";

type Props = {
  open?: boolean;
  roleCode: string;
  title?: string;
  okText?: string;
  cancelText?: string;
  onOk: () => void;
  onCancel: () => void;
};

const RoleAllocationPermModal: FC<Props> = ({ roleCode, title, okText, cancelText, onOk, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<{ code: string; name: string }[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!roleCode) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([findPermissionOptions(), findRolePermissions({ code: roleCode })])
      .then(([optRes, boundRes]) => {
        if (cancelled) return;
        setOptions(optRes.data?.data || []);
        if (boundRes.data?.code !== 0) {
          message.error(boundRes.data?.message || "加载角色权限失败");
          setChecked([]);
          return;
        }
        setChecked((boundRes.data?.data?.permission_codes || []).map(String));
      })
      .catch((err: any) => {
        if (!cancelled) message.error(err?.message || "加载角色权限失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleCode]);

  const onSubmit = async () => {
    setSaving(true);
    try {
      const result: any = await saveRolePermissions({ code: roleCode, permission_codes: checked });
      if (result.data?.code !== 0) {
        message.error(result.data?.message || "保存失败");
        return;
      }
      message.success(checked.length ? "权限已更新" : "已清空该角色直接权限");
      onOk();
    } catch (err: any) {
      message.error(err?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={title || `分配权限：${roleCode}`}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={okText || "确认"}
      cancelText={cancelText || "取消"}
      confirmLoading={saving}
      width={720}
      destroyOnHidden>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        角色只绑定权限码，不直接挂菜单。用户能否看到某条受控菜单，取决于其角色权限是否覆盖该菜单要求的权限码。
      </Typography.Paragraph>
      <Alert
        type={checked.length ? "info" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
        message={checked.length ? `已选 ${checked.length} 个权限码` : "当前未绑定权限码"}
      />
      <Spin spinning={loading}>
        <Checkbox.Group
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflow: "auto" }}
          value={checked}
          onChange={values => setChecked(values.map(String))}
          options={options.map(item => ({ label: item.name, value: item.code }))}
        />
        {!loading && !options.length ? <Typography.Text type="secondary">暂无可用权限码。</Typography.Text> : null}
      </Spin>
    </Modal>
  );
};

export default RoleAllocationPermModal;
