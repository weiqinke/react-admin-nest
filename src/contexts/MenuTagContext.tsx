import { getMenuItemByID, getMenuItemByUrl } from "@/utils/menuUtils";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuTagContext = React.createContext({
  tags: [],
  setTags: () => null,
  addTag: () => {},
  activeUrl: "",
  setActiveUrl: () => null,
  tagPlanVisible: "",
  setTagPlanVisible: () => null,
  refresh: true,
  setRefresh: () => null
});

type MenuTagProps = {
  url: string;
  closable: boolean;
  name: string;
  active: boolean;
};

export const MenuTagContextProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tags, setTags] = useState<MenuTagProps[]>([]);
  const [activeUrl, setActiveUrl] = useState("");
  const [tagPlanVisible, setTagPlanVisible] = useState("");
  const [refresh, setRefresh] = useState(false);

  const addTag = (tag, id) => {
    const url = tag.join("/");
    const path = `/${url}`;
    const isRepeat = tags.find(v => v.url === path);
    if (isRepeat) {
      setTags(v => {
        return v.map(d => {
          d.active = d.url === path;
          return d;
        });
      });
    } else {
      const item = getMenuItemByID(id);
      // 如果没有设置该菜单，就不添加标签了
      if (!item) return;
      const res = tags.map(v => {
        v.active = false;
        return v;
      });
      setTags([
        ...res,
        {
          url: path,
          closable: false,
          name: item.name,
          active: true
        }
      ]);
    }
  };

  useEffect(() => {
    if (!tags.length) {
      const url = location?.pathname;
      const initItem = getMenuItemByUrl(url.split("/").pop());
      setTags([
        {
          url,
          closable: false,
          name: initItem?.name,
          active: true
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname]);

  useEffect(() => {
    if (activeUrl) navigate(activeUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUrl]);

  return (
    <MenuTagContext.Provider
      value={{
        tags,
        setTags,
        addTag,
        activeUrl,
        setActiveUrl,
        tagPlanVisible,
        setTagPlanVisible,
        refresh,
        setRefresh
      }}>
      {children}
    </MenuTagContext.Provider>
  );
};

export default MenuTagContext;
