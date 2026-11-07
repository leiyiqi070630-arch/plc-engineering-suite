//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\project_lifecycle\inspect.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: openness_group_missing
//! 相关中文说明: 6 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   openness_group_missing
//!   severity|(C
//!   当前 Windows 账号不在 Siemens TIA Openness 组
//!   Openness 用本地组 "Siemens TIA Openness" 决定哪些账号可以访问。不在组里的账号即使桥接程序已在 HKLM 白名单登记，也会被 Openness 拒绝。
//!   调用 tia_openness_request_group_join —— 桌面会弹一次「加入 Openness 组」确认，随后是 Windows 管理员授权；加完之后让用户注销 Windows 重新登录。
//!   当前 Windows 账号已在 "Siemens TIA Openness" 组内：这一项不是连接失败的原因。opennessGroupVerdict--include-processes--include-whitelist--include-capability-matrix|j*C
//!   已由管理员把当前 Windows 用户加入 "Siemens TIA Openness" 组。
//!   这个变更要**注销 Windows 并重新登录**之后才会进入当前账号的令牌，所以现在仍然连不上 TIA 是正常的：请注销重登，回来后再继续原来的 TIA 操作。
//!   éç»åå¦æè¿è¿ä¸ä¸ï¼ç¨ tia_openness_status çä¸æ¬¡è¯æ­ï¼å®ä¼åºåç½ååãç»ãPortal ä¸ä»¶äºï¼å«åªç¯çç»ï¼ãÀq*C
//!   list-tags--include-system-constantscrates\tools\src\tia_openness_tools\project_lifecycle\inspect.rs

// TODO: 依上列契约实现 `inspect` 模块。
