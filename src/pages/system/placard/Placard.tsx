import React, { FC, useEffect, useState } from 'react';
import './Placard.less';
import { broadcastPlacard, findAllTypePlacardList } from 'api/nest-admin/placard';
import { Button, message, Table, Tag } from 'antd';
import PlacardEditModal from './PlacardEditModal';
import moment from 'moment';
import { webSocketManager } from 'utils/websocket';

interface PlacardData {
  created: string;
  description: string;
  id: number;
  origin: string;
  placardid: string;
  status: string;
  title: string;
  yetypear: string;
}
const Placard: FC = () => {
  const columns: any = [
    {
      title: 'ID',
      dataIndex: 'id'
    },
    {
      title: '内容',
      dataIndex: 'description'
    },
    {
      title: '类型',
      dataIndex: 'type',
      responsive: ['xxl', 'xl', 'lg', 'md'],
      render: (text: any) => {
        if (text === 'system') {
          return <Tag color="#87d068">系统公告</Tag>;
        }
        if (text === 'notification') {
          return <Tag color="#108ee9">普通通知</Tag>;
        }
        return <Tag color="#f50">未知</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status'
    },
    {
      title: '发布者',
      dataIndex: 'originName'
    },
    {
      title: '创建时间',
      dataIndex: 'created'
    },
    {
      title: '发布时间',
      dataIndex: 'broadcastime',
      render: (data: any) => {
        if (data === '0') {
          return '----';
        }
        return moment(parseInt(data)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      render: (data: any) => {
        return (
          <Button type="primary" className="topbtn" onClick={() => submitPlacard(data)}>
            发送
          </Button>
        );
      }
    }
  ];
  const [placardData, setPlacardData] = useState<PlacardData[]>([]);
  const [isEdit, setisEdit] = useState<boolean>(false);
  const [update, setUpdate] = useState(0);
  const findAllPlacards = async () => {
    setPlacardData([]);
    const result = await findAllTypePlacardList({
      type: 'system',
      status: 'preparation'
    });
    if (result.data.code === 200) {
      setPlacardData(result.data.data);
    }
  };
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const addPlacardItem = () => {
    setisEdit(false);
    setModalVisible(true);
  };

  const pendingCallback = () => {
    setModalVisible(false);
  };
  const submitPlacard = async (record: any) => {
    const result = await broadcastPlacard(record);
    if (result.data.code === 200) {
      message.info('发布成功');
      webSocketManager.postMessage({
        name: 'qkstartCar',
        type: 'broadcastPlacard',
        message: '',
        data: record
      });
    } else {
      message.info(result.data.message);
    }
    setUpdate(update + 1);
  };
  useEffect(() => {
    findAllPlacards();
    return () => {};
  }, [update]);

  return (
    <div className="Placard">
      <Button type="primary" className="topbtn" onClick={findAllPlacards}>
        查询公告
      </Button>
      <Button type="primary" className="topbtn" onClick={addPlacardItem}>
        添加公告
      </Button>
      <Table
        columns={columns}
        dataSource={placardData}
        rowKey={(record: PlacardData) => record.placardid}
        bordered={true}
        className="menutable"
        pagination={{ pageSize: 18 }}
      />
      <PlacardEditModal visible={modalVisible} isEdit={isEdit} pendingCallback={pendingCallback} />
    </div>
  );
};

export default Placard;
