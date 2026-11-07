# 05 · SIMATIC SD Text Format (new in V20/V21)

**SIMATIC SD** (SIMATIC Source Documents) is the **text/source-based** block interchange format introduced in Siemens **TIA Portal V20**, complementing the older XML-based SimaticML. Selling points: human-readable, editable in any text editor, diffable/mergeable, and aimed at **Git/SVN version control and CI**. This route was verified in depth by the 2026-07 real-machine matrix (148 import+compile cases each on V20/V21); grammar-level conclusions live in **SD_VERIFIED.md**.

Sources: **V20 official documentation page** (`docs.tia.siemens.cloud/r/en-us/v20/.../exporting-and-importing-blocks-in-simatic-sd-format-...`), **V20 Update 4 Readme** (109963851, 2025-09), **V20 cumulative Readme** (109963851, 2026-03), **V21 documentation page** (`docs.tia.siemens.cloud/r/en-us/v21/...`).

## File structure

Each SD export produces **a pair of files**:
- **`.s7dcl`** — program code (block declaration, declaration sub-sections, networks containing program code).
- **`.s7res`** — language-dependent (multilingual) comments/resources.

## Version timeline (capabilities by version/update)

| Version | Block types/languages SD supports | Verification |
|---|---|---|
| **V20 baseline** (2024-11-07) | **LAD-only blocks + DB + UDT**; **mixed-language blocks cannot be exported** | Official V20 documentation page |
| **V20 Update 4** (2025-09) | Adds **SCL + FBD + mixed-language** SD import/export; multilingual comment handling (S7_MLC); via Openness and VCI; SCL export **does not require an error-free compile** | UPD4 Readme |
| V20 Update 5/cumulative (2026-03) | Continues UPD4 content (cumulative Readme); reiterates that SCL textual-view import may lose data and that STL is unsupported | Cumulative Readme |
| **V21** (2025-11) | "Extended" to unified text interchange: LAD/FBD/SCL/**mixed-language** + OB/FB/FC/DB/UDT; VCI supports SD; Git integration | Official V21 documentation page (LAD/FBD/SCL/mixed/DB/UDT/Git) |

**STL is never supported in SD**: exporting a block that contains an STL network fails ("No support for STL in SIMATIC SD").

F-DB (fail-safe DB) is listed as SD-supported in the V20 update-level VCI table.

## Hard rules for import/export

- Know-how-protected blocks are **excluded** from SD import/export.
- Importing a same-named block **overwrites** it.
- **An error-free compile is not a precondition for export** — blocks that do not compile can still be exported.
- SCL textual interface-view import **may lose data** ("for the time being"); Siemens recommends checking consistency after import, or declaring variables in the tabular view.
- A pure-SCL `.s7dcl` that contains a network in another language fails to import (it needs the correct `{S7_EditorMode="SCL"}` semantics).
- LAD blocks created before V20 Update 4 **must be regenerated** before SD import; inconsistent MLC (multilingual comment) IDs cause export to fail (requires the `SimaticSdEnabler` add-in).

## S7DCL grammar (verified portions)

**Block-level pragma** (curly braces, before the block declaration) — **dialect differs by version** (2026-07 real-machine bidirectional verification):
```
V21: { S7_Optimized := "TRUE"; S7_PreferredLanguage := "LAD"; S7_Version := "0.1" }
V20: { S7_Optimized := "TRUE"; S7_Language := "LAD"; }
```
V20 uses `S7_Language` and has no `S7_Version` (feeding a V21 header to V20 raises "Block Language is not defined"); neither is `S7_Optimize_Access`. The V20 instruction template is also its own dialect (inline, unquoted `Add{ Card := 2; SrcType := Int; DisableENO := FALSE }`, uppercase ports, MIN uses lowercase `card`) — `tia_sd_generate_block` switches automatically by `schema_version`; when hand-writing, cross-check SD_VERIFIED.md.

**Per-NETWORK language pragma** (mixed-language blocks switch language per network with it):
```
{ S7_Language := "LAD" }   NETWORK ... END_NETWORK
{ S7_Language := "FBD" }   NETWORK ... END_NETWORK
{ S7_Language := "SCL" }   NETWORK ... END_NETWORK
```
`S7_Language` is **per-network**, not block-level.

**LAD network (verbatim official UPD4 example)**:
```
{ S7_Language := "LAD" }
NETWORK
  RUNG wire#powerrail
    Contact( #Tag_Input1 )
    Coil( #Tag_Output )
  END_RUNG
END_NETWORK
```
- `RUNG wire#powerrail` = starts from the power rail; branch numbering `wire#w1`, `wire#w2`...; referenced as `END_RUNG wire#w1`.
- Primitives: `Contact( #var )`, `Coil( #var )`.
- There is **no `WIRE w1` keyword**; a wire is the inline reference `wire#w1`.

**FBD network**: syntax is based on LAD, reusing `NETWORK/END_NETWORK`, `RUNG/END_RUNG`, and wire-numbered branches, but with **no power rail**; boxes are functional:
```
{ S7_Optimized := "TRUE"; S7_PreferredLanguage := "FBD"; S7_Version := "0.1" }
...
  A( in2 := #Tag_Input2 )
  O( in2 := wire#w1 )
  NOT A( ... )
  Coil( #Tag_Output )      // also I_Coil()
```

**SCL network**: program code sits between `NETWORK` and `END_NETWORK`, with syntax **identical to block SCL**; the interface view is selected by pragma:
- Tabular view: `{ S7_EditorMode = "SCL" }`
- Textual view: `{ S7_EditorMode = "[SCL, TextualInterface]" }`

**Multilingual comment marking (SCL SD)**:
- Single-line `//`; single-language multi-line `(*..*)`; multi-language multi-line is exported as `(/*..*/)`, and **on re-import** must be marked `{ S7_MLC := "MLC_myID" }`.

> 2026-07 update: set/reset coils, comparators, math boxes, timers/counters, and seal-in/OR wiring have been verified instruction-by-instruction on a real machine and encoded into `tia_sd_generate_block` (conclusion list in SD_VERIFIED.md); jumps/labels and the textual representation of DB/UDT bodies are not yet fully covered by the generator.

## Openness API (SD path)

`ExportAsDocuments` / `ImportFromDocuments` are implemented in this product's bridge and verified on V20/V21 real machines across 148×2 cases (tools: `tia_openness_export_block_sd` / `tia_openness_import_block_sd`) — the model does not need to write Openness C# directly.

## Relationship to SimaticML (XML)

The two are **parallel export formats**: a code block "can be exported as XML (`.xml`) or SIMATIC SD (`.s7dcl`+`.s7res`)" — Siemens documentation lists both as alternatives. SD is the newer text-based supplement.

## Sources

- V20 SD documentation page: `docs.tia.siemens.cloud/r/en-us/v20/creating-and-managing-blocks/exporting-and-importing-blocks-in-simatic-sd-format-s7-1200-s7-1500/...`
- V20 Update 4 Readme: `cache.industry.siemens.com/dl/files/851/109963851/att_1332651/v2/ReadMe_TIA_V20_UPD4_enUS.pdf`
- V20 cumulative Readme (2026-03): `cache.industry.siemens.com/dl/files/851/109963851/att_1359718/v1/ReadMe_TIA_V20_UPD5_enUS.pdf`
- V21 SD documentation page: `docs.tia.siemens.cloud/r/en-us/v21/.../exporting-and-importing-blocks-in-simatic-sd-format-s7-1200-s7-1500-s7-1200-g2`
- Community references: `github.com/heilingbrunner/tiaportal-mcp`; `domenicomadeo.com/.../TIA-Portal-V21-technical-slides-EN.pdf`
