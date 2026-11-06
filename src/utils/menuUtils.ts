/** GET /api/me/menus 的 data.list。路径用 full_path，不再把 segment 拼成旧菜单结构。 */
export type ApiMenuNode = {
  id: string;
  parent_id?: string | null;
  segment?: string;
  full_path?: string;
  title?: string;
  icon?: string;
  visible_in_menu?: number;
  sort?: number;
  children?: ApiMenuNode[];
};

export type SidebarItem = {
  key: string;
  label: string;
  icon?: string;
  children?: SidebarItem[];
};

const MENUS = "menus";

/** 登录后都能打开，不要求出现在侧边栏。 */
const OPEN_PATHS = new Set(["/", "/about", "/account", "/profile", "/workplace"]);

const OPEN_NAMES: Record<string, string> = {
  "/": "关于",
  "/about": "关于",
  "/account": "个人信息",
  "/profile": "个人中心",
  "/workplace": "工作台"
};

export const saveMenus = (menus: string) => localStorage.setItem(MENUS, menus);

export const getLocalStorageMenus = () => localStorage.getItem(MENUS) || "[]";

export function normalizePath(url: string) {
  const list = String(url || "")
    .split("/")
    .filter(Boolean);
  return "/" + list.join("/");
}

function flatten(nodes: ApiMenuNode[], acc: ApiMenuNode[] = []) {
  for (const node of nodes || []) {
    acc.push(node);
    if (node.children?.length) flatten(node.children, acc);
  }
  return acc;
}

type MenuIndex = {
  raw: string;
  list: ApiMenuNode[];
  flat: ApiMenuNode[];
  paths: Set<string>;
};

let menuIndex: MenuIndex | null = null;

function readMenuIndex(): MenuIndex {
  const raw = getLocalStorageMenus();
  if (menuIndex && menuIndex.raw === raw) return menuIndex;
  let list: ApiMenuNode[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) list = parsed;
  } catch {
    list = [];
  }
  const flat = flatten(list);
  const paths = new Set<string>();
  for (const node of flat) {
    if (!node.full_path) continue;
    const path = normalizePath(node.full_path);
    if (path !== "/") paths.add(path);
  }
  menuIndex = { raw, list, flat, paths };
  return menuIndex;
}

function isVisible(node: ApiMenuNode) {
  return Number(node.visible_in_menu) === 1;
}

/** 只保留侧栏可见节点。父级可见但子项全隐藏时，不留空分组。 */
export function toSidebarItems(nodes: ApiMenuNode[] = []): SidebarItem[] {
  const items: SidebarItem[] = [];
  for (const node of nodes) {
    if (!isVisible(node)) continue;
    const children = node.children?.length ? toSidebarItems(node.children) : undefined;
    if (node.children?.length && !children?.length) continue;
    const item: SidebarItem = {
      key: String(node.id),
      label: node.title || node.segment || ""
    };
    if (node.icon) item.icon = node.icon;
    if (children?.length) item.children = children;
    items.push(item);
  }
  return items;
}

export function sidebarItemsFromStorage() {
  return toSidebarItems(readMenuIndex().list);
}

export function findMenuById(id: string | number) {
  return readMenuIndex().flat.find(node => String(node.id) === String(id));
}

/** 用 full_path 对齐当前路由，父级 id 作为展开键。 */
export function menuKeysForPath(pathname: string) {
  const path = normalizePath(pathname || "/");
  const { flat } = readMenuIndex();
  const node = flat.find(item => item.full_path && normalizePath(item.full_path) === path);
  if (!node) return { openKeys: [] as string[], selectedKeys: [] as string[] };
  const byId = new Map(flat.map(item => [String(item.id), item]));
  const openKeys: string[] = [];
  let parent = node.parent_id ? byId.get(String(node.parent_id)) : undefined;
  while (parent) {
    openKeys.unshift(String(parent.id));
    parent = parent.parent_id ? byId.get(String(parent.parent_id)) : undefined;
  }
  return { openKeys, selectedKeys: [String(node.id)] };
}

function firstLeaf(nodes: ApiMenuNode[]): ApiMenuNode | null {
  const node = nodes?.[0];
  if (!node) return null;
  if (node.children?.length) return firstLeaf(node.children) || (node.full_path ? node : null);
  return node.full_path ? node : null;
}

export const getIndexUrl = () => {
  const leaf = firstLeaf(readMenuIndex().list);
  return { pathname: leaf?.full_path || "/workplace" };
};

export function canAccessMenuPath(pathname: string) {
  const path = normalizePath(pathname || "/");
  if (OPEN_PATHS.has(path)) return true;
  return readMenuIndex().paths.has(path);
}

function isPublicPath(path: string) {
  return path === "/login" || path === "/invite" || path.startsWith("/password/") || path.startsWith("/oauth/");
}

export function pageTagName(pathname: string, miss = false) {
  const path = normalizePath(pathname || "/");
  if (isPublicPath(path)) return "";
  if (miss) return "页面不存在";
  if (!canAccessMenuPath(path)) return "无权限";
  if (OPEN_NAMES[path]) return OPEN_NAMES[path];
  return readMenuIndex().flat.find(item => item.full_path && normalizePath(item.full_path) === path)?.title || "页面";
}
