# 11 · FlgNet — SimaticML XML for LAD/FBD Networks

**Core of the LAD/FBD generator.** One `<FlgNet>` encodes one network. This chapter is cross-verified three ways: local real V16 export XML + official LADFBD/Access XSD + several working generator sources. Sources live in `evidence/tia-openness/source-cache/` (mking2203 real export, Parozzz/Repsay generators, Parozzz-bundled official XSD).

## Nesting position

```
Document → SW.Blocks.FB → ObjectList → SW.Blocks.CompileUnit → AttributeList
  → NetworkSource → <FlgNet>   (one CompileUnit = one network)
  sibling <ProgrammingLanguage>LAD</ProgrammingLanguage>
```
Empty network = self-closing `<NetworkSource/>`, no FlgNet.

## Namespace varies by version (error-prone, corrected)

The `xmlns` of `<FlgNet>` has the form `http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4`.

| Version axis | FlgNet | Interface | StructuredText (SCL) | Graph |
|---|---|---|---|---|
| V16 real export | **v4** | v4 | — | (V14SP1 uses v1) |
| V17/V18 | v4 | **v5** (v5 from **V17** on) | | |
| V19 | (generator constant v5) | v5 | v4 | |

> ⚠️ **Correction**: the real V16 export uses **FlgNet/v4** (not the v3 written by some generator constants). One Python generator (Repsay) hard-codes v3, which **does not match** the real V16 export — a real version-drift pitfall; a generator must **set the namespace per target TIA version**.
> Interface namespace: **v5 from V17 on** (not only from V19).

## FlgNet child elements (order)

(official LADFBD_v4.xsd): `FlgNet` → optional `<Labels>` → **required `<Parts>`** → optional `<Wires>`.
`<Parts>` is a repeating choice of `<Access>` / `<Part>` / `<Call>` (`maxOccurs=unbounded`). Each node has a unique integer **`UId`** — the node id in the wiring graph.

## Access (operand reference)

`<Access Scope="..." UId="...">`: `Scope` required, `UId` optional; child choice includes `Symbol`/`Address`/`Constant`/`CallInfo`/`Instruction`. In real LAD exports Scope is mostly **`LocalVariable`** / **`GlobalVariable`** (the enum is wider: also `LiteralConstant`/`TypedConstant`/`GlobalConstant`...).

- **Symbolic operand**: `<Access Scope="LocalVariable" UId="21"><Symbol><Component Name="A1"/></Symbol></Access>`
- **Literal**: `<Access ...><Constant><ConstantType>Int</ConstantType><ConstantValue>1</ConstantValue></Constant></Access>`

## Part (instruction)

`<Part Name="..." UId="...">`: `Name` and `UId` required, optional `Version`, `DisabledENO` (boolean, default false). `Name` is a free string (not an enum), verified by real export.
- Contact `Name="Contact"` (pins `in`/`out`/`operand`); coil `Name="Coil"` (`in`/`operand`); set/reset `Name="SCoil"`/`"RCoil"`.
- NC / negated pin: add a `<Negated Name="operand"/>` child to the Part (one per negated pin), per the XSD.

## Box / comparator / MOVE instructions (confirmed by real export, added 2026-06-13)

> Filled using the **real TIA V16 Update 4 export** (`UserAdd.xml`, with a real DocumentInfo header) plus generator output.

**Arithmetic box ADD** (confirmed by real export):
```xml
<Part Name="Add" UId="24">
  <TemplateValue Name="Card" Type="Cardinality">2</TemplateValue>   <!-- input count -->
  <TemplateValue Name="SrcType" Type="Type">Int</TemplateValue>     <!-- operand type -->
</Part>
<!-- Wires: en (OpenCon = unconnected), in1, in2, out -->
<Wire UId="26"><OpenCon UId="25"/><NameCon UId="24" Name="en"/></Wire>
<Wire UId="27"><IdentCon UId="21"/><NameCon UId="24" Name="in1"/></Wire>
<Wire UId="28"><IdentCon UId="22"/><NameCon UId="24" Name="in2"/></Wire>
<Wire UId="29"><NameCon UId="24" Name="out"/><IdentCon UId="23"/></Wire>
```
- Pins: `en` + `in1`/`in2`/.../`inN` + `out`; input count is set by `<TemplateValue Name="Card" Type="Cardinality">N</TemplateValue>`, operand type by `<TemplateValue Name="SrcType" Type="Type">Int</TemplateValue>`.
- ⚠️ **Note the attribute name is `Name="Card"` (`Type="Cardinality"`), not `Name="Cardinality"`**.
- `TemplateValue` `Type` enum = `Cardinality`/`Type`/`Operation`.

**Logic box OR** (confirmed by real export): `<Part Name="O">` + Card=2; pins **`in1`/`in2`/`out`, no `en`** (logic boxes sit directly in the power flow).

**MOVE** (generator output, consistent across two files):
```xml
<Part Name="Move" UId="28" DisabledENO="true">
  <TemplateValue Name="Card" Type="Cardinality">1</TemplateValue>   <!-- output count -->
</Part>
<!-- pins: en, in (singular!), out1 (output is out1; multiple outputs = out1/out2/...) -->
```
> ⚠️ MOVE input is singular `in`, **output is `out1` (with the 1)**; multiple outputs follow Card as `out1`/`out2`/...

**Comparator EQ**: `<Part Name="Eq">` + `SrcType` (no Card); pins **`pre` (power-flow in, not `en`)/`in1`/`in2`/`out`**. Comparators / logic-contact instructions use `pre`, not `en`.

**ENO — two independent mechanisms** (observed in real export):
1. The `eno` pin emits `<NameCon Name="eno"/>` **only when wired**; if unwired it is absent (ADD's eno is unconnected, no NameCon).
2. Separately, the Part attribute `DisabledENO="true"` (seen on MOVE). The two are independent — ADD's eno is open but has **no** DisabledENO attribute.

> Shared vocabulary reused: `<TemplateValue>` (above) and `OpenCon` (unconnected pin).

## Call (calling FB/FC — the difference between Part and Call is that Call always carries CallInfo)

```xml
<Call UId="25">
  <CallInfo Name="Valve" BlockType="FB">
    <Instance Scope="LocalVariable" UId="26"><Component Name="Valve_Instance"/></Instance>
    <Parameter Name="Release" Section="Input" Type="Bool"/>
    <Parameter Name="OpenValve" Section="Input" Type="Bool"/>
    <Parameter Name="Valve" Section="Output" Type="Bool"/>
  </CallInfo>
</Call>
```
Each formal parameter → one `<Parameter Name/Section/Type>`; only an FB has `<Instance>` (pointing to the instance DB). (real V16 export LAD_TemplateValve)

## Wires

`<Wires>` contains multiple `<Wire UId="...">`; each Wire connects a pair of pins, endpoint choice:
- `<Powerrail/>` — left power rail
- `<NameCon UId="x" Name="pin"/>` — connects to a Part/Call pin (`in`/`out`/`operand`/`en`/or a parameter name); both UId and Name required
- `<IdentCon UId="x"/>` — connects to an Access operand node; UId only
- `<OpenCon UId="x"/>` — open / unconnected pin
- `<Openbranch/>`

**Wiring for one normally-open contact** (copied verbatim from a real export plcBlock):
```xml
<Wire UId="25"><Powerrail/><NameCon UId="23" Name="in"/></Wire>          <!-- power rail → contact in -->
<Wire UId="26"><IdentCon UId="21"/><NameCon UId="23" Name="operand"/></Wire> <!-- tag A1 → contact operand -->
<Wire UId="27"><NameCon UId="23" Name="out"/><NameCon UId="24" Name="in"/></Wire> <!-- contact out → coil in -->
<Wire UId="28"><IdentCon UId="22"/><NameCon UId="24" Name="operand"/></Wire> <!-- tag MyValue → coil operand -->
```
Reading: NO contact A1 conducting energizes coil MyValue.

- **Branch / OR**: the single `out`-pin `NameCon` of one Wire fans out to multiple target `NameCon` (verified by real export Wire UId=33).
- **Call wiring**: `Powerrail → NameCon(call, "en")`, then one `NameCon(call, "<param name>")` per parameter.
- Unconnected pin → `OpenCon`.

## IEC timers — confirmed by real V18 export (blind spot closed 2026-06-13)

> Blind spot closed. Evidence in this repo: **`evidence/tia-lad-projects/exported-xml/` (70 real TIA V18 project exports)** — earlier research only searched source-cache and the web and missed this directory. Several files contain real TON, byte-level consistent.

**TON** (confirmed by real V18 export, **structure is Part+Instance, not Call**):
```xml
<Part Name="TON" Version="1.0" UId="24">
  <Instance Scope="GlobalVariable" UId="25"><Component Name="Pre apertura"/></Instance>  <!-- instance DB -->
  <TemplateValue Name="time_type" Type="Type">Time</TemplateValue>                       <!-- Time / LTime -->
</Part>
<!-- pins: IN / PT / Q / ET -->
<Wire UId="29"><NameCon UId="23" Name="out"/><NameCon UId="24" Name="IN"/></Wire>  <!-- contact out → TON.IN -->
<Wire UId="30"><IdentCon UId="22"/><NameCon UId="24" Name="PT"/></Wire>            <!-- PT operand -->
<Wire ...><NameCon UId="24" Name="Q"/><NameCon UId="36" Name="in"/></Wire>         <!-- Q → coil in -->
<Wire ...><NameCon UId="24" Name="ET"/>...</Wire>                                  <!-- ET output -->
```
- `<Part Name="TON" Version="1.0">` carries a **`Version` attribute**; child `<Instance>` (single instance `Scope="GlobalVariable"` + `<Component Name="<instance DB name>"/>`; multi-instance uses `Scope="LocalVariable"` pointing at a static member).
- Child `<TemplateValue Name="time_type" Type="Type">Time</TemplateValue>` (time type Time/LTime).
- Pins **`IN`/`PT`/`Q`/`ET`** (uppercase).
- ⚠️ **`IN` must be fed by some contact's `out`, not directly Powerrail→IN** (TIA rejects that generated shape — plccode-engine's own `xml_builder.rs` encodes this lesson).

**TOF/TP/TONR**: same `Part Name="TOF"/"TP"/"TONR"` + Instance + `time_type` template, IEC pins (TP/TOF=IN/PT/Q/ET, TONR adds R); TON/TP already seen in real export, structure consistent.

**IEC counters CTU / CTUD** (confirmed by real V18 export):
```xml
<Part Name="CTU" Version="1.0" UId="36">
  <Instance Scope="GlobalVariable" UId="37"><Component Name="contatore_oggetti"/></Instance>
  <TemplateValue Name="value_type" Type="Type">Int</TemplateValue>   <!-- count value type -->
</Part>
```
- **CTU** pins: `CU`/`R`/`PV`/`Q`/`CV`.
- **CTUD** pins: `CU`/`CD`/`R`/`LD`/`PV`/`QU`/`QD`/`CV` (same `Part`+`Instance`+`value_type`).
- Instance: single instance `Scope="GlobalVariable"` (e.g. `IEC_Counter_0_DB`), multi-instance `Scope="LocalVariable"` (points at a static member).
- Note timers/counters use **`<TemplateValue Name="time_type"/"value_type" Type="Type">`** while arithmetic boxes use `Name="SrcType"` — don't mix them up.

**CALCULATE = `<Part Name="Calc">`** (confirmed by real V18 export):
```xml
<Part Name="Calc" UId="25">
  <Equation>(IN1 * IN2)/IN3</Equation>                              <!-- formula, references IN1/IN2/.../INn -->
  <TemplateValue Name="Card" Type="Cardinality">3</TemplateValue>   <!-- input count -->
  <TemplateValue Name="SrcType" Type="Type">Real</TemplateValue>
</Part>
```
> ⚠️ CALCULATE's Part name is **`Calc`**, with a unique `<Equation>` child (formula string referencing `IN1`/`IN2`/...); pins `en`/`in1`..`inN`/`out`.

## Key generator constraints (audited against 70 real exports, 2026-06-14)

Hard constraints most easily gotten wrong when generating FlgNet, and that cause import failure:

- **Power pins vs data pins must be wired separately.** Power pins (`en`/`pre`, counter `CU`/`CD`/`R`/`LD`, TON `IN`) can only be fed by **Powerrail or another Part's `out`** (`NameCon→NameCon` or `Powerrail→NameCon`); data pins (`PV`/`in1`/`in2`/`min`/`max`/`value`/`PT`) use `IdentCon(Access)→NameCon`. Wiring a data Access directly to a power pin = TIA rejects it. Audit: counter CU is `Contact.out→CU` in 8/8 real samples, 0 IdentCon.
- **IEC counters have no `en` pin.** CU/CD/R/LD are each fed power by a contact; sending `Powerrail→CTU.en` is rejected (0/8 real samples have en). Unused pins (unconnected LD/Q/CV) are written as `OpenCon`.
- **Add / Mul must carry `Card`, Sub / Div do not.** In real exports every Add (15/15) and Mul (16/16) has `<TemplateValue Name="Card" Type="Cardinality">N</TemplateValue>` as the **first child** (N = input count, variadic); Sub (0/9) and Div (0/4) are always binary and never carry Card. Omitting Card on Add/Mul means TIA cannot rebuild the box input count → import failure.
- **Minor (legal but not the only form)**: `SrcType` has two legal forms, `TemplateValue` (typed) and `AutomaticTyped`; `Convert`/`Move` often carry `DisabledENO="true"` (when ENO has no downstream), and omitting it is also legal; the `out` of comparators/InRange is a power-result pin, always wired downstream in real exports (Coil.in or the next box's pre), never left dangling or connected to IdentCon.

> The plccode-engine generator (`xml_builder.rs`+`plan.rs`) applies all of the above: counters use a dedicated power-pin path (the pattern's `power_input_ports`), no longer emit a fake `en` (`enable_port: Option`), dynamic Card on Add/Mul, and Calc's `<Equation>`. TON/TP/comparators/Normalize/Scale_X/edge contacts/contact_coil+OR were **already correct** on audit. `CTD` has a constrained generator shape, status `guarded`; it must go through validate -> generate -> import -> compile -> readback, and must not be refused generation on the basis of old zero-sample text.

## Part names seen in the real corpus (instruction → XML name mapping, from 70 V18 exports)

By frequency: `Contact` `Coil` (`SCoil`/`RCoil`), `Move`, `O` (OR), comparison `Eq`/`Ge`/`Le`/`Gt`/`Lt`/`InRange`/`OutRange`, edge `PContact`/`NContact`/`PBox`, `TON`/`TP`, counters `CTU`/`CTUD`, math `Add`/`Sub`/`Mul`/`Div`/`Inc`/**`Calc`**, conversion `Scale_X`/`Normalize`/`Convert`/`MOVE_BLK_VARIANT`, motion `MC_Power`/`MC_MoveAbsolute`/`MC_MoveRelative`/`MC_MoveJog`/`MC_Home`/`MC_Halt`/`MC_Reset`/`MC_CommandTable`, high-speed `CTRL_HSC`/`CTRL_PWM`/`CTRL_PTO`, communication `PUT`, time `RD_SYS_T`/`WR_SYS_T`/`RD_LOC_T`/`RTM`, `FieldRead`.
> Note: XML Part names often use CamelCase/abbreviations (`O`=OR, `Eq`=CMP==, `Calc`=CALCULATE, `Normalize`=NORM_X, `Scale_X`=SCALE_X), not exactly matching the SCL / instruction-card mnemonics. The MC_* / CTRL_* families are also `Part`+`Instance` form in FlgNet (motion/technology blocks), not Call.

## Sources

- **This repo's real V18 export library (70 projects, incl. TON/boxes/counters)**: `evidence/tia-lad-projects/exported-xml/*_V18/*.xml` (e.g. `ApriChiudiCancelloTemporizzato_V18`, `CANCELLO_S71200_V18` contain real TON). **Strongest local evidence; check here first when mining FlgNet.**
- plccode-engine's own generator (same mechanism, encodes TON/box pins): `rust/crates/tools/src/tia_openness_tools/lad_patterns/{xml_builder.rs,instruction_catalog.rs}`
- **Real TIA V16 Update4 export (boxes)**: `raw.githubusercontent.com/Jmeyer1292/block_diagram_z3/master/testdata/blocks/UserAdd.xml` (Add, with DocumentInfo header), `.../constants.xml` (OR)
- MOVE/EQ generators: `raw.githubusercontent.com/eliasrhoden/tia-statemachine/main/{simatic_ML_format.md,demo/demo_FB.xml,graph2LAD.py}`
- FB Call instance pattern: `dmcinfo.com/.../using-xml-templates-in-tia-openness` (real export snippet)
- Local real V16 export (contact/coil/Call): `source-cache/mking2203_CodeGeneratorOpenness/Sample/*.xml`
- Official XSD (bundled in Parozzz/caprican): `SW.PlcBlocks.LADFBD_v4.xsd`, `Access_v4.xsd`, `Part_T.cs`

## Generator coverage status (2026-06-14, cross-checked against 193 corpus files)

**Deterministically generated** (`instruction_box_pattern` / dedicated paths, all backed by real V18): Contact/Coil/SCoil/RCoil, O (OR), Move, comparison Eq/Ge/Gt/Le/Lt, InRange/OutRange, math Add/Sub/Mul/Div (Add/Mul carry Card), Convert, Normalize, Scale_X, edge PContact/NContact, **PBox** (rising-edge one-shot), TON/TP, CTU/CTUD, **Calc**.

**Network composition**: `type:"chain"` (2026-06-14) — both topologies supported, generated XML matches the real export line by line:
- **Linear series** (`stages`): boxes chained **power-out pin → power-in pin** (EN/ENO boxes `eno→en`, comparators/edges `out→en`, rule = `InstructionBoxPattern::power_out_port()`). Covers `Normalize→Scale_X` (27), `[comparator]→Move` (~30), `Sub→Div`, etc.
- **Parallel fan-out** (`fanout`): a terminal power node uses **one multi-NameCon wire** to drive several sinks (box or coil) at once, i.e. real `Contact.out → {Coil.in, Coil.in, Move.en, Move.en}`. Covers `Move→Move`, one condition setting multiple coils.
- Optional leading contact (`enable`) + series segment + trailing fan-out can be combined (e.g. `contact→comparator→{Move,Move}`).

**Extension to-do** (present as `<Part>` in the corpus with real samples, but not yet transcribed verbatim — pick up under the "read the real export before generating" discipline):
- `Inc` (1 occurrence: `<Part Name="Inc" DisabledENO="true"><TemplateValue Name="DestType">DInt</TemplateValue>`), `MOVE_BLK_VARIANT` (2).
- Time: `RD_SYS_T` (4)/`WR_SYS_T` (3)/`RD_LOC_T` (2)/`RTM` (2).
- Motion `MC_Power`/`MC_MoveRelative`/`MC_MoveAbsolute`/`MC_MoveJog`/`MC_Home`/`MC_Halt`/`MC_Reset`/`MC_CommandTable` (~20 occurrences total, Part+Instance(TO_Axis)+multiple parameter pins) — once the pattern is filled in they slot into `chain`.
- High-speed `CTRL_HSC` (11)/`CTRL_PWM` (2)/`CTRL_PTO` (2), `PUT` (4), `FieldRead` (5).
- ⚠️ `chain` supports linear series + trailing parallel fan-out; **branch merge** (multiple OR paths merging mid-box, e.g. `(A OR B)→box`, done via an `O` box in the corpus) is not yet merged into chain — extend when needed. Leading logic is currently a single `enable` contact; full OR + series leading logic is not done.

## Open items (check before generating)

- **FlgNet namespace for V20/V21** (local exports go to V18=v4; v5 from V19 on; no real V20/V21 sample) — the main remaining blind spot.
- `NBox` (pure down-count / negative-edge box, **zero samples** in the corpus) remains `template_required`; `CTD` has a constrained generator shape classified as `guarded`, still needs full TIA closed-loop verification.
- The exact Scope string for literal Access.

> ✅ Closed (confirmed by real V18 export + multi-agent audit): TON/TP, CTU/CTUD (fixed power pins / removed fake en), ADD/MUL (added Card)/SUB/DIV/OR/MOVE/Calc boxes, comparators, PBox, edges, contact_coil+OR, complete Part-name mapping.
