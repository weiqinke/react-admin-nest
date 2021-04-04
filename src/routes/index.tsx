import React, { FC } from 'react';
import WrapperRouteComponent from './config';
import { useRoutes } from 'react-router-dom';
import SystemPages from 'routes/SystemMenuConfig';
const RenderRouter: FC = () => {
  const crateROuter = (routerItem: any) => {
    routerItem.map((item: any) => {
      item.path = item.url;
      item.key = item.url;
      item.element = (
        <WrapperRouteComponent
          element={item.routerDom}
          title={item.title}
          auth={item.auth}
          url={item.url}
          hiddMenu={false}
        />
      );
      //释放routerDom属性，释放内存;
      delete item.routerDom;
      if (item.children && item.children.length > 0) {
        crateROuter(item.children);
      }
      return item;
    });
    return routerItem;
  };
  const newRouters: any = crateROuter(SystemPages);
  const StartRouters = useRoutes(newRouters);
  return StartRouters;
};

export default RenderRouter;
