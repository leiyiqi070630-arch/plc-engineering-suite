//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\hmi\validation.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: details
//! 错误码: TIA_TARGET_PLC_NOT_FOUND
//! 相关中文说明: 2 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   /data/devices
//!   hasPlcSoftware
//!   plcSoftwarePath
//!   tia_openness_À
//!   list-blockslist-typestypeslist-tagstagTableslist-groups
//!   The requested PLC software target was not found.HV(C
//!   æªæ¾å° PLC è½¯ä»¶ç®æ ï¼À+ï¼éè¯¯ç  TIA_TARGET_PLC_NOT_FOUNDï¼ãÀa ç©ºæ°ç»å¯è½è¢«è¯¯è¯»ä¸ºâè¯¥ PLC æ¯ç©ºå·¥ç¨âãæâæ ç­¾æ²¡æè¢«åå»ºâï¼å æ­¤ ÀZ æç
//!   typeIdentifier
//!   TIA_TARGET_PLC_NOT_FOUNDæªæ¾å° PLC è½¯ä»¶ç®æ *æªæ¾å° PLC è½¯ä»¶ç®æ ï¼tia_openness_À«
//!    çç®æ æ ¡éªæªéè¿ï¼éè¯¯ç  TIA_TARGET_PLC_NOT_FOUNDï¼ãåè°ç¨ tia_openness_list_devicesï¼æ tia_openness_project_treeï¼æ ¸å¯¹å·¥ç¨éçå®çè®¾å¤åä¸æ¯ä¸ª
//!   deviceExists
//!   device_name=ÀJ æ¥åæ PLC è½¯ä»¶ï¼ä½ TIA Openness æ¡¥ä»ç¶æ æ³ä¸ºå®æä¸¾å¯¹è±¡
//!   TIA Openness 桥无法解析这次请求的 PLC 软件目标
//!   （未指定）validate_hmi_objectsvalidate-hmi-objects--object-paths;crates\tools\src\tia_openness_tools\hmi\validation.rs
//!   tia_openness_validate_hmi_objects requires object_path (or a non-empty object_paths list): it validates the objects you name. Paths come from tia_openness_hmi_tree / list_hmi_* / r

// TODO: 依上列契约实现 `validation` 模块。
