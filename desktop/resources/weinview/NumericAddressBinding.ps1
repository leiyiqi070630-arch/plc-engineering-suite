# Independent numeric-address candidate. Definitions only; does not open/save/launch.
# Caller opens exact existing numeric properties in a fresh dedicated output copy.
function Resolve-WeinviewNumericTagBinding($Session,[string]$TagName,$TagEvidence,[string]$ExpectedProjectSha256) {
 $ErrorActionPreference='Stop'
 Assert-WeinviewPlcCandidateSession $Session
 return Resolve-WeinviewNumericTagRow ([string]$Session.output_path) $TagName $TagEvidence $ExpectedProjectSha256
}
function Resolve-WeinviewNumericTagRow([string]$ProjectPath,[string]$TagName,$TagEvidence,[string]$ExpectedProjectSha256) {
 $ErrorActionPreference='Stop'
 if(!$TagName -or $TagName.Length -gt 256 -or $TagName -match '[\x00-\x1f]' -or $ExpectedProjectSha256 -notmatch '^[a-fA-F0-9]{64}$'){throw 'Exact existing tag and project SHA required.'}
 if((Get-FileHash -LiteralPath $ProjectPath -Algorithm SHA256).Hash -ine $ExpectedProjectSha256){throw 'Current numeric project differs from tag evidence source.'}
 $csv=[string]$TagEvidence.native_csv_path;$csvHash=[string]$TagEvidence.tags_sha256
 if(!$csv -or !(Test-Path -LiteralPath $csv -PathType Leaf) -or $csvHash -notmatch '^[a-fA-F0-9]{64}$' -or (Get-FileHash -LiteralPath $csv -Algorithm SHA256).Hash -ine $csvHash){throw 'Actual native tag CSV evidence missing or changed.'}
 $rows=[PLC Engineering Suite.Weinview.TagCsvCodec]::Read($csv)
 [PLC Engineering Suite.Weinview.TagCsvCodec]::AssertSame([PLC Engineering Suite.Weinview.TagRow[]]$TagEvidence.tags,[PLC Engineering Suite.Weinview.TagRow[]]$rows)
 $found=@($rows|Where-Object {$_.name -ceq $TagName})
 if($found.Count -ne 1){throw 'Requested exact native tag is absent or ambiguous.'}
 $row=$found[0]
 if(!$row.device -or !$row.address_type -or !$row.address -or !$row.data_type){throw 'Exact native tag row is incomplete.'}
 return [pscustomobject]@{tag_name=$row.name;device=$row.device;address_type=$row.address_type;address=[string]$row.address;data_type=$row.data_type;comment=[string]$row.comment;native_tag_csv_path=$csv;native_tag_csv_sha256=$csvHash;source_project_sha256=$ExpectedProjectSha256;native_tag_csv_verified=$true;native_object_selection_verified=$false}
}
function Invoke-WeinviewNumericNativeTagSelection($Session,[long]$DialogHwnd,[string]$ExpectedDescription,$TagBinding,[string]$ExpectedDialogTitle='数值的属性') {
 $ErrorActionPreference='Stop';Assert-WeinviewPlcCandidateSession $Session
 if(!$TagBinding -or !$TagBinding.native_tag_csv_verified -or $ExpectedDialogTitle -cnotin @('数值的属性','新增 数值','位状态切换开关/位状态指示灯的属性','位状态指示灯/位状态切换开关的属性','新增 位状态切换开关/位状态指示灯') -or (Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash -ine [string]$TagBinding.source_project_sha256){throw 'Fresh same-project native Tag binding required'}
 $rows=[PLC Engineering Suite.Weinview.TagCsvCodec]::Read([string]$TagBinding.native_tag_csv_path)
 if((Get-FileHash -LiteralPath $TagBinding.native_tag_csv_path -Algorithm SHA256).Hash -ine [string]$TagBinding.native_tag_csv_sha256){throw 'Native Tag CSV changed before object selection'}
 $matches=@($rows|Where-Object {$_.name -ceq $TagBinding.tag_name})
 if($matches.Count -ne 1 -or $matches[0].device -cne $TagBinding.device -or $matches[0].address_type -cne $TagBinding.address_type -or $matches[0].address -cne $TagBinding.address -or $matches[0].data_type -cne $TagBinding.data_type -or [string]$matches[0].comment -cne [string]$TagBinding.comment){throw 'Native Tag row changed before object selection'}
 $expectedDisplay=if([string]::IsNullOrEmpty([string]$TagBinding.comment)){[string]$TagBinding.tag_name}else{([string]$TagBinding.tag_name)+' ('+([string]$TagBinding.comment)+')'}
 $native=$Session.native;$dialog=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq $ExpectedDialogTitle -and $_.Visible -and $_.Enabled});if($dialog.Count -ne 1){throw 'Exact owned numeric property dialog required'}
 $property=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $property.SelectTabExact(($native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')).Hwnd,'一般属性')
 $descriptionControls=@($native.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq 1174 -and $_.Class -ceq 'Edit' -and $_.Visible})
 if($descriptionControls.Count -ne 1){throw 'Numeric Tag selection requires one visible description control'}
 if($native.GetControlText($descriptionControls[0].Hwnd,1024) -cne $ExpectedDescription){throw 'Numeric description differs before Tag selection'}
 if(!('PLC Engineering Suite.Weinview.NumericTagSettingsControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NumericTagSettingsControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $address=([PLC Engineering Suite.Weinview.NumericTagSettingsControls]::new($native)).OpenAddress($DialogHwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'));$confirmed=$false
 try{
  $user=$native.FindUniqueControl($address,1560,'Button','用户自定义标签');$state=$native.GetCheckboxState($user.Hwnd)
  if($state -notin @(0,1)){throw 'Native User-defined Tag switch state unavailable'}
  if($state -eq 0){$native.ClickButton($address,1560,'用户自定义标签')}
  # ClickButton posts BM_CLICK. Observe the original checkbox and the address
  # editor it disables before opening the Tag selector; never replay the click.
  $deadline=[DateTime]::UtcNow.AddSeconds(3)
  do{
   $user=$native.FindUniqueControl($address,1560,'Button','用户自定义标签')
   $state=$native.GetCheckboxState($user.Hwnd)
   $addressEdits=@($native.EnumChildControls($address)|Where-Object {$_.Id -eq 2510 -and $_.Class -ceq 'Edit' -and $_.Visible})
   if($state -notin @(0,1) -or $addressEdits.Count -ne 1){throw 'Native User-defined Tag switch/address editor shape changed'}
   if($state -eq 1 -and !$addressEdits[0].Enabled){break}
   Start-Sleep -Milliseconds 50
  }while([DateTime]::UtcNow -lt $deadline)
  if($state -ne 1 -or $addressEdits[0].Enabled){throw 'Native User-defined Tag switch did not enable and disable ordinary address editor'}
  $selector=[PLC Engineering Suite.Weinview.NumericAddressTypeControls]::new($native,'地址');$found=@()
  foreach($qt in @($native.EnumChildControls($address)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$item=$selector.InspectAddressTagDisplayAny($address,$qt.Hwnd);if($item){$found+=,$item}}
  if($found.Count -ne 1){throw 'Unique native Tag selector required'}
  $after=$selector.SelectVisibleMenuExact($address,$found[0].Hwnd,$found[0].Value,[string]$TagBinding.tag_name,$expectedDisplay,[long]$Session.main.Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))
  $user=$native.FindUniqueControl($address,1560,'Button','用户自定义标签')
  if($after.Value -cne $TagBinding.tag_name -or $native.GetCheckboxState($user.Hwnd) -ne 1){throw 'Exact native Tag selection did not read back'}
  $native.ClickButton($address,1,'确定')
  $deadline=[DateTime]::UtcNow.AddSeconds(3)
  do{
   if(!@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $address}).Count){break}
   Start-Sleep -Milliseconds 50
  }while([DateTime]::UtcNow -lt $deadline)
  if(@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $address}).Count){throw 'Native Address confirmation did not close'}
  $confirmed=$true
  return [pscustomobject]@{tag_name=[string]$TagBinding.tag_name;native_display=[string]$after.NativeValue;device=[string]$TagBinding.device;address_type=[string]$TagBinding.address_type;address=[string]$TagBinding.address;data_type=[string]$TagBinding.data_type;native_tag_csv_sha256=[string]$TagBinding.native_tag_csv_sha256;native_tag_csv_verified=$true;native_object_selection_verified=$true;native_dialog_confirmed=$true}
 }finally{
  # An inner Tag picker disables Address. Do not let a failed cancellation of
  # that disabled parent replace the selector's original error.
  $addressWindow=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $address})
  if(!$confirmed -and $addressWindow.Count -eq 1 -and $addressWindow[0].Enabled){$native.ClickButton($address,2,'取消')}
 }
}
function Invoke-WeinviewNumericAddressBinding($Session,[long]$DialogHwnd,[string]$Mode,[string]$ExpectedDescription,[string]$DeviceName,[string]$Address,[string]$AddressType,$VerifiedDevice,[string]$ExpectedBeforeDevice,[string]$ExpectedBeforeType,[string]$ExpectedBeforeAddress,[string]$ExpectedDialogTitle='数值的属性',$TagBinding=$null) {
 $ErrorActionPreference='Stop'
 Assert-WeinviewPlcCandidateSession $Session
 if($ExpectedDialogTitle -cne '数值的属性' -and $ExpectedDialogTitle -cne '新增 数值'){throw 'Numeric dialog title outside exact allowlist.'}
 if($Mode -cne 'Apply' -and $Mode -cne 'Readback'){throw 'Numeric binding mode Apply/Readback required.'}
 $tagged=$null -ne $TagBinding;$targetType=if($tagged){[string]$TagBinding.address_type}else{$AddressType}
 if(!$ExpectedDescription -or !$DeviceName -or [string]::IsNullOrWhiteSpace($targetType) -or $targetType.Length -gt 128 -or [string]::IsNullOrWhiteSpace($Address) -or $Address.Length -gt 128 -or $Address -match '[\x00-\x1f\x7f]'){throw 'Exact native numeric device, type and address text required.'}
 if($tagged){
  if($TagBinding.native_tag_csv_verified -ne $true -or $TagBinding.device -cne $DeviceName -or [string]$TagBinding.address -cne $Address -or $TagBinding.data_type -cne '16-bit Signed' -or !$targetType -or $targetType.Length -gt 128 -or (Get-FileHash -LiteralPath $TagBinding.native_tag_csv_path -Algorithm SHA256).Hash -ine [string]$TagBinding.native_tag_csv_sha256 -or (Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash -ine [string]$TagBinding.source_project_sha256){throw 'Fresh same-project native tag evidence required.'}
  $nativeTags=[PLC Engineering Suite.Weinview.TagCsvCodec]::Read([string]$TagBinding.native_tag_csv_path)
  $matchingTags=@($nativeTags|Where-Object {$_.name -ceq $TagBinding.tag_name})
  if($matchingTags.Count -ne 1 -or $matchingTags[0].device -cne $DeviceName -or $matchingTags[0].address_type -cne $targetType -or $matchingTags[0].address -cne [string]$Address -or $matchingTags[0].data_type -cne '16-bit Signed'){throw 'Native tag row differs before numeric selection.'}
 }else{
  if($DeviceName -ceq 'Local HMI'){throw 'External direct numeric binding requires an external device.'}
  $driverFile=$null
  if($VerifiedDevice -and ($VerifiedDevice.device_name -cne $DeviceName -or !$VerifiedDevice.native_fields_verified)){throw 'Existing native device evidence differs.'}
 }
 if(!$Session.exe_path){throw 'Dedicated kernel-verified exe path required.'}
 $native=$Session.native;$property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $types=New-Object PLC Engineering Suite.Weinview.NumericAddressTypeControls($native,$ExpectedDialogTitle)
 $dialog=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq $ExpectedDialogTitle -and $_.Visible -and $_.Enabled})
 if($dialog.Count -ne 1){throw 'Exact owned existing numeric property dialog required.'}
 $tab=$native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');$property.SelectTabExact($tab.Hwnd,'一般属性')
 function NumericText([int]$id,[string]$class){return $native.GetControlText(($native.FindUniqueControlWithoutLabel($DialogHwnd,$id,$class)).Hwnd,4096)}
 if((NumericText 1174 'Edit') -cne $ExpectedDescription){throw 'Existing numeric object description differs; no write.'}
 function ReadyAddressEdit {
  $deadline=[DateTime]::UtcNow.AddSeconds(3)
  do{$matches=@($native.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq 2510 -and $_.Visible -and $_.Enabled});if($matches.Count -gt 1){throw 'Numeric active address Edit ID duplicated.'};if($matches.Count -eq 1){if($matches[0].Class -cne 'Edit'){throw 'Numeric address Edit class changed.'};if($matches[0].Visible -and $matches[0].Enabled){return $native.FindUniqueControlWithoutLabel($DialogHwnd,2510,'Edit')}};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $deadline)
  throw 'Numeric address Edit did not become ready.'
 } function UniqueType([string]$requiredType){
  $deadline=[DateTime]::UtcNow.AddSeconds(3)
  do{$found=@();$candidates=@($native.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled});if($candidates.Count -gt 8){throw 'Numeric Qt controls exceeded bounded discovery.'}
   foreach($qt in $candidates){$snapshot=$types.Inspect($DialogHwnd,$qt.Hwnd,$requiredType);if($snapshot){$found+=$snapshot}}
   if($found.Count -gt 1){throw 'Address type combo is ambiguous.'};if($found.Count -eq 1){return $found[0]};Start-Sleep -Milliseconds 50
  }while([DateTime]::UtcNow -lt $deadline)
  throw ('Exact numeric address type missing: '+$requiredType)
 }
 $device=$native.FindUniqueControlWithoutLabel($DialogHwnd,1646,'ComboBox')
 $inputButton=$native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能')
 $beforeDevice=$property.ComboSelected($device.Hwnd);$beforeAddress=NumericText 2510 'Edit';$beforeInput=$native.GetCheckboxState($inputButton.Hwnd)
 if($beforeInput -ne 0 -and $beforeInput -ne 1){throw 'Numeric input state must be checked or unchecked.'}
 if($Mode -ceq 'Apply'){
  if(!$ExpectedBeforeDevice -or (!$tagged -and !$ExpectedBeforeType) -or $null -eq $ExpectedBeforeAddress){throw 'Exact before-device/address and legacy type required for Apply.'}
  if(!$tagged){$beforeType=UniqueType $ExpectedBeforeType}
  if($beforeDevice -cne $ExpectedBeforeDevice -or (!$tagged -and $beforeType.Value -cne $ExpectedBeforeType) -or $beforeAddress -cne $ExpectedBeforeAddress){throw 'Numeric before-mapping differs; no write.'}
  $deviceItems=@($property.ComboItems($device.Hwnd));if(@($deviceItems|Where-Object {$_ -ceq $DeviceName}).Count -ne 1){throw 'Configured device missing or duplicated in numeric device combo.'}
  $property.SelectComboExact($device.Hwnd,$DeviceName)
  if((NumericText 1646 'ComboBox') -cne $DeviceName){throw 'Selected numeric device readback differs.'}
  # Device changes may recreate the small Qt address selector. Resolve its new HWND.
  $currentType=UniqueType $targetType;$selectedType=$types.SelectExact($DialogHwnd,$currentType.Hwnd,$currentType.Value,$targetType,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))
  $native.SetControlText((ReadyAddressEdit).Hwnd,[string]$Address)
  if($beforeInput -ne 0){
   $native.ClickButton($DialogHwnd,1206,'启用输入功能');$deadline=[DateTime]::UtcNow.AddSeconds(3)
   do{$state=$native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能')).Hwnd);if($state -eq 0){break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $deadline)
   if($state -ne 0){throw 'Read-only numeric input disable was not verified.'}
  }
 }
 $actualType=UniqueType $targetType;$actualDevice=NumericText 1646 'ComboBox';$actualAddress=NumericText 2510 'Edit';$inputState=$native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1206,'Button','启用输入功能')).Hwnd)
 if($actualDevice -cne $DeviceName -or $actualType.Value -cne $targetType -or $actualAddress -cne [string]$Address -or $inputState -ne 0){throw 'Numeric native tag mapping readback differs.'}
 return [pscustomobject]@{mode=$Mode;description=$ExpectedDescription;device=$actualDevice;driver_id=if($VerifiedDevice){$VerifiedDevice.driver_id}else{$null};driver_file=if($VerifiedDevice){$VerifiedDevice.driver_file}else{$null};tag_name=if($tagged){$TagBinding.tag_name}else{$null};native_tag_csv_sha256=if($tagged){$TagBinding.native_tag_csv_sha256}else{$null};address_type=$actualType.Value;address=$Address;input_enabled=$false;address_type_items=$actualType.Items;before=@{device=$beforeDevice;address=$beforeAddress;input_enabled=($beforeInput -ne 0)};native_fields_verified=$true;persisted_verified=$false;scope='offline_numeric_plc_address_binding';dialog_confirmation_performed=$false}
}
