# Native whole-window copy only. Caller owns project save/reopen and reference mapping.
# Requires WindowOperation.ps1, WindowRibbonAction.ps1 and WindowCopyControls.cs.
function Invoke-WeinviewNativeWindowCopy($Session,$Arguments,[string]$ExpectedProjectSha256,[string]$EvidencePrefix) {
 if($null -eq $Arguments -or $Arguments -isnot [pscustomobject]){throw 'Typed native whole-window copy arguments required.'}
 $required=@('donor_path','expected_donor_sha256','source_start','source_end','destination_start','copy_macros','copy_events','copy_underlay')
 if(@($required|Where-Object {$_ -cnotin $Arguments.PSObject.Properties.Name}).Count -or @($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $required}).Count){throw 'Exact native whole-window copy arguments required.'}
 if($Arguments.donor_path -isnot [string] -or $Arguments.expected_donor_sha256 -cnotmatch '^[0-9a-fA-F]{64}$' -or $ExpectedProjectSha256 -cnotmatch '^[0-9a-fA-F]{64}$' -or @(@('source_start','source_end','destination_start')|Where-Object {$Arguments.$_ -isnot [int]}).Count){throw 'Pinned donor and integer window range required.'}
 foreach($flag in @('copy_macros','copy_events','copy_underlay')){if($Arguments.$flag -isnot [bool]){throw 'Explicit native resource-copy options required.'}}
 $start=[int]$Arguments.source_start;$end=[int]$Arguments.source_end;$destination=[int]$Arguments.destination_start;$count=$end-$start+1
 if($start -lt 10 -or $end -gt 1999 -or $count -lt 1 -or $count -gt 1990 -or $destination -lt 10 -or $destination+$count-1 -gt 1999){throw 'Bounded contiguous ordinary native window range required.'}
 $project=[string]$Session.project_path;$donor=[IO.Path]::GetFullPath($Arguments.donor_path)
 if(!(Test-Path -LiteralPath $donor -PathType Leaf) -or [IO.Path]::GetExtension($donor) -ine [IO.Path]::GetExtension($project) -or $donor -ieq $project -or (Get-FileHash -LiteralPath $donor -Algorithm SHA256).Hash -cne $Arguments.expected_donor_sha256.ToUpperInvariant() -or (Get-FileHash -LiteralPath $project -Algorithm SHA256).Hash -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Fresh matching-format receiver and pinned donor bytes required.'}
 if(-not ('WindowCopyControls' -as [type])){throw 'WindowCopyControls.cs must be compiled with owned native controls.'}
 $dialog=$null;$menu=$null;$qt=$null;$posted=$false
 try {
  $null=$Session.native.ActivateOwnedMain($Session.main.Hwnd)
  if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected modal before native window-copy entry.'}
  $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
  $proof=$semantic.CaptureRibbon($Session.main.Hwnd,($EvidencePrefix+'.entry.png'))
  $items=@([PLCCode.Weinview.WindowRibbonSemantic]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,[NullString]::Value))
  $matches=@($items|Where-Object {$_.name -ceq '窗口复制' -and $_.action -and !($_.state -band 1)})
  if($matches.Count -gt 1){throw 'Ambiguous exact original Window Copy ribbon command.'}
  if($matches.Count -eq 1){$null=[PLCCode.Weinview.WindowRibbonSemantic]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,'窗口复制')}
  else{
   $tabs=@($items|Where-Object {$_.name -ceq '常用' -and $_.action -and !($_.state -band 1)})
   if($tabs.Count -gt 1){throw 'Ambiguous exact native Home ribbon tab.'}
   if($tabs.Count -eq 1){$null=[PLCCode.Weinview.WindowRibbonSemantic]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,'常用')}
   else{$null=Invoke-WeinviewWindowRibbonOcr $Session $semantic '常用'}
   Start-Sleep -Milliseconds 400
   $homeItems=@([PLCCode.Weinview.WindowRibbonSemantic]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,[NullString]::Value))
   $homeMatches=@($homeItems|Where-Object {$_.name -ceq '窗口复制' -and $_.action -and !($_.state -band 1)})
   if($homeMatches.Count -gt 1){throw 'Ambiguous exact original Window Copy ribbon command after Home selection.'}
   if($homeMatches.Count -eq 1){$null=[PLCCode.Weinview.WindowRibbonSemantic]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,'窗口复制')}
   else{$null=Invoke-WeinviewWindowRibbonOcr $Session $semantic '窗口复制'}
  }
  $dialog=WaitFor {$matches=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Title -ceq '窗口复制'});if($matches.Count -gt 1){throw 'Native window-copy dialog ambiguous.'};if($matches.Count -eq 1){return $matches[0]}} 8
  $qtMatches=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Qt5QWindowIcon'})
  if($qtMatches.Count -ne 1){throw 'Unique original window-copy destination selector required.'}
  $qt=$qtMatches[0];$menu=[WindowCopyControls]::new($Session.native)
  $menu.OpenUnusedRangeMenu($dialog.Hwnd,$qt.Hwnd,$destination,$count)
  $popup=WaitFor {$p=$menu.Popup($dialog.Hwnd,$qt.Hwnd);if($p){return $p}} 5
  $selected=$menu.SelectVisibleUnusedRangeOnce($dialog.Hwnd,$qt.Hwnd,$popup,$destination,$count)
  foreach($field in @(@{id=1488;value=$donor},@{id=1491;value=[string]$start},@{id=1492;value=[string]$end})){
   $control=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,$field.id,'Edit')
   $Session.native.SetControlText($control.Hwnd,$field.value)
   if($Session.native.GetControlText($control.Hwnd,4096) -cne $field.value){throw 'Native window-copy source/range readback differs.'}
  }
  foreach($option in @(@{id=1900;label='复制窗口';wanted=$true},@{id=1901;label='复制宏指令';wanted=[bool]$Arguments.copy_macros},@{id=1897;label='事件登录';wanted=[bool]$Arguments.copy_events},@{id=1903;label='复制重迭窗口';wanted=[bool]$Arguments.copy_underlay})){
   $buttons=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq $option.id -and $_.Class -ceq 'Button' -and $_.Title -ceq $option.label})
   if($buttons.Count -ne 1){throw 'Native whole-window copy option identity differs.'}
   $button=$buttons[0]
   if(!$button.Visible){
    if($option.id -eq 1900 -and $option.wanted){continue}
    if($option.id -in @(1901,1897) -and !$option.wanted){continue}
    throw 'Requested native whole-window copy option is hidden.'
   }
   if(!$button.Enabled){throw 'Native whole-window copy option disabled.'}
   $actual=$Session.native.GetCheckboxState($button.Hwnd)
   if($actual -notin @(0,1)){throw 'Native whole-window copy option state unknown.'}
   if([bool]$actual -ne [bool]$option.wanted){$Session.native.ClickButton($dialog.Hwnd,$option.id,$option.label)}
   if([bool]$Session.native.GetCheckboxState($button.Hwnd) -ne [bool]$option.wanted){throw 'Native whole-window copy option readback differs.'}
  }
  if($menu.Value($dialog.Hwnd,$qt.Hwnd) -cne $selected -or (Get-FileHash -LiteralPath $donor -Algorithm SHA256).Hash -cne $Arguments.expected_donor_sha256.ToUpperInvariant() -or (Get-FileHash -LiteralPath $project -Algorithm SHA256).Hash -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Pinned native window-copy inputs changed before copy.'}
  $Session.native.ClickButton($dialog.Hwnd,1,'复制');$posted=$true
  $null=WaitFor {
   $all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if(@($all|Where-Object {$_.Hwnd -ne $dialog.Hwnd}).Count){throw 'Vendor window-copy notice requires reconciliation; no automatic acknowledgement.'}
   if($all.Count -eq 1 -and $all[0].Hwnd -eq $dialog.Hwnd -and $all[0].Enabled){return $true}
  } 8
  $Session.native.ClickButton($dialog.Hwnd,2,'关闭  ')
  $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $dialog.Hwnd).Count){return $true}} 6
  $dialog=$null
  $Session.window_geometry_evidence=$null
  $windows=Read-WeinviewWindows $Session
  $copied=@()
  for($offset=0;$offset -lt $count;$offset++){
   $number=$destination+$offset;$matches=@($windows.windows|Where-Object number -EQ $number)
   if($matches.Count -ne 1){throw ('Vendor did not produce exact copied destination window '+$number)}
   $copied+=@{source=$start+$offset;destination=$number;name=$matches[0].name;width=$matches[0].width;height=$matches[0].height}
  }
  if((Get-FileHash -LiteralPath $project -Algorithm SHA256).Hash -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Receiver file saved before caller-owned save boundary.'}
  return @{profile='cMT3071-CN421-native-whole-window-copy-v1';donor_path=$donor;donor_sha256=$Arguments.expected_donor_sha256.ToUpperInvariant();copied_windows=$copied;window_set_sha256=$windows.window_set_sha256;windows_after=@($windows.windows);copy_macros=[bool]$Arguments.copy_macros;copy_events=[bool]$Arguments.copy_events;copy_underlay=[bool]$Arguments.copy_underlay;native_copy_posted_once=$posted;project_saved=$false;dependencies_relinked=$false;reopen_verified=$false;runtime_verified=$false}
 }finally{
  if($dialog -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $dialog.Hwnd).Count){
   $Session.native.ClickButton($dialog.Hwnd,2,'关闭  ')
  }
 }
}
