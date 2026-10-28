# 前端对接说明（给前端 / 前端 AI）

后端是 **goadmin**（Go + GoFrame），本机默认：

```text
Base URL: http://127.0.0.1:8080
```

**接口契约以 `docs/API.md` 为准**（路径、字段、权限码、业务错误码）。  
机器可读：`docs/openapi.yaml`。本文只补「怎么连、怎么登录、怎么把文档交给前端 AI」。

---

## 1. 本机启动后端（给后端同学）

```powershell
cd d:\go_ai
$env:Path = "C:\Program Files\Go\bin;" + $env:Path
# 确认 manifest/config/config.yaml 里 captcha.debug: true（联调需要）
go run .
```

探活：`GET http://127.0.0.1:8080/health`  
成功完整信封示例：`{ "code": 0, "message": "ok", "data": { "status": "ok", ... } }`  
数据库挂了：HTTP 503，`code=50301`，`data.status` 为 `degraded`。

已开启 CORS。若前端不在本机，把 Base URL 换成局域网 IP，并放行 8080。

---

## 2. 给前端 AI 的最小交接包

| 文件 | 用途 |
|------|------|
| **`docs/openapi.yaml`** | OpenAPI 3.0：path/schema/Bearer；**200 schema = data**；错误为完整信封 |
| **`docs/API.md`** | 人读：业务规则、RBAC/DSD、**§7 业务错误码表** |
| **`docs/FRONTEND.md`** | 本文：登录流程、Base URL、演示账号 |
| （可选）`docs/TEST.md` | 后端自测清单 |

**不要**把 `manifest/config/config.yaml`（含数据库口令）发给前端。

### 可直接粘贴给前端 AI 的开工指令

```text
你对接的后端是 goadmin，Base URL: http://127.0.0.1:8080。

机器可读契约（优先）：docs/openapi.yaml（OpenAPI 3.0；200 响应 schema 描述的是 data）。
人读补充：docs/API.md（含 §7 业务错误码）、docs/FRONTEND.md。

硬性规则：
1. 所有 JSON 响应统一为 { code, message, data }；成功 code===0，业务在 data；失败 code 为业务错误码（如 40101），HTTP 为映射状态。完整表见 API.md §7
2. 前端先判断 code===0 再读 data；不要用 HTTP 状态码当业务码
3. JSON；需要登录的接口 Header: Authorization: Bearer <access token>（refresh 不能当 Bearer）
4. 用户 id 是雪花字符串，禁止 Number 化
5. 登录/注册密码：先 GET /api/crypto/public-key，RSA-OAEP-SHA256 加密后 Base64 → password_encrypted；禁止明文 password
6. 登录还要 GET /api/captcha，提交 captcha_id + captcha_code（联调 captcha 可能带 answer）
7. 登录返回 access(token) + refresh_token；业务只用 access；过期用 POST /api/token/refresh 旋转续期（须保存新 refresh）
8. 登出 POST /api/logout（Bearer access，body 带 refresh_token）后双 token 都作废
9. 40301 看 data.permission；42901 看 data.retry_after / 头 Retry-After；响应可带 X-Request-ID
10. 不做后端菜单树；按钮/路由显隐用登录返回的 permissions / roles
11. 权限码路径参数含冒号时要 URL 编码（user:read → user%3Aread）

演示账号：admin/admin123（权限最全）。先根据 openapi.yaml 生成请求封装与类型，实现登录页 + token 刷新拦截器，再接业务页。
```

---

## 3. 鉴权与登录流程（前端必须按此实现）

```text
1) GET  /api/captcha              → data: captcha_id, image（联调可能有 answer）
2) GET  /api/crypto/public-key    → data: public_key (PEM)
3) 浏览器内：RSA-OAEP(SHA-256) 加密明文密码 → Base64 → password_encrypted
4) POST /api/login
   body: { username, password_encrypted, captcha_id, captcha_code, active_roles? }
   → data: token(access), expires_at, refresh_token, refresh_expires_at, user{...}
5) 业务请求：Authorization: Bearer <access token>
6) access 快过期或 401（40101/40102/40104）：POST /api/token/refresh
   body: { refresh_token } → 新的 access + refresh（旧 refresh 作废，须保存新 refresh）
7) 退出：POST /api/logout（Bearer access，body 建议带 refresh_token）→ 清本地双 token
```

公开接口（无需 access token）：

- `GET /health`
- `GET /api/captcha`
- `GET /api/crypto/public-key`
- `POST /api/register`
- `POST /api/login`
- `POST /api/token/refresh`

其余 `/api/*` 与 `GET /gows` 都要鉴权；权限不足：HTTP 403 / `code=40301` + `data.permission`。

WebSocket：`ws://127.0.0.1:8080/gows?token=<access jwt>`（或握手带 Bearer），需要 `ws:connect`。

### 请求封装建议

```ts
type Envelope<T> = { code: number; message: string; data: T };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, init);
  const body = (await res.json()) as Envelope<T>;
  if (body.code !== 0) {
    // 按 body.code 分支：40102→尝试 refresh；40301→无权限；42901→退避等
    throw Object.assign(new Error(body.message), { code: body.code, data: body.data, http: res.status });
  }
  return body.data;
}
```

---

## 4. 演示账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| `admin` | `admin123` | 管理端联调首选 |
| `user` | `user123` | 普通用户 |
| `cashier1` | `cashier123` | 出纳 |
| `accountant1` | `account123` | 会计（与出纳 SSD 互斥） |
| `dual1` | `dual123` | 登录须显式传 `active_roles`（DSD） |

账号 `profile.status = 0` 时登录：HTTP 403 / `code=40302`（`user is disabled`）。

---

## 5. 前端如何「知道每个接口」

1. **人工 / AI 阅读**：`docs/API.md`（认证、用户、RBAC、统计、WS、§7 错误码）。  
2. **按权限码拆页面**：接口标了权限（如 `user:read`）；用登录返回的 `permissions` 控制菜单与按钮。  
3. **联调顺序**：health → captcha → public-key → login → `/api/me` → 业务列表 → logout。  
4. **机器可读**：`docs/openapi.yaml` 导入 Swagger / Apifox / Postman，或生成 TypeScript client（注意 200 schema = `data`）。

---

## 6. 常见业务错误码（速查）

| code | HTTP | 前端建议 |
|------|------|----------|
| 0 | 200 | 使用 `data` |
| 40002 | 400 | 验证码错：重新拉 captcha |
| 40003 | 400 | 密文无效：重拉公钥再加密 |
| 40101 | 401 | 账密错或未登录 |
| 40102 | 401 | access 无效：尝试 refresh 或重新登录 |
| 40103 | 401 | refresh 无效：清 token，回登录页 |
| 40301 | 403 | 无权限：看 `data.permission` |
| 40302 | 403 | 账号禁用 |
| 40902/40903 | 409 | SSD/DSD：调整角色选择 |
| 40906 | 409 | 用户名已存在 |
| 42901 | 429 | 限流：读 `data.retry_after` / `Retry-After` 再重试 |
| 50301 | 503 | 依赖不可用（如 DB） |

完整表与扩展方式见 `docs/API.md` §7。

---

## 7. 常见坑

| 现象 | 原因 |
|------|------|
| 登录 400 / 40002 | 验证码一次性；失败后必须重新拉 captcha |
| 登录 400 / 40003 | 没用 OAEP-SHA256，或公钥过期（**服务重启后公钥会变**） |
| 401 / 40102 | access 缺失、过期或已 logout |
| 401 / 40103 | refresh 无效、过期或已旋转作废 |
| 403 / 40301 + permission | 当前 `active_roles` 无该权限 |
| 403 / 40302 | 账号禁用 |
| 429 / 42901 | captcha 30/分、login 10/分、register 5/分、refresh 30/分 |
| 雪花 ID 精度丢失 | JSON 里当 number 解析了，应始终当 string |
| 用 HTTP 状态当业务码 | 业务码在 `code`（五位数），HTTP 只是映射 |
