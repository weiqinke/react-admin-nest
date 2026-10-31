import { Button, Table, Tag } from "antd";

const UserTable = ({ dataSource, selfId, canUnlock, setUser, showDeleteConfirm, onReset, onUnlock, pagination }) => {
  const columns: any = [
    {
      title: "账号",
      dataIndex: "username",
      width: 140,
      ellipsis: true
    },
    {
      title: "昵称",
      dataIndex: ["profile", "nick"],
      width: 120,
      ellipsis: true
    },
    {
      title: "邮箱",
      dataIndex: "email",
      width: 180,
      ellipsis: true,
      responsive: ["xxl", "xl", "lg"]
    },
    {
      title: "电话",
      dataIndex: "mobile",
      width: 130,
      responsive: ["xxl", "xl", "lg"]
    },
    {
      title: "部门",
      dataIndex: ["profile", "department"],
      width: 140,
      ellipsis: true,
      render: (text: string) => text || "未归属"
    },
    {
      title: "岗位",
      dataIndex: ["profile", "job_title"],
      width: 120,
      ellipsis: true,
      render: (text: string) => text || "未任职"
    },
    {
      title: "状态",
      dataIndex: "banned",
      width: 90,
      responsive: ["xxl", "xl", "lg", "md"],
      render: (item: any) => (
        <Tag color={item ? "#f50" : "#2db7f5"}>
          <span>{item ? "禁用" : "启用"}</span>
        </Tag>
      )
    },
    {
      title: "操作",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (item: any) => {
        const isSelf = String(item.uid || item.id || "") === String(selfId || "");
        return (
          <div className="admin-table-actions">
            <Button size="small" type="primary" onClick={() => setUser(item)}>
              编辑
            </Button>
            <Button size="small" onClick={() => onReset(item)}>
              重置密码
            </Button>
            {canUnlock ? (
              <Button size="small" onClick={() => onUnlock(item)}>
                解除锁定
              </Button>
            ) : null}
            {isSelf && !item.banned ? null : (
              <Button size="small" type="primary" onClick={() => showDeleteConfirm(item)} danger={!item.banned}>
                {item.banned ? "启用" : "停用"}
              </Button>
            )}
          </div>
        );
      }
    }
  ];
  return <Table dataSource={dataSource} columns={columns} rowKey="uid" pagination={pagination} scroll={{ x: 1100 }} />;
};

export default UserTable;
