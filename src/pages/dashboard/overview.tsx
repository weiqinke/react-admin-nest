import React, { FC } from 'react';
import { Row, Col, Button } from 'antd';
const Overview: FC<{}> = () => {
  const getInfo = () => {};
  return (
    <Row gutter={16}>
      <Col className="gutter-row" span={6}>
        <div>col-6</div>
        <Button type="primary" onClick={getInfo}>
          点击获取数据
        </Button>
      </Col>
      <Col className="gutter-row" span={6}>
        <div>col-6</div>
      </Col>
      <Col className="gutter-row" span={6}>
        <div>col-6</div>
      </Col>
      <Col className="gutter-row" span={6}>
        <div>col-6</div>
      </Col>
    </Row>
  );
};

export default Overview;
