//! PLC Code 引擎入口 crate。
//!
//! 对外只暴露 [`run`]，由 `main.rs` 调用；内部按职责拆分到 `app`（命令分发与 bridge）
//! 与 `conversation` / `legacy` / `raw` / `v0`（会话与协议适配）模块。

pub mod app;
pub mod conversation;
pub mod legacy;
pub mod raw;
pub mod v0;

/// 进程入口，返回退出码。
pub fn run() -> i32 {
    app::run(std::env::args().collect())
}
