param([ValidateSet('Read','Set')][string]$Action='Read',[Parameter(Mandatory=$true)][string]$IdentityPath,[Parameter(Mandatory=$true)][long]$DialogHwnd,[int]$X,[int]$Y,[int]$Width,[int]$Height,[int]$CanvasWidth=800,[int]$CanvasHeight=480,[Parameter(Mandatory=$true)][string]$ProjectPath)
$ErrorActionPreference='Stop'
if(-not ('PLC Engineering Suite.Weinview.NativeControls' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativeControls.cs')}
Add-Type -AssemblyName Accessibility
if(-not ('PLC Engineering Suite.Weinview.Research.NativePropertyCandidate' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'NativePropertyCandidate.cs') -ReferencedAssemblies @('System.dll',[Accessibility.IAccessible].Assembly.Location)}
$identity=Get-Content -LiteralPath $IdentityPath -Raw | ConvertFrom-Json
if(-not $identity.Project -or [IO.Path]::GetFullPath($ProjectPath) -ine [IO.Path]::GetFullPath($identity.Project) -or -not (Test-Path -LiteralPath $ProjectPath -PathType Leaf)){throw 'Explicit project must match owned launch identity'}
$native=[PLC Engineering Suite.Weinview.NativeControls]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe,800)
$main=@($native.EnumTopWindows() | Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))})
if($main.Count -ne 1){throw 'Owned main project title mismatch'}
$property=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new([int]$identity.Pid,[long]$identity.CreationTicks,[string]$identity.Exe)
$dialog=@($native.EnumTopWindows() | Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -cin @('数值的属性','功能键的属性','位状态切换开关/位状态指示灯的属性','位状态指示灯/位状态切换开关的属性','矩形元件属性','图片的属性','项目选单的属性','趋势图的属性','报警显示的属性') -and $_.Visible -and $_.Enabled})
if($dialog.Count -ne 1){throw 'Only exact owned Numeric/Function Key property dialog accepted'}
$tab=$native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
if($Action -eq 'Set' -and $dialog[0].Title -ceq '图片的属性'){
 $property.SelectTabExact($tab.Hwnd,'图片')
 $originalSize=$native.FindUniqueControl($DialogHwnd,1895,'Button','调整元件尺寸为图片原尺寸')
 $originalSizeState=$native.GetCheckboxState($originalSize.Hwnd)
 if($originalSizeState -notin @(0,1)){throw 'Actual Picture original-size state required'}
 if($originalSizeState -eq 1){$native.ClickButton($DialogHwnd,1895,'调整元件尺寸为图片原尺寸')}
 if($native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1895,'Button','调整元件尺寸为图片原尺寸')).Hwnd) -ne 0){throw 'Picture original-size setting must be off for requested layout'}
}
# Named selection is a semantic UI change, even for Read; root must explicitly open this dialog.
$property.SelectTabExact($tab.Hwnd,'轮廓')
function Rect-Read {
 $values=@();foreach($id in @(1050,1052,1045,1044)){
  $control=$native.FindUniqueControlWithoutLabel($DialogHwnd,$id,'Edit')
  $text=$native.GetControlText($control.Hwnd,64);$value=0
  if(-not [int]::TryParse($text,[ref]$value)){throw "Noninteger native rectangle: $id"};$values+=$value
 };return $values
}
$before=@(Rect-Read)
$aspect=$native.FindUniqueControl($DialogHwnd,1602,'Button','保持长/宽比例')
$originalAspect=$native.GetCheckboxState($aspect.Hwnd)
if($originalAspect -notin @(0,1)){throw 'Unexpected aspect checkbox state'}
if($Action -eq 'Set'){
 foreach($key in @('X','Y','Width','Height')){if(-not $PSBoundParameters.ContainsKey($key)){throw 'All four rectangle values required'}}
 if($dialog[0].Title -ceq '矩形元件属性' -and ($Width -lt 3 -or $Height -lt 3)){throw '矩形宽高最少3px，细线请改用3px矩形或已有SVG素材'}
 if($X -lt 0 -or $Y -lt 0 -or $Width -lt 1 -or $Height -lt 1 -or $X+$Width -gt $CanvasWidth -or $Y+$Height -gt $CanvasHeight){throw 'Rectangle must fit the actual selected native window'}
 if($originalAspect -eq 1){$native.ClickButton($DialogHwnd,1602,'保持长/宽比例')}
 if($native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1602,'Button','保持长/宽比例')).Hwnd) -ne 0){throw 'Independent dimensions require aspect off'}
 $ids=@(1050,1052,1045,1044);$requested=@($X,$Y,$Width,$Height)
 for($i=0;$i -lt 4;$i++){
  $control=$native.FindUniqueControlWithoutLabel($DialogHwnd,$ids[$i],'Edit');$native.SetControlText($control.Hwnd,[string]$requested[$i])
  if($native.GetControlText(($native.FindUniqueControlWithoutLabel($DialogHwnd,$ids[$i],'Edit')).Hwnd,64) -cne [string]$requested[$i]){throw 'Immediate rectangle field readback mismatch'}
 }
 if($originalAspect -eq 1){$native.ClickButton($DialogHwnd,1602,'保持长/宽比例')}
 $after=@(Rect-Read);for($i=0;$i -lt 4;$i++){if($after[$i] -ne $requested[$i]){throw 'Final rectangle field readback mismatch'}}
 if($native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1602,'Button','保持长/宽比例')).Hwnd) -ne $originalAspect){throw 'Aspect preference restore mismatch'}
}else{$after=$before}
[ordered]@{Before=$before;After=$after;OriginalAspect=$originalAspect;Confirmed=$false;Saved=$false;ReopenedVerified=$false;CandidateOnly=$true} | ConvertTo-Json -Depth 3
