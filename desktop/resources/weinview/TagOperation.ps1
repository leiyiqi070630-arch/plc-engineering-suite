# Definitions only. Caller owns exact source hash, fresh native copy, save and close.
function New-WeinviewTagRequests($Arguments) {
 if([string]$Arguments.expected_tags_sha256 -notmatch '^[A-Fa-f0-9]{64}$'){throw 'Exact before tags CSV SHA required.'}
 $items=@($Arguments.tags);if($items.Count -lt 1 -or $items.Count -gt 1000){throw 'One to 1000 tag requests required.'}
 $names=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
 $rows=New-Object 'Collections.Generic.List[PLC Engineering Suite.Weinview.TagRow]'
 foreach($item in $items){
  $nativeRow=@($item.PSObject.Properties.Name) -ccontains 'row_format'
  $allowed=@('name','device','address_type','address','comment','data_type')
  if($nativeRow){$allowed+=,'row_format'}
  if(@($item.PSObject.Properties.Name).Count -ne $allowed.Count -or @($item.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowed}).Count -or ($nativeRow -and $item.row_format -cne 'native_csv')){throw 'Exact original six tag fields and optional native_csv row format required.'}
  foreach($key in @('name','device','address_type','comment','data_type')){
   if($item.$key -isnot [string] -or $item.$key -match '[\x00-\x1f\x7f]'){throw 'Tag text or control character invalid.'}
  }
  if(!$item.name -or $item.name.Length -gt 64 -or !$item.device -or $item.device.Length -gt 64 -or $item.comment.Length -gt 1024 -or !$names.Add($item.name)){throw 'Tag names/devices/comments or duplicate name invalid.'}
  if($nativeRow){
   foreach($field in @('address_type','address','data_type')){if($item.$field -isnot [string] -or [string]::IsNullOrWhiteSpace($item.$field) -or $item.$field.Length -gt $(if($field -ceq 'address'){256}else{128}) -or $item.$field -match '[\x00-\x1f\x7f]'){throw 'Exact native CSV tag address/type text required.'}}
  }else{
   if($item.address -isnot [int] -and $item.address -isnot [long]){throw 'Tag address integer required.'}
   if($item.address -lt 0 -or $item.address -gt 65535 -or $item.data_type -cne '16-bit Signed' -or ($item.device -ceq 'Local HMI' -and $item.address_type -cne 'LW') -or ($item.device -cne 'Local HMI' -and $item.address_type -cne '4x')){throw 'Only Local LW or existing PLC4x signed16 tag bindings accepted.'}
  }
  $row=New-Object PLC Engineering Suite.Weinview.TagRow
  foreach($key in @('name','device','address_type','comment','data_type')){$row.$key=$item.$key}
  $row.address=if($nativeRow){[string]$item.address}else{([long]$item.address).ToString([Globalization.CultureInfo]::InvariantCulture)};$rows.Add($row)
 }
 return ,$rows.ToArray()
}
function Get-WeinviewTagDialog($Session,[string]$Title,[int]$Seconds=8) {
 WaitFor {
  $windows=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Title -ceq $Title})
  if($windows.Count -gt 1){throw 'Tag dialog duplicated.'};if($windows.Count -eq 1){return $windows[0]}
 } $Seconds
}
function Open-WeinviewTagLibrary($Session) {
 Assert-WeinviewPlcCandidateSession $Session
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected modal before tag library entry.'}
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 $Session.tag_ribbon_evidence=Invoke-WeinviewQtElement $Session '地址'
  try{$library=Get-WeinviewTagDialog $Session '地址标签库'}catch{
   $visible=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible}|ForEach-Object {[pscustomobject]@{class=$_.Class;title=$_.Title;hwnd=$_.Hwnd}})
   throw ('Address tag library entry did not reach its native dialog; visible_top_windows='+($visible|ConvertTo-Json -Compress -Depth 3)+'; original='+[string]$_)
  }
 $properties=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $user=$Session.native.FindUniqueControl($library.Hwnd,1981,'Button','用户自定义标签')
 $Session.tag_original_user_mode=$properties.GetRadioState($user.Hwnd)
 if($Session.tag_original_user_mode -ne 1){$Session.native.ClickButton($library.Hwnd,1981,'用户自定义标签')}
 $user=$Session.native.FindUniqueControl($library.Hwnd,1981,'Button','用户自定义标签')
 if($properties.GetRadioState($user.Hwnd) -ne 1){throw 'User-defined tag mode readback failed.'}
 $filter=$Session.native.FindUniqueControl($library.Hwnd,1005,'Edit',$null)
 $Session.tag_original_filter=$Session.native.GetControlText($filter.Hwnd,4096)
 if($Session.tag_original_filter){$Session.native.SetControlText($filter.Hwnd,'')}
 $utf8=$Session.native.FindUniqueControl($library.Hwnd,1019,'Button','使用 UTF-8 格式导出 CSV 文件')
 $Session.tag_original_utf8=$Session.native.GetCheckboxState($utf8.Hwnd)
 $Session.tag_library=$library
 return $library
}
function Export-WeinviewTags($Session,[string]$CsvPath) {
 if(Test-Path -LiteralPath $CsvPath){throw 'Fresh tag export path required.'}
 $library=Get-WeinviewTagDialog $Session '地址标签库'
 $utf8=$Session.native.FindUniqueControl($library.Hwnd,1019,'Button','使用 UTF-8 格式导出 CSV 文件')
 if($Session.native.GetCheckboxState($utf8.Hwnd) -ne 1){$Session.native.ClickButton($library.Hwnd,1019,'使用 UTF-8 格式导出 CSV 文件')}
 if($Session.native.GetCheckboxState($utf8.Hwnd) -ne 1){throw 'Tag UTF8 export state not verified.'}
 $exports=@($Session.native.EnumChildControls($library.Hwnd)|Where-Object {$_.Visible -and $_.Id -eq 1247 -and $_.Class -ceq 'Button' -and $_.Title -ceq '导出为 CSV...'})
 if($exports.Count -ne 1){throw 'Unique original tag export control required.'}
 if(!$exports[0].Enabled){
  $filter=$Session.native.FindUniqueControl($library.Hwnd,1005,'Edit',$null)
  if($Session.native.GetControlText($filter.Hwnd,4096)){throw 'Empty tag proof requires unfiltered user-defined library.'}
  $grids=@($Session.native.EnumChildControls($library.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class.StartsWith('BCGPGridCtrl:')})
  if($grids.Count -ne 1 -or [PLC Engineering Suite.Weinview.TagQtControls]::ReadEmptyTable($Session.native,$grids[0].Hwnd) -ne 0){throw 'Native empty tag table proof required.'}
  # The observed native CSV is headerless. Its empty envelope is only the BOM;
  # record the disabled export and actual zero-row table rather than claim export.
  [IO.File]::WriteAllBytes($CsvPath,[byte[]]@(239,187,191))
  $rows=[PLC Engineering Suite.Weinview.TagCsvCodec]::Read($CsvPath)
  return @{tags=@($rows);tags_sha256=(Hash $CsvPath);native_csv_path=$CsvPath;table_origin='native_empty_table_with_derived_envelope';empty_evidence=@{row_count=0;grid=$grids[0];export_control=$exports[0];unfiltered=$true;user_defined_mode=$true;native_export_performed=$false}}
 }
 $Session.native.ClickButton($library.Hwnd,1247,'导出为 CSV...')
 $save=Get-WeinviewTagDialog $Session '另存为'
 $file=$Session.native.FindUniqueControl($save.Hwnd,1001,'Edit',$null);$Session.native.SetControlText($file.Hwnd,$CsvPath)
 if($Session.native.GetControlText($file.Hwnd,32768) -cne $CsvPath){throw 'Tag export file readback differs.'}
 $Session.native.ClickButton($save.Hwnd,1,'保存(&S)')
 $success=Get-WeinviewTagDialog $Session 'EasyBuilder Pro'
 $body=$Session.native.FindUniqueControl($success.Hwnd,65535,'Static','成功')
 if($Session.native.GetControlText($body.Hwnd,256) -cne '成功' -or !(Test-Path -LiteralPath $CsvPath)){throw 'Exact native export success required.'}
 $Session.native.ClickButton($success.Hwnd,2,'确定')
 $rows=[PLC Engineering Suite.Weinview.TagCsvCodec]::Read($CsvPath)
 return @{tags=@($rows);tags_sha256=(Hash $CsvPath);native_csv_path=$CsvPath;table_origin='native_export';empty_evidence=$null}
}
function Close-WeinviewTagLibrary($Session) {
 $library=Get-WeinviewTagDialog $Session '地址标签库'
 $utf8=$Session.native.FindUniqueControl($library.Hwnd,1019,'Button','使用 UTF-8 格式导出 CSV 文件')
 if($Session.native.GetCheckboxState($utf8.Hwnd) -ne $Session.tag_original_utf8){$Session.native.ClickButton($library.Hwnd,1019,'使用 UTF-8 格式导出 CSV 文件')}
 $filter=$Session.native.FindUniqueControl($library.Hwnd,1005,'Edit',$null)
 if($Session.tag_original_filter){$Session.native.SetControlText($filter.Hwnd,$Session.tag_original_filter)}
 if($Session.tag_original_user_mode -ne 1){$Session.native.ClickButton($library.Hwnd,1982,'系统寄存器')}
 $Session.native.ClickButton($library.Hwnd,2,'关闭')
 $null=WaitFor {
  $windows=@($Session.native.EnumTopWindows())
  if(!@($windows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count -and @($windows|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'EasyBuilderPro'}).Count -eq 1){return $true}
 } 5
}
function Assert-WeinviewTagDeviceBindings($Session,[PLC Engineering Suite.Weinview.TagRow[]]$Rows,[string[]]$NativeRowNames=@()) {
 $shortcutRows=@($Rows|Where-Object {$_.name -cnotin $NativeRowNames})
 if(!$shortcutRows.Count){
  return @{device_names=@();bindings=@($Rows|Group-Object device,address_type|ForEach-Object {@{device=$_.Group[0].device;address_type=$_.Group[0].address_type;validation_scope='original_csv_import_and_full_readback';native_device_list_verified=$false}});native_device_list_verified=$false}
 }
 $library=Get-WeinviewTagDialog $Session '地址标签库';$Session.native.ClickButton($library.Hwnd,4,'新增...')
 $dialog=Get-WeinviewTagDialog $Session '地址标签'
 $property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $word=$Session.native.FindUniqueControl($dialog.Hwnd,1611,'Button','字');if($property.GetRadioState($word.Hwnd) -ne 1){$Session.native.ClickButton($dialog.Hwnd,1611,'字')}
 $device=$Session.native.FindUniqueControl($dialog.Hwnd,1646,'ComboBox',$null)
 $devices=@($property.ComboItems($device.Hwnd));$checks=@()
 $groups=$shortcutRows|Group-Object device,address_type
 foreach($group in $groups){
  $row=$group.Group[0];if(@($devices|Where-Object {$_ -ceq $row.device}).Count -ne 1){throw 'Requested tag device not present in original project.'}
  $property.SelectComboExact($device.Hwnd,$row.device)
  $type=$Session.native.FindUniqueControl($dialog.Hwnd,1288,'ComboBox',$null);$property.SelectComboExact($type.Hwnd,$row.address_type)
  $format=$Session.native.FindUniqueControl($dialog.Hwnd,2143,'ComboBox',$null);$property.SelectComboExact($format.Hwnd,'16-bit Signed')
  $range=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,2402,'Static')
  $rangeText=$Session.native.GetControlText($range.Hwnd,4096)
  if($rangeText -notmatch '\[范围\s*:\s*([0-9]+)\s*~\s*([0-9]+)\]'){throw 'Native tag address range not understood; no CSV import.'}
  $minimum=[long]$Matches[1];$maximum=[long]$Matches[2]
  foreach($tag in $group.Group){if([long]$tag.address -lt $minimum -or [long]$tag.address -gt $maximum){throw 'Requested tag address outside actual native driver range.'}}
  $checks+=@{device=$row.device;address_type=$row.address_type;data_type='16-bit Signed';minimum=$minimum;maximum=$maximum;native_range=$rangeText}
 }
 foreach($group in @($Rows|Where-Object {$_.name -cin $NativeRowNames}|Group-Object device,address_type)){$checks+=@{device=$group.Group[0].device;address_type=$group.Group[0].address_type;validation_scope='original_csv_import_and_full_readback';native_device_list_verified=$false}}
 $Session.native.ClickButton($dialog.Hwnd,2,'取消')
 return @{device_names=$devices;bindings=$checks;native_device_list_verified=$true}
}
function Import-WeinviewTags($Session,[PLC Engineering Suite.Weinview.TagRow[]]$Rows,[string]$CsvPath,[switch]$ReplaceMergedTable) {
 [PLC Engineering Suite.Weinview.TagCsvCodec]::Write($CsvPath,$Rows);$inputHash=Hash $CsvPath
 $library=Get-WeinviewTagDialog $Session '地址标签库';$Session.native.ClickButton($library.Hwnd,1248,'导入自 CSV...')
 $import=Get-WeinviewTagDialog $Session '程序'
 $qt=@($Session.native.EnumChildControls($import.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})
 if($qt.Count -ne 1){throw 'Unique native import Qt root required.'};$qtRoot=$qt[0].Hwnd
 [PLC Engineering Suite.Weinview.TagQtControls]::Invoke($Session.native,$qtRoot,'浏览')
 $browse=Get-WeinviewTagDialog $Session 'Easy Builder Pro'
 $filename=$Session.native.FindUniqueControl($browse.Hwnd,1148,'Edit',$null);$Session.native.SetControlText($filename.Hwnd,$CsvPath)
 if($Session.native.GetControlText($filename.Hwnd,32768) -cne $CsvPath){throw 'Exact tag import file readback differs.'}
 $Session.native.ClickButton($browse.Hwnd,1,'打开(&O)')
 $null=Get-WeinviewTagDialog $Session '程序'
 $null=WaitFor {if([PLC Engineering Suite.Weinview.TagQtControls]::FileValueReady($Session.native,$qtRoot,$CsvPath)){return $true}} 8
 $remove=[PLC Engineering Suite.Weinview.TagQtControls]::Checkbox($Session.native,$qtRoot,'移除旧标签',[bool]$ReplaceMergedTable)
 $replace=[PLC Engineering Suite.Weinview.TagQtControls]::Checkbox($Session.native,$qtRoot,'用新标签替换现有标签',$true)
 if($remove -ne [bool]$ReplaceMergedTable -or !$replace -or (Hash $CsvPath) -ne $inputHash){throw 'Preserving import options/input changed.'}
 [PLC Engineering Suite.Weinview.TagQtControls]::Invoke($Session.native,$qtRoot,'导入')
 $success=Get-WeinviewTagDialog $Session 'EasyBuilder Pro'
 $body=$Session.native.FindUniqueControlWithoutLabel($success.Hwnd,65535,'Static')
 $expected='已导入: '+$Rows.Length+" 笔记录`n已忽略: 0 笔记录"
 if([PLC Engineering Suite.Weinview.NativeControls]::NormalizeLF($Session.native.GetControlText($body.Hwnd,4096)) -cne $expected){throw 'Native import records/ignored count differs; no save.'}
 $Session.native.ClickButton($success.Hwnd,2,'确定')
 return @{remove_existing=[bool]$ReplaceMergedTable;replace_existing=$true;native_imported_count=$Rows.Length;native_ignored_count=0;input_csv_sha256=$inputHash}
}
function Update-WeinviewExistingTag($Session,[PLC Engineering Suite.Weinview.TagRow]$Before,[PLC Engineering Suite.Weinview.TagRow]$After) {
 if($Before.name -cne $After.name){throw 'Native tag rename is not allowed.'}
 $Session.tag_property_name=$Before.name
 $library=Get-WeinviewTagDialog $Session '地址标签库'
 $filter=$Session.native.FindUniqueControl($library.Hwnd,1005,'Edit',$null)
 $Session.native.SetControlText($filter.Hwnd,'')
 $grids=@($Session.native.EnumChildControls($library.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class.StartsWith('BCGPGridCtrl:')})
 if($grids.Count -ne 1){throw 'Unique original-vendor tag grid required.'}
 $selectionState=[PLC Engineering Suite.Weinview.TagQtControls]::SelectExistingTag($Session.native,$grids[0].Hwnd,$Before.name)
 $null=WaitFor {$button=$Session.native.FindUniqueControl($library.Hwnd,3,'Button','设置...');if($button.Enabled){return $true}} 5
 $Session.native.ClickButton($library.Hwnd,3,'设置...')
 $dialog=Get-WeinviewTagDialog $Session '地址标签'
 $property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $fields=@{name=1557;comment=1174;address=1556}
 foreach($field in $fields.Keys){$control=$Session.native.FindUniqueControl($dialog.Hwnd,$fields[$field],'Edit',$null);if($Session.native.GetControlText($control.Hwnd,4096) -cne $Before.$field){throw 'Selected existing native tag does not match before snapshot; no field write.'}}
 $combos=@{device=1646;address_type=1288;data_type=2143}
 foreach($field in $combos.Keys){$control=$Session.native.FindUniqueControl($dialog.Hwnd,$combos[$field],'ComboBox',$null);if($property.ComboSelected($control.Hwnd) -cne $Before.$field){throw 'Selected existing native tag binding differs; no field write.'}}
 $word=$Session.native.FindUniqueControl($dialog.Hwnd,1611,'Button','字')
 $converts=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Id -eq 1045 -and $_.Class -ceq 'Button' -and $_.Title -ceq '启用'})
 if($converts.Count -ne 1){throw 'Unique original-vendor conversion checkbox required.'}
 if($property.GetRadioState($word.Hwnd) -ne 1 -or $Session.native.GetCheckboxState($converts[0].Hwnd) -ne 0){throw 'Existing converted/non-word tag is outside captured six-field scope; no update.'}
 foreach($field in @('device','address_type','data_type')){
  $control=$Session.native.FindUniqueControl($dialog.Hwnd,$combos[$field],'ComboBox',$null)
  if($Before.$field -cne $After.$field){$property.SelectComboExact($control.Hwnd,$After.$field)}
 }
 foreach($field in @('comment','address')){if($Before.$field -cne $After.$field){$control=$Session.native.FindUniqueControl($dialog.Hwnd,$fields[$field],'Edit',$null);$Session.native.SetControlText($control.Hwnd,$After.$field)}}
 foreach($field in $fields.Keys){$control=$Session.native.FindUniqueControl($dialog.Hwnd,$fields[$field],'Edit',$null);if($Session.native.GetControlText($control.Hwnd,4096) -cne $After.$field){throw 'Native updated tag field readback differs.'}}
 foreach($field in $combos.Keys){$control=$Session.native.FindUniqueControl($dialog.Hwnd,$combos[$field],'ComboBox',$null);if($property.ComboSelected($control.Hwnd) -cne $After.$field){throw 'Native updated tag binding readback differs.'}}
 $Session.native.ClickButton($dialog.Hwnd,1,'确定')
 $library=Get-WeinviewTagDialog $Session '地址标签库';$Session.native.SetControlText(($Session.native.FindUniqueControl($library.Hwnd,1005,'Edit',$null)).Hwnd,'')
 return @{name=$After.name;existing_tag_updated=$true;name_preserved=$true;selection='native_accessibility_value_and_exact_property_before_readback';selected_state=$selectionState;fixed_coordinates=$false;global_input=$false}
}
