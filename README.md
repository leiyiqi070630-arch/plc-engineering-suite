# PLC Engineering Suite

面向工业现场的 PLC 工程自动化套件：**桌面端（Electron）+ agent 引擎（Rust）+ 多品牌工具链接口**。
目标不是"生成代码"，而是把「读需求 → 定方案 → 出可编译的块 → 进 IDE → 编译回读 → 仿真验证」
这条链路跑通，并且每一步都留下可复核的证据。

> 设计前提：PLC 工程里最贵的不是写代码，是**改错**。所以整套系统围绕"可回退、可审计、可人工映射"设计，
> 自动化到什么程度由证据决定，不由模型自信度决定。

---

## 一、能力范围

| 品牌 / 平台 | 接口层 | 语言与格式 |
| --- | --- | --- |
| Siemens TIA Portal V15–V21 | Openness 桥 | LAD / FBD / SCL / STL / DB / UDT、SIMATIC SD（`.s7dcl`+`.s7res`）、SimaticML XML、PLCSIM |
| Mitsubishi GX Works2 / GX Works3 | 原生桥 + CSV / IEC 61131-10 XML | 梯形图列表 CSV、ST、结构化梯形、MC 3E 帧在线读写 |
| Inovance InoProShop（CODESYS 系） | 常驻 file-IPC 桥 | LAD 生成器、ST、GVL/DUT、EtherCAT / SoftMotion、仿真断言 |
| Inovance AutoShop（H5U） | 文本桥 | H5U 原生工程、SDO、仿真、模块参数 |
| Weinview EasyBuilder Pro | PowerShell + C# 反射封装 | 画面 / 标签 / 配方 / 告警 / 趋势、编译与下载 |
| 工业协议 | 原生协议层 | Beckhoff ADS、EtherNet/IP（CIP）、OPC UA 客户端与服务端 |
| 电气设计 | 内置电气工作台 | 原理图绘制、PDF / PNG 导出 |
| 代码质量 | 内置 Python 3.12 + linter | 三菱 FX2/FX3、S7-200 AWL/ST 规则校验 |

**四档验收**，任何一档都不能替代表述更高的那一档：

```
imported  →  compiled  →  structure readback  →  runtime behaviour
导入成功      编译通过        回读结构正确            运行行为正确
```

工具回执里对应 `compile.verdict`、`ladderBodyVerified`、`readbackCounts`、`acceptanceVerdict` 等字段。
`compile.verdict=passed` 永远不等于"程序对"。

---

## 二、架构

```
┌──────────────────── 桌面端（Electron 43 / React 19）────────────────────┐
│  会话 · 画布（代码/表格/电气图/HMI 预览）· 工作区治理 · 模型接入          │
│  116→169 个 IPC 通道，contextBridge 暴露 window.plcBridge                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ JSON-Lines over stdio
┌───────────────────────────────▼─────────────────────────────────────────┐
│  agent 引擎（Rust workspace）                                            │
│  plceng-cli · runtime · tools(310) · api · commands · plugins           │
│  工具四层：builtin_specs → inputs → tools → dispatch                     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ 子进程 / IPC / 脚本
┌───────────────────────────────▼─────────────────────────────────────────┐
│  执行层：Openness 桥 · GX 桥 · CODESYS 桥 · 电气工具宿主 · Python linter  │
└─────────────────────────────────────────────────────────────────────────┘
```

桌面端不实现 PLC 逻辑，只做编排与治理；引擎不碰工程文件，只构造参数、判读回执。

### 目录

```
plc-engineering-suite/
├─ desktop/                     Electron 桌面端
│  ├─ src/main/                 窗口、IPC、会话、工作区、引擎编排、更新
│  ├─ src/preload/              contextBridge：window.plcBridge / window.modelGateway
│  ├─ src/renderer/             React 19 界面 + 主题层
│  ├─ resources/                路由矩阵、TIA 知识库、各品牌桥脚本
│  ├─ scripts/                  build / check / pack / 文档生成
│  └─ docs/                     架构、IPC、模型接入、引擎协议、存储、版本设计
│
├─ engine/                      Rust workspace
│  ├─ crates/
│  │  ├─ plceng-cli/           CLI、REPL、live turn、渲染、诊断、会话
│  │  ├─ runtime/               MCP server/stdio、会话运行时、帧协议
│  │  ├─ tools/                 PLC 工具集（310 模块）
│  │  ├─ api/                   模型客户端：流式、上下文审计、多模态预算
│  │  └─ commands/ plugins/ telemetry/ win-proc-guard/ plceng-engine/
│  ├─ spec/                     工具契约（32 份）
│  └─ docs/                     引擎设计、模块划分、工具目录、协议
│
├─ model-gateway/               本地模型网关（协议互转、密钥保护）
└─ LICENSE
```

---

## 三、下载

到 **Releases** 页选择构建：

| 构建 | 说明 |
| --- | --- |
| `PLC-Engineering-Suite-2.1.20-win32-x64.zip` | 当前版本：工业协议层、电气工作台、表格、会话检查点 |
| `PLC-Engineering-Suite-2.1.13-win32-x64.zip` | 早期版本：核心 PLC 工具链与主题层 |

解压后运行 `PLC Engineering Suite.exe`，无需安装。

| 项 | 值 |
| --- | --- |
| 平台 | Windows 10 / 11 x64 |
| 运行时 | Electron 43.3.0（内置） |
| 配置目录 | `<解压目录>\data\runtime\` |
| 模型 | 见下节；放 `data\runtime\model-provider.seed.json` 即生效 |

> 未签名构建，SmartScreen 可能提示「未知发布者」，选择「更多信息 → 仍要运行」。

---

## 四、模型接入

系统不依赖第三方账号体系：模型端点由使用者自己指定，网关负责协议转换与密钥保护。
首次启动前放一个种子文件即可：

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

- `protocol`：`auto` / `openai` / `anthropic`。选 Anthropic 时自动做 `tool_use` / `tool_result` /
  `thinking` 的双向映射，并把 SSE 实时翻译回 OpenAI 分片。
- 密钥用系统级加密（Windows DPAPI）落盘，明文不写配置文件。
- 写入位置 `<解压目录>\data\runtime\model-provider.json`，种子文件导入后自动删除。

细节：`desktop/docs/03-模型接入机制.md`、`model-gateway/README.md`。

---

## 五、设计取舍

| 问题 | 取舍 | 理由 |
| --- | --- | --- |
| AI 能不能直接改用户的工程 | 不能，先落影子副本 | 一次误写可能让整台设备行为改变 |
| 编译通过算不算完成 | 不算 | 空壳块、未被任务调用的 POU 同样能编译通过 |
| 不支持的能力怎么办 | 明确拒绝，不降级替代 | "看起来对"的 LAD 比没生成更危险 |
| 工具失败怎么处理 | 返回结构化错误码 + 补救动作 | 让调用方能自动收敛，而不是猜 |
| 多品牌差异放哪 | 收敛在 dispatch 层 | 新增厂商不动既有工具 |
| 会话状态 | 落盘 + 检查点 | 长任务要能中断续做，且能回滚 |

---

## 六、界面

界面以「主题层」方式定制，不改动打包后的渲染进程 bundle：

| 文件 | 作用 |
| --- | --- |
| `src/renderer/theme.css` | 覆盖设计令牌（颜色 / 圆角 / 动效），暗色与亮色两套 |
| `src/renderer/index.html` | 启动画面（纯 CSS 淡出）、主题色、首帧背景 |
| `src/main/index.js` | 窗口背景与标题栏配色跟随主题 |

取向：三层表面递进、单一强调色、动效 140–200 ms、尊重 `prefers-reduced-motion`、
`:focus-visible` 统一焦点环。

---

## 七、文档

| 文档 | 内容 |
| --- | --- |
| `desktop/docs/01-架构总览.md` | 进程模型、启动顺序、引擎编排、工作区 staging、TIA 工具链、多品牌桥 |
| `desktop/docs/02-IPC通道表.md` | 全部 IPC 通道与 preload 方法（由源码生成） |
| `desktop/docs/03-模型接入机制.md` | 本地网关、密钥保护、协议互转、思考档位映射 |
| `desktop/docs/04-引擎与工具链协议.md` | 引擎调用契约、工具执行器、.NET 桥、MCP |
| `desktop/docs/05-数据与存储格式.md` | 会话 jsonl、工作区、画布、设置 |
| `desktop/docs/07-2.1.20-架构设计.md` | 工业协议层、电气工作台、表格、会话检查点的设计取舍 |
| `engine/docs/01-引擎设计与版本.md` | 引擎定位、CLI、crate 结构、技术栈 |
| `engine/docs/02-模块划分.md` | 工具四层结构、目录职责、新增工具流程 |
| `engine/docs/03-工具目录.md` | 32 个工具、契约格式、权限模型 |
| `engine/docs/04-bridge协议与CLI.md` | JSON-Lines 协议、命令集、提示词结构 |

---

## 八、许可

MIT，见 [LICENSE](LICENSE)。
