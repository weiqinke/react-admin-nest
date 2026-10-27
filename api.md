# goadmin API 文档

> 给开发者 / AI 读代码用的接口说明。实现入口：`internal/router/`，业务：`internal/controller/` + `internal/service/`。  
> 机器可读契约（OpenAPI 3.0）：[`openapi.yaml`](./openapi.yaml)；前端对接说明：[`FRONTEND.md`](./FRONTEND.md)；错误码实现：`internal/pkg/response/`。

## 基本约定

| 项 | 说明 |
|----|------|
| Base URL | `http://127.0.0.1:8080`（可由 `server.address` 配置） |
| 数据格式 | JSON，`Content-Type: application/json` |
| **统一信封** | 所有 HTTP JSON 接口均为 `{ code, message, data }` |
| 成功 | HTTP **200**，`code=0`，`message="ok"`，业务在 **`data`** |
| 失败 | **`code` 为业务错误码**（如 `40101`），HTTP 为映射状态；原因在 `message`，附加字段在 `data`（可为 `null`） |
| 鉴权 | `Authorization: Bearer <access token>`；WebSocket 也可用 `?token=` |
| 用户 ID | **雪花 ID，JSON 一律字符串**，前端勿转 Number |
| 权限模型 | Constrained RBAC（角色继承 + SSD/DSD） |
| 访问日志 | 全站写入 `api_access_log`；URL 中 `token` 等敏感参数脱敏为 `***` |
| 请求追踪 | 响应头 `X-Request-ID`；可主动传入同名请求头 |
| 限流 | captcha 30/分、login 10/分、register 5/分、refresh 30/分（按 IP）；超限 HTTP 429 / `code=42901` |

### 响应信封（必读）

```json
{
  "code": 0,
  "message": "ok",
  "data": { }
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

### 演示账号

| 用户名 | 密码 | 角色 | 备注 |
|--------|------|------|------|
| `admin` | `admin123` | admin | 几乎全部权限 |
| `user` | `user123` | user | 普通用户 |
| `cashier1` | `cashier123` | cashier | 出纳 |
| `accountant1` | `account123` | accountant | 会计；与出纳 SSD 互斥 |
| `dual1` | `dual123` | manager + cashier | 登录须传 `active_roles`（DSD） |

### 常见权限码

`user:read` `user:write` `role:read` `role:write` `stats:read` `login:read` `ws:connect` `finance:cash` `finance:account`

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

注册成功后需再调 `POST /api/login` 取 token。

**data 示例**
```json
{
  "user": {
    "id": "3733...",
    "username": "newuser",
    "roles": ["user"],
    "profile": { }
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
      "profile": { }
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `token` | access JWT，TTL=`jwt.ttlHours`（默认 24h），用于 Bearer |
| `refresh_token` | refresh JWT，TTL=`jwt.refreshTTLHours`（默认 168h）；**不能**当 Bearer 调业务接口 |

常见失败码：`40002` 验证码、`40003` 密文、`40101` 账密错误、`40302` 禁用、`40903` DSD、`42901` 限流。

### `POST /api/token/refresh`

公开。限流 30/分/IP。用 refresh 换**新的** access + refresh（**旋转**：旧 refresh 立即作废）。

**请求**
```json
{ "refresh_token": "<refresh jwt>" }
```

**data**：字段同登录（`token` / `expires_at` / `refresh_token` / `refresh_expires_at` / `user`）。

| 情况 | HTTP | code |
|------|------|------|
| refresh 无效/吊销/过期 | 401 | `40103` |
| 账号禁用 | 403 | `40302` |
| DSD 冲突 | 409 | `40903` |

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

| Query | 说明 |
|-------|------|
| page / page_size | 分页 |
| from / to | `YYYY-MM-DD` |
| username | 模糊 |
| user_id | 雪花 ID |
| success | `true`/`false` 或 `1`/`0` |
| ip | 模糊 |

**data**：`{ list, total, page, page_size }`

### `GET /api/login/stats`

权限：`login:read`。默认最近 7 天，最长 90 天。

| Query | 说明 |
|-------|------|
| from / to | 日期 |
| top | `by_user` 条数，默认 10，最大 50 |

**data**
```json
{
  "from": "2026-10-21",
  "to": "2026-10-27",
  "summary": { "day": "", "total": 120, "success": 110, "fail": 10, "unique_users": 18 },
  "daily": [
    { "day": "2026-10-21", "total": 15, "success": 14, "fail": 1, "unique_users": 6 }
  ],
  "by_user": [
    { "user_id": "3733...", "username": "admin", "total": 40, "success": 39, "fail": 1 }
  ]
}
```

---

## 3. 用户详情 Profile

路由：`internal/router/auth.go` + `internal/router/user.go`  
控制器：`internal/controller/profile.go`  
表：`user_profile`

### 详情字段（在 `data` 内）

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | string | 雪花 ID |
| nickname | string | 昵称 |
| real_name | string | 真实姓名 |
| avatar | string | 头像 URL |
| gender | int | 0未知 1男 2女 3其他 |
| birthday | string | `YYYY-MM-DD`，可空 |
| email / phone / mobile | string | 联系方式 |
| id_card | string | 身份证 |
| employee_no | string | 工号 |
| department / job_title / company | string | 组织 |
| province / city / district / address / postal_code / country | string | 地址 |
| bio / website / wechat / qq | string | 扩展 |
| status | int | 1正常 0禁用（本人更新不可改） |
| remark | string | 备注 |
| extra_json | string | 扩展 JSON 文本 |
| created_at / updated_at | string | 时间 |

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

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/permissions` | `role:read` | 列表 → `data.list` |
| GET | `/api/permissions/{code}` | `role:read` | 详情 |
| POST | `/api/permissions` | `role:write` | 创建 `{code,name}` |
| PUT | `/api/permissions/{code}` | `role:write` | 改名称 `{name}` |
| DELETE | `/api/permissions/{code}` | `role:write` | 删除；**data** `{ deleted, permission_code }` |

### 4.2 角色 CRUD

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/roles` | `role:read` | 列表（含 inherits、permissions） |
| GET | `/api/roles/{code}` | `role:read` | 详情 |
| POST | `/api/roles` | `role:write` | 创建 `{code,name,inherits?}` |
| PUT | `/api/roles/{code}` | `role:write` | 更新；`inherits` 数组则整表替换 |
| DELETE | `/api/roles/{code}` | `role:write` | 删；`admin` 禁止；仍有用户绑定时拒绝 → `40904`/`40905` |

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

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles/{code}/permissions` | 直接绑定（不含继承） |
| POST | `/api/roles/{code}/permissions` | 追加 `permission_code` 或 `permission_codes` |
| PUT | `/api/roles/{code}/permissions` | 全量替换 `permission_codes` |
| DELETE | `/api/roles/{code}/permissions/{perm}` | 解绑单个 |

### 4.4 SSD / DSD 约束

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/roles/constraints` | 列表 / 创建 |
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

## 5. 访问统计与服务器信息

路由：`internal/router/stats.go`  
权限：均需 `stats:read`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/access` | 按 method+path 汇总 |
| GET | `/api/stats/access/logs` | 明细分页；`user_id=anonymous` 只查匿名 |
| GET | `/api/stats/access/daily` | 按天 |
| GET | `/api/stats/access/users` | 按用户 |
| GET | `/api/stats/server` | 本机/本进程指标（gopsutil） |

日志 Query：`page` `page_size` `from` `to` `user_id` `path`。  
明细字段：`method path url ip user_id username anonymous status created_at`。

`/api/stats/server` 的 `data` 分组：`host` `cpu` `memory` `swap` `disks` `network` `load` `process` `runtime`。

---

## 6. WebSocket

### `GET /ws`

权限：`ws:connect`。  
连接：`ws://host/ws?token=<access jwt>` 或 Header Bearer。

- 连接后收到 `welcome`
- 客户端可发：`{"type":"chat","payload":{"text":"hi"}}`
- 服务端广播给在线连接

未认证/无权限时仍返回 JSON 信封（升级失败前）：`40101`/`40102` 或 `40301`。

---

## 7. 业务错误码一览

源码：`internal/pkg/response/codes.go`（可用 `Register` 扩展）。

| code | HTTP | 常量 | 说明 |
|------|------|------|------|
| 0 | 200 | `CodeOK` | 成功 |
| 40001 | 400 | `CodeBadRequest` | 通用参数错误 |
| 40002 | 400 | `CodeInvalidCaptcha` | 验证码无效 |
| 40003 | 400 | `CodeInvalidCipher` | 密码密文无效 |
| 40004 | 400 | `CodeValidation` | 字段校验失败 |
| 40005 | 400 | `CodeInvalidUsername` | 用户名不合法 |
| 40006 | 400 | `CodeInvalidPassword` | 密码不合法 |
| 40101 | 401 | `CodeUnauthorized` | 未登录 / 账密错误等 |
| 40102 | 401 | `CodeInvalidToken` | access 无效或已吊销 |
| 40103 | 401 | `CodeInvalidRefreshToken` | refresh 无效或已吊销 |
| 40104 | 401 | `CodeTokenExpired` | 预留：access 过期 |
| 40301 | 403 | `CodeForbidden` | 无权限；`data.permission` |
| 40302 | 403 | `CodeUserDisabled` | 账号禁用 |
| 40401 | 404 | `CodeNotFound` | 资源不存在 |
| 40901 | 409 | `CodeConflict` | 通用冲突 |
| 40902 | 409 | `CodeSSDViolation` | SSD |
| 40903 | 409 | `CodeDSDViolation` | DSD |
| 40904 | 409 | `CodeProtected` | 受保护资源 |
| 40905 | 409 | `CodeInUse` | 仍被引用 |
| 40906 | 409 | `CodeUsernameExists` | 用户名已存在 |
| 42901 | 429 | `CodeTooManyRequests` | 限流；`data.retry_after`（秒）+ 头 `Retry-After` |
| 50001 | 500 | `CodeInternal` | 内部错误 |
| 50301 | 503 | `CodeUnavailable` | 依赖不可用 |

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

## 8. 代码地图

```text
main.go
internal/app/app.go
internal/router/*.go
internal/controller/*.go
internal/service/*.go
internal/pkg/response/          # 信封 + 错误码注册表
internal/middleware/*.go        # Auth / RateLimit / AccessLog / RequestID
internal/bootstrap/db.go
manifest/config/config.yaml
docs/API.md / FRONTEND.md / openapi.yaml
scripts/apitest/
```

新增接口：`service` → `controller`（`response.OK`/`FailCode`）→ `router` 挂权限 → **更新本文件 + openapi.yaml**。

### 自动化测试

```powershell
# 服务已启动且 captcha.debug=true
go run ./scripts/apitest -base http://127.0.0.1:8080 -report docs/TEST_RESULTS.md
```
