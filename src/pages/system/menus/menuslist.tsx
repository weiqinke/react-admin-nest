import React, { FC, useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Table } from 'antd';
import './menuslist.less';
import { addMenuItem, delMenuItem, editMenuItem, getAllMenusItem } from 'api/nest-admin/MenuApi';
const MenusList: FC = () => {
  const [menuslist, setMenuslist] = useState([]);
  const [parentUid, setparentUid] = useState('-1');
  useEffect(() => {
    getAllMenusItem().then(result => {
      if (result.data.code === 200) {
        setMenuslist(result.data.data || []);
      }
    });
  }, []);

  const [visible, setVisible] = React.useState(false);
  const [type, setType] = useState('Add');

  const handleCancel = () => {
    setVisible(false);
  };

  const addChildPage = (record: any) => {
    // 显示弹窗，并且给菜单父级id赋值
    setType('Add');
    setparentUid(record.menuUid);
    setVisible(true);
  };
  const [delMenuitem, setdelMenuitem] = useState({});
  const removeMenuitem = (record: any) => {
    setdelMenuitem(record);
    setdelVisble(true);
  };
  const submitDelMenuitem = async () => {
    const result = await delMenuItem(delMenuitem);
    if (result.data.code === 200) {
      setdelVisble(false);
      message.info('操作成功');
      getallmenus();
    }
  };

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 300
    },
    {
      title: '路径',
      dataIndex: 'url'
    },
    {
      title: '类型',
      dataIndex: 'type'
    },
    {
      title: '图标',
      dataIndex: 'icon'
    },
    {
      title: '排序',
      dataIndex: 'sort'
    },
    {
      title: '操作',
      dataIndex: 'menuUid',
      key: 'menuUid',
      render: (text: any, record: any) => {
        return (
          <div>
            <Button
              type="link"
              onClick={() => {
                addChildPage(record);
              }}
            >
              添加子页面
            </Button>
            <Button
              type="link"
              onClick={() => {
                bianjiMenuItem(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => {
                removeMenuitem(record);
              }}
            >
              删除
            </Button>
          </div>
        );
      }
    }
  ];
  // 编辑菜单，别忘记把原来的值存下来
  const [nextMenuItem, setNextMenuItem] = useState({});
  const bianjiMenuItem = (record: any) => {
    setNextMenuItem(record);
    setFieldsValue({
      ...record
    });
    setType('Edit');
    setVisible(true);
  };
  const addmenuItem = () => {
    setType('Add');
    setparentUid('-1');
    setVisible(true);
  };
  const getallmenus = () => {
    getAllMenusItem().then((result: any) => {
      if (result.data.code === 200) {
        const menudata = result.data.data;
        setMenuslist(menudata);
      }
    });
  };
  const initialValues = useState({
    name: '',
    password: '',
    remember: true
  });
  const submitMenuItem = async () => {
    const formdata = getFieldsValue();
    //先从旧值取出来，再重新赋值
    const payload = {
      parentUid,
      ...nextMenuItem,
      ...formdata
    };
    if (type === 'Add') {
      addMenuItem(payload).then((result: any) => {
        if (result.data.code === 200) {
          getallmenus();
          setVisible(false);
          message.info('添加成功');
        }
      });
    } else {
      editMenuItem(payload).then((result: any) => {
        if (result.data.code === 200) {
          getallmenus();
          setVisible(false);
          message.info('添加成功');
        }
      });
    }
  };
  const [delVisble, setdelVisble] = useState(false);
  const [form] = Form.useForm();
  const { getFieldsValue, setFieldsValue } = form;
  return (
    <div className="users-list-page menulist">
      <Button type="primary" className="topbtn" onClick={getallmenus}>
        查询菜单
      </Button>
      <Button type="primary" className="topbtn" onClick={addmenuItem}>
        添加菜单
      </Button>
      <Table columns={columns} dataSource={menuslist} rowKey={(record: any) => record.menuUid} bordered={true} />;
      <Modal title="Title" visible={visible} onOk={submitMenuItem} onCancel={handleCancel}>
        <Form className="login-page-form_account" initialValues={initialValues} form={form}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入名称！' }]}>
            <Input placeholder="名称" />
          </Form.Item>
          <Form.Item name="remarks" rules={[{ required: true, message: '请输入备注！' }]}>
            <Input placeholder="备注" />
          </Form.Item>
          <Form.Item name="sort" rules={[{ required: true, message: '请输入序号！' }]}>
            <Input placeholder="序号" />
          </Form.Item>
          <Form.Item name="url" rules={[{ required: true, message: '请输入路径！' }]}>
            <Input placeholder="路径" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="删除菜单"
        centered
        visible={delVisble}
        onOk={() => setdelVisble(false)}
        onCancel={() => setdelVisble(false)}
        footer={
          <div>
            <Button type="primary" onClick={submitDelMenuitem}>
              确定删除
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setdelVisble(false);
              }}
            >
              取消
            </Button>
          </div>
        }
      >
        <p>确定删除该菜单吗</p>
      </Modal>
    </div>
  );
};

export default MenusList;
