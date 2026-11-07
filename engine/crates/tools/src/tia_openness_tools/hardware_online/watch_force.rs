//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\hardware_online\watch_force.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! CLI/参数: --table-pathtable_path
//!
//! 契约线索（截断）:
//!   outputMBQBIBÀ% is a bit address, so the whole byte ÀÀN has to be written and the other seven bits must come from somewhere. Reading È
//!    back failed (À
//!   ) and this scenario has not written that byte yet, so their current values are unknown and PLC Code will not invent them. On the standard PLCSIM frontend an `input` read exists onl
//!   ","data_type":"BYTE","value":0} establishes a known base and every later bit write to that byte then needs no read), or replace this stimulus with the whole byte you mean ({"addres
//!   ","data_type":"BYTE","value":È
//!   } sets only bit À2). The controller was not written by this stimulus
//!   memory--tag-nameassert_write_tag X2C
//!   $the V16/V17 symbolic write for tag 'À
//!   ' was rejected: À
//!   s7-runtime-read--items|
//!   the S7 read returned À
//!    item(s) for À
//!    expectation(s)
//!   address 'ÀL' must not contain a comma, semicolon, pipe or newline; those separate items
//!   s7-runtime-write X2C
//!   --device-name--table-nametable_namecrates\tools\src\tia_openness_tools\hardware_online\watch_force.rs
//!   --table-pathtable_path
//!   create-watch-table--group-path--show-in-editor--save-project

// TODO: 依上列契约实现 `watch_force` 模块。
