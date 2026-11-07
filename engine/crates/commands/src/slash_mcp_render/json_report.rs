//! 模块骨架
//! 模块路径: crates\commands\src\slash_mcp_render\json_report.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: auth_server_metadata_url, okdegradedshowmcp, tool_call_timeout_ms, userprojectlocal
//!
//! 契约线索（截断）:
//!     Command           À
//!     Args              À
//!     Env keys          À
//!     Tool timeout      À
//!     URL               À
//!     Header keys       À
//!     Header helper     À
//!     OAuth             À
//!     SDK name          À
//!     Proxy id          À
//!     Working directory À
//!     Name              À
//!   userprojectlocal
//!     Scope             À
//!     Required          À
//!   stdiossehttpwssdkmanaged-proxy
//!     Transport         À
//!     Working directory À
//!     Result            server `À
//!   ` is not configured
//!     Configured servers À
//!     No MCP servers configured.
//!     Usage            /mcp [list|show <server>|help]  Direct CLI       plccode mcp [list|show <server>|help]  Sources          .plccode/settings.json, .plccode/settings.local.json
//!     Unexpected       À
//!   /mcp [list|show <server>|help]plccode mcp [list|show <server>|help].plccode/settings.json.plccode/settings.local.jsonunsupported_actionrequested_action+MCP

// TODO: 依上列契约实现 `json_report` 模块。
