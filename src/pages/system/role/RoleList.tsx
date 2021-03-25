import React, { FC, useEffect, useState } from 'react';
import { Button, Table, Modal, message, Tag, Alert } from 'antd';
import './RoleList.less';
import { getallrole, deleterole, getUsersByRoleCode, findAllMenu, getMenusByRoleCode } from 'api/nest-admin/Rbac';
import RoleEditModal from './RoleEditModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ChecksUsersModal from 'pages/commponents/modalmessage/ChecksUsersModal';
import { findalluser } from 'api/nest-admin/User';
import ChecksMenusModal from 'pages/commponents/modalmessage/ChecksMenusModal';
const { confirm } = Modal;
const RoleList: FC = () => {
  const [userslist, setUserslist] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [id, setID] = useState(null);
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState({});
  const [allUser, setAllUser] = useState([]);
  const [changeUser, setChangeUser] = useState([]);
  const [checksUserVisible, setchecksUserVisible] = useState(false);

  //菜单模块
  const [allMenu, setAllMenu] = useState([]);
  const [changeMenu, setChangeMenu] = useState([]);
  const [checksMenuVisible, setChecksMenuVisible] = useState(false);

  useEffect(() => {
    findAll();
    findalluser({}).then(result => {
      if (result.data.code === 200) {
        setAllUser(result.data.data || []);
      }
    });
    findAllMenu({ isdeleted: 0 }).then((result: any) => {
      if (result.data.code === 200) {
        setAllMenu(result.data.data || []);
      }
    });
  }, []);
  const findAll = () => {
    getallrole({}).then(result => {
      if (result.data.code === 200) {
        setUserslist(result.data.data || []);
      }
    });
  };
  const willGiveUser = (record: any) => {
    getUsersByRoleCode({ roleCode: record.roleCode }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.roleCode);
        setChangeUser(result.data.data || []);
        setchecksUserVisible(true);
      }
    });
  };
  // 分配菜单
  const willGiveMenu = (record: any) => {
    getMenusByRoleCode({ roleCode: record.roleCode }).then(result => {
      if (result.data.code === 200) {
        setRoleCode(record.roleCode);
        setChangeMenu(result.data.data || []);
        setChecksMenuVisible(true);
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
      ),
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await deleterole({ ...item, isdeleted: item.isdeleted === 0 ? 1 : 0 });
        if (result.data.code === 200) {
          message.info('操作成功');
          findAll();
          return;
        }
        message.info('操作失败');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  };

  const columns: any = [
    {
      title: '角色名称',
      dataIndex: 'name'
    },
    {
      title: '角色代码',
      dataIndex: 'roleCode',
      responsive: ['lg']
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      responsive: ['lg']
    },
    {
      title: '排序',
      dataIndex: 'sort',
      responsive: ['lg']
    },
    {
      title: '状态',
      dataIndex: 'isdeleted',
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
                willGiveUser(item);
              }}
              style={{ marginRight: '10px' }}
            >
              分配人员
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                willGiveMenu(item);
              }}
              style={{ marginRight: '10px' }}
            >
              分配菜单
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                roleEdit(item);
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

  const addOneRole = () => {
    setVisible(true);
    setIsEdit(false);
    setID(null);
  };
  const roleEdit = (item: any) => {
    setVisible(true);
    setIsEdit(true);
    setRole(item);
    setID(item.id);
  };

  const [roleCode, setRoleCode] = useState('-1');
  const usercallback = (flag: boolean) => {
    if (flag) {
      findAll();
    }
    setchecksUserVisible(false);
    setChecksMenuVisible(false);
    setVisible(false);
  };

  return (
    <div className="users-list-page">
      <Alert
        message={
          <h1>
            朋友们,咱们尽量别改动 {<span style={{ fontSize: '15px', color: 'red' }}>qkstat</span>}{' '}
            的权限和菜单，因为新人登陆进来都是这个账号，祝大家体验愉快，有问题可以提{' '}
            {<span style={{ fontSize: '15px', color: 'red' }}>issues</span>} ,我会及时回复您的。
          </h1>
        }
        type="success"
      />
      <Button type="primary" onClick={addOneRole}>
        添加角色
      </Button>
      <RoleEditModal visible={visible} isEdit={isEdit} id={id} initRoleItem={role} pendingCallback={usercallback} />
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.id}></Table>
      <ChecksUsersModal
        allUser={allUser}
        changeUser={changeUser}
        visible={checksUserVisible}
        roleCode={roleCode}
        pendingCallback={usercallback}
      />
      <ChecksMenusModal
        allMenu={allMenu}
        changeMenu={changeMenu}
        roleCode={roleCode}
        visible={checksMenuVisible}
        pendingCallback={usercallback}
      />
    </div>
  );
};

export default RoleList;
