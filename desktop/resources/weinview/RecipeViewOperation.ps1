# Recipe View creation on the current editable screen. The caller supplies field
# names read from this project's original-vendor Recipe Database export, and
# owns the project SaveEditedProject / close / reopen boundary.
# Requires ScreenWorkflow, ObjectRibbonAction, RecipeViewRibbonAction and the
# matching Native/RecipeView C# controls to be loaded by the caller.
function Read-WeinviewRecipeViewSelection($Session,$Dialog,[string]$RecipeName) {
 $native=$Session.native;$h=[long]$Dialog.Hwnd
 $owned=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $h -and $_.Pid -eq $Session.process.Id -and $_.Visible -and $_.Enabled})
 if($owned.Count -ne 1 -or $Dialog.Title -cnotmatch '配方检视'){throw 'Owned original Recipe View property dialog required.'}
 $p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $tabs=@($native.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Class -ceq 'SysTabControl32'})
 if($tabs.Count -ne 1){throw 'Unique native Recipe View property tab control required.'}
 $names=@($p.TabNames($tabs[0].Hwnd));if(@($names|Where-Object {$_ -ceq '一般属性'}).Count -ne 1){throw 'Native Recipe View General tab not identified.'}
 $p.SelectTabExact($tabs[0].Hwnd,'一般属性')
 $combos=@($native.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'ComboBox'})
 $recipeCandidates=@()
 foreach($combo in $combos){try{$items=@($p.ComboItems($combo.Hwnd));if(@($items|Where-Object {$_ -ceq $RecipeName}).Count -eq 1){$recipeCandidates+=@{hwnd=$combo.Hwnd;items=$items}}}catch{}}
 $qtSelected=$null
 try{$qtSelected=[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadRecipeDirectory($native,$h,[int]$Session.process.Id,$RecipeName)}catch{}
 if($null -ne $qtSelected){$recipeCombo=@{kind='qt_recipe_directory';hwnd=$null;items=@($RecipeName)};$selected=$qtSelected}
 elseif($recipeCandidates.Count -eq 1){$recipeCombo=@{kind='win32_combo';hwnd=$recipeCandidates[0].hwnd;items=$recipeCandidates[0].items};$selected=$p.ComboSelected($recipeCombo.hwnd)}
 else {
  $details=@(foreach($combo in $combos){
   $selected='unavailable';$items=@();$reason=$null
   try{$selected=[string]$p.ComboSelected($combo.Hwnd)}catch{$reason='selected_unavailable'}
   try{$items=@($p.ComboItems($combo.Hwnd)|Select-Object -First 24|ForEach-Object {[string]$_})}catch{$reason='items_unavailable'}
   @{id=$combo.Id;selected=$selected;items=$items;item_count=$items.Count;diagnostic=$reason}
  })
  $qtDetails=@(foreach($qt in @($native.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Class -ceq 'Qt5QWindowIcon'})){
   try {@{qt_id=$qt.Id;role46=@([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::RecipeComboDiagnostics([long]$qt.Hwnd,[int]$Session.process.Id))}}
   catch {@{qt_id=$qt.Id;diagnostic='role46_unavailable'}}
  })
  throw ('Recipe View recipe-name selector absent or ambiguous; owned ComboBox candidates: '+(ConvertTo-Json -InputObject $details -Depth 4 -Compress)+'; owned Qt role46 candidates: '+(ConvertTo-Json -InputObject $qtDetails -Depth 5 -Compress))
 }
 return [pscustomobject]@{property=$p;tabs=$names;recipe_combo=$recipeCombo;recipe_selected=$selected;combos=$combos}
}

function Read-WeinviewRecipeViewProperty($Session,$Dialog,[string]$RecipeName,[string[]]$FieldNames,[bool]$ReadCommittedObject=$false) {
 $selection=Read-WeinviewRecipeViewSelection $Session $Dialog $RecipeName
 $native=$Session.native;$h=[long]$Dialog.Hwnd
 $fieldGrids=@();$deadline=[DateTime]::UtcNow.AddSeconds(3)
 do {
  $grids=@($native.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})
  $fieldGrids=@($grids|Where-Object {[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::CanResolve([long]$_.Hwnd,[int]$Session.process.Id,$null)})
  if($fieldGrids.Count -ne 0){break}
  Start-Sleep -Milliseconds 50
 }while([DateTime]::UtcNow -lt $deadline)
 if($fieldGrids.Count -ne 1){
  $details=@(foreach($control in @($native.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Class -ceq 'Qt5QWindowIcon'})){
   try {@{id=$control.Id;enabled=[bool]$control.Enabled;tables=@([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::FieldTableDiagnostics([long]$control.Hwnd,[int]$Session.process.Id))}}
   catch {@{id=$control.Id;enabled=[bool]$control.Enabled;diagnostic=$_.Exception.Message}}
  })
  throw ('Unique original Recipe View Display table required; owned Qt table diagnostics: '+(ConvertTo-Json -InputObject $details -Depth 7 -Compress))
 }
 $displayRows=$null;$displaySource='owned_original_dialog_render';$clipboardError=$null
 if($ReadCommittedObject){
  try {
   $payload=[PLC Engineering Suite.Weinview.RecipeViewClipboard]::Capture([long]$Session.main.Hwnd,[int]$Session.process.Id)
   $committed=[PLC Engineering Suite.Weinview.RecipeViewClipboard]::DecodeSingle($payload)
   $displayRows=@([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadDisplayedFromIndices([long]$fieldGrids[0].Hwnd,[int]$Session.process.Id,[uint32[]]$committed.Indices))
   $displaySource='original_committed_recipe_clipboard'
  }catch{$clipboardError=$_.Exception.Message}
 }
 if($null -eq $displayRows){
  $ambiguityEvidence=([string]$Session.project_path)+'.rv-display-'+[Guid]::NewGuid().ToString('N')+'.png'
  try{$displayRows=@([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadDisplayedWithEvidence([long]$fieldGrids[0].Hwnd,[int]$Session.process.Id,$ambiguityEvidence))}
  catch{if($clipboardError){throw ('Recipe Display unavailable; native object: '+$clipboardError+'; dialog: '+$_.Exception.Message)};throw}
 }
 $sort=[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadSort($native,$h,[int]$Session.process.Id)
 return [pscustomobject]@{property=$selection.property;tabs=$selection.tabs;recipe_combo=$selection.recipe_combo;recipe_selected=$selection.recipe_selected;field_grid=if($fieldGrids.Count -eq 1){$fieldGrids[0]}else{$null};field_grid_count=$fieldGrids.Count;field_names=@($displayRows|ForEach-Object {$_.name});displayed_fields=@($displayRows|Where-Object {$_.displayed}|ForEach-Object {$_.name});display_evidence=$displayRows;display_source=$displaySource;combos=$selection.combos;sort=$sort}
}

function Select-WeinviewRecipeViewSelection($Session,$Dialog,$Read,[string]$RecipeName) {
 $p=$Read.property
 if($Read.recipe_combo.kind -ceq 'qt_recipe_directory'){
  if($Read.recipe_selected -cne $RecipeName){$null=[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::SelectRecipeDirectory($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id,$RecipeName)}
  if([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadRecipeDirectory($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id,$RecipeName) -cne $RecipeName){throw 'Native Recipe directory selection differs.'}
 }else{
  if($Read.recipe_selected -cne $RecipeName){$p.SelectComboExact($Read.recipe_combo.hwnd,$RecipeName)}
  if($p.ComboSelected($Read.recipe_combo.hwnd) -cne $RecipeName){throw 'Recipe View recipe selection readback differs.'}
 }
}

function Set-WeinviewRecipeViewProperty($Session,$Dialog,[string]$RecipeName,[string[]]$FieldNames,[string[]]$DisplayFields,[Nullable[bool]]$SortEnabled=$null,[string]$SortBy=$null,[string]$SortDirection=$null,[bool]$CommittedObject=$false) {
 if(!$RecipeName -or @($FieldNames).Count -lt 1 -or @($DisplayFields).Count -lt 1){throw 'Current recipe name, definition field names and visible fields required.'}
 $read=Read-WeinviewRecipeViewProperty $Session $Dialog $RecipeName $FieldNames $CommittedObject
 Select-WeinviewRecipeViewSelection $Session $Dialog $read $RecipeName
 # Selecting a recipe populates the vendor field table; identify it by the
 # complete current definition, never by an inferred private control ID.
 $deadline=[DateTime]::UtcNow.AddSeconds(3);$grid=$null
 do {
  $candidates=@($Session.native.EnumChildControls($Dialog.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and [PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::CanResolve([long]$_.Hwnd,[int]$Session.process.Id,$FieldNames)})
  if($candidates.Count -gt 1){throw 'Recipe View display table ambiguous by native field names.'}
  if($candidates.Count -eq 1){$grid=$candidates[0];break}
  Start-Sleep -Milliseconds 100
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$grid){
  $details=@(foreach($control in @($Session.native.EnumChildControls($Dialog.Hwnd)|Where-Object {$_.Visible -and ($_.Class -like 'BCGPGridCtrl:*' -or $_.Class -ceq 'Qt5QWindowIcon')})){
   try {@{id=$control.Id;class=$control.Class;enabled=[bool]$control.Enabled;tables=@([PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::FieldTableDiagnostics([long]$control.Hwnd,[int]$Session.process.Id))}}
   catch {@{id=$control.Id;class=$control.Class;enabled=[bool]$control.Enabled;diagnostic='native_table_unavailable'}}
  })
  throw ('Recipe View displayed-field table did not expose the current definition; owned field table candidates: '+(ConvertTo-Json -InputObject $details -Depth 7 -Compress))
 }
 # A copied object contains committed values. Pending property edits are read
 # again from the object only after the caller confirms this dialog.
 $display=if($CommittedObject -and $read.recipe_selected -ceq $RecipeName){
  [PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::QueueDisplayed([long]$grid.Hwnd,[int]$Session.process.Id,$FieldNames,[string[]]@($read.displayed_fields),$DisplayFields)
 }else{[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::SetDisplayed([long]$grid.Hwnd,[int]$Session.process.Id,$FieldNames,$DisplayFields)}
  # Recipe selection can replace the vendor's available sort fields and default.
  # Read its live state after selecting the requested recipe, not from the prior recipe.
  $sortBefore=[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadSort($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id)
 $effectiveEnabled=if($null -ne $SortEnabled){[bool]$SortEnabled}else{[bool]$sortBefore.enabled}
 $effectiveField=if($SortBy){$SortBy}else{[string]$sortBefore.field}
 $effectiveDirection=if($SortDirection){$SortDirection}else{[string]$sortBefore.direction}
 if($effectiveField -cnotin $FieldNames){throw 'Recipe View sort field absent from current definition.'}
 if($SortDirection -and $SortDirection -cnotin @('ascending','descending')){throw 'Recipe View sort direction must be ascending or descending.'}
 $sortAfter=if($null -ne $SortEnabled -or $SortBy -or $SortDirection){[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::SetSort($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id,$effectiveEnabled,$effectiveField,$effectiveDirection,[string[]]$FieldNames)}else{[PLC Engineering Suite.Weinview.RecipeViewDisplayControls]::ReadSort($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id)}
 if([bool]$sortAfter.enabled -ne $effectiveEnabled -or [string]$sortAfter.field -cne $effectiveField -or [string]$sortAfter.direction -cne $effectiveDirection){throw 'Recipe View native sort immediate readback differs.'}
 return [pscustomobject]@{recipe_name=$RecipeName;recipe_selected=$true;displayed_fields=@($DisplayFields);display_evidence=$display;sort_before=$sortBefore;sort_after=$sortAfter;sort_enabled_verified=$true;native_property_written=$true}
}

function Invoke-WeinviewRecipeViewAddition($Session,[string]$RecipeName,[string[]]$FieldNames,[string[]]$DisplayFields,[int]$X,[int]$Y,[Nullable[bool]]$SortEnabled=$null,[string]$SortBy=$null,[string]$SortDirection=$null) {
 if($X -lt 0 -or $Y -lt 0 -or $X -ge [int]$Session.window_width -or $Y -ge [int]$Session.window_height){throw 'Recipe View placement must fit the selected native screen.'}
 if(!$RecipeName -or @($FieldNames).Count -lt 1 -or @($DisplayFields).Count -lt 1 -or @($DisplayFields|Where-Object {$_ -cnotin $FieldNames}).Count){throw 'Current recipe name, definition field names and visible fields required.'}
 $before=Get-WeinviewWindowDirectory -Session $Session
 $labels=@($before.rows|ForEach-Object {$_.raw_label})
 $semantic=[PLC Engineering Suite.Weinview.NativeSemanticControls]::new($Session.native)
 $entry=Invoke-WeinviewRecipeViewRibbon $Session $semantic
 $dialog=$entry.dialog;$closed=$false
 try{$selection=Read-WeinviewRecipeViewSelection $Session $dialog $RecipeName;Select-WeinviewRecipeViewSelection $Session $dialog $selection $RecipeName;Close-WeinviewScreenDialog $Session $dialog $true;$closed=$true}
 finally{if(!$closed -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $dialog $false}}
 $null=$Session.native.ActivateOwnedMain($Session.main.Hwnd)
 $canvas=[PLC Engineering Suite.Weinview.AlarmDisplayDialogControls]::new($Session.native,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)
 $scene=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
 $paint=$canvas.CaptureCanvas([int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height,($Session.output_path+'.recipe-view-placement-'+[guid]::NewGuid().ToString('N')+'.png'))
 $scene.PlaceNewObject($paint.frame,$X,$Y);$scene.EndPlacement()
 $after=Get-WeinviewWindowDirectory -Session $Session
 $new=@($after.rows|Where-Object {$_.raw_label -cnotin $labels})
 if($new.Count -ne 1 -or @($after.rows).Count -ne $labels.Count+1){throw 'Recipe View placement did not yield exactly one new native directory row; inspect current output before retry.'}
 $sourceSha=Hash $Session.project_path
 $prefix=$Session.output_path+'.recipe-created-'+[guid]::NewGuid().ToString('N')
 $preparedBefore=Read-WeinviewTargetObject $Session ([string]$new[0].object_id) $sourceSha ($prefix+'.before') $true
 $initial=$preparedBefore.object;$actual=$null;$updated=$null;$finished=$false
 try{
  if($initial.kind -cne 'recipe_view' -or $initial.recipe_name -cne $RecipeName -or (@($initial.field_names) -join [char]31) -cne ($FieldNames -join [char]31)){throw 'Created Recipe View native recipe or field definition differs'}
  $enabled=if($null -ne $SortEnabled){[bool]$SortEnabled}else{[bool]$initial.sort_enabled}
  $field=if($SortBy){$SortBy}else{[string]$initial.sort_by}
  $direction=if($SortDirection){$SortDirection}else{[string]$initial.sort_direction}
  if($field -cnotin $FieldNames -or $direction -cnotin @('ascending','descending')){throw 'Created Recipe View sort field or direction absent from native definition'}
  $needsUpdate=( (@($initial.displayed_fields) -join [char]31) -cne ($DisplayFields -join [char]31) -or [bool]$initial.sort_enabled -ne $enabled -or [string]$initial.sort_by -cne $field -or [string]$initial.sort_direction -cne $direction )
  if($needsUpdate){
   $arguments=[pscustomobject]@{object_id=[string]$new[0].object_id;expected_object_sha256=[string]$initial.object_sha256;display_fields=[string[]]$DisplayFields;sort_enabled=$enabled;sort_by=$field;sort_direction=$direction}
   $updated=Invoke-WeinviewScreenTargetUpdate $Session $arguments $sourceSha $prefix $null $preparedBefore
   $actual=$updated.object_after
  }else{
   Close-WeinviewScreenDialog $Session $preparedBefore.dialog $false
   if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $preparedBefore.restore_context}
   $actual=$initial
  }
  $finished=$true
 }finally{
  if(!$finished -and $preparedBefore.dialog -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $preparedBefore.dialog.Hwnd -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $preparedBefore.dialog $false}
  if(!$finished -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $preparedBefore.restore_context}
 }
 if($actual.recipe_name -cne $RecipeName -or (@($actual.field_names) -join [char]31) -cne ($FieldNames -join [char]31) -or (@($actual.displayed_fields) -join [char]31) -cne ($DisplayFields -join [char]31) -or [bool]$actual.sort_enabled -ne $enabled -or [string]$actual.sort_by -cne $field -or [string]$actual.sort_direction -cne $direction){throw 'Created Recipe View final native properties differ from request'}
 $sortBefore=[pscustomobject]@{enabled=[bool]$initial.sort_enabled;field=[string]$initial.sort_by;direction=[string]$initial.sort_direction;fields=@($initial.field_names)}
 $sortAfter=[pscustomobject]@{enabled=[bool]$actual.sort_enabled;field=[string]$actual.sort_by;direction=[string]$actual.sort_direction;fields=@($actual.field_names)}
 $property=[pscustomobject]@{recipe_name=[string]$actual.recipe_name;recipe_selected=$true;displayed_fields=@($actual.displayed_fields);sort_before=$sortBefore;sort_after=$sortAfter;sort_enabled_verified=$true;native_property_written=[bool]$needsUpdate;read_evidence_path=if($updated){$updated.update_evidence_path}else{$preparedBefore.read_evidence_path}}
 return [pscustomobject]@{object_id=$new[0].object_id;native_kind=$new[0].kind;native_raw_label=$new[0].raw_label;recipe_name=[string]$actual.recipe_name;field_names=@($actual.field_names);displayed_fields=@($actual.displayed_fields);sort_enabled=[bool]$actual.sort_enabled;sort_by=[string]$actual.sort_by;sort_direction=[string]$actual.sort_direction;sort_enabled_verified=$true;property=$property;entry=$entry;placement=$paint.frame;native_object_created=$true;project_saved=$false;reopened_verified=$false}
}
