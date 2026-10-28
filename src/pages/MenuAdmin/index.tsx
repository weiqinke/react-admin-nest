import {
  deleteMenuItem,
  findAdminMenus,
  setMenuItemStatus
} from "@/api/microservice/menu";
import PageIntroduction from "@/components/PageIntroduction";
import { AdminMenuNode, MenuTreeFilter } from "@/types/menu";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Button, Input, Modal, Select, Space, Spin, Tree, message } from "antd";
import type { DataNode } from "antd/es/tree";
import { FC, Key, useCallback, useEffect, useMemo, useState } from "react";
import MenuAuthDrawer from "./MenuAuthDrawer";
import MenuFormDrawer from "./MenuFormDrawer";
import MenuTreeNode from "./MenuTreeNode";
import styles from "./index.module.scss";

const { confirm } = Modal;

const infos = [{ title: "系统设置" }, { title: "菜单管理" }];

function collectKeys(nodes: AdminMenuNode[], acc: Key[] = []): Key[] {
  for (const node of nodes) {
    acc.push(node.id);
    if (node.children?.length) collectKeys(node.children, acc);
  }
  return acc;
}

function filterTree(nodes: AdminMenuNode[], keyword: string, filter: MenuTreeFilter): AdminMenuNode[] {
  const kw = keyword.trim().toLowerCase();
  const matchFilter = (node: AdminMenuNode) => {
    if (filter === "disabled") return Number(node.status) !== 1;
    if (filter === "controlled") return !node.is_public;
    if (filter === "hidden") return Number(node.visible_in_menu) === 0;
    return true;
  };
  const matchKw = (node: AdminMenuNode) => {
    if (!kw) return true;
    return [node.title, node.segment, node.full_path].some(v => String(v || "").toLowerCase().includes(kw));
  };

  const walk = (list: AdminMenuNode[]): AdminMenuNode[] => {
    const out: AdminMenuNode[] = [];
    for (const node of list) {
      const children = node.children?.length ? walk(node.children) : [];
      const selfHit = matchFilter(node) && matchKw(node);
      if (selfHit || children.length) {
        out.push({ ...node, children: children.length ? children : undefined });
      }
    }
    return out;
  };
  return walk(nodes);
}

const MenusAdmin: FC = () => {
  const [rawList, setRawList] = useState<AdminMenuNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<MenuTreeFilter>("all");
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formNode, setFormNode] = useState<AdminMenuNode | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authNode, setAuthNode] = useState<AdminMenuNode | null>(null);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findAdminMenus();
      if (res.data?.code !== 0) {
        message.error(res.data?.message || "加载菜单失败");
        setRawList([]);
        return;
      }
      const list: AdminMenuNode[] = res.data?.data || [];
      setRawList(list);
      setExpandedKeys(collectKeys(list));
    } catch (err: any) {
      message.error(err?.message || "加载菜单失败");
      setRawList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const visibleList = useMemo(() => filterTree(rawList, keyword, filter), [rawList, keyword, filter]);

  const openCreate = (parentId: string | null = null) => {
    setFormMode("create");
    setFormParentId(parentId);
    setFormNode(null);
    setFormOpen(true);
    setAuthOpen(false);
  };

  const openEdit = (node: AdminMenuNode) => {
    setFormMode("edit");
    setFormParentId(node.parent_id);
    setFormNode(node);
    setFormOpen(true);
    setAuthOpen(false);
    setSelectedKeys([node.id]);
  };

  const openAuth = (node: AdminMenuNode) => {
    setAuthNode(node);
    setAuthOpen(true);
    setFormOpen(false);
    setSelectedKeys([node.id]);
  };

  const toggleStatus = (node: AdminMenuNode) => {
    const next: 0 | 1 = Number(node.status) === 1 ? 0 : 1;
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content:
        next === 0
          ? `禁用「${node.title}」会级联禁用其所有子菜单，是否继续？`
          : `是否启用「${node.title}」？（若父级仍禁用将失败）`,
      okText: "确定",
      okType: next === 0 ? "danger" : "primary",
      cancelText: "取消",
      onOk: async () => {
        try {
          const result = await setMenuItemStatus(node.id, next);
          if (result.data?.code !== 0) {
            message.error(result.data?.message || "操作失败");
            return;
          }
          message.success("操作成功");
          loadMenus();
        } catch (err: any) {
          message.error(err?.message || "操作失败");
        }
      }
    });
  };

  const removeNode = (node: AdminMenuNode) => {
    if (node.children?.length) {
      message.warning("请先删除子菜单");
      return;
    }
    confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: <span style={{ color: "#cf1322" }}>{`确认删除菜单「${node.title}」？此操作不可恢复。`}</span>,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const result = await deleteMenuItem(node.id);
          if (result.data?.code !== 0) {
            message.error(result.data?.message || "删除失败");
            return;
          }
          message.success("删除成功");
          loadMenus();
        } catch (err: any) {
          message.error(err?.message || "删除失败");
        }
      }
    });
  };

  const mapNode = (node: AdminMenuNode): DataNode => ({
    key: node.id,
    title: (
      <MenuTreeNode
        node={node}
        onAddChild={n => openCreate(n.id)}
        onEdit={openEdit}
        onAuth={openAuth}
        onToggleStatus={toggleStatus}
        onDelete={removeNode}
      />
    ),
    children: node.children?.length ? node.children.map(mapNode) : undefined
  });
  const treeData: DataNode[] = visibleList.map(mapNode);

  useEffect(() => {
    if (keyword || filter !== "all") {
      setExpandedKeys(collectKeys(visibleList));
    }
  }, [keyword, filter, visibleList]);

  return (
    <div className={`p-3 ${styles.page}`}>
      <PageIntroduction
        infos={infos}
        introduction="以竖向树维护系统菜单：支持新增/编辑/启停/删除，以及通过权限码绑定做公开或受控授权。完整路径由服务端拼接，树上以 full_path 区分同名菜单。"
      />
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索标题 / segment / 路径"
            style={{ width: 260 }}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <Select
            style={{ width: 140 }}
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "全部" },
              { value: "disabled", label: "仅禁用" },
              { value: "controlled", label: "仅受控" },
              { value: "hidden", label: "仅侧栏隐藏" }
            ]}
          />
          <Space>
            <Button onClick={() => setExpandedKeys(collectKeys(visibleList))}>全部展开</Button>
            <Button onClick={() => setExpandedKeys([])}>全部收起</Button>
            <Button icon={<ReloadOutlined />} onClick={loadMenus} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(null)}>
              添加根菜单
            </Button>
          </Space>
        </div>
        <div className={styles.treeWrap}>
          <Spin spinning={loading}>
            <Tree
              blockNode
              selectable
              treeData={treeData}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onExpand={keys => setExpandedKeys(keys as Key[])}
              onSelect={keys => setSelectedKeys(keys)}
            />
          </Spin>
        </div>
      </div>

      <MenuFormDrawer
        open={formOpen}
        mode={formMode}
        parentId={formParentId}
        node={formNode}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          loadMenus();
        }}
      />
      <MenuAuthDrawer
        open={authOpen}
        node={authNode}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          loadMenus();
        }}
      />
    </div>
  );
};

export default MenusAdmin;
