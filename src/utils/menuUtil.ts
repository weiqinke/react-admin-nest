export interface menuchild {
  authority: string;
  children: [];
  icon: string;
  name: string;
  router: string;
  meUrl?: string;
  isSubMenu?: number;
  url?: string;
  hiddMenu?: string;
}
export function ProjectParseMenu(menulist: menuchild[]) {
  let menus: menuchild[] = [];
  menulist.map((item: menuchild) => {
    if (item.children) {
      menus = item.children;
    }
    return true;
  });
  return menus;
}

/*****
 * 清除菜单中的空节点，当成一个菜单
 */
export function ProjectParseMenuAsPre(menulist: menuchild[]) {
  let menus: any[] = [];
  menulist.map((menuitem: menuchild) => {
    const { children } = menuitem;
    var newMenuItem: any = {};
    if (children && children.length > 0) {
      var echild: any[] = ProjectParseMenuAsPre(children);
      newMenuItem = { ...menuitem, children: echild, isSubMenu: 1 };
    } else {
      if (children && children.length === 0) {
        newMenuItem = { ...menuitem, isSubMenu: 1 };
        delete newMenuItem.children;
      } else {
        newMenuItem = { ...menuitem, isSubMenu: 0 };
        delete newMenuItem.children;
      }
    }
    menus.push(newMenuItem);
    return true;
  });
  return menus;
}

/****
 * 获取菜单 root不是菜单，取第二层及
 */
export function getSystemMenu(menulist: menuchild[]) {
  return menulist;
}

/****
 * 获取菜单tag唯一的
 */
export function getTagByMenus(menulist: any[], prevActiveTagUrl: string) {
  var menuitem = null;
  menulist.map(item => {
    if (item.meUrl === prevActiveTagUrl) {
      menuitem = item;
    }
    if (item.children && item.children.length > 0) {
      const childitem = getTagByMenus(item.children, prevActiveTagUrl);
      if (childitem) {
        menuitem = childitem;
      }
    }
    return true;
  });
  return menuitem;
}

/**
 * 筛选菜单，hiddMenu不在菜单中显示
 */
export function getShowMenus(menulist: any[]) {
  let menus: any[] = [];
  menulist.map((menuitem: menuchild) => {
    const { children, hiddMenu } = menuitem;
    if (hiddMenu === '0') {
      return true;
    }
    var newMenuItem: any = {};
    if (children && children.length > 0) {
      var echild: any[] = getShowMenus(children);
      newMenuItem = { ...menuitem, children: echild, isSubMenu: 1 };
    } else {
      if (children && children.length === 0) {
        newMenuItem = { ...menuitem, children: null, isSubMenu: 1 };
        delete newMenuItem.children;
      } else {
        newMenuItem = { ...menuitem, children: null, isSubMenu: 0 };
        delete newMenuItem.children;
      }
    }
    menus.push(newMenuItem);
    return true;
  });
  return menus;
}

//获取首页路径
export function getIndexUrl(list: menuchild[]) {
  var str = '';
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (index === 0) {
      str += '/' + element.url;
      if (element.children && element.children.length >= 1) {
        str += getIndexUrl(element.children);
      }
    }
  }
  return str;
}
//获取第一个菜单的详细信息，认为它就是首页
export function getIndexUrlInfo(list: menuchild[]) {
  var info = null;
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (index === 0) {
      if (element.children && element.children.length >= 1) {
        const childinfo: menuchild | unknown = getIndexUrlInfo(element.children);
        if (childinfo) {
          info = childinfo;
        }
      } else {
        info = element;
      }
    }
  }
  return info;
}

export function getNextLevelMenu(list: menuchild[], url: string) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (element.url === url) {
      return element.children || [];
    }
  }
  return [];
}
export function SaveMeUrl(list: menuchild[], parentUrl: string = '') {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    element.meUrl = parentUrl + '/' + element.url;
    if (element.children && element.children.length > 0) {
      SaveMeUrl(element.children, element.meUrl);
    }
  }
  return list;
}

export const findMenuOpenKeys = (menus: any) => {
  if (!menus) {
    return [];
  }
  const cacheUrlList = [menus.meUrl];
  if (menus.children && menus.children.length > 0) {
    const [firstChild] = menus.children;
    const childUrls = findMenuOpenKeys(firstChild);
    Array.prototype.push.apply(cacheUrlList, childUrls);
  }
  return cacheUrlList;
};

/****
 * 获取菜单中有没有指定的url
 */
export function isMyMenusUrl(menulist: any[], url: string) {
  var patch = false;
  menulist.map(item => {
    if (item.meUrl === url) {
      patch = true;
      return true;
    }
    if (item.children && item.children.length > 0) {
      const childflag = isMyMenusUrl(item.children, url);
      if (childflag) {
        patch = childflag;
        return true;
      }
    }
    return true;
  });
  return patch;
}

// localStorage 存
export function setLocalStorage(name: string, data: any) {
  const dataStr = JSON.stringify(data);
  window.sessionStorage.setItem(name, dataStr);
}

// localStorage 取
export function getLocalStorage(name: string) {
  const dataStr = window.sessionStorage.getItem(name);
  return dataStr && JSON.parse(dataStr);
}
