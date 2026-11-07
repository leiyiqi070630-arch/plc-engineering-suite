# Unregistered whole-project compile candidate; definitions only, no startup/UI.
# Load NativeControls.cs + CompileLogCandidate.cs together, referencing Accessibility.
# Session is an internal dedicated-worker session (native/main/process), never a user PID.
function Get-WeinviewCompileFontControlProfile([string]$ProjectExtension,$Controls) {
 $font=@($Controls|Where-Object {$_.Id -eq 2477})
 if($font.Count -gt 1){throw 'Compile font checkbox is not unique.'}
 if($ProjectExtension -ieq '.emtp' -or $font.Count -eq 1){return @{ready=$true;checkbox_ids=@(2476,1903,2477);font_control_presence='checkbox'}}
 if($ProjectExtension -ine '.cmtp'){throw 'Known compile project extension required.'}
 $manager=@($Controls|Where-Object {$_.Id -eq 1299})
 if($manager.Count -gt 1){throw 'Compile font-management button is not unique.'}
 if($manager.Count -eq 0){return @{ready=$false;checkbox_ids=@(2476,1903);font_control_presence='pending'}}
 if($manager[0].Class -cne 'Button' -or $manager[0].Title -cne '字体管理...'){throw 'Compile font-management control differs from observed cMT page.'}
 if(!$manager[0].Visible -or !$manager[0].Enabled){return @{ready=$false;checkbox_ids=@(2476,1903);font_control_presence='pending'}}
 return @{ready=$true;checkbox_ids=@(2476,1903);font_control_presence='management_button'}
}
function Get-WeinviewCompileLanguageControls($Controls) {
 $items=@($Controls|Where-Object {$_.Id -ge 1577 -and $_.Id -le 1600}|Sort-Object Id)
 if($items.Count -lt 1 -or $items.Count -gt 24){throw 'Original compile language control count outside1..24.'}
 for($i=0;$i -lt $items.Count;$i++){if($items[$i].Id -ne (1577+$i) -or $items[$i].Class -cne 'Button' -or $items[$i].Title -cne ('Language '+($i+1))){throw 'Original compile language IDs/classes/labels are not unique and contiguous.'}}
 return $items
}
function Invoke-WeinviewWholeCompileCandidate {
 param($Session,[string]$ProjectPath,[string]$ExobPath,[string]$ExpectedProjectSha256,[ValidateSet('compile','inspect')][string]$Action='compile',$SelectedLanguages=$null,$StartupLanguage=$null,[bool]$FontDependencyRestarted=$false)
 $ErrorActionPreference='Stop'
 if(!$Session.native -or !$Session.main -or !$Session.process){throw 'Dedicated session required.'}
 if(($null -eq $SelectedLanguages) -ne ($null -eq $StartupLanguage) -or ($Action -ceq 'inspect' -and $null -ne $SelectedLanguages)){throw 'Compile language selection requires both selected and startup slots, only for compile.'}
 if($null -ne $SelectedLanguages){$requested=@($SelectedLanguages);$distinct=@($requested|Select-Object -Unique);if(!$requested.Count -or $requested.Count -gt 24 -or $distinct.Count -ne $requested.Count){throw 'One to twenty-four distinct compile language slots required.'};foreach($slot in $requested){if($slot -isnot [int] -and $slot -isnot [long]){throw 'Integer compile language slots required.'};if($slot -lt 1 -or $slot -gt 24){throw 'Compile language slot outside1..24.'}};if($StartupLanguage -isnot [int] -and $StartupLanguage -isnot [long]){throw 'Integer startup language slot required.'};if($StartupLanguage -notin $requested){throw 'Startup language must be selected.'}}
 $project=[IO.Path]::GetFullPath($ProjectPath);$artifact=[IO.Path]::GetFullPath($ExobPath)
 $projectExtension=[IO.Path]::GetExtension($project)
 $artifactExtension=if($projectExtension -ieq '.emtp'){'.exob'}elseif($projectExtension -ieq '.cmtp'){'.cxob'}else{$null}
 if(!$artifactExtension -or $artifact -ine [IO.Path]::ChangeExtension($project,$artifactExtension) -or !(Test-Path -LiteralPath $project -PathType Leaf) -or (Test-Path -LiteralPath $artifact)){throw 'Existing dedicated .emtp/.exob or .cmtp/.cxob pair with a fresh adjacent same-stem artifact required.'}
 function LocalHash($path){$f=[IO.File]::OpenRead($path);$sha=[Security.Cryptography.SHA256]::Create();try{[BitConverter]::ToString($sha.ComputeHash($f)).Replace('-','')}finally{$f.Dispose();$sha.Dispose()}}
 if((LocalHash $project) -ine $ExpectedProjectSha256){throw 'Whole compile input hash mismatch.'}
 if(Test-Path -LiteralPath $artifact){throw 'EXOB collision immediately before F5 intent.'}
 $startUtc=[DateTime]::UtcNow;
 $script:compileIntentEvidence=@{command_utc=$startUtc.ToString('o');artifact_absent_before_command=$true;command_id=0x8255}
 $Session.native.PostMenuCommand($Session.main.Hwnd,0x8255)
 $deadline=[DateTime]::UtcNow.AddSeconds(30);$dialog=$null;$before=@{};$checkboxIds=@();$fontControlPresence=$null
 do {
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'})
  if($dialogs.Count -gt 1 -or ($dialogs.Count -eq 1 -and $dialogs[0].Title -ne '编译')){throw 'Unknown compile modal; no acknowledgement performed.'}
  if($dialogs.Count -eq 1){
   $d=$dialogs[0];$children=@($Session.native.EnumChildControls($d.Hwnd))
   if(@($children|Where-Object {$_.Class -eq 'Button' -and $_.Title -match '(?i)模拟|simulat'}).Count){throw 'Unexpected simulation option requires a new reviewed profile.'}
   $fontProfile=Get-WeinviewCompileFontControlProfile $projectExtension $children
   $ready=[bool]$fontProfile.ready
   $specs=@(@{id=1224;class='Static'},@{id=1232;class='Static'},@{id=1297;class='Button';label='开始编译'},@{id=1;class='Button';label='关闭  '},@{id=2476;class='Button';label='禁止结构分析'},@{id=1903;class='Button';label='取消 HMI 上传功能'})
   if(2477 -in $fontProfile.checkbox_ids){$specs+=@{id=2477;class='Button';label='建立字体文件'}}
   foreach($spec in $specs){
    $found=@($children|Where-Object {$_.Id -eq $spec.id})
    if($found.Count -gt 1){throw 'Compile control is not unique.'}
    if(!$found.Count){$ready=$false;continue}
    if($found[0].Class -cne $spec.class -or ($spec.label -and $found[0].Title -and $found[0].Title -cne $spec.label)){throw 'Compile class/label differs from reviewed 209.'}
    if(!$found[0].Visible -or !$found[0].Enabled -or ($spec.label -and !$found[0].Title)){$ready=$false}
   }
   if($ready){$dialog=$d;$checkboxIds=@($fontProfile.checkbox_ids);$fontControlPresence=$fontProfile.font_control_presence}
  }
  if(!$dialog){Start-Sleep -Milliseconds 150}
 }while(!$dialog -and [DateTime]::UtcNow -lt $deadline)
 if(!$dialog){throw 'Compile dialog controls did not become ready.'}
 # Only empty/resource-placeholder path captions may settle. A different real path fails immediately.
 $pathDeadline=[DateTime]::UtcNow.AddSeconds(5);$pathsReady=$false
 do {
  $actualProject=$Session.native.GetControlText(($Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,1224,'Static')).Hwnd,4096)
  $actualArtifact=$Session.native.GetControlText(($Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,1232,'Static')).Hwnd,4096)
  $artifactExists=Test-Path -LiteralPath $artifact
  $script:compilePathEvidence=@{read_utc=[DateTime]::UtcNow.ToString('o');actual_project=$actualProject;expected_project=$project;actual_project_length=$actualProject.Length;expected_project_length=$project.Length;actual_artifact=$actualArtifact;expected_artifact=$artifact;actual_artifact_length=$actualArtifact.Length;expected_artifact_length=$artifact.Length;artifact_exists=$artifactExists}
  # F5 itself starts native compilation; a newly created EXOB is expected here.
  $projectMatches=$actualProject -ieq $project;$artifactMatches=$actualArtifact -ieq $artifact
  if($projectMatches -and $artifactMatches){$pathsReady=$true;break}
  if(!$projectMatches -and $actualProject -and $actualProject -cne 'Static'){throw 'Native project path differs from dedicated output.'}
  if(!$artifactMatches -and $actualArtifact -and $actualArtifact -cne 'Static'){throw 'Native EXOB path differs from dedicated output.'}
  Start-Sleep -Milliseconds 150
 }while([DateTime]::UtcNow -lt $pathDeadline)
 if(!$pathsReady){throw 'Native project/EXOB path placeholders did not become ready.'}
 # Compilation can disable these checkboxes after the ready snapshot. Reading
 # their state is valid while disabled; do not use the interactive write locator.
 function ReadCompileCheckbox([int]$id) {
  $expected=@{2476='禁止结构分析';1903='取消 HMI 上传功能';2477='建立字体文件'}
  $matches=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq $id -and $_.Class -ceq 'Button' -and $_.Title -ceq $expected[$id] -and $_.Visible})
  if($matches.Count -ne 1){throw 'Reviewed compile checkbox is not uniquely readable.'}
  return $Session.native.GetCheckboxState($matches[0].Hwnd)
 }
 foreach($id in $checkboxIds){$before[$id]=ReadCompileCheckbox $id}
 $script:compileIntentEvidence.font_control_presence=$fontControlPresence
 $languageProperty=$null
 if($projectExtension -ieq '.cmtp' -or $Action -ceq 'inspect' -or $null -ne $SelectedLanguages){
  if(!('PLCCode.Weinview.Research.NativePropertyCandidate' -as [type])){throw 'Owned native property controls required for compiler language readback.'}
  $languageProperty=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,[string]$Session.process.Path)
 }
 function ReadCompileLanguageSlot([string]$text){$match=[regex]::Match($text,'^(?:语言|Language)\s*([1-9]|1[0-9]|2[0-4])$');if(!$match.Success){throw ('Original compile language label unsupported: '+$text)};return [int]$match.Groups[1].Value}
 function ReadCompileLanguagePage {
  if(!$languageProperty){return $null}
  $controls=@($Session.native.EnumChildControls($dialog.Hwnd))
  $title=@($controls|Where-Object {$_.Id -eq 2453 -and $_.Class -ceq 'Static' -and $_.Title -ceq '下载工程文件后所显示的语言 :' -and $_.Visible})
  $combo=@($controls|Where-Object {$_.Id -eq 2068 -and $_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled})
  if($title.Count -ne 1 -or $combo.Count -ne 1){throw 'Original compile startup-language controls unavailable.'}
  $languageControls=@(Get-WeinviewCompileLanguageControls $controls)
  $available=@();$selected=@();$all=@()
  foreach($item in $languageControls){
   $slot=[int]$item.Id-1576;$label='Language '+$slot
   if($item.Title -cne $label){throw 'Original compile language control label differs from slot.'}
   if($item.Visible){if(!$item.Enabled){throw 'Visible compile language disabled.'};$state=$Session.native.GetCheckboxState($item.Hwnd);if($state -notin @(0,1)){throw 'Original compile language state ambiguous.'};$available+=@{language_slot=$slot;display_name=$label};if($state -eq 1){$selected+=$slot}}
   $all+=@{language_slot=$slot;display_name=$label;visible=[bool]$item.Visible;enabled=[bool]$item.Enabled;selected=if($item.Visible){$state -eq 1}else{$false}}
  }
  if(!$available.Count -or !$selected.Count){throw 'At least one visible and selected original compile language required.'}
  $items=@($languageProperty.ComboItems($combo[0].Hwnd));$index=$languageProperty.ComboSelectedIndex($combo[0].Hwnd)
  if($index -lt 0 -or $index -ge $items.Count){throw 'Original startup-language combo index unavailable.'}
  $raw=[string]$items[$index];$startup=ReadCompileLanguageSlot $raw
  if($startup -notin $selected){throw 'Original startup language is not selected for compilation.'}
  $map=@();for($i=0;$i -lt $selected.Count;$i++){$map+=@{language_slot=[int]$selected[$i];lw9134_value=$i}}
  return @{available_languages=@($available);selected_languages=@($selected);startup_language=$startup;startup_language_raw_index=$index;startup_language_raw_text=$raw;startup_language_items=@($items);language_mode_map=@($map);all_language_controls=@($all);language_selection_verified=$true}
 }
 $languageBefore=$null
 function SetCompileLanguagePage {
  if(!$languageProperty -or $null -eq $SelectedLanguages){return $languageBefore}
  $actual=ReadCompileLanguagePage
  $requested=@($SelectedLanguages|ForEach-Object {[int]$_})
  $visible=@($actual.available_languages|ForEach-Object {[int]$_.language_slot})
  foreach($slot in $requested){if($slot -notin $visible){throw ('Requested compile language not available in original page: '+$slot)}}
  $controls=@($Session.native.EnumChildControls($dialog.Hwnd))
  foreach($slot in $visible){
   $id=1576+$slot;$label='Language '+$slot
   $item=@($controls|Where-Object {$_.Id -eq $id -and $_.Class -ceq 'Button' -and $_.Title -ceq $label -and $_.Visible -and $_.Enabled})
   if($item.Count -ne 1){throw 'Original compile language checkbox changed during selection.'}
   $wanted=if($slot -in $requested){1}else{0}
   $current=$Session.native.GetCheckboxState($item[0].Hwnd)
   if($current -notin @(0,1)){throw 'Original compile language checkbox state ambiguous.'}
   if($current -ne $wanted){
    $Session.native.ClickButton($dialog.Hwnd,$id,$label)
    $deadline=[DateTime]::UtcNow.AddSeconds(3);do{Start-Sleep -Milliseconds 50;$current=$Session.native.GetCheckboxState($item[0].Hwnd);if($current -eq $wanted){break}}while([DateTime]::UtcNow -lt $deadline)
    if($current -ne $wanted){throw 'Original compile language checkbox did not reach requested state.'}
   }
  }
  $combo=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq 2068 -and $_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled})
  if($combo.Count -ne 1){throw 'Original startup-language combo unavailable for selection.'}
  $items=@($languageProperty.ComboItems($combo[0].Hwnd));$targetIndex=-1;$targetText=$null
  for($i=0;$i -lt $items.Count;$i++){$match=[regex]::Match([string]$items[$i],'^(?:语言|Language)\s*([1-9]|1[0-9]|2[0-4])$');if($match.Success -and [int]$match.Groups[1].Value -eq [int]$StartupLanguage){$targetIndex=$i;$targetText=[string]$items[$i];break}}
  if($targetIndex -lt 0){throw 'Requested startup language absent from original combo items.'}
  $currentIndex=$languageProperty.ComboSelectedIndex($combo[0].Hwnd)
  $currentSlot=ReadCompileLanguageSlot ([string]$items[$currentIndex])
  if($currentSlot -ne [int]$StartupLanguage){$languageProperty.SelectComboIndexExact($combo[0].Hwnd,$targetIndex,$targetText)}
  $after=ReadCompileLanguagePage
  $got=@($after.selected_languages|Sort-Object);$want=@($requested|Sort-Object)
  if(($got -join ',') -cne ($want -join ',') -or [int]$after.startup_language -ne [int]$StartupLanguage){throw 'Original compile language selection readback differs from request.'}
  return $after
 }
 $reader=New-Object PLCCode.Weinview.CompileLogCandidate($Session.native)
 $sequenceObserved=$false; $script:compileIntentEvidence.native_start_mode='F5_automatic'
 $deadline=[DateTime]::UtcNow.AddSeconds(90);$log='';$complete=$false;$errorCount=$null;$warningCount=$null
 do {
  $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'})
  if($dialogs.Count -ne 1 -or $dialogs[0].Hwnd -ne $dialog.Hwnd){throw 'Unexpected compile modal transition; no acknowledgement performed.'}
  $nativeControls=@($Session.native.EnumChildControls($dialog.Hwnd)); if(@($nativeControls|Where-Object {$_.Id -eq 1508 -and $_.Visible -and $_.Enabled}).Count){$sequenceObserved=$true}
  # Don't traverse a changing log while native compilation is still writing.
  # No visible Stop gates the stable log. A failed native build has no artifact;
  # inspect its actual terminal error rather than waiting for a file it cannot create.
  if(@($nativeControls|Where-Object {$_.Id -eq 1508 -and $_.Visible}).Count){Start-Sleep -Milliseconds 200;continue}
  try {$rows=@($reader.ReadRows($dialog.Hwnd))}
  catch {if($_.Exception.Message.Contains('Compile log changed while reading')){Start-Sleep -Milliseconds 200;continue};throw}
  $log=($rows|ForEach-Object {$_.Name}) -join "`n"
  $script:compileMessages=@($rows|ForEach-Object {$_.Name})
  if($rows.Count -gt 0 -and $rows[-1].Name.Trim() -ceq '失败'){
   foreach($id in $checkboxIds){if((ReadCompileCheckbox $id) -ne $before[$id]){throw 'Compile checkbox state changed during native failure.'}}
   if((LocalHash $project) -ine $ExpectedProjectSha256){throw 'Native compile failure changed project bytes.'}
   # Original cMT templates can retain a Bahnschrift font dependency even when
   # newly added controls explicitly use Arial. Follow the native compiler's
   # exact local-font remedy once; never replace an existing vendor font file.
   $fontSource=Join-Path ([Environment]::GetFolderPath('Windows')) 'Fonts\bahnschrift.ttf'
   $nativeExePath=[IO.Path]::GetFullPath([string]$Session.process.Path)
   $fontDirectory=Join-Path ([IO.Path]::GetDirectoryName($nativeExePath)) 'windows_font'
   $fontTarget=Join-Path $fontDirectory 'bahnschrift.ttf'
   $fontRulesPath=Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'Weintek\EasyBuilder\FontRules.xml'
   $rulesBeforeHash='EC8E60AB090C11D10A7E7D4D5FA20A09A3114D6D46AC299075916242EE891AFE'
   $knownRules=(Test-Path -LiteralPath $fontRulesPath -PathType Leaf) -and (LocalHash $fontRulesPath) -ceq $rulesBeforeHash
   if($Session.editor_session_mode -cne 'reuse' -and !$FontDependencyRestarted -and $log.Contains('无法生成字体文件 (Bahnschrift)') -and $log.IndexOf($fontSource,[StringComparison]::OrdinalIgnoreCase) -ge 0 -and $log.IndexOf($fontDirectory,[StringComparison]::OrdinalIgnoreCase) -ge 0 -and (Test-Path -LiteralPath $fontSource -PathType Leaf) -and (Test-Path -LiteralPath $fontDirectory -PathType Container) -and (!(Test-Path -LiteralPath $fontTarget) -or $knownRules)){
    if((LocalHash $nativeExePath) -cne '59FB29D8A4AA96A3F2DAD7E59301E6EE7197C6D43AB1BF79C0F135BC1EAF8F86' -or (Get-AuthenticodeSignature -LiteralPath $nativeExePath).Status -ne 'Valid'){throw 'Known signed native installation required for compiler font setup.'}
    foreach($fontPath in @($fontSource,$fontDirectory)){if((Get-Item -LiteralPath $fontPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Native font dependency reparse path refused.'}}
    $fontBytes=[IO.File]::ReadAllBytes($fontSource);if($fontBytes.Length -lt 100000 -or $fontBytes.Length -gt 2097152 -or ($fontBytes[0..3] -join ',') -cne '0,1,0,0'){throw 'Expected bounded installed Windows TrueType font required.'}
    $fontHash=LocalHash $fontSource
    $fontCopied=!(Test-Path -LiteralPath $fontTarget)
    if($fontCopied){[IO.File]::Copy($fontSource,$fontTarget,$false)}
    if((LocalHash $fontTarget) -cne $fontHash -or (LocalHash $fontSource) -cne $fontHash){throw 'Native local font dependency copy hash differs.'}
    $script:compileIntentEvidence.font_dependency_repair=@{source_path=$fontSource;source_sha256=$fontHash;installed_path=$fontTarget;installed_sha256=$fontHash;bytes=$fontBytes.Length;new_file_only=$fontCopied;existing_font_unchanged=(!$fontCopied);bundled_with_product=$false;original_failure_messages=@($rows|ForEach-Object Name)}
    if($knownRules){
     # Vendor KB: complete_font enables this variable font. Preserve every
     # existing rule and UTF-16 encoding; unknown or customized rules are not edited.
     foreach($rulesPath in @($fontRulesPath,[IO.Path]::GetDirectoryName($fontRulesPath))){if((Get-Item -LiteralPath $rulesPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Native font-rule reparse path refused.'}}
     $rulesBytes=[IO.File]::ReadAllBytes($fontRulesPath);$rulesText=[IO.File]::ReadAllText($fontRulesPath)
     $rulesXml=[xml]$rulesText;$beforeRules=@($rulesXml.FontRules.Rule|ForEach-Object {$_.data})
     if($rulesBytes.Length -ne 1996 -or $rulesBytes[0] -ne 255 -or $rulesBytes[1] -ne 254 -or $rulesXml.FontRules.Version.data -cne '1.4' -or $beforeRules.Count -ne 16 -or $rulesText.Contains('Bahnschrift') -or [regex]::Matches($rulesText,'</FontRules>').Count -ne 1){throw 'Known original native font-rule contract required.'}
     $rulesBackup=$fontRulesPath+'.plccode-before-bahnschrift-'+[Guid]::NewGuid().ToString('N')+'.xml'
     [IO.File]::Copy($fontRulesPath,$rulesBackup,$false)
     if((LocalHash $rulesBackup) -cne $rulesBeforeHash -or (LocalHash $fontRulesPath) -cne $rulesBeforeHash){throw 'Native font-rule backup differs before change.'}
     $rulesAfterText=$rulesText.Replace('</FontRules>',('    <Rule data="complete_font = ^Bahnschrift$"/>'+"`r`n"+'</FontRules>'))
     [IO.File]::WriteAllText($fontRulesPath,$rulesAfterText,[Text.Encoding]::Unicode)
     $rulesAfterXml=[xml][IO.File]::ReadAllText($fontRulesPath);$afterRules=@($rulesAfterXml.FontRules.Rule|ForEach-Object {$_.data})
     if($afterRules.Count -ne 17 -or ($afterRules[0..15] -join "`n") -cne ($beforeRules -join "`n") -or $afterRules[16] -cne 'complete_font = ^Bahnschrift$' -or $rulesAfterXml.FontRules.Version.data -cne '1.4'){throw 'Native font-rule preservation or exact append differs.'}
     $script:compileIntentEvidence.font_dependency_repair.font_rules=@{path=$fontRulesPath;before_sha256=$rulesBeforeHash;after_sha256=(LocalHash $fontRulesPath);backup_path=$rulesBackup;backup_sha256=(LocalHash $rulesBackup);rule='complete_font = ^Bahnschrift$';existing_rules_preserved=$true;encoding_preserved='UTF16LE-BOM';vendor_reference='https://forum.weintekusa.com/t/how-to-fix-error-building-font-file-failed/3547'}
    }
    # The vendor loads local font dependencies at process startup. Restart only
    # this bound private source, with the same zero-exit and hash guards used by
    # the caller; changing the font directory does not refresh a running editor.
    $repair=$script:compileIntentEvidence.font_dependency_repair
    $firstIntent=$script:compileIntentEvidence
    $firstOwner=@{pid=$Session.process.Id;creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks}
    $Session.native.ClickButton($dialog.Hwnd,1,'关闭  ')
    $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'}).Count){return $true}}
    CloseSession $Session $project $ExpectedProjectSha256 $true
    $restart=@{original_pid=$firstOwner.pid;original_creation_utc_ticks=$firstOwner.creation_utc_ticks;original_exit_code=$Session.process.ExitCode;normal_original_exit_verified=$true;source_unchanged=$true;restarted_utc=[DateTime]::UtcNow.ToString('o')}
    $fresh=StartOwned $nativeExePath $project $false
    foreach($key in @('process','native','main','project_path')){$Session[$key]=$fresh[$key]}
    $script:pendingOwnedSession=$Session
    $restart.new_pid=$Session.process.Id;$restart.new_creation_utc_ticks=$Session.process.StartTime.ToUniversalTime().Ticks
    try{$retry=Invoke-WeinviewWholeCompileCandidate -Session $Session -ProjectPath $project -ExobPath $artifact -ExpectedProjectSha256 $ExpectedProjectSha256 -Action $Action -SelectedLanguages $SelectedLanguages -StartupLanguage $StartupLanguage -FontDependencyRestarted $true}
    finally{
     $script:compileIntentEvidence.font_dependency_repair=$repair
     $script:compileIntentEvidence.font_dependency_restart=$restart
     $script:compileIntentEvidence.initial_command_utc=$firstIntent.command_utc
     $script:compileIntentEvidence.native_start_mode='F5_automatic_with_native_font_dependency_restart'
    }
    return $retry
   }
   $Session.native.ClickButton($dialog.Hwnd,1,'关闭  ')
   $script:compileIntentEvidence.native_failure_dialog_closed=$true
   throw ('Whole compilation reported native failure: '+$log)
  }
  if(!(Test-Path -LiteralPath $artifact -PathType Leaf)){Start-Sleep -Milliseconds 200;continue}
  $freshArtifact=Get-Item -LiteralPath $artifact
  # Replacing a file at the same path can retain its earlier creation time.
  # Absence before F5 and the new write time identify this compilation.
  if($freshArtifact.LastWriteTimeUtc -lt $startUtc){throw 'Compiled artifact write time predates this native F5 intent.'}
  $sequenceObserved=$true
  $script:compileMessages=@($rows|ForEach-Object {$_.Name})
  $summaries=[regex]::Matches($log,'(?m)^\s*(\d+)\s*错误\s*[,，]\s*(\d+)\s*警告\s*$')
  if($summaries.Count -gt 1){throw 'Whole compiler summary is ambiguous.'}
  if($summaries.Count -eq 1){$errorCount=[int]$summaries[0].Groups[1].Value;$warningCount=[int]$summaries[0].Groups[2].Value;if($errorCount -gt 0){throw ('Whole compilation reported errors: '+$log)};if($sequenceObserved -and $rows.Count -gt 0 -and $rows[-1].Name.Trim() -ceq '成功' -and (Test-Path -LiteralPath $artifact -PathType Leaf) -and (Get-Item -LiteralPath $artifact).Length -gt 0){$complete=$true}}
  if(!$complete){Start-Sleep -Milliseconds 200}
 }while(!$complete -and [DateTime]::UtcNow -lt $deadline)
 if(!$complete){throw ('Whole compile completion was not verified; last Qt log: '+$log)}
 foreach($id in $checkboxIds){if((ReadCompileCheckbox $id) -ne $before[$id]){throw 'Compile security/font checkbox state changed.'}}
 if((LocalHash $project) -ine $ExpectedProjectSha256){throw 'Whole compile modified source project bytes.'}
 $languageBefore=ReadCompileLanguagePage
 $languageFinal=$languageBefore
 if($null -ne $SelectedLanguages){
  $languageFinal=SetCompileLanguagePage
  $beforeSet=@($languageBefore.selected_languages|Sort-Object)
  $afterSet=@($languageFinal.selected_languages|Sort-Object)
  $selectionChanged=(($beforeSet -join ',') -cne ($afterSet -join ',')) -or ([int]$languageBefore.startup_language -ne [int]$languageFinal.startup_language)
  if($selectionChanged){
   $previousArtifact=Get-Item -LiteralPath $artifact
   $previousWriteUtc=$previousArtifact.LastWriteTimeUtc
   $previousBytes=$previousArtifact.Length
   $secondStartUtc=[DateTime]::UtcNow
   $Session.native.ClickButton($dialog.Hwnd,1297,'开始编译')
   $secondStopObserved=$false;$secondComplete=$false;$secondLog='';$secondRows=@()
   $secondDeadline=[DateTime]::UtcNow.AddSeconds(120)
   do {
    $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'})
    if($dialogs.Count -ne 1 -or $dialogs[0].Hwnd -ne $dialog.Hwnd){throw 'Unexpected second compile modal transition.'}
    $nativeControls=@($Session.native.EnumChildControls($dialog.Hwnd))
    $running=@($nativeControls|Where-Object {$_.Id -eq 1508 -and $_.Class -ceq 'Button' -and $_.Title -ceq '停止' -and $_.Visible -and $_.Enabled})
    if($running.Count -gt 1){throw 'Second compile Stop control ambiguous.'}
    if($running.Count -eq 1){$secondStopObserved=$true;Start-Sleep -Milliseconds 200;continue}
    if(!$secondStopObserved){Start-Sleep -Milliseconds 100;continue}
    try{$secondRows=@($reader.ReadRows($dialog.Hwnd))}
    catch{if($_.Exception.Message.Contains('Compile log changed while reading')){Start-Sleep -Milliseconds 200;continue};throw}
    $secondLog=($secondRows|ForEach-Object {$_.Name}) -join "`n"
    $script:compileMessages=@($secondRows|ForEach-Object {$_.Name})
    if($secondRows.Count -and $secondRows[-1].Name.Trim() -ceq '失败'){throw ('Second whole compilation reported native failure: '+$secondLog)}
    $summaries=[regex]::Matches($secondLog,'(?m)^\s*(\d+)\s*错误\s*[,，]\s*(\d+)\s*警告\s*$')
    if($summaries.Count -gt 1){throw 'Second whole compiler summary is ambiguous.'}
    if($summaries.Count -eq 1 -and $secondRows.Count -and $secondRows[-1].Name.Trim() -ceq '成功'){
     $newArtifact=Get-Item -LiteralPath $artifact
     if($newArtifact.LastWriteTimeUtc -gt $previousWriteUtc -and $newArtifact.Length -gt 0){
      $errorCount=[int]$summaries[0].Groups[1].Value;$warningCount=[int]$summaries[0].Groups[2].Value
      if($errorCount -gt 0){throw ('Second whole compilation reported errors: '+$secondLog)}
      $secondComplete=$true;$log=$secondLog
     }
    }
    if(!$secondComplete){Start-Sleep -Milliseconds 200}
   }while(!$secondComplete -and [DateTime]::UtcNow -lt $secondDeadline)
   if(!$secondComplete){throw ('Second whole compile completion was not verified; last native log: '+$secondLog)}
   $script:compileIntentEvidence.second_compile=@{command_utc=$secondStartUtc.ToString('o');command_id=1297;stop_observed=$secondStopObserved;native_success_verified=$true;previous_artifact_bytes=$previousBytes;previous_artifact_last_write_utc=$previousWriteUtc.ToString('o');final_artifact_bytes=(Get-Item -LiteralPath $artifact).Length;final_artifact_last_write_utc=(Get-Item -LiteralPath $artifact).LastWriteTimeUtc.ToString('o')}
   $languageFinal=ReadCompileLanguagePage
   $finalSet=@($languageFinal.selected_languages|Sort-Object)
   if(($finalSet -join ',') -cne ($afterSet -join ',') -or [int]$languageFinal.startup_language -ne [int]$StartupLanguage){throw 'Second whole compile changed selected/startup languages.'}
   foreach($id in $checkboxIds){if((ReadCompileCheckbox $id) -ne $before[$id]){throw 'Second compile security/font checkbox state changed.'}}
   if((LocalHash $project) -ine $ExpectedProjectSha256){throw 'Second whole compile modified source project bytes.'}
  }
 }
 $children=@(Get-CimInstance Win32_Process -Filter ('ParentProcessId='+$Session.process.Id)|Where-Object {$_.Name -match '(?i)^(gui_|com_|EasySimulator|cMTViewer)' }|Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CreationDate)
 if($children.Count){throw ('Unexpected simulator children require reconciliation: '+($children|ConvertTo-Json -Compress))}
 $artifactHash=LocalHash $artifact
 $Session.native.ClickButton($dialog.Hwnd,1,'关闭  ')
 [pscustomobject]@{compile_scope='whole_project';action=$Action;project_path=$project;project_sha256=$ExpectedProjectSha256;project_saved=$false;source_unchanged=$true;compile_verified=$true;inspect_auto_compiled=($Action -ceq 'inspect');artifact_path=$artifact;artifact_sha256=$artifactHash;artifact_bytes=(Get-Item -LiteralPath $artifact).Length;error_count=$errorCount;warning_count=$warningCount;compile_log=$log;compile_sequence_observed=$sequenceObserved;compile_started_utc=$startUtc.ToString("o");compile_intent_evidence=$script:compileIntentEvidence;security_font_states_unchanged=$true;auto_simulation_option_observed=$false;simulator_children=$children;candidate_only=$true;normal_main_exit_verified=$false;available_languages=if($languageFinal){$languageFinal.available_languages}else{$null};selected_languages=if($languageFinal){$languageFinal.selected_languages}else{$null};startup_language=if($languageFinal){$languageFinal.startup_language}else{$null};startup_language_raw_index=if($languageFinal){$languageFinal.startup_language_raw_index}else{$null};startup_language_raw_text=if($languageFinal){$languageFinal.startup_language_raw_text}else{$null};startup_language_items=if($languageFinal){$languageFinal.startup_language_items}else{$null};language_mode_map=if($languageFinal){$languageFinal.language_mode_map}else{$null};all_language_controls=if($languageFinal){$languageFinal.all_language_controls}else{$null};language_selection_verified=[bool]$languageFinal}
 # Caller must wait for compile-dialog destruction and close the dedicated main
 # using the established normal-close/hash contract before an operation can be ok.
}
