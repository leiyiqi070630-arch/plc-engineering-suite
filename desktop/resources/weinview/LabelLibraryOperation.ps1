# CN421 native Label Tag Library (文字库). The caller owns the verified project copy,
# save/reopen, and normal process lifecycle. Address tags use TagOperation.ps1.
function Get-WeinviewLabelDialog($Session,[string]$Title,[int]$Seconds=8) {
 Assert-WeinviewPlcCandidateSession $Session
 $deadline=[DateTime]::UtcNow.AddSeconds($Seconds)
 do {
  $matches=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Title -ceq $Title})
  if($matches.Count -gt 1){throw 'Native label dialog duplicated'}
  if($matches.Count -eq 1){return $matches[0]}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $deadline)
 throw ('Native label dialog unavailable: '+$Title)
}
function Open-WeinviewLabelLibrary($Session,[string]$EvidencePrefix) {
 Assert-WeinviewPlcCandidateSession $Session
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected modal before Label Library'}
 $semantic=New-Object PLC Engineering Suite.Weinview.NativeSemanticControls($Session.native)
 $tab=Invoke-WeinviewTagRibbon $Session $semantic '工程文件' $true
 Start-Sleep -Milliseconds 250
 $ribbonPath=$EvidencePrefix+'.label-ribbon.png'
 $projectSha=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 $ribbon=[PLC Engineering Suite.Weinview.ObjectRibbonControls]::CaptureOwnedBackgroundRibbon($Session.native,[long]$Session.main.Hwnd,$Session.output_path,$projectSha,$ribbonPath)
 if(!$ribbon.Accepted){throw 'Owned Label Library ribbon render unavailable; no input.'}
 $icon=Join-Path $PSScriptRoot 'label-tag-icon-cn421.png'
 $point=[PLC Engineering Suite.Weinview.LabelRibbonControls]::FindOwnedLabelIcon($ribbon,$icon)
 [PLC Engineering Suite.Weinview.LabelRibbonControls]::ClickLabel($Session.native,$ribbon,[int]$point[0],[int]$point[1])
 $library=Get-WeinviewLabelDialog $Session '文字库'
 foreach($control in @(@(4,'新增...'),@(1246,'导入文字库文件...'),@(1248,'导入 EXCEL 文件...'),@(1,'确定'),@(2,'取消'))){
  $c=$Session.native.FindUniqueControl($library.Hwnd,[int]$control[0],'Button',[string]$control[1]);if(!$c.Visible){throw 'Native Label Library button not visible'}
 }
 return @{dialog=$library;entry=@{tab=$tab;ribbon_path=$ribbon.Path;ribbon_sha256=$ribbon.Hash;icon_x=$point[0];icon_y=$point[1];profile='CN421-Label-Library'}}
}
function New-WeinviewLabelEntry($Session,[string]$Name,[int]$StateCount) {
 if($Name -cnotmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$' -or $StateCount -lt 1 -or $StateCount -gt 8){throw 'Bounded Label name and state count required'}
 $library=Get-WeinviewLabelDialog $Session '文字库'
 $Session.native.ClickButton($library.Hwnd,4,'新增...')
 $dialog=Get-WeinviewLabelDialog $Session '文字标签'
 $nameControl=$Session.native.FindUniqueControl($dialog.Hwnd,1568,'Edit',$null)
 $statesControl=$Session.native.FindUniqueControl($dialog.Hwnd,1493,'Edit',$null)
 $Session.native.SetControlText($nameControl.Hwnd,$Name)
 $Session.native.SetControlText($statesControl.Hwnd,[string]$StateCount)
 if($Session.native.GetControlText($nameControl.Hwnd,4096) -cne $Name -or $Session.native.GetControlText($statesControl.Hwnd,16) -cne [string]$StateCount){throw 'Native Label fields differ before confirm'}
 $Session.native.ClickButton($dialog.Hwnd,1,'确定')
 $null=Get-WeinviewLabelDialog $Session '文字库'
 return @{name=$Name;state_count=$StateCount;native_dialog_confirmed=$true}
}
function Close-WeinviewLabelLibrary($Session,[bool]$Confirm) {
 $library=Get-WeinviewLabelDialog $Session '文字库'
 if($Confirm){$Session.native.ClickButton($library.Hwnd,1,'确定')}
 else{$Session.native.ClickButton($library.Hwnd,2,'取消')}
}
function Get-WeinviewLabelLanguageOption($Session) {
 $modal=Get-WeinviewLabelDialog $Session '语言选项'
 $combo=$Session.native.FindUniqueControlWithoutLabel($modal.Hwnd,2068,'ComboBox')
 $property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $options=@($property.ComboItems($combo.Hwnd))
 $all=@($options|Where-Object {$_ -match '^所有语言 \(语言 1 ~ 语言 ([1-9][0-9]?)\)$'})
 if($all.Count -ne 1){throw 'Native all-language option absent or ambiguous'}
 $count=[int]([regex]::Match($all[0],'语言 1 ~ 语言 ([1-9][0-9]?)').Groups[1].Value)
 if($count -lt 1 -or $count -gt 24){throw 'Native language slot count outside reviewed range'}
 if($property.ComboSelected($combo.Hwnd) -cne $all[0]){$property.SelectComboExact($combo.Hwnd,$all[0])}
 return @{dialog=$modal;language_count=$count;selected=$all[0];language_slots=@(1..$count|ForEach-Object {@{index=$_;name=('Language '+$_)}})}
}
function Export-WeinviewLabelWorkbook($Session,[string]$OutputPath,[string]$EvidencePrefix) {
 if([IO.Path]::GetExtension($OutputPath) -ine '.xlsx' -or (Test-Path -LiteralPath $OutputPath)){throw 'Fresh XLSX label export path required'}
 $library=Get-WeinviewLabelDialog $Session '文字库'
 $Session.native.ClickButton($library.Hwnd,1247,'导出为 EXCEL 文件...')
 $language=Get-WeinviewLabelLanguageOption $Session
 $Session.native.ClickButton($language.dialog.Hwnd,1,'确定')
 $save=Get-WeinviewLabelDialog $Session '另存为'
 $property=New-Object PLC Engineering Suite.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $formats=@($Session.native.EnumChildControls($save.Hwnd)|Where-Object {$_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled -and @($property.ComboItems($_.Hwnd)) -contains 'Excel Files (*.xls, *xlsx)'})
 if($formats.Count -ne 1){throw 'Native XLSX export filter absent or ambiguous'}
 $property.SelectComboExact($formats[0].Hwnd,'Excel Files (*.xls, *xlsx)')
 $edit=$Session.native.FindUniqueControlWithoutLabel($save.Hwnd,1001,'Edit')
 $full=[IO.Path]::GetFullPath($OutputPath);$Session.native.SetControlText($edit.Hwnd,$full)
 if($Session.native.GetControlText($edit.Hwnd,4096) -cne $full){throw 'Native XLSX export path readback differs'}
 $Session.native.ClickButton($save.Hwnd,1,'保存(&S)')
 $deadline=[DateTime]::UtcNow.AddSeconds(8)
 do{if(Test-Path -LiteralPath $full -PathType Leaf){break};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
 if(!(Test-Path -LiteralPath $full -PathType Leaf)){throw 'Native XLSX export file absent'}
 $success=Get-WeinviewLabelDialog $Session 'EasyBuilder Pro'
 $null=$Session.native.FindUniqueControl($success.Hwnd,65535,'Static','成功')
 $Session.native.ClickButton($success.Hwnd,2,'确定')
 $null=Get-WeinviewLabelDialog $Session '文字库'
 $book=Read-WeinviewLabelWorkbook $full
 $actual=@($book.columns|ForEach-Object {[int]$_['language']}|Select-Object -Unique|Sort-Object)
 if($actual.Count -ne $language.language_count -or $actual[0] -ne 1 -or $actual[-1] -ne $language.language_count){throw 'Exported workbook language columns differ from native selection'}
 return @{workbook_path=$full;sha256=$book.sha256;language_slots=$language.language_slots;native_export_verified=$true;label_count=@($book.labels).Count}
}
function Import-WeinviewLabelWorkbook($Session,[string]$OriginalExportPath,[string]$EditedWorkbookPath,[string]$EvidencePrefix) {
 $before=Read-WeinviewLabelWorkbook $OriginalExportPath
 $after=Read-WeinviewLabelWorkbook $EditedWorkbookPath
 $oldNames=@($before.labels|ForEach-Object {$_.name})
 foreach($name in $oldNames){if(@($after.labels|Where-Object {$_.name -ceq $name}).Count -ne 1){throw ('Native import would remove existing label '+$name)}}
 if($before.columns.Count -ne $after.columns.Count){throw 'Edited workbook changed native language/state grid'}
 for($i=0;$i -lt $before.columns.Count;$i++){if($before.columns[$i].header -cne $after.columns[$i].header -or $before.columns[$i].column -cne $after.columns[$i].column){throw 'Edited workbook changed native header order'}}
 $library=Get-WeinviewLabelDialog $Session '文字库'
 $Session.native.ClickButton($library.Hwnd,1248,'导入 EXCEL 文件...')
 $open=Get-WeinviewLabelDialog $Session '打开'
 $edit=$Session.native.FindUniqueControlWithoutLabel($open.Hwnd,1148,'Edit')
 $full=[IO.Path]::GetFullPath($EditedWorkbookPath);$Session.native.SetControlText($edit.Hwnd,$full)
 if($Session.native.GetControlText($edit.Hwnd,4096) -cne $full){throw 'Native import path readback differs'}
 $Session.native.ClickButton($open.Hwnd,1,'打开(&O)')
 $language=Get-WeinviewLabelLanguageOption $Session
 $Session.native.ClickButton($language.dialog.Hwnd,1,'确定')
 $warning=Get-WeinviewLabelDialog $Session '注意'
 $null=$Session.native.FindUniqueControl($warning.Hwnd,65535,'Static','删除现有的文字标签')
 $Session.native.ClickButton($warning.Hwnd,6,'是(&Y)')
 $success=Get-WeinviewLabelDialog $Session 'EasyBuilder Pro'
 $null=$Session.native.FindUniqueControl($success.Hwnd,65535,'Static','成功')
 $Session.native.ClickButton($success.Hwnd,2,'确定')
 $null=Get-WeinviewLabelDialog $Session '文字库'
 return @{native_import_verified=$true;old_names_preserved=$true;original_labels=$oldNames;imported_labels=@($after.labels|ForEach-Object {$_.name});edited_workbook_sha256=$after.sha256;language_slots=$language.language_slots;replacement_prompt_confirmed=$true}
}
