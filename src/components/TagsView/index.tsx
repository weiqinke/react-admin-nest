import React, { FC, useContext, useEffect, useState } from "react";
import { message, Tabs } from "antd";
import MenuTagContext from "@/contexts/MenuTagContext";

import styles from "./index.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { getMenuItemByUrl } from "@/utils/menuUtils";
import Contextmenu from "./Contextmenu";
import MenuTag from "./MenuTag";

const TagsView: FC = () => {
  const { tags, setTags, activeUrl, setActiveUrl, tagPlanVisible, setTagPlanVisible, setRefresh } = useContext(MenuTagContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [pageclientX, setPageclientX] = useState(0);
  const [pageclientY, setPageclientY] = useState(0);
  const [contextMenuTag, setContextMenuTag] = useState<any>();

  // 切换标签时触发事件，切换页面地址
  const onChange = (url: string) => {
    setTagPlanVisible(false);
    setTags(prev => {
      return prev.map(v => {
        v.active = v.url === url;
        return v;
      });
    });
    setActiveUrl(url);
  };

  //关闭标签时，从tags中删除指定标签
  const onClose = (event: any, item: any) => {
    event.stopPropagation();
    event.preventDefault();
    if (tags && tags.length <= 1) {
      return message.success({
        content: "请保留至少一个标签",
        duration: 0.5
      });
    }
    removeTag(item);
  };

  const contextTag = (event: any, tag: any) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event;
    setPageclientX(clientX);
    setPageclientY(clientY);
    setContextMenuTag(tag);
    setTagPlanVisible(true);
  };

  // 关闭其他标签
  const handleCloseOtherTags = () => {
    const item = tags.find(v => v.url === contextMenuTag.url);
    item.active = true;
    setActiveUrl(item.url);
    setTags([item]);
    setTagPlanVisible(false);
  };

  // 关闭左侧标签
  const handleCloseLeftTags = () => {
    const index = tags.findIndex(v => v.url === contextMenuTag.url);
    const activeIndex = tags.findIndex(v => v.active);
    const arr = tags.slice(index);
    if (activeIndex < index) {
      setActiveUrl(arr[0]["url"]);
      arr[0]["active"] = true;
    }
    setTags(arr);
  };

  // 关闭右侧标签
  const handleCloseRightTags = () => {
    const index = tags.findIndex(v => v.url === contextMenuTag.url);
    // 如果右侧的菜单有选中值 就把最后一个当作 active
    const activeIndex = tags.findIndex(v => v.active);
    setTagPlanVisible(false);
    const arr = tags.slice(0, index + 1);
    if (activeIndex > index) {
      setActiveUrl(tags[index]["url"]);
      arr[index]["active"] = true;
    }
    setTags(arr);
  };

  // 刷新当前页面
  const refreshPage = () => {
    setTagPlanVisible(false);
    setRefresh(true);
    setTimeout(() => setRefresh(false), 2000);
  };

  const removeTag = ({ url, active }) => {
    // 只剩下一个了，别删除了
    if (tags.length <= 1) return;
    const tagList = tags.filter(tag => tag.url !== url);
    // 如果删除的是选中的
    if (active) {
      tagList[tagList.length - 1]["active"] = true;
      setActiveUrl(tagList[tagList.length - 1]["url"]);
    }
    setTags(tagList);
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
  }, [location?.pathname]);

  useEffect(() => {
    if (activeUrl) navigate(activeUrl);
  }, [activeUrl]);

  return (
    <div className={styles.tagsdiv}>
      <Tabs
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        tabBarExtraContent={<span></span>}
        items={tags.map((tag: any) => {
          return {
            label: (
              <div className={styles.tagitem} onContextMenu={e => contextTag(e, tag)}>
                <MenuTag tag={tag} onClose={onClose} />
              </div>
            ),
            key: tag.url,
            closable: true
          };
        })}
      />
      {tagPlanVisible ? (
        <Contextmenu
          pageclientX={pageclientX}
          pageclientY={pageclientY}
          handleCloseLeftTags={handleCloseLeftTags}
          handleCloseRightTags={handleCloseRightTags}
          handleCloseOtherTags={handleCloseOtherTags}
          contextMenuTag={contextMenuTag}
          refreshPage={refreshPage}
        />
      ) : null}
    </div>
  );
};

export default TagsView;
