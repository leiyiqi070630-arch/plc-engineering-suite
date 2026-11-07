---
description: Vendor-agnostic map of PLC program structure and control engineering. Load when this turn needs to design a complete PLC program from requirements, review/refactor an existing program, or judge whether the safety and timing structure is healthy (applies to Mitsubishi / Siemens / TIA alike). Provides an engineering-judgment framework, not one vendor's syntax.
---

# PLC Program Design and Review

An on-demand engineering map. For concrete syntax, use the matching route's knowledge (`mitsubishi-fx`, `tia-portal`, `siemens-s7-200-awl`); this covers **how to build a healthy structure** — applicable to any vendor. You are the engineer; design directly from it without confirming every item with the user.

## List Verifiable Behaviors First, Then Design

Before writing code, extract an **atomic behavior list** from the user's requirements: one behavior per line, each verifiable by inputs, state, and expected output; make the implicit safety, mode, timing, reset, and exception conditions explicit. The list is independent of the code structure you plan to adopt; a title, comment, or variable name mentioning an item does not count as implementing it. Every item must later map to a real IO/tag, state, or network/statement — otherwise the requirement is unmet.

When the user names only one rung, network, or small fragment, the list covers only that scope; do not inflate a local request into a full project in the name of "engineering completeness".

## Layering (Layer First, Then Write Code)

Separate the signals cleanly; do not let scattered conditions drive field outputs directly:

1. **Raw IO** — physical input/output points (limit switches, buttons, sensors, solenoid valves).
2. **Command** — the "what to do" after debounce/latch/mode filtering (start command, jog command).
3. **Permissive / interlock** — "whether it is allowed now" (ready, no fault, opposite direction not active).
4. **State / sequence bits** — internal state machines, steps, flags.
5. **Alarm / fault** — fault detection and latching.
6. **Actuating output** — the network that finally drives the field, formed by converging the layers above.
7. **HMI / status mapping** — signals exposed to the supervisory system.

## Safety and Interlock (Highest Priority)

- **Safe stop / hardware fault overrides everything**: e-stop, safety gate, overload, and similar conditions force the affected outputs to the safe state directly, ahead of any automatic/manual logic.
- **Reset clears the latch only after the fault source is gone**; do not let reset mask a fault that still exists.
- **Opposing actions must be explicitly interlocked**: forward/reverse and open/close valve must not be output at the same time; use hardware interlock + logic interlock. Base the logic interlock on the actual opposite output/contactor feedback or an explicit motion state, not only on the opposite command selector. A changed command may remove the current output, but it must not energize the opposite output in the same scan: require a verified neutral/stopped state and, where the mechanism needs it, a dead time plus a fresh start edge.
- **Modes are mutually exclusive**: manual/jog, automatic sequence, and maintenance mode must gate each other and cannot be active at the same time.
- **Standard-PLC software logic cannot replace a certified safety function**: a single CPU, scan-cycle response, and incomplete self-diagnostics lack redundancy and deterministic fail-safe behavior. Ordinary interlock logic may be written in a standard PLC, but primary safety functions (e-stop circuit, safety gate, two-hand button, etc.) must be implemented by a safety relay or a SIL-rated safety PLC (per IEC 61508 / IEC 62061) — never claim software logic is equivalent to a certified safety function.

## Output Ownership (Avoid Double Coils / Contention)

- Each real output **normally has a single final owner**: one owner network, or one set/reset group with explicit priority.
- When multiple subsystems want to drive the same output, first converge the requests into one internal command, then generate it from a **single** final output network — do not assign the same coil in multiple places (the Mitsubishi CSV lint flags duplicate coils).

## Timing / Sequential Control

- Use an explicit state machine for sequential actions (step STL / status word / SCL CASE); each step has an entry condition, actions, and a transition condition.
- Transitions between steps must be mutually exclusive with a clear trigger, avoiding "stuck steps" and "skipped steps".
- Give long actions a timeout watchdog → on timeout, go to the fault branch instead of waiting indefinitely.

## Entry Point and Block Structure

- Have a clear entry block (Mitsubishi main program / TIA OB1). For multi-responsibility, reusable, or project-scale programs, let the entry handle scan scheduling and call coordinator/domain blocks; a simple single-responsibility program may be implemented directly in the entry — do not create empty shell blocks for form's sake.
- Each business FB/FC handles one focused piece of domain logic; state lives in a DB/static members or retentive relays; the tag/tag table exposes the real IO/HMI signals.
- For a complete hardware-mapped project, prove that every physical I/Q address is covered by the configured CPU or real I/O modules. A compiler warning that inputs or outputs do not exist in configured hardware is an unresolved hardware defect, not an inherent PLCSIM warning. Use the real catalog, rack/slot capabilities, address occupancy, and a compile result to add/assign modules; for a deliberately simulation-only program, use an explicit simulation mapping and report that boundary instead of calling it production-ready.
- When the user wants a complete program, infer the full deliverable shape (entry + block responsibilities matched to complexity + data strategy + IO mapping + command/permissive/interlock/fault/output layers + verification path), not a throwaway demo; when the user wants a local change, strictly hold the local scope.

## Review Checklist (When Looking at an Existing Program)

- Are any field outputs driven directly by scattered conditions, bypassing the command/state layers?
- Do e-stop/fault truly override the automatic logic? Can reset mask a fault that has not cleared?
- Are opposing actuators and modes interlocked against actual output/state feedback? With Start/Enable stuck high, can a direction or mode change energize the opposite action without a stopped scan and a fresh start edge?
- Are there double coils / the same output assigned in multiple places?
- Are there steps in the sequence missing a transition condition or a timeout?
- After writing, confirm the result with the matching route's lint / import-compile.

## Logic Review Method (Requirement-Driven, Catches Semantic Errors the Compiler Misses)

`compile`/`lint` prove only syntax, not behavior. Reuse the atomic behavior list from the design phase and trace each item back to its implementation point in the code — if you cannot find one, it is unmet. Whole-function gaps (no corresponding input/state in the code at all) are only visible through this item-by-item check; static lint cannot see an absent token, and simulation cannot reach a state that was never written.

Common semantic traps in sequences/state machines (check each one; do not report on sight — verify whether it is actually committed):

- **Shared timer not reset per step**: one TON spanning multiple steps whose `IN` never falls between steps turns a 10s watchdog into a "total sequence budget" rather than a "per-step timeout" — a normal multi-step cycle then falsely reports a fault once the total time exceeds the limit. Check whether `IN` resets as the step changes (clearing the timer on entry to each step). Note that computing StepDone from the post-jump Step after the CASE keeps `IN` from ever falling, a typical cause.
- **Exception clears the step but does not latch a fault**: stop / safety gate open / timeout / illegal state mid-run only does `Step:=0` but **does not latch Fault, does not alarm** → silent abort, the operator does not know why, and it may auto-restart once the condition recovers. "Enter Fault from any running state on an exception" requires **every exception path** to set Fault, not just the e-stop one.
- **Reset does not re-check the safety permissive**: before clearing Fault, Reset does not re-validate e-stop/safety gate/permissive and only checks "not running" → the fault can be cleared while the safety gate is still open. "Reset returns to Idle/Ready only when the safety conditions are met" — clearing Fault must AND in the permissive, not rely on a chance re-latch on the next scan.
- **Fixed timeout on a process step**: applying a mechanical step's fixed timeout (e.g. 10s) to a legitimately long process step (machining/curing) → a long but normal process is falsely judged as a timeout. The timeout for a long process step should be adjustable / listed separately.
- **Dead code**: a timer/output that is declared and computed but never read (e.g. `HornTimer.Q` is unused, so the horn sounds continuously instead of pulsing as designed).
- **Missing whole function**: a capability the requirements name (e.g. Hold preserving context / Holding state) has no corresponding input or state in the code at all — it surfaces as unmet during the item-by-item requirement check.

> When an "independent reviewer" tool is available (the `plc-logic-review` agent), have it run this checklist in a cold context — an independent context will not rationalize your own bugs; it is read-only, requires code evidence, and disproves weak findings by default.
