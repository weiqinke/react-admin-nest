import { Row, Col } from "antd";
import {
  BarChart,
  HomeSenseChart,
  LineChart,
  PictorialBarChart,
  PieChart,
  ScatterChart,
  ServerStatusChart,
} from "@/components/Echarts";

const AreaChart = () => {
  return (
    <div style={{ padding: 6 }}>
      <Row gutter={[12, 12]}>
        <Col span={8}>
          <BarChart />
        </Col>
        <Col span={8}>
          <LineChart />
        </Col>
        <Col span={8}>
          <PieChart />
        </Col>
        <Col span={8}>
          <ScatterChart />
        </Col>
        <Col span={8}>
          <ServerStatusChart />
        </Col>
        <Col span={8}>
          <PictorialBarChart />
        </Col>
        <Col span={24}>
          <HomeSenseChart />
        </Col>
      </Row>
    </div>
  );
};
export default AreaChart;
