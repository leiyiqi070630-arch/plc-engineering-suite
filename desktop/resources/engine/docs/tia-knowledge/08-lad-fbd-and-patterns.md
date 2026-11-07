# 08 · LAD/FBD Networks, Block Authoring, and Control Patterns

Sources: **Programming Guidelines** (Entry 90885040) and **Programming Styleguide** (Entry 109478084) — two distinct official documents that share the internal document number 81318674 (umbrella document 81318674 = "Programming Guidelines and Programming Styleguide for S7-1200/1500 and WinCC"). Styleguide latest is V2.1.0; the V1.2/V2.0 PDFs were read directly for this document. LAD fundamentals come from the classic S7-300/400 LAD manual `KOP_e.pdf` (semantics identical to S7-1200/1500).

## Building LAD networks

- A rung sits between the two power rails. A normally-open contact `--| |--` **conducts** (RLO=1) when its bit = 1; a normally-closed contact `--| / |--` conducts when the bit = 0.
- **Series = AND, parallel = OR**; the combined result is the **RLO** (Result of Logic Operation), where 1 = power flow / active.
- Right-hand coil `--( )--`: sets when power flows (RLO=1), resets otherwise; `--( S )` / `--( R )` execute set/reset only when RLO=1.

## EN/ENO

Box instructions carry `EN` (enable input, executes only when =1) and `ENO` (enable output, =1 means executed without error); ENO normally follows EN but goes to 0 on an error (e.g. overflow) even when EN=1, and can be cascaded. Performance: for **LAD/FBD, disable the block's "generate ENO"** to avoid the runtime check.

## Block authoring (OB/FB/FC)

- **OB** is the interface between the OS and the user program; the default cyclic OB `Main [OB1]` is called once per cycle by the OS; OBs call FBs/FCs.
- **FC** has no cyclic memory: parameter values are not retained across calls and must be supplied in full each time; it can have multiple outputs plus a return value (in SCL, `<Operand> := <FC_name>(parameter list)` is reused directly).
- **FB** has cyclic memory (instance DB); Static data holds its value across cycles; each call is an "instance", and the instance-DB structure is defined by the FB and can only be changed in the FB.
- FB interface sections: `Input/Output/InOut/Static` (persistent in the instance DB), and `Temp` (L stack, volatile, valid only in the current cycle, **must be initialized before being read each cycle**).
- **Multi-instance**: a called FB stores its data in the calling FB's instance DB; Siemens recommends it to reduce the number of instance DBs and to embed local functions such as timers, counters, and edge detection.

## Key official Styleguide rules

- **Naming**:
  - TIA objects (blocks/libraries/TOs/tag tables/watch & force tables/traces) use **PascalCase** (NF005).
  - Code elements (variables/PLC data types/parameters/PLC tags) use **camelCase** (NF006).
  - Prefixes (NF007): formal parameters have **no prefix**; temp variables `temp`, static `stat`; single instance `Inst`, multi-/parameter instance `inst`; PLC data types `type`.
  - Constants (NF008): **all upper case with underscores**, e.g. `MAX_VELOCITY`.
- **Language choice**: **prefer SCL** (best readability, no performance penalty); use **LAD/FBD for interconnecting blocks (e.g. in an OB) or blocks dominated by binary logic** (easier on-site diagnostics); use **GRAPH for sequences**.
- **CASE must include ELSE** (raise a runtime error); prefer CASE over multiple ELSIF.
- **Encapsulation**: block-to-block data only through the interface (Input/Output/InOut); inside a block use only local variables, and **do not** directly access global DBs / tag tables / another block's Static (so the block stays reusable as a library element).
- **Prefer InOut for structured variables (ARRAY/STRING/UDT)**: when the optimization settings match, InOut passes a pointer reference (no copy), saving runtime and load memory.
- **Do not use bit memory M (flags); use a global DB instead** (optimized global DBs are stronger; the M area size differs per CPU).
- **TIA settings**: editing/reference language English (US); Mnemonic = International; indentation **2 spaces** (no Tab); line length ≤ ~80 characters; identifiers ≤ ~24 characters; **use only `//` comments**.
- **PLCopen asynchronous FB pattern**: `execute` starts on a rising edge (parameters latched at start) and needs `busy`+`done`; `enable` is level-controlled and needs at least `valid`; SIMATIC uses a `status` (WORD) output instead of PLCopen's `errorID`.

Styleguide example, verbatim:
```scl
// CASE must include ELSE
CASE #statSelect OF
   CMD_INIT:  ;  CMD_READ:  ;  CMD_WRITE: ;
ELSE
   ;   // generate error message
END_CASE;
```

## Standard control patterns

> ⚠️ The patterns below are **general PLC engineering practice, not naming rules from the Siemens Styleguide/Guidelines** (the guidelines give only the low-level instructions plus the single official recommendation "use GRAPH for sequences"). The low-level instructions are official; the way they are combined is engineering practice.

**Start/stop seal-in** — the Start contact in parallel with the motor's own output contact, then in series with a normally-closed Stop to drive the coil:
```
( Start --| |--  parallel  Motor --| |-- )  --series--  Stop --| / |--  ---( Motor )
```
Equivalent using SR (reset-dominant, better for a safe stop): `S := Start; R1 := Stop;` (SR is reset-dominant, so Stop wins).

**Edge one-shot** (using the official R_TRIG):
```scl
#instStartEdge(CLK := #startButton);
IF #instStartEdge.Q THEN ; END_IF;   // true only for the one cycle of the rising edge
```

**Debounce** (using the official TON):
```scl
#instDebounce(IN := #rawInput, PT := T#20MS);
#cleanInput := #instDebounce.Q;       // rawInput must stay stable for PT before it is accepted
```

**Step sequencer / state machine** (GRAPH is the official recommendation; SCL CASE is the common idiom):
```scl
CASE #statStep OF
   0:  IF #start THEN #statStep := 10; END_IF;            // idle
   10: #instMove(execute := TRUE);                        // moving
       IF #instMove.done THEN #statStep := 20; END_IF;
   20: ;                                                   // done
ELSE
   ;   // illegal step -> raise error
END_CASE;
```

## Sources

- Programming Guidelines 90885040, Styleguide 109478084 (`support.industry.siemens.com/cs/document/{id}/...`; PDFs at `cache.industry.siemens.com/dl/files/.../81318674_Programming_{Styleguide|guideline}_...pdf`)
- Classic LAD manual `KOP_e.pdf`: `cache.industry.siemens.com/dl/files/395/18654395/att_33349/v1/KOP_e.pdf`
