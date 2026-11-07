# Current CN421 native picture exchange. The caller owns the project copy,
# vendor session, save, reopen, compile and final delivery record.
# Requires ScreenWorkflow.ps1, NativeObjectRead.ps1, NativePropertyCandidate.cs,
# NativeControls.cs and NativeResourceReuseControls.cs in the caller's session.
function Get-WeinviewResourceSha256([string]$Path) {
 if(!(Test-Path -LiteralPath $Path -PathType Leaf)){throw 'Existing resource file required.'}
 return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToUpperInvariant()
}
function Get-WeinviewVisiblePictureCards($Session,$Manager) {
 $numbers=@($Session.native.EnumChildControls($Manager.Hwnd)|Where-Object {$_.Id -eq 2778 -and $_.Class -ceq 'Button' -and $_.Visible -and $_.Title -cmatch '^[0-9]+$'})
 $cards=@();$seen=New-Object 'Collections.Generic.HashSet[int]'
 foreach($number in $numbers){
  $index=[int]$number.Title
  if(!$seen.Add($index)){throw 'Duplicate visible native picture index.'}
  $parent=[PLC Engineering Suite.Weinview.NativeResourceReuseControls]::TileParent($Manager.Hwnd,$number.Hwnd)
  $name=$Session.native.FindUniqueControlWithoutLabel($parent,2776,'Static')
  $states=$Session.native.FindUniqueControlWithoutLabel($parent,2775,'Static')
  $refs=$Session.native.FindUniqueControlWithoutLabel($parent,2779,'Static')
  $cards+=@{index=$index;parent=$parent;name=$Session.native.GetControlText($name.Hwnd,4096);states=$Session.native.GetControlText($states.Hwnd,4096);references=$Session.native.GetControlText($refs.Hwnd,4096)}
 }
 return @($cards|Sort-Object index)
}
function Get-WeinviewSelectedProjectPictureCard($Session,$Manager) {
 $cards=@(Get-WeinviewVisiblePictureCards $Session $Manager)
 # CN421 CCellDlg exposes generic MSAA children, without selected-item state.
 # The cards are identified by HWND/control IDs above. Read their native
 # selection border; do not traverse the blocking generic accessibility tree.
 $selected=@($cards|Where-Object {[PLC Engineering Suite.Weinview.NativeResourceReuseControls]::IsPictureTileSelected($Manager.Hwnd,[long]$_.parent,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)})
 if($selected.Count -ne 1){throw 'Exactly one native project picture card must have the selected border.'}
 return $selected[0]
}
function Select-WeinviewProjectPictureCard($Session,$Manager,[int]$ProjectPictureIndex,[string]$PictureName,[int]$StateCount) {
 $cards=@(Get-WeinviewVisiblePictureCards $Session $Manager)
 $target=@($cards|Where-Object {$_.index -eq $ProjectPictureIndex -and $_.name -ceq $PictureName -and $_.states -ceq ('状态数 : '+$StateCount)})
 if($target.Count -ne 1){throw 'Requested existing project picture card is not uniquely visible.'}
 $selected=Get-WeinviewSelectedProjectPictureCard $Session $Manager
 if($selected.index -ne $target[0].index){
  [PLC Engineering Suite.Weinview.NativeResourceReuseControls]::SelectPictureTileOnce($Manager.Hwnd,[long]$target[0].parent,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
  $selected=WaitFor {try{$current=Get-WeinviewSelectedProjectPictureCard $Session $Manager;if($current.index -eq $ProjectPictureIndex){return $current}}catch{} } 6
 }
 if($selected.index -ne $ProjectPictureIndex -or $selected.name -cne $PictureName -or $selected.states -cne ('状态数 : '+$StateCount)){throw 'Native project picture selection differs after exact tile action.'}
 return $selected
}
function Wait-WeinviewResourceDialog($Session,[long[]]$Excluded,[string]$Title,[int]$Seconds=6) {
 return (WaitFor {
  $all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -notin $Excluded})
  if(@($all|Where-Object {$_.Title -cne $Title}).Count -or $all.Count -gt 1){throw 'Unexpected native resource modal; no acknowledgement.'}
  if($all.Count -eq 1){return $all[0]}
 } $Seconds)
}
function Invoke-WeinviewNativePictureLibrarySelection($Session,[long]$DialogHwnd,$Arguments,[string]$ExpectedProjectSha256,[int]$LibraryButtonId,[bool]$LibraryAlreadyImported=$false,[int]$KnownProjectPictureIndex=-1,[int]$KnownStateCount=0) {
 if($LibraryButtonId -notin @(1094,1207) -or $DialogHwnd -le 0){throw 'Observed native picture library entry required.'}
 if($Arguments.picture_name -isnot [string] -or $Arguments.picture_name -cnotmatch '^[\x20-\x7e]{1,64}$'){throw 'Native picture name required.'}
 $library=[IO.Path]::GetFullPath([string]$Arguments.library_path)
 if([IO.Path]::GetExtension($library) -ine '.flbx'){throw 'FLBX picture library required.'}
 $librarySha=Get-WeinviewResourceSha256 $library
 if($Arguments.expected_library_sha256 -and ($Arguments.expected_library_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$' -or $librarySha -cne $Arguments.expected_library_sha256.ToUpperInvariant())){throw 'Pinned FLBX library differs.'}
 if((Get-WeinviewResourceSha256 ([string]$Session.project_path)) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Project bytes changed before picture library selection.'}
 if($null -ne $Arguments.picture_index -and ($Arguments.picture_index -isnot [int] -or $Arguments.picture_index -lt 0 -or $Arguments.picture_index -gt 31)){throw 'Bounded picture index required.'}
 if($null -ne $Arguments.expected_states -and ($Arguments.expected_states -isnot [int] -or $Arguments.expected_states -lt 1 -or $Arguments.expected_states -gt 16)){throw 'Bounded picture state count required.'}
 $inspector=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
 $manager=$null;$fileDialog=$null
 try{
  $Session.native.ClickButton($DialogHwnd,$LibraryButtonId,'图库...')
  $manager=Wait-WeinviewResourceDialog $Session @($DialogHwnd) '图片管理'
  $tabs=$Session.native.FindUniqueControlWithoutLabel($manager.Hwnd,2770,'SysTabControl32')
  # The native library copy command also selects an existing deduplicated
  # resource. Use that command for cached resources; no tile pointer input.
  $inspector.SelectTabExact($tabs.Hwnd,'图库')
  # Each reopened manager can reset to the default library. A session cache
  # proves prior import, not the current native selection. Opening the exact
  # path also selects an already loaded library without duplicating resources.
  # Do this once per manager, before matching picture names and indexes.
   $add=$Session.native.FindUniqueControlWithoutLabel($manager.Hwnd,2773,'Button')
   [PLC Engineering Suite.Weinview.NativeResourceReuseControls]::AddLibraryOnce($manager.Hwnd,$add.Hwnd,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
   $fileDialog=Wait-WeinviewResourceDialog $Session @($DialogHwnd,$manager.Hwnd) '打开'
   $filter=$Session.native.FindUniqueControlWithoutLabel($fileDialog.Hwnd,1136,'ComboBox')
   if($inspector.ComboSelected($filter.Hwnd) -cne 'picture library (*.flbx, *.flb)'){throw 'Native FLBX file chooser contract differs.'}
   $filename=$Session.native.FindUniqueControlWithoutLabel($fileDialog.Hwnd,1148,'Edit')
   $Session.native.SetControlText($filename.Hwnd,$library)
   if($Session.native.GetControlText($filename.Hwnd,4096) -cne $library -or (Get-WeinviewResourceSha256 $library) -cne $librarySha){throw 'Library changed before original file chooser acceptance.'}
   $Session.native.ClickButton($fileDialog.Hwnd,1,'打开(&O)')
   $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $fileDialog.Hwnd).Count){return $true}} 6
   $fileDialog=$null
   $other=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770' -and $_.Hwnd -notin @($DialogHwnd,$manager.Hwnd)})
   if($other.Count){throw 'Vendor did not accept FLBX without a notice; inspect current modal.'}
  $cards=@(Get-WeinviewVisiblePictureCards $Session $manager)
  $source=@($cards|Where-Object {$_.name -ceq $Arguments.picture_name -and ($null -eq $Arguments.picture_index -or $_.index -eq $Arguments.picture_index) -and ($null -eq $Arguments.expected_states -or $_.states -ceq ('状态数 : '+$Arguments.expected_states))})
  if($source.Count -ne 1){throw 'Requested imported FLBX picture/state card is not uniquely visible.'}
  $stateMatch=[regex]::Match([string]$source[0].states,'^状态数 : ([1-9][0-9]?)$');$stateCount=0
  if(!$stateMatch.Success -or ![int]::TryParse($stateMatch.Groups[1].Value,[ref]$stateCount) -or $stateCount -gt 16){throw 'Actual imported picture state count outside supported profile.'}
  $inspector.SelectTabExact($tabs.Hwnd,'工程文件')
  $projectBefore=@(Get-WeinviewVisiblePictureCards $Session $manager)
  $inspector.SelectTabExact($tabs.Hwnd,'图库')
  $copy=$Session.native.FindUniqueControlWithoutLabel($source[0].parent,2777,'Button')
  [PLC Engineering Suite.Weinview.NativeResourceReuseControls]::CopyPictureOnce($manager.Hwnd,$source[0].parent,$copy.Hwnd,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
  $inspector.SelectTabExact($tabs.Hwnd,'工程文件')
  $projectAfter=@(Get-WeinviewVisiblePictureCards $Session $manager)
  $new=@($projectAfter|Where-Object {$_.name -ceq $Arguments.picture_name -and $_.states -ceq ('状态数 : '+$stateCount) -and $_.references -ceq '元件 : 0' -and $_.index -notin @($projectBefore|ForEach-Object index)})
  $selected=Get-WeinviewSelectedProjectPictureCard $Session $manager
  $existingReused=$false;$created=$null
  if($new.Count -eq 1){
   if($selected.index -ne $new[0].index){throw 'New project picture did not become the actual selected card.'}
   $created=$new[0]
  }elseif($new.Count -eq 0){
   # EBPro deduplicates an already imported asset. Its copy action selects the
   # existing native project card, including when another page references it.
   # Only the visible page is enumerated before copying. The native command
   # can reveal an existing resource on another page of the project library.
   $existing=@($projectAfter|Where-Object {$_.index -eq $selected.index -and $_.name -ceq $Arguments.picture_name -and $_.states -ceq ('状态数 : '+$stateCount)})
   if($existing.Count -ne 1 -or $selected.name -cne $Arguments.picture_name -or $selected.states -cne ('状态数 : '+$stateCount)){throw 'Native picture copy did not select the requested new or existing resource.'}
   $existingReused=$true
  }else{throw 'Native picture copy produced ambiguous project resources.'}
  if($KnownProjectPictureIndex -ge 0 -and ($selected.index -ne $KnownProjectPictureIndex -or $stateCount -ne $KnownStateCount)){throw 'Native reused picture differs from the previously bound resource.'}
  $Session.native.ClickButton($manager.Hwnd,1,'确定')
  $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){return $true}} 6
  $manager=$null
  return @{library_path=$library;library_sha256=$librarySha;library_picture_index=[int]$source[0].index;picture_name=[string]$source[0].name;state_count=$stateCount;project_pictures_before_visible=$projectBefore;project_picture_created=$created;project_picture_index=[int]$selected.index;native_import_count=1;native_copy_count=1;existing_project_picture_reused=$existingReused}
 }finally{
  if($fileDialog -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $fileDialog.Hwnd).Count){$Session.native.ClickButton($fileDialog.Hwnd,2,'取消')}
  if($manager -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){
   $Session.native.ClickButton($manager.Hwnd,2,'取消')
   $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){return $true}} 6
  }
 }
}
function Invoke-WeinviewNativePictureApply($Session,$Arguments,[string]$ExpectedProjectSha256,[string]$EvidencePrefix) {
 if($null -eq $Arguments -or $Arguments -isnot [pscustomobject]){throw 'Typed native picture arguments required.'}
 $required=@('library_path','expected_library_sha256','picture_name','picture_index','expected_states','window_number','object_id','expected_object_sha256')
 if(@($required|Where-Object {$_ -cnotin $Arguments.PSObject.Properties.Name}).Count -or @($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $required}).Count){throw 'Exact native picture arguments required.'}
 if($Arguments.library_path -isnot [string] -or $Arguments.picture_name -isnot [string] -or $Arguments.object_id -isnot [string] -or $Arguments.expected_library_sha256 -cnotmatch '^[0-9a-fA-F]{64}$' -or $Arguments.expected_object_sha256 -cnotmatch '^[0-9a-fA-F]{64}$' -or $ExpectedProjectSha256 -cnotmatch '^[0-9a-fA-F]{64}$'){throw 'Pinned library, object and project hashes required.'}
 if($Arguments.picture_index -isnot [int] -or $Arguments.picture_index -lt 0 -or $Arguments.picture_index -gt 31 -or $Arguments.expected_states -isnot [int] -or $Arguments.expected_states -lt 1 -or $Arguments.expected_states -gt 16 -or $Arguments.window_number -isnot [int] -or $Arguments.window_number -lt 0 -or $Arguments.window_number -gt 65535){throw 'Bounded native picture/window indexes and states required.'}
 if($Arguments.picture_name -notmatch '^[\x20-\x7e]{1,64}$' -or $Arguments.object_id -notmatch '^[A-Z]{2}_[0-9]{1,5}$'){throw 'Native picture name or object identity outside observed profile.'}
 $project=[string]$Session.project_path
 $projectExtension=[IO.Path]::GetExtension($project)
 if($projectExtension -inotmatch '^\.(cmtp|emtp)$' -or ($projectExtension -ieq '.emtp' -and $Arguments.object_id -cnotmatch '^GP_[0-9]{1,5}$')){throw 'Native picture binding supports cMT objects or an existing MT .emtp GP Picture object.'}
 if(!$project -or [int]$Session.window_number -ne [int]$Arguments.window_number -or (Get-WeinviewResourceSha256 $project) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Selected project/window or current source hash differs.'}
 $library=[IO.Path]::GetFullPath($Arguments.library_path)
 if([IO.Path]::GetExtension($library) -ine '.flbx' -or (Get-WeinviewResourceSha256 $library) -cne $Arguments.expected_library_sha256.ToUpperInvariant()){throw 'Pinned FLBX library differs.'}
 if(-not ('PLC Engineering Suite.Weinview.NativeResourceReuseControls' -as [type]) -or -not ('PLC Engineering Suite.Weinview.Research.NativePropertyCandidate' -as [type])){throw 'Native picture controls are not loaded.'}
 $inspector=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
 $directory=Get-WeinviewWindowDirectory $Session
 $rows=@($directory.rows|Where-Object object_id -CEQ $Arguments.object_id)
 if($rows.Count -ne 1){throw 'Unique existing native object required for picture binding.'}
 $dialog=$null;$confirmed=$false;$pictureWasEnabled=$false
 try {
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $beforePath=$EvidencePrefix+'.object-before.json'
  $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $project -ExpectedSha256 $ExpectedProjectSha256 -DialogHwnd $dialog.Hwnd -OutputPath $beforePath
  $before=Get-Content -LiteralPath $beforePath -Raw -Encoding UTF8|ConvertFrom-Json
  if($before.status -cne 'success' -or (CanonicalObjectHash (CanonicalObject $Arguments.object_id $before.actual)) -cne $Arguments.expected_object_sha256.ToUpperInvariant()){throw 'Existing object business fields differ from caller snapshot.'}
  $beforeCanonical=CanonicalObject $Arguments.object_id $before.actual;$isPicture=($beforeCanonical.kind -ceq 'picture')
  if($projectExtension -ieq '.emtp' -and !$isPicture){throw 'MT .emtp picture replacement requires an actual native Picture object.'}
  # The existing object reader leaves the vendor dialog on its own final tab.
  # Reopen the same native object to obtain a fresh picture-page handle.
  Close-WeinviewScreenDialog $Session $dialog $false;$dialog=$null
  $directory=Get-WeinviewWindowDirectory $Session
  $rows=@($directory.rows|Where-Object object_id -CEQ $Arguments.object_id)
  if($rows.Count -ne 1){throw 'Original object disappeared before resource import.'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
  $tabNames=@($inspector.TabNames($tab.Hwnd))
  if('图片' -cnotin $tabNames){throw ('Native object picture page absent: '+($tabNames -join '|'))}
  $inspector.SelectTabExact($tab.Hwnd,'图片')
  if(!$isPicture){
   $usePicture=$Session.native.FindUniqueControl($dialog.Hwnd,1269,'Button','使用图片')
   $pictureState=$Session.native.GetCheckboxState($usePicture.Hwnd)
   if($pictureState -notin @(0,1)){throw 'Actual native picture checkbox state required.'}
   $pictureWasEnabled=($pictureState -eq 1)
   if(!$pictureWasEnabled){
    $Session.native.ClickButton($dialog.Hwnd,1269,'使用图片')
    if($Session.native.GetCheckboxState($usePicture.Hwnd) -ne 1){throw 'Requested native picture setting did not become enabled.'}
   }
  }
  $selected=Invoke-WeinviewNativePictureLibrarySelection $Session ([long]$dialog.Hwnd) $Arguments $ExpectedProjectSha256 $(if($isPicture){1094}else{1207})
  if($isPicture){
   $rect=@($beforeCanonical.rectangle)
   $null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -IdentityPath $Session.identity_path -ProjectPath $project -DialogHwnd $dialog.Hwnd -CanvasWidth ([int]$Session.window_width) -CanvasHeight ([int]$Session.window_height) -X ([int]$rect[0]) -Y ([int]$rect[1]) -Width ([int]$rect[2]) -Height ([int]$rect[3])
  }
  $afterPath=$EvidencePrefix+'.object-after.json'
  $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $project -ExpectedSha256 $ExpectedProjectSha256 -DialogHwnd $dialog.Hwnd -OutputPath $afterPath
  $after=Get-Content -LiteralPath $afterPath -Raw -Encoding UTF8|ConvertFrom-Json
  if($after.status -cne 'success'){throw 'Native object unreadable after picture binding.'}
  $afterCanonical=CanonicalObject $Arguments.object_id $after.actual;$afterHash=CanonicalObjectHash $afterCanonical
  if($isPicture){
   if($afterCanonical.kind -cne 'picture' -or (@($afterCanonical.rectangle) -join ',') -cne (@($beforeCanonical.rectangle) -join ',') -or $afterCanonical.project_picture_index -ne $selected.project_picture_index -or $afterCanonical.picture_name -cne $selected.picture_name -or $afterCanonical.state_count -ne $selected.state_count){throw 'Picture layout or selected native resource differs after binding.'}
  }elseif($afterHash -cne $Arguments.expected_object_sha256.ToUpperInvariant()){throw 'Original object action/address/text fields changed during picture binding.'}
  if(!$isPicture){$inspector.SelectTabExact($tab.Hwnd,'图片');if($Session.native.GetCheckboxState($usePicture.Hwnd) -ne 1){throw 'Native picture setting differs after library binding.'}}
  Close-WeinviewScreenDialog $Session $dialog $true;$dialog=$null;$confirmed=$true
  if((Get-WeinviewResourceSha256 $project) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Project saved before caller-owned save boundary.'}
  $profile=if($projectExtension -ieq '.emtp'){'MT-CN421-FLBX-native-picture-v1'}else{'cMT3071-CN421-FLBX-native-object-v1'}
  return @{profile=$profile;library_path=$library;library_sha256=$Arguments.expected_library_sha256.ToUpperInvariant();picture_name=$Arguments.picture_name;library_picture_index=[int]$Arguments.picture_index;project_picture_index=[int]$selected.project_picture_index;state_count=[int]$Arguments.expected_states;window_number=[int]$Arguments.window_number;object_id=$Arguments.object_id;object_business_sha256=$Arguments.expected_object_sha256.ToUpperInvariant();object_after_sha256=$afterHash;object_before_evidence=$beforePath;object_after_evidence=$afterPath;project_pictures_before_visible=$selected.project_pictures_before_visible;project_picture_created=$selected.project_picture_created;picture_was_enabled=if($isPicture){$null}else{$pictureWasEnabled};picture_enabled_for_binding=$true;native_import_count=$selected.native_import_count;native_copy_count=$selected.native_copy_count;object_picture_confirmed_before_save=$true;binding_reopen_verified=$false;project_saved=$false;reopen_verified=$false;compile_verified=$false;runtime_verified=$false}
 }finally{
  if(!$confirmed){
   if($dialog -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $dialog.Hwnd).Count){Close-WeinviewScreenDialog $Session $dialog $false}
  }
 }
}
function Read-WeinviewNativePictureBinding($Session,$Arguments,[string]$ExpectedProjectSha256,[string]$EvidencePrefix) {
 if($null -eq $Arguments -or $Arguments -isnot [pscustomobject]){throw 'Typed native binding read arguments required.'}
 $required=@('window_number','object_id','project_picture_index','picture_name','expected_states','expected_object_sha256','expected_references')
 if(@($required|Where-Object {$_ -cnotin $Arguments.PSObject.Properties.Name}).Count -or @($Arguments.PSObject.Properties.Name|Where-Object {$_ -cnotin $required}).Count){throw 'Exact native binding read arguments required.'}
 if($Arguments.window_number -isnot [int] -or $Arguments.window_number -lt 0 -or $Arguments.window_number -gt 65535 -or $Arguments.project_picture_index -isnot [int] -or $Arguments.project_picture_index -lt 0 -or $Arguments.project_picture_index -gt 65535 -or $Arguments.expected_states -isnot [int] -or $Arguments.expected_states -lt 1 -or $Arguments.expected_states -gt 16 -or $Arguments.expected_references -isnot [int] -or $Arguments.expected_references -lt 1 -or $Arguments.expected_references -gt 4096){throw 'Bounded native binding indexes, states and reference count required.'}
 if($Arguments.object_id -isnot [string] -or $Arguments.object_id -notmatch '^[A-Z]{2}_[0-9]{1,5}$' -or $Arguments.picture_name -isnot [string] -or $Arguments.picture_name -notmatch '^[\x20-\x7e]{1,64}$' -or $Arguments.expected_object_sha256 -cnotmatch '^[0-9A-Fa-f]{64}$' -or $ExpectedProjectSha256 -cnotmatch '^[0-9A-Fa-f]{64}$'){throw 'Pinned native picture binding identity required.'}
 $project=[string]$Session.project_path
 $projectExtension=[IO.Path]::GetExtension($project)
 if($projectExtension -inotmatch '^\.(cmtp|emtp)$' -or ($projectExtension -ieq '.emtp' -and $Arguments.object_id -cnotmatch '^GP_[0-9]{1,5}$')){throw 'Native picture binding read supports cMT objects or an existing MT .emtp GP Picture object.'}
 if([int]$Session.window_number -ne [int]$Arguments.window_number -or (Get-WeinviewResourceSha256 $project) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Selected saved project/window differs before binding read.'}
 $inspector=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.exe_path)
 $dialog=$null;$manager=$null
 try {
  $directory=Get-WeinviewWindowDirectory $Session;$rows=@($directory.rows|Where-Object object_id -CEQ $Arguments.object_id)
  if($rows.Count -ne 1){throw 'Unique original object required after native reopen.'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $readPath=$EvidencePrefix+'.object.json'
  $null=& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $Session.identity_path -ProjectPath $project -ExpectedSha256 $ExpectedProjectSha256 -DialogHwnd $dialog.Hwnd -OutputPath $readPath
  $read=Get-Content -LiteralPath $readPath -Raw -Encoding UTF8|ConvertFrom-Json
  if($read.status -cne 'success' -or (CanonicalObjectHash (CanonicalObject $Arguments.object_id $read.actual)) -cne $Arguments.expected_object_sha256.ToUpperInvariant()){throw 'Persisted object action/address/text fields differ.'}
  if($projectExtension -ieq '.emtp' -and $read.actual.kind -cne 'picture'){throw 'Persisted MT .emtp binding must remain an actual Picture object.'}
  if($read.actual.kind -ceq 'picture'){
   if($read.actual.project_picture_index -ne $Arguments.project_picture_index -or $read.actual.picture_name -cne $Arguments.picture_name -or $read.actual.state_count -ne $Arguments.expected_states -or $read.native_picture_references -ne $Arguments.expected_references){throw 'Persisted Picture selected resource or reference count differs.'}
   if((Get-WeinviewResourceSha256 $project) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Read-only Picture binding inspection changed project bytes.'}
   return @{project_picture_index=[int]$read.actual.project_picture_index;picture_name=[string]$read.actual.picture_name;state_count=[int]$read.actual.state_count;native_reference_count=[int]$read.native_picture_references;window_number=[int]$Arguments.window_number;object_id=$Arguments.object_id;object_business_sha256=$Arguments.expected_object_sha256.ToUpperInvariant();object_evidence_path=$readPath;project_sha256=$ExpectedProjectSha256.ToUpperInvariant();picture_enabled_after_reopen=$true;persisted_binding_verified=$true;read_only=$true;runtime_verified=$false}
  }
  Close-WeinviewScreenDialog $Session $dialog $false;$dialog=$null
  $directory=Get-WeinviewWindowDirectory $Session;$rows=@($directory.rows|Where-Object object_id -CEQ $Arguments.object_id)
  if($rows.Count -ne 1){throw 'Original object disappeared before native picture read.'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $rows[0]
  $tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
  $inspector.SelectTabExact($tab.Hwnd,'图片')
  $usePicture=$Session.native.FindUniqueControl($dialog.Hwnd,1269,'Button','使用图片')
  $persistedPictureState=$Session.native.GetCheckboxState($usePicture.Hwnd)
  if($persistedPictureState -ne 1){throw 'Persisted native object no longer uses a picture.'}
  $Session.native.ClickButton($dialog.Hwnd,1207,'图库...')
  $manager=Wait-WeinviewResourceDialog $Session @($dialog.Hwnd) '图片管理'
  $tabs=$Session.native.FindUniqueControlWithoutLabel($manager.Hwnd,2770,'SysTabControl32')
  $inspector.SelectTabExact($tabs.Hwnd,'工程文件')
  $matches=@(Get-WeinviewVisiblePictureCards $Session $manager|Where-Object {$_.index -eq $Arguments.project_picture_index -and $_.name -ceq $Arguments.picture_name -and $_.states -ceq ('状态数 : '+$Arguments.expected_states) -and $_.references -ceq ('元件 : '+$Arguments.expected_references)})
  if($matches.Count -ne 1){throw 'Persisted project picture state/reference count differs.'}
  if((Get-WeinviewResourceSha256 $project) -cne $ExpectedProjectSha256.ToUpperInvariant()){throw 'Read-only native binding inspection changed project bytes.'}
  return @{project_picture_index=[int]$matches[0].index;picture_name=$matches[0].name;state_count=[int]$Arguments.expected_states;native_reference_count=[int]$Arguments.expected_references;window_number=[int]$Arguments.window_number;object_id=$Arguments.object_id;object_business_sha256=$Arguments.expected_object_sha256.ToUpperInvariant();object_evidence_path=$readPath;project_sha256=$ExpectedProjectSha256.ToUpperInvariant();picture_enabled_after_reopen=($persistedPictureState -eq 1);persisted_binding_verified=$true;read_only=$true;runtime_verified=$false}
 }finally{
  if($manager -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $manager.Hwnd).Count){$Session.native.ClickButton($manager.Hwnd,2,'取消')}
  if($dialog -and @($Session.native.EnumTopWindows()|Where-Object Hwnd -EQ $dialog.Hwnd).Count){Close-WeinviewScreenDialog $Session $dialog $false}
 }
}
