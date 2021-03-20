import React, { FC, useState } from 'react';
import { Button, Table } from 'antd';

import './style.scss';

const MessageCenter: FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableColumns] = useState([
    {
      title: '',
      dataIndex: 'hasRead',
      width: 12,
      className: 'unread-row',
      render: (hasRead: boolean) => !hasRead && <i className="unread-dot">●</i>
    },
    { title: '标题内容', dataIndex: 'content' },
    { title: '提交时间', dataIndex: 'createdAt', width: 150 },
    { title: '类型', dataIndex: 'title', width: 130 }
  ]);

  const handleAction = () => {};
  return (
    <div className="inner-message">
      <Table
        columns={tableColumns}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys: any) => setSelectedRowKeys(selectedKeys)
        }}
      />
      <div className="action-group">
        <Button onClick={handleAction} disabled={selectedRowKeys.length <= 0}>
          标记已读
        </Button>
        <Button onClick={handleAction}>全部已读</Button>
      </div>
    </div>
  );
};

export default MessageCenter;
