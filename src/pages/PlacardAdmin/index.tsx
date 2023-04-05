import React, { FC, useEffect, useState } from "react";
import { Button, message, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { PlacardEditModal } from "@/components/Modals";
import { webSocketManager } from "@/utils/ws";
import { broadcastPlacard, getAllPlacard } from "@/api/caravan/Placard";

import styles from "./index.module.scss";

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

const PlacardAdmin: FC = () => {
  const columns: any = [
    {
      title: "ID",
      dataIndex: "id"
    },
    {
      title: "内容",
      dataIndex: "description"
    },
    {
      title: "类型",
      dataIndex: "type",
      responsive: ["xxl", "xl", "lg", "md"],
      render: (text: any) => {
        if (text === "system") return <Tag color="#87d068">系统公告</Tag>;
        if (text === "notification") return <Tag color="#108ee9">普通通知</Tag>;
        return <Tag color="#f50">未知</Tag>;
      }
    },
    {
      title: "状态",
      dataIndex: "status"
    },
    {
      title: "发布者",
      dataIndex: "originName"
    },
    {
      title: "创建时间",
      dataIndex: "created",
      render: (data: any) => dayjs(parseInt(data)).format("YYYY-MM-DD HH:mm")
    },
    {
      title: "发布时间",
      dataIndex: "broadcastime",
      render: (data: any) => {
        if (data === "0") return "----";
        return dayjs(parseInt(data)).format("YYYY-MM-DD HH:mm");
      }
    },
    {
      title: "操作",
      render: (data: any) => {
        return (
          <Button type="primary" className="topbtn" onClick={() => submitPlacard(data)}>
            发送
          </Button>
        );
      }
    }
  ];
  const [dataSource, setDataSource] = useState<PlacardData[]>([]);
  const [placard, setPlacard] = useState<any>();

  const findAllPlacards = () => {
    getAllPlacard({ type: "system", status: "preparation" })
      .then(result => {
        if (result.data.code === 200) setDataSource(result.data.data);
      })
      .catch(err => setDataSource([]));
  };
  useEffect(findAllPlacards, []);

  const submitPlacard = async (record: any) => {
    const result = await broadcastPlacard(record);
    if (result.data.code === 200) {
      message.info("发布成功");
      webSocketManager.postMessage({
        type: "BroadcastPlacard",
        data: record
      });
    } else {
      message.info(result.data.message);
    }
    findAllPlacards();
  };

  const onOk = () => {
    setPlacard(null);
    findAllPlacards();
  };

  return (
    <div className={styles.placard}>
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" className="topbtn" onClick={findAllPlacards}>
          查询公告
        </Button>
        <Button type="primary" className="topbtn" onClick={() => setPlacard({})}>
          添加公告
        </Button>
      </Space>

      <Table columns={columns} dataSource={dataSource} rowKey="placardid" bordered={true} pagination={{ pageSize: 20 }} />
      {placard && <PlacardEditModal placard={placard} onCancel={() => setPlacard(null)} onOk={onOk} />}
    </div>
  );
};

export default PlacardAdmin;
