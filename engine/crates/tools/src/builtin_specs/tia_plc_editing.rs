//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\tia_plc_editing.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: constpump_station_control, recipeinstructionnetworks
//!
//! 契约线索（截断）:
//!   codesys_read_project_outlineList readable program objects in the active project on both CODESYS lines: exact paths, declaration/implementation availability and sizes, language and 
//!   codesys_lad_list_program_recipesList reusable verified InoProShop LAD program recipes, including the high-level pump station control composition.
//!   recipeinstructionnetworks
//!   codesys_lad_generate_recipe_planBuild a structured native InoProShop LAD generation plan from a verified recipe. The recipe name must ALREADY be in codesys_lad_list_program_recipes
//!   constpump_station_control
//!   taskExact existing task name, for example MainTask; omit if task wiring is handled separately.
//!   signalsOptional signal-name overrides for mode_auto,start,stop,e_stop,low_level,high_level,run_feedback,overload,fault_reset,pump_output,alarm_output.
//!   timeoutIEC TIME literal, default T#3S.
//!   codesys_lad_generate_control_recipeCompose a complete pump station contact/timer plan from a high-level control recipe. Returns one ready request for codesys_lad_generate_contact_b

// TODO: 依上列契约实现 `tia_plc_editing` 模块。
