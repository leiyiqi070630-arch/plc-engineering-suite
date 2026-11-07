//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\weinview\field_download.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: search_target, submit_download
//!
//! 契约线索（截断）:
//!   mode must be one of À
//!    (GraphicListMode), got À
//!   mode ÀL is a graphic-list property (GraphicListMode) and is ignored for a text list
//!   entries is empty: the list imports with no entries (valid, but a text list without entries shows nothing at runtime)+only one entry may set default_entry=true; À
//!    were marked
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

// TODO: 依上列契约实现 `field_download` 模块。
