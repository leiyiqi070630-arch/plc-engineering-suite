# 04 · SimaticML / Openness XML Import & Export

**SimaticML** is Siemens' XML-based markup format for exchanging TIA software data (blocks, UDTs, tag tables, etc.) via Openness. Sources: **V16 Openness manual** (109773802), **V19 Openness manual** (109826886).

## Export / Import API

```csharp
// Export a block
plcBlock.Export(new FileInfo(@"D:\ExportCodeBlock.xml"), ExportOptions.WithReadOnly);
// Import into a block group
blockGroup.Blocks.Import(new FileInfo(@"...\Block1.xml"), ImportOptions.Override);
```
The signatures `void Export(FileInfo, ExportOptions)` and `Blocks.Import(FileInfo, ImportOptions)` appear verbatim in both the V16 and V19 manuals.
(Note: this is the classic **SimaticML/XML** path, whose parameter is a **`FileInfo`**. The SD text format uses a different set of `*AsDocuments` methods whose parameter is a **`DirectoryInfo`** — see [05](05-simatic-sd.md).)

## Export document structure

```xml
<Document>
  <Engineering version="V18" />
  <DocumentInfo> ... </DocumentInfo>
  <SW.Blocks.OB ID="...">      <!-- or SW.Blocks.FB / FC / GlobalDB / SW.Types.PlcStruct ... -->
    ...
  </SW.Blocks.OB>
</Document>
```
The root `<Document>` contains `<Engineering version=.../>` + `<DocumentInfo>` + one `SW.*` root element.
Block network representation: LAD/FBD use **FlgNet**, SCL uses **StructuredText** (variables live under Interface/Sections).

## Two easily confused "version axes"

A real error was caught here during verification, so keep these two straight:

### 1. Interface namespace version (increments with the TIA version)
In a block/UDT export, the Interface `Sections` namespace looks like `http://www.siemens.com/automation/Openness/SW/Interface/v5`.
- It is **not** a fixed v2. `v2` is the old compatibility namespace introduced in **V14 SP1** (`v1` corresponds to V14); it appears only in the manual's "export/import changes" history subsection.
- V19 actually exports with **v5**, and this **advances with the project / TIA version**.

### 2. XSD schema file version (stable across V16–V19)
Block XSD compilation-unit / section schema file versions (V19 manual p.1305-1306; same set in the V16 manual):

| schema file | version |
|---|---|
| `SW.InterfaceSections_v3.xsd` | v3 |
| `SW.PlcBlocks.LADFBD_v3.xsd` | v3 |
| `SW.PlcBlocks.STL_v3.xsd` | v3 |
| `SW.PlcBlocks.Graph_v4.xsd` | v4 |
| `SW.PlcBlocks.SCL_v2.xsd` | v2 |
| `SW.PlcBlocks.Access_v3.xsd` | v3 |
| `SW.Common_v2.xsd` | v2 |

These `.xsd` file versions are stable across **V16→V19**. **Note:** the `.xsd` file version (e.g. InterfaceSections **_v3**) and the XML namespace version above (e.g. Interface/**v5**) are **two different axes** — do not conflate them.

> 2026-07 real-machine ruling: full-version XML import + compile across V16–V21 has been validated by a 372-case real-machine matrix (the generator emits native V16/V17/V18 documents per version; V19–V21 go through the V18 document path), so the FlgNet namespace is no longer an open item. Any XSD suffix changes in V18/V20/V21 do not affect import.

## Version-specific SimaticML import (key rules)

V19 manual §6.1.3 "Version Specific Simatic ML Import":
- **Through V18**: to import a SimaticML file, the **Openness API version used must be ≥ the SimaticML file version**.
- **From V19 onward (LTS)**: as long as the SimaticML version falls within the **LTS window `Vxx-3 .. Vxx`**, **any** API version can import it.
- **The exported file version always equals the TIA Portal version used** (independent of the Openness API version).

> This confirms the direction of the existing evidence note "TIA imports same-version or older SimaticML", but the precise rule is the one above; **V15 cannot import V16+ documents** also falls under this rule (through V18, API ≥ file version).

## External sources (SCL/STL)

SCL/STL can go through the "external source" path (`GenerateSource` / `ImportFromExternalSource`, `.scl`/`.awl` files). Exact signatures vary by the version's API reference.

## Content that cannot round-trip

Compiled artifacts and know-how-protected (encrypted) blocks cannot be exported back to plaintext and restored.

## Sources

- V16 manual 109773802, V19 manual 109826886 (URLs above).
