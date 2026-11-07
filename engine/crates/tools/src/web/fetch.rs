//! 模块骨架
//! 模块路径: crates\tools\src\web\fetch.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: AUTOSHOP_ROUTE_REQUIRED, INVALID_ARGUMENT, PLC_CODE_WEB_READER_BASE_URL, READ_REQUIRED, REQUEST_TOO_LARGE
//!
//! 契约线索（截断）:
//!   REQUEST_TOO_LARGE
//!   READ_REQUIRED: inspect this exact bound Trace in this engine session before configuration
//!   INVALID_ARGUMENT: provide changes or addVariables
//!   READ_REQUIRED: axis hash does not match latest read
//!   READ_REQUIRED: read each exact bound block in this session before writing
//!   AUTOSHOP_ROUTE_REQUIRED: bind an AutoShop LiteST workspace first
//!   duration_ms À" exceeds maximum allowed sleep of À
//!   crates\tools\src\assistant_tools\sleep.rs
//!   crates\tools\src\web\fetch.rs
//!   </title>X3?C
//!   PLC_CODE_WEB_READER_BASE_URL

// TODO: 依上列契约实现 `fetch` 模块。
