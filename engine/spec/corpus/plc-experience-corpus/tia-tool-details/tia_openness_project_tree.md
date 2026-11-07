# tia_openness_project_tree — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

Browse the active Siemens TIA Portal project tree, returning deterministic paths for devices, blocks, data types and tag tables. PLC tag table members are not expanded: tags=null with tagsIncluded=false means unread, not empty/deleted. Use tia_openness_list_tags for actual tags. Resolve paths here before editing. A tree too large for the runtime's per-result budget reaches the model as a SAMPLE of each region: verified=false with resultComplete=false, truncated=true and verificationScope="transport_and_route_only" marks it, and issues[].detail names every sampled path with its full count — do not conclude that objects outside the sample do not exist.
