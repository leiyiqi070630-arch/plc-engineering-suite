# TIA 导出 XML → LAD 网络逻辑解析要点

从 TIA 项目导出块 XML(`tia_openness_export_block_xml`),解析出每个网络的**触点/线圈/指令盒与操作数**,得到紧凑文本后再逐网络通读。以下要点全部来自实际踩坑,照做可一次成功。

## 文档结构

```
<Document>
  <SW.Blocks.FB ID="0">            (或 FC / OB / GlobalDB)
    <AttributeList>
      <Interface>...</Interface>   (Input/Output/InOut/Static 变量声明)
      ...CompileUnits...
    </AttributeList>
    <ObjectList>
      <SW.Blocks.CompileUnit ID="x" CompositionName="CompileUnits">   ← 一个网络
        <AttributeList>
          <NetworkSource><FlgNet xmlns="...FlgNet/v4">...</FlgNet></NetworkSource>
          <ProgrammingLanguage>LAD</ProgrammingLanguage>
        </AttributeList>
        <ObjectList>   ← 网络的 Title/Comment 多语言文本在这里
```

## 关键坑(全部实测)

1. **元素名带点**:`<SW.Blocks.CompileUnit>` 的 LocalName 是 `"SW.Blocks.CompileUnit"`——点号是名字的一部分,不是命名空间分隔符。XPath 必须写
   `//*[local-name()="SW.Blocks.CompileUnit"]`,写 `"CompileUnit"` 会返回 0 个。
2. **命名空间**:FlgNet 在 `http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4`。
   用 XPath 查询 FlgNet 内部节点时,**必须把 XmlNamespaceManager 传给 SelectNodes/SelectSingleNode**,否则报"Namespace Manager or XsltContext needed"或返回 null。
3. **Parts 容器**:`<Part>` 和 `<Access>` 在 `<Parts>` 里面,不是 FlgNet 直接子元素。路径是
   `./f:Parts/f:Part`、`./f:Parts/f:Access`;而 `<Wires>` 是 FlgNet 直接子元素(`./f:Wires/f:Wire`)。
4. **操作数绑定在 Wires 里**:Part 不直接挂操作数。流程:
   - 先遍历 `f:Parts/f:Access` 建表:`Access.UId → 符号`(见坑 5/6)。
   - 再遍历 `f:Wires/f:Wire`:`IdentCon.UId`(引用 Access 的 UId)→ 挂到 `NameCon.UId`(Part 的 UId)的 `NameCon.Name`(引脚,如 operand/in/out/PT/Q)。
   - 最后按 Part.UId 聚合出每个 Part 的操作数。
5. **常闭触点**:`<Negated Name="operand"/>` 子元素表示该触点取反。输出时标记为 `Contact!(...)`,否则会丢掉取反语义。
6. **复合符号(DB 成员)**:`<Symbol>` 下多个 `<Component>` 要全部拼接:如
   `DB_Elevator_Link` + `HallUp_L1` → `#DB_Elevator_Link.HallUp_L1`。只取第一个会得到一堆无法区分的 `#DB_Elevator_Link`。
7. **常量**:`<Constant>` 元素或 `K:Int1` / `K:T#5s` 形式(Move 的 in、TON 的 PT 等)。
8. **线圈类型**:`SCoil`=置位、`RCoil`=复位、`Coil`=普通赋值、`O()`=并联分支起点(OR 组)。这决定状态语义,必须区分。
9. **网络标题**:在 `CompileUnit/ObjectList/MultilingualText[@CompositionName="Title"]/.../Text` 里,`Comment` 同理。标题是注释不是逻辑,只能辅助理解。

## 输出格式(建议)

每网络一行,写入文件后分段读取(长输出会被工具压缩,不要一次拉全部):

```
N1 [初始化：上电置空闲态] :: Contact!(operand:#InitDone) | SCoil(operand:#St_Idle)
N66 [发车上行(1/2)] :: Contact(operand:#St_Idle) | Contact(operand:#Door_Closed_Sensor) | ... | SCoil(operand:#St_Moving_Up)
```

读法:`A | B | C | O() | D | Coil(E)` = (A OR B OR C) AND D → E;`!` = 常闭。

## 解析脚本骨架(PowerShell)

```powershell
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('f','http://www.siemens.com/automation/Openness/SW/NetworkSource/FlgNet/v4')
$units = $xml.SelectNodes('//*[local-name()="SW.Blocks.CompileUnit"]')  # 注意坑1
# 每个网络:
#   $flg = $u.SelectSingleNode('.//f:FlgNet', $ns)                       # 注意坑2
#   Access 表: $a.UId -> 符号(坑6 拼接 Component; 坑5 记 Negated)
#   Wires: IdentCon.UId -> (NameCon.UId, NameCon.Name)                  # 坑4
#   Parts: $p.Name + ($p 有 Negated ? '!' : '') + '(' + 引脚:操作数 + ')'  # 坑3
# 标题: $u.SelectSingleNode('.//*[local-name()="MultilingualText" and @CompositionName="Title"]//*[local-name()="Text"]', $ns).InnerText
```

## 接口变量

`<Interface><Sections>` 下的 Input/Output/InOut/Static 区,每个 `<Member Name=... Datatype=...>`;TON 等指令实例是嵌套 `<Member Name="T_Dwell" Datatype="TON_TIME">` 带子成员(PT/ET/IN/Q)。Static 变量清单是建立状态机/变量表的第一手来源。
