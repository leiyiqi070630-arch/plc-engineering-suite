//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\weinview\field_handoff.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: run_in_background, search_target, submit_upload
//! 错误码: WORKFLOW_INVALID_CHECK_INPUT, WORKFLOW_INVALID_CHECK_POINTER, WORKFLOW_INVALID_CHECK_TOOL, WORKFLOW_INVALID_CHECK_VALUE, WORKFLOW_INVALID_PLAN
//!
//! 契约线索（截断）:
//!   run_in_background
//!   WORKFLOW_INVALID_PLAN: agent.prompt required
//!   WORKFLOW_INVALID_PLAN: agent needs artifact_contract or output_schema; prose is not acceptance
//!   tia_ide:tiacodesys_ide:codesysinoproshop_WORKFLOW_INVALID_PLAN: resource names must not be empty=
//!   , #WORKFLOW_INVALID_CHECK_TOOL: step 'À
//!   ' acceptance.tool='À
//!   ' is not allowed. Use Àv for this step. Agent steps are inspected with AgentGet, not the Agent launch receipt; keep the intended equals value.
//!   &WORKFLOW_INVALID_CHECK_POINTER: step 'À8' acceptance.pointer must start with '/' (JSON pointer).
//!   $WORKFLOW_INVALID_CHECK_INPUT: step 'ÀE' acceptance.input_match must be an object of target argument fields.
//!   $WORKFLOW_INVALID_CHECK_VALUE: step 'Àk' acceptance.equals cannot be null. false, 0 and empty strings are valid when they are the intended result.
//!   WORKFLOW_INVALID_PLAN: main steps need real tools, not reporting/delegation tools
//!   WORKFLOW_INVALID_PLAN: 1..3 attempts and 1..16 evidence checks required
//!   WORKFLOW_INVALID_PLAN: unique simple step ids and non-empty titles required
//!   WORKFLOW_INVALID_PLAN: provide 1..32 bounded steps
//!   crates\tools\src\builtin_specs\weinview\field_upload.rs
//!   search_target
//!   submit_upload
//!   receiptweinview_field_uploadOpen a new original EasyBuilder Pro cMT project with the requested installed model, then open its File > Upload (HMI-to-PC) dialog through F8. Supply mo

// TODO: 依上列契约实现 `field_handoff` 模块。
