import React, { FC, useEffect, useState } from 'react';
import { message, Tabs } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import usePrevious from 'hooks/usePrevious';
import { useAppDispatch, useAppState } from 'stores';
import {
  addTag,
  removeTag,
  removeLeftTag,
  removeRightTag,
  removeOtherTag,
  setActiveTag,
  setTagPlanVisible
} from 'stores/tags-view.store';
import { getTagByMenus } from 'utils/menuUtil';
import './tagView.less';
import { setRefreshFCUrl } from 'stores/user.store';
import { setChangeFixedMenu } from 'stores/menu.store';
import { CloseOutlined } from '@ant-design/icons';
import { MyTagShow } from './drag';
const { TabPane } = Tabs;
const TagsView: FC = () => {
  const { tags, activeTagMeUrl, tagPlanVisible } = useAppState(state => state.tagsView);
  const { menuList } = useAppState(state => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const prevActiveTagUrl = usePrevious(activeTagMeUrl);
  // 切换标签时触发事件，切换页面地址
  const onChange = (meUrl: string) => {
    dispatch(setTagPlanVisible(false));
    dispatch(setActiveTag(meUrl));
    //此时需要重组
    const toplevel = meUrl.split('/')[1];
    const MenuHasChildren: any[] = menuList.filter((menuitem: any) => {
      return menuitem.router === toplevel && menuitem.children && menuitem.children.length > 0;
    });
    dispatch(
      setChangeFixedMenu({
        changeFixedMenu: MenuHasChildren
      })
    );
    // const [nextMenuItem] = MenuHasChildren;
    // const cacheOpenKeys = findMenuOpenKeys(nextMenuItem);
    // setLocalStorage('cacheOpenKeys', cacheOpenKeys); // 记住展开关闭的组，刷新持久化
    // 此处是指切换标签时，想切换左边的菜单选中状态，实际操作后发现，同一个菜单下的子菜单，切换时会闭合掉，暂时不追此问题，
    //我分析是 切换时。切换了tab 导致最后一次记录被清空，所以菜单也分不清该展开谁。
  };

  //关闭标签时，从tags中删除指定标签
  const onClose = (event: any, changeItem: any) => {
    event.stopPropagation();
    event.preventDefault();
    const { meUrl } = changeItem;
    if (tags && tags.length <= 1) {
      message.success({
        content: '请保留至少一个标签',
        duration: 0.5
      });
      return;
    }
    dispatch(removeTag(meUrl));
  };
  const [pageclientX, setPageclientX] = useState(0);
  const [pageclientY, setPageclientY] = useState(0);
  const [contTag, setContTag] = useState('');
  const contextTag = (event: any, tag: any) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event;
    setPageclientX(clientX);
    setPageclientY(clientY);
    setContTag(tag.meUrl || '');

    dispatch(setTagPlanVisible(true));
  };

  const handleCloseOtherTags = () => {
    dispatch(removeOtherTag(contTag));
    dispatch(setTagPlanVisible(false));
  };
  const handleCloseLeftTags = () => {
    dispatch(removeLeftTag(contTag));
    dispatch(setTagPlanVisible(false));
  };
  const handleCloseRightTags = () => {
    dispatch(removeRightTag(contTag));
    dispatch(setTagPlanVisible(false));
  };
  const RefreshNowPage = () => {
    dispatch(setTagPlanVisible(false));
    dispatch(
      setRefreshFCUrl({
        RefreshFlag: true
      })
    );
    setTimeout(() => {
      dispatch(
        setRefreshFCUrl({
          RefreshFCUrl: 'loading',
          RefreshFlag: false
        })
      );
    }, 100);
  };
  useEffect(() => {
    if (menuList.length) {
      /** 页面刷新了，需要给他找到默认标签*/
      const nowTag: any = getTagByMenus(menuList, location.pathname);
      if (nowTag) {
        dispatch(
          addTag({
            ...nowTag,
            closable: true
          })
        );
        onChange(nowTag.meUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.pathname, menuList]);

  useEffect(() => {
    // 如果两次的id不一样，就跳转到新地址
    if (prevActiveTagUrl !== activeTagMeUrl) {
      const tag = tags.find(tag => tag.meUrl === activeTagMeUrl) || tags[0];
      if (tag && tag.meUrl) {
        navigate(tag.meUrl);
      }
    }
  }, [activeTagMeUrl, prevActiveTagUrl, tags, navigate]);

  return (
    <div id="pageTabs" className="tagsdiv">
      <Tabs
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        activeKey={activeTagMeUrl}
        tabBarExtraContent={<span></span>}
      >
        {tags.map(tag => (
          <TabPane
            tab={
              <div
                className="tagitem"
                onContextMenu={e => {
                  contextTag(e, tag);
                }}
              >
                <MyTagShow tag={tag}>
                  <CloseOutlined
                    className="close"
                    onClick={e => {
                      onClose(e, tag);
                    }}
                  />
                </MyTagShow>
              </div>
            }
            key={tag.meUrl}
            closable={tag.closable}
            className="changettag"
          ></TabPane>
        ))}
      </Tabs>
      {/***
      <DragDropContext onDragEnd={onDragEnd}>
        <Drop type={'COLUMN'} direction={'horizontal'} droppableId={'kanban'}>
          <DropChild className='DropChild'>
            {tags.map((tag: any, tagindex: any) => (
              <Drag key={tag.meUrl} index={tagindex} draggableId={'task' + tag.meUrl}>
                <div
                  className="tagitem"
                  onContextMenu={e => {
                    contextTag(e, tag);
                  }}
                >
                  <MyTagShow tag={tag}>
                    <CloseOutlined
                      className="close"
                      onClick={e => {
                        onClose(e, tag);
                      }}
                    />
                  </MyTagShow>
                </div>
              </Drag>
            ))}
          </DropChild>
        </Drop>
      </DragDropContext>
      ** */}
      {tagPlanVisible ? (
        <ul className="contextmenuDom" style={{ left: `${pageclientX}px`, top: `${pageclientY}px` }}>
          <li onClick={handleCloseLeftTags}>关闭左侧</li>
          <li onClick={handleCloseRightTags}>关闭右侧</li>
          <li onClick={handleCloseOtherTags}>关闭其他</li>
          {contTag && contTag === activeTagMeUrl ? <li onClick={RefreshNowPage}>刷新页面</li> : ''}
        </ul>
      ) : null}
    </div>
  );
};

export default TagsView;
