import React from "react";
import { Row, Col } from "antd";
import { AreaStackChart, BarChart, LineChart, LoginFrequencyChart, PictorialBarChart, PieChart, ScatterChart } from "@/components/Echarts";

const AreaChart = () => {
  return (
    <div style={{ padding: 12 }}>
      <Row gutter={16}>
        <Col span={12}>
          <h3>图例</h3>
          <AreaStackChart />
        </Col>
        <Col span={12}>
          <h3>图例</h3>
          <BarChart />
        </Col>
        <Col span={12}>
          <h3>图例</h3>
          <LineChart />
        </Col>
        <Col span={12}>
          <h3>图例</h3>
          <LoginFrequencyChart />
        </Col>
        <Col span={12}>
          <h3>图例</h3>
          <PictorialBarChart />
        </Col>
        <Col span={12}>
          <h3>图例</h3>
          <PieChart />
        </Col>
        <Col span={24}>
          <h3>图例</h3>
          <ScatterChart />
        </Col>
      </Row>
    </div>
  );
};
export default AreaChart;
