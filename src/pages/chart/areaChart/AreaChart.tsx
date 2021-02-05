import React from 'react';
import { Row, Col } from 'antd';
import Basic from './components/Basic';
import Overlay from './components/Overlay';
class AreaChart extends React.Component {
  public render() {
    return (
      <div className="chart">
        <Row gutter={16}>
          <Col xl={12} lg={24}>
            <h3>基础面积图</h3>
            <Basic />
          </Col>
          <Col xl={12} lg={24}>
            <h3>堆叠面积图</h3>
            <Overlay />
          </Col>
        </Row>
      </div>
    );
  }
}

export default AreaChart;
