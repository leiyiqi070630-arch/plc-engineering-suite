# Vendor-agnostic · Safety / Alarm / HMI / Maintainability / Anti-patterns

> 2026-09-18 scope correction: these are optional design patterns, not universal requirements or certified safety designs. User requirements, current platform contracts and evidence take precedence. For scan-order examples and a requirement-led review use `16-control-logic-design-review.md`.
> Applies to: all routes (vendor-agnostic); E-Stop hard-wired independent circuit / interlock de-energize-to-safe / alarm prioritization-latch-acknowledge / naming & commenting / commissioning / double-coil and other anti-patterns
> 14 items total, sorted by occurrence count (occ/30) from high to low.


## occ30 [estop] E-Stop circuit must be hard-wired independent of PLC logic; PLC software must not be the sole E-Stop path

The E-Stop power-cutoff action must break actuator power or drive enable directly through a hard-wired safety relay or the hardware channel of a safety PLC, fully isolated from the ordinary PLC program scan loop. The PLC program may read E-Stop state for HMI display, alarm generation, and interlock logic, but must never be the sole execution path of the safety function. Reason: PLC scan delay, program bugs, CPU faults, communication loss, or firmware crashes all disable a software E-Stop, whereas the hard-wired circuit is unaffected. IEC 62061 / ISO 13849 require that safety functions rated PLd/SIL2 or above be realized through redundant hardware; a pure-software loop cannot meet this. Typical implementation: a safety function block (ESTOP1, etc.) of a safety relay or safety PLC is wired in series with the main contactor coil circuit, with dual-channel redundant inputs and contact-consistency monitoring, while the PLC code only reads state. During commissioning, press the E-Stop with the PLC program running and verify the actuator de-energizes immediately, independent of the program.

**Pitfall**: Routing the E-Stop button signal only into an ordinary PLC DI and then resetting output coils or cutting the VFD enable in the program — the E-Stop fails completely on a CPU fault or scan anomaly, a major safety hazard; another pitfall is wiring an interposing relay into the E-Stop circuit but driving that relay coil from a PLC output, which likewise breaks independence.

*Source*: IEC 62061:2021 §6.7; ISO 13849-1:2015 §4/§6.2; EN ISO 13850 emergency-stop function standard; IEC 60204-1:2016 §9.2.5.4; PILZ/SICK/Schmersal safety-relay application manuals


## occ30 [interlock_safety] Interlock design follows the de-energize-to-safe principle: normal operation is held by energized coils, faults/power loss automatically enter the safe state

All safety-related interlock outputs (valves, contactors, brakes, enable signals) should be designed so that coils are energized during normal operation and de-energize on fault/wire-break/PLC power loss, triggering the safe action (spring-return valve closes, motor stops, brake engages). This way any anomaly — wire break, contactor coil failure, I/O module power loss, PLC stop — automatically moves to the safe side without the program actively issuing a safety command. Program interlock conditions should use normally-closed contacts in series (NC series logic), where breaking any one branch cuts the output, rather than normally-open contacts bypassing in parallel. Choose spring-return normally-closed pneumatic valves (close on loss of air), and use NC normally-closed loops for safety-door switches. Test criterion: cut all power and the equipment should automatically reach the safe position. The inverse design (energized = safe / energized = stop) instead maintains the dangerous state or fails to trigger protection on wire-break or PLC fault, a classic covert failure.

**Pitfall**: Using a normally-open valve plus continuous PLC energization to hold a cylinder — the cylinder shoots out uncontrolled on power loss or CPU fault; or designing a safety door to close when energized, so it stops in the dangerous open position after a PLC hang; beginners habitually use '1 = locked' without considering de-energized behavior, leaving wire-break faults completely silent.

*Source*: IEC 60204-1:2016 §9.2/§9.3 de-energize-to-safe principle; IEC 61511-1:2016 §11.2.5/§11.2.7; NAMUR NE43 signal-state specification; NFPA 79:2021 §9.2/§9.3/§9.4; IEC 62061:2021


## occ30 [alarms_diag] Three indispensable elements of an alarm system: prioritization (Priority) + latching (Latch) + operator acknowledge (Acknowledge)

A complete industrial alarm system needs three core mechanisms: ① Prioritization — at least three levels: Emergency (Trip/Critical, interlock shutdown), Warning (needs intervention, no shutdown), and Info (log only), each mapped to a different audible/visual response and HMI color; ② Latching — the alarm stays displayed after triggering even if the condition clears, using rising-edge detection + a SET instruction to set the latch bit, preventing transient faults from being missed; ③ Acknowledge — the operator must actively ACK to clear the alarm, with acknowledge separated from reset (acknowledge = aware of it, reset = fault cleared + condition gone), and the system records the timestamp and operator ID. Missing any one: no prioritization causes alarm floods that numb the operator; no latching leaves flash faults unrecorded; no acknowledge leaves faults without an accountability loop. Standard implementation: set the latch bit on the fault rising edge, reset condition = fault cleared AND operator acknowledge; do not drive the alarm bit with an ordinary coil.

**Pitfall**: Driving alarms with an ordinary coil — the moment the fault clears the HMI alarm auto-resets, so the operator never knows what happened; setting every event to the highest level numbs the operator (alarm-flood syndrome); the alarm lamp stays lit but there is no ACK workflow, so operators habitually ignore it.

*Source*: ISA-18.2-2016 Management of Alarm Systems for the Process Industries; EEMUA Publication 191 Ed.3 Alarm Systems: A Guide to Design, Management and Procurement; IEC 62682 alarm management


## occ30 [pitfall] Double-coil anti-pattern: the same output bit is driven in multiple places, the later one overwrites the earlier, silently defeating the logic

In LAD/FBD programs, the same output coil (a Q bit, M bit, or BOOL variable) appears in two or more networks/blocks; the PLC executes them in order within one scan cycle, and the assignment of the last network overwrites all earlier results, so the earlier interlock logic is fully defeated and extremely hard to debug. This is LAD's most common and most covert bug; the compiler (Siemens TIA Portal) issues a W warning for double coils but not an error, and beginners often ignore it. The same applies to multiple assignments to one variable in SCL/ST — the last assignment wins. Correct practice: ① each output bit has exactly one coil drive point, with all conditions affecting that output merged in one network using series/parallel logic; ② if control from multiple places is needed, use an SR/RS flip-flop or intermediate flag bits and consolidate to a single output; ③ raise the double-coil warning level to error to force a fix.

**Pitfall**: Writing coils to the same Q address in different Networks of an FC/FB, assuming 'the later one wins' or 'each handles its own' — they overwrite each other during integration, with bizarre symptoms that shift with scan order; testing only the later logic path makes the earlier one look correct while it is in fact always overwritten; especially frequent in multi-person collaboration.

*Source*: IEC 61131-3:2013 §2.5.1/§2.6.4/§3.1.1 variable-assignment semantics and double-coil restrictions; Siemens TIA Portal V17 Programming Guideline §2.3 / LAD chapter double-coil warning; Siemens S7-1200 System Manual double-coil evaluation chapter; Mitsubishi GX Works2/GX Works3 programming manuals, equivalent warning


## occ30 [naming] Name variables/tags with a 'location_device_function_type' structure, forbid bare-address programming, and write comments about 'why' not 'what'

All I/O points, intermediate flags, and DB variables must be given descriptive symbolic names; using bare addresses (I0.0, Q0.3, M0.1, %MW100, D100) directly in program logic is forbidden. Recommended naming format: area_devicetype-number_function_signaltype, e.g. Conv01_Motor_Run_Cmd (conveyor 1 motor run command), Tank02_Level_High_Alm (tank 2 high-level alarm), Pump1_RunFB (pump 1 run feedback). Standard type suffixes: _Cmd = command, _Sts = status, _Alm = alarm, _Flt = fault, _FB = feedback. Comments should explain 'why' not 'what': 'Interlock: 3 s delay waiting for hydraulic pressure build-up before allowing pump start' is better than '// motor start'. The naming convention must be fixed in writing and enforced before project start; changing it midway is extremely costly. On Siemens TIA use symbolic variables + DB tags throughout; on Mitsubishi GX Works3 use Label mode rather than direct addresses.

**Pitfall**: Using bare addresses like M0.0/Q0.1/D100 throughout — even the original author cannot read it three months later; hardware changes or I/O remapping require global search-and-replace and are easy to miss; project handover is nearly impossible; or names too short (RUN/ALM) become impossible to locate in a large project; a naming scheme inconsistent between drawings and program forces cross-referencing two sets of documents during troubleshooting.

*Source*: distilled engineering judgment; ISA-5.1 instrumentation symbols and identification standard; IEC 61131-3 variable-naming conventions; Siemens SIMATIC Programming Styleguide V1.1 §3; OMAC PackML v3.0 naming conventions; PLCopen programming style guide


## occ30 [hmi_tag] Bind HMI tags directly to PLC variables as a single source of truth, forbid duplicate logic computation on the HMI side, and let HMI operations write only command bits

The HMI should be responsible only for display and operator command input; all state evaluation, interlock logic, alarm logic, and mode computation must be done in the PLC program, which outputs explicit state bits for the HMI to read. Standard layering: HMI → writes PLC dedicated CMD-area variables (e.g. PUMP1_START_CMD) → PLC executes logic + interlock evaluation → PLC writes back state feedback bits → HMI display is read-only. Forbidden: ① HMI scripts doing IF/AND/OR interlock evaluation; ② HMI writing PLC physical output Q/Y addresses directly, bypassing interlocks; ③ HMI duplicating range scaling or alarm evaluation. Benefits: single source of truth for PLC logic, so the PLC still runs correctly when the HMI drops offline; maintenance changes only one place in the PLC; during debugging the HMI input can be masked to test the program logic in isolation. HMI state feedback should read field FB feedback bits rather than reading back the CMD bit, otherwise it shows a 'false running' state when the link is down.

**Pitfall**: Writing 'IF Tag1=1 AND Tag2=1 THEN show green' in an HMI script — when the PLC logic changes but the HMI script is not synced, the screen no longer matches the real state; an HMI button writing Q0.0 directly defeats interlock protection entirely; the PLC engineer and HMI engineer each do their own range scaling with unsynchronized coefficients, so the same sensor reads 102 °C on the PLC and 98 °C on the HMI.

*Source*: distilled engineering judgment; ISA-101.01-2015 Human Machine Interfaces for Process Automation §8.3; EEMUA 201 HMI design guide; Siemens WinCC Unified/TIA HMI best-practice documentation; Rockwell FactoryTalk design guide; OMAC PackML HMI interface specification


## occ28 [maintainability] Forces/bypasses during commissioning must be logged and visualized, and all cleared and verified before commissioning

Using Force/Override to force I/O points or bypass interlocks during commissioning is a normal operation, but every force/bypass must be logged (address + reason + responsible person + time + expected removal time). Before commissioning, run a checklist review: check and cancel all forces, restore all test jumpers, verify interlock-circuit integrity, and take a screenshot for the record proving the Force Table is empty. When a bypass is active the HMI must show a prominent persistent warning (yellow flashing banner), with an automatic timeout (e.g. 30 minutes) that auto-clears and alarms on expiry, and the bypass operation is written to an audit log (operator ID + timestamp + bypass reason). Both Siemens TIA Portal and Mitsubishi GX Works can export the force table; delivery documentation should include a screenshot of the empty force table. Forbidden: commenting out interlock conditions in the program or changing NC to NO to bypass them; leaving Forces in place after commissioning and delivering them into production.

**Pitfall**: Forcing the E-Stop feedback bit during debugging to skip safety-circuit testing and forgetting to undo it after go-live — when the E-Stop is pressed the PLC thinks the circuit is normal and performs no safety response; leaving 3 forced points in the Force Table after debugging causes an inexplicable output anomaly half a year later, and it takes two days of troubleshooting before someone thinks to check the Force Table.

*Source*: distilled engineering judgment; IEC 61511-1:2016 §11.9 managing bypasses/suppression; ISA-18.2 bypass management; IEC 62443-2-1:2010 operational security management; OSHA 1910.147 lockout/tagout (LOTO) procedure; Siemens TIA Portal Force-function documentation


## occ25 [alarms_diag] Alarm-flood prevention: debounce delay + deadband + priority suppression + root-cause alarm suppression of cascades

Alarm flood is one of the main human factors in process-industry accidents (post-mortems of major incidents such as BP Texas City all involve it). EEMUA 191 recommends an alarm rate of no more than 1 per 10 minutes in steady state and no more than 10 per 10 minutes at peak, with Critical-level alarms kept within 5% of all alarms. Three cures: ① Debounce delay — add ON-delay/OFF-delay (typically 2–5 s) to analog alarms to prevent boundary chatter; ② Deadband — separate the alarm threshold from the reset threshold to avoid repeated toggling at the critical point; ③ Root-cause alarm suppression — automatically suppress all subordinate cascade alarms when an upstream/root-cause device faults (state-based alarming), showing only the root cause. When equipment is stopped, mask invalid downstream alarms and keep only the root-cause alarm. Also periodically compile the top-10 most frequent alarms and eliminate their root causes.

**Pitfall**: Setting four alarms (HH/H/L/LL) for every analog range exceedance and making them all Critical — hundreds of alarms per hour during normal production, operators habitually ACK without looking, and real incident alarms are drowned out; with no deadband, a signal chattering near the threshold triggers dozens of alarms per second.

*Source*: EEMUA Publication 191 Ed.3 §3.4/§5 alarm-rate benchmarks; ISA-18.2-2016 §4.4/§6/§9 alarm-management performance metrics and suppression specification


## occ22 [alarms_diag] Latch alarms with a rising-edge-triggered SET, separate acknowledge (ACK) from reset, and record the first-out timestamp

Alarm handling follows the requested alarm philosophy: some indications track the cause, while trips or fleeting events may require retained occurrence and acknowledgement. Where latching is required, SET/RESET, a Boolean latch equation or an explicit state machine can all implement it; verify cause-clear and acknowledgement/reset priority. First-out capture and timestamps support diagnosis but the earliest sampled event is not proof of the physical root cause. Capture only the diagnostics the task needs; do not add latching to every status indication.

**Pitfall**: Driving the alarm bit directly with a coil — the alarm vanishes once the condition clears, so a momentary fault is invisible on the HMI; after an interlock shutdown the HMI shows 20 simultaneous alarms and the operator handles the most conspicuous high-temperature alarm, while the real root cause was low lube-oil pressure triggering first; all alarms share one timestamp or only second-level precision, making it impossible to determine order.

*Source*: ISA-18.2-2016 §10.3 First-out annunciation; EEMUA 191:2013 §4.4 alarm-timestamp requirements; Siemens S7 alarm FB design pattern


## occ20 [maintainability] Structure the program modularly by device/functional unit, write comments about 'why' not 'what', and give every function block a comment header

Scale modularity to responsibility. A larger machine benefits from a thin main program and focused device/function blocks; a small task can keep its logic in Main. Prefer meaningful interfaces and reusable state to arbitrary block/network counts or excessive wrappers. Comments explain process purpose, priority, units and recovery conditions; follow existing project header conventions and update comments with the code. Do not invent authors, version histories or verification claims.

**Pitfall**: Piling all logic into OB1/Main across hundreds of ungrouped networks, so a new hire spends their entire first week reading code; comments that only say 'motor start', fully duplicating the variable name with no added information; comments frozen at a draft stage describing obsolete logic, more dangerous than no comment.

*Source*: distilled engineering judgment; IEC 61131-3 program-organization-unit concept; Clean Code (Robert Martin) principles ported to the PLC context; Siemens SIMATIC programming-convention manual


## occ18 [mode_control] Manage manual/auto/maintenance modes with a state machine, interlock modes against each other, gate transitions with conditions, and do not let manual mode bypass safety interlocks

Equipment operating modes (Auto/Manual/Maintenance) should be managed with a state machine: represent the current mode with an enumerated state variable rather than multiple boolean bits, and forbid two modes being active at once. Mode transitions must satisfy preconditions (e.g. the equipment must be stopped to switch to maintenance mode), and outputs at the moment of transition must be handled explicitly (hold the current value when switching auto→manual; synchronize state first, then enable auto, when switching manual→auto); no unexpected output pulse at the transition instant (bumpless transfer). In manual mode interlocks may be partially bypassed to allow jog debugging, but the hardware E-Stop and safety interlocks (SIL-related) must not be bypassed in any mode. The mode state must be shown persistently on the HMI in high-contrast color, and switching requires permission confirmation to prevent forgetting to switch back to auto after go-live. Debug/commissioning mode should have an automatic timeout-exit mechanism.

**Pitfall**: Manual and auto each controlling the output with separate M bits, so during a switch both bits are 1 at once, producing dual control; not clearing the step-sequence variable on a manual/auto switch, so after switching back to auto it continues from the wrong step and the equipment runs away; bypassing all interlocks in maintenance mode, so the travel limit does not act when the operator jogs the motor.

*Source*: distilled engineering judgment; OMAC PackML v3.0 state-machine specification (TR88.00.02); ISA-88; IEC 60204-1:2016 mode-control requirements


## occ16 [alarms_diag] Handle sensor wire-break/out-of-range states separately from process alarms; a bad value must not trigger a process interlock

On an analog-input wire break the value the PLC receives may be 0 or full-scale (e.g. 4 mA break = 0, or 27648 on some modules), and this bad value falsely triggers a low-level shutdown or high-temperature alarm. Correct practice: first check whether the AI value is within the valid range (e.g. 100–27648); if it is outside, set the sensor-fault bit and suppress all process alarms and interlocks on that channel. NAMUR NE43 defines the fault bands below 4 mA / above 20 mA, and Siemens AI modules support wire-break detection with a diagnostic output bit. Sensor-fault alarms and process-limit alarms should use separate alarm bits so the operator can tell whether the device is broken or the process is genuinely out of limits.

**Pitfall**: Using the raw AI value for comparison interlocks without checking validity — a loose sensor wire falsely trips the whole production line; using the same alarm bit for sensor-fault and process-limit alarms leaves the operator unable to distinguish the root cause.

*Source*: NAMUR NE43:2003 analog-signal fault-state standard; Siemens S7-1200 Analog Input Module Manual Ch.5 diagnostics


## occ15 [alarms_diag] HMI alarm screens must have timestamps + color prioritization + first-out logic, and status color-coding follows industry conventions

The HMI alarm list must have a timestamp column (millisecond precision) sorted ascending by time by default, so root cause and cascade can be distinguished. Color-coding industry convention: red = fault/shutdown/danger alarm, yellow = warning/manual mode, green = normal running/permitted, gray = stopped/inactive, flashing = unacknowledged alarm. All screens system-wide must follow one color scheme; no screen may define its own. The HMI background color should be neutral gray to avoid high-saturation colors distracting attention. All operations (start/stop, parameter changes) should have permission levels (operator/engineer/administrator) and a secondary confirmation mechanism, and be written to the audit log.

**Pitfall**: Red means running on screen A but fault on screen B — the operator misjudges equipment state in an emergency; alarms with no timestamps, where two alarms 100 ms apart show the same time, turns incident analysis into guesswork.

*Source*: ANSI/ISA-101.01-2015 Human Machine Interfaces for Process Automation; ISA-18.2-2016 §6 First-out annunciation; EEMUA 201 HMI design guide


## occ12 [maintainability] Commission in stages: single-point I/O verification → single-machine manual jog → independent safety-circuit verification → interlocked run → full load, no skipping steps

Correct commissioning steps: ① check wiring and address mapping before power-up; ② point-by-point force-output test (verify wiring and polarity for each I/O, and confirm the physical actuator moves in the correct direction); ③ drive each device step-by-step in manual mode (verify logic sequence at low speed/no load); ④ independent safety-circuit verification — in the stopped state, verify each E-Stop/interlock path is independently effective (pull the interlock signal wire and verify the equipment stops automatically); ⑤ interlocked test to verify the logic sequence is correct; ⑥ finally full-load test. Each stage has a sign-off record, and the next stage is not entered until the previous one passes. Skipping safety-circuit verification is the most dangerous commissioning shortcut and one of the main causes of plant accidents.

**Pitfall**: Rushing the schedule by powering everything up and commissioning it together — a reversed sensor drives a cylinder straight into the end stop, or a miswired E-Stop chain fails to cut power the first time it is pressed; powering up under load to 'just try it', where one misplaced wire causes an equipment collision — an error that stepwise verification would have found in 5 minutes only surfaces after the accident.

*Source*: distilled engineering judgment; IEC 61511-1:2016 §18 verification and validation requirements; IEC 60204-1:2016 §18
