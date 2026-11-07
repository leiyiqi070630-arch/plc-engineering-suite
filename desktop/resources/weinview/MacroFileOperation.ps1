# Reuses the native-verified EBM codec and existing owned NativeControls.
# UI is limited to original vendor file exchange and compilation commands.
function Invoke-WeinviewMacroCodec($Arguments,[string]$EvidencePrefix) {
 $requestPath=$EvidencePrefix+'.request.json';$responsePath=$EvidencePrefix+'.response.json'
 WritePrivateJson $requestPath $Arguments
 $raw=& (Join-Path $PSScriptRoot 'EventTableCodec\Invoke-EventTableCodec.ps1') -RequestPath $requestPath -ResponsePath $responsePath
 return ($raw|ConvertFrom-Json).result
}
function Get-WeinviewMacroExchangeDialog($Session,[string]$Title) {
 WaitFor {
  $windows=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($windows|Where-Object {$_.Title -cnotin @('宏指令',$Title)}).Count){throw 'Unexpected macro exchange modal; no acknowledgement.'}
  $matches=@($windows|Where-Object {$_.Enabled -and $_.Title -ceq $Title})
  if($matches.Count -gt 1){throw 'Duplicate macro exchange dialog.'}
  if($matches.Count -eq 1){return $matches[0]}
 } 10
}
function Wait-WeinviewMacroDialogClosed($Session,[long]$Hwnd) {
 $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Hwnd}).Count){return $true}} 10
}
function Export-WeinviewMacroFile($Session,$Manager,[int]$MacroId,[string]$MacroName,[string]$Directory) {
 if(Test-Path -LiteralPath $Directory){throw 'Fresh macro export directory required.'}
 $null=[IO.Directory]::CreateDirectory($Directory)
 Button $Session $Manager 1146 '导出...'
 $select=Get-WeinviewMacroExchangeDialog $Session '导出宏指令'
 # Original default is a checked export list, not ListBox multi-selection.
 # Export the directory once and read the requested file by its real metadata.
 $rows=ListRows $Session $select
 if(@($rows|Where-Object {$_.id -eq $MacroId -and $_.name -ceq $MacroName}).Count -ne 1){throw 'Unique requested export macro required.'}
 Button $Session $select 1 '确定'
 Wait-WeinviewMacroDialogClosed $Session $select.Hwnd
 $folder=Get-WeinviewMacroExchangeDialog $Session '浏览文件夹'
 $path=Control $Session $folder 14148 'Edit';$Session.native.SetControlText($path.Hwnd,$Directory)
 if($Session.native.GetControlText($path.Hwnd,32768) -cne $Directory){throw 'Macro export folder readback differs.'}
 Button $Session $folder 1 '确定'
 Wait-WeinviewMacroDialogClosed $Session $folder.Hwnd
 $success=Get-WeinviewMacroExchangeDialog $Session 'EasyBuilder Pro'
 $body=$Session.native.FindUniqueControlWithoutLabel($success.Hwnd,65535,'Static')
 if($Session.native.GetControlText($body.Hwnd,4096) -cne '成功'){throw 'Native macro export did not report success.'}
 Button $Session $success 2 '确定'
 Wait-WeinviewMacroDialogClosed $Session $success.Hwnd
 $null=Dialog $Session '宏指令'
 $files=@(Get-ChildItem -LiteralPath $Directory -File)
 if(!$files.Count -or $files.Count -gt 255 -or @($files|Where-Object {$_.Extension -ine '.ebm'}).Count){throw 'Bounded original-vendor EBM export required.'}
 $target=@($files|Where-Object {$_.Name.StartsWith(([string]$MacroId+'_'),[StringComparison]::Ordinal)})
 if($target.Count -ne 1){throw 'Unique requested EBM file required.'}
 $result=Invoke-WeinviewMacroCodec @{operation='ebm-inspect';input=$target[0].FullName;expected_sha256=(Hash $target[0].FullName)} ($Directory+'.inspect')
 if($result.macro_id -ne $MacroId -or $result.macro_name -cne $MacroName){throw 'Exported EBM identity differs.'}
 $result|Add-Member -NotePropertyName native_ebm_path -NotePropertyValue $target[0].FullName
 $manifest=@();foreach($file in $files){
  if($file.Name -notmatch '^(0|[1-9][0-9]*)_(.*)\.ebm$'){throw 'Original EBM filename contract differs.'}
  $id=[int]$Matches[1];$name=$Matches[2]
  if(@($rows|Where-Object {$_.id -eq $id -and $_.name -ceq $name}).Count -ne 1){throw 'Export file does not match original macro catalog.'}
  $manifest+=@{macro_id=$id;macro_name=$name;ebm_sha256=(Hash $file.FullName)}
 }
 if($manifest.Count -ne $rows.Count){throw 'Original export omitted macros; incomplete snapshot rejected.'}
 $result|Add-Member -NotePropertyName exported_macros -NotePropertyValue $manifest
 return $result
}
function Import-WeinviewMacroFile($Session,$Manager,[string]$EbmPath,[Nullable[int]]$ReplaceId=$null,[string]$ReplaceName='') {
 if($null -ne $ReplaceId){
  $rows=ListRows $Session $Manager
  if(@($rows|Where-Object {$_.id -eq $ReplaceId -and $_.name -ceq $ReplaceName}).Count -ne 1){throw 'Exact guarded replacement macro must exist.'}
 }
 $before=Hash $EbmPath
 Button $Session $Manager 1147 '导入...'
 $file=Get-WeinviewMacroExchangeDialog $Session '导入宏'
 $path=Control $Session $file 1148 'Edit';$Session.native.SetControlText($path.Hwnd,$EbmPath)
 if($Session.native.GetControlText($path.Hwnd,32768) -cne $EbmPath){throw 'Macro import file readback differs.'}
 Button $Session $file 1 '打开(&O)'
 Wait-WeinviewMacroDialogClosed $Session $file.Hwnd
 $success=Get-WeinviewMacroExchangeDialog $Session 'EasyBuilder Pro'
 if($null -ne $ReplaceId){
  $body=$Session.native.FindUniqueControlWithoutLabel($success.Hwnd,2393,'Static')
  $expected=$ReplaceName+" 已经存在 !`n`n是否要替代此项目 ?"
  if([PLCCode.Weinview.NativeControls]::NormalizeLF($Session.native.GetControlText($body.Hwnd,4096)) -cne $expected){throw 'Exact original-vendor macro replacement body differs.'}
  Button $Session $success 1606 '置换';Wait-WeinviewMacroDialogClosed $Session $success.Hwnd
  $success=Get-WeinviewMacroExchangeDialog $Session 'EasyBuilder Pro'
 }
 $body=$Session.native.FindUniqueControlWithoutLabel($success.Hwnd,65535,'Static')
 $message=$Session.native.GetControlText($body.Hwnd,4096)
 if($message -cne '成功'){throw ('Macro import requires reviewed success; observed: '+$message)}
 Button $Session $success 2 '确定';Wait-WeinviewMacroDialogClosed $Session $success.Hwnd;$null=Dialog $Session '宏指令'
 if((Hash $EbmPath) -cne $before){throw 'Macro import file changed.'}
 return @{input_ebm_sha256=$before;native_import_verified=$true;native_same_id_replacement_verified=($null -ne $ReplaceId);source_written_through_editor=$false}
}
function Assert-WeinviewMacroFilesPreserved($Before,$After,[int]$ChangedId,[bool]$NewMacro) {
 $previous=@($Before.exported_macros);$current=@($After.exported_macros)
 if($current.Count -ne ($previous.Count+[int]$NewMacro)){throw 'Macro catalog count changed unexpectedly.'}
 foreach($item in $previous){
  $matches=@($current|Where-Object {$_.macro_id -eq $item.macro_id -and $_.macro_name -ceq $item.macro_name})
  if($matches.Count -ne 1 -or ($item.macro_id -ne $ChangedId -and $matches[0].ebm_sha256 -cne $item.ebm_sha256)){throw 'Unrelated original macro source/metadata changed.'}
 }
}
