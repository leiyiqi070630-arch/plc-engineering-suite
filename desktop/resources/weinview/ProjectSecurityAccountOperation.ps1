# Native engineering-project preset account edit. The caller owns the fresh
# project copy and saves/reopens after this function confirms System Parameters.
# Password input is never read back or included in a receipt.
function Find-WeinviewProjectAccountTable($Session,$Page) {
 $table=@()
 foreach($qt in @($Session.native.EnumChildControls($Page.dialog.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})){
  try {if(@([PLCCode.Weinview.ProjectSecurityTableControls]::Headers($qt.Hwnd,$Session.process.Id)).Count -eq 16){$table+=,$qt}}
  catch {continue}
 }
 if($table.Count -ne 1){throw 'Unique native engineering account table required.'}
 return $table[0]
}

function Read-WeinviewProjectAccountsNonSecret($Session) {
 . (Join-Path $PSScriptRoot 'ProjectSecurityOperation.ps1')
 if(!('PLCCode.Weinview.ProjectSecurityTableControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityTableControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 if(!('PLCCode.Weinview.ProjectSecurityAccountControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityAccountControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll','System.Windows.Forms.dll'}
 $page=$null
 try {
  $page=Open-WeinviewProjectSecurityPage $Session
  $table=Find-WeinviewProjectAccountTable $Session $page;$hwnd=[long]$table.Hwnd;$accountPid=[int]$Session.process.Id
  $rows=@(foreach($row in 0..10){
   $enabled='unknown';$name='unknown';$nameSource='unavailable';$nameVerified=$false;$classes='unknown';$readErrors=@{}
   try {$enabled=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadCheck($hwnd,$accountPid,$row,0)} catch {$readErrors.enabled=$_.Exception.Message}
   try {$name=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadUserName($hwnd,$accountPid,$row);$nameSource='native_accessibility_value';$nameVerified=$true} catch {$readErrors.native_user_name=$_.Exception.Message}
   if(!$nameVerified -and $enabled -ne $false){
    try {$name=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadStoredUserNameViaEditor($hwnd,$accountPid,$row);$nameSource='saved_project_inline_editor_copy';$nameVerified=$true} catch {$readErrors.inline_user_name=$_.Exception.Message}
   }
   try {$observed=@(foreach($i in 0..11){if([PLCCode.Weinview.ProjectSecurityAccountControls]::ReadCheck($hwnd,$accountPid,$row,4+$i)){[string][char]([int][char]'A'+$i)}});$classes=$observed} catch {$readErrors.classes=$_.Exception.Message}
   # Qt paints the user name even for disabled rows but exports no accValue.
   # A read must not toggle any other engineering accounts to seek a value.
   @{row=$row;row_enabled=$enabled;user_name=$name;user_name_source=$nameSource;user_name_readback_verified=$nameVerified;classes=$classes;password_column_queried=$false;read_errors=$readErrors}
  })
  return @{operation='engineering_project_accounts_read';rows=$rows;password_column_queried=$false;project_saved=$false}
 } finally {
  if($page){
   $modal=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -eq $page.dialog.Hwnd -and $_.Enabled})
   if($modal.Count -eq 1){$Session.native.ClickButton($page.dialog.Hwnd,2,'取消')}
  }
 }
}

function Read-WeinviewProjectAccountNonSecret($Session,[int]$Row) {
 if($Row -lt 0 -or $Row -ge 11){throw 'Engineering account row must be 0 through 10.'}
 $all=Read-WeinviewProjectAccountsNonSecret $Session
 return @($all.rows|Where-Object {$_.row -eq $Row})[0]
}

# A separate, pre-write probe for an already saved project. The inline editor
# is opened and cancelled; this result is not yet a public persistence claim.
function Read-WeinviewStoredProjectAccountUserNameFromEditor($Session,[int]$Row) {
 if($Row -lt 0 -or $Row -ge 11){throw 'Engineering account row must be 0 through 10.'}
 . (Join-Path $PSScriptRoot 'ProjectSecurityOperation.ps1')
 if(!('PLCCode.Weinview.ProjectSecurityTableControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityTableControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 if(!('PLCCode.Weinview.ProjectSecurityAccountControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityAccountControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll','System.Windows.Forms.dll'}
 $page=$null
 try {
  $page=Open-WeinviewProjectSecurityPage $Session
  $mode=@($Session.native.EnumChildControls($page.dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Button' -and $_.Title -ceq '高级安全模式'})
  if($mode.Count -ne 1 -or $Session.native.GetRadioState($mode[0].Hwnd) -ne 1){throw 'Project Enhanced Security mode must be selected.'}
  $table=Find-WeinviewProjectAccountTable $Session $page
  $hwnd=[long]$table.Hwnd;$accountPid=[int]$Session.process.Id
  # Reading the existing name does not change row enablement. The painted
  # checkbox is not a prerequisite for opening the exact name cell, and its
  # pixel read can fail independently of the native editor/clipboard read.
  $name=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadStoredUserNameViaEditor($hwnd,$accountPid,$Row)
  return @{operation='engineering_project_account_stored_name_probe';row=$Row;user_name=$name;source='saved_project_inline_editor_copy';password_column_queried=$false;project_saved=$false;public_readback_verified=$false}
 } finally {
  if($page){
   $modal=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -eq $page.dialog.Hwnd -and $_.Enabled})
   if($modal.Count -eq 1){$Session.native.ClickButton($page.dialog.Hwnd,2,'取消')}
  }
 }
}

function Invoke-WeinviewProjectAccountEdit($Session,[int]$Row,$UserName=$null,[string]$Password='',$Classes=$null,$Enabled=$null) {
 if($Row -lt 0 -or $Row -ge 11){throw 'Engineering account row must be 0 through 10.'}
 if($null -ne $UserName -and ($UserName -isnot [string] -or [string]::IsNullOrWhiteSpace($UserName) -or $UserName.Length -gt 128 -or $UserName.IndexOf([char]0) -ge 0)){throw 'Bounded nonempty user name required when specified.'}
 if($Password.Length -gt 128 -or $Password.IndexOf([char]0) -ge 0){throw 'Password input exceeds the bounded native editor contract.'}
 if($null -ne $Enabled -and $Enabled -isnot [bool]){throw 'enabled must be a Boolean when specified.'}
 $classSpecified=-not [object]::ReferenceEquals($Classes,$null)
 if($null -eq $UserName -and !$Password.Length -and !$classSpecified -and $null -eq $Enabled){throw 'Specify at least one engineering account change.'}
 $requested=@();if($classSpecified){
  if($Classes -isnot [Array]){throw 'classes must be an array when specified.'}
  $requested=@($Classes)
  if($requested.Count -gt 12 -or @($requested|Where-Object {$_ -isnot [string] -or $_ -cnotmatch '^[A-L]$'}).Count -or @($requested|Select-Object -Unique).Count -ne $requested.Count){throw 'Distinct A through L classes required.'}
 }
 . (Join-Path $PSScriptRoot 'ProjectSecurityOperation.ps1')
 if(!('PLCCode.Weinview.ProjectSecurityTableControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityTableControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 if(!('PLCCode.Weinview.ProjectSecurityAccountControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityAccountControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll','System.Windows.Forms.dll'}
 $page=$null;$confirmed=$false
 try {
  $page=Open-WeinviewProjectSecurityPage $Session
  $mode=@($Session.native.EnumChildControls($page.dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Button' -and $_.Title -ceq '高级安全模式'})
  if($mode.Count -ne 1 -or $Session.native.GetRadioState($mode[0].Hwnd) -ne 1){throw 'Project Enhanced Security mode must be selected.'}
  $table=Find-WeinviewProjectAccountTable $Session $page
  $hwnd=[long]$table.Hwnd;$accountPid=[int]$Session.process.Id
  # Preserve omitted fields. Temporarily enable only when an edit requires it.
  $beforeEnabled=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadCheck($hwnd,$accountPid,$Row,0)
  $targetEnabled=if($null -ne $Enabled){[bool]$Enabled}else{$beforeEnabled}
  $needsEnabled=($null -ne $UserName -or $Password.Length -gt 0 -or $classSpecified)
  if($needsEnabled -and !$beforeEnabled){$null=[PLCCode.Weinview.ProjectSecurityAccountControls]::SetCheck($hwnd,$accountPid,$Row,0,$true)}
  if($null -ne $UserName){$null=[PLCCode.Weinview.ProjectSecurityAccountControls]::SetText($hwnd,$accountPid,$Row,2,$UserName,$false)}
  if($Password.Length){$null=[PLCCode.Weinview.ProjectSecurityAccountControls]::SetText($hwnd,$accountPid,$Row,3,$Password,$true)}
  if($classSpecified){foreach($i in 0..11){
    $letter=[string][char]([int][char]'A'+$i)
    $null=[PLCCode.Weinview.ProjectSecurityAccountControls]::SetCheck($hwnd,$accountPid,$Row,4+$i,($letter -cin $requested))
   }}
  $afterName='unknown';$afterClasses='unknown'
  try {$afterName=[PLCCode.Weinview.ProjectSecurityAccountControls]::ReadUserName($hwnd,$accountPid,$Row)} catch {}
  try {$afterClasses=@(foreach($i in 0..11){if([PLCCode.Weinview.ProjectSecurityAccountControls]::ReadCheck($hwnd,$accountPid,$Row,4+$i)){[string][char]([int][char]'A'+$i)}})} catch {if($classSpecified){throw}}
  if($null -ne $UserName -and $afterName -cne 'unknown' -and $afterName -cne $UserName){throw 'Native account user name differs after edit.'}
  if($classSpecified -and (@($afterClasses) -join ',') -cne (@($requested|Sort-Object) -join ',')){throw 'Native account classes differ after edit.'}
  $null=[PLCCode.Weinview.ProjectSecurityAccountControls]::SetCheck($hwnd,$accountPid,$Row,0,$targetEnabled)
  if([PLCCode.Weinview.ProjectSecurityAccountControls]::ReadCheck($hwnd,$accountPid,$Row,0) -ne $targetEnabled){throw 'Native account row enable state differs after edit.'}
  $Session.native.ClickButton($page.dialog.Hwnd,1,'确定')
  $deadline=[DateTime]::UtcNow.AddSeconds(4)
  do {
   $open=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if(@($open|Where-Object {$_.Hwnd -eq $page.dialog.Hwnd}).Count -eq 0){break}
   if(@($open|Where-Object {$_.Hwnd -ne $page.dialog.Hwnd}).Count){throw 'Native account confirmation opened an unexpected modal.'}
   Start-Sleep -Milliseconds 80
  } while([DateTime]::UtcNow -lt $deadline)
  if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Hwnd -eq $page.dialog.Hwnd}).Count){throw 'Native System Parameters did not close after account edit.'}
  $confirmed=$true
  # Legacy password_changed mirrors write-only input submission. It never
  # asserts that the password was read back or accepted by a runtime login.
  return @{operation='engineering_project_account_edit';row=$Row;user_name=$afterName;user_name_input_submitted=($null -ne $UserName);user_name_readback_verified=($null -ne $UserName -and $afterName -cne 'unknown' -and $afterName -ceq $UserName);classes=$afterClasses;row_enabled=$targetEnabled;enabled_before=$beforeEnabled;user_name_changed=($null -ne $UserName);classes_changed=$classSpecified;password_changed=[bool]$Password.Length;password_input_submitted=[bool]$Password.Length;password_readback_performed=$false;password_value_recorded=$false;system_parameters_confirmed=$true;project_saved=$false;reopened_verified=$false}
 } finally {
  if($page -and !$confirmed){
   $modal=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -eq $page.dialog.Hwnd -and $_.Enabled})
   if($modal.Count -eq 1){$Session.native.ClickButton($page.dialog.Hwnd,2,'取消')}
  }
 }
}
