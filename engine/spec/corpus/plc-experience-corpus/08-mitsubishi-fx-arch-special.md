# Mitsubishi FX Architecture / Special Functions

> Applies to: vendor=mitsubishi family=fx3; M8000/D8000 range, high-speed counting, interrupts, positioning, retentive memory, device planning
> 18 items total, sorted by occurrence count (occ/30) descending.


## occ30 [architecture] M8000/M8002/M8013 are the three core special relays forming an FX program's skeleton; their semantics must be kept distinct

M8000 is always ON while the PLC is in RUN (equivalent to Siemens SM0.0); M8002 turns ON for only the first scan cycle after power-up or STOP→RUN (initialization pulse); M8013 is a 1-second clock pulse. Together they cover about 90% of system-level needs:
- M8002: place all power-up initialization (MOV default values into D registers, RST counters, set the initial step) after this contact, guaranteeing it runs once and is ready before the first real scan;
- M8000: circuit conditions that require continuous enabling;
- M8013: slow blinking and seconds counting without an extra timer;
- Additional: M8001 (always OFF in RUN), M8011 (10 ms), M8012 (100 ms), M8014 (1 min) used as needed.
These special relays are driven by the system firmware; users may only read their contacts and must not write them with OUT/SET — writing is ineffective or raises an exception. M8040 (disable STL step transfer) and M8034 (disable all outputs) are user-settable control-type special M relays, a few of the exceptions.

**Pitfalls**: (1) using M8000 instead of M8002 for initialization — M8000 is ON every scan, so the init logic overwrites user-written values every frame (HMI-written parameters are lost the next frame); (2) M8002 turns ON only for the first scan, so re-triggering initialization mid-run requires a separate custom flag; (3) writing special relays with OUT M8002 / OUT M8000 may silently fail or raise a CPU exception on real hardware.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 5/7/8 special auxiliary relay list; FX3U Programming Manual (JY997D16601) Section 8; distilled engineering judgment (strong community consensus, 30 occurrences)


## occ30 [architecture] The retentive (latched) memory range must be set explicitly in the PLC parameters; default boundaries vary by model and must not be assumed

FX-series devices (M, D, C, T, etc.) are split into retentive and non-retentive ranges; the boundary is set in GX Works2/GX Developer under "PLC Parameters → Device Setting", not automatically decided by which number you program. FX3U factory-default retentive ranges: M500~M1023, S500~S899, C200~C255, D200~D511 (varies slightly by firmware version). FX2N default retentive ranges differ, so re-verify when porting across models.
Operating points:
① confirm on the parameter page and archive a screenshot before starting the project;
② place data that must survive power loss (process recipes, accumulated production count, equipment runtime, step memory) explicitly into the retentive range;
③ place flags that must reset on power-up (E-stop memory, output enable, running intermediate variables) into the non-retentive range;
④ retention is backed by the built-in lithium battery or supercapacitor; M8006 (FX3U) = low-battery-voltage alarm, monitor it on the HMI;
⑤ after changing the retentive range, perform a full memory clear before downloading, to avoid leftover old values causing abnormal behavior on first power-up.

**Pitfalls**: (1) placing recipes/counters in the non-retentive range (e.g. D100) — data zeroes on power loss and the machine runs abnormally with default zeros; (2) placing the E-stop flag in the retentive range — the E-stop bit is still set after a power cycle and the machine cannot start; (3) porting from FX3U to FX2N — D registers that were retentive become non-retentive and recipes are lost on power-down; (4) when initializing with M8002, if retentive data has already been restored, decide whether it should be overwritten, otherwise power-up wipes the previous workpiece count.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 2 / retentive function; FX3U Hardware Manual Ch. 5 device description; GX Works2 Operating Manual PLC parameter setting; FX2N Programming Manual device list appendix; distilled engineering judgment (strong community consensus, 30 occurrences)


## occ30 [addressing] Device allocation should be partitioned by function early in the project with spare room reserved; never allocate ad hoc without a plan

In the FX series the device number is the address — there is no Siemens-style symbol table or DB-block alias mechanism (GX Works2 supports comments, but only the numbers remain after download), so discipline relies entirely on documentation. Before starting the project you must produce a device allocation table and lock the partition boundaries; inserting arbitrarily mid-project causes address conflicts and a maintenance disaster.
Recommended partitioning (FX3U):
- X000~X007: high-speed / special input zone (high-speed counting, interrupts); X010+ general inputs;
- Y000~Y003: positioning pulse/direction zone; Y004+ general outputs;
- M0~M99: general work bits / I/O mapping flags (non-retentive);
- M100~M199: alarm/fault flags;
- M200~M499: process-logic intermediate bits;
- M500~M1023: retentive flags (step/recipe/mode);
- D0~D99: temporary computation / HMI read-write;
- D100~D199: process recipe parameters (place in the retentive range as needed);
- D200~D499: retentive process data / accumulated totals;
- D500~D999: communication / HMI mapping buffer;
- D1000+: isolated zone for expansion / interrupt use;
Reserve 10~20% spare in each segment; isolate the communication mapping area (CC-Link / RS-485 auto-refresh D range) separately to avoid overlap with process data. When using index registers Z (Z0~Z7) for indirect addressing in bulk operations, note that subprograms modify Z, and dirty leftover values in the main program corrupt indirect addressing.

**Pitfalls**: (1) stacking sequentially from D0/M0 throughout — address conflicts on expansion, and the auto-refresh comm-mapping D range overlaps user data with no compile error; (2) the retentive/non-retentive boundary cutting through a critical zone; (3) HMI and PLC engineers each claiming D200 and overwriting each other during integration; (4) casually storing data in high-numbered M and later finding it occupied by an expansion module or special function.

*Source*: distilled engineering judgment (strong community consensus, 30 occurrences); Mitsubishi FX3U Programming Manual device description chapter; FX3U Hardware Manual device range appendix; 工控人家园 forum FX device-planning discussions


## occ30 [counters] High-speed counters C235~C255 are hardware-bound to fixed input terminals and must be handled with the dedicated DHSCS/DHSCR/DHSZ instructions

FX3U high-speed counters C235~C255 are driven by hardware interrupts; counting runs at interrupt level, unaffected by the scan cycle, up to 100 kHz (single-phase) / 50 kHz (A-B phase). Each number maps to a fixed input terminal and cannot be remapped in software:
- C235 (1-phase 1-count) → X000; C236 → X001 … C244 → X007;
- C251 (A/B phase) → X000/X001 … see the manual table for specifics;
Once an input terminal is taken by an HSC, that X point is still readable by ordinary ladder logic but must not be reused for ordinary counting or edge detection, otherwise a logic race occurs.
Usage points:
① set the corresponding M8235~M8255 enable bit before use;
② comparison outputs must use DHSCS (compare-set), DHSCR (compare-reset), DHSZ (zone compare) — these run at the hardware interrupt layer, responding independently of the scan;
③ reset with HSCR rather than an ordinary RST to avoid a race window;
④ read the 32-bit current value with DMOV or DCMP; an ordinary MOV takes only the low 16 bits and truncates at K32768+;
⑤ during planning, lock the encoder → X000~X007 mapping first, and allocate the rest of the I/O starting at X010.

**Pitfalls**: (1) allocating ordinary DI first and then adding an encoder — finding C235 forcibly occupies X000 and being forced to rewire; (2) comparing a high-speed counter value with an ordinary CMP/ZCP — scan delay causes the target value to be skipped and the position overshoots; (3) simultaneously enabling multiple HSCs that share the same physical input, causing a conflict; (4) issuing DRVA immediately after RST C235 — the race window causes a coordinate error of several pulses that accumulates.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 11/18/19/26 high-speed counters; FX3U Hardware Manual high-speed input spec; FX3U Hardware Manual (JY992D88901) §5 high-speed counter input terminal assignment table; distilled engineering judgment


## occ30 [architecture] Interrupt subroutines (I□□□) fall into three families, must be managed with EI/DI/IRET, and must be kept extremely short

FX3U supports three interrupt types, each with its own trigger condition and numbering rule:
- Input interrupts I00x~I50x: on X000~X005 rising edge (x=0) / falling edge (x=1), response time about 200 µs;
- Timer interrupts I6xx~I8xx: period 1~99 ms (e.g. I610=10 ms, I620=20 ms), suited to fixed-period sampling / PID;
- High-speed counter interrupts I010~I060: triggered on a DHSCS compare match;
Priority: input interrupt > timer interrupt > counter interrupt; nesting is not supported by default.
Usage rules:
① the main program must contain an EI instruction to enable interrupts (they are disabled by default); DI masks temporarily; IMASK masks individual pointers;
② interrupt subroutines are written after the main program's FEND, begin with an I label, and end with IRET;
③ the subroutine must be extremely short (target equivalent execution time < 1 ms), doing only minimal actions such as flag-setting / data sampling, deferring complex processing to the main program;
④ forbidden inside an interrupt: T timers (refreshed at scan level, do not accumulate inside an interrupt), FROM/TO (bus lock), FOR-NEXT loops, and time-consuming communication such as RS/MODBUS;
⑤ guard against data races when an interrupt shares devices with the main program: give interrupt-only data its own D segment, protect critical sections with DI/EI, or use ping-pong buffering.

**Pitfalls**: (1) forgetting EI so interrupts never fire — indistinguishable from a wiring fault; (2) omitting IRET at the end of the subroutine — the program runs away or the CPU stops on an exception; (3) writing OUT T inside an interrupt expecting timing — T does not accumulate inside an interrupt and never fires; (4) putting communication or heavy computation inside timer interrupt I610 — the main scan bloats and triggers a WDT stop; (5) omitting FEND so the interrupt subroutine is scanned as part of the main program.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 12/15/16/17/18 interrupt functions; EI/DI/IRET instruction description; FX3U Programming Manual Section 7 Interrupt Pointers; distilled engineering judgment


## occ30 [architecture] The D8000-range special data registers have asymmetric read/write attributes and are the only official interface for PLC status diagnosis and parameter configuration

D8000~D8511 are the system special data registers, in three categories:
- Read-only status values (written by the system, not changeable by the program): D8010 current scan time (units of 0.1 ms), D8011 minimum scan time, D8012 maximum scan time, D8013 real-time clock seconds;
- Writable configuration parameters (set by the program): D8000 watchdog timer timeout (default 200 ms, writable), D8020 input filter time / analog offset, D8120 RS-port communication format;
- Diagnostic / error area (read-only): D8004 the special-M number of the latest error, D8060~D8069 syntax/operation error step numbers, D8067 latest operation error code;
Common diagnostic flow: on a PLC error, read D8004 first to identify the error category, then read D8060 to locate the faulting instruction; monitor D8010/D8012 to judge whether the scan is overloaded (recommend a permanent HMI display).
Important: the meaning and addressing of D8000-range registers differ in part between FX2N and FX3U, so verify against the manual item by item when porting across models. D8010 is in units of 0.1 ms — divide by 10 to convert to ms after reading. Writable registers (such as D8120 communication format) should be written once in the M8002 initialization segment; repeated writes during run reset the communication port every scan.

**Pitfalls**: (1) writing a read-only D8xxx (e.g. D8010) raises no error but is overwritten by the system next scan — mistaken for a successful write; (2) MOV-writing D8120 serial parameters every scan — the comm port resets every frame, continuously interrupting communication; (3) using a D8010 reading directly as ms (actual unit 0.1 ms), underestimating scan time by 10x; (4) blindly enlarging the D8000 watchdog (e.g. K9999) to mask an infinite-loop bug — the machine hangs with the CPU never alarming.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) appendix, special data register D8000~D8255 table; FX3U Programming Manual Section 8 Special Data Registers; FX2N Programming Manual special device chapter; distilled engineering judgment


## occ28 [architecture] Positioning instructions DRVI/DRVA/ZRN depend on the fixed transistor output ports Y000/Y001/Y002 and must use M8029 to detect completion

FX3U has built-in 3-axis independent positioning (Y000 axis-1 pulse / Y002 axis-1 direction, Y001 axis-2 pulse / Y003 axis-2 direction, Y004/Y005 axis 3), up to 100 kHz. DRVI (relative positioning), DRVA (absolute positioning), and ZRN/DSZR (homing) pulses are produced by internal independent pulse generators, consuming no scan time but taking hardware control of the corresponding Y ports.
Key constraints:
① must use a transistor-output (NPN/PNP sink/source) FX3U; a relay-output type cannot produce high-speed pulses;
② during positioning, Y000~Y005 are taken over by hardware; no other place in the ladder may drive the same Y coil;
③ during execution, use M8340 (Y000 busy) / M8350 (Y001 busy) / M8360 (Y002 busy) to judge axis state;
④ the instruction-complete flag M8029 is ON for only one scan cycle, on the scan frame where pulse output finishes; latch it with a rising edge (PLS), never level detection;
⑤ operating parameters (frequency D8147/D8146, accel/decel time D8148) must be set before issuing the instruction; changing them mid-run causes a sudden pulse-frequency jump;
⑥ DRVA depends on the coordinate origin — homing via ZRN/DSZR must complete before absolute positioning can be used;
⑦ current position D8140/D8141 (Y000 axis, 32-bit), D8142/D8143 (Y001 axis);
⑧ extending FX3U beyond 3 axes requires an expansion module such as FX3U-2HSY-ADP.

**Pitfalls**: (1) running DRVI on a relay-output FX3U — no pulse output, M8029 never sets, the program stalls; (2) waiting for positioning completion with a T timer instead of M8029 — with changed speed parameters or high load inertia, the next step triggers before positioning finishes and hits a limit; (3) M8029 lasts only one scan cycle, so level detection misses it and the flow does not advance; (4) issuing DRVA absolute positioning without homing (ZRN) first — the coordinate system is offset and hits a limit; (5) an ordinary solenoid valve wired to Y000 switches on/off at high frequency with the pulses during positioning.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 15/18 positioning control instructions; FX3U Positioning Control Manual (JY997D16701/JY997D22801/JY997D28701/JY997D30701/JY997D34801) DRVI/DRVA/ZRN/DSZR chapters; FX3U Positioning Control Edition Chapter 5; distilled engineering judgment


## occ26 [scan_cycle] Scan-cycle monitoring: D8010/D8011/D8012 are the primary performance metric; the D8000 watchdog defaults to 200 ms and must be configured sensibly

FX3U scan time = program execution time + I/O refresh + communication service time. It increases significantly with many CC-Link / RS-485 slaves attached or with heavy FOR-NEXT loops, floating-point math, or FROM/TO instructions.
Monitoring: D8010 (current scan time, units of 0.1 ms), D8011 (minimum scan time), D8012 (maximum scan time); recommend a permanent HMI display, establish a baseline during commissioning, and optimize immediately if it exceeds 100 ms.
Watchdog: D8000 holds the timeout setting (default 200 ms, writable); a timeout triggers a CPU error stop (M8065 ON). As a stopgap you can extend it to 300 ms with MOV K300 D8000 after M8002; the real fix is to optimize the program or split work into interrupts.
Fixed scan: setting M8039 ON + writing the target period (ms) to D8039 forces a fixed scan cycle; when the actual scan is longer than the setting, it does not wait.
Note: during online debugging, frequent forcing/monitoring of variables by the programming software adds communication load and lengthens the scan; after going live and removing monitoring, the scan shortens and timing behavior becomes inconsistent.

**Pitfalls**: (1) setting D8000 to 9999 ms to evade the watchdog — on an infinite loop the CPU never stops and the machine runs out of control; (2) using a D8010 reading as ms (actual unit 0.1 ms), underestimating by 10x and wrongly judging it safe; (3) checking D8012 only after a problem occurs, unable to trace which program section caused the overrun; (4) setting D8039 too small (e.g. 1 ms) when the actual scan cannot finish within 1 ms, making the fixed scan meaningless.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) appendix, D8000/D8010~D8012 special data register descriptions; FX3U Programming Manual Section 8 Special Data Registers; M8039/D8039 constant-scan-mode description; distilled engineering judgment


## occ22 [sequencing] Step-ladder STL/S is FX's most efficient sequential-control structure; outputs of inactive steps turn off automatically

FX's STL (step ladder) uses state relays S0~S899; when a step is active only that step's logic is scanned and the others are not executed. S0~S9 are initial steps, S10~S19 are homing steps, S20~S499 are general steps, and FX3U extends to S999.
Key mechanism: coils/outputs of inactive steps within STL are auto-cleared by the system with no manual RST needed — natural isolation that saves a lot of interlock code; SET Sxx transfers to the next step and the previous step turns OFF automatically; a RET instruction must appear at the end of every STL program block.
Note: driving the same Y output with OUT across concurrently active STL steps causes output contention and flicker — use SET/RST instead. Setting M8040 ON freezes step transfer, and combined with M8034 enables bumpless online debugging.

**Pitfalls**: (1) omitting RET to close the STL block, or driving a shared Y output with OUT inside the STL block, causing multi-step contention and flicker; (2) driving S with an ordinary SET and then RST-ing that step inside the STL block, so the step-ladder flow and ordinary logic interfere; (3) M8034 masks outputs but does not freeze the step state — after an E-stop the steps have already advanced, and releasing M8034 makes the machine jump straight to the new state and act.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) step-ladder STL/RET chapter; M8040 description; distilled engineering judgment


## occ20 [architecture] Special-function modules are read/written via FROM/TO instructions on their buffer memory (BFM); module numbering starts at 0 with the first expansion unit to the right of the main unit

FX-series expansion module (analog FX2N-4AD/4DA, communication, positioning, etc.) internal data is not in the main CPU's D-register space but is accessed via FROM (read BFM) and TO (write BFM) instructions, specifying the unit number (Unit No.) and buffer address (BFM#). Unit numbers increment starting at 0 for the first expansion unit immediately to the right of the CPU.
Example: FROM K0 K5 D10 K1 = read 1 word from unit 0 BFM#5 into D10; TO K1 K0 D20 K2 = write 2 words from D20 to unit 1 BFM#0.
Performance note: each FROM/TO takes about 100~400 µs; executing several unconditionally every scan lengthens the scan cycle significantly, so throttle with M8013 or a timer, read non-real-time data once every N scans, or use a block read (FROM K1 K0 D0 K8) instead of a word-by-word loop. BFM addresses must be looked up in the relevant module manual, and different firmware batches may differ; the TO instruction's second parameter (BFM number) is decimal and must not use an H-prefix hexadecimal.

**Pitfalls**: (1) after swapping module slots the Unit No. shifts wholesale, and hardcoded unit numbers all misalign and read/write the wrong module with no compile error; (2) executing 16 FROMs unconditionally every scan raises scan time from 5 ms to 12 ms and triggers a WDT; (3) mistakenly using hexadecimal for the BFM number, actually accessing the wrong address and scrambling the analog channels.

*Source*: Mitsubishi FX2N-4AD User's Manual (JY992D65101) BFM table; FX3U Programming Manual FROM/TO instruction description; distilled engineering judgment


## occ18 [architecture] Control-type special relays such as M8034/M8033 are safety/debug system-level hooks and must be documented

With M8034 ON, all Y outputs are forced OFF (the program keeps scanning) — useful for masking outputs during debugging without disturbing logic tracing, and for a soft E-stop. With M8033 ON, all Y outputs hold their current state after the PLC goes RUN→STOP (by default outputs all go OFF after STOP), suitable where STOP must not drop cylinders (e.g. clamps). These two are user-writable control-type special M relays, unlike the read-only status type (M8000/M8002/M8013).
Engineering requirement: use of M8034/M8033 must be clearly noted in the electrical drawings and program comments to keep maintenance staff from misjudging the safety state. Setting M8040 ON freezes STL step transfer; combined with M8034 it enables bumpless online debugging: freeze stepping + mask outputs → modify parameters → release and resume.

**Pitfalls**: (1) temporarily setting M8034=ON during debugging, forgetting to reset it before delivery, so on-site the outputs never move when powered; (2) using M8033 to hold outputs but not noting it in the electrical drawings — maintenance staff assume the machine is de-energized and safe after STOP, while cylinders/heaters are actually still energized; (3) M8034 masks outputs but the step state keeps advancing — after an E-stop, releasing M8034 makes the machine act straight from the new state.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) special auxiliary relay M8033/M8034/M8040 descriptions; distilled engineering judgment


## occ16 [scan_cycle] Timers T do not update inside interrupts; high-precision timing must instead use a timer interrupt + D-register counting

The current value of an ordinary FX timer T is refreshed only at scan end; reading T's current value inside an interrupt service routine yields the stale value from the previous scan, and OUT T inside an interrupt cannot accumulate. For 1 ms-class precision timing you must build a software timer with an I6xx timer interrupt (1~99 ms period) + a self-incrementing D register. Likewise, reading a refresh-type register such as D8010 inside an interrupt yields the stale value from the end of the previous scan; when a high-speed interrupt needs a real-time time base, use the interrupt's own period as the timing basis. The FX3U REF instruction bypasses the scan-refresh limit for immediate output. Non-retentive timers T0~T199 (100 ms) / T200~T245 (10 ms) clear their current value immediately when the coil-drive condition drops; retentive timers T246~T249 (1 ms) / T250~T255 (100 ms) hold their current value, and RST Txx resets them explicitly.

**Pitfalls**: (1) using T0 to time 10 ms inside timer interrupt I610 (10 ms) — T0 is always 0 because the interrupt completes before the scan and T0 is never refreshed; (2) reading D8010 for speed calculation inside a 1 ms timer interrupt — the value is stale from the previous cycle (possibly 5~20 ms), badly lagging the speed feedback; (3) using a non-retentive T to measure accumulated time across multiple start/stops — the current value clears during stops.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 6 timer characteristics and interrupt notes; FX3U Programming Manual Section 6 Timer Characteristics & Interrupt Notes; distilled engineering judgment


## occ15 [architecture] The meaning of M8000-range / D8000-range addresses differs across FX sub-models; verify item by item when porting across models

FX2N, FX3U, FX3G, and FX1S share the M8000/D8000 naming system, but the meaning, read/write attributes, and even existence of specific addresses all differ. For example: FX1S has no high-speed-counter-related D8140/D8141; FX3G's D8120 serial-format bit definitions differ slightly from FX2N's; FX3U adds Ethernet/CC-Link-related special D ranges; FX2N tops out at M8255/D8195, while FX3U extends to M8511/D8511. Device count limits also differ: FX2N M0~M499 (general) / M500~M1023 (retentive), D0~D199/D200~D511; FX3U extends to M0~M7679, D0~D7999. Copying FX3U special relays verbatim to FX2N produces no compile error but fails silently or misbehaves at run time. When porting, export both PLCs' special-device lists and compare item by item.

**Pitfalls**: (1) importing an FX2N program into FX3U, doing only I/O remapping, and going live — differing communication-parameter bit definitions such as D8120 make all communication fail; (2) saving an FX3U project as FX2N type without careful checking — high-speed counter / positioning instructions silently stop working and are found only on site; (3) FX3U's default retentive range differs from FX2N's, so after porting the parameters are out of sync and the retentive range is misaligned.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) appendix on differences from FX2N; FX2N Programming Manual special-device chapter; Mitsubishi FX-series CPU specification comparison table (document L(NA)-08028); distilled engineering judgment


## occ12 [architecture] M8004/M8006 are system fault flags that must be monitored on site; ignoring them leads to silent failure

M8004 is set to 1 on any operation error (division by zero, indirect-addressing out of range, etc.), with the error code stored in D8004/D8060~D8069; M8006 is the low-battery-voltage alarm (FX2N/FX3U models with a lithium battery), and D8006 holds the battery-voltage value. Projects must monitor these two flags in the HMI or an alarm routine: on M8004 the machine should stop and display the error code, and M8006 should prompt battery replacement. Ignoring M8006 causes loss of retentive data and inexplicable initial-value errors after an on-site restart. When D8010 current scan time exceeds the D8000 watchdog setting, a CPU error stop is triggered. Monitoring only X-point E-stops while ignoring M8004/M8006 is a common oversight in FX projects.

**Pitfalls**: with a depleted battery or an operation error, the PLC runs silently in a faulty state until data corruption is discovered; watching only the M8060~M8067 error flags without reading the D806x step numbers leaves the specific instruction line unlocatable.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) special auxiliary relay list; distilled engineering judgment


## occ11 [addressing] X/Y device numbers are octal; confusing them with the decimal M/D/T/C numbering causes I/O mapping misalignment

In the FX series, X (input) and Y (output) device numbers are octal (X0~X7, X10~X17, X20…), while M/S/T/C/D/V/Z are all decimal. When expansion I/O modules are added, X/Y continue accumulating in octal from the end of the previous expansion. Beginners habitually treat X10 as the 10th input, when it actually corresponds to the 8th physical input port, misaligning the whole I/O map. When planning the I/O allocation table, annotate module slot, physical terminal number, and software octal address together.

**Pitfalls**: wiring X10 as if it were decimal point 10, when it actually corresponds to octal point 8 (the 9th input) — the control logic is offset across the board; I/O testing looks normal but the program's decisions are wrong.

*Source*: Mitsubishi FX3U User's Manual, hardware edition, Ch. 4 I/O address assignment; distilled engineering judgment


## occ10 [architecture] The file-register R area is the only choice for large-capacity power-fail-retentive data; it requires bulk access via BMOV and has a write-endurance limit

FX3U file registers R0~R32767 (require an EEPROM or Flash card) provide large-capacity power-fail-retentive word storage, suitable for multiple process recipes, history records, etc. The ordinary D area's retentive range is limited; when needs exceed it, the R area must be used. Accessing the R area requires BMOV to move the target R block into the D area before processing — arithmetic cannot be done directly on the R area. The R-area write count has an endurance limit (Flash about 100,000 cycles), so frequent writing needs write-protection logic: trigger a one-shot BMOV block write only when a recipe changes, and read-only (no write) during run.

**Pitfalls**: treating the R area like an ordinary D area with frequent real-time writes (e.g. writing every scan cycle), wearing out the Flash prematurely and raising an error; not distinguishing the R-area access method from the D area's, and doing an ADD directly on an R-area address with an incorrect result.

*Source*: Mitsubishi FX3U User's Manual file-register chapter; 工控人家园 forum recipe-storage discussions; distilled engineering judgment


## occ8 [scan_cycle] High-speed counting and interrupt handling are decoupled from the scan cycle, but the main program's read of the HSC current value has a one-scan delay that requires a buffer by design

FX-series high-speed counter hardware counting is done by dedicated hardware outside the scan cycle, but the main program's read of C235's current value is refreshed at scan end, with a delay of up to one scan cycle. Where position accuracy is critical, capture the position value in a high-speed-counter interrupt (I010, etc.) and store it in a dedicated D register, rather than reading C235 in real time in the main program. After a DHSCS compare value is dynamically modified via MOV, the new value is not read by the high-speed-counter hardware until the next scan cycle; in precise-synchronization applications such as flying saw / rotary shear this delay must be designed in. Setting a counter compare output with DHSCS/DHSCR is faster than OUT Y in the main program and reduces output delay.

**Pitfalls**: using C235's current value directly in the main program to judge position and control braking — at high speed the scan delay drifts the braking point out of tolerance; in a flying-saw application, dynamically modifying the cut-position compare value without accounting for the one-scan delay systematically offsets the cut position, mistaken for a mechanical problem and leading to repeated servo-gain tuning.

*Source*: Mitsubishi FX3U Programming Manual (JY997D16601) Ch. 16/26 high-speed counters, DHSCS/DHSCR instruction descriptions; FX3U Programming Manual Section 6 Timer Characteristics & Interrupt Notes; distilled engineering judgment


## occ7 [comm] D8120 controls the FX3U serial communication format; write it once in the M8002 initialization segment — changes during run take no effect

The FX3U RS/RS2 instruction communication format is determined by D8120 (channel 1), including bit-field settings for baud rate, data bits, parity, and stop bits. D8120 must be written once during program initialization (MOV triggered by M8002); changes during run do not take effect immediately. FX2N's D8120 format definition differs from FX3U's and cannot be reused directly. In projects, the communication settings must spell out the meaning of each bit in comments for maintainability.

**Pitfalls**: (1) modifying D8120 during debugging and expecting it to take effect immediately without restarting the PLC — the format is not updated and it is misdiagnosed as a wiring problem; (2) porting an FX2N program to FX3U where the D8120 bit-definition difference makes the communication parameters wrong and all communication fails.

*Source*: Mitsubishi FX3U Communication Manual (JY997D15801) RS instruction chapter, D8120 description; FX3U Programming Manual D8120 special-register description; distilled engineering judgment
