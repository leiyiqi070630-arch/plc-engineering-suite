//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\mcp_management.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   Your parent agent id is ÀR. Before you finish, send your result to that agent with send_message({"agent_id":È
//!   ,"message":"<self-contained result>"}). The parent shares your workspace but does not automatically receive your transcript, tool output, or reasoning. Send earlier messages as wel
//!   Your durable agent id: À
//!   . Working directory: À
//!   . Permission ceiling: À
//!   Subagent depth limit reached (4)
//!   No active parent model; bind the model before starting a subagent
//!   Invalid agent id
//!   crates\tools\src\builtin_specs\mcp_management.rs
//!   mcp_servers_listList effective configured MCP servers, their config scope and executable transport status. Secrets are never returned: stdio env values and remote header values are

// TODO: 依上列契约实现 `mcp_management` 模块。
