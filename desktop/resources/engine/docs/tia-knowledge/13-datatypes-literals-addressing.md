# 13 · Data types, literals, addressing

Required for emitting correct code. Sources: Siemens comparison table / programming guide + docs.tia.siemens.cloud + local real export XML + generator.

## Basic data types (bit width / range)

| Type | Bits | Range / notes |
|---|---|---|
| BOOL | 1 | |
| BYTE/WORD/DWORD/LWORD | 8/16/32/64 | Bit strings; unsigned numeric interpretation |
| SINT/INT/DINT/LINT | 8/16/32/64 | Signed; LINT ±9.2e18 |
| USINT/UINT/UDINT/ULINT | 8/16/32/64 | Unsigned |
| REAL | 32 | IEEE754, 23-bit stored mantissa, ~±3.4e38 |
| LREAL | 64 | 52-bit stored mantissa, ~±1.8e308 |
| CHAR/WCHAR | 8/16 | ASCII / Unicode |
| STRING | — | Default/max 254 chars + 2-byte header; declare `STRING[n]` |
| WSTRING | — | Default 254, max 16382 chars + 2 words |

Ranges cross-checked against IEC standard values; WSTRING 254/16382 from docs.tia.siemens.cloud.
> **64-bit integers LINT/ULINT/LWORD (and LREAL/LTIME) are S7-1500 only**; not available on S7-1200. (see [06](06-scl-language.md))

## Literal prefixes

- Radix: hex `16#6B0F`, binary `2#0011_1010`, octal `8#360`; underscore grouping `50_000`; real e-notation `1.0e-5`; `BOOL#0`/`BOOL#1`. `16#`/`2#`/underscore/e-notation are confirmed in real exports; `8#`/`BOOL#` are IEC syntax.

## Time/date literals and sizes

| Type | Bits | Literal example |
|---|---|---|
| S5TIME | 16 | `S5T#10s` |
| TIME | 32 | `T#10d20h30m20s630ms` (units d/h/m/s/ms, internally signed DINT milliseconds) |
| LTIME | 64 | `LT#11350d20h25m14s830ms652us315ns` (adds us/ns) |
| DATE | 16 | `D#2009-12-31` |
| TIME_OF_DAY/TOD | 32 | `TOD#10:20:30.400` |
| LTOD | 64 | `LTOD#10:20:30.400_365_215` |
| DATE_AND_TIME/DT | 64 | `DT#2008-10-25-8:12:34.567` |
| LDT | 64 | `LDT#2008-10-25-8:12:34.567` |
| DTL | 96 | `DTL#2008-12-16-20:30:20.250` (12 bytes) |

TIME/LTIME/DTL from docs.tia.siemens.cloud; real exports use `T#10S`.

**DTL members** (in order): `Year` (UINT), `Month`/`Day`/`Weekday`/`Hour`/`Minute`/`Second` (USINT), `Nanosecond` (UDINT); symbolic access `My_Timestamp.Hour`.

## Addressing (operand syntax)

- `%` prefix + area letter: `I` (input), `Q` (output), `M` (bit memory).
- Bit: `%I0.0`, `%Q12.0`, `%M10.2` (byte.bit).
- Width letters: `%MB0` (byte), `%MW20` (word), `%MD24` (double word); `%IW`/`%QW` likewise.
- **Peripheral immediate-access suffix `:P`**: `%I0.0:P` / `%IW256:P` bypasses the process image and accesses hardware directly. Confirmed by multiple sources.
- Legacy DB absolute addressing: `%DB10.DBX20.0` (bit `DBX byte.bit`), `DBW`/`DBD` (word/double word); modern code prefers symbolic `"DB".member`.
- Distinguish three different symbols: `:P` (peripheral suffix), `DBX` (DB absolute bit), `P#` (ANY/pointer prefix, e.g. `P#DB10.DBX0.0 BYTE 20`) — do not confuse them.

## Types and initial values in SimaticML (for the generator)

- In `<Member Name="..." Datatype="..."/>`, the **`Datatype` is a free-form string with no enum/whitelist**, CamelCase (`Bool`/`Int`/`USInt`/`Time`/`String[10]`); any valid type/literal passes through verbatim. Confirmed by Repsay member.py (no validation) and by real exports.
- The initial value goes in a separate child **`<StartValue>`**, carrying the literal verbatim (`16#65`/`T#10S`/`'V4.0'`/`true`/`255`).
- SCL source uses all-uppercase type names (`BOOL`/`USINT`/`TIME`/`STRING`), **but the exported SimaticML `Datatype` attribute uses CamelCase** — the casing differs between the two, so the generator must account for it.

## Sources

- docs.tia.siemens.cloud data-types page (DTL/WSTRING/TIME/LTIME)
- Real export: `source-cache/mking2203_CodeGeneratorOpenness/Sample/GraphJump.xml`
- Generator: `source-cache/Repsay_tia-portal-xml-generator/.../elements/member.py`

## Notes

- The integer range table and the `8#`/`BOOL#` literal tokens follow the IEC standard.
- In the observed export samples, FlgNet operands are encoded as Component symbol names rather than raw `%address` operands.
