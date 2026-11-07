//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_lad_patterns.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: plan_jsonplanoutput_directory
//!
//! 契约线索（截断）:
//!   target_tia_versionOptional. An explicit target TIA release for this lookup (V20 / V21 / 21 ...). Omit it in the normal case: the target is then resolved from this workspace's decla
//!   tia_sd_instruction_specUse: Return required fields, pins, instance and example_network for one SD instruction.
//!   When: A required shape is unknown; target_tia_version binds the catalog lookup.
//!   Avoid: Treating V21-harvested pins as a V20 contract or local ok:true as compile proof.
//!   Next: Check versionBinding.usableAsTargetContract. Unsupported versions return no parameter table; unknown targets return unproven shapes. Prove with target import/compile; invalid
//!   plan_jsonplanoutput_directory
//!   tia_sd_generate_blockUse: Validate and generate a complete SIMATIC SD FB/FC/OB plan.
//!   When: V20/V21 authoring; output_directory writes BOM/CRLF .s7dcl + .s7res.
//!   Avoid: Using SD on V16-V19; use LAD XML there.
//!   Next: Resolve a concrete unsupported shape with instruction_spec; import the paired documents and obtain a final compile verdict.crates\tools\src\builtin_specs\tia_lad_patterns.rs

// TODO: 依上列契约实现 `tia_lad_patterns` 模块。
