function Get-WeinviewRecipeDialog($Session,[string]$Title,[int]$Seconds=8) {
 $limit=[DateTime]::UtcNow.AddSeconds($Seconds)
 do {
  $items=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Title -ceq $Title})
  if($items.Count -gt 1){throw "Duplicate native Recipe Database dialog: $Title"}
  if($items.Count -eq 1){return $items[0]}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $limit)
 throw "Original-vendor Recipe Database dialog absent: $Title"
}

function Open-WeinviewRecipeDatabase($Session,[string]$EvidencePrefix,[bool]$RequireExport=$true) {
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
 $tab=Invoke-WeinviewObjectRibbon $Session $semantic '资料/历史'
 $path=$EvidencePrefix+'.ribbon.png'
 if(Test-Path -LiteralPath $path){throw 'Fresh Recipe Database ribbon evidence required'}
 $projectSha=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 $proof=[PLCCode.Weinview.ObjectRibbonControls]::CaptureOwnedBackgroundRibbon($Session.native,[long]$Session.main.Hwnd,$Session.output_path,$projectSha,$path)
 if(!$proof.Accepted){throw 'Owned Recipe Database ribbon render unavailable; no input.'}
 [PLCCode.Weinview.RecipeDatabaseControls]::Open($Session.native,$proof)
 $dialog=Get-WeinviewRecipeDialog $Session '配方数据库'
 $buttons=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Button'})
 $required=@(@{id=11;title='导入...'},@{id=1;title='确定'},@{id=2;title='取消'})
 if($RequireExport){$required+=@{id=10;title='导出...'}}
 foreach($control in $required){
  if(@($buttons|Where-Object {$_.Id -eq $control.id -and $_.Title -ceq $control.title -and $_.Enabled}).Count -ne 1){throw 'Recipe Database native definition control differs'}
 }
 return [pscustomobject]@{dialog=$dialog;tab=$tab;ribbon_path=$path;ribbon_sha256=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
}

# One current-project definition edit. The caller owns the project copy and
# performs SaveEditedProject, normal close, reopen and native re-export.
function Invoke-WeinviewRecipeDefinitionProjectEdit($Session,$Context,$Arguments,[string]$PythonExe,[string]$Prefix) {
 $action=[string]$Arguments.action
 $recipe=[string]$Arguments.recipe_name
 if($action -cnotin @('create_recipe','add_field','rename_field') -or $recipe -cnotmatch '^[A-Za-z0-9]+$'){throw 'One native Recipe Database definition edit required.'}
 $source=$null;$template=$null
 if($action -cne 'create_recipe'){$source=Export-WeinviewRecipeDatabase $Session $Context $recipe ($Prefix+'.before.db')}
 $templateRecipe=[string]$Arguments.template_recipe;$templateItem=[string]$Arguments.template_item
 if([bool]$templateRecipe -ne [bool]$templateItem){throw 'Template recipe and item must be provided together.'}
 if($templateRecipe){
  if($templateRecipe -cnotmatch '^[A-Za-z0-9]+$' -or $templateItem -cnotmatch '^[A-Za-z0-9_]+$'){throw 'Native template names invalid.'}
  if($source -and $templateRecipe -ceq $recipe){$template=$source}
  else{$template=Export-WeinviewRecipeDatabase $Session $Context $templateRecipe ($Prefix+'.template.db')}
 }
 $edit=@{action=$action;recipe=$recipe}
 if($action -ceq 'create_recipe'){
  $fields=@($Arguments.fields)
  if($fields.Count -lt 1 -or $fields.Count -gt 1000 -or @($fields|Where-Object {$_ -isnot [string] -or $_ -cnotmatch '^[A-Za-z0-9_]+$'}).Count){throw 'One to 1000 native field names required.'}
  $edit.fields=$fields
 }elseif($action -ceq 'add_field'){
  $edit.field=[string]$Arguments.field
  $edit.default=if($null -ne $Arguments.default){[int]$Arguments.default}else{0}
 }else{
  $edit.field=[string]$Arguments.field;$edit.new_name=[string]$Arguments.new_name
 }
 $request=@{source_db=if($source){$source.path}else{$null};output_db=$Prefix+'.edited.db';edits=@($edit)}
 if($template){$request.template_db=$template.path;$request.template_recipe=$templateRecipe;$request.template_item=$templateItem}
 elseif($action -ne 'rename_field'){$request.initialization='observed_recipe_db_int_unsigned_itemtype0_size2_v1'}
 $requestPath=$Prefix+'.definition-request.json';$responsePath=$Prefix+'.definition-receipt.json'
 if((Test-Path -LiteralPath $requestPath) -or (Test-Path -LiteralPath $responsePath)){throw 'Fresh Recipe Database definition request files required.'}
 [IO.File]::WriteAllText($requestPath,(ConvertTo-Json -InputObject $request -Depth 12),(New-Object Text.UTF8Encoding($true)))
 $edited=Invoke-WeinviewRecipeDatabaseDefinitionCodec $PythonExe $requestPath $responsePath
 if($edited.output_db -cne $request.output_db -or $edited.original_vendor_import_verified -ne $false){throw 'Definition codec result contract differs.'}
 $imported=Import-WeinviewRecipeDatabase $Session $Context $recipe $request.output_db ([string]$edited.output_sha256) ($action -cne 'create_recipe')
 return [pscustomobject]@{action=$action;recipe_name=$recipe;source=$source;template=$template;edited=$edited;imported=$imported;edited_db_path=$request.output_db;edited_db_sha256=[string]$edited.output_sha256;references_relinked=$false;original_vendor_import_verified=$true;pc_database_update_confirmed=[bool]$imported.pc_database_update_confirmed}
}

function Select-WeinviewRecipeName($Session,$Dialog,[string]$SelectorTitle,[string]$RecipeName) {
 $selector=Get-WeinviewRecipeDialog $Session $SelectorTitle
 $list=$Session.native.FindUniqueControlWithoutLabel($selector.Hwnd,1011,'ListBox')
 $items=@($Session.native.GetListBoxItems($list.Hwnd))
 $match=@(for($index=0;$index -lt $items.Count;$index++){if($items[$index] -ceq $RecipeName){$index}})
 if($match.Count -ne 1){throw 'Requested existing native recipe definition is absent or ambiguous'}
 $Session.native.SelectListItem($list.Hwnd,[int]$match[0],$RecipeName)
 $include=$Session.native.FindUniqueControl($selector.Hwnd,1230,'Button','包含资料')
 if($Session.native.GetCheckboxState($include.Hwnd) -eq 0){$Session.native.ClickButton($selector.Hwnd,1230,'包含资料')}
 if($Session.native.GetCheckboxState($include.Hwnd) -ne 1){throw 'Native Recipe Database records were not selected'}
 $Session.native.ClickButton($selector.Hwnd,1,'确定')
 return [pscustomobject]@{recipe_name=$RecipeName;native_definition_selected=$true;include_records_checked=$true;available_names=$items;selection_dialog_hwnd=[long]$selector.Hwnd}
}

function Export-WeinviewRecipeDatabase($Session,$Context,[string]$RecipeName,[string]$OutputPath) {
 if(Test-Path -LiteralPath $OutputPath){throw 'Fresh native Recipe Database export path required'}
 $dialog=Get-WeinviewRecipeDialog $Session '配方数据库'
 if($dialog.Hwnd -ne $Context.dialog.Hwnd){throw 'Native Recipe Database owner changed'}
 $Session.native.ClickButton($dialog.Hwnd,10,'导出...')
 $selected=Select-WeinviewRecipeName $Session $dialog '选择欲导出的配方' $RecipeName
 $save=Get-WeinviewRecipeDialog $Session '另存为'
 $edit=$Session.native.FindUniqueControlWithoutLabel($save.Hwnd,1001,'Edit')
 $Session.native.SetControlText($edit.Hwnd,$OutputPath)
 if($Session.native.GetControlText($edit.Hwnd,4096) -cne $OutputPath){throw 'Native Recipe Database export destination differs'}
 $Session.native.ClickButton($save.Hwnd,1,'保存(&S)')
 $limit=[DateTime]::UtcNow.AddSeconds(12)
 do{if(Test-Path -LiteralPath $OutputPath){break};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $limit)
 if(!(Test-Path -LiteralPath $OutputPath)){throw 'Original-vendor Recipe Database export did not create the DB'}
 $stream=[IO.File]::Open($OutputPath,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete)
 try{$header=New-Object byte[] 16;$count=$stream.Read($header,0,16)}finally{$stream.Dispose()}
 if($count -ne 16 -or [Text.Encoding]::ASCII.GetString($header) -cne "SQLite format 3`0"){throw 'Original-vendor Recipe Database export is not native SQLite'}
 return [pscustomobject]@{path=$OutputPath;sha256=(Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash;bytes=(Get-Item -LiteralPath $OutputPath).Length;recipe_name=$RecipeName;native_export_verified=$true;include_records_checked=$true;available_names=$selected.available_names}
}

function Complete-WeinviewRecipeDatabaseImport($Session,$Context,[string]$RecipeName,[long]$SelectionDialogHwnd=0,[bool]$ExpectOverwrite=$true) {
 $parentHwnd=[long]$Context.dialog.Hwnd
 $overwriteConfirmed=$false;$parentConfirmed=$false;$pcConfirmed=$false;$overwriteHwnd=0;$pcHwnd=0
 $limit=[DateTime]::UtcNow.AddSeconds(8)
 do {
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  $unknown=@($dialogs|Where-Object {$_.Enabled -and !(($_.Hwnd -eq $parentHwnd -and $_.Title -ceq '配方数据库') -or $_.Title -ceq 'EasyBuilder Pro' -or ($SelectionDialogHwnd -ne 0 -and $_.Hwnd -eq $SelectionDialogHwnd -and $_.Title -ceq '选择欲导入的配方'))})
  if($unknown.Count){throw 'Unexpected enabled native Recipe Database import dialog'}
  $questions=@($dialogs|Where-Object {$_.Title -ceq 'EasyBuilder Pro'})
  if($questions.Count -gt 1){throw 'Ambiguous native Recipe Database import questions'}
  if($questions.Count -eq 1){
   $dialog=$questions[0]
   if(!$dialog.Enabled){Start-Sleep -Milliseconds 100;continue}
   if(($overwriteConfirmed -and $dialog.Hwnd -eq $overwriteHwnd) -or ($pcConfirmed -and $dialog.Hwnd -eq $pcHwnd)){
    Start-Sleep -Milliseconds 100
    continue
   }
   $message=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Static' -and $_.Id -eq 65535})
   if($message.Count -ne 1){throw 'Original-vendor Recipe Database import question is absent or ambiguous'}
   if($message[0].Title -ceq ('是否要覆盖配方 '+$RecipeName+'?')){
    if($pcConfirmed -or ($overwriteConfirmed -and $dialog.Hwnd -ne $overwriteHwnd)){throw 'Duplicate or late Recipe Database overwrite question'}
    if(!$overwriteConfirmed){$overwriteConfirmed=$true;$overwriteHwnd=$dialog.Hwnd;$Session.native.ClickButton($dialog.Hwnd,6,'是(&Y)')}else{Start-Sleep -Milliseconds 100}
    continue
   }
   if($message[0].Title -ceq '是否要将此次变更更新至 PC 数据库 ?'){
    if(!$parentConfirmed -or ($pcConfirmed -and $dialog.Hwnd -ne $pcHwnd)){throw 'Unexpected Recipe Database PC update question order'}
    if(!$pcConfirmed){$pcConfirmed=$true;$pcHwnd=$dialog.Hwnd;$Session.native.ClickButton($dialog.Hwnd,6,'是(&Y)')}else{Start-Sleep -Milliseconds 100}
    continue
   }
   throw ('Unexpected native Recipe Database import question: '+$message[0].Title)
  }
  if(@($dialogs|Where-Object {$SelectionDialogHwnd -ne 0 -and $_.Hwnd -eq $SelectionDialogHwnd -and $_.Title -ceq '选择欲导入的配方'}).Count -eq 1){Start-Sleep -Milliseconds 100;continue}
  $parents=@($dialogs|Where-Object {$_.Hwnd -eq $parentHwnd -and $_.Title -ceq '配方数据库' -and $_.Enabled})
  if($parents.Count -eq 1 -and (!$ExpectOverwrite -or $overwriteConfirmed)){
   if(!$parentConfirmed){$Session.native.ClickButton($parentHwnd,1,'确定');$parentConfirmed=$true}else{Start-Sleep -Milliseconds 100}
   continue
  }
  $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Hwnd -eq $Session.main.Hwnd -and $_.Enabled})
  if($pcConfirmed -and $main.Count -eq 1){return [pscustomobject]@{pc_database_update_confirmed=$true}}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $limit)
 throw 'Original-vendor Recipe Database import did not return to enabled project after exact confirmations'
}

function Import-WeinviewRecipeDatabase($Session,$Context,[string]$RecipeName,[string]$DbPath,[string]$ExpectedSha256,[bool]$ExpectOverwrite=$true) {
 if(!(Test-Path -LiteralPath $DbPath -PathType Leaf) -or (Get-FileHash -LiteralPath $DbPath -Algorithm SHA256).Hash -cne $ExpectedSha256){throw 'Edited native Recipe Database changed'}
 $dialog=Get-WeinviewRecipeDialog $Session '配方数据库'
 if($dialog.Hwnd -ne $Context.dialog.Hwnd){throw 'Native Recipe Database owner changed'}
 $Session.native.ClickButton($dialog.Hwnd,11,'导入...')
 $open=Get-WeinviewRecipeDialog $Session '打开'
 $edit=$Session.native.FindUniqueControlWithoutLabel($open.Hwnd,1148,'Edit')
 $Session.native.SetControlText($edit.Hwnd,$DbPath)
 if($Session.native.GetControlText($edit.Hwnd,4096) -cne $DbPath){throw 'Native Recipe Database import source differs'}
 $Session.native.ClickButton($open.Hwnd,1,'打开(&O)')
 $selected=Select-WeinviewRecipeName $Session $dialog '选择欲导入的配方' $RecipeName
 $completed=Complete-WeinviewRecipeDatabaseImport $Session $Context $RecipeName $selected.selection_dialog_hwnd $ExpectOverwrite
 return [pscustomobject]@{recipe_name=$RecipeName;native_import_selected=$selected.native_definition_selected;include_records_checked=$true;pc_database_update_confirmed=[bool]$completed.pc_database_update_confirmed;edited_db_path=$DbPath;edited_db_sha256=$ExpectedSha256}
}

function Close-WeinviewRecipeDatabaseReadOnly($Session,$Context) {
 $dialog=Get-WeinviewRecipeDialog $Session '配方数据库'
 if($dialog.Hwnd -ne $Context.dialog.Hwnd){throw 'Native Recipe Database owner changed'}
 $Session.native.ClickButton($dialog.Hwnd,2,'取消')
 $null=WaitFor {
  $windows=@($Session.native.EnumTopWindows())
  if(@($windows|Where-Object {$_.Hwnd -eq $dialog.Hwnd}).Count){return}
  if(@($windows|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Enabled}).Count -eq 1){return $true}
 } 5
}
