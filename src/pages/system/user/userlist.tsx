import React, { FC, useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import './userlist.less';
import { FindAllUser } from 'api/nest-admin/Rbac';
import { addMenuItem } from 'api/nest-admin/MenuApi';

const UserList: FC = () => {
  const [userslist, setUserslist] = useState([]);
  useEffect(() => {
    FindAllUser({}).then(result => {
      if (result.data.code === 200) {
        setUserslist(result.data.data || []);
      }
    });
  }, []);
  const columns = [
    {
      title: 'uid',
      dataIndex: 'uid'
    },
    {
      title: '账号',
      dataIndex: 'name'
    },
    {
      title: '昵称',
      dataIndex: 'title'
    },
    {
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'phone'
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
  return (
    <div className="users-list-page">
      <Button type="primary" onClick={addmenuItem}>
        添加菜单
      </Button>
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.uid} />;
    </div>
  );
};

export default UserList;
