# PLC 精华片段库

> 从 20 个开源西门子 PLC 项目提炼的 **99 个代码文件**,按 PLC 工程场景组织。
> 文件名即用途;用哪个拿哪个。来源与许可见 `LICENSE.md`。
>
> **2026-09-09 增补**：新增 3 类**真实工程**语料（本机实机读取，不是开源二手代码）——
> `片段/10_西门子SCL真实工程/`（84 个 SCL，来自 TIA V17 工程 `示例程序.ap17`，S7-1500 标准程序模板：LGF 轴/驱动 FB、气缸 FB 家族、位统计、模拟量滤波、排序工具、顺序 GET/PUT、立库管理…）、
> `片段/11_CODESYS_ST真实工程/`（18 个 ST，来自汇川 AM600 厂商例程 + CODESYS SoftMotion 官方教程：MC_* 运动控制、PST 模式切换、CAM、CNC）、
> `LAD语料/CODESYS原生LAD/`（3 个 CODESYS 原生 LAD 导出：跑马灯、凸轮指令链、PLCopenMulti 引脚互链）。
> 三条线的蒸馏结论在 `../plc-experience-corpus/`：SCL 见 02 号 rp-a…rp-j，CODESYS/InoProShop 见 14/15 号。这些新条目在 INDEX.json 里 `tier=参考级`（依赖工程内的 UDT/库，单文件不可独立编译）。

## ⚠️ 质量状态(诚实分层,2026-08 实测)

| 状态 | 含义 | 覆盖 |
|---|---|---|
| ✅ **编译验证过** | 本机 TIA V21 导入编译 0 错误 | `08_官方指令演示` 全部 9 个 + 验证样例(边沿检测、三态开关) |
| 🟡 **自包含未验证** | 单文件完整、无外部依赖,未逐一编译 | 多数 SCL 片段(可批量验证,方法已跑通) |
| 🔶 **参考级** | 依赖项目内其他块/UDT/DB,单文件不可独立编译 | LLCCA_PID(需 Filter_PT1/DT1)、MQTT/MySQL 片段(需整套库)、KWT 各段、红绿灯 LAD(需实例DB+标签)、**10/11 号真实工程全部条目** |
| ⛔ **硬限制** | AWL/ST 片段——TIA V21 无 STL 编辑器,无法导入 | `07_算法与工具` 的 4 个 AWL(仅文字参考) |

> **用法建议**:✅ 直接复制导入;🟡 复制后编译,报错就修(多是类型/实例问题);🔶 当"算法与结构参考"而不是代码;⛔ 只读思路,或换 STEP7 Classic / V18- 使用。

## 场景覆盖矩阵

| 场景层 | 覆盖情况 |
|---|---|
| 程序组织(OB) | ✅ OB1 三段式 / 最小 OB1 / OB100ms / OB1(SCL) |
| 设备控制 | ✅ 阀(3种)/泵/风机/冷却塔/位置控制/液位标度/VFD 资料 |
| 信号处理 | ✅ 模拟量采集/标度/滤波/死区/边沿 |
| 过程控制 | ✅ PID 自整定/OSCAT PID/PI/PWM/一阶滞后/误差累加/仿真器 |
| 通信 | ✅ MQTT 全套/MySQL 客户端/SHA1/变长读写/Unix时间戳/OPC UA 数据映射/配方传输 |
| 运动控制 | ⚠️ 仅位置控制(两点/三点);伺服 MC_* 开源稀缺,见 README 说明 |
| 安全与可靠性 | ✅ 三态开关/急停环/软定时器/备份恢复/2oo3 |
| HMI 与数据 | ✅ 状态颜色/配方导入导出/数据备份 |
| 行业工艺 | ✅ 水箱液位/冷却塔/提升装置/装置循环 |

## 01_OB与程序骨架

| 片段 | 语言 | 来源 |
|---|---|---|
| OB1_主循环_系统应用调试三段式 | LAD | PS2001-PAL |
| OB1_调用功能块_全引脚接全局标签 | LAD | 红绿灯项目 |
| OB1主循环_SCL | SCL | SmartWaterTank |
| OB100ms周期中断 | LAD | PS2001-PAL |

## 02_设备控制

| 片段 | 语言 | 来源 |
|---|---|---|
| 隔离阀控制_联锁反馈行程监控 | LAD | PS2001-PAL |
| 三通阀控制 | LAD | PS2001-PAL |
| 阀门UDT_配置旁路与监控参数 | XML | PS2001-PAL |
| 泵UDT_命令反馈故障结构 | UDT | KWT-80621 |
| 风机UDT_命令反馈故障结构 | UDT | KWT-80621 |
| 冷却塔循环 | SCL | KWT-80621 |
| 模拟量采集_标度报警链 | LAD | PS2001-PAL |
| 模拟量输入标度_原始值到工程值 | LAD | PS2001-PAL |
| 液位标度_量程转换 | SCL | SmartWaterTank |
| RTC定时事件_日历到点触发 | LAD | PS2001-PAL |
| 位置控制_两点式 | SCL | DIYPLC |
| 位置控制_三点式 | SCL | DIYPLC |
| 变频器VFD资料(9文件) | 文档 | KWT-80621 |

## 03_PID与滤波

| 片段 | 语言 | 来源 |
|---|---|---|
| PID自整定_CHR与ZN_条件抗积分饱和 | SCL | LLCCA_OpenPID |
| PID测试回路_与PID_Compact对照_FBD混合 | FBD | LLCCA_OpenPID |
| PID控制器_OSCAT风格 | SCL | TiaPidOscat |
| PI控制器_压力调节 | SCL | TiaPidOscat |
| 时钟发生器_脉宽调制PWM | SCL | TiaPidOscat |
| 中值滤波 | SCL | LLCCA_OpenPID |
| 模拟量滤波器 | SCL | DIYPLC |
| 一阶滞后过程模型 | SCL | LLCCA_OpenPID |
| 误差累加器 | SCL | LLCCA_OpenPID |
| 过程值仿真器 | SCL | LLCCA_OpenPID |

## 04_通信协议

| 片段 | 语言 | 来源 |
|---|---|---|
| MQTT客户端_协议核心 | SCL | MQTT-S7-1500 |
| MQTT发送_帧编码 | SCL | MQTT-S7-1500 |
| MQTT接收_帧解码 | SCL | MQTT-S7-1500 |
| MySQL客户端_主功能块 | SCL | S7-MySql-MariaDB |
| SHA1认证摘要 | SCL | S7-MySql-MariaDB |
| 长度编码字符串读写 | SCL | S7-MySql-MariaDB |
| Unix时间戳转换 | SCL | MQTT-S7-1500 |
| OPC UA_数字孪生数据映射 | SCL | ASRS-OPCUA-Twin |
| 配方导入导出 | SCL | SCL-Sources |

## 05_安全与操作员

| 片段 | 语言 | 来源 |
|---|---|---|
| 三态使能开关_示教器安全链 | SCL | SCL-Sources |
| 软定时器数组_601路状态机 | SCL | SCL-Sources |
| 软件边沿检测_正负沿FC | SCL | SCL-Sources |
| 时钟脉冲发生器 | SCL | SCL-Sources |
| 急停发光环 | SCL | SCL-Sources |
| 数据备份恢复 | SCL | SCL-Sources |

## 06_状态机与顺控

| 片段 | 语言 | 来源 |
|---|---|---|
| 四步交通灯状态机 | LAD | 红绿灯项目 |
| 自动模式段 | SCL | KWT-80621 |
| 手动模式段 | SCL | KWT-80621 |
| 急停段 | SCL | KWT-80621 |
| 常运行段_基础输出 | SCL | KWT-80621 |
| 模式选择器 | SCL | DIYPLC |
| 提升装置 | SCL | KWT-80621 |
| 装置循环 | SCL | KWT-80621 |
| 水箱液位控制 | SCL | SmartWaterTank |
| HMI状态颜色翻译 | SCL | KWT-80621 |

## 07_算法与工具

| 片段 | 语言 | 来源 |
|---|---|---|
| 实数取整 | AWL | STEP7-Classic-Algs |
| 实数转整数_四舍五入 | AWL | STEP7-Classic-Algs |
| 传感器2oo3表决冗余 | SCL | DIYPLC |
| 报警块 | SCL | DIYPLC |
| 16位转字 | SCL | DIYPLC |
| 环形缓冲 | SCL | SCL-Sources |
| 温度模拟 | SCL | SCL-Sources |
| 积分器 | SCL | DIYPLC |
| 死区 | SCL | DIYPLC |
| 延时N周期 | SCL | DIYPLC |
| 速率计算 | SCL | SmartWaterTank |

> ⚠️ 注:STEP7 仓库的"报警死区/实数值滞回"实为空壳(`// to be implemented...`),已从库中剔除——收库时未细读的教训。

## 08_官方指令演示(本机 V21 实测生成,编译 0 错误)

> 由本机 TIA V21(S7-1500 1511-1 PN)生成并编译通过的官方指令调用语料,`PLC指令语料` 工程保存于 `C:\Users\adou\_tia_projects\PLC指令语料`。

| 片段 | 内容 | 看点 |
|---|---|---|
| MB_CLIENT_ModbusTCP最小调用 | Modbus TCP 客户端最小调用 | DISCONNECT/MB_MODE/MB_DATA_ADDR 参数形态 |
| TSEND_C_S7通信最小调用 | S7 通信发送最小调用 | CONNECT/DATA/LEN(Variant)参数形态 |
| FB_通信指令_MB_CLIENT与TSEND_C调用 | 两指令合一的完整 FB | 通信指令与连接参数分离的写法 |
| 定时器计数器_TON_TP_TOF_CTU | 4 种 IEC 定时/计数指令 | TON/TP/TOF/CTU 实例化与调用 |
| 比较数学转换_MOVE_指令 | 比较/ABS/MAX/REAL_TO_INT/MOVE | 纯函数指令集 |
| TCON_IP_v4_连接参数DB | 连接描述 DB 声明初始化 | `TCON_IP_v4 := (InterfaceId:=64, ID:=1, ..., RemotePort:=UINT#502)` |
| 运动控制_MC_Power_MC_Home_MC_MoveAbsolute_MC_Reset | 定位轴完整控制 FB | MC_* 指令绑定工艺对象、轴实际值读取 |
| 运动系统OB_MC_Servo_OB91 | 系统运动 OB | 创建定位轴后系统自动生成 |
| 运动系统OB_MC_Interpolator_OB92 | 系统插补 OB | 同上 |

**实测语法要点(踩坑后验证)**:
- `RemotePort` 是 UInt,必须 `UINT#502`(裸 `502` 报 Invalid assignment)
- MB_CLIENT 必须有 `DISCONNECT`;TSEND_C **没有** DISCONNECT
- Variant 参数(CONNECT/DATA/MB_DATA_PTR)不能指向 `VAR_TEMP`
- 连接参数在 DB 声明时初始化,不要运行时给优化 DB 的 RemoteAddress 赋值

---

## 已知缺口(开源稀缺,如实说明)

| 场景 | 缺口原因 | 替代方案 |
|---|---|---|
| **Modbus RTU/TCP(PLC 端)** | TIA 自带 MB_CLIENT/MB_SERVER,开源很少自己写 | 用 TIA 指令 + 官方文档;需要时可从本机工程生成调用 XML 语料 |
| **运动控制 MC_*(伺服)** | 依赖工艺对象,开源项目几乎不传 | 用 TIA 自带 MC_Power/MC_MoveAbsolute + 本机 V21 技术对象 |
| **PROFINET IO / IO-Link 从站逻辑** | 设备 GSD 绑定,开源少 | Packt 教材(仅 PDF)+ 西门子官方示例 |
| **OPC UA 客户端(PLC 端)** | S7-1500 做 UA 客户端需库,开源极少 | 现有"OPC UA 数据映射"片段 + 西门子库 |

需要补哪个缺口,我可以在本机 V21 里生成对应官方指令的真实调用 XML 语料归档进来。
## 全局检索

- **INDEX.json**(机器可读,255 条,`plc_corpus_find` 读它):分类/文件/语言/关键词/一句话/等级——AI 或脚本一次读入建全图
- **INDEX.csv / INDEX.md**(201 条,片段子集的人读视图):分类/文件/关键词/一句话
- 09 模式单元文件头含 // 关键词: 行(中英文术语),可直接 grep
## LAD 语料(博图原生格式)

- **LAD语料/**:55 个文件 —— 高发模式 5 块(LAD XML + SD 双格式,已编译验证)+ PS2001 工业库 34 块 + 红绿灯教学 2 块 + **CODESYS原生LAD 3 块**(汇川 AM600/SoftMotion 真实工程的 vendor 原生导出,只作 LAD 形状参考,不可导入 TIA)
- SD = .s7dcl/.s7res 文本(V20/V21 原生);XML = SimaticML(可导入 V16-V21)
- 写 LAD/FBD 时优先参考本目录,而非 SCL 单元

## 真实工程 SCL / ST(2026-09-09 增补)

- **片段/10_西门子SCL真实工程/**(84 个 .scl):TIA V17 工程 `示例程序.ap17`(S7-1500 标准程序模板)经 Openness 导出 XML 后重建的 SCL 源码,含 LGF 轴控制 `LAxisCtrl_PosAxis`、SINA_POS/V90 驱动、气缸 FB 家族、模拟量滤波/批量处理、排序工具、顺序多区域 GET/PUT、立库管理等
- **片段/11_CODESYS_ST真实工程/**(18 个 .st):汇川 AM600 厂商例程(`Demo for AM600`)与 CODESYS SoftMotion 教程工程经常驻桥 `source.snapshot` 读出的 ST 源码,文件名前缀是来源工程
- 每个文件头部有 `// source:` 出处注释;蒸馏结论见 `../