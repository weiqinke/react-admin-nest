/** 管理端菜单树节点（对齐 /api/menus 与 menus.json）。 */
export interface AdminMenuNode {
  id: string;
  chain_id: string;
  parent_id: string | null;
  segment: string;
  full_path: string;
  weight: number;
  title: string;
  icon: string;
  remark: string;
  is_hot: number;
  has_update: number;
  visible_in_menu: number;
  sort: number;
  status: number;
  is_public: boolean;
  children?: AdminMenuNode[];
  permissions?: string[];
  effective_permissions?: string[];
}

export interface MenuPermissionsBody {
  permission_codes: string[];
}

export type MenuDrawerMode = "create" | "edit" | "auth" | null;

export type MenuTreeFilter = "all" | "disabled" | "controlled" | "hidden";
