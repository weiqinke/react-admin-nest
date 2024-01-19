import React, { FC, useEffect, useState } from "react";
import { Alert, Button, message, Modal, Space, Table, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { findalluser } from "@/api/caravan/Login";
import { deleterole, findAllMenu, getallrole, getMenusByRoleCode, getUsersByRoleCode } from "@/api/caravan/Rbac";
import { OperationRoleModal, RoleAllocationUserModal, RoleAllocationMenuModal } from "@/components/Modals";

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
    getallrole({})
      .then(res => setDataSource(res.data.data || []))
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAllRole();
    findalluser({})
      .then(res => setUserDatasource(res.data.data || []))
      .catch(() => setUserDatasource([]));
    findAllMenu({ isdeleted: 0, version: 2 })
      .then((res: any) => setMenuDataSource(res.data.data || []))
      .catch(() => setMenuDataSource([]));
  }, []);

  const willGiveUser = (record: any) => {
    getUsersByRoleCode({ roleCode: record.roleCode }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.roleCode);
        setInitUIDs(result.data.data.map(v => v.uid) || []);
        setShareUsers(true);
      }
    });
  };
  // 分配菜单
  const willGiveMenu = (record: any) => {
    getMenusByRoleCode({ roleCode: record.roleCode }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.roleCode);
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
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否${item.isdeleted ? "启用" : "禁用"}该用户？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await deleterole({
          ...item,
          isdeleted: item.isdeleted === 0 ? 1 : 0
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
      title: "角色代码",
      dataIndex: "roleCode",
      responsive: ["lg"]
    },
    {
      title: "备注",
      dataIndex: "remarks",
      responsive: ["lg"]
    },
    {
      title: "排序",
      dataIndex: "sort",
      responsive: ["lg"]
    },
    {
      title: "状态",
      dataIndex: "isdeleted",
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
          <Button size="small" type="primary" onClick={() => changeDelStasus(item)}>
            {item.isdeleted === 0 ? "禁用" : "启用"}
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
        <Button type="primary" onClick={() => setRole({})}>
          添加角色
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={dataSource} />
      {role && <OperationRoleModal role={role} onOk={() => findAllRole()} onCancel={() => setRole(null)} />}
      {shareUsers && (
        <RoleAllocationUserModal dataSource={userDataSource} initUIDs={initUIDs} roleCode={roleCode} onOk={() => findAllRole()} onCancel={() => setShareUsers(false)} />
      )}
      {shareMenu && (
        <RoleAllocationMenuModal treeData={menuDataSource} initMenus={changeMenu} roleCode={roleCode} onOk={() => findAllRole()} onCancel={() => setShareMenu(false)} />
      )}
    </div>
  );
};

export default RoleList;
