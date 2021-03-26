/**
 * 账号设置
 */
import React, { FC } from 'react';
import { Col, Divider, Row } from 'antd';
const AccountSetting: FC = function() {
  return (
    <Row>
      <Col span={24}>
        <Divider orientation="left" plain>
          账号设置
        </Divider>
      </Col>
      <Col span={10} lg={10} sm={24} md={24}></Col>
    </Row>
  );
};
export default AccountSetting;
