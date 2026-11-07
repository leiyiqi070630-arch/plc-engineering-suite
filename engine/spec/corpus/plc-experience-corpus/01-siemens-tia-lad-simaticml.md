# Siemens TIA LAD / SimaticML XML

> Applies to: vendor=siemens family=tia_openness language=xml; format and execution model for ladder (LAD) → SimaticML XML (BOM/FlgNet/CompileUnit/UId/Access Scope/DisabledENO/double-coil/scan order)
> 26 entries, ordered by occurrence count (occ/30) from high to low.


## occ28 [architecture] SimaticML files must carry a UTF-8 BOM; the root version declaration must match the TIA version; V16 format is the most compatible

TIA Portal strictly requires SimaticML files to begin with a UTF-8 BOM (EF BB BF). UTF-8 without BOM, UTF-16, and other encodings cause garbled text, parse failure, or silent rejection on some TIA versions. The root <Document> element's Version/SchemaVersion attributes must correspond to the target TIA version. A newer TIA can import older XML (forward compatible); an older TIA rejects newer files. Practice: generating everything as V16 format (version="V16", xmlns using the v4 document system) covers all versions V16-V21. An empty .s7res file's content must be '<root/>' with a BOM, not a truly empty file. When generating with Python, use encoding='utf-8-sig' or manually write b'\xef\xbb\xbf' at the file head.

**Pitfall**: Python's default open('f','w',encoding='utf-8') writes a BOM-less file; or setting version to V21 and then importing on a V16 TIA fails outright, with the error message only reading '无法识别的文件' (unrecognized file) rather than pointing to an encoding or version problem.

*Source*: real-machine TIA V16/V21 import tests; claw-code engine real-machine fix records; TIA Openness coverage expansion memory; sd-full-instruction-mandate memory; distilled engineering judgment


## occ27 [architecture] In SimaticML each LAD Network maps to one <SW.Blocks.CompileUnit>; the Network ID is unique across the whole block and strictly increasing

In TIA-exported SimaticML, each LAD rung network maps to one <SW.Blocks.CompileUnit> node containing a <NetworkSource><FlgNet> structure. Each CompileUnit's ID attribute must be globally unique and monotonically increasing across the whole file. The UId attributes of <Part>, <Wire>, and <Access> inside a Network must be unique within that CompileUnit's scope (different CompileUnits number independently). One Network corresponds to one complete rung; packing multiple logic paths into one CompileUnit or reusing an ID causes TIA to report a structural error or silently drop the Network on import.

**Pitfall**: copy-pasting a Network template without updating ID/UId; TIA silently discards the duplicate nodes on import and the rung disappears with no error message.

*Source*: measured TIA Portal SimaticML V16 export file structure; community plcforum.uz discussion; TIA Portal Openness API manual; distilled engineering judgment


## occ26 [architecture] SimaticML FlgNet structure: Parts define elements, Wires define connections; UId is unique per CompileUnit and pin names are case-sensitive

Each <FlgNet> contains two child nodes, <Parts> and <Wires>. Parts lists all instruction blocks (Contact, Coil, Call, etc.), each Part carrying a UId attribute; Wires establish connections via NameCon/IdentCon/PowerrailCon/OpenCon that reference a Part's UId and pin name. Pin names must exactly match the TIA built-in instruction library and are case-sensitive (e.g. EN/ENO must be uppercase, never En/Eno). Wire connection types: PowerrailCon connects to the left power rail, IdentCon connects to a named pin that has a symbol name (e.g. TON's IN/PT/Q/ET), NameCon is an intermediate series node. Parts and Wires must be paired with consistent UId references; if either side is missing or the UId does not match, TIA reports 'inconsistent network' at compile time rather than a syntax error.

**Pitfall**: writing Parts but forgetting the matching Wire, or misspelling a pin name (e.g. ENO as Eno); after import TIA shows the network as an empty rung with no error, which is very hard to diagnose.

*Source*: SimaticML V16 Schema XSD; TIA Portal Openness manual, FlgNet structure chapter; real-machine V16/V21 export comparison; claw-code engine real-machine verification; distilled engineering judgment


## occ25 [edges] The edge-storage bit for P_TRIG/N_TRIG must live in Static or the M/DB area, dedicated per instance; never use a Temp variable or share it

In LAD, the P_TRIG (rising edge) and N_TRIG (falling edge) instructions internally need a Bool auxiliary storage bit to hold the previous scan cycle's state. If that bit is in the Temp area, Temp is cleared on every OB execution, so the edge can never trigger correctly (it is either always seen as a rising edge or never triggers). It must use Static (inside an FB), a global DB bit, or the M area. Multiple edge detectors must not share the same storage bit, or they interfere and cause random false triggers. When generating SimaticML, assign each edge-detection instance a unique Bool storage bit, wire it correctly to the CLK pin, and declare these auxiliary variables explicitly in the block interface's Static area.

**Pitfall**: using a Temp bit for edge storage in an FC, cleared every scan cycle so the edge fires every cycle; or multiple P_TRIG instances sharing one M auxiliary bit, where one path's edge toggle disturbs the others' detection.

*Source*: Siemens S7-1200 System Manual, edge-detection instruction chapter (6ES7298-8FA30-8BH0); TIA Portal help, P_TRIG/N_TRIG instruction notes; SD full-instruction task real-machine verification; claw-code engine fix records; distilled engineering judgment


## occ24 [timers] Each IEC timer (TON/TOF/TP) instance must bind a dedicated instance DB or FB Static variable; never share; do not use S5Timer

S7-1200/1500 drop the S5 timers (T0-T255) and support only the IEC timers TON/TOF/TP/TONR. Each timer call must be associated with a unique instance DB of type IEC_TIMER or an FB Static member. Multiple Networks sharing one timer instance cause ET/Q to overwrite each other, producing random timing chaos. S7-1200 does not support S5Timer at all; S7-1500 offers limited support in compatibility mode but Siemens strongly discourages it. In SimaticML, a TON's Call node must point to a declared DB instance via the InstanceDB attribute or an <Instance> child node; if missing, TIA reports 'instance missing'. The time value type is TIME (T#5s format); S5T# or integer milliseconds cannot be used.

**Pitfall**: porting from S7-300 by directly using T0/T1 absolute timer addresses, which fails to compile on S7-1200; or copy-pasting a Network without changing the InstanceDB reference, so multiple timers share one DB and overwrite each other — compiles fine but timing is chaotic at runtime.

*Source*: Siemens S7-1200/1500 IEC Timer manual (6ES7298-8FA30-8BH0); TIA Portal online help, IEC timer instantiation notes; TIA Portal S7-1200 System Manual, Chapter Timers; distilled engineering judgment


## occ23 [architecture] DisabledENO attribute: when a function block does not use ENO it must explicitly declare DisabledENO='true'; it cannot be left dangling

In TIA LAD almost every function block (ADD/MOVE/TON, etc.) has an EN enable input and an ENO enable output pin. In SimaticML, if ENO is not explicitly connected to the next block's EN, TIA reports an 'ENO pin not connected' error on import or produces an implicit broken link. For terminal instruction blocks that do not need ENO chaining, add the DisabledENO='true' attribute on the Part node to mark it explicitly; where ENO must chain, connect ENO's Wire to the next Part's EN. Coil-type instructions (Coil/NCoil/SCoil/RCoil) do not need ENO. Adding DisabledENO by mistake leaves the following instruction's EN permanently de-energized, causing a silent broken logic link.

**Pitfall**: when batch-generating function blocks, uniformly leaving ENO unconnected and also omitting DisabledENO; on import TIA raises many 'Pin ENO not connected' warnings or even errors, and in some versions the following instruction is silently skipped, producing an invisible broken link.

*Source*: SD full-instruction task real-machine locked record (DisabledENO/Not pitfall); comparison against real-machine TIA Portal SimaticML export samples; real-machine V16/V21 comparison verification; distilled engineering judgment


## occ22 [addressing] SimaticML operands use the <Access> node; Scope distinguishes LocalVariable/GlobalVariable/LiteralConstant and must match the actual symbol table

In SimaticML each operand is expressed with <Access Scope='...'>: LocalVariable corresponds to an FB/FC internal Temp/Static variable, GlobalVariable to a global DB/M/I/Q address, and LiteralConstant to an immediate value. A wrong Scope (e.g. writing a DB variable as LocalVariable, or an FC local variable as GlobalVariable) makes the variable show a red question mark after import, failing compilation or fetching the wrong value at runtime. An operand references a symbol via <Symbol><Component Name='VarName'/></Symbol>, case-sensitive, and must exactly match the Tag name in the PLC tag table. Symbolic and absolute addressing cannot be mixed within one Access. Fully symbolic addressing is recommended; absolute addresses error out directly in S7-1500 optimized blocks.

**Pitfall**: writing a global DB variable's Scope as LocalVariable makes TIA error during symbol resolution or mistake the variable for a block-local one; a case mismatch in Component Name imports successfully but fails address resolution at runtime, showing a question mark in monitoring.

*Source*: Siemens SimaticML Schema docs / TIA Portal Openness SDK manual, Access element chapter; TIA Portal SimaticML V16/V17 Schema; real-machine TIA V16/V21 import tests; claw-code engine real-machine verification; distilled engineering judgment


## occ21 [scan_cycle] A LAD coil address should be output in only one Network (double-coil rule); with multiple assignments the last-executed Network wins

LAD scans once in Network-number order; if the same Q/M bit is driven by coils in multiple Networks, the last-executed one overwrites all prior results. In strict mode S7-1500 issues a 'multiple coil' warning but does not block compilation; actual behavior follows the last Network. To drive one output from several conditions, merge them on the condition side into a single coil in one Network using parallel/series logic, or switch to SET/RESET coils (SCoil/RCoil) to manage the latched state in zones. A SimaticML generator should run a global output-address conflict check before generation.

**Pitfall**: a generator scattering coils for the same Q address across functional modules compiles fine but produces random output reversals in the field; when both SET and RESET occur in one scan cycle, the later Network wins, which is mistaken for a hardware fault during debugging.

*Source*: Siemens S7-1200 System Manual, program execution chapter (6ES7298-8FA30-8BH0); TIA Portal online help, 'Multiple coil use'; S7-1500 programming guideline, double-coil rule chapter (FA169002); distilled engineering judgment


## occ20 [architecture] LAD Network granularity principle: one Network expresses one logical intent, one independent circuit

Each Network does one thing (one output coil / one interlock / one function-block call); do not pack unrelated logic into one Network. An overly coarse Network prevents TIA from correctly parsing multi-branch parallel/series topology after import, and detaches comments from the network, hurting maintainability. Engineering upper limit: a single Network's contact rows should not exceed 7-8 columns and elements should not exceed 15. Moderate granularity also lets TIA's Cross Reference pinpoint down to the network level. In SimaticML, write a clear function description in each CompileUnit's Title comment field (e.g. 'Motor_Start_Interlock' rather than 'Network 1').

**Pitfall**: cramming 10 coils into one Network makes the SimaticML Wire topology complex and connections error-prone when hand-writing or generating XML; after merging several independent coils, TIA sometimes parses a parallel branch as an unintended series on import.

*Source*: distilled engineering judgment; Siemens TIA Portal STEP 7 Programming Guideline V1.0; Siemens SIMATIC S7-1500 Programming Guideline FA169002; measured TIA Portal export


## occ19 [scan_cycle] LAD scans once in Network order; within a cycle a later Network reads the current-cycle new value written by an earlier Network

TIA LAD executes a single scan strictly top-to-bottom in CompileUnit-number order. Within one scan cycle, an intermediate M bit written by Network N is read by Network N+1 (positioned after N) as the already-updated new value of this cycle — unlike Mitsubishi GX Works' 'read-before-write'. But a Network positioned before N reads that bit's snapshot from the previous cycle. When generating SimaticML, the CompileUnit ordering directly determines execution order and signal-propagation timing; the generator must place the 'writer' Network before the 'reader' Network, otherwise it produces single-cycle delay jitter and logic misalignment in high-speed applications.

**Pitfall**: an auto-generator ordering Networks alphabetically by variable name happens to place the consumer before the producer, delaying logic by one cycle; placing the 'enable condition' Network after the 'action' Network makes the enable signal take effect only on the next scan cycle.

*Source*: Siemens S7-1200/1500 CPU scan-cycle notes; S7-1200 system manual, program cycle and process image chapter (A5E02486680); TIA Portal online help, Program execution; distilled engineering judgment


## occ18 [interlock_safety] Interlock contacts must be in series ahead of the coil in the same Network; do not rely on program order or program-level IF logic to replace series contacts

Safety interlocks (emergency stop, overload, door access, forward/reverse interlock, etc.) must be placed as NC contacts (NC Contact, Negated='true' attribute in SimaticML) in series on the power-flow path within the same Network as the protected coil. Do not rely on the program-order logic that 'an earlier Network already reset it', nor on SCL-level IF logic alone, because a hardware-interrupt OB can break the order and HMI-level control fails during a communication fault. A series contact automatically breaks power flow on signal loss (broken wire, sensor power loss), inherently satisfying the fail-safe principle. Hardware interlocks (contactor auxiliary contacts, safety-relay circuits) must exist independently of the PLC program; LAD software interlocks are only the second line of defense.

**Pitfall**: omitting Negated='true' during SimaticML generation produces an NO contact instead of NC, inverting the interlock logic and, in the extreme, disabling emergency stop; doing only software interlocking without hardware interlocking energizes both paths simultaneously when the PLC output module fails or the program runs away.

*Source*: distilled engineering judgment; IEC 62443/IEC 62061/ISO 13849 functional-safety standards; IEC 60204-1 electrical-safety standard; NFPA 79 ladder-diagram safety specification


## occ17 [architecture] A LAD coil can only be at the far right of a Network; never place a coil in the middle of a contact series

Both IEC 61131-3 and TIA LAD require the output coil (Output Coil/Set/Reset) to be the rightmost element of a rung, with no contact or function block allowed to its right. In SimaticML, a coil Part (Name='Coil'/'SCoil'/'RCoil') must have its output connected to the right-hand PowerRail or an OpenCon, not to another Part. If a generator places a coil in the middle, TIA reports the 'Coil in the middle of network' syntax error on import. For parallel outputs, place two independent coils in series at the end of the main branch, or split into two Networks.

**Pitfall**: to add a condition after a coil, move the condition to series contacts on the coil's left side; placing a SET/RESET coil in the middle is legal in IL but illegal in LAD, and when generating XML TIA silently deletes that Network with no warning.

*Source*: IEC 61131-3:2013 section 9.1; TIA Portal Help > LAD programming rules; Siemens S7-1200/1500 LAD/FBD programming manual (A5E03461185-AN); distilled engineering judgment


## occ16 [state_machine] For LAD state machines, use an INT step-number variable + CMP compare contact + MOVE transition pattern, one Network group per step

The most maintainable way to build a state machine in LAD: store the current step in one INT/DINT variable Step, begin each Network with a CMP_EQ (step == N) compare contact as the enable condition, execute actions and outputs within the step, and write the next step number with MOVE once the transition condition is met. This pattern is superior to the 'interlock-bit-group' approach of scattering many Set/Reset coils across Networks — the latter's state-transition logic is not clear at a glance and races from multiple simultaneously active steps are hard to diagnose. In SimaticML each state maps to one CompileUnit group, and the step variable is usually an INT in a DB. Place the step variable in a retentive DB to support resume-after-power-loss. Avoid writing the Step variable twice in one scan cycle, which jumps two steps in a single cycle.

**Pitfall**: using a BOOL array instead of an INT for the step number makes maintenance complex beyond 32 steps and mutual-exclusion logic easy to miss; mixing transition and action in one Network executes the new state's action on the same cycle as the transition, producing an unintended double action in one scan.

*Source*: distilled engineering judgment; Siemens application example Entry-ID 109748535; Siemens Sequential Control in STEP 7 Entry-ID 26122363; gongkong (工控人家园) forum, sequential-control LAD best-practice discussion


## occ15 [architecture] SimaticML parallel branches must be wrapped with OpenBranch/CloseBranch; do not flatten parallel contacts into multiple Wires

Parallel contacts (OR logic) are explicitly marked in SimaticML with <OpenBranchComponent> and <CloseBranchComponent> denoting the branch start and end, with the inner contacts wired in series. Parallel contacts cannot be flattened into multiple independent Wires connected to one node — TIA fails to parse the OR relationship and reports a network-topology error. Every parallel section must insert a matching OpenBranch/CloseBranch pair. Coils are not allowed inside an OpenBranch/CloseBranch parallel branch; they can only be at the end of the main branch. PowerRail must be the single starting point of every Network, and each CompileUnit has exactly one PowerrailComponent.

**Pitfall**: drawing a parallel as two Wires directly to the same PowerRail looks legal in XML but after import TIA turns the logic into series or errors; placing a coil inside a parallel branch makes TIA report an illegal coil position.

*Source*: distilled engineering judgment; SimaticML schema docs; measured comparison of TIA Portal SimaticML exports


## occ14 [datatypes] SimaticML data-type strings must use TIA's built-in Pascal-Case names, case-sensitive; IEC aliases or C-style names are not accepted

In SimaticML the <Datatype Name> attribute must use TIA's internal names: Bool, Byte, Word, DWord, LWord, Int, DInt, LInt, USInt, UInt, UDInt, ULInt, Real, LReal, Time, Date, TOD, DT, String, WString, Char, WChar. Uppercase forms like 'BOOL' are accepted in some versions, but 'boolean', 'bool', 'FLOAT' (should be Real), and 'INTEGER' will always fail. String types need a maximum length, e.g. String[254]. Array form: <Datatype Name='Array' Low='0' High='9'><Datatype Name='Int'/></Datatype>. SInt is called SInt in TIA (not SINT); an all-uppercase mistake may fail silently.

**Pitfall**: copying data-type strings from other tools brings all-uppercase 'BOOL'/'INT', making every variable report a type error on batch import; using 'FLOAT' instead of 'Real' fails silently on import or reports a type error at compile.

*Source*: SimaticML Schema XSD (TIA Portal Openness SDK, Siemens SIOS ID 109748955); TIA Portal S7-1200/1500 system manual, data-types chapter; TIA Portal information system, data-types overview; distilled engineering judgment


## occ13 [scan_cycle] S/R (Set/Reset) coil priority: within one scan cycle the later-executed Network wins; the order must be designed explicitly

When both S and R coils act on the same bit in TIA LAD, the physically later-executed instruction determines the final value. For reset priority, place the R coil Network after the S coil Network; and vice versa. In SimaticML the physical order of Networks is the execution order. Placing S and R coils in one Network's parallel branch makes the result depend on the compiler's internal order — use the SR (set priority) or RS (reset priority) instruction block instead. Emergency-stop / safety circuits must use RS (reset priority, R1=1 resets with priority) to ensure the STOP signal always overrides START. In SimaticML this maps to <Part Name='SR'> or <Part Name='RS'>; ordinary coils cannot be used to fake SR logic.

**Pitfall**: mistakenly using the SR instruction for an E-Stop circuit (S1=1 gives set priority), letting the START signal still override RESET and failing safety review; placing S and R coils in one Network's parallel branch expecting reset priority yields an undefined result.

*Source*: distilled engineering judgment; Siemens TIA Portal LAD/FBD/STL Programming Manual, S/R semantics; Siemens S7-1200 System Manual, SR/RS Flip-Flop Coil chapter; real-machine V16 export verification


## occ12 [architecture] A LAD Network is an independent execution unit; cross-Network state must be relayed explicitly through an M/DB bit; the RLO resets automatically at a Network boundary

Each TIA LAD Network is an independent piece of ladder logic; the RLO (Result of Logic Operation) resets to 0 automatically at a Network boundary. Passing state across Networks must go explicitly through a bit variable (M area or DB bit); it cannot rely on implicit RLO propagation. Correct approach: one Network expresses one logical intent, using an intermediate bit to pass the result between Networks. This is the biggest semantic difference between Siemens LAD and a relay diagram. Internal segments cannot be shared between networks — a SimaticML Wire is valid only within its own CompileUnit scope.

**Pitfall**: beginners writing multiple logic segments in one Network hurt readability badly, or wrongly assume the previous Network's RLO carries into the next; leaving a Network with no coil/instruction output at the end dangles the RLO without an error.

*Source*: distilled engineering judgment; measured TIA Portal SimaticML V16 export file structure; TIA Portal STEP 7 Programming Guideline V1.0 Section 3.1; gongkong (工控人家园) forum, LAD programming-convention discussion


## occ11 [addressing] The three Wire endpoint types IdentCon/NameCon/OpenCon must not be interchanged

A SimaticML Wire has three connection child-node types: PowerrailCon connects to the left rail; IdentCon connects to a named pin that has a symbol name (a Part's named Port, e.g. TON's IN/PT/Q/ET); NameCon is an anonymous intermediate node representing an internal series connection between two Parts. The three cannot be confused: using IdentCon where a NameCon is needed at a series intermediate point makes TIA refuse the import; only a Part's named pin uses IdentCon, while an ordinary contact-series intermediate node must use NameCon. OpenCon explicitly marks a dangling (unused) pin.

**Pitfall**: at series intermediate nodes wrongly using IdentCon (with a Name attribute) when the intermediate node must use NameCon; a misspelled pin name (e.g. EN as En) is rejected by TIA or yields an empty network.

*Source*: SimaticML V16 Schema: SW.Blocks.FlgNet/Wires/Wire child-element definitions; distilled engineering judgment


## occ10 [naming] Each SimaticML CompileUnit must have <Title> and <Comment> descriptions; MultilingualText must have at least one Language entry

Each SimaticML Network's <Title> and <Comment> fields are the primary metadata TIA shows in online monitoring and program documentation, so always fill in a meaningful title (e.g. 'Motor_Start_Interlock' rather than 'Network 1'). At least one <MultilingualTextItem Language='zh-CN'> (or 'en-US') entry must hang under <MultilingualText>; if <Items> is empty or missing, TIA V16-V21 silently drops that network's comment on import or, in some versions, reports an XML-structure warning. Symbol names for variables are recommended in ASCII underscore style (e.g. Motor1_Run_Cmd), with the Chinese description placed in the Comment field wrapped in CDATA.

**Pitfall**: leaving Title empty or writing Network_1/Network_2 during batch generation makes logic hard to locate after handover; omitting the <Items> node leaves all network titles blank in TIA; a symbol name containing Chinese parentheses or spaces is silently truncated to an empty name on import.

*Source*: distilled engineering judgment; real-machine SimaticML import verification (TIA V16/V21); Siemens TIA Portal STEP7 Style Guide, comment requirements


## occ9 [edges] LAD rising/falling-edge contacts use PContact/NContact (or a P_TRIG/N_TRIG Part) in SimaticML, not a Contact with a Negation attribute

In SimaticML, rising-edge detection maps to a dedicated Part Name='PContact' (rising-edge contact) or Part Name='P_TRIG', and falling edge to 'NContact' or 'N_TRIG'. It is not simulated by adding a parameter to an ordinary Contact. Confusing them compiles the edge logic into an ordinary contact — no runtime error but completely wrong logic. Trying to fake an edge with Contact plus Negation='true' actually produces an NC (normally-closed) contact, semantically entirely different from a rising edge. Prefer the built-in P/N contacts or the P_TRIG/N_TRIG FB; do not manually XOR an auxiliary bit to fake an edge — in multitask/multi-OB scenarios call-order disorder causes false triggers.

**Pitfall**: sharing one P_TRIG instance DB across two different OBs (e.g. OB1 + OB35) lets the two OBs overwrite each other's CLK_MEM bit, disabling edge detection entirely; forgetting the EdgeModifier attribute on an edge-contact Part in SimaticML degrades the generated contact into an ordinary NO contact.

*Source*: reverse analysis of TIA Portal LAD-exported XML; real-machine V16/V21 verification; Siemens S7-1200/1500 LAD programming manual; TIA Portal STEP7 instruction manual, edge-detection chapter; distilled engineering judgment


## occ9 [comm] When LAD calls an FB, SimaticML must include the InstanceDB reference; single-instance and multi-instance forms differ

An FB call in LAD uses a <Call> node in SimaticML and must contain <CallInfo>/<Instance> child nodes specifying the instance DB name and number. Omitting the InstanceDB reference leaves the function block's pins dangling after import and the program will not compile. A single-instance call points to a standalone DB; as a multi-instance inside a parent FB, the InstanceDB instead references the parent FB's Static variable path. The two forms have different XML structure: single-instance uses a DB number, multi-instance uses a variable name. The FB block's ProgrammingLanguage attribute must be LAD (case-sensitive); writing lad or Lad makes it recognized as STL on import.

**Pitfall**: omitting the <Instance> node gives no import error but an 'instance data block not found' message at compile; writing the FB's ProgrammingLanguage as lad makes it recognized as STL, causing the whole block to fail parsing.

*Source*: distilled engineering judgment; TIA Portal S7-1200/1500 programming manual, FB/instance-DB chapter; TIA Openness real-machine verification; SD full-instruction task record


## occ8 [scan_cycle] The S7-1200/1500 output image area (PQ) is flushed to physical outputs at the end of the scan cycle, not mid-cycle

Within a scan cycle the CPU writes process outputs (Q) to the output image, and flushes them to the physical output modules together at the cycle end. For an immediate output mid-OB1, use POKE_BLK or direct addressing (the ':P' suffix) to force an immediate write. Most scenarios need no immediate write, but for high-speed response (emergency stop, pulse output) it must be an explicit choice. Along one OB execution path, when the same output bit is written by multiple Networks, the last-executed write takes effect (centralized process-image flush).

**Pitfall**: checking at the end of OB1 whether an output took effect shows the Q bit already at the new value, but the physical output has not switched yet — do not use the software debug window's Q bit in place of confirming the actual signal.

*Source*: SIMATIC S7-1500 system manual, 'Updating the process image' chapter; Siemens S7-1200 system manual, section SC8 (A5E02486680); distilled engineering judgment


## occ7 [compare_math] LAD compare instructions take contact form (Contact type) in SimaticML; EN/ENO pins must be wired explicitly

TIA LAD compare instructions (EQ_I, GE_R, etc.) appear graphically as contacts (Contact) and in SimaticML map to a <Contact> node with an Instruction attribute or to <Part Name='CmpEQ'>, etc., not a <Part type='Box'> box instruction. If a generator wrongly writes a compare instruction as a Box form, TIA shows it as an unknown box after import that does not participate in the rung's logic flow. The EN pin of arithmetic instructions like ADD/SUB/MUL/DIV must have a Wire in, and if ENO is unused add DisabledENO or connect an OpenCon. A compare instruction's two operand pins IN1/IN2 both need a Wire to the corresponding Access data source, or TIA reports 'operand missing'.

**Pitfall**: writing EQ_I as <Part type='Box'> breaks the rung after import, disabling the compare logic entirely with no compile error; wrongly using IdentCon instead of NameCon at a series intermediate node causes a topology error.

*Source*: distilled engineering judgment; reverse-engineering the SD lad_patterns generator against real hardware; reverse observation of real-machine SimaticML import; sd-full-instruction-mandate memory, DisabledENO pitfall record


## occ7 [naming] SimaticML variable naming: ASCII underscore style + function_device_direction convention; avoid Chinese symbol names and special characters

TIA Portal supports Chinese symbol names, but after SimaticML XML export the Chinese is UTF-8-encoded into the Symbol node, and some third-party tools or older TIA versions truncate or garble it when parsing the BOM/multibyte sequences. Engineering practice: use ASCII + underscore for symbol names (e.g. Motor1_Run_Cmd, Tank1_Level_PV); direction suffixes _Cmd/_Fb/_SP/_PV quickly distinguish command from feedback, and put the Chinese description in the Comment field. During SimaticML generation, wrapping the Comment node in CDATA safely holds Chinese. Absolute addresses should be bound only at the HW-configuration layer, with the program layer using symbols throughout.

**Pitfall**: a symbol name containing Chinese parentheses or spaces is silently truncated to an empty name on import, breaking all references to that variable; mixing symbol names and absolute addresses in the program breaks many Networks after a hardware board change reassigns addresses.

*Source*: distilled engineering judgment; measured cross-version SimaticML migration on TIA V16/V21; Siemens TIA programming conventions


## occ6 [analog_scaling] Analog-processing standard chain: NORM_X normalize + SCALE_X scale; in SimaticML the IN/MIN/MAX pin types must be strictly consistent

The S7-1200/1500 LAD analog-processing standard chain: NORM_X normalizes the raw integer (0-27648 or 0-32511) to a Real 0.0-1.0, and SCALE_X then maps it to the engineering range. In SimaticML these are <Part Name='NORM_X'> and <Part Name='SCALE_X'>, with the MN/MX pins taking a LiteralConstant or a DB variable, the VALUE pin taking the input, and the OUT pin the output. MN must be < MX, and the MN/MX types must be the same as VALUE (both Real or both Int); mixing types causes an implicit-conversion warning or compile error.

**Pitfall**: using INT literals for MN/MX while VALUE is Real makes TIA report a type mismatch; feeding an IW input's Int value directly into SCALE_X's IN while skipping NORM_X yields an implicit type-conversion error or wrong-range output.

*Source*: S7-1200/1500 STEP7 analog-processing instruction manual (A5E03461444); TIA Portal STEP7 standard-library NORM_X/SCALE_X instruction manual; distilled engineering judgment


## occ5 [naming] FB instance-DB naming and multi-instance choice: keep standalone-DB naming uniform; multi-instance nesting is limited on S7-1200

S7-1500 supports multi-instance (a nested FB inside an FB sharing one instance DB), suitable for many similar devices to reduce DB count. But S7-1200 limits multi-instance nesting depth, and the interface declaration for multi-instance in SimaticML XML nests in a complex way. For beginner projects, give each FB instance its own standalone instance DB with a uniform naming rule of 'DeviceName_IDB' for easy HMI addressing and online monitoring. In SimaticML, multi-instance is declared as a child-FB-typed variable in the parent FB's Static area (<Member Datatype='FB_xxx'/>), and at the call site the InstanceDB instead references the Static variable name rather than a standalone DB number.

**Pitfall**: blindly using multi-instance makes the HMI variable address 'FB1_IDB'.Motor1.Running, and the overly deep path causes WinCC configuration errors; multi-instance and standalone-DB calls have different XML structure, and confusing them makes TIA report 'instance data block not found'.

*Source*: distilled engineering judgment; Siemens S7-1500 Function Manual, FB/DB chapter; TIA Portal S7-1200/1500 programming manual, FB/instance-DB chapter


## rm-a [architecture] FlgNet v5 (TIA V21): within one network the UId is globally unique across ALL defining elements, and a parallel branch shares ONE Powerrail Wire

Real-machine TIA V21 import tests (2026-08, PLC指令语料 project) locked two hard rules that FlgNet v4-era habits miss. Rule 1: inside a single network, the UId namespace covers every defining element — Access/Part/Wire/Instance/OpenCon — all globally unique; a collision (e.g. a TON Instance sharing a UId with a Wire) is rejected at IMPORT time, not compile time, with 'There are at least two definitions for UIds. The incorrect unique ID is 37'. IdentCon/NameCon references are NOT definitions and do not count. Rule 2: a network may contain exactly ONE power line — parallel branches (OR) must share one Powerrail Wire (one Wire carrying multiple in-NameCon legs), never two Powerrail Wires; TIA rejects '在 LAD 中,程序段中只能包含一个电源线'. A hand-written or generated FlgNet network must allocate UIds from one per-network counter and fan every parallel leg off the single Powerrail Wire.

**Pitfall**: numbering UIds per element-kind (Part=1.., Wire=1..) so Part and Wire collide → import rejects the whole block with an ID error that does not say which element; or drawing each OR leg with its own Powerrail Wire → import rejects with the single-power-line error before compilation is even attempted.

*Source*: real-machine TIA V21 import + compile (LAD_设备三态监控.xml, V18-format document imported into V21, 0 errors / 0 warnings after repair)


## rm-b [architecture] LAD fb_call to a GLOBAL instance DB: the Instance element must carry Scope="GlobalVariable", or TIA reports 'Missing instance DB' for the caller network

Real-machine verification (TIA V21, 2026-08): a tia_lad fb_call plan whose instance is a standalone global instance DB (e.g. DB_MotorSealIn) must render the SimaticML Instance element with Scope="GlobalVariable" and the DB name as a direct Component child. Rendering it with Scope="LocalVariable" (the multi-instance form) imports cleanly but the caller network fails at compile with 'Missing instance DB' — a silent-ish failure that points at the caller, not at the Instance element. When authoring/generating the plan, pass the instance reference with explicit global scope (plan-level `instance: {name: "DB_x", scope: "GlobalVariable"}`); when repairing hand-written XML, edit the Instance element's Scope attribute to GlobalVariable and re-import.

**Pitfall**: copying a multi-instance fb_call template for a global-DB call — import passes, whole-PLC compile reports 'Missing instance DB' only for the network that calls, and the fix (Scope attribute) is in the XML the error does not name.

*Source*: real-machine TIA V21 import + whole-PLC compile (OB1_Main.xml Scope repair → 0 errors / 0 warnings, 'Number of updated calls ...: 1'); SW.PlcBlocks.Access_v4.xsd (V16 schema set), Instance_T requires Scope


## rm-c [datatypes] LAD timer networks: the timer instance's static member must be declared with the TON-matching type TON_TIME; IEC_TIMER is rejected by plan validation

Real-machine verification (TIA V21, 2026-08): in a tia_lad timer (TON) network the instance's static member must be declared `datatype: TON_TIME` — `IEC_TIMER` is rejected by the plan validator with 'the TON Part requires a matching static instance type'. The timer network input takes ONE operand only; a multi-contact AND enable must be computed in a preceding contact_coil network into a static Bool and fed as the input. PT is a TypedConstant `{constant_value: 'T#2S', datatype: 'Time'}`; the generated XML places the instance as `<Instance Scope="LocalVariable">` referencing the static member (correct for FB-internal multi-instance IEC timers) with Q wired to a coil Access.

**Pitfall**: declaring the static timer as IEC_TIMER "because that is the IEC name" — the validator deterministically refuses the plan; or feeding a multi-contact enable directly into the timer network's single input field, which the plan schema does not accept.

*Source*: real-machine TIA V21 import + whole-PLC compile (FB_SortStation, 13 LAD networks incl. TON T#3S via static TON_TIME, 0 errors / 0 warnings, all blocks isConsistent=True)


## rm-d [architecture] TIA V21 new S7-1200/1500 projects: the default main program is Main [OB123] (ProgramCycle) — OB1 exists as a second, never-executed ProgramCycle block

Real-machine verification (TIA V21, CPU 1214C V4.5, 2026-08): a freshly created S7-1200 project's default main program block is named Main, numbered 123, with SecondaryType=ProgramCycle — the classic OB1 is NOT the executed main any more. Importing LAD into OB1 compiles with 0 errors but the CPU never executes it; the empty shell Main [OB123] is the one that runs. Correct flow: generate the OB document with block_number=123 + SecondaryType=ProgramCycle, import it as Name=Main/Number=123 to REPLACE the shell (import overwrites by name), then delete the extra OB1. Before import, inspect the exported XML for Number/SecondaryType; after import, confirm placement via list_blocks and an exported network roster.

**Pitfall**: putting the program into OB1 on a V21 S7-1200 project — compiles clean, machine runs nothing; the debug session then chases "logic not executing" while the real main (Main [OB123]) stays empty.

*Source*: real-machine TIA V21 export readback (new-project Main.xml: <Name>Main</Name> <Number>123</Number> <SecondaryType>ProgramCycle</SecondaryType>); import overwrite + whole-PLC compile 0 errors / 0 warnings, exported network roster fingerprint match


## rm-e [generator-plan] LAD generator plan rules compile-proven end to end on V20 S7-1200: fb_call parameters need explicit direction, guarded OR needs branches>=2 or series contacts, OB1 is generatable via block_type=OB, and the import order is FB -> instance DB -> caller

Real-machine sessions (2026-08, TIA V20 S7-1200: Elevator_Control and TrafficLight projects) locked four plan-shape rules for tia_lad_generate_block_xml: (1) every fb_call parameter must carry an explicit direction (output parameters as direction=out), or plan validation rejects the plan; (2) a contact_coil network meant as a guarded OR / self-hold needs a leading branches[] group of at least two legs - a single leg is rejected and must be written as series contacts; (3) OB1 can be generated directly with block_type=OB, block_name=Main, block_number=1 - no hand-written XML needed, and tia_openness_import_block_xml overwrites the same-name Main (OB1) with ImportOptions.Override; (4) the dependency-ordered import sequence is callee FB -> create_instance_db -> caller OB1, each step triggering its own compile, ending with one whole-PLC compile as the acceptance verdict.

**Pitfall**: generating a caller OB with an fb_call that omits direction on output parameters -> plan validation rejects the whole plan (wasted generation round); writing a single-leg branches group for an OR coil -> rejected (rewrite as series contacts); assuming OB1 cannot be generated -> manual XML editing instead of block_type=OB; importing the caller before the callee DB exists -> compile error that reads like a missing instance.

*Source*: TIA V20 Elevator_Control session - FB_Elevator (58 networks) + Main (OB1) + DB_Elevator imported in that order, whole-station compile 0 errors / 0 warnings, export readback isConsistent=True; TrafficLight session - FB_TrafficLight + DB_TrafficLight + Main (OB1), whole-PLC compile errors: 0, warnings: 0


## rm-f [datatypes] Time-typed constant literals in generated LAD (timer PT pins, fb_call Time inputs) must render as Scope="TypedConstant" with only ConstantValue - LiteralConstant + ConstantType is rejected at import

Three independent real-machine sessions (2026-08, TIA V20: elevator T#5S plan generation, star-delta T#8S/T#500MS fb_call inputs, conveyor timer constants) hit the same shape rule: a SimaticML FlgNet <Access> binding a Time-typed literal (T#5S, T#8S, T#500MS) must be written as Scope="TypedConstant" carrying only <ConstantValue>T#...</ConstantValue>. The alternative Scope="LiteralConstant" + <ConstantType>Time</ConstantType> + <ConstantValue>T#...</ConstantValue> is a deterministic import rejection ('The value T#xxx cannot be set for the parameter' / local preflight flgnet_access_shape_invalid). Plain numeric literals (e.g. 100 for an Int) still use LiteralConstant + ConstantType. The generator now normalizes '#'-typed literals to TypedConstant in every operand position (fb_call inputs included) and the renderer emits the TypedConstant shape for them regardless of the plan's scope, so a Time-typed constant renders import-safe by construction; the import preflight still names the illegal shape when a hand-edited or foreign-exported document carries it.

**Pitfall**: hand-writing or post-editing an fb_call/timer network with a T# literal as LiteralConstant -> the import preflight rejects the block before the bridge (flgnet_access_shape_invalid); skirting the preflight still fails in TIA with the parameter-value error.

*Source*: star-delta session - OB1_Main.xml import preflight flagged flgnet_access_shape_invalid (lines with T#8S/T#500MS); after Scope="TypedConstant" rewrite the import succeeded and whole-PLC compile returned errors: 0, warnings: 0 (StarDeltaStarter/PLC_1, Main OB1, FB_StarDelta_Starter FB1, DB_StarDelta DB1, isConsistent=True); conveyor session - same rule re-confirmed compile_proven


## rm-g [simulation] Standard PLCSIM V20 behavior-assertion hygiene: run memory_reset between scenarios, or latched/retentive state from a previous scenario pollutes the next assertion

Real-machine behavior-assert sessions (TIA V20 standard S7-PLCSIM, s7-1500) showed that a standard-PLCSIM session persists the downloaded program and latch/DB state in its storageDirectory across stop/start and across downloads (a re-download that finds the program unchanged skips the memory reset entirely). Consecutive behavior-assertion scenarios therefore inherit the previous scenario's residual coils/latches and produce false failures that read like program defects. The proven cleanup between scenarios is tia_plcsim_advanced_storage with action=memory_reset (clears DB latches + power-cycle restart), then RUN again to get a clean initial state. Note the plcsim-advanced-tag channel can read/write the standard Runtime Manager session's symbolic tags, which is what makes cross-scenario pollution observable.

**Pitfall**: asserting scenario B right after scenario A without memory_reset -> A's residual call/latch bits flip B's conditions; the failing assert then looks like a program bug instead of test-state pollution. On V16/V17, though, memory_reset is NOT a cheap per-scenario step: it means a full re-download with DeleteAll (minutes per call) — T04 (2026-08-16) burned 16 downloads resetting between groups. Design the group sequence to reset through the program's own reset/clear inputs (a 清零/reset button or stimulus) inside ONE assert scenario, and re-download only when the downloaded program itself changed.

*Source*: V20 s7-1500 standard PLCSIM sessions - stop/start on the same storageDirectory did not clear state and a re-download skipped the reset ("program already up to date"); tia_plcsim_advanced_storage(memory_reset) power-cycle cleared the DB latches, after which RUN yielded the clean initial state and two scenarios asserted 12/12 PASS


## rm-h [simulation] PLCSIM Advanced route requires the project CPU article/firmware tuple to match the presented PLCSIM tuple; tia_plcsim_plan blocks mismatches with the verified alternative

For the TIA V20 s7-1500 route, PLCSIM Advanced V8 presents CPU1511 as article 6ES7 511-1AK01-0AB0, so a project CPU configured as 6ES7 511-1AK02-0AB0/V2.8 is rejected at download as an incompatible module (verified-download-rejection-order-number-mismatch). The same article at firmware V2.9 is verified downloadable on the V20 standard backend. Consequence: before simulating, pick the CPU whose article/firmware matches the presented simulation tuple (tia_plcsim_plan returns a blocked verdict with the mismatch and the verified alternatives), or change the device version in the TIA GUI - a CPU change to a verified tuple does not invalidate the program blocks.

**Pitfall**: choosing a CPU article/firmware that does not match the PLCSIM-presented tuple -> automated download is refused by TIA; the only manual workarounds are a GUI device-version edit or a different CPU.

*Source*: tia_plcsim_plan verdict blocked (PLCSIM Advanced V8 CPU1511 presents 6ES7 511-1AK01-0AB0; project CPU 6ES7 511-1AK02-0AB0/V2.8 rejected); verified working tuples on V20: 6ES7 511-1AK02-0AB0/V2.9 and 6ES7 511-1AK01-0AB0/V2.5


## rm-i [simulation] V20 standard S7-PLCSIM frontend: the writable input image covers only the configured onboard IO; AddressOutOfRange means stale instance or out-of-board address, NOT a route gap

Machine-verified (2026-08-16, V20 S7-1200 1214C): the frontend-VPLC write side only accepts area=input addresses inside the CPU's configured onboard image (1214C DI14/DQ10 = IB0/IB1, QB0/QB1). Writing outside it returns SIDECAR_VPLC_WRITE_REJECTED AddressOutOfRange; writing area=memory returns SIDECAR_VPLC_BARE_AREA_UNSUPPORTED. A leftover instance carrying an OLD download answers AddressOutOfRange for addresses the CURRENT project maps — that is stale-instance hygiene, not a route gap: reclaim leftovers (tia_plcsim_standard_reclaim_holders), register a FRESH instance, re-download, and the identical writes pass (12/12 assertions passed that way). Assertion recipe for this route: whole-BYTE input stimuli (write IB0 = integer, data_type BYTE) and Q-bit output expectations read via the vplc-grpc adapter; bit writes trigger a surrounding-byte read through the frontend SIM-table view that times out (~10 s per bit write vs ~0.5 s per byte write). Establish a base byte (IB0=0) first if bit writes are needed.

**Pitfall**: asserting on I/Q addresses outside the onboard image, or on a stale instance, and reading AddressOutOfRange as "this version cannot do behavior assertion" — the same project asserted 12/12 on a fresh instance with in-range addresses.

*Source*: V20 assertion runs — out-of-range IB2 write rejected AddressOutOfRange; M20.0 write rejected BARE_AREA_UNSUPPORTED; whole-byte IB0 stimuli passed 5/5 + 7/7 with real Q readbacks (incl. a T#5s timer observed at 3502 ms); bit writes measured ~11.5 s vs byte writes ~0.5 s (writeElapsedMs 494-524)


## rm-j [simulation] V20 standard S7-PLCSIM frontend RUN is UI automation: the SIMATIC S7-PLCSIM window must be restored and foregrounded, or run fails SIDECAR_CPU_NOT_RUNNABLE

Machine-verified (2026-08-16): tia_plcsim_standard_run drives the frontend's RUN control through window automation; with the S7PLCSIMV20 window occluded/minimized the call fails with SIDECAR_CPU_NOT_RUNNABLE ("did not become runnable within 15 seconds"), which misleadingly blames the download. Fix: ShowWindow(SW_RESTORE) + SetForegroundWindow on the SIMATIC S7-PLCSIM window, then retry — a successful TIA download alone does not make the instance runnable to the automation.

**Pitfall**: chasing a re-download when the real blocker is the occluded frontend window; the error text points at the CPU, not the window.

*Source*: run failed 3x with SIDECAR_CPU_NOT_RUNNABLE; after ShowWindow+SetForegroundWindow on the S7PLCSIMV20 main window, the same run call returned operatingState RUN


## rm-k [simulation] V21 SIM-table assertion recipe: whole-byte writes, non-zero "release" encodings, settle_ms>=500, observe Q not M, stop/start/re-download to recover Electron flakiness

Machine-verified (2026-08-16, V21 S7-1200 official SIM-table route): (1) write whole bytes (IBx, data_type BYTE, integer value) — bit writes need a surrounding-byte read that triggers SIDECAR_FRONTEND_MONITOR_UNAVAILABLE; (2) writing 0x00 right after a non-zero byte is frequently rejected SIDECAR_FRONTEND_MODIFY_NOT_APPLIED — encode "release" as a non-zero byte that sets an unrelated input bit instead of zeroing the byte; (3) give steps settle_ms>=500 to ride out the ~1.5 s post-write sampling race; (4) assert on Q outputs driven directly by the state under test, M-area monitoring is unreliable; (5) when consecutive MONITOR/MODIFY failures appear (Electron automation degradation), a controlled stop -> start -> re-download restores the route.

**Pitfall**: asserting a release as 0x00 and retrying it when it answers MODIFY_NOT_APPLIED — the write DID apply the surrounding non-zero bit pattern; use the non-zero release encoding.

*Source*: V21 6-step scenario 6/6 PASS with byte sequence 02/04/01/04/02/04; EStop-chain scenario 4/4 PASS; 13+ steps total PASS with real Q0.3/Q0.4/Q2.0 readbacks; repeated MODIFY_NOT_APPLIED on 0x00-after-non-zero writes, MONITOR_UNAVAILABLE on bit writes and M0.0 monitoring, recovered by stop/start/re-download


## rm-l [project-lifecycle] Opening a V20 project in Portal V21 requires open_project upgrade:true — it migrates into a separate copy and leaves the original untouched; ambiguous-portal needs project_match

Machine-verified (2026-08-16): opening a lower-version project in a newer Portal with a plain Open answers a same-version-only compatibility error; upgrade:true migrates it into an independent new project copy (FillingLine_V21/FillingLine_V21.ap21) and leaves the original V20 files untouched — the correct non-invasive posture for verifying old projects. When two V21 portal processes exist (a start shell plus the Openness-spawned one), V21 calls answer TIA_AMBIGUOUS_PORTAL_PROCESS until project_match=<opened project name> is passed.

**Pitfall**: re-opening the low-version project in place (destroys the original) or retrying without project_match (ambiguity error reads like a portal problem).

*Source*: V21 open of FillingLine.ap20 failed same-version-only; upgrade:true produced the migrated copy, original untouched; TIA_AMBIGUOUS_PORTAL_PROCESS fixed by project_match:FillingLine_V21; download + 13-step assertion completed 0 errors on the migrated copy


## rm-m [addressing] S7-300 digital module addresses ARE slot-based (a DO module in slot 4 starts at Q4.0) — unlike S7-1500, which allocates from byte 0

Machine-verified (2026-08-16, TIA V20 S7-300 CPU 315-2 PN/DP): on classic S7-300 the digital module I/O image addresses are allocated BY SLOT (a DO module in slot 4 exposes Q4.0.., a DI in slot 5 exposes I5.0..), NOT from byte 0 in module order as on S7-1500. Always read the real address from tia_openness_read_hardware_config before creating tags or planning sidecar stimuli — a Q0.0-based stimulus targets a byte the configured modules may not own, and the classic S7ProSim read then shows no reaction.

**Pitfall**: assuming S7-1500-style from-zero allocation on S7-300, writing process-image stimuli at Q0.0/I0.0 that never reach the program.

*Source*: S7-300 seal-in verification — read_hardware_config reported the DO module at slot 4 (Q4.0); the sidecar-direct stimulus (I0.x + scan_cycles) drove Q0.0 of the classic image and the read-back evidence matched the program's own I/Q wiring (Start I0.0 -> Q0.0 via the FC, with the module layout documented separately)


## rm-n [blocks] S7-300 classic projects name the main program "Main" [OB1]; overwriting it via import needs the same name AND the standard 20-byte Temp interface

Machine-verified (2026-08-16, TIA V20 S7-300): the default main program block in a classic S7-300 project is Main [OB1] (as on S7-1200), and replacing it by import requires a document with Name=Main and the standard-OB interface (>=20 bytes of Temp reserved — the LAD generator now pads this automatically unless an optimized family is explicitly targeted). Deleting the default Main first hits TIA_PROTECTED_BLOCK_DELETE_REQUIRES_FORCE (pass force=true only after the replacement import is ready).

**Pitfall**: deleting the default OB before the replacement compiles, or importing an OB without the 20-byte Temp reserve and reading the resulting "The interface of the standard OB is smaller than the minimum value of 20 bytes" as a format error instead of a classic-OB interface rule.

*Source*: SealIn_300_V20 rounds — generator-produced OB1 imported over Main [OB1]; the first import without the pad failed the 20-byte rule, the padded document imported and whole-PLC compiled 0 errors; delete of PLC_1/Blocks/Main answered TIA_PROTECTED_BLOCK_DELETE_REQUIRES_FORCE until force=true


## rm-o [simulation] Standard S7-PLCSIM download recipe and the readyForDownload-but-NotReachable triage

The end-to-end-verified connection for a traditional S7-1200/S7-1500 simulated in standard S7-PLCSIM is mode=PN/IE, pc_interface=PLCSIM, interface_number=1, with the device PN interface as target (target_interface="1 X1") — always take the exact values from tia_openness_list_online_targets instead of guessing. When the sidecar status reports powered=true + readyForDownload=true but TIA answers NotReachable / "连接到模块失败" (connect to module failed) on both download and go_online, that is a TRANSPORT-layer failure, not a parameter problem: do not rotate IPs, subnets, set_ip, or re-created projects, and do not repeat the same download parameters hoping for a different answer. Triage order (both real causes were found on this exact signature, 2026-08-16): (1) call tia_plcsim_standard_status with NO arguments — the one-call aggregate reports every version and family with activeCount; (2) confirm the instance is still alive and ready via the same status rows; (3) reclaim stale holders (reclaim_holders all=true) and stop leftover instances of other TIA versions; (4) check the "Siemens PLCSIM Virtual Ethernet Adapter" for a static/non-APIPA host address — a host address inside the simulated CPU subnet (e.g. 192.168.0.x next to the instance's 192.168.0.1) breaks the softbus bridging; reset it to DHCP/APIPA (admin, reversible); (5) if everything is fresh and it still fails, reboot — a machine persistent state that survived process kills and service restarts was cleared by reboot, and the first download afterwards succeeded.

**Pitfall**: treating a NotReachable transport failure as an addressing/configuration bug and burning many download/go_online retries with rotated parameters — the failure repeats identically because the instance was never reachable at the transport layer; also, restarting the S7DOS service alone does not clear the wedge, and does not count as a fix.

*Source*: V18/V19 standard-PLCSIM rounds (2026-08-16) — clean-environment failures with the historically-verified recipe while the same-day V16 WCF route downloaded fine; root causes found: adapter static 192.168.0.100/24 + reboot-cleared persistent state; after both fixes V18/V19 passed full seal-in assertions 3/3


## rm-p [simulation] V16 legacy WCF route: memory-reset download rule and the write-shape reality

Machine-verified (2026-08-16, TIA V16 + S7-1200 1214C, legacy WCF sidecar, full six-phase run): V16 Openness rejects the ResetModule pre-download step's NoAction selection as "unhandled" even though the bridge records the selection as handled — only DeleteAll proceeds, so the V16 PLCSIM download needs allow_plcsim_memory_reset (the tool now defaults it to true for a V16 PLCSIM-named interface). After RUN, the reliable stimulus shapes on this route are exactly two: symbolic SetTagValue (resolves against the downloaded program) and peripheral input bit write SetInputBit — and only bit 0 of the address-based write is trustworthy (bit>=1 reports AddressOutOfRange; the byte shape SetInput answers AddressOutOfRange even on bytes a configured DI module covers). A symbolic write into the INPUT image can be overwritten by the free-running CPU's input refresh (the peripheral SetInputBit lands in the peripheral area and reaches the program), so seal-in proofs should drive Start/Stop through SetInputBit I0.x or symbolic M-area tags, and read Q via read-output.

**Pitfall**: using byte-shaped input writes on V16/V17 (always AddressOutOfRange), trusting address-based bit>=1 results (error code says out-of-range while the write may have landed), or letting a symbolic input write race the input refresh and misreading a not-latched seal-in as a program bug.

*Source*: V16 WCF round S10 — download failed once on ResetModule NoAction then succeeded with the flag (PLC_1 started, DownloadResult Success); SetInputBit I0.0=1 → Q0.0=01, release → Q0.0 stayed 01, symbolic Stop=1 → Q0.0=00; symbolic Start write was refreshed away by the free-running CPU


## rm-u [simulation] V16/V17 stimulus recipe: M-area mirror tags driven by symbolic writes

Machine-verified (2026-08-16, T02 报警锁存, V16 + S7-1200 1214C): the fully reliable way to drive a V16/V17 standard S7-PLCSIM program is to give the program an M-area STIMULUS MIRROR and write those M tags symbolically. T02's model added an `MS_EN` enable flag plus `MS_ALARM0..7`/`MS_ACK` M tags in OB1: with MS_EN=1 the logic reads the M mirror instead of the real I, with MS_EN=0 it reads the real inputs — the verified logic is identical either way. Symbolic SetTagValue writes to M tags persist across the free-running scan (unlike I-area symbolic writes, which the input refresh overwrites), so 22 stimulus groups were driven and read back through area=output, all passing. The assertion channel now accepts symbolic M-tag writes on V16/V17 (plcsim-standard-area + tag in write items), so a whole verification table can ride ONE tia_plcsim_assert_behavior call there too.

**Pitfall**: on V16/V17 trying to drive real I directly (byte SetInput → AddressOutOfRange; bit writes → only bit 0 trustworthy; symbolic I writes → refreshed away) and concluding the program or route is broken — build the M mirror (or copy I→M) and write M tags instead.

*Source*: T02 campaign round (2026-08-16) — 22 groups all real-read pass via M-mirror symbolic writes; the same round the assertion channel's address-based path was rejected once for a symbolic name before the M-mirror approach landed


## rm-v [v18] V18 SCL must be pure ASCII; the V18 frontend free-runs (2s/4s timing IS assertable); no TOF for e-stop stop-delays

Machine-verified (2026-08-16, T07 输送带顺序, V18 + S7-1200 1214C V4.0): three V18 lessons. (1) `.scl` external sources must be pure ASCII — UTF-8 Chinese comments make TIA abort generation with 设定值BEGIN无效 at the line after the comment block; keep block/network comments ASCII. On V19 the same shape is worse when the file has no BOM: TIA silently DROPS the whole FB VAR_INPUT/VAR_OUTPUT/VAR interface and every local tag compiles as 'not defined' (the Main OB with VAR_TEMP only still compiled — OB and FB interface parsing differ), so ASCII comments AND a BOM are the safe shape. Also never reference Chinese-named PLC tags from inside an external source (a %I0.0-style absolute address is safe; a 启动-style symbol name mojibakes into 鍚姩 and fails not defined) — Chinese tag NAMES in the tag table itself are fine (T11 2026-08-16: 24 errors from Chinese comments in a VAR block, fixed by ASCII + absolute addresses). (2) On the V18 official-frontend VPLC route, input can only be WRITTEN (whole byte IB0), never read; assert on output QB0 only. (3) The V18 frontend DOES free-run and time advances: 44 assert steps including ~2s and ~4s sequence timing all read back PASS with expect_within_ms windows. A T05 probe once concluded "V18 does not free-run" after polling 4 s and seeing no change — that was a probe defect, not a route limit: keep the stimulus HELD (frontend input writes are not persistent forces), poll with expect_within_ms, and trust the window; do not conclude a timing route is dead from one short poll. V19 behaves like V18. V20 s7-1200 is DIFFERENT: the TON time base does NOT advance with the wall clock (T15 2026-08-16: 8/20/25 s windows never triggered a TON while combinational/latch transitions all verified, even after cold restart) — on V20 assert only the transitions your writes directly cause and confirm timer PT values statically; do not wait for timer outputs, and do not call the program broken over a timer that never fires. (4) Do not build stop-delay logic with TOF: its Q persists ~4 s after the input is forced low and re-energizes outputs after an e-stop reset; use a free-running TON + Time tRef baseline state machine.

**Pitfall**: adding Chinese comments to V18 SCL external sources (import aborts), reading the input area on the V18 frontend (SIDECAR_FRONTEND_SIM_VIEW_MISSING), concluding V18 cannot verify timing after one short poll, or using TOF for a stop delay that an e-stop must cut instantly.

*Source*: T07 campaign round (2026-08-16) — write_source failed with 设定值BEGIN无效 until comments went ASCII; 44/44 assertion steps PASS including the 2 s/4 s start and stop sequences; the TOF flaw was caught by assertions (belt 1 restarted after reset) and fixed with the TON state machine


## rm-q [online-transfer] A failed go_online can still leave the device ONLINE

TIA side effect, machine-verified: tia_openness_go_online can throw ("Changing to online mode failed") and still leave the device online. A download issued right after then fails with "The operation is not permitted in online mode" — including the pre-download compile inside the download call. After any failed go_online attempt, call tia_openness_go_offline once before retrying a download; do not retry the download while online.

**Pitfall**: reading the online-mode download error as a permission/sequence problem and retrying the download with different parameters while the device sits online — go_offline first is the fix.

*Source*: V18 standard-PLCSIM round (2026-08-16) — go_online failed, the following download failed with the compile-in-online-mode error, and the chain only recovered after an explicit go_offline


## rm-r [simulation] The standard PLCSIM Softbus address is not real Ethernet — ping and port scans prove nothing

The Softbus is Siemens' private transport: the simulated controller's IP (e.g. 192.168.0.1) does not answer ping, and port 102 does not listen on the host, even with a healthy powered instance — this is normal, not a fault. The "Siemens PLCSIM Virtual Ethernet Adapter" carries only an APIPA address and is not the Softbus either. Reachability evidence comes from tia_openness_list_online_targets / tia_openness_plcsim_status on the TIA side and the sidecar status on the simulator side; process-table and Get-NetTCPConnection diagnostics cannot establish or refute Softbus connectivity.

**Pitfall**: spending PowerShell ping/Test-NetConnection/port-probe calls on the Softbus IP and concluding the instance is dead (ping fails by design), or "fixing" the adapter IP — the instance owns its Softbus address and set_ip is refused with SIDECAR_FRONTEND_IP_MANAGED_BY_PLCSIM.

*Source*: V18 standard-PLCSIM round (2026-08-16) — four process/network PowerShell probes on a live instance added nothing beyond the sidecar status; the set_ip refusal message is the canonical statement of the address ownership


## rm-s [simulation] A download hands the instance the PROJECT's IP — one project per instance life

Machine-verified (2026-08-16, V18 frontend route): after a successful download, the simulated instance takes over the project CPU's IP (downloading `Nastro Trasportatore_V18` at 192.168.0.12 moved the instance from its dynamic 192.168.0.1 to 192.168.0.12). Downloading a DIFFERENT project whose CPU has another IP then fails at connect with the same 连接到模块失败 signature, because the configured instance no longer answers at the new project's address. Switching projects therefore means creating a fresh instance (stop + start = unconfigured card at the dynamic address) before the next download — or aligning the project CPU IP to the instance's current IP. The first download to an UNCONFIGURED instance works regardless of the project IP; the rule bites only when re-downloading to an already-configured instance.

**Pitfall**: closing project A, opening project B, and downloading straight into the same instance — the connect failure repeats identically and looks like the NotReachable transport bug, when the actual cause is the stale project IP on the instance.

*Source*: V18 verification (2026-08-16) — Nastro (192.168.0.12) downloaded fine; the next download of StartStop_SealIn (192.168.0.1) into the same instance failed with 连接到模块 PLC_1 失败; a fresh instance fixed it and the seal-in assertions then passed 3/3


## rm-t [security] New S7-1200 (V4.x) security defaults break device hardware compile — disable both before download

Machine-verified (2026-08-16, V21 + standard S7-PLCSIM): a freshly created S7-1200 (6ES7 214-1AG40-0XB0, firmware V4.7) project compiles clean at the PLC-software level but FAILS at the device (hardware) compile level with two configuration errors: (1) `confidentialConfigurationProtection=WithoutPassword` → "Password for confidential PLC configuration data is not configured" plus a certificate-configuration error, and (2) `accessControlConfiguration=EnabledWithAccessControl` → "At least one user must have runtime right Full access". This CPU does not expose the S7-1500 PlcAccessLevelProvider, so no access_level fix exists — the S7-1500-style "grant FullAccess" path does not apply. The fix is `tia_openness_configure_plc_security` with `confidential_protection=disabled` (config value becomes None) AND `access_control_configuration=Disabled`; device compile then reports 0 errors and the download to standard S7-PLCSIM succeeds.

**Pitfall**: seeing a clean software compile and treating the project as ready — the hardware-level security defaults are the actual download blocker; or trying the S7-1500 access-level route on an S7-1200, which loops forever on errors it cannot fix.

*Source*: S11 natural-task validation round (2026-08-16) — device compile reported both errors; the two configure_plc_security calls cleared them in order (WithoutPassword→None, then access control Disabled) and the seal-in + overload-alarm download/RUN/assertions all passed; the model's runtime experience entry (e1) was built in here and the store cleared.




