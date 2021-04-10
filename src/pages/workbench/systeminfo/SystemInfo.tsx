import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './style.scss';
import bytes from 'bytes';
import moment from 'moment';
import { Row, Col, Card, Progress, Empty } from 'antd';
import { totalPercentage } from 'utils/core';

const statusColor = (percentage: number) => {
  if (percentage < 40) return '#52c41a';
  if (percentage < 80) return '#ffa500';
  return '#f50';
};
let timer: any;
const fetchinfo = {
  mysqlVersion: '5.7.31',
  currentSystemTime: 3616206185635,
  platform: 'linux',
  type: 'Linux',
  hostname: 'VM-0-14-centos',
  arch: '64',
  nodeVersion: 'v14.12.0',
  cpus: [
    {
      model: 'Intel(R) Xeon(R) CPU Platinum 8280L',
      speed: 2394,
      times: { user: 197855420, nice: 61270, sys: 140104620, idle: 15165295990, irq: 0 }
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
const SystemInfo: React.FC<{
  OsInfo: OSINFO;
}> = ({ OsInfo }) => {
  const [curSystemTime, setCurSystemTime] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const memPercentage = useMemo(() => {
    return totalPercentage(OsInfo.totalmem, OsInfo.freemem);
  }, [OsInfo]);

  // 倒计时
  const countdown = useCallback(() => {
    clearTimeout(timer);
    const timeDiff = fetchinfo.currentSystemTime + (Date.now() - fetchinfo.currentSystemTime);
    setCurSystemTime(moment(timeDiff).format('YYYY-MM-DD HH:mm:ss'));

    timer = setTimeout(() => {
      countdown();
    }, 1000);
  }, []);

  useEffect(() => {
    countdown();

    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  useEffect(() => {
    setLoading(false);
    const message: any = [
      { id: '1', content: 'CPU Intel(R) Xeon(R) Platinum 8280L 正常' },
      { id: '2', content: '最近5、10、15分钟平均负载 正常' },
      { id: '3', content: '内存 正常' },
      { id: '4', content: '欢迎登陆' }
    ];
    setMessageList(message);
  }, []);

  return (
    <Row gutter={{ xs: 8, sm: 16, md: 24 }} className="system-data">
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title="系统参数" hoverable loading={!fetchinfo.nodeVersion}>
          <p className="item-text">
            <em>系统类型：</em>
            {OsInfo.platform}_{OsInfo.arch}
          </p>
          <p className="item-text">
            <em>Node版本：</em>
            {fetchinfo.nodeVersion}
          </p>
          <p className="item-text">
            <em>MySQL版本：</em>
            {fetchinfo.mysqlVersion}
          </p>
          <p className="item-text">
            <em>当前环境：</em>
            {false ? '生产环境' : '开发环境'}
          </p>
          <p className="item-text">
            <em>系统时间：</em>
            {curSystemTime}
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title="我的消息" hoverable loading={loading}>
          {messageList.length > 0 ? (
            messageList.map((msg: any) => (
              <p className="item-text" key={msg.id}>
                <em>{msg.content}</em>
              </p>
            ))
          ) : (
            <Empty />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Card title={`内存使用率(${memPercentage}%)`} hoverable className="mem">
          <Progress
            type="circle"
            percent={memPercentage}
            strokeColor={statusColor(memPercentage)}
            format={percent => percent + '%'}
          />
          <div className="surplus">剩余{bytes(OsInfo.freemem)}</div>
        </Card>
      </Col>
    </Row>
  );
};

export default SystemInfo;
