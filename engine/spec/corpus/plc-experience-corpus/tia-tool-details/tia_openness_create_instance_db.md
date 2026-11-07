# tia_openness_create_instance_db — extended contract

Reference data moved from the resident card on 2026-09-18. Current schema, diagnostic receipts, user scope and target version take precedence; historical measurements are scoped observations. Read only for an unresolved detail.

Create a real instance DB for a user-defined FB. Mutating; requires confirm=true. The target FB must exist and be consistent; compile defaults true and prepares an inconsistent FB by compiling its owning PLC inside this same tool call (never by compiling the FB object, which V18 rejects with a modal). In a related batch, place this operation between the FB import and its caller. This internal prerequisite is not an extra agent/tool round; the final caller import or trailing compile remains the whole-PLC acceptance verdict. System/library FBs such as TON, TOF, CTU, and CTD use their own instance forms.
