//! 模块骨架
//! 模块路径: crates\plccode-cli\src\status_diagnostics\checks\auth.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   crates\plccode-cli\src\cli_permissions.rs
//!   6Warning: plccode is running from a very broad directory (À
//!   The agent can read and search everything under this path.
//!   Consider running from inside your project: cd /path/to/project && plccode
//!   Continue anyway? [y/N]: Aborted.
//!   crates\plccode-cli\src\cli_args\dispatch.rs
//!   unknown subcommand: À
//!   Did you mean
//!   Run `plccode --help` for the full list. If you meant to send a prompt literally, use `plccode prompt <text>`. empty prompt: provide a subcommand (run `plccode --help`) or a non-empty prompt
//!   `plccode permissions` is a slash command. Start `plccode` and run `/permissions` inside the REPL.
//!     Usage  /permissions [read-only|workspace-write|danger-full-access].unexpected extra arguments after `plccode diff`: À
//!   .unexpected extra arguments after `plccode config À
//!   'unexpected extra arguments after `plccode À
//!   Parallel work started: À
//!         error: À
//!   Results arrive automatically. Use send_message to guide or continue a child, or interrupt_agent to stop it.
//!   unsupported resumed slash commandANTHROPIC_API_KEYANTHROPIC_AUTH_TOKENabsentpresent
//!   Environment       api_key=À
//!    auth_token=À
//!   no supported auth env vars were foundsupported auth env vars are configuredAuthcrates\plccode-cli\src\status_diagnostics\checks\auth.rs
//!   auth_token_presentlegacy_saved_oauth_presentlegacy_saved_oauth_expires_atlegacy_refresh_token_present

// TODO: 依上列契约实现 `auth` 模块。
