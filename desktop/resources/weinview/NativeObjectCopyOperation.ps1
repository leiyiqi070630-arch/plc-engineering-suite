# One original-vendor group Copy and Paste within a single owned window.
# The caller owns the fresh project copy, save, close, and reopen.
function Assert-WeinviewObjectCopyArguments($Arguments) {
 $required=@('project_path','output_path','expected_project_sha256','window_number')
 $optional=@('workspace_root','exe_path','translation','object_ids','address_replacements','donor_path','expected_donor_sha256','donor_window_number')
 $names=@($Arguments.PSObject.Properties.Name)
 if(@($required|Where-Object {$_ -cnotin $names}).Count -or @($names|Where-Object {$_ -cnotin ($required+$optional)}).Count){throw 'Exact screen_copy_objects arguments required.'}
 foreach($field in @('project_path','output_path','expected_project_sha256')){if($Arguments.$field -isnot [string] -or [string]::IsNullOrWhiteSpace($Arguments.$field)){throw ('Nonempty screen copy string required: '+$field)}}
 if(($Arguments.window_number -isnot [int] -and $Arguments.window_number -isnot [long]) -or [long]$Arguments.window_number -lt 10 -or [long]$Arguments.window_number -gt 1999){throw 'Ordinary native window_number 10..1999 required.'}
 $donorFields=@('donor_path','expected_donor_sha256','donor_window_number')
 $external=(@($donorFields|Where-Object {$_ -cin $names}).Count -gt 0)
 if($external){
  if(@($donorFields|Where-Object {$_ -cnotin $names}).Count){throw 'screen_copy_objects external donor requires donor_path, expected_donor_sha256, and donor_window_number together.'}
  if($Arguments.donor_path -isnot [string] -or [string]::IsNullOrWhiteSpace($Arguments.donor_path) -or $Arguments.expected_donor_sha256 -isnot [string] -or $Arguments.expected_donor_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'External donor requires a nonempty path and SHA256.'}
  if(($Arguments.donor_window_number -isnot [int] -and $Arguments.donor_window_number -isnot [long]) -or [long]$Arguments.donor_window_number -lt 10 -or [long]$Arguments.donor_window_number -gt 1999){throw 'External donor_window_number 10..1999 required.'}
 }
 $requested=$null
 if($names -ccontains 'translation'){
  $parts=@($Arguments.translation)
  if($parts.Count -ne 2){throw 'screen_copy_objects translation requires exactly [dx,dy].'}
  $requested=@();foreach($part in $parts){if(($part -isnot [int] -and $part -isnot [long]) -or [long]$part -lt -65535 -or [long]$part -gt 65535){throw 'screen_copy_objects translation requires integer deltas within -65535..65535.'};$requested+=,[int]$part}
 }
 $requestedIds=$null
 if($names -ccontains 'object_ids'){
  if($Arguments.object_ids -isnot [array]){throw 'screen_copy_objects object_ids requires an array of native IDs.'}
  $ids=@($Arguments.object_ids)
  if(!$ids.Count){throw 'screen_copy_objects object_ids requires a nonempty native ID list.'}
  $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
  $requestedIds=@();foreach($id in $ids){if($id -isnot [string] -or $id -cnotmatch '^(?!WA_)[A-Z]+_[0-9]{1,5}$' -or !$seen.Add($id)){throw 'screen_copy_objects object_ids requires unique exact native IDs.'};$requestedIds+=,$id}
 }
 $replacements=$null
 if($names -ccontains 'address_replacements'){
  if($Arguments.address_replacements -isnot [array] -or !@($Arguments.address_replacements).Count){throw 'screen_copy_objects address_replacements requires a nonempty array.'}
  $fields=@('address_kind','device_name','address_type','address','target_device_name','target_address_type','target_address')
  $replacements=@()
  foreach($rule in $Arguments.address_replacements){
   $ruleNames=@($rule.PSObject.Properties.Name)
   if($null -eq $rule -or $rule -isnot [psobject] -or $ruleNames.Count -lt $fields.Count -or $ruleNames.Count -gt ($fields.Count+1) -or @($fields|Where-Object {$_ -cnotin $ruleNames}).Count -or @($ruleNames|Where-Object {$_ -cnotin ($fields+@('address_end'))}).Count){throw 'screen_copy_objects address_replacements requires seven raw-address fields and optional address_end per rule.'}
   $args=[ordered]@{project_path=if($external){[string]$Arguments.donor_path}else{[string]$Arguments.project_path};output_path=[string]$Arguments.output_path;expected_project_sha256=if($external){[string]$Arguments.expected_donor_sha256}else{[string]$Arguments.expected_project_sha256};scope='window';window_number=if($external){[int]$Arguments.donor_window_number}else{[int]$Arguments.window_number}}
   foreach($field in $fields){$args[$field]=$rule.$field}
   if($ruleNames -ccontains 'address_end'){$args.address_end=$rule.address_end}
   $validated=Assert-WeinviewAddressReplaceArguments ([pscustomobject]$args)
   $replacements+=,[pscustomobject]@{arguments=[pscustomobject]$args;contract=$validated;rule=$rule}
  }
 }
 return [pscustomobject]@{window_number=[int]$Arguments.window_number;source_window_number=if($external){[int]$Arguments.donor_window_number}else{[int]$Arguments.window_number};external_donor=$external;translation=$requested;object_ids=$requestedIds;address_replacements=$replacements}
}
function Assert-WeinviewObjectMoveArguments($Arguments) {
 $required=@('project_path','output_path','expected_project_sha256','window_number','translation')
 $optional=@('workspace_root','exe_path','object_ids')
 $names=@($Arguments.PSObject.Properties.Name)
 if(@($required|Where-Object {$_ -cnotin $names}).Count -or @($names|Where-Object {$_ -cnotin ($required+$optional)}).Count){throw 'Exact screen_move_objects arguments required.'}
 $copyValues=[ordered]@{}
 foreach($field in @('project_path','output_path','expected_project_sha256','window_number','translation','object_ids','workspace_root','exe_path')){if($names -ccontains $field){$copyValues[$field]=$Arguments.$field}}
 return Assert-WeinviewObjectCopyArguments ([pscustomobject]$copyValues)
}
function Open-WeinviewObjectCopyWindow($Session,[int]$WindowNumber) {
 $null=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindows
 $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Pid -eq $Session.process.Id -and $_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Enabled})
 if($main.Count -ne 1){throw 'Owned native screen copy main window unavailable.'}
 $pattern='^'+$WindowNumber+'\s*-\s*(.+)$'
 $views=@($Session.native.EnumChildControls($main[0].Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible -and $_.Enabled -and $_.Pid -eq $Session.process.Id -and $_.Title -cmatch $pattern})
 if($views.Count -gt 1){throw 'Target native document canvas ambiguous.'}
 if($views.Count -eq 1){
  $title=[string]$views[0].Title
  if($main[0].Title -cnotmatch ('\[\s*'+[regex]::Escape($title)+'\s*\]\s*$')){
   $null=$Session.native.ActivateOwnedDocument([long]$main[0].Hwnd,[long]$views[0].Hwnd,$title)
  }
 }else{
  $null=Select-WeinviewWindow $Session $WindowNumber
 }
 $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Pid -eq $Session.process.Id -and $_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Enabled})
 $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible -and $_.Enabled -and $_.Pid -eq $Session.process.Id -and $_.Title -cmatch $pattern})
 if($main.Count -ne 1 -or $views.Count -ne 1 -or $main[0].Title -cnotmatch ('\[\s*'+[regex]::Escape([string]$views[0].Title)+'\s*\]\s*$')){throw 'Target native screen copy document is not active.'}
 $Session.window_number=$WindowNumber
 $Session.window_name=[regex]::Match([string]$views[0].Title,$pattern).Groups[1].Value.TrimEnd()
 return [pscustomobject]@{canvas_hwnd=[long]$views[0].Hwnd;document_title=[string]$views[0].Title;window_number=$WindowNumber;window_name=[string]$Session.window_name}
}
function Get-WeinviewObjectCopySelectedIds($Session,[int]$WindowNumber) {
 $raw=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindowObjects -Arguments @($WindowNumber)
 $mapped=Convert-WeinviewNativeHostWindowObjects $raw $WindowNumber
 return @($mapped.objects|Where-Object {[int]$_.selected -ne 0}|ForEach-Object {[string]$_.object_id})
}
function Get-WeinviewObjectCopySelectedScene($Session,[int]$WindowNumber) {
 $raw=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindowObjects -Arguments @($WindowNumber)
 return Convert-WeinviewNativeHostWindowObjects $raw $WindowNumber
}
function Get-WeinviewObjectCopyCurrentSelection($Session,[int]$WindowNumber,[string[]]$Desired) {
 $currentScene=Get-WeinviewObjectCopySelectedScene $Session $WindowNumber
 $selectedIds=@($currentScene.objects|Where-Object {[int]$_.selected -ne 0}|ForEach-Object {[string]$_.object_id})
 if($selectedIds.Count -eq $Desired.Count -and (@($selectedIds|Sort-Object -CaseSensitive) -join [char]31) -ceq (@($Desired|Sort-Object -CaseSensitive) -join [char]31)){
  return [pscustomobject]@{selection_route='native_current_selection';selection_rectangle=$null;selected_ids=@($selectedIds)}
 }
 return $null
}
function Assert-WeinviewObjectCopySelectedAdditions($Mapped,$Inventory) {
 $added=@($Inventory.added_objects|ForEach-Object {[string]$_.object_id})
 $selected=@($Mapped.objects|Where-Object {[int]$_.selected -ne 0}|ForEach-Object {[string]$_.object_id})
 if($selected.Count -ne $added.Count -or (@($selected|Sort-Object -CaseSensitive) -join [char]31) -cne (@($added|Sort-Object -CaseSensitive) -join [char]31)){throw ('Native selected set after Paste differs from copied additions; no group shift. added='+($added -join ',')+'; selected='+($selected -join ','))}
}
function Get-WeinviewObjectCopyCanvasDimensions($NativeWindowRecord) {
 $wa=@($NativeWindowRecord.bbox)
 if($wa.Count -ne 4){throw 'Actual native WA canvas dimensions unavailable for screen copy.'}
 $w=0;$h=0;$left=0;$top=0
 if(![int]::TryParse([string]$wa[0],[ref]$left) -or ![int]::TryParse([string]$wa[1],[ref]$top) -or ![int]::TryParse([string]$wa[2],[ref]$w) -or ![int]::TryParse([string]$wa[3],[ref]$h) -or $left -ne 0 -or $top -ne 0 -or $w -lt 0 -or $h -lt 0 -or $w -eq [int]::MaxValue -or $h -eq [int]::MaxValue){throw 'Actual native WA canvas rectangle invalid for screen copy.'}
 return @([int]($w+1),[int]($h+1))
}
function Invoke-WeinviewObjectCopySpatialSelection($Session,$Document,$Before,[string[]]$TargetIds,[string]$EvidencePrefix) {
 $size=@(Get-WeinviewObjectCopyCanvasDimensions $Before.native_window_record);$width=[int]$size[0];$height=[int]$size[1]
 $targetSet=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($id in $TargetIds){$null=$targetSet.Add($id)}
 $left=[long]::MaxValue;$top=[long]::MaxValue;$right=[long]::MinValue;$bottom=[long]::MinValue
 $selectedRows=@();$otherRects=@();$allRects=@()
 foreach($row in @($Before.rows)){
  $rect=@(Convert-WeinviewMultiCopyRectangle $row)
  $allRects+=,[pscustomobject]@{object_id=[string]$row.object_id;rectangle=$rect}
  if(!$targetSet.Contains([string]$row.object_id)){$otherRects+=,$rect;continue}
  if([long]$rect[2] -le 0 -or [long]$rect[3] -le 0){throw ('Selected native object has no positive actual rectangle: '+$row.object_id)}
  $selectedRows+=,[pscustomobject]@{object_id=[string]$row.object_id;rectangle=$rect}
  $left=[math]::Min($left,[long]$rect[0]);$top=[math]::Min($top,[long]$rect[1]);$right=[math]::Max($right,[long]$rect[0]+[long]$rect[2]);$bottom=[math]::Max($bottom,[long]$rect[1]+[long]$rect[3])
 }
 if($left -eq [long]::MaxValue){throw 'Requested native subset has no actual object geometry.'}
 $left-=2;$top-=2;$right+=2;$bottom+=2
 $interleaved=$false
 foreach($rect in $otherRects){
  if($left -lt ([long]$rect[0]+[long]$rect[2]) -and $right -gt [long]$rect[0] -and $top -lt ([long]$rect[1]+[long]$rect[3]) -and $bottom -gt [long]$rect[1]){$interleaved=$true;break}
 }
 $points=@()
 if($interleaved){
  $empty=$null;$blankYs=@([long]0,([long]$height-1))
  foreach($item in $allRects){
   $r=$item.rectangle;$rx=[long]$r[0];$ry=[long]$r[1];$rr=$rx+[long]$r[2];$rb=$ry+[long]$r[3]
   if($rx -le 0 -and $ry -le 0 -and $rr -ge $width -and $rb -ge $height){throw 'One actual native object covers the entire canvas; no blank selection point.'}
   $blankYs+=@(($ry-1),$rb)
  }
  foreach($py in @($blankYs|Sort-Object -Unique)){
   if($py -lt 0 -or $py -ge $height){continue}
   $intervals=@()
   foreach($item in $allRects){
    $r=$item.rectangle;$ry=[long]$r[1];$rb=$ry+[long]$r[3]
    if($py -lt $ry -or $py -ge $rb){continue}
    $start=[math]::Max(0L,[long]$r[0]);$end=[math]::Min([long]$width,([long]$r[0]+[long]$r[2]))
    if($start -lt $end){$intervals+=,[pscustomobject]@{left=$start;right=$end}}
   }
   $coveredUntil=0L
   foreach($interval in @($intervals|Sort-Object left)){
    if([long]$interval.left -gt $coveredUntil){break}
    $coveredUntil=[math]::Max($coveredUntil,[long]$interval.right)
    if($coveredUntil -ge $width){break}
   }
   if($coveredUntil -lt $width){$empty=@([int]$coveredUntil,[int]$py);break}
  }
  if($null -eq $empty){throw 'Native canvas has no actual blank point to clear selection before element multiselect.'}
  foreach($item in $selectedRows){
   $rect=$item.rectangle;$x0=[long]$rect[0];$y0=[long]$rect[1];$w=[long]$rect[2];$h=[long]$rect[3]
   $xs=@(($x0+$(if($w -gt 2){1}else{0})),($x0+[math]::Floor(($w-1)/2)),($x0+$w-1-$(if($w -gt 2){1}else{0})))
   $ys=@(($y0+$(if($h -gt 2){1}else{0})),($y0+[math]::Floor(($h-1)/2)),($y0+$h-1-$(if($h -gt 2){1}else{0})))
   $chosen=$null
   foreach($yi in @(1,0,2)){foreach($xi in @(1,0,2)){
    $px=[long]$xs[$xi];$py=[long]$ys[$yi]
    if($px -lt 0 -or $py -lt 0 -or $px -ge $width -or $py -ge $height){continue}
    $covered=$false
    foreach($otherItem in $allRects){if($otherItem.object_id -ceq $item.object_id){continue};$other=$otherItem.rectangle;if($px -ge [long]$other[0] -and $px -lt ([long]$other[0]+[long]$other[2]) -and $py -ge [long]$other[1] -and $py -lt ([long]$other[1]+[long]$other[3])){$covered=$true;break}}
    if(!$covered){$chosen=@([int]$px,[int]$py);break}
   };if($null -ne $chosen){break}}
   if($null -eq $chosen){throw ('Selected native object has no visible unoccluded canvas point: '+$item.object_id)}
   $points+=,[pscustomobject]@{object_id=$item.object_id;logical_point=$chosen}
  }
 }elseif($left -lt 0 -or $top -lt 0 -or $right -ge $width -or $bottom -ge $height){throw 'Requested native subset cannot fit one selection rectangle inside the actual canvas.'}
 if($points.Count -and $points.Count -ne $TargetIds.Count){throw 'Native multiselect point plan differs from selected ID count.'}
 # Normalize the actual editor selection state before the empty-space box gesture.
 $null=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::SelectAll($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[string]$Document.document_title,[int]$Session.process.Id,[string]$Session.exe_path)
 $ready=WaitFor { $ids=@(Get-WeinviewObjectCopySelectedIds $Session ([int]$Document.window_number));if($ids.Count -eq @($Before.rows).Count){return $true} } 2
 if(!$ready){throw 'Original native selection state did not become ready before subset box.'}
 $null=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::Prepare($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[int]$Session.process.Id)
 $sceneReader=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,[long]$Session.main.Hwnd,[int]$Document.window_number,[string]$Document.window_name,$width,$height)
 $scene=$sceneReader.Capture($EvidencePrefix+'.selection.canvas.png')
 if([long]$scene.ViewHwnd -ne [long]$Document.canvas_hwnd -or [int]$scene.LogicalWidth -ne $width -or [int]$scene.LogicalHeight -ne $height -or [bool]$scene.Clipped){throw 'Captured canvas differs from exact native document for subset selection.'}
 if($interleaved){
  $ids=[string[]]@($points|ForEach-Object {[string]$_.object_id})
  $logical=[int[][]]@($points|ForEach-Object {,[int[]]@($_.logical_point)})
  $input=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::SelectElements($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[int]$Session.process.Id,$scene,[int[]]$empty,$ids,$logical)
  return [pscustomobject]@{selection_rectangle=$null;selection_route='native_canvas_element_multiselect';selection_points=@($points);selection_state_initialized=$true;input=$input;canvas=@{view_hwnd=$scene.ViewHwnd;logical_size=@($width,$height);image_sha256=$scene.ImageSha256}}
 }
 $box=@([int]$left,[int]$top,[int]($right-$left),[int]($bottom-$top))
 $input=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::SelectRectangle($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[int]$Session.process.Id,$scene,$box[0],$box[1],$box[2],$box[3])
 return [pscustomobject]@{selection_rectangle=$box;selection_route='native_canvas_spatial_rectangle';selection_state_initialized=$true;input=$input;canvas=@{view_hwnd=$scene.ViewHwnd;logical_size=@($width,$height);image_sha256=$scene.ImageSha256}}
}
function Invoke-WeinviewObjectCopyGroupShift($Session,$Document,$Mapped,$Inventory,[int[]]$Requested,[string]$EvidencePrefix) {
 $correction=@(([long]$Requested[0]-[long]$Inventory.translation[0]),([long]$Requested[1]-[long]$Inventory.translation[1]))
 if($correction[0] -eq 0 -and $correction[1] -eq 0){return [pscustomobject]@{performed=$false;correction=@(0,0);drag_count=0;selected_copied_ids_verified=$true}}
 $size=@(Get-WeinviewObjectCopyCanvasDimensions $Mapped.native_window_record);$width=[int]$size[0];$height=[int]$size[1]
 $null=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::Prepare($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[int]$Session.process.Id)
 $sceneReader=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,[long]$Session.main.Hwnd,[int]$Document.window_number,[string]$Document.window_name,$width,$height)
 $scene=$sceneReader.Capture($EvidencePrefix+'.canvas.png')
 if([long]$scene.ViewHwnd -ne [long]$Document.canvas_hwnd -or [int]$scene.LogicalWidth -ne $width -or [int]$scene.LogicalHeight -ne $height -or [bool]$scene.Clipped){throw 'Captured canvas differs from exact native document for group shift.'}
 $byId=@{};foreach($row in @($Mapped.objects)){$byId[[string]$row.object_id]=$row}
 $anchor=$null
 foreach($item in @($Inventory.added_objects)){
  $row=$byId[[string]$item.object_id];if(!$row){throw 'Copied anchor missing from actual native inventory.'}
  $rect=@(Convert-WeinviewMultiCopyRectangle $row)
  $x=[long]$rect[0]+[long][math]::Floor($rect[2]/2);$y=[long]$rect[1]+[long][math]::Floor($rect[3]/2)
  if($x -ge 0 -and $y -ge 0 -and $x -lt $width -and $y -lt $height -and $x+$correction[0] -ge 0 -and $y+$correction[1] -ge 0 -and $x+$correction[0] -lt $width -and $y+$correction[1] -lt $height){$anchor=[pscustomobject]@{object_id=[string]$item.object_id;logical_point=@([int]$x,[int]$y);rectangle=$rect};break}
 }
 if(!$anchor){throw 'No selected copied object has an actual canvas anchor and destination for the requested group shift.'}
 $drag=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::Drag($Session.native,[long]$Session.main.Hwnd,[long]$Document.canvas_hwnd,[int]$Session.process.Id,$scene,[string]$anchor.object_id,[int]$anchor.logical_point[0],[int]$anchor.logical_point[1],[int]$correction[0],[int]$correction[1])
 return [pscustomobject]@{performed=$true;correction=@($correction);drag_count=1;selected_copied_ids_verified=$true;anchor=$anchor;input=$drag;canvas=@{view_hwnd=$scene.ViewHwnd;logical_size=@($width,$height);canvas_origin_client=@($scene.CanvasOriginClient);image_sha256=$scene.ImageSha256}}
}
function Assert-WeinviewObjectCopyInventory($Before,$After,[string[]]$SourceIds,$SourceInventory=$null) {
 if($Before.read_route -cne 'native_host' -or $After.read_route -cne 'native_host' -or [int]$Before.window_number -ne [int]$After.window_number){throw 'Native host inventory required for screen object copy.'}
 if($null -eq $SourceInventory){$SourceInventory=$Before}
 if($SourceInventory.read_route -cne 'native_host'){throw 'Native source inventory required for screen object copy.'}
 $old=@($Before.rows);$current=@($After.rows)
 if($current.Count -ne $old.Count+$SourceIds.Count){throw 'Screen object copy added count differs.'}
 $oldById=@{};$currentById=@{};$sourceById=@{}
 foreach($row in $old){$id=[string]$row.object_id;if($oldById.ContainsKey($id)){throw 'Original native inventory ID duplicated.'};$oldById[$id]=$row}
 foreach($row in $current){$id=[string]$row.object_id;if($currentById.ContainsKey($id)){throw 'Final native inventory ID duplicated.'};$currentById[$id]=$row}
 foreach($row in @($SourceInventory.rows)){$id=[string]$row.object_id;if($sourceById.ContainsKey($id)){throw 'Source native inventory ID duplicated.'};$sourceById[$id]=$row}
 foreach($row in $old){
  $id=[string]$row.object_id
  if(!$currentById.ContainsKey($id)){throw ('Original screen object disappeared: '+$id)}
  $actual=$currentById[$id]
  if($actual.native_kind -cne $row.native_kind -or (@(Convert-WeinviewMultiCopyRectangle $actual) -join ',') -cne (@(Convert-WeinviewMultiCopyRectangle $row) -join ',')){throw ('Original screen object changed: '+$id)}
 }
 $added=@($current|Where-Object {!$oldById.ContainsKey([string]$_.object_id)})
 if($added.Count -ne $SourceIds.Count){throw 'Screen object copy new IDs do not match selected count.'}
 $translation=$null;$proof=@()
 for($i=0;$i -lt $SourceIds.Count;$i++){
  $source=$sourceById[$SourceIds[$i]];if(!$source){throw ('Selected source object absent: '+$SourceIds[$i])}
  $new=$added[$i];$sourceRect=@(Convert-WeinviewMultiCopyRectangle $source);$newRect=@(Convert-WeinviewMultiCopyRectangle $new)
  $offset=@(([long]$newRect[0]-[long]$sourceRect[0]),([long]$newRect[1]-[long]$sourceRect[1]))
  if($null -eq $translation){$translation=$offset}
  if($new.native_kind -cne $source.native_kind -or $newRect[2] -ne $sourceRect[2] -or $newRect[3] -ne $sourceRect[3] -or (@($offset) -join ',') -cne (@($translation) -join ',')){throw ('Copied object kind, size, or shared translation differs: '+$new.object_id)}
  $proof+=@{source_object_id=[string]$SourceIds[$i];object_id=[string]$new.object_id;native_kind=[string]$new.native_kind;rectangle=$newRect}
 }
 return [pscustomobject]@{before_count=$old.Count;after_count=$current.Count;source_object_ids=@($SourceIds);translation=@($translation);added_objects=@($proof);copied_properties_verified=$false}
}
function Get-WeinviewObjectCopyDesiredIds($Before,$Contract) {
 $allIds=@($Before.rows|ForEach-Object {[string]$_.object_id})
 if($null -eq $Contract.object_ids){if(!$allIds.Count){throw 'Screen object copy requires at least one actual native object.'};return $allIds}
 $wanted=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($id in @($Contract.object_ids)){$null=$wanted.Add([string]$id)}
 $desired=@($allIds|Where-Object {$wanted.Contains($_)})
 if($desired.Count -ne @($Contract.object_ids).Count){throw 'Requested native screen copy object ID absent from actual inventory; no Copy.'}
 return $desired
}
function Assert-WeinviewObjectCopySelectionReady($Session,[int]$Window,[string[]]$Desired,$Selection) {
 $state=[pscustomobject]@{selected=@()}
 try {
  $ready=WaitFor {
   $state.selected=@(Get-WeinviewObjectCopySelectedIds $Session $Window)
   if($state.selected.Count -eq $Desired.Count -and (@($state.selected|Sort-Object -CaseSensitive) -join [char]31) -ceq (@($Desired|Sort-Object -CaseSensitive) -join [char]31)){return $true}
  } 2
 } catch {
  throw ('Native selected object set differs from requested group; no Copy. desired='+($Desired -join ',')+'; selected='+($state.selected -join ',')+'; selection='+(ConvertTo-Json -InputObject $Selection -Depth 6 -Compress)+'; cause='+$_.Exception.Message)
 }
}
function Get-WeinviewObjectCopyMatchIds($Found,[string[]]$NativeIds) {
 $actual=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 foreach($id in $NativeIds){$null=$actual.Add($id)}
 $pattern='(?<![A-Za-z0-9_])(?!WA_)[A-Z]+_[0-9]{1,5}(?![A-Za-z0-9_])'
 $result=@()
 foreach($match in @($Found.matches)){
  $description=[string]$match.description
  $recognized=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  foreach($candidate in [regex]::Matches($description,$pattern)){if($actual.Contains($candidate.Value)){$null=$recognized.Add($candidate.Value)}}
  if($recognized.Count -ne 1){throw ('Native Find raw-address description does not identify exactly one actual object: '+$description)}
  $result+=,[string](@($recognized)[0])
 }
 return $result
}
function Assert-WeinviewObjectCopyIdMultiset([string[]]$Actual,[string[]]$Expected,[string]$Label) {
 if($Actual.Count -ne $Expected.Count -or (@($Actual|Sort-Object -CaseSensitive) -join [char]31) -cne (@($Expected|Sort-Object -CaseSensitive) -join [char]31)){throw ('Native raw-address object-ID multiset differs: '+$Label+' actual='+($Actual -join ',')+' expected='+($Expected -join ','))}
}
function Get-WeinviewObjectCopyRangeReferences($Found,[string[]]$Ids,$Snapshot) {
 if(!$Snapshot.contract.range_enabled){return @()}
 if(@($Found.matches).Count -ne $Ids.Count){throw 'Native range Find rows and actual object IDs differ.'}
 $area=if($Snapshot.target){[string]$Snapshot.arguments.target_address_type}else{[string]$Snapshot.arguments.address_type}
 $start=if($Snapshot.target){[int]$Snapshot.arguments.target_address}else{[int]$Snapshot.arguments.address}
 $end=if($Snapshot.target){[int]$Snapshot.contract.target_end}else{[int]$Snapshot.contract.source_end}
 $pattern='(?<![A-Za-z0-9_])'+[regex]::Escape($area)+'-(?<value>0|[1-9][0-9]*)(?![A-Za-z0-9_])'
 $references=@()
 for($i=0;$i -lt $Ids.Count;$i++){
  $description=[string]$Found.matches[$i].description;$matches=[regex]::Matches($description,$pattern)
  if($matches.Count -ne 1){throw ('Native range Find row does not expose exactly one '+$area+' decimal reference: '+$description)}
  $number=0
  if(![int]::TryParse([string]$matches[0].Groups['value'].Value,[ref]$number) -or $number -lt $start -or $number -gt $end){throw ('Native range Find row address outside actual query span: '+$description)}
  $references+=,[pscustomobject]@{object_id=[string]$Ids[$i];address=[string]$number}
 }
 return $references
}
function Assert-WeinviewObjectCopyRangeReferenceMultiset($Actual,$Expected,[string]$Label) {
 $actualKeys=@($Actual|ForEach-Object {[string]$_.object_id+[char]30+[string]$_.address})
 $expectedKeys=@($Expected|ForEach-Object {[string]$_.object_id+[char]30+[string]$_.address})
 Assert-WeinviewObjectCopyIdMultiset ([string[]]$actualKeys) ([string[]]$expectedKeys) $Label
}
function Assert-WeinviewNativeObjectMoveInventory($Before,$After,[string[]]$ObjectIds,[int[]]$Translation) {
 if($Before.read_route -cne 'native_host' -or $After.read_route -cne 'native_host' -or [int]$Before.window_number -ne [int]$After.window_number){throw 'Native host inventory required for screen object move.'}
 $old=@($Before.rows);$current=@($After.rows)
 if($current.Count -ne $old.Count){throw 'Screen object move changed actual object count.'}
 $wanted=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 foreach($id in $ObjectIds){$null=$wanted.Add($id)}
 $byId=@{};foreach($row in $current){$id=[string]$row.object_id;if($byId.ContainsKey($id)){throw 'Moved window native ID duplicated.'};$byId[$id]=$row}
 $moved=@()
 foreach($row in $old){
  $id=[string]$row.object_id
  if(!$byId.ContainsKey($id)){throw ('Screen object move lost native ID: '+$id)}
  $actual=$byId[$id];$beforeRect=@(Convert-WeinviewMultiCopyRectangle $row);$afterRect=@(Convert-WeinviewMultiCopyRectangle $actual)
  $dx=if($wanted.Contains($id)){[long]$Translation[0]}else{0L};$dy=if($wanted.Contains($id)){[long]$Translation[1]}else{0L}
  $expected=@(([long]$beforeRect[0]+$dx),([long]$beforeRect[1]+$dy),([long]$beforeRect[2]),([long]$beforeRect[3]))
  if($actual.native_kind -cne $row.native_kind -or (@($afterRect) -join ',') -cne (@($expected) -join ',')){throw ('Screen object move native kind or exact rectangle differs: '+$id+' before_kind='+$row.native_kind+' actual_kind='+$actual.native_kind+' before=['+($beforeRect -join ',')+'] expected=['+($expected -join ',')+'] actual=['+($afterRect -join ',')+']')}
  if($wanted.Contains($id)){$moved+=@{object_id=$id;native_kind=[string]$row.native_kind;before_rectangle=$beforeRect;rectangle=$afterRect}}
 }
 if($moved.Count -ne $ObjectIds.Count){throw 'Screen object move selected IDs do not match actual inventory.'}
 return [pscustomobject]@{scope='native_screen_move_objects';window_number=[int]$Before.window_number;object_ids=@($ObjectIds);before_count=$old.Count;after_count=$current.Count;translation=@($Translation);moved_objects=@($moved);inventory_route='native_host';properties_verified=$false;other_object_geometry_unchanged=$true}
}
function Invoke-WeinviewNativeObjectMove($Session,$Contract,[string]$ProjectSha256,[string]$EvidencePrefix) {
 $window=[int]$Contract.window_number
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Screen object move project changed before operation.'}
 $document=Open-WeinviewObjectCopyWindow $Session $window
 $before=Get-WeinviewWindowObjectInventory $Session
 if($before.read_route -cne 'native_host'){throw 'Native host inventory required before screen object move.'}
 $desired=@(Get-WeinviewObjectCopyDesiredIds $before $Contract);$allIds=@($before.rows|ForEach-Object {[string]$_.object_id})
 $requested=[int[]]@($Contract.translation);$selection=$null;$movement=$null
 if($requested[0] -ne 0 -or $requested[1] -ne 0){
  $selection=Get-WeinviewObjectCopyCurrentSelection $Session $window ([string[]]$desired)
  if($null -eq $selection){if($desired.Count -eq $allIds.Count){$null=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::SelectAll($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path);$selection=[pscustomobject]@{selection_route='native_select_all';selection_rectangle=$null}}else{$selection=Invoke-WeinviewObjectCopySpatialSelection $Session $document $before ([string[]]$desired) $EvidencePrefix}}
  Assert-WeinviewObjectCopySelectionReady $Session $window ([string[]]$desired) $selection
  if(([math]::Abs([long]$requested[0])+[math]::Abs([long]$requested[1])) -le 16){
   $movement=[PLC Engineering Suite.Weinview.NativeGroupTranslationControls]::Nudge($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[int]$Session.process.Id,[string]$Session.exe_path,[int]$requested[0],[int]$requested[1])
  }else{
   $mapped=Get-WeinviewObjectCopySelectedScene $Session $window
   $carrier=[pscustomobject]@{translation=@(0,0);added_objects=@($desired|ForEach-Object {@{object_id=[string]$_}})}
   Assert-WeinviewObjectCopySelectedAdditions $mapped $carrier
   $shift=Invoke-WeinviewObjectCopyGroupShift $Session $document $mapped $carrier $requested $EvidencePrefix
   if(!$shift.performed -or [int]$shift.drag_count -ne 1){throw 'Nonzero screen object move requires exactly one native group drag.'}
   $movement=[pscustomobject]@{method='native_group_drag';performed=$true;drag_count=1}
  }
 }else{$movement=[pscustomobject]@{method='no_input';performed=$false}}
 $after=Get-WeinviewWindowObjectInventory $Session
 $result=Assert-WeinviewNativeObjectMoveInventory $before $after ([string[]]$desired) $requested
 $result|Add-Member -NotePropertyName after_inventory -NotePropertyValue $after
 $result|Add-Member -NotePropertyName movement -NotePropertyValue $movement
 if($selection){$result|Add-Member -NotePropertyName selection_route -NotePropertyValue $selection.selection_route;if($null -ne $selection.selection_rectangle){$result|Add-Member -NotePropertyName selection_rectangle -NotePropertyValue @($selection.selection_rectangle)};if($null -ne $selection.selection_points){$result|Add-Member -NotePropertyName selection_points -NotePropertyValue @($selection.selection_points)};if($null -ne $selection.selected_ids){$result|Add-Member -NotePropertyName selected_ids -NotePropertyValue @($selection.selected_ids)}}
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Native object move saved project before caller save.'}
 WritePrivateJson ($EvidencePrefix+'.apply.json') $result
 return $result
}
function Assert-WeinviewNativeObjectMoveReopened($Session,$Applied,[string]$EvidencePrefix) {
 $null=Open-WeinviewObjectCopyWindow $Session ([int]$Applied.window_number)
 $actual=Get-WeinviewWindowObjectInventory $Session
 $comparison=Assert-WeinviewNativeMultiCopyFinalInventory $Applied.after_inventory $actual
 $result=[pscustomobject]@{persisted_verified=[bool]$comparison.persisted_verified;after_count=@($actual.rows).Count;properties_verified=$false}
 WritePrivateJson ($EvidencePrefix+'.readback.json') $result
 return $result
}
function Prepare-WeinviewObjectCopyDonorPayload($Session,$Contract,$Arguments,[string]$ProjectSha256,[string]$EvidencePrefix) {
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Screen object copy donor project changed before operation.'}
 $window=[int]$Contract.source_window_number
 $document=Open-WeinviewObjectCopyWindow $Session $window
 $before=Get-WeinviewWindowObjectInventory $Session
 if($before.read_route -cne 'native_host'){throw 'Native donor inventory required before screen object copy.'}
 $desired=@(Get-WeinviewObjectCopyDesiredIds $before $Contract)
 $allIds=@($before.rows|ForEach-Object {[string]$_.object_id})
 $rules=@();if($null -ne $Contract.address_replacements){$rules=@($Contract.address_replacements)}
 $signatures=[ordered]@{}
 foreach($item in $rules){
  foreach($target in @($false,$true)){
   $key=Get-WeinviewNativeAddressCountKey $item.arguments $item.contract $target
   if(!$signatures.Contains($key)){$signatures[$key]=[pscustomobject]@{key=$key;arguments=$item.arguments;contract=$item.contract;target=$target;before_ids=@();donor_source_ids=@();before_references=@();donor_source_references=@()}}
  }
 }
 if($signatures.Count -and !$Contract.external_donor){
  $canvas=Select-WeinviewAddressSearchCanvas $Session $rules[0].contract
  $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
  $dialog=$entry.dialog
  try{
   foreach($snapshot in @($signatures.Values)){
    $found=Find-WeinviewNativeRawAddress $Session $dialog $snapshot.arguments $snapshot.contract ([bool]$snapshot.target)
    $snapshot.before_ids=@(Get-WeinviewObjectCopyMatchIds $found ([string[]]$allIds))
    if($snapshot.contract.range_enabled){$snapshot.before_references=@(Get-WeinviewObjectCopyRangeReferences $found ([string[]]$snapshot.before_ids) $snapshot)}
   }
  }finally{if($dialog){[PLC Engineering Suite.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)}}
 }
 $results=@()
 foreach($item in $rules){
  $activeDialog=$null;$replaceTriggered=$false
  try{$results+=,(Invoke-WeinviewNativeAddressReplaceOnce $Session $item.arguments $item.contract ([ref]$activeDialog) ([ref]$replaceTriggered))}
  finally{if($activeDialog){[PLC Engineering Suite.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$activeDialog.Hwnd,[int]$Session.process.Id)}}
 }
 if($signatures.Count){
  $canvas=Select-WeinviewAddressSearchCanvas $Session $rules[0].contract
  $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
  $dialog=$entry.dialog
  $sourceSet=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
  foreach($id in $desired){$null=$sourceSet.Add($id)}
  try{
   foreach($snapshot in @($signatures.Values)){
    $found=Find-WeinviewNativeRawAddress $Session $dialog $snapshot.arguments $snapshot.contract ([bool]$snapshot.target)
    $ids=@(Get-WeinviewObjectCopyMatchIds $found ([string[]]$allIds))
    $snapshot.donor_source_ids=@($ids|Where-Object {$sourceSet.Contains($_)})
    if($snapshot.contract.range_enabled){$snapshot.donor_source_references=@(Get-WeinviewObjectCopyRangeReferences $found ([string[]]$ids) $snapshot|Where-Object {$sourceSet.Contains([string]$_.object_id)})}
   }
  }finally{if($dialog){[PLC Engineering Suite.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)}}
 }
 $selection=$null
 if($desired.Count -eq $allIds.Count){$null=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::SelectAll($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path);$selection=[pscustomobject]@{selection_route='native_select_all';selection_rectangle=$null}}
 else{$selection=Invoke-WeinviewObjectCopySpatialSelection $Session $document $before ([string[]]$desired) $EvidencePrefix}
 Assert-WeinviewObjectCopySelectionReady $Session $window ([string[]]$desired) $selection
 $receipt=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::Copy($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path)
 $payload=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::CapturePayload($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path,$receipt)
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Donor object copy changed saved project.'}
 $donor=[pscustomobject]@{payload=$payload;source_object_ids=@($desired);before_inventory=$before;address_snapshots=@($signatures.Values);address_replacements=@($results);selection=$selection}
 if($null -ne $selection.selection_points){$donor|Add-Member -NotePropertyName selection_points -NotePropertyValue @($selection.selection_points)}
 return $donor
}
function Set-WeinviewObjectCopyTargetAddressBaseline($Session,$Contract,$Donor,$TargetInventory) {
 if(!$Contract.external_donor -or !@($Donor.address_snapshots).Count){return}
 $targetCanvasContract=[pscustomobject]@{scope='window';window_number=[int]$Contract.window_number}
 $allIds=@($TargetInventory.rows|ForEach-Object {[string]$_.object_id})
 $canvas=Select-WeinviewAddressSearchCanvas $Session $targetCanvasContract
 $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
 $dialog=$entry.dialog
 try{
  foreach($snapshot in @($Donor.address_snapshots)){
   $targetFields=[ordered]@{};foreach($property in $snapshot.contract.PSObject.Properties){$targetFields[$property.Name]=$property.Value}
   $targetFields.scope='window';$targetFields.window_number=[int]$Contract.window_number;$targetFields.expected_match_count=$null
   $targetContract=[pscustomobject]$targetFields
   $snapshot|Add-Member -NotePropertyName target_contract -NotePropertyValue $targetContract -Force
   $found=Find-WeinviewNativeRawAddress $Session $dialog $snapshot.arguments $targetContract ([bool]$snapshot.target)
   $snapshot.before_ids=@(Get-WeinviewObjectCopyMatchIds $found ([string[]]$allIds))
   if($snapshot.contract.range_enabled){$snapshot.before_references=@(Get-WeinviewObjectCopyRangeReferences $found ([string[]]$snapshot.before_ids) $snapshot)}
  }
 }finally{if($dialog){[PLC Engineering Suite.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)}}
}
function Assert-WeinviewObjectCopyAddressReferences($Session,$Applied,[string]$EvidencePrefix) {
 $null=Open-WeinviewObjectCopyWindow $Session ([int]$Applied.window_number)
 $current=Get-WeinviewWindowObjectInventory $Session
 $allIds=@($current.rows|ForEach-Object {[string]$_.object_id})
 $beforeSet=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($row in @($Applied.before_inventory.rows)){$null=$beforeSet.Add([string]$row.object_id)}
 $addedMap=@{};foreach($item in @($Applied.added_objects)){$addedMap[[string]$item.source_object_id]=[string]$item.object_id}
 $addedSet=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($id in @($addedMap.Values)){$null=$addedSet.Add([string]$id)}
 $queryContract=if($Applied.address_snapshots[0].target_contract){$Applied.address_snapshots[0].target_contract}else{$Applied.address_snapshots[0].contract}
 $canvas=Select-WeinviewAddressSearchCanvas $Session $queryContract
 $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
 $dialog=$entry.dialog
 $rangeVerified=$false
 try{
  foreach($snapshot in @($Applied.address_snapshots)){
   $queryContract=if($snapshot.target_contract){$snapshot.target_contract}else{$snapshot.contract}
   $found=Find-WeinviewNativeRawAddress $Session $dialog $snapshot.arguments $queryContract ([bool]$snapshot.target)
   $ids=@(Get-WeinviewObjectCopyMatchIds $found ([string[]]$allIds))
   Assert-WeinviewObjectCopyIdMultiset ([string[]]@($ids|Where-Object {$beforeSet.Contains($_)})) ([string[]]$snapshot.before_ids) ([string]$snapshot.key+' originals')
   $expected=@($snapshot.donor_source_ids|ForEach-Object {if(!$addedMap.ContainsKey([string]$_)){throw ('Copied address source ID has no added object: '+$_)};$addedMap[[string]$_]})
   Assert-WeinviewObjectCopyIdMultiset ([string[]]@($ids|Where-Object {$addedSet.Contains($_)})) ([string[]]$expected) ([string]$snapshot.key+' copies')
   if($snapshot.contract.range_enabled){
    $rangeVerified=$true
    $references=@(Get-WeinviewObjectCopyRangeReferences $found ([string[]]$ids) $snapshot)
    Assert-WeinviewObjectCopyRangeReferenceMultiset @($references|Where-Object {$beforeSet.Contains([string]$_.object_id)}) @($snapshot.before_references) ([string]$snapshot.key+' original ID/address')
    $expectedReferences=@($snapshot.donor_source_references|ForEach-Object {if(!$addedMap.ContainsKey([string]$_.object_id)){throw ('Copied range source ID has no added object: '+$_.object_id)};[pscustomobject]@{object_id=$addedMap[[string]$_.object_id];address=[string]$_.address}})
    Assert-WeinviewObjectCopyRangeReferenceMultiset @($references|Where-Object {$addedSet.Contains([string]$_.object_id)}) $expectedReferences ([string]$snapshot.key+' copied ID/address')
   }
  }
 }finally{if($dialog){[PLC Engineering Suite.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)}}
 $result=[pscustomobject]@{copied_address_references_verified=$true;copied_address_reference_scope='native Find raw-address object-ID multisets; all other properties unverified'}
 if($rangeVerified){$result|Add-Member -NotePropertyName copied_range_address_references_verified -NotePropertyValue $true}
 return $result
}
function Invoke-WeinviewNativeObjectCopy($Session,$Contract,[string]$ProjectSha256,[string]$EvidencePrefix,$Donor=$null) {
 $window=[int]$Contract.window_number
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Screen object copy project changed before operation.'}
 $document=Open-WeinviewObjectCopyWindow $Session $window
 $before=Get-WeinviewWindowObjectInventory $Session
 if($before.read_route -cne 'native_host'){throw 'Native host inventory required before screen object copy.'}
 $allIds=@($before.rows|ForEach-Object {[string]$_.object_id})
 $requestedIds=$Contract.object_ids
 $desired=@()
 if($null -ne $Donor -and $Contract.external_donor){$desired=@($Donor.source_object_ids)}else{$desired=@(Get-WeinviewObjectCopyDesiredIds $before $Contract)}
 $selection=$null
 if($null -ne $Donor){
  if($Contract.external_donor){Set-WeinviewObjectCopyTargetAddressBaseline $Session $Contract $Donor $before}
  else{Assert-WeinviewNativeMultiCopyFinalInventory $Donor.before_inventory $before | Out-Null;if((@($Donor.source_object_ids) -join [char]31) -cne (@($desired) -join [char]31)){throw 'Donor source object IDs differ from reopened original.'}}
  $receipt=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::PublishPayload($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path,$Donor.payload)
  $selection=$Donor.selection
 }else{
  $selection=Get-WeinviewObjectCopyCurrentSelection $Session $window ([string[]]$desired)
  if($null -eq $selection){if($desired.Count -eq $allIds.Count){$null=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::SelectAll($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path);$selection=[pscustomobject]@{selection_route='native_select_all';selection_rectangle=$null}}else{$selection=Invoke-WeinviewObjectCopySpatialSelection $Session $document $before ([string[]]$desired) $EvidencePrefix}}
  Assert-WeinviewObjectCopySelectionReady $Session $window ([string[]]$desired) $selection
  $receipt=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::Copy($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path)
 }
 $null=[PLC Engineering Suite.Weinview.NativeObjectClipboardControls]::Paste($Session.native,[long]$Session.main.Hwnd,[long]$document.canvas_hwnd,[string]$document.document_title,[int]$Session.process.Id,[string]$Session.exe_path,$receipt)
 $after=WaitFor { $probe=Get-WeinviewWindowObjectInventory $Session;if(@($probe.rows).Count -ge (@($before.rows).Count+$desired.Count)){return $probe} } 8
 $sourceInventory=if($null -ne $Donor -and $Contract.external_donor){$Donor.before_inventory}else{$null}
 $inventory=Assert-WeinviewObjectCopyInventory $before $after ([string[]]$desired) $sourceInventory
 $groupShift=$null
 if($null -ne $Contract.translation){
  $mapped=Get-WeinviewObjectCopySelectedScene $Session $window
  Assert-WeinviewObjectCopySelectedAdditions $mapped $inventory
  $groupShift=Invoke-WeinviewObjectCopyGroupShift $Session $document $mapped $inventory ([int[]]$Contract.translation) $EvidencePrefix
  if($groupShift.performed){$after=Get-WeinviewWindowObjectInventory $Session;$inventory=Assert-WeinviewObjectCopyInventory $before $after ([string[]]$desired) $sourceInventory}
  if((@($inventory.translation) -join ',') -cne (@($Contract.translation) -join ',')){throw ('Native copied group final translation differs from request: actual='+(@($inventory.translation) -join ',')+' requested='+(@($Contract.translation) -join ','))}
 }
 if((Hash $Session.project_path) -ine $ProjectSha256){throw 'Native Copy/Paste saved project before caller save.'}
 $result=[pscustomobject]@{scope='native_screen_copy_objects';window_number=$window;source_object_ids=@($inventory.source_object_ids);before_count=$inventory.before_count;after_count=$inventory.after_count;translation=@($inventory.translation);added_objects=@($inventory.added_objects);copied_properties_verified=$false;inventory_route='native_host';clipboard_bytes=[long]$receipt.bytes;project_saved=$false;after_inventory=$after}
 if($null -ne $Donor){$result|Add-Member -NotePropertyName before_inventory -NotePropertyValue $before;$result|Add-Member -NotePropertyName address_snapshots -NotePropertyValue @($Donor.address_snapshots);$result|Add-Member -NotePropertyName address_replacements -NotePropertyValue @($Donor.address_replacements)}
 if($null -ne $Contract.translation){$result|Add-Member -NotePropertyName requested_translation -NotePropertyValue @($Contract.translation);$result|Add-Member -NotePropertyName group_shift -NotePropertyValue $groupShift}
 if($null -ne $requestedIds){
  $result|Add-Member -NotePropertyName requested_object_ids -NotePropertyValue @($requestedIds)
  $result|Add-Member -NotePropertyName selection_route -NotePropertyValue $selection.selection_route
  if($null -ne $selection.selection_rectangle){$result|Add-Member -NotePropertyName selection_rectangle -NotePropertyValue @($selection.selection_rectangle)}
  if($null -ne $selection.selection_points){$result|Add-Member -NotePropertyName selection_points -NotePropertyValue @($selection.selection_points)}
  if($null -ne $selection.selected_ids){$result|Add-Member -NotePropertyName selected_ids -NotePropertyValue @($selection.selected_ids)}
  $result|Add-Member -NotePropertyName selection_evidence -NotePropertyValue $selection
 }
 WritePrivateJson ($EvidencePrefix+'.apply.json') $result
 return $result
}
function Assert-WeinviewNativeObjectCopyReopened($Session,$Applied,[string]$EvidencePrefix) {
 $Session.window_number=[int]$Applied.window_number
 $actual=Get-WeinviewWindowObjectInventory $Session
 if($actual.read_route -cne 'native_host' -or @($actual.rows).Count -ne [int]$Applied.after_count){throw 'Persisted native object copy inventory count differs.'}
 $null=Assert-WeinviewNativeMultiCopyFinalInventory $Applied.after_inventory $actual
 $byId=@{};foreach($row in @($actual.rows)){$id=[string]$row.object_id;if($byId.ContainsKey($id)){throw 'Persisted native object ID duplicated.'};$byId[$id]=$row}
 foreach($item in @($Applied.added_objects)){
  $id=[string]$item.object_id;if(!$byId.ContainsKey($id)){throw ('Persisted copied object missing: '+$id)}
  $row=$byId[$id]
  if($row.native_kind -cne $item.native_kind -or (@(Convert-WeinviewMultiCopyRectangle $row) -join ',') -cne (@($item.rectangle) -join ',')){throw ('Persisted copied object kind or rectangle differs: '+$id)}
 }
 $result=[pscustomobject]@{persisted_verified=$true;after_count=@($actual.rows).Count;added_objects=@($Applied.added_objects);copied_properties_verified=$false}
 WritePrivateJson ($EvidencePrefix+'.readback.json') $result
 return $result
}
