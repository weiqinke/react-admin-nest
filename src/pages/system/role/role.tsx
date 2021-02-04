import React, { FC, useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import './role.less';
import { GetAllRole } from 'api/nest-admin/Rbac';
import { addMenuItem } from 'api/nest-admin/MenuApi';

const RoleList: FC = () => {
  const [menulist, setMenulist] = useState([]);
  useEffect(() => {
    GetAllRole({}).then(result => {
      if (result.data.code === 200) {
        setMenulist(result.data.data || []);
      }
    });
  }, []);
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name'
    },
    {
      title: '角色代码',
      dataIndex: 'roleCode'
    },
    {
      title: '备注',
      dataIndex: 'remarks'
    },
    {
      title: '排序',
      dataIndex: 'sort'
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
        添加角色
      </Button>
      <Table columns={columns} dataSource={menulist} rowKey={(record: any) => record.uid} />;
    </div>
  );
};

export default RoleList;
