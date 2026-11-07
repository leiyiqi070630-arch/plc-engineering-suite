# Read one known native Recipe View before or after a definition rename.
# Whole-project reference enumeration is not claimed.
# Observe one already known Recipe View before and after a native definition
# rename. This does not claim whole-project reference coverage.
function Read-WeinviewKnownRecipeViewReference($Session,[int]$WindowNumber,[string]$ObjectId,[string]$RecipeName) {
 if($WindowNumber -lt 10 -or $WindowNumber -gt 1999 -or $ObjectId -cnotmatch '^RV_[0-9]{1,5}$' -or [string]::IsNullOrWhiteSpace($RecipeName)){throw 'Exact known Recipe View identity required'}
 $null=Select-WeinviewWindow $Session $WindowNumber
 $directory=Get-WeinviewWindowDirectory -Session $Session
 try {
  $rows=@($directory.rows|Where-Object {$_.object_id -ceq $ObjectId -and $_.kind -ceq 'RecipeView'})
  if($rows.Count -ne 1){throw 'Known Recipe View row absent or duplicated'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  try {
   $actual=Read-WeinviewRecipeViewTargetProperty $Session $dialog
   if($actual.recipe_name -cne $RecipeName){throw 'Known Recipe View recipe identity changed'}
   return @{window_number=$WindowNumber;object_id=$ObjectId;recipe_name=$RecipeName;field_names=@($actual.field_names);displayed_fields=@($actual.displayed_fields);sort_enabled=[bool]$actual.sort_enabled;sort_by=[string]$actual.sort_by;sort_direction=[string]$actual.sort_direction;project_saved=$false}
  } finally {
   if(@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $dialog $false}
  }
 } finally {
  if($directory.restore_context){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
 }
}

function Get-WeinviewNativeHostRecipeViewReferenceTargets($Session,$Raw) {
 if(!$Raw -or !$Raw.metadata -or $Raw.metadata.directory_trees -isnot [array]){throw 'Native host window directory is missing or malformed for Recipe View inventory'}
 $windows=@();$seenWindows=@{}
 foreach($entry in @($Raw.metadata.directory_trees)){
  $id=[string]$entry.id
  if($id -cnotmatch '^[0-9]{1,4}$'){continue}
  $number=[int]$id
  if($number -lt 10 -or $number -gt 1999){continue}
  if($seenWindows.ContainsKey($number)){throw 'Duplicate native host ordinary window ID in Recipe View inventory'}
  $seenWindows[$number]=$true
  $windows+=@{number=$number;name=[string]$entry.name}
 }
 if($windows.Count -lt 1 -or $windows.Count -gt 1990){throw 'Native host ordinary window directory is absent or unbounded'}
 $targets=@();$seenTargets=@{}
 foreach($window in $windows){
  $objects=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method 'getWindowObjects' -Arguments @([int]$window.number)
  if($objects -isnot [array]){throw ('Native host window objects missing or malformed for window '+$window.number)}
  foreach($item in @($objects)){
   if(!$item -or !$item.properties){throw ('Native host object properties missing for window '+$window.number)}
   $name=[string]$item.properties.name
   if($name -cnotmatch '^RV_[0-9]+$'){continue}
   $key=([string]$window.number)+':'+$name
   if($seenTargets.ContainsKey($key)){throw ('Duplicate native Recipe View object '+$key)}
   $seenTargets[$key]=$true
   $targets+=@{window_number=[int]$window.number;object_id=$name;raw_label=$name;raw_type=[string]$item.properties.type}
  }
 }
 return [pscustomobject]@{targets=$targets;window_count=$windows.Count;scope='native_host_window_objects'}
}

function Get-WeinviewRecipeViewReferenceTargets($Session) {
 $nativeUnavailable=$null
 if($Session.native_host_port -and [int]$Session.native_host_port -gt 0){
  if(!(Get-Command Invoke-WeinviewNativeHostRead -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')}
  $raw=$null
  try {$raw=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method 'getAllData' -Arguments @()}
  catch {$nativeUnavailable=[string]$_.Exception.Message}
  if($nativeUnavailable -eq $null){return Get-WeinviewNativeHostRecipeViewReferenceTargets $Session $raw}
 }
 # One directory traversal: expand window headings, then collect only RV rows.
 $selected=Get-WeinviewWindowDirectory -Session $Session
 try {
  $binding=Get-WeinviewDirectoryBinding $Session
  $qt=@($Session.native.EnumChildControls($binding.bar.Hwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})
  if($qt.Count -ne 1){throw 'Unique visible native directory tree required for Recipe View reference inventory'}
  $branches=@($binding.tree.FindRole($qt[0].Hwnd,35))
  if($branches.Count -ne 1){throw 'Unique native directory tree role required'}
  $tree=[long]$qt[0].Hwnd;$path=[string]$branches[0].path
  $rows=@($binding.tree.AllWindowRows($tree,$path))
  $headings=@($rows|Where-Object {$_.name -cmatch '^([0-9]{1,4})\s*:\s*' -and [int]$Matches[1] -ge 10 -and [int]$Matches[1] -le 1999})
  if(!$headings.Count -or $headings.Count -gt 1990){throw 'Native ordinary window headings absent or unbounded'}
  foreach($heading in $headings){
   if(($heading.state -band 512) -ne 0){continue}
   $null=$binding.tree.EnsureNamedWindowVisible($tree,$heading.path,$heading.name)
   $binding.tree.ExpandWindowAtObservedRow($tree,$heading.path,$heading.name)
   $rows=@($binding.tree.AllWindowRows($tree,$path))
   $matching=@($rows|Where-Object {$_.name -ceq $heading.name -and $_.role -eq 36})
   if($matching.Count -ne 1 -or ($matching[0].state -band 512) -eq 0){throw 'Native window heading did not expand for Recipe View reference inventory'}
  }
  $rows=@($binding.tree.AllWindowRows($tree,$path));$targets=@();$window=0
  foreach($row in $rows){
   if($row.name -cmatch '^([0-9]{1,4})\s*:\s*'){$window=[int]$Matches[1];continue}
   if($window -lt 10 -or $window -gt 1999){continue}
   $match=[regex]::Match([string]$row.name,'(?:^|\s)(RV_[0-9]{1,5})(?:\s|$)')
   if($match.Success){$targets+=@{window_number=$window;object_id=$match.Groups[1].Value;raw_label=[string]$row.name}}
  }
  if(@($targets|Group-Object {([string]$_.window_number)+':'+$_.object_id}|Where-Object {$_.Count -ne 1}).Count){throw 'Duplicate native Recipe View target in directory inventory'}
  return [pscustomobject]@{targets=$targets;window_count=$headings.Count;scope='all_expanded_native_window_directory_rows';native_host_unavailable_reason=$nativeUnavailable}
 } finally {if($selected.restore_context){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $selected.restore_context}}
}

function Invoke-WeinviewRecipeViewReferenceRelink($Session,$Inventory,[string]$RecipeName,[string]$OldField,[string]$NewField,[string[]]$NewFields,[string]$ProjectSha,[string]$Prefix) {
 if($NewField -cnotin $NewFields -or $OldField -cin $NewFields){throw 'Renamed native Recipe definition field list required'}
 if(!$Session.recipe_view_fields){$Session.recipe_view_fields=@{}}
 $Session.recipe_view_fields[$RecipeName]=@($NewFields)
 $changed=@();$unrelated=@();$index=0
 foreach($target in @($Inventory.targets)){
  $index++;$null=Select-WeinviewWindow $Session ([int]$target.window_number)
  $original=$target.before_definition
  if(!$original -or $original.kind -cne 'recipe_view' -or $original.object_id -cne [string]$target.object_id){throw 'Definition-before Recipe View target record required'}
  $prepared=Read-WeinviewTargetObject $Session ([string]$target.object_id) $ProjectSha ($Prefix+'.target-'+$index+'.before') $true
  try {
   if($prepared.object.kind -cne 'recipe_view' -or [string]$prepared.object.recipe_name -cne [string]$original.recipe_name){throw 'Recipe View directory candidate or recipe identity changed'}
   if([string]$original.recipe_name -cne $RecipeName){$unrelated+=@{window_number=[int]$target.window_number;object_id=[string]$target.object_id;recipe_name=[string]$original.recipe_name};continue}
   $display=@($original.displayed_fields|ForEach-Object {if($_ -ceq $OldField){$NewField}else{[string]$_}})
   $sortBy=if([string]$original.sort_by -ceq $OldField){$NewField}else{[string]$original.sort_by}
   $sortEnabled=[bool]$original.sort_enabled;$sortDirection=[string]$original.sort_direction
   if(@($display|Where-Object {$_ -cnotin $NewFields}).Count -or $sortBy -cnotin $NewFields){throw 'Recipe View references an unrelated field absent from renamed definition'}
   $alreadyCurrent=(@($prepared.object.field_names) -join [char]31) -ceq ($NewFields -join [char]31) -and (@($prepared.object.displayed_fields) -join [char]31) -ceq ($display -join [char]31) -and [bool]$prepared.object.sort_enabled -eq $sortEnabled -and [string]$prepared.object.sort_by -ceq $sortBy -and [string]$prepared.object.sort_direction -ceq $sortDirection
   $after=$prepared.object;$nativeUpdateApplied=$false
   if(!$alreadyCurrent){
    $arguments=[pscustomobject]@{window_number=[int]$target.window_number;object_id=[string]$target.object_id;expected_object_sha256=[string]$prepared.object.object_sha256;display_fields=$display;sort_enabled=$sortEnabled;sort_by=$sortBy;sort_direction=$sortDirection}
    $applied=Invoke-WeinviewScreenTargetUpdate $Session $arguments $ProjectSha ($Prefix+'.target-'+$index+'.update') $null $prepared
    $after=$applied.object_after;$nativeUpdateApplied=$true;$prepared=$null
   }
   $changed+=@{window_number=[int]$target.window_number;object_id=[string]$target.object_id;before=$original;after=$after;display_field_replaced=($OldField -cin @($original.displayed_fields));sort_field_replaced=([string]$original.sort_by -ceq $OldField);native_update_applied=$nativeUpdateApplied}
  } finally {
   if($prepared -and $prepared.dialog -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $prepared.dialog.Hwnd -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $prepared.dialog $false;Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $prepared.restore_context}
  }
 }
 return [pscustomobject]@{inventory_scope=[string]$Inventory.scope;window_count=[int]$Inventory.window_count;candidate_count=@($Inventory.targets).Count;changed_count=$changed.Count;changed=$changed;unrelated=$unrelated}
}

function Assert-WeinviewRecipeViewReferencesReopened($Session,$Applied,[string]$ProjectSha,[string]$Prefix) {
 $proof=@();$index=0
 foreach($item in @($Applied.changed)){
  $index++;$null=Select-WeinviewWindow $Session ([int]$item.window_number)
  $actual=Read-WeinviewTargetObject $Session ([string]$item.object_id) $ProjectSha ($Prefix+'.target-'+$index)
  if([string]$actual.object.object_sha256 -cne [string]$item.after.object_sha256){throw 'Persisted Recipe View reference differs after native reopen'}
  $proof+=@{window_number=[int]$item.window_number;object_id=[string]$item.object_id;object_sha256=[string]$actual.object.object_sha256;object=$actual.object;verified=$true}
 }
 return [pscustomobject]@{verified=$true;target_count=$proof.Count;targets=$proof}
}

# Inspect the vendor's one-shot EBM export. A textual hit is a candidate for
# macro_update, never proof that replacing the spelling preserves macro logic.
function Invoke-WeinviewRecipeReferenceRewrite([string]$PythonExe,$Arguments,[string]$Prefix) {
 $request=$Prefix+'.request.json';$receipt=$Prefix+'.receipt.json'
 WritePrivateJson $request $Arguments
 $script=Join-Path $PSScriptRoot 'RecipeReferenceRewrite.py'
 if(!(Test-Path -LiteralPath $script -PathType Leaf) -or !(Test-Path -LiteralPath $PythonExe -PathType Leaf)){throw 'Bundled Recipe reference rewrite runtime required'}
 $output=& $PythonExe -B $script $request $receipt 2>&1
 if($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $receipt -PathType Leaf)){throw ('Recipe reference rewrite failed: '+($output -join ' '))}
 $answer=[IO.File]::ReadAllText($receipt,[Text.Encoding]::UTF8)|ConvertFrom-Json
 if(!$answer.ok){throw ('Recipe reference rewrite rejected source: '+$answer.message)}
 return $answer.result
}
function Get-WeinviewRecipeMacroReferenceCandidates($Session,[string]$RecipeName,[string]$OldField,[string]$NewField,[string]$Prefix,[string]$PythonExe) {
 if($OldField -cnotmatch '^[A-Za-z0-9_]{1,64}$'){throw 'Exact recipe field name required for macro candidate inventory'}
 $manager=Manager $Session
 $rows=ListRows $Session $manager
 $export=$null
 try {
  if($rows.Count){$export=Export-WeinviewMacroFile $Session $manager ([int]$rows[0].id) ([string]$rows[0].name) ($Prefix+'.macros')}
 } finally {
  $owned=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd -and $_.Enabled})
  if($owned.Count){Button $Session $manager 2 '离开';$null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true}} 10}
 }
 $null=$Session.native.ActivateOwnedMain($Session.main.Hwnd)
 if(!$rows.Count){return [pscustomobject]@{macro_count=0;candidates=@();planned_edits=@();unresolved=@();exported_macros=@();scope='all_native_exported_macros';dynamic_references_unknown=$true}}
 $files=@(Get-ChildItem -LiteralPath ($Prefix+'.macros') -File -Filter '*.ebm')
 if($files.Count -ne $rows.Count -or @($export.exported_macros).Count -ne $rows.Count){throw 'Native macro export inventory incomplete'}
 $candidates=@();$planned=@();$unresolved=@();$expression='(?<![A-Za-z0-9_])'+[regex]::Escape($OldField)+'(?![A-Za-z0-9_])'
 foreach($row in $rows){
  $matching=@($files|Where-Object {$_.Name -ceq ([string]$row.id+'_'+[string]$row.name+'.ebm')})
  if($matching.Count -ne 1){throw 'Unique native exported macro filename required'}
  $inspected=Invoke-WeinviewMacroCodec @{operation='ebm-inspect';input=$matching[0].FullName;expected_sha256=(Hash $matching[0].FullName)} ($Prefix+'.macro-'+[string]$row.id)
  if([int]$inspected.macro_id -ne [int]$row.id -or [string]$inspected.macro_name -cne [string]$row.name){throw 'Native macro inspect identity differs from directory'}
  $rewrite=Invoke-WeinviewRecipeReferenceRewrite $PythonExe @{operation='recipe-reference-rewrite';source=[string]$inspected.normalized_source;recipe_name=$RecipeName;old_field=$OldField;new_field=$NewField} ($Prefix+'.rewrite-'+[string]$row.id)
  foreach($miss in @($rewrite.unresolved)){$unresolved+=@{macro_id=[int]$row.id;macro_name=[string]$row.name;line=[int]$miss.line;reason=[string]$miss.reason}}
  if($rewrite.source_changed){
   $prepared=Invoke-WeinviewMacroCodec @{operation='ebm-prepare';output=$Prefix+'.candidate-'+[string]$row.id+'.ebm';macro_id=[int]$row.id;macro_name=[string]$row.name;source=[string]$rewrite.source;base=$matching[0].FullName;expected_sha256=[string]$inspected.ebm_sha256;expected_source_sha256=[string]$inspected.macro_source_sha256} ($Prefix+'.prepare-'+[string]$row.id)
   $planned+=@{macro_id=[int]$row.id;macro_name=[string]$row.name;before_source_sha256=[string]$inspected.macro_source_sha256;after_source_sha256=[string]$prepared.macro_source_sha256;candidate_ebm_path=[string]$prepared.output_path;candidate_ebm_sha256=[string]$prepared.ebm_sha256;edits=@($rewrite.edits)}
  }
  $lines=@(([string]$inspected.normalized_source) -split "`n")
  for($i=0;$i -lt $lines.Count;$i++){
   if($lines[$i] -cnotmatch $expression){continue}
   if($candidates.Count -ge 1000){throw 'Recipe macro candidate inventory exceeds bounded result'}
   $candidates+=@{macro_id=[int]$row.id;macro_name=[string]$row.name;macro_source_sha256=[string]$inspected.macro_source_sha256;line=$i+1;text=if($lines[$i].Length -gt 1024){$lines[$i].Substring(0,1024)}else{$lines[$i]};classification='textual_candidate_requires_source_review'}
  }
 }
 return [pscustomobject]@{macro_count=$rows.Count;candidates=$candidates;planned_edits=$planned;unresolved=$unresolved;exported_macros=@($export.exported_macros);scope='all_native_exported_macros';dynamic_references_unknown=$true}
}

function Import-WeinviewRecipeMacroReferences($Session,$Plan) {
 $planned=@($Plan.planned_edits)
 if(!$planned.Count){return [pscustomobject]@{changed_count=0;imports=@();native_import_verified=$true}}
 $manager=Manager $Session;$imports=@()
 try {
  foreach($item in $planned){
   if((Hash ([string]$item.candidate_ebm_path)) -cne [string]$item.candidate_ebm_sha256){throw 'Prepared recipe-reference EBM changed before native import'}
   $applied=Import-WeinviewMacroFile $Session $manager ([string]$item.candidate_ebm_path) ([Nullable[int]][int]$item.macro_id) ([string]$item.macro_name)
   $imports+=@{macro_id=[int]$item.macro_id;macro_name=[string]$item.macro_name;before_source_sha256=[string]$item.before_source_sha256;after_source_sha256=[string]$item.after_source_sha256;native_import_verified=[bool]$applied.native_import_verified;static_edit_count=@($item.edits).Count}
  }
 } finally {
  $owned=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd -and $_.Enabled})
  if($owned.Count){Button $Session $manager 2 '离开';$null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true}} 10}
 }
 return [pscustomobject]@{changed_count=$imports.Count;imports=$imports;native_import_verified=$true}
}

function Assert-WeinviewRecipeMacroReferencesReopened($Session,$Plan,[string]$Prefix) {
 $expected=@($Plan.exported_macros);$changed=@($Plan.planned_edits)
 if(!$expected.Count){return [pscustomobject]@{verified=$true;macro_count=0;changed_count=0;macros=@()}}
 $manager=Manager $Session
 try {$export=Export-WeinviewMacroFile $Session $manager ([int]$expected[0].macro_id) ([string]$expected[0].macro_name) ($Prefix+'.macros')}
 finally {
  $owned=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd -and $_.Enabled})
  if($owned.Count){Button $Session $manager 2 '离开';$null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $manager.Hwnd}).Count){return $true}} 10}
 }
 $observed=@($export.exported_macros)
 if($observed.Count -ne $expected.Count){throw 'Reopened native macro catalog changed count after recipe rename'}
 $proof=@()
 foreach($prior in $expected){
  $matches=@($observed|Where-Object {$_.macro_id -eq $prior.macro_id -and $_.macro_name -ceq $prior.macro_name})
  if($matches.Count -ne 1){throw 'Reopened native macro identity changed after recipe rename'}
  $edit=@($changed|Where-Object {$_.macro_id -eq $prior.macro_id})
  if($edit.Count -gt 1){throw 'Duplicate recipe macro rewrite target'}
  if(!$edit.Count){
   if([string]$matches[0].ebm_sha256 -cne [string]$prior.ebm_sha256){throw 'Unrelated native macro changed after recipe rename'}
   continue
  }
  $file=Join-Path ($Prefix+'.macros') ([string]$prior.macro_id+'_'+[string]$prior.macro_name+'.ebm')
  $inspected=Invoke-WeinviewMacroCodec @{operation='ebm-inspect';input=$file;expected_sha256=(Hash $file)} ($Prefix+'.inspect-'+[string]$prior.macro_id)
  if([string]$inspected.macro_source_sha256 -cne [string]$edit[0].after_source_sha256){throw 'Reopened native recipe macro source differs from static relink'}
  $proof+=@{macro_id=[int]$prior.macro_id;macro_name=[string]$prior.macro_name;source_sha256=[string]$inspected.macro_source_sha256;ebm_sha256=[string]$matches[0].ebm_sha256;verified=$true}
 }
 return [pscustomobject]@{verified=$true;macro_count=$observed.Count;changed_count=$proof.Count;macros=$proof}
}

