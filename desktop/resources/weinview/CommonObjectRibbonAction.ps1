function Invoke-WeinviewTextRibbon($Session,$Semantic){
 Assert-WeinviewPlcCandidateSession $Session
 if(-not(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 $entry=Invoke-WeinviewQtElement $Session '文字/批注'
 $deadline=[DateTime]::UtcNow.AddSeconds(6);$dialog=$null
 do{
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '新增 文字/批注'}).Count){throw 'Unexpected native dialog after text entry.'}
  if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){$dialog=$dialogs[0];break}
  Start-Sleep -Milliseconds 50
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$dialog){throw 'Native text dialog did not open; no entry replay.'}
 foreach($control in @(@(1283,'RichEdit20W'),@(1547,'ComboBox'),@(1439,'ComboBox'),@(12320,'SysTabControl32'),@(1,'Button'),@(2,'Button'))){$null=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,[int]$control[0],[string]$control[1])}
 $entry|Add-Member -NotePropertyName dialog_verified -NotePropertyValue $true
 return [pscustomobject]@{entry=$entry;capture=$null;dialog=$dialog;receipt_path=$null;native_entry_verified=$true;global_input=$false;layout_reset=$false}
}
function Invoke-WeinviewRectangleRibbon($Session,$Semantic){
 Assert-WeinviewPlcCandidateSession $Session
 if(-not(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 $entry=Invoke-WeinviewQtElement $Session '矩形'
 $deadline=[DateTime]::UtcNow.AddSeconds(6);$palette=$null
 do{
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if($dialogs.Count -gt 1 -or @($dialogs|Where-Object {$_.Title -cne '属性'}).Count){throw 'Unexpected native dialog after rectangle entry.'}
  if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){$palette=$dialogs[0];break}
  Start-Sleep -Milliseconds 50
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$palette){throw 'Native rectangle palette did not open; no entry replay.'}
 $property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $actual=[PLCCode.Weinview.CommonObjectRibbonControls]::InspectRectanglePalette($Session.native,$property,$Session.main.Hwnd,$palette.Hwnd)
 return [pscustomobject]@{entry=$entry;capture=$null;palette=$palette;actual_palette=$actual;receipt_path=$null;native_entry_verified=$true;global_input=$false;layout_reset=$false}
}
