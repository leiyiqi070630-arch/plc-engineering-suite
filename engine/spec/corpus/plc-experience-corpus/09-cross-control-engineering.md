# Vendor-Independent Control Engineering Approach

> 2026-09-18 scope correction: these are optional design patterns, not universal requirements or certified safety designs. User requirements, current platform contracts and evidence take precedence. For scan-order examples and a requirement-led review use `16-control-logic-design-review.md`.
> Applies to: all routes; layered architecture / state-machine sequencing / single output ownership / scan cycle / manual-auto-maintenance modes / power-on initialization
> 13 items, ordered by occurrence count (occ/30) from high to low.


## occ30 [architecture] Three-layer architecture: sensing / logic / actuation with strict one-way dependency

For a multi-responsibility program, separate input normalization, process decisions and final output arbitration, with clear data flow and explicit interfaces. These can be regions/networks of one small block or separate reusable blocks when responsibility justifies it; a short single-purpose job need not acquire a three-block framework. Keep physical-output ownership explicit and preserve the existing project convention. TIA FC/UDT examples are not portable requirements for every route.

**Pitfall**: Most common mistakes: referencing physical I/O addresses directly in the logic layer (e.g. %I0.0, X0, %Q/%Y), which forces a full search-and-replace on every hardware change and is very easy to miss; or driving output coils directly in the sensing layer, bypassing the interlock layer and disabling safety logic; or mixing writes across all three layers so the same output is driven in several places, creating overwrite races that are hard to trace.

*Source*: Distilled engineering judgment; IEC 61131-3 structured programming conventions; PLCopen function-block design principles; Siemens SIMATIC Programming Guidelines FA-00036


## occ30 [architecture] Single output ownership: each physical output may be written from exactly one place in the code

Any physical output (a coil, an AO channel, a drive setpoint word) may have only one write point in the entire program. If several code sections write the same output, the last writer at the end of the scan cycle overrides all the others — in LAD this shows up as a Double Coil, which Siemens TIA Portal flags as a compile warning but still allows to download, while Mitsubishi GX Works overrides silently. Correct approach: gather all conditions that affect the output into an internal intermediate variable first (OR/AND/priority arbitration), then assign it to the physical output in exactly one place in the actuation layer. The output arbitration structure is: Safety_Interlock AND (AUTO_MODE ? Auto_CMD : MAN_CMD). With single ownership, diagnosing an output anomaly means looking at one write point only; a manual/auto switch changes which request is accepted rather than fighting over control of the coil.

**Pitfall**: The manual-mode block and the auto-mode block each drive the same Q output coil; whichever is scanned later overrides the other, so manual operation is silently overridden by the auto logic; in LAD, a coil for the same Q address appears in two different networks, and the protective de-energize in the first network is overridden by an unconditional energize in the second — a classic root cause of safety incidents.

*Source*: Distilled engineering judgment; Siemens TIA Portal Programming Guideline FA-00036 chapter 4; IEC 61131-3 Output Coil uniqueness convention; Allen-Bradley/Rockwell LAD programming guide; PLCopen compliance checklist


## occ30 [state_machine] Explicit persistent state and deterministic transitions

For sequential behavior, use explicit persistent state, named transitions and entry/exit actions. An enum/integer with CASE or an equivalent one-hot design is acceptable if invalid states are handled and transitions cannot cascade unintentionally within one scan. Evaluate a state snapshot and commit once, or prove equivalent scan ordering. Timeouts belong to waits with a required deadline; idle or waiting for an operator may be indefinite. Derive recovery and retained-state handling from the process requirements.

**Pitfall**: Expressing state as a combination of multiple boolean flags (bRunning/bHeating/bCooling, etc.) produces 2^n theoretical combinations, many of them illegal intermediate states; describing the sequence with many SET/RESET coils scatters the interlock relationships across the whole program so the current step cannot be traced; replacing the state machine with a cascade of chained timers lets the sequence keep advancing after an equipment fault, with no way to pause/roll back and no way to tell which step is current.

*Source*: Distilled engineering judgment; IEC 61131-3 SFC semantics; OMAC PackML ISA-88 state model; PLCopen Motion Control standard


## occ30 [architecture] Power-on initialization: a first-scan flag drives all state variables and outputs to a known safe initial state

Define cold-start, warm-restart and STOP-to-RUN behavior for the actual platform. Separate retained process data (recipes, totals or state required by the user) from transient command, edge and timer state; do not clear all retained data indiscriminately. Validate restored state against actual feedback and define whether acknowledgement or rehoming is needed. Initialize transient state deliberately using supported startup mechanisms. A generic one-shot is not proof of a platform first-scan event. The process-safe output state may require continued holding, braking or cooling rather than all outputs OFF.

**Pitfall**: Omitting initialization: after a warm restart the retentive step number is still the intermediate step from the last shutdown, and the program runs straight from an intermediate state; retentive variables keep old-version values after a program change, but the new state-machine enum meanings have changed, so an old value triggers a wrong state jump; initializing only the state-machine step number while forgetting to clear timer coils and counter presets leaves residual timer time after restart, causing the first step to jump immediately.

*Source*: Distilled engineering judgment; Siemens S7-1200/1500 System Manual OB100 startup organization block; Mitsubishi FX M8002 first-scan pulse documentation; IEC 61131-3 initial-value concept


## occ30 [mode_control] Required operating modes and explicit handover

Implement only the operating modes the task requires. If several modes exist, arbitrate them into one effective mode with explicit transitions and handover conditions. An enum or validated mutually exclusive bits can both work. Define which requests/state are retained, stopped or restarted during transfer; do not assume Auto-to-Manual is always safe or that every transition must reset to step zero. Manual/jog must use the same final interlocks as automatic operation. Maintenance and any bypass require their own explicitly specified scope; do not invent them.

**Pitfall**: Not clearing Step when switching to Auto lets the auto sequence start from an intermediate step, skipping the homing/return-to-origin action and causing equipment collision or scrapped product; representing the mode with two BOOLs (bManual/bAuto) means both are FALSE at the instant of switching and the output layer enters an undefined branch; maintenance-mode bypass logic scattered across many places leaves one spot un-reset after maintenance, so a safety-door interlock fails during production.

*Source*: Distilled engineering judgment; IEC 62443 operating-mode security requirements; OMAC PackML Mode/State model; ISO 11161 safety integration; ISA-88 operating-mode definitions


## occ30 [interlock_safety] The interlock layer is independent of the sequencing layer: safety conditions are applied in series in the actuation layer, not embedded inside the state machine

Safety interlocks (E-stop, overtemperature, overpressure, door-open detection, overload relay) should not be embedded inside the transition conditions of the individual state-machine steps, but applied together in series at the output-write stage of the actuation layer: even if the state machine commands the output ON, if an interlock is not satisfied the output is forced OFF. The output-layer structure is: Process_Request AND Safety_OK AND NOT_Fault → Q_Output. Place the interlock layer immediately before the output; keep its logic simple (pure AND gates) and memoryless (pure combinational logic), guaranteeing that whenever a condition is not met the output is 0. When an interlock is bypassed there must be an HMI alarm and a timestamp record; silent bypass is not allowed. Hardware interlocks (E-stop) should cut the physical circuit directly (a normally-closed contact in series with the contactor coil), with the program interlock as a second supplementary layer, not a replacement. Express interlock conditions in positive logic: output = permit conditions AND NOT fault conditions (rather than enumerating forbidden conditions).

**Pitfall**: Writing the E-stop condition as IF EmergencyStop=FALSE THEN Output:=TRUE means that when the cable breaks, EmergencyStop defaults to FALSE and the output stays TRUE instead; interlock conditions scattered across the transition conditions of individual state-machine steps require touching every step when adding an interlock, and missing one leaves a safety hole; enumerating negative-logic interlocks means forgetting the NOT when adding a new safety sensor, silently dropping the interlock.

*Source*: Distilled engineering judgment; IEC 62061/ISO 13849 functional-safety fundamentals; IEC 61511 safety instrumented systems; NFPA 79 electrical standard for industrial machinery; SISTEMA safety-circuit analysis methodology


## occ30 [scan_cycle] Scan ordering, persistent edge state and platform timebases

For ordinary cyclic process-image logic, inputs are sampled, logic executes in order, and outputs are refreshed on the configured schedule. Confirm target/task/immediate-I/O exceptions instead of assuming a universal scan model. A write to an internal variable or output image can be read by later logic in the same scan; physical feedback is separate. Persistent edge memory detects a change across calls. Call cyclic timer/edge FBs on every owning-task scan, including inactive inputs; skipping the call does not reset state. Use supported timers/timebases; scan counts represent time only under an explicitly bounded fixed-period task contract. Pulses too short to sample need supported high-speed capture.

**Pitfall**: A level-controlled increment executes every scan, but IEC CTU/CTD instructions generally already detect input edges; check the target instruction before adding another edge stage. Reading the output image is not observing a contactor or sensor. Reusing an edge instance for several signals, or skipping a timer outside one CASE state, corrupts the intended cross-scan history.

*Source*: IEC 61131-3 standard execution model; Siemens S7-1200/1500 System Manual scan-cycle chapter; Mitsubishi MELSEC iQ-R programming manual execution-order chapter; input/output image areas are documented in every vendor's CPU manual


## occ28 [maintainability] Symbolic programming + comments + function-block encapsulation trio: naming is documentation, no bare addresses, instantiate FBs for similar equipment

Every physical I/O point, intermediate variable, and timer must have a descriptive symbolic name (suggested format: location_object_action/state_type, e.g. PUMP1_RunCmd_Bool, TANK2_LevelHigh_Bool) and a comment; never use bare addresses in the logic (e.g. %I0.0, X0, Q0.0). Each I/O address appears exactly once in the I/O mapping table and is assigned to a symbolic variable, so a hardware change touches only the mapping table and the logic layer changes nothing. Comments should state why, not what. All magic numbers (state values, timeouts, ranges) must be extracted into symbolic constants (STEP_RUNNING=10, TEMP_MAX=85.0). Encapsulate the control logic of similar equipment (motors, valves, conveyor segments) as an FB, instantiate one DB per unit, pass data through IN/OUT/IN_OUT parameters, and never access absolute addresses internally — a behavior change touches the FB in one place, and adding equipment only requires a new instance. Give the state machine one diagnostic output bit per state mapped to the HMI, so maintenance staff can tell the current step without opening the programming software.

**Pitfall**: Programming with bare addresses forces a full search-and-replace on equipment modification and is very easy to miss; comments never updated after the first version describe old behavior while the code logic has changed, misleading maintenance; copy-pasting networks per unit and editing addresses by hand misses a unit when fixing a bug; hardcoding a global DB address inside an FB makes all instances operate on the same data set when reused.

*Source*: Distilled engineering judgment; IEC 61131-3 symbolic-programming recommendation; Siemens SIMATIC Programming Guideline naming-conventions chapter; Mitsubishi GX Works2 Label programming recommendation; PLCopen modular-programming guide; OMAC PackML naming conventions


## occ26 [mode_control] Maintenance mode must be designed independently: dual authorization + timeout auto-exit + bypass logging; the hardwired E-stop circuit cannot be bypassed

Maintenance mode (single-step / jog / interlock bypass) is a third operating mode and should be a separate OpMode enum value with its own output logic path, never sharing a state machine with the auto logic. Entry conditions: dual authorization of a physical key switch (or safety relay) in position + HMI software confirmation. When active: the HMI must show a full-screen or prominent persistent warning; a dedicated bit in the system status word is available for SCADA to record; every bypass has a dedicated flag (Bypass_SensorX) and a timestamp written to non-volatile storage. Timeout auto-exit: after 30 minutes with no operation, maintenance mode exits automatically and the bypass flags reset automatically. Before exit, all forced outputs must be cleared and there must be an HMI confirmation step. Hard rule: the hardware E-Stop circuit must not be bypassed by software in any mode. Minimize the scope of maintenance bypass, bypassing only the necessary process interlocks; safety SIL-rated interlocks must not be bypassed.

**Pitfall**: Maintenance-bypass logic scattered across multiple networks leaves one spot un-reset after maintenance, so a safety-door interlock fails during production; authorizing maintenance mode with only a software bit can leave interlocks disabled for a long time on a communication fault; with no timeout protection, forgetting to exit after maintenance leaves interlocks bypassed during automatic production; masking the E-stop signal in software means the equipment does not stop when E-stop is pressed.

*Source*: Distilled engineering judgment; IEC 62061/ISO 13849 functional-safety design practice; IEC 62443 operating-mode security requirements; OMAC PackML MANUAL/AUTOMATIC/MAINTENANCE mode definitions


## occ24 [sequencing] Every sequence step must have a timeout watchdog; on timeout, force a fault state rather than waiting forever

Every sequence step must have a maximum residence time — start a step-timeout timer (TON) when the step is entered, with the timeout set to 1.5~2× the normal process time (too tight causes frequent false alarms, too loose delays the alarm). On timeout, regardless of whether the step-completion condition is met, force a jump to the fault step, latch the fault cause (which step timed out, timestamp), stop all motion outputs, and raise an HMI alarm. Timeout protection is the only mechanism that distinguishes slow equipment from stuck equipment / sensor failure / lost signal. Sequencing without timeout protection works in the debug environment but can dead-step in the field — the operator only sees an unresponsive machine with no alarm. Each step must be timed individually; a single global timeout for the whole flow cannot pinpoint which step is stuck.

**Pitfall**: A timeout set too tight (equal to the normal time) causes frequent false alarms; alarming on timeout but not stopping leaves the equipment energized and causes damage; a single global timeout for the whole flow means the earlier steps slowly consume the time, so when it triggers you can no longer tell which step is stuck.

*Source*: Distilled engineering judgment; IEC 62061 / machine-safety sequencing design practice


## occ20 [mode_control] Manual/auto switching must be bumpless (Bumpless Transfer): outputs do not jump at the instant of switching

On Manual→Auto switching, the auto logic should first track the current manual output value (bumpless transfer) and take over only after tracking stabilizes; on Auto→Manual switching, the manual initial value should inherit the current auto output value. PID implementation: in manual mode keep executing PID but force the PID output to equal the manual setpoint, maintaining the internal integrator state for a bumpless switch. Sequence switching: on Manual→Auto, the auto state machine should re-initialize the step sequence from the current actual position (read the sensors) rather than forcibly re-running from step 1; on Auto→Manual, the manual initial value inherits the current auto command value. Detect the mode-switch signal with a rising edge (not a level) to avoid multiple consecutive triggers at the instant of switching.

**Pitfall**: A manual initial value of 0 at switching drops the valve/drive to zero instantly, triggering equipment overcurrent protection or a process upset; switching to Auto with State=0 (initial step) while the motor is already running means the auto logic thinks it has not started and produces no output, so the motor stops immediately, causing a process interruption or even equipment damage.

*Source*: Distilled engineering judgment; standard industrial-control-room design practice; ISA-88 batch-control mode concepts


## occ18 [interlock_safety] Interlock priority is layered and centrally managed: safety interlock > process interlock > sequence permit; the interlock block outputs a single permit bit

Interlocks are layered by priority into three levels: the top level is safety interlocks (E-stop, safety door, thermal protection), the middle level is process interlocks (overpressure, over-level), and the bottom level is sequence permit conditions (previous step complete, valve feedback in position). Safety interlocks execute last in the actuation layer or are implemented in hardwiring, unaffected by the STATE variable. Concentrate interlocks in one dedicated interlock block that outputs an AllowRun permit bit; each equipment drive FB only needs to AND this permit bit rather than re-evaluating interlock conditions itself — scattered interlocks cause missed conditions or version inconsistency, must be synchronized across many places when modified, and are very easy to miss. When an interlock trips, write both the fault code and a timestamp to the alarm buffer. An interlock bypass requires a dedicated Bypass bit + logging; commenting out the interlock network directly is forbidden.

**Pitfall**: Writing the E-stop condition into one step of the sequence STATE rather than as a global override means E-stop fails when STATE is not on that step; writing the E-stop check separately in every motor FB means one modification misses an FB and that motor does not respond to E-stop; storing the interlock enable bit itself in a retentive bit means forgetting to reset the enable bit after the fault clears, locking the equipment permanently.

*Source*: Distilled engineering judgment; IEC 62061 SIL assessment requires interlocks to be independently verifiable; the SISTEMA tool recommends separating interlocks from process logic; IEC 61511 safety instrumented systems


## occ15 [maintainability] Maintenance-mode design: fault localization starts at the mode entry; bypasses must leave a trace and have timeout auto-exit

A production program should have a maintenance-mode entry: on entry the auto logic is suspended, the operator can single-step-trigger each actuator, and the HMI shows the current sensors' real-time status. Reserve a dedicated flag per bypass (Bypass_SensorX); when this bit is set the HMI forces a maintenance indication color, and after a timeout timer (30 minutes) the bypass resets automatically. Do not comment out interlock logic in the program or apply a hardware force without leaving a record. Bypass usage is logged to non-volatile storage or the HMI history. On exiting maintenance mode, force re-execution of the safety confirmation sequence (e.g. homing), and require an HMI confirmation step before production resumes to prevent the equipment from starting automatically after the maintenance person leaves.

**Pitfall**: Forgetting to cancel the bypass flag after maintenance leaves the equipment running in bypass mode for a long time, so the interlock fails at the next fault and causes an incident; without a maintenance mode, field engineers diagnose faults by online-forcing (Force) outputs, and mis-forcing the wrong output causes secondary equipment damage.

*Source*: Distilled engineering judgment
