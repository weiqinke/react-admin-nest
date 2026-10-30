import { listTickets, TICKET_PRIORITY, TICKET_STATUS } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Button, Select, Space, Table, Tag } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "工单处理" }];

const statusColor: Record<string, string> = {
  open: "gold",
  assigned: "blue",
  processing: "cyan",
  closed: "default"
};

const TicketAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const [current, setCurrent] = useState("");

  const load = (next = page, nextStatus = status) => {
    listTickets({ page: next, page_size: 20, status: nextStatus })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setPage(next);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    listTickets({ page: 1, page_size: 20 })
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setPage(1);
      })
      .catch(() => setList([]));
  }, []);

  const columns: any = [
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 90,
      render: (value: string) => TICKET_PRIORITY[value] || value
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: string) => <Tag color={statusColor[value] || "default"}>{TICKET_STATUS[value] || value}</Tag>
    },
    { title: "更新时间", dataIndex: "updated_at", responsive: ["lg"], width: 180 },
    {
      title: "操作",
      width: 90,
      render: (row: any) => (
        <Button size="small" type="primary" onClick={() => setCurrent(String(row.id))}>
          处理
        </Button>
      )
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} introduction="待处理工单可以分派或直接开始处理，处理中的工单只能关闭。关闭时要填写原因。" />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 140 }}
            value={status}
            options={Object.entries(TICKET_STATUS).map(([value, label]) => ({ value, label }))}
            onChange={value => setStatus(value)}
          />
          <Button type="primary" onClick={() => load(1, status)}>
            查询
          </Button>
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{ current: page, total, pageSize: 20, onChange: next => load(next) }}
        />
      </div>
      {current ? <TicketPanel ticketId={current} onClose={() => setCurrent("")} onChanged={() => load()} /> : null}
    </div>
  );
};

export default TicketAdmin;
