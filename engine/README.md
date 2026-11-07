# PLC Code Engine

工业 PLC agent 引擎：把自然语言需求变成**可编译、可回读、可运行验证**的 PLC 工程产物。

- 入口：`plccode-engine`（CLI / REPL / bridge 三种模式）
- 语言：Rust（workspace，edition 2021，target `x86_64-pc-windows-msvc`）
- 通信：JSON-Lines over stdio（与桌面端）、MCP（与外部编辑器）
- 版本：0.1.0

## 1. 三种使用形态

```bash
plccode-engine                                  # 交互 REPL
plccode-engine --output-format json prompt "…"  # 单次提问
plccode-engine bridge                           # 桌面端用的长驻 JSON-Lines 会话
```

其余只读命令：`--help`、`version`、`status`、`sandbox`、`doctor`、`agents`、`mcp`、`skills`、
`system-prompt`、`dump-manifests`、`export`。

`system-prompt` 可直接导出引擎内置提示词（含 `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` 分段标记），
用于核对行为或做提示词回归。

## 2. crate 结构

| crate | 职责 |
| --- | --- |
| `plccode-engine` | 入口、参数分发、生命周期 |
| `plccode-cli` | REPL、live turn、渲染、状态诊断、会话存储、bridge 客户端 |
| `runtime` | 会话运行时、MCP server/stdio、帧协议、超时控制 |
| `tools` | **PLC 工具集**（四层结构见 `docs/02`） |
| `api` | 模型 API 客户端：流式解析、上下文审计、多模态附件预算 |
| `commands` | slash 命令（skills/commit/pr/issue/export…） |
| `plugins` | 插件装载 |
| `telemetry` | 事件与会话遥测 |
| `win-proc-guard` | Windows 进程守护（避免子进程泄漏） |

## 3. 工具集分层

```
builtin_specs/        工具声明：名称、描述、JSON Schema、能力边界
tia_openness_inputs/  入参校验与规范化（每个工具族一个）
tia_openness_tools/   实际执行：硬件、PLC 对象、HMI、LAD/SD/GRAPH、PLCSIM
tool_dispatch/        工具名 → 实现的路由
```

外加 `agent_tools/`（多 agent 编排）、`document_read/`（PDF/Office）、`web/`（检索）、
`mitsubishi_mc/`（MC 3E 帧）、`siemens_web_api/`（Siemens 在线 API）、`workflow/`（工作流存储）。

## 4. 工具契约

`spec/tool_contracts/` 里是 32 份生成器工具的完整契约（`name` / `description` / `inputSchema` /
`permission` / `contractHash`），可直接用于生成调用方或做升级比对。权限模型：

| 权限 | 含义 | 数量 |
| --- | --- | --- |
| `ReadOnly` | 只读，可安全批量调用 | 4 |
| `WorkspaceWrite` | 只改工作区（staging） | 13 |
| `DangerFullAccess` | 可写真实工程 / 操作 IDE（需确认） | 15 |

## 5. 内嵌知识库

`spec/corpus/`（527 个文件 / 20 MB）包含：

- `plc-generator-corpus/`：生成器用例与证据（`cases` / `evidence` / `artifacts`），
  其中 `artifacts` 是可直接导入 TIA 的 `.s7dcl`、HMI XML、PLCopen TC6；
- `plc-experience-corpus/`：实战页面样例；
- `skills/`：内置技能文本；
- `V16/` `V17/`：按版本 × CPU 家族的指令知识；
- `agents/`：7 个内置 agent 定义。

## 6. 构建

```bash
cargo check                     # 语法与依赖
cargo run -p plccode-engine -- --help
cargo build --release -p plccode-engine
```

发布产物需要同时携带：`execute_tool.exe`（工具执行器）、`TiaOpennessBridge.exe`（.NET Openness 桥）、
内置 Python 运行时（linter / RAG / codesys-bridge）。它们的调用契约见
`../desktop/docs/04-引擎与工具链协议.md`。

## 7. 文档

| 文档 | 内容 |
| --- | --- |
| `docs/01-引擎设计与版本.md` | 引擎定位、CLI、crate 结构、技术栈 |
| `docs/02-模块划分.md` | 工具四层结构、目录职责、新增工具流程 |
| `docs/03-工具目录.md` | 286 个工具、32 份契约、权限 |
| `docs/04-bridge协议与CLI.md` | 协议、命令集、提示词结构、内置 agent |
| `docs/05-知识与语料库.md` | 知识库结构与工程产物样例 |
