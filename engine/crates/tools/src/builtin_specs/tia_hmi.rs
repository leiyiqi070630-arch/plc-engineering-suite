//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_hmi.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: direction, export_directoryfile_formatfile_name, relative_workspace_path
//!
//! 契约线索（截断）:
//!   relative_workspace_path
//!   tia_openness_version_control_mapCreate a Siemens VCI mapping from an exact engineering object/group path to a relative file/group path in an existing workspace (for a block, includ
//!   export_directoryfile_formatfile_name
//!   tia_openness_version_control_exportExport one engineering object through Siemens Workspace.ExportObject into an existing absolute directory within its actual VCI workspace root. Ge
//!   tia_openness_version_control_syncSynchronize one explicit Siemens VCI mapping. direction must be ProjectToWorkspace (writes source files) or WorkspaceToProject (imports workspace e

// TODO: 依上列契约实现 `tia_hmi` 模块。
