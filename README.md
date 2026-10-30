English | [简体中文](./README.zh_CN.md)

# Nest Admin（react-admin-nest）

React 管理端，对接后端 [go_ai / goadmin](https://github.com/weiqinke/go_ai)。业务能力以 `feat-ai` 分支为准。

- Preview: https://nest-admin.com
- Repo: https://github.com/weiqinke/react-admin-nest

## Features

| Area               | Notes                                                       |
| ------------------ | ----------------------------------------------------------- |
| Auth               | Captcha + RSA password, JWT access/refresh, logout          |
| RBAC UI            | Users, roles, permissions, menus                            |
| Announcements      | Admin + required gate + bell “通知” + message center        |
| Labels / Dicts     | Global labels; dict types/items for shared dropdowns        |
| Inbox / Todos      | Bell tabs + message center; NoticeAdmin to send             |
| Audit              | Operation log list / filters / CSV                          |
| WebSocket          | Online users, force offline, screenshot, presence subscribe |
| Workbench / charts | Workplace demos (charts, map, etc.)                         |

## Stack

React 19 · Vite · Ant Design 6 · React Router 8 · Axios · ECharts / D3 · Tailwind 4  
Node `>= 22.22.0`

## Quick start

```bash
git clone https://github.com/weiqinke/react-admin-nest.git
cd react-admin-nest
git checkout feat-ai   # admin features live here
npm install
npm run dev            # Vite, --host
```

Point the API base URL at a running goadmin (default `http://127.0.0.1:8080`). Backend contract: [go_ai docs/API.md](https://github.com/weiqinke/go_ai/blob/main/docs/API.md) and [FRONTEND.md](https://github.com/weiqinke/go_ai/blob/main/docs/FRONTEND.md).

```bash
npm run build
npm run lint
```

## Demo accounts (backend seeds)

| User    | Password   | Notes        |
| ------- | ---------- | ------------ |
| `admin` | `admin123` | Full admin   |
| `user`  | `user123`  | Regular user |

## Scripts

| Command           | Description      |
| ----------------- | ---------------- |
| `npm run dev`     | Dev server       |
| `npm run build`   | Production build |
| `npm run preview` | Preview build    |
| `npm run lint`    | ESLint           |

## License

See repository license file if present.
