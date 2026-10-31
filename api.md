# goadmin API 文档

> 给开发者 / AI 读代码用的接口说明。实现入口：`internal/router/`，业务：`internal/controller/` + `internal/service/`。  
> 机器可读契约（OpenAPI 3.0）：[`openapi.yaml`](./openapi.yaml)；前端对接说明：[`FRONTEND.md`](./FRONTEND.md)；错误码实现：`internal/pkg/response/`。

## 基本约定

| 项           | 说明                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Base URL     | `http://127.0.0.1:8080`（可由 `server.address` 配置）                                                      |
| 数据格式     | JSON，`Content-Type: application/json`                                                                     |
| **统一信封** | 所有 HTTP JSON 接口均为 `{ code, message, data }`                                                          |
| 成功         | HTTP **200**，`code=0`，`message="ok"`，业务在 **`data`**                                                  |
| 失败         | **`code` 为业务错误码**（如 `40101`），HTTP 为映射状态；原因在 `message`，附加字段在 `data`（可为 `null`） |
| 鉴权         | `Authorization: Bearer <access token>`；WebSocket 也可用 `?token=`                                         |
| 用户 ID      | **雪花 ID，JSON 一律字符串**，前端勿转 Number                                                              |
| 权限模型     | Constrained RBAC（角色继承 + SSD/DSD）                                                                     |
| 访问日志     | 全站写入 `api_access_log`；URL 中 `token` 等敏感参数脱敏为 `***`                                           |
| 请求追踪     | 响应头 `X-Request-ID`；可主动传入同名请求头                                                                |
| 限流         | captcha 30/分、login 10/分、register 5/分、refresh 30/分（按 IP）；超限 HTTP 429 / `code=42901`            |
| 客户端 IP    | 见下方「客户端 IP」。访问日志、登录日志、限流、WebSocket 握手使用同一个结果                                |

### 响应信封（必读）

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- **下文各接口的「响应」字段，除非标明「完整信封」，否则均指成功时的 `data` 内容。**
- 前端应先判断 `code === 0`，再使用 `data`。

成功完整示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "<access jwt>",
    "refresh_token": "<refresh jwt>"
  }
}
```

失败完整示例：

```json
{
  "code": 40301,
  "message": "forbidden",
  "data": { "permission": "user:read" }
}
```

### 客户端 IP

Nginx 把请求转到 `127.0.0.1:8080` 之后，TCP 对端永远是 `127.0.0.1`。访问日志、登录日志、按 IP 限流如果读 `RemoteAddr`，统计会全部变成 `127.0.0.1`。

Nginx 对每个反代请求写入：

- `X-Real-IP: $remote_addr`
- `X-Forwarded-For: $remote_addr`（覆盖客户端自己带的值，不追加）

取值在 `internal/pkg/clientip`，顺序是：

1. 对端是 `127.0.0.1` 或 `::1` 时，采用 `X-Real-IP`（合法 IP 才采纳）。
2. 没有该头时，采用 `X-Forwarded-For` 中唯一的这一段。
3. 直连、没有反代时，采用 `RemoteAddr` 去掉端口后的地址。

来自其他地址的这两个头忽略，避免客户端伪造。

### 演示账号

| 用户名        | 密码         | 角色              | 备注                           |
| ------------- | ------------ | ----------------- | ------------------------------ |
| `admin`       | `admin123`   | admin             | 几乎全部权限                   |
| `user`        | `user123`    | user              | 普通用户                       |
| `cashier1`    | `cashier123` | cashier           | 出纳                           |
| `accountant1` | `account123` | accountant        | 会计；与出纳 SSD 互斥          |
| `dual1`       | `dual123`    | manager + cashier | 登录须传 `active_roles`（DSD） |

### 常见权限码

`user:read` `user:write` `role:read` `role:write` `menu:read` `menu:write` `stats:read` `login:read` `ws:connect` `ws:admin` `ws:notify` `finance:cash` `finance:account` `announcement:read` `announcement:write` `label:read` `label:write` `audit:read` `dict:read` `dict:write` `notice:read` `notice:write` `dept:read` `dept:write` `position:read` `position:write` `config:read` `config:write` `ticket:read` `ticket:write` `job:read` `job:write` `apikey:read` `apikey:write` `ai:read` `ai:write` `ai:use`

---

## 1. 健康检查

### `GET /health`

无需登录。探测数据库连通性。

**完整信封（正常）**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "status": "ok",
    "rbac": "constrained",
    "checks": { "database": { "ok": true, "error": "" } }
  }
}
```

数据库不可用时：HTTP **503**，`code=50301`，`data.status` 为 `degraded`。

### `GET /version`

无需登录。返回当前进程对应的编译版本与启动时间。

`commit` 是完整 git hash，`branch` 是编译时所在分支。发布构建通过 `-ldflags` 写入这两个值。本地 `go run` / `go build` 未传时，`commit` 取 Go 构建信息中的 `vcs.revision`，仍缺失的字段再从工作区 `git` 读取。都没有时为 `unknown`。`started_at` 是进程启动时间（RFC3339），进程存活期间不变。

**data**

```json
{
  "commit": "a1b2c3d4e5f6789012345678901234567890abcd",
  "branch": "main",
  "started_at": "2026-10-30T22:18:00+08:00"
}
```

---

## 2. 认证

路由：`internal/router/router.go`（公开）+ `internal/router/auth.go`（私有）  
控制器：`internal/controller/auth.go`

### `GET /api/captcha`

公开。一次性图形验证码；再次请求即更换。限流 30/分/IP。

**data**

```json
{
  "captcha_id": "xxxx",
  "image": "data:image/png;base64,...."
}
```

`captcha.debug=true` 时额外返回 `answer`（仅联调）。失败常见：`42901`。

### `GET /api/crypto/public-key`

公开。RSA 公钥，用于加密密码。

**data**

```json
{
  "key_id": "rsa-2048",
  "algorithm": "RSA-OAEP-SHA256",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
}
```

前端：RSA-OAEP(SHA-256) 加密明文密码 → Base64 → `password_encrypted`。  
**服务重启后公钥会变**，需重新拉取。

### `POST /api/register`

公开。限流 5/分/IP。成功后自动授予 `user` 角色并创建默认 profile。

**请求**

```json
{
  "username": "newuser",
  "password_encrypted": "<base64(RSA-OAEP(password))>"
}
```

规则：

- `username`：3–32 位，字母/数字/下划线
- 明文密码 6–64（服务端解密后校验）
- 用户名已存在 → HTTP 409 / `code=40906`
- `site.allow_register=false` → HTTP 403 / `code=40303`

注册成功后需再调 `POST /api/login` 取 token。

**data 示例**

```json
{
  "user": {
    "id": "3733...",
    "username": "newuser",
    "roles": ["user"],
    "profile": {}
  }
}
```

### `POST /api/login`

公开。限流 10/分/IP。需：用户名 + 加密密码 + 验证码。

**请求**

```json
{
  "username": "admin",
  "password_encrypted": "<base64(RSA-OAEP(password))>",
  "captcha_id": "xxxx",
  "captcha_code": "1234",
  "active_roles": ["admin"]
}
```

- **不接受明文 `password`**
- 验证码一次性；失败需重新拉 captcha
- `active_roles` 可选；不传则尝试激活全部已授角色（可能因 DSD 失败）
- `profile.status=0` → HTTP 403 / `code=40302`

**完整信封（成功）**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "<access jwt>",
    "expires_at": "Wed, 28 Oct 2026 03:00:00 GMT",
    "refresh_token": "<refresh jwt>",
    "refresh_expires_at": "Wed, 04 Nov 2026 03:00:00 GMT",
    "user": {
      "id": "373358082891190272",
      "username": "admin",
      "roles": ["admin"],
      "active_roles": ["admin"],
      "permissions": ["user:write", "role:read", "..."],
      "profile": {}
    }
  }
}
```

| 字段            | 说明                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| `token`         | access JWT，TTL=`jwt.ttlHours`（默认 24h），用于 Bearer                           |
| `refresh_token` | refresh JWT，TTL=`jwt.refreshTTLHours`（默认 168h）；**不能**当 Bearer 调业务接口 |

常见失败码：`40002` 验证码、`40003` 密文、`40101` 账密错误、`40302` 禁用、`40304` 用户名锁定、`40903` DSD、`42901` 限流。锁定规则见 §22。

### `POST /api/token/refresh`

公开。限流 30/分/IP。用 refresh 换**新的** access + refresh（**旋转**：旧 refresh 立即作废）。

**请求**

```json
{ "refresh_token": "<refresh jwt>" }
```

**data**：字段同登录（`token` / `expires_at` / `refresh_token` / `refresh_expires_at` / `user`）。

| 情况                   | HTTP | code    |
| ---------------------- | ---- | ------- |
| refresh 无效/吊销/过期 | 401  | `40103` |
| 账号禁用               | 403  | `40302` |
| DSD 冲突               | 409  | `40903` |

### `POST /api/logout`

需登录（Bearer = access）。吊销当前 access；**建议 body 带 `refresh_token`**，否则 refresh 仍可换新 token。

**请求（可选）**

```json
{ "refresh_token": "<refresh jwt>" }
```

**data**

```json
{ "status": "ok" }
```

### `GET /api/me`

需登录。返回当前用户、角色、激活角色、权限、profile（均在 `data` 内）。

### 登录日志（自动）

每次 `POST /api/login`（成功或失败）写入 `login_log`：用户名、用户 ID、成功与否、失败原因、IP、UA 解析、Referer、Accept-Language、`active_roles` 等。

### `GET /api/login/logs`

权限：`login:read`

| Query            | 说明                      |
| ---------------- | ------------------------- |
| page / page_size | 分页                      |
| from / to        | `YYYY-MM-DD`              |
| username         | 模糊                      |
| user_id          | 雪花 ID                   |
| success          | `true`/`false` 或 `1`/`0` |
| ip               | 模糊                      |

**data**：`{ list, total, page, page_size }`

### `GET /api/login/stats`

权限：`login:read`。默认最近 7 天，最长 90 天。

| Query     | 说明                             |
| --------- | -------------------------------- |
| from / to | 日期                             |
| top       | `by_user` 条数，默认 10，最大 50 |

**data**

```json
{
  "from": "2026-10-21",
  "to": "2026-10-27",
  "summary": { "day": "", "total": 120, "success": 110, "fail": 10, "unique_users": 18 },
  "daily": [{ "day": "2026-10-21", "total": 15, "success": 14, "fail": 1, "unique_users": 6 }],
  "by_user": [{ "user_id": "3733...", "username": "admin", "total": 40, "success": 39, "fail": 1 }]
}
```

---

## 2.1 OAuth2（独立模块 `internal/oauth`）

实现：`internal/oauth/`（Provider 抽象 + GitHub / Gitee + state + identity + handler）。  
配置：`oauth.*`（见 `manifest/config/config.example.yaml`）。  
表：`oauth_identity`（`UNIQUE(provider, provider_user_id)` + `UNIQUE(user_id, provider)`）。

**行为**

- 首次平台登录（`github` / `gitee`）：自动建本地用户（默认角色 `user`）并写入绑定。
- 再次同一平台账号：按绑定复用同一 `user_id`，不重复建号；刷新平台 token。
- 已登录绑定：`/bind`；冲突（该外部身份已绑其他账号）→ `40907`。

### `GET /api/oauth/{provider}/authorize`

公开。限流 20/分/IP。支持 `github`、`gitee`（且 `oauth.<provider>.enabled=true` 且凭证齐全）。  
可选 query：`redirect`（覆盖成功回跳 URL）。  
响应：**302** 到平台授权页。

### `GET /api/oauth/{provider}/callback`

公开。平台回调：`code` + `state`。  
成功：**302** 到 `oauth.frontendSuccessUrl`（或 authorize 时的 `redirect`），query 含：

| mode  | query                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| login | `provider`, `mode=login`, `access_token`, `refresh_token`, `expires_at`, `refresh_expires_at`, `user_id`, `username` |
| bind  | `provider`, `mode=bind`, `bound=1`, `user_id`                                                                        |

失败：**302** 到 `oauth.frontendErrorUrl?code=&message=`。

前端落地页、存 token、绑定跳转示例见 **`docs/FRONTEND.md` → GitHub / Gitee OAuth 对接**。

### `GET /api/oauth/{provider}/bind`

需登录。发起绑定流程（state mode=`bind`），302 到平台。  
整页跳转时可带 query `token=<access jwt>`（与 Bearer 等价；见 `docs/FRONTEND.md` OAuth 对接）。

### `GET /api/oauth/bindings`

需登录。列出当前用户已绑平台（不含 access_token）。

**data**

```json
{
  "items": [
    {
      "provider": "github",
      "provider_user_id": "123456",
      "provider_login": "octocat",
      "email": "octocat@github.com",
      "avatar_url": "https://...",
      "scopes": "read:user user:email",
      "created_at": "2026-10-29T12:00:00Z",
      "updated_at": "2026-10-29T12:00:00Z"
    }
  ]
}
```

### `DELETE /api/oauth/{provider}`

需登录。解绑指定平台。

---

## 3. 用户详情 Profile

路由：`internal/router/auth.go` + `internal/router/user.go`  
控制器：`internal/controller/profile.go`  
表：`user_profile`

### 详情字段（在 `data` 内）

| 字段                                                         | 类型   | 说明                                                               |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| user_id                                                      | string | 雪花 ID                                                            |
| nickname                                                     | string | 昵称                                                               |
| real_name                                                    | string | 真实姓名                                                           |
| avatar                                                       | string | 头像 URL                                                           |
| gender                                                       | int    | 0未知 1男 2女 3其他                                                |
| birthday                                                     | string | `YYYY-MM-DD`，可空                                                 |
| email / phone / mobile                                       | string | 联系方式                                                           |
| id_card                                                      | string | 身份证                                                             |
| employee_no                                                  | string | 工号                                                               |
| department / job_title / company                             | string | 组织。`department` 只读，改归属用 `PUT /api/users/{id}/department` |
| department_id                                                | string | 部门雪花 ID，空字符串表示未归属                                    |
| province / city / district / address / postal_code / country | string | 地址                                                               |
| bio / website / wechat / qq                                  | string | 扩展                                                               |
| status                                                       | int    | 1正常 0禁用（本人更新不可改）                                      |
| remark                                                       | string | 备注                                                               |
| extra_json                                                   | string | 扩展 JSON 文本                                                     |
| created_at / updated_at                                      | string | 时间                                                               |

更新字段均为可选（只更新传入字段）。

### `GET /api/me/profile` / `PUT /api/me/profile`

需登录。查/改自己的详情（`PUT` 忽略 `status`）。

### `GET /api/users`

权限：`user:read`。**data**：`{ "list": [ { id, username, roles, profile, created_at } ] }`

### `GET /api/users/{id}/profile` / `PUT /api/users/{id}/profile`

读：`user:read`；写：`user:write`（可改 `status`）。`id` 为雪花字符串。  
不存在 → `40401`。

---

## 4. 角色 / 权限 / Constrained RBAC

路由：`internal/router/role.go`  
控制器：`role.go`、`permission.go`

权限码规则：小写字母开头，`a-z0-9_:-`，长度 2–63。  
路径中含 `:` 须 URL 编码：`user:read` → `user%3Aread`。

读：`role:read`；写：`role:write`。权限变更下次请求即生效（查库）。

### 4.1 权限码 CRUD

| 方法   | 路径                      | 权限         | 说明                                          |
| ------ | ------------------------- | ------------ | --------------------------------------------- |
| GET    | `/api/permissions`        | `role:read`  | 列表 → `data.list`                            |
| GET    | `/api/permissions/{code}` | `role:read`  | 详情                                          |
| POST   | `/api/permissions`        | `role:write` | 创建 `{code,name}`                            |
| PUT    | `/api/permissions/{code}` | `role:write` | 改名称 `{name}`                               |
| DELETE | `/api/permissions/{code}` | `role:write` | 删除；**data** `{ deleted, permission_code }` |

### 4.2 角色 CRUD

| 方法   | 路径                | 权限         | 说明                                                                             |
| ------ | ------------------- | ------------ | -------------------------------------------------------------------------------- |
| GET    | `/api/roles`        | `role:read`  | 列表（含 inherits、permissions、data_scope）                                     |
| GET    | `/api/roles/{code}` | `role:read`  | 详情                                                                             |
| POST   | `/api/roles`        | `role:write` | 创建 `{code,name,inherits?,data_scope?}`                                         |
| PUT    | `/api/roles/{code}` | `role:write` | 更新；`inherits` 数组则整表替换；`data_scope` 为 `all`/`dept`/`self`，省略则不改 |
| DELETE | `/api/roles/{code}` | `role:write` | 删；`admin` 禁止；仍有用户绑定时拒绝 → `40904`/`40905`                           |

**data 列表示例**

```json
{
  "list": [
    {
      "id": "1",
      "code": "manager",
      "name": "经理",
      "inherits": ["user"],
      "permissions": ["user:read", "role:read", "stats:read", "login:read"]
    }
  ]
}
```

### 4.3 角色 ↔ 权限

| 方法   | 路径                                   | 说明                                         |
| ------ | -------------------------------------- | -------------------------------------------- |
| GET    | `/api/roles/{code}/permissions`        | 直接绑定（不含继承）                         |
| POST   | `/api/roles/{code}/permissions`        | 追加 `permission_code` 或 `permission_codes` |
| PUT    | `/api/roles/{code}/permissions`        | 全量替换 `permission_codes`                  |
| DELETE | `/api/roles/{code}/permissions/{perm}` | 解绑单个                                     |

### 4.4 SSD / DSD 约束

| 方法       | 路径                            | 说明        |
| ---------- | ------------------------------- | ----------- |
| GET/POST   | `/api/roles/constraints`        | 列表 / 创建 |
| PUT/DELETE | `/api/roles/constraints/{code}` | 更新 / 删除 |

创建体：

```json
{
  "code": "finance_ssd",
  "name": "出纳与会计不可同时授予",
  "type": "ssd",
  "max_roles": 1,
  "roles": ["cashier", "accountant"]
}
```

- **SSD**：`Assign` 时校验 → 冲突 `40902`
- **DSD**：登录 / refresh 激活角色时校验 → `40903`

### 4.5 用户 ↔ 角色

### `POST /api/rbac/assign` / `POST /api/rbac/revoke`

权限：`role:write`

```json
{ "user_id": "3733...", "role_code": "cashier" }
```

**data**：`{ user_id, roles }`。SSD 冲突 → `40902`。

---

## 5. 菜单管理

路由：`internal/router/menu.go`  
控制器：`internal/controller/menu.go`  
表：`menu` + `menu_permission`

### 模型要点

- 逐级创建：先建根再挂子（`parent_id`），**不**一次 path 拆段
- 每节点雪花 `id` 唯一；`segment` 可跨支重复；同级同名拒绝 `40901`
- `weight`：根=1，子=`parent.weight+1`（服务端算）
- `chain_id`：根=`自身 id`，子继承父
- 展示字段：`title` `icon` `remark` `is_hot` `has_update` `visible_in_menu` `sort` `status`
  - `visible_in_menu`：`1` 在侧栏/菜单组件显示，`0` 隐藏（路由仍可返回，由前端决定是否注册）
- **直接权限为空 = 公开菜单**（可见性不做权限码校验）
- 有直接权限时，effective = 自身直接 ∪ 祖先直接；用户须全部具备

### 用户可渲染树

### `GET /api/me/menus`

需登录，**不**要求 `menu:read`。

- 仅启用节点，且到根祖先均启用
- 公开节点（无直接权限）或具备 effective 全部权限 → 可见
- 可见节点的祖先一律补齐进树
- **data**：`{ "list": [ { id, parent_id, segment, full_path, weight, title, icon, remark, is_hot, has_update, visible_in_menu, sort, children } ] }`（不含权限码）

### 管理端

| 方法   | 路径                          | 权限         | 说明                                                                            |
| ------ | ----------------------------- | ------------ | ------------------------------------------------------------------------------- |
| GET    | `/api/menus`                  | `menu:read`  | 全量树（含禁用；带 `status`/`is_public`/`permissions`/`effective_permissions`） |
| GET    | `/api/menus/{id}`             | `menu:read`  | 详情                                                                            |
| GET    | `/api/menus/{id}/permissions` | `menu:read`  | 该菜单直接绑定的权限码，`data.permission_codes`；未绑定为 `[]`                  |
| POST   | `/api/menus`                  | `menu:write` | 逐级创建                                                                        |
| PUT    | `/api/menus/{id}`             | `menu:write` | 改 title/icon/remark/is_hot/has_update/visible_in_menu/sort                     |
| PUT    | `/api/menus/{id}/status`      | `menu:write` | `{ "status": 0\|1 }`；禁用级联子孙；启用须父已启用                              |
| PUT    | `/api/menus/{id}/permissions` | `menu:write` | `{ "permission_codes":[] }`；空数组变公开                                       |
| DELETE | `/api/menus/{id}`             | `menu:write` | 有子则 `40905`                                                                  |

**创建 body 示例**

```json
{
  "parent_id": null,
  "segment": "work",
  "title": "工作台",
  "icon": "Work",
  "remark": "",
  "is_hot": 0,
  "has_update": 0,
  "visible_in_menu": 1,
  "sort": 0,
  "permission_codes": ["menu:work"]
}
```

子节点把 `parent_id` 设为父的雪花 id 字符串。`permission_codes` 省略或 `[]` 即为公开菜单。

种子权限：`menu:read` / `menu:write`（admin 已授予）。菜单业务权限码需先在 `/api/permissions` 创建再绑定。

---

## 6. 访问统计与服务器信息

路由：`internal/router/stats.go`  
权限：均需 `stats:read`

| 方法 | 路径                      | 说明                                                           |
| ---- | ------------------------- | -------------------------------------------------------------- |
| GET  | `/api/stats/access`       | 按 method+path 汇总                                            |
| GET  | `/api/stats/access/logs`  | 明细分页；`user_id=anonymous` 只查匿名。按数据范围过滤，见 §21 |
| GET  | `/api/stats/access/daily` | 按天。按数据范围过滤，见 §21                                   |
| GET  | `/api/stats/access/users` | 按用户。按数据范围过滤，见 §21                                 |
| GET  | `/api/stats/server`       | 本机/本进程指标（gopsutil）。不按人裁剪                        |

日志 Query：`page` `page_size` `from` `to` `user_id` `path`。  
明细字段：`method path url ip user_id username anonymous status created_at`。

`/api/stats/server` 的 `data` 分组：`host` `cpu` `memory` `swap` `disks` `network` `load` `process` `runtime`。

---

## 7. WebSocket

单进程内存 Hub。在线索引、房间、截屏状态都不跨实例。

权限：`ws:connect` 连接和订阅；`ws:admin` 监控、截屏、强制下线；`ws:notify` 发通知。`admin` 角色带后两个，并经角色继承拥有 `ws:connect`。

帧一律是 UTF-8 JSON：

```json
{ "v": 1, "type": "string", "request_id": "可选", "payload": {} }
```

错误帧 `type=error`，`payload` 为 `{ "code", "message" }`，业务码与第 8 节相同。

### `GET /gows`

权限：`ws:connect`。  
连接：`ws://host/gows?token=<access jwt>`。浏览器只能把 token 放在 query；其它客户端也可以用 Header Bearer。无 token、token 无效或无权限时不升级，返回 JSON：`40101` / `40102` / `40301`。

连接成功后服务端立刻发送 `welcome`：`payload` 含 `conn_id`、`user_id`、`server_time`（Unix 秒）。每个标签一个 `conn_id`。

心跳：客户端每 30 秒发 `ping`，服务端回 `pong`。任意客户端帧都重置空闲计时，连续 90 秒没有客户端帧则断开。

连接已经建立后，access 过期或被吊销：先发 `auth.expired`（过期码 `40104`，吊销码 `40102`），再关连接。

| 房间          | 加入                            | 用途     |
| ------------- | ------------------------------- | -------- |
| `online`      | 连接成功自动加入                | 在线索引 |
| `notify`      | 自动加入                        | 全站通知 |
| `admin-watch` | `ws:admin` 后客户端 `room.join` | 在线列表 |

`room.join` / `room.leave` 的 `payload.room` 只接受 `admin-watch`。

### 在线

- 上行 `presence.list`（`ws:admin`）→ `presence.snapshot`：`{ total, users[] }`。`users` 每个连接一条：`user_id`、`conn_id`、`username`、`login`、`connected_at`。
- 变更只推 `admin-watch`：`presence.changed` = `{ reason: join|leave|force_offline, total, user }`。
- 同一用户连接数从 0 到 1、以及回到 0，才向订阅者推一次 `presence.user_online` / `presence.user_offline`。多开标签不会重复推。

### 通知

上行 `notify.push`（`ws:notify`）：`{ title, content, level?, target_user_ids? }`。`title` ≤ 100，`content` ≤ 2000。无 `target_user_ids` 时广播 `notify` 房间，有则只推这些用户当前的全部连接。下行 `notify.message`，并带上 `from_user_id`、`created_at`。瞬时 toast，不落库。

站内信落库后服务端下行 `notice.message`（`{ id, kind, title, content, category, level }`）到在线收件人；与 `notify.message` 分开。

### 强制下线

上行 `admin.force_offline`：`{ target_user_id }`（`ws:admin`）。不能下线自己（`40001`）。吊销该用户全部 access 与 refresh（按签发时间截断，之后新登录的 token 有效）。向该用户每个连接发送 `admin.force_offline`（`payload` 为 `{}`）后关闭。连接数归零后，订阅者收到一次 `presence.user_offline`，`reason=force_offline`。写 `ws_admin_audit`。

### 截屏

同一 `target_conn_id` 同时只能有一个 `pending` 或 `accepted`，否则 `40901` / `screen busy`。请求结束后，同一管理员对同一连接 10 秒内不能再请求（`42901`）。确认必须走服务端状态：`pending`（30 秒）→ `accepted`（之后 2 分钟内上传）→ `ready`，或者 `denied` / `timeout` / `error`。

1. 管理员 `screen.request`：`{ target_conn_id, request_id }`。转发给目标：`{ request_id, from_conn_id, from_user_id, from_username }`。
2. 目标 `screen.denied` 或 `screen.accept`，且必须是该 `conn_id`、状态仍是 `pending`。
3. 30 秒仍是 `pending`：双方 `screen.error`，`message` 为 `timeout`。同意后 2 分钟未完成则为 `upload timeout`。
4. 只有 `accepted` 之后才能 `POST /api/ws/screenshots`。
5. 目标 `screen.ready`：`{ request_id, url, expires_at, width, height }`。服务端确认上传成功后改为 `ready`，并且只把这张图回给发起这次 `screen.request` 的那一条连接。不进入 `admin-watch`，目标本人和其它在线用户都收不到。`screen.denied` 同样只回发起连接。超时或断开产生的 `screen.error` 发给发起连接，并同时发给目标连接，用来关掉确认框。

WebSocket 帧里不传图片。

#### `POST /api/ws/screenshots`

权限：`ws:connect`。`multipart` 字段 `file`、`request_id`。仅 JPEG，不超过 2MB。请求必须属于当前用户、状态为 `accepted` 且未过期，否则 `40301` 或 `40901`。响应 `data`：`{ url, expires_at }`。`url` 形如 `/api/ws/screenshots/{id}?exp=&sig=`，HMAC 签名，5 分钟有效。

#### `GET /api/ws/screenshots/{id}`

不看登录态，只校验 `exp` 与 `sig`。过期或签名错误为 `403`。文件在 `storage/screenshots/`，磁盘保留 10 分钟。

### 订阅

关系落库，重连不用重新订阅。不能订阅自己（`40001`）。每人最多 200 个（`40901`）。目标用户必须存在（`40401`）。备注最长 64，档位只允许 `all`、`online_only`、`mute`，否则 `40004`。写操作每用户每分钟最多 60 次（`42901`）。

| notify_level  | 实时上线 | 实时下线 | 离线补推   |
| ------------- | -------- | -------- | ---------- |
| `all`         | 是       | 是       | 上线和下线 |
| `online_only` | 是       | 否       | 只记上线   |
| `mute`        | 否       | 否       | 否         |

- `subscribe.add` `{ target_user_id, note?, notify_level? }` → `subscribe.added`。新建缺省 `note=""`、`notify_level=all`；已存在时，没带的字段保持原值。
- `subscribe.update` 至少改一项，没有关系则 `40401` → `subscribe.updated`。
- `subscribe.remove` → `subscribe.removed`，并删掉这一对未投递的离线事件。
- `subscribe.list` → `subscribe.snapshot`（含 `notify_level`、`online`、`conn_count`、`note`、时间）。
- `subscribe.fans` → `subscribe.fans_snapshot`。只能看自己的粉丝，能看到对方写的备注，以及对方当前是否在线（`online`、`conn_count`）。看不到对方的 `notify_level`。

实时帧里的 `note` 是订阅者自己写的那条。订阅者离线且档位允许时写入离线队列，同一对只留最近 20 条；在线则实时推，不写队列。

离线补推只在该用户连接数从 0 变为 1 时发一次 `presence.catch_up`（按时间升序，最多 50 条，`has_more` 表示还有剩余）。同一份发给当时该用户的全部连接。再开标签不会再发。

### 聊天

`chat` 或 `chat.message`：`{ text }`，向当前全部连接广播 `chat.message`（同一信封，带 `from_user_id`）。

### 表

- `ws_user_subscription`：`(subscriber_user_id, target_user_id)` 唯一，另有 `note`、`notify_level`、时间。
- `ws_presence_offline_event`：`event_type`、`payload_json`、`delivered_at`。
- `ws_admin_audit`：`action`、`actor_user_id`、`target_user_id`、`target_conn_id`、`request_id`、`meta_json`（含 IP）、`created_at`。记录强制下线，以及截屏 request、accept、denied、ready、timeout。

---

## 8. 业务错误码一览

源码：`internal/pkg/response/codes.go`（可用 `Register` 扩展）。

| code  | HTTP | 常量                        | 说明                                                                                  |
| ----- | ---- | --------------------------- | ------------------------------------------------------------------------------------- |
| 0     | 200  | `CodeOK`                    | 成功                                                                                  |
| 40001 | 400  | `CodeBadRequest`            | 通用参数错误                                                                          |
| 40002 | 400  | `CodeInvalidCaptcha`        | 验证码无效                                                                            |
| 40003 | 400  | `CodeInvalidCipher`         | 密码密文无效                                                                          |
| 40004 | 400  | `CodeValidation`            | 字段校验失败                                                                          |
| 40005 | 400  | `CodeInvalidUsername`       | 用户名不合法                                                                          |
| 40006 | 400  | `CodeInvalidPassword`       | 密码不合法                                                                            |
| 40101 | 401  | `CodeUnauthorized`          | 未登录 / 账密错误等                                                                   |
| 40102 | 401  | `CodeInvalidToken`          | access 无效或已吊销                                                                   |
| 40103 | 401  | `CodeInvalidRefreshToken`   | refresh 无效或已吊销                                                                  |
| 40104 | 401  | `CodeTokenExpired`          | access 已过期；前端应 `POST /api/token/refresh` 后续期，勿与 `40102`（吊销/伪造）混用 |
| 40105 | 401  | `CodeOAuthInvalidState`     | OAuth state 无效/过期                                                                 |
| 40106 | 401  | `CodeOAuthExchange`         | OAuth 换票/拉用户失败                                                                 |
| 40301 | 403  | `CodeForbidden`             | 无权限；`data.permission`                                                             |
| 40302 | 403  | `CodeUserDisabled`          | 账号禁用                                                                              |
| 40303 | 403  | `CodeRegistrationClosed`    | 注册已关闭（`site.allow_register=false`）                                             |
| 40304 | 403  | `CodeAccountLocked`         | 用户名因连续密码错误被锁定；`data.retry_after` 为剩余秒数                             |
| 40305 | 403  | `CodePasswordExpired`       | 密码超过 `security.password_max_age_days`；须改密后才能发 token                       |
| 40306 | 403  | `CodeTOTPRequired`          | 已启用 TOTP，需正确 `totp_code`                                                       |
| 40401 | 404  | `CodeNotFound`              | 资源不存在                                                                            |
| 40402 | 404  | `CodeOAuthProviderNotFound` | OAuth provider 未知/未启用                                                            |
| 40901 | 409  | `CodeConflict`              | 通用冲突                                                                              |
| 40902 | 409  | `CodeSSDViolation`          | SSD                                                                                   |
| 40903 | 409  | `CodeDSDViolation`          | DSD                                                                                   |
| 40904 | 409  | `CodeProtected`             | 受保护资源                                                                            |
| 40905 | 409  | `CodeInUse`                 | 仍被引用                                                                              |
| 40906 | 409  | `CodeUsernameExists`        | 用户名已存在                                                                          |
| 40907 | 409  | `CodeOAuthIdentityBound`    | 外部身份已绑其他账号                                                                  |
| 42901 | 429  | `CodeTooManyRequests`       | 限流；`data.retry_after`（秒）+ 头 `Retry-After`                                      |
| 50001 | 500  | `CodeInternal`              | 内部错误                                                                              |
| 50301 | 503  | `CodeUnavailable`           | 依赖不可用                                                                            |

### 扩展错误码

```go
// 方式 A：改 codes.go 常量 + catalog

// 方式 B：模块 init
response.Register(response.Def{
  Code: 40910, HTTP: 409, Message: "quota exceeded",
})
```

控制器推荐：

```go
response.OK(r, data)
response.FailCode(r, response.CodeInvalidCaptcha)
response.FailCodeData(r, response.CodeForbidden, "forbidden", map[string]string{"permission": "user:read"})
response.FailApp(r, response.New(response.CodeSSDViolation).WithCause(err))
```

兼容：`Fail(r, httpStatus, msg)` 仍可用，会经 `FromHTTP` 映射到默认业务码。

---

## 9. 代码地图

```text
main.go
internal/app/app.go
internal/router/*.go
internal/controller/*.go
internal/service/*.go
internal/oauth/                 # OAuth2 独立模块（GitHub / Gitee 等）
internal/pkg/response/          # 信封 + 错误码注册表
internal/middleware/*.go        # Auth / RateLimit / AccessLog / RequestID
internal/bootstrap/db.go
manifest/config/config.yaml
docs/API.md / FRONTEND.md / openapi.yaml
scripts/apitest/
```

新增接口：`service` → `controller`（`response.OK`/`FailCode`）→ `router` 挂权限 → **更新本文件 + openapi.yaml**。  
OAuth 类能力放在 `internal/oauth` 模块内，由 `router` 调用 `RegisterPublic` / `RegisterPrivate`。

---

## 10. 系统公告

权限：`announcement:read` 查看管理列表和阅读情况，`announcement:write` 创建、发布、撤回、删除。当前用户的未读和已读只要求登录。菜单 `/management/placardadmin` 绑定 `announcement:read`。

`type` 为 `system` 或 `notification`。`level` 为 `normal` 或 `required`，`required` 必须是 `system`。`status` 为 `draft`、`published`、`revoked`。时间用 UTC 的 RFC3339。ID 是字符串。

展示状态 `visibility`：`draft` 草稿、`revoked` 已撤回、`scheduled` 未生效、`expired` 已过期、`active` 生效中。已撤回和草稿优先于时间窗口。

已读记在 `announcement_read`，没有记录就是该启用账号未读。`read_count + unread_count` 等于 `user_profile.status = 1` 的人数。

### `GET /api/announcements`

`announcement:read`。查询 `page`、`page_size`、`type`、`level`、`status`。`data` 为 `{ list, total, page, page_size }`。每条含 `read_count`、`unread_count`、`visibility`、`starts_at`、`expires_at`、`level`。

### `GET /api/announcements/{id}/reads`

`announcement:read`。查询 `read=1` 已读、`read=0` 未读、`username` 模糊、分页。`data` 为 `{ list, total, page, page_size, read_count, unread_count }`。`list` 项为 `{ user_id, username, read, read_at }`。人数不受当前页和用户名过滤影响。

### 管理写接口

均需 `announcement:write`。

- `POST /api/announcements` 创建草稿。body：`title`、`content`、`type`、`level`、`starts_at`、`expires_at`。
- `PUT /api/announcements/{id}` 只改草稿。已发布或已撤回返回 `40904`。
- `PUT /api/announcements/{id}/schedule` 只改已发布公告的生效区间。
- `PUT /api/announcements/{id}/publish` 发布草稿。标题必填；`required` 时正文必填；`expires_at` 必须晚于当前时间。
- `POST /api/announcements/{id}/republish` 复制已发布或已撤回的公告为新的已发布记录，`source_id` 指向原公告，不复制已读。`expires_at` 为空或仍在将来则复制生效区间，已过期则两个时间留空。原记录若仍已发布则改为已撤回。草稿返回 `40004`。
- `PUT /api/announcements/{id}/revoke` 撤回。
- `DELETE /api/announcements/{id}` 软删除。

### 当前用户

- `GET /api/me/announcements`：已发布、未删除、当前落在生效区间内。查询 `type`、`level`、`unread=1`。未指定 `level` 时不返回未读的 `required`。单独查 `level=required` 时按 `published_at` 从早到晚。`unread_count` 只统计本次查询条件下的未读；铃铛使用 `type=notification&level=normal`。
- `PUT /api/me/announcements/{id}/read` 为当前用户写入已读，重复调用仍成功。
- `PUT /api/me/announcements/read` body `{ ids }`。`required` 会被跳过。
- `PUT /api/me/announcements/read-all` 可选查询 `type`。只标记当前可见的普通未读，始终跳过 `required`。

`PUT /me/announcements/read` 与 `read-all` 注册在 `/{id}/read` 之前。

### 自动化测试

```powershell
# 服务已启动且 captcha.debug=true
go run ./scripts/apitest -base http://127.0.0.1:8080 -report docs/TEST_RESULTS.md
```

---

## 11. 标签管理

全局标签库。权限：`label:read` 列表/详情，`label:write` 创建、改、启停、软删。菜单 `/management/labelsadmin` 绑定 `label:read`。`GET /api/labels/options` 仅需登录，返回启用中的标签供下拉。

表 `label` 存本体；`label_binding` 挂接工单 / 用户 / 公告（见 §20）。列表中的 `binding_count` 统计挂接行数。

`status`：`enabled` | `disabled`。停用后不再出现在 options；已挂接数据保留。软删后管理列表与详情均不可见。

同库未删记录中 `name` 唯一；非空 `code` 唯一。`color` 仅接受 `#RGB` / `#RRGGBB`（大小写不敏感，存小写）。

### `GET /api/labels`

`label:read`。查询 `page`、`page_size`、`name`（模糊）、`code`（模糊）、`status`。`data` 为 `{ list, total, page, page_size }`。每条含 `id`、`name`、`code`、`color`、`description`、`sort`、`status`、`binding_count`、`created_by`、`created_at`、`updated_at`。

### `GET /api/labels/{id}`

`label:read`。单条，含 `binding_count`。

### `GET /api/labels/options`

登录即可。仅 `status=enabled` 且未删；按 `sort,id`。`data` 为 `[{ id, name, code, color }, …]`。

### 管理写接口

均需 `label:write`。

- `POST /api/labels` 创建。body：`name` 必填；`code`、`color`、`description`、`sort`、`status`（默认 `enabled`）可选。
- `PUT /api/labels/{id}` 更新元数据。body 同创建，`status` 必填为 `enabled` 或 `disabled`。
- `PUT /api/labels/{id}/status` body `{ "status": "enabled"|"disabled" }`。
- `DELETE /api/labels/{id}` 软删除。

名称或 code 冲突返回 `40901`；校验失败返回 `40004`；不存在返回 `40401`。

### 单元测试

`go test ./internal/service -run TestLabelCRUDStatusAndUniqueness`

---

## 12. 操作审计

显式记录业务写操作（成功与失败），与 `api_access_log`（HTTP 流量）和 `login_log`（登录）互补。权限仅 `audit:read`（admin、manager）。菜单 `/management/auditadmin` 绑定 `audit:read`。无篡改/删除接口。

表 `audit_log`：操作者快照、`module`/`action`、对象、`result`、错误码、`request_id`、IP、UA、`detail_json`。

默认列表时间窗最近 7 天；查询跨度最多 90 天；CSV 导出最多 31 天、5000 行。

打点范围：标签、字典、站内信、公告、用户资料、角色/权限码、菜单、RBAC 授权与 SoD、WS 管理动作（同时仍写 `ws_admin_audit`）。

### `GET /api/audit/logs`

`audit:read`。查询：`page`、`page_size`、`from`、`to`、`actor`、`actor_user_id`、`module`、`action`、`target_type`、`target_id`、`result`、`request_id`、`keyword`。`data` 为 `{ list, total, page, page_size }`。列表默认不含完整 `detail`。

### `GET /api/audit/logs/{id}`

`audit:read`。含解析后的 `detail`。

### `GET /api/audit/modules`

`audit:read`。返回已知模块与动作枚举，供筛选项。

### `GET /api/audit/logs/export`

`audit:read`。CSV 下载。查询参数同列表；时间跨度 ≤ 31 天。

### 单元测试

`go test ./internal/service -run TestAuditRecordListExportAndFailure`

---

## 13. 字典 / 配置中心

与标签不同：字典是 `dict_type` + `dict_item`（性别、公告类型、订单状态等），前端下拉统一按 `code` 读取，减少硬编码。权限：`dict:read` 列表/详情，`dict:write` 创建、改、启停、软删。菜单 `/management/dictadmin` 绑定 `dict:read`。`GET /api/dicts/options?code=` 仅需登录。

`status`：`enabled` | `disabled`。类型或条目停用后不再出现在 options。软删类型会级联软删其条目。类型 `code` 创建后不可改；同类型下 `value` 唯一。`code` 须为 snake_case（`^[a-z][a-z0-9_]{1,63}$`）。`color` 可选，`#RGB` / `#RRGGBB`。

内置种子（若不存在则插入）：`gender`、`yes_no`、`announcement_type`、`announcement_level`、`notice_category`。

### `GET /api/dicts`

`dict:read`。查询 `page`、`page_size`、`code`、`name`、`status`。`data` 为 `{ list, total, page, page_size }`。每条含 `id`、`code`、`name`、`description`、`sort`、`status`、`item_count`、`created_by`、`created_at`、`updated_at`。

### `GET /api/dicts/{id}`

`dict:read`。单条类型，含 `item_count`。

### `GET /api/dicts/{id}/items`

`dict:read`。查询 `page`、`page_size`、`status`、`keyword`（匹配 value/label）。`data` 为 `{ list, total, page, page_size }`。

### `GET /api/dicts/options`

登录即可。查询必填 `code`。仅类型与条目均为 `enabled` 且未删；按 `sort,id`。`data` 为 `[{ value, label, color }, …]`。

### 管理写接口

均需 `dict:write`。

- `POST /api/dicts` 创建类型。body：`code`、`name` 必填；`description`、`sort`、`status`（默认 `enabled`）可选。
- `PUT /api/dicts/{id}` 更新类型元数据（`code` 不可变）。`status` 必填。
- `PUT /api/dicts/{id}/status` body `{ "status": "enabled"|"disabled" }`。
- `DELETE /api/dicts/{id}` 软删除类型及其条目。
- `POST /api/dicts/{id}/items` 创建条目。body：`value`、`label` 必填；`color`、`sort`、`status`、`remark` 可选。
- `PUT /api/dict-items/{id}` 更新条目。
- `PUT /api/dict-items/{id}/status` 启停条目。
- `DELETE /api/dict-items/{id}` 软删除条目。

冲突返回 `40901`；校验失败 `40004`；不存在 `40401`；试图改 `code` 返回受保护错误。

### 单元测试

`go test ./internal/service -run TestDictTypeItemOptionsAndUniqueness`

---

## 14. 站内信 / 任务通知

与公告不同：公告是广播；站内信/待办是**按人投递、持久化**。`kind=inbox` 告知型（未读→已读）；`kind=todo` 任务型（`pending`→`done`/`dismissed`）。权限：`notice:read` 管理列表，`notice:write` 发送/关闭。菜单 `/management/noticeadmin` 绑定 `notice:read`。用户侧 `/api/me/notices*` 仅需登录。

表 `notice` + `notice_recipient`。发送时 `user_ids` 去重写入收件人；todo 默认 `todo_status=pending`。关闭后收件人不可再办结。发送成功后对在线收件人推 WS `notice.message`（与瞬时 `notify.push` 分开）。

`level`：`info` | `important`。`category` 建议用字典 `notice_category`（system/task/mention/approval）。

### `GET /api/me/notices`

登录。查询 `page`、`page_size`、`kind`、`unread`（`1`/`true`）、`todo_status`。`data` 为 `{ list, total, page, page_size, unread_count }`。

### `GET /api/me/notices/summary`

登录。`data`：`{ inbox_unread, todo_pending }`（铃铛用）。

### `PUT /api/me/notices/{id}/read`

登录。标已读。

### `PUT /api/me/notices/read-all`

登录。body/query 可选 `kind`。

### `PUT /api/me/notices/{id}/todo`

登录。body `{ "status": "done"|"dismissed" }`。仅 open 的 todo；同时标已读。

### `GET /api/notices` / `GET /api/notices/{id}`

`notice:read`。管理发出列表/详情，含 `recipient_count`、`read_count`、`todo_done_count`。

### `POST /api/notices`

`notice:write`。body：`kind`、`title`、`user_ids` 必填；`content`、`category`、`level`、`link_path`、`payload` 可选。

### `PUT /api/notices/{id}/close`

`notice:write`。关闭信件。

### 单元测试

`go test ./internal/service -run TestNoticeSendReadTodoClose`

---

## 15. 账号安全、部门、参数、数据范围

路由：`internal/router/auth.go`、`user.go`、`platform.go`  
服务：`session.go`、`dept.go`、`config.go`、`rbac.go`（`EffectiveDataScope`）

### 改密

`POST /api/me/password`，登录即可。

```json
{ "old_password_encrypted": "<RSA>", "new_password_encrypted": "<RSA>" }
```

旧密码不对 → `40101`。新密码长度不合法 → `40006`。成功后吊销除当前 `sid` 以外的会话。

### 管理员开户与启停

权限 `user:write`。密码字段与登录一样，先取公钥再做 RSA-OAEP-SHA256。

| 方法 | 路径                       | 说明                                                                                  |
| ---- | -------------------------- | ------------------------------------------------------------------------------------- |
| POST | `/api/users`               | body `{username, password_encrypted}`。成功后默认角色 `user`，`status=1`              |
| PUT  | `/api/users/{id}/status`   | body `{status}`，`1` 启用，`0` 停用。停用会吊销该用户全部会话。不能停用自己 → `40904` |
| PUT  | `/api/users/{id}/password` | body `{password_encrypted}`。重置后吊销该用户全部会话，响应里没有明文密码             |

用户名已存在 → `40906`。用户名不合法 → `40005`。密码长度不合法 → `40006`。密文无效 → `40003`。

`GET /api/users` 每一项增加 `status`（与 `profile.status` 相同，`1` 正常，`0` 停用）。资料更新接口仍然忽略 `status`。

### 会话

登录与刷新的 **data** 增加 `session_id`（JWT claim `sid`）。`GET /api/me` 同样返回 `session_id`。

| 方法   | 路径                    | 说明                                               |
| ------ | ----------------------- | -------------------------------------------------- |
| GET    | `/api/me/sessions`      | 未吊销且未过期的会话。`current=true` 为当前 access |
| DELETE | `/api/me/sessions/{id}` | 下线该会话。当前会话被下线后 token 立即失效        |

OAuth 登录也会写入会话。进程重启后，已吊销会话仍保持失效。

### 部门

| 方法   | 路径                         | 权限                                                                                     |
| ------ | ---------------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/api/depts`                 | `dept:read`，**data** `{list}` 树，`children`                                            |
| POST   | `/api/depts`                 | `dept:write`，body `name` `code` `parent_id?` `sort?` `status?` `leader_user_id?`        |
| PUT    | `/api/depts/{id}`            | `dept:write`。`parent_id` 空字符串改为根                                                 |
| DELETE | `/api/depts/{id}`            | 有子部门或仍有用户 → `40905`                                                             |
| PUT    | `/api/users/{id}/department` | `user:write`，body `{department_id}`。空/null 取消归属，并同步 `profile.department` 名称 |

`code`：`^[a-z][a-z0-9_]{1,31}$`。演示部门 `it` / `biz` / `finance` / `ops` 会按资料里的部门名称回填 `department_id`（仅空值）。

`PUT /api/me/profile` 与管理端资料更新都忽略 `department`。

### 系统参数

| 方法 | 路径                  | 权限                                |
| ---- | --------------------- | ----------------------------------- |
| GET  | `/api/site`           | 公开。`{name, allow_register}`      |
| GET  | `/api/configs?group=` | `config:read`。不返回 `bootstrap.*` |
| PUT  | `/api/configs/{key}`  | `config:write`，body `{value}`      |

种子：`site.name=goadmin`，`site.allow_register=true`。bool 值用 `true`/`false`。

### 数据范围

角色字段 `data_scope`：`all` 全部，`dept` 本部门及下级，`self` 仅本人。多个激活角色（含继承）取最宽的一个。

种子只写一次：admin=`all`，manager=`dept`，user/cashier/accountant=`self`。之后在角色接口里改，启动不会覆盖。

`GET /api/users` 已按该范围过滤，并返回 `data_scope`。查看者没有部门时，`dept` 退化为只看自己。列表是分页的，见 §20。

### 侧栏

首次启动会把 `/music`、`/bmap`、`/charts` 及其子页、`/profile` 的 `visible_in_menu` 设为 0，并写入 `bootstrap.menu_demo_hidden`。之后可在菜单管理里重新打开。

新增菜单（已绑权限）：`/management/deptadmin`、`configadmin`、`ticketadmin`、`jobadmin`、`apikeyadmin`、`aiadmin`，以及 `/aichat`（`ai:use`）、`/mytickets`（登录即可见，未绑权限）。

---

## 16. 工单

| 方法 | 路径                         | 权限                                                                            |
| ---- | ---------------------------- | ------------------------------------------------------------------------------- |
| POST | `/api/tickets`               | 登录。`title`、`content` 必填，`priority` 为 `low`/`normal`/`high`              |
| GET  | `/api/me/tickets`            | 登录。创建人或处理人。query `status` `page` `page_size`                         |
| GET  | `/api/me/tickets/{id}`       | 创建人或处理人，含 `events`                                                     |
| PUT  | `/api/me/tickets/{id}/close` | 创建人。`close_reason` 必填                                                     |
| GET  | `/api/tickets`               | `ticket:read`。按数据范围过滤，响应带 `data_scope`                              |
| GET  | `/api/tickets/{id}`          | `ticket:read`。超出范围视为不存在                                               |
| PUT  | `/api/tickets/{id}/assign`   | `ticket:write`。`assignee_id` 与 `department_id` 至少一个。仅 `open`/`assigned` |
| PUT  | `/api/tickets/{id}/process`  | `ticket:write`。`open`/`assigned` → `processing`，`note` 可选                   |
| PUT  | `/api/tickets/{id}/close`    | `ticket:write`                                                                  |

状态：`open` → `assigned` → `processing` → `closed`。`open` 也可以直接 `processing` 或 `closed`。非法迁移 → `40004`。

数据范围与用户列表同一套：`all` 全部；`self` 为创建人或处理人；`dept` 为本部门及下级（工单 `department_id`，或创建人/处理人所属部门落在这棵树里），并始终包含查看者自己的单。查看者没有部门时，`dept` 退化为 `self`。分派、处理、关闭同样先过这个范围。

分派给别人时，给处理人发一条待办（`kind=todo`，`category=ticket`，`link_path=/mytickets`）。只分派部门、没有 `assignee_id` 时不发。管理员关闭时给提单人发站内信；提单人自己关闭不发。处理动作仍要 `ticket:write`。

---

## 17. 定时任务

单进程调度，每 30 秒检查一次。内置两个任务：

| code                  | 间隔     | 作用                                                             |
| --------------------- | -------- | ---------------------------------------------------------------- |
| `stats.daily`         | 86400 秒 | 统计昨日 `api_access_log` 条数                                   |
| `announcement.expire` | 300 秒   | 把已发布且 `expires_at` 已到的公告 `status` 写成 `expired`       |
| `announcement.start`  | 300 秒   | 给已到 `starts_at`、尚未发过站内信的已发布公告补发一次。见 §23   |
| `log.purge`           | 86400 秒 | 按 `log.retention_days` 清理登录日志、操作审计和访问日志。见 §22 |

`expired` 不再出现在用户公告列表。管理端可以重新发布。到期前用户列表仍按查询时的窗口过滤；任务负责把管理列表里的状态改成已过期。已有库在下次启动时补上 `announcement.expire`，不会改已有任务的启停。

| 方法 | 路径                           | 权限                                     |
| ---- | ------------------------------ | ---------------------------------------- |
| GET  | `/api/jobs`                    | `job:read`                               |
| PUT  | `/api/jobs/{code}/status`      | `job:write`，body `{enabled:true/false}` |
| POST | `/api/jobs/{code}/run`         | `job:write`。停用也可以手动跑            |
| GET  | `/api/jobs/{code}/runs?limit=` | `job:read`                               |

`code` 含点号，例如 `stats.daily`，作为单个路径段。

---

## 18. API 密钥

| 方法   | 路径                 | 权限                                                                        |
| ------ | -------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/api-keys`      | `apikey:read`                                                               |
| POST   | `/api/api-keys`      | `apikey:write`。body `{name, scopes, expires_at?}`。**data.key 只返回一次** |
| DELETE | `/api/api-keys/{id}` | `apikey:write`，状态改为 0                                                  |

`scopes` 只能是：`user:read` `dict:read` `label:read` `announcement:read` `dept:read` `stats:read`。

调用：`Authorization: Bearer gak_...` 或 `X-Api-Key`。只允许 GET，且路径必须落在对应读接口上（`/api/users`、`/api/dicts`、`/api/labels`、`/api/announcements`、`/api/depts`、`/api/stats`）。其它接口 `40301`。用户列表仍按密钥所属用户的数据范围过滤。`expires_at` 用 RFC3339。

---

## 19. AI 对话

| 方法   | 路径                                  | 权限                                                 |
| ------ | ------------------------------------- | ---------------------------------------------------- |
| GET    | `/api/ai/models/options`              | `ai:use`。启用中的模型，无密钥                       |
| GET    | `/api/ai/models`                      | `ai:read`。`api_key_set`、`api_key_hint`，不回传密钥 |
| POST   | `/api/ai/models`                      | `ai:write`                                           |
| PUT    | `/api/ai/models/{id}`                 | `ai:write`。`api_key` 空则保留原值                   |
| DELETE | `/api/ai/models/{id}`                 | `ai:write`。已有对话 → `40905`                       |
| GET    | `/api/ai/conversations`               | `ai:use`，只看自己，最多 50 条                       |
| POST   | `/api/ai/conversations`               | `ai:use`。`{model_id, content}`                      |
| GET    | `/api/ai/conversations/{id}`          | `ai:use`                                             |
| POST   | `/api/ai/conversations/{id}/messages` | `ai:use`。`{content}`                                |

`provider`：`none` 或 `openai`。`none` 或 `base_url` 为空时，助手回复固定为「模型未接入，已记录本次调用。」`openai` 走 `{base_url}/v1/chat/completions`（地址已含 `/chat/completions` 则不改）。普通用户通过继承拥有 `ai:use`。每次对话写入操作审计 `module=ai` `action=chat`。

### 单元测试

`go test ./internal/service -run 'TestPlatform|TestDept|TestChangePassword|TestTicket|TestJobRun|TestAccountStatus|TestRound'`

---

## 20. 范围、检索、岗位、标签、公告触达

### 登录日志与操作审计

`GET /api/login/logs`、`GET /api/login/stats`、`GET /api/audit/logs`、`GET /api/audit/logs/export`、`GET /api/audit/logs/{id}` 使用角色 `data_scope`。

| 范围   | 能看到                                                    |
| ------ | --------------------------------------------------------- |
| `all`  | 全部                                                      |
| `self` | 自己的登录记录，或自己作为操作者的审计                    |
| `dept` | 本部门及下级用户产生的记录。查看者没有部门时退化为 `self` |

登录失败且没有 `user_id` 的行，在 `self` / `dept` 下不会出现。响应增加 `data_scope`。超出范围的审计详情是 `40401`。

### 用户列表分页

`GET /api/users` 默认 `page=1`、`page_size=20`（最大 100）。query：`keyword`（用户名包含）、`status`（`1` 正常，`0` 停用）、`department_id`、`role`。部门与角色的规则见 §21。

**data** `{list, total, page, page_size, data_scope}`。`list` 不再是全量。筛选发生在数据范围之后。

### 部门负责人

部门对象增加 `leader_user_id`，可空。创建和更新都可传；更新时传空字符串清除。同一个人可以负责多个部门。负责人不存在 → `40401`。

### 岗位

| 方法   | 路径                            | 权限                                                              |
| ------ | ------------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/positions?department_id=` | `position:read`                                                   |
| POST   | `/api/positions`                | `position:write`。`department_id` `name` `code` 必填              |
| PUT    | `/api/positions/{id}`           | `position:write`。改名会同步已任职用户的 `job_title`              |
| DELETE | `/api/positions/{id}`           | 仍有人任职 → `40905`                                              |
| PUT    | `/api/users/{id}/position`      | `user:write`。`{position_id}`，空/null 取消任职并清空 `job_title` |

`code` 规则与部门相同。资料更新忽略 `job_title`。`profile.position_id` 是当前任职。侧栏 `/management/postadmin` 需要 `position:read`。种子岗位：信息技术部 `engineer`，业务部 `sales`。

### 标签挂接

| 方法 | 路径                                           | 权限                                                                                |
| ---- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| GET  | `/api/labels/bindings?target_type=&target_id=` | `label:read`                                                                        |
| PUT  | `/api/labels/bindings`                         | `label:write`。body `{target_type, target_id, label_ids}`。整单替换，空数组表示解绑 |

`target_type` 只能是 `ticket`、`user`、`announcement`。只能挂启用中的标签。标签列表的 `binding_count` 会跟着变。

### 公告触达

发布和重新发布成功后，若公告当前已可见（未到 `starts_at`、未过 `expires_at`），给 `status=1` 的用户各发一条站内信：`title=新公告`，`category=announcement`，`link_path=/workplace`，`payload.announcement_id` 是公告 id。预约到未来才开始的公告本次不发。到期任务不会再发一次。

---

## 21. 用户筛选与访问统计范围

### 用户列表

`GET /api/users` 增加 query：

| 参数            | 说明                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| `department_id` | 只保留资料里归属该部门的用户。精确匹配，不含下级。部门不存在 → `40401`，ID 非法 → `40004` |
| `role`          | 只保留直接分配了该角色的用户，不含继承展开。角色不存在 → `40401`，编码非法 → `40004`      |

两个条件与 `keyword`、`status`、数据范围同时生效。范围内没有人时 `total=0`，不是错误。

### 访问统计

`GET /api/stats/access/logs`、`GET /api/stats/access/daily`、`GET /api/stats/access/users` 使用角色 `data_scope`，响应增加 `data_scope`。

| 范围   | 能看到                                                    |
| ------ | --------------------------------------------------------- |
| `all`  | 全部，含匿名                                              |
| `self` | 自己产生的访问                                            |
| `dept` | 本部门及下级用户产生的访问。查看者没有部门时退化为 `self` |

`self` / `dept` 下匿名行不出现。`user_id=anonymous` 在这两种范围下得到空列表。`GET /api/stats/access` 仍是全站按路径汇总。`GET /api/stats/server` 仍是整机指标。

---

## 22. 登录锁定、工单留言、日志保留

### 登录锁定

连续密码错误达到 `security.login_fail_limit`（默认 5）后，锁定该用户名 `security.login_lock_minutes`（默认 15）分钟。任一参数为 `0` 时不锁定。验证码错误和密文错误不计入。成功登录会清掉计数。

锁定中的登录返回 HTTP 403 / `code=40304`，`data.retry_after` 是剩余秒数。登录日志 `fail_reason` 为 `account locked`。用户名超过 64 个字符不计入。

管理员提前解锁：`PUT /api/users/{id}/unlock`，权限 `user:write`。超出数据范围是 `40401`。

### 工单留言

| 方法 | 路径                            | 谁能用                         |
| ---- | ------------------------------- | ------------------------------ |
| POST | `/api/me/tickets/{id}/comments` | 创建人或处理人                 |
| POST | `/api/tickets/{id}/comments`    | `ticket:write`，并先过数据范围 |

body `{content}`，1 到 1024 个字符。状态不变，详情 `events` 增加 `action=comment`。已关闭的工单返回 `40004`。空内容同样是 `40004`。

### 日志保留

系统参数 `log.retention_days`，默认 90。`0` 表示不清理。任务 `log.purge` 每天删除更早的 `login_log`、`audit_log`、`api_access_log`。运行结果形如 `login=1 audit=2 access=3`，关闭清理时是 `skipped=1`。已有库在下次启动时补上这条任务，不会改已有任务的启停。

---

## 23. 工单检索、公告生效、工作台

### 工单检索与截止时间

`GET /api/tickets` 与 `GET /api/me/tickets` 增加 query：

| 参数       | 说明                                          |
| ---------- | --------------------------------------------- |
| `keyword`  | 标题包含，最长按 64 个字符截断                |
| `priority` | `low`、`normal`、`high`。非法值 → `40004`     |
| `overdue`  | `1` 时只保留 `due_at` 已过且状态不是 `closed` |

筛选与 `status`、数据范围同时生效。

`POST /api/tickets` 可带 `due_at`，RFC3339。不传表示没有截止时间。到点不改状态。响应里的 `due_at` 也是 RFC3339。

### 公告生效触达

任务 `announcement.start` 每 300 秒检查：已发布、`starts_at` 已到、未过期、还没发过站内信。补发一次，标题仍是「新公告」。已经在发布当时可见并发过的不再发。已有库下次启动补上这条任务。

### 留言通知

留言成功后，若工单已有处理人，给对方发站内信「工单新留言」，`link_path=/mytickets`。创建人留言通知处理人，处理人留言通知创建人，其他人留言则两边都收、留言者自己不收。没有处理人时不发。发送失败不回滚留言。

### 工作台

`GET /api/me/home`，登录即可。

| 字段                   | 含义                               |
| ---------------------- | ---------------------------------- |
| `inbox_unread`         | 未读站内信                         |
| `todo_pending`         | 未办结待办                         |
| `open_tickets`         | 自己创建或被分派、且未关闭的工单数 |
| `unread_announcements` | 当前可见且未读的公告，含必读       |

### 部门人数

`GET /api/depts` 每个节点增加 `member_count`。只计 `status=1` 且 `department_id` 等于该部门的用户，不含下级。

---

## 24. 本轮扩展（CSV / 参数 / 邮件 / 看板 / SLA）

### CSV 导出

与审计导出相同：直接写 `text/csv`，最多 31 天窗、最多 5000 行。

| 方法 | 路径                            | 权限                           |
| ---- | ------------------------------- | ------------------------------ |
| GET  | `/api/users/export`             | `user:read`                    |
| GET  | `/api/login/logs/export`        | `login:read`（须 `from`/`to`） |
| GET  | `/api/stats/access/logs/export` | `stats:read`（须 `from`/`to`） |
| GET  | `/api/export/depts`             | `dept:read`                    |
| GET  | `/api/export/dicts`             | `dict:read`                    |

### CSV 导入（Excel 可打开，UTF-8 BOM）

`multipart/form-data` 字段名 `file`。先 `preview` 再提交。

| 方法     | 路径                         | 权限         |
| -------- | ---------------------------- | ------------ |
| GET      | `/api/import/users/template` | `user:write` |
| POST     | `/api/import/users/preview`  | `user:write` |
| POST     | `/api/import/users`          | `user:write` |
| GET/POST | `/api/import/depts/...`      | `dept:write` |
| GET/POST | `/api/import/dicts/...`      | `dict:write` |

用户模板列：`username,password,department_code,roles`（roles 用 `|` 分隔）。

### 系统参数分组

`GET /api/configs/groups`（`config:read`）→ `{ list: [{ code, name, description }] }`。

新增种子：`security.password_min_length`（默认 6）、`security.password_max_age_days`（默认 0=关闭）、`mail.*` SMTP 项。

密码超期登录返回 **40305** `CodePasswordExpired`，不发 token；管理员重置或本人改密会刷新 `user.password_changed_at`。

### Access 过期

`40104`：access JWT 过期（与 `40102` 吊销/伪造区分）。前端应 `POST /api/token/refresh`；refresh 自身过期也返回 `40104`。

### 邮件模板

| 方法 | 路径                  | 权限           |
| ---- | --------------------- | -------------- |
| GET  | `/api/mail/templates` | `config:read`  |
| PUT  | `/api/mail/templates` | `config:write` |
| POST | `/api/mail/test`      | `config:write` |

`mail.enabled=false` 时只打日志不发信。正文支持 `{{key}}` 占位。

### 定时任务

任务列表增加 `cron_expr`、`has_handler`。有 `cron_expr`（五段：分 时 日 月 周）时按表达式触发，否则仍用 `interval_seconds`。新增内置 `ticket.due_remind`：到期未关闭且未提醒过的工单，给处理人（无则提单人）发站内信一次。

### 数据看板

`GET /api/stats/dashboard`（`stats:read`）：近区间登录日序列、访问日序列、工单状态漏斗、公告发布/已读计数；尊重数据范围。

### AI

厂商调用失败时回退占位回复并写入对话；助手消息可带 `token_usage`（厂商返回的 total_tokens）。

---

## 25. 服务端质量扩展（H1–H20）

看板「要做」已落地（**H4 IP 白名单标以后，未做**）。

### 探针与关闭

| 路径                    | 说明                                 |
| ----------------------- | ------------------------------------ |
| `GET /livez`            | 进程存活                             |
| `GET /readyz`           | 可接流量；库失败或 draining → 503    |
| `GET /health`           | 兼容旧探活                           |
| `GET /metrics`          | Prometheus 文本（`metrics.enabled`） |
| `GET /api/openapi.yaml` | 仓库 OpenAPI（`openapi.enabled`）    |

响应头：`X-API-Version: 1`。优雅关闭：`shutdown.drainSeconds` 内 `/readyz` 先变 draining。

配置：`server.maxBodyMB`、`readTimeoutSec`/`writeTimeoutSec`、`server.trustedProxies`、`cors.origins`、`log.requestSampleEvery`、`log.slowRequestMS`。

### 维护模式

`site.maintenance=true` 时，非豁免写请求 503。`config:write` / `*` 可豁免。

### 检索 / 角色 / 工单

- `GET /api/search?q=` 登录即可；用户与工单过数据范围；每类最多 5 条
- `POST /api/roles/{code}/copy` body `{ code, name }`（`role:write`）
- `PUT /api/tickets/{id}/reopen`、`PUT /api/me/tickets/{id}/reopen`；`POST /api/me/tickets/{id}/rate`（1–5）

### Webhook / 机器人 / Flag / TOTP

| 路径                          | 权限                           |
| ----------------------------- | ------------------------------ |
| `/api/webhooks`               | `config:read` / `config:write` |
| `/api/bots/test`              | `config:write`                 |
| `/api/flags`、`/api/me/flags` | config / 登录                  |
| `/api/me/totp*`               | 登录                           |

登录可带 `totp_code`；已绑定时缺码或错码 → **40306**。新 IP 登录（30 天内未见）发站内信。

### 幂等

写接口可带头 `Idempotency-Key`（≤128）；同用户同方法同路径 24h 内重放首次响应，响应头 `Idempotent-Replay: true`。

### 敏感配置

`value_type=secret` 列表返回 `******`；提交 `******` 视为未改。

任务失败：同任务同日最多一条站内信给 `job:read`/`*` 用户。

---

## 26. 运维与体验扩展（ops-next N2–N18、N20）

看板跳过 N1（IP 白名单）、N19（回收站）。新增错误码：**40307** 须改密、**40308** 必读门禁、**40309** 邮件未启用。

### 安全与配额

- 全局安全头：`X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`；`security.hstsSeconds>0` 时加 HSTS
- 管理员重置密码后 `must_change_password=1`；登录/`/api/me` 返回该标志；写接口拦 **40307**（改密/登出/会话/TOTP 豁免）
- `security.password_history_count`：改密不可与最近 N 次（及当前）相同
- `api.userQPS` / `api.apikeyQPS`：认证后每秒配额，超限 **42901**

### 探针与状态

- `GET /readyz?detail=1` → `checks:[{name,ok,latency_ms}]`
- `GET /status`：公开精简态（overall / version / database_ok / draining / job_failures_24h）
- `otel.enabled` + `otel.otlpHTTPEndpoint`：注入 `traceparent`，可选 OTLP/HTTP 导出

### Webhook / 入站

- 出站改为投递表 + 任务 `webhook.retry`（退避 1m/5m/30m，最多 4 次；死信可重放）
- `GET /api/webhooks/deliveries`、`POST /api/webhooks/deliveries/{id}/replay`（`config:read`/`write`）
- `POST /api/hooks/tickets`：头 `X-Hook-Token` 或 `Authorization: Bearer` 对 `security.inbound_ticket_hook_token`；body `title` `content` `priority?` `creator_id`

### 配置历史 / 偏好 / 通知

- `GET /api/configs/{key}/revisions`（`config:read`）；secret 脱敏；`******` 更新视为未改
- `GET/PUT /api/me/preferences`：白名单键 `theme` `locale` `home_layout` `timezone` `sidebar_collapsed`
- `GET/PUT /api/me/notify-prefs`：`items:[{event,channel,enabled}]`，渠道 `inbox|mail|bot`

### 工单关注 / 批量

- `POST/DELETE/GET .../tickets/{id}/watchers`（我的或 `ticket:write`）
- `POST /api/tickets/batch-assign`、`POST /api/users/batch-status`（最多 100，部分失败回 `failed`）

### 找回密码 / 邀请 / 提权 / 门禁

- `POST /api/password/forgot` `{account}`、`POST /api/password/reset` `{token,password_encrypted}`（需 `mail.enabled`）
- `POST /api/invites`（`user:write`）、`POST /api/invites/accept` 公开
- `POST /api/me/breakglass`；管理 `GET/POST /api/breakglass/{id}/approve|revoke`；任务 `breakglass.expire`
- `site.require_ack_blocking=true` 时未读 `required` 公告拦写请求 **40308**（可标已读/改密/登出）

---

## 27. 平台打磨（polish P3–P8、P10–P20）

跳过 P1/P2/P9。

### 权限与范围

- `POST /api/rbac/assign` 可带 `hours`：临时角色，任务 `role.expire` 清理；`GetAssignedRoles` 忽略过期
- 角色 `data_scope=custom` + `PUT/GET /api/rbac/roles/{code}/scope-depts`；列表/工单按绑定部门树过滤
- `GET /api/rbac/permission-usage?days=`：近 N 天审计命中 vs 权限码

### 公告 / 工单

- 公告 `target_dept_ids` / `target_role_codes`（空=全员）
- 工单模板 `/api/ticket-templates`；创建可带 `template_id`
- 留言 `@username` → 站内信并加 watcher
- 工单关联 `POST/DELETE/GET .../tickets/{id}/links`
- 自动分派 `/api/ticket-assign-rules`（按 priority 轮询处理人池）

### 安全 / 邮件 / 审计

- 登录 `trust_token` / `remember_device`；`/api/me/trusted-devices`
- 邮件熔断参数 `mail.circuit_*`；`GET/POST /api/mail/circuit*`
- 审计 `prev_hash`/`entry_hash`；`GET /api/audit/chain/verify`；事件 `audit.written` 出站

### 其它

- `/api/me/saved-filters`；配置包 `/api/config-pack/export|preview|import`
- `POST /api/jobs/runs/{id}/cancel`；任务 `idem.purge`；`GET /api/idempotency/records`
- `/health` 响应带 `Deprecation` 与 successor `Link`

---

## 28. 体验 refine（R1、R3–R20）

跳过 R2。

### 个人菜单

- `GET/PUT /api/me/menu-pins`：`{pins:[path], recent?:[]}`；偏好键 `menu.pins` / `menu.recent`（最近最多 20）
- `POST /api/me/menu-recent` `{path}` 记录访问
- `GET /api/me/menus` 节点可带 `pinned` / `recent`

### Step-up 确认

- `POST /api/me/confirmations` `{password}` 或 `{totp_code}` → `{token, expires_at}`（5 分钟）
- 请求头 `X-Confirmation-Token`；**40310** 未确认
- 适用：`PUT /api/configs/{key}`（`site.maintenance` 或 `mail.*`）、`POST /api/mail/circuit/reset`、`PUT /api/users/{id}/status` 且 `status=0`

### API Key / 任务 / 就绪

- 列表 `days_left`（无过期为 null）；任务 `apikey.expire_remind`（7 天内每日提醒）
- 任务列表 `next_run_at`
- `GET /readyz?detail=1` 含 `mail_circuit`；`mail.readyz_strict=true` 时熔断打开则 503

### 审计 / 通知 / 工单

- `GET /api/audit/by-request/{request_id}`（范围同列表）
- `PUT /api/me/notices/archive` `{ids:[]}`；列表默认排除归档，`archived=1` 查归档
- `GET /api/stats/tickets/lead-time` 关闭工单耗时（按 priority avg/p50/p90）
- `POST /api/roles/{code}/permissions/preview` → `{added, removed}`
- `PUT /api/tickets/{id}/priority` `{priority}` + 事件 + 通知

### 用户 / 部门 / 导出 / Webhook

- 禁用可带 `reason`；登录禁用响应可含 `disable_reason`
- `GET /api/stats/access/top-paths?days=7&limit=20`
- 各导出写审计 `module=export`；可选 `audit.export` 出站
- `GET /api/depts/{id}/members?keyword=`
- `POST /api/webhooks/{id}/test` 投递 `webhook.ping`
- 权限 `description`；`/api/site` 含 `maintenance` / `maintenance_at` / `maintenance_message`
- `GET /api/announcements/{id}/stats` → audience / read / rate
- 慢请求审计 `module=http` `action=slow`（同 path 每分钟最多 1 条）
