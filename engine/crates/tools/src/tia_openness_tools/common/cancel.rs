//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\common\cancel.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: archivejson
//! 相关中文说明: 5 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   ,â¦ï¼å± À
//!   %åç¨ tia_openness_status æ ¸å®ç¬¬ À< æ­¥ççå®ç¶æï¼ç¡®è®¤æªçæåï¼åªéè· index>=À" çæ­¥éª¤ï¼ä¸è¦æ´æ¹éè·ã
//!   %åç¨ tia_openness_status æ ¸å®ç¬¬ À
//!    æ­¥ï¼À;ï¼ççå®ç¶æï¼ç¡®è®¤æªçæåï¼åªéè· index>=À" çæ­¥éª¤ï¼ä¸è¦æ´æ¹éè·ã
//!   %åç¨ tia_openness_status æ ¸å®å À9 æ­¥æ¯å¦å·²çæï¼ç¡®è®¤æ è¯¯åï¼åªéè· index>=À" çæ­¥éª¤ï¼ä¸è¦æ´æ¹éè·ã
//!   先用 tia_openness_status 核实工程当前状态，确认哪些步骤已经生效，再决定重跑范围。ledger:pendingledger:in_progressledger:doneledger:failedledger:cancelled_before_startledger:interruptedledger:unknowntasklistCSV/
//!   json.tmpPLC_CODE_TIA_OPS_STOREPLC_CODE_RUNTIME_HOME
//!   tia-ops.plccode-tia-ops
//!   æ¡¥èªæ¥å®æ À
//!   已取消。本次 TIA 操作进行到哪一步未知，建议用 tia_openness_status 核实后再决定是否重跑。
//!   å·²åæ¶ãÀ
//!   not-in-ledgerno-ledgergate:waitingledger:done-ok-falsecrates\tools\src\tia_openness_tools\common\cancel.rs
//!   FBDBIDBdelete-object--object-pathobject_path--kind--force--save-projectcrates\tools\src\tia_openness_tools\plc_object_tag\object_crud\delete.rs

// TODO: 依上列契约实现 `cancel` 模块。
