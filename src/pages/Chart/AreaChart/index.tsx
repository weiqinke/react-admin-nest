import { Col, Row } from "antd";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const BarChart = lazy(() => import("@/components/Echarts/BarChart"));
const LineChart = lazy(() => import("@/components/Echarts/LineChart"));
const PieChart = lazy(() => import("@/components/Echarts/PieChart"));
const ScatterChart = lazy(() => import("@/components/Echarts/ScatterChart"));
const ServerStatusChart = lazy(() => import("@/components/Echarts/ServerStatusChart"));
const HomeSenseChart = lazy(() => import("@/components/Echarts/HomeSenseChart"));

function WhenVisible({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "function") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 400 }}>
      {show ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

const AreaChart = () => {
  return (
    <div style={{ padding: 6 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <BarChart />
          </WhenVisible>
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <LineChart />
          </WhenVisible>
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <PieChart />
          </WhenVisible>
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <ScatterChart />
          </WhenVisible>
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <ServerStatusChart />
          </WhenVisible>
        </Col>
        <Col xs={24} sm={24} md={12} xl={8} lg={8}>
          <WhenVisible>
            <HomeSenseChart />
          </WhenVisible>
        </Col>
      </Row>
    </div>
  );
};
export default AreaChart;
