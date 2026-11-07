//! 模块骨架
//! 模块路径: crates\tools\src\document_read\doc.rs
//!
//! 说明: 本模块对外契约由接口证据整理，函数体以实现为准。
//! 以下为对外契约线索，补实现时以此为准。
//!
//! 关联工具: initialized
//! 错误码: GX_ARCHIVE_CHANGED, GX_ARCHIVE_LIMIT
//!
//! 契约线索（截断）:
//!   capacity overflow
//!   .cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.38.4\src\escape.rs
//!   &lt;&gt;&apos;&amp;&quot;&#9;&#10;&#13;&#32;internal error: entered unreachable code: Only '<', '>','', '&', '"', '\t', '\r', '\n', and ' ' are escaped
//!   GX_ARCHIVE_CHANGED: À!; retry after saving has finished
//!   crates\tools\src\gxworks2.rs
//!   GX_ARCHIVE_LIMIT: À
//!    exceeds 64 MiB
//!   D:\build-cache\rustup\toolchains\stable-x86_64-pc-windows-msvc\lib/rustlib/src/rust\library\std\src\io\mod.rs
//!   stream did not contain valid UTF-8
//!   assertion failed: n <= init_unfilledD:\build-cache\rustup\toolchains\stable-x86_64-pc-windows-msvc\lib/rustlib/src/rust\library\core\src\io\borrowed_buf.rs
//!   a formatting trait implementation returned an error when the underlying stream did not
//!   failed to fill whole buffer
//!   ` stream of `À
//!   ` is larger than À= bytes; a Word document stream that big is not a normal .doc.
//!   DOCUMENT_TOO_LARGEOpen the document and export only the section that is needed.crates\tools\src\document_read\doc.rs
//!    rejected ÀK batch item field(s); fix them all in ONE retry â this list is complete: À

// TODO: 依上列契约实现 `doc` 模块。
