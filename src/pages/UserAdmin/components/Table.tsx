import { Button, Table, Tag } from "antd";

const UserTable = ({ dataSource, selfId, setUser, showDeleteConfirm, onReset, pagination }) => {
  const columns: any = [
    {
      title: "账号",
      dataIndex: "username"
    },
    {
      title: "昵称",
      dataIndex: ["profile", "nick"]
    },
    {
      title: "邮箱",
      dataIndex: "email",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "电话",
      dataIndex: "mobile",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "部门",
      dataIndex: ["profile", "department"],
      render: (text: string) => text || "未归属"
    },
    {
      title: "岗位",
      dataIndex: ["profile", "job_title"],
      render: (text: string) => text || "未任职"
    },
    {
      title: "状态",
      dataIndex: "banned",
      responsive: ["xxl", "xl", "lg", "md"],
      render: (item: any) => (
        <Tag color={item ? "#f50" : "#2db7f5"}>
          <span>{item ? "禁用" : "启用"}</span>
        </Tag>
      )
    },
    {
      title: "操作",
      render: (item: any) => {
        const isSelf = String(item.uid || item.id || "") === String(selfId || "");
        return (
          <div>
            <Button size="small" type="primary" onClick={() => setUser(item)} style={{ marginRight: "10px" }}>
              编辑
            </Button>
            <Button size="small" style={{ marginRight: "10px" }} onClick={() => onReset(item)}>
              重置密码
            </Button>
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
  return <Table dataSource={dataSource} columns={columns} rowKey="uid" pagination={pagination} />;
};

export default UserTable;
