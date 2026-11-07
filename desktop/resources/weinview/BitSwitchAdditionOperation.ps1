# Current native Local HMI LB bit-switch addition. Caller verifies fresh copy, save, normal close and complete persisted objects.
function Invoke-WeinviewBitSwitchAddition($Session,[ValidateSet('Apply')][string]$Mode,$Objects,[string]$SourceSha256,$BeforeSnapshot,[Parameter(Mandatory=$true)][string]$BridgeRoot) {
 $ErrorActionPreference='Stop';Assert-WeinviewPlcCandidateSession $Session
  foreach($file in @('PlcConfigurationCandidate.ps1','ObjectRibbonAction.ps1','ScreenWorkflow.ps1','NativeAppearanceColorOperation.ps1','NumericAddressBinding.ps1')){. (Join-Path $BridgeRoot $file)}
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh private evidence required'};$value|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $path -Encoding UTF8}
 if($SourceSha256 -notmatch '^[a-fA-F0-9]{64}$' -or (Hash $Session.output_path) -ine $SourceSha256){throw 'Exact fresh source SHA required'}
 $prefix=$Session.output_path+'.general-'+[guid]::NewGuid().ToString('N')
 $actualBefore=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($null -eq $BeforeSnapshot){$BeforeSnapshot=$actualBefore}
 if($BeforeSnapshot.source_sha256 -ine $SourceSha256 -or [int]$BeforeSnapshot.screen -ne [int]$actualBefore.screen){throw 'Exact source SHA/selected-window actual snapshot required'}
 $beforeObjects=@($BeforeSnapshot.objects);$objects=@($Objects);$requestedBindings=@()
 if($objects.Count -lt 1 -or $objects.Count -gt 8){throw 'Added1..8 required'}
 function Overlap($a,$b){return ($a[0] -lt $b[0]+$b[2] -and $a[0]+$a[2] -gt $b[0] -and $a[1] -lt $b[1]+$b[3] -and $a[1]+$a[3] -gt $b[1])}
 $protection=Get-WeinviewAdditionProtection $beforeObjects ([int]$Session.window_width) ([int]$Session.window_height)
 $occupied=@($protection.occupied);$seen=$protection.descriptions;$beforeIds=$protection.ids
 if(@($actualBefore.objects).Count -ne $beforeObjects.Count){throw 'Actual before directory count changed'}
 Assert-WeinviewAdditionSnapshots $BeforeSnapshot $actualBefore 0

 foreach($o in $objects){
  foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field -and $o.$field -isnot [bool]){throw 'Bit use_shape/use_picture must be strict Boolean when supplied'}}
  if($null -ne $o.kind -and $o.kind -cnotin @('bit_switch','bit_lamp')){throw 'Explicit bit_switch or bit_lamp kind required'}
  $modePresent=@($o.PSObject.Properties.Name) -ccontains 'operation_mode'
  if($o.kind -ceq 'bit_lamp' -and $modePresent){throw 'bit_lamp cannot accept operation_mode'}
  if($modePresent){$null=Get-WeinviewNativeBitMode $o.operation_mode}
  if(!$o.description -or $o.description.Length -gt 64 -or $o.description -match '[\x00-\x1f]' -or $seen.ContainsKey($o.description)){throw 'Unique bounded description required'};$seen[$o.description]=$true
  $hasTag=@($o.PSObject.Properties.Name) -ccontains 'tag_name';$hasDevice=@($o.PSObject.Properties.Name) -ccontains 'device_name';$hasType=@($o.PSObject.Properties.Name) -ccontains 'address_type'
  if($hasTag -and ($hasDevice -or $hasType -or @($o.PSObject.Properties.Name) -ccontains 'address')){throw 'Native bit tag_name and direct address fields are mutually exclusive'}
  if($hasTag){
   if(!$Session.tag_evidence){throw 'Same-project native Tag export required for bit Tag binding'}
   $tagBinding=Resolve-WeinviewNumericTagBinding $Session ([string]$o.tag_name) $Session.tag_evidence $SourceSha256
   $requestedBindings+=,$tagBinding
  }else{
  if($hasDevice -ne $hasType){throw 'Bit external binding requires both device_name and address_type'}
  $device=if($hasDevice){[string]$o.device_name}else{'Local HMI'};$type=if($hasType){[string]$o.address_type}else{'LB'};$address=[string]$o.address
  if([string]::IsNullOrWhiteSpace($device) -or $device.Length -gt 128 -or $device -match '[\x00-\x1f\x7f]' -or [string]::IsNullOrWhiteSpace($type) -or $type.Length -gt 128 -or $type -match '[\x00-\x1f\x7f]'){throw 'Bounded exact native bit device/address type required'}
  if($device -ceq 'Local HMI'){
   if($type -cne 'LB' -or ($o.address -isnot [int] -and $o.address -isnot [long]) -or $o.address -lt 0 -or $o.address -gt 8999){throw 'Original Local HMI LB0..8999 contract required'}
  }elseif(!$hasDevice -or $address.Length -lt 1 -or $address.Length -gt 128 -or $address -match '[\x00-\x1f\x7f]'){throw 'Exact existing PLC bit device and native address text required'}
  $requestedBindings+=,[pscustomobject]@{device=$device;address_type=$type;address=$address;tag_name=$null}
  }
  foreach($key in @('off_label','on_label')){if($o.$key -isnot [string] -or !$o.$key.Length -or $o.$key.Length -gt 128 -or $o.$key -match '[\x00-\x1f]'){throw 'Two bounded nonempty bit labels required'}}
   if(@($o.PSObject.Properties.Name) -ccontains 'label_font' -and ($o.label_font -isnot [string] -or [string]::IsNullOrWhiteSpace($o.label_font) -or $o.label_font.Length -gt 1024 -or $o.label_font -match '[\x00-\x1f\x7f]')){throw 'Bounded exact label_font required'}
   if(@($o.PSObject.Properties.Name) -ccontains 'label_size' -and (($o.label_size -isnot [int] -and $o.label_size -isnot [long]) -or $o.label_size -lt 1)){throw 'Positive integer label_size required'}
   foreach($field in @('off_text_rgb','on_text_rgb')){if(@($o.PSObject.Properties.Name) -ccontains $field){$null=Assert-WeinviewAppearanceRgb $o.$field}}
  $r=@($o.rect);if($r.Count -ne 4){throw 'Four integer rectangle values required'};foreach($v in $r){if($v -isnot [int] -and $v -isnot [long]){throw 'Integer rectangle required'}}
  if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 20 -or $r[3] -lt 20 -or $r[0]+$r[2] -gt $Session.window_width -or $r[1]+$r[3] -gt $Session.window_height){throw 'Rectangle must fit the actual native selected window'}
  foreach($old in $occupied){if(Overlap $r $old){throw 'Bit-switch footprint overlaps existing/requested object'}};$occupied+=,@($r)
 }
 $n=$Session.native;$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
  $sem=[PLC Engineering Suite.Weinview.NativeSemanticControls]::new($n);$results=@();$tagBindings=@();$appearanceColors=@();$appearanceShapes=@();$initialDirectoryRestore=$null
 function C([long]$h,[int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($h,$id,$class)}
 function Await([scriptblock]$test,[int]$seconds){$end=[DateTime]::UtcNow.AddSeconds($seconds);do{$v=& $test;if($v){return $v};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end);throw 'New bit-switch bounded readiness timed out'}
 $bindingIndex=0
 try{foreach($o in $objects){
  $binding=$requestedBindings[$bindingIndex];$bindingIndex++
  if(Get-Command Write-WeinviewProgress -ErrorAction SilentlyContinue){Write-WeinviewProgress 'screen_object_add' ('正在创建位控件 '+$bindingIndex+'/'+$objects.Count+'：'+[string]$o.description)}
  $kind=if($o.kind -ceq 'bit_lamp'){'bit_lamp'}else{'bit_switch'};$isLamp=($kind -ceq 'bit_lamp')
  $nativeBitMode=if($isLamp){'位状态指示灯'}elseif(@($o.PSObject.Properties.Name) -ccontains 'operation_mode'){Get-WeinviewNativeBitMode $o.operation_mode}else{'切换开关'}
  $firstAddition=($results.Count -eq 0);$directory=if($firstAddition){$actualBefore.directory}else{Get-WeinviewWindowObjectInventory $Session};$oldIds=@($directory.rows|ForEach-Object {$_.object_id});if(!$firstAddition -and !$initialDirectoryRestore){$initialDirectoryRestore=$directory.restore_context}
  $tabEntry=Invoke-WeinviewObjectRibbon $Session $sem '元件';$buttonEntry=Invoke-WeinviewObjectRibbon $Session $sem '位状态切换开关'
  $d=Await { $dialogs=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '新增 位状态切换开关/位状态指示灯'}).Count){throw 'Unknown/ambiguous bit-switch modal; preserve'};if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){return $dialogs[0]}} 6;$h=$d.Hwnd
  $p.SelectTabExact((C $h 12320 'SysTabControl32').Hwnd,'一般属性')
  $radioId=if($isLamp){1037}else{1038};$radioLabel=if($isLamp){'位状态指示灯'}else{'位状态切换开关'}
  if($p.GetRadioState((C $h $radioId 'Button').Hwnd) -ne 1){$n.ClickButton($h,$radioId,$radioLabel)}
  $null=Await {if($p.GetRadioState((C $h $radioId 'Button').Hwnd) -eq 1 -and $p.GetRadioState((C $h $(if($isLamp){1038}else{1037}) 'Button').Hwnd) -eq 0){return $true}} 3
  $deviceCombo=C $h 1646 'ComboBox';if(@($p.ComboItems($deviceCombo.Hwnd)|Where-Object {$_ -ceq $binding.device}).Count -ne 1){throw 'Requested bit device absent from native project choices'}
  $p.SelectComboExact($deviceCombo.Hwnd,$binding.device);if(!$isLamp){$p.SelectComboExact((C $h 1151 'ComboBox').Hwnd,$nativeBitMode)}
  # A new object can retain the prior user-defined Tag mode. In that mode
  # the address widget displays a Tag name instead of a raw address type.
  # The native Tag picker below binds and verifies the full tag address.
  if(!$binding.tag_name){
  $types=[PLC Engineering Suite.Weinview.BitAddressTypeControls]::new($n,'新增 位状态切换开关/位状态指示灯');$found=Await {$values=@();foreach($qt in @($n.EnumChildControls($h)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$v=$types.InspectAny($h,$qt.Hwnd);if($v -and @($v.Items|Where-Object {$_ -ceq $binding.address_type}).Count -eq 1){$values+=$v}};if($values.Count -gt 1){throw 'Bit address type ambiguous'};if($values.Count -eq 1){return $values[0]}} 4
  if($found.Value -cne $binding.address_type){$found=$types.SelectExact($h,$found.Hwnd,$found.Value,$binding.address_type)}
  if($p.ComboSelected($deviceCombo.Hwnd) -cne $binding.device -or $found.Value -cne $binding.address_type){throw 'Native bit device/address type differs before address write'}
  }elseif($p.ComboSelected($deviceCombo.Hwnd) -cne $binding.device){throw 'Native bit device differs before Tag selection'}
  $nativeFlags=@();$flagLabels=@{1205='读取/写入使用不同的地址';1856='输出反向';1650='当按钮松开后发出指令';1868='触发宏指令'}
  foreach($id in $(if($isLamp){@(1856)}else{@(1205,1856,1650,1868)})){
   $flag=@($n.EnumChildControls($h)|Where-Object {$_.Id -eq $id -and $_.Class -ceq 'Button' -and $_.Title -ceq $flagLabels[$id]})
   $expectedVisible= -not(!$isLamp -and $nativeBitMode -ceq '复归型' -and $id -eq 1650)
   if($flag.Count -ne 1 -or [bool]$flag[0].Visible -ne $expectedVisible){throw 'Actual bit-mode flag control profile differs'}
   $flagState=$n.GetCheckboxState($flag[0].Hwnd);if($flagState -ne 0){throw 'Unsupported extra bit flags rejected'}
   $nativeFlags+=@{id=$id;label=$flag[0].Title;visible=$flag[0].Visible;enabled=$flag[0].Enabled;state=$flagState}
  }
  if(!$binding.tag_name){$n.SetControlText((C $h 2510 'Edit').Hwnd,$binding.address);if($n.GetControlText((C $h 2510 'Edit').Hwnd,128) -cne $binding.address){throw 'Bit address readback differs'}}
  $n.SetControlText((C $h 1174 'Edit').Hwnd,$o.description);if($n.GetControlText((C $h 1174 'Edit').Hwnd,4096) -cne $o.description){throw 'Description readback differs'}
  if($binding.tag_name){$selectedTag=Invoke-WeinviewNumericNativeTagSelection -Session $Session -DialogHwnd $h -ExpectedDescription $o.description -TagBinding $binding -ExpectedDialogTitle '新增 位状态切换开关/位状态指示灯'}
  $p.SelectTabExact((C $h 12320 'SysTabControl32').Hwnd,'标签');$enable=C $h 1272 'Button';$enableState=$n.GetCheckboxState($enable.Hwnd)
  if($enableState -notin @(0,1)){throw 'Bit-switch label enable state unsupported'};if($enableState -eq 0){$n.ClickButton($h,1272,$enable.Title)}
  $null=Await {if($n.GetCheckboxState($enable.Hwnd) -ne 1){return};$controls=@($n.EnumChildControls($h));foreach($spec in @(@(1208,'ComboBox'),@(1547,'ComboBox'),@(1439,'ComboBox'),@(1283,'RichEdit20W'))){if(@($controls|Where-Object {$_.Id -eq $spec[0] -and $_.Class -ceq $spec[1] -and $_.Visible -and $_.Enabled}).Count -ne 1){return}};return $true} 4
  $combo=C $h 1208 'ComboBox';$original=$p.ComboSelected($combo.Hwnd);$labels=@()
   try{foreach($state in @('0','1')){
    $p.SelectComboExact($combo.Hwnd,$state);$font=C $h 1547 'ComboBox';$size=C $h 1439 'ComboBox'
    $wantedFont=if(@($o.PSObject.Properties.Name) -ccontains 'label_font'){[string]$o.label_font}else{'Microsoft YaHei'}
    $wantedSize=if(@($o.PSObject.Properties.Name) -ccontains 'label_size'){[string]$o.label_size}else{'24'}
    if($p.ComboSelected($font.Hwnd) -cne $wantedFont){$p.SelectComboExact($font.Hwnd,$wantedFont)}
    if($n.GetControlText($size.Hwnd,4096) -cne $wantedSize){$p.SelectComboExact($size.Hwnd,$wantedSize)}
    $wantedText=if($state -ceq '0'){$o.off_label}else{$o.on_label};$p.SetRichTextExact((C $h 1283 'RichEdit20W').Hwnd,$wantedText)
    $labels+=@{state=[int]$state;font=$p.ComboSelected($font.Hwnd);size=$n.GetControlText($size.Hwnd,4096);text=$p.RichText((C $h 1283 'RichEdit20W').Hwnd)}
    if($labels[-1].text -cne $wantedText -or $labels[-1].font -cne $wantedFont -or $labels[-1].size -cne $wantedSize){throw 'Bit label state content/font/size readback differs'}
   }}finally{$p.SelectComboExact($combo.Hwnd,$original)}
   $requestedRgb=[ordered]@{};foreach($field in @('off_text_rgb','on_text_rgb')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedRgb[$field]=[int[]]@(Assert-WeinviewAppearanceRgb $o.$field)}}
   if($requestedRgb.Count){Set-WeinviewRequestedAppearanceColors $Session.identity_path $h $kind ([pscustomobject]$requestedRgb)}
   $requestedShape=[ordered]@{};foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedShape[$field]=[bool]$o.$field}}
   $shapeResult=$null;if($requestedShape.Count){$shapeResult=Set-WeinviewRequestedAppearanceShape $Session.identity_path $h $kind ([pscustomobject]$requestedShape)}
  $n.ClickButton($h,1,'确定');$null=Await {if(!@($n.EnumTopWindows()|Where-Object Hwnd -EQ $h).Count){return $true}} 5
  $null=Await {
   $windows=@($n.EnumTopWindows());$modals=@($windows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($modals.Count){throw 'Unexpected owned modal after new bit-switch confirmation; preserve it'}
   $main=@($windows|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Enabled});if($main.Count -eq 1){return $true}
  } 4
  $null=$n.EnumTopWindows()
  $scene=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$actualBefore.screen,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
  $frame=$scene.CapturePlacement()
  if(!$frame){throw 'Fresh owned placement geometry required'};$r=@($o.rect);$scene.PlaceNewObject($frame,[int]$r[0],[int]$r[1]);$scene.EndPlacement()
  $afterDirectory=Get-WeinviewWindowDirectory $Session;$newRows=@($afterDirectory.rows|Where-Object {$_.object_id -cnotin $oldIds});$expectedPrefix=if($isLamp){'^BL_[0-9]+$'}else{'^TS_[0-9]+$'};if($newRows.Count -ne 1 -or $newRows[0].kind -cne 'Bit' -or $newRows[0].object_id -cnotmatch $expectedPrefix -or @($afterDirectory.rows).Count -ne $oldIds.Count+1){throw 'Exactly one native identity matching selected bit mode required'}
  $row=$newRows[0];$d=Open-WeinviewDirectoryObject $Session $afterDirectory $row
  $null=& (Join-Path $BridgeRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -IdentityPath $Session.identity_path -DialogHwnd $d.Hwnd -ProjectPath $Session.output_path -X $r[0] -Y $r[1] -Width $r[2] -Height $r[3]
   if($requestedRgb.Count){$colorAfter=Get-WeinviewRequestedAppearanceColors $Session.identity_path $d.Hwnd $kind @('off_text_rgb','on_text_rgb');foreach($field in $requestedRgb.Keys){if((@($colorAfter.$field) -join ',') -cne (@($requestedRgb[$field]) -join ',')){throw ('Created Bit RGB differs after confirmation: '+$field)}};$appearanceColors+=,[pscustomobject]@{object_id=$row.object_id;requested=[pscustomobject]$requestedRgb;after=$colorAfter;native_rgb_verified=$true}}
  Close-WeinviewScreenDialog $Session $d $true
  if($null -ne $shapeResult){$appearanceShapes+=,[pscustomobject]@{object_id=$row.object_id;before=$shapeResult.before;requested=$shapeResult.requested;after=$shapeResult.after;changed=[bool]$shapeResult.changed;scope=$shapeResult.scope}}
  if($binding.tag_name){$tagBindings+=,[pscustomobject]@{object_id=$row.object_id;tag_name=[string]$binding.tag_name;device=[string]$binding.device;address_type=[string]$binding.address_type;address=[string]$binding.address;native_object_selection_verified=[bool]$selectedTag.native_object_selection_verified}}
  $bit=if($isLamp){@{device=$binding.device;address_type=$binding.address_type;address=$binding.address;tag_name=$binding.tag_name;operation_mode='位状态指示灯';inverted=$false}}else{@{device=$binding.device;address_type=$binding.address_type;address=$binding.address;tag_name=$binding.tag_name;operation_mode=$nativeBitMode;distinct_read_write=$false;inverted=$false;trigger_on_release=$false;macro_enabled=$false}}
  $expected=[pscustomobject]@{kind=$kind;description=$o.description;rectangle=$r;labels=$labels;bit=$bit}
  $canonical=CanonicalObject $row.object_id $expected;$record=[ordered]@{};foreach($key in $canonical.Keys){$record[$key]=$canonical[$key]};$record.object_sha256=CanonicalObjectHash $canonical;$record.screen=[int]$actualBefore.screen;$record.native_fields_verified=$true;$record.creation_intent=@{object_tab_entry=$tabEntry;function_entry=$buttonEntry;native_new_object_id=$row.object_id}
  $results+=[pscustomobject]$record
 }
 $final=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot ([string[]]@($results|ForEach-Object {$_.object_id}));if(@($final.objects).Count -ne $beforeObjects.Count+$results.Count){throw 'Final native object count differs'}
 Assert-WeinviewAdditionSnapshots $actualBefore $final $results.Count
 foreach($added in $results){$same=@($final.objects|Where-Object {$_.object_id -ceq $added.object_id});if($same.Count -ne 1 -or $same[0].object_sha256 -cne $added.object_sha256){throw 'Added full native bit-switch contract differs'}}
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'Addition unexpectedly saved source bytes'}
  return [pscustomobject]@{operation='bit_switch_addition';mode=$Mode;objects=$results;tag_bindings=$tagBindings;appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($appearanceShapes);before_snapshot=$actualBefore;after_snapshot=$final;untouched_objects_verified=$false;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';full_properties_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;collision_verification_scope=$protection.collision_verification_scope;source_sha256=$SourceSha256;profile='weinview-cn421-tk800x480-native-window-v1';native_fields_verified=$true;persisted_verified=$false;saved=$false;reopened_verified=$false}
 }finally{if($initialDirectoryRestore -and !@($n.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $initialDirectoryRestore}}
}
