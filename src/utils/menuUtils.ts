import { toNumber } from "lodash-es";

export interface menuchild {
  authority: string;
  children: [];
  icon: string;
  name: string;
  router: string;
  meUrl?: string;
  url?: string;
  dontshow?: string;
}

const MENUS = "menus";
/*****
 * 清除菜单中的空节点，当成一个菜单
 */
export const ProjectParseMenuAsPre = (menuList: any[]) => {
  const menus: any[] = [];
  menuList.map((menuitem: { children: any }) => {
    const { children } = menuitem;
    let newMenuItem: any = {};
    if (children && children.length > 0) {
      const echild = ProjectParseMenuAsPre(children);
      newMenuItem = { ...menuitem, children: echild };
    } else {
      if (children && children.length === 0) {
        newMenuItem = { ...menuitem };
        delete newMenuItem?.children;
      } else {
        newMenuItem = { ...menuitem };
        delete newMenuItem?.children;
      }
    }
    menus.push(newMenuItem);
    return true;
  });
  return menus;
};

export function getNextLevelMenu(list: string | any[], url: any) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (element.url === url) {
      return element.children || [];
    }
  }
  return [];
}

export function SaveMeUrl(list: string | any[], parentUrl = "") {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    element.meUrl = parentUrl + "/" + element.url;
    if (element.children && element.children.length > 0) {
      SaveMeUrl(element.children, element.meUrl);
    }
  }
  return list;
}

//获取第一个菜单的详细信息，认为它就是首页
export const getIndexUrlInfo: any = (list: string | any[]) => {
  let info = null;
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (index === 0) {
      if (element.children && element.children.length >= 1) {
        const childInfo = getIndexUrlInfo(element.children);
        if (childInfo) info = childInfo;
      } else {
        info = element;
      }
    }
  }
  return info;
};

const getUnbendMenus: any = (menus = []) => {
  const result = [];
  for (let i = 0; i < menus.length; i++) {
    const item: any = menus[i];
    result.push(item);
    if (item.children) {
      const data = getUnbendMenus(item.children);
      result.push(...data);
    }
  }
  return result;
};

export const getOpenKeysByUrls = (urls = [], menus = []) => {
  const openKeys: string[] = [];
  let currentKey: string[] = [];
  const unbendMenus = getUnbendMenus(menus);
  urls.filter(v => {
    const data = unbendMenus.find((d: { url: any }) => d.url === v);
    if (data?.id) {
      const id = `${data?.id}`;
      openKeys.push(id);
      currentKey = [id];
    }
  });
  return [openKeys, currentKey];
};

export const saveMenus = (menus: string) => localStorage.setItem(MENUS, menus);

export const getLocalStorageMenus = () => localStorage.getItem(MENUS) || "[]";

export const getIndexUrl = () => {
  const allMenusInfo = SaveMeUrl(ProjectParseMenuAsPre(JSON.parse(getLocalStorageMenus())), "");
  //找到第一个url直接跳转过去吧
  const indexTag = getIndexUrlInfo(allMenusInfo);
  return { pathname: indexTag.meUrl };
};

/**
 * 筛选菜单，dontshow不在菜单中显示
 */
export function getShowMenus(menulist: any[]) {
  const menus: any[] = menulist.map((menuitem: any) => {
    const { children, dontshow } = menuitem;
    if (dontshow === "0") return null;
    let newMenuItem: any = {};
    if (children && children.length > 0) {
      const echild: any[] = getShowMenus(children);
      newMenuItem = { ...menuitem, children: echild };
    } else {
      newMenuItem = { ...menuitem, children: null,type:"page" };
      delete newMenuItem.children;
    }
    // 这里是为了兼容 antd Menu 组件新版写法
    newMenuItem.label = menuitem.name;
    newMenuItem.key = menuitem.id;

    delete newMenuItem.menuUid;
    delete newMenuItem.parentUid;

    return newMenuItem;
  });
  return menus.filter(v => v);
}

// localStorage 存
export function setLocalStorage(name: string, data: any) {
  const dataStr = JSON.stringify(data);
  window.localStorage.setItem(name, dataStr);
}

// localStorage 取
export function getLocalStorage(name: string) {
  const dataStr = window.localStorage.getItem(name);
  return dataStr && JSON.parse(dataStr);
}

/****
 * 获取菜单tag唯一的
 */
export function getTagByMenus(menulist: any[], prevActiveTagUrl: string) {
  let menuitem = null;
  menulist.map(item => {
    if (item.meUrl === prevActiveTagUrl) menuitem = item;
    if (item.children && item.children.length > 0) {
      const childitem = getTagByMenus(item.children, prevActiveTagUrl);
      if (childitem) menuitem = childitem;
    }
  });
  return menuitem;
}

// 获取唯一的菜单
export const getMenuItemByUrl = (url: any) => {
  const unbendMenus = getUnbendMenus(JSON.parse(getLocalStorageMenus()));
  return unbendMenus.find((v: { url: any }) => v.url === url);
};

// 根据 ID 获取唯一的菜单
export const getMenuItemByID = (id: any) => {
  const unbendMenus = getUnbendMenus(JSON.parse(getLocalStorageMenus()));
  return unbendMenus.find((v: { id: number }) => v.id === toNumber(id));
};
