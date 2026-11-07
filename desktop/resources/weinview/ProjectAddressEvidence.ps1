# Resolve an address from the current project's native device directory and tag export.
# Callers own the original-session export, project SHA and save/reopen lifecycle.
function Test-WeinviewAddressEvidenceRequired($Items) {
 foreach($item in @($Items)) {
  if($null -eq $item){continue}
  $keys=@($item.PSObject.Properties.Name)
  if($keys -ccontains 'tag_name' -or $keys -ccontains 'device'){return $true}
 }
 return $false
}
function Get-WeinviewCurrentAddressEvidence($Session,[string]$EvidencePrefix,[string]$ExpectedProjectSha256,$TagEvidence=$null) {
 if([string]::IsNullOrWhiteSpace($EvidencePrefix) -or $ExpectedProjectSha256 -cnotmatch '^[A-Fa-f0-9]{64}$') {throw 'Current address evidence requires a fresh prefix and exact project SHA.'}
 Assert-WeinviewPlcCandidateSession $Session
 if((Hash $Session.output_path) -cne $ExpectedProjectSha256.ToUpperInvariant()) {throw 'Project changed before address evidence read.'}
 $deviceEvidence=Read-WeinviewProjectDeviceDirectory $Session
 if(!$deviceEvidence.native_directory_verified -or @($deviceEvidence.device_directory).Count -lt 1) {throw 'Current native device directory was not verified.'}
 # A batch may reuse an export already read from this same session after tags_upsert.
 if($null -eq $TagEvidence){
  $csvPath=$EvidencePrefix+'.tags.csv';$opened=$false
  try {
   $null=Open-WeinviewTagLibrary $Session;$opened=$true
   $TagEvidence=Export-WeinviewTags $Session $csvPath
  } finally {if($opened){Close-WeinviewTagLibrary $Session}}
 }else{$csvPath=[string]$TagEvidence.native_csv_path}
 if($null -eq $tagEvidence -or (Hash $csvPath) -cne $tagEvidence.tags_sha256 -or $tagEvidence.table_origin -cnotin @('native_export','native_empty_table_with_derived_envelope')) {throw 'Current native tag export was not verified.'}
 if((Hash $Session.output_path) -cne $ExpectedProjectSha256.ToUpperInvariant()) {throw 'Address evidence read changed project bytes.'}
 return [pscustomobject]@{project_sha256=$ExpectedProjectSha256.ToUpperInvariant();device_directory=@($deviceEvidence.device_directory);tag_rows=@($tagEvidence.tags);tags_sha256=$tagEvidence.tags_sha256;native_csv_path=$tagEvidence.native_csv_path;table_origin=$tagEvidence.table_origin;native_directory_verified=$true;native_tags_verified=$true;device_ribbon_evidence=$deviceEvidence.ribbon_evidence}
}
function Resolve-WeinviewProjectAddress($Item,$DeviceDirectory=@(),$TagRows=@(),[switch]$StructureOnly) {
 $keys=if($Item -is [Collections.IDictionary]){@($Item.Keys)}else{@($Item.PSObject.Properties.Name)}
 $tagName=if($keys -ccontains 'tag_name'){[string]$Item.tag_name}else{''}
 $device='';$kind='';$address='';$dataType=$null
 if($keys -ccontains 'tag_name'){
  if($Item.tag_name -isnot [string] -or [string]::IsNullOrWhiteSpace($tagName) -or $tagName.Length -gt 64 -or $tagName -match '[\x00-\x1f\x7f]'){throw 'A bounded native tag_name without controls is required.'}
  foreach($key in @('device','address_type','address')){if($keys -ccontains $key){throw 'tag_name and direct address fields are mutually exclusive.'}}
  if($StructureOnly){return}
  $matches=@($TagRows|Where-Object {$_.name -ceq $tagName})
  if($matches.Count -ne 1){throw 'Exact existing native address tag required.'}
  $device=[string]$matches[0].device;$kind=[string]$matches[0].address_type;$address=[string]$matches[0].address
  $dataType=[string]$matches[0].data_type
 }else{
  foreach($key in @('device','address_type','address')){if($keys -cnotcontains $key){throw 'Direct address requires device, address_type and address.'}}
  $device=[string]$Item.device;$kind=[string]$Item.address_type;$address=[string]$Item.address
  # An existing exported tag is the evidence for a non-local direct address.
  if(!$StructureOnly -and $device -cne 'Local HMI'){
   $matches=@($TagRows|Where-Object {$_.device -ceq $device -and $_.address_type -ceq $kind -and $_.address -ceq $address})
   if(!$matches.Count){throw 'External direct address must match a current native tag row.'}
   $types=@($matches|ForEach-Object {$_.data_type}|Select-Object -Unique)
   if($types.Count -ne 1){throw 'External native tag data type is ambiguous.'};$dataType=[string]$types[0]
  }
 }
 if(!$device -or !$kind -or !$address -or $device.Length -gt 64 -or $kind.Length -gt 128 -or $address.Length -gt 128 -or $device -match '[\x00-\x1f\x7f]' -or $kind -match '[\x00-\x1f\x7f]' -or $address -match '[\x00-\x1f\x7f]'){throw 'Native address fields are empty or contain controls.'}
 if($StructureOnly){return}
 if(@($DeviceDirectory|Where-Object {$_.name -ceq $device}).Count -ne 1){throw 'Address device absent or duplicated in current native project directory.'}
 return [pscustomobject]@{tag_name=if($tagName){$tagName}else{$null};device=$device;address_type=$kind;address=$address;data_type=$dataType;native_device_verified=$true;native_tag_verified=($tagName -ne '' -or $device -cne 'Local HMI')}
}
