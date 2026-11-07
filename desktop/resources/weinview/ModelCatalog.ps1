# Native CN421 model evidence is shared by the worker, Rust validator and desktop.
function Get-WeinviewModelCatalog($Installation) {
 $path=Join-Path $PSScriptRoot 'model_catalog.cn421.json'
 if(!(Test-Path -LiteralPath $path -PathType Leaf) -or (Get-Item -LiteralPath $path).Length -gt 65536 -or (Hash $path) -cne 'A012694C0D943DE78493F16E0288A3CBFE3CAB10B5A67DD3C23CF577B78D0D77'){throw 'Original native model catalog integrity mismatch'}
 $catalog=Get-Content -LiteralPath $path -Raw -Encoding UTF8|ConvertFrom-Json
 if($catalog.schema -ne 1 -or $catalog.profile -cne 'weinview-cn421-model-catalog-v1' -or $catalog.models.Count -ne 69 -or $catalog.vendor_configuration_count -ne 71 -or $catalog.series_count -ne 11){throw 'Complete native model catalog required'}
 if($Installation){
  if(!$Installation.profile_421 -or $Installation.signature_status -cne 'Valid' -or $Installation.sha256 -cne $catalog.exe_sha256){throw 'Signed original model serializer version required'}
  $config=SafePath (Join-Path ([IO.Path]::GetDirectoryName($Installation.exe_path)) 'Config.xml')
  if((Hash $config) -cne $catalog.config_sha256){throw 'Original model configuration changed; profile audit required'}
 }
 return $catalog
}
function Get-WeinviewInstalledModelCatalog($Installations) {
 $known=$null;try{$known=Get-WeinviewModelCatalog}catch{}
 $entries=New-Object 'Collections.Generic.List[object]'
 $models=New-Object 'Collections.Generic.List[object]'
 $configurationCount=0
 foreach($installation in @($Installations)){
  $exe=SafePath ([string]$installation.exe_path)
  $config=SafePath (Join-Path ([IO.Path]::GetDirectoryName($exe)) 'Config.xml')
  $signed=($installation.signature_status -ceq 'Valid' -and [string]$installation.signer -match '(?i)WEINTEK')
  if(!(Test-Path -LiteralPath $config -PathType Leaf)){$entries.Add([pscustomobject]@{exe_path=$exe;version=$installation.version;catalog_available=$false;catalog_reason='Config.xml absent';model_count=0;known_serializer=$false;native_editor_preflight_eligible=$false;specialized_421_profile_available=$false});continue}
  $xml=New-Object Xml.XmlDocument;$xml.XmlResolver=$null;$xml.Load($config)
  $seriesNodes=@($xml.SelectNodes('/Config/Machines/Series'))
  $knownSerializer=($null -ne $known -and $signed -and $installation.profile_421 -and (Hash $config) -ceq [string]$known.config_sha256)
  $templates=Join-Path ([IO.Path]::GetDirectoryName($exe)) 'project'
  $count=0
  foreach($series in $seriesNodes){
   $seriesName=[string]$series.GetAttribute('name');$category=[string]$series.GetAttribute('category')
   foreach($model in @($series.SelectNodes('./Model'))){
    $name=[string]$model.GetAttribute('name');$id=[string]$model.GetAttribute('id')
    if(!$name -or !$id){continue}
    $exact=@();$match=@();if($known){$exact=@($known.models|Where-Object {$_.name -ceq $name -and $_.series -ceq $seriesName});$match=$exact;if($match.Count -eq 0){$match=@($known.models|Where-Object {$_.series -ceq $seriesName -and @($_.vendor_ids) -ccontains $id})}}
    $profile=if($match.Count -eq 1){$match[0]}else{$null}
    $format=if($profile){[string]$profile.format}elseif($category -cin @('TK','iP','iE','eMT','XE')){'emtp'}elseif($category -cmatch '^(cMT|Gateway|mTV)'){'cmtp'}else{$null}
    $bootstrap=if(Test-Path -LiteralPath $templates -PathType Container){if($format){@(Get-ChildItem -LiteralPath $templates -File -Filter ('template_*.'+$format) -ErrorAction SilentlyContinue).Count -gt 0}else{@(Get-ChildItem -LiteralPath $templates -File -Filter 'template_*.emtp' -ErrorAction SilentlyContinue).Count -gt 0 -or @(Get-ChildItem -LiteralPath $templates -File -Filter 'template_*.cmtp' -ErrorAction SilentlyContinue).Count -gt 0}}else{$false}
    $identity=$seriesName+[char]0+$id+[char]0+$name;$bytes=[Text.Encoding]::UTF8.GetBytes($identity);$sha=[Security.Cryptography.SHA256]::Create();try{$suffix=([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').Substring(0,16).ToLowerInvariant()}finally{$sha.Dispose()}
    $models.Add([pscustomobject]@{installation_exe_path=$exe;installation_version=$installation.version;series=$seriesName;category=$category;name=$name;picker_group=if($profile){$profile.group}else{$name};vendor_id=$id;framework_version=[string]$series.GetAttribute('framework_version');key=if($exact.Count -eq 1){$exact[0].key}else{'wv-installed-'+$suffix};format=$format;width=if($profile){$profile.width}else{$null};height=if($profile){$profile.height}else{$null};has_display=if($profile){$profile.has_display}else{($category -cne 'Gateway')};read_catalog_available=$true;create_project_supported=($signed -and $bootstrap);serializer_profile=if($exact.Count -eq 1){'cn421-reference-native-dialog'}else{'installed-config-native-dialog'};native_dialog_confirmation_required=$true})
    $count++
   }
  }
  if($known){
   foreach($legacy in @($known.models)){
    if(@($models|Where-Object {$_.installation_exe_path -ceq $exe -and $_.key -ceq $legacy.key}).Count){continue}
    $aliases=@($models|Where-Object {$_.installation_exe_path -ceq $exe -and $_.series -ceq $legacy.series -and @($legacy.vendor_ids) -ccontains $_.vendor_id})
    if(!$aliases.Count){continue}
    $row=$aliases[0]
    $models.Add([pscustomobject]@{installation_exe_path=$exe;installation_version=$installation.version;series=$row.series;category=$row.category;name=$legacy.name;picker_group=$legacy.group;vendor_id=$row.vendor_id;framework_version=$row.framework_version;key=$legacy.key;format=$legacy.format;width=$legacy.width;height=$legacy.height;has_display=$legacy.has_display;read_catalog_available=$true;configuration_row=$false;create_project_supported=$row.create_project_supported;serializer_profile='cn421-reference-native-dialog';native_dialog_confirmation_required=$true})
   }
  }
  $configurationCount+=$count
  $entries.Add([pscustomobject]@{exe_path=$exe;version=$installation.version;catalog_available=$true;catalog_path=$config;catalog_sha256=(Hash $config);series_count=$seriesNodes.Count;model_count=$count;known_serializer=$knownSerializer;create_project_supported=($signed -and @($models|Where-Object {$_.installation_exe_path -ceq $exe -and $_.create_project_supported}).Count -gt 0);native_editor_preflight_eligible=$signed;specialized_421_profile_available=$knownSerializer})
 }
 return [pscustomobject]@{profile='weinview-installed-model-catalog-v1';installations=@($entries.ToArray());models=@($models.ToArray());vendor_configuration_count=$configurationCount;series_count=@($models|ForEach-Object {$_.installation_exe_path+'|'+$_.series}|Select-Object -Unique).Count}
}
function Get-WeinviewModelProfile($Installation,[string]$Key) {
 $catalog=Get-WeinviewInstalledModelCatalog @($Installation)
 $rows=@($catalog.models|Where-Object {$_.key -ceq $Key -and $_.create_project_supported})
 if(!$rows.Count){throw 'Choose a creatable model_key from this installation in weinview_discover.models'}
 $known=$null;try{$known=@((Get-WeinviewModelCatalog).models|Where-Object {$_.key -ceq $Key})}catch{}
 if($rows.Count -ne 1){throw 'Installed model_key is ambiguous in the selected Config.xml'}
 $row=$rows[0]
 if(@($known).Count -eq 1 -and $known[0].name -ceq $row.name -and $known[0].series -ceq $row.series){return $known[0]}
 return [pscustomobject]@{key=$row.key;name=$row.name;group=$row.picker_group;series=$row.series;category=$row.category;format=$row.format;width=$row.width;height=$row.height;has_display=$row.has_display;template=$null;template_sha256=$null;custom_resolution=$false;installed_catalog_model=$true}
}
function Test-WeinviewOriginalModelLabel([string]$Label,[string]$ExePath){
 $actual=$Label -replace '\s',''
 $foundModels=@()
 $exe=SafePath $ExePath;$sig=Get-AuthenticodeSignature -LiteralPath $exe
 if($sig.Status -cne 'Valid' -or [string]$sig.SignerCertificate.Subject -notmatch '(?i)WEINTEK'){return $false}
 $installation=[pscustomobject]@{exe_path=$exe;version=([Diagnostics.FileVersionInfo]::GetVersionInfo($exe)).FileVersion;signature_status='Valid';signer=[string]$sig.SignerCertificate.Subject;profile_421=$false}
 foreach($model in (Get-WeinviewInstalledModelCatalog @($installation)).models){
  if($model.PSObject.Properties.Name -contains 'configuration_row' -and $model.configuration_row -eq $false){continue}
  $name=[string]$model.name -replace '\s',''
  if(!$model.has_display){if($actual -ceq $name){$foundModels+=,$model};continue}
  if($actual -cnotmatch ('^'+[regex]::Escape($name)+'\(([1-9][0-9]{0,4})x([1-9][0-9]{0,4})\)$')){continue}
  $width=[int]$Matches[1];$height=[int]$Matches[2]
  if($width -gt 8192 -or $height -gt 8192){continue}
  if(($null -eq $model.width -or $null -eq $model.height) -or ($width -eq [int]$model.width -and $height -eq [int]$model.height) -or
     ($width -eq [int]$model.height -and $height -eq [int]$model.width) -or
     $model.custom_resolution){$foundModels+=,$model}
 }
 return ($foundModels.Count -eq 1)
}
