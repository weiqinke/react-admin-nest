export interface menuchild {
  authority: string;
  children: [];
  icon: string;
  name: string;
  router: string;
  meUrl?: string;
  isSubMenu?: number;
}
export function ProjectParseMenu(menulist: menuchild[]) {
  let menus: menuchild[] = [];
  menulist.map((item: menuchild) => {
    if (item.children) {
      menus = item.children;
    }
    return true;
  });
  console.log('menus: ', menus);
  return menus;
}
/*****
 * 清除菜单中的空节点，当成一个菜单
 */
export function ProjectParseMenuAsPre(menulist: menuchild[]) {
  let menus: any[] = [];
  menulist.map((menuitem: menuchild) => {
    const { authority, children, icon, meUrl, name, router } = menuitem;
    var newMenuItem = {};
    if (children && children.length > 0) {
      var echild: any[] = ProjectParseMenuAsPre(children);
      newMenuItem = { authority, icon, meUrl, name, router, children: echild, isSubMenu: 1 };
    } else {
      if (children && children.length === 0) {
        newMenuItem = { authority, icon, meUrl, name, router, isSubMenu: 1 };
      } else {
        newMenuItem = { authority, icon, meUrl, name, router, isSubMenu: 0 };
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
  if (menulist && menulist.length > 0 && menulist[0]['children']) {
    return menulist[0]['children'];
  }
  return [];
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

//获取首页路径
export function getIndexUrl(list: menuchild[]) {
  var str = '';
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (index === 0) {
      str += '/' + element.router;
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
    if (element.router === url) {
      return element.children || [];
    }
  }
  return [];
}

export function SaveMeUrl(list: menuchild[], parentUrl: string = '/') {
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    element.meUrl = parentUrl + '/' + element.router;
    if (element.children && element.children.length > 0) {
      SaveMeUrl(element.children, element.meUrl);
    }
  }
  return list;
}
