//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_graph_patterns.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   When: Supply plan plus output_path/output_directory for a file; callee_interfaces for calls; classic CPUs need target_family/block_number.
//!   Avoid: Invented pins, TEMP timer state or hand-spliced FlgNet. timer static type=TON_TIME; global DB calls need instance.scope=GlobalVariable.
//!   Next: Review logicSummary; resolve unknown pins with instruction_spec. contact_coil is OR(branches) AND contacts. Import/compile/save only within scope; no output path means no fil
//!   Supply plan (complete object, preferred) or plan_json (JSON string). At least one non-empty plan is required.
//!   Stringified fallback of plan. Prefer the plan object form: stringified JSON double-encodes and truncates on long plans.
//!   output_pathSet a workspace XML path on the first call when the result will be imported, read back or delivered as a file. Omitted: XML is returned only, no file is created.
//!   Optional top-level alias for plan.target_family. Accepts S7-300, S7-400, S7-1200, or S7-1500; useful when target metadata is supplied beside tia_version.
//!   Optional top-level alias for plan.block_number. Classic S7-300/400 FB/FC blocks need a fixed number.
//!   crates\tools\src\builtin_specs\tia_graph_patterns.rs
//!   TIA schema version: V16-V21 (all machine-verified; the per-version stamp table handles the real deltas — V16 uses Interface/v4, and V16/V17 omit the block Namespace element). Any o

// TODO: 依上列契约实现 `tia_graph_patterns` 模块。
