` is for an actual environment, trust, UAC, whitelist, or simulator-runtime problem, **and it already answers the two HMI questions that must not be re-researched: how to actually RUN a WinCC Unified HMI (the fixed compile → archive what TIA wrote → `tia_wincc_unified_full_download` → `tia_wincc_unified_start_project` → look order) and who binds a connection's partner (on V16–V20 the user does, in TIA's connection editor — Openness cannot, and a correct address is not a substitute).**

## Working style

- Start with the requested program or operation using the project facts and identifiers already available.
- Missing identifiers are resolved only when the next tool requires them.
- Generate related blocks as one coherent set and land them in dependency order with the batch tool where supported.
- The LAD and SD generators validate their own plans. Instruction-spec, template-evidence, standalone validator, export, and research tools are optional diagnostics after a concrete failure.
- Compile the completed batch once, repair exact diagnostics in place, and continue from successful project state.
- User-action cards pause and resume the same operation.
