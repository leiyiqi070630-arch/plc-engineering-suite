# PLC Engineering Suite

工业 PLC 编程智能套件：**桌面端（Electron）+ agent 引擎（Rust）+ 多品牌工具链桥接**。
面向西门子 TIA Portal、三菱 GX Works、汇川 InoProShop·CODESYS、汇川 AutoShop、威纶通 EasyBuilder
的真实工程操作，而不是通用代码生成。

> 目标：把「读懂需求 → 设计控制方案 → 生成可编译的块 → 导入 IDE → 编译回读 → 在线仿真验证」
> 这条链路端到端自动化，同时保证可回退、可审计、可人工接管。

---

## 能力范围

| 品牌 / 平台 | 工具链 | 语言与格式 |
| --- | --- | --- |
| Siemens TIA Portal V15–V21 | TIA Openness（`TiaOpennessBridge.exe`） | LAD / FBD / SCL / STL / DB / UDT、SIMATIC SD（`.s7dcl`+`.s7res`）、SimaticML XML、PLCSIM |
| Mitsubishi GX Works2 / GX Works3 | 原生桥 + CSV / IEC61131-10 XML | 梯形图列表 CSV、ST、结构化梯形、MC 3E 帧在线读写 |
| Inovance InoProShop（CODESYS 系） | resident file-IPC bridge（`route_cli.py`） | LAD 生成器、ST、GVL/DUT、EtherCAT/SoftMotion、仿真断言 |
| Inovance AutoShop（H5U） | `AutoShopTextBridge.exe` | H5U 原生工程、SDO、仿真、模块参数 |
| Weinview EasyBuilder Pro | PowerShell + C# 反射封装 | 画面/标签/配方/告警/趋势、编译与下载 |
| 通用 | 内置 Python 3.12 + linter | 三菱 FX2/FX3、S7-200 AWL/ST 规则校验 |

**可验证性优先**：每个写操作都返回可回读的证据（`compile.verdict`、`ladderBodyVerified`、
`readbackCounts`、`acceptanceVerdict`），编译通过从不被当作运行正确的证明。

---

## 仓库结构

```
plc-engineering-suite/
├─ desktop/                     Electron 桌面端
│  ├─ src/main/                 主进程：窗口、IPC、会话、工作区、引擎编排、更新
│  ├─ src/preload/              contextBridge：window.plcBridge / window.byok
│  ├─ src/renderer/             React 19 界面（会话、画布、设置）
│  ├─ resources/                路由矩阵、TIA 知识库、各品牌桥脚本
│  ├─ scripts/                  build / check / pack / 文档生成
│  └─ docs/                     架构、IPC 通道表、模型接入、引擎协议、存储格式
│
├─ engine/                      agent 引擎（Rust workspace）
│  ├─ Cargo.toml                workspace 定义
│  ├─ crates/
│  │  ├─ plccode-cli/           CLI、REPL、live turn、渲染、诊断、会话
│  │  ├─ runtime/               MCP server/stdio、会话运行时、超时与帧协议
│  │  ├─ tools/                 PLC 工具集（最大的 crate，见下）
│  │  ├─ api/                   模型 API 客户端（流式、上下文审计、多模态预算）
│  │  ├─ commands/              slash 命令
│  │  ├─ plugins/ telemetry/ win-proc-guard/
│  │  └─ plccode-engine/        引擎入口
│  ├─ spec/                     工具契约、内嵌知识库、能力清单
│  └─ docs/                     引擎设计、模块划分、工具目录、协议、知识库
│
└─ LICENSE
```

### `engine/crates/tools` 的四层结构

```
builtin_specs/     工具声明（名称、描述、schema、边界）
tia_openness_inputs/  入参校验与规范化
tia_openness_tools/   实际执行（硬件、PLC 对象、HMI、LAD/SD/GRAPH、PLCSIM）
tool_dispatch/        工具名 → 实现的路由
```

外加 `agent_tools/`（多 agent 编排）、`document_read/`（PDF/Office 解析）、`web/`（检索）、
`mitsubishi_mc/`（MC 3E 帧）、`siemens_web_api/`（Siemens 在线 API）。

---

## 快速开始

### 桌面端

```bash
cd desktop
npm i                 # 安装依赖（含 Electron 43.3.0）
npm run build         # src → out
npm run check         # 语法 + 能力自检（不启动 GUI）
npm start
```

打包 Portable：

```bash
npm run pack
```

### 引擎

```bash
cd engine
cargo check           # 需要 Rust stable (x86_64-pc-windows-msvc)
cargo run -p plccode-engine -- --help
cargo run -p plccode-engine -- system-prompt      # 查看内置提示词
cargo run -p plccode-engine -- skills             # 列出内置技能
```

引擎与桌面端通过 **JSON-Lines over stdio** 通信，协议见 `engine/docs/04-bridge协议与CLI.md`。

---

## 模型接入

支持两类后端：

- **OpenAI 兼容**：填 `baseUrl` + `apiKey`，自动探测 `/v1/models` 与思考档位；
- **Anthropic 原生**：自动做协议互转（`tool_use`/`tool_result`、`thinking`、SSE 中继）。

配置在桌面端「自备模型」页完成，密钥用系统级加密存储（Windows 走 DPAPI），明文不落盘。
细节见 `desktop/docs/03-BYOK自备模型机制.md`。

---

## 文档索引

| 文档 | 内容 |
| --- | --- |
| `desktop/docs/01-架构总览.md` | 桌面端进程模型、启动顺序、工作区 staging、TIA 工具链 |
| `desktop/docs/02-IPC通道表.md` | 116 个 IPC 通道 + 121 个 preload API（自动生成） |
| `desktop/docs/03-BYOK自备模型机制.md` | 本地代理、密钥加密、协议互转、思考档位映射 |
| `desktop/docs/04-引擎与工具链协议.md` | 引擎调用契约、execute_tool、.NET 桥、MCP |
| `desktop/docs/05-数据与存储格式.md` | 会话 jsonl、工作区、画布、设置 |
| `engine/docs/01-引擎设计与版本.md` | 引擎定位、CLI 能力、crate 结构、技术栈 |
| `engine/docs/02-模块划分.md` | 工具四层结构、各目录职责、如何新增工具 |
| `engine/docs/03-工具目录.md` | 286 个工具、32 份完整契约、权限模型 |
| `engine/docs/04-bridge协议与CLI.md` | JSON-Lines 协议、命令集、提示词结构、内置 agent |
| `engine/docs/05-知识与语料库.md` | 内嵌知识库结构、工程产物样例 |

---

## 设计原则

1. **不直接改用户的工程**：所有生成先落到 staging 影子副本，用户确认后才逐个提升到真实目录，
   且提升前做漂移检测（真实文件是否被外部工具改过）。
2. **证据驱动**：每个工具返回结构化回执，验收字段明确区分「导入成功」「编译通过」「结构回读正确」
   「运行行为正确」四档，不混用。
3. **失败可解释**：错误码命名到语义（`object_delete_blocked_by_online_session` →
   `data.requiredAction`），并给出可直接执行的补救动作。
4. **边界显式**：不支持的能力明确拒绝（例如 CODESYS 线不支持 SET/RESET 线圈、MOVE box），
   而不是生成"看起来对"的东西。

---

## 许可

MIT，见 [LICENSE](LICENSE)。
