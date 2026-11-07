# Mitsubishi FX2/FX3 Ladder / CSV

> Applies to: vendor=mitsubishi family=fx2/fx3 language=csv; octal X/Y, PLS/PLF, STL/RET step ladder, C235+ high-speed counting, CSV import pitfalls
> 11 items, ordered by occurrence count (occ/30), highest first.


## occ30 [addressing] X/Y addresses are octal: X010 follows X007; X008/X009 do not exist

FX-series input X and output Y numbering is strictly octal; only digits 0–7 are valid. X010 follows X007, Y010 follows Y007, and X008/X009/Y008/Y009 are illegal addresses. Internal devices M/S/T/C/D all use decimal, so two number bases coexist in the same program. Entering X8 in the GX Works2 ladder editor either errors or silently maps to the wrong device; a hand-written CSV list import does not necessarily error and silently misaligns addresses. The FX3U-48MT has 24 inputs X0–X27 and 24 outputs Y0–Y27, all stepping in octal. Wiring diagrams, program, and CSV comments must all use octal notation consistently. Rule of thumb: for any X/Y count 0–7, then carry at 8.

**Pitfall**: Misreading X010 as "the 10th input" (it is actually the 9th point); generating decimal X8/X9 during CSV bulk import causes silent logic misalignment; engineers migrating from Siemens hit this most often.

*Source*: Mitsubishi FX3U Hardware Manual JY997D16601 Chapter 2 Device Numbering; Mitsubishi FX3U Programming Manual JY997D16601 Chapter 2 Device Descriptions; MELSEC FX3U Hardware Manual Section 2 Device List


## occ29 [scan_cycle] Double-coil trap: multiple OUT to the same Y/M within one scan cycle; the last OUT overrides all previous results

FX ladder scans once top to bottom and refreshes the output image area in bulk at end of scan. If the same Y or M coil is driven by OUT on multiple rungs, only the last-scanned rung takes effect and all preceding logic is fully overridden. GX Works2 has a double-coil warning but does not block compilation, and it can be turned off. SET/RST instructions take effect independently in execution order; the last executed SET or RST determines the final state, which is the correct way to control one coil from multiple places. Correct approach: merge all conditions driving the same output into a single OUT rung with parallel contacts, or switch to a SET/RST structure. A safety-interlock RST should be placed last in the program to guarantee priority.

**Pitfall**: An E-stop RST placed before a normal-run OUT causes the E-stop to fail; copy-pasting rungs accidentally creates a double coil that goes unnoticed in debugging because the test case only exercises the later path.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Program Execution Order chapter; GX Works2 double-coil warning mechanism; Mitsubishi FX Programming Manual output-coil usage notes; 工控人家园 FX ladder multi-coil discussion


## occ28 [timers] Timer resolution split by number range: T0–T199=100ms, T200–T245=10ms, T246–T249=1ms retentive; non-retentive timers reset on power loss

FX3U timers derive resolution and type automatically from the number range, with no extra declaration. T0–T199: 100 ms base, non-retentive, max 3276.7 s; T200–T245: 10 ms base, non-retentive; T246–T249: 1 ms retentive (holds current value on power loss); T250–T255: 100 ms retentive. When an ordinary timer's coil drive condition opens, the current value clears immediately and re-timing starts from 0 on re-energize — unlike the Siemens TON, which holds its current value. A retentive timer requires RST Txx to clear. The K value is a count in units of the timer's resolution: OUT T0 K100 = 10 s; OUT T200 K100 = 1 s; the same K100 differs by 10x. FX2N ranges differ slightly, so always consult the manual for cross-model porting.

**Pitfall**: Choosing the wrong timer range causes a 10x or 100x delay error; using an ordinary T for intermittent accumulated timing clears on every open and never reaches the setpoint; forgetting to RST a retentive timer makes the next start continue from the residual value and trigger immediately.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Timer chapter; Mitsubishi FX3U Hardware Manual JY997D16601 Device List; MELSEC FX3U Programming Manual Section Timer Device


## occ28 [edges] PLS/PLF produce a one-scan-cycle pulse; they cannot persist across cycles and cannot replace SET/RST for sustained logic

PLS M sets M ON for the single scan cycle in which the drive contact goes OFF→ON, then auto-resets the next cycle; PLF M corresponds to the falling edge. Pulse width is strictly one scan cycle (typically 1–20 ms). PLS/PLF are coil-type instructions and may only be placed on the right side of the ladder; LDP/LDF are contact-type and can be placed in series on the left of a rung — similar in effect but different in syntax, and confusing them causes syntax errors or logic misalignment. Standard usage: the M output by PLS/PLF serves as a one-shot trigger (counter reset, state-machine transition); any state that must be held requires SET/RST latching. An auxiliary relay output by PLS can be read within the same scan by rungs after the PLS, but rungs before it must wait for the next cycle — program ordering affects the result.

**Pitfall**: Driving an OUT Y coil directly from PLS M lights Y for only one scan cycle, invisible to the eye and mistaken for a hardware fault; placing the PLS coil after the NO contact that reads it misses the pulse within the same cycle; placing PLS after a high-frequency chattering signal (e.g. an analog threshold comparison) fires a pulse on every micro-chatter and makes the step sequence jump repeatedly.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Basic Instructions, PLS/PLF section; GX Works2 Programming Manual Common Instruction PLS/PLF


## occ27 [state_machine] Step relay S with STL/RET implements sequential control: only the active step executes at a time, and a state transition auto-resets the previous step

The FX series provides the STL (step ladder) instruction with S0–S899 (FX3U) to implement sequential control equivalent to IEC 61131-3 SFC. STL Sn opens the step contact; coils within that step scan only while Sn is active, and coils of inactive steps switch off automatically; SET Sn+1 activates the next step and auto-resets the current one; RET must close the end of all STL blocks and return to the main ladder rail. S0–S9 are initial steps, S10–S19 are dedicated return-to-origin steps, and S20 onward are general-purpose. State transitions must use SET Sn, never OUT Sn (OUT does not trigger the auto-reset-previous-step semantics and leaves multiple steps active at once). Compared with a hand-written interlocked state machine using M bits, STL cuts code volume by more than 50%, and GX Works2 has a dedicated SFC view that interconverts with ladder. Nesting MC/MCR master-control instructions inside an STL block is prohibited.

**Pitfall**: Forgetting RET leaves the STL block unclosed, so subsequent ordinary ladder logic is swallowed by the STL and all fails; jumping with SET S30 outside the STL step without RST of the current step leaves two steps active and outputs conflict; using MPS/MRD/MPP stack instructions inside an STL block raises compile errors.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Step Ladder (STL/RET) chapter; MELSEC FX3U Programming Manual STL/RET Step Ladder; plcforum.uz multiple threads corroborate


## occ26 [counters] Counter ranges: C0–C199 are 16-bit up-counters (C100+ are power-retentive), C200–C234 are 32-bit bidirectional, C235–C255 are high-speed hardware counters

FX3U counters have three ranges: C0–C99 ordinary 16-bit up-counters (reset to 0 on power loss), C100–C199 retentive 16-bit up-counters (retained on power loss); C200–C234 ordinary/retentive 32-bit bidirectional counters whose direction is set by the corresponding special auxiliary relays M8200–M8234 (ON=count down, OFF=count up) — the setpoint and current value of a 32-bit counter must be manipulated with D-prefixed double-word instructions such as DMOV/DCMP, whereas a 16-bit MOV writes only the low 16 bits and truncates the data; C235–C255 are high-speed hardware counters that respond directly to X0–X5 high-speed pulse inputs via dedicated interrupts (up to 100 kHz single-phase), are independent of the scan cycle, cannot be driven by an ordinary OUT C coil, and require high-speed compare instructions such as DHSCS/DHSCR. Every counter contact latches once it reaches its setpoint and must be explicitly cleared with RST Cxx before it can count again. The power-on init section (M8002) runs RST on every counter that must start from zero.

**Pitfall**: Reading C200 with a 16-bit MOV truncates values above 32767; forgetting to set the M8200 direction bit counts up when down-counting was intended; a retentive counter's residual old value after power-on triggers an unexpected output; trying to drive a high-speed counter with OUT C240 leaves the count permanently at 0 with no error.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Counter chapter; MELSEC FX3U Programming Manual Counter Device C200 section; Mitsubishi FX3U Hardware Manual high-speed counter chapter


## occ25 [addressing] Index registers Z/V provide indirect addressing: D0Z0 = D[0+Z0]; initialize explicitly before use and clear after use

FX3U provides 16 16-bit index registers, Z0–Z7 and V0–V7 (FX2N has only the single Z0/V0 pair). Writing D0Z0 in an instruction means the actual address is D(0 + current value of Z0), a dynamic run-time offset. Common uses are recipe switching, array traversal, and multi-axis parameter tables: MOV K0 Z0 to initialize, operate on D100Z0 inside the loop, INC Z0 to step. V is typically used for offsetting X/Y/M bit devices or for the high word of a 32-bit index; Z for offsetting word devices D/T/C. Z/V do not support indexing T/C coil numbers; when indexing X/Y the offset adds in octal (with Z0=8, X10Z0 points to X20, not X18). Z/V are globally shared registers that subroutines and interrupts can also modify, with no scope protection. A subroutine entry must save the current Z/V value to a temporary D and restore it on exit, or allocate non-overlapping Z numbers per functional module. After power-on, Z/V in the non-retentive area are 0, but the retentive area keeps the last value, so do not rely on a power-on default. FX2N has only Z0/V0, so Z1–Z7 are invalid when back-porting an FX3U project to FX2N.

**Pitfall**: Forgetting MOV K0 Z0 at loop end starts the next loop from a residual offset and reads/writes the wrong register; subroutine A leaves Z0=5 uncleared, so subroutine B using D10Z0 at entry actually accesses D15; a CALL inside a FOR–NEXT loop whose callee also uses Z0 corrupts the loop count.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Index Register chapter; MELSEC FX3U Programming Manual Section 2.5 Index Registers Z/V; confirmed against the FX2N manual


## occ24 [datatypes] K is a decimal constant, H is a hexadecimal constant: K10≠H10 (H10=16); mixing them skews setpoints

Every immediate value in an FX instruction must carry an explicit K (decimal) or H (hex) prefix. K100 = decimal 100, H64 = 0x64 = decimal 100 (same value); but K10=10 and H10=16 are entirely different. Use K for timer/counter setpoints for readability; use H for bit-operation masks (WAND/WOR/WXOR) and communication-frame bytes (e.g. WAND D0 HFF00 masks the low byte). H constants disallow negatives; K-1 is 0xFFFF in 16-bit two's complement. Bit-device groups: K1X0 means the 4 bits X0–X3, K2X0=8 bits, K4X0=16 bits, and the start address must sit on an octal-aligned boundary (X0/X10/X020, etc.). GX Works2 does not flag a wrong constant prefix; the program compiles and downloads but runs wrong. Team convention: K for all T/C setpoints, H for all bit masks, with meaning noted in comments.

**Pitfall**: Writing H100 instead of K100 for a timer sets 256 × time base = 25.6 s instead of 10 s; K2X1 starting on an odd bit misaligns on some FX2N firmware; feeding BCD thumbwheel input into arithmetic without a BIN conversion produces wrong values.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 constant K/H notes; MELSEC FX3U Programming Manual Constant K/H; GX Works2 online help constant-format notes


## occ22 [scan_cycle] FX single-scan model: a device value written later in the cycle is immediately visible to subsequent rungs (not double-buffered)

FX ladder uses a scan model of centralized input sampling → sequential program execution → centralized output refresh. Unlike the Siemens S7 input/output image snapshot mechanism, in FX, if M0 is set ON on rung 5 within a scan cycle, the M0 NO contact on rung 6 immediately reads ON (internal devices refresh instantly). Output Y is written to the physical port in bulk only after the END instruction. Program ordering directly affects execution: placing a set rung after a detect rung introduces a one-cycle delay. The row number in a list CSV is the scan order, so reference order must be verified after bulk import. Special system devices: M8000 is constantly ON during RUN, M8002 is ON for only the first scan on STOP→RUN (used for initialization), and M8013 is a 1 s clock pulse — these are maintained automatically by the CPU and must not be overwritten with OUT.

**Pitfall**: Placing a reset rung before a set rung resets then sets the coil within the same cycle, so the actual output is ON — counter to how the code reads; using OUT M8002 overwrites the system init pulse and breaks init logic; using OUT M8013 to fabricate a 1 s pulse overwrites the system clock.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Program Execution Order chapter; GX Works2 help documentation; Mitsubishi FX3U Programming Manual special-device chapter M8000–M8511


## occ15 [compare_math] D registers default to 16-bit signed (-32768~32767); 32-bit math needs D-prefixed double-word instructions DMOV/DADD, etc.

FX-series data registers D are 16-bit signed integers (-32768~32767). Out-of-range values do not error; they simply overflow and wrap. For 32-bit math, use D-prefixed double-word instructions: DMOV, DADD, DSUB, DMUL, DDIV, whose operands are a 32-bit pair (Dn, Dn+1) (low word in Dn, high word in Dn+1). Writing K32768 to a 16-bit D register overflows to -32768 and scrambles all compare or shift logic. Analog engineering values, encoder positions, and the like that exceed 32767 must use a double-word register pair. H8000 is -32768 in a 16-bit compare (two's complement); used as a positive number it gives the opposite result.

**Pitfall**: Writing an analog engineering value above 32767 with a 16-bit MOV silently overflows, giving abnormal output with no alarm; using MOV instead of DMOV to write a setpoint to C200 / a 32-bit counter changes only the low word, leaving stale high-word data and a scrambled count target.

*Source*: Mitsubishi FX3U Programming Manual JY997D16601 Data Register and Applied Instructions chapter; MELSEC FX3U Programming Manual Constant K/H


## occ12 [pitfall] List CSV import pitfalls: three classes of silent error — device address format, instruction bit width, and row order

GX Works2 export/import of an instruction-list CSV has three classes of silent error: (1) Address format: X/Y are stored as octal text and D/M/T/C as decimal text; opening the CSV in Excel auto-converts X010 to the number 10 and saves it back, losing the octal information and misaligning every X address. (2) Instruction bit width: the applied-instruction 16-bit/32-bit D prefix must appear in the instruction-name field (DMOV, not MOV + a D operand); mistyping DMOV as MOV silently truncates the high 16 bits. (3) Row order: the CSV row number is the execution order, so importing after an auto-sort scrambles the rows, reverses the logic order, and passes simulation but fails on real hardware. Device comments live in a separate comment CSV, so importing only the instruction CSV loses all D/M comments. FX2N and FX3U list column order differ slightly, and mixing templates is a major hazard.

**Pitfall**: Bulk-importing dozens of instructions without verifying each leaves all 32-bit data truncated to the low 16 bits, discovered only when a D register overflows on the line; after Excel processing, every X010 becomes X10 (decimal) and maps wrong after import.

*Source*: GX Works2 Operating Manual SH-080779 list-program import/export chapter; GX Works2 User Manual instruction-table import/export chapter; 工控人家园 community FX-series CSV pitfalls discussion
