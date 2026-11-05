import BarChart from "@/components/Echarts/BarChart";
import LineChart from "@/components/Echarts/LineChart";
import PieChart from "@/components/Echarts/PieChart";
import ScatterChart from "@/components/Echarts/ScatterChart";
import ServerStatusChart from "@/components/Echarts/ServerStatusChart";
import { Col, Row } from "antd";
import { lazy, Suspense } from "react";

// 地图、时间轴只在这一张图里用，单独加载，避免挡住同页的柱状和饼图。
const HomeSenseChart = lazy(() => import("@/components/Echarts/HomeSenseChart"));

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
          <Suspense fallback={null}>
            <HomeSenseChart />
          </Suspense>
        </Col>
      </Row>
    </div>
  );
};
export default AreaChart;
