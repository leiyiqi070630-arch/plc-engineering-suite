# 12 · SimaticML XML structure for blocks / interfaces / DB / UDT

The outer wrapper around the [FlgNet network](11-simaticml-flgnet-xml.md). Evidence: local real exported XML (including the V19 SCL FB from **Siemens' official GitHub** code-snippets) plus generator code.

## Block elements and AttributeList

Root `<Document>` → `<Engineering version="V19"/>` → `<DocumentInfo>` (present on export, optional on import) → block root element:

| Block type | Root element |
|---|---|
| OB | `<SW.Blocks.OB ID="0">` |
| FB | `<SW.Blocks.FB ID="0">` |
| FC | `<SW.Blocks.FC ID="0">` |
| Global DB | `<SW.Blocks.GlobalDB ID="0">` |
| UDT | `<SW.Types.PlcStruct ID="0">` |

Typical `<AttributeList>` child elements: `Interface` (see below), `MemoryLayout` (`Optimized`), `MemoryReserve` (e.g. 100), `Name`, `Namespace` (empty `<Namespace/>` in the V19 sample), `Number`, `ProgrammingLanguage` (`LAD`/`FBD`/`SCL`/`GRAPH`/`DB`), `SetENOAutomatically`.

**Family/version constraints (verified on real hardware, 2026-07):** `MemoryLayout`/`MemoryReserve`/`AutoNumber`/`SetENOAutomatically` belong only to optimized 1200/1500 blocks — **classic S7-300/400 blocks have none of them** (including them on import raises "Missing XML attribute 'ReadOnly' for attribute 'MemoryLayout'"), and classic blocks must carry an explicit `Number`; **native V16/V17 documents must not carry `MemoryReserve`** (read-only when set in the V16 portal). The generator's `target_family` parameter handles this automatically.
> The empty `<Namespace/>` element appears in the V19 sample; the v5 interface namespace applies from V17 onward.

## Interface (Interface / Sections / Section / Member)

```xml
<Interface>
  <Sections xmlns="http://www.siemens.com/automation/Openness/SW/Interface/v5">
    <Section Name="Input">
      <Member Name="A1" Datatype="Bool"/>
    </Section>
    <Section Name="Output"> <Member Name="Out1" Datatype="Bool"/> </Section>
    <Section Name="Temp">   <Member Name="MyValue" Datatype="Bool"/> </Section>
    <Section Name="Static"/> <Section Name="Constant"/> <Section Name="Return"/>
  </Sections>
</Interface>
```
- Section names: `Input`/`Output`/`InOut`/`Static`/`Temp`/`Constant`/`Return` (UDT/PlcStruct uses a single `Name="None"`).
- **The `Sections` namespace varies by version:** V16=v4, V17+=v5 (see the table in chapter 11).
- **A Member's `Datatype` is a free-form CamelCase string** (`Bool`/`Int`/`USInt`/`Time`/`String[10]`), **not all-caps**; length uses square brackets, `String[10]`. (see [chapter 13](13-datatypes-literals-addressing.md))
- The initial value lives in a **separate `<StartValue>` child element**, carrying the literal verbatim: `<StartValue Informative="true">'V4.0'</StartValue>` (SCL string literals keep single quotes), `16#65`, `T#10S`, `true`, `255`.
  > ⚠️ Correction: it is `String[10]` (with brackets) and `'V4.0'` (with single quotes), not `String10` / bare `V4.0`.
- Nested struct / UDT members: `<Member Name="RT_DATA" Datatype="G7_RTDataPlus_V4" Version="1.0"><Sections><Section Name="None"><Member .../></Section></Sections></Member>`.

## How networks are attached

Each `<SW.Blocks.CompileUnit ID="..." CompositionName="CompileUnits">` has a `<NetworkSource>` inside its `<AttributeList>`:
- **LAD/FBD:** `NetworkSource` wraps `<FlgNet xmlns=".../FlgNet/v4">...` (see chapter 11)
- **SCL:** `NetworkSource` wraps `<StructuredText xmlns=".../StructuredText/v4">`, containing a `Token`/`Blank`/`Access` sequence (e.g. `<Token Text="IF" UId="21"/>`, `<Access Scope="LiteralConstant"><Constant><ConstantValue>TRUE</ConstantValue>...`, `<Token Text="THEN"/>`). (Siemens official GitHub V19 FB)
- **GRAPH:** `ProgrammingLanguage` is `GRAPH`; `NetworkSource` wraps `<Graph xmlns=".../Graph/vN">`, containing `PreOperations` (`PermanentOperation`) / `Sequence` (`Steps` → `Step` (`Actions`/`Supervisions`/`Interlocks`, each holding a LAD/FBD `FlgNet`) / `Transitions` → `Transition` (`FlgNet`) / `Branches` / `Connections` (explicit `Connection`: `NodeFrom`/`NodeTo` use `StepRef`/`TransitionRef`/`EndConnection`, `LinkType=Direct`)) / `PostOperations` / `AlarmsSettings`; the interface adds a `<Section Name="Base"><Sections Datatype="GRAPH_BASE" Version="1.0">...`, and the block AttributeList carries a `<GraphVersion>`. **The topology model is identical between V14 and V20**; what differs is the **version stamp** (changes per version):

  | Version stamp | V14 SP1 | **V20** |
  |---|---|---|
  | `<Engineering version>` | `V14 SP1` | `V20` |
  | `<GraphVersion>` | `4.0` | `6.0` |
  | Interface `Sections xmlns` | `Interface/v2` | `Interface/v5` |
  | `<Graph xmlns>` NetworkSource | `Graph/v1` | `Graph/v5` |
  | `GRAPH_BASE Version` | `1.0` | `1.0` (same) |
  | Block `<Namespace />` element | none | required (may be empty) |

  Observed: **V20 flatly rejects V14 XML import** — first it fails on `<Engineering version='V14 SP1'> not supported`; after supplying V20 it fails on `Missing 'Namespace' identifier attribute` (the block needs `<Namespace/>`); then `MemoryLayout` needs `ReadOnly` (a V20 GRAPH FB carries no MemoryLayout at all). The generator must emit the version stamp for the target version, not merely swap strings. The huge Static runtime blocks (`RT_DATA`/`G7_*Plus_V6`/typed members per step and transition) are generated automatically by the compiler, so **the generator need not write them**. Full real-hardware export plus the generator are in `evidence/tia-openness/graph-v20-groundtruth/` (tool `tia_openness_generate_graph_block`).

  **Condition FlgNet (transition/interlock/supervision):** each is a **bare `<FlgNet>` (no xmlns)**; the terminal coil is replaced by `TrCoil`/`IlCoil`/`SvCoil` (**no operand**); the contact chain is the same as LAD (`Access(operand)` + `Contact` + coil; wires: `Powerrail→Contact.in`, `Access→Contact.operand`, `Contact.out→coil.in`; series contacts continue at `Contact.out→next Contact.in`), and each FlgNet has its own local UIds. An empty condition = a bare skeleton with only the `coil` attached to the powerrail.

  **Step actions:** an **`<Action Qualifier="…">` plus a Token structured-text stream** (not `<Access>`! using Access fails on import). **Two shapes by qualifier:** `N` = assignment `#target := value` (tokens: ref, ` `, `:=`, value, `&#xA;`); `S`/`R` = coil `#target` (tokens: ref, `&#xA;`, **no `:=`, no value**). Adding `:= value` to an S/R action makes compilation fail with `Invalid characters after the action`. Local names are `#name`, global names are `"name"`, and the target must be writable (interface Static/Output or a global tag). The full qualifier set is in caprican's `Qualifier_TE`; only the N/S/R shapes are documented here. An empty action = an empty `<Action />`.

  **Jumps and alternative branches:** `<LinkType>` has two values — `Direct` (main flow) and **`Jump`** (jump to an explicit target step: loop-back, cross-path merge). **A loop-back written as Direct is rejected on import** with `The "" sequencer does not start with a step` (TIA identifies the sequence start as "the step with no incoming Direct edge"; a Jump edge does not count). A looping sequence may have no `EndConnection` at all (the last transition Jumps back to the first step). Alternative branch: `<Branches><Branch Number="n" Type="AltBegin" Cardinality="N" /></Branches>`; connections `S→<BranchRef Number="n" In="0"/>`, `<BranchRef Number="n" Out="k"/>→T_k` (0-based, all Direct), each path `T_k→step`; a merge = the last transitions of the branches point to the same StepRef (use Jump for non-adjacent / loop-back). Reference: `evidence/tia-openness/graph-v20-groundtruth/topo.*.import-verified.xml`.

Each CompileUnit also carries a `<MultilingualText CompositionName="Title|Comment">` (multilingual title/comment, containing `MultilingualTextItem` / `AttributeList Culture="de-DE" Text="..."`).

## Global DB / UDT (from generator code)

- **Global DB:** `SW.Blocks.GlobalDB`, **only a `Static` section**, `ProgrammingLanguage=DB`. `Number`/`Namespace`/Interface v5 follow the FB pattern.
- **UDT:** `SW.Types.PlcStruct`, **a single `Section Name="None"`**, **no `Number`, no `ProgrammingLanguage`**.

## Sources

- Siemens official GitHub V19 SCL FB: `source-cache/siemens_tia-portal-openness-code-snippets/.../PLCBlocks/Block_1` (no file extension)
- Real V16 LAD FB: `source-cache/mking2203_CodeGeneratorOpenness/Sample/plcBlock_LAD_Block_Logic.xml`
- Real V14 SP1 GRAPH: `source-cache/mking2203_CodeGeneratorOpenness/CodeGeneratorOpenness/XML/V14SP1.xml`
- **Real-hardware V20 GRAPH export + V14→V20 delta + import-rejection tests:** `evidence/tia-openness/graph-v20-groundtruth/` (built a minimal GRAPH block by hand in a real TIA V20 on 2026-07-14 and exported it via the bridge's export-block-xml)
- Generator: `Parozzz_TiaUtilities/SimaticML/Blocks/{BlockGlobalDB,BlockUDT}.cs`, `SimaticMLAPI.cs` (namespace constants)
