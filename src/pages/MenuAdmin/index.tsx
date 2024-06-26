import { menuFind, updateMenuItem } from "@/api/microservice/menu";
import { MenuEditModal } from "@/components/Modals";
import { getMenuStructure, scrollToAnchor } from "@/utils/core";
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";
import styles from "./index.module.scss";
import PageIntroduction from "@/components/PageIntroduction";

const { confirm } = Modal;
const infos = [
  {
    title: "系统设置"
  },
  {
    title: "菜单管理"
  }
];

const MenusAdmin: FC = () => {
  const [menuslist, setMenuslist] = useState([]);
  const [parentUid, setparentUid] = useState("-1");
  const [visible, setVisible] = useState(false);
  const [initMenuItem, setInitMenuItem] = useState<any>();

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
      render: (type: any) => {
        if (type === 1) return <Tag color="#87d068">菜单</Tag>;
        if (type === 2) return <Tag color="#108ee9">页面</Tag>;
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
              {record?.banned ? "启用" : "禁用"}
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
      content: <span style={{ color: "red", fontSize: "19px" }}>{`是否 ${record?.banned ? "启用" : "禁用"} ${record.name} 菜单？`}</span>,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await updateMenuItem({ id: record.id, banned: record?.banned ? 0 : 1 });
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
    menuFind({ version: 1 }).then((result: any) => {
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

  useEffect(()=>{
    scrollToAnchor("Anchor")
  },[])

  return (
    <div className={styles.menusAdminContainer}>
      <span id="Anchor" />
      <PageIntroduction
        infos={infos}
        introduction="本页面是展示和操作系统中的菜单，可以新增和编辑你想要配置的路径，图标，排序等信息。操作完成后，需要在权限管理中，再次进行分配。"
      />
      <div className={styles.tableContainer}>
        <Space size={[8, 16]} className={styles.header}>
          <Button type="primary" icon={<SearchOutlined />} iconPosition="end" onClick={getallmenusdata}>
            查询菜单
          </Button>
          <Button type="primary" icon={<PlusOutlined />} iconPosition="end" onClick={() => addmenuItem(0)}>
            添加菜单
          </Button>
        </Space>
        <Table columns={columns} dataSource={menuslist} rowKey={(record: any) => record.id} bordered={true} className="menutable" pagination={{ pageSize: 18 }} />
      </div>
      {visible && <MenuEditModal parentUid={parentUid} initMenuItem={initMenuItem} onOk={onOk} onCancel={() => setVisible(false)} />}
    </div>
  );
};

export default MenusAdmin;
