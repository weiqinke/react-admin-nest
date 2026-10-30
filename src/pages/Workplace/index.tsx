import { listMyAnnouncements, markAnnouncementRead } from "@/api/announcement";
import { getHomeSummary } from "@/api/platform";
import { PieBorderRadius } from "@/components/Echarts";
import Round from "@/components/Echarts/Round";
import { BellOutlined, CheckSquareOutlined, FileTextOutlined, NotificationOutlined } from "@ant-design/icons";
import { Button, Col, List, Modal, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import CountUpImport from "react-countup";

const CountUp = (CountUpImport as any).default ?? CountUpImport;

import styles from "./index.module.scss";

const Workplace = () => {
  const navigate = useNavigate();
  const toMygit = () => window.open("https://github.com/weiqinke/react-admin-nest", "topFrame");
  const src = "https://dr.cdnux.com/18510675/i/2024/12/31/7xt4r.webp";
  const [params, setParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [home, setHome] = useState({
    inbox_unread: 0,
    todo_pending: 0,
    open_tickets: 0,
    unread_announcements: 0
  });

  const loadAnnouncements = () => {
    listMyAnnouncements({ page: 1, page_size: 20 })
      .then(res => setAnnouncements(res.data?.data?.list || []))
      .catch(() => setAnnouncements([]));
  };

  const loadHome = () => {
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
  };

  useEffect(() => {
    loadAnnouncements();
    loadHome();
  }, []);

  useEffect(() => {
    const id = params.get("announcement_id");
    if (!id || !announcements.length) return;
    const found = announcements.find(item => String(item.id) === id);
    if (found) setCurrent(found);
  }, [params, announcements]);

  const openAnnouncement = async (item: any) => {
    setCurrent(item);
    if (!item.read) {
      await markAnnouncementRead(String(item.id));
      loadAnnouncements();
      loadHome();
    }
  };

  const closeAnnouncement = () => {
    setCurrent(null);
    if (params.get("announcement_id")) {
      params.delete("announcement_id");
      setParams(params, { replace: true });
    }
  };

  return (
    <div className={styles.container}>
      <div className="mb-3 rounded-md bg-white p-3">
        <div className="mb-2 font-medium">当前公告</div>
        <List
          rowKey="id"
          dataSource={announcements}
          locale={{ emptyText: "暂无公告" }}
          renderItem={item => (
            <List.Item
              actions={[
                <Button key="open" type="link" size="small" onClick={() => openAnnouncement(item)}>
                  查看
                </Button>
              ]}>
              <List.Item.Meta
                title={
                  <span>
                    {item.title} {item.read ? null : <Tag color="blue">未读</Tag>}
                  </span>
                }
                description={item.published_at || ""}
              />
            </List.Item>
          )}
        />
      </div>
      <Modal open={Boolean(current)} title={current?.title || "公告"} okText="知道了" cancelButtonProps={{ style: { display: "none" } }} onOk={closeAnnouncement} onCancel={closeAnnouncement} destroyOnHidden>
        <div className="whitespace-pre-wrap">{current?.content || ""}</div>
      </Modal>
      <Row gutter={[12, 12]} className={styles.header}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.wechat} style={{ cursor: "pointer" }} onClick={() => navigate("/account")}>
            <BellOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={home.inbox_unread} start={0} duration={1.25} />
              <div className={styles.baseTitle}>未读消息</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.qq} style={{ cursor: "pointer" }} onClick={() => navigate("/account")}>
            <CheckSquareOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={home.todo_pending} start={0} duration={1.25} />
              <div className={styles.baseTitle}>待办</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.weibo} style={{ cursor: "pointer" }} onClick={() => navigate("/mytickets")}>
            <FileTextOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={home.open_tickets} start={0} duration={1.25} />
              <div className={styles.baseTitle}>未关闭工单</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.dingding} style={{ position: "relative", cursor: "pointer" }} onClick={loadAnnouncements}>
            <NotificationOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={home.unread_announcements} start={0} duration={1.25} />
              <div className={styles.baseTitle}>未读公告</div>
            </div>
            <span
              onClick={event => {
                event.stopPropagation();
                toMygit();
              }}
              className={styles.githubCorner}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={16}>
          <div className={styles.baseChart}>
            <div className={styles.imgbg} style={{ backgroundImage: `url(${src})` }}></div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <div className={styles.baseChart}>
            <PieBorderRadius />
          </div>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <div className={styles.baseChart}>
            <Round />
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={16}>
          <div className={styles.baseChart}>
            <div className={styles.imgbg} style={{ backgroundImage: `url(https://dr.cdnux.com/18510675/i/2024/12/31/14tve.webp)` }}></div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Workplace;
