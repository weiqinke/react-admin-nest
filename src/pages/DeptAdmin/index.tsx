import { hasPermission } from "@/api/announcement";
import { commitDeptImport, downloadDeptImportTemplate, exportDeptsCsv, previewDeptImport } from "@/api/impexp";
import { createDept, deleteDept, listDepts, toDeptTree, updateDept } from "@/api/platform";
import { findUserOptions } from "@/api/user";
import CsvImportModal from "@/components/CsvImportModal";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, TreeSelect, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useMemo, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "部门管理" }];

function asTableTree(nodes: any[] = []): any[] {
  return (nodes || []).map(node => {
    const children = asTableTree(node.children || []);
    const row: any = { ...node, id: String(node.id) };
    if (children.length) row.children = children;
    else delete row.children;
    return row;
  });
}

function dropNode(nodes: any[] = [], id: string): any[] {
  return (nodes || []).filter(node => String(node.id) !== id).map(node => ({ ...node, children: dropNode(node.children || [], id) }));
}

const DeptAdmin: FC = () => {
  const [tree, setTree] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canWrite = hasPermission("dept:write");
  const canRead = hasPermission("dept:read");
  const canPickLeader = hasPermission("user:read");

  const load = () => {
    listDepts()
      .then(res => setTree(res.data?.data?.list || []))
      .catch(() => setTree([]));
  };

  useEffect(() => {
    load();
    if (!canPickLeader) return;
    findUserOptions()
      .then(res => setUsers(res.data?.data || []))
      .catch(() => setUsers([]));
  }, [canPickLeader]);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      name: draft.name || "",
      code: draft.code || "",
      parent_id: draft.parent_id || undefined,
      sort: draft.sort ?? 0,
      status: draft.status ?? 1,
      leader_user_id: draft.leader_user_id || undefined
    });
  }, [draft, form]);

  const parentTree = useMemo(() => toDeptTree(draft?.id ? dropNode(tree, String(draft.id)) : tree), [draft, tree]);

  const save = async (values: any) => {
    setSaving(true);
    try {
      const body: Record<string, any> = {
        name: values.name,
        code: values.code,
        parent_id: values.parent_id || "",
        sort: values.sort ?? 0,
        status: values.status
      };
      if (canPickLeader) body.leader_user_id = values.leader_user_id || "";
      if (draft?.id) await updateDept(String(draft.id), body);
      else await createDept(body);
      message.success("已保存");
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: any) => {
    Modal.confirm({
      title: "删除部门",
      icon: <ExclamationCircleOutlined />,
      content: `删除「${row.name}」。有下级部门或仍有用户时无法删除。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deleteDept(String(row.id));
        message.success("已删除");
        load();
      }
    });
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "编码", dataIndex: "code" },
    { title: "排序", dataIndex: "sort", width: 80 },
    {
      title: "人数",
      dataIndex: "member_count",
      width: 90,
      render: (count: number) => count ?? 0
    },
    {
      title: "负责人",
      dataIndex: "leader_user_id",
      render: (id: string) => {
        if (!id) return "未设置";
        return users.find(item => String(item.uid || item.id) === String(id))?.username || id;
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: number) => (Number(status) === 1 ? <Tag color="blue">启用</Tag> : <Tag>停用</Tag>)
    },
    {
      title: "操作",
      width: 240,
      render: (row: any) =>
        canWrite ? (
          <Space wrap>
            <Button size="small" type="primary" onClick={() => setDraft(row)}>
              编辑
            </Button>
            <Button size="small" onClick={() => setDraft({ parent_id: String(row.id), status: 1, sort: 0 })}>
              添加下级
            </Button>
            <Button size="small" danger onClick={() => remove(row)}>
              删除
            </Button>
          </Space>
        ) : null
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction
        infos={infos}
        introduction="部门是一棵树。人数只统计本部门启用用户，不含下级。可以指定负责人，同一个人可以负责多个部门。清空负责人后保存即取消。"
      />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          {canWrite ? (
            <Button type="primary" onClick={() => setDraft({ status: 1, sort: 0 })}>
              添加部门
            </Button>
          ) : null}
          {canRead ? (
            <Button
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await exportDeptsCsv(`depts-${dayjs().format("YYYYMMDD")}.csv`);
                } catch {
                  message.error("导出失败");
                } finally {
                  setExporting(false);
                }
              }}>
              导出 CSV
            </Button>
          ) : null}
          {canWrite ? <Button onClick={() => setImportOpen(true)}>导入 CSV</Button> : null}
        </Space>
        <Table rowKey="id" columns={columns} dataSource={asTableTree(tree)} pagination={false} />
      </div>
      <CsvImportModal
        open={importOpen}
        title="导入部门"
        hint="模板列：code,name,parent_code,sort,status。先预览再确认导入。"
        onClose={() => setImportOpen(false)}
        onDownloadTemplate={downloadDeptImportTemplate}
        onPreview={previewDeptImport}
        onCommit={commitDeptImport}
        onDone={load}
      />
      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑部门" : "添加部门"}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item
            name="code"
            label="编码"
            rules={[
              { required: true, message: "请填写编码" },
              { pattern: /^[a-z][a-z0-9_]{1,31}$/, message: "小写字母开头，2–32 位，仅字母、数字、下划线" }
            ]}>
            <Input placeholder="例如 finance" />
          </Form.Item>
          <Form.Item name="parent_id" label="上级部门">
            <TreeSelect allowClear treeDefaultExpandAll placeholder="留空则为根部门" treeData={parentTree} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          {canPickLeader ? (
            <Form.Item name="leader_user_id" label="负责人" extra="同一个人可以负责多个部门。清空后保存即取消。">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="选择用户"
                options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: "启用" },
                { value: 0, label: "停用" }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeptAdmin;
