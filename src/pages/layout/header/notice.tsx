import React, { FC, useState, useEffect, useRef } from 'react';
import { Tabs, Dropdown, Badge, Spin, List, Avatar, Tag } from 'antd';
import { BellOutlined, LoadingOutlined } from '@ant-design/icons';
import { Notice, EventStatus } from 'interface/layout/notice.interface';
import { useAppState } from 'stores';
import './notice.less';
import { getallnotices, getUidNotices } from 'api/nest-admin/Notice';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { TabPane } = Tabs;
const HeaderNoticeComponent: FC = () => {
  const [visible, setVisible] = useState(false);
  const [noticeList, setNoticeList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const { noticeCount } = useAppState(state => state.user);
  const intervalHandle: any = useRef(null);
  const [noticeNum, setNoticeNum] = useState(0);
  const noticeListFilter = <T extends Notice['type']>(type: T) => {
    return noticeList.filter(notice => notice.type === type) as Notice<T>[];
  };
  const getNotice = async () => {
    //查看我是否有新消息 无论如何
    setLoading(true);
    //无论如何，清掉定时器,使用了 ref,肯定能拿到指针。
    //并且启动一个定时器，定时刷新我的消息
    clearTimeout(intervalHandle.current);
    intervalHandle.current = setTimeout(() => {
      setNoticeNum(Math.ceil(Math.random() * 1000));
    }, 1000 * 60 * 60);
    getUidNotices()
      .then(result => {
        setLoading(false);
        if (result.status && result.data && Array.isArray(result.data.data)) {
          setNoticeList(result.data.data);
        }
      })
      .catch(() => {
        setLoading(false);
      });
    getallnotices();
  };

  useEffect(() => {
    getNotice();
  }, [noticeNum]);

  useEffect(() => {
    return () => {
      clearTimeout(intervalHandle.current);
    };
  }, []);
  const onClear = () => {};
  const onViewMore = () => {};
  const tabs = (
    <div className="topNotice">
      <Spin tip="Loading..." indicator={antIcon} spinning={loading}>
        <Tabs defaultActiveKey="1" className="antdtabbar">
          <TabPane tab={`通知( ${noticeListFilter('notification').length})`} key="1">
            <List
              dataSource={noticeListFilter('notification')}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href={item.title}>{item.title}</a>}
                    description={item.datetime}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={`消息(${noticeListFilter('message').length})`} key="2">
            <List
              dataSource={noticeListFilter('message').slice(0, 5)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={'http://image.weiqinke.top/qkstartimg/Avatar/' + item.originUid + '-Avatar.png'} />
                    }
                    title={<span>{item.title}</span>}
                    description={
                      <div className="notice-description">
                        <div className="notice-description-content">
                          {item.description.slice(0, 50)} {item.description.length > 50 ? '......' : ''}
                        </div>
                        <div className="notice-description-datetime">{item.datetime}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={`待办(${noticeListFilter('event').length})`} key="3">
            <List
              dataSource={noticeListFilter('event')}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="notice-title">
                        <div className="notice-title-content">{item.title}</div>
                        <Tag color={EventStatus[item.status]}>{item.extra}</Tag>
                      </div>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
        <div className="bottomBar">
          <div onClick={onClear}>
            <span>清空</span>
          </div>
          <div onClick={onViewMore}>
            <span>查看更多</span>
          </div>
        </div>
      </Spin>
    </div>
  );
  return (
    <Dropdown
      overlay={tabs}
      placement="bottomRight"
      trigger={['click']}
      visible={visible}
      onVisibleChange={v => setVisible(v)}
      overlayStyle={{
        width: 336,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '8px 8px 0px 8px',
        borderRadius: 4
      }}
    >
      <Badge count={noticeList.length || noticeCount} overflowCount={999}>
        <span className="notice" id="notice-center">
          <BellOutlined style={{ fontSize: '22px', color: '#fff' }} />
        </span>
      </Badge>
    </Dropdown>
  );
};

export default HeaderNoticeComponent;
