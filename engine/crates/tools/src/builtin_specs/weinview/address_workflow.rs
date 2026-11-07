//! 模块骨架
//! 模块路径: crates\tools\src\builtin_specs\weinview\address_workflow.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: expected_project_sha256
//! 相关中文说明: 2 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!    没有出现在已核实版本（11/2023，A5E03484625-AK）的方法/固件对照表里。若 CPU 返回 -32601，说明该固件确实没有这个方法；更新版手册或 S7-1200 G2 的单独手册可能已加入它，请以该 CPU 固件对应版本的手册为准
//!    çæä½åºä»¶è¦æ±ï¼Àgï¼ä¾æ® 11/2023 çãS7-1500 Web æå¡å¨åè½æåãA5E03484625-AK çæ¹æ³/åºä»¶å¯¹ç§è¡¨ï¼
//!   <htmlCPU 有响应，但返回的不是 JSON-RPC 报文对端不是 SIMATIC Web API，或中间有代理/网关改写了响应返回的是 HTML 页面：Web 服务器开着，但 API 访问没勾选，请求被转到了登录页/首页连到的不是 CPU，而是别的 Web 设备检查本机是否有 HTTP 代理拦截了内网地址该方法对应的read_diagnostics（T
//!   .cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_json-1.0.149\src\lexical\math.rs
//!   source_directoryproject_filename^[^/\\:]+\.[cCeE][mM][tT][pP]$
//!   expected_project_sha256
//!   Copy the bound native project directory, including companion resources, into a fresh workspace directory. Require the exact source .cmtp/.emtp SHA256; independently verify every co

// TODO: 依上列契约实现 `address_workflow` 模块。
