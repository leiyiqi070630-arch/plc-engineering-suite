//! 模块骨架
//! 模块路径: crates\tools\src\agent_tools\lifecycle.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 相关中文说明: 4 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   ç¬¬ À$ ä¸ªä»»å¡ç prompt ä¸è½ä¸ºç©ºã
//!   AgentBatch 至少需要 2 个任务；单个子任务请直接用 Agent。
//!   pipeline mode requires a pipeline spec
//!   pending is non-empty
//!    å¯å¨å¤±è´¥ï¼À
//!   并发槽位持续不足，阶段无法启动（已等待超时）
//!   workflowKindpipeline
//!   stageCountæµæ°´çº¿å·²å¨åå°å¯å¨ï¼æ¯æ¡ä»»å¡ä¼èªå¨éè¿å¨é¨é¶æ®µï¼æç»ç»æå®æåä¸»ä»£çä¼èªå¨ç»§ç»­æ±æ»ã¢£*C
//!   .session.jsonl
//!   crates\tools\src\agent_tools\lifecycle.rs
//!   Finish by calling the `StructuredOutput` tool exactly once; its input must be a JSON object matching this schema:

// TODO: 依上列契约实现 `lifecycle` 模块。
