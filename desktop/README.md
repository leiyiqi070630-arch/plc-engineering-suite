# PLC Code Desktop

工业 PLC 编程智能套件的桌面端（Electron 43 / React 19）。
负责界面、会话、工作区治理、模型接入，以及把意图编排给引擎执行。

| 项 | 值 |
| --- | --- |
| 版本 | 2.1.13 |
| 运行时 | Electron 43.3.0（Chromium 150） |
| 主进程 | CommonJS，`out/main/index.js` |
| 渲染进程 | React 19 + Vite（预构建 bundle） |
| 依赖 | 见 `package.json`（codemirror / mermaid / katex / i18next） |

---

## 一、它做什么

```
┌──────────── renderer（React SPA）────────────┐
│ 会话列表 / 对话 / 画布（代码·表格·HMI 图）/ 设置 │
└───────────────┬──────────────────────────────┘
                │ contextBridge: window.plcBridge (121 方法)
┌───────────────▼──────── preload ─────────────┐
│ Channels 常量 + ipcRenderer 转发              │
└───────────────┬──────────────────────────────┘
                │ 116 个 IPC 通道
┌───────────────▼──────── main ────────────────┐
│ 窗口/崩溃守护 · EngineBridge × N · 会话存储    │
│ 工作区 staging · 画布读写 · TIA 诊断           │
│ MCP 测试 · 模型代理 · 更新与公告               │
└───────────────┬──────────────────────────────┘
                │ JSON-Lines over stdio
                ▼
        plccode-engine（Rust agent）
```

**核心设计**：桌面端不实现 PLC 逻辑，只做编排与治理。所有工程写操作先落到 staging 影子副本，
用户确认后才提升到真实目录，且提升前做漂移检测。

---

## 二、目录结构

```
desktop/
├─ package.json                 版本、依赖、脚本
├─ src/
│  ├─ main/
│  │  ├─ index.js               主进程：窗口/IPC/会话/工作区/引擎管理/TIA 诊断/更新
│  │  ├─ chunks/mcpClient-*.js  MCP 客户端（stdio/SSE/HTTP/ws + schema 校验）
│  │  ├─ mcpProxy.js            MCP stdio 代理
│  │  ├─ model-gateway.cjs          自备模型：本地 OpenAI 兼容代理 + 系统级加密存密钥
│  │  ├─ provider-discovery.cjs 端点与能力探测
│  │  ├─ provider-protocol.cjs  OpenAI ↔ Anthropic 协议互转与流式中继
│  │  └─ model-catalog.json 模型能力表
│  ├─ preload/index.js          contextBridge：window.plcBridge / window.modelGateway
│  └─ renderer/
│     ├─ index.html             CSP、字体预载、入口
│     └─ assets/                63 个 JS + CSS + 字体 + 插图
├─ resources/                   路由矩阵、TIA 知识库、各品牌桥脚本
├─ scripts/                     build / check / obfuscate / gen-ipc-doc
├─ docs/                        架构、IPC、模型接入、引擎协议、存储
└─ electron-builder.yml         Portable 打包配置
```

---

## 三、快速开始

```bash
npm i                 # 安装依赖（含 Electron 43.3.0）
npm run build         # src → out
npm run check         # 语法 + 能力自检（不启动 GUI）
npm start             # 启动
npm run pack          # 打 Portable 包
```

自检输出应类似：

```
syntax: 70/70 ok
OK   main: ipcMain.handle 注册数: 98 (expect >= 80)
OK   main: EngineBridge 类: true
OK   main: 模型网关入口: true
OK   preload: contextBridge: true
OK   renderer: React 标记: true
OK   main: 残留混淆调用: 0
```

> 若终端里存在 `ELECTRON_RUN_AS_NODE=1`，Electron 会退化成纯 Node 并报
> `Cannot find module 'electron'` —— 先 `Remove-Item Env:\ELECTRON_RUN_AS_NODE`。

---

## 四、开发态接引擎

主进程按 `process.resourcesPath` 定位引擎；开发态用环境变量指定即可：

```powershell
$env:PLC_CODE_ENGINE_PATH              = "<...>\plccode-engine.exe"
$env:PLC_CODE_TIA_OPENNESS_BRIDGE_EXE  = "<...>\TiaOpennessBridge.exe"
& "<electron>\electron.exe" . --no-sandbox
```

正常日志：

```
[main] engine resolved: path=...\plccode-engine.exe packaged=false bridgeExe=...\TiaOpennessBridge.exe
[main] credential injection: hasToken=true tokenTail=... server=http://127.0.0.1:<port>
[engine stderr] [knowledge] source=embedded files=771 bytes=15710204
[engine stderr] windows-computer-use MCP server 0.1.3 ready
```

未打包运行时，主进程走 `findRepoRoot()` 分支（找 `rust/Cargo.toml`）来定位 Computer Use 组件；
仓库里已提供 `rust/Cargo.toml` 与 `tools/windows-computer-use/`，因此开箱可用。

---

## 五、模型接入

- **OpenAI 兼容**：填 `baseUrl` + `apiKey`，自动探测 `/v1/models` 与思考档位；
- **Anthropic 原生**：自动互转 `tool_use` / `tool_result` / `thinking`，SSE 实时中继。

密钥用 `safeStorage`（Windows DPAPI）加密后落盘，明文不进配置文件；本地代理仅监听 `127.0.0.1`，
用每次启动随机生成的 32 字节 token 做进程内鉴权。

细节：`docs/03-本地网关自备模型机制.md`。

---

## 六、文档

| 文档 | 内容 |
| --- | --- |
| `docs/01-架构总览.md` | 进程模型、启动顺序、EngineBridge、工作区 staging、TIA 工具链、多品牌桥 |
| `docs/02-IPC通道表.md` | 116 个通道 + 121 个 preload 方法（由源码生成） |
| `docs/03-本地网关自备模型机制.md` | 本地代理、密钥加密、协议互转、思考档位映射 |
| `docs/04-引擎与工具链协议.md` | 引擎调用契约、execute_tool、.NET 桥、MCP |
| `docs/05-数据与存储格式.md` | 会话 jsonl、工作区、画布、设置 |

---

## 七、许可

MIT。
