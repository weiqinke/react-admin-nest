import React, { FC, useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import D3line from 'pages/d3/D3line';
const D3Page: FC = () => {
  return (
    <Row gutter={24} className="index-header">
      <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
        <D3line />
      </Col>
    </Row>
  );
};

export default D3Page;
