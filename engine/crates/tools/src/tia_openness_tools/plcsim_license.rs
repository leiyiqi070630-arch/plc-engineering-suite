//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\plcsim_license.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 契约线索（截断）:
//!   Z` that the service exists and is RUNNING, and set it to start automatically: `Set-Service È
//!    -StartupType Automatic`.
//!   LIKELY CAUSE (unprobed â Àd): on Windows the most common reason for 'LicenseNotFound' at PLCSIM Advanced power-on is that the 'À
//!   ' (Automation License Manager) service is not running; the license itself is then fine. CHECK (read-only, no administrator needed): `sc query È
//!   ` â or `(Get-Service È
//!    -ErrorAction SilentlyContinue).Status`. If it is Stopped or missing, that is the cause: start it from an ADMINISTRATOR PowerShell with `Start-Service È
//!   ` plus `Set-Service È
//!    -StartupType Automatic`. If it is already Running, this is a genuine license problem instead (no license installed, expired, instance count exceeded, or dongle unplugged) and no s
//!   scthe service query returned no recognizable status
//!   could not query the service: À
//!   STOP_PENDINGPAUSE_PENDINGCONTINUE_PENDINGPAUSEDSTART_PENDINGRUNNINGSTOPPED1060PLCCODE_ALM_SERVICE_MISSING
//!   $s = Get-Service -Name 'À6' -ErrorAction SilentlyContinue; if ($null -eq $s) { 'À!' } else { $s.Status.ToString() }
//!   powershell-NonInteractive-Command-NoProfilelicensenotfoundlicense not founderrorcode:-30crates\tools\src\tia_openness_tools\plcsim_license.rs
//!   Runningstoppedstartpendingstoppendingpausedpausependingcontinuependingcreate-project-library-type--documents-directory--file-name-without-extension--target-environment-path--librar

// TODO: 依上列契约实现 `plcsim_license` 模块。
