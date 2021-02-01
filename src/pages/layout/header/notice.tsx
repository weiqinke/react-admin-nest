import React, { FC, useState, useEffect, useRef } from 'react';
import { Tabs, Dropdown, Badge, Spin, List, Avatar, Tag } from 'antd';
import { BellOutlined, LoadingOutlined } from '@ant-design/icons';
import { getNoticeList } from 'api/nest-admin/User';
import { Notice, EventStatus } from 'interface/layout/notice.interface';
import { useAppState } from 'stores';

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
    }, 1000 * 60);
    getNoticeList({})
      .then(result => {
        setLoading(false);
        if (result.status && result.data.data) {
          setNoticeList(result.data.data);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getNotice();
  }, [noticeNum]);

  useEffect(() => {
    return () => {
      clearTimeout(intervalHandle.current);
    };
  }, []);

  const tabs = (
    <div>
      <Spin tip="Loading..." indicator={antIcon} spinning={loading}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={`通知(${noticeListFilter('notification').length})`} key="1">
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
              dataSource={noticeListFilter('message')}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href={item.title}>{item.title}</a>}
                    description={
                      <div className="notice-description">
                        <div className="notice-description-content">{item.description}</div>
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
        padding: 8,
        borderRadius: 4
      }}
    >
      <Badge count={noticeNum || noticeCount} overflowCount={999}>
        <span className="notice" id="notice-center">
          <BellOutlined style={{ fontSize: '22px', color: '#fff' }} />
        </span>
      </Badge>
    </Dropdown>
  );
};

export default HeaderNoticeComponent;
