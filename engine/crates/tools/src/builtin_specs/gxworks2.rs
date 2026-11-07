//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\gxworks2.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: connect_option
//! 错误码: TIA_MOTION_IO_ADDRESS_UNASSIGNED
//!
//! 契约线索（截断）:
//!   AllowAllModules
//!   DeviceItem only: explicit AllowAllModules uses the native Show all modules filter with the selected mixed module as input/output. It relaxes the recognized-partner filter, not engi
//!   connect_option
//!   Intentional replacement only; a different current binding otherwise blocks the write.
//!   replace_existingÉU
//!   Save after verified binding. Then compile and save/reopen for persistence acceptance.
//!   tia_openness_inspect_motion_connectionsRead a real motion TO's actor/sensor interfaces, exact Connect signatures and known/unknown current binding fields. Engineering inspection on
//!   tia_openness_connect_motion_hardwareBind one actor/sensor engineering interface to an exact DeviceItem or existing DB member with Siemens Connect; confirm=true. For GSD drives firs

// TODO: 依上列契约实现 `gxworks2` 模块。
