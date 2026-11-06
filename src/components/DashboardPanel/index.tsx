import { hasPermission } from "@/api/announcement";
import { TICKET_STATUS, dataScopeLabel, getDashboard } from "@/api/platform";
import echarts from "@/components/Echarts/setup-cartesian";
import { Alert, Col, DatePicker, Row, Skeleton, Statistic } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useRef, useState, type RefObject } from "react";

const { RangePicker } = DatePicker;

const CHART_HEIGHT = 280;
const FUNNEL_HEIGHT = 260;

function ChartFrame({ height, loading, chartRef }: { height: number; loading: boolean; chartRef: RefObject<HTMLDivElement | null> }) {
  if (loading) {
    return <Skeleton.Node active style={{ width: "100%", height, display: "block" }} styles={{ root: { display: "block", width: "100%" } }} />;
  }
  return <div ref={chartRef} style={{ height, width: "100%" }} />;
}

const DashboardPanel: FC = () => {
  const canRead = hasPermission("stats:read");
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(13, "day").startOf("day"), dayjs().endOf("day")]);
  const [snap, setSnap] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canRead) return;
    setFailed(false);
    getDashboard({
      from: range[0].format("YYYY-MM-DD"),
      to: range[1].format("YYYY-MM-DD")
    })
      .then(res => setSnap(res.data?.data || null))
      .catch(() => {
        setSnap(null);
        setFailed(true);
      });
  }, [canRead, range]);

  useEffect(() => {
    if (!snap || !loginRef.current || !accessRef.current || !funnelRef.current) return;

    const loginDays = snap.login_daily || [];
    const accessDays = snap.access_daily || [];
    const funnel = snap.ticket_funnel || {};
    const funnelOrder = ["open", "assigned", "processing", "closed"];

    const loginChart = echarts.init(loginRef.current);
    loginChart.setOption({
      title: { text: "登录趋势", left: 0, textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" },
      legend: { data: ["总计", "成功", "失败"], top: 0, right: 0 },
      grid: { left: 40, right: 16, top: 40, bottom: 28 },
      xAxis: { type: "category", data: loginDays.map((item: any) => String(item.day || "").slice(5, 10)) },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        { name: "总计", type: "line", smooth: true, data: loginDays.map((item: any) => item.total || 0) },
        { name: "成功", type: "line", smooth: true, data: loginDays.map((item: any) => item.success || 0) },
        { name: "失败", type: "line", smooth: true, data: loginDays.map((item: any) => item.fail || 0) }
      ]
    });

    const accessChart = echarts.init(accessRef.current);
    accessChart.setOption({
      title: { text: "访问趋势", left: 0, textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" },
      legend: { data: ["请求", "成功", "失败"], top: 0, right: 0 },
      grid: { left: 40, right: 16, top: 40, bottom: 28 },
      xAxis: { type: "category", data: accessDays.map((item: any) => String(item.day || "").slice(5, 10)) },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        { name: "请求", type: "bar", data: accessDays.map((item: any) => item.total_count || 0) },
        { name: "成功", type: "bar", data: accessDays.map((item: any) => item.success_count || 0) },
        { name: "失败", type: "bar", data: accessDays.map((item: any) => item.fail_count || 0) }
      ]
    });

    const funnelChart = echarts.init(funnelRef.current);
    funnelChart.setOption({
      title: { text: "工单状态", left: 0, textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 72, right: 24, top: 40, bottom: 28 },
      xAxis: { type: "value", minInterval: 1 },
      yAxis: {
        type: "category",
        data: funnelOrder.map(status => TICKET_STATUS[status] || status)
      },
      series: [
        {
          type: "bar",
          barWidth: 18,
          data: funnelOrder.map(status => Number(funnel[status] || 0)),
          itemStyle: { color: "#1677ff" },
          label: { show: true, position: "right" }
        }
      ]
    });

    const onResize = () => {
      loginChart.resize();
      accessChart.resize();
      funnelChart.resize();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      loginChart.dispose();
      accessChart.dispose();
      funnelChart.dispose();
    };
  }, [snap]);

  if (!canRead) return null;

  const loading = !failed && !snap;
  const reach = snap?.announcement_reach || {};
  const stats = [
    { title: "公告已发布", value: Number(reach.published || 0) },
    { title: "公告已读次数", value: Number(reach.reads || 0) },
    { title: "待处理工单", value: Number(snap?.ticket_funnel?.open || 0) },
    { title: "已关闭工单", value: Number(snap?.ticket_funnel?.closed || 0) }
  ];

  return (
    <div className="admin-card">
      <div className="admin-toolbar" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="font-medium">数据看板</div>
          <div className="text-xs text-neutral-500">
            GET /api/stats/dashboard
            {snap?.data_scope ? ` · ${dataScopeLabel(snap.data_scope)}` : ""}
            {snap?.from && snap?.to ? ` · ${snap.from} ~ ${snap.to}` : ""}
          </div>
        </div>
        <RangePicker
          allowClear={false}
          value={range}
          onChange={value => {
            if (value?.[0] && value?.[1]) setRange([value[0].startOf("day"), value[1].endOf("day")]);
          }}
        />
      </div>
      {failed ? <Alert type="warning" showIcon message="看板加载失败，请确认已授权 stats:read" /> : null}
      {!failed ? (
        <>
          <Row gutter={[12, 12]} className="mb-3">
            {stats.map(item => (
              <Col key={item.title} xs={12} md={6}>
                <div style={{ minHeight: 62 }}>
                  {loading ? <Skeleton active title={{ width: "70%" }} paragraph={{ rows: 1, width: "40%" }} /> : <Statistic title={item.title} value={item.value} />}
                </div>
              </Col>
            ))}
          </Row>
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <ChartFrame height={CHART_HEIGHT} loading={loading} chartRef={loginRef} />
            </Col>
            <Col xs={24} lg={12}>
              <ChartFrame height={CHART_HEIGHT} loading={loading} chartRef={accessRef} />
            </Col>
            <Col xs={24}>
              <ChartFrame height={FUNNEL_HEIGHT} loading={loading} chartRef={funnelRef} />
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPanel;
