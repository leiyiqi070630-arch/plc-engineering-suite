# Siemens TIA Portal LAD (Ladder) FlgNet XML Instruction Formats — Complete Compilation

> **Source**: 70 real GTronic TIA Portal projects → V18 Openness export → FlgNet XML extraction
> **Coverage**: FlgNet XML shapes for the LAD instruction set, extracted from real project exports
> **Updated**: 2026-05-30

---

## FlgNet General Structure

```xml
<FlgNet xmlns="http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4">
  <Parts>
    <!-- Access: operand (symbol / constant) -->
    <Access Scope="GlobalVariable" UId="21">
      <Symbol><Component Name="TagName"/></Symbol>
    </Access>
    <Access Scope="LiteralConstant" UId="22">
      <Constant>
        <ConstantType>Int</ConstantType>
        <ConstantValue>100</ConstantValue>
      </Constant>
    </Access>
    <Access Scope="TypedConstant" UId="23">
      <Constant><ConstantValue>T#3s</ConstantValue></Constant>
    </Access>

    <!-- Part: the instruction body -->
    <Part Name="Contact" UId="24"/>
    <Part Name="TON" Version="1.0" UId="25">
      <Instance Scope="GlobalVariable" UId="26">
        <Component Name="IEC_Timer_0_DB"/>
      </Instance>
      <TemplateValue Name="time_type" Type="Type">Time</TemplateValue>
    </Part>
    <Part Name="Coil" UId="27"/>

    <!-- NC contact: Negated child element -->
    <Part Name="Contact" UId="28">
      <Negated Name="operand"/>
    </Part>

    <!-- OR branch: O + TemplateValue Card -->
    <Part Name="O" UId="29">
      <TemplateValue Name="Card" Type="Cardinality">2</TemplateValue>
    </Part>
  </Parts>
  <Wires>
    <!-- Power rail → instruction -->
    <Wire UId="30">
      <Powerrail/>
      <NameCon UId="24" Name="in"/>
    </Wire>
    <!-- Operand → contact -->
    <Wire UId="31">
      <IdentCon UId="21"/>
      <NameCon UId="24" Name="operand"/>
    </Wire>
    <!-- Contact out → coil in -->
    <Wire UId="32">
      <NameCon UId="24" Name="out"/>
      <NameCon UId="27" Name="in"/>
    </Wire>
    <!-- Unconnected output -->
    <Wire UId="33">
      <NameCon UId="25" Name="ET"/>
      <OpenCon UId="40"/>
    </Wire>
  </Wires>
</FlgNet>
```

### Access Scopes

| Scope | Purpose | Example |
|-------|------|------|
| `GlobalVariable` | Global variable / DB | `<Component Name="TagName"/>` |
| `LocalVariable` | FB formal parameter / static variable | `<Component Name="#Param"/>` |
| `TempVariable` | TEMP variable | `<Component Name="#Temp"/>` |
| `LiteralConstant` | Literal constant | `<ConstantType>Int</ConstantType><ConstantValue>100</ConstantValue>` |
| `TypedConstant` | Typed constant (time, etc.) | `<ConstantValue>T#3s</ConstantValue>` |

### Power-Pin Quick Reference

| Instruction class | Power pin | Notes |
|----------|----------|------|
| Bit logic (Contact/Coil, etc.) | `in` (connects directly to Powerrail) | No EN concept |
| Compare (Eq, Gt, Ge, Lt, Le, Ne, InRange, OutRange) | `pre` | Must be fed through a Contact |
| Timers/counters (TON, TOF, TP, TONR, CTU, CTD, CTUD) | `in` (via Contact → IN/CU/CD) | Contact.out → CU/CD/R/LD |
| Math (Add, Sub, Mul, Div, Calc, etc.) | `en` | Direct to Powerrail or Contact |
| Move/convert/scale (Move, Convert, Scale_X, Normalize) | `en` | Direct to Powerrail or Contact |
| Motion control (MC_*) | `en` | Direct to Powerrail; Contact.out → Execute |
| Communication (GET, PUT, TSEND_C, TRCV_C, etc.) | `en` | Direct to Powerrail |
| Technology (CTRL_HSC, CTRL_PWM, CTRL_PTO) | `en` | Direct to Powerrail |

---

## 1. Bit Logic Instructions

### 1.1 Contact (normally-open contact)
```xml
<Part Name="Contact" UId="1"/>
<!-- Wire: Powerrail → Contact.in, IdentCon → Contact.operand, Contact.out → next element -->
```

### 1.2 NC Contact (normally-closed contact) — Negated
```xml
<Part Name="Contact" UId="2">
  <Negated Name="operand"/>
</Part>
```

### 1.3 PContact (rising-edge contact)
```xml
<Part Name="PContact" UId="3"/>
<!-- Wire: same as Contact -->
```

### 1.4 NContact (falling-edge contact)
```xml
<Part Name="NContact" UId="4"/>
<!-- Wire: same as Contact -->
```

### 1.5 Coil
```xml
<Part Name="Coil" UId="5"/>
<!-- Wire: previous.out → Coil.in, Coil.operand → IdentCon -->
```

### 1.6 SCoil (set coil)
```xml
<Part Name="SCoil" UId="6"/>
```

### 1.7 RCoil (reset coil)
```xml
<Part Name="RCoil" UId="7"/>
```

### 1.8 O (OR branch node)
```xml
<Part Name="O" UId="8">
  <TemplateValue Name="Card" Type="Cardinality">2</TemplateValue>
</Part>
<!-- Two branches: branch1 → O.in1, branch2 → O.in2, O.out → downstream -->
```

### 1.9 PBox (power-rail branch box)
```xml
<Part Name="PBox" UId="9"/>
<!-- Branches a new parallel branch off the power rail -->
```

---

## 2. Edge Detection

### 2.1 PContact / NContact (see above)
Edge contacts belong to bit logic; there is no separate edge-detection block.

---

## 3. Timers

### 3.1 TON (on-delay timer)
```xml
<Part Name="TON" Version="1.0" UId="24">
  <Instance Scope="GlobalVariable" UId="25">
    <Component Name="IEC_Timer_0_DB"/>
  </Instance>
  <TemplateValue Name="time_type" Type="Type">Time</TemplateValue>
</Part>
<!-- Pins: IN, PT, Q, ET -->
<!-- Contact.out → TON.IN, TypedConstant → TON.PT, TON.Q → Coil, TON.ET → OpenCon -->
```

### 3.2 TP (pulse timer)
```xml
<Part Name="TP" Version="1.0" UId="24">
  <Instance Scope="GlobalVariable" UId="25">
    <Component Name="IEC_Timer_0_Instance"/>
  </Instance>
  <TemplateValue Name="time_type" Type="Type">Time</TemplateValue>
</Part>
<!-- Pins: IN, PT, Q, ET -->
<!-- Same pattern as TON, Contact → TP.IN -->
```

---

## 4. Counters

### 4.1 CTU (count up)
```xml
<Part Name="CTU" Version="1.0" UId="38">
  <Instance Scope="GlobalVariable" UId="39">
    <Component Name="Conta impulsi encoder"/>
  </Instance>
  <TemplateValue Name="value_type" Type="Type">Int</TemplateValue>
</Part>
<!-- Pins: CU, R, PV, CV, Q -->
<!-- Contact.out → CTU.CU (rising-edge trigger); another Contact.out → CTU.R (reset) -->
<!-- LiteralConstant → CTU.PV, CTU.CV → IdentCon (current-value output) -->
```

### 4.2 CTUD (count up/down)
```xml
<Part Name="CTUD" Version="1.0" UId="38">
  <Instance Scope="GlobalVariable" UId="39">
    <Component Name="IEC_Counter_0_DB_1"/>
  </Instance>
  <TemplateValue Name="value_type" Type="Type">Int</TemplateValue>
</Part>
<!-- Pins: CU, CD, R, LD, PV, QU, QD, CV -->
<!-- CU/CD each via an OR branch → CTUD.CU / CTUD.CD -->
<!-- R via NC Contact → CTUD.R (NC = active-low reset) -->
<!-- LD → OpenCon (unconnected), PV → LiteralConstant -->
<!-- QU → Coil (count-up reached), QD → OpenCon (count-down reached), CV → IdentCon -->
```

---

## 5. Compare Instructions

Common trait of comparators: `pre` power pin, no Instance, no TemplateValue.

### 5.1 Eq (equal)
```xml
<Part Name="Eq" UId="24"/>
<!-- Pins: in1, in2, pre, out -->
```

### 5.2 Gt (greater than)
```xml
<Part Name="Gt" UId="24"/>
<!-- Pins: in1, in2, pre, out -->
```

### 5.3 Ge (greater than or equal)
```xml
<Part Name="Ge" UId="24"/>
```

### 5.4 Lt (less than)
```xml
<Part Name="Lt" UId="24"/>
```

### 5.5 Le (less than or equal)
```xml
<Part Name="Le" UId="24"/>
```

### 5.7 InRange (in range)
```xml
<Part Name="InRange" UId="24">
  <TemplateValue Name="type" Type="Type">Int</TemplateValue>
</Part>
<!-- Pins: in, min, max, pre, out -->
<!-- Contact.out → InRange.pre (via pre!), values → min/max -->
```

### 5.8 OutRange (out of range)
```xml
<Part Name="OutRange" UId="24">
  <TemplateValue Name="type" Type="Type">Real</TemplateValue>
</Part>
<!-- Pins: same as InRange -->
```

---

## 6. Math

Common trait of math instructions: `en` power pin, no Instance.

### 6.1 Add (addition)
```xml
<Part Name="Add" UId="24">
  <TemplateValue Name="type" Type="Type">Int</TemplateValue>
</Part>
<!-- Pins: in1, in2, en, out -->
```

### 6.2 Sub (subtraction)
```xml
<Part Name="Sub" UId="24">
  <TemplateValue Name="type" Type="Type">Int</TemplateValue>
</Part>
```

### 6.3 Mul (multiplication)
```xml
<Part Name="Mul" UId="24">
  <TemplateValue Name="type" Type="Type">Real</TemplateValue>
</Part>
```

### 6.4 Div (division)
```xml
<Part Name="Div" UId="24">
  <TemplateValue Name="type" Type="Type">Real</TemplateValue>
</Part>
```

### 6.5 Calc (calculator)
Present in real projects: Encoder_RE620_V18, Interrupt stepper motor v5_V18, SINGLE RAMP_up&down_V18.

### 6.9 Inc
Present in real project: V90 CT_20230312_1841 (one occurrence).

---

## 8. Move / Assign

### 8.1 Move (move value)
```xml
<Part Name="Move" UId="24"/>
<!-- Pins: in, out1, en -->
<!-- PowerRail → Move.en, source.IdentCon → Move.in, Move.out1 → target.IdentCon -->
<!-- Key: the output pin is named out1 (not out!) -->
```

### 8.3 MOVE_BLK_VARIANT (Variant block move)
Present in real project: V90 CT_20230312_1841 (one occurrence).

### 8.6 S_MOVE (string move)
```xml
<Part Name="S_Move" DisabledENO="true" UId="26"/>
<!-- en connects directly to Powerrail; no Instance, no TemplateValue -->
```

---

## 9. Conversion

### 9.1 Convert (type conversion)
```xml
<Part Name="Convert" UId="24"/>
<!-- Pins: in, out, en -->
```

### 9.2 Normalize
```xml
<Part Name="Normalize" UId="24"/>
<!-- Pins: value(!), min, max, out, en -->
<!-- Key: the input pin is named value, not in! -->
```

### 9.3 Scale_X (scaling)
```xml
<Part Name="Scale_X" UId="24"/>
<!-- Pins: value(!), min, max, out, en -->
<!-- Key: same as Normalize, value (not in) -->
```

---

## 10. Timer/Counter Coils

S7-1200/1500 support coil-form timers and counters (e.g. TON coil, CTU coil).

---

## 12. FB/FC Block Call

### 12.1 CALL FB (with instance)
```xml
<Part Name="CALL:FB:Pump" Version="1.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="Pump_DB"/>
  </Instance>
</Part>
<!-- PowerRail → FB.en (if present), parameters → FB.in/out pins -->
```

### 12.2 CALL FC (no instance)
```xml
<Part Name="CALL:FC:Block_1" Version="1.0" UId="26"/>
<!-- No Instance child element -->
```

---

## 13. Motion Control & Technology Objects

Common traits of motion control:
- **Version="3.0"** (not 1.0!)
- **`en`** power pin (direct to Powerrail, or Contact → `en`)
- **`<Instance Scope="GlobalVariable">`** required
- **No TemplateValue** (unlike timers/counters!)
- Contact.out → MC_*.Execute (via the en chain or directly on the Execute pin)

### 13.1 MC_Power (enable axis)
```xml
<Part Name="MC_Power" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="MC_Power_DB"/>
  </Instance>
</Part>
<!-- Pins: Enable, Axis, StopMode, Status, Busy, Error, ErrorID, ErrorInfo -->
<!-- PowerRail → MC_Power.en, Contact.out → MC_Power.Enable -->
<!-- Axis.IdentCon → MC_Power.Axis -->
<!-- MC_Power.Status/Busy/Error → OpenCon or downstream -->
```

### 13.2 MC_Reset (reset axis)
```xml
<Part Name="MC_Reset" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="MC_Reset_DB"/>
  </Instance>
</Part>
<!-- Pins: Execute, Axis, Restart, Done, Busy, Error, ErrorID, ErrorInfo -->
```

### 13.3 MC_MoveAbsolute (absolute positioning)
```xml
<Part Name="MC_MoveAbsolute" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="MC_MoveAbsolute_DB"/>
  </Instance>
</Part>
<!-- Pins: Execute, Axis, Position, Velocity, Done, Busy, CommandAborted, Error, ErrorID, ErrorInfo -->
```

### 13.4 MC_MoveRelative (relative positioning)
```xml
<Part Name="MC_MoveRelative" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="MC_MoveRelative_x"/>
  </Instance>
</Part>
<!-- Pins: Execute, Axis, Distance, Velocity, Done, Busy, CommandAborted, Error, ErrorID, ErrorInfo -->
<!-- Key: Distance pin (not Position!) -->
```

### 13.5 MC_MoveJog (jog)
```xml
<Part Name="MC_MoveJog" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="MC_MoveJog_x"/>
  </Instance>
</Part>
<!-- Pins: Execute, Axis, JogForward, JogBackward, Velocity, InVelocity, Busy, CommandAborted, Error, ErrorID, ErrorInfo -->
```

### 13.6 MC_CommandTable (command table)
```xml
<Part Name="MC_CommandTable" Version="3.0" UId="26">
  <Instance Scope="GlobalVariable" UId="27">
    <Component Name="taglio 1"/>
  </Instance>
</Part>
<!-- Pins: Execute, Axis, CommandTable, StartStep, EndStep, Done, Busy, Error, ErrorID, ErrorInfo, CommandAborted, CurrentStep, StepCode -->
```

### 13.7 MC_Home (homing)
Present in real projects: V90 CT_20230312_1841, controllo v90, v90 asse. Same structure as the MC_* family (Version="3.0" + Instance).

### 13.8 MC_Halt (halt)
Present in real project: V90 CT_20230312_1841. Same structure as the MC_* family (Version="3.0" + Instance).

### 13.10 CTRL_HSC (high-speed counter)
Present in real projects: Controllo assi encoder, Encoder_RE620, Pannello solare, Pwm, Robot3Assi, and others.

### 13.11 CTRL_PWM (pulse-width modulation)
Present in real project: Pwm_V18.

### 13.12 CTRL_PTO (pulse-train output)
Present in real projects: Robot3Assi_MC5432T, Stepper_control_by_array.

---

## 14. Communication

Common traits of communication instructions: `en` power pin, usually with `<Instance>` and multiple `<TemplateValue>`.

### 14.1 GET (S7 communication read)
```xml
<Part Name="GET" Version="1.3" UId="25">
  <Instance Scope="GlobalVariable" UId="26">
    <Component Name="GET_DB"/>
  </Instance>
  <TemplateValue Name="connection_type" Type="ValuedType">TCON_Configured</TemplateValue>
  <TemplateValue Name="local_type" Type="Type">Variant</TemplateValue>
  <TemplateValue Name="remote_type" Type="Type">Variant</TemplateValue>
</Part>
<!-- Pins: EN, REQ, ID, NDR, BUSY, ERROR, STATUS, RD_1, ADDR_1, SD_1 -->
```

### 14.2 PUT (S7 communication write)
Present in real projects: PIDconHMI_V18, Riempimento vasche_V18. Structure mirrors GET.

---

## 15. Array / Field Access

### 15.1 FieldRead (array element read)
```xml
<Part Name="FieldRead" UId="24"/>
<!-- Pins: en, Out!, Member, Index or DstIdx, etc. -->
<!-- en connects directly to Powerrail -->
```

---

## 16. String Operations

### 16.1 S_MOVE (string move) (see 8.6)

---

## 17. Date / Time

### 17.1 RD_SYS_T (read system time)
Present in real projects: Crono Termostato Comparatore Tonio, Crono Termostato comparatore, Crono_Termopstato.

### 17.2 WR_SYS_T (write system time)
Present in real projects: Crono Termostato Comparatore Tonio, Crono Termostato comparatore.

### 17.3 RD_LOC_T (read local time)
Present in real projects: Controllo valvola con encoder, v90 asse.

---

## 18. Diagnostics / Interrupt / System

### 18.6 RTM (runtime meter)
Present in real projects: Crono_Termopstato, marcia arresto.

---

## 22. PID / Technology

### 22.1 PID_Compact / PID_3Step / PID_Temp
PID_Compact is present in real projects PIDconHMI_V18 and pid-gtronics_V18.

---

## TemplateValue Quick Reference

| Instruction | TemplateValue | Type |
|------|---------------|------|
| TON / TOF / TP / TONR | `time_type` = Time | Type |
| CTU / CTD / CTUD | `value_type` = Int/DInt/… | Type |
| Eq / Gt / Ge / Lt / Le / Ne | none | — |
| InRange / OutRange | `type` = Int/Real/… | Type |
| Add / Sub / Mul / Div / Mod | `type` = Int/Real/… | Type |
| Normalize / Scale_X | none | — |
| O (OR) | `Card` = numeric value | Cardinality |
| GET / PUT | `connection_type`, `local_type`, `remote_type` | ValuedType / Type |
| MC_* (all) | **none!** | — |
| Convert / Move | none | — |
| FieldRead | none | — |

---

## Evidence Sources

1. **70 real GTronic TIA Portal projects** — `evidence/tia-lad-projects/`
   - Retrieve/export performed by `tia_lad_find_template_evidence` and `tia_openness_retrieve_project`
   - 837 LAD networks, 193 XML files

2. **8 template samples** — `evidence/tia-lad-projects/templates/target-instruction-samples.json`
   - TON, TP, CTU, CTUD, MC_Power, MC_MoveRelative, MC_MoveJog, MC_CommandTable

3. **Instruction coverage analysis** — `evidence/tia-lad-projects/analysis/instruction-coverage.json`
   - Complete project mapping (each instruction → list of projects containing it)

4. **TIA export verification**
   - FB_XML_BitLogic, FB_XML_Timer, FB_XML_Compare, FB_XML_Edge — imported and compiled successfully in TIA V18

---

## Key Findings and Rules

1. **Power-pin dichotomy**: comparators use `pre`; all other function blocks use `en`.
2. **Motion control's distinctive traits**: Version="3.0" (not 1.0) + Instance + no TemplateValue.
3. **Timers/counters**: Version="1.0" + Instance + a type TemplateValue.
4. **NC contact = Negated**: `<Part Name="Contact"><Negated Name="operand"/></Part>`
5. **OR branch = O + Card**: `<Part Name="O"><TemplateValue Name="Card" Type="Cardinality">2</TemplateValue></Part>`
6. **Normalize/Scale_X input pin is `value`** (not `in`).
7. **Move output pin is `out1`** (not `out`).
8. **CTUD load pin is `LD`** (not `LOAD`).
9. **GET version is 1.3**, with multiple type TemplateValues.
10. **DisabledENO="true"** is used for blocks that don't need ENO, such as S_Move.
