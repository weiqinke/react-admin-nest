import { changeUserStatus, findalluser } from "@/api/caravan/Login";
import { UserEditModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, message, Modal, Space, Table, Tag } from "antd";
import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./index.module.scss";

const { confirm } = Modal;

const UserAdmin: FC = () => {
  const [dataSource, setDataSource] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否${item.isdeleted ? "启用" : "禁用"}该用户？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await changeUserStatus(item);
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
      dataIndex: "name"
    },
    {
      title: "昵称",
      dataIndex: "nick"
    },
    {
      title: "邮箱",
      dataIndex: "email",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "手机号",
      dataIndex: "phone",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "状态",
      dataIndex: "isdeleted",
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
            <Button size="small" type="primary" onClick={() => showDeleteConfirm(item)}>
              {item.isdeleted === 0 ? "禁用" : "启用"}
            </Button>
          </div>
        );
      }
    }
  ];

  const findAll = () => {
    setUser(null);
    findalluser({})
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
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" onClick={findAll}>
          查询人员
        </Button>
        <Button type="primary" onClick={() => setUser({})}>
          添加人员
        </Button>
        <Button type="primary" onClick={() => navigate("/myinfo")}>
          跳转
        </Button>
      </Space>
      <Table columns={columns} dataSource={dataSource} rowKey="uid" />
      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
    </div>
  );
};

export default UserAdmin;
