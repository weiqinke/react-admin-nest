import CreateIcon from "@/components/CreateIcon";
import { toNumber } from "lodash";

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
export const ProjectParseMenuAsPre = menuList => {
  const menus = [];
  menuList.map(menuitem => {
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

export function getNextLevelMenu(list, url) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (element.url === url) {
      return element.children || [];
    }
  }
  return [];
}

export function SaveMeUrl(list, parentUrl = "") {
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
export function getIndexUrlInfo(list) {
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
}

const getUnbendMenus = (menus = []) => {
  const result = [];
  for (let i = 0; i < menus.length; i++) {
    const item = menus[i];
    result.push(item);
    if (item.children) {
      const data = getUnbendMenus(item.children);
      result.push(...data);
    }
  }
  return result;
};

export const getOpenKeysByUrls = (urls = [], menus = []) => {
  const openKeys = [];
  let currentKey = [];
  const unbendMenus = getUnbendMenus(menus);
  urls.filter(v => {
    const data = unbendMenus.find(d => d.url === v);
    if (data?.id) {
      const id = `${data?.id}`;
      openKeys.push(id);
      currentKey = [id];
    }
  });
  return [openKeys, currentKey];
};

export const saveMenus = menus => localStorage.setItem(MENUS, menus);

export const getLocalStorageMenus = () => localStorage.getItem(MENUS) || "[]";

/**
 * 筛选菜单，dontshow不在菜单中显示
 */
export function getShowMenus(menulist: any[]) {
  const menus: any[] = menulist.map((menuitem: menuchild) => {
    const { children, dontshow } = menuitem;
    if (dontshow === "0") return null;
    var newMenuItem: any = {};
    if (children && children.length > 0) {
      var echild: any[] = getShowMenus(children);
      newMenuItem = { ...menuitem, children: echild };
    } else {
      if (children && children.length === 0) {
        newMenuItem = { ...menuitem, children: null };
        delete newMenuItem.children;
      } else {
        newMenuItem = { ...menuitem, children: null };
        delete newMenuItem.children;
      }
    }
    // 这里是为了兼容 antd Menu 组件新版写法
    newMenuItem.label = menuitem.name;
    newMenuItem.key = menuitem.id;
    newMenuItem.icon = CreateIcon(menuitem.icon);

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
export const getMenuItemByUrl = url => {
  const unbendMenus = getUnbendMenus(JSON.parse(getLocalStorageMenus()));
  return unbendMenus.find(v => v.url === url);
};

// 根据 ID 获取唯一的菜单
export const getMenuItemByID = id => {
  const unbendMenus = getUnbendMenus(JSON.parse(getLocalStorageMenus()));
  return unbendMenus.find(v => v.id === toNumber(id));
};
