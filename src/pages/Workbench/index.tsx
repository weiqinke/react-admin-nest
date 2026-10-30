import { getHomeSummary } from "@/api/platform";
import LoginLog from "@/components/LoginLog";
import SystemInfo from "@/components/SystemInfo";
import { Alert, Col, Row, Statistic } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Workbench: FC = () => {
  const navigate = useNavigate();
  const [home, setHome] = useState({
    inbox_unread: 0,
    todo_pending: 0,
    open_tickets: 0,
    unread_announcements: 0
  });

  useEffect(() => {
    getHomeSummary()
      .then(res => {
        const data = res.data?.data || {};
        setHome({
          inbox_unread: Number(data.inbox_unread || 0),
          todo_pending: Number(data.todo_pending || 0),
          open_tickets: Number(data.open_tickets || 0),
          unread_announcements: Number(data.unread_announcements || 0)
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="p-3">
      <Alert className="mb-3" type="info" showIcon title="工作台摘要来自 GET /api/me/home，点击卡片可跳转。" />
      <Row gutter={[12, 12]} className="mb-3">
        <Col xs={12} md={6}>
          <div className="cursor-pointer rounded-md bg-white p-4" onClick={() => navigate("/account")}>
            <Statistic title="未读消息" value={home.inbox_unread} />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="cursor-pointer rounded-md bg-white p-4" onClick={() => navigate("/account")}>
            <Statistic title="待办" value={home.todo_pending} />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="cursor-pointer rounded-md bg-white p-4" onClick={() => navigate("/mytickets")}>
            <Statistic title="未关闭工单" value={home.open_tickets} />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="cursor-pointer rounded-md bg-white p-4" onClick={() => navigate("/workplace")}>
            <Statistic title="未读公告" value={home.unread_announcements} />
          </div>
        </Col>
      </Row>
      <div className="mb-3">
        <SystemInfo />
      </div>
      <LoginLog />
    </div>
  );
};

export default Workbench;
