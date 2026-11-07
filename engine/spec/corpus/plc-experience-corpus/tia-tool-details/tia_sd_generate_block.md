# tia_sd_generate_block — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

Generate real SIMATIC SD (.s7dcl + .s7res) directly from a structured FB/FC/OB plan. The generator validates the plan in the same call and writes byte-correct UTF-8 BOM/CRLF documents when output_directory is provided. It covers bit logic, comparisons, moves, IEC timers/counters, math, edges, generic boxes/calls, communication, motion, and PID catalog instructions. SD is available on TIA V20/V21; V16-V19 return the LAD XML route. Import the completed generated set and use one final compile verdict; instruction_spec and validate_plan are optional diagnostics for a concrete unsupported-plan result.
