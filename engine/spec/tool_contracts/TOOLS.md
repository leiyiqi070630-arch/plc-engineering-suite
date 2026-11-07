# 引擎工具契约（32 个）

> 来源：`plc-generator-corpus/contracts.json`，authority = `compiled mvp_tool_specs (source schema)`

| 工具 | 权限 | 参数数 | 必填 | 说明长度 |
| --- | --- | --- | --- | --- |
| `codesys_build_generate_code` | DangerFullAccess | 0 | — | 73 |
| `codesys_generate_st_plan` | WorkspaceWrite | 5 | name, implementation, confirm, disposable | 108 |
| `codesys_lad_generate_add` | DangerFullAccess | 3 | name, confirm, disposable | 140 |
| `codesys_lad_generate_block` | WorkspaceWrite | 8 | name, networks, confirm, disposable | 248 |
| `codesys_lad_generate_contact_block` | WorkspaceWrite | 4 | plan, confirm, disposable | 1615 |
| `codesys_lad_generate_control_recipe` | ReadOnly | 5 | recipe, name | 441 |
| `codesys_lad_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable | 139 |
| `codesys_lad_generate_native` | WorkspaceWrite | 8 | name, networks, confirm, disposable | 5207 |
| `codesys_lad_generate_native_template` | WorkspaceWrite | 4 | instruction, name, confirm, disposable | 347 |
| `codesys_lad_generate_project_pou` | WorkspaceWrite | 6 | name, networks, confirm, disposable | 14530 |
| `codesys_lad_generate_recipe_plan` | ReadOnly | 4 | recipe | 307 |
| `codesys_lad_native_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable | 218 |
| `codesys_lad_native_generate_instruction_batch` | DangerFullAccess | 8 | name, networks, confirm, disposable | 624 |
| `inoproshop_lad_generate_add` | DangerFullAccess | 3 | name, confirm, disposable | 66 |
| `inoproshop_lad_generate_block` | DangerFullAccess | 3 | plan, confirm, disposable | 900 |
| `inoproshop_lad_generate_contact_block` | DangerFullAccess | 4 | plan, confirm, disposable | 112 |
| `inoproshop_lad_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable | 83 |
| `inoproshop_lad_native_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable | 199 |
| `inoproshop_lad_native_generate_instruction_batch` | DangerFullAccess | 8 | name, networks, confirm, disposable | 624 |
| `inoproshop_object_regenerate` | DangerFullAccess | 8 | target, kind, confirm, disposable | 748 |
| `mitsubishi_csv_generate` | ReadOnly | 3 | family, rungs | 1016 |
| `mitsubishi_label_csv_generate` | WorkspaceWrite | 4 | path, labels | 648 |
| `tia_hmi_generate_list_xml` | WorkspaceWrite | 2 | plan | 1901 |
| `tia_hmi_generate_screen_xml` | WorkspaceWrite | 2 | plan | 2808 |
| `tia_lad_generate_block_xml` | WorkspaceWrite | 8 | — | 555 |
| `tia_lad_generate_recipe_plan` | ReadOnly | 5 | recipe_id, block_name | 372 |
| `tia_openness_generate_graph_block` | WorkspaceWrite | 3 | plan | 2744 |
| `tia_openness_generate_loadable_file` | DangerFullAccess | 9 | device_name, output_path, confirm | 414 |
| `tia_openness_generate_source_from_blocks` | DangerFullAccess | 8 | output_path, confirm | 561 |
| `tia_openness_generate_web_pages_blocks` | DangerFullAccess | 9 | html_directory, default_page, confirm | 568 |
| `tia_sd_generate_block` | WorkspaceWrite | 3 | plan | 315 |
| `tia_watch_generate_table_xml` | WorkspaceWrite | 3 | plan | 458 |

## 逐个工具的说明首句

- **`codesys_build_generate_code`** (DangerFullAccess) — Run the active application's code-generation pass and return diagnostics.
- **`codesys_generate_st_plan`** (WorkspaceWrite) — Write a validated InoProShop ST body through the bridge POU route (pou.upsert)
- **`codesys_lad_generate_add`** (DangerFullAccess) — Generate one parameterized IEC ADD ladder POU from the verified PLCopen sample, import it through InoProShop, export native XML, save, comp…
- **`codesys_lad_generate_block`** (WorkspaceWrite) — Compatibility alias for the canonical batch generator: calls bridge operation lad.native_generate_instruction_batch with the same one-POU instruction-network schema
- **`codesys_lad_generate_contact_block`** (WorkspaceWrite) — Canonical contact/timer LAD generator: calls lad.generate_contact_block once with the exact plan schema below, imports the native graph, saves it, and returns independent precompile/compile diagnostics
- **`codesys_lad_generate_control_recipe`** (ReadOnly) — Compose a complete pump station contact/timer plan from a high-level control recipe
- **`codesys_lad_generate_instruction`** (DangerFullAccess) — Resolve one installed LD/FBD signature and generate an exact-port parameterized LAD POU, then import, native-readback, save and compile it…
- **`codesys_lad_generate_native`** (WorkspaceWrite) — Canonical batch generator for the InoProShop instruction surface (260-entry verified core registry, trimmed 2026-09-08: counters CTU/CTD/CTUD, timers TON/TOF/TP, latch SR, edges R_TRIG/F_TRIG, BLINK, PLUS the full native-Operator set â€” comparison boxes EQ/NE/GT/GE/LT/LE, logic AND/OR/XOR/NOT, arit
- **`codesys_lad_generate_native_template`** (WorkspaceWrite) — NOT a prerequisite â€” SR/BLINK/TON/TOF/TP/CTU/CTD/CTUD/R_TRIG/F_TRIG shapes are already inline in codesys_lad_generate_native's description
- **`codesys_lad_generate_project_pou`** (WorkspaceWrite) — CANONICAL vanilla-CODESYS (SP22, CODESYS Ladder plugin) LAD generator
- **`codesys_lad_generate_recipe_plan`** (ReadOnly) — Build a structured native InoProShop LAD generation plan from a verified recipe
- **`codesys_lad_native_generate_instruction`** (DangerFullAccess) — ALIAS — call codesys_lad_generate_native instead; legacy/diagnostic use only
- **`codesys_lad_native_generate_instruction_batch`** (DangerFullAccess) — ALIAS — call codesys_lad_generate_native instead; legacy/diagnostic use only
- **`inoproshop_lad_generate_add`** (DangerFullAccess) — InoProShop alias for the verified parameterized ADD LAD generator.
- **`inoproshop_lad_generate_block`** (DangerFullAccess) — Topology-free LAD writer (networks: instruction_box, timer, fb_call, move)
- **`inoproshop_lad_generate_contact_block`** (DangerFullAccess) — Alias of codesys_lad_generate_contact_block; identical schema, plan validation, native writer and compile gates.
- **`inoproshop_lad_generate_instruction`** (DangerFullAccess) — InoProShop native alias for exact-port parameterized LD/FBD instruction generation.
- **`inoproshop_lad_native_generate_instruction`** (DangerFullAccess) — ALIAS — call codesys_lad_generate_native instead; legacy/diagnostic use only
- **`inoproshop_lad_native_generate_instruction_batch`** (DangerFullAccess) — ALIAS — call codesys_lad_generate_native instead; legacy/diagnostic use only
- **`inoproshop_object_regenerate`** (DangerFullAccess) — Replace a GVL or native LAD POU in one delete->recreate call
- **`mitsubishi_csv_generate`** (ReadOnly) — Generate a Mitsubishi GX Works2 list-format PROGRAM CSV (FX2/FX3) from structured rungs
- **`mitsubishi_label_csv_generate`** (WorkspaceWrite) — Write a byte-correct Mitsubishi GX Works2 GLOBAL-LABEL CSV (labels.csv) from a structured label plan
- **`tia_hmi_generate_list_xml`** (WorkspaceWrite) — Generate a classic HMI TEXT LIST or GRAPHIC LIST (WinCC Basic/Comfort panels, TIA V16-V21) as SimaticML XML from a structured plan
- **`tia_hmi_generate_screen_xml`** (WorkspaceWrite) — Generate a Classic HMI SCREEN as SimaticML XML from a structured plan (TIA V16-V21)
- **`tia_lad_generate_block_xml`** (WorkspaceWrite) — Use: Generate and validate one complete LAD (ladder) XML plan, V16-V21; V19+ uses V18 XML.
When: Supply plan plus output_path/output_directory for a file; callee_interfaces for calls; classic CPUs need target_family/block_number.
Avoid: Invented pins, TEMP timer state or hand-spliced FlgNet
- **`tia_lad_generate_recipe_plan`** (ReadOnly) — Generate an already locally validated structured LAD plan from a recipe_id (e.g
- **`tia_openness_generate_graph_block`** (WorkspaceWrite) — Generate a real GRAPH (sequential function chart) FB as TIA Openness SimaticML XML from a plan of named steps
- **`tia_openness_generate_loadable_file`** (DangerFullAccess) — Generate a loadable file from blocks or whole units via the LoadableProvider (Siemens.Engineering.SW.Loader.LoadableProvider.GenerateLoadable, Openness manual 5.11.3.29/5.11.6.13)
- **`tia_openness_generate_source_from_blocks`** (DangerFullAccess) — Generate a UTF-8 source FILE from selected supported blocks via PlcExternalSourceSystemGroup.GenerateSource
- **`tia_openness_generate_web_pages_blocks`** (DangerFullAccess) — Generate the user-defined web page DB blocks (WebserverUserDefinedPages.GenerateBlocks — the WWW route) from a local HTML directory into the active TIA project
- **`tia_sd_generate_block`** (WorkspaceWrite) — Use: Validate and generate a complete SIMATIC SD FB/FC/OB plan.
When: V20/V21 authoring; output_directory writes BOM/CRLF .s7dcl + .s7res.
Avoid: Using SD on V16-V19; use LAD XML there.
Next: Resolve a concrete unsupported shape with instruction_spec; import the paired documents and obtain a final c
- **`tia_watch_generate_table_xml`** (WorkspaceWrite) — Generate a real TIA watch-table SimaticML document (.xml) from a structured plan
