# Finite CN421 TK local MODBUS Server configuration. Caller saves/closes/reopens.
function Get-WeinviewNativeDeviceDirectory($Session,$System) {
 $n=$Session.native
 $qs=@($n.EnumChildControls($System.Hwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})
 if($qs.Count -ne 1){throw 'Unique current system device Qt page required'}
 $page=$qs[0].Hwnd
 $nodes=@([PLCCode.Weinview.ServerDeviceDirectoryControls]::Inspect($n,$System.Hwnd,$page,'系统参数设置 '));$path='client/index:0/index:0/index:0/index:2/index:0/index:0';$branch=@($nodes|Where-Object path -CEQ $path)
 if($branch.Count -ne 1 -or $branch[0].role -ne 35 -or $branch[0].count -lt 14 -or ($branch[0].count-7)%7 -ne 0){throw 'Exact seven-column complete native device table required'}
 $headers=@('','名称','位置','设备类型','界面','通讯协议','站号');for($i=0;$i -lt 7;$i++){$cell=@($nodes|Where-Object path -CEQ ($path+'/index:'+$i));if($cell.Count -ne 1 -or $cell[0].role -ne 25 -or [string]$cell[0].name -cne $headers[$i]){throw 'Native device headers changed'}}
 $rows=@();$names=@{};$utf8=New-Object Text.UTF8Encoding($false,$true);for($index=7;$index -lt $branch[0].count;$index+=7){$row=[ordered]@{};$keys=@('category','name','location','device_type','interface','protocol','station');for($i=0;$i -lt 7;$i++){$cell=@($nodes|Where-Object path -CEQ ($path+'/index:'+($index+$i)));if($cell.Count -ne 1 -or $cell[0].role -ne 36 -or $cell[0].count -ne 0){throw 'Incomplete native device row'};$row[$keys[$i]]=[string]$cell[0].name};if([string]::IsNullOrWhiteSpace($row.name) -or $row.name.Length -gt 64 -or $row.name -match '[\x00-\x1f\x7f]' -or $names.ContainsKey($row.name)){throw 'Native device names invalid or ambiguous'};$null=$utf8.GetBytes($row.name);$names[$row.name]=$true;$rows+=[pscustomobject]$row}
 $hmi=@($rows|Where-Object name -CEQ 'Local HMI');if($hmi.Count -ne 1 -or [string]::IsNullOrWhiteSpace([string]$hmi[0].device_type)){throw 'Unique original Local HMI directory row and native model text required'}
 return [pscustomobject]@{page=$page;rows=$rows}
}
function Read-WeinviewProjectDeviceDirectory($Session,[bool]$UseNativeHost=$true) {
 Assert-WeinviewPlcCandidateSession $Session
 if($UseNativeHost -and [int]$Session.native_host_port -gt 0){
  if(!(Get-Command Invoke-WeinviewNativeHostRead -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')}
  $hostData=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getAllData
  $devices=@($hostData.metadata.sys_params.devices)
  $names=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
  $rows=@(foreach($device in $devices){
   if(!$device -or [string]::IsNullOrWhiteSpace([string]$device.name) -or !$names.Add([string]$device.name)){throw 'Current native host device directory is empty or ambiguous.'}
   [pscustomobject]@{name=[string]$device.name;location=[string]$device.location;device_type=[string]$device.type;interface=[string]$device.interface;protocol=[string]$device.protocol;station=[string]$device.station_no}
  })
  if(@($rows|Where-Object {$_.name -ceq 'Local HMI' -and $_.device_type}).Count -ne 1){throw 'Current native host directory lacks the actual HMI model.'}
  Assert-WeinviewPlcCandidateSession $Session
  return @{device_directory=$rows;native_directory_verified=$true;ribbon_evidence=@{read_route='native_host';native_host_method='getAllData';metadata_scope='sys_params.devices';input_performed=$false}}
 }
 $n=$Session.native;$property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($n);$dialog=$null
 try {
  $entry=Open-WeinviewSystemParametersRibbon $Session $semantic
  $dialog=WaitFor {$all=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if(@($all|Where-Object {$_.Title -cne '系统参数设置 '}).Count){throw 'Unknown device-directory modal; preserve'};if($all.Count -eq 1 -and $all[0].Enabled){return $all[0]}} 8
  $tab=$n.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32');$property.SelectTabExact($tab.Hwnd,'设备')
  $directory=Get-WeinviewNativeDeviceDirectory $Session $dialog
  $n.ClickButton($dialog.Hwnd,2,'取消')
  $null=WaitFor {if(!@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 8
  return @{device_directory=@($directory.rows);native_directory_verified=$true;ribbon_evidence=$entry}
 } catch {
  if($dialog){
   $all=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if($all.Count -eq 1 -and $all[0].Hwnd -eq $dialog.Hwnd -and $all[0].Title -ceq '系统参数设置 ' -and $all[0].Enabled){$n.ClickButton($dialog.Hwnd,2,'取消')}
  }
  throw
 }
}
function Invoke-WeinviewServerConfiguration($Session,[ValidateSet('Read','Configure')][string]$Mode,[string]$DeviceName,[string]$EvidencePrefix,[Nullable[int]]$Port=$null){
 $ErrorActionPreference='Stop';Assert-WeinviewPlcCandidateSession $Session
 . (Join-Path $PSScriptRoot 'ModelCatalog.ps1')
 if(!$DeviceName -or $DeviceName.Length -gt 64 -or $DeviceName -match '[\x00-\x1f]'){throw 'Bounded exact server device name required'}
 $n=$Session.native;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path);$sem=[PLCCode.Weinview.NativeSemanticControls]::new($n)
 function AwaitServer([scriptblock]$test){$end=[DateTime]::UtcNow.AddSeconds(8);do{$value=& $test;if($value){return $value};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end);throw 'Server modal/control transition timed out'}
 function Modal([string]$title,[int[]]$ids){return AwaitServer {$ds=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if(@($ds|Where-Object {$_.Title -cnotin @('系统参数设置 ','设备属性')}).Count){throw 'Unknown owned server modal; preserve'};$enabled=@($ds|Where-Object Enabled);if($enabled.Count -ne 1 -or $enabled[0].Title -cne $title){return};$cs=@($n.EnumChildControls($enabled[0].Hwnd));foreach($id in $ids){if(@($cs|Where-Object {$_.Id -eq $id -and $_.Visible -and $_.Enabled}).Count -ne 1){return}};return $enabled[0]}}
 function C([long]$h,[int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($h,$id,$class)}
 function Text([long]$h,[int]$id,[string]$class){return $n.GetControlText((C $h $id $class).Hwnd,1024)}
 function Model($system){
  $rows=@();$keys=@{};foreach($control in @($n.EnumChildControls($system.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -cin @('Edit','ComboBox')}|Sort-Object Id,Class)){$key=[string]$control.Id+':'+$control.Class;if($keys.ContainsKey($key)){throw 'HMI parameter ID/class duplicated'};$keys[$key]=$true;$value=if($control.Class -ceq 'ComboBox'){$p.ComboSelected($control.Hwnd)}else{$n.GetControlText($control.Hwnd,4096)};$rows+=[pscustomobject][ordered]@{id=[int]$control.Id;class=[string]$control.Class;value=[string]$value}};return $rows
 }
 function PreserveModel($before,$after,[int]$expectedPort){if($before.Count -ne $after.Count){throw 'HMI parameter set changed'};foreach($old in $before){$same=@($after|Where-Object {$_.id -eq $old.id -and $_.class -ceq $old.class});$expected=if($old.id -eq 2013 -and $old.class -ceq 'Edit'){[string]$expectedPort}else{$old.value};if($same.Count -ne 1 -or $same[0].value -cne $expected){throw 'Unrequested HMI parameter changed'}}}
 function Directory($system){
  $directory=Get-WeinviewNativeDeviceDirectory $Session $system
   $hmi=@($directory.rows|Where-Object name -CEQ 'Local HMI');if(!(Test-WeinviewOriginalModelLabel $hmi[0].device_type $Session.exe_path)){throw 'Installed original catalog HMI model required'}
  return $directory
 }
 $entry=Open-WeinviewSystemParametersRibbon $Session $sem;$system=Modal '系统参数设置 ' @(12320,1,2);$p.SelectTabExact((C $system.Hwnd 12320 'SysTabControl32').Hwnd,'HMI 属性')
 $portBefore=[int](Text $system.Hwnd 2013 'Edit');$hmiStation=$p.ComboSelected((C $system.Hwnd 1541 'ComboBox').Hwnd);if($portBefore -notin @(8000,502) -or $hmiStation -cne '0'){throw 'Observed port8000/502 and HMIstation0 required'}
 $modelBefore=@(Model $system);$effectivePort=$portBefore
 if($null -ne $Port){if($Mode -cne 'Configure' -or [int]$Port -notin @(8000,502)){throw 'Only explicit Configure port8000/502 accepted'};$effectivePort=[int]$Port}
 $p.SelectTabExact((C $system.Hwnd 12320 'SysTabControl32').Hwnd,'设备');$before=Directory $system;$matches=@($before.rows|Where-Object name -CEQ $DeviceName);$buttons='client/index:0/index:0/index:0/index:3/'
 if($Mode -ceq 'Configure'){
  if($matches.Count){throw 'Server name exists; no overwrite'}
  if(@($before.rows|Where-Object device_type -CEQ 'MODBUS Server').Count){throw 'Existing server preserved; multiple server profile unverified'}
  if($effectivePort -ne $portBefore){$p.SelectTabExact((C $system.Hwnd 12320 'SysTabControl32').Hwnd,'HMI 属性');$n.SetControlText((C $system.Hwnd 2013 'Edit').Hwnd,[string]$effectivePort);if((Text $system.Hwnd 2013 'Edit') -cne [string]$effectivePort){throw 'Requested HMI port readback differs'};$modelAfterWrite=@(Model $system);PreserveModel $modelBefore $modelAfterWrite $effectivePort;$p.SelectTabExact((C $system.Hwnd 12320 'SysTabControl32').Hwnd,'设备')}
  $null=$sem.Execute($before.page,$buttons+'index:0','新增设备/服务器...',43,'Invoke');$device=Modal '设备属性' @(1616,1625,1,2)
  $driver=C $device.Hwnd 1625 'Button';if($driver.Title -cne 'MODBUS Server'){$n.ClickButton($device.Hwnd,1625,$driver.Title);$selector=Modal '设备属性' @(2506,1,2);$list=C $selector.Hwnd 2506 'ListBox';$items=@($n.GetListBoxItems($list.Hwnd));$indices=@();for($i=0;$i -lt $items.Count;$i++){if($items[$i] -ceq 'MODBUS Server'){$indices+=$i}};if($indices.Count -ne 1){throw 'Unique installed MODBUS Server driver required'};$n.SelectListItem($list.Hwnd,$indices[0],'MODBUS Server');$n.ClickButton($selector.Hwnd,1,'确定');$device=Modal '设备属性' @(1616,1625,1,2)}
  $p.SelectComboExact((C $device.Hwnd 1618 'ComboBox').Hwnd,'本机');$p.SelectComboExact((C $device.Hwnd 1619 'ComboBox').Hwnd,'以太网');$n.SetControlText((C $device.Hwnd 1616 'Edit').Hwnd,$DeviceName)
 }else{
  if($matches.Count -ne 1 -or $matches[0].device_type -cne 'MODBUS Server'){throw 'Exact existing native MODBUS Server name required'};$path=$sem.FindUniqueDeviceRow($before.page,$DeviceName);$null=$sem.Execute($before.page,$path,$DeviceName,36,'ClickSemantic');$null=$sem.Execute($before.page,$buttons+'index:4','设置...',43,'Invoke');$device=Modal '设备属性' @(1616,1625,1,2)
 }
 $h=$device.Hwnd;if((Text $h 1625 'Button') -cne 'MODBUS Server' -or (Text $h 1627 'Static') -cne '设备 ID : 54, V.1.50, MODBUS_SERVER.e30' -or $p.ComboSelected((C $h 1618 'ComboBox').Hwnd) -cne '本机' -or $p.ComboSelected((C $h 1619 'ComboBox').Hwnd) -cne '以太网' -or (Text $h 2280 'Edit') -cne '1' -or (Text $h 1623 'Static') -cne ('端口号 = '+$effectivePort) -or $n.GetCheckboxState((C $h 1899 'Button').Hwnd) -ne 0 -or $n.GetCheckboxState((C $h 2519 'Button').Hwnd) -ne 0 -or (Text $h 1616 'Edit') -cne $DeviceName){throw 'Observed finite server driver/station/TCP/gateway contract differs'}
 $server=[ordered]@{device_name=$DeviceName;driver='MODBUS Server';driver_id=54;driver_version='1.50';driver_file='MODBUS_SERVER.e30';location='本机';interface='以太网';port=$effectivePort;device_station=1;hmi_station=0;udp=$false;gateway_enabled=$false}
 if($Mode -ceq 'Configure'){$n.ClickButton($h,1,'确定')}else{$n.ClickButton($h,2,'取消')};$system=Modal '系统参数设置 ' @(12320,1,2);$after=Directory $system
 foreach($old in $before.rows){$same=@($after.rows|Where-Object name -CEQ $old.name);if($same.Count -ne 1){throw 'Existing native device row absent/duplicated'};foreach($key in @('category','name','location','device_type','interface','protocol','station')){if($same[0].$key -cne $old.$key){throw 'Unrequested existing native device row changed'}}}
 $expectedCount=$before.rows.Count+$(if($Mode -ceq 'Configure'){1}else{0});if($after.rows.Count -ne $expectedCount){throw 'Native complete device count differs'}
 $p.SelectTabExact((C $system.Hwnd 12320 'SysTabControl32').Hwnd,'HMI 属性');$modelAfter=@(Model $system);PreserveModel $modelBefore $modelAfter $effectivePort
 if($Mode -ceq 'Configure'){$n.ClickButton($system.Hwnd,1,'确定')}else{$n.ClickButton($system.Hwnd,2,'取消')};$null=AwaitServer {if(!@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}}
 $result=[pscustomobject]@{server=$server;devices_before=@($before.rows);device_directory=@($after.rows);preserved_existing_devices=$true;port_before=$portBefore;port_after=$effectivePort;hmi_parameters_before=$modelBefore;hmi_parameters_after=$modelAfter;hmi_parameters_preserved=$true;preservation_scope='complete original-vendor seven-column device directory rows; observed HMI parameters preserved except explicit requested global port change';project_saved=$false;runtime_values_verified=$false;protocol_access_verified=$false;ribbon_evidence=$entry}
 if($EvidencePrefix){WritePrivateJson ($EvidencePrefix+'.server.json') $result};return $result
}
