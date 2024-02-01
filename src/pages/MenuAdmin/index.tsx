import { menuFind, updateMenuItem } from "@/api/microservice/menu";
import { MenuEditModal } from "@/components/Modals";
import { getMenuStructure } from "@/utils/core";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";
import styles from "./index.module.scss";

const { confirm } = Modal;

const MenusAdmin: FC = () => {
  const [menuslist, setMenuslist] = useState([]);
  const [parentUid, setparentUid] = useState("-1");
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initMenuItem, setInitMenuItem] = useState();

  const [form] = Form.useForm();
  const { setFieldsValue } = form;

  const columns: any = [
    {
      title: "菜单名称",
      dataIndex: "name",
      width: 300
    },
    {
      title: "路径",
      dataIndex: "url"
    },
    {
      title: "类型",
      dataIndex: "type",
      responsive: ["xxl", "xl", "lg", "md"],
      render: (text: any) => {
        if (text === "menu") return <Tag color="#87d068">菜单</Tag>;
        if (text === "page") return <Tag color="#108ee9">页面</Tag>;
        return <Tag color="#f50">未知</Tag>;
      }
    },
    {
      title: "图标",
      dataIndex: "icon",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "排序",
      dataIndex: "sort",
      responsive: ["xxl", "xl", "lg", "md"]
    },
    {
      title: "备注",
      dataIndex: "remarks",
      responsive: ["xxl", "xl", "lg", "md"],
      render: (text: any) => <span>{text.slice(0, 15)}</span>
    },
    {
      title: "操作",
      render: (text: any, record: any) => {
        return (
          <div>
            {record.type === "page" ? null : (
              <Button type="link" onClick={() => addmenuItem(record.id)}>
                添加子页面
              </Button>
            )}
            <Button type="link" onClick={() => bianjiMenuItem(record)}>
              编辑
            </Button>
            <Button type="link" onClick={() => removeMenuitem(record)}>
              删除
            </Button>
          </div>
        );
      }
    }
  ];

  const removeMenuitem = (record: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否删除${record.name}菜单？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await updateMenuItem({ id: record.id, delete: 1 });
        if (result.data.code === 200) {
          message.info("操作成功");
          getallmenusdata();
          return;
        }
        message.info("操作失败");
      },
      onCancel() {}
    });
  };

  const bianjiMenuItem = (record: any) => {
    setFieldsValue({ ...record });
    //编辑回显菜单
    setVisible(true);
    setIsEdit(true);
    setInitMenuItem(record);
    setparentUid(record.parentUid);
  };

  const addmenuItem = pid => {
    setparentUid(pid);
    setInitMenuItem({});
    setVisible(true);
  };

  const getallmenusdata = () => {
    setMenuslist([]);
    menuFind({ version: 1, delete: 0 }).then((result: any) => {
      if (result.data.code === 200) {
        const menudata = getMenuStructure(result.data.data);
        setMenuslist(menudata || []);
      }
    });
  };

  const onOk = (flag: boolean) => {
    if (flag) getallmenusdata();
    setVisible(false);
  };

  useEffect(getallmenusdata, []);

  return (
    <div className={styles.menusAdminContainer}>
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" onClick={getallmenusdata}>
          查询菜单
        </Button>
        <Button type="primary" onClick={() => addmenuItem(0)}>
          添加菜单
        </Button>
      </Space>
      <Table columns={columns} dataSource={menuslist} rowKey={(record: any) => record.id} bordered={true} className="menutable" pagination={{ pageSize: 18 }} />
      {visible && <MenuEditModal parentUid={parentUid} isEdit={isEdit} initMenuItem={initMenuItem} onOk={onOk} onCancel={() => setVisible(false)} />}
    </div>
  );
};

export default MenusAdmin;
