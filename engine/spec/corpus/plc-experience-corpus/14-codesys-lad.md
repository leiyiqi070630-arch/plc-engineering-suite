# CODESYS 系（vanilla CODESYS / 汇川 InoProShop）LAD — 真实工程语料

> 语料来源（本机真实工程，2026-09-09 逐工程读取：桥 `project.open` → `source.snapshot` / `project.export_native`，读完即 `project.close`，未改动工程）：
> - 汇川 AM600 厂商例程 `D:\hui chuan\CODESYS\Projects\Demo for AM600\`：`001_Marquee(LD)`、`005_MarqueeAndServoMotion`、`006_CamInstuctions`
> - CODESYS SoftMotion 官方教程 `D:\hui chuan\CODESYS\Projects\SoftMotion\4.2.2.0\Examples\Tutorial\`：`PLCopenMulti`、`PLCopenMultiCAM`、`PLCopenSingle(2)`、`PosControl`、`CNC_File`
> - 两个 CODESYS 内核线共用 IEC 61131-3 LAD；带「汇川线」标注的条目是厂商特有事实。
>
> 读 LAD 的方法：厂商工程的原生导出 XML 里有完整 `NetworkList`，本仓脚本 `work/corpus-extract/read_native_lad.py` 可离线渲染成「网络 N: 触点/盒(引脚) → 线圈」；元素 GUID 表在 `desktop-electron/resources/inoproshop/codesys-bridge/contact_lad_compiler.py` 的 `TO_GUID`。

## cs-lad-1 — 1 秒时钟 + ROL 跑马灯：盒输出驱动另一个盒的 EN（001_Marquee(LD) 真实工程）

- **工程**：`Demo for AM600\001_Marquee(LD).project` → `PLC_PRG`（1 个网络）。变量：`TON_0: TON`、`b循环右移寄存器: BYTE`（声明注释写明「该变量与 HSIO 输出口关联」）。
- **网络结构（原生 XML 还原）**：`ROL` 盒的 EN 不是接母线，而是接一个 `TON` 盒：`TON_0(IN:=NOT TON_0.Q, PT:=T#1S)` → 每秒一个脉冲 → `ROL(b循环右移寄存器, 1)` → 输出写回 `b循环右移寄存器`。
- **要点**：(1) 自复位定时器 `IN:=NOT 自身Q` 是 CODESYS 里做周期脉冲的标准写法，不需要额外时钟存储器；(2) 盒的 EN 可以接另一个盒的输出（嵌套 `InputItems`），不是只能接触点；(3) 移位用 `ROL`（循环左移）而不是乘 2——BYTE 溢出自动回环；(4) 输出端在 `OutputItems` 里以 LValue 操作数写回同名变量，等于「线圈 + 赋值」合一。
- **验证等级**：真实厂商工程源码 + 原生导出结构；`PLC_PRG` 本体为 LAD（`declarationChars` 有值、`implementation` 为空是正常的——图形体不在文本快照里）。

## cs-lad-2 — 双轴使能 + 凸轮指令链的网络顺序（006_CamInstuctions 真实工程）

- **工程**：`Demo for AM600\006_CamInstuctions.project` → `POU_CAM`（14 个网络，LAD）。
- **网络顺序（原生 XML 还原）**：N1 注释（"本例程用于凸轮指令功能的实验…Master 作相对定位运行、Slave 作为凸轮从轴"）；N2/N3 两个 `MC_Power`（`Axis:=Master` / `Axis:=Slave`，`Enable:=1 bRegulatorOn:=1 bDriveStart:=1`）；N4 注释（"凸轮指令执行顺序：1:MC_CamTableSelect; 2:MC_CamIn; 3:MC_CamOut"）；N5 `MC_CamTableSelect`（`CamTable:=Cam_ZJ Periodic:=? MasterAbsolute:=false SlaveAbsolute:=false`）；N6 `MC_CamIn`（`CamTableID:=CamID` 等 11 个引脚）；N7 `MC_CamOut`；N8 `MC_MoveRelative`（Master，`Distance:=M_Pos Velocity:=M_Vel Acceleration:=M_Vel*10`）；N9/N10 `MC_Stop`（Slave/Master，`Deceleration:=10000`）；N11 `MC_Halt`（Slave）。
- **要点**：凸轮必须按 `MC_CamTableSelect → MC_CamIn → MC_CamOut` 顺序、且主从轴先各自 `MC_Power`；`MC_Stop`（锁定）与 `MC_Halt`（可再启动）分工明确；`Acceleration:=M_Vel*10` 这种「速度×10」写法在真实工程里常见，用于让加减速不成为瓶颈。
- **汇川线注意**：`CamTable:=Cam_ZJ` 是厂商工程里预置的凸轮表对象，新建工程没有；跨线复用要换成自己的凸轮表。

## cs-lad-3 — MC_CamIn / SMC_GetTappetValue 的引脚互链（PLCopenMulti 真实工程）

- **工程**：`SoftMotion\...\PLCopenMulti.project` → `MOTION_PRG`（LAD）。
- **网络（原生 XML 还原）**：N1/N2 `MC_Power`（`Drive` / `Virtual`）；N3 `MC_MoveVelocity`（`Execute:=power2.Status`）；N4 `MC_CamTableSelect`（`Execute:=TRUE Periodic:=TRUE MasterAbsolute:=TRUE SlaveAbsolute:=TRUE`）；N5 `MC_CamIn`（`Execute:=power1.Status MasterOffset:=0 SlaveOffset:=0 MasterScaling:=1 SlaveScaling:=1 StartMode:=absolute CamTableID:=TableSelect.CamTableID`）；N6 `SMC_GetTappetValue`（`Tappets:=CamIn.Tappets iID:=1`）。
- **要点**：LAD 里可以直接把另一个功能块的输出引脚（`power1.Status`、`TableSelect.CamTableID`、`CamIn.Tappets`）连到本盒的输入引脚——不是只能连变量；`Execute` 接 `Status` 表示「使能完成后自动开始」；`StartMode:=absolute` 与 `MC_CamTableSelect` 的 `MasterAbsolute/SlaveAbsolute` 必须一致。
- **验证等级**：CODESYS 官方教程工程源码 + 原生导出结构。

## cs-lad-4 — 真实工程 LAD 的通用形状规则（编译/回读验证，两条线共用）

- **一个连通网络**：串联触点 + 一级并联分支属于同一个网络；分支合并 = 汇合元素 `connectionPointIn` 列出所有支路末端。拆成两个网络 = 断流。
- **盒只能一个数据输出**：函数/功能块盒在编辑器里暴露一个数据输出；定时器/计数器 v1 只接 Q（ET/CV 不接），多输出函数（如 LEN_INTERNAL）不要进 LAD。
- **盒数据引脚不接受字面量常量**：常量必须走 GVL 变量（fb 数据引脚接受字面量——契约差异详见生成器卡 FB NETWORKS 段、cs-lad-17/cs-lad-18 实测）。
- **盒走串联 EN 接线**：触点→EN，不要再套赋值包装（历史踩坑：赋值包装 + OutputItems 前导 `<Null/>` 会把绑定的 Q 挤到 ET 引脚 → C32；Null EN/ENO → "错误分配源"）。
- **TC6 元素大小写**：PLCopen 导入路线里 `string`/`wstring` 必须小写；大写被转换器按 XSD 拒。
- **变量名不要用指令名**：含双下划线的指令名当变量名会让解析崩。
- **验收**：LAD 的验收 = 原生导出回读（`NetworkList>0`、触点/线圈计数）+ 整工程编译 0/0/0。**只编译不报错不算数**（空壳 POU 也是 0/0/0，本线已实测）。
- **原始记录**：`13-codesys-vanilla.md` 的 cs-lad-v2/cs-lad-verdict、`12-inoproshop-lad.md` 的 rm-g（定时器网络最终形状）。

## cs-lad-5 — 离线读厂商 LAD 的正确姿势（工具链事实）

- 厂商工程 `.project` 是加密/私有二进制，不能直接 grep；但桥 `project.export_native` 导出的 XML 是完整的 `StructuredView`/`NetworkList`/`NetworkItems` 树，可以离线解析。
- 元素 GUID（`contact_lad_compiler.py` 的 `TO_GUID`）：network `d9a99d73…`、box `acfc6f68…`、input_item `9de7f100…`、operand `c9b2f165…`、assignment `9873c309…`、outputs `f40d3e09…`、impl `25e509de…`；`CallType` 给出调用种类（`FunctionBlock`/`Rol`/…），`BoxType` 给出块名（`TON`/…）。
- 盒的引脚顺序在 `InputParam.Names`（如 TON 是 `IN,PT`；输出 `Q,ET`），值在 `InputItems` 里按序排列——渲染成 `TON IN:=… PT:=T#1S` 即可读。
- **陷阱**：厂商例程（AM600 系列）打开时会弹「未能加载 AM600ConfigurationInterface…」原生对话框，无人点击就永远卡在 load；桥的 `dialogs.detect` + `dialogs.dismiss` 能识别并点掉（脚本见 `work/corpus-extract/extract_project.py`）。

## cs-lad-6 — V2 R023 交通灯:无 S/R 的相位交接 + GVL 常 ON 轨 + 注释载体 (2026-09-09)

V2 R023(17 调用/2 失败/205 s;19 网络/56 触点/19 线圈/6 TON,0/0/0 + `ladderBodyVerified=true`)。编译验证的 vanilla LAD 状态机写法:

- **相位交接(无 SET/RESET 时)**:单一"当前相位位"自保持,交接靠"上一级 TON.Q + 网络执行顺序"(状态网络排在定时器网络之前),否则清当前相位后下一相位读不到置位条件会漏步。输出级再做一层互锁兜底:`yNS_G = bNS_G AND NOT bNS_Y AND NOT bEW_G AND NOT bEW_Y`(6 路同构),即使状态位一扫描重叠也不会双绿。
- **黄闪 1 Hz**:两个 TON(各 500ms)互锁搭无稳态振荡器——本线 timer 只出 Q、ET 不可接,不能做"一个 TON + ET 比较"。
- **常 ON 轨**:本线 `variables[]` 无初值、无 R_TRIG → 用 GVL 全局 `xRun : BOOL := TRUE;`(GVL 声明是自由文本,初值编译接受)。`xRun` 断开即全部状态位复位、输出全灭(安全侧熄灭)。
- **中文注释载体**:LAD networks/variables 无 comment 字段 → 中文注释集中写在 GVL 声明文本(编译 0/0 已验证);POU 局部变量天然无注释。
- **缺陷(已复现并修复)**:`codesys_task_pou_set` 的 `entries[].comment` 写入不持久(读回恒 '')却参与校验 → 必 `task_pou_set_failed`,且回滚失败会留下重复调用项(restored=false,after=["PLC_PRG","PLC_PRG"])。桥现已改为:非空 comment 在变异前拒绝(`task_pou_comment_not_persisted`);调用方传 pous 不带 entries 即可。
- **路径教训**:create 的 path 里字面 `%USERNAME%` 不会被展开 → `unsafe_project_path`;用错误载荷里的 `data.disposableRoot` 自愈。

## cs-lad-7 — V2 R024 流水灯:环形移位必须"先算 next 再拷贝"+ 常 ON 母排位 (2026-09-09)

V2 R024(32 调用/3 失败/466 s;33 网络/86 触点/33 线圈/2 TON,0/0/0 + `ladderBodyVerified=true`)。

- **同扫描线圈时序(本线移位头号陷阱)**:线圈按网络顺序求值,且读到的值是"本扫描已写入"的值。8 位环形移位**升序拷贝**(x2:=x1, x3:=x2 … x1:=x8)会在环绕位双置位;**降序拷贝**会全零死状态。正确写法:先算 `xNext1..xNext8`(纯组合),再在**后面的网络**里 `xLamp_i := xNext_i` 一次拷贝(本轮 16 网络完成移位,0/0)。
- **常 ON 母排位**:纯 OR 支路网络没有串联触点 → 用 GVL 全局 `xAlwaysOn : BOOL := TRUE;` 供电(编译 0/0 验证)。GVL 是初值的唯一载体(见 cs-lad-6)。
- **pt.constant_value 直传**:`T#500MS`/`T#100MS` 字面量被原样接受并回读。
- **编译顺序**:build 必须在 `device.update` 之后——占位设备 3.1.3.0 未更新时基线编译报 16 错(首条 `系统没有安装设备。不能生成代码`);更新到 3.5.22.30 后 0/0。
- **PLCWinNT 的 %IX/%QX 是逻辑地址**:软 PLC 无物理 IO 模块,编译 0/0 且无"未映射 IO"告警——报告里如实说明,不声称物理接线。
- **本线无运行验证工具**:时序/暂停行为只有编译+结构回读+推演证据,报告必须如实写"未运行时验证"。

## cs-lad-8 — V2 R025 PWM:本线 TIME 算术不可表达,固定时基+双 CTU 是唯一验证路线 (2026-09-09)

V2 R025(28 调用/2 失败/724 s;18 网络,0/0/0 + `ladderBodyVerified=true`)。本线最难任务,暴露硬性表达力边界:

- **TIME 不参与算术**:box 的 DIV/MUL/ADD 按 DINT/REAL 求值;`DIV(t1s, iFreqL)`(TIME/INT)报 4 条编译错(`不能将类型 'TIME' 转换为类型'DINT'` 反向同理);`DINT_TO_TIME` 既不在库目录也不在内建算子表(生成器拒绝 `instruction_signature_unresolved`,且当时无候选提示——已修:非可生成转换现在明说"无匹配,重构设计")。**可变 PT 定时器在本线不可表达**。
- **验证通过的 PWM 路线**:`LIMIT`(频率 1..20Hz 防除零、占空比 0..100)→ REAL 计算链(`INT_TO_REAL→MUL→DIV→ADD(0.5)→REAL_TO_INT→INT_TO_WORD` 得 wPerCnt/wOnCnt)→ `TP_Base`(PT=T#10MS 字面量,IN=NOT xBasePulse 自复位)→ `CTU_Per`/`CTU_On`(PV=WORD)自清零 → `xPwmOut = NOT xOnDone`。**有效时基 = PT + 任务周期**(TP 重启需 1 周期),用 GVL 常量 `rBaseEff` 补偿;MainTask 由 t#50ms 改 t#10ms 与 tBase 匹配。1Hz/50% → 50×20ms/25×20ms。
- **et/cv 字段存在但未接线**(schema 有、实现忽略):"ET 阈值比较""CV 自校准"类设计不可做。
- **codesys_lad_instruction_signatures 曾在 vanilla 线被隐藏**(被归为 InoProShop 注册表工具),而生成器卡却指引去读它——门禁已修,vanilla 线可见。
- **gvl 无 set_text/upsert**:改声明只能 delete+recreate(本轮 3 次 gvl.create);pou.set_text 只对 POU 验证过。
- 精度声明要写进报告:10ms 任务下 ±1 任务周期抖动 ≈ ±5% 频率误差(1Hz);占空比分辨率 = 1 时基周期。

## cs-lad-9 — V2 fb 直通验证:SR/RS/R_TRIG/F_TRIG 可用,BLINK/TONR 无签名 (2026-09-09)

真机探针(不计战役轮次):`codesys_lad_generate_project_pou` 的 fb 网络形状对 6 个候选 FB 逐项验证(导入+原生回读+任务调用+全工程 0/0)。

- **已验证可写卡**:`SR`(SET1 母线/RESET 数据→Q1)、`RS`(SET 母线/RESET1 数据→Q1)、`R_TRIG`(CLK→Q)、`F_TRIG`(CLK→Q)——引脚名全部来自 `codesys_lad_instruction_signatures` 实时签名,并由原生导出 XML 逐引脚复核。加上既有 TON/TOF/TP/CTU/CTD/CTUD,vanilla 线可用 FB = 10 个。
- **不可用**:`BLINK`(Util 库未被 Standard.project 模板引用,实时目录查不到签名)、`TONR`(本机 Standard 库目录无签名;别名 TON_R 同样 not_found)——两者在**导入前**被拒(`instruction_signature_unresolved`),且一条无法解析的指令会让整个 networks[] 批次失败(不会只丢那一个网络)。
- **fb 形状契约**:母线触点接第一个输入引脚、其余输入走 inputs 数据引脚、只接第一个输出引脚(编辑器拒绝第二个输出)。
- 探针还确认:`codesys_lad_instruction_signatures` 在 vanilla 线可见可用(查询机制健康:对照项 TON/CTU/TOF 均 found)。

## cs-lad-10 — V2 R027 手写 PID:41 网络 0 失败,自引用累加/ADD 复制/直址验证 (2026-09-09)

V2 R027(恒压供水,18 调用/**0 失败**/461 s;41 网络,一次生成 0/0,`ladderBodyVerified=true`)。CODESYS LAD 线首个零失败轮。编译验证的新形状:

- **自引用累加是合法形状**:box 输出接回同名输入(`ADD IN1:=rIAcc → rIAcc` 即 rIAcc += Ki·e)一次通过,`ladderBodyVerified` + 0/0——积分/累加器不必绕行。
- **MOVE 不可生成的复制绕行**:`ADD(IN1:=src, IN2:=rZero)` 复制变量(本轮 N27 复制 rErrPrev),0/0 验证。
- **模拟量直址合法**:`AT %IW0` / `AT %QW0` 在 CODESYS Control Win V3 软 PLC 上编译 0 错误(与 %IX/%QX 同);标定链 `WORD_TO_INT→INT_TO_REAL→DIV(满量程)→MUL(量程)`。
- **手写 PID 形状**(无 PID_FIXCYCLE 库时):`SUB(e=SP-PV)→MUL(P)→ADD(自引用 I 累加)→LIMIT(0..100) 抗饱和` + `SEL(xAutoEnable)` 使能清零 + `SEL(xAutoSel)` 手自动切换 + `MUL(50Hz)→MUL(552.96 counts/Hz)→REAL_TO_INT→INT_TO_WORD` 输出链——41 网络中 23 个是算术网络(本线 box 单输出的直接成本)。
- **PID_FIXCYCLE 在 Util 库**:Standard.project 模板不引用 Util → 实时目录查不到;要么手写,要么先用库引用工具挂 Util(该路径本线未验证)。
- **无 ET 的代价**:报警用两条 TON(3s/5s)延时确认;"低输出持续 N 秒休眠"类功能无法表达。
- 提示词层面的三点(采样周期未给/软 PLC IO 表达/PID 库允许与否)属任务自由度,不写进模板(REJECTED-LOG)。

## cs-lad-11 — V2 R028 气缸顺序:无 S/R 线圈的步进状态机 + 每步超时 (2026-09-09)

V2 R028(17 调用/**0 失败**/407 s;30 网络/95 触点/30 线圈/6 TON,0/0/0)。连续第二个零失败轮。编译验证的模式:

- **步进状态机(无 S/R 线圈)**:次态位先算(网络 14–19)+ 后置统一拷贝(20–25)的两段式,规避"线圈读本扫描已写值"的顺序耦合(与 cs-lad-7 移位同源)。
- **每步超时**:步 1~5 各配独立 TON T#5S(本线无 ET 可比较,只能铺 N 个 TON),任一超时 → 锁存报警 → 全部步清零、5 路输出失电,复位需"复位上升沿 + A 缸回原点"。
- **GVL 支持 AT %I/%Q 直址 + 初值**(11 路直址 + `xStep0_Idle := TRUE`,exactMatch=true,0/0)——三条线的地址直址(IX/QX/IW/QW)均已验证。
- 非失败事件:device.update 的存储格式对话框由引擎自动点"是",无需人工。

## cs-lad-12 — V2 R029 三泵轮换:Q 目标不自动声明 + one-hot 轮换写法 + GVL 补变量 (2026-09-09)

V2 R029(18 调用/1 失败/405 s;17 网络/80 触点/1 TON,0/0/0)。连续第三个零失败轮(唯一失败=模型漏声明 TON 的 Q 目标,6 错后补 GVL 一行即过)。

- **生成器只自动声明 FB 实例,不声明 q/pt/pv 目标变量**:模型传 `q:{name:"xRotTimerQ"}` 而 GVL 未声明 → 整工程 6 错(`没有定义标识符'xRotTimerQ'`),而生成器自身 diagnostics 仍 0。桥已修:结果回 `pouUndeclaredReferences`(POU 内未声明的引用名清单),卡已写明契约——**先声明再首次编译**。
- **one-hot 轮换(无 S/R 时)**:`tmp = (启动 & ¬self & ¬others) | (self & ¬rot) | (prev & rot)`,随后独立网络 `self := tmp`(先算后拷)。
- **8 小时轮换** = TON(PT=T#8h,IN=运行中 AND ¬Q,Q 单扫描脉冲)+ 首位下移;故障立即轮换并复位计时。
- **GVL 补变量用 `codesys_pou_add_variable`**(exactOneMatch=true 验证)——不必删表重建;全量重写仍需 delete+recreate(L31)。
- **task_pou_set 必须带上模板 PLC_PRG**:before=["PLC_PRG"] → after=["PLC_PRG", PRG_x] 才不触发 shrink limitation。
- T#8h 字面量 PT 接受并原样回读。

## cs-lad-13 — V2 R030 灌装计数:RETAIN GVL、位级 AT、批次计数模式、EN 门控 (2026-09-09)

V2 R030(22 调用/**0 失败**/254 s;16 网络,0/0/0 + `ladderBodyVerified=true`)。连续第四个零失败轮,且**首次用到 fb 网络**(两个 R_TRIG)。

- **`VAR_GLOBAL RETAIN`(不带初值)可编译 0/0**:`GVL_Retain` 掉电保持区的声明即通过;掉电行为本线无运行工具、不可验证,报告须如实声明。
- **GVL 位级 `AT %IX0.x/%QX0.x` 可编译**(cs-lad-10 只记了模拟量 %IW/%QW)。
- **批次计数模式(编译验证)**:R_TRIG 边沿计数 → CTU(PV=GVL 可调参数)→ 锁存批次位 → TON 定时 → **定时器 Q 恰好存在一个扫描周期,可安全作计数器复位**(只复位一次)。
- **EN 门控累加**:`ADD` 的 EN 为假时输出保持——"条件累加"惯用法(编译 0/0;运行时语义按 CODESYS 标准,本线未做运行时验证)。
- **gvl.create 已回 path**(桥修:L28 关闭)——清理不再需要多一次 project_tree 取路径。

## cs-lad-14 — V2 R031 中值滤波:用户 FB 可被 LAD fb 网络调用 + 换算形状 (2026-09-09)

V2 R031(22 调用/**0 失败**/423 s;15 网络,0/0/0)。连续第五个零失败轮。新验证:

- **工程内用户 FB 可被 LAD 调用**:任务要"FB+LAD",而 LAD 生成器只出 PROGRAM POU——工作流 = ST 通道(`codesys_source_import`/`codesys_pou_upsert`)建 `FB_MidTempAvg` 本体,再用 `type:"fb", instruction:"FB_MIDTEMPAVG"` 网络在 LAD 里实例化调用(`source:"library"` 解析到用户 FB),编译 0/0。
- **FB 实例自动声明在 POU 局部**:`VAR fbMid: FB_MIDTEMPAVG;`——GVL 里不要再声明同名实例(静默重复)。
- **工程量换算形状**:`INT_TO_REAL→MUL(量程)→DIV(满量程)` 输入链 + `MUL→DIV→REAL_TO_INT` 输出链;常量走 GVL(本线 box 不接受字面量)。
- 算法 `(T1+T2+T3)−max−min`(三路即中值)。

## cs-lad-15 — V2 R032 流量累计:100ms 任务、%ID/%QD 直址、SEL 自反馈 (2026-09-09)

V2 R032(19 调用/**0 失败**/432 s;9 网络,0/0/0)。连续第六个零失败轮。新验证:

- **采样周期用专用任务,不用 TON**:TON 分辨率=任务周期(MainTask 20ms 下 100ms 定时器实测退化为 ~120ms);`codesys_task_create`(Cyclic t#100ms)+ `task_pou_set` 把采样程序挂专用任务。
- **`DINT AT %ID0` / `DINT AT %QD0` 双字直址编译 0/0**(此前只验证过 IX/QX/IW/QW)。
- **SEL 自反馈合法**(`IN0:=diFlowTotal → diFlowTotal`):单输出功能框自反馈不限于 ADD——清零=末网络 `SEL(G:=xResetBtn, IN0:=diFlowTotal, IN1:=0)`,保证"先累加后归零"确定序。
- **pouLocalUndeclaredReferences 的语义**:只做 POU 局部解析,GVL 全局名一律出现在清单里(桥不解析 GVL 文本)——按"逐名核对已声明于某处"使用,不是"缺声明"告警(桥已改字段名加 Local)。
- **box 网络不需要串联触点**:enable 缺省 TRUE(不用补 xAlwaysOn)。
- 空任务对象可用 `codesys_object_delete` 直接删除(清理时先删任务调用项再删 POU,无 stub)。

## cs-lad-16 — V2 R033 冒泡排序:ST/LAD 双块架构 + 数组级 AT + 模板版本迁移 (2026-09-09)

V2 R033(24 调用/**0 失败**/470 s;ST 算法 0/0 + LAD 7 网络,`ladderBodyVerified=true`)。连续第七个零失败轮。新验证:

- **语言冲突的裁决(任务正文 ST vs 线语言 LAD)**:算法类(数组/下标/循环)LAD 无法表达 → **ST 通道实现算法(`PRG_Sort_ST`),LAD 承担操作层**(R_TRIG×2 边沿、联锁、指示灯)——R031 验证的用户 FB 工作流的 PROGRAM 版。
- **数组级 IO 映射**:`aiRaw AT %IW0 : ARRAY[1..10] OF INT;` 编译 0/0(标量 AT 经验的扩展)。
- **模板设备版本已漂移**:R033 实测 before==after==3.5.22.30(此前轮次已把磁盘模板迁移),但 `device.update` 仍弹"升级存储格式"对话框并被引擎自动确认、`saveRequired=true`——**device.update 每轮照调一次+保存,理由不再是"占位版本"而是"首开存储格式迁移"**(卡与路由行已更新)。
- **pouLocalUndeclaredReferences 的 GVL 误报已修**:桥现在交叉校验工程内 GVL 声明面板,结果分 pouLocalUndeclaredReferences / resolvedInGlobalScope / missingEverywhere 三档,只修 missingEverywhere。
- 调用表替换顺序固化:先删 `<TaskPath>/<旧POU>` 入口再 `task_pou_set`(两次 exactReadback=true,不触发 shrink)。

## cs-lad-17 — V2 R034 BCD 转二进制:AT 语法顺序 + 内置算子 not_found 语义 + BCD 金写法 (2026-09-09)

V2 R034(23 调用/1 失败/228 s;20 网络,0/0/0)。第八个零失败轮(唯一失败=模型把 AT 语法顺序写反,7 错后重写 GVL 即过)。新验证:

- **AT 语法顺序**:`name AT %addr : TYPE;`(名字在前、AT 居中、类型最后);写反(`x : BOOL AT %IX0.0;`)报 7 条 `应该采用';, :=, REF=, ( 或 [' 取代'AT'`。已进路由行。
- **内置算子 not_found 属正常**:`lad.instruction_signatures` 对 IEC 内置算子(ADD/GT/SEL/WORD_TO_INT/转换族)一律 not_found——它们是语言内置,不在库目录;not_found ≠ 指令不存在(卡已写明)。
- **INT32__ADD 实测 not_found**:注册表曾声称存在;本机用内置 `ADD` 一次通过(卡已标注)。
- **BCD→INT 金写法(20 网络 0/0)**:数位拆分 `DIV/MOD 16 的幂(4096→256→16)`、加权 `MUL 10 的幂(1000/100/10)`、自反馈 `ADD` 累加、合法性四位各 `GT 9` 串 NC 触点、故障锁存(复位常闭串联+自保持/非法分支并联)、输出 `SEL(G:=xPulseEnable, IN0:=0, IN1:=sum)` 清零门控。
- 常量引脚缺口再确认:BCD 算法被迫 8 个常量 GVL 变量(box 数据引脚不接受字面量;fb 数据引脚接受)。

## cs-lad-18 — V2 R035 模拟量线性转换:PROGRAM 当 FUNCTION 用 + 哨兵值收口 (2026-09-09)

V2 R035(17 调用/**0 失败/0 重复**/135 s;14 网络,0/0/0)。第九个零失败轮、迄今最快。新验证:

- **FUNCTION 需求的 LAD 等价**:生成器只出 PROGRAM → 接口 = GVL 成员模拟 VAR_INPUT/VAR_OUTPUT(参数/常量/中间量/状态位全在 GVL),单实例边界;多实例需数组化。
- **模拟量线性换算 + 哨兵值收口金写法**:`LT(AD<0) 断线` + `GT(AD>27648) 超限` → `INT_TO_REAL → SUB(零偏) → SUB(量程跨度) → DIV(满量程) → MUL(量程) → ADD(下限) → SEL(G:=xFault, IN0:=计算值, IN1:=-999.0) → MUL×10 → REAL_TO_INT → %QW0`(故障输出 -9990=-999.0×10)。SEL 收口网络排在故障判定之后(读本扫描已写值)。
- **resolvedInGlobalScope 生效**:GVL 先建后,生成器返回 24 名命中 GVL、missingEverywhere=[]——首次编译即 0/0("先声明再生成"契约闭环)。
- 模型主动读语料×2+经验×1,全部命中(常量引脚/自反馈/AT 直址/编译顺序)——语料回路成熟。

## cs-lad-19 — V2 R036 步进梯形加减速:TOF 自振荡、变量 PT、ST 算法+LAD 操作 (2026-09-09)

V2 R036(21 调用/**0 失败**/239 s;ST 算法 0/0 + LAD 14 网络,`ladderBodyVerified=true`)。第十个零失败轮;V1 同题 73 调用/5 失败/693s。新验证:

- **自振荡脉冲源用 TOF 而非 TP**:TP 的 Q 在 IN 下降沿立即复位,`NOT Q` 自反相每扫描翻转一次、频率退化为 1/(2×任务周期) 与 PT 无关;TOF 在上升沿置位、下降沿保持 PT——高电平=PT、周期=PT+1 任务周期。编译 0/0(设计推导+编译证据,无运行证据)。
- **变量 PT 可用**:`pt:{name:"tPulsePeriod"}`(值由 ST 通道算好)编译 0/0——"LAD 不能算 TIME"≠"不能用变量 PT";卡已澄清。
- **软 PLC 脉冲频率上限 = 1/(2×任务周期)**(1ms→500Hz);量化实际频率 `fAct=1000/(PT_ms+T_ms)`;定位误差 ≤1 脉冲。
- **步进架构**:ST `PRG_StepRamp`(频率斜坡、`n=(f²−fs²)/2a` 减速起点、短行程自动退化三角形、上升沿计数)+ LAD `PRG_StepperPos`(启动保持/停止、故障锁存、方向锁存+限位阻断、TOF 脉冲输出)+ GVL 交换;MainTask 周期 t#1ms。
- **codesys_pou_upsert 的 schema 曾只暴露 {name,disposable,confirm}**(描述却说有 declaration/implementation)→ 已修 schema;此前用 source_import 走通。

## cs-lad-20 — V2 R037 Modbus 轮询:VAR_GLOBAL 包裹陷阱 + gvl_set_text + 状态机套路 (2026-09-09)

V2 R037(30 调用/3 失败/631 s;50 网络,0/0/0)。零失败连击在第 11 轮被通信任务打破——全部是新陷阱,已修:

- **GVL 声明窗格必须含 `VAR_GLOBAL ... END_VAR` 包裹**:传"纯变量行"被 gvl.create 接受(exactMatch=true)但编译器完全看不见 → 整机 397 错(`没有定义标识符'xPbStartAll'`)。桥已修:gvl.create 变异前拒绝未包裹形状(`gvl_declaration_shape_invalid`)。resolvedInGlobalScope 的解析器只扫包裹段——missingEverywhere 大=多半是包裹缺失。
- **`codesys_gvl_set_text` 已上线**(L31 关闭):改写 GVL 声明不再 delete+recreate;同一文本写路径 pou.set_text 复用,confirm=write_pou_text。
- **pou_add_variable 的 declaration_target_unsupported 误导**(指向 DUT):真因=未包裹 GVL;桥已加真因提示。
- **Modbus 库本机未安装**(library_find_on_disk→not_found):模型诚实交付"协议无关主站事务接口"(GVL 变量集 xMbReq/xMbBusy/xMbDone/xMbErr/wMbSlave/wMbFunc/wMbAddr/wMbCount/wMbWrite/wMbErrCode)+ 轮询状态机,并在报告声明接线边界——正确行为。
- **LAD 状态机套路(50 网络 0/0)**:R_TRIG 每信号独立实例、自保持步位、单扫描脉冲对(pulse+记忆位)、SEL/ADD 自反馈做索引循环与参数装配、ADD(src,0) 复制、CTU 重试计数(WORD)、按索引 EQ 比较分派。
- 目录已存在的 create 报 handler_error(WindowsError 183)且无建议路径——模型换名自愈;容忍。

## cs-lad-21 — V2 R038 电子凸轮:三 PROGRAM 同扫描数据链 + 升序 SEL 链查表 (2026-09-09)

V2 R038(24 调用/**0 失败**/274 s;三 PROGRAM 53 网络,0/0/0)。新验证:

- **任务调用顺序 = 同扫描数据可见性**:`task_pou_set` 的 pous 数组顺序即执行序——`MAIN(相位累加)→CAM(查表插值)→OUT(位置积分)` 三 PROGRAM 经 GVL 成员同扫描传递数据链(0/0 验证)。
- **折线查表展开范式**:升序 `GE(φ≥P_k)` 门控 + `SEL` 逐段覆盖,后段获胜;降序会因 k=0 恒真永远被覆盖。6 段凸轮表展开 24 网络(ST 只需 10 行循环——LAD 无数组/下标/循环的直接成本)。
- **Q-only 的架构后果**:CTU.CV 不可读 → 相位用 REAL 累加器 + SEL 回绕(绕开 DINT_TO_REAL 可用性未知)。
- TOF 信号丢失检测(500ms 无编码器沿)0/0 验证;R_TRIG/TOF/SEL 链/LIMIT/REAL_TO_INT/自反馈累加器一次通过。
- 边界声明:软 PLC 相位按扫描周期计数,要求主轴脉冲频率 < 1/(2×任务周期);实际工程应由驱动器/高速计数模块计数。

## cs-lad-22 — V2 R039 急停/安全光幕:安全封锁推荐形状 (2026-09-09)

V2 R039(19 调用/**0 失败**/462 s;11 网络,0/0/0)。编译验证的安全封锁形状:

- **安全 OK 串联**:`xSafetyOK = 急停NC AND 光幕OSSD`(常闭接法,断线即触发)。
- **复位必须"按了复位"且"故障已消失"**:`xResetPulse(R_TRIG) AND xSafetyOK → xResetOK`。
- **单网络故障锁存**:`xFaultLatched = (xFaultLatched OR NOT xSafetyOK) AND NOT xResetOK`(自锁,仅复位有效可清)。
- **输出纵深防御**:三个执行器输出再各自串联急停/光幕 NC 触点(输出级兜底,不止状态位)。
- 边界声明:标准 PLC 逻辑不能替代安全回路本体(安全继电器/F-CPU,IEC 61508/62061)——模型如实写明。
- 三档未声明字段(resolvedInGlobalScope/missingEverywhere)在首次编译前就消除了未声明标识符问题(17 名全 resolved)。

## cs-lad-23 — V2 R040 多配方切换:SEL 两级级联选配方 + 边沿状态机冷启动陷阱 (2026-09-09)

V2 R040(27 调用/1 失败/545 s;LAD 24 网络 + ST FUNCTION_BLOCK,0/0/0,44 引用全 resolved)。编译+结构回读验证:

- **多档选择 = SEL 两级级联 + LIMIT**:两位编码→TON 去抖 300ms→解码;6 个 `SEL` 先选组再选参、后段覆盖,3 个 `LIMIT` 限幅兜底,装入 %QD 运行变量。`LIMIT` 盒数据引脚无字面量 → 6 个限幅边界变量(GVL)。
- **配方表展平**:本线 LAD 无数组/下标/循环 → 3×3 配方表 = 9 个命名 GVL 变量(初值即配方值,GVL 是初值唯一载体)。
- **边沿触发状态机冷启动陷阱(设计推演,本轮实测发生)**:选择开关停在 1 档上电时输入无上升沿 → R_TRIG 永不触发 → 运行变量永不装载。修法:FB 静态 `xInitReq : BOOL := TRUE;` 冷启动首次装载 + `xInhibit` 抑制后续(修后 inVariable 34→35 与新增引脚一一对应,0/0)。任何"靠输入沿启动"的状态机都要给冷启动通道。
- **非法选择位处理**:两位同 1 → 故障自保持锁存 + 禁止装载(工程惯例,模型自加)。
- **同名再生成必 destination_exists**:LAD 生成器无覆盖语义 → 每轮迭代多花 3 次调用(删任务条目→删 POU→重生成→重挂任务);L42 低优先。
- **失败样例**:`codesys_pou_upsert` schema 缺 declaration/implementation(R036 已修未构建,批建 #10 送达);`codesys_pou_set_text` 同缺(R040 修,同批)。
- 边界声明:300ms 去抖/500ms 保持/10s 超时只有编译+回读+推演证据,无运行时证据。

## cs-lad-24 — 单按钮启停的 LAD 唯一安全形状 + 仿真 holdMs 证明不重触发 (2026-09-10)

V2 R050(21 调用/**0 失败**/146 s;3 网络/7 触点/3 线圈,0/0,`ladderBodyVerified`;**仿真 5/5 pass**)。

- **唯一安全形状(编译 0/0 + 运行时 5/5)**:`R_TRIG rtBtn(CLK := xBtn) → xBtnEdge`(边沿,保证按住不重复翻转)+ 纯触点/线圈双支路 `xRun := (xRun AND NOT xBtnEdge) OR (xBtnEdge AND NOT xRun)`(= XOR)。**全程无 SET/RESET、无 SR/RS**;状态位 `xRun` 与输出位 `xRunOut` 分离(输出唯一驱动者)。去掉 N1 边沿网络,50ms 任务下按住按钮必然振荡。
- **纯并联网络的常通位**:双支路 OR 需要一条串联支路 → 用 GVL `xAlwaysOn : BOOL := TRUE;`(`contacts:[{name:xAlwaysOn}]` + 2 条 branches)。
- **仿真证明保持型输入不重触发**:`sim_assert` 的 `holdMs` 是必要手段——写 `xBtn=TRUE` 后窗口 2000ms + hold 1500ms,实测首次 324ms 成立并保持 TRUE;仅用单次 `expect` 会漏掉翻转振荡。
- **`sim_write` 可直接写 `AT %IX…` 映射变量**(mechanism=write,无需 force)。
- **`readbackCounts` 语义**:`coil`/`contact` 含 fb 引脚线(R_TRIG 的 Q 输出线计 1 个线圈、CLK 触点计 1 个触点)→ 2 个 contact_coil 网络 + 1 个 fb 网络报 `coil=3/contact=7`;**核对网络形状,不要对计数**。
- **删任务条目会自动更新调用表**:之后的 `task_pou_set` 只是确认(before==after)——清理时调一次即可。

## cs-lad-25 — vanilla LAD 的功能块真实边界:目录 819 名/51 FB,可用面靠"库引用"决定 (2026-09-10)

E2E V2 R051 实测(用户问"CODESYS 功能块是不是太少"):**不是没有,是没暴露 + 库没引用**。三层数字必须分清:

- **运行时目录**(`codesys_lad_instruction_search`):Standard.project 实测 **819 条名字、51 个 FunctionBlock**——但多数是系统/CAA 内部符号(`APPGETAPPLICATIONINFO`/`CODEM*`/`SEMA` 只有 `CTPRESET` 参数、`ETRIG/ETRIGA` 是 `guiHidden` 基类),**不是能直接放进 LAD 的块**。
- **工程引用决定可用面**:Standard.project 只引用 `Standard + IoStandard`,所以 PID/HYSTERESIS/RAMP/BLINK/TONR **全部缺席**;`codesys_library_add` 加 **`Util, 3.5.22.0 (System)`** 后立刻出现 **PID、PID_FIXCYCLE、HYSTERESIS、RAMP_INT、RAMP_REAL、BLINK**(TONR/FTIME 仍无)。分辨率必须精确(通配 `Util, * (System)` 报 `library_resolution_not_installed`)。
- **可用 ≠ 能放进 LAD**:fb 网络**强制要求首引脚是 BOOL 输入触点**——`BLINK`(ENABLE/TIMELOW/TIMEHIGH→OUT)实测进 LAD 编译 **0/0**;`HYSTERESIS`(IN/HIGH/LOW→OUT)、`PID`(ACTUAL/SET_POINT/…→Y)首引脚是 REAL,直接报 `fb network needs an input contact` → 只能走 **ST 通道包一层 FB** 再从 LAD 调用。`RTC`(EN/PDT→Q/CDT)虽首引脚 BOOL,但 `PDT` 常量形状未验证(整机 9 错,待复验)。
- **POU 名不能撞指令名**:`PRG_Blink`/`PRG_Pid` 被拒(`name must be a non-reserved IEC identifier`),用 `PRG_LampFlash`/`PRG_PidLoop`。
- **字段名**:生成器 schema 写 `block_name`,桥历史只认 `name` → 现已三种写法都收(`name`/`block_name`/`pouName`)。
- 常用可用块(实测/已验证):TON/TOF/TP/CTU/CTD/CTUD/SR/RS/R_TRIG/F_TRIG + **RTC** + **BLINK**(Util)。

## cs-lad-26 — 时序类 LAD 场景的测量纪律:R053 PWM 的五条踩坑 (2026-09-10)

V2 R053(vanilla,LAD 7 网络 + ST 算 TIME 基准,0/0,仿真 16/16 pass)。时序类 LAD 的缺陷只有仿真抓得到,**仿真本身也有测量纪律**:

- **刺激写入与其判定必须同一步**:`sim.assert` 的每步采样节拍约 350–800 ms(R053 实测),跨步写刺激会把相位基线留在上一步的节拍上 → 边沿时刻不可信;被测量的时间要远大于节拍(该轮用 0.1/0.2 Hz 才测准)。
- **步级时序字段**:每步返回 `elapsedMs`(写入 → 条件成立的实测边界时刻)与 `sampleCadenceMs`(实测平均采样间隔),据此校准 `expectWithinMs` / `expectNotBeforeMs`。
- **停机复位只能靠仿真抓**:网络自保持支路让"停机后周期窗口继续有效、快速重启继承旧相位"(实测 347 ms 即翻低,标称 2000 ms 高),编译期完全看不到;修法是给自保持支路串联命令位。
- **`REAL_TO_DINT` 自身四舍五入**(不是截断):手工再 `+0.5` 会算成 1001 ms 而不是 1000 ms(被仿真抓到)。**TIME 值断言只能用厂商显示格式串比较**(实读 `1s1ms`,与 `T#1s` 判否)。
- **登录会话中删对象必失败**:`无法移除对象'…'，因为该对象已经用于当前登录的设备` → 清理前先 `codesys_sim_online action=stop`;工具现在返回 `object_delete_blocked_by_online_session` + `requiredAction {action:stop}`。运行时预设/复位语义见 `13-codesys-vanilla.md` 的 `cs-sim-r053`。

## cs-lad-27 — vanilla LAD 网络类型的**真实**能力面:五种 type、逐类型字段表、以及"该用 FB 却写触点"的代价 (2026-09-10)

对全部 20 个 vanilla LAD 轮次的**会话记录普查**(`rounds/R*/session-path.txt` 里的 `codesys_lad_generate_project_pou` 调用,`scratch/lad-census.py` 产出)与桥/发射器源码逐行核对:

- **形状普查(实测计数)**:vanilla 网络压倒性是触点线圈——R052 `contact_coil 60 / timer 4 / fb 2`、R053 `15/6/0`;但并非不能用:`box`/`fb`/`timer`/`counter` 都真实出现过,且有多轮是盒主导——R025 `box 25`、R027 `28`、R031 `13`、R032 `8`、R034 `17`、R035 `12`、R038 `41`、R040 `box 18 + fb 8 + timer 4`。**结论:限制不是能力,是暴露面。**
- **桥真实支持五种 `type`**(`persistent_bridge.py` 的 `_normalize_project_network`):`contact_coil` / `box` / `timer` / `counter` / `fb`;未知值报 `unsupported project network type (contact_coil | box | timer | counter | fb)` 并带 `plan.networks[i].type`。
- **`timer` 与 `counter` 是 `fb` 的语法糖**:两者都归一化成"FB 实例调用"(`instruction` + `instance`),不是独立发射路径。`timer` 必填 `timer(TON|TOF|TP)`|`instruction`、`instance`、`input{name}`(接 FB **第一个输入引脚**的 BOOL 触点)、`pt{constant_value|name}`、`q{name}`;`counter` 必填 `counter(CTU|CTD|CTUD)`|`instruction`、`instance`、`input{name}`(CU/CD 触点)、`pv`(**vanilla 标准库 CTU/CTD/CTUD 是 WORD 类型**,必须绑 WORD 变量)、`q{name}`,可选 `reset`/`load`(会接到 RESET/LOAD)。两者的 `et`/`cv` 只有 schema、**不接线**(v1 只出 Q)。
- **`counter` 不是废调用**:普查实测 4 次真实使用(R025 ×2、R030、R037,形如 `{"type":"counter","counter":"CTU","instance":"ctuBatch","input":{"name":"xPartPulse"},"pv":{"name":"GVL_IO.wBatchSize"},"reset":{"name":"xCylDone"},"q":{"name":"xCount12"}}`)。前一轮背景材料里"发射器没有 counter 类型、是废调用"的说法**被源码与调用记录同时否证**。
- **`box` vs `fb` 的分工是硬边界**:`box` 只收库 **Function** 或 IEC 内建算子(把 FunctionBlock 放进 box 报 `plcopen_project_box_function_only`);`fb` 只收 **FunctionBlock**(把 Function 放进 fb 报 `plcopen_project_fb_required`)。box 的输出引脚就是指令名本身(`outputs:{"GT":"xHigh"}`);fb **只能接第一个输出引脚**(第二个报 `plcopen_project_fb_single_output`),该引脚发射成线圈。
- **`fb` 的 `input{name}` 接的是 FB 的"第一个输入引脚"而不是电源轨**:CTU 是 `CU`、R_TRIG 是 `CLK`、TON 是 `IN`;第一个引脚不是 BOOL 的数据型 FB(HYSTERESIS/PID)只能先在 ST 通道包一层带 BOOL 首引脚的 FUNCTION_BLOCK。
- **规范形状(可直接抄)**:box `{"type":"box","instruction":"GT","inputs":{"IN1":"iLevel","IN2":"iSet"},"outputs":{"GT":"xHigh"}}`;fb `{"type":"fb","instruction":"R_TRIG","instance":"rtStart","input":{"name":"xStart"},"outputs":{"Q":"xStartEdge"}}`;timer `{"type":"timer","timer":"TON","instance":"tonDelay","input":{"name":"xRun"},"pt":{"constant_value":"T#3s"},"q":{"name":"xDelayDone"}}`。
- **box 上的 `coil` 曾是被静默丢弃的字段**(2026-09-10 源码核对:`_emit_box_network_plcopen` 只写 `outputs{PORT:target}`,从不读 `net["coil"]`)→ 调用者可能交出一个"输出线缺失、诊断全绿"的程序。桥现在直接拒绝:`plcopen_project_box_coil_unsupported` + `use: plan.networks[i].outputs` + `outputPins`。普查复核:全部轮次里 `box + coil` 出现 **0 次**,所以这个拒绝不破坏任何已验证轮次。
- **卡片曾把 `coil` 的 schema 写死成 `required:[target]`**,而桥的 `_project_network_operand` 同时接受 `name`/`target`/`value`;`instance`/`input`/`q`/`pt`/`pv`/`reset`/`load`/`et`/`cv` 的 schema 只收对象,桥却同时收裸字符串(`_project_network_pin`)。同一轮里 schema 已按桥的真实接受面放宽(字符串或 `{name}`)。
- **box/fb 的「引脚顺序」曾经根本不存在**(2026-09-10 实测,本轮最大发现):常驻桥跑在 **IronPython** 上,而 IronPython 的 `dict` 迭代序是**哈希桶序、不是插入序**。计划里写 `inputs:{"IN1":"iLevel","IN2":"iSet"}`,归一化后的 `data` 字典迭代出来却是 `IN2` 在前 → 发射器 `for port, expr in data.items()` 按哈希序写出 PLCopen → 而 **Ladder 插件的 PLCopen LD 导入器对通用算子盒的引脚是「按文档顺序位置映射」,不看 `formalParameter` 名字** → IDE 里第一个数据引脚拿到 `iSet`。实测后果:`sim.assert` 在 `iLevel=0 / iSet=5` 读到 `xCmpHigh=TRUE`(等于真的算了 `iSet>iLevel`),而**整工程编译始终 0 错 0 警**。修法:桥把引脚以**有序列表** `dataPins`/`outputPins`(按解析出的签名引脚序)传给发射器,发射器只认这个列表(`_pinned_rows`),彻底不依赖 dict 顺序。
- **同一根因的连带面**:`timer`/`counter` 的 `et`/`cv` 原先被塞进 `outputs` 字典,而发射器取 `list(outputs.keys())[0]` 作为唯一输出 → 哈希序下可能把 **ET/CV 当成 Q 接线圈**。现在 `outputs` 只保留签名第一个输出引脚,`et`/`cv` 放进 `unwiredOutputs` 如实回报(v1 只接 Q)。任何新加的 box/fb 引脚都必须走「有序列表」这条路。
- **代价是可测量的**:用自保持触点模拟"周期/延时"这类时间相关行为,编译期 0 错,只有 `codesys_sim_assert` 抓得到(R053 实测:停机后自保持支路让周期窗口继续有效,347 ms 即翻低、标称 2000 ms 高)。**时间/计数/边沿/比较/运算/选择/字符串/用户 FB 一律用 box/fb/timer/counter;`contact_coil` 只留给真正布尔的继电器逻辑(自保持、互锁、允许链、灯/阀驱动)。**
- **单次调用的端到端实证(2026-09-10,vanilla SP22,`PRG_FbSurface`)**:一次 `lad.generate_project_pou` 里放 `box(GT)` + `timer(TON)` + `fb(SR)` + `counter(CTU)`,POU 进 MainTask 调用表,整工程 **0 错 0 警 无缺口**;原生导出回读 4 个 `Block`(BlockType=GT/TON/SR/CTU,Instance=tonDelay/srLatch/ctuParts,引脚 IN/PT/Q、SET1/RESET/Q1、CU/PV/Q);`sim.assert` **8/8 pass**,实测 `xCmpHigh` 在 (0,5) 为 FALSE、(10,5) 为 TRUE,CTU 两次上升沿后 `xBatchDone=TRUE`,SR 释放置位后 `xLatched` 保持 TRUE、复位后 FALSE,TON 在 1.5 s 前不成立、6 s 内成立。
