import React, { FC, useEffect, useState } from 'react';
import { Table } from 'antd';
import './userlist.less';
import { FindAllUser } from 'api/nest-admin/Rbac';

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
  return (
    <div className="users-list-page">
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.uid} />;
    </div>
  );
};

export default UserList;
