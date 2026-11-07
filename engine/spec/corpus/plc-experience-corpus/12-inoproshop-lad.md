# Inovance InoProShop LAD — Experience Corpus

> Real-machine forensic entries for the InoProShop route (vendor=inovance, family=inoproshop, integration=inoproshop_bridge). These were verified on InoProShop V1.10.0.3 with AM600-CPU1608TP/TN, not part of the 30-round frequency distillation. Entries use `rm-<letter>` ids (no occ count, same convention as the other forensic addenda).

## rm-a — C383 declaration reset (root cause family)

- **Symptom**: generated LAD POU imports "successfully", then precompile reports C383 "POU声明不完整" + C46 "未定义标识符" × N. The POU's `declarationChars` reads back as 0 — the whole declaration was silently reset to one empty line.
- **Root cause (verified 2026-08-30)**: the `Interface` text object was emitted OUTSIDE the `Object` node (entry level). The vendor importer silently drops the declaration instead of rejecting the file. A modal dialog "已标识项中有一项的格式无效" may also appear.
- **Fix**: `Interface` must be a direct child of `Object`, before `POULevel`. Plus the byte-level conventions: NC contact = `Boolean=True` + `Flags=1`; `IsBoxType=False`; empty `OutputItems`/`Names`/`Types` carry no `<Null />`; coil operand is UNNAMED; Instance `Boolean=False`; `Path` is `<Array Name="Path" Type="string" />`.
- **Lesson**: a "successful import" is not evidence. Always read back `declarationChars` and the precompile category (217bc73e) before claiming the write worked.

## rm-b — Restricted-shell process kill

- **Symptom**: the InoProShop bridge dies ~13 s after the launching shell command exits. Heartbeat goes stale, every later call reports `bridge_not_ready`.
- **Root cause**: a `subprocess.Popen` child is killed when the restricted tool shell tears down its process tree. The IDE inherits the calling process's lifetime.
- **Fix (verified)**: launch detached via `Win32_Process.Create` (WMI); the WMI-created process outlives the caller. `route_cli.py start` now does this automatically and reports `launcher: wmi`.
- **Lesson**: readiness is verified via `bridge.status` `ready:true` only; the `res/_ready.txt` file is a stale marker and must never be trusted alone.

## rm-c — #InoParamsConfigLib placeholder library

- **Symptom**: every fresh project (create_with_cpu / Standard template) compiles with exactly one error: "不能打开库 '#InoParamsConfigLib'". It appears even when the generated POU is perfect.
- **Root cause**: installation-level unresolved placeholder library in this InoProShop profile.
- **Fix**: none in the POU. Do not chase it as a code bug; treat it as the known environment defect and separate it from POU diagnostics in every build report.
- **Lesson**: classify diagnostics by category before concluding the generator is wrong.

## rm-d — False-green precompile window

- **Symptom**: `lad.generate_contact_block` reports `precompileZeroErrors: true` and `compileOk: true`, yet a full `build.diagnostics` seconds later shows C383 + C46 × 4.
- **Root cause**: the early diagnostic snapshot races the IDE's delayed precompile publish (2–3 s). A clean early window proves nothing.
- **Fix**: always wait for the stable diagnostic window (minimum observation + quiet period) and read the precompile category directly; never treat an immediate 0/0 line as a usable generation contract.
- **Lesson**: the same class of trap exists in the TIA route; the InoProShop bridge must gate on the stable window.

## rm-e — Coil target writability

- **Symptom**: a plan with the coil bound to an `input`-section variable passes plan validation, generates XML, and only fails later at the semantic level.
- **Fix (verified)**: validation now rejects coil operands declared in `input`/`temp`/`constant` sections (`COIL_TARGET_NOT_WRITABLE`) and the compose path rejects undeclared graph variables instead of silently auto-registering them as locals.
- **Lesson**: a generator that silently invents declarations hides typos and changes program semantics; refuse instead.

## rm-f — Native dialog dismissal

- **Symptom**: an operation hangs in `busy` state; heartbeat stays busy with no response file.
- **Root cause**: a native modal dialog (e.g. "已标识项中有一项的格式无效") is blocking the IDE primary thread.
- **Fix**: the wait loop detects and reports the dialog (`nativeDialogDuringWait` with hwnd/texts/buttons). Dismiss explicitly: `dialog-dismiss --hwnd <hwnd> --button <caption> --confirm dismiss_dialog`. Never auto-click.
- **Lesson**: the dialog is evidence, not noise — read its text before deciding the next step.

## rm-g — Timer network: 错误分配源 / TIME→BOOL (final shape, precompile 0 errors)

- **Symptom**: a two-network block (contact_coil + timer TON) renders, but precompile reports "错误分配源" (error assigning source) at the timer network's assignment node; an earlier variant reported C32 "cannot convert TIME to BOOL" at the bound Q output.
- **Root cause (verified 2026-08-31, live A/B on the IDE)**: three failed variants — (a) assignment wrapper + box OutputItems with a leading `<Null />` pushed the bound Q onto the ET (TIME) pin → C32; (b) assignment wrapper + Null EN/ENO → the LD allocator cannot assign a power source to the assignment → 错误分配源; (c) direct NetworkItem + `<Single Name="EN" Type="bool">False</Single>` → the importer fragmented the network into six non-renderable pieces.
- **Fix (verified precompile 0 errors)**: the box goes DIRECTLY into NetworkItems (no assignment) with the rail-connected shape measured from the rol-with-ton template's outer box — `EN/ENO True`, box `Flags/Fixed=True`, `IsBoxType=True`, Instance `Boolean=True`, bound Q operand directly in the box OutputItems.
- **Lesson**: the acceptance gate is precompile (217bc73e) 0 errors on a FRESH compile after import; and when a shape fails, A/B-test candidate shapes live against the IDE — evidence captures that were never bound cannot prove a shape.

## rm-h — Same-name native import raises a modal dialog

- **Symptom**: re-importing a modified block whose name already exists in the project pops a vendor modal, blocking unattended automation.
- **Fix (verified 2026-08-31)**: `project.import_native` now deletes the existing object first (absence-proven via find-after-remove) when `expectedName` matches, and surfaces `replacedExisting {name, path, guid}` in the result. `lad.generate_contact_block` forwards it.
- **Lesson**: every vendor import path that can collide by name must pre-delete; "replace by name" happens BEFORE import, never after.

## rm-i — Device repository is 792 entries; default list page is 100 (2026-09-01)

- **Symptom**: `device.list_installed` without filters always returns the same 100 devices and the needed I/O module never appears — looks like the module "is not installed".
- **Root cause**: the repository (`D:\hui chuan\CODESYS\Repository\Devices`) has ~792 entries; the op defaults to a 100-item page and reports `totalMatched`/`truncated`.
- **Fix (verified)**: pass filters on ONE call instead of paging: `keywords` (array; every keyword must match name/vendor/description/families), `name`, `vendor`, `type`, `id`, `version`, and/or `limit` (1..1000). E.g. `{"keywords":["4LC","PID"],"limit":200}` finds GL20-4LC-PID (type 41053, id `10F4 1053`) in one round-trip.
- **Naming trap**: `GL10_1600END` (type 40010, id `10F4 0010`) IS the 16-point DI module despite the END-looking name; it is a valid io_mapping target. Never conclude "END terminal ⇒ no channels" from the name alone — probe its parameterIds.
- **Lesson**: when a list tool has filters, the filtered call costs one round-trip and the unfiltered page loop costs N; the tool schema now exposes the filters, so use them.

## rm-j — io_mapping parameter ids: probe once, then read the error's own hint

- **Symptom**: `io_mapping_read`/`io_mapping_add` reject a guessed parameterId with `parameter_not_found`.
- **Root cause**: parameter ids come from the target's connector HostParameterSet; they differ per module and connector.
- **Fix (verified)**: ONE `vendor_device_parameter_probe` on the module target enumerates the connectors/parameter ids; and the `parameter_not_found` error itself carries `availableParameterIds` + a hint in the SAME response, so a wrong first guess costs zero extra round-trips. Map only onto empty channels with an EXISTING `Application.<POU|GVL>.<var>` variable.
- **Lesson**: design errors to be self-healing — include the valid options in the rejection, don't make the caller re-probe.

## rm-k — Provider stall ≠ heartbeat stall; long tool calls are not stalls (2026-09-01)

- **Symptom**: round logs show `[stall] stage=stream_open waited=60s retryable=true` ×3 after a long bridge op, and `heartbeat liveness=stalled` warnings; the turn eventually fails.
- **Root cause**: two DIFFERENT signals got conflated. (1) The engine's own stall retry = the model provider did not open a stream within 60s after a tool result — a provider-side stall, retried up to 3 attempts, then the turn fails honestly. (2) The heartbeat `stalled` = the turn-loop health check older than 30s, which used to happen during ANY legitimate 60s+ bridge call.
- **Fix (verified 2026-09-01)**: the engine now keeps the published health check fresh while a tool batch executes (tool execution IS progress), so only a genuinely wedged turn reads `stalled`. The provider stream-open stall remains a real stall and is still reported/retried as one.
- **Lesson**: a heartbeat that cries wolf during normal long operations trains observers to ignore it; keep "stalled" reserved for actual wedges.

## rm-l — Round-10 daily-workflow closure: what the live run verified (2026-09-01)

- **Verified green, first attempt, 15 total tool calls**: AM600 wizard project tree (Device/HIGH_SPEED_IO/MODBUS_TCP/GL10_1600END); LAD `MotorMap` generation with precompile 0/final 0; io_mapping probe→read→add on GL10 DI16 channel parameterId **1000 = %IB2** (`Application.MotorMap.X0` → committed=true, variableMappingCount 0→1); Modbus TCP Slave `Port` 502→1502 page-write with `valuesMatch=true`; full compile 0 errors 0 warnings.
- **io_add failure (honest)**: the model passed `module=01440483` — that is the repository entry's `orderNumber`, NOT the name/id. The bridge then fell back to placeholder identity + the GL20 slice rejected on the AM600 local rack. Legal DevBusType values seen: DBT_NULL=0, DBT_MODBUS=1, DBT_CANOPEN=2, DBT_ETHERCAT=3, DBT_DP=4, DBT_CANLINK=5, DBT_MODBUS_TCP=6.
- **Fix (2026-09-01)**: `device.config.io.add` now fails FAST with `module_identity_unresolvable` + `candidates` (catalog names matching the selector) when the parser cannot resolve the module, instead of constructing a placeholder identity that dies deep in the native action; the error payload is compact (no 20KB rack dumps); the spec description now states module = exact catalog name or type/id/version.
- **Tool gap closed (2026-09-01)**: there was NO tool to dismiss a native dialog (only the route_cli subcommand). Added `inoproshop_dialog_dismiss` (hwnd + button caption + confirm=dismiss_dialog) with a `dialogs.dismiss` host-side op that bypasses the dialog guard.
- **Lesson**: a repository listing has name/id/type/version/orderNumber — document which one the consuming tool accepts, and make the rejection carry the valid options; a rejection that forces a re-probe doubles the cost of every mistake.

## rm-m — Cold-IDE parser + stale modify handle + fresh-project editor page (2026-09-01, round 11)

- **Symptom set**: (1) `device.config.io.add` with the round-9-verified `module=GL10_1600END` raised `handler_error: NameError global name 'before' is not defined` on a freshly restarted IDE; (2) after the failed adds, `io_mapping_add` died with `对象已经使用。(对象: 'GL10_1600END [Device]')` from `GetObjectToModify`; (3) `modbus_tcp_slave_parameter_read/write` failed `element_not_found` at `["Port"]` on a fresh project where the round-10 project had worked.
- **Root causes**: (1) the diagnose-gating refactor left a verification block referencing a removed local; ALSO the vendor parser resolves module names only after the device profile is loaded, so a cold IDE returns None and the old code silently built a type-68 placeholder that died deep in the native action; (2) a failed native transaction leaves the modify handle held — the existing GC-retry only wrapped the post-acquire stage, not the acquire itself; (3) the TcpSlavePage editor controls only exist after the editor has been opened once; a fresh project exposes the native parameter's children by numeric index (index 2 = Port).
- **Fixes (verified direction, 2026-09-01)**: (1) `before`/`after` graph probes stay locals (needed for the before/after row gate) but only enter the RESPONSE under `diagnose=true`; explicit `type`/`id` now resolve against the installed catalog (authoritative) instead of the parser; `GL10_1600END` maps through a verified alias to type 40010/`10F4 0010`/00.00.00.10; (2) `_native_device_object_with_retry` — GC sweep + one retry on `对象已经使用` at the modify-acquire stage, used by io_mapping_add and vendor_device_parameter_write; (3) Modbus Port contract gained `fallbackPath: ["2"]`, and read/write fall back to the native ObjectMgr path with `status=modbus_tcp_slave_parameter_native_fallback` when the page is unavailable.
- **Lesson**: three independent failures shared one shape — an operation that works on a WARM project/IDE must not silently change behavior on a COLD one. Cold-start paths need their own evidence (alias tables, numeric fallbacks, acquire retries), not the model re-probing or reading bridge sources.

## rm-n — Persistence gate + advanced-tool coverage map (2026-09-01, rounds 13-15)

- **Persistence gate PASSED (round 13)**: save → close → reopen → five readbacks (device tree GL10_1600END, pou MotorCtrl, io_mapping variableMappingCount=1, HSIO Xn0IntResponTm=160002, Modbus Port=1502) all identical after cold reopen; second compile 0 errors 0 warnings. The `project.open` gate now reports `opened_with_known_placeholder_library` instead of failing on the known #InoParamsConfigLib placeholder.
- **channels_probe fix VERIFIED (round 15)**: the raw `GetDeviceList` rows expose empty model/devType through the probe's accessors; row identity is delegated to `device.config.graph.probe` (model `14400005`, identification 10F4 0010/40010) with tree-name→id correlation. `devObjectUnavailable=true` means channel-level writes must go through `vendor_device_parameter_probe` (parameterId 1000 = %IB2 etc.).
- **Coverage map (honest, round 15)**: Symbol Configuration HAS a native create op (`symbol_create_config`); **Alarm Configuration (group/class) and TraceObject have NO create ops** — `alarm.item.create` needs an existing group+class GUID, and trace ops only probe existing TraceObjects. These are the next tool-coverage gaps, not model failures.
- **Known-defect variance**: the #InoParamsConfigLib build error is windowing-dependent — some diagnostics windows show errorCount=1 (the placeholder) + `missing_assembly`/`blockedByNativeDialog` in library-manager, others 0/0. Classification rule: if the ONLY PLC error is the placeholder, the user code is clean. A `managed-placeholder-resolution` card exists for attempting an official-library version update per project.
- **Lesson**: a persistence gate is only meaningful when the open path can't false-fail on environment noise — the open/build gates must tolerate the known placeholder or the gate itself becomes the defect.

## rm-o — Placeholder library family resolved at the root (2026-09-01, rounds 16-17)

- **Symptom**: the known `#InoParamsConfigLib` build error kept returning on SOME diagnostics windows; after a reopen a NEW placeholder `#SoftMotion_AddRamps` appeared, downgrading the first compile after every reopen.
- **Root cause**: (1) `#InoParamsConfigLib` is resolvable — the installed repository holds `InoParamsConfigLib 1.0.2.0 (Inovance)` — but the fresh template leaves the redirect empty until the official version-compat dialog runs (Initialize(auto)+SaveControls, the `vendor.libversion.update` op); (2) the redirect only settles after a reopen, so the first compile still caught the stale create-time log entry; (3) `#SoftMotion_AddRamps` is a template pin whose target name matches no installed library (the installed one is `SM3_AddRampsDefault 4.1.0.0`), so it can never redirect on this profile.
- **Fix (verified 2026-09-01)**: `project.create_with_cpu` now runs `vendor.libversion.update` + save→close→reopen automatically (claims `placeholderLibraryRelinked` + `saveReopenVerified`). The build/open gates tolerate EXACTLY the known template placeholders (InoParamsConfigLib, SoftMotion_AddRamps) when the compiler reports 0 errors/0 warnings, and the known AM600ConfigurationInterface.dll assembly hiccup under the same condition — anything else stays fail-loud. Live check: first compile after reopen = ok=true, 0/0, `libraryManager.status=known_placeholder_only`.
- **Lesson**: a "known environment defect" is a moving target — resolve what is resolvable (the version update), and for what is not (SoftMotion pin), encode an evidence-gated tolerance (compiler counts must be clean) instead of training the model to hand-wave every library error.

## rm-p — Modbus dedicated write on fresh projects: retention rebind by name (2026-09-01, round 17)

- **Symptom**: `modbus_tcp_slave_parameter_write` failed `element_not_found` at `elementPath:["Port"]` on a fresh project, even though the fallback-aware native read worked and the generic `vendor_device_parameter_write` (elementPath ["2"]) succeeded.
- **Root cause**: the generic page write (`vendor_editor_page_parameter_write`) does its own post-save retention REBIND by navigating `[parameterField]` (the NAME "Port") — fresh projects expose that parameter's children by numeric index only (index 2), so the rebind failed AFTER the page control write and Save had already succeeded.
- **Fix (verified 2026-09-01)**: the generic page write accepts `skipRetentionCheck=true` (returns `editor_page_parameter_saved_retention_skipped`); the Modbus write passes it and verifies retention itself through the fallback-aware native snapshot. Live check: 1502→1503 write via the dedicated tool, `valuesMatch=true`, then restored to 1502.
- **Lesson**: when a generic path's verification step uses project-state-dependent navigation (name vs numeric index), the CALLER that knows the state must own the verification — don't let a generic readback veto a write that the caller can verify more precisely.

## rm-q — Advanced object creation: factory GUIDs, three verified, one blocked (2026-09-01, rounds 19-20)

- **Symptom**: alarm/trace objects had probe-only coverage (no creation tools); the earlier `vendor.api.search` runs returned 300 vendor types without a single alarm/trace type.
- **Root causes**: (1) `vendor.object.factory.list` defaults to a GVL/DUT-only view while the FULL ObjectFactoryManager holds every standard factory — `filter=alarm`/`trace` enumerates them; (2) `vendor.api.search`'s default assembly filter was vendor-prefix-only, so the `_3S.CoDeSys.AlarmConfigurationObjects` and `InoProTraceObject` assemblies were invisible (the override lived in the sibling `vendor_api_filters.py`, not the main file); (3) the generic factory-create's fallback project-handle lookup called `_get_member` with 5 args (pre-existing crash, only reachable when `native_core_project.Handle` is stale — e.g. after the create-with-cpu settle reopen).
- **Fix (verified live)**: new ops `alarm.config.create` (GUID 9648a4d4-…ee21b), `alarm.group.create` (060f8799-…ab6a), `alarm.class.create` (f479a5ce-…bed0e), `trace.create` (8aab342b-…c6d8e). Live results: config ✓, group ✓ (parent suffix resolution added to find_project_object), trace ✓ (postCreate hook skipped — it rejects the empty batch), class ✗ BLOCKED (`alarm_class_creation_blocked`: AlarmClassObjectFactory.Create() throws without the DatabaseFileAlarmStorage object, and the storage factory's AddObject route itself fails on this profile). Widen `vendor_api_filters.py` defaults with alarmconfiguration/inotrace/symbolconfig; settle reopen now rebinds `native_core_project`.
- **Lesson**: a generic creation route is only as good as its discovery — the factory inventory must list ALL loaded factories by default (not a curated prefix), and every Create()/AddObject contract variant (no-arg, batch, post hook, storage preconditions) must be A/B-tested live before claiming coverage; a blocked variant gets an honest errorCode + op-table status, never a silent raw failure.

## rm-r — Full daily-workflow closure + alarm expression form (2026-09-01, rounds 23-24)

- **Symptom**: the one-turn capstone (create→io_add→LAD→mapping→HSIO→Modbus→alarm→trace→symbol→persist→compile) compiled with 17-18 errors; the alarm item's expression was the sole cause in BOTH attempts (`Application.MotorCtrl.X0` — Program POU local input; `Application.AlarmGVL.gCond` — Application prefix on a GVL).
- **Root causes**: alarm expressions on this profile must be GVL-qualified WITHOUT the Application prefix (`AlarmGVL.gCond`), and Program POU members are not addressable at all. Also: the default alarm classes only materialize AFTER save/reopen; the HSIO child object (`Device/HIGH_SPEED_IO/HSIO`) exposes no parameter set — the config device is the target.
- **Fix (verified live)**: `alarm.item.delete` (groupGuid + id, confirm=delete_alarm_item) added (RemoveAlarm is the vendor method, NOT collection.Remove — the collection is a copy); `alarm_item_create` now rejects Program-POU expressions at plan time with `alarm_expression_not_addressable`; `_editor_connector_parameter` guards the None device object (`editor_device_object_unavailable`) instead of crashing on `.Connectors`.
- **Round-24 result**: full 11-step workflow on one fresh disposable project — 0 hard errors, save/close/reopen persistence verified for ALL objects, final compile 0 errors 0 warnings with precompileOk=true and libraryManager no_error_observed. The model self-corrected the alarm item (delete→recreate with the right form) using the new tool, and saved the lesson to the experience corpus (id e3).
- **Lesson**: expression-language quirks (GVL qualification, POU locality) are discovered by compile evidence — the plan-time guard + a correction tool (delete) make the loop self-healing instead of a dead end.

## rm-s — PID closure on AM320 + position-indexed native layout (2026-09-01, round 25)

- **Symptom**: `vendor.pid.parameter.write` on a fresh AM320 project failed `element_not_found` — the write's BEFORE native snapshot could not resolve `Ch0_DeadBand_L` children.
- **Root cause**: the evidence layout exposes CfgParam's named `Ch{channel}_DeadBand_L/H` children; a FRESH project exposes all 178 CfgParam children position-indexed with NO names (every child is an unnamed DataElementSimpleType). The snapshot raised instead of degrading.
- **Fix (verified E2E)**: `_pid_native_snapshot` now returns `namedChildrenAbsent` instead of raising; the write falls back to a FULL CfgParam byte-diff (`_pid_cfg_bytes` + `_pid_decode_bytes_diff`) — after the control setter and after the parent Save it locates the changed uint16_le_x10 region and decodes it, so `runtimeWriteVerified` is still evidence-backed. Round-25 E2E: write 1.5 → `pid_parameter_written_runtime_verified` (Ch0_DeadBand_L 0→15), save/close/reopen → native decodedValue=1.5 + control validValue=1.5 persisted, compile 0/0.
- **Lesson**: a vendor struct layout that is NAME-indexed in one project and POSITION-indexed in another must not break the write — verification by value-diff over the full parameter bytes is layout-agnostic and reusable for every other GL20 config parameter.

## rm-t — Real-project escalation: 6-floor elevator program (2026-09-01, round 26)

- **Delivered**: a complete multi-object AM600 project — `ElevatorGVL` (call buttons F1B-F6B, door sensors, outputs YUp/YDown/YDoorOpen, latches C1-C6, arrival flags AtF1-AtF6), an **`Elevator` block with 16 LAD networks** (per-floor call latch N1-N6, up N7, down N8, door-start N9, door TON N10, arrival flags N11-N16), and `PLC_PRG` rewritten in ST calling `Elevator(...)` with GVL binding. Compile 0 errors 0 warnings BEFORE and AFTER save/close/reopen; precompile success; libraryManager clean.
- **Generator contract boundaries re-verified (each fixed in ≤2 retries)**: (1) a block's plan accepts only INTERFACE members — GVL-qualified operands are rejected with `not declared`; bind GVL at the PLC_PRG call site instead; (2) a `contact_coil` network needs ≥2 series inputs or the parallel branch needs ≥2 legs — a single contact goes in `contacts`, not `branches`.
- **io_add name trap**: the vendor module catalog rejects display names like `AM600-1600END(...)` / `GL10 16点DI模块` with "序列不包含任何元素"; the verified catalog name `GL10_1600END` (id 10F4 0010) is the one that works.
- **Lesson**: real programs are built from multi-object composition (GVL + LAD block + ST main), and the generator's contract rejections are FEATURES — each rejection carried the exact path and was corrected within the retry budget, keeping the final artifact compile-clean across reopen.

## rm-u — Regression verification + HSIO path/stale-handle documentation fixes (2026-09-01, round 27)

- **Result**: full AM600 daily workflow re-run on a fresh project — 10/10 steps green, final compile 0 errors 0 warnings, no functional regression. New tool chain verified E2E: alarm item create → delete → recreate (internalID 1→deleted→2, exactReadback).
- **HSIO elementPath variance**: parameter 1 is the HSINPUT struct; its children are NAME-indexed. `elementPath=["Xn0IntResponTm"]` is robust across projects; the index form `[1]` only works when that child is first. The index form failed in round 27 (`element_not_found`) while the name form succeeded — record the NAME form.
- **Stale modify handle on first HSIO write**: the GC sweep retry did NOT clear 对象已经使用 in-process; a save → close → reopen (fresh process) always releases it. The bridge now converts the failed retry into `vendor_object_in_use` with that exact recovery step instead of an opaque handler_error.
- **Lesson**: layout variance (name vs index addressing) and per-project-handle vendor locks are documented empirically by the model — every such discovery updates the reference corpus so the next round starts from the robust form.

## rm-v — codesys_lad_generate_native contract boundary (2026-09-06, R48 session + contract interview)

- **Symptom**: a parking-counter task (CTU/CTD + compare + SR) burned 5 consecutive `generator_registry_reject`s hunting for WORD compare boxes (EQ_WORD/GE_WORD/GT_WORD/EQ/GE), one 3778-entry catalog pull, then delete→rebuild loops before the full 4-network program finally generated and compiled 0/0. The model interviewed afterwards pinned every waste to contract gaps, not its own reasoning.
- **Verified registry (896 entries: 646 callables + native Operators, 2026-09-07 operator unblock)**: counters CTU/CTD/CTUD, latch SR (NOT RS), edges R_TRIG/F_TRIG, timers TON/TOF/TP (NOT TONR), math ADD64_64/SUB64_64 (NOT LEQ64_64 — that name was a misleading description example), BLINK. **IEC compare boxes (EQ/NE/GT/GE/LT/LE) AND logic boxes (AND/OR/XOR/NOT) are generatable and verified 0/0 on AM600 (2026-09-07)** — item = {instruction,dataType,inputs,outputs} with dataType REQUIRED (numeric types for compare, bit types for logic; CTU.CV is WORD so convert first with WORD_TO_INT). Also MOVE, ADD/SUB/MUL/DIV/MOD/LIMIT/MIN/MAX/SEL/MUX, shifts, real functions (REAL/LREAL), and the X_TO_Y conversion matrix are verified. The older "compare deliberately disabled" boundary is obsolete; counter boundary outputs QU/QD remain an equally valid choice. `codesys_lad_search_instructions(category=...)` answers family presence in one call; a rejection carries `matchKind` + `suggestion` — `family_absent` means restructure, never rename-guess.
- **Gate false-fail**: the first `codesys_lad_generate_native` call after `prepare_vendor_project` can fail `lad_preexisting_diagnostics` even though `library.placeholder.state` shows 0 unresolved (stale `#SoftMotion_AddRamps` precompile log cached in the IDE). Fix: run `inoproshop_build_compile` once to flush the diagnostic store, then retry the SAME request unchanged. Only if it still fails should the network content be inspected.
- **Compile verdict**: `build.compile` can exit 1 with `errorCode=build_failed`/`compileOk=false` while the message reads "编译完成 -- 0 错误, 0 警告". Trust `data.acceptanceVerdict` (pass/fail, computed from `observedErrorCount`); exitCode/errorCode/compileOk are transport noise.
- **One call = one POU**: put the POU's complete network set in a single `networks` array (each element = one network). Same-name re-call fails `destination_exists` (no overwrite/append) — delete first, then regenerate with the full array. A single-network pilot is fine, then assemble everything in one call.
- **prepare path**: `inoproshop_project_prepare_vendor_project` requires `deviceName`+`version` and an ABSOLUTE `path` under the disposable root (`<LOCALAPPDATA>\PLC Code\codesys-bridge\vendor-experiments`); a relative path resolves against the tool's own directory and is not normalized.
- **Lesson**: the generator writes real programs (R48's 4-network CTUD+SR+SR+CTU compiled 0/0 on the first full-array attempt); the failures were the contract speaking at token granularity instead of capability-boundary granularity. Short descriptions + this corpus entry are the fix layer — never re-embed long contracts into per-turn tool descriptions.

## rm-w — Axis/motion capability boundary on AM600-CPU1608TP/TN (2026-09-06, c01)

- **Verdict**: on this CPU/route there is **no channel that can create an axis process object**. Every real path was empirically closed in c01 (each with tool + error code):
  1. Device-tree add (Axis / SM_Drive_Virtual / 1027) → vendor plugin dialog "此设备不支持在设备树添加,请尝试使用组态添加", the call HANGS ~300 s until killed (leaves a blocking dialog behind — dismiss first).
  2. Object factories → no axis/drive/softmotion factory registered (only AxisGroup 轴组 / ImagePool / GVL / DUT).
  3. CiA402 axis connector (`inoproshop_softmotion_axis_add`) → `softmotion_axis_target_not_ethercat_slave`; it hard-requires an existing EtherCAT slave.
  4. EtherCAT port enable → `ethercat_port_not_found` on port 1 AND 2; the CPU connector inventory shows only Common.PCI + SoftMotion General Axis Pool — **this CPU model has no EtherCAT physical port** (standard soft-PLC variant, not the motion variant).
  5. HSIO pulse-axis parameters (`inoproshop_vendor_configuration_write` hsioAxis — the tool EXISTS and echoes its exact verified schema via correctFormat) → `hsio_editor_identity_mismatch` (matchCount=0): it writes through an OPEN NewHSIOEditor page; opening that editor via `vendor.editor.open` (high_speed_io factory 9d973195-…) returns `editor_view_unavailable` (OpenEditorView null) — the bridge cannot open the HSIO 组态编辑器.
- **What IS deliverable**: the whole non-axis lifecycle (wizard project, libraries, ST/LAD programs, task wiring, compile 0/0). A motion program compiles via SM3_Basic (#SM3_Basic placeholder → 4.10.20.0 redirection) with `MC_Power/MC_MoveVelocity/MC_Stop` over a LOCAL `axVirtual : AXIS_REF_SM3` instance (exact pin signatures from inoproshop_lad_instruction_signatures, namespace SM3_BASIC) — honestly labeled as an unbound local structure: identical logic, swap in the axis binding once 组态 exists.
- **Lesson**: capability boundaries must be stated ONCE in tool descriptions/corpus (this entry + the device.add / vendor.editor.open / hsioAxis / softmotion_axis_add descriptions) so a fresh axis round costs ~5 calls instead of 54; never burn the discovery budget twice.

## rm-x — Call-economy self-audit (2026-09-07, c07 elevator retro, same-session interview)

The model's own retro after the 45-call elevator round. Every future round should apply these BEFORE acting (they are the difference between 45 calls and ~7):

- **Design once, then write**: the biggest waste class was "signal set not finalized" → GVL deleted+recreated 2x, ST rewritten 5x, LAD deleted+regenerated. Finalize the full signal set (all internal bits incl. resets/holds) in the FIRST GVL declaration; write ST with ascending FOR...TO only (this InoProShop ST parser rejects DOWNTO / BY -1); pick the interlock scheme (e.g. per-direction SR reset bits) before authoring.
- **Flush before first generate**: the first generator call after prepare trips lad_preexisting_diagnostics on stale #SoftMotion placeholder logs — the generator tool now self-heals (auto compile-flush + retry once), but the cheapest path is still to not hit it.
- **Do not re-probe known answers**: bridge status, device version (3.5.11.11), instruction ports, generator surface (compare/logic/arithmetic operators all verified 0/0 since 2026-09-07; contact generator cannot reach GVL, native batch needs symbolTypes) are ALL in route experience e1-e4 / rm-v — one experience read suffices; codesys_lad_find_template_evidence ×4 and search_instructions ×4 were redundant after it.
- **Read one verification, not three**: program.audit OR read_block_outline OR the generator's own native readback — pick one; finalize already returns compile verdict + task binding (inoproshop_project_finalize now includes the audit).
- **Composite tools available for the natural path**: inoproshop_project_bootstrap (close+prepare), inoproshop_project_finalize (task+save+compile+audit), inoproshop_object_regenerate (delete+recreate), inoproshop_batch (ordered chains). A fresh-project round: bootstrap(1) → GVL(1) → POU(s) → finalize(1) ≈ 5-8 calls.
- **GVL-qualified writes**: use full tree paths (Device/Plc Logic/Application/GVL_x) — short paths are rejected.

## rm-y — HSIO capability split: raw device params writable, editor blocked (2026-09-07, c16)

- **Two channels, opposite outcomes** (verified live in c16, project c16_hsio_lad, device 10F4 0600):
  1. **RAW NATIVE DEVICE PARAMETERS: WRITABLE.** `Device/HIGH_SPEED_IO` connectorId=2 "Internal" exposes 16 HS-channel parameters (HS 输入 1-8, HS 输出; per-channel `Xn0Func`/`Xn0IntResponTm`/`Xn0IntTreat`/`CounterMode`/`CounterFunc` + per-channel `ioMapping.available=true`). `inoproshop_vendor_device_parameter_write(target=Device/HIGH_SPEED_IO, connectorId=2, parameterId=1, elementPath=["Xn0Func"], value=0)` → committed=true with three-stage readback (before → after_set → after_object_manager_commit). This is the REAL HSIO configuration channel.
  2. **NewHSIOEditor: BLOCKED.** `vendor.editor.open` (high_speed_io factory 9d973195…) → editor_view_unavailable; `vendor.editor.page.parameter.write` (hsioAxis/hsioHardware) → hsio_editor_identity_mismatch (matchCount=0); `device.config.io.channels` bus=8 → hardware_graph_read_failed. Mapping HSIO counters into CODESYS process-image symbols (COUNTER_REF) requires that editor — currently unreachable through the bridge.
- **Program-side substitute (no fakery)**: detect HSIO counter activity via R_TRIG on the HSIO pulse INPUT channel (%IX) into an SR-latched lamp — the hardware counter register itself cannot be read into %ID symbols until the editor becomes reachable.
- **Tool contract fixes applied**: vendor_device_parameter_read REQUIRES target + parameterId (bridge rejects otherwise); connectorId=2 documented for HSIO internal channels.
- **Lesson**: a blocked EDITOR does not mean a blocked DEVICE — probe the raw device-parameter channel before declaring an area unsupported; and when a probe-heavy task is expected, the support matrix (write/read/blocked per tool + errorCode) IS the deliverable.

## rm-z — R090:命名空间预热缺口(真缺陷,已修) + 运行时验证族语义 (2026-09-10,AM600-CPU1608TP/TN)

V2 R090(27 调用/1 失败,新建 AM600 工程,GVE 直接 AT 寻址,LAD 7 网络,0/0,仿真 10/10 pass)。

- **命名空间预热缺口(真缺陷,已修)**:**新建工程**上第一次 `codesys_lad_generate_native` 会在 `validate_plan` 直接失败——原文 `SIGNATURE_SELECTOR_NOT_FOUND@networks[0].instructions[0].instruction`、`expected=STANDARD/R_TRIG`、`candidates=[]`、`message=no callable runtime signature matches the requested identity`、`remediation=Use the exact namespace or objectGuid reported in candidates.`,因为 **STANDARD 命名空间要等整工程编译一次才注册**;旧实现只对 `lad_preexisting_diagnostics` 自动 flush,所以首代必失败(实测 `generatorAttemptCount=1`/`generatorRetried=false`/`mutatedProject=false`)。生成器现在**自己跑一次离线编译并原样重试一次**(结果字段 `data.namespacePrewarm={performed,reason,build,retried,recoveredOnRetry,originalFailure}`),新工程不必再手插 `inoproshop_build_compile`。触发条件很窄:只有**每个失败都是 `SIGNATURE_SELECTOR_NOT_FOUND` 且 `candidates` 为空**才重试;重试仍失败时原始 `errors[]` 保留在 `data.namespacePrewarm.originalFailure`,真实拒绝不会被掩盖。
- **同一根因两种错误码(要一起索引)**:老经验 e17 记的是 `missing_project_library_reference namespace STD`,R090 报的是 `SIGNATURE_SELECTOR_NOT_FOUND(expected=STANDARD, candidates=[])`——同一个根因(Standard 未预编译)、两个错误码。**`candidates` 为空时旧 remediation "用 candidates 里报的命名空间"无法执行**(没有候选项);现在改为"先编译一次预热再原样重投;仍失败说明该指令/命名空间确实不存在于实时目录"。
- **运行时验证族语义(与 vanilla 线同结论,见 `13-codesys-vanilla.md` 的 `cs-sim-r053`)**:会话已存在时 `preset` 不重启程序、写进去的是运行期值而非上电默认值;重新登录/停止都**不复位变量**(R090 里 logout→re-login 后 `bLamp` 仍是上一轮遗留的 TRUE);`sim.online action=stop` 会顺手关掉仿真开关;所以**场景必须先 `codesys_sim_read` 实测运行态再锚定断言**。R090 的 3 次仿真调用里 2 次失败全部来自"误以为初值是初态"。
- **要点**:环境语义要写进卡片/语料(比让模型用失败调用猜便宜得多);同一根因的多个错误码必须一起索引,否则换个码就会再踩一遍。

## MOVED - see `13-codesys-vanilla.md`

> The `cs-*` entries that used to live at the end of this file (cs-rp, cs-ui, cs-lad-verdict, cs-lad-v2, cs-regression-trim) were verified on the VANILLA CODESYS line (vendor=codesys, integration=codesys_bridge) and now live in `13-codesys-vanilla.md`. This file is InoProShop-only (vendor=inovance, family=inoproshop, integration=inoproshop_bridge).
