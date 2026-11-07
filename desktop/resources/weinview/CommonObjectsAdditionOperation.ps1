# CN421/TK800x480 ordinary Text/Rectangle addition. Caller owns clone/save/normal close/reopen.
# Text bounds are not known; no complete collision claim.
. (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1')
function Assert-WeinviewCommonObjectsInputs($Objects,[int]$BeforeObjectCount=0,[int]$CanvasWidth=65535,[int]$CanvasHeight=65535) {
 $items=@($Objects);if($items.Count -lt 1 -or $items.Count -gt 64){throw 'Common objects require new1..64.'}
 $result=@()
 foreach($o in $items){
  if($null -eq $o){throw 'Common Text item required.'}
  $keys=if($o -is [Collections.IDictionary]){@($o.Keys)}else{@($o.PSObject.Properties.Name)}
  if($o.kind -ceq 'rectangle'){
    if(@($keys|Where-Object {$_ -cnotin @('kind','rect','filled','corner','fill_rgb','border_rgb')}).Count -or @(@('kind','rect')|Where-Object {$_ -cnotin $keys}).Count){throw 'Rectangle requires kind/rect and optional filled/corner/fill_rgb/border_rgb.'}
   $rect=@($o.rect);if($rect.Count -ne 4){throw 'Rectangle requires four final geometry integers.'};foreach($v in $rect){if($v -isnot [int] -and $v -isnot [long]){throw 'Strict integer rectangle required.'}}
    if($rect[2] -lt 3 -or $rect[3] -lt 3){throw '矩形宽高最少3px，细线请改用3px矩形或已有SVG素材'}
    if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[0] -ge $CanvasWidth -or $rect[1] -ge $CanvasHeight -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[2] -gt $CanvasWidth -or $rect[3] -gt $CanvasHeight -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Final rectangle must fit the actual native selected window.'}
    $filled=$false;if($keys -ccontains 'filled'){if($o.filled -isnot [bool]){throw 'Rectangle filled must be Boolean.'};$filled=[bool]$o.filled}
    $corner='0';if($keys -ccontains 'corner'){if($o.corner -isnot [string] -or [string]::IsNullOrWhiteSpace($o.corner) -or $o.corner.Length -gt 1024 -or $o.corner -match '[\x00-\x1f\x7f-\x9f]'){throw 'Rectangle corner requires an exact native choice.'};$corner=[string]$o.corner}
    if($keys -ccontains 'fill_rgb' -and !$filled){throw 'Rectangle fill_rgb requires filled=true.'}
    $item=[ordered]@{kind='rectangle';rect=@($rect|ForEach-Object {[int]$_});filled=$filled;corner=$corner}
    foreach($field in @('fill_rgb','border_rgb')){if($keys -ccontains $field){$item[$field]=[int[]]@(Assert-WeinviewAppearanceRgb $o.$field)}}
    $result+=[pscustomobject]$item;continue
  }
  if(@($keys|Where-Object {$_ -cnotin @('kind','text','position','font_size','font','alignment','text_rgb')}).Count -or @(@('kind','text','position')|Where-Object {$_ -cnotin $keys}).Count -or $o.kind -cne 'text'){throw 'Only Text kind/text/position and optional font_size/font/alignment/text_rgb accepted.'}
  if($o.text -isnot [string] -or $o.text.Length -lt 1 -or $o.text.Length -gt 8192){throw 'Raw Text must contain1..8192UTF16 code units before newline normalization.'}
  $text=$o.text.Replace("`r`n","`r").Replace("`n","`r")
  if(!$text.Trim().Length){throw 'NativeCR Text must not consist entirely of whitespace.'}
  if($text.Length -lt 1 -or $text.Length -gt 4096){throw 'NativeCR Text must contain1..4096UTF16 code units.'}
  if($text -match '[\x00-\x0c\x0e-\x1f\x7f-\x9f]'){throw 'Text permits native CR line breaks and no other control characters.'}
  $null=(New-Object Text.UTF8Encoding($false,$true)).GetBytes($text)
  $xy=@($o.position);if($xy.Count -ne 2){throw 'Text position is x/y only.'};foreach($v in $xy){if($v -isnot [int] -and $v -isnot [long]){throw 'Strict integer Text position required.'}}
  if($xy[0] -lt 0 -or $xy[0] -ge $CanvasWidth -or $xy[1] -lt 0 -or $xy[1] -ge $CanvasHeight){throw 'Text anchor must fit the actual native selected window.'}
  $size=24;if($keys -ccontains 'font_size'){if(($o.font_size -isnot [int] -and $o.font_size -isnot [long]) -or $o.font_size -lt 5 -or $o.font_size -gt 255){throw 'Integer Text font_size5..255 required.'};$size=[int]$o.font_size}
  $font='Microsoft YaHei';if($keys -ccontains 'font'){if($o.font -isnot [string] -or !$o.font.Trim().Length -or $o.font.Length -gt 1024 -or $o.font -match '[\x00-\x1f\x7f-\x9f]'){throw 'Bound nonempty control-free font required.'};$font=$o.font;$null=(New-Object Text.UTF8Encoding($false,$true)).GetBytes($font)}
  $align='置中对齐';if($keys -ccontains 'alignment'){if($o.alignment -cnotin @('左对齐','置中对齐','右对齐')){throw 'Actual Text alignment label required.'};$align=$o.alignment}
  $item=[ordered]@{kind='text';text=$text;position=@([int]$xy[0],[int]$xy[1]);font_size=$size;font=$font;alignment=$align}
  if($keys -ccontains 'text_rgb'){$item['text_rgb']=[int[]]@(Assert-WeinviewAppearanceRgb $o.text_rgb)}
  $result+=[pscustomobject]$item
 }
 return $result
}
function Read-WeinviewCommonObjectsSnapshot($Session,[string]$SourceSha256,[string]$EvidencePrefix,[string]$BridgeRoot){
 return Invoke-WeinviewAlarmDisplayRead -Session $Session -SourceSha256 $SourceSha256 -EvidencePrefix $EvidencePrefix -BridgeRoot $BridgeRoot
}
function Assert-WeinviewCommonObjectsPreservation($Before,$After,[int]$AddedCount=0){
 Assert-WeinviewAlarmDisplayPreservation $Before $After $AddedCount
 # Directory labels/order are separate evidence even for supported canonical objects.
 $oldRows=@($Before.screen_snapshot.directory.rows);$ids=@($oldRows.object_id)
 $retained=@($After.screen_snapshot.directory.rows|Where-Object {$_.object_id -cin $ids})
 if($retained.Count -ne $oldRows.Count){throw 'Old common-object directory identities missing.'}
 for($i=0;$i -lt $oldRows.Count;$i++){if($retained[$i].object_id -cne $oldRows[$i].object_id -or $retained[$i].kind -cne $oldRows[$i].kind -or $retained[$i].raw_label -cne $oldRows[$i].raw_label){throw 'Old common-object directory ID/kind/label/order changed.'}}
}
function Assert-WeinviewCommonObjectsPersisted($Applied,$Reopened){
 Assert-WeinviewCommonObjectsPreservation $Applied.before_snapshot $Reopened @($Applied.objects).Count
 foreach($created in @($Applied.objects)){
  $matches=@($Reopened.screen_snapshot.objects|Where-Object {$_.object_id -ceq $created.object_id})
  if($matches.Count -ne 1 -or $matches[0].kind -cne $created.kind -or $matches[0].object_sha256 -cne $created.object_sha256 -or $matches[0].canonical_json -cne $created.canonical_json){throw 'New common finite canonical fields differ after reopen.'}
 }
}
function Invoke-WeinviewCommonObjectsAddition($Session,[ValidateSet('Apply')][string]$Mode,$Objects,[string]$SourceSha256,$BeforeSnapshot,[Parameter(Mandatory=$true)][string]$BridgeRoot,[switch]$DeferReadback){
 $ErrorActionPreference='Stop'
 foreach($file in @('PlcConfigurationCandidate.ps1','ScreenWorkflow.ps1','NumericRibbonAction.ps1','ObjectRibbonAction.ps1','CommonObjectRibbonAction.ps1','AlarmDisplayOperation.ps1')){. (Join-Path $BridgeRoot $file)}
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh common-object evidence required.'};$value|ConvertTo-Json -Depth 24|Set-Content -LiteralPath $path -Encoding UTF8}
 Assert-WeinviewPlcCandidateSession $Session
 if($SourceSha256 -notmatch '^[a-fA-F0-9]{64}$' -or (Hash $Session.output_path) -ine $SourceSha256){throw 'Exact fresh common-object source SHA required.'}
 if(!(Get-Command Invoke-WeinviewTextRibbon -ErrorAction SilentlyContinue)){throw 'Reviewed Text ribbon entry is not yet available; no private coordinate fallback.'}
 $prefix=$Session.output_path+'.common-'+[guid]::NewGuid().ToString('N')
 $beforeScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($BeforeSnapshot){Assert-WeinviewAdditionSnapshots $BeforeSnapshot.screen_snapshot $beforeScreen 0}
 $before=[pscustomobject]@{screen_snapshot=$beforeScreen;alarm_displays=@();source_sha256=$SourceSha256}
 $items=@(Assert-WeinviewCommonObjectsInputs $Objects @($beforeScreen.objects).Count ([int]$Session.window_width) ([int]$Session.window_height))
 $n=$Session.native;$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $sem=[PLC Engineering Suite.Weinview.NativeSemanticControls]::new($n)
 $scene=if($Session.window_number){[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)}else{[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)}
 function WaitTextNewDialog{
  $end=[DateTime]::UtcNow.AddSeconds(6)
  do{$dialogs=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '新增 文字/批注'}).Count){throw 'Unexpected modal after Text entry; preserve it.'};if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){return $dialogs[0]};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end)
  throw 'Actual new Text dialog readiness timed out; no entry replay.'
 }
 function TextControl([long]$h,[int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($h,$id,$class)}
 function SelectTextCombo([long]$h,[int]$id,[string]$label){$control=TextControl $h $id 'ComboBox';if($p.ComboSelected($control.Hwnd) -cne $label){$p.SelectComboExact($control.Hwnd,$label)};if($p.ComboSelected($control.Hwnd) -cne $label){throw 'Actual Text combo readback differs.'}}
 function CaptureTextPlacement{return $scene.CapturePlacement()}
 $records=@();$creation=@();$appearanceColors=@();$index=0;$initialRestore=$null;$directoryAfter=$null
 try{
  foreach($o in $items){
   if(Get-Command Write-WeinviewProgress -ErrorAction SilentlyContinue){
    $objectKind=if($o.kind -ceq 'text'){'文字'}else{'矩形'}
    Write-WeinviewProgress 'screen_object_add' ('正在创建画面'+$objectKind+' '+($index+1)+'/'+$items.Count)
   }
   $requestedRgb=[ordered]@{};foreach($field in @('text_rgb','fill_rgb','border_rgb')){if(@($o.PSObject.Properties.Name) -ccontains $field){$requestedRgb[$field]=[int[]]@($o.$field)}}
   $firstAddition=($index -eq 0);$directoryBefore=if($firstAddition){$beforeScreen.directory}else{$directoryAfter};if(!$firstAddition -and !$initialRestore){$initialRestore=$directoryBefore.restore_context};$oldIds=@($directoryBefore.rows|ForEach-Object {$_.object_id})
   $journalPath=$prefix+'.item-'+$index+'.creation.json'
   $journal=[ordered]@{item_index=$index;requested=$o;phase='entry';entry=$null;dialog=$null;focus_enter=$null;focus_leave=$null;new_directory=$null;object_id=$null;native_fields_verified=$false;saved=$false;persisted_verified=$false}
   try{
    if($o.kind -ceq 'rectangle'){
     $journal.entry=Invoke-WeinviewRectangleRibbon $Session $sem;$palette=$journal.entry.palette;$journal.dialog=$palette;$journal.phase='owned_modeless_rectangle_drawing'
     $windowNumber=if($Session.window_number){[int]$Session.window_number}else{10};$windowName=if($Session.window_name){[string]$Session.window_name}else{'WINDOW_010'}
     $drawingScene=[PLC Engineering Suite.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,$windowNumber,$windowName,[long]$palette.Hwnd,[int]$Session.window_width,[int]$Session.window_height)
     $ordinaryScene=$scene;try{$scene=$drawingScene;$placement=CaptureTextPlacement}finally{$scene=$ordinaryScene}
     $drawing=$drawingScene.DrawTwoPointRectangle($placement,$o.rect[0],$o.rect[1],$o.rect[2],$o.rect[3]);$journal['drawing']=$drawing
     Start-Sleep -Milliseconds 250;$drawingScene.EndPlacement();Start-Sleep -Milliseconds 100;$drawingScene.CloseObservedDrawingPanel();$journal.phase='read_new_rectangle_identity'
     $directoryAfter=Get-WeinviewWindowDirectory -Session $Session;$journal.new_directory=$directoryAfter;$fresh=@($directoryAfter.rows|Where-Object {$_.object_id -cnotin $oldIds})
     if($fresh.Count -ne 1 -or $fresh[0].kind -cne 'Drawing' -or $fresh[0].object_id -cnotmatch '^DW_[0-9]{1,5}$' -or @($directoryAfter.rows).Count -ne $oldIds.Count+1){throw 'Exactly one actual newly created Drawing ID required.'}
     $journal.object_id=$fresh[0].object_id;$property=Open-WeinviewDirectoryObject $Session $directoryAfter $fresh[0]
     if($property.Title -cne '矩形元件属性'){throw 'Created Drawing is not the observed Rectangle type; preserve property.'}
      $shapeTab=$n.FindUniqueControlWithoutLabel($property.Hwnd,12320,'SysTabControl32');$p.SelectTabExact($shapeTab.Hwnd,' 形状')
      $fill=$n.FindUniqueControl($property.Hwnd,1217,'Button','填充');$wantedFill=if($o.filled){1}else{0}
      if($n.GetCheckboxState($fill.Hwnd) -ne $wantedFill){$n.ClickButton($property.Hwnd,1217,'填充')}
      $corner=$n.FindUniqueControlWithoutLabel($property.Hwnd,2067,'ComboBox');$p.SelectComboExact($corner.Hwnd,[string]$o.corner)
      if($requestedRgb.Count){$colorAfter=Set-WeinviewRequestedAppearanceColors $Session.identity_path $property.Hwnd 'rectangle' ([pscustomobject]$requestedRgb) -PassThru}
     $null=& (Join-Path $BridgeRoot 'NativeRectangleCandidate.ps1') -Action Set -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -DialogHwnd $property.Hwnd -X $o.rect[0] -Y $o.rect[1] -Width $o.rect[2] -Height $o.rect[3] -CanvasWidth $Session.window_width -CanvasHeight $Session.window_height
     $finalReadPath=$prefix+'.item-'+$index+'.rectangle-final-read.json';$null=& (Join-Path $BridgeRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $SourceSha256 -DialogHwnd $property.Hwnd -OutputPath $finalReadPath
     $read=Get-Content -LiteralPath $finalReadPath -Raw -Encoding UTF8|ConvertFrom-Json
      if($read.status -cne 'success' -or $read.actual.kind -cne 'rectangle' -or (@($read.actual.rectangle) -join ',') -cne ($o.rect -join ',') -or [bool]$read.actual.filled -ne [bool]$o.filled -or $read.actual.corner -cne $o.corner){throw 'Actual final Rectangle contour/style differs from request.'}
     if($requestedRgb.Count){foreach($field in $requestedRgb.Keys){if((@($colorAfter.$field) -join ',') -cne (@($requestedRgb[$field]) -join ',')){throw ('Created Rectangle RGB differs: '+$field)}};$appearanceColors+=,[pscustomobject]@{object_id=$fresh[0].object_id;requested=[pscustomobject]$requestedRgb;after=$colorAfter;native_rgb_verified=$true}}
     Close-WeinviewScreenDialog $Session $property $true
     $records+=New-WeinviewObjectRecord $fresh[0].object_id $read.actual;$journal.phase=if($DeferReadback){'configured_waiting_batch_readback'}else{'configured_waiting_full_snapshot'}
     $creation+=[pscustomobject]@{object_id=$fresh[0].object_id;requested=$o;entry=$journal.entry;placement=$placement;drawing=$drawing;native_property_read_path=$finalReadPath;native_creation_journal=$journalPath}
    }else{
    $journal.entry=Invoke-WeinviewTextRibbon $Session $sem;$dialog=WaitTextNewDialog;$journal.dialog=$dialog;$h=$dialog.Hwnd;$journal.phase='configure_text'
    $tab=TextControl $h 12320 'SysTabControl32';if((@($p.TabNames($tab.Hwnd)) -join '|') -cne '文字/批注|安全'){throw 'Actual new Text page profile changed.'};$p.SelectTabExact($tab.Hwnd,'文字/批注')
    SelectTextCombo $h 1547 $o.font;SelectTextCombo $h 1439 ([string]$o.font_size);SelectTextCombo $h 1051 $o.alignment;SelectTextCombo $h 1782 '无'
    $comment=$n.FindUniqueControl($h,1274,'Button','仅作为批注使用 (不会显示于 HMI)');$state=$n.GetCheckboxState($comment.Hwnd);if($state -notin @(0,1)){throw 'Actual Text comment checkbox state invalid.'};if($state -eq 1){$n.ClickButton($h,1274,'仅作为批注使用 (不会显示于 HMI)')};if($n.GetCheckboxState($comment.Hwnd) -ne 0){throw 'Text must display on HMI; commentfalse not verified.'}
    $edit=TextControl $h 1283 'RichEdit20W';$blur=$n.FindUniqueControl($h,1780,'Button','斜体')
    $journal.focus_enter=$p.FocusTextEditor($h,$edit.Hwnd,$blur.Hwnd,'新增 文字/批注',$true)
    $journal.phase='set_native_cr_text';$p.SetRichTextExact($edit.Hwnd,$o.text);if($p.RichText($edit.Hwnd) -cne $o.text){throw 'Actual new Text nativeCR readback differs.'}
    $journal.focus_leave=$p.FocusTextEditor($h,$edit.Hwnd,$blur.Hwnd,'新增 文字/批注',$false);$journal.phase='confirm_text'
    Close-WeinviewScreenDialog $Session $dialog $true
    $journal.phase='place_text';$placement=CaptureTextPlacement;$scene.PlaceNewObject($placement,$o.position[0],$o.position[1]);$scene.EndPlacement()
    $directoryAfter=Get-WeinviewWindowDirectory -Session $Session;$journal.new_directory=$directoryAfter;$fresh=@($directoryAfter.rows|Where-Object {$_.object_id -cnotin $oldIds})
    if($fresh.Count -ne 1 -or $fresh[0].kind -cne 'Text' -or $fresh[0].object_id -cnotmatch '^TX_[0-9]{1,5}$' -or @($directoryAfter.rows).Count -ne $oldIds.Count+1){throw 'Exactly one actual newly created Text native directory ID required.'}
    $journal.object_id=$fresh[0].object_id;$journal.phase='set_actual_text_position'
    $property=Open-WeinviewDirectoryObject $Session $directoryAfter $fresh[0]
    if($requestedRgb.Count){$colorAfter=Set-WeinviewRequestedAppearanceColors $Session.identity_path $property.Hwnd 'text' ([pscustomobject]$requestedRgb) -PassThru;if((@($colorAfter.text_rgb) -join ',') -cne (@($requestedRgb['text_rgb']) -join ',')){throw 'Created Text RGB differs.'};$appearanceColors+=,[pscustomobject]@{object_id=$fresh[0].object_id;requested=[pscustomobject]$requestedRgb;after=$colorAfter;native_rgb_verified=$true}}
    $positionTab=TextControl $property.Hwnd 12320 'SysTabControl32';$p.SelectTabExact($positionTab.Hwnd,'轮廓')
    for($i=0;$i -lt 2;$i++){$position=TextControl $property.Hwnd (@(1050,1052)[$i]) 'Edit';$n.SetControlText($position.Hwnd,[string]$o.position[$i]);if($n.GetControlText($position.Hwnd,64) -cne [string]$o.position[$i]){throw 'Actual Text position readback differs.'}}
    Close-WeinviewScreenDialog $Session $property $true
    $expected=[pscustomobject]@{kind='text';text=$o.text;text_source='literal';label_name=$null;font_size=$o.font_size;font=$o.font;alignment=$o.alignment;blink='无';comment=$false;x=$o.position[0];y=$o.position[1]}
    $records+=New-WeinviewObjectRecord $fresh[0].object_id $expected;$journal.phase=if($DeferReadback){'configured_waiting_batch_readback'}else{'configured_waiting_full_snapshot'};$creation+=[pscustomobject]@{object_id=$fresh[0].object_id;requested=$o;entry=$journal.entry;focus_enter=$journal.focus_enter;focus_leave=$journal.focus_leave;placement=$placement;native_creation_journal=$journalPath}
    }
   }catch{$journal.error=$_.Exception.Message;throw}finally{WritePrivateJson $journalPath $journal}
   $index++
  }
  if($DeferReadback){
   # The batch completion mode decides whether to reopen for final property reads.
   # Keep the creation reads without reopening every property at this step.
   # Native-host and UI inventories use different labels; retain the source route.
   $afterDirectory=if($beforeScreen.directory.read_route -ceq 'native_host'){Get-WeinviewWindowObjectInventory $Session}else{$directoryAfter}
   $createdById=@{}
   foreach($record in $records){if(@($afterDirectory.rows|Where-Object {$_.object_id -ceq $record.object_id}).Count -ne 1){throw 'Created common object missing from batch directory.'};$createdById[[string]$record.object_id]=$record}
   $afterObjects=@(foreach($row in @($afterDirectory.rows)){
    if($createdById.ContainsKey([string]$row.object_id)){$createdById[[string]$row.object_id]}
    else{[pscustomobject]@{object_id=[string]$row.object_id;kind='directory_only';supported=$false;editable_fields=@();raw_label=[string]$row.raw_label;unsupported_reason='properties-not-read-during-addition'}}
   })
   $afterScreen=[pscustomobject]@{screen=[int]$afterDirectory.window_number;window_name=$afterDirectory.window_name;canvas_width=[int]$Session.window_width;canvas_height=[int]$Session.window_height;window_activation_evidence=$Session.window_activation_evidence;objects=$afterObjects;directory=$afterDirectory;alarm_displays=@();source_sha256=$SourceSha256;project_saved=$false;source_unchanged=$true;directory_only_scope=$true;full_properties_verified=$false;readback_deferred_to_batch=$true}
   WritePrivateJson ($prefix+'.after.snapshot.json') $afterScreen
  }else{
   $afterScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot ([string[]]@($records|ForEach-Object {$_.object_id}))
   $actualRecords=@(foreach($expected in $records){$actual=@($afterScreen.objects|Where-Object {$_.object_id -ceq $expected.object_id});if($actual.Count -ne 1 -or !$actual[0].supported -or $actual[0].object_sha256 -cne $expected.object_sha256 -or $actual[0].canonical_json -cne $expected.canonical_json){throw 'Added Text finite native fields differ after confirmation.'};$actual[0]})
   $records=$actualRecords
  }
  Assert-WeinviewAdditionSnapshots $beforeScreen $afterScreen $records.Count
  $after=[pscustomobject]@{screen_snapshot=$afterScreen;alarm_displays=@();source_sha256=$SourceSha256}
  if((Hash $Session.output_path) -ine $SourceSha256){throw 'Text addition unexpectedly saved project bytes.'}
  return [pscustomobject]@{operation='common_objects_addition';mode=$Mode;objects=$records;creation_evidence=$creation;appearance_color_evidence=$appearanceColors;before_snapshot=$before;after_snapshot=$after;untouched_objects_verified=$false;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';full_properties_verified=$false;readback_deferred_to_batch=[bool]$DeferReadback;bounding_boxes_verified=$false;collision_verified=$false;source_sha256=$SourceSha256;profile='weinview-cn421-tk800x480-native-window-v1';native_fields_verified=$true;persisted_verified=$false;saved=$false;reopened_verified=$false;native_evidence_prefix=$prefix}
 }finally{if($initialRestore -and !@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $initialRestore}}
}
