//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\plc_object_tag\object_crud\copy_move.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: MODULE_MAPPING_CLEAR_NOT_ADAPTED, MODULE_PARAMETER_DEPENDENCY, MODULE_PARAMETER_RANGE_NOT_ADAPTED, READ_REQUIRED
//!
//! 契约线索（截断）:
//!   MODULE_PARAMETER_DEPENDENCY: a changed DA Range requires explicit digital PresetValue in the same batch; native range changes may clamp values
//!   MODULE_PARAMETER_DEPENDENCY: inactive preset writes are not verified for this profile
//!   MODULE_PARAMETER_RANGE_NOT_ADAPTED: this DA range has no verified preset editor bounds
//!   MODULE_MAPPING_CLEAR_NOT_ADAPTED: mapping clear has not been verified; retain the current address
//!   READ_REQUIRED: this preserved DA user view is read-only evidence; obtain a fresh owned read before writing
//!   --new-name--object-path--kind--target-group-path--import-option--overwrite--forcecrates\tools\src\tia_openness_tools\plc_object_tag\object_crud\copy_move.rs

// TODO: 依上列契约实现 `copy_move` 模块。
