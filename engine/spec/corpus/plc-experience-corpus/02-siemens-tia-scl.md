# Siemens TIA SCL

> Applies to: vendor=siemens integration=tia_openness; SCL structured-text implementation details (STAT vs TEMP, R_TRIG, CASE+ELSE, integer-division truncation, strong typing, REGION, symbolic addressing, LREAL)
> 35 items, ordered by occurrence count (occ/30) from highest to lowest.


## occ30 [timers] IEC timers (TON/TOF/TP) instances must be declared in an FB STATIC area or a standalone DB; never in TEMP

TON/TOF/TP are IEC standard FBs that hold internal state (ET/Q/IN, etc.) and must persist across scan cycles. In an SCL FB, declare the instance in the STAT area (e.g. myTimer : TON); never place it in the TEMP area — TEMP is reset every scan cycle, so the timer can never finish timing. Call form: myTimer(IN:=condition, PT:=T#5S); then read myTimer.Q and myTimer.ET. When used in an FC, the instance must be passed in as an IN_OUT parameter or held in the STAT area of a calling FB. Each independent timing element needs its own instance; sharing one instance makes the timers overwrite each other. S7-1200/1500 have dropped the legacy S5TIME timers; all use IEC timers.

**Pitfall**: Placing a TON in the TEMP area is the most common SCL beginner mistake: the timer's Q never becomes TRUE, ET stays 0, and the TIA compiler reports no error — the fault only shows up as abnormal runtime behavior.

*Source*: TIA Portal V16/V17 online help: IEC Timer TON/TOF/TP; Siemens FAQ ID 109478914/109741041/109478798; SIMATIC S7-1500 system manual 6ES7 511-1AK02-0AB0 IEC timer chapter; TIA Portal SCL Programming Manual A5E03790552


## occ29 [edges] Rising/falling edge detection must use an R_TRIG/F_TRIG instance or a STATIC BOOL helper bit; never in TEMP

SCL has no LAD P/N contact syntax; edge detection has two standard approaches: (1) instantiate R_TRIG/F_TRIG in the FB STAT area, call form myRTrig(CLK:=signal); IF myRTrig.Q THEN ... END_IF; (2) declare a helper bit xLast:BOOL in the STAT area and write the difference manually: rising := signal AND NOT xLast; xLast := signal. In both approaches the helper storage must be in the STATIC area to persist across scans. In an FC the instance or helper bit must be passed in as an IN_OUT parameter. Each signal that needs edge detection needs its own instance; sharing one R_TRIG instance makes the edge signals interfere with each other.

**Pitfall**: Declaring the R_TRIG instance in the TEMP area loses the CLK history every scan cycle, producing a rising edge on every frame (Q stays TRUE) — level detection instead of edge detection. In the manual-difference version, forgetting xLast := signal makes rising always TRUE.

*Source*: TIA Portal V16 online help: R_TRIG/F_TRIG system function blocks; TIA Portal SCL Programming Manual A5E03790552 §edge detection; Siemens FAQ #109479139; IEC 61131-3 standard library R_TRIG/F_TRIG


## occ28 [scan_cycle] FB STATIC variables persist across scan cycles; TEMP variables are not guaranteed initialized on each call and cannot be used across cycles

An SCL FB's VAR(Static) area is stored in the instance DB and holds its value across scan cycles; VAR_TEMP is uninitialized stack memory on each OB call, with unpredictable contents (possibly leftover random values). An FC has no Static area — all locals are TEMP. Rule: state-machine step numbers, timer instances, counters, integrators, last-sample values, and any data that must persist across cycles all go in STATIC; only intermediate results of the current call go in TEMP. This is the biggest difference between SCL and high-level-language local-variable semantics, and the most common trap for beginners migrating from C/Python.

**Pitfall**: Storing an accumulator, counter, or edge-detection helper bit in a TEMP variable resets it every scan, so the logic can never accumulate state; it looks correct right after power-up (happens to be 0), then the state jumps after several cycles — very hard to reproduce.

*Source*: TIA Portal V16 SCL Programming Manual Chapter: Program blocks — Variable declarations; IEC 61131-3:2013 §2.4.3 TEMP variable spec; SIMATIC S7-1500 SCL Programming Manual A5E03790552 variable-type chapter; SIMATIC S7 System Description A5E00706985


## occ27 [state_machine] Using a CASE statement for a state machine is the preferred SCL structure; use INT or ENUM for the state variable and always add an ELSE fallback

SCL's CASE statVar OF ... END_CASE fits sequential state machines naturally: each branch is a step, the transition condition goes at the end of the branch, and the logic is centralized and readable. Compared with a nested IF-ELSIF chain, CASE's readability advantage is significant once there are more than 5 steps. The state variable must be in the FB STATIC area to persist across scans. TIA V14/V15+ supports user-defined ENUM types, so symbolic names like STATE_IDLE/STATE_RUN can replace bare INT magic numbers. Each CASE branch should modify the state variable in only one place. Always add an ELSE branch to handle illegal state values and force a return to a safe state or trigger an alarm, preventing the state machine from locking up after power-up or a disturbance.

**Pitfall**: Omitting the ELSE branch silently skips illegal state values, so the device locks up with no alarm and is very hard to diagnose; assigning the new state at the end of a CASE branch and then continuing to run the rest of that branch causes actions to be jumbled within the same scan.

*Source*: distilled engineering judgment; TIA Portal V15/V16 SCL Programming Manual CASE-statement chapter; TIA V15 new-feature enum type; 工控人家园 SCL sequential-control discussion; IEC 61131-3 ST state-machine best practices; STEP 7 SCL for S7-300/400 A5E00324650 §4


## occ25 [datatypes] Prefer LREAL over REAL for intermediate calculations to avoid 32-bit single-precision accumulation error

The REAL type on S7-1200/1500 is 32-bit IEEE 754 single precision, about 7 significant decimal digits. In PID integration, flow totalization, multi-stage scaling, and similar cases, continuous multiply/divide accumulation error can significantly exceed the engineering precision budget. Intermediate variables should be declared LREAL (64-bit double precision), converting back down to REAL with an explicit LREAL_TO_REAL() only at HMI outputs / analog interfaces. S7-1500 supports LREAL in native hardware arithmetic; S7-1200 also supports it but with slightly lower performance. Mixed arithmetic requires explicit conversion — do not rely on implicit promotion; assigning an LREAL to a REAL variable silently truncates without warning. Rule of thumb: use LREAL for PID integration, flow integration, and scaling chains deeper than 3 stages; REAL is enough for HMI display only or simple comparisons.

**Pitfall**: Long-running integration in REAL accumulates error that exceeds tolerance after a few hours without triggering any error; mixing REAL/LREAL and assigning to a REAL variable implicitly truncates, making the cause of a sudden value change hard to locate during debugging.

*Source*: distilled engineering judgment; Siemens TIA Portal SCL Programming Manual (A5E03790544/A5E03790552) §data types; 工控人家园 SCL precision discussion; Siemens S7-1500 SCL Programming Manual (6ES7810-4CA10-8BW0) Sec.6 Data Types


## occ24 [scan_cycle] SCL FOR/WHILE loops execute to completion synchronously within a single scan cycle; never use a loop to wait for an external signal or process an oversized array

SCL's FOR/WHILE/REPEAT run to completion synchronously within one OB call; they do not span scan cycles. If the iteration count is too high (e.g. iterating thousands of elements) or the loop condition depends on external I/O, it directly lengthens the scan cycle and trips the watchdog (150 ms default on S7-1200/1500), causing a CPU STOP. Correct approaches: (1) chunk bulk data processing — handle a fixed number of items per scan, saving the progress index in a STATIC variable; (2) wait for external signals via a state machine, advancing one step per scan cycle. A FOR loop over an array is usually safe, but estimate the scan time for the maximum element count.

**Pitfall**: Assuming WHILE TRUE can serve as a background task instantly stops the CPU on the watchdog; a FOR loop over 1000+ elements without batching trips OB80 CPU STOP on first power-up, mistaken for a hardware fault.

*Source*: Siemens TIA Portal S7-1200/1500 system manual §program execution model/Watchdog; S7-1200 system manual 6ES7212-1AE40-0XB0 §Watchdog; TIA Portal SCL Programming Guide V16 §9 Execution Model; Siemens FAQ ID 109758536


## occ22 [datatypes] INT/DINT integer division truncates automatically; mixed-type arithmetic requires explicit conversion

In SCL, dividing two INT/DINT still yields an integer, with the fractional part truncated (toward zero); it is not implicitly promoted to REAL. For example 5/2=2, 7/2=3. For a floating-point result, convert explicitly: INT_TO_REAL(a) / INT_TO_REAL(b), or write at least one operand as a REAL literal. Watch multiplication too: INT × INT stays INT and overflows beyond 32767. The LINT (64-bit integer) on S7-1200/1500 is unsupported on S7-1200 CPU firmware < V4.1.

**Pitfall**: Writing ratio := count / total with both INT gives a constant 0 when count < total, with no compile warning — only exposed at runtime; analog scaling raw/27648 truncates by integer division so the low end of the range has zero resolution.

*Source*: TIA Portal V16 SCL Manual A5E03790550 §4.3 arithmetic operations; IEC 61131-3:2013 §6.6.2 arithmetic operations; S7-1200 system manual A5E02486682 §data types


## occ20 [addressing] Optimized DBs (Optimized Block Access) forbid absolute-address access; only symbolic addressing works

S7-1500 creates optimized-access DBs by default; the compiler arranges variable memory layout automatically for performance, so variables have no fixed byte offset. Access is only by symbolic name (myDB.myVar); absolute addresses like DBx.DBWy or P#DB1.DBX0.0 are not allowed — writing an absolute address on an optimized DB causes a compile error or runtime address misalignment. When byte-offset access is required (e.g. Modbus/TCP communication mapping, interop with S7-300, AT overlay addressing), you must disable optimized access in the DB properties (uncheck Optimized block access). S7-1200 allows both modes but mixing them is not recommended.

**Pitfall**: Keeping DB1.DBW4 absolute-address style when migrating from an S7-300 project fails to compile under an S7-1500 optimized DB; or forgetting to re-download after turning optimization off, causing runtime address misalignment.

*Source*: TIA Portal V16 help: Optimized data blocks; SIMATIC S7-1500 system manual A5E03461182-AD §optimized block access; Siemens Entry ID 109478459; 6ES7 315-2EH14-0AB0 migration guide


## occ19 [architecture] FB over FC: stateful functions must use FB+instance DB; pure computation uses FC

In SCL an FB owns an instance DB, and STATIC-area variables persist across scan cycles — suited to timers, counters, state machines, edge detection, PID, and other functions needing memory. An FC has no STATIC area; all locals are TEMP and cannot persist across scans, suited to pure math/type conversion/stateless engineering-value scaling. Design principle: any logic that needs to "remember the last value" uses an FB; writing stateful logic as an FC usually forces the state to be attached to the caller's DB, bloating the interface and breaking encapsulation.

**Pitfall**: Saving the last sample value or step number in an FC's TEMP area is reinitialized to 0 on each call, so state/edge logic fails completely with no compile error.

*Source*: distilled engineering judgment; TIA Portal structured-programming guide A5E03461664; STEP 7 SCL SIMATIC S7 SCL V4.0 Chapter 4 block types; Siemens TIA Portal Programming Guideline V1.9 §FB vs FC selection


## occ18 [analog_scaling] Analog scaling: prefer the NORM_X + SCALE_X pair; a hand-written linear formula is legal if you convert to REAL first

TIA provides NORM_X (normalize a raw integer to a 0.0–1.0 REAL) and SCALE_X (map the normalized value to an engineering range), used as a pair. SCL call example: normVal := NORM_X(MIN:=0, VALUE:=rawAI, MAX:=27648); engVal := SCALE_X(MIN:=0.0, VALUE:=normVal, MAX:=100.0). 27648 is Siemens' standard unipolar analog full-scale value; bipolar is -27648 to +27648. The standard instructions have built-in boundary clamping and parameter-type checking, whereas a hand-written linear formula easily errs from integer-division truncation, range confusion, or swapped parameters. Engineering and raw ranges should be read from DB parameters, not hard-coded. S7-1200 needs firmware V4.1 or later; S7-1500 supports it on all versions. Wrap it as a standalone FC (parameters: raw value and range endpoints) for reuse and unit testing.

**Not a hard rule** (E2E R007, TIA V17 real machine): a hand-written scaling that does `INT_TO_REAL(raw)` BEFORE any division, then `eng := (r - min_raw) * (span_eng / span_raw) + min_eng` with an explicit over/under-range test, compiled 0 errors and is a legitimate engineering choice — useful when the block also needs channel diagnostics, filtering and a broken-wire value in the same pass. What is NOT legal is dividing integers directly (truncates to 0 at the low end) or using 32767 as full scale.

**Pitfall**: NORM_X/SCALE_X MIN/MAX parameter types must match the input (INT input with INT limits); a hand-written formula that forgets INT_TO_REAL first truncates by integer division so the low end of the range is constant 0; writing full scale as 32767 instead of 27648 causes about 16% scaling error at the top of the range.

*Source*: TIA Portal STEP 7 V16/V17 online help NORM_X/SCALE_X instruction description; Siemens Industry Online Support entry 68339604; S7-1200/1500 analog-module manual


## occ17 [datatypes] SCL is strongly typed; cross-type assignment across REAL/DINT/WORD etc. requires explicit conversion, and implicit conversion silently truncates

In SCL, wide-to-narrow assignment (e.g. LREAL→REAL, DINT→INT) does not error but silently truncates. WORD and INT have the same underlying bit pattern but incompatible types, so direct assignment is a compile error. Bit operations (AND/OR/XOR/SHL/SHR) apply only to unsigned word types (BYTE/WORD/DWORD/LWORD), not directly to INT. A BOOL variable must be assigned TRUE/FALSE, not integer 1/0. Any cross-type assignment should use the corresponding conversion function: REAL_TO_DINT, INT_TO_REAL, WORD_TO_INT, LREAL_TO_REAL, etc. The best time to unify data width is at variable declaration.

**Pitfall**: REAL_TO_INT truncates the fraction rather than rounding; to round, apply ROUND first; using an INT variable in an AND operation gives a type-incompatibility compile error whose cause beginners don't recognize.

*Source*: Siemens TIA Portal SCL Programming Manual A5E03790550 §data types and conversion; STEP 7 SCL Programming Manual 6ES7810-4CA10-8BW0 type-conversion chapter; IEC 61131-3:2013 §6.6


## occ16 [scan_cycle] SCL must not replace timing logic with a busy-wait loop inside an FC/FB; cross-scan waiting must be implemented with a state machine

SCL syntax supports WHILE/FOR/REPEAT loops, but the PLC watchdog (150 ms default) triggers STOP when a single scan overruns. Using a loop to wait for a sensor change or delay inside an FC/FB is a classic error — external inputs are not updated within the same cycle, so the loop never exits. Correct approach: split the wait logic into a state machine (enum/INT step number + CASE statement), advancing one state per scan cycle, timing across cycles with an IEC timer. An SCL block runs from top to bottom on each call; IF/CASE branches and FOR loops all complete within the same millisecond — there is no "continue on the next scan" semantics.

**Pitfall**: Using a FOR loop to poll an I/O bit for a signal — the CPU watchdog times out and immediately enters STOP mode; writing WHILE NOT input_ready DO; END_WHILE to wait for an external signal causes an OB1 timeout stop.

*Source*: S7-1200 system manual 6ES7212-1AE40-0XB0 §Watchdog time; TIA Portal SCL Programming Guide V16 §9 Execution Model; Siemens FAQ ID 109758536; distilled engineering judgment


## occ15 [maintainability] Use the VAR_CONSTANT/CONST area or named enums instead of magic numbers to centralize process parameters

SCL supports declaring symbolic constants in a block's VAR_CONSTANT area or a CONST block (MAX_SPEED : INT := 1500), available in FB/FC/OB from TIA V13 SP1 onward with no runtime overhead. TIA V14+ supports user-defined enum types (UDT ENUM); naming state-machine steps, fault codes, etc. with enum values makes CASE branches self-documenting. Process parameters, range limits, and alarm thresholds should be defined centrally in a shared DB or CONST area, so changes are made in one place. Pairing a state machine with an enum lets the HMI monitoring screen also show symbolic names.

**Pitfall**: TIA before V15 does not support ENUM, so using it causes a compile error; magic numbers scattered across 20 places cause parameter-inconsistency faults when one is missed during a process change, costing days of debugging.

*Source*: TIA Portal V15.1 new-feature note: PLC Enum data type; TIA Portal V16 SCL Programming Manual §VAR_CONSTANT; distilled engineering judgment; 工控人家园 SCL programming discussion


## occ14 [maintainability] Partition large FBs with REGION/END_REGION folding, paired with a consistent commenting strategy

TIA Portal SCL supports REGION 'region name' ... END_REGION syntax to divide a long FB by function (initialization/input handling/state machine/output mapping/fault diagnostics), foldable in the editor. REGION partitioning should be mandatory for FBs over 100 lines. Commenting strategy: write a block comment (* ... *) at the top of each REGION stating its purpose and modification date; critical algorithms must comment physical units and range assumptions; line comments // are for single-line explanation. REGION does not affect execution order or performance. Note: SCL block comments cannot nest — nested (* *) causes a syntax error.

**Pitfall**: A 500-line SCL FB with no REGION partitioning causes frequent merge conflicts in team work and very low fault-diagnosis efficiency; using nested (* *) comments makes TIA report a syntax error.

*Source*: TIA Portal SCL Programming Manual A5E03790552 §REGION statement; distilled engineering judgment; 工控人家园 SCL coding-standard discussion


## occ13 [addressing] Symbolic addressing throughout; no absolute addresses (%I/%Q/%M/DBx.DBWy) in SCL code

All I/O points are given symbolic names in the PLC tag table, and SCL code references only symbols (e.g. xMotorRun rather than %Q0.0). Global DBs are accessed by dot syntax: myDB.myVar. Inside an FB, its own instance data is accessed with the # prefix: #myState. When hardware addresses change, only the PLC tag table changes and the SCL code needs zero modification. S7-1500 supports auto-generated hardware system constants (Local~DI_1.Channel_0) as a more readable alternative. The AT keyword can overlay a WORD/DWORD variable with an ARRAY OF BOOL for bit operations (S7-1200 low firmware versions have AT restrictions).

**Pitfall**: Absolute addresses scattered through the code are easy to miss in a find-and-replace after a hardware revision; using the # prefix in an FC is a compile error; misusing a #-prefixed variable in a global FC likewise errors.

*Source*: distilled engineering judgment; TIA Portal project-engineering best-practices document SCE_EN-032; Siemens TIA Best Practices whitepaper Entry ID 68011802; TIA Portal SCL Programming Manual §variable addressing


## occ12 [maintainability] Strictly partition FB interface parameters into VAR_INPUT/VAR_OUTPUT/VAR_IN_OUT to avoid direct coupling to global DBs

SCL FB interface design principle: externally visible signals go through VAR_INPUT (read-only, can pass constants)/VAR_OUTPUT (write-only)/VAR_IN_OUT (bidirectional pass-by-reference, must pass a variable); cross-scan internal state goes in VAR (instance DB); temporary computation goes in VAR_TEMP. Passing a large array by VAR_INPUT copies by value — use VAR_IN_OUT pass-by-reference instead (S7-1500 also supports VARIANT/REF_TO). An FB must not access a global DB directly — that couples the FB tightly to a specific DB and prevents multi-instance reuse. S7-1500 supports multi-instance: declare child FB instances in the parent FB's STATIC area, sharing one DB to reduce fragmentation.

**Pitfall**: Making every parameter VAR_IN_OUT prevents passing a constant literal at the call site; passing a large array by VAR_INPUT causes stack overflow or scan-cycle jitter, discovered only on site.

*Source*: distilled engineering judgment; Siemens TIA Portal Programming Styleguide Entry ID 81318674; TIA Portal SCL Programming Manual §FB interface design; S7-1200 system manual memory-and-call chapter


## occ11 [interlock_safety] Aggregate safety interlock conditions into a single BOOL variable and AND it into the output uniformly; do not scatter them across IF branches

Correct pattern: first aggregate the interlock xPermit := xEStopOK AND xPressureOK AND NOT xFault AND ...; then apply it uniformly at the output yOutput := xCommand AND xPermit. High-priority safety conditions (E-stop/over-temperature/over-pressure) should force the output at the end of the code with an unconditional IF, ensuring they are not bypassed by an intermediate RETURN. Name safety conditions with positive logic (xInterlockOK=TRUE means run permitted) to avoid double-negation logic errors. For critical interlocks, add a separate intermediate BOOL variable for online monitoring and FMEA traceability. An S7-1500 Safety project must use F-FBs and cannot rely on standard SCL logic alone.

**Pitfall**: Scattering interlocks across many IF branches creates a safety hole if one is missed; using negative logic xEmergency=FALSE to mean run-permitted keeps the variable FALSE on a wire break, disabling the E-stop; an early RETURN in some ELSIF branch skips the E-stop force-clear code at the end.

*Source*: distilled engineering judgment; Siemens SIMATIC Safety Programming Guidelines Entry ID 54110126; IEC 62061:2021 safety-function design principles; IEC 62443/EN ISO 13849 engineering practice


## occ11 [datatypes] Encapsulate a process object with a UDT; never flatten all signals loosely into a global DB

Encapsulate all signals and state of one process unit (pump, valve, motor) into a UDT, then pass it via an FB IN_OUT interface or instantiate as ARRAY OF UDT. Benefits: HMI mapping, alarm definition, and code reuse in one; swapping equipment only changes the IN_OUT reference with zero logic change; ARRAY OF UDT manages multiple devices in bulk. Beginners tend to scatter all signals loosely into a global DB, making code non-reusable, requiring large amounts of manual HMI-address maintenance, and making later refactoring extremely costly.

**Pitfall**: After modifying a UDT you must "compile all" so every FB/DB referencing the UDT is synchronized; otherwise the running version and edited version have inconsistent structure and data is silently misaligned.

*Source*: distilled engineering judgment; Siemens TIA Portal programming guide emphasizes the UDT+FB combination pattern; Siemens TIA Best Practices whitepaper Entry ID 68011802


## occ10 [pitfall] SCL uses := for assignment, = for comparison, <> for not-equal; confusing them is a common beginner compile/logic error

SCL follows Pascal syntax: assignment is :=, equality comparison is =, not-equal is <>. This is completely opposite to C/Python (C: assignment =, comparison ==, not-equal !=). Beginners easily write value = 100 (actually a comparison, result discarded, variable unchanged) or IF a := b THEN (compile error). The TIA compiler gives warnings for some of these but still compiles, so the logic fails silently.

**Pitfall**: Writing IF myVar = 5 THEN myVar = myVar + 1 END_IF — the second line is a comparison, not an assignment, so the variable never changes, and TIA may only warn rather than error.

*Source*: IEC 61131-3:2013 §6.6.2; TIA Portal SCL Programming Manual §Operators; Siemens SCL for SIMATIC S7 Manual syntax overview


## occ10 [pitfall] SCL division must explicitly check for a nonzero denominator; integer divide-by-zero triggers CPU STOP, floating-point divide-by-zero produces INF/NaN contamination

In S7-1200/1500 SCL, integer (INT/DINT) division by zero triggers a runtime error that by default sends the CPU into STOP mode. Floating-point division by zero produces +/-INF or NaN, silently contaminating subsequent calculations. Engineering standard: check the denominator is nonzero before any division. Recommended form: result := IF denom <> 0 THEN num / denom ELSE 0 END_IF; or wrap it in a protective function. S7-1500 provides IS_NAN/IS_INF functions to filter special floating-point values at the analog input.

**Pitfall**: In PID parameters, process-ratio calculations, etc. where the denominator comes from HMI input, an operator mistakenly entering 0 causes a live CPU STOP — one of the most common SCL-induced downtime causes on the production floor.

*Source*: distilled engineering judgment; Siemens SIMATIC S7-1200 system manual §error-handling OB; S7-1500 error-handling manual; STEP 7 SCL for S7-300/400 manual §6.4 floating-point comparison note


## occ9 [compare_math] Never compare REAL/LREAL directly with =; compare by absolute difference against a tolerance

Floating-point numbers in a PLC are limited by IEEE 754 precision, so two theoretically equal REAL/LREAL values compared with = may never be TRUE. Correct approach: IF ABS(a - b) <= epsilon THEN, where epsilon is chosen by process precision (typically 0.001–0.01, or on the order of 1e-5 to 1e-4 of the compared range). For analog in-position detection add a deadband (hysteresis) to prevent chatter. S7-1500 provides IS_NAN/IS_INF to filter special floating-point values at the input.

**Pitfall**: Using IF scaledValue = setpoint THEN to trigger an action never holds due to floating-point error, so the action never fires; a deadband set too small is equivalent to none, and the condition triggers repeatedly.

*Source*: IEEE 754 floating-point standard; Siemens STEP 7 SCL for S7-300/400 manual §6.4 floating-point comparison note; TIA Portal SCL Programming Manual §Arithmetic expressions; distilled engineering judgment


## occ9 [naming] Variable naming uses Hungarian prefix + function name, strictly distinguishing input/output/static/temp areas

SCL is plain text with no ladder-diagram visual cues, so names must be self-describing. Recommended prefix convention: x/b=BOOL, i=INT, di=DINT, r=REAL, w=WORD, s=STRING, t=TIME, fb=FB instance; scope prefixes: i_=input (VAR_INPUT), o_/q_=output (VAR_OUTPUT), s_=static (VAR), t_=temp (VAR_TEMP), g_=global DB reference. For example: xiFanRun, rSetpointTemp, diCounter. Within a team, standardize on either the b or x prefix (pick one); mixing them causes search confusion. TIA V16+ supports adding a Comment in the tag table for physical meaning and engineering units.

**Pitfall**: Using meaningless short names like Var1/Var2/flag/tmp everywhere means even the original author cannot read it 6 months later; mixing b/x prefixes on BOOL variables confuses HMI tag mapping and cross-module search.

*Source*: distilled engineering judgment; Siemens PRONETA/TIA Style Guide; Siemens programming style guide (SIMATIC Programming Guideline); 工控人家园 naming-convention discussion


## occ8 [comm] Communication instructions (TCON/TSEND/PUT/GET etc.) must be called continuously every scan cycle on the same instance, not just once

The communication function blocks on S7-1200/1500 (TCON, TSEND_C, TRCV_C, GET, PUT, etc.) execute asynchronously: they do not complete immediately after the call and must be called continuously on the same instance in subsequent scans until DONE or ERROR is set. The communication FB instance (containing BUSY/DONE/ERROR/STATUS status) must be declared in the FB STATIC area or a standalone DB to keep state across scans. Correct pattern: issue request → poll the same instance every cycle → response → process → reset request.

**Pitfall**: Triggering with a rising-edge REQ and then not calling again means DONE is never set and the program is stuck waiting; placing the communication FB instance in VAR_TEMP clears the BUSY flag every scan so communication can never complete.

*Source*: Siemens TIA Portal S7-1200 communication manual A5E02486680 §asynchronous-instruction execution model; SIMATIC S7-1500 Communication Function Blocks Manual A5E03735814; TIA Portal online help TSEND_C/PUT communication-instruction description


## occ7 [maintainability] Use RETURN for early exit and front guard conditions to avoid deeply nested IFs

SCL supports writing RETURN anywhere to exit the current FB/FC early. For precondition checks (parameter validity, mode check, interlock), place them at the start of the function in a guard-clause pattern: IF NOT valid THEN ENO := FALSE; RETURN; END_IF;, so the main logic needs no nesting. Deep nesting (more than 3 levels) is a maintenance nightmare. RETURN is a legitimate and recommended structured exit. Note: if you RETURN early, the safety-interlock force-clear code at the end will not run — ensure the interlock takes effect before the RETURN or use another structure.

**Pitfall**: Cramming all logic into one big IF tree with 6–8 levels of nesting; forgetting to handle interlock conditions before a RETURN bypasses the safety logic.

*Source*: distilled engineering judgment; Siemens SCL best-practices community document; IEC 61131-3 ST spec; TIA Portal SCL Programming Manual §RETURN/ENO chapter


## occ6 [scan_cycle] SCL executes sequentially; assignments inside IF/CASE branches take effect immediately — do not misapply the LAD "coil activates at scan end" mental model

SCL is a sequential-execution language; an assignment to a variable inside an IF branch is visible immediately after that line executes, and later code reads the new value. Unlike LAD, SCL has no "coil only activates at scan end" delay — a variable may be modified multiple times within one cycle, and the last assignment is the end-of-cycle result. This makes state machines and calculation chains more natural to write, but watch the execution order when one variable is overwritten by multiple IF branches. The RETURN statement is the only way to exit the current block early.

**Pitfall**: An engineer migrating from LAD writes an IF in SCL and then waits for "the next scan cycle" to read the new value, causing the state machine to take an extra beat; multiple IF branches assigning the same output variable means the last branch always overwrites the earlier results.

*Source*: distilled engineering judgment; TIA Portal SCL Programming Manual §Program Flow Control


## occ6 [datatypes] LINT/ULINT/LREAL are supported only on S7-1500; S7-1200 tops out at DINT/UDINT/REAL (32-bit)

S7-1500 supports LINT (64-bit signed), ULINT (64-bit unsigned), and LREAL (64-bit float), whereas S7-1200 supports at most DINT/UDINT/REAL (32-bit). S7-1200 CPU firmware < V4.1 does not support LINT. When copying an SCL block from an S7-1500 project to an S7-1200, LINT variables and related operations all error and must be replaced one by one with DINT. S7-1200 also supports LREAL but at lower arithmetic efficiency than S7-1500.

**Pitfall**: Misusing LINT in cross-platform porting fails to compile on S7-1200; the AT keyword has restrictions on S7-1200 low firmware versions (FW < V4.1), so confirm the target platform firmware version when porting.

*Source*: Siemens STEP 7 S7-1200 system manual §data types; S7-1500 system manual; TIA Portal SCL Programming Manual A5E03790550


## occ6 [scan_cycle] Minimize RETAIN variables in an SCL FB; keep only process parameters that truly need power-loss retention

The RETAIN area of an SCL FB occupies limited NVRAM capacity (about 10 KB default on S7-1200), and frequent writes accelerate memory wear. Engineering principle: mark RETAIN only for variables that truly need power-loss retention, such as process parameters and recipe data; do not mark RETAIN for intermediate values or counts that can be rebuilt from process state. Put the post-power-loss rebuild logic in the FB's first_call branch.

**Pitfall**: Marking every FB output RETAIN is a classic beginner mistake, causing old values to overwrite freshly initialized values after power-up and producing abnormal device behavior.

*Source*: distilled engineering judgment; Siemens S7-1200 system manual §NVRAM chapter


## occ5 [scan_cycle] EN/ENO has no effect by default in SCL; handle it manually or switch to a plain BOOL parameter

In an FB/FC written in SCL, the compiler does not automatically skip the function body when EN=FALSE — unlike LAD/FBD. If the caller conditionally enables it through the EN pin, the SCL function body still executes. To emulate EN/ENO semantics, write IF NOT EN THEN ENO := FALSE; RETURN; END_IF at the start of the function body. Most engineers choose not to use EN/ENO and instead use a plain BOOL input for condition control, which is clearer. ENO=FALSE throws no exception and does not stop the scan; the caller must check the ENO output to detect failure.

**Pitfall**: Wiring the EN pin at an SCL FB call site and assuming the function does not execute when EN=0 — in fact the function body runs and the outputs are unexpectedly updated.

*Source*: TIA Portal SCL Programming Manual V16 §EN and ENO; distilled engineering judgment


## occ5 [mode_control] Manual/automatic switching must implement bumpless transfer; the automatic initial value tracks the current actual state

On a mode switch (manual→automatic), the automatic mode's initial output should track the current actual state rather than recompute from an initial value, preventing an output jump that shocks the actuator. SCL implementation: on switching to automatic, first initialize rSetpoint to the current feedback value and clear the integrator. In manual mode the automatic computation path should still run (shadow computation), only with its output bypassed; on switching back to automatic the output has already converged, so the transfer is bumpless.

**Pitfall**: After switching to automatic, the PID integrates from rOutput=0, causing a large output jump that shocks the actuator.

*Source*: distilled engineering judgment; PID bumpless-transfer general control-engineering principle


## occ4 [pitfall] Do not call a stateful IEC timer or edge-detection instance inside a FOR loop

An SCL FOR loop runs multiple iterations consecutively within one scan cycle. If the loop body calls the same TON or R_TRIG instance, every iteration computes with the same instance, so the timer is called repeatedly within one scan and pulses are "eaten" or timing is repeatedly reset. Correct approach: move the stateful function-block call outside the loop and keep only pure computation and array indexing inside.

**Pitfall**: Calling an R_TRIG instance inside FOR i:=0 TO 9 DO to detect a rising edge consumes the pulse on the first iteration, so the remaining 9 iterations see no edge.

*Source*: distilled engineering judgment


## occ4 [datatypes] A STRING declaration must specify a maximum length; STRING[n] comparison can use =, but an interface length mismatch is a compile error

In SCL, the n in STRING[n] is the maximum character count; a bare STRING defaults to STRING[254]. Two STRINGs can be compared directly with = for content equality. Assigning STRING[10] to STRING[20] does not affect the comparison result for the extra positions. But when an FB interface declares STRING (without length) and the call site passes STRING[n] with a length mismatch, TIA gives a compile warning or even error. S7-1200 STRING is at most 254 bytes; WSTRING is at most 16382 characters.

**Pitfall**: After declaring STRING (without length) on an FB interface, passing STRING[n] at the call site with a length mismatch is a compile error that beginners often cannot diagnose.

*Source*: TIA Portal SCL Programming Manual A5E03790544 §STRING data type


## occ4 [datatypes] Mixing TIME and LTIME causes implicit truncation; convert explicitly and standardize the time type per platform

S7-1500 supports LTIME (64-bit, nanosecond resolution); S7-1200 supports only TIME (32-bit, millisecond resolution). Assigning an LTIME value to a TIME variable does not error but silently truncates the high bits, causing abnormal timing logic. Use LTIME_TO_TIME() or TIME_TO_LTIME() for explicit conversion. When porting across platforms, check all time-variable type declarations. Engineering judgment: standardize on TIME for S7-1200 projects and upgrade to LTIME only when S7-1500 needs high precision.

**Pitfall**: Assigning LTIME#1h to a TIME variable may pass TIA compilation but the value is truncated; declaring an LTIME-type variable in an S7-1200 FB causes a download failure.

*Source*: distilled engineering judgment; Siemens TIA Portal SCL Programming Manual (6ES7810-4CA10-8BW0); TIME-assignment errors repeatedly reported on industrial-control forums


## occ3 [pitfall] SCL string-function return values must be checked: FIND returns 0 for not-found, not an error

The return-value semantics of SCL string functions (FIND, LEFT, MID, RIGHT, CONCAT, etc.) are easily confused: FIND returns 0 (not -1) when the substring is not found, and MID returns an empty string rather than an error when out of range. Any logic that depends on string parsing (message parsing, recipe-name matching) must check the return value for validity before using the result.

**Pitfall**: Using the FIND return value directly as the start index for MID — when the substring does not exist, FIND=0 and MID(POS:=0) returns an empty string because POS is invalid, and subsequent logic silently takes the wrong branch.

*Source*: distilled engineering judgment; Siemens TIA Portal String Functions documentation


## occ3 [architecture] Clear responsibility boundary between FB instance DB and global DB: FB Static = internal state, global DB = data shared across FBs

All static variables of an SCL FB are stored in the instance DB and are private to that instance; data shared across FBs should go through a global DB rather than cross-referencing FB instance DBs. The FB Static area suits: timer instances, step numbers, intermediate registers, edge helper bits. A global DB is only for: process parameters, recipes, alarm records, cross-FB shared state. Coupling rule: never read/write FB_Drive.InstDB.SpeedRef across modules, or an FB version upgrade changes the instance-DB offsets and corrupts the data.

**Pitfall**: All FBs sharing one "common timer" in a single global DB overwrite each other when multiple instances run concurrently, garbling the timing.

*Source*: TIA Portal information system §data-block usage; distilled engineering judgment


## occ3 [addressing] AT overlay declaration: overlay a WORD/DWORD as an ARRAY OF BOOL for bit operations

SCL cannot directly write a bit access like %MW10.3. The standard practice is to first declare a WORD or DWORD variable in a DB, then use the AT keyword to overlay a STRUCT/ARRAY OF BOOL on it, for bitwise operation. This is SCL's official idiom for bit operations, avoiding the poor readability of manually extracting bits with AND/OR masks. S7-1500 fully supports it; S7-1200 firmware < V4.1 has AT restrictions.

**Pitfall**: On S7-1200 low firmware versions AT causes a compile error; using AT for absolute-offset access on an optimized DB causes a compile error or runtime crash.

*Source*: Siemens TIA Portal SCL for S7-300/400 and S7-1500 Programming Manual A5E03790780 §AT construct chapter; TIA Portal SCL Language Description A5E33840979-AD


## rm-a [comm] S7-1500 SCL calls of MB_CLIENT / TSEND_C: hard syntax rules — UINT# literals, mandatory DISCONNECT, Variant params cannot point at VAR_TEMP, TCON_IP_v4 initialized in the DB declaration

Real-machine verification (TIA V21, S7-1500, whole-PLC compile 0 errors after 10+ diagnostic rounds, 2026-08). Hard SCL syntax for communication instruction calls: TCON_IP_v4.RemotePort is UInt — a bare Int literal 502 is rejected with 'Invalid assignment', it must be written UINT#502; MB_CLIENT V4 requires the DISCONNECT input while TSEND_C has NO DISCONNECT parameter; Variant parameters (CONNECT/DATA/MB_DATA_PTR) cannot point at VAR_TEMP — use static VAR or a global DB; in an optimized-access DB, assigning TCON_IP_v4.RemoteAddress at runtime is rejected with 'Invalid assignment' — initialize the whole record at declaration: `TCON_IP_v4 := (InterfaceId:=64, ID:=1, ActiveEstablished:=TRUE, RemoteAddress:='...', RemotePort:=UINT#502)`. Explicit typed literals pass cleanly: MB_MODE:=INT#0, MB_DATA_ADDR:=UDINT#40001, MB_DATA_LEN:=UDINT#10, TSEND LEN:=UDINT#100.

**Pitfall**: the compiler's error line number does not correspond to the source line for these Invalid-assignment failures, so "fix the reported line" loops without progress; the actual cause is the literal type (RemotePort), the missing/extra parameter (DISCONNECT), or the Variant target (VAR_TEMP / runtime assignment on an optimized DB).

*Source*: real-machine TIA V21 S7-1500 compile diagnostics (PLC指令语料工程, whole-PLC 0 errors, 6 blocks XML exported)


## rm-b [motion] S7-1500 motion control via TO_PositioningAxis + MC_* in SCL: CPU firmware >= V2.5 required; MC_Power's stop parameter is StopMode (Int), not Stop

Real-machine verification (TIA V21, 2026-08): a technology object TO_PositioningAxis is rejected on CPUs with firmware below V2.5 (CPU 1511-1 PN V1.7 → TO_TYPE_NOT_CREATABLE_ON_CPU; 6ES7 511-1AK02-0AB0/V2.9 accepted). MC_Power's stop input is StopMode of type Int (0=emergency stop / 1=immediate stop / 2=stop with deceleration), NOT a Bool named Stop — writing Stop is rejected with 'formal parameter Stop is invalid'. Creating the TO auto-enables axis simulation (Simulation.Mode=1) so the block compiles without a drive telegram; the system auto-generates MC_Servo (OB91) and MC_Interpolator (OB92). In SCL, reference the axis by its technology-object name: Axis := "AxisName", read actuals via "AxisName".ActualPosition / .ActualVelocity.

**Pitfall**: copying MC_Power call shapes from older examples that use a Bool Stop parameter → compile rejects the formal parameter; or creating the TO on a firmware < V2.5 CPU, which refuses at creation time with an error that does not state the firmware requirement.

*Source*: real-machine TIA V21 + S7-1500 whole-PLC compile 0 errors (3 warnings), 3 XML exports (PLC指令语料工程 / PLC_运动设备)


## rp-a [lib] Real SCL from a shipped S7-1500 standard-program template: the LGF motion FB shape (LAxisCtrl_PosAxis, 70 KB)

Real-project source (TIA V17 project `示例程序.ap17`, exported via Openness and reconstructed to SCL, 2026-09-09). `LAxisCtrl_PosAxis` is the Siemens LGF positioning-axis wrapper; its interface IS the pattern for any axis wrapper you write:
- Inputs: `enable, enableAxis, resetAxis, jogForward, jogBackward, moveVelocity, stop, fastStop, torqueLimiting, homing, posRelative, posAbsolute, posSuperimposed : Bool; axis : TO_PositioningAxis`.
- Outputs: `valid, busy, error, status : Word, axisEnabled, resetActive, commandBusy, commandDone, commandAborted, inVelocity, inLimitation, homingCommandBusy/Done/Aborted, superimposedBusy/Done/Aborted, inClamping, jogSelected, moveVelocitySelected, ...`.
- Static state: `statFirstCycleReset, statPowerErrorOld, statResetState, statEnableAxisOld, statHomingOld, statBasicCommand/statBasicCommandOld : DWord, statBasicMotionState : DInt, statExeOfBasicMotion : Int, statVelocity/Acceleration/Deceleration/Jerk : LReal, statEmptyDiagnostics : "LAxisCtrl_typeDiagnostics"` + a `VAR CONSTANT` block of status codes (`STATUS_NO_CALL, STATUS_FIRST_CALL, STATUS_SUBSEQUENT_CALL, STATUS_EXECUTION_FINISHED`) and error codes (`ERR_MC_POWER, ...`).
- Body shape: `IF NOT enable AND statEnableOld THEN ... END_IF;` first-cycle reset region, then per-command `REGION` blocks that (a) detect the rising edge of the command against its `*Old` static bit, (b) call the matching `MC_*` instance, (c) map the MC result into `status/valid/busy/error`.
- **Pitfall/lesson**: the public `status`/`error` words are driven from named constants (`status := STATUS_NO_CALL;`, `diagnostics.status := ERR_MC_POWER;`), never from magic numbers; and every command keeps its own `*Old` edge bit so a level signal cannot re-trigger a move.

## rp-b [drive] Real SCL: Siemens drive FBs (SINA_POS family) — the telegram-shaped interface

Same project (`FB284_Lib_SINA_POS` 22 KB, `SINA_POS`, `SINA_POS_1`, `V90_E_POS` 30 KB, `FB287_SINA_PARA_S` 24 KB). The SINA_POS interface is the standard SINAMICS/V90 telegram wrapper:
`ModePos : Int, EnableAxis, CancelTraversing, IntermediateStop, Positive, Negative, Jog1, Jog2, FlyRef, AckError, ExecuteMode : Bool, Position/Velocity : DInt, OverV/OverAcc/OverDec : Int, ConfigEPos : DWord, HWIDSTW/HWIDZSW : HW_IO` →
`AxisEnabled, AxisPosOk, AxisRef, AxisWarn, AxisError, Lockout : Bool, ActVelocity/ActPosition : DInt, ActMode : Int, EPosZSW1/EPosZSW2 : Word, ActWarn/ActFault : Word, Error : Bool, Status : Word`.
- **Lesson**: hardware identifiers are typed `HW_IO` (not Int/Word) — pass the actual device ID, not a slot number; `ConfigEPos` is a DWord bit field, so build it with named bit constants, not magic hex.

## rp-c [device] Real SCL: cylinder FB family — the interface that makes one FB serve 8 hardware variants

Same project (`单控气缸_不带传感器`, `单控气缸_只有原点传感器`, `单控气缸_只有工作位传感器`, `单控气缸_带2个传感器`). The richest variant's interface (13 inputs / 7 outputs / 5 IN_OUT):
- IN: `看门狗延时时间, 原位传感器感应时间, 工作位传感器感应时间 : Time`, `原位传感器, 工作位传感器, 手动模式, 移动面板_手动模式, 屏蔽允许信号, 允许回原位, 允许去工作位, 归位模式, 气缸测试按钮, 电磁阀OK : Bool`.
- OUT: `气缸就位, 气缸错误, 电磁阀输出, 手动模式输出, 测试按钮led灯, 原位输出, 工作位输出 : Bool`.
- IN_OUT: `数据 : "stCylinder"` (per-cylinder instance data), `模式激活, 手动错误, 原位传感器故障, 工作位传感器故障 : Bool`.
- Static: `S_tonInPosOn/S_tonInPosOff/S_tonWd/S_tonDelayTimeSensorA/S_tonDelayTimeSensorB : TON_TIME`, `S_rtFbutton : R_TRIG`, RETAIN mode bits (`S_bManual/S_bHmManual/S_bHmY`).
- **Lesson**: the hardware-variant differences (how many sensors exist) are absorbed by the INPUT flags and the `stCylinder` data struct, not by separate code paths per device; watchdog/sensor-response times are Time inputs so commissioning can tune them without editing code.

## rp-d [algo] Real SCL: bit statistics — `%X0` + ROR/ROL loop with an edge memory

Same project, two sibling FBs:
- `统计Dword位为1的个数`: `statCount := 0; statStatus := 双字输入; FOR tempCycle := 0 TO 31 DO IF statStatus.%X0 THEN statCount += 1; END_IF; statStatus := ROR(IN := statStatus, N := 1); END_FOR; 位为1的个数 := statCount;`
- `统计Dword位0到1跳变的个数`: keeps `statMask`/`statEdge : DWord`, tests `((双字输入 & statMask) <> 16#0) & ((statEdge & statMask) = 16#0)` then `statMask := ROL(IN := statMask, N := 1)`, and stores `statEdge := 双字输入` at the end; a zero count reuses `statLastCount`.
- **Lesson**: `%X0` is the direct bit-access form for a rotating word; the mask/edge pair is the standard way to count 0→1 transitions of every bit in one scan. Note `&` is bitwise AND and `AND` is boolean — mixing them is a classic SCL type error.

## rp-e [algo] Real SCL: analog filtering — ring buffer + TON_TIME + REGION

Same project (`FIoatingAverage` with 4 empty-expression-free regions, `模拟量平均滤波`, `模拟量批量处理`):
- `模拟量平均滤波` IN: `输入 : Real, 采集时间 : Time, 模式 : Bool`; OUT `输出 : Real`; IN_OUT `滤波强度 : Int`; STATIC `T0/T1 : TON_TIME, P : R_TRIG, 最小值/最大值 : Real, 中间寄存数值 : Array[0..30] of Real`; body opens with `REGION 最大值 := 中间寄存数值; 最小值 := 中间寄存数值; END_REGION` (then the scan).
- `模拟量批量处理` IN: `address : Int, 通道数量 : DInt`; IN_OUT `channels : Array[*] of "typeAI"`; STATIC `statFloatingAverageInsts : Array[0..#MAX_CHANNEL_INDEX] of "FIoatingAverage"`, `statErrorChanels : Array[0..#MAX_CHANNEL_INDEX] of Bool`; `VAR CONSTANT` error codes `NO_ERROR, ARRAY_SIZE_SMALL, COUNT_OVRANGE, ERROR_MEASURING_MODE, ERROR_LIM, ERROR_OVERFLOW, ERROR_OVER_RANG`.
- **Lesson**: the per-channel filter instances live in a STATIC array sized by a constant, and the array bounds come from `LOWER_BOUND/UPPER_BOUND(ARR := channels, DIM := 1)` — that is how one FB scales from 1 to N channels without code changes. Error codes are named constants in `VAR CONSTANT`.

## rp-f [algo] Real SCL: array/sorting utilities worth reusing

Same project: `数组排序`, `冒泡排序获取最大值和最小值`, `选择排序`, `求数组中的最大数和平均值`, `可调数组自动从大到小排序`, `ARRAY_SIZE_FC`, `Byte数组_to_INT`, `分解5位整数` (digit split with `MOD 10` / `/ 10`), `循环时间`, `随机生成数` (clock byte based). All are plain `FUNCTION`s taking `Array[*]` and returning scalars — the template's reusable toolbox.

## rp-g [comm] Real SCL: sequential multi-area GET/PUT — Remote/Variant pointers + one instance per area

Same project (`顺序多区域Get`, `顺序多区域Put`, ~3.4 KB body each):
`VAR_IN_OUT 远程_读取1区指针/2区/3区 : Remote; 本地_读取结果1区指针/2区/3区 : Variant;` + STATIC `instGet1/instGet2/instGet3 : GET;` + `VAR CONSTANT FB_STATE_NO_PROCESSING/PROCESSING_1/PROCESSING_2/PROCESSING_3 : DInt, STATUS_EXECUTION_FINISHED/NO_CALL/FIRST_CALL/SUBSEQUENT_CALL : Word`.
- **Lesson**: one communication instance per area, advanced by an integer state, is the S7-1500 way to do sequential multi-area transfer; `Remote`/`Variant` are the pointer types, and `触发` is documented as "Rising edge starts action once" so the body keeps its own `statExecuteOld`.

## rp-h [logic] Real SCL: 自动先停先启_先启先停 — LIMIT with NAMED parameters + runtime accounting

Same project, `自动先停先启_先启先停`: inputs `需要启动的电机个数 : Int, I区起始字节地址/I区起始位地址/Q区起始字节地址/Q区起始位地址 : Int`; IN_OUT `电机组 : Array[0..#需要控制的电机数量减1] of "MOTOR"`; STATIC `Start_Num, Run_Num : Int, Static_1/MEM/累计运行时间/当前运行时间/故障存储区 : Array[0..#...] of ...`; body starts
`Start_Num := LIMIT(MN := 0, IN := 需要启动的电机个数, MX := 需要控制的电机数量减1+1);`
- **Lesson**: in TIA SCL, `LIMIT` accepts NAMED parameters (`MN:=`, `IN:=`, `MX:=`) — the classic LGF style. (The CODESYS line is the opposite: its built-in operators take positional arguments only. Do not copy the named form across lines.)
- The FB implements "start the least-used motor first, stop the longest-running motor first" by keeping per-motor runtime arrays and picking the min/max each cycle.

## rp-i [logic] Real SCL: motor start/stop over a MOTOR UDT

Same project (`电机启停`): `FUNCTION "电机启停"` with `VAR_IN_OUT InOut_1 : "MOTOR";` and body
`IF InOut_1.Start THEN InOut_1.Run := 1; END_IF; IF InOut_1.Stop OR InOut_1.Fault THEN InOut_1.Run := 0; END_IF;`
- **Lesson**: the whole motor is one UDT (`Start/Stop/Fault/Run`); the FC takes it IN_OUT so the same code serves every motor. Boolean literals in SCL are `1`/`0` or `TRUE`/`FALSE` — this template uses `1`/`0`.

## rp-j [tooling] How this corpus was built from a real TIA project (reproducible, no purchase needed)

- TIA Openness has NO "export block as SCL text" API (that is GUI-only "generate source"). But `tia_openness_export_block_xml` writes the full SimaticML XML, which carries (a) the `Interface` sections and (b) the SCL token stream under `NetworkSource/StructuredText`.
- Reconstruction rules that matter (all verified against 84 blocks, zero empty expressions after the fix): `<Token Text>`, `<Blank Num>`, `<NewLine Num>`, `<Access Scope="LocalVariable"><Symbol><Component Name>` (path joined by `<Token Text=".">`), `<Access Scope="LiteralConstant"><Constant><ConstantValue>`, `<Access Scope="LocalConstant"><Constant Name="STATUS_NO_CALL">` (named constant → use `Name`), `<Access Scope="Call"><Instruction Name="LOWER_BOUND"><Parameter Name="ARR">`, and `<LineComment><Text>`.
- Facts of the source project (TIA V17, `示例程序.ap17`, S7-1500/ET200MP station): 401 blocks, 307 exported, **84 SCL blocks reconstructed** (LGF axis/drive, RFID/vision/robot wrappers, cylinder FBs, sorting/filtering, GET/PUT, 立库管理, IO mapping, star-delta starter, flow accumulation, ...), plus 17 STL and 10 LAD/FBD blocks in the same project.
- **Pitfall**: the bridge must be trusted for Openness per absolute path; a rebuilt bridge with an unchanged hash is still "stale" if its path is not registered (the packaged copy under `release/win-unpacked/resources/bridge/` was already trusted for V17-V21 and could be used without an admin prompt).

## rp-k [hardware] S7-1500/1200 CPU has NO onboard I/O — the compile warning is expected, and V16/V17 cannot resolve signal-module order numbers

Real-machine evidence (E2E R001, 2026-09-09, TIA V17 + CPU 1511-1 PN, SCL): after the program compiled with **0 errors / 1 warning**, `tia_openness_read_hardware_config` showed `导轨_0` carrying only the CPU (positionNumber=1) — no DI/DQ module. The warning text is verbatim `Inputs or outputs are used that do not exist in the configured hardware.` (`%I0.0..%I0.3`, `%Q0.0..%Q0.1` referenced but absent from the hardware).
- On V16/V17 `tia_openness_search_equipment_catalog` is a **CPU-only** fallback (no HardwareCatalog API): five attempts with different signal-module names all returned empty + `catalogMiss` hint. `tia_openness_plug_rack_module` then returned the SAME `TIA_CAN_PLUG_NEW_FALSE` for two different order numbers x two different slots — the error does not distinguish wrong article from wrong slot.
- **Lesson**: for a CPU-only device, plan the IO on signal modules from the start OR deliver the program and state the hardware limitation. Do not spend batches looping on plug attempts (R001 burned 8 batch calls, 5 of them with a failed step). If 0 warnings are required, either use a CPU with onboard IO, or plug an exact order number taken from a real hardware source.

## rp-l [idiom] Motor start/keep/stop with overload latch and a clock-free fault lamp — the three-layer shape that compiles 0 errors

Real-machine evidence (E2E R001, TIA V17, SCL, `FB_MotorControl` + `DB_MotorControl` + SCL `Main`): the program compiled **0 errors** on first submission (the only warning was the missing-hardware one above). The verified shape:
```scl
// 1. overload latch: a cleared cause does NOT self-reset; needs an operator reset
IF NOT #OverloadOK THEN #statFault := TRUE; END_IF;
IF #FaultReset AND #OverloadOK THEN #statFault := FALSE; END_IF;
#Fault := #statFault;
// 2. start/keep/stop with stop-and-protect priority
#statRun := (#StartBtn OR #statRun) AND #StopBtn AND NOT #statFault;
#Run := #statRun;
// 3. 1 Hz fault lamp from a self-resetting TON+TOF pair — no clock memory byte needed
#statFlashOn(IN := #statFault AND NOT #statFlashOff.Q, PT := #LampFlashPT);
#statFlashOff(IN := #statFlashOn.Q, PT := #LampFlashPT);
#Lamp := #statFault AND #statFlashOn.Q;
```
- **Why the TON+TOF pair**: the classic `M0.x` clock-memory approach silently fails when the CPU's clock memory byte is not enabled — the lamp simply never blinks. The two-timer oscillator carries its own period and works on any CPU.
- **Stop button wiring**: the physical stop/overload contacts are NC, so the PLC reads them as 1=healthy; the latch/priority is expressed by ANDing them into the run term rather than inverting in the body.
- **Note**: the corpus already had `片段/09_模式学习单元/模式_启停自锁与停止优先.scl` (`tier=切片`), but it only covered layer 2 (one self-hold line). Layers 1 and 3 plus the IO mapping are what real tasks need; the compile-verified shape is now in `plc-study-library/片段/12_西门子SCL编译验证/`.

## rp-m [tooling] write_source is not idempotent per source_name, and deleting the block does not delete the external source

Real-machine evidence (E2E R001): after deleting the generated `FB_MotorControl`, re-writing the same `source_name` failed `TIA_WRITE_SOURCE_INVOCATION_FAILED: The name is not unique.` from `PlcExternalSourceComposition.Create`; passing `overwrite-external-source=true` did not change it (the result echoed `overwriteExternalSource: false` and the failure happened at `Create`).
- **Fix**: delete the external source object before rewriting, or use a unique `source_name` per attempt (e.g. append a revision suffix). Deleting the generated block is NOT enough.
- **Batch inconsistency**: a single `tia_openness_write_source` may omit `device_name` when the project has one PLC, but the same op inside `tia_openness_batch` fails `BRIDGE_REQUIRED_OPTION_MISSING: --device-name` — always pass `device-name` in a batch.
- **Batch failure shape**: the envelope only reports `TIA_BATCH_PARTIAL` plus how many ops ran; read `operations[]` to learn which step did not run before retrying.

## rp-n [hardware] S7-1500 signal modules DO plug on V17 — with the module's own firmware suffix; the catalog query needs the full order number

Real-machine evidence (E2E R002, TIA V17 + CPU 1511-1 PN): the agent first failed `tia_openness_plug_rack_module` with `module_name="DI_16x24VDC"` and with the bare `OrderNumber:6ES7 521-1BH00-0AB0` (both `TIA_CAN_PLUG_NEW_FALSE`), then succeeded with:
- `OrderNumber:6ES7 521-1BH00-0AB0/V1.0` → DI16 plugged at slot 2
- `OrderNumber:6ES7 522-1BH00-0AB0/V1.0` → DQ16 plugged at slot 3
`tia_openness_read_hardware_config` then reported **DI @0 (16 bit)** and **DQ @0 (16 bit)**, and the whole-PLC compile finished **0 errors / 0 warnings** — i.e. the R001 warning class is fully solvable on this machine.
- **Catalog query**: `query="CPU 1511-1 PN"` and `query="1511"` both returned `results: []` on the V16/V17 fallback; only the full order number `6ES7 511-1AK02-0AB0` hit. Use full order numbers.
- **Lesson**: for an S7-1500 rack, the plug identifier = module order number + `/V<module firmware>`; the module firmware is NOT the CPU firmware and NOT the TIA catalog version.

## rp-o [idiom] Single-button start/stop without set/reset: toggle from an edge pulse + self-hold, with the R_TRIG in the static area

Real-machine evidence (E2E R002, TIA V17, SCL, `FB_BtnToggle` + `iBtnToggle` + SCL `Main`): whole-PLC compile **0 errors / 0 warnings**, and the block was re-read via `export_block_xml` + grep to confirm `rtBtn : R_TRIG` (CLK/Q/Stat_Bit) and `statRun` really exist. The verified toggle core:
```scl
VAR  rtBtn : R_TRIG;  statRun, statPulse : Bool;  END_VAR   // R_TRIG MUST be static
#rtBtn(CLK := #Btn_StartStop);
#statPulse := #rtBtn.Q;
#statRun := (#statRun OR #statPulse) AND NOT (#statRun AND #statPulse);
#statRun := #statRun AND #Permit_Run;   // lost permit stops + blocks restart
#Motor_Run := #statRun;
```
- **Why it works without S/R**: one pulse flips the state — if `statRun` was 0 the OR term sets it, if it was 1 the AND-NOT term clears it; a held button produces exactly one pulse per press because `R_TRIG` sits in the static area.
- **Hard requirement**: an edge instance in `VAR_TEMP` is re-initialised every scan and never fires — the toggle then either never starts or toggles every scan. Same rule for TON/TOF/CTU.
- **Corpus warning**: `plc-study-library/片段/10_西门子SCL真实工程/电机启停.scl` uses `IF Start THEN Run := 1; END_IF;` (set/reset style) — it is a real shipped template but a COUNTER-EXAMPLE for "no set/reset" tasks; do not copy it there.
- **Residual-object caveat (R002)**: the round could not remove its `PlcExternalSource` objects (see rp-m), so "delete the generated code" is satisfied for blocks only; report the leftover external sources honestly.

## rp-p [idiom] 8-bit running light as ONE time base + a phase window (no per-lamp timers)

Real-machine evidence (E2E R004, TIA V17, SCL, `FB_RunningLight` + instance DB + SCL `Main`): whole-PLC compile **0 errors / 0 warnings**, blocks read back `isConsistent=True`. The verified shape, and why it generalizes:
- **One TON tick, self-resetting**: `#tick(IN := NOT #tick.Q, PT := #StepTime);` advances an `Int` step counter 0..7. Never instantiate one timer per lamp — 8 timers drift apart and cost 8 instances.
- **Two parameters cover the ambiguous spec**: `StepTime` (相邻切换间隔) and `OnTime` (每灯点亮时长). `StepTime=100ms/OnTime=500ms` = five overlapping lamps (flowing band); `StepTime=600ms/OnTime=500ms` = a 100 ms all-off gap. Same code, parameters only — do NOT hard-code either reading when the task gives two numbers.
- **Phase window**: a `Time` accumulator inside the current step decides how many neighbours are lit; the bitmap is `BYTE#1 * INT_TO_BYTE(step)` OR'd with the windowed neighbours.
- **Pause by edge, state frozen**: `R_TRIG` on the button toggles a static `statPaused`; when paused the step counter and phase stop advancing (the display freezes instead of restarting).
- **Power-on first cycle**: suppress the wrap on the first scan (`statFirst`) so the sequence starts at lamp 1 instead of wherever the uninitialised counter lands.
- **Pitfall that cost a prepare-compile round**: an FB must not read its own OUTPUT parameter (`#Paused`) in the body — TIA reported `The parameter '#Paused' might not be initialized` during instance-DB preparation. Use a static member and write the output once per scan.
- **Corpus gap this round exposed**: `plc_corpus_find("流水灯 循环")` (two tokens) fell back to any-token mode because no entry carried BOTH tokens; the compile-verified sample `plc-study-library/片段/12_西门子SCL真实工程/流水灯_相位窗口_自复位节拍.scl` ranked dead last among the 21 any-token hits (category 12_ sorts after 09_) and was trimmed from the returned window — the model concluded "corpus has no 流水灯 sample" although it existed. The INDEX entry now also carries 循环/暂停 keywords so multi-token queries hit it all-tokens first. Lesson for retrieval: a single most-specific keyword beats a keyword soup when the index ranks by token count.

## rp-ar [idiom] Pause/resume by SKIPPING the timer call — freezing ET beats reset-and-restart

Real-machine evidence (E2E R004, TIA V17, SCL `FB_RunningLight`, whole-PLC compile **0 errors / 0 warnings**, blocks `isConsistent=True`): the pause button toggles a static `statPaused` on a rising edge, and the segment timer call is gated on it —
```scl
IF NOT #statPaused THEN
    #statTimer(IN := TRUE, PT := #C_T_LAMP_ON);   // 暂停时不调用 → ET 冻结
END_IF;
```
- **Why it works**: an IEC `TON`'s `ET` only advances while the instance is called with `IN := TRUE`. Skipping the call freezes the elapsed time, so releasing pause resumes mid-segment instead of restarting the segment from zero — the "暂停续跑" semantic with one IF.
- **Do NOT reset-and-restart**: `#statTimer(IN := FALSE)` on pause and re-run on resume discards the partial segment; the visible lamp phase jumps back to the segment start. Freeze-ET preserves the operator's mental model of "paused", not "aborted".
- **Contrast with rp-p's approach** (freeze the step counter and let the tick run): both compiled 0/0 on V17. Freeze-ET is the better default when the spec says 暂停/继续; freeze-the-counter is simpler when the timer also drives other logic that must keep running during pause.
- **Edge-detect the pause button** (`R_TRIG` static): a level-read of a momentary button pauses only while pressed, which most specs don't mean. Toggle-on-edge is the standard reading; state the choice in a comment when the task doesn't.

## rp-q [tooling] write_source's BOM contract vs write_file's plain UTF-8, and the incremental-compile acceptance gap

Real-machine evidence (E2E R004):
- `write_file` writes a `.scl` **without** a BOM, while TIA's `CreateFromFile` reads a BOM-less file through the local ANSI code page (Chinese comments corrupt). The agent detected it (`46 55 4E` = `FUN`) and hand-added `EF BB BF`. The engine now stages a BOM-prefixed copy automatically when `source_path` lacks one (`ensure_tia_source_bom`), so the trap is closed — but keep the fact in mind when reading older evidence.
- **Acceptance gap**: the instance-DB preparation compile reported `0 errors / 2 warnings` (`The parameter '#Paused' might not be initialized`), while the final whole-PLC compile reported **0/0** — TIA had not recompiled that block, so the warning disappeared from the final verdict. Read per-block messages from the batch's own results (or force a rebuild) before claiming "0 warnings"; a clean final verdict can be an incremental-compile artifact.

## rp-r [datatypes] TIA V17 SCL has NO `REAL_TO_TIME` — and a `Tag X not defined` naming a function means "no such function in this version"

Real-machine evidence (E2E R005, TIA V17, S7-1500 SCL): converting a REAL millisecond value to `Time` with `REAL_TO_TIME` compiled to `36: Tag REAL_TO_TIME not defined` / `43: Tag REAL_TO_TIME not defined` — twice, on two independent sources. The message says "Tag", but the symbol is a conversion function: read it as *this TIA version has no such conversion*, not as a missing tag declaration.
- **Verified working alternatives** (probe FB compiled clean, then used in the delivered FB):
  - `#HighTime := DINT_TO_TIME(REAL_TO_DINT(#ms));` — or `DINT_TO_TIME(ROUND(#ms))` when the value is REAL and rounding is wanted;
  - time arithmetic directly: `#t := T#1ms * #msAsDInt;`.
- **Why the pre-check missed it**: `REAL_TO_TIME` looks like a standard IEC conversion (`REAL_TO_INT`, `INT_TO_REAL`, `TIME_TO_DINT` all exist). Only the compiler knows the version's function table, so this class of defect is caught by a compile probe, not by inspection — keep a probe source in the batch when using a conversion function you have not used on this exact version.
- **Related V17 SCL conversion facts confirmed on the same run**: `TIME_TO_DINT` / `DINT_TO_TIME` round-trip in ms; `ROUND(REAL) -> DINT`; no implicit `REAL -> TIME`.

## rp-s [idiom] Software PWM in SCL: one two-phase `TON_TIME` oscillator, clamped parameters, and the scan-time honesty statement

Real-machine evidence (E2E R005, TIA V17, `FB_PWM_Generator` + instance DB + `DB_PWM_Params` + SCL `Main`, whole-PLC compile **0 errors / 0 warnings**, blocks `isConsistent=True`). Task shape: input frequency setpoint + duty cycle 0…100 %, output a square wave (1 s period at the default 1.0 Hz).
- **Two-phase oscillator, not one self-resetting timer**: high phase and low phase each get their own `TON_TIME`; whichever is active times out, flips the output and starts the other. A single self-resetting `TON` (`IN := NOT #t.Q`) produces a one-scan glitch at every period boundary because the output only changes after the timer instance is re-evaluated.
- **Period/high time computed from the setpoint**: `PeriodMs = 1000.0 / FreqHz`, `HighTimeMs = PeriodMs * Duty / 100.0`, then `DINT_TO_TIME(ROUND(...))` (see rp-r). Convert ONCE per scan and keep the `Time` values in statics.
- **Clamp, do not trust the HMI**: frequency 0.01…100 Hz, duty 0…100 %, plus a NaN self-comparison test (`IF #x <> #x`) because a NaN setpoint passes every `>=`/`<=` range test. Out-of-range sets `ParamError` + an `ErrorCode` and holds the output — no divide-by-zero, no illegal output.
- **Duty 0 % / 100 % are separate cases** (constant low / constant high), not `TON` boundaries; otherwise the 100 % case still blips low for one scan.
- **Declare the resolution limit in the report**: software PWM's period error is about +1 OB1 scan, so periods at the 10 ms level belong in a hardware PWM or a cyclic interrupt OB. Stating this honestly is part of the deliverable, not a defect.
- **Corpus gap this round exposed**: `plc_corpus_find("PWM 脉冲 占空比 定时器 振荡")` returned 0 matches before this entry existed.
- **Simulation caveat observed in the same run**: the delivered project's CPU order number was `6ES7 511-1AK02-0AB0`, while the local PLCSIM Advanced instance starts `6ES7 511-1AK01-0AB0`; a download is refused on the mismatch — change the CPU order number before claiming a simulation test.
- **Alternative verified idiom (E2E V2 R005, TIA V17, 0/0)**: the phase-accumulator PWM without any TON — the caller supplies a monotonic `TIME_TCK()` ms tick, the FB computes `dt = DINT_TO_LINT(tick) - DINT_TO_LINT(lastTick)` (LInt subtraction absorbs the 24.8-day DINT wrap), accumulates `phase += dt/period`, and outputs high while `phase*100 < duty`, normalizing with `WHILE phase >= 1.0 DO phase := phase - 1.0`. Both idioms compile 0/0; the accumulator needs the caller to promise a tick input, the two-phase oscillator is self-contained. Compile-verified sample: `plc-study-library/片段/12_西门子SCL真实工程/PWM_相位累加_TIME_TCK.scl`.

## rp-t [tooling] Chinese comments in a `.scl` external source: TIA reads a BOM-less file as ANSI/GBK

Real-machine evidence (E2E R005, zh-CN Windows, TIA V17): `write_file` produced a `.scl` with **no BOM** (first bytes `46 55 4E 43 54 49` = `FUNCTI`); importing it failed with `GenerateBlocksFromSource … 行 000022: 语法错误：设定值"BEGIN"无效` — TIA decoded the UTF-8 Chinese comment bytes through code page 936 and the mojibake swallowed the following keyword. Re-saving the same text as GBK imported cleanly on the first try.
- The engine now stages a BOM-prefixed copy automatically when a `source_path` lacks one (`ensure_tia_source_bom`), which is the preferred fix (UTF-8 + BOM); a GBK file also works. Do not "fix" it by deleting the Chinese comments — the comments are part of the deliverable.
- **Detection that pays for itself**: if a source import fails with a *syntax* error pointing at a line whose visible text looks fine (often naming `BEGIN`/`END_VAR`), suspect encoding before suspecting the code.

## rp-u [idiom] Three-floor elevator: 顺向截车 as a direction-aware stop test, one R_TRIG per button, and a TON door dwell

Real-machine evidence (E2E R006, TIA V17, SCL, `FB_Elevator_Ctrl` + instance DB + SCL `Main`): whole-PLC compile **0 errors / 0 warnings on the first import**, three blocks `isConsistent=True`, block exported and re-read. The verified shape, which generalizes to any call-collection elevator:
- **Register calls, then decide from the registers**: each of the 7 buttons (3 car, 2 up, 2 down) gets its OWN `R_TRIG` static instance; the edge sets a `CarCallReg[1..3]` / `UpCallReg[1..3]` / `DownCallReg[1..3]` Bool. Never `IF #Button THEN #Reg := TRUE` (a held button re-registers forever) and never one shared edge instance for several buttons.
- **One FOR loop answers the two questions the stop test needs**: `CallAbove/CallBelow` and `NearestAbove/NearestBelow` (nearest registered floor in each direction). The stop test is then direction-aware and needs no per-floor duplication:
  - `TravelDir = 1` and at a floor: stop if `CarCallReg[F] OR UpCallReg[F] OR NearestAbove = 0` — the last clause is the "already the highest call, so serve the opposite-direction call here" rule;
  - `TravelDir = -1`: mirror with `DownCallReg[F]` and `NearestBelow = 0`.
  A plain "stop if this floor has any call" is NOT 顺向截车: it stops on the opposite-direction call while travelling away from it.
- **Door dwell is a TON gated by the state, not by the floor**: `IF State = 2 AND NOT DoorSafety THEN DoorTimer(IN := TRUE, PT := T#2S)`. The light curtain holds the door open by keeping the timer reset; `DoorClosed` is the run permit for both motor outputs, so a door that never closes never moves the car.
- **Direction arbitration when idle**: prefer the direction that has calls; when both do, compare distances and on a tie keep `LastDir`. After serving the farthest call in the current direction, flip `LastDir` so the next request serves the opposite end first.
- **Fault latch is static, the output is a mirror**: level-sensor conflict (`Level1 AND Level2` …) or a 10 s travel-timeout sets `FaultLatch`; the reset button clears the latch and the condition re-asserts next scan if still present. `#Fault := #FaultLatch` is the only write to the output.
- **Design note, not runtime-verified**: the round deliberately kept latch state in `VAR` statics and only mirrored it to `VAR_OUTPUT`, on the (documented but not yet verified on this machine) rule that an optimized FB's output parameters are initialized at each call. Verify with a runtime test before relying on a `VAR_OUTPUT` to hold state between calls.
- **Corpus gap this round exposed**: `plc_corpus_find("电梯")` returned `totalMatches: 0` — no elevator/call-collection reference existed; the compile-verified sample is now `plc-study-library/片段/12_西门子SCL真实工程/电梯三层_顺向截车_开门驻留.scl`.

## rp-v [tooling] `tia_openness_batch` routing inputs: batch-level only — and external sources are not deletable

Real-machine evidence (E2E R006, TIA V17): the round's ONLY four failed calls were two contract mistakes and one impossible cleanup.
- **`defaults` rejects `project-match`** (`TIA_BATCH_DEFAULT_NOT_ALLOWED`) and its message says "must be set on each sub-op"; setting it per-op is then rejected by the bridge (`a batch sub-op may not set a project-match ... different from the batch-level project-match`) whose message says "pass a single project-match at the batch level". The correct answer is the batch-level field. The engine now hoists a uniform sub-op `project-match` (and `tia-version`) to the batch level and rejects a non-routing `defaults` key locally, so neither mistake costs a bridge round trip; differing per-op projects are still a hard error.
- **`PlcExternalSource` objects cannot be listed or deleted**: `delete-object` with `kind=external_source` returns `TIA_OBJECT_NOT_FOUND` for both the English (`PLC_1/External source files/src_*`) and the localized (`PLC_1/外部源文件/src_*`) group path. This is a documented engine limitation, not a wrong path — `write_source` is append-only on V16/V17, the engine already gives every write a unique source name, and re-generating a block simply overwrites it. Do not spend calls trying to clean them up; report them instead.
- **`write_source` does not return the external source's object path**, so a follow-up delete cannot even be addressed. If cleanup matters, delete the generated BLOCK (`delete-object` on the block path, which works) and leave the source object.

## rp-w [datatypes] SCL identifiers are case-insensitive: `Td : Time` and `tD : Real` are the SAME name

Real-machine evidence (E2E R007, TIA V17): `FB_PID` declared an input `Td : Time` and a temp `tD : Real`. The compile reported three errors on BODY lines — `62: Data type 'Real' cannot be converted implicitly into data type 'Time'`, `64: Operator '-' is not compatible with the data types of 'Time' and 'Real'`, `67: Data type 'Time' cannot be converted implicitly into data type 'Real'` — and nothing at the declarations, because the compiler resolved every `#tD` to the `Time` parameter.
- **The rule**: never give a local (VAR/VAR_TEMP/static) a name that differs from an interface parameter only in case, and never declare the same name twice (interface and local share one namespace per block). Use a distinct stem: `tmpTd`, `statTd`, `tD_filtered` — or rename the parameter.
- **The same trap for STL/CODESYS**: IEC 61131-3 identifiers are case-insensitive everywhere; a "typo-level" rename that only changes case is a no-op, not a new variable.
- **Diagnosis rule of thumb**: a type-mismatch error naming two types you never wrote together in one expression is almost always a name collision, not a conversion problem. Read the declaration list before rewriting the expression.
- The engine's offline pre-check now blocks this shape locally (`[TIA_SOURCE_DUPLICATE_NAME]`, same-scope only — struct fields are exempt because `#s.field` is a separate namespace), so it costs no compile round trip.

## rp-x [hardware] S7-1500 module address assignment on FIRST plug, and the AI/AQ order numbers that plug on V17

Real-machine evidence (E2E R007, TIA V17, CPU 1511-1 PN): four modules plugged and read back with `read-hardware-config`:

| Slot | Module | Order number (as plugged) | Start address read back |
|---|---|---|---|
| 2 | AI 4xU/I (pressure) | `6ES7 531-7QD00-0AB0/V1.0` | IW0 (AI starts at byte 0) |
| 3 | AQ 4xU/I (VFD frequency) | `6ES7 532-5HD00-0AB0/V1.0` | QW0 (AQ starts at byte 0) |
| 4 | DI16 | `6ES7 521-1BH00-0AB0/V1.0` | I8.0–I8.5 |
| 5 | DQ16 | `6ES7 522-1BH01-0AB0/V1.0` | Q8.0–Q8.2 |

- **Addresses are packed per module class, not per rack position**: AI occupies I bytes from 0, DI continues after it (I8.0), AQ and DQ each start at byte 0 in their own address area. Do NOT assume the S7-300/400 habit of "analog starts at byte 64" — always read `startAddress` back instead of guessing, and map tags to the read-back values.
- **The catalog still only resolves CPUs on V16/V17**; the signal-module order numbers above were supplied by hand with the `/V1.0` firmware suffix and plugged successfully (see rp-n). Keep the suffix — without it the plug is refused.
- **Digital panel IO can sit after the analog modules** (DI at slot 4, DQ at slot 5 here) — plug order follows rack reality, and the addresses follow the class packing above.

## rp-y [tooling] A source file for TIA must be CRLF (+BOM when non-ASCII), and `overwrite-external-source` must stay off

Real-machine evidence (E2E R008, TIA V17), two independent traps in one round:
- **LF-only line endings break the SCL import in a confusing way**: a model-written `.scl` (CR=0, LF=184) failed with `导入"Src_FB_CylinderSequence"完成，但存在错误。行 000035: 语法错误：设定值"VAR"无效。行 000045: 语法错误：设定值"BEGIN"无效。` The file imported cleanly after a pure CRLF conversion — the importer swallows the token after an LF-only break, so the reported lines point at innocent declarations. `write_file`/`edit_file` emit LF-only, so this is the DEFAULT case, not an edge case. The engine now normalizes CRLF (and the BOM for non-ASCII) for both the standalone and the batched `write-source`, staging a copy and never rewriting the user's file.
- **`overwrite-external-source=true` destroys the call**: the bridge creates the external source, then deletes any same-name source — its `ReferenceEquals(stale, externalSource)` guard never matches across two Openness wrappers, so it deletes the source it just created and calls `GenerateBlocksFromSource` on the disposed object: `TIA_WRITE_SOURCE_INVOCATION_FAILED: Access to a disposed object of type 'Siemens.Engineering.SW.ExternalSources.PlcExternalSource' is not possible.` Same content through `source_path` with the flag off works. The engine now always sends `--overwrite-external-source false` (it already gives every source a unique name) while keeping `--generate-option Overwrite`, so re-writing a BLOCK still replaces it.
- **Symptom-to-cause rule**: a `disposed object of type 'PlcExternalSource'` is never a stale project — it is this delete-after-create ordering. Retrying the same call with a new name does not help; drop the overwrite flag.

## rp-z [tooling] The bundled study library was partly cp1251 — a corpus file that is not UTF-8 kills the read

Real-machine evidence (E2E R008): `plc_corpus_read("片段/02_设备控制/位置控制_两点式.scl")` returned `corpus file unreadable at …: stream did not contain valid UTF-8`. Seven study-library blocks are Siemens library exports whose comments are **Russian** in cp1251 (`TITLE = 'Регулятор двухпозиционный.'`), not GBK — a GBK decode fails on them. Two fixes shipped: the seven files are now UTF-8, and `plc_corpus_read` degrades to a lossy decode with `nonUtf8: true` plus a warning instead of failing, so one bad file can never block a read. A test now asserts every indexed text entry is valid UTF-8.
- **When a corpus file will not decode**: check cp1251 before assuming GBK. `d0 e5 e3 f3 eb ff f2 ee f0` is `Регулятор`, not mojibake.

## rp-aa [tooling] Re-writing a block after a failed import: CRLF/BOM first, and never reuse the external-source name

Real-machine evidence (E2E R009, TIA V17), the exact retry ladder a model walks when a write fails:
- **Attempt 1** (LF-only, BOM-less `.scl`): `行 000006: 语法错误：设定值"VAR_OUTPUT"无效。行 000009: 语法错误：设定值"BEGIN"无效。` — the line-ending trap from rp-y. Note the reported lines move depending on the file; do not chase them.
- **Attempt 2** (same parameters): same failure. Re-sending an unchanged call cannot succeed; if the error text is identical, the fix has to change the file or the name.
- **Attempt 3** (new `_r2` name, same file): `Create … The name is not unique.` — the FIRST failed attempt had already registered the external source under the caller's name, and external sources are append-only, so the name is now taken forever. **Every write must use a fresh source name**; the engine now uniquifies both the standalone and the batched path, so pass a base name and let it rename.
- **Order that works**: fix the file (CRLF + BOM for non-ASCII) → write with a unique name → compile once → read the verdict. Both fixes now happen inside the tool.

## rp-ab [tooling] A TIA modal dialog blocks every later call with `TIA_ATTACH_AWAITING_USER_OR_BUSY`

Real-machine evidence (E2E R009, TIA V17): a whitelist/trust card paused the agent, TIA Portal meanwhile put a modal compile dialog in front (`title=编译 (0125:000006)`, `class=WindowsForms10.Window…`), and every subsequent bridge call failed with
`TIA_ATTACH_AWAITING_USER_OR_BUSY: TiaPortalProcess.Attach() is still waiting. TIA Portal may be showing a trust/modal dialog, or the selected project may still be busy loading. (timeoutMs:15000)`.
- **What it means**: the bridge never reached the project. Nothing is wrong with the source or the parameters — retrying without clearing the dialog fails identically.
- **How to clear it**: bring TIA to the foreground and close the dialog (the round did it with PowerShell + Win32 `WM_CLOSE` on the window whose title matched the dialog). Do NOT kill TIA Portal: the open project would be lost.
- **Batch ledger tells you how far the batch got**: when an attach timeout interrupts a batch, the operations ledger still records the steps that ran, so read it before re-sending — the round discovered that two of its three sources HAD landed and only the caller needed re-writing. Re-sending the whole batch then fails on `The name is not unique` (rp-aa).
- **Prevention**: keep the TIA window unobstructed and answer trust/whitelist prompts promptly; the campaign driver now auto-answers the bridge-trust card for exactly this reason.
- **Confirmed again, harder (E2E R011)**: after a whole-PLC compile the modal came back on EVERY compile, blocking three consecutive batches; the round's only recovery was `WM_CLOSE` on the dialog + killing and restarting the Portal. The engine now closes a matching modal (`WindowsForms10*` class + `编译`/`Compiling` title, WM_CLOSE only) and retries the exact bridge call once, so this no longer costs the caller a round trip.

## rp-ac [datatypes] Reading your own OUTPUT parameter before assigning it → `might not be initialized`

Real-machine evidence (E2E R004 `#Paused`, E2E R011 `#Spread`, both TIA V17): an FB body that READS one of its own `VAR_OUTPUT` members before the block has assigned it compiles, but TIA warns `The parameter '#X' might not be initialized.` during instance-DB preparation.
- **Rule**: outputs are write-only by contract. Compute into a `VAR`/`VAR_TEMP` mirror, then assign the output once at the end.
- **What is NOT a defect**: assigning an output first and reading it later is an ordinary latch (`#FaultLatch := TRUE; … IF #Ack AND #FaultLatch THEN`) and produces no warning — do not "fix" that shape.
- The offline pre-check now emits an advisory for the read-before-first-write case only, naming the line.

## rp-ad [datatypes] `SCALE_X(NORM_X(...))` is idiomatic but raises `A loss of value accuracy is possible.`

Real-machine evidence (E2E R011, TIA V17, S7-1500): three `SCALE_X(MIN:=0.0, VALUE:=NORM_X(MIN:=0.0, VALUE:=#raw, MAX:=27648.0), MAX:=150.0)` statements produced exactly three `A loss of value accuracy is possible.` warnings on OB1, one per statement.
- **Proven by three independent checks in the same round**: the warning path tracked the line numbers when three lines were inserted above; a single-line probe FC with the same three statements reproduced three warnings; the rest of the block raised none.
- **Impact is nil** for the usual 0…27648 → engineering-range mapping (relative error < 1e-6), but the acceptance criterion is often "0 warnings", so:
  - accept the warning and say why in the report, or
  - write the linear formula explicitly in REAL (`eng := (INT_TO_REAL(raw) - min_raw) * k + min_eng`), which compiled **0 errors / 0 warnings** in R007.
- **Refines occ18**: NORM_X/SCALE_X is the idiomatic, clamping-safe pair — it is not a warning-free requirement. Choose it for boundary safety, and choose the explicit REAL formula when the deliverable demands a warning-free compile.

## rp-ae [tooling] `ORGANIZATION_BLOCK "… [OB30]"` creates a WRONG OB with no diagnostic at all

Real-machine evidence (E2E R012, TIA V17, S7-1500): an external source declared `ORGANIZATION_BLOCK "Cyclic interrupt [OB30]"`. TIA took the whole quoted string as the block NAME, auto-numbered the block **OB123**, and set `SecondaryType = ProgramCycle` (confirmed by exporting the block XML). The compile reported **0 errors and no warning** — but the intended 100 ms cyclic-interrupt body ran once per scan instead, which for a flow-totalizer means a multiplied total.
- **Rule**: never encode an OB number/type in the block name. Create the OB in the project first (or import XML/SD with the OB type attributes) and write only its body from SCL.
- The offline pre-check now emits an advisory naming the block and explaining the silent mis-numbering.
- **Related trap from the same round**: exporting a block before it is consistent fails `TIA_BLOCK_INCONSISTENT_CANNOT_EXPORT` (`isConsistent: False`). Compile the block/PLC first, then export.

## rp-af [hardware] The firmware suffix on an S7-1500 module order number must be the module's OWN version

Real-machine evidence (E2E R012, TIA V17): `OrderNumber:6ES7 531-7KF00-0AB0/V2.3` (a guessed suffix) failed `TIA_CAN_PLUG_NEW_FALSE` — the same error a wrong article or wrong slot gives, so the message alone cannot tell them apart. The same article with `/V1.0` plugs (E2E R011).
- **Verified on this machine (plug + read back)**: DI16 `6ES7 521-1BH00-0AB0/V1.0`, DQ16 `6ES7 522-1BH01-0AB0/V1.0`, AI `6ES7 531-7KF00-0AB0/V1.0` and `6ES7 531-7QD00-0AB0/V1.0`, AQ `6ES7 532-5HD00-0AB0/V1.0`.
- **Practical rule**: use `/V1.0` unless the module's own firmware is known; on V16/V17 the catalog resolves CPUs only, so a signal-module version cannot be looked up — one attempt per candidate, then report the hardware gap and map the tag to the address the module WOULD occupy (the resulting `Inputs or outputs are used that do not exist in the configured hardware` warning is then expected and must be explained, not "fixed").

## rp-ag [tooling] An INSTANCE DB source may carry pragma + VERSION (R013's "four lines only" was a MISATTRIBUTION)

CORRECTED by E2E V2 R002 (TIA V17): an instance DB with the full header compiled **0 errors / 0 warnings**:

```
DATA_BLOCK "DB_SingleButtonToggle"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1
"FB_SingleButtonToggle"
BEGIN
END_DATA_BLOCK
```

- The bare four-line form (`DATA_BLOCK "DB"` / `"FB"` / `BEGIN` / `END_DATA_BLOCK`, which the bridge's own `create-instance-db` emits) is also legal. Both shapes compile.
- **What R013 actually hit**: `行 000150: 语法错误：设定值"{"无效` then `设定值"VERSION"无效` on the same shape — those were the pre-build **LF-only line-ending trap** (the importer swallows the token after an LF-only break and reports innocent lines; see rp-y), NOT the header. The round misattributed them, and a blocking precheck rule was shipped from that misattribution; it is removed. If you see a `设定值"X"无效` pointing at a `{`, `VERSION` or section keyword whose text looks fine, suspect line endings first.
- A GLOBAL DB keeps the same pragma + VERSION + `VAR … END_VAR` form.
- The offline pre-check now blocks the pragma/VERSION form on an instance-DB source, and the batched `write-source` runs that pre-check too (it previously did not — E2E R013 fed it straight to TIA).

## rp-ah [algo] 4-digit BCD → binary in SCL: nibble extraction, legality test, fail-safe output

Real-machine evidence (E2E R014, TIA V17, SCL, `FB_BcdToPulse` + instance DB + `Main`, whole-PLC compile 0 errors; `plc_corpus_find("BCD 转换")` returned 0 matches before this entry). The verified shape:
- **Extract each nibble with `SHR` + `AND 16#000F`**: `#d0 := WORD_TO_INT(#w AND 16#000F); #tmp := SHR(IN := #w, N := 4); #d1 := WORD_TO_INT(#tmp AND 16#000F);` … for N = 8 and 12. Do NOT convert the whole word with `WORD_TO_INT` — 16#1234 is 4660 in binary, not 1234.
- **Legality**: every nibble must be ≤ 9 (`#ok := (#d0 <= 9) AND (#d1 <= 9) AND …`); A–F are not BCD digits and a 4-digit BCD input of 16#00A5 is invalid, not 105.
- **Weighted sum**: `#value := #d3 * 1000 + #d2 * 100 + #d1 * 10 + #d0;` then clamp against the caller's limit (0…9999).
- **Fail-safe outputs**: on invalid BCD or over-limit, latch a fault, set `PulseCount := 0` and `Valid := FALSE`; the reset button is edge-triggered (`R_TRIG` in the STATIC area) and only clears the latch — a still-present cause re-latches on the next scan.
- Sample: `plc-study-library/片段/12_西门子SCL真实工程/BCD转二进制_合法性校验_故障锁存.scl`.

## rp-ai [datatypes] `MIN`/`MAX` on REAL arguments were REJECTED on V17 — clamp with IF instead

Real-machine evidence (E2E R016, TIA V17, SCL): five `MIN`/`MAX` calls in a stepper FB produced exactly five compile errors `Parameters of the function or the function block do not match the transferred formal parameters.` (reported line numbers 34/36/37/110/116). Replacing them with explicit `IF #x > #limit THEN #x := #limit; END_IF;` clamping compiled clean.
- **What is certain**: on this V17 install that call shape does not type-check, and the message names no parameter — it looks like a call/interface mismatch even though the FB is fine.
- **What is NOT verified**: whether the accepted form is positional-only, INT-only, or requires a different spelling; the round did not test alternatives. Do not assert a "correct MIN/MAX syntax" — clamp with IF (or write the comparison inline) when the value is REAL, and only use MIN/MAX after proving the exact form on this version.
- **Related**: a call/interface mismatch error with NO parameter named is usually a *callee shape* problem (arity/type), not a caller typo — check the FB interface before rewriting the call site.

## rp-aj [tooling] TIA compile line numbers are BODY-relative, not source-file lines

Real-machine evidence (E2E R016, TIA V17): the compiler reported lines 34/36/37/110/116, which map to source-file lines 108/110/111/184/190 — a **constant offset of 74** equal to the interface/declaration region's line count (which TIA does not count).
- **Rule**: before editing the reported line, compute `offset = (first line after BEGIN) - 1` for that block, or locate the statement by its text. Editing the raw reported line hits unrelated code.
- The offset is per BLOCK and changes whenever declarations change — never hard-code a previously observed number.
- A quick way to anchor: the compiler's first reported line is usually the first executable statement after `BEGIN`; count from there.

## rp-al [tooling] The whitelist verdict flaps — re-read it before bothering the user

Real-machine evidence (E2E R009/R010/R011/R015/R017, TIA V17): the SAME bridge binary whose registry hash matches intermittently returns `TIA_BRIDGE_WHITELIST_HASH_STALE`. The read-only `TiaOpennessBridge.exe check-whitelist --tia-version 17` run moments later reported `allTrusted: true`, `hashMatchCount: 1` — i.e. the verdict, not the registration, was wrong.
- **Consequence when it is not handled**: the engine raises a "trust the bridge" card; in R009 the unanswered card cost 17 minutes, and in R017 it wedged the renderer for 25+ minutes until the round was restarted.
- **Engine behaviour now**: on a stale-whitelist failure the engine re-runs `check-whitelist` once and, if it now says trusted, retries the original call — so a transient read no longer interrupts anyone.
- **What to do if you ever see the card for real**: trust it once (the registration appends the current hash). A genuinely stale hash means the bridge was rebuilt, which needs the same one-click trust.

## rp-am [comm] S7-1500 Modbus TCP master in SCL: MB_CLIENT's real pin set and the DISCONNECT rule

Real-machine evidence (E2E R017, TIA V17, `MB_CLIENT` in a multi-instance array `Array[1..3] of MB_CLIENT` inside an FB, whole-PLC compile 0 errors):
- **`MB_CLIENT` has 5 inputs + 2 InOut + 4 outputs**; there is **no `MB_UNIT_ID` / `IP_OCTET_*` parameter** (the unit id is an internal static). So the MBAP unit id is NOT configurable through the instance — state that limit rather than inventing a pin.
- **`MB_MODE`**: 0 = read, 1 = write. **`MB_DATA_ADDR`** uses the classic five-digit reference (e.g. 40001), not a zero-based offset.
- **`MB_DATA_LEN`** counts registers/bits according to the mode; keep it inside the slave's supported window.
- **A timed-out request stays BUSY until you DISCONNECT**: after a watchdog timeout, set `REQ := FALSE`, call `MB_CLIENT` with `DISCONNECT := TRUE`, wait for `DONE`/`ERROR`, then reconnect before the next request. Re-asserting `REQ` without the disconnect is swallowed by `BUSY` and the poller appears to hang.
- **`CONNECT` is a `TCON_IP_v4` structure** with `InterfaceId`; on a project without a device fingerprint the safe value is the one proven by the corpus (`64`), not a guess.
- **Multi-instance array + UDT InOut parameter** (`Slave : Array[1..3] of "UDT_ModbusSlave"`) compiled as-is — an FB may own several client instances and take an array of a UDT.
- **Polling scheduler shape** that compiled clean: one job index per scan alternating read/write per slave, `REQ` pulse for exactly one scan, per-slave watchdog timer, retry counter with a cap, exhaustion → fault latch, and automatic recovery when the slave answers again.

## rp-an [tooling] A batch replay after an interruption is not idempotent — resume, do not resend

Real-machine evidence (E2E R017): a modal dialog interrupted a batch mid-flight; re-sending the same batch replayed the ops that had already landed, producing 11 `skipped already-exists` tag rows and `create-instance-db … TIA_BLOCK_ALREADY_EXISTS`, which stopped the remaining ops.
- **Before re-sending**: read the operations ledger (or `tia_openness_list_blocks` / `list_tags`) and send only the ops that did not land.
- **Or** pass `continue_on_error=true` so an already-exists op cannot stop the rest — then read the per-op results.
- The engine now appends this hint automatically when a failed op's code is `TIA_BLOCK_ALREADY_EXISTS`.

## rp-ao [datatypes] The constant section is `VAR CONSTANT`, not `VAR CONST`

Real-machine evidence (E2E R018, TIA V17): an FB source that opened a constant section with `VAR CONST` failed with `行 000011: 语法错误：设定值"C_IDLE"无效` — TIA treated `VAR CONST` as a plain `VAR` section and reported the first constant NAME as an invalid set value, pointing at innocent code. The same source with `VAR CONSTANT … END_VAR` compiles.
- The real-project corpus consistently uses `VAR CONSTANT` (LGF axis FB status/error codes, GET/PUT state words, analog error codes) — treat that as the verified spelling.
- The offline pre-check now blocks `VAR CONST` and names the fix.
- Same family of traps seen in this campaign: `VAR_STATIC` (not TIA SCL), member-inline `{ … }` attributes, and `[OB30]` in an OB name — all shapes that TIA either rejects with a message pointing at the NEXT line or silently accepts with the wrong meaning.

## rp-ap [datatypes] `Name` is a reserved identifier — a UDT/DB member may not use it

Real-machine evidence (E2E R020, TIA V17): `TYPE "UDT_Recipe" … STRUCT Name : String[16]; … END_STRUCT; END_TYPE` failed with `行 000004: 语法错误：设定值"Name"无效`. Four probe types (`T_Probe_NameString`, `T_Probe_NameReal`, …) all failed on the same member line, which isolates the MEMBER NAME, not the type.
- Rename to `RecipeName`, `Name_`, `DeviceName`, … The pre-check now blocks a member named `Name` in every declaration region.
- Other reserved declaration names already known: `EN`/`ENO` (implicit block enable params) and `COUNTER`; `TIMER` is a manual-analogy word with no observed collision.
- **Probe methodology worth copying**: when a rejection names a token that could be either the type or the name, compile several minimal types that vary ONE axis (name fixed, type varying) — one round of probes is cheaper than guessing.

## rp-ak [tooling] A failed batch op's own message is worth more than the top-level envelope

Real-machine evidence (E2E R016): the batch envelope's `Error.Message` was trimmed (`…[trimmed 6994 chars]…`), so the real per-op diagnostic was invisible and the round had to spend an extra `tia_openness_compile` call to see the five errors. The engine now inlines a short excerpt of each failed op's own `Error.Message` in the error string (`[5]create-instance-db=FAILED(TIA_INSTANCE_FB_COMPILE_ERRORS: …)`), so read that line first — it usually names the diagnostic without a second call.


## rp-aq [idiom] Output interlocks need static mirrors: TIA forces outputs to be write-only

Real-machine evidence (E2E V2 R003, TIA V17, SCL traffic light): the interlock "opposite direction must not be green" naturally READS the other direction's output, and `create_instance_db`'s preparation compile warned `The parameter '#EW_Green' might not be initialized.` / `#Fault` (6 warnings, lines 43/121/123/129/131). The fix pattern, verified 0 errors afterwards:
- **Never read your own OUTPUT parameter for logic**; keep a static mirror (`statNSGreen` etc.), do all interlocking against the mirrors, and write every output ONCE at the end of the scan from its mirror.
- **Same-scan arbitration**: the north-south half computes first, the east-west half reads THIS scan's north-south mirror — so no single scan can ever drive both greens.
- **Contactor feedback** (a second layer): gate the green outputs on `NOT <opposite>_GreenFB` (the feedback input), on top of the mirror interlocks.
- **Red = NOT green AND NOT yellow** (computed, not stored) gives the fail-safe state for free: standby/fault/safety-open drives both directions red.
- **Phase table with a single active phase + per-phase timeout** (20s green / 3s flash at a 250 ms self-resetting TON / 20s / 3s) keeps the state machine a plain CASE; the 23 s red is DERIVED from the opposite phase lengths, never a magic constant.
- Compile-verified sample: `plc-study-library/片段/12_西门子SCL真实工程/红绿灯_相位状态机_输出互锁静态镜像.scl`.
- **Self-increment variant (E2E V2 R005, TIA V17, PWM FB)**: `#PulseCount := #PulseCount + 1` on a VAR_OUTPUT member warns the same way (`The parameter '#PulseCount' might not be initialized.`, path 118). The FIRST attempted fix — assigning `#PulseCount := 0` inside a `IF NOT #statInit` guard — did NOT satisfy TIA's init analysis (a conditional assignment is not "definitely assigned"), so the same warning came back on the next compile. The fix that cleared it: a STATIC counter (`statPulseCount`) + publish once at the end of the scan (`#PulseCount := #statPulseCount;`). Lesson: when the warning names an output parameter, move the state to Static FIRST — patching initialization logic inside the body is a wasted compile round.
