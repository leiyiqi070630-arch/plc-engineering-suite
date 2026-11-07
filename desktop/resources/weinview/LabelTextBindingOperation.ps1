# Native CN421 Text-object property binding. The caller owns the open Text
# property dialog, project save/reopen, and process lifecycle.
function Get-WeinviewTextLabelControls($Session,[long]$DialogHwnd) {
 Assert-WeinviewPlcCandidateSession $Session
 $deadline=[DateTime]::UtcNow.AddSeconds(3)
 do{$dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Title -ceq '文字/批注的属性'});if($dialogs.Count -eq 1){break};if($dialogs.Count -gt 1){throw 'Native Text property dialog duplicated'};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $deadline)
 if($dialogs.Count -ne 1){throw 'Unique owned Text property dialog required'}
 $children=@($Session.native.EnumChildControls($dialogs[0].Hwnd))
 $use=@($children|Where-Object {$_.Id -eq 1545 -and $_.Class -ceq 'Button' -and $_.Title -ceq '使用文字库 ' -and $_.Visible})
 if($use.Count -ne 1){throw 'Native Text library checkbox identity changed'}
 $checked=$Session.native.GetCheckboxState($use[0].Hwnd)
 if($checked -notin @(0,1)){throw 'Native Text library checkbox state is indeterminate'}
 if(!$checked){return @{dialog=$dialogs[0];use=$use[0];selector=$null;checked=$false}}
 $select=@($children|Where-Object {$_.Id -eq 1546 -and $_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled})
 if($select.Count -ne 1){throw 'Checked native Text library selector identity changed'}
 return @{dialog=$dialogs[0];use=$use[0];selector=$select[0];checked=$true}
}
function Read-WeinviewTextLabelBinding($Session,[long]$DialogHwnd) {
 $c=Get-WeinviewTextLabelControls $Session $DialogHwnd
 $checked=$c.checked
 $selection=if($checked){[string]$Session.native.GetControlText($c.selector.Hwnd,4096)}else{$null}
 $name=$null
 if($checked){$match=[regex]::Match($selection,'^([^\r\n:]{1,64}) : [^\r\n]*$');if(!$match.Success){throw 'Native Text library selector value changed'};$name=$match.Groups[1].Value}
 return @{label_name=$name;native_label_reference_verified=[bool]$checked;use_library_checked=[bool]$checked;use_library_enabled=[bool]$c.use.Enabled;native_selector_text=$selection;native_dialog_title='文字/批注的属性';dialog_hwnd=[long]$c.dialog.Hwnd;requested_dialog_hwnd=$DialogHwnd;native_control_ids=@(1545,1546)}
}
function Read-WeinviewOrderedLabelNamesFromOpenLibrary($Session,[string]$EvidencePrefix) {
 $null=Get-WeinviewLabelDialog $Session '文字库'
 $projectDirectory=[IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Session.output_path))
 $sample=Join-Path $projectDirectory ('.plceng-label-names-'+[guid]::NewGuid().ToString('N')+'.xlsx')
 try{
  $export=Export-WeinviewLabelWorkbook $Session $sample $EvidencePrefix
  $book=Read-WeinviewLabelWorkbook $export.workbook_path
  return @{ordered_names=@($book.labels|ForEach-Object {$_.name});language_slots=$export.language_slots;export_sha256=$export.sha256}
 }finally{if(Test-Path -LiteralPath $sample){Remove-Item -LiteralPath $sample}}
}
function Set-WeinviewTextLabelBinding($Session,[long]$DialogHwnd,[string]$LabelName,[string[]]$OrderedNativeLabelNames) {
 if($LabelName -cnotmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$'){throw 'Exact native label name required'}
 $before=Read-WeinviewTextLabelBinding $Session $DialogHwnd
 if($before.native_label_reference_verified -and $before.label_name -ceq $LabelName){return @{before=$before;after=$before;native_selection_performed=$false}}
 $DialogHwnd=[long]$before.dialog_hwnd
 $c=Get-WeinviewTextLabelControls $Session $DialogHwnd
 if(!$before.use_library_checked){$Session.native.ClickButton($DialogHwnd,1545,'使用文字库 ');Start-Sleep -Milliseconds 250}
 $c=Get-WeinviewTextLabelControls $Session $DialogHwnd
 if($Session.native.GetCheckboxState($c.use.Hwnd) -ne 1 -or !$c.selector.Visible){throw 'Native Text library selector did not become enabled'}
 $current=if($before.use_library_checked){$before}else{Read-WeinviewTextLabelBinding $Session $DialogHwnd}
 $property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $items=@($property.ComboItems($c.selector.Hwnd))
 $match=@($items|Where-Object {$_.StartsWith($LabelName+' : ',[StringComparison]::Ordinal)})
 if($match.Count -gt 1){throw 'Requested native Text label ambiguous in current selector'}
 if($match.Count -eq 1){$property.SelectComboExact($c.selector.Hwnd,$match[0])}
 else{
  $Session.native.ClickButton($DialogHwnd,1549,'文字库...')
  $library=Get-WeinviewLabelDialog $Session '文字库'
  $names=if($null -ne $OrderedNativeLabelNames -and $OrderedNativeLabelNames.Count -gt 0){@($OrderedNativeLabelNames)}else{@((Read-WeinviewOrderedLabelNamesFromOpenLibrary $Session ([IO.Path]::GetDirectoryName($Session.output_path))).ordered_names)}
  if($names.Count -lt 1 -or $names.Count -gt 4096 -or @($names|Select-Object -Unique).Count -ne $names.Count){throw 'Bounded unique native Label Library names required'}
  $indices=@(for($i=0;$i -lt $names.Count;$i++){if($names[$i] -ceq $LabelName){$i}})
  if($indices.Count -ne 1){throw 'Requested label absent from complete native Label Library export'}
  $currentIndices=@(for($i=0;$i -lt $names.Count;$i++){if($names[$i] -ceq $current.label_name){$i}})
  if($currentIndices.Count -ne 1){throw 'Current native Text label absent from complete Label Library export'}
  $grid=@($Session.native.EnumChildControls($library.Hwnd)|Where-Object {$_.Id -eq 1696 -and $_.Class -ceq 'MFCGridCtrl' -and $_.Visible -and $_.Enabled})
  if($grid.Count -ne 1){throw 'Unique native Label Library grid required'}
  [PLC Engineering Suite.Weinview.LabelGridControls]::SelectRow([long]$library.Hwnd,[long]$grid[0].Hwnd,[int]$indices[0],[int]$currentIndices[0],$names.Count)|Out-Null
  Start-Sleep -Milliseconds 150
  $Session.native.ClickButton($library.Hwnd,1,'确定')
 }
 $after=Read-WeinviewTextLabelBinding $Session $DialogHwnd
 if(!$after.native_label_reference_verified -or $after.label_name -cne $LabelName){throw 'Native Text label selection readback differs'}
 return @{before=$before;after=$after;native_selection_performed=$true;native_option_count=$items.Count;selection_route=if($match.Count -eq 1){'current_native_combo'}else{'complete_library_ordered_row'}}
}
