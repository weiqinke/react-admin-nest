import React, { useState, useEffect, FC } from 'react';
import { Form, Row, Col, Input, Modal, message, Radio, Upload, Avatar } from 'antd';
import { addOneUser, editOneUser, updateUserAvatarUrl } from 'api/nest-admin/User';
import { UserOutlined } from '@ant-design/icons';
import './UserEditModal.less';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const UserEditModal: FC<any> = (props: any) => {
  const { isEdit, pendingCallback, visible, initUser } = props;
  const [form] = Form.useForm();
  const [type, setType] = useState('text');
  const [title, setTitle] = useState('添加');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isreadOnly, setIsreadOnly] = useState(true);

  const [fileList, setfileList] = useState<any[]>([]);

  const [uploading, setuploading] = useState(false);
  const getBase64 = async (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const handleUpload = (uid: string) => {
    if (fileList.length <= 0 || !uid) {
      return;
    }
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file);
    });
    if (uploading) {
      return;
    }
    formData.append('userUid', uid);
    setuploading(true);
    updateUserAvatarUrl(formData)
      .then(result => {
        setAvatarUrl('');
        if (result.data.code === 200) {
          message.info('头像修改成功');
          return;
        }
        message.info('头像修改失败');
      })
      .catch(() => {
        setAvatarUrl('');
        message.info('头像修改失败');
      });
  };

  const UpLoadProps = {
    beforeUpload: (file: any) => {
      if (file.size >= 1024 * 1024) {
        message.error(`${file.name} 文件太大了`);
        return false;
      }
      if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
        message.error(`${file.name} 不是图片`);
        return false;
      }
      setuploading(false);
      setfileList([file]);
      getBase64(file, (imageUrl: any) => setAvatarUrl(imageUrl));
      return false;
    },
    fileList
  };

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    var result: any = null;
    if (isEdit) {
      const { nick, title, phone, email, sex } = data;
      const payload = {
        ...initUser,
        nick,
        title,
        phone,
        email,
        sex
      };
      result = await editOneUser(payload);
    } else {
      result = await addOneUser(data);
    }
    if (result.data.code !== 200) {
      message.info('操作失败');
      return;
    }
    message.info('操作成功');
    setuploading(false);
    handleUpload(initUser.uid || result.data.data.uid);
    pendingCallback(true);
  };
  const CancelSubmit = () => {
    pendingCallback(true);
  };

  const setInputType = () => {
    setType('password');
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
    if (initUser) {
      setAvatarUrl(initUser.avatar || '');
    }
    if (isEdit) {
      setTitle('编辑');
      setIsreadOnly(true);
    } else {
      setTitle('添加');
      setIsreadOnly(false);
      form.setFieldsValue({
        sex: '1'
      });
    }
    return () => {
      setType('text');
    };
  }, [initUser, isEdit, visible, form]);

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={creatRoleSubmit}
      onCancel={CancelSubmit}
      width={800}
      className="UserEditModal"
    >
      <Row>
        <Col span={24}>
          <div className="Avatar">
            <Upload {...UpLoadProps}>
              <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
            </Upload>
          </div>
        </Col>
      </Row>
      <Form form={form} onFinish={handleSubmit} initialValues={initUser} {...layout}>
        <Row>
          <Col span={20}>
            <Form.Item name="id" label="用户编号" rules={[{ required: false }]}>
              <Input readOnly placeholder="自动生成" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="name" label="账号" rules={[{ required: true }]}>
              <Input readOnly={isreadOnly} autoComplete="off" placeholder="请输入账号" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="password" label="密码" rules={[{ required: !isreadOnly }]}>
              <Input type={type} placeholder="请输入密码" onChange={setInputType} />
            </Form.Item>
          </Col>

          <Col span={20}>
            <Form.Item name="nick" label="昵称" rules={[{ required: true }]}>
              <Input autoComplete="off" placeholder="请输入昵称" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="sex" label="性别" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="1">男</Radio>
                <Radio value="2">女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="email" label="电子邮箱" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="group" label="联系地址" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="title" label="职称" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default UserEditModal;
