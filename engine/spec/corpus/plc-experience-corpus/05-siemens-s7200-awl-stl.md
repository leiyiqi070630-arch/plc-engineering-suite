# Siemens S7-200 Micro/WIN (LAD/STL)

> Applies to: vendor=siemens family=s7_200 language=awl; SM0.0/0.1, V-memory planning, timer number ranges, STL 9-level stack, EU/ED implicit edge storage (bare instruction, no operand), SBR local L-memory, Freeport XMT/RCV
> 22 entries total, ordered by occurrence count (occ/30), highest first.

## 2026-07 Micro/WIN SMART V2.7 compile-loop addendum

These are confirmed facts obtained from a CPU ST40 project through a POU import -> compile -> Ctrl+S save -> POU export loop. The basic-catalog block is 1250 bytes and the advanced-catalog block is 689 bytes, both at 0 errors / 0 warnings; the inputs and Micro/WIN export files are saved under `evidence/s7200-real-exports/smart-v2.7-*-catalog-*.awl`.

- **Name mapping**: the instruction tree and help tables spell it `CEVENT`, but the STL importer accepts `CEVNT`; `SR/RS` are LAD/FBD compound blocks and cannot be treated as single STL mnemonics.
- **Import structure**: do not place several mutually independent logic chains in one Network. In this test every mnemonic was itself valid, but merging them into a single Network flagged it as an invalid network; splitting them into separate Networks compiled all three MAIN/SBR/INT blocks.
- **PID**: the LOOP of `PID TABLE,LOOP` can only be 0..7, and the table area occupies 80 bytes. A production program must also fix the call cycle and handle normalization, clamping, integral saturation, and bumpless manual/auto switching; these are engineering guidance rather than pure syntax lint.
- **HSC/PTO/PWM**: `HSC` is 0..5, `HDEF` mode is 0/1/3/4/6/7/9/10, `PLS` is 0/1/2. Valid numbering still does not mean the program will run: check for fixed hardware-resource conflicts among high-speed inputs, high-speed outputs, motion axes, and the PLS generators.
- **OUC/GET-PUT**: `GET/PUT TABLE` and `TCON/TSEND/TRECV/TDCON TABLE` all compile, but the CPU must support Ethernet. Requests should be edge-triggered and managed by a Busy/Done/Error state machine; the table and buffers must not be overwritten while the operation is active.
- **PROFINET**: `RDREC/WRREC REQ,TABLE,DONE,STATUS` and `BMIR/BMIW IN,OUT,N` compile; `N` is 1..128 and must not cross submodule boundaries. Without a real device/slot/submodule configured, this only proves the syntax is valid; do not claim field communication is verified.
- **RTC/interrupts**: `TODW/TODWX` should be triggered only by a one-shot set command, not written every scan; an INT should do only short operations and set flags, while complex computation, retries, and communication state machines run back in the main program.

## 2026-07 Modbus RTU Master import-state loop

This comes from the real Micro/WIN SMART V2.7 import, compile, and export loop in `evidence/s7200-real-exports/smart-v2.7-modbus-master-verification.md`. It describes state that must be confirmed in the engineering software, not syntax that the AWL text alone can prove.

- **Allocate the library and V-memory first**: before using `MBUS_CTRL` or `MBUS_MSG`, allocate the Modbus RTU Master library and its V-memory in the target Micro/WIN project, confirm the reserved area does not overlap user V-memory, then compile. The verified project uses `VB927`/286 bytes; this is only an example address, not a fixed address to copy into every project.
- **First import of a concrete pointer**: the data pointer of `MBUS_MSG` can be written directly as a concrete address such as `&VB800`. If, on the first import into a new project, the 7th operand shows a type error, re-enter that `&VB` pointer in Micro/WIN and commit with `Tab`; do not press `Enter`, since a long CALL may be split across lines and produce cascading syntax errors.
- **Do not initialize the pointer with MOVD**: `MOVD &VB800, VD760` produced error 36 in testing. Pass the concrete `&VBxxx` directly to `MBUS_MSG`, or use a DWORD pointer variable already correctly assigned by the project, and take the formal compile result as authoritative.

*Evidence*: `evidence/s7200-real-exports/smart-v2.7-modbus-master-verification.md` (0 errors / 0 warnings).


## occ30 [scan_cycle] SM0.0 (always ON) and SM0.1 (first-scan pulse) are the standard initialization entry points, with completely different semantics

SM0.0 is ON in every scan cycle and drives logic that must run unconditionally and continuously; SM0.1 is ON only in the first scan cycle after the CPU goes from STOP to RUN, then is permanently 0, and is the standard trigger for one-time initialization (clearing counters, writing V-memory defaults, presetting timers, activating the initial SCR step). The S7-200 has no OB100; SM0.1 is the only equivalent first-scan entry. SM0.0 is not a rising-edge contact and needs an EU instruction to yield a single pulse. SM0.5 (1 Hz clock) and SM0.4 (1 min clock) can drive blinking directly, with no user-written timer. Both bits are maintained by the system; program writes are ineffective and get overwritten by the system.

**Pitfalls**: using SM0.0 for initialization resets every scan, so parameters changed at runtime are repeatedly overwritten; using SM0.1 for continuous drive leaves the logic permanently dead from the second scan on; building a first-scan flag from an ordinary M bit that is configured as retentive means restart does not trigger initialization.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Appendix B/C/D Special Memory (SM) Bits SM0.0/SM0.1


## occ29 [addressing] V-memory is the S7-200's only general data area; the VB/VW/VD granularities share the same physical address space, so they must be aligned and partitioned

The S7-200 has no DB blocks; all user data lives in V-memory (Variable Memory). Addressing granularities: VB (byte), VW (word, 2 bytes), VD (double word, 4 bytes), Vx.y (bit), all referenced by byte offset. VW100 = VB100 + VB101, VD100 = VB100..VB103; the three overlap physically, a later write overwrites an earlier one, and the compiler reports no error. Start VW and VD on even bytes (VD on a multiple of 4); odd-address access is syntactically legal but produces cross-byte splicing errors. V-memory size: CPU 222 up to VB0-VB2047, CPU 226 up to VB0-VB10239. M-memory is only 32 bytes (MB0-MB31); when that is not enough, move to V-memory. All SBR/INT/main programs share the same V-memory, so maintain an address-allocation table partitioned by function (e.g. comm buffers VB0-VB99, process variables VB100+, recipes VB1000+) to prevent clobbering. Subroutine locals use L-memory (LB/LW/LD, up to 64 bytes); the data disappears after return, so intermediate results that must persist across scans must go in V-memory. Indirect addressing: load a &VB address into a VD pointer and access via *VD, stepping +1 byte / +2 word / +4 double word — the only way to iterate an array.

**Pitfalls**: mixing VW100 with VB100/VB101 overwrites each other; odd addresses VW1/VW3 fail silently; different SBRs each allocating from VB0 clobber each other; VD100 overlapping VW100 corrupts the high bytes; using L-memory as a global loses data after the subroutine returns.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 3/4 Data Types, Memory Ranges and Addressing; Appendix A Memory Ranges Table


## occ28 [timers] TON/TOF/TONR timer resolution is fixed by the number range (1 ms/10 ms/100 ms); picking the wrong number costs 10-100x accuracy

S7-200 timer resolution is bound to the number and cannot be changed by a parameter. On the CPU 22x, for TON/TOF: T32/T96 are 1 ms, T33-T36/T97-T100 are 10 ms, T37-T63/T101-T255 are 100 ms (exact ranges per manual Table 6-1; they vary slightly by version). TONR (retentive) uses a separate number range under the same rule. The PT value is a count in units of the corresponding resolution (e.g. at a 100 ms time base, PT=50 means 5000 ms). Maximum timed PV = 32767 time-base units. 1 ms timers are interrupt-driven and accurate; 100 ms timers update when the coil executes, so a long scan cycle introduces error. TON/TOF coils reset automatically on power loss; TONR retains the accumulated value through power loss and needs an explicit R instruction to reset.

**Pitfalls**: using a 100 ms-range timer (e.g. T37) for control that needs 10 ms accuracy is 10x off with no error; entering PT directly as milliseconds causes a multiplied delay error; forgetting the TONR R reset leaves a residual accumulated value that trips immediately on restart; copying a timer block from another project and changing only PT without checking the number range.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 Timer Instructions, Table 6-1 Timer Resolution Groups


## occ27 [interlock_safety] An output coil address may appear only once in the program; with a duplicate coil the later one overwrites the earlier (double-coil problem)

The S7-200 uses linear scanning with centralized output-image refresh: if the same Q or M bit is driven by coil instructions in several networks, the value reached at the last one is written to the image register and all earlier assignments are silently overwritten. The Micro/WIN compiler issues no duplicate-coil warning. Correct approach: combine all control conditions into a single coil within one network using parallel/series logic; or switch to S/R (set/reset) instructions with an explicit priority — a later-scanned R overwrites an earlier-scanned S, so put safety/stop logic in the last network to give it top priority. S/R must also not be mixed with OUT on the same address, since OUT will ultimately overwrite the S/R latch effect. In Micro/WIN, duplicate coils are found via the cross-reference table.

**Pitfalls**: copy-pasting a network without changing the coil address causes mutual overwrite during commissioning; placing coils for the same Q in both an SBR and the main program lets the later-executed one overwrite the earlier; SET Q0.0 in an upper network and RESET Q0.0 in a lower one keeps Q0.0 permanently 0 if the lower condition is always true.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 3 Program Execution / Output Image Register; Siemens Industry Support FAQ #64557


## occ26 [edges] EU/ED (rising/falling edge) are bare instructions with edge storage managed implicitly by the compiler; only hand-built edge detection needs a dedicated M bit

The S7-200 LAD positive-transition contact (P) and negative-transition contact (N), and the STL EU/ED instructions, each maintain an internal implicit "previous-scan state" bit; this edge storage is allocated and managed automatically by the compiler — it does not consume user M-memory and does not appear as an operand. In STL you write bare `EU` / `ED` (which test the top-of-stack result of the preceding logic), with no following operand; real Micro/WIN exports show exactly a standalone `EU`/`ED` line (see evidence/s7200-real-exports/joystick_transporte.awl, minimal_vending.awl). The operand form `EU M10.0` is S7-300/400 STL FP/FN semantics; applied to the S7-200, Micro/WIN reports an import error. The only case that truly needs a "dedicated, unique M bit" is when you do not use EU/ED but instead store the signal into an M bit yourself and compare against last scan's value to hand-build edge detection: there, reusing the same M bit in two places causes mutual overwrite and missed edges. Because EU/ED edge storage is allocated implicitly by the compiler, it never conflicts and needs no M-memory range of your own. Using EU/ED in a conditionally-called SBR can miss edges because the call frequency is irregular and the edge storage is not updated continuously; move edge detection into the main program to do it uniformly. Running EU/ED in an INT on a signal shared with the main program is unreliable, since interrupts do not execute on the scan cycle.

**Pitfalls**: using the S7-300/400 operand form `EU M10.0` / `ED M10.1` on the S7-200 makes Micro/WIN import report a "too many/illegal operand" error; when hand-building edge detection instead of using EU/ED, copy-pasting a rung without changing the compare M bit makes two independent signals share one bit, causing intermittent, very hard-to-trace missed edges in the field.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 Bit Logic Instructions EU/ED (bare instruction, no operand); Micro/WIN Help on Edge Detection; corroborated by real exports evidence/s7200-real-exports/*.awl


## occ25 [architecture] SBR subroutines pass parameters via L-memory locals (IN/OUT/IN_OUT); state that persists across calls must go in V-memory

S7-200 subroutines (SBR_0 to SBR_63, up to 64) define parameter types through a local-variable table: IN (passed in by the caller), OUT (written back by the subroutine), IN_OUT (bidirectional), TEMP (temporary, not a parameter). Locals are stored in L-memory (LB/LW/LD), are valid only for the current call, and are not retained after return, so L-memory cannot hold state that must persist across scans. Subroutine nesting is at most 8 levels. TEMP variables are not guaranteed cleared at subroutine entry and their initial value must not be read. SBR is the only modularization mechanism in S7-200 structured programming (there is no FB/FC/DB hierarchy). Explicitly assign all IN/IN_OUT parameters before the call and read OUT parameters immediately after. Inside a subroutine, operate as much as possible only on L-memory locals; directly reading/writing global M/V-memory creates implicit coupling whose side effects compound and become hard to debug when reused in many places.

**Pitfalls**: saving in an SBR's L-memory an intermediate result that must persist across scans, only to find it gone on the next call; reading the unassigned initial value of a TEMP local and getting garbage; directly reading/writing fixed global M/V addresses inside an SBR, causing mutual overwrite when reused in many places; modifying AC0-AC3 inside an SBR corrupts the main program's intermediate results (save AC values at SBR entry and restore at exit).

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6/7/9 Program Structure, Subroutines and Local Variables


## occ24 [architecture] SBR is for code reuse (synchronous CALL), INT interrupts for asynchronous events (bound via ATCH); INTs must be very short and have instruction restrictions

An SBR is called explicitly by the main program or another subroutine with CALL, executes synchronously to completion within the current scan cycle, can pass IN/OUT parameters, and can nest up to 8 levels. An INT is triggered asynchronously by an interrupt event (I/O rising edge, timed interrupt, communication complete, etc.) after being bound with the ATCH instruction, and is enabled globally with ENI. The main program is fully suspended while an INT runs, so an INT should only set flags or capture simple data, and its execution time must be far smaller than the main scan cycle. Inside an INT, calling a parameterized SBR and using FOR/NEXT are prohibited, and some instructions are restricted. AC0-AC3 (saved/restored automatically) and L-memory temporaries can be used safely in an INT. Worst-case response time equals one full scan cycle.

**Pitfalls**: calling a complex SBR or running XMT communication inside an INT makes the interrupt response time excessive, triggering a watchdog reset or masking other interrupts; a Q output changed inside an INT may be overwritten by the main-program coil on the next scan; the INT and main program reading/writing the same V byte simultaneously creates a race (use ENI/DISI to temporarily mask interrupts and protect the critical read-modify-write section).

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6/7 Subroutines, Interrupt Instructions; ATCH/DTCH/ENI/DISI


## occ23 [counters] CTU/CTD/CTUD counter numbers C0-C255 are globally shared and unique; the CW word reads the current value; reset requires an explicit R input

S7-200 counters C0-C255 share one number pool; CTU (count up), CTD (count down), and CTUD (bidirectional) may appear as only one coil per number in the program, otherwise two places modifying the same current value cause logic confusion. The current value (CV) is stored in the corresponding CW word (e.g. CW0 = C0 current value), a 16-bit signed integer capped at 32767. CTU increments on the CU rising edge; when CV >= PV the C bit sets and holds (it does not stop automatically and can keep counting to 32767, then overflows as an INT to -32768); CTD counts down from PV, setting the C bit when CV=0; CTUD has four inputs CU/CD/R/LD, and CU/CD in the same scan net out to up minus down. The reset input R is active-high (level-triggered, immediately clearing CV and the C bit) and has priority over the count inputs; the CTUD LD input reloads the PV value. You cannot reset by writing CW directly with MOVW (it is read-only). Keeping a counter-number ledger is the only reliable defense against duplicate use.

**Pitfalls**: not resetting a full CTU leaves the C bit permanently ON and downstream logic out of control; a floating CTUD CD input causes random down-counting; placing coils for the same C number in both an SBR and the main program makes them interfere; the C bit setting again after a CTU overflow causes spurious triggering; wiring the R input to a normally-closed contact for hold logic (R is level-active and clears the moment it is energized).

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 Counter Instructions


## occ22 [scan_cycle] Centralized I/Q image refresh: read the input snapshot at scan start, write outputs at scan end; intermediate assignments do not take effect immediately

The S7-200 uses centralized I/O refresh: at scan start all physical inputs are read into the I image area (a snapshot), and at scan end the Q image area is written out to the physical outputs all at once. During program execution, reading a given I bit always returns the snapshot value from the start of the cycle and does not capture changes within the cycle; assigning a Q bit changes only the image area, and the physical output is delayed until scan end. Immediate instructions (LDI/AI = immediate read, =I/QI = immediate write) bypass the image and act on the physical point directly, but when they disagree with the image data the same point can show two values within one scan, so use them only in timing-sensitive cases such as safety interlocks and keep ordinary logic on the image. Very short pulses (shorter than the scan cycle) must be captured with an interrupt on the edge and cannot be caught by main-program polling. SET then RESET on a Q bit within one scan gives the intermediate SET pulse zero physical width, so it never appears on the physical pin.

**Pitfalls**: expecting two reads of the same I point within one scan to detect a mid-scan change (it is a snapshot); expecting SET then RESET on the same Q point to produce a pulse (the physical output never goes high; use a timer across cycles); mixing immediate and normal reads of the same input point, so the values read within one scan disagree and the logic contradicts itself.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 3/4/6 Scan Cycle, Program Execution and Immediate Instructions


## occ21 [state_machine] Prefer the SCR (LSCR/SCRT/SCRE) instructions for sequential control; they are clearer than M-bit interlocks and are naturally mutually exclusive

The S7-200 provides the three sequence-control-relay instructions LSCR/SCRT/SCRE for SFC-style stepping: LSCR Sx.y activates the current step segment, SCRT Sx.z transfers to the next step when its condition is met and resets the current step automatically, and SCRE ends the current step segment. Each step's logic runs only while its S bit is active, and the system guarantees only one step is active at a time — naturally mutually exclusive. The S area (S0.0-S31.7, 256 steps) is dedicated. Compared with hand-written M-bit + SET/RST interlocks, SCR avoids multiple steps being active at once and missed resets. In practice an M-bit state machine is more flexible and suits complex multi-way branching and concurrent activation; each has its use.

**Pitfalls**: using JMP/LBL to jump out of an SCR segment leaves SCRE unexecuted and the step status bit stuck permanently active; JMP/CALL/FOR-NEXT are prohibited inside an SCR segment; manipulating an S bit directly outside its segment, or having multiple LSCR segments on the same S bit, causes logic conflicts; SCR cannot activate multiple steps concurrently.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6/10 SCR Instructions (LSCR/SCRT/SCRE)


## occ20 [comm] Freeport communication must be configured via SMB30/SMB130, with XMT/RCV driven by interrupts; do not poll from the main program

S7-200 Port 0/1 can be switched to Freeport mode (SMB30/SMB130 Mode field = 01). SMB30 configures baud rate/parity/data bits/stop bits. Transmit uses the XMT instruction plus a transmit buffer (first byte is the byte count); receive uses RCV plus receive conditions (SMB86-SMB94/SMB186-SMB194 configure start/stop characters, timeout, and maximum byte count). Transmit-complete triggers interrupt event 9 (Port0)/26 (Port1); receive-complete triggers event 23 (Port0)/24 (Port1). You must read the receive buffer in the INT and set a completion flag, then have the main program detect the flag and process the complete frame; main-program polling will inevitably drop frames at high baud rates. XMT must not be called again before the previous transmit completes (there is no hardware FIFO protection), so interlock with the transmit-complete flag. The CPU automatically restores the PPI protocol and suspends Freeport when in STOP or connected to Micro/WIN for debugging; the CPU 226 can separate the programming port and the Freeport onto different ports. For protocols such as Modbus/USS, use the official Siemens libraries and reserve the V-memory address range the library requires in advance.

**Pitfalls**: calling XMT every scan from the main program without checking the completion flag overwrites the transmit buffer before the previous frame is sent, corrupting frames; during debugging Micro/WIN occupies Port0 and the Freeport device does not respond, misdiagnosed as a hardware fault; forgetting to bind the receive interrupt with ATCH and enable interrupts with ENI means RCV never triggers; RCV buffer overrun overwrites V-memory data; the Modbus library without a reserved V-memory range clobbers user data.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 7/8/10 Communications, Freeport Mode; SMB30/SMB130 description; Siemens Modbus Library (A5E00442787); USS Protocol Library Manual


## occ18 [timers] The three timer types behave differently: TON on-delay / TOF off-delay / TONR retentive on-delay

TON (on-delay): timing starts when IN is energized, and the output bit turns ON at PT; it resets automatically when IN de-energizes. TOF (off-delay): timing starts only after IN de-energizes, and the output bit turns off at PT; re-energizing IN interrupts and resets the timing — the inverse of TON, commonly used for shutdown delays. TONR (retentive on-delay): timing accumulates while IN is energized, the current value is held through power loss, and re-energizing IN continues accumulating; the output bit turns ON after PT; it can be cleared only by an explicit R instruction (or R input). None of the three re-times automatically after reaching PV.

**Pitfalls**: using TON where power-retentive timing is needed loses the timing after restart; using TONR as a TON and forgetting the R reset makes the time accumulated before power-off trip immediately at the next power-on; TOF is the inverse of TON and beginners often invert it.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 Timer Instructions


## occ16 [architecture] The STL logic stack is 9 levels; ALD/OLD merge substacks; going too deep gives a compile error or a silent logic error

S7-200 STL is based on a 9-level logic stack. LD/LDN push a new value onto the top; A/AN AND with the current top; O/ON OR with the top; ALD ANDs the top two values, merges and pops (closing a parallel block); OLD ORs the top two values and merges (closing a series branch). When writing STL by hand, every LD pushes the stack, and beyond 9 levels Micro/WIN reports Stack Overflow or truncates silently. Converting LAD to STL, the compiler generates LPS/LRD/LPP and ALD/OLD automatically; deleting these during manual edits breaks the parallel/series structure. Split complex conditions into intermediate M bits and combine them. Writing ALD/OLD in the wrong order produces no compile error but the logic is already wrong, and when switching the LAD-STL view Micro/WIN may report an incompatible structure that cannot be decompiled.

**Pitfalls**: converting complex LAD parallel/series logic straight to STL beyond 9 levels gives a silent logic error that is hard to debug; forgetting OLD at the end of a parallel block closes the logic early and ignores later conditions; treating a hand-written STL nesting overrun as an out-of-memory condition and enlarging V-memory.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 5/6 STL Stack Operations / Bit Logic Instructions


## occ15 [addressing] SM0.0/SM0.1 are read-only system bits; the program must not assign to them

SM0.0 and SM0.1 are maintained fixedly by the CPU system; using a coil output on them is ineffective and immediately overwritten by the system. Using an OUT coil on SM0.0/SM0.1 in LAD makes initialization logic fail on the second scan or behave unpredictably. Both may be used only as contacts, never as coil targets.

**Pitfalls**: assigning to SM0.1 with a coil to manually clear it and re-trigger initialization — the system overwrites it on the next scan and the behavior is undefined.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Appendix B Special Memory (SM) Bits


## occ14 [interlock_safety] The S7-200 has no hardware safety interlock; safety circuits such as forward/reverse and E-stop must be double-interlocked in software plus external wiring

The S7-200 CPU has no Safety Integrity Level (SIL) certification, and its software interlocks are unreliable during CPU faults, a runaway program, or downloading. Any safety circuit such as forward/reverse, two-hand buttons, or E-stop must also be physically interlocked in external hardware (cross-wired contactor auxiliary NC contacts, safety relays). Software and hardware interlocks are both mandatory. When implementing E-stop with SET/RST, the E-stop signal should go to the R input rather than an ordinary NC contact in series ahead of the coil — a state latched by SET is not cleared by an ordinary series NC contact.

**Pitfalls**: relying on software interlock alone for forward/reverse protection can turn both outputs ON at the instant of a CPU warm restart and burn out the contactors; wiring E-stop only as an NC contact in series ahead of the coil fails, because a state latched by SET is not cleared and the E-stop is defeated.

*Source*: distilled engineering judgment; general requirements of IEC 62061 / ISO 13849-1 for non-safety PLCs; IEC 60204-1 electrical safety principles


## occ13 [architecture] S/R (set/reset) coils hold state across scans; power-loss retention depends on the memory-area configuration and EEPROM write endurance

The S7-200 S (Set) and R (Reset) coils hold a bit's state across scan cycles, and the last-scanned one overwrites the earlier. M-memory is lost on power loss by default (MB0-MB13 can be configured as a retentive area in the system block); V-memory data is retentive by default, but writing to EEPROM has an endurance limit (about 100,000 cycles). Repeatedly writing V-memory under high-frequency scanning wears out the EEPROM prematurely (showing up as random data flips). For step states that must survive power loss, use M bits configured as retentive or control the V-memory write frequency sensibly.

**Pitfalls**: state set by S/R is lost after power-loss restart (M-memory not configured retentive), so the machine enters the wrong step on power-up; high-frequency V-memory writes wear out the EEPROM prematurely, showing up as random data flips.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 3 Memory Retention and EEPROM; System Block Configuration


## occ12 [scan_cycle] Propagating ENO in STL requires inserting the AENO instruction manually; LAD completes the ENO chain automatically but STL does not

If an EN/ENO instruction box in LAD errors during execution (out of range, illegal indirect addressing, divide-by-zero, etc.), ENO=0 breaks the following series box and automatically stops error propagation. The STL equivalent is the AENO instruction, which ANDs the ENO bit with the current stack top and pushes it. When writing STL by hand or editing after switching from LAD, you must insert AENO explicitly to emulate LAD's ENO-chain behavior; otherwise the following instructions still execute after an error and may write illegal values to the output area.

**Pitfalls**: deleting the auto-generated AENO while manually editing after LAD-to-STL conversion disables the error protection for all conditional box instructions afterward; continuing to write Q outputs after a divide-by-zero/overflow produces silent data errors.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 STL Instructions, ENO/AENO


## occ11 [analog_scaling] Analog AIW/AQW raw values are integers (0-32000 unipolar / ±32000 bipolar) and must be converted to REAL, then linearly scaled to engineering units

S7-200 analog modules (EM231/EM235) convert the sensor signal to an AIW integer. Unipolar (0-10 V or 4-20 mA) maps to 0-32000, bipolar (-10 V to +10 V) maps to -32000 to +32000. The 4-20 mA zero point corresponds to about 6400, not 0, so add an offset when scaling. Standard flow: convert AIW to DINT with ITD, then to REAL with DTR, then multiply/divide in floating point to engineering units; for AQW, scale in reverse and convert back to an integer with TRUNC or ROUND before writing. Integer division directly loses all precision. Writing a negative value or above 32000 to AQW clamps the output, and the PID integral term may saturate.

**Pitfalls**: scaling with integer division DIV (e.g. AIW/32000) always yields 0; forgetting the 6400 offset for 4-20 mA causes about a 20% zero-point error; dividing before multiplying loses all precision (multiply before dividing, or use floating point); after AQW clamps a negative write, the PID integral saturates and cannot self-recover.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 5/6/8 Analog I/O; EM231/EM235 module manuals; Gongkong (工控人家园) forum S7-200 analog-scaling thread (distilled engineering judgment)


## occ10 [counters] High-speed counters HSC0-HSC5 have fixed input pin bindings, must be configured with HDEF, and HDEF may be called only once per power-up

Each of the S7-200 CPU's HSC0-HSC5 corresponds to fixed physical input points (e.g. HSC0 uses I0.0/I0.1/I0.2) and cannot be assigned arbitrarily. Before use, define the mode (single-phase/dual-phase/A-B quadrature, etc.) with the HDEF instruction, then activate with the HSC instruction. The counter current value is in HC0-HC5 (32-bit double word), read-only. Ordinary counters (CTU, etc.) sample the CU rising edge only once per scan cycle, so high-speed pulses must use HSC or many counts are missed. HDEF may be called only once per power-up; redefining requires a restart.

**Pitfalls**: wiring the encoder to I0.4 but defining HSC0 (which needs I0.0) keeps the count at 0; changing the mode after HDEF causes a Mode error; counting high-speed pulses with an ordinary CTU misses many.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 6 High-Speed Counter Instructions; CPU 22x input pin assignment table


## occ9 [addressing] The STL accumulators AC0-AC3 are 32-bit untyped registers and must be saved/restored manually around SBR calls

S7-200 STL has four 32-bit accumulators AC0-AC3 for holding intermediate results. AC has no data type; the instruction decides whether it is interpreted as integer or float. SBRs and the main program share the same accumulators (AC0-AC3), and AC contents are not saved automatically on an SBR call. If the main program calls a subroutine mid-calculation and the subroutine also uses AC0, AC0 is corrupted after return. Standard practice: on the first line of the SBR, store the AC values used into L-memory locals (MOVD AC0 LB_temp) and restore before return.

**Pitfalls**: the main program's math results are wrong after a subroutine call, but AC contents are not visible in the online status chart, making the fault very hard to locate.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 4 Accumulators (AC); Gongkong (工控人家园) S7-200 forum experience thread (distilled engineering judgment)


## occ8 [interlock_safety] I/O error bits such as SM5.0 and the ENO chain are the main means of runtime fault sensing; ignoring them causes silent errors

The S7-200 built-in watchdog stops automatically on scan timeout (default 500 ms). Runtime I/O errors can be detected via SM5.x bits such as SM5.0 (I/O error flag); on detection, drive outputs to a safe state and enter alarm logic. If an instruction with an ENO output (math, shift, etc.) errors, ENO=0, and in LAD you can detect and handle the exception by connecting an ENO coil in series. In STL, propagate the ENO state explicitly with AENO. A program with no error handling fails silently on a loose or shorted I/O and is hard to diagnose.

**Pitfalls**: ignoring the ENO output — after a math overflow or divide-by-zero the result register is undefined, and downstream logic uses the wrong value with no alarm.

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Appendix D SM5.x I/O error bits description; Chapter 6 ENO/AENO instructions (distilled engineering judgment)


## occ7 [comm] A PPI network master reads/writes slave V-memory with NETR/NETW, at most 16 bytes each, and must wait for the done bit before triggering again

In S7-200 PPI communication, the master accesses slave V-memory or other data areas with NETR (network read) and NETW (network write); the TABLE parameter points to a fixed-format V-memory buffer (first byte = error code/done flag, 2nd byte = remote station number, 3rd byte = data byte count, max 16, followed by the remote address and local data area). The PORT parameter is 0 or 1. After each NETR/NETW is issued, wait for the done bit (buffer first byte bit7 = 1) before triggering again, otherwise the in-flight request is overwritten. Large blocks require multiple calls handshaked with the done flag.

**Pitfalls**: executing NETR/NETW unconditionally every scan without checking the done bit causes overlapping triggers, persistently wrong communication data, and the buffer error code constantly refreshing to 0x01 (command active).

*Source*: S7-200 System Manual (6ES7298-8FA24-8DH0), Chapter 10/11 Network Communications, NETR/NETW
