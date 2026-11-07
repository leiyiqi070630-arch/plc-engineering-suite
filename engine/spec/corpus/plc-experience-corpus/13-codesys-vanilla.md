# CODESYS V3.5 (vanilla) LAD/ST — Experience Corpus

> Real-machine forensic entries for the VANILLA CODESYS route (vendor=codesys, family=codesys, integration=codesys_bridge). Verified on CODESYS Development System V3.5 SP22 Patch 3 (EO OEM build) with the CODESYS Ladder add-on, driven through the resident file-IPC bridge (route_cli.py + persistent_bridge.py), not part of the 30-round frequency distillation. Entries use `cs-<topic>` ids (no occ count, same convention as the other forensic addenda).
>
> This is a DIFFERENT line from `12-inoproshop-lad.md` (vendor=inovance, family=inoproshop): both are CODESYS-kernel and share the `codesys_*` tool prefix, but their generators, instruction registries, IDE objects and acceptance evidence differ. Never copy a finding from one file to the other.

## cs-rp — vanilla CODESYS real-project e2e, unrestricted instruction set (2026-09-08, SP22 EO build)

- **What**: a real project (配料搅拌罐 Batch Mixing Tank) generated and compiled 0/0/0 on the vanilla CODESYS V3.5 SP22 (EO OEM build, ScriptEngine 4.2.0.0). The project dictates the instructions — no fixed allowlist. Spec: `work/inoproshop-corpus-e2e/real-project-spec.json`; driver: `real_project_campaign.py`; shape probe first (`shape_probe.py`, 6/6 shapes OK).
- **Project inventory**: GVL_Mix + ST_TankState DUT enum + PLC_PRG (ST: CASE sequencer, FOR average, program calls) + 9 LAD POUs: LD_MotorSeal (seal-in parallel branch + 3 negated contacts), LD_FillValve (negated series), LD_TempAlarm (GT with coil on ENO, LT, SEL), LD_AgitatorTimer/LD_DrainTimer (TON), LD_PulseGen (TP), LD_BatchCounter (CTU), LD_LevelScale (INT_TO_REAL/SUB/MUL/DIV/LIMIT chain over local vars), LD_StatusString (CONCAT x2). Final: build.diagnostics 0/0/0, saved, closed, reopened, compiled again 0/0/0 (compileStatus=success).
- **New generator surface (all vanilla-line-only, profile-gated `_is_vanilla_codesys_profile`)**: bridge op `lad.generate_project_pou` + compiler `compile_project_pou_plcopen` — ONE POU, multiple networks off ONE leftPowerRail (the SP22 importer splits networks by connectivity, MotorStarter.ld.xml topology). Network kinds: contact_coil (series + one-level branches, branch merge = multiple <connection> refs on the merge element), box (Function on EN/ENO power path: contact->block(EN), ENO->coil or rightPowerRail, data pins via inVariable/outVariable), fb (TON/TOF/TP/CTU/CTD/CTUD instance on the power path: contact(power pin)->block->coil on FIRST output port, other outputs via outVariable; instance declared localVars <derived name="FB"/>).
- **IEC built-in operator table**: GT/LT/GE/LE/EQ/NE/ADD/SUB/MUL/DIV/SEL/MUX/MAX/MIN/LIMIT/ABS/SQRT/TRUNC + conversions are language built-ins ABSENT from the live catalog (only 831 library signatures resolve via lad.instruction_signatures). `_resolve_project_instruction` = live catalog first, built-in table second — resolution layers, not an allowlist.
- **Traps fixed live (each would have cost a full IDE round)**: (1) CODESYS PROGRAM POUs CANNOT be instantiated in VAR blocks — the ST main calls LAD programs directly by name (`LD_MotorSeal();`), declare instances only for FBs; (2) one shared id space for the whole POU — per-network id counters collide; (3) `_tc6_coil` takes a REFS LIST (branch-only rungs feed the coil every leg's last id); (4) per-POU import diagnostics show a transient 1/1 (editor stage) — the authoritative verdict is build.diagnostics after the whole project compiles; (5) build.compile ok=False "offline build failed" is transport noise — diagnostics compileStatus=success wins; (6) the storage-format upgrade dialog (是/否/取消) after device.update blocks the queue — auto-dismiss with 是 (upgrade); (7) string literals: feed CONCAT from GVL constants, not inline expression strings.
- **Line discipline**: InoProShop native routes untouched; the new op raises operation_unsupported_on_profile on the InoProShop line; all three bridge copies (repo/packaged/Desktop) hash-identical.

## cs-ui — SP22 UI stays frozen AFTER work: resident script holds the UI thread (2026-09-08)

- **Symptom (user report)**: the vanilla CODESYS IDE freezes during bridge work (expected), but stays UNCLICKABLE even after every op finishes. Not a dialog, not a stuck op — bridge heartbeat idle the whole time.
- **Root cause**: on SP22/ScriptEngine 4.x the resident --runscript script IS the primary UI thread (execute_on_primary_thread exists-but-raises, background threads forbidden — watcher.py reference design). `system.delay(ms)` only suspends the script; it does NOT pump the IDE message loop. So from script start until script EXIT the IDE never repaints or accepts input — the poll loop holds the UI hostage at idle too, forever.
- **Fix (verified live 2026-09-08)**: campaigns end with `route_cli shutdown` (op bridge.shutdown) -> bridgeShutdown=true, ideKeptOpen=true, heartbeat=stopped, ready file removed, CODESYS.exe stays running with the project open. The UI returns the moment the script exits. Next campaign = probe restart ritual (~100s) first.
- **Also fixed this round**: the storage-format 是/否/取消 dialog detector was DEAD CODE — the upgrade text lives in a child Static control while the dialog title is just "CODESYS", so keyword matching on the title never fired; the dialog intermittently stalled device.update (pending until manually dismissed). The campaign watchdog now walks child controls and dismisses within 2s; plus signature resolution batches to ONE live-catalog walk per POU and per-op snapshots read only the 2 PLC categories (all vanilla-line-only).
- **Open option (not attempted)**: a WPF Dispatcher.PushFrame nested-pump yield could keep the UI responsive WHILE the bridge runs (interactive during campaigns). Requires the user to click-test — offered, not implemented.

## cs-lad-verdict — vanilla SP22 EO build has NO LAD capability; all earlier "LAD 0/0/0" claims vacuous (2026-09-08)

- **Verdict (evidence)**: this vanilla CODESYS EO (OEM) build cannot hold LAD at all.
  1. `lad.native_type_inventory` -> types=[], assemblies=[], status=not_found.
  2. `create_pou(language=ladder)` resolves the LD factory to {29148beb...} (Inovance GUID, from the shared machine registry) which is absent here -> "找不到类型".
  3. `project.import_xml` silently DROPS every LD body — verified by native export readback: even the previously "verified" minimal sample (lad_minimal_plcopen.xml) and public samples addition.xml (full Config/Resource/Task) and MotorStarter.ld.xml import as TEXT POUs with empty implementations (TextBlobForSerialisation empty, no NetworkList).
- **Discipline failure (the real lesson)**: "import ok + compile 0/0/0" proves NOTHING for LAD — an empty program shell compiles cleanly. Every LAD acceptance MUST include native export readback (NetworkList>0 / IsContact / RValue counts). The whole 9-POU "real project LAD closed loop" and the shape probes were vacuous; claims withdrawn, shells deleted.
- **The actual vanilla capability**: ST text is the real channel (pou.upsert + content readback verified). The real project now lives as GVL_Mix + ST_TankState DUT + PLC_PRG in full ST (TON/TP/CTU instances, LIMIT/SEL positional args — this build's parser rejects named args on built-in operators, GT/LT comparisons, CONCAT, FOR/CASE sequencer) -> compile 0/0/0, saved.
- **Line split (final)**: LAD = InoProShop line (native, works). Vanilla CODESYS line = ST real projects + the shared bridge (now the InoProShop thread model: background loop + WinForms SynchronizationContext marshal; UI stays operable — user-verified).

## cs-lad-v2 — Ladder 插件解锁 PLCopen 导入 + 142 条指令注册表全量验证 (2026-09-08)

- **关键解锁**:装上 CODESYS Ladder 插件后,`project.import_xml` 由插件自带转换器把 PLCopen LD 体转成真 LAD(JSON 模型)——装插件前同一条通道静默丢弃 LD 体(空壳编译 0/0/0 的假闭环根源)。黄金样本:插件安装前用户 GUI 创建的 POU 原生导出(Implementation {f0fda5b8},ModelJson LadderDataModel)。
- **形状铁律(全部真机导入+原生回读+预编译 0/0/0 验证)**:(1) contact_coil 系列/并联分支/常闭触点 = 一个连通网络(一个左母线,网络按连通性拆分;分支合并 = 汇合元素 connectionPointIn 列所有支路末端);(2) 函数盒 = 串联 EN 接线(触点→EN),**只能一个数据输出**(ENO 或第二个输出会被编辑器拒"输出太多");(3) 定时器/计数器 = Q 单输出(ET/CV 先不接);(4) TC6 类型元素 string/wstring 必须**小写**(大写被转换器按 XSD 拒);(5) 变量名不用指令名(双下划线名解析崩);(6) 原生 JSON 路线的 $type 必须每对象第一个键(sort_keys=True)——该路线已被 PLCopen 路线取代,留作证据。
- **142 条指令注册表**(verified-registry.json,家族:6 FB + 24 比较 + 28 算术 + 23 转换 + 9 STANDARD 字符串 + 24 数学 + 4 逻辑 + 14 LIMIT/MAX/MIN + 10 移位,加 23 个内置算子),每批 14 条一个 POU、预编译 0 报错即通过(用户验收规则);剔除 14 个内部/上下文函数(ADDR/ID/MAKE_EVENTID/CODEM*/EVENT*/SLOT_ID/ANY*__TO__*/LEN_INTERNAL/MYSTRING* 等),每个都有真实诊断点名。
- **对齐落地**:引擎工具 `codesys_lad_generate_project_pou`(spec 内联完整注册表 + 计划 schema + dispatch/ops 映射,cargo 通过)——与汇川 codesys_lad_generate_native 同规格;桥退回运输工(导入+原生回读验证 ladderBodyVerified/readbackCounts)。
- **真实项目重建**:9 个 LAD(自锁分支+常闭、GT/LT/SEL、TON/TP、CTU、五级换算链、CONCAT)+ ST 主程序,全部 body=True,编译 0/0/0,saved。汇川线健康无回归(桥 ready,未动)。
- **纪律**:LAD 验收 = 原生导出回读数元件 + Networks 计数;编译数单独不算数。

## cs-regression-trim — 双线回归 + 汇川注册表裁剪 896→260 (2026-09-08)

- **双线回归(均真机)**:CODESYS 线:真实项目 close→reopen→compile 0/0/0(status=success),9 个 LAD 逐个原生导出回读(触点/线圈/块计数)全部真身保留——持久化闭环成立。汇川线:桥健康 → prepare_vendor_project(AM600-CPU1608TP/TN 3.5.11.11 向导)→ 编译 0/0/0 → save → close,冒烟全绿,未扰动用户状态。
- **汇川注册表裁剪(用户指令"600多条太夸张")**:`inoproshop_tools/verified_generator_index.json` 896 → **260**:保留核心日常面(CTU/CTD/CTUD、TON/TOF/TP、SR/RS、R_TRIG/F_TRIG、BLINK、全部原生算子 EQ/NE/GT/GE/LT/LE+AND/OR/XOR/NOT+ADD/SUB/MUL/DIV/MOD/ABS/NEG+LIMIT/MIN/MAX/SEL/MUX+移位+实数函数、MOVE、15×15 转换矩阵+TIME<->DINT);636 条库长尾(APP*/DED/CAA/COMMFB 内部件等)移入 excludedLowValueDeprecated——不删除,随时可找回。工具描述与 list/search 计数同步更新。
- **验证**:cargo check 通过;tools 全量测试 **1342 passed / 0 failed**(裁剪未破坏任何既有生成器断言)。

## cs-route — 双线路由/工具/桌面接线分离 (2026-09-08, 路由落地)

- **引擎路由**:`routes/route-metadata.json` 新增 `codesys-v35-lad`(vendor=codesys, vendorName=CODESYS, family=codesys, integration=codesys_bridge, language=st, displayLanguage=LAD/ST, canvas=lad, mainFile=main.st, lintProfile 空, defaultModel=CODESYS V3.5 SP22 Patch 3)+ familyToken `codesys`(排在 inoproshop 之后,AM600/AM400 仍先命中 inoproshop)。运行时 `PlcToolRoute::Codesys` 由 vendor+integration 判定(与 TIA 同构,不看 language),命中后注入 `codesys_route_lines()`;未命中但 vendor=codesys 的项目走 Route warning,不伪装成该路线。
- **工具门控(两条 CODESYS 线共用 `codesys_*` 前缀,只能按名单分,不能按前缀分)**:vanilla 路由隐藏 `inoproshop_*` + InoProShop 原生 LAD 生成器/注册表族(native/contact_block/native_template/generate_instruction/generate_add/generate_block/lad_create/instruction_spec/list/search/signatures/find_template_evidence/recipes/generate_st_plan)+ 厂商 IDE 对象族(online/trace/visual/alarm/recipe/device_categories/device_set_parameter/project_create/structured_view_probe/symbol_*/system_*)——128 条 `codesys_*` 收敛到 76 条通用脚本面;汇川路由反向隐藏 `codesys_lad_generate_project_pou`(桥内 profile 门 `operation_unsupported_on_profile`)。
- **桌面接线**:`SOFTWARE_CHOICES` 增加「CODESYS 标准版」卡片(routeId=codesys-v35-lad),`VENDOR_LABEL_ZH.codesys`、picker 图标同步;工程脚手架仍由路由元数据生成(main.st 空文件 + plc-code.project.json)。**lint 修复**:`inferProfile` 原先对任何未声明 lintProfile 的路线的 `.st` 文件回落成 `mitsubishi.fx3.st`(TIA/vanilla CODESYS 都会被打上三菱诊断),现仅在 Mitsubishi 路由内回落,其余返回空 → 桌面显示"没有可用的 PLC lint profile"(与路由 `lintProfile: ""` 一致,验收靠桥的导入/编译/回读)。
- **桥进程环境(关键,否则两条线会串台)**:`route_cli.py` 的 EXE/PROFILE/WORK/DISPOSABLE/REPOSITORY 默认值都指向汇川安装;新增 `PLC_CODE_CODESYS_LINE=vanilla` 一键切换默认束(CODESYS.exe + profile "CODESYS V3.5 SP22 Patch 3" + 独立 `codesys-bridge\vanilla\work` 队列 + `C:\ProgramData\CODESYS\Managed Libraries`),显式 `PLC_CODE_CODESYS_*` 仍优先。桌面在会话绑定 vanilla 工程时把该变量注入引擎 env。
- **WMI 启动陷阱(实测)**:`Win32_Process.Create` 创建的子进程**不继承调用者环境**(本机验证:调用者设置的标记变量在子进程 `set` 输出中不存在),所以 route_cli 用 WMI 拉起 IDE 时必须把 `CODESYS_BRIDGE_*`(含 PROFILE/队列目录)通过 `cmd /c set ... && start ...` 包一层传进去,否则常驻桥会退回默认汇川 profile + 默认队列目录(请求写进 vanilla 目录、桥在默认目录轮询 → 超时,或 `_is_vanilla_codesys_profile()` 判假直接拒生成)。Popen 路径同样需要显式 `CODESYS_BRIDGE_PROFILE`。
- **纪律**:两条线的桥是两份常驻进程(不同 IPC 队列),可同时存活;任何一次"改桥"仍要三份副本(仓库/打包/桌面)哈希一致。

## cs-r021 — vanilla 线首轮 E2E(R021)实测:模板名、open 预检、占位设备版本、软 PLC 的 AT 地址 (2026-09-09)

真机 E2E R021(CODESYS V3.5 SP22 + CODESYS Control Win V3 软 PLC,最终 `0 错误 / 0 警告`,并做了负向对照:故意调用不存在的 POU → 2 错误/fail,恢复后 0/0)。

- **`project.create` 的模板名必须显式给 `Standard.project`**:桥的默认模板是 `CodeSysProject.project`,而本机 `D:\CODESYS\CODESYS\Templates` 只有 `Standard.project` / `Empty.project` / `*.template` → 三次同样的 `template_not_found: …\Templates\CodeSysProject.project`。`route_cli.py` 的 `project-create-standard` 子命令本来就传 `template="Standard.project"`;引擎的 `codesys_project_create_standard` 现在也自动补上(调用方显式给 template 时不覆盖)。
- **`project.open` 的库预检可能挡住能编译的工程**:重开刚保存的工程被 `project_preflight_blocked` 拦下,原因是模板自带 `IoStandard, 3.1.3.1 (System)` 而本机是 3.5.22.0/3.5.4.0;编译器本身不报错。`route_cli` 支持 `preflight=false`,引擎的 `codesys_project_open` 现在暴露该参数(默认 true)。
- **模板设备 `PLCWinNT` 是占位版本**:不改版本就生成代码会失败,首次改动还会弹"存储格式升级"对话框——`device.update` 因此卡满 300 s。顺序应是:create → 必要时 `device.update`(接受对话框)→ 再生成/编译。
- **软 PLC 没有物理 IO,但 `AT %IX0.0` 合法**:`AT %IX0.0/%QX0.0` 在 PLCWinNT 上编译 0/0;因此任务里"地址必须对应已组态模块"与"软 PLC 默认设备"并存时,以编译通过为准。
- **LAD POU 落在根节点也能编译**:生成的 LAD POU 位于项目根而非设备树下,编译器仍解析成功(`ladderBodyVerified` + 回读计数为证)。
- **清理边界**:删除 LAD 块 + IO 映射 GVL,并把模板自带的 `PLC_PRG` 还原为 `;`。
- **语料缺口**:`plc_corpus_find("启保停")` 只命中西门子 SCL 条目——CODESYS LAD 版启保停(编译验证级)尚未入库。

## cs-r022 — vanilla 线 R022:桥启动竞态、save_as 覆盖、根级 POU 与 create 模板的连锁 (2026-09-09)

真机 E2E R022(单按钮启停;最终 0 错误 / 0 警告,负向探针 2 错误/fail)。

- **桥启动竞态**:首调 `project.create` 报 `bridge_start_failed`("InoProShop exited before the bridge became ready"),但实测 IDE 存活(pid 35880),`_ready.txt` 约 12 s 后才写出——错误文案还错写成 InoProShop(vanilla 线应写 CODESYS)。引擎现在对 `project.create` 的该错误**等 12 s 重试一次**;IDE 真死时重试仍失败。
- **`project.save_as` 的 `destination_exists` 无覆盖口**:目标路径残留上一步复制的模板 → `destination_exists; set overwrite=true`,而工具没暴露 `overwrite`。现在已加(默认 false)。
- **绕过 create 的代价**:手工复制 `Standard.project` 后 `project.open` 被 `IoStandard 3.1.3.1` 预检拦住(本机 3.5.22.0/3.5.4.0);`project.open` 现在暴露 `preflight=false`。
- **根级 POU 仍参与应用编译**:`codesys_lad_generate_project_pou` 不带 parent 时 POU 落在工程根,编译器照样编译(探针证明非假绿),但结构不合常规——与 `gvl.create` 的 parent 行为不一致。
- **`codesys_read_block_outline` 短名会退化成 `pou.get`**(返回 ok=true 但内容不是 outline),属工具缺口。
- **工作区边界**:桥的 `…\codesys-bridge\vanilla\work` 在工作区外,文件工具拒绝(提示改用 shell)——按提示换 PowerShell 即可,不要重试同一路径。
- **验收口径(建议写进提示词)**:交付证据应同时给 `ladderBodyVerified` + `readbackCounts` + 整机编译 0/0。

## cs-r026 — vanilla 线 R026:SP19 存储格式升级模态框、host 子命令工具、LAD 大纲 (2026-09-09)

真机 E2E R026(三层电梯 LAD,41 网络,`ladderBodyVerified=true`,回读 41 线圈/136 触点/1 TON,整机 0/0)。

- **`Standard.project` 是 SP19 存储格式**:首次保存/设备更新时 IDE 弹「是否升级存储格式至 SP22」(按钮 是/否/取消),该模态框把 `device.update` 卡满 300 s,随后 `bridge.status` 也超时,`project.status` 直接返回 `blocked_by_native_dialog`(信封里带 hwnd + 按钮 + 正文)。引擎现在**优先从失败信封解析对话框**并点安全按钮(是/确定/OK…)后重试一次;只提供 否/取消 的对话框不自动点。
- **本线没有对话框工具**:`inoproshop_dialog_detect/dismiss` 属汇川线;vanilla 线的模型只能用 PowerShell 点窗。引擎侧自动恢复是正解。
- **`codesys_project_mirror_export` / `codesys_project_diff` 走 route_cli 子命令**,不是 `call <op>`:此前报 `unknown_operation: __host.project.mirror_export`。
- **`codesys_read_block_outline` 对 LAD 不返回网络清单**(只有 ST 有),别用它证明网络结构——用原生回读 XML 的 Network/Contact/Coil 计数。
- **相对路径会被拒**:`unsafe_project_path`(工程必须落在 `…\codesys-bridge\vanilla\vendor-experiments` 下)。
- **`object.rename` 对 `PLCWinNT/Plc Logic/Application/PRG_x` 报 handler_error**,重命名要等对象树稳定后再做。

## cs-r027 — vanilla 线 R027:box 输出引脚=指令名、设备未更新会基线报错 (2026-09-09)

真机 E2E R027(恒压供水 PID LAD,53 网络,`ladderBodyVerified=true`,回读 38 块/17 线圈/75 触点,整机 0/0)。

- **box 的输出引脚名是「指令名本身」,不是 `result`**:`outputs.result` 被拒(`lad_plan_validation_failed`,`knownPins=[MUL]`);比较/算术/数学/转换类 box 一律用 `MUL`/`GT`/`SEL`/`SQRT`/`INT_TO_REAL` 之类同名引脚。不确定就查 `codesys_lad_instruction_signatures`。工具卡已按此更正。
- **必须先 `device.update` 再编译**:`Standard.project` 里的占位设备 `PLCWinNT` 未更新时,基线编译报 16 个错误(首条 `C0188 系统没有安装设备。不能生成代码`);更新到 3.5.22.30 后 0/0。
- **相对路径/工作区外路径会被拒**(`unsafe_project_path`),工程必须落在 `…\codesys-bridge\vanilla\vendor-experiments` 下。
- **`ide_process_exists`**:IDE 进程已存在但桥未接上时会报此码——先 `bridge.status`,必要时关掉 IDE 再重来,不要盲目重投 create。

## cs-r036 — vanilla 线 R036:假绿陷阱(根级 POU 不参与编译)、CTU/CTD/CTUD 是 WORD、gvl 非 upsert (2026-09-09)

真机 E2E V1 R036(步进梯形加减速 LAD,27 网络,`ladderBodyVerified=true`)。这轮是整条线最重的发现,已全部落入 V2 修复。

- **假绿陷阱(最重要)**:`lad.generate_project_pou` 曾把 POU 导入工程根节点(`parent:null`,回读 `importedPath:"PRG_StepperTrapezoid"`),此时 `build.compile` 报 **0/0/0** 但编译日志只有"开始编译应用程序 PLCWinNT.Application"——**该 POU 根本没参与编译**。用 `project.import_xml` 带 `parent=PLCWinNT/Plc Logic/Application` 移入后,同一 rebuild 立刻报 2 个真错误。**验收必须三关:① POU 在 Application 下(结果带 parent/importedPath);② `ladderBodyVerified=true` + `readbackCounts>0`;③ 在任务调用列表里 + 整机 diagnostics 0/0/0**。V2 修复:桥自动解析 Application 节点(除非显式传 parent),工具卡与路由行写明三关。
- **CODESYS 标准库 CTU/CTD/CTUD 的 PV/CV 是 WORD**(不是 IEC 习惯的 INT/DINT):`diTargetPulses : DINT` 接 PV → `不能将类型 'DINT' 转换为类型'WORD'`。计数参数全用 WORD,对 WORD 的 SUB 运算换成参数化常量。
- **`codesys_gvl_create` 不是 upsert**:同名第二次调用报 `相应名称空间中已经存在名称为'GVL_Stepper'的对象`,必须 delete+recreate。
- **没有 object.move/reparent 工具**;`object.rename(newName="全路径")` 报 `handler_error`(rename 不接受路径)。移动手法 = 导出 XML 后用 `project.import_xml` 带 `parent` 重导入。
- **`codesys_object_delete` 短名解析歧义**:根级 POU 与 MainTask 调用项同名时,短名删除报 `object_delete_readback_failed`(实际删掉了一个)→ 用全路径。
- **`task.pou.set` 当时无工具卡**(V2 已加 `codesys_task_pou_set`,entries 必须全为 PROGRAM POU 名)。
- **无关闭 IDE 工具**:`bridge.shutdown` 返回 `ideKeptOpen:true`;V1 用 PowerShell `CloseMainWindow()`。V2 已加 `codesys_ide_close`(WM_CLOSE + 退出证明,pid 缺省取桥心跳)。
- **无 dialog-dismiss 工具卡**:存储格式模态框靠引擎自动恢复(点安全按钮)或 `route_cli dialog-dismiss --hwnd … --confirm dismiss_dialog` 手动清。
- 生成器形状缺(实测):无 R_TRIG/F_TRIG、无 SET/RESET 线圈、无取反线圈、无 MOVE box、box 无常量字面量、`variables[]` 无初始值——边沿用记忆位+自保(contact_coil),条件赋值用 SEL 链。这些已写进 `codesys_lad_generate_project_pou` 工具卡。

## cs-r021-v2 — V2 重跑 R021:修复全部生效,新增三个接线结论 (2026-09-09)

V2 首轮 CODESYS LAD(32 次调用/4 失败/221 s,对比 V1 同轮 80 次/7 失败/724 s),最终 0/0/0 + `ladderBodyVerified=true`(21 触点/7 线圈)+ `importedPath=PLCWinNT/Plc Logic/Application/PRG_MotorStartStop`(假绿修复生效)+ `codesys_ide_close` 正常关 IDE。本轮实测新增:

- **删除顺序 = 硬约束**:删除仍被任务调用的 POU 会让 CODESYS 在同路径重建一个**同名空 stub**(新 GUID、空实现),随后重新生成报 `ambiguous_object_target` / `import_target_exists`。清理顺序:先删任务条目对象(`<TaskPath>/<POU>`,如 `.../MainTask/PRG_MotorStartStop`)→ 再删 POU → 再删 GVL,三者均 `absenceReadback=true`(本轮验证)。
- **`codesys_task_pou_set` 不能缩容**:从 [PLC_PRG, PRG_X] 缩到 [PLC_PRG] 报 `task_pou_set_failed`(readback mismatch + 自动回滚)。删调用只能走"先删任务条目对象"。
- **`dialog-dismiss` 需 `--confirm dismiss_dialog`**,且 route_cli.py 的真实路径是 `<resources>\inoproshop\codesys-bridge\route_cli.py`(V2 已加 `codesys_dialog_dismiss` 工具卡,无需再猜路径)。`device.update` 的"请手动 dialog-dismiss"提示可能是过期 hint(桥的 legacy prompt 已自动消解对话框)。
- **失败调用可能留有副作用**:两次重生成都报错,但存活的 stub 声明面板恰好是请求的 5 变量版本(declarationChars=130)——"mutatedProject=false"不代表零写入,删后重建前先读 `codesys_pou_get` 核对声明。

## cs-r022-v2 — V2 R022:无 S/R 的 LAD 翻转 6 网络(0/0 验证) + 三个新接线修复 (2026-09-09)

V2 R022(37 调用/6 失败/223 s,0/0/0 ×3 + `ladderBodyVerified=true`(10 触点/6 线圈))。删除顺序修复(R021)本轮完全生效:任务条目→POU→GVL 三删全 `absenceReadback=true`,无 stub 陷阱。本轮实测新增:

- **无 SET/RESET 的单按钮翻转(编译验证写法)**:`xPulse`(记忆位对自建上升沿,本线无 R_TRIG)+ 自锁翻转 `(R AND NOT P) OR (P AND NOT R) → R`,两输出网络 `R → Q_Run/Q_Lamp`;TON 20ms 先去抖。6 网络 0/0。金样例仍是西门子 SCL 版(`片段/12_西门子SCL真实工程/单按钮启停_翻转自锁_RTRIG.scl`,公式等价但用 R_TRIG)。
- **disposable 根真值**:`%LOCALAPPDATA%\PLC Code\codesys-bridge\vanilla\vendor-experiments`(create_standard 卡曾经被截断成"…vendor-experiment…",模型猜错根 → unsafe_project_path;卡与路由行已写全)。
- **残留 pid 自愈**:上一轮的 `inoproshop.pid` 指向已被 Windows 复用的无关进程 pid(wps)→ `bridge_process_exists`。route_cli 现已校验 pid 属于本线 IDE 镜像,否则清残留继续(R022 修复)。
- **mirror_export 的 disposable 曾被 subcommand 吞掉**:传 disposable=true 仍报 `disposable_confirmation_required`——route_cli 的 project-mirror-export 子命令从没转发该标志。两层修复:子命令加 `--disposable` 并转发,引擎侧把 disposable 加入布尔标志转发列表。
- **`device.update` 的 dialog hint 可能是过期的**:引擎已自动消解对话框后,hint 仍随结果返回 → 模型"补刀"报 `dialog_not_found`(良性)。已修:hint 只在对话框仍存在时附加,且文案指向 codesys_dialog_dismiss。
- **`gvl.create` 返回 `path:null`**(桥不回传落点)→ 多一次 project_tree。已知,容忍。
- **注释写入工作流**:生成器 networks/variables 无 comment 字段 → 生成后用 `codesys_pou_set_text` 改写声明区加中文注释(exactMatch=true,0/0 不变)——已验证安全。

## cs-st-r041 — vanilla 线 ST 首轮 E2E(R041):常闭安全回路启保停 + ST 通道三重验证 (2026-09-09)

V2 R041(20 调用/**0 失败**/130 s;`PRG_MotorControl` + `GVL_IO` + `GVL_Motor`,0 错误/0 警告,`acceptanceVerdict=pass`)。ST 通道事实:

- **ST 通道三重验证齐备**:`pou.upsert`(declaration+implementation)→ `task.pou.set`(`exactReadback:true`)→ `build.compile`(0/0,`diagnosticsStable:true`)+ `source.snapshot` 回读;清理顺序"任务调用项→POU→GVL"在 ST 通道同样成立(4 次 object.delete 后树内无 stub 重建)。
- **GVL 直接地址 + 中文注释共存**:`GVL_IO` 6 个 `AT %IX0.0~%QX0.1` + 中文块注释一次编译通过(`declarationChars:532`,无"硬件不存在"报错);软 PLC 的逻辑地址不代表物理接线。
- **POU 内声明 FB 实例可编译**:`fbStartEdge : R_TRIG;` / `fbAckEdge : R_TRIG;` / `fbFaultBlink : TON;` 写在 PROGRAM 的 VAR 块内,0/0 + 声明回读 exactMatch(已进 pou_upsert 卡)。
- **`task.pou.set` 是整体替换**:`before:["PLC_PRG"]` → `after:["PRG_MotorControl"]`,`mutationTrace.method=replace`;被替换掉的 `PLC_PRG` 仍留在工程里但不再被调用(不自动删除)。
- **常闭安全回路启保停(0/0 验证的标准写法)**:停止按钮/热继电器按**常闭接线**建模(`xStopHealthy`/`xOverloadHealthy`,1=正常,0=按下/跳闸/断线,失电即故障);过载 → `xFault` 锁存;复位条件 = 复位按钮上升沿 ∧ 故障原因已消失 ∧ 停止回路正常(原因未消除无法复位);启动用 `R_TRIG` 沿;同一扫描内先判故障、`ELSIF` 再判启动(停止/故障优先);输出层再串一次硬条件 `xContactor := xRun AND NOT xFault AND xStopHealthy AND xOverloadHealthy`,每条扫描路径都赋值;故障灯 0.5 s 闪烁(TON)与运行指示区分。
- **沉默错误警示**:常闭/常开写反、故障不锁存这类错误**能编译通过**——编译通过不是安全回路的证据,只有设计推演+接线语义注释能防;报告必须声明无运行时验证(本线无仿真/在线工具)。

## cs-st-r042 — vanilla 线 ST R042:注释载体与 LAD 相反 + 任务表"只增不替"稳妥模式 (2026-09-09)

V2 R042(19 调用/**0 失败**/120 s;单按钮启停,0/0,声明/实现哈希回读 exactMatch)。ST 通道新结论:

- **注释载体与 LAD 相反**:ST 的中文注释直接写进 POU 声明/实现(`(* 中文 *)`),回读 exactMatch 且整机 0/0——**不要按 LAD 规则把 ST 注释删掉**(路由行已按通道限定)。
- **ST 验收三门**:POU 未挂任务也 0/0 绿(与 LAD 根级 POU 假绿同族)→ (1) upsert/gvl.create 回读 exactMatch、(2) 整机 acceptanceVerdict=pass、(3) 任务调用表读回含该 POU。路由行已补。
- **任务表"只增不替"稳妥模式**:保留模板 `PLC_PRG`,只做添加(`before=["PLC_PRG"]` → `after=["PLC_PRG","PRG_X"]`,`mutationTrace.method=add`,`exactReadback=true`),全程不触发 `task_pou_set_failed`/STUB 重建;要删调用则先删任务条目对象。
- **TON 去抖取任务周期整数倍**:50ms 任务周期下 PT 取 100ms(2 周期);PT<任务周期时实际延时被量化到任务周期,属隐性偏差。
- **`pou.upsert` 现在回传树路径**(R042 修,镜像 gvl.create):删除目标不再需要额外 project_tree;桥两副本已同步。
- **ST 一次成型**:`TON`(IN/PT/Q)、`R_TRIG`(CLK/Q) 实例在 VAR 中声明后直接调用、`T#100MS` 字面量、GVL 的 `name AT %IX0.0 : BOOL;` 全部一次通过——ST 通道无"先探测再重写"成本。

## cs-st-r043 — vanilla 线 ST R043:交通灯周期相位状态机 + TIME 算术属 ST 不属 LAD (2026-09-09)

V2 R043(17 调用/**0 失败**/2 重复/198 s;`GVL_TrafficLight` + `PRG_TRAFFIC_LIGHT`,0/0,`canonicalMatch:true`)。ST 通道新验证:

- **TIME 算术在 ST 可用(跨通道关键区分)**:`xParamOK := (T_RED = T_GREEN + T_YELLOW);`(TIME 加法 + 相等比较)编译 0/0——LAD 卡的"TIME 不参与算术/无 DINT_TO_TIME"是 **LAD box 引脚限制,不是 ST 限制**;路由行已写明"不得跨通道搬运"。
- **周期相位状态机金写法(0/0)**:步序定时器 IN 由 `iStep = n` 直接驱动 → 天然"进步清零",避开"复用一个 TON 忘记复位导致下一周期立即跳步"的经典缺陷;相位请求互斥 + 对向绿/黄输出反馈互斥 + 急停/故障锁存 + 输出层唯一写入,四层各做一件事。
- **黄闪 500ms 方波(不依赖 BLINK/Util 库)**:`tonBlink1(IN := NOT tonBlink1.Q) → tonBlink2(IN := tonBlink1.Q) → xBlink := tonBlink1.Q AND NOT tonBlink2.Q`。
- **失效安全态**:`xNS_Red := NOT xNS_Permit`——无许可即红灯,待机/故障/对向通行全为红。
- **GVL 形状再验证**:`name AT %QX0.0 : BOOL;` + `T#20S` 初值 + 中文注释一次 0/0(`exactMatch:true`);POU VAR 段直接声明 `rtStart/rtReset : R_TRIG` 亦 0/0。
- **任务名 vs 树路径**:`task_pou_set` 吃裸名 `"MainTask"`,而 tree 打印的路径含德语目录 `Taskkonfiguration`(卡已补对应关系)。
- **清理**:任务条目 → POU → GVL 三删 `absenceReadback=true`;模板 `PLC_PRG` 保留(被任务引用 + 非本轮生成),避免同名空 STUB 重建。

## cs-st-r044 — vanilla 线 ST R044:流水灯双相位计时机 + 位数组 AT / 数组整赋值 (2026-09-09)

V2 R044(22 调用/**0 失败**/3 重复/141 s;`PRG_RunningLight` + `FB_RunningLight` + `GVL_IO`,0/0)。ST 通道新验证:

- **位数组直接地址**:`axLamp AT %QX0.0 : ARRAY[0..7] OF BOOL;` 编译 0/0(占满 %QB0)——此前路由行只有 `%IW` 的 INT 数组示例,已补位数组形态。
- **数组整体赋值跨块传递**:`GVL_IO.axLamp := fbRun.axLamp;`(FB `VAR_OUTPUT` 数组 → GVL 数组)编译 0/0,**无需 FOR 循环**。
- **双 TON 互斥相位机(流水灯/循环移位范式)**:`tonOn`(亮相位 0.5s)+ `tonGap`(全灭间隔 0.1s),`iStep` 取模回卷,一轮 4.8s;**每扫描无条件刷新全部 8 路输出**,杜绝残留点亮。
- **暂停/保持门控写法**:`xRun := xEnable AND NOT xPause` 门控两个 TON → 保持当前灯态、计时清零、松开后当前相位重新计时(提示词未定义,注释写明约定)。
- **TON 分辨率 = 任务周期**:MainTask `t#50ms` → 500/100ms 均为整数倍,无累积漂移,抖动 ≤50ms(设计推导+编译验证,无运行时证据)。
- **模板默认**:新建 `Standard.project` 的 MainTask = t#50ms / prio 1 / 调 `PLC_PRG`;设备占位 3.1.3.0 必须先 `device.update`(触发"升级存储格式"对话框 + `saveRequired=true`)。
- **`project_tree.count` 是展开节点数,不是根对象数**(清理后 count=7 而根下实为 2 个)——证明清理要看树内容;卡已注明。

## cs-st-r045 — vanilla 线 ST R045:PWM 相位累加(不占 TON)+ TIME 换算可用 + source.import 落点 (2026-09-09)

V2 R045(28 调用/**0 失败**/6 重复/158 s;`GVL_PWM_IO` + `FB_PWM_GEN` + `PRG_PWM_MAIN` + 新建 `PWMTask` t#10ms/prio2,0/0,清理后再编译仍 0/0)。ST 通道新验证:

- **PWM 相位累加器(ST 版,不占用 TON)**:`rPhaseMs` 每扫描推进任务周期 ms,`≥周期` 则翻转,`相位<导通时间` 输出高;跨扫描保持相位,含限幅/越限诊断/未使能相位复位/占空比 0 与 100% 边界。**占空比分辨率 = 任务周期/周期**。
- **TIME 换算在 ST 可用**:`DINT_TO_REAL(TIME_TO_DINT(tTaskPeriod))` 编译 0/0——与 R043 的 TIME 加减/比较一起,构成"ST 侧 TIME 可参与算术"的完整证据;LAD 的限制只属 LAD box 引脚。
- **ST 声明文本可带初值**:`rPhaseMs : REAL := 0.0;` 回读一致 + 0/0;与"生成器 variables[] 不能带初值"需按通道区分(路由行已写)。
- **新建任务可用**:`task.create` 建 `PWMTask`(Cyclic t#10ms/prio2)后 `task.pou.set` 挂载,任务周期直接决定时基分辨率。
- **`source.import` 落点**:默认落设备 Application(结果含解析路径);per-POU `parent` 现已暴露(此前 schema 没有,模型担心"运气好"——已补)。
- **无单调毫秒时基**:vanilla 无 `TIME_TCK()` 等价物且模板未引用 Util 库 → 退化为"任务周期常量"(L54,容忍)。
- **FB 内直接写 `VAR_OUTPUT` 在 CODESYS 0/0**——TIA SCL 样本的"Static 计数 + 末尾统一发布"是 TIA 限制,不得跨线搬运(已在样本加 SCOPE 注)。

## cs-st-r046 — vanilla 线 ST R046:三层电梯状态机 + 跨线对话框守卫缺陷 + cs-st-8 纠错 (2026-09-09)

V2 R046(46 调用/**5 失败**/7 重复/339 s;7 POU + 2 GVL + 1 DUT 枚举,0/0,清理后再编译仍 0/0)。**首轮带失败的 ST 轮**,失败全部是环境/工具缺口,非生成器契约:

- **跨线对话框守卫缺陷(本轮修)**:`blocked_by_external_dialog` 的 `ownerProcessName=InoProShop.exe`——vanilla 轮的写操作被**另一条线**的 IDE 窗口阻塞(分类器把 `inoproshop.exe` 硬编码成"本线 IDE")。已修:按 `PLC_CODE_CODESYS_LINE` 只把**本线** IDE 镜像算作 blocking;另一线窗口降级为证据。恢复文案也改为分线说明。
- **`ide_close` 无强制升级(本轮修)**:残留/挂死的 IDE 忽略 WM_CLOSE → `ide_close_timeout`,模型只能 PowerShell `Stop-Process`。已修:WM_CLOSE 超时后自动 TerminateProcess 并在结果里报告 `method: wm_close|force_terminate`。
- **残留 IDE 让后续写入失败**:`ide_process_exists`(a CODESYS.exe IDE is already running without a ready bridge) + `bridge_start_failed`(launcher 起的进程未就绪即退出)。战役侧同步修:`run_round.mjs` 每轮开头清 `CODESYS.exe`/`InoProShop.exe`。
- **cs-st-8 纠错**:`15-codesys-st.md` 原写"`FOR` 只支持递增,`BY -1` 被拒"——该证据来自**汇川 AM600 厂商工程**,vanilla SP22 实测 `FOR i := n TO 1 BY -1` 编译 **0/0**。已给整条加"分线标注"与跨线警示。
- **ST 组合形状一次通过(0/0)**:GVL 里 `AT` 数组+标量混用、PROGRAM 内 `R_TRIG`/`TON` 实例、PROGRAM 按名互调、`CASE` + 枚举 DUT、中文注释、`RETURN`;6 POU `source_import` 全 `exactMatch`;10 对象 `source_snapshot` 哈希一致;任务挂载 `exactReadback`。
- **工程形状**:`PRG_Input/Alloc/Motion/Door/Output` + `MAIN` 编排,`%Q` 唯一写入者;顺向截车判据 `axServeUp[f] = 内呼[f] 或 外呼上行[f] 或 (外呼下行[f] 且 f 以上无呼叫)`;门开保持 2s + 光幕复位计时 + 开门期间再呼叫重新计时。
- **诚实边界**:任务 IO 未给门锁/关门到位反馈 → 程序缺"门未关禁止运行"许可;上电初始楼层默认 1 层;运行期时序无运行时证据。
- **删除顺序在 ST 通道成立**:10 次 `object_delete`(任务入口→POU→GVL/DUT)全 `absenceReadback=true`,无同名空 STUB 重建。

## cs-sim-r052 — 运行时验证改为**常驻桥内原生**(sidecar 进程已删除):两线 8/8 pass + 判别力复证 (2026-09-10)

E2E V2 R052(vanilla 与汇川 AM600 **各一次**:正确逻辑 8/8 PASS;注入"无锁存/无滞环"后 6 PASS/**2 FAIL**,两次 `DISCRIMINATES=True`)。R048 的"必须开第二个 IDE 进程"结论被推翻:

- **架构(已变)**:厂商原生在线 API **可以**在常驻桥进程里驱动。原判据 `se.online.create_online_application` 报 `堆栈为空。` 未能复现——实测两线在**同一 `--runscript` 帧内**都成功(13/13 探针步骤,含 3 个候选应用对象 + `create_online_device`)。
- **机制**:桥的 `main()` 不再返回——脚本帧里跑一个**只处理 `sim.*` 的循环**(sim-frame loop),其余操作仍走"后台线程 → UI/主线程 marshal"原路径;会话因此始终有一个真正活着的脚本栈。**不要在空闲循环里用 ctypes EnumWindows 反复探测 UI 线程**(R052 实测:三次 `System.AccessViolationException` → IDE 崩溃)。
- **会话语义(替代副本)**:native 会话跑在**桥已打开的那个工程**上——无副本、无 `*.~u` 副本清理、无 mtime 重载。任何工程突变(改 POU/GVL/任务…)会让会话失效,下一次 sim 调用**自动重新 login**(等价于"下载当前代码"),因此"改完代码再断言"永远验的是刚写的代码。
- **工具族不变**:`codesys_sim_status`/`_set`/`_online`/`_read`/`_write`/`_force_clear`/`_assert`;`codesys_sim_sidecar_stop` **已删除**(没有第二个进程可停),收尾用 `codesys_sim_online action=stop`(unforce→stop→logout→仿真关)。
- **进程证据**:汇川线全程 `IDE=1`(之前 sidecar 模式必然 2 个)——这正是"删掉 sidecar"的可观测收益。
- **边界**:仿真只评估程序逻辑——不评估 I/O 接线/总线/硬件;"仿真通过"≠"接线正确"。证据链=编译 0/0 + 结构回读 + 任务调用表 + 场景断言。

## cs-sim-r048 — vanilla 线运行时验证(仿真)落地:细粒度工具,判别力已证 (2026-09-10;架构部分已被 R052 取代)

E2E V2 R048(自测:正确逻辑 8/8 PASS;注入"无锁存/无滞环"后 6 PASS/**2 FAIL**,`DISCRIMINATES=True`)。**本线从此具备运行时证据**:

- **架构(历史)**:当时认为在线会话无法在常驻桥里创建(桥的操作在"后台线程→UI 线程回调"里执行,`se.online.create_online_application` 报 `堆栈为空。(stack empty)`),于是改用**headless sidecar**:一个 `--noUI` 实例跑 `codesys_sim_sidecar.py`,请求在**脚本主循环**里同步处理(真脚本栈)。R052 证明"真脚本栈"才是关键,而它不需要第二个进程——sidecar 已删除。
- **工具族(一次调用一个动作)**:`codesys_sim_status`(阶段门,只读)/`codesys_sim_set`(仿真开关+回读+保存)/`codesys_sim_online`(会话状态与释放)/`codesys_sim_read`/`codesys_sim_write`(批量运行时 I/O)/`codesys_sim_force_clear`/`codesys_sim_assert`(单调用场景断言)。
- **工程副本(历史,已弃)**:sidecar 跑在**副本**上;副本必须删掉 `*.~u` 占用标记,否则打开报 `所选工程当前正由'<user>'上的'<host>'使用`。每次 sim 调用前先 `project.save`,副本按 mtime 自动重建(否则改了 POU 而 sidecar 还在跑旧代码——实测注入的 bug 仍全 PASS)。R052 的原生会话直接跑桥里已打开的工程,副本与 mtime 机制一并删除。
- **force 语义(实测)**:对已 force 的表达式再 write 抛 `StandardError('应用程序中的错误。')` → 写前预检 forced 列表,报 `sim_expression_forced`;`force=true` 才钉住抗任务写。
- **时序语义**:无断点/单步 → 激励 = 写→等 ≥N 个任务周期→读;写入的输入**不是**持久 force,跨扫描要按住;`expectWithinMs`/`expectNotBeforeMs` 证明延时,`holdMs` 证明自锁;扫描计数实测 ~16.7ms/扫描(默认任务)。
- **无人工点击**:存储格式升级对话框是**三按钮**(是/否/取消),route_cli 的"单按钮 + 已知文本"白名单从不点它 → 每次直连调试都要人手点。已修:`_UPGRADE_DIALOG_TEXT_MARKERS` 命中即点"是"(审计为 `storage_format_upgrade_affirmed`),且对话框检查不再要求桥处于 busy。
- **边界**:仿真只评估程序逻辑——不评估 I/O 接线/总线/硬件;"仿真通过"≠"接线正确"。证据链=编译 0/0 + 结构回读 + 任务调用表 + 场景断言。

## cs-sim-r047 — vanilla 线首个仿真 E2E 轮:运行时门禁抓出字节别名缺陷 + ST PID 金写法 (2026-09-10)

V2 R047(34 调用/1 失败/289 s;恒压供水 PID,`PRG_MAIN` + 4 FB + 2 GVL,0/0)。模型**自发**用了 `sim_status/sim_set/sim_assert/sim_read/sim_sidecar_stop`(5/8),9 步场景 9/9 pass——但首轮场景 1 失败并暴露真实缺陷:

- **IO 字节别名(高价值,运行时才能抓到)**:`%IW0` 占 `%IB0+%IB1`,与 `%IX0.0~%IX0.7` **同一内存**。场景写入 `iAiPressureRaw=13824`(0x3600)→ `%IB0=0x36`,bit3 把 `xDiEStop` 清掉 → `xRunPermit=FALSE`,程序拒绝运行。修法:模拟量放字节 0/1、数字量整体移到字节 2 后 9/9 pass。**编译 0/0 完全看不到这个缺陷**——这是运行时验证的第一条硬收益。
- **运行时证据是"会话级"的**:simulator 跑的是会话开始时的工程副本,重新保存工程会重启会话(变量回到初值)。所以一次证明的全部断言必须写在**同一个 scenario** 里;改完代码后的单独 `sim_read` 不是同一次运行的证据。
- **ST 位置式 PID 金写法(0/0 + 9/9 场景验证)**:微分作用于测量值(避免设定值跳变冲击)、输出限幅、**条件积分抗饱和**、手动↔自动**积分反向跟踪无扰切换**;`FB_AI_SCALE` 一阶滤波 + 量程钳位 + 断线/短路检测;`FB_LIMIT_ALARM` 滞回 + 锁存 + 确认复位。可作 ST 版 PID 参考切片。
- **仿真场景覆盖(9 步)**:启动自保持/松钮不脱扣/自动模式进入/PID 升频(`rFreqRef=25.3959>25`)/10 bar 高压报警退出自动/压力回落后报警仍锁存/确认复位/低压报警/传感器断线联锁停机(`xRunPermit/xSystemRun/xDqVfdRun` 全 FALSE)。
- **`gvl_create` 非 upsert** 的代价再确认:IO 地址修正需 `gvl_set_text` 整体重写(2 次调用可合成 1 次 upsert,见 L60)。

## cs-sim-r049 — LAD 首个仿真 E2E 轮:上电预置输入 + 瞬时位不可观测 (2026-09-10)

V2 R049(28 调用/**0 失败**/257 s;LAD 9 网络 + 2 GVL,0/0,`ladderBodyVerified`;仿真 **13/13 pass**)。两个通用坑:

- **仿真启动顺序陷阱(NC 输入)**:`sim_write` 只能在 RUN 之后写 → 硬件常闭接法的 `%IX` 上电瞬间为 0,**失效安全锁存必然置位**(场景 S1 实测 `xFault=TRUE`)。修法(已进工具):`sim_assert` 新增 `preset[]`——先 `stop()` 写初值再 `start()`,场景从真实上电状态开始(等价于操作员"停机改值再启动")。
- **瞬时"原因位"不可观测**:被自身故障清除的原因位只存在**一个扫描周期**(`xFbMismatch` 在 100ms 轮询下永不可见,而同一采样的锁存位 `xFault=TRUE` 已证明 1s 监视动作)。**断言必须打在锁存位/输出上**,不要断言只活一个扫描的中间位。
- **LAD 13 步场景形状(可复用)**:上电确认→启动得电→松钮保持→停止断开且不置故障→重启动→过载跳闸(立即断电)→**419ms 后**锁存(`expectNotBeforeMs=150` 证明去抖)→故障期间启动无效→复位解除→重启动→无反馈 **1836ms 后**锁存→复位清除。
- **`sim_assert` 响应有损摘要(已修)**:~15k 字符的响应被宿主压缩,步骤明细不可见 → 现在默认去 `raw` 镜像,仍超限则省略**通过步**的观测并标注 `observationsOmittedForPassingSteps`(失败步永远保留实测值)。
- **生成器缺口**:fb/timer 的 `input` 只接受 `{name}`,不支持取反 → 给 TON 一个上升输入要多花 1 个网络 + 中间位(L68)。

## cs-sim-r053 — vanilla 仿真 R053:预设不重启程序、变量不复位、删对象被登录会话阻塞、断言保真与节拍 (2026-09-10)

V2 R053(59 调用/2 失败,vanilla SP22 + LAD 7 网络 + ST 辅助块,0/0,仿真 16/16 pass)。四条**运行时语义**与一条**结果保真**结论(本条为 R053 + 2026-09-10 L92 探针复核):

- **`sim.assert` 的 `preset[]` 不重启程序,写进去的不是上电默认值**:L92 探针(vanilla,`PRG_L92Sim` 自由计数 + 锁存,MainTask 调用、整工程 0/0)实测——无 preset 的对照步 `dwCycles` 671→797(+126),紧接着带 `preset` 的一步 797→**911**(+114),锁存位始终 `TRUE`。即"stop→write→start"既没有把程序拉回初值,也没有清掉扫描累积的状态。**preset 写在运行期**;所以预设之后不能假设初态,必须读 `presetApplied` 才知道真实机制。
- **重新登录 / 停止都不复位变量**:同一探针里 `sim.online action=stop` → `sim.set on=true` → 新会话登录(`sessionCreated=true/loginIssued=true/startIssued=true`)后计数器仍是 **671**(不是初值 0)。**场景必须先 `codesys_sim_read` 实测真实运行态、再据此锚定断言**(R090 在汇川线上得到同一结论:两次场景失败全部源于"误以为初值是初态")。
- **`sim.online action=stop` 顺带关闭仿真开关**:返回 `simulationMode.after=false` / `deviceSimulationMode=false`(R053 原文)。下一次 sim 调用前需重新 `codesys_sim_set on=true`。
- **登录会话中 `object.delete` 必被厂商拒绝**:原文 `无法移除对象'PRG_PwmGen [...MainTask]'，因为该对象已经用于当前登录的设备`,R053 里以 `handler_error` 原样返回,模型只能自己从文本推断"先退出登录"。清理顺序仍是 **任务条目 → POU → GVL**,且前面必须先 `codesys_sim_online action=stop`。工具修好后该失败返回 `object_delete_blocked_by_online_session` + `data.requiredAction {tool:codesys_sim_online, action:stop}` + `data.rawVendorMessage`(原文保留)。
- **边沿测量的锚定法(采样节拍)**:R053 实测每次采样约 **350–800 ms**。**刺激写入与该边沿的判定必须在同一步**——否则相位基线落在上一步的采样节拍上,`expectWithinMs` 的完成时刻不能当初值锚点;被测量时间要远大于节拍(该轮 0.1/0.2 Hz 才测准)。步级 `elapsedMs` = "写入 → 条件成立"的实测边界时刻,`sampleCadenceMs` = 该步实测的平均采样间隔。
- **结果保真(修正 cs-sim-r049 的"已修"不够)**:R049 的去 `raw` 镜像 + 省略通过步观测**没有把响应压到阈值内**——L92 实测 20 步 × 4 断言 ⇒ 紧凑 14,611 字符 / 美化 **25,557 字符**,仍会触发引擎侧 `MAX_TOOL_RESULT_MODEL_CHARS = 12,000` 的**有损摘要**(`runtime/src/conversation/turn.rs`:超过阈值时整份结果被换成只留样本的 `lossySummary`,最后几步只剩 `passed/failed` 汇总——正是 R053 看到的现象)。现在的压缩策略:每一步都保留 `index/name/status/elapsedMs`(+`firstHoldMs`/`failures[]`),**通过步**的逐样本观测换成一行 `observationsSummary`(expr=actual),**失败步的实测值永不丢弃**,并新增 `data.compaction` 说明压缩是否发生。
