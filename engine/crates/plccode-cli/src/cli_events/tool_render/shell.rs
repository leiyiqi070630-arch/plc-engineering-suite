//! 模块骨架
//! 模块路径: crates\plccode-cli\src\cli_events\tool_render\shell.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: command
//!
//! 契约线索（截断）:
//!   - Use `AgentBatch.tasks` for independent lanes and `AgentBatch.pipeline` when each item must pass through ordered stages such as investigate -> implement -> review. Concurrency is 
//!   - Give each child a self-contained objective and a useful `output_schema`. Delegate outcomes, not tiny mechanical steps.
//!   - For any lane that must create a known set of JSON files, pass `artifact_contract` with the exact project, every caller-supplied `file_stem`, and real field/length quality gates. 
//!   - Keep team work in the background. Results are delivered automatically; never poll with Sleep/AgentGet. When results arrive, continue the parent workflow yourself: integrate findi
//!   - Continue a finished child with `AgentSendMessage` when it should revise or deepen its own work; preserve its context instead of spawning a duplicate.
//!   - Briefly tell the user which workstreams are active. PLC verification still requires real import, compile, readback, lint, or simulation evidence.
//!   Config load error
//!     Status           fail
//!     Summary          runtime config failed to load; reporting partial plugins view
//!     Details          Àb
//!     Hint             `plccode doctor` classifies config parse errors; fix the listed field and rerun
//!     Status           À
//!     Summary          À
//!   [48;5;236;38;5;255m $ À
//!   [38;5;245mbash
//!   backgroundTaskIdcrates\plccode-cli\src\cli_events\tool_render\shell.rs
//!    backgrounded (À
//!   write to string

// TODO: 依上列契约实现 `shell` 模块。
