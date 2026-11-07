//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\weinview\recipe_database.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: native_download_directoryseriestarget_ip, receipt, search_target, submit_download
//!
//! 契约线索（截断）:
//!   : entry_type must be one of À" (measured on a real import), got À
//!   ÀW: requires from/to (the entry identity is the range; for a single value set from == to)
//!   ) must not be greater than to (À
//!   : a graphic list entry must be a single value - TIA requires From == To for a graphic list of the type "Single value" and rejects the import with a NonRecoverableException that CLO
//!   : duplicate range À
//!   ..À); every entry must cover a distinct range
//!   ÀS: a Range entry is marked default_entry; a default entry is normally a single value
//!   À): no text - the entry shows an empty text
//!   : picture is not written - a graphic-list entry's picture reference has no verified shape yet (it needs an existing graphic object in the project). Assign the picture in TIA, or im
//!   textlisttext_listgraphiclistgraphic_listgraphicpicture-listsinglevaluesingle_valuesinglerangeinterval
//!   entries[À"]: ignored unrecognized field(s): À> (an entry's identity is from/to; add text for the shown text)
//!    Committed committed pushed merged Tested
//!   testedcommittedpushedmergedcrates\tools\src\builtin_specs\weinview\field_download.rs
//!   search_target
//!   submit_download
//!   cxob_pathexpected_cxob_sha256^[a-fA-F0-9]{64}$
//!   native_download_directoryseriestarget_ip
//!   weinview_field_downloadOpen the installed EasyDownload with a vendor CXOB for cMT or an original Build-for-SD/USB download directory for non-cMT, selecting the exact original Serie

// TODO: 依上列契约实现 `recipe_database` 模块。
