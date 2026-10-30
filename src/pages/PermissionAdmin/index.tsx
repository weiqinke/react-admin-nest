import { PermissionEditModal } from "@/components/Modals";
import PageIntroduction from "@/components/PageIntroduction";
import { findPermissions, removePermissionItem } from "@/api/permission";
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Modal, Space, Table, message } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

const { confirm } = Modal;

const infos = [{ title: "系统设置" }, { title: "权限管理" }];

const PermissionAdmin: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<any>(null);

  const loadList = async () => {
    setLoading(true);
    setEditing(null);
    try {
      const res = await findPermissions();
      if (res.data?.code !== 0) {
        message.error(res.data?.message || "加载权限失败");
        setDataSource([]);
        return;
      }
      setDataSource(res.data?.data || []);
    } catch (err: any) {
      message.error(err?.message || "加载权限失败");
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const visibleList = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return dataSource;
    return dataSource.filter(
      item =>
        String(item.code || "")
          .toLowerCase()
          .includes(kw) ||
        String(item.name || "")
          .toLowerCase()
          .includes(kw)
    );
  }, [dataSource, keyword]);

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "#cf1322" }}>{`确认删除权限「${item.name || item.code}」（${item.code}）？若已被角色或菜单引用，删除可能失败。`}</span>,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const result: any = await removePermissionItem(item.code);
          if (result.data?.code !== 0) {
            message.error(result.data?.message || "删除失败");
            return;
          }
          message.success("删除成功");
          loadList();
        } catch (err: any) {
          message.error(err?.message || "删除失败");
        }
      }
    });
  };

  const columns: any = [
    {
      title: "权限码",
      dataIndex: "code",
      width: 280
    },
    {
      title: "显示名称",
      dataIndex: "name"
    },
    {
      title: "操作",
      width: 180,
      render: (item: any) => (
        <Space size={[8, 16]}>
          <Button size="small" type="primary" onClick={() => setEditing(item)}>
            编辑
          </Button>
          <Button size="small" danger onClick={() => showDeleteConfirm(item)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-3">
      <div className="mb-3">
        <Alert type="info" showIcon message="权限码是 RBAC 的最小授权单位。角色绑定权限码，菜单也可绑定权限码；用户通过角色拥有的权限访问受控菜单与接口。" />
      </div>
      <PageIntroduction infos={infos} introduction="本页维护系统权限码（如 menu:read）。创建后可在「角色管理」中分配给角色，或在「菜单管理」中绑定到菜单。" />
      <div className="mt-3 bg-white px-3">
        <Space size={[8, 16]} className="my-3" wrap>
          <Input allowClear placeholder="搜索权限码 / 名称" style={{ width: 240 }} value={keyword} onChange={e => setKeyword(e.target.value)} />
          <Button type="primary" icon={<SearchOutlined />} iconPosition="end" onClick={loadList} loading={loading}>
            查询权限
          </Button>
          <Button type="primary" icon={<PlusOutlined />} iconPosition="end" onClick={() => setEditing({})}>
            添加权限
          </Button>
        </Space>
        <Table rowKey="code" columns={columns} dataSource={visibleList} loading={loading} pagination={{ pageSize: 20 }} />
      </div>

      {editing && <PermissionEditModal permission={editing} onOk={loadList} onCancel={() => setEditing(null)} />}
    </div>
  );
};

export default PermissionAdmin;
