import { FC, MouseEvent, useContext, useEffect, useState } from "react";
import { message, Tabs } from "antd";
import MenuTagContext from "@/contexts/MenuTagContext";
import type { MenuTagItem } from "@/contexts/MenuTagContext";
import styles from "./index.module.scss";
import Contextmenu from "./Contextmenu";
import MenuTag from "./MenuTag";

type ContextMenuState = {
  x: number;
  y: number;
  tag: MenuTagItem;
};

const TagsView: FC = () => {
  const { tags, activeUrl, switchTo, removeTag, closeOtherTags, closeLeftTags, closeRightTags, refreshPage } =
    useContext(MenuTagContext);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // 延后绑定，避免右键同一次手势立刻关掉菜单
    const timer = window.setTimeout(() => {
      window.addEventListener("click", close);
      window.addEventListener("keydown", onKeyDown);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu]);

  const onChange = (url: string) => {
    setContextMenu(null);
    switchTo(url);
  };

  const onClose = (event: MouseEvent, item: MenuTagItem) => {
    event.stopPropagation();
    event.preventDefault();
    if (tags.length <= 1) {
      message.success({ content: "请保留至少一个标签", duration: 0.5 });
      return;
    }
    removeTag(item.url);
  };

  const openContextMenu = (event: MouseEvent, tag: MenuTagItem) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, tag });
  };

  const runMenuAction = (action: (url: string) => void) => {
    if (!contextMenu) return;
    action(contextMenu.tag.url);
    setContextMenu(null);
  };

  return (
    <div className={styles.tagsdiv}>
      <Tabs
        activeKey={activeUrl}
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        items={tags.map(tag => ({
          key: tag.url,
          label: (
            <div className="m-0 bg-transparent p-0" onContextMenu={e => openContextMenu(e, tag)}>
              <MenuTag tag={tag} active={tag.url === activeUrl} onClose={onClose} />
            </div>
          )
        }))}
      />
      {contextMenu ? (
        <Contextmenu
          x={contextMenu.x}
          y={contextMenu.y}
          isActive={contextMenu.tag.url === activeUrl}
          onCloseLeft={() => runMenuAction(closeLeftTags)}
          onCloseRight={() => runMenuAction(closeRightTags)}
          onCloseOther={() => runMenuAction(closeOtherTags)}
          onRefresh={() => {
            refreshPage();
            setContextMenu(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default TagsView;
