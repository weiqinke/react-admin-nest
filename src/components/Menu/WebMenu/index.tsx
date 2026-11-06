import { useAppStore } from "@/stores/app";
import { findMenuById, menuKeysForPath, normalizePath, sidebarItemsFromStorage, type SidebarItem } from "@/utils/menuUtils";
import { AppstoreOutlined } from "@ant-design/icons";
import { Menu, type MenuProps } from "antd";
import { useEffect, useLayoutEffect, useMemo, useState, type ComponentType } from "react";
import { useLocation, useNavigate } from "react-router";

type IconFontProps = { type: string };

function withIcons(items: SidebarItem[], Icon: ComponentType<IconFontProps> | null): MenuProps["items"] {
  return items.map(item => ({
    key: item.key,
    label: item.label,
    icon: Icon && item.icon ? <Icon type={item.icon} /> : <AppstoreOutlined />,
    children: item.children ? withIcons(item.children, Icon) : undefined
  }));
}

const WebMenu = () => {
  const theme = useAppStore(state => state.theme);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuTick, setMenuTick] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenkeys] = useState<string[]>([]);
  const [IconFont, setIconFont] = useState<ComponentType<IconFontProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void import("@/components/IconFont").then(mod => {
        if (!cancelled) setIconFont(() => mod.default);
      });
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(load, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  const menuItems = useMemo(() => withIcons(sidebarItemsFromStorage(), IconFont), [menuTick, IconFont]);

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const node = findMenuById(key);
    if (!node?.full_path) return;
    navigate(normalizePath(node.full_path));
  };

  useEffect(() => {
    const refresh = () => setMenuTick(value => value + 1);
    window.addEventListener("menus:refresh", refresh);
    return () => window.removeEventListener("menus:refresh", refresh);
  }, []);

  useLayoutEffect(() => {
    const next = menuKeysForPath(pathname);
    setOpenkeys(next.openKeys);
    setSelectedKeys(next.selectedKeys);
  }, [pathname, menuTick]);

  return (
    <div style={{ width: "100%" }}>
      <Menu
        mode="inline"
        theme={theme === "dark" ? "dark" : "light"}
        onClick={onClick}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={setOpenkeys}
        items={menuItems}
        inlineIndent={12}
      />
    </div>
  );
};

export default WebMenu;
