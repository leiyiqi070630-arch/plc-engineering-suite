//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\inoproshop.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: object
//! 错误码: GX3_XML_CLASS, GX3_XML_DUPLICATE_DATA, GX3_XML_EMPTY, GX3_XML_EXECUTION, GX3_XML_LIMIT, GX3_XML_SOURCE, GX3_XML_TYPE
//!
//! 契约线索（截断）:
//!   initialstandbynoExecutionGX3_XML_EXECUTION: one program file must have one execution type
//!   GX3_XML_EXECUTION: program_file applies to programs with scan, initial, standby or noExecution executionÈ
//!   VarsTempVars
//!    accessSpecifier="private"
//!    constant="À
//!   'GX3_XML_CLASS: unsupported local class À
//!   GX3_XML_CLASS: program inputs/outputs belong in global tables
//!   GX3_XML_SOURCE: provide a nonempty ST body up to 262144 bytes
//!   GX3_XML_DUPLICATE_DATA: À
//!   GX3_XML_LIMIT: at most 256 data items per batch
//!   GX3_XML_EMPTY: provide program, label-table or structure changesÈ
//!   " orderWithinParamSet="À
//!   VariableComments3<VariableComments><Comment number="6"><CommentText>À+</CommentText></Comment></VariableComments>
//!   <Type><TypeName>À
//!   </TypeName></Type>
//!   "<InitialValue><SimpleValue value="À
//!   "/></InitialValue>
//!   <Address address="À
//!   GX3_XML_TYPE: every label needs data_type
//!   crates\tools\src\builtin_specs\inoproshop.rs
//!   propertiesadditionalPropertiescodesys_bridge_statusRead bridge, UI and open-project status.

// TODO: 依上列契约实现 `inoproshop` 模块。
