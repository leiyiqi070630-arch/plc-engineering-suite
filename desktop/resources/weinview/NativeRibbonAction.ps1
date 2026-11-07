function Open-WeinviewSystemParametersRibbon($Session,$Semantic){
 if(!(Get-Command Invoke-WeinviewQtElement -ErrorAction SilentlyContinue)){. (Join-Path $PSScriptRoot 'QtElementAction.ps1')}
 return Invoke-WeinviewQtElement $Session '系统参数'
}
