import { hasPermission } from "@/api/announcement";
import { listDictOptions } from "@/api/dict";
import { listLabelOptions } from "@/api/label";
import { createAsset, flattenDepts, listAssets, listDepts, toDeptTree, updateAsset } from "@/api/platform";
import { findUserOptions } from "@/api/user";
import PageIntroduction from "@/components/PageIntroduction";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, TreeSelect, message } from "antd";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "资产台账" }];
const pageSize = 20;

function labelIdsOf(row: any) {
  return (row?.labels || []).map((item: any) => String(item.id));
}

const AssetAdmin: FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [depts, setDepts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [filterForm] = Form.useForm();
  const canRead = hasPermission("asset:read");
  const canWrite = hasPermission("asset:write");
  const canPickDept = hasPermission("dept:read");
  const canPickKeeper = hasPermission("user:read");
  const canPickLabels = hasPermission("label:read");

  const load = useCallback(
    (nextPage = 1) => {
      if (!canRead) return;
      setLoading(true);
      const { keyword, status, department_id, category } = filterForm.getFieldsValue();
      listAssets({
        page: nextPage,
        page_size: pageSize,
        keyword: String(keyword || "").trim() || undefined,
        status,
        department_id: department_id || undefined,
        category: category || undefined
      })
        .then(res => {
          const data = res.data?.data || {};
          setList(data.list || []);
          setTotal(data.total || 0);
          setPage(data.page || nextPage);
          setLoadError(false);
        })
        .catch(() => {
          setList([]);
          setTotal(0);
          setLoadError(true);
        })
        .finally(() => setLoading(false));
    },
    [canRead, filterForm]
  );

  useEffect(() => {
    if (!canRead && !canWrite) return;
    listDictOptions("asset_category")
      .then(res => {
        const data = res.data?.data;
        setCategories(Array.isArray(data) ? data : data?.list || []);
      })
      .catch(() => setCategories([]));
    if (canPickDept) {
      listDepts()
        .then(res => setDepts(res.data?.data?.list || []))
        .catch(() => setDepts([]));
    }
    if (canPickKeeper) {
      findUserOptions()
        .then(res => setUsers(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setUsers([]));
    }
    if (canPickLabels) {
      listLabelOptions()
        .then(res => {
          const data = res.data?.data;
          setLabels(Array.isArray(data) ? data : data?.list || []);
        })
        .catch(() => setLabels([]));
    }
    load(1);
  }, [canRead, canWrite, canPickDept, canPickKeeper, canPickLabels, load]);

  const deptTree = useMemo(() => toDeptTree(depts), [depts]);

  const deptName = (id: string) => {
    if (!id) return "—";
    return flattenDepts(depts).find(item => String(item.id) === String(id))?.name || id;
  };

  const keeperName = (id: string) => {
    if (!id) return "—";
    return users.find(item => String(item.uid || item.id) === String(id))?.username || id;
  };

  const categoryLabel = (value: string) => {
    if (!value) return "—";
    return categories.find(item => String(item.value) === String(value))?.label || value;
  };

  const save = async (values: any) => {
    setSaving(true);
    try {
      const body = {
        name: values.name,
        code: values.code,
        category: values.category,
        department_id: values.department_id || "",
        keeper_user_id: values.keeper_user_id || "",
        status: values.status ?? 1,
        remark: values.remark ?? "",
        label_ids: canPickLabels ? (values.label_ids || []).map((id: string) => String(id)) : labelIdsOf(draft)
      };
      if (draft?.id) await updateAsset(String(draft.id), body);
      else await createAsset(body);
      message.success("已保存");
      setDraft(null);
      load(draft?.id ? page : 1);
    } catch {
      // 拦截器已提示，例如 40901
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (row: any, status: 0 | 1) => {
    try {
      await updateAsset(String(row.id), {
        name: row.name ?? "",
        code: row.code ?? "",
        category: row.category ?? "",
        department_id: row.department_id || "",
        keeper_user_id: row.keeper_user_id || "",
        status,
        remark: row.remark ?? "",
        label_ids: labelIdsOf(row)
      });
      message.success(status === 1 ? "已启用" : "已停用");
      load(page);
    } catch {
      // 拦截器已提示
    }
  };

  const columns: any = [
    { title: "名称", dataIndex: "name" },
    { title: "编码", dataIndex: "code" },
    { title: "分类", dataIndex: "category", render: (value: string) => categoryLabel(value) },
    { title: "部门", dataIndex: "department_id", render: (id: string) => deptName(id) },
    { title: "保管人", dataIndex: "keeper_user_id", render: (id: string) => keeperName(id) },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: number) => (Number(status) === 1 ? <Tag color="blue">启用</Tag> : <Tag>停用</Tag>)
    },
    {
      title: "标签",
      dataIndex: "labels",
      render: (items: any[]) => {
        const rows = items || [];
        if (!rows.length) return "—";
        return (
          <Space wrap size="small">
            {rows.map(item => (
              <Tag key={String(item.id)} color={item.color || undefined}>
                {item.name}
              </Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: "操作",
      width: 220,
      render: (row: any) =>
        canWrite ? (
          <Space wrap>
            <Button size="small" type="primary" onClick={() => setDraft(row)}>
              编辑
            </Button>
            {Number(row.status) === 1 ? (
              <Button size="small" onClick={() => setStatus(row, 0)}>
                停用
              </Button>
            ) : (
              <Button size="small" onClick={() => setStatus(row, 1)}>
                启用
              </Button>
            )}
          </Space>
        ) : null
    }
  ];

  const emptyText = !canRead ? "没有资产查看权限" : loadError ? "加载失败" : "暂无资产";

  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="资产按页返回，并按当前角色的数据范围过滤。可按关键字、状态、分类和部门筛选。停用与启用都通过保存状态完成。清空部门、保管人或标签后保存即取消关联。"
      />
      <div className="admin-card">
        <div className="admin-toolbar">
          {canRead ? (
            <Form form={filterForm} layout="inline" className="admin-filter-form" onFinish={() => load(1)}>
              <Form.Item name="keyword" label="关键字">
                <Input allowClear placeholder="名称或编码" style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select
                  allowClear
                  placeholder="全部"
                  style={{ width: 120 }}
                  options={[
                    { value: 1, label: "启用" },
                    { value: 0, label: "停用" }
                  ]}
                />
              </Form.Item>
              <Form.Item name="category" label="分类">
                <Select
                  allowClear
                  placeholder="全部"
                  style={{ width: 160 }}
                  showSearch={{ optionFilterProp: "label" }}
                  options={categories.map(item => ({ value: String(item.value), label: item.label || item.value }))}
                />
              </Form.Item>
              <Form.Item name="department_id" label="部门">
                {canPickDept ? (
                  <TreeSelect
                    allowClear
                    treeDefaultExpandAll
                    placeholder="精确匹配"
                    style={{ width: 200 }}
                    treeData={deptTree}
                    showSearch={{ treeNodeFilterProp: "title" }}
                  />
                ) : (
                  <Input allowClear placeholder="部门 ID" style={{ width: 160 }} />
                )}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  查询
                </Button>
              </Form.Item>
            </Form>
          ) : null}
          {canWrite ? (
            <Button type="primary" onClick={() => setDraft({ status: 1 })}>
              添加资产
            </Button>
          ) : null}
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={canRead ? list : []}
          locale={{ emptyText }}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total: canRead ? total : 0,
            showSizeChanger: false,
            onChange: next => load(next)
          }}
        />
      </div>
      <Modal
        open={Boolean(draft)}
        title={draft?.id ? "编辑资产" : "添加资产"}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ htmlType: "submit", form: "asset-edit-form" }}
        onCancel={() => setDraft(null)}
        destroyOnHidden>
        <Form
          key={draft?.id || "new"}
          id="asset-edit-form"
          layout="vertical"
          onFinish={save}
          initialValues={{
            name: draft?.name || "",
            code: draft?.code || "",
            category: draft?.category || undefined,
            department_id: draft?.department_id || undefined,
            keeper_user_id: draft?.keeper_user_id || undefined,
            status: draft?.status ?? 1,
            remark: draft?.remark || "",
            label_ids: labelIdsOf(draft)
          }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: "请填写编码" }]}>
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: "请选择分类" }]}>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              placeholder="选择分类"
              options={categories.map(item => ({ value: String(item.value), label: item.label || item.value }))}
            />
          </Form.Item>
          <Form.Item name="department_id" label="部门">
            {canPickDept ? (
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                placeholder="留空则不归属部门"
                treeData={deptTree}
                showSearch={{ treeNodeFilterProp: "title" }}
              />
            ) : (
              <Input allowClear placeholder="部门 ID，可留空" />
            )}
          </Form.Item>
          {canPickKeeper ? (
            <Form.Item name="keeper_user_id" label="保管人">
              <Select
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                placeholder="选择用户"
                options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))}
              />
            </Form.Item>
          ) : (
            <Form.Item name="keeper_user_id" label="保管人">
              <Input allowClear placeholder="用户 ID，可留空" />
            </Form.Item>
          )}
          <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
            <Select
              options={[
                { value: 1, label: "启用" },
                { value: 0, label: "停用" }
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} maxLength={255} />
          </Form.Item>
          {canPickLabels ? (
            <Form.Item name="label_ids" label="标签">
              <Select
                mode="multiple"
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                placeholder="选择标签，清空后保存即解绑"
                options={labels.map(item => ({ value: String(item.id), label: item.name }))}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};

export default AssetAdmin;
