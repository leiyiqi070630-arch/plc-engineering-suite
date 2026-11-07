//! 模块骨架
//! 模块路径: crates\plccode-cli\src\status_diagnostics\rendering\sandbox.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: event_report_schema, previous_session_id, serve_starts_daemontask_packet_schema, session_control_schema, unsupported_invocation_kindunsupported_acp_invocation
//!
//! 契约线索（截断）:
//!   serve_starts_daemontask_packet_schema
//!   session_control_schema
//!   event_report_schema
//!   stable_status_surfaceclaw acp [serve] --output-format json
//!   unsupported_invocation_kindunsupported_acp_invocation
//!   discoverability_trackingROADMAP #64a
//!   ROADMAP #76 / #3033 / #3004
//!   recommended_workflowsclaw prompt TEXT
//!     Status           unsupported (discoverability only)
//!     Exit code        0 for status queries; unsupported invocations exit 1
//!     Launch           `plccode acp serve` / `plccode --acp` / `plccode -acp` report status only; no editor daemon or JSON-RPC endpoint is available yet
//!     Today            use `plccode prompt`, the REPL, or `plccode doctor` for local verification
//!     Tracking         ROADMAP #76 / #3033 / #3004
//!     Message          À
//!   doctor found failing checksconfirmation requiredrerun with /clear --confirmclear: confirmation required; rerun with /clear --confirmLSession cleared
//!     Mode             resumed session reset
//!     Previous session À
//!     Backup           À"
//!     Resume previous  plccode --resume À
//!     New session      À
//!     Session file     À
//!   previous_session_id
//!   removed_messagescrates\plccode-cli\src\status_diagnostics\rendering\sandbox.rs
//!   requested_namespaceactive_namespacerequested_networkoffworkspace-onlyallow-listfilesystem_active, 

// TODO: 依上列契约实现 `sandbox` 模块。
