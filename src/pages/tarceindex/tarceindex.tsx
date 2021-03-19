import React, { Component } from 'react';
import { Layout, Row, Col, Divider } from 'antd';
import { WechatOutlined, QqOutlined, DingdingOutlined, WeiboOutlined, FullscreenOutlined } from '@ant-design/icons';
import screenfull from 'screenfull';
import CountUp from 'react-countup';
import EchartsLine from './line';
import './index.scss';
import EchartsBar from './bar';
import EchartsPie from './pie';
import EchartsScatter from './scatter';
import EchartsPictorialBar from './pictorialBar';

class TarceIndex extends Component {
  fullToggle = () => {
    if (screenfull.isEnabled) {
      const dom: any = document.getElementById('bar');
      screenfull.request(dom);
    }
  };
  toMygit = () => {
    window.open('https://github.com/weiqinke/react-admin-nest', 'topFrame');
  };
  render() {
    return (
      <Layout className="index animated fadeIn">
        <Row gutter={24} className="index-header">
          <Col span={6}>
            <div className="base-style wechat">
              <WechatOutlined className="icon-style" />
              <div>
                <CountUp end={69999} start={0} className="card-panel-num" />
                <div className="base-title">微信</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className="base-style qq">
              <QqOutlined className="icon-style" />
              <div>
                <CountUp end={30366} start={0} className="card-panel-num" />
                <div className="base-title">QQ</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className="base-style weibo">
              <WeiboOutlined className="icon-style" />
              <div>
                <CountUp end={2333} start={0} className="card-panel-num" />
                <div className="base-title">微博</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className="base-style dingding">
              <DingdingOutlined className="icon-style" />
              <div>
                <CountUp end={9666} start={0} className="card-panel-num" />
                <div className="base-title">钉钉</div>
              </div>
              <span onClick={this.toMygit} className="github-corner"></span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="base-style">
              <div className="bar-header">
                <div>图形全屏展示</div>
                <FullscreenOutlined style={{ cursor: 'pointer', fontSize: '25px' }} onClick={this.fullToggle} />
              </div>
              <Divider />
              <EchartsBar />
            </div>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <div className="base-style">
              <EchartsLine />
            </div>
          </Col>
          <Col span={12}>
            <div className="base-style">
              <EchartsPie />
            </div>
          </Col>
          <Col span={12}>
            <div className="base-style">
              <EchartsScatter />
            </div>
          </Col>
          <Col span={12}>
            <div className="base-style">
              <EchartsPictorialBar />
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default TarceIndex;
