import { hasPermission } from "@/api/announcement";
import { createPosition, deletePosition, listDepts, listPositions, toDeptTree, updatePosition } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, TreeSelect, message } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "岗位管理" }];

const PostAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [draft, setDraft] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const canWrite = hasPermission("position:write");

  const load = (department_id = departmentId) => {
    listPositions(department_id)
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    listDepts()
      .then(res => setDepts(res.data?.data?.list || []))
      .catch(() => setDepts([]));
    load();
  }, []);

  useEffect(() => {
    if (!draft) return;
    form.setFieldsValue({
      department_id: draft.department_id || undefined,
      name: draft.name || "",
      code: draft.code || "",
      sort: draft.sort ?? 0,
      status: draft.status ?? 1
    });
  }, [draft, form]);

  const deptTree = useMemo(() => toDeptTree(depts, { disableOff: true }), [depts]);
  const deptName = (id: string) => {
    const walk = (nodes: any[]): string => {
      for (const node of nodes || []) {
        if (String(node.id) === String(id)) return node.name;
        const nested = walk(node.children || []);
        if (nested) return nested;
      }
      return "";
    };
    return walk(depts) || id || "—";
  };

  const save = async (values: any) => {
    setSaving(true);
    try {
      const body = {
        department_id: values.department_id,
        name: values.name,
        code: values.code,
        sort: values.sort ?? 0,
        status: values.status
      };
      if (draft?.id) await updatePosition(String(draft.id), body);
      else await createPosition(body);
      message.success("已保存");
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: any) => {
    Modal.confirm({
      title: "删除岗位",
      icon: <ExclamationCircleOutlined />,
      content: `删除「${row.name}」。仍有人任职时无法删除。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deletePosition(String(row.id));
        message.success("已删除");
        load();
      }
    });
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "编码", dataIndex: "code" },
    { title: "部门", dataIndex: "department_id", render: (id: string) => deptName(id) },
    { title: "排序", dataIndex: "sort", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: number) => (Number(status) === 1 ? <Tag color="blue">启用</Tag> : <Tag>停用</Tag>)
    },
    {
      title: "操作",
      width: 160,
      render: (row: any) =>
        canWrite ? (
          <Space>
            <Button size="small" type="primary" onClick={() => setDraft(row)}>
              编辑
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
      <PageIntroduction infos={infos} introduction="岗位挂在部门下。改名会同步已任职用户的岗位名称。停用的岗位不能再被选中。" />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          <TreeSelect
            allowClear
            showSearch
            treeDefaultExpandAll
            treeNodeFilterProp="title"
            placeholder="按部门筛选"
            style={{ width: 240 }}
            value={departmentId}
            treeData={deptTree}
            onChange={value => {
              const next = value || undefined;
              setDepartmentId(next);
              load(next);
            }}
          />
          {canWrite ? (
            <Button type="primary" onClick={() => setDraft({ status: 1, sort: 0, department_id: departmentId })}>
              添加岗位
            </Button>
          ) : null}
        </Space>
        <Table rowKey="id" columns={columns} dataSource={list} pagination={false} />
      </div>
      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑岗位" : "添加岗位"}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        onOk={() => form.submit()}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="department_id" label="部门" rules={[{ required: true, message: "请选择部门" }]}>
            <TreeSelect allowClear treeDefaultExpandAll treeNodeFilterProp="title" placeholder="选择部门" treeData={deptTree} />
          </Form.Item>
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
            <Input placeholder="例如 engineer" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
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

export default PostAdmin;
