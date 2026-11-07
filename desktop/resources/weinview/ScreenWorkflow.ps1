# Owned original-editor screen inspection/update. Caller controls save/close/reopen.
. (Join-Path $PSScriptRoot 'ObjectContracts.ps1')
. (Join-Path $PSScriptRoot 'WindowDirectory.ps1')

function Set-WeinviewScreenSession($Session,[string]$Project,[string]$Exe,[string]$IdentityPath){
 $Session.project_path=$Project;$Session.output_path=$Project;$Session.exe_path=$Exe;$Session.identity_path=$IdentityPath
 WritePrivateJson $IdentityPath @{Pid=$Session.process.Id;CreationTicks=$Session.process.StartTime.ToUniversalTime().Ticks;Exe=$Exe;Project=$Project}
}
function New-WeinviewObjectRecord([string]$Id,$Actual,[switch]$CanonicalInput){
 if($CanonicalInput){
  if($Actual.object_id -cne $Id -or @($Actual.PSObject.Properties.Name).Count -ne 6 -or $Actual.kind -cnotin @('option_list','picture')){throw 'Verified canonical Option List or Picture object required'}
  $canonical=[ordered]@{};foreach($property in $Actual.PSObject.Properties){$canonical[$property.Name]=$property.Value}
 }else{$canonical=CanonicalObject $Id $Actual}
 $record=[ordered]@{}
 foreach($field in $canonical.Keys){$record[$field]=$canonical[$field]}
 if($canonical.kind -ceq 'numeric_display' -and $Actual.native_font){$record.native_font=[string]$Actual.native_font}
 $record.object_sha256=CanonicalObjectHash $canonical;$record.supported=$true
 if($canonical.kind -ceq 'option_list'){$record.editable_fields=@('rect','address','mode','options');$record.full_properties_verified=$false;$record.canonical_json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress;return [pscustomobject]$record}
 if($canonical.kind -ceq 'picture'){$record.editable_fields=@('rect');$record.full_properties_verified=$false;$record.canonical_json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress;return [pscustomobject]$record}
 if($canonical.kind -ceq 'alarm_display'){$record.editable_fields=@('description','rect','font_size');$record.full_properties_verified=$false;$record.native_fields_verified=$true;$record.canonical_json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress;return [pscustomobject]$record}
 if($canonical.kind -cin @('text','rectangle','trend','recipe_view')){if($canonical.kind -ceq 'rectangle'){$record.editable_fields=@('rect','filled','corner','fill_rgb','border_rgb')}elseif($canonical.kind -ceq 'trend'){$record.editable_fields=if($null -ne $canonical.display_unit){@('description','pixel_spacing','line_width','channel_y_axes','y_axis_options')}else{@('description','rect','pixel_spacing','line_width')}}elseif($canonical.kind -ceq 'text'){$record.editable_fields=if($canonical.text_source -ceq 'label_library'){@('position','font_size','font','alignment','text_rgb')}else{@('text','position','font_size','font','alignment','text_rgb')}}else{$record.editable_fields=@('recipe_name','display_fields','sort_enabled','sort_by','sort_direction')};$record.full_properties_verified=$false;$record.canonical_json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress;return [pscustomobject]$record}
 $record.editable_fields=if($canonical.kind -ceq 'numeric_display'){if($canonical.style.data_type -ceq '16-bit Signed' -and $canonical.style.decimal_digits -ceq '0'){@('description','rect','device_name','address_type','address','tag_name','data_type','minimum','maximum','numeric_font','numeric_size','numeric_text_rgb')}else{@('description','rect','device_name','address_type','address','tag_name','data_type','numeric_font','numeric_size','numeric_text_rgb')}}elseif($canonical.kind -ceq 'bit_switch'){@('description','rect','device_name','address_type','address','tag_name','off_label','on_label','operation_mode','label_font','label_size','off_text_rgb','on_text_rgb')}elseif($canonical.kind -ceq 'bit_lamp'){@('description','rect','device_name','address_type','address','tag_name','off_label','on_label','label_font','label_size','off_text_rgb','on_text_rgb')}elseif($canonical.kind -ceq 'window_button' -and $canonical.window.action -ceq '导入用户账户'){@('description','rect','label','function_action','media','import_mode','delete_after_import','label_font','label_size','off_text_rgb','on_text_rgb')}elseif($canonical.kind -ceq 'window_button'){@('description','rect','label','target_window','label_font','label_size','off_text_rgb','on_text_rgb')}else{@('description','rect','label')}
 if($canonical.kind -ceq 'numeric_display' -and $canonical.style.data_type -cin @('16-bit Signed','16-bit Unsigned','32-bit Float','32-bit Signed','32-bit Unsigned')){$record.editable_fields+=@('integer_digits','decimal_digits')}
 return [pscustomobject]$record
}
function Find-WeinviewScreenDialog($Session,[string]$Kind){
 $title=if($Kind -ceq 'Numeric'){'数值的属性'}elseif($Kind -ceq 'BitLamp'){'位状态指示灯/位状态切换开关的属性'}elseif($Kind -ceq 'Bit'){'位状态切换开关/位状态指示灯的属性'}elseif($Kind -ceq 'Text'){'文字/批注的属性'}elseif($Kind -ceq 'Drawing'){'矩形元件属性'}elseif($Kind -ceq 'Picture'){'图片的属性'}elseif($Kind -ceq 'Trend'){'趋势图的属性'}elseif($Kind -ceq 'RecipeView'){'配方检视的属性'}elseif($Kind -ceq 'OptionList'){'项目选单的属性'}else{'功能键的属性'}
 $deadline=[DateTime]::UtcNow.AddSeconds(6)
 do{
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible})
   if($dialogs.Count -gt 1){throw ('Multiple owned modals after semantic object open: '+(ConvertTo-Json -InputObject @($dialogs|Select-Object Hwnd,Title,Enabled,Pid) -Depth 3 -Compress))}
   if($dialogs.Count -eq 1){if(($Kind -ceq 'RecipeView' -and $dialogs[0].Title -cnotmatch '配方检视') -or ($Kind -cne 'RecipeView' -and $dialogs[0].Title -cne $title)){if($Kind -ceq 'Drawing'){throw ('native_drawing_kind_not_implemented: DW prefix includes other native graphics; observed property title='+$dialogs[0].Title+'; no Rectangle read or property input performed.')}else{throw ('Unexpected owned modal after semantic object open: expected='+$title+'; observed='+(ConvertTo-Json -InputObject @($dialogs|Select-Object Hwnd,Title,Enabled,Pid) -Depth 3 -Compress))}};if($dialogs[0].Enabled){return $dialogs[0]}}
  Start-Sleep -Milliseconds 50
 }while([DateTime]::UtcNow -lt $deadline)
  $observed=@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}|Select-Object Hwnd,Title,Enabled,Pid)
  throw ('Exact native object property did not become ready; no click replay. expected_title='+$title+'; observed_owned_dialogs='+(ConvertTo-Json -InputObject $observed -Depth 3 -Compress))
}
function Close-WeinviewScreenDialog($Session,$Dialog,[bool]$Confirm){
 if($Confirm){$Session.native.ClickButton($Dialog.Hwnd,1,'确定')}else{$Session.native.ClickButton($Dialog.Hwnd,2,'取消')}
 $deadline=[DateTime]::UtcNow.AddSeconds(5)
 do{if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Dialog.Hwnd}).Count){return};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $deadline)
 throw 'Owned object property close not observed; no confirmation replay'
}
function Open-WeinviewDirectoryObject($Session,$Directory,$Row){
 $id=Get-Content -LiteralPath $Session.identity_path -Raw -Encoding UTF8|ConvertFrom-Json
 $tree=[PLCCode.Weinview.Research.WindowTreeControls]::new([int]$id.Pid,[long]$id.CreationTicks,[string]$id.Exe,[long]$Session.main.Hwnd,$false)
 $tree.OpenObjectAtObservedRow($Directory.tree_hwnd,$Row.semantic_path,$Row.raw_label,$Row.object_id,$Row.kind)
 $dialogKind=if($Row.kind -ceq 'Bit' -and $Row.object_id -cmatch '^BL_'){'BitLamp'}else{$Row.kind}
 return Find-WeinviewScreenDialog $Session $dialogKind
}
function Read-WeinviewRecipeViewSelectedName($Session,$Dialog){
 if($Dialog.Title -cnotmatch '配方检视' -or -not ('PLCCode.Weinview.RecipeViewDisplayControls' -as [type])){throw 'Owned Recipe View property reader required'}
 $selected=[PLCCode.Weinview.RecipeViewDisplayControls]::ReadSelectedRecipeDirectory($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id)
 if($selected -isnot [string] -or [string]::IsNullOrWhiteSpace($selected) -or $selected.Length -gt 128 -or $selected -match '[\x00-\x1f]'){throw 'Selected native Recipe directory name required'}
 return $selected
}
function Read-WeinviewRecipeViewTargetProperty($Session,$Dialog){
 $name=Read-WeinviewRecipeViewSelectedName $Session $Dialog
 $property=Read-WeinviewRecipeViewProperty $Session $Dialog $name $null $true
 if(!$property.field_grid -or $property.field_grid_count -ne 1){throw 'Unique original Recipe View Display table required'}
 $fields=[string[]]@($property.field_names);$shown=[string[]]@($property.displayed_fields)
 if($fields.Count -lt 1){throw 'Original Recipe View field rows required'}
 return [pscustomobject]@{kind='recipe_view';recipe_name=$name;field_names=$fields;displayed_fields=$shown;sort_enabled=[bool]$property.sort.enabled;sort_by=[string]$property.sort.field;sort_direction=[string]$property.sort.direction}
}
function Invoke-WeinviewScreenRead($Session,[string]$ExpectedSha256,[string]$EvidencePrefix){
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Screen read source hash mismatch'}
 $directory=Get-WeinviewWindowDirectory -Session $Session;$objects=@();$seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 try{
  foreach($row in @($directory.rows)){
   if(!$row.object_id -or !$seen.Add([string]$row.object_id)){throw 'Native directory object ID unavailable or duplicated'}
   if($row.kind -ceq 'Unsupported' -and $row.object_id -cmatch '^AL_[0-9]{1,5}$'){
    $target=Read-WeinviewTargetObject $Session ([string]$row.object_id) $ExpectedSha256 ($EvidencePrefix+'.'+$row.object_id)
    $objects+=,$target.object
    continue
   }
   if($row.kind -ceq 'Unsupported'){
    $objects+=[pscustomobject]@{object_id=$row.object_id;supported=$false;kind='unsupported';editable_fields=@();raw_label=$row.raw_label;unsupported_reason='native-object-kind-not-implemented'};continue
   }
   $fresh=Get-WeinviewWindowDirectory -Session $Session
   $rows=@($fresh.rows|Where-Object {$_.object_id -ceq $row.object_id});if($rows.Count -ne 1 -or $rows[0].kind -cne $row.kind){throw 'Native object identity changed between directory and property read'}
   $dialog=Open-WeinviewDirectoryObject $Session $fresh $rows[0]
   $readPath=$EvidencePrefix+'.'+$row.object_id+'.read.json'
   if($row.kind -ceq 'RecipeView'){
    $actual=Read-WeinviewRecipeViewTargetProperty $Session $dialog
    $objects+=New-WeinviewObjectRecord $row.object_id $actual
    WritePrivateJson $readPath @{status='success';scope='original_recipe_view_recipe_and_display_only';actual=$actual;full_properties_verified=$false}
    Close-WeinviewScreenDialog $Session $dialog $false
    if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Screen inspection unexpectedly saved project bytes'}
    continue
   }
   $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $ExpectedSha256 -DialogHwnd $dialog.Hwnd -OutputPath $readPath -TagEvidence $Session.tag_evidence
   $read=Get-Content -LiteralPath $readPath -Raw -Encoding UTF8|ConvertFrom-Json
   if($read.status -ceq 'success'){$record=New-WeinviewObjectRecord $row.object_id $read.actual;if($read.channel_y_axis_evidence){$record|Add-Member -NotePropertyName channel_y_axis_evidence -NotePropertyValue $read.channel_y_axis_evidence -Force};$objects+=$record}
   elseif($read.status -ceq 'unsupported'){$objects+=[pscustomobject]@{object_id=$row.object_id;supported=$false;kind='unsupported';editable_fields=@();raw_label=$rows[0].raw_label;unsupported_reason=$read.unsupported_reason}}
   else{throw 'Native object property read failed'}
   Close-WeinviewScreenDialog $Session $dialog $false
   if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Screen inspection unexpectedly saved project bytes'}
  }
 }finally{
  if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
 }
 $result=[pscustomobject]@{screen=[int]$directory.window_number;window_name=$directory.window_name;canvas_width=[int]$Session.window_width;canvas_height=[int]$Session.window_height;window_activation_evidence=$Session.window_activation_evidence;objects=$objects;directory=$directory;source_sha256=$ExpectedSha256;project_saved=$false;source_unchanged=$true}
 WritePrivateJson ($EvidencePrefix+'.snapshot.json') $result
 return $result
}
function Invoke-WeinviewScreenDirectoryRead($Session,[string]$ExpectedSha256,[string]$EvidencePrefix){
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Screen directory source hash mismatch'}
 $directory=Get-WeinviewWindowDirectory -Session $Session
 try{
  $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
  $objects=@();$order=0
  foreach($row in @($directory.rows)){
   $id=[string]$row.object_id
   if(!$id -or !$seen.Add($id)){throw 'Native directory object ID unavailable or duplicated'}
   $objects+=,[pscustomobject][ordered]@{object_id=$id;native_kind=[string]$row.kind;raw_label=[string]$row.raw_label;order=$order}
   $order++
  }
  $result=[pscustomobject]@{screen=[int]$directory.window_number;window_name=[string]$directory.window_name;canvas_width=[int]$Session.window_width;canvas_height=[int]$Session.window_height;window_activation_evidence=$Session.window_activation_evidence;objects=$objects;detail='directory';property_scope='native_directory_id_kind_label_order_only';source_sha256=$ExpectedSha256;project_saved=$false;source_unchanged=$true}
  WritePrivateJson ($EvidencePrefix+'.directory.json') $result
  return $result
 }finally{
  if($directory.restore_context -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
 }
}
function Convert-WeinviewNativeHostWindowObjects([object[]]$NativeRows,[int]$WindowNumber){
 $objects=@();$seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal);$nativeWindow=$null
 foreach($row in @($NativeRows)){
  $property=$row.properties
  if(!$property){throw 'Native host window object properties missing'}
  $name=[string]$property.name;$type=[string]$property.type;$bbox=@($property.bbox)
  if(!$name -or !$type -or $bbox.Count -ne 4 -or @($bbox|Where-Object {$_ -isnot [string] -or !$_}).Count){throw 'Native host window object identity/type/raw bbox invalid'}
  if($name.StartsWith('WA_',[StringComparison]::Ordinal) -and $name -cnotmatch '^WA_[0-9]+$'){throw 'Native host window anchor identity invalid'}
  if($name -cmatch '^WA_[0-9]+$'){
   if($nativeWindow){throw 'Native host window anchor duplicated'}
   $nativeWindow=$property;continue
  }
  if(!$seen.Add($name)){throw 'Native host window object name duplicated'}
  $objects+=,[pscustomobject][ordered]@{object_id=$name;native_kind=$type;raw_label=$name;order=$objects.Count;raw_native_bbox=@($bbox);layer_name=[string]$property.layer_name;selected=[int]$property.selected;use_label=[bool]$property.use_label;use_picture=[bool]$property.use_picture;use_shape=[bool]$property.use_shape}
 }
 if(!$nativeWindow){throw ('Native host window '+$WindowNumber+' has no original WA anchor')}
 return [pscustomobject]@{objects=$objects;native_window_record=$nativeWindow}
}
function Get-WeinviewWindowObjectInventory($Session){
 $windowNumber=if($Session.window_number){[int]$Session.window_number}else{10}
 if(!$Session.addition_inventory_route){$ready=$false;if([int]$Session.native_host_port -gt 0){try{$ready=[bool](Test-WeinviewNativeHostPort -Port ([int]$Session.native_host_port))}catch{}};$Session.addition_inventory_route=if($ready){'native_host'}else{'native_ui_directory'}}
 if($Session.addition_inventory_route -ceq 'native_ui_directory'){return Get-WeinviewWindowDirectory -Session $Session}
 if($Session.addition_inventory_route -cne 'native_host' -or [int]$Session.native_host_port -le 0){throw 'Addition inventory route changed within owned session'}
 if(!(Get-Command Invoke-WeinviewNativeHostRead -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')}
 $nativeRows=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindowObjects -Arguments @($windowNumber)
 $mapped=Convert-WeinviewNativeHostWindowObjects $nativeRows $windowNumber
 $rows=@(foreach($object in @($mapped.objects)){
  $id=[string]$object.object_id
  $kind=if($id -cmatch '^(ND|NE)_[0-9]+$'){'Numeric'}elseif($id -cmatch '^FK_[0-9]+$'){'Macro'}elseif($id -cmatch '^(TS|BL)_[0-9]+$'){'Bit'}elseif($id -cmatch '^TX_[0-9]+$'){'Text'}elseif($id -cmatch '^DW_[0-9]+$'){'Drawing'}elseif($id -cmatch '^GP_[0-9]+$'){'Picture'}elseif($id -cmatch '^TD_[0-9]+$'){'Trend'}elseif($id -cmatch '^RV_[0-9]+$'){'RecipeView'}elseif($id -cmatch '^OL_[0-9]+$'){'OptionList'}else{'Unsupported'}
  [pscustomobject]@{object_id=$id;kind=$kind;raw_label=$id;native_kind=[string]$object.native_kind;raw_native_bbox=@($object.raw_native_bbox)}
 })
 return [pscustomobject]@{window_number=$windowNumber;window_name=[string]$Session.window_name;rows=$rows;read_route='native_host';native_window_record=$mapped.native_window_record;restore_context=$null}
}
function Read-WeinviewAdditionSnapshot($Session,[string]$ExpectedSha256,[string]$EvidencePrefix,[string]$BridgeRoot,[string[]]$TargetObjectIds=@()){
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Addition directory source hash mismatch'}
 $directory=Get-WeinviewWindowObjectInventory $Session
 $targets=@($TargetObjectIds);if(@($targets|Select-Object -Unique).Count -ne $targets.Count){throw 'Addition target identities duplicated'}
 $objects=@();foreach($row in @($directory.rows)){
  if($row.object_id -cin $targets){$target=Read-WeinviewTargetObject $Session ([string]$row.object_id) $ExpectedSha256 ($EvidencePrefix+'.'+$row.object_id);$objects+=,$target.object}
  else{$objects+=[pscustomobject]@{object_id=[string]$row.object_id;kind='directory_only';supported=$false;editable_fields=@();raw_label=[string]$row.raw_label;unsupported_reason='properties-not-read-during-addition'}}
 }
 if(@($objects).Count -ne @($directory.rows).Count -or @($targets|Where-Object {$_ -cnotin @($directory.rows|ForEach-Object {$_.object_id})}).Count){throw 'Addition target missing from native directory'}
 $snapshot=[pscustomobject]@{screen=[int]$directory.window_number;window_name=$directory.window_name;canvas_width=[int]$Session.window_width;canvas_height=[int]$Session.window_height;window_activation_evidence=$Session.window_activation_evidence;objects=$objects;directory=$directory;alarm_displays=@();source_sha256=$ExpectedSha256;project_saved=$false;source_unchanged=$true;directory_only_scope=$true}
 WritePrivateJson ($EvidencePrefix+'.snapshot.json') $snapshot
 if($directory.restore_context -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
 return $snapshot
}
function Assert-WeinviewAdditionSnapshots($Before,$After,[int]$AddedCount=0){
 if(!$Before.directory_only_scope -or !$After.directory_only_scope){throw 'Addition native directory-only snapshot required'}
 if([string]$Before.directory.read_route -cne [string]$After.directory.read_route){throw 'Addition inventory read routes differ'}
 $old=@($Before.directory.rows);$new=@($After.directory.rows);if($new.Count -ne $old.Count+$AddedCount){throw 'Addition native directory count changed unexpectedly'}
 $oldIds=@($old|ForEach-Object {$_.object_id});$retained=@($new|Where-Object {$_.object_id -cin $oldIds});if($retained.Count -ne $old.Count){throw 'Existing native directory records missing'}
 for($i=0;$i -lt $old.Count;$i++){if($retained[$i].object_id -cne $old[$i].object_id -or $retained[$i].kind -cne $old[$i].kind -or $retained[$i].raw_label -cne $old[$i].raw_label){throw 'Existing native directory identity/order/label changed'}}
 foreach($beforeObject in @($Before.objects)){$afterObject=@($After.objects|Where-Object {$_.object_id -ceq $beforeObject.object_id});if($afterObject.Count -ne 1){throw 'Addition prior native identity missing'};if($beforeObject.kind -ceq 'directory_only'){if($afterObject[0].kind -cne 'directory_only' -or $afterObject[0].raw_label -cne $beforeObject.raw_label){throw 'Addition old directory record changed or opened unexpectedly'}}elseif($beforeObject.supported -eq $true){if($afterObject[0].supported -ne $true -or $afterObject[0].object_sha256 -cne $beforeObject.object_sha256 -or $afterObject[0].canonical_json -cne $beforeObject.canonical_json){throw 'Addition target changed after save/reopen'}}else{throw 'Unknown addition snapshot record'}}
}
function Assert-WeinviewScreenSnapshots($Before,$After,[string]$UpdatedId,[string]$ExpectedUpdatedHash){
 $a=@($Before.objects);$b=@($After.objects)
 if($a.Count -ne $b.Count){throw 'Native object count changed during existing-object update'}
 foreach($old in $a){
  $matches=@($b|Where-Object {$_.object_id -ceq $old.object_id});if($matches.Count -ne 1){throw 'Native object ID missing or duplicated after update'};$new=$matches[0]
  if([bool]$old.supported -ne [bool]$new.supported){throw 'Native object support/type changed after update'}
  if($old.object_id -ceq $UpdatedId){if(!$new.supported -or $new.object_sha256 -cne $ExpectedUpdatedHash){throw 'Updated complete native object differs'}}
  elseif($old.supported){if($old.object_sha256 -cne $new.object_sha256){throw ('Unrequested object properties changed: '+$old.object_id)}}
  elseif($old.raw_label -cne $new.raw_label -or $old.kind -cne $new.kind){throw 'Unrequested unsupported native directory row changed'}
 }
}
function Invoke-WeinviewScreenUpdate($Session,$Arguments,[string]$ExpectedSha256,[string]$EvidencePrefix){
 $before=Invoke-WeinviewScreenRead $Session $ExpectedSha256 ($EvidencePrefix+'.before')
 $targets=@($before.objects|Where-Object {$_.object_id -ceq $Arguments.object_id});if($targets.Count -ne 1 -or !$targets[0].supported){throw 'Unique supported existing native object required'}
 if($targets[0].object_sha256 -ine $Arguments.expected_object_sha256){throw 'Existing object hash changed before update; no editor writes'}
 $changes=[ordered]@{};$properties=@($Arguments.PSObject.Properties.Name)
 if($properties -ccontains 'description'){$changes.description=$Arguments.description}
 if($properties -ccontains 'rect'){$changes.rectangle=@($Arguments.rect)}
 if($properties -ccontains 'address'){$changes.address=$Arguments.address}
  foreach($field in @('device_name','address_type')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
 if($properties -ccontains 'tag_name'){$changes.tag_name=$Arguments.tag_name}
 if($properties -ccontains 'data_type'){$changes.data_type=$Arguments.data_type}
 foreach($field in @('minimum','maximum','integer_digits','decimal_digits','numeric_font','numeric_size','label_font','label_size','numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb','use_shape','use_picture')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
 if($properties -ccontains 'operation_mode'){$changes.operation_mode=$Arguments.operation_mode}
 if($properties -ccontains 'target_window'){$changes.target_window=$Arguments.target_window}
 if($properties -ccontains 'off_label'){$changes.off_label=$Arguments.off_label}
 if($properties -ccontains 'on_label'){$changes.on_label=$Arguments.on_label}
 if($properties -ccontains 'label'){$changes.labels=@(@{state=0;text=$Arguments.label},@{state=1;text=$Arguments.label})}
 foreach($field in @('text','position','font_size','font','alignment')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
 if(!$changes.Count){throw 'At least one existing-object change required'}
 $changePath=$EvidencePrefix+'.changes.json';WritePrivateJson $changePath $changes
 $directory=Get-WeinviewWindowDirectory -Session $Session
 try{
  $rows=@($directory.rows|Where-Object {$_.object_id -ceq $Arguments.object_id});if($rows.Count -ne 1){throw 'Native target row identity changed'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $updatePath=$EvidencePrefix+'.update.json'
  $null=& (Join-Path $PSScriptRoot 'NativeObjectUpdate.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $ExpectedSha256 -DialogHwnd $dialog.Hwnd -ObjectId $Arguments.object_id -ExpectedObjectSha256 $Arguments.expected_object_sha256 -OwnedSemanticBackground ([bool]$Session.owned_semantic_background) -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -ChangesPath $changePath -OutputPath $updatePath
  $updated=Get-Content -LiteralPath $updatePath -Raw -Encoding UTF8|ConvertFrom-Json
  if($updated.status -cne 'success'){throw 'Native existing-object update not fully verified'}
  Close-WeinviewScreenDialog $Session $dialog $true
 }finally{
  if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
 }
 $after=Invoke-WeinviewScreenRead $Session $ExpectedSha256 ($EvidencePrefix+'.after')
 $targetAfter=@($after.objects|Where-Object {$_.object_id -ceq $Arguments.object_id})
 if(($properties -ccontains 'label') -and $targetAfter.Count -eq 1 -and $targetAfter[0].supported -and $targetAfter[0].object_sha256 -cne $updated.after.sha256){
  $actualCanonical=CanonicalObject $Arguments.object_id $targetAfter[0]
  $actualRectangle=@($actualCanonical.rectangle);$expectedRectangle=@($updated.after.object.rectangle)
  $actualCanonical.rectangle=$expectedRectangle
  if((CanonicalObjectHash $actualCanonical) -ceq $updated.after.sha256){
   throw ('native_label_bounds_changed: Native confirmation changed the label bounds. Expected rectangle ['+($expectedRectangle -join ',')+']; observed ['+($actualRectangle -join ',')+']. Project was not saved. Request a suitable rectangle together with the longer label, or retain text that fits the existing layout.')
  }
 }
 Assert-WeinviewScreenSnapshots $before $after $Arguments.object_id $updated.after.sha256
 $objectBefore=@($before.objects|Where-Object {$_.object_id -ceq $Arguments.object_id})[0]
 $objectAfter=@($after.objects|Where-Object {$_.object_id -ceq $Arguments.object_id})[0]
 return [pscustomobject]@{before_snapshot=$before;after_snapshot=$after;object_before=$objectBefore;object_after=$objectAfter;appearance_shape_evidence=$updated.appearance_shape_evidence;untouched_objects_verified=$true;untouched_objects_verification_scope='supported full properties and unsupported directory identities';update_evidence_path=$updatePath}
}

# Target-only existing-object editing. The directory supplies identity; only the
# requested object's native property dialog is opened and read.
function Read-WeinviewCmtTrendGeometry($Session,[string]$ObjectId,[int]$WindowNumber,[string]$ExpectedSha256,[string]$EvidencePath){
 $inventory=Get-WeinviewWindowObjectInventory $Session
 if($inventory.read_route -cne 'native_host' -or [int]$inventory.window_number -ne $WindowNumber){throw 'cMT Trend rectangle requires current native host directory'}
 $nativeRows=@($inventory.rows|Where-Object {$_.object_id -ceq $ObjectId -and $_.kind -ceq 'Trend' -and $_.native_kind -ceq '趋势图'})
 if($nativeRows.Count -ne 1){throw 'Unique native host Trend rectangle row required'}
 $box=@($nativeRows[0].raw_native_bbox);if($box.Count -ne 4){throw 'Native host Trend bbox must have four fields'}
 $values=@();foreach($part in $box){$value=0;if(![int]::TryParse([string]$part,[ref]$value) -or $value -lt 0){throw 'Native host Trend bbox must be nonnegative integers'};$values+=,[int]$value}
 if($values[2] -ge [int]::MaxValue -or $values[3] -ge [int]::MaxValue){throw 'Native host Trend bbox extent overflows'}
 $rectangle=@($values[0],$values[1],($values[2]+1),($values[3]+1))
 if($rectangle[2] -lt 1 -or $rectangle[3] -lt 1 -or ([long]$rectangle[0]+$rectangle[2]) -gt [int]$Session.window_width -or ([long]$rectangle[1]+$rectangle[3]) -gt [int]$Session.window_height){throw 'Native host Trend bbox exceeds selected canvas'}
 $geometry=[pscustomobject]@{object_id=$ObjectId;window_number=$WindowNumber;read_route='native_host';native_kind=[string]$nativeRows[0].native_kind;raw_native_bbox=$box;rectangle=$rectangle;extent_rule='raw_width_height_plus_one';project_sha256=$ExpectedSha256}
 WritePrivateJson $EvidencePath $geometry
 return $geometry
}
function Read-WeinviewTargetObject($Session,[string]$ObjectId,[string]$ExpectedSha256,[string]$EvidencePrefix,[bool]$RetainDialog=$false,[bool]$ReadSecurityClass=$false,[string[]]$AppearanceColorFields=@()){
 $read=$null
 if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Target read project hash mismatch'}
 $colorFields=@($AppearanceColorFields|Where-Object {$_ -is [string] -and $_.Length -gt 0})
 $directory=Get-WeinviewWindowDirectory -Session $Session
 $rows=@($directory.rows|Where-Object {$_.object_id -ceq $ObjectId})
 if($rows.Count -ne 1 -or ($rows[0].kind -ceq 'Unsupported' -and $ObjectId -cnotmatch '^AL_[0-9]{1,5}$')){throw 'Unique supported native target row required'}
 $trendRectangle=$null;$trendGeometryPath=$null
 if($ObjectId -cmatch '^TD_[0-9]{1,5}$' -and [IO.Path]::GetExtension([string]$Session.project_path) -ieq '.cmtp'){
  $trendGeometryPath=$EvidencePrefix+'.native-geometry.json'
  $trendGeometry=Read-WeinviewCmtTrendGeometry $Session $ObjectId ([int]$directory.window_number) $ExpectedSha256 $trendGeometryPath
  $trendRectangle=@($trendGeometry.rectangle)
 }
 $dialog=$null;$handoff=$false
 try{
  $dialog=if($ObjectId -cmatch '^AL_[0-9]{1,5}$'){Open-WeinviewAlarmDisplayObject $Session $directory $rows[0]}else{Open-WeinviewDirectoryObject $Session $directory $rows[0]}
  $path=$EvidencePrefix+'.read.json'
  if($ObjectId -cmatch '^AL_[0-9]{1,5}$'){
   if($ReadSecurityClass -or $colorFields.Count){throw 'Alarm Display uses its complete observed native property reader'}
   $actual=Read-WeinviewAlarmDisplayDialog $Session $dialog $ObjectId
   WritePrivateJson $path @{status='success';scope='observed_alarm_display_fields';actual=$actual;full_properties_verified=$false}
  }elseif($rows[0].kind -ceq 'RecipeView'){
   if($ReadSecurityClass){throw 'Recipe View Security tab is not in the observed edit contract'}
   $actual=Read-WeinviewRecipeViewTargetProperty $Session $dialog
   WritePrivateJson $path @{status='success';scope='original_recipe_view_recipe_and_display_only';actual=$actual;full_properties_verified=$false}
  }else{
   $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $ExpectedSha256 -DialogHwnd $dialog.Hwnd -OutputPath $path -ReadSecurityClass $ReadSecurityClass -TagEvidence $Session.tag_evidence
   $read=Get-Content -LiteralPath $path -Raw -Encoding UTF8|ConvertFrom-Json
   if($read.status -cne 'success'){throw 'Target native object property read unsupported or failed'}
   $actual=$read.actual
  }
   if($trendRectangle){if($actual.kind -cne 'trend' -or $null -ne $actual.rectangle){throw 'cMT Trend native property/geometry profile differs'};$actual.rectangle=@($trendRectangle)}
   $object=New-WeinviewObjectRecord $ObjectId $actual
   $appearanceColor=$null
   if($colorFields.Count){. (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1');$appearanceColor=Get-WeinviewRequestedAppearanceColors $Session.identity_path $dialog.Hwnd $object.kind $colorFields}
  if($RetainDialog){$handoff=$true}
   $preparedRead=if($handoff -and $read -and $object.kind -cin @('rectangle','text','numeric_display','bit_switch','bit_lamp','window_button')){[pscustomobject]@{dialog_hwnd=[long]$dialog.Hwnd;object_id=$ObjectId;project_path=[string]$Session.project_path;read=$read}}else{$null}
   return [pscustomobject]@{object=$object;appearance_color=$appearanceColor;prepared_native_read=$preparedRead;channel_y_axis_evidence=if($read){$read.channel_y_axis_evidence}else{$null};sampling_channels_enabled_evidence=if($read){$read.sampling_channels_enabled_evidence}else{$null};directory_geometry_evidence_path=$trendGeometryPath;security_class=if($ReadSecurityClass){$read.security_class}else{$null};dialog=if($handoff){$dialog}else{$null};restore_context=$directory.restore_context;window_number=[int]$directory.window_number;window_name=$directory.window_name;directory_object_count=@($directory.rows).Count;raw_label=$rows[0].raw_label;read_evidence_path=$path}
 }finally{
  if(!$handoff){
   # Preserve the original read error when an owned inner dialog disables its
   # parent; a cancellation of that parent would only mask the real failure.
   if($dialog -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Visible -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $dialog $false}
   if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
  }
 }
}
 function Invoke-WeinviewScreenTargetUpdate($Session,$Arguments,[string]$ExpectedSha256,[string]$EvidencePrefix,$TagEvidence=$null,$PreparedBefore=$null){
 $securityRequested=@($Arguments.PSObject.Properties.Name) -ccontains 'security_class'
  $before=if($PreparedBefore){$PreparedBefore}else{Read-WeinviewTargetObject $Session ([string]$Arguments.object_id) $ExpectedSha256 ($EvidencePrefix+'.before') $true $securityRequested}
 $dialog=$before.dialog;$confirmed=$false
 try{
  if($before.object.object_sha256 -ine $Arguments.expected_object_sha256){throw 'Existing target object hash changed before update; no editor writes'}
  if($before.object.kind -ceq 'alarm_display'){
   $properties=@($Arguments.PSObject.Properties.Name)
   if(@($properties|Where-Object {$_ -cnotin @('workspace_root','project_path','output_path','expected_project_sha256','exe_path','screen','window_number','kind','object_id','expected_object_sha256','description','rect','font_size','use_object_heading')}).Count){throw 'Alarm Display screen update accepts only description, rect, font_size and cMT object heading'}
   if(@($properties|Where-Object {$_ -cin @('description','rect','font_size','use_object_heading')}).Count -eq 0){throw 'Alarm Display property change required'}
   $expected=$before.object.canonical_json|ConvertFrom-Json
   $n=$Session.native;$h=$dialog.Hwnd;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
   $tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32')
   if($properties -ccontains 'description'){
    $description=[string]$Arguments.description
    if($Arguments.description -isnot [string] -or !$description.Length -or $description.Length -gt 64 -or $description -match '[\x00-\x1f\x7f-\x9f]'){throw 'Alarm Display description must be 1..64 characters without controls'}
    if($description -cne $expected.description){$p.SelectTabExact($tab.Hwnd,'一般属性');$edit=$n.FindUniqueControlWithoutLabel($h,1174,'Edit');$n.SetControlText($edit.Hwnd,$description);if($n.GetControlText($edit.Hwnd,512) -cne $description){throw 'Alarm Display description immediate readback differs'}}
    $expected.description=$description
   }
   if($properties -ccontains 'font_size'){
    if(($Arguments.font_size -isnot [int] -and $Arguments.font_size -isnot [long]) -or [long]$Arguments.font_size -le 0){throw 'Positive Alarm Display font_size integer required'}
    $fontSize=[string]$Arguments.font_size
    if($fontSize -cne $expected.font_size){$p.SelectTabExact($tab.Hwnd,'字体');$size=$n.FindUniqueControlWithoutLabel($h,1439,'ComboBox');$p.SelectComboExact($size.Hwnd,$fontSize);if($p.ComboSelected($size.Hwnd) -cne $fontSize){throw 'Alarm Display font_size immediate readback differs'}}
    $expected.font_size=$fontSize
   }
   if($properties -ccontains 'rect'){
    $rect=@($Arguments.rect)
    if($rect.Count -ne 4 -or @($rect|Where-Object {$_ -isnot [int] -and $_ -isnot [long]}).Count){throw 'Four Alarm Display rectangle integers required'}
    if((@($expected.rect) -join ',') -cne ($rect -join ',')){$null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -IdentityPath $Session.identity_path -DialogHwnd $h -X ([int]$rect[0]) -Y ([int]$rect[1]) -Width ([int]$rect[2]) -Height ([int]$rect[3]) -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -ProjectPath $Session.project_path}
    $expected.rect=@($rect|ForEach-Object {[int]$_})
   }
   $headingEdit=$null
   if($properties -ccontains 'use_object_heading'){
    if($Arguments.use_object_heading -isnot [bool] -or [IO.Path]::GetExtension([string]$Session.project_path) -ine '.cmtp' -or !$expected.cmt_options){throw 'Object heading update requires a cMT Alarm Display and JSON boolean'}
    $requested=[bool]$Arguments.use_object_heading
    $current=[bool]$expected.cmt_options.use_object_heading
    if($current -ne $requested){
     $p.SelectTabExact($tab.Hwnd,'报警')
     $guard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($n,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)
     $guard.AssertDialog($h,'报警显示的属性')
     $qt=WaitFor {$q=@($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro'});if($q.Count -gt 1){throw 'Ambiguous original cMT alarm heading page'};if($q.Count -eq 1){return $q[0]}} 3
     $headingEdit=$guard.SetObjectHeading($h,$qt.Hwnd,$current,$requested)
    }
    $expected.cmt_options.use_object_heading=$requested
   }
   $actual=Read-WeinviewAlarmDisplayDialog $Session $dialog ([string]$Arguments.object_id)
   $after=New-WeinviewObjectRecord ([string]$Arguments.object_id) $actual
   if($after.object_sha256 -cne (CanonicalObjectHash $expected)){throw 'Alarm Display observed fields differ after targeted property write'}
   $updatePath=$EvidencePrefix+'.update.json';WritePrivateJson $updatePath @{status='success';scope='observed_alarm_display_fields';before=$before.object;after=$after;heading_edit=$headingEdit;confirmed=$false}
   Close-WeinviewScreenDialog $Session $dialog $true;$dialog=$null;$confirmed=$true
   if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Alarm Display changed project bytes before caller save boundary'}
   return [pscustomobject]@{object_before=$before.object;object_after=$after;heading_edit=$headingEdit;target_window=$before.window_number;target_window_name=$before.window_name;directory_object_count_before=$before.directory_object_count;target_raw_label=$before.raw_label;before_read_evidence_path=$before.read_evidence_path;update_evidence_path=$updatePath;target_only_verified=$true;untouched_objects_verified=$false;untouched_objects_verification_scope='not inspected; target object only'}
  }
  if($before.object.kind -ceq 'recipe_view'){
   $properties=@($Arguments.PSObject.Properties.Name)
   if($securityRequested -or @($properties|Where-Object {$_ -cin @('description','rect','address','minimum','maximum','operation_mode','target_window','off_label','on_label','label','text','position','font_size','font','alignment')}).Count){throw 'Recipe View update accepts only recipe_name, display_fields and sort settings'}
   if(@($properties|Where-Object {$_ -cin @('recipe_name','display_fields','sort_enabled','sort_by','sort_direction')}).Count -eq 0){throw 'Recipe View recipe, Display or sort change required'}
   $targetName=if($properties -ccontains 'recipe_name'){[string]$Arguments.recipe_name}else{[string]$before.object.recipe_name}
   if([string]::IsNullOrWhiteSpace($targetName) -or $targetName.Length -gt 128){throw 'Target native Recipe name required'}
   $targetDisplay=if($properties -ccontains 'display_fields'){[string[]]@($Arguments.display_fields)}else{[string[]]@($before.object.displayed_fields)}
   if($targetDisplay.Count -lt 1 -or @($targetDisplay|Select-Object -Unique).Count -ne $targetDisplay.Count){throw 'Distinct target Recipe View Display fields required'}
   $fields=if($Session.recipe_view_fields -and $Session.recipe_view_fields.ContainsKey($targetName)){[string[]]@($Session.recipe_view_fields[$targetName])}elseif($targetName -ceq $before.object.recipe_name){[string[]]@($before.object.field_names)}else{throw 'Same-project native Recipe definition required for View rebind'}
   if(@($targetDisplay|Where-Object {$_ -cnotin $fields}).Count){throw 'Target Display field absent from current-project Recipe definition'}
   $targetSortEnabled=if($properties -ccontains 'sort_enabled'){[bool]$Arguments.sort_enabled}else{[bool]$before.object.sort_enabled}
   $targetSortBy=if($properties -ccontains 'sort_by'){[string]$Arguments.sort_by}else{[string]$before.object.sort_by}
   $targetSortDirection=if($properties -ccontains 'sort_direction'){[string]$Arguments.sort_direction}else{[string]$before.object.sort_direction}
   if($targetSortBy -cnotin $fields -or $targetSortDirection -cnotin @('ascending','descending')){throw 'Requested Recipe View sort field/direction absent from native definition'}
   if($targetName -ceq $before.object.recipe_name -and ($targetDisplay -join [char]31) -ceq (@($before.object.displayed_fields) -join [char]31) -and ($fields -join [char]31) -ceq (@($before.object.field_names) -join [char]31) -and $targetSortEnabled -eq [bool]$before.object.sort_enabled -and $targetSortBy -ceq [string]$before.object.sort_by -and $targetSortDirection -ceq [string]$before.object.sort_direction){throw 'At least one substantive Recipe View change required'}
   $written=Set-WeinviewRecipeViewProperty $Session $dialog $targetName $fields $targetDisplay $targetSortEnabled $targetSortBy $targetSortDirection $true
   Close-WeinviewScreenDialog $Session $dialog $true;$dialog=$null;$confirmed=$true
   $readback=Read-WeinviewTargetObject $Session ([string]$Arguments.object_id) $ExpectedSha256 ($EvidencePrefix+'.confirmed-recipe')
   $after=$readback.object
   if($after.recipe_name -cne $targetName -or ($after.field_names -join [char]31) -cne ($fields -join [char]31) -or ($after.displayed_fields -join [char]31) -cne ($targetDisplay -join [char]31) -or [bool]$after.sort_enabled -ne $targetSortEnabled -or [string]$after.sort_by -cne $targetSortBy -or [string]$after.sort_direction -cne $targetSortDirection){throw 'Recipe View committed property/sort readback differs after confirm'}
   $updatePath=$EvidencePrefix+'.update.json';WritePrivateJson $updatePath @{status='success';scope='original_recipe_view_recipe_display_and_sort';before=$before.object;after=$after;property=$written;confirmed=$true;confirmed_read_evidence_path=$readback.read_evidence_path}
   if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Recipe View changed project bytes before caller save boundary'}
   return [pscustomobject]@{object_before=$before.object;object_after=$after;security_class_before=$null;security_class_requested=$null;security_class_after=$null;security_class_edit=$null;target_window=$before.window_number;target_window_name=$before.window_name;directory_object_count_before=$before.directory_object_count;target_raw_label=$before.raw_label;before_read_evidence_path=$before.read_evidence_path;update_evidence_path=$updatePath;target_only_verified=$true;untouched_objects_verified=$false;untouched_objects_verification_scope='not inspected; target object only'}
  }
  $changes=[ordered]@{};$properties=@($Arguments.PSObject.Properties.Name)
  if($properties -ccontains 'description'){$changes.description=$Arguments.description}
  if($properties -ccontains 'rect'){$changes.rectangle=@($Arguments.rect)}
  foreach($field in @('filled','corner')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  if($properties -ccontains 'address'){$changes.address=$Arguments.address}
  foreach($field in @('device_name','address_type')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  if($properties -ccontains 'mode'){$changes.mode=$Arguments.mode}
  if($properties -ccontains 'options'){$changes.options=@($Arguments.options)}
  if($properties -ccontains 'tag_name'){$changes.tag_name=$Arguments.tag_name}
  if($properties -ccontains 'data_type'){$changes.data_type=$Arguments.data_type}
 foreach($field in @('minimum','maximum','integer_digits','decimal_digits','numeric_font','numeric_size','label_font','label_size','numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb','use_shape','use_picture')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  if($properties -ccontains 'operation_mode'){$changes.operation_mode=$Arguments.operation_mode}
  if($properties -ccontains 'target_window'){$changes.target_window=$Arguments.target_window}
  foreach($field in @('function_action','media','import_mode','delete_after_import')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  if($properties -ccontains 'off_label'){$changes.off_label=$Arguments.off_label}
  if($properties -ccontains 'on_label'){$changes.on_label=$Arguments.on_label}
  if($properties -ccontains 'label'){$changes.labels=@(@{state=0;text=$Arguments.label},@{state=1;text=$Arguments.label})}
  foreach($field in @('text','position','font_size','font','alignment')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  foreach($field in @('channel_y_axes','y_axis_options','pixel_spacing','line_width')){if($properties -ccontains $field){$changes[$field]=$Arguments.$field}}
  if($securityRequested){$changes.security_class=[string]$Arguments.security_class}
  if(!$changes.Count){throw 'At least one existing-object change required'}
  $changePath=$EvidencePrefix+'.changes.json';WritePrivateJson $changePath $changes
  if(@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Visible -and $_.Enabled}).Count -ne 1){throw 'Original target property dialog changed before update'}
  $updatePath=$EvidencePrefix+'.update.json'
  $cmtTrend=($before.object.kind -ceq 'trend' -and [IO.Path]::GetExtension([string]$Session.project_path) -ieq '.cmtp')
  $dialogObjectHash=[string]$Arguments.expected_object_sha256
  if($cmtTrend){
   # The complete caller guard was checked above. The dialog itself cannot
   # read cMT geometry, so its own before/after guard covers its actual fields.
   $dialogObject=$before.object.canonical_json|ConvertFrom-Json
   if(!$before.directory_geometry_evidence_path -or @($dialogObject.rectangle).Count -ne 4 -or (CanonicalObjectHash $dialogObject) -ine $Arguments.expected_object_sha256){throw 'Current complete cMT Trend object and native host geometry required before update'}
   $dialogObject.rectangle=$null
   $dialogObjectHash=CanonicalObjectHash $dialogObject
  }
  $null=& (Join-Path $PSScriptRoot 'NativeObjectUpdate.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $ExpectedSha256 -DialogHwnd $dialog.Hwnd -ObjectId $Arguments.object_id -ExpectedObjectSha256 $dialogObjectHash -OwnedSemanticBackground ([bool]$Session.owned_semantic_background) -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -ChangesPath $changePath -OutputPath $updatePath -TagEvidence $TagEvidence -PreparedNativeRead $before.prepared_native_read
  $updated=Get-Content -LiteralPath $updatePath -Raw -Encoding UTF8|ConvertFrom-Json
  if($updated.status -cne 'success'){throw 'Native target object update not fully verified'}
   $after=if($updated.after.object.kind -cin @('option_list','picture')){New-WeinviewObjectRecord ([string]$Arguments.object_id) $updated.after.object -CanonicalInput}else{New-WeinviewObjectRecord ([string]$Arguments.object_id) $updated.after.object}
  if($after.object_sha256 -cne $updated.after.sha256){throw 'Native target dialog readback hash differs before confirm'}
  if($cmtTrend -and ($after.kind -cne 'trend' -or $null -ne $after.rectangle)){throw 'cMT Trend dialog readback must retain its unread geometry as null'}
   $colorProof=$updated.appearance_color_evidence
   if($colorProof){
    $colorRequested=@($colorProof.requested.PSObject.Properties.Name)
   $colorReadFields=if($after.kind -cin @('bit_switch','bit_lamp','window_button')){@('off_text_rgb','on_text_rgb')}else{$colorRequested}
    . (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1')
    # Read the resulting colors before closing this property dialog, avoiding
    # another directory traversal, object open and complete property read.
    $actualColors=Get-WeinviewRequestedAppearanceColors $Session.identity_path $dialog.Hwnd $after.kind ([string[]]$colorReadFields)
    foreach($field in $colorReadFields){$expectedRgb=if($colorRequested -ccontains $field){@($colorProof.requested.$field)}else{@($colorProof.before.$field)};$actualRgb=@($actualColors.$field);if(($actualRgb -join ',') -cne ($expectedRgb -join ',')){throw ('Native target RGB differs or unrequested state changed: '+$field+' expected='+($expectedRgb -join ',')+' actual='+($actualRgb -join ','))}}
    WritePrivateJson ($EvidencePrefix+'.dialog-color.rgb.json') @{object_id=[string]$Arguments.object_id;before=$colorProof.before;requested=$colorProof.requested;actual=$actualColors;scope='native_dialog'}
    $colorProof.after=$actualColors;$colorProof.native_rgb_verified=$true
    $colorProof|Add-Member -NotePropertyName scope -NotePropertyValue 'native_dialog' -Force
   }
  Close-WeinviewScreenDialog $Session $dialog (-not [bool]$updated.unchanged);$dialog=$null;$confirmed=$true
  $confirmedGeometryPath=$null
  if($cmtTrend){
   # Obtain geometry again after native confirmation. Never label the earlier
   # host rectangle as a post-edit observation or silently accept a moved TD.
   $confirmedGeometryPath=$EvidencePrefix+'.confirmed.native-geometry.json'
   $geometryAfter=Read-WeinviewCmtTrendGeometry $Session ([string]$Arguments.object_id) ([int]$before.window_number) $ExpectedSha256 $confirmedGeometryPath
   if((@($geometryAfter.rectangle) -join ',') -cne (@($before.object.rectangle) -join ',')){throw 'cMT Trend geometry changed after property confirmation'}
   $completeAfter=$after.canonical_json|ConvertFrom-Json
   $completeAfter.rectangle=@($geometryAfter.rectangle)
   $after=New-WeinviewObjectRecord ([string]$Arguments.object_id) $completeAfter
  }
  if((Hash $Session.project_path) -ine $ExpectedSha256){throw 'Target update saved project before caller boundary'}
   return [pscustomobject]@{object_before=$before.object;object_after=$after;appearance_color_evidence=$colorProof;appearance_shape_evidence=$updated.appearance_shape_evidence;channel_y_axis_before=$updated.channel_y_axis_before;channel_y_axis_after=$updated.channel_y_axis_after;tag_binding_evidence=$updated.tag_binding_evidence;security_class_before=if($securityRequested){$updated.security_class_before}else{$null};security_class_requested=if($securityRequested){$updated.security_class_requested}else{$null};security_class_after=if($securityRequested){$updated.security_class_after}else{$null};security_class_edit=if($securityRequested){$updated.security_class_edit}else{$null};target_window=$before.window_number;target_window_name=$before.window_name;directory_object_count_before=$before.directory_object_count;target_raw_label=$before.raw_label;before_read_evidence_path=$before.read_evidence_path;update_evidence_path=$updatePath;confirmed_geometry_evidence_path=$confirmedGeometryPath;target_only_verified=$true;untouched_objects_verified=$false;untouched_objects_verification_scope='not inspected; target object only'}
 }finally{
  # A nested original Tag selector disables the numeric property. Preserve
  # the inner failure instead of replacing it with a disabled-parent click.
  if(!$confirmed -and $dialog -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Enabled}).Count){Close-WeinviewScreenDialog $Session $dialog $false}
  if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $before.restore_context}
 }
}

# Verify only objects changed by a mixed screen batch after its single save/reopen.
# Ordinary objects keep their ObjectRecord contract; AL keeps its native property hash.
function Assert-WeinviewProjectScreenBatchTargets($Session,$States,[string]$SavedSha256,[string]$EvidencePrefix){
 if((Hash $Session.project_path) -ine $SavedSha256){throw 'Batch target read project hash mismatch'}
 $targets=@{};$keys=New-Object 'Collections.Generic.List[string]'
 foreach($state in @($States)){
  $ordinary=@($state.screen_objects_after|Where-Object {$null -ne $_})
  $alarms=@($state.alarm_displays_after|Where-Object {$null -ne $_})
  if(!$ordinary.Count -and !$alarms.Count){continue}
  $window=[int]$state.window_number
  if($window -lt 10 -or $window -gt 1999){throw 'Batch target requires an actual ordinary window number'}
  foreach($object in $ordinary){
   $id=[string]$object.object_id;$sha=[string]$object.object_sha256
   if([string]::IsNullOrWhiteSpace($id) -or $sha -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Batch ordinary target requires object ID and ObjectRecord SHA256'}
   $key=[string]$window+'|'+$id
   if(!$targets.ContainsKey($key)){$keys.Add($key)}
    $pendingColor=if($state.kind -ceq 'screen_update'){$state.applied.appearance_color_evidence}else{@($state.applied.appearance_color_evidence|Where-Object {$_.object_id -ceq $id})|Select-Object -First 1}
    $mergedColors=[ordered]@{}
    if($targets.ContainsKey($key) -and $targets[$key].expected_appearance_color){foreach($color in $targets[$key].expected_appearance_color.PSObject.Properties){$mergedColors[$color.Name]=$color.Value}}
    if($pendingColor -and $pendingColor.after){foreach($color in $pendingColor.after.PSObject.Properties){$mergedColors[$color.Name]=$color.Value}}
    # Disabling fill makes its picker unavailable. Retain the visible border, but do
    # not turn fill on again merely to inspect a previously requested interior color.
    if($object.kind -ceq 'rectangle' -and !$object.filled){$mergedColors.Remove('fill_rgb')}
    $expectedColor=if($mergedColors.Count){[pscustomobject]$mergedColors}else{$null}
    $colorFields=@($mergedColors.Keys)
    $targets[$key]=[pscustomobject]@{window_number=$window;object_id=$id;kind='ordinary';expected_sha256=$sha;expected_object=$object;state=$state;step_index=$state.index;step_kind=$state.kind;appearance_color_fields=$colorFields;expected_appearance_color=$expectedColor}
  }
  foreach($alarm in $alarms){
   $id=[string]$alarm.object_id;$sha=[string]$alarm.observed_properties_sha256
   if($id -cnotmatch '^AL_[0-9]{1,5}$' -or $sha -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Batch Alarm Display target requires native AL ID and observed property SHA256'}
   $key=[string]$window+'|'+$id
   if(!$targets.ContainsKey($key)){$keys.Add($key)}
   $targets[$key]=[pscustomobject]@{window_number=$window;object_id=$id;kind='alarm_display';expected_sha256=$sha;step_index=$state.index;step_kind=$state.kind}
  }
 }
 $proof=@();$selectedWindow=0;$ordinal=0
 foreach($key in $keys){
  $target=$targets[$key];$ordinal++
  if($selectedWindow -ne $target.window_number){$null=Select-WeinviewWindow $Session ([int]$target.window_number);$selectedWindow=[int]$target.window_number}
  $prefix=$EvidencePrefix+'.target-'+$ordinal
  if($target.kind -ceq 'alarm_display'){
   $directory=Get-WeinviewWindowDirectory -Session $Session
   if([int]$directory.window_number -ne $target.window_number){throw 'Batch Alarm Display target window differs after selection'}
   $rows=@($directory.rows|Where-Object {$_.object_id -ceq $target.object_id})
   if($rows.Count -ne 1){throw 'Unique persisted batch Alarm Display row required'}
   $dialog=$null
   try{
    $dialog=Open-WeinviewAlarmDisplayObject $Session $directory $rows[0]
    $actual=Read-WeinviewAlarmDisplayDialog $Session $dialog $target.object_id
    $actualSha=Get-WeinviewAlarmDisplayPropertyHash $actual
    $path=$prefix+'.alarm-read.json';WritePrivateJson $path $actual
   }finally{
    if($dialog -and @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd}).Count){Close-WeinviewScreenDialog $Session $dialog $false}
    if($directory.restore_context -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Class -ceq '#32770' -and $_.Visible}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}
   }
   if($actualSha -cne $target.expected_sha256){throw "Persisted batch AL $($target.object_id) properties differ: expected $($target.expected_sha256), actual $actualSha"}
   $proof+=,[pscustomobject]@{window_number=$target.window_number;object_id=$target.object_id;kind=$target.kind;step_index=$target.step_index;step_kind=$target.step_kind;expected_sha256=$target.expected_sha256;actual_sha256=$actualSha;read_evidence_path=$path;actual=$actual;matched=$true}
  }else{
    $read=Read-WeinviewTargetObject $Session $target.object_id $SavedSha256 $prefix $false $false ([string[]]$target.appearance_color_fields)
   if([int]$read.window_number -ne $target.window_number){throw 'Batch target window differs after selection'}
   $actualSha=[string]$read.object.object_sha256
   $automaticHeight=$null
   if($actualSha -cne $target.expected_sha256){
    $state=$target.state;$requested=$state.request;$applied=$state.applied
    $modeChanged=($state.kind -ceq 'screen_update' -and $read.object.kind -ceq 'option_list' -and @($requested.PSObject.Properties.Name) -ccontains 'mode' -and $applied.object_before.mode -cne $target.expected_object.mode -and $read.object.mode -ceq $requested.mode)
    $oldRect=@($target.expected_object.rectangle);$newRect=@($read.object.rectangle)
    if(!$modeChanged -or $oldRect.Count -ne 4 -or $newRect.Count -ne 4 -or [int]$oldRect[0] -ne [int]$newRect[0] -or [int]$oldRect[1] -ne [int]$newRect[1] -or [int]$oldRect[2] -ne [int]$newRect[2] -or [int]$newRect[3] -lt 1 -or ([int]$newRect[1]+[int]$newRect[3]) -gt [int]$Session.window_height){throw "Persisted batch object $($target.object_id) ($($read.object.kind)) differs: expected $($target.expected_sha256), actual $actualSha; step $($target.step_index)"}
    $expectedPersisted=$target.expected_object.canonical_json|ConvertFrom-Json
    $expectedPersisted.rectangle[3]=[int]$newRect[3]
    if((CanonicalObjectHash $expectedPersisted) -cne $actualSha){throw "Persisted batch Option List $($target.object_id) differs beyond automatic mode height: expected $($target.expected_sha256), actual $actualSha"}
    $automaticHeight=[pscustomobject]@{reason='explicit_mode_change_native_height';requested_mode=[string]$requested.mode;before_height=[int]$oldRect[3];persisted_height=[int]$newRect[3];canvas_height=[int]$Session.window_height}
   }
    if($target.state.kind -ceq 'screen_add_trends'){
     if($read.object.kind -cne 'trend'){throw 'Persisted batch Trend target kind differs'}
     $created=@($target.state.applied.creation_evidence|Where-Object {$_.object_id -ceq $target.object_id})
     if($created.Count -ne 1){throw 'Unique batch Trend creation binding required for persisted channel verification'}
     $wantChannels=@($created[0].sampling_binding.channels);$seenChannels=@($read.sampling_channels_enabled_evidence.channels)
     if($seenChannels.Count -ne $wantChannels.Count -or !$read.sampling_channels_enabled_evidence.all_enabled){throw 'Persisted batch Trend channel enablement differs'}
     for($channelIndex=0;$channelIndex -lt $wantChannels.Count;$channelIndex++){
      $seenChannel=$seenChannels[$channelIndex];$wantChannel=$wantChannels[$channelIndex]
      if([int]$seenChannel.row -ne ($channelIndex+1) -or [string]$seenChannel.label -cne [string]$wantChannel.label -or [string]$seenChannel.data_type -cne [string]$wantChannel.data_type -or !$seenChannel.enabled){throw ('Persisted batch Trend channel '+($channelIndex+1)+' differs')}
     }
     Assert-WeinviewTrendCreated $read.object $created[0].requested $created[0].sampling_binding $read.channel_y_axis_evidence
    }
   foreach($field in @($target.appearance_color_fields)){
    $expectedRgb=@($target.expected_appearance_color.$field);$actualRgb=@($read.appearance_color.$field)
    if(($actualRgb -join ',') -cne ($expectedRgb -join ',')){throw ('Persisted batch object '+$target.object_id+' RGB differs after reopen: '+$field+' expected='+($expectedRgb -join ',')+' actual='+($actualRgb -join ','))}
   }
    $proof+=,[pscustomobject]@{window_number=$target.window_number;object_id=$target.object_id;kind=[string]$read.object.kind;step_index=$target.step_index;step_kind=$target.step_kind;expected_sha256=$target.expected_sha256;actual_sha256=$actualSha;read_evidence_path=$read.read_evidence_path;directory_geometry_evidence_path=$read.directory_geometry_evidence_path;channel_y_axis_evidence=if($target.state.kind -ceq 'screen_add_trends'){$read.channel_y_axis_evidence}else{$null};sampling_channels_enabled_evidence=if($target.state.kind -ceq 'screen_add_trends'){$read.sampling_channels_enabled_evidence}else{$null};object=$read.object;appearance_color=$read.appearance_color;automatic_option_list_height=$automaticHeight;matched=$true}
  }
 }
 if((Hash $Session.project_path) -ine $SavedSha256){throw 'Batch target read changed saved project bytes'}
 return [pscustomobject]@{verified=$true;target_count=$proof.Count;targets=$proof;scope='last expected target per window/object ID; native target properties only'}
}
