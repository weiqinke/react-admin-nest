import React, { FC, useState, useEffect, useRef } from 'react';
import { Tabs, Dropdown, Badge, Spin, List, Avatar, Tag } from 'antd';
import { BellOutlined, LoadingOutlined } from '@ant-design/icons';
import { getNoticeList } from 'api/nest-admin/User';
import { Notice, EventStatus } from 'interface/layout/notice.interface';
import { useAppState } from 'stores';
import './notice.less';

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
    getNoticeList({})
      .then(result => {
        setLoading(false);
        if (result.status && result.data.data) {
          setNoticeList(result.data.data);
        }
      })
      .catch(() => {
        setLoading(false);
        const list: any = [
          {
            id: '000000001',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
            title: '你收到了 14 份新周报',
            datetime: '2017-08-09',
            type: 'notification'
          },
          {
            id: '000000002',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
            title: '你推荐的 曲妮妮 已通过第三轮面试',
            datetime: '2017-08-08',
            type: 'notification'
          },
          {
            id: '000000003',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
            title: '这种模板可以区分多种通知类型',
            datetime: '2017-08-07',
            read: true,
            type: 'notification'
          },
          {
            id: '000000004',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
            title: '左侧图标用于区分不同的类型',
            datetime: '2017-08-07',
            type: 'notification'
          },
          {
            id: '000000005',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
            title: '内容不要超过两行字，超出时自动截断',
            datetime: '2017-08-07',
            type: 'notification'
          },
          {
            id: '000000006',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '曲丽丽 评论了你',
            description: '描述信息描述信息描述信息',
            datetime: '2017-08-07',
            type: 'message',
            clickClose: true
          },
          {
            id: '000000007',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '朱偏右 回复了你',
            description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
            datetime: '2017-08-07',
            type: 'message',
            clickClose: true
          },
          {
            id: '000000008',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '标题',
            description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
            datetime: '2017-08-07',
            type: 'message',
            clickClose: true
          },
          {
            id: '000000009',
            title: '任务名称',
            description: '任务需要在 2017-01-12 20:00 前启动',
            extra: '未开始',
            status: 'todo',
            type: 'event'
          },
          {
            id: '000000010',
            title: '第三方紧急代码变更',
            description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
            extra: '马上到期',
            status: 'urgent',
            type: 'event'
          },
          {
            id: '000000011',
            title: '信息安全考试',
            description: '指派竹尔于 2017-01-09 前完成更新并发布',
            extra: '已耗时 8 天',
            status: 'doing',
            type: 'event'
          },
          {
            id: '000000012',
            title: 'ABCD 版本发布',
            description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
            extra: '进行中',
            status: 'processing',
            type: 'event'
          }
        ];
        setNoticeList(list);
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
    <div className="topNotice">
      <Spin tip="Loading..." indicator={antIcon} spinning={loading}>
        <Tabs defaultActiveKey="1">
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
      <Badge count={noticeList.length || noticeCount} overflowCount={999}>
        <span className="notice" id="notice-center">
          <BellOutlined style={{ fontSize: '22px', color: '#fff' }} />
        </span>
      </Badge>
    </Dropdown>
  );
};

export default HeaderNoticeComponent;
