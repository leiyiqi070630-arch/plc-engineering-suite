# Definitions only; Worker owns clone, exact hashes, save/reopen and normal exit.
function New-WeinviewEventRequests($Arguments,$DeviceDirectory=@(),$TagRows=@(),[switch]$StructureOnly) {
 if([string]$Arguments.expected_events_sha256 -notmatch '^[A-Fa-f0-9]{64}$'){throw 'Exact before event table SHA required.'}
 $items=@($Arguments.events);if($items.Count -lt 1 -or $items.Count -gt 8){throw 'One to eight event requests required.'}
 $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 $resolved=[Collections.Generic.List[object]]::new()
 foreach($item in $items){
  if($item -isnot [pscustomobject]){throw 'Typed event request required.'}
  $keys=@($item.PSObject.Properties.Name)
  $allowed=@('tag_name','device','address_type','address','trigger','threshold','category','content')
  if($keys -cnotcontains 'content' -or @($keys|Where-Object {$_ -cnotin $allowed}).Count){throw 'Event content and native address or tag_name required.'}
  $trigger=if($keys -ccontains 'trigger'){$item.trigger}else{'bit_on'}
  $category=if($keys -ccontains 'category'){$item.category}else{0}
  if($trigger -cnotin @('bit_on','word_gt') -or $category -isnot [int] -or $category -ne 0){throw 'Only observed bit_on or word_gt category0 event profile accepted.'}
  if($keys -ccontains 'tag_name' -or $keys -ccontains 'device' -or $keys -ccontains 'address_type'){
   $binding=Resolve-WeinviewProjectAddress $item $DeviceDirectory $TagRows -StructureOnly:$StructureOnly
  }else{
   if($keys -cnotcontains 'address' -or ($item.address -isnot [int] -and $item.address -isnot [long]) -or $item.address -lt 0 -or $item.address -gt 8999){throw 'Legacy Local HMI LB address must be integer 0..8999.'}
   $binding=[pscustomobject]@{tag_name=$null;device='Local HMI';address_type='LB';address=([string]$item.address);data_type=$null;native_device_verified=$false;native_tag_verified=$false}
  }
  $nativeDeviceType=$null
  if(!$StructureOnly){
   $nativeDeviceRows=@($DeviceDirectory|Where-Object {$_.name -ceq $binding.device})
   if($nativeDeviceRows.Count -eq 1){$nativeDeviceType=[string]$nativeDeviceRows[0].device_type}
  }
  $isModbusCoilAddress=(!$StructureOnly -and $binding.native_device_verified -and $binding.native_tag_verified -and $nativeDeviceType -ceq 'MODBUS TCP/IP' -and $binding.address_type -ceq '0x')
  $isNativeModbusCoil=($isModbusCoilAddress -and $binding.data_type -ceq '不指定')
  $threshold=$null
  if($trigger -ceq 'bit_on'){
   if($keys -ccontains 'threshold'){throw 'Bit event must omit word threshold.'}
   if(!$StructureOnly -and $binding.device -ceq 'Local HMI'){
    if($binding.address_type -cne 'LB' -and $binding.address_type -cne 'PLW_Bit'){throw 'bit_on requires an actual local bit address type; word address is not a bit trigger.'}
   }elseif(!$StructureOnly -and $binding.data_type -cne 'Bit' -and !$binding.address_type.EndsWith('_Bit',[StringComparison]::Ordinal) -and !$isNativeModbusCoil){
    throw 'bit_on requires a native bit tag; signed/unsigned word tags need a numeric event condition.'
   }
  }else{
   if($keys -cnotcontains 'tag_name' -or (!$StructureOnly -and ($binding.data_type -cne '16-bit Signed' -or $isModbusCoilAddress))){throw 'word_gt requires an existing native 16-bit Signed word tag.'}
   if($keys -cnotcontains 'threshold' -or ($item.threshold -isnot [int] -and $item.threshold -isnot [long]) -or $item.threshold -lt -32768 -or $item.threshold -gt 32767){throw 'word_gt threshold must be a signed16 integer.'}
   $threshold=[int]$item.threshold
  }
  if($item.content -isnot [string] -or !$item.content -or $item.content.Length -gt 512 -or $item.content -match '[\x00-\x1f\x7f]'){throw 'Event content must be 1..512 characters without controls.'}
  if($StructureOnly){continue}
  if(!$seen.Add($binding.device+[char]0+$binding.address_type+[char]0+$binding.address)){throw 'Event trigger address duplicated in one request.'}
  $resolved.Add([pscustomobject]@{tag_name=$binding.tag_name;device=$binding.device;device_type=$nativeDeviceType;address_type=$binding.address_type;address=$binding.address;data_type=$binding.data_type;native_device_verified=$binding.native_device_verified;native_tag_verified=$binding.native_tag_verified;trigger=$trigger;threshold=$threshold;category=$category;content=$item.content})
 }
 return ,$resolved.ToArray()
}
function Invoke-WeinviewEventCodec([string]$Prefix,$Request) {
 $requestPath=$Prefix+'.request.json';$responsePath=$Prefix+'.response.json'
 if((Test-Path -LiteralPath $requestPath) -or (Test-Path -LiteralPath $responsePath)){throw 'Fresh event codec receipt paths required.'}
 [IO.File]::WriteAllText($requestPath,($Request|ConvertTo-Json -Depth 15),[Text.UTF8Encoding]::new($false))
 $raw=& (Join-Path $PSScriptRoot 'EventTableCodec/Invoke-EventTableCodec.ps1') -RequestPath $requestPath -ResponsePath $responsePath
 return ($raw|ConvertFrom-Json).result
}
function Get-WeinviewEventDialog($Session,[string]$Title,[long]$Exclude=0) {
 WaitFor {
  $found=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $Exclude -and $_.Title -ceq $Title})
  if($found.Count -gt 1){throw 'Ambiguous native event dialog.'};if($found.Count -eq 1){return $found[0]}
 } 8
}
function Get-WeinviewEventProfile($Session) {
 Assert-WeinviewPlcCandidateSession $Session
 switch([IO.Path]::GetExtension($Session.output_path).ToLowerInvariant()){
  '.emtp' {return @{format='native-event-v3-hw49';column_count=170;title='事件登录';close_id=2;close_label='关闭';trigger_device=127;trigger_type=128;trigger_address=131}}
  '.cmtp' {return @{format='native-event-v4-hw72';column_count=179;title='报警 (事件) 登录';close_id=1;close_label='离开';trigger_device=128;trigger_type=129;trigger_address=132}}
  default {throw 'Exact observed native project extension required for event exchange.'}
 }
}
function Get-WeinviewEventManager($Session) {
 $profile=Get-WeinviewEventProfile $Session
 return (Get-WeinviewEventDialog $Session $profile.title)
}
function Get-WeinviewEventCount($Session) {
 $dialog=Get-WeinviewEventManager $Session
 $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $text=$Session.native.GetControlText(($Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,1290,'Static')).Hwnd,64)
 if($text -notmatch '^(\d+) / 10000$'){throw 'Actual event count unreadable.'};$count=[int]$Matches[1]
 $combo=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,1292,'ComboBox')
 if($property.ComboSelected($combo.Hwnd) -cne ('全部 ['+$count+']')){throw 'Complete category-all event table required.'}
 return $count
}
function Read-WeinviewEventHistoryGlobalState($Session) {
 # Read only. Caller opens the manager and owns clone/hash/save/close lifecycle.
 Assert-WeinviewPlcCandidateSession $Session
 if((Get-WeinviewEventProfile $Session).format -ceq 'native-event-v4-hw72'){return (Read-WeinviewCmtEventHistoryGlobalState $Session)}
 $dialog=Get-WeinviewEventManager $Session
 $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($modals.Count -ne 1 -or $modals[0].Hwnd -ne $dialog.Hwnd){throw 'Unique owned event manager required for global history read.'}
 $state=[ordered]@{hmi_enabled=$false;usb_enabled=$false;backlight_on_alarm=$false;file_retention_limit_enabled=$null}
 $evidence=@()
 foreach($spec in @(@('hmi_enabled',1744,'保存到 HMI'),@('usb_enabled',1746,'保存到 U盘'),@('backlight_on_alarm',1896,'报警时自动打开背光灯'))){
  # History storage can be disabled by the selected HMI model. Read the
  # actual checkbox state without requiring the control to be clickable.
  # The observed MT8071iE dialog names its first USB destination U盘1.
  $expectedTitles=@([string]$spec[2]);if([int]$spec[1] -eq 1746){$expectedTitles=@('保存到 U盘','保存到 U盘1')}
  $matches=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq [int]$spec[1]})
  if($matches.Count -ne 1 -or $matches[0].Class -cne 'Button' -or $matches[0].Title -cnotin $expectedTitles -or !$matches[0].Visible){
   $observed=ConvertTo-Json -InputObject @($matches|Select-Object Class,Title,Visible,Enabled) -Depth 3 -Compress
   $expectedTitleText=ConvertTo-Json -InputObject $expectedTitles -Compress
   throw ('Exact visible native event history checkbox required for readonly observation. field={0}; id={1}; expected_titles={2}; actual={3}' -f [string]$spec[0],[int]$spec[1],$expectedTitleText,$observed)
  }
  $control=$matches[0]
  $value=$Session.native.GetCheckboxState($control.Hwnd)
  if($value -ne 0 -and $value -ne 1){throw 'Observed event history checkbox must be checked or unchecked.'}
  $state[[string]$spec[0]]=($value -eq 1)
  $evidence+=@{field=[string]$spec[0];control=$control;observed=$true;checkbox_state=[int]$value}
 }
 $retention=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq 1895})
 if($retention.Count -gt 1){throw 'Ambiguous native event file retention checkbox.'}
 $retentionControl=$null;$retentionState=$null;$retentionObserved=$false
 if($retention.Count -eq 1){
  $retentionControl=$retention[0]
  if($retentionControl.Visible){
   if($retentionControl.Class -cne 'Button' -or $retentionControl.Title -cne '文件保留限制'){throw 'Exact native event file retention checkbox required for readonly observation.'}
   $retentionState=$Session.native.GetCheckboxState($retentionControl.Hwnd)
   if($retentionState -ne 0 -and $retentionState -ne 1){throw 'Observed event file retention checkbox must be checked or unchecked.'}
   $state.file_retention_limit_enabled=($retentionState -eq 1);$retentionObserved=$true
  }
 }
 $evidence+=@{field='file_retention_limit_enabled';control=$retentionControl;observed=$retentionObserved;checkbox_state=$retentionState}
 Assert-WeinviewPlcCandidateSession $Session
 $current=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($current.Count -ne 1 -or $current[0].Hwnd -ne $dialog.Hwnd -or !$current[0].Enabled -or $current[0].Title -cne '事件登录'){throw 'Native event manager changed during global history read.'}
 return @{history_global_state=$state;native_evidence=@{profile='weinview-cn421-native-event-history-global-v1';pid=[int]$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture);exe_path=$Session.exe_path;dialog=$current[0];controls=$evidence;observed_utc=[DateTime]::UtcNow.ToString('o');read_only=$true;global_input=$false;layout_reset=$false;full_history_settings_verified=$false}}
}
function Read-WeinviewCmtEventHistoryGlobalState($Session) {
 $dialog=Get-WeinviewEventManager $Session
 $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($modals.Count -ne 1 -or $modals[0].Hwnd -ne $dialog.Hwnd){throw 'Unique actual cMT event manager required.'}
 $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
 $tabs=@($property.TabNames($tab.Hwnd))
 if($tabs.Count -ne 2 -or $tabs[0] -cne '事件' -or $tabs[1] -cne '历史/控制'){throw 'Observed cMT event/history tabs changed.'}
 $property.SelectTabExact($tab.Hwnd,'事件')
 $backlight=$Session.native.FindUniqueControl($dialog.Hwnd,1896,'Button','报警时自动打开背光灯')
 $backlightState=$Session.native.GetCheckboxState($backlight.Hwnd)
 $property.SelectTabExact($tab.Hwnd,'历史/控制')
 $group=$Session.native.FindUniqueControl($dialog.Hwnd,1040,'Button','历史')
 $hmi=$Session.native.FindUniqueControl($dialog.Hwnd,1744,'Button','启用')
 $hmiState=$Session.native.GetCheckboxState($hmi.Hwnd)
 # These original standard controls exist while hidden. Read their actual
 # BM_GETCHECK states; USB is a radio, and is not a legacy USB checkbox.
 $storage=@();$all=@($Session.native.EnumChildControls($dialog.Hwnd))
 foreach($spec in @(@('hmi_limited',1534,'HMI 内存 (10000 限制)','radio'),@('hmi_until_full',1757,'HMI 内存 (直到空间存满)','radio'),@('usb',1746,'U盘','radio'),@('retention',1895,'文件保留限制','checkbox'),@('limit_flash_write',1025,'限制写入 HMI 闪存的频率','checkbox'),@('restore_on_start',1026,'启动时, 将关机之前触发的事件标记为已恢复','checkbox'),@('control_enabled',2849,'启用','checkbox'))){
  $found=@($all|Where-Object {$_.Id -eq $spec[1]})
  $labels=if([int]$spec[1] -eq 1746){@('U盘','U盘1')}else{@([string]$spec[2])}
  if($found.Count -ne 1 -or $found[0].Class -cne 'Button' -or $found[0].Title -cnotin $labels){throw 'Exact original cMT history storage control required; no substitute'}
  $value=if($spec[3] -ceq 'radio'){$Session.native.GetRadioState($found[0].Hwnd)}else{$Session.native.GetCheckboxState($found[0].Hwnd)}
  if($value -notin @(0,1)){throw 'Original cMT storage state must be zero or one'}
  $storage+=@{field=$spec[0];control=$found[0];native_kind=$spec[3];state=[int]$value;read_method='owned_native_bm_getcheck'}
 }
 if(@($storage[0..2]|Where-Object {$_.state -eq 1}).Count -ne 1){throw 'Other cMT storage destinations require a separately observed contract'}
 $property.SelectTabExact($tab.Hwnd,'事件')
 if($backlightState -notin @(0,1) -or $hmiState -notin @(0,1)){throw 'Original cMT checkbox states changed.'}
 $current=Get-WeinviewEventManager $Session
 if($current.Hwnd -ne $dialog.Hwnd){throw 'Original cMT event manager changed during readonly observation.'}
 $state=[ordered]@{hmi_enabled=($hmiState -eq 1);usb_enabled=($storage[2].state -eq 1);backlight_on_alarm=($backlightState -eq 1);file_retention_limit_enabled=($storage[3].state -eq 1)}
 $controls=@(@{field='hmi_enabled';control=$hmi;observed=$true;checkbox_state=$hmiState},@{field='usb_enabled';control=$storage[2].control;observed=$true;checkbox_state=$storage[2].state},@{field='backlight_on_alarm';control=$backlight;observed=$true;checkbox_state=$backlightState},@{field='file_retention_limit_enabled';control=$storage[3].control;observed=$true;checkbox_state=$storage[3].state})
 return @{history_global_state=$state;native_evidence=@{profile='weinview-cn421-cmt-event-history-global-v2';pid=[int]$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture);exe_path=$Session.exe_path;dialog=$current;controls=$controls;observed_utc=[DateTime]::UtcNow.ToString('o');read_only=$true;global_input=$false;layout_reset=$false;full_history_settings_verified=$false;tab_control=$tab;tabs=$tabs;history_group=$group;page_sequence=@('事件','历史/控制','事件');storage_controls=$storage;storage_scope='three observed destinations and four original option states; other settings unverified'}}
}
function Assert-WeinviewEventHistorySettingsArguments($Arguments) {
 $allowed=@('workspace_root','project_path','output_path','expected_project_sha256','exe_path','hmi_enabled')
 if(@($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowed}).Count -or $Arguments.hmi_enabled -isnot [bool]){throw 'Event history settings requires only an explicit HMI boolean and standard project paths/SHA.'}
 foreach($key in @('workspace_root','project_path','output_path','expected_project_sha256')){if($Arguments.$key -isnot [string] -or !$Arguments.$key){throw 'Event history settings standard project paths/SHA required.'}}
 if($Arguments.expected_project_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Exact event history settings project SHA256 required.'}
 if([IO.Path]::GetExtension($Arguments.project_path) -ieq '.cmtp' -and !$Arguments.hmi_enabled){throw 'cMT HMI event-history disable is not yet qualified; reject before copying or opening the original IDE.'}
 if($Arguments.PSObject.Properties.Name -contains 'exe_path' -and ($Arguments.exe_path -isnot [string] -or !$Arguments.exe_path)){throw 'Optional event history installation path must be a nonempty string.'}
}
function Read-WeinviewEventHistoryRetentionState($Session) {
 # Settings-only protection: observe the original standard checkbox even when HMI OFF hides it.
 Assert-WeinviewPlcCandidateSession $Session
 $dialog=Get-WeinviewEventManager $Session
 $profile=Get-WeinviewEventProfile $Session;$cmt=($profile.format -ceq 'native-event-v4-hw72')
 if($cmt){$property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path);$tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32');$property.SelectTabExact($tab.Hwnd,'历史/控制')}
 $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($modals.Count -ne 1 -or $modals[0].Hwnd -ne $dialog.Hwnd){throw 'Unique event manager required for retention protection.'}
 $controls=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq 1895})
 if($controls.Count -ne 1 -or $controls[0].Class -cne 'Button' -or $controls[0].Title -cne '文件保留限制'){throw 'Original event retention checkbox absent or ambiguous; cannot verify preservation.'}
 $value=$Session.native.GetCheckboxState($controls[0].Hwnd)
 if($value -ne 0 -and $value -ne 1){throw 'Original retention checkbox state must be zero or one.'}
 Assert-WeinviewPlcCandidateSession $Session
 $current=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($current.Count -ne 1 -or $current[0].Hwnd -ne $dialog.Hwnd -or !$current[0].Enabled -or $current[0].Title -cne $profile.title){throw 'Event manager changed during retention protection read.'}
 if($cmt){$property.SelectTabExact($tab.Hwnd,'事件')}
 return @{profile=$(if($cmt){'weinview-cn421-cmt-event-history-retention-state-v1'}else{'weinview-cn421-native-event-history-retention-state-v1'});pid=[int]$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture);exe_path=$Session.exe_path;dialog=$dialog;control=$controls[0];checkbox_state=[int]$value;observed_utc=[DateTime]::UtcNow.ToString('o');read_only=$true}
}
function Set-WeinviewEventHistoryHmi($Session,[bool]$HmiEnabled,$Before) {
 $profile=Get-WeinviewEventProfile $Session;$cmt=($profile.format -ceq 'native-event-v4-hw72');$label=if($cmt){'启用'}else{'保存到 HMI'}
 $fresh=Read-WeinviewEventHistoryGlobalState $Session
 foreach($field in @('hmi_enabled','usb_enabled','backlight_on_alarm','file_retention_limit_enabled')){if($fresh.history_global_state[$field] -cne $Before.history_global_state[$field]){throw 'Event history global state changed before HMI action.'}}
 if($cmt){Assert-WeinviewCmtHistoryStoragePreservation $Before $fresh}
 $dialog=$fresh.native_evidence.dialog;$changed=($fresh.history_global_state.hmi_enabled -ne $HmiEnabled)
 if($changed){
  if($cmt){$property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path);$tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32');$property.SelectTabExact($tab.Hwnd,'历史/控制')}
  $wear=@{acknowledged=$false;notice=0;intent_path=$null}
  $Session.native.ClickButton($dialog.Hwnd,1744,$label);$readiness=@{since=$null}
  $observed=WaitFor {
   Assert-WeinviewPlcCandidateSession $Session
   $top=@($Session.native.EnumTopWindows());$modals=@($top|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   $manager=@($modals|Where-Object {$_.Hwnd -eq $dialog.Hwnd -and $_.Title -ceq $profile.title})
   if($manager.Count -ne 1){throw 'Original event manager changed after HMI action.'}
   $other=@($modals|Where-Object {$_.Hwnd -ne $dialog.Hwnd})
   if($other.Count){
    if(!$HmiEnabled -or $Before.history_global_state.hmi_enabled -or $other.Count -ne 1 -or $other[0].Title -cne 'Easy Builder Pro' -or !$other[0].Enabled){throw 'Unknown modal after HMI action; no acknowledgement.'}
    if($wear.acknowledged){if($other[0].Hwnd -ne $wear.notice){throw 'New modal after the single wear acknowledgement.'};return $null}
    $notice=$other[0];$qt=@($Session.native.EnumChildControls($notice.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})
    if($qt.Count -ne 1){throw 'Unique original wear-warning Qt child required.'}
    $nodes=@([EventDialogControls]::InspectWearWarning($Session.native,$notice.Hwnd,$dialog.Hwnd,$qt[0].Hwnd,$profile.format))
    $wearPath=Join-Path ([IO.Path]::GetDirectoryName($Session.output_path)) ([IO.Path]::GetFileNameWithoutExtension($Session.output_path)+'.event-history-wear-'+[guid]::NewGuid().ToString('N')+'.json')
    $intent=@{profile='weinview-cn421-native-event-history-wear-warning-v1';pid=[int]$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture);exe_path=$Session.exe_path;project_path=$Session.output_path;project_sha256=(Hash $Session.output_path);manager=$manager[0];notice=$notice;qt=$qt[0];nodes=$nodes;phase='before_single_acknowledgement';future_warning_toggle_changed=$false;global_input=$false;layout_reset=$false;observed_utc=[DateTime]::UtcNow.ToString('o')}
    WritePrivateJson $wearPath $intent
    $state=[EventDialogControls]::AcknowledgeWearWarning($Session.native,[int]$Session.process.Id,$notice.Hwnd,$dialog.Hwnd,$qt[0].Hwnd,$profile.format)
    $wear.acknowledged=$true;$wear.notice=$notice.Hwnd;$wear.intent_path=$wearPath
    WritePrivateJson ($wearPath+'.ack.json') @{intent_path=$wearPath;intent_sha256=(Hash $wearPath);notice=$notice.Hwnd;manager=$dialog.Hwnd;qt=$qt[0].Hwnd;action_state=$state;semantic_action_invoked=$true;future_warning_toggle_changed=$false;global_input=$false;layout_reset=$false;observed_utc=[DateTime]::UtcNow.ToString('o')}
    return $null
   }
   if(!$manager[0].Enabled){return $null}
   $now=Read-WeinviewEventHistoryGlobalState $Session
   if($now.native_evidence.dialog.Hwnd -ne $dialog.Hwnd){throw 'Event history manager changed after HMI action.'}
   if($now.history_global_state.hmi_enabled -eq $HmiEnabled){if(!$cmt){return $now};if($null -eq $readiness.since){$readiness.since=[DateTime]::UtcNow};if(([DateTime]::UtcNow-$readiness.since).TotalMilliseconds -ge 500){return $now}}else{$readiness.since=$null}
  } 8
 }else{$observed=$fresh}
 foreach($field in @('usb_enabled','backlight_on_alarm')){if($observed.history_global_state[$field] -cne $Before.history_global_state[$field]){throw 'Untouched event global checkbox changed.'}}
 if($cmt){Assert-WeinviewCmtHistoryStoragePreservation $Before $observed}
 $result=@{changed=[bool]$changed;click_posted=[bool]$changed;control_id=1744;control_label=$label;dialog_hwnd=$dialog.Hwnd;requested_hmi_enabled=$HmiEnabled;before_hmi_enabled=[bool]$Before.history_global_state.hmi_enabled;observed_hmi_enabled=[bool]$observed.history_global_state.hmi_enabled}
 if($cmt){$result.cmt_flash_write_limit=@{control_id=1025;before_state=[int]$Before.native_evidence.storage_controls[4].state;observed_state=[int]$observed.native_evidence.storage_controls[4].state;native_protective_default_on_enable=(!$Before.history_global_state.hmi_enabled -and $observed.history_global_state.hmi_enabled -and $Before.native_evidence.storage_controls[4].state -eq 0 -and $observed.native_evidence.storage_controls[4].state -eq 1);adapter_input_performed=$false}}
 return $result
}
function Assert-WeinviewCmtHistoryStoragePreservation($Before,$After) {
 if($Before.native_evidence.profile -cne 'weinview-cn421-cmt-event-history-global-v2' -or $After.native_evidence.profile -cne $Before.native_evidence.profile){throw 'Original cMT storage read profiles required'}
 $left=@($Before.native_evidence.storage_controls);$right=@($After.native_evidence.storage_controls);if($left.Count -ne 7 -or $right.Count -ne 7){throw 'All seven original cMT storage states required'}
 for($i=0;$i -lt 7;$i++){
  $nativeDefault=($i -eq 4 -and !$Before.history_global_state.hmi_enabled -and $After.history_global_state.hmi_enabled -and $left[$i].state -eq 0 -and $right[$i].state -eq 1)
  if($left[$i].field -cne $right[$i].field -or $left[$i].native_kind -cne $right[$i].native_kind -or ($left[$i].state -ne $right[$i].state -and !$nativeDefault) -or $left[$i].control.Id -ne $right[$i].control.Id -or $left[$i].control.Title -cne $right[$i].control.Title){throw 'Original cMT storage/startup/control state differs outside native protective flash default'}
 }
}
function Open-WeinviewEvents($Session) {
 Assert-WeinviewPlcCandidateSession $Session
 $activated=$false
 if(!$Session.owned_ribbon_background){
 $shell=New-Object -ComObject WScript.Shell
 try {$activated=$shell.AppActivate([int]$Session.process.Id)} finally {[Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)|Out-Null}
 $null=$Session.native.EnumTopWindows()
 }
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected modal before event manager.'}
 $semantic=New-Object PLCCode.Weinview.NativeSemanticControls($Session.native)
 $tab=Invoke-WeinviewObjectRibbon $Session $semantic '资料/历史';Start-Sleep -Milliseconds 150
 $entry=Invoke-WeinviewObjectRibbon $Session $semantic '事件登录'
 $Session.event_ribbon_evidence=@{tab=$tab;entry=$entry;pid_activation=$activated;global_input=$false;layout_reset=$false}
 $null=Get-WeinviewEventCount $Session
}
function Acknowledge-WeinviewEventSuccess($Session) {
 $notice=Get-WeinviewEventDialog $Session 'EasyBuilder Pro'
 $body=$Session.native.FindUniqueControl($notice.Hwnd,65535,'Static','成功')
 if($Session.native.GetControlText($body.Hwnd,64) -cne '成功'){throw 'Exact native event success required.'}
 $Session.native.ClickButton($notice.Hwnd,2,'确定')
 $null=Get-WeinviewEventManager $Session
}
function Export-WeinviewEvents($Session,[string]$Prefix) {
 $profile=Get-WeinviewEventProfile $Session
 $count=Get-WeinviewEventCount $Session;$dialog=Get-WeinviewEventManager $Session;$path=$Prefix+'.xls'
 if(Test-Path -LiteralPath $path){throw 'Fresh native event export path required.'}
 $buttons=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Id -eq 2278 -and $_.Class -ceq 'Button' -and $_.Title -ceq '导出...'})
 if($buttons.Count -ne 1){throw 'Unique native event export element required.'}
 if($count -eq 0 -and !$buttons[0].Enabled){
  if([int]$Session.native_host_port -le 0){throw 'The actual HMI model is required before preparing its empty event table.'}
  if(!(Get-Command Invoke-WeinviewNativeHostRead -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'NativeHostRead.ps1')}
  $metadata=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getAllData
  $modelName=[string]$metadata.metadata.sys_params.model.model_name
  $config=New-Object Xml.XmlDocument;$config.XmlResolver=$null;$config.Load((Join-Path ([IO.Path]::GetDirectoryName($Session.exe_path)) 'Config.xml'))
  $models=@($config.SelectNodes('/Config/Machines/Series/Model')|Where-Object {$_.GetAttribute('name') -ceq $modelName})
  if(!$modelName -or $models.Count -ne 1){throw 'Actual HMI model must match one installed configuration row.'}
  $hardwareId=[string]$models[0].GetAttribute('id')
  $null=Invoke-WeinviewEventCodec ($Prefix+'.empty') @{operation='native-empty';output=$path;hardware_id=$hardwareId;format=$profile.format}
  $origin='native_count_zero_with_derived_schema'
 }else{
  $Session.native.ClickButton($dialog.Hwnd,2278,'导出...')
  $save=Get-WeinviewEventDialog $Session '另存为' $dialog.Hwnd
  $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
  # The dialog can be visible before its standard file-type control is enabled.
  # Reobserve this exact owned dialog, retaining strict filter and identity checks.
  $comboAttempts=@();$filterDeadline=[DateTime]::UtcNow.AddSeconds(4)
  do {
   $current=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Hwnd -eq $save.Hwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq '另存为'})
   if($current.Count -ne 1){throw 'Native event save dialog identity changed.'}
   $comboEvidence=@();$filters=@()
   foreach($control in $Session.native.EnumChildControls($save.Hwnd)){
    if(!$control.Visible -or $control.Class -cne 'ComboBox'){continue}
    if(!$control.Enabled){$comboEvidence+=@{hwnd=$control.Hwnd;id=$control.Id;enabled=$false;readable=$false;error='Control not ready'};continue}
    try {$selected=$property.ComboSelected($control.Hwnd);$items=@($property.ComboItems($control.Hwnd))}
    catch {$comboEvidence+=@{hwnd=$control.Hwnd;id=$control.Id;enabled=$true;readable=$false;error=$_.Exception.Message};continue}
    $comboEvidence+=@{hwnd=$control.Hwnd;id=$control.Id;enabled=$true;readable=$true;selected=$selected;items=$items}
    if($selected -ceq 'Excel Files (*.xls)'){if($items.Count -ne 1 -or $items[0] -cne 'Excel Files (*.xls)'){throw 'Multiple or differing native XLS filters.'};$filters+=,$control}
   }
   $comboAttempts+=@{utc=[DateTime]::UtcNow.ToString('o');dialog_hwnd=$save.Hwnd;controls=$comboEvidence;exact_filter_count=$filters.Count}
   $Session.event_export_combo_evidence=$comboAttempts
   [IO.File]::WriteAllText(($Prefix+'.save-combos.json'),($comboAttempts|ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
   if($filters.Count -gt 1){throw 'Unique actual XLS save filter required.'}
   if($filters.Count -eq 1){break}
   if([DateTime]::UtcNow -ge $filterDeadline){throw 'Unique actual XLS save filter did not become ready within4 seconds.'}
   Start-Sleep -Milliseconds 75
  }while($true)
  $edit=$Session.native.FindUniqueControlWithoutLabel($save.Hwnd,1001,'Edit');$Session.native.SetControlText($edit.Hwnd,$path)
  if($Session.native.GetControlText($edit.Hwnd,32768) -cne $path){throw 'Event export filename differs.'}
  $Session.native.ClickButton($save.Hwnd,1,'保存(&S)')
  $null=WaitFor {if((Test-Path -LiteralPath $path -PathType Leaf) -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Hwnd -eq $save.Hwnd}).Count){return $true}} 8
  Acknowledge-WeinviewEventSuccess $Session;$origin='native_export'
 }
 $table=Invoke-WeinviewEventCodec ($Prefix+'.inspect') @{operation='inspect';input=$path;output=($Prefix+'.table.json')}
 if($table.data_rows -ne $count -or $table.column_count -ne $profile.column_count -or $table.format -cne $profile.format){throw 'Native count/table/profile differs.'}
 return @{events_sha256=(Hash $path);event_count=$count;table=$table;native_evidence_path=$path;table_evidence_path=($Prefix+'.table.json');table_origin=$origin}
}
function Close-WeinviewEvents($Session) {
 $profile=Get-WeinviewEventProfile $Session
 $dialog=Get-WeinviewEventManager $Session;$Session.native.ClickButton($dialog.Hwnd,$profile.close_id,$profile.close_label)
 $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 5
}
function Prepare-WeinviewEventAppend($Before,$Items,[string]$Prefix) {
 $base=$Before.native_evidence_path;$expected=$Before.events_sha256
 if($Before.event_count+$Items.Count -gt 10000){throw 'Native event capacity exceeded.'}
 $cmt=($Before.table.format -ceq 'native-event-v4-hw72')
 if((!$cmt -and $Before.table.format -cne 'native-event-v3-hw49') -or $Before.table.column_count -ne $(if($cmt){179}else{170})){throw 'Exact observed event table profile required.'}
 $defaultName=if($cmt){'default.cmt.row.json'}else{'default.row.json'}
 $default=Get-Content -LiteralPath (Join-Path $PSScriptRoot ('EventTableCodec/schema/'+$defaultName)) -Raw -Encoding UTF8|ConvertFrom-Json
 $triggerAddress=if($cmt){132}else{131}
 $triggerDevice=if($cmt){128}else{127};$triggerType=if($cmt){129}else{128}
 foreach($spec in @(@(3,'设备名称 (读取地址)'),@(4,'设备类型 (读取地址)'),@(7,'地址 (读取地址)'),@($triggerDevice,'设备名称 (触发条件)'),@($triggerType,'设备类型 (触发条件)'),@($triggerAddress,'地址 (触发条件)'))){if($Before.table.all_cells[1][[int]$spec[0]] -cne [string]$spec[1]){throw 'Observed native event address column changed.'}}
 $index=0
 foreach($item in $Items){
  # Preserve all old rows. New messages use the observed native font column
  # and Microsoft YaHei so Chinese content compiles without Arial glyph warnings.
  if($Before.table.all_cells[1][23] -cne '字体' -or $default.types[23] -ne 1){throw 'Observed native event font column required.'}
  $row=@{values=@($default.values);types=@($default.types)}
  $row.values[3]=$item.device;$row.values[4]=$item.address_type;$row.values[7]=$item.address
  $row.values[$triggerDevice]=$item.device;$row.values[$triggerType]=$item.address_type;$row.values[$triggerAddress]=$item.address;$row.values[20]=$item.content
  if($item.trigger -ceq 'word_gt'){$row.values[2]='Word';$row.values[9]='16-bit Signed';$row.values[18]='wd: >';$row.values[19]=[string]$item.threshold}
  $row.values[23]='Microsoft YaHei'
  $next=$Prefix+'.'+$index+'.xls'
  $proof=Invoke-WeinviewEventCodec ($Prefix+'.'+$index) @{operation='native-append';base=$base;output=$next;receipt=($Prefix+'.'+$index+'.mutation.json');expected_sha256=$expected;row=$row}
  if(!$proof.all_unaffected_cells_and_types_preserved -or !$proof.metadata_preserved){throw 'Complete old table protection required.'}
  $base=$next;$expected=$proof.output_sha256;$index++
 }
 return @{path=$base;sha256=$expected;old_count=$Before.event_count;new_count=($Before.event_count+$Items.Count);all_old_rows_preserved=$true}
}
function Import-WeinviewEvents($Session,$Candidate) {
 if((Hash $Candidate.path) -cne $Candidate.sha256 -or (Get-WeinviewEventCount $Session) -ne $Candidate.old_count -or !$Candidate.all_old_rows_preserved){throw 'Protected native replacement binding differs.'}
 $manager=Get-WeinviewEventManager $Session;$Session.native.ClickButton($manager.Hwnd,7,'导入...')
 $open=Get-WeinviewEventDialog $Session '打开' $manager.Hwnd
 $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 if($property.ComboSelected(($Session.native.FindUniqueControlWithoutLabel($open.Hwnd,1136,'ComboBox')).Hwnd) -cne 'Excel Files (*.xls)'){throw 'Exact native XLS import filter required.'}
 $edit=$Session.native.FindUniqueControlWithoutLabel($open.Hwnd,1148,'Edit');$Session.native.SetControlText($edit.Hwnd,$Candidate.path)
 if($Session.native.GetControlText($edit.Hwnd,32768) -cne $Candidate.path -or (Hash $Candidate.path) -cne $Candidate.sha256){throw 'Protected import path/hash differs.'}
 $Session.native.ClickButton($open.Hwnd,1,'打开(&O)')
 if($Candidate.old_count -gt 0){$notice=Get-WeinviewEventDialog $Session '注意';$null=[EventDialogControls]::InspectOrConfirm($Session.native,$Session.main.Hwnd,$manager.Hwnd,$notice.Hwnd,$Candidate.old_count,$true,(Get-WeinviewEventProfile $Session).format)}
 Acknowledge-WeinviewEventSuccess $Session
 if((Get-WeinviewEventCount $Session) -ne $Candidate.new_count){throw 'Native import event count differs.'}
}
function Assert-WeinviewEventTablesEqual([string]$Expected,[string]$Actual,[string]$Prefix) {
 $proof=Invoke-WeinviewEventCodec $Prefix @{operation='compare';before=$Expected;after=$Actual;output=($Prefix+'.comparison.json')}
 if(!$proof.metadata_and_headers_equal -or !$proof.all_old_rows_preserved -or !$proof.row_order_preserved -or $proof.before_rows -ne $proof.after_rows -or @($proof.added_rows).Count -or @($proof.missing_rows).Count){throw 'Full native event values/types/order differ; no acceptance.'}
 return $proof
}

function Get-WeinviewEventSummary($Snapshot) {
 $cmt=($Snapshot.table.format -ceq 'native-event-v4-hw72')
 $shift=if($cmt){1}else{0}
 $rows=@($Snapshot.table.all_cells);$items=@()
 for($i=2;$i -lt $rows.Count -and $i -lt 102;$i++){
  $row=$rows[$i];$items+=@{index=($i-1);category=$row[0];priority=$row[1];address_kind=$row[2];device=$row[3];address_type=$row[4];address=$row[7];trigger=$row[18];content=$row[20];trigger_device=$row[127+$shift];trigger_address_type=$row[128+$shift];trigger_address=$row[131+$shift]}
 }
 return @{format=$Snapshot.table.format;column_count=$Snapshot.table.column_count;total_count=$Snapshot.event_count;returned_count=$items.Count;offset=0;limit=100;events=$items;full_table_path=$Snapshot.table_evidence_path;full_table_sha256=(Hash $Snapshot.table_evidence_path);table_origin=$Snapshot.table_origin;full_typed_artifact=$true}
}
