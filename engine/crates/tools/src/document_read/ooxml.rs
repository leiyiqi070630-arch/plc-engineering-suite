//! 模块骨架
//! 模块路径: crates\tools\src\document_read\ooxml.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: stop_on_first_failureboolean
//!
//! 契约线索（截断）:
//!   stepsOrdered steps. Each step writes its stimuli, waits, then reads every expectation together. Timing is measured from the moment the stimuli reached the controller.
//!   cleanupDEF-012 — steps that ALWAYS run after the scenario, whatever its verdict. A failing step skips every later step, so a restore written as the last steps[] entry never ran (th
//!   stop_on_first_failureboolean
//!   Default true: stop at the first step that does not pass and report the rest as skipped. Set false to run the whole scenario and collect every failure. Both are legitimate â true 
//!   max_samples_per_stepUpper bound on readings per step (default 60, max 600). A hold or window that could not be observed to its end is reported as undersampled, never as a pass.´»>C
//!   Must be true: the scenario writes stimuli into the running controller.

// TODO: 依上列契约实现 `ooxml` 模块。
