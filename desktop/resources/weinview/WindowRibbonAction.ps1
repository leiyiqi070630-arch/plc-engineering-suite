function Open-WeinviewWindowList($Session){
 Assert-WeinviewPlcCandidateSession $Session
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 $entry=Invoke-WeinviewQtElement $Session '窗口列表'
 $dialog=Get-WeinviewWindowDialog $Session '窗口列表'
 $null=$Session.native.FindUniqueControl($dialog.Hwnd,1530,'ListBox',$null)
 $null=$Session.native.FindUniqueControl($dialog.Hwnd,1328,'Button','新增...')
 $null=$Session.native.FindUniqueControl($dialog.Hwnd,2,'Button','关闭')
 return [pscustomobject]@{dialog=$dialog;entry=@{route='native_qt_element';steps=@($entry);native_dialog_contract_verified=$true;global_input=$false;layout_reset=$false}}
}
function Invoke-WeinviewWindowRibbonOcr($Session,$Semantic,[string]$Label,[switch]$IfVisible){
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 return Invoke-WeinviewQtElement $Session $Label
}
