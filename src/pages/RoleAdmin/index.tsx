import { OperationRoleModal, RoleAllocationPermModal, RoleAllocationUserModal } from "@/components/Modals";
import PageIntroduction from "@/components/PageIntroduction";
import { dataScopeLabel } from "@/api/platform";
import { copyRole, findRoleUsers, findRoles, previewRoleConstraints, previewRoleDiff, removeRole } from "@/api/role";
import { findUserOptions } from "@/api/user";
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

const { confirm } = Modal;

const infos = [{ title: "系统设置" }, { title: "角色管理" }];

const RoleList: FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [role, setRole] = useState<any>(null);
  const [roleCode, setRoleCode] = useState("");

  const [userDataSource, setUserDatasource] = useState<any[]>([]);
  const [initUIDs, setInitUIDs] = useState<string[]>([]);
  const [shareUsers, setShareUsers] = useState(false);
  const [sharePerms, setSharePerms] = useState(false);
  const [copySource, setCopySource] = useState<any>(null);
  const [copySaving, setCopySaving] = useState(false);
  const [copyForm] = Form.useForm();
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<{ only_left: string[]; only_right: string[]; both: string[] } | null>(null);
  const [diffForm] = Form.useForm();
  const [constraintOpen, setConstraintOpen] = useState(false);
  const [constraintLoading, setConstraintLoading] = useState(false);
  const [constraintResult, setConstraintResult] = useState<{ ok: boolean; violations: string[] } | null>(null);
  const [constraintForm] = Form.useForm();

  const roleOptions = useMemo(
    () =>
      dataSource.map(item => ({
        value: String(item.code),
        label: item.name ? `${item.name}（${item.code}）` : String(item.code)
      })),
    [dataSource]
  );

  const findAllRole = () => {
    setRole(null);
    setShareUsers(false);
    setSharePerms(false);
    findRoles()
      .then(res => setDataSource(res.data.data || []))
      .catch(() => setDataSource([]));
  };

  useEffect(() => {
    findAllRole();
    findUserOptions()
      .then(res => setUserDatasource(res.data.data || []))
      .catch(() => setUserDatasource([]));
  }, []);

  const willGiveUser = async (record: any) => {
    try {
      const result = await findRoleUsers({ roleCode: record.code });
      if (result.data.code !== 0) {
        message.error(result.data?.message || "加载角色成员失败");
        return;
      }
      setRoleCode(record.code);
      setInitUIDs((result.data.data || []).map(String));
      setShareUsers(true);
    } catch (err: any) {
      message.error(err?.message || "加载角色成员失败");
    }
  };

  const willGivePerms = (record: any) => {
    setRoleCode(record.code);
    setSharePerms(true);
  };

  const showDeleteConfirm = (item: any) => {
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "#cf1322" }}>{`确认删除角色「${item.name || item.code}」？此操作不可恢复。`}</span>,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const result: any = await removeRole({ code: item.code });
          if (result.data?.code !== 0) {
            message.error(result.data?.message || "删除失败");
            return;
          }
          message.success("删除成功");
          findAllRole();
        } catch (err: any) {
          message.error(err?.message || "删除失败");
        }
      }
    });
  };

  const runDiff = async (values: { left: string; right: string }) => {
    setDiffLoading(true);
    try {
      const res = await previewRoleDiff(values.left, values.right);
      setDiffResult(res.data?.data || { only_left: [], only_right: [], both: [] });
    } catch (err: any) {
      message.error(err?.message || "对比失败");
    } finally {
      setDiffLoading(false);
    }
  };

  const runConstraint = async (values: { user_id?: string; role_codes: string[] }) => {
    setConstraintLoading(true);
    try {
      const res = await previewRoleConstraints({
        user_id: values.user_id || undefined,
        role_codes: values.role_codes || []
      });
      setConstraintResult(res.data?.data || { ok: true, violations: [] });
    } catch (err: any) {
      message.error(err?.message || "试算失败");
    } finally {
      setConstraintLoading(false);
    }
  };

  const columns: any = [
    {
      title: "角色编码",
      dataIndex: "code"
    },
    {
      title: "角色名称",
      dataIndex: "name"
    },
    {
      title: "数据范围",
      dataIndex: "data_scope",
      width: 140,
      render: (scope: string) => dataScopeLabel(scope)
    },
    {
      title: "继承",
      dataIndex: "inherits",
      responsive: ["lg"],
      render: (inherits: string[] = []) => (inherits?.length ? inherits.map(code => <Tag key={code}>{code}</Tag>) : <span style={{ color: "rgba(0,0,0,0.45)" }}>无</span>)
    },
    {
      title: "操作",
      render: (item: any) => (
        <Space size={[8, 16]} wrap>
          <Button size="small" type="primary" onClick={() => willGiveUser(item)}>
            分配人员
          </Button>
          <Button size="small" type="primary" onClick={() => willGivePerms(item)}>
            分配权限
          </Button>
          <Button size="small" type="primary" onClick={() => setRole(item)}>
            编辑
          </Button>
          <Button
            size="small"
            onClick={() => {
              setCopySource(item);
              copyForm.setFieldsValue({ code: `${item.code}_copy`, name: `${item.name || item.code} 副本` });
            }}>
            复制
          </Button>
          <Button size="small" danger onClick={() => showDeleteConfirm(item)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const submitCopy = async (values: { code: string; name: string }) => {
    if (!copySource?.code) return;
    setCopySaving(true);
    try {
      await copyRole(String(copySource.code), { code: values.code, name: values.name });
      message.success("已复制");
      setCopySource(null);
      findAllRole();
    } catch (err: any) {
      message.error(err?.message || "复制失败");
    } finally {
      setCopySaving(false);
    }
  };

  return (
    <div className="p-3">
      <div className="mb-3">
        <Alert
          type="info"
          showIcon
          message="角色通过权限码授权；菜单是否可见由「角色权限」与「菜单所需权限」共同决定。人员关系保存在 user_role；分配人员走批量授予/撤销接口。可用权限差集与互斥试算辅助变更。"
        />
      </div>

      <PageIntroduction infos={infos} introduction="本页维护角色、给角色分配人员和权限码。不要在角色上挂菜单 ID；受控菜单请在菜单管理中绑定权限码。" />
      <div className="mt-3 bg-white px-3">
        <Space size={[8, 16]} className="my-3" wrap>
          <Button type="primary" icon={<SearchOutlined />} iconPosition="end" onClick={findAllRole}>
            查询角色
          </Button>
          <Button type="primary" icon={<PlusOutlined />} iconPosition="end" onClick={() => setRole({})}>
            添加角色
          </Button>
          <Button
            onClick={() => {
              setDiffResult(null);
              diffForm.resetFields();
              setDiffOpen(true);
            }}>
            权限差集
          </Button>
          <Button
            onClick={() => {
              setConstraintResult(null);
              constraintForm.resetFields();
              setConstraintOpen(true);
            }}>
            互斥试算
          </Button>
        </Space>
        <Table rowKey="code" columns={columns} dataSource={dataSource} />
      </div>

      {role && <OperationRoleModal role={role} onOk={() => findAllRole()} onCancel={() => setRole(null)} />}
      {shareUsers && (
        <RoleAllocationUserModal
          dataSource={userDataSource}
          initUIDs={initUIDs}
          id={roleCode}
          title={`分配人员：${roleCode}`}
          onOk={() => {
            setShareUsers(false);
            findAllRole();
          }}
          onCancel={() => setShareUsers(false)}
        />
      )}
      {sharePerms && (
        <RoleAllocationPermModal
          roleCode={roleCode}
          onOk={() => {
            setSharePerms(false);
            findAllRole();
          }}
          onCancel={() => setSharePerms(false)}
        />
      )}
      <Modal
        open={Boolean(copySource)}
        title={copySource ? `复制角色：${copySource.code}` : "复制角色"}
        confirmLoading={copySaving}
        onOk={() => copyForm.submit()}
        onCancel={() => setCopySource(null)}
        destroyOnHidden>
        <Form form={copyForm} layout="vertical" onFinish={submitCopy}>
          <Form.Item name="code" label="新角色编码" rules={[{ required: true, message: "请填写编码" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="新角色名称" rules={[{ required: true, message: "请填写名称" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={diffOpen}
        title="角色权限差集"
        confirmLoading={diffLoading}
        onOk={() => diffForm.submit()}
        onCancel={() => setDiffOpen(false)}
        okText="对比"
        destroyOnHidden
        width={720}>
        <Form form={diffForm} layout="vertical" onFinish={runDiff}>
          <Form.Item name="left" label="左侧角色" rules={[{ required: true, message: "请选择" }]}>
            <Select showSearch optionFilterProp="label" options={roleOptions} />
          </Form.Item>
          <Form.Item name="right" label="右侧角色" rules={[{ required: true, message: "请选择" }]}>
            <Select showSearch optionFilterProp="label" options={roleOptions} />
          </Form.Item>
        </Form>
        {diffResult ? (
          <div className="mt-3 space-y-2">
            <div>
              <div className="mb-1 font-medium">仅左侧</div>
              <Space wrap size={[4, 4]}>
                {(diffResult.only_left || []).length ? diffResult.only_left.map(code => <Tag key={code}>{code}</Tag>) : <span className="text-neutral-400">无</span>}
              </Space>
            </div>
            <div>
              <div className="mb-1 font-medium">仅右侧</div>
              <Space wrap size={[4, 4]}>
                {(diffResult.only_right || []).length ? diffResult.only_right.map(code => <Tag key={code}>{code}</Tag>) : <span className="text-neutral-400">无</span>}
              </Space>
            </div>
            <div>
              <div className="mb-1 font-medium">共有</div>
              <Space wrap size={[4, 4]}>
                {(diffResult.both || []).length ? diffResult.both.map(code => <Tag key={code}>{code}</Tag>) : <span className="text-neutral-400">无</span>}
              </Space>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        open={constraintOpen}
        title="角色互斥试算"
        confirmLoading={constraintLoading}
        onOk={() => constraintForm.submit()}
        onCancel={() => setConstraintOpen(false)}
        okText="试算"
        destroyOnHidden>
        <Form form={constraintForm} layout="vertical" onFinish={runConstraint}>
          <Form.Item name="role_codes" label="角色组合" rules={[{ required: true, message: "请选择至少一个角色" }]}>
            <Select mode="multiple" showSearch optionFilterProp="label" options={roleOptions} />
          </Form.Item>
          <Form.Item name="user_id" label="用户（可选）">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={(userDataSource || []).map((item: any) => ({
                value: String(item.uid || item.id),
                label: item.username || String(item.uid || item.id)
              }))}
            />
          </Form.Item>
        </Form>
        {constraintResult ? (
          <Alert
            className="mt-3"
            type={constraintResult.ok ? "success" : "warning"}
            showIcon
            title={constraintResult.ok ? "通过：未触发 SSD/DSD" : "存在约束冲突"}
            description={
              constraintResult.ok ? null : (
                <ul className="mb-0 pl-4">
                  {(constraintResult.violations || []).map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            }
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default RoleList;
