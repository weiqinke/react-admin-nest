import React, { FC, useEffect, useState } from "react";
import { Button, message, Modal, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { PlacardEditModal } from "@/components/Modals";
import { webSocketManager } from "@/utils/ws";
import {
  broadcastPlacard,
  deleteOnePlacard,
  getAllPlacard,
} from "@/api/caravan/Placard";

import styles from "./index.module.scss";
import { ExclamationCircleOutlined } from "@ant-design/icons";

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
      dataIndex: "id",
    },
    {
      title: "标题",
      dataIndex: "title",
    },
    {
      title: "内容",
      dataIndex: "description",
    },
    {
      title: "类型",
      dataIndex: "type",
      responsive: ["xxl", "xl", "lg", "md"],
      render: (text: any) => {
        if (text === "system") return <Tag color="#87d068">系统公告</Tag>;
        if (text === "notification") return <Tag color="#108ee9">普通通知</Tag>;
        return <Tag color="#f50">未知</Tag>;
      },
    },

    {
      title: "发布时间",
      dataIndex: "broadcastime",
      width: 150,
      render: (data: any) => {
        if (data === "0") return "----";
        return dayjs(parseInt(data)).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      title: "操作",
      render: (data: any) => {
        return (
          <Space>
            <Button
              type="link"
              size="small"
              className="topbtn"
              onClick={() => submitPlacard(data)}
            >
              发布
            </Button>
            <Button
              danger
              type="link"
              size="small"
              onClick={() => showDeleteConfirm(data)}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
  const [dataSource, setDataSource] = useState<PlacardData[]>([]);
  const [placard, setPlacard] = useState<any>();

  const findAllPlacards = () => {
    getAllPlacard({ type: "system", status: "preparation" })
      .then((result) => {
        if (result.data.code === 200) setDataSource(result.data.data);
      })
      .catch(() => setDataSource([]));
  };
  useEffect(findAllPlacards, []);

  const submitPlacard = async (record: any) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span>是否发布该公告？</span>,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        const result = await broadcastPlacard(record);
        if (result.data.code === 200) {
          message.info("发布成功");
          webSocketManager.postMessage({
            type: "BroadcastPlacard",
            data: record,
          });
        } else {
          message.info(result.data.message);
        }
        findAllPlacards();
      },
      onCancel() {},
    });
  };

  const onOk = () => {
    setPlacard(null);
    findAllPlacards();
  };

  const showDeleteConfirm = (item: any) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span
          style={{ color: "red", fontSize: "19px" }}
        >{`是否删除该公告？`}</span>
      ),
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await deleteOnePlacard({ id: item.id });
        if (result.data.code === 200) {
          message.info("操作成功");
          return findAllPlacards();
        }
        message.info("操作失败");
      },
      onCancel() {},
    });
  };

  return (
    <div className={styles.placard}>
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" className="topbtn" onClick={findAllPlacards}>
          查询公告
        </Button>
        <Button
          type="primary"
          className="topbtn"
          onClick={() => setPlacard({})}
        >
          添加公告
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="placardid"
        bordered={true}
        pagination={{ pageSize: 20 }}
      />
      {placard && (
        <PlacardEditModal
          placard={placard}
          onCancel={() => setPlacard(null)}
          onOk={onOk}
        />
      )}
    </div>
  );
};

export default PlacardAdmin;
