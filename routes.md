# 路由清单

来源：`src/router/router.tsx`。

一共 **25** 条：18 个页面、4 个布局、3 个通配。

`/` 这一层要求登录，它下面的页面都包在这个布局里。`auth` 一列按源码原样列出，没写就是源码里没有这个字段。

| 路径                         | 类型 | 标题         | auth | 页面           |
| ---------------------------- | ---- | ------------ | ---- | -------------- |
| （无 path）                  | 布局 |              |      | ProjectLayout  |
| `/login`                     | 页面 | Login        | 否   | Login          |
| `/`                          | 布局 |              | 是   | DefaultLayout  |
| `/`                          | 页面 | 关于         | 是   | About          |
| `/workplace`                 | 页面 | 工作台       | 是   | Workplace      |
| `/workbench`                 | 页面 | 工作台       | 是   | Workbench      |
| `/music`                     | 页面 | 音乐排行榜   | 是   | MusicChart     |
| `/bmap`                      | 页面 | 百度地图     | 是   | BMap           |
| `/charts`                    | 布局 | 图表模块     | 是   | Outlet         |
| `/charts/AreaCharts`         | 页面 | AreaCharts   |      | AreaChart      |
| `/charts/d3example`          | 页面 | D3图例       | 是   | D3Example      |
| `/charts/animate`            | 页面 | D3图例       | 是   | AnimateCard    |
| `/management`                | 布局 | 系统管理     |      | Outlet         |
| `/management/useradmin`      | 页面 | useradmin    |      | UserAdmin      |
| `/management/menuadmin`      | 页面 | menuadmin    |      | MenuAdmin      |
| `/management/roleadmin`      | 页面 | roleadmin    |      | RoleAdmin      |
| `/management/labelsadmin`    | 页面 | labelsadmin  |      | LabelsAdmin    |
| `/management/placardadmin`   | 页面 | 标签管理     |      | PlacardAdmin   |
| `/management/websocketadmin` | 页面 | 在线用户管理 |      | WebsocketAdmin |
| `/management/*`              | 通配 | notFound     |      | NotFoundPage   |
| `/about`                     | 页面 | 关于         | 是   | About          |
| `/account`                   | 页面 | 个人信息     | 是   | Account        |
| `/profile`                   | 页面 | 个人中心     | 是   | UserProfile    |
| `/*`                         | 通配 | NotFound     | 是   | NotFoundPage   |
| `*`                          | 通配 |              |      | NotFoundPage   |
