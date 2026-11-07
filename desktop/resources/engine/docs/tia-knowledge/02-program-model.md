# 02 · S7-1200/1500 Program Model

The "what a program is" that an engineer must internalize. Sources are primarily the Siemens **S7-1200/1500 Programming Guideline** (Entry-ID 81318674, read at V1.4/2015-11; the conceptual model is stable from V14 through V21), the **S7-1500 Cycle and Reaction Times Function Manual** (A5E03461504-02, 02/2014), the **S7-1200 System Manual** (version V4.5/2021-05), and the **comparison table** (A5E33285102-AK, 02/2025).

## Controller = operating system + user program

A SIMATIC controller consists of the **operating system** (handles startup, refreshing the process image, cyclic calling of the user program, error handling, and memory management; integrated in the controller) and the **user program** (all the blocks you write, downloaded to the controller).

## The four block types

STEP 7 provides four block types:

- **OB (organization block)** — the interface between the operating system and the user program; **called on events** (startup, cyclic execution, interrupts, error handling). The available OB types depend on the controller.
- **FB (function block)** — **has cyclic/persistent memory**; each call is an "instance" whose data lives in an **instance DB**; static variables retain their values across cycles.
- **FC (function)** — **no persistent memory**; block parameter values are not retained across calls, so every call must supply actual parameters; use a global DB to store data permanently. An FC can have multiple outputs plus one SCL function return value.
- **DB (data block)** — a data container. **Global DB** data is available to the whole program; an **instance DB** is bound to a specific FB, and its structure is determined by the FB interface (editable only in the FB, not in the instance DB) and created automatically when the FB is called.

**Multi-instance**: a called FB stores its data in the **calling FB's instance DB**, avoiding a separate instance DB and reducing the number of instance DBs.

The instance DB's persistent area stores the FB interface's Input/Output/InOut/**Static**; **Temp** temporary variables live on the volatile L stack, are valid only for the current call, and **must be re-initialized every cycle**.

## Optimized access vs. standard (non-optimized) access

S7-1200/1500 blocks have two access modes:

- **Optimized blocks** (S7-1200/1500, **on by default for new blocks**): variables are sorted automatically by data type (minimizing gaps, fastest processor access), addressable **only symbolically**, Retain can be set **per variable**, and blocks carry a download memory reserve (downloading after an interface change needs no re-initialization). An instance DB's optimized state is **inherited from its FB**.
- **Standard (non-optimized) blocks**: **retained only for compatibility**; expose byte offsets and allow absolute addressing (symbolic + absolute + indirect pointers).
- Size: standard blocks max **64 kB**; optimized blocks up to **16 MB** on S7-1500; an optimized global DB on a CPU1518 can hold up to **10 MB** of DB data (anything >64 kB must be optimized). Note that 16 MB (block) and 10 MB (CPU1518 DB) are **two different measures** in the same document — do not treat them as the same limit; exact limits vary by version/firmware.
- Siemens recommends using **only optimized blocks** (much faster, purely symbolic addressing); **avoid** copy-assigning between optimized and non-optimized blocks (it requires a reordering conversion and is slow).

**Retentivity (Retain)**: in optimized blocks each variable can be set Retain individually; in non-optimized blocks it is all-or-nothing. For a global DB it is set in the DB (non-retentive by default); an instance's retentivity is set in the **FB** (not the instance DB) and applies to all instances of that FB.

## Scan cycle

**One S7-1500 cycle** = refresh input process-image partition 0 (PIPI 0) → execute the cyclic user program → refresh output process-image partition 0 (PIPQ 0). The OS starts the cycle timer → the CPU reads inputs into the input process image → executes the user program → writes the output process image to the output modules → evaluates the cycle time and restarts the timer.

**One S7-1200 cycle** (RUN): write the output process image to the physical outputs → read the physical inputs into the input process image **right before** executing the user program (values stay consistent during execution) → execute the user program (it updates the output **process image**, not the physical outputs directly, avoiding output chatter) → self-diagnostics → handle interrupts. The CPU has three operating modes: **STOP / STARTUP / RUN**.

**Cycle-time monitoring (S7-1500)**: default minimum cycle **1 ms**, default maximum (monitored) cycle **150 ms**; a timeout calls the time-error OB (OB 80).

**Process-image partitions**: S7-1500 has **32** (0..31), with partition 0 permanently assigned to the cycle and auto-refreshed by default; S7-1200 has **5** (PIP0 auto-refreshed every cycle by default + PIP1..PIP4 assignable to interrupt events). Appending the `:P` suffix to an address gives immediate direct access to the physical point, bypassing the process image.

## OB priorities and types

Priorities run from **1 (lowest, program cycle) to 26 (highest)**; on S7-1500 all cyclic OBs are always priority 1 and communication tasks are always 15. From **firmware V4.0** onward, S7-1200/1500 OBs no longer belong to a fixed priority class — each OB's priority can be assigned **individually** in the OB properties.

S7-1200 OB types and numbers:
- **Program-cycle OB** (default Main = **OB 1**; runs cyclically in RUN; multiple allowed, executed in ascending OB-number order)
- **Startup OB** (runs once on STOP→RUN; multiple allowed)
- **Time-delay interrupt OB** / **cyclic interrupt OB** (e.g. **OB 30**, at a configured interval, higher priority than the program cycle) / **hardware interrupt OB**
- **Time-error interrupt OB (OB 80)** / **diagnostic-error interrupt OB (OB 82)**

Three faults that cause a STOP (per the Programming Guideline):
- Cycle-monitoring timeout **twice** → both S7-1200 and S7-1500 STOP
- Cycle-monitoring timeout **once** → S7-1200 stays in RUN; S7-1500 STOPs if OB80 is not configured
- **Programming error** → S7-1200 stays in RUN; S7-1500 STOPs if OB121 is not configured

(Example error OBs from the Programming Guideline: **OB 80** time error, **OB 121** programming error.)

OB counts (V14 guideline table 2-8): program-cycle and startup OBs 100 each (both CPUs); hardware interrupts 50 (both); time-delay interrupts 4 on S7-1200 (from firmware V4, 4 time-delay + 4 watchdog) and 20 on S7-1500; cyclic-interrupt / time-of-day OBs 20 each on S7-1500.

## Data types

- **Integers**: USInt/SInt (8-bit), UInt (16-bit), UDInt (32-bit); **ULInt/LInt/LWord (64-bit) are S7-1500 only**.
- **Floating point**: Real (32-bit, ~7 decimal digits); **LReal (64-bit, ~15 digits)**.
- **Composite/structured**: STRING, ARRAY, STRUCT, **DTL** (Date_Time_Long: year/month/day/weekday/hour/minute/second/nanosecond, accessed by symbolic name).
- **User-defined type UDT** (called **PLC data types** in TIA): based on STRUCT; variables and DBs can be derived from it.

TIA Portal terminology renames (vs. old STEP 7 V5.x): symbol table → **PLC tags**; VAT → **Watch table**; UDT → **PLC data types**.

Block interface (formal parameters): **Input / Output / InOut / Ret_Val**; actual parameters = the variables connected to these interfaces at call time.

## Programming languages

| Language | S7-1200 | S7-1500 |
|---|---|---|
| LAD (ladder) | ✅ | ✅ |
| FBD (function block diagram) | ✅ | ✅ |
| SCL (Structured Control Language) | ✅ | ✅ |
| STL (statement list) | ❌ | ✅ |
| S7-GRAPH (sequential function chart) | ❌ | ✅ |

Per the 02/2025 comparison table (A5E33285102-AK), the Validity section states verbatim: "SIMATIC S7-1200 only supports LAD, FBD and SCL"; STL/GRAPH apply to S7-1500 (and S7-300/400). Directly relevant to PLC Code: **do not generate STL/GRAPH for the S7-1200 route**.

> Note: the actual title of the 02/2025 comparison table is "S7-300, S7-1200, S7-1200 G2, S7-1500" (S7-400 removed, S7-1200 G2 added); it applies to STEP 7 V20+, S7-1200 firmware 4.6+, and S7-1500 firmware 4.0+.

## Source PDFs

- Programming Guideline 81318674 (read at V1.4/2015-11): `cache.industry.siemens.com/dl/files/040/90885040/att_861867/v1/81318674_Programming_guideline_DOCU_v14_en.pdf` (the V16 version is under entry 90885040; 403 when fetched)
- S7-1500 Cycle and Reaction Times Manual A5E03461504-02: `cache.industry.siemens.com/dl/files/558/59193558/att_112303/v1/s71500_cycle_and_reaction_times_function_manual_en-US_en-US.pdf`
- S7-1200 System Manual (V4.5/2021-05; the document number is the A5E44115569 series, not A5E02486680 as misprinted in some places): `cache.industry.siemens.com/dl/files/241/109797241/att_1066673/v1/s71200_system_manual_en-US_en-US.pdf`
- Comparison table A5E33285102-AK: `cache.industry.siemens.com/dl/files/777/109986777/att_1322640/v1/s7_1500_compare_table_en.pdf`

> The chapter's concepts (block model, OB types, optimized access, scan cycle) are stable across V14→V21. Numeric and string values are verified against the V14 / 02-2025 primary documents cited above.
