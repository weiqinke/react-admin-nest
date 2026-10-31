import { hasPermission } from "@/api/announcement";
import { TICKET_STATUS, dataScopeLabel, getDashboard } from "@/api/platform";
import echarts from "@/components/Echarts/setup";
import { Alert, Col, DatePicker, Empty, Row, Statistic } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useRef, useState } from "react";

const { RangePicker } = DatePicker;

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
      title: { text: "工单漏斗", left: 0, textStyle: { fontSize: 14 } },
      tooltip: { trigger: "item" },
      series: [
        {
          type: "funnel",
          left: "10%",
          width: "80%",
          label: { formatter: "{b}: {c}" },
          data: funnelOrder.map(status => ({
            name: TICKET_STATUS[status] || status,
            value: Number(funnel[status] || 0)
          }))
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

  const reach = snap?.announcement_reach || {};

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
      {!failed && !snap ? <Empty description="加载中…" /> : null}
      {snap ? (
        <>
          <Row gutter={[12, 12]} className="mb-3">
            <Col xs={12} md={6}>
              <Statistic title="公告已发布" value={Number(reach.published || 0)} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="公告已读次数" value={Number(reach.reads || 0)} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="待处理工单" value={Number(snap.ticket_funnel?.open || 0)} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="已关闭工单" value={Number(snap.ticket_funnel?.closed || 0)} />
            </Col>
          </Row>
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <div ref={loginRef} style={{ height: 280, width: "100%" }} />
            </Col>
            <Col xs={24} lg={12}>
              <div ref={accessRef} style={{ height: 280, width: "100%" }} />
            </Col>
            <Col xs={24} lg={12}>
              <div ref={funnelRef} style={{ height: 280, width: "100%" }} />
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPanel;
