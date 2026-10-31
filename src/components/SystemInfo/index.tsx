import { apiCount } from "@/api/log";
import { dataScopeLabel } from "@/api/platform";
import { totalPercentage } from "@/utils/core";
import { webSocketManager } from "@/utils/ws";
import { Col, Progress, Row } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";

function formatBytes(value: number) {
  if (value == null || Number.isNaN(value)) return "";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const negative = value < 0;
  let size = Math.abs(value);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  const text = unit === 0 ? String(size) : String(Number(size.toFixed(2)));
  return `${negative ? "-" : ""}${text}${units[unit]}`;
}

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

/** 时钟单独挂载，避免每秒重绘整块系统信息卡片。 */
const LiveClock = () => {
  const [curSystemTime, setCurSystemTime] = useState(() => dayjs().format("YYYY-MM-DD HH:mm:ss"));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurSystemTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <em>{curSystemTime}</em>;
};

const SystemInfo: React.FC = () => {
  const OsInfo = {
    freemem: 20755597056,
    totalmem: 34359738368,
    loadavg: [0, 0.01, 0.05],
    platform: "linux",
    release: "3.10.0-1160.11.1.el7.x86_64",
    arch: "x64",
    uptime: 11939391
  };

  const [apiCounts, setApiCounts] = useState({ total: 0, today: 0, data_scope: "" });
  const memPercentage = useMemo(() => {
    return totalPercentage(OsInfo.totalmem, OsInfo.freemem);
  }, []);

  useEffect(() => {
    webSocketManager.postMessage({ type: "memStatus" });
  }, []);

  useEffect(() => {
    apiCount({}).then(res => {
      if (res.data.code === 0) {
        setApiCounts(res.data.data);
      }
    });
  }, []);

  return (
    <Row gutter={[12, 12]} align="stretch">
      <Col xs={24} md={8} className={styles.col}>
        <div className={styles.cardContainer}>
          <div className={styles.Gcontainer}>
            <div className={styles.Ginner}></div>
            <div className={styles.Gafter}></div>
            <div className={styles.GinnerText}>系统参数</div>
          </div>
          <div className={styles.body}>
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
              <LiveClock />
            </div>
          </div>
        </div>
      </Col>

      <Col xs={24} md={8} className={styles.col}>
        <div className={`${styles.cardContainer} ${styles.fense}`}>
          <div className={styles.Gcontainer}>
            <div className={styles.Ginner}></div>
            <div className={styles.Gafter}></div>
            <div className={styles.GinnerText}>我的消息</div>
          </div>

          <div className={styles.body}>
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
              <em>API总调用次数 {apiCounts.total}</em>
            </div>
            <div className={styles.itemText}>
              <em>API今日调用次数 {apiCounts.today}</em>
            </div>
            {apiCounts.data_scope ? (
              <div className={styles.itemText}>
                <em>{apiCounts.data_scope === "all" ? "全站统计，含匿名访问" : `${dataScopeLabel(apiCounts.data_scope)}，不含匿名访问`}</em>
              </div>
            ) : null}
          </div>
        </div>
      </Col>
      <Col xs={24} md={8} className={styles.col}>
        <div className={`${styles.cardContainer} ${styles.zise}`}>
          <div className={styles.Gcontainer}>
            <div className={styles.Ginner}></div>
            <div className={styles.Gafter}></div>
            <div className={styles.GinnerText}>内存使用率</div>
          </div>
          <div className={styles.body}>
            <div className={styles.mem}>
              <Progress type="circle" percent={memPercentage} strokeColor={statusColor(memPercentage)} format={percent => percent + "%"} />
              <div className={styles.surplus}>剩余{formatBytes(OsInfo.freemem)}</div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default SystemInfo;
