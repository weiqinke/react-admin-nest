import { getPermissions } from "@/api/goadmin";
import { findMenuPermissions, saveMenuPermissions } from "@/api/microservice/menu";
import { AdminMenuNode } from "@/types/menu";
import { Alert, Button, Checkbox, Drawer, Space, Spin, Typography, message } from "antd";
import { FC, useEffect, useState } from "react";

type Props = {
  open: boolean;
  node: AdminMenuNode | null;
  onClose: () => void;
  onSuccess: () => void;
};

type PermOption = { code: string; name: string };

const MenuAuthDrawer: FC<Props> = ({ open, node, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<PermOption[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !node?.id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getPermissions(), findMenuPermissions(node.id)])
      .then(([permRes, boundRes]) => {
        if (cancelled) return;
        const list = permRes.data?.data?.list || [];
        setOptions(
          list.map((item: any) => ({
            code: String(item.code),
            name: item.name ? `${item.name} (${item.code})` : String(item.code)
          }))
        );
        if (boundRes.data?.code !== 0) {
          message.error(boundRes.data?.message || "加载菜单权限失败");
          setChecked([]);
          return;
        }
        setChecked((boundRes.data?.data?.permission_codes || []).map((code: string) => String(code)));
      })
      .catch((err: any) => {
        if (!cancelled) message.error(err?.message || "加载菜单权限失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, node?.id]);

  const onSubmit = async () => {
    if (!node?.id) return;
    setSaving(true);
    try {
      const result = await saveMenuPermissions(node.id, checked);
      if (result.data?.code !== 0) {
        message.error(result.data?.message || "保存失败");
        return;
      }
      message.success(checked.length ? "已设为受控菜单" : "已设为公开菜单");
      onSuccess();
    } catch (err: any) {
      message.error(err?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      width={480}
      title={node ? `授权：${node.title}` : "授权"}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={onSubmit}>
            保存
          </Button>
        </Space>
      }>
      {node ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          菜单 ID：{node.id}
          <br />
          空权限码 = 公开菜单（所有登录用户可见）；非空 = 受控，用户须具备对应权限。
        </Typography.Paragraph>
      ) : null}
      <Alert
        type={checked.length ? "info" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
        message={checked.length ? `已选 ${checked.length} 个权限码（受控）` : "当前为公开菜单（未绑定权限）"}
      />
      <Spin spinning={loading}>
        <Checkbox.Group
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
          value={checked}
          onChange={values => setChecked(values.map(String))}
          options={options.map(item => ({ label: item.name, value: item.code }))}
        />
        {!loading && !options.length ? <Typography.Text type="secondary">暂无可用权限码，请先在权限管理中创建。</Typography.Text> : null}
      </Spin>
    </Drawer>
  );
};

export default MenuAuthDrawer;
