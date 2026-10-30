import { deleteLabel, listLabels, setLabelStatus } from "@/api/label";
import { OperationLabelModal } from "@/components/Modals";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "标签管理" }];

const LabelsAdmin: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [label, setLabel] = useState<any>();

  const findAll = (nextPage = page) => {
    listLabels({ page: nextPage, page_size: 20, name, status })
      .then(result => {
        if (result.data.code !== 0) return;
        setDataSource(result.data.data?.list || []);
        setTotal(result.data.data?.total || 0);
        setPage(nextPage);
      })
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAll(1);
  }, []);

  const confirmAction = (title: string, action: () => Promise<any>) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: title,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await action();
        message.success("操作成功");
        findAll();
      }
    });
  };

  const columns: any = [
    {
      title: "标签名称",
      dataIndex: "name",
      render: (text: string, row: any) => (
        <Space size={8}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: row.color || "#d9d9d9"
            }}
          />
          {text}
        </Space>
      )
    },
    {
      title: "标识",
      dataIndex: "code",
      responsive: ["lg"],
      render: (text?: string) => text || "—"
    },
    {
      title: "备注",
      dataIndex: "description",
      responsive: ["lg"],
      ellipsis: true
    },
    {
      title: "排序",
      dataIndex: "sort",
      width: 80,
      responsive: ["md"]
    },
    {
      title: "引用数",
      dataIndex: "binding_count",
      width: 90,
      responsive: ["md"]
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: string) => (value === "disabled" ? <Tag color="#f50">停用</Tag> : <Tag color="#2db7f5">启用</Tag>)
    },
    {
      title: "操作",
      width: 220,
      render: (item: any) => (
        <Space size={8} wrap>
          <Button size="small" type="primary" onClick={() => setLabel(item)}>
            编辑
          </Button>
          <Button
            size="small"
            onClick={() =>
              confirmAction(item.status === "enabled" ? "确认停用该标签？" : "确认启用该标签？", () =>
                setLabelStatus(item.id, item.status === "enabled" ? "disabled" : "enabled")
              )
            }>
            {item.status === "enabled" ? "停用" : "启用"}
          </Button>
          <Button size="small" danger onClick={() => confirmAction("确认删除该标签？删除后不可在列表中恢复。", () => deleteLabel(item.id))}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} />
      <Space size={[8, 16]} className="mb-3" wrap>
        <Button type="primary" onClick={() => setLabel({})}>
          添加标签
        </Button>
        <Input allowClear placeholder="按名称搜索" value={name} onChange={e => setName(e.target.value)} style={{ width: 180 }} />
        <Select
          allowClear
          placeholder="状态"
          value={status}
          onChange={value => setStatus(value)}
          style={{ width: 120 }}
          options={[
            { value: "enabled", label: "启用" },
            { value: "disabled", label: "停用" }
          ]}
        />
        <Button type="primary" onClick={() => findAll(1)}>
          查询
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: next => findAll(next)
        }}
      />
      {label && (
        <OperationLabelModal
          label={label}
          onCancel={() => setLabel(null)}
          onOk={() => {
            setLabel(null);
            findAll();
          }}
        />
      )}
    </div>
  );
};

export default LabelsAdmin;
