import React, { FC, useEffect, useState } from 'react';
import { Button, Table, Tag, Modal, message } from 'antd';
import './userlist.less';
import { changeUserStatus, findalluser } from 'api/nest-admin/User';
import UserEditModal from './UserEditModal';
import ModalMessage from 'pages/commponents/modalmessage/ModalMessage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const { confirm } = Modal;
const UserList: FC = () => {
  const [userslist, setUserslist] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [id, setID] = useState(null);
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState({});
  //提示框的属性
  const [tipvisible] = useState(false);
  const [tipContent] = useState('是否删除');
  const navigate = useNavigate();
  const tipcallback = () => {};

  useEffect(() => {
    findAll();
  }, []);
  const findAll = () => {
    setUserslist([]);
    findalluser({}).then(result => {
      if (result.data.code === 200) {
        setUserslist(result.data.data || []);
      }
    });
  };

  const changeDelStasus = (item: any) => {
    showDeleteConfirm(item);
  };
  const showDeleteConfirm = (item: any) => {
    confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span style={{ color: 'red', fontSize: '19px' }}>{`是否${item.isdeleted ? '启用' : '禁用'}该用户？`}</span>
      ), //<Alert message={`"是否${flag?'禁用':'启用'}该用户？"`} type="error" />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await changeUserStatus(item);
        if (result.data.code === 200) {
          message.info('操作成功');
          findAll();
          return;
        }
        message.info('操作失败');
      },
      onCancel() {}
    });
  };
  const columns: any = [
    {
      title: '账号',
      dataIndex: 'name'
    },
    {
      title: '昵称',
      dataIndex: 'nick'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      responsive: ['xxl', 'xl', 'lg', 'md']
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      responsive: ['xxl', 'xl', 'lg', 'md']
    },
    {
      title: '状态',
      dataIndex: 'isdeleted',
      responsive: ['xxl', 'xl', 'lg', 'md'],
      render: (item: any) => {
        if (item) {
          return (
            <Tag color="#f50">
              <span>禁用</span>
            </Tag>
          );
        }
        return (
          <Tag color="#2db7f5">
            <span>启用</span>
          </Tag>
        );
      }
    },
    {
      title: '操作',
      render: (item: any) => {
        return (
          <div>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                userEdit(item);
              }}
              style={{ marginRight: '10px' }}
            >
              编辑
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                changeDelStasus(item);
              }}
            >
              {item.isdeleted === 0 ? '禁用' : '启用'}
            </Button>
          </div>
        );
      }
    }
  ];
  const pendingCallback = (flag: boolean) => {
    if (flag) {
      findAll();
    }
    setVisible(false);
  };
  const addUser = () => {
    setVisible(true);
    setIsEdit(false);
    setID(null);
    setUser({});
  };
  const userEdit = (item: any) => {
    setVisible(true);
    setIsEdit(true);
    setUser(item);
    setID(item.id);
  };
  const tonew = () => {
    navigate('/myinfo');
  };
  return (
    <div className="users-list-page">
      <Button type="primary" className="btns" onClick={findAll}>
        查询人员
      </Button>
      <Button type="primary" className="btns" onClick={addUser}>
        添加人员
      </Button>
      <Button type="primary" className="btns" onClick={tonew}>
        跳转
      </Button>
      <UserEditModal visible={visible} isEdit={isEdit} id={id} initUser={user} pendingCallback={pendingCallback} />
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.uid} />;
      <ModalMessage visible={tipvisible} pendingCallback={tipcallback} content={tipContent} />
    </div>
  );
};

export default UserList;
