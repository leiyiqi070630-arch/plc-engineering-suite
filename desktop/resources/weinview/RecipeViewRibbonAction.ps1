# Current CN421 Chinese ribbon calls the Recipe View object “配方检视”.
# This uses the existing owned ribbon capture/OCR and only locates that caption.
function Find-WeinviewRecipeViewRibbonCaption($Ocr,$Proof) {
 $all=@($Ocr.Lines|ForEach-Object {$_.Words}|ForEach-Object {$_})
 $anchor=@($all|Where-Object {$_.Text -cin @('Weincloud','WeincIoud') -and $_.BoundingRect.Y -lt $Proof.Height/4})
 if($anchor.Count -ne 1){throw 'Original Recipe View ribbon anchor not unique.'}
 $matches=@()
 foreach($line in $Ocr.Lines){
  $words=@($line.Words|Where-Object {$_.BoundingRect.Y -gt $anchor[0].BoundingRect.Y+4 -and $_.BoundingRect.Y -lt $Proof.Height*0.75})
  for($i=0;$i -lt $words.Count;$i++){
   $value=''
   for($j=$i;$j -lt [Math]::Min($words.Count,$i+6);$j++){
    if($j -gt $i){$a=$words[$j-1].BoundingRect;$b=$words[$j].BoundingRect;if([Math]::Abs($a.Y-$b.Y) -gt 4 -or $b.X-($a.X+$a.Width) -gt 5){break}}
    $value+=($words[$j].Text -replace '\s','')
    if($value -ceq '配方检视'){
     $part=@($words[$i..$j]);$left=($part|ForEach-Object {$_.BoundingRect.X}|Measure-Object -Minimum).Minimum;$right=($part|ForEach-Object {$_.BoundingRect.X+$_.BoundingRect.Width}|Measure-Object -Maximum).Maximum
     $top=($part|ForEach-Object {$_.BoundingRect.Y}|Measure-Object -Minimum).Minimum;$bottom=($part|ForEach-Object {$_.BoundingRect.Y+$_.BoundingRect.Height}|Measure-Object -Maximum).Maximum
     if($left -lt 0 -or $right -gt $Proof.Width -or $top -lt 0 -or $bottom -gt $Proof.Height){throw 'Recipe View caption outside owned ribbon.'}
     $matches+=@{x=($left+$right)/2;y=($top+$bottom)/2;label='配方检视'}
    }
   }
  }
 }
 if($matches.Count -ne 1){throw 'Exactly one original 配方检视 caption required.'}
 return $matches[0]
}

function Invoke-WeinviewRecipeViewRibbon($Session,$Semantic) {
 if(-not ('PLCCode.Weinview.RecipeViewRibbonControls' -as [type])){throw 'RecipeViewRibbonControls must be loaded with native controls.'}
 $null=Invoke-WeinviewObjectRibbon $Session $Semantic '资料/历史'
 $path=Join-Path ([IO.Path]::GetDirectoryName($Session.output_path)) ('recipe-view-ribbon-'+[guid]::NewGuid().ToString('N')+'.png')
 $projectSha=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 $proof=[PLCCode.Weinview.ObjectRibbonControls]::CaptureOwnedBackgroundRibbon($Session.native,[long]$Session.main.Hwnd,$Session.output_path,$projectSha,$path)
 if(!$proof.Accepted){throw 'Owned Recipe View ribbon render unavailable; no input.'}
 $items=@([PLCCode.Weinview.ObjectRibbonControls]::ReadOrInvokeOwned($Session.native,$proof,[NullString]::Value))
 $semanticMatches=@($items|Where-Object {$_.name -ceq '配方检视' -and $_.action})
 if($semanticMatches.Count -gt 1){throw 'Native Recipe View semantic action ambiguous.'}
 if($semanticMatches.Count -eq 1){$entry=[PLCCode.Weinview.ObjectRibbonControls]::ReadOrInvokeOwned($Session.native,$proof,'配方检视')}
 else {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]|Out-Null
  [Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]|Out-Null
  [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
  [Windows.Graphics.Imaging.SoftwareBitmap,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
  [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
  [Windows.Media.Ocr.OcrResult,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
  [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]|Out-Null
  $asTask=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'}|Select-Object -First 1
  $deadline=[DateTime]::UtcNow.AddSeconds(15)
  $await={param($operation,[type]$type) $task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation));$left=[Math]::Min(15000,[int]($deadline-[DateTime]::UtcNow).TotalMilliseconds);if($left -le 0 -or !$task.Wait($left)){throw 'Recipe View native OCR deadline exceeded.'};return $task.Result}.GetNewClosure()
  $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage(([Windows.Globalization.Language]::new('zh-Hans-CN')))
  if(!$engine){throw 'Native Chinese OCR unavailable for Recipe View ribbon.'}
  $scaled=Get-WeinviewScaledRibbonOcr $proof $engine $await
  $caption=Find-WeinviewRecipeViewRibbonCaption $scaled $proof
  $entry=[PLCCode.Weinview.RecipeViewRibbonControls]::ClickRecipeView($Session.native,$proof,$caption.x,$caption.y,$caption.label)
 }
 $dialog=WaitFor {$all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($all.Count -gt 1){throw 'Recipe View modal ambiguous.'};if($all.Count -eq 1 -and $all[0].Enabled){return $all[0]}} 6
 if($dialog.Title -cnotmatch '配方检视'){throw 'Original Recipe View property title not identified; preserve modal.'}
 return [pscustomobject]@{dialog=$dialog;entry=$entry;caption='配方检视';native_entry_verified=$true}
}
