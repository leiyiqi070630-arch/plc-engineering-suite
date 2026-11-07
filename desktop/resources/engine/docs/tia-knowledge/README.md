# TIA Portal / Openness Knowledge Base (V15–V21)

Knowledge base built to make PLC Engineering Suite's Siemens capability perform like a real engineer. Compiled 2026-06-13 by multiple agents from authoritative sources with independent adversarial re-verification.

## Curation rules (reuse and strengthen the existing evidence rules)

- Cite a source URL for every item. Priority: official first-party > Siemens GitHub > community.
- Treat the repo's existing `evidence/` notes as leads, not facts (repo content may be incomplete or incorrect). This knowledge base's conclusions were re-verified against official sources; where they conflict with the older notes, this base takes precedence.
- TIA facts are strongly version-dependent; label the applicable version on each item.

## Contents

**Architecture / format layer (batch 1)**
1. [Product and version timeline (V15–V21)](01-product-and-versions.md)
2. [S7-1200/1500 program model](02-program-model.md) — OB/FB/FC/DB, scan cycle, languages, data types
3. [TIA Openness .NET API](03-openness-api.md) — per-version assemblies/.NET, security gate, object model
4. [SimaticML / Openness XML import/export](04-simaticml-xml.md) — Export/Import, FlgNet, XSD/namespace versions, cross-version import rules
5. [SIMATIC SD text format (new in V20/V21)](05-simatic-sd.md) — s7dcl/s7res, grammar, version timeline

**Code-authoring layer (batch 2)**
6. [SCL language reference](06-scl-language.md) — declarations/operators/IF·CASE·FOR·WHILE·REPEAT/calling FB·FC/using timers in SCL
7. [Instruction set](07-instruction-set.md) — bit logic·edges/IEC timers·counters/compare·math/move·convert (incl. analog NORM_X·SCALE_X)/program control·shift
8. [LAD/FBD, block authoring, and control patterns](08-lad-fbd-and-patterns.md) — networks/EN·ENO/FB·FC authoring/official Styleguide/latch·interlock·one-shot·debounce·state machine

**Software-operation layer (batch 2)**
9. [TIA Portal software operation](09-tia-software-operation.md) — Portal/Project views, project tree, create project and add devices, compile, download, online monitoring, Watch/Force tables
10. [Hardware configuration and commissioning](10-hardware-config-and-commissioning.md) — device view, I/Q addresses, IP/PROFINET, online name/IP assignment, diagnostic buffer

**Code-generation deep-dive layer (batch 3, cross-verified across local real XML + generator + official docs)**
11. [FlgNet — LAD/FBD network XML](11-simaticml-flgnet-xml.md) — `<FlgNet>`/Parts/Wires/Access/Part/Call/NameCon/IdentCon, UId wiring graph (generator core)
12. [XML structure of blocks/interfaces/DB/UDT](12-simaticml-block-xml.md) — SW.Blocks.*/SW.Types.PlcStruct, Interface/Sections/Member/StartValue, NetworkSource wraps FlgNet vs StructuredText vs Graph
13. [Data types/literals/addressing](13-datatypes-literals-addressing.md) — type bit-widths and ranges, T#/LT#/S5T#/DTL# time literals, `%I0.0`/`%MW20`/`:P`/`P#`, SimaticML CamelCase Datatype
14. [Communication instructions](14-communication.md) — Modbus TCP (MB_CLIENT/MB_SERVER), RTU (Modbus_Comm_Load/Master/Slave), OUC (TSEND_C/TRCV_C/TCON_IP_v4), S7 (GET/PUT)
15. [PID/motion control/high-speed I/O](15-pid-motion-technology.md) — PID_Compact, MC_Power/Home/MoveAbsolute etc., axis TO, HSC/PWM

**HMI layer (batch 4, 2026-06-13~16, first-party verified against local PublicAPI XML)**
16. [HMI Openness (WinCC Unified authoring + Classic limitations)](16-hmi-openness.md) — Unified creation model, per-version assembly resolution, alarm/data-log property-name correction table, Classic XML-only, PlcTag binding

## PLC Engineering Suite engineer must-not-get-wrong checklist (high-risk points caught in re-verification)

- **Openness public key token**: `d29ec89bac048f84` applies only to **V16–V20**; **V21 changed it to `29bfe5fdf4ba5d3b`**. An old app.config will not bind to V21 assemblies.
- **SimaticML interface namespace** is not fixed at `.../SW/Interface/v2`; v2 is the legacy compatibility namespace from V14 SP1. V19 actually exports with **v5**, incrementing with each TIA version. (Easily confused: this is a separate version axis from the `.xsd` schema file version.)
- **SD-format block-level pragmas are per-version dialects** (verified on real hardware): V21 = `S7_Optimized`/`S7_PreferredLanguage`/`S7_Version`; **V20 uses `S7_Language` at block level, with no `S7_Version`**; neither uses `S7_Optimize_Access`. `S7_Language` is also the pragma before each NETWORK.
- SD LAD text has **no `WIRE w1` keyword** (fabricated by an earlier research pass); wire references are inline as `wire#w1` / `END_RUNG wire#w1`.
- **SD Openness API method names**: `ExportAsDocuments` is documented in the V20 official docs; its parameter is a `DirectoryInfo` plus a filename, not a `FileInfo`. Confirm the paired `ImportFromDocuments` signature and the V21 method names against the V20/V21 Openness API reference or the real `Siemens.Engineering` assembly before coding.
- **.NET target**: V16 is 4.6.x; V21 is 4.8.
- **HMI Unified alarm/data-log property names** (the bridge's community typings are almost all wrong across V16–V21, see chapter 16): correct names are `AlarmClass` (not `AlarmClassName`), `Area` (not `AreaName`), `Id` (not `GroupID`), analog `Condition`/`ConditionValue` (not `LimitMode`/`Limit`, and no `Hysteresis*`), alarm-class `Name` (not `DisplayName`), `HmiDataLog` has only `Name`/`Parent` (configuration lives in a nested `Settings`). **Correct as-is**: `PlcTag` binding, the four compositions + `Create`, `TriggerMode`, `Priority`. Unified types are **in the main assembly for V16–V19** and in `WinCCUnified.dll` for V21 — **do not look in `Siemens.Engineering.Hmi`**. Classic has no object `Create` in any version (XML import only). Reflect the real DLL to confirm property types/enum spellings before changing the bridge.
