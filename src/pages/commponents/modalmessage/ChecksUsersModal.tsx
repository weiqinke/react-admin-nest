import React, { useEffect, FC, useState } from 'react';
import { message, Modal } from 'antd';
import { Table } from 'antd';
import { giveUser } from 'api/nest-admin/Rbac';

const ChecksUsersModal: FC<any> = (props: any) => {
  const { title, pendingCallback, visible, changeUser, allUser, okText, cancelText, roleCode } = props;

  const onOkSubmit = async () => {
    //分配人员
    const payload = {
      roleCode,
      users: nextUsers
    };
    const result: any = await giveUser(payload);
    if (result.data.code === 200) {
      message.info('操作成功');
      pendingCallback(true);
      return;
    }
    message.error('操作失败');
    //
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };
  const columns = [
    {
      title: '账号',
      dataIndex: 'name'
    },
    {
      title: '昵称',
      dataIndex: 'nick'
    }
  ];
  const [nextUsers, setNextUsers] = useState<any[]>([]);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      setNextUsers(selectedRowKeys);
    },
    selectedRowKeys: nextUsers
  };

  useEffect(() => {
    const list: any = [];
    changeUser.map((item: any) => {
      list.push(item.uid);
      return true;
    });
    setNextUsers(list);
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
