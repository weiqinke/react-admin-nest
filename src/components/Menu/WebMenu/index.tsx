import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { formatURL, getLocalStorageMenus, getMenus, getOpenKeysByUrls, setLocalStorage } from "@/utils/menuUtils";
import { AppstoreOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useContext, useEffect, useLayoutEffect, useMemo, useState, type ComponentType } from "react";
import { useLocation, useNavigate } from "react-router";

type IconFontProps = { type: string };

const createMenuIcon = (item, Icon: ComponentType<IconFontProps> | null) => {
  return item.map(v => {
    v.icon = Icon && v.icon ? <Icon type={v.icon} /> : <AppstoreOutlined />;
    if (v.children) createMenuIcon(v.children, Icon);
    return v;
  });
};

const WebMenu = () => {
  const { addTag } = useContext(MenuTagContext);
  const { theme } = useContext<any>(ProjectContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuTick, setMenuTick] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenkeys] = useState([]);
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

  // 菜单树只在 menus:refresh 时重建，路由切换只更新选中态。自定义图标等空闲后再换上。
  const { menuItems, rawMenus } = useMemo(() => {
    const menusList = JSON.parse(getLocalStorageMenus());
    const result = getMenus(menusList);
    return { menuItems: createMenuIcon(result, IconFont), rawMenus: menusList };
  }, [menuTick, IconFont]);

  const onClick = props => {
    const { keyPath, key } = props;
    const menuPath: string[] = [...keyPath].reverse();
    let changeMenus = rawMenus.concat();
    const urls = [];
    for (let index = 0; index < menuPath.length; index++) {
      const item = menuPath[index];
      const result = changeMenus.find(v => String(v.id) === String(item));
      urls.push(result?.url || "");
      if (result.children) changeMenus = result.children;
    }
    const url = formatURL("/" + urls.join("/"));
    navigate(url);
    setOpenkeys(() => keyPath);
    setSelectedKeys(() => [key]);
    addTag(urls, key);
  };

  useEffect(() => {
    const refresh = () => setMenuTick(value => value + 1);
    window.addEventListener("menus:refresh", refresh);
    return () => window.removeEventListener("menus:refresh", refresh);
  }, []);

  useLayoutEffect(() => {
    const data = pathname.split("/").filter(v => v);
    const [nextOpenKeys, currentKey] = getOpenKeysByUrls(data, menuItems);
    setOpenkeys(nextOpenKeys);
    setSelectedKeys(currentKey);
  }, [pathname, menuItems]);

  const onOpenChange = (openKeys: any) => {
    setOpenkeys(() => openKeys);
    setLocalStorage("cacheOpenKeys", openKeys);
  };

  return (
    <div style={{ width: "100%" }}>
      <Menu
        mode="inline"
        theme={theme === "dark" ? "dark" : "light"}
        onClick={onClick}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={menuItems}
        inlineIndent={12}
      />
    </div>
  );
};

export default WebMenu;
