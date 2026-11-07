//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\base.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: TIA_OBJECT_KIND_MISMATCH, TIA_OBJECT_NOT_FOUND
//!
//! 契约线索（截断）:
//!   Copy the CPU item's items[].path VERBATIM from tia_openness_read_hardware_config (e.g. "PLC_1/PLC_1" for a compact CPU, "PLC_1/å¯¼è½¨_0/PLC_1" on a rack). A bare device name like "
//!   tia_openness_read_hardware_identifierRead hardware identifier (TypeIdentifier, OrderNumber, Version) from a device item. THE source of project_type_identifier for the PLCSIM tools 
//!   tia_openness_detect_ip_conflictsDetect IP address conflicts by finding duplicate node addresses across the project's devices.crates\tools\src\builtin_specs\base.rs
//!   commandThe shell command to execute.

// TODO: 依上列契约实现 `base` 模块。
