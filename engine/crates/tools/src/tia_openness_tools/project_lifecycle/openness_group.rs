//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\project_lifecycle\openness_group.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: request_group_join
//! 错误码: TIA_OPENNESS_GROUP_MEMBERSHIP_MISSING
//! 相关中文说明: 7 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   checkedCurrentUserinGroup
//!   ï¼æ¡¥è¿åï¼À
//!   Hæ æ³å¤å®å½å Windows è´¦å·æ¯å¦å±äº "Siemens TIA Openness" ç»À:ââ å¨å¤å®åºæ¥ä¹åä¸è¦è¯·æ±ç®¡çåææã
//!   TIA_OPENNESS_GROUP_MEMBERSHIP_MISSING
//!   : 当前 Windows 账号不在本地组 "Siemens TIA Openness" 里，Openness 不会接受这个账号连接 TIA Portal —— 这是「连不上博图」里仅次于白名单的第二号原因。
//!   为什么需要这一步：Siemens 用这个本地组决定「哪些账号允许访问 Openness」，组变更需要在 HKLM/本机安全数据库里写成员，所以必须管理员执行；而且 Windows 只把组令牌写进**新的登录会话**，加完组必须**注销 Windows 并重新登录**才生效。
//!   怎么办（推荐）：本消息会在 PLC Code 里弹出一个确认条，点其中的「加入 Openness 组」按钮 —— 随后 Windows 会弹出管理员授权（UAC）对话框，你同意后由 PLC Code 桌面端把**你当前的 Windows 账号**加入该组。加完之后请**注销 Windows 重新登录**，回来告诉我继续，我再接着原来的 TIA 操作。
//!   如果你在纯 CLI 环境、没有看到弹窗：以管理员身份运行 `TiaOpennessBridge.exe add-openness-group --user <你的账号>`，或者 设置 → TIA 连接 里点「加入 Openness 组」。
//!   如果这台电脑禁止提权（组策略）：找 IT 用管理员身份执行同一条命令，加入后同样要注销重登。
//!   加入组需要管理员权限，PLC Code 无法自己提权，所以这一步必须由人来点。
//!   crates\tools\src\tia_openness_tools\project_lifecycle\openness_group.rs
//!   request_group_join
//!   groupRequestSubmitted当前 Windows 用户已经在 "Siemens TIA Openness" 组里，这一项无需任何操作。如果 TIA 仍然连不上，问题不在组上：用 tia_openness_status 看白名单 / Portal / Openness 组件那几项，必要时用 tia_openness_request_bridge_

// TODO: 依上列契约实现 `openness_group` 模块。
