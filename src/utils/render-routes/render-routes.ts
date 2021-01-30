/**
 * @function routesFilter routes的权限过滤
 */
export function routesFilter(routes: any[], roles: string) {
  return routes.filter(({ meta: { needLoginAuth, rolesAuth }, routes: nestRoutes, subs }) => {
    if (nestRoutes) {
      // 存在routes，对routes数组过滤，并重新赋值过滤后的routes
      nestRoutes = routesFilter(nestRoutes, roles); // 递归
    }
    if (subs) {
      // 存在subs，对subs数组过滤，并重新赋值过滤后的subs
      subs = routesFilter(subs, roles); // 递归
    }
    return !needLoginAuth ? true : rolesAuth?.includes(roles);
  });
}

/**
 * @function normalize
 * @description 递归的对route.subs做normalize，即把所有嵌套展平到一层，主要对menu树就行路由注册
 * @description 因为menu树都在同一个路由视口，所以可以在同一层级就行路由注册
 * @description 注意：path 和 component 在存在subs的那层menu-route对象中同时存在和同时不存在
 */
export function normalize(routes?: any[]) {
  let result: any[] = [];
  routes?.forEach(route => {
    !route.subs ? result.push(route) : (result = result.concat(normalize(route.subs))); // 拼接
  });
  return result;
}
