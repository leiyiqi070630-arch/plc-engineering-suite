# Windows PowerShell 5.1; original-vendor local LW/LB monitors through private EWT files.
# Definitions only. Public simulation receipt and original native owners required.
function Get-WeinviewNumericFormatLabel([string]$Format) {
 switch -CaseSensitive ($Format) {'int16' {'16-bit Signed'} 'uint16' {'16-bit Unsigned'} 'float32' {'32-bit Float'} 'int32' {'32-bit Signed'} 'uint32' {'32-bit Unsigned'} 'bool' {'Bit'} default {throw 'Unknown native monitor format.'}}
}
function ConvertTo-WeinviewFloat32($Value) {
 if($Value -isnot [int] -and $Value -isnot [long] -and $Value -isnot [double] -and $Value -isnot [single] -and $Value -isnot [decimal]){throw 'Finite JSON number required for float32.'}
 $number=[double]$Value
 if([double]::IsNaN($number) -or [double]::IsInfinity($number)){throw 'Finite float32 number required.'}
 $single=[single]$number
 if([single]::IsNaN($single) -or [single]::IsInfinity($single)){throw 'Number exceeds finite float32 range.'}
 return [double]$single
}
function Get-WeinviewValueAddressType($Request) {
 $keys=if($Request -is [Collections.IDictionary]){@($Request.Keys)}else{@($Request.PSObject.Properties.Name)}
 if($keys -ccontains 'address_type'){return [string]$Request.address_type}
 if($Request.format -ceq 'bool'){return 'LB'}
 return 'LW'
}
function Assert-WeinviewValuesArguments($Arguments) {
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if(@($keys|Where-Object {$_ -cnotin @('workspace_root','session_id','addresses')}).Count){throw 'Unknown simulation values argument.'}
 if($Arguments.workspace_root -isnot [string] -or $Arguments.session_id -isnot [string] -or $Arguments.session_id -cnotmatch '^[0-9a-f]{32}$'){throw 'Public workspace and opaque lowercase32 session_id required.'}
 if($Arguments.addresses -isnot [array] -or @($Arguments.addresses).Count -lt 1 -or @($Arguments.addresses).Count -gt 8){throw 'addresses must be an array of1..8 local LW int16 or readonly LB bool requests.'}
 $seen=New-Object 'Collections.Generic.HashSet[string]'
 foreach($item in $Arguments.addresses){
  $fields=if($item -is [Collections.IDictionary]){@($item.Keys)}else{@($item.PSObject.Properties.Name)}
  $registerSpace=Get-WeinviewValueAddressType $item
  if($fields.Count -ne $(if($fields -ccontains 'address_type'){3}else{2}) -or @($fields|Where-Object {$_ -cnotin @('address','format','address_type')}).Count -or $registerSpace -cnotin @('LW','LB','PLW') -or ($registerSpace -ceq 'LB' -and $item.format -cne 'bool') -or ($registerSpace -ceq 'LW' -and $item.format -ceq 'bool') -or ($registerSpace -ceq 'PLW' -and ($item.address -ne 9134 -or $item.format -cne 'int16')) -or ($item.address -isnot [int] -and $item.address -isnot [long]) -or $item.address -lt 0 -or $item.address -gt 9999 -or $item.format -isnot [string] -or $item.format -cnotin @('int16','bool','uint16','float32','int32','uint32') -or ($item.format -ceq 'bool' -and $item.address -gt 8999 -and $item.address -ne 9043) -or ($item.format -cin @('uint16','float32') -and $item.address -gt $(if($item.format -ceq 'float32'){8998}else{8999})) -or ($item.format -cin @('int32','uint32') -and $item.address -gt 9998) -or !$seen.Add($registerSpace+':'+[string]$item.address)){throw 'Unique valid register-space/address required; duplicates within one space are rejected.'}
 }
}
function Assert-WeinviewValueWriteArguments($Arguments) {
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 $hasWindowNumber=($keys -ccontains 'window_number');$hasWindowName=($keys -ccontains 'window_name')
 if($hasWindowNumber -ne $hasWindowName -or $keys.Count -ne ($(if($hasWindowNumber){8}else{6})+$(if($keys -ccontains 'address_type'){1}else{0})) -or @($keys|Where-Object {$_ -cnotin @('workspace_root','session_id','address','format','expected_value','value','window_number','window_name','address_type')}).Count){throw 'Exact workspace/session/address/format/expected_value/value write arguments, with optional address_type and paired window_number/window_name, required.'}
 if($hasWindowNumber -and (($Arguments.window_number -isnot [int] -and $Arguments.window_number -isnot [long]) -or [long]$Arguments.window_number -lt 1 -or [long]$Arguments.window_number -gt 4095 -or $Arguments.window_name -isnot [string] -or [string]::IsNullOrWhiteSpace($Arguments.window_name) -or $Arguments.window_name.Length -gt 128 -or $Arguments.window_name -match '[\x00-\x1f\x7f]')){throw 'Exact cMT window_number 1..4095 and nonempty native window_name up to128 characters required.'}
 $addressType=Get-WeinviewValueAddressType $Arguments
 $languageRegister=([long]$Arguments.address -eq 9134 -and $addressType -cin @('LW','PLW'))
 if($Arguments.workspace_root -isnot [string] -or $Arguments.session_id -isnot [string] -or $Arguments.session_id -cnotmatch '^[0-9a-f]{32}$' -or ($Arguments.address -isnot [int] -and $Arguments.address -isnot [long]) -or $Arguments.address -lt 0 -or ($Arguments.address -gt 8999 -and !$languageRegister) -or $addressType -cnotin @('LW','LB','PLW') -or ($addressType -ceq 'LB' -and $Arguments.format -cne 'bool') -or ($addressType -cne 'LB' -and $Arguments.format -ceq 'bool') -or ($addressType -ceq 'PLW' -and !$languageRegister) -or ($languageRegister -and $Arguments.format -cne 'int16') -or $Arguments.format -isnot [string] -or $Arguments.format -cnotin @('int16','bool','uint16','float32','int32','uint32') -or ($Arguments.format -cin @('float32','int32','uint32') -and $Arguments.address -gt 8998)){throw 'Single valid local user address or LW/PLW9134 language register required.'}
 foreach($field in @('expected_value','value')){
  if($Arguments.format -ceq 'bool'){if($Arguments.$field -isnot [bool]){throw 'Expected and requested JSON Boolean values required.'}}
  elseif($Arguments.format -ceq 'float32'){$null=ConvertTo-WeinviewFloat32 $Arguments.$field}
  elseif($Arguments.format -cin @('int32','uint32')){if(($Arguments.$field -isnot [int] -and $Arguments.$field -isnot [long]) -or ($Arguments.format -ceq 'int32' -and ($Arguments.$field -lt -2147483648 -or $Arguments.$field -gt 2147483647)) -or ($Arguments.format -ceq 'uint32' -and ($Arguments.$field -lt 0 -or $Arguments.$field -gt 4294967295))){throw 'Expected and requested JSON integers must fit the selected32-bit format.'}}
  elseif($Arguments.format -ceq 'uint16'){if(($Arguments.$field -isnot [int] -and $Arguments.$field -isnot [long]) -or $Arguments.$field -lt 0 -or $Arguments.$field -gt 65535){throw 'Expected and requested uint16 integers0..65535 required.'}}
  elseif(($Arguments.$field -isnot [int] -and $Arguments.$field -isnot [long]) -or $Arguments.$field -lt $(if($languageRegister){0}else{-32768}) -or $Arguments.$field -gt $(if($languageRegister){23}else{32767})){throw 'Expected and requested signed16 integer values required; language selection must be0..23.'}
 }
}
function Set-WeinviewNativeWriteEvidence($Evidence,[string]$Stage,$NativeEvidence) {
 if($Stage -cnotin @('selection','begin','editor_before','editor','commit')){throw 'Unreviewed native write evidence stage.'}
 $raw=ConvertTo-Json -InputObject $NativeEvidence -Depth 12 -Compress
 $algorithm=[Security.Cryptography.SHA256]::Create()
 try{$sha=[BitConverter]::ToString($algorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($raw))).Replace('-','')}finally{$algorithm.Dispose()}
 $Evidence[$Stage]=$NativeEvidence;$Evidence[$Stage+'_raw_json']=$raw;$Evidence[$Stage+'_raw_utf8_sha256']=$sha
}
function Get-WeinviewValuesProcessSession($Session,[string]$Folder,$RegisteredWatch) {
 # Only this call's newly registered Watch may occupy an exited historical launcher PID.
 # The receipt remains unchanged; GUI/COM are still checked by the original guards.
 if(!$RegisteredWatch){return $Session}
 $collision=@($Session.processes|Where-Object {[int]$_.pid -eq $RegisteredWatch.process.Id})
 if(!$collision.Count){return $Session}
 if($collision.Count -ne 1 -or ![object]::ReferenceEquals($RegisteredWatch,$script:weinviewValuesWatch) -or $collision[0].exe_path -ine (Join-Path $Session.runtime_path 'EasySimulator.exe')){throw 'Historical launcher PID exception requires this registered Watch only.'}
 $pinnedWatch='929F3DCA829A35B519927A99B0B9007C9469D86CC15B11E86DE5A1EA2BCB43F2'
 $exe=Get-WeinviewSimulationPath ([string]$RegisteredWatch.exe)
 $expectedPattern='^'+[regex]::Escape($Folder)+'\\values-[0-9a-f]{32}\\watch-runtime\\EasyWatch\.exe$'
 $registered=@($script:own|Where-Object {[int]$_.pid -eq $RegisteredWatch.process.Id -and [long]$_.creation_utc_ticks -eq [long]$RegisteredWatch.ticks -and $_.exe_path -ieq $exe -and $_.exe_sha256 -ceq $pinnedWatch})
 if($registered.Count -ne 1 -or $exe -inotmatch $expectedPattern -or [long]$RegisteredWatch.ticks -le [long]$collision[0].creation_utc_ticks -or (Get-WeinviewSimulationHash $exe) -cne $pinnedWatch){throw 'Registered Watch path/ticks/SHA do not prove a new launcher PID owner.'}
 $owner=$RegisteredWatch.process;$null=$owner.Handle;$owner.Refresh()
 if($owner.HasExited -or $owner.Path -ine $exe -or $owner.StartTime.ToUniversalTime().Ticks -ne [long]$RegisteredWatch.ticks -or !(Get-WeinviewWatchMain $RegisteredWatch)){throw 'Original registered Watch process and owned main must remain live.'}
 $copy=$Session.PSObject.Copy();$copy.processes=@($Session.processes|Where-Object {[int]$_.pid -ne $owner.Id})
 return $copy
}
function Get-WeinviewValuesSession([string]$Root,[string]$Id,$RegisteredWatch=$null) {
 $registry=Get-WeinviewSimulationPath (Join-Path $Root '.weinview-simulations')
 $folder=Get-WeinviewSimulationPath (Join-Path $registry $Id)
 $receipt=Get-WeinviewSimulationPath (Join-Path $folder 'session.json')
 $runtime=Get-WeinviewSimulationPath (Join-Path $folder 'runtime')
 $session=Read-WeinviewSimulationJson $receipt
 if($session.schema -ne 1 -or $session.kind -cne 'weinview-owned-offline-simulation' -or $session.session_id -cne $Id -or $session.workspace_root -ine $Root -or $session.runtime_path -ine $runtime -or $session.session_record -ine $receipt -or $session.state -cne 'running' -or $session.exob_sha256 -notmatch '^[0-9a-fA-F]{64}$'){throw 'Current public running owned simulation required; private receipts rejected.'}
 $source=Get-WeinviewSimulationPath ([string]$session.source_exob_path)
 $runtimeExob=Get-WeinviewSimulationPath ([string]$session.runtime_exob_path)
 if(!$source.StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($registry+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($source) -ine '.exob' -or $runtimeExob -ine (Join-Path $runtime 'PLC Engineering Suite-owned.exob') -or (Get-WeinviewSimulationHash $source) -ine $session.exob_sha256 -or !(Test-Path -LiteralPath $runtimeExob -PathType Leaf)){throw 'Current source EXOB SHA and owned runtime EXOB path required.'}
 $processSession=Get-WeinviewValuesProcessSession $session $folder $RegisteredWatch
 $live=@(Get-WeinviewSimulationProcesses $processSession $runtime)
 $gui=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'gui_e30.exe'})
 $com=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'com_e30.exe'})
 if($gui.Count -ne 1 -or $com.Count -ne 1 -or @($live|Where-Object {$_.Id -eq [int]$gui[0].pid}).Count -ne 1 -or @($live|Where-Object {$_.Id -eq [int]$com[0].pid}).Count -ne 1){throw 'Both original live GUI/COM owners required.'}
 foreach($record in @($gui[0],$com[0])){
  $current=Get-CimInstance Win32_Process -Filter ('ProcessId='+[int]$record.pid) -OperationTimeoutSec 3
  if(!$current -or $current.ExecutablePath -ine $record.exe_path -or $current.CommandLine -cne $record.command_line -or [int]$current.ParentProcessId -ne [int]$record.parent_pid -or !$current.CommandLine.Contains($runtime) -or !$current.CommandLine.Contains($runtimeExob)){throw 'Original simulator command/path/lineage changed.'}
  if([int]$record.pid -eq [int]$gui[0].pid -and $current.CommandLine -notmatch '(?i)(?:^|\s)-offline(?:\s|$)'){throw 'Only original offline GUI permitted.'}
 }
 return @{session=$session;receipt=$receipt;receipt_sha256=(Get-WeinviewSimulationHash $receipt);gui=$gui[0];com=$com[0];folder=$folder;source=$source;runtime_exob=$runtimeExob}
}
function Get-WeinviewValuesHmiPort($Context) {
 # Observe existing original-vendor IPC. Never create a socket or guess a port.
 $tcp=@(Get-NetTCPConnection -ErrorAction Stop)
 $outbound=@($tcp|Where-Object {[int]$_.OwningProcess -eq [int]$Context.gui.pid -and $_.State -eq 'Established' -and $_.LocalAddress -ceq '127.0.0.1' -and $_.RemoteAddress -ceq '127.0.0.1'})
 $candidates=@(foreach($edge in $outbound){
  $reverse=@($tcp|Where-Object {[int]$_.OwningProcess -eq [int]$Context.com.pid -and $_.State -eq 'Established' -and $_.LocalAddress -ceq '127.0.0.1' -and $_.RemoteAddress -ceq '127.0.0.1' -and $_.LocalPort -eq $edge.RemotePort -and $_.RemotePort -eq $edge.LocalPort})
  $listeners=@($tcp|Where-Object {$_.State -eq 'Listen' -and $_.LocalPort -eq $edge.RemotePort -and $_.LocalAddress -in @('0.0.0.0','127.0.0.1')})
  if($reverse.Count -eq 1 -and $listeners.Count -eq 1 -and [int]$listeners[0].OwningProcess -eq [int]$Context.com.pid){@{port=[int]$edge.RemotePort;gui_edge=@{pid=[int]$edge.OwningProcess;local_address=$edge.LocalAddress;local_port=[int]$edge.LocalPort;remote_address=$edge.RemoteAddress;remote_port=[int]$edge.RemotePort};com_edge=@{pid=[int]$reverse[0].OwningProcess;local_address=$reverse[0].LocalAddress;local_port=[int]$reverse[0].LocalPort;remote_address=$reverse[0].RemoteAddress;remote_port=[int]$reverse[0].RemotePort};listener=@{pid=[int]$listeners[0].OwningProcess;local_address=$listeners[0].LocalAddress;local_port=[int]$listeners[0].LocalPort}}}
 })
 if($candidates.Count -ne 1 -or $candidates[0].port -lt 1 -or $candidates[0].port -gt 65535){throw 'Unique original GUI-to-COM localhost established/listen HMI endpoint required.'}
 if(@($tcp|Where-Object {$_.State -eq 'Listen' -and $_.LocalPort -eq $candidates[0].port -and [int]$_.OwningProcess -ne [int]$Context.com.pid}).Count){throw 'HMI port has a foreign listener; preserve all processes.'}
 return $candidates[0]
}
function Get-WeinviewWatchMain($Watch) {
 $windows=@($Watch.native.EnumTopWindows())
 if(@($windows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $null}
 $main=@($windows|Where-Object {$_.Visible -and $_.Enabled -and $_.Title -like '* - EasyWatch'})
 if($main.Count -ne 1){return $null};return $main[0]
}
function Get-WeinviewWatchDialog($Watch,[string]$Title) {
 return (WaitFor { $matches=@($Watch.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Title -ceq $Title});if($matches.Count -gt 1){throw 'Ambiguous owned EasyWatch dialog.'};if($matches.Count -eq 1){return $matches[0]} } 6)
}
function Get-WeinviewWatchGrid($Watch,$Main) {
 $matches=@($Watch.native.EnumChildControls($Main.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -like 'BCGPGridCtrl:*'})
 if($matches.Count -ne 1){throw 'Unique actual owned EasyWatch grid required.'};return $matches[0]
}

function New-WeinviewReadonlyWatchFile([string]$Path,[object[]]$Requests,[int]$Port) {
 return (New-WeinviewLocalWatchFile $Path $Requests $Port $false)
}
function New-WeinviewLocalWatchFile([string]$Path,[object[]]$Requests,[int]$Port,[bool]$Writable) {
 $path=Get-WeinviewSimulationPath $Path
 if([IO.Path]::GetExtension($path) -cne '.ewt' -or (Test-Path -LiteralPath $path)){throw 'Fresh private local EWT configuration required.'}
 [int[]]$addresses=@($Requests|ForEach-Object {[int]$_.address})
 [string[]]$formats=@($Requests|ForEach-Object {[string]$_.format})
 [byte[]]$bytes=if($Writable){[PLC Engineering Suite.Weinview.EasyWatchValuesControls]::WritableConfiguration($Port,$addresses,$formats)}else{[PLC Engineering Suite.Weinview.EasyWatchValuesControls]::ReadonlyConfiguration($Port,$addresses,$formats)}
 $stream=[IO.File]::Open($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$stream.Write($bytes,0,$bytes.Length)}finally{$stream.Dispose()}
 $settings=@(foreach($request in $Requests){
  $type=if($request.format -ceq 'bool'){'LB'}else{'LW'}
  @{address=[int]$request.address;format=[string]$request.format;name=($(if($Writable){'PLC Engineering Suite_Writable_'}else{'PLC Engineering Suite_Readonly_'})+$type+$request.address);read_only=(!$Writable);local_hmi=$true;hmi_port=$Port;device='HMI';type=$type;numeric_format=(Get-WeinviewNumericFormatLabel $request.format);poll='500 ms'}
 })
 return @{kind=$(if($Writable){'weinview-local-writable-ewt-v1'}else{'weinview-local-readonly-ewt-v1'});path=$path;sha256=(Get-WeinviewSimulationHash $path);bytes=$bytes.Length;route='original-cli-ewt-document';port=$Port;settings=$settings;configuration_created_before_launch=$true;per_monitor_dialogs=0}
}
function Assert-WeinviewReadonlyWatchFile($Configuration) {
 Assert-WeinviewLocalWatchFile $Configuration
}
function Assert-WeinviewLocalWatchFile($Configuration) {
 if(!$Configuration -or !(Test-Path -LiteralPath $Configuration.path -PathType Leaf) -or (Get-Item -LiteralPath $Configuration.path).Length -ne $Configuration.bytes -or (Get-WeinviewSimulationHash $Configuration.path) -cne $Configuration.sha256){throw 'Private local EWT changed during original value operation.'}
}
function Get-WeinviewWatchSample($Watch,$Main,[int]$Count) {
 $grid=Get-WeinviewWatchGrid $Watch $Main
 $observed=@($Watch.controls.ReadRows($grid.Hwnd,$Count))
 $rows=@(foreach($row in $observed){[ordered]@{name=[string]$row.Name;raw_value=[string]$row.Value;cells=@($row.Cells);role=[int]$row.Role;state=[int]$row.State}})
 $raw=ConvertTo-Json -InputObject $rows -Depth 6 -Compress
 $algorithm=[Security.Cryptography.SHA256]::Create()
 try{$sha=[BitConverter]::ToString($algorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($raw))).Replace('-','')}finally{$algorithm.Dispose()}
 $observedUtc=[DateTime]::UtcNow
 return @{observed_utc=$observedUtc.ToString('o');observed_utc_ticks=$observedUtc.Ticks;rows=$rows;raw_json=$raw;raw_utf8_sha256=$sha}
}
function Get-WeinviewWatchItems($Sample,[object[]]$Requests,[int]$Port,[bool]$Writable=$false) {
 if(@($Sample.rows).Count -ne $Requests.Count){throw 'Actual monitor count differs.'}
 return @(foreach($request in $Requests){
  if($request.format -cnotin @('int16','bool','uint16','float32','int32','uint32') -or ($request.format -ceq 'bool' -and ($request.address -lt 0 -or ($request.address -gt 8999 -and ($Writable -or $request.address -ne 9043))))){throw 'Unreviewed monitor format/address/mode.'}
  $addressType=if($request.format -ceq 'bool'){'LB'}else{'LW'}
  $numericFormat=Get-WeinviewNumericFormatLabel $request.format
  $name=if($Writable){'PLC Engineering Suite_Writable_'+$addressType+$request.address}else{'PLC Engineering Suite_Readonly_'+$addressType+$request.address}
  $row=@($Sample.rows|Where-Object {$_.cells[0] -ceq $name})
  if($row.Count -ne 1){throw 'Exact requested monitor absent or ambiguous.'}
  $cells=@($row[0].cells)
  $notReady=if($request.format -ceq 'bool'){'Native connected local LB bool fields not ready.'}else{'Native connected local LW signed16 fields not ready.'}
  if($cells.Count -ne 7 -or $cells[1] -cne 'Connected' -or $cells[2] -cne ('Local Host ( '+$Port+' )  : HMI') -or $cells[3] -cne ($addressType+' : '+$request.address) -or $cells[4] -cne $numericFormat -or $cells[5] -cne '500 ms'){throw $notReady}
  if($request.format -ceq 'bool'){
   if($cells[6] -ceq 'True'){$value=$true}elseif($cells[6] -ceq 'False'){$value=$false}else{throw $notReady}
  }elseif($request.format -ceq 'uint16'){
   if($cells[6] -cnotmatch '^(0|[1-9][0-9]{0,4})$'){throw $notReady}
   $value=[int]::Parse($cells[6],[Globalization.CultureInfo]::InvariantCulture)
   if($value -gt 65535){throw 'Actual unsigned16 value exceeds bounds.'}
  }elseif($request.format -cin @('int32','uint32')){
   $pattern=if($request.format -ceq 'int32'){'^-?(0|[1-9][0-9]{0,9})$'}else{'^(0|[1-9][0-9]{0,9})$'}
   if($cells[6] -cnotmatch $pattern){throw $notReady}
   $parsed=[long]::Parse($cells[6],[Globalization.CultureInfo]::InvariantCulture)
   if(($request.format -ceq 'int32' -and ($parsed -lt -2147483648 -or $parsed -gt 2147483647)) -or ($request.format -ceq 'uint32' -and $parsed -gt 4294967295)){throw 'Actual32-bit integer exceeds selected format bounds.'}
   $value=if($request.format -ceq 'int32'){[int]$parsed}else{[long]$parsed}
  }elseif($request.format -ceq 'float32'){
   if($cells[6].Length -gt 64 -or $cells[6] -cnotmatch '^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$'){throw $notReady}
   $value=ConvertTo-WeinviewFloat32 ([double]::Parse($cells[6],[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture))
  }else{
   if($cells[6] -cnotmatch '^-?(0|[1-9][0-9]{0,4})$'){throw $notReady}
   $value=[int]::Parse($cells[6],[Globalization.CultureInfo]::InvariantCulture)
   if($value -lt -32768 -or $value -gt 32767){throw 'Actual signed16 value exceeds bounds.'}
  }
  $item=@{address=[int]$request.address;format=[string]$request.format;value=$value;status='Connected';raw_cells=$cells}
  if($request.format -cin @('uint16','float32','int32','uint32')){$item.native_text=$cells[6];$item.binary_precision_verified=$false}
  $item
 })
}
function Stop-WeinviewOwnedWatchMonitors($Watch,$Main,[object[]]$Settings,$Evidence) {
 if($Settings.Count -lt 1 -or $Settings.Count -gt 8){throw 'Complete created Watch monitor settings required for normal stop.'}
 $Evidence.phase='stopping_owned_monitors'
 $Watch.controls.Restore($Main.Hwnd)
 $before=Get-WeinviewWatchSample $Watch $Main $Settings.Count
 $Evidence.stop_before=$before;$Evidence.stop_commands=@();$Evidence.stop_verified=$false
 foreach($setting in $Settings){
  if($setting.format -cnotin @('int16','bool','uint16','float32','int32','uint32') -or ($setting.format -ceq 'bool' -and ($setting.address -lt 0 -or ($setting.address -gt 8999 -and ($setting.read_only -ne $true -or $setting.address -ne 9043))))){throw 'Complete exact supported monitor format/address/mode required before Stop.'}
  $addressType=if($setting.format -ceq 'bool'){'LB'}else{'LW'}
  $numericFormat=Get-WeinviewNumericFormatLabel $setting.format
  $exactMode=(($setting.read_only -eq $true -and $setting.name -ceq ('PLC Engineering Suite_Readonly_'+$addressType+$setting.address)) -or ($setting.read_only -eq $false -and $setting.name -ceq ('PLC Engineering Suite_Writable_'+$addressType+$setting.address)))
  $rows=@($before.rows|Where-Object {$_.cells[0] -ceq $setting.name})
  if($rows.Count -ne 1 -or @($rows[0].cells).Count -ne 7 -or $rows[0].cells[2] -cne ('Local Host ( '+$setting.hmi_port+' )  : HMI') -or $rows[0].cells[3] -cne ($addressType+' : '+$setting.address) -or $rows[0].cells[4] -cne $numericFormat -or $rows[0].cells[5] -cne '500 ms' -or !$exactMode -or !$setting.local_hmi){throw 'Actual exact created local monitor/mode required before Stop.'}
  $grid=Get-WeinviewWatchGrid $Watch $Main
  $selection=$Watch.controls.SelectNameCell($grid.Hwnd,$Settings.Count,$setting.name)
  Start-Sleep -Milliseconds 150
  $Watch.controls.Command($Main.Hwnd,0x805A)
  $Evidence.stop_commands+=@(@{name=$setting.name;address=[int]$setting.address;command=32858;selection=$selection;observed_utc=[DateTime]::UtcNow.ToString('o')})
  Start-Sleep -Milliseconds 150
 }
 $deadline=[DateTime]::UtcNow.AddSeconds(6)
 do{
  $after=Get-WeinviewWatchSample $Watch $Main $Settings.Count;$Evidence.stop_after=$after
  $stopped=$true
  foreach($setting in $Settings){$rows=@($after.rows|Where-Object {$_.cells[0] -ceq $setting.name});if($rows.Count -ne 1 -or $rows[0].cells[1] -cne 'Stop'){$stopped=$false;break}}
  if($stopped){$Evidence.stop_verified=$true;$Evidence.phase='owned_monitors_stopped';return}
  Start-Sleep -Milliseconds 150
 }while([DateTime]::UtcNow -lt $deadline)
 throw 'Exact owned Watch monitors did not read back Stop; no close requested.'
}
function Close-WeinviewOwnedWatch($Watch,[object[]]$Settings) {
 $evidence=@{phase='normal_close_preflight';stop_verified=$false;stop_before=$null;stop_after=$null;stop_commands=@();close_prompt=$null;close_requested=$false;discard_acknowledged=$false;normal_exit_verified=$false}
 $Watch.close_evidence=$evidence
 if($Watch.process.HasExited){throw 'Watch exited before normal close observation.'}
 $main=Get-WeinviewWatchMain $Watch
 if(!$main){throw 'Exact owned Watch main required for normal close.'}
 $closeMessage='是否保存对 无标题 的更改?'
 if($Watch.configuration){
  Assert-WeinviewLocalWatchFile $Watch.configuration
  $stem=if($Watch.configuration.kind -ceq 'weinview-local-writable-ewt-v1'){'PLC Engineering SuiteWritable'}elseif($Watch.configuration.kind -ceq 'weinview-local-readonly-ewt-v1'){'PLC Engineering SuiteReadonly'}else{throw 'Bound private local EWT required before normal close.'}
  if($Watch.configuration.path -ine (Join-Path ([IO.Path]::GetDirectoryName($Watch.exe)) ($stem+'.ewt'))){throw 'Private file-loaded Watch document path differs.'}
  $closeMessage='是否保存对 '+$stem+' 的更改?'
 }
 Stop-WeinviewOwnedWatchMonitors $Watch $main $Settings $evidence
 $Watch.controls.Close($main.Hwnd)
 $evidence.close_requested=$true;$evidence.phase='normal_close_requested'
 # Exact Chinese-locale vendor prompt observed on the pinned 421 executable.
 # Only this newly created private untitled configuration can be discarded.
 $prompt=$null;$acknowledged=$false
 $deadline=[DateTime]::UtcNow.AddSeconds(6)
 do{
  if($Watch.process.WaitForExit(0)){break}
  try{$dialogs=@($Watch.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770'})}catch{if($Watch.process.WaitForExit(0)){break};throw}
  if($dialogs.Count){
   if($dialogs.Count -ne 1 -or $dialogs[0].Title -cne 'EasyWatch'){throw 'Unreviewed owned Watch close modal retained.'}
   if($acknowledged){if($dialogs[0].Hwnd -ne $prompt.hwnd){throw 'Owned Watch close modal changed after discard; preserve.'};Start-Sleep -Milliseconds 150;continue}
   $dialog=$dialogs[0];$children=@($Watch.native.EnumChildControls($dialog.Hwnd))
   $buttons=@($children|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Button'})
   if($buttons.Count -ne 3 -or @($buttons|Where-Object {$_.Id -notin @(6,7,2)}).Count){throw 'Actual Watch save-prompt button contract differs.'}
   $null=$Watch.native.FindUniqueControl($dialog.Hwnd,6,'Button','是(&Y)')
   $null=$Watch.native.FindUniqueControl($dialog.Hwnd,7,'Button','否(&N)')
   $null=$Watch.native.FindUniqueControl($dialog.Hwnd,2,'Button','取消')
   $null=$Watch.native.FindUniqueControl($dialog.Hwnd,65535,'Static',$closeMessage)
   $prompt=@{title=$dialog.Title;hwnd=$dialog.Hwnd;message=$closeMessage;discard_button_id=7;discard_button_label='否(&N)';buttons=@($buttons|ForEach-Object {@{id=$_.Id;label=$_.Title;hwnd=$_.Hwnd}});observed_utc=[DateTime]::UtcNow.ToString('o')}
   $evidence.close_prompt=$prompt;$evidence.phase='actual_save_prompt_verified'
   $Watch.native.ClickButton($dialog.Hwnd,7,'否(&N)');$acknowledged=$true
   $evidence.discard_acknowledged=$true;$evidence.phase='actual_private_config_discard_acknowledged'
  }
  Start-Sleep -Milliseconds 150
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$Watch.process.WaitForExit(0) -or $Watch.process.ExitCode -ne 0){throw 'Owned Watch normal exit0 not verified; identity retained.'}
 $evidence.normal_exit_verified=$true;$evidence.phase='original_watch_exit0_observed'
 return @{normal_close_verified=$true;normal_exit_verified=$true;normal_close_complete=$true;close_prompt=$prompt;close_evidence=$evidence;saved_ewt=$false;live_watch_pids=@();no_forced_termination=$true;owned_exit_codes=@(@{pid=$Watch.process.Id;creation_utc_ticks=$Watch.ticks;exe=$Watch.exe;exit_code=[int]$Watch.process.ExitCode;exit_code_verified=$true})}
}
function Invoke-WeinviewSimulationValues($Arguments,$Installation,[bool]$Write=$false) {
 if($Write){Assert-WeinviewValueWriteArguments $Arguments}else{Assert-WeinviewValuesArguments $Arguments}
 $requests=if($Write){@([pscustomobject]@{address=[int]$Arguments.address;format=[string]$Arguments.format})}else{@($Arguments.addresses)}
 if($Write){$expectedValue=if($Arguments.format -ceq 'bool'){[bool]$Arguments.expected_value}elseif($Arguments.format -ceq 'float32'){ConvertTo-WeinviewFloat32 $Arguments.expected_value}elseif($Arguments.format -ceq 'uint32'){[long]$Arguments.expected_value}else{[int]$Arguments.expected_value};$requestedValue=if($Arguments.format -ceq 'bool'){[bool]$Arguments.value}elseif($Arguments.format -ceq 'float32'){ConvertTo-WeinviewFloat32 $Arguments.value}elseif($Arguments.format -ceq 'uint32'){[long]$Arguments.value}else{[int]$Arguments.value}}
 $writeEvidence=[ordered]@{before_samples=@();selection=$null;begin=$null;editor_before=$null;editor=$null;commit=$null;after_samples=@()}
 $writeAttempted=$false;$writePerformed=$false
 $root=Workspace ([string]$Arguments.workspace_root)
 if(!$Installation.profile_421 -or $Installation.signature_status -ne 'Valid'){throw 'Signed pinned421 installation required.'}
 $watch=$null;$journal=$null;$folder=$null;$record=$null;$locked=$false
 $script:weinviewValuesFailureCleanup=$null
 $script:weinviewValueWriteFailure=$null
 $mutex=New-Object Threading.Mutex($false,'Local\PLC Engineering Suite.Weinview.OfflineSimulation.421')
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true}
  if(!$locked){throw 'weinview_simulation_busy: Another lifecycle/value operation is active.'}
  $kindReceipt=Get-WeinviewSimulationPath (Join-Path (Join-Path (Join-Path $root '.weinview-simulations') ([string]$Arguments.session_id)) 'session.json')
  $kindSession=Read-WeinviewSimulationJson $kindReceipt
  if($kindSession.kind -ceq 'weinview-owned-cmt-offline-simulation'){
   if($Write){return (Invoke-WeinviewCmtObjectValueWrite $Arguments $Installation $root)}
   return (Invoke-WeinviewCmtObjectValues $Arguments $Installation $root)
  }
 if($Write -and $Arguments.PSObject.Properties.Name -ccontains 'window_number'){throw 'window_number/window_name are supported only by live offline cMT Object writes.'}
 if(($Write -and [long]$Arguments.address -eq 9134) -or (!$Write -and @($Arguments.addresses|Where-Object {(Get-WeinviewValueAddressType $_) -ceq 'PLW'}).Count)){throw 'Language registers require live offline cMT Object values; EasyWatch user-area route rejected before launch.'}
  $context=Get-WeinviewValuesSession $root ([string]$Arguments.session_id)
  $endpoint=Get-WeinviewValuesHmiPort $context
  $existing=@(Get-Process -Name EasyWatch -ErrorAction SilentlyContinue)
  if($existing.Count -gt 32){throw 'weinview_values_busy: EasyWatch enumeration bound exceeded.'}
  if($existing.Count){throw 'weinview_values_busy: Existing EasyWatch preserved; no attach.'}
  Add-Type -AssemblyName Accessibility
  $nativeSources=@((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'EasyWatchValuesControls.cs'))
  if($Write -and $Arguments.format -cin @('bool','uint16','float32','int32','uint32')){$nativeSources+=@(Join-Path $PSScriptRoot 'EasyWatchValueCellProbe.cs')}
  Add-Type -Path $nativeSources -ReferencedAssemblies 'System.dll','Accessibility.dll'
  $folder=Get-WeinviewSimulationPath (Join-Path $context.folder ('values-'+[Guid]::NewGuid().ToString('N')))
  [void][IO.Directory]::CreateDirectory($folder)
  $runtime=Get-WeinviewSimulationPath (Join-Path $folder 'watch-runtime');[void][IO.Directory]::CreateDirectory($runtime)
  $journal=Join-Path $folder 'operation.json'
  $pinned=@{ 'EasyWatch.exe'='929F3DCA829A35B519927A99B0B9007C9469D86CC15B11E86DE5A1EA2BCB43F2';'BCGCBPRO2520u110.dll'='A6B535F2B93B2A4BDC7BA2D361F599F4EA1D067DE01212F5F534065834E7EAE3';'EasyWidgetu110.dll'='4DE4170269040BA822D5F3B61F68F5E2F42CCB98C5238291AB67123CE7B9222C'}
  $installed=[IO.Path]::GetDirectoryName((Get-WeinviewSimulationPath ([string]$Installation.exe_path)))
  $copies=@(foreach($name in @('EasyWatch.exe','BCGCBPRO2520u110.dll','EasyWidgetu110.dll')){
   $source=Get-WeinviewSimulationPath (Join-Path $installed $name);$target=Get-WeinviewSimulationPath (Join-Path $runtime $name)
   if((Get-WeinviewSimulationHash $source) -cne $pinned[$name]){throw 'Pinned original Watch dependency changed.'}
   [IO.File]::Copy($source,$target,$false)
   if((Get-WeinviewSimulationHash $target) -cne $pinned[$name] -or (Get-WeinviewSimulationHash $source) -cne $pinned[$name]){throw 'Original Watch copy/source SHA mismatch.'}
   @{source_path=$source;path=$target;sha256=$pinned[$name];bytes=(Get-Item -LiteralPath $target).Length}
  })
  $record=[ordered]@{kind=if($Write){'weinview-owned-writable-easywatch'}else{'weinview-owned-readonly-easywatch'};schema=1;session_id=$Arguments.session_id;workspace_root=$root;session_record=$context.receipt;session_record_sha256=$context.receipt_sha256;state='preparing';created_utc=[DateTime]::UtcNow.ToString('o');updated_utc=[DateTime]::UtcNow.ToString('o');runtime_path=$runtime;dependencies=$copies;hmi_endpoint=$endpoint;processes=@();monitor_settings=@();samples=@();last_error=$null;no_forced_termination=$true}
  if($Write){$record.expected_value=$expectedValue;$record.requested_value=$requestedValue;$record.native_write_evidence=$writeEvidence;$record.write_attempted=$false;$record.write_performed=$false;$record.atomic_compare_exchange=$false}
  Write-WeinviewSimulationJson $journal $record
  $configuration=New-WeinviewLocalWatchFile (Join-Path $runtime $(if($Write){'PLC Engineering SuiteWritable.ewt'}else{'PLC Engineering SuiteReadonly.ewt'})) $requests ([int]$endpoint.port) $Write
   $settings=@($configuration.settings);$record.monitor_settings=$settings
   $record.configuration=$configuration;Write-WeinviewSimulationJson $journal $record
  if(@(Get-Process -Name EasyWatch -ErrorAction SilentlyContinue).Count){throw 'weinview_values_busy: EasyWatch appeared before launch; preserve.'}
  $exe=Join-Path $runtime 'EasyWatch.exe'
  Assert-WeinviewLocalWatchFile $configuration
  $process=Start-Process -FilePath $exe -WorkingDirectory $runtime -ArgumentList ('"'+$configuration.path+'"') -WindowStyle Hidden -PassThru
  # Journal PID immediately, then pin original handle/ticks/path before native IO.
  $identity=@{pid=$process.Id;creation_utc_ticks=$null;exe_path=$exe;exe_sha256=$pinned['EasyWatch.exe']}
  $record.processes=@($identity);$script:own+=@($identity);Write-WeinviewSimulationJson $journal $record
  $null=$process.Handle;$ticks=$process.StartTime.ToUniversalTime().Ticks;$identity.creation_utc_ticks=$ticks
  if($process.Path -ine $exe){throw 'New Watch process path mismatch.'}
  $watch=@{process=$process;ticks=$ticks;exe=$exe;configuration=$configuration;native=(New-Object PLC Engineering Suite.Weinview.NativeControls($process.Id,$ticks,$exe,1000));controls=(New-Object PLC Engineering Suite.Weinview.EasyWatchValuesControls($process.Id,$ticks,$exe))}
  if($Write -and $Arguments.format -cin @('bool','uint16','float32','int32','uint32')){$watch.bool_controls=New-Object PLC Engineering Suite.Weinview.EasyWatchValueCellProbe($process.Id,$ticks,$exe)}
  $script:weinviewValuesWatch=$watch
   $nativeProcess=Get-CimInstance Win32_Process -Filter ('ProcessId='+$process.Id) -ErrorAction Stop
   $expectedCommand=('"'+$exe+'" "'+$configuration.path+'"')
   if($nativeProcess.ExecutablePath -ine $exe -or !$nativeProcess.CommandLine -or $nativeProcess.CommandLine.TrimEnd([char[]]@(32)) -cnotin @($expectedCommand,($exe+' "'+$configuration.path+'"'))){throw 'Actual original Watch local document command differs.'}
   $identity.command_line=$nativeProcess.CommandLine;$identity.configuration_path=$configuration.path;$identity.configuration_sha256=$configuration.sha256
  Write-WeinviewSimulationJson $journal $record
  if(!$process.WaitForInputIdle(10000)){throw 'Owned Watch input idle unavailable.'}
  $script:stage=if($Write){'easywatch_writable_monitor'}else{'easywatch_readonly_monitors'}
   $settings=@($configuration.settings);$record.monitor_settings=$settings
   $loadedMain=WaitFor {Get-WeinviewWatchMain $watch} 6
   $loadedSample=Get-WeinviewWatchSample $watch $loadedMain $settings.Count
   for($i=0;$i -lt $settings.Count;$i++){
    $cells=$loadedSample.rows[$i].cells;$setting=$settings[$i]
    if($cells[0] -cne $setting.name -or $cells[2] -cne ('Local Host ( '+$endpoint.port+' )  : HMI') -or $cells[3] -cne ($setting.type+' : '+$setting.address) -or $cells[4] -cne $setting.numeric_format -or $cells[5] -cne '500 ms'){throw 'Original file-loaded local monitor fields differ.'}
   }
   Assert-WeinviewLocalWatchFile $configuration
   $record.configuration_loaded_sample=$loadedSample;Write-WeinviewSimulationJson $journal $record
  $main=WaitFor {Get-WeinviewWatchMain $watch} 6;$watch.controls.Restore($main.Hwnd);Start-Sleep -Milliseconds 150
  $grid=Get-WeinviewWatchGrid $watch $main
  foreach($setting in $settings){$null=$watch.controls.SelectNameCell($grid.Hwnd,$settings.Count,$setting.name);Start-Sleep -Milliseconds 150;$watch.controls.Command($main.Hwnd,0x8059);Start-Sleep -Milliseconds 150}
  $script:stage='easywatch_connected_raw_values';$deadline=[DateTime]::UtcNow.AddSeconds(12);$previous=$null;$samples=@();$items=@()
  do{
   $sample=Get-WeinviewWatchSample $watch $main $settings.Count
   $ready=$false
   try{$items=@(Get-WeinviewWatchItems $sample $requests ([int]$endpoint.port) $Write);$ready=$true}catch{if(!$_.Exception.Message.StartsWith('Native connected local LW signed16 fields not ready.') -and !$_.Exception.Message.StartsWith('Native connected local LB bool fields not ready.')){throw}}
   if($ready -and $previous -and ([long]$sample.observed_utc_ticks - [long]$previous.observed_utc_ticks) -ge 5000000){$samples=@($previous,$sample);break}
   $previous=if($ready){$sample}else{$null};Start-Sleep -Milliseconds 500
  }while([DateTime]::UtcNow -lt $deadline)
  if($samples.Count -ne 2){throw 'Native values never produced two connected observations at least500ms apart.'}
  $beforeSamples=@()
  if($Write){
   $beforeSamples=$samples;$writeEvidence.before_samples=$beforeSamples;$record.before_samples=$beforeSamples;Write-WeinviewSimulationJson $journal $record
   foreach($beforeSample in $beforeSamples){$beforeItems=@(Get-WeinviewWatchItems $beforeSample $requests ([int]$endpoint.port) $true);if($beforeItems[0].value -ne $expectedValue){throw 'weinview_value_expected_mismatch: Both actual before observations must equal expected; no write performed.'}}
   $beforeContext=Get-WeinviewValuesSession $root ([string]$Arguments.session_id);$beforeEndpoint=Get-WeinviewValuesHmiPort $beforeContext
   if($beforeContext.receipt_sha256 -cne $context.receipt_sha256 -or $beforeEndpoint.port -ne $endpoint.port){throw 'Original simulation receipt/endpoint changed before native write.'}
   $script:stage='easywatch_native_value_edit'
   $grid=Get-WeinviewWatchGrid $watch $main;$name=$settings[0].name;$address=[int]$Arguments.address;$port=[int]$endpoint.port;$expected=$expectedValue;$requested=$requestedValue
   $newNumeric=($Arguments.format -cin @('uint16','float32','int32','uint32'));$writerControls=if($Arguments.format -cin @('bool','uint16','float32','int32','uint32')){$watch.bool_controls}else{$watch.controls}
   if($newNumeric){$expectedText=[string]$beforeItems[0].native_text}
   $requestedText=if($Arguments.format -ceq 'bool'){if($requested){'True'}else{'False'}}elseif($Arguments.format -ceq 'float32'){([single]$requested).ToString('R',[Globalization.CultureInfo]::InvariantCulture)}else{$requested.ToString([Globalization.CultureInfo]::InvariantCulture)}
   $nativeEvidence=if($newNumeric){$writerControls.SelectWritableValueCell($grid.Hwnd,$name,$address,$port,$Arguments.format,$expectedText,[double]$expected)}else{$writerControls.SelectWritableValueCell($grid.Hwnd,$name,$address,$port,$expected)};Set-WeinviewNativeWriteEvidence $writeEvidence 'selection' $nativeEvidence;Write-WeinviewSimulationJson $journal $record
   Start-Sleep -Milliseconds 150
   $nativeEvidence=if($newNumeric){$writerControls.BeginWritableValueEdit($grid.Hwnd,$name,$address,$port,$Arguments.format,$expectedText,[double]$expected)}else{$writerControls.BeginWritableValueEdit($grid.Hwnd,$name,$address,$port,$expected)};Set-WeinviewNativeWriteEvidence $writeEvidence 'begin' $nativeEvidence;Write-WeinviewSimulationJson $journal $record
   $editor=WaitFor {$edits=@($watch.native.EnumChildControls($grid.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit' -and $_.Id -eq 1});if($edits.Count -gt 1){throw 'Ambiguous actual writable Value editor.'};if($edits.Count -eq 1){return $edits[0]}} 4
   # Verify exact direct parent, actual geometry/focus and current text before any text input.
   $nativeEvidence=if($newNumeric){$writerControls.ValidateWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$Arguments.format,$expectedText,[double]$expected,$expectedText,[double]$expected)}else{$writerControls.ValidateWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$expected,$expected)};Set-WeinviewNativeWriteEvidence $writeEvidence 'editor_before' $nativeEvidence;Write-WeinviewSimulationJson $journal $record
   $watch.native.SetControlText($editor.Hwnd,$requestedText)
   if($watch.native.GetControlText($editor.Hwnd,$(if($newNumeric){64}else{16})) -cne $requestedText){throw 'Actual writable Value editor WM_GETTEXT readback differs.'}
   $nativeEvidence=if($newNumeric){$writerControls.ValidateWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$Arguments.format,$expectedText,[double]$expected,$requestedText,[double]$requested)}else{$writerControls.ValidateWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$expected,$requested)};Set-WeinviewNativeWriteEvidence $writeEvidence 'editor' $nativeEvidence;Write-WeinviewSimulationJson $journal $record
   $commitContext=Get-WeinviewValuesSession $root ([string]$Arguments.session_id);$commitEndpoint=Get-WeinviewValuesHmiPort $commitContext
   if($commitContext.receipt_sha256 -cne $context.receipt_sha256 -or $commitEndpoint.port -ne $endpoint.port){throw 'Original simulation receipt/endpoint changed before native commit.'}
   $writeAttempted=$true;$writePerformed=$null;$record.write_attempted=$true;$record.write_performed=$null;$record.state='native_commit_pending';Write-WeinviewSimulationJson $journal $record
   $nativeEvidence=if($newNumeric){$writerControls.CommitWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$Arguments.format,$expectedText,[double]$expected,$requestedText,[double]$requested)}else{$writerControls.CommitWritableValueEditor($grid.Hwnd,$editor.Hwnd,$name,$address,$port,$expected,$requested)};Set-WeinviewNativeWriteEvidence $writeEvidence 'commit' $nativeEvidence
   if(!$writeEvidence.commit.commit_posted){throw 'Native Value editor did not verify Enter commit posting.'}
   $writePerformed=$true;$record.write_performed=$true;$record.state='native_commit_posted';Write-WeinviewSimulationJson $journal $record
   $script:stage='easywatch_native_write_after_values';$deadline=[DateTime]::UtcNow.AddSeconds(12);$previous=$null;$samples=@()
   do{
    $sample=Get-WeinviewWatchSample $watch $main 1;$ready=$false
    try{$actual=@(Get-WeinviewWatchItems $sample $requests $port $true);$ready=($actual[0].value -eq $requested)}catch{if(!$_.Exception.Message.StartsWith('Native connected local LW signed16 fields not ready.') -and !$_.Exception.Message.StartsWith('Native connected local LB bool fields not ready.')){throw}}
    if($ready -and $previous -and ([long]$sample.observed_utc_ticks - [long]$previous.observed_utc_ticks) -ge 5000000){$samples=@($previous,$sample);break}
    $previous=if($ready){$sample}else{$null};Start-Sleep -Milliseconds 500
   }while([DateTime]::UtcNow -lt $deadline)
   if($samples.Count -ne 2){throw 'Native write did not read requested value in two connected observations at least500ms apart.'}
   $writeEvidence.after_samples=$samples;$record.native_write_verified=$true
  }
  $firstItems=@(Get-WeinviewWatchItems $samples[0] $requests ([int]$endpoint.port) $Write)
  $items=@(Get-WeinviewWatchItems $samples[1] $requests ([int]$endpoint.port) $Write)
  for($i=0;$i -lt $items.Count;$i++){
   $items[$i].observed_values=@($firstItems[$i].value,$items[$i].value)
   $items[$i].stable=($firstItems[$i].value -eq $items[$i].value)
   if($items[$i].format -cin @('uint16','float32','int32','uint32')){$items[$i].native_observed_texts=@($firstItems[$i].native_text,$items[$i].native_text)}
  }
  $valuesStable=(@($items|Where-Object {!$_.stable}).Count -eq 0)
  $record.samples=$samples;$record.items=$items;$record.values_stable=$valuesStable;$record.state='values_observed';Write-WeinviewSimulationJson $journal $record
  $after=Get-WeinviewValuesSession $root ([string]$Arguments.session_id) $watch;$afterEndpoint=Get-WeinviewValuesHmiPort $after
  if($after.receipt_sha256 -cne $context.receipt_sha256 -or $afterEndpoint.port -ne $endpoint.port){throw 'Original simulation receipt/endpoint changed during value read.'}
  $watchOwners=@(Get-Process -Name EasyWatch -ErrorAction SilentlyContinue)
  if($watchOwners.Count -ne 1 -or $watchOwners[0].Id -ne $watch.process.Id){throw 'Foreign Watch appeared during read; all foreign owners preserved.'}
  if(!$Write){Assert-WeinviewReadonlyWatchFile $configuration}
  $script:stage='easywatch_normal_close';$cleanup=Close-WeinviewOwnedWatch $watch $settings
  $record.state='closed';$record.cleanup=$cleanup;$record.close_evidence=$watch.close_evidence;$record.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $journal $record
  $simProcesses=@($context.session.processes|ForEach-Object {@{pid=[int]$_.pid;ticks=[long]$_.creation_utc_ticks;exe=[string]$_.exe_path;exe_sha256=[string]$_.exe_sha256;command_line=[string]$_.command_line;parent_pid=[int]$_.parent_pid}})
  $result=@{action='read';workspace_root=$root;session_id=$Arguments.session_id;session_record=$context.receipt;session_record_sha256=$context.receipt_sha256;state='running';mode='offline';source_exob_path=$context.source;runtime_exob_path=$context.runtime_exob;exob_sha256=$context.session.exob_sha256;source_sha256=$context.session.exob_sha256;runtime_exob_sha256=$null;hmi_port=[int]$endpoint.port;hmi_endpoint=$endpoint;processes=$simProcesses;watch_processes=@($identity);own_processes=@($identity);monitor_settings=$settings;items=$items;samples=$samples;values_stable=$valuesStable;native_values_verified=$true;values_verified=$true;read_only_verified=$true;write_performed=$false;plc_communication_tested=$false;file_write_isolation_verified=$false;native_evidence_path=$journal;updated_utc=[DateTime]::UtcNow.ToString('o')}
  if($Write){$result.action='write';$result.before_samples=$beforeSamples;$result.after_samples=$samples;$result.expected_value=$expectedValue;$result.requested_value=$requestedValue;$result.native_write_evidence=$writeEvidence;$result.native_write_verified=$true;$result.write_performed=$true;$result.writable_verified=$true;$result.read_only_verified=$false;$result.local_only=$true;$result.atomic_compare_exchange=$false}
  if($Write -and $Arguments.format -cin @('uint16','float32','int32','uint32')){$result.displayed_numeric_equality_verified=$true;$result.binary_precision_verified=$false}
  Assert-WeinviewLocalWatchFile $configuration;$result.configuration=$configuration;$result.configuration_loaded_sample=$record.configuration_loaded_sample
  foreach($key in $cleanup.Keys){$result[$key]=$cleanup[$key]};return $result
 }catch{
  $message=$_.Exception.Message
  $cleanup=@{attempted=$false;normal_exit_verified=$false;no_forced_termination=$true;live_watch_pids=@();error=$null}
  if($watch){
   $initialCloseEvidence=$watch.close_evidence
   try{
    if(!$watch.process.HasExited){
     if($configuration -and !(Get-WeinviewWatchMain $watch)){
      # File-loaded startup can fail before the first idle observation.
      # Wait only for this exact native owner; no modal input or guessed buttons.
      $null=WaitFor {Get-WeinviewWatchMain $watch} 6
     }
     $pendingEditor=$false
     if($Write){
      $currentMain=Get-WeinviewWatchMain $watch
      if($currentMain){$currentGrid=Get-WeinviewWatchGrid $watch $currentMain;$pendingEditor=(@($watch.native.EnumChildControls($currentGrid.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit' -and $_.Id -eq 1}).Count -gt 0)}
     }
     if($pendingEditor){$cleanup.reason='Actual writable Value editor still open; no implicit commit/cancel/stop cleanup input.'}
     elseif($record -and @($record.monitor_settings).Count -ge 1 -and (Get-WeinviewWatchMain $watch)){$cleanup.attempted=$true;$cleanup=Close-WeinviewOwnedWatch $watch @($record.monitor_settings)}else{$cleanup.reason='Owned main or complete created-monitor settings absent; no cleanup native input.'}
    }else{$cleanup.reason='Already exited before close; no inferred normal exit.'}
   }catch{$cleanup.error=$_.Exception.Message}
   if($initialCloseEvidence){$cleanup.initial_close_evidence=$initialCloseEvidence}
   if($watch.close_evidence){$cleanup.close_evidence=$watch.close_evidence}
   if(!$watch.process.HasExited){$cleanup.live_watch_pids=@($watch.process.Id)}
  }elseif($record -and @($record.processes).Count){$cleanup.live_watch_pids=@($record.processes|ForEach-Object {$_.pid})}
  $script:weinviewValuesFailureCleanup=$cleanup
  if($Write -and $null -eq $script:weinviewValueWriteFailure){$script:weinviewValueWriteFailure=@{write_attempted=$writeAttempted;write_performed=$writePerformed;native_write_verified=$false;atomic_compare_exchange=$false;expected_value=$expectedValue;requested_value=$requestedValue;native_write_evidence=$writeEvidence}}
  if($record -and $journal){try{$record.state=if(@($cleanup.live_watch_pids).Count){'reconcile_required'}else{'failed'};$record.last_error=$message;$record.cleanup=$cleanup;if($watch -and $watch.close_evidence){$record.close_evidence=$watch.close_evidence};$record.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $journal $record}catch{}}
  if($journal){throw ('weinview_values_reconcile: session_id='+$Arguments.session_id+'; record='+$journal+'; '+$message)};throw
 }finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
}
function Invoke-WeinviewSimulationValueWrite($Arguments,$Installation) {
 return (Invoke-WeinviewSimulationValues $Arguments $Installation $true)
}

function Get-WeinviewCmtValuesContext([string]$Root,[string]$Id,$Installation,[switch]$InitializeDiagnoser) {
 $registry=Get-WeinviewSimulationPath (Join-Path $Root '.weinview-simulations');$folder=Get-WeinviewSimulationPath (Join-Path $registry $Id);$receipt=Get-WeinviewSimulationPath (Join-Path $folder 'session.json');$session=Read-WeinviewSimulationJson $receipt
 if(!(($session.schema -eq 1 -and $session.profile -ceq 'weinview-cn421-cmt-viewer-offline-v1') -or ($session.schema -eq 2 -and $session.profile -ceq 'weinview-cn421-cmt-viewer-owned-offline-v2')) -or $session.kind -cne 'weinview-owned-cmt-offline-simulation' -or $session.session_id -cne $Id -or $session.workspace_root -ine $Root -or $session.state -cne 'running' -or $session.session_record -ine $receipt -or $session.runtime_path -ine (Join-Path $folder 'runtime') -or $session.runtime_cxob_path -ine (Join-Path $session.runtime_path 'PLC Engineering Suite-owned.cxob') -or $session.project_path -notin @((Join-Path $session.runtime_path 'unpacked\mt8000\project'),(Join-Path $session.runtime_path 'unpacked\project')) -or !$session.unpack_verified -or !$session.generated_xob){throw 'Current public running cMT registry session required.'}
 $source=Get-WeinviewSimulationPath $session.source_cxob_path
 if(!$source.StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($registry+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($source) -ine '.cxob'){throw 'Bound workspace source CXOB required.'}
 Assert-WeinviewCmtDependencies $session $Installation $PSScriptRoot
 Assert-WeinviewCmtFiles $session
 $live=@(Get-WeinviewCmtProcesses $session);$viewer=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})
 if($live.Count -ne 3 -or @($session.processes).Count -ne 3 -or $viewer.Count -ne 1 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'com_c30.exe'}).Count -ne 1 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'dserver.exe'}).Count -ne 1){throw 'All three original live cMT owners required.'}
 $windows=Get-WeinviewCmtWindows $session
 if($InitializeDiagnoser -and (!$windows.diagnoser -or !$windows.diagnoser.Visible -or $windows.diagnoser_owner -ne $windows.main.Hwnd)){
  $native=[PLC Engineering Suite.Weinview.NativeControls]::new([int]$viewer[0].pid,[long]$viewer[0].creation_utc_ticks,[string]$viewer[0].exe_path,1500)
  $result=$native.InvokeQtElement($windows.main.Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),'viewer-diagnoser')|ConvertFrom-Json
  if(!$result.invoked){throw 'Original Viewer Diagnoser action was not accepted'}
  $readyUntil=[DateTime]::UtcNow.AddSeconds(5)
  do{$windows=Get-WeinviewCmtWindows $session;if($windows.diagnoser -and $windows.diagnoser.Visible -and $windows.diagnoser_owner -eq $windows.main.Hwnd){break};if([DateTime]::UtcNow -ge $readyUntil){throw 'Original Diagnoser did not initialize after its native action'};Start-Sleep -Milliseconds 50}while($true)
 }
 if(!$windows.diagnoser -or !$windows.diagnoser.Visible -or $windows.diagnoser_owner -ne $windows.main.Hwnd){throw 'Initialized original Diagnoser required: open Diagnoser from the Viewer simulation right-click menu; showing a constructed window does not initialize its Object table. No open/configuration action is performed by this readonly tool.'}
 return @{session=$session;receipt=$receipt;receipt_sha256=(Get-WeinviewSimulationHash $receipt);folder=$folder;live=$live;viewer=$viewer[0];windows=$windows}
}
function Invoke-WeinviewCmtWindowSelect($Arguments,$Installation) {
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if(@($keys|Where-Object {$_ -cnotin @('action','workspace_root','session_id','window_number','window_name')}).Count -or $Arguments.action -cne 'select_window' -or $Arguments.session_id -isnot [string] -or $Arguments.session_id -cnotmatch '^[a-f0-9]{32}$' -or ($Arguments.window_number -isnot [int] -and $Arguments.window_number -isnot [long]) -or [long]$Arguments.window_number -lt 1 -or [long]$Arguments.window_number -gt 4095 -or $Arguments.window_name -isnot [string] -or [string]::IsNullOrWhiteSpace($Arguments.window_name) -or $Arguments.window_name.Length -gt 128 -or $Arguments.window_name -match '[\x00-\x1f\x7f]'){throw 'Exact live cMT window selection arguments required.'}
 if(!$Installation.profile_421 -or $Installation.signature_status -cne 'Valid'){throw 'Signed pinned421 installation required for cMT window selection.'}
 $root=Get-WeinviewSimulationPath ([string]$Arguments.workspace_root)
 if($root.Length -le 3 -or !(Test-Path -LiteralPath $root -PathType Container)){throw 'Bound cMT workspace required.'}
 if(!('PLC Engineering Suite.Weinview.CmtObjectValuesControls' -as [type])){Add-Type -AssemblyName Accessibility;Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'EasyWatchValuesControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $mutex=New-Object Threading.Mutex($false,'Local\PLC Engineering Suite.Weinview.OfflineSimulation.421');$locked=$false
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true}
  if(!$locked){throw 'weinview_simulation_busy: Lifecycle lock held.'}
  $context=Get-WeinviewCmtValuesContext $root ([string]$Arguments.session_id) $Installation -InitializeDiagnoser
  $native=New-Object PLC Engineering Suite.Weinview.NativeControls([int]$context.viewer.pid,[long]$context.viewer.creation_utc_ticks,[string]$context.viewer.exe_path,1500)
  $selection=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::SelectWindowByNumber($native,[int]$context.viewer.pid,[long]$context.windows.main.Hwnd,[long]$context.windows.diagnoser.Hwnd,[int]$Arguments.window_number)
  $after=Get-WeinviewCmtValuesContext $root ([string]$Arguments.session_id) $Installation
  if($after.receipt_sha256 -cne $context.receipt_sha256 -or $after.session.cxob_sha256 -cne $context.session.cxob_sha256 -or $after.session.project_sha256 -cne $context.session.project_sha256 -or $after.windows.main.Hwnd -ne $context.windows.main.Hwnd -or $after.windows.diagnoser.Hwnd -ne $context.windows.diagnoser.Hwnd){throw 'Original cMT session, source, project or native windows changed during selection.'}
  $result=Get-WeinviewCmtResult $after.session @($after.live) 'select_window' $true;$result.windows=$after.windows;$result.window_selection=$selection
  return $result
 }finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
}
function ConvertFrom-WeinviewCmtObjectValueText([string]$Raw,[string]$Format) {
 if($Format -ceq 'bool'){
  if($Raw -cnotin @('true','false')){throw 'Actual Bit Object value must be exact lowercase true/false.'}
  return ($Raw -ceq 'true')
 }
 if($Format -ceq 'float32'){
  $number=[single]0
  if($Raw.Length -gt 64 -or $Raw -cnotmatch '^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$' -or ![single]::TryParse($Raw,[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture,[ref]$number) -or [single]::IsNaN($number) -or [single]::IsInfinity($number)){throw 'Actual Float Object value must be finite invariant single text.'}
  return [double]$number
 }
 if($Format -cin @('int16','int32')){
  $number=[int]0
  if($Raw -cnotmatch '^-?[0-9]+$' -or ![int]::TryParse($Raw,[Globalization.NumberStyles]::AllowLeadingSign,[Globalization.CultureInfo]::InvariantCulture,[ref]$number) -or ($Format -ceq 'int16' -and ($number -lt -32768 -or $number -gt 32767))){throw 'Actual signed Object value is not bounded invariant decimal.'}
  return [int]$number
 }
 if($Format -cin @('uint16','uint32')){
  $number=[uint32]0
  if($Raw -cnotmatch '^[0-9]+$' -or ![uint32]::TryParse($Raw,[Globalization.NumberStyles]::None,[Globalization.CultureInfo]::InvariantCulture,[ref]$number) -or ($Format -ceq 'uint16' -and $number -gt 65535)){throw 'Actual unsigned Object value exceeds requested range.'}
  return [long]$number
 }
 throw 'Unsupported cMT Object numeric format.'
}
function Get-WeinviewCmtObjectItems($Sample,[object[]]$Requests) {
 $cells=@($Sample.cells);$items=@()
 foreach($request in $Requests){
  if($request.format -cnotin @('bool','int16','int32','uint16','uint32','float32')){throw 'Unsupported cMT Object row format.'}
  $addressText=(Get-WeinviewValueAddressType $request)+'-'+([int]$request.address).ToString([Globalization.CultureInfo]::InvariantCulture);$type=Get-WeinviewNumericFormatLabel ([string]$request.format);$matches=@()
  for($i=5;$i -lt $cells.Count;$i+=5){if($cells[$i].name -ceq 'Local HMI' -and $cells[$i+1].name -ceq $addressText){$matches+=,$i}}
  if(!$matches.Count){throw ('Requested Local HMI '+$addressText+' must exist in the current Object table; no monitor is added.')}
  $i=$matches[0];$raw=[string]$cells[$i+4].name
  # Multiple screen objects may legitimately bind the same register. Read every
  # matching row and reject mixed types, lengths or values, rather than picking
  # a favourable row or requiring a unique screen-object reference.
  foreach($match in $matches){
   if($cells[$match+2].name -cne $type -or $cells[$match+3].name -cne '1'){throw 'Existing Object row native type/length differs from request.'}
   if($cells[$match+4].name -cne $raw){throw 'Existing same-address Object rows disagree; no value accepted.'}
  }
  $value=ConvertFrom-WeinviewCmtObjectValueText $raw ([string]$request.format)
  $items+=@{address=[int]$request.address;format=[string]$request.format;value=$value;row_index=[int]($i/5);device='Local HMI';address_text=$addressText;native_type=$type;native_length='1';native_text=$raw}
 }
 return @($items)
}
function Invoke-WeinviewCmtObjectValues($Arguments,$Installation,[string]$Root) {
 foreach($request in $Arguments.addresses){if($request.format -cnotin @('bool','int16','int32','uint16','uint32','float32')){throw 'Unsupported cMT Object readonly format.'}}
 if(!('PLC Engineering Suite.Weinview.CmtObjectValuesControls' -as [type])){Add-Type -AssemblyName Accessibility;Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'EasyWatchValuesControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $context=Get-WeinviewCmtValuesContext $Root ([string]$Arguments.session_id) $Installation
 $folder=Get-WeinviewSimulationPath (Join-Path $context.folder ('object-values-'+[Guid]::NewGuid().ToString('N')));[void][IO.Directory]::CreateDirectory($folder);$journal=Join-Path $folder 'operation.json'
 $native=New-Object PLC Engineering Suite.Weinview.NativeControls([int]$context.viewer.pid,[long]$context.viewer.creation_utc_ticks,[string]$context.viewer.exe_path,1500)
 $before=Get-WeinviewCmtResult $context.session @($context.live) 'status' $true;$before.windows=$context.windows
 $record=[ordered]@{action='read';profile='weinview-cn421-cmt-object-values-v1';session_kind=$context.session.kind;session_id=$context.session.session_id;session_record=$context.receipt;session_record_sha256=$context.receipt_sha256;source_sha256=$context.session.cxob_sha256;simulation_before=$before;simulation_after=$null;samples=@();items=@();values_stable=$false;values_verified=$false;native_values_verified=$false;read_only_verified=$true;write_performed=$false;input_performed=$false;plc_communication_tested=$false;arbitrary_address_read_verified=$false;binary_precision_verified=$false;source_unchanged=$true;updated_utc=[DateTime]::UtcNow.ToString('o');evidence_path=$journal}
 try{
  Write-WeinviewSimulationJson $journal $record;$observations=@()
  for($round=0;$round -lt 2;$round++){
   if($round){Start-Sleep -Milliseconds 500}
   $tree=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::Read($native,[int]$context.viewer.pid,[long]$context.windows.main.Hwnd,[long]$context.windows.diagnoser.Hwnd)
   $cells=@($tree.cells);$raw=ConvertTo-Json -InputObject $cells -Depth 6 -Compress;$hash=[Security.Cryptography.SHA256]::Create()
   try{$digest=[BitConverter]::ToString($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($raw))).Replace('-','')}finally{$hash.Dispose()}
   $now=[DateTime]::UtcNow;$sample=@{tree=$tree;cells=$cells;raw_json=$raw;raw_utf8_sha256=$digest;observed_utc=$now.ToString('o');observed_utc_ticks=$now.Ticks};$record.samples+=,$sample
   Write-WeinviewSimulationJson $journal $record;$observations+=,@(Get-WeinviewCmtObjectItems $sample @($Arguments.addresses))
  }
  if(([long]$record.samples[1].observed_utc_ticks-[long]$record.samples[0].observed_utc_ticks) -lt 5000000){throw 'Two actual Object samples must be at least500ms apart.'}
  $first=@($observations[0]);$second=@($observations[1]);$items=@()
  for($i=0;$i -lt $second.Count;$i++){
   if($first[$i].row_index -ne $second[$i].row_index){throw 'Requested Object row moved between observations.'}
   $item=$second[$i];$item.observed_values=@($first[$i].value,$second[$i].value);$item.stable=($first[$i].value -eq $second[$i].value);$item.native_observed_texts=@($first[$i].native_text,$second[$i].native_text);$item.binary_precision_verified=$false;$items+=,$item
  }
  $after=Get-WeinviewCmtValuesContext $Root ([string]$Arguments.session_id) $Installation
  if($after.receipt_sha256 -cne $context.receipt_sha256 -or $after.windows.main.Hwnd -ne $context.windows.main.Hwnd -or $after.windows.diagnoser.Hwnd -ne $context.windows.diagnoser.Hwnd){throw 'Original session bytes or native windows changed.'}
  $record.simulation_after=Get-WeinviewCmtResult $after.session @($after.live) 'status' $true;$record.simulation_after.windows=$after.windows
  $record.items=$items;$record.values_stable=(@($items|Where-Object {!$_.stable}).Count -eq 0);$record.values_verified=$true;$record.native_values_verified=$true;$record.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $journal $record
  return $record
 }catch{$failure=@{evidence_path=$journal;input_performed=$false;write_performed=$false;native_values_verified=$false;error=$_.Exception.Message};$_.Exception.Data['cmt_values_failure']=$failure;Write-WeinviewSimulationJson $journal @{receipt=$record;failure=$failure};throw}
}
function Invoke-WeinviewCmtObjectValueWrite($Arguments,$Installation,[string]$Root) {
 if($Arguments.format -cnotin @('bool','int16','int32','uint16','uint32','float32')){throw 'Unsupported cMT Object write format.'}
 if($Arguments.format -ceq 'bool' -and ($Arguments.expected_value -isnot [bool] -or $Arguments.value -isnot [bool])){throw 'cMT Bit Object write requires two JSON Boolean values.'}
 if(!('PLC Engineering Suite.Weinview.CmtObjectValuesControls' -as [type])){Add-Type -AssemblyName Accessibility;Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'EasyWatchValuesControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $expectedValue=$Arguments.expected_value
 $requestedValue=$Arguments.value
 $expectedActual=if($Arguments.format -ceq 'bool'){[bool]$expectedValue}elseif($Arguments.format -ceq 'float32'){ConvertTo-WeinviewFloat32 $expectedValue}elseif($Arguments.format -ceq 'uint32'){[long]$expectedValue}else{[int]$expectedValue}
 $requestedActual=if($Arguments.format -ceq 'bool'){[bool]$requestedValue}elseif($Arguments.format -ceq 'float32'){ConvertTo-WeinviewFloat32 $requestedValue}elseif($Arguments.format -ceq 'uint32'){[long]$requestedValue}else{[int]$requestedValue}
 $before=$null;$after=$null;$context=$null;$journal=$null;$record=$null
 $writeAttempted=$false;$writePerformed=$false;$inputPerformed=$false;$windowInputPerformed=$false
 $selectWindow=($Arguments.PSObject.Properties.Name -ccontains 'window_number')
 $writeEvidence=[ordered]@{begin=$null;commit=$null}
 $addressText=(Get-WeinviewValueAddressType $Arguments)+'-'+([int]$Arguments.address).ToString([Globalization.CultureInfo]::InvariantCulture)
 $nativeType=Get-WeinviewNumericFormatLabel ([string]$Arguments.format)
 $requestedText=if($Arguments.format -ceq 'bool'){if($requestedActual){'true'}else{'false'}}elseif($Arguments.format -ceq 'float32'){([single]$requestedActual).ToString('R',[Globalization.CultureInfo]::InvariantCulture)}else{$requestedActual.ToString([Globalization.CultureInfo]::InvariantCulture)}
 $capturePhase={
  param($Native,$Context,[string]$AddressText,[string]$NativeType,[string]$Format,[int]$Address)
  $samples=@();$observed=@()
  for($round=0;$round -lt 2;$round++){
   if($round){Start-Sleep -Milliseconds 500}
   $snapshot=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::ReadRequested($Native,[int]$Context.viewer.pid,[long]$Context.windows.main.Hwnd,[long]$Context.windows.diagnoser.Hwnd,[string[]]@($AddressText))
   $rows=@($snapshot.rows)
   if($snapshot.scope -cne 'requested_local_hmi' -or $snapshot.input_performed -ne $false -or $rows.Count -lt 1){throw 'Exact read-only requested cMT Object snapshot required.'}
   $raw=[string]$rows[0].native_text
   foreach($row in $rows){if($row.device -cne 'Local HMI' -or $row.address_text -cne $AddressText -or $row.native_type -cne $NativeType -or $row.native_length -cne '1' -or $row.native_text -cne $raw){throw 'Requested cMT Object duplicate rows differ in address, type, length or value.'}}
   $value=ConvertFrom-WeinviewCmtObjectValueText $raw $Format
   $observed+=,@{address=$Address;format=$Format;value=$value;device='Local HMI';address_text=$AddressText;native_type=$NativeType;native_length='1';native_text=$raw;row_index=[int]$rows[0].row_index}
   $now=[DateTime]::UtcNow;$samples+=,@{snapshot=$snapshot;observed_utc=$now.ToString('o');observed_utc_ticks=$now.Ticks}
  }
  if(([long]$samples[1].observed_utc_ticks-[long]$samples[0].observed_utc_ticks) -lt 5000000){throw 'Two requested Object samples must be at least500ms apart.'}
  $item=$observed[1];$item.observed_values=@($observed[0].value,$observed[1].value);$item.stable=($observed[0].value -eq $observed[1].value)
  return @{samples=@($samples);items=@($item);values_stable=[bool]$item.stable}
 }
 try{
  $context=Get-WeinviewCmtValuesContext $Root ([string]$Arguments.session_id) $Installation
  $folder=Get-WeinviewSimulationPath (Join-Path $context.folder ('object-write-'+[Guid]::NewGuid().ToString('N')));[void][IO.Directory]::CreateDirectory($folder);$journal=Join-Path $folder 'operation.json'
  $native=New-Object PLC Engineering Suite.Weinview.NativeControls([int]$context.viewer.pid,[long]$context.viewer.creation_utc_ticks,[string]$context.viewer.exe_path,1500)
  $simulationBefore=Get-WeinviewCmtResult $context.session @($context.live) 'status' $true;$simulationBefore.windows=$context.windows
  $record=[ordered]@{action='write';profile='weinview-cn421-cmt-object-value-write-v2';session_kind=$context.session.kind;session_id=$context.session.session_id;session_record=$context.receipt;session_record_sha256=$context.receipt_sha256;source_sha256=$context.session.cxob_sha256;address=[int]$Arguments.address;format=[string]$Arguments.format;expected_value=$expectedValue;requested_value=$requestedValue;simulation_before=$simulationBefore;simulation_after=$null;before=$null;after=$null;native_write_evidence=$writeEvidence;native_write_verified=$false;write_attempted=$false;write_performed=$false;input_performed=$false;atomic_compare_exchange=$false;plc_communication_tested=$false;source_unchanged=$true;evidence_path=$journal}
  if($selectWindow){$record.window_selection=$null}
  Write-WeinviewSimulationJson $journal $record
  if($selectWindow){
   $script:stage='cmt_object_write_select_window'
   $inputPerformed=$null;$record.input_performed=$null;Write-WeinviewSimulationJson $journal $record
   $selection=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::SelectWindow($native,[int]$context.viewer.pid,[long]$context.windows.main.Hwnd,[long]$context.windows.diagnoser.Hwnd,[int]$Arguments.window_number,[string]$Arguments.window_name)
   $windowInputPerformed=[bool]$selection.input_performed;$inputPerformed=$windowInputPerformed;$record.input_performed=$inputPerformed;$record.window_selection=$selection
   $selectedWindows=Get-WeinviewCmtWindows $context.session
   if(!$selectedWindows.diagnoser -or !$selectedWindows.diagnoser.Visible -or $selectedWindows.diagnoser_owner -ne $selectedWindows.main.Hwnd -or $selectedWindows.main.Hwnd -ne $context.windows.main.Hwnd -or $selectedWindows.diagnoser.Hwnd -ne $context.windows.diagnoser.Hwnd){throw 'Original cMT main or initialized Diagnoser changed after window selection.'}
   $context.windows=$selectedWindows;$record.simulation_before.windows=$selectedWindows
   Write-WeinviewSimulationJson $journal $record
  }
  $script:stage='cmt_object_write_before_read'
  $before=& $capturePhase $native $context $addressText $nativeType ([string]$Arguments.format) ([int]$Arguments.address)
  $record.before=$before;Write-WeinviewSimulationJson $journal $record
  $beforeItems=@($before.items)
  if($beforeItems.Count -ne 1 -or !$before.values_stable -or $beforeItems[0].value -ne $expectedActual -or @($beforeItems[0].observed_values|Where-Object {$_ -ne $expectedActual}).Count){throw 'cMT Object before value must be one stable exact expected value; no write performed.'}
  $expectedText=[string]$beforeItems[0].native_text
  $script:stage='cmt_object_write_begin'
  $writeAttempted=$true;$inputPerformed=if($windowInputPerformed){$true}else{$null};$record.write_attempted=$true;$record.input_performed=$inputPerformed;Write-WeinviewSimulationJson $journal $record
  $writeEvidence.begin=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::BeginValueEdit($native,[int]$context.viewer.pid,[long]$context.windows.main.Hwnd,[long]$context.windows.diagnoser.Hwnd,$addressText,$nativeType,$expectedText)
  if(!$writeEvidence.begin -or !$writeEvidence.begin.input_posted){$inputPerformed=$windowInputPerformed;$record.input_performed=$inputPerformed;throw 'cMT Object editor input posting was not confirmed.'}
  $inputPerformed=$true;$record.input_performed=$true;Write-WeinviewSimulationJson $journal $record
  Start-Sleep -Milliseconds 100
  $script:stage='cmt_object_write_commit'
  $writePerformed=$null;$record.write_performed=$null;Write-WeinviewSimulationJson $journal $record
  $writeEvidence.commit=[PLC Engineering Suite.Weinview.CmtObjectValuesControls]::CommitValueEdit($native,[int]$context.viewer.pid,[long]$context.windows.main.Hwnd,[long]$context.windows.diagnoser.Hwnd,$addressText,$nativeType,$expectedText,$requestedText)
  if(!$writeEvidence.commit -or !$writeEvidence.commit.commit_posted){throw 'cMT Object native editor commit was not confirmed.'}
  $writePerformed=$true;$record.write_performed=$true;Write-WeinviewSimulationJson $journal $record
  $script:stage='cmt_object_write_after_read'
  $after=& $capturePhase $native $context $addressText $nativeType ([string]$Arguments.format) ([int]$Arguments.address);$record.after=$after;Write-WeinviewSimulationJson $journal $record
  $afterItems=@($after.items)
  if($afterItems.Count -ne 1 -or !$after.values_stable -or $afterItems[0].value -ne $requestedActual -or @($afterItems[0].observed_values|Where-Object {$_ -ne $requestedActual}).Count){throw 'cMT Object native write did not read requested value twice after commit.'}
  $script:stage='cmt_object_write_session_after'
  $contextAfter=Get-WeinviewCmtValuesContext $Root ([string]$Arguments.session_id) $Installation
  if($contextAfter.receipt_sha256 -cne $context.receipt_sha256 -or $contextAfter.session.cxob_sha256 -cne $context.session.cxob_sha256 -or $contextAfter.windows.main.Hwnd -ne $context.windows.main.Hwnd -or $contextAfter.windows.diagnoser.Hwnd -ne $context.windows.diagnoser.Hwnd){throw 'Original cMT session receipt, source or native windows changed during write.'}
  $simulationAfter=Get-WeinviewCmtResult $contextAfter.session @($contextAfter.live) 'status' $true;$simulationAfter.windows=$contextAfter.windows
  $record.simulation_after=$simulationAfter
  $record.native_write_verified=$true;Write-WeinviewSimulationJson $journal $record
  return $record
 }catch{
  $failure=@{write_attempted=$writeAttempted;write_performed=$writePerformed;input_performed=$inputPerformed;native_write_verified=$false;atomic_compare_exchange=$false;expected_value=$expectedValue;requested_value=$requestedValue;native_write_evidence=$writeEvidence;evidence_path=$journal;error=$_.Exception.Message}
  if($selectWindow){$failure.window_selection=if($record){$record.window_selection}else{$null}}
  $_.Exception.Data['cmt_write_failure']=$failure;$script:weinviewValueWriteFailure=$failure
  if($journal){try{Write-WeinviewSimulationJson $journal @{receipt=$record;failure=$failure}}catch{}}
  throw
 }
}
