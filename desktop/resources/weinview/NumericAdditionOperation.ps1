# Current native numeric addition. Caller verifies fresh copy, save, normal close and complete persisted objects.
function Merge-WeinviewVerifiedNumericAdditionSnapshot($Snapshot,$Results) {
 if(!$Snapshot.directory_only_scope){throw 'Numeric addition directory-only snapshot required'}
 $added=@($Results);if($added.Count -lt 1 -or $added.Count -gt 8){throw 'Verified numeric addition count required'}
 $ids=@($added|ForEach-Object {$_.object_id});if(@($ids|Select-Object -Unique).Count -ne $ids.Count){throw 'Verified numeric IDs duplicated'}
 foreach($item in $added){
  if(!$item.native_fields_verified -or $item.kind -cne 'numeric_display' -or [string]$item.object_id -cnotmatch '^(ND|NE)_[0-9]{1,5}$' -or $item.tag_binding){throw 'Only directly read, untagged native Numeric properties can be reused'}
  $row=@($Snapshot.directory.rows|Where-Object {$_.object_id -ceq $item.object_id})
  $record=@($Snapshot.objects|Where-Object {$_.object_id -ceq $item.object_id})
  if($row.Count -ne 1 -or $row[0].kind -cne 'Numeric' -or $record.Count -ne 1 -or $record[0].kind -cne 'directory_only'){throw 'Confirmed Numeric ID must match one current native directory row'}
 }
 $merged=@(foreach($record in @($Snapshot.objects)){
  $matchedAdditions=@($added|Where-Object {$_.object_id -ceq $record.object_id})
  if($matchedAdditions.Count -eq 1){New-WeinviewObjectRecord ([string]$record.object_id) $matchedAdditions[0]}
  else{$record}
 })
 $Snapshot.objects=$merged
 return $Snapshot
}
function Invoke-WeinviewNumericAddition($Session,[ValidateSet('Apply')][string]$Mode,$Objects,[string]$SourceSha256,$BeforeSnapshot,[object[]]$VerifiedDevices,[Parameter(Mandatory=$true)][string]$BridgeRoot,$TagEvidence=$null) {
 $ErrorActionPreference='Stop';Assert-WeinviewPlcCandidateSession $Session
 $VerifiedDevices=@($VerifiedDevices|Where-Object {$null -ne $_})
  foreach($file in @('PlcConfigurationCandidate.ps1','NumericAddressBinding.ps1','NumericRibbonAction.ps1','ScreenWorkflow.ps1','AlarmDisplayOperation.ps1','NativeAppearanceColorOperation.ps1')){. (Join-Path $BridgeRoot $file)}
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh private evidence required'};$value|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $path -Encoding UTF8}
 if($SourceSha256 -notmatch '^[a-fA-F0-9]{64}$' -or (Hash $Session.output_path) -ine $SourceSha256){throw 'Exact fresh source SHA required'}
 $tagByDescription=@{};$resolvedObjects=@()
 foreach($requested in @($Objects)){
  if(!$requested.tag_name){
   $copy=[ordered]@{};if($requested -is [Collections.IDictionary]){foreach($key in $requested.Keys){$copy[$key]=$requested[$key]}}else{foreach($property in $requested.PSObject.Properties){$copy[$property.Name]=$property.Value}}
   if(-not $copy.Contains('data_type')){$copy['data_type']='16-bit Signed'}
   $resolvedObjects+=,[pscustomobject]$copy;continue
  }
  if(!$TagEvidence){throw 'Native same-project tag CSV evidence required for tag_name numeric addition.'}
  $binding=Resolve-WeinviewNumericTagBinding $Session ([string]$requested.tag_name) $TagEvidence $SourceSha256
  foreach($field in @('device','address_type','address','data_type')){
   if($null -ne $requested.$field -and [string]$requested.$field -cne [string]$binding.$field){throw 'Explicit numeric binding differs from existing native tag.'}
  }
  $copy=[ordered]@{};if($requested -is [Collections.IDictionary]){foreach($key in $requested.Keys){$copy[$key]=$requested[$key]}}else{foreach($property in $requested.PSObject.Properties){$copy[$property.Name]=$property.Value}}
  foreach($field in @('device','address_type','address','data_type')){$copy[$field]=$binding.$field}
  $resolvedObjects+=,[pscustomobject]$copy
  $tagByDescription[[string]$requested.description]=$binding
 }
 $Objects=$resolvedObjects
 $prefix=$Session.output_path+'.general-'+[guid]::NewGuid().ToString('N')
 $actualBefore=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($null -eq $BeforeSnapshot){$BeforeSnapshot=$actualBefore}
 if($BeforeSnapshot.source_sha256 -ine $SourceSha256 -or [int]$BeforeSnapshot.screen -ne [int]$actualBefore.screen){throw 'Exact source SHA/selected-window actual snapshot required'}
 $beforeObjects=@($BeforeSnapshot.objects);$objects=@($Objects)
 if($objects.Count -lt 1 -or $objects.Count -gt 8){throw 'Added1..8 required'}
 $protection=Get-WeinviewAdditionProtection $beforeObjects ([int]$Session.window_width) ([int]$Session.window_height) @($actualBefore.alarm_displays)
 $seen=$protection.descriptions;$beforeIds=$protection.ids
 if(@($actualBefore.objects).Count -ne $beforeObjects.Count){throw 'Actual before directory count changed'}
 Assert-WeinviewAdditionSnapshots $BeforeSnapshot $actualBefore 0
 $requestedInputs=@{};$requestedLimits=@{}
 foreach($o in $objects){
  foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field -and $o.$field -isnot [bool]){throw 'Numeric use_shape/use_picture must be strict Boolean when supplied'}}
   if(@($o.PSObject.Properties.Name) -ccontains 'numeric_text_rgb'){$null=Assert-WeinviewAppearanceRgb $o.numeric_text_rgb}
   $hasNumericFont=@($o.PSObject.Properties.Name) -ccontains 'numeric_font'
   if($hasNumericFont -and ($o.numeric_font -isnot [string] -or [string]::IsNullOrWhiteSpace($o.numeric_font) -or $o.numeric_font.Length -gt 1024 -or $o.numeric_font -match '[\x00-\x1f\x7f]')){throw 'Bounded exact numeric_font required'}
   if(@($o.PSObject.Properties.Name) -ccontains 'numeric_size' -and (($o.numeric_size -isnot [int] -and $o.numeric_size -isnot [long]) -or $o.numeric_size -lt 1)){throw 'Positive integer numeric_size required'}
   foreach($field in @('integer_digits','decimal_digits')){if(@($o.PSObject.Properties.Name) -ccontains $field -and (($o.$field -isnot [int] -and $o.$field -isnot [long]) -or $o.$field -lt 0)){throw 'Numeric display digits must be nonnegative integers; the actual native Spin determines the upper bound.'}}
  if($o.data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float','32-bit Signed','32-bit Unsigned')){throw 'Numeric format must be one of the five bounded native names.'}
  if($o.data_type -ceq '16-bit Signed'){$requestedLimits[[string]$o.description]=Get-WeinviewNumericLimits $o}
  else {
   foreach($field in @('minimum','maximum')){if(($o -is [Collections.IDictionary] -and $o.Contains($field)) -or ($o -isnot [Collections.IDictionary] -and @($o.PSObject.Properties.Name) -ccontains $field)){throw 'Non-signed16 format uses native default limits until those fields are observed.'}}
  }
  $hasInput=if($o -is [Collections.IDictionary]){$o.Contains('input_enabled')}else{@($o.PSObject.Properties.Name) -ccontains 'input_enabled'};if($hasInput -and $o.input_enabled -isnot [bool]){throw 'input_enabled must be strict boolean'};$requestedInputs[[string]$o.description]=if($hasInput){[bool]$o.input_enabled}else{$false};$r=@($o.rect);if(!$o.description -or $o.description.Length -gt 64 -or $o.description -match '[\x00-\x1f]' -or $seen.ContainsKey($o.description)){throw 'Unique bounded numeric description required'};$seen[$o.description]=$true
 if($r.Count -ne 4){throw 'Four integer rectangle fields required'};foreach($v in $r){if($v -isnot [int] -and $v -isnot [long]){throw 'Integer rectangle required'}}
 if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 20 -or $r[3] -lt 20 -or $r[0]+$r[2] -gt $Session.window_width -or $r[1]+$r[3] -gt $Session.window_height){throw 'Rectangle must fit the actual native selected window'}
 $tagBinding=$tagByDescription[[string]$o.description]
 $verified=@($VerifiedDevices|Where-Object {$_.device_name -ceq $o.device})
 if($tagBinding){if($o.data_type -cne $tagBinding.data_type -or $o.device -cne $tagBinding.device -or $o.address_type -cne $tagBinding.address_type -or [string]$o.address -cne [string]$tagBinding.address){throw 'Numeric request differs from exact native tag.'}}
  else{if($o.device -ceq 'Local HMI' -and $o.address_type -ceq 'LW'){if(($o.address -isnot [int] -and $o.address -isnot [long]) -or $o.address -lt 0 -or $o.address -gt 65535 -or ($o.data_type -clike '32-bit *' -and $o.address -gt 65534)){throw 'Local HMI LW numeric requires a valid integer start within its word span'}}else{if($o.device -isnot [string] -or [string]::IsNullOrWhiteSpace($o.device) -or $o.address_type -isnot [string] -or [string]::IsNullOrWhiteSpace($o.address_type) -or $o.address_type.Length -gt 128 -or $o.address_type -match '[\x00-\x1f\x7f]' -or $o.address -isnot [string] -or [string]::IsNullOrWhiteSpace($o.address) -or $o.address.Length -gt 128 -or $o.address -match '[\x00-\x1f\x7f]'){throw 'Numeric needs exact native device/type/address text'}}}
 }
 $external=@($objects|Where-Object {$_.device -cne 'Local HMI' -and !$tagByDescription.ContainsKey([string]$_.description)}|ForEach-Object {$_.device}|Select-Object -Unique)
 foreach($name in $external){$proof=@($VerifiedDevices|Where-Object {$_.device_name -ceq $name});if($proof.Count -gt 1){throw 'Native numeric device evidence duplicated'}}
 $n=$Session.native;$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $scene=if($Session.window_number){[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)}else{[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)}
 $sem=[PLC Engineering Suite.Weinview.NativeSemanticControls]::new($n);$types=[PLC Engineering Suite.Weinview.NumericAddressTypeControls]::new($n,'新增 数值');$results=@()
 function WaitDialog([string]$title){$end=[DateTime]::UtcNow.AddSeconds(6);do{$ds=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if(@($ds|Where-Object {$_.Title -cne $title}).Count){throw 'Unknown numeric dialog; no acknowledgment'};if($ds.Count -gt 1){throw 'Numeric dialog ambiguous'};if($ds.Count -eq 1 -and $ds[0].Enabled){$ids=@($n.EnumChildControls($ds[0].Hwnd)|Where-Object {$_.Visible -and $_.Enabled}|ForEach-Object Id);if($ids -contains 1174 -and $ids -contains 12320 -and $ids -contains 1){return $ds[0]}};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end);throw 'Numeric dialog readiness timed out'}
 function WaitClosed([long]$h){$end=[DateTime]::UtcNow.AddSeconds(4);do{if(!@($n.EnumTopWindows()|Where-Object Hwnd -EQ $h).Count){return};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end);throw 'Numeric dialog did not close; no retry'}
 function Capture {return $scene.CapturePlacement()}
 function ReadControl([long]$h,[int]$id,[string]$cl){$controls=@($n.EnumChildControls($h)|Where-Object {$_.Id -eq $id -and $_.Class -ceq $cl -and $_.Visible});if($controls.Count -ne 1){throw ('Numeric read requires one visible native control: '+$id+' '+$cl)};return $controls[0]}
 function Text([long]$h,[int]$id,[string]$cl){return $n.GetControlText((ReadControl $h $id $cl).Hwnd,4096)}
 function Tab([long]$h,[string]$name){$p.SelectTabExact(($n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32')).Hwnd,$name)}
 function TypeSnapshot([long]$h,[string]$title,[string]$required){
  $tc=[PLC Engineering Suite.Weinview.NumericAddressTypeControls]::new($n,$title);$end=[DateTime]::UtcNow.AddSeconds(3)
  do{$found=@();$qts=@($n.EnumChildControls($h)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled});if($qts.Count -gt 8){throw 'Numeric Qt control count exceeded bound'}
   foreach($q in $qts){$a=if($required){$tc.Inspect($h,$q.Hwnd,$required)}else{$tc.InspectAny($h,$q.Hwnd)};if($a){$found+=$a}}
   if($found.Count -gt 1){throw 'Exact numeric address combo not unique'};if($found.Count -eq 1){return $found[0]};Start-Sleep -Milliseconds 50
  }while([DateTime]::UtcNow -lt $end)
  throw 'Exact numeric address combo not ready within3seconds'
 } $initialDirectoryRestore=$null
 try {
  $itemIndex=0;$appearanceColors=@();$appearanceShapes=@()
 foreach($o in $objects){$limits=$requestedLimits[[string]$o.description];$requestedInput=[bool]$requestedInputs[[string]$o.description];$requestedState=if($requestedInput){1}else{0};$r=@($o.rect);$creationIntent=$null;$directoryBefore=Get-WeinviewWindowObjectInventory $Session;$itemBeforeIds=@($directoryBefore.rows|ForEach-Object object_id);if($itemIndex -eq 0){$initialDirectoryRestore=$directoryBefore.restore_context}
 if($Mode -ceq 'Apply'){
 $null=Invoke-WeinviewNumericRibbon $Session $sem '元件';$null=Invoke-WeinviewNumericRibbon $Session $sem '数值';$d=WaitDialog '新增 数值';$h=$d.Hwnd;Tab $h '一般属性'
  $oldDesc=Text $h 1174 'Edit';if($oldDesc.Length -gt 64 -or $oldDesc -match '[\x00-\x1f]'){throw 'Remembered numeric description outside bounded profile'}
 $creationIntent=@{item_index=$itemIndex;dialog_hwnd=$h;before_description=$oldDesc;requested_description=$o.description;write_count=1}
 $n.SetControlText(($n.FindUniqueControlWithoutLabel($h,1174,'Edit')).Hwnd,$o.description)
 if((Text $h 1174 'Edit') -cne $o.description){throw 'Explicit new numeric description readback differs; no retry'}
 $tagBinding=$tagByDescription[[string]$o.description]
 if(!$tagBinding -and $o.device -cne 'Local HMI'){
  $beforeDevice=Text $h 1646 'ComboBox';$beforeAddress=Text $h 2510 'Edit'
  $beforeType=TypeSnapshot $h '新增 数值' ''
 }
 if($tagBinding){
 Tab $h '格式';$tagFormat=ReadControl $h 1952 'ComboBox'
 # A remembered native Tag can own the format already; select the requested Tag normally, then verify its final format below.
 if($tagFormat.Enabled){if(@($p.ComboItems($tagFormat.Hwnd)|Where-Object {$_ -ceq $o.data_type}).Count -ne 1){throw 'Requested tagged numeric format absent from actual native choices'};$p.SelectComboExact($tagFormat.Hwnd,$o.data_type);if($p.ComboSelected($tagFormat.Hwnd) -cne $o.data_type){throw 'Tagged numeric format did not read back before Tag selection'}}
}
 if($tagBinding){$tagSelection=Invoke-WeinviewNumericNativeTagSelection -Session $Session -DialogHwnd $h -ExpectedDescription $o.description -TagBinding $tagBinding -ExpectedDialogTitle '新增 数值'}
 elseif($o.device -cne 'Local HMI'){$verified=@($VerifiedDevices|Where-Object {$_.device_name -ceq $o.device});$null=Invoke-WeinviewNumericAddressBinding -Session $Session -DialogHwnd $h -Mode Apply -ExpectedDescription $o.description -DeviceName $o.device -Address ([string]$o.address) -AddressType ([string]$o.address_type) -VerifiedDevice $(if($verified.Count){$verified[0]}else{$null}) -ExpectedBeforeDevice $beforeDevice -ExpectedBeforeType $beforeType.Value -ExpectedBeforeAddress $beforeAddress -ExpectedDialogTitle '新增 数值'}else{
  $p.SelectComboExact(($n.FindUniqueControlWithoutLabel($h,1646,'ComboBox')).Hwnd,'Local HMI');$qt=TypeSnapshot $h '新增 数值' ([string]$o.address_type);$localTypes=[PLC Engineering Suite.Weinview.NumericAddressTypeControls]::new($n,'新增 数值');$qt=$localTypes.SelectExact($h,$qt.Hwnd,$qt.Value,[string]$o.address_type,(Join-Path $PSScriptRoot 'QtElementBridge.exe'));if($qt.Value -cne [string]$o.address_type){throw 'Explicit Local HMI address type selection readback differs'};$n.SetControlText(($n.FindUniqueControlWithoutLabel($h,2510,'Edit')).Hwnd,[string]$o.address)
 }
 $inputControl=$n.FindUniqueControl($h,1206,'Button','启用输入功能');$inputBefore=$n.GetCheckboxState($inputControl.Hwnd)
 if($inputBefore -notin @(0,1)){throw 'Numeric input checkbox unknown state'}
 if($inputBefore -ne $requestedState){$n.ClickButton($h,1206,'启用输入功能')}
 $inputDeadline=[DateTime]::UtcNow.AddSeconds(3)
 do{$inputActual=$n.GetCheckboxState(($n.FindUniqueControl($h,1206,'Button','启用输入功能')).Hwnd);if($inputActual -eq $requestedState){break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $inputDeadline)
 if($inputActual -ne $requestedState){throw 'Requested numeric input state not verified; no toggle retry'}
 Tab $h '格式'
if($tagBinding){
 # The selected native Tag owns the format and can disable ComboBox1952.
 if((Text $h 1952 'ComboBox') -cne $o.data_type){throw 'Native Tag-controlled numeric format differs from the requested tag data type'}
}else{
 $formatControl=$n.FindUniqueControlWithoutLabel($h,1952,'ComboBox');$formatItems=@($p.ComboItems($formatControl.Hwnd));if(@($formatItems|Where-Object {$_ -ceq $o.data_type}).Count -ne 1){throw 'Requested numeric format absent from actual native 1952 ComboItems'};$p.SelectComboExact($formatControl.Hwnd,$o.data_type)
}
 $requestedDigits=[ordered]@{}
 foreach($pair in @(@('integer_digits',1196,1201,5),@('decimal_digits',1197,1202,0))){
  $field=[string]$pair[0];$provided=@($o.PSObject.Properties.Name) -ccontains $field
  if(!$provided -and $o.data_type -cne '16-bit Signed'){continue}
  $value=if($provided){[long]$o.$field}else{[long]$pair[3]};$requestedDigits[$field]=$value
   $edit=$n.FindUniqueControlWithoutLabel($h,[int]$pair[1],'Edit')
   if($n.GetControlText($edit.Hwnd,64) -cne [string]$value){$spin=$n.FindUniqueControlWithoutLabel($h,[int]$pair[2],'msctls_updown32');$p.SetNumericDigits($edit.Hwnd,$spin.Hwnd,$value)}
 }
 if($o.data_type -ceq '16-bit Signed'){foreach($pair in @(@(1200,[string]$limits.minimum),@(1203,[string]$limits.maximum))){$n.SetControlText(($n.FindUniqueControlWithoutLabel($h,$pair[0],'Edit')).Hwnd,$pair[1])}}
  $initialStyle=@{};foreach($f in @(@('data_type',1952,'ComboBox'),@('integer_digits',1196,'Edit'),@('decimal_digits',1197,'Edit'),@('minimum',1200,'Edit'),@('maximum',1203,'Edit'))){$initialStyle[$f[0]]=Text $h $f[1] $f[2]}
 if($initialStyle.data_type -cne $o.data_type){throw 'New numeric format differs before confirmation'}
 foreach($field in $requestedDigits.Keys){if($initialStyle[$field] -cne [string]$requestedDigits[$field]){throw ('New numeric display digits differ before confirmation: '+$field)}}
 if($o.data_type -ceq '16-bit Signed' -and ($initialStyle.minimum -cne [string]$limits.minimum -or $initialStyle.maximum -cne [string]$limits.maximum)){throw 'New signed numeric limits differ before confirmation'}
 foreach($field in @('integer_digits','decimal_digits','minimum','maximum')){if([string]::IsNullOrWhiteSpace([string]$initialStyle[$field])){throw 'Native numeric style field absent after format selection'}}
 Tab $h '字体';$fontControl=$n.FindUniqueControlWithoutLabel($h,1547,'ComboBox');$rememberedFont=$p.ComboSelected($fontControl.Hwnd)
  $requestedFont=if(@($o.PSObject.Properties.Name) -ccontains 'numeric_font'){[string]$o.numeric_font}else{'Arial'}
  if($requestedFont -cne $rememberedFont){$p.SelectComboExact($fontControl.Hwnd,$requestedFont)}
  if($p.ComboSelected($fontControl.Hwnd) -cne $requestedFont){throw 'Requested/preserved native numeric font differs'}
  $sizeControl=$n.FindUniqueControlWithoutLabel($h,1439,'ComboBox');$rememberedSize=$n.GetControlText($sizeControl.Hwnd,4096)
  $requestedSize=if(@($o.PSObject.Properties.Name) -ccontains 'numeric_size'){[string]$o.numeric_size}else{$rememberedSize}
  if($requestedSize -cne $rememberedSize){$p.SelectComboExact($sizeControl.Hwnd,$requestedSize)}
  if($n.GetControlText($sizeControl.Hwnd,4096) -cne $requestedSize){throw 'Requested/preserved native numeric size differs'}
  $creationIntent.font_before=$rememberedFont;$creationIntent.font=$requestedFont;$creationIntent.font_selection_verified=$true;$creationIntent.size_before=$rememberedSize;$creationIntent.size=$requestedSize
  $requestedRgb=$null
  if(@($o.PSObject.Properties.Name) -ccontains 'numeric_text_rgb'){$requestedRgb=[int[]]@(Assert-WeinviewAppearanceRgb $o.numeric_text_rgb);Set-WeinviewRequestedAppearanceColors $Session.identity_path $h 'numeric_display' ([pscustomobject]@{numeric_text_rgb=$requestedRgb})}
  $requestedShape=[ordered]@{};foreach($field in @('use_shape','use_picture')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedShape[$field]=[bool]$o.$field}}
  $shapeResult=$null;if($requestedShape.Count){$shapeResult=Set-WeinviewRequestedAppearanceShape $Session.identity_path $h 'numeric_display' ([pscustomobject]$requestedShape)}
 $n.ClickButton($h,1,'确定');WaitClosed $h;$fresh=Capture;$scene.PlaceNewObject($fresh,[int]$r[0],[int]$r[1]);$scene.EndPlacement();Start-Sleep -Milliseconds 100
 }
 $directoryAfter=Get-WeinviewWindowObjectInventory $Session
 if([string]$directoryAfter.read_route -cne [string]$directoryBefore.read_route -or [string]$directoryAfter.read_route -cne [string]$actualBefore.directory.read_route){throw 'Numeric addition inventory route changed within owned session'}
 if($Mode -ceq 'Apply'){$newRows=@($directoryAfter.rows|Where-Object {$_.object_id -cnotin $itemBeforeIds}); WritePrivateJson ($prefix+'.item-'+$itemIndex+'.directory-diff.json') @{item_index=$itemIndex;requested_description=$o.description;requested_input_enabled=$requestedInput;before_directory=$directoryBefore;after_directory=$directoryAfter;new_rows=$newRows;old_ids=$itemBeforeIds}
 if($newRows.Count -ne 1 -or $newRows[0].kind -cne 'Numeric' -or @($directoryAfter.rows).Count -ne $itemBeforeIds.Count+1){throw ('Exactly one newly created Numeric native directory ID required; actual_new_rows='+($newRows|ConvertTo-Json -Depth 6 -Compress))};$newRow=$newRows[0]}
 else{throw 'Private general-addition first version Apply only; persisted read uses ScreenWorkflow complete snapshot'}
 $propertyDirectory=Get-WeinviewWindowDirectory -Session $Session
 if(!$initialDirectoryRestore){$initialDirectoryRestore=$propertyDirectory.restore_context}
 $propertyRows=@($propertyDirectory.rows|Where-Object {$_.object_id -ceq $newRow.object_id})
 if($propertyRows.Count -ne 1 -or $propertyRows[0].kind -cne $newRow.kind -or !$propertyRows[0].semantic_path){throw 'Exact newly created Numeric UI directory row required for property opening'}
 $d=Open-WeinviewDirectoryObject $Session $propertyDirectory $propertyRows[0];$h=$d.Hwnd;Tab $h '一般属性'
 if((Text $h 1174 'Edit') -cne $o.description){throw 'Numeric opened object description differs'}
 if($tagBinding){if($n.GetCheckboxState(($n.FindUniqueControl($h,1206,'Button','启用输入功能')).Hwnd) -ne $requestedState){throw 'Numeric input state differs before Tag readback'}}
 else{$qt=TypeSnapshot $h '数值的属性' $o.address_type;if((Text $h 1646 'ComboBox') -cne $o.device -or $qt.Value -cne $o.address_type -or (Text $h 2510 'Edit') -cne [string]$o.address -or $n.GetCheckboxState(($n.FindUniqueControl($h,1206,'Button','启用输入功能')).Hwnd) -ne $requestedState){throw 'Numeric address/input readback differs'}}
 Tab $h '格式';$style=@{};foreach($f in @(@('data_type',1952,'ComboBox'),@('integer_digits',1196,'Edit'),@('decimal_digits',1197,'Edit'),@('minimum',1200,'Edit'),@('maximum',1203,'Edit'))){$style[$f[0]]=Text $h $f[1] $f[2]};foreach($field in @('data_type','integer_digits','decimal_digits','minimum','maximum')){if($style[$field] -cne $initialStyle[$field]){throw 'Numeric style readback differs'}}
  Tab $h '字体';$style.font=$p.ComboSelected(($n.FindUniqueControlWithoutLabel($h,1547,'ComboBox')).Hwnd);$style.size=$n.GetControlText(($n.FindUniqueControlWithoutLabel($h,1439,'ComboBox')).Hwnd,4096);if($style.font -cne $requestedFont -or $style.size -cne $requestedSize){throw 'Created numeric native font/size differs'}
  if($null -ne $requestedRgb){$colorAfter=Get-WeinviewRequestedAppearanceColors $Session.identity_path $h 'numeric_display' @('numeric_text_rgb');if((@($colorAfter.numeric_text_rgb) -join ',') -cne ($requestedRgb -join ',')){throw 'Created Numeric RGB differs after confirmation'};$appearanceColors+=,[pscustomobject]@{object_id=$newRow.object_id;requested=[pscustomobject]@{numeric_text_rgb=$requestedRgb};after=$colorAfter;native_rgb_verified=$true}}
 Tab $h '轮廓';$ids=@(1050,1052,1045,1044);$aspect=$n.FindUniqueControl($h,1602,'Button','保持长/宽比例');$original=$n.GetCheckboxState($aspect.Hwnd);if($original -notin @(0,1)){throw 'Rectangle aspect state must be0or1'}
 if($Mode -ceq 'Apply'){if($original -eq 1){$n.ClickButton($h,1602,'保持长/宽比例')};for($i=0;$i -lt 4;$i++){$n.SetControlText(($n.FindUniqueControlWithoutLabel($h,$ids[$i],'Edit')).Hwnd,[string]$r[$i])};if($original -eq 1){$n.ClickButton($h,1602,'保持长/宽比例')}}
 for($i=0;$i -lt 4;$i++){if((Text $h $ids[$i] 'Edit') -cne [string]$r[$i]){throw 'Numeric rectangle readback differs'}}
 if($n.GetCheckboxState(($n.FindUniqueControl($h,1602,'Button','保持长/宽比例')).Hwnd) -ne $original){throw 'Rectangle aspect state was not restored'}
 if($Mode -ceq 'Apply'){$n.ClickButton($h,1,'确定')}else{$n.ClickButton($h,2,'取消')};WaitClosed $h
 if($null -ne $shapeResult){$appearanceShapes+=,[pscustomobject]@{object_id=$newRow.object_id;before=$shapeResult.before;requested=$shapeResult.requested;after=$shapeResult.after;changed=[bool]$shapeResult.changed;scope=$shapeResult.scope}}
 $tagBinding=$tagByDescription[[string]$o.description]
 $results+=[pscustomobject]@{object_id=$newRow.object_id;kind='numeric_display';description=$o.description;screen=[int]$actualBefore.screen;rectangle=$r;data=@{device=$o.device;address_type=$o.address_type;address=[string]$o.address;tag_name=if($tagBinding){$tagBinding.tag_name}else{$null};input_enabled=$requestedInput};style=$style;tag_name=if($tagBinding){$tagBinding.tag_name}else{$null};tag_binding=if($tagBinding){@{device=$tagBinding.device;address_type=$tagBinding.address_type;address=[string]$tagBinding.address;data_type=$tagBinding.data_type;native_tag_csv_sha256=$tagBinding.native_tag_csv_sha256;native_tag_csv_verified=$true;native_object_selection_verified=$false}}else{$null};creation_intent=$creationIntent;native_fields_verified=$true}
 $itemIndex++
 }
 $taggedResults=@($results|Where-Object {$_.tag_binding})
 if($taggedResults.Count){$final=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot ([string[]]@($results|ForEach-Object {$_.object_id}))}
 else{
  # Every new untagged Numeric was reopened after placement and its address,
  # format, font, size and rectangle were read above. Keep a final native
  # directory check; the batch decides whether saved-project readback is needed.
  $final=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after-directory') $BridgeRoot
  $final=Merge-WeinviewVerifiedNumericAdditionSnapshot $final $results
  WritePrivateJson ($prefix+'.after.snapshot.json') $final
 }
 if(@($final.objects).Count -ne $beforeObjects.Count+$results.Count){throw 'General addition final native count differs'}
 Assert-WeinviewAdditionSnapshots $actualBefore $final $results.Count
 $rectangleAdjustments=@()
foreach($added in $results){
 $same=@($final.objects|Where-Object {$_.object_id -ceq $added.object_id})
 if($same.Count -ne 1){throw 'Added object native identity missing'}
 $expected=CanonicalObject $added.object_id $added
 if($same[0].object_sha256 -cne (CanonicalObjectHash $expected)){
  $requestedRect=@($expected.rectangle);$actualRect=@($same[0].rectangle)
  $heightOnly=($actualRect.Count -eq 4 -and $actualRect[0] -eq $requestedRect[0] -and $actualRect[1] -eq $requestedRect[1] -and $actualRect[2] -eq $requestedRect[2] -and $actualRect[3] -gt $requestedRect[3] -and $actualRect[0]+$actualRect[2] -le [int]$Session.window_width -and $actualRect[1]+$actualRect[3] -le [int]$Session.window_height)
  $fontConfirmed=($added.creation_intent.font_selection_verified -eq $true -and [string]$added.creation_intent.font -ceq [string]$same[0].style.font -and [string]$added.creation_intent.size -ceq [string]$same[0].style.size)
  if(!$heightOnly -or !$fontConfirmed){throw 'Added object complete native fields differ after confirmation'}
  # The native property read observed a taller box after confirmation with the same font.
  # Only that observed height may differ; the entire remaining canonical record must match.
  $expected.rectangle=@($actualRect|ForEach-Object {[int]$_})
  if($same[0].object_sha256 -cne (CanonicalObjectHash $expected)){throw 'Added object complete native fields differ after confirmation'}
  $added|Add-Member -NotePropertyName requested_rect -NotePropertyValue @($requestedRect) -Force
  $added.rectangle=@($expected.rectangle)
  $rectangleAdjustments+=,[pscustomobject]@{object_id=$added.object_id;requested_rect=@($requestedRect);actual_rect=@($expected.rectangle);reason='native_numeric_font_height';font=[string]$same[0].style.font;size=[string]$same[0].style.size;scope='native_property_after_confirmation';message='原厂按当前字体和字号增加了数值框高度，请依据实际尺寸检查排版。'}
 }
 if($added.tag_binding){if($same[0].data.tag_name -cne $added.tag_name){throw 'Native numeric Tag identity differs after property confirmation'};$added.tag_binding.native_object_selection_verified=$true}
}
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'Native addition unexpectedly saved source bytes'}
 $tagBindings=@($results|Where-Object {$_.tag_binding}|ForEach-Object {@{tag_name=$_.tag_name;object_id=$_.object_id;device=$_.tag_binding.device;address_type=$_.tag_binding.address_type;address=$_.tag_binding.address;data_type=$_.tag_binding.data_type;native_tag_csv_sha256=$_.tag_binding.native_tag_csv_sha256;native_tag_csv_verified=$_.tag_binding.native_tag_csv_verified;native_object_selection_verified=$_.tag_binding.native_object_selection_verified}})
  return [pscustomobject]@{operation='general_numeric_addition';mode=$Mode;objects=$results;rectangle_adjustments=@($rectangleAdjustments);appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($appearanceShapes);tag_bindings=$tagBindings;before_snapshot=$actualBefore;after_snapshot=$final;untouched_objects_verified=$true;source_sha256=$SourceSha256;profile=if($Session.window_number){'weinview-cn421-tk800x480-native-window-v1'}else{'weinview-cn421-tk800x480-window10'};native_fields_verified=$true;persisted_verified=$false;saved=$false;reopened_verified=$false}
 }finally{
  if($initialDirectoryRestore -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $initialDirectoryRestore}
 }}
