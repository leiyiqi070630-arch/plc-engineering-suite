//! 模块骨架
//! 模块路径: crates\tools\src\web\client.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: db_member, sensor, target_kinddevice_item
//! CLI/参数: --confirm, --device-name, --interface, --object-name, --replace-existing, --save-project, --sensor-index, --target-kind, --target-path
//!
//! 契约线索（截断）:
//!   "the stimuli could not be written: À
//!   writeFailure
//!   connect-motion-hardware
//!   --device-name
//!   --object-name
//!   read-only motion inspection does not accept mutation selectors or flags
//!   target_kinddevice_item
//!   AllowAllModules
//!   --target-kind
//!   --target-path
//!   --connect-optionÝÈ%C
//!   --sensor-index
//!   --replace-existing
//!   --save-project
//!   connect_option must be Default, or explicit AllowAllModules for an exact device_item target
//!   target_kind must be device_item or db_member; no SDR/address fallback exists
//!   actor does not accept sensor_index
//!   interface must be actor or sensor
//!   motion binding requires confirm=true
//!   inspect-motion-connectionslist-motion-connection-targets
//!   motion binding requires À
//!   crates\tools\src\web\client.rs
//!   HTTPS_PROXYHTTP_PROXYALL_PROXYPLC_CODE_HTTP_PROXYtext/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8

// TODO: 依上列契约实现 `client` 模块。
