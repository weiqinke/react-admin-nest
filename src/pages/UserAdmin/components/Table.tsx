import { Button, Table, Tag } from "antd";

const UserTable = ({ dataSource, setUser, showDeleteConfirm }) => {
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
        return (
          <div>
            <Button size="small" type="primary" onClick={() => setUser(item)} style={{ marginRight: "10px" }}>
              编辑
            </Button>
            <Button size="small" type="primary" onClick={() => showDeleteConfirm(item)} danger={!item.banned}>
              {item.banned ? "启用" : "禁用"}
            </Button>
          </div>
        );
      }
    }
  ];
  return <Table dataSource={dataSource} columns={columns} rowKey="uid" />;
};

export default UserTable;
