import { AdminMenuNode } from "@/types/menu";
import { Button, Space, Tag } from "antd";
import { FC, MouseEvent } from "react";
import styles from "./index.module.scss";

type Props = {
  node: AdminMenuNode;
  onAddChild: (node: AdminMenuNode) => void;
  onEdit: (node: AdminMenuNode) => void;
  onAuth: (node: AdminMenuNode) => void;
  onToggleStatus: (node: AdminMenuNode) => void;
  onDelete: (node: AdminMenuNode) => void;
};

const stop = (e: MouseEvent, fn: () => void) => {
  e.stopPropagation();
  fn();
};

const MenuTreeNode: FC<Props> = ({ node, onAddChild, onEdit, onAuth, onToggleStatus, onDelete }) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const disabled = Number(node.status) !== 1;

  return (
    <div className={`${styles.nodeRow} ${disabled ? styles.nodeDisabled : ""}`}>
      <div className={styles.nodeMain}>
        <span className={styles.nodeTitle}>{node.title || node.segment}</span>
        <Tag className={styles.pathTag}>{node.full_path || `/${node.segment}`}</Tag>
        {node.is_public ? <Tag color="success">公开</Tag> : <Tag color="processing">受控</Tag>}
        {disabled ? <Tag color="error">禁用</Tag> : null}
        {Number(node.visible_in_menu) === 0 ? <Tag>侧栏隐藏</Tag> : null}
        {Number(node.is_hot) === 1 ? <Tag color="volcano">热</Tag> : null}
        {Number(node.has_update) === 1 ? <Tag color="magenta">新</Tag> : null}
      </div>
      <Space size={0} className={styles.nodeActions} onClick={e => e.stopPropagation()}>
        <Button type="link" size="small" disabled={disabled} onClick={e => stop(e, () => onAddChild(node))}>
          添加子级
        </Button>
        <Button type="link" size="small" onClick={e => stop(e, () => onEdit(node))}>
          编辑
        </Button>
        <Button type="link" size="small" onClick={e => stop(e, () => onAuth(node))}>
          授权
        </Button>
        <Button type="link" size="small" onClick={e => stop(e, () => onToggleStatus(node))}>
          {disabled ? "启用" : "禁用"}
        </Button>
        <Button type="link" size="small" danger disabled={hasChildren} onClick={e => stop(e, () => onDelete(node))}>
          删除
        </Button>
      </Space>
    </div>
  );
};

export default MenuTreeNode;
