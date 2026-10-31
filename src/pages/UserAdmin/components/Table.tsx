import { MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space, Table, Tag } from "antd";

const UserTable = ({ dataSource, selfId, canUnlock, setUser, showDeleteConfirm, onReset, onUnlock, pagination }) => {
  const columns: any = [
    {
      title: "账号",
      dataIndex: "username",
      ellipsis: true
    },
    {
      title: "昵称",
      dataIndex: ["profile", "nick"],
      ellipsis: true
    },
    {
      title: "邮箱",
      dataIndex: "email",
      ellipsis: true
    },
    {
      title: "电话",
      dataIndex: "mobile",
      width: 128
    },
    {
      title: "部门",
      dataIndex: ["profile", "department"],
      ellipsis: true,
      render: (text: string) => text || "未归属"
    },
    {
      title: "岗位",
      dataIndex: ["profile", "job_title"],
      ellipsis: true,
      render: (text: string) => text || "未任职"
    },
    {
      title: "状态",
      dataIndex: "banned",
      width: 80,
      render: (item: any) => (
        <Tag color={item ? "#f50" : "#2db7f5"}>
          <span>{item ? "禁用" : "启用"}</span>
        </Tag>
      )
    },
    {
      title: "操作",
      key: "actions",
      width: 168,
      render: (item: any) => {
        const isSelf = String(item.uid || item.id || "") === String(selfId || "");
        const moreItems = [
          { key: "reset", label: "重置密码", onClick: () => onReset(item) },
          canUnlock ? { key: "unlock", label: "解除锁定", onClick: () => onUnlock(item) } : null,
          isSelf && !item.banned
            ? null
            : {
                key: "status",
                label: item.banned ? "启用" : "停用",
                danger: !item.banned,
                onClick: () => showDeleteConfirm(item)
              }
        ].filter(Boolean) as { key: string; label: string; danger?: boolean; onClick: () => void }[];

        return (
          <Space size={8}>
            <Button size="small" type="primary" onClick={() => setUser(item)}>
              编辑
            </Button>
            {moreItems.length ? (
              <Dropdown menu={{ items: moreItems }}>
                <Button size="small" icon={<MoreOutlined />} />
              </Dropdown>
            ) : null}
          </Space>
        );
      }
    }
  ];
  return <Table dataSource={dataSource} columns={columns} rowKey="uid" pagination={pagination} />;
};

export default UserTable;
