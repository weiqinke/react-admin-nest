import { OperationRoleModal, RoleAllocationPermModal, RoleAllocationUserModal } from "@/components/Modals";
import PageIntroduction from "@/components/PageIntroduction";
import { findRoleUsers, findRoles, removeRole } from "@/api/microservice/role";
import { findUsers } from "@/api/microservice/user";
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const { confirm } = Modal;

const infos = [{ title: "系统设置" }, { title: "角色管理" }];

const RoleList: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [role, setRole] = useState<any>(null);
  const [roleCode, setRoleCode] = useState("");

  const [userDataSource, setUserDatasource] = useState<any[]>([]);
  const [initUIDs, setInitUIDs] = useState<string[]>([]);
  const [shareUsers, setShareUsers] = useState(false);
  const [sharePerms, setSharePerms] = useState(false);

  const findAllRole = () => {
    setRole(null);
    setShareUsers(false);
    setSharePerms(false);
    findRoles()
      .then(res => setDataSource(res.data.data || []))
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAllRole();
    findUsers({})
      .then(res => setUserDatasource(res.data.data || []))
      .catch(() => setUserDatasource([]));
  }, []);

  const willGiveUser = async (record: any) => {
    try {
      const result = await findRoleUsers({ roleCode: record.code });
      if (result.data.code !== 0) {
        message.error(result.data?.message || "加载角色成员失败");
        return;
      }
      setRoleCode(record.code);
      setInitUIDs((result.data.data || []).map(String));
      setShareUsers(true);
    } catch (err: any) {
      message.error(err?.message || "加载角色成员失败");
    }
  };

  const willGivePerms = (record: any) => {
    setRoleCode(record.code);
    setSharePerms(true);
  };

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "#cf1322" }}>{`确认删除角色「${item.name || item.code}」？此操作不可恢复。`}</span>,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const result: any = await removeRole({ code: item.code });
          if (result.data?.code !== 0) {
            message.error(result.data?.message || "删除失败");
            return;
          }
          message.success("删除成功");
          findAllRole();
        } catch (err: any) {
          message.error(err?.message || "删除失败");
        }
      }
    });
  };

  const columns: any = [
    {
      title: "角色编码",
      dataIndex: "code"
    },
    {
      title: "角色名称",
      dataIndex: "name"
    },
    {
      title: "继承",
      dataIndex: "inherits",
      responsive: ["lg"],
      render: (inherits: string[] = []) => (inherits?.length ? inherits.map(code => <Tag key={code}>{code}</Tag>) : <span style={{ color: "rgba(0,0,0,0.45)" }}>无</span>)
    },
    {
      title: "操作",
      render: (item: any) => (
        <Space size={[8, 16]} wrap>
          <Button size="small" type="primary" onClick={() => willGiveUser(item)}>
            分配人员
          </Button>
          <Button size="small" type="primary" onClick={() => willGivePerms(item)}>
            分配权限
          </Button>
          <Button size="small" type="primary" onClick={() => setRole(item)}>
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
        <Alert
          type="info"
          showIcon
          message="角色通过权限码授权；菜单是否可见由「角色权限」与「菜单所需权限」共同决定。人员关系保存在 user_role，一次授予一个用户一个角色。"
        />
      </div>

      <PageIntroduction infos={infos} introduction="本页维护角色、给角色分配人员和权限码。不要在角色上挂菜单 ID；受控菜单请在菜单管理中绑定权限码。" />
      <div className="mt-3 bg-white px-3">
        <Space size={[8, 16]} className="my-3">
          <Button type="primary" icon={<SearchOutlined />} iconPosition="end" onClick={findAllRole}>
            查询角色
          </Button>
          <Button type="primary" icon={<PlusOutlined />} iconPosition="end" onClick={() => setRole({})}>
            添加角色
          </Button>
        </Space>
        <Table rowKey="code" columns={columns} dataSource={dataSource} />
      </div>

      {role && <OperationRoleModal role={role} onOk={() => findAllRole()} onCancel={() => setRole(null)} />}
      {shareUsers && (
        <RoleAllocationUserModal
          dataSource={userDataSource}
          initUIDs={initUIDs}
          id={roleCode}
          title={`分配人员：${roleCode}`}
          onOk={() => {
            setShareUsers(false);
            findAllRole();
          }}
          onCancel={() => setShareUsers(false)}
        />
      )}
      {sharePerms && (
        <RoleAllocationPermModal
          roleCode={roleCode}
          onOk={() => {
            setSharePerms(false);
            findAllRole();
          }}
          onCancel={() => setSharePerms(false)}
        />
      )}
    </div>
  );
};

export default RoleList;
