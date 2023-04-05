import { AreaStackChart, BarChart, LineChart, PieChart, ScatterChart } from "@/components/Echarts";
import { DingdingOutlined, QqOutlined, WechatOutlined, WeiboOutlined } from "@ant-design/icons";
import { webSocketManager } from "@/utils/ws";
import { Col, Row } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

import styles from "./index.module.scss";

const Workplace = () => {
  const toMygit = () => window.open("https://github.com/weiqinke/react-admin-nest", "topFrame");
  const intervalHandle: any = useRef(null);
  const [osInfo, setOsInfo] = useState({});

  const getSystemInfo = useCallback(() => {
    webSocketManager.postMessage({ type: "OsStatus" });
    clearTimeout(intervalHandle.current);
    intervalHandle.current = setTimeout(getSystemInfo, 1000 * 20);
  }, []);

  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { type, data } = payload;
      if (type === "OsStatus") setOsInfo(data);
    });
    return removeHandler;
  }, []);

  useEffect(() => {
    getSystemInfo();
    return () => {
      clearTimeout(intervalHandle.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Row gutter={24} className={styles.header}>
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
        <Col span={24}>
          <div className={styles.baseChart}>
            <AreaStackChart />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <div className={styles.baseChart}>
            <BarChart />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <div className={styles.baseChart}>
            <LineChart />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <div className={styles.baseChart}>
            <PieChart />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <div className={styles.baseChart}>
            <ScatterChart />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Workplace;
