English | [简体中文](./README.zh_CN.md)

# Nest Admin（react-admin-nest）

React 管理端，对接后端 [go_ai / goadmin](https://github.com/weiqinke/go_ai)。版本 `3.0.0`。

- Preview: https://nest-admin.com
- Repo: https://github.com/weiqinke/react-admin-nest

接口约定以仓库内 [`api.md`](./api.md) 为准。响应一律是 `{ code, message, data }`，成功时 `code = 0`。用户 ID 是雪花 ID，JSON 里是字符串，不要转成 Number。

## Features

| Area             | Notes                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Auth             | Captcha, RSA-OAEP password, JWT access/refresh, register switch, forgot/reset password, email invite |
| Account security | Change password, TOTP, session list, trusted devices, step-up on sensitive writes                    |
| OAuth            | GitHub, Gitee, and enterprise OIDC login and account binding                                         |
| RBAC             | Users, roles, permission codes, menus; role constraints (SSD/DSD); department data scope             |
| Org              | Department tree and posts                                                                            |
| Announcements    | Publish, required-read gate, read receipts, remind unread users                                      |
| Labels / dicts   | Global labels; dict types and items, with CSV import/export                                          |
| Inbox            | Bell (notices, messages, todos), message center, per-event notification prefs                        |
| Audit            | Operation logs filtered by data scope, detail, CSV export                                            |
| Realtime         | Online users, force offline, screenshot, presence subscribe                                          |
| Ops              | System config, outbound webhooks, feature flags, cron jobs, API keys, changelog                      |
| Tickets          | My tickets; admin list, templates, and auto-assign rules                                             |
| AI               | Model config and in-app chat (`ai:use`)                                                              |
| Workplace        | Home summary, access charts, map and chart demos                                                     |

Menus come from `GET /api/me/menus`. A route exists in this repo only if the signed-in user is granted the matching menu.

## Stack

React 19 · Vite 8 · TypeScript · Ant Design 6 · React Router 8 · Axios · ECharts / D3 · Tailwind 4

- Node `>= 22.22.0`
- pnpm `12.15.0` (`packageManager` in `package.json`)

## Quick start

Start goadmin first. The dev server proxies `/api` and `/health` to `http://127.0.0.1:8080`. WebSocket in development connects to that origin directly (`/gows` is not proxied).

```bash
git clone https://github.com/weiqinke/react-admin-nest.git
cd react-admin-nest
corepack enable
pnpm install
pnpm dev
```

Open the URL Vite prints (it listens on `--host`). Sign in with a seed account below.

Production builds use the same origin by default: the browser calls `/api` and `/gows` on the site, and Nginx reverse-proxies them to goadmin. Set the GitHub Actions variable `DEPLOY_API_ORIGIN` only when the API lives on another origin (CORS must be enabled there). See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) and [`deploy/nginx.conf.example`](./deploy/nginx.conf.example).

## Demo accounts

Seeded by the backend:

| User          | Password     | Notes                                                   |
| ------------- | ------------ | ------------------------------------------------------- |
| `admin`       | `admin123`   | Full admin                                              |
| `user`        | `user123`    | Regular user                                            |
| `cashier1`    | `cashier123` | Cashier                                                 |
| `accountant1` | `account123` | Accountant; SSD-exclusive with cashier                  |
| `dual1`       | `dual123`    | Manager + cashier; login must send `active_roles` (DSD) |

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `pnpm dev`      | Dev server (`vite --host`)            |
| `pnpm build`    | Production build                      |
| `pnpm preview`  | Preview the build (same `/api` proxy) |
| `pnpm lint`     | ESLint                                |
| `pnpm lint:fix` | ESLint with `--fix`                   |
| `pnpm prettier` | Format with Prettier                  |

`ANALYZE=1 pnpm build` writes a bundle report to `analysis-chart.html`.

## Routes

Public:

- `/login` · `/password/forgot` · `/password/reset` · `/invite`
- `/oauth/callback` · `/oauth/error`

Signed in:

| Path                          | Page                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `/workplace` `/workbench`     | Home summary and dashboard                                            |
| `/account`                    | Profile, message center, notification prefs, security, OAuth bindings |
| `/aichat`                     | AI chat                                                               |
| `/mytickets`                  | Tickets I opened or was assigned                                      |
| `/about`                      | About and published changelog                                         |
| `/management/useradmin`       | Users                                                                 |
| `/management/roleadmin`       | Roles                                                                 |
| `/management/permissionadmin` | Permission codes                                                      |
| `/management/menuadmin`       | Menus                                                                 |
| `/management/deptadmin`       | Departments                                                           |
| `/management/postadmin`       | Posts                                                                 |
| `/management/labelsadmin`     | Labels                                                                |
| `/management/dictadmin`       | Dictionaries                                                          |
| `/management/placardadmin`    | Announcements                                                         |
| `/management/noticeadmin`     | Inbox / notices                                                       |
| `/management/auditadmin`      | Audit log                                                             |
| `/management/websocketadmin`  | Online users                                                          |
| `/management/configadmin`     | System config                                                         |
| `/management/webhookadmin`    | Webhooks                                                              |
| `/management/flagadmin`       | Feature flags                                                         |
| `/management/ticketadmin`     | Ticket handling                                                       |
| `/management/jobadmin`        | Scheduled jobs                                                        |
| `/management/apikeyadmin`     | API keys                                                              |
| `/management/aiadmin`         | AI models                                                             |
| `/management/changelogadmin`  | Changelog                                                             |

Chart and map demos live under `/charts`, `/music`, and `/bmap`.

## Docs

- [`api.md`](./api.md) — HTTP and WebSocket contract used by this UI
- [`docs/websocket-scheme.md`](./docs/websocket-scheme.md) — presence and admin-watch messages
- [`deploy/nginx.conf.example`](./deploy/nginx.conf.example) — same-origin `/api`, `/health`, and `/gows`

## License

[MIT](./LICENSE)
