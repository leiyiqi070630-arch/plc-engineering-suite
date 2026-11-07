# Current native basic-window button addition. Caller verifies fresh copy, save, normal close and complete persisted objects.
function Invoke-WeinviewWindowButtonAddition($Session,[ValidateSet('Apply')][string]$Mode,$Objects,[string]$SourceSha256,$BeforeSnapshot,[Parameter(Mandatory=$true)][string]$BridgeRoot) {
 $ErrorActionPreference='Stop';Assert-WeinviewPlcCandidateSession $Session
  foreach($file in @('PlcConfigurationCandidate.ps1','ObjectRibbonAction.ps1','ScreenWorkflow.ps1','AlarmDisplayOperation.ps1','NativeAppearanceColorOperation.ps1')){. (Join-Path $BridgeRoot $file)}
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh private evidence required'};$value|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $path -Encoding UTF8}
 if($SourceSha256 -notmatch '^[a-fA-F0-9]{64}$' -or (Hash $Session.output_path) -ine $SourceSha256){throw 'Exact fresh source SHA required'}
 $prefix=$Session.output_path+'.general-'+[guid]::NewGuid().ToString('N')
 $actualBefore=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($null -eq $BeforeSnapshot){$BeforeSnapshot=$actualBefore}
 if($BeforeSnapshot.source_sha256 -ine $SourceSha256 -or [int]$BeforeSnapshot.screen -ne [int]$actualBefore.screen){throw 'Exact source SHA/selected-window actual snapshot required'}
 $beforeObjects=@($BeforeSnapshot.objects);$objects=@($Objects)
 if($objects.Count -lt 1 -or $objects.Count -gt 8){throw 'Added1..8 required'}
 function Overlap($a,$b){return ($a[0] -lt $b[0]+$b[2] -and $a[0]+$a[2] -gt $b[0] -and $a[1] -lt $b[1]+$b[3] -and $a[1]+$a[3] -gt $b[1])}
 $protection=Get-WeinviewAdditionProtection $beforeObjects ([int]$Session.window_width) ([int]$Session.window_height) @($actualBefore.alarm_displays)
 $occupied=@($protection.occupied);$seen=$protection.descriptions;$beforeIds=$protection.ids
 if(@($actualBefore.objects).Count -ne $beforeObjects.Count){throw 'Actual before directory count changed'}
 Assert-WeinviewAdditionSnapshots $BeforeSnapshot $actualBefore 0

 foreach($o in $objects){
  foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field -and $o.$field -isnot [bool]){throw 'Window button use_shape/use_picture must be strict Boolean when supplied'}}
  if(!$o.description -or $o.description.Length -gt 64 -or $o.description -match '[\x00-\x1f]' -or $seen.ContainsKey($o.description)){throw 'Unique bounded description required'};$seen[$o.description]=$true
  $importAction=([string]$o.function_action -ceq 'import_user_accounts')
  if($importAction){
   if($o.target_window -or $o.media -cnotin @('usb','usb2','sd') -or $o.import_mode -cnotin @('append','overwrite') -or $o.delete_after_import -isnot [bool]){throw 'Exact UserAccounts import function options required'}
  }elseif($o.function_action -or ($o.target_window -isnot [int] -and $o.target_window -isnot [long]) -or $o.target_window -lt 10 -or $o.target_window -gt 1999){throw 'Integer target window10..1999 required'}
  if(!$importAction -and [int]$o.target_window -eq [int]$Session.window_number){throw '不能切换到当前基本窗口，当前页导航请用文本/静态高亮；目标需为其他已存在页'}
  if($o.label -isnot [string] -or !$o.label.Length -or $o.label.Length -gt 128 -or $o.label -match '[\x00-\x1f]'){throw 'Bounded nonempty label required'}
   if(@($o.PSObject.Properties.Name) -ccontains 'label_font' -and ($o.label_font -isnot [string] -or [string]::IsNullOrWhiteSpace($o.label_font) -or $o.label_font.Length -gt 1024 -or $o.label_font -match '[\x00-\x1f\x7f]')){throw 'Bounded exact label_font required'}
   if(@($o.PSObject.Properties.Name) -ccontains 'label_size' -and (($o.label_size -isnot [int] -and $o.label_size -isnot [long]) -or $o.label_size -lt 1)){throw 'Positive integer label_size required'}
   foreach($field in @('off_text_rgb','on_text_rgb')){if(@($o.PSObject.Properties.Name) -ccontains $field){$null=Assert-WeinviewAppearanceRgb $o.$field}}
  $r=@($o.rect);if($r.Count -ne 4){throw 'Four integer rectangle values required'};foreach($v in $r){if($v -isnot [int] -and $v -isnot [long]){throw 'Integer rectangle required'}}
  if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 20 -or $r[3] -lt 20 -or $r[0]+$r[2] -gt $Session.window_width -or $r[1]+$r[3] -gt $Session.window_height){throw 'Rectangle must fit the actual native selected window'}
  foreach($old in $occupied){if(Overlap $r $old){throw 'Button footprint overlaps existing/requested object'}};$occupied+=,@($r)
 }
 $n=$Session.native;$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
  $sem=[PLC Engineering Suite.Weinview.NativeSemanticControls]::new($n);$results=@();$appearanceColors=@();$appearanceShapes=@();$initialDirectoryRestore=$null
 function C([long]$h,[int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($h,$id,$class)}
 function Await([scriptblock]$test,[int]$seconds){$end=[DateTime]::UtcNow.AddSeconds($seconds);do{$v=& $test;if($v){return $v};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end);throw 'New window-button bounded readiness timed out'}
 try{foreach($o in $objects){
  if(Get-Command Write-WeinviewProgress -ErrorAction SilentlyContinue){Write-WeinviewProgress 'screen_object_add' ('正在创建导航按钮：'+[string]$o.description)}
  $importAction=([string]$o.function_action -ceq 'import_user_accounts')
  $directory=Get-WeinviewWindowDirectory $Session;$oldIds=@($directory.rows|ForEach-Object {$_.object_id});if(!$initialDirectoryRestore){$initialDirectoryRestore=$directory.restore_context}
  $tabEntry=Invoke-WeinviewObjectRibbon $Session $sem '元件';$buttonEntry=Invoke-WeinviewObjectRibbon $Session $sem '功能键'
  $d=Await { $dialogs=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '新增 功能键'}).Count){throw 'Unknown/ambiguous owned modal; preserve'};if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){return $dialogs[0]}} 6;$h=$d.Hwnd
  $p.SelectTabExact((C $h 12320 'SysTabControl32').Hwnd,'一般属性')
  $cmt=([IO.Path]::GetExtension($Session.output_path) -ieq '.cmtp')
  if($cmt){
   if((@($p.TabNames((C $h 12320 'SysTabControl32').Hwnd)) -join '|') -cne '一般属性|安全|图片|标签'){throw 'Observed cMT new-function four-tab profile required'}
   $qt=@($n.EnumChildControls($h)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro' -and $_.Visible -and $_.Enabled});if($qt.Count -ne 1){throw 'Unique original cMT function General page required'}
   $targets=[PLC Engineering Suite.Weinview.FunctionWindowTargetControls]::new($n,'新增 功能键',(-not [bool]$Session.owned_semantic_background))
   $qtBridge=Join-Path $BridgeRoot 'QtElementBridge.exe'
   $initial=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,'function-read')|ConvertFrom-Json
   if($importAction){
    $null=$targets.SetCmtDescription($h,$qt[0].Hwnd,$initial.Description,$o.description,[long]$Session.main.Hwnd,(Join-Path $BridgeRoot 'QtElementBridge.exe'))
    $null=$targets.SelectCmtAccountImportAction($h,$qt[0].Hwnd)
    $nativeFields=$targets.SetCmtAccountImport($h,$qt[0].Hwnd,@{usb='U盘';usb2='U盘 2';sd='SD 卡'}[[string]$o.media],@{append='附加';overwrite='覆盖'}[[string]$o.import_mode],[bool]$o.delete_after_import)
    $release=$nativeFields.TriggerOnRelease
   }else{
    $items=@($initial.Items|Where-Object {$_ -cmatch ('^'+$o.target_window+'\. .+$')});if($items.Count -ne 1){throw 'Target must exist uniquely in cMT native basic-window items'}
    if($initial.Value -cne $items[0]){$null=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,('function-target:'+ $items[0]))}
    if($initial.Description -cne $o.description){$null=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,('function-description:'+ $o.description))}
    $nativeFields=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,'function-read')|ConvertFrom-Json
    if($nativeFields.Value -cne $items[0] -or $nativeFields.Description -cne $o.description -or $nativeFields.TriggerOnRelease -ne $initial.TriggerOnRelease -or ($nativeFields.Items -join '|') -cne ($initial.Items -join '|')){throw 'Native function target/description readback differs'}
    $release=$nativeFields.TriggerOnRelease
   }
  }else{
  if($importAction){throw 'UserAccounts import Function Key requires observed cMT project'}
  $radio=C $h 1185 'Button'
  if($p.GetRadioState($radio.Hwnd) -ne 1){$p.SelectWindowNavigationRadio($h,$radio.Hwnd);$null=Await {if($p.GetRadioState($radio.Hwnd) -eq 1){return $true}} 4}
  $p.SelectComboExact((C $h 1187 'ComboBox').Hwnd,'切换基本窗口')
  $qtBridge=Join-Path $BridgeRoot 'QtElementBridge.exe'
  $initial=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,'function-read')|ConvertFrom-Json
  $items=@($initial.Items|Where-Object {$_ -cmatch ('^'+$o.target_window+'\. .+$')});if($items.Count -ne 1){throw 'Target must exist uniquely in native basic-window items'}
  $target=$initial
  if($initial.Value -cne $items[0]){$target=$n.InvokeQtElement([long]$Session.main.Hwnd,$qtBridge,('function-target:'+ $items[0]))|ConvertFrom-Json}
  if($target.Value -cne $items[0] -or ($target.Items -join '|') -cne ($initial.Items -join '|') -or $target.Description -cne $initial.Description -or $target.TriggerOnRelease -ne $initial.TriggerOnRelease){throw 'Exact target selection readback differs'}
  $n.SetControlText((C $h 1174 'Edit').Hwnd,$o.description);if($n.GetControlText((C $h 1174 'Edit').Hwnd,4096) -cne $o.description){throw 'Description readback differs'}
  $release=$n.GetCheckboxState((C $h 1650 'Button').Hwnd);if($release -notin @(0,1)){throw 'Trigger state must be0or1'}
  }
  $p.SelectTabExact((C $h 12320 'SysTabControl32').Hwnd,'标签');$enable=C $h 1272 'Button';$enableState=$n.GetCheckboxState($enable.Hwnd)
  if($enableState -notin @(0,1)){throw 'Label enable state unsupported'};if($enableState -eq 0){$n.ClickButton($h,1272,$enable.Title)}
  $null=Await {if($n.GetCheckboxState($enable.Hwnd) -ne 1){return};$controls=@($n.EnumChildControls($h));foreach($spec in @(@(1208,'ComboBox'),@(1547,'ComboBox'),@(1439,'ComboBox'),@(1283,'RichEdit20W'))){if(@($controls|Where-Object {$_.Id -eq $spec[0] -and $_.Class -ceq $spec[1] -and $_.Visible -and $_.Enabled}).Count -ne 1){return}};return $true} 4
  $combo=C $h 1208 'ComboBox';$original=$p.ComboSelected($combo.Hwnd);$labels=@()
   try{foreach($state in @('0','1')){
    $p.SelectComboExact($combo.Hwnd,$state);$font=C $h 1547 'ComboBox';$size=C $h 1439 'ComboBox'
    $wantedFont=if(@($o.PSObject.Properties.Name) -ccontains 'label_font'){[string]$o.label_font}else{'Microsoft YaHei'}
    $wantedSize=if(@($o.PSObject.Properties.Name) -ccontains 'label_size'){[string]$o.label_size}else{'24'}
    if($p.ComboSelected($font.Hwnd) -cne $wantedFont){$p.SelectComboExact($font.Hwnd,$wantedFont)}
    if($n.GetControlText($size.Hwnd,4096) -cne $wantedSize){$p.SelectComboExact($size.Hwnd,$wantedSize)}
    $p.SetRichTextExact((C $h 1283 'RichEdit20W').Hwnd,$o.label)
    $labels+=@{state=[int]$state;font=$p.ComboSelected($font.Hwnd);size=$n.GetControlText($size.Hwnd,4096);text=$p.RichText((C $h 1283 'RichEdit20W').Hwnd)}
    if($labels[-1].text -cne $o.label -or $labels[-1].font -cne $wantedFont -or $labels[-1].size -cne $wantedSize){throw 'Button label state content/font/size readback differs'}
   }}finally{$p.SelectComboExact($combo.Hwnd,$original)}
   $requestedRgb=[ordered]@{};foreach($field in @('off_text_rgb','on_text_rgb')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedRgb[$field]=[int[]]@(Assert-WeinviewAppearanceRgb $o.$field)}}
   if($requestedRgb.Count){Set-WeinviewRequestedAppearanceColors $Session.identity_path $h 'window_button' ([pscustomobject]$requestedRgb)}
   $requestedShape=[ordered]@{};foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedShape[$field]=[bool]$o.$field}}
   $shapeResult=$null;if($requestedShape.Count){$shapeResult=Set-WeinviewRequestedAppearanceShape $Session.identity_path $h 'window_button' ([pscustomobject]$requestedShape)}
  $n.ClickButton($h,1,'确定');$null=Await {if(!@($n.EnumTopWindows()|Where-Object Hwnd -EQ $h).Count){return $true}} 5
  $null=Await {
   $windows=@($n.EnumTopWindows());$modals=@($windows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($modals.Count){throw 'Unexpected owned modal after new button confirmation; preserve it'}
   $main=@($windows|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Enabled});if($main.Count -eq 1){return $true}
  } 4
  $null=$n.EnumTopWindows()
  $scene=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$actualBefore.screen,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
  $frame=$scene.CapturePlacement()
  if(!$frame){throw 'Fresh owned placement geometry required'};$r=@($o.rect);$scene.PlaceNewObject($frame,[int]$r[0],[int]$r[1]);$scene.EndPlacement()
  $afterDirectory=Get-WeinviewWindowDirectory $Session;$newRows=@($afterDirectory.rows|Where-Object {$_.object_id -cnotin $oldIds});if($newRows.Count -ne 1 -or $newRows[0].kind -cne 'Macro' -or @($afterDirectory.rows).Count -ne $oldIds.Count+1){throw 'Exactly one new physical FK identity required'}
  $row=$newRows[0];$d=Open-WeinviewDirectoryObject $Session $afterDirectory $row
  $null=& (Join-Path $BridgeRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -IdentityPath $Session.identity_path -DialogHwnd $d.Hwnd -ProjectPath $Session.output_path -X $r[0] -Y $r[1] -Width $r[2] -Height $r[3]
   if($requestedRgb.Count){$colorAfter=Get-WeinviewRequestedAppearanceColors $Session.identity_path $d.Hwnd 'window_button' @('off_text_rgb','on_text_rgb');foreach($field in $requestedRgb.Keys){if((@($colorAfter.$field) -join ',') -cne (@($requestedRgb[$field]) -join ',')){throw ('Created Window Button RGB differs after confirmation: '+$field)}};$appearanceColors+=,[pscustomobject]@{object_id=$row.object_id;requested=[pscustomobject]$requestedRgb;after=$colorAfter;native_rgb_verified=$true}}
  Close-WeinviewScreenDialog $Session $d $true
  if($null -ne $shapeResult){$appearanceShapes+=,[pscustomobject]@{object_id=$row.object_id;before=$shapeResult.before;requested=$shapeResult.requested;after=$shapeResult.after;changed=[bool]$shapeResult.changed;scope=$shapeResult.scope}}
  $window=if($importAction){@{action='导入用户账户';target_window=$null;media=$nativeFields.Media;import_mode=$nativeFields.ImportMode;delete_after_import=[bool]$nativeFields.DeleteAfterImport;trigger_on_release=$release}}else{@{action='切换基本窗口';target_window=@{number=[int]$o.target_window;name=$items[0].Substring($items[0].IndexOf('. ')+2)};trigger_on_release=$release}}
  $expected=[pscustomobject]@{kind='window_button';description=$o.description;rectangle=$r;labels=$labels;window=$window}
  $canonical=CanonicalObject $row.object_id $expected;$record=[ordered]@{};foreach($key in $canonical.Keys){$record[$key]=$canonical[$key]};$record.object_sha256=CanonicalObjectHash $canonical;$record.screen=[int]$actualBefore.screen;$record.native_fields_verified=$true;$record.creation_intent=@{object_tab_entry=$tabEntry;function_entry=$buttonEntry;native_new_object_id=$row.object_id}
  $results+=[pscustomobject]$record
 }
 $final=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot ([string[]]@($results|ForEach-Object {$_.object_id}));if(@($final.objects).Count -ne $beforeObjects.Count+$results.Count){throw 'Final native object count differs'}
 Assert-WeinviewAdditionSnapshots $actualBefore $final $results.Count
 foreach($added in $results){$same=@($final.objects|Where-Object {$_.object_id -ceq $added.object_id});if($same.Count -ne 1 -or $same[0].object_sha256 -cne $added.object_sha256){throw 'Added full native button contract differs'}}
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'Addition unexpectedly saved source bytes'}
  return [pscustomobject]@{operation='window_button_addition';mode=$Mode;objects=$results;appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($appearanceShapes);before_snapshot=$actualBefore;after_snapshot=$final;untouched_objects_verified=$true;source_sha256=$SourceSha256;profile='weinview-cn421-tk800x480-native-window-v1';native_fields_verified=$true;persisted_verified=$false;saved=$false;reopened_verified=$false}
 }finally{if($initialDirectoryRestore -and !@($n.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $initialDirectoryRestore}}
}
