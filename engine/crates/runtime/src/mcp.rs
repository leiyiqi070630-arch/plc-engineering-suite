//! 模块骨架
//! 模块路径: crates\runtime\src\mcp.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   object-opsobject tree housekeeping beyond delete/regenerate (folders, find, rename)codesys_object_create_foldercodesys_object_findcodesys_object_renameinoproshop_object_create_fold
//!   task-opstask creation and listing (task_set/task_pou_set stay always-on — finalize uses them)codesys_task_createcodesys_task_listinoproshop_task_createinoproshop_task_list
//!   crates\runtime\src\mcp.rs
//!   /v2/session_ingress/shttp/mcp//v2/ccr-sessions/
//!   shell misdelivery detectedprompt landed in wrong targetprompt receipt mismatched expected task contextprompt delivery failure detectedprompt is too longprompt_too_longcontext_lengt

// TODO: 依上列契约实现 `mcp` 模块。
