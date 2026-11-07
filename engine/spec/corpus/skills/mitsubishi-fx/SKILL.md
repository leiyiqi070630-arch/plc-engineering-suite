---
description: On-demand knowledge for the Mitsubishi route: the FX2/FX3 GX Works2 file route (ST structured text + GX MAIN CSV ladder/list) and the MC-protocol online read channel (mitsubishi_mc_*, MELSEC Communication 3E frame). Load when the turn involves FX2N/FX2NC/FX3U/FX3UC or a Q/L/iQ-R/FX5 CPU, writing ST or GX CSV, reading a live Mitsubishi PLC over Ethernet, or needs precise device-addressing / instruction / control-flow / format facts. Provides directly usable route facts plus source-of-truth pointers.
---

# Mitsubishi FX2/FX3 Knowledge (GX Works2)

On-demand knowledge. You are a capable PLC engineer — the facts below are for this route; use them directly. Only items explicitly marked as varying by CPU subtype need confirmation via lint/manual. This supports the write → confirm result via lint/import → record experience loop; it does not replace lint.

## Sources of truth (consult when an item varies)

- **lint**: the `plc_lint` profiles `mitsubishi.fx3.csv` / `mitsubishi.fx2.csv` / `mitsubishi.fx3.st` / `mitsubishi.fx2.st`. Run it after editing code; it deterministically flags format, octal-addressing, and control-flow pairing errors, and states the violated rule at the point of violation.
- **Rule source**: `lint_plc/fx3lint/` (CSV, octal, control-flow consistency) and the ST rule modules. Each rule's official basis is recorded in the `evidence_level` field of the profile JSON.
- **Official manuals**: FXCPU Structured Programming Manual [Device/Common] JY997D26001; FX Series Programming Manual II JY992D88101 (FX2N/FX2NC devices and instructions); GX Works2 Operating Manual (Simple Projects) SH-080780ENG §6.16/§9.2 (CSV format); Structured Project Manual SH-080781ENG (ST).

## Device addressing

- **X/Y are octal**: there is no X8/X9/Y8/Y9; numbering runs X0–X7, X10–X17, X20…, and likewise for Y. This is the most commonly mis-written detail.
- Octal applies to the **decorated** forms too, not just a bare `X0`: a digit-specification prefix (`K2X000`) and an index-register suffix (`X0Z0`) still carry an octal bit number, so `K2X8` / `X8Z0` are just as illegal as `X8`. Lint checks all three shapes.
- **There is no SM or SD area on FX2/FX3.** Special relays live in **M8000–M8511** and special registers in **D8000–D8511**. `SM400`/`SD100` are iQ-F(FX5U)/iQ-R devices; GX Works2 FX compilation rejects them (C5003). Common mapping: SM400→M8000 (always ON), SM401→M8001 (always OFF), SM402→M8002 (first scan), SM412→M8013 (1 s clock).
- Index registers are **V0–V7, Z0–Z7** (8 each on FX3U) — a fixed set, not arbitrary numbering.
- Digit specification **K1–K8** with X/Y/M/S: each K denotes 4 bits (K1=4 bits, K4=16 bits=word, K8=32 bits); K5–K8 are only for 32-bit operations.
- M (auxiliary relay), S (state), T (timer), C (counter), D (data register) are numbered in decimal. **Exact number ranges vary by CPU subtype** (FX2N vs FX3U differ) → confirm against lint/manual; do not extrapolate from one model to another.

## Instructions

- Transfer: `MOV`, double-word `DMOV`, float `EMOV`.
- Modifier combinations (verified against real exports): suffix `P` = pulse (rising-edge) execution, prefix `D` = 32-bit; they stack — `MOVP`, `ADDP`, `DMOVP`, `DADDP` are all valid instruction forms.
- Comparison contacts: `LD=` / `AND>` / `OR<=` etc. are valid contact instructions.
- Edge contacts: `LDP` / `LDF` (rising / falling edge).
- Reset: write `RST T0` / `RST C0` / `RST D0` — there is **no** underscore instruction name like `RST_T` / `RST_C`.
- Pulse `PLS` / `PLF` and set/reset `SET` / `RST` are used per standard.

## Control-flow pairing (lint checks this; pair it up during generation)

- The target of `CJ` / `CALL` must be a pointer label (`P0`, `P10`…) already defined in the **instruction column**. **`P63` is an exception**: it is the reserved "jump to END" pointer, `CJ P63` is valid, and defining P63 as a label is **forbidden**.
- Master control `MC N0 …` must be closed by a matching `MCR N0`; nesting levels are **N0–N7**.
- Step-ladder `STL` (state S) sections end with `RET`.

## GX MAIN CSV format (list / ladder import)

- **Tab-separated** (TAB), not commas — GX Works2 does not accept comma separation.
- The final on-disk encoding is **UTF-16LE + BOM, CRLF** (GX Works2 does not accept plain UTF-8 files) — but **you only write UTF-8 into the workspace**; on desktop save (promote) it is automatically re-encoded to the on-disk form above. Each cell is wrapped in **one layer of double quotes** (e.g. `"LD"`, blank `""`).
- Three-line preamble: the project-title row, the `PLC信息:` / `PC情報:` row (**varies with the GX Works2 UI language** — a Japanese UI uses `PC情報:`) carrying the `FXCPU` model, and the 7-column header row. Instruction rows have all 7 cells filled. CSV lint validates these; follow it.
- A network statement is a separate inter-line declaration row (step number / instruction empty); a `line_statement` is at most 64 GX text units (half-width = 1, full-width = 2), and must be split across rows when too long. Put ordinary notes in the note column of the instruction row, not in the PI declaration column.
- The step number is GX's real instruction step address, not a simple per-row increment; multi-operand instructions like MOV/ADD place the instruction and first operand on the first row only, with each subsequent operand on its own continuation row with empty step number / empty instruction. Leave generation and renumbering to `mitsubishi_csv_generate`.
- The program ends with `END`; there are no instruction rows after `END`.
- Pointer labels (P0 / I001) go in the **instruction column**. The PI declaration column is **always empty** in real exports and the generator does not support filling it — put label descriptions in the note.
- Column numbers and blank-column / PI-column details → leave to CSV lint, which flags violations on the spot; no need to memorize them.

## FX2 vs FX3 boundaries

- FX2 (FX2N/FX2NC) and FX3 (FX3U/FX3UC) are **different GX Works2 project types**. Do not assume FX3U-only word-device bit access or instruction availability applies to FX2, or vice versa; confirm availability against the relevant CPU manual / lint.
- Neither is GX Works3 / FX5: do not use FX5's `D[Z0+K1]` indexing, module labels, or inline AT address binding.

## Online read channel: MC protocol (`mitsubishi_mc_*`) — offline-proven, NOT hardware-verified

The Mitsubishi route is no longer file-only: `mitsubishi_mc_probe` / `mitsubishi_mc_read_bits` / `mitsubishi_mc_read_words` read a live CPU over the MELSEC Communication (MC) protocol, 3E frame, binary code, TCP or UDP. It is the Mitsubishi counterpart to `siemens_s7_*`. **Read-only by construction** — batch write (1401), random write and remote RUN/STOP are not implemented, so there is no way to disturb a running machine with it.

**State this honestly, every time.** The channel has never completed a round trip against a real Mitsubishi PLC, and it cannot be verified on this bench: there is no Mitsubishi PLC here and no GX Works installation. What *is* proven is the wire format — every constant, device code, radix and point limit is transcribed from the official MELSEC Communication Protocol Reference Manual **SH(NA)-080008-AB** (§8.1 device code list, §8.2 batch read), and the unit tests replay the manual's own byte-level communication examples. So: the bytes are right on paper; the round trip is unproven. Every result carries `verified:false` plus that disclaimer. Present readings as advisory and tell the user to cross-check GX Works monitoring before acting on them.

### Prerequisites the user must satisfy first

- **There is no protocol-fixed MC port.** The port is whatever the GX Works2/GX Works3 Ethernet parameters assign to the MC/SLMP connection. The tools default to 5000 when the port is omitted; that is a convention, not a standard.
- The CPU answers nothing at all until an **MC Protocol connection is added in the Ethernet module's external-device / connection configuration** (protocol, TCP or UDP, port), then **compiled and downloaded**. A connect-refused or timeout error from these tools already spells this out.
- The connection's **communication data code must be Binary**, matching this channel. An ASCII-configured connection answers end code `0xC06F` / `0xC050`.
- On TCP a given connection normally serves **one client at a time**; a second master gets refused.

### Reach, per CPU family

- **Q / L / iQ-R** — the target this channel is written against; device numbers use the Q/L subcommand set (0000/0001), so the device-number field is 3 bytes and numbers above `0xFFFFFF` are out of reach. The iQ-R 4-byte extension (subcommands 0002/0003) is not implemented.
- **FX5 / iQ-F** — has an Ethernet port and speaks MC, but **two device families are numbered differently there**, verified in JY997D60801-G §4.2: `X`/`Y` follow the connection's configured message format (`X,Y OCT` vs `X,Y HEX`), and `ZR` is decimal where Q/L makes it hexadecimal. The tools assume the Q/L convention and flag it in `addressRadixWarning`. On FX5 prefer `M`/`D` (identical on both) or confirm against GX Works3 monitoring.
- **FX3U** — reaches Ethernet MC **only through an FX3U-ENET / FX3U-ENET-ADP module**. The FX programming port is not MC-over-Ethernet. Old A-series and FX3U-ENET also use the **1E frame**, which is deliberately not implemented (different header and device-spec layout, not transcribed from a manual — so it is absent rather than guessed). A 4E-frame response is detected and reported, not parsed.
- **FX2N/FX2NC** — no Ethernet MC path in this route at all.

### Device addressing facts (from SH-080008 §8.1, and easy to get backwards)

- A Mitsubishi timer is **three separate devices**: contact `TS`, coil `TC`, current value `TN`. The bare name `T` addresses none of them, and the tools refuse `T100` with exactly that explanation. Same for counters (`CS`/`CC`/`CN`) and retentive timers (`STS`/`STC`/`STN`, spelled `SS`/`SC`/`SN` in the Q/L manuals — both accepted).
- Only the **current value** of a timer/counter is a word device; contacts and coils are bit devices. So `TN100` goes to `read_words`, `TS100` to `read_bits`.
- **`R` is decimal but `ZR` is hexadecimal** on Q/L. Likewise `SB`/`SW` are hexadecimal while `SM`/`SD` are decimal. Do not generalise from the first letter.
- **A word-unit read of a bit device returns 16 devices per point.** A 2-word read of `M100` covers `M100..M115` and `M116..M131`; the results label the spans that way rather than pretending point 2 is `M101`.
- The "head device number must be a multiple of 16" rule that circulates for word-unit bit reads is **MELSEC-A-series only** — SH-080008 §8.2 scopes it to A-series modules, and the manual's own Q/L example reads `M100`. Do not impose it on Q/L/iQ-R.
- Single-read ceilings are hard protocol limits, not tool policy: **960 points** word units, **3584 points** bit units (the E71/Ethernet binary figure; ASCII and the serial C24 module differ). Split larger reads across calls.

### How to verify it for real, when hardware appears

A Q/L/iQ-R or FX5 CPU with an MC connection downloaded, plus one `mitsubishi_mc_probe` that returns the true CPU model name, would settle the frame layout and the routing header in a single call. After that, read a device whose value is known from GX Works monitoring and compare. Until someone does that, do not upgrade the wording anywhere from "offline-proven" to "works".

## Boundaries

- ST-route global variables are declared in `labels.csv`; do not create local VAR blocks inside the program body.
- Special-device (M8000 range) semantics, exact device capacities, and K/H literal ranges follow the CPU manual / lint; do not extrapolate across subtypes.
- The `mitsubishi_mc_*` online read channel above is a separate, read-only Ethernet channel, not part of this file route: `plc_lint` says nothing about it, and it has never been run against real hardware.
- **This is a file route: passing lint does NOT prove the file imports.** Lint proves the file matches the shapes proven by the real GX Works2 exports this product ships against. Never claim a file "imports into GX Works2" — say it passes lint and let the user confirm the import.
- The **step-number column** is only exact for the instruction/operand shapes covered by those real exports. Timer/counter coils (`OUT T0` + `K50`), `LD/SET/RST` on T/C/S, `MC`/`MCR` and `STL`/`RET` are NOT covered — the generator counts +1 for them and says so in a `fx.csv.generator_step_evidence` hint. Do not silence that hint by inventing step sizes.
- **`PI声明` cannot be filled**: no real export shows a non-empty PI Statement cell, so the generator rejects `pi_statement` outright. A P/I label itself goes in the instruction column.
- The **FX2 route means FX2N/FX2NC**. FX2/FX2C exists in GX Works2 but is out of this product's route set; lint will read such a file and only note the model difference.
- Full evidence status, including what is extrapolated and what cannot be verified without GX Works2 installed: `docs/plc-rules/fx-gxworks2-delivery-boundaries.md`.
