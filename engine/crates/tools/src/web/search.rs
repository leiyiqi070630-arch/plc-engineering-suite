//! 模块骨架
//! 模块路径: crates\tools\src\web\search.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: PLC_CODE_WEB_READER_BASE_URL
//! CLI/参数: --project-id, --runtime-timeout-ms
//! 相关中文说明: 1 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   tia_plcsim_advanced_write_process_valuesMW10:INT=1234writing absolute process values mutates virtual-controller memoryplcsim-advanced-write-areaplcsim_advanced_write_process_values
//!   --runtime-manager-pathwincc_unified_full_download requires project_id as a hyphenated GUID
//!   runtime_timeout_ms must be between 1000 and 120000
//!   wincc-unified-full-download
//!   --archive-sha256ñç?C
//!   --project-id
//!   --runtime-timeout-ms
//!   --replace-existingwincc_unified_full_download requires archive_sha256 as 64 hexadecimal digits
//!   wincc_unified_full_download requires archive_path
//!   wincc_unified_full_download requires confirm=true
//!   wincc-unified-stop-projectwincc_unified_stop_project
//!   wincc-unified-list-projects--running-onlywincc_unified_project_state requires project_id as a hyphenated GUIDwincc-unified-project-stateñç?C
//!   --simulationwincc-unified-start-projectwincc_unified_start_projectÀ) requires project_id as a hyphenated GUID
//!    requires confirm=true
//!   crates\tools\src\web\domain.rs
//!   https://html.duckduckgo.com/html/qcrates\tools\src\web\search.rs
//!   reader 兜底已禁用（PLC_CODE_WEB_READER_BASE_URL 为空）PLC_CODE_WEB_READER_BASE_URL

// TODO: 依上列契约实现 `search` 模块。
