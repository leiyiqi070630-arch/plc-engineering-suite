# Windows PowerShell 5.1. Definitions only; dot-sourcing never launches a process.
# Caller has already resolved the signed, pinned 6.10.02.421 installation.
function Get-WeinviewSimulationPath([string]$Value) {
 if([string]::IsNullOrWhiteSpace($Value) -or $Value -notmatch '^[A-Za-z]:\\' -or $Value.Substring(2).Contains(':') -or $Value -match '["\r\n]'){throw 'Absolute local simulation path without ADS required.'}
 if(@($Value.Substring(3).Split('\') | Where-Object {$_ -in @('.','..') -or $_.EndsWith(' ') -or $_.EndsWith('.')}).Count){throw 'Noncanonical simulation path.'}
 $full=[IO.Path]::GetFullPath($Value);$cursor=$full
 # Read attributes directly for each ancestor instead of two provider calls.
 # Only a missing path is skipped; access and other failures remain closed.
 while($cursor -and $cursor.Length -gt 3){
  $present=$true
  try{$attributes=[IO.File]::GetAttributes($cursor)}
  catch{
   $cause=$_.Exception.GetBaseException()
   if($cause -is [IO.FileNotFoundException] -or $cause -is [IO.DirectoryNotFoundException]){$present=$false}else{throw}
  }
  if($present -and ($attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'Simulation reparse path rejected.'}
  $cursor=[IO.Path]::GetDirectoryName($cursor)
 }
 return $full.TrimEnd('\')
}
function Get-WeinviewSimulationHash([string]$Path) {
 $stream=[IO.File]::OpenRead($Path);$algorithm=[Security.Cryptography.SHA256]::Create()
 try{return [BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','')}finally{$algorithm.Dispose();$stream.Dispose()}
}
function Write-WeinviewSimulationJson([string]$Path,$Value) {
 $Path=Get-WeinviewSimulationPath $Path
 $text=$Value|ConvertTo-Json -Depth 12 -Compress
 $bytes=(New-Object Text.UTF8Encoding($true)).GetBytes($text)
 if($bytes.Length -gt 4194304){throw 'Simulation JSON exceeds bound.'}
 $temporary=$Path+'.pending.'+[Guid]::NewGuid().ToString('N')
 $stream=New-Object IO.FileStream($temporary,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
 # PS5 binds an untyped $null string parameter as an empty backup path.
 # NullString supplies a real CLR null while retaining atomic File.Replace.
 if(Test-Path -LiteralPath $Path){[IO.File]::Replace($temporary,$Path,[NullString]::Value)}else{[IO.File]::Move($temporary,$Path)}
}
function Read-WeinviewSimulationJson([string]$Path) {
 $Path=Get-WeinviewSimulationPath $Path
 $info=Get-Item -LiteralPath $Path -Force
 if($info.PSIsContainer -or $info.Length -gt 4194304){throw 'Simulation JSON file invalid.'}
 return ([IO.File]::ReadAllText($Path,(New-Object Text.UTF8Encoding($false,$true)))|ConvertFrom-Json)
}
function Assert-WeinviewSimulatorAvailable {
 if(@(Get-Process -Name EasySimulator,gui_e30,com_e30 -ErrorAction SilentlyContinue).Count){throw 'weinview_simulation_busy: Existing simulator preserved; no attach or close.'}
 $tcp=@(Get-NetTCPConnection -State Listen -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)})
 $udp=@(Get-NetUDPEndpoint -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)})
 if($tcp.Count -or $udp.Count){throw 'weinview_simulation_ports_busy: Fixed endpoints occupied; existing owners preserved.'}
}
function Get-WeinviewSimulationProcesses($Session,[string]$Runtime) {
 $live=New-Object 'Collections.Generic.List[object]';$seen=New-Object 'Collections.Generic.HashSet[int]'
 foreach($item in @($Session.processes)){
  $id=[int]$item.pid
  if($id -le 0 -or !$seen.Add($id)){throw 'Invalid simulation process record.'}
  $exe=Get-WeinviewSimulationPath ([string]$item.exe_path)
  if([IO.Path]::GetDirectoryName($exe) -ine $Runtime -or [IO.Path]::GetFileName($exe) -notin @('EasySimulator.exe','gui_e30.exe','com_e30.exe')){throw 'Receipt process outside protected simulation runtime.'}
  $process=Get-Process -Id $id -ErrorAction SilentlyContinue
  if($null -eq $process){continue}
  try{
   # Pin the original process handle: normal close may finish between Get-Process
   # and Path/StartTime. A cached handle distinguishes exit from a reused PID.
   $null=$process.Handle
   if($process.HasExited){continue}
   $observedTicks=$process.StartTime.ToUniversalTime().Ticks
   # An exited launcher PID may now belong to an unrelated process. Exclude
   # that new process from this session; never send it a close request.
   if($observedTicks -ne [long]$item.creation_utc_ticks){continue}
   $observedPath=$process.Path
  }catch{
   $identityError=$_
   $originalExited=$false
   try{$originalExited=$process.HasExited}catch{}
   if($originalExited -or $null -eq (Get-Process -Id $id -ErrorAction SilentlyContinue)){continue}
   throw $identityError
  }
  if($observedPath -ine $exe){
   # Creation time identifies the original process; its executable path
   # must still match before the process can belong to the live session.
   if($process.HasExited){continue}
   throw 'Simulation process identity changed; no action.'
  }
  if((Get-WeinviewSimulationHash $exe) -ine $item.exe_sha256){throw 'Simulation process binary changed; no action.'}
  $live.Add($process)
 }
 # A new process under this runtime is not implicitly owned by a saved receipt.
 foreach($native in @(Get-CimInstance Win32_Process -OperationTimeoutSec 3|Where-Object {$_.ExecutablePath -and $_.ExecutablePath.StartsWith($Runtime+'\',[StringComparison]::OrdinalIgnoreCase)})){
  if(!@($live|Where-Object {$_.Id -eq [int]$native.ProcessId}).Count){throw 'Unregistered simulation descendant; preserve for reconciliation.'}
 }
 return @($live.ToArray())
}
function Copy-WeinviewSimulationStaticFile([IO.FileInfo]$Entry,[string]$Destination,[DateTime]$Deadline,[byte[]]$Buffer) {
 if([DateTime]::UtcNow -ge $Deadline){throw 'Static simulation copy timed out before launch.'}
 if($null -eq $Buffer -or $Buffer.Length -ne 1048576){throw 'Bounded static copy buffer required.'}
 $source=Get-WeinviewSimulationPath $Entry.FullName
 $destination=Get-WeinviewSimulationPath $Destination
 [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination))
 $expectedLength=[long]$Entry.Length;$sourceStream=$null;$targetStream=$null;$algorithm=$null
 try {
  # Keep the original source handle open through target verification. Read-only
  # sharing rejects concurrent writers/deletion; no second source hash pass.
  $sourceStream=[IO.File]::Open($source,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
  if($sourceStream.Length -ne $expectedLength){throw 'Static simulation source length changed.'}
  $targetStream=[IO.File]::Open($destination,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
  $algorithm=[Security.Cryptography.SHA256]::Create();$copied=[long]0
  while($true){
   if([DateTime]::UtcNow -ge $Deadline){throw 'Static simulation copy timed out before launch.'}
   $count=$sourceStream.Read($Buffer,0,$Buffer.Length)
   if($count -eq 0){break}
   $targetStream.Write($Buffer,0,$count)
   [void]$algorithm.TransformBlock($Buffer,0,$count,$Buffer,0)
   $copied+=$count
  }
  [void]$algorithm.TransformFinalBlock((New-Object byte[] 0),0,0)
  $hash=[BitConverter]::ToString($algorithm.Hash).Replace('-','')
  if($copied -ne $expectedLength -or $sourceStream.Length -ne $expectedLength -or $targetStream.Length -ne $expectedLength){throw 'Static simulation copy length mismatch.'}
  $targetStream.Dispose();$targetStream=$null
  if((Get-WeinviewSimulationHash $destination) -ne $hash){throw 'Static simulation copy SHA mismatch.'}
  return $hash
 } finally {
  if($null -ne $targetStream){$targetStream.Dispose()}
  if($null -ne $sourceStream){$sourceStream.Dispose()}
  if($null -ne $algorithm){$algorithm.Dispose()}
 }
}
function New-WeinviewSimulationStaticRuntime([string]$Source,[string]$Runtime,[DateTime]$Deadline) {
 $dirs=@('cursor','driver','firmware','library','license','plugins','qml','translation','tar')
 $names=@('EasySimulator.exe','gui_e30.exe','com_e30.exe','system_picture','g01_ui','Languages.def','devicetype.def','transtable.def','third-party-license.html')
 $files=New-Object 'Collections.Generic.List[object]';$total=[long]0
 function Add-SimulationStatic([string]$Path) {
  if([DateTime]::UtcNow -ge $Deadline){throw 'Static simulation preflight timed out before launch.'}
  $entry=Get-Item -LiteralPath $Path -Force -ErrorAction Stop
  if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Static simulation source reparse rejected.'}
  if($entry.PSIsContainer){foreach($child in Get-ChildItem -LiteralPath $entry.FullName -Force -ErrorAction Stop){Add-SimulationStatic $child.FullName}}
  else{
   if($entry.Name -match '(?i)(credential|password|token|secret|session|\.log$|\.ini$|\.db$|\.sqlite|\.pml$|\.dmp$)'){throw 'Nonstatic simulation source rejected.'}
   if($files.Count -ge 20000){throw 'Static simulation file count exceeds profile bound.'}
   $files.Add($entry)
  }
 }
 foreach($name in $names){Add-SimulationStatic (Join-Path $Source $name)}
 foreach($dll in Get-ChildItem -LiteralPath $Source -Filter '*.dll' -File -Force){Add-SimulationStatic $dll.FullName}
 foreach($dir in $dirs){Add-SimulationStatic (Join-Path $Source $dir)}
 foreach($entry in $files){$total+=$entry.Length}
 if($total -gt 2147483648){throw 'Static simulation bytes exceed profile bound.'}
 if(Test-Path -LiteralPath $Runtime){throw 'Simulation runtime must be fresh.'}
 [void][IO.Directory]::CreateDirectory($Runtime)
 $manifest=New-Object 'Collections.Generic.List[object]';$copyBuffer=New-Object byte[] 1048576
 foreach($entry in $files){
  if([DateTime]::UtcNow -ge $Deadline){throw 'Static simulation copy timed out before launch.'}
  $relative=$entry.FullName.Substring($Source.Length+1);$destination=Join-Path $Runtime $relative
  $before=Copy-WeinviewSimulationStaticFile $entry $destination $Deadline $copyBuffer
  $manifest.Add([ordered]@{path=$relative;length=[long]$entry.Length;sha256=$before})
 }
 foreach($dir in @('HMI_memory','SD_card','usb1','usb2','emfile','font','windows_font')){[void][IO.Directory]::CreateDirectory((Join-Path $Runtime $dir))}
 $manifestPath=Join-Path ([IO.Path]::GetDirectoryName($Runtime)) 'static-manifest.json'
 Write-WeinviewSimulationJson $manifestPath @($manifest.ToArray())
 return @{path=$manifestPath;sha256=(Get-WeinviewSimulationHash $manifestPath);files=$manifest.Count;bytes=$total;records=@($manifest.ToArray())}
}
function Get-WeinviewSimulationExitEvidence($Session,[object[]]$Observers) {
 # Only original GUI/COM handles pinned and validated before this stop can prove
 # exit codes. A missing process or an old receipt never supplies an inferred 0.
 $records=@($Session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -in @('gui_e30.exe','com_e30.exe')})
 $codes=@(foreach($record in $records){
  $code=$null;$read=$false;$reason='not_observed_before_stop'
  $matches=@($Observers|Where-Object {$_.Id -eq [int]$record.pid})
  if($matches.Count -eq 1){
   try{
    if($matches[0].WaitForExit(0)){$code=[int]$matches[0].ExitCode;$read=$true;$reason='exit_code_read'}else{$reason='process_still_running'}
   }catch{$reason='exit_code_unavailable'}
  }
  @{pid=[int]$record.pid;ticks=[long]$record.creation_utc_ticks;exe=[string]$record.exe_path;exit_code=$code;exit_code_verified=$read;reason=$reason}
 })
 $complete=($records.Count -eq 2 -and @($records|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'gui_e30.exe'}).Count -eq 1 -and @($records|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'com_e30.exe'}).Count -eq 1)
 $normal=($complete -and @($codes|Where-Object {!$_.exit_code_verified -or $null -eq $_.exit_code -or $_.exit_code -ne 0}).Count -eq 0)
 return @{normal_exit_verified=$normal;owned_exit_codes=$codes}
}
function Get-WeinviewSimulationResult($Session,[object[]]$Live,[string]$Action,[bool]$Verified) {
 $processes=@($Session.processes|ForEach-Object {@{pid=[int]$_.pid;ticks=[long]$_.creation_utc_ticks;exe=[string]$_.exe_path;command_line=[string]$_.command_line;parent_pid=[int]$_.parent_pid;exe_sha256=[string]$_.exe_sha256}})
 $exitCodes=if($null -ne $Session.owned_exit_codes){@($Session.owned_exit_codes)}else{@((Get-WeinviewSimulationExitEvidence $Session @()).owned_exit_codes)}
 return @{action=$Action;session_id=$Session.session_id;state=$Session.state;lifecycle_verified=$Verified;session_record=$Session.session_record;runtime_path=$Session.runtime_path;owned_runtime=$Session.runtime_path;exob_path=$Session.source_exob_path;exob_sha256=$Session.exob_sha256;source_sha256=$Session.exob_sha256;processes=$processes;own_processes=@($Session.processes);live_pids=@($Live|ForEach-Object {$_.Id});values=$null;values_verified=$false;mode='offline';plc_communication_tested=$false;file_write_isolation_verified=$false;normal_close_complete=($Action -eq 'stop' -and !$Live.Count);normal_close_verified=[bool]$Session.normal_close_verified;normal_exit_verified=[bool]$Session.normal_exit_verified;owned_exit_codes=$exitCodes;exit_verification_scope='original gui_e30/com_e30 handles pinned before stop';no_forced_termination=$true;updated_utc=$Session.updated_utc}
}
function Invoke-WeinviewSimulation($Arguments,$Installation) {
 $ErrorActionPreference='Stop'
 $session=$null;$receipt=$null
 $action=[string]$Arguments.action
 if($action -notin @('start','status','stop','select_window')){throw 'Unsupported simulation action.'}
 $allowed=if($action -eq 'start'){@('action','mode','workspace_root','exob_path','expected_exob_sha256','exe_path')}elseif($action -eq 'select_window'){@('action','workspace_root','session_id','window_number','window_name')}else{@('action','workspace_root','session_id')}
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if(@($keys|Where-Object {$_ -notin $allowed}).Count){throw 'Unknown simulation argument.'}
 $root=Get-WeinviewSimulationPath ([string]$Arguments.workspace_root)
 if($root.Length -le 3 -or !(Test-Path -LiteralPath $root -PathType Container)){throw 'Existing bound simulation workspace required.'}
 $registry=Get-WeinviewSimulationPath (Join-Path $root '.weinview-simulations')
 $mutex=New-Object Threading.Mutex($false,'Local\PLCCode.Weinview.OfflineSimulation.421')
 $locked=$false
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true}
  if(!$locked){throw 'weinview_simulation_busy: Another lifecycle operation is active.'}
 if($action -eq 'start'){
   if($Arguments.mode -and $Arguments.mode -cne 'offline'){throw 'EXOB simulator only has the observed offline profile.'}
   if($Arguments.session_id){throw 'Start does not accept session_id.'}
   if(!$Installation.profile_421 -or $Installation.signature_status -ne 'Valid'){throw 'Verified signed 421 installation required.'}
   $ide=Get-WeinviewSimulationPath ([string]$Installation.exe_path)
   if($Arguments.exe_path -and (Get-WeinviewSimulationPath ([string]$Arguments.exe_path)) -ine $ide){throw 'Simulation installation argument mismatch.'}
   $source=Get-WeinviewSimulationPath ([string]$Arguments.exob_path)
   if(!$source.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($registry+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($source) -ine '.exob' -or !(Test-Path -LiteralPath $source -PathType Leaf)){throw 'Current workspace EXOB outside simulation registry required.'}
   $expected=[string]$Arguments.expected_exob_sha256
   if($expected -notmatch '^[0-9a-fA-F]{64}$' -or (Get-WeinviewSimulationHash $source) -ine $expected){throw 'Simulation source EXOB SHA mismatch.'}
   Assert-WeinviewSimulatorAvailable
   $id=[Guid]::NewGuid().ToString('N');$folder=Join-Path $registry $id;$runtime=Get-WeinviewSimulationPath (Join-Path $folder 'runtime')
   if($runtime -match '[^\x00-\x7F]'){throw 'Original simulator protocol requires an ASCII workspace path for this verified profile.'}
   [void][IO.Directory]::CreateDirectory($folder)
   $receipt=Join-Path $folder 'session.json'
   $session=[ordered]@{schema=1;kind='weinview-owned-offline-simulation';session_id=$id;workspace_root=$root;session_record=$receipt;runtime_path=$runtime;source_exob_path=$source;runtime_exob_path=(Join-Path $runtime 'PLCCode-owned.exob');exob_sha256=$expected.ToUpperInvariant();state='preparing';created_utc=[DateTime]::UtcNow.ToString('o');updated_utc=[DateTime]::UtcNow.ToString('o');processes=@();values=$null;values_verified=$false;file_write_isolation_verified=$false;normal_close_verified=$false;normal_exit_verified=$false;owned_exit_codes=@();last_error=$null}
   Write-WeinviewSimulationJson $receipt $session
   $installed=[IO.Path]::GetDirectoryName($ide);$installedDef=Join-Path $installed 'xob_pos.def';$defBefore=if(Test-Path -LiteralPath $installedDef){Get-WeinviewSimulationHash $installedDef}else{$null}
   $static=New-WeinviewSimulationStaticRuntime $installed $runtime ([DateTime]::UtcNow.AddSeconds(150))
   $session.static_manifest_path=$static.path;$session.static_manifest_sha256=$static.sha256;$session.static_files=$static.files;$session.static_bytes=$static.bytes
   [IO.File]::Copy($source,$session.runtime_exob_path,$false)
   if((Get-WeinviewSimulationHash $source) -ine $expected -or (Get-WeinviewSimulationHash $session.runtime_exob_path) -ine $expected){throw 'Simulation EXOB copy changed.'}
   $protocol='"2"'+"`r`n"+'"'+$runtime+'"'+"`r`n"+'"'+$session.runtime_exob_path+'"'+"`r`n"
   [IO.File]::WriteAllText((Join-Path $runtime 'xob_pos.def'),$protocol,[Text.Encoding]::ASCII)
   if($null -ne $defBefore -and (Get-WeinviewSimulationHash $installedDef) -ne $defBefore){throw 'Installed simulator definition changed; no launch.'}
   Assert-WeinviewSimulatorAvailable
   $session.state='starting';$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
   # Journal the launcher immediately, before observing native descendants.
   $launcher=Start-Process -FilePath (Join-Path $runtime 'EasySimulator.exe') -WorkingDirectory $runtime -WindowStyle Hidden -PassThru
   $session.launcher_pid=$launcher.Id;$session.launcher_creation_utc_ticks=$null
   # The launcher can exit immediately after spawning gui/com. Do not invent
   # creation ticks or lose its lineage ID when that happens.
   try{$session.launcher_creation_utc_ticks=$launcher.StartTime.ToUniversalTime().Ticks}catch{if(!$launcher.HasExited){throw}}
   $lineage=New-Object 'Collections.Generic.HashSet[int]';[void]$lineage.Add($launcher.Id);$records=@{}
   if($null -ne $session.launcher_creation_utc_ticks){
    $launchRecord=[ordered]@{pid=$launcher.Id;parent_pid=$PID;exe_path=(Join-Path $runtime 'EasySimulator.exe');creation_utc_ticks=$session.launcher_creation_utc_ticks;command_line=(Join-Path $runtime 'EasySimulator.exe');exe_sha256=(Get-WeinviewSimulationHash (Join-Path $runtime 'EasySimulator.exe'))}
    $records[$launcher.Id]=$launchRecord
   }
   $session.processes=@($records.Values);Write-WeinviewSimulationJson $receipt $session
   $deadline=[DateTime]::UtcNow.AddSeconds(8)
   do{
    $changed=$false
    foreach($native in @(Get-CimInstance Win32_Process -OperationTimeoutSec 3|Where-Object {$_.ExecutablePath -and $_.ExecutablePath.StartsWith($runtime+'\',[StringComparison]::OrdinalIgnoreCase)})){
     if(($lineage.Contains([int]$native.ParentProcessId) -or $lineage.Contains([int]$native.ProcessId)) -and !$records.ContainsKey([int]$native.ProcessId)){
      $process=Get-Process -Id $native.ProcessId -ErrorAction SilentlyContinue
      if($null -eq $process){continue}
      if($process.Path -ine $native.ExecutablePath){throw 'Native child identity changed during discovery.'}
      $exeName=[IO.Path]::GetFileName($process.Path)
      if($exeName -notin @('EasySimulator.exe','gui_e30.exe','com_e30.exe')){throw 'Unknown native simulator descendant preserved.'}
      $record=[ordered]@{pid=[int]$native.ProcessId;parent_pid=[int]$native.ParentProcessId;exe_path=$process.Path;creation_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;command_line=$native.CommandLine;exe_sha256=(Get-WeinviewSimulationHash $process.Path)}
      $manifestRecord=@($static.records|Where-Object {$_.path -ieq $exeName})
      if($manifestRecord.Count -ne 1 -or $record.exe_sha256 -ine $manifestRecord[0].sha256){throw 'Native simulator child hash mismatch.'}
      [void]$lineage.Add([int]$native.ProcessId);$records[[int]$native.ProcessId]=$record;$changed=$true
     }
    }
    if($changed){$session.processes=@($records.Values);$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session}
    $guiRecords=@($records.Values|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'gui_e30.exe'})
    $comRecords=@($records.Values|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ieq 'com_e30.exe'})
    if($guiRecords.Count -eq 1 -and $comRecords.Count -eq 1 -and (Get-Process -Id $guiRecords[0].pid -ErrorAction SilentlyContinue) -and (Get-Process -Id $comRecords[0].pid -ErrorAction SilentlyContinue)){break}
    Start-Sleep -Milliseconds 200
   }while([DateTime]::UtcNow -lt $deadline)
   $live=@(Get-WeinviewSimulationProcesses $session $runtime)
   $nativeReady=(@($live|Where-Object ProcessName -EQ 'gui_e30').Count -eq 1 -and @($live|Where-Object ProcessName -EQ 'com_e30').Count -eq 1)
   foreach($record in @($session.processes|Where-Object {$_.exe_path -match '\\(gui|com)_e30\.exe$'})){
    if(!$record.command_line -or !$record.command_line.Contains($session.runtime_exob_path) -or !$record.command_line.Contains($runtime)){$nativeReady=$false}
    if([IO.Path]::GetFileName($record.exe_path) -ieq 'gui_e30.exe' -and $record.command_line -notmatch '(?i)(?:^|\s)-offline(?:\s|$)'){$nativeReady=$false}
   }
   $owners=@($live|ForEach-Object {$_.Id})
   $tcp=@(Get-NetTCPConnection -State Listen -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)})
   $udp=@(Get-NetUDPEndpoint -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)})
   if(@($tcp+$udp|Where-Object {$_.OwningProcess -notin $owners}).Count){$nativeReady=$false}
   $session.state=if($nativeReady){'running'}else{'start_incomplete'};$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
   return (Get-WeinviewSimulationResult $session $live $action $nativeReady)
  }
  if($Arguments.exob_path -or $Arguments.expected_exob_sha256 -or $Arguments.exe_path){throw 'Status/stop accept workspace_root and session_id only.'}
  $id=[string]$Arguments.session_id
  if($id -cnotmatch '^[0-9a-f]{32}$'){throw 'Opaque lowercase UUID N session_id required.'}
  $folder=Get-WeinviewSimulationPath (Join-Path $registry $id);$runtime=Get-WeinviewSimulationPath (Join-Path $folder 'runtime');$receipt=Join-Path $folder 'session.json'
  $session=Read-WeinviewSimulationJson $receipt
  if($session.schema -ne 1 -or $session.kind -cne 'weinview-owned-offline-simulation' -or $session.session_id -cne $id -or $session.workspace_root -ine $root -or $session.runtime_path -ine $runtime -or $session.session_record -ine $receipt -or $session.exob_sha256 -notmatch '^[0-9a-fA-F]{64}$'){throw 'Foreign or invalid simulation receipt.'}
  $source=Get-WeinviewSimulationPath ([string]$session.source_exob_path)
  $runtimeExob=Get-WeinviewSimulationPath ([string]$session.runtime_exob_path)
  if(!$source.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($registry+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($source) -ine '.exob' -or (Get-WeinviewSimulationHash $source) -ine $session.exob_sha256 -or $runtimeExob -ine (Join-Path $runtime 'PLCCode-owned.exob')){throw 'Simulation source EXOB or owned runtime path changed; no action.'}
  $live=@(Get-WeinviewSimulationProcesses $session $runtime)
  if($action -eq 'select_window'){
   if($session.state -cne 'running' -or $Arguments.window_number -lt 10 -or $Arguments.window_number -gt 4095){throw 'Running native simulation and existing base window required.'}
   $gui=@($live|Where-Object ProcessName -CEQ 'gui_e30')
   if($gui.Count -ne 1){throw 'One owned native simulator GUI required.'}
   if(!('PLCCode.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')}
   $native=[PLCCode.Weinview.NativeControls]::new($gui[0].Id,$gui[0].StartTime.ToUniversalTime().Ticks,$gui[0].Path,1500)
   $mainHandle=$gui[0].MainWindowHandle.ToInt64()
   $main=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $mainHandle -and $_.Visible -and $_.Enabled})
   if($main.Count -ne 1){throw 'One owned native simulator canvas required.'}
   $bridge=Join-Path $PSScriptRoot 'QtElementBridge.exe'
   $selected=$native.InvokeQtElement($main[0].Hwnd,$bridge,('legacy-window-select:'+[int]$Arguments.window_number))|ConvertFrom-Json
   $deadline=[DateTime]::UtcNow.AddSeconds(3)
   while($selected.window_number -ne [int]$Arguments.window_number -and [DateTime]::UtcNow -lt $deadline){
    Start-Sleep -Milliseconds 80
    $selected=$native.InvokeQtElement($main[0].Hwnd,$bridge,'legacy-window-read')|ConvertFrom-Json
   }
   if($selected.window_number -ne [int]$Arguments.window_number){throw 'Native base window did not change; command not replayed.'}
   $result=Get-WeinviewSimulationResult $session $live $action $true
   $result.window_selection=@{method='native_simulator_window_command';window_number=[int]$selected.window_number;requested_window_name=[string]$Arguments.window_name;window_name_verified=$false;coordinates=$false;pointer_input=$false;gui_pid=[int]$gui[0].Id;gui_hwnd=[long]$main[0].Hwnd;selection_verified=$true}
   return $result
  }
  if($action -eq 'stop'){
   # Preserve original Process instances/handles even after the polling snapshot
   # becomes empty. Never reopen a PID to obtain a departed process's exit code.
   $nativeRecords=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -in @('gui_e30.exe','com_e30.exe')})
   $exitObservers=@($live|Where-Object {$_.Id -in @($nativeRecords|ForEach-Object {[int]$_.pid})})
   if(!$live.Count){
    if($null -eq $session.PSObject.Properties['normal_exit_verified'] -or !@($session.owned_exit_codes).Count){
     $unknown=Get-WeinviewSimulationExitEvidence $session @()
     Add-Member -InputObject $session -MemberType NoteProperty -Name normal_exit_verified -Value $false -Force
     Add-Member -InputObject $session -MemberType NoteProperty -Name owned_exit_codes -Value $unknown.owned_exit_codes -Force
    }
    $session.state='stopped'
    $session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
    return (Get-WeinviewSimulationResult $session $live $action $true)
   }
   $session.state='stopping';$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
   $closeAccepted=$false
   foreach($process in @($live|Where-Object ProcessName -EQ 'gui_e30')){
    if($process.HasExited){continue}
    try{$accepted=$process.CloseMainWindow()}catch{$closeError=$_;if($process.HasExited){continue};throw $closeError}
    if($accepted){$closeAccepted=$true}else{$session.state='stop_incomplete'}
   }
   $deadline=[DateTime]::UtcNow.AddSeconds(10)
   do{$live=@(Get-WeinviewSimulationProcesses $session $runtime);if(!$live.Count){break};Start-Sleep -Milliseconds 200}while([DateTime]::UtcNow -lt $deadline)
   $session.state=if(!$live.Count){'stopped'}else{'stop_incomplete'}
   $session.normal_close_verified=(!$live.Count -and $closeAccepted)
   $exitEvidence=Get-WeinviewSimulationExitEvidence $session $exitObservers
   Add-Member -InputObject $session -MemberType NoteProperty -Name normal_exit_verified -Value $exitEvidence.normal_exit_verified -Force
   Add-Member -InputObject $session -MemberType NoteProperty -Name owned_exit_codes -Value $exitEvidence.owned_exit_codes -Force
  }elseif(!$live.Count -and $session.state -ne 'stopped'){$session.state='exited'}
  elseif($live.Count -and (@($live|Where-Object ProcessName -EQ 'gui_e30').Count -ne 1 -or @($live|Where-Object ProcessName -EQ 'com_e30').Count -ne 1)){$session.state='partial'}
  $session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
  $verified=if($action -eq 'stop'){!$live.Count}else{$true}
  return (Get-WeinviewSimulationResult $session $live $action $verified)
 }catch{
  $message=$_.Exception.Message
  if($locked -and $session -and $receipt){
   # A failed start never hides a launched simulator or loses the opaque ID.
   # Do not invent cleanup ownership and do not terminate any native child.
   if($action -eq 'start'){$session.state=if($session.launcher_pid){'start_incomplete'}else{'preparation_failed'}}
   # Older JSON receipts deserialize as PSCustomObject without last_error.
   # Journal best-effort inside one try so metadata failures cannot mask the
   # original lifecycle exception.
   try{
    if($session -is [Collections.IDictionary]){$session['last_error']=$message;$session['updated_utc']=[DateTime]::UtcNow.ToString('o')}
    else{
     Add-Member -InputObject $session -MemberType NoteProperty -Name last_error -Value $message -Force
     Add-Member -InputObject $session -MemberType NoteProperty -Name updated_utc -Value ([DateTime]::UtcNow.ToString('o')) -Force
    }
    Write-WeinviewSimulationJson $receipt $session
   }catch{}
   throw ('weinview_simulation_reconcile: session_id='+$session.session_id+'; record='+$receipt+'; '+$message)
  }
  throw
 }finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
}


# Independent cMT profile. The preceding EXOB definitions remain byte-identical.
function Get-WeinviewCmtDependencyRecords([string]$Installed) {
 $pins=@{'cMTViewer.exe'='C36E0F12CFAB28EF858B19AFD880B02C85C72CA1655D180C3C912D4806B8695A';'com_c30.exe'='2878728A3AE2BC03BC40C89E7AE8E97710B347169B23B3937BE5745E469922C4';'dserver.exe'='B46FAA0FCD1BC3532E0145CCCE36A78B202B7191221E96BADE7D5A864274D050'}
 return @(foreach($name in @('cMTViewer.exe','com_c30.exe','dserver.exe')){
  $path=Get-WeinviewSimulationPath (Join-Path $Installed $name)
  [ordered]@{name=$name;path=$path;sha256=$pins[$name];signature_status='Valid'}
 })
}
function Get-WeinviewCmtInstalledDependencies([string]$Installed) {
 $records=@(Get-WeinviewCmtDependencyRecords $Installed)
 foreach($record in $records){if((Get-WeinviewSimulationHash $record.path) -cne $record.sha256 -or (Get-AuthenticodeSignature -LiteralPath $record.path).Status -ne 'Valid'){throw 'Pinned signed 421 cMT dependency differs.'}}
 return $records
}
function Get-WeinviewCmtStaticManifest([string]$BridgeRoot) {
 $path=Get-WeinviewSimulationPath (Join-Path $BridgeRoot 'cmt_runtime.cn421.json')
 $pin='1C7B689F5ABB4B5A7982FF615638FBEA0D81A269FF1920A4753B94D4D413074F'
 if((Get-WeinviewSimulationHash $path) -cne $pin){throw 'Audited cMT static manifest differs.'}
 $manifest=Read-WeinviewSimulationJson $path
 if($manifest.schema -ne 1 -or $manifest.profile -cne 'weinview-cn421-cmt-native-static-v1' -or $manifest.file_count -ne 933 -or $manifest.byte_count -ne 146975528 -or @($manifest.files).Count -ne 933){throw 'Audited cMT static closure differs.'}
 return @{path=$path;sha256=$pin;manifest=$manifest}
}
function New-WeinviewCmtStaticRuntime([string]$Source,[string]$Runtime,[string]$BridgeRoot,[DateTime]$Deadline) {
 $audited=Get-WeinviewCmtStaticManifest $BridgeRoot
 $cache=Get-WeinviewSimulationPath (Join-Path ([IO.Path]::GetDirectoryName([IO.Path]::GetDirectoryName($Runtime))) ('.cmt-static-cn421\'+$audited.sha256))
 [void][IO.Directory]::CreateDirectory($cache)
 $buffer=New-Object byte[] 1048576;$seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase);$total=[long]0
 foreach($file in @($audited.manifest.files)){
  if([DateTime]::UtcNow -ge $Deadline){throw 'cMT static preparation deadline exceeded before launch.'}
  $relative=[string]$file.path
  if($relative -notmatch '^[A-Za-z0-9_@+. /-]+$' -or $relative.StartsWith('/') -or @($relative.Split('/')|Where-Object {$_ -in @('.','..','')}).Count -or !$seen.Add($relative)){throw 'Canonical unique cMT static relative path required.'}
  $relative=$relative.Replace('/','\');$origin=Get-WeinviewSimulationPath (Join-Path $Source $relative);$cached=Get-WeinviewSimulationPath (Join-Path $cache $relative);$target=Get-WeinviewSimulationPath (Join-Path $Runtime $relative)
  $info=Get-Item -LiteralPath $origin -Force
  if($info.PSIsContainer -or $info.Length -ne $file.bytes -or (Test-Path -LiteralPath $target)){throw 'Original cMT static file size or fresh destination differs.'}
  if(Test-Path -LiteralPath $cached){
   if((Get-WeinviewSimulationHash $origin) -cne $file.sha256 -or (Get-Item -LiteralPath $cached).Length -ne $file.bytes -or (Get-WeinviewSimulationHash $cached) -cne $file.sha256 -or !([IO.File]::GetAttributes($cached) -band [IO.FileAttributes]::ReadOnly)){throw 'Original or cached immutable cMT static file differs.'}
  }else{
   if((Copy-WeinviewSimulationStaticFile $info $cached $Deadline $buffer) -cne $file.sha256){throw 'Original cMT static copy differs.'}
   [IO.File]::SetAttributes($cached,([IO.File]::GetAttributes($cached) -bor [IO.FileAttributes]::ReadOnly))
  }
  [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target))
  # The cache and session are on the same volume; installed files are never linked
  # or made read-only. Only this immutable, verified owned copy is shared.
  $null=New-Item -ItemType HardLink -Path $target -Value $cached -ErrorAction Stop
  if((Get-Item -LiteralPath $target).Length -ne $file.bytes -or (Get-WeinviewSimulationHash $target) -cne $file.sha256){throw 'cMT session static link differs.'}
  $total+=[long]$file.bytes
 }
 if($total -ne $audited.manifest.byte_count -or @(Get-ChildItem -LiteralPath $cache -Recurse -File -Force).Count -ne $seen.Count){throw 'cMT cache closure differs.'}
 foreach($dir in @('HMI_memory','SD_card','usb1','usb2','emfile','font','windows_font')){[void][IO.Directory]::CreateDirectory((Join-Path $Runtime $dir))}
 return [ordered]@{profile=$audited.manifest.profile;manifest_path=$audited.path;manifest_sha256=$audited.sha256;cache_path=$cache;file_count=$seen.Count;byte_count=$total;history_path=(Join-Path $Runtime 'HMI_memory\eventlog\event.db');mutable_data_copied=$false;whole_ide_copied=$false}
}
function Assert-WeinviewCmtDependencies($Session,$Installation,[string]$BridgeRoot) {
 $installed=[IO.Path]::GetDirectoryName((Get-WeinviewSimulationPath $Installation.exe_path))
 $dependencies=Get-WeinviewCmtDependencyRecords $installed
 if($installed -ine $Session.installed_runtime_path -or ($dependencies|ConvertTo-Json -Compress) -cne ($Session.installation_dependencies|ConvertTo-Json -Compress)){throw 'Original cMT installation dependency receipt differs.'}
 if($Session.profile -ceq 'weinview-cn421-cmt-viewer-offline-v1'){return}
 if($Session.schema -ne 2 -or $Session.profile -cnotin @('weinview-cn421-cmt-viewer-owned-offline-v2','weinview-cn421-cmt-viewer-owned-online-v1')){throw 'Unknown cMT lifecycle profile.'}
 $runtime=Get-WeinviewSimulationPath $Session.runtime_path;$audited=Get-WeinviewCmtStaticManifest $BridgeRoot;$static=$Session.static_runtime
 $cache=Get-WeinviewSimulationPath (Join-Path ([IO.Path]::GetDirectoryName([IO.Path]::GetDirectoryName($runtime))) ('.cmt-static-cn421\'+$audited.sha256))
 if($static.profile -cne $audited.manifest.profile -or $static.manifest_path -ine $audited.path -or $static.manifest_sha256 -cne $audited.sha256 -or $static.cache_path -ine $cache -or $static.file_count -ne 933 -or $static.byte_count -ne 146975528 -or $static.mutable_data_copied -ne $false -or $static.whole_ide_copied -ne $false -or $static.history_path -ine (Join-Path $runtime 'HMI_memory\eventlog\event.db')){throw 'Session-owned cMT static/history binding differs.'}
 $runtimeDependencies=Get-WeinviewCmtDependencyRecords $runtime
 if(($runtimeDependencies|ConvertTo-Json -Compress) -cne ($Session.runtime_dependencies|ConvertTo-Json -Compress)){throw 'Owned cMT runtime dependency receipt differs.'}
}
function Initialize-WeinviewCmtClose {
 if('PLCCode.Weinview.CmtLifecycleMessage' -as [type]){return}
 Add-Type -TypeDefinition @'
using System;using System.Diagnostics;using System.Runtime.InteropServices;using System.Text;
namespace PLCCode.Weinview {public static class CmtLifecycleMessage {
 [DllImport("user32.dll",ExactSpelling=true)]static extern IntPtr GetWindow(IntPtr h,uint c);
 [DllImport("user32.dll",ExactSpelling=true)]static extern IntPtr GetAncestor(IntPtr h,uint c);
 [DllImport("user32.dll",ExactSpelling=true)]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll",ExactSpelling=true)]static extern bool IsWindowEnabled(IntPtr h);
 [DllImport("user32.dll",ExactSpelling=true,SetLastError=true)]static extern bool ShowWindowAsync(IntPtr h,int command);
 [DllImport("user32.dll",EntryPoint="PostMessageW",CharSet=CharSet.Unicode,ExactSpelling=true,SetLastError=true)]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
 [DllImport("kernel32.dll",EntryPoint="GetLongPathNameW",CharSet=CharSet.Unicode,ExactSpelling=true,SetLastError=true)]static extern uint GetLongPathNameW(string p,StringBuilder b,uint n);
 public static string LongPath(string p){var b=new StringBuilder(32768);var n=GetLongPathNameW(p,b,32768);if(n==0||n>=32768)throw new InvalidOperationException("Existing canonical long path required.");return b.ToString();}
 public static long Owner(long h){return GetWindow(new IntPtr(h),4).ToInt64();}
 public static void Display(long main,long diagnoser,int pid,long ticks,string exe){using(var p=Process.GetProcessById(pid)){var handle=p.Handle;if(p.HasExited||p.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(p.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("cMT owner changed.");uint mainPid,diagPid;var mainWindow=new IntPtr(main);if(GetWindowThreadProcessId(mainWindow,out mainPid)==0||mainPid!=pid||GetAncestor(mainWindow,2)!=mainWindow||GetWindow(mainWindow,4)!=IntPtr.Zero||!IsWindowEnabled(mainWindow))throw new InvalidOperationException("cMT main ownership changed.");if(diagnoser!=0){var diagWindow=new IntPtr(diagnoser);if(GetWindowThreadProcessId(diagWindow,out diagPid)==0||diagPid!=pid||GetAncestor(diagWindow,2)!=diagWindow||!IsWindowEnabled(diagWindow)||GetWindow(diagWindow,4)!=IntPtr.Zero&&GetWindow(diagWindow,4)!=mainWindow)throw new InvalidOperationException("cMT Diagnoser ownership changed.");}if(!ShowWindowAsync(mainWindow,5))throw new InvalidOperationException("cMT main show request failed.");if(diagnoser!=0&&!ShowWindowAsync(new IntPtr(diagnoser),0))throw new InvalidOperationException("cMT Diagnoser hide request failed.");}}
 public static void Close(long h,int pid,long ticks,string exe){using(var p=Process.GetProcessById(pid)){var handle=p.Handle;if(p.HasExited||p.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(p.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("cMT owner changed.");uint owner;var hwnd=new IntPtr(h);if(GetWindowThreadProcessId(hwnd,out owner)==0||owner!=pid||GetAncestor(hwnd,2)!=hwnd||GetWindow(hwnd,4)!=IntPtr.Zero||!IsWindowEnabled(hwnd))throw new InvalidOperationException("cMT main ownership changed.");if(!PostMessageW(hwnd,16,UIntPtr.Zero,IntPtr.Zero))throw new InvalidOperationException("cMT WM_CLOSE post failed.");}}
}}
'@ -ReferencedAssemblies 'System.dll'
}
function Assert-WeinviewCmtAvailable {
 if(@(Get-Process -Name cMTViewer,com_c30,dserver,EasySimulator,gui_e30,com_e30,EasyWatch -ErrorAction SilentlyContinue).Count){throw 'weinview_simulation_busy: Existing Viewer/simulator/Watch preserved.'}
 if(@(Get-NetTCPConnection -State Listen -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)}).Count -or @(Get-NetUDPEndpoint -ErrorAction Stop|Where-Object {$_.LocalPort -in @(8000,8001,8002)}).Count){throw 'weinview_simulation_ports_busy: Existing endpoint preserved.'}
}
function Get-WeinviewCmtProcesses($Session) {
 $dependencies=if($Session.profile -cin @('weinview-cn421-cmt-viewer-owned-offline-v2','weinview-cn421-cmt-viewer-owned-online-v1')){@($Session.runtime_dependencies)}else{@($Session.installation_dependencies)}
 $records=@($Session.processes);$viewer=@($records|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})
 if($viewer.Count -ne 1 -or $records.Count -gt 3){throw 'Invalid cMT owner records.'}
 $seen=New-Object 'Collections.Generic.HashSet[int]';$live=@()
 foreach($record in $records){
  $dependency=@($dependencies|Where-Object {$_.path -ieq $record.exe_path -and $_.sha256 -ceq $record.exe_sha256})
  if($dependency.Count -ne 1 -or !$seen.Add([int]$record.pid) -or (Get-WeinviewSimulationHash (Get-WeinviewSimulationPath $record.exe_path)) -cne $record.exe_sha256){throw 'cMT process dependency/identity record invalid.'}
  if($record.pid -ne $viewer[0].pid -and $record.parent_pid -ne $viewer[0].pid){throw 'cMT child not parent-bound.'}
  $process=Get-Process -Id ([int]$record.pid) -ErrorAction SilentlyContinue
  if(!$process){continue};$null=$process.Handle;if($process.HasExited){continue}
  if($process.StartTime.ToUniversalTime().Ticks -ne [long]$record.creation_utc_ticks -or $process.Path -ine $record.exe_path){throw 'cMT original PID/ticks/exe changed; preserved.'}
  $native=Get-CimInstance Win32_Process -Filter ('ProcessId='+$record.pid) -OperationTimeoutSec 3
  if($process.HasExited){continue}
  if(!$native -or $native.ExecutablePath -ine $record.exe_path -or $native.ParentProcessId -ne $record.parent_pid -or $native.CommandLine -cne $record.command_line){throw 'cMT command/parent identity changed.'}
  $live+=,$process
 }
 foreach($child in @(Get-CimInstance Win32_Process -Filter ('ParentProcessId='+$viewer[0].pid) -OperationTimeoutSec 3)){
  if(!$seen.Contains([int]$child.ProcessId)){throw 'Unregistered cMT descendant preserved.'}
 }
 return @($live)
}
function Assert-WeinviewCmtFiles($Session,[bool]$AllowReleasedGenerated=$false) {
 foreach($pair in @(@{path=$Session.source_cxob_path;sha=$Session.cxob_sha256},@{path=$Session.runtime_cxob_path;sha=$Session.cxob_sha256},@{path=$Session.project_path;sha=$Session.project_sha256},@{path=$Session.unpack_response_path;sha=$Session.unpack_response_sha256})){
  if((Get-WeinviewSimulationHash (Get-WeinviewSimulationPath $pair.path)) -cne $pair.sha){throw 'cMT bound file changed; no action.'}
 }
 if($Session.generated_xob){
  $generatedPath=Get-WeinviewSimulationPath $Session.generated_xob.path
  if(Test-Path -LiteralPath $generatedPath -PathType Leaf){if((Get-WeinviewSimulationHash $generatedPath) -cne $Session.project_sha256){throw 'cMT generated XOB changed.'}}
  elseif(!$AllowReleasedGenerated){throw 'cMT generated XOB missing while an owner may be live.'}
 }
}
function Get-WeinviewCmtWindows($Session,[bool]$AllowSelectorPopup=$false) {
 $viewer=@($Session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})[0]
 if(!('PLCCode.Weinview.NativeControls' -as [type])){throw 'cMT native identity reader missing.'}
 $native=New-Object PLCCode.Weinview.NativeControls([int]$viewer.pid,[long]$viewer.creation_utc_ticks,[string]$viewer.exe_path,1000)
 $online=($Session.kind -ceq 'weinview-owned-cmt-online-simulation')
 $tops=@($native.EnumTopWindows());$main=@($tops|Where-Object {$_.Class -ceq 'Qt5QWindowOwnDCIcon' -and $_.Enabled -and ($online -or $_.Title -ceq 'cMT Viewer ( Simulation )')});$diag=@($tops|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'Diagnoser' -and $_.Enabled})
 # Closing the recorded main is valid while its ordinary window selector is open.
 $popup=if($AllowSelectorPopup){@($tops|Where-Object {$_.Class -ceq 'Qt5QWindowPopupDropShadowSaveBits' -and $_.Title -ceq 'cMTViewer' -and $_.Pid -eq $viewer.pid})}else{@()}
 $knownHwnds=@(@($main)+@($diag)+@($popup)|ForEach-Object {$_.Hwnd})
 if($main.Count -ne 1 -or $diag.Count -gt 1 -or $popup.Count -gt 1 -or @($tops|Where-Object {$_.Visible -and $_.Hwnd -notin $knownHwnds}).Count){throw 'Unknown cMT main/dialog structure; no action.'}
 Initialize-WeinviewCmtClose
 if([PLCCode.Weinview.CmtLifecycleMessage]::Owner($main[0].Hwnd) -ne 0 -or ($diag.Count -and [PLCCode.Weinview.CmtLifecycleMessage]::Owner($diag[0].Hwnd) -notin @(0,$main[0].Hwnd))){throw 'cMT window owner chain changed.'}
 if($Session.main_hwnd -and $Session.main_hwnd -ne $main[0].Hwnd){throw 'cMT main HWND changed.'}
 return [ordered]@{main=$main[0];diagnoser=if($diag.Count){$diag[0]}else{$null};main_owner=0;diagnoser_owner=if($diag.Count){[PLCCode.Weinview.CmtLifecycleMessage]::Owner($diag[0].Hwnd)}else{$null};top_windows=$tops}
}
function Show-WeinviewCmtViewer($Session) {
 $live=@(Get-WeinviewCmtProcesses $Session)
 if($live.Count -ne 3){throw 'Three original cMT owner processes required before showing Viewer.'}
 $windows=Get-WeinviewCmtWindows $Session
 $viewer=@($Session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})
 if($viewer.Count -ne 1){throw 'Unique registered cMT Viewer required.'}
 $diagnoser=if($windows.diagnoser){[long]$windows.diagnoser.Hwnd}else{[long]0}
 [PLCCode.Weinview.CmtLifecycleMessage]::Display([long]$windows.main.Hwnd,$diagnoser,[int]$viewer[0].pid,[long]$viewer[0].creation_utc_ticks,[string]$viewer[0].exe_path)
 $deadline=[DateTime]::UtcNow.AddSeconds(5)
 do {
  $observed=Get-WeinviewCmtWindows $Session
  if($observed.main.Visible -and (!$observed.diagnoser -or !$observed.diagnoser.Visible)){$Session.windows=$observed;$Session.main_hwnd=$observed.main.Hwnd;return $observed}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $deadline)
 throw 'Owned cMT main did not become visible with Diagnoser hidden.'
}
function Get-WeinviewCmtResult($Session,[object[]]$Live,[string]$Action,[bool]$Verified) {
 $result=[ordered]@{action=$Action;profile=$Session.profile;session_kind=$Session.kind;session_id=$Session.session_id;state=$Session.state;lifecycle_verified=$Verified;session_record=$Session.session_record;runtime_path=$Session.runtime_path;owned_runtime=$Session.runtime_path;cxob_path=$Session.source_cxob_path;cxob_sha256=$Session.cxob_sha256;source_sha256=$Session.cxob_sha256;source_unchanged=$true;runtime_cxob_path=$Session.runtime_cxob_path;project_path=$Session.project_path;project_sha256=$Session.project_sha256;unpack_request_path=$Session.unpack_request_path;unpack_response_path=$Session.unpack_response_path;unpack_response_sha256=$Session.unpack_response_sha256;unpack_verified=[bool]$Session.unpack_verified;installed_runtime_path=$Session.installed_runtime_path;installation_dependencies=@($Session.installation_dependencies);generated_xob=$Session.generated_xob;processes=@($Session.processes|ForEach-Object {@{pid=[int]$_.pid;ticks=[long]$_.creation_utc_ticks;exe=[string]$_.exe_path;command_line=[string]$_.command_line;parent_pid=[int]$_.parent_pid;exe_sha256=[string]$_.exe_sha256}});own_processes=@($Session.processes);live_pids=@($Live|ForEach-Object {$_.Id});windows=$Session.windows;endpoint_evidence=$Session.endpoint_evidence;values=$null;values_verified=$false;mode=$(if($Session.kind -ceq 'weinview-owned-cmt-online-simulation'){'online'}else{'offline'});plc_communication_tested=$false;file_write_isolation_verified=$false;normal_close_complete=($Action -ceq 'stop' -and !$Live.Count);normal_close_verified=[bool]$Session.normal_close_verified;normal_exit_verified=[bool]$Session.normal_exit_verified;owned_exit_codes=$Session.owned_exit_codes;exit_verification_scope='original Viewer/com_c30/dserver handles pinned before stop';no_forced_termination=$true;runtime_execution_scope='installed signed Windows Viewer/com_c30/dserver and installation dependencies; extracted Linux executables never run';updated_utc=$Session.updated_utc}
 if($Session.profile -cin @('weinview-cn421-cmt-viewer-owned-offline-v2','weinview-cn421-cmt-viewer-owned-online-v1')){$result.runtime_dependencies=@($Session.runtime_dependencies);$result.static_runtime=$Session.static_runtime;$result.runtime_execution_scope='owned signed Windows Viewer/com_c30/dserver and pinned immutable native assets; session-local history; extracted Linux executables never run'}
 return $result
}
function Get-WeinviewCmtIpcSelection($Tcp,$Session,$Com) {
 $listenerSeen=$false
 foreach($port in @(8000,8002)){
  $listeners=@($Tcp|Where-Object {$_.State -eq 'Listen' -and $_.OwningProcess -eq $Com.pid -and $_.LocalPort -eq $port})
  if($listeners.Count -ne 1){continue}
  $listenerSeen=$true;$edgesComplete=$true
  foreach($client in @($Session.processes|Where-Object {$_.pid -ne $Com.pid})){
   if(!@($Tcp|Where-Object {$_.State -eq 'Established' -and $_.OwningProcess -eq $client.pid -and $_.RemotePort -eq $port -and $_.RemoteAddress -eq '127.0.0.1'}).Count){$edgesComplete=$false;break}
  }
  if($edgesComplete){return @{port=[int]$port;connections=@($Tcp);missing=$null}}
 }
 return @{port=$null;connections=@($Tcp);missing=$(if($listenerSeen){'cMT original IPC edge unavailable.'}else{'cMT actual owned IPC listener unavailable.'})}
}
function Wait-WeinviewCmtIpcReady($Session,$Com,[DateTime]$Deadline=[DateTime]::MinValue) {
 do {
  $live=@(Get-WeinviewCmtProcesses $Session)
  if($Session.processes.Count -ne 3 -or $live.Count -ne 3){throw 'Exact three original live cMT owners required for reconciliation.'}
  $tcp=@(Get-NetTCPConnection -ErrorAction Stop|Where-Object {$_.OwningProcess -in @($Session.processes.pid) -and ($_.LocalPort -in @(8000,8002) -or $_.RemotePort -in @(8000,8002))})
  $selection=Get-WeinviewCmtIpcSelection $tcp $Session $Com
  if(!$selection.missing){return $selection}
  if($Deadline -eq [DateTime]::MinValue -or [DateTime]::UtcNow -ge $Deadline){
   if($Deadline -ne [DateTime]::MinValue){
    try{
     $owned=@(Get-NetTCPConnection -ErrorAction Stop|Where-Object {$_.OwningProcess -in @($Session.processes.pid)})
     $diagnostic=Join-Path ([IO.Path]::GetDirectoryName([string]$Session.session_record)) 'ipc-start-failure.json'
     Write-WeinviewSimulationJson $diagnostic @{reason=$selection.missing;captured_utc=[DateTime]::UtcNow.ToString('o');owner_pids=@($Session.processes|ForEach-Object {[int]$_.pid});connections=@($owned|ForEach-Object {@{pid=[int]$_.OwningProcess;state=[string]$_.State;local_address=[string]$_.LocalAddress;local_port=[int]$_.LocalPort;remote_address=[string]$_.RemoteAddress;remote_port=[int]$_.RemotePort}})}
    }catch{}
   }
   throw $selection.missing
  }
  Start-Sleep -Milliseconds 150
 }while($true)
}
function Complete-WeinviewCmtStartEvidence($session,[string]$BridgeRoot,[DateTime]$IpcDeadline=[DateTime]::MinValue) {
 $live=@(Get-WeinviewCmtProcesses $session)
 if($session.processes.Count -ne 3 -or $live.Count -ne 3 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'com_c30.exe'}).Count -ne 1 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'dserver.exe'}).Count -ne 1){throw 'Exact three original live cMT owners required for reconciliation.'}
 Assert-WeinviewCmtFiles $session
 $viewerRecord=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})[0]
   $generated=@(foreach($child in @($session.processes|Where-Object {$_.pid -ne $viewerRecord.pid})){
    $guid='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.xob'
    $match=[regex]::Match([string]$child.command_line,'(?i)(?:^|\s)(?:"([A-Z]:[/\\][^"\r\n]*[/\\]CloudHMI[/\\]'+$guid+')"|([A-Z]:[/\\][^\s"]*[/\\]CloudHMI[/\\]'+$guid+'))(?=\s|$)')
    if(!$match.Success){throw 'cMT child generated GUID XOB argument unavailable.'};$generatedArgument=if($match.Groups[1].Success){$match.Groups[1].Value}else{$match.Groups[2].Value};Get-WeinviewSimulationPath ($generatedArgument.Replace('/','\'))
   })
   if($generated.Count -ne 2 -or $generated[0] -ine $generated[1]){throw 'cMT children do not share exact generated GUID XOB.'}
   Initialize-WeinviewCmtClose
   $generatedLong=Get-WeinviewSimulationPath ([PLCCode.Weinview.CmtLifecycleMessage]::LongPath($generated[0]))
   $tempLong=Get-WeinviewSimulationPath ([PLCCode.Weinview.CmtLifecycleMessage]::LongPath([IO.Path]::GetTempPath()))
   if([IO.Path]::GetDirectoryName($generatedLong) -ine (Join-Path $tempLong 'CloudHMI')){throw 'cMT generated XOB outside actual temp CloudHMI directory.'}
   $file=Get-Item -LiteralPath $generatedLong
   $projectLastWriteTicks=(Get-Item -LiteralPath $session.project_path).LastWriteTimeUtc.Ticks
   if($file.CreationTimeUtc.Ticks -lt $viewerRecord.creation_utc_ticks-20000000 -or ($file.LastWriteTimeUtc.Ticks -lt $viewerRecord.creation_utc_ticks-20000000 -and $file.LastWriteTimeUtc.Ticks -ne $projectLastWriteTicks) -or $file.Length -le 0 -or (Get-WeinviewSimulationHash $file.FullName) -cne $session.project_sha256){throw 'cMT generated XOB time/bytes/project SHA differs.'}
   $session.generated_xob=[ordered]@{path=$file.FullName;sha256=$session.project_sha256;bytes=[long]$file.Length;creation_utc_ticks=$file.CreationTimeUtc.Ticks;last_write_utc_ticks=$file.LastWriteTimeUtc.Ticks}
   if(!('PLCCode.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $BridgeRoot 'NativeControls.cs')}
   $session.windows=Get-WeinviewCmtWindows $session;$session.main_hwnd=$session.windows.main.Hwnd
   $com=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'com_c30.exe'})[0]
   $online=($session.kind -ceq 'weinview-owned-cmt-online-simulation')
   if(!$online){
    $ipc=Wait-WeinviewCmtIpcReady $session $com $IpcDeadline
    $tcp=@($ipc.connections);$ipcPort=[int]$ipc.port
   }else{$tcp=@(Get-NetTCPConnection -ErrorAction Stop|Where-Object {$_.OwningProcess -in @($session.processes.pid) -and ($_.LocalPort -eq 8000 -or $_.RemotePort -eq 8000)});$ipcPort=$null}
   $scope=if($online){'observed online Viewer/com_c30/dserver sockets; PLC communication not verified'}else{'actual Viewer/com_c30/dserver IPC, not a proven EasyWatch service'}
   $session.endpoint_evidence=[ordered]@{port=$ipcPort;scope=$scope;connections=@($tcp|ForEach-Object {[ordered]@{OwningProcess=[int]$_.OwningProcess;State=[string]$_.State;LocalAddress=[string]$_.LocalAddress;LocalPort=[int]$_.LocalPort;RemoteAddress=[string]$_.RemoteAddress;RemotePort=[int]$_.RemotePort}})}
   $live=@(Get-WeinviewCmtProcesses $session);Assert-WeinviewCmtFiles $session
 return @($live)
}
function Invoke-WeinviewCmtSimulation($Arguments,$Installation,[string]$BridgeRoot) {
 $ErrorActionPreference='Stop';$session=$null;$receipt=$null;$locked=$false
 $action=[string]$Arguments.action;if($action -cnotin @('start','status','stop')){throw 'Invalid cMT lifecycle action.'}
 $allowed=if($action -ceq 'start'){@('action','mode','workspace_root','cxob_path','expected_cxob_sha256','exe_path')}else{@('action','workspace_root','session_id')}
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if(@($keys|Where-Object {$_ -cnotin $allowed}).Count){throw 'Unknown cMT lifecycle argument.'}
 $root=Get-WeinviewSimulationPath ([string]$Arguments.workspace_root)
 if($root.Length -le 3 -or !(Test-Path -LiteralPath $root -PathType Container)){throw 'Bound cMT workspace required.'}
 $registry=Get-WeinviewSimulationPath (Join-Path $root '.weinview-simulations')
 $mutex=New-Object Threading.Mutex($false,'Local\PLCCode.Weinview.OfflineSimulation.421')
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true};if(!$locked){throw 'weinview_simulation_busy: Lifecycle lock held.'}
 if($action -ceq 'start'){
   $mode=if($Arguments.mode){[string]$Arguments.mode}else{'offline'}
   if($mode -cnotin @('offline','online')){throw 'Original cMT Viewer simulation mode required.'}
   if(!$Installation.profile_421 -or $Installation.signature_status -cne 'Valid'){throw 'Signed 421 installation required.'}
   $ide=Get-WeinviewSimulationPath ([string]$Installation.exe_path);$installed=[IO.Path]::GetDirectoryName($ide)
   if($Arguments.exe_path -and (Get-WeinviewSimulationPath ([string]$Arguments.exe_path)) -ine $ide){throw 'cMT installation argument differs.'}
   $dependencies=Get-WeinviewCmtInstalledDependencies $installed
   $source=Get-WeinviewSimulationPath ([string]$Arguments.cxob_path);$expected=[string]$Arguments.expected_cxob_sha256
   if(!$source.StartsWith($root+'\',[StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($registry+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($source) -ine '.cxob' -or !(Test-Path -LiteralPath $source -PathType Leaf) -or $expected -notmatch '^[a-fA-F0-9]{64}$' -or (Get-WeinviewSimulationHash $source) -ine $expected){throw 'Bound source CXOB/SHA required.'}
   Assert-WeinviewCmtAvailable
   $id=[Guid]::NewGuid().ToString('N');$folder=Join-Path $registry $id;$runtime=Get-WeinviewSimulationPath (Join-Path $folder 'runtime')
   if($runtime -match '[^\x00-\x7f]' -or (Test-Path -LiteralPath $folder)){throw 'Fresh ASCII cMT session path required for this product profile.'}
   [void][IO.Directory]::CreateDirectory($runtime);$receipt=Join-Path $folder 'session.json'
   $session=[ordered]@{schema=2;kind=$(if($mode -ceq 'online'){'weinview-owned-cmt-online-simulation'}else{'weinview-owned-cmt-offline-simulation'});profile=$(if($mode -ceq 'online'){'weinview-cn421-cmt-viewer-owned-online-v1'}else{'weinview-cn421-cmt-viewer-owned-offline-v2'});session_id=$id;workspace_root=$root;session_record=$receipt;runtime_path=$runtime;source_cxob_path=$source;runtime_cxob_path=(Join-Path $runtime 'PLCCode-owned.cxob');cxob_sha256=$expected.ToUpperInvariant();project_path=$null;project_sha256=$null;unpack_request_path=(Join-Path $folder 'unpack-request.json');unpack_response_path=(Join-Path $folder 'unpack-response.json');unpack_response_sha256=$null;unpack_verified=$false;installed_runtime_path=$installed;installation_dependencies=$dependencies;runtime_dependencies=@();static_runtime=$null;generated_xob=$null;processes=@();main_hwnd=$null;windows=$null;endpoint_evidence=$null;state='preparing';created_utc=[DateTime]::UtcNow.ToString('o');updated_utc=[DateTime]::UtcNow.ToString('o');normal_close_verified=$false;normal_exit_verified=$false;owned_exit_codes=@();last_error=$null}
   if($mode -ceq 'online'){$session.mode='online'}
   Write-WeinviewSimulationJson $receipt $session
   $session.static_runtime=New-WeinviewCmtStaticRuntime $installed $runtime $BridgeRoot ([DateTime]::UtcNow.AddSeconds(90))
   $dependencies=Get-WeinviewCmtInstalledDependencies $runtime;$session.runtime_dependencies=$dependencies
   Write-WeinviewSimulationJson $receipt $session
   [IO.File]::Copy($source,$session.runtime_cxob_path,$false)
   if((Get-WeinviewSimulationHash $session.runtime_cxob_path) -cne $session.cxob_sha256){throw 'cMT isolated source copy differs.'}
   $helper=Get-WeinviewSimulationPath (Join-Path $BridgeRoot 'EventTableCodec\source\event_table_codec.py')
   if(!(Test-Path -LiteralPath $helper -PathType Leaf)){throw 'Bundled CXOB codec source missing.'}
   Write-WeinviewSimulationJson $session.unpack_request_path @{operation='cxob-unpack';input=$session.runtime_cxob_path;expected_sha256=$session.cxob_sha256;output_root=(Join-Path $runtime 'unpacked')}
   $null=& (Join-Path $BridgeRoot 'EventTableCodec\Invoke-EventTableCodec.ps1') -RequestPath $session.unpack_request_path -ResponsePath $session.unpack_response_path
   $unpacked=Read-WeinviewSimulationJson $session.unpack_response_path
   $unpackRoot=Get-WeinviewSimulationPath (Join-Path $runtime 'unpacked')
   $actualProject=Get-WeinviewSimulationPath ([string]$unpacked.result.project_path)
   $allowedProjects=@((Join-Path $unpackRoot 'mt8000\project'),(Join-Path $unpackRoot 'project'))
   if(!$unpacked.ok -or !$unpacked.result.source_unchanged -or $unpacked.result.input_sha256 -cne $session.cxob_sha256 -or $unpacked.result.output_root -ine $unpackRoot -or $actualProject -notin $allowedProjects -or !(Test-Path -LiteralPath $actualProject -PathType Leaf) -or (Get-Item -LiteralPath $actualProject).Length -le 0 -or @($unpacked.result.executables_run).Count){throw 'Actual safe unpack evidence differs.'}
   $session.project_path=$actualProject
   foreach($file in @($unpacked.result.files)){
    $path=Get-WeinviewSimulationPath $file.path
    if(!$path.StartsWith((Join-Path $runtime 'unpacked')+'\',[StringComparison]::OrdinalIgnoreCase) -or (Get-WeinviewSimulationHash $path) -cne $file.sha256 -or (Get-Item -LiteralPath $path).Length -ne $file.bytes){throw 'Unpacked actual file evidence differs.'}
   }
   $session.project_sha256=Get-WeinviewSimulationHash $session.project_path;$session.unpack_response_sha256=Get-WeinviewSimulationHash $session.unpack_response_path;$session.unpack_verified=$true
   if($session.project_sha256 -cne $unpacked.result.project_sha256){throw 'Unpacked actual project SHA differs.'}
   Assert-WeinviewCmtFiles $session;Assert-WeinviewCmtAvailable
   $session.state='starting';Write-WeinviewSimulationJson $receipt $session
   $viewerMode=if($mode -ceq 'online'){'-ns'}else{'-fs'}
   # Keep the vendor's renderer preference usable from the isolated runtime.
   # Qt otherwise cannot find opengl32sw.dll when Software render is selected.
   $previousOpenGlDll=$env:QT_OPENGL_DLL
   try {
    $softwareRenderer=Join-Path $installed 'opengl32sw.dll'
    if([string]::IsNullOrWhiteSpace($previousOpenGlDll) -and (Test-Path -LiteralPath $softwareRenderer -PathType Leaf)){$env:QT_OPENGL_DLL=$softwareRenderer}
    # This is the interactive simulator requested by the user.
    $viewer=Start-Process -FilePath $dependencies[0].path -ArgumentList ($viewerMode+' "'+$session.project_path+'" -allinone') -WorkingDirectory $runtime -WindowStyle Normal -PassThru
   }finally{$env:QT_OPENGL_DLL=$previousOpenGlDll}
   $null=$viewer.Handle;$viewerTicks=$viewer.StartTime.ToUniversalTime().Ticks
   $native=Get-CimInstance Win32_Process -Filter ('ProcessId='+$viewer.Id) -OperationTimeoutSec 3
   $session.processes=@([ordered]@{pid=$viewer.Id;parent_pid=$PID;exe_path=$dependencies[0].path;creation_utc_ticks=$viewerTicks;command_line=$native.CommandLine;exe_sha256=$dependencies[0].sha256});Write-WeinviewSimulationJson $receipt $session
   if(!$native -or $native.ParentProcessId -ne $PID -or $native.ExecutablePath -ine $dependencies[0].path -or !$native.CommandLine.Contains($session.project_path)){throw 'cMT launcher identity differs.'}
   $unknownEvidence=Join-Path $folder 'startup-unknown-descendants.json';$unknownObserved=@();$unknownSeen=New-Object 'Collections.Generic.HashSet[string]'
   $deadline=[DateTime]::UtcNow.AddSeconds(15)
   do{
    if($viewer.HasExited){throw 'cMT Viewer exited before ownership capture.'}
    $children=@(Get-CimInstance Win32_Process -Filter ('ParentProcessId='+$viewer.Id) -OperationTimeoutSec 3)
    foreach($child in $children){
     if(@($session.processes|Where-Object {$_.pid -eq $child.ProcessId}).Count){continue}
     $dependency=@($dependencies|Where-Object {$_.path -ieq $child.ExecutablePath -and $_.name -cne 'cMTViewer.exe'})
     if($dependency.Count -ne 1){
      $unknownKey=([string]$child.ProcessId)+'|'+([string]$child.ExecutablePath)+'|'+([string]$child.CommandLine)
      if($unknownSeen.Add($unknownKey)){
       $unknownObserved+=,[ordered]@{pid=[int]$child.ProcessId;path=$child.ExecutablePath;name=$child.Name;cmd=$child.CommandLine;parent=[int]$child.ParentProcessId}
       Write-WeinviewSimulationJson $unknownEvidence @($unknownObserved)
      }
      continue
     }
     $process=[Diagnostics.Process]::GetProcessById([int]$child.ProcessId);$null=$process.Handle
     $session.processes+=,[ordered]@{pid=$process.Id;parent_pid=[int]$child.ParentProcessId;exe_path=$dependency[0].path;creation_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;command_line=$child.CommandLine;exe_sha256=$dependency[0].sha256};Write-WeinviewSimulationJson $receipt $session
    }
    $unregistered=@($children|Where-Object {$_.ProcessId -notin @($session.processes.pid)})
    if($session.processes.Count -eq 3 -and !$unregistered.Count){break};Start-Sleep -Milliseconds 150
   }while([DateTime]::UtcNow -lt $deadline)
   if($unregistered.Count){throw ('Unknown cMT descendants still live after bounded wait; evidence='+$unknownEvidence)}
   if($session.processes.Count -ne 3 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'com_c30.exe'}).Count -ne 1 -or @($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'dserver.exe'}).Count -ne 1){throw 'cMT exact three owners unavailable.'}
   $live=@(Complete-WeinviewCmtStartEvidence $session $BridgeRoot $deadline)
   $null=Show-WeinviewCmtViewer $session
   $session.state='running';$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
   return (Get-WeinviewCmtResult $session $live $action $true)
  }
  $id=[string]$Arguments.session_id;if($id -cnotmatch '^[a-f0-9]{32}$'){throw 'Opaque cMT session_id required.'}
  $folder=Get-WeinviewSimulationPath (Join-Path $registry $id);$receipt=Join-Path $folder 'session.json';$session=Read-WeinviewSimulationJson $receipt
  if(!(($session.schema -eq 1 -and $session.profile -ceq 'weinview-cn421-cmt-viewer-offline-v1' -and $session.kind -ceq 'weinview-owned-cmt-offline-simulation') -or ($session.schema -eq 2 -and $session.profile -ceq 'weinview-cn421-cmt-viewer-owned-offline-v2' -and $session.kind -ceq 'weinview-owned-cmt-offline-simulation') -or ($session.schema -eq 2 -and $session.profile -ceq 'weinview-cn421-cmt-viewer-owned-online-v1' -and $session.kind -ceq 'weinview-owned-cmt-online-simulation' -and $session.mode -ceq 'online')) -or $session.session_id -cne $id -or $session.workspace_root -ine $root -or $session.runtime_path -ine (Join-Path $folder 'runtime') -or $session.session_record -ine $receipt -or $session.runtime_cxob_path -ine (Join-Path $session.runtime_path 'PLCCode-owned.cxob') -or ($session.project_path -ine (Join-Path $session.runtime_path 'unpacked\mt8000\project') -and $session.project_path -ine (Join-Path $session.runtime_path 'unpacked\project'))){throw 'Invalid cMT registry session.'}
  Assert-WeinviewCmtDependencies $session $Installation $BridgeRoot
  $live=@(Get-WeinviewCmtProcesses $session);Assert-WeinviewCmtFiles $session (!$live.Count)
  if($action -ceq 'status' -and $session.state -ceq 'start_incomplete' -and $session.processes.Count -eq 3 -and $live.Count -eq 3){
   $priorError=[string]$session.last_error
   $reconcilePath=Join-Path $folder ('status-reconciliation-'+[Guid]::NewGuid().ToString('N')+'.json')
   Write-WeinviewSimulationJson $reconcilePath @{session_id=$id;original_start_succeeded=$false;original_error=$priorError;processes=@($session.processes);source_sha256=$session.cxob_sha256;phase='before_original_owner_reconciliation';input_performed=$false}
   $live=@(Complete-WeinviewCmtStartEvidence $session $BridgeRoot)
   $session.state='running'
   Write-WeinviewSimulationJson $reconcilePath @{session_id=$id;original_start_succeeded=$false;original_error=$priorError;processes=@($session.processes);source_sha256=$session.cxob_sha256;phase='original_owner_reconciliation_complete';generated_xob=$session.generated_xob;input_performed=$false}
  }
  if($action -ceq 'stop'  -and $live.Count){
   if(@(Get-Process -Name EasyWatch -ErrorAction SilentlyContinue).Count){throw 'Active Watch preserved; close it before Viewer stop.'}
   if(!('PLCCode.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $BridgeRoot 'NativeControls.cs')}
   $session.windows=Get-WeinviewCmtWindows $session -AllowSelectorPopup $true;$session.main_hwnd=$session.windows.main.Hwnd;$observers=@($live)
   $viewer=@($session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})[0]
   $session.state='stopping';$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
   [PLCCode.Weinview.CmtLifecycleMessage]::Close([long]$session.main_hwnd,[int]$viewer.pid,[long]$viewer.creation_utc_ticks,[string]$viewer.exe_path)
   $deadline=[DateTime]::UtcNow.AddSeconds(15)
   do{$remaining=@($observers|Where-Object {!$_.WaitForExit(0)});if(!$remaining.Count){break};Start-Sleep -Milliseconds 150}while([DateTime]::UtcNow -lt $deadline)
   $session.owned_exit_codes=@(foreach($record in @($session.processes)){
    $observer=@($observers|Where-Object {$_.Id -eq $record.pid});$exited=($observer.Count -eq 1 -and $observer[0].WaitForExit(0))
    @{pid=[int]$record.pid;ticks=[long]$record.creation_utc_ticks;exe=[string]$record.exe_path;exit_code=if($exited){[int]$observer[0].ExitCode}else{$null};exit_code_verified=$exited;reason=if($exited){'exit_code_read'}else{'not_observed_or_running'}}
   })
   $live=@(Get-WeinviewCmtProcesses $session);$session.normal_close_verified=(!$live.Count)
   $session.normal_exit_verified=($session.processes.Count -eq 3 -and !@($session.owned_exit_codes|Where-Object {!$_.exit_code_verified -or $_.exit_code -ne 0}).Count)
   $session.state=if(!$live.Count){'stopped'}else{'stop_incomplete'}
  }elseif($action -ceq 'stop'){$session.state='stopped'}
  elseif(!$live.Count -and $session.state -cne 'stopped'){$session.state='exited'}
  elseif($live.Count -ne 3){$session.state='partial'}
  Assert-WeinviewCmtFiles $session (!$live.Count);$session.updated_utc=[DateTime]::UtcNow.ToString('o');Write-WeinviewSimulationJson $receipt $session
  return (Get-WeinviewCmtResult $session $live $action ($action -cne 'stop' -or !$live.Count))
 }catch{
  $message=$_.Exception.Message
  if($locked -and $session -and $receipt){
   try{if($session -is [Collections.IDictionary]){$session.last_error=$message;$session.updated_utc=[DateTime]::UtcNow.ToString('o');if($action -ceq 'start'){$session.state='start_incomplete'}}else{Add-Member -InputObject $session -MemberType NoteProperty -Name last_error -Value $message -Force};Write-WeinviewSimulationJson $receipt $session}catch{}
   throw ('weinview_simulation_reconcile: session_id='+$session.session_id+'; record='+$receipt+'; '+$message)
  };throw
 }finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
}
function Invoke-WeinviewSimulationLifecycle($Arguments,$Installation,[string]$BridgeRoot) {
 if($Arguments.action -ceq 'start'){
  if($Arguments.cxob_path -or $Arguments.expected_cxob_sha256){return (Invoke-WeinviewCmtSimulation $Arguments $Installation $BridgeRoot)}
 }elseif($Arguments.action -cin @('status','stop','select_window')){
  $root=Get-WeinviewSimulationPath ([string]$Arguments.workspace_root);$id=[string]$Arguments.session_id
  if($id -cnotmatch '^[a-f0-9]{32}$'){throw 'Opaque simulation session_id required.'}
  $saved=Read-WeinviewSimulationJson (Join-Path $root ('.weinview-simulations\'+$id+'\session.json'))
  if($saved.kind -cin @('weinview-owned-cmt-offline-simulation','weinview-owned-cmt-online-simulation')){
   if($Arguments.action -ceq 'select_window'){return (Invoke-WeinviewCmtWindowSelect $Arguments $Installation)}
   return (Invoke-WeinviewCmtSimulation $Arguments $Installation $BridgeRoot)
  }
 }
 return (Invoke-WeinviewSimulation $Arguments $Installation)
}
