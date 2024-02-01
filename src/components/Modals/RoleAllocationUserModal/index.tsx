import { updateRoleUsers } from "@/api/microservice/role";
import { message, Modal, Table } from "antd";
import React, { FC, useState } from "react";

const RoleAllocationUserModal: FC<any> = ({ dataSource, onOk, onCancel, initUIDs, id, okText, cancelText, title }: any) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([...initUIDs]);

  const rowSelection: any = {
    type: "checkbox",
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  const onSubmit = async () => {
    updateRoleUsers({ id, uids: selectedRowKeys })
      .then(res => {
        if (res.data.code === 200) {
          onOk();
          return message.info("操作成功");
        }
      })
      .catch(() => message.error("操作失败"));
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
    <Modal open title={title || "提示"} onOk={onSubmit} onCancel={onCancel} okText={okText || "确认"} cancelText={cancelText || "取消"} width={800}>
      <Table rowKey="uid" rowSelection={rowSelection} columns={columns} dataSource={dataSource} />
    </Modal>
  );
};

export default RoleAllocationUserModal;
