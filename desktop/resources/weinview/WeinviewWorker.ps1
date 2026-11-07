# Windows PowerShell 5.1; one request, one receipt. No GUI work until preflight passes.
$ErrorActionPreference = 'Stop'
$env:PLCCODE_WEINVIEW_QT_ELEMENT_BRIDGE=Join-Path $PSScriptRoot 'QtElementBridge.exe'
. (Join-Path $PSScriptRoot 'QtElementAction.ps1')


$stage = 'request'; $mutation = 'none'; $own = @(); $request = $null; $compileMessages = @(); $activationEvidence=@(); $reopenVerified=$false; $saved=$null; $verifiedSourceSha256=$null; $lastControlId=$null; $lastControlParent=$null; $lastControlAction=$null; $closeAcknowledged=$false; $closeAcknowledgedHwnd=0
$profileHash = '59FB29D8A4AA96A3F2DAD7E59301E6EE7197C6D43AB1BF79C0F135BC1EAF8F86'
$interactiveTemplateHash = 'C1D18CB4743EE28A3606C475BDE6CE1943793E220529A81BCB130997663473B3'
. (Join-Path $PSScriptRoot 'NativeHostLaunch.ps1')
$projectOpenNotices=@()
$editorSessionMode=$false;$editorSessionContext=$null;$editorOwnedSession=$null;$editorFailure=$null

function Write-WeinviewProgress([string]$Stage,[string]$Label,[string]$Status='running') {
 if(!$request -or !$request.id){return}
 try {
  if(!$script:weinviewProgressWriter){
   $script:weinviewProgressWriter=New-Object IO.StreamWriter([Console]::OpenStandardError(),(New-Object Text.UTF8Encoding($false)))
   $script:weinviewProgressWriter.AutoFlush=$true
  }
  $payload=@{request_id=$request.id;operation=$request.operation;stage=$Stage;label=$Label;status=$Status}
  $script:weinviewProgressWriter.WriteLine('[weinview-progress]'+($payload|ConvertTo-Json -Compress))
 }catch{}
}

function Fail([string]$message) { throw $message }
function Hash([string]$path) {
 $stream=[IO.File]::OpenRead($path); $algorithm=[Security.Cryptography.SHA256]::Create()
 try { return [BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','') } finally {$algorithm.Dispose();$stream.Dispose()}
}
function SafePath([string]$path) {
 if ([string]::IsNullOrWhiteSpace($path) -or $path -notmatch '^[A-Za-z]:\\' -or $path.Substring(2).Contains(':') -or $path.Contains('"')) { Fail 'Absolute local path without ADS required.' }
 $full = [IO.Path]::GetFullPath($path)
 $cursor = $full
 while ($cursor -and $cursor.Length -gt 3) {
  if (Test-Path -LiteralPath $cursor) { if ((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { Fail 'Reparse points are forbidden.' } }
  $cursor = [IO.Path]::GetDirectoryName($cursor)
 }
 return $full
}
function Workspace([string]$path) {
 $p = SafePath $path
 if ($p.Length -le 3 -or $p -match '(?i)(^|\\)(staging|runtime)(\\|$)' -or !(Test-Path -LiteralPath $p -PathType Container)) { Fail 'Existing non-runtime workspace directory required.' }
 return $p.TrimEnd('\')
}
function Under([string]$path,[string]$root) {
 $p = SafePath $path
 if (!$p.StartsWith($root + '\',[StringComparison]::OrdinalIgnoreCase)) { Fail 'Path must be inside workspace_root.' }
 return $p
}
function Get-WeinviewRecipePython {
 $bundled=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\engine\python\python.exe'))
 if(Test-Path -LiteralPath $bundled -PathType Leaf){return $bundled}
 # Source-tree runs reuse the current isolated DEMO runtime; a packaged Worker
 # always resolves its own adjacent runtime above.
 $sourceRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
 $locations=Join-Path $sourceRoot '.local\project-locations.json'
 $channel=Join-Path $sourceRoot '.local\builds\demo5\channel-state.json'
 if(!(Test-Path -LiteralPath $locations -PathType Leaf) -or !(Test-Path -LiteralPath $channel -PathType Leaf)){Fail 'Bundled native Recipe Database SQLite runtime required.'}
 $project=Get-Content -LiteralPath $locations -Raw -Encoding UTF8|ConvertFrom-Json
 if([string]$project.projectRoot -cne $sourceRoot){Fail 'Source project root differs from local runtime manifest.'}
 $state=Get-Content -LiteralPath $channel -Raw -Encoding UTF8|ConvertFrom-Json
 $current=[IO.Path]::GetFullPath([string]$state.current)
 $buildRoot=[IO.Path]::GetFullPath((Join-Path $sourceRoot '.local\builds\demo5'))
 if(!$current.StartsWith($buildRoot+'\',[StringComparison]::OrdinalIgnoreCase)){Fail 'Current isolated DEMO runtime path is outside project builds.'}
 $python=Join-Path ([IO.Path]::GetDirectoryName($current)) 'resources\engine\python\python.exe'
 if(!(Test-Path -LiteralPath $python -PathType Leaf)){Fail 'Bundled native Recipe Database SQLite runtime required.'}
 return $python
}
function Read-WeinviewAssociatedRecipeCatalog([string]$ProjectPath,[string]$ProjectSha256,[string]$WorkspaceRoot,[string]$Prefix,[string]$PythonExe) {
 $recordPath=Join-Path $WorkspaceRoot '.plccode-weinview-project.json'
 if(!(Test-Path -LiteralPath $recordPath -PathType Leaf)){return $null}
 $record=Get-Content -LiteralPath $recordPath -Raw -Encoding UTF8|ConvertFrom-Json
 if($record.project_path -ine $ProjectPath -or $record.project_sha256 -ine $ProjectSha256){return $null}
 $matches=@($record.associated_resources|Where-Object {$_.kind -ceq 'recipe_database' -and $_.path -is [string] -and $_.sha256 -match '^[A-Fa-f0-9]{64}$'})
 if($matches.Count -ne 1){return $null}
 $db=Under ([string]$matches[0].path) $WorkspaceRoot
 if(!(Test-Path -LiteralPath $db -PathType Leaf)){return $null}
 $requestPath=$Prefix+'.catalog-request.json';$receiptPath=$Prefix+'.catalog-receipt.json'
 @{operation='read';source_db=$db;offset=0;limit=1}|ConvertTo-Json -Depth 4|Set-Content -LiteralPath $requestPath -Encoding UTF8
 $read=Invoke-WeinviewRecipeDatabaseCodec $PythonExe $requestPath $receiptPath
 if($read.source_sha256 -ine [string]$matches[0].sha256){return $null}
 $fields=@{}
 foreach($entry in $read.recipes.PSObject.Properties){
  $names=@($entry.Value.columns|ForEach-Object {[string]$_.name})
  if(!$entry.Name -or $names.Count -lt 1 -or @($names|Select-Object -Unique).Count -ne $names.Count){throw 'Associated native Recipe Database definition is incomplete'}
  $fields[[string]$entry.Name]=$names
 }
 return [pscustomobject]@{path=$db;source_sha256=[string]$read.source_sha256;fields=$fields}
}
function ResolveInstallation($a,[bool]$write,[bool]$nativeModelFlow=$false,[bool]$nativeEditorFlow=$false) {
 $candidates = New-Object 'Collections.Generic.List[string]'
 if ($a.exe_path) { $candidates.Add([string]$a.exe_path) }
 try {
  $prog = (Get-Item 'Registry::HKEY_CLASSES_ROOT\.emtp').GetValue('')
  $command = (Get-Item ('Registry::HKEY_CLASSES_ROOT\' + $prog + '\shell\open\command')).GetValue('')
  if ($command -match '^"([^"]+\.exe)"') { $candidates.Add($Matches[1]) }
 } catch {}
 foreach ($key in @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall','HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall','HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall')) {
  if (Test-Path $key) { foreach ($item in Get-ItemProperty ($key+'\*') -ErrorAction SilentlyContinue) { if ($item.DisplayName -match 'EasyBuilder Pro' -and $item.InstallLocation) { $candidates.Add((Join-Path $item.InstallLocation 'EasyBuilder Pro.exe')) } } }
 }
 $found = @()
 $seen = New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
 foreach ($candidate in @($candidates | Select-Object -Unique)) {
  try { $exe = SafePath $candidate; if (!$seen.Add($exe)) {continue}; if (!(Test-Path -LiteralPath $exe -PathType Leaf)) { continue }; $v = [Diagnostics.FileVersionInfo]::GetVersionInfo($exe); if ($v.ProductName -ne 'EasyBuilder Pro') { continue }
   $sig = Get-AuthenticodeSignature -LiteralPath $exe; $h = Hash $exe
   $found += [pscustomobject]@{exe_path=$exe;version=$v.FileVersion;sha256=$h;signature_status=[string]$sig.Status;signer=if($sig.SignerCertificate){$sig.SignerCertificate.Subject}else{''};profile_421=($h -eq $profileHash);tools=@(Get-ChildItem -LiteralPath ([IO.Path]::GetDirectoryName($exe)) -Filter '*.exe' | Select-Object -ExpandProperty Name)}
  } catch { if ($a.exe_path -and $candidate -eq $a.exe_path) { throw } }
 }
 if ($write) { $found = @($found | Where-Object { $_.signature_status -eq 'Valid' -and $_.signer -match '(?i)WEINTEK' -and (!$a.exe_path -or $_.exe_path -ieq $a.exe_path) -and ($nativeModelFlow -or $nativeEditorFlow -or $_.profile_421) -and ((!$nativeModelFlow -and !$nativeEditorFlow) -or (Test-Path -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($_.exe_path)) 'Config.xml') -PathType Leaf)) }); if ($found.Count -ne 1) { Fail 'One valid signed installation with the requested native capability required; specify exe_path.' } }
 return $found
}
function WaitFor([scriptblock]$predicate,[int]$seconds=30) {
 $limit=[DateTime]::UtcNow.AddSeconds($seconds)
 do { $value = & $predicate; if ($value) { return $value }; Start-Sleep -Milliseconds 150 } while ([DateTime]::UtcNow -lt $limit)
 Fail ('Timed out at ' + $script:stage)
}
function Resolve-WeinviewOwnedProjectOpenNotices($Session,[long]$MainHwnd) {
 # Opening an older project can post these notices after its document appears.
 # Keep original font names; report the missing fonts instead of substituting.
 $deadline=[DateTime]::UtcNow.AddSeconds(6);$handled=$false;$actions=@{}
 do {
  $windows=@($Session.native.EnumTopWindows())
  $main=@($windows|Where-Object {$_.Hwnd -eq $MainHwnd -and $_.Class -ceq 'EasyBuilderPro'})
  if($main.Count -ne 1){throw 'Owned project main disappeared while opening.'}
  $dialogs=@($windows|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770'})
  if($dialogs.Count -gt 1){return}
  if($dialogs.Count -eq 1){
   $dialog=$dialogs[0];$key=[string]$dialog.Hwnd+':'+$dialog.Title
   if($dialog.Title -ceq '工程文件迁移报告'){
    if(!('PLCCode.Weinview.NativeSemanticControls' -as [type])){return}
    if(!$actions.ContainsKey($key)){
     $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
     $notice=$semantic.TryCloseProjectMigrationReport($MainHwnd)
     if($notice){$script:projectOpenNotices+=@{kind='migration_report';details=$notice;warnings_reviewed=$false};$actions[$key]=$true;$handled=$true}
    }
   }elseif($dialog.Title -ceq '置换字体'){
    if(!$actions.ContainsKey($key)){
     $fields=@($Session.native.EnumChildControls($dialog.Hwnd))
     if(!@($fields|Where-Object {$_.Visible -and $_.Class -ceq 'Static' -and $_.Title -ceq '这些字体未被安装于此计算机, 将被下面的字体替换:'}).Count){return}
     $Session.native.ClickButton($dialog.Hwnd,2,'取消')
     $script:projectOpenNotices+=@{kind='font_replacement';action='cancel_substitution';dialog_title=$dialog.Title}
     $actions[$key]=$true;$handled=$true
    }
   }elseif($dialog.Title -ceq 'EasyBuilder Pro'){
    $body=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Static' -and $_.Id -eq 65535})
    if($body.Count -ne 1 -or $body[0].Title -cnotmatch '^是否要忽略未安装的字体 \[([^\r\n]+)\] \?$'){return}
    $font=$Matches[1];$key+=':'+$font
    if(!$actions.ContainsKey($key)){
     $Session.native.ClickButton($dialog.Hwnd,6,'是(&Y)')
     $script:projectOpenNotices+=@{kind='missing_font';font_name=$font;action='ignore_missing_font';rendering_verified=$false}
     $actions[$key]=$true;$handled=$true
    }
   }else{return}
  }elseif($main[0].Enabled -or !$handled){return}
  if(!$handled){return}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $deadline)
 throw 'Project opening notices did not close; original font names were retained.'
}
function StartOwned([string]$exe,[string]$path,[bool]$ActivateForeground=$true,[bool]$AllowWindowless=$false,[int]$NativeHostPort=0,[bool]$RecoverBootstrapCrash=$false) {
 Write-WeinviewProgress 'open_project' '正在打开原厂工程'
 if($NativeHostPort -lt 0 -or $NativeHostPort -gt 65535){Fail 'Native host port outside local TCP range.'}
 $hostScope=if($NativeHostPort){Enter-WeinviewNativeHostLaunch $exe $NativeHostPort}else{$null}
 try {
 $startupErrorDialogs=if($RecoverBootstrapCrash){[PLCCode.Weinview.NativeStartupRecovery]::ExistingDialogs()}else{@()}
 $p = if($ActivateForeground){Start-Process -FilePath $exe -ArgumentList ('"'+$path+'"') -PassThru}else{Start-Process -FilePath $exe -ArgumentList ('"'+$path+'"') -WindowStyle Hidden -PassThru}
 $null=$p.Handle
 $ticks=$p.StartTime.ToUniversalTime().Ticks
 $script:own += @{pid=$p.Id;creation_utc_ticks=$ticks;exe_path=$exe}
 $native = New-Object PLCCode.Weinview.NativeControls($p.Id,$ticks,$exe,1500)
 $script:pendingOwnedSession=@{process=$p;native=$native;main=$null;project_path=$path;native_host_port=$NativeHostPort}
 $script:stage='owned_input_idle'
 if(!$p.WaitForInputIdle(10000)){Fail 'Owned application did not reach bounded message-loop input idle.'}
 $stem=[IO.Path]::GetFileNameWithoutExtension($path)
 $script:stage='owned_document_ready'
 try {$main=WaitFor {
  if($p.HasExited){Fail ('Owned application exited before document became ready; pid='+$p.Id+'; exit_code='+$p.ExitCode)}
  if($RecoverBootstrapCrash -and !$script:pendingOwnedSession.startup_error_acknowledged){
   $startupError=[PLCCode.Weinview.NativeStartupRecovery]::Acknowledge($p.Id,$ticks,$exe,[long[]]$startupErrorDialogs)
   if($startupError){
    $script:pendingOwnedSession.startup_error_acknowledged=$startupError
    $null=$p.WaitForExit(3000)
    if($p.HasExited){Fail ('Owned bootstrap exited after fatal startup dialog; pid='+$p.Id+'; exit_code='+$p.ExitCode)}
   }
  }
  $opening=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title.Contains($stem)})
  if($opening.Count -eq 1 -and !$opening[0].Enabled){Resolve-WeinviewOwnedProjectOpenNotices $script:pendingOwnedSession $opening[0].Hwnd}
  $windows=@($native.EnumTopWindows() | Where-Object {$_.Visible -and $_.Enabled -and $_.Class -eq 'EasyBuilderPro' -and $_.Title.Contains($stem)})
  if($windows.Count -gt 1){Fail 'Main window is not unique.'}
  if($windows.Count -eq 1){
   $dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'})
   if($dialogs.Count){Fail 'Unknown dialog during owned project startup; no acknowledgement performed.'}
   $views=@($native.EnumChildControls($windows[0].Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -eq 'AfxFrameOrView140u' -and $_.Visible -and $_.Enabled -and $_.Title -and $windows[0].Title.Contains($_.Title)})
   if($views.Count -gt 1){Fail 'Loaded document view is not unique.'}
   if($views.Count -eq 1){return $windows[0]}
   if($AllowWindowless -and $views.Count -eq 0){return $windows[0]}
  }
 }} catch {
  if($p.HasExited){Fail ('Owned application exited before document became ready; pid='+$p.Id+'; exit_code='+$p.ExitCode)}
  if($_.Exception.Message -notlike 'Timed out at owned_document_ready*'){throw}
  $snapshot=@{pid=$p.Id;has_exited=$p.HasExited;responding=if($p.HasExited){$false}else{$p.Responding};expected_stem=$stem;windows=@();other_ide_pids=@(Get-Process 'EasyBuilder Pro' -ErrorAction SilentlyContinue|Where-Object {$_.Id -ne $p.Id}|Select-Object -ExpandProperty Id)}
  try {
   $snapshot.windows=@(foreach($w in $native.EnumTopWindows()|Where-Object {$_.Visible -and ($_.Class -eq 'EasyBuilderPro' -or $_.Class -eq '#32770')}){
    $views=@();if($w.Class -eq 'EasyBuilderPro'){$views=@($native.EnumChildControls($w.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -eq 'AfxFrameOrView140u'}|ForEach-Object {@{hwnd=$_.Hwnd;title=$_.Title;visible=$_.Visible;enabled=$_.Enabled;title_in_main=$w.Title.Contains($_.Title)}})}
    @{hwnd=$w.Hwnd;class=$w.Class;title=$w.Title;visible=$w.Visible;enabled=$w.Enabled;title_has_stem=$w.Title.Contains($stem);views=$views}
   })
  } catch {$snapshot.window_query_error=$_.Exception.Message}
  Fail ('Timed out at owned_document_ready; snapshot='+($snapshot|ConvertTo-Json -Compress -Depth 6))
 }
 $script:pendingOwnedSession.main=$main
 $script:stage=if($ActivateForeground){'activate_owned_output'}else{'observe_owned_output'}
 $pidActivated=$false
 try {
  if($ActivateForeground){
   # Request foreground for the exact new vendor PID before the HWND/thread guard.
   # The same COM request is used by the existing native ribbon entry after reopen.
   $shell=New-Object -ComObject WScript.Shell
   try{$pidActivated=[bool]$shell.AppActivate([int]$p.Id)}finally{[Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)|Out-Null}
  }
  $activation=if($ActivateForeground){$native.ActivateOwnedMain($main.Hwnd)}else{@{activated=$false;mode='owned-semantic-background'}}
 }catch{
  $script:activationEvidence+=@{pid=$p.Id;creation_utc_ticks=$ticks;path=$path;input_idle=$true;pid_app_activate_returned=$pidActivated;activation_failed=$_.Exception.Message}
  throw
 }
 $script:activationEvidence+=@{pid=$p.Id;creation_utc_ticks=$ticks;path=$path;input_idle=$true;pid_app_activate_returned=$pidActivated;activation=$activation}
 if($NativeHostPort){
  $script:stage='owned_native_host_ready'
  $null=WaitFor {
   if($p.HasExited){Fail 'Owned application exited before native host CDP became ready.'}
   if(Test-WeinviewNativeHostPort -Port $NativeHostPort){return $true}
  } 10
 }
 return $script:pendingOwnedSession
 } finally {if($hostScope){Exit-WeinviewNativeHostLaunch $hostScope}}
}
function ReadyControls($s,$d,$specs) {
 $children=@($s.native.EnumChildControls($d.Hwnd))
 foreach($spec in $specs){
  $items=@($children|Where-Object {$_.Id -eq $spec.id})
  if($items.Count -gt 1){Fail 'Reviewed control ID is not unique.'}
  if(!$items.Count){return $false}
  $item=$items[0]; $classOk=if($spec.prefix){$item.Class.StartsWith($spec.class,[StringComparison]::Ordinal)}else{$item.Class -ceq $spec.class}
  if(!$classOk -or ($spec.label -and $item.Title -and $item.Title -cne $spec.label)){Fail 'Reviewed control class/label does not match.'}
  if(!$item.Visible -or (!$spec.allow_disabled -and !$item.Enabled) -or ($spec.label -and !$item.Title)){return $false}
 }
 return $true
}
function Dialog($session,[string]$title) {
 $specs=if($title -eq '宏指令'){
  @(@{id=1014;class='ListBox'},@{id=1015;class='ListBox'},@{id=1012;class='Button';label='新增...'},@{id=2;class='Button';label='离开'},@{id=3;class='Button';label='编辑';allow_disabled=$true})
 }else{Fail 'Dialog readiness profile is not reviewed.'}
 WaitFor {
  $all=@($session.native.EnumTopWindows() | Where-Object {$_.Visible -and $_.Class -eq '#32770'}); $match=@($all | Where-Object {$_.Title -eq $title})
  if(@($all | Where-Object {$_.Title -ne $title}).Count){Fail 'Unknown modal dialog; no acknowledgement performed.'}
  if($match.Count -gt 1){Fail 'Dialog is not unique.'}
  if($match.Count -eq 1 -and (ReadyControls $session $match[0] $specs)){return $match[0]}
 }
}
function Button($s,$d,[int]$id,[string]$label) {
 WaitFor {if(ReadyControls $s $d @(@{id=$id;class='Button';label=$label})){return $true}} | Out-Null
 $s.native.ClickButton($d.Hwnd,$id,$label)
}
function Control($s,$d,[int]$id,[string]$class) {
 $script:lastControlId=$id; $script:lastControlParent=$d.Hwnd; $script:lastControlAction='FindUniqueControlWithoutLabel'
 $s.native.FindUniqueControlWithoutLabel($d.Hwnd,$id,$class)
}
function Manager($s) { $s.native.PostMenuCommand($s.main.Hwnd,0x8161); Dialog $s '宏指令' }
function Parse-WeinviewMacroListRow([string]$Item,[int]$ControlId,[int]$Index) {
 # CN421 decorates scheduled macros, e.g. [ID : 000] {I, P}\tName.
 # This decoration is opaque navigation evidence. EBM is authoritative for
 # startup, period and interlock; do not infer execution from list markers.
 if($Item -cnotmatch '^\[ID\s*:\s*(\d{1,3})\](?: \{([A-Z](?:, [A-Z]){0,15})\})?\t(.*)$'){Fail 'Unrecognized native macro list item.'}
 $id=[int]$Matches[1];$annotation=$Matches[2];$name=$Matches[3]
 if($id -gt 254 -or $ControlId -notin @(1014,1015) -or $Index -lt 0){Fail 'Native macro ID/list/index outside reviewed bounds.'}
 if($annotation){$flags=@($annotation -split ', ');if(@($flags|Select-Object -Unique).Count -ne $flags.Count){Fail 'Duplicate native macro list marker.'}}
 return @{list_control_id=$ControlId;index=$Index;id=$id;name=$name;raw_label=$Item;status_annotation=$annotation}
}
function ListRows($s,$d) {
 $rows=@()
 foreach($controlId in @(1014,1015)) {
  $items=@($s.native.GetListBoxItems((Control $s $d $controlId 'ListBox').Hwnd))
  for($index=0;$index -lt $items.Count;$index++) {
   $rows+=Parse-WeinviewMacroListRow $items[$index] $controlId $index
  }
 }
 return ,$rows
}
function CloseSession($s,[string]$path,[string]$savedHash,[bool]$readOnlyReopen,[bool]$ReportExitStatus=$false) {
 Write-WeinviewProgress 'close_project' '正在关闭本次原厂会话'
 if((Hash $path) -ne $savedHash){Fail 'Saved output hash changed before normal close.'}
 $s.native.CloseMainWindow($s.main.Hwnd)
 $acknowledged=$false; $acknowledgedHwnd=0; $script:closeAcknowledged=$false; $script:closeAcknowledgedHwnd=0; $deadline=[DateTime]::UtcNow.AddSeconds(15)
 while(!$s.process.WaitForExit(150)){
  # Keep the original Process/handle. Normal WM_CLOSE may finish between a
  # poll and window enumeration; a vanished HWND/PID alone is never success.
  if($s.process.WaitForExit(0)){break}
  try {$windows=@($s.native.EnumTopWindows());$dialogs=@($windows|Where-Object {$_.Visible -and $_.Class -eq '#32770'})}
  catch {
   # WM_CLOSE can destroy HWNDs before the original process finishes exiting.
   # This grace applies only to enumeration after the verified saved close;
   # unrelated modal/identity errors elsewhere are never swallowed.
   if($s.process.WaitForExit(1000)){break}
   throw
  }
  if($s.process.WaitForExit(0)){break}
  if($dialogs.Count){
   if(!$readOnlyReopen -or $dialogs.Count -ne 1 -or $dialogs[0].Title -ne 'EasyBuilder Pro' -or ($acknowledged -and $dialogs[0].Hwnd -ne $acknowledgedHwnd)){Fail 'Unknown normal-close dialog; no acknowledgement performed.'}
   $d=$dialogs[0]
   $expected='是否保存对 '+[IO.Path]::GetFileNameWithoutExtension($path)+' 的更改?'
   if($acknowledged){
    # Dismissal may disable/destroy children before the dialog HWND disappears.
    # Read cached captions only; never repeat an interactive lookup or click.
    $captions=@()
    try {$captions=@($s.native.EnumChildControls($d.Hwnd)|Where-Object {$_.Id -eq 65535 -and $_.Class -eq 'Static'})}
    catch {
     if($s.process.WaitForExit(1000)){break}
     # Optional cached observation can lose children during dismissal. Keep
     # waiting for this acknowledged HWND; next top-level poll rechecks binding.
     if(!$_.Exception.ToString().Contains('Window is absent or belongs to a different process.')){throw}
    }
    if($captions.Count -gt 1 -or ($captions.Count -eq 1 -and $captions[0].Title -and $captions[0].Title -cne $expected) -or (Hash $path) -ne $savedHash){Fail 'Acknowledged read-only close dialog changed identity/body/hash.'}
    if([DateTime]::UtcNow -ge $deadline){Fail 'Acknowledged close dialog did not disappear.'};continue
   }
   $specs=@(@{id=65535;class='Static'},@{id=6;class='Button';label='是(&Y)'},@{id=7;class='Button';label='否(&N)'},@{id=2;class='Button';label='取消'})
   if(!(ReadyControls $s $d $specs)){
    if([DateTime]::UtcNow -ge $deadline){Fail 'Reviewed close dialog controls did not become ready.'}; continue
   }
   $body=$s.native.GetControlText((Control $s $d 65535 'Static').Hwnd,4096)
   if(!$body){if([DateTime]::UtcNow -ge $deadline){Fail 'Reviewed close dialog body did not become ready.'};continue}
   if($body -cne $expected -or (Hash $path) -ne $savedHash){Fail 'Read-only close prompt/path or saved hash does not match.'}
   if(!$acknowledged){$script:lastControlId=7; $script:lastControlParent=$d.Hwnd; $script:lastControlAction='ClickReviewedReadonlyDiscard';$s.native.ClickButton($d.Hwnd,7,'否(&N)'); $acknowledged=$true; $acknowledgedHwnd=$d.Hwnd; $script:closeAcknowledged=$true; $script:closeAcknowledgedHwnd=$d.Hwnd}
  }
  if([DateTime]::UtcNow -ge $deadline){
   # A saved close can destroy the main HWND before its owned process exits.
   # Give that same Process handle one final bounded exit wait only when the
   # current top-level snapshot has neither the old main HWND nor a modal.
   if(!$dialogs.Count -and !@($windows|Where-Object {$_.Hwnd -eq $s.main.Hwnd}).Count){
    if($s.process.WaitForExit(10000)){break}
   }
   Fail 'Owned process did not exit normally; reconcile required.'
  }
 }
 if(!$ReportExitStatus -and $s.process.ExitCode -ne 0){Fail ('Owned process exited with code '+$s.process.ExitCode)}
 if((Hash $path) -ne $savedHash){Fail 'Saved output hash changed during normal close.'}
 if($ReportExitStatus){return @{normal_close_verified=$true;process_exited=$s.process.HasExited;process_exit_code=$s.process.ExitCode;normal_exit_verified=($s.process.ExitCode -eq 0)}}
}
function SaveEditedProject($s,[string]$path,[string]$initialHash,[int]$settleMilliseconds=0,[string]$migrationBackup='',[bool]$AllowUnchanged=$false) {
 Write-WeinviewProgress 'save_project' '正在保存工程'
 if($settleMilliseconds -lt 0 -or $settleMilliseconds -gt 2000){Fail 'Save settle outside bounded range.'}
 $backupPattern='^'+[regex]::Escape((Join-Path ([IO.Path]::GetDirectoryName($path)) ([IO.Path]::GetFileNameWithoutExtension($path))))+'_[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+'+[regex]::Escape([IO.Path]::GetExtension($path))+'$'
 if($migrationBackup){
  if([IO.Path]::GetExtension($path) -inotmatch '^\.(emtp|cmtp)$' -or $migrationBackup -inotmatch $backupPattern -or ((Test-Path -LiteralPath $migrationBackup) -and (Hash $migrationBackup) -cne $initialHash)){Fail 'Same-project old-version migration backup must preserve original bytes.'}
 }
 $state=@{previous=$null;migration_backup=$migrationBackup;acknowledged=$false;dialog_hwnd=0;overwrite_acked=$false;overwrite_hwnd=0}
 # A resumed save can already be waiting at its migration notice. Do not post
 # a command to the disabled main window; the exact notice is handled below.
 $readyMain=@($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $s.main.Hwnd -and $_.Visible -and $_.Enabled})
 if($readyMain.Count -eq 1){$s.native.PostMenuCommand($s.main.Hwnd,0xE103)}
 if($settleMilliseconds){Start-Sleep -Milliseconds $settleMilliseconds}
 $stable=WaitFor {
  $dialogs=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'})
  if($dialogs.Count){
   if($dialogs.Count -ne 1){Fail 'Unexpected dialog while saving project; no acknowledgement.'}
   $modal=$dialogs[0]
   if($state.overwrite_acked){
    if($modal.Hwnd -ne $state.overwrite_hwnd){Fail 'New modal appeared after identical migration backup overwrite acknowledgement.'}
    return $null
   }
   if($modal.Title -ceq '注意'){
    if(!$state.acknowledged -or !$state.migration_backup -or !(Test-Path -LiteralPath $state.migration_backup -PathType Leaf) -or (Hash $state.migration_backup) -cne $initialHash){Fail 'Unexpected migration backup overwrite notice; no acknowledgement.'}
    if(!(ReadyControls $s $modal @(@{id=65535;class='Static'},@{id=1;class='Button';label='替代'},@{id=2;class='Button';label='取消'},@{id=3;class='Button';label='另存为'}))){return $null}
    $body=[PLCCode.Weinview.NativeControls]::NormalizeLF($s.native.GetControlText((Control $s $modal 65535 'Static').Hwnd,4096))
    if($body -cne ($state.migration_backup+" 已经存在 !`n`n是否要替代此项目 ?")){Fail 'Migration backup overwrite body/path differs.'}
    Button $s $modal 1 '替代';$state.overwrite_acked=$true;$state.overwrite_hwnd=$modal.Hwnd
    return $null
   }
   if($modal.Title -cne 'EasyBuilder Pro'){Fail 'Unexpected dialog while saving project; no acknowledgement.'}
   $prefix="当前的工程文件是利用较旧版本的 EasyBuilder 所设计, 因此存盘时将一并完成源文件的备份工作. 备份文件的名称 :`n`n`n"
   if($state.acknowledged){
    if($modal.Hwnd -ne $state.dialog_hwnd){Fail 'New modal appeared after migration acknowledgement.'}
    return $null
   }
   if(!(ReadyControls $s $modal @(@{id=65535;class='Static'},@{id=2;class='Button';label='确定'}))){return $null}
   $body=$s.native.GetControlText((Control $s $modal 65535 'Static').Hwnd,4096)
   if(!$body){return $null}
   $body=[PLCCode.Weinview.NativeControls]::NormalizeLF($body)
   if(!$body.StartsWith($prefix,[StringComparison]::Ordinal)){Fail 'Migration body differs from native backup notice.'}
   $observedBackup=$body.Substring($prefix.Length)
   if([IO.Path]::GetExtension($path) -inotmatch '^\.(emtp|cmtp)$' -or $observedBackup -inotmatch $backupPattern -or ($state.migration_backup -and $observedBackup -ine $state.migration_backup)){Fail 'Migration backup is not a same-project versioned file.'}
   if((Test-Path -LiteralPath $observedBackup) -and (Hash $observedBackup) -cne $initialHash){Fail 'Existing migration backup differs from original input bytes.'}
   $state.migration_backup=$observedBackup
   Button $s $modal 2 '确定';$state.acknowledged=$true;$state.dialog_hwnd=$modal.Hwnd;$script:migrationAcknowledged=$true;$script:migrationDialogHwnd=$modal.Hwnd
   return $null
  }
  $main=@($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $s.main.Hwnd -and $_.Enabled})
  if($main.Count -ne 1 -or $main[0].Title.Contains('*')){$state.previous=$null;return $null}
  try {
   $meta=Get-Item -LiteralPath $path;$length=$meta.Length;$ticks=$meta.LastWriteTimeUtc.Ticks
   # Native save may replace the file while this observer runs. Do not deny
   # its write/delete access; the metadata checks and two stable hashes below
   # reject observations made across a replacement or an incomplete write.
   $stream=[IO.File]::Open($path,[IO.FileMode]::Open,[IO.FileAccess]::Read,([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete))
   $algorithm=[Security.Cryptography.SHA256]::Create()
   try{$value=[BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','')}finally{$algorithm.Dispose();$stream.Dispose()}
   $after=Get-Item -LiteralPath $path
  }catch [Management.Automation.ItemNotFoundException]{
   if(!(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($path)) -PathType Container)){throw}
   $state.previous=$null;return $null
  }catch [IO.IOException]{if(($_.Exception.HResult -band 65535) -notin @(2,32,33)){throw};$state.previous=$null;return $null}
  if((!$AllowUnchanged -and $value -eq $initialHash) -or $length -ne $after.Length -or $ticks -ne $after.LastWriteTimeUtc.Ticks){$state.previous=$null;return $null}
  $current=@{hash=$value;length=$length;ticks=$ticks};$previous=$state.previous;$state.previous=$current
  if($previous -and $previous.hash -eq $value -and $previous.length -eq $length -and $previous.ticks -eq $ticks){return $current}
 }
 if($state.acknowledged -and (!(Test-Path -LiteralPath $state.migration_backup) -or (Hash $state.migration_backup) -cne $initialHash)){Fail 'Native migration backup does not match original input bytes.'}
 return $stable.hash
}
function WritePrivateJson([string]$path,$value) {
 if(Test-Path -LiteralPath $path){Fail 'Private operation evidence path already exists.'}
 [IO.File]::WriteAllText($path,($value|ConvertTo-Json -Depth 12),(New-Object Text.UTF8Encoding($true)))
}
function SelectedWindowNumber($Arguments) {
 $provided=@($Arguments.PSObject.Properties.Name)
 $hasWindow=$provided -ccontains 'window_number';$hasScreen=$provided -ccontains 'screen'
 if($hasWindow -and $hasScreen -and [string]$Arguments.window_number -cne [string]$Arguments.screen){Fail 'window_number and screen must identify the same native window.'}
 $value=if($hasWindow){$Arguments.window_number}elseif($hasScreen){$Arguments.screen}else{10}
 if(($value -isnot [int] -and $value -isnot [long]) -or $value -lt 10 -or $value -gt 1999){Fail 'Existing ordinary window_number10..1999 required.'}
 return [int]$value
}
function SetEditSession($s,[string]$path,[string]$exe) {
 $s.output_path=$path;$s.exe_path=$exe;$s.fresh_copy_verified=$true
}
 function CompleteAdditionAppearanceColors($session,$pending,[string]$saved,[string]$prefix) {
  $proof=@();$index=0
  foreach($item in @($pending|Where-Object {$null -ne $_})){
   $index++;$requestedFields=@($item.requested.PSObject.Properties.Name)
   if(!$requestedFields.Count -or !$item.native_rgb_verified){Fail 'Explicit addition RGB proof incomplete.'}
   $readFields=if(@($requestedFields|Where-Object {$_ -cin @('off_text_rgb','on_text_rgb')}).Count){@('off_text_rgb','on_text_rgb')}else{$requestedFields}
   $read=Read-WeinviewTargetObject $session ([string]$item.object_id) $saved ($prefix+'.color-'+$index) $false $false ([string[]]$readFields)
   if(!$read.appearance_color -or $read.object.object_id -cne $item.object_id){Fail 'Saved/reopened addition RGB target absent.'}
   foreach($field in $readFields){$expected=if($requestedFields -ccontains $field){@($item.requested.$field)}else{@($item.after.$field)};if((@($item.after.$field) -join ',') -cne ($expected -join ',') -or (@($read.appearance_color.$field) -join ',') -cne ($expected -join ',')){Fail ('Saved/reopened addition RGB differs: '+$field)}}
   $proof+=,[pscustomobject]@{object_id=[string]$item.object_id;requested=$item.requested;after=$item.after;reopened=$read.appearance_color;native_rgb_verified=$true}
  }
  return @($proof)
 }
try {
 $plan=$null;$script:batchCurrentStepIndex=$null
 $reader=New-Object IO.StreamReader([Console]::OpenStandardInput(),(New-Object Text.UTF8Encoding($false,$true))); $raw=$reader.ReadToEnd(); if($raw.Length -gt 1048576){Fail 'Request too large.'}; $request=$raw | ConvertFrom-Json
  if($request.schema -ne 1 -or $request.id -isnot [string] -or !$request.id -or $request.operation -notin @('discover','create_project','project_adopt','project_recover','project_context_read','project_apply','project_replace_address','macro_apply','compile_project','plc_configure','screen_apply','macro_update','macro_read','runtime_account_macro_prepare','screen_add_numeric','screen_add_window_buttons','screen_add_bit_switches','screen_add_common_objects','screen_add_trends','screen_duplicate','screen_copy_objects','screen_move_objects','recipe_view_add','project_accounts','screen_read','screen_update','tag_read','tag_upsert','simulation','simulation_values_read','simulation_value_write','simulation_alarm_ack','window_read','window_create','window_copy','server_read','server_configure','event_read','event_append','event_history_settings','sampling_read','sampling_append','alarm_display_read','alarm_display_add','alarm_display_configure','recipe_database','recipe_definition_file','recipe_file_read','recipe_file_create','history_file_read','event_history_file_read','picture_library_create','picture_apply','label_apply','field_handoff','field_download','field_upload')){Fail 'Invalid request contract.'}
 Write-WeinviewProgress 'prepare_project' '正在读取型号与工程信息'
 $a=$request.arguments; if(!$a){$a=[pscustomobject]@{}}
 if($a.PSObject.Properties.Name -ccontains 'editor_session_mode'){
  if($request.operation -cnotin @('project_apply','plc_configure','window_read','project_context_read','screen_read') -or $a.editor_session_mode -cne 'reuse'){Fail 'Unsupported continuous editor operation.'}
  if($request.operation -cne 'project_apply' -and ($a.PSObject.Properties.Name -cnotcontains 'editor_session_id' -or $a.PSObject.Properties.Name -ccontains 'close_editor')){Fail 'Continuous PLC configuration or inspection requires editor_session_id; close the editor through project_apply.'}
  if($request.operation -ceq 'project_context_read' -and $a.include_tags){Fail 'Continuous project overview requires include_tags=false; Tags are not exported from this read route.'}
  if($request.operation -ceq 'screen_read' -and ($a.PSObject.Properties.Name -ccontains 'object_id' -or ($a.PSObject.Properties.Name -ccontains 'detail' -and $a.detail -cne 'directory'))){Fail 'Continuous screen_read supports detail=directory without object_id only. Use project_apply with this editor_session_id for targeted changes; it reads the target properties internally.'}
  $editorSessionMode=$true;. (Join-Path $PSScriptRoot 'EditorSession.ps1')
 }
 if(!$editorSessionMode -and @($a.PSObject.Properties.Name|Where-Object {$_ -cin @('editor_session_id','close_editor')}).Count){Fail 'Editor session fields require a supported continuous editor route.'}
 $macroReadExecutionMetadata=$false
 if($request.operation -ceq 'macro_read' -and $a.PSObject.Properties.Name -ccontains 'include_execution_metadata'){
  if($a.include_execution_metadata -isnot [bool]){Fail 'include_execution_metadata must be a boolean.'}
  $macroReadExecutionMetadata=$a.include_execution_metadata
 }
 if($request.operation -ceq 'field_upload' -and $a.action -cne 'open' -and $a.receipt -and $a.receipt.backend -ceq 'easybuilder-editor' -and !$a.exe_path){$a|Add-Member -NotePropertyName exe_path -NotePropertyValue ([string]$a.receipt.exe_path)}
 Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
 Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Utility\Microsoft.PowerShell.Utility.psd1') -ErrorAction Stop
 if($request.operation -cin @('project_apply','macro_apply','macro_update','macro_read')){
  $stage='macro_file_resources'
  $macroReadNative=($request.operation -ceq 'macro_read' -and !$macroReadExecutionMetadata)
  $macroResources=if($macroReadNative){@('MacroFileOperation.ps1')}else{@('MacroFileOperation.ps1','EventTableCodec\source\event_table_codec.py','EventTableCodec\source\macro-default-cn421.ebm')}
  foreach($relative in $macroResources){
   if(!(Test-Path -LiteralPath (Join-Path $PSScriptRoot $relative) -PathType Leaf)){Fail ('weinview_macro_file_resources_missing: '+$relative)}
  }
  if(!$macroReadNative){$null=Get-WeinviewRecipePython}
  . (Join-Path $PSScriptRoot 'MacroFileOperation.ps1')
 }
 $stage='discovery'
 # FLBX file creation does not depend on a vendor installation or a live IDE.
 $nativeEditorOperations=@('project_context_read','project_apply','project_replace_address','compile_project','plc_configure','macro_read','macro_apply','macro_update','screen_read','screen_update','screen_add_numeric','screen_add_window_buttons','screen_add_bit_switches','screen_add_common_objects','screen_add_trends','screen_duplicate','screen_copy_objects','screen_move_objects','recipe_view_add','tag_read','tag_upsert','window_read','window_create','window_copy','server_read','server_configure','event_read','event_append','sampling_read','sampling_append','alarm_display_read','alarm_display_add')
 $nativeHandoffBuild=($request.operation -ceq 'field_handoff' -and $a.action -ceq 'build_native_directory')
 $nativeEditorFlow=($request.operation -cin $nativeEditorOperations -or ($request.operation -ceq 'project_accounts' -and $a.action -ceq 'read') -or $nativeHandoffBuild -or $request.operation -ceq 'field_upload')
 $inst=if($request.operation -cin @('picture_library_create','recipe_definition_file','runtime_account_macro_prepare') -or ($request.operation -ceq 'field_handoff' -and !$nativeHandoffBuild)){@()}else{@(ResolveInstallation $a ($request.operation -cnotin @('discover','history_file_read')) ($request.operation -cin @('create_project','project_adopt','field_upload')) $nativeEditorFlow)}
 if($request.operation -ceq 'runtime_account_macro_prepare'){
  $stage='runtime_account_macro_prepare'
  . (Join-Path $PSScriptRoot 'RuntimeAccountMacroOperation.ps1')
  $data=New-WeinviewRuntimeAccountMacro $a
 }
 elseif($request.operation -ceq 'picture_library_create'){
  $stage='picture_library_file';$mutation='possible'
  . (Join-Path $PSScriptRoot 'PictureLibraryOperation.ps1')
  $data=Invoke-WeinviewPictureLibraryCreate $a
  $mutation='completed'
 }
 elseif($request.operation -ceq 'field_handoff'){
  $stage='field_handoff';$mutation='possible'
  . (Join-Path $PSScriptRoot 'ProjectFieldHandoffOperation.ps1')
  if($nativeHandoffBuild){
   Add-Type -AssemblyName Accessibility
   Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','NativeDownloadDataControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies System.dll,System.Core.dll,Microsoft.CSharp.dll,Accessibility.dll,System.Drawing.dll
   . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1')
   . (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1')
   . (Join-Path $PSScriptRoot 'NativeDownloadDataBuild.ps1')
  }
  $data=Invoke-WeinviewProjectFieldHandoff $a $(if($nativeHandoffBuild){$inst[0]}else{$null})
  $mutation='completed'
 }
 elseif($request.operation -ceq 'recipe_definition_file'){
  $stage='recipe_definition_file';$mutation='possible'
  $root=Workspace $a.workspace_root
  $output=Under $a.output_db $root
  if([IO.Path]::GetExtension($output) -ine '.db' -or (Test-Path -LiteralPath $output)){Fail 'Fresh native Recipe Database output .db required.'}
  . (Join-Path $PSScriptRoot 'RecipeDatabaseDefinitionOperation.ps1')
  $python=Join-Path $PSScriptRoot '..\engine\python\python.exe'
  $prefix=Under (Join-Path $root ('.weinview-recipe-definition-'+[Guid]::NewGuid().ToString('N'))) $root
  $requestPath=$prefix+'.request.json';$responsePath=$prefix+'.response.json'
  $codecRequest=@{};foreach($property in $a.PSObject.Properties){if($property.Name -cne 'workspace_root' -and !$property.Name.StartsWith('expected_',[StringComparison]::Ordinal)){$codecRequest[$property.Name]=$property.Value}}
  WritePrivateJson $requestPath $codecRequest
  $data=Invoke-WeinviewRecipeDatabaseDefinitionCodec $python $requestPath $responsePath
  if((Hash $output) -cne $data.output_sha256){Fail 'Native Recipe Database definition file hash differs.'}
  $mutation='completed'
 }
 elseif($request.operation -ceq 'field_download'){
  $stage='field_download';$mutation='possible'
  . (Join-Path $PSScriptRoot 'ProjectFieldHandoffOperation.ps1')
  . (Join-Path $PSScriptRoot 'NativeFieldDownloadOperation.ps1')
  $vendorDirectory=[IO.Path]::GetDirectoryName([string]$inst[0].exe_path)
  $data=Invoke-WeinviewNativeFieldDownload $a $vendorDirectory
  $mutation='completed'
 }
 elseif($request.operation -ceq 'field_upload'){
  $stage='field_upload_'+[string]$a.action;$mutation='possible'
  . (Join-Path $PSScriptRoot 'ProjectFieldHandoffOperation.ps1')
  . (Join-Path $PSScriptRoot 'NativeFieldUploadOperation.ps1')
  Add-Type -AssemblyName Accessibility
  Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ModelCreationControls.cs','NativeRecoveryMenuControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
  $data=Invoke-WeinviewNativeFieldUpload $a $inst[0]
  $mutation='completed'
 }
 elseif($request.operation -eq 'discover'){
  . (Join-Path $PSScriptRoot 'ModelCatalog.ps1');$catalog=Get-WeinviewInstalledModelCatalog $inst
  $data=@{installations=$catalog.installations;models=$catalog.models;model_catalog_profile=$catalog.profile;vendor_configuration_count=$catalog.vendor_configuration_count;series_count=$catalog.series_count;templates=@('TK_800x480','TK_INTERACTIVE_800x480','CMT_800x480');supported_operations=@('discover','create_project','project_adopt','project_recover','project_context_read','project_apply','project_replace_address','macro_apply','compile_project','plc_configure','screen_apply','macro_read','macro_update','screen_add_numeric','screen_add_window_buttons','screen_add_bit_switches','screen_add_common_objects','screen_add_trends','screen_duplicate','screen_copy_objects','screen_move_objects','recipe_view_add','project_accounts','screen_read','screen_update','tag_read','tag_upsert','simulation','simulation_values_read','simulation_value_write','simulation_alarm_ack','window_read','window_create','window_copy','server_read','server_configure','event_read','event_append','event_history_settings','sampling_read','sampling_append','alarm_display_read','alarm_display_add','alarm_display_configure','recipe_database','recipe_definition_file','recipe_file_read','recipe_file_create','history_file_read','event_history_file_read','picture_library_create','picture_apply','label_apply','field_handoff','field_download','field_upload','runtime_account_macro_prepare')}
 }
 elseif($request.operation -cin @('history_file_read','event_history_file_read')){
  $stage='history_file_preflight'
  $historyArguments=@{};foreach($property in $a.PSObject.Properties){$historyArguments[$property.Name]=$property.Value}
  if($request.operation -ceq 'history_file_read'){$historyInstall=@($inst|Where-Object {$_.signature_status -ceq 'Valid' -and $_.signer -match '(?i)WEINTEK' -and (!$a.exe_path -or $_.exe_path -ieq $a.exe_path)});if($historyInstall.Count -ne 1){Fail 'One signed installed EasyBuilder with EasyConverter required; select exe_path.'};$historyArguments.exe_path=Join-Path ([IO.Path]::GetDirectoryName($historyInstall[0].exe_path)) 'EasyConverter.exe'}else{$historyArguments.exe_path=Join-Path ([IO.Path]::GetDirectoryName($inst[0].exe_path)) 'EasyConverter.exe'}
  $historyArguments=[pscustomobject]$historyArguments
  if($request.operation -ceq 'history_file_read'){
   . (Join-Path $PSScriptRoot 'HistoryDataOperation.ps1')
   $null=Assert-WeinviewDataArguments $historyArguments
   $stage='history_data_native_cli';$mutation='possible'
   $data=Invoke-WeinviewDataRead $historyArguments
  }else{
   . (Join-Path $PSScriptRoot 'HistoryFileOperation.ps1')
   $historyKind='dtl';if($request.operation -ceq 'event_history_file_read'){$historyKind=if([IO.Path]::GetExtension($historyArguments.file_path) -ieq '.db'){'db'}else{'evt'}}
   if($historyKind -ceq 'db'){$null=Assert-WeinviewHistoryDbArguments $historyArguments $PSScriptRoot}else{$null=Assert-WeinviewHistoryFileArguments $historyArguments $PSScriptRoot ('.'+$historyKind)}
   $stage='history_file_native_cli';$mutation='possible'
   $data=Invoke-WeinviewHistoryFileRead $historyArguments $PSScriptRoot $historyKind
  }
  $mutation='completed'
 }
 elseif($request.operation -ceq 'project_recover'){
  $stage='recovery_preflight'
  $installation=$inst[0];$exe=$installation.exe_path;$root=Workspace $a.workspace_root
  $runtime=Under $a.runtime_path $root;$recovered=Under $a.project_path $root
  $recoveryArguments=@{runtime_path=$runtime;project_path=$recovered;runtime_sha256=[string]$a.runtime_sha256}
  if($a.PSObject.Properties.Name -ccontains 'decompile_password'){$recoveryArguments.decompile_password=$a.decompile_password}
  . (Join-Path $PSScriptRoot 'NativeProjectRecoveryOperation.ps1')
  $inputRecord=Get-WeinviewRecoveryInput $recoveryArguments
  $template=SafePath (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'project\template_800x480.cmtp')
  $templateHash=Hash $template
  if($templateHash -cne '14CD2DE65391445F581C66DCF31151624EA94D764DF1BA513A487DE91BEE4EA3'){Fail 'Pinned native cMT menu host template differs.'}
   . (Join-Path $PSScriptRoot 'ModelCatalog.ps1');$catalog=Get-WeinviewInstalledModelCatalog @($installation)
  . (Join-Path $PSScriptRoot 'ModelCreationOperation.ps1');. (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
  Add-Type -AssemblyName Accessibility
  Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','NativeRecoveryMenuControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
  $stage='recovery_open_menu_host';$s=StartOwned $exe $template $true $true
  $stage='recovery_native_decompile';$mutation='possible'
  $evidencePrefix=Under (Join-Path $root ('.weinview-recover-'+[Guid]::NewGuid().ToString('N'))) $root
  $recovery=Invoke-WeinviewNativeProjectRecovery $s $recoveryArguments $evidencePrefix
  if(!$recovery.native_decompile_completed -or !$recovery.editable_project_open_verified){Fail 'Original-vendor recovery did not open editable project.'}
  $newMain=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($recovered))})
  if($newMain.Count -ne 1){Fail 'Recovered original-vendor main window differs.'}
  $s.main=$newMain[0];$s.project_path=$recovered;SetEditSession $s $recovered $exe
  $stage='recovery_native_model';$readback=Read-WeinviewOriginalModelLabel $s
  $match=Resolve-WeinviewAdoptedModel $installation ([string]$readback.model_label) ($inputRecord.project_extension.TrimStart('.').ToLowerInvariant())
  $model=$match.profile;$readback.native_model_verified=$true
  $stage='recovery_native_windows'
  $windows=if($model.has_display){Read-WeinviewWindows $s}else{@{windows=@();window_set_sha256=(Get-WeinviewWindowSetSha256 @())}}
  if((Hash $runtime) -cne $inputRecord.runtime_sha256 -or (Hash $template) -cne $templateHash){Fail 'Recovery source or native menu host changed.'}
  $saved=Hash $recovered
  $stage='recovery_close_owned';CloseSession $s $recovered $saved $true
  $data=@{output_path=$recovered;output_sha256=$saved;project_path=$recovered;project_sha256=$saved;runtime_path=$runtime;runtime_sha256=$inputRecord.runtime_sha256;runtime_bytes=$inputRecord.runtime_bytes;project_bytes=(Get-Item -LiteralPath $recovered).Length;
   model_key=$model.key;model=$model.name;series=$model.series;category=$model.category;format=$model.format;orientation=$match.orientation;has_display=[bool]$model.has_display;width=$match.width;height=$match.height;
    model_catalog_sha256=(Hash (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'Config.xml'));installation_exe_path=$exe;model_readback=$readback;windows=@($windows.windows);window_set_sha256=$windows.window_set_sha256;
   native_decompile_completed=$true;editable_project_open_verified=$true;project_adopted=$true;native_model_verified=$true;normal_main_exit_verified=$true;project_saved=$false;compile_verified=$false;
   source_runtime_unchanged=$true;menu_host_unchanged=$true;native_recovered_main_title=$recovery.native_recovered_main_title;native_evidence=$recovery.native_evidence;own_processes=$own;activation_evidence=$activationEvidence;profile='6.10.02.421-zh-CN-native-project-recovery-v1'}
  $mutation='completed'
 }
 elseif($request.operation -cin @('recipe_file_read','recipe_file_create')){
  $stage='recipe_file_preflight'
  . (Join-Path $PSScriptRoot 'RecipeFileOperation.ps1')
  $recipeArguments=@{};foreach($property in $a.PSObject.Properties){$recipeArguments[$property.Name]=$property.Value}
  $recipeArguments.exe_path=Join-Path ([IO.Path]::GetDirectoryName($inst[0].exe_path)) 'RecipeEditor.exe'
  $recipeArguments=[pscustomobject]$recipeArguments
  $null=Assert-WeinviewRecipeFileArguments $request.operation $recipeArguments $PSScriptRoot
  $stage='recipe_file_native_cli';$mutation='possible'
  $data=if($request.operation -ceq 'recipe_file_read'){Invoke-WeinviewRecipeFileRead $recipeArguments $PSScriptRoot}else{Invoke-WeinviewRecipeFileCreate $recipeArguments $PSScriptRoot}
  $mutation='completed'
 }
 elseif($request.operation -eq 'simulation'){
  Write-WeinviewProgress 'simulation' '正在处理原厂模拟器'
  $stage='simulation_lifecycle';$mutation='possible'
  . (Join-Path $PSScriptRoot 'SimulationOperation.ps1')
  if($a.action -ceq 'select_window'){. (Join-Path $PSScriptRoot 'EasyWatchValuesOperation.ps1')}
  $data=Invoke-WeinviewSimulationLifecycle $a $inst[0] $PSScriptRoot
  $mutation='completed'
 }
 elseif($request.operation -ceq 'simulation_alarm_ack'){
  $stage='simulation_alarm_preflight'
  . (Join-Path $PSScriptRoot 'SimulationAlarmOperation.ps1')
  $null=Assert-WeinviewSimulationAlarmArguments $a $PSScriptRoot $inst[0]
  $stage='simulation_alarm_ack';$mutation='possible'
  $data=Invoke-WeinviewSimulationAlarmAck $a $inst[0] $PSScriptRoot
  $mutation='completed'
 }
 elseif($request.operation -in @('simulation_values_read','simulation_value_write')){
  $stage='simulation_values_preflight';$mutation='possible'
  . (Join-Path $PSScriptRoot 'SimulationOperation.ps1')
  . (Join-Path $PSScriptRoot 'EasyWatchValuesOperation.ps1')
  $data=if($request.operation -eq 'simulation_value_write'){Invoke-WeinviewSimulationValueWrite $a $inst[0]}else{Invoke-WeinviewSimulationValues $a $inst[0]}
  $mutation='completed'
 }
 else {
  if($request.operation -ceq 'project_adopt'){
   $required=@('workspace_root','project_path','output_path','expected_project_sha256')
   if(@($required|Where-Object {$_ -cnotin $a.PSObject.Properties.Name}).Count -or @($a.PSObject.Properties.Name|Where-Object {$_ -cnotin ($required+@('exe_path'))}).Count){Fail 'Exact native project adoption arguments required.'}
   foreach($field in $required){if($a.$field -isnot [string]){Fail 'Native project adoption paths and SHA256 must be strings.'}}
  }
  $installation=$inst[0]; $exe=$installation.exe_path; $root=Workspace $a.workspace_root; $output=Under $a.output_path $root
  if($editorSessionMode -or $request.operation -cin $nativeEditorOperations){
   . (Join-Path $PSScriptRoot 'EditorSession.ps1')
   try{$editorSessionContext=Enter-WeinviewEditorSessionContext $root $a $exe $request.operation}catch{
    if(!$editorSessionMode -and $_.Exception.Message.StartsWith('weinview_editor_session_exists:')){
     $hint=if($request.operation -cin @('window_read','project_context_read','screen_read','plc_configure')){' Retry weinview_'+$request.operation+' with that editor_session_id, project_path/output_path both set to its working file and the latest saved SHA256. project_context_read requires include_tags=false; screen_read requires detail=directory without object_id. For targeted changes use project_apply with the same session; it reads target properties internally.'}elseif($request.operation -ceq 'compile_project'){' Use weinview_project_apply with that editor_session_id, its working file for project_path/output_path, latest saved SHA256, steps:[] and compile:true. To use the standalone workflow, first close the managed editor normally with project_apply close_editor:true.'}else{' Use the corresponding supported step in weinview_project_apply with that editor_session_id and working file. To use this standalone workflow, first close the managed editor normally with project_apply close_editor:true; no second editor will be opened.'}
     Fail ($_.Exception.Message+$hint)
    }
    throw
   }
  }
  $outputExtension=[IO.Path]::GetExtension($output)
  $selectedModel=$null
  if($request.operation -ceq 'create_project' -and $a.model_key){
   if($a.template_key){Fail 'Choose model_key or a legacy template_key, not both.'}
   . (Join-Path $PSScriptRoot 'ModelCatalog.ps1');$selectedModel=Get-WeinviewModelProfile $installation ([string]$a.model_key)
   if(!$selectedModel.format){$selectedModel.format=[IO.Path]::GetExtension($output).TrimStart('.').ToLowerInvariant()}
  }
  $cmtCreate=($request.operation -ceq 'create_project' -and ($a.template_key -ceq 'CMT_800x480' -or ($selectedModel -and $selectedModel.format -ceq 'cmtp')))
  $cmtCompile=($request.operation -ceq 'compile_project' -and $outputExtension -ieq '.cmtp')
  $expectedOutputExtension=if($request.operation -ceq 'create_project'){if($cmtCreate){'.cmtp'}else{'.emtp'}}else{[IO.Path]::GetExtension([string]$a.project_path)}
  if($expectedOutputExtension -inotmatch '^\.(emtp|cmtp)$'){Fail 'Original EMTP/CMTP project required.'}
  if($outputExtension -ine $expectedOutputExtension -or ((Test-Path -LiteralPath $output) -and !($editorSessionMode -and $editorSessionContext.reused)) -or !(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($output)) -PathType Container)){Fail 'Fresh operation-matched project extension in an existing workspace directory required.'}
  $stage='preflight'
  if($request.operation -ceq 'create_project' -and $selectedModel){
   . (Join-Path $PSScriptRoot 'ModelCreationOperation.ps1')
    Write-WeinviewProgress 'create_project' '正在按所选型号创建工程'
    $mutation='possible';$data=Invoke-WeinviewModelCreation $a $installation $output;$data.installation_exe_path=$exe
  } elseif($request.operation -eq 'create_project'){
   if($a.template_key -eq 'TK_800x480'){$source=SafePath (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'project\template_TK_800x480.emtp')}
   elseif($a.template_key -eq 'TK_INTERACTIVE_800x480'){$source=SafePath (Join-Path $PSScriptRoot 'project_templates\TK_INTERACTIVE_800x480.emtp');if((Hash $source) -ne $interactiveTemplateHash){Fail 'Interactive template integrity mismatch.'}}
   elseif($a.template_key -ceq 'CMT_800x480'){$source=SafePath (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'project\template_800x480.cmtp')}
   else{Fail 'Unknown verified template_key.'}
   $before=Hash $source
   if($cmtCreate -and $before -cne '14CD2DE65391445F581C66DCF31151624EA94D764DF1BA513A487DE91BEE4EA3'){Fail 'CMT800x480 native template integrity mismatch.'}
   $mutation='possible'; [IO.File]::Copy($source,$output,$false)
   if((Hash $output) -ne $before -or (Hash $source) -ne $before){Fail 'Template byte-copy verification failed.'}
   $data=@{output_path=$output;source_sha256=$before;output_sha256=$before;template_key=$a.template_key;model=if($cmtCreate){'cMT3071'}else{'TK8071iP/8072iP'};version=$installation.version;profile='6.10.02.421-zh-CN'}
  } else {
   $projectInput=Under $a.project_path $root
   if(!(Test-Path -LiteralPath $projectInput -PathType Leaf) -or [IO.Path]::GetExtension($projectInput) -ine $expectedOutputExtension -or (!($editorSessionMode -and $editorSessionContext.reused) -and [IO.Path]::GetFileNameWithoutExtension($projectInput) -ieq [IO.Path]::GetFileNameWithoutExtension($output))){Fail 'Existing project and a fresh different output, or the exact registered working project, required.'}
   $before=Hash $projectInput; if($a.expected_project_sha256 -notmatch '^[0-9a-fA-F]{64}$' -or $before -ine $a.expected_project_sha256){Fail 'Input project hash mismatch.'}
    if($editorSessionMode){
     $savedReadReconciliation=($request.operation -ceq 'plc_configure' -and $a.change -ceq 'inspect')
     Assert-WeinviewEditorSessionBaseline $editorSessionContext $before -AllowSavedReadReconciliation:$savedReadReconciliation
    }
    $header=New-Object byte[] 30; $stream=[IO.File]::OpenRead($projectInput); try{$read=$stream.Read($header,0,30)}finally{$stream.Dispose()}
   $oldHeader=($read -eq 30 -and [Text.Encoding]::Unicode.GetString($header,8,22) -eq '6.05.02.675')
   $backup=Under (Join-Path ([IO.Path]::GetDirectoryName($output)) ([IO.Path]::GetFileNameWithoutExtension($output)+'_6.05.02.675'+$expectedOutputExtension)) $root
   $artifactExtension=if($expectedOutputExtension -ieq '.cmtp'){'.cxob'}else{'.exob'}
   if((Test-Path -LiteralPath $backup) -or (!($editorSessionMode -and $editorSessionContext.reused) -and (Test-Path -LiteralPath ([IO.Path]::ChangeExtension($output,$artifactExtension))))){Fail 'Output backup/compile sidecar already exists.'}

   if($request.operation -ceq 'project_replace_address'){
    if($oldHeader){Fail 'Current-version native project required for address replacement.'}
    . (Join-Path $PSScriptRoot 'NativeAddressReplaceOperation.ps1')
    $addressContract=Assert-WeinviewAddressReplaceArguments $a
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','NativeRecoveryMenuControls.cs','NativeAddressReplaceControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    $addressDialog=$null;$addressReplaceTriggered=$false
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Native address replacement fresh copy hash differs.'}
    $addressHostPort=Get-WeinviewNativeHostPort
    $stage='open_owned_address_replacement';$s=StartOwned $exe $output $false $true $addressHostPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true
    $stage='native_replace_address_once';$addressApplied=Invoke-WeinviewNativeAddressReplaceOnce $s $a $addressContract ([ref]$addressDialog) ([ref]$addressReplaceTriggered)
    $sourceCount=[long]$addressApplied.before_count;$targetCount=[long]$addressApplied.target_before_count
    if($sourceCount){$stage='save_native_address_replacement';$saved=SaveEditedProject $s $output $before 1500}else{$saved=$before}
    $stage='close_address_replacement';CloseSession $s $output $saved (!$sourceCount);$addressReplaceTriggered=$false
    $addressReopenHostPort=Get-WeinviewNativeHostPort
    $stage='reopen_address_replacement';$s=StartOwned $exe $output $false $true $addressReopenHostPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true
    $stage='select_reopened_address_canvas';$reopenedCanvas=Select-WeinviewAddressSearchCanvas $s $addressContract
    $stage='open_reopened_find_address';$addressEntry=Open-WeinviewAddressSearchDialog $s ([long]$reopenedCanvas.canvas_hwnd);$addressDialog=$addressEntry.dialog
    $stage='find_reopened_source';$sourceReopened=Find-WeinviewNativeRawAddress $s $addressDialog $a $addressContract $false
    $stage='find_reopened_target';$targetReopened=Find-WeinviewNativeRawAddress $s $addressDialog $a $addressContract $true
    if([long]$sourceReopened.match_count -ne 0 -or [long]$targetReopened.match_count -ne ($targetCount+$sourceCount)){Fail 'Saved/reopened native address replacement counts differ.'}
    if($addressContract.range_enabled){Assert-WeinviewNativeRangeMatchMultiset $targetReopened.matches $addressApplied.after_matches}
    [PLCCode.Weinview.NativeAddressReplaceControls]::Close($s.native,[long]$addressDialog.Hwnd,[int]$s.process.Id);$addressDialog=$null
    $stage='close_reopened_address_replacement';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Address replacement final source/output hash invariant failed.'}
    $reopenVerified=$true
    $addressResult=$addressApplied;$addressResult.reopened_source_count=[long]$sourceReopened.match_count;$addressResult.reopened_target_count=[long]$targetReopened.match_count;$addressResult.persisted_verified=$true
    if($addressContract.range_enabled){$addressResult.reopened_target_matches=@($targetReopened.matches|ForEach-Object {@{location=[string]$_.location;description=[string]$_.description}})}
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;project_path=$output;project_sha256=$saved;project_saved=[bool]($sourceCount -gt 0);project_save_count=if($sourceCount){1}else{0};project_reopen_count=1;source_unchanged=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;address_replacement=$addressResult;own_processes=$own;activation_evidence=$activationEvidence;next_tool='weinview_project_compile'}
    if($addressContract.scope -ceq 'window'){$addressResult.window_number=[int]$addressContract.window_number;$data.window_number=[int]$addressContract.window_number}
   }elseif($request.operation -ceq 'project_adopt'){
    $stage='adopt_model_preflight';if($oldHeader){Fail 'Original older project requires separate migration review; no adoption.'}
    . (Join-Path $PSScriptRoot 'ModelCatalog.ps1');$catalog=Get-WeinviewInstalledModelCatalog @($installation)
    . (Join-Path $PSScriptRoot 'ModelCreationOperation.ps1')
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Native adoption source/copy hash differs.'}
    $port=0;try{$port=Get-WeinviewNativeHostPort}catch{}
    $stage='adopt_owned_readonly_open';$s=StartOwned $exe $output $false $true $port;SetEditSession $s $output $exe;$s.project_path=$output
    $stage='adopt_native_model_label';$readback=Read-WeinviewOriginalModelLabel $s
    $match=Resolve-WeinviewAdoptedModel $installation ([string]$readback.model_label) ($expectedOutputExtension.TrimStart('.').ToLowerInvariant())
    $model=$match.profile;$readback.native_model_verified=$true
    if($model.has_display){
     $stage='adopt_native_window_directory';$windows=Read-WeinviewWindows $s
    }else{$windows=@{windows=@();window_set_sha256=(Get-WeinviewWindowSetSha256 @())}}
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Native adoption inspection changed source/copy bytes.'}
    $stage='adopt_readonly_close';CloseSession $s $output $before $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Native adoption source/copy changed after normal close.'}
    $data=@{input_path=$projectInput;input_sha256=$before;source_sha256=$before;output_path=$output;output_sha256=$before;
     model_key=$model.key;model=$model.name;series=$model.series;category=$model.category;format=$model.format;
     width=$match.width;height=$match.height;orientation=$match.orientation;has_display=[bool]$model.has_display;
      model_catalog_sha256=(Hash (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'Config.xml'));installation_exe_path=$exe;model_readback=$readback;
     windows=@($windows.windows);window_set_sha256=$windows.window_set_sha256;native_model_verified=$true;
     source_unchanged=$true;read_only_inspection=$true;project_saved=$false;normal_main_exit_verified=$true;
     own_processes=$own;activation_evidence=$activationEvidence;profile='weinview-installed-native-project-adoption-v1'}
   }
   elseif($request.operation -ceq 'project_apply'){
    $stage='batch_preflight';if($oldHeader){Fail 'Current-version project required for batch.'}
    $screenStepKinds=@('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update','screen_duplicate','screen_copy_objects','screen_move_objects')
    $hasScreenSteps=(@($a.steps|Where-Object {$_.kind -cin $screenStepKinds}).Count -gt 0)
    $hasDuplicateSteps=(@($a.steps|Where-Object {$_.kind -ceq 'screen_duplicate'}).Count -gt 0)
    $hasCopySteps=(@($a.steps|Where-Object {$_.kind -cin @('screen_copy_objects','screen_move_objects')}).Count -gt 0)
    $hasAddressSteps=(@($a.steps|Where-Object {$_.kind -ceq 'project_replace_address' -or ($_.kind -ceq 'screen_copy_objects' -and $_.PSObject.Properties.Name -ccontains 'address_replacements')}).Count -gt 0)
    $hasWindowCopySteps=(@($a.steps|Where-Object {$_.kind -ceq 'window_copy'}).Count -gt 0)
    $hasWindowCreateSteps=(@($a.steps|Where-Object {$_.kind -ceq 'window_create'}).Count -gt 0)
    $hasLabelSteps=(@($a.steps|Where-Object {$_.kind -cin @('labels_upsert','labels_bind')}).Count -gt 0)
    $hasLabelBindingSteps=(@($a.steps|Where-Object {$_.kind -ceq 'labels_bind'}).Count -gt 0)
     $hasBoundDataSteps=(@($a.steps|Where-Object {$_.kind -cin @('events_append','sampling_append')}|ForEach-Object {if($_.kind -ceq 'events_append'){@($_.events)}else{@($_.objects)}}|Where-Object {$_.PSObject.Properties.Name -ccontains 'tag_name' -or $_.PSObject.Properties.Name -ccontains 'device'}).Count -gt 0)
    if($hasLabelSteps -and $expectedOutputExtension -ine '.cmtp'){Fail 'Current cMT native project required for observed CN421 Label Tag Library editing.'}
    Add-Type -AssemblyName Accessibility
    $batchTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs','ObjectRibbonControls.cs','EventDialogControls.cs','SamplingRibbonControls.cs','CompileLogCandidate.cs')
     if($hasScreenSteps){$batchTypes+=@('WindowRibbonControls.cs','NativeScreenScene.cs','QtModbusEndpointCandidate.cs','NumericRibbonControls.cs','NumericAddressTypeControls.cs','NumericTagSettingsControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs','AlarmDisplayDialogControls.cs','CommonObjectRibbonControls.cs','OptionListGridControls.cs','NativeResourceReuseControls.cs','PictureRibbonControls.cs','TrendRibbonControls.cs','RecipeDatabaseControls.cs','RecipeViewRibbonControls.cs','RecipeViewDisplayControls.cs','RecipeViewClipboard.cs','ObjectSecurityClassControls.cs')}
    if($hasDuplicateSteps){$batchTypes+='NativeMultiCopyControls.cs'}
    if($hasCopySteps){$batchTypes+=@('NativeMultiCopyControls.cs','NativeRecoveryMenuControls.cs','NativeObjectClipboardControls.cs','NativeGroupTranslationControls.cs')}
    if($hasAddressSteps){$batchTypes+=@('NativeRecoveryMenuControls.cs','NativeAddressReplaceControls.cs')}
    if($hasWindowCopySteps){$batchTypes+=@('WindowRibbonControls.cs','WindowCopyControls.cs')}
    if($hasWindowCreateSteps){$batchTypes+='WindowRibbonControls.cs'}
    if($hasLabelSteps){$batchTypes+=@('LabelRibbonControls.cs','LabelGridControls.cs','WindowRibbonControls.cs','NumericAddressTypeControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs')}
     if($hasBoundDataSteps){$batchTypes+='ServerDeviceDirectoryControls.cs'}
    Add-Type -Path @($batchTypes|Select-Object -Unique|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    foreach($helper in @('PlcConfigurationCandidate.ps1','TagRibbonAction.ps1','TagOperation.ps1','ObjectRibbonAction.ps1','EventOperation.ps1','SamplingRibbonAction.ps1','SamplingCsvCodec.ps1','SamplingOperation.ps1','CompileProjectCandidate.ps1','ProjectFileBatchOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}
    . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    . (Join-Path $PSScriptRoot 'ProjectAddressEvidence.ps1')
    if($hasBoundDataSteps){foreach($helper in @('NativeRibbonAction.ps1','ServerConfigurationOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}}
    if($hasScreenSteps){foreach($helper in @('WindowOperation.ps1','WindowRibbonAction.ps1','NativeRibbonAction.ps1','PlcOperation.ps1','NumericRibbonAction.ps1','NumericAddressBinding.ps1','NumericAdditionOperation.ps1','BitSwitchAdditionOperation.ps1','WindowButtonAdditionOperation.ps1','CommonObjectRibbonAction.ps1','CommonObjectsAdditionOperation.ps1','OptionListAdditionOperation.ps1','PictureAdditionOperation.ps1','NativeResourceReuseOperation.ps1','TrendOperation.ps1','AlarmDisplayOperation.ps1','RecipeDatabaseProjectOperation.ps1','RecipeDatabaseOperation.ps1','RecipeViewRibbonAction.ps1','RecipeViewOperation.ps1','ScreenWorkflow.ps1')){. (Join-Path $PSScriptRoot $helper)}}
    if(($hasWindowCopySteps -or $hasWindowCreateSteps) -and !$hasScreenSteps){. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')}
    if($hasDuplicateSteps -or $hasCopySteps){. (Join-Path $PSScriptRoot 'NativeMultiCopyOperation.ps1')}
    if($hasCopySteps){. (Join-Path $PSScriptRoot 'NativeObjectCopyOperation.ps1')}
    if($hasAddressSteps){. (Join-Path $PSScriptRoot 'NativeAddressReplaceOperation.ps1')}
    if($hasWindowCopySteps){. (Join-Path $PSScriptRoot 'NativeWindowCopyOperation.ps1')}
    if($hasLabelSteps){foreach($helper in @('LabelLibraryOperation.ps1','LabelWorkbookCodec.ps1','LabelApplyOperation.ps1')){. (Join-Path $PSScriptRoot $helper)};if($hasLabelBindingSteps){. (Join-Path $PSScriptRoot 'LabelTextBindingOperation.ps1')};if(!$hasScreenSteps){foreach($helper in @('WindowOperation.ps1','WindowRibbonAction.ps1','ScreenWorkflow.ps1')){. (Join-Path $PSScriptRoot $helper)}}}
    $batchPrefix=Under (Join-Path $root ('.weinview-batch-'+[Guid]::NewGuid().ToString('N'))) $root
    $plan=New-WeinviewProjectBatchPlan $a $batchPrefix $root
    $savedScreenBatch=(!$editorSessionMode -and $a.screen_completion_mode -ceq 'save' -and (Test-WeinviewBatchScreenSaveOnly $plan))
   $compileBatch=if($a.PSObject.Properties.Name -ccontains 'compile'){[bool]$a.compile}else{$false}
    $batchSelectedSlots=$null;$batchStartupSlot=$null
    if($a.PSObject.Properties.Name -ccontains 'selected_languages'){$batchSelectedSlots=[int[]]@($a.selected_languages);$batchStartupSlot=[int]$a.startup_language}
    if(!$editorSessionMode -and !$compileBatch -and @($plan|Where-Object {$_.kind -cnotin ($screenStepKinds+@('project_replace_address','window_copy','labels_upsert','labels_bind'))}).Count){Fail 'Skipping whole-project compile is limited to pure screen/address/window-copy/label-library batches.'}
    # The original-vendor whole-window clipboard step works in the owned background session.
    $batchNeedsForeground=(@($plan|Where-Object {$_.kind -cin @('screen_copy_objects','screen_move_objects','screen_duplicate','window_copy','labels_upsert','labels_bind')}).Count -gt 0)
    $batchAllowWindowless=(($hasCopySteps -or $hasAddressSteps) -and !$hasDuplicateSteps -and !$batchNeedsForeground)
    $artifact=Under ([IO.Path]::ChangeExtension($output,$artifactExtension)) $root;$compileProvenance=Under ($artifact+'.plccode-compile.json') $root
    if($compileBatch){if($editorSessionMode){Assert-WeinviewEditorCompileArtifacts $editorSessionContext $artifact $compileProvenance}elseif(Test-Path -LiteralPath $compileProvenance){Fail 'Fresh adjacent batch compile provenance required.'}}
    $script:batchPreflightVerified=$false;$script:batchImportStarted=$false;$script:batchImportsCompleted=0
    $mutation='possible'
    if($editorSessionMode -and $editorSessionContext.reused){
     $stage='batch_bind_editor';$editorOwnedSession=Connect-WeinviewEditorSession $editorSessionContext $output $exe
     $script:own+=@{pid=[int]$editorOwnedSession.process.Id;creation_utc_ticks=[long]$editorOwnedSession.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe}
     Register-WeinviewEditorSession $editorSessionContext $editorOwnedSession $projectInput $output $exe $before $request.id
    }else{[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -cne $before){Fail 'Batch clone hash mismatch.'}}
    $batchDonorCache=@{};$batchDonorOpenPath=$null;$batchDonorHash=$null;$batchDonorClone=$null
    foreach($state in @($plan|Where-Object {$_.kind -ceq 'screen_copy_objects' -and $_.object_copy_contract.external_donor})){
     $donorPath=[string]$state.object_copy_arguments.donor_path;$donorHash=[string]$state.object_copy_arguments.expected_donor_sha256
     if($donorPath -ieq $projectInput -or $donorPath -ieq $output -or !(Test-Path -LiteralPath $donorPath -PathType Leaf) -or [IO.Path]::GetExtension($donorPath) -ine $expectedOutputExtension){Fail 'Existing distinct same-format batch object-copy donor required.'}
     $actualDonorHash=Hash $donorPath
     if($actualDonorHash -ine $donorHash){Fail 'Batch object-copy donor SHA256 mismatch.'}
     $donorHeader=New-Object byte[] 30;$donorStream=[IO.File]::OpenRead($donorPath)
     try{$donorRead=$donorStream.Read($donorHeader,0,30)}finally{$donorStream.Dispose()}
     if($read -ne 30 -or $donorRead -ne 30 -or [Text.Encoding]::Unicode.GetString($donorHeader,8,22) -eq '6.05.02.675' -or [BitConverter]::ToString($header,0,8) -cne [BitConverter]::ToString($donorHeader,0,8) -or [Text.Encoding]::Unicode.GetString($header,8,22) -cne [Text.Encoding]::Unicode.GetString($donorHeader,8,22)){Fail 'Batch object-copy donor must match current target native format and version.'}
     $sortedIds=[string[]]@(if($null -eq $state.object_copy_contract.object_ids){'*'}else{$state.object_copy_contract.object_ids});[Array]::Sort($sortedIds,[StringComparer]::Ordinal)
     $keySeparator=[char]0;$donorKey=$donorPath.ToLowerInvariant()+$keySeparator+$actualDonorHash.ToUpperInvariant()+$keySeparator+[string][int]$state.object_copy_contract.source_window_number+$keySeparator+($sortedIds -join $keySeparator)
     $rules=if($null -eq $state.object_copy_contract.address_replacements){@()}else{@($state.object_copy_contract.address_replacements)}
     $donorKey+=$keySeparator+[string]$rules.Count
     foreach($rule in $rules){
      foreach($field in @('address_kind','device_name','address_type','address','target_device_name','target_address_type','target_address')){$value=[string]$rule.rule.$field;$donorKey+=$keySeparator+[string]$value.Length+':'+$value}
      if($rule.rule.PSObject.Properties.Name -ccontains 'address_end'){$value=[string]$rule.rule.address_end;$donorKey+=$keySeparator+'address_end'+$keySeparator+[string]$value.Length+':'+$value}
     }
     $cached=$batchDonorCache[$donorKey];$state.donor_payload_reused=($null -ne $cached)
     if($null -eq $cached){
      $batchDonorOpenPath=$donorPath;$batchDonorHash=$actualDonorHash
      if($rules.Count){
       $batchDonorClone=Under (Join-Path $root ('.weinview-batch-donor-'+[Guid]::NewGuid().ToString('N')+$expectedOutputExtension)) $root
       if(Test-Path -LiteralPath $batchDonorClone){Fail 'Fresh batch external donor clone path required.'}
       [IO.File]::Copy($donorPath,$batchDonorClone,$false)
       if((Hash $batchDonorClone) -cne $actualDonorHash){Fail 'Batch external donor clone differs from source.'}
       $batchDonorOpenPath=$batchDonorClone
      }
      $donorPort=Get-WeinviewNativeHostPort
      $stage='batch_open_external_object_copy_donor';$s=StartOwned $exe $batchDonorOpenPath $true $false $donorPort;SetEditSession $s $batchDonorOpenPath $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
      Set-WeinviewScreenSession $s $batchDonorOpenPath $exe ($state.prefix+'.donor.identity.json')
      $stage='batch_prepare_external_object_copy_donor';$payload=Prepare-WeinviewObjectCopyDonorPayload $s $state.object_copy_contract $state.object_copy_arguments $actualDonorHash ($state.prefix+'.donor')
      $stage='batch_close_external_object_copy_donor';CloseSession $s $batchDonorOpenPath $actualDonorHash $true
      $s=$null;$script:pendingOwnedSession=$null;$batchDonorOpenPath=$null;$batchDonorHash=$null
      if($batchDonorClone){Remove-Item -LiteralPath $batchDonorClone -Force;if(Test-Path -LiteralPath $batchDonorClone){Fail 'Closed batch external donor clone still exists.'};$batchDonorClone=$null}
      if((Hash $donorPath) -cne $actualDonorHash){Fail 'Batch object-copy donor changed during native capture.'}
      $cached=@{payload=$payload;donor_object_count=@($payload.before_inventory.rows).Count};$batchDonorCache[$donorKey]=$cached
     }
     $state.donor_payload=Copy-WeinviewBatchObjectCopyDonorPayload $cached.payload;$state.donor_path=$donorPath;$state.donor_sha256=$actualDonorHash;$state.donor_window_number=[int]$state.object_copy_contract.source_window_number;$state.donor_object_count=[int]$cached.donor_object_count;$state.donor_unchanged=$true;$state.normal_donor_exit_verified=$true
    }
    if($editorSessionMode -and $editorSessionContext.reused){
     $s=$editorOwnedSession;$nativeHostPort=[int]$s.native_host_port;$script:pendingOwnedSession=$s
     if($batchNeedsForeground){
      $stage='activate_reused_editor';$pidActivated=$false
      try{
       $shell=New-Object -ComObject WScript.Shell
       try{$pidActivated=[bool]$shell.AppActivate([int]$s.process.Id)}finally{[Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)|Out-Null}
       $activation=$s.native.ActivateOwnedMain($s.main.Hwnd)
      }catch{
       $script:activationEvidence+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$editorSessionContext.record.creation_utc_ticks;path=$output;editor_session_reused=$true;pid_app_activate_returned=$pidActivated;activation_failed=$_.Exception.Message}
       throw
      }
      $script:activationEvidence+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$editorSessionContext.record.creation_utc_ticks;path=$output;editor_session_reused=$true;pid_app_activate_returned=$pidActivated;activation=$activation}
     }
    }
    else{
     $nativeHostPort=Get-WeinviewNativeHostPort
     $stage='batch_open_owned';$s=StartOwned $exe $output $batchNeedsForeground $batchAllowWindowless $nativeHostPort
     if($editorSessionMode){$editorOwnedSession=$s;Register-WeinviewEditorSession $editorSessionContext $s $projectInput $output $exe $before $request.id}
    }
    SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$before
    if($hasCopySteps){$s.addition_inventory_route='native_host'}
    if($hasScreenSteps -or $hasAddressSteps -or $hasLabelSteps){$s.owned_semantic_background=$true}
    if($hasScreenSteps -or $hasLabelSteps){Set-WeinviewScreenSession $s $output $exe ($batchPrefix+'.identity.json')}
    Write-WeinviewProgress 'read_batch_inputs' '正在读取本次修改所需的原厂内容'
    $macroBefore=Initialize-WeinviewBatchSnapshots $s $plan $batchPrefix $before
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Source/copy changed before batch import.'}
    $script:batchPreflightVerified=$true;WritePrivateJson ($batchPrefix+'.preflight.json') @{source_path=$projectInput;source_sha256=$before;output_path=$output;all_guards_verified_before_import=$true;step_kinds=@($plan|ForEach-Object {$_.kind});native_import_started=$false}
    $script:batchImportStarted=$true;Invoke-WeinviewBatchImports $s $plan $macroBefore $batchPrefix $before
    # The actual object kind is now available without opening any more dialogs.
    if($savedScreenBatch){$savedScreenBatch=Test-WeinviewBatchScreenSaveOnly $plan}
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Source/copy changed before explicit batch save.'}
    # Imported tables need not mark the title dirty. An interrupted batch's
    # explicit save must produce new bytes before advancing its registration.
    $stage='batch_save_once';$saved=SaveEditedProject $s $output $before 1500 -AllowUnchanged ($editorSessionMode -and !$hasWindowCreateSteps -and !$editorSessionContext.reconciliation_save)
    if($editorSessionMode){Save-WeinviewEditorSessionState $editorSessionContext $saved}
    $build=$null;$compileMessages=@()
    if($compileBatch){
     Write-WeinviewProgress 'compile_project' '正在编译工程'
     if($editorSessionMode){Prepare-WeinviewEditorCompileArtifacts $editorSessionContext $artifact $compileProvenance}
     $stage='batch_whole_project_compile';$build=Invoke-WeinviewWholeCompileCandidate -Session $s -ProjectPath $output -ExobPath $artifact -ExpectedProjectSha256 $saved -SelectedLanguages $batchSelectedSlots -StartupLanguage $batchStartupSlot
     if($a.PSObject.Properties.Name -ccontains 'expected_language_mode_map'){
      $expectedMap=@($a.expected_language_mode_map);$actualMap=@($build.language_mode_map)
      if($actualMap.Count -ne $expectedMap.Count){Fail 'Compiled batch language mode mapping differs from expected mapping.'}
      for($modeIndex=0;$modeIndex -lt $expectedMap.Count;$modeIndex++){
       if([int]$actualMap[$modeIndex].language_slot -ne [int]$expectedMap[$modeIndex].language_slot -or [int]$actualMap[$modeIndex].lw9134_value -ne [int]$expectedMap[$modeIndex].lw9134_value){Fail 'Compiled batch language mode mapping differs from expected mapping.'}
      }
     }
     $compileMessages=@($build.compile_log -split "`n")
     $stage='batch_close_compile_dialog';$null=WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}}
     if((Hash $output) -cne $saved){Fail 'Whole compiler changed the saved batch project.'}
    }
    $editorClosed=$false;$editorCloseStatus=$null;$windowCopyState=@()
    if($editorSessionMode){
     $stage='batch_editor_saved';$batchResults=Get-WeinviewBatchSessionResults $plan;$reopenVerified=$false
     if($a.close_editor -eq $true){
      $stage='batch_close_editor';$editorCloseStatus=CloseSession $s $output $saved $false $true
      $editorClosed=[bool]$editorCloseStatus.process_exited
      $editorSessionContext.normal_close=$editorClosed;$editorSessionContext.normal_exit_verified=[bool]$editorCloseStatus.normal_exit_verified
     }
    }else{
    $stage='batch_close_saved';CloseSession $s $output $saved $false
    $windowCopyState=@()
    if($savedScreenBatch){
     $stage='batch_screen_saved';$batchResults=Get-WeinviewBatchSavedScreenResults $plan;$reopenVerified=$false
    }else{
     $nativeHostPort=Get-WeinviewNativeHostPort
     $stage='batch_reopen_once';$s=StartOwned $exe $output $batchNeedsForeground $batchAllowWindowless $nativeHostPort;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     if($hasCopySteps){$s.addition_inventory_route='native_host'}
     if($hasScreenSteps -or $hasAddressSteps -or $hasLabelSteps){$s.owned_semantic_background=$true}
     if($hasScreenSteps -or $hasLabelSteps){Set-WeinviewScreenSession $s $output $exe ($batchPrefix+'.reopen-identity.json')}
     Write-WeinviewProgress 'read_saved_changes' '正在读取已保存的修改结果'
     $batchResults=Test-WeinviewBatchPersistence $s $plan $macroBefore $batchPrefix $saved
     $windowCopyState=@($plan|Where-Object {$_.kind -ceq 'window_copy'}|Select-Object -First 1)
     $stage='batch_close_reopened';CloseSession $s $output $saved $true;$reopenVerified=$true
    }
    }
    if((!($editorSessionMode -and $editorSessionContext.reused) -and (Hash $projectInput) -cne $before) -or (Hash $output) -cne $saved -or ($compileBatch -and (Hash $artifact) -cne $build.artifact_sha256)){Fail 'Final batch source/output/artifact invariant failed.'}
    foreach($state in @($plan|Where-Object {$_.kind -ceq 'window_copy'})){if((Hash ([string]$state.copy_arguments.donor_path)) -cne [string]$state.donor_sha256){Fail 'Final batch window-copy donor hash differs.'}}
    foreach($state in @($plan|Where-Object {$_.kind -ceq 'screen_copy_objects' -and $_.object_copy_contract.external_donor})){if((Hash ([string]$state.donor_path)) -cne [string]$state.donor_sha256){Fail 'Final batch object-copy donor hash differs.'}}
    if($compileBatch){
     $compileRecord=@{schema=1;kind='weinview-owned-whole-compile';project_path=$output;project_sha256=$saved;artifact_path=$artifact;artifact_sha256=$build.artifact_sha256;artifact_bytes=$build.artifact_bytes;compile_scope='whole_project';error_count=$build.error_count;warning_count=$build.warning_count;normal_main_exit_verified=(!$editorSessionMode -or $editorClosed);source_path=$projectInput;source_sha256=$before;created_utc=[DateTime]::UtcNow.ToString('o')}
     if($editorSessionMode){$compileRecord.editor_session_id=$editorSessionContext.session_id;$compileRecord.editor_session_active=(!$editorClosed)}
     if($editorClosed){$compileRecord.normal_main_exit_verified=[bool]$editorCloseStatus.normal_exit_verified;$compileRecord.editor_process_exit_code=[int]$editorCloseStatus.process_exit_code}
     WritePrivateJson $compileProvenance $compileRecord
    }
    foreach($result in $batchResults){$result.input_sha256=$before;$result.output_sha256=$saved}
    $data=@{output_path=$output;input_sha256=$before;output_sha256=$saved;source_unchanged=$true;project_saved=$true;reopen_verified=$reopenVerified;normal_main_exit_verified=$true;normal_reopen_exit_verified=$reopenVerified;steps=$batchResults;preflight_verified_before_import=$true;preflight_evidence_path=($batchPrefix+'.preflight.json');preflight_evidence_sha256=(Hash ($batchPrefix+'.preflight.json'));native_imports_completed=$script:batchImportsCompleted;project_save_count=1;project_reopen_count=if($savedScreenBatch){0}else{1};editor_source_writes=0;own_processes=$own;activation_evidence=$activationEvidence;compile_scope=if($compileBatch){'whole_project'}else{'not_requested'};artifact_path=if($compileBatch){$artifact}else{$null};artifact_sha256=if($compileBatch){$build.artifact_sha256}else{$null};artifact_bytes=if($compileBatch){$build.artifact_bytes}else{$null};error_count=if($compileBatch){$build.error_count}else{$null};warning_count=if($compileBatch){$build.warning_count}else{$null};compile_messages=$compileMessages;compile_sequence_observed=if($compileBatch){$build.compile_sequence_observed}else{$false};compile_intent_evidence=if($compileBatch){$build.compile_intent_evidence}else{$null};compile_path_evidence=if($compileBatch){$compilePathEvidence}else{$null};compile_provenance_path=if($compileBatch){$compileProvenance}else{$null};compile_provenance_sha256=if($compileBatch){Hash $compileProvenance}else{$null}}
    if($editorSessionMode){
     if(!$editorClosed -and $s.process.HasExited){Fail 'weinview_editor_session_reconciliation_required: Editor exited after saving; no automatic restart.'}
     $sourceUnchanged=(!$editorSessionContext.reused)
     $data.scope='editor_session_saved';$data.target_readback_scope='editor_session_saved';$data.full_properties_verified=$false
     $data.editor_session_id=$editorSessionContext.session_id;$data.editor_session_active=(!$editorClosed);$data.editor_session_reused=[bool]$editorSessionContext.reused;$data.editor_session_record=$editorSessionContext.path;$data.editor_session_state=if($editorClosed){'closed'}else{'active'}
     $data.editor_session_reconciled=[bool]$editorSessionContext.reconciled
     $data.source_unchanged=$sourceUnchanged;$data.normal_main_exit_verified=$editorClosed;$data.normal_reopen_exit_verified=$false;$data.reopen_verified=$false;$data.project_reopen_count=0;$data.editor_source_writes=if($editorSessionContext.reused){1}else{0};$data.project_save_count=1
     if($editorClosed){
      $data.editor_close_completed=$true;$data.editor_process_exit_code=[int]$editorCloseStatus.process_exit_code;$data.normal_main_exit_verified=[bool]$editorCloseStatus.normal_exit_verified
      if(!$editorCloseStatus.normal_exit_verified){$data.editor_close_warning='The saved editor closed after WM_CLOSE with nonzero exit code '+$editorCloseStatus.process_exit_code+'. Saved project bytes were unchanged; a clean process exit is not verified.'}
     }
     foreach($result in $batchResults){$result.project_saved=$true;$result.source_unchanged=$sourceUnchanged;$result.reopen_verified=$false;$result.normal_reopen_exit_verified=$false;$result.normal_main_exit_verified=$editorClosed}
     Complete-WeinviewEditorSession $editorSessionContext $saved $build $compileProvenance $editorClosed
    }
    if($savedScreenBatch){$data.scope=if(@($plan|Where-Object {$_.kind -ceq 'screen_update'}).Count){'edited_fields_and_saved_project'}else{'creation_fields_and_saved_project'};$data.target_readback_scope=$data.scope;$data.full_properties_verified=$false}
    if($compileBatch){foreach($languageField in @('available_languages','selected_languages','startup_language','startup_language_raw_index','startup_language_raw_text','startup_language_items','language_mode_map','all_language_controls','language_selection_verified')){$data[$languageField]=$build.$languageField}}
    if($windowCopyState.Count){$data.window_copy_windows_final=@($windowCopyState[0].final_window_directory.windows|Sort-Object {[int]$_.number});$data.window_copy_windows_reopened=@($windowCopyState[0].reopened_window_directory.windows|Sort-Object {[int]$_.number})}
   }elseif($request.operation -ceq 'project_accounts'){
    if($oldHeader -or $expectedOutputExtension -ine '.cmtp'){Fail 'Engineering preset accounts require a current cMT project.'}
    if($a.action -cnotin @('read','update')){Fail 'Account action read or update required.'}
    $allowedArguments=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','action','row','match_user_name','user_name','classes','enabled','password','probe_row')
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowedArguments}).Count){Fail 'Unreviewed engineering-account argument.'}
    $hasRow=@($a.PSObject.Properties.Name) -ccontains 'row';$hasName=@($a.PSObject.Properties.Name) -ccontains 'match_user_name'
    $editFields=@('enabled','user_name','classes','password');$suppliedFields=@($a.PSObject.Properties.Name|Where-Object {$_ -cin $editFields})
    $hasPassword=$suppliedFields -ccontains 'password'
    if($hasPassword -and ($a.password -isnot [string] -or $a.password.Length -lt 1 -or $a.password.Length -gt 128 -or $a.password.Contains([char]0))){Fail 'Engineering-account password input invalid.'}
    if($a.action -ceq 'update' -and ($hasRow -eq $hasName -or !$suppliedFields.Count)){Fail 'Update requires one returned row or exact existing account name, and at least one field.'}
    if($a.action -ceq 'read' -and ($hasRow -or $hasName -or $suppliedFields.Count)){Fail 'Account read accepts no edit fields.'}
    $probeRequested=@($a.PSObject.Properties.Name) -ccontains 'probe_row'
    if($probeRequested -and ($a.action -cne 'read' -or $a.probe_row -isnot [int] -or $a.probe_row -lt 0 -or $a.probe_row -gt 10)){Fail 'Read-only stored account probe requires row0..10.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ProjectSecurityTableControls.cs','ProjectSecurityAccountControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll','System.Windows.Forms.dll'
    foreach($helper in @('PlcConfigurationCandidate.ps1','NativeRibbonAction.ps1','ProjectSecurityOperation.ps1','ProjectSecurityAccountOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $output) -cne $before){Fail 'Engineering-account project clone differs.'}
    $stage='open_owned_project_accounts';$s=StartOwned $exe $output;SetEditSession $s $output $exe
    $stage='read_native_project_accounts';$beforeAccounts=@((Read-WeinviewProjectAccountsNonSecret $s).rows)
    if($beforeAccounts.Count -ne 11){Fail 'Original engineering-account table did not expose eleven account slots.'}
    if($a.action -ceq 'read'){
     $storedNameProbe=$null
     if($probeRequested){$stage='probe_stored_account_name';$storedNameProbe=Read-WeinviewStoredProjectAccountUserNameFromEditor -Session $s -Row ([int]$a.probe_row)}
     $stage='close_readonly_project_accounts';CloseSession $s $output $before $true
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Read-only account inspection changed project.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;source_unchanged=$true;action='read';accounts=$beforeAccounts;stored_name_probe=$storedNameProbe;project_saved=$false;reopen_verified=$false;normal_main_exit_verified=$true;normal_reopen_exit_verified=$false;password_changed=$false;password_input_submitted=$false;password_readback_performed=$false;password_value_recorded=$false;password_column_queried=$false;own_processes=$own;activation_evidence=$activationEvidence}
    }else{
     $row=if($hasRow){[int]$a.row}else{$found=@($beforeAccounts|Where-Object {$_.user_name -is [string] -and $_.user_name -cne 'unknown' -and $_.user_name -ceq [string]$a.match_user_name});if($found.Count -ne 1){Fail 'Existing account name must resolve to one native slot; use returned row for unnamed or unknown entries.'};[int]$found[0].row}
     $requestedClasses=$null;if($suppliedFields -ccontains 'classes'){$requestedClasses=[object[]]@($a.classes|ForEach-Object {[string]$_}|Sort-Object)}
     $requestedName=$null;if($suppliedFields -ccontains 'user_name'){$requestedName=[string]$a.user_name}
     $requestedEnabled=$null;if($suppliedFields -ccontains 'enabled'){$requestedEnabled=[bool]$a.enabled}
     $passwordInput=if($hasPassword){[string]$a.password}else{''}
     $stage='edit_native_project_account';$edit=Invoke-WeinviewProjectAccountEdit -Session $s -Row $row -UserName $requestedName -Password $passwordInput -Classes $requestedClasses -Enabled $requestedEnabled
     $passwordInput=$null
     if($edit.password_changed -ne $hasPassword -or $edit.password_input_submitted -ne $hasPassword -or $edit.password_value_recorded -or $edit.password_readback_performed -or !$edit.system_parameters_confirmed -or $edit.user_name_changed -ne ($null -ne $requestedName) -or $edit.user_name_input_submitted -ne ($null -ne $requestedName) -or $edit.classes_changed -ne ($null -ne $requestedClasses)){Fail 'Engineering project-account edit did not submit requested fields.'}
     $stage='save_project_accounts';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_project_accounts';CloseSession $s $output $saved $false
     $stage='reopen_project_accounts';$s=StartOwned $exe $output;SetEditSession $s $output $exe
     $stage='read_reopened_project_accounts';$afterAccounts=@((Read-WeinviewProjectAccountsNonSecret $s).rows)
     if($afterAccounts.Count -ne 11){Fail 'Saved account table size differs.'}
     $target=@($afterAccounts|Where-Object {$_.row -eq $row})
     if($target.Count -ne 1){Fail 'Saved/reopened project account slot missing.'}
     $enabledReadbackVerified=($target[0].row_enabled -is [bool] -and $target[0].row_enabled -eq $edit.row_enabled)
     if(($target[0].row_enabled -is [bool] -and !$enabledReadbackVerified) -or ($null -ne $requestedEnabled -and !$enabledReadbackVerified) -or ($null -ne $requestedName -and [bool]$target[0].user_name_readback_verified -and $target[0].user_name -cne $requestedName) -or ($null -ne $requestedClasses -and (@($target[0].classes|Sort-Object) -join ',') -cne ($requestedClasses -join ','))){Fail ('Saved/reopened project account known requested fields differ; requested_classes='+($requestedClasses -join ',')+', edited_classes='+(@($edit.classes) -join ',')+', reopened_classes='+(@($target[0].classes) -join ',')+', class_read_error='+[string]$target[0].read_errors.classes+', edited_enabled='+$edit.row_enabled+', reopened_enabled='+$target[0].row_enabled+'.')}
     $nameReadbackVerified=([bool]$target[0].user_name_readback_verified -and ($null -eq $requestedName -or $target[0].user_name -ceq $requestedName))
     $requestedFieldsReadbackVerified=($null -eq $requestedName -or $nameReadbackVerified) -and ($null -eq $requestedEnabled -or $enabledReadbackVerified) -and ($null -eq $requestedClasses -or (@($target[0].classes|Sort-Object) -join ',') -ceq ($requestedClasses -join ','))
     if($null -ne $requestedName -and !$requestedFieldsReadbackVerified -and !$edit.user_name_input_submitted){Fail 'Unknown original username without confirmed input submission.'}
     $stage='close_reopened_project_accounts';CloseSession $s $output $saved $true
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Project-account final source/output invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;action='update';row=$row;user_name=$target[0].user_name;user_name_input_submitted=[bool]$edit.user_name_input_submitted;user_name_readback_verified=[bool]$nameReadbackVerified;applied=$true;classes=$target[0].classes;row_enabled=$target[0].row_enabled;row_enabled_readback_verified=[bool]$enabledReadbackVerified;enabled_before=$edit.enabled_before;requested_fields=$suppliedFields;account_reopened_verified=[bool]$requestedFieldsReadbackVerified;accounts=$afterAccounts;project_saved=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;password_changed=$edit.password_changed;password_input_submitted=$edit.password_input_submitted;password_readback_performed=$false;password_value_recorded=$false;password_column_queried=$false;own_processes=$own;activation_evidence=$activationEvidence;next_tool='weinview_project_compile'}
    }
   }elseif($request.operation -ceq 'recipe_view_add'){
    if($oldHeader -or $expectedOutputExtension -ine '.cmtp'){Fail 'Recipe View requires a current cMT project with a native Recipe Database.'}
    $windowNumber=SelectedWindowNumber $a
    $allowedArguments=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','window_number','recipe_name','display_fields','x','y','sort_enabled','sort_by','sort_direction')
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowedArguments}).Count){Fail 'Unreviewed Recipe View argument.'}
    if([string]$a.recipe_name -cnotmatch '^[A-Za-z0-9]{1,64}$' -or @($a.display_fields).Count -lt 1 -or @($a.display_fields).Count -gt 1000){Fail 'Native Recipe View name and displayed fields required.'}
    $requestedFields=@($a.display_fields|ForEach-Object {[string]$_})
    if(@($requestedFields|Select-Object -Unique).Count -ne $requestedFields.Count -or @($requestedFields|Where-Object {$_ -cnotmatch '^[A-Za-z0-9_]{1,64}$'}).Count){Fail 'Recipe View display fields must be distinct native field names.'}
    $sortRequested=@($a.PSObject.Properties.Name|Where-Object {$_ -cin @('sort_enabled','sort_by','sort_direction')}).Count -gt 0
    if(($a.PSObject.Properties.Name -ccontains 'sort_enabled') -and $a.sort_enabled -isnot [bool]){Fail 'Recipe View sort_enabled must be Boolean.'}
    if(($a.PSObject.Properties.Name -ccontains 'sort_direction') -and $a.sort_direction -cnotin @('ascending','descending')){Fail 'Recipe View sort_direction must be ascending or descending.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','NativeScreenScene.cs','ObjectRibbonControls.cs','WindowTreeControls.cs','AlarmDisplayDialogControls.cs','RecipeDatabaseControls.cs','RecipeViewRibbonControls.cs','RecipeViewDisplayControls.cs','RecipeViewClipboard.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    foreach($helper in @('PlcConfigurationCandidate.ps1','ObjectRibbonAction.ps1','WindowOperation.ps1','WindowRibbonAction.ps1','ScreenWorkflow.ps1','AlarmDisplayOperation.ps1','RecipeDatabaseProjectOperation.ps1','RecipeDatabaseOperation.ps1','RecipeViewRibbonAction.ps1','RecipeViewOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}
    $python=Join-Path $PSScriptRoot '..\engine\python\python.exe'
    if(!(Test-Path -LiteralPath $python -PathType Leaf)){Fail 'Bundled native Recipe Database reader required.'}
    $prefix=Under (Join-Path ([IO.Path]::GetDirectoryName($output)) ('.weinview-recipe-view-'+[Guid]::NewGuid().ToString('N'))) $root
    $nativeDb=$prefix+'.definition.db';$readRequest=$prefix+'.read-request.json';$readReceipt=$prefix+'.read-receipt.json'
    $associatedDb=$output+'.recipe.db';if(Test-Path -LiteralPath $associatedDb){Fail 'Fresh associated native Recipe Database export required.'}
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $output) -cne $before){Fail 'Recipe View project clone differs.'}
    $stage='open_owned_recipe_view';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe
    $stage='export_current_recipe_definition';$context=Open-WeinviewRecipeDatabase $s $prefix
    $definition=Export-WeinviewRecipeDatabase $s $context ([string]$a.recipe_name) $nativeDb
    @{operation='read';source_db=$nativeDb;recipe=[string]$a.recipe_name;offset=0;limit=1000}|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $readRequest -Encoding UTF8
    $read=Invoke-WeinviewRecipeDatabaseCodec $python $readRequest $readReceipt
    $recipe=$read.recipes.PSObject.Properties[[string]$a.recipe_name].Value
    if(!$recipe){Fail 'Exported native Recipe Database did not contain the selected recipe.'}
    $fieldNames=@($recipe.columns|ForEach-Object {[string]$_.name})
    if(($a.PSObject.Properties.Name -ccontains 'sort_by') -and [string]$a.sort_by -cnotin $fieldNames){Fail 'Recipe View sort_by absent from exported native definition.'}
    if($fieldNames.Count -lt 1 -or @($fieldNames|Select-Object -Unique).Count -ne $fieldNames.Count -or @($requestedFields|Where-Object {$_ -cnotin $fieldNames}).Count){Fail 'Requested Recipe View Display field is not in the current native definition.'}
    Close-WeinviewRecipeDatabaseReadOnly $s $context
    $stage='select_recipe_view_screen';Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $selectedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.selected')
    $beforeDirectory=Get-WeinviewWindowDirectory -Session $s
    $stage='add_native_recipe_view';$created=Invoke-WeinviewRecipeViewAddition $s ([string]$a.recipe_name) $fieldNames $requestedFields ([int]$a.x) ([int]$a.y) $(if($a.PSObject.Properties.Name -ccontains 'sort_enabled'){$a.sort_enabled}else{$null}) ([string]$a.sort_by) ([string]$a.sort_direction)
    if($created.object_id -cnotmatch '^RV_[0-9]{1,5}$' -or $created.native_kind -cne 'RecipeView' -or $created.native_raw_label -cne $created.object_id){Fail 'Original Recipe View directory identity differs from observed RV object.'}
    $stage='save_recipe_view';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_recipe_view';CloseSession $s $output $saved $false
    $stage='reopen_recipe_view';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_reopened_recipe_view_screen';$reopenedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.reopened-selected')
    $reopenedDirectory=Get-WeinviewWindowDirectory -Session $s
    $matching=@($reopenedDirectory.rows|Where-Object {$_.object_id -ceq $created.object_id -and $_.raw_label -ceq $created.native_raw_label})
    if($matching.Count -ne 1 -or @($reopenedDirectory.rows).Count -ne (@($beforeDirectory.rows).Count+1)){Fail 'Saved Recipe View directory row did not reappear after original-vendor reopen.'}
    $stage='read_reopened_recipe_view_sort';$reopenedTarget=Read-WeinviewTargetObject $s ([string]$created.object_id) $saved ($prefix+'.reopened-target') $false $false
    if($reopenedTarget.object.recipe_name -cne [string]$a.recipe_name -or (@($reopenedTarget.object.displayed_fields) -join [char]31) -cne ($requestedFields -join [char]31) -or [bool]$reopenedTarget.object.sort_enabled -ne [bool]$created.sort_enabled -or [string]$reopenedTarget.object.sort_by -cne [string]$created.sort_by -or [string]$reopenedTarget.object.sort_direction -cne [string]$created.sort_direction){Fail 'Saved Recipe View recipe/display/sort differs after native reopen.'}
    $stage='close_reopened_recipe_view';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Recipe View final source/output invariant failed.'}
    $stage='retain_native_recipe_database';[IO.File]::Copy($nativeDb,$associatedDb,$false)
    $associatedDbSha=Hash $associatedDb
    if($associatedDbSha -cne $definition.sha256){Fail 'Associated Recipe Database export differs from this project definition.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;project_saved=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;screen=$windowNumber;recipe_name=[string]$a.recipe_name;field_names=$fieldNames;displayed_fields=$requestedFields;sort_enabled=[bool]$reopenedTarget.object.sort_enabled;sort_by=[string]$reopenedTarget.object.sort_by;sort_direction=[string]$reopenedTarget.object.sort_direction;object_readback=$reopenedTarget.object;object_id=$created.object_id;native_raw_label=$created.native_raw_label;native_object_created=$true;native_property_written=$true;native_directory_reopened=$true;recipe_display_persisted_verified=$true;sort_enabled_verified=$true;references_relinked=$false;runtime_data_verified=$false;definition_export=$definition;associated_db_path=$associatedDb;associated_db_sha256=$associatedDbSha;associated_db_bytes=(Get-Item -LiteralPath $associatedDb).Length;directory_before=$beforeDirectory;directory_reopened=$reopenedDirectory;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;reopened_window_geometry_evidence=$reopenedWindow.geometry_evidence;own_processes=$own;activation_evidence=$activationEvidence;next_tool='weinview_project_compile'}
   }elseif($request.operation -ceq 'screen_add_trends'){
    if($oldHeader){Fail 'Current-version native project required for finite Trend workflow.'}
    $windowNumber=SelectedWindowNumber $a
    $allowedArguments=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','screen','window_number','objects')
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowedArguments}).Count){Fail 'Unreviewed Trend argument.'}
    . (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1');. (Join-Path $PSScriptRoot 'CommonObjectsAdditionOperation.ps1');. (Join-Path $PSScriptRoot 'TrendOperation.ps1')
    $items=@(Assert-WeinviewTrendInputs -Objects $a.objects)
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeSemanticControls.cs'),(Join-Path $PSScriptRoot 'WindowRibbonControls.cs'),(Join-Path $PSScriptRoot 'NativeScreenScene.cs'),(Join-Path $PSScriptRoot 'ObjectRibbonControls.cs'),(Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'NumericTagSettingsControls.cs'),(Join-Path $PSScriptRoot 'FunctionWindowTargetControls.cs'),(Join-Path $PSScriptRoot 'BitAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'WindowTreeControls.cs'),(Join-Path $PSScriptRoot 'AlarmDisplayDialogControls.cs'),(Join-Path $PSScriptRoot 'SamplingRibbonControls.cs'),(Join-Path $PSScriptRoot 'TrendRibbonControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    $prefix=Under (Join-Path $root ('.weinview-trend-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -cne $before){Fail 'Trend clone hash differs.'}
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='open_owned_trends';$s=StartOwned $exe $output $false $false $nativeHostPort;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='select_trend_screen';$selectedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.selected')
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Trend requires actual native800x480 selected basic window.'}
    $stage='apply_new_trends';$applied=Invoke-WeinviewTrendAddition -Session $s -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
    if(!$applied.native_fields_verified -or !$applied.sampling_binding_verified -or !$applied.untouched_objects_verified -or $applied.full_properties_verified -or $applied.channel_grid_values_verified -or $applied.bounding_boxes_verified -or $applied.collision_verified -or @($applied.objects).Count -ne $items.Count -or $applied.profile -cne 'weinview-cn421-tk800x480-native-trend-v1'){Fail 'Native finite Trend fields/protection/binding/profile missing.'}
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Trend source/copy bytes changed before save.'}
    $stage='save_trend_addition';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_trends';CloseSession $s $output $saved $false
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='reopen_trends';$s=StartOwned $exe $output $false $false $nativeHostPort;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_persisted_trends';$reopenedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.reopened-selected')
    if($reopenedWindow.width -ne $selectedWindow.width -or $reopenedWindow.height -ne $selectedWindow.height -or $reopenedWindow.name -cne $selectedWindow.name){Fail 'Persisted Trend selected window differs.'}
    $stage='read_persisted_trends';$persisted=Read-WeinviewTrendSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot ([string[]]@($applied.objects|ForEach-Object {$_.object_id})) $applied.creation_evidence
    Assert-WeinviewAdditionSnapshots $applied.after_snapshot.screen_snapshot $persisted.screen_snapshot 0
    Assert-WeinviewTrendsPersisted $applied $persisted $s
    $addedObjects=@();foreach($created in @($applied.objects)){$matches=@($persisted.screen_snapshot.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1){Fail 'Persisted requested Trend ID is not unique.'};$addedObjects+=$matches[0]}
    $stage='close_readonly_trend_reopen';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Trend final source/output invariant failed.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;project_saved=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$persisted.screen_snapshot.window_name;profile=$applied.profile;objects_before=@($applied.before_snapshot.screen_snapshot.objects);objects_after=@($persisted.screen_snapshot.objects);objects_readback=$addedObjects;before_object_count=@($applied.before_snapshot.screen_snapshot.objects).Count;after_object_count=@($persisted.screen_snapshot.objects).Count;directory_before=$applied.before_snapshot.screen_snapshot.directory;directory_after=$applied.after_snapshot.screen_snapshot.directory;directory_reopened=$persisted.screen_snapshot.directory;alarm_displays_before=@($applied.before_snapshot.alarm_displays);alarm_displays_after=@($applied.after_snapshot.alarm_displays);alarm_displays_reopened=@($persisted.alarm_displays);sampling_csv=$applied.sampling_csv;sampling_export_evidence=$applied.sampling_export_evidence;sampling_bindings=$applied.sampling_bindings;sampling_channel_bindings=$applied.sampling_channel_bindings;sampling_binding_verified=$true;new_objects_created=$true;native_fields_verified=$true;persisted_verified=$true;untouched_objects_verified=$true;untouched_objects_verification_scope=$applied.untouched_objects_verification_scope;full_properties_verified=$false;channel_grid_values_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;online_connection_tested=$false;creation_evidence=$applied.creation_evidence;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;reopened_window_geometry_evidence=$reopenedWindow.geometry_evidence;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.persisted.alarm-snapshot.json'}
   }elseif($request.operation -ceq 'screen_add_common_objects'){
    if($oldHeader){Fail 'Current-version native project required for finite Common objects workflow.'}
    $windowNumber=SelectedWindowNumber $a
    $allowedArguments=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','screen','window_number','objects')
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowedArguments}).Count){Fail 'Unreviewed Common objects argument.'}
    . (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1')
    . (Join-Path $PSScriptRoot 'CommonObjectRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'CommonObjectsAdditionOperation.ps1')
    $optionListRequested=(@($a.objects).Count -eq 1 -and $a.objects[0].kind -ceq 'option_list')
    $pictureRequested=(@($a.objects).Count -gt 0 -and @($a.objects|Where-Object {$_.kind -cne 'picture'}).Count -eq 0)
    if($optionListRequested){. (Join-Path $PSScriptRoot 'OptionListAdditionOperation.ps1');$items=@($a.objects)}else{
     if($pictureRequested){. (Join-Path $PSScriptRoot 'PictureAdditionOperation.ps1');$items=@($a.objects)}else{
      $items=@(Assert-WeinviewCommonObjectsInputs -Objects $a.objects)
      if(!(Get-Command Invoke-WeinviewTextRibbon -ErrorAction SilentlyContinue)){Fail 'Verified finite Text ribbon entry is unavailable; no native addition.'}
      if(@($items|Where-Object {$_.kind -ceq 'rectangle'}).Count -and !(Get-Command Invoke-WeinviewRectangleRibbon -ErrorAction SilentlyContinue)){Fail 'Verified finite Rectangle ribbon entry is unavailable; no native addition.'}
     }
    }
    Add-Type -AssemblyName Accessibility
    $commonTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','NativeScreenScene.cs','ObjectRibbonControls.cs','NumericAddressTypeControls.cs','NumericTagSettingsControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs','AlarmDisplayDialogControls.cs','CommonObjectRibbonControls.cs')
    if($optionListRequested){$commonTypes+=,'OptionListGridControls.cs'}
    if($pictureRequested){$commonTypes+=@('NativeResourceReuseControls.cs','PictureRibbonControls.cs')}
    Add-Type -Path @($commonTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1')
    . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    $prefix=Under (Join-Path $root ('.weinview-common-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -cne $before){Fail 'Common objects clone hash differs.'}
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='open_owned_common_objects';$s=StartOwned $exe $output $true $false $nativeHostPort;if($optionListRequested){$s.owned_semantic_background=$true};SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='select_common_objects_screen';$selectedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.selected')
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Common objects require bounded actual native selected-window dimensions.'}
    $stage='apply_common_objects'
    if($optionListRequested){
     $option=Assert-WeinviewOptionListInputs $items[0] ([int]$selectedWindow.width) ([int]$selectedWindow.height)
     $applied=Invoke-WeinviewOptionListAddition -Session $s -Mode Apply -Object $option -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
    }elseif($pictureRequested){
     $applied=Invoke-WeinviewPictureAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
    }else{$applied=Invoke-WeinviewCommonObjectsAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot}
    $expectedProfile=if($optionListRequested){'weinview-cn421-native-option-list-v1'}elseif($pictureRequested){'weinview-cn421-native-picture-v1'}else{'weinview-cn421-tk800x480-native-window-v1'}
    if(!$applied.native_fields_verified -or $applied.full_properties_verified -or $applied.bounding_boxes_verified -or $applied.collision_verified -or $applied.untouched_objects_verified -or $applied.untouched_objects_verification_scope -cne 'native directory ID/kind/label/order only; new target fields read' -or @($applied.objects).Count -ne $items.Count -or $applied.profile -cne $expectedProfile){Fail 'Native finite common-object fields/protection/profile missing.'}
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Common objects source/clone bytes changed before reviewed save.'}
    $stage='save_common_objects_addition';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_common_objects';CloseSession $s $output $saved $false
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='reopen_common_objects';$s=StartOwned $exe $output $true $false $nativeHostPort;if($optionListRequested){$s.owned_semantic_background=$true};SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_persisted_common_objects';$reopenedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.reopened-selected')
    if($reopenedWindow.width -ne $selectedWindow.width -or $reopenedWindow.height -ne $selectedWindow.height -or $reopenedWindow.name -cne $selectedWindow.name){Fail 'Persisted Common objects selected window differs.'}
    $stage='read_persisted_common_objects'
    if($optionListRequested){
     $reopenedSnapshot=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot @([string]$applied.objects[0].object_id)
     $persisted=[pscustomobject]@{screen_snapshot=$reopenedSnapshot;alarm_displays=@()}
     Assert-WeinviewAdditionSnapshots $applied.before_snapshot.screen_snapshot $reopenedSnapshot 1
     Assert-WeinviewAdditionSnapshots $applied.after_snapshot.screen_snapshot $reopenedSnapshot 0
    }else{
     $reopenedSnapshot=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot ([string[]]@($applied.objects|ForEach-Object {$_.object_id}))
     $persisted=[pscustomobject]@{screen_snapshot=$reopenedSnapshot;alarm_displays=@()}
     Assert-WeinviewAdditionSnapshots $applied.before_snapshot.screen_snapshot $reopenedSnapshot $items.Count
     Assert-WeinviewAdditionSnapshots $applied.after_snapshot.screen_snapshot $reopenedSnapshot 0
     foreach($created in @($applied.objects)){$matches=@($reopenedSnapshot.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1 -or $matches[0].object_sha256 -cne $created.object_sha256 -or $matches[0].canonical_json -cne $created.canonical_json){Fail 'Persisted new common-object native fields differ.'}}
    }
    $addedObjects=@();foreach($created in @($applied.objects)){$matches=@($persisted.screen_snapshot.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1){Fail 'Persisted requested common-object ID is not unique.'};$addedObjects+=$matches[0]}
     $appearanceColors=@(CompleteAdditionAppearanceColors $s $applied.appearance_color_evidence $saved ($prefix+'.persisted'))
    $stage='close_readonly_common_objects_reopen';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Common objects addition final source/output invariant failed.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;project_saved=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$persisted.screen_snapshot.window_name;profile=$applied.profile;objects_before=@($applied.before_snapshot.screen_snapshot.objects);objects_after=@($persisted.screen_snapshot.objects);objects_readback=$addedObjects;before_object_count=@($applied.before_snapshot.screen_snapshot.objects).Count;after_object_count=@($persisted.screen_snapshot.objects).Count;directory_before=$applied.before_snapshot.screen_snapshot.directory;directory_after=$applied.after_snapshot.screen_snapshot.directory;directory_reopened=$persisted.screen_snapshot.directory;alarm_displays_before=@($applied.before_snapshot.alarm_displays);alarm_displays_after=@($applied.after_snapshot.alarm_displays);alarm_displays_reopened=@($persisted.alarm_displays);resource_bindings=if($pictureRequested){@($applied.resource_bindings)}else{@()};new_objects_created=$true;native_fields_verified=$true;persisted_verified=$true;untouched_objects_verified=[bool]$applied.untouched_objects_verified;untouched_objects_verification_scope=$applied.untouched_objects_verification_scope;full_properties_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;online_connection_tested=$false;creation_evidence=$applied.creation_evidence;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;reopened_window_geometry_evidence=$reopenedWindow.geometry_evidence;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.persisted.snapshot.json'}
     $data.appearance_color_evidence=$appearanceColors
   }elseif($request.operation -in @('alarm_display_read','alarm_display_add','alarm_display_configure')){

    if($oldHeader){Fail 'Current-version native project required for Alarm Display workflow.'}
    $windowNumber=SelectedWindowNumber $a
    . (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1')
    $allowedArguments=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','screen','window_number')
    if($request.operation -eq 'alarm_display_add'){$allowedArguments+='objects'}
    if($request.operation -eq 'alarm_display_configure'){$allowedArguments+=@('object_id','expected_properties_sha256','ack_enabled','ack_output_address','time_display_chars','message_display_chars','use_object_heading')}
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowedArguments}).Count){Fail 'Unreviewed Alarm Display argument.'}
    $items=$null;if($request.operation -eq 'alarm_display_add'){$items=@(Assert-WeinviewAlarmDisplayInputs -Objects $a.objects)}
    $configuration=$null;if($request.operation -eq 'alarm_display_configure'){$configuration=Assert-WeinviewAlarmDisplayConfigureInputs $a}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeSemanticControls.cs'),(Join-Path $PSScriptRoot 'WindowRibbonControls.cs'),(Join-Path $PSScriptRoot 'NativeScreenScene.cs'),(Join-Path $PSScriptRoot 'ObjectRibbonControls.cs'),(Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'NumericTagSettingsControls.cs'),(Join-Path $PSScriptRoot 'FunctionWindowTargetControls.cs'),(Join-Path $PSScriptRoot 'BitAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'WindowTreeControls.cs'),(Join-Path $PSScriptRoot 'AlarmDisplayDialogControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1')
    . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    $prefix=Under (Join-Path $root ('.weinview-alarm-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Alarm Display workflow clone hash differs.'}
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='open_owned_alarm_display';$s=StartOwned $exe $output $false $false $nativeHostPort;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $null=Set-WeinviewAlarmDisplayForeground $s
    $stage='select_alarm_display_screen';$selectedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.selected')
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Alarm Display requires bounded actual native selected-window dimensions.'}
    if($request.operation -eq 'alarm_display_read'){
     $stage='read_native_alarm_display';$snapshot=Invoke-WeinviewAlarmDisplayRead $s $before ($prefix+'.read') $PSScriptRoot -DirectoryOnly
     $objects=@(New-WeinviewAlarmDisplayReceiptObjects $snapshot)
     $stage='close_readonly_alarm_display';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Readonly Alarm Display source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;source_unchanged=$true;project_saved=$false;normal_main_exit_verified=$true;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$snapshot.screen_snapshot.window_name;profile=(Get-WeinviewAlarmDisplayProfileName $s);objects=$objects;alarm_display_count=$objects.Count;snapshot=$snapshot;unknown_existing_bounds=@($snapshot.screen_snapshot.objects|Where-Object {!$_.supported -and $_.object_id -cnotmatch '^AL_[0-9]{1,5}$'}).Count;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;native_fields_verified=$true;full_properties_verified=$false;reopen_verified=$false;runtime_alarm_verified=$false;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.read.alarm-snapshot.json'}
    }elseif($request.operation -eq 'alarm_display_configure'){
     $stage='configure_existing_alarm_display';$applied=Invoke-WeinviewAlarmDisplayConfigure $s $configuration $before ($prefix+'.configure') $PSScriptRoot
     if(!$applied.native_fields_verified -or !$applied.untouched_objects_verified -or $applied.full_properties_verified -or $applied.runtime_ack_verified){Fail 'Native AL configuration finite/protection evidence missing.'}
     $saved=$before;if($applied.changed){$stage='save_alarm_display_configuration';$saved=SaveEditedProject $s $output $before}
     $stage='close_alarm_display_configuration';CloseSession $s $output $saved (!$applied.changed)
     $nativeHostPort=Get-WeinviewNativeHostPort
     $stage='reopen_alarm_display_configuration';$s=StartOwned $exe $output $false $false $nativeHostPort;SetEditSession $s $output $exe
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
     $null=Set-WeinviewAlarmDisplayForeground $s
     $stage='select_persisted_alarm_configuration';$reopenedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.reopened-selected')
     if($reopenedWindow.width -ne $selectedWindow.width -or $reopenedWindow.height -ne $selectedWindow.height -or $reopenedWindow.name -cne $selectedWindow.name){Fail 'Persisted selected AL configuration window differs.'}
     $stage='persisted_alarm_configuration_readback';$persisted=Invoke-WeinviewAlarmDisplayRead $s $saved ($prefix+'.persisted') $PSScriptRoot -DirectoryOnly
     Assert-WeinviewAlarmDisplayPreservation $applied.after_snapshot $persisted 0
     Assert-WeinviewAlarmDisplayConfigurationPreservation $applied.before_snapshot $persisted $configuration.object_id $configuration
     $configuredObjects=@(New-WeinviewAlarmDisplayReceiptObjects $persisted @($configuration.object_id))
     if($configuredObjects.Count -ne 1){Fail 'Persisted configured AL missing.'}
     $stage='close_readonly_alarm_configuration_reopen';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'AL configuration source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;project_saved=[bool]$applied.changed;changed=[bool]$applied.changed;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;persisted_verified=$true;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$persisted.screen_snapshot.window_name;profile=$applied.profile;object_id=$configuration.object_id;expected_properties_sha256=$configuration.expected_properties_sha256;ack_enabled=[bool]$configuration.ack_enabled;ack_output_address=$configuration.ack_output_address;objects=$configuredObjects;alarm_display_count=@($persisted.alarm_displays).Count;before_snapshot=$applied.before_snapshot;after_snapshot=$applied.after_snapshot;reopened_snapshot=$persisted;untouched_objects_verified=$true;untouched_objects_verification_scope=$applied.untouched_objects_verification_scope;unknown_existing_bounds=$applied.unknown_existing_bounds;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;reopened_window_geometry_evidence=$reopenedWindow.geometry_evidence;native_fields_verified=$true;full_properties_verified=$false;runtime_alarm_verified=$false;runtime_ack_verified=$false;configuration_evidence=$applied.configuration_evidence;time_display_chars=$configuration.time_display_chars;message_display_chars=$configuration.message_display_chars;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.persisted.alarm-snapshot.json'}
    }else{
     $stage='apply_new_alarm_displays';$applied=Invoke-WeinviewAlarmDisplayAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
     if(!$applied.native_fields_verified -or $applied.full_properties_verified -or $applied.untouched_objects_verified -or $applied.untouched_objects_verification_scope -cne 'native directory ID/kind/label/order only; new target fields read' -or @($applied.objects).Count -ne $items.Count){Fail 'Native Alarm Display finite fields/protection missing.'}
     $stage='save_alarm_display_addition';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_alarm_display_addition';CloseSession $s $output $saved $false
     $nativeHostPort=Get-WeinviewNativeHostPort
     $stage='reopen_alarm_display_addition';$s=StartOwned $exe $output $false $false $nativeHostPort;SetEditSession $s $output $exe
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
     $null=Set-WeinviewAlarmDisplayForeground $s
     $stage='select_persisted_alarm_display_screen';$reopenedWindow=Select-WeinviewAlarmDisplayWindow $s $windowNumber ($prefix+'.reopened-selected')
     if($reopenedWindow.width -ne $selectedWindow.width -or $reopenedWindow.height -ne $selectedWindow.height -or $reopenedWindow.name -cne $selectedWindow.name){Fail 'Persisted selected Alarm Display window differs.'}
     $stage='persisted_alarm_display_readback';$reopenedScreen=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot
     Assert-WeinviewAdditionSnapshots $applied.before_snapshot.screen_snapshot $reopenedScreen $items.Count
     Assert-WeinviewAdditionSnapshots $applied.after_snapshot.screen_snapshot $reopenedScreen 0
     $createdIds=@($applied.objects.object_id);$reopenedAlarms=@()
     foreach($created in @($applied.objects)){
      $directory=Get-WeinviewWindowDirectory $s;$row=@($directory.rows|Where-Object {$_.object_id -ceq $created.object_id})
      if($row.Count -ne 1){Fail 'Persisted new AL directory identity missing.'}
      $dialog=Open-WeinviewAlarmDisplayObject $s $directory $row[0]
      $actual=Read-WeinviewAlarmDisplayDialog $s $dialog $created.object_id
      WritePrivateJson ($prefix+'.persisted.'+$created.object_id+'.alarm-read.json') $actual
      Close-WeinviewScreenDialog $s $dialog $false
      $reopenedAlarms+=[pscustomobject]@{object_id=$created.object_id;actual=$actual;observed_properties_json=($actual|ConvertTo-Json -Depth 8 -Compress);observed_properties_sha256=(Get-WeinviewAlarmDisplayPropertyHash $actual);native_fields_verified=$true;full_properties_verified=$false;editable_fields=@('description','rect','font_size')}
     }
     $persisted=[pscustomobject]@{screen_snapshot=$reopenedScreen;alarm_displays=$reopenedAlarms;source_sha256=$saved;scope='native directory ID/kind/label/order only; new target fields read';saved=$false;reopened_verified=$false;runtime_alarm_verified=$false}
     $addedObjects=@(New-WeinviewAlarmDisplayReceiptObjects $persisted $createdIds)
     foreach($created in @($applied.objects)){$matches=@($addedObjects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1 -or $matches[0].observed_properties_sha256 -cne $created.observed_properties_sha256){Fail 'Persisted new AL finite fields differ.'}}
     $stage='close_readonly_alarm_display_reopen';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Alarm Display addition source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;source_unchanged=$true;project_saved=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$persisted.screen_snapshot.window_name;profile=$applied.profile;objects=$addedObjects;alarm_displays_added=$addedObjects.Count;persisted_verified=$true;alarm_display_count=@($reopenedScreen.directory.rows|Where-Object {$_.object_id -cmatch '^AL_[0-9]{1,5}$'}).Count;before_snapshot=$applied.before_snapshot;after_snapshot=$applied.after_snapshot;reopened_snapshot=$persisted;directory_before=$applied.before_snapshot.screen_snapshot.directory;directory_after=$applied.after_snapshot.screen_snapshot.directory;directory_reopened=$reopenedScreen.directory;alarm_displays_before=@();alarm_displays_after=@();alarm_displays_reopened=@();untouched_objects_verified=$false;untouched_objects_verification_scope=$applied.untouched_objects_verification_scope;unknown_existing_bounds=$applied.unknown_existing_bounds;collision_verification_scope=$applied.collision_verification_scope;selected_window_geometry_evidence=$selectedWindow.geometry_evidence;reopened_window_geometry_evidence=$reopenedWindow.geometry_evidence;native_fields_verified=$true;full_properties_verified=$false;runtime_alarm_verified=$false;creation_evidence=$applied.objects;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.persisted.snapshot.json'}
    }
   }elseif($request.operation -in @('sampling_read','sampling_append')){
    $stage='sampling_preflight'
    if($oldHeader){Fail 'Current-version native project required for sampling CSV exchange.'}
    $samplingAllowed=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path')
    if($request.operation -ceq 'sampling_append'){$samplingAllowed+=@('expected_sampling_sha256','objects')}
    if(@($a.PSObject.Properties.Name|Where-Object {$_ -cnotin $samplingAllowed}).Count){Fail 'Unreviewed Sampling argument.'}
    . (Join-Path $PSScriptRoot 'SamplingCsvCodec.ps1')
    . (Join-Path $PSScriptRoot 'SamplingOperation.ps1')
    . (Join-Path $PSScriptRoot 'ProjectAddressEvidence.ps1')
    if($request.operation -ceq 'sampling_append'){
     if($a.expected_sampling_sha256 -isnot [string] -or $a.expected_sampling_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$' -or $a.objects -isnot [array] -or @($a.objects).Count -lt 1 -or @($a.objects).Count -gt 8){Fail 'Sampling exact table SHA and one to eight typed objects required.'}
     $samplingItems=@($a.objects);$samplingNames=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
     foreach($samplingItem in $samplingItems){
      if($null -eq $samplingItem -or $samplingItem -isnot [pscustomobject]){Fail 'Typed Sampling object required.'}
      if(!($samplingItem.PSObject.Properties.Name -ccontains 'tag_name')){$null=Assert-WeinviewSamplingCsvObject $samplingItem}
      if(!$samplingNames.Add($samplingItem.description)){Fail 'New Sampling descriptions must be unique.'}
     }
    }
    Add-Type -AssemblyName Accessibility
    $samplingNeedsAddress=($request.operation -ceq 'sampling_append' -and (Test-WeinviewAddressEvidenceRequired $samplingItems))
    $samplingTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','SamplingRibbonControls.cs')
    if($samplingNeedsAddress){$samplingTypes+=@('ServerDeviceDirectoryControls.cs','TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs')}
    Add-Type -Path @($samplingTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1');. (Join-Path $PSScriptRoot 'SamplingRibbonAction.ps1')
    if($samplingNeedsAddress){foreach($helper in @('NativeRibbonAction.ps1','ServerConfigurationOperation.ps1','TagRibbonAction.ps1','TagOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}}
    $samplingPrefix=Under (Join-Path $root ('.weinview-sampling-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';$samplingClone=New-WeinviewSamplingClone $projectInput $output $before
    $stage='open_owned_sampling';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$before
    $samplingAddressEvidence=$null
    if($samplingNeedsAddress){$stage='read_current_sampling_address_evidence';$samplingAddressEvidence=Get-WeinviewCurrentAddressEvidence $s ($samplingPrefix+'.address') $before;foreach($samplingItem in $samplingItems){$null=Assert-WeinviewSamplingCsvObject $samplingItem $samplingAddressEvidence.device_directory $samplingAddressEvidence.tag_rows}}
    if($request.operation -ceq 'sampling_read'){
     $stage='read_native_sampling';$samplingRead=Invoke-WeinviewSamplingRead $s ($samplingPrefix+'.read.csv') $before
     $stage='close_readonly_sampling';CloseSession $s $output $before $true
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Sampling read source or inspection copy changed.'}
     $data=@{};foreach($samplingField in $samplingRead.PSObject.Properties){$data[$samplingField.Name]=$samplingField.Value}
     $data.input_sha256=$before;$data.output_path=$output;$data.output_sha256=$before;$data.project_saved=$false;$data.normal_main_exit_verified=$true;$data.own_processes=$own;$data.activation_evidence=$activationEvidence;$data.native_evidence_path=$samplingPrefix+'.read.json'
     WritePrivateJson $data.native_evidence_path $samplingRead
    }else{
     $samplingDevices=@();$samplingTags=@()
     if($samplingAddressEvidence){$samplingDevices=@($samplingAddressEvidence.device_directory);$samplingTags=@($samplingAddressEvidence.tag_rows)}
     $stage='append_native_sampling';$samplingApplied=Invoke-WeinviewSamplingAppend $s ($samplingPrefix+'.before.csv') ($samplingPrefix+'.candidate.csv') ($samplingPrefix+'.after.csv') $before $a.expected_sampling_sha256.ToUpperInvariant() $samplingItems $samplingDevices $samplingTags
     WritePrivateJson ($samplingPrefix+'.applied.json') $samplingApplied
     $stage='save_native_sampling';$saved=SaveEditedProject $s $output $before 1500
     $stage='close_saved_sampling';CloseSession $s $output $saved $false
     $stage='reopen_saved_sampling';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     $stage='read_persisted_sampling';$samplingReopened=Invoke-WeinviewSamplingRead $s ($samplingPrefix+'.reopened.csv') $saved
     $null=Assert-WeinviewSamplingPersisted $samplingApplied $samplingReopened.sampling_csv
     $stage='close_readonly_persisted_sampling';CloseSession $s $output $saved $true
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Sampling append source or saved output changed.'}
     $reopenVerified=$true
     $data=@{};foreach($samplingField in $samplingApplied.PSObject.Properties){$data[$samplingField.Name]=$samplingField.Value}
     $data.input_sha256=$before;$data.output_path=$output;$data.output_sha256=$saved;$data.project_saved=$true;$data.persisted_verified=$true;$data.reopen_verified=$true;$data.normal_main_exit_verified=$true;$data.normal_reopen_exit_verified=$true;$data.reopened_csv=$samplingReopened.sampling_csv;$data.reopened_export_evidence=$samplingReopened.native_export_evidence;$data.own_processes=$own;$data.activation_evidence=$activationEvidence;$data.native_evidence_path=$samplingPrefix+'.persisted.json'
     if($samplingAddressEvidence){$data.address_evidence=@{native_csv_path=$samplingAddressEvidence.native_csv_path;tags_sha256=$samplingAddressEvidence.tags_sha256;native_directory_verified=$true;native_tags_verified=$true}}
     WritePrivateJson $data.native_evidence_path $samplingReopened
    }
   }elseif($request.operation -in @('event_read','event_append','event_history_settings')){
    if($oldHeader){Fail 'Current-version native project required for event exchange.'}
    . (Join-Path $PSScriptRoot 'ProjectAddressEvidence.ps1')
    $eventNeedsAddress=($request.operation -ceq 'event_append' -and (Test-WeinviewAddressEvidenceRequired @($a.events)))
    Add-Type -AssemblyName Accessibility
    $eventTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','EventDialogControls.cs')
    if($eventNeedsAddress){$eventTypes+=@('ServerDeviceDirectoryControls.cs','TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs')}
    Add-Type -Path @($eventTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1');. (Join-Path $PSScriptRoot 'EventOperation.ps1')
    if($eventNeedsAddress){foreach($helper in @('NativeRibbonAction.ps1','ServerConfigurationOperation.ps1','TagRibbonAction.ps1','TagOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}}
    $items=$null;if($request.operation -eq 'event_append' -and !$eventNeedsAddress){$items=New-WeinviewEventRequests $a}
    if($request.operation -ceq 'event_history_settings'){Assert-WeinviewEventHistorySettingsArguments $a}
    $prefix=Under (Join-Path $root ('.weinview-events-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Event workflow clone hash differs.'}
    $eventHostPort=Get-WeinviewNativeHostPort;$stage='open_owned_event_workflow';$s=StartOwned $exe $output $eventNeedsAddress $false $eventHostPort;SetEditSession $s $output $exe;$s.owned_ribbon_background=!$eventNeedsAddress;$s.ribbon_project_sha256=$before
    $eventAddressEvidence=$null
    if($eventNeedsAddress){$stage='read_current_event_address_evidence';$eventAddressEvidence=Get-WeinviewCurrentAddressEvidence $s ($prefix+'.address') $before;$items=New-WeinviewEventRequests $a $eventAddressEvidence.device_directory $eventAddressEvidence.tag_rows}
    Open-WeinviewEvents $s;$stage='read_native_events';$eventBefore=Export-WeinviewEvents $s ($prefix+'.before')
    if($request.operation -eq 'event_read'){
     $stage='read_native_event_history_global';$eventHistoryGlobal=Read-WeinviewEventHistoryGlobalState $s
     $eventHistoryGlobalPath=$prefix+'.history-global.json';WritePrivateJson $eventHistoryGlobalPath $eventHistoryGlobal;$eventHistoryGlobalSha=Hash $eventHistoryGlobalPath
     Close-WeinviewEvents $s;$stage='close_readonly_events';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Readonly event source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;events_sha256=$eventBefore.events_sha256;event_count=$eventBefore.event_count;event_table=(Get-WeinviewEventSummary $eventBefore);table_origin=$eventBefore.table_origin;native_evidence_path=$eventBefore.native_evidence_path;table_evidence_path=$eventBefore.table_evidence_path;own_processes=$own;activation_evidence=$activationEvidence;ribbon_evidence=$s.event_ribbon_evidence;history_global_state=$eventHistoryGlobal.history_global_state;history_global_evidence_path=$eventHistoryGlobalPath;history_global_evidence_sha256=$eventHistoryGlobalSha;history_global_read_verified=$true;runtime_alarm_verified=$false}
    }elseif($request.operation -ceq 'event_append'){
     if($eventBefore.events_sha256 -ine $a.expected_events_sha256){Fail 'Stale native events snapshot SHA; no native import.'}
     $stage='prepare_protected_event_append';$candidate=Prepare-WeinviewEventAppend $eventBefore $items ($prefix+'.candidate')
     $stage='import_protected_event_table';Import-WeinviewEvents $s $candidate
     $stage='readback_full_native_events';$eventAfter=Export-WeinviewEvents $s ($prefix+'.after')
     $afterProof=Assert-WeinviewEventTablesEqual $candidate.path $eventAfter.native_evidence_path ($prefix+'.after-proof')
     Close-WeinviewEvents $s;$stage='save_native_events';$saved=SaveEditedProject $s $output $before 1500
     $stage='close_saved_event_project';CloseSession $s $output $saved $false
     $eventHostPort=Get-WeinviewNativeHostPort;$stage='reopen_saved_event_project';$s=StartOwned $exe $output $false $false $eventHostPort;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     Open-WeinviewEvents $s;$stage='read_persisted_full_events';$eventReopened=Export-WeinviewEvents $s ($prefix+'.reopened')
     $reopenProof=Assert-WeinviewEventTablesEqual $candidate.path $eventReopened.native_evidence_path ($prefix+'.reopen-proof')
     Close-WeinviewEvents $s;$stage='close_readonly_persisted_events';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Event source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;project_saved=$true;source_unchanged=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;all_old_events_preserved=$true;full_event_fields_verified=$true;before_events_sha256=$eventBefore.events_sha256;after_events_sha256=$eventAfter.events_sha256;reopened_events_sha256=$eventReopened.events_sha256;event_count=$eventReopened.event_count;events_added=$items.Count;address_bindings=@($items);event_table=(Get-WeinviewEventSummary $eventReopened);table_origin=$eventReopened.table_origin;native_evidence_path=$eventReopened.native_evidence_path;table_evidence_path=$eventReopened.table_evidence_path;candidate_sha256=$candidate.sha256;after_comparison=$afterProof;reopen_comparison=$reopenProof;own_processes=$own;activation_evidence=$activationEvidence;runtime_alarm_verified=$false;external_server_alarm_verified=$false}
     if($eventAddressEvidence){$data.address_evidence=@{native_csv_path=$eventAddressEvidence.native_csv_path;tags_sha256=$eventAddressEvidence.tags_sha256;native_directory_verified=$true;native_tags_verified=$true}}
    }else{
     $stage='read_before_event_history_settings';$historyBefore=Read-WeinviewEventHistoryGlobalState $s;$retentionBefore=Read-WeinviewEventHistoryRetentionState $s
     $historyBeforePath=$prefix+'.before.history-global.json';WritePrivateJson $historyBeforePath $historyBefore
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Event history settings source/copy changed before action.'}
     $stage='set_native_event_history_hmi';$hmiChange=Set-WeinviewEventHistoryHmi $s $a.hmi_enabled $historyBefore
     $stage='read_after_full_event_history_settings';$eventAfter=Export-WeinviewEvents $s ($prefix+'.after')
     $afterProof=Assert-WeinviewEventTablesEqual $eventBefore.native_evidence_path $eventAfter.native_evidence_path ($prefix+'.settings.after-proof')
     $historyAfter=Read-WeinviewEventHistoryGlobalState $s;$retentionAfter=Read-WeinviewEventHistoryRetentionState $s
     if((Get-WeinviewEventProfile $s).format -ceq 'native-event-v4-hw72'){Assert-WeinviewCmtHistoryStoragePreservation $historyBefore $historyAfter}
     if($historyAfter.history_global_state.hmi_enabled -ne $a.hmi_enabled -or $retentionAfter.checkbox_state -ne $retentionBefore.checkbox_state){Fail 'Event HMI target or original retention state differs.'}
     foreach($field in @('usb_enabled','backlight_on_alarm')){if($historyAfter.history_global_state[$field] -cne $historyBefore.history_global_state[$field]){Fail 'Untouched event global state changed.'}}
     $historyAfterPath=$prefix+'.after.history-global.json';WritePrivateJson $historyAfterPath $historyAfter
     Close-WeinviewEvents $s
     if($hmiChange.changed){$stage='save_native_event_history_settings';$saved=SaveEditedProject $s $output $before 1500}else{$saved=$before}
     $stage='close_event_history_settings';CloseSession $s $output $saved (!$hmiChange.changed)
     $eventHostPort=Get-WeinviewNativeHostPort;$stage='reopen_event_history_settings';$s=StartOwned $exe $output $false $false $eventHostPort;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     Open-WeinviewEvents $s;$stage='read_persisted_full_event_history_settings';$eventReopened=Export-WeinviewEvents $s ($prefix+'.reopened')
     $reopenProof=Assert-WeinviewEventTablesEqual $eventBefore.native_evidence_path $eventReopened.native_evidence_path ($prefix+'.settings.reopen-proof')
     $historyReopened=Read-WeinviewEventHistoryGlobalState $s;$retentionReopened=Read-WeinviewEventHistoryRetentionState $s
     if((Get-WeinviewEventProfile $s).format -ceq 'native-event-v4-hw72'){Assert-WeinviewCmtHistoryStoragePreservation $historyBefore $historyReopened}
     if($historyReopened.history_global_state.hmi_enabled -ne $a.hmi_enabled -or $retentionReopened.checkbox_state -ne $retentionBefore.checkbox_state){Fail 'Persisted event HMI target or original retention state differs.'}
     foreach($field in @('usb_enabled','backlight_on_alarm')){if($historyReopened.history_global_state[$field] -cne $historyBefore.history_global_state[$field]){Fail 'Persisted untouched event global state changed.'}}
     $historyReopenedPath=$prefix+'.reopened.history-global.json';WritePrivateJson $historyReopenedPath $historyReopened
     Close-WeinviewEvents $s;$stage='close_readonly_persisted_event_history_settings';CloseSession $s $output $saved $true
     if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Event history settings source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{profile=$(if([IO.Path]::GetExtension([string]$output) -ieq '.cmtp'){'weinview-cn421-cmt-event-history-hmi-settings-v1'}else{'weinview-cn421-native-event-history-hmi-settings-v1'});input_sha256=$before;output_path=$output;output_sha256=$saved;requested_hmi_enabled=$a.hmi_enabled;changed=[bool]$hmiChange.changed;project_saved=[bool]$hmiChange.changed;source_unchanged=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;all_old_events_preserved=$true;full_event_fields_verified=$true;untouched_global_settings_verified=$true;history_global_read_verified=$true;before_events_sha256=$eventBefore.events_sha256;after_events_sha256=$eventAfter.events_sha256;reopened_events_sha256=$eventReopened.events_sha256;event_count=$eventReopened.event_count;event_table=(Get-WeinviewEventSummary $eventReopened);table_origin=$eventReopened.table_origin;native_evidence_path=$eventReopened.native_evidence_path;table_evidence_path=$eventReopened.table_evidence_path;after_comparison=$afterProof;reopen_comparison=$reopenProof;hmi_change_evidence=$hmiChange;retention_preservation_evidence=@{before=$retentionBefore;after=$retentionAfter;reopened=$retentionReopened};own_processes=$own;activation_evidence=$activationEvidence;full_history_settings_verified=$false;runtime_alarm_verified=$false;runtime_history_verified=$false}
     foreach($phase in @(@('before',$eventBefore,$historyBefore,$historyBeforePath),@('after',$eventAfter,$historyAfter,$historyAfterPath),@('reopened',$eventReopened,$historyReopened,$historyReopenedPath))){
      $name=[string]$phase[0];$snapshot=$phase[1];$history=$phase[2];$historyPath=[string]$phase[3]
      $data[$name+'_event_snapshot']=@{events_sha256=$snapshot.events_sha256;event_count=$snapshot.event_count;native_evidence_path=$snapshot.native_evidence_path;table_evidence_path=$snapshot.table_evidence_path;table_evidence_sha256=(Hash $snapshot.table_evidence_path);table_origin=$snapshot.table_origin}
      $data[$name+'_history_global_state']=$history.history_global_state;$data[$name+'_history_global_evidence_path']=$historyPath;$data[$name+'_history_global_evidence_sha256']=Hash $historyPath
     }
    }
   }elseif($request.operation -ceq 'project_context_read' -and !$a.include_tags){
    if($oldHeader){Fail 'Current-version native project required for project overview.'}
    Add-Type -AssemblyName Accessibility
    $contextTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','ServerDeviceDirectoryControls.cs')
    Add-Type -Path @($contextTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    $prefix=Under (Join-Path $root ('.weinview-context-'+[Guid]::NewGuid().ToString('N'))) $root
    $port=0;$hostError=$null;$script:nativeHostLastStatus=$null
    if($editorSessionMode){
     $stage='bind_project_overview_editor';$editorOwnedSession=Connect-WeinviewEditorSession $editorSessionContext $output $exe
     $s=$editorOwnedSession;$script:pendingOwnedSession=$s;$port=[int]$s.native_host_port
     $script:own+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe}
     $mutation='possible';Register-WeinviewEditorSession $editorSessionContext $s $projectInput $output $exe $before $request.id
    }else{
     $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ine $before){Fail 'Project overview clone hash mismatch.'}
     try{$port=Get-WeinviewNativeHostPort}catch{$hostError=$_.Exception.Message}
     $stage='open_owned_project_overview';$s=StartOwned $exe $output $false $false $port;SetEditSession $s $output $exe
    }
    $hostData=$null;$hostAvailable=($port -gt 0 -and (Test-WeinviewNativeHostPort -Port $port));if(!$hostAvailable -and !$hostError){$hostError=if($script:nativeHostLastStatus){[string]$script:nativeHostLastStatus.reason}else{[string]::Empty}}
    if($hostAvailable){
     . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
     $stage='read_native_host_project_overview';try{$hostData=Invoke-WeinviewNativeHostRead -Port $port -Method getAllData}catch{$hostAvailable=$false;$hostError=$_.Exception.Message}
    }
    if($hostAvailable){
     if(!$hostData -or !$hostData.metadata -or !$hostData.metadata.sys_params -or !$hostData.metadata.directory_trees){Fail 'Native host project metadata incomplete.'}
     $evidence=$prefix+'.native-host.json';WritePrivateJson $evidence $hostData
     $hostMetadata=$hostData.metadata
     $macroNames=@(foreach($macro in @($hostMetadata.macros)){if($macro.name -is [string] -and $macro.name){@{id=$macro.id;name=$macro.name}}})
     $jsObjectNames=@(foreach($object in @($hostMetadata.js_objects)){if($object.name -is [string] -and $object.name){@{id=$object.id;name=$object.name}}})
     $summary=[ordered]@{overview_scope='project_summary';info=$hostMetadata.info;sys_params=@{model=$hostMetadata.sys_params.model;devices=@($hostMetadata.sys_params.devices);general_properties=$hostMetadata.sys_params.general_properties;time_zone=$hostMetadata.sys_params.time_zone};directory_trees=@($hostMetadata.directory_trees);macros=$macroNames;macro_count=$macroNames.Count;js_objects=$jsObjectNames;js_object_count=$jsObjectNames.Count}
     if(!$editorSessionMode){$stage='close_readonly_project_overview';CloseSession $s $output $before $true}
     if((Hash $projectInput) -ine $before -or (Hash $output) -ine $before){Fail 'Readonly project overview source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=(!$editorSessionMode);read_only_inspection=$true;read_route='native_host';native_host_method='getAllData';metadata_scope='native_host_project_summary';native_metadata=$summary;tags_read=$false;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$evidence}
    }else{
     if($editorSessionMode){Fail ('weinview_editor_session_reconciliation_required: Native host overview failed; the existing editor is preserved. '+[string]$hostError)}
     WritePrivateJson ($prefix+'.native-host-unavailable.json') @{port=$port;browser=$(if($script:nativeHostLastStatus){[string]$script:nativeHostLastStatus.browser}else{''});reason=[string]$hostError}
     $null=$s.native.ActivateOwnedMain($s.main.Hwnd)
     . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ServerConfigurationOperation.ps1')
     $stage='read_native_device_directory_fallback';$directory=Read-WeinviewProjectDeviceDirectory $s $false
     $stage='close_readonly_device_directory';CloseSession $s $output $before $true
     if((Hash $projectInput) -ine $before -or (Hash $output) -ine $before){Fail 'Readonly device directory source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;read_only_inspection=$true;read_route='native_ui_device_directory';native_host_ready=$false;native_host_port=$port;native_host_browser=$(if($script:nativeHostLastStatus){[string]$script:nativeHostLastStatus.browser}else{''});native_host_unavailable_reason=[string]$hostError;metadata_scope='native_device_directory_only';native_directory_verified=$true;device_directory=@($directory.device_directory);directory_ribbon_evidence=$directory.ribbon_evidence;tags_read=$false;own_processes=$own;activation_evidence=$activationEvidence}
    }
   }elseif($request.operation -in @('project_context_read','tag_read','tag_upsert')){
    if($oldHeader){Fail 'Current-version native project required for tag exchange.'}
    Add-Type -AssemblyName Accessibility
    $tagTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs');if($request.operation -ceq 'project_context_read'){$tagTypes+=@('ServerDeviceDirectoryControls.cs')}
    Add-Type -Path @($tagTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'TagRibbonAction.ps1');. (Join-Path $PSScriptRoot 'TagOperation.ps1')
    if($request.operation -ceq 'project_context_read'){. (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ServerConfigurationOperation.ps1')}
    $requestedRows=$null;if($request.operation -eq 'tag_upsert'){$requestedRows=New-WeinviewTagRequests $a}
    $prefix=Under (Join-Path $root ('.weinview-tags-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Tag workflow clone hash mismatch.'}
    $stage='open_owned_tag_workflow';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.tag_prefix=$prefix
    $directory=$null
    if($request.operation -ceq 'project_context_read'){$stage='read_native_device_directory';$directory=Read-WeinviewProjectDeviceDirectory $s}
    $null=Open-WeinviewTagLibrary $s
    $stage='read_native_tags';$tagBefore=Export-WeinviewTags $s ($prefix+'.before.csv')
    if($request.operation -in @('project_context_read','tag_read')){
     Close-WeinviewTagLibrary $s;$stage='close_readonly_tag_inspection';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Readonly tag source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;tags=@($tagBefore.tags);tags_sha256=$tagBefore.tags_sha256;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$tagBefore.native_csv_path;native_csv_path=$tagBefore.native_csv_path;ribbon_evidence=$s.tag_ribbon_evidence;table_origin=$tagBefore.table_origin;empty_evidence=$tagBefore.empty_evidence}
     if($request.operation -ceq 'project_context_read'){$data.device_directory=@($directory.device_directory);$data.native_directory_verified=$true;$data.read_only_inspection=$true;$data.directory_ribbon_evidence=$directory.ribbon_evidence;$data.read_route='native_ui_csv';$data.tags_read=$true}
    }else{
     if($tagBefore.tags_sha256 -ine $a.expected_tags_sha256){Fail 'Stale native tag snapshot SHA; no CSV import.'}
     [PLCCode.Weinview.TagRow[]]$expectedTags=[PLCCode.Weinview.TagCsvCodec]::Merge([PLCCode.Weinview.TagRow[]]$tagBefore.tags,$requestedRows)
     $stage='verify_native_tag_devices';$nativeTagNames=@($a.tags|Where-Object {$_.row_format -ceq 'native_csv'}|ForEach-Object {[string]$_.name});$deviceProof=Assert-WeinviewTagDeviceBindings $s $requestedRows $nativeTagNames
     $newRows=New-Object 'Collections.Generic.List[PLCCode.Weinview.TagRow]';$updated=@()
     $replaceMerged=@($tagBefore.tags|Where-Object {$nativeTagNames -ccontains $_.name}).Count -gt 0
     if($replaceMerged){
      $stage='update_merged_native_tags';$importProof=Import-WeinviewTags $s $expectedTags ($prefix+'.request.csv') -ReplaceMergedTable
     }else{
     foreach($row in $requestedRows){$matches=@($tagBefore.tags|Where-Object {$_.name -ceq $row.name});if($nativeTagNames -ccontains $row.name){$newRows.Add($row)}elseif($matches.Count -eq 1){$stage='update_existing_native_tag';$updated+=Update-WeinviewExistingTag $s $matches[0] $row}else{$newRows.Add($row)}}
     $importProof=@{native_imported_count=0;native_ignored_count=0;remove_existing=$false;replace_existing=$true}
     if($newRows.Count){$stage='append_new_native_tags';$importProof=Import-WeinviewTags $s $newRows.ToArray() ($prefix+'.request.csv')}
     }
     $stage='verify_full_native_tags';$tagAfter=Export-WeinviewTags $s ($prefix+'.after.csv')
     [PLCCode.Weinview.TagCsvCodec]::AssertSame($expectedTags,[PLCCode.Weinview.TagRow[]]$tagAfter.tags)
     Close-WeinviewTagLibrary $s;$stage='save_native_tags';$saved=SaveEditedProject $s $output $before 1500
     $stage='close_saved_tag_project';CloseSession $s $output $saved $false
     $stage='reopen_saved_tag_project';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.tag_prefix=$prefix+'.reopen'
     $null=Open-WeinviewTagLibrary $s;$stage='read_persisted_full_tags';$tagReopened=Export-WeinviewTags $s ($prefix+'.reopened.csv')
     [PLCCode.Weinview.TagCsvCodec]::AssertSame($expectedTags,[PLCCode.Weinview.TagRow[]]$tagReopened.tags)
     if($tagAfter.tags_sha256 -cne $tagReopened.tags_sha256){Fail 'Persisted native tag CSV byte SHA differs.'}
     Close-WeinviewTagLibrary $s;$stage='close_readonly_persisted_tags';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Tag upsert source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;project_saved=$true;source_unchanged=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;reopen_verified=$true;untouched_tags_verified=$true;tags_before=@($tagBefore.tags);tags_after=@($tagAfter.tags);tags_reopened=@($tagReopened.tags);before_tags_sha256=$tagBefore.tags_sha256;after_tags_sha256=$tagAfter.tags_sha256;reopened_tags_sha256=$tagReopened.tags_sha256;native_devices=$deviceProof;import_options=$importProof;updated_tags=$updated;save_settle_ms=1500;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$tagReopened.native_csv_path;online_connection_tested=$false}
    }
    }elseif($request.operation -in @('window_read','window_create','window_copy')){
    if($oldHeader){Fail 'Current-version native project required for native windows.'}
    Add-Type -AssemblyName Accessibility
     $windowTypes=@('NativeControls.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs');if($request.operation -eq 'window_copy'){$windowTypes+=,'WindowCopyControls.cs'}
      Add-Type -Path @($windowTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
     . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
     if($request.operation -eq 'window_copy'){. (Join-Path $PSScriptRoot 'NativeWindowCopyOperation.ps1');$a.donor_path=Under ([string]$a.donor_path) $root}
    $prefix=Under (Join-Path $root ('.weinview-window-'+[Guid]::NewGuid().ToString('N'))) $root
    if($editorSessionMode){
     $stage='bind_window_inspection_editor';$editorOwnedSession=Connect-WeinviewEditorSession $editorSessionContext $output $exe
     $s=$editorOwnedSession;$script:pendingOwnedSession=$s
     $script:own+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe}
     $mutation='possible';Register-WeinviewEditorSession $editorSessionContext $s $projectInput $output $exe $before $request.id
    }else{
     $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Native window clone hash mismatch.'}
     $stage='open_owned_window_workflow';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.project_path=$output;$s.owned_semantic_background=$true
    }
     $stage='native_window_operation';$windowsBefore=if($request.operation -eq 'window_copy'){Read-WeinviewWindows $s}else{$null}
      $applied=if($request.operation -eq 'window_copy'){
       $copyRequest=[pscustomobject]@{donor_path=[string]$a.donor_path;expected_donor_sha256=[string]$a.expected_donor_sha256;source_start=[int]$a.source_start;source_end=[int]$a.source_end;destination_start=[int]$a.destination_start;copy_macros=[bool]$a.copy_macros;copy_events=[bool]$a.copy_events;copy_underlay=[bool]$a.copy_underlay}
       Invoke-WeinviewNativeWindowCopy $s $copyRequest $before ($prefix+'.copy')
      }else{Invoke-WeinviewWindowOperation $s $a $request.operation}
    if($request.operation -eq 'window_read'){
     if(!$editorSessionMode){$stage='close_readonly_window_inspection';CloseSession $s $output $before $true}
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Read-only window source/copy bytes changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;windows=@($applied.windows);window_set_sha256=$applied.window_set_sha256;profile=$applied.profile;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=(!$editorSessionMode);read_only_inspection=$true;read_route=$applied.read_route;own_processes=$own;activation_evidence=$activationEvidence;window_list_entry=$applied.window_list_entry}
     }elseif($request.operation -eq 'window_copy'){
      if(!$applied.native_copy_posted_once -or $applied.dependencies_relinked -or $applied.project_saved){Fail 'Native window copy contract differs before save.'}
      $stage='save_native_window_copy';$saved=SaveEditedProject $s $output $before 1500
      $stage='close_saved_window_copy';CloseSession $s $output $saved $false
      $stage='reopen_native_window_copy';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.project_path=$output;$s.owned_semantic_background=$true
      $stage='read_persisted_copied_windows';$persisted=Read-WeinviewWindows $s
      if($persisted.window_set_sha256 -cne $applied.window_set_sha256){Fail 'Saved/reopened copied window directory differs.'}
      foreach($copied in @($applied.copied_windows)){
       $matches=@($persisted.windows|Where-Object {$_.number -eq $copied.destination})
       if($matches.Count -ne 1 -or $matches[0].name -cne $copied.name -or [int]$matches[0].width -ne [int]$copied.width -or [int]$matches[0].height -ne [int]$copied.height){Fail 'Persisted copied native window differs.'}
      }
      $stage='close_readonly_window_copy';CloseSession $s $output $saved $true
      if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved -or (Hash ([string]$a.donor_path)) -cne ([string]$a.expected_donor_sha256).ToUpperInvariant()){Fail 'Window copy receiver/donor final hash invariant failed.'}
      $reopenVerified=$true
      $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$applied.profile;windows_before=@($windowsBefore.windows);windows_reopened=@($persisted.windows);window_set_sha256=$persisted.window_set_sha256;before_window_set_sha256=$windowsBefore.window_set_sha256;copied_windows=@($applied.copied_windows);donor_path=[string]$a.donor_path;donor_sha256=[string]$a.expected_donor_sha256;native_copy_posted_once=$true;copy_macros=[bool]$a.copy_macros;copy_events=[bool]$a.copy_events;copy_underlay=[bool]$a.copy_underlay;dependencies_relinked=$false;runtime_verified=$false;project_saved=$true;source_unchanged=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence}
     }else{
     $stage='save_native_window_creation';$saved=SaveEditedProject $s $output $before 1500
     $stage='close_saved_window_creation';CloseSession $s $output $saved $false
     $stage='reopen_native_window_creation';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.project_path=$output;$s.owned_semantic_background=$true
     $stage='read_persisted_window_set';$persisted=Read-WeinviewWindows $s
     if($persisted.window_set_sha256 -cne $applied.window_set_sha256){Fail 'Saved/reopened complete native window set differs.'}
     $stage='close_readonly_window_creation';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Window creation source/output final invariant failed.'}
     $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$applied.profile;windows_before=@($applied.windows_before);windows=@($applied.windows);windows_reopened=@($persisted.windows);window_set_sha256=$applied.window_set_sha256;before_window_set_sha256=$applied.before_window_set_sha256;created_window=$applied.created_window;preserved_existing_windows=$true;project_saved=$true;source_unchanged=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;save_settle_ms=1500;own_processes=$own;activation_evidence=$activationEvidence;window_list_entry=$applied.window_list_entry}
    }
   }elseif($request.operation -ceq 'screen_copy_objects'){
    if($oldHeader){Fail 'Current-version native project required for screen object copy.'}
    . (Join-Path $PSScriptRoot 'NativeObjectCopyOperation.ps1')
    $copyHasAddressRules=($a.PSObject.Properties.Name -ccontains 'address_replacements')
    if($copyHasAddressRules){. (Join-Path $PSScriptRoot 'NativeAddressReplaceOperation.ps1')}
    $copyContract=Assert-WeinviewObjectCopyArguments $a
    $windowNumber=[int]$copyContract.window_number
    $externalDonor=[bool]$copyContract.external_donor
    $donorPath=$null;$donorHash=$null;$donorClone=$null
    if($externalDonor){
     $donorPath=Under ([string]$a.donor_path) $root
     if($donorPath -ieq $projectInput -or $donorPath -ieq $output -or !(Test-Path -LiteralPath $donorPath -PathType Leaf) -or [IO.Path]::GetExtension($donorPath) -ine $expectedOutputExtension){Fail 'Existing distinct same-format external donor project required.'}
     $donorHash=Hash $donorPath
     if($donorHash -ine [string]$a.expected_donor_sha256){Fail 'External donor SHA256 mismatch.'}
     $donorHeader=New-Object byte[] 30;$donorStream=[IO.File]::OpenRead($donorPath)
     try{$donorRead=$donorStream.Read($donorHeader,0,30)}finally{$donorStream.Dispose()}
     if($read -ne 30 -or $donorRead -ne 30 -or [Text.Encoding]::Unicode.GetString($donorHeader,8,22) -eq '6.05.02.675' -or [BitConverter]::ToString($header,0,8) -cne [BitConverter]::ToString($donorHeader,0,8) -or [Text.Encoding]::Unicode.GetString($header,8,22) -cne [Text.Encoding]::Unicode.GetString($donorHeader,8,22)){Fail 'External donor must match the current target native project format and version.'}
    }
    Add-Type -AssemblyName Accessibility
    $copyTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','WindowTreeControls.cs','NativeMultiCopyControls.cs','NativeRecoveryMenuControls.cs','NativeObjectClipboardControls.cs','NativeScreenScene.cs','NativeGroupTranslationControls.cs')
    if($copyHasAddressRules){$copyTypes+=,'NativeAddressReplaceControls.cs'}
    Add-Type -Path @($copyTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'NativeHostRead.ps1');. (Join-Path $PSScriptRoot 'NativeMultiCopyOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-object-copy-'+[Guid]::NewGuid().ToString('N'))) $root
    $copyPort=Get-WeinviewNativeHostPort
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Screen object copy fresh project bytes differ.'}
    $copyNeedsForeground=($externalDonor -or $copyHasAddressRules -or $null -ne $copyContract.translation -or $a.PSObject.Properties.Name -ccontains 'object_ids')
    $normalDonorExit=$false;$donor=$null
    if($externalDonor){
     $donorOpenPath=$donorPath
     if($copyHasAddressRules){
      $donorClone=Under (Join-Path $root ('.weinview-object-copy-donor-'+[Guid]::NewGuid().ToString('N')+$expectedOutputExtension)) $root
      if(Test-Path -LiteralPath $donorClone){Fail 'Fresh external donor clone path required.'}
      [IO.File]::Copy($donorPath,$donorClone,$false)
      if((Hash $donorClone) -cne $donorHash){Fail 'External donor clone differs from source.'}
      $donorOpenPath=$donorClone
     }
     $stage='open_owned_external_object_copy_donor';$s=StartOwned $exe $donorOpenPath $true $false $copyPort;SetEditSession $s $donorOpenPath $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
     Set-WeinviewScreenSession $s $donorOpenPath $exe ($prefix+'.donor.identity.json')
     $stage='prepare_external_object_copy_donor';$donor=Prepare-WeinviewObjectCopyDonorPayload $s $copyContract $a $donorHash ($prefix+'.donor')
     $stage='close_external_object_copy_donor';CloseSession $s $donorOpenPath $donorHash $true
     $normalDonorExit=$true;$s=$null;$script:pendingOwnedSession=$null
     if($donorClone){Remove-Item -LiteralPath $donorClone -Force;if(Test-Path -LiteralPath $donorClone){Fail 'Closed external donor clone still exists.'};$donorClone=$null}
     if((Hash $donorPath) -cne $donorHash){Fail 'External donor changed during native object copy.'}
     $copyPort=Get-WeinviewNativeHostPort
     $stage='open_owned_screen_object_copy';$s=StartOwned $exe $output $copyNeedsForeground (!$copyNeedsForeground) $copyPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    }else{
     $stage='open_owned_screen_object_copy';$s=StartOwned $exe $output $copyNeedsForeground (!$copyNeedsForeground) $copyPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    }
    if($copyHasAddressRules -and !$externalDonor){
     $stage='prepare_native_object_copy_donor';$donor=Prepare-WeinviewObjectCopyDonorPayload $s $copyContract $a $before ($prefix+'.donor')
     $stage='close_unsaved_native_object_copy_donor';CloseSession $s $output $before $true
     $normalDonorExit=$true;$s=$null;$script:pendingOwnedSession=$null
     $copyPort=Get-WeinviewNativeHostPort
     $stage='reopen_original_native_object_copy';$s=StartOwned $exe $output $copyNeedsForeground (!$copyNeedsForeground) $copyPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.original.identity.json')
    }
    $stage='copy_native_object_group_once';$applied=Invoke-WeinviewNativeObjectCopy $s $copyContract $before $prefix $donor
    if($copyHasAddressRules){$stage='verify_copied_native_address_references';$addressVerified=Assert-WeinviewObjectCopyAddressReferences $s $applied ($prefix+'.address')}
    $stage='save_native_object_group';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_object_group';CloseSession $s $output $saved $false
    $reopenPort=Get-WeinviewNativeHostPort
    $stage='reopen_native_object_group';$s=StartOwned $exe $output $copyHasAddressRules (!$copyHasAddressRules) $reopenPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
    $stage='read_persisted_object_group';$persisted=Assert-WeinviewNativeObjectCopyReopened $s $applied ($prefix+'.reopened')
    if($copyHasAddressRules){$stage='verify_persisted_native_address_references';$addressVerified=Assert-WeinviewObjectCopyAddressReferences $s $applied ($prefix+'.reopened.address')}
    $stage='close_readonly_object_group';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved -or ($externalDonor -and (Hash $donorPath) -cne $donorHash)){Fail 'Screen object copy final source/output/donor hash invariant failed.'}
    $reopenVerified=$true
    $data=@{scope='native_screen_copy_objects';input_sha256=$before;output_path=$output;output_sha256=$saved;window_number=$windowNumber;source_object_ids=@($applied.source_object_ids);before_count=[int]$applied.before_count;after_count=[int]$applied.after_count;translation=@($applied.translation);added_objects=@($applied.added_objects);copied_properties_verified=$false;persisted_verified=[bool]$persisted.persisted_verified;reopen_verified=$true;project_saved=$true;project_save_count=1;project_reopen_count=1;source_unchanged=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;inventory_route='native_host';own_processes=$own;activation_evidence=$activationEvidence;next_tool='weinview_project_compile'}
    if($copyHasAddressRules){
     if(!$externalDonor){$data.project_reopen_count=2}
     $data.normal_donor_exit_verified=$normalDonorExit;$data.address_replacements=@($applied.address_replacements);$data.copied_address_references_verified=[bool]$addressVerified.copied_address_references_verified;$data.copied_address_reference_scope=[string]$addressVerified.copied_address_reference_scope
     if(@($copyContract.address_replacements|Where-Object {$_.contract.range_enabled}).Count){
      if(!$addressVerified.copied_range_address_references_verified){Fail 'Copied range addresses differ after reopen.'}
      $data.copied_range_address_references_verified=$true
     }
    }
    if($externalDonor){$data.donor_path=$donorPath;$data.donor_sha256=$donorHash;$data.donor_unchanged=$true;$data.donor_window_number=[int]$copyContract.source_window_number;$data.donor_object_count=@($donor.before_inventory.rows).Count;$data.normal_donor_exit_verified=$normalDonorExit}
    foreach($field in @('requested_translation','group_shift','requested_object_ids','selection_route','selection_rectangle','selection_points')){if($applied.PSObject.Properties.Name -ccontains $field){$data[$field]=$applied.$field}}
   }elseif($request.operation -ceq 'screen_move_objects'){
    if($oldHeader){Fail 'Current-version native project required for screen object move.'}
    . (Join-Path $PSScriptRoot 'NativeObjectCopyOperation.ps1')
    $moveContract=Assert-WeinviewObjectMoveArguments $a
    $windowNumber=[int]$moveContract.window_number
    Add-Type -AssemblyName Accessibility
    $moveTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','WindowTreeControls.cs','NativeMultiCopyControls.cs','NativeRecoveryMenuControls.cs','NativeObjectClipboardControls.cs','NativeScreenScene.cs','NativeGroupTranslationControls.cs')
    Add-Type -Path @($moveTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'NativeHostRead.ps1');. (Join-Path $PSScriptRoot 'NativeMultiCopyOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-object-move-'+[Guid]::NewGuid().ToString('N'))) $root
    $movePort=Get-WeinviewNativeHostPort
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $before){Fail 'Screen object move fresh project bytes differ.'}
    $stage='open_owned_screen_object_move';$s=StartOwned $exe $output $true $false $movePort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='move_native_object_group_once';$applied=Invoke-WeinviewNativeObjectMove $s $moveContract $before $prefix
    $moveNoop=([int]$moveContract.translation[0] -eq 0 -and [int]$moveContract.translation[1] -eq 0)
    if($moveNoop){$saved=$before}else{$stage='save_native_object_move';$saved=SaveEditedProject $s $output $before}
    $stage='close_object_move';CloseSession $s $output $saved $moveNoop
    $reopenPort=Get-WeinviewNativeHostPort
    $stage='reopen_native_object_move';$s=StartOwned $exe $output $false $true $reopenPort;SetEditSession $s $output $exe;$s.owned_semantic_background=$true;$s.addition_inventory_route='native_host'
    $stage='read_persisted_object_move';$persisted=Assert-WeinviewNativeObjectMoveReopened $s $applied ($prefix+'.reopened')
    $stage='close_readonly_object_move';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Screen object move final source/output hash invariant failed.'}
    $reopenVerified=$true
    $data=@{scope='native_screen_move_objects';input_sha256=$before;output_path=$output;output_sha256=$saved;window_number=$windowNumber;object_ids=@($applied.object_ids);before_count=[int]$applied.before_count;after_count=[int]$applied.after_count;translation=@($applied.translation);moved_objects=@($applied.moved_objects);inventory_route='native_host';properties_verified=$false;other_object_geometry_unchanged=$true;persisted_verified=[bool]$persisted.persisted_verified;reopen_verified=$true;project_saved=(!$moveNoop);project_save_count=if($moveNoop){0}else{1};project_reopen_count=1;source_unchanged=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;next_tool='weinview_project_compile'}
    foreach($field in @('group_shift','selection_route','selection_rectangle','selection_points')){if($applied.PSObject.Properties.Name -ccontains $field){$data[$field]=$applied.$field}}
   }elseif($request.operation -ceq 'screen_duplicate'){
    if($oldHeader){Fail 'Current-version native project required for screen duplicate.'}
    $windowNumber=SelectedWindowNumber $a
    $required=@('object_id','columns','rows','x_spacing','y_spacing','address_offset')
    foreach($field in $required){if($a.PSObject.Properties.Name -cnotcontains $field){Fail ('Screen duplicate field required: '+$field)}}
    if([string]$a.object_id -cnotmatch '^[A-Z]+_[0-9]{1,5}$'){Fail 'Exact native seed object ID required for screen duplicate.'}
    foreach($field in @('columns','rows','x_spacing','y_spacing','address_offset')){if(($a.$field -isnot [int] -and $a.$field -isnot [long]) -or [long]$a.$field -lt [int]::MinValue -or [long]$a.$field -gt [int]::MaxValue){Fail ('Screen duplicate Int32 field required: '+$field)}}
    if([int]$a.columns -lt 1 -or [int]$a.rows -lt 1 -or [long]$a.columns*[long]$a.rows -lt 2 -or [long]$a.columns*[long]$a.rows -gt [int]::MaxValue){Fail 'Native Multi Copy matrix must contain two to Int32.MaxValue cells.'}
    Add-Type -AssemblyName Accessibility
    $screenTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','WindowTreeControls.cs','NativeMultiCopyControls.cs')
    Add-Type -Path @($screenTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'NativeHostRead.ps1');. (Join-Path $PSScriptRoot 'NativeMultiCopyOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-screen-duplicate-'+[Guid]::NewGuid().ToString('N'))) $root
    $port=Get-WeinviewNativeHostPort
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ine $before){Fail 'Screen duplicate clone differs from source.'}
    $stage='open_owned_screen_duplicate';$s=StartOwned $exe $output $true $false $port;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='apply_native_multi_copy';$applied=Invoke-WeinviewNativeMultiCopy $s $a $before $prefix
    $stage='save_native_multi_copy';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_multi_copy';CloseSession $s $output $saved $false
    $reopenPort=Get-WeinviewNativeHostPort
    $stage='reopen_native_multi_copy';$s=StartOwned $exe $output $true $false $reopenPort;SetEditSession $s $output $exe
    $stage='read_persisted_multi_copy';$persisted=Assert-WeinviewNativeMultiCopyReopened $s $applied ($prefix+'.reopened')
    $stage='close_readonly_multi_copy';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ine $before -or (Hash $output) -ine $saved){Fail 'Screen duplicate final source/output differs.'}
    $reopenVerified=$true
    $data=@{scope='native_screen_duplicate';input_sha256=$before;output_path=$output;output_sha256=$saved;window_number=$windowNumber;seed_object_id=[string]$applied.seed_object_id;columns=[int]$applied.columns;rows=[int]$applied.rows;x_spacing=[int]$applied.x_spacing;y_spacing=[int]$applied.y_spacing;address_offset=[int]$applied.address_offset;before_count=[int]$applied.before_count;after_count=[int]$applied.after_count;added_objects=@($applied.added_objects);native_copy_ms=[long]$applied.native_copy_ms;inventory_route=[string]$applied.inventory_route;project_saved=$true;source_unchanged=$true;persisted_verified=[bool]$persisted.persisted_verified;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence}
   }elseif($request.operation -ceq 'screen_read' -and !$a.object_id -and $a.detail -cne 'properties'){
    if($oldHeader){Fail 'Current-version native project required for screen overview.'}
    Add-Type -AssemblyName Accessibility
    $screenTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','TrendRibbonControls.cs','RecipeDatabaseControls.cs','RecipeViewDisplayControls.cs','RecipeViewClipboard.cs','NumericAddressTypeControls.cs','NumericTagSettingsControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs','OptionListGridControls.cs','NativeScreenScene.cs','AlarmDisplayDialogControls.cs')
    Add-Type -Path @($screenTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    $windowNumber=SelectedWindowNumber $a
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1')
    $prefix=Under (Join-Path $root ('.weinview-screen-overview-'+[Guid]::NewGuid().ToString('N'))) $root
    $port=0;$hostError=$null;$script:nativeHostLastStatus=$null
    if($editorSessionMode){
     $stage='bind_screen_overview_editor';$editorOwnedSession=Connect-WeinviewEditorSession $editorSessionContext $output $exe
     $s=$editorOwnedSession;$script:pendingOwnedSession=$s;$port=[int]$s.native_host_port
     $script:own+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe}
     $mutation='possible';Register-WeinviewEditorSession $editorSessionContext $s $projectInput $output $exe $before $request.id
    }else{
     $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ine $before){Fail 'Screen overview clone hash mismatch.'}
     try{$port=Get-WeinviewNativeHostPort}catch{$hostError=$_.Exception.Message}
     $stage='open_owned_screen_overview';$s=StartOwned $exe $output $false $false $port;SetEditSession $s $output $exe
    }
    $nativeRows=$null;$hostAvailable=($port -gt 0 -and (Test-WeinviewNativeHostPort -Port $port));if(!$hostAvailable -and !$hostError){$hostError=if($script:nativeHostLastStatus){[string]$script:nativeHostLastStatus.reason}else{[string]::Empty}}
    if($hostAvailable){
     . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
     $stage='read_native_host_window_objects';try{$nativeRows=Invoke-WeinviewNativeHostRead -Port $port -Method getWindowObjects -Arguments @([int]$windowNumber)}catch{$hostAvailable=$false;$hostError=$_.Exception.Message}
    }
    if($hostAvailable){
     $mapped=Convert-WeinviewNativeHostWindowObjects $nativeRows $windowNumber
     $evidence=$prefix+'.native-host.json';WritePrivateJson $evidence @{window_number=$windowNumber;native_rows=$nativeRows;objects=$mapped.objects;native_window_record=$mapped.native_window_record}
     if(!$editorSessionMode){$stage='close_readonly_screen_overview';CloseSession $s $output $before $true}
     if((Hash $projectInput) -ine $before -or (Hash $output) -ine $before){Fail 'Readonly screen overview source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;screen=$windowNumber;objects=@($mapped.objects);native_window_record=$mapped.native_window_record;detail='directory';read_route='native_host';native_host_method='getWindowObjects';property_scope='native_host_window_objects_raw';target_only_verified=$false;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=(!$editorSessionMode);read_only_inspection=$true;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$evidence}
    }else{
     if($editorSessionMode){Fail ('weinview_editor_session_reconciliation_required: Native host screen overview failed; the existing editor is preserved. '+[string]$hostError)}
     $null=$s.native.ActivateOwnedMain($s.main.Hwnd)
     . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
     $stage='select_native_screen_fallback';$null=Select-WeinviewWindow $s $windowNumber
     $stage='read_native_screen_directory_fallback';$snapshot=Invoke-WeinviewScreenDirectoryRead $s $before ($prefix+'.read')
     $stage='close_readonly_screen_overview';CloseSession $s $output $before $true
     if((Hash $projectInput) -ine $before -or (Hash $output) -ine $before){Fail 'Readonly screen overview source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$snapshot.window_name;objects=@($snapshot.objects);detail='directory';read_route='native_ui_directory';native_host_ready=$false;native_host_port=$port;native_host_browser=$(if($script:nativeHostLastStatus){[string]$script:nativeHostLastStatus.browser}else{''});native_host_unavailable_reason=[string]$hostError;property_scope='native_directory_id_kind_label_order_only';target_only_verified=$false;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.read.directory.json'}
    }
   }elseif($request.operation -in @('screen_read','screen_update')){
    if($oldHeader){Fail 'Current-version native project required for screen workflow.'}
    $windowNumber=SelectedWindowNumber $a
    $tagUpdateRequested=($request.operation -ceq 'screen_update' -and $a.PSObject.Properties.Name -ccontains 'tag_name')
    $numericReadNeedsTags=($request.operation -ceq 'screen_read' -and (($a.object_id -and $a.object_id -cmatch '^(ND|NE|TS|BL)_[0-9]{1,5}$') -or (!$a.object_id -and $a.detail -ceq 'properties'))) -or ($request.operation -ceq 'screen_update' -and $a.object_id -cmatch '^(ND|NE|TS|BL)_[0-9]{1,5}$')
    if($tagUpdateRequested -and $a.object_id -cnotmatch '^(ND|NE|TS|BL)_[0-9]{1,5}$'){Fail 'Native Tag reference update requires numeric or bit object ID.'}
    Add-Type -AssemblyName Accessibility
    $screenTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','TrendRibbonControls.cs','RecipeDatabaseControls.cs','RecipeViewDisplayControls.cs','RecipeViewClipboard.cs','NumericAddressTypeControls.cs','NumericTagSettingsControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs','OptionListGridControls.cs','NativeScreenScene.cs','AlarmDisplayDialogControls.cs','ObjectSecurityClassControls.cs')
    if($numericReadNeedsTags){$screenTypes+=@('TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs')}
    Add-Type -Path @($screenTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1');. (Join-Path $PSScriptRoot 'RecipeViewOperation.ps1');. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1');. (Join-Path $PSScriptRoot 'RecipeDatabaseProjectOperation.ps1');. (Join-Path $PSScriptRoot 'RecipeDatabaseOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-scene-'+[Guid]::NewGuid().ToString('N'))) $root
    if($numericReadNeedsTags){
     . (Join-Path $PSScriptRoot 'TagRibbonAction.ps1');. (Join-Path $PSScriptRoot 'TagOperation.ps1')
    }
    $recipeCatalog=$null;$recipeFields=@{}
    if($request.operation -ceq 'screen_update' -and $a.object_id -cmatch '^RV_[0-9]{1,5}$'){
     $python=Get-WeinviewRecipePython
     $recipeCatalog=Read-WeinviewAssociatedRecipeCatalog $projectInput $before $root ($prefix+'.associated') $python
     if($recipeCatalog){$recipeFields=$recipeCatalog.fields}
    }
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Native screen workflow clone hash mismatch.'}
    $renderedScreen=($request.operation -ceq 'screen_read' -or [string]$a.object_id -cmatch '^RV_[0-9]{1,5}$')
    $trendNativeHostPort=if([string]$a.object_id -cmatch '^TD_[0-9]{1,5}$' -and [IO.Path]::GetExtension([string]$output) -ieq '.cmtp'){Get-WeinviewNativeHostPort}else{0}
    $stage='open_owned_screen_workflow';$s=StartOwned $exe $output $renderedScreen $false $trendNativeHostPort;$s.owned_semantic_background=(-not $renderedScreen);SetEditSession $s $output $exe;$s.owned_ribbon_background=(-not $renderedScreen);$s.ribbon_project_sha256=$before
    $tagEvidence=$null;$tagReopened=$null
    if($request.operation -ceq 'screen_update' -and $a.object_id -cmatch '^RV_[0-9]{1,5}$' -and $a.PSObject.Properties.Name -ccontains 'recipe_name' -and !$recipeFields.ContainsKey([string]$a.recipe_name)){
     $stage='export_target_recipe_definition';$context=Open-WeinviewRecipeDatabase $s ($prefix+'.recipe-target')
     $nativeDb=$prefix+'.recipe-target.db';$null=Export-WeinviewRecipeDatabase $s $context ([string]$a.recipe_name) $nativeDb
     Close-WeinviewRecipeDatabaseReadOnly $s $context
     $readRequest=$prefix+'.recipe-target.request.json';$readReceipt=$prefix+'.recipe-target.receipt.json'
     @{operation='read';source_db=$nativeDb;recipe=[string]$a.recipe_name;offset=0;limit=1}|ConvertTo-Json -Depth 5|Set-Content -LiteralPath $readRequest -Encoding UTF8
     $recipeRead=Invoke-WeinviewRecipeDatabaseCodec $python $readRequest $readReceipt
     $definition=$recipeRead.recipes.PSObject.Properties[[string]$a.recipe_name].Value
     if(!$definition){Fail 'Current-project native target Recipe definition absent.'}
     $recipeFields[[string]$a.recipe_name]=@($definition.columns|ForEach-Object {[string]$_.name})
    }
    $s.recipe_view_fields=$recipeFields
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    if($numericReadNeedsTags){$stage='read_screen_tags';$null=Open-WeinviewTagLibrary $s;$tagEvidence=Export-WeinviewTags $s ($prefix+'.screen-tags-before.csv');Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagEvidence}
    $stage='select_native_screen';$null=Select-WeinviewWindow $s $windowNumber
    if($request.operation -eq 'screen_read'){
     $focused=(@($a.PSObject.Properties.Name) -ccontains 'object_id')
     $readDetail=if($focused){'properties'}elseif($a.detail -ceq 'properties'){'properties'}else{'directory'}
     if($focused){
      if($a.object_id -cnotmatch '^(ND|NE|FK|TS|BL|TX|DW|TD|RV|OL|GP|AL)_[0-9]{1,5}$'){Fail 'Exact supported native object ID required for focused screen read.'}
      $stage='read_native_screen_target';$target=Read-WeinviewTargetObject $s ([string]$a.object_id) $before ($prefix+'.read-target') $false $false
      $snapshot=[pscustomobject]@{window_name=$target.window_name;objects=@($target.object)}
      $readEvidencePath=$target.read_evidence_path
     }elseif($readDetail -ceq 'properties'){
      $stage='read_native_screen_objects';$snapshot=Invoke-WeinviewScreenRead $s $before ($prefix+'.read')
      $readEvidencePath=$prefix+'.read.snapshot.json'
     }else{
      $stage='read_native_screen_directory';$snapshot=Invoke-WeinviewScreenDirectoryRead $s $before ($prefix+'.read')
      $readEvidencePath=$prefix+'.read.directory.json'
     }
     $stage='close_readonly_screen_inspection';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Read-only screen source/copy bytes changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;window_name=$snapshot.window_name;objects=@($snapshot.objects);detail=$readDetail;property_scope=if($focused){'native_target_properties'}elseif($readDetail -ceq 'directory'){'native_directory_id_kind_label_order_only'}else{'native_supported_properties'};target_only_verified=$focused;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$readEvidencePath}
     if($focused -and $target.channel_y_axis_evidence){$data.channel_y_axis_evidence=$target.channel_y_axis_evidence}
    }else{
     if($a.object_id -notmatch '^(ND|NE|FK|TS|BL|TX|RV|TD|OL|GP|DW|AL)_[0-9]+$' -or $a.expected_object_sha256 -notmatch '^[A-Fa-f0-9]{64}$'){Fail 'Exact native object ID and observed before object SHA required.'}
     $securityRequested=@($a.PSObject.Properties.Name) -ccontains 'security_class'
     $colorRequested=@($a.PSObject.Properties.Name|Where-Object {$_ -cin @('numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb')})
      $colorReadFields=if($colorRequested.Count -and $a.object_id -cmatch '^(TS|BL|FK)_[0-9]+$'){@('off_text_rgb','on_text_rgb')}else{$colorRequested}
     $stage='update_native_screen_target';$applied=Invoke-WeinviewScreenTargetUpdate $s $a $before ($prefix+'.apply') -TagEvidence $tagEvidence
     if($securityRequested -and ($applied.security_class_requested -cne [string]$a.security_class -or $applied.security_class_after -cne [string]$a.security_class)){Fail 'Original object security class differs before save.'}
     $stage='save_native_screen_update';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_screen_update';CloseSession $s $output $saved $false
     $stage='reopen_native_screen_update';$s=StartOwned $exe $output $renderedScreen;$s.owned_semantic_background=(-not $renderedScreen);SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
     if($numericReadNeedsTags){$stage='read_reopened_screen_tags';$null=Open-WeinviewTagLibrary $s;$tagReopened=Export-WeinviewTags $s ($prefix+'.screen-tags-reopened.csv');Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagReopened}
     $stage='select_persisted_native_screen';$null=Select-WeinviewWindow $s $windowNumber
      $stage='persisted_native_screen_target_readback';$persisted=Read-WeinviewTargetObject $s $a.object_id $saved ($prefix+'.persisted') $false $securityRequested ([string[]]$colorReadFields)
     $actual=$persisted.object
      if([int]$persisted.window_number -ne $windowNumber -or $actual.object_id -cne $a.object_id){Fail 'Saved/reopened native target object differs.'}
      if($actual.object_sha256 -cne $applied.object_after.object_sha256){
       $modeChanged=($actual.kind -ceq 'option_list' -and @($a.PSObject.Properties.Name) -ccontains 'mode' -and $applied.object_before.mode -cne $applied.object_after.mode -and $actual.mode -ceq $a.mode)
       $oldRect=@($applied.object_after.rectangle);$newRect=@($actual.rectangle)
       if(!$modeChanged -or $oldRect.Count -ne 4 -or $newRect.Count -ne 4 -or [int]$oldRect[0] -ne [int]$newRect[0] -or [int]$oldRect[1] -ne [int]$newRect[1] -or [int]$oldRect[2] -ne [int]$newRect[2] -or [int]$newRect[3] -lt 1 -or ([int]$newRect[1]+[int]$newRect[3]) -gt [int]$s.window_height){Fail 'Saved/reopened native target object differs.'}
       $expectedPersisted=$applied.object_after.canonical_json|ConvertFrom-Json
       $expectedPersisted.rectangle[3]=[int]$newRect[3]
       if((CanonicalObjectHash $expectedPersisted) -cne $actual.object_sha256){Fail 'Saved/reopened native target fields differ beyond automatic Option List mode height.'}
      }
     if($a.object_id -cmatch '^TD_[0-9]+$' -and (!$applied.channel_y_axis_before -or !$applied.channel_y_axis_after -or !$persisted.channel_y_axis_evidence)){Fail 'Trend channel Y axis evidence missing.'}
     if($tagUpdateRequested){[PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$tagEvidence.tags,[PLCCode.Weinview.TagRow[]]$tagReopened.tags);if($tagEvidence.tags_sha256 -cne $tagReopened.tags_sha256){Fail 'Native Tag library changed during reference update.'}}
     if($securityRequested -and $persisted.security_class -cne [string]$a.security_class){Fail 'Saved/reopened object security class differs.'}
      $appearanceColor=$null
      if($colorRequested.Count){
       $appearanceColor=$applied.appearance_color_evidence
       if(!$appearanceColor -or !$appearanceColor.native_rgb_verified -or $appearanceColor.object_id -cne $a.object_id -or !$persisted.appearance_color){Fail 'Native target RGB proof missing.'}
       foreach($field in $colorReadFields){$expectedRgb=if($colorRequested -ccontains $field){@($a.$field)}else{@($appearanceColor.before.$field)};if((@($appearanceColor.after.$field) -join ',') -cne ($expectedRgb -join ',') -or (@($persisted.appearance_color.$field) -join ',') -cne ($expectedRgb -join ',')){Fail ('Saved/reopened target RGB differs: '+$field)}}
       $appearanceColor|Add-Member -NotePropertyName reopened -NotePropertyValue $persisted.appearance_color
      }
     $stage='close_readonly_screen_update';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Native update source/output final invariant failed.'}
     $reopenVerified=$true
      $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;screen=$windowNumber;window_name=$persisted.window_name;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;object_before=$applied.object_before;object_after=$actual;objects=@($actual);appearance_color_evidence=$appearanceColor;appearance_shape_evidence=$applied.appearance_shape_evidence;security_class_before=$applied.security_class_before;security_class_requested=$applied.security_class_requested;security_class_after=$applied.security_class_after;security_class_reopened=if($securityRequested){$persisted.security_class}else{$null};security_class_edit=$applied.security_class_edit;target_only_verified=$true;untouched_objects_verified=$false;untouched_objects_verification_scope='not inspected; target object only';directory_object_count_before=$applied.directory_object_count_before;target_raw_label=$applied.target_raw_label;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$persisted.read_evidence_path}
     if($a.object_id -cmatch '^TD_[0-9]+$'){$data.channel_y_axis_before=$applied.channel_y_axis_before;$data.channel_y_axis_after=$applied.channel_y_axis_after;$data.channel_y_axis_reopened=$persisted.channel_y_axis_evidence}
     if($tagUpdateRequested){
      $tagProof=[ordered]@{object_id=[string]$a.object_id}
      foreach($field in $applied.tag_binding_evidence.PSObject.Properties){if($field.Name -ceq 'object_id' -and [string]$field.Value -cne [string]$a.object_id){Fail 'Native Tag proof target identity differs'};$tagProof[$field.Name]=$field.Value}
      $data.tag_binding_evidence=$tagProof;$data.tag_before_sha256=$tagEvidence.tags_sha256;$data.tag_reopened_sha256=$tagReopened.tags_sha256;$data.tag_csv_path=$tagEvidence.native_csv_path
     }
     if($actual.kind -ceq 'recipe_view'){
      $resource=if($recipeCatalog){$recipeCatalog}elseif($nativeDb -and $recipeRead){[pscustomobject]@{path=$nativeDb;source_sha256=$recipeRead.source_sha256}}else{$null}
      if($resource){$data.associated_db_path=[string]$resource.path;$data.associated_db_sha256=[string]$resource.source_sha256;$data.associated_db_bytes=(Get-Item -LiteralPath $resource.path).Length}
      $data.recipe_display_persisted_verified=$true;$data.recipe_complete_properties_verified=$false;$data.references_relinked=$false
     }
    }
   }elseif($request.operation -ceq 'recipe_database'){
    if($oldHeader -or $expectedOutputExtension -ine '.cmtp'){Fail 'Current cMT native project required for observed Recipe Database exchange.'}
    $definitionAction=($a.action -cin @('create_recipe','add_field','rename_field'))
    if($a.action -cnotin @('read','apply','create_recipe','add_field','rename_field') -or $a.recipe_name -isnot [string] -or [string]::IsNullOrWhiteSpace($a.recipe_name)){Fail 'Native Recipe Database action and recipe name required.'}
    if($a.action -ceq 'apply' -and (@($a.edits).Count -lt 1 -or @($a.edits).Count -gt 100)){Fail 'One to 100 record edits required.'}
    $referenceProbe=(@($a.PSObject.Properties.Name) -ccontains 'reference_behavior_probe' -and $a.reference_behavior_probe -ceq $true)
    if($referenceProbe -and ($a.action -cne 'rename_field' -or $a.probe_window_number -isnot [int] -or $a.probe_window_number -lt 10 -or $a.probe_window_number -gt 1999 -or $a.probe_object_id -isnot [string] -or $a.probe_object_id -cnotmatch '^RV_[0-9]{1,5}$')){Fail 'Exact known Recipe View target required for direct definition-reference probe.'}
    Add-Type -AssemblyName Accessibility
    $recipeTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','ObjectRibbonControls.cs','RecipeDatabaseControls.cs')
    if($a.action -ceq 'rename_field'){$recipeTypes+=@('WindowTreeControls.cs','RecipeViewDisplayControls.cs','RecipeViewClipboard.cs')}
    Add-Type -Path @($recipeTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    foreach($helper in @('PlcConfigurationCandidate.ps1','ObjectRibbonAction.ps1','RecipeDatabaseProjectOperation.ps1','RecipeDatabaseOperation.ps1','RecipeDatabaseDefinitionOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}
    if($a.action -ceq 'rename_field'){
     foreach($helper in @('WindowOperation.ps1','WindowRibbonAction.ps1','ScreenWorkflow.ps1','RecipeViewOperation.ps1','MacroFileOperation.ps1','NativeHostRead.ps1','RecipeReferenceOperation.ps1')){. (Join-Path $PSScriptRoot $helper)}
    }
    $python=Get-WeinviewRecipePython
    $prefix=Under (Join-Path $root ('.weinview-recipe-database-'+[Guid]::NewGuid().ToString('N'))) $root
    $beforeDb=$prefix+'.before.db';$editedDb=$prefix+'.edited.db';$associatedDb=$output+'.recipe.db'
    if(Test-Path -LiteralPath $associatedDb){Fail 'Fresh associated native Recipe Database export required.'}
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $output) -cne $before){Fail 'Recipe Database project clone differs.'}
    $recipeHostPort=0;if($a.action -ceq 'rename_field'){try{$recipeHostPort=Get-WeinviewNativeHostPort}catch{}}
    $stage='open_owned_recipe_database';$s=StartOwned $exe $output $true $false $recipeHostPort;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$before
    $recipeReferencesBefore=$null;$recipeReferenceEdit=$null;$recipeReferencesReopened=$null;$displayReferencesReopenedVerified=$false;$sortCandidateSelectionReopenedVerified=$false;$sortCandidateSelectionCount=0;$displayReferenceHitCount=0;$displayReferenceChangedCount=0;$macroReferenceCandidatesBefore=$null;$macroReferenceImport=$null;$macroReferenceReopened=$null
    if($a.action -ceq 'rename_field'){
     $stage='inventory_native_macro_recipe_field_candidates'
     $macroReferenceCandidatesBefore=Get-WeinviewRecipeMacroReferenceCandidates $s ([string]$a.recipe_name) ([string]$a.field) ([string]$a.new_name) ($prefix+'.recipe-macro-references-before') $python
     $s.owned_semantic_background=$true
     Set-WeinviewScreenSession $s $output $exe ($prefix+'.recipe-reference-before-identity.json')
     $stage='inventory_native_recipe_view_targets';$recipeReferencesBefore=Get-WeinviewRecipeViewReferenceTargets $s
     $stage='read_recipe_view_targets_before_definition_edit';$referenceIndex=0
     foreach($target in @($recipeReferencesBefore.targets)){
      $referenceIndex++;$null=Select-WeinviewWindow $s ([int]$target.window_number)
      $referenceBefore=Read-WeinviewTargetObject $s ([string]$target.object_id) $before ($prefix+'.recipe-view-before-definition-'+$referenceIndex) $false
      if($referenceBefore.object.kind -cne 'recipe_view') {Fail 'Native Recipe View inventory target resolved to another object kind.'}
      $target['before_definition']=$referenceBefore.object
     }
     if($referenceProbe){
      $stage='read_known_recipe_view_before_definition_edit'
      $knownReferenceBefore=Read-WeinviewKnownRecipeViewReference $s ([int]$a.probe_window_number) ([string]$a.probe_object_id) ([string]$a.recipe_name)
      if([string]$a.field -cnotin @($knownReferenceBefore.displayed_fields) -or (Hash $output) -cne $before){Fail 'Known Recipe View probe target does not display exact old field or source changed.'}
     }
    }
    $stage='export_native_recipe_database';$context=Open-WeinviewRecipeDatabase $s $prefix ($a.action -cne 'create_recipe')
    $nativeBefore=$null;$initialRecipe=$null;$definitionEdit=$null;$definitionFieldsBefore=@()
    if(!$definitionAction){
     $nativeBefore=Export-WeinviewRecipeDatabase $s $context ([string]$a.recipe_name) $beforeDb
    }
    $imported=$null;$edited=$null
    if($definitionAction){
     $stage='edit_native_recipe_definition';$definitionEdit=Invoke-WeinviewRecipeDefinitionProjectEdit $s $context $a $python ($prefix+'.definition')
     $imported=$definitionEdit.imported;$edited=$definitionEdit.edited;$editedDb=[string]$definitionEdit.edited_db_path
     if($a.action -cne 'create_recipe'){$nativeBefore=$definitionEdit.source;$beforeDb=[string]$nativeBefore.path}
     if($a.action -ceq 'rename_field'){
      $stage='import_static_recipe_macro_references';$macroReferenceImport=Import-WeinviewRecipeMacroReferences $s $macroReferenceCandidatesBefore
      $newDefinition=$definitionEdit.edited.recipes.PSObject.Properties[[string]$a.recipe_name].Value
      $newFields=@($newDefinition.fields|ForEach-Object {[string]$_})
      $stage='relink_native_recipe_view_references';$recipeReferenceEdit=Invoke-WeinviewRecipeViewReferenceRelink $s $recipeReferencesBefore ([string]$a.recipe_name) ([string]$a.field) ([string]$a.new_name) $newFields $before ($prefix+'.recipe-view-relink')
     }
    }
    if($nativeBefore){
     $codecReadRequest=$prefix+'.read-request.json';$codecReadReceipt=$prefix+'.read-receipt.json'
     @{operation='read';source_db=$beforeDb;recipe=[string]$a.recipe_name;offset=0;limit=1000}|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $codecReadRequest -Encoding UTF8
     $initial=Invoke-WeinviewRecipeDatabaseCodec $python $codecReadRequest $codecReadReceipt
     $initialRecipe=$initial.recipes.PSObject.Properties[[string]$a.recipe_name].Value
     if(!$initialRecipe -or [int]$initialRecipe.count -gt 1000){Fail 'Existing Recipe Database record page exceeds supported bounded read.'}
     $definitionFieldsBefore=@($initialRecipe.columns|ForEach-Object {$_.name})
    }else{
     $initialRecipe=[pscustomobject]@{count=0;columns=@();records=@()}
    }
    if($a.action -ceq 'apply'){
     $edits=@($a.edits|ForEach-Object {@{recipe=[string]$a.recipe_name;mode=[string]$_.mode;index=$_.index;values=$_.values}})
     $codecApplyRequest=$prefix+'.apply-request.json';$codecApplyReceipt=$prefix+'.apply-receipt.json'
     @{operation='apply';source_db=$beforeDb;output_db=$editedDb;edits=$edits}|ConvertTo-Json -Depth 14|Set-Content -LiteralPath $codecApplyRequest -Encoding UTF8
     $stage='edit_native_recipe_records';$edited=Invoke-WeinviewRecipeDatabaseCodec $python $codecApplyRequest $codecApplyReceipt
     $stage='import_native_recipe_database';$imported=Import-WeinviewRecipeDatabase $s $context ([string]$a.recipe_name) $editedDb ([string]$edited.output_sha256)
     $stage='save_native_recipe_database';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_recipe_database';CloseSession $s $output $saved $false
     $stage='reopen_saved_recipe_database';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     $stage='export_persisted_recipe_database';$reopened=Open-WeinviewRecipeDatabase $s ($prefix+'.reopened')
     $nativeAfter=Export-WeinviewRecipeDatabase $s $reopened ([string]$a.recipe_name) $associatedDb
     Close-WeinviewRecipeDatabaseReadOnly $s $reopened
     $stage='close_readonly_recipe_database';CloseSession $s $output $saved $true
     $expectedDb=$editedDb
    }elseif($definitionAction){
     $stage='save_native_recipe_definition';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_recipe_definition';CloseSession $s $output $saved $false
     $stage='reopen_saved_recipe_definition';$s=StartOwned $exe $output;SetEditSession $s $output $exe;$s.owned_ribbon_background=$true;$s.ribbon_project_sha256=$saved
     $stage='export_persisted_recipe_definition';$reopened=Open-WeinviewRecipeDatabase $s ($prefix+'.reopened')
     $nativeAfter=Export-WeinviewRecipeDatabase $s $reopened ([string]$a.recipe_name) $associatedDb
     Close-WeinviewRecipeDatabaseReadOnly $s $reopened
     if($a.action -ceq 'rename_field'){
      $stage='read_persisted_static_recipe_macro_references';$macroReferenceReopened=Assert-WeinviewRecipeMacroReferencesReopened $s $macroReferenceCandidatesBefore ($prefix+'.recipe-macro-references-reopened')
      $s.owned_semantic_background=$true;Set-WeinviewScreenSession $s $output $exe ($prefix+'.recipe-reference-reopened-identity.json')
      $stage='read_persisted_recipe_view_references';$recipeReferencesReopened=Assert-WeinviewRecipeViewReferencesReopened $s $recipeReferenceEdit $saved ($prefix+'.recipe-view-reopened')
     }
     if($a.action -ceq 'rename_field' -and $referenceProbe){
      $s.owned_semantic_background=$true
      Set-WeinviewScreenSession $s $output $exe ($prefix+'.known-recipe-reference-reopened-identity.json')
      $stage='read_persisted_known_recipe_view_after_native_definition_rename'
      $knownReferenceAfter=Read-WeinviewKnownRecipeViewReference $s ([int]$a.probe_window_number) ([string]$a.probe_object_id) ([string]$a.recipe_name)
      $referenceBehaviorProbe=@{scope='one_known_recipe_view_only';window_number=[int]$a.probe_window_number;object_id=[string]$a.probe_object_id;before=$knownReferenceBefore;after=$knownReferenceAfter;old_field=[string]$a.field;new_field=[string]$a.new_name;display_auto_relinked=([string]$a.field -cnotin @($knownReferenceAfter.displayed_fields) -and [string]$a.new_name -cin @($knownReferenceAfter.displayed_fields));whole_project_references_verified=$false;sort_enabled_verified=$false}
     }
     $stage='close_readonly_recipe_definition';CloseSession $s $output $saved $true
     $expectedDb=$editedDb
    }else{
     Close-WeinviewRecipeDatabaseReadOnly $s $context
     $stage='close_readonly_recipe_database';CloseSession $s $output $before $true
     [IO.File]::Copy($beforeDb,$associatedDb,$false)
     $nativeAfter=[pscustomobject]@{path=$associatedDb;sha256=(Hash $associatedDb);bytes=(Get-Item -LiteralPath $associatedDb).Length;native_export_verified=$true;include_records_checked=$true}
     $saved=$before;$expectedDb=$beforeDb
    }
    $codecExpectedRequest=$prefix+'.expected-request.json';$codecExpectedReceipt=$prefix+'.expected-receipt.json'
    @{operation='read';source_db=$expectedDb;recipe=[string]$a.recipe_name;offset=0;limit=1000}|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $codecExpectedRequest -Encoding UTF8
    $expectedRows=Invoke-WeinviewRecipeDatabaseCodec $python $codecExpectedRequest $codecExpectedReceipt
    $codecFinalRequest=$prefix+'.final-request.json';$codecFinalReceipt=$prefix+'.final-receipt.json'
    @{operation='read';source_db=$associatedDb;recipe=[string]$a.recipe_name;offset=0;limit=1000}|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $codecFinalRequest -Encoding UTF8
    $persistedRows=Invoke-WeinviewRecipeDatabaseCodec $python $codecFinalRequest $codecFinalReceipt
    $expectedTable=$expectedRows.recipes.PSObject.Properties[[string]$a.recipe_name].Value
    $actualTable=$persistedRows.recipes.PSObject.Properties[[string]$a.recipe_name].Value
    if(!$actualTable -or $expectedTable.count -ne $actualTable.count -or ($expectedTable.columns|ConvertTo-Json -Depth 8 -Compress) -cne ($actualTable.columns|ConvertTo-Json -Depth 8 -Compress) -or ($expectedTable.records|ConvertTo-Json -Depth 10 -Compress) -cne ($actualTable.records|ConvertTo-Json -Depth 10 -Compress)){Fail 'Original-vendor Recipe Database re-export rows or definition differ.'}
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved -or (Hash $associatedDb) -cne $nativeAfter.sha256){Fail 'Recipe Database source/output/associated native DB differs.'}
    $reopenVerified=($a.action -cne 'read')
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;action=[string]$a.action;recipe_name=[string]$a.recipe_name;associated_db_path=$associatedDb;associated_db_sha256=$nativeAfter.sha256;associated_db_bytes=$nativeAfter.bytes;native_export_verified=$true;native_import_verified=($a.action -cne 'read');pc_database_update_confirmed=if($imported){[bool]$imported.pc_database_update_confirmed}else{$false};record_rows_verified=$true;record_count_before=[int]$initialRecipe.count;record_count_after=[int]$actualTable.count;records_before=@($initialRecipe.records);records=@($actualTable.records);columns=@($actualTable.columns);definition_edit=$definitionEdit;definition_fields_before=@($definitionFieldsBefore);references_relinked=$false;definition_persisted_verified=if($definitionAction){$true}else{$false};project_saved=($a.action -cne 'read');source_unchanged=$true;reopen_verified=$reopenVerified;normal_main_exit_verified=$true;normal_reopen_exit_verified=$reopenVerified;compile_verified=$false;runtime_verified=$false;own_processes=$own;activation_evidence=$activationEvidence;profile='6.10.02.421-zh-CN-native-recipe-database-v1'}
    if($a.action -ceq 'rename_field'){$data.reference_inventory_scope='native_directory_and_macro_export';$data.macro_reference_candidates_before=$macroReferenceCandidatesBefore;$data.macro_reference_import=$macroReferenceImport;$data.macro_reference_reopened=$macroReferenceReopened;$data.macro_static_references_relinked=[bool]$macroReferenceReopened.verified;$data.macro_dynamic_or_unclassified=@($macroReferenceCandidatesBefore.unresolved);$data.recipe_view_references_before=$recipeReferencesBefore;$data.recipe_view_reference_edit=$recipeReferenceEdit;$data.recipe_view_references_reopened=$recipeReferencesReopened;$data.reference_behavior_probe=$referenceBehaviorProbe;$data.display_reference_hit_count=@($recipeReferenceEdit.changed|Where-Object {$_.display_field_replaced}).Count;$data.display_reference_changed_count=@($recipeReferenceEdit.changed|Where-Object {$_.display_field_replaced}).Count;$data.display_references_relinked=[bool]$recipeReferencesReopened.verified;$data.sort_candidate_selection_readback_verified=[bool]$recipeReferencesReopened.verified;$data.sort_candidate_selection_count=@($recipeReferenceEdit.changed|Where-Object {$_.sort_field_replaced}).Count;$data.sort_references_relinked=[bool]$recipeReferencesReopened.verified;$data.other_recipe_consumers_relinked=$false}
   }elseif($request.operation -ceq 'label_apply'){
    if($oldHeader -or $expectedOutputExtension -ine '.cmtp'){Fail 'Current cMT native project required for observed CN421 Label Tag Library editing.'}
    Add-Type -AssemblyName Accessibility
    $labelTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','ObjectRibbonControls.cs','TagRibbonControls.cs','LabelRibbonControls.cs','LabelGridControls.cs','WindowRibbonControls.cs','NumericAddressTypeControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs')
    Add-Type -Path @($labelTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','System.Core.dll','Microsoft.CSharp.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'TagRibbonAction.ps1');. (Join-Path $PSScriptRoot 'LabelLibraryOperation.ps1');. (Join-Path $PSScriptRoot 'LabelWorkbookCodec.ps1')
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1')
    . (Join-Path $PSScriptRoot 'LabelTextBindingOperation.ps1');. (Join-Path $PSScriptRoot 'LabelApplyOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-label-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -cne $before){Fail 'Native label workflow clone hash mismatch.'}
    $stage='open_owned_label_project';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $twoPhase=(@($a.labels).Count -gt 0 -and @($a.bindings).Count -gt 0)
    if($twoPhase){
     $stage='apply_native_label_library';$libraryApplied=Invoke-WeinviewLabelApplyLibrary $s $a $before ($prefix+'.library')
     $stage='save_native_label_library';$intermediate=SaveEditedProject $s $output $before
     $stage='close_saved_label_library';CloseSession $s $output $intermediate $false
     $stage='reopen_committed_label_library';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.library-reopen-identity.json')
     $stage='apply_native_label_bindings';$applied=Invoke-WeinviewLabelApplyBindings $s $a $intermediate ($prefix+'.bindings') $libraryApplied
     $stage='save_native_label_bindings';$saved=SaveEditedProject $s $output $intermediate
     $stage='close_saved_label_bindings';CloseSession $s $output $saved $false
    }else{
     $stage='apply_native_label_changes';$applied=Invoke-WeinviewLabelApply $s $a $before ($prefix+'.apply')
     $stage='save_native_label_project';$saved=SaveEditedProject $s $output $before
     $stage='close_saved_label_project';CloseSession $s $output $saved $false
    }
    $stage='reopen_native_label_project';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='read_persisted_native_labels';$persisted=Read-WeinviewPersistedLabelApply $s $applied $saved ($prefix+'.persisted')
    if(!$persisted.bindings_reopened_verified -or (@($applied.applied_labels).Count -gt 0 -and !$persisted.labels_table_reopened_verified)){Fail 'Persisted native labels or object references differ.'}
    $stage='close_readonly_label_project';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved){Fail 'Native label source/output final invariant failed.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;applied_labels=@($applied.applied_labels);language_slots=@($applied.language_slots);labels_expected_table_sha256=$applied.labels_expected_table_sha256;labels_reopened_table_sha256=$persisted.labels_table_sha256;labels_table_reopened_verified=$persisted.labels_table_reopened_verified;empty_library_bootstrapped=$applied.empty_library_bootstrapped;native_import_verified=$applied.native_import_verified;native_import_replacement_prompt_confirmed=$applied.native_import_replacement_prompt_confirmed;preserved_existing_labels=$applied.preserved_existing_labels;bindings=@($persisted.bindings);bindings_reopened_verified=$persisted.bindings_reopened_verified;project_saved=$true;source_unchanged=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;compile_verified=$false;runtime_verified=$false;own_processes=$own;activation_evidence=$activationEvidence}
   }elseif($request.operation -ceq 'picture_apply'){
     if($oldHeader -or $expectedOutputExtension -inotmatch '^\.(cmtp|emtp)$'){Fail 'Current-version native project required for picture import.'}
     if($expectedOutputExtension -ieq '.emtp' -and @($a.pictures|Where-Object {$_.object_id -cnotmatch '^GP_[0-9]+$'}).Count){Fail 'MT picture replacement currently supports GP Picture objects only.'}
    $pictures=@($a.pictures);if($pictures.Count -lt 1 -or $pictures.Count -gt 4){Fail 'One to four native picture bindings required.'}
    $identities=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
    foreach($picture in $pictures){
     $windowNumber=SelectedWindowNumber $picture
     if(!$identities.Add(([string]$windowNumber+':'+[string]$picture.object_id))){Fail 'Each requested native picture object must be distinct.'}
     $library=Under ([string]$picture.library_path) $root
     if([IO.Path]::GetExtension($library) -ine '.flbx' -or !(Test-Path -LiteralPath $library -PathType Leaf) -or (Hash $library) -ine [string]$picture.expected_library_sha256){Fail 'Every pinned workspace FLBX library required before opening vendor project.'}
    }
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeSemanticControls.cs'),(Join-Path $PSScriptRoot 'WindowRibbonControls.cs'),(Join-Path $PSScriptRoot 'NativeScreenScene.cs'),(Join-Path $PSScriptRoot 'ObjectRibbonControls.cs'),(Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'NumericTagSettingsControls.cs'),(Join-Path $PSScriptRoot 'FunctionWindowTargetControls.cs'),(Join-Path $PSScriptRoot 'BitAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'WindowTreeControls.cs'),(Join-Path $PSScriptRoot 'NativeResourceReuseControls.cs')) -ReferencedAssemblies 'System.dll','System.Core.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'NativeResourceReuseOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-picture-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -cne $before){Fail 'Picture workflow clone hash mismatch.'}
    $stage='open_owned_picture_project';$s=StartOwned $exe $output $true;$s.owned_semantic_background=$true;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $appliedPictures=@()
    for($index=0;$index -lt $pictures.Count;$index++){
     $picture=$pictures[$index];$windowNumber=SelectedWindowNumber $picture
     $stage='select_picture_window';$null=Select-WeinviewWindow $s $windowNumber
     $stage='import_and_bind_native_picture';$applied=Invoke-WeinviewNativePictureApply $s $picture $before ($prefix+'.apply-'+$index)
     if($applied.native_import_count -ne 1 -or $applied.native_copy_count -ne 1 -or !$applied.object_picture_confirmed_before_save){Fail 'Native picture import/object confirmation missing.'}
     $appliedPictures+=,[pscustomobject]@{request=$picture;applied=$applied}
    }
    $stage='save_picture_project';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_picture_project';CloseSession $s $output $saved $false
    $stage='reopen_picture_project';$s=StartOwned $exe $output $true;$s.owned_semantic_background=$true;SetEditSession $s $output $exe;Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $persistedPictures=@()
    for($index=0;$index -lt $appliedPictures.Count;$index++){
     $item=$appliedPictures[$index];$picture=$item.request;$applied=$item.applied;$windowNumber=SelectedWindowNumber $picture
     $stage='select_persisted_picture_window';$null=Select-WeinviewWindow $s $windowNumber
     $expectedAfterSha=[string]$picture.expected_object_sha256
     if([string]$picture.object_id -cmatch '^GP_[0-9]{1,5}$'){
      $expectedAfterSha=[string]$applied.object_after_sha256
      if($expectedAfterSha -cnotmatch '^[0-9A-Fa-f]{64}$'){Fail 'New Picture resource identity requires its actual post-bind object hash.'}
     }
     $readArgs=[pscustomobject]@{window_number=[int]$windowNumber;object_id=[string]$picture.object_id;project_picture_index=[int]$applied.project_picture_index;picture_name=[string]$picture.picture_name;expected_states=[int]$picture.expected_states;expected_object_sha256=$expectedAfterSha;expected_references=1}
     $stage='read_persisted_native_picture_binding';$binding=Read-WeinviewNativePictureBinding $s $readArgs $saved ($prefix+'.persisted-'+$index)
     if(!$binding.persisted_binding_verified -or [int]$binding.native_reference_count -ne 1){Fail 'Persisted picture binding differs.'}
     $persistedPictures+=,[pscustomobject]@{window_number=$windowNumber;object_id=[string]$picture.object_id;library_path=[string]$picture.library_path;library_sha256=(Hash (Under ([string]$picture.library_path) $root));picture_name=[string]$picture.picture_name;library_picture_index=[int]$picture.picture_index;project_picture_index=[int]$applied.project_picture_index;state_count=[int]$picture.expected_states;object_business_sha256=[string]$picture.expected_object_sha256;object_after_sha256=$expectedAfterSha;native_reference_count=1;apply_evidence=$applied;binding_evidence=$binding}
    }
    $stage='close_readonly_picture_project';CloseSession $s $output $saved $true
    if((Hash $projectInput) -cne $before -or (Hash $output) -cne $saved -or $persistedPictures.Count -ne $pictures.Count){Fail 'Picture source/output or persisted binding invariant failed.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;pictures=@($persistedPictures);picture_count=$persistedPictures.Count;native_import_count=$persistedPictures.Count;native_copy_count=$persistedPictures.Count;binding_reopen_verified=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;project_saved=$true;compile_verified=$false;runtime_verified=$false;own_processes=$own;activation_evidence=$activationEvidence}
   }elseif($request.operation -eq 'screen_add_numeric'){
    if($oldHeader){Fail 'Current-version native project required for numeric addition.'}
    $windowNumber=SelectedWindowNumber $a
    $items=@($a.objects);if($items.Count -lt 1 -or $items.Count -gt 8){Fail 'Numeric addition requires 1..8 objects.'}
    $taggedItems=@($items|Where-Object {$_.tag_name})
    Add-Type -AssemblyName Accessibility
    $numericTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','NativeScreenScene.cs','QtModbusEndpointCandidate.cs','NumericRibbonControls.cs','ObjectRibbonControls.cs','NumericAddressTypeControls.cs','NumericTagSettingsControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','WindowTreeControls.cs','AlarmDisplayDialogControls.cs')
    if($taggedItems.Count){$numericTypes+=@('TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs')}
    Add-Type -Path @($numericTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1');. (Join-Path $PSScriptRoot 'PlcOperation.ps1')
    . (Join-Path $PSScriptRoot 'NumericRibbonAction.ps1');. (Join-Path $PSScriptRoot 'NumericAddressBinding.ps1');. (Join-Path $PSScriptRoot 'NumericAdditionOperation.ps1')
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1')
    if($taggedItems.Count){. (Join-Path $PSScriptRoot 'TagRibbonAction.ps1');. (Join-Path $PSScriptRoot 'TagOperation.ps1')}
    $prefix=Under (Join-Path $root ('.weinview-add-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Numeric addition clone hash mismatch.'}
    $stage='open_owned_numeric_addition';$s=StartOwned $exe $output;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='select_numeric_addition_screen';$selectedWindow=Select-WeinviewWindow $s $windowNumber
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Numeric placement requires bounded actual native window dimensions.'}
    $tagEvidence=$null
    if($taggedItems.Count){$stage='read_existing_numeric_tags';$null=Open-WeinviewTagLibrary $s;$tagEvidence=Export-WeinviewTags $s ($prefix+'.numeric-tags-before.csv');Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagEvidence;$null=Select-WeinviewWindow $s $windowNumber}
    $externalNames=@($items|Where-Object {!$_.tag_name -and $_.device -cne 'Local HMI'}|ForEach-Object {$_.device}|Select-Object -Unique)
    $deviceReadbacks=@()
    # The target numeric property's native device/type choices and saved readback
    # establish the binding; unrelated driver property forms are not opened.
    $stage='apply_new_numeric_objects';$applied=Invoke-WeinviewNumericAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -VerifiedDevices $deviceReadbacks -BridgeRoot $PSScriptRoot -TagEvidence $tagEvidence
    if(!$applied.native_fields_verified -or @($applied.objects).Count -ne $items.Count){Fail 'Native numeric apply fields missing.'}
    $stage='save_numeric_addition';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_numeric_addition';CloseSession $s $output $saved $false
    $stage='reopen_numeric_addition';$s=StartOwned $exe $output;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_persisted_numeric_screen';$null=Select-WeinviewWindow $s $windowNumber
    $tagReopened=$null
    if($taggedItems.Count){$stage='reverify_existing_numeric_tags';$null=Open-WeinviewTagLibrary $s;$tagReopened=Export-WeinviewTags $s ($prefix+'.numeric-tags-reopened.csv');[PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$tagEvidence.tags,[PLCCode.Weinview.TagRow[]]$tagReopened.tags);if($tagEvidence.tags_sha256 -cne $tagReopened.tags_sha256){Fail 'Numeric source tag CSV changed after save/reopen.'};Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagReopened;$null=Select-WeinviewWindow $s $windowNumber}
    $deviceReadbacksReopened=@()
    $stage='persisted_numeric_addition_readback';$persisted=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot ([string[]]@($applied.objects|ForEach-Object {$_.object_id}))
    Assert-WeinviewAdditionSnapshots $applied.after_snapshot $persisted 0
     $appearanceColors=CompleteAdditionAppearanceColors $s $applied.appearance_color_evidence $saved ($prefix+'.persisted')
     $addedObjects=@();foreach($created in @($applied.objects)){$matches=@($persisted.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1 -or $matches[0].object_sha256 -cne (CanonicalObjectHash (CanonicalObject $created.object_id $created))){Fail 'Persisted newly created numeric identity or native fields differ.'};$addedObjects+=$matches[0]}
    if($addedObjects.Count -ne $items.Count){Fail 'Persisted numeric native readback count differs.'}
    $stage='close_readonly_numeric_addition';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Numeric addition source/output invariant failed.'}
    $reopenVerified=$true
 $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$applied.profile;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;objects_readback=$addedObjects;rectangle_adjustments=@($applied.rectangle_adjustments|Where-Object {$null -ne $_});appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($applied.appearance_shape_evidence|Where-Object {$null -ne $_});objects_before=@($applied.before_snapshot.objects);objects_after=@($persisted.objects);before_object_count=@($applied.before_snapshot.objects).Count;after_object_count=@($persisted.objects).Count;untouched_objects_verified=$true;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';bounding_boxes_verified=$false;collision_verified=$false;collision_verification_scope='requested rectangles; existing bounds unread';directory_before=$applied.before_snapshot.directory;directory_after=$applied.after_snapshot.directory;directory_reopened=$persisted.directory;alarm_displays_before=@($applied.before_snapshot.alarm_displays);alarm_displays_after=@($applied.after_snapshot.alarm_displays);alarm_displays_reopened=@($persisted.alarm_displays);full_properties_verified=$false;new_objects_created=$true;persisted_verified=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;device_readback=if($deviceReadbacksReopened.Count -eq 1){$deviceReadbacksReopened[0]}else{$null};device_readbacks=@($deviceReadbacks);device_readbacks_reopened=@($deviceReadbacksReopened);tag_bindings=@($applied.tag_bindings);tag_before_sha256=if($tagEvidence){$tagEvidence.tags_sha256}else{$null};tag_reopened_sha256=if($tagReopened){$tagReopened.tags_sha256}else{$null};tag_csv_path=if($tagEvidence){$tagEvidence.native_csv_path}else{$null};creation_evidence=$applied.objects;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false;native_evidence_path=$prefix+'.persisted.snapshot.json'}
   }elseif($request.operation -eq 'screen_add_window_buttons'){
    if($oldHeader){Fail 'Current-version native project required for window_button addition.'}
    $windowNumber=SelectedWindowNumber $a
    $items=@($a.objects);if($items.Count -lt 1 -or $items.Count -gt 8){Fail 'Window-button addition requires 1..8 objects.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeSemanticControls.cs'),(Join-Path $PSScriptRoot 'WindowRibbonControls.cs'),(Join-Path $PSScriptRoot 'NativeScreenScene.cs'),(Join-Path $PSScriptRoot 'ObjectRibbonControls.cs'),(Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'FunctionWindowTargetControls.cs'),(Join-Path $PSScriptRoot 'BitAddressTypeControls.cs'),(Join-Path $PSScriptRoot 'WindowTreeControls.cs'),(Join-Path $PSScriptRoot 'AlarmDisplayDialogControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1');. (Join-Path $PSScriptRoot 'WindowButtonAdditionOperation.ps1')
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1');. (Join-Path $PSScriptRoot 'AlarmDisplayOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-add-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Window-button addition clone hash mismatch.'}
    $stage='open_owned_window_button_addition';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='select_window_button_addition_screen';$selectedWindow=Select-WeinviewWindow $s $windowNumber
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Placement requires bounded actual native selected-window dimensions.'}
    $stage='apply_new_window_button_objects';$applied=Invoke-WeinviewWindowButtonAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
    if(!$applied.native_fields_verified -or @($applied.objects).Count -ne $items.Count){Fail 'Native window_button apply fields missing.'}
    $stage='save_window_button_addition';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_window_button_addition';CloseSession $s $output $saved $false
    $stage='reopen_window_button_addition';$s=StartOwned $exe $output;$s.owned_semantic_background=$true;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_persisted_window_button_screen';$null=Select-WeinviewWindow $s $windowNumber
    $stage='persisted_window_button_addition_readback';$persisted=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot ([string[]]@($applied.objects|ForEach-Object {$_.object_id}))
    Assert-WeinviewAdditionSnapshots $applied.after_snapshot $persisted 0
     $appearanceColors=CompleteAdditionAppearanceColors $s $applied.appearance_color_evidence $saved ($prefix+'.persisted')
    $addedObjects=@();foreach($created in @($applied.objects)){$matches=@($persisted.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1){Fail 'Persisted newly created object identity differs.'};$addedObjects+=$matches[0]}
    if($addedObjects.Count -ne $items.Count){Fail 'Persisted window_button native readback count differs.'}
    $stage='close_readonly_window_button_addition';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Window-button addition source/output invariant failed.'}
    $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$applied.profile;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;objects_readback=$addedObjects;appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($applied.appearance_shape_evidence|Where-Object {$null -ne $_});objects_before=@($applied.before_snapshot.objects);objects_after=@($persisted.objects);before_object_count=@($applied.before_snapshot.objects).Count;after_object_count=@($persisted.objects).Count;untouched_objects_verified=$true;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';bounding_boxes_verified=$false;collision_verified=$false;collision_verification_scope='requested rectangles; existing bounds unread';directory_before=$applied.before_snapshot.directory;directory_after=$applied.after_snapshot.directory;directory_reopened=$persisted.directory;alarm_displays_before=@($applied.before_snapshot.alarm_displays);alarm_displays_after=@($applied.after_snapshot.alarm_displays);alarm_displays_reopened=@($persisted.alarm_displays);full_properties_verified=$false;new_objects_created=$true;persisted_verified=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;creation_evidence=$applied.objects;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false;native_evidence_path=$prefix+'.persisted.snapshot.json'}
   }elseif($request.operation -eq 'screen_add_bit_switches'){
    if($oldHeader){Fail 'Current-version native project required for bit_switch addition.'}
    $windowNumber=SelectedWindowNumber $a
    $items=@($a.objects);if($items.Count -lt 1 -or $items.Count -gt 8){Fail 'Bit-switch addition requires 1..8 objects.'}
    $taggedItems=@($items|Where-Object {$_.tag_name})
    Add-Type -AssemblyName Accessibility
    $bitTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','WindowRibbonControls.cs','NativeScreenScene.cs','ObjectRibbonControls.cs','NumericAddressTypeControls.cs','FunctionWindowTargetControls.cs','BitAddressTypeControls.cs','NumericTagSettingsControls.cs','WindowTreeControls.cs')
    if($taggedItems.Count){$bitTypes+=@('TagCsvCodec.cs','TagQtControls.cs','TagRibbonControls.cs')}
    Add-Type -Path @($bitTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1');. (Join-Path $PSScriptRoot 'BitSwitchAdditionOperation.ps1')
    . (Join-Path $PSScriptRoot 'ScreenWorkflow.ps1')
    if($taggedItems.Count){. (Join-Path $PSScriptRoot 'TagRibbonAction.ps1');. (Join-Path $PSScriptRoot 'TagOperation.ps1')}
    . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
    $prefix=Under (Join-Path $root ('.weinview-add-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Bit-switch addition clone hash mismatch.'}
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='open_owned_bit_switch_addition';$s=StartOwned $exe $output $true $false $nativeHostPort;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.identity.json')
    $stage='select_bit_switch_addition_screen';$selectedWindow=Select-WeinviewWindow $s $windowNumber
    if($selectedWindow.width -lt 1 -or $selectedWindow.height -lt 1 -or $selectedWindow.width -gt 65535 -or $selectedWindow.height -gt 65535){Fail 'Placement requires bounded actual native selected-window dimensions.'}
    $tagEvidence=$null
    if($taggedItems.Count){$stage='read_existing_bit_tags';$null=Open-WeinviewTagLibrary $s;$tagEvidence=Export-WeinviewTags $s ($prefix+'.bit-tags-before.csv');Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagEvidence;$null=Select-WeinviewWindow $s $windowNumber}
    $stage='apply_new_bit_switch_objects';$applied=Invoke-WeinviewBitSwitchAddition -Session $s -Mode Apply -Objects $items -SourceSha256 $before -BeforeSnapshot $null -BridgeRoot $PSScriptRoot
    if(!$applied.native_fields_verified -or @($applied.objects).Count -ne $items.Count){Fail 'Native bit_switch apply fields missing.'}
    $stage='save_bit_switch_addition';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_bit_switch_addition';CloseSession $s $output $saved $false
    $nativeHostPort=Get-WeinviewNativeHostPort
    $stage='reopen_bit_switch_addition';$s=StartOwned $exe $output $true $false $nativeHostPort;SetEditSession $s $output $exe
    Set-WeinviewScreenSession $s $output $exe ($prefix+'.reopen-identity.json')
    $stage='select_persisted_bit_switch_screen';$null=Select-WeinviewWindow $s $windowNumber
    $tagReopened=$null
    if($taggedItems.Count){$stage='read_persisted_bit_tags';$null=Open-WeinviewTagLibrary $s;$tagReopened=Export-WeinviewTags $s ($prefix+'.bit-tags-reopened.csv');[PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$tagEvidence.tags,[PLCCode.Weinview.TagRow[]]$tagReopened.tags);Close-WeinviewTagLibrary $s;$s.tag_evidence=$tagReopened;$null=Select-WeinviewWindow $s $windowNumber}
    $stage='persisted_bit_switch_addition_readback';$persisted=Read-WeinviewAdditionSnapshot $s $saved ($prefix+'.persisted') $PSScriptRoot ([string[]]@($applied.objects|ForEach-Object {$_.object_id}))
    Assert-WeinviewAdditionSnapshots $applied.before_snapshot $persisted $items.Count
    Assert-WeinviewAdditionSnapshots $applied.after_snapshot $persisted 0
     $appearanceColors=CompleteAdditionAppearanceColors $s $applied.appearance_color_evidence $saved ($prefix+'.persisted')
    foreach($created in @($applied.objects)){$matches=@($persisted.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1 -or $matches[0].object_sha256 -cne $created.object_sha256){Fail 'Persisted bit target native fields differ.'}}
    $addedObjects=@();foreach($created in @($applied.objects)){$matches=@($persisted.objects|Where-Object {$_.object_id -ceq $created.object_id});if($matches.Count -ne 1){Fail 'Persisted newly created object identity differs.'};$addedObjects+=$matches[0]}
    if($addedObjects.Count -ne $items.Count){Fail 'Persisted bit_switch native readback count differs.'}
    $stage='close_readonly_bit_switch_addition';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Bit-switch addition source/output invariant failed.'}
    $reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$applied.profile;screen=$windowNumber;canvas_width=[int]$s.window_width;canvas_height=[int]$s.window_height;window_activation_evidence=$s.window_activation_evidence;native_window_geometry=$s.window_geometry_evidence;objects_readback=$addedObjects;appearance_color_evidence=$appearanceColors;appearance_shape_evidence=@($applied.appearance_shape_evidence|Where-Object {$null -ne $_});objects_before=@($applied.before_snapshot.objects);objects_after=@($persisted.objects);before_object_count=@($applied.before_snapshot.objects).Count;after_object_count=@($persisted.objects).Count;directory_before=$applied.before_snapshot.directory;directory_after=$applied.after_snapshot.directory;directory_reopened=$persisted.directory;alarm_displays_before=@();alarm_displays_after=@();alarm_displays_reopened=@();tag_bindings=@($applied.tag_bindings);untouched_objects_verified=$false;untouched_objects_verification_scope=$applied.untouched_objects_verification_scope;full_properties_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;collision_verification_scope=$applied.collision_verification_scope;new_objects_created=$true;persisted_verified=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;creation_evidence=$applied.objects;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false;native_evidence_path=$prefix+'.persisted.snapshot.json'}
   }elseif($request.operation -eq 'macro_read'){
    $number=0;if(![int]::TryParse([string]$a.macro_id,[ref]$number) -or $number -lt 0 -or $number -gt 254){Fail 'macro_id must be 0..254.'}
    $nameProvided=$a.PSObject.Properties.Name -contains 'macro_name';$name=[string]$a.macro_name
    if($nameProvided -and (!$name -or $name.Length -gt 64 -or $name -match '[\x00-\x1f]')){Fail 'Provided macro_name must be 1..64 UTF16 characters without controls.'}
    Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $output) -ne $before){Fail 'Read-only macro clone hash mismatch.'}
    if($macroReadExecutionMetadata){
     $stage='open_owned_macro_read';$s=StartOwned $exe $output $false;$manager=Manager $s;$rows=ListRows $s $manager
     $matching=@($rows|Where-Object {$_.id -eq $number})
     if($matching.Count -ne 1 -or ($nameProvided -and $matching[0].name -cne $name)){Fail 'Requested macro ID/name missing or duplicated.'}
     $row=$matching[0];$name=[string]$row.name;if(!$name -or $name.Length -gt 64 -or $name -match '[\x00-\x1f]'){Fail 'Native macro row name is invalid.'}
     $stage='export_existing_macro_file'
     $prefix=Under (Join-Path $root ('.weinview-macro-read-'+[Guid]::NewGuid().ToString('N'))) $root
     $macroFile=Export-WeinviewMacroFile $s $manager $number $name ($prefix+'.export')
     $readName=[string]$macroFile.macro_name;$readSource=[string]$macroFile.source
     Button $s $manager 2 '离开';WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true}}|Out-Null
    }else{
     . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
     $macroHostPort=Get-WeinviewNativeHostPort
     $stage='open_owned_native_macro_read';$s=StartOwned $exe $output $false $false $macroHostPort
     $stage='read_native_macro_directory';$nativeList=Invoke-WeinviewNativeHostRead -Port $macroHostPort -Method getMacroList
     $rows=@($nativeList|ForEach-Object {$_})
     if($rows.Count -gt 255){Fail 'Native macro directory exceeds 255 entries.'}
     $seenIds=New-Object 'Collections.Generic.HashSet[int]'
     $seenNames=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
     foreach($row in $rows){
      $rowId=0;$rowName=[string]$row.name
      if(($row.id -isnot [int] -and $row.id -isnot [long]) -or ![int]::TryParse([string]$row.id,[ref]$rowId) -or $rowId -lt 0 -or $rowId -gt 254 -or !$rowName -or $rowName.Length -gt 64 -or $rowName -match '[\x00-\x1f]' -or !$seenIds.Add($rowId) -or !$seenNames.Add($rowName)){Fail 'Native macro directory has invalid or duplicate ID/name.'}
     }
     $matching=@($rows|Where-Object {$_.id -eq $number})
     if($matching.Count -ne 1 -or ($nameProvided -and $matching[0].name -cne $name)){Fail 'Requested macro ID/name missing or duplicated.'}
     $name=[string]$matching[0].name
     $stage='read_native_macro_source';$nativeMacro=Invoke-WeinviewNativeHostRead -Port $macroHostPort -Method getMacro -Arguments @([int]$number)
     if(($nativeMacro.id -isnot [int] -and $nativeMacro.id -isnot [long]) -or $nativeMacro.id -ne $number -or $nativeMacro.name -cne $name -or $nativeMacro.code_context -isnot [string]){Fail 'Native macro ID/name/source did not match the directory.'}
     $readName=$name;$readSource=[string]$nativeMacro.code_context
     if(!$readSource -or $readSource.Contains([string][char]0) -or [Text.Encoding]::UTF8.GetByteCount($readSource) -gt 65536){Fail 'Native macro source is empty, contains NUL, or exceeds 64 KiB.'}
    }
    $normalizedSource=[PLCCode.Weinview.NativeControls]::NormalizeLF($readSource)
    $sourceAlgorithm=[Security.Cryptography.SHA256]::Create()
    try{$readSourceSha256=[BitConverter]::ToString($sourceAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($normalizedSource))).Replace('-','')}finally{$sourceAlgorithm.Dispose()}
    $stage='close_readonly_macro_project';CloseSession $s $output $before $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Read-only macro source/clone byte invariant failed.'}
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;macro_id=$number;macro_name=$readName;source=$readSource;normalized_source=$normalizedSource;macro_source_sha256=$readSourceSha256;source_hash_encoding='UTF8-LF';macros=@($rows|ForEach-Object {@{macro_id=$_.id;macro_name=$_.name}});normal_main_exit_verified=$true;source_unchanged=$true;project_saved=$false;own_processes=$own;activation_evidence=$activationEvidence;source_route=if($macroReadExecutionMetadata){'native-ebm-export'}else{'native-host-api'};source_written_through_editor=$false;native_ebm_path=if($macroReadExecutionMetadata){$macroFile.native_ebm_path}else{$null};native_ebm_sha256=if($macroReadExecutionMetadata){Hash $macroFile.native_ebm_path}else{$null};execution_metadata=if($macroReadExecutionMetadata){$macroFile.metadata}else{$null};execution_metadata_read=$macroReadExecutionMetadata}
   }elseif($request.operation -in @('server_read','server_configure')){
    if($oldHeader -and $request.operation -eq 'server_configure'){Fail 'Server configuration currently requires a current-version native source; old-version backup prompts need explicit reconciliation.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeSemanticControls.cs'),(Join-Path $PSScriptRoot 'ServerDeviceDirectoryControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1');. (Join-Path $PSScriptRoot 'ServerConfigurationOperation.ps1')
    $prefix=Under (Join-Path $root ('.weinview-server-'+[Guid]::NewGuid().ToString('N'))) $root
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Server clone hash differs.'}
    $stage='open_owned_server_configuration';$s=StartOwned $exe $output $false;SetEditSession $s $output $exe
    $stage='native_server_configuration';$mode=if($request.operation -eq 'server_read'){'Read'}else{'Configure'};$serverPort=if(@($a.PSObject.Properties.Name) -ccontains 'port'){[Nullable[int]]$a.port}else{$null};$applied=Invoke-WeinviewServerConfiguration $s $mode ([string]$a.device_name) $prefix $serverPort
    if($request.operation -eq 'server_read'){
     $stage='close_readonly_server_configuration';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Server read source/copy changed.'}
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;server=$applied.server;device_directory=@($applied.device_directory);devices_before=@($applied.devices_before);preserved_existing_devices=$applied.preserved_existing_devices;preservation_scope=$applied.preservation_scope;port_before=$applied.port_before;port_after=$applied.port_after;hmi_parameters_before=$applied.hmi_parameters_before;hmi_parameters_after=$applied.hmi_parameters_after;hmi_parameters_preserved=$applied.hmi_parameters_preserved;project_saved=$false;source_unchanged=$true;normal_main_exit_verified=$true;runtime_values_verified=$false;protocol_access_verified=$false;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.server.json'}
    }else{
     $stage='save_native_server_configuration';$saved=SaveEditedProject $s $output $before 1500
     $stage='close_saved_server_configuration';CloseSession $s $output $saved $false
     $stage='reopen_server_configuration';$s=StartOwned $exe $output $false;SetEditSession $s $output $exe
     $stage='persisted_server_configuration_readback';$persisted=Invoke-WeinviewServerConfiguration $s 'Read' ([string]$a.device_name) ($prefix+'.reopened')
     foreach($key in @('device_name','driver','driver_id','driver_version','driver_file','location','interface','port','device_station','hmi_station','udp','gateway_enabled')){if($applied.server.$key -cne $persisted.server.$key){Fail 'Persisted finite server field differs.'}}
     if(@($applied.device_directory).Count -ne @($persisted.device_directory).Count){Fail 'Persisted device directory count differs.'};foreach($row in @($applied.device_directory)){$rows=@($persisted.device_directory|Where-Object name -CEQ $row.name);if($rows.Count -ne 1){Fail 'Persisted device identity absent/duplicated.'};foreach($key in @('category','name','location','device_type','interface','protocol','station')){if($rows[0].$key -cne $row.$key){Fail 'Persisted device directory field differs.'}}}
     foreach($parameter in @($applied.hmi_parameters_after)){$matches=@($persisted.hmi_parameters_after|Where-Object {$_.id -eq $parameter.id -and $_.class -ceq $parameter.class});if($matches.Count -ne 1 -or $matches[0].value -cne $parameter.value){Fail 'Persisted finite HMI parameters changed.'}};if(@($applied.hmi_parameters_after).Count -ne @($persisted.hmi_parameters_after).Count){Fail 'Persisted HMI parameter count changed.'}
     $stage='close_reopened_server_configuration';CloseSession $s $output $saved $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Server configure final source/output invariant failed.'};$reopenVerified=$true
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;server=$applied.server;server_reopened=$persisted.server;device_directory=@($persisted.device_directory);devices_before=@($applied.devices_before);devices_after=@($applied.device_directory);devices_reopened=@($persisted.device_directory);preserved_existing_devices=$applied.preserved_existing_devices;preservation_scope=$applied.preservation_scope;port_before=$applied.port_before;port_after=$applied.port_after;hmi_parameters_before=$applied.hmi_parameters_before;hmi_parameters_after=$applied.hmi_parameters_after;hmi_parameters_preserved=$applied.hmi_parameters_preserved;project_saved=$true;source_unchanged=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;runtime_values_verified=$false;protocol_access_verified=$false;own_processes=$own;activation_evidence=$activationEvidence;native_evidence_path=$prefix+'.reopened.server.json'}
    }
   }elseif($request.operation -eq 'compile_project'){
    Write-WeinviewProgress 'compile_project' '正在编译工程'
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'CompileLogCandidate.cs')) -ReferencedAssemblies Accessibility
    . (Join-Path $PSScriptRoot 'CompileProjectCandidate.ps1')
    $compileAction=if($a.action){[string]$a.action}else{'compile'}
    if($compileAction -cnotin @('compile','inspect')){Fail 'Compile action must be compile or inspect.'}
    $hasSelected=$a.PSObject.Properties.Name -ccontains 'selected_languages';$hasStartup=$a.PSObject.Properties.Name -ccontains 'startup_language'
    if($hasSelected -ne $hasStartup -or ($compileAction -ceq 'inspect' -and $hasSelected)){Fail 'Selected and startup languages must be provided together only for compile.'}
    $selectedSlots=$null;$startupSlot=$null
    if($hasSelected){$selectedSlots=[int[]]@($a.selected_languages);$startupSlot=[int]$a.startup_language}
    $artifact=Under ([IO.Path]::ChangeExtension($output,$artifactExtension)) $root
    $compileProvenance=Under ($artifact+'.plccode-compile.json') $root
    if(Test-Path -LiteralPath $compileProvenance){Fail 'Fresh adjacent compile provenance path required.'}
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false)
    if((Hash $output) -ne $before){Fail 'Compile clone hash differs from input.'}
    # Compile uses bound native commands and controls; it has no pixel/foreground step.
    $stage='open_owned_compile';$s=StartOwned $exe $output $false
    $stage='whole_project_compile';$build=Invoke-WeinviewWholeCompileCandidate -Session $s -ProjectPath $output -ExobPath $artifact -ExpectedProjectSha256 $before -Action $compileAction -SelectedLanguages $selectedSlots -StartupLanguage $startupSlot
    $compileMessages=@($build.compile_log -split "`n")
    $stage='close_compile_dialog';WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'}).Count){return $true}}|Out-Null
    $saved=Hash $output;$stage='close_compiled_source';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or $saved -ne $before -or (Hash $artifact) -ne $build.artifact_sha256){Fail 'Final whole-compile source/artifact invariant failed.'}
    WritePrivateJson $compileProvenance @{schema=1;kind='weinview-owned-whole-compile';project_path=$output;project_sha256=$saved;artifact_path=$artifact;artifact_sha256=$build.artifact_sha256;artifact_bytes=$build.artifact_bytes;compile_scope='whole_project';error_count=$build.error_count;warning_count=$build.warning_count;normal_main_exit_verified=$true;source_path=$projectInput;source_sha256=$before;created_utc=[DateTime]::UtcNow.ToString('o')}
    $data=@{output_path=$output;input_sha256=$before;output_sha256=$saved;compile_scope='whole_project';action=$compileAction;project_saved=$false;source_unchanged=$true;compile_verified=$build.compile_verified;inspect_auto_compiled=$build.inspect_auto_compiled;artifact_path=$artifact;artifact_sha256=$build.artifact_sha256;artifact_bytes=$build.artifact_bytes;error_count=$build.error_count;warning_count=$build.warning_count;compile_messages=$compileMessages;compile_sequence_observed=$build.compile_sequence_observed;compile_intent_evidence=$build.compile_intent_evidence;compile_path_evidence=$compilePathEvidence;normal_main_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;compile_provenance_path=$compileProvenance;compile_provenance_sha256=(Hash $compileProvenance);available_languages=$build.available_languages;selected_languages=$build.selected_languages;startup_language=$build.startup_language;startup_language_raw_index=$build.startup_language_raw_index;startup_language_raw_text=$build.startup_language_raw_text;startup_language_items=$build.startup_language_items;language_mode_map=$build.language_mode_map;all_language_controls=$build.all_language_controls;language_selection_verified=$build.language_selection_verified}
   }elseif($request.operation -eq 'plc_configure'){
    $driver=[string]$a.driver
    $interface=if($a.interface){[string]$a.interface}else{'ethernet'}
    if($interface -cnotin @('ethernet','rs232','rs485_2w','rs485_4w')){Fail 'PLC interface must be a supported exact transport.'}
    $isSerial=($interface -cne 'ethernet')
    if($isSerial -and $driver -ceq 'MODBUS TCP/IP'){Fail 'MODBUS TCP/IP driver requires Ethernet interface.'}
    $station=if($a.PSObject.Properties.Name -ccontains 'station') {[Nullable[int]][int]$a.station} elseif($driver -ceq 'MODBUS TCP/IP') {[Nullable[int]]1} else {[Nullable[int]]$null}
    if($oldHeader -or [string]::IsNullOrWhiteSpace($driver) -or $driver.Length -gt 128 -or $driver -match '[\x00-\x1f\x7f]' -or !$a.device_name -or $a.device_name.Length -gt 64 -or $a.device_name -match '[\x00-\x1f\x7f]' -or ($driver -ceq 'MODBUS TCP/IP' -and $station -ne 1) -or ($null -ne $station -and ($station -lt 0 -or $station -gt 255))){Fail 'Current-version exact driver, optional station and bounded unique name required.'}
    $change=if($a.change){[string]$a.change}else{'add'};if($change -cnotin @('inspect','add','update')){Fail 'PLC change must be inspect, add or update.'}
    $port=0;$ipv4=[string]$a.ipv4;$serialSettings=$a.serial
    if($isSerial){
     if($a.PSObject.Properties.Name -ccontains 'ipv4' -or $a.PSObject.Properties.Name -ccontains 'port' -or $a.PSObject.Properties.Name -ccontains 'expected_ipv4' -or $a.PSObject.Properties.Name -ccontains 'expected_port'){Fail 'Serial PLC request cannot include Ethernet endpoint.'}
     if($change -cne 'inspect' -and (!$serialSettings -or !@($serialSettings.PSObject.Properties.Name).Count)){Fail 'Serial PLC add/update requires at least one explicit COM setting.'}
    }elseif($serialSettings){Fail 'Ethernet PLC request cannot include serial settings.'}
    if($change -cne 'inspect' -and !$isSerial){
     if(![int]::TryParse([string]$a.port,[ref]$port) -or $port -lt 1 -or $port -gt 65535){Fail 'Integer port 1..65535 required.'}
     $octets=$ipv4.Split('.');if($octets.Count -ne 4){Fail 'Canonical IPv4 required.'};foreach($octet in $octets){$n=0;if($octet -notmatch '^(0|[1-9][0-9]{0,2})$' -or ![int]::TryParse($octet,[ref]$n) -or $n -gt 255){Fail 'Canonical IPv4 required.'}}
    }
    $previousPort=0;$previousIpv4=[string]$a.expected_ipv4
    if(!$isSerial -and $change -ceq 'update' -and ($a.expected_ipv4 -or $a.expected_port)){
     if(![int]::TryParse([string]$a.expected_port,[ref]$previousPort) -or $previousPort -lt 1 -or $previousPort -gt 65535){Fail 'Existing TCP port 1..65535 required.'}
     $previousOctets=$previousIpv4.Split('.');if($previousOctets.Count -ne 4){Fail 'Canonical existing IPv4 required.'};foreach($octet in $previousOctets){$n=0;if($octet -notmatch '^(0|[1-9][0-9]{0,2})$' -or ![int]::TryParse($octet,[ref]$n) -or $n -gt 255){Fail 'Canonical existing IPv4 required.'}}
    }
    Add-Type -AssemblyName Accessibility
    $plcTypes=@('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','QtModbusEndpointCandidate.cs')
    if($isSerial){$plcTypes+=@('QtSerialSettingsCandidate.cs')}
    Add-Type -Path @($plcTypes|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1');. (Join-Path $PSScriptRoot 'PlcOperation.ps1')
     if($editorSessionMode){
      if(!$editorSessionContext.reused -or $projectInput -ine $output){Fail 'Continuous PLC configuration requires the registered working project.'}
      $stage='bind_plc_editor';$editorOwnedSession=Connect-WeinviewEditorSession $editorSessionContext $output $exe
      $s=$editorOwnedSession;$script:pendingOwnedSession=$s
      $script:own+=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe}
      # Register/Complete update the owned session record even for Inspect;
      # project_saved and project_save_count separately report project writes.
      $mutation='possible'
      Register-WeinviewEditorSession $editorSessionContext $s $projectInput $output $exe $before $request.id
      $plcSaveCount=0;$applied=$null
      if($change -ceq 'inspect'){
       $stage='inspect_existing_plc_device';$actual=Invoke-WeinviewPlcConfiguration $s 'Inspect' $a.device_name '' 0 $station '' 0 $driver $interface $null
       $saved=$before
      }else{
       $mutation='possible';$stage='apply_offline_plc_configuration'
       $applied=Invoke-WeinviewPlcConfiguration $s $(if($change -ceq 'update'){'Update'}else{'Apply'}) $a.device_name $ipv4 $port $station $previousIpv4 $previousPort $driver $interface $serialSettings
       # An added device must produce saved bytes. Only an Update whose
       # actual before/after endpoint fields agree can accept an unchanged file.
       $plcUnchangedUpdate=$false
       if($change -ceq 'update'){
        if($isSerial){
         $plcUnchangedUpdate=($null -ne $applied.previous_serial -and $null -ne $applied.serial)
         foreach($field in @('com_port','baud_rate','data_bits','parity','stop_bits')){
          if($applied.previous_serial.PSObject.Properties.Name -cnotcontains $field -or $applied.serial.PSObject.Properties.Name -cnotcontains $field -or [string]$applied.previous_serial.$field -cne [string]$applied.serial.$field){$plcUnchangedUpdate=$false}
         }
        }else{$plcUnchangedUpdate=($applied.previous_ipv4 -and $applied.previous_ipv4 -ceq $applied.ipv4 -and $applied.previous_port -eq $applied.port)}
       }
       $stage='save_plc_output';$saved=SaveEditedProject $s $output $before 1500 -AllowUnchanged $plcUnchangedUpdate
       $plcSaveCount=1;Save-WeinviewEditorSessionState $editorSessionContext $saved
       $stage='read_saved_plc_configuration';$actual=Invoke-WeinviewPlcConfiguration $s 'Readback' $a.device_name $ipv4 $port $station '' 0 $driver $interface $null
       foreach($key in @('device_name','driver','driver_id','driver_version','driver_file','location','interface','station','ipv4','port','endpoint_display','udp','scope')){if([string]$actual.$key -cne [string]$applied.$key){Fail ('Same-session PLC field differs: '+$key)}}
       if($isSerial){foreach($key in @('com_port','baud_rate','data_bits','parity','stop_bits')){if([string]$actual.serial.$key -cne [string]$applied.serial.$key){Fail ('Same-session serial field differs: '+$key)}};$actual|Add-Member -NotePropertyName serial_before -NotePropertyValue $applied.previous_serial -Force}
      }
      if((Hash $output) -cne $saved -or $actual.native_fields_verified -ne $true -or $actual.persisted_verified -ne $false){Fail 'Continuous PLC native readback or saved project differs.'}
      if($s.process.HasExited){Fail 'weinview_editor_session_reconciliation_required: PLC editor exited after the operation; no automatic restart.'}
      if($change -ceq 'inspect' -and $editorSessionContext.readonly_reconciliation_sha256){$editorSessionContext.readonly_reconciliation_verified=$true}
      Complete-WeinviewEditorSession $editorSessionContext $saved $null $null $false
      $data=@{scope='editor_session_saved';target_readback_scope='editor_session_saved';input_sha256=$before;output_path=$output;output_sha256=$saved;change=$change;device_readback=$actual;previous_ipv4=if($change -ceq 'update'){$applied.previous_ipv4}else{$null};previous_port=if($change -ceq 'update'){$applied.previous_port}else{$null};device_identity_preserved=($change -ceq 'update' -and $applied.device_name -ceq $actual.device_name -and $applied.driver_id -eq $actual.driver_id);project_saved=($plcSaveCount -eq 1);source_unchanged=($saved -ceq $before);persisted_verified=$false;reopen_verified=$false;normal_main_exit_verified=$false;normal_reopen_exit_verified=$false;editor_session_id=$editorSessionContext.session_id;editor_session_active=$true;editor_session_reused=$true;editor_session_state='active';editor_session_record=$editorSessionContext.path;editor_process=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe;main_hwnd=[long]$s.main.Hwnd};project_save_count=$plcSaveCount;project_reopen_count=0;editor_source_writes=$plcSaveCount;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false}
      $data.editor_session_reconciled=[bool]$editorSessionContext.reconciled
     }elseif($change -ceq 'inspect'){
     $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'PLC inspection clone hash mismatch.'}
     $stage='open_owned_plc_inspection';$s=StartOwned $exe $output;SetEditSession $s $output $exe
     $stage='inspect_existing_plc_device';$actual=Invoke-WeinviewPlcConfiguration $s 'Inspect' $a.device_name '' 0 $station '' 0 $driver $interface $null
     $stage='close_readonly_plc_inspection';CloseSession $s $output $before $true
     if((Hash $projectInput) -ne $before -or (Hash $output) -ne $before){Fail 'Readonly PLC inspection changed project bytes.'}
     $actual.persisted_verified=$false
     $data=@{input_sha256=$before;output_path=$output;output_sha256=$before;change='inspect';device_readback=$actual;project_saved=$false;source_unchanged=$true;reopen_verified=$false;normal_main_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false}
    }else{
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'PLC clone hash mismatch.'}
    $stage='open_owned_plc_output';$s=StartOwned $exe $output;SetEditSession $s $output $exe
    $stage='apply_offline_plc_configuration';$applied=Invoke-WeinviewPlcConfiguration $s $(if($change -ceq 'update'){'Update'}else{'Apply'}) $a.device_name $ipv4 $port $station $previousIpv4 $previousPort $driver $interface $serialSettings
    $stage='save_plc_output';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_plc_output';CloseSession $s $output $saved $false
    # The PLC ribbon entry itself AppActivate-s the exact reopened PID and verifies
    # foreground immediately before capture. Avoid an earlier startup activation
    # that Windows may deny while the previous owned process is still retiring.
    $stage='reopen_plc_output';$s=StartOwned $exe $output $false;SetEditSession $s $output $exe
    $stage='persisted_plc_configuration_readback';$actual=Invoke-WeinviewPlcConfiguration $s 'Readback' $a.device_name $ipv4 $port $station '' 0 $driver $interface $null
    foreach($key in @('device_name','driver','driver_id','driver_version','driver_file','location','interface','station','ipv4','port','endpoint_display','udp','scope')){if([string]$actual.$key -cne [string]$applied.$key){Fail ('Persisted PLC field differs: '+$key)}}
    if($isSerial){foreach($key in @('com_port','baud_rate','data_bits','parity','stop_bits')){if([string]$actual.serial.$key -cne [string]$applied.serial.$key){Fail ('Persisted serial field differs: '+$key)}};$actual|Add-Member -NotePropertyName serial_before -NotePropertyValue $applied.previous_serial -Force}
    $stage='close_readonly_plc_output';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Final PLC source/output hash invariant failed.'}
    $actual.persisted_verified=$true;$reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;change=$change;device_readback=$actual;previous_ipv4=if($change -ceq 'update'){$applied.previous_ipv4}else{$null};previous_port=if($change -ceq 'update'){$applied.previous_port}else{$null};device_identity_preserved=($change -ceq 'update' -and $applied.device_name -ceq $actual.device_name -and $applied.driver_id -eq $actual.driver_id);reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;own_processes=$own;activation_evidence=$activationEvidence;online_connection_tested=$false}
    }
   }elseif($request.operation -eq 'screen_apply'){
    if($before -ne $interactiveTemplateHash -or $a.profile -cne 'weinview-cn421-tk800x480' -or [string]$a.screen -cne '10'){Fail 'Only the hash-pinned interactive TK800x480 template / window 10 is supported.'}
    $items=@($a.objects);if($items.Count -ne 2 -or $items[0].kind -cne 'numeric_display' -or $items[1].kind -cne 'macro_button'){Fail 'Exactly ordered existing numeric display and macro button required.'}
    $planObjects=@();foreach($item in $items){
     if($item.kind -ceq 'numeric_display'){$planObjects+=@{kind=$item.kind;description=$item.description;rect=$item.rect;device=$item.device;addressType=$item.address_type;address=$item.address;dataType=$item.data_type}}
     else{$planObjects+=@{kind=$item.kind;description=$item.description;rect=$item.rect;macroId=$item.macro_id;macroName=$item.macro_name;labels=@(@{state='0';font='Microsoft YaHei';size='24';text=$item.label},@{state='1';font='Microsoft YaHei';size='24';text=$item.label})}}
    }
    $prefix=Under (Join-Path $root ('.weinview-screen-'+[Guid]::NewGuid().ToString('N'))) $root
    $planPath=$prefix+'.plan.json';$trustPath=$prefix+'.source-scene.json';$identityPath=$prefix+'.identity.json'
    WritePrivateJson $planPath @{profile=$a.profile;screen=10;objects=$planObjects}
    $validation=& (Join-Path $PSScriptRoot 'ScreenBatchCandidate.ps1') -Mode ValidatePlan -PlanPath $planPath | ConvertFrom-Json
    if(!$validation.Valid){Fail 'Screen plan validation failed before copy.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'NativeScreenScene.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    $trust=@{Profile='weinview-cn421-tk800x480';Screen=10;ProjectSha256=$before;Objects=@(@{Kind='numeric_display';Description='PLCCode_LW100_反馈';Rectangle=@(80,80,180,60)},@{Kind='macro_button';Description='PLCCode_RunMacro_0';Rectangle=@(80,170,180,60)})}
    WritePrivateJson $trustPath $trust
    $mutation='possible';[IO.File]::Copy($projectInput,$output,$false);if((Hash $output) -ne $before){Fail 'Screen clone hash mismatch.'}
    $stage='open_owned_screen_output';$s=StartOwned $exe $output
    WritePrivateJson $identityPath @{Pid=$s.process.Id;CreationTicks=$s.process.StartTime.ToUniversalTime().Ticks;Exe=$exe;Project=$output}
    $stage='apply_trusted_existing_screen';$applyPath=$prefix+'.apply.json'
    $null=& (Join-Path $PSScriptRoot 'ScreenOperation.ps1') -Action Apply -IdentityPath $identityPath -ProjectPath $output -ExpectedProjectSha256 $before -PlanPath $planPath -OutputPath $applyPath -WholeScene -MainHwnd $s.main.Hwnd -TrustedScenePath $trustPath
    $applied=Get-Content -LiteralPath $applyPath -Raw|ConvertFrom-Json;if($applied.Status -cne 'success' -or !$applied.Confirmed){Fail 'Complete two-object screen apply not confirmed.'}
    $stage='save_screen_output';$saved=SaveEditedProject $s $output $before
    $stage='close_saved_screen_output';CloseSession $s $output $saved $false
    $stage='reopen_screen_output';$s=StartOwned $exe $output
    $readIdentity=$prefix+'.reopen-identity.json';WritePrivateJson $readIdentity @{Pid=$s.process.Id;CreationTicks=$s.process.StartTime.ToUniversalTime().Ticks;Exe=$exe;Project=$output}
    $trust.ProjectSha256=$saved;$trust.Objects=@();foreach($item in $items){$trust.Objects+=@{Kind=$item.kind;Description=$item.description;Rectangle=$item.rect}}
    $readTrust=$prefix+'.reopen-scene.json';WritePrivateJson $readTrust $trust;$readPath=$prefix+'.readback.json'
    $stage='persisted_screen_objects_readback'
    $null=& (Join-Path $PSScriptRoot 'ScreenOperation.ps1') -Action Read -IdentityPath $readIdentity -ProjectPath $output -ExpectedProjectSha256 $saved -PlanPath $planPath -OutputPath $readPath -WholeScene -MainHwnd $s.main.Hwnd -TrustedScenePath $readTrust
    $readback=Get-Content -LiteralPath $readPath -Raw|ConvertFrom-Json;if($readback.Status -cne 'success' -or @($readback.Objects).Count -ne 2){Fail 'Complete persisted screen readback missing.'}
    $actualItems=@();foreach($entry in $readback.ObjectEvidence){$value=$entry.Actual
     if($value.Kind -ceq 'numeric_display'){$actualItems+=@{kind=$value.Kind;description=$value.Description;rect=$value.Rectangle;device=$value.Data.Device;address_type=$value.Data.AddressType;address=[int]$value.Data.Address;data_type=$value.Style.Type}}
     else{$actualItems+=@{kind=$value.Kind;description=$value.Description;rect=$value.Rectangle;macro_id=$value.Macro.Id;macro_name=$value.Macro.Name;label=$value.Labels[0].Text}}
    }
    $stage='close_readonly_screen_output';CloseSession $s $output $saved $true
    if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Final screen source/output hash invariant failed.'}
    $reopenVerified=$true
    $data=@{input_sha256=$before;output_path=$output;output_sha256=$saved;profile=$a.profile;screen=10;objects_readback=$actualItems;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true;new_objects_created=$false;native_evidence_path=$readPath;own_processes=$own;activation_evidence=$activationEvidence}
   }else{
   $number=0; if(![int]::TryParse([string]$a.macro_id,[ref]$number) -or $number -lt 0 -or $number -gt 254){Fail 'macro_id must be 0..254.'}
    $name=[string]$a.macro_name; $source=[string]$a.source
    if(!$name -or $name.Length -gt 64 -or $name -match '[\x00-\x1f]' -or !$source -or [Text.Encoding]::UTF8.GetByteCount($source) -gt 65536 -or $source.Contains([string][char]0)){Fail 'Invalid macro_name/source size or control character.'}
    if($request.operation -eq 'macro_update' -and ([string]$a.expected_macro_source_sha256 -notmatch '^[0-9a-fA-F]{64}$')){Fail 'expected_macro_source_sha256 must be a SHA256 of UTF8 LF-normalized existing source.'}
    Add-Type -AssemblyName Accessibility
    Add-Type -Path @((Join-Path $PSScriptRoot 'NativeControls.cs'),(Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'CompileLogCandidate.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
    . (Join-Path $PSScriptRoot 'CompileProjectCandidate.ps1')
    $artifact=Under ([IO.Path]::ChangeExtension($output,$artifactExtension)) $root;$compileProvenance=Under ($artifact+'.plccode-compile.json') $root
    if(Test-Path -LiteralPath $compileProvenance){Fail 'Fresh adjacent macro compile provenance required.'}
    $mutation='possible'; [IO.File]::Copy($projectInput,$output,$false); $stage='open_owned_output'; $s=StartOwned $exe $output $false
    $stage='macro_manager'; $manager=Manager $s; $rows=ListRows $s $manager
    $matching=@($rows | Where-Object {$_.id -eq $number})
     $prefix=Under (Join-Path $root ('.weinview-macro-'+[Guid]::NewGuid().ToString('N'))) $root
    if($request.operation -eq 'macro_update'){
     if($matching.Count -ne 1 -or $matching[0].name -cne $name){Fail 'Existing macro ID/name mismatch; no file import performed.'}
     $stage='export_existing_macro_before_update'
     $macroBefore=Export-WeinviewMacroFile $s $manager $number $name ($prefix+'.before')
     $previousSourceSha256=$macroBefore.macro_source_sha256
     if($previousSourceSha256 -ine $a.expected_macro_source_sha256){Fail 'Existing macro source hash differs; no file import performed.'}
     $prepare=@{operation='ebm-prepare';output=$prefix+'.candidate.ebm';macro_id=$number;macro_name=$name;source=$source;base=$macroBefore.native_ebm_path;expected_sha256=$macroBefore.ebm_sha256;expected_source_sha256=$previousSourceSha256}
    }else{
     if($matching.Count){Fail 'macro_id already exists; overwrite is forbidden.'}
     if($rows.Count){$macroBefore=Export-WeinviewMacroFile $s $manager $rows[0].id $rows[0].name ($prefix+'.before')}else{$macroBefore=@{exported_macros=@()}}
     $prepare=@{operation='ebm-prepare';output=$prefix+'.candidate.ebm';macro_id=$number;macro_name=$name;source=$source}
    }
    if($a.PSObject.Properties.Name -ccontains 'execution'){$prepare.execution=$a.execution}
    $stage='prepare_macro_source_file';$preparedMacro=Invoke-WeinviewMacroCodec $prepare ($prefix+'.prepare')
    $stage='import_macro_source_file'
    if($request.operation -eq 'macro_update'){$macroImport=Import-WeinviewMacroFile $s $manager $prepare.output $number $name}else{$macroImport=Import-WeinviewMacroFile $s $manager $prepare.output}
     $rows=ListRows $s $manager;$matching=@($rows|Where-Object {$_.id -eq $number -and $_.name -ceq $name})
     if($matching.Count -ne 1){Fail 'Native imported macro ID/name differs.'};$row=$matching[0]
    Button $s $manager 2 '离开'; WaitFor { if(!@($s.native.EnumTopWindows() | Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true} } | Out-Null
    $stage='save_output';$migrationBackup=if($oldHeader){$backup}else{''}
    $saved=SaveEditedProject $s $output $before 0 $migrationBackup
    $stage='macro_whole_project_compile';$build=Invoke-WeinviewWholeCompileCandidate -Session $s -ProjectPath $output -ExobPath $artifact -ExpectedProjectSha256 $saved
    $results=@($build.compile_log -split "`n");$compileMessages=$results
    $stage='close_macro_compile_dialog';$null=WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}}
    if((Hash $output) -cne $saved){Fail 'Whole compiler changed saved macro project.'}
    $stage='close_saved_output'; CloseSession $s $output $saved $false; $stage='reopen_verify'; $s=StartOwned $exe $output $false; $manager=Manager $s; $rows=ListRows $s $manager
   $matching=@($rows|Where-Object {$_.id -eq $number})
   if($matching.Count -ne 1 -or $matching[0].name -cne $name){Fail 'Saved macro ID/name missing or duplicated.'}
   $row=$matching[0]
     $macroAfter=Export-WeinviewMacroFile $s $manager $number $name ($prefix+'.persisted')
     $readName=[string]$macroAfter.macro_name;$readId=[string]$macroAfter.macro_id;$readSource=[string]$macroAfter.source
     if($macroAfter.metadata_lines_sha256 -cne $preparedMacro.metadata_lines_sha256){Fail 'Native macro execution metadata differs after file import.'}
     Assert-WeinviewMacroFilesPreserved $macroBefore $macroAfter $number ($request.operation -ne 'macro_update')
   if($readName -cne $name -or $readId.Trim() -ne [string]$number -or [PLCCode.Weinview.NativeControls]::NormalizeLF($readSource) -cne [PLCCode.Weinview.NativeControls]::NormalizeLF($source)){Fail 'Saved macro readback differs.'}
   $reopenVerified=$true
   $sourceAlgorithm=[Security.Cryptography.SHA256]::Create()
   try{$verifiedSourceSha256=[BitConverter]::ToString($sourceAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes([PLCCode.Weinview.NativeControls]::NormalizeLF($readSource)))).Replace('-','')}finally{$sourceAlgorithm.Dispose()}
   Button $s $manager 2 '离开'; WaitFor { if(!@($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true} } | Out-Null
   $stage='close_readonly_reopen'; $reopenCloseStatus=CloseSession $s $output $saved $true $true; if((Hash $projectInput) -ne $before -or (Hash $output) -ne $saved){Fail 'Final project hash invariant failed.'}
   $reopenCloseWarning=if($reopenCloseStatus.normal_exit_verified){$null}else{'Verified read-only macro reopen exited with code '+$reopenCloseStatus.process_exit_code+'.'}
    WritePrivateJson $compileProvenance @{schema=1;kind='weinview-owned-whole-compile';project_path=$output;project_sha256=$saved;artifact_path=$artifact;artifact_sha256=$build.artifact_sha256;artifact_bytes=$build.artifact_bytes;compile_scope='whole_project';error_count=$build.error_count;warning_count=$build.warning_count;normal_main_exit_verified=$true;source_path=$projectInput;source_sha256=$before;created_utc=[DateTime]::UtcNow.ToString('o')}
    $data=@{output_path=$output;input_sha256=$before;output_sha256=$saved;macro_id=$number;macro_name=$name;compile_messages=$results;reopen_verified=$true;verified_source_sha256=$verifiedSourceSha256;own_processes=$own;activation_evidence=$activationEvidence;source_route='native-ebm-file-exchange';source_written_through_editor=$false;normal_main_exit_verified=$true;normal_reopen_exit_verified=[bool]$reopenCloseStatus.normal_exit_verified;reopen_close_status=$reopenCloseStatus;reopen_close_warning=$reopenCloseWarning;native_import_verified=$macroImport.native_import_verified;execution_metadata_preserved=$true;untouched_macros_verified=$true;native_ebm_path=$macroAfter.native_ebm_path;native_ebm_sha256=(Hash $macroAfter.native_ebm_path);compile_scope='whole_project';artifact_path=$artifact;artifact_sha256=$build.artifact_sha256;artifact_bytes=$build.artifact_bytes;error_count=$build.error_count;warning_count=$build.warning_count;compile_sequence_observed=$build.compile_sequence_observed;compile_provenance_path=$compileProvenance;compile_provenance_sha256=(Hash $compileProvenance)}
   $data.execution_metadata_before=$preparedMacro.original_metadata
   $data.execution_metadata=$macroAfter.metadata
   $data.execution_metadata_preserved=[bool]$preparedMacro.execution_metadata_preserved
   $data.unrequested_execution_metadata_preserved=[bool]$preparedMacro.unrequested_execution_metadata_preserved
   $data.execution_update_verified=$true
   $data.normal_main_exit_verified=$true
   if($request.operation -ceq 'macro_update'){$data.native_ebm_before_path=$macroBefore.native_ebm_path;$data.native_ebm_before_sha256=$macroBefore.ebm_sha256}
   if($request.operation -eq 'macro_update'){$data.previous_macro_source_sha256=$previousSourceSha256;$data.normal_main_exit_verified=$true;$data.macro_identity_preserved=$true}
   }
  }
 }
 if($editorSessionMode -and $request.operation -cin @('window_read','project_context_read','screen_read')){
  $continuousReadRouteValid=($data.read_route -ceq 'native_host' -or ($request.operation -ceq 'window_read' -and $data.read_route -ceq 'native_window_list'))
  if($s.process.HasExited -or (Hash $output) -cne $before -or !$continuousReadRouteValid){Fail 'Continuous inspection requires the unchanged working project and its observed native read route.'}
  Complete-WeinviewEditorSession $editorSessionContext $before $null $null $false
  $data.scope='editor_session_saved';$data.editor_session_id=$editorSessionContext.session_id;$data.editor_session_active=$true;$data.editor_session_reused=$true;$data.editor_session_state='active';$data.editor_session_record=$editorSessionContext.path;$data.editor_session_reconciled=[bool]$editorSessionContext.reconciled
  $data.editor_process=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe;main_hwnd=[long]$s.main.Hwnd}
  $data.project_save_count=0;$data.project_reopen_count=0;$data.editor_source_writes=0;$data.reopen_verified=$false;$data.normal_main_exit_verified=$false;$data.normal_reopen_exit_verified=$false
 }
 if($request.operation -cin @('screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons')){
  $alarmProtection=@();if($null -ne $data.alarm_displays_before){$alarmProtection=@($data.alarm_displays_before)};$protection=Get-WeinviewAdditionProtection @($data.objects_before) ([int]$data.canvas_width) ([int]$data.canvas_height) $alarmProtection
  $data.bounding_boxes_verified=$protection.bounding_boxes_verified
  $data.collision_verified=$protection.collision_verified
  $data.collision_verification_scope=$protection.collision_verification_scope
 }
 if($mutation -eq 'possible'){$mutation='completed'}
 if($request.operation -cin @('create_project','plc_configure','project_apply') -and $data -and [IO.Path]::GetExtension([string]$data.output_path) -iin @('.cmtp','.emtp')){
  $data.authoring_hints=@{
   editor_lifecycle='Reuse editor_session_id and the same working file through authoring, compile and simulation. compile=true does not require close_editor=true. Ending offline simulation is separate from closing EasyBuilder Pro; keep the editable project open unless the user asks to close the editor.'
   efficient_artwork='For a polished multi-page design, use one composite SVG per page for the complete fixed layout: page title, navigation backgrounds, cards, fixed captions, units, borders and process illustration. A diagram alone leaves dozens of unnecessary native drawing dialogs. weinview_picture_library_create renders all page SVGs into one FLBX without opening the editor; place each background first with kind=picture, then native changing values, inputs, state labels, action/navigation buttons, alarms and trends. Keep the source SVG editable. SVG font sizes are pixels; native font sizes are points.'
   screen_add_common_objects='Native rectangles require BOTH width and height >=3 px, including separator lines. Text position is the actual top-left point even when alignment is centered. Text does not automatically wrap or fit its surrounding card.'
   typography='Font sizes are native points, not canvas pixels: rendered glyphs are approximately size*4/3 pixels. Allow that width per Chinese character plus padding. Four Chinese characters at 20 points need about 140 px including padding; do not put them into 110 px tabs. Keep body text compact, split long lines, and keep every line inside its card and the canvas. Reserve ceil(size*4/3) pixels for each line plus at least 8 pixels before the next chart, table or control border.'
   control_backgrounds='Omitted use_shape/use_picture preserve native defaults, which can be OFF; setting label color does not create a button background. Enabling a resource switch does not select a resource. For reliable visible custom controls, create filled Rectangle or SVG backgrounds before the interactive controls, then explicitly disable their inherited shape/picture. Use contrasting text. Numeric input_enabled also does not add a field border: give editable fields an explicit background/border.'
   operator_content='Keep operator pages focused on status, values and actions. Captions must describe the configured behavior: set ON/set OFF commands are maintained states, not pulses; do not invent pulse, acknowledgement or interlock behavior. Do not put explanations of your layout, tool choices, data types or generated borders on the operator screen. PLC addresses and connection parameters belong in configuration, unless the user requests them on screen. Avoid duplicate controls and repeated status/value panels.'
   screen_add_window_buttons='Do not target the containing window_number: native basic-window selectors exclude the current page on both MT and cMT. Use the background/static text for its active tab; navigation buttons target only the other existing pages.'
   modbus_address='Native Modbus address_type and address are separate fields. For coil 0x1 use address_type=0x and address=1 (string 1 for native_csv); for register 4x1 use address_type=4x and address=1. Do not include the area prefix in the native address field.'
  }
  if([IO.Path]::GetExtension([string]$data.output_path) -ieq '.cmtp'){
   $data.authoring_hints.screen_add_trends='Trend properties, including description and channel_y_axes, belong inside each objects[] item. For this cMT creation dialog, omit y_axis_options: alignment/hide controls are absent. channel_y_axes may specify the complete real sampling-channel list with axis and range.'

   $data.authoring_hints.sampling_append='cMT uses native Sampling CSV Version 4. Omit maximum_records: this format has no record-limit field. With tag_name, use channel_description for the single channel label; its data type comes from the tag. Do NOT pass channels with tag_name. channels is only for the raw Local HMI address form, and cannot be combined with channel_description. Set period_ms as needed.'
  }
 }
 $receipt=@{id=$request.id;schema=1;operation=$request.operation;ok=$true;code='ok';stage='complete';mutationState=$mutation;data=$data}
} catch {
 $workerError=$_
 $failureDetail=@{invocation_position=$_.InvocationInfo.PositionMessage;script_stack_trace=$_.ScriptStackTrace;exception_type=$_.Exception.GetType().FullName;inner_exception=if($_.Exception.InnerException){$_.Exception.InnerException.ToString()}else{$null};last_control_id=$lastControlId;last_control_parent=$lastControlParent;last_control_action=$lastControlAction;migration_acknowledged=[bool]$script:migrationAcknowledged;migration_dialog_hwnd=$script:migrationDialogHwnd;close_acknowledged=$closeAcknowledged;close_dialog_hwnd=$closeAcknowledgedHwnd}
 $cleanup=@{attempted=$false;normal_exit_verified=$false;source_unchanged=$false;copy_unchanged=$false}
 if($request -and $request.operation -ceq 'project_recover' -and !$s -and $script:pendingOwnedSession){$s=$script:pendingOwnedSession}
 if($request -and $request.operation -ceq 'project_recover' -and $s -and $s.process -and !$s.process.HasExited){
  try{
   $recoveryModals=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if(!$recoveryModals.Count){
    $anchor=if($s.project_path -and (Test-Path -LiteralPath $s.project_path -PathType Leaf)){$s.project_path}else{$template}
    $anchorHash=Hash $anchor;$cleanup.attempted=$true
    CloseSession $s $anchor $anchorHash $true
    $cleanup.normal_exit_verified=$true;$cleanup.copy_unchanged=((Hash $anchor) -ceq $anchorHash)
    if($runtime -and (Test-Path -LiteralPath $runtime -PathType Leaf)){$cleanup.source_unchanged=((Hash $runtime) -ceq $inputRecord.runtime_sha256)}
   }else{$cleanup.reason='Original-vendor recovery modal requires reconciliation'}
  }catch{$cleanup.error=$_.Exception.Message}
 }
 if(!$editorSessionMode -and $request.operation -ceq 'project_apply' -and $script:pendingOwnedSession -and !$script:pendingOwnedSession.main -and !$script:pendingOwnedSession.process.HasExited -and $script:pendingOwnedSession.project_path -ieq $output -and $saved -match '^[0-9A-Fa-f]{64}$' -and (Hash $output) -ceq $saved){
  try{
   $pendingWindows=@($script:pendingOwnedSession.native.EnumTopWindows())
   $pendingModals=@($pendingWindows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   $pendingStem=[IO.Path]::GetFileNameWithoutExtension($output)
   $pendingMains=@($pendingWindows|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title.Contains($pendingStem)})
   if(!$pendingModals.Count -and $pendingMains.Count -eq 1){$script:pendingOwnedSession.main=$pendingMains[0];$cleanup.startup_main_recovered_for_normal_close=$true}
   else{$cleanup.pending_startup_window_state=@{main_count=$pendingMains.Count;modal_count=$pendingModals.Count}}
  }catch{$cleanup.pending_startup_window_error=$_.Exception.Message}
 }
 if($script:pendingOwnedSession -and $script:pendingOwnedSession.main -and ($script:pendingOwnedSession.project_path -ieq $output -or ($request.operation -ceq 'screen_copy_objects' -and $externalDonor -and $donorOpenPath -and $script:pendingOwnedSession.project_path -ieq $donorOpenPath) -or ($request.operation -ceq 'project_apply' -and $batchDonorOpenPath -and $script:pendingOwnedSession.project_path -ieq $batchDonorOpenPath))){$s=$script:pendingOwnedSession}
 if(!$editorSessionMode -and $request.operation -in @('compile_project','project_adopt','project_context_read','project_apply','project_replace_address','plc_configure','macro_read','macro_apply','macro_update','screen_read','screen_update','screen_duplicate','screen_copy_objects','screen_move_objects','picture_apply','label_apply','recipe_database','recipe_view_add','project_accounts','screen_add_numeric','screen_add_window_buttons','screen_add_bit_switches','screen_add_common_objects','screen_add_trends','tag_read','tag_upsert','window_read','window_create','window_copy','server_read','server_configure','event_read','event_append','event_history_settings','sampling_read','sampling_append','alarm_display_read','alarm_display_add','alarm_display_configure') -and $s -and $s.process){
  try{
   $cleanupPath=$output;$cleanupHash=$before
   if($request.operation -ceq 'screen_copy_objects' -and $externalDonor -and $donorOpenPath -and $s.project_path -ieq $donorOpenPath){$cleanupPath=$donorOpenPath;$cleanupHash=$donorHash}
   elseif($request.operation -ceq 'project_apply' -and $batchDonorOpenPath -and $s.project_path -ieq $batchDonorOpenPath){$cleanupPath=$batchDonorOpenPath;$cleanupHash=$batchDonorHash}
   elseif($request.operation -cin @('project_apply','project_replace_address','macro_apply','macro_update','picture_apply','label_apply','window_copy','screen_duplicate','screen_copy_objects','screen_move_objects','screen_add_common_objects','screen_add_trends','recipe_view_add','project_accounts','sampling_read','sampling_append','event_history_settings') -and $saved -match '^[0-9A-Fa-f]{64}$' -and (Hash $output) -ceq $saved){$cleanupHash=$saved}
   if(!$s.process.HasExited -and (Hash $projectInput) -eq $before -and (Hash $cleanupPath) -eq $cleanupHash){
    $modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible})
    if(($request.operation -ceq 'screen_copy_objects' -or ($request.operation -ceq 'project_apply' -and $batchDonorOpenPath -and $batchDonorClone -and $s.project_path -ieq $batchDonorOpenPath)) -and $modals.Count -eq 1 -and $modals[0].Pid -eq $s.process.Id -and $modals[0].Enabled -and $modals[0].Title -ceq '寻找/替换'){
     [PLCCode.Weinview.NativeAddressReplaceControls]::Close($s.native,[long]$modals[0].Hwnd,[int]$s.process.Id);$modals=@();$cleanup.address_find_closed=$true
    }
    if($request.operation -ceq 'project_replace_address' -and $modals.Count -eq 1 -and $addressDialog -and $modals[0].Hwnd -eq $addressDialog.Hwnd -and $modals[0].Enabled -and !$addressReplaceTriggered){
     [PLCCode.Weinview.NativeAddressReplaceControls]::Close($s.native,[long]$addressDialog.Hwnd,[int]$s.process.Id);$addressDialog=$null;$modals=@();$cleanup.address_find_closed=$true
    }
    if($request.operation -ceq 'project_adopt' -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -ceq '窗口列表'){
     Close-WeinviewWindowList $s $modals[0];$modals=@();$cleanup.window_list_closed=$true
    }
    if($request.operation -ceq 'screen_add_common_objects' -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -cin @('新增 文字/批注','新增 图片')){$s.native.ClickButton($modals[0].Hwnd,2,'取消');$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.property_cancelled=$true}
    if($request.operation -ceq 'recipe_view_add' -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -ceq '配方数据库' -and $context){Close-WeinviewRecipeDatabaseReadOnly $s $context;$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.recipe_manager_closed=$true}
    if($request.operation -ceq 'recipe_view_add' -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -match '配方检视'){Close-WeinviewScreenDialog $s $modals[0] $false;$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.property_cancelled=$true}
    if($request.operation -ceq 'project_accounts' -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -ceq '系统参数设置 '){$s.native.ClickButton($modals[0].Hwnd,2,'取消');$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.system_parameters_cancelled=$true}
    if($request.operation -cin @('project_apply','macro_read','macro_apply','macro_update') -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -ceq '宏指令'){
     Button $s $modals[0] 2 '离开';Wait-WeinviewMacroDialogClosed $s $modals[0].Hwnd
     $modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.macro_manager_closed=$true
    }
    if($request.operation -cin @('project_apply','tag_upsert') -and $stage -cin @('batch_import_tags_upsert','update_existing_native_tag') -and $s.tag_property_name){
     $properties=@($modals|Where-Object {$_.Enabled -and $_.Title -ceq '地址标签'})
     if($properties.Count -eq 1){$tagName=$s.native.FindUniqueControl($properties[0].Hwnd,1557,'Edit',$null);if($s.native.GetControlText($tagName.Hwnd,4096) -ceq $s.tag_property_name){$s.native.ClickButton($properties[0].Hwnd,2,'取消');$null=Get-WeinviewTagDialog $s '地址标签库';$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible});$cleanup.property_cancelled=$true}}
    }
    if($request.operation -in @('project_apply','event_read','event_append','event_history_settings') -and $modals.Count -eq 1 -and $modals[0].Title -ceq '事件登录'){Close-WeinviewEvents $s;$modals=@()}
    if($request.operation -cin @('project_apply','sampling_read','sampling_append','screen_add_trends') -and $modals.Count -eq 1 -and $modals[0].Enabled -and $modals[0].Title -ceq '资料取样'){Close-WeinviewSamplingManager $s $modals[0];$modals=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})}
    if($request.operation -in @('project_context_read','project_apply','tag_read','tag_upsert') -and $modals.Count -eq 1 -and $modals[0].Title -ceq '地址标签库' -and $null -ne $s.tag_original_user_mode){Close-WeinviewTagLibrary $s;$null=WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){return $true}} 5;$modals=@()}
    if(!$modals.Count){
     # A failed screen batch can still contain useful, editable work. Preserve
     # only the owned output copy; the error receipt continues to mark it incomplete.
     if($request.operation -ceq 'project_apply' -and $script:batchImportStarted -and $stage -like 'batch_import_screen_*' -and $cleanupPath -ieq $output -and $s.project_path -ieq $output -and $output -ine $projectInput){
      $cleanupHash=SaveEditedProject $s $cleanupPath $cleanupHash
      $cleanup.partial_output_saved=$true;$cleanup.partial_output_path=$cleanupPath;$cleanup.partial_output_sha256=$cleanupHash
      $cleanup.partial_output_complete=$false
     }
     $cleanup.attempted=$true;CloseSession $s $cleanupPath $cleanupHash $true
     $cleanup.normal_exit_verified=$true;$cleanup.source_unchanged=((Hash $projectInput) -eq $before);$cleanup.copy_unchanged=((Hash $output) -eq $before);if($request.operation -cin @('project_apply','screen_add_common_objects','screen_add_trends','recipe_view_add','project_accounts','sampling_read','sampling_append','event_history_settings')){$cleanup.output_hash_preserved=((Hash $output) -eq $cleanupHash);$cleanup.close_anchor_sha256=$cleanupHash}
    }else{$cleanup.reason='Owned modal requires reconciliation; no acknowledgement'}
   }else{$cleanup.reason='Already closed or output changed; no failure discard'}
  }catch{$cleanup.error=$_.Exception.Message}
 }
 if($editorSessionMode -and $editorSessionContext){
  try{
   $retained=if($editorOwnedSession){$editorOwnedSession}elseif($script:pendingOwnedSession -and $script:pendingOwnedSession.project_path -ieq $output){$script:pendingOwnedSession}else{$null}
   if($request.operation -ceq 'project_apply' -and !$saved -and $editorSessionContext.record -and @($plan|Where-Object {$_.completed_in_memory -eq $true}).Count -gt 0){$editorSessionContext.record.has_unsaved_batch_steps=$true;$editorSessionContext.record.project_saved=$false}
   $editorFailure=Set-WeinviewEditorSessionFailure $editorSessionContext $retained $projectInput $output $exe $before $request.id $workerError.Exception.Message
   $cleanup.reason='Continuous editor retained; no failure close, discard, or automatic replay.';$cleanup.editor_session=$editorFailure
  }catch{$cleanup.editor_registration_error=$_.Exception.Message}
 }
 $failureDetail.failure_cleanup=$cleanup
 if($request.operation -ceq 'plc_configure' -and $workerError.Exception.Data['plc_dialog_cleanup']){$failureDetail.plc_dialog_cleanup=$workerError.Exception.Data['plc_dialog_cleanup']}
 if($request.operation -ceq 'plc_configure' -and $workerError.Exception.Data['serial_qt_probe']){$failureDetail.serial_qt_probe=$workerError.Exception.Data['serial_qt_probe']}
 if($request.operation -ceq 'project_accounts' -and $request.arguments.action -ceq 'update' -and $edit -and $edit.system_parameters_confirmed -and $saved -match '^[0-9A-Fa-f]{64}$'){$failureDetail.account_applied=$true;$failureDetail.user_name_input_submitted=[bool]$edit.user_name_input_submitted;$failureDetail.user_name_readback_verified=$false;$failureDetail.saved_output_sha256=$saved}
 if($request.operation -ceq 'project_adopt' -and $workerError.Exception.Data['model_readback_dialog_cleanup']){$failureDetail.model_readback_dialog_cleanup=$workerError.Exception.Data['model_readback_dialog_cleanup']}
 if($request.operation -ceq 'create_project' -and $workerError.Exception.Data['model_creation_failure_cleanup']){
  $failureDetail.failure_cleanup=$workerError.Exception.Data['model_creation_failure_cleanup']
  $failureDetail.model_readback_dialog_cleanup=$workerError.Exception.Data['model_readback_dialog_cleanup']
 }
 if($request.operation -ceq 'project_apply'){
  $completed=@()
  foreach($batchState in @($plan|Where-Object {$_.completed_in_memory -eq $true})){
   $stepSummary=@{index=[int]$batchState.index;kind=[string]$batchState.kind}
   if($batchState.ContainsKey('window_number')){$stepSummary.window_number=[int]$batchState.window_number}
   $completed+=,$stepSummary
  }
  $failureDetail.batch_preflight_verified=[bool]$script:batchPreflightVerified
  $failureDetail.batch_import_started=[bool]$script:batchImportStarted
  $failureDetail.batch_imports_completed=[int]$script:batchImportsCompleted
  $failureDetail.batch_steps_completed_in_memory=$completed
  $failureDetail.batch_current_step_index=if($null -ne $script:batchCurrentStepIndex){[int]$script:batchCurrentStepIndex}else{$null}
  $failureDetail.batch_project_saved=[bool]$saved
 }
 if($editorSessionContext -and $editorSessionContext.record.has_unsaved_batch_steps -eq $true -and $editorFailure -and $editorFailure.editor_session_active -eq $true -and $editorFailure.project_saved -ne $true){
  $failureDetail.recovery_hint='已有步骤仅在当前编辑器内存完成、尚未保存。沿当前 editor_session_id 和同一 project_path/output_path 调用 weinview_project_apply（steps:[]、compile:true、close_editor:false）保存并编译已完成部分；成功后只继续未完成步骤，不重放整批、不重启编辑器。'
 }
 if($request.operation -in @('simulation_values_read','simulation_value_write') -and $script:weinviewValuesFailureCleanup){$failureDetail.failure_cleanup=$script:weinviewValuesFailureCleanup}
 if($request.operation -eq 'simulation_value_write' -and $script:weinviewValueWriteFailure){$failureDetail.native_write_failure=$script:weinviewValueWriteFailure}
 if($request.operation -ceq 'simulation_alarm_ack'){
  $failureDetail.simulation_alarm_failure=$workerError.Exception.Data['simulation_alarm_failure']
  $failureDetail.simulation_alarm_journal=$workerError.Exception.Data['simulation_alarm_journal']
  if($failureDetail.simulation_alarm_failure -and $failureDetail.simulation_alarm_failure.input_performed -is [bool] -and !$failureDetail.simulation_alarm_failure.input_performed){$mutation='none'}
 }
 if($request.operation -cin @('recipe_file_read','recipe_file_create')){
  $failureDetail.recipe_runtime_directory=$workerError.Exception.Data['recipe_runtime_directory']
  $failureDetail.recipe_native_process=$workerError.Exception.Data['recipe_native_process']
 }
 if($request.operation -cin @('history_file_read','event_history_file_read')){
  $failureDetail.history_runtime_directory=$workerError.Exception.Data['history_runtime_directory']
  $failureDetail.history_native_process=$workerError.Exception.Data['history_native_process']
  $failureDetail.history_process_journal=$workerError.Exception.Data['history_process_journal']
 }
 $failureCode='weinview_worker_failed'; if($workerError.Exception.Message.Contains('foreground_activation_denied')){$failureCode='foreground_activation_denied'}elseif($workerError.Exception.Message.Contains('weinview_value_expected_mismatch:')){$failureCode='weinview_value_expected_mismatch'}elseif($workerError.Exception.Message.StartsWith('native_label_bounds_changed:')){$failureCode='weinview_native_label_bounds_changed'}
 $receipt=@{id=if($request){$request.id}else{$null};schema=1;operation=if($request){$request.operation}else{$null};ok=$false;code=$failureCode;stage=$stage;mutationState=$mutation;data=@{message=$workerError.Exception.Message;failure_detail=$failureDetail;own_processes=$own;compile_messages=$compileMessages;activation_evidence=$activationEvidence;reopen_verified=$reopenVerified;verified_source_sha256=$verifiedSourceSha256;saved_output_sha256=$saved;compile_path_evidence=$compilePathEvidence;compile_intent_evidence=$compileIntentEvidence}}
 if($editorFailure){foreach($field in $editorFailure.Keys){$receipt.data[$field]=$editorFailure[$field]}}
} finally {
 if($editorSessionContext){Exit-WeinviewEditorSessionContext $editorSessionContext}
}
if($projectOpenNotices.Count){$receipt.data.project_open_notices=@($projectOpenNotices)}
Write-WeinviewProgress 'return_result' '正在整理操作结果'
$writer=New-Object IO.StreamWriter([Console]::OpenStandardOutput(),(New-Object Text.UTF8Encoding($false))); $writer.WriteLine(($receipt | ConvertTo-Json -Depth 12 -Compress)); $writer.Flush()
