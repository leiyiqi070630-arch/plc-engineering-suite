# Resolve the exact owned ribbon element/caption; do not depend on desktop focus.
function Invoke-WeinviewTagRibbon($Session,$Semantic,[ValidateSet('工程文件','地址')][string]$Label,[bool]$OwnedBackground=$false) {
 if(!(Get-Command Invoke-WeinviewObjectRibbon -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1')}
 $priorBackground=$Session.owned_ribbon_background
 try {
  if($OwnedBackground){$Session.owned_ribbon_background=$true}
  return (Invoke-WeinviewObjectRibbon $Session $Semantic $Label)
 } finally {$Session.owned_ribbon_background=$priorBackground}
}