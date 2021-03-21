import React, { useEffect, FC, useState } from 'react';
import { Modal } from 'antd';
import { Table, Radio, Divider } from 'antd';
import { giveUser } from 'api/nest-admin/Rbac';

const ChecksUsersModal: FC<any> = (props: any) => {
  const { title, pendingCallback, visible, changeUser, allUser, okText, cancelText, roleCode } = props;

  const onOkSubmit = async () => {
    //分配人员
    const payload = {
      roleCode,
      users: nextUsers
    };
    giveUser(payload);
    // pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };
  const columns = [
    {
      title: '账号',
      dataIndex: 'name',
      render: (text: string) => <a>{text}</a>
    },
    {
      title: '昵称',
      dataIndex: 'nick'
    }
  ];
  const [nextUsers, setNextUsers] = useState<any[]>([]);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log('selectedRows: ', selectedRows);
      setNextUsers(selectedRowKeys);
    },
    selectedRowKeys: nextUsers
  };

  useEffect(() => {
    const list = [];
    const MenuHasChildren = allUser.filter((user: any) => {
      return (
        changeUser.filter((cuser: any) => {
          return cuser.uid === user.uid;
        }).length > 0
      );
    });
  }, [allUser, changeUser]);

  return (
    <Modal
      title={title || '提示'}
      visible={visible}
      onOk={onOkSubmit}
      onCancel={CancelSubmit}
      okText={okText || '确认'}
      cancelText={cancelText || '取消'}
      width={700}
    >
      <div>
        <Table
          rowSelection={{
            type: 'checkbox',
            ...rowSelection
          }}
          rowKey={(record: any) => record.uid}
          columns={columns}
          dataSource={allUser}
        />
      </div>
    </Modal>
  );
};
export default ChecksUsersModal;
