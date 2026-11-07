# tia_lad_list_program_recipes — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

List program-level Siemens LAD recipes (motor seal-in, forward/reverse interlock, fault latch/acknowledge, permissive chains, valve open/close interlocks, pump duty/standby, mode gating, discrete tank control) for planning common LAD structures instead of ad-hoc networks. Recipes only compose implemented/guarded LAD patterns; blocked recipes are not claimable until real XML templates exist and import/compile proves them. Use this ONLY when the user explicitly requests one of the built-in recipes above. A complex or custom program goes straight to tia_lad_generate_block_xml per block plus one dependency-ordered batch import - recipe browsing is not the default authoring path.
