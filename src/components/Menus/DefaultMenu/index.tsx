import MenuTagContext from "@/contexts/MenuTagContext";
import { getLocalStorageMenus, getOpenKeysByUrls, getShowMenus, setLocalStorage } from "@/utils/menuUtils";
import { Menu } from "antd";
import { toNumber } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DefaultMenu = () => {
  const { addTag } = useContext(MenuTagContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menusList = JSON.parse(getLocalStorageMenus() || "");
  const newmenus = getShowMenus(menusList.concat());

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenkeys] = useState([]);

  // 点击 menuItem 触发的事件
  const onClick = props => {
    const { keyPath, key } = props;
    // key 是指 嵌套到最底层的那一层菜单 key
    // keyPath 是指 由深到浅组成的数组
    // keyPath 是当前所有的菜单，我们需要把菜单拼接起来，记住，从后往前
    const menuPath: string[] = keyPath.map(v => toNumber(v)).reverse();
    let changeMenus = menusList.concat();
    let urls = [];
    let activeKey = "";
    menuPath.map(item => {
      const result = changeMenus.find(v => v.id === parseInt(item));
      urls.push(result?.url || "");
      activeKey = result?.url;
      if (result.children) changeMenus = result.children;
    });
    navigate("/" + urls.join("/"));
    setOpenkeys(() => keyPath); // 修改当前组件的state
    setSelectedKeys(() => [key]);
    addTag(urls, key);
  };

  useEffect(() => {
    // 说明：
    // (1)
    // 这里要考虑 ( 登陆第一次跳转的加载 ) 和 ( 刷新浏览器的加载 )
    // 不管哪种情况，都获取当前的 pathname，当前pathname是 ( path和menu的keys要一致的原因  )
    // 如果第一次刷新，是不是可以直接从地址栏解析出 id ？
    const data = pathname.split("/").filter(v => v);
    const [openKeys, currentKey] = getOpenKeysByUrls(data, newmenus);
    setOpenkeys(openKeys);
    setSelectedKeys(currentKey);
  }, []);

  // 展开/关闭的回调
  const onOpenChange = (openKeys: any) => {
    setOpenkeys(() => openKeys);
    setLocalStorage("cacheOpenKeys", openKeys); // 记住展开关闭的组，刷新持久化
  };

  return (
    <div style={{ width: "100%" }}>
      <Menu
        mode="inline"
        theme="dark"
        onClick={onClick}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={newmenus}
      />
    </div>
  );
};
export default DefaultMenu;
