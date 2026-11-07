# Dialog-only native property read. Caller opens/cancels; no text setter/save/confirmation.
param([ValidateSet('Read')][string]$Action='Read',[Parameter(Mandatory=$true)][string]$IdentityPath,[Parameter(Mandatory=$true)][string]$ProjectPath,[Parameter(Mandatory=$true)][string]$ExpectedSha256,[Parameter(Mandatory=$true)][long]$DialogHwnd,[Parameter(Mandatory=$true)][string]$OutputPath,[bool]$ReadSecurityClass=$false,$TagEvidence=$null)
$ErrorActionPreference='Stop';$canWrite=$false
$r=[ordered]@{schema='weinview-native-object-read/v1';action='Read';status='failed';scope='numeric-display-or-trigger-macro-functionkey-dialog';confirmed=$false;saved=$false;cancelled=$false;actual=$null}
try{
 if(Test-Path -LiteralPath $OutputPath){throw 'Fresh receipt required'};$canWrite=$true
 if($ExpectedSha256 -notmatch '^[a-fA-F0-9]{64}$' -or $DialogHwnd -le 0){throw 'Exact SHA256/dialog required'}
 $i=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json
 if(!$i.Project -or [IO.Path]::GetFullPath($ProjectPath) -ine [IO.Path]::GetFullPath($i.Project)){throw 'Owned identity/project mismatch'}
 function HashGuard {if((Get-FileHash -LiteralPath $ProjectPath -Algorithm SHA256).Hash -ine $ExpectedSha256){throw 'Project hash changed during dialog read'}}
 HashGuard
 Add-Type -AssemblyName Accessibility
 if(!('PLCCode.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'FunctionWindowTargetControls.cs'),(Join-Path $PSScriptRoot 'BitAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'ObjectSecurityClassControls.cs') -ReferencedAssemblies 'System.dll','Accessibility'}
 if(!('PLCCode.Weinview.Research.NativePropertyCandidate' -as [type]) -or !('PLCCode.Weinview.NumericAddressTypeControls' -as [type])){throw 'Joint native/property/address-type dependencies required'}
 if(!('PLCCode.Weinview.FunctionWindowTargetControls' -as [type])){throw 'Joint native/function-window dependencies required'}
 if(!('PLCCode.Weinview.NumericTagSettingsControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NumericTagSettingsControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $n=[PLCCode.Weinview.NativeControls]::new($i.Pid,$i.CreationTicks,$i.Exe,800);$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($i.Pid,$i.CreationTicks,$i.Exe)
 function DialogGuard {
  $m=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))});if($m.Count -ne 1){throw 'Unique owned project main required'}
  $ds=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible -and $_.Enabled});if($ds.Count -ne 1 -or $ds[0].Hwnd -ne $DialogHwnd){throw 'Unique actual owned modal required'};return $ds[0]
 }
 function ReadSecurityClassPage {
  $tab=$n.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');if(@($p.TabNames($tab.Hwnd)|Where-Object {$_ -ceq '安全'}).Count -ne 1){throw 'Object does not expose an original Security tab'}
  $p.SelectTabExact($tab.Hwnd,'安全')
  if(!('PLCCode.Weinview.ObjectSecurityClassControls' -as [type])){throw 'Joint native/security class dependencies required'}
  return ([PLCCode.Weinview.ObjectSecurityClassControls]::new($n)).ReadClass($DialogHwnd)
 }
 $d=DialogGuard
 if($d.Title -ceq '项目选单的属性'){
  . (Join-Path $PSScriptRoot 'OptionListAdditionOperation.ps1')
  $actual=Read-WeinviewOptionListFields $n $p $DialogHwnd $d.Title
  $tab=$n.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
  $tabs=@($p.TabNames($tab.Hwnd));foreach($required in @('项目选单','源数据','状态设置','轮廓')){if(@($tabs|Where-Object {$_ -ceq $required}).Count -ne 1){throw ('Existing native Option List page missing or ambiguous: '+$required)}}
  $rect=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Read -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath|ConvertFrom-Json
  $actual|Add-Member -NotePropertyName rectangle -NotePropertyValue @($rect.After) -Force
  $null=DialogGuard;HashGuard;$r.actual=$actual;$r.scope='observed native Option List binding, mode, ordinary mapping rows and contour';$r.full_properties_verified=$false;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true
  if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage};return
 }
 if($d.Title -ceq '趋势图的属性'){
  if(!('PLCCode.Weinview.TrendRibbonControls' -as [type])){throw 'Joint native Trend channel reader required'}
  $main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))});if($main.Count -ne 1){throw 'Unique owned Trend main required'};$mainHwnd=[long]$main[0].Hwnd
  function TrendControl([int]$id,[string]$class){$current=DialogGuard;if($current.Title -cne '趋势图的属性'){throw 'Trend property title changed'};$controls=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq $id -and $_.Class -ceq $class -and $_.Visible -and $_.Enabled});if($controls.Count -ne 1){throw ('Finite Trend control not unique/interactive: '+$id)};return $controls[0]}
  function TrendInteger([int]$id){$value=0;$raw=$n.GetControlText((TrendControl $id 'Edit').Hwnd,64);if(![int]::TryParse($raw,[ref]$value)){throw ('Actual Trend integer required: '+$id)};return [int]$value}
  function TrendRange([int]$id){$raw=$n.GetControlText((TrendControl $id 'Edit').Hwnd,64);$value=0.0;if(![double]::TryParse($raw,[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture,[ref]$value) -or [double]::IsNaN($value) -or [double]::IsInfinity($value)){throw ('Actual Trend finite range required: '+$id)};return [double]$value}
  function TrendCheckbox([int]$id,[string]$label){$control=TrendControl $id 'Button';if($n.GetControlText($control.Hwnd,128) -cne $label){throw ('Exact Trend checkbox label required: '+$id)};$state=$n.GetCheckboxState($control.Hwnd);if($state -notin @(0,1)){throw 'Actual Trend Boolean checkbox state required'};return ($state -eq 1)}
  $tab=TrendControl 12320 'SysTabControl32';$trendTabs=@($p.TabNames($tab.Hwnd)) -join '|';$isCmt=($trendTabs -cin @('一般属性|显示|趋势图|通道|Y 轴|数据格式|安全|图片','一般属性|显示|趋势图|通道|Y 轴|数据格式|安全|图片|轮廓'));if(!$isCmt -and $trendTabs -cne '一般属性|趋势图|通道|Y 轴|安全|图片|轮廓'){throw 'Observed existing Trend tab profile required'}
  $p.SelectTabExact($tab.Hwnd,'一般属性')
  $description=$n.GetControlText((TrendControl 1174 'Edit').Hwnd,1025);$samplingLabel=$p.ComboSelected((TrendControl 1097 'ComboBox').Hwnd)
  $samplingMatch=[regex]::Match([string]$samplingLabel,'^([1-9][0-9]{0,9})\. (.+)$');$samplingIndex=0;if(!$samplingMatch.Success -or ![int]::TryParse($samplingMatch.Groups[1].Value,[ref]$samplingIndex) -or $samplingIndex -le 0){throw 'Actual Trend full sampling index/description label required'}
  $mode=$null;$unit=$null;$pause=$null;$spacing=TrendInteger 1993
  if($isCmt){$unit=$p.ComboSelected((TrendControl 1338 'ComboBox').Hwnd);if($unit -cnotin @('毫米','时间','像素')){throw 'Actual cMT Trend distance unit required'};$pixel=$null}
  else{$mode=$p.ComboSelected((TrendControl 2057 'ComboBox').Hwnd);$pixelControl=TrendControl 1991 'Button';if($n.GetControlText($pixelControl.Hwnd,64) -cne '像素'){throw 'Exact TK Trend pixel label required'};$pixel=($p.GetRadioState($pixelControl.Hwnd) -eq 1);$pause=TrendCheckbox 2008 '启用'}
  $dynamic=TrendCheckbox 2010 '动态调整两取样绘点间距';$inspection=TrendCheckbox 2009 '启用';$timeExport=TrendCheckbox 2011 '启用'
  if($isCmt){$time=$null}else{$timeControl=TrendControl 1735 'Button';if($n.GetControlText($timeControl.Hwnd,64) -cne '时间'){throw 'Exact TK Trend time label required'};$time=($p.GetRadioState($timeControl.Hwnd) -eq 1)}
  $gridDisplay=$null;if($isCmt){$p.SelectTabExact($tab.Hwnd,'趋势图');$gridDisplay=TrendCheckbox 1076 '显示'}
  $p.SelectTabExact($tab.Hwnd,'通道')
  $range=TrendCheckbox 1688 '取自寄存器';$minimum=TrendRange 1297;$maximum=TrendRange 1298;$widthText=$p.ComboSelected((TrendControl 1299 'ComboBox').Hwnd);$width=0;if(![int]::TryParse($widthText,[ref]$width) -or $width -le 0){throw 'Actual Trend positive line width integer required'}
  $channelControl=TrendCheckbox 1689 '启用'
  $channelYAxisEvidence=$null
   if($isCmt){$observed=@([PLCCode.Weinview.TrendRibbonControls]::ReadObservedChannels($n,$DialogHwnd,$mainHwnd,'趋势图的属性'));$labels=[string[]]@($observed|ForEach-Object {$_.label});$types=[string[]]@($observed|ForEach-Object {$_.data_type});$r.sampling_channels_enabled_evidence=[ordered]@{channels=@($observed|ForEach-Object {[pscustomobject]@{row=[int]$_.row;label=[string]$_.label;data_type=[string]$_.data_type;enabled=[bool]$_.enabled}});all_enabled=(@($observed|Where-Object {!$_.enabled}).Count -eq 0)}
   $ranges=@([PLCCode.Weinview.TrendRibbonControls]::ReadChannelRanges($n,$DialogHwnd,$mainHwnd,'趋势图的属性',$labels,$types));$minimum=[double]$ranges[0].minimum;$maximum=[double]$ranges[0].maximum
   $p.SelectTabExact($tab.Hwnd,'Y 轴');$axes=@([PLCCode.Weinview.TrendRibbonControls]::ReadChannelAxes($n,$DialogHwnd,$mainHwnd,'趋势图的属性',$labels,$types))
   $optionControls=@($n.EnumChildControls($DialogHwnd));$hideControls=@($optionControls|Where-Object {$_.Id -eq 1332 -and $_.Class -ceq 'Button'});$alignmentControls=@($optionControls|Where-Object {$_.Id -eq 1370 -and $_.Class -ceq 'ComboBox'})
   if($hideControls.Count -gt 1 -or $alignmentControls.Count -gt 1){throw 'Trend Y axis option controls are ambiguous.'}
   if($hideControls.Count -eq 1 -and $hideControls[0].Title -cne '通道数据不显示时隐藏通道 Y 刻度'){throw 'Actual Trend Y axis hide option label changed.'}
   $optionsAvailable=($hideControls.Count -eq 1 -and $alignmentControls.Count -eq 1 -and $hideControls[0].Visible -and $hideControls[0].Enabled -and $alignmentControls[0].Visible -and $alignmentControls[0].Enabled)
   $hide=$null;$alignment=$null;$normalizedAlignment=$null
   if($optionsAvailable){$hide=TrendCheckbox 1332 '通道数据不显示时隐藏通道 Y 刻度';$alignment=$p.ComboSelected($alignmentControls[0].Hwnd);if((@($p.ComboItems($alignmentControls[0].Hwnd)) -join '|') -cne '以刻度为中心|完整显示'){throw 'Native Trend Y alignment choices changed'};$normalizedAlignment=switch($alignment){'以刻度为中心'{'center_on_tick'} '完整显示'{'full_text'} default{throw 'Native Trend Y alignment changed'}}}
   $axisRows=@();for($iRow=0;$iRow -lt $axes.Count;$iRow++){$normalizedAxis=switch([string]$axes[$iRow].axis){'无'{'none'} '主轴'{'main'} '辅助轴'{'auxiliary'} default{throw 'Native Trend Y axis choice changed'}};$axisRows+=[pscustomobject]@{row=$iRow+1;label=[string]$axes[$iRow].label;axis=$normalizedAxis;native_axis=[string]$axes[$iRow].axis;minimum=[double]$ranges[$iRow].minimum;maximum=[double]$ranges[$iRow].maximum}}
   $channelYAxisEvidence=[pscustomobject]@{grid_display_enabled=[bool]$gridDisplay;channels=$axisRows;options_available=[bool]$optionsAvailable;hide_when_channel_invisible=$hide;value_alignment=$normalizedAlignment;native_value_alignment=$alignment};$r.channel_y_axis_evidence=$channelYAxisEvidence
  }
  $geometry=$null;$aspect=$null;$widthPercent=$null;$heightPercent=$null
  if(!$isCmt){$p.SelectTabExact($tab.Hwnd,'轮廓');$values=@();foreach($id in @(1050,1052,1045,1044,1056,1060)){$values+=TrendInteger $id};if($values[0] -lt 0 -or $values[1] -lt 0 -or $values[2] -le 0 -or $values[3] -le 0 -or $values[4] -lt 0 -or $values[5] -lt 0){throw 'Actual finite TK Trend geometry required'};$geometry=@([int]$values[0],[int]$values[1],[int]$values[2],[int]$values[3]);$aspect=TrendCheckbox 1602 '保持长/宽比例';$widthPercent=[int]$values[4];$heightPercent=[int]$values[5]}
  if($spacing -le 0 -or (!$isCmt -and !$mode)){throw 'Actual finite Trend spacing/mode required'}
  $null=DialogGuard;HashGuard
  $r.actual=[ordered]@{kind='trend';description=[string]$description;sampling_label=[string]$samplingLabel;sampling_index=[int]$samplingIndex;sampling_description=[string]$samplingMatch.Groups[2].Value;display_mode=$mode;display_unit=$unit;pixel_spacing=[int]$spacing;pixel_mode=$pixel;time_mode=$time;dynamic_spacing=[bool]$dynamic;pause_enabled=$pause;inspection_enabled=[bool]$inspection;time_export_enabled=[bool]$timeExport;range_from_register=[bool]$range;minimum=[double]$minimum;maximum=[double]$maximum;line_width=[int]$width;channel_control_enabled=[bool]$channelControl;rectangle=$geometry;aspect_locked=$aspect;width_percent=$widthPercent;height_percent=$heightPercent}
  $r.scope=if($isCmt){'observed cMT Trend general/channel values; native rectangle unavailable; channel grid and complete styles unverified'}else{'observed TK Trend general/channel range-width/contour only; channel grid and complete styles unverified'};$r.full_properties_verified=$false;$r.channel_grid_values_verified=$false;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage};return
 }
 if($d.Title -ceq '矩形元件属性'){
  function DrawingControl([int]$id,[string]$class){$current=DialogGuard;if($current.Title -cne '矩形元件属性'){throw 'Rectangle property title changed'};$controls=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq $id -and $_.Class -ceq $class -and $_.Visible -and $_.Enabled});if($controls.Count -ne 1){throw ('Rectangle control not unique/interactive: '+$id)};return $controls[0]}
  $tab=DrawingControl 12320 'SysTabControl32';if((@($p.TabNames($tab.Hwnd)) -join '|') -cne ' 形状|安全|轮廓'){throw 'Exact actual Rectangle tabs including shape leading space required'}
  $p.SelectTabExact($tab.Hwnd,' 形状')
  $fill=DrawingControl 1217 'Button';if($n.GetControlText($fill.Hwnd,64) -cne '填充'){throw 'Exact Rectangle fill checkbox label required'};$filled=$n.GetCheckboxState($fill.Hwnd);if($filled -notin @(0,1)){throw 'Actual Rectangle fill state required'}
  $corner=$p.ComboSelected((DrawingControl 2067 'ComboBox').Hwnd);if(!$corner -or $corner.Length -gt 1024){throw 'Actual bounded Rectangle corner selection required'}
  $p.SelectTabExact($tab.Hwnd,'轮廓');$geometry=@();foreach($id in @(1050,1052,1045,1044,1056,1060)){$value=0;$raw=$n.GetControlText((DrawingControl $id 'Edit').Hwnd,64);if(![int]::TryParse($raw,[ref]$value) -or $value -lt 0){throw 'Actual Rectangle profile integer required'};$geometry+=[int]$value}
  if($geometry[2] -le 0 -or $geometry[3] -le 0){throw 'Actual Rectangle width/height must be positive'}
  $null=DialogGuard;HashGuard
  $r.actual=[ordered]@{kind='rectangle';rectangle=@([int]$geometry[0],[int]$geometry[1],[int]$geometry[2],[int]$geometry[3]);filled=($filled -eq 1);corner=[string]$corner;width_percent=[int]$geometry[4];height_percent=[int]$geometry[5]}
  $r.scope='observed Rectangle geometry/fill/corner/percentage only';$r.full_properties_verified=$false;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage};return
 }
 if($d.Title -ceq '图片的属性'){
  $tab=$n.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
  if((@($p.TabNames($tab.Hwnd)) -join '|') -cne '图片|安全|轮廓'){throw 'Observed existing Picture property tabs required.'}
  $rect=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Read -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath|ConvertFrom-Json
  if(!('PLCCode.Weinview.NativeResourceReuseControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeResourceReuseControls.cs') -ReferencedAssemblies 'System.dll','System.Drawing.dll','Accessibility.dll'}
  . (Join-Path $PSScriptRoot 'NativeResourceReuseOperation.ps1')
  $manager=$null
  try{
   $p.SelectTabExact($tab.Hwnd,'图片')
   $n.ClickButton($DialogHwnd,1094,'图库...')
   $session=[pscustomobject]@{native=$n;process=(Get-Process -Id $i.Pid);exe_path=[string]$i.Exe}
   $manager=Wait-WeinviewResourceDialog $session @($DialogHwnd) '图片管理'
   $managerTab=$n.FindUniqueControlWithoutLabel($manager.Hwnd,2770,'SysTabControl32')
   $p.SelectTabExact($managerTab.Hwnd,'工程文件')
   $selected=Get-WeinviewSelectedProjectPictureCard $session $manager
   $stateMatch=[regex]::Match([string]$selected.states,'^状态数 : ([1-9][0-9]{0,2})$')
   $stateCount=0;if(!$stateMatch.Success -or ![int]::TryParse($stateMatch.Groups[1].Value,[ref]$stateCount) -or $stateCount -gt 255){throw 'Actual selected Picture state count required.'}
   $referenceMatch=[regex]::Match([string]$selected.references,'^元件 : ([0-9]{1,5})$')
   $referenceCount=0;if(!$referenceMatch.Success -or ![int]::TryParse($referenceMatch.Groups[1].Value,[ref]$referenceCount)){throw 'Actual selected Picture reference count required.'}
  }finally{
   if($manager -and @($n.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){
    $n.ClickButton($manager.Hwnd,2,'取消')
    $null=WaitFor {if(!@($n.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){return $true}} 6
   }
  }
  $null=DialogGuard;HashGuard
  $r.actual=[ordered]@{kind='picture';rectangle=@([int]$rect.After[0],[int]$rect.After[1],[int]$rect.After[2],[int]$rect.After[3]);project_picture_index=[int]$selected.index;picture_name=[string]$selected.name;state_count=$stateCount}
  $r.native_picture_references=$referenceCount
  $r.scope='observed Picture contour and selected native project picture card index/name/state count';$r.full_properties_verified=$false;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage};return
 }
 if($d.Title -ceq '文字/批注的属性'){
  function TextControl([int]$id,[string]$class){$current=DialogGuard;if($current.Title -cne '文字/批注的属性'){throw 'Text property title changed'};$controls=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq $id -and $_.Class -ceq $class -and $_.Visible});if($controls.Count -ne 1){throw ('Text read control not unique/visible: '+$id)};return $controls[0]}
  $tab=TextControl 12320 'SysTabControl32';if((@($p.TabNames($tab.Hwnd)) -join '|') -cne '文字/批注|安全|轮廓'){throw 'Exact existing Text property tabs required'}
  $p.SelectTabExact($tab.Hwnd,'文字/批注')
  $libraryControl=TextControl 1545 'Button';if($n.GetControlText($libraryControl.Hwnd,128) -cne '使用文字库 '){throw 'Native Text library checkbox identity changed'}
  $libraryState=$n.GetCheckboxState($libraryControl.Hwnd);if($libraryState -notin @(0,1)){throw 'Native Text library checkbox state unknown'}
  $textSource=if($libraryState -eq 1){'label_library'}else{'literal'};$labelName=$null;$nativeSelectorText=$null
  if($libraryState -eq 1){
   $selector=TextControl 1546 'ComboBox';$nativeSelectorText=$p.ComboSelected($selector.Hwnd)
   if($nativeSelectorText -cne $n.GetControlText($selector.Hwnd,4096)){throw 'Native Text label selector selection/readback differs'}
   $labelMatch=[regex]::Match([string]$nativeSelectorText,'^([A-Za-z][A-Za-z0-9_]{0,63}) : ([^\r\n]*)$')
   if(!$labelMatch.Success){throw 'Native Text label selector value changed'}
   $labelName=$labelMatch.Groups[1].Value;$text=$labelMatch.Groups[2].Value
  }else{$text=$p.RichText((TextControl 1283 'RichEdit20W').Hwnd)}
  function TextStyleCombo([int]$id){$control=TextControl $id 'ComboBox';if($control.Enabled){return $p.ComboSelected($control.Hwnd)};if($textSource -cne 'label_library'){throw ('Literal Text style control disabled: '+$id)};$raw=$n.GetControlText($control.Hwnd,4096);if([string]::IsNullOrWhiteSpace($raw)){return $null};return [string]$raw}
  $font=TextStyleCombo 1547;$sizeText=TextStyleCombo 1439;$size=$null
  if($null -ne $sizeText){$parsedSize=0;if(![int]::TryParse($sizeText,[ref]$parsedSize) -or $parsedSize -le 0){throw 'Actual Text font size must be a positive integer'};$size=[int]$parsedSize}
  $alignment=TextStyleCombo 1051;$blink=TextStyleCombo 1782
  $commentControl=TextControl 1274 'Button';if($n.GetControlText($commentControl.Hwnd,128) -cne '仅作为批注使用 (不会显示于 HMI)'){throw 'Exact Text comment checkbox label required'};$comment=$n.GetCheckboxState($commentControl.Hwnd);if($comment -notin @(0,1)){throw 'Actual Text comment state required'}
  if($textSource -ceq 'literal'){foreach($value in @($font,$alignment,$blink)){if(!$value){throw 'Actual literal Text combo selection required'}};if($null -eq $size){throw 'Actual literal Text font size required'}}
  $p.SelectTabExact($tab.Hwnd,'轮廓');$position=@();foreach($id in @(1050,1052)){$v=0;$value=$n.GetControlText((TextControl $id 'Edit').Hwnd,64);if(![int]::TryParse($value,[ref]$v) -or $v -lt 0){throw 'Actual nonnegative integer Text position required'};$position+=$v}
  $null=DialogGuard;HashGuard
  $r.actual=[ordered]@{kind='text';text=$text;text_source=$textSource;label_name=$labelName;native_selector_text=$nativeSelectorText;font_size=$size;font=$font;alignment=$alignment;blink=$blink;comment=($comment -eq 1);x=[int]$position[0];y=[int]$position[1]}
  $r.scope='observed Text literal or native library reference/current text, font/alignment/blink/comment/X/Y';$r.full_properties_verified=$false;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage};return
 }
 if($d.Title -cnotin @('数值的属性','功能键的属性','位状态切换开关/位状态指示灯的属性','位状态指示灯/位状态切换开关的属性')){$r.status='unsupported';$r.unsupported_dialog_title=$d.Title;return}
 function C([int]$id,[string]$class){$cs=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq $id -and $_.Class -ceq $class -and $_.Visible});if($cs.Count -ne 1){throw ('Read control not unique: '+$id)};return $cs[0]}
 function Text([int]$id,[string]$class){if($id -eq 1547 -and $class -ceq 'ComboBox'){return $p.ComboSelected((C $id $class).Hwnd)};return $n.GetControlText((C $id $class).Hwnd,65536)}
 function Tab([string]$name){$p.SelectTabExact((C 12320 'SysTabControl32').Hwnd,$name)}
 Tab '一般属性';$cmtFunction=($d.Title -ceq '功能键的属性' -and [IO.Path]::GetExtension($ProjectPath) -ieq '.cmtp')
 $cmtNavigation=$null;$cmtAccountImport=$null
 if($cmtFunction){
  if((@($p.TabNames((C 12320 'SysTabControl32').Hwnd)) -join '|') -cne '一般属性|安全|图片|标签|轮廓'){throw 'Observed cMT existing function five-tab profile required'}
  $qt=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro' -and $_.Visible -and $_.Enabled});if($qt.Count -ne 1){throw 'Unique cMT function General page required'}
  $tc=[PLCCode.Weinview.FunctionWindowTargetControls]::new($n);$cmtType=$tc.InspectCmtFunctionType($DialogHwnd,$qt[0].Hwnd)
  if($cmtType -ceq '窗口'){$main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible});if($main.Count -ne 1){throw 'Unique cMT editor required'};$cmtNavigation=$n.InvokeQtElement($main[0].Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),'function-read')|ConvertFrom-Json;$description=$cmtNavigation.Description}
  else{$cmtAccountImport=$tc.InspectCmtAccountImport($DialogHwnd,$qt[0].Hwnd);$description=$cmtAccountImport.Description}
 }else{$description=Text 1174 'Edit'}
 $a=[ordered]@{kind=$null;description=$description;rectangle=$null;data=$null;style=$null;macro=$null;labels=@()}
 if($d.Title -ceq '数值的属性'){
  $a.kind='numeric_display';$tagName=$null;$tagRow=$null
  # On this native General page, the ordinary Edit2510 is enabled for a
  # direct address and disabled when User-defined Tag is selected. The latter
  # still requires the original Address page and a real Tag-name readback.
  $addressEdits=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq 2510 -and $_.Class -ceq 'Edit' -and $_.Visible})
  if($addressEdits.Count -gt 1){throw ('Native numeric visible address Edit2510 duplicated: count='+$addressEdits.Count)}
  # A Tag-bound numeric can suppress the ordinary editor entirely. Absence is
  # only a reason to inspect the original Address page, never Tag proof itself.
  $directAddress=($addressEdits.Count -eq 1 -and [bool]$addressEdits[0].Enabled)
  if(!$directAddress){
   $addressDialog=([PLCCode.Weinview.NumericTagSettingsControls]::new($n)).OpenAddress($DialogHwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))
   try{
   $userTag=$n.FindUniqueControl($addressDialog,1560,'Button','用户自定义标签');$tagState=$n.GetCheckboxState($userTag.Hwnd)
   if($tagState -notin @(0,1)){throw 'Native numeric User-defined Tag state unavailable'}
   if($tagState -ne 1){throw 'Disabled numeric address editor without native User-defined Tag selection'}
   if($tagState -eq 1){
    $selectors=@();$tagSelector=[PLCCode.Weinview.NumericAddressTypeControls]::new($n,'地址')
    foreach($qt in @($n.EnumChildControls($addressDialog)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$snapshot=$tagSelector.InspectAddressTagDisplayAny($addressDialog,$qt.Hwnd);if($snapshot){$selectors+=,$snapshot}}
    if($selectors.Count -ne 1){throw 'Unique native numeric Tag selector required'}
    $nativeTagDisplay=[string]$selectors[0].NativeValue
    if(!$TagEvidence -or !('PLCCode.Weinview.TagCsvCodec' -as [type])){if(!('PLCCode.Weinview.TagCsvCodec' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'TagCsvCodec.cs') -ReferencedAssemblies 'System.dll'};if(!$TagEvidence){throw 'Same-project native Tag CSV required for bound numeric read'}}
    $csv=[string]$TagEvidence.native_csv_path;$csvHash=[string]$TagEvidence.tags_sha256
    if(!$csv -or !(Test-Path -LiteralPath $csv -PathType Leaf) -or $csvHash -notmatch '^[a-fA-F0-9]{64}$' -or (Get-FileHash -LiteralPath $csv -Algorithm SHA256).Hash -ine $csvHash){throw 'Bound numeric Tag CSV evidence missing or changed'}
    $rows=[PLCCode.Weinview.TagCsvCodec]::Read($csv);[PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$TagEvidence.tags,[PLCCode.Weinview.TagRow[]]$rows)
    $matches=@($rows|Where-Object {$nativeDisplay=if([string]::IsNullOrEmpty([string]$_.comment)){[string]$_.name}else{([string]$_.name)+' ('+([string]$_.comment)+')'};$nativeDisplay -ceq $nativeTagDisplay});if($matches.Count -ne 1){throw ('Native numeric Tag display absent or ambiguous in same-project CSV: '+$nativeTagDisplay)};$tagRow=$matches[0];$tagName=[string]$tagRow.name
    $confirmed=$tagSelector.ConfirmAddressTagDisplay($addressDialog,$selectors[0].Hwnd,$tagName,$nativeTagDisplay)
    if($n.GetCheckboxState($userTag.Hwnd) -ne 1 -or !$confirmed -or $confirmed.Value -cne $tagName){throw 'Native numeric Tag selector changed during read'}
   }
   }finally{
    if(@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $addressDialog}).Count){
     $n.ClickButton($addressDialog,2,'取消')
     $deadline=[DateTime]::UtcNow.AddSeconds(3)
     do{
      $windows=@($n.EnumTopWindows())
      $parentReady=@($windows|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq $d.Title -and $_.Visible -and $_.Enabled})
      if(!@($windows|Where-Object {$_.Hwnd -eq $addressDialog}).Count -and $parentReady.Count -eq 1){break}
      Start-Sleep -Milliseconds 50
     }while([DateTime]::UtcNow -lt $deadline)
     if(@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $addressDialog}).Count){throw 'Native Address read-only cancellation did not close'}
     if($parentReady.Count -ne 1){throw 'Native numeric property did not re-enable after Address cancellation'}
    }
   }
   $null=DialogGuard
   ([PLCCode.Weinview.NumericTagSettingsControls]::new($n)).RestorePropertyFocus($DialogHwnd,$addressDialog)
  }
  if($tagRow){$a.data=@{device=[string]$tagRow.device;address_type=[string]$tagRow.address_type;address=[string]$tagRow.address;tag_name=$tagName;input_enabled=$false;native_tag_csv_sha256=$csvHash};$state=$n.GetCheckboxState((C 1206 'Button').Hwnd);if($state -notin @(0,1)){throw 'Numeric input checkbox state invalid'};$a.data.input_enabled=($state -eq 1)}
  else{$tc=[PLCCode.Weinview.NumericAddressTypeControls]::new($n);$end=[DateTime]::UtcNow.AddSeconds(3);$found=@()
  do{$found=@();$qts=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled});if($qts.Count -gt 8){throw 'Numeric Qt count bound exceeded'}
   foreach($q in $qts){$value=$tc.InspectAny($DialogHwnd,$q.Hwnd);if($value){$found+=$value}}
   if($found.Count -gt 1){throw 'Numeric address-type combo ambiguous'};if($found.Count -eq 1){break};Start-Sleep -Milliseconds 50
  }while([DateTime]::UtcNow -lt $end)
  if($found.Count -ne 1){$r.status='unsupported';$r.unsupported_reason='numeric-address-type-not-observed';return}
  $state=$n.GetCheckboxState((C 1206 'Button').Hwnd);if($state -notin @(0,1)){throw 'Numeric input checkbox state invalid'}
  $a.data=@{device=(Text 1646 'ComboBox');address_type=$found[0].Value;address=(Text 2510 'Edit');tag_name=$null;input_enabled=($state -eq 1);address_type_items=$found[0].Items}}
   Tab '字体';$a.native_font=$p.ComboSelected((C 1547 'ComboBox').Hwnd);$a.native_size=$n.GetControlText((C 1439 'ComboBox').Hwnd,4096)
   Tab '格式';$a.style=@{data_type=(Text 1952 'ComboBox');integer_digits=(Text 1196 'Edit');decimal_digits=(Text 1197 'Edit');minimum=(Text 1200 'Edit');maximum=(Text 1203 'Edit')}
 }elseif($d.Title -cin @('位状态切换开关/位状态指示灯的属性','位状态指示灯/位状态切换开关的属性')){
  $switch=$p.GetRadioState((C 1038 'Button').Hwnd);$lamp=$p.GetRadioState((C 1037 'Button').Hwnd)
  if(($switch -ne 1 -or $lamp -ne 0) -and ($switch -ne 0 -or $lamp -ne 1)){$r.status='unsupported';$r.unsupported_reason='bit-radio-mode-not-implemented';return}
  $nativeBitMode=if($switch -eq 1){$p.ComboSelected((C 1151 'ComboBox').Hwnd)}else{'位状态指示灯'}
  if($switch -eq 1 -and $nativeBitMode -cnotin @('设为 ON','设为 OFF','切换开关','复归型')){$r.status='unsupported';$r.unsupported_reason='bit-mode-not-implemented';return}
  if($n.GetControlText((C 1037 'Button').Hwnd,64) -cne '位状态指示灯' -or $n.GetControlText((C 1038 'Button').Hwnd,64) -cne '位状态切换开关'){throw 'Exact bit radio labels required'}
  $device=$p.ComboSelected((C 1646 'ComboBox').Hwnd)
  $bitAddressEdits=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq 2510 -and $_.Class -ceq 'Edit' -and $_.Visible})
  if($bitAddressEdits.Count -gt 1){throw 'Native bit visible address Edit2510 duplicated'}
  $bitDirect=($bitAddressEdits.Count -eq 1 -and [bool]$bitAddressEdits[0].Enabled)
  $bitTagRow=$null;$bitTagName=$null
  if(!$bitDirect){
   $addressDialog=([PLCCode.Weinview.NumericTagSettingsControls]::new($n)).OpenAddress($DialogHwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))
   try{
    $userTag=$n.FindUniqueControl($addressDialog,1560,'Button','用户自定义标签')
    if($n.GetCheckboxState($userTag.Hwnd) -ne 1){throw 'Disabled bit address editor without native User-defined Tag selection'}
    $selectors=@();$tagSelector=[PLCCode.Weinview.NumericAddressTypeControls]::new($n,'地址')
    foreach($qt in @($n.EnumChildControls($addressDialog)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$snapshot=$tagSelector.InspectAddressTagDisplayAny($addressDialog,$qt.Hwnd);if($snapshot){$selectors+=,$snapshot}}
    if($selectors.Count -ne 1){throw 'Unique native bit Tag selector required'}
    $nativeTagDisplay=[string]$selectors[0].NativeValue
    if(!$TagEvidence){throw 'Same-project native Tag CSV required for bound bit read'}
    if(!('PLCCode.Weinview.TagCsvCodec' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'TagCsvCodec.cs') -ReferencedAssemblies 'System.dll'}
    $csv=[string]$TagEvidence.native_csv_path;$csvHash=[string]$TagEvidence.tags_sha256
    if(!$csv -or !(Test-Path -LiteralPath $csv -PathType Leaf) -or $csvHash -notmatch '^[A-Fa-f0-9]{64}$' -or (Get-FileHash -LiteralPath $csv -Algorithm SHA256).Hash -ine $csvHash){throw 'Bound bit Tag CSV evidence missing or changed'}
    $rows=[PLCCode.Weinview.TagCsvCodec]::Read($csv);[PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$TagEvidence.tags,[PLCCode.Weinview.TagRow[]]$rows)
    $matches=@($rows|Where-Object {$display=if([string]::IsNullOrEmpty([string]$_.comment)){[string]$_.name}else{([string]$_.name)+' ('+([string]$_.comment)+')'};$display -ceq $nativeTagDisplay})
    if($matches.Count -ne 1){throw 'Native bit Tag display absent or ambiguous in same-project CSV'}
    $bitTagRow=$matches[0];$bitTagName=[string]$bitTagRow.name
    $confirmed=$tagSelector.ConfirmAddressTagDisplay($addressDialog,$selectors[0].Hwnd,$bitTagName,$nativeTagDisplay)
    if(!$confirmed -or $confirmed.Value -cne $bitTagName -or $n.GetCheckboxState($userTag.Hwnd) -ne 1){throw 'Native bit Tag selector changed during read'}
   }finally{
    if(@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $addressDialog -and $_.Enabled}).Count){
     $n.ClickButton($addressDialog,2,'取消')
     $deadline=[DateTime]::UtcNow.AddSeconds(3)
     do{
      $windows=@($n.EnumTopWindows())
      $parentReady=@($windows|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Visible -and $_.Enabled})
      if(!@($windows|Where-Object {$_.Hwnd -eq $addressDialog}).Count -and $parentReady.Count -eq 1){break}
      Start-Sleep -Milliseconds 30
     }while([DateTime]::UtcNow -lt $deadline)
     if(@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $addressDialog}).Count -or $parentReady.Count -ne 1){throw 'Native bit property did not re-enable after Address cancellation'}
    }
   }
   $null=DialogGuard
   ([PLCCode.Weinview.NumericTagSettingsControls]::new($n)).RestorePropertyFocus($DialogHwnd,$addressDialog)
  }
  if($bitTagRow){$device=[string]$bitTagRow.device;$addressType=[string]$bitTagRow.address_type;$bitAddress=[string]$bitTagRow.address}
  else{
  if(!$device -or @($p.ComboItems((C 1646 'ComboBox').Hwnd)|Where-Object {$_ -ceq $device}).Count -ne 1){throw 'Actual native bit device absent from project choices'}
  $tc=[PLCCode.Weinview.BitAddressTypeControls]::new($n,$d.Title);$found=@();foreach($qt in @($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$v=$tc.InspectAny($DialogHwnd,$qt.Hwnd);if($v){$found+=$v}}
  if($found.Count -ne 1){$r.status='unsupported';$r.unsupported_reason='bit-address-type-ambiguous';return}
  $addressType=[string]$found[0].Value
  if($device -ceq 'Local HMI' -and $addressType -cne 'LB'){$r.status='unsupported';$r.unsupported_reason='bit-local-type-not-LB';return}
  $bitAddress=Text 2510 'Edit'
  }
  $a.kind=if($lamp -eq 1){'bit_lamp'}else{'bit_switch'};$a.bit=[ordered]@{device=$device;address_type=$addressType;address=$bitAddress;tag_name=$bitTagName;operation_mode=$nativeBitMode}
  $flags=@(if($lamp -eq 1){,@('inverted',1856)}else{@(@('distinct_read_write',1205),@('inverted',1856),@('trigger_on_release',1650),@('macro_enabled',1868))})
  $flagLabels=@{1205='读取/写入使用不同的地址';1856='输出反向';1650='当按钮松开后发出指令';1868='触发宏指令'}
  foreach($flag in $flags){
   $controls=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq $flag[1] -and $_.Class -ceq 'Button' -and $_.Title -ceq $flagLabels[[int]$flag[1]]})
   $expectedVisible= -not($nativeBitMode -ceq '复归型' -and $flag[0] -ceq 'trigger_on_release')
   if($controls.Count -ne 1 -or [bool]$controls[0].Visible -ne $expectedVisible){throw 'Actual bit-mode flag control profile differs'}
   # Momentary hides the release-delay checkbox. Read its actual bounded BM_GETCHECK
   # state from the same owned dialog; never invent a hidden value or click it.
   $state=$n.GetCheckboxState($controls[0].Hwnd)
   if($state -ne 0){$r.status='unsupported';$r.unsupported_reason='bit-extra-flags-not-implemented';return}
   $a.bit[$flag[0]]=($state -eq 1)
  }
  if($device -ceq 'Local HMI' -and !$bitTagName){$address=0;if(![int]::TryParse($a.bit.address,[ref]$address) -or $address -lt 0 -or $address -gt 8999){throw 'Local LB0..8999 required'}}
  elseif([string]::IsNullOrWhiteSpace([string]$a.bit.address) -or ([string]$a.bit.address).Length -gt 128 -or [string]$a.bit.address -match '[\x00-\x1f\x7f]'){throw 'Actual external bit address text invalid'}
  Tab '标签';$combo=C 1208 'ComboBox';$original=$p.ComboSelected($combo.Hwnd);$states=@($p.ComboItems($combo.Hwnd));if(@($states|Where-Object {$_ -ceq '0'}).Count -ne 1 -or @($states|Where-Object {$_ -ceq '1'}).Count -ne 1){throw 'Native label states0/1 required'}
  try{foreach($state in @('0','1')){$p.SelectComboExact($combo.Hwnd,$state);$a.labels+=@{state=$state;font=(Text 1547 'ComboBox');size=(Text 1439 'ComboBox');text=(Text 1283 'RichEdit20W')}}}
  finally{$p.SelectComboExact($combo.Hwnd,$original);if($p.ComboSelected($combo.Hwnd) -cne $original){throw 'Original label state not restored'}}
  $a.label_state_restored=$original
 }else{
  if($cmtFunction){
   if($cmtNavigation){$match=[regex]::Match($cmtNavigation.Value,'^(\d+)\. (.+)$');if(!$match.Success){throw 'Actual cMT target full label format differs'}
    $a.kind='window_button';$a.window=@{action='切换基本窗口';target_window=@{number=[int]$match.Groups[1].Value;name=$match.Groups[2].Value};trigger_on_release=$cmtNavigation.TriggerOnRelease}}
   else{$a.kind='window_button';$a.window=@{action='导入用户账户';target_window=$null;media=$cmtAccountImport.Media;import_mode=$cmtAccountImport.ImportMode;delete_after_import=[bool]$cmtAccountImport.DeleteAfterImport;trigger_on_release=$cmtAccountImport.TriggerOnRelease}}
  }elseif($p.GetRadioState((C 1198 'Button').Hwnd) -eq 1){
  $a.kind='macro_button';$selection=Text 1417 'ComboBox';$match=[regex]::Match($selection,'^\[ID:(\d{3})\]\s+(.+)$');if(!$match.Success){throw 'Native macro selection format differs'}
  $a.macro=@{id=[int]$match.Groups[1].Value;name=$match.Groups[2].Value;selection_text=$selection}
  }elseif($p.GetRadioState((C 1185 'Button').Hwnd) -eq 1 -and $p.ComboSelected((C 1187 'ComboBox').Hwnd) -ceq '切换基本窗口'){
   $main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))});if($main.Count -ne 1){throw 'Unique owned editor required'}
   $navigation=$n.InvokeQtElement($main[0].Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),'function-read')|ConvertFrom-Json
   $match=[regex]::Match($navigation.Value,'^(\d+)\. (.+)$');if(!$match.Success){throw 'Native window target format changed'}
   $a.kind='window_button';$a.window=@{action='切换基本窗口';target_window=@{number=[int]$match.Groups[1].Value;name=$match.Groups[2].Value};trigger_on_release=$navigation.TriggerOnRelease}
  }else{$r.status='unsupported';$r.unsupported_reason='function-key-mode-not-implemented';return}
  Tab '标签';$combo=C 1208 'ComboBox';$original=$p.ComboSelected($combo.Hwnd);$states=@($p.ComboItems($combo.Hwnd));if(@($states|Where-Object {$_ -ceq '0'}).Count -ne 1 -or @($states|Where-Object {$_ -ceq '1'}).Count -ne 1){throw 'Native label states0/1 required'}
  try{foreach($state in @('0','1')){$p.SelectComboExact($combo.Hwnd,$state);$a.labels+=@{state=$state;font=(Text 1547 'ComboBox');size=(Text 1439 'ComboBox');text=(Text 1283 'RichEdit20W')}}}
  finally{$p.SelectComboExact($combo.Hwnd,$original);if($p.ComboSelected($combo.Hwnd) -cne $original){throw 'Original label state not restored'}}
  $a.label_state_restored=$original
 }
 $rect=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Read -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath|ConvertFrom-Json;$a.rectangle=@($rect.After);$a.rectangle_aspect_state=$rect.OriginalAspect
 $null=DialogGuard;HashGuard;$r.actual=$a;$r.status='success';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;if($ReadSecurityClass){$r.security_class=ReadSecurityClassPage}
}catch{$r.error=$_.Exception.Message;throw}finally{if($canWrite){$r.finished_utc=[DateTime]::UtcNow.ToString('o');$r|ConvertTo-Json -Depth 15|Set-Content -LiteralPath $OutputPath -Encoding UTF8}}
