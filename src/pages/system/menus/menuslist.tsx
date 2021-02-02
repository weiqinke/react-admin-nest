import React, { FC, useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import './menuslist.less';
import { addMenuItem, getAllMenusItem } from 'api/nest-admin/MenuApi';

const MenusList: FC = () => {
  const [menuslist, setMenuslist] = useState([]);
  useEffect(() => {
    getAllMenusItem().then(result => {
      if (result.data.code === 200) {
        setMenuslist(result.data.data || []);
      }
    });
  }, []);

  const addChildPage = (record: any) => {
    addMenuItem({
      parentUid: record.menuUid,
      name: '系统管理',
      url: 'menuslist' + Math.random(),
      sort: 0,
      remarks: '子菜单'
    });
  };

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name'
    },
    {
      title: '路径',
      dataIndex: 'url'
    },
    {
      title: '类型',
      dataIndex: 'menuUid'
    },
    {
      title: '图标',
      dataIndex: 'menuUid'
    },
    {
      title: '排序',
      dataIndex: 'sort'
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
            <Button type="link">添加子节点</Button>
            <Button type="link">删除</Button>
          </div>
        );
      }
    }
  ];
  const addmenuItem = () => {
    addMenuItem({
      parentUid: '-1',
      name: '系统管理',
      url: 'workplace' + Math.random(),
      sort: 3,
      remarks: '系统管理路由'
    });
  };
  const getallmenus = () => {
    getAllMenusItem().then((result: any) => {
      if (result.data.code === 200) {
        const menudata = result.data.data;
        setMenuslist(menudata);
      }
    });
  };
  return (
    <div className="users-list-page">
      <Button type="primary" onClick={getallmenus}>
        查询菜单
      </Button>
      <Button type="primary" onClick={addmenuItem}>
        添加菜单
      </Button>
      <Table columns={columns} dataSource={menuslist} rowKey={(record: any) => record.menuUid} />;
    </div>
  );
};

export default MenusList;
