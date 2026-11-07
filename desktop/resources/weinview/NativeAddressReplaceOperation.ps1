# One original-vendor Find Address / Replace All transaction. The caller owns
# the fresh project copy, native save, close, reopen, and final hash checks.
function Assert-WeinviewAddressReplaceArguments($Arguments) {
 $required=@('project_path','output_path','expected_project_sha256','address_kind','device_name','address_type','address','target_device_name','target_address_type','target_address')
 $optional=@('workspace_root','exe_path','scope','window_number','expected_match_count','address_end')
 $names=@($Arguments.PSObject.Properties.Name)
 if(@($required|Where-Object {$_ -cnotin $names}).Count -or @($names|Where-Object {$_ -cnotin ($required+$optional)}).Count){throw 'Exact native address replacement arguments required.'}
 foreach($field in $required){if($Arguments.$field -isnot [string] -or [string]::IsNullOrWhiteSpace($Arguments.$field)){throw ('Nonempty address replacement string required: '+$field)}}
 foreach($field in @('workspace_root','exe_path','scope')){if($field -cin $names -and $Arguments.$field -isnot [string]){throw ('Address replacement '+$field+' must be a string.')}}
 if($Arguments.address_kind -cnotin @('bit','word')){throw 'Native raw address kind must be bit or word.'}
 foreach($field in @('device_name','address_type','address','target_device_name','target_address_type','target_address')){
  $value=[string]$Arguments.$field
  if($value -cne $value.Trim() -or $value -match '[\x00-\x1f\x7f]' -or $value.Length -gt 128){throw ('Exact single-line native raw address component required: '+$field)}
 }
 # Exact addresses retain the vendor's driver-specific raw-address handling.
 if($Arguments.device_name -ceq $Arguments.target_device_name -and $Arguments.address_type -ceq $Arguments.target_address_type -and $Arguments.address -ceq $Arguments.target_address){throw 'Source and target native raw addresses must differ.'}
 $scope='project';if($Arguments.PSObject.Properties.Name -ccontains 'scope'){$scope=[string]$Arguments.scope}
 if($scope -cnotin @('project','window')){throw 'Native address replacement scope must be project or window.'}
 $windowNumber=0
 if($scope -ceq 'window'){
  if('window_number' -cnotin $names -or $Arguments.window_number -isnot [int] -and $Arguments.window_number -isnot [long]){throw 'Window scope requires an integer window_number.'}
  $windowNumber=[int]$Arguments.window_number
  if($windowNumber -lt 10 -or $windowNumber -gt 1999){throw 'Window scope requires existing native window 10..1999.'}
 }elseif('window_number' -cin $names){throw 'window_number is only accepted for window scope.'}
 $expected=$null
 if('expected_match_count' -cin $names){
  if($Arguments.expected_match_count -isnot [int] -and $Arguments.expected_match_count -isnot [long]){throw 'expected_match_count must be a nonnegative integer.'}
  $expected=[long]$Arguments.expected_match_count
  if($expected -lt 0){throw 'expected_match_count must be nonnegative.'}
 }
 $range=$false;$sourceEnd=$null;$targetEnd=$null;$shift=0
 if('address_end' -cin $names){
  $range=$true
  if($Arguments.address_end -isnot [string] -or $Arguments.address_end -cnotmatch '^(0|[1-9][0-9]{0,3})$'){throw 'Range address_end requires canonical decimal Local HMI address 0..8999.'}
  $wantedType=if($Arguments.address_kind -ceq 'bit'){'LB'}else{'LW'}
  if($Arguments.device_name -cne 'Local HMI' -or $Arguments.target_device_name -cne 'Local HMI' -or $Arguments.address_type -cne $wantedType -or $Arguments.target_address_type -cne $wantedType){throw 'Native range shift requires same-kind Local HMI LB or LW source and target.'}
  foreach($field in @('address','target_address')){if($Arguments.$field -cnotmatch '^(0|[1-9][0-9]{0,3})$'){throw ('Range requires canonical decimal Local HMI address 0..8999: '+$field)}}
  $start=[int]$Arguments.address;$sourceEnd=[int]$Arguments.address_end;$targetStart=[int]$Arguments.target_address
  if($start -gt 8999 -or $sourceEnd -gt 8999 -or $targetStart -gt 8999 -or $sourceEnd -lt $start){throw 'Native range source and target starts must be within 0..8999 and source end must follow start.'}
  $shift=$targetStart-$start;$targetEnd=$targetStart+($sourceEnd-$start)
  if($shift -eq 0 -or $targetEnd -gt 8999 -or !($sourceEnd -lt $targetStart -or $targetEnd -lt $start)){throw 'Native range shift requires disjoint source and target spans within 0..8999.'}
  $sourceEnd=[string]$sourceEnd;$targetEnd=[string]$targetEnd
 }
 return [pscustomobject]@{scope=$scope;window_number=$windowNumber;expected_match_count=$expected;range_enabled=$range;source_end=$sourceEnd;target_end=$targetEnd;shift=$shift}
}
function Select-WeinviewAddressSearchCanvas($Session,$Contract) {
 if(!$Session.native_host_port){throw 'Native address search requires the owned native host.'}
 $null=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getWindows
 $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible -and $_.Enabled -and $_.Pid -eq $Session.process.Id})
 if(!$views.Count){throw 'Ready native project has no visible enabled document canvas.'}
 if($Contract.scope -ceq 'window'){
  $pattern='^'+[regex]::Escape([string]$Contract.window_number)+'\s*-\s*'
  $targetViews=@($views|Where-Object {$_.Title -cmatch $pattern})
  if($targetViews.Count -gt 1){throw 'Requested native document canvas is ambiguous.'}
  # Find/Replace selects its explicit window scope independently of the active
  # document. A closed target needs no additional editor window or UI gesture.
  if($targetViews.Count -eq 1){$views=$targetViews}
 }
 if($views.Count -gt 1){
  $main=@($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Pid -eq $Session.process.Id -and $_.Class -ceq 'EasyBuilderPro'})
  if($main.Count -ne 1){throw 'Owned main unavailable for active document selection.'}
  $title=[string]$main[0].Title
  $views=@($views|Where-Object {$title -cmatch ('\[\s*'+[regex]::Escape([string]$_.Title)+'\s*\]\s*$')})
 }
 if($views.Count -ne 1){throw 'Exact native document canvas is absent or ambiguous.'}
 return [pscustomobject]@{canvas_hwnd=[long]$views[0].Hwnd;canvas_title=[string]$views[0].Title;selection_method='owned_visible_document_canvas'}
}
function Open-WeinviewAddressSearchDialog($Session,[long]$CanvasHwnd) {
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected native modal before Find Address entry.'}
 $canvas=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Hwnd -eq $CanvasHwnd})
 if($canvas.Count -ne 1){throw 'Selected native document canvas changed before Find Address entry.'}
 $null=$Session.native.ActivateOwnedDocument([long]$Session.main.Hwnd,$CanvasHwnd,[string]$canvas[0].Title)
 $command=[PLCCode.Weinview.NativeRecoveryMenuControls]::PrepareFindAddressFromMainAccelerator([long]$Session.main.Hwnd,[int]$Session.process.Id,[string]$Session.process.Path)
 Start-Sleep -Milliseconds 200
 $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
 if($modals.Count -gt 1 -or $modals.Count -eq 1 -and ($modals[0].Pid -ne $Session.process.Id -or $modals[0].Title -cne '寻找/替换')){throw 'Unexpected native modal after main Find Address entry.'}
 if(!$modals.Count){$command=[PLCCode.Weinview.NativeRecoveryMenuControls]::OpenFindAddressFromAccelerator($CanvasHwnd,[int]$Session.process.Id,[string]$Session.process.Path)}
 $dialog=WaitFor {
  $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if($modals.Count -gt 1){throw 'Multiple native modals after Find Address entry.'}
  if($modals.Count -eq 1 -and $modals[0].Pid -eq $Session.process.Id -and $modals[0].Title -ceq '寻找/替换' -and $modals[0].Enabled){return $modals[0]}
 } 10
 if(!$dialog){throw 'Native Find Address dialog did not open.'}
 return [pscustomobject]@{dialog=$dialog;command=$command}
}
function Find-WeinviewNativeRawAddress($Session,$Dialog,$Arguments,$Contract,[bool]$Target) {
 if($Target){$device=[string]$Arguments.target_device_name;$area=[string]$Arguments.target_address_type;$address=[string]$Arguments.target_address;$replacementDevice=[string]$Arguments.device_name;$replacementArea=[string]$Arguments.address_type;$replacementAddress=[string]$Arguments.address}
 else{$device=[string]$Arguments.device_name;$area=[string]$Arguments.address_type;$address=[string]$Arguments.address;$replacementDevice=[string]$Arguments.target_device_name;$replacementArea=[string]$Arguments.target_address_type;$replacementAddress=[string]$Arguments.target_address}
 $candidate=[PLCCode.Weinview.Research.NativePropertyCandidate]::new([int]$Session.process.Id,[long]$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.process.Path)
 if($Contract.range_enabled){
  $addressEnd=if($Target){[string]$Contract.target_end}else{[string]$Contract.source_end}
  $queryShift=if($Target){-[int]$Contract.shift}else{[int]$Contract.shift}
  [PLCCode.Weinview.NativeAddressReplaceControls]::ConfigureRange($Session.native,$candidate,[long]$Dialog.Hwnd,[int]$Session.process.Id,[string]$Arguments.address_kind,$device,$area,$address,$addressEnd,$replacementDevice,$replacementArea,$replacementAddress,$queryShift,[string]$Contract.scope,[int]$Contract.window_number)
 }else{[PLCCode.Weinview.NativeAddressReplaceControls]::Configure($Session.native,$candidate,[long]$Dialog.Hwnd,[int]$Session.process.Id,[string]$Arguments.address_kind,$device,$area,$address,$replacementDevice,$replacementArea,$replacementAddress,[string]$Contract.scope,[int]$Contract.window_number)}
 $found=[PLCCode.Weinview.NativeAddressReplaceControls]::Find($Session.native,[long]$Dialog.Hwnd,[int]$Session.process.Id)
 if($null -eq $found -or $null -eq $found.match_count -or [long]$found.match_count -lt 0 -or @($found.matches).Count -ne [long]$found.match_count){throw 'Native Find Address result count or rows unavailable.'}
 return $found
}
function Convert-WeinviewNativeRangeShiftMatches($Matches,[string]$Area,[int]$Start,[int]$End,[int]$Shift) {
 $pattern='(?<![A-Za-z0-9_])'+[regex]::Escape($Area)+'-(?<value>0|[1-9][0-9]*)(?![A-Za-z0-9_])'
 $result=@()
 foreach($row in @($Matches)){
  $description=[string]$row.description;$found=[regex]::Matches($description,$pattern)
  if($found.Count -ne 1){throw ('Native range Find row must contain exactly one actual '+$Area+' decimal address before Replace All: '+$description)}
  $value=0
  if(![int]::TryParse([string]$found[0].Groups['value'].Value,[ref]$value) -or $value -lt $Start -or $value -gt $End){throw ('Native range Find row address is outside the requested span before Replace All: '+$description)}
  $number=$found[0].Groups['value'];$updated=$description.Substring(0,$number.Index)+($value+$Shift).ToString([Globalization.CultureInfo]::InvariantCulture)+$description.Substring($number.Index+$number.Length)
  $result+=,@{location=[string]$row.location;description=$updated}
 }
 return $result
}
function Assert-WeinviewNativeRangeMatchMultiset($Actual,$Expected) {
 $counts=[Collections.Generic.Dictionary[string,int]]::new([StringComparer]::Ordinal)
 foreach($row in @($Expected)){
  $location=[string]$row.location;$description=[string]$row.description
  $key=$location.Length.ToString([Globalization.CultureInfo]::InvariantCulture)+':'+$location+$description.Length.ToString([Globalization.CultureInfo]::InvariantCulture)+':'+$description
  if(!$counts.ContainsKey($key)){$counts[$key]=0};$counts[$key]++
 }
 foreach($row in @($Actual)){
  $location=[string]$row.location;$description=[string]$row.description
  $key=$location.Length.ToString([Globalization.CultureInfo]::InvariantCulture)+':'+$location+$description.Length.ToString([Globalization.CultureInfo]::InvariantCulture)+':'+$description
  if(!$counts.ContainsKey($key) -or $counts[$key] -eq 0){throw ('Native range target Find row differs from shifted source and unchanged target-before rows: '+$location+' / '+$description)}
  $counts[$key]--
 }
 foreach($remaining in $counts.Values){if($remaining -ne 0){throw 'Native range target Find multiset lacks an expected shifted or original reference.'}}
}
function Invoke-WeinviewNativeAddressReplaceOnce($Session,$Arguments,$Contract,[ref]$ActiveDialog,[ref]$ReplaceTriggered) {
 $canvas=Select-WeinviewAddressSearchCanvas $Session $Contract
 $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
 $dialog=$entry.dialog;$ActiveDialog.Value=$dialog
 $sourceBefore=Find-WeinviewNativeRawAddress $Session $dialog $Arguments $Contract $false
 $sourceCount=[long]$sourceBefore.match_count
 if($null -ne $Contract.expected_match_count -and $sourceCount -ne [long]$Contract.expected_match_count){throw ('Native address match count differs from expected_match_count: '+$sourceCount)}
 $targetBefore=Find-WeinviewNativeRawAddress $Session $dialog $Arguments $Contract $true
 $targetCount=[long]$targetBefore.match_count
 $shifted=@()
 if($Contract.range_enabled){
  $shifted=@(Convert-WeinviewNativeRangeShiftMatches $sourceBefore.matches ([string]$Arguments.address_type) ([int]$Arguments.address) ([int]$Contract.source_end) ([int]$Contract.shift))
  $null=@(Convert-WeinviewNativeRangeShiftMatches $targetBefore.matches ([string]$Arguments.target_address_type) ([int]$Arguments.target_address) ([int]$Contract.target_end) 0)
 }
 if($sourceCount){
  $selectedSource=Find-WeinviewNativeRawAddress $Session $dialog $Arguments $Contract $false
  if([long]$selectedSource.match_count -ne $sourceCount){throw 'Native source search changed before Replace All.'}
  if($Contract.range_enabled){Assert-WeinviewNativeRangeMatchMultiset $selectedSource.matches $sourceBefore.matches}
  $ReplaceTriggered.Value=$true
  [PLCCode.Weinview.NativeAddressReplaceControls]::ReplaceAll($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)
 }
 $sourceAfter=Find-WeinviewNativeRawAddress $Session $dialog $Arguments $Contract $false
 $targetAfter=Find-WeinviewNativeRawAddress $Session $dialog $Arguments $Contract $true
 if([long]$sourceAfter.match_count -ne 0 -or [long]$targetAfter.match_count -ne ($targetCount+$sourceCount)){throw ('Native address replacement post-counts differ. source_before='+$sourceCount+'; source_after='+$sourceAfter.match_count+'; target_before='+$targetCount+'; target_after='+$targetAfter.match_count+'; actual_target='+(ConvertTo-Json -InputObject @($targetAfter.matches) -Depth 5 -Compress))}
 if($Contract.range_enabled){Assert-WeinviewNativeRangeMatchMultiset $targetAfter.matches (@($targetBefore.matches)+@($shifted))}
 [PLCCode.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)
 $ActiveDialog.Value=$null;$ReplaceTriggered.Value=$false
 $result=@{address_kind=[string]$Arguments.address_kind;source=@{device_name=[string]$Arguments.device_name;address_type=[string]$Arguments.address_type;address=[string]$Arguments.address};target=@{device_name=[string]$Arguments.target_device_name;address_type=[string]$Arguments.target_address_type;address=[string]$Arguments.target_address};scope=[string]$Contract.scope;before_count=$sourceCount;target_before_count=$targetCount;after_source_count=[long]$sourceAfter.match_count;after_target_count=[long]$targetAfter.match_count;replaced_count=$sourceCount;applied_references=$sourceCount;before_matches=@($sourceBefore.matches|ForEach-Object {@{location=[string]$_.location;description=[string]$_.description}});native_scope='exact_raw_address';tag_and_range_replacement_supported=$false}
 if($Contract.range_enabled){
  $result.source.address_end=[string]$Contract.source_end;$result.target.address_end=[string]$Contract.target_end
  $result.native_scope='raw_address_range_shift';$result.Remove('tag_and_range_replacement_supported')
  $result.range_replacement_supported=$true;$result.tag_replacement_supported=$false;$result.shift=[int]$Contract.shift
  $result.shifted_references_verified=$true
  $result.target_before_matches=@($targetBefore.matches|ForEach-Object {@{location=[string]$_.location;description=[string]$_.description}})
  $result.after_matches=@($targetAfter.matches|ForEach-Object {@{location=[string]$_.location;description=[string]$_.description}})
 }
 if($Contract.scope -ceq 'window'){$result.window_number=[int]$Contract.window_number}
 return $result
}
function Get-WeinviewNativeAddressCountKey($Arguments,$Contract,[bool]$Target) {
 $device=if($Target){[string]$Arguments.target_device_name}else{[string]$Arguments.device_name}
 $area=if($Target){[string]$Arguments.target_address_type}else{[string]$Arguments.address_type}
 $address=if($Target){[string]$Arguments.target_address}else{[string]$Arguments.address}
 $parts=@([string]$Contract.scope,[string]([int]$Contract.window_number),[string]$Arguments.address_kind,$device,$area,$address)
 if($Contract.range_enabled){$end=if($Target){[string]$Contract.target_end}else{[string]$Contract.source_end};$parts+=,$end}
 return ($parts -join [char]31)
}
function Get-WeinviewNativeAddressQueryCounts($Session,[object[]]$Queries,[ref]$MatchRows=$null) {
 $counts=[Collections.Generic.Dictionary[string,long]]::new([StringComparer]::Ordinal)
 if($null -ne $MatchRows){$MatchRows.Value=[Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)}
 if(!$Queries.Count){return ,$counts}
 $canvas=Select-WeinviewAddressSearchCanvas $Session $Queries[0].contract
 $entry=Open-WeinviewAddressSearchDialog $Session ([long]$canvas.canvas_hwnd)
 $dialog=$entry.dialog
 try{
  foreach($query in $Queries){
   if($counts.ContainsKey([string]$query.key)){continue}
   $found=Find-WeinviewNativeRawAddress $Session $dialog $query.arguments $query.contract ([bool]$query.target)
   $counts.Add([string]$query.key,[long]$found.match_count)
   if($null -ne $MatchRows){$MatchRows.Value.Add([string]$query.key,[object[]]@($found.matches|ForEach-Object {@{location=[string]$_.location;description=[string]$_.description}}))}
  }
 }finally{
  if($dialog){[PLCCode.Weinview.NativeAddressReplaceControls]::Close($Session.native,[long]$dialog.Hwnd,[int]$Session.process.Id)}
 }
 return ,$counts
}
