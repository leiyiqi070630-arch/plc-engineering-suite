//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\common\download_sentinel.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: interrupted_download_to_device
//!
//! 契约线索（截断）:
//!   configure-simulation-support--enabled
//!   read-project-multilingual-texts--source-culture--target-culturecrates\tools\src\tia_openness_tools\project_lifecycle\languages.rs
//!   create-hmi-screen--screen-name--group-path--width--height--title--replacecrates\tools\src\tia_openness_tools\hmi\screens.rs
//!   tia_openness_create_hmi_screen_iteman existing screen path from list_hmi_screensPC-System_1/HMI/Screens/Home_1a nonempty item name (legacy alias: name)Titletext, text_box, button, 
//!   create-hmi-screen-item--screen-pathvalidated screen_pathé=C
//!   --item-namevalidated item_name
//!   --item-typevalidated item_type
//!   --left--top--visible--opacity--background-color--alternate-background-color--foreground-color--border-color--alternate-border-color--border-width--font-name--font-sizefont_size mus
//!   plc-code.tia-download-sentinel.v1
//!   startedAttiaVersionprojectcrates\tools\src\tia_openness_tools\common\download_sentinel.rs
//!   interrupted_download_to_device
//!   Real-machine forensics 2026-07-31: on some machines the download is accompanied by a Siemens driver-layer NIC blip that drops the remote-control session while the PC itself keeps r

// TODO: 依上列契约实现 `download_sentinel` 模块。
