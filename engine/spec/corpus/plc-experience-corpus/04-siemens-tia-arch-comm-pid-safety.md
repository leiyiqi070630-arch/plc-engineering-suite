# Siemens TIA Architecture / Communication / PID / Safety

> Applies to: vendor=siemens integration=tia_openness; architecture / data types / analog / communication (Profinet/Modbus/GET-PUT) / PID / F-CPU safety
> 15 items total, ordered by occurrence count (occ/30) descending.


## occ30 [analog_scaling] Scale analog values with the NORM_X + SCALE_X instruction pair; do not hand-write linear formulas

TIA provides NORM_X (normalizes a raw integer to a 0.0–1.0 REAL) and SCALE_X (maps 0.0–1.0 to an engineering-unit range); use the two instructions chained as a pair. Typical 4–20 mA unipolar maps to raw values 5530–27648 (S7-1200 12-bit ADC); 0–20 mA maps to 0–27648; bipolar ±10V maps to -27648–+27648. Benefit of the two-step decoupling: replacing a sensor changes only NORM_X MIN/MAX, a range change touches only SCALE_X, and they stay independent. The instructions have built-in clamping; a hand-written (raw-min)/(max-min)*span easily misses a numerator or denominator edit when the range changes, and integer-by-integer division truncates precision. SCL example: pressure := SCALE_X(MIN:=0.0, MAX:=100.0, VALUE:=NORM_X(MIN:=0, MAX:=27648, VALUE:=aiRaw));

**Pitfalls**: (1) for 4–20 mA, MIN must be 5530, not 0, otherwise the zero point shifts by ~20%; (2) using 32767 instead of 27648 for full scale causes ~16% range error; (3) for a bipolar signal MIN must be -27648, not 0, otherwise negative values are clamped to 0; (4) NORM_X outputs REAL, so an INT intermediate variable loses precision.

*Sources*: Siemens TIA Portal STEP 7 instruction manual, NORM_X/SCALE_X chapter (A5E33839619); S7-1200 System Manual A5E02486680; SIMATIC S7-1500 instruction manual A5E03461222; FAQ ID 109747279; 109741521


## occ30 [architecture] OB/FB/FC three-layer split of responsibilities: OB only schedules, FB encapsulates stateful devices, FC does stateless pure computation

OB is the scan entry point (main cycle OB1, interrupt OBs, startup OB); it only schedules and does top-level interlocking, never business logic. FB has an instance DB and retains state across scan cycles, suited to driving stateful devices (motors, valves, PID); each device gets one FB instance backed by its own instance DB, and multiple devices reuse the same FB code without copy-paste. FC has no instance DB and suits pure algorithms (conversion, validation, alarm evaluation). S7-1500 supports FB multi-instance, embedding a child FB's instance data into the parent FB's DB to reduce DB fragmentation. OB1 holds only the call sequence, with all business logic in FB/FC, so debugging a single device's fault only requires entering the corresponding FB instance, and scaling up only adds FB instances without changing logic.

**Pitfalls**: (1) piling all logic into OB1 with state variables in the global M area — as devices multiply they interfere with each other, and the code is neither reusable nor debuggable; (2) declaring STATIC variables in an FC (an FC has no static area, so TIA warns or fails to compile); (3) putting stateful logic (timers/counters) in an FC's TEMP area, where it is cleared every scan; (4) storing state in an FC, causing multiple instances to share one address and pollute each other.

*Sources*: Siemens STEP 7/TIA Portal programming guide; SIMATIC S7-1500 system manual A5E03461182 chapters 3-4; TIA Portal Programming Guideline v1.5+; mainstream engineering paradigm from industrial-automation community forums; distilled engineering judgment


## occ29 [comm] GET/PUT communication between S7-1500/1200: the accessed CPU must enable "Permit access with PUT/GET communication from remote partner" in its CPU properties

GET/PUT are Siemens S7-protocol one-sided communication instructions: the initiator actively reads (GET) and writes (PUT) the partner's DB, and the accessed side writes no communication program at all. However, TIA V13+ disables the PUT/GET server-side access permission on S7-1500/1200 by default (security hardening). On the accessed CPU you must enable "Permit access with PUT/GET communication from remote partner" under CPU properties → Protection & Security → Connection mechanisms, then re-download the hardware configuration. S7-300/400 have it on by default and skip this step. In addition, the accessed DB must disable "Optimized block access" (Standard access), otherwise GET/PUT cannot access data by absolute address. This suits small, low-frequency synchronization (e.g. recipe download); for large real-time data use Profinet I-Device or open user communication (TSEND_C/TRCV_C) instead.

**Pitfalls**: (1) forgetting to enable the permission on the accessed side — the GET instruction sets ERROR, STATUS returns 0x80A3/0x8085/0x80C3/0x8104, all data is 0 with no friendly hint, often costing hours to diagnose; (2) enabling it but forgetting to re-download the hardware configuration, so the setting has no effect; (3) the accessed DB uses optimized access, so GET/PUT cannot locate data (disable optimized access on the communication DB specifically); (4) leaving PUT/GET permission enabled at handover, creating a network-security risk.

*Sources*: Siemens TIA Portal S7-1500 system manual, CPU protection settings chapter; FAQ ID 109481463; 109481655; 109798331; 109743174; TIA Portal S7 communication GET/PUT manual A5E03461222; A5E03735814


## occ28 [comm] Modbus TCP with MB_CLIENT/MB_SERVER: each connection owns its own instance DB, trigger REQ on a rising edge, and wait for DONE/ERROR before sending the next frame

For S7-1200/1500 as a Modbus TCP master, use the MB_CLIENT instruction (not RS485's MB_MASTER); slaves use MB_SERVER. Each TCP connection must be assigned its own instance DB to store the connection handle (TCON_IP_v4 structure); multiple connections cannot share one instance DB. MB_CLIENT is a stateful, non-blocking FB that must be called every scan cycle (EN permanently TRUE) to advance its internal state machine; it cannot sit in a conditional branch and be called only occasionally. The REQ pin should use R_TRIG to produce a single-scan rising edge that triggers the request, not be held TRUE (which retriggers repeatedly and desynchronizes the state machine). Polling multiple slaves must be serial: use a state machine IDLE→REQ→wait DONE/ERROR→next slave, never concurrent. The MB_HOLD_REG parameter points to the DB data area mapped to the holding registers. Once the connection is established the handle is self-maintained, with no manual TCON/TDISCON needed; to disconnect and reconnect, set DISCONNECT:=TRUE first, then re-establish.

**Pitfalls**: (1) multiple slaves share one instance DB, connection parameters overwrite each other, and communication fails intermittently and irreproducibly; (2) REQ held TRUE makes MB_CLIENT re-initiate every frame, corrupting connection state; (3) MB_CLIENT placed in a conditional branch and called only occasionally cannot advance its internal state machine, so the connection repeatedly drops and rebuilds; (4) polling multiple slaves through one shared MB_CLIENT instance causes data cross-talk; (5) retriggering REQ during BUSY raises error W#16#80C3/0x8085.

*Sources*: Siemens TIA Portal MB_CLIENT V4 instruction manual; S7-1200 Modbus TCP function manual A5E03461864; A5E03451864; A5E32318600; FAQ 49948136; 82212757; 82310036; Application Example 76372738


## occ26 [comm] Handling Profinet IO device dropout: add OB82/OB86, configure substitute values, and never rely on the last value to run silently

When a Profinet IO device (a remote ET200SP, etc.) drops out, the CPU triggers OB86 (rack/station failure) or OB82 (diagnostic interrupt). If these OBs are not created in the project, S7-1500/1200 default to STOP mode. Engineering practice: create at least empty OB82 and OB86, set a fault flag and notify the HMI inside them, and let the CPU stay in RUN to service the remaining devices. After a device goes offline the input process image retains the last valid value by default (it is not zeroed), so the program cannot detect the dropout from a value change and must read the IO diagnostic status or rely on OB82/OB86. Output modules should have an explicit substitute-value strategy configured in the TIA hardware configuration (e.g. speed setpoint to zero, valve closed = 0) to prevent a drive from continuing on its last command after a break and causing a safety incident. S7-1500 also supports calling GETIO_PART in OB86 to read module-level IO status.

**Pitfalls**: (1) with no OB86, any IO device dropout puts the CPU straight into STOP and halts production; (2) OB86 added but left empty — the CPU does not STOP, but outputs hold the last pre-dropout value and actuators keep acting, causing a safety incident; (3) configuring only substitute values without OB86 diagnostic logic — the dropout has no alarm and no record, and the operator does not know the device is offline; (4) polling the IO process image with an M bit to detect a dropout is unreliable (the process image freezes at the last value).

*Sources*: Siemens TIA Portal Profinet IO system manual A5E00298288/A5E00298706; FAQ 22488236; Profinet diagnostics manual; OB82/OB86 organization block documentation; distilled engineering judgment


## occ25 [datatypes] Prefer UDTs to define device interface structures, with Array of UDT to batch-manage identical devices

Use a UDT (user-defined data type) to define all of a device's signals (command word, feedback, status, alarms, parameters) as one structure; the FB's IN/OUT/INOUT interface references that UDT directly, and HMI tags and alarm templates bind to the same UDT path. Array[0..N] OF UDT batch-manages identical devices (20 pumps share one FOR-loop of logic). Changing the structure edits the UDT in one place and TIA propagates the update to all referencing instances; the HMI needs no per-tag reconfiguration. S7-1500 supports UDT nesting and versioning (PDT) and notifies dependent blocks automatically after a change; S7-1200 limits the nesting depth. Optimized-access DBs (default on S7-1500) require access by symbolic name, and UDTs are the basis of symbolic access; DBs used for Modbus/GET-PUT communication must disable optimized access or be explicitly copied to a communication buffer.

**Pitfalls**: (1) after modifying a UDT, forgetting to run "Compile all" / "Update Instances" on all referencing DBs, so the DB's actual memory offsets diverge from the program declaration and reads/writes are misaligned at runtime with no compile error; (2) modifying a UDT and downloading during operation makes TIA report "DB structure inconsistent" and refuse the download; (3) accessing UDT members via AT or absolute-address offsets in an optimized DB, which S7-1500 optimized DBs do not support; (4) reordering UDT members or inserting a field in the middle misaligns old DB offsets, requiring the DB to be deleted and rebuilt rather than updated in place.

*Sources*: Siemens TIA Portal V16+ help, PLC data types chapter; TIA Portal Programming Guideline, Data Structures chapter; distilled engineering judgment; SIOS recommended practice


## occ24 [pid] PID_Compact must be called in a fixed-period cyclic interrupt OB (e.g. OB30), with the sampling time matching the OB period exactly

The integral and derivative calculations of PID_Compact/PID_3Step depend on a constant sampling time dt, so they must be called in a cyclic interrupt OB (OB30/OB35, etc.), not the main cycle OB1 (whose scan period varies with load). The CycleTime parameter (in seconds) must match the OB execution period exactly; setting it to 0 or -1 auto-detects, but explicit setting is recommended. Suggested call intervals: temperature control 100–500 ms, pressure/flow 50–200 ms, servo position 1–10 ms. The Cycle_U parameter takes a microsecond value (e.g. OB30 = 100 ms → 100000). Commissioning steps: first stabilize the process in manual mode (Mode=4), then start pretuning (Mode=1, coarse) → fine tuning (Mode=2) → automatic (Mode=3). Tuning results are written to Retain variables in the instance DB and survive power loss. Immediately after tuning, export the parameters from the TIA online view or fix them into the DB start values.

**Pitfalls**: (1) calling PID_Compact in OB1 — scan-period jitter makes the integral term drift, showing as persistent oscillation or steady-state error, which beginners mistake for a tuning problem and endlessly readjust Kp/Ti; (2) filling Cycle_U in milliseconds instead of microseconds, making the integral gain off by three orders of magnitude; (3) not fixing tuned parameters into the DB start values, so they reset to zero after downloading a new program or a power-cycle restart, and control is lost; (4) getting the Mode parameter wrong (0=inactive, 1=pretuning, 2=fine tuning, 3=automatic, 4=manual), leaving the output always 0.

*Sources*: Siemens TIA Portal PID_Compact V2 function manual A5E35300228/A5E35300227; SIMATIC S7-1200/1500 PID control function manual; TIA Portal PID commissioning wizard documentation; FAQ 68011436; distilled engineering judgment


## occ23 [comm] A Profinet IO device name must match the GSDML configuration and be unique within the subnet; before commissioning, write it into the hardware with the "Assign device name" tool

Profinet identifies topology by device name, not IP address; the IP address is pushed to the device by the CPU at startup via the DCP protocol, but the device name must be written into the device's Flash/EEPROM in advance. Implementation flow: configure the device name and IP in the TIA network view → download the hardware configuration → run "Assign device name" online to write the name into the physical device. After replacing a spare part, the new device's factory device name is empty or a vendor default and must be reassigned, otherwise the CPU cannot find the slave and the BF LED stays on. The GSDML file version must match the device firmware; a version mismatch causes configuration inconsistency (BF red LED). The device name is case-sensitive and allows only lowercase letters and hyphens.

**Pitfalls**: (1) copy-pasting a project gives two devices the same name, and the whole Profinet segment drops out alternately; (2) powering up a spare part without assigning a device name — the BF LED stays lit and IO does not work, while a successful IP PING is mistaken for healthy communication; (3) a successful IP PING is taken as Profinet being fine, but the Device Name actually mismatches and IO establishment fails (the two are independent); (4) with several same-model devices on one segment, the assignment tool broadcasts the same name and all of them error.

*Sources*: Siemens PROFINET IO System Description A5E00298289/A5E00298706; TIA Portal online help "Assign PROFINET device name"; FAQ 26436894; 44212183; Profinet specification IEC 61158-6-10; distilled engineering judgment


## occ22 [interlock_safety] F-CPU safety programs can only be written in F-OB/F-FB/F-FC, and data exchange between standard and safety programs must go through the F-DB safety interface mechanism

An F-CPU's safety program (e.g. S7-1500F/1200F) runs in a separate F-Runtime with CRC checking and dual-channel execution. Safety logic can only call TÜV-certified F-FB/F-FC (yellow icon) from the F-OB (Safety Main OB); a standard OB cannot call safety blocks, and safety blocks cannot call ordinary FC/FB. The F-DB has a system-generated CRC that the hardware continuously verifies at runtime. To pass data from the standard program to the safety program, use the dedicated "standard→safety" channel variables in the F-DB (F_GLOBDB/PASS_ON mechanism), with a direction restriction: the standard program may read the F-DB output area but may not directly write safety inputs. The F_ACK acknowledge bit must be a rising edge triggered by a deliberate operator action, never set automatically in the program. After modifying an F program you must recompile, download, and run the safety signature (Safety Administration), otherwise the CPU goes to STOP and reports a safety-signature mismatch. The emergency-stop loop must be implemented in the F-OB with F instructions such as ESTOP1, and may not be replaced by a software interlock in OB1.

**Pitfalls**: (1) routing a safety signal (E-stop) through a normal OB before passing it to an F-FB bypasses the safety-integrity check and fails TÜV certification; (2) using MOVE in standard OB1 to write directly into the F-DB safety area raises "Safety violation" at compile time or fails the F-Runtime check at runtime and triggers a safety stop; (3) forgetting the safety signature after modifying an F program causes the download to be rejected; (4) auto-pulsing F_ACK in the program to skip the safety acknowledge passes functional testing but violates IEC 62061/ISO 13849 and is certain to be rejected in audit; (5) forgetting to regenerate F addresses and re-sign after replacing an F-IO module causes a PROFIsafe address conflict.

*Sources*: Siemens SIMATIC Safety programming and operating manual A5E03037597/A5E38009834/A5E38120692/A5E39236008/A5E38233500/A5E10695635/A5E38009506/A5E02714949; TIA Portal Safety Advanced documentation; IEC 62061; ISO 13849; distilled engineering judgment


## occ18 [pid] Before PID_Compact autotuning, stabilize the process manually first; after tuning, verify the step response and fix the parameters

PID_Compact pretuning identifies the process model from the step response; if the process is unstable (still heating up, feed fluctuating, valve not at a stable point), the identification deviates significantly and the auto-generated Kp/Ti/Td can cause oscillation or even overshoot that damages equipment. Correct flow: first, in manual mode (Mode=4), stabilize the process value within ±10% of the setpoint and let it settle for 2–3 time constants, then trigger Mode=1 to start pretuning, followed by Mode=2 fine tuning. After tuning, observe the step-response curve on the commissioning panel, confirm overshoot <10% and steady-state error <1%, then switch to automatic. After tuned parameters are written to the instance DB Retain area, immediately fix them with "Download current values to start values" to prevent reset to zero after a CPU restart. Parameters obtained under no-load/light-load conditions may not match under load and need re-tuning. In production, lock the Mode entry bit to prevent an operator from triggering tuning by mistake.

**Pitfalls**: (1) cold-starting pretuning directly at PV=0, SP=80, driving the step output to 100% and triggering a high-temperature interlock shutdown; (2) not fixing tuned values into the DB start values, so a power-cycle restart resets parameters to defaults (Kp=0/Ti=0/Td=0) and control is lost; (3) leaving Mode in manual (4) after tuning, so the output does not follow SP; (4) triggering autotuning while production equipment is running, with the valve/VFD swinging widely and damaging the process.

*Sources*: Siemens PID_Compact V2 function manual A5E35300227/A5E31779059; FAQ 109478459; distilled engineering judgment


## occ15 [architecture] Partition FB instances by process unit; do not pile up logic by signal type, and do not write business logic directly in OB1

Organize program blocks by process unit: encapsulate each pump/valve/axis as one FB + instance DB, with OB1 holding only the instance call sequence. Do not classify by signal type (all analog in one FC, all digital in another), which creates cross-unit coupling and makes units impossible to test independently. Scaling up only adds FB instances, and changing one device touches only that FB without affecting other instances. The S7-1200 call-stack depth defaults to 16 levels; watch this limit when nesting deeper. Do not let a lower-level block call back up into a higher-level OB or let a cross-device block directly access another's DB (multi-instance DBs can merge child-FB data into the parent FB's DB).

**Pitfalls**: (1) writing process logic in the body of OB1 — as the project grows, faults are hard to locate and nothing is reusable; (2) splitting FCs by signal type, tangling cross-unit dependencies so one change affects everything; (3) a lower-level FB reading/writing upper-level state variables directly through a global DB, creating tight coupling.

*Sources*: distilled engineering judgment; Siemens STEP 7 programming style guide WA 0032 / SCE training modules / S7-1500 Style Guide v1.0


## occ12 [pid] After power-up, preset the PID_Compact output in manual before switching to automatic, and switch via a ModeActivate rising edge

At PID_Compact cold start the integral term is 0, so switching straight to Mode=3 (automatic) makes the proportional term output a large value immediately and the actuator jumps (valve full open, level/temperature overshoot). Correct flow: in OB100 (startup OB) or on the first scan, switch to Mode=4 (manual) first, set ManualValue equal to the current actuator position, then bumplessly switch to Mode=3. PID_Compact has built-in bumpless transfer that takes over smoothly using the current output as the initial value when switching back to automatic; the ActivateRecoverMode parameter can also be set for shock-free switching. A mode switch requires two actions together: write the target mode to the Mode pin, then give ModeActivate a rising edge; writing Mode alone without triggering ModeActivate does not switch the mode.

**Pitfalls**: (1) setting Mode=3 directly in OB100 without manual presetting, so the actuator jumps after every power-up; (2) an HMI manual/auto switch that writes only the Mode tag but forgets to trigger the ModeActivate pulse, so the mode stays in its previous state while the operator believes the switch succeeded.

*Sources*: Siemens FAQ 109478459 "PID_Compact bumpless transfer"; TIA Portal PID_Compact V2 function manual, Mode parameter documentation; distilled engineering judgment


## occ10 [datatypes] Convert between WORD/INT/DINT/REAL with explicit conversion functions, and compare REAL floats with a tolerance band

The TIA Portal SCL strong type system disallows implicit cross-type assignment: WORD to INT needs WORD_TO_INT(), REAL to DINT needs REAL_TO_DINT() (truncates) or ROUND() (rounds to nearest), and INT to REAL uses INT_TO_REAL(). In LAD, use the CONV instruction block. Analog read-back values are usually WORD (0..27648) and need WORD_TO_INT or TO_DINT before entering multiply/divide; assigning a value above 32767 directly to INT turns it negative. From S7-1500 firmware V2.0, implicit conversion is stricter, with some cases promoted from warning to error. IEEE 754 single-precision floats have mantissa drift after A/D conversion, so two "equal" engineering values cannot be compared with = directly; use ABS(a-b) <= epsilon (epsilon = half the engineering resolution, on the order of 0.001).

**Pitfalls**: (1) assigning AIW directly to INT — an over-range current signal produces a negative number and the scaling formula outputs garbage; (2) integer division truncates ((27648*range) can exceed 32767 and overflow, so convert to REAL before multiply/divide); (3) REAL_TO_DINT truncates negatives rather than rounding, so use ROUND+REAL_TO_DINT; (4) comparing two scaled analog results directly with CMP==R flickers in a noisy environment.

*Sources*: TIA Portal SCL Programming Manual A5E03790552/A5E03897940; SIMATIC S7-1500 System Manual, Data Types chapter; IEC 61131-3 §2.5.1; S7-1500 firmware V2.0 release notes


## occ9 [datatypes] LINT/ULINT are S7-1500-only 64-bit integers; use LREAL for accumulators to avoid precision loss

S7-1500 supports LINT (64-bit signed) and ULINT (unsigned), suited to large counts or timestamp accumulation; S7-1200 FW ≤ V4.x does not support them, so porting must switch to DINT + manual high/low word assembly. S7-1500 supports LREAL (64-bit double precision); S7-1200 only supports REAL (32-bit single precision, about 6–7 significant digits). A flow/energy accumulator using REAL stops changing value once it exceeds about 16 777 216 and a small increment is added ("accumulation stall" fault); on S7-1500 always use LREAL for accumulators, and on S7-1200 compensate by periodic reset to zero.

**Pitfalls**: (1) porting a library written with LINT directly to S7-1200 — some versions implicitly truncate to DINT at compile time and overflow; (2) accumulating energy with REAL, whose value freezes after hours of running, which maintenance staff mistake for an instrument fault.

*Sources*: Siemens TIA Portal S7-1500 System Manual, Data Types chapter; S7-1200 System Manual V4.6 data type table; IEC 61131-3 REAL/LREAL specification; Siemens STEP 7 S7-1500 Programming Manual


## occ8 [datatypes] S7-1500 UDT nesting is limited to 8 levels, and UDT member offsets in an optimized DB are determined by the compiler and cannot be assumed fixed

TIA Portal has a hard limit on UDT nesting depth (S7-1500: max 8 levels); in engineering practice, beyond 3–4 levels is already hard to maintain, so split into several flat UDTs and compose them. In an S7-1500 optimized-access DB (Optimized Block Access, on by default), UDT member offsets are determined by the compiler and cannot be relied on as fixed byte offsets in communication — Modbus/GET-PUT communication mapping must use explicit variables or MOVE_BLK to copy into a standard-DB communication buffer, and cannot map a whole optimized DB via an ANY pointer.

**Pitfalls**: (1) nesting a UDT that contains an ARRAY inside another UDT — the nesting count follows the deepest path and easily exceeds the limit; (2) mapping a UDT block directly with Modbus or GET/PUT in an optimized DB scrambles data because there is no fixed address.

*Sources*: TIA Portal Information System > SCL > Data Types > UDT nesting limit; TIA Portal V17 help, PLC data types (UDT)


## rm-a [security] S7-1500 V2.9 firmware new devices ship with two blocking security defaults (access level NoAccess, confidential configuration WithoutPassword) that must be fixed via configure_plc_security before hardware compile/download

Real-machine session (TIA V20, 2026-08): a freshly created S7-1500 device on V2.9 firmware compiles hardware with 3 errors out of the box — accessLevel=NoAccess (requires setting full access protection) and confidentialConfigurationProtection=WithoutPassword (requires configuring the machine-confidential password), plus the PLC communication certificate. Both defaults must be repaired via tia_openness_configure_plc_security (access_level=FullAccess, confidential_protection=disabled); missing either one still fails. After the fix, hardware compile returns 0 errors and download to PLCSIM succeeds. V2.5 firmware devices do not carry these two defaults.

**Pitfall**: creating an S7-1500 V2.9 device and going straight to compile/download — the two security defaults block hardware compile; download alone can pass compile yet die on PlcMasterSecretPassword.

*Source*: TIA V20 new S7-1500 V2.9 device — hardware compile reported 3 errors (accessLevel NoAccess + confidentialConfigurationProtection WithoutPassword + PLC communication certificate); configure_plc_security(FullAccess, disabled) then hardware compile 0 errors, download to PLCSIM succeeded; V2.5 device had neither error


## rm-b [addressing] S7-1500 expansion module I/O addresses allocate from byte 0 contiguously per module, independent of slot number — read the hardware config startAddress before creating tags

Real-machine session (TIA V20, s7-1500 CPU without onboard I/O): each expansion module's I/O addresses are allocated contiguously from byte 0 in module order (DI16 -> I0.0..I1.7, next DI16 -> I2.0..I3.7, DQ16 -> Q0.0..Q1.7) and have NO fixed relationship to the slot number. Guessing addresses from slot positions (e.g. assuming slot 3 starts at I2.0) creates tags on addresses the configured hardware does not own, surfacing only at compile time as 'Inputs or outputs are used that do not exist in the configured hardware' (or a hardware-overlap warning). Always read the real startAddress from tia_openness_read_hardware_config before building the tag table.

**Pitfall**: allocating tag logical addresses from slot arithmetic instead of the read-back startAddress — compile emits the nonexistent-I/O error and the whole tag batch must be re-addressed.

*Source*: TIA V20 hardware readback — DI16_1(slot2)=I0.0..I1.7, DI16_2(slot3)=I2.0..I3.7, DQ16_1(slot4)=Q0.0..Q1.7; the first tag batch assumed slot*2 addressing and compiled with 'Inputs or outputs are used that do not exist in the configured hardware'; after re-addressing from the real startAddress, compile returned 0 errors / 0 warnings

