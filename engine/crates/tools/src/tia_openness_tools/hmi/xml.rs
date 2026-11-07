//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\hmi\xml.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   go-online--apply-configuration--confirm
//!   --mode--pc-interface--interface-number--target-interface--target-address©
//!   tia_openness_configure_hmi_mapping_table writes into the open TIA project and requires confirm=true.crates\tools\src\tia_openness_tools\hmi\mapping_table.rs
//!   action=delete-row needs an address: row_index (as printed by the readback), a from+to pair, or all=true. Deleting addresses what exists rather than clearing the table by accident.
//!   configure_hmi_mapping_tableconfigure-hmi-mapping-table--screen-item-path--property-name--action--from--to--row-index--all--bit-number--condition--relevant--value-color--value-bool-
//!   mode Àd is not one of the three simple dynamization options the manual names: range, single-bit, multi-bit.
//!   mode=ÀY requires bit_number: the bit is what the row keys on (condition = state * 2^bit_number).
//!   mode=range requires from and to: a range row is defined by its bounds. For a single value address, pass from and to equal (the manual's fourth row is exactly that).
//!   action À: is not supported: use create-row (default) or delete-row.
//!   tia_openness_configure_hmi_mapping_table requires property_name: the manual addresses the dynamization by its PropertyName (e.g. BackColor, Visible), and a mapping table is configu

// TODO: 依上列契约实现 `xml` 模块。
