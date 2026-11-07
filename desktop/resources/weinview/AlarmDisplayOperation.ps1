. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1')
# Prepared PS5 CN421/TK800x480 adapter. Caller owns launch/fresh copy/save/close/reopen.
# Load AlarmDisplayDialogControls.cs with existing NativeControls, NativePropertyCandidate,
# NativeSemanticControls, ObjectRibbonControls, NativeScreenScene and normal object readers.
# Entry points: Invoke-WeinviewAlarmDisplayRead and Invoke-WeinviewAlarmDisplayAddition.
# Does not register AL in generic ObjectContracts or claim every Alarm Display property.

function Get-WeinviewAlarmDisplayProfileName($Session,[switch]$Acknowledgement) {
 $family=switch([IO.Path]::GetExtension([string]$Session.output_path).ToLowerInvariant()){'.emtp' {'tk800x480'};'.cmtp' {'cmt'};default {throw 'Exact protected native project format required for Alarm Display'}}
 $suffix=if($Acknowledgement){'ack-v1'}else{'v1'}
 return ('weinview-cn421-'+$family+'-native-alarm-display-'+$suffix)
}

function Assert-WeinviewAlarmDisplayProfile($Session,[string]$SourceSha256) {
 Assert-WeinviewPlcCandidateSession $Session
 if($SourceSha256 -notmatch '^[a-fA-F0-9]{64}$' -or (Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash -ine $SourceSha256){throw 'Exact unchanged fresh source SHA required'}
 if(!$Session.identity_path -or !$Session.project_path -or [IO.Path]::GetFullPath($Session.project_path) -ine [IO.Path]::GetFullPath($Session.output_path)){throw 'Owned selected-screen identity required'}
 $identity=Get-Content -LiteralPath $Session.identity_path -Raw -Encoding UTF8|ConvertFrom-Json
 if($identity.Pid -ne $Session.process.Id -or [long]$identity.CreationTicks -ne $Session.process.StartTime.ToUniversalTime().Ticks -or [IO.Path]::GetFullPath($identity.Exe) -ine [IO.Path]::GetFullPath($Session.exe_path) -or [IO.Path]::GetFullPath($identity.Project) -ine [IO.Path]::GetFullPath($Session.output_path)){throw 'Exact PID/ticks/exe/project identity required'}
 if((Get-FileHash -LiteralPath $Session.exe_path -Algorithm SHA256).Hash -cne '59FB29D8A4AA96A3F2DAD7E59301E6EE7197C6D43AB1BF79C0F135BC1EAF8F86'){throw 'Known native6.10.02.421 executable required'}
 if(!('PLCCode.Weinview.AlarmDisplayDialogControls' -as [type])){throw 'Caller must jointly load AlarmDisplayDialogControls.cs with the existing native bridge classes'}
}

function Assert-WeinviewAlarmDisplayInputs($Objects,$BeforeObjects=@(),[int]$CanvasWidth=65535,[int]$CanvasHeight=65535) {
 $objects=@($Objects);$old=@($BeforeObjects)
 if($objects.Count -lt 1 -or $objects.Count -gt 8){throw 'New1..8 required'}
 $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal);$occupied=@()
 foreach($o in $old){if($o.description){$null=$seen.Add([string]$o.description)};if(@($o.rectangle).Count -eq 4){$occupied+=,@($o.rectangle)}}
 $result=@()
 foreach($o in $objects){
  if($null -eq $o){throw 'Alarm Display object required'}
  $keys=if($o -is [Collections.IDictionary]){@($o.Keys)}else{@($o.PSObject.Properties.Name)}
  if(@($keys|Where-Object {$_ -cnotin @('kind','description','rect','font_size')}).Count){throw 'Only kind/description/rect/font_size are accepted; category/security/colors/columns are read-only in this adapter'}
  if(($keys -ccontains 'kind') -and $o.kind -cne 'alarm_display'){throw 'alarm_display kind required'}
  if($o.description -isnot [string] -or !$o.description.Length -or $o.description.Length -gt 64 -or $o.description -match '[\x00-\x1f\x7f-\x9f]' -or !$seen.Add($o.description)){throw 'Unique1..64UTF16 description without controls required'}
  $null=(New-Object Text.UTF8Encoding($false,$true)).GetBytes($o.description)
  $r=@($o.rect);if($r.Count -ne 4){throw 'Four integer rectangle fields required'}
  foreach($v in $r){if($v -isnot [int] -and $v -isnot [long]){throw 'Strict integer rectangle required'}}
  if($r[0] -lt 0 -or $r[1] -lt 0 -or $r[2] -lt 20 -or $r[3] -lt 20 -or $r[0] -gt $CanvasWidth -or $r[1] -gt $CanvasHeight -or $r[2] -gt $CanvasWidth -or $r[3] -gt $CanvasHeight -or $r[0]+$r[2] -gt $CanvasWidth -or $r[1]+$r[3] -gt $CanvasHeight){throw 'Rectangle must fit the actual native selected window'}
  foreach($b in $occupied){if($r[0] -lt $b[0]+$b[2] -and $r[0]+$r[2] -gt $b[0] -and $r[1] -lt $b[1]+$b[3] -and $r[1]+$r[3] -gt $b[1]){throw 'Alarm Display overlaps a known existing/requested rectangle'}};$occupied+=,@($r)
  $font=24;if($keys -ccontains 'font_size'){if(($o.font_size -isnot [int] -and $o.font_size -isnot [long]) -or $o.font_size -lt 5 -or $o.font_size -gt 255){throw 'Integer font_size5..255 required; it must exist in the native font-size control'};$font=[int]$o.font_size}
  $result+=[pscustomobject]@{kind='alarm_display';description=$o.description;rect=@($r|ForEach-Object {[int]$_});font_size=$font}
 }
 return $result
}

function Get-WeinviewAlarmDisplayDialog($Session,[ValidateSet('新增 报警显示','报警显示的属性')][string]$Title) {
 $end=[DateTime]::UtcNow.AddSeconds(6)
 do{$all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($all.Count -gt 1 -or @($all|Where-Object {$_.Title -cne $Title}).Count){throw 'Unknown/ambiguous owned Alarm Display modal; preserve it'};if($all.Count -eq 1 -and $all[0].Enabled){$guard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($Session.native,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd);$guard.AssertDialog($all[0].Hwnd,$Title);return $all[0]};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end)
 throw 'Exact Alarm Display native modal not ready; no entry replay'
}

function Read-WeinviewAlarmQtFields($Session,[long]$QtHwnd) {
 $raw=$Session.native.InvokeQtElement($Session.main.Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),('alarm-inspect:'+[string]$QtHwnd))
 $snapshot=$raw|ConvertFrom-Json
 if($snapshot.method -cne 'owned_gui_accessibility' -or $null -eq $snapshot.nodes){throw 'Native Alarm Display element snapshot unavailable'}
 return @($snapshot.nodes)
}
function Read-WeinviewAlarmSortColumns($Session,$Dialog,[bool]$Cmt) {
 $grid=@($Session.native.EnumChildControls($Dialog.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Id -eq 1000 -and $_.Class.StartsWith('BCGPGridCtrl:')})
 if($grid.Count -ne 1){throw 'Unique native Alarm Display sort grid required'}
 $nodes=@(Read-WeinviewAlarmQtFields $Session $grid[0].Hwnd)
 $items=@('trigger_date','trigger_time','message','occurrence_count','accumulated_time','priority','category','subcategory_1','subcategory_2')
 $labels=@('触发日期','触发时间','讯息','发生次数','累积时间','优先等级','类别','子类别 1','子类别 2')
 $rowCount=@($nodes|Where-Object {$_.role -eq 44}).Count
 if(($Cmt -and $rowCount -ne 9) -or (!$Cmt -and $rowCount -notin @(3,5))){throw 'Native Alarm Display sort row count changed'}
 for($i=0;$i -lt $rowCount;$i++){
  $prefix='Row '+($i+1)+', Column '
  $toggle=@($nodes|Where-Object {$_.name -ceq ($prefix+'1') -and $_.role -eq 44})
  $label=@($nodes|Where-Object {$_.name -ceq ($prefix+'2') -and $_.role -eq 42})
  $value=@($nodes|Where-Object {$_.name -ceq ($prefix+'3') -and $_.role -eq 42})
  $chars=0
  if($toggle.Count -ne 1 -or $label.Count -ne 1 -or $value.Count -ne 1 -or $label[0].value -cne $labels[$i] -or $toggle[0].action -cne 'Toggle' -or ![int]::TryParse([string]$value[0].value,[ref]$chars) -or $chars -lt 0 -or $chars -gt 32767 -or ($toggle[0].state -band 0x18001) -ne 0){throw 'Native Alarm Display sort label/check/value fields changed'}
  [pscustomobject]@{item=$items[$i];label=$labels[$i];displayed=(($toggle[0].state -band 16) -ne 0);display_chars=$chars}
 }
}
function Read-WeinviewAlarmDisplayDialog($Session,$Dialog,[string]$ObjectId) {
 $n=$Session.native;$title=[string]$Dialog.Title
 $cmt=([IO.Path]::GetExtension([string]$Session.output_path) -ieq '.cmtp')
 $cmtOptions=if($cmt){[ordered]@{profile='weinview-cn421-cmt-alarm-options-v1';display_style=$null;use_object_heading=$null;heading_font_size=$null;title_enabled=$null;scroll_enabled=$null;ack_gesture=$null}}else{$null}
 if($title -ceq '报警显示的属性' -and $ObjectId -notmatch '^AL_[0-9]{1,5}$'){throw 'Exact actual AL directory ID required'}
 $guard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($n,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd);$guard.AssertDialog($Dialog.Hwnd,$title)
 $p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $h=$Dialog.Hwnd;$tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32');$expectedTabs=if($cmt){'一般属性|报警|排序|标题|安全|图片|字体'}else{'一般属性|报警|排序|安全|图片|字体'};if($title -ceq '报警显示的属性'){$expectedTabs+='|轮廓'}
 if((@($p.TabNames($tab.Hwnd)) -join '|') -cne $expectedTabs){throw 'Observed Alarm Display page profile changed'}
 function Tab([string]$name){$guard.AssertDialog($h,$title);$p.SelectTabExact($tab.Hwnd,$name);$guard.AssertDialog($h,$title)}
 function C([int]$id,[string]$cl){$guard.AssertDialog($h,$title);return $n.FindUniqueControlWithoutLabel($h,$id,$cl)}
 Tab '一般属性';$description=$n.GetControlText((C 1174 'Edit').Hwnd,512);$ack=$n.GetCheckboxState(($n.FindUniqueControl($h,1857,'Button','启用')).Hwnd)
 if($ack -notin @(0,1)){throw 'Observed ACK checkbox must have exact0or1 state'}
 $ackOutput=Read-WeinviewAlarmDisplayAckOutput $Session $Dialog $guard $p $ack
 $scroll=@($n.EnumChildControls($h)|Where-Object {$_.Id -eq 1013 -and $_.Class -ceq 'Button' -and $_.Visible});if($scroll.Count -ne 1){throw 'Actual visible scrolling control required'}
 $scrollEnabled=$n.GetCheckboxState($scroll[0].Hwnd);if($scrollEnabled -notin @(0,1)){throw 'Actual scrolling state must be zero or one'}
 if($cmt){$cmtOptions.scroll_enabled=$scrollEnabled}
 Tab '字体';$font=$p.ComboSelected((C 1439 'ComboBox').Hwnd);$italic=$n.GetCheckboxState(($n.FindUniqueControl($h,1780,'Button','斜体')).Hwnd)
 Tab '排序';$sort=[ordered]@{};foreach($f in @(@('date',1734),@('time',1735),@('sequence',1736),@('method',2161))){$sort[$f[0]]=$p.ComboSelected((C $f[1] 'ComboBox').Hwnd)}
 $sort.columns=@(Read-WeinviewAlarmSortColumns $Session $Dialog $cmt|ForEach-Object {[pscustomobject][ordered]@{item=$_.item;label=$_.label;displayed=[bool]$_.displayed;display_chars=[int]$_.display_chars}})
 $sort.display_order=@();$orderSeen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($label in @($n.GetListBoxItems((C 2503 'ListBox').Hwnd))){
  $matches=@($sort.columns|Where-Object {$_.label -ceq $label -and $_.displayed})
  if($matches.Count -ne 1 -or !$orderSeen.Add([string]$matches[0].item)){throw 'Actual displayed column order must match unique enabled native rows'}
  $sort.display_order+=[string]$matches[0].item
 }
 if($sort.display_order.Count -ne @($sort.columns|Where-Object {$_.displayed}).Count){throw 'Actual displayed order must include every enabled native sort row'}
 Tab '图片';$image=[ordered]@{};foreach($f in @(@('bitmap',1269,'使用图片'),@('vector',1268,'使用向量图'),@('interior',1776,'内部'),@('frame',1775,'外框'))){$image[$f[0]]=$n.GetCheckboxState(($n.FindUniqueControl($h,$f[1],'Button',$f[2])).Hwnd)}
 $category=@();$alarm=[ordered]@{};$security=[ordered]@{}
 foreach($name in @('报警','安全')+$(if($cmt){@('标题')}else{@()})){
  Tab $name;$pageDeadline=[DateTime]::UtcNow.AddSeconds(3);$pageAttempts=@()
  $pageEvidence=$Session.output_path+'.alarm-'+$name+'-readiness-'+[guid]::NewGuid().ToString('N')+'.json'
  while($true){
   $guard.AssertDialog($h,$title)
   $qt=@($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro'})
   if($qt.Count -gt 1){throw 'Ambiguous native Alarm/security Qt page; no substitute.'}
   $nodes=@();$counts=@();$expected=if($name -ceq '报警'){if($cmt){@(2,0,1,1,1,1,$ack)}else{@(2,1,1)}}elseif($name -ceq '标题'){@(1)}else{@(1,1)}
   if($qt.Count -eq 1){
    $allNodes=@(Read-WeinviewAlarmQtFields $Session $qt[0].Hwnd);$nodes=@($allNodes|Where-Object {($_.state -band 0x18000) -eq 0})
    if($cmt -and $name -ceq '报警'){
     $headingState=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '使用元件标题'})
     if($headingState.Count -eq 1 -and ($headingState[0].state -band 16) -eq 0){
      # The original Qt retains the font value in this one hidden child after caption off.
      # Read only that observed field; do not infer its value or accept other hidden inputs.
      $retainedFont=@($allNodes|Where-Object {$_.path -ceq 'client/index:0/index:0/index:0/index:6/index:1' -and $_.role -eq 46 -and $_.name -ceq ' Down' -and $_.action -ceq 'ShowMenu' -and ($_.state -band 0x18001) -eq 0x8000})
      if($retainedFont.Count -gt 1){throw 'Ambiguous retained original heading font'}
      $nodes+=@($retainedFont)
     }
    }
    $specs=if($name -ceq '报警'){@(@{role=42;label='显示的类别范围'},@{role=44;label='透明'},@{role=44;label='启用'})+$(if($cmt){@(@{role=46;label='显示 Down';value='水晶风格'},@{role=44;label='使用元件标题'},@{role=46;label=' Down'},@{role=46;label='显示 Down';value='单击'})}else{@()})}elseif($name -ceq '标题'){@(@{role=44;label='使用标题'})}else{@(@{role=44;label='使用寄存器状态/数值'},@{role=46;label='用户限制 Down'})}
    foreach($spec in $specs){$counts+=@($nodes|Where-Object {$_.role -eq $spec.role -and $_.name -ceq $spec.label -and (!$spec.ContainsKey('value') -or $_.value -ceq $spec.value)}).Count}
    if($cmt -and $name -ceq '报警' -and @($nodes|Where-Object {$_.role -eq 46 -and $_.name -ceq '显示 Down' -and $_.value -cnotin @('水晶风格','单击')}).Count){throw 'Unknown native cMT style/ACK gesture field; preserve modal.'}
   }else{$counts=@($expected|ForEach-Object {0})}
   $ready=$qt.Count -eq 1
   for($field=0;$field -lt $expected.Count;$field++){if($counts[$field] -gt $expected[$field]){throw 'Ambiguous original native Alarm/security field; no substitute.'};if($counts[$field] -ne $expected[$field]){$ready=$false}}
   $pageAttempts+=@{utc=[DateTime]::UtcNow.ToString('o');dialog_hwnd=$h;title=$title;page=$name;qt_count=$qt.Count;counts=$counts;expected_counts=$expected;ready=$ready;native_input=$false}
   $pageAttempts|ConvertTo-Json -Depth 6|Set-Content -LiteralPath $pageEvidence -Encoding UTF8
   if($ready){break}
   if([DateTime]::UtcNow -ge $pageDeadline){throw 'Original native Alarm/security fields not ready within bounded 3 seconds; preserve modal.'}
   Start-Sleep -Milliseconds 100
  }
  if($name -ceq '报警'){
   $range=@($nodes|Where-Object {$_.role -eq 42 -and $_.name -ceq '显示的类别范围'});$transparent=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '透明'});$grid=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '启用'})
   if($range.Count -ne 2 -or $transparent.Count -ne $(if($cmt){0}else{1}) -or $grid.Count -ne 1){throw 'Observed native range/transparency/grid fields required'}
   $category=@();foreach($item in $range){$value=0;if(![int]::TryParse($item.value,[ref]$value) -or $value -lt 0 -or $value -gt 255){throw 'Native category integer0..255 required'};$category+=$value}
   $alarm.transparent=if($cmt){$null}else{($transparent[0].state -band 16)-ne 0};$alarm.grid=($grid[0].state -band 16)-ne 0
   if($cmt){
    $style=@($nodes|Where-Object {$_.role -eq 46 -and $_.name -ceq '显示 Down' -and $_.value -ceq '水晶风格'});$gesture=@($nodes|Where-Object {$_.role -eq 46 -and $_.name -ceq '显示 Down' -and $_.value -ceq '单击'});$heading=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '使用元件标题'});$headingFont=@($nodes|Where-Object {$_.role -eq 46 -and $_.name -ceq ' Down'})
    if($style.Count -ne 1 -or $gesture.Count -ne $ack -or $heading.Count -ne 1 -or $headingFont.Count -ne 1 -or $headingFont[0].value -cnotmatch '^[0-9]{1,3}$'){throw 'Exact observed cMT crystal display/ACK gesture/heading/font profile required'}
    $cmtOptions.display_style=[string]$style[0].value;$cmtOptions.use_object_heading=($heading[0].state -band 16)-ne 0;$cmtOptions.heading_font_size=[string]$headingFont[0].value
    $cmtOptions.ack_gesture=if($ack -eq 1){[string]$gesture[0].value}else{$null}
   }
  }elseif($name -ceq '标题'){
   $heading=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '使用标题'});if($heading.Count -ne 1){throw 'Actual cMT title checkbox required'};$cmtOptions.title_enabled=($heading[0].state -band 16)-ne 0
  }else{
   $interlock=@($nodes|Where-Object {$_.role -eq 44 -and $_.name -ceq '使用寄存器状态/数值'});$limit=@($nodes|Where-Object {$_.role -eq 46 -and $_.name -ceq '用户限制 Down'})
   if($interlock.Count -ne 1 -or $limit.Count -ne 1){throw 'Observed native security fields required'};$security.interlock=($interlock[0].state -band 16)-ne 0;$security.user_limit=$limit[0].value
  }
 }
 $rect=$null;$aspect=$null;$pinned=$null
 if($title -ceq '报警显示的属性'){Tab '轮廓';$rect=@();foreach($id in @(1050,1052,1045,1044)){$raw=$n.GetControlText((C $id 'Edit').Hwnd,64);$value=0;if(![int]::TryParse($raw,[ref]$value)){throw 'Actual AL outline integer required'};$rect+=$value};$aspect=$n.GetCheckboxState(($n.FindUniqueControl($h,1602,'Button','保持长/宽比例')).Hwnd);$pinned=$n.GetCheckboxState(($n.FindUniqueControl($h,1601,'Button','图钉')).Hwnd)}
 foreach($state in @($ack,$italic)+@($image.Values)+$(if($title -ceq '报警显示的属性'){@($aspect,$pinned)}else{@()})){if($state -notin @(0,1)){throw 'Observed checkbox must have exact0or1 state'}}
 $guard.AssertDialog($h,$title)
 $result=[ordered]@{object_id=$ObjectId;kind='alarm_display';description=$description;rect=$rect;aspect=$aspect;pinned=$pinned;font_size=$font;italic=$italic;ack_enabled=$ack;scroll_enabled=[int]$scrollEnabled;scroll_enabled_control=[bool]$scroll[0].Enabled;category_range=$category;alarm=$alarm;security=$security;sort=$sort;image=$image;ack_output=$ackOutput}
 if($cmt){$result.cmt_options=$cmtOptions}
 return [pscustomobject]$result
}

function Read-WeinviewAlarmDisplayAckOutput($Session,$Dialog,$Guard,$Property,[int]$AckState) {
 if($AckState -eq 0){return $null};if($AckState -ne 1){throw 'Exact enabled ACK state required'}
 $n=$Session.native;$h=$Dialog.Hwnd;$title=[string]$Dialog.Title;$Guard.AssertDialog($h,$title)
 $device=$Property.ComboSelected(($n.FindUniqueControlWithoutLabel($h,1646,'ComboBox')).Hwnd)
 $address=$n.GetControlText(($n.FindUniqueControlWithoutLabel($h,2510,'Edit')).Hwnd,64)
 $types=@(foreach($qt in @($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro'})){
  foreach($node in @(Read-WeinviewAlarmQtFields $Session $qt.Hwnd)){if($node.role -eq 46 -and $node.value -and ($node.state -band 0x18001) -eq 0){$node}}
 })
 if($types.Count -ne 1 -or !$device -or !$address -or $address -match '[\x00-\x1f\x7f-\x9f]'){throw 'Actual unique enabled ACK device/type/address fields required'}
 $Guard.AssertDialog($h,$title)
 return [pscustomobject][ordered]@{device=[string]$device;address_type=[string]$types[0].value;address_text=[string]$address}
}

function Assert-WeinviewAlarmDisplayConfigureInputs($Arguments) {
 if($Arguments.object_id -isnot [string] -or $Arguments.object_id -cnotmatch '^AL_[0-9]{1,5}$'){throw 'Exact AL object_id required'}
 if($Arguments.expected_properties_sha256 -isnot [string] -or $Arguments.expected_properties_sha256 -notmatch '^[a-fA-F0-9]{64}$'){throw 'Actual expected_properties_sha256 required'}
 if($Arguments.ack_enabled -isnot [bool]){throw 'ack_enabled must be a JSON boolean'}
 $hasAddress=@($Arguments.PSObject.Properties.Name) -ccontains 'ack_output_address'
 $address=$null
 if($Arguments.ack_enabled){
  if(!$hasAddress -or ($Arguments.ack_output_address -isnot [int] -and $Arguments.ack_output_address -isnot [long]) -or $Arguments.ack_output_address -lt 0 -or $Arguments.ack_output_address -gt 8999){throw 'Enabled ACK requires integer Local HMI LW0..8999 ack_output_address'}
  $address=[int]$Arguments.ack_output_address
 }elseif($hasAddress){throw 'Disabled ACK must omit ack_output_address; original output is not rewritten'}
 $widths=@{}
 foreach($field in @('time_display_chars','message_display_chars')){
  $value=$null
  if(@($Arguments.PSObject.Properties.Name) -ccontains $field){
   $value=$Arguments.PSObject.Properties[$field].Value;$minimum=if($field -ceq 'message_display_chars'){1}else{0}
   if(($value -isnot [int] -and $value -isnot [long]) -or $value -lt $minimum -or $value -gt 80){throw 'Finite integer time0..80/message1..80 character counts required; adapter bound, not vendor limit'}
   $value=[int]$value
  }
  $widths[$field]=$value
 }
 $heading=$null
 if(@($Arguments.PSObject.Properties.Name) -ccontains 'use_object_heading'){
  if($Arguments.use_object_heading -isnot [bool] -or [IO.Path]::GetExtension([string]$Arguments.project_path) -ine '.cmtp'){throw 'use_object_heading requires a cMT project and JSON boolean'}
  $heading=$Arguments.use_object_heading
 }
 return [pscustomobject]@{object_id=$Arguments.object_id;expected_properties_sha256=$Arguments.expected_properties_sha256.ToUpperInvariant();ack_enabled=$Arguments.ack_enabled;ack_output_address=$address;time_display_chars=$widths.time_display_chars;message_display_chars=$widths.message_display_chars;use_object_heading=$heading}
}

function Assert-WeinviewAlarmDisplayConfigurationPreservation($Before,$After,[string]$ObjectId,$Configuration=$null) {
 if($ObjectId -cnotmatch '^AL_[0-9]{1,5}$'){throw 'Exact configuration target AL identity required'}
 if(@($Before.alarm_displays).Count -ne @($After.alarm_displays).Count){throw 'Configuration must preserve all AL identities/count'}
 $old=@($Before.alarm_displays|Where-Object {$_.object_id -ceq $ObjectId});$new=@($After.alarm_displays|Where-Object {$_.object_id -ceq $ObjectId})
 if($old.Count -ne 1 -or $new.Count -ne 1){throw 'Unique target AL finite records required'}
 foreach($target in @($old[0],$new[0])){if($target.actual.object_id -cne $ObjectId -or $target.actual.kind -cne 'alarm_display' -or (Get-WeinviewAlarmDisplayPropertyHash $target.actual) -cne $target.observed_properties_sha256){throw 'Target AL actual finite identity/hash differs'}}
 $expected=$old[0].actual|ConvertTo-Json -Depth 8 -Compress|ConvertFrom-Json;$expected.ack_enabled=$new[0].actual.ack_enabled;$expected.ack_output=$new[0].actual.ack_output
 if($expected.cmt_options){$expected.cmt_options.ack_gesture=if($expected.ack_enabled -eq 1){'单击'}else{$null}}
 if($Configuration -and $null -ne $Configuration.PSObject.Properties['use_object_heading'].Value){if(!$expected.cmt_options){throw 'Heading request requires actual cMT options'};$expected.cmt_options.use_object_heading=[bool]$Configuration.use_object_heading;if($new[0].actual.cmt_options.use_object_heading -ne $expected.cmt_options.use_object_heading){throw 'Requested persisted object heading differs'}}
 foreach($field in @(@('time_display_chars',1),@('message_display_chars',2))){
  if($Configuration -and $null -ne $Configuration.PSObject.Properties[$field[0]].Value){$requested=[int]$Configuration.PSObject.Properties[$field[0]].Value;if($new[0].actual.sort.columns[$field[1]].display_chars -ne $requested){throw 'Requested persisted native sort character count differs'};$expected.sort.columns[$field[1]].display_chars=$requested}
 }
 if((Get-WeinviewAlarmDisplayPropertyHash $expected) -cne $new[0].observed_properties_sha256){throw 'Target AL fields outside explicit ACK and requested column characters changed'}
 $oldObject=@($Before.screen_snapshot.objects|Where-Object {$_.object_id -ceq $ObjectId});$newObject=@($After.screen_snapshot.objects|Where-Object {$_.object_id -ceq $ObjectId})
 $oldRow=@($Before.screen_snapshot.directory.rows|Where-Object {$_.object_id -ceq $ObjectId});$newRow=@($After.screen_snapshot.directory.rows|Where-Object {$_.object_id -ceq $ObjectId})
 if($oldObject.Count -ne 1 -or $newObject.Count -ne 1 -or $oldRow.Count -ne 1 -or $newRow.Count -ne 1 -or $oldObject[0].kind -cne $newObject[0].kind -or [bool]$oldObject[0].supported -ne [bool]$newObject[0].supported -or $oldRow[0].kind -cne $newRow[0].kind -or $oldObject[0].raw_label -cne $oldRow[0].raw_label -or $newObject[0].raw_label -cne $newRow[0].raw_label){throw 'Target AL directory ID/kind/support or actual label correspondence changed'}
 # The vendor includes the configured output address in this one AL directory label.
 # Normalize only that target in a shallow copy; retain the original actual snapshots.
 $screen=$After.screen_snapshot.PSObject.Copy();$directory=$After.screen_snapshot.directory.PSObject.Copy()
 $screen.objects=@(foreach($item in @($After.screen_snapshot.objects)){if($item.object_id -ceq $ObjectId){$copy=$item.PSObject.Copy();$copy.raw_label=$oldObject[0].raw_label;$copy}else{$item}})
 $directory.rows=@(foreach($item in @($After.screen_snapshot.directory.rows)){if($item.object_id -ceq $ObjectId){$copy=$item.PSObject.Copy();$copy.raw_label=$oldRow[0].raw_label;$copy}else{$item}});$screen.directory=$directory
 $left=[pscustomobject]@{screen_snapshot=$Before.screen_snapshot;alarm_displays=@($Before.alarm_displays|Where-Object {$_.object_id -cne $ObjectId})}
 $right=[pscustomobject]@{screen_snapshot=$screen;alarm_displays=@($After.alarm_displays|Where-Object {$_.object_id -cne $ObjectId})}
 Assert-WeinviewAlarmDisplayPreservation $left $right 0
}

function Invoke-WeinviewAlarmDisplayConfigure($Session,$Configuration,[string]$SourceSha256,[string]$EvidencePrefix,[Parameter(Mandatory=$true)][string]$BridgeRoot) {
 $ErrorActionPreference='Stop';. (Join-Path $BridgeRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $BridgeRoot 'ScreenWorkflow.ps1')
 Assert-WeinviewAlarmDisplayProfile $Session $SourceSha256
 $before=Invoke-WeinviewAlarmDisplayRead $Session $SourceSha256 ($EvidencePrefix+'.before') $BridgeRoot -DirectoryOnly
 $target=@($before.alarm_displays|Where-Object {$_.object_id -ceq $Configuration.object_id})
 if($target.Count -ne 1 -or $target[0].observed_properties_sha256 -cne $Configuration.expected_properties_sha256){throw 'Expected actual AL finite properties hash mismatch; no definition write'}
 $expected=$target[0].actual|ConvertTo-Json -Depth 8 -Compress|ConvertFrom-Json
 $expected.ack_enabled=[int][bool]$Configuration.ack_enabled
 $expected.ack_output=$null;if($Configuration.ack_enabled){$expected.ack_output=[pscustomobject][ordered]@{device='Local HMI';address_type='LW';address_text=$Configuration.ack_output_address.ToString([Globalization.CultureInfo]::InvariantCulture)}}
 if($expected.cmt_options){$expected.cmt_options.ack_gesture=if($Configuration.ack_enabled){'单击'}else{$null}}
 if($null -ne $Configuration.PSObject.Properties['use_object_heading'].Value){if(!$expected.cmt_options){throw 'Heading request requires actual cMT options'};$expected.cmt_options.use_object_heading=[bool]$Configuration.use_object_heading}
 $ackChanged=($expected.ack_enabled -ne $target[0].actual.ack_enabled) -or (($expected.ack_output|ConvertTo-Json -Depth 4 -Compress) -cne ($target[0].actual.ack_output|ConvertTo-Json -Depth 4 -Compress))
 foreach($field in @(@('time_display_chars',1),@('message_display_chars',2))){if($null -ne $Configuration.PSObject.Properties[$field[0]].Value){$expected.sort.columns[$field[1]].display_chars=[int]$Configuration.PSObject.Properties[$field[0]].Value}}
 $changed=(Get-WeinviewAlarmDisplayPropertyHash $expected) -cne $target[0].observed_properties_sha256
 $directory=Get-WeinviewWindowDirectory $Session;$initial=$directory.restore_context;$n=$Session.native;$clicked=$false;$outputWritten=$false;$columnEdits=@();$headingEdit=$null
 try{
  $row=@($directory.rows|Where-Object {$_.object_id -ceq $Configuration.object_id});if($row.Count -ne 1){throw 'Unique current target AL directory row required'}
  $dialog=Open-WeinviewAlarmDisplayObject $Session $directory $row[0]
  $actual=Read-WeinviewAlarmDisplayDialog $Session $dialog $Configuration.object_id
  if((Get-WeinviewAlarmDisplayPropertyHash $actual) -cne $Configuration.expected_properties_sha256){throw 'Fresh target AL properties changed before configuration'}
  if($changed){
   $guard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($n,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)
   $p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
   $h=$dialog.Hwnd;$tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32');$p.SelectTabExact($tab.Hwnd,'一般属性');$guard.AssertDialog($h,'报警显示的属性')
   if($ackChanged){
   $enable=$n.FindUniqueControl($h,1857,'Button','启用')
   if($n.GetCheckboxState($enable.Hwnd) -ne $expected.ack_enabled){$n.ClickButton($h,1857,'启用');$clicked=$true}
   $end=[DateTime]::UtcNow.AddSeconds(3)
   do{$guard.AssertDialog($h,'报警显示的属性');$observed=$n.GetCheckboxState($enable.Hwnd);if($observed -eq $expected.ack_enabled){break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end)
   if($observed -ne $expected.ack_enabled){throw 'Actual ACK enable readback differs; no click replay'}
   if($Configuration.ack_enabled){
    $guard.AssertDialog($h,'报警显示的属性');$device=$n.FindUniqueControlWithoutLabel($h,1646,'ComboBox');$p.SelectComboExact($device.Hwnd,'Local HMI');Start-Sleep -Milliseconds 200
    $end=[DateTime]::UtcNow.AddSeconds(3)
    do{$local=Read-WeinviewAlarmDisplayAckOutput $Session $dialog $guard $p 1;if($local.device -ceq 'Local HMI' -and $local.address_type -ceq 'LW'){break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $end)
    if($local.device -cne 'Local HMI' -or $local.address_type -cne 'LW'){throw 'Actual ACK output is not unique Local HMI LW; no unverified type write'}
    $guard.AssertDialog($h,'报警显示的属性');$edit=$n.FindUniqueControlWithoutLabel($h,2510,'Edit');$n.SetControlText($edit.Hwnd,$expected.ack_output.address_text);$outputWritten=$true
    if($n.GetControlText($edit.Hwnd,64) -cne $expected.ack_output.address_text){throw 'ACK output address immediate readback differs'}
   }
   }
   $p.SelectTabExact($tab.Hwnd,'排序');$guard.AssertDialog($h,'报警显示的属性')
   foreach($field in @(@('time_display_chars',1),@('message_display_chars',2))){
    $value=$Configuration.PSObject.Properties[$field[0]].Value;$oldChars=[int]$target[0].actual.sort.columns[$field[1]].display_chars
    if($null -ne $value -and [int]$value -ne $oldChars){$columnEdits+=@($guard.SetSortColumnChars($h,[string]$target[0].actual.sort.columns[$field[1]].item,$oldChars,[int]$value,([IO.Path]::GetExtension([string]$Session.output_path) -ieq '.cmtp')))}
   }
   if($null -ne $Configuration.PSObject.Properties['use_object_heading'].Value -and $target[0].actual.cmt_options.use_object_heading -ne $expected.cmt_options.use_object_heading){
    $p.SelectTabExact($tab.Hwnd,'报警');$guard.AssertDialog($h,'报警显示的属性')
    $qt=WaitFor {$q=@($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro'});if($q.Count -gt 1){throw 'Ambiguous original cMT alarm heading page'};if($q.Count -eq 1){return $q[0]}} 3
    $headingEdit=$guard.SetObjectHeading($h,$qt.Hwnd,[bool]$target[0].actual.cmt_options.use_object_heading,[bool]$expected.cmt_options.use_object_heading)
   }
   $actual=Read-WeinviewAlarmDisplayDialog $Session $dialog $Configuration.object_id
   if((Get-WeinviewAlarmDisplayPropertyHash $actual) -cne (Get-WeinviewAlarmDisplayPropertyHash $expected)){throw 'Target AL unrelated finite fields changed or requested ACK/characters differ'}
  }
  Close-WeinviewScreenDialog $Session $dialog $changed
  $after=Invoke-WeinviewAlarmDisplayRead $Session $SourceSha256 ($EvidencePrefix+'.after') $BridgeRoot -DirectoryOnly
  Assert-WeinviewAlarmDisplayConfigurationPreservation $before $after $Configuration.object_id $Configuration
  $result=@($after.alarm_displays|Where-Object {$_.object_id -ceq $Configuration.object_id})
  if($result.Count -ne 1 -or $result[0].observed_properties_sha256 -cne (Get-WeinviewAlarmDisplayPropertyHash $expected)){throw 'Confirmed target AL finite fields differ'}
  $configurationEvidence=[pscustomobject]@{object_id=$Configuration.object_id;dialog_title='报警显示的属性';ack_control_id=1857;device_control_id=1646;address_control_id=2510;ack_checkbox_clicked=$clicked;output_controls_written=$outputWritten;column_edits=$columnEdits;before_actual=$target[0].actual;after_actual=$result[0].actual;global_input=$false;layout_reset=$false}
  if($null -ne $Configuration.PSObject.Properties['use_object_heading'].Value){$configurationEvidence|Add-Member -NotePropertyName heading_edit -NotePropertyValue $headingEdit}
  return [pscustomobject]@{profile=(Get-WeinviewAlarmDisplayProfileName $Session -Acknowledgement);changed=$changed;before_snapshot=$before;after_snapshot=$after;configuration_evidence=$configurationEvidence;untouched_objects_verified=$true;untouched_objects_verification_scope='other AL observed fields; other objects native directory ID/kind/label/order only';unknown_existing_bounds=@($before.screen_snapshot.objects|Where-Object {!$_.supported -and $_.object_id -cnotmatch '^AL_[0-9]{1,5}$'}).Count;native_fields_verified=$true;full_properties_verified=$false;runtime_ack_verified=$false}
 }finally{if($initial -and !@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory $Session $initial}}
}

function Assert-WeinviewAlarmDisplayDefaults($Actual) {
 $hasScrollState=if($Actual -is [Collections.IDictionary]){$Actual.Contains('scroll_enabled')}else{$null -ne $Actual.PSObject.Properties['scroll_enabled']}
 $scrollMismatch=if($hasScrollState){
  $Actual.scroll_enabled -ne 0 -or ($Actual.cmt_options -and ($Actual.cmt_options.profile -cne 'weinview-cn421-cmt-alarm-options-v1' -or $Actual.cmt_options.scroll_enabled -ne 0))
 }else{
  if($Actual.cmt_options){$Actual.cmt_options.profile -cne 'weinview-cn421-cmt-alarm-options-v1' -or $Actual.cmt_options.scroll_enabled -ne 0 -or !$Actual.scroll_enabled_control}else{[bool]$Actual.scroll_enabled_control}
 }
 if(($Actual.category_range -join ',') -cne '0,255' -or $Actual.ack_enabled -ne 0 -or $scrollMismatch -or $Actual.security.interlock -or $Actual.security.user_limit -cne '无'){throw 'Observed category0..255/ack0/scroll-off/unfiltered-security defaults required; no default repair is attempted'}
}

function Get-WeinviewAlarmDisplayPropertyHash($Actual) {
 $json=$Actual|ConvertTo-Json -Depth 8 -Compress;$sha=[Security.Cryptography.SHA256]::Create()
 try{return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($json))).Replace('-','')}finally{$sha.Dispose()}
}

function New-WeinviewAlarmDisplayReceiptObjects($Snapshot,$ObjectIds=$null) {
 $objects=@();$ids=if($null -eq $ObjectIds){$null}else{@($ObjectIds)}
 foreach($record in @($Snapshot.alarm_displays)){
  if($null -ne $ids -and $record.object_id -cnotin $ids){continue}
  if(!$record.native_fields_verified -or $record.full_properties_verified -or $record.actual.object_id -cne $record.object_id -or (Get-WeinviewAlarmDisplayPropertyHash $record.actual) -cne $record.observed_properties_sha256){throw 'Actual AL finite field identity/hash required for receipt'}
  $objects+=[pscustomobject][ordered]@{object_id=$record.object_id;kind='alarm_display';screen=[int]$Snapshot.screen_snapshot.screen;window_name=[string]$Snapshot.screen_snapshot.window_name;description=[string]$record.actual.description;rect=@($record.actual.rect);font_size=[string]$record.actual.font_size;actual=$record.actual;observed_properties_json=($record.actual|ConvertTo-Json -Depth 8 -Compress);observed_properties_sha256=$record.observed_properties_sha256;native_fields_verified=$true;full_properties_verified=$false;property_scope='observed Alarm Display fields';editable_fields=@('description','rect','font_size')}
 }
 if($null -ne $ids -and $objects.Count -ne $ids.Count){throw 'Requested actual AL identities missing or duplicated in receipt'}
 return $objects
}

function Select-WeinviewAlarmDisplayWindow($Session,[int]$Number,[string]$EvidencePrefix) {
 $window=Select-WeinviewWindow $Session $Number
 WritePrivateJson ($EvidencePrefix+'.window-geometry.json') $window.geometry_evidence
 return $window
}

function Open-WeinviewAlarmDisplayObject($Session,$Directory,$Row) {
 if($Row.object_id -cnotmatch '^AL_[0-9]{1,5}$' -or [int]$Directory.window_number -ne [int]$Session.window_number){throw 'Only exact actual AL row in selected window accepted'}
 $tree=[PLCCode.Weinview.Research.WindowTreeControls]::new([int]$Session.process.Id,[long]$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path,[long]$Session.main.Hwnd,$false)
 $tree.OpenObjectAtObservedRow($Directory.tree_hwnd,$Row.semantic_path,$Row.raw_label,$Row.object_id,'AlarmDisplay')
 return Get-WeinviewAlarmDisplayDialog $Session '报警显示的属性'
}

function Invoke-WeinviewAlarmDisplayRead($Session,[string]$SourceSha256,[string]$EvidencePrefix,[Parameter(Mandatory=$true)][string]$BridgeRoot,$ScreenSnapshot=$null,[switch]$DirectoryOnly) {
 $ErrorActionPreference='Stop';. (Join-Path $BridgeRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $BridgeRoot 'ScreenWorkflow.ps1')
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh private evidence required'};$value|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $path -Encoding UTF8}
 Assert-WeinviewAlarmDisplayProfile $Session $SourceSha256
 $null=Set-WeinviewAlarmDisplayForeground $Session
 $snapshot=if($DirectoryOnly){
  if($null -ne $ScreenSnapshot){throw 'Directory-only AL read cannot reuse a full screen snapshot'}
  Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($EvidencePrefix+'.screen') $BridgeRoot
 }elseif($null -eq $ScreenSnapshot){Invoke-WeinviewScreenRead $Session $SourceSha256 ($EvidencePrefix+'.screen')}else{
  if($ScreenSnapshot.source_sha256 -cne $SourceSha256 -or [int]$ScreenSnapshot.screen -ne [int]$Session.window_number){throw 'Original same-source selected-screen snapshot required'}
  $freshDirectory=Get-WeinviewWindowDirectory $Session;$oldRows=@($ScreenSnapshot.directory.rows);$freshRows=@($freshDirectory.rows)
  if($oldRows.Count -ne $freshRows.Count){throw 'Original screen directory count changed before AL inspection'}
  for($i=0;$i -lt $oldRows.Count;$i++){if($oldRows[$i].object_id -cne $freshRows[$i].object_id -or $oldRows[$i].kind -cne $freshRows[$i].kind -or $oldRows[$i].raw_label -cne $freshRows[$i].raw_label){throw 'Original screen directory identity/order changed before AL inspection'}}
  $ScreenSnapshot
 };$alarms=@();$initial=$null
 try{foreach($row in @($snapshot.directory.rows|Where-Object {$_.object_id -cmatch '^AL_[0-9]{1,5}$'})){
  $directory=Get-WeinviewWindowDirectory $Session;if(!$initial){$initial=$directory.restore_context}
  if([int]$directory.window_number -ne [int]$snapshot.screen){throw 'Actual AL directory selected window changed before read'}
  $found=@($directory.rows|Where-Object {$_.object_id -ceq $row.object_id -and ($DirectoryOnly -or $_.raw_label -ceq $row.raw_label)});if($found.Count -ne 1){throw 'Actual AL directory identity changed before read'}
  $d=Open-WeinviewAlarmDisplayObject $Session $directory $found[0];$actual=Read-WeinviewAlarmDisplayDialog $Session $d $row.object_id
  WritePrivateJson ($EvidencePrefix+'.'+$row.object_id+'.alarm-read.json') $actual;Close-WeinviewScreenDialog $Session $d $false
  $alarms+=[pscustomobject]@{object_id=$row.object_id;actual=$actual;observed_properties_json=($actual|ConvertTo-Json -Depth 8 -Compress);observed_properties_sha256=(Get-WeinviewAlarmDisplayPropertyHash $actual);native_fields_verified=$true;full_properties_verified=$false;editable_fields=@('description','rect','font_size')}
 }}finally{if($initial -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory $Session $initial}}
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'Alarm Display read unexpectedly saved project bytes'}
 $scope=if($DirectoryOnly){'observed Alarm Display fields; other objects native directory identity only'}else{'observed Alarm Display fields; legacy supported complete properties; other unsupported directory identities'}
 $result=[pscustomobject]@{screen_snapshot=$snapshot;alarm_displays=$alarms;source_sha256=$SourceSha256;scope=$scope;saved=$false;reopened_verified=$false;runtime_alarm_verified=$false}
 WritePrivateJson ($EvidencePrefix+'.alarm-snapshot.json') $result;return $result
}

function Assert-WeinviewAlarmDisplayPreservation($Before,$After,[int]$AddedCount=0) {
 $a=$Before.screen_snapshot;$b=$After.screen_snapshot
 if([int]$a.screen -ne [int]$b.screen -or @($b.objects).Count -ne @($a.objects).Count+$AddedCount){throw 'Selected-screen native count changed unexpectedly'}
 foreach($old in @($a.objects)){$found=@($b.objects|Where-Object {$_.object_id -ceq $old.object_id});if($found.Count -ne 1 -or [bool]$old.supported -ne [bool]$found[0].supported){throw 'Pre-existing native object identity/support changed'};if($old.supported){if((CanonicalObjectHash (CanonicalObject $old.object_id $old)) -cne $old.object_sha256 -or $found[0].object_sha256 -cne $old.object_sha256){throw 'Pre-existing complete native object changed'}}elseif($old.kind -cne $found[0].kind -or $old.raw_label -cne $found[0].raw_label){throw 'Pre-existing unsupported directory object changed'}}
 $oldIds=@($a.directory.rows|ForEach-Object {$_.object_id});$retained=@($b.directory.rows|Where-Object {$_.object_id -cin $oldIds})
 if($retained.Count -ne $oldIds.Count){throw 'Pre-existing native directory count changed'}
 for($i=0;$i -lt $oldIds.Count;$i++){if($retained[$i].object_id -cne $a.directory.rows[$i].object_id -or $retained[$i].kind -cne $a.directory.rows[$i].kind -or $retained[$i].raw_label -cne $a.directory.rows[$i].raw_label){throw 'Pre-existing native directory order/ID/kind/label changed'}}
 foreach($old in @($Before.alarm_displays)){$found=@($After.alarm_displays|Where-Object {$_.object_id -ceq $old.object_id});if($found.Count -ne 1 -or $found[0].observed_properties_sha256 -cne $old.observed_properties_sha256){throw 'Pre-existing observed AL properties changed'}}
}

function Invoke-WeinviewAlarmDisplayAddition($Session,[ValidateSet('Apply')][string]$Mode,$Objects,[string]$SourceSha256,$BeforeSnapshot,[Parameter(Mandatory=$true)][string]$BridgeRoot) {
 $ErrorActionPreference='Stop';. (Join-Path $BridgeRoot 'PlcConfigurationCandidate.ps1');. (Join-Path $BridgeRoot 'ScreenWorkflow.ps1')
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh private evidence required'};$value|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $path -Encoding UTF8}
 Assert-WeinviewAlarmDisplayProfile $Session $SourceSha256
 $prefix=$Session.output_path+'.alarm-'+[guid]::NewGuid().ToString('N');$beforeScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($BeforeSnapshot){$callerScreen=if($BeforeSnapshot.screen_snapshot){$BeforeSnapshot.screen_snapshot}else{$BeforeSnapshot};Assert-WeinviewAdditionSnapshots $callerScreen $beforeScreen 0;if($BeforeSnapshot.source_sha256 -ine $SourceSha256){throw 'Caller before source hash differs'}}
 $before=[pscustomobject]@{screen_snapshot=$beforeScreen;alarm_displays=@();source_sha256=$SourceSha256}
 $requests=@(Assert-WeinviewAlarmDisplayInputs $Objects @() ([int]$Session.window_width) ([int]$Session.window_height))

 $n=$Session.native;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path);$sem=[PLCCode.Weinview.NativeSemanticControls]::new($n);$results=@();$initial=$null
 try{foreach($o in $requests){
  $firstAddition=($results.Count -eq 0);$directory=if($firstAddition){$beforeScreen.directory}else{Get-WeinviewWindowObjectInventory $Session};if(!$firstAddition -and !$initial){$initial=$directory.restore_context};$oldIds=@($directory.rows|ForEach-Object {$_.object_id})
  $tabEntry=Invoke-WeinviewAlarmDisplayRibbon $Session $sem '资料/历史';$entry=Invoke-WeinviewAlarmDisplayRibbon $Session $sem '报警显示'
  # The original modal and control identities permit writes.
  $d=Get-WeinviewAlarmDisplayDialog $Session '新增 报警显示';$initialFields=Read-WeinviewAlarmDisplayDialog $Session $d ([NullString]::Value);Assert-WeinviewAlarmDisplayDefaults $initialFields
  $guard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($n,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd);$h=$d.Hwnd;$tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32')
  $guard.AssertDialog($h,'新增 报警显示');$p.SelectTabExact($tab.Hwnd,'一般属性');$n.SetControlText(($n.FindUniqueControlWithoutLabel($h,1174,'Edit')).Hwnd,$o.description)
  if($n.GetControlText(($n.FindUniqueControlWithoutLabel($h,1174,'Edit')).Hwnd,512) -cne $o.description){throw 'New AL description immediate readback differs'}
  $guard.AssertDialog($h,'新增 报警显示');$p.SelectTabExact($tab.Hwnd,'字体');$size=$n.FindUniqueControlWithoutLabel($h,1439,'ComboBox');$p.SelectComboExact($size.Hwnd,[string]$o.font_size)
  if($p.ComboSelected($size.Hwnd) -cne [string]$o.font_size){throw 'New AL font size immediate readback differs'}
  $expected=$initialFields|ConvertTo-Json -Depth 8 -Compress|ConvertFrom-Json;$expected.description=$o.description;$expected.font_size=[string]$o.font_size
  Close-WeinviewScreenDialog $Session $d $true
  $null=Set-WeinviewAlarmDisplayForeground $Session
  $scene=[PLCCode.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$before.screen_snapshot.screen,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
  $frame=$scene.CapturePlacement()
  if(!$frame){throw 'Fresh owned canvas capture required'};$r=@($o.rect);$scene.PlaceNewObject($frame,$r[0],$r[1]);$scene.EndPlacement()
  $afterDirectory=Get-WeinviewWindowDirectory $Session;$new=@($afterDirectory.rows|Where-Object {$_.object_id -cnotin $oldIds})
  WritePrivateJson ($prefix+'.item-'+$results.Count+'.directory-diff.json') @{before=$directory;after=$afterDirectory;new_rows=$new}
  if($new.Count -ne 1 -or $new[0].object_id -cnotmatch '^AL_[0-9]{1,5}$' -or @($afterDirectory.rows).Count -ne $oldIds.Count+1){throw 'Exactly one newly placed native AL ID required'}
  $row=$new[0];$d=Open-WeinviewAlarmDisplayObject $Session $afterDirectory $row
  $h=$d.Hwnd;$tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32');$p.SelectTabExact($tab.Hwnd,'轮廓');$ids=@(1050,1052,1045,1044)
  if($n.GetCheckboxState(($n.FindUniqueControl($h,1602,'Button','保持长/宽比例')).Hwnd) -ne 0 -or $n.GetCheckboxState(($n.FindUniqueControl($h,1601,'Button','图钉')).Hwnd) -ne 0){throw 'Independent unpinned AL outline required'}
  for($i=0;$i -lt 4;$i++){$guard.AssertDialog($h,'报警显示的属性');$c=$n.FindUniqueControlWithoutLabel($h,$ids[$i],'Edit');$n.SetControlText($c.Hwnd,[string]$r[$i]);if($n.GetControlText($c.Hwnd,64) -cne [string]$r[$i]){throw 'New AL outline immediate readback differs'}}
  $expected.object_id=$row.object_id;$expected.rect=$r;$expected.aspect=0;$expected.pinned=0
  if($expected.cmt_options -and $expected.cmt_options.use_object_heading){
   $p.SelectTabExact($tab.Hwnd,'报警')
   $qt=WaitFor {$q=@($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro'});if($q.Count -gt 1){throw 'Ambiguous original cMT alarm heading page'};if($q.Count -eq 1){return $q[0]}} 3
   $null=$guard.SetObjectHeading($h,$qt.Hwnd,$true,$false)
   $expected.cmt_options.use_object_heading=$false
  }
  Close-WeinviewScreenDialog $Session $d $true
  $results+=[pscustomobject]@{object_id=$row.object_id;actual=$null;observed_properties_json=$null;observed_properties_sha256=$null;expected_properties_sha256=(Get-WeinviewAlarmDisplayPropertyHash $expected);native_fields_verified=$false;full_properties_verified=$false;creation_intent=@{tab_entry=$tabEntry;object_entry=$entry;actual_new_dialog_title='新增 报警显示';actual_new_object_id=$row.object_id}}
 }
 $finalScreen=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot
 Assert-WeinviewAdditionSnapshots $beforeScreen $finalScreen $results.Count
 $finalAlarms=@();foreach($added in $results){
  $directory=Get-WeinviewWindowDirectory $Session;$found=@($directory.rows|Where-Object {$_.object_id -ceq $added.object_id});if($found.Count -ne 1){throw 'Added actual AL directory identity missing'}
  $d=Open-WeinviewAlarmDisplayObject $Session $directory $found[0];$actual=Read-WeinviewAlarmDisplayDialog $Session $d $added.object_id
  WritePrivateJson ($prefix+'.after.'+$added.object_id+'.alarm-read.json') $actual;Close-WeinviewScreenDialog $Session $d $false
  $hash=Get-WeinviewAlarmDisplayPropertyHash $actual;if($hash -cne $added.expected_properties_sha256){throw 'Added observed AL fields differ after confirmation'}
  $added.actual=$actual;$added.observed_properties_json=($actual|ConvertTo-Json -Depth 8 -Compress);$added.observed_properties_sha256=$hash;$added.native_fields_verified=$true
  $finalAlarms+=[pscustomobject]@{object_id=$added.object_id;actual=$actual;observed_properties_json=($actual|ConvertTo-Json -Depth 8 -Compress);observed_properties_sha256=$hash;native_fields_verified=$true;full_properties_verified=$false;editable_fields=@('description','rect','font_size')}
 }
 $final=[pscustomobject]@{screen_snapshot=$finalScreen;alarm_displays=$finalAlarms;source_sha256=$SourceSha256;scope='native directory ID/kind/label/order only; new target fields read';saved=$false;reopened_verified=$false;runtime_alarm_verified=$false}
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'AL addition unexpectedly saved source bytes'}
 return [pscustomobject]@{operation='alarm_display_addition';mode=$Mode;objects=$results;before_snapshot=$before;after_snapshot=$final;untouched_objects_verified=$false;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';unknown_existing_bounds=@($before.screen_snapshot.objects|Where-Object {!$_.supported -and $_.object_id -cnotmatch '^AL_[0-9]{1,5}$'}).Count;collision_verification_scope='requested rectangles only; existing bounds unread';source_sha256=$SourceSha256;profile=(Get-WeinviewAlarmDisplayProfileName $Session);native_fields_verified=$true;full_properties_verified=$false;saved=$false;persisted_verified=$false;reopened_verified=$false;runtime_alarm_verified=$false}
 }finally{if($initial -and !@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory $Session $initial}}
}

function Set-WeinviewAlarmDisplayForeground($Session){
 Assert-WeinviewPlcCandidateSession $Session
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Owned modal blocks alarm operation'}
 return [pscustomobject]@{method='owned_element';global_input=$false}
}
function Invoke-WeinviewAlarmDisplayRibbon($Session,$Semantic,[string]$Label){
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 return Invoke-WeinviewQtElement $Session $Label
}
function Invoke-WeinviewAlarmDisplayRibbonOcr($Session,$Semantic,[string]$Label){return Invoke-WeinviewAlarmDisplayRibbon $Session $Semantic $Label}
