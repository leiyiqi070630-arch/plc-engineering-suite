# 本地模型网关

引擎与模型供应商之间的转换层。对外只暴露一个 OpenAI 兼容端点，对内负责协议互转、
密钥保护与能力探测。

## 1. 职责

```
引擎（只发 OpenAI 兼容请求）
        │
        ▼
   model-gateway ──► OpenAI 兼容供应商
        └──────────► Anthropic 原生供应商
```

| 关注点 | 在这里解决 |
| --- | --- |
| 供应商差异 | 协议互转，引擎无感 |
| 密钥 | 只在主进程内存，落盘前加密 |
| 能力差异 | 探测模型清单与思考档位 |
| 资源约束 | 请求体上限、超时、并发流式中转 |

## 2. 文件

| 文件 | 作用 |
| --- | --- |
| `model-gateway.cjs` | HTTP 服务、路由、密钥存取、模型清单 |
| `provider-discovery.cjs` | 端点与能力探测 |
| `provider-protocol.cjs` | OpenAI ↔ Anthropic 互转、SSE 中继 |
| `model-catalog.json` | 内置模型能力表（上下文长度、视觉、思考档位） |
| `seed.example.json` | 配置模板 |
| `inject-model-gateway-2.1.20.py` | 把网关接入桌面端构建产物的脚本 |

## 3. 运行方式

网关由桌面端主进程加载，随应用启动：

```js
const gateway = require('./model-gateway.cjs');

// 启动 HTTP 服务（随机端口）
gateway.ready.then(() => console.log('gateway at', gateway.runtime));

// 注册 IPC 通道：model:get / model:save / model:test
gateway.register({ busy: () => false, changed: () => {} });

// 导入种子配置（存在则导入一次并删除）
gateway.initialize();
```

引擎侧只看到两个环境变量：

```
OPENAI_API_KEY=<一次性 token>
OPENAI_BASE_URL=http://127.0.0.1:<port>/v1
```

## 4. 接入一个已有构建产物

```bash
# 1) 解包 app.asar 到 <work>/full
# 2) 注入（IPC 入口 + 账号状态映射 + 外部端点收口）
python inject-model-gateway-2.1.20.py <work> <app.asar 路径>
# 3) 把 model-gateway.cjs / provider-*.cjs / model-catalog.json 放进 out/main/
# 4) 用 app 目录替代 app.asar（Electron 优先加载 asar，必须移除）
# 5) 首次运行前放置配置种子
```

注入脚本做的三件事：

| 步骤 | 目的 |
| --- | --- |
| IPC 入口 | 账号 / 工单类通道由本地网关统一应答 |
| `AccountStore.prototype.current` 覆盖 | 全应用读到的都是本地端点与一次性 token |
| `fetch` / `net.fetch` 收口 | 外部端点请求不出网 |

> 注入点是幂等的：重复执行不会叠加 handler；代码里对同名通道会先 `removeHandler`。

## 5. 配置

```json
{
  "name": "自备模型",
  "baseUrl": "https://api.example.com/v1",
  "defaultModel": "your-model-id",
  "models": ["your-model-id"],
  "maxTokens": 8192,
  "apiKey": "sk-your-key",
  "protocol": "auto"
}
```

放置位置：`<安装目录>\data\runtime\model-provider.seed.json`。

协议选择：

| `protocol` | 行为 |
| --- | --- |
| `openai` | 原样转发到 `{baseUrl}/chat/completions` |
| `anthropic` | 转成 `/messages`，并按消息体把流式响应翻回 OpenAI 分片 |
| `auto` | 保存时落为 `openai`；探测阶段会尝试识别 |

## 6. 安全约束

- 服务只监听 `127.0.0.1`，端口随机；
- 每次启动生成新的 32 字节 token，旧的立即失效；
- 只接受来自渲染主文档（`file:` 协议）的调用；
- 密钥用系统级加密存储（Windows DPAPI），读取失败即报错，不降级为明文；
- 错误信息中的密钥统一替换为 `[已隐藏]`。
