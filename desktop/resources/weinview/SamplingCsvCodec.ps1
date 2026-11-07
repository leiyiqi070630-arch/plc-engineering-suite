# Native CN 6.10.02.421 Sampling CSV v1. New rows use only the observed profile.
function Get-WeinviewSamplingBytesSha256([byte[]]$Bytes) {
 $samplingSha=[Security.Cryptography.SHA256]::Create()
 try { return [BitConverter]::ToString($samplingSha.ComputeHash($Bytes)).Replace('-','') } finally { $samplingSha.Dispose() }
}
function Get-WeinviewSamplingCsvProfileSchema {
 $samplingSchemaRows=[Collections.Generic.List[object]]::new()
 $samplingSchemaRows.Add([string[]]@('Version: 1'))
 $samplingSchemaRows.Add([string[]]@('Data Sampling','<description>'))
 $samplingSchemaRows.Add([string[]]@('','Sample Mode','Time-based','1000 ms'))
 $samplingSchemaRows.Add([string[]]@('','','High Priority: Off'))
 $samplingSchemaRows.Add([string[]]@('','Read Address','Local HMI','LW','System Tag: Off','User-defined Tag: Off','<address>','IDX: null'))
 $samplingSchemaRows.Add([string[]]@('','Data Record','Max Data Records: 60','Auto Stop: Off'))
 $samplingSchemaRows.Add([string[]]@('','','<channel_description>','16-bit Signed'))
 $samplingSchema=[ordered]@{profile='cn421-sampling-v1-local-lw-signed16-period1000-max60';encoding='UTF8-BOM';line_ending='CRLF';rows=@($samplingSchemaRows.ToArray())}
 $samplingSchemaJson=ConvertTo-Json -InputObject $samplingSchema -Depth 5 -Compress
 return [ordered]@{schema=$samplingSchema;schema_json=$samplingSchemaJson;schema_sha256=(Get-WeinviewSamplingBytesSha256 ([Text.UTF8Encoding]::new($false,$true).GetBytes($samplingSchemaJson)))}
}
function ConvertFrom-WeinviewSamplingCsvText([string]$Text) {
 $samplingRows=[Collections.Generic.List[object]]::new();$samplingFields=[Collections.Generic.List[string]]::new();$samplingField=[Text.StringBuilder]::new()
 $samplingQuoted=$false;$samplingClosed=$false;$samplingStarted=$false;$samplingRecordStart=0
 for($samplingIndex=0;$samplingIndex -lt $Text.Length;$samplingIndex++) {
  $samplingChar=$Text[$samplingIndex]
  if($samplingChar -eq [char]0){throw 'Native Sampling CSV NUL rejected'}
  if($samplingChar -eq [char]13 -and ($samplingIndex+1 -ge $Text.Length -or $Text[$samplingIndex+1] -ne [char]10)){throw 'Native Sampling CSV requires CRLF'}
  if($samplingChar -eq [char]10 -and ($samplingIndex -eq 0 -or $Text[$samplingIndex-1] -ne [char]13)){throw 'Native Sampling CSV requires CRLF'}
  if($samplingQuoted) {
   if($samplingChar -eq [char]34) {
    if($samplingIndex+1 -lt $Text.Length -and $Text[$samplingIndex+1] -eq [char]34){[void]$samplingField.Append([char]34);$samplingIndex++}else{$samplingQuoted=$false;$samplingClosed=$true}
   }else{[void]$samplingField.Append($samplingChar)}
   continue
  }
  if($samplingChar -eq [char]44 -or $samplingChar -eq [char]13) {
   $samplingFields.Add($samplingField.ToString());[void]$samplingField.Clear();$samplingClosed=$false;$samplingStarted=$false
   if($samplingChar -eq [char]13) {
    $samplingIndex++;$samplingRows.Add([ordered]@{record_index=$samplingRows.Count;fields=@($samplingFields.ToArray());raw_csv=$Text.Substring($samplingRecordStart,$samplingIndex+1-$samplingRecordStart)})
    $samplingFields.Clear();$samplingRecordStart=$samplingIndex+1
    if($samplingRows.Count -gt 16384){throw 'Native Sampling CSV row bound exceeded'}
   }
   continue
  }
  if($samplingClosed){throw 'Native Sampling CSV text after closing quote rejected'}
  if($samplingChar -eq [char]34){if($samplingStarted -or $samplingField.Length -ne 0){throw 'Native Sampling CSV quote inside unquoted field rejected'};$samplingQuoted=$true;$samplingStarted=$true}
  else{[void]$samplingField.Append($samplingChar);$samplingStarted=$true}
 }
 if($samplingQuoted){throw 'Native Sampling CSV unterminated quote rejected'}
 if($samplingRecordStart -ne $Text.Length){throw 'Native Sampling CSV requires final CRLF'}
 return ,$samplingRows.ToArray()
}
function Get-WeinviewSamplingLegacyFiniteConfiguration($Rows) {
 if(@($Rows).Count -ne 6){return $null}
 $samplingF=@($Rows[0].fields);if($samplingF.Count -ne 2 -or $samplingF[0] -cne 'Data Sampling' -or !$samplingF[1]){return $null};$samplingDescription=[string]$samplingF[1]
 $samplingF=@($Rows[1].fields);if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Sample Mode' -or $samplingF[2] -cne 'Time-based' -or $samplingF[3] -cne '1000 ms'){return $null}
 $samplingF=@($Rows[2].fields);if($samplingF.Count -ne 3 -or $samplingF[0] -cne '' -or $samplingF[1] -cne '' -or $samplingF[2] -cne 'High Priority: Off'){return $null}
 $samplingF=@($Rows[3].fields);if($samplingF.Count -ne 8 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Read Address' -or $samplingF[2] -cne 'Local HMI' -or $samplingF[3] -cne 'LW' -or $samplingF[4] -cne 'System Tag: Off' -or $samplingF[5] -cne 'User-defined Tag: Off' -or $samplingF[7] -cne 'IDX: null' -or $samplingF[6] -cnotmatch '^(0|[1-9][0-9]{0,4})$'){return $null}
 $samplingAddress=0;if(![int]::TryParse([string]$samplingF[6],[ref]$samplingAddress) -or $samplingAddress -gt 65535){return $null}
 $samplingF=@($Rows[4].fields);if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Data Record' -or $samplingF[2] -cne 'Max Data Records: 60' -or $samplingF[3] -cne 'Auto Stop: Off'){return $null}
 $samplingF=@($Rows[5].fields);if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne '' -or !$samplingF[2] -or $samplingF[3] -cne '16-bit Signed'){return $null}
 return [ordered]@{description=$samplingDescription;device='Local HMI';address_type='LW';address=$samplingAddress;sample_mode='Time-based';period_ms=1000;maximum_records=60;high_priority=$false;auto_stop=$false;system_tag=$false;user_defined_tag=$false;index_register=$null;channel_description=[string]$samplingF[2];data_type='16-bit Signed';channel_count=1}
}
function Get-WeinviewSamplingFiniteConfiguration($Rows) {
 # Identical native six-row Signed16 files retain the original finite shape.
 $samplingLegacy=Get-WeinviewSamplingLegacyFiniteConfiguration $Rows
 if($null -ne $samplingLegacy){return $samplingLegacy}
 if(@($Rows).Count -ge 6 -and @($Rows[4].fields).Count -eq 2 -and $Rows[4].fields[0] -ceq '' -and $Rows[4].fields[1] -ceq 'Data Record'){
  return (Get-WeinviewSamplingV4FiniteConfiguration $Rows)
 }
 if(@($Rows).Count -lt 6){return $null}
 $samplingF=@($Rows[0].fields);if($samplingF.Count -ne 2 -or $samplingF[0] -cne 'Data Sampling' -or !$samplingF[1]){return $null};$samplingDescription=[string]$samplingF[1]
 $samplingF=@($Rows[1].fields);if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Sample Mode' -or $samplingF[2] -cne 'Time-based' -or $samplingF[3] -cnotmatch '^([1-9][0-9]{0,8}) ms$'){return $null};$samplingPeriod=[int]$Matches[1]
 $samplingF=@($Rows[2].fields);if($samplingF.Count -ne 3 -or $samplingF[0] -cne '' -or $samplingF[1] -cne '' -or $samplingF[2] -cne 'High Priority: Off'){return $null}
 $samplingF=@($Rows[3].fields);if($samplingF.Count -ne 8 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Read Address' -or !$samplingF[2] -or !$samplingF[3] -or $samplingF[4] -cne 'System Tag: Off' -or $samplingF[5] -cne 'User-defined Tag: Off' -or !$samplingF[6] -or $samplingF[7] -cne 'IDX: null'){return $null}
 $samplingDevice=[string]$samplingF[2];$samplingType=[string]$samplingF[3];$samplingAddress=[string]$samplingF[6]
 $samplingAddressValue=$samplingAddress
 if($samplingDevice -ceq 'Local HMI' -and $samplingType -ceq 'LW' -and $samplingAddress -cmatch '^(0|[1-9][0-9]{0,4})$'){$parsedAddress=0;if([int]::TryParse($samplingAddress,[ref]$parsedAddress) -and $parsedAddress -le 65535){$samplingAddressValue=$parsedAddress}}
 $samplingF=@($Rows[4].fields);if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne 'Data Record' -or $samplingF[2] -cnotmatch '^Max Data Records: ([1-9][0-9]{0,8})$' -or $samplingF[3] -cne 'Auto Stop: Off'){return $null};$samplingCapacity=[int]$Matches[1]
 $samplingChannels=[Collections.Generic.List[object]]::new();$samplingWordCount=0
 for($samplingChannelRow=5;$samplingChannelRow -lt @($Rows).Count;$samplingChannelRow++){
  $samplingF=@($Rows[$samplingChannelRow].fields)
  if($samplingF.Count -ne 4 -or $samplingF[0] -cne '' -or $samplingF[1] -cne '' -or !$samplingF[2] -or $samplingF[3] -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float')){return $null}
  $samplingWidth=1;if($samplingF[3] -ceq '32-bit Float'){$samplingWidth=2}
  $samplingWordCount+=$samplingWidth
  $samplingChannels.Add([ordered]@{label=[string]$samplingF[2];data_type=[string]$samplingF[3];word_width=$samplingWidth})
 }
 return [ordered]@{description=$samplingDescription;device=$samplingDevice;address_type=$samplingType;address=$samplingAddressValue;sample_mode='Time-based';period_ms=$samplingPeriod;maximum_records=$samplingCapacity;high_priority=$false;auto_stop=$false;system_tag=$false;user_defined_tag=$false;index_register=$null;channels=@($samplingChannels.ToArray());channel_count=$samplingChannels.Count;total_word_width=$samplingWordCount}
}
function Get-WeinviewSamplingV4FiniteConfiguration($Rows) {
 if(@($Rows).Count -lt 6){return $null}
 $header=@($Rows[0].fields);$mode=@($Rows[1].fields);$priority=@($Rows[2].fields);$read=@($Rows[3].fields)
 if($header.Count -ne 2 -or $header[0] -cne 'Data Sampling' -or !$header[1] -or $mode.Count -ne 4 -or $mode[0] -cne '' -or $mode[1] -cne 'Sample Mode' -or $mode[2] -cne 'Time-based' -or $mode[3] -cnotmatch '^([1-9][0-9]{0,8}) ms$' -or $priority.Count -ne 3 -or $priority[0] -cne '' -or $priority[1] -cne '' -or $priority[2] -cne 'High Priority: Off'){return $null};$period=[int]$Matches[1]
 if($read.Count -ne 8 -or $read[0] -cne '' -or $read[1] -cne 'Read Address' -or !$read[2] -or !$read[3] -or $read[4] -cne 'System Tag: Off' -or $read[5] -cne 'User-defined Tag: Off' -or !$read[6] -or $read[7] -cne 'IDX: null'){return $null}
 $address=[string]$read[6];if($read[2] -ceq 'Local HMI' -and $read[3] -ceq 'LW' -and $address -cmatch '^(0|[1-9][0-9]{0,4})$'){$address=[int]$address}
 $historyFile=$null;$channelEnd=@($Rows).Count
 if($channelEnd -ge 9){
  $history=@($Rows[$channelEnd-3].fields);$sync=@($Rows[$channelEnd-2].fields);$file=@($Rows[$channelEnd-1].fields)
  if($history.Count -eq 3 -and $history[0] -ceq '' -and $history[1] -ceq 'History File' -and $history[2] -ceq 'USB Disk' -and $sync.Count -eq 3 -and $sync[0] -ceq '' -and $sync[1] -ceq '' -and $sync[2] -ceq 'Sync Status Address: Off' -and $file.Count -eq 4 -and $file[0] -ceq '' -and $file[1] -ceq '' -and $file[2] -ceq 'File Name' -and (Test-WeinviewSamplingCsvHistoryFileName $file[3])){
   $historyFile=[ordered]@{storage='usb_disk';file_name=[string]$file[3]};$channelEnd-=3
  }
 }
 $channels=[Collections.Generic.List[object]]::new();$words=0
 for($i=5;$i -lt $channelEnd;$i++){
  $fields=@($Rows[$i].fields)
  if($fields.Count -notin @(7,13) -or $fields[0] -cne '' -or $fields[1] -cne '' -or !$fields[2] -or $fields[3] -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float') -or $fields[4] -cne 'Left of decimal Pt. 4' -or $fields[5] -cne 'Right of decimal Pt. 0' -or $fields[6] -cne 'Leading zero Off'){return $null}
  if($fields.Count -eq 13 -and ($fields[7] -cne $read[2] -or $fields[8] -cne $read[3] -or $fields[9] -cne $read[4] -or $fields[10] -cne $read[5] -or $fields[11] -cne $read[6] -or $fields[12] -cne $read[7])){return $null}
  $width=if($fields[3] -ceq '32-bit Float'){2}else{1};$words+=$width
  $channels.Add([ordered]@{label=[string]$fields[2];data_type=[string]$fields[3];word_width=$width})
 }
 if($channels.Count -eq 0){return $null}
 $finite=[ordered]@{description=[string]$header[1];device=[string]$read[2];address_type=[string]$read[3];address=$address;sample_mode='Time-based';period_ms=$period;maximum_records=$null;high_priority=$false;auto_stop=$null;system_tag=$false;user_defined_tag=$false;index_register=$null;channels=@($channels.ToArray());channel_count=$channels.Count;total_word_width=$words;native_csv_version=4}
 if($null -ne $historyFile){$finite.history_file=$historyFile}
 return $finite
}
function Read-WeinviewSamplingCsv {
 param([Parameter(Mandatory=$true)][string]$Path)
 $samplingFullPath=[IO.Path]::GetFullPath($Path);$samplingBytes=[IO.File]::ReadAllBytes($samplingFullPath)
 if($samplingBytes.Length -lt 15 -or $samplingBytes.Length -gt 4194304 -or $samplingBytes[0] -ne 239 -or $samplingBytes[1] -ne 187 -or $samplingBytes[2] -ne 191){throw 'Native Sampling CSV requires bounded UTF8 BOM'}
 $samplingUtf8=[Text.UTF8Encoding]::new($false,$true);$samplingText=$samplingUtf8.GetString($samplingBytes,3,$samplingBytes.Length-3)
 $samplingRows=ConvertFrom-WeinviewSamplingCsvText $samplingText
 if($samplingRows.Count -lt 1 -or @($samplingRows[0].fields).Count -ne 1 -or $samplingRows[0].fields[0] -cnotin @('Version: 1','Version: 4')){throw 'Native Sampling CSV version 1 or observed 4 required'}
 $samplingVersion=if($samplingRows[0].fields[0] -ceq 'Version: 4'){4}else{1}
 $samplingBlocks=[Collections.Generic.List[object]]::new();$samplingStarts=[Collections.Generic.List[int]]::new()
 for($samplingRowIndex=1;$samplingRowIndex -lt $samplingRows.Count;$samplingRowIndex++){if($samplingRows[$samplingRowIndex].fields[0] -cne ''){$samplingStarts.Add($samplingRowIndex)}}
 for($samplingBlockIndex=0;$samplingBlockIndex -lt $samplingStarts.Count;$samplingBlockIndex++) {
  $samplingStart=$samplingStarts[$samplingBlockIndex];$samplingEnd=$samplingRows.Count;if($samplingBlockIndex+1 -lt $samplingStarts.Count){$samplingEnd=$samplingStarts[$samplingBlockIndex+1]}
  $samplingBlockRows=@($samplingRows[$samplingStart..($samplingEnd-1)]);$samplingRaw=($samplingBlockRows|ForEach-Object {$_.raw_csv}) -join ''
  $samplingBlockFields=@($samplingBlockRows[0].fields);$samplingIsSampling=$samplingBlockFields[0] -ceq 'Data Sampling'
  $samplingFinite=$null;if($samplingIsSampling){$samplingFinite=Get-WeinviewSamplingFiniteConfiguration $samplingBlockRows}
  $samplingBlocks.Add([ordered]@{block_index=$samplingBlockIndex;start_record=$samplingStart;record_count=$samplingBlockRows.Count;header_fields=$samplingBlockFields;is_sampling=$samplingIsSampling;raw_csv=$samplingRaw;raw_sha256=(Get-WeinviewSamplingBytesSha256 $samplingUtf8.GetBytes($samplingRaw));finite_configuration=$samplingFinite;full_properties_verified=$false})
 }
 $samplingProfileSchema=Get-WeinviewSamplingCsvProfileSchema
 return [ordered]@{schema=$samplingProfileSchema.schema;schema_json=$samplingProfileSchema.schema_json;schema_sha256=$samplingProfileSchema.schema_sha256;path=$samplingFullPath;sha256=(Get-WeinviewSamplingBytesSha256 $samplingBytes);byte_length=$samplingBytes.Length;encoding='UTF8-BOM';line_ending='CRLF';version=$samplingVersion;rows=@($samplingRows);blocks=@($samplingBlocks.ToArray());sampling_count=@($samplingBlocks|Where-Object {$_.is_sampling}).Count;full_properties_verified=$false}
}
function Assert-WeinviewSamplingCsvNewText($Value,[string]$Field) {
 if($Value -isnot [string] -or !$Value -or !$Value.Trim() -or $Value.Length -gt 256){throw "Sampling $Field requires nonempty string <=256 UTF16 units"}
 foreach($samplingCharacter in $Value.ToCharArray()){if([char]::IsControl($samplingCharacter) -or $samplingCharacter -eq [char]34 -or $samplingCharacter -eq [char]44){throw "Sampling $Field control/comma/quote is outside the proven native profile"}}
}
function Test-WeinviewSamplingCsvHistoryFileName($Value) {
 if($Value -isnot [string] -or !$Value -or !$Value.Trim() -or $Value.Length -gt 256 -or $Value -in @('.','..') -or $Value.EndsWith(' ') -or $Value.EndsWith('.')){return $false}
 if($Value -match '[<>:"/\\|?*,]' -or $Value -match '[\x00-\x1F]'){return $false}
 if($Value -match '^(?i:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$'){return $false}
 return $true
}
function Assert-WeinviewSamplingCsvInteger($Value,[int]$Minimum,[int]$Maximum,[string]$Field) {
 if(($Value -isnot [int] -and $Value -isnot [long]) -or $Value -lt $Minimum -or $Value -gt $Maximum){throw "Sampling $Field requires integer $Minimum..$Maximum"}
}
function Assert-WeinviewSamplingCsvObject($samplingObject,$DeviceDirectory=@(),$TagRows=@(),[switch]$StructureOnly) {
  $samplingKeys=@();if($samplingObject -is [Collections.IDictionary]){$samplingKeys=@($samplingObject.Keys)}elseif($null -ne $samplingObject){$samplingKeys=@($samplingObject.PSObject.Properties.Name)}else{throw 'Sampling object required'}
  foreach($samplingKey in $samplingKeys){if($samplingKey -cnotin @('description','tag_name','address','maximum_records','channel_description','period_ms','channels','history_file')){throw "Unknown Sampling request field: $samplingKey"}}
  Assert-WeinviewSamplingCsvNewText $samplingObject.description 'description'
  $samplingBinding=$null
  if('tag_name' -cin $samplingKeys){
   if('address' -cin $samplingKeys){throw 'Sampling tag_name and direct address are mutually exclusive'}
   $samplingBinding=Resolve-WeinviewProjectAddress $samplingObject $DeviceDirectory $TagRows -StructureOnly:$StructureOnly
   if(!$StructureOnly){foreach($field in @('device','address_type','address')){Assert-WeinviewSamplingCsvNewText ([string]$samplingBinding.$field) $field}}
  }else{
   Assert-WeinviewSamplingCsvInteger $samplingObject.address 0 65535 'address'
   $samplingBinding=[pscustomobject]@{tag_name=$null;device='Local HMI';address_type='LW';address=([string]$samplingObject.address);data_type='16-bit Signed'}
  }
  $samplingHistory=$null
  if('history_file' -cin $samplingKeys){
   if('maximum_records' -cin $samplingKeys){throw 'Sampling history_file cannot claim maximum_records'}
   $historyObject=$samplingObject.history_file
   $historyKeys=@();if($historyObject -is [Collections.IDictionary]){$historyKeys=@($historyObject.Keys)}elseif($null -ne $historyObject){$historyKeys=@($historyObject.PSObject.Properties.Name)}
   if($historyKeys.Count -ne 2 -or 'storage' -cnotin $historyKeys -or 'file_name' -cnotin $historyKeys -or $historyObject.storage -isnot [string] -or $historyObject.storage -cne 'usb_disk' -or !(Test-WeinviewSamplingCsvHistoryFileName $historyObject.file_name)){throw 'Sampling history_file requires exact usb_disk storage and valid basename file_name'}
   $samplingHistory=[ordered]@{storage='usb_disk';file_name=[string]$historyObject.file_name}
  }
  $samplingMaximum=60;if('maximum_records' -cin $samplingKeys){Assert-WeinviewSamplingCsvInteger $samplingObject.maximum_records 60 60 'maximum_records';$samplingMaximum=[int]$samplingObject.maximum_records}
  if($null -ne $samplingHistory){$samplingMaximum=$null}
  $samplingPeriod=1000;if('period_ms' -cin $samplingKeys){Assert-WeinviewSamplingCsvInteger $samplingObject.period_ms 100 7200000 'period_ms';$samplingPeriod=[int]$samplingObject.period_ms;if($samplingPeriod%100 -ne 0){throw 'Sampling period_ms requires a multiple of 100'}}
  $samplingMulti='channels' -cin $samplingKeys;$samplingChannels=[Collections.Generic.List[object]]::new();$samplingTotalWords=0
  if($samplingMulti){
   if('tag_name' -cin $samplingKeys){throw 'Sampling channels require a direct Local HMI LW start address.'}
   if('channel_description' -cin $samplingKeys){throw 'Sampling channels and channel_description are mutually exclusive'}
   if($samplingObject.channels -isnot [Array] -or $samplingObject.channels.Count -lt 1){throw 'Sampling channels requires a nonempty ordered JSON array of channel objects'}
   if($samplingBinding.device -cne 'Local HMI'){throw 'External Sampling tag currently requires one native channel; multi-channel external span needs an original driver/address contract.'}
   Assert-WeinviewSamplingCsvInteger $samplingObject.address 0 8999 'channels address'
   foreach($samplingChannelObject in $samplingObject.channels){
    $samplingChannelKeys=@();if($samplingChannelObject -is [Collections.IDictionary]){$samplingChannelKeys=@($samplingChannelObject.Keys)}elseif($null -ne $samplingChannelObject -and $samplingChannelObject -is [pscustomobject]){$samplingChannelKeys=@($samplingChannelObject.PSObject.Properties.Name)}else{throw 'Sampling channel object required'}
    if($samplingChannelKeys.Count -ne 2 -or 'label' -cnotin $samplingChannelKeys -or 'data_type' -cnotin $samplingChannelKeys){throw 'Sampling channel requires only label and data_type'}
    Assert-WeinviewSamplingCsvNewText $samplingChannelObject.label 'channel label'
    if($samplingChannelObject.data_type -isnot [string] -or $samplingChannelObject.data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float')){throw 'Sampling channel format is outside the three observed native types'}
    $samplingWordWidth=1;if($samplingChannelObject.data_type -ceq '32-bit Float'){$samplingWordWidth=2}
    $samplingTotalWords+=$samplingWordWidth
    $samplingChannels.Add([ordered]@{label=[string]$samplingChannelObject.label;data_type=[string]$samplingChannelObject.data_type;word_width=$samplingWordWidth})
   }
   if(([long]$samplingObject.address+$samplingTotalWords-1) -gt 8999){throw 'Sampling channels inclusive LW word span exceeds new user-address scope 8999'}
  }else{
   $samplingChannel=[string]$samplingObject.description;if('channel_description' -cin $samplingKeys){Assert-WeinviewSamplingCsvNewText $samplingObject.channel_description 'channel_description';$samplingChannel=[string]$samplingObject.channel_description}
   if(!$StructureOnly -and $samplingBinding.data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float')){throw 'Single Sampling tag requires one of the three native CSV channel data types.'}
  }
 if($StructureOnly){return}
 $samplingValidatedAddress=if($samplingBinding.device -ceq 'Local HMI' -and $samplingBinding.address_type -ceq 'LW'){[int]$samplingBinding.address}else{[string]$samplingBinding.address}
 return [ordered]@{description=[string]$samplingObject.description;tag_name=$samplingBinding.tag_name;device=$samplingBinding.device;address_type=$samplingBinding.address_type;address=$samplingValidatedAddress;data_type=$samplingBinding.data_type;native_device_verified=$samplingBinding.native_device_verified;native_tag_verified=$samplingBinding.native_tag_verified;maximum_records=$samplingMaximum;period_ms=$samplingPeriod;history_file=$samplingHistory;multichannel=$samplingMulti;channel_description=$samplingChannel;channels=@($samplingChannels.ToArray());total_word_width=$samplingTotalWords}
}
function Add-WeinviewSamplingCsvRows {
 param([Parameter(Mandatory=$true)][string]$InputPath,[Parameter(Mandatory=$true)][string]$OutputPath,[Parameter(Mandatory=$true)][string]$ExpectedInputSha256,[Parameter(Mandatory=$true)][object[]]$Objects,$DeviceDirectory=@(),$TagRows=@())
 if($ExpectedInputSha256 -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Sampling expected input SHA256 required'}
 if($Objects.Count -lt 1 -or $Objects.Count -gt 8){throw 'Sampling append batch requires 1..8 configurations'}
 $samplingInputFull=[IO.Path]::GetFullPath($InputPath);$samplingOutputFull=[IO.Path]::GetFullPath($OutputPath)
 if([string]::Equals($samplingInputFull,$samplingOutputFull,[StringComparison]::OrdinalIgnoreCase) -or [IO.File]::Exists($samplingOutputFull) -or [IO.Directory]::Exists($samplingOutputFull)){throw 'Sampling output must be fresh and distinct from source'}
 $samplingOriginal=[IO.File]::ReadAllBytes($samplingInputFull);$samplingBefore=Read-WeinviewSamplingCsv -Path $samplingInputFull
 if((Get-WeinviewSamplingBytesSha256 $samplingOriginal) -cne $samplingBefore.sha256 -or $samplingBefore.sha256 -cne $ExpectedInputSha256.ToUpperInvariant()){throw 'Sampling source SHA256 mismatch'}
 $samplingNames=[Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
 foreach($samplingOldBlock in $samplingBefore.blocks){if($samplingOldBlock.is_sampling){if(@($samplingOldBlock.header_fields).Count -ne 2 -or !$samplingOldBlock.header_fields[1] -or !$samplingNames.Add([string]$samplingOldBlock.header_fields[1])){throw 'Sampling existing identities are ambiguous'}}}
 $samplingAppend=[Text.StringBuilder]::new();$samplingNew=[Collections.Generic.List[object]]::new()
 foreach($samplingObject in $Objects) {
  $samplingValidated=Assert-WeinviewSamplingCsvObject $samplingObject $DeviceDirectory $TagRows
  if($null -ne $samplingValidated.history_file -and $samplingBefore.version -ne 4){throw 'Sampling history_file requires native input CSV Version: 4'}
  $samplingV4=$samplingBefore.version -eq 4
  if($samplingV4){
   $samplingObjectKeys=if($samplingObject -is [Collections.IDictionary]){@($samplingObject.Keys)}else{@($samplingObject.PSObject.Properties.Name)}
   if('maximum_records' -cin $samplingObjectKeys){throw 'Sampling CSV Version: 4 does not accept maximum_records; omit maximum_records to use the native sampling capacity.'}
   $samplingValidated.maximum_records=$null
  }
  $samplingMaximum=$samplingValidated.maximum_records;$samplingPeriod=$samplingValidated.period_ms;$samplingMulti=$samplingValidated.multichannel;$samplingChannel=$samplingValidated.channel_description;$samplingChannelType=$samplingValidated.data_type;$samplingChannels=@($samplingValidated.channels);$samplingTotalWords=$samplingValidated.total_word_width
  if(!$samplingNames.Add([string]$samplingObject.description)){throw 'Sampling description must be unique across old and new configurations'}
  $samplingNewStart=$samplingAppend.Length
  [void]$samplingAppend.Append('Data Sampling,').Append([string]$samplingObject.description).Append("`r`n,Sample Mode,Time-based,").Append($samplingPeriod).Append(" ms`r`n,,High Priority: Off`r`n,Read Address,").Append($samplingValidated.device).Append(',').Append($samplingValidated.address_type).Append(',System Tag: Off,User-defined Tag: Off,').Append($samplingValidated.address).Append(",IDX: null`r`n")
  if($samplingV4){[void]$samplingAppend.Append(",Data Record`r`n")}
  else{[void]$samplingAppend.Append(",Data Record,Max Data Records: 60,Auto Stop: Off`r`n")}
  $channelIndex=0
  if($samplingMulti){foreach($samplingNewChannel in $samplingChannels){[void]$samplingAppend.Append(',,').Append($samplingNewChannel.label).Append(',').Append($samplingNewChannel.data_type);if($samplingV4){[void]$samplingAppend.Append(',Left of decimal Pt. 4,Right of decimal Pt. 0,Leading zero Off');if($channelIndex -eq 0){[void]$samplingAppend.Append(',').Append($samplingValidated.device).Append(',').Append($samplingValidated.address_type).Append(',System Tag: Off,User-defined Tag: Off,').Append($samplingValidated.address).Append(',IDX: null')}};[void]$samplingAppend.Append("`r`n");$channelIndex++}}
  else{[void]$samplingAppend.Append(',,').Append($samplingChannel).Append(',').Append($samplingChannelType);if($samplingV4){[void]$samplingAppend.Append(',Left of decimal Pt. 4,Right of decimal Pt. 0,Leading zero Off,').Append($samplingValidated.device).Append(',').Append($samplingValidated.address_type).Append(',System Tag: Off,User-defined Tag: Off,').Append($samplingValidated.address).Append(',IDX: null')};[void]$samplingAppend.Append("`r`n")}
  if($null -ne $samplingValidated.history_file){[void]$samplingAppend.Append(",History File,USB Disk`r`n,,Sync Status Address: Off`r`n,,File Name,").Append($samplingValidated.history_file.file_name).Append("`r`n")}
  $samplingRaw=$samplingAppend.ToString().Substring($samplingNewStart);$samplingNewRows=ConvertFrom-WeinviewSamplingCsvText $samplingRaw;$samplingFinite=Get-WeinviewSamplingFiniteConfiguration $samplingNewRows
  if($null -eq $samplingFinite){throw 'Internal Sampling profile did not roundtrip'}
  if($samplingMulti){$samplingDescriptor=[ordered]@{description=[string]$samplingObject.description;device=$samplingValidated.device;address_type=$samplingValidated.address_type;address=$samplingValidated.address;maximum_records=$samplingMaximum;period_ms=$samplingPeriod;channels=@($samplingChannels);total_word_width=$samplingTotalWords;raw_csv=$samplingRaw;raw_sha256=(Get-WeinviewSamplingBytesSha256 ([Text.UTF8Encoding]::new($false,$true).GetBytes($samplingRaw)));finite_configuration=$samplingFinite;full_properties_verified=$false}}
  else{$samplingDescriptor=[ordered]@{description=[string]$samplingObject.description;tag_name=$samplingValidated.tag_name;device=$samplingValidated.device;address_type=$samplingValidated.address_type;address=$samplingValidated.address;maximum_records=$samplingMaximum;period_ms=$samplingPeriod;channel_description=$samplingChannel;binding_evidence=@{tag_name=$samplingValidated.tag_name;device=$samplingValidated.device;address_type=$samplingValidated.address_type;address=$samplingValidated.address;data_type=$samplingValidated.data_type;native_device_verified=$samplingValidated.native_device_verified;native_tag_verified=$samplingValidated.native_tag_verified};raw_csv=$samplingRaw;raw_sha256=(Get-WeinviewSamplingBytesSha256 ([Text.UTF8Encoding]::new($false,$true).GetBytes($samplingRaw)));finite_configuration=$samplingFinite;full_properties_verified=$false}}
  if($null -ne $samplingValidated.history_file){$samplingDescriptor.history_file=$samplingValidated.history_file}
  $samplingNew.Add($samplingDescriptor)
 }
 $samplingExtra=[Text.UTF8Encoding]::new($false,$true).GetBytes($samplingAppend.ToString());$samplingResultBytes=[byte[]]::new($samplingOriginal.Length+$samplingExtra.Length)
 [Buffer]::BlockCopy($samplingOriginal,0,$samplingResultBytes,0,$samplingOriginal.Length);[Buffer]::BlockCopy($samplingExtra,0,$samplingResultBytes,$samplingOriginal.Length,$samplingExtra.Length)
 $samplingStream=[IO.File]::Open($samplingOutputFull,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$samplingStream.Write($samplingResultBytes,0,$samplingResultBytes.Length);$samplingStream.Flush()}finally{$samplingStream.Dispose()}
 $samplingAfter=Read-WeinviewSamplingCsv -Path $samplingOutputFull
 if($samplingAfter.sha256 -cne (Get-WeinviewSamplingBytesSha256 $samplingResultBytes) -or (Get-WeinviewSamplingBytesSha256 ([IO.File]::ReadAllBytes($samplingInputFull))) -cne $samplingBefore.sha256){throw 'Sampling output/source verification failed'}
 return [ordered]@{schema=$samplingBefore.schema;schema_json=$samplingBefore.schema_json;schema_sha256=$samplingBefore.schema_sha256;input_path=$samplingInputFull;input_sha256=$samplingBefore.sha256;output_path=$samplingOutputFull;output_sha256=$samplingAfter.sha256;source_unchanged=$true;old_byte_length=$samplingOriginal.Length;old_prefix_sha256=(Get-WeinviewSamplingBytesSha256 ([byte[]]$samplingResultBytes[0..($samplingOriginal.Length-1)]));old_bytes_preserved=$true;before_sampling_count=$samplingBefore.sampling_count;after_sampling_count=$samplingAfter.sampling_count;appended=@($samplingNew.ToArray());before=$samplingBefore;after=$samplingAfter;full_properties_verified=$false;native_import_verified=$false}
}
