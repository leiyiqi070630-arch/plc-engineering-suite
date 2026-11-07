//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_library_lifecycle.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: PS_E_PLCNOTRUNNING, SIDECAR_FRONTEND_FAULT_INJECTION_UNSUPPORTED
//!
//! 契约线索（截断）:
//!   tia_plcsim_standard_trigger_faultInject a hardware fault into a running S7-1200/S7-1500 simulation so a fault-handling OB actually executes — pull/plug a module (OB83), fail or ret
//!   cyclestia_plcsim_standard_scanS7-300/400 ONLY: execute program cycles on the classic S7ProSim simulator. This is the only call that proves the simulated CPU is executing — a stoppe

// TODO: 依上列契约实现 `tia_library_lifecycle` 模块。
