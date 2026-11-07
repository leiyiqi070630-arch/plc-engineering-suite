//! 模块骨架
//! 模块路径: crates\tools\src\tia_openness_tools\hmi\tags.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//! CLI/参数: --target-name
//!
//! 契约线索（截断）:
//!   create-project-master-copy--object-path--library-folder-path--master-copy-name--create-folders
//!   list-library-master-copies
//!   open-project--project-path--start-new--authentication-mode--authentication-username--authentication-passwordcrates\tools\src\tia_openness_tools\project_lifecycle\lifecycle.rs
//!   close-project--save-before-close--discard-unsaved-changes--close-portal
//!   ensure-portal
//!   create-project--target-directorytarget_directory--project-nameproject_nameopen_new_portal_if_needed
//!   archive-projectarchive_directory--archive-directory--archive-namearchive_name--mode--save-before-archive´¥AC
//!   save-project-assave-as project path
//!   Save-as writes 'À
//!   o.ap<version>', and that full project-file path is what the limit applies to — not the target_directory alone.
//!   --target-name
//!   retrieve target_directoryThe retrieved project file is created BELOW this folder, so its own path is longer still.retrieve-project--project-open-mode
//!   tia_openness_create_hmi_tagan existing HMI tag tableProcessTagsa nonempty HMI tag nameMotorRunningcrates\tools\src\tia_openness_tools\hmi\tags.rs
//!   create-hmi-tag--table-name

// TODO: 依上列契约实现 `tags` 模块。
