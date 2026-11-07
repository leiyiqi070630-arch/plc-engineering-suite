//! 模块骨架
//! 模块路径: crates\tools\src\tool_dispatch\weinview\address_workflow.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: native_tag_verified
//! 错误码: INVALID_ARGUMENT, TABLE_FILE_REQUIRED, TABLE_READ_REQUIRED, TABLE_STRUCTURE_INVALID, TABLE_TEMPLATE_MISMATCH, WEINVIEW_EVENT_TYPED_ROW_INVALID
//! 相关中文说明: 1 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   tableFileTABLE_FILE_INVALID_PATH
//!   TABLE_TEMPLATE_MISMATCH: columns must exactly match this native read, including trailing empty columns
//!   TABLE_FILE_REQUIRED: this large read was delivered as a complete JSON draft; edit that draft and use tableFile, never sampled inline rows
//!   INVALID_ARGUMENT: use exactly tableFile or both columns and rows
//!   TABLE_READ_REQUIRED: expectedSha256 must match this table's latest native semantic SHA
//!   序号变量名注释软元件地址
//!   TABLE_STRUCTURE_INVALID: complete native template and matching row widths required
//!   crates\tools\src\tool_dispatch\weinview\address_workflow.rs
//!   WEINVIEW_EVENT_TYPED_ROW_INVALIDd=C
//!   native_tag_verified

// TODO: 依上列契约实现 `address_workflow` 模块。
