import { updateRoleUsers } from "@/api/microservice/role";
import { message, Modal, Table } from "antd";
import React, { FC, useMemo, useState } from "react";

const RoleAllocationUserModal: FC<any> = ({ dataSource, onOk, onCancel, initUIDs, id, okText, cancelText, title }: any) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([...(initUIDs || []).map(String)]);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      (dataSource || []).map((item: any) => ({
        ...item,
        id: String(item.id || item.uid)
      })),
    [dataSource]
  );

  const rowSelection: any = {
    type: "checkbox",
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys.map(String))
  };

  const onSubmit = async () => {
    setSaving(true);
    try {
      const res: any = await updateRoleUsers({ id, uids: selectedRowKeys.map(String) });
      if (res.data?.code !== 0) {
        message.error(res.data?.message || "操作失败");
        return;
      }
      const { assigned = 0, revoked = 0, failures = [], conflictCount = 0 } = res.data?.data || {};
      if (failures.length) {
        const conflictHint = conflictCount
          ? `其中 ${conflictCount} 人因角色互斥（40902）未能授予。`
          : "";
        message.warning(`完成：授予 ${assigned}、撤销 ${revoked}；失败 ${failures.length}。${conflictHint}`);
      } else {
        message.success(`操作成功（授予 ${assigned}、撤销 ${revoked}）`);
      }
      onOk();
    } catch (err: any) {
      message.error(err?.message || "操作失败");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "账号",
      dataIndex: "username"
    },
    {
      title: "电话",
      dataIndex: "mobile"
    },
    {
      title: "email",
      dataIndex: "email"
    }
  ];

  return (
    <Modal
      open
      title={title || "分配人员"}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={okText || "确认"}
      cancelText={cancelText || "取消"}
      confirmLoading={saving}
      width={800}
      destroyOnHidden>
      <Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={rows} pagination={{ pageSize: 8 }} />
    </Modal>
  );
};

export default RoleAllocationUserModal;
