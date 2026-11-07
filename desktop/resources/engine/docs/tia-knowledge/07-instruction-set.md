# 07 · S7-1200/1500 Instruction Set

Instructions for writing logic — exact mnemonics + parameters. Sources: **docs.tia.siemens.cloud V20/V21** per-instruction pages, the **instruction comparison reference** (`s7_1500_compare_table_en_mnemo.pdf`, 86630375), and **Programming Guideline 81318674**. Parameter names cross-checked item by item against these sources.

> ⚠️ **High-risk codegen corrections:**
> - The ones-complement (invert) mnemonic is **`INVERT`**, **not `INV`** (official page title "INVERT: Create ones complement"). Searching/writing `INV` will not match.
> - `NORM_X`'s MIN/VALUE/MAX do **not** require the same data type (mixed integer/float is accepted, and a constant may declare only one type); the claim that they "must be the same type" is an overstatement.
> - `SCALE_X`'s VALUE in the 0.0..1.0 range is only the "after NORM_X" convention, **not** a hard constraint (SCALE_X does a linear mapping over any float).

## Bit logic

- Normally-open contact `--| |--`, normally-closed `--| / |--`, output coil `--( )--`, negated coil `--( / )--`, set `--( S )`, reset `--( R )`; `SET_BF`/`RESET_BF` (set/reset a contiguous bit field).
- **SR (set/reset flip-flop, reset-dominant)**: inputs `S`, `R1`; **R1 dominates** — when S and R1 are both 1, the operand is reset to 0. Output `Q`.
- **RS (reset/set flip-flop, set-dominant)**: inputs `R`, `S1`; **S1 dominates** — when R and S1 are both 1, the operand is set to 1. Output `Q`.
  > ⚠️ Note: this SIMATIC naming is the reverse of the IEC/AB convention (there SR = reset-dominant); always double-check when porting across platforms.
- Edges: `--|P|--`/`--|N|--` (scan the rising/falling edge of a **single operand**), `--(P)--`/`--(N)--` (edge coils), `P_TRIG`/`N_TRIG` (scan the edge of the **RLO/power flow**), `R_TRIG`/`F_TRIG` (**FB instructions**, scan the `CLK` operand, require an instance).
  - `R_TRIG`: input `CLK` (BOOL), output `Q` (BOOL); on CLK 0→1, Q is 1 for **one scan cycle**; an instance is required to store the previous CLK state. `F_TRIG` is the falling-edge counterpart.

## IEC timers (all instance-based FBs; multi-instance allowed)

`TP` (pulse), `TON` (on-delay), `TOF` (off-delay), `TONR` (retentive/accumulating). Siemens recommends IEC timers + multi-instance in place of the legacy SIMATIC timers.

- **TON** parameters: `IN` (BOOL, start), `PT` (TIME/LTIME, delay, must be positive), `Q` (BOOL, set once PT elapses and IN stays 1), `ET` (TIME/LTIME, current value).
- **TONR** parameters: `IN`, **`R` (BOOL, resets ET and Q)**, `PT`, `Q` (stays set once the accumulated time reaches PT), `ET` (accumulated time). TONR differs only by the added `R`.
- **TOF/TP**: same parameter set as TON — `IN/PT/Q/ET` — with no R.

## IEC counters (instance-based FBs)

`CTU` (up), `CTD` (down), `CTUD` (up/down).

- **CTU**: `CU` (count input), `R` (reset), `PV` (preset value), `Q` (status), `CV` (current value; integer/CHAR/WCHAR/DATE). Rising edge on CU increments CV; R=1 → CV:=0; **Q=1 when CV≥PV**.
- **CTD**: `CD`, `LD` (load), `PV`, `Q`, `CV`. LD=1 → CV:=PV; **Q=1 when CV≤0**. Note the CTD output is named **`Q`** (not QD).
- **CTUD**: `CU`, `CD`, `R`, `LD`, `PV`, **`QU`** (1 when CV≥PV), **`QD`** (1 when CV≤0), `CV`.

## Comparators

- `CMP ==` / `<>` / `>=` / `<=` / `>` / `<` (equal / not-equal / greater-or-equal / less-or-equal / greater / less).
- `IN_RANGE` (in range) / `OUT_RANGE` (out of range): parameters `MIN`, `VAL`, `MAX`; IN_RANGE outputs 1 when `MIN<=VAL<=MAX`, OUT_RANGE is the opposite.
- `OK` / `NOT_OK`: check whether a floating-point number is a valid real.

## Math

`CALCULATE` (free expression; inputs `IN1/IN2/...` are expandable, result to `OUT`; Siemens recommends it in place of chained ADD/SUB boxes), `ADD/SUB/MUL/DIV`, `MOD`, `NEG`, `ABS`, `INC/DEC`, `MIN/MAX/LIMIT`, `SQR/SQRT/LN/EXP`, `SIN/COS/TAN/ASIN/ACOS/ATAN`, `FRAC`, `EXPT`. (All 25 mnemonics checked.)

## Move / convert

- Move: `MOVE`, `MOVE_BLK`, `UMOVE_BLK` (non-interruptible), `FILL_BLK`, `UFILL_BLK`, `SWAP`.
- Convert: `CONVERT`, `ROUND`, `CEIL`, `FLOOR`, `TRUNC`, **`SCALE_X`**, **`NORM_X`**. (Note: Move and Convert are two separate categories in TIA.)

**Analog-scaling golden pair** (formulas copied verbatim):
- `NORM_X`: `OUT = (VALUE - MIN) / (MAX - MIN)` → 0.0..1.0, parameters `MIN/VALUE/MAX/OUT`
- `SCALE_X`: `OUT = [VALUE * (MAX - MIN)] + MIN`, parameters `MIN/VALUE/MAX/OUT`
```scl
norm := NORM_X(MIN := 0,   VALUE := rawAnalog, MAX := 27648);   // raw 0..27648 -> 0.0..1.0
eng  := SCALE_X(MIN := 0.0, VALUE := norm,      MAX := 100.0);   // -> 0.0..100.0 engineering units
```
(Code reconstructed; parameter names copied from the official docs. Note: under strict typing, the integer literals 0/27648 against a REAL target may need typed constants or `_REAL` variants to avoid conversion warnings.)

## Program control

`--(JMP)` (jump when RLO=1), `--(JMPN)` (jump when RLO=0), `LABEL` (jump label), `JMP_LIST` (jump list), `SWITCH` (jump distributor), `--(RET)` (return). In SCL the unconditional jump is `GOTO`.

## Word logic / shift-rotate

- Word logic: `AND`, `OR`, `XOR`, **`INVERT`** (ones complement — not INV!), `DECO` (decode), `ENCO` (encode), `SEL` (select), `MUX` (multiplex), `DEMUX` (demultiplex).
- Shift/rotate: `SHR` (shift right), `SHL` (shift left), `ROR` (rotate right), `ROL` (rotate left).

## SCL call examples (parameter names copied from official docs; standard SCL FB call structure)

```scl
"MyTON"(IN := startBit, PT := T#5s, Q => doneBit, ET => elapsedTime);
"MyTONR"(IN := runBit, R := resetBit, PT := T#10s, Q => reachedBit, ET => accumTime);
"MyCTU"(CU := pulseBit, R := resetBit, PV := 10, Q => atTargetBit, CV => currentCount);
"MyCTUD"(CU := upBit, CD := downBit, R := resetBit, LD := loadBit, PV := 100,
         QU => upStatus, QD => downStatus, CV => currentCount);
"MyRTRIG"(CLK := signal, Q => oneShot);
inOK  := IN_RANGE(MIN := 4, VAL := measured, MAX := 20);
fault := OUT_RANGE(MIN := 4, VAL := measured, MAX := 20);
```

## Sources

- Instruction comparison reference 86630375: `cache.industry.siemens.com/dl/files/375/86630375/att_940844/v1/s7_1500_compare_table_en_mnemo.pdf`
- V20 per-instruction pages: `docs.tia.siemens.cloud/r/en-us/v20/{fbd|lad|scl}-s7-1200-s7-1500/.../...`
