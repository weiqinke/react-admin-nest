import React, { FC, useEffect, useState } from 'react';
import { Tabs, message } from 'antd';
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
  };

  //关闭标签时，从tags中删除指定标签
  const onClose = (meUrl: string) => {
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
  const contextTag = (event: any, tag: any, tagindex: any) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event;
    setPageclientX(clientX);
    setPageclientY(clientY);
    dispatch(setTagPlanVisible(true));
  };

  const handleCloseOtherTags = () => {
    dispatch(removeOtherTag(activeTagMeUrl));
    dispatch(setTagPlanVisible(false));
  };
  const handleCloseLeftTags = () => {
    dispatch(removeLeftTag(activeTagMeUrl));
    dispatch(setTagPlanVisible(false));
  };
  const handleCloseRightTags = () => {
    dispatch(removeRightTag(activeTagMeUrl));
    dispatch(setTagPlanVisible(false));
  };
  const RefreshNowPage = () => {
    /***刷新页面没有实现 */
    dispatch(setTagPlanVisible(false));
    const nowTag: any = getTagByMenus(menuList, location.pathname);
    dispatch(
      addTag({
        ...nowTag,
        closable: true
      })
    );
    const { meUrl } = nowTag;
    dispatch(
      setRefreshFCUrl({
        RefreshFCUrl: 'loading'
      })
    );
    setTimeout(() => {
      dispatch(
        setRefreshFCUrl({
          RefreshFCUrl: meUrl
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTagMeUrl, prevActiveTagUrl]);

  return (
    <div id="pageTabs" style={{ background: '#fff', padding: '6px 4px' }}>
      <Tabs
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        activeKey={activeTagMeUrl}
        type="editable-card"
        hideAdd
        onEdit={(targetKey, action) => action === 'remove' && onClose(targetKey as string)}
      >
        {tags.map((tag, tagindex) => (
          <TabPane
            tab={
              <span
                className="textshow"
                onContextMenu={e => {
                  contextTag(e, tag, tagindex);
                }}
              >
                {tag.name}
                <b className="contextb"></b>
              </span>
            }
            key={tag.meUrl}
            closable={tag.closable}
          ></TabPane>
        ))}
      </Tabs>
      {tagPlanVisible ? (
        <ul
          className="contextmenuDom"
          style={{ left: `${pageclientX}px`, top: `${pageclientY}px` }}
          // ref={this.contextMenuContainer}
        >
          <li onClick={handleCloseLeftTags}>关闭左侧</li>
          <li onClick={handleCloseRightTags}>关闭右侧</li>
          <li onClick={handleCloseOtherTags}>关闭其他</li>
          <li onClick={RefreshNowPage}>刷新页面</li>
        </ul>
      ) : null}
    </div>
  );
};

export default TagsView;
