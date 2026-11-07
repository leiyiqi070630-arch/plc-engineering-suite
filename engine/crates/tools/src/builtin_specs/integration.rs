//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\integration.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   Library-relative path from plc_corpus_find, or a corpus-relative path like plc-experience-corpus/<file>.md (absolute paths inside the knowledge root also work).`
//!   evidence_refExact opaque reference from remote find/read; cannot be guessed or exchanged across accounts.
//!   max_charsRemote evidence: default 1600, max 5000 chars, also bounded by the complete response budget. Bundled references: default 8000, max 10000. Read only an omitted condition ne
//!   Character offset to continue a window; remote evidence uses next_offset, bundled references use nextOffset.
//!   oneOfrequired
//!   plc_corpus_readRead a returned knowledge reference. For remote Siemens evidence, supply evidence_ref and optionally offset from next_offset to inspect omitted conditions/table rows

// TODO: 依上列契约实现 `integration` 模块。
