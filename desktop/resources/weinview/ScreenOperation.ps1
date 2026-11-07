# Candidate existing-object property operation. Caller owns open/save/close/reopen.
param([ValidateSet('Apply','Read')][string]$Action='Read',[Parameter(Mandatory=$true)][string]$IdentityPath,[Parameter(Mandatory=$true)][string]$ProjectPath,[Parameter(Mandatory=$true)][string]$ExpectedProjectSha256,[Parameter(Mandatory=$true)][string]$PlanPath,[int]$ObjectIndex=-1,[long]$DialogHwnd=0,[string]$ExpectedDescription,[Parameter(Mandatory=$true)][string]$OutputPath,[switch]$WholeScene,[long]$MainHwnd=0,[string]$TrustedScenePath)
$ErrorActionPreference='Stop'
$started=[DateTime]::UtcNow
$receipt=[ordered]@{Schema='weinview-existing-screen-object/v1';Action=$Action;Status='failed';Stage='preflight';StartedUtc=$started.ToString('o');Confirmed=$false;Saved=$false;ReopenedVerified=$false;NewObjectCreated=$false}
try {
 if($ExpectedProjectSha256 -notmatch '^[A-Fa-f0-9]{64}$'){throw 'Explicit full fresh project SHA256 required'}
 $project=(Resolve-Path -LiteralPath $ProjectPath).Path
 if((Get-FileHash -LiteralPath $project -Algorithm SHA256).Hash -ine $ExpectedProjectSha256){throw 'Fresh existing project hash mismatch'}
 $identity=Get-Content -LiteralPath $IdentityPath -Raw | ConvertFrom-Json
 if(-not $identity.Project -or [IO.Path]::GetFullPath($identity.Project) -ine $project){throw 'Owned launch project identity mismatch'}
 $plan=Get-Content -LiteralPath $PlanPath -Raw | ConvertFrom-Json
 $valid=& (Join-Path $PSScriptRoot 'ScreenBatchCandidate.ps1') -Mode ValidatePlan -PlanPath $PlanPath | ConvertFrom-Json
 if(-not $valid.Valid -or (-not $WholeScene -and ($ObjectIndex -lt 0 -or $ObjectIndex -ge @($plan.objects).Count))){throw 'Invalid profile or object index'}

 if($WholeScene){
  $receipt.Schema='weinview-trusted-two-object-screen/v1';$receipt.Stage='trusted-scene-preflight'
  if(-not $TrustedScenePath -or $MainHwnd -le 0){throw 'Trusted scene metadata and exact own main required'}
  $trust=Get-Content -LiteralPath $TrustedScenePath -Raw | ConvertFrom-Json
  if($trust.Profile -cne 'weinview-cn421-tk800x480' -or [int]$trust.Screen -ne 10 -or $trust.ProjectSha256 -ine $ExpectedProjectSha256){throw 'Trusted source scene hash/profile mismatch'}
  $sources=@($trust.Objects);$targets=@($plan.objects)
  if($sources.Count -ne 2 -or $targets.Count -ne 2 -or $sources[0].Kind -cne 'numeric_display' -or $sources[1].Kind -cne 'macro_button' -or $targets[0].kind -cne 'numeric_display' -or $targets[1].kind -cne 'macro_button'){throw 'Exactly ordered trusted numeric then macro-button profile required'}
  $labels=@($targets[1].labels)
  if($labels.Count -ne 2 -or $labels[0].state -cne '0' -or $labels[1].state -cne '1'){throw 'Explicit two-state recipe required before any scene mutation'}
  foreach($label in $labels){if($label.font -cne 'Microsoft YaHei' -or $label.size -cne '24' -or [string]::IsNullOrWhiteSpace($label.text) -or $label.text.Length -gt 64){throw 'Unsupported label recipe before any scene mutation'}}
  foreach($source in $sources){
   if([string]::IsNullOrWhiteSpace($source.Description) -or @($source.Rectangle).Count -ne 4){throw 'Exact source description/rectangle required'}
   $r=@($source.Rectangle);if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 1 -or $r[3] -lt 1 -or $r[0]+$r[2] -gt 800 -or $r[1]+$r[3] -gt 480){throw 'Source rectangle bounds failed'}
  }
  function Overlap($a,$b){return ($a[0] -lt $b[0]+$b[2] -and $a[0]+$a[2] -gt $b[0] -and $a[1] -lt $b[1]+$b[3] -and $a[1]+$a[3] -gt $b[1])}
  if((Overlap $sources[0].Rectangle $sources[1].Rectangle) -or (Overlap $targets[0].rect $targets[1].rect) -or ($Action -eq 'Apply' -and (Overlap $targets[0].rect $sources[1].Rectangle))){throw 'Overlapping source/target object footprints unsupported'}
  if(-not ('PLC Engineering Suite.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')}
  Add-Type -AssemblyName Accessibility
  if(-not ('PLC Engineering Suite.Weinview.Research.NativePropertyCandidate' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativePropertyCandidate.cs') -ReferencedAssemblies @('System.dll',[Accessibility.IAccessible].Assembly.Location)}
  if(-not ('PLC Engineering Suite.Weinview.Research.NativeScreenScene' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeScreenScene.cs') -ReferencedAssemblies @('System.dll','System.Drawing.dll')}
  $controls=[PLC Engineering Suite.Weinview.NativeControls]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe,800)
  $tabs=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe)
  $mainMatch=@($controls.EnumTopWindows() | Where-Object {$_.Hwnd -eq $MainHwnd -and $_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Enabled -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($project))})
  if($mainMatch.Count -ne 1){throw 'Exact caller-owned main document mismatch'}
  $scene=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe,$MainHwnd)
  $receipt.ObjectEvidence=@();$receipt.objects=@();$receipt.Identity=$identity;$receipt.SourceSha256=$ExpectedProjectSha256;$receipt.SceneCaptureAttempts=@()
  for($index=0;$index -lt 2;$index++){
   $receipt.Stage="object-$index-scene-capture"
   if((Get-FileHash -LiteralPath $project).Hash -ine $ExpectedProjectSha256){throw 'Project file changed between object stages'}
   $paintDeadline=[DateTime]::UtcNow.AddSeconds(8);$evidence=$null;$captureAttempt=0
   do{
    $screenshot=$OutputPath+".scene-$index.attempt-$captureAttempt.png";$captureAttempt++
    try{
     $evidence=$scene.Capture($screenshot)
     $receipt.SceneCaptureAttempts+=@{ObjectIndex=$index;Attempt=$captureAttempt;Status='ready';ImagePath=$screenshot;CanvasBox=$evidence.CanvasBox}
     break
    }catch{
     $captureError=$_.Exception
     while($null -ne $captureError.InnerException){$captureError=$captureError.InnerException}
          if($captureError.GetType().FullName -ceq 'PLC Engineering Suite.Weinview.Research.SceneGeometryChangedException'){
      $receipt.SceneCaptureAttempts+=@{ObjectIndex=$index;Attempt=$captureAttempt;Status='geometry-changed';ImagePath=$captureError.ImagePath;Before=$captureError.Before;After=$captureError.After}
     }elseif($captureError.GetType().FullName -ceq 'PLC Engineering Suite.Weinview.Research.CanvasNotPaintedException'){
      $receipt.SceneCaptureAttempts+=@{ObjectIndex=$index;Attempt=$captureAttempt;Status='not-painted';ImagePath=$captureError.ImagePath;CanvasBox=$captureError.CanvasBox;PixelCount=$captureError.PixelCount}
     }else{throw}
     $remaining=($paintDeadline-[DateTime]::UtcNow).TotalMilliseconds
     if($remaining -le 0 -or $captureAttempt -ge 54){throw 'Owned canvas did not paint exact lavender800x480 within bounded 8-second wait'}
     Start-Sleep -Milliseconds ([int][Math]::Min(150,$remaining))
    }
   }while([DateTime]::UtcNow -lt $paintDeadline)
   if($null -eq $evidence){throw 'Owned canvas painting deadline expired'}
   $r=$sources[$index].Rectangle;$scene.OpenExistingObject($evidence,[int]$r[0],[int]$r[1],[int]$r[2],[int]$r[3])
   $title=if($index -eq 0){'数值的属性'}else{'功能键的属性'}
   $deadline=[DateTime]::UtcNow.AddSeconds(6);$found=$null
   do{
    $matches=@($controls.EnumTopWindows() | Where-Object {$_.Class -ceq '#32770' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled})
    if($matches.Count -gt 1){throw 'Ambiguous object property dialogs'}
    if($matches.Count -eq 1){
     try{$tabControl=$controls.FindUniqueControlWithoutLabel($matches[0].Hwnd,12320,'SysTabControl32');$tabs.SelectTabExact($tabControl.Hwnd,'一般属性');$description=$controls.FindUniqueControlWithoutLabel($matches[0].Hwnd,1174,'Edit');$actualDescription=$controls.GetControlText($description.Hwnd,256);if($actualDescription -cne $sources[$index].Description){throw 'Trusted source object popup description mismatch'};$found=$matches[0]}catch{if($_.Exception.Message -like '*description mismatch*'){throw}}
    }
    if($null -ne $found){break};Start-Sleep -Milliseconds 50
   }while([DateTime]::UtcNow -lt $deadline)
   if($null -eq $found){throw 'Expected object popup/type/description did not become ready'}
   $receipt.Stage="object-$index-properties"
   $childReceipt=$OutputPath+".object-$index.json"
   & $PSCommandPath -Action $Action -IdentityPath $IdentityPath -ProjectPath $project -ExpectedProjectSha256 $ExpectedProjectSha256 -PlanPath $PlanPath -ObjectIndex $index -DialogHwnd $found.Hwnd -ExpectedDescription $sources[$index].Description -OutputPath $childReceipt
   $child=Get-Content -LiteralPath $childReceipt -Raw | ConvertFrom-Json
   if($child.Status -cne 'success'){throw 'Object property operation failed'}
   if($Action -eq 'Read'){
    $actual=$child.Actual;$wanted=$targets[$index]
    if($actual.Description -cne $wanted.description){throw 'Persisted description mismatch'}
    for($n=0;$n -lt 4;$n++){if($actual.Rectangle[$n] -ne $wanted.rect[$n]){throw 'Persisted rectangle mismatch'}}
    if($index -eq 0 -and ($actual.Data.Device -cne 'Local HMI' -or $actual.Data.AddressType -cne 'LW' -or $actual.Data.Address -cne [string]$wanted.address -or $actual.Data.InputEnabled)){throw 'Persisted numeric data mismatch'}
    if($index -eq 0 -and ($actual.Style.Type -cne '16-bit Signed' -or $actual.Style.IntegerDigits -cne '5' -or $actual.Style.DecimalDigits -cne '0' -or $actual.Style.Minimum -cne '-32768' -or $actual.Style.Maximum -cne '32767')){throw 'Persisted numeric style mismatch'}
    if($index -eq 1 -and ($actual.Macro.Id -ne $wanted.macroId -or $actual.Macro.Name -cne $wanted.macroName)){throw 'Persisted macro selection mismatch'}
    if($index -eq 1){
     foreach($label in @($wanted.labels)){$matches=@($actual.Labels | Where-Object State -CEQ $label.state);if($matches.Count -ne 1 -or $matches[0].Font -cne $label.font -or $matches[0].Size -cne $label.size -or $matches[0].Text -cne $label.text){throw 'Persisted label state/font/size/text mismatch'}}
    }
   }
   $receipt.Stage="object-$index-dialog-confirm"
   if($Action -eq 'Apply'){$controls.ClickButton($found.Hwnd,1,'确定')}else{$controls.ClickButton($found.Hwnd,2,'取消')}
   $closed=$false;$closeDeadline=[DateTime]::UtcNow.AddSeconds(4)
   do{$left=@($controls.EnumTopWindows() | Where-Object Hwnd -EQ $found.Hwnd);if($left.Count -eq 0){$closed=$true;break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $closeDeadline)
   if(-not $closed){throw 'Object property dialog did not close; no retry'}
   $receipt.ObjectEvidence+=@{Index=$index;Scene=$evidence;ReceiptPath=$childReceipt;Actual=$child.Actual;DialogConfirmed=($Action -eq 'Apply');DialogCancelled=($Action -eq 'Read')}
   $actual=$child.Actual
   $semantic=[ordered]@{kind=$actual.Kind;description=$actual.Description;screen=[int]$actual.Screen;rectangle=@($actual.Rectangle);data=$null;style=$null;macro=$null;labels=@()}
   if($index -eq 0){
    $semantic.data=[ordered]@{device=$actual.Data.Device;address_type=$actual.Data.AddressType;address=[int]$actual.Data.Address;input_enabled=[bool]$actual.Data.InputEnabled}
    $semantic.style=[ordered]@{data_type=$actual.Style.Type;integer_digits=[int]$actual.Style.IntegerDigits;decimal_digits=[int]$actual.Style.DecimalDigits;minimum=[int]$actual.Style.Minimum;maximum=[int]$actual.Style.Maximum}
   }else{
    $semantic.macro=[ordered]@{id=[int]$actual.Macro.Id;name=$actual.Macro.Name;selection_text=$actual.Macro.SelectionText}
    $semantic.labels=@($actual.Labels | ForEach-Object {[ordered]@{state=[int]$_.State;font=$_.Font;size=[int]$_.Size;text=$_.Text}})
   }
   $receipt.objects+=$semantic
  }
  $receipt.Status='success';$receipt.Stage='two-existing-objects-complete';$receipt.Confirmed=($Action -eq 'Apply');$receipt.Saved=$false;$receipt.ReopenedVerified=$false
  return
 }
 $obj=@($plan.objects)[$ObjectIndex]
 # This profile never claims variable object counts/new creation or user project discovery.
 if(@($plan.objects).Count -ne 2 -or @($plan.objects | Where-Object kind -CEQ 'numeric_display').Count -ne 1 -or @($plan.objects | Where-Object kind -CEQ 'macro_button').Count -ne 1){throw 'Only trusted existing one-numeric/one-macro-button profile accepted'}
 if($obj.kind -ceq 'macro_button'){
  $labels=@($obj.labels);if($labels.Count -ne 2 -or $labels[0].state -cne '0' -or $labels[1].state -cne '1'){throw 'Explicit two-state label recipe required before mutation'}
  foreach($label in $labels){if($label.font -cne 'Microsoft YaHei' -or $label.size -cne '24' -or [string]::IsNullOrWhiteSpace($label.text) -or $label.text.Length -gt 64){throw 'Unsupported button label recipe before mutation'}}
 }
 if(-not ('PLC Engineering Suite.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')}
 Add-Type -AssemblyName Accessibility
 if(-not ('PLC Engineering Suite.Weinview.Research.NativePropertyCandidate' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativePropertyCandidate.cs') -ReferencedAssemblies @('System.dll',[Accessibility.IAccessible].Assembly.Location)}
 $native=[PLC Engineering Suite.Weinview.NativeControls]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe,800)
 $property=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe)
 $title=if($obj.kind -ceq 'numeric_display'){'数值的属性'}else{'功能键的属性'}
 $dialog=@($native.EnumTopWindows() | Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled})
 if($dialog.Count -ne 1){throw 'Exact existing object property dialog required'}
 function Tab([string]$Name){$t=$native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');$property.SelectTabExact($t.Hwnd,$Name)}
 function Text([int]$Id,[string]$Class){$c=$native.FindUniqueControlWithoutLabel($DialogHwnd,$Id,$Class);return $native.GetControlText($c.Hwnd,4096)}
 function Stage([string]$Mode){
  $result=& (Join-Path $PSScriptRoot 'ScreenBatchCandidate.ps1') -Mode $Mode -PlanPath $PlanPath -IdentityPath $IdentityPath -ProjectPath $project -DialogHwnd $DialogHwnd -ObjectIndex $ObjectIndex
  return ($result | ConvertFrom-Json)
 }
 $receipt.Identity=[ordered]@{Pid=$identity.Pid;CreationTicks=$identity.CreationTicks;Exe=$identity.Exe;Project=$project;SourceSha256=$ExpectedProjectSha256;DialogHwnd=$DialogHwnd}
 $receipt.ObjectKind=$obj.kind;$receipt.Stage='existing-object-match'
 Tab '一般属性'
 $originalDescription=Text 1174 'Edit'
 if($originalDescription -cne $ExpectedDescription){throw 'Exact existing object description mismatch; no writes performed'}
 $receipt.OriginalDescription=$originalDescription
 $receipt.Stages=@()
 if($Action -eq 'Apply'){
  $modes=if($obj.kind -ceq 'numeric_display'){@('ConfigureNumericText','ConfigureNumericStyle','SetRectangle')}else{@('ConfigureFunctionText','ConfigureButtonLabels','SetRectangle')}
  foreach($mode in $modes){$receipt.Stage=$mode;$receipt.Stages+=Stage $mode}
 }
 $receipt.Stage='semantic-readback';Tab '一般属性'
 $actual=[ordered]@{Kind=$obj.kind;Description=Text 1174 'Edit';Screen=10;Rectangle=$null;Data=$null;Macro=$null;Style=$null;Labels=@()}
 if($obj.kind -ceq 'numeric_display'){
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
  $qt=@(Unique-LWQt)
  $input=$native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能')
  $actual.Data=[ordered]@{Device=Text 1646 'ComboBox';AddressType=$qt[0].Value;Address=Text 2510 'Edit';InputEnabled=($native.GetCheckboxState($input.Hwnd) -ne 0)}
  if($actual.Data.Device -cne 'Local HMI' -or $actual.Data.AddressType -cne 'LW'){throw 'Existing numeric data route mismatch'}
  $actual.Style=(Stage 'ReadNumericStyle').Style
 }else{
  $radio=$native.FindUniqueControl($DialogHwnd,1198,'Button','触发宏指令')
  if($property.GetRadioState($radio.Hwnd) -ne 1){throw 'Expected existing macro function key'}
  $selection=Text 1417 'ComboBox';$match=[regex]::Match($selection,'^\[ID:(\d{3})\]\s+(.+)$')
  if(-not $match.Success){throw 'Unrecognized native macro selection text'}
  $actual.Macro=[ordered]@{Id=[int]$match.Groups[1].Value;Name=$match.Groups[2].Value;SelectionText=$selection}
  $labelResult=Stage 'ReadButtonLabels';$actual.Labels=$labelResult.Labels;$receipt.LabelStateRoundtrip=$labelResult.StateRoundtrip
 }
 $actual.Rectangle=(Stage 'ReadRectangle').After
 if($Action -eq 'Apply'){
  if($actual.Description -cne $obj.description){throw 'Applied object description readback mismatch'}
  for($r=0;$r -lt 4;$r++){if($actual.Rectangle[$r] -ne $obj.rect[$r]){throw 'Applied rectangle readback mismatch'}}
  if($obj.kind -ceq 'numeric_display' -and ($actual.Data.Address -cne [string]$obj.address -or $actual.Data.InputEnabled)){throw 'Applied numeric data readback mismatch'}
  if($obj.kind -ceq 'macro_button' -and ($actual.Macro.Id -ne $obj.macroId -or $actual.Macro.Name -cne $obj.macroName)){throw 'Applied macro readback mismatch'}
 }
 if((Get-FileHash -LiteralPath $project -Algorithm SHA256).Hash -ine $ExpectedProjectSha256){throw 'Caller source file changed during unconfirmed property operation'}
 $receipt.Actual=$actual;$receipt.Status='success';$receipt.Stage='unconfirmed-property-readback'
}catch{$receipt.Error=$_.Exception.Message;throw}finally{
 $receipt.FinishedUtc=[DateTime]::UtcNow.ToString('o');$receipt | ConvertTo-Json -Depth 14 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
}
