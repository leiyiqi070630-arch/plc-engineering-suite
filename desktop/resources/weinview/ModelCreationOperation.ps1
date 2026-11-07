# The OEM New Project command serializes the selected model. All catalog and
# template access is direct file I/O; only the proprietary serializer is native.
function Convert-WeinviewNativeHostModelReadback($Raw) {
 $model=$Raw.metadata.sys_params.model
 if(!$model -or $model.model_name -isnot [string] -or [string]::IsNullOrWhiteSpace($model.model_name)){throw 'Native host model name missing.'}
 [int]$width=0;[int]$height=0
 if(![int]::TryParse([string]$model.resolution_width,[ref]$width) -or ![int]::TryParse([string]$model.resolution_height,[ref]$height)){throw 'Native host model resolution missing.'}
 if(($width -eq 0 -and $height -ne 0) -or ($height -eq 0 -and $width -ne 0) -or $width -gt 8192 -or $height -gt 8192 -or $width -lt 0 -or $height -lt 0){throw 'Native host model resolution invalid.'}
 $label=[string]$model.model_name
 if($width){$label+=' ('+[string]$width+' x '+[string]$height+')'}
 return @{model_label=$label;model_label_origin='native_host_fields';read_route='native_host';native_model_fields=$model;native_model_label_observed=$true}
}
function Read-WeinviewOriginalModelLabel($Session) {
 $hostFailure=$null
 if([int]$Session.native_host_port -gt 0){
  if($Session.native_host_model_readback){return $Session.native_host_model_readback}
  try {
   . (Join-Path $PSScriptRoot 'NativeHostRead.ps1')
   $raw=Invoke-WeinviewNativeHostRead -Port ([int]$Session.native_host_port) -Method getAllData
   $hostReadback=Convert-WeinviewNativeHostModelReadback $raw
   $Session.native_host_model_readback=$hostReadback
   return $hostReadback
  }catch{$hostFailure=$_.Exception.Message}
 }
 . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1')
 . (Join-Path $PSScriptRoot 'NativeRibbonAction.ps1')
 $property=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $semantic=[PLCCode.Weinview.NativeSemanticControls]::new($Session.native)
 $readbackPath=[string]$Session.output_path;$readbackSha=Hash $readbackPath;$dialog=$null
 try {
 $entry=Open-WeinviewSystemParametersRibbon $Session $semantic
 $dialog=WaitFor {
  $all=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($all|Where-Object {$_.Title -cne '系统参数设置 '}).Count){throw 'Unknown model readback modal; preserve'}
  if($all.Count -eq 1 -and $all[0].Enabled){return $all[0]}
 } 8
 $tab=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
 $names=@($property.TabNames($tab.Hwnd))
 # A reopened project can already have HMI properties selected. Reading its
 # visible model combo avoids sending a redundant tab-change message to the OEM.
 $visibleModel=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Id -eq 1301 -and $_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled})
 if($visibleModel.Count -ne 1){$property.SelectTabExact($tab.Hwnd,'HMI 属性')}
 $combo=$Session.native.FindUniqueControlWithoutLabel($dialog.Hwnd,1301,'ComboBox')
 $label=$property.ComboSelected($combo.Hwnd)
 $Session.native.ClickButton($dialog.Hwnd,2,'取消')
 $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 8
 if((Hash $readbackPath) -cne $readbackSha){throw 'Original model label read changed project bytes.'}
 $result=@{model_label=$label;model_label_origin='native_ui_combo';read_route='native_ui';model_combo_id=1301;model_tabs=$names;entry=$entry;native_model_label_observed=$true}
 if($hostFailure){$result.native_host_fallback_reason=$hostFailure}
 return $result
 } catch {
  $readbackError=$_
  # This dialog was opened for observation only. Cancel only that exact owned
  # dialog when the saved project is unchanged; unknown modal transitions remain.
  $dialogCleanup=@{attempted=$false;dialog_closed=$false}
  try {
   if((Hash $readbackPath) -cne $readbackSha){$dialogCleanup.reason='Saved project changed; preserve native state'}
   elseif($dialog){
    $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
    if(!$modals.Count){$dialogCleanup.dialog_closed=$true}
    elseif($modals.Count -eq 1 -and $modals[0].Hwnd -eq $dialog.Hwnd -and $modals[0].Title -ceq '系统参数设置 ' -and $modals[0].Enabled){
     $dialogCleanup.attempted=$true;$Session.native.ClickButton($dialog.Hwnd,2,'取消')
     $null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 5
     $dialogCleanup.dialog_closed=$true
    }else{$dialogCleanup.reason='Unexpected owned modal; preserve for reconciliation'}
   }else{$dialogCleanup.reason='Read-only dialog was not yet bound'}
  }catch{$dialogCleanup.error=$_.Exception.Message}
  $readbackError.Exception.Data['model_readback_dialog_cleanup']=$dialogCleanup
  throw $readbackError
 }
}
function Read-WeinviewSerializedModel($Session,$Model,[int]$Width,[int]$Height) {
 $readback=Read-WeinviewOriginalModelLabel $Session
 $expected=([string]$Model.name -replace '\s','')
 $actual=([string]$readback.model_label -replace '\s','')
 if($Model.has_display){$expected+='('+[string]$Width+'x'+[string]$Height+')'}
 if($actual -cne $expected){throw ('Persisted original model label differs: '+$readback.model_label)}
 $readback.native_model_verified=$true
 return $readback
}
function Resolve-WeinviewAdoptedModel($Installation,[string]$ModelLabel,[string]$Format) {
 $catalog=Get-WeinviewInstalledModelCatalog @($Installation)
 $actual=$ModelLabel -replace '\s',''
 $candidates=@()
 foreach($model in $catalog.models){
  if($model.format -and $model.format -cne $Format){continue}
  if(!$model.format){$model.format=$Format}
  $name=([string]$model.name -replace '\s','')
  if(!$model.has_display){if($actual -ceq $name){$candidates+=,[pscustomobject]@{profile=$model;width=0;height=0;orientation='horizontal'}};continue}
  if($actual -cnotmatch ('^'+[regex]::Escape($name)+'\(([1-9][0-9]{0,4})x([1-9][0-9]{0,4})\)$')){continue}
  $width=[int]$Matches[1];$height=[int]$Matches[2]
  if($width -gt 8192 -or $height -gt 8192){continue}
  $orientation='horizontal'
  if($model.width -and $model.height){if($width -eq [int]$model.width -and $height -eq [int]$model.height){}elseif($width -eq [int]$model.height -and $height -eq [int]$model.width){$orientation='vertical'}else{$orientation=if($height -gt $width){'vertical'}else{'horizontal'}}}
  else{$orientation=if($height -gt $width){'vertical'}else{'horizontal'}}
  $candidates+=,[pscustomobject]@{profile=$model;width=$width;height=$height;orientation=$orientation}
 }
 if($candidates.Count -ne 1){throw 'Original model label has no unique match in this installation Config.xml.'}
 return $candidates[0]
}
function Close-WeinviewModelCreationFailure($Session) {
 $cleanup=@{attempted=$false;normal_exit_verified=$false;output_hash_preserved=$false;forced=$false}
 try {
  if(!$Session -or !$Session.process -or !$Session.native -or !$Session.main){$cleanup.reason='Owned model session is not fully bound';return $cleanup}
  $path=[string]$Session.model_creation_close_path;$hash=[string]$Session.model_creation_close_sha256
  if(!$path -or $hash -cnotmatch '^[0-9A-F]{64}$' -or $Session.project_path -ine $path -or (Hash $path) -cne $hash){$cleanup.reason='Saved model close anchor is absent or changed';return $cleanup}
  if($Session.process.HasExited){
   $cleanup.already_closed=$true;$cleanup.exit_code=$Session.process.ExitCode
   $cleanup.normal_exit_verified=($Session.process.ExitCode -eq 0);$cleanup.output_hash_preserved=$true;return $cleanup
  }
  $windows=@($Session.native.EnumTopWindows())
  if(@($windows|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){$cleanup.reason='Owned modal requires reconciliation; no acknowledgement';return $cleanup}
  $emptyAfterCancel=($Session.model_creation_wizard_cancelled -eq $true)
  if($emptyAfterCancel){
   $views=@($Session.native.EnumChildControls($Session.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible})
   $emptyAfterCancel=($views.Count -eq 0)
  }
  $main=@($windows|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Enabled -and ($_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($path)) -or ($emptyAfterCancel -and $_.Title -cmatch '^EasyBuilder Pro V[0-9]'))})
  if($main.Count -ne 1){$cleanup.reason='Current owned document differs from saved model';return $cleanup}
  $cleanup.attempted=$true;CloseSession $Session $path $hash $true
  $cleanup.normal_exit_verified=$true;$cleanup.exit_code=$Session.process.ExitCode
  $cleanup.output_hash_preserved=((Hash $path) -ceq $hash);$cleanup.close_anchor_path=$path;$cleanup.close_anchor_sha256=$hash
 }catch{
  $cleanup.error=$_.Exception.Message
  if($Session -and $Session.process -and $Session.process.HasExited){$cleanup.process_closed=$true;$cleanup.exit_code=$Session.process.ExitCode}
 }
 return $cleanup
}
function Get-WeinviewOriginalModelBootstrap([string]$Install,[string]$Format) {
 $startupName=if($Format -ceq 'cmtp'){'template_800x480.cmtp'}else{'template_TK_800x480.emtp'}
 $startup=SafePath (Join-Path $Install ('project\'+$startupName))
 if(!(Test-Path -LiteralPath $startup -PathType Leaf)){
  $first=@(Get-ChildItem -LiteralPath (Join-Path $Install 'project') -File -Filter ('template_*.'+$Format) -ErrorAction SilentlyContinue|Sort-Object Name|Select-Object -First 1)
  if($first.Count -ne 1){throw 'Selected installation has no native New Project bootstrap template'}
  $startup=SafePath $first[0].FullName
 }
 return @{path=$startup;sha256=(Hash $startup)}
}
function New-WeinviewOriginalModelDocument($Session,$Model,[string]$Orientation,[string]$Install,[string]$Format,[string]$Prefix) {
 $picker=$null;$wizardPending=$false
 try {
  $script:stage='select_native_model'
  $Session.native.PostMenuCommand($Session.main.Hwnd,0xE100)
  $wizard=WaitFor {
   $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if(@($dialogs|Where-Object {$_.Title -cne ''}).Count){throw 'Unknown original New Project modal; preserve'}
   if($dialogs.Count -eq 1 -and $dialogs[0].Enabled){return $dialogs[0]}
  } 8
  $qt=@($Session.native.EnumChildControls($wizard.Hwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})
  if($qt.Count -ne 1){throw 'Unique original model picker root required'}
  $picker=[PLCCode.Weinview.ModelCreationControls]::new($Session.native,$Session.main.Hwnd,$wizard.Hwnd,$qt[0].Hwnd,$Session.process.Id)
  $wizardPending=$true
  $choice=$picker.Select([string]$Model.name,[string]$Model.group,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))
  $nativeName=[string]$choice.Name
  if($nativeName -cne [string]$Model.name -and $nativeName -cne [string]$Model.group){throw 'Original picker selected neither the requested model nor its installed shared-vendor group'}
  if($Model.has_display){$picker.Orientation($Orientation);$selected=@($picker.Directory()|Where-Object {$_.Name -ceq $nativeName});if($selected.Count -ne 1){throw 'Selected original model row not unique after orientation'};$choice=$picker.Read($selected[0])}
  $selectedTemplate=SafePath (Join-Path $Install ('project\'+$choice.Template))
  if([IO.Path]::GetExtension($selectedTemplate) -ine ('.'+$Format) -or !(Test-Path -LiteralPath $selectedTemplate -PathType Leaf)){throw 'Original chosen model template format differs'}
  $selectedTemplateSha=Hash $selectedTemplate
  $width=0;$height=0
  if($Model.has_display){if($choice.Template -notmatch '_([1-9][0-9]{0,4})x([1-9][0-9]{0,4})\.(?:emtp|cmtp)$'){throw 'Original model picker did not expose native display dimensions'};$width=[int]$Matches[1];$height=[int]$Matches[2];if($width -gt 8192 -or $height -gt 8192){throw 'Original model canvas outside supported window bounds'}}
  WritePrivateJson ($Prefix+'.selected.json') @{model_key=$Model.key;requested_model_name=$Model.name;native_model_name=$nativeName;choice=$choice;template_sha256=$selectedTemplateSha;width=$width;height=$height;new_project_accepted=$false}
  $Session.model_creation_close_path=$null;$Session.model_creation_close_sha256=$null
  $wizardPending=$false
  $picker.Confirm($nativeName)
  $script:stage='initialize_native_model'
  $system=WaitFor {
   $dialogs=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
   if(@($dialogs|Where-Object {$_.Hwnd -ne $wizard.Hwnd -and $_.Title -cne '系统参数设置 '}).Count){throw 'Unknown original new model initialization modal; preserve'}
   $known=@($dialogs|Where-Object {$_.Title -ceq '系统参数设置 ' -and $_.Enabled});if($known.Count -eq 1){return $known[0]}
  } 25
  $Session.native.ClickButton($system.Hwnd,1,'确定')
  $main=WaitFor {
   if(@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $null}
   @($Session.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $Session.main.Hwnd -and $_.Visible -and $_.Enabled -and $_.Title -match ': (EBProject[0-9]+)(?: -|$)'})|Select-Object -First 1
  } 8
  if($main.Title -notmatch ': (EBProject[0-9]+)(?: -|$)'){throw 'Original new project name required'}
  $Session.main=$main
  return @{choice=$choice;native_model=$nativeName;new_document=$Matches[1];selected_template=$selectedTemplate;selected_template_sha256=$selectedTemplateSha;width=$width;height=$height}
 } catch {
  $failure=$_
  if($wizardPending -and $picker){try{$picker.Cancel();$null=WaitFor {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 5;$Session.model_creation_wizard_cancelled=$true}catch{$failure.Exception.Data['wizard_cancel_error']=$_.Exception.Message}}
  throw $failure
 }
}
function Invoke-WeinviewModelCreation($Arguments,$Installation,[string]$Output) {
 . (Join-Path $PSScriptRoot 'ModelCatalog.ps1')
 . (Join-Path $PSScriptRoot 'PlcConfigurationCandidate.ps1')
 . (Join-Path $PSScriptRoot 'EditorSession.ps1')
 $model=Get-WeinviewModelProfile $Installation ([string]$Arguments.model_key)
 $orientation=if($Arguments.orientation){[string]$Arguments.orientation}else{'horizontal'}
 if($orientation -cnotin @('horizontal','vertical') -or (!$model.has_display -and $orientation -cne 'horizontal')){throw 'Supported original model orientation required'}
 $format=if($model.format){[string]$model.format}else{[IO.Path]::GetExtension($Output).TrimStart('.').ToLowerInvariant()}
 if($format -cnotin @('emtp','cmtp') -or [IO.Path]::GetExtension($Output) -ine ('.'+$format)){throw 'Selected model requires an original EMTP/CMTP project format'}
 $exe=$Installation.exe_path;$install=[IO.Path]::GetDirectoryName($exe)
 $source=Get-WeinviewOriginalModelBootstrap $install $format
 $startup=$source.path;$startupSha=$source.sha256
 $prefix=Under (Join-Path $Arguments.workspace_root ('.weinview-model-'+[guid]::NewGuid().ToString('N'))) $Arguments.workspace_root
 $bootstrap=$prefix+'.bootstrap.'+$format
 if(Test-Path -LiteralPath $bootstrap){throw 'Fresh private bootstrap required'}
 Add-Type -AssemblyName Accessibility
 Add-Type -Path @('NativeControls.cs','NativePropertyCandidate.cs','NativeSemanticControls.cs','NativeStartupRecovery.cs','ModelCreationControls.cs','ModelSaveControls.cs','WindowRibbonControls.cs'|ForEach-Object {Join-Path $PSScriptRoot $_}) -ReferencedAssemblies 'System.dll','Accessibility.dll','System.Drawing.dll'
 [IO.File]::Copy($startup,$bootstrap,$false)
 $s=$null;$creationContext=$null;$saved=$null;$startupRecovery=$null
 try {
 $creationContext=Enter-WeinviewEditorSessionContext $Arguments.workspace_root $Arguments $exe
 $nativeHostPort=Get-WeinviewNativeHostPort
 $script:stage='open_model_serializer'
 try {$s=StartOwned $exe $bootstrap $false $false $nativeHostPort $true}
 catch {
  $failedStartup=$script:pendingOwnedSession
  # Recover one observed fatal Windows callback or C++ startup exception.
  # No model selection or engineering writes have run, and the private input must
  # still match the original. An alive editor or any later failure is never replayed.
  if($script:stage -cne 'owned_document_ready' -or !$failedStartup -or !$failedStartup.process.HasExited -or $failedStartup.process.ExitCode -notin @(-1073740771,-529697949) -or (Test-Path -LiteralPath $Output) -or (Hash $bootstrap) -cne $startupSha -or (Hash $startup) -cne $startupSha){throw}
  $startupRecovery=@{failed_pid=[int]$failedStartup.process.Id;exit_code=$failedStartup.process.ExitCode;stage=$script:stage;bootstrap_unchanged=$true;engineering_operations_replayed=0;retry_count=1;startup_error_acknowledged=$failedStartup.startup_error_acknowledged}
  $script:own=@($script:own|Where-Object {$_.pid -ne $failedStartup.process.Id})
  Write-WeinviewProgress 'restart_bootstrap' '原厂启动进程已退出，正在恢复尚未载入的工程'
  $s=StartOwned $exe $bootstrap $false $false $nativeHostPort $true
 }
 SetEditSession $s $bootstrap $exe
 $s.model_creation_close_path=$bootstrap;$s.model_creation_close_sha256=$startupSha
 $new=New-WeinviewOriginalModelDocument $s $model $orientation $install $format $prefix
 $choice=$new.choice;$nativeName=[string]$new.native_model;$preset=[string]$new.new_document
 $selectedTemplate=[string]$new.selected_template;$selectedTemplateSha=[string]$new.selected_template_sha256
 $width=[int]$new.width;$height=[int]$new.height
 $s.native.PostMenuCommand($s.main.Hwnd,0xE103)
 $script:stage='native_model_save_as'
 $save=WaitFor {
  $dialogs=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($dialogs|Where-Object {$_.Title -cne '另存为'}).Count){throw 'Unknown model save modal; preserve'}
  if($dialogs.Count -ne 1 -or !$dialogs[0].Enabled){return $null}
  $edit=@($s.native.EnumChildControls($dialogs[0].Hwnd)|Where-Object {$_.Id -eq 1001 -and $_.Class -ceq 'Edit' -and $_.Visible -and $_.Enabled})
  if($edit.Count -eq 1 -and $s.native.GetControlText($edit[0].Hwnd,4096) -ceq $preset){return $dialogs[0]}
 } 8
 $filename=[PLCCode.Weinview.ModelSaveControls]::SetFilename($s.native,$save.Hwnd,$s.main.Hwnd,$Output,$preset)
 WritePrivateJson ($prefix+'.filename.json') $filename
 $s.native.ClickButton($save.Hwnd,1,'保存(&S)')
 $s.main=WaitFor {
  $dialogs=@($s.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})
  if(@($dialogs|Where-Object {$_.Hwnd -ne $save.Hwnd}).Count){throw 'Unexpected native model save outcome; preserve'}
  if($dialogs.Count -or !(Test-Path -LiteralPath $Output -PathType Leaf)){return $null}
  @($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $s.main.Hwnd -and $_.Visible -and $_.Enabled -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($Output)) -and !$_.Title.Contains('*')})|Select-Object -First 1
 } 20
 $saved=Hash $Output;$s.project_path=$Output;$s.model_creation_close_path=$Output;$s.model_creation_close_sha256=$saved
 SetEditSession $s $Output $exe
 Register-WeinviewEditorSession $creationContext $s $selectedTemplate $Output $exe $saved $request.id
 Save-WeinviewEditorSessionState $creationContext $saved
 # Inspect the saved document in its existing editor, then keep that exact
 # process registered for subsequent project_apply calls.
 $script:stage='read_created_model'
 $readback=Read-WeinviewSerializedModel $s ([pscustomobject]@{name=$nativeName;has_display=$model.has_display}) $width $height
 $readback.scope='editor_session_saved'
 WritePrivateJson ($prefix+'.model-readback.json') $readback
 . (Join-Path $PSScriptRoot 'WindowOperation.ps1');. (Join-Path $PSScriptRoot 'WindowRibbonAction.ps1')
 $windows=if($model.has_display){Read-WeinviewWindows $s}else{@{windows=@();window_set_sha256=$null}}
 if($model.has_display){$primary=@($windows.windows|Where-Object {$_.number -eq 10});if($primary.Count -ne 1 -or $primary[0].width -ne $width -or $primary[0].height -ne $height){throw 'Created original model canvas differs'}}
 if((Hash $startup) -cne $startupSha -or (Hash $bootstrap) -cne $startupSha -or (Hash $selectedTemplate) -cne $selectedTemplateSha -or (Hash $Output) -cne $saved){throw 'Native model source/output invariant failed'}
 if($s.process.HasExited){throw 'weinview_editor_session_reconciliation_required: Created editor exited after saving; no automatic restart.'}
 Complete-WeinviewEditorSession $creationContext $saved $null $null $false
 return @{output_path=$Output;output_sha256=$saved;source_sha256=$selectedTemplateSha;model_key=$model.key;requested_model_name=$model.name;model=$nativeName;series=$model.series;category=$model.category;model_catalog_sha256=(Hash (Join-Path $install 'Config.xml'));width=$width;height=$height;has_display=$model.has_display;orientation=$orientation;format=$format;native_template=$choice.Template;native_new_model_verified=$true;project_saved=$true;reopen_verified=$false;native_model_verified=$true;normal_main_exit_verified=$false;normal_reopen_exit_verified=$false;source_unchanged=$true;windows=$windows.windows;window_set_sha256=$windows.window_set_sha256;model_readback=$readback;filename_evidence=$filename;startup_recovery=$startupRecovery;project_open_attempts=$(if($startupRecovery){2}else{1});version=$Installation.version;profile='weinview-installed-native-model-v1';scope='editor_session_saved';target_readback_scope='editor_session_saved';editor_session_id=$creationContext.session_id;editor_session_active=$true;editor_session_reused=$false;editor_session_state='active';editor_session_record=$creationContext.path;editor_process=@{pid=[int]$s.process.Id;creation_utc_ticks=[long]$s.process.StartTime.ToUniversalTime().Ticks;exe_path=$exe;main_hwnd=[long]$s.main.Hwnd};project_save_count=1;project_reopen_count=0;editor_source_writes=0;own_processes=$script:own;native_evidence_path=$prefix+'.selected.json'}
 } catch {
  $creationError=$_
  $owned=$script:pendingOwnedSession
  if(!$owned -or ($owned.project_path -ine $bootstrap -and $owned.project_path -ine $Output)){$owned=$s}
 if($creationContext -and $creationContext.record){
  $cleanup=@{attempted=$false;normal_exit_verified=$false;forced=$false;reason='Saved model editor retained for reconciliation; no close or automatic restart.'}
  try{$cleanup.editor_session=Set-WeinviewEditorSessionFailure $creationContext $owned $selectedTemplate $Output $exe $saved $request.id $creationError.Exception.Message}catch{$cleanup.editor_registration_error=$_.Exception.Message}
 }else{$cleanup=Close-WeinviewModelCreationFailure $owned}
  $cleanup.new_project_wizard_cancelled=($s -and $s.model_creation_wizard_cancelled -eq $true)
  try {
   $cleanup.bootstrap_unchanged=((Hash $bootstrap) -ceq $startupSha)
   $cleanup.template_unchanged=((Hash $startup) -ceq $startupSha -and (!$selectedTemplate -or (Hash $selectedTemplate) -ceq $selectedTemplateSha))
  }catch{$cleanup.source_check_error=$_.Exception.Message}
  $creationError.Exception.Data['model_creation_failure_cleanup']=$cleanup
  throw $creationError
 } finally {if($creationContext){Exit-WeinviewEditorSessionContext $creationContext}}
}
