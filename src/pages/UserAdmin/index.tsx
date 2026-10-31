import { hasPermission } from "@/api/announcement";
import { commitUserImport, downloadUserImportTemplate, exportUsersCsv, previewUserImport } from "@/api/impexp";
import { dataScopeLabel, listDepts, toDeptTree } from "@/api/platform";
import { findRoles } from "@/api/role";
import { getUserState } from "@/api/session";
import { findUsers, resetUserPassword, setUserStatus, unlockUser } from "@/api/user";
import CsvImportModal from "@/components/CsvImportModal";
import PageIntroduction from "@/components/PageIntroduction";
import { UserEditModal } from "@/components/Modals";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Modal, Select, Space, TreeSelect, message } from "antd";
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
  const selfId = String(getUserState().uid || "");
  const canFilterDept = hasPermission("dept:read");
  const canFilterRole = hasPermission("role:read");
  const canWrite = hasPermission("user:write");
  const canRead = hasPermission("user:read");

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
      }
    });
  };

  const findAll = (next = 1) => {
    setUser(null);
    const { keyword, status, department_id, role } = form.getFieldsValue();
    findUsers({ page: next, page_size: pageSize, keyword, status, department_id, role })
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
      });
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
    <div className="p-3">
      <PageIntroduction
        infos={infos}
        introduction="用户列表按页返回，并已按当前角色的数据范围过滤。支持 CSV 导出与导入（模板列：username,password,department_code,roles）。解除锁定会清掉连续密码错误的计数。停用会踢掉对方全部会话。"
      />
      {dataScope ? <Alert className="mt-3" type="info" showIcon title={`当前数据范围：${dataScopeLabel(dataScope)}`} /> : null}
      <div className="my-3 rounded-md bg-white p-3">
        <Form form={form} name="horizontal_login" layout="inline" autoComplete="off" onFinish={() => findAll(1)}>
          <Form.Item name="keyword" label="用户名">
            <Input placeholder="用户名包含" autoComplete="off" allowClear />
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
          {canFilterDept ? (
            <Form.Item name="department_id" label="部门">
              <TreeSelect
                allowClear
                showSearch={{ treeNodeFilterProp: "title" }}
                treeDefaultExpandAll
                placeholder="精确匹配，不含下级"
                style={{ width: 220 }}
                treeData={toDeptTree(deptTree)}
              />
            </Form.Item>
          ) : null}
          {canFilterRole ? (
            <Form.Item name="role" label="角色">
              <Select
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                placeholder="直接分配的角色"
                style={{ width: 200 }}
                options={roles.map(item => ({
                  value: item.code,
                  label: item.name ? `${item.name}（${item.code}）` : item.code
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item>
            <Space size={[8, 16]} wrap>
              <Button htmlType="submit">查询</Button>
              {canWrite ? <Button onClick={() => setUser({})}>添加</Button> : null}
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
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className="mt-3 rounded-md bg-white">
        <UserTable
          dataSource={dataSource}
          selfId={selfId}
          canUnlock={canWrite}
          setUser={setUser}
          showDeleteConfirm={showDeleteConfirm}
          onReset={setResetFor}
          onUnlock={unlock}
          pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: next => findAll(next) }}
        />
      </div>

      {user && <UserEditModal initUser={user} onOk={() => findAll()} onCancel={() => setUser(null)} />}
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
