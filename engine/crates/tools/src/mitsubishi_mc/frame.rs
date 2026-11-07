//! 模块骨架
//! 模块路径: crates\tools\src\mitsubishi_mc\frame.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   `À{` has a .doc extension but is not an OLE2 compound file: its first bytes are not the CFB signature D0 CF 11 E0 A1 B1 1A E1.
//!   DOCUMENT_UNSUPPORTED_FORMATThis is not a legacy Word binary file. If it is really a Word 2007+ document, rename it to .docx and read it again; if it is plain text, use read_file.en
//!   Tables are flattened into reading order (one line per row, cells joined by " | "); column alignment and merged cells are not preserved.
//!   The extracted text of `À
//!   ` exceeds ÀP characters; this tool bounds one call so a huge document cannot exhaust memory.
//!   A .doc has no page axis to window with `pages`; save it as .docx and read a page range there, or split the document.
//!   ` produced no text at all: its main document is empty of characters. Documents whose content is images, scanned pages or vector drawings look exactly like this.
//!   DOCUMENT_NO_TEXT_LAYERThis tool does not extract images and does not do OCR. Ask the customer for a text version, or OCR the images first.
//!   crates\tools\src\mitsubishi_mc\frame.rs
//!   %ä½è¯»åååºå­èä¸è¶³ï¼éè¦ À
//!    å­èæ¿è½½ À
//!    ä¸ªç¹ï¼å®é À

// TODO: 依上列契约实现 `frame` 模块。
