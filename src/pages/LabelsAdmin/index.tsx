import React, { FC, useEffect, useState } from "react";
import { Button, Space, Table, Tag } from "antd";
import { getalllabelsbyuser } from "@/api/caravan/Labels";
import { isTagVisible } from "@/utils/core";
import { OperationLabelModal } from "@/components/Modals";

import styles from "./index.module.scss";

const LabelsAdmin: FC = () => {
  const [dataSource, setDataSource] = useState([]);
  const [label, setLabel] = useState<any>();

  const findAll = () => {
    setLabel(null);
    getalllabelsbyuser({})
      .then(res => setDataSource(res.data.data || []))
      .catch(() => setDataSource([]));
  };
  useEffect(findAll, []);

  const columns: any = [
    {
      title: "标签名称",
      dataIndex: "title"
    },
    {
      title: "备注",
      dataIndex: "description",
      responsive: ["lg"]
    },
    {
      title: "排序",
      dataIndex: "sort",
      responsive: ["lg"]
    },
    {
      title: "是否可见",
      dataIndex: "visible",
      render: (item: any) => (isTagVisible(item) ? <Tag color="#f50">隐藏</Tag> : <Tag color="#2db7f5">显示</Tag>)
    },
    {
      title: "操作",
      render: (item: any) => (
        <Button size="small" type="primary" onClick={() => setLabel(item)} style={{ marginRight: "10px" }}>
          编辑
        </Button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <Space size={[8, 16]} className={styles.header}>
        <Button type="primary" onClick={() => setLabel({})}>
          添加标签
        </Button>
        <Button type="primary" onClick={findAll}>
          查询标签
        </Button>
      </Space>
      <Table columns={columns} dataSource={dataSource} rowKey="id"></Table>
      {label && <OperationLabelModal label={label} onCancel={() => setLabel(null)} onOk={findAll} />}
    </div>
  );
};

export default LabelsAdmin;
