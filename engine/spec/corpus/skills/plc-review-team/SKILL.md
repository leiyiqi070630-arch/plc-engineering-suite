---
name: review-team
description: Review an already-written or generated PLC program with a multi-perspective panel plus adversarial verification, to catch semantic and safety problems that compile and lint cannot detect.
---

# PLC Review Team (multi-perspective adversarial review)

`compile` / `plc_lint` only prove syntax, not behavior. **The H3 empty shell** — a block call whose inputs are wired to constants (all FALSE) and whose outputs are written to OB1 Temp and discarded — compiles clean and lints clean, yet controls nothing; only semantic review catches it. This skill is a recipe that assembles an "independent reviewer + safety + technical + red-team + synthesizer" panel into a single review orchestration, built on the `multi-agent-patterns` primitives (`Agent`/`AgentWait`/`output_schema` + adversarial verification).

First `Skill`-load `multi-agent-patterns` (the only correct use of the primitives) and `plc-program-design` (layering / safety / output ownership / timing / review checklist / item-by-item re-check method). Pull route details on demand via `Skill`: `tia-portal` / `mitsubishi-fx` / `siemens-s7-200-awl`.

**You are the parent orchestrator; subagents only do the work.** Subagent depth is capped at 1 (a subagent cannot spawn its own subagents); all of them are **read-only**, **must cite code evidence** (block name + line number / network number), and are **forbidden from padding** (report an empty array honestly when nothing is found). Aggregate the subagents' `resultJson`; do not parse prose. `cancelled` / `failed` / stale are data, not exceptions — aggregate the survivors and state the gaps honestly. Concurrency is naturally bounded by min(16, cores).

**This recipe may only be run by the top-level main agent**, because it chains two layers of `Agent`: step 1 spawns the panel, **step 2 spawns an `Explore` verification for each finding**, and step 3 spawns the synthesizer — the engine hard-caps subagent depth at 1 (a spawned subagent cannot spawn further agents). Therefore, **when a subagent loads this skill it must not perform the step-2 secondary fan-out**: instead, return the panel findings verbatim together with their code evidence, and let the top-level main agent do the adversarial verification. If you are yourself a subagent delegated to run the review, do only the step-1 panel summary and hand the findings back to the top level; do not attempt to spawn verification agents (it will over-cap / be rejected).

What follows is a recipe, not a pipeline to copy verbatim — when reviewing a single block or a single suspect timing path, drop the panels you don't need; tailor to the shape of the request. There is only one guardrail: **the real verification still comes from TIA compile / route lint; this skill provides semantic/safety feedback and does not replace import-and-compile.**

## What the caller must supply in full (subagents have no memory; the prompt must be self-contained)

Pack into each panel's prompt: **the original requirement text** + **the program file path or block name to review** + **the route** (TIA SCL/LAD, Mitsubishi ST/CSV, S7-200 AWL) + **that panel's dedicated lens**. Omit any of these and the subagent can only guess.

## Step 1: spawn perspective-separated panels in parallel (fan-out)

Spawn them all at once with `run_in_background: true`; each panel targets one failure surface, with no overlap (perspective-diverse, see multi-agent-patterns). Use the **verbatim-exact** `subagent_type` and `output_schema` from the roster.

**The default is the minimal set, not the full 5-way panel.** Fielding the full panel to review a single block or a single timing path is over-process and contradicts "tailor to the shape of the request". So:

**Default minimal set (two panels, always spawned):**
- **`plc-logic-review`** (an existing agent, requirement→code item-by-item mapping): decompose the requirement into an atomic checklist (decompose first, independent of the code, making implicit safety/timing requirements explicit), then go back to the code item by item to find the implementation point or mark it UNMET — a wholly absent function (the H3 kind where "the code has no corresponding input/state/network at all") surfaces at this step. It **carries its own output_schema, which need not be supplied again**; the shape is `{verdict:"pass"|"defects_found",requirements:[{requirement,status:"met"|"partial"|"unmet",evidence,severity:"safety"|"functional"|"minor"}],antiPatterns:[{pattern,present:boolean,evidence,fix}],summary:string}` (listed here only so the five panels' outputs align in one place; do not re-pass it when spawning).
- **`plc-technical-reviewer`**, lens ②: double-coil / output ownership — whether the same real output is assigned in multiple places, whether there is a single owner network; and in passing, check addressing, instance-DB strategy, generator boundaries (the instruction set `tia_lad_generate_block_xml` supports, whether the XML route can draw it, when to fall back to SCL), and compile/import reality.
  `output={route:string,feasibility:[{capability,supported:boolean,note}],dataStrategy:string,boundaries:[string]}`

**Add on trigger (add only when the condition is hit; do not default to all):**
- **Safety semantics present** (E-stop / safety gate / interlock / mode interlock) → add **`plc-safety-reviewer`**, lens ①: E-stop NC fail-safe / interlock / fault latching / permissive check before reset / restart inhibition (EN 60204-1) / mode interlock / standard PLC ≠ certified safety function.
  `output={safetyRequirements:[{requirement,rationale,severity:"safety"|"functional"|"minor"}],risks:[{risk,mitigation}],verdict:string}`
- **Multi-step state machine / suspect timing present** → add **`plc-technical-reviewer` (second instance)**, lens ③: timing / state machine — whether a shared timer is reset per step (`IN` drops between steps), whether each step has its own timeout, whether transitions are mutually exclusive and triggered, whether every exception path latches Fault rather than merely clearing the step. Same output_schema as above; put the timing conclusions in `feasibility`.
- **Structural-health assessment wanted** (whether layering / block decomposition is sound) → add **`plc-architect`**: layering / state-machine structure / block decomposition / data strategy / IO mapping.
  `output={layers:[string],blocks:[{name,type,responsibility}],stateMachine:string,ioMap:string}`

> Both lens ② and ③ are `plc-technical-reviewer`, but the prompt gives each a different dedicated task — the same roster entry under a different lens is a perspective-diverse usage, not redundancy. The H3 empty shell's "inputs wired to constants / outputs dumped to Temp" should be caught by both lens ② (output ownership) and `plc-logic-review` (wholly absent function), so the minimal set already covers the empty shell.

Collect each panel's `agentId`, then join:

```
AgentWait { agent_ids: [<id_logic>, <id_safety>, <id_tech_doublecoil>, <id_tech_timing>, ...], timeout_secs: 300 }
```

For any panel with `resultJsonTruncated: true`, read the full content from its `manifestFile` via `read_file`. Record any `cancelled`/`failed` panel honestly as a gap; do not pretend it passed.

## Step 2: adversarial verification of each finding

A panel's finding may look right but be wrong. **Do not trust it directly and do not report it directly** — send each **substantive** finding (especially high/safety ones) through adversarial verification: spawn N (default 3) independent verifier subagents to **refute** it; the `prompt` gives the finding + the code evidence it claims + the file scope, and **defaults to refuted=true when the verifier cannot confirm**. Spawn with `Explore`, using the multi-agent-patterns `{refuted, reason}` output_schema:

```json
Agent {"description":"refute finding X","prompt":"Try to refute this PLC review finding: <finding, incl. block name + line number>. Search <file scope> for counter-evidence (is that line really implemented this way? is this permissive really unchecked? is this output really discarded?). Default to refuted=true when you cannot confirm.","subagent_type":"Explore","run_in_background":true,"output_schema":{"type":"object","required":["refuted","reason"],"properties":{"refuted":{"type":"boolean"},"reason":{"type":"string"}}}}
```

After `AgentWait`, count `resultJson.refuted`: **a majority-or-more refuting → kill the finding** (cite the strongest `reason` for why it was killed). Only the survivors proceed to adjudication. The verifier subagents may carry different lenses (correctness / safety wiring / compile-import reality); diversity catches failures that redundancy cannot. This step specifically treats an uncommon-but-correct construct being false-flagged — the shared-timer finding must go verify whether `IN` actually resets, rather than flagging on sight of any shared timer.

**Total-count guardrail (to prevent linear blow-up of token/relay overhead).** Verification is not run on every finding — the number of findings is unbounded, and a few findings from each of 5 panels can explode into dozens of verifier agents. So: **run adversarial verification only on findings whose `severity` is `safety`/`high` and that will enter final adjudication**, and cap **the total number of verifier agents per review at ≤9** (at most 3 findings × 3 verifiers). When more than 3 safety/high findings are hit, sort by severity and verify the top 3; **the rest go straight into step 3 with their claimed code evidence for the synthesizer to judge, without spawning 3 each**. `functional`/`minor` findings never enter verification and go straight to adjudication, weighed on their evidence by the synthesizer. This aligns with the bounded clause of the sister skill `design-team` (at most four in parallel per round, one each for red-team/synthesizer).

## Step 3: synthesize the verdict

Feed all panels' `resultJson` + the findings that survived verification to **`plc-synthesizer`**, and have it produce a detailed, actionable verdict that lays out and adjudicates inter-panel disagreements, citing evidence:

`output={plan:string,disagreementsResolved:[string],openRisks:[string]}`

In the prompt, require it to: **sort findings by severity** (safety > functional > minor), each with its code-evidence point + fix; explicitly adjudicate disagreements like "panel A says unsafe / panel B says feasible" rather than splitting the difference; and list in `openRisks` the items that **can only be finally confirmed by TIA compile / route lint** (such as generator boundaries, whether the import actually passes). Write an empty result honestly when there are no real findings — the synthesizer pads for no one.

## Reporting back to the user

Report the verdict in Chinese to the user, and make clear: which findings survived verification, which were killed by majority refutation (and why), the severity-sorted list, and the fact that **TIA compile / route lint has not yet been run** — semantic/safety review is the feedback layer that supplements what compile cannot catch, and is **not equivalent to** having been verified. Before claiming "fixed / passed", the real verification is still import-and-compile / `plc_lint`.
