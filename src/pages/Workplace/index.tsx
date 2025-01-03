import { PieBorderRadius } from "@/components/Echarts";
import { DingdingOutlined, QqOutlined, WechatOutlined, WeiboOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import CountUp from "react-countup";

import styles from "./index.module.scss";
import Round from "@/components/Echarts/Round";

const Workplace = () => {
  const toMygit = () => window.open("https://github.com/weiqinke/react-admin-nest", "topFrame");
  const src = "https://www.freeimg.cn/i/2024/12/18/6762e71092b9c.webp";
  return (
    <div className={styles.container}>
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
            <div className={styles.imgbg} style={{ backgroundImage: `url(https://www.freeimg.cn/i/2024/12/19/676421779793a.webp)` }}></div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Workplace;
