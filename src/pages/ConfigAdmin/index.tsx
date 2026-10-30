import { hasPermission } from "@/api/announcement";
import { listConfigs, updateConfig } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, Form, Input, Modal, Select, Space, Table, message } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "系统参数" }];

const ConfigAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [group, setGroup] = useState<string | undefined>();
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const canWrite = hasPermission("config:write");

  const load = () => {
    listConfigs()
      .then(res => setList(res.data?.data?.list || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => Array.from(new Set(list.map(item => item.group).filter(Boolean))), [list]);
  const rows = group ? list.filter(item => item.group === group) : list;

  const save = async (values: any) => {
    setSaving(true);
    try {
      await updateConfig(editing.key, String(values.value ?? ""));
      message.success("已保存");
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns: any = [
    { title: "分组", dataIndex: "group", width: 120 },
    { title: "名称", dataIndex: "name" },
    { title: "键", dataIndex: "key", responsive: ["lg"] },
    { title: "值", dataIndex: "value", ellipsis: true },
    { title: "类型", dataIndex: "value_type", width: 90 },
    {
      title: "操作",
      width: 90,
      render: (row: any) =>
        canWrite ? (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue({ value: row.value });
            }}>
            修改
          </Button>
        ) : null
    }
  ];

  return (
    <div className="p-3">
      <PageIntroduction infos={infos} introduction="站点参数在这里修改。布尔值请填 true 或 false。启动用的 bootstrap 参数不会出现在列表里。" />
      <div className="mt-3 bg-white p-3">
        <Space className="mb-3" wrap>
          <Select
            allowClear
            placeholder="分组"
            style={{ width: 180 }}
            value={group}
            options={groups.map(item => ({ value: item, label: item }))}
            onChange={value => setGroup(value)}
          />
          <Button onClick={() => load()}>刷新</Button>
        </Space>
        <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} />
      </div>
      <Modal open={Boolean(editing)} title={editing ? `修改 ${editing.name || editing.key}` : "修改参数"} confirmLoading={saving} onOk={() => form.submit()} onCancel={() => setEditing(null)} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item label="键">
            <Input value={editing?.key} disabled />
          </Form.Item>
          {editing?.value_type === "bool" ? (
            <Form.Item name="value" label="值" rules={[{ required: true, message: "请选择" }]}>
              <Select
                options={[
                  { value: "true", label: "true" },
                  { value: "false", label: "false" }
                ]}
              />
            </Form.Item>
          ) : (
            <Form.Item name="value" label="值" rules={[{ required: editing?.value_type === "int", message: "请填写数值" }]}>
              {editing?.value_type === "int" ? <Input /> : <Input.TextArea rows={4} maxLength={2000} />}
            </Form.Item>
          )}
          {editing?.remark ? <div className="text-neutral-500">{editing.remark}</div> : null}
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigAdmin;
