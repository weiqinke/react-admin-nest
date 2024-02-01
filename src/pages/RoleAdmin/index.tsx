import { updaterole } from "@/api/caravan/Rbac";
import { OperationRoleModal, RoleAllocationMenuModal, RoleAllocationUserModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

import { menuFind } from "@/api/microservice/menu";
import { findRoleMenus, findRoleUsers, findRoles } from "@/api/microservice/role";
import { findUsers } from "@/api/microservice/user";
import { getMenuStructure } from "@/utils/core";
import styles from "./index.module.scss";

const { confirm } = Modal;

const RoleList: FC = () => {
  const [dataSource, setDataSource] = useState([]);
  const [role, setRole] = useState<any>();
  const [roleCode, setRoleCode] = useState("-1");

  const [userDataSource, setUserDatasource] = useState([]);
  const [initUIDs, setInitUIDs] = useState([]);
  const [shareUsers, setShareUsers] = useState(false);

  //菜单模块
  const [menuDataSource, setMenuDataSource] = useState([]);
  const [changeMenu, setChangeMenu] = useState([]);
  const [shareMenu, setShareMenu] = useState(false);

  const findAllRole = () => {
    setRole(null);
    setShareUsers(false);
    setShareMenu(false);
    findRoles({})
      .then(res => setDataSource(res.data.data || []))
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAllRole();
    findUsers({ banned: false, recycle: false })
      .then(res => setUserDatasource(res.data.data || []))
      .catch(() => setUserDatasource([]));
    menuFind({ version: 1, delete: 0 })
      .then((res: any) => {
        const data = res.data.data.map(v => {
          v.key = v.id;
          v.value = v.id;
          v.title = v.name;
          return v;
        });
        setMenuDataSource(getMenuStructure(data, 0) || []);
      })
      .catch(() => setMenuDataSource([]));
  }, []);

  const willGiveUser = (record: any) => {
    findRoleUsers({ roleCode: record.roleCode }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.id);
        setInitUIDs(result.data.data || []);
        setShareUsers(true);
      }
    });
  };
  // 分配菜单
  const willGiveMenu = (record: any) => {
    findRoleMenus({ id: record.id, delete: 0 }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.id);
        setChangeMenu(result.data.data || []);
        setShareMenu(true);
      }
    });
  };

  const changeDelStasus = (item: any) => {
    showDeleteConfirm(item);
  };

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否${item.banned ? "启用" : "禁用"}该权限？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await updaterole({
          id: item.id,
          banned: !item.banned
        });
        if (result.data.code === 200) {
          message.info("操作成功");
          return findAllRole();
        }
        message.info("操作失败");
      },
      onCancel() {}
    });
  };

  const columns: any = [
    {
      title: "角色名称",
      dataIndex: "name"
    },
    {
      title: "备注",
      dataIndex: "remake",
      responsive: ["lg"]
    },
    {
      title: "排序",
      dataIndex: "sort",
      responsive: ["lg"]
    },
    {
      title: "状态",
      dataIndex: "banned",
      render: (item: any) => <Tag color={item ? "#f50" : "#2db7f5"}>{item ? "禁用" : "启用"}</Tag>
    },
    {
      title: "操作",
      render: (item: any) => (
        <Space size={[8, 16]}>
          <Button size="small" type="primary" onClick={() => willGiveUser(item)}>
            分配人员
          </Button>
          <Button size="small" type="primary" onClick={() => willGiveMenu(item)}>
            分配菜单
          </Button>
          <Button size="small" type="primary" onClick={() => setRole(item)}>
            编辑
          </Button>
          <Button size="small" type="primary" danger={!item.banned} onClick={() => changeDelStasus(item)}>
            {item.banned ? "启用" : "禁用"}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <Alert
        type="success"
        message={
          <div className={styles.tip}>
            朋友们,咱们尽量别改动
            <span className={styles.weightFont}>qkstat</span>
            的权限和菜单，因为新人登陆进来都是这个账号，祝大家体验愉快，有问题可以提
            <span className={styles.weightFont}>issues</span>
            ,我会及时回复您的。
          </div>
        }
      />
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" onClick={findAllRole}>
          查询角色
        </Button>
        <Button type="primary" onClick={() => setRole({})}>
          添加角色
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={dataSource} />
      {role && <OperationRoleModal role={role} onOk={() => findAllRole()} onCancel={() => setRole(null)} />}
      {shareUsers && (
        <RoleAllocationUserModal dataSource={userDataSource} initUIDs={initUIDs} id={roleCode} onOk={() => findAllRole()} onCancel={() => setShareUsers(false)} />
      )}
      {shareMenu && (
        <RoleAllocationMenuModal treeData={menuDataSource} initMenus={changeMenu} id={roleCode} onOk={() => findAllRole()} onCancel={() => setShareMenu(false)} />
      )}
    </div>
  );
};

export default RoleList;
