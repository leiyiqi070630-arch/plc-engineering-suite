# PLC Engineering Suite Engine

工业 PLC agent 引擎：把自然语言需求变成**可编译、可回读、可运行验证**的 PLC 工程产物。

- 入口：`plceng-engine`（CLI / REPL / bridge 三种模式）
- 语言：Rust（workspace，edition 2021，target `x86_64-pc-windows-msvc`）
- 通信：JSON-Lines over stdio（与桌面端）、MCP（与外部编辑器）
- 版本：0.1.0

## 1. 三种使用形态

```bash
plceng-engine                                  # 交互 REPL
plceng-engine --output-format json prompt "…"  # 单次提问
plceng-engine bridge                           # 桌面端用的长驻 JSON-Lines 会话
```

其余只读命令：`--help`、`version`、`status`、`sandbox`、`doctor`、`agents`、`mcp`、`skills`、
`system-prompt`、`dump-manifests`、`export`。

`system-prompt` 可直接导出引擎内置提示词（含 `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` 分段标记），
用于核对行为或做提示词回归。

## 2. crate 结构

| crate | 职责 |
| --- | --- |
| `plceng-engine` | 入口、参数分发、生命周期 |
| `plceng-cli` | REPL、live turn、渲染、状态诊断、会话存储、bridge 客户端 |
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

## 5. 知识与语料资产

工具契约位于 `spec/tool_contracts/`，包含 32 份单工具 JSON、`tools_index.json` 与权限索引。它们是当前公开源码树中可直接核对的机器可读工具接口。

**语料目录状态：** 旧版说明曾将 `spec/corpus/` 描述为 527 个文件 / 20 MB，并列出生成器案例、经验页面、技能、版本知识和 agent 定义；但当前 GitHub `main` 的已跟踪文件树中未检出该目录。因此，这些历史数量不能作为当前公开源码或发行包内容的保证。若某个本地构建或发行包提供外置语料，应以实际文件清单和运行时配置为准。

内置 agent 与技能的运行时清单应分别通过 `plceng-engine agents` 和 `plceng-engine skills` 查询，不要仅凭源码目录推断其已打包。

## 6. 构建

```bash
python scripts/check_tool_registry.py  # 契约、CLI 权限表与文档一致性检查
cargo check                     # 语法与依赖
cargo run -p plceng-engine -- --help
cargo build --release -p plceng-engine
```

发布产物需要同时携带：`execute_tool.exe`（工具执行器）、`TiaOpennessBridge.exe`（.NET Openness 桥）、
内置 Python 运行时（linter / RAG / codesys-bridge）。它们的调用契约见
`../desktop/docs/04-引擎与工具链协议.md`。

## 7. 文档

| 文档 | 内容 |
| --- | --- |
| `docs/01-引擎设计与版本.md` | 引擎定位、CLI、crate 结构、技术栈 |
| `docs/02-模块划分.md` | 工具四层结构、目录职责、新增工具流程 |
| `docs/03-工具目录.md` | 32 个已注册工具、契约权限与参数 |
| `docs/04-bridge协议与CLI.md` | 协议、命令集、提示词结构、内置 agent |
| `scripts/check_tool_registry.py` | 检查单工具契约、CLI 注册表和 Markdown 权限是否一致 |
