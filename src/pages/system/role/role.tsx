import React, { FC, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table } from 'antd';
import './role.less';
import { GetAllRole, addrole } from 'api/nest-admin/Rbac';
const RoleList: FC = () => {
  const [menulist, setMenulist] = useState([]);
  useEffect(() => {
    getRole();
  }, []);
  const getRole = () => {
    GetAllRole({}).then((result: any) => {
      if (result.data.code === 200) {
        setMenulist(result.data.data || []);
      }
    });
  };
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
  const addRole = () => {
    setvisible(true);
  };
  const [visible, setvisible] = useState(false);
  const handleCancel = async () => {};
  const initialValues = {};
  const [form] = Form.useForm();
  const { getFieldsValue } = form;
  const submitRole = async () => {
    const formdata = getFieldsValue();
    addrole(formdata).then((result: any) => {
      if (result.data.code === 200) {
        getRole();
        setvisible(false);
      }
    });
  };
  return (
    <div className="users-list-page">
      <Button type="primary" onClick={addRole}>
        添加角色
      </Button>
      <Table columns={columns} dataSource={menulist} rowKey={(record: any) => record.id} />

      <Modal title="Title" visible={visible} onOk={submitRole} onCancel={handleCancel}>
        <Form className="login-page-form_account" initialValues={initialValues} form={form}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入角色名称！' }]}>
            <Input placeholder="名称" />
          </Form.Item>
          <Form.Item name="roleCode" rules={[{ required: true, message: '请输入角色编码！' }]}>
            <Input placeholder="角色编码" />
          </Form.Item>
          <Form.Item name="remarks" rules={[{ required: false, message: '请输入备注！' }]}>
            <Input placeholder="备注" />
          </Form.Item>
          <Form.Item name="sort" rules={[{ required: true, message: '请输入序号！' }]}>
            <Input placeholder="序号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleList;
