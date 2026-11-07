# cMT project account and object-class settings live in System Parameters > User Password.
# This entry reuses the existing owned ribbon and native tab controls. It never reads
# or serializes password edit contents while discovering the current project page.
function Open-WeinviewProjectSecurityPage($Session) {
 . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1')
 . (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1')
 if(!$Session.native -or !$Session.process -or !$Session.main -or !$Session.output_path -or !$Session.exe_path){throw 'Owned editable EasyBuilder session required.'}
 $native=$Session.native
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($native)
 $entry=Open-WeinviewSystemParametersRibbon $Session $semantic
 $deadline=[DateTime]::UtcNow.AddSeconds(8);$dialog=$null
 do{
  $all=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($all|Where-Object {$_.Title -cne '系统参数设置 '}).Count){throw 'Unexpected native modal before project security page.'}
  if($all.Count -eq 1 -and $all[0].Enabled){$dialog=$all[0];break}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$dialog){throw 'System Parameters did not open for project security.'}
 $property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $tab=$native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
 $tabs=@($property.TabNames($tab.Hwnd))
 if(@($tabs|Where-Object {$_ -ceq '用户密码'}).Count -ne 1){throw 'Current cMT User Password tab unavailable.'}
 $property.SelectTabExact($tab.Hwnd,'用户密码')
 return @{dialog=$dialog;tab=$tab;tabs=$tabs;entry=$entry;property=$property}
}

function Read-WeinviewProjectSecurityPageStructure($Session) {
 $before=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 $page=$null
 try {
  $page=Open-WeinviewProjectSecurityPage $Session
  $controls=@($Session.native.EnumChildControls($page.dialog.Hwnd)|Where-Object {$_.Visible}|ForEach-Object {
   # Deliberately omit every control value and caption, including accounts and passwords.
   @{id=$_.Id;class=$_.Class;enabled=[bool]$_.Enabled}
  })
  return @{tab='用户密码';tabs=$page.tabs;visible_control_structure=$controls;password_values_observed=$false;project_sha256_before=$before}
 }finally{
  if($page){
   $modal=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if($modal.Count -eq 1 -and $modal[0].Hwnd -eq $page.dialog.Hwnd -and $modal[0].Enabled){$Session.native.ClickButton($page.dialog.Hwnd,2,'取消')}
  }
  if((Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash -cne $before){throw 'Read-only project security observation changed project bytes.'}
 }
}

function ConvertTo-WeinviewRequestedSecurityClasses($Classes) {
 $items=@($Classes)
 if(!$items.Count -or $items.Count -gt 12){throw 'Specify one to twelve distinct enhanced-security classes.'}
 $normalized=@()
 foreach($item in $items){
  $class=[string]$item
  if($class -cnotmatch '^[A-L]$' -or $class -cin $normalized){throw 'Enhanced-security classes must be distinct A through L.'}
  $normalized+=$class
 }
 return @($normalized|Sort-Object)
}

# Research-stage row evidence. This intentionally returns raw MSAA cell state,
# never a guessed account value: Qt exposes focused table cells but has not yet
# exposed the painted checkbox state or user-name text through this interface.
# Column 3 (password) is never queried, including through child enumeration.
function Read-WeinviewProjectSecurityRowEvidence($Session,$Page,[int]$Row) {
 if($Row -lt 0 -or $Row -ge 11){throw 'Account row must be 0 through 10.'}
 if(!('PLCCode.Weinview.ProjectSecurityTableControls' -as [type])){
  Add-Type -Path (Join-Path $PSScriptRoot 'ProjectSecurityTableControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'
 }
 $native=$Session.native
 $candidates=@($native.EnumChildControls($Page.dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Qt5QWindowIcon'})
 $table=$null;$headers=$null
 foreach($candidate in $candidates){
  try{$h=@([PLCCode.Weinview.ProjectSecurityTableControls]::Headers($candidate.Hwnd,$Session.process.Id))}
  catch{continue}
  if($table){throw 'Account table is ambiguous.'}
  $table=$candidate;$headers=$h
 }
 if(!$table){throw 'Account table not found.'}
 $cells=@()
 for($column=0;$column -lt 16;$column++){
  if($column -eq 3){continue}
  $cells+=@([PLCCode.Weinview.ProjectSecurityTableControls]::ReadNonPasswordCell($table.Hwnd,$Session.process.Id,$Row,$column))
 }
 return @{page='用户密码';mode='unknown';row=$Row;headers=$headers;cells=$cells;password_column_queried=$false;account_values_verified=$false}
}
