//! 模块骨架
//! 模块路径: crates\api\src\providers\openai_compat_error.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: completedresult, initialize, statebusy
//! 相关中文说明: 1 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   MCP stdio stream closed while reading headers
//!   MCP frame Content-Length À
//!    exceeds maximum À
//!   resources/read
//!   resources/list
//!   .cargo\registry\src\index.crates.io-1949cf8c6b5b557f\reqwest-0.12.28\src\async_impl\response.rs
//!   crates\api\src\providers\anthropic.rs
//!   apimessage_usagerequest_idtotal_tokensestimated_cost_usd
//!   crates\api\src\providers\openai_compat_stream.rs
//!   /v1/messages/count_tokens
//!   POST/v1/messages
//!   retry loop must capture an error
//!   /v1/messages
//!   crates\api\src\providers\openai_compat.rs
//!   provider returned an error
//!   content-type
//!   crates\api\src\providers\anthropic\stream.rs
//!   .crates\api\src\providers\openai_compat_error.rs
//!   crates\api\src\providers\anthropic\error.rs
//!   oldStringnewStringerrorcode
//!   inoproshop_framework_device_skeleton requires an absolute path under the disposable root!compiled tool schema is invalid: À
//!   compiled tool schema is missinginput must be a JSON objectcredentials must be a JSON objectusernamesetupInitialUsercanChangePasswordmustChangePasswordcredentialsrequestIdrequest_id
//!   inoproshop_batch requires a steps array
//!   inoproshop_batch step À
//!    preflight failed: À

// TODO: 依上列契约实现 `openai_compat_error` 模块。
