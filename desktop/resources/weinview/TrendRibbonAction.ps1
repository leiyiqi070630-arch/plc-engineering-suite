# Finite CN421 original Trend entry; unrelated shared ribbon white lists remain unchanged.
function Invoke-WeinviewTrendRibbon($Session,$Semantic) {
 Assert-WeinviewPlcCandidateSession $Session
 if((Hash $Session.process.Path) -cne '59FB29D8A4AA96A3F2DAD7E59301E6EE7197C6D43AB1BF79C0F135BC1EAF8F86'){throw 'Pinned CN421 original executable required.'}
 $tab=Invoke-WeinviewObjectRibbon $Session $Semantic '资料/历史'
 $items=@()
 $entry=Invoke-WeinviewQtElement $Session '趋势图'
 $dialog=WaitFor {
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if($dialogs.Count -gt 1){throw 'Ambiguous owned Trend entry modal.'}
  if($dialogs.Count -eq 1){
   if($dialogs[0].Title -cne '新增 趋势图'){throw 'Unknown owned Trend entry modal; preserve.'}
   if($dialogs[0].Enabled){$fields=@($Session.native.EnumChildControls($dialogs[0].Hwnd));if(@($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Id -eq 12320 -and $_.Class -ceq 'SysTabControl32'}).Count -eq 1 -and @($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Id -eq 1097 -and $_.Class -ceq 'ComboBox'}).Count -eq 1){return $dialogs[0]}}
  }
 } 6
 $identity=[PLC Engineering Suite.Weinview.TrendRibbonControls]::RequireDialog($Session.native,$dialog.Hwnd,$Session.main.Hwnd,'新增 趋势图')
 return [pscustomobject]@{tab_entry=$tab;semantic_items=$items;entry=$entry;dialog=$dialog;dialog_identity=$identity;native_entry_verified=$true;global_input=$false;layout_reset=$false}
}
function Invoke-WeinviewTrendRibbonOcr($Session,$Semantic,[ValidateSet('趋势图')][string]$Label='趋势图') {
 $totalDeadline=[DateTime]::UtcNow.AddSeconds(15);$attempts=@()
 Assert-WeinviewPlcCandidateSession $Session
 $null=$Session.native.ActivateOwnedMain($Session.main.Hwnd)
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'}).Count){throw 'Unexpected modal before object ribbon entry.'}

 if([DateTime]::UtcNow -ge $totalDeadline){throw 'Ribbon readiness total deadline exceeded (15 seconds).'} 
 $path=Join-Path ([IO.Path]::GetDirectoryName($Session.output_path)) ([IO.Path]::GetFileNameWithoutExtension($Session.output_path)+'.ribbon-'+[guid]::NewGuid().ToString('N')+'.png')
 $projectSha=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 $proof=[PLC Engineering Suite.Weinview.ObjectRibbonControls]::CaptureOwnedBackgroundRibbon($Session.native,[long]$Session.main.Hwnd,$Session.output_path,$projectSha,$path)
 if(!$proof.Accepted){throw 'Owned Trend ribbon render unavailable; no input.'}
 Add-Type -AssemblyName System.Runtime.WindowsRuntime
 [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]|Out-Null
 [Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.SoftwareBitmap,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrResult,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]|Out-Null
 $asTask=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'}|Select-Object -First 1
 function AwaitRibbon($operation,[type]$type){$task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation));$remaining=[Math]::Min((20000-[int]([DateTime]::UtcNow-$proof.CapturedUtc).TotalMilliseconds),[int]($totalDeadline-[DateTime]::UtcNow).TotalMilliseconds);if($remaining -le 0 -or !$task.Wait($remaining)){throw 'Bound ribbon OCR readiness deadline exceeded (15 seconds total/20 seconds image).'};return $task.Result}
 $file=AwaitRibbon ([Windows.Storage.StorageFile]::GetFileFromPathAsync($path)) ([Windows.Storage.StorageFile])
 $stream=AwaitRibbon ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream]);$bitmap=$null
 try {
  $decoder=AwaitRibbon ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap=AwaitRibbon ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  if($bitmap.PixelWidth -gt [Windows.Media.Ocr.OcrEngine]::MaxImageDimension -or $bitmap.PixelHeight -gt [Windows.Media.Ocr.OcrEngine]::MaxImageDimension){throw 'Bound ribbon screenshot exceeds native OCR maximum dimension.'}
  $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage(([Windows.Globalization.Language]::new('zh-Hans-CN')))
  if(!$engine){throw 'Simplified Chinese native OCR unavailable.'}
  $scaled=Get-WeinviewScaledRibbonOcr $proof $engine {param($op,[type]$type) AwaitRibbon $op $type}
  $resolved=Find-WeinviewRibbonOcrCaption $scaled $proof $Label
  $matches=@($resolved.matches);$anchors=@($resolved.anchors);$ocrTokens=@($resolved.tokens)
  $attempts+=@{pid=[int]$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks;main_hwnd=$proof.Main;ribbon_hwnd=$proof.Hwnd;geometry=@($proof.Left,$proof.Top,$proof.Width,$proof.Height);screenshot_path=$proof.Path;screenshot_sha256=$proof.Hash;captured_utc=$proof.CapturedUtc.ToString('o');exact_label_count=$matches.Count;matches=$matches;header_anchor_count=$anchors.Count;requested_label=$Label;ocr_tokens=$ocrTokens;ocr_method=$scaled.method;ocr_tiles=$scaled.tiles}
  $attempts|ConvertTo-Json -Depth 8|Set-Content -LiteralPath ($proof.Path+'.ocr-matches.json') -Encoding UTF8; if($matches.Count -gt 1){throw 'Object ribbon exact OCR label duplicated in required region; no click.'}
  if(!$matches.Count){
   throw 'Object ribbon exact label absent in the single fresh OCR capture; no click or retry.'
  }
  if([DateTime]::UtcNow -ge $totalDeadline){throw 'Ribbon readiness total deadline exceeded before click.'}
  Activate-WeinviewObjectRibbonMain $Session
   $click=[PLC Engineering Suite.Weinview.TrendRibbonControls]::ClickTrend($Session.native,$proof,$matches[0].x,$matches[0].y,$matches[0].label)
  return [pscustomobject]@{screenshot_path=$proof.Path;screenshot_sha256=$proof.Hash;ocr_label=$matches[0].label;ribbon_hwnd=$proof.Hwnd;fallback='fresh_owned_ribbon_ocr';proof=$proof;native_click=$click;foreground_verified=$true;global_input=$false;layout_reset=$false;readiness_attempts=$attempts}
 }finally{if($bitmap){$bitmap.Dispose()};$stream.Dispose()}
}
