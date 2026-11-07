# CN421 finite Local-HMI AL runtime acknowledgement. Definitions only; caller owns the public live session.
function Get-WeinviewAlarmTextHash([string]$Text) {
 $algorithm=[Security.Cryptography.SHA256]::Create();try{return [BitConverter]::ToString($algorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text))).Replace('-','')}finally{$algorithm.Dispose()}
}
function Get-WeinviewAlarmSnapshotWindow($Snapshot,[string]$SourceSha256) {
 $screen=$Snapshot.screen_snapshot;$number=$screen.screen;$directory=$screen.directory
 if(($number -isnot [int] -and $number -isnot [long]) -or $number -lt 1 -or $number -gt 32767 -or ($directory.window_number -isnot [int] -and $directory.window_number -isnot [long]) -or $directory.window_number -ne $number -or $screen.source_sha256 -ine $SourceSha256){throw 'Actual AL snapshot must bind one integer base window and its compiled project SHA.'}
 return [int]$number
}
function Assert-WeinviewAlarmCurrentBaseWindow($Values,[int]$WindowNumber) {
 # LW9050 is documented read-only current base window ID; do not derive it from pixels.
 $items=@($Values.items)
 if($items.Count -ne 3){throw 'ACK before values require output LW, pending LB and readonly LW9050.'}
 $current=$items[2];$observed=@($current.observed_values)
 if($current.address -ne 9050 -or $current.format -cne 'int16' -or $current.status -cne 'Connected' -or ($current.value -isnot [int] -and $current.value -isnot [long]) -or $current.value -ne $WindowNumber -or $current.stable -isnot [bool] -or !$current.stable -or $observed.Count -ne 2 -or @($observed|Where-Object {($_ -isnot [int] -and $_ -isnot [long]) -or $_ -ne $WindowNumber}).Count){throw 'weinview_alarm_base_window_mismatch: Both actual readonly LW9050 observations must equal the bound AL window; no input.'}
}
function Assert-WeinviewSimulationAlarmArguments($Arguments,[string]$BridgeRoot,$Installation=$null) {
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if($keys.Count -ne 8 -or @($keys|Where-Object {$_ -cnotin @('workspace_root','session_id','alarm_snapshot_path','expected_alarm_snapshot_sha256','object_id','message','category','confirmation_value')}).Count){throw 'Exact runtime alarm acknowledgement arguments required.'}
 foreach($key in @('workspace_root','session_id','alarm_snapshot_path','expected_alarm_snapshot_sha256','object_id','message')){if($Arguments.$key -isnot [string]){throw 'Alarm identity/path/message strings required.'}}
 if($Arguments.session_id -cnotmatch '^[0-9a-f]{32}$' -or $Arguments.expected_alarm_snapshot_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$' -or $Arguments.object_id -cnotmatch '^AL_[0-9]{1,5}$' -or $Arguments.message.Length -lt 1 -or $Arguments.message.Length -gt 512 -or !$Arguments.message.Trim().Length -or @($Arguments.message.ToCharArray()|Where-Object {[char]::IsControl($_)}).Count){throw 'Exact public session, AL identity, snapshot SHA and bounded control-free message required.'}
 foreach($key in @('category','confirmation_value')){if($Arguments.$key -isnot [int] -and $Arguments.$key -isnot [long]){throw 'Category/confirmation value must be integers.'}}
 if($Arguments.category -lt 0 -or $Arguments.category -gt 255 -or $Arguments.confirmation_value -lt 0 -or $Arguments.confirmation_value -gt 65535){throw 'Category0..255 and unsigned16 confirmation value required.'}
 . (Join-Path $BridgeRoot 'SimulationOperation.ps1');. (Join-Path $BridgeRoot 'EasyWatchValuesOperation.ps1')
 $root=Workspace $Arguments.workspace_root
 $registryPath=Get-WeinviewSimulationPath (Join-Path $root ('.weinview-simulations\'+$Arguments.session_id+'\session.json'))
 $registered=Read-WeinviewSimulationJson $registryPath;$isCmt=($registered.kind -ceq 'weinview-owned-cmt-offline-simulation');$initialWindows=$null;$currentWindow=$null
 if($isCmt){
  if($env:PLCCODE_WEINVIEW_CMT_EXPERIMENTAL -cne '1'){throw 'cMT runtime ACK is experimental and not enabled.'}
  if(!$Installation -or !$Installation.profile_421 -or $Installation.signature_status -cne 'Valid' -or $registered.schema -ne 2 -or $registered.profile -cne 'weinview-cn421-cmt-viewer-owned-offline-v2'){throw 'Signed pinned installation and owned v2 cMT history required.'}
  Initialize-WeinviewCmtAlarmTypes $BridgeRoot
  $initialWindows=Get-WeinviewCmtWindows $registered;$viewer=@($registered.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})
  if($viewer.Count -ne 1 -or !$initialWindows.diagnoser -or $initialWindows.diagnoser_owner -ne $initialWindows.main.Hwnd){throw 'Business-initialized original cMT Diagnoser required; no configuration is performed.'}
  try{
   Set-WeinviewCmtAlarmVisibility $registered $initialWindows $true $initialWindows.main.Visible
   $context=Get-WeinviewCmtValuesContext $root $Arguments.session_id $Installation
   $context.source=$context.session.source_cxob_path;$context.gui=$context.viewer;$context.com=@($context.session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'com_c30.exe'})[0]
   $currentWindow=Read-WeinviewCmtAlarmWindow $context
  }finally{Set-WeinviewCmtAlarmVisibility $registered $initialWindows $initialWindows.diagnoser.Visible $initialWindows.main.Visible}
 }else{$context=Get-WeinviewValuesSession $root $Arguments.session_id}
 $metadataPath=Under ($context.source+'.plccode-compile.json') $root
 $metadata=Read-WeinviewSimulationJson $metadataPath;$metadataKeys=@($metadata.PSObject.Properties.Name)
 $required=@('schema','kind','project_path','project_sha256','artifact_path','artifact_sha256','artifact_bytes','compile_scope','error_count','warning_count','normal_main_exit_verified','source_path','source_sha256','created_utc')
 if($metadataKeys.Count -ne 14 -or @($required|Where-Object {$_ -cnotin $metadataKeys}).Count -or $metadata.schema -ne 1 -or $metadata.kind -cne 'weinview-owned-whole-compile' -or $metadata.compile_scope -cne 'whole_project' -or $metadata.error_count -ne 0 -or $metadata.normal_main_exit_verified -ne $true -or ($metadata.warning_count -isnot [int] -and $metadata.warning_count -isnot [long]) -or $metadata.warning_count -lt 0 -or $metadata.created_utc -isnot [string] -or !$metadata.created_utc){throw 'Original whole-project compile metadata required.'}
 foreach($key in @('schema','error_count','warning_count','artifact_bytes')){if($metadata.$key -isnot [int] -and $metadata.$key -isnot [long]){throw 'Compile metadata numeric fields must be integers.'}}
 if($metadata.normal_main_exit_verified -isnot [bool] -or $metadata.artifact_bytes -lt 1){throw 'Actual compile exit/positive artifact byte count required.'}
 foreach($key in @('project_sha256','artifact_sha256','source_sha256')){if($metadata.$key -isnot [string] -or $metadata.$key -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Compile metadata exact SHA fields required.'}}
 $project=Under $metadata.project_path $root;$originalSource=Under $metadata.source_path $root;$artifact=Under $metadata.artifact_path $root
 $projectExtension=if($isCmt){'.cmtp'}else{'.emtp'};$artifactSha=if($isCmt){$context.session.cxob_sha256}else{$context.session.exob_sha256}
 if($project -ine [IO.Path]::ChangeExtension($context.source,$projectExtension) -or $artifact -ine $context.source -or [IO.Path]::GetExtension($originalSource) -ine $projectExtension -or (Hash $project) -ine $metadata.project_sha256 -or (Hash $originalSource) -ine $metadata.source_sha256 -or $metadata.artifact_sha256 -ine $artifactSha -or (Get-Item -LiteralPath $artifact).Length -ne $metadata.artifact_bytes){throw 'Canonical adjacent compiled project/artifact/source bytes differ.'}
 $snapshotPath=Under $Arguments.alarm_snapshot_path $root
 if([IO.Path]::GetExtension($snapshotPath) -ine '.json' -or (Hash $snapshotPath) -ine $Arguments.expected_alarm_snapshot_sha256 -or (Get-Item -LiteralPath $snapshotPath).Length -gt 4194304){throw 'Exact bounded workspace alarm snapshot required.'}
 $snapshot=Read-WeinviewSimulationJson $snapshotPath
 if($snapshot.source_sha256 -ine $metadata.project_sha256){throw 'AL snapshot must describe the current compiled project bytes.'}
 $windowNumber=Get-WeinviewAlarmSnapshotWindow $snapshot $metadata.project_sha256
 $targets=@($snapshot.alarm_displays|Where-Object {$_.object_id -ceq $Arguments.object_id})
 if($targets.Count -ne 1 -or !$targets[0].native_fields_verified -or $targets[0].full_properties_verified -or $targets[0].actual.object_id -cne $Arguments.object_id){throw 'Unique actually read finite AL record required.'}
 $target=$targets[0];$actual=$target.actual;$actualKeys=@($actual.PSObject.Properties.Name)
 $expectedActual=@('object_id','kind','description','rect','aspect','pinned','font_size','italic','ack_enabled','scroll_enabled_control','category_range','alarm','security','sort','image','ack_output')
 if($isCmt){$expectedActual+=@('cmt_options')}
 if($actualKeys.Count -ne $expectedActual.Count -or @($expectedActual|Where-Object {$_ -cnotin $actualKeys}).Count -or $actual.kind -cne 'alarm_display' -or $actual.ack_enabled -ne 1){throw 'Enabled finite original AL record required.'}
 if($isCmt){
  $options=$actual.cmt_options;$optionKeys=@($options.PSObject.Properties.Name)
  if($optionKeys.Count -ne 7 -or @($optionKeys|Where-Object {$_ -cnotin @('profile','display_style','use_object_heading','heading_font_size','title_enabled','scroll_enabled','ack_gesture')}).Count -or $options.profile -cne 'weinview-cn421-cmt-alarm-options-v1' -or $options.ack_gesture -cne '单击'){throw 'Only actually read cMT single-click ACK is qualified; long press is not inferred.'}
   $windowName=[string]$snapshot.screen_snapshot.directory.window_name;$prefix=$windowNumber.ToString([Globalization.CultureInfo]::InvariantCulture)+' : '
   if([regex]::IsMatch($windowName,'^[0-9]+ : ')){
    if(!$windowName.StartsWith($prefix,[StringComparison]::Ordinal)){throw 'Original compiled window name/number differs.'}
    $windowName=$windowName.Substring($prefix.Length)
   }
   if([string]::IsNullOrWhiteSpace($windowName)){throw 'Original compiled window name required.'}
   if($currentWindow.tree.window_number -ne $windowNumber -or $currentWindow.tree.window_name -cne $windowName){throw 'weinview_alarm_base_window_mismatch: Original current window differs from compiled AL; no input.'}
 }
 $raw=[string]$target.observed_properties_json
 if(!$raw -or (ConvertTo-Json -InputObject ($raw|ConvertFrom-Json) -Depth 12 -Compress) -cne (ConvertTo-Json -InputObject $actual -Depth 12 -Compress) -or (Get-WeinviewAlarmTextHash $raw) -ine $target.observed_properties_sha256){throw 'Actual AL observed JSON/SHA differs.'}
 $rect=@($actual.rect);if($rect.Count -ne 4 -or @($rect|Where-Object {$_ -isnot [int] -and $_ -isnot [long]}).Count -or $rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[0]+$rect[2] -gt 800 -or $rect[1]+$rect[3] -gt 480){throw 'Actually observed AL must lie in800x480 canvas.'}
 $range=@($actual.category_range);if($range.Count -ne 2 -or $Arguments.category -lt $range[0] -or $Arguments.category -gt $range[1]){throw 'Requested category outside actual AL range.'}
 $output=$actual.ack_output;$outputKeys=@($output.PSObject.Properties.Name)
 if($outputKeys.Count -ne 3 -or @($outputKeys|Where-Object {$_ -cnotin @('device','address_type','address_text')}).Count -or $output.device -cne 'Local HMI' -or $output.address_type -cne 'LW' -or $output.address_text -isnot [string] -or $output.address_text -cnotmatch '^(0|[1-9][0-9]{0,3})$' -or [int]$output.address_text -gt 8999){throw 'Actual ACK output must be canonical Local HMI userLW0..8999.'}
 return @{root=$root;context=$context;is_cmt=$isCmt;initial_windows=$initialWindows;current_window=$currentWindow;metadata_path=$metadataPath;metadata_sha256=(Hash $metadataPath);metadata=$metadata;project=$project;snapshot_path=$snapshotPath;snapshot_sha256=(Hash $snapshotPath);snapshot=$snapshot;actual=$actual;window_number=$windowNumber;output_address=[int]$output.address_text;confirmation_signed16=if($Arguments.confirmation_value -gt 32767){[int]$Arguments.confirmation_value-65536}else{[int]$Arguments.confirmation_value}}
}
function Get-WeinviewAlarmCurrentEventPath($Context) {
 $directory=Get-WeinviewSimulationPath (Join-Path $Context.session.runtime_path 'HMI_memory\eventlog')
 if(!(Test-Path -LiteralPath $directory -PathType Container)){throw 'Actual runtime eventlog directory absent.'}
 $files=@(Get-ChildItem -LiteralPath $directory -File -Filter '*.evt')
 if($files.Count -ne 1 -or $files[0].Length -lt 1 -or $files[0].Length -gt 1048576){throw 'Only one active bounded nonempty nativeEVT accepted.'}
 return (Get-WeinviewSimulationPath $files[0].FullName)
}
function Copy-WeinviewAlarmEventSnapshot([string]$NativePath,[string]$Destination) {
 $native=Get-WeinviewSimulationPath $NativePath;$sha=Get-WeinviewSimulationHash $native;$bytes=(Get-Item -LiteralPath $native).Length
 if($bytes -lt 1 -or $bytes -gt 1048576 -or (Test-Path -LiteralPath $Destination)){throw 'Bounded liveEVT/fresh snapshot required.'}
 [IO.File]::Copy($native,$Destination,$false)
 if((Get-WeinviewSimulationHash $Destination) -cne $sha -or (Get-WeinviewSimulationHash $native) -cne $sha -or (Get-Item -LiteralPath $Destination).Length -ne $bytes){throw 'LiveEVT unstable during original snapshot copy; no retry.'}
 return [pscustomobject]@{native_path=$native;native_sha256=$sha;snapshot_path=$Destination;snapshot_sha256=$sha;byte_length=$bytes;copied_utc=[DateTime]::UtcNow.ToString('o');source_unchanged_during_copy=$true}
}
function Get-WeinviewAlarmLatestEvent($Events,[string]$Message,[int]$Category) {
 $found=@();for($index=0;$index -lt @($Events.records).Count;$index++){
  $record=$Events.records[$index]
  if($record.message_text -ceq $Message){
   if($record.category_text -cnotmatch '^(0|[1-9][0-9]{0,2})$'){throw 'Actual target event category is not canonical numeric text.'}
   if([int]$record.category_text -eq $Category){if($record.event_text -cnotin @('0','1','2')){throw 'Unknown target event state; no input.'};$found+=@{record_index=$index+1;record=$record}}
  }
 }
 if(!$found.Count){throw 'Target message/category absent from actual nativeEVT.'}
 return $found[-1]
}
function Read-WeinviewAlarmRuntimeFrame($Binding,[string]$ImagePath) {
 $context=$Binding.context;$native=New-Object PLCCode.Weinview.NativeControls([int]$context.gui.pid,[long]$context.gui.creation_utc_ticks,[string]$context.gui.exe_path,1000)
 [PLCCode.Weinview.RuntimeAlarmControls]::PrepareCallerDpi()
 $tops=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled})
 if(@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unknown owned runtime modal; no input.'}
 $canvases=@();foreach($top in $tops){foreach($child in @($native.EnumChildControls($top.Hwnd))){if($top.Class -ceq 'fltk' -and $child.Visible -and $child.Enabled -and $child.Class -ceq 'fltk' -and [PLCCode.Weinview.RuntimeAlarmControls]::Is800Canvas($child.Hwnd,[int]$context.gui.pid)){$canvases+=@{main=$top;canvas=$child}}}}
 if($canvases.Count -ne 1){throw 'Unique actual original800x480 fltk runtime canvas required.'}
 $main=$canvases[0].main;$canvas=$canvases[0].canvas;$capture=[PLCCode.Weinview.RuntimeAlarmControls]::Capture($canvas.Hwnd,[int]$context.gui.pid,$ImagePath)
 if(!$capture.accepted){throw 'Owned runtime PrintWindow capture was not accepted.'}
 return @{captured_utc=[DateTime]::UtcNow.ToString('o');gui_identity=$context.gui;com_identity=$context.com;main_hwnd=$main.Hwnd;canvas_hwnd=$canvas.Hwnd;canvas_client_bounds=@(0,0,800,480);image_path=$ImagePath;image_sha256=(Hash $ImagePath);capture=$capture;msaa_canvas=[PLCCode.Weinview.RuntimeAlarmControls]::Msaa($canvas.Hwnd,[int]$context.gui.pid);uia_canvas=[PLCCode.Weinview.RuntimeAlarmControls]::Uia($canvas.Hwnd,[int]$context.gui.pid);msaa_main=[PLCCode.Weinview.RuntimeAlarmControls]::Msaa($main.Hwnd,[int]$context.gui.pid);method=$null;message=$null;al_rect=@($Binding.actual.rect);target=$null;tokens=@();semantic_matches=@()}
}
function Find-WeinviewAlarmNativeRow($Frame,[string]$Message) {
 if($Frame.msaa_canvas.truncated -or $Frame.uia_canvas.truncated -or ($Frame.msaa_canvas.provider_available -and $Frame.msaa_canvas.error) -or ($Frame.uia_canvas.provider_available -and $Frame.uia_canvas.error)){throw 'Incomplete actual runtime canvas tree; cannot prove a unique row.'}
 $matches=@();$dedup=@{};$al=$Frame.al_rect
 foreach($entry in @(@{method='native_msaa_row';data=$Frame.msaa_canvas},@{method='native_uia_row';data=$Frame.uia_canvas})){
  foreach($node in @($entry.data.rows)){
   if($node.name -cne $Message -and $node.value -cne $Message){continue}
   if($entry.method -ceq 'native_msaa_row' -and ([int]$node.state -band 0x18001)){throw 'Actual named alarm row unavailable; no OCR substitution.'}
   $bounds=[PLCCode.Weinview.RuntimeAlarmControls]::ToClientBounds($Frame.canvas_hwnd,[int]$Frame.gui_identity.pid,[int[]]$node.bounds)
   if($bounds[0] -lt $al[0] -or $bounds[1] -lt $al[1] -or $bounds[2] -gt $al[0]+$al[2] -or $bounds[3] -gt $al[1]+$al[3]){continue}
   $key=$bounds -join ',';if(!$dedup.ContainsKey($key)){$dedup[$key]=$true;$matches+=@{method=$entry.method;node=$node;label=$Message;bounds=$bounds;x=[int](($bounds[0]+$bounds[2])/2);y=[int](($bounds[1]+$bounds[3])/2)}}
  }
 }
 $Frame.semantic_matches=$matches;if($matches.Count -gt 1){throw 'Ambiguous actual named alarm rows; no input.'}
 if($matches.Count -eq 1){$Frame.method=$matches[0].method;$Frame.message=$Message;$Frame.target=$matches[0];return $true};return $false
}
function Find-WeinviewAlarmOcrRow($Frame,[string]$Message) {
 if($Frame.msaa_canvas.truncated -or $Frame.uia_canvas.truncated -or ($Frame.msaa_canvas.provider_available -and $Frame.msaa_canvas.error) -or ($Frame.uia_canvas.provider_available -and $Frame.uia_canvas.error)){throw 'Incomplete actual runtime canvas tree; no OCR substitution.'}
 Add-Type -AssemblyName System.Runtime.WindowsRuntime
 [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]|Out-Null
 [Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Graphics.Imaging.SoftwareBitmap,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Media.Ocr.OcrResult,Windows.Foundation,ContentType=WindowsRuntime]|Out-Null
 [Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]|Out-Null
 $captured=[DateTime]::Parse($Frame.captured_utc).ToUniversalTime();$deadline=[DateTime]::UtcNow.AddSeconds(15)
 $asTask=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -ceq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -ceq 'IAsyncOperation`1'}|Select-Object -First 1
 function AwaitAlarmOcr($Operation,[type]$Type){$task=$asTask.MakeGenericMethod($Type).Invoke($null,@($Operation));$remaining=[Math]::Min([int]($deadline-[DateTime]::UtcNow).TotalMilliseconds,20000-[int]([DateTime]::UtcNow-$captured).TotalMilliseconds);if($remaining -le 0 -or !$task.Wait($remaining)){throw 'Fresh owned alarm OCR deadline exceeded.'};return $task.Result}
 $file=AwaitAlarmOcr ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Frame.image_path)) ([Windows.Storage.StorageFile])
 $stream=AwaitAlarmOcr ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream]);$bitmap=$null
 try{
  $decoder=AwaitAlarmOcr ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder]);$bitmap=AwaitAlarmOcr ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  if($bitmap.PixelWidth -ne 800 -or $bitmap.PixelHeight -ne 480){throw 'Actual owned800x480 OCR image required.'}
  $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage(([Windows.Globalization.Language]::new('zh-Hans-CN')));if(!$engine){throw 'Original Windows Simplified Chinese OCR unavailable.'}
  if($Frame.capture.capture_method -ceq 'owned cMT foreground client CopyFromScreen'){
   . (Join-Path $PSScriptRoot 'ObjectRibbonAction.ps1')
   $scalingPath=$Frame.image_path+'.ocr-scaling.json';if(Test-Path -LiteralPath $scalingPath){throw 'Fresh alarm recognition evidence required.'}
   $ocr=Get-WeinviewScaledRibbonOcr ([pscustomobject]@{Path=$Frame.image_path;Hash=$Frame.image_sha256;Width=800;Height=480}) $engine {param($op,[type]$type) AwaitAlarmOcr $op $type} 3
   [IO.File]::WriteAllText($scalingPath,(@{source_path=$Frame.image_path;source_sha256=$Frame.image_sha256;method=$ocr.method;tiles=$ocr.tiles;global_input=$false;register_write=$false;coordinate_space='original800x480client'}|ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
  }else{$ocr=AwaitAlarmOcr ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])}
  $al=$Frame.al_rect;$matches=@();$dedup=@{};$tokens=@();$lineIndex=0;$expected=$Message -replace '\s',''
  foreach($line in $ocr.Lines){
   $wordIndex=0;foreach($word in $line.Words){$b=$word.BoundingRect;$tokens+=@{text=$word.Text;x=$b.X;y=$b.Y;width=$b.Width;height=$b.Height;line_index=$lineIndex;word_index=$wordIndex};$wordIndex++}
   if($tokens.Count -gt 2048){throw 'Actual bounded alarm OCR token limit exceeded.'}
   $words=@($line.Words|Where-Object {$_.BoundingRect.X -ge $al[0] -and $_.BoundingRect.Y -ge $al[1] -and $_.BoundingRect.X+$_.BoundingRect.Width -le $al[0]+$al[2] -and $_.BoundingRect.Y+$_.BoundingRect.Height -le $al[1]+$al[3]})
   for($i=0;$i -lt $words.Count;$i++){$text='';for($j=$i;$j -lt [Math]::Min($words.Count,$i+64);$j++){
    if($j -gt $i){$a=$words[$j-1].BoundingRect;$b=$words[$j].BoundingRect;if($b.X -lt $a.X -or [Math]::Min($a.Y+$a.Height,$b.Y+$b.Height) -le [Math]::Max($a.Y,$b.Y) -or $b.X-($a.X+$a.Width) -gt [Math]::Max(10,[Math]::Max($a.Height,$b.Height))){break}}
    $text+=($words[$j].Text -replace '\s','')
    if($text -ceq $expected){$selected=@($words[$i..$j]);$l=($selected|ForEach-Object {$_.BoundingRect.X}|Measure-Object -Minimum).Minimum;$t=($selected|ForEach-Object {$_.BoundingRect.Y}|Measure-Object -Minimum).Minimum;$r=($selected|ForEach-Object {$_.BoundingRect.X+$_.BoundingRect.Width}|Measure-Object -Maximum).Maximum;$b=($selected|ForEach-Object {$_.BoundingRect.Y+$_.BoundingRect.Height}|Measure-Object -Maximum).Maximum;$key="$l,$t,$r,$b";if(!$dedup.ContainsKey($key)){$dedup[$key]=$true;$matches+=@{label=$Message;normalized_text=$text;bounds=@([int]$l,[int]$t,[int]$r,[int]$b);x=[int](($l+$r)/2);y=[int](($t+$b)/2)}}}
   }};$lineIndex++
  }
  $Frame.tokens=$tokens;if($matches.Count -ne 1){throw 'Unique complete actual alarm message inside original AL bounds required; no input.'}
  $Frame.method='fresh_owned_windows_ocr';$Frame.message=$Message;$Frame.target=$matches[0]
 }finally{if($bitmap){$bitmap.Dispose()};$stream.Dispose()}
}
function Invoke-WeinviewSimulationAlarmAck($Arguments,$Installation,[string]$BridgeRoot=$PSScriptRoot) {
 . (Join-Path $BridgeRoot 'SimulationOperation.ps1');. (Join-Path $BridgeRoot 'EasyWatchValuesOperation.ps1');. (Join-Path $BridgeRoot 'HistoryFileOperation.ps1')
 $binding=Assert-WeinviewSimulationAlarmArguments $Arguments $BridgeRoot $Installation
 if($binding.is_cmt){return (Invoke-WeinviewCmtSimulationAlarmAck $Arguments $Installation $BridgeRoot $binding)}
 if(!$Installation.profile_421 -or $Installation.signature_status -cne 'Valid'){throw 'Signed pinned421 installation required.'}
 $converter=Join-Path ([IO.Path]::GetDirectoryName($Installation.exe_path)) 'EasyConverter.exe'
 $mutex=New-Object Threading.Mutex($false,'Local\PLCCode.Weinview.OfflineSimulation.421');$locked=$false;$record=$null;$journal=$null;$click=$null
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true};if(!$locked){throw 'weinview_simulation_busy: Another lifecycle/value/alarm operation is active.'}
  $binding=Assert-WeinviewSimulationAlarmArguments $Arguments $BridgeRoot
  $folder=Get-WeinviewSimulationPath (Join-Path $binding.context.folder ('alarm-ack-'+[guid]::NewGuid().ToString('N')));[void][IO.Directory]::CreateDirectory($folder);$journal=Join-Path $folder 'operation.json'
  $record=[ordered]@{schema=1;kind='weinview-owned-runtime-alarm-ack';session_id=$Arguments.session_id;phase='before_events';input_performed=$false;native_ack_verified=$false;repeat_input=$false;created_utc=[DateTime]::UtcNow.ToString('o');before_event_snapshot=$null;after_event_snapshot=$null;before_events=$null;after_events=$null;before_values=$null;after_values=$null;row_evidence=$null;click_evidence=$null;event_attempts=@();last_error=$null;no_forced_termination=$true}
  Write-WeinviewSimulationJson $journal $record
  $nativeEvent=Get-WeinviewAlarmCurrentEventPath $binding.context
  $beforeSnapshot=Copy-WeinviewAlarmEventSnapshot $nativeEvent (Join-Path $folder 'before.evt');$record.before_event_snapshot=$beforeSnapshot
  $eventArguments=[pscustomobject]@{workspace_root=$binding.root;file_path=$beforeSnapshot.snapshot_path;expected_file_sha256=$beforeSnapshot.snapshot_sha256;exe_path=$converter}
  $beforeEvents=Invoke-WeinviewHistoryFileRead $eventArguments $BridgeRoot 'evt';$record.before_events=$beforeEvents;$latestBefore=Get-WeinviewAlarmLatestEvent $beforeEvents $Arguments.message $Arguments.category
  if($latestBefore.record.event_text -ceq '1'){throw 'weinview_alarm_already_acknowledged: Latest actual target Event1; no input.'}
  if($latestBefore.record.event_text -cne '0'){throw 'Latest actual target event must be active Event0; no input.'}
  $valueArguments=[pscustomobject]@{workspace_root=$binding.root;session_id=$Arguments.session_id;addresses=@([pscustomobject]@{address=$binding.output_address;format='int16'},[pscustomobject]@{address=9043;format='bool'})}
  $beforeValueArguments=[pscustomobject]@{workspace_root=$binding.root;session_id=$Arguments.session_id;addresses=@($valueArguments.addresses)+@([pscustomobject]@{address=9050;format='int16'})}
  $record.phase='before_values';$beforeValues=Invoke-WeinviewSimulationValues $beforeValueArguments $Installation;$record.before_values=$beforeValues;Write-WeinviewSimulationJson $journal $record
  Assert-WeinviewAlarmCurrentBaseWindow $beforeValues $binding.window_number
  Add-Type -AssemblyName Accessibility
  $wpf='C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF'
  Add-Type -Path (Join-Path $BridgeRoot 'RuntimeAlarmControls.cs') -ReferencedAssemblies @('System.dll','System.Drawing.dll','Accessibility.dll',(Join-Path $wpf 'UIAutomationClient.dll'),(Join-Path $wpf 'UIAutomationTypes.dll'),(Join-Path $wpf 'WindowsBase.dll'))
  $record.phase='actual_runtime_row';$frame=Read-WeinviewAlarmRuntimeFrame $binding (Join-Path $folder 'before-row.png');$record.row_evidence=$frame
  if(!(Find-WeinviewAlarmNativeRow $frame $Arguments.message)){Find-WeinviewAlarmOcrRow $frame $Arguments.message}
  $record.row_evidence=$frame;Write-WeinviewSimulationJson $journal $record
  $current=Assert-WeinviewSimulationAlarmArguments $Arguments $BridgeRoot
  if($current.context.receipt_sha256 -cne $binding.context.receipt_sha256 -or $current.metadata_sha256 -cne $binding.metadata_sha256 -or $current.snapshot_sha256 -cne $binding.snapshot_sha256 -or (Get-WeinviewAlarmCurrentEventPath $current.context) -ine $nativeEvent -or (Hash $nativeEvent) -cne $beforeSnapshot.native_sha256){throw 'Original session/project/AL/latest-event bytes changed before action; no input.'}
  $intent=Join-Path $folder 'single-row-intent.json'
  Write-WeinviewSimulationJson $intent @{session_id=$Arguments.session_id;compile_metadata_path=$binding.metadata_path;compile_metadata_sha256=$binding.metadata_sha256;alarm_snapshot_path=$binding.snapshot_path;alarm_snapshot_sha256=$binding.snapshot_sha256;gui_identity=$binding.context.gui;row_evidence=$frame;latest_before=$latestBefore;confirmation_value=$Arguments.confirmation_value;confirmation_signed16=$binding.confirmation_signed16;output_address=$binding.output_address;input_performed=$false;native_ack_verified=$false;repeat_input=$false;global_input=$false}
  $intentSha=Hash $intent;$record.phase='single_row_input_pending';$record.input_performed=$null;Write-WeinviewSimulationJson $journal $record
  $captured=[DateTime]::Parse($frame.captured_utc).ToUniversalTime();$target=$frame.target;$gui=$binding.context.gui
  $click=[PLCCode.Weinview.RuntimeAlarmControls]::Click($frame.canvas_hwnd,$frame.main_hwnd,[int]$gui.pid,[long]$gui.creation_utc_ticks,$gui.exe_path,$gui.exe_sha256,[int]$target.x,[int]$target.y,[int[]]$frame.al_rect,[int[]]$target.bounds,$frame.image_path,$frame.image_sha256,$captured.Ticks)
  $record.click_evidence=$click;$record.input_performed=$true;$record.phase='after_values';Write-WeinviewSimulationJson $journal $record
  $afterValues=Invoke-WeinviewSimulationValues $valueArguments $Installation;$record.after_values=$afterValues
  $word=@($afterValues.items)[0];if(@($word.observed_values).Count -ne 2 -or $word.value -ne $binding.confirmation_signed16 -or @($word.observed_values|Where-Object {$_ -ne $binding.confirmation_signed16}).Count){throw 'Single row input posted, but actual dual-frame confirmation output did not match; outcome possible, no retry.'}
  $record.phase='after_events';$deadline=[DateTime]::UtcNow.AddSeconds(20);$afterEvents=$null;$afterSnapshot=$null;$latestAfter=$null
  for($attempt=1;$attempt -le 3 -and [DateTime]::UtcNow -lt $deadline;$attempt++){
   if((Get-WeinviewAlarmCurrentEventPath $binding.context) -ine $nativeEvent){throw 'Active nativeEVT identity changed after row input; outcome possible.'}
   $afterSnapshot=Copy-WeinviewAlarmEventSnapshot $nativeEvent (Join-Path $folder ('after-'+$attempt+'.evt'))
   $eventArguments=[pscustomobject]@{workspace_root=$binding.root;file_path=$afterSnapshot.snapshot_path;expected_file_sha256=$afterSnapshot.snapshot_sha256;exe_path=$converter}
   $afterEvents=Invoke-WeinviewHistoryFileRead $eventArguments $BridgeRoot 'evt';$latestAfter=Get-WeinviewAlarmLatestEvent $afterEvents $Arguments.message $Arguments.category
   $record.after_event_snapshot=$afterSnapshot;$record.after_events=$afterEvents;$record.event_attempts+=@{attempt=$attempt;snapshot=$afterSnapshot;events=$afterEvents;latest=$latestAfter};Write-WeinviewSimulationJson $journal $record
   if($latestAfter.record.event_text -ceq '1' -and $latestAfter.record_index -gt $latestBefore.record_index){break};if($latestAfter.record.event_text -ceq '2'){throw 'Target recovered after input without verified latestEvent1; outcome possible.'};Start-Sleep -Milliseconds 500
  }
  if(!$latestAfter -or $latestAfter.record.event_text -cne '1' -or $latestAfter.record_index -le $latestBefore.record_index -or $latestAfter.record.occurrence_count_text -cne $latestBefore.record.occurrence_count_text){throw 'Single row input did not prove a new corresponding nativeEvent1; outcome possible, no retry.'}
  if(@($afterEvents.raw_rows).Count -lt @($beforeEvents.raw_rows).Count){throw 'Native event prefix shortened after input.'}
  for($index=0;$index -lt @($beforeEvents.raw_rows).Count;$index++){if($afterEvents.raw_rows[$index].raw_csv -cne $beforeEvents.raw_rows[$index].raw_csv){throw 'Original native event raw prefix changed after input.'}}
  $newAcks=@();for($index=$latestBefore.record_index;$index -lt @($afterEvents.records).Count;$index++){$r=$afterEvents.records[$index];if($r.message_text -ceq $Arguments.message -and $r.category_text -ceq $Arguments.category.ToString([Globalization.CultureInfo]::InvariantCulture) -and $r.event_text -ceq '1'){$newAcks+=$r}}
  if($newAcks.Count -ne 1){throw 'Exactly one new matching nativeEvent1 required; no repeat input.'}
  $final=Assert-WeinviewSimulationAlarmArguments $Arguments $BridgeRoot
  if($final.context.receipt_sha256 -cne $binding.context.receipt_sha256 -or $final.metadata_sha256 -cne $binding.metadata_sha256 -or $final.snapshot_sha256 -cne $binding.snapshot_sha256 -or (Hash $intent) -cne $intentSha){throw 'Original binding/intent changed after row input; outcome possible.'}
  $record.phase='complete';$record.native_ack_verified=$true;Write-WeinviewSimulationJson $journal $record
  return [pscustomobject]@{operation='simulation_alarm_ack';profile='weinview-cn421-tk800x480-native-simulation-alarm-ack-v1';session_id=$Arguments.session_id;workspace_root=$binding.root;source_project_path=$binding.project;source_project_sha256=$binding.metadata.project_sha256;source_exob_path=$binding.context.source;exob_sha256=$binding.context.session.exob_sha256;runtime_exob_path=$binding.context.runtime_exob;session_record=$binding.context.receipt;session_record_sha256=$binding.context.receipt_sha256;compile_metadata_path=$binding.metadata_path;compile_metadata_sha256=$binding.metadata_sha256;compile_metadata=$binding.metadata;alarm_snapshot_path=$binding.snapshot_path;alarm_snapshot_sha256=$binding.snapshot_sha256;alarm_snapshot=$binding.snapshot;alarm_actual=$binding.actual;object_id=$Arguments.object_id;message=$Arguments.message;category=[int]$Arguments.category;confirmation_value=[int]$Arguments.confirmation_value;confirmation_signed16=$binding.confirmation_signed16;output_address=$binding.output_address;before_values=$beforeValues;after_values=$afterValues;before_event_snapshot=$beforeSnapshot;after_event_snapshot=$afterSnapshot;before_events=$beforeEvents;after_events=$afterEvents;latest_before=$latestBefore;latest_after=$latestAfter;row_evidence=$frame;click_evidence=$click;intent_path=$intent;intent_sha256=$intentSha;journal_path=$journal;native_ack_verified=$true;input_performed=$true;repeat_input=$false;source_unchanged=$true;runtime_session_preserved=$true;global_input=$false;plc_communication_tested=$false;full_properties_verified=$false;no_forced_termination=$true}
 }catch{
  if($record){$cause=$_.Exception.GetBaseException();if($cause.Data.Contains('runtime_alarm_input_performed')){$record.input_performed=$cause.Data['runtime_alarm_input_performed']};if($cause.Data.Contains('runtime_alarm_click_evidence')){$record.click_evidence=$cause.Data['runtime_alarm_click_evidence']};$record.phase='failed';$record.last_error=$_.Exception.Message;try{Write-WeinviewSimulationJson $journal $record}catch{}}
  $_.Exception.Data['simulation_alarm_failure']=$record;$_.Exception.Data['simulation_alarm_journal']=$journal;throw
 }finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
}

function Initialize-WeinviewCmtAlarmTypes([string]$BridgeRoot) {
 if(!('PLCCode.Weinview.CmtObjectValuesControls' -as [type])){
  Add-Type -AssemblyName Accessibility
  Add-Type -Path @((Join-Path $BridgeRoot 'NativeControls.cs'),(Join-Path $BridgeRoot 'NativePropertyCandidate.cs'),(Join-Path $BridgeRoot 'EasyWatchValuesControls.cs')) -ReferencedAssemblies 'System.dll','Accessibility.dll'
 }
 if(!('PLCCode.Weinview.RuntimeAlarmControls' -as [type])){
  $wpf='C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF'
  Add-Type -Path (Join-Path $BridgeRoot 'RuntimeAlarmControls.cs') -ReferencedAssemblies @('System.dll','System.Drawing.dll','Accessibility.dll',(Join-Path $wpf 'UIAutomationClient.dll'),(Join-Path $wpf 'UIAutomationTypes.dll'),(Join-Path $wpf 'WindowsBase.dll'))
 }
}
function Set-WeinviewCmtAlarmVisibility($Session,$Windows,[bool]$ShowDiagnoser,[bool]$ShowMain) {
 $viewer=@($Session.processes|Where-Object {[IO.Path]::GetFileName($_.exe_path) -ceq 'cMTViewer.exe'})[0]
 [PLCCode.Weinview.RuntimeAlarmControls]::CmtVisibility($Windows.main.Hwnd,$Windows.diagnoser.Hwnd,[int]$viewer.pid,[long]$viewer.creation_utc_ticks,$viewer.exe_path,$viewer.exe_sha256,$ShowMain,$ShowDiagnoser)
}
function Convert-WeinviewCmtAlarmWindowSample($Observation) {
 $raw=ConvertTo-Json -InputObject $Observation.tree -Depth 4 -Compress
 return @{tree=$Observation.tree;raw_json=$raw;raw_utf8_sha256=(Get-WeinviewAlarmTextHash $raw);observed_utc=$Observation.observed_utc;observed_utc_ticks=$Observation.observed_utc_ticks}
}
function Read-WeinviewCmtAlarmWindow($Context) {
 $viewer=$Context.viewer;$windows=$Context.windows
 return (Convert-WeinviewCmtAlarmWindowSample ([PLCCode.Weinview.RuntimeAlarmControls]::CmtCurrentWindow($windows.main.Hwnd,$windows.diagnoser.Hwnd,[int]$viewer.pid,[long]$viewer.creation_utc_ticks,$viewer.exe_path,$viewer.exe_sha256)))
}
function Get-WeinviewCmtAlarmSharedHash([string]$Path) {
 $stream=New-Object IO.FileStream($Path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite);$algorithm=[Security.Cryptography.SHA256]::Create()
 try{return [BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','')}finally{$algorithm.Dispose();$stream.Dispose()}
}
function Copy-WeinviewCmtAlarmDatabase($Context,[string]$Destination) {
 $native=Get-WeinviewSimulationPath (Join-Path $Context.session.runtime_path 'HMI_memory\eventlog\event.db')
 if($native -ine $Context.session.static_runtime.history_path -or $Context.session.profile -cne 'weinview-cn421-cmt-viewer-owned-offline-v2' -or (Test-Path -LiteralPath $Destination)){throw 'Fresh snapshot of the owned v2 cMT native history required.'}
 foreach($suffix in @('-wal','-shm','-journal')){if(Test-Path -LiteralPath ($native+$suffix)){throw 'Active SQLite sidecar; no unstable snapshot accepted.'}}
 $bytes=(Get-Item -LiteralPath $native).Length;if($bytes -lt 100 -or $bytes -gt 1048576){throw 'Bounded native cMT database required.'}
 $sha=Get-WeinviewCmtAlarmSharedHash $native
 $source=New-Object IO.FileStream($native,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite)
 $output=New-Object IO.FileStream($Destination,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$source.CopyTo($output);$output.Flush($true)}finally{$output.Dispose();$source.Dispose()}
 foreach($suffix in @('-wal','-shm','-journal')){if(Test-Path -LiteralPath ($native+$suffix)){throw 'SQLite changed during snapshot; no retry.'}}
 if((Hash $Destination) -cne $sha -or (Get-WeinviewCmtAlarmSharedHash $native) -cne $sha -or (Get-Item -LiteralPath $Destination).Length -ne $bytes){throw 'Native cMT history changed during snapshot; no retry.'}
 return @{native_path=$native;native_sha256=$sha;snapshot_path=$Destination;snapshot_sha256=$sha;byte_length=$bytes;copied_utc=[DateTime]::UtcNow.ToString('o');source_unchanged_during_copy=$true}
}
function Get-WeinviewCmtAlarmLatestEvent($History,[string]$Message,[int]$Category) {
 $records=@($History.native_report.records);$found=@()
 for($i=0;$i -lt $records.Count;$i++){
  $record=$records[$i];if($record.definition.language1 -cne $Message){continue}
  if($record.definition.category -ne $Category -and $null -eq $record.event.'recover_time@timestamp'){throw 'Same visible message in another active category; no ambiguous row input.'}
  if($record.definition.category -eq $Category){$found+=@{record_index=$i+1;record=$record}}
 }
 if(!$found.Count){throw 'Target message/category absent from original cMT database.'}
 $active=@($found|Where-Object {$null -eq $_.record.event.'recover_time@timestamp'})
 if($active.Count -ne 1){throw 'Exactly one active cMT event occurrence required; no input.'}
 return $active[0]
}
function Assert-WeinviewCmtAlarmTransition($Before,$After,$LatestBefore,$LatestAfter) {
 $old=@($Before.native_report.records);$new=@($After.native_report.records)
 if($old.Count -ne $new.Count -or $LatestBefore.record_index -ne $LatestAfter.record_index -or (ConvertTo-Json -InputObject $Before.native_report.definitions -Depth 8 -Compress) -cne (ConvertTo-Json -InputObject $After.native_report.definitions -Depth 8 -Compress)){throw 'Original cMT event identity/count/definitions changed.'}
 for($i=0;$i -lt $old.Count;$i++){
  if($i+1 -eq $LatestBefore.record_index){
   $eventBefore=$old[$i].event;$eventAfter=$new[$i].event
   if($null -ne $eventBefore.'confirm_time@timestamp' -or $null -ne $eventBefore.'recover_time@timestamp' -or $null -eq $eventAfter.'confirm_time@timestamp' -or $null -ne $eventAfter.'recover_time@timestamp' -or $eventAfter.'confirm_time@timestamp' -lt $eventBefore.'trigger_time@timestamp'){throw 'ACK must only confirm the same still-active occurrence; recovery is separate.'}
   $protectedBefore=ConvertFrom-Json (ConvertTo-Json -InputObject $old[$i] -Depth 8 -Compress);$protectedAfter=ConvertFrom-Json (ConvertTo-Json -InputObject $new[$i] -Depth 8 -Compress)
   $protectedBefore.event.PSObject.Properties.Remove('confirm_time@timestamp');$protectedAfter.event.PSObject.Properties.Remove('confirm_time@timestamp')
   if((ConvertTo-Json -InputObject $protectedBefore -Depth 8 -Compress) -cne (ConvertTo-Json -InputObject $protectedAfter -Depth 8 -Compress)){throw 'ACK modified another field of the original cMT occurrence.'}
  }elseif((ConvertTo-Json -InputObject $old[$i] -Depth 8 -Compress) -cne (ConvertTo-Json -InputObject $new[$i] -Depth 8 -Compress)){throw 'ACK modified another cMT history record.'}
 }
}
function Read-WeinviewCmtAlarmRuntimeFrame($Binding,[string]$ImagePath) {
 $context=$Binding.context;$viewer=$context.viewer;$windows=$context.windows
 Set-WeinviewCmtAlarmVisibility $context.session $windows $false $true
 $captureNative=New-Object PLCCode.Weinview.NativeControls([int]$viewer.pid,[long]$viewer.creation_utc_ticks,[string]$viewer.exe_path,1500)
 $null=$captureNative.ActivateOwnedTopLevel($windows.main.Hwnd,'Qt5QWindowOwnDCIcon')
 $capture=[PLCCode.Weinview.RuntimeAlarmControls]::CmtCapture($windows.main.Hwnd,$windows.diagnoser.Hwnd,[int]$viewer.pid,[long]$viewer.creation_utc_ticks,$viewer.exe_path,$viewer.exe_sha256,$ImagePath)
 $msaa=[PLCCode.Weinview.RuntimeAlarmControls]::Msaa($windows.main.Hwnd,[int]$viewer.pid)
 return @{captured_utc=[DateTime]::UtcNow.ToString('o');gui_identity=$viewer;com_identity=$context.com;main_hwnd=$windows.main.Hwnd;canvas_hwnd=$windows.main.Hwnd;canvas_client_bounds=@(0,0,800,480);image_path=$ImagePath;image_sha256=(Hash $ImagePath);capture=$capture;msaa_canvas=$msaa;uia_canvas=[PLCCode.Weinview.RuntimeAlarmControls]::Uia($windows.main.Hwnd,[int]$viewer.pid);msaa_main=$msaa;method=$null;message=$null;al_rect=@($Binding.actual.rect);target=$null;tokens=@();semantic_matches=@()}
}
function Invoke-WeinviewCmtSimulationAlarmAck($Arguments,$Installation,[string]$BridgeRoot,$Binding) {
 . (Join-Path $BridgeRoot 'HistoryFileOperation.ps1')
 $mutex=New-Object Threading.Mutex($false,'Local\PLCCode.Weinview.OfflineSimulation.421');$locked=$false;$record=$null;$journal=$null
 try{
  try{$locked=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$locked=$true};if(!$locked){throw 'weinview_simulation_busy: Another lifecycle/value/alarm operation is active.'}
  $binding=Assert-WeinviewSimulationAlarmArguments $Arguments $BridgeRoot $Installation
  $folder=Get-WeinviewSimulationPath (Join-Path $binding.context.folder ('alarm-ack-'+[guid]::NewGuid().ToString('N')));[void][IO.Directory]::CreateDirectory($folder);$journal=Join-Path $folder 'operation.json'
  $record=[ordered]@{schema=1;kind='weinview-owned-cmt-runtime-alarm-ack';session_id=$Arguments.session_id;phase='before_events';input_performed=$false;native_ack_verified=$false;repeat_input=$false;created_utc=[DateTime]::UtcNow.ToString('o');before_event_snapshot=$null;after_event_snapshot=$null;before_events=$null;after_events=$null;before_values=$null;after_values=$null;row_evidence=$null;click_evidence=$null;event_attempts=@();last_error=$null;no_forced_termination=$true;current_window_samples=@($binding.current_window);current_window_at_input=$null}
  Write-WeinviewSimulationJson $journal $record
  $beforeSnapshot=Copy-WeinviewCmtAlarmDatabase $binding.context (Join-Path $folder 'before.db');$record.before_event_snapshot=$beforeSnapshot
  $beforeEvents=Invoke-WeinviewHistoryDbRead ([pscustomobject]@{workspace_root=$binding.root;file_path=$beforeSnapshot.snapshot_path;expected_file_sha256=$beforeSnapshot.snapshot_sha256;exe_path=$null}) $BridgeRoot;$record.before_events=$beforeEvents
  $latestBefore=Get-WeinviewCmtAlarmLatestEvent $beforeEvents $Arguments.message $Arguments.category
  if($null -ne $latestBefore.record.event.'confirm_time@timestamp'){throw 'weinview_alarm_already_acknowledged: Actual native cMT event already confirmed; no input.'}
  $valueArguments=[pscustomobject]@{workspace_root=$binding.root;session_id=$Arguments.session_id;addresses=@([pscustomobject]@{address=$binding.output_address;format='int16'})}
  Set-WeinviewCmtAlarmVisibility $binding.context.session $binding.context.windows $true $binding.initial_windows.main.Visible
  $record.phase='before_values';$beforeValues=Invoke-WeinviewCmtObjectValues $valueArguments $Installation $binding.root;$record.before_values=$beforeValues
  $window=Read-WeinviewCmtAlarmWindow $binding.context;$record.current_window_samples+=,$window
  if($window.tree.window_number -ne $binding.current_window.tree.window_number -or $window.tree.window_name -cne $binding.current_window.tree.window_name -or ([long]$window.observed_utc_ticks-[long]$binding.current_window.observed_utc_ticks) -lt 5000000){throw 'Actual cMT window must remain stable across the before-value read; no input.'}
  Assert-WeinviewCmtFiles $binding.context.session
  if((Hash $binding.context.receipt) -cne $binding.context.receipt_sha256 -or (Hash $binding.metadata_path) -cne $binding.metadata_sha256 -or (Hash $binding.snapshot_path) -cne $binding.snapshot_sha256 -or (Hash $binding.project) -cne $binding.metadata.project_sha256 -or @(Get-WeinviewCmtProcesses $binding.context.session).Count -ne 3){throw 'Original cMT source/session binding changed; no input.'}
  $record.phase='actual_runtime_row';$frame=Read-WeinviewCmtAlarmRuntimeFrame $binding (Join-Path $folder 'before-row.png');$record.row_evidence=$frame
  if(!(Find-WeinviewAlarmNativeRow $frame $Arguments.message)){Find-WeinviewAlarmOcrRow $frame $Arguments.message}
  $record.row_evidence=$frame;Write-WeinviewSimulationJson $journal $record
  if((Get-WeinviewCmtAlarmSharedHash $beforeSnapshot.native_path) -cne $beforeSnapshot.native_sha256){throw 'Native cMT event changed before row input; no input.'}
  $intent=Join-Path $folder 'single-row-intent.json'
  Write-WeinviewSimulationJson $intent @{session_id=$Arguments.session_id;compile_metadata_path=$binding.metadata_path;compile_metadata_sha256=$binding.metadata_sha256;alarm_snapshot_path=$binding.snapshot_path;alarm_snapshot_sha256=$binding.snapshot_sha256;gui_identity=$binding.context.viewer;row_evidence=$frame;latest_before=$latestBefore;confirmation_value=$Arguments.confirmation_value;confirmation_signed16=$binding.confirmation_signed16;output_address=$binding.output_address;input_performed=$false;native_ack_verified=$false;repeat_input=$false;global_input=$false;current_window_samples=$record.current_window_samples}
  $intentSha=Hash $intent;$record.phase='single_row_input_pending';$record.input_performed=$null;Write-WeinviewSimulationJson $journal $record
  $viewer=$binding.context.viewer;$windows=$binding.context.windows;$target=$frame.target;$captured=[DateTime]::Parse($frame.captured_utc).ToUniversalTime()
  $input=[PLCCode.Weinview.RuntimeAlarmControls]::CmtClick($windows.main.Hwnd,$windows.diagnoser.Hwnd,[int]$viewer.pid,[long]$viewer.creation_utc_ticks,$viewer.exe_path,$viewer.exe_sha256,$binding.window_number,$binding.current_window.tree.window_name,[int]$target.x,[int]$target.y,[int[]]$frame.al_rect,[int[]]$target.bounds,$frame.image_path,$frame.image_sha256,$captured.Ticks)
  $click=$input.click;$record.click_evidence=$click;$record.current_window_at_input=Convert-WeinviewCmtAlarmWindowSample $input.window;$record.input_performed=$true;$record.phase='after_values';Write-WeinviewSimulationJson $journal $record
  Set-WeinviewCmtAlarmVisibility $binding.context.session $windows $true $true
  $afterValues=Invoke-WeinviewCmtObjectValues $valueArguments $Installation $binding.root;$record.after_values=$afterValues
  $word=@($afterValues.items)[0];if($word.value -ne $binding.confirmation_signed16 -or @($word.observed_values).Count -ne 2 -or @($word.observed_values|Where-Object {$_ -ne $binding.confirmation_signed16}).Count){throw 'Actual dual-frame cMT confirmation output differs; input performed, no retry.'}
  $record.phase='after_events';$deadline=[DateTime]::UtcNow.AddSeconds(20);$afterEvents=$null;$afterSnapshot=$null;$latestAfter=$null
  for($attempt=1;$attempt -le 3 -and [DateTime]::UtcNow -lt $deadline;$attempt++){
   $afterSnapshot=Copy-WeinviewCmtAlarmDatabase $binding.context (Join-Path $folder ('after-'+$attempt+'.db'))
   $afterEvents=Invoke-WeinviewHistoryDbRead ([pscustomobject]@{workspace_root=$binding.root;file_path=$afterSnapshot.snapshot_path;expected_file_sha256=$afterSnapshot.snapshot_sha256;exe_path=$null}) $BridgeRoot
   $latestAfter=Get-WeinviewCmtAlarmLatestEvent $afterEvents $Arguments.message $Arguments.category
   $record.after_event_snapshot=$afterSnapshot;$record.after_events=$afterEvents;$record.event_attempts+=@{attempt=$attempt;snapshot=$afterSnapshot;events=$afterEvents;latest=$latestAfter};Write-WeinviewSimulationJson $journal $record
   if($null -ne $latestAfter.record.event.'confirm_time@timestamp'){break};Start-Sleep -Milliseconds 500
  }
  if(!$latestAfter){throw 'No native cMT acknowledgement observation; no retry.'}
  Assert-WeinviewCmtAlarmTransition $beforeEvents $afterEvents $latestBefore $latestAfter
  Assert-WeinviewCmtFiles $binding.context.session
  if((Hash $binding.context.receipt) -cne $binding.context.receipt_sha256 -or (Hash $binding.metadata_path) -cne $binding.metadata_sha256 -or (Hash $binding.snapshot_path) -cne $binding.snapshot_sha256 -or (Hash $binding.project) -cne $binding.metadata.project_sha256 -or (Hash $intent) -cne $intentSha){throw 'Original cMT binding/intent changed after input.'}
  $record.phase='complete';$record.native_ack_verified=$true;Write-WeinviewSimulationJson $journal $record
  return [pscustomobject]@{operation='simulation_alarm_ack';profile='weinview-cn421-cmt-native-simulation-alarm-ack-v1';session_id=$Arguments.session_id;workspace_root=$binding.root;source_project_path=$binding.project;source_project_sha256=$binding.metadata.project_sha256;source_cxob_path=$binding.context.source;cxob_sha256=$binding.context.session.cxob_sha256;runtime_cxob_path=$binding.context.session.runtime_cxob_path;session_record=$binding.context.receipt;session_record_sha256=$binding.context.receipt_sha256;compile_metadata_path=$binding.metadata_path;compile_metadata_sha256=$binding.metadata_sha256;compile_metadata=$binding.metadata;alarm_snapshot_path=$binding.snapshot_path;alarm_snapshot_sha256=$binding.snapshot_sha256;alarm_snapshot=$binding.snapshot;alarm_actual=$binding.actual;object_id=$Arguments.object_id;message=$Arguments.message;category=[int]$Arguments.category;confirmation_value=[int]$Arguments.confirmation_value;confirmation_signed16=$binding.confirmation_signed16;output_address=$binding.output_address;before_values=$beforeValues;after_values=$afterValues;before_event_snapshot=$beforeSnapshot;after_event_snapshot=$afterSnapshot;before_events=$beforeEvents;after_events=$afterEvents;latest_before=$latestBefore;latest_after=$latestAfter;row_evidence=$frame;click_evidence=$click;intent_path=$intent;intent_sha256=$intentSha;journal_path=$journal;native_ack_verified=$true;input_performed=$true;repeat_input=$false;source_unchanged=$true;runtime_session_preserved=$true;global_input=$false;plc_communication_tested=$false;full_properties_verified=$false;no_forced_termination=$true;current_window_samples=$record.current_window_samples;current_window_at_input=$record.current_window_at_input}
 }catch{
  if($record){$cause=$_.Exception.GetBaseException();if($cause.Data.Contains('runtime_alarm_input_performed')){$record.input_performed=$cause.Data['runtime_alarm_input_performed']};if($cause.Data.Contains('runtime_alarm_click_evidence')){$record.click_evidence=$cause.Data['runtime_alarm_click_evidence']};$record.phase='failed';$record.last_error=$_.Exception.Message;try{Write-WeinviewSimulationJson $journal $record}catch{}}
  $_.Exception.Data['simulation_alarm_failure']=$record;$_.Exception.Data['simulation_alarm_journal']=$journal;throw
 }finally{
  try{if($binding.initial_windows){Set-WeinviewCmtAlarmVisibility $binding.context.session $binding.context.windows $binding.initial_windows.diagnoser.Visible $binding.initial_windows.main.Visible}}finally{if($locked){$mutex.ReleaseMutex()};$mutex.Dispose()}
 }
}
