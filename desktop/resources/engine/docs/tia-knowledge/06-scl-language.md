# 06 · SCL Language Reference (writing S7-1200/1500 code)

SCL = Siemens' IEC 61131-3 Structured Text, Pascal-like. **Primary reference for generating SCL code.** Sources: **SCL V4.0 programming manual** (`SCLV4_e.pdf`, 6ES7811-1CA02-8BA0, core syntax stable from V4 through V21), **programming guideline 81318674** (document version V1.6, 2018-12; note that the "v16" in the file name is a path alias, not TIA V16), and the **docs.tia.siemens.cloud V20/V21** instruction pages. Each code block is labeled as verbatim from source or reconstructed.

## Basics

- Assignment **`:=`**; statements end with **`;`**. `END_IF`/`END_CASE`/`END_FOR`/`END_WHILE`/`END_REPEAT` **each require a trailing semicolon**.
- Comments: `//` to end of line; `(* ... *)` block comment. (The style guide recommends **using only `//`**, see [08](08-lad-fbd-and-patterns.md).)
- Local interface variables use the **`#`** prefix (`#localVar`); global variables/DBs use quotes (`"Tag"`, `"DB".Member`); arrays `arr[i]`; struct/UDT members `struct.field`.

## Operators and precedence (1 = highest)

| Level | Operator |
|---|---|
| 1 | Parentheses `()` |
| 2 | Power `**` |
| 3 | Unary `+ - NOT` |
| 4 | `* / MOD DIV` |
| 5 | Binary `+ -` |
| 6 | `< > <= >=` |
| 7 | `= <>` |
| 8 | `AND` (may also be written **`&`**) |
| 9 | `XOR` |
| 10 | `OR` |
| 11 | Assignment `:=` |

(SCL V4 table 13-1) Equal precedence evaluates left to right. Arithmetic: `**` (power), `*`, `/`, `MOD` (integer modulo), `DIV` (integer division), `+`, `-`; the second operand of `/ MOD DIV` must not be 0; one INT and one REAL → result is REAL.

## Control structures (exact keywords)

**IF** (any number of ELSIF; ELSIF/ELSE optional):
```scl
IF I1.1 THEN
  N := 0;  SUM := 0;  OK := FALSE;
ELSIF START = TRUE THEN
  N := N + 1;  SUM := SUM + N;
ELSE
  OK := FALSE;
END_IF;
```
(verbatim from SCL V4 example 15-1)

**CASE** (selector expression is INTEGER; on 1200/1500 also **CHAR/STRING**; values may be a single value, a list `10,12`, or a range `0..20`; each value appears only once; ELSE optional):
```scl
CASE #myVar OF
    5:       #Engine(#myParam);
    10,12:   #Transport(#myParam);
    15:      #Lift(#myParam);
    0..20:   #Global(#myParam);   // 5/10/12/15 already matched above, never reaches here
    ELSE
END_CASE;
```
(verbatim from programming guideline 81318674 §3.10.6)

**FOR** (counting loop; V20 official syntax):
```scl
FOR <Run_tag> := <Start_value> TO <End_value> BY <Increment> DO
    <Instructions>;
END_FOR;
```
- `BY` is optional, default **+1**; count down with `BY -2`.
- Counter variable types: S7-1200 = `SINT/INT/DINT/USINT/UINT/UDINT`; S7-1500 adds `LINT/ULINT`.
- **The counter variable must not be modified inside the loop** (`#statVar := #statVar + 1;` is invalid and produces a compile warning).

**WHILE** (test first, may run 0 times) / **REPEAT** (test after, runs at least once):
```scl
WHILE <condition> DO ... END_WHILE;
REPEAT ... UNTIL <condition> END_REPEAT;
```

**Loop control**: `CONTINUE` (end the current iteration and re-test the condition), `EXIT` (break out of the loop immediately and continue after `END_FOR`), `RETURN` (exit the block); all three work in every loop type.

**GOTO** (use sparingly, only for special cases such as error handling): the target is declared in `LABEL ... END_LABEL`, must be in the same block and unique; **cannot jump into a loop** (jumping out is allowed).

**REGION** (TIA **V14+**, collapsible section, nestable):
```scl
REGION Feeder System
   IF "Variable_1" = 0 THEN "Variable_2" := 10; END_IF;
END_REGION
```

## Declaration sections

`VAR_INPUT` / `VAR_OUTPUT` / `VAR_IN_OUT` (formal parameters), `VAR` (static), `VAR_TEMP` (temporary), `CONSTANT` (named constants); each section closes with `END_VAR`.
```scl
VAR
  INDEX : INT;
  KEYWORD : ARRAY [1..50] OF STRING;
END_VAR
```

## Calling blocks and instructions

- **Inputs use `:=`, outputs/in-out use `=>`** (modern TIA style).
- **FC** (with a return value) can be used directly in an expression: `<Operand> := <FC_name>(parameter list);`; a VOID function cannot be used as an expression operand.
- **An FB must have an instance** (a global instance DB, or a multi-instance embedded in the caller FB's instance DB); FB outputs live in the instance data and are read from there, not returned through a classic call list.
- Instruction instances (e.g. IEC timers) are called as `"InstDB".Instruction(...)`.

FC call (verbatim from SCL V4): `FC31(I_Par:=3, IO_Par:=LENGTH, O_Par:=Digitsum);`

IEC timer call (verbatim from the V20 TON page):
```scl
"TON_DB".TON(IN := "Tag_Start",
             PT := "Tag_PresetTime",
             Q  => "Tag_Status",
             ET => "Tag_ElapsedTime");
```
Multi-instance + reading members (reconstructed from verified syntax):
```scl
// FB static section: #DelayTimer : TON;
#DelayTimer(IN := #StartSignal, PT := T#1s);
#Done    := #DelayTimer.Q;
#Elapsed := #DelayTimer.ET;
```
IEC timer instances can also be called as array elements/struct members/global DB members (verbatim from the V20 "Calling IEC timers" page): `#MyARRAY[1].TOF(...)`, `#MyStruct.FirstTime.TOF(...)`, `"MyGlobalDB".Timer.FirstTime.TOF(...)`; outputs are read from `#MyStruct.FirstTime.Q/.ET`.

## EN/ENO

The EN/ENO mechanism exists in LAD/FBD/SCL; in SCL you can write `ENO := TRUE/FALSE`. Performance optimization: **in LAD/FBD, disabling "generate ENO" is recommended** (to avoid the runtime check) — this recommendation applies to LAD/FBD. Newly inserted instructions default to ENO disabled.

## Time arithmetic (operator overloading)

You can add/subtract timestamps directly: `timeDifference := timeStamp_1 - timeStamp_2;`; the compiler selects the underlying function automatically; `TIME` supports `+/-` and `*//` with integers.

## Sources

- SCL V4 manual: `cache.industry.siemens.com/dl/files/188/1137188/att_27471/v1/SCLV4_e.pdf`
- Programming guideline 81318674 V1.6: `cache.industry.siemens.com/dl/files/040/90885040/att_970576/v1/81318674_Programming_guideline_DOC_v16_en.pdf`
- V20 SCL instruction pages: `docs.tia.siemens.cloud/r/en-us/v20/scl-s7-1200-s7-1500/...`
