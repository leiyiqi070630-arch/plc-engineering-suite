# 01 · TIA Portal Product & Version Timeline (V15–V21)

## What it is

**TIA Portal** (Totally Integrated Automation Portal) is Siemens' engineering framework, unifying PLC programming (**STEP 7**) and HMI configuration (**WinCC**) in a single project-centric environment. A typical engineer workflow inside it: create project → add devices (PLC/HMI) → configure hardware → write program blocks → compile → download to the CPU → debug online.

The primary target controllers are **S7-1200** and **S7-1500** (the legacy S7-300/400 series and ET200 CPUs are also supported). **Openness** is TIA Portal's .NET automation API, released alongside each TIA version (see [03](03-openness-api.md)).

## Version timeline

Siemens releases a major version each year on the cadence of the **SPS** trade show in Nuremberg. The "Announced" dates below are the `press.siemens.com` news-release dates, each taken from its individual press release (note: announcement date ≠ trade-show floor date ≠ software download-availability date — do not conflate the three).

| Version | Announced | Notes |
|---|---|---|
| **V15** | 2017-11-10 | SPS IPC Drives 2017 (trade show itself 11/28–30) |
| V15.1 | — | Point release; Siemens typically issues no dated global press release for point versions |
| **V16** | 2019-11-26 | SPS 2019, "continuous software development" |
| V17 | — | |
| **V18** | 2022-11-09 | |
| **V19** | 2023-11-13 | "Motion control made easy" |
| **V20** | 2024-11-07 | |
| **V21** | 2025-11-11 | **Current latest** (no newer version as of 2026-06); adds a Git-oriented version-control export format |

Sources (all press.siemens.com):
- V15: `/pressrelease/tia-portal-v15-engineering-framework-focus-applications-digitalization-and-efficiency`
- V16: `/pressrelease/engineering-framework-ready-continuous-software-development`
- V18: `/pressrelease/tia-portal-v18-enables-more-efficient-and-flexible-automation-engineering`
- V19: `/pressrelease/tia-portal-version-19-motion-control-made-easy-all-users`
- V20: `/pressrelease/tia-portal-version-20-enabling-peak-performance-and-efficiency`
- V21: `/pressrelease/tia-portal-v21-combines-engineering-efficiency-higher-plant-availability`

## Relevance to PLC Engineering Suite routes

- **V21 is the current leading edge**; its headline features are the SIMATIC SD text format + Git version-control integration (see [05](05-simatic-sd.md)).
- Version sensitivity is high: the Openness assemblies, SimaticML schema, and SD capabilities **can change with every major version**, so confirm any per-version conclusion against that version's official documentation.
- An existing evidence note states "V15 cannot import V16+ SimaticML, so V15 is not viable" — this concerns the cross-version import rules; see [04's "Version-dependent SimaticML import"](04-simaticml-xml.md), and defer to the official source.

## Open items (look up first-hand when needed)

- Exact release dates for V15.1 / V17 (there may be no dated global press release for these).
- Per-version firmware compatibility matrix (the Compatibility List PDF returned HTTP 403 and was not retrieved).
- Official V20 project-file extension (V18/V19 use `.ap18`/`.ap19`).
