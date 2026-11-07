# EventTableCodec（Windows x64，共享应用 Python）

运行入口为 Invoke-EventTableCodec.ps1，直接调用 PLCCode 随包交付的 engine/python/python.exe 与 source/event_table_codec.py。source/_deps 仅含 xlrd、xlwt、olefile 的纯 Python 文件；不查找 PATH，也不要求用户安装 Python 或 Excel。本工具只有纯文件操作，没有 GUI/原厂导入动作。

## PS5调用
```powershell
& .\Invoke-EventTableCodec.ps1 -RequestPath 'D:\private\request.json' -ResponsePath 'D:\private\fresh-response.json'
```
请求/响应UTF-8 JSON文件，response及输出XLS/receipt均fresh。源码入口以 Python 的两个文件参数调用。失败返回JSON ok=false及exit2；PS5把拒绝变为错误。

请求示例：
```json
{"operation":"inspect","input":"D:\\private\\native.xls","output":"D:\\private\\fresh-inspect.json"}
{"operation":"compare","before":"D:\\private\\native-before.xls","after":"D:\\private\\native-after.xls","output":"D:\\private\\fresh-compare.json"}
{"operation":"native-append","base":"D:\\private\\native.xls","output":"D:\\private\\fresh.xls","receipt":"D:\\private\\fresh-receipt.json","expected_sha256":"BASE_SHA","row":{"values":["170 positional strings"],"types":["170 positional numeric types"]}}
```
native-update请求另加index（1-based事件数据行；1对应Excel第3行），native-delete不用row。row.values和row.types必须各170项，类型仅TEXT=1/EMPTY=0，EMPTY值必须为空字符串；不做自动数值/空格/Unicode转换。

严格已实证的Event VERSION3/HARDWARE_VERSION49、170中文列名、BIFF8 OLE、单sheet合同。保留每格值/类型、首行元信息、全旧行；类型参与compare，29列安装模板与170列原生格式不可混用。写入不声明视觉格式/其它Excel工作簿特性保留。inspect/compare保持29列旧模板读验支持；完整29列改写暂保留研究脚本，不扩此固定helper协议。

## CXOB安全解包
```json
{"operation":"cxob-unpack","input":"D:\\private\\compiled.cxob","expected_sha256":"CXOB_SHA256","output_root":"D:\\private\\fresh-unpacked"}
```
只读本地CXOB，使用标准库tarfile/gzip；输出根必须不存在，输入SHA在解包前后匹配。仅接受普通文件和目录，拒绝路径逃逸、链接、重复路径及非普通成员；产品限额为4096成员、512MiB解包文件总量，要求非空mt8000/project。result保留原成员名、每个文件路径/字节/SHA及project信息，不执行解包文件。失败可能留下部分fresh输出用于核查，不能在同目录自动重试。本协议不声明工程修改、原厂导入或运行成功。

## 证据与交付边界
此前冻结版本的真实774C原厂基线八次EXE调用全部通过：PS5固定入口inspect、append、compare、update、delete、两次inspect及wrongSHA拒绝，总进程时间1.078秒。此记录不代替本次新EXE的旧事件功能验收。

本次新EXE已由root在Windows PowerShell 5、PATH仅两个Windows目录下实际执行cxob-unpack，0.78秒/exit0：原公开CF893F CXOB保持，23成员/16文件/51,046,534解包字节，project 2,102,460字节/CACE，与原Viewer使用的project字节相同。新runtime全部56文件与实际dist闭包SHA一致；回执及各输出SHA复核在cmt-project-native-r1/codec-frozen-validation-r1.json。新EXE另一次固定PS5入口旧事件inspect实际0.348秒/exit0，同样PATH仅Windows目录；774C源SHA保持，170列/1事件的全部单元格与类型和原inspect回执精确一致。clean-machine/portable实际交付验证仍待，本机原本安装有Python。native_import_verified保持false。

buildmanifest.json记录全部交付文件SHA、runtime体积、官方原始wheel URL/SHA、实际下载镜像URL/SHA、冻结器版本与build-only依赖、宿主Python及捆绑DLL SHA。三运行依赖源码与原缓存官方同版本wheel逐文件字节一致，本次未重新下载依赖。licenses含Python、xlrd、xlwt（官方sdist docs/licenses.rst全文）、olefile及PyInstaller bootloader例外。source保存自己的入口/codec/原厂合同；原venv/缓存/spec在research/eventlog-codec-freeze-r1，本次buildlog/dist/回退闭包在G:/PLCCodeTestBuilds/weinview-cmt-codec-freeze-r1，均不随runtime交付。DEMO37既有包不因此更新。


## 2026-10-04 宏 EBM 文件交换

复用研究中已原厂验证的 CN421 EBM codec，新增 ebm-inspect / ebm-prepare；沿用此固定 runtime，不另加 Python 或宏生成框架。原厂导入/保存/编译由 MacroFileOperation.ps1 收口，codec 回执自身始终不冒充 native_import_verified。macro-default-cn421.ebm 是原厂导出基线。更新要求真实原宏 EBM SHA 与 UTF8-LF 源 SHA，同时保留 ID/name、startup/periodic/interlock 和全部未知元数据行；执行字段额外参数只原样保留，不声称已实现其编辑。新输出必须不存在。

开源核对：GitHub IliTheButterfly/EasyBuilderMacroGenerator（MIT）的 syntax 只生成宏文本、tools/io 与 merge 处理 CSV，未提供 EBM/EMTP 写入或原厂编译接口。当前工具已接受宏源码且已有 CSV codec，故不重复引入其 DSL/剪贴板/依赖；仍复用现有文件处理实现。


## 2026-10-06 cMT 原生事件历史数据库

新增固定私有 cmt-event-db-inspect 请求，复用 CPython sqlite3，严格只读稳定副本；原厂 CN421/cMT3071 实际 event.db 三表 DDL、全部列顺序/类型与主键保存在 native-cmt-history-sqlite-v1.json。拒绝未知模式、视图/触发器、活动日志、文件变化、超过产品负载上限或缺失事件定义，完整保留原始触发/确认/恢复数字及24语言定义，不猜测时区/单位，不把文件读取当作运行ACK。原厂库和源码都不由读库工具修改。

本次仅一次固定codec冻结，14条只读风险回归通过；PATH仅Windows目录的冻结闭包通过7项检查，含旧170列、新179列、保护比较、宏文件和CXOB解包兼容及真实SQLite完整记录。未卸载宿主Python，clean-machine仍未验证。新增SQLite DLL及Python标准模块来源字节与原官方CPython安装一致；许可证说明见 licenses/SQLite-NOTICE.txt。当前DEMO字节保持，完整软件交付另行集中处理。
