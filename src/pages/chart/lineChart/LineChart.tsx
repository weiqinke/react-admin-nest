import React from 'react';
import { Row, Col } from 'antd';
import Basic from './components/Basic';
import Double from './components/Double';

class LineChart extends React.Component {
  public render() {
    return (
      <div className="chart">
        <Row gutter={16}>
          <Col xl={12} lg={24}>
            <h3>基础折线图</h3>
            <Basic />
          </Col>
          <Col xl={12} lg={24}>
            <h3>双曲线图</h3>
            <Double />
          </Col>
        </Row>
      </div>
    );
  }
}

export default LineChart;
