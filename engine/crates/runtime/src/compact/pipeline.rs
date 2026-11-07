//! 模块骨架
//! 模块路径: crates\runtime\src\compact\pipeline.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: CLAUDE_CODE_AUTO_COMPACT_INPUT_TOKENS
//!
//! 契约线索（截断）:
//!   Before providing the final summary, wrap your analysis in <analysis> tags and check:
//!   1. The user's explicit requests and intent, including corrections and preference changes.
//!   2. The approach taken, important decisions, and architecture/code patterns.
//!   3. Specific file names, functions, configuration keys, tests, commands, and errors.
//!   4. What was fixed, what failed, and what remains pending.
//!   5. The exact current work immediately before compaction.
//!   Your <summary> block must include these sections:
//!   1. Primary Request and Intent
//!   2. Key Technical Concepts
//!   3. Files and Code Sections
//!   4. Errors and Fixes
//!   5. Problem Solving
//!   6. All User Messages
//!   7. Pending Tasks
//!   8. Current Work
//!   9. Optional Next Step
//!   Do not invent facts. If something is unknown, say it is unknown. The next assistant will use this summary as the only durable memory for compacted messages.
//!   REMINDER: Do NOT call any tools. Respond with plain text only: an <analysis> block followed by a <summary> block.CLAUDE_CODE_AUTO_COMPACT_INPUT_TOKENS
//!   0warning: auto-compaction threshold clamped from À
//!    input tokens (À
//!   % of the model's Àm-token context window). A threshold above the window can never fire before the provider rejects the request.
//!   [compact_prompt_too_long_retry]
//!   assistant stream ended without a message stop eventassistant stream produced no contentassistant stream completed with reasoning but no final text or tool call
//!   crates\runtime\src\compact\pipeline.rs
//!   This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

// TODO: 依上列契约实现 `pipeline` 模块。
