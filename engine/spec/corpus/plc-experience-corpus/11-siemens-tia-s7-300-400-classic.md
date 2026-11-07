# Siemens TIA classic S7-300/400 (non-optimized rack CPUs)

> Applies to: vendor=siemens family=tia_openness model=s7_300_400_classic; classic S7-300/400 rack-based CPUs driven via TIA Portal Openness (V16-V21 client, any version — not tied to one TIA release) — SCL timer-instance typing, hardware-config module plug identifiers, FB/instance-DB deletion, and project-file corruption recovery
> 4 entries from real-machine forensic verification (TIA V17 + S7-400 + PLCSIM, 2026-07-31 session), not part of the 30-round distillation frequency ranking; ordered by evidence reference a-d as reported.


## rm-a [timers] On classic S7-400, an SCL-declared TON instance is a `Block_SFB` value, not a Bool — never use it directly in a boolean/AND expression; and a 0-error LAD TON_TIME network is not proof the timer fires on the real scan cycle

On a classic S7-400 CPU, declaring an SCL TON instance and then referencing that instance directly in a boolean expression (e.g. combined with `AND`, or passed where a Bool is expected) fails to compile. The compiler treats the instance as its own type (`Block_SFB`), not as the timer's `Q` output, and three different call/declaration syntaxes for the same intent all hit the identical two-part error. Separately, an equivalent TON_TIME network built as LAD/SimaticML XML imports and compiles with 0 errors — but that only proves syntactic validity, not runtime timing: on the real classic PLCSIM target the OB1 scan cycle is fast enough that a T#200ms timer had still not triggered after 2330 scan cycles. The workaround that worked first try in that session: drop the timer instruction entirely and implement the delay as a DINT scan-cycle counter incremented by 1 every OB1 pass, compared against a threshold computed as (desired delay time / an estimated per-cycle time); this is plain SCL (about 40 lines) with no SFB/timer instance involved. Note what that session did NOT establish: it is not evidence that a classic CPU refuses IEC timers — the same CPU compiled the LAD `TON_TIME` network with 0 errors, and the type error is the documented member-access shape (`tia_openness_write_source`'s real-import-verified grammar for V16-V21: declare `TON_TIME`/`TP_TIME`/`TOF_TIME`/`TONR_TIME`, call `#Inst.TON(IN := …, PT := …)` with `PT` mandatory, then read `#Inst.Q`/`#Inst.ET`; an OB interface is `VAR_TEMP`/`VAR CONSTANT` only, so the instance has to live in an FB or a global instance DB). Also note the counter's own cost: a scan-cycle delay drifts with scan load, so its threshold has to be recomputed against a measured cycle time and verified on the target — the same discipline the 2330-cycle observation demands of the timer.

**Pitfall**: assuming an SCL TON instance behaves like its `Q` output when used in `AND`/boolean context produces `Operator 'AND' is not compatible with the data types of 'Block_SFB' and 'Bool'` and `Data type 'Block_SFB' cannot be converted implicitly into data type 'Bool'` regardless of which of the 3 attempted call syntaxes is used; separately, treating "LAD XML imported and compiled with 0 errors" as proof the timer works on the real classic PLCSIM target is wrong — the scan cycle can be fast enough that the configured time never elapses in practice, and this must be checked against the real/simulated target, not the compile result alone.

*Source*: real-machine TIA V17 + S7-400 + PLCSIM forensic verification session, 2026-07-31 (per the task's provenance note; not vendor-manual sourced — treat the exact error strings and the 2330-cycle observation as the primary evidence, and re-verify before generalizing to other classic CPU models/firmware).


## rm-b [architecture] On an S7-400 classic rack, a signal-module (SM) `typeIdentifier` plugs by bare order number and the firmware `/Vx.y` suffix is what gets it rejected (the opposite of the S7-1500 rack, where modules carry their own suffix) — and an S7-300 module cannot be plugged into an S7-400 rack

When plugging a signal module (e.g. SM421/SM422) into a classic S7-400 rack slot via the hardware-config/plug-module tool, giving the module's `typeIdentifier` a version suffix (`/V1.0`) fails every time (`TIA_CAN_PLUG_NEW_FALSE`, reproduced 3 consecutive attempts with the suffixed identifier). Dropping the suffix and plugging by bare order number only (e.g. `OrderNumber:6ES7 421-1BL01-0AA0`) succeeded on the first attempt. A separate V16 catalog/import probe identified the SM422 DO32 module as bare `OrderNumber:6ES7 422-1BL00-0AA0`; the guessed `1BL01` and `1BH01` variants were rejected by that installed catalog. Do not turn that into "modules never carry a version suffix": the opposite was observed on an S7-1500 rack (TIA V20 + CPU 1513-1 PN, 2026-07-30), where signal modules plug with their OWN `/V1.0`/`/V1.1`档 and only copying the CPU's `/V2.x` was rejected. Both observations are real and each is scoped to its rack family — on a classic S7-400 rack try the bare order number first; on an S7-1500 rack take the module `typeIdentifier` verbatim from the live V18+ catalog. V16/V17 Openness has no live HardwareCatalog API, and PLC Code's bundled fallback covers CPUs only, not signal modules. Separately, an S7-300-family module (e.g. a `6ES7 323` module) cannot be plugged into an S7-400 rack at all — the two module families are not interchangeable even though the order-number scheme looks superficially similar.

**Pitfall**: on a classic S7-400 rack, copying the CPU's `typeIdentifier` pattern (which does need `/Vx.y`) onto a signal/IO module's plug call gets `TIA_CAN_PLUG_NEW_FALSE` with no further detail, and retrying the identical suffixed call does not help — there the fix is to drop the suffix, not to retry. The mirror-image pitfall exists on S7-1500 racks (dropping a suffix the module does need), so treat "with suffix" / "without suffix" as one try each for the rack family in front of you rather than as a rule to carry across families; separately, attempting to reuse an S7-300 module's order number in an S7-400 rack slot is rejected outright and is not a workaround worth pursuing.

*Source*: real-machine TIA V17 + S7-400 + PLCSIM forensic verification session, 2026-07-31 (per the task's provenance note); scoped to the plug_rack_module tool path against a classic S7-400 rack — re-verify before generalizing the no-suffix rule to S7-300 racks or to CPU modules.


## rm-c [pitfall] Deleting an FB does not remove its instance DB: TIA silently restores the instance DB on the next compile — delete the FB and its instance DB together in one action, and trust only the final compile result

After deleting a classic S7-300/400 FB, the very next compile pass in TIA Portal can silently restore its instance DB rather than leaving it deleted, reporting `1 deleted data blocks have been restored`. Repeating the delete across 3 rounds did not make it stick, and the underlying interface conflict the deletion was meant to resolve persisted the whole time, because the restored instance DB kept re-introducing the old interface. The working fix: delete the FB and its instance DB together as one action (do not delete the FB and leave the instance DB for a later/separate step), then treat only the FINAL compile result as the judgment of success — an intermediate "restored" message during a multi-step edit is not evidence the edit failed, and repeated deletion of the FB alone without also removing the instance DB is not a fix.
Cross-reference: this is a hardware/classic-CPU-flavored instance of the same "trust the final compile, not an intermediate diagnostic" discipline as `01-siemens-tia-lad-simaticml.md`'s CompileUnit/ID pitfalls and `02-siemens-tia-scl.md`'s block-management guidance — this entry is the block-deletion-specific case of it.

**Pitfall**: deleting only the FB and expecting the instance DB to go with it — TIA's next compile can restore the instance DB and report it as such, and repeating "delete FB, compile, see it get restored, delete FB again" for multiple rounds does not converge; the fix is deleting FB + instance DB together in the same action, then reading only the final compile's error/success list as ground truth.

*Source*: real-machine TIA V17 + S7-400 + PLCSIM forensic verification session, 2026-07-31 (per the task's provenance note).


## rm-d [pitfall] A TIA Portal GUI crash can corrupt an existing `.ap17` project file so online-target discovery and compilation both fail; when several targeted repairs do not restore it, rebuild a fresh project rather than continuing to patch the damaged one

After a TIA Portal GUI crash, the pre-existing `.ap17` project file was left in a state where `list_online_targets` returned an empty result and `compile` failed with `TIA_TARGET_PLC_NOT_FOUND`, even though the project had compiled and had a working online target before the crash. Five different targeted repair attempts (within the same damaged project) all failed to restore it. Creating a brand-new TIA project (rather than continuing to repair the old `.ap17`) succeeded on the first attempt. Engineering takeaway: after any TIA Portal crash, do not assume the project file itself is intact just because it still opens — a project that can no longer resolve its own online target and cannot compile after several genuinely different repair attempts is more efficiently rebuilt fresh than patched further, since a corrupted project can silently keep failing new repairs for reasons the visible error (`TIA_TARGET_PLC_NOT_FOUND`) does not point to.

**Pitfall**: continuing to try more repair techniques against a `.ap17` project that already failed 5 different fixes after a GUI crash — sunk-cost repeated patching of `list_online_targets`/`compile` symptoms without stepping back to consider the project file itself is unsound; the actual fix that worked was abandoning the old project and creating a new one, not a 6th repair variant on the old file.

*Source*: real-machine TIA V17 + S7-400 + PLCSIM forensic verification session, 2026-07-31 (per the task's provenance note); the specific corruption trigger (GUI crash) and the "5 repair attempts" count are this session's observation, not a general TIA reliability claim.


## rm-e [simulation] classic S7ProSim 仿真的三条硬规则与"验证三问"：扫描计数代替 TON、诊断映射 Q 区、先确认执行再查逻辑

从完整走通的 S7-400 LAD 项目（锂电池叠片机，73 网络状态机）与三后端实测沉淀。classic S7-300/400 仿真恒走 S7-PLCSIM V5.4（S7ProSim COM），任何博图版本 V16-V21 相同，且没有 WCF/vplc/Advanced 替代路线（那些仿真器不能仿真 300/400）。该后端的硬限制：SingleScan 下 IEC 定时器不推进、执行节流（请求扫描数不等于实际完成数）、两次工具调用之间 CPU 执行 0 周期（sidecar 断开回退 SingleScan）。三条硬规则：(1) 定时等待用扫描计数代替 TON——static Int 每扫描 +1，非激活时清零，Ge(计数, 阈值) 判完成；阈值=等效扫描数（仿真用小值如 1/1/30，真实机器按扫描周期换算如 10ms/scan 时 0.5s≈50 scans）。(2) 内部诊断（步骤解码/忙/完成位）一律映射到未用的 Q 区输出位——Q 区是所有后端通用的唯一可靠读回通道（classic 的 M 区读回不可靠；V16-WCF/V18-官方后端连 I/M/DB 都读不了）。刺激写入必须显式传 scan_cycles，实际执行数用 Q 区计数读回推断，绝不信请求数。验证三问——程序"没动"时按顺序：(1) 执行确认：无条件递增计数读两次是否增长？不增长=CPU 没跑（下载失败/STOP/会话断），不是逻辑问题；(2) 状态确认：当前步骤解码字是什么？先知道状态再怀疑逻辑；(3) 逻辑确认：①②正常才查网络。已知坑：步骤转换在扫描末尾执行→输出滞后一拍（多扫一次再读）；每次下载清空 DB/M（别把初始状态当运行结果）；硬件 NC 停止/急停（1=正常）在 LAD 必须用 NO 触点；TONR 经典目标不可用（用 TON + 步骤差分复位门控）。

**Pitfall**: 请求 scan_cycles=200 就认为程序跑了 200 周期——实际可能只有 3 个（节流），以此推断"程序逻辑坏了"会浪费整个调试会话；诊断读回 0x00 就判"解码不工作"——可能是下载清空 + 读太快 + 当前状态本来就该是 0，正确顺序是先确认执行（计数增长）再确认状态（Step 解码）最后才怀疑逻辑。

*Source*: LiB_StackingMachine S7-400 LAD 项目全流程仿真走通（2026-07/08）+ 三后端探针实测（V16-WCF / V18-官方 / PLCSIM Advanced，2026-08-02）；方法论另见桌面《classic-S7-400-仿真走通模板.md》。


## rm-f [architecture] classic S7-300/400 多实例：全局 DB 的 STRUCT 里不能嵌 FB 类型，必须为每个 FB 建独立单实例 DB（`DATA_BLOCK "DB_x" FB_x`）；这是 classic 与 1200/1500 的差异，不要照搬优化 CPU 的写法

在三工位装配单元（AssemblyCell3，V16 + S7-400 + LAD）中，先在全局 DB 里写 `STRUCT S1:FB_Station; S2:FB_Station; Cell:FB_Cell; END_STRUCT`，TIA 生成报 `在此，不允许使用数据类型 "FB_Station"` ×4——classic S7-300/400 的全局 DB 不允许把 FB 作为 STRUCT 成员类型（多实例只能在 FB 的 Static 区，或独立单实例 DB）。S7-1200/1500（优化访问）允许全局 DB 嵌 FB，所以这是 classic 专属限制。正确写法：每个实例一个独立 DB，`DATA_BLOCK "DB_S1" FB_Station`（注意：FB 类型名不带引号，`FB "FB_Station"` 会报"字节地址或编号缺失/语法错误"；STRUCT 形式也不行，单实例 DB 的源语法就是 `DATA_BLOCK "名字" FB类型名` + `BEGIN END_DATA_BLOCK`），OB1 里直接 `"DB_S1"(...)` 调用。配套：FB 接口变化后实例 DB 会自动重建（TIA 行为），无需手工；但 FB 删除时实例 DB 不会被删（见 rm-c，需一并删除）。

**Pitfall**: 从 S7-1200/1500 项目复制"全局 DB 里嵌 FB 多实例"的写法到 S7-400 会得到 `在此，不允许使用数据类型 "FB_x"`；把单实例 DB 写成 `FB "FB_x"`（带引号）会得到 `字节地址或编号缺失`。classic 的正确形态是 `DATA_BLOCK "DB_x" FB_x`（FB 名不带引号）。

*Source*: AssemblyCell3 三工位装配单元（2026-08-02，V16 + S7-400，编译实证）；范围限定 classic S7-300/400。


## rm-g [pitfall] 状态转换的"完成动作"必须边缘触发，不能电平触发——否则每扫描重复执行（PackLine 实测 PackCount 累加到 5390）

在电池 PACK 装配线（PackLine_V18，V18 + S7-1500 + PLCSIM Advanced 符号读回验证）中，Step3 输送完成的动作写成 `IF ConvOut THEN Step:=0; PackCount:=PackCount+1; END_IF`——ConvOut 是电平信号，保持为 1 期间**每个扫描都执行 +1**，PackCount 从 1 疯狂累加到 5390。编译 0 错误，只有仿真读回才能发现。修复：用 R_TRIG 边缘（`ConvEdge(CLK := ConvOut AND Step=3); IF ConvEdge.Q THEN ... +1 END_IF`）——动作只在上升沿那一拍执行一次。这是状态机通用规则：**任何"完成/计数/置位"动作绑在电平条件上就是 bug**，必须绑边缘（R_TRIG/F_TRIG 或"当前状态 AND NOT 上一状态"）。此规则对所有 CPU/版本通用（不是 classic 专属）。附带验证：PLCSIM Advanced 的符号读回（DB 成员直读）是发现这类行为 bug 的唯一可靠手段——标准后端的 Q 区字节读回看不出"计数多快"。

**Pitfall**: 状态机的步进动作写成 `IF 传感器 THEN 计数:=计数+1` 电平触发，传感器保持期间计数每秒数千次增长；正确写法是边缘触发（R_TRIG 实例或显式上一状态锁存）。

*Source*: PackLine_V18 电池 PACK 装配线（2026-08-02，V18 + S7-1500 + PLCSIM Advanced，符号读回实测 PackCount=5390 后修复为 1）。


## rm-h [workflow] 高效写入顺序（EffFlow 实测，2026-08-02）：硬件一次到位 → 标签一次建全 → 块按依赖序生成 → 一次 batch 导入 + 一次编译

从 EffFlow（V18 + S7-1500 + SCL，双 FB + 双实例 DB + OB1）实测总结的最优写入顺序，**零往返**（无任何"块不存在"错误，一次 whole-PLC 编译 0 错误）：
(1) 硬件一次到位：create project → add CPU → 用 tia_openness_batch 一次插完所有模块（不要插一个编译一个）→ read_hardware_config 确认。
(2) 标签一次建全：create tag table + create_tags 批量建全部 IO 标签（1 次调用），不要逐个建。
(3) 块按依赖序生成：先写被调用的业务块（FB/FC 的源或 XML）——相互独立的块可连续写；再创建实例 DB（S7-1500 用 create_instance_db 工具，FB 需已生成，工具自动编译 FB）；最后写调用者（OB1）。
(4) 一次 whole-PLC compile 验证整个依赖集（不逐块编译）。0 错误后再 save → 仿真 → 下载(allow_plcsim_memory_reset=true) → RUN → 行为验证。
铁律：**绝不在被引用的块/DB 存在之前写调用者**（AssemblyCell3 曾先写 DB_Stations 引用不存在 FB → "数据类型 FB_Station 未知"；先写 Main 引用不存在 DB → "函数块调用无效"——都是依赖序错误，浪费两轮）。SCL FB 的输出参数应在开头初始化（EffFlow 编译警告 "#Run might not be initialized"——初始化后消除）。

**Pitfall**: 先写 OB1 再写它调用的 FB/实例 DB，得到 "数据类型 FB_x 未知"/"函数块调用无效"，然后被迫回头补顺序；正确顺序永远是 被调用块 → 实例DB → 调用者，一次编译验证。

*Source*: EffFlow 双 FB 输送/分拣程序（2026-08-02，V18 + S7-1500，一次编译 0 错误 + Advanced 符号验证全链路）。


## rm-i [matrix] 输入刺激能力 × CPU × 博图版本 完整矩阵（实测 + 推理标注，2026-08-02）

V18 S7-1500 的输入刺激缺陷是 vplc 后端专属问题（InputArea 空洞），不是刺激通道通用缺陷。实测矩阵：
| CPU | V16 | V17 | V18 | V19 | V20/V21 |
| S7-300 | classic ✅* | classic ✅* | classic ✅* | classic ✅* | classic ✅* |
| S7-400 | classic ✅(叠片机实测) | classic ✅ | classic ✅ | classic ✅ | classic ✅ |
| S7-1200传统 | WCF ✅* | WCF ✅* | vplc ✅(Probe实测) | vplc ✅* | official ✅* |
| S7-1200 G2 | — | — | — | — | Advanced ✅ |
| S7-1500 | WCF ✅* | WCF ✅* | vplc ❌→已修诊断 | vplc ❌*→同修复 | official ✅(Probe_V20实测) |
（* = 推理项：与同代后端同路径，未实测。S7-300 与 S7-400 同走 classic S7ProSim(COM) 后端，仅 400 实测（叠片机）；V16/V17 的 legacy-WCF 后端同样未实测——V17 仿真 1200/1500 受断网约束禁止实测，此格保持推理状态；V19 1500 与 V18 共用 32-bit vplc 后端，若真有缺陷被通用诊断自动覆盖）
后端路由：300/400 任何版本恒走 classic S7ProSim(COM)，I/Q 区直接写无 vplc 参与；V16/V17 1200/1500 走 legacy-WCF；V18/V19 1200/1500 走 32-bit official-frontend vplc（V18 1500 InputArea 空洞 → 写刺激被拒时返回 SIDECAR_VPLC_WRITE_REJECTED + AddressOutOfRange 完整诊断，修复在 FrontendVplcBackend.cs L128-136，通用不分区）；V20/V21 走 64-bit official runtime API 输入可写；PLCSIM Advanced 8.0 只支持 S7-1500 + S7-1200 G2 符号读写（300/400/传统1200不可用）。
遇到刺激问题的防御路由：写异常 → 先读诊断（新错误码/AddressOutOfRange 直接给替代后端）→ 无诊断静默 → 执行确认三问（Q 区计数是否增长）区分"没跑" vs "写了没生效" → 查本矩阵换后端。Advanced 只是 V18 1500 的实测最快绕行，不是通用方案。

*Source*: 实测 — 叠片机 S7-400@V16 classic I 刺激全链路；Probe_V18_1200（1200 无缺陷）；Probe_V20（1500@V20 输入可写）；EffFlow（V18 1500 → Advanced 符号读写全 true）；FrontendVplcBackend.cs L128-136 修复。推理项仅 V19 1500 / 1200@V20。
