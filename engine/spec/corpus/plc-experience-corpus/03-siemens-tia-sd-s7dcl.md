# Siemens TIA SIMATIC SD (.s7dcl, V20/V21)

> Applies to: vendor=siemens integration=tia_openness openness=20/21; SD text-block format (empty .s7res = BOM root, version locked to v4/V16, UDT ordering, two-file pairing, downgrade back-derivation)
> 26 items total, ordered by occurrence count (occ/30) from high to low.


## occ30 [architecture] Empty .s7res resource file must contain a UTF-8 BOM and a <root/> root node; applies to both V20 and V21

When TIA V20/V21 imports an SD project it also looks for a .s7res resource file of the same name. If that file is completely empty (0 bytes), lacks the UTF-8 BOM (EF BB BF), or has a root node that is not <root/> (self-closing), TIA Openness throws an XML parse exception or InvalidOperationException during import, and the message is misleading (it reports a block error rather than a resource-file error). Correct minimal form: UTF-8 BOM + <?xml version="1.0" encoding="utf-8"?><root/> (self-closing, single line). Write it from Python with utf-8-sig encoding; from .NET pass new UTF8Encoding(true); older Notepad versions do not add a BOM by default. <root></root> is not equivalent to <root/>, and <Root/> with wrong case both fail. V20 is slightly more lenient about this file while V21 tightens validation, making this the most common hidden pitfall in cross-version migration. The generator must unconditionally emit a matching .s7res next to every .s7dcl.

**Pitfall**: a generator script writes <root/> as BOM-less UTF-8 or emits an empty file; TIA import fails silently, and because the error message points at .s7dcl content, diagnosis goes down the wrong path for a long time.

*Source*: verified on real hardware (tested on TIA V16/V20/V21); tia-openness-coverage-expansion.md; sd-full-instruction-mandate.md; docs.tia.siemens.cloud SD format V20


## occ28 [architecture] Lock the SD XML version number to the v4/V16 document format; V20/V21 both accept it; never write a V21-specific version number

The internal XML version number (the SimaticML Version field) of SD files for both TIA V20 and V21 should be locked to v4 (corresponding to the V16 document spec). Confirmed by downgrade back-derivation on real hardware: TIA V21 fully recognizes the v4 format; if the version number is rewritten to a V21-specific value, v5, or higher, TIA refuses the import or silently ignores parts of the block structure, with an unclear error message. V20 behaves the same. Upgrading to V21 neither requires nor should update the SD version header. The FBD support added in V21 also extends within the v4 format framework. Most robust strategy: the generator always emits v4 and does not vary it with the TIA version number.

**Pitfall**: after upgrading the generator tool to the V21 SDK, someone casually changes the version number to V21, so every generated file fails to import into V20 projects, and the error reads 'version incompatible' rather than pointing at the version-number field.

*Source*: verified on real hardware (V20/V21 downgrade back-derivation); sd-full-instruction-mandate.md common V16→V21 XML instruction-set chapter; tia-openness-coverage-expansion.md


## occ27 [datatypes] A UDT must be declared in the SD file (or imported) before any DB/FB that references it — order-sensitive, no forward references

SD files are parsed sequentially; the TIA importer resolves type names as soon as it hits a DB/FB variable declaration and does not do a two-pass scan. If a UDT declaration appears after the DB or FB that references it (within the same file), TIA reports 'type undefined' and aborts the import, and because the error points only at the DB line rather than the ordering, newcomers mistake it for a DB syntax error. Correct approach — single file: put the TYPE block at the top, DBs in the middle, FC/FB last; multiple files: import UDT files first, then FB/FC, then DB/OB. A batch-import script must emit the file list in topological order and must not rely on alphabetical file-name order or concurrent import. Circular UDT dependencies cannot be expressed in SD and must be broken into composition relationships.

**Pitfall**: a batch import in alphabetical file-name order places DB_xxx.s7dcl before UDT_xxx.s7dcl and reports 'type not found'; a newcomer repeatedly checks the DB syntax instead of the ordering and only fixes it by manually adjusting file-name prefixes.

*Source*: distilled engineering judgment; TIA Openness Programming Manual V20/V21 Import sequence requirements; TIA Portal V20 SIMATIC SD Help import-order notes; hit repeatedly on real hardware


## occ26 [pitfall] DisabledENO and Not (negated contact) have strict dedicated forms in SD LAD XML; omitting or misplacing them inverts logic with no compile error

In LAD networks described in SD, disabling ENO propagation requires an explicit DisabledENO attribute on the instruction node; a normally-closed contact (logical negation) must use the dedicated Not node / Negated attribute and cannot be omitted or replaced with a plain NOT block or an extra inverting coil. Placement constraints for the two attributes: DisabledENO goes inside the instruction element's opening tag, and Not/Negated goes on the corresponding Contact element (as a child element or attribute; wrong ordering is silently ignored). When written wrong or omitted, TIA imports without error and compiles cleanly, but at runtime the ENO chain breaks or the contact logic is completely reversed, discoverable only during on-hardware commissioning. When DisabledENO and Not are used together, do not put NOT in series on the ENO output line (TIA parses it as DisabledENO rather than a standalone NOT coil). Downgrade back-derivation on real hardware (V21→V16) is the reliable source for the correct XML form, since the documentation is incomplete. Case is also sensitive: disabledENO and DISABLEDENO are not recognized.

**Pitfall**: a generator template omits the Not attribute, so after import TIA reports no error but every normally-closed contact in the ladder becomes normally-open; or a NOT block is mistakenly placed on the ENO line so the output never toggles, discoverable only after downloading to real hardware.

*Source*: sd-full-instruction-mandate.md lad_patterns generator, 38 items verified on real hardware; real-hardware downgrade back-derivation records; distilled engineering judgment


## occ24 [architecture] SD (.s7dcl) is a text description format specific to TIA V20/V21, not an executable language and not SCL — it takes effect only after TIA import + compile

SD (SIMATIC Source Description) is an external text source format introduced in TIA Portal V20; it uses the .s7dcl extension to carry a structured description of LAD/FBD/DB/UDT. It does not itself run on the PLC; it is essentially a serialized text form of the TIA Openness object tree, which TIA compiles into internal binary objects after import. It is not IEC 61131-3 ST/SCL and cannot express IF/WHILE control flow; it is not SimaticML, and the two use different import paths (SimaticML goes through File→Import, SD goes through the dedicated SD import or the Openness API); it is not a format recognizable by V19 or earlier. The correct acceptance loop must be: generate SD → Openness import → TIA compile → download — skipping any step fails to guarantee the PLC logic is updated. Syntax errors surface during import, semantic/type errors during compile, and runtime errors only after download — the three stages have different error sources.

**Pitfall**: treating SD like SCL and writing IF/WHILE control flow causes compile errors; or downloading after editing .s7dcl without re-importing into TIA, so the PLC runs the old logic and debugging misreads the logic as ineffective.

*Source*: TIA Portal V20/V21 SIMATIC SD Help; TIA Openness Programming Guide V16+ object-model chapter; Siemens Industry Online Support 79168964; distilled engineering judgment


## occ22 [architecture] The SD format is a pair of files, .s7dcl (code/interface) + .s7res (symbol resources); missing either fails the import

.s7dcl carries block interface declarations and network code; .s7res carries the symbol-name mapping (for an empty project its content is <root/> XML with a BOM). During import TIA Portal reads both files together; if .s7res is missing, empty (zero bytes), or lacks a BOM, the import fails silently or loses symbols. This holds for both V20 and V21, the only difference being that V21 additionally supports FBD networks. The generator must emit both files together, one .s7res per .s7dcl, with matching names.

**Pitfall**: generating only .s7dcl and forgetting .s7res, or .s7res being an empty file (not XML), so the block body is lost after import and TIA gives no clear error.

*Source*: docs.tia.siemens.cloud — Exporting and importing blocks in SIMATIC SD format (V20); verified on real hardware (TIA V16/V20/V21); tia-openness-coverage-expansion.md


## occ20 [architecture] V21 adds FBD network support; V20 supports only LAD/SCL; version routing must be decided at generation time

TIA V20's SD supports only LAD and SCL network types; V21 extends support to FBD networks (keywords / XML nodes differ from LAD). All networks within one logic block must use the same language (LAD or FBD, chosen by the block header's LANGUAGE/PROGRAMMING_LANGUAGE field); they cannot be mixed. When a V21 SD file containing FBD keywords is imported into a V20 project, TIA silently skips it or reports 'syntax error' / 'version incompatible' without stating the cause. Safe strategy for multi-version-compatible projects: use only LAD networks, lock the v4/V16 format, and keep version-routing logic in the caller's prompt / project configuration rather than in the SD template. Enable the FBD path only when the target is confirmed to be a pure V21 environment that requires FBD.

**Pitfall**: adding FBD nodes to SD 'for new-version compatibility'; a V20 project reports an unsupported-network-type error on import, all FBD networks are lost without an error, and the project looks complete but is actually missing logic.

*Source*: TIA Portal V21 Release Notes; TIA Openness coverage-expansion V21 extension records; tia-openness-coverage-expansion.md; real-hardware comparison testing (V20/V21 SD import)


## occ19 [maintainability] The SD generator must be organized by the catalog's four blocks (basic/comm/tech/ext, ~389 items total), routing by block rather than a flat enumeration

Real-hardware verification produced an SD LAD instruction catalog of 389 items in four blocks: basic (133 items; bit logic / timers / counters / compare / move / convert), comm (42 items; communication), tech (78 items; technology / PID / motion control), ext (136 items; extended / diagnostics / string / indirect addressing). The generator organizes code by block, one generation module per block; adding an instruction only extends its block without affecting the others. When a single file exceeds 200 objects, Openness import takes longer and occasionally fails, so split into separate .s7dcl files by block, allowing CI to regenerate partially. XML node structure and required attributes differ across blocks; confusing blocks leads to missing parameters or import failure. basic+comm are the highest frequency and should have correctness ensured first.

**Pitfall**: flattening all instructions into one big list or one big file makes maintenance hard to navigate, invites duplicating existing entries or overwriting verified XML templates when adding, and prevents block-level whitelist validation.

*Source*: sd-full-instruction-mandate.md catalog four-block 389-item tally; verified on real hardware; distilled engineering judgment


## occ18 [architecture] An SD file is a text mirror of the TIA project: one .s7dcl per block, with block keywords and ordering as hard constraints

Each .s7dcl file carries exactly one block (OB/FB/FC/DB/UDT); the top-level block keyword (ORGANIZATION_BLOCK / FUNCTION_BLOCK / FUNCTION / DATA_BLOCK / TYPE) must match the target block type exactly, and a spelling error (e.g. FUNCTIONBLOCK, FB) causes the whole block to be skipped, so after import the object is not found in the project, with no error. Block names must be enclosed in double quotes and are case-sensitive. There are two kinds of DB: a global DB is written DATA_BLOCK DB_name, an instance DB is written DATA_BLOCK FB_name_DB : FB_name; mixing them crashes instantiation. LAD networks are separated by the NETWORK keyword, each NETWORK corresponding to one Rung; comments start with // and must be placed in the NETWORK area before the RUNG; (* *) block comments are not supported. Multiple blocks cannot be written into one file (otherwise only the first is imported, with no error).

**Pitfall**: a block-keyword spelling error, or packing multiple FC/FB into one .s7dcl file for import, makes TIA silently skip rather than report a syntax error; or inserting a comment between instruction lines inside a RUNG makes the parser report 'unexpected token'.

*Source*: SIMATIC SD Help (TIA Portal V20/V21 online help) 'Structure of an SD file'; docs.tia.siemens.cloud; TIA Portal V20 SD technical-preview documentation; distilled engineering judgment


## occ16 [maintainability] SD generation verification loop: after importing into TIA, do an export-compare round-trip; a successful import alone is not enough to judge correctness

A successful TIA import of SD does not mean the logic is correct: dangling pins, inverted rung logic, lost comments, and wrong network counts all pass import without error and surface only at compile or run time. Correct verification loop: generate SD → Openness import → export again via Openness → compare structural differences between original and exported (any non-zero difference is an error point). Most efficient flow: hand-build a reference block → Openness export .s7dcl → diff against generator output → lock down the differences to fix the generator. This round-trip has been confirmed repeatedly across the 38 lad_patterns real-hardware verifications and is the core quality gate for SD engineering. An Openness import return code of 0 alone does not mean the block content is correct (some Network titles or variable comments may already be truncated).

**Pitfall**: using 'TIA reported no import error' as the pass criterion and skipping the export-compare, then discovering missing rung logic or dangling pins after go-live, and facing overwrite risk during rework.

*Source*: sd-full-instruction-mandate.md lad_patterns generator real-hardware verification; plc-code-v2-selftest-benchmark.md real-hardware loop methodology; distilled engineering judgment


## rm-a [timer] SIMATIC SD timer ops expose no q output — derive the done state via et + GE compare against PT

Real-machine verified (2026-08-16, TIA V20): an SD plan's timer element (TON/TP/TOF/TONR) accepts only op/kind/instance/instance_scope/r/pt/et — there is NO q output pin, and passing a q key is rejected at plan validation ("not a recognized element key"). To drive logic off a timer's done state, bind et to a Time static member and add a GE compare (in1 = E elapsed member, in2 = the PT value, coil = the done bit), or sequence directly from et comparisons. FB_DoubleBlink (alternating lamps) compiled 0 errors with the et+GE pattern.

**Pitfall**: planning a timer with a q binding and getting a rejected plan — the workaround is structural (et + compare), not a different key spelling.

*Source*: tia_sd_instruction_spec TON reports "op timer accepts: op, kind, instance, instance_scope, r, pt, et — no q output"; tia_sd_generate_block rejected the q key; FB_DoubleBlink with et+GE compare compiled 0 errors in TIA V20



## occ15 [maintainability] Canonicalization: keep exactly one minimal, real-hardware-verified XML form per SD instruction; no mixing of aliases

The same PLC instruction can have several equivalent XML forms in SD (different attribute order, different empty-node syntax, instruction-name case variants such as TON/Timer_ON/IEC_TIMER, mnemonic aliases). TIA silently accepts some aliases and rejects others, and behavior is inconsistent across versions. Engineering practice: establish one canonical form per instruction — the minimal legal form verified by real-hardware downgrade back-derivation; the generator forcibly emits that form, never passing through user-supplied aliases and never varying attribute order arbitrarily. This mechanism also underpins the reliability of code review and text-based instruction search/replace. Uppercase the input first, then look up the alias mapping, and emit a uniform canonical form.

**Pitfall**: the generator passes the user's instruction-name string straight through (e.g. lowercase move); TIA is case-sensitive and rejects it, reporting a syntax error without saying it is a case issue; or the same instruction written differently across files causes random cross-version failures.

*Source*: sd-full-instruction-mandate.md canonicalization records; distilled engineering judgment


## occ14 [architecture] Downgrade back-derivation: when the SD XML structure is unknown, hand-build a minimal rung in TIA and export .s7dcl as the canonical template

When the correct SD XML structure of an instruction is not known (especially low-frequency ext/tech instructions, DisabledENO, Not, etc.), the most reliable method is: hand-build the instruction's minimal LAD rung in TIA V16 → have TIA export the corresponding SD text → archive the output as the canonical template. This is more accurate than consulting the documentation, because the documentation lags the actual XML format and describes some attributes incompletely (e.g. the placement constraints of DisabledENO/Not). For the two high-frequency pitfalls DisabledENO and Not, downgrade back-derivation is the definitive source. Exporting from V21 and importing again with the v4 marker is also a common debugging technique.

**Pitfall**: relying entirely on documentation to hand-write XML templates leads to mass import failures when TIA's actual format diverges from the docs, and it is hard to pinpoint which instruction's template is wrong.

*Source*: sd-full-instruction-mandate.md downgrade-back-derivation chapter; lad_patterns generator 38-item real-hardware verification; distilled engineering judgment


## occ13 [architecture] SD import is a one-way workflow: .s7dcl is the single source of truth, and edits in the TIA graphical editor do not flow back to the source file

The SD file workflow is one-way: edit .s7dcl outside TIA → import into TIA via 'Generate block from external source' → TIA compile. If the block is edited in the TIA graphical editor after import, TIA does not update .s7dcl in reverse, and the source file immediately diverges from the project state; the next re-import overwrites the manual edits (no merge mechanism). If a block of the same name already exists in the project, TIA's default behavior on import is a silent overwrite with no confirmation dialog. Check for same-name blocks via the Openness API before a batch update. Teams must adopt the 'source file is the single source of truth' principle, route all edits through the SD file → CI import flow, and forbid editing SD-managed blocks directly in the TIA GUI.

**Pitfall**: after import, 'quickly fixing a contact' in the TIA graphical editor — the change is lost on the next re-import from the source file, with no merge mechanism; or silently overwriting a same-name block that the customer had hand-tuned.

*Source*: Siemens Industry Online Support 79168964; TIA Openness V20 Programming Guide ImportBlock behavior; distilled engineering judgment


## occ12 [addressing] LAD network operands must use symbolic names, not absolute addresses (%M/%I/%Q); especially so under S7-1500 optimized DBs

SD-generated LAD blocks perform full symbol resolution at compile time; every contact/coil operand must be a declared symbol (block interface variable, global DB tag, imported UDT member) and absolute addresses like %M0.0 or %I0.1 are not accepted. TIA V20 enforces symbolic addressing; absolute addresses are not accepted in SD LAD blocks and report 'operand not found'. The S7-1500 uses optimized DBs by default (no fixed byte offsets), which matches SD's symbolic approach exactly. If downstream needs absolute addresses (e.g. Modbus mapping), maintain them via a separate address-mapping table rather than trying to specify offsets in SD. DB variable offsets need not be entered by hand; leave them blank and TIA lays them out automatically per alignment rules — a hand-entered offset with a calculation error causes communication address misalignment.

**Pitfall**: porting code from Step 7 Classic by directly copying %M addresses into SD LAD; the compiler reports operand not found but vaguely, and a newcomer mistakes it for a misspelled variable name.

*Source*: distilled engineering judgment; Siemens programming style guide 109478084; Siemens S7-1500 Optimized Block Access documentation; Siemens TIA V20 mandatory symbolic-programming notes


## occ11 [maintainability] Putting SD files under Git version control is the biggest lever for TIA project maintainability; manage them together with .s7res

TIA .ap project files are binary and cannot be diffed; SD text blocks are the only entry point in the TIA ecosystem that supports line-level diff, code review, and automated CI checks. Putting .s7dcl and .s7res under Git together with a generator/Openness import pipeline achieves 'visible changes, auditable rollback, multi-person collaboration'. The CI pipeline should call PlcSoftware.GetBlockGroup().Compile() immediately after ImportBlocksFromFile and check the returned error list, gating the PR on compile errors. Note that if .s7res is missing or its BOM is lost, import fails in the CI environment while working locally (because the editor adds the BOM automatically) — the most common root cause of CI/local inconsistency.

**Pitfall**: putting only .s7dcl under Git and omitting companion files like .s7res, so import fails in CI but works locally, at high diagnosis cost; or keeping .s7dcl only in a local temp directory, losing all version history at project handover.

*Source*: TIA Openness API manual V17+; distilled engineering judgment; tia-openness-coverage-expansion.md


## occ10 [naming] SD block and variable names are doubly constrained: TIA naming rules + SD parser reserved words; special characters must be quoted or XML-escaped

TIA block-name limits: no spaces (unless double-quoted), no leading digit, no more than 24 characters, no non-ASCII characters (in some versions a name containing Chinese characters is garbled or truncated after import). The SD parser additionally has reserved words (TYPE, NETWORK, BEGIN, END, CALL, AND, OR, NOT, etc.) that cannot be used as variable or block names. A variable name containing a hyphen (e.g. Motor-Start) is parsed as two tokens being subtracted. If the SD XML contains characters such as Chinese, &, <, or >, they must be wrapped in CDATA or escaped as XML entities (&amp; &lt; &gt;). It is recommended that the generator entity-escape all String content, double-quote all block/variable names, and perform keyword-whitelist filtering and cross-file uniqueness checks at generation time.

**Pitfall**: naming a variable with a reserved word such as NOT or NETWORK makes TIA report a syntax error on import, which a newcomer mistakes for an .s7dcl format problem; or an unescaped & character makes the whole file unparseable.

*Source*: distilled engineering judgment; TIA Portal Help: Naming conventions for PLC tags and blocks; TIA Portal Help naming-rules chapter; XML 1.0 specification


## occ10 [datatypes] DB initial values must strictly match their data type, with no implicit conversion; nested STRUCTs must align byte-for-byte with the UDT definition

In SD, a DB variable's initial-value format must exactly match its declared type: write REAL as 1.0 not 1, BOOL as TRUE/FALSE not 1/0, TIME as T#5s, and never assign a REAL literal to an INT. The TIA importer does no implicit type conversion; a type mismatch reports a parse error giving only the line number without naming the specific type conflict. Field names, types, and order of nested STRUCT/ARRAY initial values must align field-by-field with the UDT definition; one field too many or too few fails the entire DB import. RETAIN variables must be tagged individually at declaration rather than declared for the whole block; marking an entire DB as RETAIN may exceed the CPU retentive-area capacity and cause a 0x8090 error. Once in production, UDT field order can only be appended to, not inserted into (insertion misaligns the offsets of subsequent fields).

**Pitfall**: batch-generating DB initial values from Excel without converting an integer column to REAL format with a decimal point, so import reports a line-number error with no apparent cause; or changing UDT field order without synchronizing all instance DBs, misaligning communication read/write data.

*Source*: distilled engineering judgment; Siemens TIA Portal V20 Programming Guideline; S7-1500 System Manual retentive-memory chapter; claw-code real-hardware verification (experience locating DB import failures)


## occ9 [comm] SD LAD instruction names must use the TIA XML internal identifiers (Contact/Coil/TON_TIME, etc.), not IEC mnemonics; pin names are case-sensitive

When calling an instruction in an SD LAD network, use the TIA internal XML instruction identifier rather than the display mnemonic (a normally-open contact is Contact, not -| |-; a coil is Coil; a timer is TON_TIME; a counter is CTU_INT, etc.). Pin names (PIN) are string-matched in the XML, case-sensitive with no fuzzy tolerance (PUT's REQ cannot be written Req). Instruction names are equally case-sensitive; Contact/contact/CONTACT may behave differently. When a pin name is wrong, TIA imports successfully but reports a dangling pin only at compile, which is hard to trace back to the SD source. Use real-hardware downgrade back-derivation to lock down each instruction's canonical name and pin names rather than manually transcribing from manual figures.

**Pitfall**: writing SCL/STL mnemonics (e.g. A, =, TON) directly into an SD LAD network, which TIA cannot recognize; or a pin-name case typo that imports without error and only surfaces as a dangling pin at compile, mistaken for a logic error.

*Source*: claw-code sd-full-instruction-mandate ledger; real-hardware downgrade back-derivation verification (TIA V16/V21); distilled engineering judgment; Siemens STEP 7 instruction-library documentation


## occ9 [architecture] LAD Network numbers must increment continuously from 1; a duplicate or skipped NETWORK ID silently loses or overwrites networks

In SD, each LAD network is declared in order as NETWORK 1, NETWORK 2, …, and TIA scans and executes them in ascending number order. A gap in numbering (e.g. 1,2,4) raises no error, but all subsequent networks from the gap onward are silently discarded. With a duplicate NetworkID, the later network silently overwrites the earlier one (also with no error). When auto-generating multiple networks, number them with a monotonically increasing counter and never reuse or skip. Execution order is logic priority: earlier networks execute first and their results are immediately visible to later ones (within the same scan cycle), so the 'read input → compute → output' three stages must be ordered as networks accordingly. Concurrent generation followed by out-of-order concatenation causes data-dependency errors.

**Pitfall**: copy-pasting a generator template without incrementing NetworkID, so after import only the last same-numbered network remains and the rest are overwritten with no notice; or forgetting to renumber after deleting a middle network, so the ladder's network count does not match expectations.

*Source*: sd-full-instruction-mandate.md real-hardware verification; distilled engineering judgment; TIA Portal LAD scan-order specification


## occ8 [maintainability] Comments in SD (TITLE/COMMENT/double-slash) are the only source of project readability and must be injected systematically during generation

Network titles, comments, and variable comments from the TIA graphical editor are preserved in the corresponding fields (TITLE/COMMENT/end-of-line comments) when exported to SD, and are restored to graphical comments on reverse import. If comment fields are omitted when generating SD, then after import every network has no title and every variable has no comment, sharply raising maintenance cost. Minimum usable standard: every network has at least a TITLE, and every DB variable has at least an end-of-line comment. Comment fields support Chinese (UTF-8), but special characters (quotes, backslashes, XML special characters) must be escaped. Comment lines start with // and must precede the RUNG; (* *) block-comment style is not supported.

**Pitfall**: leaving comment fields blank in the generator script to save code, so during review after import the project is sent back for rework due to 'no comments', and regeneration/re-import again faces overwrite risk.

*Source*: TIA Portal V20 SIMATIC SD Help TITLE/COMMENT field notes; distilled engineering judgment


## occ7 [datatypes] DB/UDT data types must use TIA standard names, not IEC aliases; nested-UDT / array syntax is stricter than SCL

The TIA SD parser recognizes TIA-native names such as BOOL, INT, DINT, REAL, LREAL, TIME, DATE, STRING, ARRAY, STRUCT, but does not accept some IEC 61131-3 aliases (SINT is mis-recognized in some versions, UINT is restricted on the S7-1200). S7-1500-only types (LWORD, ULINT) cannot be carried into an S7-1200 project. The syntax for nested UDTs and arrays (ARRAY[0..9] OF REAL) is highly similar to SCL but not identical; extra spaces, wrong bracket placement, or wrong enumeration order all cause import failure with a vague error message. Safest approach: first hand-build a sample UDT in TIA, then export the .s7dcl format via Openness as a template to look up the correct syntax.

**Pitfall**: writing a UDT declaration per the SCL manual and getting a syntax error on import even though the manual's form is itself correct — because the SD format differs slightly from the SCL editor format.

*Source*: distilled engineering judgment; SIMATIC S7-1500 SCL programming manual data-types chapter; S7-1200 system manual data-types chapter


## occ7 [scan_cycle] Timers must be declared as static variables (VAR_STAT) of type IEC_TIMER, not T# bit addresses; a VAR section resets them on every call

In TIA V20/V21 SD blocks, timer (TON/TOF/TP/TONR) instances must be of type IEC_TIMER, declared in the FB's VAR_STAT section or in a global DB. S7-300/400-style T0..T255 bit addresses cannot be used (SD LAD enforces symbolic addressing). If IEC_TIMER is mistakenly declared in the VAR section, the timer instance is reset on every FB call, so the timer never counts. Call format: TON_Instance(IN:=StartBit, PT:=T#5s, Q=>DoneBit, ET=>ElapsedTime). Calling TON directly while omitting the IEC_TIMER instance reports a 'missing instance data block' error.

**Pitfall**: mistakenly declaring IEC_TIMER in an SD FB's VAR section instead of VAR_STAT resets the timer on every call — the timer never counts, working in simulation but dead on real hardware.

*Source*: Siemens TIA Portal S7-1200/1500 programming manual, timer/counter chapter; distilled engineering judgment


## occ6 [comm] Communication instructions (PUT/GET/TSEND_C/TRCV_C) must describe all pins fully in SD, and the connection ID must be strictly bound to the HW configuration

In the SD description of a communication instruction in a LAD network, all input/output pins — including the 'optional' BUSY/DONE/ERROR/STATUS — must be written out explicitly and given a valid connection or an empty-connection declaration, otherwise TIA raises dangling-pin warnings or even compile errors after import. PUT/GET's ID parameter and TSEND_C/TRCV_C's CONNECT parameter must correspond one-to-one with the connection-resource ID in the TIA hardware configuration (do not hard-code ID=1); a mismatched ID compiles but fails to establish communication at runtime, with no alarm, only a timeout. TCON_Param field offsets are fixed; generate from a real-hardware-verified byte template rather than computing them by hand.

**Pitfall**: writing only the four 'main' pins REQ/ID/ADDR/RD_1 and omitting BUSY/DONE/ERROR/STATUS, so compile reports unconnected pins after import; or hard-coding connection ID=1 in batch generation, so a multi-device project fails all communication at runtime.

*Source*: distilled engineering judgment; sd-full-instruction-mandate.md comm-block 42-instruction compilation; SIMATIC S7-1500 PUT/GET communication manual TCON_Param structure definition


## occ6 [naming] Every UID in SD must be unique within its current Network; a duplicate Network-element UID is the hardest silent error to diagnose

Every network element (contact, coil, function-block call) in an SD file needs a UID string that must be unique within the same Network; global uniqueness across Networks is recommended to avoid confusion. On a duplicate UID, TIA sometimes does not report an error and silently merges nodes, making the ladder topology diverge from expectation with no error message. Always assign UIDs from a global counter or UUID when generating SD. Copy-pasting a Network template most easily carries the same UID and produces silent-merge bugs; batch code generation must increment UIDs programmatically.

**Pitfall**: copy-pasting a Network template carries the same UID, TIA silently merges nodes, and the ladder topology is wrong with no notice, discoverable only by eyeballing a comparison.

*Source*: distilled engineering judgment; TIA Openness SimaticML UID uniqueness requirement


## occ5 [state_machine] Avoid double coils in SD LAD: use SR/RS instructions or SET/RESET coils for interlocking, and drive each bit from only one network

SD LAD supports SR (set-dominant) and RS (reset-dominant) flip-flop instructions, as well as SET/RESET coils. If an ordinary coil writes the same bit twice (double coil), the later one overwrites the earlier within the scan cycle and the logic is unpredictable (TIA raises no warning; it depends on network order). Correct state-machine approach: use an SR/RS instruction block, or use separate SET/RESET coils and ensure only one is active per cycle. The generator should ensure each output coil is driven by only one network within the block.

**Pitfall**: writing two ordinary COIL networks for the same BOOL variable in SD LAD; TIA raises no warning, and at runtime the later network overwrites the earlier — the state machine chatters and is hard to debug.

*Source*: distilled engineering judgment


## occ4 [comm] A DB's optimized/standard access attribute must be declared explicitly in the SD block header and must match the caller (HMI / communication program)

In TIA a DB has two modes, optimized (Optimized block access) and standard access, declared with the corresponding attribute in the .s7dcl block header. If the generator produces optimized DBs by default while an upper-layer HMI or communication program accesses via absolute addresses, this causes runtime access errors. During import, if a same-name block already exists in the target project but with a different access mode, TIA refuses to overwrite and reports a conflict error. Engineering standard: declare the access mode explicitly, do not rely on the TIA default, and note each DB's access type in documentation. Incremental-update projects must determine existing block attributes before generating SD.

**Pitfall**: generating an optimized DB while the HMI accesses via absolute addresses causes runtime access errors that are hard to trace to the DB type; or a same-name/different-attribute silent failure mistaken for an SD format problem.

*Source*: distilled engineering judgment; TIA Portal V15+ Help: Optimized block access
