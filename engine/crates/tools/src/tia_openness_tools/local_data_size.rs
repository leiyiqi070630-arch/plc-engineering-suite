//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\local_data_size.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: acceptance, max_attempts, pointerequals
//!
//! 契约线索（截断）:
//!   input_matchPin the verification target: these argument fields must exactly match the executed call, e.g. path/projectPath/blockName. Different input_match values allow checks of mu
//!   pointerequals
//!   Exact JSON-pointer checks against actual results, e.g. tool=codesys_build_compile pointer=/data/acceptanceVerdict equals=pass. Select result fields from the real tool contract. For
//!   Agent tool arguments (prompt, optional model/profile, output_schema or artifact_contract). description and run_in_background=true are assigned by the engine. Child permissions cann
//!   max_attempts
//!   run on a main step: one declared real tool.
//!   Exact arguments for that tool. All existing permission/confirmation requirements still apply.
//!   reasonretry/block/cancel: actual diagnostic, partial-effect reconciliation and changed approach.¶ÈEC
//!   WorkflowDurable dependency workflow for main tools/background agents, not one-step edits. create saves; get reconciles child manifests without starting; run executes one ready main

// TODO: 依上列契约实现 `local_data_size` 模块。
