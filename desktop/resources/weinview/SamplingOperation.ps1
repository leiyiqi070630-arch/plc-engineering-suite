# Finite native CSV sampling route. Append/import is enabled only after its actual contract is recorded.
function New-WeinviewSamplingClone([string]$SourcePath,[string]$OutputPath,[string]$ExpectedSourceSha256) {
 $source=[IO.Path]::GetFullPath($SourcePath);$output=[IO.Path]::GetFullPath($OutputPath)
 $sourceExtension=[IO.Path]::GetExtension($source).ToLowerInvariant()
 $outputExtension=[IO.Path]::GetExtension($output).ToLowerInvariant()
 if($source -ieq $output -or $sourceExtension -cnotin @('.emtp','.cmtp') -or $outputExtension -cne $sourceExtension -or !(Test-Path -LiteralPath $source -PathType Leaf) -or (Test-Path -LiteralPath $output)){throw 'Existing native source and distinct fresh output of the same emtp/cmtp type required.'}
 if((Hash $source) -cne $ExpectedSourceSha256){throw 'Original sampling project SHA differs.'}
 if(!(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($output)) -PathType Container)){throw 'Prepared output directory required.'}
 [IO.File]::Copy($source,$output,$false)
 if((Hash $source) -cne $ExpectedSourceSha256 -or (Hash $output) -cne $ExpectedSourceSha256){throw 'Fresh sampling clone/source hash differs.'}
 return [pscustomobject]@{source_path=$source;output_path=$output;source_sha256=$ExpectedSourceSha256;output_sha256=$ExpectedSourceSha256;fresh_copy_verified=$true}
}

function Assert-WeinviewSamplingManager($Session,$Manager) {
 Assert-WeinviewPlcCandidateSession $Session
 $identity=[PLCCode.Weinview.SamplingRibbonControls]::RequireDialog($Session.native,[long]$Manager.Hwnd,'资料取样',[long]$Session.main.Hwnd)
 $controls=@($Session.native.EnumChildControls($Manager.Hwnd))
 function SamplingManagerControl([int]$Id,[string]$Class,[string]$Title){$found=@($controls|Where-Object {$_.Visible -and $_.Id -eq $Id -and $_.Class -ceq $Class -and (!$Title -or $_.Title -ceq $Title)});if($found.Count -ne 1){throw 'Exact owned Sampling manager control required.'};return $found[0]}
 $countControl=SamplingManagerControl 1289 'Static' ''
 $countText=$Session.native.GetControlText($countControl.Hwnd,4096);$countMatch=[regex]::Match($countText,'^(0|[1-9][0-9]{0,3}) / ([1-9][0-9]{0,3})$')
 if(!$countMatch.Success -or [int]$countMatch.Groups[1].Value -gt [int]$countMatch.Groups[2].Value){throw 'Actual Sampling count text differs from native profile.'}
 $count=[int]$countMatch.Groups[1].Value
 $exportControl=SamplingManagerControl 1146 'Button' '导出...'
 $importControl=SamplingManagerControl 1147 'Button' '导入...'
 $closeControl=SamplingManagerControl 2 'Button' '关闭'
 if(!$closeControl.Enabled -or ($count -eq 0 -and $exportControl.Enabled) -or ($count -gt 0 -and !$exportControl.Enabled)){throw 'Actual Sampling count/export state differs from verified profile.'}
 return [pscustomobject]@{manager_identity=$identity;count_control=$countControl;count_text=$countText;sampling_count=$count;export_control=$exportControl;import_control=$importControl;close_control=$closeControl}
}

function Close-WeinviewSamplingManager($Session,$Manager) {
 $null=Assert-WeinviewSamplingManager $Session $Manager
 if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $Manager.Hwnd}).Count){throw 'Unknown sampling dialog present; no generic cleanup acknowledgement.'}
 $Session.native.ClickButton($Manager.Hwnd,2,'关闭')
 $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 6
}

function Confirm-WeinviewSamplingCsvNotice($Session,$Manager,$Notice,[string]$CsvPath,[string]$SourceSha256) {
 Assert-WeinviewPlcCandidateSession $Session
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Sampling export source changed before notice acknowledgement.'}
 $csv=Read-WeinviewSamplingCsv -Path $CsvPath
 $managerIdentity=[PLCCode.Weinview.SamplingRibbonControls]::RequireDialogState($Session.native,$Manager.Hwnd,'资料取样',$Session.main.Hwnd,$false)
 $noticeIdentity=[PLCCode.Weinview.SamplingRibbonControls]::RequireDialog($Session.native,$Notice.Hwnd,'EasyBuilder Pro',$Manager.Hwnd)
 $controls=@($Session.native.EnumChildControls($Notice.Hwnd)|Where-Object {$_.Visible})
 $body=@($controls|Where-Object {$_.Class -ceq 'Static' -and $_.Id -eq 65535})
 $buttons=@($controls|Where-Object {$_.Class -ceq 'Button'})
 if($body.Count -ne 1 -or $Session.native.GetControlText($body[0].Hwnd,4096) -cne '成功' -or $buttons.Count -ne 1 -or $buttons[0].Id -ne 2 -or $buttons[0].Title -cne '确定' -or !$buttons[0].Enabled){throw 'Exact original Sampling CSV success notice controls required; preserve unknown.'}
 $activation=[PLCCode.Weinview.SamplingRibbonControls]::ActivateSuccessNotice($Session.native,$Notice.Hwnd,$Manager.Hwnd,$Session.main.Hwnd)
 $Session.native.ClickButton($Notice.Hwnd,2,'确定')
 $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Hwnd -eq $Notice.Hwnd}).Count){return Assert-WeinviewSamplingManager $Session $Manager}} 6
 if((Hash $CsvPath) -cne $csv.sha256 -or (Hash $Session.output_path) -cne $SourceSha256){throw 'Sampling CSV/source changed during notice acknowledgement.'}
 return [pscustomobject]@{notice=$noticeIdentity;manager=$managerIdentity;activation=$activation;body_control_id=65535;body='成功';buttons=$buttons;csv_path=$CsvPath;csv_sha256=$csv.sha256;source_sha256=$SourceSha256;csv_schema_verified=$true;acknowledged_button_id=2;acknowledged=$true}
}

function Export-WeinviewSamplingCsv($Session,$Manager,[string]$CsvPath,[string]$SourceSha256) {
 $native=$Session.native;$path=[IO.Path]::GetFullPath($CsvPath)
 if([IO.Path]::GetExtension($path) -ine '.csv' -or (Test-Path -LiteralPath $path) -or !(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($path)) -PathType Container)){throw 'Fresh prepared CSV export path required.'}
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Native export project source SHA changed.'}
 $managerIdentity=Assert-WeinviewSamplingManager $Session $Manager
 if($managerIdentity.sampling_count -eq 0){
  # Disabled native Export: derive only the known empty CSV version for this project format.
  $projectExtension=[IO.Path]::GetExtension([string]$Session.output_path).ToLowerInvariant()
  if($projectExtension -cnotin @('.cmtp','.emtp')){throw 'Known cMT or eMT project extension required for derived empty Sampling CSV.'}
  $emptyVersion=if($projectExtension -ceq '.cmtp'){4}else{1}
  $bytes=[byte[]]@(239,187,191)+[Text.UTF8Encoding]::new($false,$true).GetBytes("Version: $emptyVersion`r`n")
  $stream=[IO.File]::Open($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
  try{$stream.Write($bytes,0,$bytes.Length)}finally{$stream.Dispose()}
  $empty=Read-WeinviewSamplingCsv -Path $path
  if($empty.version -ne $emptyVersion -or $empty.sampling_count -ne 0 -or $empty.byte_length -ne 15 -or @($empty.rows).Count -ne 1 -or @($empty.blocks).Count -ne 0 -or (Hash $Session.output_path) -cne $SourceSha256){throw 'Derived exact empty native Sampling table/source guard differs.'}
  $origin=if($emptyVersion -eq 4){'derived-known-native-v4-empty'}else{'derived-known-native-v1-empty'}
  return [pscustomobject]@{sampling_csv=$empty;csv_path=$path;sha256=$empty.sha256;byte_length=$empty.byte_length;manager_before=$managerIdentity;manager_after=$managerIdentity;empty_evidence=$managerIdentity;native_export_verified=$false;native_empty_table_verified=$true;empty_csv_derived=$true;table_origin=$origin;source_sha256=$SourceSha256;source_unchanged=$true;full_properties_verified=$false}
 }
 $native.ClickButton($Manager.Hwnd,1146,'导出...')
 $property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.process.Path)
 $save=WaitFor {
  $dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $Manager.Hwnd})
  if($dialogs.Count -gt 1){throw 'Ambiguous sampling CSV Save dialog.'}
  if($dialogs.Count -eq 1){
   if($dialogs[0].Title -cne '另存为'){throw 'Unexpected sampling CSV export dialog; preserve.'}
   $fields=@($native.EnumChildControls($dialogs[0].Hwnd))
   $files=@($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit' -and $_.Id -eq 1001})
   $saves=@($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Button' -and $_.Id -eq 1 -and $_.Title -ceq '保存(&S)'})
   $formats=@(foreach($c in @($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'ComboBox'})){if(@($property.ComboItems($c.Hwnd)|Where-Object {$_ -ceq 'CSV (*.csv)'}).Count -eq 1){$c}})
   if($files.Count -gt 1 -or $saves.Count -gt 1 -or $formats.Count -gt 1){throw 'Native Sampling export ready controls ambiguous.'}
   if($files.Count -eq 1 -and $saves.Count -eq 1 -and $formats.Count -eq 1){return $dialogs[0]}
  }
 } 6
 $saveOwner=[PLCCode.Weinview.SamplingRibbonControls]::OwnerOf($native,$save.Hwnd)
 # The finite actual Save owner must be the originally opened manager.
 $saveIdentity=[PLCCode.Weinview.SamplingRibbonControls]::RequireDialog($native,$save.Hwnd,'另存为',$Manager.Hwnd)
 $types=@(foreach($c in @($native.EnumChildControls($save.Hwnd)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'ComboBox'})){if(@($property.ComboItems($c.Hwnd)|Where-Object {$_ -ceq 'CSV (*.csv)'}).Count -eq 1){$c}})
 if($types.Count -ne 1){throw 'Unique actual CSV format selector required.'}
 $property.SelectComboExact($types[0].Hwnd,'CSV (*.csv)')
 if($property.ComboSelected($types[0].Hwnd) -cne 'CSV (*.csv)'){throw 'Native CSV format selection differs.'}
 $file=$native.FindUniqueControlWithoutLabel($save.Hwnd,1001,'Edit');$native.SetControlText($file.Hwnd,$path)
 if($native.GetControlText($file.Hwnd,4096) -cne $path){throw 'Owned native sampling CSV filename differs.'}
 $saveActivation=[PLCCode.Weinview.SamplingRibbonControls]::ActivateExportSave($native,$save.Hwnd,$Manager.Hwnd,$Session.main.Hwnd,$file.Hwnd,$types[0].Hwnd,$path)
 $native.ClickButton($save.Hwnd,1,'保存(&S)')
 $completion=WaitFor {
  $dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $Manager.Hwnd})
  if($dialogs.Count -gt 1){throw 'Ambiguous sampling export completion dialog.'}
  if($dialogs.Count -eq 1){
   if($dialogs[0].Hwnd -eq $save.Hwnd){return $null}
   if($dialogs[0].Title -cne 'EasyBuilder Pro'){throw 'Unexpected native Sampling export completion dialog; preserve.'}
   $fields=@($native.EnumChildControls($dialogs[0].Hwnd))
   $bodies=@($fields|Where-Object {$_.Visible -and $_.Class -ceq 'Static' -and $_.Id -eq 65535})
   $buttons=@($fields|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Button'})
   if($bodies.Count -gt 1 -or $buttons.Count -gt 1){throw 'Native Sampling export Notice controls ambiguous.'}
   if($bodies.Count -eq 1 -and $buttons.Count -eq 1){$text=$native.GetControlText($bodies[0].Hwnd,4096);if($text -and $text -cne '成功'){throw 'Unknown Sampling export Notice body; preserve.'};if($text -ceq '成功' -and $buttons[0].Id -eq 2 -and $buttons[0].Title -ceq '确定' -and (Test-Path -LiteralPath $path -PathType Leaf)){return $dialogs[0]}}
  }
 } 8
 $notice=Confirm-WeinviewSamplingCsvNotice $Session $Manager $completion $path $SourceSha256
 $result=Assert-WeinviewSamplingManager $Session $Manager
 $csv=Read-WeinviewSamplingCsv -Path $path
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Sampling source guard differs after native export.'}
 if($csv.sampling_count -ne $managerIdentity.sampling_count -or $result.sampling_count -ne $csv.sampling_count){throw 'Native exported Sampling table differs from actual manager count.'}
 return [pscustomobject]@{sampling_csv=$csv;csv_path=$path;sha256=$csv.sha256;byte_length=$csv.byte_length;manager_before=$managerIdentity;save_dialog=$saveIdentity;save_activation=$saveActivation;success_notice=$notice;manager_after=$result;native_export_verified=$true;native_empty_table_verified=$false;empty_csv_derived=$false;table_origin='native-export';source_sha256=$SourceSha256;source_unchanged=$true;full_properties_verified=$false}
}

function Invoke-WeinviewSamplingRead($Session,[string]$ExportPath,[string]$SourceSha256) {
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
 $entry=Invoke-WeinviewSamplingRibbon $Session $semantic
 try{$export=Export-WeinviewSamplingCsv $Session $entry.manager $ExportPath $SourceSha256}catch{
  $initialError=$_
  try{Close-WeinviewSamplingManager $Session $entry.manager}catch{if($Session -is [Collections.IDictionary]){$Session['sampling_cleanup_error']=$_.Exception.Message}}
  throw $initialError
 }
 Close-WeinviewSamplingManager $Session $entry.manager
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Sampling read changed project source.'}
 return [pscustomobject]@{operation='sampling_read';profile='weinview-cn421-tk800x480-native-sampling-v1';sampling_csv=$export.sampling_csv;csv_path=$export.csv_path;sha256=$export.sha256;byte_length=$export.byte_length;native_export_evidence=$export;native_entry_evidence=$entry;native_export_verified=$export.native_export_verified;native_empty_table_verified=$export.native_empty_table_verified;empty_csv_derived=$export.empty_csv_derived;table_origin=$export.table_origin;empty_evidence=$export.empty_evidence;sampling_count=$export.sampling_csv.sampling_count;source_sha256=$SourceSha256;source_unchanged=$true;local_only=$true;plc_communication_tested=$false;full_properties_verified=$false}
}

function Compare-WeinviewSamplingNativeTagAddressRow($Expected,$Actual) {
 if($Expected.record_index -ne $Actual.record_index){throw 'Native Sampling CSV record index changed.'}
 if($Expected.raw_csv -ceq $Actual.raw_csv){
  if((ConvertTo-Json -InputObject $Expected.fields -Depth 5 -Compress) -cne (ConvertTo-Json -InputObject $Actual.fields -Depth 5 -Compress)){throw 'Native Sampling CSV unchanged raw row fields changed.'}
  return 0
 }
 $old=@($Expected.fields);$new=@($Actual.fields)
 if($old.Count -ne $new.Count -or $old.Count -notin @(8,9,13)){throw 'Native Sampling tag address row shape changed.'}
 $addressIndex=6;$deviceIndex=2;$tagIndex=3;$systemIndex=4;$userIndex=5;$idxIndex=7
 if($old.Count -eq 13){$addressIndex=11;$deviceIndex=7;$tagIndex=8;$systemIndex=9;$userIndex=10;$idxIndex=12}
 elseif($old[0] -cne '' -or $old[1] -cnotin @('Read Address','Control Address') -or ($old.Count -eq 8 -and $old[1] -cne 'Read Address') -or ($old.Count -eq 9 -and $old[1] -cne 'Control Address')){throw 'Native Sampling tag address row kind changed.'}
 if($old.Count -eq 13 -and ($old[0] -cne '' -or $old[1] -cne '' -or !$old[2])){throw 'Native Sampling tagged channel row identity changed.'}
 if($old[$deviceIndex] -cne 'Local HMI' -or $new[$deviceIndex] -cne 'Local HMI' -or !$old[$tagIndex] -or $old[$tagIndex] -cne $new[$tagIndex] -or $old[$systemIndex] -cne 'System Tag: Off' -or $new[$systemIndex] -cne 'System Tag: Off' -or $old[$userIndex] -cne 'User-defined Tag: On' -or $new[$userIndex] -cne 'User-defined Tag: On' -or $old[$idxIndex] -cne 'IDX: null' -or $new[$idxIndex] -cne 'IDX: null'){throw 'Native Sampling tagged Local HMI address markers changed.'}
 if($old[$addressIndex] -cnotmatch '^LW-(0|[1-9][0-9]{0,4})$'){throw 'Native Sampling tagged LW address is not canonical.'}
 $digits=$Matches[1];if([int]$digits -gt 65535 -or $new[$addressIndex] -cne $digits){throw 'Native Sampling tagged LW address value changed.'}
 for($i=0;$i -lt $old.Count;$i++){if($i -ne $addressIndex -and $old[$i] -cne $new[$i]){throw 'Native Sampling tagged address row has another changed field.'}}
 if($Expected.raw_csv -cne (($old -join ',')+"`r`n") -or $Actual.raw_csv -cne (($new -join ',')+"`r`n")){throw 'Native Sampling tagged address row raw CSV differs beyond address display.'}
 return 1
}
function Assert-WeinviewSamplingBlockMetadata($Expected,$Actual) {
 foreach($field in @('block_index','start_record','record_count','header_fields','is_sampling','finite_configuration','full_properties_verified')){
  if((ConvertTo-Json -InputObject $Expected.$field -Depth 14 -Compress) -cne (ConvertTo-Json -InputObject $Actual.$field -Depth 14 -Compress)){throw "Native Sampling block metadata changed: $field"}
 }
}
function Assert-WeinviewSamplingCsvCandidateReadback($Candidate,$After) {
 if($Candidate.version -ne 4 -or $After.version -ne 4 -or $Candidate.encoding -cne $After.encoding -or $Candidate.line_ending -cne $After.line_ending -or $Candidate.schema_json -cne $After.schema_json -or $Candidate.schema_sha256 -cne $After.schema_sha256 -or $Candidate.sampling_count -ne $After.sampling_count -or @($Candidate.rows).Count -ne @($After.rows).Count -or @($Candidate.blocks).Count -ne @($After.blocks).Count){throw 'Native Sampling V4 candidate/readback shape differs.'}
 $count=0
 for($i=0;$i -lt @($Candidate.rows).Count;$i++){$count+=Compare-WeinviewSamplingNativeTagAddressRow $Candidate.rows[$i] $After.rows[$i]}
 for($i=0;$i -lt @($Candidate.blocks).Count;$i++){Assert-WeinviewSamplingBlockMetadata $Candidate.blocks[$i] $After.blocks[$i]}
 return $count
}
function Assert-WeinviewSamplingCsvPreserved($Before,$After,[int]$AddedCount,[switch]$AllowNativeTagAddressNormalization) {
 if($AllowNativeTagAddressNormalization -and ($Before.version -ne 4 -or $After.version -ne 4)){throw 'Native Sampling tag-address normalization requires V4 to V4.'}
 if($Before.version -eq 1 -and $Before.sampling_count -eq 0 -and @($Before.blocks).Count -eq 0 -and $After.version -eq 4 -and $AddedCount -eq 1){
  if($After.encoding -cne 'UTF8-BOM' -or $After.line_ending -cne 'CRLF' -or $After.sampling_count -ne 1 -or @($After.blocks).Count -ne 1 -or !$After.blocks[0].finite_configuration -or $After.blocks[0].finite_configuration.native_csv_version -ne 4){throw 'Actual current-cMT canonical Sampling export differs.'}
  return
 }
 if($AddedCount -lt 0 -or $AddedCount -gt 8 -or $Before.version -notin @(1,4) -or $After.version -ne $Before.version -or $Before.encoding -cne 'UTF8-BOM' -or $After.encoding -cne 'UTF8-BOM' -or $Before.line_ending -cne 'CRLF' -or $After.line_ending -cne 'CRLF' -or $After.sampling_count -ne ($Before.sampling_count+$AddedCount)){throw 'Native Sampling CSV finite count/encoding contract differs.'}
 if($Before.schema_json -cne $After.schema_json -or $Before.schema_sha256 -cne $After.schema_sha256 -or @($After.rows).Count -lt @($Before.rows).Count -or @($After.blocks).Count -ne (@($Before.blocks).Count+$AddedCount)){throw 'Native Sampling schema/old block count differs.'}
 $normalizationCount=0
 for($i=0;$i -lt @($Before.rows).Count;$i++){
  if($AllowNativeTagAddressNormalization){$normalizationCount+=Compare-WeinviewSamplingNativeTagAddressRow $Before.rows[$i] $After.rows[$i]}
  else{
   $oldRow=ConvertTo-Json -InputObject $Before.rows[$i] -Depth 8 -Compress
   $newRow=ConvertTo-Json -InputObject $After.rows[$i] -Depth 8 -Compress
   if($oldRow -cne $newRow){throw 'Existing native Sampling CSV raw row/order changed.'}
  }
 }
 for($i=0;$i -lt @($Before.blocks).Count;$i++){
  if($AllowNativeTagAddressNormalization){Assert-WeinviewSamplingBlockMetadata $Before.blocks[$i] $After.blocks[$i]}
  else{
   $oldBlock=ConvertTo-Json -InputObject $Before.blocks[$i] -Depth 12 -Compress
   $newBlock=ConvertTo-Json -InputObject $After.blocks[$i] -Depth 12 -Compress
   if($oldBlock -cne $newBlock){throw 'Existing native Sampling CSV block or finite configuration changed.'}
  }
 }
 if($AllowNativeTagAddressNormalization){return $normalizationCount}
}
function Assert-WeinviewSamplingNativeCanonicalization($Append,$After) {
 $candidate=$Append.after
 if($Append.before.sampling_count -ne 0 -or @($Append.before.blocks).Count -ne 0 -or @($Append.appended).Count -ne 1 -or $candidate.version -ne 1 -or $After.version -ne 4 -or @($After.blocks).Count -ne 1){throw 'Current-cMT native canonicalization only observed for one new group on empty table.'}
 $wanted=$Append.appended[0].finite_configuration;$actual=$After.blocks[0].finite_configuration
 foreach($field in @('description','device','address_type','address','sample_mode','period_ms','high_priority','system_tag','user_defined_tag','index_register','channel_count','total_word_width')){
  if((ConvertTo-Json -InputObject $wanted.$field -Compress -Depth 5) -cne (ConvertTo-Json -InputObject $actual.$field -Compress -Depth 5)){throw ('Current-cMT native Sampling field changed: '+$field)}
 }
 $wantedChannels=if($wanted.channels){@($wanted.channels)}else{@([pscustomobject]@{label=$wanted.channel_description;data_type=$wanted.data_type;word_width=1})}
 if((ConvertTo-Json -InputObject $wantedChannels -Compress -Depth 6) -cne (ConvertTo-Json -InputObject @($actual.channels) -Compress -Depth 6)){throw 'Current-cMT native Sampling channel order/type changed.'}
}

function Confirm-WeinviewSamplingReplacement($Session,$Manager,$Notice,$BeforeCsv,$AppendEvidence,[string]$SourceSha256) {
 Assert-WeinviewPlcCandidateSession $Session
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Original cloned sampling project changed before replacement confirmation.'}
 if((Hash $AppendEvidence.input_path) -cne $BeforeCsv.sha256 -or (Hash $AppendEvidence.output_path) -cne $AppendEvidence.output_sha256 -or !$AppendEvidence.old_bytes_preserved -or $AppendEvidence.old_prefix_sha256 -cne $BeforeCsv.sha256){throw 'Complete verified old-table candidate required before destructive native replacement.'}
 $candidate=Read-WeinviewSamplingCsv -Path $AppendEvidence.output_path
 Assert-WeinviewSamplingCsvPreserved $BeforeCsv $candidate @($AppendEvidence.appended).Count
 $activation=[PLCCode.Weinview.SamplingRibbonControls]::ActivateReplacementNotice($Session.native,$Notice.Hwnd,$Manager.Hwnd,$Session.main.Hwnd)
 $Session.native.ClickButton($Notice.Hwnd,6,'是(&Y)')
 return [pscustomobject]@{notice=$Notice;activation=$activation;body='是否要删除现有的资料取样 ?';candidate_path=$candidate.path;candidate_sha256=$candidate.sha256;original_sampling_sha256=$BeforeCsv.sha256;old_rows_preserved=$true;acknowledged_button_id=6;replacement_confirmed=$true;native_import_verified=$false}
}

function Import-WeinviewSamplingCsv($Session,$Manager,$BeforeCsv,$AppendEvidence,[string]$SourceSha256) {
 $native=$Session.native;$candidatePath=$AppendEvidence.output_path
 $managerIdentity=Assert-WeinviewSamplingManager $Session $Manager
 if((Hash $Session.output_path) -cne $SourceSha256 -or (Hash $candidatePath) -cne $AppendEvidence.output_sha256){throw 'Sampling source/candidate changed before native import.'}
 $candidate=Read-WeinviewSamplingCsv -Path $candidatePath
 Assert-WeinviewSamplingCsvPreserved $BeforeCsv $candidate @($AppendEvidence.appended).Count
 if($managerIdentity.sampling_count -ne $BeforeCsv.sampling_count){throw 'Actual old Sampling manager count differs before import.'}
 $native.ClickButton($Manager.Hwnd,1147,'导入...')
 $replacementHwnd=0
 if($BeforeCsv.sampling_count -gt 0){
  $replacement=WaitFor {$dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770'});if($dialogs.Count -gt 1){throw 'Ambiguous sampling replacement Notice.'};if($dialogs.Count -eq 1 -and $dialogs[0].Hwnd -ne $Manager.Hwnd){if($dialogs[0].Title -cne 'EasyBuilder Pro'){throw 'Unexpected import-before-replacement dialog; preserve.'};return $dialogs[0]}} 6
  $replacementHwnd=$replacement.Hwnd
  $replacementEvidence=Confirm-WeinviewSamplingReplacement $Session $Manager $replacement $BeforeCsv $AppendEvidence $SourceSha256
 }else{
  $replacementEvidence=[pscustomobject]@{replacement_required=$false;original_sampling_count=0;empty_manager_evidence=$managerIdentity;candidate_path=$candidatePath;candidate_sha256=$candidate.sha256;native_import_verified=$false}
 }
 $open=WaitFor {
  # The acknowledged replacement notice can remain visible briefly while the
  # native file chooser opens. It and the manager are known parent windows.
  $dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $replacementHwnd -and $_.Hwnd -ne $Manager.Hwnd})
  if($dialogs.Count -gt 1){throw 'Ambiguous native Sampling import file dialog.'}
  if($dialogs.Count -eq 1 -and $dialogs[0].Hwnd -ne $replacementHwnd -and $dialogs[0].Hwnd -ne $Manager.Hwnd){
   if($dialogs[0].Title -cne '打开'){throw 'Unexpected native Sampling import file dialog; preserve.'}
   $controls=@($native.EnumChildControls($dialogs[0].Hwnd))
   $fileControls=@($controls|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit' -and $_.Id -eq 1148})
   $filterControls=@($controls|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'ComboBox' -and $_.Id -eq 1136})
   $openControls=@($controls|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Button' -and $_.Id -eq 1 -and $_.Title -ceq '打开(&O)'})
   if($fileControls.Count -gt 1 -or $filterControls.Count -gt 1 -or $openControls.Count -gt 1){throw 'Sampling file controls ambiguous.'}
   if($fileControls.Count -eq 1 -and $filterControls.Count -eq 1 -and $openControls.Count -eq 1){return $dialogs[0]}
  }
 } 6
 $fileIdentity=[PLCCode.Weinview.SamplingRibbonControls]::RequireDialog($native,$open.Hwnd,'打开',$Manager.Hwnd)
 $property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.process.Path)
 $filter=$native.FindUniqueControlWithoutLabel($open.Hwnd,1136,'ComboBox')
 $filterText=$property.ComboSelected($filter.Hwnd)
 if($filterText -cne '*.xlsx, *.xls, *.csv'){throw 'Exact original Sampling import file filter required; no owner-draw enumeration.'}
 $filename=$native.FindUniqueControlWithoutLabel($open.Hwnd,1148,'Edit');$native.SetControlText($filename.Hwnd,$candidatePath)
 if($native.GetControlText($filename.Hwnd,4096) -cne $candidatePath -or (Hash $candidatePath) -cne $AppendEvidence.output_sha256 -or (Hash $Session.output_path) -cne $SourceSha256){throw 'Native Sampling import candidate filename/source changed.'}
 $activation=[PLCCode.Weinview.SamplingRibbonControls]::ActivateImportFile($native,$open.Hwnd,$Manager.Hwnd,$Session.main.Hwnd,$candidatePath)
 $native.ClickButton($open.Hwnd,1,'打开(&O)')
 $success=WaitFor {
  $dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -ne $open.Hwnd -and $_.Hwnd -ne $Manager.Hwnd})
  if($dialogs.Count -gt 1){throw 'Ambiguous Sampling import completion Notice.'}
  if($dialogs.Count -eq 1 -and $dialogs[0].Hwnd -ne $open.Hwnd -and $dialogs[0].Hwnd -ne $Manager.Hwnd){if($dialogs[0].Title -cne 'EasyBuilder Pro'){throw 'Unknown Sampling import completion dialog; preserve.'};return $dialogs[0]}
 } 8
 $successEvidence=Confirm-WeinviewSamplingCsvNotice $Session $Manager $success $candidatePath $SourceSha256
 if((Hash $candidatePath) -cne $AppendEvidence.output_sha256){throw 'Native Sampling import candidate changed before readback.'}
 return [pscustomobject]@{manager_before=$managerIdentity;replacement=$replacementEvidence;file_dialog=$fileIdentity;file_filter=$filterText;file_activation=$activation;candidate_path=$candidatePath;candidate_sha256=$AppendEvidence.output_sha256;success_notice=$successEvidence;native_success_notice_verified=$true;native_import_verified=$false}
}

function Assert-WeinviewSamplingPersisted($Applied,$Reopened) {
 $null=Assert-WeinviewSamplingCsvPreserved $Applied.before_csv $Reopened @($Applied.csv_append_evidence.appended).Count -AllowNativeTagAddressNormalization:([bool]$Applied.native_tag_address_normalization_count)
 $after=$Applied.after_csv
 if($after.sha256 -cne $Reopened.sha256 -or $after.byte_length -ne $Reopened.byte_length -or (ConvertTo-Json -InputObject $after.rows -Depth 10 -Compress) -cne (ConvertTo-Json -InputObject $Reopened.rows -Depth 10 -Compress) -or (ConvertTo-Json -InputObject $after.blocks -Depth 14 -Compress) -cne (ConvertTo-Json -InputObject $Reopened.blocks -Depth 14 -Compress)){throw 'Native Sampling export differs after actual save/reopen.'}
 return $true
}

function Invoke-WeinviewSamplingAppend($Session,[string]$BeforeExportPath,[string]$CandidatePath,[string]$AfterExportPath,[string]$SourceSha256,[string]$ExpectedSamplingSha256,$Objects,$DeviceDirectory=@(),$TagRows=@()) {
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
 $entry=Invoke-WeinviewSamplingRibbon $Session $semantic
 try {
  $beforeExport=Export-WeinviewSamplingCsv $Session $entry.manager $BeforeExportPath $SourceSha256
  if($beforeExport.sha256 -cne $ExpectedSamplingSha256){throw 'Native original Sampling CSV SHA differs from expected; no import performed.'}
  $append=Add-WeinviewSamplingCsvRows -InputPath $BeforeExportPath -OutputPath $CandidatePath -ExpectedInputSha256 $ExpectedSamplingSha256 -Objects $Objects -DeviceDirectory $DeviceDirectory -TagRows $TagRows
 }catch{
  $initialError=$_
  try{Close-WeinviewSamplingManager $Session $entry.manager}catch{if($Session -is [Collections.IDictionary]){$Session['sampling_cleanup_error']=$_.Exception.Message}}
  throw $initialError
 }
 $import=Import-WeinviewSamplingCsv $Session $entry.manager $beforeExport.sampling_csv $append $SourceSha256
 $afterExport=Export-WeinviewSamplingCsv $Session $entry.manager $AfterExportPath $SourceSha256
 $tagNormalizationCount=0
 if($beforeExport.sampling_csv.version -eq 4 -and $append.after.version -eq 4 -and $afterExport.sampling_csv.version -eq 4){$tagNormalizationCount=Assert-WeinviewSamplingCsvPreserved $beforeExport.sampling_csv $afterExport.sampling_csv @($append.appended).Count -AllowNativeTagAddressNormalization}
 else{Assert-WeinviewSamplingCsvPreserved $beforeExport.sampling_csv $afterExport.sampling_csv @($append.appended).Count}
 if($append.before.version -eq 1 -and $append.after.version -eq 1 -and $afterExport.sampling_csv.version -eq 4){Assert-WeinviewSamplingNativeCanonicalization $append $afterExport.sampling_csv}
 elseif($append.after.version -eq 4 -and $afterExport.sampling_csv.version -eq 4){$candidateNormalizationCount=Assert-WeinviewSamplingCsvCandidateReadback $append.after $afterExport.sampling_csv;if($candidateNormalizationCount -ne $tagNormalizationCount){throw 'Native Sampling tag-address normalization counts disagree.'}}
 elseif($afterExport.sha256 -cne $append.output_sha256 -or $afterExport.byte_length -ne $append.after.byte_length -or (ConvertTo-Json -InputObject $afterExport.sampling_csv.rows -Depth 10 -Compress) -cne (ConvertTo-Json -InputObject $append.after.rows -Depth 10 -Compress) -or (ConvertTo-Json -InputObject $afterExport.sampling_csv.blocks -Depth 14 -Compress) -cne (ConvertTo-Json -InputObject $append.after.blocks -Depth 14 -Compress)){throw 'Actual native Sampling export differs from complete verified append candidate.'}
 Close-WeinviewSamplingManager $Session $entry.manager
 if((Hash $Session.output_path) -cne $SourceSha256){throw 'Original sampling project disk source changed before explicit save.'}
 return [pscustomobject]@{operation='sampling_append';profile='weinview-cn421-tk800x480-native-sampling-v1';before_csv=$beforeExport.sampling_csv;after_csv=$afterExport.sampling_csv;csv_append_evidence=$append;native_entry_evidence=$entry;before_export_evidence=$beforeExport;after_export_evidence=$afterExport;before_empty_evidence=$beforeExport.empty_evidence;native_export_evidence=@($beforeExport,$afterExport);native_import_evidence=$import;native_import_verified=$true;new_sampling_verified=$true;all_old_rows_preserved=$true;native_tag_address_normalization_count=$tagNormalizationCount;native_tag_address_normalization_policy='v4_local_hmi_user_tag_lw_prefix_display_only';source_sha256=$SourceSha256;source_unchanged=$true;sampling_count=$afterExport.sampling_csv.sampling_count;local_only=(@($append.appended|Where-Object {$_.device -cne 'Local HMI'}).Count -eq 0);plc_communication_tested=$false;full_properties_verified=$false;project_saved=$false;persisted_verified=$false;reopen_verified=$false}
}
