# Numeric entry reuses the reviewed semantic/OCR/caption object path.
# Actual numeric-dialog/property/save/reopen checks remain with the caller.
function Invoke-WeinviewNumericRibbon($Session,$Semantic,[ValidateSet('元件','数值')][string]$Label) {
 Assert-WeinviewPlcCandidateSession $Session
 . (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1')
 return (Invoke-WeinviewObjectRibbon $Session $Semantic $Label)
}
