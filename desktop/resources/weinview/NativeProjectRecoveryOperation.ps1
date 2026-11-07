# Local compiled-project recovery for an owned EasyBuilder Pro session.
# The vendor decompiler dialog is the only operation that creates an editable project.
function Get-WeinviewRecoveryInput {
 param($Arguments)
 $source=[IO.Path]::GetFullPath([string]$Arguments.runtime_path)
 $target=[IO.Path]::GetFullPath([string]$Arguments.project_path)
 $sourceExtension=[IO.Path]::GetExtension($source)
 $targetExtension=[IO.Path]::GetExtension($target)
 $expectedExtension=if($sourceExtension -ieq '.cxob'){'.cmtp'}elseif($sourceExtension -ieq '.exob'){'.emtp'}else{$null}
 if(!$expectedExtension -or $targetExtension -ine $expectedExtension){throw 'Native recovery requires CXOB to CMTP or EXOB to EMTP.'}
 if(!(Test-Path -LiteralPath $source -PathType Leaf)){throw 'Compiled source file is absent.'}
 if((Get-Item -LiteralPath $source).Length -le 0){throw 'Compiled source file is empty; native recovery is unavailable.'}
 if(Test-Path -LiteralPath $target){throw 'Recovered project destination must be fresh.'}
 if(!(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($target)) -PathType Container)){throw 'Recovered project parent directory is absent.'}
 $actual=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
 $expected=[string]$Arguments.runtime_sha256
 if($expected -and ($expected -cnotmatch '^[0-9A-Fa-f]{64}$' -or $actual -ine $expected)){throw 'Compiled source SHA256 differs from request.'}
 return @{runtime_path=$source;runtime_sha256=$actual;runtime_bytes=(Get-Item -LiteralPath $source).Length;project_path=$target;project_extension=$expectedExtension;kind=if($sourceExtension -ieq '.cxob'){'cmt'}else{'emt'}}
}

function Complete-WeinviewRecoveryResult {
 param($InputRecord,$NativeEvidence)
 if(!(Test-Path -LiteralPath $InputRecord.project_path -PathType Leaf)){throw 'Native decompiler did not create an editable project file.'}
 $item=Get-Item -LiteralPath $InputRecord.project_path
 if($item.Length -le 0){throw 'Native decompiler produced an empty project file.'}
 $sourceNow=(Get-FileHash -LiteralPath $InputRecord.runtime_path -Algorithm SHA256).Hash
 if($sourceNow -ine $InputRecord.runtime_sha256){throw 'Compiled source changed during native recovery.'}
 $projectHash=(Get-FileHash -LiteralPath $InputRecord.project_path -Algorithm SHA256).Hash
 return @{runtime_path=$InputRecord.runtime_path;runtime_sha256=$sourceNow;runtime_bytes=$InputRecord.runtime_bytes;project_path=$InputRecord.project_path;project_sha256=$projectHash;project_bytes=$item.Length;project_extension=$InputRecord.project_extension;native_decompile_completed=$true;editable_project_open_verified=$false;project_adopted=$false;native_evidence=$NativeEvidence}
}

function Find-WeinviewRecoveryFileCaption($Proof) {
 $ocrPath=[PLCCode.Weinview.NativeSemanticControls]::CreateLeftRibbonOcrImage($Proof,700)
 Add-Type -AssemblyName System.Runtime.WindowsRuntime
 [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]|Out-Null
 [Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.SoftwareBitmap,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrResult,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]|Out-Null
 $asTask=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'}|Select-Object -First 1
 function AwaitRecoveryOcr($operation,[type]$type){$task=$asTask.MakeGenericMethod($type).Invoke($null,@($operation));if(!$task.Wait(10000)){throw 'Native File OCR timed out.'};return $task.Result}
 $file=AwaitRecoveryOcr ([Windows.Storage.StorageFile]::GetFileFromPathAsync($ocrPath)) ([Windows.Storage.StorageFile])
 $stream=AwaitRecoveryOcr ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream]);$bitmap=$null
 try {
  $decoder=AwaitRecoveryOcr ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap=AwaitRecoveryOcr ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage(([Windows.Globalization.Language]::new('zh-Hans-CN')))
  if(!$engine){throw 'Native Simplified Chinese OCR unavailable.'}
  $result=AwaitRecoveryOcr ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
  $matches=@()
  foreach($line in @($result.Lines)){
   $words=@($line.Words|Sort-Object {$_.BoundingRect.X})
   for($i=0;$i -lt $words.Count;$i++){
    $joined='';for($j=$i;$j -lt [Math]::Min($i+3,$words.Count);$j++){
     if($j -gt $i -and $words[$j].BoundingRect.X-($words[$j-1].BoundingRect.X+$words[$j-1].BoundingRect.Width) -gt 12){break}
     $joined+=[string]$words[$j].Text
     if($joined -cin @('文件','文亻牛')){$left=$words[$i].BoundingRect.X;$right=$words[$j].BoundingRect.X+$words[$j].BoundingRect.Width;$top=$words[$i].BoundingRect.Y;$bottom=$words[$j].BoundingRect.Y+$words[$j].BoundingRect.Height;if($left -lt 0 -or $right -gt 200 -or $top -lt 0 -or $bottom -gt 50){continue};$matches+=@{x=($left+$right)/4;y=($top+$bottom)/4;bounds=@($left,$top,$right,$bottom);text=$joined}}
    }
   }
  }
  $matches|ConvertTo-Json -Depth 4|Set-Content -LiteralPath ($Proof.Path+'.file-ocr.json') -Encoding UTF8
  if($matches.Count -ne 1){throw 'Exact File caption not unique in fresh left ribbon OCR.'}
  return $matches[0]
 }finally{if($bitmap){$bitmap.Dispose()};$stream.Dispose()}
}

function Open-WeinviewNativeFileDialog {
 param($Session,[string]$EvidencePrefix,[string[]]$ExactMenuNames,[ValidateSet('decompile','upload')][string]$EvidenceKind,[string]$ExpectedDialogTitle)
 if(!$Session.native -or !$Session.main -or !$Session.process){throw 'Owned EasyBuilder Pro session required.'}
 if(!$EvidencePrefix -or !$ExpectedDialogTitle -or !$ExactMenuNames -or $ExactMenuNames.Count -lt 1 -or @($ExactMenuNames|Where-Object {![string]$_}).Count){throw 'Exact native File menu and dialog identity required.'}
 if(-not ('PLCCode.Weinview.NativeRecoveryMenuControls' -as [type]) -or -not ('PLCCode.Weinview.NativeSemanticControls' -as [type])){throw 'Native recovery menu and existing ribbon controls must be loaded.'}
 $null=$Session.native.ActivateOwnedMain($Session.main.Hwnd)
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected native modal before File menu entry.'}
 $semantic=New-Object PLCCode.Weinview.NativeSemanticControls($Session.native)
 $proof=$semantic.CaptureRibbon($Session.main.Hwnd,($EvidencePrefix+'.file-ribbon.png'))
 $fileRows=@([PLCCode.Weinview.NativeRecoveryMenuControls]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,$null))
 $fileRows|ConvertTo-Json -Depth 5|Set-Content -LiteralPath ($EvidencePrefix+'.file-menu.json') -Encoding UTF8
 $fileMatch=@($fileRows|Where-Object {$_.name -ceq '文件' -and $_.action -and !($_.state -band 1)})
 if($fileMatch.Count -gt 1){throw 'Native File menu item duplicated.'}
 if($fileMatch.Count -eq 1){$null=[PLCCode.Weinview.NativeRecoveryMenuControls]::ReadOrInvoke($proof.Hwnd,[int]$Session.process.Id,'文件')}
 else{$caption=Find-WeinviewRecoveryFileCaption $proof;[PLCCode.Weinview.NativeRecoveryMenuControls]::ClickFileRibbon($Session.native,$proof,[int]$Session.process.Id,[double]$caption.x,[double]$caption.y)}
 Start-Sleep -Milliseconds 250
 $candidateWindows=@($Session.native.EnumTopWindows())+@($Session.native.EnumChildControls($Session.main.Hwnd))
 $menus=@()
 foreach($window in $candidateWindows){
  if(!$window.Visible -or !$window.Enabled -or $window.Class -notlike '*Qt*'){continue}
  try{$rows=@([PLCCode.Weinview.NativeRecoveryMenuControls]::ReadOrInvoke([long]$window.Hwnd,[int]$Session.process.Id,$null));$matched=@($rows|Where-Object {$_.name -cin $ExactMenuNames -and $_.action -and !($_.state -band 1)});if($matched.Count){$menus+=@{hwnd=[long]$window.Hwnd;class=$window.Class;rows=$rows;match=$matched}}}catch{}
 }
 $menuPath=$EvidencePrefix+'.'+$EvidenceKind+'-menu.json'
 $menus|ConvertTo-Json -Depth 7|Set-Content -LiteralPath $menuPath -Encoding UTF8
 if($menus.Count -ne 1 -or @($menus[0].match).Count -ne 1){throw ('Exact enabled native '+$EvidenceKind+' menu item unavailable.')}
 $chosen=$menus[0]
 $null=[PLCCode.Weinview.NativeRecoveryMenuControls]::ReadOrInvoke([long]$chosen.hwnd,[int]$Session.process.Id,[string]$chosen.match[0].name)
 $deadline=[DateTime]::UtcNow.AddSeconds(10);$dialog=$null
 do{$matches=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($matches.Count -eq 1){$dialog=$matches[0];break};if($matches.Count -gt 1){throw ('Multiple native modals after '+$EvidenceKind+' command.')};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
 if(!$dialog -or $dialog.Title -cne $ExpectedDialogTitle){throw ('Expected native '+$ExpectedDialogTitle+' dialog did not appear.')}
 $controls=@($Session.native.EnumChildControls($dialog.Hwnd)|ForEach-Object {@{id=$_.Id;class=$_.Class;title=if($_.Class -ceq 'Edit'){'<redacted>'}else{$_.Title};visible=$_.Visible;enabled=$_.Enabled}})
 $dialogPath=$EvidencePrefix+'.'+$EvidenceKind+'-dialog.json'
 @{dialog=$dialog;controls=$controls}|ConvertTo-Json -Depth 6|Set-Content -LiteralPath $dialogPath -Encoding UTF8
 return @{dialog=$dialog;controls=$controls;file_ribbon_sha256=$proof.Hash;file_menu_path=$EvidencePrefix+'.file-menu.json';menu_path=$menuPath;dialog_path=$dialogPath}
}

function Open-WeinviewNativeRecoveryDialog {
 param($Session,[string]$EvidencePrefix)
 $entry=Open-WeinviewNativeFileDialog $Session $EvidencePrefix @('结构分析','结构分析...') 'decompile' '结构分析'
 $entry.decompile_menu_path=$entry.menu_path
 return $entry
}

function Open-WeinviewNativeUploadDialog {
 param($Session,[string]$EvidencePrefix)
 if(!$Session.native -or !$Session.main -or !$Session.process -or !$EvidencePrefix){throw 'Owned EasyBuilder Pro upload session and evidence prefix required.'}
 if(-not ('PLCCode.Weinview.NativeRecoveryMenuControls' -as [type])){throw 'Native recovery accelerator controls must be loaded.'}
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected native modal before Upload accelerator entry.'}
 $command=[PLCCode.Weinview.NativeRecoveryMenuControls]::OpenUploadFromAccelerator([long]$Session.main.Hwnd,[int]$Session.process.Id,[string]$Session.process.Path)
 $deadline=[DateTime]::UtcNow.AddSeconds(10);$dialog=$null
 do{$matches=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'});if($matches.Count -eq 1){$dialog=$matches[0];break};if($matches.Count -gt 1){throw 'Multiple native modals after Upload accelerator command.'};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
 if(!$dialog -or $dialog.Title -cne '上传 (HMI->PC)'){throw 'Expected native Upload dialog did not appear.'}
 $controls=@($Session.native.EnumChildControls($dialog.Hwnd)|ForEach-Object {@{id=$_.Id;class=$_.Class;title=if($_.Class -ceq 'Edit'){'<redacted>'}else{$_.Title};visible=$_.Visible;enabled=$_.Enabled}})
 $dialogPath=$EvidencePrefix+'.upload-dialog.json'
 @{dialog=$dialog;controls=$controls}|ConvertTo-Json -Depth 6|Set-Content -LiteralPath $dialogPath -Encoding UTF8
 return @{dialog=$dialog;controls=$controls;dialog_path=$dialogPath;upload_dialog_path=$dialogPath;entry_method='installed_native_accelerator';command=$command}
}

function Invoke-WeinviewNativeProjectRecovery {
 param($Session,$Arguments,[string]$EvidencePrefix)
 $inputRecord=Get-WeinviewRecoveryInput $Arguments
 $entry=Open-WeinviewNativeRecoveryDialog $Session $EvidencePrefix
 $dialog=$entry.dialog
 foreach($browse in @(@{id=1478;path=$inputRecord.runtime_path;display=1224},@{id=1483;path=$inputRecord.project_path;display=1522})){
  $Session.native.ClickButton($dialog.Hwnd,[int]$browse.id,'浏览...')
  $deadline=[DateTime]::UtcNow.AddSeconds(10);$fileDialog=$null
  do{$modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $dialog.Hwnd});if($modals.Count -eq 1){$fileDialog=$modals[0];break};if($modals.Count -gt 1){throw 'Native recovery file selection is ambiguous.'};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
  if(!$fileDialog -or $fileDialog.Title -cne '打开'){throw 'Native recovery file dialog differs.'}
  $edit=$Session.native.FindUniqueControlWithoutLabel($fileDialog.Hwnd,1148,'Edit')
  $Session.native.SetControlText($edit.Hwnd,[string]$browse.path)
  if($Session.native.GetControlText($edit.Hwnd,4096) -cne [string]$browse.path){throw 'Native recovery file path readback differs.'}
  $Session.native.ClickButton($fileDialog.Hwnd,1,'打开(&O)')
  $deadline=[DateTime]::UtcNow.AddSeconds(10)
  do{$live=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Hwnd -eq $fileDialog.Hwnd});if(!$live.Count){break};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
  if($live.Count){throw 'Native recovery file selection did not close.'}
  $display=$Session.native.GetControlText(($Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,[int]$browse.display,'Static')).Hwnd,4096)
  if($display -cne [string]$browse.path){throw 'Native recovery source or destination display differs.'}
 }
 if((Test-Path -LiteralPath $inputRecord.project_path)){throw 'Native recovery destination appeared before Decompile command.'}
 $Session.native.ClickButton($dialog.Hwnd,1506,'结构分析')
 $deadline=[DateTime]::UtcNow.AddSeconds(120);$completed=$false;$passwordUsed=$false
 do{
  $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $dialog.Hwnd})
  if($modals.Count -gt 1){throw 'Native decompile response dialogs are ambiguous.'}
  if($modals.Count -eq 1){
   $response=$modals[0]
   $static=@($Session.native.EnumChildControls($response.Hwnd)|Where-Object {$_.Visible -and $_.Class -ceq 'Static' -and $_.Title}|ForEach-Object {$_.Title})
   if(@($static|Where-Object {$_ -ceq '结构分析完成. 是否要开启?'}).Count -eq 1){
    $Session.native.ClickButton($response.Hwnd,6,'是(&Y)')
    $completed=$true;break
   }
   $passwordControls=@($Session.native.EnumChildControls($response.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit'})
   if(!$passwordUsed -and $passwordControls.Count -eq 1 -and @($static|Where-Object {$_ -match '密码|password'}).Count -gt 0){
    $hasPassword=if($Arguments -is [System.Collections.IDictionary]){$Arguments.Contains('decompile_password')}else{$null -ne $Arguments.PSObject.Properties['decompile_password']}
    if(!$hasPassword){throw 'Original-vendor decompilation password required.'}
    $password=[string]$Arguments.decompile_password
    if($password -cnotmatch '^\d{1,10}$' -or [uint64]$password -gt 4294967295){throw 'Original-vendor decompilation password format differs.'}
    $buttons=@($Session.native.EnumChildControls($response.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Button' -and $_.Title -match '确定|OK'})
    if($buttons.Count -ne 1){throw 'Original-vendor password confirmation control differs.'}
    $Session.native.SetControlText($passwordControls[0].Hwnd,$password)
    $password=$null
    $Session.native.ClickButton($response.Hwnd,$buttons[0].Id,$buttons[0].Title)
    $passwordUsed=$true
    Start-Sleep -Milliseconds 100
    continue
   }
   throw ('Original-vendor decompilation stopped: '+($static -join ' '))
  }
  Start-Sleep -Milliseconds 150
 }while([DateTime]::UtcNow -lt $deadline)
 if(!$completed){throw 'Original-vendor decompilation did not complete in time.'}
 $project=Complete-WeinviewRecoveryResult $inputRecord $entry
 $stem=[IO.Path]::GetFileNameWithoutExtension($inputRecord.project_path)
 $deadline=[DateTime]::UtcNow.AddSeconds(35);$recovered=$null
 do{$matches=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title.Contains($stem)});if($matches.Count -eq 1){$recovered=$matches[0];break};if($matches.Count -gt 1){throw 'Recovered native project main is ambiguous.'};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
 if(!$recovered){throw 'Recovered project did not open in original editor.'}
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Recovered project opened with an unresolved native dialog.'}
 $project.editable_project_open_verified=$true
 $project.native_recovered_main_title=$recovered.Title
 $Session.main=$recovered
 $Session.project_path=$inputRecord.project_path
 $Session.output_path=$inputRecord.project_path
 return $project
}
