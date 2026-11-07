# Private validated PLC helpers. Definitions only; no UI work on dot-source.
# Caller owns fresh-copy/path/hash preflight, dedicated StartOwned, exact semantic
# system-parameter entry, Save/normal close/reopen verification. No arbitrary PID API.
function Get-WeinviewModbusDriverFile($Session) {
 $format=[IO.Path]::GetExtension([string]$Session.output_path).ToLowerInvariant()
 if($format -ceq '.cmtp'){return 'MODBUS_TCPIP.c30'}
 if($format -ceq '.emtp'){return 'MODBUS_TCPIP.e30'}
 throw 'Original CMTP/EMTP project required for MODBUS TCP/IP device read.'
}
function Assert-WeinviewPlcCandidateSession($Session) {
 if(!$Session.native -or !$Session.main -or !$Session.process -or !$Session.fresh_copy_verified -or !$Session.output_path){throw 'Dedicated verified fresh-copy session required.'}
 if($Session.process.HasExited){throw 'Dedicated process exited.'}
 $stem=[IO.Path]::GetFileNameWithoutExtension($Session.output_path)
 $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title.Contains($stem)})
 if($main.Count -ne 1){throw 'Dedicated output main identity changed.'}
 if(!$main[0].Enabled -and (Get-Command Resolve-WeinviewOwnedProjectOpenNotices -ErrorAction SilentlyContinue)){
  Resolve-WeinviewOwnedProjectOpenNotices $Session $Session.main.Hwnd
 }
}
function Get-WeinviewPlcCandidateDialog($Session,[long]$DialogHwnd) {
 Assert-WeinviewPlcCandidateSession $Session
 $d=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Title -ceq '设备属性'})
 if($d.Count -ne 1){throw 'Exact enabled native device dialog required.'}
 return $d[0]
}
function Read-WeinviewModbusCandidate($Session,[long]$DialogHwnd) {
 $d=Get-WeinviewPlcCandidateDialog $Session $DialogHwnd
 $native=$Session.native
 function ReadField([int]$id,[string]$class){
  if($id -eq 1618 -and $class -ceq 'ComboBox'){
   # CN421 shows this fixed location in a disabled combo; other accepted
   # projects may keep it enabled. Reading its exact value needs visibility,
   # not editability, while all later value/profile checks remain unchanged.
   $matches=@($native.EnumChildControls($d.Hwnd)|Where-Object {$_.Id -eq 1618 -and $_.Class -ceq 'ComboBox' -and $_.Visible})
   if($matches.Count -ne 1){throw 'Unique visible native location field required.'}
   return $native.GetControlText($matches[0].Hwnd,4096)
  }
  $c=$native.FindUniqueControlWithoutLabel($d.Hwnd,$id,$class);return $native.GetControlText($c.Hwnd,4096)
 }
 $driver=ReadField 1627 'Static'
 $driverFile=Get-WeinviewModbusDriverFile $Session
 if($driver.Trim() -cne ('设备 ID : 58, V.3.30, '+$driverFile)){throw 'Device driver differs from actual 421 MODBUS TCP/IP profile.'}
 $location=ReadField 1618 'ComboBox';$interface=ReadField 1619 'ComboBox';$endpoint=ReadField 1623 'Static'
 if($location -cne '本机' -or $interface -cne '以太网'){throw 'Only actual local Ethernet device profile is accepted.'}
 $udp=$native.GetCheckboxState(($native.FindUniqueControl($d.Hwnd,1899,'Button','使用 UDP (User Datagram Protocol)')).Hwnd)
 return [pscustomobject]@{device_name=(ReadField 1616 'Edit');driver='MODBUS TCP/IP';driver_id=58;driver_version='3.30';driver_file=$driverFile;location=$location;interface=$interface;station=(ReadField 2280 'Edit');endpoint_display=$endpoint;udp=$udp;scope='offline_project_configuration';persisted_verified=$false}
}
function Read-WeinviewEthernetDeviceCandidate($Session,[long]$DialogHwnd,[string]$ExpectedDriver,[string]$ExpectedInterface='以太网') {
 $d=Get-WeinviewPlcCandidateDialog $Session $DialogHwnd
 $native=$Session.native
 $controls=@($native.EnumChildControls($d.Hwnd))
 function Field([int]$id,[string]$class){$matches=@($controls|Where-Object {$_.Id -eq $id -and $_.Class -ceq $class -and $_.Visible});if($matches.Count -ne 1){throw ('Unique visible native device field required: '+$id)};return $matches[0]}
 $driver=$native.GetControlText((Field 1625 'Button').Hwnd,256)
 if($driver -cne $ExpectedDriver){throw 'Opened native device driver differs from exact requested list selection.'}
 $raw=$native.GetControlText((Field 1627 'Static').Hwnd,256)
 $match=[regex]::Match($raw,'^设备 ID : ([1-9][0-9]{0,4}), V\.([0-9]+(?:\.[0-9]+)*), ([A-Za-z0-9_]+\.(?:c30|e30))$')
 if(!$match.Success){throw 'Original Ethernet driver identity/version/file differs from native form.'}
 $extension=if([IO.Path]::GetExtension([string]$Session.output_path) -ieq '.cmtp'){'.c30'}elseif([IO.Path]::GetExtension([string]$Session.output_path) -ieq '.emtp'){'.e30'}else{throw 'Original CMTP/EMTP project required.'}
 if(!$match.Groups[3].Value.EndsWith($extension,[StringComparison]::Ordinal)){throw 'Original driver file/project format differs.'}
 $name=$native.GetControlText((Field 1616 'Edit').Hwnd,256)
 $location=$native.GetControlText((Field 1618 'ComboBox').Hwnd,256)
 $interface=$native.GetControlText((Field 1619 'ComboBox').Hwnd,256)
 $endpoint=$native.GetControlText((Field 1623 'Static').Hwnd,256)
 if($location -cne '本机' -or $interface -cne $ExpectedInterface -or [string]::IsNullOrWhiteSpace($endpoint)){throw 'Original local device interface/property profile required.'}
 $stationField=@($controls|Where-Object {$_.Id -eq 2280 -and $_.Class -ceq 'Edit' -and $_.Visible})
 if($stationField.Count -gt 1){throw 'Original device station field duplicated.'}
 $station=if($stationField.Count){$native.GetControlText($stationField[0].Hwnd,64)}else{$null}
 $udpField=@($controls|Where-Object {$_.Id -eq 1899 -and $_.Class -ceq 'Button' -and $_.Visible})
 if($udpField.Count -gt 1){throw 'Original device UDP field duplicated.'}
 $udp=if($udpField.Count){$native.GetCheckboxState($udpField[0].Hwnd)}else{$null}
 return [pscustomobject]@{device_name=$name;driver=$driver;driver_id=[int]$match.Groups[1].Value;driver_version=$match.Groups[2].Value;driver_file=$match.Groups[3].Value;location=$location;interface=$interface;station=$station;endpoint_display=$endpoint;udp=$udp;scope='offline_project_configuration';native_fields_verified=$true;persisted_verified=$false}
}
function Set-WeinviewEthernetDeviceFieldsCandidate($Session,[long]$DialogHwnd,[string]$DeviceName,[string]$Driver,[Nullable[int]]$Station=$null,[string]$ExpectedInterface='以太网') {
 if([string]::IsNullOrWhiteSpace($DeviceName) -or $DeviceName.Length -gt 64 -or $DeviceName -match '[\x00-\x1f\x7f]'){throw 'Bounded native device name required.'}
 $before=Read-WeinviewEthernetDeviceCandidate $Session $DialogHwnd $Driver $ExpectedInterface
 $native=$Session.native
 $native.SetControlText(($native.FindUniqueControlWithoutLabel($DialogHwnd,1616,'Edit')).Hwnd,$DeviceName)
 if($null -ne $Station){
  $field=@($native.EnumChildControls($DialogHwnd)|Where-Object {$_.Id -eq 2280 -and $_.Class -ceq 'Edit' -and $_.Visible -and $_.Enabled})
  if($field.Count -ne 1){throw 'Requested station field absent or not editable in original driver.'}
  $native.SetControlText($field[0].Hwnd,[string]$Station)
 }
 $after=Read-WeinviewEthernetDeviceCandidate $Session $DialogHwnd $Driver $ExpectedInterface
 if($after.device_name -cne $DeviceName -or $after.driver_id -ne $before.driver_id -or $after.driver_file -cne $before.driver_file -or $after.driver_version -cne $before.driver_version -or $after.location -cne $before.location -or $after.interface -cne $before.interface -or $after.endpoint_display -cne $before.endpoint_display -or $after.udp -ne $before.udp -or ($null -eq $Station -and $after.station -cne $before.station) -or ($null -ne $Station -and [string]$after.station -cne [string]$Station)){throw 'Original Ethernet device fields changed outside requested name/station.'}
 return $after
}
function Set-WeinviewModbusStandardFieldsCandidate($Session,[long]$DialogHwnd,[string]$DeviceName,[int]$Station=1) {
 if(!$DeviceName -or $DeviceName.Length -gt 64 -or $DeviceName -match '[\x00-\x1f]'){throw 'Device name must be 1..64 characters without controls.'}
 if($Station -ne 1){throw 'Only actual station 1 profile has been tested.'}
 $before=Read-WeinviewModbusCandidate $Session $DialogHwnd
 # Preserve the freshly read endpoint while changing only name/station.
 # EBPro remembers prior endpoints; the Qt stage protects its exact fresh before-value.
 if($before.udp -ne 0){throw 'Native MODBUS device is not TCP (UDP must be disabled).'}
 $n=$Session.native
 $n.SetControlText(($n.FindUniqueControlWithoutLabel($DialogHwnd,1616,'Edit')).Hwnd,$DeviceName)
 $n.SetControlText(($n.FindUniqueControlWithoutLabel($DialogHwnd,2280,'Edit')).Hwnd,'1')
 $after=Read-WeinviewModbusCandidate $Session $DialogHwnd
 if($after.device_name -cne $DeviceName -or $after.station -cne '1' -or $after.endpoint_display -cne $before.endpoint_display -or $after.udp -ne $before.udp){throw 'Native device field readback differs.'}
 return $after
}
function Select-WeinviewExactDriverCandidate($Session,[long]$DialogHwnd,[string]$DriverName) {
 if([string]::IsNullOrWhiteSpace($DriverName) -or $DriverName.Length -gt 128 -or $DriverName -match '[\x00-\x1f\x7f]'){throw 'Bounded exact native driver name required.'}
 $d=Get-WeinviewPlcCandidateDialog $Session $DialogHwnd
 $vendorControl=$Session.native.FindUniqueControlWithoutLabel($d.Hwnd,2160,'ComboBox')
 $list=$Session.native.FindUniqueControlWithoutLabel($d.Hwnd,2506,'ListBox')
 $property=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $vendors=@($property.ComboItems($vendorControl.Hwnd))
 if(!$vendors.Count -or $vendors.Count -gt 256){throw 'Bounded original vendor list required.'}
 $candidates=@()
 foreach($vendor in $vendors){
  $property.SelectComboExact($vendorControl.Hwnd,[string]$vendor)
  $items=@($Session.native.GetListBoxItems($list.Hwnd))
  if($items.Count -gt 2048){throw 'Original driver list exceeds bounded search.'}
  for($i=0;$i -lt $items.Count;$i++){if($items[$i] -ceq $DriverName){$candidates+=,[pscustomobject]@{vendor=[string]$vendor;index=$i}}}
 }
 if($candidates.Count -ne 1){throw 'Exact native driver name is absent or ambiguous across original vendor list.'}
 $property.SelectComboExact($vendorControl.Hwnd,$candidates[0].vendor)
 $final=@($Session.native.GetListBoxItems($list.Hwnd))
 if($candidates[0].index -ge $final.Count -or $final[$candidates[0].index] -cne $DriverName){throw 'Original driver entry changed after vendor selection.'}
 $Session.native.SelectListItem($list.Hwnd,$candidates[0].index,$DriverName)
 return [pscustomobject]@{driver=$DriverName;vendor=$candidates[0].vendor;vendor_control_id=2160;list_control_id=2506;index=$candidates[0].index;selection_verified=$true;confirmation_performed=$false}
}
function Select-WeinviewModbusDriverCandidate($Session,[long]$DialogHwnd) {
 $d=Get-WeinviewPlcCandidateDialog $Session $DialogHwnd
 $list=$Session.native.FindUniqueControlWithoutLabel($d.Hwnd,2506,'ListBox')
 $items=@($Session.native.GetListBoxItems($list.Hwnd));$matches=@()
 for($i=0;$i -lt $items.Count;$i++){if($items[$i] -ceq 'MODBUS TCP/IP'){$matches+=$i}}
 if($matches.Count -eq 1){$Session.native.SelectListItem($list.Hwnd,$matches[0],'MODBUS TCP/IP');return [pscustomobject]@{driver='MODBUS TCP/IP';list_control_id=2506;index=$matches[0];selection_verified=$true;confirmation_performed=$false}}
 return Select-WeinviewExactDriverCandidate $Session $DialogHwnd 'MODBUS TCP/IP'
}
function Invoke-WeinviewSerialSettingsCandidate($Session,[long]$DialogHwnd,[string]$Mode,$RequestedSettings) {
 Assert-WeinviewPlcCandidateSession $Session
 if($Mode -cnotin @('Apply','Update','Readback','Inspect')){throw 'Unsupported serial settings mode.'}
 if($Mode -cin @('Apply','Update') -and !$RequestedSettings){throw 'At least one explicit serial field is required.'}
 $candidate=[PLC Engineering Suite.Weinview.QtSerialSettingsCandidate]::new($Session.native)
 try {
  if($Mode -cin @('Apply','Update')){
   $requested=[System.Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
   foreach($property in $RequestedSettings.PSObject.Properties){$requested.Add([string]$property.Name,[string]$property.Value)}
   return $candidate.Apply($DialogHwnd,$requested)
  }
  $actual=$candidate.Read($DialogHwnd)
  $candidate.Confirm($DialogHwnd,$false)
  return [pscustomobject]@{before=$actual;actual=$actual;stage_trace=@('read_only_serial_settings')}
 }catch{
  $failure=$_
  try {
   $nodes=@($candidate.Probe($DialogHwnd))
   $failure.Exception.Data['serial_qt_probe']=@{dialog_hwnd=$DialogHwnd;node_count=$nodes.Count;semantic_nodes=@($nodes|Where-Object {$_.Name -match 'COM|Baud|Data|Parity|Stop|端口|波特|数据|资料|校验|停止|确定|取消'}|Select-Object -First 40 Path,Name,Value,Role,State,X,Y,Width,Height);probe_scope='owned_modal_semantic'}
  }catch{}
  throw $failure
 }
}
