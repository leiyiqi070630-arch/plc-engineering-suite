# 04 · bridge 协议与 CLI

引擎有两种使用方式：**CLI 交互**（`plccode` 本体）和 **bridge 模式**（桌面端用的 JSON-Lines 协议）。
主程序只走 bridge；CLI 是本工程拿自描述产物的入口。

## 1. CLI 命令集（`--help` 实测）

```text
plccode [--model MODEL] [--allowedTools TOOL[,TOOL...]]           交互 REPL
plccode [--model MODEL] [--output-format text|json] prompt TEXT    单次提问后退出
plccode --resume [SESSION.jsonl|session-id|latest] [/status] ...   检查/维护已存会话
plccode help | version | status | sandbox | doctor
plccode acp [serve]                     ACP/Zed 集成（当前不支持）
plccode dump-manifests [--manifests-dir PATH]
plccode bootstrap-plan
plccode agents                          列出内置 agent
plccode mcp                             列出 MCP 服务器
plccode skills                          列出技能
plccode system-prompt [--cwd PATH] [--date YYYY-MM-DD]   ★ 直接导出系统提示词
plccode init                            生成 CLAUDE.md
plccode export [PATH] [--session SESSION] [--output PATH]
```

关键 flag：

```
--model MODEL                     覆盖模型
--output-format text|json          非交互输出格式
--compact                          只打最终回复
--permission-mode read-only|workspace-write|danger-full-access
--dangerously-skip-permissions
--allowedTools TOOLS               限制可用工具（可重复/逗号分隔）
```

`plccode system-prompt` 是本次工程梳理最重要的一条命令：**不需要凭据、不做网络请求，直接把内置提示词打印出来**。
内置提示词可用 `plccode-engine system-prompt` 导出。

## 2. bridge 模式（桌面端协议）

### 2.1 启动

```bash
plccode-engine.exe [--model M] [--permission-mode P] [--reasoning-effort E] bridge
```

- 子进程 `stdio: pipe`，`windowsHide: true`。
- 60 秒内必须收到 `{"type":"ready"}`，否则桌面端判 `ENGINE_READY_TIMEOUT` 并 kill。
- 无凭据时直接退出：
  ```text
  [error-kind: missing_credentials]
  error: missing Anthropic credentials; export ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY ...
  ```
  由主进程改注入 `OPENAI_API_KEY` + `OPENAI_BASE_URL`（指向本地 127.0.0.1 代理），
  引擎按 OpenAI 兼容端点使用。

### 2.2 消息（一行一条 JSON）

**上行（引擎 → 桌面端）**

| type | 载荷 | 含义 |
| --- | --- | --- |
| `ready` | `session_id` | 启动完成，可接收 turn |
| `turn` | 流式内容块 / 工具调用 / usage | 一轮对话的增量 |
| `event` | `event: "question"` / `"question_cleared"` | 需要用户回答 / 回答已清 |
| `shutdown` | — | 收到 shutdown 后的确认 |

**下行（桌面端 → 引擎）**

| 形态 | 示例 | 说明 |
| --- | --- | --- |
| turn 对象 | `{id, prompt, input_kind, presentation?}` | 用户输入；`presentation` 会被主进程剥离后单独处理 |
| 控制命令 | `{"command":"cancel","scope":"all"}` | 中止当前轮 |
| 控制命令 | `{"command":"capabilities"}` | 请求能力清单 |
| 控制命令 | `{"command":"shutdown"}` | 优雅退出（主进程等 2 s 后 kill） |

解析失败不会崩：`JSON.parse` 异常走 `malformed` 分支，由主进程上报。

### 2.3 环境变量契约（主进程注入）

| 变量 | 作用 |
| --- | --- |
| `PLC_CODE_RUNTIME_HOME` | 运行时根（会话、设置、草稿） |
| `PLC_CODE_SESSION_WORKSPACE_ROOT` | 会话工作区根（与 cwd 不同时注入） |
| `PLC_CODE_BRIDGE_RESUME_SESSION` | 续接指定会话 |
| `PLC_CODE_DESKTOP_MCP_CONFIG` | 桌面 MCP 配置（由 `mcpProxy.js` 承载） |
| `PLC_CODE_TIA_OPENNESS_BRIDGE_EXE` | TIA Openness 桥路径 |
| `PLC_CODE_AGENT_MODEL` | 当前模型 |
| `PLC_CODE_VISION_MODELS` / `PLC_CODE_VISION_MODEL` | 视觉模型清单/默认 |
| `PLC_CODE_AVAILABLE_MODELS` | 可选模型清单 |
| `PLC_CODE_THINKING_TIERS` / `_KINDS` / `_FIELDS` | 思考档位与字段协议 |
| `PLC_CODE_HTTP_PROXY` | 出网代理 |
| `PLC_CODE_ENABLE_PLC_PROMPT_EXTENSION` | 启用 PLC 提示词扩展（本产品置 1） |
| `PLC_CODE_SKIP_PROJECT_INSTRUCTIONS` | 跳过项目 CLAUDE.md 注入 |
| `CLAUDE_CONFIG_DIR` / `CLAUDE_CODE_AUTO_COMPACT_INPUT_TOKENS` | 基线兼容变量 |
| `OPENAI_API_KEY` + `OPENAI_BASE_URL` | 本地网关路径（本地代理 + 一次性 token） |
| `ANTHROPIC_*` | 原生 Anthropic 路径（会主动删除） |

注意：主进程在 spawn 前会 `delete env.ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL`，
这正是为什么纯 CLI 方式需要自己 `export ANTHROPIC_AUTH_TOKEN` 才能进 bridge。

## 3. 提示词结构

`system-prompt.txt` 里有一个明确的分段标记：

```
__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__
```

- **标记之前（内置）**：`# System`、`# Doing tasks`、`# Executing actions with care`、`# Sub-agent teams`，
  以及开头的身份定义：
  > You are PLC Code — a seasoned, expert PLC and automation engineer. … You design, generate, inspect,
  > verify, diagnose, and repair real industrial-control programs. Start producing the requested result
  > immediately from route-appropriate knowledge; compile/import/lint and tool diagnostics are feedback
  > for fast repair, not prerequisites for beginning.
- **标记之后（运行时拼装）**：`# Environment context`、`# Project context`、`# Workspace instructions`、
  `# Runtime config`、`# Agents`。这一段随 cwd 变化 —— 本工程采集时指向 `D:\codex工作目录`，
  因此包含该目录的 `CLAUDE.md` / `AGENTS.md` 内容，**不代表引擎内置**。

## 4. 内置 agent 与技能（`plccode agents` / `plccode skills` 实测）

7 个 agent（全部 Read-only 语义）：

| agent | 职责 |
| --- | --- |
| `plc-architect` | 整体程序块图、IO 归属、状态结构、数据策略评审 |
| `plc-logic-review` | 已完成代码的语义审计（状态/时序/复位/故障/编译器看不见的缺陷） |
| `plc-red-team` | 对抗式审查（空壳块、缺功能、不安全偷懒、从众、无证据断言） |
| `plc-research-evidence` | 单一未决事实取证核验（引脚、版本行为、寻址、标准条款） |
| `plc-safety-reviewer` | 失效安全、重启抑制、互锁、锁存、认证安全边界 |
| `plc-synthesizer` | 多份子报告收敛为一个可执行设计 |
| `plc-technical-reviewer` | 对 route/指令/数据类型/实例/生成器/导入/编译约束做可行性审计 |

11 个技能：`hmi-design`、`mermaid-diagrams`、`mitsubishi-fx`、`multi-agent-patterns`、
`plc-design-team`、`plc-program-design`、`plc-sim-animation`、`review-team`、
`siemens-s7-200-awl`、`tia-portal`、`windows-computer-use`。

## 5. 工具执行链

```
agent 决定调用工具
   → tool_dispatch/<vendor>.rs 路由
   → tia_openness_tools/*.rs 组装参数、校验
   → spawn execute_tool.exe <command>（或 bridge IPC / python 脚本）
   → 解析 JSON 回执（含 oks/errors/验收字段）
   → 结果回灌模型，形成下一轮
```

`crates/runtime/src/mcp_server/frame.rs`、`mcp_stdio/timeout.rs` 说明引擎自身也能当 MCP 服务器
（供外部编辑器接入），与桌面端的 MCP 客户端是双向的。
