const menuItems: any = [
  {
    alwaysShow: true,
    component: "Layout",
    hidden: false,
    meta: { icon: "system", noCache: true, title: "统计面板" },
    name: "dashboard",
    path: "/dashboard"
  },
  {
    alwaysShow: true,
    children: [
      {
        component: "system/user/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "后台用户管理" },
        name: "User",
        path: "user"
      }
    ],
    component: "Layout",
    hidden: false,
    meta: { icon: "system", noCache: true, title: "系统管理" },
    name: "system",
    path: "/system",
    redirect: "noredirect"
  },
  {
    alwaysShow: true,
    children: [
      {
        component: "weapp/periodical/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "期刊管理" },
        name: "Periodical",
        path: "periodical"
      },
      {
        component: "weapp/weappuser/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "用户管理" },
        name: "weappuser",
        path: "weappuser"
      },
      {
        component: "weapp/banner/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "轮播图管理" },
        name: "banner",
        path: "banner"
      },
      {
        component: "weapp/article/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "文章管理" },
        name: "article",
        path: "article"
      },
      {
        component: "weapp/redeemcode/index",
        hidden: false,
        meta: { icon: "peoples", noCache: true, title: "兑换码管理" },
        name: "redeemcode",
        path: "redeemcode"
      },
      {
        component: "weapp/articleinfo/index",
        hidden: true,
        meta: { icon: "peoples", noCache: true, title: "文章详情" },
        name: "articleinfo",
        path: "articleinfo"
      }
    ],
    component: "Layout",
    hidden: false,
    meta: { icon: "monitor", noCache: true, title: "小程序内容管理" },
    name: "weapp",
    path: "/weapp",
    redirect: "noredirect"
  }
];

const creteMenu = (items: any, list: any[]) => {
  const parentPath: any = list?.length > 0 ? `${list.join("/")}/` : "";
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    element.label = element?.meta?.title;
    element.key = `${parentPath}${element.path}`;
    delete element.alwaysShow;
    if (element.children) {
      // 需要过滤掉不该显示的菜单
      const showChildrens = element?.children.filter(v => !v?.hidden);
      element.children = creteMenu(showChildrens, [...list, element.path]);
    }
  }

  return items;
};

export const menus = creteMenu(menuItems, []);
