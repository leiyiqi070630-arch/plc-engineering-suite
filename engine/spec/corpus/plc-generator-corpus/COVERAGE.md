# 用例覆盖与维护

由 catalog.json、cases/*.json 及当前编译工具契约生成。每个版本列表表示适用契约范围；实际执行环境在证据内单独记录。

| 主入口 | 线路 | 用例数 | 形状/任务覆盖 |
| --- | --- | ---: | --- |
| `mitsubishi_csv_generate` | mitsubishi | 3 | comments, fx2, fx3, instruction-list, multi-operand |
| `mitsubishi_label_csv_generate` | mitsubishi | 1 | constants, encoding, labels |
| `tia_lad_generate_recipe_plan` | tia | 33 | alarm_horn_silence, analog_scale_chain, boolean_step_sequence, compound_interlock, compressor_permissive_run, conveyor_zone_interlock, device_three_state_monitor, discrete_tank_level, diverter_gate_interlock, door_lock_permissive, edge_triggered_impulse, fault_latch_acknowledge, forward_reverse_interlock, forward_reverse_interlock_timed, hoist_up_down_interlock, hydraulic_clamp_unclamp, material_feeder_interlock, mixer_agitator_permissive, mode_auto_manual_jog, motor_start_stop_seal_in, permissive_chain_enable, pump_duty_standby_alternating, pump_duty_standby_basic, runtime_accumulator_tonr, star_delta_basic_interlock, star_delta_timed, station_auto_cycle_gates, step_sequencer, tp_pulse_output, traffic_light_sequence, valve_open_close_interlock, valve_priority_control, vent_after_run_tof |
| `tia_lad_generate_block_xml` | tia | 19 | Calc, FC, OB, ProgramCycle, TOF, TON, TONR, TP, callee-interface, chain, classic-ob, constant, contact_coil, counter, fanout, fb_call, inout, instruction_box, jog, move, named-ports, negation, nested-branches, optimized-ob, parallel, reset-coil, seal-in, series, series-boxes, set-coil, stop-priority, three-branches, timer |
| `tia_openness_generate_graph_block` | tia | 4 | actions-N-S-R, alternatives, conditions, interlock, linear, loop, merge, next, supervision |
| `tia_sd_generate_block` | tia | 16 | FC, OB, box, call, coil, compare, contact, counter, edge_contact, i_contact, instr, math, move, parallel, r_coil, range, s_coil, timer, unary_math, wire |
| `tia_watch_generate_table_xml` | tia | 3 | absolute, format, symbolic, trigger |
| `tia_hmi_generate_screen_xml` | tia | 5 | bar, button, date_time_field, ellipse, graphic_io_field, graphic_view, io_field, lamp_circle, lamp_rect, line, rectangle, switch, symbolic_io_field, text_field, user_view |
| `codesys_lad_generate_contact_block` | inoproshop | 7 | TOF, TP, contact_coil, negation, seal-in, series, single-contact-branches, timer, timer-instance-type-rejection |
| `codesys_lad_generate_native` | inoproshop | 13 | blink, counters, edges, latches, native-compare, native-conversion, native-logic, native-math, native-select, native-shift, qualified-symbols, sections, timers, variables |
| `codesys_lad_generate_native_template` | inoproshop | 1 | single-instruction-template |
| `codesys_generate_st_plan` | inoproshop | 1 | st-write |
| `inoproshop_object_regenerate` | inoproshop | 2 | regenerate-gvl, regenerate-lad |
| `codesys_lad_generate_project_pou` | codesys | 7 | box, contact_coil, counter, fb, parallel, pure-or, series, timer |
| `codesys_lad_generate_recipe_plan` | inoproshop | 2 | native_instruction_batch, single_native_instruction |
| `codesys_lad_generate_control_recipe` | inoproshop | 1 | pump_station_control |
| `tia_hmi_generate_list_xml` | tia | 3 | text-list, graphic-list |

## 兼容入口与 IDE 命令

- `tia_openness_generate_web_pages_blocks`：这是厂商 IDE 的生成/编译命令，不是本产品 plan 到程序结构的私有生成器；依照该工具当前契约使用。
- `codesys_lad_generate_block`：兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `codesys_lad_generate_add`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `codesys_lad_generate_instruction`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `codesys_lad_native_generate_instruction`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_generate_block`：兼容/专用入口，优先参照 codesys_lad_generate_contact_block；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_generate_contact_block`：与 codesys_lad_generate_contact_block 共享同一输入 schema、校验和原生生成入口；plan、task、confirm、disposable 可原样复用。
- `codesys_lad_native_generate_instruction_batch`：兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_generate_add`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_generate_instruction`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_native_generate_instruction`：兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `inoproshop_lad_native_generate_instruction_batch`：兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。
- `codesys_build_generate_code`：这是厂商 IDE 的生成/编译命令，不是本产品 plan 到程序结构的私有生成器；依照该工具当前契约使用。
- `tia_openness_generate_loadable_file`：Live Openness LoadableProvider export; requires an active project and confirm=true. Not an offline plan generator or a device download.
- `tia_openness_generate_source_from_blocks`：Live Openness GenerateSource from existing blocks; requires project and confirm=true. Produces an external source, not an offline plan generator.

## 维护

1. 修改对应 case JSON；保留独立需求、预期结果和前置条件。别名不能直接假定参数同形。
2. 编译：`cargo build --manifest-path rust/Cargo.toml -p tools --bin generator_corpus --bin execute_tool`。
3. 运行 `python scripts/generator_corpus.py index`。契约变更时先审查 export 差异，再加 `--accept-contract-changes`；该参数不会更新证据里的哈希或验证级别。
4. 离线输出证据用 `python scripts/verify_generator_corpus.py` 重跑；它只允许明确列出的本地生成器，不调用 IDE 写操作。随后重新 index。
5. CI/交付前运行 `python scripts/generator_corpus.py check` 和工具 crate 的 `generator_corpus` 回归测试。IDE 导入、编译、行为测试需要各自独立证据。

## 用例索引

- `codesys-box` — 标准 CODESYS box（codesys / LAD）
- `codesys-counter` — 标准 CODESYS counter（codesys / LAD）
- `codesys-fb` — 标准 CODESYS fb（codesys / LAD）
- `codesys-parallel` — 标准 CODESYS parallel（codesys / LAD）
- `codesys-pure-or` — 标准 CODESYS pure-or（codesys / LAD）
- `codesys-series` — 标准 CODESYS series（codesys / LAD）
- `codesys-timer` — 标准 CODESYS timer（codesys / LAD）
- `ino-contact-seal-in` — 汇川启停自保（inoproshop / LAD）
- `ino-contact-series` — 汇川串联接点（inoproshop / LAD）
- `ino-contact-timer` — 汇川接点计划 TON（inoproshop / LAD）
- `ino-contact-tof-wrong-instance-rejected` — 拒绝反例：TOF 错用 TON 实例（不可写入工程）（inoproshop / LAD）
- `ino-contact-tof` — 汇川接点计划 TOF 实例类型正例（inoproshop / LAD）
- `ino-contact-tp-wrong-instance-rejected` — 拒绝反例：TP 错用 TON 实例（不可写入工程）（inoproshop / LAD）
- `ino-contact-tp` — 汇川接点计划 TP 实例类型正例（inoproshop / LAD）
- `ino-native-blink` — 汇川原生指令 BLINK（inoproshop / LAD）
- `ino-native-compare` — 汇川原生指令 GT（inoproshop / LAD）
- `ino-native-convert` — 汇川原生指令 INT_TO_REAL（inoproshop / LAD）
- `ino-native-ctu` — 汇川原生指令 CTU（inoproshop / LAD）
- `ino-native-declarations` — 汇川原生声明和端口类型（inoproshop / LAD）
- `ino-native-edge` — 汇川原生指令 R_TRIG（inoproshop / LAD）
- `ino-native-logic` — 汇川原生指令 AND（inoproshop / LAD）
- `ino-native-math` — 汇川原生指令 ADD（inoproshop / LAD）
- `ino-native-qualified` — 汇川原生指令 MOVE（inoproshop / LAD）
- `ino-native-select` — 汇川原生指令 SEL（inoproshop / LAD）
- `ino-native-shift` — 汇川原生指令 SHL（inoproshop / LAD）
- `ino-native-sr` — 汇川原生指令 SR（inoproshop / LAD）
- `ino-native-template` — 单指令原生模板（inoproshop / LAD）
- `ino-native-ton` — 汇川原生指令 TON（inoproshop / LAD）
- `ino-pump-recipe` — 泵站反馈超时与故障锁存 recipe（inoproshop / LAD）
- `ino-recipe-native-instruction-batch` — 汇川计划构造 native_instruction_batch（inoproshop / LAD）
- `ino-recipe-single-native-instruction` — 汇川计划构造 single_native_instruction（inoproshop / LAD）
- `ino-regenerate-gvl` — 已有对象重建 gvl（inoproshop / LAD）
- `ino-regenerate-lad` — 已有对象重建 lad（inoproshop / LAD）
- `ino-st` — ST 文本实现与声明（inoproshop / ST）
- `mitsubishi-labels` — 标签地址、常量与中文注释（mitsubishi / CSV）
- `mitsubishi-multioperand` — 多操作数 MOV 与行注解（mitsubishi / CSV）
- `mitsubishi-program-fx2` — fx2 程序清单启停自保（mitsubishi / CSV）
- `mitsubishi-program-fx3` — fx3 程序清单启停自保（mitsubishi / CSV）
- `tia-graph-actions` — GRAPH 动作、互锁和监控（tia / GRAPH）
- `tia-graph-alternative` — GRAPH 竞争分支与汇合（tia / GRAPH）
- `tia-graph-linear` — GRAPH 线性步序（tia / GRAPH）
- `tia-graph-loop` — GRAPH 跳转回初始步（tia / GRAPH）
- `tia-hmi-controls` — WinCC 经典画面 controls（tia / HMI）
- `tia-hmi-drawing` — WinCC 经典画面 drawing（tia / HMI）
- `tia-hmi-graphic-list` — Classic HMI graphic-list offline shape（tia / HMI）
- `tia-hmi-indicators` — WinCC 经典画面 indicators（tia / HMI）
- `tia-hmi-lists` — WinCC 经典文本列表 / 图形列表（含条目）（tia / HMI）
- `tia-hmi-pump-overview-page` — Classic 800×480 双泵补水整页监视：分区、统一字号、只读数值和反馈灯（tia / HMI）
- `tia-hmi-text-list` — Classic HMI text-list offline shape（tia / HMI）
- `tia-hmi-views` — WinCC 经典画面 views（tia / HMI）
- `tia-lad-calc` — Calc 公式使用 IN1/IN2/IN3（tia / LAD）
- `tia-lad-chain` — 比较结果串联使能 Move（tia / LAD）
- `tia-lad-classic-ob` — S7-300 循环 OB 与全局信号（tia / LAD）
- `tia-lad-ctu` — 计数器的动力流与数据端口（tia / LAD）
- `tia-lad-fanout` — 共同条件驱动多个终端（tia / LAD）
- `tia-lad-fc` — 无静态实例的 LAD FC（tia / LAD）
- `tia-lad-inout` — 调用真实 FB 接口中的 IN_OUT 参数（tia / LAD）
- `tia-lad-motor` — 启动、自保、点动三支路与共同停止条件（tia / LAD）
- `tia-lad-move` — 常量赋值到两个输出（tia / LAD）
- `tia-lad-nested` — 嵌套并联：(A 或 B) 且 C，另一路 D（tia / LAD）
- `tia-lad-optimized-ob` — S7-1500 循环 OB 与全局信号（tia / LAD）
- `tia-lad-parallel` — 两个并联入口（tia / LAD）
- `tia-lad-reset` — 条件驱动置位/复位线圈 RCoil（tia / LAD）
- `tia-lad-series` — 串联与取反：A 且非 B（tia / LAD）
- `tia-lad-set` — 条件驱动置位/复位线圈 SCoil（tia / LAD）
- `tia-lad-tof` — TOF 定时器与实例（tia / LAD）
- `tia-lad-ton` — TON 定时器与实例（tia / LAD）
- `tia-lad-tonr` — TONR 定时器与实例（tia / LAD）
- `tia-lad-tp` — TP 定时器与实例（tia / LAD）
- `tia-recipe-alarm-horn-silence` — 报警蜂鸣消音 recipe（tia / LAD）
- `tia-recipe-analog-scale-chain` — 模拟量缩放链 recipe（tia / LAD）
- `tia-recipe-boolean-step-sequence` — 布尔步序 recipe（tia / LAD）
- `tia-recipe-compound-interlock` — 复合互锁 recipe（tia / LAD）
- `tia-recipe-compressor-permissive-run` — 压缩机许可 recipe（tia / LAD）
- `tia-recipe-conveyor-zone-interlock` — 输送分区互锁 recipe（tia / LAD）
- `tia-recipe-device-three-state-monitor` — 设备三态监视 recipe（tia / LAD）
- `tia-recipe-discrete-tank-level` — 离散液位 recipe（tia / LAD）
- `tia-recipe-diverter-gate-interlock` — 分流门互锁 recipe（tia / LAD）
- `tia-recipe-door-lock-permissive` — 门锁许可 recipe（tia / LAD）
- `tia-recipe-edge-triggered-impulse` — 边沿脉冲 recipe（tia / LAD）
- `tia-recipe-fault-latch-acknowledge` — 故障锁存与确认 recipe（tia / LAD）
- `tia-recipe-forward-reverse-interlock-timed` — 带换向延时的正反转 recipe（tia / LAD）
- `tia-recipe-forward-reverse-interlock` — 正反转互锁 recipe（tia / LAD）
- `tia-recipe-hoist-up-down-interlock` — 升降互锁 recipe（tia / LAD）
- `tia-recipe-hydraulic-clamp-unclamp` — 液压夹紧松开 recipe（tia / LAD）
- `tia-recipe-material-feeder-interlock` — 送料互锁 recipe（tia / LAD）
- `tia-recipe-mixer-agitator-permissive` — 搅拌机许可 recipe（tia / LAD）
- `tia-recipe-mode-auto-manual-jog` — 自动手动点动 recipe（tia / LAD）
- `tia-recipe-motor-start-stop-seal-in` — 电机启停自保 recipe（tia / LAD）
- `tia-recipe-permissive-chain-enable` — 许可链 recipe（tia / LAD）
- `tia-recipe-pump-duty-standby-alternating` — 泵轮换主备 recipe（tia / LAD）
- `tia-recipe-pump-duty-standby-basic` — 泵主备基本控制 recipe（tia / LAD）
- `tia-recipe-runtime-accumulator-tonr` — 运行时间累计 recipe（tia / LAD）
- `tia-recipe-star-delta-basic-interlock` — 星三角互锁 recipe（tia / LAD）
- `tia-recipe-star-delta-timed` — 定时星三角 recipe（tia / LAD）
- `tia-recipe-station-auto-cycle-gates` — 工位自动循环门控 recipe（tia / LAD）
- `tia-recipe-step-sequencer` — 数值步序 recipe（tia / LAD）
- `tia-recipe-tp-pulse-output` — 定宽脉冲 recipe（tia / LAD）
- `tia-recipe-traffic-light-sequence` — 交通灯步序 recipe（tia / LAD）
- `tia-recipe-valve-open-close-interlock` — 阀开关互锁 recipe（tia / LAD）
- `tia-recipe-valve-priority-control` — 阀优先控制 recipe（tia / LAD）
- `tia-recipe-vent-after-run-tof` — 通风延后停止 recipe（tia / LAD）
- `tia-sd-box` — SD 命名参数函数框（tia / SD）
- `tia-sd-call` — SD 外部 FC 调用（tia / SD）
- `tia-sd-compare` — SD 比较（tia / SD）
- `tia-sd-contacts` — SD 接点、反相及线圈（tia / SD）
- `tia-sd-counter` — SD CTU 计数（tia / SD）
- `tia-sd-edge` — SD 上升沿接点及持久边沿位（tia / SD）
- `tia-sd-fc` — SD FC 块接口（tia / SD）
- `tia-sd-instr` — SD 目录指令的绑定（tia / SD）
- `tia-sd-latch` — SD 置位后复位的扫描顺序（tia / SD）
- `tia-sd-math` — SD 二元数学（tia / SD）
- `tia-sd-move` — SD 多目标 Move（tia / SD）
- `tia-sd-ob` — SD OB 块接口（tia / SD）
- `tia-sd-parallel` — SD 高层并联自动展开 wire#（tia / SD）
- `tia-sd-range` — SD 区间判断（tia / SD）
- `tia-sd-timer` — SD TON 动力输入（tia / SD）
- `tia-sd-unary` — SD 单输入数学（tia / SD）
- `tia-watch-absolute` — 绝对地址监控表（tia / WATCH）
- `tia-watch-format` — 监控表格式与触发（tia / WATCH）
- `tia-watch-symbolic` — 符号监控表（tia / WATCH）
{
  "formatVersion": 1,
  "tools": [
    {
      "name": "mitsubishi_csv_generate",
      "kind": "generator",
      "routes": [
        "mitsubishi"
      ],
      "capabilities": [
        "comments",
        "fx2",
        "fx3",
        "instruction-list",
        "multi-operand"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "mitsubishi_label_csv_generate",
      "kind": "generator",
      "routes": [
        "mitsubishi"
      ],
      "capabilities": [
        "constants",
        "encoding",
        "labels"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_openness_generate_web_pages_blocks",
      "kind": "ide-command",
      "note": "这是厂商 IDE 的生成/编译命令，不是本产品 plan 到程序结构的私有生成器；依照该工具当前契约使用。"
    },
    {
      "name": "tia_lad_generate_recipe_plan",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "alarm_horn_silence",
        "analog_scale_chain",
        "boolean_step_sequence",
        "compound_interlock",
        "compressor_permissive_run",
        "conveyor_zone_interlock",
        "device_three_state_monitor",
        "discrete_tank_level",
        "diverter_gate_interlock",
        "door_lock_permissive",
        "edge_triggered_impulse",
        "fault_latch_acknowledge",
        "forward_reverse_interlock",
        "forward_reverse_interlock_timed",
        "hoist_up_down_interlock",
        "hydraulic_clamp_unclamp",
        "material_feeder_interlock",
        "mixer_agitator_permissive",
        "mode_auto_manual_jog",
        "motor_start_stop_seal_in",
        "permissive_chain_enable",
        "pump_duty_standby_alternating",
        "pump_duty_standby_basic",
        "runtime_accumulator_tonr",
        "star_delta_basic_interlock",
        "star_delta_timed",
        "station_auto_cycle_gates",
        "step_sequencer",
        "tp_pulse_output",
        "traffic_light_sequence",
        "valve_open_close_interlock",
        "valve_priority_control",
        "vent_after_run_tof"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_lad_generate_block_xml",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "Calc",
        "FC",
        "OB",
        "ProgramCycle",
        "TOF",
        "TON",
        "TONR",
        "TP",
        "callee-interface",
        "chain",
        "classic-ob",
        "constant",
        "contact_coil",
        "counter",
        "fanout",
        "fb_call",
        "inout",
        "instruction_box",
        "jog",
        "move",
        "named-ports",
        "negation",
        "nested-branches",
        "optimized-ob",
        "parallel",
        "reset-coil",
        "seal-in",
        "series",
        "series-boxes",
        "set-coil",
        "stop-priority",
        "three-branches",
        "timer"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_openness_generate_graph_block",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "actions-N-S-R",
        "alternatives",
        "conditions",
        "interlock",
        "linear",
        "loop",
        "merge",
        "next",
        "supervision"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_sd_generate_block",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "FC",
        "OB",
        "box",
        "call",
        "coil",
        "compare",
        "contact",
        "counter",
        "edge_contact",
        "i_contact",
        "instr",
        "math",
        "move",
        "parallel",
        "r_coil",
        "range",
        "s_coil",
        "timer",
        "unary_math",
        "wire"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_watch_generate_table_xml",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "absolute",
        "format",
        "symbolic",
        "trigger"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "tia_hmi_generate_screen_xml",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "bar",
        "button",
        "date_time_field",
        "ellipse",
        "graphic_io_field",
        "graphic_view",
        "io_field",
        "lamp_circle",
        "lamp_rect",
        "line",
        "rectangle",
        "switch",
        "symbolic_io_field",
        "text_field",
        "user_view"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_contact_block",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "TOF",
        "TP",
        "contact_coil",
        "negation",
        "seal-in",
        "series",
        "single-contact-branches",
        "timer",
        "timer-instance-type-rejection"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_block",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "codesys_lad_generate_native",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "blink",
        "counters",
        "edges",
        "latches",
        "native-compare",
        "native-conversion",
        "native-logic",
        "native-math",
        "native-select",
        "native-shift",
        "qualified-symbols",
        "sections",
        "timers",
        "variables"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_native_template",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "single-instruction-template"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_generate_st_plan",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "st-write"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "inoproshop_object_regenerate",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "regenerate-gvl",
        "regenerate-lad"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_project_pou",
      "kind": "generator",
      "routes": [
        "codesys"
      ],
      "capabilities": [
        "box",
        "contact_coil",
        "counter",
        "fb",
        "parallel",
        "pure-or",
        "series",
        "timer"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_recipe_plan",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "native_instruction_batch",
        "single_native_instruction"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_control_recipe",
      "kind": "generator",
      "routes": [
        "inoproshop"
      ],
      "capabilities": [
        "pump_station_control"
      ],
      "note": "用例涵盖当前输入形状；已验证阶段在每例 evidence 中，未验证部分不得报告为通过。"
    },
    {
      "name": "codesys_lad_generate_add",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "codesys_lad_generate_instruction",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "codesys_lad_native_generate_instruction",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_generate_block",
      "kind": "alias",
      "canonical": "codesys_lad_generate_contact_block",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_contact_block；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_generate_contact_block",
      "kind": "alias",
      "canonical": "codesys_lad_generate_contact_block",
      "note": "与 codesys_lad_generate_contact_block 共享同一输入 schema、校验和原生生成入口；plan、task、confirm、disposable 可原样复用。"
    },
    {
      "name": "codesys_lad_native_generate_instruction_batch",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_generate_add",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_generate_instruction",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_native_generate_instruction",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native_template",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native_template；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "inoproshop_lad_native_generate_instruction_batch",
      "kind": "alias",
      "canonical": "codesys_lad_generate_native",
      "note": "兼容/专用入口，优先参照 codesys_lad_generate_native；迁移时按主入口完整 schema 重构请求，name、confirm 及 plan/networks 不保证同形。"
    },
    {
      "name": "codesys_build_generate_code",
      "kind": "ide-command",
      "note": "这是厂商 IDE 的生成/编译命令，不是本产品 plan 到程序结构的私有生成器；依照该工具当前契约使用。"
    },
    {
      "name": "tia_openness_generate_loadable_file",
      "kind": "ide-command",
      "note": "Live Openness LoadableProvider export; requires an active project and confirm=true. Not an offline plan generator or a device download."
    },
    {
      "name": "tia_openness_generate_source_from_blocks",
      "kind": "ide-command",
      "note": "Live Openness GenerateSource from existing blocks; requires project and confirm=true. Produces an external source, not an offline plan generator."
    },
    {
      "name": "tia_hmi_generate_list_xml",
      "kind": "generator",
      "routes": [
        "tia"
      ],
      "capabilities": [
        "text-list",
        "graphic-list"
      ],
      "note": "Classic HMI lists; offline XML generation only in these cases. Pictures are not bound; IDE import/readback and runtime need separate evidence."
    }
  ],
  "cases": [
    {
      "id": "codesys-box",
      "title": "标准 CODESYS box",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "box",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "box"
      ],
      "path": "cases/codesys-box.json",
      "sha256": "31994f38253e235756bfffc7234949524724eb11a8a92df45f745b48f67a567c",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-counter",
      "title": "标准 CODESYS counter",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "counter",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "counter"
      ],
      "path": "cases/codesys-counter.json",
      "sha256": "4292c114069bb86a39e5d59373bed079af0e04ac46a1330845eeb929a1131704",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-fb",
      "title": "标准 CODESYS fb",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "fb",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "fb"
      ],
      "path": "cases/codesys-fb.json",
      "sha256": "b190bb6495126ac861d4f38d453f7775e9dd17f6e604f1a8e3fe9871f0ef613b",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-parallel",
      "title": "标准 CODESYS parallel",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "parallel",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "parallel"
      ],
      "path": "cases/codesys-parallel.json",
      "sha256": "cdecf5cc1d0a04ce3cf47f458badd7d2ad878bb659ddd7002a3d08b937f812ea",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-pure-or",
      "title": "标准 CODESYS pure-or",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "pure-or",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "pure-or"
      ],
      "path": "cases/codesys-pure-or.json",
      "sha256": "274b95b3e1d1baa9ab29004fd06a1b36cd369d20912bbb56ba5e5d80727b1330",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-series",
      "title": "标准 CODESYS series",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "series"
      ],
      "path": "cases/codesys-series.json",
      "sha256": "27066df9de908184b61c90458c3f4ea4e7612a1173acd9150aaed6be78c92869",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "codesys-timer",
      "title": "标准 CODESYS timer",
      "tool": "codesys_lad_generate_project_pou",
      "route": "codesys",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "timer",
        "标准",
        "CODESYS",
        "codesys",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer"
      ],
      "path": "cases/codesys-timer.json",
      "sha256": "2476cc33402afa5d8ba7c7869e96962b1050499a03a5e3e6e574c05ccbe624b7",
      "contractHash": "ce012c8130ec0436aa04b6620999141b4e5d6cf3dd7a49e990a4917cbe196c19"
    },
    {
      "id": "ino-contact-seal-in",
      "title": "汇川启停自保",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "single-contact-branches",
        "seal-in",
        "汇川启停自保",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "single-contact-branches",
        "seal-in"
      ],
      "path": "cases/ino-contact-seal-in.json",
      "sha256": "4a6748a4372288063f78f55da830b6825fb4541709aab4363f8506d8b0293f0e",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-series",
      "title": "汇川串联接点",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "negation",
        "汇川串联接点",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "series",
        "negation"
      ],
      "path": "cases/ino-contact-series.json",
      "sha256": "281a33c434d4f8e5c9d64856fe48121758687ef52f920de24758b22781e50537",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-timer",
      "title": "汇川接点计划 TON",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "timer",
        "汇川接点计划",
        "TON",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer"
      ],
      "path": "cases/ino-contact-timer.json",
      "sha256": "4c14a75059c453f250093f6cde4eb1275d2f0f7262059edbcee7efc7aea4911f",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-tof-wrong-instance-rejected",
      "title": "拒绝反例：TOF 错用 TON 实例（不可写入工程）",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "TOF",
        "拒绝反例",
        "negative",
        "rejection",
        "错型",
        "TON",
        "汇川",
        "inoproshop"
      ],
      "covers": [
        "timer-instance-type-rejection",
        "TOF"
      ],
      "path": "cases/ino-contact-tof-wrong-instance-rejected.json",
      "sha256": "178e75712e3ec358346bcc0909ac49ac2ab8f88da5fdd906162aa9e75f7618c4",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-tof",
      "title": "汇川接点计划 TOF 实例类型正例",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "TOF",
        "timer",
        "正确实例类型",
        "汇川",
        "inoproshop",
        "LAD",
        "生成器"
      ],
      "covers": [
        "timer",
        "TOF"
      ],
      "path": "cases/ino-contact-tof.json",
      "sha256": "c9ade5a1496643df9eade3b4bc3fabaca8f5c037a2f0e6e6066fd932f79019bc",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-tp-wrong-instance-rejected",
      "title": "拒绝反例：TP 错用 TON 实例（不可写入工程）",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "TP",
        "拒绝反例",
        "negative",
        "rejection",
        "错型",
        "TON",
        "汇川",
        "inoproshop"
      ],
      "covers": [
        "timer-instance-type-rejection",
        "TP"
      ],
      "path": "cases/ino-contact-tp-wrong-instance-rejected.json",
      "sha256": "5f06ddd64daa26afd7f1b84174212afdaa97b1ec49d445682b2483f8aadda55b",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-contact-tp",
      "title": "汇川接点计划 TP 实例类型正例",
      "tool": "codesys_lad_generate_contact_block",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "TP",
        "timer",
        "正确实例类型",
        "汇川",
        "inoproshop",
        "LAD",
        "生成器"
      ],
      "covers": [
        "timer",
        "TP"
      ],
      "path": "cases/ino-contact-tp.json",
      "sha256": "7c78d68474fac7be39ad9f4f560c87c12fd7240d74af8fb3086e3034e078bc98",
      "contractHash": "dd7207b2aad12c127e5f68ef4a70a4458eb6ff8f4297317b6886edaf661e8a45"
    },
    {
      "id": "ino-native-blink",
      "title": "汇川原生指令 BLINK",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "blink",
        "汇川原生指令",
        "BLINK",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "blink"
      ],
      "path": "cases/ino-native-blink.json",
      "sha256": "5d1fb2938b65429477fb2bb7c07e22dcee19e3b70ab1c0a83d102948d73e5c92",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-compare",
      "title": "汇川原生指令 GT",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-compare",
        "汇川原生指令",
        "GT",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-compare"
      ],
      "path": "cases/ino-native-compare.json",
      "sha256": "091fb92c3794641918e2b9a6098785aafe56028ed0e1d2b7ab4029d686c7c0db",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-convert",
      "title": "汇川原生指令 INT_TO_REAL",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-conversion",
        "汇川原生指令",
        "INT_TO_REAL",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-conversion"
      ],
      "path": "cases/ino-native-convert.json",
      "sha256": "7fb688ef22750c75d348f58bdc93e210ba85c6ca2c2de5d35e6c769059e11261",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-ctu",
      "title": "汇川原生指令 CTU",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "counters",
        "汇川原生指令",
        "CTU",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "counters"
      ],
      "path": "cases/ino-native-ctu.json",
      "sha256": "30cd9e0408af106efd735d734093ebf057d9ebe0c7ba66de0689b1cb0d8c2794",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-declarations",
      "title": "汇川原生声明和端口类型",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-compare",
        "汇川原生指令",
        "GT",
        "inoproshop",
        "LAD",
        "生成器",
        "generator",
        "声明",
        "variables",
        "input",
        "output"
      ],
      "covers": [
        "variables",
        "sections",
        "native-compare"
      ],
      "path": "cases/ino-native-declarations.json",
      "sha256": "4cb7284ea2b2ba39f59893b9be460c32c2a1d8cd6cf0ac7871d90d0edd483803",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-edge",
      "title": "汇川原生指令 R_TRIG",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "edges",
        "汇川原生指令",
        "R_TRIG",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "edges"
      ],
      "path": "cases/ino-native-edge.json",
      "sha256": "117bdf309a013df5998f1e0aa53bee1b588f9ce894650f46e28371c6991c7561",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-logic",
      "title": "汇川原生指令 AND",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-logic",
        "汇川原生指令",
        "AND",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-logic"
      ],
      "path": "cases/ino-native-logic.json",
      "sha256": "5d7d6ab9080f316d8f7301fd546833fddcbed350682371d1d19905d7f5313310",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-math",
      "title": "汇川原生指令 ADD",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-math",
        "汇川原生指令",
        "ADD",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-math"
      ],
      "path": "cases/ino-native-math.json",
      "sha256": "086bd862631a3c1bb54a5700b99e1371598edbb58565015b266b7e16993c8e8b",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-qualified",
      "title": "汇川原生指令 MOVE",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "qualified-symbols",
        "汇川原生指令",
        "MOVE",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "qualified-symbols"
      ],
      "path": "cases/ino-native-qualified.json",
      "sha256": "70c0057f2aff1663a08a42cca93a50767e79914bf1fb269042820fdd5e98c6c8",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-select",
      "title": "汇川原生指令 SEL",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-select",
        "汇川原生指令",
        "SEL",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-select"
      ],
      "path": "cases/ino-native-select.json",
      "sha256": "4f1362ab9a7938c5491bd9f4ac49407f7a2bcda8825e3cd2679969bf17ec1b73",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-shift",
      "title": "汇川原生指令 SHL",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native-shift",
        "汇川原生指令",
        "SHL",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native-shift"
      ],
      "path": "cases/ino-native-shift.json",
      "sha256": "79d948bad86db1ca4bdea7babd4e0e291bbe3790a08195066ec32805d4ccd3cf",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-sr",
      "title": "汇川原生指令 SR",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "latches",
        "汇川原生指令",
        "SR",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "latches"
      ],
      "path": "cases/ino-native-sr.json",
      "sha256": "023463f0f61359131803de187161b3a27b96de916e426ac7a8aefc83868aac6c",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-native-template",
      "title": "单指令原生模板",
      "tool": "codesys_lad_generate_native_template",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "single-instruction-template",
        "单指令原生模板",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "single-instruction-template"
      ],
      "path": "cases/ino-native-template.json",
      "sha256": "b1b1765636b0f982342d9732187f5fcf59120b2301d7a1c81a787c78da09bb91",
      "contractHash": "55abbcd8fd5a769c760a15476ab1861ef6c9ce08d960682682fcbdfe34eb5660"
    },
    {
      "id": "ino-native-ton",
      "title": "汇川原生指令 TON",
      "tool": "codesys_lad_generate_native",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "timers",
        "汇川原生指令",
        "TON",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timers"
      ],
      "path": "cases/ino-native-ton.json",
      "sha256": "d2f07cb4fb2c7cf2161489b9fcd00e0a6367ec1ed5871b3e2af092f2fa4c94b6",
      "contractHash": "2691f8fb7d89cc1dfeb0507803bee85c5906aa1e9aaf14dfc5e4028aa0f88e24"
    },
    {
      "id": "ino-pump-recipe",
      "title": "泵站反馈超时与故障锁存 recipe",
      "tool": "codesys_lad_generate_control_recipe",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "pump_station_control",
        "泵站反馈超时与故障锁存",
        "recipe",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "pump_station_control"
      ],
      "path": "cases/ino-pump-recipe.json",
      "sha256": "817ffa6e0bbea105c13761c4073a493884d400b73076b6914e0b92834d7eed87",
      "contractHash": "55e40e7698d01df5cba8530685db20eca5d9944ec588eb2a2d2b8442a6577c68"
    },
    {
      "id": "ino-recipe-native-instruction-batch",
      "title": "汇川计划构造 native_instruction_batch",
      "tool": "codesys_lad_generate_recipe_plan",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "native_instruction_batch",
        "汇川计划构造",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "native_instruction_batch"
      ],
      "path": "cases/ino-recipe-native-instruction-batch.json",
      "sha256": "d882493713ec2f95a13293ea003d4cdf68fad3a8ea96f4e249f6a54ccb6e4d9a",
      "contractHash": "d1b91e7ef0927de3690ab74689ca96e4b4e8b97894eb4e93703540f3f80722d2"
    },
    {
      "id": "ino-recipe-single-native-instruction",
      "title": "汇川计划构造 single_native_instruction",
      "tool": "codesys_lad_generate_recipe_plan",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "single_native_instruction",
        "汇川计划构造",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "single_native_instruction"
      ],
      "path": "cases/ino-recipe-single-native-instruction.json",
      "sha256": "ba4a3c488872932771a945218c29a62ec76e2ce2699617173c6a96903b575052",
      "contractHash": "d1b91e7ef0927de3690ab74689ca96e4b4e8b97894eb4e93703540f3f80722d2"
    },
    {
      "id": "ino-regenerate-gvl",
      "title": "已有对象重建 gvl",
      "tool": "inoproshop_object_regenerate",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "regenerate-gvl",
        "已有对象重建",
        "gvl",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "regenerate-gvl"
      ],
      "path": "cases/ino-regenerate-gvl.json",
      "sha256": "c96566bd720e15b2cd2a7d3137f4041874583825340cdaecd630236e8459553a",
      "contractHash": "4c5aa70f6d797e06d0c0d2ba505911d489e3b8deb476dc99cf9679cd1c999506"
    },
    {
      "id": "ino-regenerate-lad",
      "title": "已有对象重建 lad",
      "tool": "inoproshop_object_regenerate",
      "route": "inoproshop",
      "versions": [],
      "language": "LAD",
      "keywords": [
        "regenerate-lad",
        "已有对象重建",
        "lad",
        "inoproshop",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "regenerate-lad"
      ],
      "path": "cases/ino-regenerate-lad.json",
      "sha256": "0846029afd99a3802dbd61623eb8119dad80e80398372923a61fb1115f8c519d",
      "contractHash": "4c5aa70f6d797e06d0c0d2ba505911d489e3b8deb476dc99cf9679cd1c999506"
    },
    {
      "id": "ino-st",
      "title": "ST 文本实现与声明",
      "tool": "codesys_generate_st_plan",
      "route": "inoproshop",
      "versions": [],
      "language": "ST",
      "keywords": [
        "st-write",
        "ST",
        "文本实现与声明",
        "inoproshop",
        "生成器",
        "generator"
      ],
      "covers": [
        "st-write"
      ],
      "path": "cases/ino-st.json",
      "sha256": "9be7d4f92574a986f3464e6cbebc8f5e4946b11c38c6b309d4ed6b8bb7e3d729",
      "contractHash": "c5fd552ee0a06954263518e30e161d3acb1159b3b29e2d11a1c51637d64db83a"
    },
    {
      "id": "mitsubishi-labels",
      "title": "标签地址、常量与中文注释",
      "tool": "mitsubishi_label_csv_generate",
      "route": "mitsubishi",
      "versions": [],
      "language": "CSV",
      "keywords": [
        "labels",
        "constants",
        "encoding",
        "标签地址、常量与中文注释",
        "mitsubishi",
        "CSV",
        "生成器",
        "generator"
      ],
      "covers": [
        "labels",
        "constants",
        "encoding"
      ],
      "path": "cases/mitsubishi-labels.json",
      "sha256": "c35e0678cc76082add447c36ba19c6fec762c657f1ec0e36eb2df1530b2bd524",
      "contractHash": "cec9adc5dd6c79090e46fa64571e879777bb890057c41a49a5d716f8b75bce2c"
    },
    {
      "id": "mitsubishi-multioperand",
      "title": "多操作数 MOV 与行注解",
      "tool": "mitsubishi_csv_generate",
      "route": "mitsubishi",
      "versions": [],
      "language": "CSV",
      "keywords": [
        "multi-operand",
        "comments",
        "多操作数",
        "MOV",
        "与行注解",
        "mitsubishi",
        "CSV",
        "生成器",
        "generator"
      ],
      "covers": [
        "multi-operand",
        "comments"
      ],
      "path": "cases/mitsubishi-multioperand.json",
      "sha256": "12f043352388ab1d8c976ff4c73055e9ac87283b7a67c65ce8c6a7c7b7d7d1c9",
      "contractHash": "78db979e0bf90288fa05b208fbd073801b900f2a2bcd47e8fdb7f2d091847b52"
    },
    {
      "id": "mitsubishi-program-fx2",
      "title": "fx2 程序清单启停自保",
      "tool": "mitsubishi_csv_generate",
      "route": "mitsubishi",
      "versions": [],
      "language": "CSV",
      "keywords": [
        "instruction-list",
        "fx2",
        "程序清单启停自保",
        "mitsubishi",
        "CSV",
        "生成器",
        "generator"
      ],
      "covers": [
        "instruction-list",
        "fx2"
      ],
      "path": "cases/mitsubishi-program-fx2.json",
      "sha256": "865cd07fa83cef93325f7966b753e41e59b551d8748bec9fb5ff282e67d0db59",
      "contractHash": "78db979e0bf90288fa05b208fbd073801b900f2a2bcd47e8fdb7f2d091847b52"
    },
    {
      "id": "mitsubishi-program-fx3",
      "title": "fx3 程序清单启停自保",
      "tool": "mitsubishi_csv_generate",
      "route": "mitsubishi",
      "versions": [],
      "language": "CSV",
      "keywords": [
        "instruction-list",
        "fx3",
        "程序清单启停自保",
        "mitsubishi",
        "CSV",
        "生成器",
        "generator"
      ],
      "covers": [
        "instruction-list",
        "fx3"
      ],
      "path": "cases/mitsubishi-program-fx3.json",
      "sha256": "909626ce8f079b9455c5e7beafa6377f013ee0eaebcc9601d7158c25b324e907",
      "contractHash": "78db979e0bf90288fa05b208fbd073801b900f2a2bcd47e8fdb7f2d091847b52"
    },
    {
      "id": "tia-graph-actions",
      "title": "GRAPH 动作、互锁和监控",
      "tool": "tia_openness_generate_graph_block",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "GRAPH",
      "keywords": [
        "actions-N-S-R",
        "interlock",
        "supervision",
        "GRAPH",
        "动作、互锁和监控",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "actions-N-S-R",
        "interlock",
        "supervision"
      ],
      "path": "cases/tia-graph-actions.json",
      "sha256": "0fedde709eceb139cbe8fefc723e1d7c20a8bbe21f29ac6383014d5c2f3f44c4",
      "contractHash": "3a8a67a7787d9759a4e028447e9f4153b4a7c5eeb22dc64f0a169c86c3b31d93"
    },
    {
      "id": "tia-graph-alternative",
      "title": "GRAPH 竞争分支与汇合",
      "tool": "tia_openness_generate_graph_block",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "GRAPH",
      "keywords": [
        "alternatives",
        "merge",
        "GRAPH",
        "竞争分支与汇合",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "alternatives",
        "merge"
      ],
      "path": "cases/tia-graph-alternative.json",
      "sha256": "86483d76154b7cc830c56e964814eb2e6ed0ba417d2ff697a64ace6f9eef889a",
      "contractHash": "3a8a67a7787d9759a4e028447e9f4153b4a7c5eeb22dc64f0a169c86c3b31d93"
    },
    {
      "id": "tia-graph-linear",
      "title": "GRAPH 线性步序",
      "tool": "tia_openness_generate_graph_block",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "GRAPH",
      "keywords": [
        "linear",
        "conditions",
        "GRAPH",
        "线性步序",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "linear",
        "conditions"
      ],
      "path": "cases/tia-graph-linear.json",
      "sha256": "d8e54312e6cb5e101c11a5002c8b237f0c3259aa99bbbf267596b66aa0f86780",
      "contractHash": "3a8a67a7787d9759a4e028447e9f4153b4a7c5eeb22dc64f0a169c86c3b31d93"
    },
    {
      "id": "tia-graph-loop",
      "title": "GRAPH 跳转回初始步",
      "tool": "tia_openness_generate_graph_block",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "GRAPH",
      "keywords": [
        "loop",
        "next",
        "GRAPH",
        "跳转回初始步",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "loop",
        "next"
      ],
      "path": "cases/tia-graph-loop.json",
      "sha256": "52f6c4a0ee18df07d8f01b68791607326919a44682c9b77f5cc235d751c9e65c",
      "contractHash": "3a8a67a7787d9759a4e028447e9f4153b4a7c5eeb22dc64f0a169c86c3b31d93"
    },
    {
      "id": "tia-hmi-controls",
      "title": "WinCC 经典画面 controls",
      "tool": "tia_hmi_generate_screen_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "text_field",
        "button",
        "ActivateScreen",
        "navigate_to_screen",
        "io_field",
        "switch",
        "WinCC",
        "经典画面",
        "controls",
        "tia",
        "HMI",
        "生成器",
        "generator"
      ],
      "covers": [
        "text_field",
        "button",
        "classic_navigation",
        "io_field",
        "switch"
      ],
      "path": "cases/tia-hmi-controls.json",
      "sha256": "822a2fef9c228be727ac4c9e60915875774cd26a5f31fd5a31323a825a37bb46",
      "contractHash": "5de4abc3305f27d48655b24da7717fae5df5c3c6753a1d68100de3c01cdff844"
    },
    {
      "id": "tia-hmi-drawing",
      "title": "WinCC 经典画面 drawing",
      "tool": "tia_hmi_generate_screen_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "line",
        "ellipse",
        "rectangle",
        "WinCC",
        "经典画面",
        "drawing",
        "tia",
        "HMI",
        "生成器",
        "generator"
      ],
      "covers": [
        "line",
        "ellipse",
        "rectangle"
      ],
      "path": "cases/tia-hmi-drawing.json",
      "sha256": "47c204f3870b09f8e9500dd8df8e457a2053749be0094a433afc4fed4995b5fb",
      "contractHash": "5de4abc3305f27d48655b24da7717fae5df5c3c6753a1d68100de3c01cdff844"
    },
    {
      "id": "tia-hmi-graphic-list",
      "title": "Classic HMI graphic-list offline shape",
      "tool": "tia_hmi_generate_list_xml",
      "route": "tia",
      "versions": [
        "V18"
      ],
      "language": "HMI",
      "keywords": [
        "HMI",
        "graphic-list",
        "list",
        "XML",
        "generator"
      ],
      "covers": [
        "graphic-list"
      ],
      "path": "cases/tia-hmi-graphic-list.json",
      "sha256": "af6fbd2aafee0d64ca399ee79e3ba643e9b9b2c7f553fbf451e79688190bdbcf",
      "contractHash": "bd56563ef230775f2f6b5866dcb09af1f78ca38016401d7cd7b48927e7d0d4aa"
    },
    {
      "id": "tia-hmi-indicators",
      "title": "WinCC 经典画面 indicators",
      "tool": "tia_hmi_generate_screen_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "lamp_circle",
        "lamp_rect",
        "bar",
        "WinCC",
        "经典画面",
        "indicators",
        "tia",
        "HMI",
        "生成器",
        "generator"
      ],
      "covers": [
        "lamp_circle",
        "lamp_rect",
        "bar"
      ],
      "path": "cases/tia-hmi-indicators.json",
      "sha256": "e853591d0cd1e7021236e49d2f7c64b045148bddfef55b0f247de2d5bd60ec24",
      "contractHash": "5de4abc3305f27d48655b24da7717fae5df5c3c6753a1d68100de3c01cdff844"
    },
    {
      "id": "tia-hmi-lists",
      "title": "WinCC 经典文本列表 / 图形列表（含条目）",
      "tool": "tia_hmi_generate_list_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "text-list",
        "graphic-list",
        "文本列表",
        "图形列表",
        "条目",
        "EntryType",
        "From",
        "To",
        "WinCC",
        "经典",
        "tia",
        "HMI",
        "生成器",
        "generator"
      ],
      "covers": [
        "text-list",
        "graphic-list",
        "entries",
        "From/To range",
        "SingleValue",
        "Range"
      ],
      "path": "cases/tia-hmi-lists.json",
      "sha256": "d75fa9d5c53f3c0e889a3c9f7736eaef2e13bef691a17f49da33af0bfdb4a910",
      "contractHash": "bd56563ef230775f2f6b5866dcb09af1f78ca38016401d7cd7b48927e7d0d4aa"
    },
    {
      "id": "tia-hmi-pump-overview-page",
      "title": "Classic 800×480 双泵补水整页监视：分区、统一字号、只读数值和反馈灯",
      "tool": "tia_hmi_generate_screen_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "整页",
        "精美",
        "画面",
        "布局",
        "双泵",
        "只读",
        "监视",
        "full page",
        "HMI",
        "Classic"
      ],
      "covers": [
        "full_page_layout",
        "text_field",
        "io_field",
        "lamp_rect",
        "rectangle",
        "shape_fill"
      ],
      "path": "cases/tia-hmi-pump-overview-page.json",
      "sha256": "7d8e0fef7e3c4279dffd71a881f63a9b59b5b2829a593d62e9aab3f3f550545d",
      "contractHash": "5de4abc3305f27d48655b24da7717fae5df5c3c6753a1d68100de3c01cdff844"
    },
    {
      "id": "tia-hmi-text-list",
      "title": "Classic HMI text-list offline shape",
      "tool": "tia_hmi_generate_list_xml",
      "route": "tia",
      "versions": [
        "V18"
      ],
      "language": "HMI",
      "keywords": [
        "HMI",
        "text-list",
        "list",
        "XML",
        "generator"
      ],
      "covers": [
        "text-list"
      ],
      "path": "cases/tia-hmi-text-list.json",
      "sha256": "82500285c0b74a33d2b87b9f0dc4279ba1131f273a89febc1fe55fb1028946e5",
      "contractHash": "bd56563ef230775f2f6b5866dcb09af1f78ca38016401d7cd7b48927e7d0d4aa"
    },
    {
      "id": "tia-hmi-views",
      "title": "WinCC 经典画面 views",
      "tool": "tia_hmi_generate_screen_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "HMI",
      "keywords": [
        "graphic_view",
        "graphic_io_field",
        "symbolic_io_field",
        "date_time_field",
        "user_view",
        "WinCC",
        "经典画面",
        "views",
        "tia",
        "HMI",
        "生成器",
        "generator"
      ],
      "covers": [
        "graphic_view",
        "graphic_io_field",
        "symbolic_io_field",
        "date_time_field",
        "user_view"
      ],
      "path": "cases/tia-hmi-views.json",
      "sha256": "e3af55ec76f0d86e73bc3ef939d9099f468a716e39959a020a452b7e3be00771",
      "contractHash": "5de4abc3305f27d48655b24da7717fae5df5c3c6753a1d68100de3c01cdff844"
    },
    {
      "id": "tia-lad-calc",
      "title": "Calc 公式使用 IN1/IN2/IN3",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "instruction_box",
        "Calc",
        "公式使用",
        "IN1/IN2/IN3",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "instruction_box",
        "Calc"
      ],
      "path": "cases/tia-lad-calc.json",
      "sha256": "0877c312eb7aa581f13d2ba0e387bd73340650a2f0d4799590ef4bfbca213a74",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-chain",
      "title": "比较结果串联使能 Move",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "chain",
        "series-boxes",
        "比较结果串联使能",
        "Move",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "chain",
        "series-boxes"
      ],
      "path": "cases/tia-lad-chain.json",
      "sha256": "8779c0d232005ba2ed2d0d3bac62cb680e4e3fe550fb5e63dd5c1f476038d956",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-classic-ob",
      "title": "S7-300 循环 OB 与全局信号",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "negation",
        "串联与取反：A",
        "且非",
        "B",
        "tia",
        "LAD",
        "生成器",
        "generator",
        "OB",
        "循环",
        "经典"
      ],
      "covers": [
        "OB",
        "ProgramCycle",
        "classic-ob"
      ],
      "path": "cases/tia-lad-classic-ob.json",
      "sha256": "9df95022099ff1bf553341098a3cd58b4512528311b8059a10e88f7afba9911b",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-ctu",
      "title": "计数器的动力流与数据端口",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "instruction_box",
        "counter",
        "named-ports",
        "计数器的动力流与数据端口",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "instruction_box",
        "counter",
        "named-ports"
      ],
      "path": "cases/tia-lad-ctu.json",
      "sha256": "d05c5d4fa44b44cef38785e14bf373b3f391fe4c987c1a4266688fe374a9803d",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-fanout",
      "title": "共同条件驱动多个终端",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "chain",
        "fanout",
        "共同条件驱动多个终端",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "chain",
        "fanout"
      ],
      "path": "cases/tia-lad-fanout.json",
      "sha256": "99d95783190d9d17a8efaa24f24d525584c2e25cbc78573288fc5554867682b3",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-fc",
      "title": "无静态实例的 LAD FC",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "negation",
        "串联与取反：A",
        "且非",
        "B",
        "tia",
        "LAD",
        "生成器",
        "generator",
        "FC"
      ],
      "covers": [
        "FC"
      ],
      "path": "cases/tia-lad-fc.json",
      "sha256": "519903b158bdb07e09374889b7d67e18fb3c681e261dcda70c21e8eff543492e",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-inout",
      "title": "调用真实 FB 接口中的 IN_OUT 参数",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "fb_call",
        "inout",
        "callee-interface",
        "调用真实",
        "FB",
        "接口中的",
        "IN_OUT",
        "参数",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "fb_call",
        "inout",
        "callee-interface"
      ],
      "path": "cases/tia-lad-inout.json",
      "sha256": "8968b9678227efcb6c0715c39e989bc73536c428c0f322a0d8c0c21ebdf8d6d9",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-motor",
      "title": "启动、自保、点动三支路与共同停止条件",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "three-branches",
        "seal-in",
        "jog",
        "stop-priority",
        "启动、自保、点动三支路与共同停止条件",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "three-branches",
        "seal-in",
        "jog",
        "stop-priority"
      ],
      "path": "cases/tia-lad-motor.json",
      "sha256": "9302a85de217fcba1fda1a05388a5cca78e0ee1babe44a1b420c0ee4972f497d",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-move",
      "title": "常量赋值到两个输出",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "move",
        "constant",
        "常量赋值到两个输出",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "move",
        "constant"
      ],
      "path": "cases/tia-lad-move.json",
      "sha256": "47bbfd3a448097579e274240f690fef3f53d547755e9d673a61add170cc98b33",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-nested",
      "title": "嵌套并联：(A 或 B) 且 C，另一路 D",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "nested-branches",
        "嵌套并联：(A",
        "或",
        "B)",
        "且",
        "C，另一路",
        "D",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "nested-branches"
      ],
      "path": "cases/tia-lad-nested.json",
      "sha256": "c02c7e8293a297afa93d9475947bc258676a430e74c0280b80770a0e8020f667",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-optimized-ob",
      "title": "S7-1500 循环 OB 与全局信号",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "negation",
        "串联与取反：A",
        "且非",
        "B",
        "tia",
        "LAD",
        "生成器",
        "generator",
        "OB",
        "循环",
        "优化"
      ],
      "covers": [
        "OB",
        "ProgramCycle",
        "optimized-ob"
      ],
      "path": "cases/tia-lad-optimized-ob.json",
      "sha256": "b04e6a28493d171c78698ca96605b0f7550b350544f4f49d652e727590dc44a2",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-parallel",
      "title": "两个并联入口",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "parallel",
        "两个并联入口",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "parallel"
      ],
      "path": "cases/tia-lad-parallel.json",
      "sha256": "1348216e0cde553edd2701f655dcc87e61bdcd0b44e55d011cc10af2f113c114",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-reset",
      "title": "条件驱动置位/复位线圈 RCoil",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "reset-coil",
        "条件驱动置位/复位线圈",
        "RCoil",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "reset-coil"
      ],
      "path": "cases/tia-lad-reset.json",
      "sha256": "5ce10b5824f090e063f7a88c0c3c004c20476bb7ba70bcfb73551f05ab8dbc9e",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-series",
      "title": "串联与取反：A 且非 B",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "series",
        "negation",
        "串联与取反：A",
        "且非",
        "B",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "series",
        "negation"
      ],
      "path": "cases/tia-lad-series.json",
      "sha256": "86a183797cacd8073aaa0d5fd68ed482a56b49c0d025ef7b4ed86a0bde80577d",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-set",
      "title": "条件驱动置位/复位线圈 SCoil",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "contact_coil",
        "set-coil",
        "条件驱动置位/复位线圈",
        "SCoil",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact_coil",
        "set-coil"
      ],
      "path": "cases/tia-lad-set.json",
      "sha256": "c88f115b6b63906ee68f9c3dd6b4249174995ebe6061327d45a5c47b766e1012",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-tof",
      "title": "TOF 定时器与实例",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "timer",
        "TOF",
        "定时器与实例",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer",
        "TOF"
      ],
      "path": "cases/tia-lad-tof.json",
      "sha256": "b3d3bb69bfdc6cd6d8526818465282c9bdbeebf0d29117635418e273da41a305",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-ton",
      "title": "TON 定时器与实例",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "timer",
        "TON",
        "定时器与实例",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer",
        "TON"
      ],
      "path": "cases/tia-lad-ton.json",
      "sha256": "6338db704b2077f9e62f5c0ca4aaa8a99653337196e45749adf52f330a79f6fa",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-tonr",
      "title": "TONR 定时器与实例",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "timer",
        "TONR",
        "定时器与实例",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer",
        "TONR"
      ],
      "path": "cases/tia-lad-tonr.json",
      "sha256": "1acb53cd54134d757ce6ad246fca3de1b823a25720774f98c1c74e063318665e",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-lad-tp",
      "title": "TP 定时器与实例",
      "tool": "tia_lad_generate_block_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "timer",
        "TP",
        "定时器与实例",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer",
        "TP"
      ],
      "path": "cases/tia-lad-tp.json",
      "sha256": "5904ecd7826d344eff852b7f8d96cfe9d79b18d399c5179d7247e0a8d31f64c5",
      "contractHash": "0e273628c96e0d5b04bb7a0e14a06b8530a74c30d590616a904cdfaf41ce5fa9"
    },
    {
      "id": "tia-recipe-alarm-horn-silence",
      "title": "报警蜂鸣消音 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "alarm_horn_silence",
        "报警蜂鸣消音",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "alarm_horn_silence"
      ],
      "path": "cases/tia-recipe-alarm-horn-silence.json",
      "sha256": "29ff15b05053d1296a5fd72dbf358a18fc8db10c6630dbbd635eaf9b09323a3b",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-analog-scale-chain",
      "title": "模拟量缩放链 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "analog_scale_chain",
        "模拟量缩放链",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "analog_scale_chain"
      ],
      "path": "cases/tia-recipe-analog-scale-chain.json",
      "sha256": "ce63520b7bdb03497742f41bf540ba4903b2d28b35df1caa9aa6deaa0a27760a",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-boolean-step-sequence",
      "title": "布尔步序 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "boolean_step_sequence",
        "布尔步序",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "boolean_step_sequence"
      ],
      "path": "cases/tia-recipe-boolean-step-sequence.json",
      "sha256": "be8a160ba714e7136c9d18fe0db05bbf08c76ac6421bfdfb18bd07c9b12325de",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-compound-interlock",
      "title": "复合互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "compound_interlock",
        "复合互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "compound_interlock"
      ],
      "path": "cases/tia-recipe-compound-interlock.json",
      "sha256": "2dff602b19552a1ab4ba9ce1f3b0284d953df26391159771e958aa389ce48c2d",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-compressor-permissive-run",
      "title": "压缩机许可 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "compressor_permissive_run",
        "压缩机许可",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "compressor_permissive_run"
      ],
      "path": "cases/tia-recipe-compressor-permissive-run.json",
      "sha256": "e79802742d9658bd3012fdad85f9dc6406ff562d8470ebe0cd4f8feca60f176e",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-conveyor-zone-interlock",
      "title": "输送分区互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "conveyor_zone_interlock",
        "输送分区互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "conveyor_zone_interlock"
      ],
      "path": "cases/tia-recipe-conveyor-zone-interlock.json",
      "sha256": "e6c8027a195aba4b176a11041d6bd09af0dc468c380aafaa892923239ffa8670",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-device-three-state-monitor",
      "title": "设备三态监视 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "device_three_state_monitor",
        "设备三态监视",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "device_three_state_monitor"
      ],
      "path": "cases/tia-recipe-device-three-state-monitor.json",
      "sha256": "235e61760aa93b1b43633b5f785c39c4dbc2f39a2171ec286200fb66ca09f862",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-discrete-tank-level",
      "title": "离散液位 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "discrete_tank_level",
        "离散液位",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "discrete_tank_level"
      ],
      "path": "cases/tia-recipe-discrete-tank-level.json",
      "sha256": "1a9a01b3e6c695c4d6370f23fe46ee513259a8caa3c1cc0b29dde87568e0e377",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-diverter-gate-interlock",
      "title": "分流门互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "diverter_gate_interlock",
        "分流门互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "diverter_gate_interlock"
      ],
      "path": "cases/tia-recipe-diverter-gate-interlock.json",
      "sha256": "dbbb0a1c9d762c308e41148916509f89e952e7e02fe788d6524760097a9ff132",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-door-lock-permissive",
      "title": "门锁许可 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "door_lock_permissive",
        "门锁许可",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "door_lock_permissive"
      ],
      "path": "cases/tia-recipe-door-lock-permissive.json",
      "sha256": "9202f171daa7683ca298b43109e058e9998fde49eeb43b3fac35d9c4461d4c2f",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-edge-triggered-impulse",
      "title": "边沿脉冲 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "edge_triggered_impulse",
        "边沿脉冲",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "edge_triggered_impulse"
      ],
      "path": "cases/tia-recipe-edge-triggered-impulse.json",
      "sha256": "c4b94e75895499c537eca401a8d993ab093d959bda086ff25de894a54cb75612",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-fault-latch-acknowledge",
      "title": "故障锁存与确认 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "fault_latch_acknowledge",
        "故障锁存与确认",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "fault_latch_acknowledge"
      ],
      "path": "cases/tia-recipe-fault-latch-acknowledge.json",
      "sha256": "7c0e0bb511196678aa84830b6064cb7df7d602cc7d15de465b5bb5503d4fc18a",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-forward-reverse-interlock-timed",
      "title": "带换向延时的正反转 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "forward_reverse_interlock_timed",
        "带换向延时的正反转",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "forward_reverse_interlock_timed"
      ],
      "path": "cases/tia-recipe-forward-reverse-interlock-timed.json",
      "sha256": "b4b77b97d0c31182f3e2ebcb4cb1ce8dd292d2ba675914e66c1fdaa6b5c46542",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-forward-reverse-interlock",
      "title": "正反转互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "forward_reverse_interlock",
        "正反转互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "forward_reverse_interlock"
      ],
      "path": "cases/tia-recipe-forward-reverse-interlock.json",
      "sha256": "75e82fb86e3d3192c6eaa030257c7c44ba3551dea88159c776fbf69f61d673f3",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-hoist-up-down-interlock",
      "title": "升降互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "hoist_up_down_interlock",
        "升降互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "hoist_up_down_interlock"
      ],
      "path": "cases/tia-recipe-hoist-up-down-interlock.json",
      "sha256": "dfd5ead1e243a2fee002bbedf44dc8bfbf9f433d8bfedae714f44a2200b7bfd0",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-hydraulic-clamp-unclamp",
      "title": "液压夹紧松开 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "hydraulic_clamp_unclamp",
        "液压夹紧松开",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "hydraulic_clamp_unclamp"
      ],
      "path": "cases/tia-recipe-hydraulic-clamp-unclamp.json",
      "sha256": "5e49a39e240b1533d7bd6c946d51b468c66d564bf9c159aeab21dd08170df3f0",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-material-feeder-interlock",
      "title": "送料互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "material_feeder_interlock",
        "送料互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "material_feeder_interlock"
      ],
      "path": "cases/tia-recipe-material-feeder-interlock.json",
      "sha256": "9518361d28d01ffcc59c8b4e95ee7e7e35997b9fe543068704f56cf889c43996",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-mixer-agitator-permissive",
      "title": "搅拌机许可 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "mixer_agitator_permissive",
        "搅拌机许可",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "mixer_agitator_permissive"
      ],
      "path": "cases/tia-recipe-mixer-agitator-permissive.json",
      "sha256": "fdbcfd1993dae7b4cee285dd1a6950030793b0805c1a8ef4cfb62eb42bb95e40",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-mode-auto-manual-jog",
      "title": "自动手动点动 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "mode_auto_manual_jog",
        "自动手动点动",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "mode_auto_manual_jog"
      ],
      "path": "cases/tia-recipe-mode-auto-manual-jog.json",
      "sha256": "f8d1e69a105dd89cf032fbf2854dd0c1063ae669c8bd94d5c4eb4fc7591b4041",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-motor-start-stop-seal-in",
      "title": "电机启停自保 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "motor_start_stop_seal_in",
        "电机启停自保",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "motor_start_stop_seal_in"
      ],
      "path": "cases/tia-recipe-motor-start-stop-seal-in.json",
      "sha256": "c6a640b69471fd4a012364580969b75ffc8ac989e01b38e2ab0df67242c35e87",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-permissive-chain-enable",
      "title": "许可链 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "permissive_chain_enable",
        "许可链",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "permissive_chain_enable"
      ],
      "path": "cases/tia-recipe-permissive-chain-enable.json",
      "sha256": "3f57e73ca151c875a649bfb10a0f8366a4ef72a97d1743236a659963b1e859e0",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-pump-duty-standby-alternating",
      "title": "泵轮换主备 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "pump_duty_standby_alternating",
        "泵轮换主备",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "pump_duty_standby_alternating"
      ],
      "path": "cases/tia-recipe-pump-duty-standby-alternating.json",
      "sha256": "8ec0619a45f6cf34dfa474e04ebc5eb1a9383fed5d6949da1fcab58cf9bc8341",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-pump-duty-standby-basic",
      "title": "泵主备基本控制 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "pump_duty_standby_basic",
        "泵主备基本控制",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "pump_duty_standby_basic"
      ],
      "path": "cases/tia-recipe-pump-duty-standby-basic.json",
      "sha256": "ab6215d7ad4e0e8d600d111cead805b4582e677d610848161a4775b57dfb910b",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-runtime-accumulator-tonr",
      "title": "运行时间累计 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "runtime_accumulator_tonr",
        "运行时间累计",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "runtime_accumulator_tonr"
      ],
      "path": "cases/tia-recipe-runtime-accumulator-tonr.json",
      "sha256": "893b75901385def384c42729e624a39fefb328a7dc2173e15561d138939335a3",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-star-delta-basic-interlock",
      "title": "星三角互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "star_delta_basic_interlock",
        "星三角互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "star_delta_basic_interlock"
      ],
      "path": "cases/tia-recipe-star-delta-basic-interlock.json",
      "sha256": "d78958f043601f843711f89ccd65dcdaa085af76fc29fc00b6e5cc14119e0f18",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-star-delta-timed",
      "title": "定时星三角 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "star_delta_timed",
        "定时星三角",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "star_delta_timed"
      ],
      "path": "cases/tia-recipe-star-delta-timed.json",
      "sha256": "80740796882e472d1d280101c375806fab7b8359366417c6fb29d7d95ceec1f7",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-station-auto-cycle-gates",
      "title": "工位自动循环门控 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "station_auto_cycle_gates",
        "工位自动循环门控",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "station_auto_cycle_gates"
      ],
      "path": "cases/tia-recipe-station-auto-cycle-gates.json",
      "sha256": "c5e43aa3acc358f332284d4e1107fb802633f9e8bc7923f9e9743d6c8b880106",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-step-sequencer",
      "title": "数值步序 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "step_sequencer",
        "数值步序",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "step_sequencer"
      ],
      "path": "cases/tia-recipe-step-sequencer.json",
      "sha256": "79bf1314a53a73aff50367563f0f41f62709c032a03612b9684217cdfe1e083a",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-tp-pulse-output",
      "title": "定宽脉冲 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "tp_pulse_output",
        "定宽脉冲",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "tp_pulse_output"
      ],
      "path": "cases/tia-recipe-tp-pulse-output.json",
      "sha256": "71e5c1c36a09d5d17547ead67284f19bf55b8c4530f82e98f6457fd42706631c",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-traffic-light-sequence",
      "title": "交通灯步序 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "traffic_light_sequence",
        "交通灯步序",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "traffic_light_sequence"
      ],
      "path": "cases/tia-recipe-traffic-light-sequence.json",
      "sha256": "bf14ae06621744fb2933b42a72aec8fba0cf9567c411e9a467edacc347bbaf31",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-valve-open-close-interlock",
      "title": "阀开关互锁 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "valve_open_close_interlock",
        "阀开关互锁",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "valve_open_close_interlock"
      ],
      "path": "cases/tia-recipe-valve-open-close-interlock.json",
      "sha256": "fbccfc14845389f5c5fe67937ed82ac4d94e9e4716ef5622134126d40d3e79f1",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-valve-priority-control",
      "title": "阀优先控制 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "valve_priority_control",
        "阀优先控制",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "valve_priority_control"
      ],
      "path": "cases/tia-recipe-valve-priority-control.json",
      "sha256": "3504fc246b5e1dbfcb949c69f66e2925ff72e3ad337e54e4c747fc25308b560a",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-recipe-vent-after-run-tof",
      "title": "通风延后停止 recipe",
      "tool": "tia_lad_generate_recipe_plan",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "LAD",
      "keywords": [
        "vent_after_run_tof",
        "通风延后停止",
        "recipe",
        "tia",
        "LAD",
        "生成器",
        "generator"
      ],
      "covers": [
        "vent_after_run_tof"
      ],
      "path": "cases/tia-recipe-vent-after-run-tof.json",
      "sha256": "c2a5394485d079da9ced55a0c4e047f6f684d58a2a8fdd84bb4e4c07445bc985",
      "contractHash": "8cb0c03ac724f72156514b88db48368e4d5936a9ee5637d4528dc08c0942c6f1"
    },
    {
      "id": "tia-sd-box",
      "title": "SD 命名参数函数框",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "box",
        "SD",
        "命名参数函数框",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "box"
      ],
      "path": "cases/tia-sd-box.json",
      "sha256": "866022be8ff58529d58d26e859fa2d110b08f02f21a7c88d12cf0959449b60eb",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-call",
      "title": "SD 外部 FC 调用",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "call",
        "SD",
        "外部",
        "FC",
        "调用",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "call"
      ],
      "path": "cases/tia-sd-call.json",
      "sha256": "88a2002e3069714a647ac6ca2709537716360b08f61cbb235d0403987d8ea90b",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-compare",
      "title": "SD 比较",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "compare",
        "SD",
        "比较",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "compare"
      ],
      "path": "cases/tia-sd-compare.json",
      "sha256": "43bd0f199076b22fbe7a18c204a6527b492768e96a64350c08a72ec18065e403",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-contacts",
      "title": "SD 接点、反相及线圈",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "contact",
        "i_contact",
        "coil",
        "SD",
        "接点、反相及线圈",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "contact",
        "i_contact",
        "coil"
      ],
      "path": "cases/tia-sd-contacts.json",
      "sha256": "89ed3a2d51e19891600467d0063b4d8000e960249c689c267ae1a487e75f9d20",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-counter",
      "title": "SD CTU 计数",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "counter",
        "SD",
        "CTU",
        "计数",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "counter"
      ],
      "path": "cases/tia-sd-counter.json",
      "sha256": "b5506a28cd715ab686e759832217e2271607f43fd73357c47cc89655e35d178c",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-edge",
      "title": "SD 上升沿接点及持久边沿位",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "edge_contact",
        "SD",
        "上升沿接点及持久边沿位",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "edge_contact"
      ],
      "path": "cases/tia-sd-edge.json",
      "sha256": "acb0366c0dfca39dad8190a8e6d9fce0f8b067fad2146a9e17ad59218b455910",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-fc",
      "title": "SD FC 块接口",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "contact",
        "i_contact",
        "coil",
        "SD",
        "接点、反相及线圈",
        "tia",
        "生成器",
        "generator",
        "FC"
      ],
      "covers": [
        "FC"
      ],
      "path": "cases/tia-sd-fc.json",
      "sha256": "56eecb3de7fdc2cda2b40d8486b5cd65667201c61fd8820b7d32b80822ef69ce",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-instr",
      "title": "SD 目录指令的绑定",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "instr",
        "SD",
        "目录指令的绑定",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "instr"
      ],
      "path": "cases/tia-sd-instr.json",
      "sha256": "d469a9385d194f0800278628708e12aca6d105776e6bc9cf16b28db100c61b32",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-latch",
      "title": "SD 置位后复位的扫描顺序",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "s_coil",
        "r_coil",
        "SD",
        "置位后复位的扫描顺序",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "s_coil",
        "r_coil"
      ],
      "path": "cases/tia-sd-latch.json",
      "sha256": "241ad575e3b2e03883769c4cd3edde4fdce608e4d0f27030cbb884bf5e1a12d9",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-math",
      "title": "SD 二元数学",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "math",
        "SD",
        "二元数学",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "math"
      ],
      "path": "cases/tia-sd-math.json",
      "sha256": "d015efbea830423bc3237273efe4854ad13f5b99064a001a5d9b8f5159fd80b8",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-move",
      "title": "SD 多目标 Move",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "move",
        "SD",
        "多目标",
        "Move",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "move"
      ],
      "path": "cases/tia-sd-move.json",
      "sha256": "41694107196746b7e790d875192c5440cce91a899e84ff6d81e4f45c98377f0c",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-ob",
      "title": "SD OB 块接口",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "contact",
        "i_contact",
        "coil",
        "SD",
        "接点、反相及线圈",
        "tia",
        "生成器",
        "generator",
        "OB"
      ],
      "covers": [
        "OB"
      ],
      "path": "cases/tia-sd-ob.json",
      "sha256": "0927e86e97da2a8eaaaaa7599fda2ebc0c5d206f0f8289fd3d8a59555e0c2ca1",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-parallel",
      "title": "SD 高层并联自动展开 wire#",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "wire",
        "parallel",
        "SD",
        "高层并联自动展开",
        "wire#",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "wire",
        "parallel"
      ],
      "path": "cases/tia-sd-parallel.json",
      "sha256": "ec46fee0cee670b4132434366fe73ede0257293a3a5463ba2df5dae92072e6ee",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-range",
      "title": "SD 区间判断",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "range",
        "SD",
        "区间判断",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "range"
      ],
      "path": "cases/tia-sd-range.json",
      "sha256": "a28a0d6a4d871178d3c5961947569b4bb9ba1240c4fecf6263c65ea7a7825b43",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-timer",
      "title": "SD TON 动力输入",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "timer",
        "SD",
        "TON",
        "动力输入",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "timer"
      ],
      "path": "cases/tia-sd-timer.json",
      "sha256": "77476942577710bfbb83b7f2c0a73b4630ff2d19f63b80a2698d3051518f43e2",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-sd-unary",
      "title": "SD 单输入数学",
      "tool": "tia_sd_generate_block",
      "route": "tia",
      "versions": [
        "V20",
        "V21"
      ],
      "language": "SD",
      "keywords": [
        "unary_math",
        "SD",
        "单输入数学",
        "tia",
        "生成器",
        "generator"
      ],
      "covers": [
        "unary_math"
      ],
      "path": "cases/tia-sd-unary.json",
      "sha256": "9656cbcac40556dd48720ead56d8677ed1b1a1b74c1e4c076bfc2c27d01f7270",
      "contractHash": "b97ddb65d4ea1a18dba597e01828476209bf4481e281fbb4121d55528d7de0b9"
    },
    {
      "id": "tia-watch-absolute",
      "title": "绝对地址监控表",
      "tool": "tia_watch_generate_table_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "WATCH",
      "keywords": [
        "absolute",
        "绝对地址监控表",
        "tia",
        "WATCH",
        "生成器",
        "generator"
      ],
      "covers": [
        "absolute"
      ],
      "path": "cases/tia-watch-absolute.json",
      "sha256": "4c08f9aee6c28f9674c3c77ad2bdb1a0c503f6486f2c822b96971e260083f393",
      "contractHash": "132e7a1430aa2765cfbc28c523d863eb285a1edc707e4711b91e675f8bc39f9f"
    },
    {
      "id": "tia-watch-format",
      "title": "监控表格式与触发",
      "tool": "tia_watch_generate_table_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "WATCH",
      "keywords": [
        "format",
        "trigger",
        "监控表格式与触发",
        "tia",
        "WATCH",
        "生成器",
        "generator"
      ],
      "covers": [
        "format",
        "trigger"
      ],
      "path": "cases/tia-watch-format.json",
      "sha256": "51869e87b04faa60d0d86db2ba60b671cb85c24010a41ffc715ce2c831cf1bb5",
      "contractHash": "132e7a1430aa2765cfbc28c523d863eb285a1edc707e4711b91e675f8bc39f9f"
    },
    {
      "id": "tia-watch-symbolic",
      "title": "符号监控表",
      "tool": "tia_watch_generate_table_xml",
      "route": "tia",
      "versions": [
        "V16",
        "V17",
        "V18",
        "V19",
        "V20",
        "V21"
      ],
      "language": "WATCH",
      "keywords": [
        "symbolic",
        "符号监控表",
        "tia",
        "WATCH",
        "生成器",
        "generator"
      ],
      "covers": [
        "symbolic"
      ],
      "path": "cases/tia-watch-symbolic.json",
      "sha256": "1e8e3f0e0712c1dc7c4fbce937b5f66f11abc145de5b77b154fe354237189370",
      "contractHash": "132e7a1430aa2765cfbc28c523d863eb285a1edc707e4711b91e675f8bc39f9f"
    }
  ]
}
