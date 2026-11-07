# tia_lad_instruction_spec — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

Look up the minimal instruction_box shape for LAD part_names (e.g. Add, Move, Eq, CTU, Scale_X, Convert, PID_Compact, MC_Power): required pins, POWER vs DATA pins, auto-filled template/version, instance need, plus an example_network. Query SEVERAL parts at once with part_names (array) — each is answered with its own spec, timer names (TON/TOF/TP/TONR) come back with the timer-network shape, and unknown names with a redirect, so one call replaces the per-instruction query loop. Local ok:true is shape-level only; tia_openness_import_block_xml compile is definitive. Query it for an unknown required instruction/pin shape or a concrete generator/import error. Reuse already-known shapes.
