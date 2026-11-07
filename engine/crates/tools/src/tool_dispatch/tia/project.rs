//! 模块骨架
//! 模块路径: crates\tools\src\tool_dispatch\tia\project.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: adjusted_target_directory, requested_target_directory
//!
//! 契约线索（截断）:
//!   requested_target_directory
//!   adjusted_target_directory
//!   The same-name folder 'Àä
//!   ' under target_directory is the current PLC Code workspace (contains plc-code.project.json). The create is embedded inside that workspace: the effective target_directory becomes th
//!   -.ap<version>' and the project keeps its name.
//!   TIA À* exceeds the Openness project-path limit: À
//!    characters, À
//!    over the À'-character maximum TIA Portal accepts. À/
//!    Openness refuses this before anything is created, and its own error does not name the offending path. Fix the path, do not retry: move the project nearer the drive root (e.g. C:\T
//!   )TIA target_directory is not a directory: À
//!   tia_openness_create_project requires target_directory
//!   The resolved target directory plus the requested project name exceeds TIA's 143-character Openness path limit, so the name was auto-shortened to fit. Pass a target_directory nearer
//!   project path
//!   TIA creates 'À
//!   o.ap<version>', and that full project-file path is what the limit applies to — not the target_directory alone.
//!   tia_openness_save_projecttia_openness_get_project_statustia_openness_save_project_astia_openness_archive_projecttia_openness_close_projecttia_openness_create_projectcrates\tools\sr

// TODO: 依上列契约实现 `project` 模块。
