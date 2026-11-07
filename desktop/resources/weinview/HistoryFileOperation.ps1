# Dot-source only. CN421 original EasyConverter finite DTL/EVT CSV read.
function Assert-WeinviewHistoryFileArguments($Arguments,[string]$BridgeRoot,[string]$ExpectedExtension='.dtl') {
 if($ExpectedExtension -cnotin @('.dtl','.evt')){throw 'Finite private History extension required.'}
 $keys=@($Arguments.PSObject.Properties.Name)
 if($keys.Count -lt 3 -or $keys.Count -gt 4 -or @($keys|Where-Object {$_ -cnotin @('workspace_root','file_path','expected_file_sha256','exe_path')}).Count){throw 'Exact History file read arguments required.'}
 foreach($key in @('workspace_root','file_path','expected_file_sha256','exe_path')){if($Arguments.$key -isnot [string]){throw 'History paths/SHA and internally resolved converter required.'}}
 if($Arguments.expected_file_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Exact History source SHA256 required.'}
 $root=Workspace $Arguments.workspace_root;$source=Under $Arguments.file_path $root;$exe=SafePath $Arguments.exe_path
 if([IO.Path]::GetExtension($source) -ine $ExpectedExtension -or !(Test-Path -LiteralPath $source -PathType Leaf)){throw ('Existing workspace '+$ExpectedExtension+' required.')}
 $length=(Get-Item -LiteralPath $source).Length;if($length -lt 1 -or $length -gt 1048576){throw ('History '+$ExpectedExtension.Substring(1).ToUpperInvariant()+' product bound1..1048576bytes required.')}
 $sourceSha=Hash $source;if($sourceSha -ine $Arguments.expected_file_sha256){throw ('History '+$ExpectedExtension.Substring(1).ToUpperInvariant()+' source SHA differs.')}
 if([IO.Path]::GetFileName($exe) -cne 'EasyConverter.exe'){throw 'Internally resolved original EasyConverter.exe required.'}
 $directory=[IO.Path]::GetDirectoryName($exe);$pins=@(
 @('EasyConverter.exe','7E666052884506FD00E0E4FFE5491B9C465543B9287A9FBE29A7B60F95628D56',3633600),
 @('EasyConverterLang.dll','325AD34CFAF10348AB1FD0E2991780B09619AB925E0268CD54D8DCAF3EF90984',59904),
 @('libxl.dll','D905342E9E0CD2294D45796A3C67AC401BCFF26DEA5AF562552A7DF7BA63331E',3654656),
 @('libmariadb.dll','E04CFFB0B462CA47078616556A28C8086C3E760960A9433C9CCD3B9A69778DC9',350208),
 @('BCGCBPRO2520u140.dll','A48959A403AD4ECEB1BDC0C46FAC9E423121A32FC2A30F42608C5A452ACCBD3A',9354752))
 $files=@();foreach($pin in $pins){$path=SafePath (Join-Path $directory $pin[0]);if(!(Test-Path -LiteralPath $path -PathType Leaf) -or (Get-Item -LiteralPath $path).Length -ne $pin[2] -or (Hash $path) -cne $pin[1]){throw 'Exact observed original converter dependencies required.'};$files+=[pscustomobject]@{name=$pin[0];path=$path;sha256=$pin[1];byte_length=$pin[2]}}
 return [pscustomobject]@{root=$root;source=$source;source_sha256=$sourceSha;source_byte_length=$length;files=$files;exe_sha256=$files[0].sha256}
}
function Write-WeinviewHistoryFileJournal([string]$Path,$Value) {
 if(Test-Path -LiteralPath $Path){throw 'Fresh History journal required.'};[IO.File]::WriteAllText($Path,($Value|ConvertTo-Json -Depth 12),(New-Object Text.UTF8Encoding($true)))
}
function ConvertFrom-WeinviewHistoryCsvText([string]$Text) {
 $rows=[Collections.Generic.List[object]]::new();$fields=[Collections.Generic.List[string]]::new();$field=[Text.StringBuilder]::new();$quoted=$false;$closed=$false;$started=$false;$recordStart=0
 for($index=0;$index -lt $Text.Length;$index++){
  $character=$Text[$index]
  if($character -eq [char]0){throw 'History CSV NUL rejected.'}
  if($character -eq [char]13 -and ($index+1 -ge $Text.Length -or $Text[$index+1] -ne [char]10)){throw 'History CSV CRLF required.'}
  if($character -eq [char]10 -and ($index -eq 0 -or $Text[$index-1] -ne [char]13)){throw 'History CSV CRLF required.'}
  if($quoted){if($character -eq [char]34){if($index+1 -lt $Text.Length -and $Text[$index+1] -eq [char]34){[void]$field.Append([char]34);$index++}else{$quoted=$false;$closed=$true}}else{[void]$field.Append($character)};continue}
  if($character -eq [char]44 -or $character -eq [char]13){
   $fields.Add($field.ToString());[void]$field.Clear();$closed=$false;$started=$false
   if($character -eq [char]13){$index++;$rows.Add([ordered]@{record_index=$rows.Count;fields=@($fields.ToArray());raw_csv=$Text.Substring($recordStart,$index+1-$recordStart)});$fields.Clear();$recordStart=$index+1;if($rows.Count -gt 4097){throw 'History CSV product bound4096data records exceeded.'}}
   continue
  }
  if($closed){throw 'History CSV text after closing quote rejected.'}
  if($character -eq [char]34){if($started -or $field.Length){throw 'History CSV quote inside unquoted field rejected.'};$quoted=$true;$started=$true}else{[void]$field.Append($character);$started=$true}
 }
 if($quoted -or $recordStart -ne $Text.Length){throw 'History CSV complete quoted records/final CRLF required.'}
 return ,$rows.ToArray()
}
function Read-WeinviewHistoryNativeCsv([string]$Path,[string]$Kind='dtl') {
 if($Kind -cnotin @('dtl','evt')){throw 'Finite private History CSV kind required.'}
 $bytes=[IO.File]::ReadAllBytes($Path);if($bytes.Length -lt 3 -or $bytes.Length -gt 1048576 -or $bytes[0] -ne 239 -or $bytes[1] -ne 187 -or $bytes[2] -ne 191){throw 'Native History CSV bounded UTF8-BOM required.'}
 $encoding=[Text.UTF8Encoding]::new($false,$true);$text=$encoding.GetString($bytes,3,$bytes.Length-3);$rows=ConvertFrom-WeinviewHistoryCsvText $text
 if($Kind -ceq 'evt'){
  $header=@('事件','类别','日期','时间','信息','发生次数','累计时间')
  if($rows.Count -lt 1 -or @($rows[0].fields).Count -ne 7){throw 'Only observed seven-column Event History header accepted.'}
  for($column=0;$column -lt 7;$column++){if($rows[0].fields[$column] -cne $header[$column]){throw 'Exact native Event History header required.'}}
  $records=@();foreach($row in @($rows|Select-Object -Skip 1)){
   if(@($row.fields).Count -ne 7){throw 'Only observed seven-column native Event History rows accepted.'}
   $records+=[pscustomobject]@{event_text=[string]$row.fields[0];category_text=[string]$row.fields[1];date_text=[string]$row.fields[2];time_text=[string]$row.fields[3];message_text=[string]$row.fields[4];occurrence_count_text=[string]$row.fields[5];accumulated_time_text=[string]$row.fields[6]}
  }
  if((($rows|ForEach-Object {$_.raw_csv}) -join '') -cne $text){throw 'Event History raw records do not reconstruct complete native CSV.'}
  return [pscustomobject]@{csv_path=$Path;csv_sha256=(Hash $Path);csv_byte_length=$bytes.Length;csv_encoding='UTF8-BOM';csv_line_ending='CRLF';header=@($rows[0].fields);raw_rows=@($rows);records=$records;record_count=$records.Count}
 }
 if($rows.Count -lt 1 -or @($rows[0].fields).Count -lt 4 -or @($rows[0].fields).Count -gt 1003 -or $rows[0].fields[0] -cne '日期' -or $rows[0].fields[1] -cne '时间' -or $rows[0].fields[2] -cne '毫秒'){throw 'Native History requires its three original time columns and1..1000 data columns.'}
 $channelCount=@($rows[0].fields).Count-3
 $channelNames=@($rows[0].fields[3..(@($rows[0].fields).Count-1)])
 if(@($channelNames|Where-Object {$_ -isnot [string] -or !$_.Length}).Count){throw 'Native History channel labels must be nonempty original strings.'}
 if($channelCount -gt 1){
  # The cap bounds product payload cost; it is not a claim about the vendor's channel limit.
  # Keep repeated labels by position, and all values as the original converter text.
  $records=@();foreach($row in @($rows|Select-Object -Skip 1)){
   if(@($row.fields).Count -ne $channelCount+3){throw 'Native multi-channel History row width differs from its header.'}
   $records+=[pscustomobject]@{date_text=[string]$row.fields[0];time_text=[string]$row.fields[1];millisecond_text=[string]$row.fields[2];values_text=@($row.fields[3..($channelCount+2)])}
  }
  if((($rows|ForEach-Object {$_.raw_csv}) -join '') -cne $text){throw 'Multi-channel History raw records do not reconstruct complete native CSV.'}
  return [pscustomobject]@{csv_path=$Path;csv_sha256=(Hash $Path);csv_byte_length=$bytes.Length;csv_encoding='UTF8-BOM';csv_line_ending='CRLF';header=@($rows[0].fields);channel_names=$channelNames;channel_count=$channelCount;raw_rows=@($rows);records=$records;record_count=$records.Count}
 }
 $records=@();foreach($row in @($rows|Select-Object -Skip 1)){if(@($row.fields).Count -ne 4){throw 'Only single-channel native History rows accepted.'};$records+=[pscustomobject]@{date_text=[string]$row.fields[0];time_text=[string]$row.fields[1];millisecond_text=[string]$row.fields[2];value_text=[string]$row.fields[3]}}
 if((($rows|ForEach-Object {$_.raw_csv}) -join '') -cne $text){throw 'History raw records do not reconstruct complete native CSV.'}
 return [pscustomobject]@{csv_path=$Path;csv_sha256=(Hash $Path);csv_byte_length=$bytes.Length;csv_encoding='UTF8-BOM';csv_line_ending='CRLF';header=@($rows[0].fields);channel_name=[string]$rows[0].fields[3];raw_rows=@($rows);records=$records;record_count=$records.Count}
}
function Assert-WeinviewHistoryRuntimePins($Files) {
 foreach($file in $Files){if(!(Test-Path -LiteralPath $file.path -PathType Leaf) -or (Get-Item -LiteralPath $file.path).Length -ne $file.byte_length -or (Hash $file.path) -cne $file.sha256){throw 'Owned History converter dependency changed.'}}
}
function Invoke-WeinviewHistoryNativeCli($Context,[string]$Runtime,[string]$SourceCopy,[string]$Csv,$Dependencies) {
 $exe=Join-Path $Runtime 'EasyConverter.exe';$argv=@('/c8','/b1','/t1',$SourceCopy,$Csv);$arguments=@()
 foreach($arg in $argv){if($arg -isnot [string] -or !$arg.Length -or $arg -match '["\x00-\x1f\x7f]' -or $arg.EndsWith('\')){throw 'Finite History argv quotes/control/trailing slash rejected.'};$arguments+='"'+$arg+'"'}
 Assert-WeinviewHistoryRuntimePins $Dependencies
 $start=New-Object Diagnostics.ProcessStartInfo;$start.FileName=$exe;$start.Arguments=$arguments -join ' ';$start.WorkingDirectory=$Runtime;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.WindowStyle=[Diagnostics.ProcessWindowStyle]::Hidden;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
 $process=New-Object Diagnostics.Process;$process.StartInfo=$start;$watch=[Diagnostics.Stopwatch]::StartNew();$receipt=[ordered]@{phase='export';pid=$null;creation_utc_ticks=$null;exe_path=$exe;exe_sha256=$Context.exe_sha256;cwd=$Runtime;argv=@($exe)+$argv;arguments=$start.Arguments;exit_code=$null;elapsed_ms=$null;ui_actions=0;global_input=$false;no_forced_termination=$true;normal_exit_verified=$false;stdout=$null;stderr=$null;observed_main_windows=@();owner_live=$false}
 try{
  if(!$process.Start()){throw 'Original History converter did not start.'};$receipt.pid=$process.Id;$receipt.creation_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;$receipt.owner_live=$true
  $outTask=$process.StandardOutput.ReadToEndAsync();$errTask=$process.StandardError.ReadToEndAsync()
  do{
   if($process.WaitForExit(20)){break};$process.Refresh();if($process.HasExited){break}
   $windowHandle=$process.MainWindowHandle;if($process.HasExited){break}
   if($null -eq $windowHandle){throw 'Live History converter window handle unavailable; owned process retained.'}
   if($windowHandle.ToInt64() -ne 0){$receipt.observed_main_windows+=@{hwnd=$windowHandle.ToInt64();title=$process.MainWindowTitle};throw 'Unexpected owned History converter window; retained without UI input.'}
  }while($watch.ElapsedMilliseconds -lt 8000)
  if(!$process.HasExited){throw 'Original History converter exceeded8second deadline; owned process retained.'}
  $process.WaitForExit();$receipt.owner_live=$false;$receipt.exit_code=$process.ExitCode;$receipt.stdout=$outTask.Result;$receipt.stderr=$errTask.Result
  if($receipt.exit_code -ne 0){throw 'Original History converter nonzero exit; preserve native evidence.'}
  Assert-WeinviewHistoryRuntimePins $Dependencies
  $watch.Stop();$receipt.elapsed_ms=$watch.ElapsedMilliseconds;$receipt.normal_exit_verified=$true;return [pscustomobject]$receipt
 }catch{$receipt['error']=$_.Exception.Message;$_.Exception.Data['history_native_process']=$receipt;$_.Exception.Data['history_runtime_directory']=$Runtime;$_.Exception.Data['history_process_journal']=(Join-Path $Runtime 'export.process.json');throw}
 finally{$watch.Stop();$receipt.elapsed_ms=$watch.ElapsedMilliseconds;Write-WeinviewHistoryFileJournal (Join-Path $Runtime 'export.process.json') $receipt;$process.Dispose()}
}
function Assert-WeinviewHistoryDbArguments($Arguments,[string]$BridgeRoot) {
 $keys=if($Arguments -is [Collections.IDictionary]){@($Arguments.Keys)}else{@($Arguments.PSObject.Properties.Name)}
 if($keys.Count -ne 4 -or @($keys|Where-Object {$_ -cnotin @('workspace_root','file_path','expected_file_sha256','exe_path')}).Count){throw 'Exact existing history file arguments required.'}
 if($Arguments.expected_file_sha256 -isnot [string] -or $Arguments.expected_file_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Exact native database SHA required.'}
 $root=Workspace $Arguments.workspace_root;$source=Under $Arguments.file_path $root
 if([IO.Path]::GetExtension($source) -ine '.db' -or !(Test-Path -LiteralPath $source -PathType Leaf)){throw 'Actual workspace database snapshot required.'}
 if((Get-Item -LiteralPath $source).Length -lt 100 -or (Get-Item -LiteralPath $source).Length -gt 1048576 -or (Hash $source) -ine $Arguments.expected_file_sha256){throw 'Database snapshot size or SHA differs.'}
 foreach($suffix in @('-wal','-shm','-journal')){if(Test-Path -LiteralPath ($source+$suffix)){throw 'Live database journal rejected; a stable native snapshot is required.'}}
 $header=[IO.File]::ReadAllBytes($source);if([Text.Encoding]::ASCII.GetString($header,0,16) -cne "SQLite format 3`0"){throw 'Actual SQLite3 snapshot required.'}
 $codec=SafePath (Join-Path $BridgeRoot 'EventTableCodec');$manifestPath=SafePath (Join-Path $codec 'buildmanifest.json')
 if((Hash $manifestPath) -cne '55696C14F37D7CAC118A93CC114000ACB1904A95D197DDC9DEAB98C175546BEE'){throw 'Trusted bundled database codec manifest differs.'}
 $manifest=Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
 foreach($file in $manifest.source_and_package_files){
  if($file.relative_path -isnot [string] -or $file.relative_path -match '(^/|\\|:|(^|/)\.\.?(/|$)|//)'){throw 'Exact packaged codec relative path required.'}
  $path=Under (Join-Path $codec $file.relative_path) $codec
  if(!(Test-Path -LiteralPath $path -PathType Leaf) -or (Get-Item -LiteralPath $path).Length -ne $file.bytes -or (Hash $path) -cne $file.sha256){throw 'Frozen database codec dependency changed.'}
 }
 $helper=SafePath (Get-WeinviewRecipePython)
 $script=SafePath (Join-Path $codec 'source/event_table_codec.py')
 return @{root=$root;source=$source;source_sha256=(Hash $source);source_byte_length=$header.Length;codec=$codec;helper=$helper;helper_sha256=(Hash $helper);script=$script;manifest=$manifestPath;manifest_sha256=(Hash $manifestPath)}
}
function Invoke-WeinviewHistoryDbRead($Arguments,[string]$BridgeRoot) {
 $context=Assert-WeinviewHistoryDbArguments $Arguments $BridgeRoot
 $runtime=Under (Join-Path $context.root ('.weinview-history-'+[guid]::NewGuid().ToString('N'))) $context.root;[void][IO.Directory]::CreateDirectory($runtime)
 $copy=Join-Path $runtime 'source.db';$requestPath=Join-Path $runtime 'db.request.json';$responsePath=Join-Path $runtime 'db.response.json';$journal=Join-Path $runtime 'operation.json'
 $native=[ordered]@{phase='database_read';pid=$null;creation_utc_ticks=$null;exe_path=$context.helper;exe_sha256=$context.helper_sha256;cwd=[IO.Path]::GetDirectoryName($context.script);argv=@($context.helper,'-B',$context.script,$requestPath,$responsePath);exit_code=$null;elapsed_ms=$null;stdout=$null;stderr=$null;ui_actions=0;global_input=$false;owner_live=$false;normal_exit_verified=$false;no_forced_termination=$true}
 $record=[ordered]@{operation='event_history_file_read';phase='copy';source_path=$context.source;source_sha256=$context.source_sha256;source_copy_path=$copy;runtime_directory=$runtime;native_process=$native;source_modified=$false;no_forced_termination=$true}
 $process=New-Object Diagnostics.Process;$watch=[Diagnostics.Stopwatch]::StartNew()
 try{
  [IO.File]::Copy($context.source,$copy,$false)
  if((Hash $copy) -cne $context.source_sha256 -or (Hash $context.source) -cne $context.source_sha256){throw 'Database original or owned snapshot changed before read.'}
  $request=@{operation='cmt-event-db-inspect';input=$copy;expected_sha256=$context.source_sha256};Write-WeinviewHistoryFileJournal $requestPath $request
  $record.phase='database_read';Write-WeinviewHistoryFileJournal (Join-Path $runtime 'start.json') $record
  foreach($arg in @($requestPath,$responsePath)){if($arg -match '["\x00-\x1f\x7f]' -or $arg.EndsWith('\')){throw 'Finite database codec argv required.'}}
  $start=New-Object Diagnostics.ProcessStartInfo;$start.FileName=$context.helper;$start.Arguments='-B "'+$context.script+'" "'+$requestPath+'" "'+$responsePath+'"';$start.WorkingDirectory=$native.cwd;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.WindowStyle=[Diagnostics.ProcessWindowStyle]::Hidden;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true;$process.StartInfo=$start
  if(!$process.Start()){throw 'Bundled database codec did not start.'};$native.pid=$process.Id;$native.creation_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;$native.owner_live=$true
  $outTask=$process.StandardOutput.ReadToEndAsync();$errTask=$process.StandardError.ReadToEndAsync()
  if(!$process.WaitForExit(5000)){throw 'Database codec deadline exceeded; original process retained without forced termination.'}
  $process.WaitForExit();$native.exit_code=$process.ExitCode;$native.owner_live=$false;$native.stdout=$outTask.Result;$native.stderr=$errTask.Result
  if($native.exit_code -ne 0 -or !(Test-Path -LiteralPath $responsePath -PathType Leaf)){throw ('Database codec rejected snapshot: '+$native.stdout+' '+$native.stderr)}
  if((Get-Item -LiteralPath $responsePath).Length -gt 2097152){throw 'Bounded native database response required.'}
  $response=Get-Content -LiteralPath $responsePath -Raw -Encoding UTF8 | ConvertFrom-Json
  if(!$response.ok -or $response.native_import_verified -ne $false -or $response.result.profile -cne 'weinview-cn421-cmt-event-db-sqlite-v1' -or $response.result.source_path -ine $copy -or $response.result.source_sha256 -cne $context.source_sha256 -or $response.result.source_byte_length -ne $context.source_byte_length -or !$response.result.read_only -or !$response.result.source_unchanged){throw 'Original database codec response binding differs.'}
  $console=$native.stdout | ConvertFrom-Json;if(!$console.ok -or $console.response -ine $responsePath -or $native.stderr.Length){throw 'Original database codec console/response differs.'}
  $after=Assert-WeinviewHistoryDbArguments $Arguments $BridgeRoot
  if($after.manifest_sha256 -cne $context.manifest_sha256 -or $after.helper_sha256 -cne $context.helper_sha256 -or (Hash $copy) -cne $context.source_sha256){throw 'Database source/dependency/snapshot changed after read.'}
  $native.normal_exit_verified=$true;$watch.Stop();$native.elapsed_ms=$watch.ElapsedMilliseconds;$record.phase='complete'
  return [pscustomobject]@{operation='event_history_file_read';profile='weinview-cn421-native-history-cmt-db-file-v1';source_path=$context.source;source_sha256=$context.source_sha256;source_byte_length=$context.source_byte_length;source_unchanged=$true;source_copy_path=$copy;source_copy_sha256=$context.source_sha256;source_copy_verified=$true;runtime_directory=$runtime;codec_manifest_path=$context.manifest;codec_manifest_sha256=$context.manifest_sha256;native_request_path=$requestPath;native_request_sha256=(Hash $requestPath);native_report_path=$responsePath;native_report_sha256=(Hash $responsePath);native_report=$response.result;record_count=$response.result.record_count;native_database_read_verified=$true;normal_native_exit_verified=$true;runtime_ack_verified=$false;timestamp_unit_verified=$false;timezone_verified=$false;full_properties_verified=$false;plc_communication_tested=$false;ui_actions=0;global_input=$false;no_forced_termination=$true;processes=@([pscustomobject]$native)}
 }catch{
  $record.phase='failed';$record['error']=$_.Exception.Message;$_.Exception.Data['history_runtime_directory']=$runtime;$_.Exception.Data['history_native_process']=$native;$_.Exception.Data['history_process_journal']=$journal;throw
 }finally{$watch.Stop();$native.elapsed_ms=$watch.ElapsedMilliseconds;Write-WeinviewHistoryFileJournal $journal $record;$process.Dispose()}
}
function Invoke-WeinviewHistoryFileRead($Arguments,[string]$BridgeRoot,[string]$Kind='dtl') {
 if($Kind -ceq 'db'){return (Invoke-WeinviewHistoryDbRead $Arguments $BridgeRoot)}
 if($Kind -cnotin @('dtl','evt')){throw 'Finite private History read kind required.'}
 $operation='history_file_read';$profile='weinview-cn421-native-history-dtl-single-channel-file-v1'
 if($Kind -ceq 'evt'){$operation='event_history_file_read';$profile='weinview-cn421-native-history-evt-file-v1'}
 $context=Assert-WeinviewHistoryFileArguments $Arguments $BridgeRoot ('.'+$Kind)
 $runtime=Under (Join-Path $context.root ('.weinview-history-'+[guid]::NewGuid().ToString('N'))) $context.root;$null=[IO.Directory]::CreateDirectory($runtime);$dependencies=@()
 foreach($file in $context.files){$destination=Join-Path $runtime $file.name;[IO.File]::Copy($file.path,$destination,$false);$dependencies+=[pscustomobject]@{name=$file.name;path=$destination;sha256=$file.sha256;byte_length=$file.byte_length}}
 Assert-WeinviewHistoryRuntimePins $dependencies
 $sourceCopy=Join-Path $runtime ('source.'+$Kind);$csv=Join-Path $runtime 'native-export.csv';$journal=[ordered]@{operation=$operation;phase='copy';source_path=$context.source;source_sha256=$context.source_sha256;runtime_directory=$runtime;source_copy_path=$sourceCopy;csv_path=$csv;dependencies=$dependencies;processes=@();no_forced_termination=$true}
 try{
  [IO.File]::Copy($context.source,$sourceCopy,$false);if((Hash $sourceCopy) -cne $context.source_sha256 -or (Hash $context.source) -cne $context.source_sha256){throw 'History source/input copy changed before CLI.'}
  $journal.phase='native_export';$native=Invoke-WeinviewHistoryNativeCli $context $runtime $sourceCopy $csv $dependencies;$journal.processes=@($native)
  if(!(Test-Path -LiteralPath $csv -PathType Leaf)){throw 'Original History CSV export absent.'};$actual=Read-WeinviewHistoryNativeCsv $csv $Kind
  Assert-WeinviewHistoryRuntimePins $context.files;Assert-WeinviewHistoryRuntimePins $dependencies
  if((Hash $sourceCopy) -cne $context.source_sha256 -or (Hash $context.source) -cne $context.source_sha256){throw 'History original source or owned input changed after CLI.'}
  $journal.phase='complete'
  $result=@{operation=$operation;profile=$profile;source_path=$context.source;source_sha256=$context.source_sha256;source_byte_length=$context.source_byte_length;source_unchanged=$true;source_copy_path=$sourceCopy;source_copy_sha256=$context.source_sha256;source_copy_verified=$true;runtime_directory=$runtime;dependencies=$dependencies;csv_path=$actual.csv_path;csv_sha256=$actual.csv_sha256;csv_byte_length=$actual.csv_byte_length;csv_encoding=$actual.csv_encoding;csv_line_ending=$actual.csv_line_ending;header=$actual.header;raw_rows=$actual.raw_rows;records=$actual.records;record_count=$actual.record_count;native_cli_verified=$true;normal_native_exit_verified=$true;data_type_verified=$false;timezone_verified=$false;full_properties_verified=$false;plc_communication_tested=$false;ui_actions=0;global_input=$false;no_forced_termination=$true;processes=@($native)}
  if($Kind -ceq 'dtl'){
   if($actual.PSObject.Properties.Name -ccontains 'channel_count'){
    $result.profile='weinview-cn421-native-history-dtl-multi-channel-file-v1';$result.channel_names=$actual.channel_names;$result.channel_count=$actual.channel_count
   }else{$result.channel_name=$actual.channel_name}
  }else{$result.runtime_ack_verified=$false}
  return [pscustomobject]$result
 }catch{$journal['error']=$_.Exception.Message;throw}finally{Write-WeinviewHistoryFileJournal (Join-Path $runtime 'operation.json') $journal}
}
