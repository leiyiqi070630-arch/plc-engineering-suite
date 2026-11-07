//! `src/lib.rs`
//!
//! TODO: 实现 `lib` 模块。

// ---- module declarations ----
pub mod agent_catalog;
pub mod bash;
pub mod compact;
pub mod config;
pub mod config_validate;
pub mod context_policy;
pub mod conversation;
pub mod file_ops;
pub mod hooks;
pub mod knowledge_excerpt;
pub mod lane_events;
pub mod lsp_client;
pub mod mcp;
pub mod mcp_server;
pub mod mcp_stdio;
pub mod mcp_stdio_process;
pub mod permissions;
pub mod plc_experience_context;
pub mod plccode_knowledge;
pub mod prompt;
pub mod route_metadata;
pub mod session;
pub mod summary_compression;
pub mod task_registry;
pub mod team_cron_registry;
pub mod worker_boot;
