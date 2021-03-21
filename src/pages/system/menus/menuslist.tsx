import React, { FC, useEffect, useState } from 'react';
import { Button, Form, message, Modal, Table, Tag } from 'antd';
import './menuslist.less';
import { delMenuItem, getAllMenusItem } from 'api/nest-admin/MenuApi';
import MenuEditModal from './MenuEditModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const MenusList: FC = () => {
  const [menuslist, setMenuslist] = useState([]);
  const [parentUid, setparentUid] = useState('-1');
  useEffect(() => {
    getallmenus();
  }, []);

  const [visible, setVisible] = React.useState(false);

  const addChildPage = (record: any) => {
    // 显示弹窗，并且给菜单父级id赋值
    setparentUid(record.menuUid);
    setVisible(true);
  };
  const removeMenuitem = (record: any) => {
    confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: 'red', fontSize: '19px' }}>{`是否删除${record.name}菜单？`}</span>,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await delMenuItem(record);
        if (result.data.code === 200) {
          message.info('操作成功');
          getallmenus();
          return;
        }
        message.info('操作失败');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  };

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 300
    },
    {
      title: '路径',
      dataIndex: 'url'
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text: any) => {
        if (text === 'menu') {
          return <Tag color="#87d068">菜单</Tag>;
        }
        if (text === 'page') {
          return <Tag color="#108ee9">页面</Tag>;
        }
        return <Tag color="#f50">未知</Tag>;
      }
    },
    {
      title: '图标',
      dataIndex: 'icon'
    },
    {
      title: '排序',
      dataIndex: 'sort'
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      render: (text: any) => {
        return <span>{text.slice(0, 15)}</span>;
      }
    },
    {
      title: '操作',
      dataIndex: 'menuUid',
      key: 'menuUid',
      render: (text: any, record: any) => {
        return (
          <div>
            <Button
              type="link"
              onClick={() => {
                addChildPage(record);
              }}
            >
              添加子页面
            </Button>
            <Button
              type="link"
              onClick={() => {
                bianjiMenuItem(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => {
                removeMenuitem(record);
              }}
            >
              删除
            </Button>
          </div>
        );
      }
    }
  ];
  const bianjiMenuItem = (record: any) => {
    setFieldsValue({
      ...record
    });
    //编辑回显菜单
    setVisible(true);
    setIsEdit(true);
    setInitMenuItem(record);
    setparentUid(record.parentUid);
  };
  const addmenuItem = () => {
    setparentUid('-1');
    setVisible(true);
  };
  const getallmenus = () => {
    setMenuslist([]);
    getAllMenusItem().then((result: any) => {
      if (result.data.code === 200) {
        const menudata = result.data.data;
        setMenuslist(menudata || []);
      }
    });
  };
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();
  const { setFieldsValue } = form;
  const pendingCallback = (flag: boolean) => {
    if (flag) {
      getallmenus();
    }
    setVisible(false);
  };
  const [initMenuItem, setInitMenuItem] = useState(false);

  return (
    <div className="users-list-page menulist">
      <Button type="primary" className="topbtn" onClick={getallmenus}>
        查询菜单
      </Button>
      <Button type="primary" className="topbtn" onClick={addmenuItem}>
        添加菜单
      </Button>
      <Table
        columns={columns}
        dataSource={menuslist}
        rowKey={(record: any) => record.menuUid}
        bordered={true}
        className="menutable"
        pagination={{ pageSize: 18 }}
      />
      ;
      <MenuEditModal
        visible={visible}
        isEdit={isEdit}
        initMenuItem={initMenuItem}
        pendingCallback={pendingCallback}
        parentUid={parentUid}
      />
    </div>
  );
};

export default MenusList;
