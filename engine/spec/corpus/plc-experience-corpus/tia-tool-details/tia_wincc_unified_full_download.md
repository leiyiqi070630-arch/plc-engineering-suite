# tia_wincc_unified_full_download — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

Load an existing WinCC Unified Full Runtime ZIP with Siemens Runtime Manager, retaining the current Runtime user administration (-keepUmc). Requires the archive SHA-256, its exact ProjectInfo ProjectId, and confirm=true. Validates the manifest and files before invoking Siemens. Registers a real Project; simulation is not supported by this Siemens command. An existing real project with the same GUID requires replace_existing=true and may be stopped/replaced. This does not generate the ZIP, configure engineering passwords, start Runtime, or verify the HMI appearance. Inspect native status and independent project readback before calling start.
