# Offline writer for the finite FLBX-v3/ASCII/PNG-v1 profile observed in CN421.
# The caller supplies existing workspace PNGs. No vendor process or project is opened.
function Invoke-WeinviewPictureLibraryCreate($Arguments) {
 if($null -eq $Arguments -or $Arguments -isnot [pscustomobject]){throw 'Typed picture library arguments required.'}
 $required=@('workspace_root','output_path','pictures')
 if(@($required|Where-Object {$_ -cnotin $Arguments.PSObject.Properties.Name}).Count -or
    @($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $required}).Count){throw 'Exact picture library arguments required.'}
 if($Arguments.workspace_root -isnot [string] -or $Arguments.output_path -isnot [string]){throw 'Picture library paths must be strings.'}
 $root=Workspace $Arguments.workspace_root
 $output=Under $Arguments.output_path $root
 if([IO.Path]::GetExtension($output) -ine '.flbx'){throw 'Fresh .flbx output required.'}
 if(Test-Path -LiteralPath $output){throw 'Picture library output already exists.'}
 if(!(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($output)) -PathType Container)){throw 'Existing workspace output parent required.'}
 if($Arguments.pictures -isnot [array] -or $Arguments.pictures.Count -lt 1 -or $Arguments.pictures.Count -gt 32){throw 'One to 32 pictures required.'}
 if(-not ('PLCCode.Weinview.PictureLibraryCodec' -as [type])){
  Add-Type -Path (Join-Path $PSScriptRoot 'PictureLibraryCodec.cs') -ReferencedAssemblies 'System.Drawing' -ErrorAction Stop
 }
 $pictures=New-Object 'Collections.Generic.List[PLCCode.Weinview.PictureLibraryPicture]'
 $total=0L
 foreach($picture in $Arguments.pictures){
  if($picture -isnot [pscustomobject] -or
     @($picture.PSObject.Properties.Name|Where-Object {$_ -cnotin @('name','states')}).Count -or
     @(@('name','states')|Where-Object {$_ -cnotin $picture.PSObject.Properties.Name}).Count){throw 'Exact picture name/states required.'}
  if($picture.name -isnot [string] -or $picture.states -isnot [array] -or $picture.states.Count -lt 1 -or $picture.states.Count -gt 16){throw 'Picture name and one to 16 states required.'}
  $states=New-Object 'Collections.Generic.List[PLCCode.Weinview.PictureLibraryState]'
  foreach($state in $picture.states){
   if($state -isnot [pscustomobject] -or
      @($state.PSObject.Properties.Name|Where-Object {$_ -cnotin @('path','expected_sha256')}).Count -or
      @(@('path','expected_sha256')|Where-Object {$_ -cnotin $state.PSObject.Properties.Name}).Count){throw 'Exact state path/expected_sha256 required.'}
   if($state.path -isnot [string] -or $state.expected_sha256 -isnot [string] -or $state.expected_sha256 -cnotmatch '^[A-Fa-f0-9]{64}$'){throw 'Existing PNG path and SHA256 required.'}
   $path=Under $state.path $root
   if([IO.Path]::GetExtension($path) -ine '.png' -or !(Test-Path -LiteralPath $path -PathType Leaf)){throw 'Existing workspace PNG required.'}
   $length=(Get-Item -LiteralPath $path -Force).Length
   if($length -lt 67 -or $length -gt 5MB){throw 'PNG resource byte bound exceeded.'}
   $total+=$length
   if($total -gt 32MB){throw 'Total PNG resource bound exceeded.'}
   $bytes=[IO.File]::ReadAllBytes($path)
   if($bytes.Length -ne $length){throw 'PNG size changed during read.'}
   $item=New-Object PLCCode.Weinview.PictureLibraryState
   $item.path=$path;$item.expected_sha256=$state.expected_sha256.ToUpperInvariant();$item.png=$bytes
   $states.Add($item)
  }
  $entry=New-Object PLCCode.Weinview.PictureLibraryPicture
  $entry.name=$picture.name;$entry.states=$states.ToArray();$pictures.Add($entry)
 }
 $payload=[PLCCode.Weinview.PictureLibraryCodec]::Build($pictures.ToArray())
 # CreateNew is the final overwrite guard, including races after preflight.
 $stream=[IO.FileStream]::new($output,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
 try{$stream.Write($payload,0,$payload.Length);$stream.Flush($true)}
 catch{$stream.Dispose();[IO.File]::Delete($output);throw}
 finally{$stream.Dispose()}
 $onDisk=[IO.File]::ReadAllBytes($output)
 $digest=[PLCCode.Weinview.PictureLibraryCodec]::Sha256($payload)
 if($onDisk.Length -ne $payload.Length -or [PLCCode.Weinview.PictureLibraryCodec]::Sha256($onDisk) -cne $digest){throw 'Written picture library readback differs.'}
 $manifest=@();for($i=0;$i -lt $pictures.Count;$i++){
  $resource=$pictures[$i];$states=@()
  for($j=0;$j -lt $resource.states.Length;$j++){
   $s=$resource.states[$j]
   $states+=@{index=$j;input_path=$s.path;input_sha256=$s.sha256;png_bytes=$s.png.Length;payload_length=$s.png.Length;width=$s.width;height=$s.height;payload_offset=$s.offset}
  }
  $manifest+=@{index=$i;name=$resource.name;states=$states}
 }
 return @{profile='FLBX-v3-ASCII-PNG-v1';output_path=$output;output_bytes=$payload.Length;output_sha256=$digest;bytes=$payload.Length;sha256=$digest;
          picture_count=$pictures.Count;png_total_bytes=$total;pictures=$manifest;
          own_processes=@();native_project_modified=$false;objects_bound=$false;native_acceptance_verified=$false;native_acceptance_verified_for_this_file=$false;
          profile_evidence='cMT3071 / EBPro CN6.10.02.421: one generated two-state PNG library imported, saved and reopened';
          limits=@{max_pictures=32;max_states_per_picture=16;max_png_bytes=5MB;max_total_png_bytes=32MB;max_width=4096;max_height=4096;max_pixels=16777216}}
}
