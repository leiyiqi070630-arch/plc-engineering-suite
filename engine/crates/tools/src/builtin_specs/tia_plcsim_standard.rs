//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_plcsim_standard.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: hardware_identifier
//!
//! 契约线索（截断）:
//!   faultpull, plug, plug_error_remains, plug_wrong_module, rack_station_fault, rack_station_return, process_rising_edge, process_falling_edge, process_limit_1_underrun, process_limit_
//!   hardware_identifier
//!   Numeric UInt16 HW identifier of the module/station from the DOWNLOADED configuration. An identifier that is not in the downloaded config answers -4 DoesNotExist.
//!   channelUInt16 channel index; process_* faults only (default 0).
//!   tia_plcsim_advanced_inject_faultInject a hardware fault into the virtual controller to test the program's fault handling without touching real hardware. fault=pull, plug, plug_erro

// TODO: 依上列契约实现 `tia_plcsim_standard` 模块。
