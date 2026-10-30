import { listMyAnnouncements, markAnnouncementRead } from "@/api/announcement";
import { PieBorderRadius } from "@/components/Echarts";
import { DingdingOutlined, QqOutlined, WechatOutlined, WeiboOutlined } from "@ant-design/icons";
import { Button, Col, List, Modal, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import CountUpImport from "react-countup";

const CountUp = (CountUpImport as any).default ?? CountUpImport;

import styles from "./index.module.scss";
import Round from "@/components/Echarts/Round";

const Workplace = () => {
  const toMygit = () => window.open("https://github.com/weiqinke/react-admin-nest", "topFrame");
  const src = "https://dr.cdnux.com/18510675/i/2024/12/31/7xt4r.webp";
  const [params, setParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);

  const loadAnnouncements = () => {
    listMyAnnouncements({ page: 1, page_size: 20 })
      .then(res => setAnnouncements(res.data?.data?.list || []))
      .catch(() => setAnnouncements([]));
  };

  useEffect(() => {
    loadAnnouncements();
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
          <div className={styles.wechat}>
            <WechatOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={69999} start={0} duration={1.75} />
              <div className={styles.baseTitle}>微信</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.qq}>
            <QqOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={30366} start={0} duration={1.75} />
              <div className={styles.baseTitle}>QQ</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.weibo}>
            <WeiboOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={19093} start={0} duration={1.75} />
              <div className={styles.baseTitle}>微博</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} xxl={6}>
          <div className={styles.dingding}>
            <DingdingOutlined className={styles.iconStyle} />
            <div>
              <CountUp end={21816} start={0} duration={1.75} />
              <div className={styles.baseTitle}>钉钉</div>
            </div>
            <span onClick={toMygit} className={styles.githubCorner}></span>
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
