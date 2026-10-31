import IconFont from "@/components/IconFont";
import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { formatURL, getLocalStorageMenus, getMenus, getOpenKeysByUrls, setLocalStorage } from "@/utils/menuUtils";
import { AppstoreOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const createMenuIcon = item => {
  return item.map(v => {
    v.icon = v.icon ? <IconFont type={v.icon} /> : <AppstoreOutlined />;
    if (v.children) createMenuIcon(v.children);
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

  // 菜单树只在 menus:refresh 时重建，路由切换只更新选中态。
  const { menuItems, rawMenus } = useMemo(() => {
    const menusList = JSON.parse(getLocalStorageMenus());
    const result = getMenus(menusList);
    return { menuItems: createMenuIcon(result), rawMenus: menusList };
  }, [menuTick]);

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
