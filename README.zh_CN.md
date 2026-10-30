[English](./README.md) | 简体中文

# Nest Admin（react-admin-nest）

React 管理端，对接后端 [go_ai / goadmin](https://github.com/weiqinke/go_ai)。业务能力以 **`feat-ai`** 分支为准。

- 预览: https://nest-admin.com
- Github: https://github.com/weiqinke/react-admin-nest

## 功能

| 模块          | 说明                                               |
| ------------- | -------------------------------------------------- |
| 登录鉴权      | 图形验证码、RSA 加密密码、JWT access/refresh、登出 |
| 系统管理      | 用户、角色、权限码、菜单                           |
| 系统公告      | 管理端发布；必读 Gate；铃铛「通知」；消息中心      |
| 标签管理      | 全局标签 CRUD / 启停 / 下拉 options                |
| 字典管理      | 类型 + 条目；公告类型/等级等下拉从字典读           |
| 站内信 / 待办 | 铃铛「消息」「待办」；消息中心分段；站内信管理发信 |
| 操作审计      | 列表筛选与导出                                     |
| WebSocket     | 在线用户、强制下线、截屏、订阅上下线、实时 toast   |
| 工作台 / 演示 | 工作台、图表、地图等展示页                         |

## 技术栈

React 19 · Vite · Ant Design 6 · React Router 8 · Axios · ECharts / D3 · Tailwind 4  
要求 Node `>= 22.22.0`

## 快速开始

```bash
git clone https://github.com/weiqinke/react-admin-nest.git
cd react-admin-nest
git checkout feat-ai
npm install
npm run dev
```

将 API Base URL 指向已启动的 goadmin（默认 `http://127.0.0.1:8080`）。  
接口约定见后端：[API.md](https://github.com/weiqinke/go_ai/blob/main/docs/API.md)、[FRONTEND.md](https://github.com/weiqinke/go_ai/blob/main/docs/FRONTEND.md)。

```bash
npm run build
npm run lint
```

## 演示账号（后端种子）

| 用户    | 密码       | 说明           |
| ------- | ---------- | -------------- |
| `admin` | `admin123` | 管理端联调首选 |
| `user`  | `user123`  | 普通用户       |

更多账号与 DSD/SSD 说明见后端文档。

## 脚本

| 命令              | 说明                 |
| ----------------- | -------------------- |
| `npm run dev`     | 开发服务（`--host`） |
| `npm run build`   | 生产构建             |
| `npm run preview` | 预览构建产物         |
| `npm run lint`    | ESLint               |

## 主要页面（管理）

- `/management/useradmin` 用户
- `/management/roleadmin` · `permissionadmin` · `menuadmin`
- `/management/labelsadmin` · `dictadmin` · `noticeadmin` · `placardadmin`
- `/management/auditadmin` · `websocketadmin`
- `/account` 消息中心 / 个人设置

## 许可证

以仓库内声明为准。
