import { getLoginStats } from "@/api/goadmin";
import { exportLoginLogsCsv } from "@/api/impexp";
import { loginlog } from "@/api/log";
import { dataScopeLabel } from "@/api/platform";
import { LoginFrequencyChart } from "@/components/Echarts";
import { getDateTimeFormat } from "@/utils/core";
import { Alert, Button, Table, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const LoginLog = () => {
  const columns: any = [
    {
      title: "昵称",
      dataIndex: "name",
      width: 120,
      ellipsis: true
    },
    {
      title: "浏览器版本",
      dataIndex: "bowser",
      ellipsis: true,
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: "来源",
      dataIndex: "host",
      width: 140,
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: "登录设备",
      dataIndex: "os",
      width: 120,
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: "国家",
      dataIndex: "country",
      width: 90,
      responsive: ["md", "lg", "xl", "xxl"]
    },
    {
      title: "省份",
      dataIndex: "province",
      width: 90,
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: "市区",
      dataIndex: "city",
      width: 90,
      responsive: ["lg", "xl", "xxl"]
    },
    {
      title: "登录时间",
      dataIndex: "created",
      width: 180,
      render: item => {
        return <span>{getDateTimeFormat(new Date(item).valueOf())}</span>;
      }
    }
  ];

  const [dataSource, setDataSource] = useState<any[]>();
  const [dataScope, setDataScope] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const from = dayjs().subtract(15, "days").format("YYYY-MM-DD");
  const to = dayjs().add(1, "days").format("YYYY-MM-DD");

  const getLog = () => {
    loginlog({ from, to, page_size: 100 })
      .then(r => {
        if (r.data.code === 0) {
          setDataSource([...(r?.data?.data || [])].reverse());
          setDataScope(r.data.data_scope || "");
        }
      })
      .catch(() => setDataSource([]));
    getLoginStats({ from, to }, { skipErrorMessage: true })
      .then(r => {
        if (r.data.code !== 0) return;
        setSummary(r.data.data?.summary || null);
        if (r.data.data?.data_scope) setDataScope(r.data.data.data_scope);
      })
      .catch(() => undefined);
  };
  useEffect(getLog, []);

  return (
    <div>
      {dataScope ? (
        <Alert
          className="mb-3"
          type="info"
          showIcon
          title={`当前数据范围：${dataScopeLabel(dataScope)}${
            summary ? `。近 15 天 ${summary.total || 0} 次，成功 ${summary.success || 0}，失败 ${summary.fail || 0}` : ""
          }`}
        />
      ) : null}
      <div className="admin-toolbar" style={{ justifyContent: "flex-end" }}>
        <Button
          loading={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              await exportLoginLogsCsv({ from, to }, `login-logs-${dayjs().format("YYYYMMDD")}.csv`);
            } catch {
              message.error("导出失败");
            } finally {
              setExporting(false);
            }
          }}>
          导出 CSV
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={dataSource} scroll={{ x: 900 }} />
      <div style={{ marginTop: 12 }}>
        <LoginFrequencyChart dataSource={dataSource} />
      </div>
    </div>
  );
};

export default LoginLog;
