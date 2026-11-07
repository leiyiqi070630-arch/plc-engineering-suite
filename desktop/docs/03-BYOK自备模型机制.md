# 03 · BYOK（自备模型）机制

这个发行版叫 `BYOK`（Bring Your Own Key），本质是**把商业账号/订阅体系整段旁路掉，改成本地代理转发到用户自己的
模型服务**。全部改动集中在 4 个未混淆的 `.cjs` 文件里，是可读的原始源码，不含混淆。

## 1. 本地代理（`byok-main.cjs`）

主进程启动时在 `127.0.0.1:0`（随机端口）起一个 HTTP 服务，`base = http://127.0.0.1:<port>`：

```
渲染进程/引擎  ──►  http://127.0.0.1:<port>/v1/chat/completions  ──►  用户自备服务
                     （Bearer <每次启动随机 32 字节 hex>）              （OpenAI 兼容 / Anthropic）
```

要点：

| 机制 | 实现 |
| --- | --- |
| 进程内鉴权 | `localToken = crypto.randomBytes(32).toString('hex')`，每次启动重建；请求头必须 `Authorization: Bearer <token>`，否则 401 |
| 端点白名单 | 只允许 `GET /v1/models`、`GET /api/models`、`POST /v1/chat/completions`，其余 404 |
| 模型 ID 归一 | `modelId()` 去掉 `openai/` 前缀；请求里的模型不在 `models` 列表内则回落 `defaultModel` |
| 内置标题模型路由 | 引擎会额外请求一个「标题模型」，这里统一改走用户默认模型，避免请求到不存在的厂商槽位 |
| 超时 | 180s `AbortController`；`response.on('close')` 联动 abort |
| 请求体上限 | 32 MB |
| 鉴权校验 | `trusted(event)`：调用方 frame URL 必须以 `file:` 开头且包含 `/app.asar/out/renderer/index.html`，否则抛「不受信任的设置窗口」 |

## 2. 配置的校验与持久化

`validate(input, previous, requireModel)` 的硬规则（改配置时最容易踩的几条）：

- 换 `baseUrl` 必须重新填 Key，除非勾了 `clearKey`（`无需密钥`）—— 防止把 A 服务的 Key 发到 B 服务。
- `maxTokens` 夹在 `256 … 131072`，默认 `8192`。
- `apiKey` 不得含 `\r\n\0`，长度 ≤ 8192；`models` 去重、上限 2000。
- `protocol` ∈ `auto|openai|anthropic`；`auto` 在保存时落为 `openai`。
- 每个模型的能力元数据（vision / contextLength / reasoningEfforts / thinkingKind …）由
  `byok-model-catalog.json` + 本地缓存 + 已保存值**三层合并**。

`persist()`：明文 `apiKey` 永不落盘，改写为 `keyProtected = safeStorage.encryptString(apiKey).base64`
（Windows 下即 DPAPI），文件权限 `0o600`，写临时文件后 `renameSync` 原子替换。

存储位置：`<root>/data/runtime/byok-provider.json`，其中
`root = path.resolve(process.resourcesPath, '..', '..')`，同时把 `app.setPath('userData', <root>/data/chromium)`。

## 3. 协议适配（`provider-protocol.cjs`）

`requestFor(config, body, effort)` 把引擎发来的 OpenAI 风格请求转成目标协议：

- **OpenAI 兼容**：原样直发 `baseUrl + /chat/completions`，按模型元数据夹 `max_tokens` / `max_completion_tokens`。
- **Anthropic**：`anthropicRequest()` 做完整双向映射 ——
  `system`/`developer` → 顶层 `system`；`tool` 角色 → `user` + `tool_result`；
  `tool_calls` → `tool_use` 内容块；`tools[].function.parameters` → `input_schema`；
  `stop` → `stop_sequences`；`tool_choice` 四态映射；相邻同角色消息合并。
- **思考强度**：`applyEffort()` 只在探测结果 `status === 'reported'` 时下发，且用 `effortMap` 精确翻译；
  代码里明确写了「Never send a guessed level」，避免猜错参数被服务端拒。
  Anthropic 侧走 `output_config.effort` + `thinking: {type:'adaptive'}`。
- **流式中继**：`relayAnthropic()` 把 Anthropic SSE（`content_block_delta` / `input_json_delta` /
  `message_delta`）实时翻译回 OpenAI `chat.completion.chunk`，含 `reasoning_content` 与
  `tool_calls[].function.arguments` 增量拼接，末尾补 `data: [DONE]`。

## 4. 账号体系旁路

`register()` 里把这一串通道全部 `removeHandler` 后重挂成固定失败：

```
account:login / logout / rechargeQr / subscriptionQr / subscriptionActivate
account:orderStatus / submitFeedback / listFeedback
```

返回 `{ ok:false, error:'此副本使用自备模型，不提供账户、订阅或充值服务。' }`。

同时 `compatState()` 伪造一个「已登录」状态喂给旧壳子的工作区门禁：

```js
{ isLoggedIn: true, serverUrl: base, token: localToken, name: '自备模型',
  tokenBalance: 0, balance: 0, usageTokens: 0, /* …全部计费字段清零 */
  billing: null, subscription: null, subscriptionPlans: [] }
```

代码注释写得很直白：这个布尔只表示**本地就绪**，不代表人、登录、订阅或厂商授权，且永不写入 `account.json`。

引擎侧拿到的凭据是 `OPENAI_API_KEY=<localToken>` + `OPENAI_BASE_URL=http://127.0.0.1:<port>/v1`，
于是引擎以为自己在调厂商 API，实际打到本地代理。

## 5. 一键识别模型（`provider-discovery.cjs`）

`discover(value, {fetcher, catalog})`：依次尝试协议/端点的组合（`/v1/models`、`/models` 等），
拿到模型清单后与 `catalog` 比对，产出每个模型的 `discovery` 记录：

- `status: 'catalog'` → 来自内置目录，思考档位按 low/medium/high/max 的通用四档；
- `status: 'reported'` → 服务端自报，用 `effortMap` 精确映射，`adaptive` 决定是否开自适应思考。

失败时 `testConnection()` 会把错误信息里的 API Key 替换成 `[已隐藏]` 再抛出，避免密钥进日志/UI。

## 6. 想做自己的改造，改哪里

| 目标 | 位置 |
| --- | --- |
| 换成自己的供应商 / 加签名头 | `provider-protocol.cjs` 的 `requestFor()` |
| 改模型能力表 | `byok-model-catalog.json` |
| 改端点探测顺序 | `provider-discovery.cjs` 的 `PROTOCOLS` 与 `discover()` |
| 改配置界面校验文案 | `byok-main.cjs` 的 `validate()` |
| 彻底去掉本地代理直连厂商 | 删 `byok-main.cjs`，改 `EngineBridge.spawnProcess()` 里的 `OPENAI_BASE_URL` 注入 |
