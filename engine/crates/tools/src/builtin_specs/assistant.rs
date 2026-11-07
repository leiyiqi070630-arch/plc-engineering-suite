//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\assistant.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: formaturi, goalbehavior
//!
//! 契约线索（截断）:
//!   advanced_cpu_typeOptional: exact supportedCpuTypes value from tia_plcsim_advanced_status, when a PLCSIM Advanced route is a candidate.
//!   advanced_runtime_majorOptional: tia_plcsim_advanced_status.versionMajor.6I)C
//!   Optional: the exact CPU device name from tia_openness_list_devices. Supplying it lets the plan fill device_name and instance_name into the emitted steps.
//!   Optional: the project file path when it is not open yet. Adds the release-pinned open step and checks the 143-character Openness path limit before anything is attempted.
//!   goalbehavior
//!   What must be true at the end: behavior (default — prove what the program computes), run (reach RUN with the program downloaded), or values (read/write process values on a running s
//!   tia_plcsim_planUse: Read-only route/steps for ONE CPU; starts no process.
//!   When: Call when a simulation step is actually next; create the project and place/read the CPU first. If only the route metadata is missing, omitted fields return discovery calls; r
//!   Avoid: This is not a task-starting survey; no duplicate standard_status or plant-wide verdict from one CPU.
//!   Next: Follow verdict, blockers, alternatives, successCriterion and any timing/onFailure. List devices and plan each CPU separately.crates\tools\src\builtin_specs\codesys_evidence.r
//!   codesys_lad_find_template_evidenceRead verification evidence for one InoProShop instruction generator.crates\tools\src\builtin_specs\assistant.rs

// TODO: 依上列契约实现 `assistant` 模块。
