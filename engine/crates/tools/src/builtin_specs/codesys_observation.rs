//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\codesys_observation.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: constant_name, project_nametarget_directoryopen_new_portal_if_needed
//!
//! 契约线索（截断）:
//!   external_accessibleexternal_visibleexternal_writableReplace the tag comment (written to every project language; Chinese allowed).
//!   tia_openness_update_tagUpdate an existing PLC tag in the running TIA Portal project. Supports name, data type, logical address, comment, and external access flags when those proper
//!   tia_openness_delete_tagDelete a PLC tag in the running TIA Portal project. Requires confirm=true and a deterministic tag_path or table/tag target.
//!   constant_name
//!   tia_openness_create_user_constantCreate a PLC user constant in a real TIA tag table. Requires confirm=true.
//!   tia_openness_update_user_constantUpdate a PLC user constant in a real TIA tag table. Supports name, data type, and value. Requires confirm=true.s
//!   tia_openness_delete_user_constantDelete a PLC user constant in the running TIA Portal project. Requires confirm=true.
//!   project_nametarget_directoryopen_new_portal_if_needed
//!   tia_openness_create_projectUse: Create/open a TIA project shell; confirm=true, no CPU or blocks added.
//!   When: Authorized new-project work; use a short absolute target_directory.
//!   Avoid: Assuming the requested name/path survived shortening or collision handling.
//!   Next: Reuse returned project_match verbatim. Another Portal version requires open_new_portal_if_needed=true. Path cap is 143 characters; impossible directories return a diagnostic.

// TODO: 依上列契约实现 `codesys_observation` 模块。
