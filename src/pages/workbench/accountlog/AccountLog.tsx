import React, { useEffect } from 'react';
import { Table } from 'antd';
import moment from 'moment';
const AccountLog: React.FC<any> = props => {
  const { Tableata } = props;
  const columns = [
    {
      title: '账号',
      dataIndex: 'name'
    },
    {
      title: '浏览器版本',
      dataIndex: 'bowser'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip'
    },
    {
      title: '登录设备',
      dataIndex: 'os'
    },
    {
      title: '国家',
      dataIndex: 'country'
    },
    {
      title: '省份',
      dataIndex: 'province'
    },
    {
      title: '市区',
      dataIndex: 'city'
    },
    {
      title: '登陆时间',
      dataIndex: 'created',
      render: (item: any) => {
        return <span>{moment(item).format('YYYY-MM-DD HH:mm')}</span>;
      }
    }
  ];
  useEffect(() => {}, []);
  return (
    <div>
      <Table columns={columns} dataSource={Tableata.reverse()} rowKey={(record: any) => record.id} />
    </div>
  );
};

export default AccountLog;
