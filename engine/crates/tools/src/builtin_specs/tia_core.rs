//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_core.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: device_pathobject_pathexport_pathlog_path, import_pathimport_optionconfirm
//!
//! 契约线索（截断）:
//!   modify_value-> <ModifyValue>, the value used when modifying (e.g. true, 100, 16#FF).
//!   tia_watch_generate_table_xmlGenerate a real TIA watch-table SimaticML document (.xml) from a structured plan. Mutating; writes a file when output_path is given, otherwise returns t
//!   device_pathobject_pathexport_pathlog_path
//!   tia_openness_export_caxExport Siemens hardware/project CAx (AutomationML) through the attached TIA Openness CaxProvider. Pass export_path explicitly; omit device_path for project-l
//!   import_pathimport_optionconfirm
//!   tia_openness_import_caxImport a Siemens CAx/AutomationML file into the attached TIA project through CaxProvider. Mutating and requires confirm=true. import_option defaults safely t

// TODO: 依上列契约实现 `tia_core` 模块。
