import { UserEditModal } from "@/components/Modals";
import { ArrowRightOutlined, ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { findUsers, updateUser } from "@/api/microservice/user";
import styles from "./index.module.scss";
import PageIntroduction from "@/components/PageIntroduction";

const { confirm } = Modal;

const infos = [
  {
    title: "系统设置"
  },
  {
    title: "用户管理"
  }
];

const UserAdmin: FC = () => {
  const [dataSource, setDataSource] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否${item.banned ? "启用" : "禁用"}该用户？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await updateUser({ banned: !item.banned });
        if (result.data.code === 200) {
          message.info("操作成功");
          findAll();
          return;
        }
        message.info("操作失败");
      },
      onCancel() {}
    });
  };

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

  const findAll = () => {
    setUser(null);
    findUsers({ banned: false, recycle: false })
      .then(result => {
        if (result.data.code === 200) {
          setDataSource(result.data.data || []);
        }
      })
      .catch(() => {
        setDataSource([]);
      });
  };
  useEffect(findAll, []);

  return (
    <div className={styles.userAdminContainer}>
      <PageIntroduction infos={infos} introduction="本页面是操作系统中的用户，可以用来添加和编辑用户。" />
      <div className={styles.tableContainer}>
        <Space size={[8, 16]} className={styles.header}>
          <Button type="primary" icon={<SearchOutlined />} iconPosition="end" onClick={findAll}>
            查询人员
          </Button>
          <Button type="primary" icon={<PlusOutlined />} iconPosition="end" onClick={() => setUser({})}>
            添加人员
          </Button>
          <Button type="primary" icon={<ArrowRightOutlined />} iconPosition="end" onClick={() => navigate("/profile")}>
            跳转
          </Button>
        </Space>
        <Table columns={columns} dataSource={dataSource} rowKey="uid" />
      </div>

      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
    </div>
  );
};

export default UserAdmin;
