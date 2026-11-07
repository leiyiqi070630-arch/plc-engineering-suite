# Windows PowerShell 5.1. File handoff only; never connects to an HMI.
# The official Utility Manager / EasyDownload remains responsible for transfer.
function Get-WeinviewHandoffHash([string]$Path) {
 $stream=[IO.File]::OpenRead($Path);$sha=[Security.Cryptography.SHA256]::Create()
 try{return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','')}
 finally{$sha.Dispose();$stream.Dispose()}
}
function Assert-WeinviewHandoffPath([string]$Path,[bool]$Exists) {
 if(!$Path -or $Path -cnotmatch '^[A-Za-z]:\\' -or $Path.Substring(2).Contains(':') -or $Path -match '["\r\n]'){throw 'Absolute local path required.'}
 $full=[IO.Path]::GetFullPath($Path)
 if(@($full.Substring(3).Split('\')|Where-Object {$_ -in @('.','..') -or $_.EndsWith(' ') -or $_.EndsWith('.')}).Count){throw 'Canonical local path required.'}
 $cursor=if($Exists){$full}else{[IO.Path]::GetDirectoryName($full)}
 while($cursor -and $cursor.Length -gt 3){
  if(Test-Path -LiteralPath $cursor){if((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Reparse path refused.'}}
  $cursor=[IO.Path]::GetDirectoryName($cursor)
 }
 if($Exists -and !(Test-Path -LiteralPath $full -PathType Leaf)){throw 'Required source file absent.'}
 if(!$Exists -and (Test-Path -LiteralPath $full)){throw 'Fresh output path required.'}
 return $full
}
function Write-WeinviewHandoffJson([string]$Path,$Value) {
 $json=ConvertTo-Json -InputObject $Value -Depth 12
 [IO.File]::WriteAllText($Path,$json,(New-Object Text.UTF8Encoding($false)))
}
function Copy-WeinviewHandoffAssociatedAssets($Assets,[string]$Output) {
 if(!$Assets){return}
 $index=0
 $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
 foreach($asset in @($Assets)){
  $raw=[string]$asset.path
  if(!$raw){throw 'Associated asset path required.'}
  $source=[IO.Path]::GetFullPath($raw)
  # The existing file validator checks each ancestor for reparse points. A
  # directory is checked through a fresh child path, then inspected below.
  if(Test-Path -LiteralPath $source -PathType Leaf){$source=Assert-WeinviewHandoffPath $source $true}
  elseif(Test-Path -LiteralPath $source -PathType Container){[void](Assert-WeinviewHandoffPath (Join-Path $source '__handoff_path_probe__') $false)}
  else{throw 'Associated asset source absent.'}
  if(!$seen.Add($source)){throw 'Duplicate associated asset path.'}
  $item=Get-Item -LiteralPath $source -Force
  if($item.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Associated asset reparse point refused.'}
  $directory=$item.PSIsContainer
  if($directory -and $Output.StartsWith($source.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Associated asset contains handoff output.'}
  $base=Join-Path (Join-Path $Output 'associated_assets') ('{0:D4}' -f $index)
  $saved=Join-Path $base $item.Name
  [IO.Directory]::CreateDirectory($base)|Out-Null
  $files=New-Object 'Collections.Generic.List[object]'
  if($directory){
   [IO.Directory]::CreateDirectory($saved)|Out-Null
   $dirs=@(Get-ChildItem -LiteralPath $source -Directory -Recurse -Force)
   foreach($dir in $dirs){
    if($dir.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Associated asset reparse directory refused.'}
    [IO.Directory]::CreateDirectory((Join-Path $saved $dir.FullName.Substring($source.Length+1)))|Out-Null
   }
   $entries=@(Get-ChildItem -LiteralPath $source -File -Recurse -Force)
  }else{$entries=@($item)}
  foreach($entry in $entries){
   if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Associated asset reparse file refused.'}
   $relative=if($directory){$entry.FullName.Substring($source.Length+1)}else{$entry.Name}
   $target=if($directory){Join-Path $saved $relative}else{$saved}
   [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target))|Out-Null
   $hash=Get-WeinviewHandoffHash $entry.FullName
   if(!$directory -and $asset.expected_sha256 -and $hash -ine [string]$asset.expected_sha256){throw 'Associated asset expected SHA256 differs.'}
   [IO.File]::Copy($entry.FullName,$target,$false)
   if((Get-WeinviewHandoffHash $entry.FullName) -cne $hash -or (Get-WeinviewHandoffHash $target) -cne $hash){throw 'Associated asset copy SHA256 differs.'}
   $files.Add(@{relative_path=$relative;sha256=$hash;bytes=$entry.Length})
  }
  [pscustomobject]@{source_path=$source;kind=if($directory){'directory'}else{'file'};saved_path=$saved;files=@($files.ToArray());file_count=$files.Count}
  $index++
 }
}
function Invoke-WeinviewProjectFieldHandoff($Arguments,$Installation=$null) {
 $ErrorActionPreference='Stop'
 $action=[string]$Arguments.action
 if($action -cnotin @('prepare_download','prepare_cxob','prepare_native_directory','build_native_directory','await_native_upload','accept_upload','prepare_user_accounts')){throw 'Unknown handoff action.'}
 $output=Assert-WeinviewHandoffPath ([string]$Arguments.output_directory) $false
 $parent=[IO.Path]::GetDirectoryName($output)
 if(!(Test-Path -LiteralPath $parent -PathType Container)){throw 'Output parent directory absent.'}
 if($action -ceq 'build_native_directory'){
  if(!$Installation -or !(Get-Command Invoke-WeinviewNativeDownloadDataBuild -ErrorAction SilentlyContinue)){throw 'Original installation and native Build operation required.'}
  return (Invoke-WeinviewNativeDownloadDataBuild $Arguments $Installation)
 }
 if($action -ceq 'prepare_native_directory'){
  $source=[IO.Path]::GetFullPath([string]$Arguments.native_download_directory)
  if(!(Test-Path -LiteralPath $source -PathType Container)){throw 'Original Build-for-SD/USB directory required.'}
  [IO.Directory]::CreateDirectory($output)|Out-Null
  $assets=@(Copy-WeinviewHandoffAssociatedAssets $Arguments.associated_assets $output)
  if(!$assets.Count -or $assets[0].source_path -ine $source -or $assets[0].kind -cne 'directory' -or [int]$assets[0].file_count -eq 0){throw 'Original nonempty download directory copy required.'}
  $saved=[string]$assets[0].saved_path
  $manifest=[ordered]@{schema=1;action=$action;source_directory=$source;native_download_directory=$saved;associated_assets=$assets;external_assets_included=$true;native_build_performed=$false;device_transfer_verified=$false;next_native_step='EasyDownload: select corresponding Series and this download data folder';created_utc=[DateTime]::UtcNow.ToString('o')}
  $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
  return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);source_directory=$source;native_download_directory=$saved;associated_assets=$assets;external_assets_included=$true;native_build_performed=$false;device_transfer_verified=$false;next_native_step=$manifest.next_native_step}
 }
 if($action -ceq 'prepare_user_accounts'){
  $kind=[string]$Arguments.user_accounts_artifact_kind
  if($kind -cnotin @('save_to_folder','export_backup')){throw 'Original Administrator Tools asset kind required.'}
  $requested=@($Arguments.associated_assets)
  if($requested.Count -ne 1){throw 'Exactly one explicitly supplied User Accounts asset required.'}
  $nativeSource=[IO.Path]::GetFullPath([string]$requested[0].path)
  if($kind -ceq 'save_to_folder' -and (([IO.Path]::GetFileName($nativeSource) -cne 'UserAccounts') -or !(Test-Path -LiteralPath $nativeSource -PathType Leaf))){throw 'Original Save to folder UserAccounts file required.'}
  [IO.Directory]::CreateDirectory($output)|Out-Null
  $assets=@(Copy-WeinviewHandoffAssociatedAssets $requested $output)
  $nativeNext=if($kind -ceq 'save_to_folder'){'EasyWeb 2.0 > Enhanced Security > Import User Accounts; then Account > Save'}else{'Administrator Tools > User Accounts > Import backup; then Save to folder to create UserAccounts'}
  $manifest=[ordered]@{schema=1;action=$action;status='native_import_pending';user_accounts_artifact_kind=$kind;associated_assets=$assets;external_assets_included=$true;native_format_verified=$false;native_import_performed=$false;device_transfer_verified=$false;next_native_step=$nativeNext;created_utc=[DateTime]::UtcNow.ToString('o')}
  $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
  return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);status='native_import_pending';user_accounts_artifact_kind=$kind;user_accounts_saved_path=$assets[0].saved_path;associated_assets=$assets;external_assets_included=$true;native_format_verified=$false;native_import_performed=$false;device_transfer_verified=$false;next_native_step=$nativeNext}
 }
 if($action -ceq 'await_native_upload'){
  $targetId=[string]$Arguments.target_hmi
  $address=[Net.IPAddress]::None
  if(-not [Net.IPAddress]::TryParse($targetId,[ref]$address) -or $address.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork -or $targetId -cne $address.ToString()){throw 'Canonical target HMI IPv4 required.'}
  [IO.Directory]::CreateDirectory($output)|Out-Null
  $format=if($Arguments.upload_format){[string]$Arguments.upload_format}else{'cxob'}
  if($format -cnotin @('cxob','exob')){throw 'Original upload format CXOB or EXOB required.'}
  $requested=Join-Path $output ('vendor-upload.'+$format)
  $manifest=[ordered]@{schema=1;action=$action;status='awaiting_native_upload';target_hmi=$targetId;upload_format=$format;requested_upload_path=$requested;requested_cxob_path=if($format -ceq 'cxob'){$requested}else{$null};associated_assets=@();external_assets_included=$false;native_upload_tool='Weintek Utility Manager';native_upload_performed=$false;device_transfer_verified=$false;next_action='accept_upload';next_tool='weinview_field_handoff';after_accept_tool='weinview_project_recover';created_utc=[DateTime]::UtcNow.ToString('o')}
  $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
  return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);status='awaiting_native_upload';target_hmi=$targetId;upload_format=$format;requested_upload_path=$requested;requested_cxob_path=$manifest.requested_cxob_path;associated_assets=@();external_assets_included=$false;native_upload_performed=$false;device_transfer_verified=$false;next_action='accept_upload';next_tool='weinview_field_handoff';after_accept_tool='weinview_project_recover'}
 }
 if($action -ceq 'accept_upload'){
  if($Arguments.uploaded_cxob_path -and $Arguments.uploaded_exob_path){throw 'One original uploaded project format required.'}
  $format=if($Arguments.uploaded_exob_path){'exob'}else{'cxob'}
  $source=Assert-WeinviewHandoffPath ([string]$(if($format -ceq 'exob'){$Arguments.uploaded_exob_path}else{$Arguments.uploaded_cxob_path})) $true
  if([IO.Path]::GetExtension($source) -ine ('.'+$format) -or (Get-Item -LiteralPath $source).Length -le 0){throw 'Nonempty uploaded original project required.'}
  $expected=[string]$Arguments.expected_uploaded_sha256
  if($expected -cnotmatch '^[0-9A-Fa-f]{64}$' -or (Get-WeinviewHandoffHash $source) -ine $expected){throw 'Uploaded CXOB SHA256 differs.'}
  $targetId=[string]$Arguments.target_hmi
  if(!$targetId -or $targetId.Length -gt 128 -or $targetId -match '[\x00-\x1f]'){throw 'Target HMI identifier required.'}
  [IO.Directory]::CreateDirectory($output)|Out-Null
 $copied=Join-Path $output ('uploaded.'+$format);[IO.File]::Copy($source,$copied,$false)
 if((Get-WeinviewHandoffHash $copied) -ine $expected){throw 'Uploaded CXOB copy differs.'}
  $assets=@(Copy-WeinviewHandoffAssociatedAssets $Arguments.associated_assets $output)
  $native=$Arguments.native_upload_receipt
  if($native){
   if($format -cne 'cxob'){throw 'Current native upload receipt supports CXOB only.'}
   if($native.kind -cne 'weinview-owned-native-upload' -or $native.state -cne 'completed' -or $native.cxob_path -ine $source -or $native.cxob_sha256 -ine $expected -or $native.target_ip -cne $targetId){throw 'Native upload receipt does not bind uploaded CXOB and target.'}
  }
  $claim=if($native){'native_upload_receipt'}else{'external_user_supplied'}
  $manifest=[ordered]@{schema=1;action=$action;target_hmi=$targetId;upload_format=$format;uploaded_project_path=$copied;uploaded_project_sha256=$expected.ToUpperInvariant();uploaded_cxob_path=if($format -ceq 'cxob'){$copied}else{$null};uploaded_cxob_sha256=if($format -ceq 'cxob'){$expected.ToUpperInvariant()}else{$null};uploaded_exob_path=if($format -ceq 'exob'){$copied}else{$null};uploaded_exob_sha256=if($format -ceq 'exob'){$expected.ToUpperInvariant()}else{$null};source_path=$source;source_sha256=$expected.ToUpperInvariant();original_vendor_upload_claim=$claim;native_upload_receipt=$native;associated_assets=$assets;external_assets_included=($assets.Count -gt 0);device_transfer_verified=$false;next_tool='weinview_project_recover';created_utc=[DateTime]::UtcNow.ToString('o')}
  $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
  return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);uploaded_project_path=$copied;uploaded_project_sha256=$expected.ToUpperInvariant();uploaded_cxob_path=$manifest.uploaded_cxob_path;uploaded_cxob_sha256=$manifest.uploaded_cxob_sha256;uploaded_exob_path=$manifest.uploaded_exob_path;uploaded_exob_sha256=$manifest.uploaded_exob_sha256;associated_assets=$assets;external_assets_included=($assets.Count -gt 0);next_tool='weinview_project_recover';device_transfer_verified=$false}
 }
 if($action -ceq 'prepare_cxob'){
  $artifact=Assert-WeinviewHandoffPath ([string]$Arguments.cxob_path) $true
  $expected=[string]$Arguments.expected_cxob_sha256
  if([IO.Path]::GetExtension($artifact) -ine '.cxob' -or (Get-Item -LiteralPath $artifact).Length -le 0 -or $expected -cnotmatch '^[0-9A-Fa-f]{64}$' -or (Get-WeinviewHandoffHash $artifact) -ine $expected){throw 'Existing nonempty CXOB with matching SHA256 required.'}
  [IO.Directory]::CreateDirectory($output)|Out-Null
  $copy=Join-Path $output 'download.cxob';[IO.File]::Copy($artifact,$copy,$false)
  if((Get-WeinviewHandoffHash $copy) -ine $expected){throw 'Copied CXOB SHA256 differs.'}
  $assets=@(Copy-WeinviewHandoffAssociatedAssets $Arguments.associated_assets $output)
  $manifest=[ordered]@{schema=1;action=$action;source_path=$artifact;source_sha256=$expected.ToUpperInvariant();cxob_path=$copy;cxob_sha256=$expected.ToUpperInvariant();cxob_bytes=(Get-Item -LiteralPath $copy).Length;associated_assets=$assets;external_assets_included=($assets.Count -gt 0);device_transfer_verified=$false;created_utc=[DateTime]::UtcNow.ToString('o')}
  $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
  return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);cxob_path=$copy;cxob_sha256=$expected.ToUpperInvariant();associated_assets=$assets;external_assets_included=($assets.Count -gt 0);device_transfer_verified=$false}
 }
 $receipt=Assert-WeinviewHandoffPath ([string]$Arguments.compile_provenance_path) $true
 $receiptHash=[string]$Arguments.expected_compile_provenance_sha256
 if($receiptHash -cnotmatch '^[0-9A-Fa-f]{64}$' -or (Get-WeinviewHandoffHash $receipt) -ine $receiptHash){throw 'Compile provenance SHA256 differs.'}
 $record=[IO.File]::ReadAllText($receipt,(New-Object Text.UTF8Encoding($false,$true)))|ConvertFrom-Json
 if($record.schema -ne 1 -or $record.kind -cne 'weinview-owned-whole-compile' -or $record.compile_scope -cne 'whole_project' -or !$record.normal_main_exit_verified -or $record.error_count -ne 0){throw 'Successful closed native whole-compile provenance required.'}
 $project=Assert-WeinviewHandoffPath ([string]$record.project_path) $true
 $artifact=Assert-WeinviewHandoffPath ([string]$record.artifact_path) $true
 $projectFormat=[IO.Path]::GetExtension($project)
 $artifactFormat=if($projectFormat -ieq '.cmtp'){'cxob'}elseif($projectFormat -ieq '.emtp'){'exob'}else{$null}
 if(!$artifactFormat -or $artifact -ine [IO.Path]::ChangeExtension($project,('.'+$artifactFormat)) -or $record.project_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$' -or $record.artifact_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Bound CMTP/CXOB or EMTP/EXOB provenance required.'}
 if((Get-WeinviewHandoffHash $project) -ine $record.project_sha256 -or (Get-WeinviewHandoffHash $artifact) -ine $record.artifact_sha256 -or (Get-Item -LiteralPath $artifact).Length -ne [long]$record.artifact_bytes){throw 'Compiled project or artifact changed.'}
 $files=@((Get-Item -LiteralPath $project -Force),(Get-Item -LiteralPath $artifact -Force))
 foreach($entry in $files){if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Bound source reparse file refused.'}}
 [IO.Directory]::CreateDirectory($output)|Out-Null
 $projectCopy=Join-Path $output 'project';[IO.Directory]::CreateDirectory($projectCopy)|Out-Null
 $manifestFiles=New-Object 'Collections.Generic.List[object]'
 foreach($entry in $files){
  $relative=$entry.Name
  $destination=Join-Path $projectCopy $relative
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination))|Out-Null
  $sourceHash=Get-WeinviewHandoffHash $entry.FullName
  [IO.File]::Copy($entry.FullName,$destination,$false)
  if((Get-WeinviewHandoffHash $destination) -cne $sourceHash){throw 'Handoff copy SHA256 differs.'}
  $manifestFiles.Add(@{relative_path=$relative;sha256=$sourceHash;bytes=$entry.Length})
 }
 $artifactCopy=Join-Path $projectCopy ([IO.Path]::GetFileName($artifact))
 if((Get-WeinviewHandoffHash $artifactCopy) -ine $record.artifact_sha256){throw 'Copied compiled artifact differs.'}
 $assets=@(Copy-WeinviewHandoffAssociatedAssets $Arguments.associated_assets $output)
 $artifactSha=([string]$record.artifact_sha256).ToUpperInvariant()
 $scope='bound_project_and_artifact_with_explicit_assets'
 $manifest=[ordered]@{schema=1;action=$action;scope=$scope;model=([string]$Arguments.model);project_path=(Join-Path $projectCopy ([IO.Path]::GetFileName($project)));project_sha256=([string]$record.project_sha256).ToUpperInvariant();artifact_path=$artifactCopy;artifact_sha256=$artifactSha;artifact_format=$artifactFormat;cxob_path=if($artifactFormat -ceq 'cxob'){$artifactCopy}else{$null};cxob_sha256=if($artifactFormat -ceq 'cxob'){$artifactSha}else{$null};exob_path=if($artifactFormat -ceq 'exob'){$artifactCopy}else{$null};exob_sha256=if($artifactFormat -ceq 'exob'){$artifactSha}else{$null};compile_provenance_path=$receipt;compile_provenance_sha256=$receiptHash.ToUpperInvariant();files=@($manifestFiles.ToArray());associated_assets=$assets;external_assets_included=($assets.Count -gt 0);native_download_tool='Weintek Utility Manager or EasyDownload';native_build_performed=$false;device_transfer_verified=$false;created_utc=[DateTime]::UtcNow.ToString('o')}
 $manifestPath=Join-Path $output 'handoff.json';Write-WeinviewHandoffJson $manifestPath $manifest
 return @{manifest_path=$manifestPath;manifest_sha256=(Get-WeinviewHandoffHash $manifestPath);scope=$scope;project_path=$manifest.project_path;artifact_path=$artifactCopy;artifact_sha256=$artifactSha;artifact_format=$artifactFormat;cxob_path=$manifest.cxob_path;cxob_sha256=$manifest.cxob_sha256;exob_path=$manifest.exob_path;exob_sha256=$manifest.exob_sha256;files=$files.Count;associated_assets=$assets;external_assets_included=($assets.Count -gt 0);native_build_performed=$false;device_transfer_verified=$false}
}
