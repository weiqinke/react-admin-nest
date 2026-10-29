import { getAuditLog, listAuditLogs, listAuditModules, exportAuditLogsURL } from "@/api/audit";
import { getAccessToken } from "@/api/session";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, DatePicker, Drawer, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "操作审计" }];

const AuditAdmin: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [module, setModule] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const [result, setResult] = useState<string | undefined>();
  const [actor, setActor] = useState("");
  const [keyword, setKeyword] = useState("");
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>([dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")]);
  const [modules, setModules] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>();

  const queryBase = () => ({
    page_size: 20,
    module,
    action,
    result,
    actor,
    keyword,
    from: range?.[0]?.format("YYYY-MM-DD"),
    to: range?.[1]?.format("YYYY-MM-DD")
  });

  const findAll = (nextPage = page) => {
    listAuditLogs({ ...queryBase(), page: nextPage })
      .then(res => {
        if (res.data.code !== 0) return;
        setDataSource(res.data.data?.list || []);
        setTotal(res.data.data?.total || 0);
        setPage(nextPage);
      })
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    listAuditModules()
      .then(res => {
        if (res.data.code === 0) setModules(res.data.data?.modules || []);
      })
      .catch(() => undefined);
    findAll(1);
  }, []);

  const openDetail = (row: any) => {
    getAuditLog(row.id).then(res => {
      if (res.data.code === 0) setDetail(res.data.data);
      else message.error(res.data.message || "加载详情失败");
    });
  };

  const onExport = () => {
    const token = getAccessToken();
    const url = exportAuditLogsURL(queryBase());
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async resp => {
        if (!resp.ok) throw new Error("export failed");
        const blob = await resp.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `audit-logs-${dayjs().format("YYYYMMDD")}.csv`;
        a.click();
        URL.revokeObjectURL(href);
      })
      .catch(() => message.error("导出失败"));
  };

  const actionOptions =
    modules
      .find((item: any) => item.code === module)
      ?.actions?.map((value: string) => ({ value, label: value })) || [];

  const columns: any = [
    {
      title: "时间",
      dataIndex: "occurred_at",
      width: 170,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "—")
    },
    { title: "操作者", dataIndex: "actor_username", width: 120 },
    { title: "模块", dataIndex: "module", width: 110 },
    { title: "动作", dataIndex: "action", width: 140 },
    {
      title: "对象",
      render: (row: any) => row.target_name || row.target_id || "—"
    },
    {
      title: "结果",
      dataIndex: "result",
      width: 90,
      render: (v: string) => (v === "failure" ? <Tag color="#f50">失败</Tag> : <Tag color="#87d068">成功</Tag>)
    },
    { title: "IP", dataIndex: "ip", responsive: ["lg"], width: 130 },
    {
      title: "操作",
      width: 90,
      render: (row: any) => (
        <Button size="small" type="link" onClick={() => openDetail(row)}>
          详情
        </Button>
      )
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} introduction="记录管理端写操作与失败原因，可按模块筛选并导出 CSV。" />
      <Space size={[8, 16]} className="mb-3" wrap>
        <DatePicker.RangePicker value={range as any} onChange={value => setRange(value as any)} />
        <Select
          allowClear
          placeholder="模块"
          style={{ width: 140 }}
          value={module}
          onChange={value => {
            setModule(value);
            setAction(undefined);
          }}
          options={modules.map((item: any) => ({ value: item.code, label: item.name || item.code }))}
        />
        <Select
          allowClear
          placeholder="动作"
          style={{ width: 160 }}
          value={action}
          onChange={setAction}
          options={actionOptions}
          disabled={!module}
        />
        <Select
          allowClear
          placeholder="结果"
          style={{ width: 120 }}
          value={result}
          onChange={setResult}
          options={[
            { value: "success", label: "成功" },
            { value: "failure", label: "失败" }
          ]}
        />
        <Input allowClear placeholder="操作者" value={actor} onChange={e => setActor(e.target.value)} style={{ width: 140 }} />
        <Input allowClear placeholder="关键词" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 160 }} />
        <Button type="primary" onClick={() => findAll(1)}>
          查询
        </Button>
        <Button onClick={onExport}>导出 CSV</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ current: page, total, pageSize: 20, onChange: next => findAll(next) }}
      />
      <Drawer title="审计详情" open={Boolean(detail)} width={520} onClose={() => setDetail(null)}>
        {detail && (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Typography.Text>时间：{dayjs(detail.occurred_at).format("YYYY-MM-DD HH:mm:ss")}</Typography.Text>
            <Typography.Text>
              操作者：{detail.actor_username || "—"} ({detail.actor_user_id || "—"})
            </Typography.Text>
            <Typography.Text>
              动作：{detail.module}.{detail.action}
            </Typography.Text>
            <Typography.Text>
              对象：{[detail.target_type, detail.target_id, detail.target_name].filter(Boolean).join(" / ") || "—"}
            </Typography.Text>
            <Typography.Text>
              结果：{detail.result === "failure" ? "失败" : "成功"}
              {detail.error_code ? ` (${detail.error_code})` : ""}
            </Typography.Text>
            {detail.error_message && <Typography.Text type="danger">错误：{detail.error_message}</Typography.Text>}
            <Typography.Text>IP：{detail.ip || "—"}</Typography.Text>
            <Typography.Text>Request ID：{detail.request_id || "—"}</Typography.Text>
            <Typography.Paragraph>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(detail.detail || {}, null, 2)}
              </pre>
            </Typography.Paragraph>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AuditAdmin;
