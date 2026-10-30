import { hasPermission } from "@/api/announcement";
import { listJobRuns, listJobs, runJob, setJobEnabled } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, Drawer, Space, Switch, Table, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "定时任务" }];

function intervalText(seconds: number) {
  if (!seconds) return "—";
  if (seconds % 86400 === 0) return `${seconds / 86400} 天`;
  if (seconds % 3600 === 0) return `${seconds / 3600} 小时`;
  return `${seconds} 秒`;
}

const JobAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const canWrite = hasPermission("job:write");

  const load = () => {
    listJobs()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  const openRuns = (jobCode: string) => {
    setCode(jobCode);
    listJobRuns(jobCode, 20)
      .then(res => setRuns(res.data?.data?.list || []))
      .catch(() => setRuns([]));
  };

  useEffect(() => {
    load();
  }, []);

  const columns: any = [
    { title: "任务", dataIndex: "name" },
    { title: "编码", dataIndex: "code" },
    {
      title: "间隔",
      dataIndex: "interval_seconds",
      width: 100,
      render: (value: number) => intervalText(value)
    },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 90,
      render: (enabled: boolean, row: any) => (
        <Switch
          checked={Boolean(enabled)}
          disabled={!canWrite}
          onChange={async checked => {
            await setJobEnabled(row.code, checked);
            message.success(checked ? "已启用" : "已停用");
            load();
          }}
        />
      )
    },
    {
      title: "最近结果",
      dataIndex: "last_status",
      width: 110,
      render: (value: string) => (value ? <Tag color={value === "success" ? "green" : "red"}>{value === "success" ? "成功" : "失败"}</Tag> : "—")
    },
    { title: "最近执行", dataIndex: "last_run_at", responsive: ["lg"], width: 180, render: (value: string) => value || "—" },
    { title: "错误", dataIndex: "last_error", ellipsis: true, responsive: ["lg"], render: (value: string) => value || "—" },
    {
      title: "操作",
      width: 180,
      render: (row: any) => (
        <Space>
          {canWrite ? (
            <Button
              size="small"
              type="primary"
              onClick={async () => {
                await runJob(row.code);
                message.success("已执行");
                load();
              }}>
              立即执行
            </Button>
          ) : null}
          <Button size="small" onClick={() => openRuns(row.code)}>
            记录
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction
        infos={infos}
        introduction="任务按固定间隔在本进程内执行。停用后不再自动跑，仍可以手动执行一次。日志保留（log.purge）按系统参数 log.retention_days 清理登录日志、操作审计和访问日志；参数为 0 时结果是 skipped=1。"
      />
      <div className="mt-3 bg-white p-3">
        <Table rowKey="code" columns={columns} dataSource={list} pagination={false} />
      </div>
      <Drawer open={Boolean(code)} title={code ? `${code} 的执行记录` : "执行记录"} size={640} onClose={() => setCode("")}>
        <Table
          rowKey="id"
          dataSource={runs}
          pagination={false}
          columns={[
            { title: "开始", dataIndex: "started_at" },
            { title: "结束", dataIndex: "finished_at" },
            {
              title: "结果",
              dataIndex: "status",
              width: 90,
              render: (value: string) => <Tag color={value === "success" ? "green" : "red"}>{value === "success" ? "成功" : "失败"}</Tag>
            },
            { title: "说明", dataIndex: "message", ellipsis: true }
          ]}
        />
      </Drawer>
    </div>
  );
};

export default JobAdmin;
