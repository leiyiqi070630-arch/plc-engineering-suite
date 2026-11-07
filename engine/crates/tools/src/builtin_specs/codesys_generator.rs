//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\codesys_generator.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   Optional block path whose fingerprints are probed.
//!   tia_openness_modify_block_by_fingerprintReport a DOCUMENTED REFUSAL: manual 5.11.3.25 is titled "Changing blocks using fingerprints", but its text and its only sample define finger
//!   Block path of the organization block whose priority is written.
//!   priorityNew PriorityNumber value (manual 5.11.3.27: Integer).
//!   tia_openness_set_ob_priorityWrite the priority of an organization block through PlcBlock.SetAttribute("PriorityNumber", value) (Openness manual 5.11.3.27). Requires confirm=true. b

// TODO: 依上列契约实现 `codesys_generator` 模块。
