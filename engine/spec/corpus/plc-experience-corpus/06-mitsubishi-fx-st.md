# Mitsubishi FX ST (GX Works2/3)

> Applies to: vendor=mitsubishi family=fx3 language=st; FB instance declaration location, BOOL must be TRUE/FALSE, WDT, CASE+ELSE, mixing with LAD
> 25 items, sorted by occurrence count (occ/30), highest to lowest.


## occ30 [datatypes] ST variables must be declared in the GX Works2/3 label editor; bare device addresses cannot be used directly

GX Works2/3 ST program blocks use the label (Label) variable system: every variable must be declared with a type in the program block's or FB's Local Label table or the Global Label table before it can be used. Writing device addresses such as M100 or D200 directly in a pure ST POU raises a compile error or is parsed as a same-named user label rather than the device, which is completely different from the LAD habit of operating devices directly. To access an existing device, bind it in the label table (Assign to Device) and then reference it by label name. GX Works2 does not support writing VAR…END_VAR blocks inside the ST program body; declaration must go through the IDE label editor. GX Works3 supports a more complete IEC 61131-3 VAR section, but in practice managing everything through the label editor is still recommended. Using labels uniformly lets the compiler perform type checking and makes cross-project reuse safer.

**Pitfall**: A newcomer writes D100 := 1; or M100 := TRUE; directly in ST. GX Works2 may report 「未定义标签」 (undefined label); GX Works3 sometimes silently creates a same-named user label instead of writing to the device, so data is written to the wrong location with no warning. Also: writing a VAR…END_VAR block inside the GX Works2 ST program body raises a syntax error outright, leading newcomers to wrongly conclude the ST syntax itself is wrong.

*Source*: GX Works2 operation manual SH-080779, label programming chapter; GX Works3 operation manual SH-081215; GX Works2 Structured Text programming manual SH-080809; 工控人家园 Mitsubishi FX forum FAQ


## occ30 [edges] In ST, rising/falling edge detection must use R_TRIG/F_TRIG FB instances, one independent instance per signal

Mitsubishi FX ST has no equivalent of the LAD P/N contact or the PLS/PLF instructions; you cannot write edge contacts directly. To detect edge changes, instantiate the IEC standard FB R_TRIG (rising edge) or F_TRIG (falling edge). Each signal that needs independent edge detection must declare its own instance variable (e.g. trig1: R_TRIG;), call it unconditionally every scan cycle (trig1(CLK := sensor_on);), and then read trig1.Q. GX Works3 has both FBs built in; on GX Works2, confirm the library version and, when necessary, hand-code an auxiliary BOOL label for differencing: rising := X AND NOT X_prev; X_prev := X. Sharing one instance to detect multiple signals is the most common error: the FB's internal state is overwritten and all edge detection fails.

**Pitfall**: Multiple signals reuse the same R_TRIG instance — the instance's internal CLK_prev is repeatedly overwritten, only the edge of the last-called signal is valid, and the rest are all lost. Also: calling R_TRIG inside an IF conditional branch means the FB does not execute when the condition is FALSE, its internal state is not updated, and after re-enabling it may false-trigger or miss an edge.

*Source*: IEC 61131-3 standard library; GX Works2 ST programming manual SH-080809; Mitsubishi MELSEC iQ-F FX5 programming manual; GX Works3 structured programming manual


## occ30 [timers] In ST, timers must use TON/TOF/TP FB instances, called unconditionally and continuously every scan cycle

In GX Works2/3 ST you cannot drive a T0 coil directly the way LAD does (the OUT T0 K100 syntax is unavailable or undefined in an ST POU). The standard approach is an IEC timer FB instance: declare tmr1: TON;, then call tmr1(IN := StartCond, PT := T#5S); unconditionally every scan cycle, read the done signal via tmr1.Q, and read the elapsed value via tmr1.ET. The PT parameter is of type TIME, written like T#500MS or T#5S, never as an integer. Each independent timing requirement needs its own TON instance, avoiding T device-number range conflicts. GX Works3 recommends and, in new projects, enforces IEC FBs; GX Works2 structured projects likewise recommend this approach (some older GX Works2 versions still support the OUT_T extension instruction, but its portability is poor).

**Pitfall**: (1) Forgetting to call the TON instance every scan cycle: if the call is placed inside an IF conditional branch, the FB is not called when the condition is FALSE, its internal timing freezes without resetting, and on the next IN=TRUE it continues timing from the residual value, corrupting the timing. (2) Writing PT as integer milliseconds (e.g. PT:=500) instead of the TIME type (PT:=T#500MS): some GX Works2 versions accept it silently but the actual timing value is completely wrong; GX Works3 raises a type error. (3) Writing T0 := TRUE; to try to start a timer has no effect — the T device is treated as an ordinary BOOL in ST and the timer does not time at all.

*Source*: GX Works2 programming manual SH-080802; GX Works3 ST programming manual SH-081215; IEC 61131-3 TON function block specification; Mitsubishi FX3U hardware manual; Mitsubishi FA-A-0059 technical bulletin


## occ30 [state_machine] For ST sequential control, prefer a CASE state machine over STL/SFC; use an INT or enum for the state variable

The FX-series STL/RET step-ladder instructions can only be used in a LAD POU and cannot be called from ST. The clearest sequential-control substitute in ST is the CASE nState OF ... END_CASE structure: use an INT-type label (or the enum type GX Works3 supports) to represent the current step, have each CASE branch handle only that step's action and transition condition, and transition by assigning nState := NEXT_STATE directly. Advantages: the state logic is centralized and mutually exclusive, debugging only requires looking at the nState value to locate the current step, and adding steps means adding branches. It is orders of magnitude more readable than deeply nested IF-ELSIF and more stable than the SFC debugger (GX Works2 SFC has limits on parallel branches). Define the state variable as a global label so the LAD-side HMI can monitor the current step. Writing an explicit transition condition at the end of each CASE branch and adding an ELSE branch to catch illegal states and zero them out is a good safety habit.

**Pitfall**: (1) Forgetting the state-transition assignment (nState := ...) inside a CASE branch leaves the state stuck at the current step forever and the equipment hangs. (2) Writing an unconditional assignment after the CASE block (e.g. Motor_Run := FALSE;) overwrites all output assignments made inside the CASE branches, so the motor never starts. (3) Modifying nState within a CASE branch and then continuing to execute the rest of that branch jumps two steps in one scan; separate them with a RETURN or an ELSE structure. (4) Omitting the ELSE/DEFAULT branch means that when nState is assigned an illegal value the program idles silently with no error.

*Source*: distilled engineering judgment; IEC 61131-3 CASE statement specification; Mitsubishi GX Works2 ST programming examples; 工控人家园 FX ST sequential-control discussion threads


## occ30 [architecture] FB instances must be declared in the calling POU's local label table, one independent instance per equipment set/signal; internal VAR state is automatically retained across scans

Using a function block (FB) in GX Works2/3 takes two steps: first write the VAR_INPUT/VAR_OUTPUT/VAR variables and logic in the FB definition body; second declare an instance variable of that FB type in the calling program block's local label table, then call it in ST as InstanceName(IN1:=x, OUT1=>y);. Each FB instance has its own internal static variables (the VAR area) whose state is retained across scan cycles — this is the core difference between an FB and a FUN. When multiple equipment sets reuse the same logic, declare an independent instance for each; never share one instance and distinguish them by switching input parameters — the internal timers/counters/state flags are all shared and will inevitably interfere with each other. An FB should not access global M/D device addresses internally; pass data through the VAR_INPUT/VAR_OUTPUT interface to preserve encapsulation. GX Works2 does not support declaring FB instance types in the global label table; GX Works3 follows the same rule.

**Pitfall**: (1) Declaring the FB instance in VAR_TEMP (the temporary-variable area) resets the timers/counters every scan cycle, so the function fails completely. (2) Sharing one FB instance across multiple equipment sets shares the internal stateful FBs (TON/R_TRIG, etc.), producing random logic errors that are extremely hard to reproduce. (3) Hard-coding a global M/D address (e.g. M100) directly inside the FB makes all instances share the same device, causing mutual interference and breaking portability.

*Source*: GX Works2 structured programming manual SH-080784; GX Works3 structured programming manual SH-081215; IEC 61131-3 function block specification; distilled engineering judgment


## occ28 [scan_cycle] When mixing ST and LAD, execution order is determined by the program-block arrangement order; cross-block data is shared through global labels, and write ownership must be planned

GX Works2/3 allows LAD program blocks and ST program blocks to coexist in one project; the CPU executes the blocks top to bottom in the arrangement order set in the program settings, regardless of language. A global-label value written by an earlier-executing block is immediately visible to later blocks within the same scan cycle; if an ST block is arranged before a LAD block, the LAD output the ST reads is the previous scan cycle's old value. The only safe way to share data across blocks is the global label (Global Label); a local label's scope is limited to its own POU, and the local labels of LAD and ST are mutually invisible. Engineering rule: explicitly designate exactly one POU responsible for writing each global label (the single-writer principle); double-assigning the same output coil/label from both LAD and ST causes the later-executing block to silently overwrite the earlier one. Typical division of labor: LAD handles I/O mapping and hardware interlocks, ST handles algorithms/state machines, with one-way transfer through intermediate global BOOL labels.

**Pitfall**: (1) An ST block and a LAD block each assign the same M bit/Y output; the later-executing block unconditionally overwrites the earlier one every time, the logic fails, and the cause is extremely hard to find from either side's code alone. (2) Arranging an ST block that depends on upstream LAD results before the LAD block makes the ST always process the previous scan cycle's stale sensor value, producing a one-scan-delay race bug — yet the monitored values look normal during debugging (monitoring reads at the end of the scan).

*Source*: GX Works2 operation manual SH-080779, program execution order chapter; GX Works3 programming manual SH-081215, program execution order chapter; distilled engineering judgment


## occ27 [datatypes] In ST, BOOL variable assignment must use TRUE/FALSE, not the integers 1/0

The GX Works2/3 ST compiler strictly distinguishes the BOOL type: BOOL and INT are entirely different types with no implicit conversion (unlike the lax behavior of Siemens SCL). An assignment must be written MyFlag := TRUE; or MyFlag := FALSE;; writing MyFlag := 1; raises a type-mismatch compile error in GX Works3, while some GX Works2 versions compile it but behave abnormally at run time. The same applies to comparisons: IF MyFlag = 1 THEN errors in some versions; write IF MyFlag = TRUE THEN or simply IF MyFlag THEN.

**Pitfall**: Engineers migrating from a LAD, Siemens SCL, or C/Java background habitually write := 1 or = 1; older GX Works2 versions compile it but the run-time comparison behaves abnormally with unintuitive error messages. When porting code in bulk, globally replace := 1 with := TRUE before compiling.

*Source*: IEC 61131-3 §2.4.3; GX Works2 ST programming manual SH-080802/SH-080811; distilled engineering judgment; widely documented on 工控人家园 and Mitsubishi user groups


## occ26 [architecture] FB internal state variables must use VAR (static); VAR_TEMP is cleared every scan and cannot retain state

GX Works2/3 distinguishes FB variables: VAR-area variables are held statically between scan cycles (they survive across scans); the VAR_TEMP area is cleared before each FB call (temporary values). Every variable that must retain state across scans — timer instances, counter instances, step numbers, edge auxiliary bits, integral accumulators — must be declared in the VAR area, not in VAR_TEMP. VAR_TEMP is only suitable for pure-computation intermediate values. The FB instance itself must also be declared in the calling POU's VAR (not VAR_TEMP), otherwise the FB's internal state is lost every scan. When power-off retention is needed, use VAR RETAIN and confirm it is allocated to the retentive memory area (for FX3, the D-area retentive range).

**Pitfall**: (1) Declaring a TON timer instance in VAR_TEMP resets the timer every scan cycle so it never times out. (2) Putting the FB instance in the caller's VAR_TEMP clears the TON/R_TRIG internal state every scan, showing up as the function working intermittently. (3) Power-off retention: putting counters/accumulators in an ordinary VAR rather than VAR RETAIN zeroes them after power-up, losing production data.

*Source*: IEC 61131-3 §2.4.3 Variable retention; GX Works3 ST programming guide SH-081893; GX Works2 structured programming manual SH-080784; distilled engineering judgment


## occ25 [scan_cycle] ST assignments execute in order and take effect immediately; for multiple assignments to the same variable the last one wins — fundamentally different from LAD's parallel-scan semantics

ST executes in code order; an assignment to a variable takes effect immediately, subsequent statements can read the new value, and the last assignment statement wins. In LAD, if the same coil appears multiple times the last network's value takes effect (last-write semantics), but all networks are evaluated in parallel; ST executes strictly in order, and IF-ELSIF executes only the first satisfied branch and skips the rest — fundamentally different from LAD's "all networks are scanned". When translating LAD logic to ST: (1) if two independent conditions drive the same output coil in LAD, rewriting them as two separate IF assignments lets the second unconditionally overwrite the first, so they must be merged with OR logic; (2) parallel alarm detection must not be written as an IF…ELSIF chain, otherwise only the highest-priority alarm is set.

**Pitfall**: (1) Writing an unconditional assignment after the CASE block overwrites all outputs set inside the CASE, leaving you baffled when reading the ST code during debugging. (2) Writing parallel alarm detection as an IF…ELSIF chain sets only the highest-priority alarm in a given scan and loses the others. (3) Reversing the SET/RST order when porting LAD locks the output in the wrong state after power-up.

*Source*: IEC 61131-3 §2.6.2 Sequential execution of ST; distilled engineering judgment; MELSEC FX5 ST programming manual, execution-order notes


## occ22 [architecture] Label variables are not retained on power-off by default; use VAR RETAIN or check Retain at declaration

FX3U/FX3G label variables are not retained on power-off by default. Unlike directly using D-area/M-area devices, whose retentive range can be set in bulk in the system parameters, label variables must each be declared VAR RETAIN (GX Works3) or have the 「Retain」 option checked in the GX Works2 label editor. This is the most commonly overlooked difference when migrating from device programming to label programming. If parameters are stored in an FB's internal VAR, they must also be declared VAR RETAIN in the FB definition, and the FX CPU's retentive memory allocation must be confirmed.

**Pitfall**: After power-up, process parameters (recipe values, accumulators, step numbers) are zeroed; continuous-run debugging looks fine, and the problem only surfaces after a power cycle, making the root cause hard to locate in the field.

*Source*: GX Works3 operation manual SH-081215ENG Chapter 4 Label Programming; distilled engineering judgment


## occ20 [datatypes] FX ST distinguishes integer types INT (16-bit)/DINT (32-bit); when binding to the D device (16-bit word), the width must match

The FX-series D register is a 16-bit word. Label type INT corresponds to a single word (binds one D), and DINT to a double word (binds two adjacent D, low word first). REAL (32-bit single-precision float) likewise needs a double-word D. In an ST expression, multiplying two INTs may already overflow before being assigned to a DINT, so cast explicitly first: result_dint := DINT(a) * DINT(b). GX Works2 defaults integers to INT (16-bit); beyond the ±32767 range you must actively switch to DINT. Assigning a REAL to an INT does not raise an automatic-truncation warning; convert explicitly with REAL_TO_INT(). GX Works2 ST for FX does not support 64-bit LREAL/LINT.

**Pitfall**: (1) A DINT label bound to only one D register writes its high 16 bits into the adjacent D; if that address is used by other logic, data is trampled, and the fault appears randomly and is extremely hard to trace. (2) Writing D0 * D2 assigned to a DINT for analog-to-engineering-value scaling overflows in the INT domain during multiplication, producing wrong results. (3) Assigning a REAL result directly to an INT label silently loses the fractional part and may overflow.

*Source*: GX Works2 programming manual SH-080809 Chapter 4, data types and device binding; Mitsubishi FX3U programming manual JY997D16601, data types chapter; MELSEC FX3U/FX3UC programming manual JY997D26301


## occ18 [scan_cycle] In ST, FOR/WHILE loops complete synchronously within a single scan; a long loop causes a watchdog (WDT) timeout stop

FX-series PLCs execute single-threaded scans; a FOR/WHILE/REPEAT loop in ST runs entirely and synchronously within one scan cycle, with no suspend-and-resume mechanism. The FX default watchdog time is 200ms (adjustable); iterating a large array (e.g. FOR i:=0 TO 999), complex floating-point computation, or mistakenly waiting for an external condition inside a loop (WHILE NOT Done DO) can easily push the scan time past the WDT threshold, causing a CPU error stop (ERR light on). Solution: split a large loop into a time-sliced algorithm that processes N elements per scan, recording progress in a static label; only use a loop once it is confirmed to be a short pure-computation loop (under 100 iterations, no FROM/TO communication instructions). Do not write an unbounded WHILE TRUE loop in ST to wait for an external signal.

**Pitfall**: (1) FOR i:=0 TO 9999 when there are actually only 100 elements: the loop spins idly and triggers a WDT stop, and the fault code points at the loop line, misleading newcomers into thinking it is a memory problem. (2) With small data volumes during testing the loop is fast and does not trigger the WDT; the WDT stop only appears after deployment when the data volume grows or CPU load rises, and is extremely hard to reproduce in the field. (3) WHILE NOT sensor DO waits for a sensor signal that the LAD block only writes at the end of the scan, so the loop never exits and the CPU immediately WDT-stops — the most common trap for engineers coming from a C/Python background.

*Source*: distilled engineering judgment; Mitsubishi FX5U user manual JY997D56601; Mitsubishi FX3U programming manual JY997D16601, WDT chapter


## occ17 [naming] Label naming uses a three-part "equipment_function_attribute" scheme plus a type-prefix convention, with strict layered management of global/local labels

For FX ST projects, label naming is recommended to follow a three-part scheme: equipment-abbreviation_function-description_attribute, e.g. Conv1_RunCmd_B (B=BOOL), Pump2_Speed_I (I=INT). Type-prefix convention: b=BOOL, n/i=INT/DINT, r=REAL, st=STRUCT, fb=FB instance. Global Labels are used for I/O and state shared across program blocks; adding a module prefix such as g_ or GVL_IO_/GVL_DB_/GVL_CMD_ is recommended. Local Labels are used for intermediate variables inside an FB or a single block. GX Works2 label names support only ASCII characters; a Chinese-character label name fails compilation outright. GX Works3 supports Unicode, but the text may become garbled when exporting CSV or reading via the Openness API, so use English/pinyin abbreviations uniformly for project label names and put Chinese in the comment field. GX Works3 label names are case-sensitive (Works2 is not); watch for case-induced duplicate-definition errors during migration. Avoid naming labels in the device reserved-prefix format (D100, T0, M0, etc.) or as ST keywords (AND/OR/NOT/IF/FOR, etc.).

**Pitfall**: (1) Giving global labels generic names like Start or Stop, with multiple equipment sets each creating a same-named label: GX Works2 compiles it but they overwrite each other at run time, and equipment interlocking shows inexplicable lockups. (2) When a global label and a local label share a name, GX Works2/3 gives the local one priority and masks the global; the ST program block accesses the local copy, the global label is never written, and the HMI-monitored global label never changes. (3) A GX Works3 project using Chinese labels: when migrated to GX Works2 or exported to a third party the label names become garbled, and the entire project must be renamed.

*Source*: distilled engineering judgment; GX Works2/3 programming-convention documentation; 工控人家园 Mitsubishi forum user feedback; IEC 61131-3 naming recommendations


## occ16 [interlock_safety] Interlock conditions should be computed centrally into a boolean label at the top of the ST; the final output assignment determines the result; put safety interlocks in a separate LAD block

ST's sequential-execution semantics mean the last of multiple assignments to a variable wins. Core principles of safety-interlock design: (1) at the very front of the ST program, uniformly reduce conditions such as emergency-stop, overload, and door-access into safety_ok := NOT estop AND NOT overload AND door_closed;, and reference only safety_ok in later CASE branches without re-evaluating; (2) ensure the interlock assignment comes after the output assignment (or is merged into part of the conditional expression), otherwise a later unconditional assignment overwrites the interlock and defeats it; (3) put the emergency-stop/safety circuit in a separate LAD block rather than an ST block, so electrical maintenance staff can quickly confirm the circuit state in the familiar LAD view, and the LAD safety circuit is unaffected when the ST block malfunctions. Each physical output is assigned in exactly one place (centralized in an "output summary block"); elsewhere, express intent through intermediate BOOL labels and then merge with OR/AND.

**Pitfall**: (1) Scattering interlock conditions across every CASE branch: miss updating one branch during a change and that step bypasses the interlock and keeps running. (2) Assigning the output label in scattered places inside an FB with a later unconditional assignment still present makes the interlock completely ineffective, with no compiler warning. (3) Writing the emergency-stop interlock inside an ST-block IF statement: when the ST block hangs due to a bug or restarts on a watchdog trip, the emergency-stop logic has a one-scan-cycle blind spot during the restart.

*Source*: distilled engineering judgment; IEC 62061/ISO 13849 safety-control-logic design principles; 工控人家园 safety-circuit discussion threads


## occ15 [maintainability] When mixing LAD and ST, divide responsibilities clearly: ST writes algorithms/state machines, LAD writes I/O mapping/safety interlocks, and FBs encapsulate repeated logic

GX Works2/3 supports mixing LAD and ST program blocks in one project. Best-practice division of labor: LAD program blocks handle hardware I/O mapping (physical address → label), emergency-stop interlocks, and simple coil driving, keeping them readable to electrical engineers; ST program blocks handle logic-intensive tasks such as process algorithms, PID computation, communication-protocol parsing, and state machines. The two transfer data one-way through global labels, with a clear single writer for each label. When the same control logic is used for multiple axes/valves, encapsulate it as an FB: the internal VAR variables are retained independently per instance, changing the logic only requires editing the FB definition for it to take effect everywhere, and the maintenance cost is far lower than copy-pasting ST code segments and changing addresses. ST blocks are recommended to be split at single-function/single-equipment granularity, 50–150 lines each; an overly long single block causes online-monitoring lag and forces a full-block recompile for one change.

**Pitfall**: (1) Putting the emergency-stop/safety circuit in an ST block: electrical maintenance staff cannot quickly confirm it in the familiar LAD view, troubleshooting time in an emergency lengthens dramatically, and a safety hazard exists. (2) Writing the whole project as one 2000-line ST block causes online-monitoring lag and forces a full-block recompile and download for one change — extremely risky. (3) Using global labels to share state inside an FB breaks encapsulation and, with multiple instances, causes mutual contamination.

*Source*: distilled engineering judgment; 工控人家园 Mitsubishi mixed-programming discussions; Mitsubishi iQ Works mixed-programming application guide


## occ14 [scan_cycle] An ST program block executes in full every scan; IF conditions are re-evaluated each cycle, and a condition that stays TRUE re-triggers every scan

An ST POU executes all statements unconditionally every scan cycle; there is no LAD-coil "power-flow control" mechanism. When conditional execution is needed, control it explicitly with IF…THEN…END_IF. This is especially true for single-shot logic (writing a parameter, sending a command, pulse output): while the IF condition stays TRUE it executes every scan cycle, so you must implement edge detection yourself — save the previous cycle's state, detect a rising edge with (bIn AND NOT bIn_prev), and update bIn_prev := bIn at the end. Omitting edge detection so that a counter/state machine re-triggers every scan is the most common cognitive blind spot when moving from LAD to ST. Also: assigning TRUE to a BOOL label inside an IF block only holds during the scan cycles where the condition is met; when the condition is not met, ST does not automatically set it FALSE (unlike a LAD coil), so assign FALSE explicitly in the ELSE branch.

**Pitfall**: (1) IF bStart THEN MOV(K100, D0); with bStart held TRUE by an external signal for several seconds writes D0 thousands of times in a row, disrupting debugging. (2) An alarm label set inside an IF condition does not auto-reset after the condition disappears, so the alarm stays latched; an ELSE branch or a SET/RESET pair is needed. (3) Forgetting to add an ELSE branch when migrating from LAD makes an ST output hold its previous value when the condition is not met — looking normal but actually a hidden latching error.

*Source*: IEC 61131-3 §3.3.1; distilled engineering judgment; Mitsubishi GX Works3 help file


## occ12 [maintainability] An FB's VAR_OUTPUT must be assigned explicitly on all execution paths; VAR_IN_OUT must be passed a writable label variable, not a constant or expression

An FX ST FB's output variables (VAR_OUTPUT) have no auto-clear mechanism: if an execution path (especially an early-return path with RETURN) exits without assigning VAR_OUTPUT, that output holds the previous scan's value (output stickiness). Best practice is to assign all VAR_OUTPUT their default values (FALSE/0) at the start of the FB before doing the conditional logic. VAR_IN_OUT (a bidirectional pin) is implemented in GX Works2 as pass-by-address/reference; at the call site it must be bound to a writable label variable and cannot take a constant or expression result (e.g. FBInst(Speed := CalcSpeed * 10) is illegal) — store the computed result in an intermediate label first, then pass it. VAR_INPUT and VAR_OUTPUT are pass-by-value (copied), so large arrays should use VAR_IN_OUT to avoid copy overhead.

**Pitfall**: (1) A RETURN early-exit inside an IF branch leaves VAR_OUTPUT outside the branch unassigned, so the caller reads stale data — the fault manifests as hard-to-reproduce "output stickiness". (2) FBInst(Speed := CalcSpeed * 10) errors at compile time or does not update at run time; you must first do Temp := CalcSpeed * 10; FBInst(Speed := Temp).

*Source*: distilled engineering judgment; IEC 61131-3 FB parameter-passing specification; GX Works2 structured programming manual SH-080780ENG §VAR_IN_OUT


## occ10 [pitfall] In ST, IF/AND/OR do not guarantee short-circuit evaluation; function calls with side effects must be split into separate statements

The IEC 61131-3 standard does not specify short-circuit evaluation behavior for AND/OR, and the Mitsubishi GX Works ST compiler does not guarantee short-circuiting in its implementation. If you write IF (sensor_ok AND Read_Value(addr)) THEN, Read_Value may still execute even when sensor_ok is FALSE. Function-block calls with side effects (reading hardware, incrementing a counter, sending a communication frame, etc.) must be split into separate statements: assign to a temporary variable first, then use that temporary in the IF condition.

**Pitfall**: Nesting a side-effecting function-block call inside an IF condition, expecting "it won't run when the condition is false", while it actually executes every scan cycle, causing abnormal counter increments or communication frames sent unexpectedly.

*Source*: IEC 61131-3 Section 7 expression evaluation; distilled engineering judgment


## occ10 [pitfall] The ST assignment operator is := not =, comparison uses =, inequality uses <>; confusing them is a frequent syntax error

In ST the assignment operator is :=, equality comparison is =, and inequality is <> (you cannot write !=). Writing IF x := TRUE THEN as an assignment is flagged by the compiler; conversely, Output = TRUE (which should be Output := TRUE) is treated as a comparison expression rather than an assignment in some compiler versions, so Output never changes. This is the most concentrated syntax-confusion point for engineers coming from C/Java/Python and appears very frequently in code review.

**Pitfall**: Output = TRUE is treated as a comparison expression (returning BOOL) rather than an assignment in some compiler versions; Output never changes, there is no compile warning, and it is extremely hard to find during debugging.

*Source*: IEC 61131-3:2013 §6.7.2 assignment statement; distilled engineering judgment


## occ9 [analog_scaling] When doing analog engineering-value scaling in ST, use a REAL intermediate variable to avoid integer-division truncation

The FX A/D module's raw value is an INT (0–4000 or 0–32000 range); when scaling to a physical quantity you must INT_TO_REAL first and then divide, otherwise integer division truncates the fractional part. Full chain: raw_real := INT_TO_REAL(raw); eng := (raw_real / 4000.0) * (max_val - min_val) + min_val; then REAL_TO_INT the result as needed or pass the REAL directly to PID. Mitsubishi ST has a built-in ABS function usable directly on REAL. The REAL type follows IEEE 754 single-precision float; do not compare floats directly with =, use ABS(x - target) < epsilon instead.

**Pitfall**: (1) Writing eng := (raw / 4000) * range is all INT arithmetic; raw below 4000 divided by 4000 always yields 0, so the entire analog chain outputs 0. (2) Using = to judge that an analog PID setpoint has been reached makes the condition never trigger, and the production line hangs waiting while the monitoring screen shows the value has apparently been reached.

*Source*: distilled engineering judgment; IEC 61131-3 arithmetic rules; Mitsubishi FX5 instruction manual, ABS entry


## occ8 [mode_control] When switching between manual/automatic mode, intermediate state must be cleared, and mode values should use named constants rather than magic numbers

In FX projects, writing magic numbers directly for mode switching (manual/automatic/homing) is hard for maintainers to understand and easy to mistype; define named constants (GX Works3 supports the enum type; GX Works2 uses INT constant labels instead). When switching modes you must simultaneously reset the state-machine variable nState:=0, clear timers, and clear intermediate flags, otherwise residual state causes the equipment to make unexpected moves when the new mode starts. This is one of the most common debugging traps in the automation field.

**Pitfall**: Not clearing nState when switching from automatic back to manual: the next switch to automatic continues from the intermediate state, and the equipment skips steps, causing mechanical interference.

*Source*: distilled engineering judgment


## occ7 [counters] In FX ST, ordinary counters use OUT_C/RST; high-speed counters C235..C255 cannot be assigned directly or driven by OUT_C in ST

Ordinary counters C0..C199 in GX Works2 ST are driven with OUT_C(C0, K10) and reset with RST(C0), the same operation mode as timer devices. High-speed counters C235..C255 are driven by hardware interrupts; ST can only read the current value and reset with RST, and cannot set the preset value with OUT_C (the preset value is configured in the parameter settings). Mistakenly assigning to C235 in ST or driving a high-speed counter with OUT_C compiles but behaves abnormally at run time.

**Pitfall**: Using C235 := 0 to try to clear a high-speed counter has no effect and raises no error, causing position-control zeroing to fail.

*Source*: FX3U programming manual JY997D16601, high-speed counter chapter; GX Works2 ST reference SH-080811


## occ6 [comm] In GX Works2 ST you cannot directly call LAD-only communication/module instructions (RS/FROM/TO/IVCK, etc.); wrap them in a LAD subroutine

FX-series serial-port/CC-Link/special-function-module instructions (such as RS, FROM, TO, IVCK, ADPRW) are LAD/IL-only and cannot be called directly in GX Works2 ST. The correct approach is to wrap these instructions in a LAD POU (using M bits as enable and done flags), with the ST program triggering by setting/resetting the M bit and reading the done flag and result data registers. GX Works3 is improved but some special instructions still have this restriction. Accessing special registers (SD/SM) must also go through a global-label mapping; you cannot write SD8012 := 1000 directly inside an ST POU.

**Pitfall**: Writing RS(D100, D200, K10, D300, K10, M0); directly in ST reports 「未定义指令」 (undefined instruction) or the communication simply does not trigger; writing SM400 := TRUE; in ST thinking you are operating the always-ON relay actually just creates a same-named local BOOL variable that affects no hardware.

*Source*: Mitsubishi FX3U programming manual JY997D16601; 工控人家园 GX Works2 ST communication discussions; distilled engineering judgment


## occ5 [datatypes] FX ST's supported data-type ceiling: BOOL/INT/DINT/REAL/WORD/DWORD/STRING; LREAL/LINT are not supported; ARRAY must be declared statically

GX Works2 ST for the FX series supports IEC base types including BOOL, INT (16-bit), DINT (32-bit), REAL (32-bit single-precision), WORD, DWORD, and STRING (about 32 bytes on FX3U, specifiable as STRING[n]). It does not support 64-bit LREAL and LINT (embedded-CPU hardware limitation). It does not support ANY_ generic parameters, nor dynamic arrays; an ARRAY declaration must give static lower and upper bounds (e.g. ARRAY[0..9] OF INT), and an out-of-bounds index raises no compile-time error but reads/writes out-of-bounds data at run time, silently corrupting adjacent variables.

**Pitfall**: An out-of-bounds ARRAY index raises no run-time exception and silently corrupts adjacent variables; assigning a REAL result to an INT gives no auto-truncation warning and silently loses the fractional part and may overflow, so use REAL_TO_INT() explicitly.

*Source*: GX Works2 Structured Text Programming Manual SH-080893ENG §2 Data Types; MELSEC FX3U/FX3UC programming manual JY997D26301


## occ4 [pitfall] GX Works2 ST support for IEC features such as RETURN and VAR_IN_OUT is incomplete; GX Works3 supports them fully

GX Works2's implementation of IEC 61131-3 ST is incomplete: using a RETURN statement to exit early in an FB or FC causes a compile error or undefined behavior in some GX Works2 versions; GX Works3 supports RETURN more completely. Timer usage also differs between GX Works2 and GX Works3 / FX5U: GX Works2 FX2N/FX3U projects still rely on the device elements T0..T255 to operate timers in ST, written as OUT_T(T0, K100) and RST(T0), whereas GX Works3 FX5U recommends TON/TOF function-block instances; mixing the two styles causes an outright compile error whose message points to a function block not found, easily misleading the troubleshooting direction.

**Pitfall**: Porting an FB containing RETURN from CODESYS or TIA to GX Works2 compiles but behaves abnormally at run time; moving GX Works3 TON syntax into a GX Works2 project, or OUT_T syntax into a GX Works3 FX5 project, both report an undefined function block and are hard to diagnose.

*Source*: distilled engineering judgment + community reports; Mitsubishi GX Works2 known-limitations documentation SH-080785; GX Works2 ST programming reference SH-080811; GX Works3 FX5 programming manual JY997D56101
