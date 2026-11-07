//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_network_online.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: library_folder_pathmaster_copy_namecreate_folders, xml_pathimport_option
//!
//! 契约线索（截断）:
//!   tia_openness_export_watch_table_xmlExport a real PLC watch table as XML/SimaticML. Read-only.
//!   xml_pathimport_option
//!   Import a real PLC watch table XML/SimaticML document. Mutating; requires confirm=true. Use only XML exported from TIA or verified templates; do not invent XML.
//!   force_table_pathtia_openness_export_force_table_xmlExport a real PLC force table as XML/SimaticML. Read-only; does not activate or write any force value online.Ø
//!   Import a real PLC force table XML/SimaticML document. Mutating; requires both confirm=true and force_table_confirm=true. Creates/updates a project force table only and does not act
//!   global_library_pathopen_modeupgradetia_openness_list_library_master_copiesRead a project library, or open a global library file read-only. Returns masterCopies and separate library
//!   library_folder_pathmaster_copy_namecreate_folders
//!   Create a real project-library master copy from a deterministic TIA object path. Mutating; requires confirm=true.Ø
//!   master_copy_pathtarget_kindtag_table_pathtarget_device_item_pathP#EC
//!   Create a real TIA project object from a project/global library master copy. Mutating; requires confirm=true. target_kind must be one of device, device_item, subnet, block, type, ta

// TODO: 依上列契约实现 `tia_network_online` 模块。
