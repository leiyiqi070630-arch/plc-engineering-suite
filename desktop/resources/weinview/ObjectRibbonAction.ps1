function Invoke-WeinviewObjectRibbon($Session,$Semantic,[string]$Label){
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 return Invoke-WeinviewQtElement $Session $Label
}
function Invoke-WeinviewObjectRibbonOcr($Session,$Semantic,[string]$Label){return Invoke-WeinviewObjectRibbon $Session $Semantic $Label}
