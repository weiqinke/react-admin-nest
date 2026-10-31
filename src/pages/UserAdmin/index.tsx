import { hasPermission } from "@/api/announcement";
import { commitUserImport, downloadUserImportTemplate, exportUsersCsv, previewUserImport } from "@/api/impexp";
import { createInvite } from "@/api/ops";
import { batchUserStatus, dataScopeLabel, listDepts, toDeptTree } from "@/api/platform";
import { findRoles } from "@/api/role";
import { getUserState } from "@/api/session";
import { forcePasswordChange, findUsers, resetUserPassword, setUserStatus, unlockUser } from "@/api/user";
import CsvImportModal from "@/components/CsvImportModal";
import PageIntroduction from "@/components/PageIntroduction";
import { UserEditModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input, InputNumber, Modal, Select, Space, TreeSelect, Typography, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import UserTable from "./components/Table";

const infos = [
  {
    title: "系统设置"
  },
  {
    title: "用户管理"
  }
];

const UserAdmin: FC = () => {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [dataScope, setDataScope] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [user, setUser] = useState(null);
  const [resetFor, setResetFor] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [deptTree, setDeptTree] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteForm] = Form.useForm();
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<0 | 1>(1);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchForm] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const selfId = String(getUserState().uid || "");
  const canFilterDept = hasPermission("dept:read");
  const canFilterRole = hasPermission("role:read");
  const canWrite = hasPermission("user:write");
  const canRead = hasPermission("user:read");

  const openBatchStatus = (status: 0 | 1) => {
    if (!selectedKeys.length) {
      message.warning("请先勾选用户");
      return;
    }
    const ids = status === 0 ? selectedKeys.filter(id => id !== selfId) : selectedKeys;
    if (!ids.length) {
      message.warning("不能停用当前登录账号");
      return;
    }
    setBatchStatus(status);
    batchForm.resetFields();
    setBatchOpen(true);
  };

  const submitBatchStatus = async (values: { reason?: string }) => {
    const ids = batchStatus === 0 ? selectedKeys.filter(id => id !== selfId) : selectedKeys;
    setBatchSaving(true);
    try {
      const res = await batchUserStatus({ ids, status: batchStatus, reason: batchStatus === 0 ? values.reason : undefined });
      const failed = res.data?.data?.failed || [];
      if (failed.length) message.warning(`完成，失败 ${failed.length} 个`);
      else message.success("已更新");
      setSelectedKeys([]);
      setBatchOpen(false);
      findAll(page);
    } finally {
      setBatchSaving(false);
    }
  };

  const submitInvite = async (values: any) => {
    setInviteSaving(true);
    try {
      const res = await createInvite({
        email: values.email.trim(),
        role_codes: values.role_codes?.length ? values.role_codes : undefined,
        department_id: values.department_id || undefined,
        hours: values.hours || 72
      });
      const link = res.data?.data?.link || "";
      setInviteLink(link);
      message.success("邀请已创建");
      inviteForm.resetFields();
    } finally {
      setInviteSaving(false);
    }
  };

  const showDeleteConfirm = (item: any) => {
    const id = String(item.id || item.uid || "");
    if (!item.banned && id === selfId) {
      message.warning("不能停用当前登录账号");
      return;
    }
    const nextStatus = item.banned ? 1 : 0;
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: item.banned ? "是否启用该用户？" : "是否停用该用户？停用后会踢掉该用户的全部会话。",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await setUserStatus(id, nextStatus);
        message.success(nextStatus === 0 ? "已停用" : "已启用");
        findAll(page);
      }
    });
  };

  const submitReset = async (values: { password: string }) => {
    if (!resetFor) return;
    setResetting(true);
    try {
      const id = String(resetFor.id || resetFor.uid);
      await resetUserPassword(id, values.password);
      message.success(id === selfId ? "密码已重置，请重新登录" : "密码已重置，该用户需要重新登录");
      setResetFor(null);
      resetForm.resetFields();
    } finally {
      setResetting(false);
    }
  };

  const unlock = (item: any) => {
    const id = String(item.id || item.uid || "");
    Modal.confirm({
      title: "解除登录锁定",
      icon: <ExclamationCircleOutlined />,
      content: `清除 ${item.username || "该用户"} 的连续密码错误次数和锁定。未锁定时也会把计数清零。`,
      okText: "解除",
      cancelText: "取消",
      onOk: async () => {
        await unlockUser(id);
        message.success("已解除锁定");
        findAll(page);
      }
    });
  };

  const forceChangePassword = (item: any) => {
    const id = String(item.id || item.uid || "");
    let revokeSessions = true;
    Modal.confirm({
      title: "强制下次改密",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            用户 <Typography.Text strong>{item.username || id}</Typography.Text> 下次登录须先修改密码，改密前无法进行其它写操作。
          </p>
          <Checkbox defaultChecked onChange={e => (revokeSessions = e.target.checked)}>
            同时踢掉该用户全部会话
          </Checkbox>
        </div>
      ),
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await forcePasswordChange(id, { revoke_sessions: revokeSessions });
        message.success("已要求下次改密");
        findAll(page);
      }
    });
  };

  const findAll = (next = 1) => {
    setUser(null);
    setTableLoading(true);
    const { keyword, status, department_id, role, sort, never_login } = form.getFieldsValue();
    findUsers({
      page: next,
      page_size: pageSize,
      keyword,
      status,
      department_id,
      role,
      sort: sort || undefined,
      never_login: never_login ? 1 : undefined
    })
      .then(result => {
        if (result.data.code === 0) {
          setDataSource(result.data.data || []);
          setDataScope(result.data.data_scope || "");
          setTotal(result.data.total || 0);
          setPage(result.data.page || next);
        } else {
          setDataSource([]);
          setTotal(0);
        }
      })
      .catch(() => {
        setDataSource([]);
        setTotal(0);
      })
      .finally(() => setTableLoading(false));
  };
  useEffect(() => {
    findAll(1);
    if (canFilterDept) {
      listDepts()
        .then(res => setDeptTree(res.data?.data?.list || []))
        .catch(() => setDeptTree([]));
    }
    if (canFilterRole) {
      findRoles()
        .then(res => setRoles(res.data?.data || []))
        .catch(() => setRoles([]));
    }
  }, []);
  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="用户列表按页返回，并已按当前角色的数据范围过滤。支持按最近登录排序、从未登录筛选。强制改密后对方须先改密才能写操作。解除锁定会清掉连续密码错误计数。停用会踢掉对方全部会话。"
      />
      {dataScope ? <Alert className="mt-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} /> : null}
      <div className="admin-card">
        <div className="admin-toolbar">
          <Form form={form} name="user_admin_filter" layout="inline" className="admin-filter-form" autoComplete="off" onFinish={() => findAll(1)}>
            <Form.Item name="keyword" label="用户名">
              <Input placeholder="用户名包含" autoComplete="off" allowClear style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 100 }}
                options={[
                  { value: 1, label: "启用" },
                  { value: 0, label: "停用" }
                ]}
              />
            </Form.Item>
            <Form.Item name="sort" label="排序">
              <Select
                allowClear
                placeholder="默认"
                style={{ width: 130 }}
                options={[{ value: "last_login", label: "最近登录" }]}
              />
            </Form.Item>
            <Form.Item name="never_login" label="从未登录" valuePropName="checked">
              <Checkbox />
            </Form.Item>
            {canFilterDept ? (
              <Form.Item name="department_id" label="部门">
                <TreeSelect
                  allowClear
                  showSearch={{ treeNodeFilterProp: "title" }}
                  treeDefaultExpandAll
                  placeholder="精确匹配"
                  style={{ width: 180 }}
                  treeData={toDeptTree(deptTree)}
                />
              </Form.Item>
            ) : null}
            {canFilterRole ? (
              <Form.Item name="role" label="角色">
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="直接角色"
                  style={{ width: 160 }}
                  options={roles.map(item => ({
                    value: item.code,
                    label: item.name ? `${item.name}（${item.code}）` : item.code
                  }))}
                />
              </Form.Item>
            ) : null}
          </Form>
          <Button type="primary" onClick={() => form.submit()}>
            查询
          </Button>
          {canWrite ? <Button onClick={() => setUser({})}>添加</Button> : null}
          {canWrite ? (
            <Button
              onClick={() => {
                setInviteLink("");
                setInviteOpen(true);
              }}>
              邀请用户
            </Button>
          ) : null}
          {canWrite && selectedKeys.length ? (
            <Space>
              <Button onClick={() => openBatchStatus(1)}>批量启用</Button>
              <Button danger onClick={() => openBatchStatus(0)}>
                批量停用
              </Button>
            </Space>
          ) : null}
          {canRead ? (
            <Button
              loading={exporting}
              onClick={async () => {
                const values = form.getFieldsValue();
                setExporting(true);
                try {
                  await exportUsersCsv(
                    {
                      keyword: values.keyword,
                      status: values.status,
                      department_id: values.department_id,
                      role: values.role
                    },
                    `users-${dayjs().format("YYYYMMDD")}.csv`
                  );
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
        </div>
      </div>

      <div className="admin-card-table">
        <UserTable
          dataSource={dataSource}
          loading={tableLoading}
          selfId={selfId}
          canUnlock={canWrite}
          canForcePassword={canWrite}
          canSelect={canWrite}
          selectedKeys={selectedKeys}
          onSelectChange={setSelectedKeys}
          setUser={setUser}
          showDeleteConfirm={showDeleteConfirm}
          onReset={setResetFor}
          onUnlock={unlock}
          onForcePassword={forceChangePassword}
          pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: next => findAll(next) }}
        />
      </div>
      <Modal
        open={batchOpen}
        title={batchStatus === 0 ? "批量停用" : "批量启用"}
        okText="确定"
        okType={batchStatus === 0 ? "danger" : "primary"}
        confirmLoading={batchSaving}
        destroyOnHidden
        onOk={() => batchForm.submit()}
        onCancel={() => setBatchOpen(false)}>
        <Form form={batchForm} layout="vertical" onFinish={submitBatchStatus}>
          <p>
            将对 {(batchStatus === 0 ? selectedKeys.filter(id => id !== selfId) : selectedKeys).length} 个用户执行
            {batchStatus === 0 ? "停用" : "启用"}。{batchStatus === 0 ? "停用会踢掉对方会话，且需要二次确认。" : ""}
          </p>
          {batchStatus === 0 ? (
            <Form.Item name="reason" label="停用原因">
              <Input.TextArea rows={2} placeholder="可选" maxLength={256} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
      <Modal
        open={inviteOpen}
        title="邀请用户"
        confirmLoading={inviteSaving}
        okText={inviteLink ? "关闭" : "发送邀请"}
        cancelText="取消"
        destroyOnHidden
        onOk={() => {
          if (inviteLink) {
            setInviteOpen(false);
            return;
          }
          inviteForm.submit();
        }}
        onCancel={() => setInviteOpen(false)}>
        {inviteLink ? (
          <div>
            <p>邀请已创建（需 mail.enabled）。可将链接发给被邀请人：</p>
            <Typography.Paragraph copyable>{inviteLink}</Typography.Paragraph>
          </div>
        ) : (
          <Form form={inviteForm} layout="vertical" onFinish={submitInvite} initialValues={{ hours: 72 }}>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, type: "email", message: "请填写有效邮箱" }]}>
              <Input placeholder="user@example.com" />
            </Form.Item>
            {canFilterRole ? (
              <Form.Item name="role_codes" label="角色" extra="默认 user">
                <Select
                  mode="multiple"
                  allowClear
                  options={roles.map(item => ({
                    value: item.code,
                    label: item.name ? `${item.name}（${item.code}）` : item.code
                  }))}
                />
              </Form.Item>
            ) : null}
            {canFilterDept ? (
              <Form.Item name="department_id" label="部门">
                <TreeSelect allowClear treeDefaultExpandAll placeholder="可选" treeData={toDeptTree(deptTree, { disableOff: true })} />
              </Form.Item>
            ) : null}
            <Form.Item name="hours" label="有效小时" extra="1–168，默认 72">
              <InputNumber min={1} max={168} className="w-full" />
            </Form.Item>
          </Form>
        )}
      </Modal>
      <CsvImportModal
        open={importOpen}
        title="导入用户"
        hint="先下载模板。roles 用 | 分隔多个角色编码。预览无误后再确认导入。"
        onClose={() => setImportOpen(false)}
        onDownloadTemplate={downloadUserImportTemplate}
        onPreview={previewUserImport}
        onCommit={commitUserImport}
        onDone={() => findAll(1)}
      />
      <Modal
        open={!!resetFor}
        title={`重置密码：${resetFor?.username || ""}`}
        confirmLoading={resetting}
        okText="重置"
        cancelText="取消"
        destroyOnHidden
        onOk={() => resetForm.submit()}
        onCancel={() => {
          setResetFor(null);
          resetForm.resetFields();
        }}>
        <Form form={resetForm} layout="vertical" onFinish={submitReset}>
          <Form.Item
            name="password"
            label="新密码"
            extra="提交后对方全部会话失效。页面不会回显密码。"
            rules={[
              { required: true, message: "请填写新密码" },
              { min: 6, max: 64, message: "密码长度为 6-64 位" }
            ]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAdmin;
