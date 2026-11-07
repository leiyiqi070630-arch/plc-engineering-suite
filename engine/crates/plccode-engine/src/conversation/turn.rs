//! 模块骨架
//! 模块路径: src\conversation\turn.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! 错误码: MAX_TOOL_RESULT_MODEL_CHARS
//! 相关中文说明: 2 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   - **`sim.online action=stop` 顺带关闭仿真开关**:返回 `simulationMode.after=false` / `deviceSimulationMode=false`(R053 原文)。下一次 sim 调用前需重新 `codesys_sim_set on=true`。
//!   - **登录会话中 `object.delete` 必被厂商拒绝**:原文 `无法移除对象'PRG_PwmGen [...MainTask]'，因为该对象已经用于当前登录的设备`,R053 里以 `handler_error` 原样返回,模型只能自己从文本推断"先退出登录"。清理顺序仍是 **任务条目 → POU → GVL**,且前面必须先 `codesy
//!   - **边沿测量的锚定法(采样节拍)**:R053 实测每次采样约 **350–800 ms**。**刺激写入与该边沿的判定必须在同一步**——否则相位基线落在上一步的采样节拍上,`expectWithinMs` 的完成时刻不能当初值锚点;被测量时间要远大于节拍(该轮 0.1/0.2 Hz 才测准)。步级 `elapsedMs` = "写入 → 条件成立"的
//!   - **结果保真(修正 cs-sim-r049 的"已修"不够)**:R049 的去 `raw` 镜像 + 省略通过步观测**没有把响应压到阈值内**——L92 实测 20 步 × 4 断言 ⇒ 紧凑 14,611 字符 / 美化 **25,557 字符**,仍会触发引擎侧 `MAX_TOOL_RESULT_MODEL_CHARS = 12,000` 的**

// TODO: 依上列契约实现 `turn` 模块。
