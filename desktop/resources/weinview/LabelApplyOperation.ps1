# Native Label Tag Library and Text binding stages can use separate sessions.
# The caller owns each original-editor session, save and reopen. Imported
# labels may need a saved reopen before native Text binding becomes enabled.
function Get-WeinviewLabelTableSemanticSha256($Workbook) {
 $columns=@($Workbook.columns|Sort-Object -Property @{Expression='language';Ascending=$true},@{Expression='state';Ascending=$true})
 $keys=@('A','B')+@($columns|ForEach-Object {[string]$_.column})
 $rows=@(foreach($label in @($Workbook.labels|Sort-Object -Property name)){
  $cells=[ordered]@{};foreach($key in $keys){$cells[$key]=if($label.cells.ContainsKey($key)){[string]$label.cells[$key]}else{''}}
  [ordered]@{name=[string]$label.name;cells=$cells}
 })
 $shape=[ordered]@{headers=@($columns|ForEach-Object {[string]$_.header});rows=$rows}
 $json=ConvertTo-Json -InputObject $shape -Depth 16 -Compress
 $bytes=[Text.Encoding]::UTF8.GetBytes($json);$hash=[Security.Cryptography.SHA256]::Create()
 try{return ([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','')}finally{$hash.Dispose()}
}
function Confirm-WeinviewTextFontNotice($Session) {
 $expected='某些文字可能无法使用所选的字体正确显示. 请考虑其他字体.'
 $settleUntil=[DateTime]::UtcNow.AddMilliseconds(200)
 $deadline=[DateTime]::UtcNow.AddSeconds(3)
 do {
  $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible})
  if($modals.Count -gt 1){throw 'Multiple owned modals after native Text confirmation'}
  if($modals.Count -eq 1){
   $modal=$modals[0]
   if($modal.Title -cne 'EasyBuilder Pro' -or !$modal.Enabled){throw 'Unexpected owned modal after native Text confirmation'}
   $children=@($Session.native.EnumChildControls($modal.Hwnd))
   $warning=@($children|Where-Object {$_.Id -eq 65535 -and $_.Class -ceq 'Static' -and $_.Title -ceq $expected -and $_.Visible})
   $confirm=@($children|Where-Object {$_.Id -eq 2 -and $_.Class -ceq 'Button' -and $_.Title -ceq '确定' -and $_.Visible -and $_.Enabled})
   if($warning.Count -ne 1 -or $confirm.Count -ne 1){throw 'Native Text font notice fields changed'}
   $Session.native.ClickButton($modal.Hwnd,2,'确定')
   $closeDeadline=[DateTime]::UtcNow.AddSeconds(3)
   do{if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $modal.Hwnd}).Count){return $true};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $closeDeadline)
   throw 'Native Text font notice did not close'
  }
  $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd})
  if([DateTime]::UtcNow -ge $settleUntil -and $main.Count -eq 1 -and $main[0].Visible -and $main[0].Enabled){return $false}
  Start-Sleep -Milliseconds 50
 }while([DateTime]::UtcNow -lt $deadline)
 throw 'Native Text confirmation did not restore owned main window'
}
function Invoke-WeinviewLabelApplyLibrary($Session,$Arguments,[string]$ExpectedSha256,[string]$EvidencePrefix) {
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Native label source project hash changed'}
 $labels=@();if($Arguments.PSObject.Properties.Name -contains 'labels' -and $null -ne $Arguments.labels){$labels=@($Arguments.labels)}
 $bindings=@();if($Arguments.PSObject.Properties.Name -contains 'bindings' -and $null -ne $Arguments.bindings){$bindings=@($Arguments.bindings)}
 if($labels.Count -eq 0 -or $labels.Count -gt 1000 -or $bindings.Count -gt 16){throw 'A bounded native label update batch required'}
 $names=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
 foreach($label in $labels){
  if($label.name -cnotmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$' -or !$names.Add([string]$label.name)){throw 'Unique observed label name required'}
  $states=@($label.states);if($states.Count -lt 1 -or $states.Count -gt 8){throw 'One to eight selected states required'}
  $stateNumbers=New-Object 'Collections.Generic.HashSet[int]'
  foreach($state in $states){if([int]$state.state -lt 0 -or [int]$state.state -gt 7 -or !$stateNumbers.Add([int]$state.state)){throw 'Unique bounded native label state required'}}
 }
 $slots=@();$original=$null;$edited=$null;$editedTable=$null;$import=$null;$orderedNativeNames=@();$emptyLibraryBootstrapped=$false
 if($labels.Count -gt 0){
  $library=Open-WeinviewLabelLibrary $Session ($EvidencePrefix+'.library')
  $closed=$false
  try {
   $buttons=@($Session.native.EnumChildControls($library.dialog.Hwnd))
   $nativeExport=@($buttons|Where-Object {$_.Id -eq 1245 -and $_.Class -ceq 'Button' -and $_.Title -ceq '导出文字库文件...' -and $_.Visible})
   $excelExport=@($buttons|Where-Object {$_.Id -eq 1247 -and $_.Class -ceq 'Button' -and $_.Title -ceq '导出为 EXCEL 文件...' -and $_.Visible})
   if($nativeExport.Count -ne 1 -or $excelExport.Count -ne 1 -or [bool]$nativeExport[0].Enabled -ne [bool]$excelExport[0].Enabled){throw 'Native Label Library export state changed'}
   if(!$excelExport[0].Enabled){
    $first=$labels[0];$highest=@($first.states|ForEach-Object {[int]$_.state}|Measure-Object -Maximum)[0].Maximum
    if(!@($first.states|Where-Object {[int]$_.state -eq 0}).Count){throw 'Empty native Label Library needs state 0 text in the first requested label'}
    $null=New-WeinviewLabelEntry $Session ([string]$first.name) ([int]$highest+1)
    $afterSeed=@($Session.native.EnumChildControls($library.dialog.Hwnd)|Where-Object {$_.Id -eq 1247 -and $_.Class -ceq 'Button' -and $_.Title -ceq '导出为 EXCEL 文件...' -and $_.Visible -and $_.Enabled})
    if($afterSeed.Count -ne 1){throw 'Native empty Label Library bootstrap did not enable complete XLSX export'}
    $emptyLibraryBootstrapped=$true
   }
   $original=Export-WeinviewLabelWorkbook $Session ($EvidencePrefix+'.before.xlsx') ($EvidencePrefix+'.export')
   $slots=@($original.language_slots);if($slots.Count -lt 1 -or $slots.Count -gt 24){throw 'Native project language slots unavailable'}
   foreach($label in $labels){foreach($state in @($label.states)){if(@($state.texts).Count -lt 1 -or @($state.texts).Count -gt $slots.Count){throw 'Texts exceed actual project language slots'}}}
   $edited=Write-WeinviewLabelWorkbook $original.workbook_path ($EvidencePrefix+'.edited.xlsx') $labels $slots.Count
   $editedTable=Read-WeinviewLabelWorkbook $edited.path
   $orderedNativeNames=@($editedTable.labels|Sort-Object -Property row|ForEach-Object {[string]$_.name})
   $import=Import-WeinviewLabelWorkbook $Session $original.workbook_path $edited.path ($EvidencePrefix+'.import')
   if($import.native_import_verified -ne $true -or $import.old_names_preserved -ne $true){throw 'Original native label import or existing labels not verified'}
   Close-WeinviewLabelLibrary $Session $true;$closed=$true
  }finally{if(!$closed){try{Close-WeinviewLabelLibrary $Session $false}catch{}}}
  if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Label apply saved project before outer managed save'}
 }
 return @{language_slots=$slots;labels_before_sha256=if($original){$original.sha256}else{$null};labels_after_sha256=if($edited){$edited.sha256}else{$null};labels_expected_table_sha256=if($editedTable){Get-WeinviewLabelTableSemanticSha256 $editedTable}else{$null};applied_labels=$labels;preserved_existing_labels=$true;empty_library_bootstrapped=$emptyLibraryBootstrapped;native_import_verified=($null -ne $import);native_import_replacement_prompt_confirmed=if($import){[bool]$import.replacement_prompt_confirmed}else{$false};ordered_native_names=$orderedNativeNames;bindings=@();project_saved=$false;source_sha256=$ExpectedSha256}
}
function Invoke-WeinviewLabelApplyBindings($Session,$Arguments,[string]$ExpectedSha256,[string]$EvidencePrefix,$LibraryApplied=$null) {
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Native label binding source project hash changed'}
 $bindings=@();if($Arguments.PSObject.Properties.Name -contains 'bindings' -and $null -ne $Arguments.bindings){$bindings=@($Arguments.bindings)}
 if($bindings.Count -lt 1 -or $bindings.Count -gt 16){throw 'One to sixteen native Text bindings required'}
 $orderedNativeNames=if($LibraryApplied){@($LibraryApplied.ordered_native_names)}else{@()}
 $appliedBindings=@()
 foreach($binding in $bindings){
  $window=[int]$binding.window_number
  $null=Select-WeinviewWindow $Session $window
  $directory=Get-WeinviewWindowDirectory -Session $Session
  $rows=@($directory.rows|Where-Object {$_.object_id -ceq [string]$binding.object_id})
  if($rows.Count -ne 1 -or $rows[0].kind -cne 'Text'){throw 'Exact native Text object unavailable'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $confirmed=$false
  $activeDialog=$dialog
  try {
   $before=Read-WeinviewTextLabelBinding $Session ([long]$dialog.Hwnd)
   $beforeObjectSha=$null
   if($binding.PSObject.Properties.Name -contains 'expected_object_sha256'){
    $readPath=$EvidencePrefix+'.'+$binding.object_id+'.before.json'
    $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $ExpectedSha256 -DialogHwnd $dialog.Hwnd -OutputPath $readPath
    $nativeRead=Get-Content -LiteralPath $readPath -Raw -Encoding UTF8|ConvertFrom-Json
    if($nativeRead.status -cne 'success'){throw 'Native Text object precondition cannot be read'}
    $canonical=New-WeinviewObjectRecord ([string]$binding.object_id) $nativeRead.actual
    if($canonical.object_sha256 -ine [string]$binding.expected_object_sha256){throw 'Native Text object changed before binding'}
    $beforeObjectSha=[string]$canonical.object_sha256
   }
   $selection=Set-WeinviewTextLabelBinding $Session ([long]$dialog.Hwnd) ([string]$binding.label_name) ([string[]]$orderedNativeNames)
   if($selection.after.dialog_hwnd){$matched=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq [long]$selection.after.dialog_hwnd -and $_.Visible -and $_.Enabled});if($matched.Count -ne 1){throw 'Selected native Text dialog identity changed'};$activeDialog=$matched[0]}
   $after=Read-WeinviewTextLabelBinding $Session ([long]$activeDialog.Hwnd)
   if($after.label_name -cne [string]$binding.label_name -or $after.native_label_reference_verified -ne $true){throw 'Native text label reference readback differs'}
   Close-WeinviewScreenDialog $Session $activeDialog $true;$confirmed=$true
   $fontNoticeConfirmed=Confirm-WeinviewTextFontNotice $Session
   $appliedBindings+=@{window_number=$window;object_id=[string]$binding.object_id;label_name=[string]$binding.label_name;before_object_sha256=$beforeObjectSha;expected_object_sha256_verified=($null -ne $beforeObjectSha);before=$before;after=$after;font_notice_confirmed=$fontNoticeConfirmed}
  }finally{if(!$confirmed){try{Close-WeinviewScreenDialog $Session $activeDialog $false}catch{}}}
 }
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Native Text binding saved project before outer managed save'}
 $result=@{language_slots=@();labels_before_sha256=$null;labels_after_sha256=$null;labels_expected_table_sha256=$null;applied_labels=@();preserved_existing_labels=$true;empty_library_bootstrapped=$false;native_import_verified=$false;native_import_replacement_prompt_confirmed=$false;ordered_native_names=@();bindings=$appliedBindings;project_saved=$false;source_sha256=$ExpectedSha256}
 if($LibraryApplied){foreach($key in $LibraryApplied.Keys){$result[$key]=$LibraryApplied[$key]};$result.bindings=$appliedBindings;$result.binding_source_sha256=$ExpectedSha256}
 return $result
}
function Invoke-WeinviewLabelApply($Session,$Arguments,[string]$ExpectedSha256,[string]$EvidencePrefix) {
 $labels=@();if($Arguments.PSObject.Properties.Name -contains 'labels' -and $null -ne $Arguments.labels){$labels=@($Arguments.labels)}
 $bindings=@();if($Arguments.PSObject.Properties.Name -contains 'bindings' -and $null -ne $Arguments.bindings){$bindings=@($Arguments.bindings)}
 if(!$labels.Count -and !$bindings.Count){throw 'A native label update or Text binding is required'}
 $applied=$null
 if($labels.Count){$applied=Invoke-WeinviewLabelApplyLibrary $Session $Arguments $ExpectedSha256 ($EvidencePrefix+'.content')}
 if($bindings.Count){$applied=Invoke-WeinviewLabelApplyBindings $Session $Arguments $ExpectedSha256 ($EvidencePrefix+'.bindings') $applied}
 return $applied
}
function Read-WeinviewPersistedLabelApply($Session,$Applied,[string]$SavedSha256,[string]$EvidencePrefix) {
 if((Hash $Session.project_path) -ine $SavedSha256){throw 'Persisted label project hash changed before readback'}
 $tableSha=$null;$libraryRead=$null
 if(@($Applied.applied_labels).Count -gt 0){
  $null=Open-WeinviewLabelLibrary $Session ($EvidencePrefix+'.library')
  try{$libraryRead=Export-WeinviewLabelWorkbook $Session ($EvidencePrefix+'.labels.xlsx') ($EvidencePrefix+'.export')}
  finally{Close-WeinviewLabelLibrary $Session $false}
  $book=Read-WeinviewLabelWorkbook $libraryRead.workbook_path
  $tableSha=Get-WeinviewLabelTableSemanticSha256 $book
  if($tableSha -cne $Applied.labels_expected_table_sha256){throw 'Saved/reopened native label library differs from expected complete table'}
 }
 $readBindings=@()
 foreach($binding in @($Applied.bindings)){
  $window=[int]$binding.window_number
  $null=Select-WeinviewWindow $Session $window
  $directory=Get-WeinviewWindowDirectory -Session $Session
  $rows=@($directory.rows|Where-Object {$_.object_id -ceq [string]$binding.object_id})
  if($rows.Count -ne 1 -or $rows[0].kind -cne 'Text'){throw 'Persisted native Text object unavailable'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  try{
   $actual=Read-WeinviewTextLabelBinding $Session ([long]$dialog.Hwnd)
   if($actual.label_name -cne [string]$binding.label_name -or $actual.native_label_reference_verified -ne $true){throw 'Saved/reopened native Text label reference differs'}
   $readBindings+=@{window_number=$window;object_id=[string]$binding.object_id;label_name=[string]$binding.label_name;before_object_sha256=$binding.before_object_sha256;expected_object_sha256_verified=$binding.expected_object_sha256_verified;actual=$actual}
  }finally{Close-WeinviewScreenDialog $Session $dialog $false}
 }
 if((Hash $Session.project_path) -ine $SavedSha256){throw 'Persisted label readback changed project bytes'}
 return @{labels_table_sha256=$tableSha;labels_table_reopened_verified=($null -ne $tableSha);bindings=$readBindings;bindings_reopened_verified=(@($readBindings).Count -eq @($Applied.bindings).Count);project_saved=$false;source_unchanged=$true}
}
