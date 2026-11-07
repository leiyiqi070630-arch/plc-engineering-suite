//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\hardware_online\network.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: TIA_CAN_PLUG_NEW_FALSETIA_PLUG_RACK_MODULE
//! 相关中文说明: 4 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   OrderNumber:À
//!   DeviceItemscreate_subnet#TIA Openness create subnet failed: À
//!   partialAddressskippedcreate_io_system&TIA Openness create IO system failed: À
//!   plug_rack_module&TIA Openness plug rack module failed: À
//!   TIA_CAN_PLUG_NEW_FALSETIA_PLUG_RACK_MODULE
//!   修复(target_path):target_path 只给了设备名,而槽位挂在设备里的**机架 DeviceItem** 上,形如 `PLC_1/导轨_0`(机架名随界面语言,英文界面为 Rail_0)。取机架名的可靠办法是 tia_openness_read_hardware_config——设备下的第一个 item 就是机架;**不要**用 tia_o
//!   修复(typeIdentifier 的固件档):这条有两次取证核验、结论相反,按**你这台的机架族**取,别把任一条当通用规则:
//!    · S7-1500 机架(实测 V20 + CPU 1513-1 PN):模块带**模块自己的**固件档(实测 /V1.0、/V1.1),照抄 CPU 的 /V2.x 会被拒;V18+ 可用 tia_openness_search_equipment_catalog 搜订货号,原样取 typeIdentifier。
//!    · S7-400 经典机架(实测 V17 + S7-400):同一块 SM421/SM422 带 `/V1.0` 连拒 3 次,只留 `OrderNumber:6ES7 421-1BL01-0AA0` 一次插上;模块族还必须和机架族一致(S7-300 模块插不进 S7-400 机架)。V17 没有实时 HardwareCatalog API;PLC Cod
//!    两条之外的机架族(如 S7-300 机架、CPU 模块本身)都没取过证:带后缀、不带后缀各试一次就够,别在 /Vx.y 的版本号上继续枚举。同时确认 position_number 是对**机架路径**问 list_plug_locations 返回的空闲槽位(已占用的槽位同样报 CanPlugNew=false)。add_network_devicera

// TODO: 依上列契约实现 `network` 模块。
