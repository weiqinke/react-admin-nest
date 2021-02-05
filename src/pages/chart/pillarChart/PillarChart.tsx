import React from 'react';
import { Row, Col } from 'antd';
import Basic from './components/Basic';
import Group from './components/Group';
import Custom from './components/Custom';
import Bar from './components/Bar';

class PillarChart extends React.Component {
  public render() {
    return (
      <div className="chart">
        <Row gutter={16}>
          <Col xl={12} lg={24}>
            <h3>基础柱状图</h3>
            <Basic />
          </Col>
          <Col xl={12} lg={24}>
            <h3>分组柱状图</h3>
            <Group />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xl={12} lg={24}>
            <h3>自定义颜色</h3>
            <Custom />
          </Col>
          <Col xl={12} lg={24}>
            <h3>条形图</h3>
            <Bar />
          </Col>
        </Row>
      </div>
    );
  }
}

export default PillarChart;
