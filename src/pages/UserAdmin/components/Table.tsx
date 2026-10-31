import { MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space, Table, Tag } from "antd";
import dayjs from "dayjs";

function formatTime(value?: string | null) {
  if (!value) return "—";
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

const UserTable = ({
  dataSource,
  loading,
  selfId,
  canUnlock,
  canForcePassword,
  canSelect,
  selectedKeys = [],
  onSelectChange,
  setUser,
  showDeleteConfirm,
  onReset,
  onUnlock,
  onForcePassword,
  pagination
}) => {
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
      title: "最近登录",
      dataIndex: "last_login_at",
      width: 150,
      render: (value: string, row: any) => (
        <span title={row.last_login_ip || ""}>
          {formatTime(value)}
          {row.last_login_ip ? <div className="text-xs text-black/45">{row.last_login_ip}</div> : null}
        </span>
      )
    },
    {
      title: "状态",
      dataIndex: "banned",
      width: 110,
      render: (item: any, row: any) => (
        <Space direction="vertical" size={0}>
          <Tag color={item ? "#f50" : "#2db7f5"}>
            <span>{item ? "禁用" : "启用"}</span>
          </Tag>
          {row.locked_until ? <Tag color="orange">锁定至 {formatTime(row.locked_until)}</Tag> : null}
        </Space>
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
          canForcePassword && !isSelf ? { key: "force", label: "强制下次改密", onClick: () => onForcePassword?.(item) } : null,
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
  return (
    <Table
      dataSource={dataSource}
      loading={loading}
      columns={columns}
      rowKey={row => String(row.uid || row.id)}
      pagination={pagination}
      scroll={{ x: 1100 }}
      locale={{ emptyText: loading ? "加载中…" : "暂无用户" }}
      rowSelection={
        canSelect
          ? {
              selectedRowKeys: selectedKeys,
              onChange: keys => onSelectChange?.(keys.map(String))
            }
          : undefined
      }
    />
  );
};

export default UserTable;
