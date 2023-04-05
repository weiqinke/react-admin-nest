import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import bytes from "bytes";
import dayjs from "dayjs";
import { Row, Col, Card, Progress, Empty } from "antd";

import styles from "./index.module.scss";
import { totalPercentage } from "@/utils/core";

const statusColor = (percentage: number) => {
  if (percentage < 40) return "#52c41a";
  if (percentage < 80) return "#ffa500";
  return "#f50";
};

const fetchinfo = {
  mysqlVersion: "5.7.31",
  currentSystemTime: 3616206185635,
  platform: "linux",
  type: "Linux",
  hostname: "VM-0-14-centos",
  arch: "64",
  nodeVersion: "v14.12.0",
  cpus: [
    {
      model: "Intel(R) Xeon(R) CPU Platinum 8280L",
      speed: 2394,
      times: {
        user: 197855420,
        nice: 61270,
        sys: 140104620,
        idle: 15165295990,
        irq: 0
      }
    }
  ]
};
interface OSINFO {
  freemem: number;
  totalmem: number;
  release: string;
  platform: string;
  loadavg: number[];
  arch: string;
  uptime: string;
}
const SystemInfo: React.FC<{ OsInfo: OSINFO }> = () => {
  const OsInfo = {
    freemem: 20755597056,
    totalmem: 34359738368,
    loadavg: [0, 0.01, 0.05],
    platform: "linux",
    release: "3.10.0-1160.11.1.el7.x86_64",
    arch: "x64",
    uptime: 11939391
  };

  const timer: any = useRef();
  const [curSystemTime, setCurSystemTime] = useState("加载中。。。");
  const [messageList, setMessageList] = useState<any>();
  const [loading, setLoading] = useState(true);
  const memPercentage = useMemo(() => {
    return totalPercentage(OsInfo.totalmem, OsInfo.freemem);
  }, []);

  // 倒计时
  useEffect(() => {
    clearInterval(timer?.current);
    timer.current = null;
    timer.current = setInterval(() => {
      setCurSystemTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    setLoading(false);
    const message: any = [
      { id: "1", content: "CPU Intel(R) Xeon(R) Platinum 8280L 正常" },
      { id: "2", content: "最近5、10、15分钟平均负载 正常" },
      { id: "3", content: "内存 正常" },
      { id: "4", content: "欢迎登陆" }
    ];
    setMessageList(message);
  }, []);

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title="系统参数" hoverable loading={loading}>
          <div className={styles.itemText}>
            <em>系统类型：</em>
            {OsInfo.platform}_{OsInfo.arch}
          </div>
          <div className={styles.itemText}>
            <em>Node版本：</em>
            {fetchinfo.nodeVersion}
          </div>
          <div className={styles.itemText}>
            <em>MySQL版本：</em>
            {fetchinfo.mysqlVersion}
          </div>
          <div className={styles.itemText}>
            <em>当前环境：</em>
            <em>生产环境</em>
          </div>
          <div className={styles.itemText}>
            <em>系统时间：</em>
            <em>{curSystemTime}</em>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title="我的消息" hoverable loading={loading}>
          <div className={styles.itemText}>
            <em>CPU Intel(R) Xeon(R) Platinum 8280L 正常</em>
          </div>
          <div className={styles.itemText}>
            <em>最近5、10、15分钟平均负载 正常</em>
          </div>
          <div className={styles.itemText}>
            <em>MySQL版本：</em>
            {fetchinfo.mysqlVersion}
          </div>
          <div className={styles.itemText}>
            <em>内存使用率 正常</em>
          </div>
          <div className={styles.itemText}>
            <em>硬盘使用率 正常</em>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title={`内存使用率(${memPercentage}%)`} hoverable>
          <div className={styles.mem}>
            <Progress type="circle" percent={memPercentage} strokeColor={statusColor(memPercentage)} format={percent => percent + "%"} />
            <div className={styles.surplus}>剩余{bytes(OsInfo.freemem)}</div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default SystemInfo;
