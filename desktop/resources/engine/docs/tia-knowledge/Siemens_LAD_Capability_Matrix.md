# Siemens TIA Portal LAD Instruction Generator — Full Capability Matrix

> **Goal**: Provide an accurate instruction-coverage list for the `tia_lad_generate_block_xml` / `tia_lad_validate_plan` tool chain.
> **Audience**: Developers — reference for improving the generator implementation.
> **Date**: 2025-07
> **Evidence sources**:
> - **local-export**: `evidence/tia-lad-projects/exported-xml/` (193 exported XML files from 70 real TIA V18 projects)
> - **plan-verified**: verified through `tia_lad_validate_plan` + `tia_lad_generate_block_xml`
> - **siemens-doc**: Siemens TIA Portal V20 official instruction documentation

---

## 1. Status Labels

| Label | Meaning | Effect on the generator |
|------|------|----------------|
| ✅ **implemented** | Generator complete and stable; fixed format | Generate directly; reliable |
| 🟡 **guarded** | Generator exists but with a narrow format constraint; port names are not uniform | Check this table for each instruction's port names |
| 🔴 **template_required** | No generator; only a real TIA exported XML template | Cannot generate directly; must use the hand-edited XML template route |

---

## 2. Bit Logic — Contacts and Coils

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port (NameCon.Name) | Template Values | Evidence | Notes |
|------------------------|------|------------|---------------------------|-----------------|------|------|
| `Contact` | ✅ implemented | `--\| \|--` (NO) | `pre`, `bit`, `operand`, `out` | none | local-export | NO contact; pre = EN terminal |
| `NContact` | ✅ implemented | `--\|/\|--` (NC) | `pre`, `bit`, `operand`, `out` | none | local-export | NC contact |
| `Coil` | ✅ implemented | `--( )--` | `pre`, `in`, `operand`, `bit` | none | local-export | Standard coil |
| `SCoil` | ✅ implemented | `--(S)--` | `pre`, `in`, `operand` | none | local-export | Set coil |
| `RCoil` | ✅ implemented | `--(R)--` | `pre`, `in`, `operand` | none | local-export | Reset coil |
| `NOT` / `not_rlo` | 🔴 template_required | `--\|NOT\|--` | requires real exported XML | unknown | siemens-doc | Invert |
| `NegCoil` | 🔴 template_required | `--(/)--` | requires real exported XML | unknown | siemens-doc | Negated coil |
| `SET_BF` | 🔴 template_required | `SET_BF` | requires real exported XML | unknown | siemens-doc | Set bit field |
| `RESET_BF` | 🔴 template_required | `RESET_BF` | requires real exported XML | unknown | siemens-doc | Reset bit field |
| `O` (OR) | special | parallel branch | handled automatically by the generator | none | local-export | branches[] → OR logic |

### plan_json contact/coil format (verified)
```json
// NO contact
{"operand": {"name": "StartPB", "scope": "GlobalVariable"}}
// NC contact
{"kind": "nc_contact", "operand": {"name": "StopPB", "scope": "GlobalVariable"}}
// Coil
{"coil": {"kind": "coil", "operand": {"name": "MotorRun", "scope": "GlobalVariable"}}}
// Set / reset coil
{"coil": {"kind": "set_coil", "operand": {"name": "FaultActive"}}}
{"coil": {"kind": "reset_coil", "operand": {"name": "FaultActive"}}}
```

---

## 3. Bit Logic — Latches and Edges

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `SR` | 🔴 template_required | `SR` reset-dominant (opposite of IEC naming) | S, R1, Q | unknown | siemens-doc | **State-machine core instruction; urgently needed** |
| `RS` | 🔴 template_required | `RS` set-dominant (opposite of IEC naming) | R, S1, Q | unknown | siemens-doc | **Same as above; urgently needed** |
| `PContact` | 🟡 guarded | `--\|P\|--` | `pre`, `bit` (M_BIT), `operand`, `out` | none | local-export | Rising-edge contact |
| `NContact` (edge) | 🟡 guarded | `--\|N\|--` | same as PContact | none | by-analogy | Falling-edge contact |
| `PBox` | 🟡 guarded | `P` edge box | `en`, `bit`, `operand`, `out` | none | local-export | P_TRIG box form |
| `P_TRIG` | 🔴 template_required | `P_TRIG` | CLK, Q | unknown | siemens-doc | |
| `N_TRIG` | 🔴 template_required | `N_TRIG` | CLK, Q | unknown | siemens-doc | |
| `R_TRIG` | 🟡 guarded | `R_TRIG` | CLK, Q | constrained generator shape | local-generator | Common; confirm via import/compile/readback |
| `F_TRIG` | 🟡 guarded | `F_TRIG` | CLK, Q | constrained generator shape | local-generator | Common; confirm via import/compile/readback |
| `--(P)--` | 🔴 template_required | `--(P)--` edge coil | requires real exported XML | unknown | siemens-doc | |
| `--(N)--` | 🔴 template_required | `--(N)--` edge coil | requires real exported XML | unknown | siemens-doc | |

---

## 4. Timers

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `TON` | ✅ implemented | `TON` on-delay | `pre`, `en`, `eno`, `in`, `pt`, `q`, `et` | none | local-export + plan-verified | **Stable; passes on first try** |
| `TP` | 🟡 guarded | `TP` pulse | same as TON | none | plan-verified | Same format as TON |
| `TOF` | 🔴 template_required | `TOF` off-delay | IN, PT, Q, ET | unknown | siemens-doc | **Common; missing** |
| `TONR` | 🔴 template_required | `TONR` retentive on-delay | IN, R, PT, Q, ET | unknown | siemens-doc | Accumulating timer |
| `-(TON)-` | 🔴 template_required | coil-form TON | requires real exported XML | unknown | siemens-doc | Legacy form |
| `-(TOF)-` | 🔴 template_required | coil-form TOF | requires real exported XML | unknown | siemens-doc | |
| `-(TP)-` | 🔴 template_required | coil-form TP | requires real exported XML | unknown | siemens-doc | |
| `-(TONR)-` | 🔴 template_required | coil-form TONR | requires real exported XML | unknown | siemens-doc | |
| `-(RT)-` | 🔴 template_required | reset timer | requires real exported XML | unknown | siemens-doc | |
| `-(PT)-` | 🔴 template_required | preset timer | requires real exported XML | unknown | siemens-doc | |

### plan_json timer format (verified)
```json
// TON
{
  "type": "timer", "timer": "TON",
  "instance": {"name": "StepTimer"},
  "input": {"name": "TimerEnable"},
  "pt": {"constant_value": "T#5s", "datatype": "Time", "name": "T#5s"},
  "q": {"name": "TimerDone"},
  "et": {"name": "ElapsedTime"}
}
// TP: set "timer": "TP"
```

### TOF / TONR gap impact
In pure LAD, off-delay (TOF) and retentive on-delay (TONR) are common in equipment-protection logic (e.g., a motor cannot restart until a delay elapses after stopping). The only current workaround is a hand-edited XML template plus import.

---

## 5. Counters

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `CTU` | 🟡 guarded | `CTU` count up | **`CU`, `R`, `PV`, `CV`, `QU`** (uppercase) | `value_type: "Int"` | plan-verified | **Verified** |
| `CTUD` | 🟡 guarded | `CTUD` up/down count | **`CU`, `CD`, `R`, `PV`, `CV`, `QU`, `QD`** | `value_type: "Int"` | by-analogy | Ports follow the CTU uppercase pattern |
| `CTD` | 🟡 guarded | `CTD` count down | CD, LD, PV, CV, QD | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `-(CU)-` | 🔴 template_required | coil-form count up | requires real exported XML | unknown | siemens-doc | |
| `-(CD)-` | 🔴 template_required | coil-form count down | requires real exported XML | unknown | siemens-doc | |
| `-(R)-` (counter) | 🔴 template_required | counter reset coil | requires real exported XML | unknown | siemens-doc | |
| `-(LD)-` | 🔴 template_required | counter load coil | requires real exported XML | unknown | siemens-doc | |

### plan_json counter format (verified: CTU)
```json
{
  "type": "instruction_box", "part_name": "CTU",
  "instance": {"name": "LayerCTU"},
  "template_values": [{"name": "value_type", "value": "Int"}],
  "box_inputs": [
    {"port": "CU", "operand": {"name": "CountPulse"}},
    {"port": "R", "operand": {"name": "ResetCnt"}},
    {"port": "PV", "operand": {"constant_value": "50", "datatype": "Int", "name": "50"}}
  ],
  "box_outputs": [
    {"port": "CV", "operand": {"name": "CurrentCount"}},
    {"port": "QU", "operand": {"name": "CountReached"}}
  ]
}
```

---

## 6. Compare

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `Eq` | 🟡 guarded | `CMP ==` | **`in1`, `in2`, `out`** (lowercase) + `pre`, `en`, `eno` | `SrcType: "Int"` | plan-verified | **Verified** |
| `Ge` | 🟡 guarded | `CMP >=` | same as Eq (lowercase) | `SrcType: "Int"` | plan-verified | **Verified** |
| `Gt` | 🟡 guarded | `CMP >` | same as Eq (lowercase) | `SrcType: "Int"` | by-analogy | Same format as Eq |
| `Lt` | 🟡 guarded | `CMP <` | same as Eq (lowercase) | `SrcType: "Int"` | by-analogy | Same format as Eq |
| `Le` | 🟡 guarded | `CMP <=` | same as Eq (lowercase) | `SrcType: "Int"` | by-analogy | Same format as Eq |
| `NE` | 🟡 guarded | `CMP <>` | comparison ports derived by the generator | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `InRange` | 🟡 guarded | `IN_RANGE` | `pre`, `min`, `in`, `max`, `out` | `SrcType: "Int"` | local-export | 35 local templates |
| `OutRange` | 🟡 guarded | `OUT_RANGE` | same as InRange | `SrcType: "Int"` | by-analogy | Same format as InRange |
| `OK` | 🔴 template_required | `OK` check | requires real exported XML | unknown | siemens-doc | |
| `NOT_OK` | 🔴 template_required | `NOT_OK` check | requires real exported XML | unknown | siemens-doc | |

### plan_json compare format (verified)
```json
// Eq / Ge / Gt / Lt / Le
{
  "type": "instruction_box", "part_name": "Eq",
  "template_values": [{"name": "SrcType", "value": "Int"}],
  "enable": {"name": "AlwaysTRUE", "scope": "GlobalVariable"},
  "box_inputs": [
    {"port": "in1", "operand": {"name": "CurrentLayer"}},
    {"port": "in2", "operand": {"constant_value": "50", "datatype": "Int", "name": "50"}}
  ],
  "box_outputs": [
    {"port": "out", "operand": {"name": "TargetReached"}}
  ]
}
// InRange
{
  "type": "instruction_box", "part_name": "InRange",
  "template_values": [{"name": "SrcType", "value": "Int"}],
  "box_inputs": [
    {"port": "min", "operand": {"constant_value": "0", "datatype": "Int", "name": "0"}},
    {"port": "in", "operand": {"name": "CheckValue"}},
    {"port": "max", "operand": {"constant_value": "100", "datatype": "Int", "name": "100"}}
  ],
  "box_outputs": [{"port": "out", "operand": {"name": "InRange"}}]
}
```

### Key issue: port-name casing is inconsistent
- Comparison (Eq/Ge/Gt/Lt/Le): `in1`, `in2`, `out` — **lowercase**
- Counters (CTU/CTUD): `CU`, `R`, `PV`, `CV`, `QU` — **uppercase**
- Mixing both in the same plan_json is very error-prone

---

## 7. Math

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `Add` | 🟡 guarded | `ADD` | `pre`, `en`, `in1`, `in2`, `out` | `Card: "2"`, `SrcType: "Int"` | local-export | |
| `Sub` | 🟡 guarded | `SUB` | same as Add | `Card: "2"`, `SrcType: "Int"` | local-export | |
| `Mul` | 🟡 guarded | `MUL` | `en`, `in1`, `in2`, `out` | `Card: "2"` | local-export | **Port names verified** |
| `Div` | 🟡 guarded | `DIV` | same as Add/Mul | `Card: "2"`, `SrcType` | by-analogy | Same format |
| `INC` | 🟡 guarded | `INC` | — | — | — | See §20 verification backlog |
| `DEC` | 🔴 template_required | `DEC` | requires real exported XML | unknown | siemens-doc | |
| `Calc` | 🟡 guarded | `CALCULATE` | `en`, `in1`, `in2`, `in3`..., `out` | `Card: "N"`, `SrcType` | local-export | N = number of inputs |
| `MOD` | 🟡 guarded | `MOD` modulo | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `NEG` | 🟡 guarded | `NEG` negate | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `ABS` | 🟡 guarded | `ABS` absolute value | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `SQR` | 🟡 guarded | `SQR` square | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `SQRT` | 🟡 guarded | `SQRT` square root | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |

### plan_json math instruction format
```json
// Add / Sub / Mul / Div
{
  "type": "instruction_box", "part_name": "Add",
  "template_values": [
    {"name": "Card", "value": "2"},
    {"name": "SrcType", "value": "Int"}
  ],
  "box_inputs": [
    {"port": "in1", "operand": {"name": "ValueA"}},
    {"port": "in2", "operand": {"name": "ValueB"}}
  ],
  "box_outputs": [{"port": "out", "operand": {"name": "Result"}}]
}
// Calc (N inputs)
{
  "type": "instruction_box", "part_name": "Calc",
  "template_values": [
    {"name": "Card", "value": "3"},
    {"name": "SrcType", "value": "DInt"}
  ],
  "box_inputs": [
    {"port": "in1", "operand": {"name": "A"}},
    {"port": "in2", "operand": {"name": "B"}},
    {"port": "in3", "operand": {"name": "C"}}
  ],
  "box_outputs": [{"port": "out", "operand": {"name": "CalcResult"}}]
}
```

---

## 8. Move

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `Move` | 🟡 guarded | `MOVE` | `pre`, `en`, `in`, `out` | `Card: "1"` | plan-verified | **Verified and usable** |
| `MOVE_BLK` | 🔴 template_required | `MOVE_BLK` | requires real exported XML | unknown | siemens-doc | |
| `UMOVE_BLK` | 🔴 template_required | `UMOVE_BLK` | requires real exported XML | unknown | siemens-doc | |
| `FILL_BLK` | 🔴 template_required | `FILL_BLK` | requires real exported XML | unknown | siemens-doc | |
| `UFILL_BLK` | 🔴 template_required | `UFILL_BLK` | requires real exported XML | unknown | siemens-doc | |
| `MOVE_BLK_VARIANT` | 🟡 guarded | `MOVE_BLK_VARIANT` | constrained generator shape | constrained generator shape | local-generator | Can generate; confirm via import/compile/readback |
| `Serialize` | 🔴 template_required | `SERIALIZE` | requires real exported XML | unknown | siemens-doc | |
| `Deserialize` | 🔴 template_required | `DESERIALIZE` | requires real exported XML | unknown | siemens-doc | |
| `VariantGet` | 🔴 template_required | `VariantGet` | requires real exported XML | unknown | siemens-doc | |
| `VariantPut` | 🔴 template_required | `VariantPut` | requires real exported XML | unknown | siemens-doc | |
| `VARIANT_TO_DB_ANY` | 🔴 template_required | `VariantToDB_ANY` | requires real exported XML | unknown | siemens-doc | |
| `DB_ANY_TO_VARIANT` | 🔴 template_required | `DB_ANYToVariant` | requires real exported XML | unknown | siemens-doc | |

### plan_json MOVE format (verified)
```json
{
  "type": "move",
  "input": {"name": "SourceValue"},
  "outputs": [{"name": "DestValue"}],
  "enable": {"name": "EnableMove", "scope": "GlobalVariable"}
}
```

---

## 9. Conversion

| Instruction (XML Part Name) | Status | Siemens UI | TIA XML port | Template Values | Evidence | Notes |
|------------------------|------|------------|-------------|-----------------|------|------|
| `Convert` | 🟡 guarded | `CONV` | `en`, `in`, `out` | `SrcType: "UInt"`, `DestType: "Int"` | local-export | **XML format verified** |
| `ROUND` | 🔴 template_required | `ROUND` | requires real exported XML | unknown | siemens-doc | |
| `TRUNC` | 🔴 template_required | `TRUNC` | requires real exported XML | unknown | siemens-doc | |
| `CEIL` | 🔴 template_required | `CEIL` | requires real exported XML | unknown | siemens-doc | |
| `FLOOR` | 🔴 template_required | `FLOOR` | requires real exported XML | unknown | siemens-doc | |
| `TO_BCD` | 🔴 template_required | `TO_BCD` | requires real exported XML | unknown | siemens-doc | |
| `FROM_BCD` | 🔴 template_required | `FROM_BCD` | requires real exported XML | unknown | siemens-doc | |
| `TO_CHAR` | 🔴 template_required | `TO_CHAR` | requires real exported XML | unknown | siemens-doc | |
| `CHAR_TO_STRING` | 🔴 template_required | `CHAR_TO_STRING` | requires real exported XML | unknown | siemens-doc | |
| `Scale_X` | 🟡 guarded | `SCALE_X` | `en`, `eno`, `min`, `value`, `max`, `out` | `SrcType`, `DestType` | local-export | **XML format verified** |
| `Normalize` | 🟡 guarded | `NORM_X` | `en`, `eno`, `min`, `value`, `max`, `out` | `SrcType`, `DestType` | local-export | **XML format verified** |

### plan_json CONV / Scale_X / NORM_X format
```json
// CONV
{
  "type": "instruction_box", "part_name": "Convert",
  "template_values": [
    {"name": "SrcType", "value": "UInt"},
    {"name": "DestType", "value": "Int"}
  ],
  "box_inputs": [{"port": "in", "operand": {"name": "RawValue"}}],
  "box_outputs": [{"port": "out", "operand": {"name": "ConvertedValue"}}]
}
// Scale_X
{
  "type": "instruction_box", "part_name": "Scale_X",
  "template_values": [
    {"name": "SrcType", "value": "Real"},
    {"name": "DestType", "value": "Real"}
  ],
  "box_inputs": [
    {"port": "min", "operand": {"constant_value": "0.0", "datatype": "Real", "name": "0.0"}},
    {"port": "value", "operand": {"name": "NormValue"}},
    {"port": "max", "operand": {"constant_value": "100.0", "datatype": "Real", "name": "100.0"}}
  ],
  "box_outputs": [{"port": "out", "operand": {"name": "ScaledValue"}}]
}
// NORM_X: same format as above
```

---

## 10. Word Logic / Shift / Select

**This section is not a uniform template_required list.** `instruction_catalog.rs` is the source of truth for current generator status. Word-logic/shift/select instructions marked `guarded` can generate a constrained shape but still require import, compile, and readback; only entries with no matching pattern are `template_required`.

| Instruction | Siemens UI | Expected ports |
|--------|------------|----------|
| `AND` (word) | AND (word AND) | IN1, IN2, OUT |
| `OR` (word) | OR (word OR) | IN1, IN2, OUT |
| `XOR` (word) | XOR (word XOR) | IN1, IN2, OUT |
| `INV` | INVERT | IN, OUT |
| `SHL` | SHL (shift left) | IN, N, OUT |
| `SHR` | SHR (shift right) | IN, N, OUT |
| `ROL` | ROL (rotate left) | IN, N, OUT |
| `ROR` | ROR (rotate right) | IN, N, OUT |
| `ENCO` | ENCO (encode) | IN, OUT |
| `DECO` | DECO (decode) | IN, OUT |
| `GATHER` | GATHER | multiple ports |
| `SCATTER` | SCATTER | multiple ports |
| `SEL` | SEL (select) | G, IN0, IN1, OUT |
| `MUX` | MUX (multiplex) | K, IN0-INn, OUT |
| `LIMIT` | LIMIT | MN, IN, MX, OUT |
| Other 7 | — | requires real exported XML |

> Note: the port names above are Siemens standard names, not the actual TIA XML port names (which are usually all lowercase in the XML).

---

## 11. String / Char

**Entries in this section follow the actual status in `instruction_catalog.rs`; string instructions with no matching pattern remain `template_required` — do not extend that status to the whole section.**

| Instruction | Siemens UI | Expected ports |
|--------|------------|----------|
| `CONCAT` | string concatenate | IN1, IN2, OUT |
| `LEFT` | left substring | IN, L, OUT |
| `RIGHT` | right substring | IN, L, OUT |
| `MID` | middle substring | IN, L, P, OUT |
| `LEN` | string length | IN, OUT |
| `FIND` | find | IN1, IN2, OUT |
| `INSERT` | insert | IN1, IN2, P, OUT |
| `DELETE` | delete | IN, L, P, OUT |
| `REPLACE` | replace | IN1, IN2, L, P, OUT |
| `VAL_STRG` | value to string | IN, SIZE, PREC, FORMAT, OUT |
| `STRG_VAL` | string to value | IN, FORMAT, P, OUT |

> Note: the port names above are Siemens standard names, not the actual TIA XML port names.

---

## 12. Date & Time

**Entries in this section follow the actual status in `instruction_catalog.rs`; date/time instructions with no matching pattern remain `template_required` — do not extend that status to the whole section.**

| Instruction | Siemens UI | Notes |
|--------|------------|------|
| `RD_SYS_T` | read system time | Real V18 template exists, but no generator |
| `WR_SYS_T` | write system time | Same as above |
| `RD_LOC_T` | read local time | |
| `WR_LOC_T` | write local time | |
| `T_CONV` | time conversion | |
| `T_ADD` | time addition | |
| `T_SUB` | time subtraction | |
| `T_DIFF` | time difference | |
| `T_COMB` | time combine | |
| `T_COMP` | time compare | |
| `SET_TIMEZONE` | set time zone | |

---

## 13. Communication

**All are 🔴 template_required.**

| Instruction | Type | Notes |
|--------|------|------|
| `TSEND_C` | Open Ethernet send | Siemens standard communication block |
| `TRCV_C` | Open Ethernet receive | |
| `PUT` | S7 PUT | |
| `GET` | S7 GET | |
| `MB_CLIENT` | Modbus TCP client | |
| `MB_SERVER` | Modbus TCP server | |
| `MODBUSPN` | Modbus RTU | |
| `RTM` | runtime hours meter | |

---

## 14. Technology / Motion / PID

**All are 🔴 template_required.** These instructions depend on project-specific technology object (TO) configuration, so a generic generator is not possible.

| Instruction | Type | Notes |
|--------|------|------|
| `PID_Compact` | PID control | Requires a technology object |
| `CTRL_HSC` | high-speed counter | |
| `CTRL_PWM` | pulse-width modulation | |
| `CTRL_PTO` | pulse-train output | |
| `MC_Power` | motion enable | Requires an axis TO |
| `MC_MoveVelocity` | velocity motion | |
| `MC_Stop` | motion stop | |
| `MC_Home` | homing | |
| Other MC_* | all motion control | 20+ instructions |

---

## 15. FB/FC Call

| Call type | Status | plan_json format | Evidence | Notes |
|----------|------|---------------|------|------|
| `fb_call` | ✅ implemented | `{"type":"fb_call","call_name":"FB_SafetyFault","instance":{"name":"Safety_Inst"},"parameters":[...]}` | plan-verified | **Stable** |
| `fc_call` | ✅ implemented | `{"type":"fb_call","call_name":"FC_Helper","parameters":[...]}` | plan-verified | |

---

## 16. 🚨 Architecture-level structural limits

These are not instruction-level issues but constraints of the overall generator architecture:

| Limit | Impact | Technical reason |
|--------|------|----------|
| **Only one leading OR branch group** (`branches[]`) | Complex seal-in (3+ start sources) must be split across multiple networks | FlgNet/v4 OR branch structure is fixed |
| **No nested / mid branches** | A condition chain like (A AND B) OR (C AND D) must be split across networks | Same as above |
| **No array-element access** | `Motor[1].Run` syntax is not supported | Access Symbol does not support indexing |
| **No EN/ENO cascading** | Multiple instruction boxes cannot be chained directly | Requires intermediate variables |
| **No static-variable initialization** | An FB's STATIC initial values cannot be set through plan_json | Requires additional attribute settings |
| **No Struct/UDT member access** | Struct fields cannot be accessed with dot notation | Access Symbol structure limit |
| **V16–V18 native document** | V19+ generates V18-format documents | For V19+ Siemens recommends the SIMATIC SD route |

---

## 17. 📊 Statistics overview

| Category | Total | ✅ implemented | 🟡 guarded | 🔴 template_required |
|------|------|--------------|-----------|---------------------|
| Contacts/coils | 10 | 5 | 0 | 5 |
| Latches/edges | 11 | 0 | 4 | 7 |
| Timers | 10 | 1 | 1 | 8 |
| Counters | 7 | 0 | 2 | 5 |
| Compare | 10 | 0 | 8 | 2 |
| Math | 12 | 0 | 6 | 6 |
| Move | 12 | 0 | 1 | 11 |
| Conversion | 11 | 0 | 3 | 8 |
| Word logic/shift | 22 | 0 | 0 | 22 |
| String | 11 | 0 | 0 | 11 |
| Date/time | 11 | 0 | 0 | 11 |
| Communication | ~10 | 0 | 0 | ~10 |
| Technology/motion/PID | ~30 | 0 | 0 | ~30 |
| **Total** | **~167** | **6 (3.6%)** | **25 (15.0%)** | **~136 (81.4%)** |

---

## 18. 🔥 Developer priority recommendations

### P0 — Blocks routine LAD programming (fill immediately)
1. **SR / RS latches** — core of state-machine step transitions; without them the only workaround is SET/RESET coils
2. **Port-name normalization** — comparison uses lowercase, counters use uppercase; unify to one rule or declare it explicitly per instruction
3. **TOF off-delay** — common equipment safety-protection pattern

### P1 — Significantly affects coverage (this week)
4. **NE (not equal)** — currently `guarded`; can use the constrained generator shape but still needs the TIA loop
5. **CTD count-down** — currently `guarded`; can generate but must import/compile/read back
6. **R_TRIG / F_TRIG** — currently `guarded`; can generate but must import/compile/read back
7. **NEG negate** — currently `guarded`; can generate but must import/compile/read back
8. **Mul / Div verification** — the four basic math operations lack confirmation

### P2 — Improve completeness (this month)
9. **MOD / ABS / SQR / SQRT** — currently `guarded`; can generate but must import/compile/read back
10. **INC / DEC** — increment/decrement
11. **InRange / OutRange verification**
12. **Scale_X / NORM_X verification**
13. **PContact / NContact verification**
14. **PBox verification**
15. **Calc verification**

### P3 — Edge cases (as needed)
16. Word logic SHL/SHR/ROL/ROR/AND/OR/XOR
17. String operations
18. Date/time
19. Communication/motion/PID — provide templates only; a generator is not recommended

---

## 19. Appendix: Known TemplateValue reference

| Instruction family | TemplateValue Name | Typical value | Meaning |
|--------|-------------------|--------|------|
| Compare (Eq/Ge/Gt/Lt/Le) | `SrcType` | `"Int"`, `"Real"`, `"DInt"`, `"Time"` | Operand type |
| Counters (CTU/CTUD) | `value_type` | `"Int"` | Count value type |
| Math (Add/Sub/Mul/Div) | `Card` | `"2"` | Number of input ports |
| Math (Add/Sub/Mul/Div) | `SrcType` | `"Int"`, `"Real"`, `"DInt"` | Operand type |
| Calc | `Card` | `"2"` ~ `"8"` | Configurable input count |
| Calc | `SrcType` | `"DInt"`, `"Real"` | Operand type |
| Conversion (Convert/CONV) | `SrcType` | `"UInt"`, `"Int"`, `"Real"`, `"DInt"` | Source type |
| Conversion (Convert/CONV) | `DestType` | `"Int"`, `"Real"`, `"DInt"` | Target type |
| Scale_X | `SrcType` | `"Real"`, `"Int"` | Source type |
| Scale_X | `DestType` | `"Real"`, `"Int"` | Target type |
| NORM_X | `SrcType` | `"Real"`, `"Int"` | Source type |
| NORM_X | `DestType` | `"Real"` | Target type |
| MOVE | `Card` | `"1"` | Number of output ports |

---

## 20. Appendix: Instruction verification backlog

The following instructions have real local XML template evidence, but their plan_json format has not yet been run through the full `tia_lad_validate_plan` + `tia_lad_generate_block_xml` + import + compile chain:

- `Gt`, `Lt`, `Le` (compare — same format as Eq)
- `InRange`, `OutRange` (range compare)
- `Mul`, `Div` (math)
- `INC` (increment)
- `Convert` (CONV — XML template available)
- `Scale_X`, `Normalize` (SCALE_X / NORM_X — XML template available)
- `PContact`, `NContact` (edge contacts)
- `PBox` (edge box)
- `Calc` (calculate box)
- `CTUD` (up/down counter)

> **Recommendation**: For each instruction above, write a minimal compilable LAD FB plan_json, run the full `validate → generate → import → compile → readback` chain, then update its status in this table to plan-verified.

---

## 21. Appendix: Reference paths to real TIA XML template files

```
evidence/tia-lad-projects/exported-xml/
├── Crono Termostato Comparatore Tonio_V18/
│   └── Conversione e comparazione.xml          ← InRange, Convert
├── Array scansione ciclica_V18/
│   └── S7-1200 station_1_Blocks_Array.xml      ← Add, PContact, Ge, Move
├── CANCELLO_S71200_V18/
│   └── CAMBIO_PAGINA_ANIMAZIONI_HMI.xml        ← Add, Sub, PBox, PContact, NContact, Move
├── conta impulsi_V18/
│   └── S7-1200 station_1_Blocks_Block_1.xml    ← CTUD
├── Rest room termostat_V18/
│   └── Thermostat control.xml                  ← Scale_X, Normalize
├── Encoder_RE620_V18/
│   └── Controllo_asse.xml                      ← Calc
└── Controllo valvola con encoder_V18/
    └── Axis control.xml                        ← CTU (used for verification)
```

---

> **End of document** — update the corresponding entry after each verification so this table remains the single source of truth.
