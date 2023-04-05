import { UserOutlined } from "@ant-design/icons";
import { Avatar, Col, Form, Input, message, Modal, Radio, Row, Upload } from "antd";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { addOneUser, editOneUser, updateUserAvatarUrl } from "@/api/caravan/Login";
import { trim } from "lodash";

import styles from "./index.module.scss";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const UserEditModal: FC<any> = (props: any) => {
  const { onCancel, onOk, initUser } = props;
  const [form] = Form.useForm();
  const [type, setType] = useState("text");
  const [title, setTitle] = useState("添加");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isreadOnly, setIsreadOnly] = useState(true);

  const [fileList, setfileList] = useState<any[]>([]);

  const [uploading, setuploading] = useState(false);
  const getBase64 = async (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const handleUpload = (uid: string) => {
    if (fileList.length <= 0 || !uid) {
      return;
    }
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append("files", file);
    });
    if (uploading) {
      return;
    }
    formData.append("userUid", uid);
    setuploading(true);
    updateUserAvatarUrl(formData)
      .then(result => {
        setAvatarUrl("");
        if (result.data.code === 200) {
          message.info("头像修改成功");
          return;
        }
        message.info("头像修改失败");
      })
      .catch(() => {
        setAvatarUrl("");
        message.info("头像修改失败");
      });
  };

  const UpLoadProps = {
    beforeUpload: (file: any) => {
      if (file.size >= 1024 * 1024) {
        message.error(`${file.name} 文件太大了`);
        return false;
      }
      if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
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
    let result: any = null;
    if (initUser?.id) {
      const { nick, title, phone, email, sex, password } = data;
      const payload = {
        ...initUser,
        nick,
        title,
        phone,
        email,
        sex
      };
      if (password) payload.password = trim(password);
      result = await editOneUser(payload);
    } else {
      result = await addOneUser(data);
    }

    if (result.data.code !== 200) {
      message.info("操作失败");
      return;
    }
    message.info("操作成功");
    setuploading(false);
    handleUpload(initUser.uid || result.data.data.uid);
    onOk(true);
  };

  const setInputType = () => {
    setType("password");
  };

  useEffect(() => {
    if (initUser) {
      setAvatarUrl(initUser.avatar || "");
    }
    if (initUser?.id) {
      setTitle("编辑");
      setIsreadOnly(true);
    } else {
      setTitle("添加");
      setIsreadOnly(false);
      form.setFieldsValue({ sex: "1" });
    }
    return () => {
      setType("text");
    };
  }, [initUser, form]);

  return (
    <Modal visible title={`${title}用户`} width={800} onCancel={onCancel} onOk={creatRoleSubmit} okText="确定" cancelText="取消" maskClosable={false}>
      <Row>
        <Col span={24}>
          <div className={styles.avatar}>
            <Upload {...UpLoadProps}>
              <Avatar icon={<UserOutlined />} size={100} src={avatarUrl} />
            </Upload>
          </div>
        </Col>
      </Row>
      <Form form={form} initialValues={initUser} onFinish={handleSubmit} {...layout}>
        <Row>
          <Col span={20}>
            <Form.Item label="用户编号" name="id" rules={[{ required: false }]}>
              <Input readOnly autoComplete="off" placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="账号" name="name" rules={[{ required: true }]}>
              <Input autoComplete="off" placeholder="请输入账号" readOnly={isreadOnly} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="密码" name="password" rules={[{ required: !isreadOnly }]}>
              <Input placeholder="请输入密码" type={type} onChange={setInputType} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="昵称" name="nick" rules={[{ required: true }]}>
              <Input autoComplete="off" placeholder="请输入昵称" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="1">男</Radio>
                <Radio value="2">女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="联系电话" name="phone" rules={[{ required: true }]}>
              <Input maxLength={11} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="电子邮箱" name="email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="联系地址" name="group" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="职称" name="title" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserEditModal;
