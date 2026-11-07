# Definitions only. Reuses the existing EBM/CSV/XLS exchange helpers.
# Worker owns saving, optional compilation/reopen, and process cleanup.
function New-WeinviewProjectBatchPlan($Arguments,[string]$Prefix,[string]$WorkspaceRoot) {
 $allowed=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','steps','compile','selected_languages','startup_language','expected_language_mode_map','screen_completion_mode','editor_session_mode','editor_session_id','close_editor')
 $continuous=($Arguments.editor_session_mode -ceq 'reuse')
 if($Arguments.PSObject.Properties.Name -ccontains 'editor_session_mode' -and !$continuous){throw 'Unsupported editor session mode.'}
 if($Arguments.PSObject.Properties.Name -ccontains 'editor_session_id' -and (!$continuous -or $Arguments.editor_session_id -isnot [string] -or $Arguments.editor_session_id -cnotmatch '^[a-f0-9]{32}$')){throw 'A returned editor session ID is required.'}
 if($Arguments.PSObject.Properties.Name -ccontains 'close_editor' -and (!$continuous -or $Arguments.close_editor -isnot [bool])){throw 'close_editor must be Boolean in an editor session.'}
 if(@($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowed}).Count -or $Arguments.steps -isnot [array]){throw 'Typed batch steps required.'}
 if(!$continuous -and $Arguments.steps.Count -lt 2){throw 'Batch requires at least two reviewed steps.'}
 if($continuous -and !$Arguments.steps.Count -and (!$Arguments.editor_session_id -or ($Arguments.compile -ne $true -and $Arguments.close_editor -ne $true))){throw 'An empty batch may only compile or close an existing editor session.'}
 if($Arguments.PSObject.Properties.Name -ccontains 'compile' -and $Arguments.compile -isnot [bool]){throw 'Optional batch compile must be Boolean.'}
 if($Arguments.PSObject.Properties.Name -ccontains 'screen_completion_mode' -and ($Arguments.screen_completion_mode -isnot [string] -or $Arguments.screen_completion_mode -cne 'save')){throw 'Unsupported internal screen completion mode.'}
 $hasSelected=$Arguments.PSObject.Properties.Name -ccontains 'selected_languages';$hasStartup=$Arguments.PSObject.Properties.Name -ccontains 'startup_language';$hasExpectedMap=$Arguments.PSObject.Properties.Name -ccontains 'expected_language_mode_map'
 if($hasSelected -ne $hasStartup -or ($hasExpectedMap -and !$hasSelected)){throw 'Selected/startup languages must be paired, and expected language mapping requires both.'}
 if(($hasSelected -or $hasExpectedMap) -and $Arguments.compile -ne $true){throw 'Language selection requires explicit compile:true.'}
 if($hasSelected){
  if($Arguments.selected_languages -isnot [array] -or $Arguments.selected_languages.Count -lt 1 -or $Arguments.selected_languages.Count -gt 24){throw 'One to twenty-four selected language slots required.'}
  $selectedSlots=[Collections.Generic.HashSet[int]]::new()
  foreach($slot in $Arguments.selected_languages){if(($slot -isnot [int] -and $slot -isnot [long]) -or $slot -lt 1 -or $slot -gt 24 -or !$selectedSlots.Add([int]$slot)){throw 'Distinct integer selected language slots 1..24 required.'}}
  if(($Arguments.startup_language -isnot [int] -and $Arguments.startup_language -isnot [long]) -or !$selectedSlots.Contains([int]$Arguments.startup_language)){throw 'Startup language must be one of the selected slots.'}
 }
 if($hasExpectedMap){
  if($Arguments.expected_language_mode_map -isnot [array] -or $Arguments.expected_language_mode_map.Count -ne $Arguments.selected_languages.Count){throw 'Expected language mapping must cover every selected slot.'}
  $mappedSlots=[Collections.Generic.HashSet[int]]::new()
  foreach($entry in $Arguments.expected_language_mode_map){
   if($entry -isnot [pscustomobject] -or @($entry.PSObject.Properties.Name|Where-Object {$_ -cnotin @('language_slot','lw9134_value')}).Count -or @($entry.PSObject.Properties.Name).Count -ne 2 -or ($entry.language_slot -isnot [int] -and $entry.language_slot -isnot [long]) -or ($entry.lw9134_value -isnot [int] -and $entry.lw9134_value -isnot [long]) -or !$selectedSlots.Contains([int]$entry.language_slot) -or $entry.lw9134_value -lt 0 -or $entry.lw9134_value -ge $Arguments.selected_languages.Count -or !$mappedSlots.Add([int]$entry.language_slot)){throw 'Expected language mapping must contain the selected slots and bounded native mode values.'}
  }
 }
 $single=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 $tagNames=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
 $macroIds=[Collections.Generic.HashSet[int]]::new();$plan=[Collections.Generic.List[object]]::new();$index=0
 $updateBaselines=@{}
 $newWindowNames=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 foreach($step in $Arguments.steps){
  if($step -isnot [pscustomobject]){throw 'Typed batch step required.'}
  $kind=[string]$step.kind;$fields=@('kind');$state=@{kind=$kind;index=$index;request=$step;prefix=($Prefix+'.'+$index)}
  switch -CaseSensitive ($kind) {
   {$_ -cin @('macro_add','macro_update')} {
    $fields+=@('macro_id','macro_name','source','execution');if($kind -ceq 'macro_update'){$fields+='expected_macro_source_sha256'}
    if(($step.macro_id -isnot [int] -and $step.macro_id -isnot [long]) -or $step.macro_id -lt 0 -or $step.macro_id -gt 254 -or !$macroIds.Add([int]$step.macro_id) -or $macroIds.Count -gt 8){throw 'At most eight unique macro IDs 0..254 required.'}
    if($step.macro_name -isnot [string] -or !$step.macro_name -or $step.macro_name.Length -gt 64 -or $step.macro_name -match '[\x00-\x1f\x7f]' -or $step.source -isnot [string] -or !$step.source -or [Text.Encoding]::UTF8.GetByteCount($step.source) -gt 65536 -or $step.source.Contains([string][char]0)){throw 'Bounded macro name and source required.'}
    if($kind -ceq 'macro_update' -and $step.PSObject.Properties.Name -ccontains 'expected_macro_source_sha256' -and $step.expected_macro_source_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Optional existing macro source hash must be SHA256.'}
   }
   'tags_upsert' {
    $fields+=@('expected_tags_sha256','tags');if(!$single.Add($kind) -and !$continuous){throw 'Multiple tag groups require a continuous editor batch.'}
    $state.rows=New-WeinviewTagRequests ([pscustomobject]@{expected_tags_sha256=('0'*64);tags=$step.tags})
    foreach($row in $state.rows){if(!$tagNames.Add([string]$row.name)){throw 'A tag name may only be written once in a batch.'}}
   }
   'labels_upsert' {
    $fields+='labels';if(!$single.Add($kind) -or $single.Contains('labels_bind')){throw 'One labels step and no same-batch label binding required.'}
    if($step.labels -isnot [array] -or $step.labels.Count -lt 1 -or $step.labels.Count -gt 1000){throw 'One to 1000 typed labels required.'}
    $names=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach($label in $step.labels){
     if($label -isnot [pscustomobject] -or @($label.PSObject.Properties.Name|Where-Object {$_ -cnotin @('name','states')}).Count -or @($label.PSObject.Properties.Name|Where-Object {$_ -cin @('name','states')}).Count -ne 2){throw 'Typed label name and states required.'}
     if($label.name -isnot [string] -or $label.name -cnotmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$' -or !$names.Add($label.name)){throw 'Unique bounded label name required.'}
     if($label.states -isnot [array] -or $label.states.Count -lt 1 -or $label.states.Count -gt 8){throw 'One to eight typed label states required.'}
     $numbers=[Collections.Generic.HashSet[int]]::new()
     foreach($entry in $label.states){
      if($entry -isnot [pscustomobject] -or @($entry.PSObject.Properties.Name|Where-Object {$_ -cnotin @('state','texts')}).Count -or @($entry.PSObject.Properties.Name|Where-Object {$_ -cin @('state','texts')}).Count -ne 2){throw 'Typed label state and texts required.'}
      if(($entry.state -isnot [int] -and $entry.state -isnot [long]) -or [long]$entry.state -lt 0 -or [long]$entry.state -gt 7 -or !$numbers.Add([int]$entry.state)){throw 'Unique label states 0..7 required.'}
      if($entry.texts -isnot [array] -or $entry.texts.Count -lt 1 -or $entry.texts.Count -gt 24){throw 'One to 24 label language texts required.'}
      foreach($value in $entry.texts){if($null -ne $value -and ($value -isnot [string] -or $value.Length -gt 1024 -or $value -match '[\x00-\x08\x0B\x0C\x0E-\x1F]')){throw 'Bounded label text or null required.'}}
     }
    }
   }
   'labels_bind' {
    $fields+='bindings';if($single.Contains('labels_upsert')){throw 'Batch label import and binding require separate saved sessions.'}
    $null=$single.Add($kind)
    if($step.bindings -isnot [array] -or $step.bindings.Count -lt 1 -or $step.bindings.Count -gt 16){throw 'One to sixteen typed Text bindings required.'}
    $bindingKeys=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach($binding in $step.bindings){
     if($binding -isnot [pscustomobject] -or @($binding.PSObject.Properties.Name|Where-Object {$_ -cnotin @('window_number','object_id','label_name','expected_object_sha256','source_step')}).Count){throw 'Typed native Text binding fields required.'}
     if(($binding.window_number -isnot [int] -and $binding.window_number -isnot [long]) -or [long]$binding.window_number -lt 10 -or [long]$binding.window_number -gt 1999 -or $binding.object_id -isnot [string] -or $binding.object_id -cnotmatch '^TX_[0-9]+$' -or $binding.label_name -isnot [string] -or $binding.label_name -cnotmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$'){throw 'Exact ordinary window, Text ID and label name required.'}
     if($binding.PSObject.Properties.Name -ccontains 'expected_object_sha256' -and ($binding.expected_object_sha256 -isnot [string] -or $binding.expected_object_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$')){throw 'Optional Text object SHA must be SHA256.'}
     $sourceKey='direct'
     if($binding.PSObject.Properties.Name -ccontains 'source_step'){
      if($binding.object_id -cnotmatch '^TX_[0-9]+$' -or ($binding.source_step -isnot [int] -and $binding.source_step -isnot [long]) -or [long]$binding.source_step -lt 0 -or [long]$binding.source_step -ge $index){throw 'Text binding source_step requires earlier copy and original TX ID.'}
      $sourceState=$plan[[int]$binding.source_step]
      if($sourceState.kind -cne 'screen_copy_objects' -or [int]$sourceState.window_number -ne [int]$binding.window_number){throw 'Text binding source_step must reference earlier same-window copy.'}
      if($null -ne $sourceState.object_copy_contract.object_ids -and @($sourceState.object_copy_contract.object_ids|Where-Object {$_ -ceq $binding.object_id}).Count -ne 1){throw 'Text binding original ID absent from referenced copy selection.'}
      $sourceKey=[string][int]$binding.source_step
     }
     if(!$bindingKeys.Add($sourceKey+':'+[string]$binding.window_number+':'+[string]$binding.object_id)){throw 'Duplicate Text binding target in batch step.'}
    }
    $state.binding_windows=@($step.bindings|ForEach-Object {[int]$_.window_number}|Select-Object -Unique)
   }
   'events_append' {
    $fields+=@('expected_events_sha256','events');if(!$single.Add($kind)){throw 'One events step per batch required.'}
    $null=New-WeinviewEventRequests ([pscustomobject]@{expected_events_sha256=('0'*64);events=$step.events}) -StructureOnly
    $state.items=$step.events
    $state.address_required=(@($step.events|Where-Object {$_.PSObject.Properties.Name -ccontains 'tag_name' -or $_.PSObject.Properties.Name -ccontains 'device'}).Count -gt 0)
   }
   'sampling_append' {
    $fields+=@('expected_sampling_sha256','objects');if(!$single.Add($kind)){throw 'One sampling step per batch required.'}
    if($step.objects -isnot [array] -or $step.objects.Count -lt 1 -or $step.objects.Count -gt 8){throw 'One to eight Sampling objects required.'}
    $names=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach($item in $step.objects){if($item -isnot [pscustomobject]){throw 'Typed Sampling object required.'};$null=Assert-WeinviewSamplingCsvObject $item -StructureOnly;if(!$names.Add($item.description)){throw 'Unique Sampling descriptions required.'}}
    $state.items=$step.objects
    $state.address_required=(@($step.objects|Where-Object {$_.PSObject.Properties.Name -ccontains 'tag_name'}).Count -gt 0)
   }
   {$_ -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add')} {
    $fields+=@('window_number','objects')
    $objectLimit=if($kind -ceq 'screen_add_common_objects'){64}else{8}
    if($step.objects -isnot [array] -or $step.objects.Count -lt 1 -or $step.objects.Count -gt $objectLimit){throw "Screen addition requires one to $objectLimit typed objects."}
    foreach($item in $step.objects){if($item -isnot [pscustomobject]){throw 'Typed screen addition object required.'}}
    if($kind -ceq 'screen_add_common_objects'){
     $rectangles=@($step.objects|Where-Object {$_.kind -ceq 'rectangle'})
     if($rectangles.Count){$null=Assert-WeinviewCommonObjectsInputs -Objects $rectangles}
    }
    $state.items=$step.objects
   }
   'recipe_view_add' {
    $fields+=@('window_number','recipe_name','display_fields','x','y','sort_enabled','sort_by','sort_direction')
    if($step.recipe_name -isnot [string] -or $step.recipe_name -cnotmatch '^[A-Za-z0-9]{1,64}$' -or $step.display_fields -isnot [array] -or $step.display_fields.Count -lt 1 -or $step.display_fields.Count -gt 1000){throw 'Typed Recipe View name and display fields required.'}
    if(($step.x -isnot [int] -and $step.x -isnot [long]) -or ($step.y -isnot [int] -and $step.y -isnot [long])){throw 'Typed Recipe View placement required.'}
    if(($step.PSObject.Properties.Name -ccontains 'sort_enabled') -and $step.sort_enabled -isnot [bool]){throw 'Typed Recipe View sort_enabled required.'}
    if(($step.PSObject.Properties.Name -ccontains 'sort_by') -and ($step.sort_by -isnot [string] -or [string]::IsNullOrWhiteSpace($step.sort_by) -or $step.sort_by.Length -gt 128)){throw 'Typed Recipe View sort_by required.'}
    if(($step.PSObject.Properties.Name -ccontains 'sort_direction') -and $step.sort_direction -cnotin @('ascending','descending')){throw 'Typed Recipe View sort_direction required.'}
   }
   'screen_update' {
      $fields+=@('window_number','object_id','source_step','source_object_index','expected_object_sha256','rect','filled','corner','description','device_name','address_type','address','mode','options','tag_name','data_type','integer_digits','decimal_digits','minimum','maximum','pixel_spacing','line_width','operation_mode','target_window','function_action','media','import_mode','delete_after_import','off_label','on_label','label','label_font','label_size','numeric_font','numeric_size','numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb','use_shape','use_picture','text','position','font_size','font','alignment','use_object_heading','channel_y_axes','y_axis_options','security_class','recipe_name','display_fields','sort_enabled','sort_by','sort_direction')
     $newObjectReference=$step.PSObject.Properties.Name -ccontains 'source_object_index'
     if($newObjectReference){
      if($step.PSObject.Properties.Name -ccontains 'object_id' -or $step.PSObject.Properties.Name -cnotcontains 'source_step' -or ($step.source_object_index -isnot [int] -and $step.source_object_index -isnot [long]) -or [long]$step.source_object_index -lt 0){throw 'New object reference requires source_step and a nonnegative source_object_index, without object_id.'}
     }elseif($step.object_id -isnot [string] -or $step.object_id -cnotmatch '^(ND|NE|FK|TS|BL|TX|DW|RV|TD|OL|GP|AL)_[0-9]+$'){throw 'Existing or copied screen target ID required.'}
    if($step.PSObject.Properties.Name -ccontains 'source_step'){
     if(($step.source_step -isnot [int] -and $step.source_step -isnot [long]) -or [long]$step.source_step -lt 0 -or [long]$step.source_step -ge $index){throw 'Batch screen update source_step must be an earlier zero-based step.'}
     $sourceState=$plan[[int]$step.source_step]
      if([int]$sourceState.window_number -ne [int]$step.window_number){throw 'Batch screen update source_step must reference the same window.'}
      if($newObjectReference){
       if($sourceState.kind -cnotin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','recipe_view_add')){throw 'source_object_index requires an earlier native object addition.'}
       $sourceCount=if($sourceState.kind -ceq 'recipe_view_add'){1}else{@($sourceState.items).Count}
       if([long]$step.source_object_index -ge $sourceCount){throw 'source_object_index is outside the earlier addition request.'}
       $state.source_object_index=[int]$step.source_object_index
      }else{
       if($sourceState.kind -cne 'screen_copy_objects'){throw 'Referenced native source ID requires an earlier object copy.'}
       if($null -ne $sourceState.object_copy_contract.object_ids -and @($sourceState.object_copy_contract.object_ids|Where-Object {$_ -ceq $step.object_id}).Count -ne 1){throw 'Batch screen update source ID absent from referenced copy selection.'}
       $state.source_object_id=[string]$step.object_id
      }
      $state.source_step=[int]$step.source_step
    }
    if($step.PSObject.Properties.Name -ccontains 'expected_object_sha256'){
     if($step.expected_object_sha256 -isnot [string] -or $step.expected_object_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Optional screen target object SHA must be SHA256 when supplied.'}
    }
    if($null -eq $state.source_step){
     $targetKey=[string]$step.window_number+':'+$step.object_id
     $state.repeated_update=$updateBaselines.ContainsKey($targetKey)
     if(!$state.repeated_update){$updateBaselines[$targetKey]=$true}
    }
     if(@($step.PSObject.Properties.Name|Where-Object {$_ -cnotin @('kind','window_number','object_id','source_step','source_object_index','expected_object_sha256')}).Count -lt 1){throw 'Screen update requires at least one change.'}
   }
   'screen_duplicate' {
    $fields+=@('window_number','object_id','source_step','columns','rows','x_spacing','y_spacing','address_offset')
    if($step.object_id -isnot [string] -or $step.object_id -cnotmatch '^[A-Z]+_[0-9]{1,5}$'){throw 'Exact native seed object ID required for batch Multi Copy.'}
    if($step.PSObject.Properties.Name -ccontains 'source_step'){
     if(($step.source_step -isnot [int] -and $step.source_step -isnot [long]) -or [long]$step.source_step -lt 0 -or [long]$step.source_step -ge $index){throw 'Batch Multi Copy source_step must be an earlier zero-based step.'}
     $sourceState=$plan[[int]$step.source_step]
     if($sourceState.kind -cne 'screen_copy_objects' -or [int]$sourceState.window_number -ne [int]$step.window_number){throw 'Batch Multi Copy source_step must reference an earlier object copy into the same target window.'}
     if($null -ne $sourceState.object_copy_contract.object_ids -and @($sourceState.object_copy_contract.object_ids|Where-Object {$_ -ceq $step.object_id}).Count -ne 1){throw 'Batch Multi Copy source object_id absent from referenced object-copy selection.'}
     $state.source_step=[int]$step.source_step;$state.source_object_id=[string]$step.object_id
    }
    foreach($field in @('columns','rows','x_spacing','y_spacing','address_offset')){if(($step.$field -isnot [int] -and $step.$field -isnot [long]) -or [long]$step.$field -lt [int]::MinValue -or [long]$step.$field -gt [int]::MaxValue){throw ('Batch Multi Copy Int32 field required: '+$field)}}
    if([int]$step.columns -lt 1 -or [int]$step.rows -lt 1 -or [long]$step.columns*[long]$step.rows -lt 2 -or [long]$step.columns*[long]$step.rows -gt [int]::MaxValue){throw 'Batch Multi Copy matrix must contain two to Int32.MaxValue cells.'}
   }
   'screen_copy_objects' {
    $fields+=@('window_number','translation','object_ids','source_step','donor_path','expected_donor_sha256','donor_window_number','address_replacements')
    if($step.PSObject.Properties.Name -ccontains 'source_step'){
     if(($step.source_step -isnot [int] -and $step.source_step -isnot [long]) -or [long]$step.source_step -lt 0 -or [long]$step.source_step -ge $index){throw 'Batch object copy source_step must be an earlier zero-based step.'}
     if(@($step.PSObject.Properties.Name|Where-Object {$_ -cin @('donor_path','expected_donor_sha256','donor_window_number','address_replacements')}).Count){throw 'Referenced batch object copy cannot specify donor or address replacements.'}
     $sourceState=$plan[[int]$step.source_step]
     if($sourceState.kind -cne 'screen_copy_objects' -or [int]$sourceState.window_number -ne [int]$step.window_number){throw 'Batch object copy source_step must reference earlier copy into the same window.'}
     if($null -ne $sourceState.source_step -and $step.PSObject.Properties.Name -ccontains 'object_ids'){throw 'Chained batch object copy must select all previous additions.'}
     $state.source_step=[int]$step.source_step
    }
    $copyValues=@{project_path=[string]$Arguments.project_path;output_path=[string]$Arguments.output_path;expected_project_sha256=[string]$Arguments.expected_project_sha256;window_number=$step.window_number}
    if($step.PSObject.Properties.Name -ccontains 'translation'){$copyValues.translation=$step.translation}
    if($step.PSObject.Properties.Name -ccontains 'object_ids'){$copyValues.object_ids=$step.object_ids}
    if(@($step.PSObject.Properties.Name|Where-Object {$_ -cin @('donor_path','expected_donor_sha256','donor_window_number')}).Count){
     foreach($field in @('donor_path','expected_donor_sha256','donor_window_number')){if($step.PSObject.Properties.Name -cnotcontains $field){throw 'Batch external object-copy donor requires all three donor fields.'}}
     $copyValues.donor_path=Under ([string]$step.donor_path) $WorkspaceRoot
     $copyValues.expected_donor_sha256=$step.expected_donor_sha256
     $copyValues.donor_window_number=$step.donor_window_number
    }
    if($step.PSObject.Properties.Name -ccontains 'address_replacements'){
     if(!$copyValues.ContainsKey('donor_path')){throw 'Batch screen_copy_objects address_replacements require an external donor.'}
     $copyValues.address_replacements=$step.address_replacements
    }
    $state.object_copy_arguments=[pscustomobject]$copyValues
    $state.object_copy_contract=Assert-WeinviewObjectCopyArguments $state.object_copy_arguments
    if($null -ne $state.source_step -and $null -ne $state.object_copy_contract.object_ids -and $null -ne $sourceState.object_copy_contract.object_ids){
     $sourceSet=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
     foreach($id in @($sourceState.object_copy_contract.object_ids)){$null=$sourceSet.Add([string]$id)}
     foreach($id in @($state.object_copy_contract.object_ids)){if(!$sourceSet.Contains([string]$id)){throw 'Referenced batch object copy source ID absent from earlier copy selection.'}}
    }
   }
   'screen_move_objects' {
    $fields+=@('window_number','translation','object_ids','source_step')
    $moveValues=@{project_path=[string]$Arguments.project_path;output_path=[string]$Arguments.output_path;expected_project_sha256=[string]$Arguments.expected_project_sha256;window_number=$step.window_number}
    if($step.PSObject.Properties.Name -ccontains 'translation'){$moveValues.translation=$step.translation}
    if($step.PSObject.Properties.Name -ccontains 'object_ids'){$moveValues.object_ids=$step.object_ids}
    $state.object_move_contract=Assert-WeinviewObjectMoveArguments ([pscustomobject]$moveValues)
    if($step.PSObject.Properties.Name -ccontains 'source_step'){
     if(($step.source_step -isnot [int] -and $step.source_step -isnot [long]) -or [long]$step.source_step -lt 0 -or [long]$step.source_step -ge $index){throw 'Batch object move source_step must be an earlier zero-based step.'}
     $sourceState=$plan[[int]$step.source_step]
     if($sourceState.kind -cne 'screen_copy_objects' -or [int]$sourceState.window_number -ne [int]$step.window_number){throw 'Batch object move source_step must reference earlier copy into the same window.'}
     if($null -ne $state.object_move_contract.object_ids -and $null -ne $sourceState.object_copy_contract.object_ids){
      $sourceSet=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
      foreach($id in @($sourceState.object_copy_contract.object_ids)){$null=$sourceSet.Add([string]$id)}
      foreach($id in @($state.object_move_contract.object_ids)){if(!$sourceSet.Contains([string]$id)){throw 'Batch object move source ID absent from referenced copy selection.'}}
     }
     $state.source_step=[int]$step.source_step
    }
   }
   'project_replace_address' {
    $fields+=@('address_kind','device_name','address_type','address','address_end','target_device_name','target_address_type','target_address','scope','window_number','expected_match_count')
    $values=@{project_path=[string]$Arguments.project_path;output_path=[string]$Arguments.output_path;expected_project_sha256=[string]$Arguments.expected_project_sha256}
    foreach($field in $fields|Where-Object {$_ -cne 'kind'}){if($step.PSObject.Properties.Name -ccontains $field){$values[$field]=$step.$field}}
    $state.address_arguments=[pscustomobject]$values
    $state.address_contract=Assert-WeinviewAddressReplaceArguments $state.address_arguments
   }
   'window_create' {
    if(!$continuous){throw 'Batch window creation requires continuous editor mode.'}
    $fields+=@('name','expected_window_set_sha256')
    if($step.name -isnot [string]){throw 'Native window name must be a string.'}
    Assert-WeinviewWindowName ([string]$step.name)
    if(!$newWindowNames.Add([string]$step.name)){throw 'New native window names must be unique within the batch.'}
    if($step.PSObject.Properties.Name -ccontains 'expected_window_set_sha256' -and ($step.expected_window_set_sha256 -isnot [string] -or $step.expected_window_set_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$')){throw 'Optional native window-directory hash must be SHA256.'}
   }
   'window_copy' {
    $fields+=@('donor_path','expected_donor_sha256','source_start','source_end','destination_start','copy_macros','copy_events','copy_underlay')
    if($step.donor_path -isnot [string] -or [string]::IsNullOrWhiteSpace($step.donor_path) -or $step.expected_donor_sha256 -isnot [string] -or $step.expected_donor_sha256 -cnotmatch '^[0-9a-fA-F]{64}$'){throw 'Pinned native window-copy donor path and hash required.'}
    foreach($field in @('source_start','source_end','destination_start')){if($step.$field -isnot [int] -and $step.$field -isnot [long]){throw ('Native window-copy integer field required: '+$field)}}
    foreach($field in @('copy_macros','copy_events','copy_underlay')){if($step.$field -isnot [bool]){throw ('Native window-copy Boolean field required: '+$field)}}
    if($step.copy_macros -or $step.copy_events){throw 'Batch native window copy does not copy donor macros or events.'}
    $count=[long]$step.source_end-[long]$step.source_start+1
    if($step.source_start -lt 10 -or $step.source_start -gt 1999 -or $step.source_end -gt 1999 -or $count -lt 1 -or $count -gt 1990 -or $step.destination_start -lt 10 -or $step.destination_start -gt 1999 -or [long]$step.destination_start+$count-1 -gt 1999){throw 'Bounded contiguous ordinary native window-copy range required.'}
    $donor=Under ([string]$step.donor_path) $WorkspaceRoot
    $state.copy_arguments=[pscustomobject]@{donor_path=$donor;expected_donor_sha256=[string]$step.expected_donor_sha256;source_start=[int]$step.source_start;source_end=[int]$step.source_end;destination_start=[int]$step.destination_start;copy_macros=$false;copy_events=$false;copy_underlay=[bool]$step.copy_underlay}
   }
   default {throw 'Unknown batch step kind.'}
  }
  if($kind -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update','screen_duplicate','screen_copy_objects','screen_move_objects')){
   if(($step.window_number -isnot [int] -and $step.window_number -isnot [long]) -or $step.window_number -lt 10 -or $step.window_number -gt 1999){throw 'Exact ordinary screen step window_number required.'}
   $state.window_number=[int]$step.window_number
   if($kind -ceq 'screen_add_window_buttons'){
    foreach($item in $step.objects){if([string]$item.function_action -cne 'import_user_accounts' -and ($item.target_window -is [int] -or $item.target_window -is [long]) -and $item.target_window -eq $state.window_number){throw '不能切换到当前基本窗口，当前页导航请用文本/静态高亮；目标需为其他已存在页'}}
   }
  }
  if(@($step.PSObject.Properties.Name|Where-Object {$_ -cnotin $fields}).Count){throw 'Unreviewed batch step field.'}
  foreach($field in @('expected_tags_sha256','expected_events_sha256','expected_sampling_sha256')){if($step.PSObject.Properties.Name -ccontains $field -and $step.$field -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Optional native snapshot hash must be SHA256.'}}
  $plan.Add($state);$index++
 }
 return ,$plan.ToArray()
}
function Get-WeinviewBatchCaptionObjects($State,$Plan) {
 # Keep request/step indexes stable. Only unreferenced static captions can be
 # owned by an identically styled navigation control in this same batch.
 $State.caption_ownership=@()
 $items=@($State.items)
 if($env:PLCCODE_WEINVIEW_CAPTION_OWNERSHIP -cne '1'){return $items}
 if(@($Plan|Where-Object {$null -ne $_.source_step -and [int]$_.source_step -eq [int]$State.index}).Count){return $items}
 $buttons=@(foreach($candidate in $Plan){
  if($candidate.kind -cne 'screen_add_window_buttons' -or [int]$candidate.window_number -ne [int]$State.window_number -or [int]$candidate.index -le [int]$State.index){continue}
  if(@($Plan|Where-Object {$null -ne $_.source_step -and [int]$_.source_step -eq [int]$candidate.index}).Count){continue}
  $buttonIndex=0
  foreach($button in @($candidate.request.objects)){
   if(!$button.function_action){[pscustomobject]@{step=[int]$candidate.index;index=$buttonIndex;item=$button}}
   $buttonIndex++
  }
 })
 $kept=[Collections.Generic.List[object]]::new();$objectIndex=0
 foreach($item in $items){
  $matches=@()
  if($item.kind -ceq 'text' -and $item.font -and $item.font_size -and @($item.position).Count -eq 2){
   $matches=@(foreach($candidate in $buttons){
    $button=$candidate.item;$rect=@($button.rect)
    if($rect.Count -ne 4 -or $item.text -cne $button.label -or $item.font -cne $button.label_font -or [int]$item.font_size -ne [int]$button.label_size){continue}
    if((@($item.text_rgb) -join ',') -cne (@($button.off_text_rgb) -join ',')){continue}
    if($item.position[0] -ge $rect[0] -and $item.position[0] -lt ($rect[0]+$rect[2]) -and $item.position[1] -ge $rect[1] -and $item.position[1] -lt ($rect[1]+$rect[3])){$candidate}
   })
  }
  if($matches.Count -eq 1){
   $State.caption_ownership+=,[pscustomobject]@{requested_object_index=$objectIndex;text=$item.text;owner_step=$matches[0].step;owner_object_index=$matches[0].index;reason='identical_static_caption_inside_navigation_button'}
  }else{$kept.Add($item)}
  $objectIndex++
 }
 return $kept.ToArray()
}
function Copy-WeinviewBatchObjectCopyDonorPayload($Donor) {
 $snapshots=@(foreach($snapshot in @($Donor.address_snapshots)){
  $copy=[pscustomobject]@{key=[string]$snapshot.key;arguments=$snapshot.arguments;contract=$snapshot.contract;target=[bool]$snapshot.target;before_ids=[string[]]@($snapshot.before_ids);donor_source_ids=[string[]]@($snapshot.donor_source_ids)}
  foreach($field in @('before_references','donor_source_references')){
   if($snapshot.PSObject.Properties.Name -ccontains $field){$copy|Add-Member -NotePropertyName $field -NotePropertyValue @(foreach($reference in @($snapshot.$field)){[pscustomobject]@{object_id=[string]$reference.object_id;address=[string]$reference.address}})}
  }
  $copy
 })
 return [pscustomobject]@{payload=$Donor.payload;source_object_ids=[string[]]@($Donor.source_object_ids);before_inventory=$Donor.before_inventory;address_snapshots=$snapshots;address_replacements=@($Donor.address_replacements);selection=$Donor.selection}
}
function Close-WeinviewBatchMacros($Session,$Manager) {
 Button $Session $Manager 2 '离开';Wait-WeinviewMacroDialogClosed $Session $Manager.Hwnd
}
function Get-WeinviewBatchMacroSnapshot($Session,[string]$Directory) {
 $manager=Manager $Session;$rows=ListRows $Session $manager
 if($rows.Count){$snapshot=Export-WeinviewMacroFile $Session $manager $rows[0].id $rows[0].name $Directory}
 else{$snapshot=@{exported_macros=@()}}
 Close-WeinviewBatchMacros $Session $manager
 return @{directory=$Directory;rows=$rows;exported_macros=@($snapshot.exported_macros)}
}
function Get-WeinviewBatchMacroFile($Snapshot,[int]$Id,[string]$Name,[string]$Prefix) {
 $matches=@($Snapshot.exported_macros|Where-Object {$_.macro_id -eq $Id -and $_.macro_name -ceq $Name})
 if($matches.Count -ne 1){throw 'Exact macro ID/name absent or duplicated.'}
 $files=@(Get-ChildItem -LiteralPath $Snapshot.directory -File|Where-Object {$_.Name.StartsWith(([string]$Id+'_'),[StringComparison]::Ordinal)})
 if($files.Count -ne 1 -or (Hash $files[0].FullName) -cne $matches[0].ebm_sha256){throw 'Exported macro file binding changed.'}
 $result=Invoke-WeinviewMacroCodec @{operation='ebm-inspect';input=$files[0].FullName;expected_sha256=$matches[0].ebm_sha256} $Prefix
 if($result.macro_id -ne $Id -or $result.macro_name -cne $Name){throw 'Exported macro content identity differs.'}
 $result|Add-Member -NotePropertyName native_ebm_path -NotePropertyValue $files[0].FullName
 return $result
}
function Assert-WeinviewBatchMacroCatalog($Before,$After,$Plan) {
 $changes=@($Plan|Where-Object {$_.kind -cin @('macro_add','macro_update')});$adds=@($changes|Where-Object {$_.kind -ceq 'macro_add'})
 if($After.exported_macros.Count -ne ($Before.exported_macros.Count+$adds.Count)){throw 'Unexpected macro catalog count.'}
 foreach($old in $Before.exported_macros){
  $match=@($After.exported_macros|Where-Object {$_.macro_id -eq $old.macro_id -and $_.macro_name -ceq $old.macro_name})
  if($match.Count -ne 1 -or (!@($changes|Where-Object {$_.request.macro_id -eq $old.macro_id}).Count -and $match[0].ebm_sha256 -cne $old.ebm_sha256)){throw 'Unrelated original macro bytes changed.'}
 }
}
function Select-WeinviewBatchScreenWindow($Session,[int]$Number){
 return Select-WeinviewWindow $Session $Number
}
function Get-WeinviewBatchAddressQueries($Plan) {
 $queries=@()
 foreach($state in @($Plan|Where-Object {$_.kind -ceq 'project_replace_address'})){
  foreach($target in @($false,$true)){
   $key=Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $target
   $queries+=,[pscustomobject]@{key=$key;arguments=$state.address_arguments;contract=$state.address_contract;target=$target}
  }
 }
 return $queries
}
function Initialize-WeinviewBatchSnapshots($Session,$Plan,[string]$Prefix,[string]$SourceSha256) {
 # Check source-bound snapshots and guards before imports; address searches use each step's live state.
 $macros=$null;$screenPreflightTargets=@{};$duplicatePreflightInventories=@{};$windowCreationBaseline=$null;$additionWindowDirectory=$null
 # A batch of ordinary direct edits needs one live read immediately before
 # each edit, with that dialog retained. Explicit source guards and mixed
 # creation/move/import batches keep their existing upfront snapshots.
 $deferTargetReads=(@($Plan).Count -gt 0)
 foreach($candidate in $Plan){
  if($candidate.kind -cne 'screen_update' -or $null -ne $candidate.source_step -or @($candidate.request.PSObject.Properties.Name|Where-Object {$_ -cin @('expected_object_sha256','tag_name','recipe_name','security_class')}).Count){$deferTargetReads=$false;break}
 }
 if(@($Plan|Where-Object {$_.kind -cin @('macro_add','macro_update')}).Count){$macros=Get-WeinviewBatchMacroSnapshot $Session ($Prefix+'.macros.before')}
 foreach($state in $Plan){
  $step=$state.request;$p=$state.prefix;$script:stage='batch_preflight_'+$state.kind
  switch -CaseSensitive ($state.kind) {
   'window_create' {
    if(!$windowCreationBaseline){$windowCreationBaseline=Read-WeinviewWindows $Session -NativeList}
    if($step.PSObject.Properties.Name -ccontains 'expected_window_set_sha256' -and $step.expected_window_set_sha256 -ine [string]$windowCreationBaseline.window_set_sha256){throw 'Native window directory differs before batch mutation.'}
    if(@($windowCreationBaseline.windows|Where-Object {$_.name -ceq $step.name}).Count){throw 'Native window name already exists before batch mutation.'}
    $state.preflight_window_set_sha256=[string]$windowCreationBaseline.window_set_sha256
   }
   'labels_bind' {
    foreach($window in @($state.binding_windows)){$null=Select-WeinviewBatchScreenWindow $Session ([int]$window)}
   }
   'window_copy' {
    $donor=[string]$state.copy_arguments.donor_path
    if(!(Test-Path -LiteralPath $donor -PathType Leaf) -or [IO.Path]::GetExtension($donor) -ine [IO.Path]::GetExtension($Session.output_path) -or $donor -ieq $Session.output_path -or (Hash $donor) -cne ([string]$state.copy_arguments.expected_donor_sha256).ToUpperInvariant()){throw 'Batch window-copy pinned donor differs before imports.'}
    $state.donor_sha256=(Hash $donor)
   }
   {$_ -cin @('screen_copy_objects','screen_move_objects')} {
    $null=Open-WeinviewObjectCopyWindow $Session ([int]$state.window_number)
    $inventory=Get-WeinviewWindowObjectInventory $Session
    if($inventory.read_route -cne 'native_host' -or [int]$inventory.window_number -ne [int]$state.window_number -or (!@($inventory.rows).Count -and !($state.kind -ceq 'screen_copy_objects' -and ($state.object_copy_contract.external_donor -or $null -ne $state.source_step)) -and !($state.kind -ceq 'screen_move_objects' -and $null -ne $state.source_step))){throw 'Batch screen copy requires native host window inventory; nonempty except external donor copy or referenced copy/move'}
    $state.preflight_before_count=@($inventory.rows).Count
    $state.source_sha256=$SourceSha256
   }
   {$_ -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update','screen_duplicate')} {
    if($state.kind -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add')){
     # Additions need the real window identity and dimensions, not an early
     # activation of every page. Activate and read each page when its step runs.
     if(!$additionWindowDirectory){$additionWindowDirectory=Read-WeinviewWindows $Session -NativeList}
     $targetWindow=@($additionWindowDirectory.windows|Where-Object {[int]$_.number -eq [int]$state.window_number})
     if($targetWindow.Count -ne 1 -or [int]$targetWindow[0].width -lt 1 -or [int]$targetWindow[0].height -lt 1){throw 'Batch addition requires an existing native window with dimensions.'}
     $state.canvas_width=[int]$targetWindow[0].width;$state.canvas_height=[int]$targetWindow[0].height
     break
    }
    $null=Select-WeinviewBatchScreenWindow $Session ([int]$state.window_number)
    if([int]$Session.window_width -lt 1 -or [int]$Session.window_height -lt 1){throw 'Selected batch screen has no native geometry'}
    if($state.kind -ceq 'screen_duplicate'){
     if($null -eq $state.source_step){
      $windowKey=[string]([int]$state.window_number)
      if(!$duplicatePreflightInventories.ContainsKey($windowKey)){$duplicatePreflightInventories[$windowKey]=Get-WeinviewWindowObjectInventory $Session}
      $inventory=$duplicatePreflightInventories[$windowKey]
      if($inventory.read_route -cne 'native_host' -or [int]$inventory.window_number -ne [int]$state.window_number -or @($inventory.rows|Where-Object {$_.object_id -ceq $step.object_id}).Count -ne 1){throw 'Batch Multi Copy seed absent or duplicated in preflight native host inventory'}
     }
     $state.source_sha256=$SourceSha256
    }
    if($state.kind -ceq 'screen_update' -and $null -eq $state.source_step){
     $numericTarget=($step.object_id -cmatch '^(ND|NE|TS|BL)_[0-9]+$')
     $tagRequested=($numericTarget -and $step.PSObject.Properties.Name -ccontains 'tag_name')
     if($tagRequested){$null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.preflight-tags.csv');Close-WeinviewTagLibrary $Session;$null=Select-WeinviewBatchScreenWindow $Session ([int]$state.window_number)}
     $targetKey=([string]$state.window_number)+':'+([string]$step.object_id)
      if($deferTargetReads){
       $state.deferred_target_read=$true
      }elseif($state.index -eq 0 -and $step.PSObject.Properties.Name -cnotcontains 'tag_name' -and $step.PSObject.Properties.Name -cnotcontains 'recipe_name' -and $step.PSObject.Properties.Name -cnotcontains 'security_class'){
       # Finish all other preflight navigation first, then retain this first
       # target's actual property dialog for the first batch update.
       $state.prepared_target_pending=$true
      }elseif(!$screenPreflightTargets.ContainsKey($targetKey)){
      if($numericTarget -and !$tagRequested){
       try{$target=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target-direct')}
       catch{
        if($_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound numeric read*' -and $_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound bit read*'){throw}
        $null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.preflight-tags.csv');Close-WeinviewTagLibrary $Session;$null=Select-WeinviewBatchScreenWindow $Session ([int]$state.window_number)
        $target=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target-tagged')
       }
      }else{$target=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target')}
      $screenPreflightTargets[$targetKey]=$target.object
     }
      if(!$state.prepared_target_pending -and !$state.deferred_target_read){$state.before=$screenPreflightTargets[$targetKey];if(!$state.repeated_update -and $step.PSObject.Properties.Name -ccontains 'expected_object_sha256' -and $state.before.object_sha256 -cne $step.expected_object_sha256.ToUpperInvariant()){throw 'Existing batch screen target hash differs before mutation'}}
    }
    $state.canvas_width=[int]$Session.window_width;$state.canvas_height=[int]$Session.window_height
    $state.native_window_geometry=$Session.window_geometry_evidence
   }
   {$_ -cin @('macro_add','macro_update')} {
    $existing=@($macros.rows|Where-Object {$_.id -eq $step.macro_id})
    $prepare=@{operation='ebm-prepare';output=$p+'.candidate.ebm';macro_id=$step.macro_id;macro_name=$step.macro_name;source=$step.source}
    if($state.kind -ceq 'macro_update'){
     if($existing.Count -ne 1 -or $existing[0].name -cne $step.macro_name){throw 'Guarded existing macro ID/name mismatch; no batch imports.'}
     $state.before=Get-WeinviewBatchMacroFile $macros $step.macro_id $step.macro_name ($p+'.before.inspect')
     if($step.expected_macro_source_sha256 -and $state.before.macro_source_sha256 -ine $step.expected_macro_source_sha256){throw 'Stale existing macro source hash; no batch imports.'}
     $prepare.base=$state.before.native_ebm_path;$prepare.expected_sha256=$state.before.ebm_sha256;$prepare.expected_source_sha256=$state.before.macro_source_sha256
    }elseif($existing.Count){throw 'New macro ID already exists; no batch imports.'}
    if($step.PSObject.Properties.Name -ccontains 'execution'){$prepare.execution=$step.execution}
    $state.candidate=Invoke-WeinviewMacroCodec $prepare ($p+'.prepare');$state.candidate_path=$prepare.output
    if($state.kind -ceq 'macro_update' -and $state.candidate.macro_source_sha256 -ceq $state.before.macro_source_sha256 -and !$state.candidate.execution_changed){throw 'Replacement macro source and execution are unchanged; no batch imports.'}
   }
   'tags_upsert' {
    $Session.tag_prefix=$p;$null=Open-WeinviewTagLibrary $Session
    $state.before=Export-WeinviewTags $Session ($p+'.before.csv')
    if($step.expected_tags_sha256 -and $state.before.tags_sha256 -ine $step.expected_tags_sha256){throw 'Stale tags hash; no batch imports.'}
    # Keep the native baseline and cumulative requested rows separately. A later
    # bit/word group must retain every tag imported by the preceding groups.
    $priorTags=@($Plan|Where-Object {$_.kind -ceq 'tags_upsert' -and $_.index -lt $state.index})
    $tagBase=if($priorTags.Count){$priorTags[-1].expected}else{$state.before.tags}
    $state.expected=[PLCCode.Weinview.TagCsvCodec]::Merge([PLCCode.Weinview.TagRow[]]$tagBase,[PLCCode.Weinview.TagRow[]]$state.rows)
    foreach($row in $state.rows){$old=@($state.before.tags|Where-Object {$_.name -ieq $row.name});if($old.Count -and $old[0].name -cne $row.name){throw 'Case-changing tag rename is forbidden; no batch imports.'}}
    $nativeTagNames=@($step.tags|Where-Object {$_.row_format -ceq 'native_csv'}|ForEach-Object {[string]$_.name})
    $state.devices=Assert-WeinviewTagDeviceBindings $Session $state.rows $nativeTagNames
    Close-WeinviewTagLibrary $Session
   }
   'events_append' {
    Open-WeinviewEvents $Session;$state.before=Export-WeinviewEvents $Session ($p+'.before')
    $state.history_before=(Read-WeinviewEventHistoryGlobalState $Session).history_global_state
    if($step.expected_events_sha256 -and $state.before.events_sha256 -ine $step.expected_events_sha256){throw 'Stale events hash; no batch imports.'}
    Close-WeinviewEvents $Session
   }
   'sampling_append' {
    $state.before=Invoke-WeinviewSamplingRead $Session ($p+'.before.csv') $SourceSha256
    if($step.expected_sampling_sha256 -and $state.before.sha256 -ine $step.expected_sampling_sha256){throw 'Stale Sampling hash; no batch imports.'}
    $samplingAddressEvidence=$null;$samplingTagRows=@()
    if($state.address_required){
     $priorTagSteps=@($Plan|Where-Object {$_.kind -ceq 'tags_upsert' -and $_.index -lt $state.index})
     $tagEvidence=if($priorTagSteps.Count){$priorTagSteps[-1].before}else{$Session.tag_evidence}
     $samplingAddressEvidence=Get-WeinviewCurrentAddressEvidence $Session ($p+'.preflight-address') $SourceSha256 $tagEvidence
     $samplingTagRows=@($samplingAddressEvidence.tag_rows)
     # Earlier planned tags are candidate inputs only; apply resolves them again from the actual native export.
     if($priorTagSteps.Count){$samplingTagRows=@($priorTagSteps[-1].expected)}
    }
    # Validate every requested property against the actual CSV version before any batch import.
    $null=Add-WeinviewSamplingCsvRows -InputPath $state.before.csv_path -OutputPath ($p+'.preflight.candidate.csv') -ExpectedInputSha256 $state.before.sha256 -Objects $state.items -DeviceDirectory $samplingAddressEvidence.device_directory -TagRows $samplingTagRows
   }
  }
  if((Hash $Session.output_path) -cne $SourceSha256){throw 'Inspection changed project bytes; no batch imports.'}
 }
  if(@($Plan).Count -and $Plan[0].prepared_target_pending){
   $first=$Plan[0];$step=$first.request;$p=$first.prefix
   $null=Select-WeinviewBatchScreenWindow $Session ([int]$first.window_number)
   if($step.object_id -cmatch '^(ND|NE|TS|BL)_[0-9]+$'){
    try{$prepared=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target-direct') $true}
    catch{
     if($_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound numeric read*' -and $_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound bit read*'){throw}
     $null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.preflight-tags.csv');Close-WeinviewTagLibrary $Session
     $null=Select-WeinviewBatchScreenWindow $Session ([int]$first.window_number)
     $prepared=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target-tagged') $true
    }
   }else{$prepared=Read-WeinviewTargetObject $Session ([string]$step.object_id) $SourceSha256 ($p+'.preflight-target') $true}
   if($step.PSObject.Properties.Name -ccontains 'expected_object_sha256' -and $prepared.object.object_sha256 -cne $step.expected_object_sha256.ToUpperInvariant()){Close-WeinviewScreenDialog $Session $prepared.dialog $false;throw 'Existing batch screen target hash differs before mutation'}
   $first.before=$prepared.object;$first.prepared_target=$prepared;$first.prepared_target_pending=$false
  }
  return $macros
}
function Resolve-WeinviewBatchDuplicateSourceStep($State,$Plan) {
 if($null -eq $State.source_step){return $State.request}
 $source=$Plan[[int]$State.source_step]
 if($source.kind -cne 'screen_copy_objects' -or [int]$source.window_number -ne [int]$State.window_number -or !$source.completed_in_memory -or !$source.applied){throw 'Referenced batch object-copy step has no completed same-window result.'}
 $mappedRows=@($source.applied.added_objects|Where-Object {[string]$_.source_object_id -ceq [string]$State.source_object_id})
 if($mappedRows.Count -ne 1 -or [string]$mappedRows[0].object_id -cnotmatch '^[A-Z]+_[0-9]{1,5}$'){throw 'Referenced batch object-copy source ID has no unique actual new object ID.'}
 $values=[ordered]@{}
 foreach($property in $State.request.PSObject.Properties){if($property.Name -cne 'source_step'){$values[$property.Name]=$property.Value}}
 $values.object_id=[string]$mappedRows[0].object_id
 return [pscustomobject]$values
}
function Resolve-WeinviewBatchUpdateSourceStep($State,$Plan) {
 if($null -eq $State.source_object_index){return Resolve-WeinviewBatchDuplicateSourceStep $State $Plan}
 $source=$Plan[[int]$State.source_step]
 if([int]$source.window_number -ne [int]$State.window_number -or !$source.completed_in_memory -or !$source.applied){throw 'Referenced addition has no completed same-window result.'}
 $created=@($source.objects_created)
 $index=[int]$State.source_object_index
 if($index -lt 0 -or $index -ge $created.Count -or [string]$created[$index].object_id -cnotmatch '^(ND|NE|FK|TS|BL|TX|DW|RV|TD|OL|GP)_[0-9]+$'){throw 'Referenced addition did not return the requested native object.'}
 $values=[ordered]@{}
 foreach($property in $State.request.PSObject.Properties){if($property.Name -cnotin @('source_step','source_object_index')){$values[$property.Name]=$property.Value}}
 $values.object_id=[string]$created[$index].object_id
 return [pscustomobject]$values
}
function Resolve-WeinviewBatchMoveSourceStep($State,$Plan) {
 $source=$Plan[[int]$State.source_step]
 if($source.kind -cne 'screen_copy_objects' -or [int]$source.window_number -ne [int]$State.window_number -or !$source.completed_in_memory -or !$source.applied){throw 'Referenced batch object-copy step has no completed same-window result for move.'}
 $copied=@($source.applied.source_object_ids)
 $requested=@($State.object_move_contract.object_ids)
 if($null -eq $State.object_move_contract.object_ids){$requested=$copied}
 $wanted=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 foreach($id in $requested){if(!$wanted.Add([string]$id)){throw 'Referenced batch move source ID duplicated.'}}
 $ordered=@($copied|Where-Object {$wanted.Contains([string]$_)})
 if(!$ordered.Count -or $ordered.Count -ne $wanted.Count){throw 'Referenced batch move source ID absent from completed copy.'}
 $sourceRows=[Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
 $sourceByNewId=[Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
 foreach($row in @($source.applied.added_objects)){
  $sourceId=[string]$row.source_object_id;$newId=[string]$row.object_id
  if(!$sourceId -or $newId -cnotmatch '^[A-Z]+_[0-9]{1,5}$' -or $sourceRows.ContainsKey($sourceId) -or $sourceByNewId.ContainsKey($newId)){throw 'Referenced batch copy has duplicated or invalid source/new object ID.'}
  $sourceRows.Add($sourceId,$row);$sourceByNewId.Add($newId,$sourceId)
 }
 $actual=@()
 foreach($id in $ordered){
  if(!$sourceRows.ContainsKey([string]$id)){throw 'Referenced batch copy has no unique actual new object ID for move.'}
  $actual+=[string]$sourceRows[[string]$id].object_id
 }
 $State.source_object_ids=@($ordered);$State.source_by_new_id=$sourceByNewId
 return [pscustomobject]@{window_number=[int]$State.window_number;translation=@($State.object_move_contract.translation);object_ids=@($actual)}
}
function Invoke-WeinviewProjectBatchScreenStep($Session,$State,[string]$SourceSha256,[string]$BridgeRoot,$TargetCurrentRecords,$TargetAfterHashes,$TargetInitialHashes,$Plan){
 $step=$State.request;$kind=[string]$State.kind;$p=[string]$State.prefix
 if($kind -ceq 'screen_duplicate'){
  if($State.source_sha256 -cne $SourceSha256){throw 'Batch Multi Copy preflight source hash differs'}
  $State.effective_duplicate_arguments=Resolve-WeinviewBatchDuplicateSourceStep $State $Plan
  $State.applied=Invoke-WeinviewNativeMultiCopy $Session $State.effective_duplicate_arguments $SourceSha256 $p
  if($null -ne $State.source_step){$State.applied|Add-Member -NotePropertyName source_step -NotePropertyValue ([int]$State.source_step);$State.applied|Add-Member -NotePropertyName source_object_id -NotePropertyValue ([string]$State.source_object_id)}
  if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch Multi Copy saved project before caller boundary'}
  return
 }
 if($kind -ceq 'screen_move_objects'){
  if($State.source_sha256 -cne $SourceSha256){throw 'Batch screen move preflight source hash differs'}
  $State.effective_move_contract=if($null -ne $State.source_step){Resolve-WeinviewBatchMoveSourceStep $State $Plan}else{$State.object_move_contract}
  $State.applied=Invoke-WeinviewNativeObjectMove $Session $State.effective_move_contract $SourceSha256 $p
  if($null -ne $State.source_step){
   $State.applied|Add-Member -NotePropertyName source_step -NotePropertyValue ([int]$State.source_step)
   $originalIds=@(foreach($id in @($State.applied.object_ids)){
    if(!$State.source_by_new_id.ContainsKey([string]$id)){throw 'Moved copied ID has no unique source mapping.'}
    [string]$State.source_by_new_id[[string]$id]
   })
   $State.applied|Add-Member -NotePropertyName source_object_ids -NotePropertyValue $originalIds
  }
  if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch screen move saved project before caller boundary'}
  return
 }
 if($kind -ceq 'screen_copy_objects'){
  if($State.source_sha256 -cne $SourceSha256){throw 'Batch screen copy preflight source hash differs'}
  if($null -ne $State.source_step){
   $reference=@{source_step=[int]$State.source_step;window_number=[int]$State.window_number;object_move_contract=$State.object_copy_contract}
   $resolved=Resolve-WeinviewBatchMoveSourceStep $reference $Plan
   $State.reference_source_object_ids=@($reference.source_object_ids);$State.effective_object_ids=@($resolved.object_ids)
   $State.effective_object_copy_contract=[pscustomobject]@{window_number=[int]$State.window_number;source_window_number=[int]$State.window_number;external_donor=$false;translation=$State.object_copy_contract.translation;object_ids=@($resolved.object_ids);address_replacements=$null}
  }else{$State.effective_object_copy_contract=$State.object_copy_contract}
  $State.applied=Invoke-WeinviewNativeObjectCopy $Session $State.effective_object_copy_contract $SourceSha256 $p $State.donor_payload
  if($null -ne $State.source_step){
   $State.applied|Add-Member -NotePropertyName source_step -NotePropertyValue ([int]$State.source_step)
   $State.applied|Add-Member -NotePropertyName reference_source_object_ids -NotePropertyValue @($State.reference_source_object_ids)
   $State.applied|Add-Member -NotePropertyName effective_object_ids -NotePropertyValue @($State.effective_object_ids)
  }
  if($null -ne $State.object_copy_contract.address_replacements -and @($State.object_copy_contract.address_replacements).Count){$State.address_verified_in_memory=Assert-WeinviewObjectCopyAddressReferences $Session $State.applied ($p+'.address')}
  if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch screen copy saved project before caller boundary'}
  return
 }
  if(!$State.prepared_target){$null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)}
 if([int]$Session.window_width -ne [int]$State.canvas_width -or [int]$Session.window_height -ne [int]$State.canvas_height){throw 'Batch selected screen geometry changed after preflight'}
 $State.native_window_geometry=$Session.window_geometry_evidence
 $State.screen_objects_after=@();$State.alarm_displays_after=@()
 switch -CaseSensitive ($kind){
  'screen_add_common_objects' {
   $items=@(Get-WeinviewBatchCaptionObjects $State $Plan)
   $option=($items.Count -eq 1 -and $items[0].kind -ceq 'option_list')
   $picture=($items.Count -gt 0 -and @($items|Where-Object {$_.kind -cne 'picture'}).Count -eq 0)
   if($option){$validated=Assert-WeinviewOptionListInputs $items[0] ([int]$Session.window_width) ([int]$Session.window_height);$State.applied=Invoke-WeinviewOptionListAddition -Session $Session -Mode Apply -Object $validated -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot}
   elseif($picture){$State.applied=Invoke-WeinviewPictureAddition -Session $Session -Mode Apply -Objects $items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot}
   elseif(!$items.Count){$snapshot=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($p+'.caption-owners') $BridgeRoot;$State.applied=[pscustomobject]@{objects=@();native_fields_verified=$true;before_snapshot=$snapshot;after_snapshot=$snapshot;composition_scope='captions_owned_by_navigation_buttons';saved=$false}}
   else{$validated=@(Assert-WeinviewCommonObjectsInputs -Objects $items);$State.applied=Invoke-WeinviewCommonObjectsAddition -Session $Session -Mode Apply -Objects $validated -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot -DeferReadback}
   $State.screen_objects_after=@($State.applied.objects)
  }
  'screen_add_numeric' {
   $items=@($State.items);$tagged=@($items|Where-Object {$_.tag_name});$tagEvidence=$null
   if($tagged.Count){
    if(!$Session.tag_evidence){$null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.numeric-tags.csv');Close-WeinviewTagLibrary $Session;$null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)}
    $tagEvidence=$Session.tag_evidence
   }
   $devices=@()
   $State.applied=Invoke-WeinviewNumericAddition -Session $Session -Mode Apply -Objects $items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -VerifiedDevices $devices -BridgeRoot $BridgeRoot -TagEvidence $tagEvidence
   $complete=@()
   foreach($result in @($State.applied.objects)){
    $numericRecords=@($State.applied.after_snapshot.objects|Where-Object {$_.object_id -ceq $result.object_id})
    if($numericRecords.Count -ne 1 -or [string]$numericRecords[0].object_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Numeric batch target requires one complete hashed native after-snapshot record'}
    $complete+=,$numericRecords[0]
   }
   $State.screen_objects_after=$complete;$State.tag_evidence=$tagEvidence
  }
  'screen_add_bit_switches' {
   $tagged=@($State.items|Where-Object {$_.tag_name})
   if($tagged.Count -and !$Session.tag_evidence){$null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.bit-tags.csv');Close-WeinviewTagLibrary $Session;$null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)}
   $State.applied=Invoke-WeinviewBitSwitchAddition -Session $Session -Mode Apply -Objects $State.items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot
   $State.screen_objects_after=@($State.applied.objects);$State.tag_evidence=if($tagged.Count){$Session.tag_evidence}else{$null}
  }
  'screen_add_window_buttons' {$State.applied=Invoke-WeinviewWindowButtonAddition -Session $Session -Mode Apply -Objects $State.items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot;$State.screen_objects_after=@($State.applied.objects)}
  'screen_add_trends' {$State.applied=Invoke-WeinviewTrendAddition -Session $Session -Objects $State.items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot;$State.screen_objects_after=@($State.applied.objects)}
  'alarm_display_add' {$State.applied=Invoke-WeinviewAlarmDisplayAddition -Session $Session -Mode Apply -Objects $State.items -SourceSha256 $SourceSha256 -BeforeSnapshot $null -BridgeRoot $BridgeRoot;$State.alarm_displays_after=@($State.applied.objects)}
  'recipe_view_add' {
   $python=Get-WeinviewRecipePython
   $context=Open-WeinviewRecipeDatabase $Session ($p+'.recipe')
   try{
    $db=$p+'.recipe.db';$null=Export-WeinviewRecipeDatabase $Session $context ([string]$step.recipe_name) $db
   }finally{Close-WeinviewRecipeDatabaseReadOnly $Session $context}
   $requestPath=$p+'.recipe-request.json';$receiptPath=$p+'.recipe-receipt.json'
   WritePrivateJson $requestPath @{operation='read';source_db=$db;recipe=[string]$step.recipe_name;offset=0;limit=1000}
   $read=Invoke-WeinviewRecipeDatabaseCodec $python $requestPath $receiptPath
   $definition=$read.recipes.PSObject.Properties[[string]$step.recipe_name].Value
   if(!$definition){throw 'Requested batch Recipe View definition absent from current project'}
   $fields=@($definition.columns|ForEach-Object {[string]$_.name});$display=[string[]]@($step.display_fields)
   if($fields.Count -lt 1 -or @($display|Where-Object {$_ -cnotin $fields}).Count){throw 'Requested batch Recipe View display field absent from native definition'}
   if(($step.PSObject.Properties.Name -ccontains 'sort_by') -and [string]$step.sort_by -cnotin $fields){throw 'Requested batch sort field absent from native definition'}
   $Session.recipe_view_fields=@{([string]$step.recipe_name)=$fields}
   $null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)
   $beforeScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($p+'.before') $BridgeRoot
   $created=Invoke-WeinviewRecipeViewAddition $Session ([string]$step.recipe_name) ([string[]]$fields) $display ([int]$step.x) ([int]$step.y) $(if($step.PSObject.Properties.Name -ccontains 'sort_enabled'){$step.sort_enabled}else{$null}) ([string]$step.sort_by) ([string]$step.sort_direction)
   $afterScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($p+'.after') $BridgeRoot @([string]$created.object_id)
   Assert-WeinviewAdditionSnapshots $beforeScreen $afterScreen 1
   $target=@($afterScreen.objects|Where-Object {$_.object_id -ceq $created.object_id})
   if($target.Count -ne 1 -or $target[0].kind -cne 'recipe_view'){throw 'Batch Recipe View target properties absent after addition'}
   if($target[0].recipe_name -cne [string]$step.recipe_name -or (@($target[0].displayed_fields) -join [char]31) -cne ($display -join [char]31) -or [bool]$target[0].sort_enabled -ne [bool]$created.sort_enabled -or [string]$target[0].sort_by -cne [string]$created.sort_by -or [string]$target[0].sort_direction -cne [string]$created.sort_direction){throw 'Batch Recipe View native property/sort readback differs from request'}
   $created|Add-Member -NotePropertyName before_snapshot -NotePropertyValue $beforeScreen
   $created|Add-Member -NotePropertyName after_snapshot -NotePropertyValue $afterScreen
   $State.applied=$created;$State.screen_objects_after=@($target[0])
  }
  'screen_update' {
   if($null -ne $State.source_step){$State.effective_update_request=Resolve-WeinviewBatchUpdateSourceStep $State $Plan;$step=$State.effective_update_request}
   $tagEvidence=if($step.object_id -cmatch '^(ND|NE|TS|BL)_[0-9]+$'){$Session.tag_evidence}else{$null}
   if($step.object_id -cmatch '^RV_[0-9]+$' -and $step.PSObject.Properties.Name -ccontains 'recipe_name'){
    $python=Get-WeinviewRecipePython;$context=Open-WeinviewRecipeDatabase $Session ($p+'.target-recipe')
    try{$db=$p+'.target-recipe.db';$null=Export-WeinviewRecipeDatabase $Session $context ([string]$step.recipe_name) $db}
    finally{Close-WeinviewRecipeDatabaseReadOnly $Session $context}
    $requestPath=$p+'.target-recipe-request.json';$receiptPath=$p+'.target-recipe-receipt.json'
    WritePrivateJson $requestPath @{operation='read';source_db=$db;recipe=[string]$step.recipe_name;offset=0;limit=1000}
    $read=Invoke-WeinviewRecipeDatabaseCodec $python $requestPath $receiptPath
    $definition=$read.recipes.PSObject.Properties[[string]$step.recipe_name].Value
    if(!$definition){throw 'Batch target Recipe View definition absent from current project'}
    if(!$Session.recipe_view_fields){$Session.recipe_view_fields=@{}}
    $Session.recipe_view_fields[[string]$step.recipe_name]=@($definition.columns|ForEach-Object {[string]$_.name})
    $null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)
   }
   if($null -ne $State.source_step -and $step.PSObject.Properties.Name -ccontains 'tag_name' -and !$Session.tag_evidence){
    $null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.target-tags.csv');Close-WeinviewTagLibrary $Session
    $null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)
   }
   if($null -ne $State.source_step -or $State.deferred_target_read){
    $actualId=[string]$step.object_id;$targetKey=[string]$State.window_number+':'+$actualId
    $securityRequested=($step.PSObject.Properties.Name -ccontains 'security_class')
    $targetReadPrefix=if($State.deferred_target_read){$p+'.target'}else{$p+'.copied-target'}
    try{$prepared=Read-WeinviewTargetObject $Session $actualId $SourceSha256 ($targetReadPrefix+'-direct') $true $securityRequested}
    catch{
     if($_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound numeric read*' -and $_.Exception.Message -cnotlike '*Same-project native Tag CSV required for bound bit read*'){throw}
     $null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($targetReadPrefix+'-tags.csv');Close-WeinviewTagLibrary $Session
     $null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)
     $prepared=Read-WeinviewTargetObject $Session $actualId $SourceSha256 ($targetReadPrefix+'-tagged') $true $securityRequested
    }
    if([string]$prepared.object.object_id -cne $actualId){throw 'Batch update prepared the wrong target object.'}
    if($TargetCurrentRecords.ContainsKey($targetKey)){
     if([string]$TargetCurrentRecords[$targetKey].object_sha256 -cne [string]$prepared.object.object_sha256){throw 'Batch update current ObjectRecord differs from the prior step result.'}
     $initial=@($Plan|Where-Object {$_.index -lt $State.index -and $_.kind -ceq 'screen_update' -and [int]$_.window_number -eq [int]$State.window_number -and $_.effective_update_request -and $_.effective_update_request.object_id -ceq $actualId -and $_.before}|Select-Object -First 1)
     if($initial.Count -ne 1){throw 'Batch update initial ObjectRecord unavailable.'}
     $State.before=Copy-WeinviewBatchObjectRecord $initial[0].before
    }elseif($null -ne $State.source_object_index){
     $State.before=Copy-WeinviewBatchObjectRecord $Plan[[int]$State.source_step].objects_created[[int]$State.source_object_index]
     $TargetInitialHashes[$targetKey]=[string]$State.before.object_sha256
     $TargetCurrentRecords[$targetKey]=Copy-WeinviewBatchObjectRecord $prepared.object
    }else{$State.before=Copy-WeinviewBatchObjectRecord $prepared.object}
    $State.prepared_target=$prepared
    if($actualId -cmatch '^(ND|NE|TS|BL)_[0-9]+$'){$tagEvidence=$Session.tag_evidence}
   }
   $effective=Resolve-WeinviewBatchEffectiveUpdateRequest $State $TargetCurrentRecords $TargetAfterHashes $TargetInitialHashes
   if($effective.PSObject.Properties.Name -ccontains 'tag_name'){
    if(!$Session.tag_evidence){$null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($p+'.target-tags.csv');Close-WeinviewTagLibrary $Session;$null=Select-WeinviewBatchScreenWindow $Session ([int]$State.window_number)}
    $tagEvidence=$Session.tag_evidence
   }
    $State.applied=Invoke-WeinviewScreenTargetUpdate $Session $effective $SourceSha256 ($p+'.apply') $tagEvidence $State.prepared_target
    $State.prepared_target=$null
   Set-WeinviewBatchUpdatedObjectState $State $TargetCurrentRecords $TargetAfterHashes $Plan
   $State.tag_evidence=$tagEvidence
  }
 }
 if(!$State.applied){throw 'Batch screen step produced no native result'}
 $expectedObjectCount=if($kind -cin @('screen_update','recipe_view_add')){1}else{@($State.items).Count}
 if($kind -ceq 'screen_add_common_objects'){$expectedObjectCount-=@($State.caption_ownership).Count}
 if($kind -cne 'alarm_display_add' -and @($State.screen_objects_after).Count -ne $expectedObjectCount){throw 'Batch screen target result count differs'}
 if($kind -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','recipe_view_add')){
  $State.objects_created=@(foreach($object in @($State.screen_objects_after)){Copy-WeinviewBatchObjectRecord $object})
 }
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch screen step saved project before caller boundary'}
}
function Invoke-WeinviewProjectBatchAddressStep($Session,$State,[string]$SourceSha256) {
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch address replacement saved project before caller boundary'}
 $activeDialog=$null;$replaceTriggered=$false
 try{$State.applied=Invoke-WeinviewNativeAddressReplaceOnce $Session $State.address_arguments $State.address_contract ([ref]$activeDialog) ([ref]$replaceTriggered)}
 catch{
  if($activeDialog){
   $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if($modals.Count -eq 1 -and $modals[0].Hwnd -eq $activeDialog.Hwnd -and $modals[0].Enabled -and $modals[0].Title -ceq '寻找/替换'){
    [PLCCode.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$activeDialog.Hwnd,[int]$Session.process.Id)
   }
  }
  throw
 }
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch address replacement saved project before caller boundary'}
 WritePrivateJson ($State.prefix+'.apply.json') $State.applied
}
function Invoke-WeinviewProjectBatchWindowCopyStep($Session,$State,[string]$SourceSha256) {
 if((Hash ([string]$State.copy_arguments.donor_path)) -cne [string]$State.donor_sha256){throw 'Batch window-copy donor changed after preflight.'}
 $before=Read-WeinviewWindows $Session
 $State.applied=Invoke-WeinviewNativeWindowCopy $Session $State.copy_arguments $SourceSha256 ($State.prefix+'.copy')
 $State.applied.windows_before=@($before.windows)
 $State.applied.before_window_set_sha256=[string]$before.window_set_sha256
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Batch window copy saved project before caller boundary.'}
}
function Copy-WeinviewBatchObjectRecord($Record) {
 if(!$Record -or !$Record.object_id -or !$Record.object_sha256){throw 'Complete batch target ObjectRecord required for in-memory copy'}
 return ConvertFrom-Json -InputObject (ConvertTo-Json -InputObject $Record -Depth 32 -Compress)
}
function Resolve-WeinviewBatchEffectiveUpdateRequest($State,$TargetCurrentRecords,$TargetAfterHashes,$TargetInitialHashes) {
 $step=if($State.effective_update_request){$State.effective_update_request}else{$State.request}
 $key=[string]$State.window_number+':'+[string]$step.object_id
 $requestedHash=if($State.request.PSObject.Properties.Name -ccontains 'expected_object_sha256'){[string]$State.request.expected_object_sha256}else{$null}
 if(!$TargetInitialHashes.ContainsKey($key)){
  if(!$State.before -or [string]$State.before.object_id -cne [string]$step.object_id -or [string]$State.before.object_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$' -or ($requestedHash -and [string]$State.before.object_sha256 -cne $requestedHash.ToUpperInvariant())){throw 'Initial batch screen update SHA differs from verified source preflight or copied target'}
  $TargetInitialHashes[$key]=[string]$State.before.object_sha256
 }elseif([string]$State.before.object_sha256 -cne [string]$TargetInitialHashes[$key]){throw 'Batch screen update source preflight SHA changed'}
 if(!$TargetCurrentRecords.ContainsKey($key)){$TargetCurrentRecords[$key]=Copy-WeinviewBatchObjectRecord $State.before}
 $current=[string]$TargetCurrentRecords[$key].object_sha256
 if($TargetAfterHashes.ContainsKey($key) -and [string]$TargetAfterHashes[$key] -cne $current){throw 'Batch screen target current record/hash differs'}
 if($requestedHash -and $requestedHash.ToUpperInvariant() -cne [string]$TargetInitialHashes[$key] -and $requestedHash.ToUpperInvariant() -cne $current){throw 'Batch screen update expected SHA differs from verified initial and current state'}
 $copy=[ordered]@{};foreach($property in $step.PSObject.Properties){$copy[$property.Name]=$property.Value}
 $copy.expected_object_sha256=$current
 $State.effective_update_request=[pscustomobject]$copy
 return $State.effective_update_request
}
function Set-WeinviewBatchUpdatedObjectState($State,$TargetCurrentRecords,$TargetAfterHashes,$Plan) {
 $key=[string]$State.window_number+':'+[string]$State.effective_update_request.object_id
 if(!$State.applied.object_after -or [string]$State.applied.object_after.object_id -cne [string]$State.effective_update_request.object_id){throw 'Batch screen update actual ObjectRecord identity differs'}
 $State.screen_objects_after=@(Copy-WeinviewBatchObjectRecord $State.applied.object_after)
 $TargetCurrentRecords[$key]=Copy-WeinviewBatchObjectRecord $State.applied.object_after
 $TargetAfterHashes[$key]=[string]$TargetCurrentRecords[$key].object_sha256
 # Earlier additions and updates now expect the latest state at final readback.
 # Their immediate records remain available separately for request-order mapping.
 foreach($prior in @($Plan|Where-Object {$_.index -lt $State.index -and [int]$_.window_number -eq [int]$State.window_number -and $_.screen_objects_after})){
  $prior.screen_objects_after=@(foreach($object in @($prior.screen_objects_after)){if($object.object_id -ceq $State.applied.object_after.object_id){Copy-WeinviewBatchObjectRecord $State.applied.object_after}else{$object}})
 }
}
function Move-WeinviewBatchObjectRecord($Record,$Moved) {
 $copy=Copy-WeinviewBatchObjectRecord $Record
 $canonical=if($copy.canonical_json){ConvertFrom-Json -InputObject $copy.canonical_json}else{CanonicalObject ([string]$copy.object_id) $copy}
 if((CanonicalObjectHash $canonical) -cne [string]$copy.object_sha256){throw ('Batch moved target canonical hash differs before in-memory translation: '+$copy.object_id)}
 $dx=[int]$Moved.rectangle[0]-[int]$Moved.before_rectangle[0];$dy=[int]$Moved.rectangle[1]-[int]$Moved.before_rectangle[1]
 $canonicalFields=if($canonical -is [Collections.IDictionary]){@($canonical.Keys)}else{@($canonical.PSObject.Properties.Name)}
 if(@($canonical.rectangle).Count -eq 4){
  $canonical.rectangle[0]=[int]$canonical.rectangle[0]+$dx;$canonical.rectangle[1]=[int]$canonical.rectangle[1]+$dy
  if(@($copy.rectangle).Count -ne 4){throw ('Batch moved typed rectangle absent from ObjectRecord: '+$copy.object_id)}
  $copy.rectangle[0]=[int]$copy.rectangle[0]+$dx;$copy.rectangle[1]=[int]$copy.rectangle[1]+$dy
 }elseif($canonicalFields -ccontains 'rect'){
  if(@($canonical.rect).Count -ne 4 -or @($copy.rect).Count -ne 4){throw ('Batch moved recorded AL rect lacks exact four coordinates: '+$copy.object_id)}
  $canonical.rect[0]=[int]$canonical.rect[0]+$dx;$canonical.rect[1]=[int]$canonical.rect[1]+$dy
  $copy.rect[0]=[int]$copy.rect[0]+$dx;$copy.rect[1]=[int]$copy.rect[1]+$dy
 }elseif($canonical.kind -ceq 'text' -and $canonicalFields -ccontains 'x' -and $canonicalFields -ccontains 'y'){
  $canonical.x=[int]$canonical.x+$dx;$canonical.y=[int]$canonical.y+$dy
  if($copy.PSObject.Properties.Name -cnotcontains 'x' -or $copy.PSObject.Properties.Name -cnotcontains 'y'){throw ('Batch moved Text position absent from ObjectRecord: '+$copy.object_id)}
  $copy.x=[int]$copy.x+$dx;$copy.y=[int]$copy.y+$dy
 }
 if($copy.canonical_json){$copy.canonical_json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress}
 $copy.object_sha256=CanonicalObjectHash $canonical
 return $copy
}
function Move-WeinviewBatchAlarmDisplayExpectation($Record,$Moved) {
 if(!$Record -or $Record.object_id -cne $Moved.object_id -or $Record.actual.object_id -cne $Moved.object_id -or $Record.actual.kind -cne 'alarm_display' -or @($Record.actual.rect).Count -ne 4 -or (Get-WeinviewAlarmDisplayPropertyHash $Record.actual) -cne [string]$Record.observed_properties_sha256){throw 'Observed batch Alarm Display receipt required before in-memory move'}
 $copy=ConvertFrom-Json -InputObject (ConvertTo-Json -InputObject $Record -Depth 32 -Compress)
 $dx=[int]$Moved.rectangle[0]-[int]$Moved.before_rectangle[0];$dy=[int]$Moved.rectangle[1]-[int]$Moved.before_rectangle[1]
 $copy.actual.rect[0]=[int]$copy.actual.rect[0]+$dx;$copy.actual.rect[1]=[int]$copy.actual.rect[1]+$dy
 $copy.observed_properties_json=ConvertTo-Json -InputObject $copy.actual -Depth 8 -Compress
 $copy.observed_properties_sha256=Get-WeinviewAlarmDisplayPropertyHash $copy.actual
 return $copy
}
function Update-WeinviewBatchMovedObjectExpectations($Plan,$MoveState,$TargetCurrentRecords,$TargetAfterHashes,$TargetInitialHashes) {
 foreach($moved in @($MoveState.applied.moved_objects)){
  $key=[string]$MoveState.window_number+':'+[string]$moved.object_id
  if(!$TargetCurrentRecords.ContainsKey($key)){
   $source=@($Plan|Where-Object {$_.kind -ceq 'screen_update' -and [int]$_.window_number -eq [int]$MoveState.window_number -and $(if($_.effective_update_request){[string]$_.effective_update_request.object_id}else{if($null -eq $_.source_step){[string]$_.request.object_id}else{''}}) -ceq $moved.object_id}|Select-Object -First 1)
   if($source.Count){
    if(!$source[0].before -or [string]$source[0].before.object_id -cne [string]$moved.object_id){throw ('Batch moved update target source preflight identity differs: '+$moved.object_id)}
    if($source[0].request.PSObject.Properties.Name -ccontains 'expected_object_sha256' -and [string]$source[0].before.object_sha256 -cne ([string]$source[0].request.expected_object_sha256).ToUpperInvariant()){throw ('Batch moved update target source preflight SHA differs: '+$moved.object_id)}
    $TargetInitialHashes[$key]=[string]$source[0].before.object_sha256
    $TargetCurrentRecords[$key]=Copy-WeinviewBatchObjectRecord $source[0].before
   }
  }
  if($TargetCurrentRecords.ContainsKey($key)){
   $TargetCurrentRecords[$key]=Move-WeinviewBatchObjectRecord $TargetCurrentRecords[$key] $moved
   $TargetAfterHashes[$key]=[string]$TargetCurrentRecords[$key].object_sha256
  }
  foreach($prior in @($Plan|Where-Object {$_.index -lt $MoveState.index -and $_.kind -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','recipe_view_add','screen_update') -and [int]$_.window_number -eq [int]$MoveState.window_number})){
   $updated=@();foreach($object in @($prior.screen_objects_after)){
    if($object.object_id -ceq $moved.object_id){$updated+=,(Move-WeinviewBatchObjectRecord $object $moved)}else{$updated+=,$object}
   }
   $prior.screen_objects_after=$updated
  }
  foreach($prior in @($Plan|Where-Object {$_.index -lt $MoveState.index -and $_.kind -ceq 'alarm_display_add' -and [int]$_.window_number -eq [int]$MoveState.window_number})){
   $updated=@();foreach($alarm in @($prior.alarm_displays_after)){
    if($alarm.object_id -ceq $moved.object_id){$updated+=,(Move-WeinviewBatchAlarmDisplayExpectation $alarm $moved)}else{$updated+=,$alarm}
   }
   $prior.alarm_displays_after=$updated
  }
 }
}
function Get-WeinviewBatchExecutionPlan($Plan) {
 # MT opens an event-creation prompt if Alarm Display precedes the first event.
 # Move only that prerequisite (and its preceding tag import); retain request
 # indexes and the original Plan so result/source_step identities stay stable.
 $events=@($Plan|Where-Object {$_.kind -ceq 'events_append'})
 $scheduled=[Collections.Generic.HashSet[int]]::new()
 $ordered=[Collections.Generic.List[object]]::new()
 foreach($state in $Plan){
  if($state.kind -ceq 'alarm_display_add' -and $events.Count -eq 1 -and !$scheduled.Contains([int]$events[0].index)){
   foreach($tag in @($Plan|Where-Object {$_.kind -ceq 'tags_upsert' -and $_.index -lt $events[0].index})){
    if($scheduled.Add([int]$tag.index)){$ordered.Add($tag)}
   }
   if($scheduled.Add([int]$events[0].index)){$ordered.Add($events[0])}
  }
  if($scheduled.Add([int]$state.index)){$ordered.Add($state)}
 }
 return ,$ordered.ToArray()
}
function Invoke-WeinviewBatchImports($Session,$Plan,$MacroBefore,[string]$Prefix,[string]$SourceSha256) {
 $targetCurrentRecords=@{};$targetAfterHashes=@{};$targetInitialHashes=@{};$addressEvidence=$null
 foreach($state in (Get-WeinviewBatchExecutionPlan $Plan)){
  $script:batchCurrentStepIndex=[int]$state.index
  $step=$state.request;$p=$state.prefix;$script:stage='batch_import_'+$state.kind
  if(Get-Command Write-WeinviewProgress -CommandType Function -ErrorAction SilentlyContinue){
   $label=switch -CaseSensitive ($state.kind){
    'tags_upsert'{'变量'}
    'events_append'{'报警'}
    'sampling_append'{'采样'}
    'screen_add_trends'{'趋势'}
    {$_ -cin @('macro_add','macro_update')}{'宏'}
    {$_ -cin @('labels_upsert','labels_bind')}{'文本标签'}
    'project_replace_address'{'地址'}
    default{'画面'}
   }
   Write-WeinviewProgress -Stage $script:stage -Label ('正在配置{0} 第{1}/{2}项' -f $label,([int]$state.index+1),@($Plan).Count)
  }
  switch -CaseSensitive ($state.kind) {
   'window_create' {
    $expectedWindows=[string]$state.preflight_window_set_sha256
    $priorWindowSteps=@($Plan|Where-Object {$_.index -lt $state.index -and $_.kind -cin @('window_create','window_copy')})
    if($priorWindowSteps.Count){
     $priorWindow=$priorWindowSteps[-1]
     if(!$priorWindow.completed_in_memory){throw 'Previous batch window mutation has no completed native result.'}
     if($priorWindow.kind -ceq 'window_create'){$expectedWindows=[string]$priorWindow.applied.window_set_sha256}
     else{$expectedWindows=[string](Read-WeinviewWindows $Session -NativeList).window_set_sha256}
    }
    if($step.PSObject.Properties.Name -ccontains 'expected_window_set_sha256'){$expectedWindows=[string]$step.expected_window_set_sha256}
    # New reads and checks the actual list once before clicking; no redundant list open/close here.
    $state.applied=Invoke-WeinviewWindowOperation $Session ([pscustomobject]@{name=[string]$step.name;expected_window_set_sha256=$expectedWindows}) 'window_create'
    if((Hash $Session.output_path) -cne $SourceSha256 -or !$state.applied.preserved_existing_windows -or $state.applied.project_saved -or !$state.applied.created_window){throw 'Native window creation must retain its actual assigned window and remain unsaved until the batch boundary.'}
   }
   'labels_bind' {
    $effective=@();$sources=@()
    foreach($binding in @($step.bindings)){
     if($binding.PSObject.Properties.Name -ccontains 'source_step'){
      $reference=@{source_step=[int]$binding.source_step;source_object_id=[string]$binding.object_id;window_number=[int]$binding.window_number;request=$binding}
      $resolved=Resolve-WeinviewBatchDuplicateSourceStep $reference $Plan
      if([string]$resolved.object_id -cnotmatch '^TX_[0-9]+$'){throw 'Referenced Text binding mapped to a non-Text native ID.'}
      $sources+=,[pscustomobject]@{source_step=[int]$binding.source_step;source_object_id=[string]$binding.object_id;effective_object_id=[string]$resolved.object_id;window_number=[int]$binding.window_number}
     }else{$resolved=$binding}
     $effective+=,$resolved
    }
    $state.effective_bindings=@($effective);$state.binding_sources=@($sources)
    $state.applied=Invoke-WeinviewLabelApplyBindings $Session ([pscustomobject]@{bindings=@($effective)}) $SourceSha256 ($p+'.apply')
   }
   'window_copy' {Invoke-WeinviewProjectBatchWindowCopyStep $Session $state $SourceSha256}
   'project_replace_address' {Invoke-WeinviewProjectBatchAddressStep $Session $state $SourceSha256}
   {$_ -cin @('screen_copy_objects','screen_move_objects')} {
    Invoke-WeinviewProjectBatchScreenStep $Session $state $SourceSha256 $PSScriptRoot $targetCurrentRecords $targetAfterHashes $targetInitialHashes $Plan
    if($state.kind -ceq 'screen_move_objects'){Update-WeinviewBatchMovedObjectExpectations $Plan $state $targetCurrentRecords $targetAfterHashes $targetInitialHashes}
   }
   {$_ -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update','screen_duplicate')} {
    # Existing ribbon-driven screen entries retain their per-step ribbon setting.
    $priorRibbonBackground=$Session.owned_ribbon_background
    try {
    if($state.kind -cne 'screen_add_numeric'){$Session.owned_ribbon_background=$false}
     Invoke-WeinviewProjectBatchScreenStep $Session $state $SourceSha256 $PSScriptRoot $targetCurrentRecords $targetAfterHashes $targetInitialHashes $Plan
    } finally {$Session.owned_ribbon_background=$priorRibbonBackground}
   }
   {$_ -cin @('macro_add','macro_update')} {
    if((Hash $state.candidate_path) -cne $state.candidate.ebm_sha256){throw 'Prepared macro file changed.'}
    $manager=Manager $Session
    if($state.kind -ceq 'macro_update'){$state.import=Import-WeinviewMacroFile $Session $manager $state.candidate_path $step.macro_id $step.macro_name}
    else{$state.import=Import-WeinviewMacroFile $Session $manager $state.candidate_path}
    Close-WeinviewBatchMacros $Session $manager
   }
   'tags_upsert' {
    $Session.tag_prefix=$p+'.apply';$null=Open-WeinviewTagLibrary $Session
    $newRows=[Collections.Generic.List[PLCCode.Weinview.TagRow]]::new();$state.updated=@()
    $nativeTagNames=@($step.tags|Where-Object {$_.row_format -ceq 'native_csv'}|ForEach-Object {[string]$_.name})
    $replaceMerged=@($state.before.tags|Where-Object {$nativeTagNames -ccontains $_.name}).Count -gt 0
    if($replaceMerged){
     # EBPro's CSV replacement matches addresses, not tag names; changed
     # addresses otherwise create suffixed duplicates. Re-import the merged
     # complete table and verify every retained row before saving.
     $state.import=Import-WeinviewTags $Session ([PLCCode.Weinview.TagRow[]]$state.expected) ($p+'.request.csv') -ReplaceMergedTable
    }else{
    foreach($row in $state.rows){$matches=@($state.before.tags|Where-Object {$_.name -ceq $row.name});if($nativeTagNames -ccontains $row.name){$newRows.Add($row)}elseif($matches.Count -eq 1){$state.updated+=Update-WeinviewExistingTag $Session $matches[0] $row}else{$newRows.Add($row)}}
    $state.import=@{native_imported_count=0;native_ignored_count=0;remove_existing=$false;replace_existing=$true}
    if($newRows.Count){$state.import=Import-WeinviewTags $Session $newRows.ToArray() ($p+'.request.csv')}
    }
    $state.after=Export-WeinviewTags $Session ($p+'.after.csv')
    [PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$state.expected,[PLCCode.Weinview.TagRow[]]$state.after.tags)
    Close-WeinviewTagLibrary $Session
    $Session.tag_evidence=$state.after
    if($addressEvidence){
     # Keep earlier step receipts intact and reuse the unchanged native device directory.
     $addressEvidence=$addressEvidence|Select-Object *
     $addressEvidence.tag_rows=@($state.after.tags);$addressEvidence.tags_sha256=$state.after.tags_sha256
     $addressEvidence.native_csv_path=$state.after.native_csv_path;$addressEvidence.table_origin=$state.after.table_origin
    }
   }
   'labels_upsert' {
    $state.applied=Invoke-WeinviewLabelApplyLibrary $Session $step $SourceSha256 ($p+'.apply')
    if(@($state.applied.bindings).Count){throw 'Batch labels_upsert must not apply Text bindings.'}
   }
   'events_append' {
    if($state.address_required){
     if(!$addressEvidence){$addressEvidence=Get-WeinviewCurrentAddressEvidence $Session ($p+'.address') $SourceSha256 $Session.tag_evidence}
     $state.address_evidence=$addressEvidence
    }
    $state.items=New-WeinviewEventRequests ([pscustomobject]@{expected_events_sha256=$state.before.events_sha256;events=$step.events}) $state.address_evidence.device_directory $state.address_evidence.tag_rows
    $state.candidate=Prepare-WeinviewEventAppend $state.before $state.items ($p+'.candidate')
    Open-WeinviewEvents $Session;Import-WeinviewEvents $Session $state.candidate
    $state.after=Export-WeinviewEvents $Session ($p+'.after')
    $state.after_proof=Assert-WeinviewEventTablesEqual $state.candidate.path $state.after.native_evidence_path ($p+'.after-proof')
    Close-WeinviewEvents $Session
   }
   'sampling_append' {
    if($state.address_required){
     if(!$addressEvidence){$addressEvidence=Get-WeinviewCurrentAddressEvidence $Session ($p+'.address') $SourceSha256 $Session.tag_evidence}
     $state.address_evidence=$addressEvidence
    }
    $state.applied=Invoke-WeinviewSamplingAppend $Session ($p+'.apply.before.csv') ($p+'.apply.candidate.csv') ($p+'.after.csv') $SourceSha256 $state.before.sha256 $state.items $state.address_evidence.device_directory $state.address_evidence.tag_rows
   }
  }
  if($state.kind -cnotin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update','screen_duplicate','screen_copy_objects','screen_move_objects','project_replace_address','window_create','window_copy','labels_bind')){$script:batchImportsCompleted++}
  $state.completed_in_memory=$true
 }
 $inventoryStates=@($Plan|Where-Object {$_.kind -cin @('screen_duplicate','screen_copy_objects','screen_move_objects')})
 foreach($window in @($inventoryStates|ForEach-Object {$_.window_number}|Select-Object -Unique)){
  if(@($inventoryStates|Where-Object {$_.window_number -eq $window -and $_.kind -cin @('screen_copy_objects','screen_move_objects')}).Count){$null=Open-WeinviewObjectCopyWindow $Session ([int]$window)}else{$null=Select-WeinviewBatchScreenWindow $Session ([int]$window)}
  $final=Get-WeinviewWindowObjectInventory $Session
  if($final.read_route -cne 'native_host' -or [int]$final.window_number -ne [int]$window){throw 'Final batch native object inventory required'}
  foreach($state in @($inventoryStates|Where-Object {$_.window_number -eq $window})){$state.final_inventory=$final}
 }
 $addressQueries=@(Get-WeinviewBatchAddressQueries $Plan)
 if($addressQueries.Count){
  $addressMatchRows=$null
  $addressCounts=Get-WeinviewNativeAddressQueryCounts $Session $addressQueries ([ref]$addressMatchRows)
  foreach($state in @($Plan|Where-Object {$_.kind -ceq 'project_replace_address'})){
   $state.final_source_count=[long]$addressCounts[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $false)]
   $state.final_target_count=[long]$addressCounts[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $true)]
   if($state.address_contract.range_enabled){
    $state.final_source_matches=@($addressMatchRows[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $false)])
    $state.final_target_matches=@($addressMatchRows[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $true)])
   }
  }
 }
 $windowCopyStates=@($Plan|Where-Object {$_.kind -ceq 'window_copy'})
 if($windowCopyStates.Count){
  $final=Read-WeinviewWindows $Session
  foreach($state in $windowCopyStates){$state.final_window_directory=$final}
 }
 if($MacroBefore){
  $macroAfter=Get-WeinviewBatchMacroSnapshot $Session ($Prefix+'.macros.after');Assert-WeinviewBatchMacroCatalog $MacroBefore $macroAfter $Plan
  foreach($state in @($Plan|Where-Object {$_.kind -cin @('macro_add','macro_update')})){
   $state.after=Get-WeinviewBatchMacroFile $macroAfter $state.request.macro_id $state.request.macro_name ($state.prefix+'.after.inspect')
   if($state.after.macro_source_sha256 -cne $state.candidate.macro_source_sha256 -or $state.after.metadata_lines_sha256 -cne $state.candidate.metadata_lines_sha256){throw 'Native imported macro source/metadata differs.'}
  }
 }
}
function Test-WeinviewBatchScreenSaveOnly($Plan) {
 $states=@($Plan);if($states.Count -lt 2){return $false}
 $additionKinds=@('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons')
 $hasUpdates=@($states|Where-Object {$_.kind -ceq 'screen_update'}).Count -gt 0
 $updateFields=@('kind','window_number','object_id','expected_object_sha256','source_step','source_object_index','description','rect','filled','corner','device_name','address_type','address','label','target_window','off_label','on_label','minimum','maximum','integer_digits','decimal_digits','operation_mode','text','position','font_size','font','alignment','numeric_font','numeric_size','label_font','label_size','numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb','use_shape','use_picture')
 $basicObjectKinds=@('rectangle','text','numeric_display','bit_switch','bit_lamp','window_button')
 foreach($state in $states){
  if($state.kind -cin $additionKinds){
   foreach($item in @($state.request.objects)){
    $fields=@($item.PSObject.Properties.Name)
    if($fields -ccontains 'tag_name'){return $false}
    if($state.kind -ceq 'screen_add_common_objects' -and $item.kind -cnotin @('rectangle','text','picture')){return $false}
    if($hasUpdates -and @($fields|Where-Object {$_ -cin @('function_action','media','import_mode','delete_after_import')}).Count){return $false}
   }
   if($hasUpdates){
    foreach($actual in @($state.applied.objects|Where-Object {$null -ne $_})){
     if(($actual.kind -cne 'picture' -and $actual.kind -cnotin $basicObjectKinds) -or ($actual.kind -ceq 'window_button' -and $actual.window.action -cne '切换基本窗口')){return $false}
    }
   }
  }elseif($state.kind -ceq 'screen_update'){
   $step=$state.request;$fields=@($step.PSObject.Properties.Name)
   if(@($fields|Where-Object {$_ -cnotin $updateFields}).Count){return $false}
   if($fields -ccontains 'source_step'){
    if($fields -cnotcontains 'source_object_index' -or $fields -ccontains 'object_id' -or [int]$step.source_step -lt 0 -or [int]$step.source_step -ge [int]$state.index){return $false}
    if($states[[int]$step.source_step].kind -cnotin $additionKinds){return $false}
    if($states[[int]$step.source_step].request.objects[[int]$step.source_object_index].kind -ceq 'picture'){return $false}
   }elseif($fields -ccontains 'source_object_index' -or [string]$step.object_id -cnotmatch '^(DW|TX|ND|NE|TS|BL|FK)_[0-9]+$'){return $false}
   # The plan can only nominate FK by ID. Rechecking these existing records after
   # applying the batch distinguishes basic window buttons without another read.
   foreach($actual in @(@($state.before,$state.applied.object_before,$state.applied.object_after)|Where-Object {$null -ne $_})){
    if($actual.kind -cnotin $basicObjectKinds -or ($actual.kind -ceq 'window_button' -and $actual.window.action -cne '切换基本窗口')){return $false}
   }
  }else{
   return $false
  }
 }
 return $true
}
function Get-WeinviewBatchSavedScreenResults($Plan) {
 $results=@();$scope=if(@($Plan|Where-Object {$_.kind -ceq 'screen_update'}).Count){'edited_fields_and_saved_project'}else{'creation_fields_and_saved_project'}
 foreach($state in $Plan){
  $applied=$state.applied;$isUpdate=$state.kind -ceq 'screen_update'
  if(!$state.completed_in_memory -or $(if($isUpdate){!$applied.target_only_verified -or !$applied.object_before -or !$applied.object_after}else{!$applied.native_fields_verified})){throw 'Saved screen batch requires completed native field reads.'}
  $beforeSnapshot=$applied.before_snapshot;$afterSnapshot=$applied.after_snapshot
  $beforeSnapshot=if($beforeSnapshot -and $beforeSnapshot.screen_snapshot){$beforeSnapshot.screen_snapshot}else{$beforeSnapshot}
  $afterSnapshot=if($afterSnapshot -and $afterSnapshot.screen_snapshot){$afterSnapshot.screen_snapshot}else{$afterSnapshot}
  # Creation snapshots keep the original actual fields and request-order IDs.
  # Later updates already replace screen_objects_after with the latest records.
  $createdObjects=@()
  if(!$isUpdate){
   $createdObjects=@(foreach($created in @($state.objects_created)){
    $actual=@($afterSnapshot.objects|Where-Object {$_.object_id -ceq $created.object_id})
    if($actual.Count -ne 1 -or !$actual[0].supported){throw 'Created native object record unavailable in saved batch.'}
    $actual[0]
   })
  }
  $objects=@(foreach($current in @($state.screen_objects_after)){
   # Native Numeric/Bit/Window Button ObjectRecords carry their canonical fields
   # directly; only some object kinds also expose a canonical_json convenience field.
   if($current.supported){Copy-WeinviewBatchObjectRecord $current;continue}
   # Some addition results contain normalized creation fields. Reuse their full
   # native creation reads only while they still describe that same current state.
   $actual=@($createdObjects|Where-Object {$_.object_id -ceq $current.object_id -and $_.object_sha256 -ceq $current.object_sha256})
   if($actual.Count -ne 1){throw 'Final native object record unavailable in saved batch.'}
   Copy-WeinviewBatchObjectRecord $actual[0]
  })
  $proof=@{kind=$state.kind;index=$state.index;scope=$scope;target_readback_scope=$scope;persisted_verified=$false;preflight_before_import=$true;preflight_before_mutation=$true;screen=[int]$state.window_number;window_number=[int]$state.window_number;canvas_width=[int]$state.canvas_width;canvas_height=[int]$state.canvas_height;native_window_geometry=$state.native_window_geometry;target_fields_verified=$true;objects_after=$objects;objects_readback=@();alarm_displays_after=@();alarm_displays_readback=@();before_snapshot=$beforeSnapshot;after_snapshot=$afterSnapshot;full_properties_verified=$false;project_saved=$true;reopen_verified=$false;normal_main_exit_verified=$true;normal_reopen_exit_verified=$false;source_unchanged=$true;native_evidence_path=if($applied.native_evidence_prefix){[string]$applied.native_evidence_prefix}else{$state.prefix}}
  if($isUpdate){
   $step=$state.request
   $proof.object_initial=$state.before;$proof.object_before=$applied.object_before;$proof.object_after=$applied.object_after;$proof.objects=@($applied.object_after)
   $proof.target_only_verified=$true;$proof.untouched_objects_verified=$false;$proof.untouched_objects_verification_scope='not inspected; target object only'
   $proof.requested_initial_object_sha256=if($step.PSObject.Properties.Name -ccontains 'expected_object_sha256'){[string]$step.expected_object_sha256}else{$null}
   $proof.effective_before_object_sha256=[string]$applied.object_before.object_sha256
   if($null -ne $state.source_step){$proof.source_step=[int]$state.source_step;$proof.source_object_index=[int]$state.source_object_index;$proof.effective_object_id=[string]$state.effective_update_request.object_id}
   $effectiveId=[string]$state.effective_update_request.object_id
   $proof.superseded_by_later_step=(@($Plan|Where-Object {$_.index -gt $state.index -and $_.kind -ceq 'screen_update' -and $_.window_number -eq $state.window_number -and $_.effective_update_request.object_id -ceq $effectiveId}).Count -gt 0)
   if($applied.appearance_color_evidence){$proof.appearance_color_evidence=$applied.appearance_color_evidence}
   if($applied.appearance_shape_evidence){$proof.appearance_shape_evidence=$applied.appearance_shape_evidence}
  }else{
   $proof.objects_created=$createdObjects
   if($state.caption_ownership){$proof.caption_ownership=@($state.caption_ownership)}
   if($applied.resource_bindings){$proof.resource_bindings=@($applied.resource_bindings)}
   $proof.appearance_color_evidence=@(foreach($pending in @($applied.appearance_color_evidence|Where-Object {$null -ne $_})){[pscustomobject]@{object_id=$pending.object_id;requested=$pending.requested;after=$pending.after}})
   $proof.appearance_shape_evidence=@($applied.appearance_shape_evidence|Where-Object {$null -ne $_})
   if($state.kind -ceq 'screen_add_numeric'){$proof.rectangle_adjustments=@($applied.rectangle_adjustments|Where-Object {$null -ne $_})}
  }
  $results+=,$proof
 }
 return ,$results
}
function Test-WeinviewBatchCreationOnly($Plan) {
 if(@($Plan|Where-Object {$_.kind -ceq 'screen_update'}).Count){return $false}
 return Test-WeinviewBatchScreenSaveOnly $Plan
}
function Get-WeinviewBatchCreationResults($Plan) {
 if(@($Plan|Where-Object {$_.kind -ceq 'screen_update'}).Count){throw 'Creation-only receipt cannot contain updates.'}
 return ,(Get-WeinviewBatchSavedScreenResults $Plan)
}
function Get-WeinviewBatchSessionResults($Plan) {
 # Each import already reads the fields it changes. Keep these actual results
 # across calls without opening the project or every property dialog again.
 $results=@()
 foreach($state in $Plan){
  if(!$state.completed_in_memory){throw ('Native step did not finish: '+$state.kind)}
  $proof=@{index=[int]$state.index;kind=[string]$state.kind;scope='editor_session_saved';completed_in_memory=$true;native_fields_verified=$true;persisted_verified=$false;reopen_verified=$false}
  foreach($field in @('window_number','canvas_width','canvas_height','native_window_geometry','objects_created','screen_objects_after','alarm_displays_after','final_inventory','final_window_directory')){
   if($state.ContainsKey($field)){$proof[$(if($field -ceq 'screen_objects_after'){'objects_after'}else{$field})]=$state[$field]}
  }
  if($state.applied){
   $proof.applied=$state.applied
   foreach($field in @('object_before','object_after','objects','sampling_bindings','appearance_color_evidence','appearance_shape_evidence','rectangle_adjustments','heading_edit')){
    if($null -ne $state.applied.$field){$proof[$field]=$state.applied.$field}
   }
  }
  switch -CaseSensitive ($state.kind){
   'window_create' {
    $created=$state.applied
    if(!$created.created_window -or !$created.preserved_existing_windows){throw 'Completed window creation lacks its native directory result.'}
    $proof.created_window=$created.created_window;$proof.windows_before=@($created.windows_before);$proof.windows_after=@($created.windows)
    $proof.before_window_set_sha256=[string]$created.before_window_set_sha256;$proof.window_set_sha256=[string]$created.window_set_sha256;$proof.preserved_existing_windows=$true
   }
   'screen_update' {
    if(!$state.applied.object_after){throw 'Completed update lacks its native object result.'}
    $proof.object_initial=$state.before
    if($null -ne $state.source_step){$proof.source_step=[int]$state.source_step;$proof.effective_object_id=[string]$state.effective_update_request.object_id;if($null -ne $state.source_object_index){$proof.source_object_index=[int]$state.source_object_index}}
    $proof.superseded_by_later_step=(@($Plan|Where-Object {$_.index -gt $state.index -and $_.kind -ceq 'screen_update' -and $_.window_number -eq $state.window_number -and $_.effective_update_request.object_id -ceq $state.effective_update_request.object_id}).Count -gt 0)
   }
   'tags_upsert' {
    if(!$state.after){throw 'Completed tag import lacks its native export.'}
    $proof.tags_after=@($state.after.tags);$proof.after_tags_sha256=$state.after.tags_sha256;$proof.import_options=$state.import
   }
   'events_append' {
    if(!$state.after -or !$state.after_proof){throw 'Completed event import lacks its native export.'}
    $proof.events_added=@($state.items).Count;$proof.event_count=$state.after.event_count;$proof.address_bindings=@($state.items);$proof.after_events_sha256=$state.after.events_sha256
    $proof.event_table=Get-WeinviewEventSummary $state.after
   }
   {$_ -cin @('macro_add','macro_update')} {
    if(!$state.after){throw 'Completed macro import lacks its native readback.'}
    $proof.macro_id=[int]$state.request.macro_id;$proof.macro_name=[string]$state.request.macro_name;$proof.macro_after=$state.after
   }
  }
  # These booleans describe only work observed before the save. The Worker
  # attaches the saved project and live/closed editor state after saving.
  $results+=,$proof
 }
 return ,$results
}
function Test-WeinviewBatchPersistence($Session,$Plan,$MacroBefore,[string]$Prefix,[string]$SavedSha256) {
 $macroReopened=$null
 if($MacroBefore){$macroReopened=Get-WeinviewBatchMacroSnapshot $Session ($Prefix+'.macros.reopened');Assert-WeinviewBatchMacroCatalog $MacroBefore $macroReopened $Plan}
 $screenKinds=@('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons','screen_add_trends','alarm_display_add','recipe_view_add','screen_update')
 $screenStates=@($Plan|Where-Object {$_.kind -cin $screenKinds})
 $screenReadback=$null
 $tagBoundTargets=@($screenStates|ForEach-Object {$_.screen_objects_after}|Where-Object {$_.data.tag_name -or $_.bit.tag_name})
 if($tagBoundTargets.Count){$null=Open-WeinviewTagLibrary $Session;$Session.tag_evidence=Export-WeinviewTags $Session ($Prefix+'.screen-tags-reopened.csv');Close-WeinviewTagLibrary $Session}
 if($screenStates.Count){$screenReadback=Assert-WeinviewProjectScreenBatchTargets $Session $screenStates $SavedSha256 ($Prefix+'.screen-reopened')}
 $inventoryStates=@($Plan|Where-Object {$_.kind -cin @('screen_duplicate','screen_copy_objects','screen_move_objects')})
 foreach($window in @($inventoryStates|ForEach-Object {$_.window_number}|Select-Object -Unique)){
  if(@($inventoryStates|Where-Object {$_.window_number -eq $window -and $_.kind -cin @('screen_copy_objects','screen_move_objects')}).Count){$null=Open-WeinviewObjectCopyWindow $Session ([int]$window)}else{$null=Select-WeinviewBatchScreenWindow $Session ([int]$window)}
  $reopened=Get-WeinviewWindowObjectInventory $Session
  $expected=@($inventoryStates|Where-Object {$_.window_number -eq $window})[0].final_inventory
  $comparison=Assert-WeinviewNativeMultiCopyFinalInventory $expected $reopened
  foreach($state in @($inventoryStates|Where-Object {$_.window_number -eq $window})){$state.final_inventory_reopened=$reopened;$state.final_inventory_comparison=$comparison}
 }
 foreach($state in @($Plan|Where-Object {$_.kind -ceq 'screen_copy_objects' -and $null -ne $_.object_copy_contract.address_replacements -and @($_.object_copy_contract.address_replacements).Count})){
  $state.address_verified_reopened=Assert-WeinviewObjectCopyAddressReferences $Session $state.applied ($state.prefix+'.reopened.address')
 }
 $addressQueries=@(Get-WeinviewBatchAddressQueries $Plan)
 if($addressQueries.Count){
  $addressMatchRows=$null
  $addressCounts=Get-WeinviewNativeAddressQueryCounts $Session $addressQueries ([ref]$addressMatchRows)
  foreach($state in @($Plan|Where-Object {$_.kind -ceq 'project_replace_address'})){
   $state.reopened_source_count=[long]$addressCounts[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $false)]
   $state.reopened_target_count=[long]$addressCounts[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $true)]
   if($state.reopened_source_count -ne $state.final_source_count -or $state.reopened_target_count -ne $state.final_target_count){throw 'Saved/reopened final batch address counts differ'}
   if($state.address_contract.range_enabled){
    $state.reopened_source_matches=@($addressMatchRows[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $false)])
    $state.reopened_target_matches=@($addressMatchRows[(Get-WeinviewNativeAddressCountKey $state.address_arguments $state.address_contract $true)])
    Assert-WeinviewNativeRangeMatchMultiset $state.reopened_source_matches $state.final_source_matches
    Assert-WeinviewNativeRangeMatchMultiset $state.reopened_target_matches $state.final_target_matches
   }
  }
 }
 $windowCopyStates=@($Plan|Where-Object {$_.kind -ceq 'window_copy'})
 if($windowCopyStates.Count){
  $reopened=Read-WeinviewWindows $Session
  $final=$windowCopyStates[0].final_window_directory
  if($reopened.window_set_sha256 -cne $final.window_set_sha256){throw 'Saved/reopened final batch window directory differs.'}
  foreach($state in $windowCopyStates){$state.reopened_window_directory=$reopened}
 }
 $results=@()
 foreach($state in $Plan){
  $step=$state.request;$p=$state.prefix;$script:stage='batch_reopen_'+$state.kind
  $proof=@{kind=$state.kind;index=$state.index;persisted_verified=$true;preflight_before_import=$true;preflight_before_mutation=$true}
  switch -CaseSensitive ($state.kind) {
   'labels_bind' {
    $applied=$state.applied
    if(@($applied.applied_labels).Count -or $applied.native_import_verified){throw 'Batch Text binding unexpectedly imported Label Library content.'}
    $readback=Read-WeinviewPersistedLabelApply $Session $applied $SavedSha256 ($p+'.reopened')
    if(!$readback.bindings_reopened_verified -or @($readback.bindings).Count -ne @($state.effective_bindings).Count){throw 'Saved/reopened native Text bindings differ.'}
    foreach($field in @('applied_labels','language_slots','labels_expected_table_sha256','empty_library_bootstrapped','native_import_verified','native_import_replacement_prompt_confirmed','preserved_existing_labels')){$proof[$field]=$applied[$field]}
    $proof.labels_reopened_table_sha256=$readback.labels_table_sha256;$proof.labels_table_reopened_verified=[bool]$readback.labels_table_reopened_verified
    $proof.bindings=@($readback.bindings);$proof.bindings_reopened_verified=$true
    $proof.effective_bindings=@($state.effective_bindings);$proof.binding_sources=@($state.binding_sources)
    $proof.compile_verified=$false;$proof.runtime_verified=$false
   }
   'window_copy' {
    $copy=$state.applied
    if(!$copy.native_copy_posted_once -or $copy.dependencies_relinked -or $copy.project_saved){throw 'Native window-copy batch apply receipt differs.'}
    $proof.window_copy=@{profile=$copy.profile;donor_path=$copy.donor_path;donor_sha256=$copy.donor_sha256;copied_windows=@($copy.copied_windows);windows_before=@($copy.windows_before);windows_after=@($copy.windows_after);window_set_sha256=$copy.window_set_sha256;before_window_set_sha256=$copy.before_window_set_sha256;copy_macros=[bool]$copy.copy_macros;copy_events=[bool]$copy.copy_events;copy_underlay=[bool]$copy.copy_underlay;native_copy_posted_once=$true;dependencies_relinked=$false;runtime_verified=$false;source_unchanged=$true;project_saved=$true;reopen_verified=$true;normal_main_exit_verified=$true;normal_reopen_exit_verified=$true}
   }
   'project_replace_address' {
    $proof.scope=[string]$state.address_contract.scope
    if($proof.scope -ceq 'window'){$proof.window_number=[int]$state.address_contract.window_number}
    $replacement=$state.applied
    $replacement.final_source_count=[long]$state.final_source_count;$replacement.final_target_count=[long]$state.final_target_count
    $replacement.reopened_source_count=[long]$state.reopened_source_count;$replacement.reopened_target_count=[long]$state.reopened_target_count
    $replacement.final_state_verified=$true;$replacement.persisted_verified=$true
    if($state.address_contract.range_enabled){foreach($field in @('final_source_matches','final_target_matches','reopened_source_matches','reopened_target_matches')){$replacement[$field]=@($state[$field])}}
    $proof.address_replacement=$replacement
    $proof.native_evidence_path=$state.prefix+'.apply.json'
   }
   'screen_copy_objects' {
    $applied=$state.applied
    foreach($field in @('scope','window_number','source_object_ids','before_count','after_count','translation','added_objects','copied_properties_verified','inventory_route')){$proof[$field]=$applied.$field}
    foreach($field in @('requested_translation','group_shift','requested_object_ids','selection_route','selection_rectangle','selection_points','selected_ids','source_step','reference_source_object_ids','effective_object_ids')){if($applied.PSObject.Properties.Name -ccontains $field){$proof[$field]=$applied.$field}}
    if($state.object_copy_contract.external_donor){foreach($field in @('donor_path','donor_sha256','donor_window_number','donor_object_count','donor_unchanged','normal_donor_exit_verified','donor_payload_reused')){$proof[$field]=$state[$field]}}
    if($null -ne $state.object_copy_contract.address_replacements -and @($state.object_copy_contract.address_replacements).Count){
     if(!$state.address_verified_in_memory.copied_address_references_verified -or !$state.address_verified_reopened.copied_address_references_verified){throw 'Batch copied native address references failed in-memory or reopened verification.'}
     $proof.address_replacements=@($applied.address_replacements)
     $proof.copied_address_references_verified=$true
     $proof.copied_address_reference_scope=[string]$state.address_verified_reopened.copied_address_reference_scope
     if(@($state.object_copy_contract.address_replacements|Where-Object {$_.contract.range_enabled}).Count){
      if(!$state.address_verified_in_memory.copied_range_address_references_verified -or !$state.address_verified_reopened.copied_range_address_references_verified){throw 'Batch copied range addresses differ before save or after reopen.'}
      $proof.copied_range_address_references_verified=$true
     }
    }
    $proof.screen=[int]$state.window_number
    $proof.final_window_count=[int]$state.final_inventory_comparison.final_window_count
    if($proof.final_window_count -lt [int]$applied.after_count){throw 'Final batch window inventory lost copied objects'}
    $proof.target_readback_scope='native_host final window inventory; object identity, kind and geometry'
    $proof.native_evidence_path=$state.prefix+'.apply.json'
   }
   'screen_move_objects' {
    $applied=$state.applied
    foreach($field in @('scope','window_number','object_ids','before_count','after_count','translation','moved_objects','inventory_route','properties_verified','other_object_geometry_unchanged')){$proof[$field]=$applied.$field}
    foreach($field in @('group_shift','selection_route','selection_rectangle','selection_points','selected_ids','source_step','source_object_ids')){if($applied.PSObject.Properties.Name -ccontains $field){$proof[$field]=$applied.$field}}
    $proof.screen=[int]$state.window_number
    $proof.reopen_verified=$true;$proof.normal_reopen_exit_verified=$true
    $proof.final_window_count=[int]$state.final_inventory_comparison.final_window_count
    $proof.target_readback_scope='native_host final window inventory; object identity, kind and geometry'
    $proof.native_evidence_path=$state.prefix+'.apply.json'
   }
   'screen_duplicate' {
    $applied=$state.applied
    foreach($field in @('scope','window_number','seed_object_id','seed_native_kind','columns','rows','x_spacing','y_spacing','address_offset','before_count','after_count','added_objects','native_copy_ms','inventory_route','seed_rectangle')){$proof[$field]=$applied.$field}
    if($null -ne $state.source_step){$proof.source_step=[int]$applied.source_step;$proof.source_object_id=[string]$applied.source_object_id}
    $proof.screen=[int]$state.window_number;$proof.canvas_width=[int]$state.canvas_width;$proof.canvas_height=[int]$state.canvas_height;$proof.native_window_geometry=$state.native_window_geometry
    $proof.final_window_count=[int]$state.final_inventory_comparison.final_window_count
    $proof.target_readback_scope='native_host final window inventory; object identity, kind and geometry'
    $proof.native_evidence_path=$state.prefix+'.apply.json'
   }
   {$_ -cin $screenKinds} {
    $proof.screen=[int]$state.window_number;$proof.window_number=[int]$state.window_number
    $proof.canvas_width=[int]$state.canvas_width;$proof.canvas_height=[int]$state.canvas_height;$proof.native_window_geometry=$state.native_window_geometry
    $proof.target_fields_verified=if($state.kind -ceq 'recipe_view_add'){[bool]$state.applied.native_object_created}else{[bool]$state.applied.native_fields_verified -or $state.kind -ceq 'screen_update'}
    if(!$proof.target_fields_verified){throw 'Batch screen low-level target fields were not verified'}
    $proof.objects_after=@($state.screen_objects_after);$proof.alarm_displays_after=@($state.alarm_displays_after)
    if($state.kind -ceq 'screen_add_numeric'){$proof.rectangle_adjustments=@($state.applied.rectangle_adjustments|Where-Object {$null -ne $_})}
     if($state.objects_created){$proof.objects_created=@($state.objects_created)}
    $ordinary=@();foreach($object in @($state.screen_objects_after)){
     $matches=@($screenReadback.targets|Where-Object {$_.window_number -eq $state.window_number -and $_.object_id -ceq $object.object_id -and $_.kind -cne 'directory_only'})
     if($matches.Count -ne 1){throw 'Persisted batch ordinary target missing or duplicated'}
     $ordinary+=,$matches[0].object
    }
    $alarms=@();foreach($object in @($state.alarm_displays_after)){
     $matches=@($screenReadback.targets|Where-Object {$_.window_number -eq $state.window_number -and $_.object_id -ceq $object.object_id -and $_.kind -ceq 'alarm_display'})
     if($matches.Count -ne 1){throw 'Persisted batch Alarm Display target missing or duplicated'}
     $alarms+=,[pscustomobject]@{object_id=$matches[0].object_id;actual=$matches[0].actual;observed_properties_sha256=$matches[0].actual_sha256;native_fields_verified=$true;full_properties_verified=$false}
    }
    $proof.objects_readback=$ordinary;$proof.alarm_displays_readback=$alarms
    if($state.kind -ceq 'screen_add_bit_switches'){
     $proof.tag_bindings=@($state.applied.tag_bindings)
     for($bitIndex=0;$bitIndex -lt @($state.items).Count;$bitIndex++){
      $requestedTag=[string]$state.items[$bitIndex].tag_name
      if(!$requestedTag){continue}
      $added=$state.applied.objects[$bitIndex];$reopened=@($ordinary|Where-Object {$_.object_id -ceq $added.object_id})
      $selected=@($proof.tag_bindings|Where-Object {$_.object_id -ceq $added.object_id -and $_.tag_name -ceq $requestedTag -and $_.native_object_selection_verified})
      if($selected.Count -ne 1){throw 'Batch added bit native Tag selection differs'}
      $laterBinding=@($Plan|Where-Object {$_.index -gt $state.index -and $_.kind -ceq 'screen_update' -and $_.window_number -eq $state.window_number -and $_.effective_update_request.object_id -ceq $added.object_id -and @($_.request.PSObject.Properties.Name|Where-Object {$_ -cin @('tag_name','device_name','address_type','address')}).Count})
      if($laterBinding.Count){continue}
      if($reopened.Count -ne 1 -or $reopened[0].bit.tag_name -cne $requestedTag){throw 'Persisted batch bit Tag name differs'}
      foreach($field in @('device','address_type','address')){if([string]$reopened[0].bit.$field -cne [string]$selected[0].$field){throw ('Persisted batch bit Tag binding differs: '+$field)}}
     }
    }
    $proof.target_readback_scope=$screenReadback.scope
    $beforeSnapshot=$state.applied.before_snapshot;$afterSnapshot=$state.applied.after_snapshot
    $proof.before_snapshot=if($beforeSnapshot -and $beforeSnapshot.screen_snapshot){$beforeSnapshot.screen_snapshot}else{$beforeSnapshot}
    $proof.after_snapshot=if($afterSnapshot -and $afterSnapshot.screen_snapshot){$afterSnapshot.screen_snapshot}else{$afterSnapshot}
    if($state.kind -ceq 'screen_update'){
     $proof.object_initial=$state.before;$proof.object_before=$state.applied.object_before;$proof.object_after=$state.applied.object_after
     $proof.requested_initial_object_sha256=if($step.PSObject.Properties.Name -ccontains 'expected_object_sha256'){[string]$step.expected_object_sha256}else{$null}
     $proof.effective_before_object_sha256=[string]$state.applied.object_before.object_sha256
     if($null -ne $state.source_step){$proof.source_step=[int]$state.source_step;$proof.effective_object_id=[string]$state.effective_update_request.object_id;if($null -ne $state.source_object_index){$proof.source_object_index=[int]$state.source_object_index}else{$proof.source_object_id=[string]$state.source_object_id}}
    }
    $effectiveId=if($state.kind -ceq 'screen_update'){[string]$state.effective_update_request.object_id}else{[string]$step.object_id}
    $later=@($Plan|Where-Object {$_.index -gt $state.index -and $_.kind -ceq 'screen_update' -and $_.window_number -eq $state.window_number -and $_.effective_update_request.object_id -ceq $effectiveId})
    $proof.superseded_by_later_step=($state.kind -ceq 'screen_update' -and $later.Count -gt 0)
    if($state.kind -ceq 'screen_update' -and $step.PSObject.Properties.Name -ccontains 'tag_name'){
     $proof.tag_binding_evidence=$state.applied.tag_binding_evidence
     if(!$proof.tag_binding_evidence.native_object_selection_verified -or $proof.tag_binding_evidence.tag_name -cne [string]$step.tag_name -or $ordinary.Count -ne 1){throw 'Batch native Tag selection evidence missing or mismatched'}
     $immediateTag=if($state.applied.object_after.kind -ceq 'numeric_display'){$state.applied.object_after.data}else{$state.applied.object_after.bit}
     if($immediateTag.tag_name -cne [string]$step.tag_name){throw 'Batch immediate native Tag name differs'}
     foreach($field in @('device','address_type','address')){if([string]$immediateTag.$field -cne [string]$proof.tag_binding_evidence.$field){throw ('Batch immediate native Tag binding differs: '+$field)}}
     if(!$proof.superseded_by_later_step){
      $reopenedTag=if($ordinary[0].kind -ceq 'numeric_display'){$ordinary[0].data}else{$ordinary[0].bit}
      if($reopenedTag.tag_name -cne [string]$step.tag_name){throw 'Persisted batch native Tag name differs'}
      foreach($field in @('device','address_type','address')){if([string]$reopenedTag.$field -cne [string]$proof.tag_binding_evidence.$field){throw ('Persisted batch native Tag binding differs: '+$field)}}
     }
    }
     if($state.kind -ceq 'screen_update' -and $state.applied.appearance_color_evidence){
      $pending=$state.applied.appearance_color_evidence
      $targetColor=@($screenReadback.targets|Where-Object {$_.window_number -eq $state.window_number -and $_.object_id -ceq $pending.object_id})
      $hiddenFill=($state.screen_objects_after[0].kind -ceq 'rectangle' -and $state.screen_objects_after[0].filled -eq $false)
      if($targetColor.Count -ne 1 -or (!$targetColor[0].appearance_color -and !$hiddenFill)){throw 'Batch updated RGB target readback missing'}
      $finalColor=if($targetColor[0].appearance_color){$targetColor[0].appearance_color}else{[pscustomobject]@{}}
      $proof.appearance_color_evidence=[pscustomobject]@{object_id=$pending.object_id;before=$pending.before;requested=$pending.requested;after=$pending.after;reopened=$finalColor;native_rgb_verified=$true}
     }
     if($state.kind -cin @('screen_add_common_objects','screen_add_numeric','screen_add_bit_switches','screen_add_window_buttons')){
      $colorProof=@()
      foreach($pending in @($state.applied.appearance_color_evidence|Where-Object {$null -ne $_})){
       $targetColor=@($screenReadback.targets|Where-Object {$_.window_number -eq $state.window_number -and $_.object_id -ceq $pending.object_id})
       $finalObject=@($state.screen_objects_after|Where-Object {$_.object_id -ceq $pending.object_id})
       $hiddenFill=($finalObject.Count -eq 1 -and $finalObject[0].kind -ceq 'rectangle' -and $finalObject[0].filled -eq $false)
       if($targetColor.Count -ne 1 -or (!$targetColor[0].appearance_color -and !$hiddenFill)){throw 'Batch added RGB target readback missing'}
       $finalColor=if($targetColor[0].appearance_color){$targetColor[0].appearance_color}else{[pscustomobject]@{}}
       $laterColors=@($Plan|Where-Object {$_.index -gt $state.index -and $_.kind -ceq 'screen_update' -and $_.window_number -eq $state.window_number -and $_.effective_update_request.object_id -ceq $pending.object_id})
       foreach($field in @($pending.requested.PSObject.Properties.Name)){
        if($hiddenFill -and $field -ceq 'fill_rgb'){continue}
        $expected=$pending.requested.$field
        foreach($later in $laterColors){if($later.request.PSObject.Properties.Name -ccontains $field){$expected=$later.request.$field}}
        if((@($finalColor.$field) -join ',') -cne (@($expected) -join ',')){throw ('Batch final RGB differs after reopen: '+$field)}
       }
       $colorProof+=,[pscustomobject]@{object_id=$pending.object_id;requested=$pending.requested;after=$pending.after;reopened=$finalColor;native_rgb_verified=$true}
      }
      $proof.appearance_color_evidence=$colorProof
     }
    $proof.native_evidence_path=if($state.applied.native_evidence_prefix){[string]$state.applied.native_evidence_prefix}else{$state.prefix}
   }
   {$_ -cin @('macro_add','macro_update')} {
    $current=Get-WeinviewBatchMacroFile $macroReopened $step.macro_id $step.macro_name ($p+'.reopened.inspect')
    if($current.macro_source_sha256 -cne $state.candidate.macro_source_sha256 -or $current.metadata_lines_sha256 -cne $state.candidate.metadata_lines_sha256 -or $current.ebm_sha256 -cne $state.after.ebm_sha256){throw 'Saved macro source/metadata differs.'}
    $proof.macro_id=$step.macro_id;$proof.macro_name=$step.macro_name;$proof.source=$current.source;$proof.macro_source_sha256=$current.macro_source_sha256;$proof.metadata_lines_sha256=$current.metadata_lines_sha256
    $proof.execution_metadata_before=$state.candidate.original_metadata;$proof.execution_metadata=$current.metadata
    $proof.execution_metadata_preserved=[bool]$state.candidate.execution_metadata_preserved
    $proof.unrequested_execution_metadata_preserved=[bool]$state.candidate.unrequested_execution_metadata_preserved
    $proof.execution_update_verified=$true
    if($state.before){$proof.native_ebm_before_path=$state.before.native_ebm_path;$proof.native_ebm_before_sha256=$state.before.ebm_sha256}
    $proof.before_source_sha256=if($state.before){$state.before.macro_source_sha256}else{$null}
    $proof.before_metadata_sha256=if($state.before){$state.before.metadata_lines_sha256}else{$null}
    $proof.candidate_path=$state.candidate_path;$proof.candidate_sha256=$state.candidate.ebm_sha256;$proof.native_evidence_path=$current.native_ebm_path;$proof.native_evidence_sha256=$current.ebm_sha256;$proof.source_written_through_editor=$false
    $proof.macros_before=$MacroBefore.exported_macros;$proof.macros_reopened=$macroReopened.exported_macros
   }
   'tags_upsert' {
    $Session.tag_prefix=$p+'.reopen';$null=Open-WeinviewTagLibrary $Session;$current=Export-WeinviewTags $Session ($p+'.reopened.csv')
    [PLCCode.Weinview.TagCsvCodec]::AssertSame([PLCCode.Weinview.TagRow[]]$state.expected,[PLCCode.Weinview.TagRow[]]$current.tags)
    if($current.tags_sha256 -cne $state.after.tags_sha256){throw 'Saved tags CSV differs.'};Close-WeinviewTagLibrary $Session
    $proof.before_table_origin=$state.before.table_origin;$proof.before_empty_evidence=$state.before.empty_evidence;$proof.tags_before=@($state.before.tags);$proof.tags_after=@($state.after.tags);$proof.tags_reopened=@($current.tags)
    $proof.before_tags_sha256=$state.before.tags_sha256;$proof.after_tags_sha256=$state.after.tags_sha256;$proof.reopened_tags_sha256=$current.tags_sha256;$proof.untouched_tags_verified=$true
    $proof.native_evidence_path=$current.native_csv_path;$proof.native_evidence_sha256=$current.tags_sha256;$proof.native_devices=$state.devices;$proof.import_options=$state.import
   }
   'labels_upsert' {
    $applied=$state.applied
    if(@($applied.bindings).Count){throw 'Batch labels_upsert has unexpected Text bindings.'}
    $readback=Read-WeinviewPersistedLabelApply $Session $applied $SavedSha256 ($p+'.reopened')
    if(!$readback.labels_table_reopened_verified -or $readback.labels_table_sha256 -cne $applied.labels_expected_table_sha256 -or !$readback.bindings_reopened_verified -or @($readback.bindings).Count){throw 'Saved/reopened native Label Library differs.'}
    foreach($field in @('applied_labels','language_slots','labels_expected_table_sha256','empty_library_bootstrapped','native_import_verified','native_import_replacement_prompt_confirmed','preserved_existing_labels')){$proof[$field]=$applied[$field]}
    $proof.labels_reopened_table_sha256=$readback.labels_table_sha256
    $proof.labels_table_reopened_verified=$true;$proof.bindings=@();$proof.bindings_reopened_verified=$true
    $proof.native_evidence_path=$p+'.reopened.labels.xlsx';$proof.native_evidence_sha256=Hash $proof.native_evidence_path
    $proof.compile_verified=$false;$proof.runtime_verified=$false
   }
   'events_append' {
    Open-WeinviewEvents $Session;$current=Export-WeinviewEvents $Session ($p+'.reopened');$reopenProof=Assert-WeinviewEventTablesEqual $state.candidate.path $current.native_evidence_path ($p+'.reopen-proof')
    $history=(Read-WeinviewEventHistoryGlobalState $Session).history_global_state
    if(($state.history_before|ConvertTo-Json -Compress) -cne ($history|ConvertTo-Json -Compress)){throw 'Event history global settings changed.'};Close-WeinviewEvents $Session
    $proof.before_events_sha256=$state.before.events_sha256;$proof.after_events_sha256=$state.after.events_sha256;$proof.reopened_events_sha256=$current.events_sha256;$proof.events_added=$state.items.Count;$proof.event_count=$current.event_count
    $proof.address_bindings=@($state.items)
    $proof.event_table=Get-WeinviewEventSummary $current;$proof.table_origin=$current.table_origin;$proof.table_evidence_path=$current.table_evidence_path;$proof.native_evidence_path=$current.native_evidence_path;$proof.native_evidence_sha256=$current.events_sha256
    $proof.candidate_sha256=$state.candidate.sha256;$proof.after_comparison=$state.after_proof;$proof.reopen_comparison=$reopenProof;$proof.all_old_events_preserved=$true;$proof.full_event_fields_verified=$true;$proof.runtime_alarm_verified=$false;$proof.external_server_alarm_verified=$false;$proof.history_settings_preserved=$true
   }
   'sampling_append' {
    $current=Invoke-WeinviewSamplingRead $Session ($p+'.reopened.csv') $SavedSha256;$null=Assert-WeinviewSamplingPersisted $state.applied $current.sampling_csv
    foreach($field in $state.applied.PSObject.Properties){$proof[$field.Name]=$field.Value}
    $proof.reopened_csv=$current.sampling_csv;$proof.reopened_export_evidence=$current.native_export_evidence;$proof.persisted_verified=$true
    $proof.native_evidence_path=$current.csv_path;$proof.native_evidence_sha256=$current.sha256
   }
  }
  if($state.address_evidence){$proof.address_evidence=@{native_csv_path=$state.address_evidence.native_csv_path;tags_sha256=$state.address_evidence.tags_sha256;native_directory_verified=$state.address_evidence.native_directory_verified;native_tags_verified=$state.address_evidence.native_tags_verified}}
  if($state.applied.appearance_shape_evidence){$proof.appearance_shape_evidence=$state.applied.appearance_shape_evidence}
  if($state.caption_ownership){$proof.caption_ownership=@($state.caption_ownership)}
  $proof.project_saved=$true;$proof.reopen_verified=$true;$proof.normal_main_exit_verified=$true;$proof.normal_reopen_exit_verified=$true;$proof.source_unchanged=$true
  $results+=,$proof
 }
 return ,$results
}
