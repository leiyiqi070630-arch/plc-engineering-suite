//! 模块骨架
//! 模块路径: crates\plccode-cli\src\live_cli\session_commands.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: okexists, plugin, session_delete
//!
//! 契约线索（截断）:
//!   crates\plccode-cli\src\live_cli\render_helpers.rs
//!   statusconfig_load_error>Export
//!     Result           wrote transcript
//!     File             À
//!     Messages         À
//!   Unknown /session action 'À
//!   '. Use /session list, /session exists <session-id>, /session switch <session-id>, /session fork [branch-name], or /session delete <session-id> [--force].
//!   #Session deleted
//!     Deleted session  À
//!     File             À
//!   /delete: refusing to delete the active session 'ÀF'.
//!   Switch to another session first with /session switch <session-id>.
//!   Usage: /session delete <session-id> [--force]
//!   delete: cancelled.
//!   (unnamed)"Session forked
//!     Parent session   À
//!     Active session   À
//!     Branch           À
//!     File             À
//!     Messages         À
//!   $Session switched
//!     Active session   À
//!     File             À
//!     Messages         À
//!   Usage: /session switch <session-id>

// TODO: 依上列契约实现 `session_commands` 模块。
