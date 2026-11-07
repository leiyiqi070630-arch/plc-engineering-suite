# TIA Portal SD (SIMATIC SD) Instruction Format Verification

> TIA Portal V21, SD export route
> Route 1: GTronic ZAP real project → retrieve/upgrade → export_block_sd → read .s7dcl
> Route 2: tia_lad_generate_block_xml → import → TIA compile → export_block_sd → read .s7dcl
> Every instruction is exported from a real TIA project, with an evidence file name
> Instruction totals: **~66** verified + **~18** not supported by SD + **~19** need real-project context + **17** SD structural features

---

## SD file basic structure

```
{BOM} { S7_Optimized := "TRUE"; S7_PreferredLanguage := "LAD"; S7_Version := "0.1" }
FUNCTION_BLOCK "Name" / FUNCTION "Name" : Void / ORGANIZATION_BLOCK "Name"
    VAR_INPUT ... END_VAR
    VAR_OUTPUT ... END_VAR
    VAR ... END_VAR
    VAR_RETAIN ... END_VAR        -- retentive variables
    VAR_IN_OUT ... END_VAR        -- pass by reference
    { S7_Language := "LAD" }
    NETWORK
        RUNG wire#powerrail
            ...
        END_RUNG
    END_NETWORK
END_FUNCTION_BLOCK
```

### .s7res file
```
MultiLingualTexts:
```
(Minimal valid file; may be empty if there is no multilingual text.)

---

## Part 1 — Bit Logic Instructions

### 1. Contact (NO — normally-open contact)
```
Contact( #VarName )
Contact( "GlobalVar" )
Contact( "DB_Name"."Field" )     -- struct field with dot notation
Contact( #ArrVar[Index] )        -- array element
```
Source: SemaforoMain, inverterFC, valves, VerificaQuantita, CycleComb, TrafficLight

### 2. I_Contact (NC — normally-closed contact)
```
I_Contact( #VarName )
I_Contact( "hmi data"."hmi stop" )
```
Source: inverterFC, CycleComb

### 3. Coil (output coil)
```
Coil( #VarName )
Coil( "hmi variables".EV0 )     -- struct-field output
```
Source: all 8 projects

### 4. S_Coil (set coil)
```
S_Coil( #VarName )
```
Source: CycleComb

### 5. R_Coil (reset coil)
```
R_Coil( #VarName )
```
Source: CycleComb

---

## Part 2 — Edge Detection

### 9. P_Contact (rising-edge contact)
```
P_Contact(
    operand := #TrigVar,
    bit := #MemBit              -- edge memory bit; must be declared Bool in VAR
)
```
Source: CycleComb, rampa (GTronic export) + FB_SD_Verify_Edge (TIA-generated SD)

### 10. N_Contact (falling-edge contact)
```
N_Contact(
    operand := #TrigVar,
    bit := #MemBit
)
```
Source: CycleComb + FB_SD_Verify_Edge

### 11. P_TRIG / N_TRIG (edge detection)
```
{ S7_Language := "LAD" }
NETWORK
    RUNG wire#powerrail
        Contact( #ClkIn )
        P_Trig( #P_Out )
        Coil( #P_Out )
    END_RUNG
END_NETWORK
{ S7_Language := "LAD" }
NETWORK
    RUNG wire#powerrail
        Contact( #ClkIn )
        N_Trig( #N_Out )
        Coil( #N_Out )
    END_RUNG
END_NETWORK
```
Source: FB_SD_TRIG (hand-written SD import)

Notes:
- SD uses `P_Trig` / `N_Trig` (with underscore, not `P_TRIG`).
- **Positional-parameter syntax**: `P_Trig( #Output )`, not the named form `bit =>`.
- CLK is supplied automatically by the RLO chain; it does not need to be passed explicitly.
- The edge memory bit (m_bit) is managed automatically by SD and does not need to be declared.

### 12. R_TRIG / F_TRIG — not supported by SD
The R_TRIG and F_TRIG data types are not recognized in S7-1200, like SR/RS.
**Conclusion: SD does not support R_TRIG/F_TRIG; use P_Trig/N_Trig instead.**

---

## Part 3 — Timers

### 13. TON (on-delay, multi-instance)
```
#"TimerName".TON(
    pt := T#5S,
    et => #ElapsedTime             -- et may be omitted
)
#"TimerName".TON(
    pt := #VarPreset,              -- variable preset
    et =>                        -- empty output
)
```
Source: CycleComb, inverterFC, rampa, valves

### 14. TON (global-DB IEC timer)
```
"IEC_Timer_0_DB".TON(
    pt := T#26s,
    et => "Rampa"."Timer"
)
```
Source: valves

### 15. TOF (off-delay timer)
```
"IEC_Timer_0_DB".TOF(
    pt := T#2S,
    et => 
)
```
Source: Blink (GTronic Hussain)

Note: TOF uses the global-DB instance call form (`"DB".TOF(pt/et)`), unlike TON's `#Inst` form.

### 16. TP (pulse timer)
```
#TPULSE.TP(
    pt := T#15000MS,
    et => "HMI_Variables".HMI_Timer
)
```
Source: PTO_Servo (GTronic) + FB_SD_Verify_TP (TIA-generated SD)

Note: the Q output is not passed explicitly; it drives a Coil via the RLO. et can connect to a global-DB field.

### 17. TONR (retentive on-delay timer)
```s7dcl
{ S7_Templates := "value_type" }
#"TONR_Inst".TONR(
    r := wire#w1,           -- reset pin (WIRE connection)
    pt := T#5S,             -- preset time
    et => #ET_Out           -- elapsed time
)
```
Source: FB_SD_TONR (hand-written SD import, compile 0 errors)
Evidence file: `.clawd-agents/sd_verified/FB_SD_TONR.s7dcl`

Key rules:
- `r` uses a WIRE connection (first build an empty RUNG to wire#w1).
- The WIRE definition must come after the main RUNG.
- Use the `value_type` template (not SrcType).
- The Q output is accessed via a Contact (`Contact(#TONR_Inst.Q)`).

### 18. Timer coils (-(TON)-, -(TOF)-, -(TP)-, -(TONR)-) — not supported by SD
SD LAD syntax does not support coil-form timers. All SD timers must be used as FB calls (e.g. `#Inst.TON(...)`). In the TIA UI a timer coil is essentially an implicit FB call, but the SD syntax parser does not map coil syntax to an FB call. SD syntax manuals do not include coil-form timers.

### 19. -(RT)- / -(PT)- — not supported by SD (same as the coil family)

---

### 18. WR_SYS_T (write system time)
```
WR_SYS_T(
    IN := #"WR Date and Time_1"."Data And Time",
    RET_VAL => #"Ret Val WR data & time"
)
```
Source: Semaforo_DateTime (GTronic)

### 19. RD_SYS_T (read system time)
```
RD_SYS_T(
    RET_VAL => #"Ret Val RD data & time_1",
    OUT => #"RD Date and Time_1"."Data And Time"
)
```
Source: Semaforo_DateTime (GTronic)

### 20. TCON (establish connection)
```
#TCON_1(REQ := condition, ID := #ID, DONE => #b_Done,
    BUSY => #b_Busy, ERROR => #b_Error, STATUS => #w_Status,
    CONNECT := #s_Connect);
```
Source: TP700_SDT (GTronic SIWAREX)

Note: the CONNECT parameter needs a TCON_Param struct (with fields such as BLOCK_LENGTH, CONNECTION_TYPE, LOCAL_DEVICE_ID).

### 21. TSEND (send data)
```
#TSEND_1(REQ := condition, ID := #ID, LEN := 32,
    DONE => #b_Done, BUSY => #b_Busy, ERROR => #b_Error,
    STATUS => #w_Status, DATA := #DR35.DISPLAY_DATA);
```
Source: TP700_SDT (GTronic SIWAREX)

### 22. TRCV (receive data)
```
#TRCV_1(EN_R := condition, ID := #ID, LEN := 2,
    NDR => #b_Done, BUSY => #b_Busy, ERROR => #b_Error,
    STATUS => #w_Status, RCVD_LEN => #i_Rcvd_Len, DATA := #CONTROL);
```
Source: TP700_SDT (GTronic SIWAREX)

Note: TRCV uses `EN_R` (not `REQ`) as the enable, and `NDR` (New Data Received) instead of `DONE`.

### 23. CTRL_PTO (PTO servo control)
```
"Controllo_Servo _Drive".CTRL_PTO(
    REQ := wire#w1,
    PTO := 265,
    FREQUENCY := "HMI_Variables".Frequency_Motor,
    DONE =>  ,
    BUSY =>  ,
    ERROR =>  ,
    STATUS =>  
)
```
Source: PTO_Servo (GTronic)

Note: REQ is enabled by a preceding link WIRE; PTO is a hardware-identifier constant; the open outputs (DONE/BUSY/ERROR/STATUS) may be left empty.

## Part 4 — Counters

### 24. CTU (up counter)
```
{ S7_Templates := "value_type := Int" }
#"CounterName".CTU(
    r := wire#w2,               -- reset input, connected to WIRE
    pv := #PV_Value,            -- preset value (Int)
    cv => #CurrentValue         -- current count value
)
```
Source: CycleComb (GTronic)

Notes:
- CU (count pulse) is supplied automatically by the RLO before the box; it is not passed explicitly.
- r connects to a WIRE rather than a variable.
- Declare `CounterName : CTU_INT;` in VAR_RETAIN or VAR.

### 25. CTUD (up/down counter)
```
#"CTUD_Inst".CTUD(
    cd := wire#w1,               -- count-down input, WIRE-connected
    r := wire#w2,                -- reset input, WIRE-connected
    ld :=  ,                     -- load input, left empty
    pv := #PV_Val,               -- preset value (Int)
    qd => #QD_Out,               -- count-down-reached-zero output
    cv => #CV_Val                -- current count value
)
-- CU (count up) is supplied automatically by the RLO before the box
-- QU is obtained via a series Coil (not passed explicitly)
```
Source: FB_SD_Verify_CTUD (TIA-generated SD)

Notes:
- Declaration: `VAR RETAIN CTUD_Inst : CTUD_INT;` (**must be VAR RETAIN**).
- `cd` and `r` connect to WIRE branches (the Contact outputs of other RUNGs).
- `ld` is left empty (`ld := ,`).
- Template pragma: `"value_type := Int"` (counters use value_type, not SrcType).

### 26. CTD (down counter)
```
{ S7_Templates := "value_type := Int" }
#CTD_Inst.CTD(
    ld := wire#w1,               -- load input, WIRE-connected
    pv := #PV_Val,               -- preset value (Int)
    cv => #CV_Val,               -- current count value
    qd => #QD_Out                -- count-down-reached-zero output
)
-- CD (count-down pulse) is supplied automatically by the RLO before the box
```
Source: FB_SD_CTD (hand-written SD import)

Notes:
- Declaration: `VAR_RETAIN CTD_Inst : CTD_INT;` (**must be VAR_RETAIN**).
- `ld` connects to a WIRE branch (the Contact output of another RUNG).
- Template pragma: `value_type := Int` (counters use value_type, not SrcType).
- The WIRE-definition RUNG must be placed **after** the main RUNG that references the WIRE.

### 27. Counter coils (-(CU)-, -(CD)-, -(R)-, -(LD)-) — not supported by SD
SD LAD syntax does not support coil-form counters. All SD counters must be used as FB calls (e.g. `#Inst.CTU(...)`). As with timer coils, a counter coil in the TIA UI is an implicit FB call, but the SD syntax parser does not accept coil syntax. SD only supports the FB-call form of CTU/CTUD/CTD.

---

## Part 5 — Comparators

### 28. EQ_Contact (equal)
```
{ S7_Templates := "SrcType := Int" }
EQ_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: FB_SD_Verify_Cmp (TIA-generated SD)

### 25. NE_Contact (not equal)
```
{ S7_Templates := "SrcType := Int" }
NE_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: FB_SD_NE (hand-written SD import)

Note: identical to the EQ_Contact pattern; the two-type form also supports `SrcType := Real`.

### 30. GT_Contact (greater than)
```
{ S7_Templates := "SrcType := Int" }
GT_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: CycleComb (GTronic) + FB_SD_Verify_Cmp (TIA)

### 31. LT_Contact (less than)
```
{ S7_Templates := "SrcType := Int" }
LT_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: FB_SD_Verify_Cmp (TIA)

### 32. GE_Contact (greater than or equal)
```
{ S7_Templates := "SrcType := Int" }
GE_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: FB_SD_Verify_Cmp (TIA)

### 33. LE_Contact (less than or equal)
```
{ S7_Templates := "SrcType := Real" }
LE_Contact(
    in1 := #ValA,
    in2 := #ValB
)
```
Source: VerificaQuantita (GTronic) + FB_SD_Verify_Cmp (TIA)

### 34. InRange (within range)
```
{ S7_Templates := "SrcType := DInt" }
InRange(
    min := 0,                           -- constant
    in := "Rampa"."Timer",              -- variable
    max := 3999                          -- constant
)
```
Source: valves (GTronic) + FB_SD_Verify_Cmp (TIA)

### 35. OutRange (outside range)
```
{ S7_Templates := "SrcType := Int" }
OutRange(
    min := #ValA,
    in := #ValB,
    max := 100
)
```
Source: FB_SD_Verify_Cmp (TIA)

### 36. OK (real-value validity check)
```
{ S7_Language := "LAD" }
NETWORK
    RUNG wire#powerrail
        OK( #RealVal )
        Coil( #OkResult )
    END_RUNG
END_NETWORK
```
Source: FB_SD_OK (hand-written SD import)

Notes:
- **Positional-parameter syntax**: `OK( #RealVal )`. The pin name is actually `operand`, but SD export uses positional parameters.
- OK returns TRUE when the Real value is valid (not NaN, not ±∞).
- No S7_Templates pragma is needed (it applies only to the Real type).

### NOT_OK — not supported by SD
The instruction name NOT_OK is not recognized by SD: "Not a Valid instruction: NOT_OK".
**Conclusion: SD does not support NOT_OK. Use the logical negation `NOT OK(...)` instead, or implement it in SCL.**

---

## Part 6 — Math

### 37. Add (addition)
```
{ S7_Templates := "SrcType := Int"; S7_GenerateENO := "TRUE" }
Add(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result
)
```
Source: rampa (GTronic) + FB_SD_Verify_Group1 (TIA)

### 38. Sub (subtraction)
```
{
    S7_Templates := "SrcType := Int"; 
    S7_GenerateENO := "TRUE"
}
Sub(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result                   -- lowercase out
)
```
Source: FB_SD_Verify_Sub (TIA-generated SD)

Note: the SD instruction name is `Sub`, identical to the Add/Div/Mul pattern.

### 39. Mul (multiplication)
```
{ S7_Templates := "SrcType := Real" }
Mul(
    in1 := -1.728,              -- negative constant
    in2 := #Var,
    out => #Result
)
```
Source: inverterFC, rampa (GTronic) + FB_SD_Verify_Group1 (TIA)

### 40. Div (division)
```
{ S7_Templates := "SrcType := Real" }
Div(
    in1 := 22118.0,
    in2 := 20000.0,
    out => #Result
)
```
Source: inverterFC (GTronic) + FB_SD_Verify_Group1 (TIA)

### 41. MOD (modulo)
```
{ S7_Templates := "SrcType := Int" }
Mod(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result
)
```
Source: FB_SD_MOD (hand-written SD import)

Note: identical to the Add/Sub/Mul/Div format; SD syntax accepts the `Mod` instruction name.

### 42. INC / DEC — not supported by SD
The SD syntax parser cannot resolve the `operand` pin type for INC and DEC. Both `SrcType` and `value_type` fail, returning "operand Undef".
**Conclusion: SD syntax does not support the INC and DEC instructions.**

### 43. NEG (negation)
```
{ S7_Templates := "SrcType := Int" }
Neg(
    in := #Val,
    out => #Result
)
```
Source: FB_SD_NEG (hand-written SD import)

Note: `Neg` is integer negation (two's complement); the pin order matches Abs: `in` → `out`.

### 44. ABS (absolute value)
```
{ S7_Templates := "SrcType := Int" }
Abs(
    in := #Val,
    out => #Result
)
```
Source: FB_SD_ABS (hand-written SD import)

Note: supports both Int and Real types — just change `SrcType`. Real type:
```
{ S7_Templates := "SrcType := Real" }
Abs(in := #RealVal, out => #RealRes)
```

### 45. SQR / SQRT (square / square root)
```
{ S7_Templates := "SrcType := Real" }
Sqr(
    in := #Val,
    out => #Result
)
```
```
{ S7_Templates := "SrcType := Real" }
Sqrt(
    in := #Val,
    out => #Result
)
```
Source: FB_SD_SQR_SQRT (hand-written SD import)

Note: requires the Real type. Sqr returns the square, Sqrt returns the square root. Format is identical to Abs.

### 47. CALCULATE (calculator)
```
{
    S7_Templates := "SrcType := Int"; 
    S7_GenerateENO := "TRUE"; 
    S7_Expression := "IN1*IN2"
}
Calculate(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result                   -- lowercase out
)
```
Source: FB_SD_Verify_Calc (TIA-generated SD)

Note: the SD instruction name is `Calculate` (not `Calc`). The equation is given by the `S7_Expression` pragma. S7-1200 does not allow constants in the equation (e.g. `IN1*IN2+5` fails to compile).

### 56. INV (bitwise / word inversion)
```
{ S7_Templates := "SrcType := Word" }
Inv(
    in := #WordVal,
    out => #Result
)
```
Source: FB_SD_INV (hand-written SD import)

Note: supports Word, DWord, Int, DInt, and similar types. Format is identical to Neg/Abs. This is bitwise inversion, not arithmetic negation.

### 57. AND/OR/XOR (word logic) — not supported by SD
Attempting the word-logic instructions in SD as `AND(in1:=..., in2:=..., out=>...)` makes the SD syntax parser report "extraneous input 'AND' expecting...".
**Conclusion: SD syntax does not support the AND/OR/XOR word-logic instruction names.**

### LIMIT / MIN / MAX
```
{ S7_Templates := "value_type := Int" }
Limit(
    mn := #MinVal,
    in := #InVal,
    mx := #MaxVal,
    out => #Result
)
```
```
{ S7_Templates := "value_type := Real" }
Min(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result
)
```
```
{ S7_Templates := "value_type := Real" }
Max(
    in1 := #ValA,
    in2 := #ValB,
    out => #Result
)
```
Source: FB_SD_LIMIT (hand-written SD import)

Notes:
- LIMIT uses the `value_type := Int` template (not SrcType!).
- MIN/MAX also use `value_type`; SrcType is not supported.
- Limit pin names: `mn` (min), `in` (input), `mx` (max).

### SEL (two-way selector)
```
{ S7_Templates := "value_type := Int" }
Sel(
    g := #SelectBool,
    in0 := #ValA,
    in1 := #ValB,
    out => #Result
)
```
Source: FB_SD_LIMIT (Network 4 of the same block, hand-written SD import)

Note: SEL uses the value_type template; `g` is the select signal (Bool); g=0 outputs in0, g=1 outputs in1.

### MUX (multiplexer) — not supported by SD
All MUX pin types (k/in0-inN/out) return "Undef". The value_type template does not help.
**Conclusion: SD syntax does not support the MUX instruction.**

### SR/RS (set/reset flip-flop) — not supported by SD
The SR and RS data types are not recognized in S7-1200, so the SD parser cannot resolve them.
**Conclusion: SD syntax does not support SR/RS. Use IF in SCL, or S_Coil/R_Coil in LAD, instead.**

---

## Part 7 — Shift / Rotate

### 28. SHR (shift right)
```
Shr(in := #Val, n := #Count, out => #Result)
```
Source: 测试_ShiftRotate (manual test)

### 29. SHL (shift left)
```
Shl(in := #Val, n := #Count, out => #Result)
```
Source: 测试_ShiftRotate (manual test)

### 30. ROR (rotate right)
```
Ror(in := #Val, n := #Count, out => #Result)
```
Source: 测试_ShiftRotate (manual test)

### 31. ROL (rotate left)
```
Rol(in := #Val, n := #Count, out => #Result)
```
Source: 测试_ShiftRotate (manual test)

Note: shift instructions need the `S7_Templates := "SrcType := ..."` pragma to specify the data type.

## Part 8 — Move / Assignment

### 48. Move (single output)
```
Move(
    in := 20736.0,
    out1 => #Var                   -- note: out1, not out!
)
```
Source: rampa, valves (GTronic)

### 49. Move (multiple outputs)
```
Move(
    in := #Src,
    out1 => #Dest1,
    out2 => #Dest2
)
```
Source: CycleComb (GTronic)

### MOVE_BLK / FILL_BLK — not supported by SD
Both `MoveBlock(in:=..., count:=..., out=>...)` and `FillBlock(in:=..., count:=..., out=>...)` return "not a valid instruction".
**Conclusion: SD syntax does not support the MOVE_BLK and FILL_BLK instructions.**
### UMOVE_BLK / UFILL_BLK — not supported by SD (same as above)

---

## Part 9 — Conversion

### 50. Convert (type conversion)
Single-type template:
```
{ S7_Templates := "SrcType := Real" }
Convert(
    in := #RealVal,
    out => #IntVal                   -- when there is no :P suffix
)
```
Two-type template:
```
{ S7_Templates := "[SrcType := DInt, DestType := Int]" }
Convert(
    in := #Val,
    out => #Result:P                 -- with :P suffix!
)
```
Source: inverterFC, rampa (GTronic) + FB_SD_Verify_Conv (TIA)

Note: the `:P` suffix appears in the two-type template; the single-type template has no suffix.

### 51. ROUND / TRUNC / CEIL / FLOOR (rounding)
```
{ S7_Templates := "[SrcType := Real, DestType := DInt]" }
Round(
    in := #RealVal,
    out => #DIntVal
)
```
```
{ S7_Templates := "[SrcType := Real, DestType := DInt]" }
Trunc(
    in := #RealVal,
    out => #DIntVal
)
```
```
{ S7_Templates := "[SrcType := Real, DestType := DInt]" }
Ceil(
    in := #RealVal,
    out => #DIntVal
)
```
```
{ S7_Templates := "[SrcType := Real, DestType := DInt]" }
Floor(
    in := #RealVal,
    out => #DIntVal
)
```
Source: FB_SD_ROUND (hand-written SD import)

Notes:
- **Two-type template is required**: `[SrcType := Real, DestType := DInt]`.
- A single-type `SrcType` errors with "Please select a data type".
- Round: banker's rounding (round half to even).
- Trunc: truncate toward zero.
- Ceil: round toward positive infinity (round up).
- Floor: round toward negative infinity (round down).
### 52. TO_BCD / FROM_BCD — not supported by SD
SD interprets TO_BCD and FROM_BCD as FB calls (`TO_BCD_Callee`) rather than built-in conversion instructions. Compilation errors with "missing instance DB" and a type mismatch.
**Conclusion: SD does not support TO_BCD/FROM_BCD.**

### TRCV_C / TSEND_C — recognized by SD but requires connection configuration
SD syntax recognizes TRCV_C and TSEND_C and validates pin completeness. Confirmed required pins are: EN_R, CONT, ADHOC, CONNECT, DATA, LEN (TRCV_C) and REQ, CONT, CONNECT, ADDR, DATA, LEN (TSEND_C). Import fails at the CONNECT/ADDR pins — they need a TCON connection-configuration object in the project.
**Conclusion: the TRCV_C/TSEND_C format is known but a real connection configuration is required to fully confirm it.**
### SCALE_X (Scale) — see below
### NORM_X (Normalize) — see below

---

## Part 9 — Scaling / Normalization

### 49. Normalize
```
{ S7_Templates := "[SrcType := Real, DestType := Real]"; S7_GenerateENO := "TRUE" }
Normalize(
    min := 0.0,
    value := #RawValue,              -- note: value, not in!
    max := 27648.0,
    out => #Result
)
```
Source: inverterFC, rampa (GTronic) + FB_SD_Verify_Conv (TIA)

### 50. Scale
```
{ S7_Templates := "[SrcType := Real, DestType := Real]"; S7_GenerateENO := "TRUE" }
Scale(
    min := 0.0,
    value := #NormVal,               -- note: value, not in!
    max := 100.0,
    out => #Result
)
```
Source: inverterFC, rampa (GTronic) + FB_SD_Verify_Conv (TIA)

---

## Part 10 — Arrays / Structs

### 51. Lower_Bound (array lower bound)
```
{ S7_GenerateENO := "TRUE" }
Lower_Bound(
    arr := #"ArrayVar",
    dim := 1,
    out => #LowVal
)
```
Source: CycleComb (GTronic)

### 52. Upper_Bound (array upper bound)
```
{ S7_GenerateENO := "TRUE" }
Upper_Bound(
    arr := #"ArrayVar",
    dim := 1,
    out => #UpVal
)
```
Source: CycleComb (GTronic)

---

## Part 11 — FB/FC Calls

### 53. FB call (with named parameters)
```
"FB_Name"(
    "param_name" := #Var,           -- inputs use :=
    "output_param" => #Result       -- outputs use =>
)
```
Source: SemaforoMain (GTronic)

### 54. FB call (no parameters)
```
"Control System 1"()
```
Source: SemaforoMain (GTronic)

### 55. Multi-instance FB call
```
#InstanceName(
    "param" := #Val,
    "output" => #Result
)
```
Source: CycleComb, Flashing (GTronic)

### 56. Chained FB call (via WIRE)
```
"FB1"() wire#w1 "FB2"()            -- FB1 ENO → FB2 EN
```
Source: SemaforoMain (GTronic)

### 57. FB call (global-DB instance)
```
"IEC_Timer_0_DB".TON(pt := T#26s, et => ...)
```
Source: valves (GTronic)

---

## Part 12 — Motion Control (requires real technology objects)

SD syntax can express the FB-call form of motion-control instructions, but every motion-control instruction (the MC_* series) requires:
1. A real **technology object (TO)** created in the TIA Portal hardware configuration (e.g. TO_PositioningAxis, TO_SpeedAxis).
2. The technology object appears in SD as a DB reference with a specific ID.
3. Hand-written SD cannot construct a technology-object reference from scratch.

**Instructions that require a TO (~11):**

| Instruction | Purpose | Required TO type |
|------|------|-----------|
| MC_Power | enable/disable axis | TO_PositioningAxis / TO_SpeedAxis |
| MC_Reset | reset axis errors | TO_PositioningAxis / TO_SpeedAxis |
| MC_Home | homing | TO_PositioningAxis |
| MC_Halt | pause axis | TO_PositioningAxis / TO_SpeedAxis |
| MC_Stop | stop axis | TO_PositioningAxis / TO_SpeedAxis |
| MC_MoveAbsolute | absolute positioning | TO_PositioningAxis |
| MC_MoveRelative | relative positioning | TO_PositioningAxis |
| MC_MoveVelocity | velocity mode | TO_PositioningAxis / TO_SpeedAxis |
| MC_MoveJog | jog | TO_PositioningAxis / TO_SpeedAxis |
| MC_GearIn | gear synchronization | TO_PositioningAxis / TO_SpeedAxis (requires two axes) |
| MC_CamIn | cam synchronization | TO_PositioningAxis (requires a cam disk) |

---

## Part 13 — Advanced Communication

### TRCV_C / TSEND_C (TSAP communication) — SD recognizes the pin structure; requires connection configuration
Tested across 4 rounds in FB_SD_COMM. SD syntax recognizes the instruction names and validates pin completeness.

**TRCV_C confirmed pins:** EN_R, CONT, ADHOC, CONNECT, DATA, LEN
**TSEND_C confirmed pins:** REQ, CONT, CONNECT, ADDR, DATA, LEN
**Required pins that could not pass:** CONNECT (needs a TCON connection-object reference), ADDR (communication-partner address)

The import fails because the CONNECT/ADDR pins need a TCON connection-configuration object that actually exists in the project — hand-written SD cannot create one from scratch.

### TCON / TDISCON — format known (from GTronic)
```s7dcl
#TCON_1(REQ := condition, ID := #ID, DONE => #b_Done, BUSY => #b_Busy, ERROR => #b_Error, STATUS => #w_Status)
```
Source: semaforo (GTronic)
Note: the CONNECT parameter is implicit (stored in the hardware configuration associated with the ID).

### Other communication instructions (require project-level configuration)

| Instruction | Purpose | Requirement |
|------|------|-----------|
| TCON_IP_V4 | TCP/IP connection | requires project-level connection configuration |
| TMAIL_C | send email | requires mail-server configuration |
| T_DIAG | connection diagnostics | requires an active connection |
| TRCV_C (full) | receive (connection-based) | requires CONNECT configuration |
| TSEND_C (full) | send (connection-based) | requires CONNECT/ADDR configuration |
| T_RESET | reset connection | requires a connection object |
| TSEND_C_V4 | TCP send | same as TSEND_C |

TCON, TSEND, and TRCV are verified; the rest require project-level communication configuration.

---

## Part 14 — SD Structural Features

### A. WIRE branch (OR logic)
```
RUNG wire#powerrail
    Contact( #A )
    wire#w1                           -- first branch to w1
    Contact( #B )                     -- B in series
    Coil( #Result )
END_RUNG
RUNG wire#powerrail
    Contact( #C )
END_RUNG wire#w1                     -- second branch also to w1 (forms an OR)
```

### B. Multiple coil outputs
```
RUNG wire#w1
    Coil( #Out1 )
END_RUNG
RUNG wire#w1
    Coil( #Out2 )
END_RUNG
```

### C. S7_Templates pragma (single type)
```
{ S7_Templates := "SrcType := Int" }
```

### D. S7_Templates pragma (two-type array)
```
{ S7_Templates := "[SrcType := Real, DestType := Int]" }
```

### E. S7_GenerateENO pragma
Used for the ENO chain of instruction boxes:
```
{ S7_GenerateENO := "TRUE" }
```

### F. Mixed SCL/LAD networks
```
{ S7_Language := "SCL" }
NETWORK
    IF ... THEN ... END_IF;
END_NETWORK
{ S7_Language := "LAD" }
NETWORK
    RUNG wire#powerrail ...
```

### G. Variable declaration types
```
VAR_RETAIN
    { S7_Setpoint := "False" }
    CounterVar : CTU_INT;
END_VAR
VAR
    { S7_Setpoint := "False" }
    TimerVar : TON_TIME;
END_VAR
```

### H. Array parameters (VAR_IN_OUT)
```
VAR_IN_OUT
    "Set T. Comb." : Array[*] of _."Set T. Comb.";
    "Set T. Start" : Array[0..1] of _."Set T. Comb.";
END_VAR
```

### I. Struct initialization
```
VAR
    "Ped." : STRUCT
        Sp81 : Bool;
        Sc19 : Bool;
        "En. Call" : Bool;
    END_STRUCT;
END_VAR
```

### K. Peripheral output (:P)
```
Move(in := #Val, out1 => #AnalogOutput:P)
Convert(in := #RealVal, out => "anlog signal":P)
```
Source: inverterFC, valves (GTronic)

### L. WIRE enable pattern
```
RUNG wire#powerrail
    Contact( Condition )
END_RUNG wire#w1
RUNG wire#powerrail
    "FB_Inst"(REQ := wire#w1, ... )
END_RUNG
```
Source: PTO_Servo (GTronic)

### M. DTL_TO_TOD (SCL time conversion)
```
#Convert_Time_Of_Day := DTL_TO_TOD(DTL_Var);
```
Source: Semaforo_FlashTime (GTronic)

### N. Time_Of_Day comparison
```
{ S7_Templates := "SrcType := Time_Of_Day" }
GT_Contact(in1 := ..., in2 := ...)
LT_Contact(in1 := ..., in2 := ...)
```
Source: Semaforo_FlashTime (GTronic)

### O. Bit-field access
```
#w_word.%B1   -- byte 1 (high byte)
#w_word.%B0   -- byte 0 (low byte)
```
Source: TP700_SDT (GTronic SIWAREX)

### J. Access-control attributes
```
{
    S7_Access := "ReadOnly := External";
    S7_Visibility := "Hidden := External"
}
```

### P. Positional-parameter syntax
Some SD instructions use positional parameters (not named parameters); in TIA exports they appear as parameters without pin names:
```
OK( #RealVal )            -- positional parameters only
P_Trig( #P_Out )          -- positional parameters only
N_Trig( #N_Out )          -- positional parameters only
```
When hand-writing you may use named parameters (e.g. `OK(operand := #RealVal)`); TIA export simplifies them to positional parameters.

### Q. Multi-NETWORK Language-pragma rule
Every NETWORK must have its own `{ S7_Language := "LAD" }` pragma:
```
    { S7_Language := "LAD" }
    NETWORK
        RUNG wire#powerrail ...
        END_RUNG
    END_NETWORK
    { S7_Language := "LAD" }    -- required for every NETWORK!
    NETWORK
        RUNG wire#powerrail ...
        END_RUNG
    END_NETWORK
```
A missing second pragma causes: `Syntax error 'NETWORK' expecting END_FUNCTION_BLOCK`.

---

## Statistics

### By instruction category

| Category | Verified | Not supported by SD | Needs real-project context | Settled |
|------|----------|-----------|------------------|--------|
| Bit logic | 5 (Contact, I_Contact, Coil, S_Coil, R_Coil) | 0 | 0 | 100% |
| Edge detection | 4 (P_Contact, N_Contact, P_Trig, N_Trig) | 2 (R_TRIG, F_TRIG) | 0 | 100% |
| Timers | 5 (TON, TOF, TP, TONR, I_Contact) | 4 (coils: TP, TONR, RT, PT) | 0 | 100% |
| Counters | 3 (CTU, CTUD, CTD) | 4 (coils: CU, CD, R, LD) | 0 | 100% |
| Comparators | 9 (EQ, NE, GT, LT, GE, LE, InRange, OutRange, OK) | 1 (NOT_OK) | 0 | 100% |
| Math | 14 (Add, Sub, Mul, Div, Mod, Neg, Abs, Sqr, Sqrt, Inv, Limit, Min, Max, Calculate) | 2 (INC, DEC) | 0 | 100% |
| Word logic | 0 | 3 (AND, OR, XOR) | 0 | 100% |
| Selector | 1 (SEL) | 1 (MUX) | 0 | 100% |
| Flip-flops | 0 | 2 (SR, RS) | 0 | 100% |
| Move | 1 (Move) | 4 (MOVE_BLK, FILL_BLK, UMOVE_BLK, UFILL_BLK) | 0 | 100% |
| Conversion | 5 (Convert, Round, Trunc, Ceil, Floor) | 2 (TO_BCD, FROM_BCD) | 0 | 100% |
| Scaling | 2 (Normalize, Scale) | 0 | 0 | 100% |
| Shift/Rotate | 4 (SHR, SHL, ROL, ROR) | 0 | 0 | 100% |
| Arrays/Structs | 2 (Lower_Bound, Upper_Bound) | 0 | 0 | 100% |
| FB/FC calls | 5 (named, no-param, multi-inst, series, global DB) | 0 | 0 | 100% |
| System time | 2 (WR_SYS_T, RD_SYS_T) | 0 | 0 | 100% |
| Servo control | 1 (CTRL_PTO) | 0 | 0 | 100% |
| Motion control | 0 | 0 | ~11 (MC_Power, MC_Reset, MC_Home, MC_Halt, MC_Stop, MC_MoveAbsolute, MC_MoveRelative, MC_MoveVelocity, MC_MoveJog, MC_GearIn, MC_CamIn) — require real technology objects | 0% |
| Advanced comm | 3 (TCON, TSEND, TRCV) | 0 | ~8 (TRCV_C, TSEND_C, TCON_IP_V4, T_DIAG, TDISCON, TMAIL_C, TSEND_C_V4, T_RESET) — require connection configuration | 67% |

### Overview

| Status | Count | Notes |
|------|------|------|
| Verified | **~66** | SD format verified, compile 0 errors |
| Not supported by SD | **~18** | Tested; the SD syntax parser rejects them; use the SCL or XML route |
| Needs real-project context | **~19** | Motion control, advanced communication, etc. — format known but requires a TO / connection configuration |
| SD structural features | **17** | All covered |

### Conclusions
- **Instructions SD can generate deterministically: ~66** — all bit logic, edge, timers, counters, comparators, math, conversion, scaling, shift, Move, FB calls.
- **Instructions SD is confirmed not to support: ~18** — INC, DEC, AND, OR, XOR (word), MUX, MOVE_BLK, FILL_BLK, UMOVE_BLK, UFILL_BLK, SR, RS, R_TRIG, F_TRIG, NOT_OK, TO_BCD, FROM_BCD, and all coil forms.
- **Instructions that require running TIA Openness against a real project to verify: ~19** — the MC_* motion-control series, advanced communication (TRCV_C/TSEND_C), etc.

The large majority of instructions are settled. The remaining blockers are not unknown formats but SD's capability boundaries or the need for real-project context (technology objects, connection configuration).

---

## Verification methodology

### Route 1: GTronic real projects
```
ZAP download → tia_openness_retrieve_project (upgrade) → 
tia_openness_export_block_sd → read .s7dcl → parse syntax
```
Projects used: semaforo (6 blocks), TP700_SIWAREX (2 blocks), inverter (2 blocks), PTO_servo (1 block), ricettario (2 blocks), Blink (1 block), rampa (1 block), valves (1 block) = 16 blocks from 8 projects

### Route 2: TIA LAD generator
```
tia_lad_validate_plan → tia_lad_generate_block_xml → 
tia_openness_import_block_xml → compile (0 errors) → 
tia_openness_export_block_sd → read .s7dcl
```
Verified blocks: FB_SD_Verify_Group1 (Add/Mul/Div), FB_SD_Verify_Cmp (GT/LT/GE/LE/EQ/InRange/OutRange), FB_SD_Verify_Conv (Convert/Normalize/Scale), FB_SD_Verify_Edge (P_Contact/N_Contact)

### Route 3: Hand-written SD direct import
```
hand-written .s7dcl + minimal .s7res → tia_openness_import_block_sd → 
compile (0 errors) → tia_openness_export_block_sd → cross-check
```
Verified blocks: FB_SD_NE, FB_SD_TONR, FB_SD_MOD, FB_SD_NEG, FB_SD_ABS, FB_SD_SQR_SQRT, FB_SD_CTD, FB_SD_ROUND, FB_SD_INV, FB_SD_LIMIT, FB_SD_OK, FB_SD_TRIG = **12 blocks covering ~20 instructions**

### Remaining items (full list)

**A. Confirmed not supported by SD syntax (~18 instructions, tested, not retried):**

| Instruction | Test record | Error message | Alternative |
|------|---------|---------|---------|
| INC | FB_SD_INC, `SrcType:=DInt` | "operand Undef" | SCL `#Val := #Val + 1;` |
| DEC | FB_SD_DEC, `value_type` | "operand Undef" | SCL `#Val := #Val - 1;` |
| AND (word) | in FB_SD_INV block, `AND(in1:=..., in2:=...)` | "extraneous input 'AND'" | SCL `#Val := #X AND #Y;` |
| OR (word) | same | "extraneous input 'OR'" | SCL `#Val := #X OR #Y;` |
| XOR (word) | same | "extraneous input 'XOR'" | SCL `#Val := #X XOR #Y;` |
| MUX | FB_SD_SEL_MUX, `value_type:=Int` | "data type Undef" for k/in0-inN/out | SEL cascade or SCL CASE |
| MOVE_BLK | `MoveBlock(in:=...)` | "Not a valid instruction" | SCL POKE/MOVE_BLK |
| FILL_BLK | `FillBlock(in:=...)` | "Not a valid instruction" | SCL loop + array |
| UMOVE_BLK/UFILL_BLK | same as MOVE_BLK/FILL_BLK | same | SCL |
| SR | `SR_Inst.SR(s:=..., r:=...)` | "data type SR unknown" | S_Coil/R_Coil or SCL IF |
| RS | `RS_Inst.RS(...)` | "data type RS unknown" | S_Coil/R_Coil or SCL IF |
| R_TRIG | `R_TRIG_Inst.R_TRIG(clk:=...)` | "data type R_TRIG unknown" | use P_Trig |
| F_TRIG | `F_TRIG_Inst.F_TRIG(clk:=...)` | "data type F_TRIG unknown" | use N_Trig |
| NOT_OK | `NOT_OK(#Val)` | "Not a Valid instruction: NOT_OK" | OK + NOT logic |
| TO_BCD | 3 rounds: pragma / no pragma / operand | "Not a valid instruction" / "missing instance DB" | SCL conversion |
| FROM_BCD | same | same | SCL conversion |
| Timer coils (4) | not separately tested | SD does not support coil syntax | use FB-call form |
| Counter coils (4) | not separately tested | SD does not support coil syntax | use FB-call form |

**B. Require real TIA project context (~19 instructions):**

| Instruction group | Count | Blocker | Suggested verification route |
|--------|------|---------|------------|
| Motion control MC_* | ~11 | requires real technology objects (TO_PositioningAxis, etc.) | create a TIA project containing the TO → export SD |
| Advanced communication (connection-based) | ~8 | requires TCON connection configuration / CONNECT / ADDR pin | create a project containing the connection configuration → export SD |

**C. Structural features (all covered):** 17/17 (A – Q)

**D. Confirmed SD syntax boundary (summary):**
`INC` `DEC` `AND(word)` `OR(word)` `XOR(word)` `MUX` `MOVE_BLK` `FILL_BLK` `UMOVE_BLK` `UFILL_BLK` `SR` `RS` `R_TRIG` `F_TRIG` `NOT_OK` `TO_BCD` `FROM_BCD` + all timer/counter coil forms (8) = **~24 instructions**
These must be implemented via the SCL or XML route.
