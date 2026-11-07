//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\plc_object_tag\object_crud\create.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: details
//! 相关中文说明: 2 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   typeIdentifier
//!   TIA_TARGET_PLC_NOT_FOUNDæªæ¾å° PLC è½¯ä»¶ç®æ *æªæ¾å° PLC è½¯ä»¶ç®æ ï¼tia_openness_À«
//!    çç®æ æ ¡éªæªéè¿ï¼éè¯¯ç  TIA_TARGET_PLC_NOT_FOUNDï¼ãåè°ç¨ tia_openness_list_devicesï¼æ tia_openness_project_treeï¼æ ¸å¯¹å·¥ç¨éçå®çè®¾å¤åä¸æ¯ä¸ª
//!   deviceExists
//!   device_name=ÀJ æ¥åæ PLC è½¯ä»¶ï¼ä½ TIA Openness æ¡¥ä»ç¶æ æ³ä¸ºå®æä¸¾å¯¹è±¡
//!   TIA Openness 桥无法解析这次请求的 PLC 软件目标
//!   （未指定）validate_hmi_objectsvalidate-hmi-objects--object-paths;crates\tools\src\tia_openness_tools\hmi\validation.rs
//!   tia_openness_validate_hmi_objects requires object_path (or a non-empty object_paths list): it validates the objects you name. Paths come from tia_openness_hmi_tree / list_hmi_* / r
//!    À0: string values must not contain ';' or newlines
//!    À4: only bool/number/string values are supported, got À
//!    name À& must not contain ';', '=' or newlines
//!   s contains an empty È
//!   --db-namedb_name--fb-namefb_namecrates\tools\src\tia_openness_tools\plc_object_tag\object_crud\create.rs
//!   --db-numberdb_number must be >= 0--group-path--auto-number--compile

// TODO: 依上列契约实现 `create` 模块。
