//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_cax.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: DATE_AND_TIME, TIME_OF_DAY
//!
//! 契约线索（截断）:
//!   Symbolic operand -> <Name> ("Tag name of watch table entry").
//!   addressAbsolute operand -> <Address> ("Address of watch table entry"), e.g. %M0.0.
//!   display_format-> <DisplayFormat>. Proven PlcWatchAndForceTableDisplayFormat members (exact case): Undef, Any_pointer, BCD, Bin, Bool, Character, Character_sequence, Date, DATE_AND_
//!   monitor_trigger-> <MonitorTrigger>. Proven PlcWatchAndForceTablePreDefinedTrigger members: Permanent, PermanentAtStart, OnceOnlyAtStart, PermanentAtEnd, OnceOnlyAtEnd, PermanentAtS
//!   modify_trigger-> <ModifyTrigger>. Same PreDefinedTrigger member set as monitor_trigger.
//!   modify_value-> <ModifyValue>, the value used when modifying (e.g. true, 100, 16#FF).
//!   tia_watch_generate_table_xmlGenerate a real TIA watch-table SimaticML document (.xml) from a structured plan. Mutating; writes a file when output_path is given, otherwise returns t

// TODO: 依上列契约实现 `tia_cax` 模块。
