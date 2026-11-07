---
description: On-demand knowledge for the Siemens S7-200 (STEP 7-Micro/WIN) STL / AWL statement-list route. Load when the turn involves S7-200 / S7-200 SMART, writing AWL/STL statement list, or needs precise addressing and mnemonic facts. Provides directly usable route facts and boundaries.
---

# Siemens S7-200 STL / AWL

On-demand knowledge. You are a capable PLC engineer — below are the facts for this route, **use them directly**. On the S7-200, "AWL" is the German name for Statement List and is synonymous with STL. Items marked "per manual" (CPU-specific ranges / time bases) are to be looked up.

## Which route this is / is not

- Target: **S7-200 STL / statement list in STEP 7-Micro/WIN** (and Micro/WIN SMART for S7-200 SMART).
- **Do not** generate: S7-300/400 AWL (different mnemonics and block model), TIA Portal SCL, IEC ST, LAD ASCII.
- **S7-200 has no SCL**: Micro/WIN has only LAD / FBD / STL. Text means STL, not SCL; do not use `:=` assignment, `IF/THEN/END_IF`, or `WORD#`-style type literals. **Note**: real Micro/WIN exports of SUBROUTINE/INTERRUPT blocks natively carry `VAR_INPUT`/`VAR_OUTPUT`/`VAR`…`END_VAR` local variable tables (declarations of the form `name:TYPE;`) — keep them, that is not SCL.
- **Real `.awl` file shape** (verified against real exports): `ORGANIZATION_BLOCK MAIN:OB1` (underscore) … `BEGIN` … `END_ORGANIZATION_BLOCK`; subroutines `SUBROUTINE_BLOCK name:SBRn` and `INTERRUPT` blocks follow the same pattern; every complete block must have its own `BEGIN` before its first `Network`.
- **PLC Code encoding boundary**: the AI reads and writes the runtime staging copy, which must always stay UTF-8; do not manually convert to ANSI/GBK with PowerShell/iconv and the like. The real `.awl` ANSI (GBK in a Chinese locale) + CRLF form is produced uniformly by the desktop `Ctrl+S` save-promotion step; manually transcoding staging makes `read_file`/`plc_lint` report `invalid utf-8 sequence`.

## Addressing

- Memory areas: `I` input image, `Q` output image, `M` bit memory, `V` variable memory, `SM` special memory, `T` timers, `C` counters, `AI`/`AQ` analog, `HC` high-speed counters, `AC` accumulators.
- Bit access is **byte.bit** with bit numbers **0–7**: e.g. `I0.0`…`I0.7`, `Q0.0`, `M0.0`, `V0.0`.
- Byte/word/double word: `VB100` (byte), `VW100` (word), `VD100` (double word); I/Q/M likewise have `IB`/`IW`/`ID`, etc.
- Common special bits: `SM0.0` always 1 (always-on), `SM0.1` is 1 only on the first scan.
- Byte-addressed operands occupy a **span**, so the ceiling applies to the last byte touched: `VW n` uses bytes n..n+1 and `VD n` uses n..n+3. On a CPU 224 (`VB0` to `VB8191`) the last legal word is `VW8190`, not `VW8191`.

### Memory ranges (verified against the vendor tables)

Classic — S7-200 System Manual, Table 6-1 "Memory Ranges and Features"; SMART —
S7-200 SMART System Manual V2.6 (A5E03822230-AJ), appendix E.5.

| Area | Classic (CPU 221/222/224/224XP/226) | S7-200 SMART (firmware V2.5+) |
|---|---|---|
| Process-image input `I` | `I0.0`–**`I15.7`** | `I0.0`–**`I31.7`** |
| Process-image output `Q` | `Q0.0`–**`Q15.7`** | `Q0.0`–**`Q31.7`** |
| Bit memory `M` | `M0.0`–`M31.7` | `M0.0`–`M31.7` |
| SCR relays `S` | `S0.0`–`S31.7` | `S0.0`–`S31.7` |
| Counters `C` | `C0`–`C255` | `C0`–`C255` |
| Timers `T` | `T0`–`T255` | `T0`–`T255` |
| High-speed counters `HC` | `HC0`–`HC5` | `HC0`–`HC5` (`HC0`–`HC3` on CRxx) |
| Accumulators `AC` | `AC0`–`AC3` | `AC0`–`AC3` |
| Local `L` | `LB0`–`LB63` | `LB0`–`LB63` |
| Jumps/labels, interrupt routines, PID loops | `0`–`255`, `0`–`127`, `0`–`7` | `0`–`255`, `0`–`127`, `0`–`7` |

- **The process image is the one range where classic and SMART really differ** — do not carry `I0.0`–`I31.7` back to a classic CPU, and do not reject `I20.0` on a SMART CPU.
- CPU-specific rows — supply the model and use its exact row:
  - Variable memory `V`: CPU 221/222 `VB0`–`VB2047`, CPU 224 `VB0`–`VB8191`, CPU 224XP/226 `VB0`–`VB10239`. SMART: CRxx and SR20/ST20 `VB0`–`VB8191`, SR30/ST30 `VB0`–`VB12287`, SR40/ST40 `VB0`–`VB16383`, SR60/ST60 `VB0`–`VB20479`.
  - Analog `AIW`/`AQW`: classic `AIW0`–`AIW30` (CPU 221/222) or `AIW0`–`AIW62` (CPU 224/224XP/226); SMART `AIW0`–`AIW110`.
  - Special memory `SM`: classic up to `SM179.7` (221) / `SM299.7` (222) / `SM549.7` (224/224XP/226); SMART up to `SM2047.7`. Read-only regions: classic `SM0.0`–`SM29.7`; SMART `SM0.0`–`SM29.7` **plus** `SMB480.0`–`SM515.7` and `SM1000.0`–`SM1699.7`.
  - Subroutine numbers: classic `0`–`63` (`0`–`127` on CPU 226); SMART `0`–`127`.
- `plc_lint` enforces all of the above. Pass `project:{model:"CPU 224"}` (or `"ST40"`) so the CPU-specific ceilings tighten to that CPU — without a model it falls back to the widest value in the family and can only under-report.

## Mnemonics (statement list)

- Load/contacts: `LD` / `LDN` (load NO/NC), `A` / `AN` (AND / AND NOT), `O` / `ON` (OR / OR NOT).
- Edges: `EU` (rising edge), `ED` (falling edge).
- Outputs: `=` (assignment coil), `S` / `R` (set/reset, with bit count).
- Move: `MOVB` / `MOVW` / `MOVD` / `MOVR` (byte/word/double word/real).
- Integer arithmetic: `+I` / `-I` / `*I` / `/I` (16-bit), `+D` etc. (32-bit).
- Compare-contact family (verified on real hardware): `{LD,A,O}` × `{B,W,D,R}` × `{=,<>,<,<=,>,>=}` full combination — byte/word/double word/real, e.g. `LDW>=`, `AD<>`, `OB=`.
- String compare (verified on real hardware): `LDS=`/`LDS<>`, `AS=`/`AS<>`, `OS=`/`OS<>`.
- Timers: `TON` (on-delay), `TOF` (off-delay), `TONR` (retentive), given a timer number `Txx` and preset value `PT`. **Both the timer type and the time base are fixed by the timer number** — you do not choose them separately, you choose a number that already has them. Identical on classic and SMART (Table 6-1 / appendix E.5):

  | Type | 1 ms | 10 ms | 100 ms |
  |---|---|---|---|
  | `TONR` (retentive on-delay) | `T0`, `T64` | `T1`–`T4`, `T65`–`T68` | `T5`–`T31`, `T69`–`T95` |
  | `TON` / `TOF` (on/off-delay) | `T32`, `T96` | `T33`–`T36`, `T97`–`T100` | `T37`–`T63`, `T101`–`T255` |

  So the delay is `PT × time base`: `TON T37, 100` is 100 × 100 ms = **10 s**, while `TON T32, 100` is 100 × 1 ms = **100 ms**. Picking the number to match the required resolution is a design decision, not a formality. Using a `TONR` number with `TON`/`TOF` (or vice versa) is rejected — `plc_lint` catches it.
- Counters: `CTU` / `CTD` / `CTUD`.
- Control flow: `FOR` / `NEXT`, `JMP` / `LBL`, subroutines `CALL` / `CRET`, SCR `LSCR` / `SCRT` / `CSCRE` / `SCRE`, interrupts `ATCH` / `DTCH` / `CEVNT` / `CRETI`.
- Programs are organized into **Networks**.

## SMART V2.7 native-compile facts

The following was verified end to end in a STEP 7-Micro/WIN SMART V2.7, CPU ST40 project through POU import, formal compile, and POU export. Golden samples are in `evidence/s7200-real-exports/smart-v2.7-*-catalog-*.awl`; the fact catalog is in `lint_plc/s7_200lint/rules/siemens/s7_200/smart/awl/instruction_catalog.json`.

- The clear-interrupt-event name shown in the UI/help table is `CEVENT`, but the STL importer actually only accepts `CEVNT EVNT`; generated AWL must write `CEVNT`.
- `SR`/`RS` are LAD/FBD composite latch blocks, not standalone STL mnemonics; when exporting STL they must be expanded into stack logic plus `S`/`R`.
- Immediate-contact full family: `LDI` / `LDNI` / `AI` / `ANI` / `OI` / `ONI` can only directly access physical `I` bits; immediate outputs `=I` / `SI` / `RI` can only directly access physical `Q` bits.
- Real-time clock: `TODR T` / `TODW T` / `TODRX T` / `TODWX T`.
- Freeport and addressing: `XMT TBL,PORT` / `RCV TBL,PORT`, `GPA ADDR,PORT` / `SPA ADDR,PORT`, `GIP ADDR,MASK,GATE` / `SIP ADDR,MASK,GATE`.
- Ethernet: `GET TABLE` / `PUT TABLE`, `TCON TABLE` / `TSEND TABLE` / `TRECV TABLE` / `TDCON TABLE`.
- PROFINET: `RDREC REQ,TABLE,DONE,STATUS` / `WRREC REQ,TABLE,DONE,STATUS`, `BMIR IN,OUT,N` / `BMIW IN,OUT,N`; `N` is 1..128 and must not cross submodule boundaries.
- `PLS` channels allow only 0/1/2, corresponding to Q0.0/Q0.1/Q0.3; PID loop number is 0..7; HSC number is 0..5; HDEF mode is 0/1/3/4/6/7/9/10.
- On POU text import, do not place several mutually independent logic chains in a row within one `Network`; split each independent chain into its own Network. Otherwise, even if all mnemonics are valid, it may become an "invalid network" after import.
- For Modbus RTU Master v2.0, `MBUS_CTRL` parameter widths are `Baud:DWORD`, `Parity:BYTE`; `MBUS_MSG` is `Slave:BYTE`, `DataPtr:DWORD`. When pointing directly at a V-area buffer you must write an explicit pointer, e.g. `&VB800`, not a bare `VB800`; also do not pre-store the pointer with `MOVD &VB800, VD760`, because Micro/WIN rejects this kind of pointer initialization — pass `&VB800` directly to `MBUS_MSG`.
- In a new Micro/WIN SMART project, before first importing a POU that contains `MBUS_MSG`, allocate the Modbus RTU Master library and its V area. If the 7th operand still reports a type error, re-enter the explicit `&VBxxx` on the call line and commit with `Tab`; do not press `Enter`, which splits the long `CALL` across two lines. On re-export, Micro/WIN normalizes the symbolic call to a library block number, e.g. `CALL SBR10, ...`; this is the expected result.

## Engineering judgment when generating

- PID: the loop cycle must be fixed and the table area must reserve at least 80 bytes; make PV/SP/OUT normalization, bumpless manual/auto switchover, output clamping, and integral anti-windup explicit. Writing `PID TABLE,LOOP` alone does not make a usable closed loop.
- HSC/PTO/PWM: first establish the physical input / high-speed output / motion-axis resource table, then generate `HDEF`, `HSC`, `PLS`; the same fixed pin or generator must not be allocated twice.
- Interrupts: an INT should only sample, count, or set flags; put complex computation and communication back in the main scan; provide a worst-case execution-time budget and avoid prolonged `DISI`.
- RTC: reading the clock can run cyclically, but writing the clock must be triggered by a one-shot command or edge, not `TODW/TODWX` every scan.
- Communication: GET/PUT, OUC, and XMT/RCV should all generate an `Idle -> Request -> Busy -> Done/Error -> Retry` state machine, with the request usually on a rising edge; keep the table and buffer unchanged during Busy, and implement timeout, reconnect-on-disconnect, and error-code retention.
- PROFINET: generate RDREC/WRREC/BMIR/BMIW only when the corresponding device, slot, and submodule are already configured in the project; plan TABLE, data buffer, and immediate block-transfer lengths to the actual module boundaries.

## Boundaries

- Do not apply S7-300/400 STL instructions/block structure or TIA conventions to the S7-200.
- Specific instruction availability, timer time base and numbering, and address ranges follow the S7-200 System Manual / STEP 7-Micro/WIN help → look them up rather than extrapolating across models.
- Official references: Siemens S7-200 Programmable Controller System Manual; STEP 7-Micro/WIN (V4.0), chapters 5/6.
