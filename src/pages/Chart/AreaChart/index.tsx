import BarChart from "@/components/Echarts/BarChart";
import HomeSenseChart from "@/components/Echarts/HomeSenseChart";
import LineChart from "@/components/Echarts/LineChart";
import PictorialBarChart from "@/components/Echarts/PictorialBarChart";
import PieChart from "@/components/Echarts/PieChart";
import ScatterChart from "@/components/Echarts/ScatterChart";
import ServerStatusChart from "@/components/Echarts/ServerStatusChart";
import { Col, Row } from "antd";

const AreaChart = () => {
  return (
    <div style={{ padding: 6 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <BarChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <LineChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <PieChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <ScatterChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <ServerStatusChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <PictorialBarChart />
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <HomeSenseChart />
        </Col>
      </Row>
    </div>
  );
};
export default AreaChart;
