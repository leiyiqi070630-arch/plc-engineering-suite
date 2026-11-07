//! 模块骨架
//! 模块路径: crates\tools\src\assistant_tools\structured.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: packing, wordbit
//! 相关中文说明: 4 条（提示词/工具说明）
//!
//! 契约线索（截断）:
//!   ç¼ºå° countï¼ä¸æ¬¡è¯»åçÀ
//!   count è³å°ä¸º 1ï¼À
//!   è¯»åä¸é À9ï¼MC åè®®åæ¬¡æ¹éè¯»çç¡¬ä¸éï¼ï¼è¯·åæ¹è¯»
//!   缺少 host：填 PLC 的 IPv4 地址，例如 192.168.0.10host 必须是一台具体的 PLC IPv4 地址，例如 192.168.0.10
//!   host 'ÀS' ä¸æ¯åæ³ç IPv4 å°åï¼æ¬ééåªæ¥åå·ä½ IPv4ï¼å¦ 192.168.0.10ï¼
//!   è½¯åä»¶ ÀÀk æ¯å­è½¯åä»¶ï¼è¯·ç¨ mitsubishi_mc_read_words è¯»åï¼read_bits åªè¯»ä½è½¯åä»¶(X/Y/M/L/F/B/SB/SM)
//!   mitsubishi_mc_read_bitsør(C
//!   字mitsubishi_mc_read_words
//!   缺少 address：填首软元件地址，例如 D100、M0、X1A
//!   unitcountpoints该软元件为位软元件，字读取时每个值是 16 个连续位的按位打包(低位=低编号)，address 已按每点 16 个软元件给出区间
//!   addressRadix
//!   addressRadixWarning
//!   *transport åªè½æ¯ tcp æ udpï¼æ¶å° 'À
//!   crates\tools\src\assistant_tools\structured.rs
//!   Structured output provided successfullystructured output payload must not be empty
//!   PLCCode-WebAPI/0.1 -> 

// TODO: 依上列契约实现 `structured` 模块。
