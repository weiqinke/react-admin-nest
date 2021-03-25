import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getAccountLog } from 'api/nest-admin/User';
import moment from 'moment';
const AccountLog: React.FC = () => {
  const columns = [
    {
      title: '账号',
      dataIndex: 'name'
    },
    {
      title: '登陆时间',
      dataIndex: 'created',
      render: (item: any) => {
        return <span>{moment(item).format('YYYY-MM-DD HH:mm')}</span>;
      }
    }
  ];
  const [userslist, setUserlist] = useState([]);
  useEffect(() => {
    getAccountLog({
      name: '',
      st: moment()
        .subtract('7', 'day')
        .format('YYYY-MM-DD'),
      et: moment().format('YYYY-MM-DD HH:mm:ss')
    }).then(result => {
      if (result.data.code === 200) {
        setUserlist(result.data.data);
      }
    });
  }, []);
  return (
    <div>
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.created} />;
    </div>
  );
};

export default AccountLog;
