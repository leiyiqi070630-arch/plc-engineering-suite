//! CLI 前端入口。
//!
//! 参数解析、渲染与会话命令分布在各子模块；执行委托给引擎 crate。

pub mod agent_consent;
pub mod bridge;
pub mod cli_args;
pub mod cli_errors;
pub mod cli_events;
pub mod cli_help;
pub mod cli_output;
pub mod cli_permissions;
pub mod cli_reports;
pub mod cli_resume;
pub mod cli_runtime;
pub mod input;
pub mod live_cli;
pub mod render;
pub mod runtime_mcp;
pub mod session_store;
pub mod status_diagnostics;

fn main() {
    std::process::exit(plceng_engine::run());
}
