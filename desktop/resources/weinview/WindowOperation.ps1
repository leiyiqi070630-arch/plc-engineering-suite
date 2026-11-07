# Definitions only. Caller owns launch, source hash, save, normal close/reopen.
# Requires the existing ReadyControls/WaitFor helpers and caller-supplied
# Open-WeinviewWindowList($Session), returning { dialog, entry }.
function Assert-WeinviewWindowName([string]$Name,[int]$Limit=64) {
 if([string]::IsNullOrWhiteSpace($Name) -or $Name.Length -gt $Limit){throw 'Nonempty native window name within UTF16 length bound required.'}
 foreach($character in $Name.ToCharArray()){if([char]::IsControl($character)){throw 'Control character in native window name.'}}
 # Reject invalid surrogate sequences instead of silently replacing UTF16 bytes.
 $null=(New-Object Text.UTF8Encoding($false,$true)).GetBytes($Name)
}
function Get-WeinviewWindowSetSha256([object[]]$Windows) {
 # Native window copying preserves custom names, so names may repeat. Window
 # numbers identify the rows and remain unique, matching the Rust verifier.
 $numbers=New-Object 'Collections.Generic.HashSet[int]'
 $json=New-Object Text.StringBuilder;[void]$json.Append('[');$first=$true
 foreach($window in @($Windows|Sort-Object {[int]$_.number})){
  $number=[int]$window.number;$width=[int]$window.width;$height=[int]$window.height;$name=[string]$window.name
  if($number -lt 0 -or $number -gt 65535 -or $width -lt 1 -or $width -gt 65535 -or $height -lt 1 -or $height -gt 65535 -or !$numbers.Add($number)){throw 'Invalid or duplicate native window set.'}
  Assert-WeinviewWindowName $name 1024
  # Canonical compact JSON matches serde_json::to_vec on four-element arrays.
  # ConvertTo-Json PS5 escapes <, >, &, apostrophe differently; do not use it.
  $escaped=$name.Replace('\','\\').Replace('"','\"')
  if(!$first){[void]$json.Append(',')};$first=$false
  [void]$json.Append('[');[void]$json.Append($number.ToString([Globalization.CultureInfo]::InvariantCulture));[void]$json.Append(',"');[void]$json.Append($escaped);[void]$json.Append('",');[void]$json.Append($width.ToString([Globalization.CultureInfo]::InvariantCulture));[void]$json.Append(',');[void]$json.Append($height.ToString([Globalization.CultureInfo]::InvariantCulture));[void]$json.Append(']')
 }
 [void]$json.Append(']');$bytes=(New-Object Text.UTF8Encoding($false,$true)).GetBytes($json.ToString());$algorithm=[Security.Cryptography.SHA256]::Create()
 try{return [BitConverter]::ToString($algorithm.ComputeHash($bytes)).Replace('-','')}finally{$algorithm.Dispose()}
}
function ConvertFrom-WeinviewWindowRows([string[]]$Rows) {
 if(!$Rows.Count -or $Rows.Count -gt 4096){throw 'Native window list count outside bounded profile.'}
 $windows=@(foreach($row in $Rows){
  $fields=$row.Split([char]9)
  if($fields.Count -ne 4 -or $fields[0].Length -gt 32 -or $fields[1] -notmatch '^[0-9]+$' -or $fields[2] -notmatch '^([0-9]+) x ([0-9]+)$'){throw 'Native four-column window list format differs.'}
  $width=[int]$Matches[1];$height=[int]$Matches[2]
  [pscustomobject][ordered]@{number=[int]$fields[1];name=$fields[3];width=$width;height=$height;raw_flags=$fields[0]}
 })
 $hash=Get-WeinviewWindowSetSha256 $windows
 return @{windows=$windows;window_set_sha256=$hash;rows=@($Rows)}
}
function Get-WeinviewWindowDialog($Session,[string]$Title,[int]$Seconds=8) {
 $specs=switch -Exact ($Title){
  '窗口列表' {@(@{id=1530;class='ListBox'},@{id=1328;class='Button';label='新增...'},@{id=2;class='Button';label='关闭'})}
  '选择窗口类型' {@(@{id=1331;class='Button';label='基本窗口'})}
  '窗口设置' {@(@{id=1329;class='Edit'},@{id=1330;class='Edit';allow_disabled=$true},@{id=1045;class='Edit'},@{id=1044;class='Edit'},@{id=1;class='Button';label='确定'},@{id=2;class='Button';label='取消'})}
  default {throw 'Unreviewed window dialog title.'}
 }
 WaitFor {
  $all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($all|Where-Object {$_.Title -cnotin @('窗口列表','选择窗口类型','窗口设置')}).Count){throw 'Unknown owned window modal; no acknowledgement.'}
  $found=@($all|Where-Object {$_.Title -ceq $Title})
  if($found.Count -gt 1){throw 'Ambiguous native window dialog.'}
  # Parent list/type can briefly become enabled during asynchronous transitions.
  # Readiness is based on the requested child's title, not parent enabled state.
  if($Title -ceq '窗口列表' -and @($all|Where-Object {$_.Title -cne '窗口列表'}).Count){return}
  if($found.Count -eq 1 -and $found[0].Enabled -and (ReadyControls $Session $found[0] $specs)){return $found[0]}
 } $Seconds
}
function Get-WeinviewWindowProjectPath($Session) {
 $path=if($Session.project_path){[string]$Session.project_path}else{[string]$Session.output_path}
 if(!$path -or !(Test-Path -LiteralPath $path -PathType Leaf)){throw 'Caller-bound native project path required.'}
 return $path
}
function Get-WeinviewNativeWindowSnapshot($Session,$Dialog) {
 $ready=Get-WeinviewWindowDialog $Session '窗口列表'
 if($ready.Hwnd -ne $Dialog.Hwnd){throw 'Native window list identity changed.'}
 $list=$Session.native.FindUniqueControlWithoutLabel($Dialog.Hwnd,1530,'ListBox')
 $before=ConvertFrom-WeinviewWindowRows @($Session.native.GetListBoxItems($list.Hwnd))
 $after=ConvertFrom-WeinviewWindowRows @($Session.native.GetListBoxItems($list.Hwnd))
 if($before.window_set_sha256 -cne $after.window_set_sha256){throw 'Native window set changed during reading; no retry mutation.'}
 $after.list_hwnd=$list.Hwnd
 return $after
}
function Close-WeinviewWindowList($Session,$Dialog) {
 $ready=Get-WeinviewWindowDialog $Session '窗口列表'
 if($ready.Hwnd -ne $Dialog.Hwnd){throw 'Window list changed before close.'}
 $Session.native.ClickButton($Dialog.Hwnd,2,'关闭')
 $null=WaitFor {
  $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($modals|Where-Object {$_.Title -cne '窗口列表' -or $_.Hwnd -ne $Dialog.Hwnd}).Count){throw 'Unknown window-list closing modal.'}
  $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Enabled -and $_.Class -ceq 'EasyBuilderPro'})
  if(!$modals.Count -and $main.Count -eq 1){return $true}
 } 8
}
function Get-WeinviewActiveWindowEvidence($Session,$Window,[bool]$RequireEnabled=$true) {
 $all=@($Session.native.EnumTopWindows());$main=@($all|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Class -ceq 'EasyBuilderPro'})
 if($main.Count -ne 1 -or ($RequireEnabled -and !$main[0].Enabled)){return $null}
 $views=@($Session.native.EnumChildControls($main[0].Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible -and (!$RequireEnabled -or $_.Enabled) -and $_.Title -and $main[0].Title.Contains($_.Title)})
 if($views.Count -gt 1){throw 'Active native document view is ambiguous.'};if($views.Count -ne 1){return $null}
 # Actual 421 main ends "[10 - WINDOW_010 ]"; its 59665 document title is
 # "10 - WINDOW_010" without brackets. Match both against the same native row.
 $label='\s*'+[regex]::Escape(([int]$Window.number).ToString())+'\s*-\s*'+[regex]::Escape([string]$Window.name)+'\s*'
 if($main[0].Title -notmatch ('\['+$label+'\]\s*$') -or $views[0].Title -notmatch ('^'+$label+'$')){return $null}
 return @{window_number=[int]$Window.number;window_name=[string]$Window.name;main_hwnd=$main[0].Hwnd;main_title=$main[0].Title;view_hwnd=$views[0].Hwnd;view_title=$views[0].Title}
}
function Set-WeinviewSelectedWindowSession($Session,$Window,$Snapshot,$Evidence,[string]$SelectionMethod,$Activation=$null) {
 $Evidence.selection_method=$SelectionMethod
 if($Activation){$Evidence.native_document_activation=$Activation}
 $fields=@{window_number=[int]$Window.number;window_name=[string]$Window.name;window_width=[int]$Window.width;window_height=[int]$Window.height;window_activation_evidence=$Evidence}
 foreach($field in $fields.Keys){if($Session -is [Collections.IDictionary]){$Session[$field]=$fields[$field]}else{Add-Member -InputObject $Session -MemberType NoteProperty -Name $field -Value $fields[$field] -Force}}
 $nativeHost=($Snapshot.read_route -ceq 'native_host' -or $Snapshot.geometry_source -ceq 'original_native_host_window_anchor')
 $geometry=[pscustomobject]@{geometry_source=if($nativeHost){'original_native_host_window_anchor'}else{'original_window_setting_table'};read_route=if($nativeHost){'native_host'}else{'native_window_list'};window_setting_table_read=(!$nativeHost);native_host_window_anchor_read=$nativeHost;window_number=[int]$Window.number;window_name=[string]$Window.name;width=[int]$Window.width;height=[int]$Window.height;windows=$Snapshot.windows;window_set_sha256=$Snapshot.window_set_sha256;active_document=$Evidence;global_input=$false;layout_reset=$false}
 $Session.window_geometry_evidence=$geometry
 return [pscustomobject]@{number=$Window.number;name=$Window.name;width=$Window.width;height=$Window.height;geometry_evidence=$geometry}
}
function Activate-WeinviewExistingDocument($Session,$Window,$View) {
 $title=([string]$Window.number)+' - '+[string]$Window.name
 $active=Get-WeinviewActiveWindowEvidence $Session $Window $true
 if($active -and $active.view_hwnd -eq $View.Hwnd){return @{method='already_active_owned_document';view_hwnd=$View.Hwnd;pointer_input=$false;coordinates=$false}}
 if([IO.Path]::GetExtension([string]$Session.project_path) -ine '.emtp'){
  return $Session.native.ActivateOwnedDocument([long]$Session.main.Hwnd,[long]$View.Hwnd,$title)
 }
 # Legacy MDI activation must go through the editor's tab action. Sending
 # WM_MDIACTIVATE directly bypasses its tab handling and can crash CN421.
 Initialize-WeinviewDirectoryTypes
 $tree=[PLCCode.Weinview.Research.WindowTreeControls]::new([int]$Session.process.Id,[long]$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path,[long]$Session.main.Hwnd,$false)
 $pattern='^\s*'+[regex]::Escape([string]$Window.number)+'\s*[-:]\s*'+[regex]::Escape([string]$Window.name)+'\s*\*?\s*$'
 $tabMatches=@();$observed=@()
 foreach($bar in @($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Class -like 'BCGPTabWnd:*' -and $_.Visible -and $_.Enabled})){
  foreach($tab in @($tree.FindRole($bar.Hwnd,37))){
   $observed+=([string]$tab.name+' ['+[string]$tab.action+']')
   if($tab.name -cmatch $pattern -and $tab.action -ceq 'Switch'){$tabMatches+=@{bar=$bar;tab=$tab}}
  }
 }
 if($tabMatches.Count -ne 1){throw ('Unique native document tab required; observed: '+($observed -join ' | '))}
 $target=$tabMatches[0];$tree.SwitchTab($target.bar.Hwnd,$target.tab.path,$target.tab.name)
 $active=WaitFor {Get-WeinviewActiveWindowEvidence $Session $Window $true} 8
 if($active.view_hwnd -ne $View.Hwnd){throw 'Native tab activated a different document.'}
 return @{method='owned_accessible_document_tab';tab_hwnd=$target.bar.Hwnd;tab_name=$target.tab.name;view_hwnd=$View.Hwnd;pointer_input=$false;coordinates=$false}
}
function Select-WeinviewWindowFromDirectory($Session,$Window,$Snapshot) {
 # The directory's double-click callback requires pointer button state, so
 # opening a closed page uses the original Window List's named Open action.
 $binding=Open-WeinviewWindowList $Session
 $actual=Get-WeinviewNativeWindowSnapshot $Session $binding.dialog
 $matching=@($actual.windows|Where-Object {$_.number -eq $Window.number})
 if($matching.Count -ne 1 -or $matching[0].name -cne $Window.name -or $matching[0].width -ne $Window.width -or $matching[0].height -ne $Window.height){throw 'Native Window List target differs from the native host directory.'}
 return Select-WeinviewWindowFromList $Session $binding $actual ([int]$Window.number)
}
function Select-WeinviewWindowFromList($Session,$Binding,$Snapshot,[int]$Number) {
 if($Number -lt 10 -or $Number -gt 1999){throw 'Only an existing ordinary native window 10..1999 can be selected.'}
 $matches=@($Snapshot.windows|Where-Object {$_.number -eq $Number});if($matches.Count -ne 1){throw 'Target native window not present or ambiguous.'}
 $window=$matches[0];$index=[Array]::IndexOf([object[]]$Snapshot.windows,[object]$window)
 if($index -lt 0 -or $index -ge $Snapshot.rows.Count){throw 'Native selection row identity unavailable.'}
 $Session.native.SelectListItem($Snapshot.list_hwnd,$index,[string]$Snapshot.rows[$index])
 $route=WaitFor {
  $buttons=@($Session.native.EnumChildControls($Binding.dialog.Hwnd)|Where-Object {$_.Id -eq 1})
  if($buttons.Count -gt 1 -or ($buttons.Count -eq 1 -and ($buttons[0].Class -cne 'Button' -or $buttons[0].Title -cne '打开'))){throw 'Native Open button identity changed.'}
  if($buttons.Count -eq 1 -and !$buttons[0].Visible){
   $title=([string]$Number)+' - '+[string]$window.name
   $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled})
   if($views.Count -ne 1){throw 'Hidden Open requires a unique actual already-open target document.'}
   return 'mdi'
  }
  if($buttons.Count -eq 1 -and $buttons[0].Visible -and $buttons[0].Enabled){return 'open'}
 } 5
 if($route -ceq 'open'){$Session.native.ClickButton($Binding.dialog.Hwnd,1,'打开')}
 # Open keeps the owned list modal and hides Open; close it before checking
 # the enabled main/document state. Multiple open MDI views are legitimate.
 $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if(@($modals|Where-Object {$_.Title -cne '窗口列表' -or $_.Hwnd -ne $Binding.dialog.Hwnd}).Count){throw 'Unknown modal while opening native window.'}
 $remaining=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($remaining.Count){Close-WeinviewWindowList $Session $Binding.dialog}
 $activation=$null
 if($route -ceq 'mdi'){
  $title=([string]$Number)+' - '+[string]$window.name
  # Refresh the exact view after closing our list; NativeControls verifies the
  # current ancestor chain and documented activation/get-active response.
  $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled})
  if($views.Count -ne 1){throw 'Already-open target document changed after closing window list.'}
  $activation=Activate-WeinviewExistingDocument $Session $window $views[0]
 }
 $evidence=WaitFor {Get-WeinviewActiveWindowEvidence $Session $window $true} 8
 $method=if($activation -is [Collections.IDictionary] -and $activation.method){$activation.method}elseif($route -ceq 'mdi'){'documented_WM_MDIACTIVATE_and_WM_MDIGETACTIVE'}else{'native_window_list_open'}
 return Set-WeinviewSelectedWindowSession $Session $window $Snapshot $evidence $method $activation
}
function Select-WeinviewWindow($Session,[int]$Number) {
 if($Number -lt 10 -or $Number -gt 1999){throw 'Ordinary native window range is 10..1999.'}
 $geometry=$Session.window_geometry_evidence
 $geometryReadProof=$geometry -and (($geometry.geometry_source -ceq 'original_window_setting_table' -and $geometry.window_setting_table_read -eq $true -and $geometry.native_host_window_anchor_read -ne $true) -or ($geometry.geometry_source -ceq 'original_native_host_window_anchor' -and $geometry.window_setting_table_read -eq $false -and $geometry.native_host_window_anchor_read -eq $true))
 if([int]$Session.window_number -eq $Number -and $geometryReadProof -and [int]$geometry.window_number -eq $Number -and [int]$geometry.width -eq [int]$Session.window_width -and [int]$geometry.height -eq [int]$Session.window_height){
  $active=Get-WeinviewActiveWindowEvidence $Session ([pscustomobject]@{number=$Number;name=[string]$Session.window_name}) $true
  if($active){return [pscustomobject]@{number=$Number;name=[string]$Session.window_name;width=[int]$Session.window_width;height=[int]$Session.window_height;geometry_evidence=$geometry;active_document=$active;selection_method='same_owned_session_verified_active_document'}}
 }
 $snapshot=$null
 if($geometryReadProof -and $geometry.active_document.main_hwnd -eq $Session.main.Hwnd -and $geometry.window_set_sha256 -and $geometry.windows){$snapshot=$geometry}
 elseif([int]$Session.native_host_port -gt 0){$snapshot=Read-WeinviewWindows $Session}
 if($snapshot -and [int]$Session.native_host_port -gt 0 -and @($snapshot.windows|Where-Object {$_.number -eq $Number}).Count -eq 0){$snapshot=Read-WeinviewWindows $Session}
 if($snapshot){
  $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Enabled -and $_.Pid -eq $Session.process.Id})
  if($main.Count -ne 1 -and $snapshot.read_route -ceq 'native_host'){throw 'Owned native main window unavailable for host directory selection.'}
  if($main.Count -eq 1){
   $targets=@($snapshot.windows|Where-Object {$_.number -eq $Number})
   if($targets.Count -gt 1){throw 'Cached native target window is ambiguous.'}
   if($targets.Count -eq 0 -and $snapshot.read_route -ceq 'native_host'){throw 'Target native window absent from actual native host directory.'}
   if($targets.Count -eq 1){
    $window=$targets[0]
    if([string]::IsNullOrWhiteSpace([string]$window.name) -or [int]$window.width -lt 1 -or [int]$window.height -lt 1){throw 'Cached native target window identity or dimensions unavailable.'}
    $title=([string]$Number)+' - '+[string]$window.name
    $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled -and $_.Pid -eq $Session.process.Id})
    if($views.Count -gt 1){throw 'Already-open target document is ambiguous.'}
    if($views.Count -eq 1){
     $activation=Activate-WeinviewExistingDocument $Session $window $views[0]
     $evidence=Get-WeinviewActiveWindowEvidence $Session $window $true
     if(!$evidence -or $evidence.view_hwnd -ne $views[0].Hwnd){throw 'Already-open target document did not become active.'}
     $method=if($activation -is [Collections.IDictionary] -and $activation.method){$activation.method}else{'documented_WM_MDIACTIVATE_and_WM_MDIGETACTIVE'}
     return Set-WeinviewSelectedWindowSession $Session $window $snapshot $evidence $method $activation
    }
    $directory=Select-WeinviewWindowFromDirectory $Session $window $snapshot
    if($directory){return $directory}
   }
  }
 }
 $path=Get-WeinviewWindowProjectPath $Session;$sha=(Get-FileHash -LiteralPath $path).Hash
 $binding=Open-WeinviewWindowList $Session;$snapshot=Get-WeinviewNativeWindowSnapshot $Session $binding.dialog
 $selected=Select-WeinviewWindowFromList $Session $binding $snapshot $Number
 if((Get-FileHash -LiteralPath $path).Hash -cne $sha){throw 'Native file changed during window selection.'}
 return $selected
}
function ConvertFrom-WeinviewNativeHostWindowDirectory([object[]]$WindowRows,[object[]]$ObjectRows) {
 if($WindowRows.Count -lt 1 -or $WindowRows.Count -gt 4096 -or $ObjectRows.Count -ne $WindowRows.Count){throw 'Native host window directory and object bundle counts differ.'}
 $seen=New-Object 'Collections.Generic.HashSet[int]';$windows=@()
 for($i=0;$i -lt $WindowRows.Count;$i++){
  $entry=$WindowRows[$i]
  if($entry.id -isnot [string] -or $entry.id -cnotmatch '^(0|[1-9][0-9]{0,4})$' -or $entry.name -isnot [string]){throw 'Native host window ID/name invalid.'}
  $number=[int]$entry.id
  if($number -gt 65535 -or !$seen.Add($number)){throw 'Native host window ID out of range or duplicated.'}
  Assert-WeinviewWindowName ([string]$entry.name) 1024
  $bundle=$ObjectRows[$i]
  if(($bundle.window_number -isnot [int] -and $bundle.window_number -isnot [long]) -or [int]$bundle.window_number -ne $number -or $bundle.PSObject.Properties.Name -cnotcontains 'objects'){throw 'Native host window-object bundle identity differs.'}
  $anchors=@()
  foreach($object in @($bundle.objects)){
   $property=$object.properties;$name=[string]$property.name
   if($name.StartsWith('WA_',[StringComparison]::Ordinal)){
    if($name -cnotmatch '^WA_[0-9]+$') {throw 'Native host window anchor identity invalid.'}
    $anchors+=,$property
   }
  }
  if($anchors.Count -ne 1){throw 'Native host window requires exactly one WA anchor.'}
  $bbox=@($anchors[0].bbox)
  if($bbox.Count -ne 4 -or @($bbox|Where-Object {$_ -isnot [string]}).Count -or $bbox[0] -cne '0' -or $bbox[1] -cne '0' -or $bbox[2] -cnotmatch '^(0|[1-9][0-9]*)$' -or $bbox[3] -cnotmatch '^(0|[1-9][0-9]*)$'){throw 'Native host WA anchor bbox invalid.'}
  $lastX=[int]0;$lastY=[int]0
  if(![int]::TryParse($bbox[2],[ref]$lastX) -or ![int]::TryParse($bbox[3],[ref]$lastY) -or $lastX -ge 65535 -or $lastY -ge 65535){throw 'Native host WA anchor dimensions out of range.'}
  $windows+=,[pscustomobject][ordered]@{number=$number;name=[string]$entry.name;width=($lastX+1);height=($lastY+1)}
 }
 return @{windows=$windows;window_set_sha256=(Get-WeinviewWindowSetSha256 $windows);window_list_entry=$null;project_saved=$false;source_unchanged=$true;profile='weinview-cn421-tk800x480-native-window-v1';read_route='native_host'}
}
function Read-WeinviewWindows($Session,[switch]$NativeList) {
 $path=Get-WeinviewWindowProjectPath $Session;$sha=(Get-FileHash -LiteralPath $path).Hash
 if(!$NativeList -and [int]$Session.native_host_port -gt 0){
  if(!(Get-Command Invoke-WeinviewNativeHostRead -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')}
  $rawWindows=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindows
  $windowRows=@($rawWindows)
  if($windowRows.Count -lt 1 -or $windowRows.Count -gt 4096){throw 'Native host window count outside bounded profile.'}
  $numbers=@(foreach($row in $windowRows){if($row.id -isnot [string] -or $row.id -cnotmatch '^(0|[1-9][0-9]{0,4})$'){throw 'Native host window ID invalid.'};[int]$row.id})
  $rawObjects=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindowObjects -BatchWindowNumbers $numbers
  $result=ConvertFrom-WeinviewNativeHostWindowDirectory $windowRows @($rawObjects)
  if((Get-FileHash -LiteralPath $path).Hash -cne $sha){throw 'Native file changed during native host window inspection.'}
  return $result
 }
 $binding=Open-WeinviewWindowList $Session;$snapshot=Get-WeinviewNativeWindowSnapshot $Session $binding.dialog
 Close-WeinviewWindowList $Session $binding.dialog
 if((Get-FileHash -LiteralPath $path).Hash -cne $sha){throw 'Native file changed during window inspection.'}
 return @{windows=$snapshot.windows;window_set_sha256=$snapshot.window_set_sha256;window_list_entry=$binding.entry;project_saved=$false;source_unchanged=$true;profile='weinview-cn421-tk800x480-native-window-v1';read_route='native_window_list'}
}
function New-WeinviewWindow($Session,$Arguments) {
 $name=[string]$Arguments.name;Assert-WeinviewWindowName $name
 $expected=[string]$Arguments.expected_window_set_sha256;if($expected -notmatch '^[A-Fa-f0-9]{64}$'){throw 'Exact native window set SHA256 required before creation.'}
 $path=Get-WeinviewWindowProjectPath $Session;$sha=(Get-FileHash -LiteralPath $path).Hash
 $binding=Open-WeinviewWindowList $Session
 try{
  $before=Get-WeinviewNativeWindowSnapshot $Session $binding.dialog
  if($before.window_set_sha256 -ine $expected){throw 'Native window set differs; no New click.'}
  if(@($before.windows|Where-Object {$_.name -ceq $name}).Count){throw 'Native window name already exists; no New click.'}
 }catch{
  $preflightFailure=$_
  try{Close-WeinviewWindowList $Session $binding.dialog}catch{$preflightFailure.Exception.Data['window_list_close_error']=$_.Exception.Message}
  throw $preflightFailure
 }
 $Session.native.ClickButton($binding.dialog.Hwnd,1328,'新增...')
 $type=Get-WeinviewWindowDialog $Session '选择窗口类型';$Session.native.ClickButton($type.Hwnd,1331,'基本窗口')
 $settings=Get-WeinviewWindowDialog $Session '窗口设置'
 $children=@($Session.native.EnumChildControls($settings.Hwnd));$numberControl=@($children|Where-Object {$_.Id -eq 1330 -and $_.Class -ceq 'Edit' -and $_.Visible})
 if($numberControl.Count -ne 1 -or $numberControl[0].Enabled){throw 'Unique actual read-only allocated window number required; no number write.'}
 $numberText=$Session.native.GetControlText($numberControl[0].Hwnd,32)
 $widthControl=$Session.native.FindUniqueControlWithoutLabel($settings.Hwnd,1045,'Edit');$heightControl=$Session.native.FindUniqueControlWithoutLabel($settings.Hwnd,1044,'Edit')
 $widthText=$Session.native.GetControlText($widthControl.Hwnd,32);$heightText=$Session.native.GetControlText($heightControl.Hwnd,32)
 if($numberText -notmatch '^[0-9]+$' -or $widthText -notmatch '^[0-9]+$' -or $heightText -notmatch '^[0-9]+$'){throw 'Allocated window number/default dimensions not numeric.'}
 $number=[int]$numberText;$width=[int]$widthText;$height=[int]$heightText
 if($number -lt 10 -or $number -gt 1999 -or $width -lt 1 -or $height -lt 1 -or @($before.windows|Where-Object {$_.number -eq $number}).Count){throw 'Allocated new window identity/dimensions invalid or already present.'}
 $nameControl=$Session.native.FindUniqueControlWithoutLabel($settings.Hwnd,1329,'Edit');$defaultName=$Session.native.GetControlText($nameControl.Hwnd,1024)
 $Session.native.SetControlText($nameControl.Hwnd,$name)
 if($Session.native.GetControlText($nameControl.Hwnd,1024) -cne $name -or $Session.native.GetControlText($numberControl[0].Hwnd,32) -cne $numberText -or $Session.native.GetControlText($widthControl.Hwnd,32) -cne $widthText -or $Session.native.GetControlText($heightControl.Hwnd,32) -cne $heightText){throw 'Native window name-only property readback differs.'}
 $Session.native.ClickButton($settings.Hwnd,1,'确定')
 $list=Get-WeinviewWindowDialog $Session '窗口列表';if($list.Hwnd -ne $binding.dialog.Hwnd){throw 'Parent native window list changed after creation.'}
 $after=Get-WeinviewNativeWindowSnapshot $Session $list
 if($after.windows.Count -ne $before.windows.Count+1){throw 'Native window creation changed unexpected count.'}
 foreach($old in $before.windows){$kept=@($after.windows|Where-Object {$_.number -eq $old.number});if($kept.Count -ne 1 -or $kept[0].name -cne $old.name -or $kept[0].width -ne $old.width -or $kept[0].height -ne $old.height){throw 'Existing native window changed; caller must discard unsaved candidate.'}}
 $created=@($after.windows|Where-Object {$_.number -eq $number});if($created.Count -ne 1 -or $created[0].name -cne $name -or $created[0].width -ne $width -or $created[0].height -ne $height){throw 'New native window full list readback differs.'}
 $selected=Select-WeinviewWindowFromList $Session $binding $after $number
 if((Get-FileHash -LiteralPath $path).Hash -cne $sha){throw 'Native file changed before caller-owned save.'}
 return @{windows_before=$before.windows;windows=$after.windows;window_set_sha256=$after.window_set_sha256;before_window_set_sha256=$before.window_set_sha256;created_window=$created[0];preserved_existing_windows=$true;allocated_default_name=$defaultName;selected_window=$selected;window_list_entry=$binding.entry;project_saved=$false;source_unchanged=$true;profile='weinview-cn421-tk800x480-native-window-v1'}
}
function Invoke-WeinviewWindowOperation($Session,$Arguments,[string]$Operation) {
 switch -Exact ($Operation){'window_read'{return (Read-WeinviewWindows $Session -NativeList)};'window_create'{return (New-WeinviewWindow $Session $Arguments)};default{throw 'Unknown finite native window operation.'}}
}
