# Dot-source only; original CLI and pinned native numeric formats.
function Get-WeinviewRecipeProfile([string]$Layout='int16') {
 switch -CaseSensitive ($Layout) {
  'int16' {return @{layout=$Layout;name='PLC Engineering Suite_Signed16';sha256='229A08B2DBC0C8EFD321B5F5614A98EEFB8D685C232F098F6EEF7A784A172520';types=@('int16');stride=1}}
  'int32' {return @{layout=$Layout;name='PLC Engineering Suite_Int32';sha256='32360636046CC8B491DE7662C561C9AB0E9BA33ECB2EE1481367EFAE301F5AE7';types=@('int32');stride=2}}
  'float32' {return @{layout=$Layout;name='PLC Engineering Suite_Float32';sha256='689EBEC79B1D606DBFB7876D51BD2FD25C5DFFDAE2BE0B4BDE69C55F41335AD1';types=@('float32');stride=2}}
  'mixed_numeric' {return @{layout=$Layout;name='PLC Engineering Suite_MixedNumeric';sha256='249B39BF9F8A7B4E3F4C57C56CE97C282C2230536FF9D1CE67AD529B2B515E02';types=@('int16','int32','float32');stride=5}}
  default {throw 'Unknown native numeric recipe format.'}
 }
}
function ConvertTo-WeinviewRecipeValues($Values,$Profile) {
 if($Values -isnot [array] -or $Values.Count -lt 1 -or $Values.Count -gt 256){throw 'Recipe values array1..256 required.'}
 $result=@()
 foreach($row in $Values){
  if($Profile.types.Count -eq 1){if($row -is [array]){throw 'Single-column recipe requires scalar values.'};$cells=@($row)}else{if($row -isnot [array] -or $row.Count -ne 3){throw 'Mixed recipe rows require int16/int32/float32 in that order.'};$cells=$row}
  $converted=@()
  for($i=0;$i -lt $Profile.types.Count;$i++){
   $v=$cells[$i];$type=$Profile.types[$i]
   if($type -ceq 'float32'){
    if($v -isnot [int] -and $v -isnot [long] -and $v -isnot [double] -and $v -isnot [single] -and $v -isnot [decimal]){throw 'Recipe float32 requires a JSON number.'}
    $n=[single][double]$v;if([single]::IsNaN($n) -or [single]::IsInfinity($n)){throw 'Recipe float32 must remain finite after normalization.'};$converted+=[double]$n
   }else{
    $limit=if($type -ceq 'int16'){32767L}else{2147483647L}
    if(($v -isnot [int] -and $v -isnot [long]) -or $v -lt (-$limit-1) -or $v -gt $limit){throw 'Recipe integer must fit its native field type.'};$converted+=[long]$v
   }
  }
  if($Profile.types.Count -eq 1){$result+=$converted[0]}else{$result+=,$converted}
 }
 return ,$result
}
function Get-WeinviewRecipeRcpBytes($Values,$Profile) {
 $stream=New-Object IO.MemoryStream
 try{
  foreach($row in $Values){$cells=if($Profile.types.Count -eq 1){@($row)}else{$row};for($i=0;$i -lt $Profile.types.Count;$i++){
   $bytes=switch($Profile.types[$i]){'int16'{[BitConverter]::GetBytes([int16]$cells[$i])};'int32'{[BitConverter]::GetBytes([int32]$cells[$i])};'float32'{[BitConverter]::GetBytes([single]$cells[$i])}}
   $stream.Write($bytes,0,$bytes.Length)
  }}
  return ,$stream.ToArray()
 }finally{$stream.Dispose()}
}
function Read-WeinviewRecipeRcpValues([byte[]]$Bytes,$Profile) {
 if(![BitConverter]::IsLittleEndian -or !$Bytes.Length -or $Bytes.Length%($Profile.stride*2)){throw 'Whole original little-endian numeric recipe required.'}
 $values=@();$offset=0
 while($offset -lt $Bytes.Length){$cells=@();foreach($type in $Profile.types){
  switch($type){'int16'{$cells+=[long][BitConverter]::ToInt16($Bytes,$offset);$offset+=2};'int32'{$cells+=[long][BitConverter]::ToInt32($Bytes,$offset);$offset+=4};'float32'{$n=[BitConverter]::ToSingle($Bytes,$offset);if([single]::IsNaN($n) -or [single]::IsInfinity($n)){throw 'Non-finite native recipe value cannot be returned as JSON.'};$cells+=[double]$n;$offset+=4}}
 };if($Profile.types.Count -eq 1){$values+=$cells[0]}else{$values+=,$cells}}
 return ,$values
}
function Assert-WeinviewRecipeFileArguments([string]$Operation,$Arguments,[string]$BridgeRoot) {
 if($Operation -cnotin @('recipe_file_read','recipe_file_create')){throw 'Finite Recipe file operation required.'}
 $required=if($Operation -ceq 'recipe_file_read'){@('workspace_root','file_path','expected_file_sha256','exe_path')}else{@('workspace_root','output_path','values','exe_path')}
 $allowed=$required+@('format')
 if(@($required|Where-Object {$_ -cnotin $Arguments.PSObject.Properties.Name}).Count -or @($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $allowed}).Count){throw 'Exact Recipe file arguments required.'}
 $layout=if($Arguments.PSObject.Properties.Name -ccontains 'format'){if($Arguments.format -isnot [string]){throw 'Recipe format must be a string.'};$Arguments.format}else{'int16'}
 $profile=Get-WeinviewRecipeProfile $layout
 foreach($key in @('workspace_root','exe_path')){if($Arguments.$key -isnot [string]){throw 'Recipe local path strings required.'}}
 $root=Workspace $Arguments.workspace_root;$exe=SafePath $Arguments.exe_path
 $exeSha='A4EEFAB09BA962093D1D743CA4EC5D762F29B68746D79B9F1FB2BA366AE115BA';$langSha='6D1A7CB2BA681078E8ADD260A96E6AC24A6347DDB3AF9860CCEF28BF47908C27';$fmtSha=$profile.sha256
 if([IO.Path]::GetFileName($exe) -cne 'RecipeEditor.exe' -or !(Test-Path -LiteralPath $exe -PathType Leaf) -or (Hash $exe) -cne $exeSha){throw 'Pinned original RecipeEditor.exe required.'}
 $lang=SafePath (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'RecipeEditorLang.dll');$fmt=SafePath (Join-Path $BridgeRoot ('recipe_profiles\'+$profile.name+'.dataEX.fmt'))
 if(!(Test-Path -LiteralPath $lang -PathType Leaf) -or (Hash $lang) -cne $langSha -or !(Test-Path -LiteralPath $fmt -PathType Leaf) -or (Hash $fmt) -cne $fmtSha){throw 'Pinned original Recipe language and native numeric format required.'}
 $source=$null;$output=$null;$sourceSha=$null;$count=0;$values=@()
 if($Operation -ceq 'recipe_file_read'){
  if($Arguments.file_path -isnot [string] -or $Arguments.expected_file_sha256 -isnot [string] -or $Arguments.expected_file_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Recipe input path and exact SHA256 required.'}
  $source=Under $Arguments.file_path $root
  if([IO.Path]::GetExtension($source) -ine '.rcp' -or !(Test-Path -LiteralPath $source -PathType Leaf)){throw 'Existing workspace .rcp required.'}
  $length=(Get-Item -LiteralPath $source).Length;$stride=$profile.stride*2;if($length -lt $stride -or $length -gt 256*$stride -or $length%$stride){throw 'Whole native numeric Recipe requires1..256 complete records.'}
  $sourceSha=Hash $source;if($sourceSha -ine $Arguments.expected_file_sha256){throw 'Recipe input SHA256 differs.'};$count=[int]($length/$stride)
 }else{
  if($Arguments.output_path -isnot [string]){throw 'Fresh Recipe output path string required.'};$output=Under $Arguments.output_path $root
  if([IO.Path]::GetExtension($output) -ine '.rcp' -or (Test-Path -LiteralPath $output) -or !(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($output)) -PathType Container)){throw 'Fresh workspace .rcp with existing parent required.'}
  if($Arguments.values -isnot [Array] -or $Arguments.values.Count -lt 1 -or $Arguments.values.Count -gt 256){throw 'Recipe values array1..256 required.'}
  $values=ConvertTo-WeinviewRecipeValues $Arguments.values $profile;$count=$values.Count
 }
 return [pscustomobject]@{operation=$Operation;root=$root;exe=$exe;exe_sha256=$exeSha;lang=$lang;lang_sha256=$langSha;format_path=$fmt;format_sha256=$fmtSha;source=$source;source_sha256=$sourceSha;output=$output;count=$count;values=$values;profile=$profile;word_count=($count*$profile.stride)}
}

function Write-WeinviewRecipeFileJournal([string]$Path,$Value) {
 if(Test-Path -LiteralPath $Path){throw 'Fresh Recipe journal path required.'}
 [IO.File]::WriteAllText($Path,($Value|ConvertTo-Json -Depth 12),(New-Object Text.UTF8Encoding($true)))
}
function Get-WeinviewRecipeCsvBytes($Values,$Profile=(Get-WeinviewRecipeProfile)) {
 $lines=@();foreach($row in $Values){$cells=if($Profile.types.Count -eq 1){@($row)}else{$row};$text=@();for($i=0;$i -lt $cells.Count;$i++){
  if($Profile.types[$i] -ceq 'float32'){$v=[double]$cells[$i];$text+=if($v -eq 0 -and [BitConverter]::ToInt64([BitConverter]::GetBytes($v),0) -lt 0){'-0'}else{$v.ToString('R',[Globalization.CultureInfo]::InvariantCulture)}}else{$text+=([long]$cells[$i]).ToString([Globalization.CultureInfo]::InvariantCulture)}
 };$lines+=($text -join ',')}
 $encoding=New-Object Text.UTF8Encoding($true,$true)
 return ,([byte[]]($encoding.GetPreamble()+$encoding.GetBytes(($lines -join "`r`n")+"`r`n")))
}
function Read-WeinviewRecipeNativeCsv([string]$Path,[int]$Count,$Values,$Profile) {
 $bytes=[IO.File]::ReadAllBytes($Path)
 if($bytes.Length -lt 6 -or $bytes[0] -ne 239 -or $bytes[1] -ne 187 -or $bytes[2] -ne 191){throw 'Native Recipe CSV UTF8 BOM required.'}
 $text=[Text.UTF8Encoding]::new($false,$true).GetString($bytes,3,$bytes.Length-3)
 if(!$text.EndsWith("`r`n",[StringComparison]::Ordinal)){throw 'Native Recipe CSV final CRLF required.'}
 $lines=$text.Substring(0,$text.Length-2).Split(@("`r`n"),[StringSplitOptions]::None);$display=@();$loss=$false
 if($lines.Count -ne $Count){throw 'Native Recipe CSV whole-file row count differs.'}
 for($row=0;$row -lt $Count;$row++){
  $fields=$lines[$row].Split(',');$native=if($Profile.types.Count -eq 1){@($Values[$row])}else{$Values[$row]}
  if($fields.Count -ne $Profile.types.Count){throw 'Native Recipe CSV field count differs.'}
  for($i=0;$i -lt $fields.Count;$i++){
   if($Profile.types[$i] -ceq 'float32'){
    $n=0.0;if($fields[$i] -cnotmatch '^-?(?:[0-9]+(?:\.[0-9]*)?)(?:[eE][+-]?[0-9]+)?$' -or ![double]::TryParse($fields[$i],[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture,[ref]$n) -or [double]::IsNaN($n) -or [double]::IsInfinity($n) -or [Math]::Abs($n-$native[$i]) -gt [Math]::Max([Math]::Abs($native[$i])*0.000006,1.401298464324817E-45)){throw 'Native float32 display differs from original numeric bytes.'}
    if([BitConverter]::ToInt32([BitConverter]::GetBytes([single]$n),0) -ne [BitConverter]::ToInt32([BitConverter]::GetBytes([single]$native[$i]),0)){$loss=$true}
   }elseif($fields[$i] -cne ([long]$native[$i]).ToString([Globalization.CultureInfo]::InvariantCulture)){throw 'Native Recipe integer CSV differs from original numeric bytes.'}
  };$display+=,$fields
 }
 return [pscustomobject]@{values=$Values;display=$display;precision_loss=$loss;byte_length=$bytes.Length;sha256=(Hash $Path)}
}

function Invoke-WeinviewRecipeNativeCli($Context,[string]$Runtime,$Argv,[string]$Phase) {
 $exe=Join-Path $Runtime 'RecipeEditor.exe';$arguments=@()
 foreach($arg in $Argv){if($arg -isnot [string] -or !$arg.Length -or $arg -match '["\x00-\x1f\x7f]' -or $arg.EndsWith('\')){throw 'Finite Recipe argv cannot contain quotes/control/trailing slash.'};$arguments+='"'+$arg+'"'}
 if((Hash $exe) -cne $Context.exe_sha256 -or (Hash (Join-Path $Runtime 'RecipeEditorLang.dll')) -cne $Context.lang_sha256 -or (Hash (Join-Path $Runtime 'dataEX.fmt')) -cne $Context.format_sha256){throw 'Owned Recipe runtime pins changed before launch.'}
 $start=New-Object Diagnostics.ProcessStartInfo;$start.FileName=$exe;$start.Arguments=$arguments -join ' ';$start.WorkingDirectory=$Runtime;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.WindowStyle=[Diagnostics.ProcessWindowStyle]::Hidden;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
 $process=New-Object Diagnostics.Process;$process.StartInfo=$start;$watch=[Diagnostics.Stopwatch]::StartNew();$journalPath=Join-Path $Runtime ($Phase+'.process.json');$receipt=[ordered]@{phase=$Phase;pid=$null;creation_utc_ticks=$null;exe_path=$exe;exe_sha256=$Context.exe_sha256;cwd=$Runtime;argv=@($exe)+@($Argv);arguments=$start.Arguments;exit_code=$null;elapsed_ms=$null;ui_actions=0;global_input=$false;no_forced_termination=$true;normal_exit_verified=$false;stdout=$null;stderr=$null;observed_main_windows=@();owner_live=$false}
 try{
  if(!$process.Start()){throw 'Original Recipe CLI process did not start.'};$receipt.pid=$process.Id;$receipt.creation_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;$receipt.owner_live=$true
  $outTask=$process.StandardOutput.ReadToEndAsync();$errTask=$process.StandardError.ReadToEndAsync()
  do{
   if($process.WaitForExit(20)){break};$process.Refresh();if($process.HasExited){break}
   $windowHandle=$process.MainWindowHandle;if($process.HasExited){break}
   if($null -eq $windowHandle){throw 'Live original Recipe CLI window handle unavailable; owned process retained.'}
   if($windowHandle.ToInt64() -ne 0){$receipt.observed_main_windows+=@{hwnd=$windowHandle.ToInt64();title=$process.MainWindowTitle};throw 'Unexpected owned Recipe CLI window; preserve process, no UI action.'}
  }while($watch.ElapsedMilliseconds -lt 8000)
  if(!$process.HasExited){throw 'Original Recipe CLI exceeded8second deadline; owned process retained.'}
  $process.WaitForExit();$receipt.owner_live=$false;$receipt.exit_code=$process.ExitCode;$receipt.stdout=$outTask.Result;$receipt.stderr=$errTask.Result
  if($receipt.exit_code -ne 0){throw 'Original Recipe CLI nonzero exit; preserve native evidence.'}
  if((Hash $exe) -cne $Context.exe_sha256 -or (Hash (Join-Path $Runtime 'RecipeEditorLang.dll')) -cne $Context.lang_sha256 -or (Hash (Join-Path $Runtime 'dataEX.fmt')) -cne $Context.format_sha256){throw 'Owned Recipe runtime pins changed after CLI.'}
  $watch.Stop();$receipt.elapsed_ms=$watch.ElapsedMilliseconds;$receipt.normal_exit_verified=$true;return [pscustomobject]$receipt
 }catch{$receipt['error']=$_.Exception.Message;$_.Exception.Data['recipe_native_process']=$receipt;$_.Exception.Data['recipe_runtime_directory']=$Runtime;throw}
 finally{$watch.Stop();$receipt.elapsed_ms=$watch.ElapsedMilliseconds;Write-WeinviewRecipeFileJournal $journalPath $receipt;$process.Dispose()}
}

function Invoke-WeinviewRecipeFileOperation([string]$Operation,$Arguments,[string]$BridgeRoot) {
 $context=Assert-WeinviewRecipeFileArguments $Operation $Arguments $BridgeRoot
 $runtime=Under (Join-Path $context.root ('.weinview-recipe-'+[guid]::NewGuid().ToString('N'))) $context.root
 $null=[IO.Directory]::CreateDirectory($runtime)
 foreach($pair in @(@($context.exe,'RecipeEditor.exe',$context.exe_sha256),@($context.lang,'RecipeEditorLang.dll',$context.lang_sha256),@($context.format_path,'dataEX.fmt',$context.format_sha256))){$destination=Join-Path $runtime $pair[1];[IO.File]::Copy($pair[0],$destination,$false);if((Hash $destination) -cne $pair[2]){throw 'Original Recipe runtime copy SHA differs.'}}
 $csv=Join-Path $runtime 'native-export.csv';$rcp=Join-Path $runtime 'native.rcp';$processes=@();$source=$context.source;$sourceSha=$context.source_sha256;$roundtrip=$false
 $journal=[ordered]@{operation=$Operation;runtime_directory=$runtime;phase='prepare';source_path=$source;source_sha256=$sourceSha;requested_values=$context.values;processes=@();output_published=$false;no_forced_termination=$true}
 try{
  if($Operation -ceq 'recipe_file_read'){
   $rcp=Join-Path $runtime 'source.rcp';[IO.File]::Copy($source,$rcp,$false);if((Hash $rcp) -cne $sourceSha -or (Hash $source) -cne $sourceSha){throw 'Recipe source copy/input changed before CLI.'}
  }else{
   $source=Join-Path $runtime 'requested.csv';$bytes=Get-WeinviewRecipeCsvBytes $context.values $context.profile;[IO.File]::WriteAllBytes($source,$bytes);$sourceSha=Hash $source;$journal.source_path=$source;$journal.source_sha256=$sourceSha;$journal.phase='native_import'
   $processes+=Invoke-WeinviewRecipeNativeCli $context $runtime @('/f',$context.profile.name,'0',([string]($context.word_count-1)),$source,$rcp) 'import'
   if(!(Test-Path -LiteralPath $rcp -PathType Leaf) -or (Get-Item -LiteralPath $rcp).Length -ne 2*$context.word_count){throw 'Original Recipe import whole-file byte count differs.'}
  }
  $rcpSha=Hash $rcp;$journal.phase='native_export'
  $processes+=Invoke-WeinviewRecipeNativeCli $context $runtime @('/c8','/f',$context.profile.name,'0',([string]($context.word_count-1)),$rcp,$csv) 'export'
  if(!(Test-Path -LiteralPath $csv -PathType Leaf)){throw 'Original Recipe CSV export absent.'}
  $nativeValues=Read-WeinviewRecipeRcpValues ([IO.File]::ReadAllBytes($rcp)) $context.profile
  $actual=Read-WeinviewRecipeNativeCsv $csv $context.count $nativeValues $context.profile
  if((Hash $rcp) -cne $rcpSha -or (Hash $source) -cne $sourceSha){throw 'Original Recipe CLI changed input file.'}
  if($Operation -ceq 'recipe_file_create'){
   $expectedBytes=Get-WeinviewRecipeRcpBytes $context.values $context.profile
   if([Convert]::ToBase64String([IO.File]::ReadAllBytes($rcp)) -cne [Convert]::ToBase64String($expectedBytes)){throw 'Original Recipe roundtrip numeric bytes differ.'};$roundtrip=$true
   if(Test-Path -LiteralPath $context.output){throw 'Recipe final output became occupied; never overwrite.'};[IO.File]::Copy($rcp,$context.output,$false);if((Hash $context.output) -cne $rcpSha){throw 'Recipe final output SHA differs.'};$journal.output_published=$true
  }
  $journal.phase='complete';$journal.processes=$processes
  return [pscustomobject]@{operation=$Operation;profile=if($context.profile.layout -ceq 'int16'){'weinview-cn421-native-recipe-signed16-file-v1'}else{'weinview-cn421-native-recipe-numeric-file-v2'};format=$context.profile.name;layout=$context.profile.layout;word_stride=$context.profile.stride;value_source='native-rcp-bytes';binary_precision_verified=$true;csv_values_text=$actual.display;csv_precision_loss_detected=$actual.precision_loss;format_sha256=$context.format_sha256;format_path=(Join-Path $runtime 'dataEX.fmt');runtime_directory=$runtime;values=@($actual.values);count=$context.count;start_word=0;end_word=($context.word_count-1);rcp_path=$rcp;rcp_sha256=$rcpSha;rcp_byte_length=(Get-Item -LiteralPath $rcp).Length;rcp_bytes_hex=([BitConverter]::ToString([IO.File]::ReadAllBytes($rcp)).Replace('-',''));csv_path=$csv;csv_sha256=$actual.sha256;csv_byte_length=$actual.byte_length;csv_encoding='UTF8-BOM';csv_line_ending='CRLF';csv_header=$false;source_path=$source;source_sha256=$sourceSha;source_unchanged=$true;output_path=$context.output;output_sha256=if($context.output){Hash $context.output}else{$null};native_cli_verified=$true;normal_native_exit_verified=$true;roundtrip_verified=$roundtrip;full_properties_verified=$false;plc_communication_tested=$false;ui_actions=0;global_input=$false;no_forced_termination=$true;processes=$processes}
 }catch{$journal['error']=$_.Exception.Message;$journal.processes=$processes;throw}finally{Write-WeinviewRecipeFileJournal (Join-Path $runtime 'operation.json') $journal}
}
function Invoke-WeinviewRecipeFileRead($Arguments,[string]$BridgeRoot){Invoke-WeinviewRecipeFileOperation 'recipe_file_read' $Arguments $BridgeRoot}
function Invoke-WeinviewRecipeFileCreate($Arguments,[string]$BridgeRoot){Invoke-WeinviewRecipeFileOperation 'recipe_file_create' $Arguments $BridgeRoot}
