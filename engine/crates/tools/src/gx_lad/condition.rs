//! 模块骨架
//! 模块路径: crates\tools\src\gx_lad\condition.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   called `Result::unwrap()` on an `Err` value
//!   read-onlyworkspace-writedanger-full-accesspromptallow
//!   0warning: skipping unavailable fallback provider À
//!   ` reports cbRgFcLcb=À3: more fc/lcb pairs than any Word version defines (ÀF), so the FIB section it was read from is not the one it claims to be.
//!   Re-save the document from the Word application, or ask for a .docx.
//!   ` reports cbRgFcLcb=À
//!   : fewer than the À\ fc/lcb pairs needed to reach fcClx/lcbClx (the piece table), so its text cannot be located.
//!   The FIB is damaged or was written by a non-Word producer. Open the file in the Word application and re-save it, or ask for a .docx.
//!   `À7` is a Word 6/95 (or older) file: its FIB reports nFib=À
//!   , below the À? at which Word 97 introduced the piece table this reader reads.
//!   DOCUMENT_LEGACY_BINARY_FORMATOpen it and use Save As â .docx, then read the saved file; a pre-97 .doc carries its text in a layout this tool cannot decode without converting it.·
//!   `À2` has a WordDocument stream whose FIB starts with Ã 
//!    instead of the required Ã 
//!   The file is not a Word binary document, or its first 512 bytes are corrupt. Check it with the customer and ask for a .docx export.
//!   TCPUDPEND_FUNCTION_BLOCKEND_FUNCTIONEND_ORGANIZATION_BLOCKEND_DATA_BLOCKEND_TYPEFUNCTION_BLOCKFUNCTIONORGANIZATION_BLOCKDATA_BLOCKTYPE!RISINGFALLINGdword()/real() require a compari

// TODO: 依上列契约实现 `condition` 模块。
