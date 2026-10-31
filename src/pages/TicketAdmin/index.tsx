import { dataScopeLabel, listTickets, ticketOverdue, TICKET_PRIORITY, TICKET_STATUS } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import TicketPanel from "@/components/TicketPanel";
import { Alert, Button, Input, Select, Table, Tag } from "antd";
import dayjs from "dayjs";
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
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [overdue, setOverdue] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [dataScope, setDataScope] = useState("");

  const query = (nextPage = page) => ({
    page: nextPage,
    page_size: 20,
    keyword: keyword.trim() || undefined,
    status,
    priority,
    overdue
  });

  const load = (nextPage = page) => {
    listTickets(query(nextPage))
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setDataScope(res.data?.data?.data_scope || "");
        setPage(nextPage);
      })
      .catch(() => setList([]));
  };

  useEffect(() => {
    load(1);
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
    {
      title: "截止",
      dataIndex: "due_at",
      width: 180,
      responsive: ["lg"],
      render: (value: string, row: any) => {
        if (!value) return "—";
        return (
          <span>
            {dayjs(value).format("YYYY-MM-DD HH:mm")}
            {ticketOverdue(row) ? (
              <Tag color="red" className="ml-1">
                已过期
              </Tag>
            ) : null}
          </span>
        );
      }
    },
    { title: "更新时间", dataIndex: "updated_at", responsive: ["xl"], width: 180 },
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
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="列表已按当前角色的数据范围过滤。可按标题、优先级和是否过期筛选。过期不会自动关单。指定处理人会给他发待办；留言成功后对方会收到站内信。"
      />
      {dataScope ? <Alert className="mt-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} /> : null}
      <div className="admin-card">
        <div className="admin-toolbar">
          <Input allowClear placeholder="标题包含" style={{ width: 180 }} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => load(1)} />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 140 }}
            value={status}
            options={Object.entries(TICKET_STATUS).map(([value, label]) => ({ value, label }))}
            onChange={value => setStatus(value)}
          />
          <Select
            allowClear
            placeholder="优先级"
            style={{ width: 120 }}
            value={priority}
            options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))}
            onChange={value => setPriority(value)}
          />
          <Select
            allowClear
            placeholder="截止"
            style={{ width: 140 }}
            value={overdue}
            options={[{ value: "1", label: "仅已过期" }]}
            onChange={value => setOverdue(value)}
          />
          <Button type="primary" onClick={() => load(1)}>
            查询
          </Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={list} scroll={{ x: 900 }} pagination={{ current: page, total, pageSize: 20, onChange: next => load(next) }} />
      </div>
      {current ? <TicketPanel ticketId={current} onClose={() => setCurrent("")} onChanged={() => load()} /> : null}
    </div>
  );
};

export default TicketAdmin;
