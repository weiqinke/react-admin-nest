/**
 * 个人中心
 */
import React, { FC, useState } from 'react';
import './style.scss';
import { Button, Card, Col, Divider, Form, Input, Row } from 'antd';
import Avatar from 'pages/commponents/avatar';
import userPoster from 'assets/header/user.webp';
const { TextArea } = Input;
const { Meta } = Card;
const userInfo = {
  id: '71b0ee35-f16b-4181-89b0-2eefa0b5d548',
  provider: 'github',
  loginName: 'qkstart',
  username: '月野兔',
  password: '123456',
  token: '6b0e111c986bbdbb2c346966fac592ad9f90b947',
  avatarUrl: 'https://portrait.gitee.com/uploads/avatars/user/431/1295434_weiqinke_1591925291.png!avatar30',
  location: '北京',
  bio: 'coding',
  email: '928148935@qq.com',
  ipAddr: '127.0.0.1',
  role: 1,
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01'
};
const BasePage: FC = function() {
  const MetaDesc = (
    <div className="meta-desc">
      <div className="loginname">{userInfo.loginName}</div>
      <div>
        <span>账号：</span>
        {userInfo.loginName}
      </div>
      <div>简介：{userInfo.bio}</div>
      <div>邮箱：{userInfo.email}</div>
      <div>地区：{userInfo.location}</div>
      <div>注册时间：{userInfo.createdAt}</div>
    </div>
  );

  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] = useState<any>('optional');

  const onRequiredTypeChange = ({ requiredMarkValue }: { requiredMarkValue: any }) => {
    setRequiredMarkType(requiredMarkValue);
  };

  return (
    <Row>
      <Col span={24}>
        <Divider orientation="left" plain>
          个人中心
        </Divider>
      </Col>
      <Col span={10} lg={10} sm={24} md={24}>
        <div className="setting-base">
          <Card style={{ width: 350 }} cover={<img alt="" src={userPoster} className="poster" />}>
            <Meta
              avatar={<Avatar src={userInfo.avatarUrl} size="large" />}
              title={userInfo.username}
              description={MetaDesc}
            />
          </Card>
        </div>
      </Col>
      <Col span={12} offset={1} lg={10} sm={23} md={23}>
        <Form
          form={form}
          initialValues={{ requiredMark }}
          onValuesChange={onRequiredTypeChange}
          requiredMark={requiredMark}
          layout="inline"
          className="formdom"
        >
          <Col span={12} className="formitem">
            <Form.Item label="账号" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={12} className="formitem">
            <Form.Item label="密码" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={12} className="formitem">
            <Form.Item label="昵称" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={12} className="formitem">
            <Form.Item label="邮箱" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>
          <Col span={12} className="formitem">
            <Form.Item label="地区" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>

          <Col span={12} className="formitem">
            <Form.Item label="注册时间" required>
              <Input placeholder="" />
            </Form.Item>
          </Col>
          <Col span={24} className="formitem">
            <Form.Item label="简介" required>
              <TextArea rows={4} />
            </Form.Item>
          </Col>

          <Form.Item>
            <Button type="primary">提交</Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};
export default BasePage;
