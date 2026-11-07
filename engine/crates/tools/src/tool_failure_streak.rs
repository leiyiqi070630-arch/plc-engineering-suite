//! 模块骨架
//! 模块路径: crates\tools\src\tool_failure_streak.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: input_matchequals, reason, stagesfanout, workflow_id
//! 错误码: GX_LAD_GENERATE, WORKFLOW_CANCELLED, WORKFLOW_INVALID_INPUT
//! 相关中文说明: 2 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   stagesfanout
//!   WORKFLOW_INVALID_INPUT: À
//!   previous_errorprevious_receiptsInspect these partial results and repair only the unresolved work. Preserve valid outputs; do not repeat accepted upstream operations.
//!   WORKFLOW_CANCELLED:Tool returned an explicit failure; inspect its receipt and partial effects.
//!   receiptsDiff:crates\tools\src\agent_tools\lane_summary\artifacts.rs
//!   file is missing
//!   input_matchequals
//!   - block_id=À
//!    file_stem=À
//!    exact_path=À
//!   - block_id=À
//!    | file_stem=À
//!    | existing=ÀÀ
//!   %æé  JSON-RPC æ¹éè¯·æ±å¤±è´¥ï¼À
//!   批量响应缺少某个请求的结果响应里没有本次请求的结果
//!   æé  JSON-RPC è¯·æ±å¤±è´¥ï¼À
//!   CPU 返回的会话令牌含有非法字符，无法作为 HTTP 头发送Api.Login登录成功但响应里没有 token 字段
//!    commit(s) behind
//!   has diverged (À
//!   crates\tools\src\tool_failure_streak.rs
//!   .condition: À
//!   GX_LAD_GENERATE: À
//!   invalid LAD generator input: À
//!   plan.subroutines[À
//!   ].pointer: À

// TODO: 依上列契约实现 `tool_failure_streak` 模块。
