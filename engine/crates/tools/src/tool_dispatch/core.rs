//! 模块骨架
//! 模块路径: crates\tools\src\tool_dispatch\core.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: ANTHROPIC_API_KEY, OPENAI_API_KEY, PLC_CODE_AGENT_MODELPLC_CODE_AVAILABLE_MODELSAGENT_STEP_BUDGET_EXHAUSTED
//! 相关中文说明: 4 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   PLC_CODE_AGENT_MODELPLC_CODE_AVAILABLE_MODELSAGENT_STEP_BUDGET_EXHAUSTED
//!   : sub-agent exhausted its À%-turn budget before normal completion
//!    | structured output: 2026-03-31windows
//!   # Sub-agent profile: À
//!   <system-reminder>
//!   </system-reminder>
//!   WebFetchWebSearchTodoWriteToolSearchNotebookEditSleepSendUserMessageConfigREPLPowerShellbashtia_openness_get_project_statustia_openness_project_treetia_openness_list_devicestia_ope
//!   Nå­ä»£çæ æ³å¯å¨ï¼å·¥ä½åº provider_fallbacks éç½®ç primary æ¨¡å À
//!    çæä¾æ¹å­è¯ä¸å¯ç¨ï¼Àaï¼ãä¿®å¤ï¼ä¸ºè¯¥æä¾æ¹éç½®å­è¯ï¼æè°æ´å·¥ä½åºéç½®ä¸­ç provider_fallbacksã
//!    çå­è¯åæ ·ä¸å¯ç¨ï¼À
//!   该模型就是当前主模型，没有更低一级的回退
//!   å­ä»£çæ æ³å¯å¨ï¼æ¨¡å À
//!    çæä¾æ¹å­è¯ä¸å¯ç¨ï¼À
//!   。修复：在桌面端会话中运行（启动时会自动下发主模型）；或在调用里把 model 显式指定为本中继可用的模型；或为该提供方配置凭证（如 ANTHROPIC_API_KEY / OPENAI_API_KEY）。
//!   plc_corpus_findplc_corpus_readplc_experience_readplc_experience_updateProgressUpdatecrates\tools\src\tool_dispatch\core.rs

// TODO: 依上列契约实现 `core` 模块。
