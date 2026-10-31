import { hasPermission } from "@/api/announcement";
import { TICKET_PRIORITY, TICKET_STATUS, batchAssignTickets, batchTickets, dataScopeLabel, listDepts, listTickets, ticketOverdue, toDeptTree } from "@/api/platform";
import { findUserOptions } from "@/api/user";
import TicketPanel from "@/components/TicketPanel";
import TicketStatusTag from "@/components/TicketStatusTag";
import { Alert, Button, Form, Input, Modal, Select, Space, Table, Tag, TreeSelect, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const TicketListTab: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [overdue, setOverdue] = useState<string | undefined>();
  const [current, setCurrent] = useState("");
  const [dataScope, setDataScope] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<"assign" | "close" | "priority">("assign");
  const [batchForm] = Form.useForm();
  const canWrite = hasPermission("ticket:write");

  const query = (nextPage = page) => ({
    page: nextPage,
    page_size: 20,
    keyword: keyword.trim() || undefined,
    status,
    priority,
    overdue
  });

  const load = (nextPage = page) => {
    setLoading(true);
    listTickets(query(nextPage))
      .then(res => {
        setList(res.data?.data?.list || []);
        setTotal(res.data?.data?.total || 0);
        setDataScope(res.data?.data?.data_scope || "");
        setPage(nextPage);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    if (canWrite && hasPermission("user:read")) {
      findUserOptions()
        .then(res => setUsers(res.data?.data || []))
        .catch(() => setUsers([]));
    }
    if (canWrite && hasPermission("dept:read")) {
      listDepts()
        .then(res => setDepts(res.data?.data?.list || []))
        .catch(() => setDepts([]));
    }
  }, []);

  const openBatch = (action: "assign" | "close" | "priority") => {
    if (!selectedKeys.length) {
      message.warning("请先勾选工单");
      return;
    }
    setBatchAction(action);
    batchForm.resetFields();
    setBatchOpen(true);
  };

  const submitBatch = async (values: any) => {
    if (batchAction === "assign") {
      if (!values.assignee_id && !values.department_id) {
        message.warning("处理人和部门至少填一个");
        return;
      }
      const res = await batchAssignTickets({
        ids: selectedKeys,
        assignee_id: values.assignee_id || "",
        department_id: values.department_id || ""
      });
      const failed = res.data?.data?.failed || [];
      if (failed.length) message.warning(`分派完成，失败 ${failed.length} 个`);
      else message.success("已分派");
    } else {
      const res = await batchTickets({
        ids: selectedKeys,
        action: batchAction,
        priority: values.priority,
        close_reason: values.close_reason
      });
      const results = res.data?.data?.results || [];
      const fail = results.filter((item: any) => !item.ok).length;
      if (fail) message.warning(`完成，失败 ${fail} 个`);
      else message.success("已更新");
    }
    setBatchOpen(false);
    setSelectedKeys([]);
    load();
  };

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
      render: (value: string) => <TicketStatusTag status={value} />
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
    <>
      {dataScope ? <Alert className="mb-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} /> : null}
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
        {canWrite && selectedKeys.length ? (
          <Space>
            <Button onClick={() => openBatch("assign")}>批量分派</Button>
            <Button onClick={() => openBatch("priority")}>批量改优先级</Button>
            <Button danger onClick={() => openBatch("close")}>
              批量关闭
            </Button>
          </Space>
        ) : null}
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        scroll={{ x: 900 }}
        locale={{ emptyText: loading ? "加载中…" : "暂无工单" }}
        pagination={{ current: page, total, pageSize: 20, onChange: next => load(next) }}
        rowSelection={
          canWrite
            ? {
                selectedRowKeys: selectedKeys,
                onChange: keys => setSelectedKeys(keys.map(String))
              }
            : undefined
        }
      />
      {current ? <TicketPanel ticketId={current} onClose={() => setCurrent("")} onChanged={() => load()} /> : null}
      <Modal
        open={batchOpen}
        title={batchAction === "assign" ? "批量分派" : batchAction === "close" ? "批量关闭" : "批量改优先级"}
        onOk={() => batchForm.submit()}
        onCancel={() => setBatchOpen(false)}
        destroyOnHidden>
        <Form form={batchForm} layout="vertical" onFinish={submitBatch}>
          {batchAction === "assign" ? (
            <>
              <Form.Item name="assignee_id" label="处理人">
                <Select allowClear showSearch optionFilterProp="label" options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))} />
              </Form.Item>
              <Form.Item name="department_id" label="部门">
                <TreeSelect allowClear treeDefaultExpandAll treeData={toDeptTree(depts, { disableOff: true })} />
              </Form.Item>
            </>
          ) : null}
          {batchAction === "priority" ? (
            <Form.Item name="priority" label="优先级" rules={[{ required: true, message: "请选择" }]} initialValue="normal">
              <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          ) : null}
          {batchAction === "close" ? (
            <Form.Item name="close_reason" label="关闭原因" rules={[{ required: true, message: "请填写关闭原因" }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default TicketListTab;
