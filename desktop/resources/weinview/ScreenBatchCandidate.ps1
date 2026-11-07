# Unregistered TK screen draft. No GUI launch, OCR click, placement, save or compile.
param([ValidateSet('ValidatePlan','InspectDialog','ConfigureNumericText','ConfigureFunctionText','ConfigureNumericStyle','ReadNumericStyle','ConfigureButtonLabels','ReadButtonLabels','SetRectangle','ReadRectangle')][string]$Mode='ValidatePlan',[Parameter(Mandatory=$true)][string]$PlanPath,[string]$IdentityPath,[long]$DialogHwnd=0,[int]$ObjectIndex=0,[string]$ProjectPath)
$ErrorActionPreference='Stop'
$plan=Get-Content -LiteralPath $PlanPath -Raw | ConvertFrom-Json
if($plan.profile -cne 'weinview-cn421-tk800x480' -or [int]$plan.screen -ne 10){throw 'Only verified TK800x480/window10 profile accepted'}
$objects=@($plan.objects);if($objects.Count -lt 1 -or $objects.Count -gt 8){throw 'Batch size must be 1..8'}
$seen=@{}
foreach($obj in $objects){
 if($obj.kind -cnotin @('numeric_display','macro_button')){throw 'Unsupported object kind'}
 if([string]::IsNullOrWhiteSpace($obj.description) -or $obj.description.Length -gt 64 -or $obj.description -match '[\x00-\x1f]'){throw 'Unique bounded description required'}
 if($seen.ContainsKey($obj.description)){throw 'Duplicate description'};$seen[$obj.description]=$true
 if(@($obj.rect).Count -ne 4){throw 'Canvas rect x/y/width/height required'}
 $r=@($obj.rect);foreach($n in $r){if($n -isnot [int] -and $n -isnot [long]){throw 'Integer canvas rect required'}}
 if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 20 -or $r[3] -lt 20 -or $r[0]+$r[2] -gt 800 -or $r[1]+$r[3] -gt 480){throw 'Canvas rect out of bounds'}
 if($obj.kind -ceq 'numeric_display'){
  if($obj.device -cne 'Local HMI' -or $obj.addressType -cne 'LW' -or $obj.dataType -cne '16-bit Signed' -or [int]$obj.address -lt 0 -or [int]$obj.address -gt 65535){throw 'Only Local HMI LW 16-bit Signed display accepted'}
 }elseif([int]$obj.macroId -lt 0 -or [int]$obj.macroId -gt 255 -or [string]::IsNullOrWhiteSpace($obj.macroName)){throw 'Existing macro identity required'}
}
if($Mode -eq 'ValidatePlan'){
 [ordered]@{Valid=$true;Objects=$objects.Count;Scope=$plan.profile;NativeAcceptanceComplete=$false;BlockedStages=@('fresh_owned_screenshot_context','ocr_unique_ribbon_action','initial_object_placement','qt_address_type_readback','save_reopen_objects_readback')} | ConvertTo-Json -Depth 4;return
}
if(-not $IdentityPath -or $DialogHwnd -le 0 -or $ObjectIndex -lt 0 -or $ObjectIndex -ge $objects.Count){throw 'Bound identity/dialog/object index required'}
$identity=Get-Content -LiteralPath $IdentityPath -Raw | ConvertFrom-Json
if(-not $ProjectPath -or -not $identity.Project -or [IO.Path]::GetFullPath($ProjectPath) -ine [IO.Path]::GetFullPath($identity.Project) -or -not (Test-Path -LiteralPath $ProjectPath -PathType Leaf)){throw 'Explicit owned project must match launch identity'}
if(-not ('PLCCode.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')}
Add-Type -AssemblyName Accessibility
if(-not ('PLCCode.Weinview.Research.NativePropertyCandidate' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativePropertyCandidate.cs') -ReferencedAssemblies @('System.dll',[Accessibility.IAccessible].Assembly.Location)}
$native=[PLCCode.Weinview.NativeControls]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe,800)
$property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe)
$main=@($native.EnumTopWindows() | Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))})
if($main.Count -ne 1){throw 'Owned main document title mismatch'}
$obj=$objects[$ObjectIndex];$titles=if($obj.kind -ceq 'numeric_display'){@('新增 数值','数值的属性')}else{@('新增 功能键','功能键的属性')}
$dialog=@($native.EnumTopWindows() | Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -cin $titles -and $_.Visible -and $_.Enabled})
if($dialog.Count -ne 1){throw 'Exact owned native property dialog required'}
function Read-Control([int]$Id,[string]$Class){$c=$native.FindUniqueControlWithoutLabel($DialogHwnd,$Id,$Class);return $native.GetControlText($c.Hwnd,4096)}
function Set-Edit([int]$Id,[string]$Value){$c=$native.FindUniqueControlWithoutLabel($DialogHwnd,$Id,'Edit');$native.SetControlText($c.Hwnd,$Value);if((Read-Control $Id 'Edit') -cne $Value){throw "Edit readback mismatch: $Id"}}
function Tab([string]$Name){$c=$native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');$property.SelectTabExact($c.Hwnd,$Name)}
function Combo([int]$Id,[string]$Text){$c=$native.FindUniqueControlWithoutLabel($DialogHwnd,$Id,'ComboBox');$property.SelectComboExact($c.Hwnd,$Text)}
if($Mode -eq 'InspectDialog'){$native.EnumChildControls($DialogHwnd) | Where-Object Visible | ConvertTo-Json -Depth 4;return}
if($Mode -in @('SetRectangle','ReadRectangle')){
 $argsRect=@{IdentityPath=$IdentityPath;DialogHwnd=$DialogHwnd;ProjectPath=$ProjectPath;Action='Read'}
 if($Mode -eq 'SetRectangle'){$argsRect.Action='Set';$argsRect.X=$obj.rect[0];$argsRect.Y=$obj.rect[1];$argsRect.Width=$obj.rect[2];$argsRect.Height=$obj.rect[3]}
 & (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') @argsRect;return
}
if($Mode -in @('ConfigureNumericStyle','ReadNumericStyle')){
 if($obj.kind -cne 'numeric_display'){throw 'Numeric object required'};Tab '格式'
 if($Mode -eq 'ConfigureNumericStyle'){Combo 1952 '16-bit Signed';Set-Edit 1196 '5';Set-Edit 1197 '0';Set-Edit 1200 '-32768';Set-Edit 1203 '32767'}
 $style=[ordered]@{Type=Read-Control 1952 'ComboBox';IntegerDigits=Read-Control 1196 'Edit';DecimalDigits=Read-Control 1197 'Edit';Minimum=Read-Control 1200 'Edit';Maximum=Read-Control 1203 'Edit'}
 if($style.Type -cne '16-bit Signed' -or $style.IntegerDigits -cne '5' -or $style.DecimalDigits -cne '0' -or $style.Minimum -cne '-32768' -or $style.Maximum -cne '32767'){throw 'Numeric style full readback mismatch'}
 [ordered]@{Style=$style;Confirmed=$false;Saved=$false;ReopenedVerified=$false} | ConvertTo-Json;return
}
if($Mode -in @('ConfigureButtonLabels','ReadButtonLabels')){
 if($obj.kind -cne 'macro_button'){throw 'Macro button required'}
 $labels=@($obj.labels);if($labels.Count -ne 2 -or $labels[0].state -cne '0' -or $labels[1].state -cne '1'){throw 'Explicit state0/state1 labels required'}
 foreach($label in $labels){if($label.font -cne 'Microsoft YaHei' -or $label.size -cne '24' -or [string]::IsNullOrWhiteSpace($label.text) -or $label.text.Length -gt 64){throw 'Explicit verified Microsoft YaHei/24 label text required'}}
 Tab '标签';$readbacks=@()
 if($Mode -eq 'ConfigureButtonLabels'){
  $toggle=$native.FindUniqueControl($DialogHwnd,1272,'Button','使用文字标签');if($native.GetCheckboxState($toggle.Hwnd) -ne 1){$native.ClickButton($DialogHwnd,1272,'使用文字标签')}
 }
 foreach($label in $labels){
  Combo 1208 ([string]$label.state)
  if($Mode -eq 'ConfigureButtonLabels'){
   Combo 1547 ([string]$label.font);Combo 1439 ([string]$label.size)
   $edit=$native.FindUniqueControlWithoutLabel($DialogHwnd,1283,'RichEdit20W');$property.SetRichTextExact($edit.Hwnd,[string]$label.text)
  }
  $read=[ordered]@{State=Read-Control 1208 'ComboBox';Font=Read-Control 1547 'ComboBox';Size=Read-Control 1439 'ComboBox';Text=Read-Control 1283 'RichEdit20W'}
  if($read.State -cne $label.state -or $read.Font -cne $label.font -or $read.Size -cne $label.size -or $read.Text -cne $label.text){throw 'State/font/size/text readback mismatch'};$readbacks+=$read
 }
 # Force parent state-change handlers to commit both buffers, then verify retained values.
 $roundtrip=@()
 foreach($state in @('0','1','0')){
  Combo 1208 $state;$spec=@($labels | Where-Object state -CEQ $state)[0]
  $actual=[ordered]@{State=Read-Control 1208 'ComboBox';Font=Read-Control 1547 'ComboBox';Size=Read-Control 1439 'ComboBox';Text=Read-Control 1283 'RichEdit20W'}
  if($actual.State -cne $spec.state -or $actual.Font -cne $spec.font -or $actual.Size -cne $spec.size -or $actual.Text -cne $spec.text){throw 'Label state roundtrip readback failed; no confirm/save'}
  $roundtrip+=$actual
 }
 [ordered]@{Labels=$readbacks;StateRoundtrip=$roundtrip;Confirmed=$false;Saved=$false;ReopenedVerified=$false} | ConvertTo-Json -Depth 5;return
}
if($Mode -eq 'ConfigureNumericText'){
 if($obj.kind -cne 'numeric_display'){throw 'Numeric object required'}
 Tab '一般属性'
 function Unique-LWQt {
  $deadline=[DateTime]::UtcNow.AddSeconds(3);$diagnostics=@();$poll=0
  do{
   $poll++;$matches=@();$rows=@()
   $candidates=@($native.EnumChildControls($DialogHwnd) | Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})
   if($candidates.Count -gt 8){throw 'Qt small-control enumeration bound exceeded'}
   foreach($candidate in $candidates){
    try{$value=$property.ComboQtValue($candidate.Hwnd)}catch{
     $errorObject=$_.Exception;while($errorObject.InnerException){$errorObject=$errorObject.InnerException}
     $rows+=@{Hwnd=$candidate.Hwnd;Error=$errorObject.Message}
     if($errorObject.Message -cne 'Unique Qt address-type Combo plus LW/RW items required'){throw}
     continue
    }
    $rows+=@{Hwnd=$candidate.Hwnd;Value=$value}
    if($value -cne 'LW'){throw ('Semantic address-type is not LW: '+$value)}
    $matches+=@{Hwnd=$candidate.Hwnd;Value=$value}
   }
   $diagnostics+=@{Poll=$poll;Candidates=$rows}
   if($matches.Count -gt 1){throw 'Ambiguous semantic Qt LW address type'}
   if($matches.Count -eq 1){return $matches[0]}
   $remaining=($deadline-[DateTime]::UtcNow).TotalMilliseconds
   if($remaining -le 0 -or $poll -ge 60){break}
   Start-Sleep -Milliseconds ([int][Math]::Min(50,$remaining))
  }while([DateTime]::UtcNow -lt $deadline)
  throw ('Unique semantic Qt LW address type absent after 3-second read-only wait; diagnostics='+($diagnostics | ConvertTo-Json -Depth 6 -Compress))
 }
 $type=Unique-LWQt
 if((Read-Control 1646 'ComboBox') -cne 'Local HMI'){throw 'Only preselected Local HMI device supported'}
 $input=$native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能');if($native.GetCheckboxState($input.Hwnd) -ne 0){$native.ClickButton($DialogHwnd,1206,'启用输入功能')}
 if($native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能')).Hwnd) -ne 0){throw 'Readonly input-state readback failed'}
 Set-Edit 1174 ([string]$obj.description);Set-Edit 2510 ([string]$obj.address)
 $type=Unique-LWQt
 if($type.Value -cne 'LW' -or (Read-Control 1646 'ComboBox') -cne 'Local HMI'){throw 'Device/type readback changed'}
 [ordered]@{Device='Local HMI';AddressType='LW';Address=Read-Control 2510 'Edit';Description=Read-Control 1174 'Edit';InputEnabled=$false;Confirmed=$false;Saved=$false;ReopenedVerified=$false} | ConvertTo-Json;return
}
if($Mode -eq 'ConfigureFunctionText'){
 if($obj.kind -cne 'macro_button'){throw 'Macro button required'};Tab '一般属性'
 $radio=$native.FindUniqueControl($DialogHwnd,1198,'Button','触发宏指令');if($property.GetRadioState($radio.Hwnd) -ne 1){$native.ClickButton($DialogHwnd,1198,'触发宏指令')}
 if($property.GetRadioState(($native.FindUniqueControl($DialogHwnd,1198,'Button','触发宏指令')).Hwnd) -ne 1){throw 'Macro trigger readback failed'}
 $wanted='[ID:'+([int]$obj.macroId).ToString('000')+'] '+$obj.macroName;Combo 1417 $wanted;Set-Edit 1174 ([string]$obj.description)
}
[ordered]@{ConfiguredStage=$Mode;Confirmed=$false;Saved=$false;ReopenedVerified=$false} | ConvertTo-Json
