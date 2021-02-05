import React from 'react';
import { Row, Col } from 'antd';
import Basic from './components/Basic';

class RadarChart extends React.Component {
  public render() {
    return (
      <div className="chart">
        <Row gutter={16}>
          <Col xl={12} lg={24}>
            <h3>基础雷达图</h3>
            <Basic />
          </Col>
        </Row>
      </div>
    );
  }
}

export default RadarChart;
