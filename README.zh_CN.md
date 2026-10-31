[English](./README.md) | 简体中文

# Nest Admin（react-admin-nest）

React 管理端，对接后端 [go_ai / goadmin](https://github.com/weiqinke/go_ai)。当前版本 `2.0.0`。

- 预览: https://nest-admin.com
- Github: https://github.com/weiqinke/react-admin-nest

接口约定以仓库内 [`api.md`](./api.md) 为准。HTTP JSON 一律是 `{ code, message, data }`，成功时 `code = 0`。用户 ID 是雪花 ID，JSON 里是字符串，前端不要转成 Number。

## 功能

| 模块 | 说明 |
| --- | --- |
| 登录鉴权 | 图形验证码、RSA-OAEP 加密密码、JWT access/refresh、注册开关、找回/重置密码、邮件邀请 |
| 账号安全 | 修改密码、TOTP、会话列表、受信设备、敏感写操作二次验证 |
| OAuth | GitHub、Gitee、企业 OIDC 登录与账号绑定 |
| 权限 | 用户、角色、权限码、菜单；角色约束（SSD/DSD）；按部门的数据范围 |
| 组织 | 部门树、岗位 |
| 公告 | 发布、必读 Gate、已读明细、未读催办 |
| 标签 / 字典 | 全局标签；字典类型与条目，支持 CSV 导入导出 |
| 站内信 | 铃铛（通知 / 消息 / 待办）、消息中心、按事件的通知偏好 |
| 操作审计 | 按数据范围过滤的列表、详情与 CSV 导出 |
| 实时 | 在线用户、强制下线、截屏、订阅上下线 |
| 运维 | 系统参数、出站 Webhook、功能开关、定时任务、API 密钥、变更日志 |
| 工单 | 我的工单；管理端列表、模板、自动分派 |
| AI | 模型配置与站内对话（需 `ai:use`） |
| 工作台 | 首页摘要、访问统计图，以及图表 / 地图演示页 |

侧栏菜单来自 `GET /api/me/menus`。本仓库里的路由，只有当前用户被授予对应菜单时才会出现。

## 技术栈

React 19 · Vite 8 · TypeScript · Ant Design 6 · React Router 8 · Axios · ECharts / D3 · Tailwind 4

- Node `>= 22.22.0`
- pnpm `12.15.0`（`package.json` 的 `packageManager`）

## 快速开始

先启动 goadmin。开发服务把 `/api`、`/health` 代理到 `http://127.0.0.1:8080`。开发环境下 WebSocket 直连该地址（`/gows` 不走 Vite 代理）。

```bash
git clone https://github.com/weiqinke/react-admin-nest.git
cd react-admin-nest
corepack enable
pnpm install
pnpm dev
```

打开 Vite 打印的地址（带 `--host`）。用下方种子账号登录。

生产构建默认走当前网站同源：浏览器请求本站的 `/api` 和 `/gows`，由 Nginx 反代到 goadmin。只有接口在另一个域名时，才设置 GitHub Actions 变量 `DEPLOY_API_ORIGIN`（该源需要已开 CORS）。说明见 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 和 [`deploy/nginx.conf.example`](./deploy/nginx.conf.example)。

## 演示账号

由后端种子数据提供：

| 用户 | 密码 | 说明 |
| --- | --- | --- |
| `admin` | `admin123` | 管理端联调首选 |
| `user` | `user123` | 普通用户 |
| `cashier1` | `cashier123` | 出纳 |
| `accountant1` | `account123` | 会计；与出纳 SSD 互斥 |
| `dual1` | `dual123` | manager + cashier；登录须传 `active_roles`（DSD） |

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发服务（`vite --host`） |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览构建产物（同样代理 `/api`） |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm prettier` | Prettier 格式化 |

`ANALYZE=1 pnpm build` 会生成包体积报告 `analysis-chart.html`。

## 路由

无需登录：

- `/login` · `/password/forgot` · `/password/reset` · `/invite`
- `/oauth/callback` · `/oauth/error`

登录后：

| 路径 | 页面 |
| --- | --- |
| `/workplace` `/workbench` | 工作台摘要与数据看板 |
| `/account` | 个人中心、消息中心、通知偏好、安全设置、账号绑定 |
| `/aichat` | AI 对话 |
| `/mytickets` | 我提交或分派给我的工单 |
| `/about` | 关于与已发布变更日志 |
| `/management/useradmin` | 用户 |
| `/management/roleadmin` | 角色 |
| `/management/permissionadmin` | 权限码 |
| `/management/menuadmin` | 菜单 |
| `/management/deptadmin` | 部门 |
| `/management/postadmin` | 岗位 |
| `/management/labelsadmin` | 标签 |
| `/management/dictadmin` | 字典 |
| `/management/placardadmin` | 公告 |
| `/management/noticeadmin` | 站内信 |
| `/management/auditadmin` | 操作审计 |
| `/management/websocketadmin` | 在线用户 |
| `/management/configadmin` | 系统参数 |
| `/management/webhookadmin` | Webhook |
| `/management/flagadmin` | 功能开关 |
| `/management/ticketadmin` | 工单处理 |
| `/management/jobadmin` | 定时任务 |
| `/management/apikeyadmin` | API 密钥 |
| `/management/aiadmin` | 模型管理 |
| `/management/changelogadmin` | 变更日志 |

图表和地图演示在 `/charts`、`/music`、`/bmap`。

## 文档

- [`api.md`](./api.md) — 本前端对接的 HTTP / WebSocket 约定
- [`docs/websocket-scheme.md`](./docs/websocket-scheme.md) — 在线状态与管理端订阅消息
- [`deploy/nginx.conf.example`](./deploy/nginx.conf.example) — 同源反代 `/api`、`/health`、`/gows`

## 许可证

[MIT](./LICENSE)
