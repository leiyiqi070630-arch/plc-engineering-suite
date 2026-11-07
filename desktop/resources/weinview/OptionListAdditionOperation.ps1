# Common Option List request normalization. Native creation/readback is appended
# only after the installed EasyBuilder Pro control profile is observed.
function Assert-WeinviewOptionListInputs($Object,[int]$CanvasWidth,[int]$CanvasHeight) {
 if($null -eq $Object -or $CanvasWidth -lt 1 -or $CanvasHeight -lt 1){throw 'Option List and actual selected-window dimensions required.'}
 $keys=if($Object -is [Collections.IDictionary]){@($Object.Keys)}else{@($Object.PSObject.Properties.Name)}
 $required=@('kind','rect','device','address_type','address','data_type','mode','options')
 if($keys.Count -ne $required.Count -or @($keys|Where-Object {$_ -cnotin $required}).Count -or $Object.kind -cne 'option_list'){throw 'Exact Option List fields required.'}
 $rect=@($Object.rect);if($rect.Count -ne 4){throw 'Option List needs x/y/width/height.'}
 foreach($v in $rect){if($v -isnot [int] -and $v -isnot [long]){throw 'Strict integer Option List geometry required.'}}
 if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 2 -or $rect[3] -lt 2 -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Option List rectangle must fit selected window.'}
 if($Object.device -cne 'Local HMI' -or $Object.address_type -cne 'LW' -or $Object.data_type -cne '16-bit Unsigned'){throw 'Option List target outside the current reviewed address profile.'}
 if(($Object.address -isnot [int] -and $Object.address -isnot [long]) -or $Object.address -lt 0 -or $Object.address -gt 65535){throw 'Reviewed Local HMI LW address integer required.'}
 if($Object.mode -cnotin @('list','dropdown')){throw 'Option List mode must be list or dropdown.'}
 $options=@($Object.options);if($options.Count -lt 1 -or $options.Count -gt 255){throw 'Option List options require 1..255 actual predefined items.'}
 $normalized=@();foreach($item in $options){
  if($null -eq $item){throw 'Option List item required.'}
  $itemKeys=if($item -is [Collections.IDictionary]){@($item.Keys)}else{@($item.PSObject.Properties.Name)}
  if($itemKeys.Count -ne 2 -or @($itemKeys|Where-Object {$_ -cnotin @('text','value')}).Count){throw 'Option List item accepts only text/value.'}
  if($item.text -isnot [string] -or [string]::IsNullOrWhiteSpace($item.text) -or $item.text.Length -gt 4096){throw 'Option List text must be nonempty and bounded.'}
  foreach($character in $item.text.ToCharArray()){if([char]::IsControl($character)){throw 'Option List text cannot contain control characters.'}}
  if(($item.value -isnot [int] -and $item.value -isnot [long]) -or $item.value -lt 0 -or $item.value -gt 65535){throw 'Option List mapped value must be a 16-bit unsigned integer.'}
  $normalized+=[pscustomobject]@{text=[string]$item.text;value=[int]$item.value}
 }
 return [pscustomobject]@{kind='option_list';rect=@($rect|ForEach-Object {[int]$_});device='Local HMI';address_type='LW';address=[int]$Object.address;data_type='16-bit Unsigned';mode=[string]$Object.mode;options=$normalized}
}

# Reads only fields observed on the installed CN421 Option List property pages.
# The ordinary Mapping rows and the dedicated last error row stay separate.
function Read-WeinviewOptionListFields($Native,$Property,[long]$DialogHwnd,[string]$DialogTitle) {
 if($null -eq $Native -or $null -eq $Property -or !$DialogHwnd -or !$DialogTitle){throw 'Owned Option List property context required.'}
 if(!('PLCCode.Weinview.OptionListGridControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'OptionListGridControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $dialogs=@($Native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Visible -and $_.Enabled -and $_.Title -ceq $DialogTitle})
 if($dialogs.Count -ne 1){throw 'Exact owned Option List property dialog required.'}
 $tab=$Native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
 $tabNames=@($Property.TabNames($tab.Hwnd));foreach($required in @('项目选单','源数据','状态设置')){if(@($tabNames|Where-Object {$_ -ceq $required}).Count -ne 1){throw 'Observed Option List property pages required.'}}
 $Property.SelectTabExact($tab.Hwnd,'项目选单')
 $modeControl=$Native.FindUniqueControlWithoutLabel($DialogHwnd,1852,'ComboBox')
 $nativeMode=$Property.ComboSelected($modeControl.Hwnd)
 $mode=switch -CaseSensitive ($nativeMode){'清单'{'list'} '下拉式选单'{'dropdown'} default{throw 'Native Option List mode unsupported.'}}
 $device=$Property.ComboSelected(($Native.FindUniqueControlWithoutLabel($DialogHwnd,1646,'ComboBox')).Hwnd)
 if(!('PLCCode.Weinview.NumericAddressTypeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $typeReader=[PLCCode.Weinview.NumericAddressTypeControls]::new($Native,$DialogTitle)
 $foundTypes=@();foreach($qt in @($Native.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$snapshot=$typeReader.Inspect($DialogHwnd,$qt.Hwnd,'LW');if($snapshot){$foundTypes+=$snapshot}}
 if($foundTypes.Count -ne 1){throw 'Unique native Option List LW address-type selector required.'}
 $addressText=$Native.GetControlText(($Native.FindUniqueControlWithoutLabel($DialogHwnd,2510,'Edit')).Hwnd,64)
 $address=0;if(![int]::TryParse($addressText,[ref]$address) -or $address -lt 0){throw 'Actual Option List address integer required.'}
 $dataType=$Native.GetControlText(($Native.FindUniqueControlWithoutLabel($DialogHwnd,1342,'Static')).Hwnd,128)
 if($dataType -cne '16-bit Unsigned'){throw 'Current Option List data type outside observed profile.'}
 $Property.SelectTabExact($tab.Hwnd,'源数据')
 $itemCount=([PLCCode.Weinview.OptionListGridControls]::new($Native)).ReadPredefinedItemCount($DialogHwnd,$DialogTitle)
 $Property.SelectTabExact($tab.Hwnd,'状态设置')
 $mapping=([PLCCode.Weinview.OptionListGridControls]::new($Native)).ReadRows($DialogHwnd,$DialogTitle)
 $items=@();$normal=@($mapping.rows|Where-Object {-not $_.error})
 if($itemCount -ne $normal.Count){throw 'Option List native predefined item count differs from ordinary mapping rows.'}
 foreach($row in $normal){$value=0;if(![int]::TryParse([string]$row.value,[ref]$value) -or $value -lt 0 -or $value -gt 65535){throw 'Actual Option List mapped value outside unsigned16.'};$items+=[pscustomobject]@{text=[string]$row.text;value=$value}}
 return [pscustomobject]@{kind='option_list';device=[string]$device;address_type=[string]$foundTypes[0].Value;address=[int]$address;data_type=[string]$dataType;mode=$mode;options=$items;item_count=$itemCount;error_row=[pscustomobject]@{index=[int]$mapping.rows[-1].index;item=[string]$mapping.rows[-1].item;value=[string]$mapping.rows[-1].value;text=[string]$mapping.rows[-1].text};grid_hwnd=[long]$mapping.grid_hwnd;tabs=$tabNames}
}

# Applies an ordinary mapping row through the native grid editor. Switching tabs
# is the observed commit gesture.
function Set-WeinviewOptionListMappingCell($Native,$Property,[long]$DialogHwnd,[string]$DialogTitle,[int]$Index,[ValidateSet('value','text')][string]$Field,[string]$ExpectedBefore,[string]$Replacement) {
 if(!('PLCCode.Weinview.OptionListGridControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'OptionListGridControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $tab=$Native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
 $Property.SelectTabExact($tab.Hwnd,'状态设置')
 $grid=[PLCCode.Weinview.OptionListGridControls]::new($Native)
 $column=if($Field -ceq 'value'){2}else{3}
 $editor=$grid.BeginCellEdit($DialogHwnd,$DialogTitle,$Index,$column,$ExpectedBefore)
 $grid.ReplaceEditorText($DialogHwnd,$editor,$Replacement)
 $Property.SelectTabExact($tab.Hwnd,'项目选单')
 $Property.SelectTabExact($tab.Hwnd,'状态设置')
 $rows=$grid.ReadRows($DialogHwnd,$DialogTitle).rows
 if($Index -lt 0 -or $Index -ge $rows.Count-1){throw 'Option List ordinary row changed after edit.'}
 $actual=if($Field -ceq 'value'){$rows[$Index].value}else{$rows[$Index].text}
 if($actual -cne $Replacement){throw 'Option List mapping cell differs after native commit.'}
 return $actual
}

function Restore-WeinviewOptionListErrorText($Native,$Property,[long]$DialogHwnd,[string]$DialogTitle,[int]$Index,[string]$ExpectedBefore,[string]$Replacement) {
 $tab=$Native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
 $Property.SelectTabExact($tab.Hwnd,'状态设置')
 $grid=[PLCCode.Weinview.OptionListGridControls]::new($Native)
 $editor=$grid.BeginErrorTextEdit($DialogHwnd,$DialogTitle,$Index,$ExpectedBefore)
 $grid.ReplaceEditorText($DialogHwnd,$editor,$Replacement)
 $Property.SelectTabExact($tab.Hwnd,'项目选单')
 $Property.SelectTabExact($tab.Hwnd,'状态设置')
 $rows=$grid.ReadRows($DialogHwnd,$DialogTitle).rows
 if($Index -ne $rows.Count-1 -or $rows[$Index].item -cne ([string]$Index+' (error)') -or $rows[$Index].text -cne $Replacement){throw 'Dedicated Option List error text did not commit in native grid.'}
 return $rows[$Index].text
}

function Set-WeinviewOptionListFields($Native,$Property,[long]$DialogHwnd,[string]$DialogTitle,$Wanted) {
 if($null -eq $Wanted){throw 'Option List desired fields required.'}
 $before=Read-WeinviewOptionListFields $Native $Property $DialogHwnd $DialogTitle
 if($before.device -cne 'Local HMI' -or $before.address_type -cne 'LW' -or $before.data_type -cne '16-bit Unsigned'){throw 'Existing Option List binding outside reviewed native profile.'}
 $requested=@($Wanted.options);if(!$requested.Count){throw 'At least one ordinary Option List choice required.'}
 if($requested.Count -gt 255){throw 'Requested Option List count absent from observed native 1..255 choices.'}
 $tab=$Native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
 $Property.SelectTabExact($tab.Hwnd,'项目选单')
 $modeNative=switch -CaseSensitive ($Wanted.mode){'list'{'清单'} 'dropdown'{'下拉式选单'} default{throw 'Option List mode must be list or dropdown.'}}
 $modeControl=$Native.FindUniqueControlWithoutLabel($DialogHwnd,1852,'ComboBox')
 if($Property.ComboSelected($modeControl.Hwnd) -cne $modeNative){$Property.SelectComboExact($modeControl.Hwnd,$modeNative)}
 if($Property.ComboSelected($modeControl.Hwnd) -cne $modeNative){throw 'Option List mode native readback differs.'}
 if(($Wanted.address -isnot [int] -and $Wanted.address -isnot [long]) -or $Wanted.address -lt 0 -or $Wanted.address -gt 65535){throw 'Reviewed Local HMI LW address required.'}
 $addressControl=$Native.FindUniqueControlWithoutLabel($DialogHwnd,2510,'Edit')
 if($before.address -ne [int]$Wanted.address){$Native.SetControlText($addressControl.Hwnd,[string]$Wanted.address)}
 if($Native.GetControlText($addressControl.Hwnd,64) -cne [string]$Wanted.address){throw 'Option List address native readback differs.'}
 if($requested.Count -ne @($before.options).Count){
  $Property.SelectTabExact($tab.Hwnd,'源数据')
  $grid=[PLCCode.Weinview.OptionListGridControls]::new($Native)
  $null=$grid.SelectPredefinedItemCount($DialogHwnd,$DialogTitle,@($before.options).Count,$requested.Count)
 }
 $working=Read-WeinviewOptionListFields $Native $Property $DialogHwnd $DialogTitle
 if(@($working.options).Count -ne $requested.Count){throw 'Native Option List row count did not follow predefined item-count selection.'}
 for($index=0;$index -lt $requested.Count;$index++){
  $old=$working.options[$index];$item=$requested[$index]
  if(($item.value -isnot [int] -and $item.value -isnot [long]) -or $item.value -lt 0 -or $item.value -gt 65535 -or $item.text -isnot [string] -or [string]::IsNullOrWhiteSpace($item.text)){throw 'Finite Option List text/unsigned16 value required.'}
  if([int]$item.value -ne [int]$old.value){$null=Set-WeinviewOptionListMappingCell $Native $Property $DialogHwnd $DialogTitle $index value ([string]$old.value) ([string]$item.value)}
  if([string]$item.text -cne [string]$old.text){$null=Set-WeinviewOptionListMappingCell $Native $Property $DialogHwnd $DialogTitle $index text ([string]$old.text) ([string]$item.text)}
 }
 $after=Read-WeinviewOptionListFields $Native $Property $DialogHwnd $DialogTitle
 if($after.error_row.index -eq $requested.Count -and $after.error_row.item -ceq ([string]$requested.Count+' (error)') -and $after.error_row.value -ceq $before.error_row.value -and $after.error_row.text -cne $before.error_row.text){
  $null=Restore-WeinviewOptionListErrorText $Native $Property $DialogHwnd $DialogTitle $requested.Count $after.error_row.text $before.error_row.text
  $after=Read-WeinviewOptionListFields $Native $Property $DialogHwnd $DialogTitle
 }
 if($after.device -cne $before.device -or $after.address_type -cne $before.address_type -or $after.data_type -cne $before.data_type -or $after.address -ne [int]$Wanted.address -or $after.mode -cne $Wanted.mode -or @($after.options).Count -ne $requested.Count){throw 'Option List requested or preserved fields differ after native edit.'}
 for($index=0;$index -lt $requested.Count;$index++){if($after.options[$index].text -cne $requested[$index].text -or $after.options[$index].value -ne [int]$requested[$index].value){throw 'Option List mapping differs after native edit.'}}
 if($after.error_row.index -ne $requested.Count -or $after.error_row.item -cne ([string]$requested.Count+' (error)') -or $after.error_row.value -cne $before.error_row.value -or $after.error_row.text -cne $before.error_row.text){throw ('Option List dedicated error row changed unexpectedly. before='+($before.error_row|ConvertTo-Json -Compress)+' after='+($after.error_row|ConvertTo-Json -Compress))}
 return $after
}

function Initialize-WeinviewNewOptionListBinding($Native,$Property,[long]$DialogHwnd,$Wanted) {
 $title='新增 项目选单'
 $dialog=@($Native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq $title -and $_.Visible -and $_.Enabled})
 if($dialog.Count -ne 1){throw 'Exact new Option List dialog required.'}
 if($Wanted.device -cne 'Local HMI' -or $Wanted.address_type -cne 'LW' -or $Wanted.data_type -cne '16-bit Unsigned'){throw 'Requested Option List binding outside reviewed native profile.'}
 $tab=$Native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');$Property.SelectTabExact($tab.Hwnd,'项目选单')
 $device=$Native.FindUniqueControlWithoutLabel($DialogHwnd,1646,'ComboBox')
 if($Property.ComboSelected($device.Hwnd) -cne 'Local HMI'){$Property.SelectComboExact($device.Hwnd,'Local HMI')}
 if($Property.ComboSelected($device.Hwnd) -cne 'Local HMI'){throw 'Local HMI native selection differs.'}
 if(!('PLCCode.Weinview.NumericAddressTypeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NumericAddressTypeControls.cs') -ReferencedAssemblies 'System.dll','Accessibility.dll'}
 $reader=[PLCCode.Weinview.NumericAddressTypeControls]::new($Native,$title)
 $found=@();foreach($qt in @($Native.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$value=$reader.Inspect($DialogHwnd,$qt.Hwnd,'LW');if($value){$found+=$value}}
 if($found.Count -ne 1){throw 'Unique native new Option List LW selector required.'}
 if($found[0].Value -cne 'LW'){$selected=$reader.SelectExact($DialogHwnd,$found[0].Hwnd,$found[0].Value,'LW',(Join-Path $PSScriptRoot 'QtElementBridge.exe'));if($selected.Value -cne 'LW'){throw 'Option List native LW selection differs.'}}
 $type=$Native.GetControlText(($Native.FindUniqueControlWithoutLabel($DialogHwnd,1342,'Static')).Hwnd,128)
 if($type -cne '16-bit Unsigned'){throw 'Option List native data type changed.'}
 return [pscustomobject]@{device='Local HMI';address_type='LW';data_type=$type}
}

# Called after the existing ribbon adapter has opened the owned new-object modal.
# The caller still owns confirmation, placement, directory diff, save and reopen.
function Configure-WeinviewNewOptionListDialog($Native,$Property,[long]$DialogHwnd,$Wanted,[int]$CanvasWidth,[int]$CanvasHeight) {
 $normalized=Assert-WeinviewOptionListInputs $Wanted $CanvasWidth $CanvasHeight
 $null=Initialize-WeinviewNewOptionListBinding $Native $Property $DialogHwnd $normalized
 $after=Set-WeinviewOptionListFields $Native $Property $DialogHwnd '新增 项目选单' $normalized
 if($after.device -cne $normalized.device -or $after.address_type -cne $normalized.address_type -or $after.address -ne $normalized.address -or $after.mode -cne $normalized.mode -or @($after.options).Count -ne @($normalized.options).Count){throw 'Configured new Option List differs before native confirmation.'}
 return [pscustomobject]@{requested=$normalized;observed=$after;confirmed=$false;saved=$false}
}

function Invoke-WeinviewOptionListAddition($Session,[ValidateSet('Apply')][string]$Mode,$Object,[string]$SourceSha256,$BeforeSnapshot,[Parameter(Mandatory=$true)][string]$BridgeRoot) {
 $ErrorActionPreference='Stop'
 foreach($file in @('PlcConfigurationCandidate.ps1','ScreenWorkflow.ps1','ObjectRibbonAction.ps1','CommonObjectsAdditionOperation.ps1','AlarmDisplayOperation.ps1')){. (Join-Path $BridgeRoot $file)}
 function Hash([string]$path){return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash}
 function WritePrivateJson([string]$path,$value){if(Test-Path -LiteralPath $path){throw 'Fresh Option List evidence required.'};$value|ConvertTo-Json -Depth 24|Set-Content -LiteralPath $path -Encoding UTF8}
 Assert-WeinviewPlcCandidateSession $Session
 if($SourceSha256 -notmatch '^[A-Fa-f0-9]{64}$' -or (Hash $Session.output_path) -ine $SourceSha256){throw 'Exact Option List source SHA required.'}
 $wanted=Assert-WeinviewOptionListInputs $Object ([int]$Session.window_width) ([int]$Session.window_height)
 $prefix=$Session.output_path+'.option-list-'+[guid]::NewGuid().ToString('N')
 $before=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot @()
 if($BeforeSnapshot){Assert-WeinviewAdditionSnapshots $BeforeSnapshot $before 0}
 $n=$Session.native;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $sem=[PLCCode.Weinview.NativeSemanticControls]::new($n)
 $scene=[PLCCode.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
 $oldIds=@($before.directory.rows|ForEach-Object {$_.object_id})
 $journalPath=$prefix+'.creation.json';$journal=[ordered]@{phase='entry';requested=$wanted;entry=$null;dialog=$null;configuration=$null;placement=$null;object_id=$null;confirmed=$false;saved=$false}
 try{
  $null=Invoke-WeinviewObjectRibbon $Session $sem '元件'
  $journal.phase='option-list-ribbon';$journal.entry=Invoke-WeinviewObjectRibbon $Session $sem '项目选单'
  $deadline=[DateTime]::UtcNow.AddSeconds(6);$dialog=$null
  do{$dialogs=@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '新增 项目选单'}).Count){throw 'Unexpected modal after Option List ribbon; preserve it.'};if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){$dialog=$dialogs[0];break};Start-Sleep -Milliseconds 50}while([DateTime]::UtcNow -lt $deadline)
  if(!$dialog){throw 'Exact new Option List dialog did not appear; no ribbon replay.'}
  $journal.dialog=@{hwnd=$dialog.Hwnd;title=$dialog.Title};$journal.phase='configure-native-option-list'
  $journal.configuration=Configure-WeinviewNewOptionListDialog $n $p $dialog.Hwnd $wanted ([int]$Session.window_width) ([int]$Session.window_height)
  $journal.phase='confirm-native-option-list';Close-WeinviewScreenDialog $Session $dialog $true;$journal.confirmed=$true
  $journal.phase='place-native-option-list';$journal.placement_activation=Set-WeinviewAlarmDisplayForeground $Session;$placement=$null;$captureDeadline=[DateTime]::UtcNow.AddSeconds(4);$captureAttempt=0
  while($true){
   $capturePath=$prefix+'.placement-'+$captureAttempt+'.png';$captureAttempt++
   try{$placement=$scene.Capture($capturePath);break}catch{
    $cause=$_.Exception;while($cause.InnerException){$cause=$cause.InnerException}
    if(!$cause.Message.StartsWith('Visible top-level overlay intersects owned view',[StringComparison]::Ordinal)){throw}
    $journal.overlay_observation=$cause.Message
    if([DateTime]::UtcNow -ge $captureDeadline){throw 'Owned Option List placement overlay persisted; offending window recorded in creation journal.'}
    Start-Sleep -Milliseconds 100
   }
  }
  if(!$placement){throw 'Fresh Option List placement scene unavailable.'}
  $journal.placement=$placement;$scene.PlaceNewObject($placement,$wanted.rect[0],$wanted.rect[1]);$scene.EndPlacement()
  $journal.phase='read-created-directory';$directoryAfter=Get-WeinviewWindowDirectory -Session $Session;$fresh=@($directoryAfter.rows|Where-Object {$_.object_id -cnotin $oldIds})
  if($fresh.Count -ne 1 -or $fresh[0].kind -cne 'OptionList' -or $fresh[0].object_id -cnotmatch '^OL_[0-9]{1,5}$' -or @($directoryAfter.rows).Count -ne $oldIds.Count+1){throw 'Exactly one actual new OL directory identity required.'}
  $journal.object_id=$fresh[0].object_id;$property=Open-WeinviewDirectoryObject $Session $directoryAfter $fresh[0]
  if($property.Title -cne '项目选单的属性'){throw 'Created OL native property title differs.'}
  $journal.phase='set-actual-contour';$rect=@($wanted.rect)
  $null=& (Join-Path $BridgeRoot 'NativeRectangleCandidate.ps1') -Action Set -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -DialogHwnd $property.Hwnd -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3] -CanvasWidth $Session.window_width -CanvasHeight $Session.window_height
  $journal.phase='read-final-native-property';$readPath=$prefix+'.property.json'
  $null=& (Join-Path $BridgeRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $Session.project_path -ExpectedSha256 $SourceSha256 -DialogHwnd $property.Hwnd -OutputPath $readPath
  $read=Get-Content -LiteralPath $readPath -Raw -Encoding UTF8|ConvertFrom-Json
  if($read.status -cne 'success' -or $read.actual.kind -cne 'option_list'){throw 'Created OL native property readback unavailable.'}
  $expected=CanonicalObject $fresh[0].object_id ([pscustomobject]@{kind='option_list';rectangle=$rect;device=$wanted.device;address_type=$wanted.address_type;address=$wanted.address;data_type=$wanted.data_type;mode=$wanted.mode;options=$wanted.options;error_row=$read.actual.error_row})
  $actual=CanonicalObject $fresh[0].object_id $read.actual
  if((CanonicalObjectHash $actual) -cne (CanonicalObjectHash $expected)){throw 'Created OL requested fields differ from actual native readback.'}
  Close-WeinviewScreenDialog $Session $property $true
  $record=New-WeinviewObjectRecord $fresh[0].object_id $read.actual
  $journal.phase='read-target-and-directory-snapshot';$after=Read-WeinviewAdditionSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot @($record.object_id)
  Assert-WeinviewAdditionSnapshots $before $after 1
  $matches=@($after.objects|Where-Object {$_.object_id -ceq $record.object_id})
  if($matches.Count -ne 1 -or !$matches[0].supported -or $matches[0].object_sha256 -cne $record.object_sha256 -or $matches[0].canonical_json -cne $record.canonical_json){throw 'Created OL full native snapshot differs.'}
  if((Hash $Session.output_path) -ine $SourceSha256){throw 'Option List addition unexpectedly saved project bytes.'}
  $journal.phase='configured-waiting-save';WritePrivateJson $journalPath $journal
  return [pscustomobject]@{operation='common_objects_addition';mode=$Mode;objects=@($matches[0]);creation_evidence=@([pscustomobject]@{object_id=$record.object_id;requested=$wanted;entry=$journal.entry;placement=$journal.placement;native_property_read_path=$readPath;native_creation_journal=$journalPath});before_snapshot=[pscustomobject]@{screen_snapshot=$before;alarm_displays=@()};after_snapshot=[pscustomobject]@{screen_snapshot=$after;alarm_displays=@()};untouched_objects_verified=$false;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';full_properties_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;source_sha256=$SourceSha256;profile='weinview-cn421-native-option-list-v1';native_fields_verified=$true;persisted_verified=$false;saved=$false;reopened_verified=$false;native_evidence_prefix=$prefix}
 }catch{$journal.error=$_.Exception.Message;WritePrivateJson $journalPath $journal;throw}
}
