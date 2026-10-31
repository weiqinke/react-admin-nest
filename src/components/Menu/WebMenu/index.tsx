import { getMenuPins, putMenuPins, recordMenuRecent } from "@/api/ops";
import IconFont from "@/components/IconFont";
import MenuTagContext from "@/contexts/MenuTagContext";
import ProjectContext from "@/contexts/ProjectContext";
import { formatURL, getLocalStorageMenus, getMenus, getOpenKeysByUrls, setLocalStorage } from "@/utils/menuUtils";
import { AppstoreOutlined, PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import { Button, Menu, Space, Tooltip, Typography } from "antd";
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const createMenuIcon = item => {
  return item.map(v => {
    v.icon = v.icon ? <IconFont type={v.icon} /> : <AppstoreOutlined />;
    if (v.children) createMenuIcon(v.children);
    return v;
  });
};

function flattenMenuPaths(items: any[] = [], bucket: { path: string; label: string; key: any }[] = []) {
  items.forEach(item => {
    if (item.path && (!item.children || !item.children.length)) {
      bucket.push({ path: item.path, label: String(item.label || item.name || item.path), key: item.key });
    }
    if (item.children?.length) flattenMenuPaths(item.children, bucket);
  });
  return bucket;
}

const WebMenu = () => {
  const { addTag } = useContext(MenuTagContext);
  const { theme } = useContext<any>(ProjectContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menusList = JSON.parse(getLocalStorageMenus() || "");
  const [menuItems, setMenuItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenkeys] = useState([]);
  const [menuTick, setMenuTick] = useState(0);
  const [pins, setPins] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const flat = useMemo(() => flattenMenuPaths(menuItems), [menuItems]);
  const pathLabel = (path: string) => flat.find(item => item.path === path)?.label || path;

  const onClick = props => {
    const { keyPath, key } = props;
    const menuPath: string[] = [...keyPath].reverse();
    let changeMenus = menusList.concat();
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

  useEffect(() => {
    getMenuPins()
      .then(res => {
        const data = res.data?.data || {};
        setPins(data.pins || []);
        setRecent(data.recent || []);
      })
      .catch(() => {
        setPins([]);
        setRecent([]);
      });
  }, []);

  useEffect(() => {
    if (!pathname || pathname === "/") return;
    recordMenuRecent(pathname)
      .then(res => {
        const data = res.data?.data || {};
        if (data.pins) setPins(data.pins);
        if (data.recent) setRecent(data.recent);
      })
      .catch(() => undefined);
  }, [pathname]);

  useLayoutEffect(() => {
    const menusList = JSON.parse(getLocalStorageMenus() || "");
    const result = getMenus(menusList);
    const items = createMenuIcon(result);
    const data = pathname.split("/").filter(v => v);
    const [openKeys, currentKey] = getOpenKeysByUrls(data, items);
    setMenuItems(items);
    setOpenkeys(openKeys);
    setSelectedKeys(currentKey);
  }, [pathname, menuTick]);

  const onOpenChange = (openKeys: any) => {
    setOpenkeys(() => openKeys);
    setLocalStorage("cacheOpenKeys", openKeys);
  };

  const togglePin = async () => {
    const next = pins.includes(pathname) ? pins.filter(item => item !== pathname) : [pathname, ...pins.filter(item => item !== pathname)].slice(0, 50);
    try {
      const res = await putMenuPins({ pins: next });
      const data = res.data?.data || {};
      setPins(data.pins || next);
      if (data.recent) setRecent(data.recent);
    } catch {
      setPins(next);
    }
  };

  const goPath = (path: string) => {
    navigate(path);
  };

  const pinned = pins.includes(pathname);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ padding: "8px 12px 4px" }}>
        <Space size={4} style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            导航
          </Typography.Text>
          <Tooltip title={pinned ? "取消固定当前页" : "固定当前页"}>
            <Button size="small" type="text" icon={pinned ? <PushpinFilled /> : <PushpinOutlined />} onClick={togglePin} />
          </Tooltip>
        </Space>
        {pins.length ? (
          <div style={{ marginTop: 6 }}>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              固定
            </Typography.Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {pins.slice(0, 8).map(path => (
                <Button key={path} size="small" type={pathname === path ? "primary" : "default"} onClick={() => goPath(path)}>
                  {pathLabel(path)}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        {recent.length ? (
          <div style={{ marginTop: 8 }}>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              最近
            </Typography.Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {recent
                .filter(path => !pins.includes(path))
                .slice(0, 6)
                .map(path => (
                  <Button key={path} size="small" type="link" style={{ paddingInline: 4 }} onClick={() => goPath(path)}>
                    {pathLabel(path)}
                  </Button>
                ))}
            </div>
          </div>
        ) : null}
      </div>
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
