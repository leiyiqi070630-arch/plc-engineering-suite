# TIA HMI Openness：按实际目标使用

维护日期：2026-09-25。以当前工具契约、目标PublicAPI及工程回读为准。旧版桥接错误字段清单属于历史诊断，不能再当成当前工具说明或厂商能力边界。

## 设计与执行

新建/美化画面使用内置 `hmi-design` 或 `plc_corpus_read(path=plc-experience-corpus/17-hmi-design-and-delivery.md)`。指南包括背景板、留白、分区、字体、操作反馈以及工程/视觉/Runtime分项验收；在当前任务中复用，不每次写控件重读。

Classic与Unified使用不同对象及交换格式。先读实际HMI类型、版本、尺寸、语言和已有对象，不套用另一类控件名称。

- Classic屏幕使用真实导出/当前生成器的SimaticML导入并回导核验，保留目标语言、尺寸、编号、唯一ID与绑定。不把兼容默认800×480当检测结果。控制类型范围以当前生成器契约为准，不沿用旧“只有8类”的数量。
- Unified使用原生ScreenItems与控件属性。V21分为Base/Step7/WinCCUnified等程序集；仅在Base里找不到类型不能证明WinCCUnified不支持。按钮事件通过实际EventHandlers.Find/Create的枚举签名识别，脚本写入后回读并做SyntaxCheck。
- 监控I/O域显式指定io_field_type=Output，可调参数才用InputOutput并在PLC校验。ProcessValue动态化与静态值不同；形状颜色动态化也不等于ProcessValue标签。
- 文本用目标工程的实际语言。普通标签可直接传text，必要的原生HTML适配由工具在核对字段格式后处理；不要求所有版本都传HTML。

## 通信与交付

Unified软件连接和V21硬件通信伙伴是不同层。软件连接Partner不可直接写不等于所有伙伴创建均不支持；V21硬件CommunicationManagement有相应创建接口。绝对地址与符号伙伴分别核验驱动/地址或伙伴、Tag绑定及实际通信，Partner为空本身不足以判定失败。

新建软件连接默认DisabledAtStartup=false，显式true被尊重；已有连接遗漏该字段时保持原值。创建硬件伙伴后仍应检查软件连接启动状态，配置完成不代表Runtime已连通。

相关变量、绑定、控件和事件成批完成后再编译一次，修复一批诊断后再编译。默认延期编译是pending，不能催模型重新创建对象。编译总数和Success状态不能覆盖明细Error；回执保留原生计数和观察到的错误诊断。

检查applied/skipped、语义回读和持久化；未写入字段不能报告成功。当前Classic起始画面设置仍需已配置模板或TIA界面操作，Unified有专门工具；接口失败按目标/版本给出具体边界，不猜属性反复重试。

Runtime密码、用户权限、起始画面及通信需实际配置。不要自动放松密码策略。保存、编译和坐标回读都不能代替真实画面预览及命令/导航/数值更新验证。

## 依据

本机各版本Siemens PublicAPI XML和当前桥接实现；V21 `Siemens.Engineering.WinCCUnified.xml`的HmiButtonEventType与HmiIOField.IOFieldType。产品证据：`docs/hmi-compile-batching-20260924.md`，`evidence/eigen-plccode-comparison-20260925/comparison.md`。修改后的成品验证状态以本次整改记录为准，不由文档自证。
