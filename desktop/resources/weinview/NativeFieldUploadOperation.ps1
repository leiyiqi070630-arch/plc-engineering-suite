# Windows PowerShell 5.1. Owned EasyBuilder Pro upload sessions use the native
# New Project model picker and F8 upload dialog. Earlier Utility receipts keep
# their original control layout for status, stop, and close.
$script:weinviewUploadUiType=@'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using Accessibility;
public static class WeinviewUploadUi {
 public delegate bool WindowProc(IntPtr hwnd, IntPtr context);
 [DllImport("user32.dll")] public static extern bool EnumWindows(WindowProc callback, IntPtr context);
 [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr hwnd, WindowProc callback, IntPtr context);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
 [DllImport("user32.dll")] public static extern int GetDlgCtrlID(IntPtr hwnd);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder text, int maximum);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int maximum);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern bool IsWindowEnabled(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hwnd,uint message,IntPtr wparam,IntPtr lparam);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern bool SetWindowText(IntPtr hwnd, string text);
 [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wparam, IntPtr lparam);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wparam, StringBuilder lparam);
 [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible value);
 [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int obtained);
 sealed class NetworkTab { public IAccessible Accessible; public object Child; public int State; }
 static NetworkTab FindNetworkTab(IntPtr hwnd,string exactName) {
  var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
  int hr=AccessibleObjectFromWindow(hwnd,0xFFFFFFFC,ref iid,out root);
  if(hr<0)Marshal.ThrowExceptionForHR(hr);
  if(root==null||Convert.ToInt32(root.get_accRole(0))!=60)throw new InvalidOperationException("Original upload tab root changed.");
  int count=root.accChildCount;
  if(count<1||count>32)throw new InvalidOperationException("Original upload tab count changed.");
  var children=new object[count];int obtained;
  hr=AccessibleChildren(root,0,count,children,out obtained);
  if(hr<0)Marshal.ThrowExceptionForHR(hr);
  if(obtained!=count)throw new InvalidOperationException("Original upload tab children incomplete.");
  NetworkTab match=null;
  foreach(object item in children){
   IAccessible node=item as IAccessible;object child=0;
   if(node==null){if(!(item is int))throw new InvalidOperationException("Original upload tab child changed.");node=root;child=item;}
   if(Convert.ToInt32(node.get_accRole(child))!=37||node.get_accName(child)!=exactName)continue;
   if(match!=null)throw new InvalidOperationException("Original upload tab name ambiguous.");
   match=new NetworkTab{Accessible=node,Child=child,State=Convert.ToInt32(node.get_accState(child))};
  }
  if(match==null)throw new InvalidOperationException("Exact original upload tab unavailable.");
  return match;
 }
 public static bool SelectNetworkTab(IntPtr hwnd,int pid,string exactName) {
  uint actualPid;
  if(hwnd==IntPtr.Zero||pid<=0||String.IsNullOrEmpty(exactName)||!IsWindowVisible(hwnd)||GetWindowThreadProcessId(hwnd,out actualPid)==0||actualPid!=(uint)pid)throw new InvalidOperationException("Visible owned upload tab required.");
  var tab=FindNetworkTab(hwnd,exactName);
  if((tab.State&0x8001)!=0)throw new InvalidOperationException("Original upload tab unavailable.");
  if((tab.State&2)==0){
   if(tab.Accessible.get_accDefaultAction(tab.Child)!="Switch")throw new InvalidOperationException("Original upload tab action changed.");
   tab.Accessible.accDoDefaultAction(tab.Child);
  }
  if((FindNetworkTab(hwnd,exactName).State&2)==0)throw new InvalidOperationException("Original upload tab selection did not stick.");
  return true;
 }
}
'@
function Initialize-WeinviewUploadUi {
 if(-not ('WeinviewUploadUi' -as [type])){Add-Type -TypeDefinition $script:weinviewUploadUiType -ReferencedAssemblies 'System.dll','Accessibility.dll'}
}
function Get-WeinviewUploadOwned($Receipt) {
 if($Receipt.kind -cnotin @('weinview-owned-utility-upload','weinview-owned-native-upload') -or $Receipt.schema -ne 1){throw 'Original Utility Manager upload receipt required.'}
 $ownedPid=[int]$Receipt.pid
 $process=Get-Process -Id $ownedPid -ErrorAction Stop
 $null=$process.Handle
 if($process.HasExited -or $process.Path -ine $Receipt.exe_path -or $process.StartTime.ToUniversalTime().Ticks -ne [long]$Receipt.start_utc_ticks -or $process.MainWindowHandle -eq 0){throw 'Original upload process identity changed.'}
 return $process
}
function Get-WeinviewUploadChildren([IntPtr]$Parent) {
 Initialize-WeinviewUploadUi
 $rows=New-Object 'Collections.Generic.List[object]'
 $callback=[WeinviewUploadUi+WindowProc]{param($hwnd,$context)
  $name=New-Object Text.StringBuilder 128
  [void][WeinviewUploadUi]::GetClassName($hwnd,$name,128)
  $rows.Add([pscustomobject]@{hwnd=$hwnd;id=[WeinviewUploadUi]::GetDlgCtrlID($hwnd);class=$name.ToString()})
  return $true
 }
 [void][WeinviewUploadUi]::EnumChildWindows($Parent,$callback,[IntPtr]::Zero)
 return @($rows.ToArray())
}
function Get-WeinviewUploadDialog($Receipt) {
 if($Receipt.backend -ceq 'easybuilder-editor'){
  if(!$Receipt.upload_dialog_opened){throw 'Owned Editor upload dialog must be opened first.'}
 }elseif(!$Receipt.transfer_upload_shortcut_clicked){throw 'Original Transfer/Upload Shortcut must be opened first.'}
 $process=Get-WeinviewUploadOwned $Receipt
 Initialize-WeinviewUploadUi
 $matches=New-Object 'Collections.Generic.List[IntPtr]'
 $callback=[WeinviewUploadUi+WindowProc]{param($hwnd,$context)
  [uint32]$windowPid=0
  [void][WeinviewUploadUi]::GetWindowThreadProcessId($hwnd,[ref]$windowPid)
  if($windowPid -ne [uint32]$process.Id -or -not [WeinviewUploadUi]::IsWindowVisible($hwnd)){return $true}
  $ids=@(Get-WeinviewUploadChildren $hwnd | ForEach-Object {$_.id})
  $required=if($Receipt.backend -ceq 'easybuilder-editor'){@(2662,1301,1002,1508,1025)}else{@(1018,1020,1045,1002,3,1025,1026)}
  if(@($required | Where-Object {$_ -notin $ids}).Count -eq 0){$matches.Add($hwnd)}
  return $true
 }
 [void][WeinviewUploadUi]::EnumWindows($callback,[IntPtr]::Zero)
 if($matches.Count -ne 1){throw 'Unique original cMT upload dialog unavailable.'}
 if($Receipt.backend -ceq 'easybuilder-editor'){
  if($matches[0].ToInt64() -ne [long]$Receipt.dialog_hwnd -or (Get-WeinviewUploadText $matches[0]) -cne '上传 (HMI->PC)'){throw 'Owned Editor upload dialog identity changed.'}
 }
 return $matches[0]
}
function Get-WeinviewUploadControl([IntPtr]$Dialog,[int]$Id,[string]$Class='') {
 $rows=@(Get-WeinviewUploadChildren $Dialog | Where-Object {$_.id -eq $Id -and (!$Class -or $_.class -ceq $Class)})
 if($rows.Count -ne 1){throw "Original upload control $Id unavailable or ambiguous."}
 return [IntPtr]$rows[0].hwnd
}
function Get-WeinviewVisibleUploadControl([IntPtr]$Dialog,[int]$Id,[string]$Class='') {
 $rows=@(Get-WeinviewUploadChildren $Dialog | Where-Object {$_.id -eq $Id -and (!$Class -or $_.class -ceq $Class) -and [WeinviewUploadUi]::IsWindowVisible([IntPtr]$_.hwnd)})
 if($rows.Count -ne 1){throw "Visible original upload control $Id unavailable or ambiguous."}
 return [IntPtr]$rows[0].hwnd
}
function Get-WeinviewUploadText([IntPtr]$Control) {
 $value=New-Object Text.StringBuilder 4096
 [void][WeinviewUploadUi]::GetWindowText($Control,$value,4096)
 return $value.ToString()
}
function Get-WeinviewUploadList([IntPtr]$Control) {
 $count=[WeinviewUploadUi]::SendMessage($Control,0x18B,[IntPtr]::Zero,[IntPtr]::Zero).ToInt32()
 if($count -lt 0 -or $count -gt 1024){throw 'Original upload list count unavailable.'}
 $lines=@()
 for($i=0;$i -lt $count;$i++){$line=New-Object Text.StringBuilder 512;[void][WeinviewUploadUi]::SendMessage($Control,0x189,[IntPtr]$i,$line);$lines+=,$line.ToString()}
 return ,$lines
}
function Assert-WeinviewUploadTarget([string]$TargetIp) {
 $address=[Net.IPAddress]::None
 if(-not [Net.IPAddress]::TryParse($TargetIp,[ref]$address) -or $address.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork -or $TargetIp -cne $address.ToString()){throw 'Canonical target HMI IPv4 required.'}
 return $TargetIp
}
function Assert-WeinviewUploadOutput([string]$Path) {
 $output=Assert-WeinviewHandoffPath $Path $false
 if([IO.Path]::GetExtension($output) -ine '.cxob' -or !(Test-Path -LiteralPath ([IO.Path]::GetDirectoryName($output)) -PathType Container)){throw 'Fresh CXOB output in an existing directory required.'}
 return $output
}
function Close-WeinviewOwnedUploadShell($Receipt) {
 if($Receipt.state -in @('submitted','running_or_unresolved')){throw 'Observe or stop the original upload before closing the session.'}
 $process=Get-WeinviewUploadOwned $Receipt
 [void]$process.CloseMainWindow();[void]$process.WaitForExit(10000)
 return @{closed=$process.HasExited;last_state=$Receipt.state;device_transfer_verified=$false}
}
function Close-WeinviewOwnedUploadEditor($Receipt) {
 $process=Get-WeinviewUploadOwned $Receipt
 if($Receipt.backend -cne 'easybuilder-editor' -or [string]::IsNullOrWhiteSpace([string]$Receipt.new_document) -or [string]$Receipt.new_document -cnotmatch '^EBProject[0-9]+$'){throw 'Exact unsaved Editor document identity required.'}
 if((Hash ([string]$Receipt.bootstrap_path)) -cne [string]$Receipt.bootstrap_sha256){throw 'Private Editor bootstrap changed; preserve session.'}
 $native=New-Object PLCCode.Weinview.NativeControls($process.Id,[long]$Receipt.start_utc_ticks,[string]$Receipt.exe_path,1500)
 $main=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq [long]$Receipt.main_hwnd -and $_.Visible -and $_.Class -ceq 'EasyBuilderPro' -and $_.Title -ceq [string]$Receipt.main_title -and $_.Title -match (': '+[regex]::Escape([string]$Receipt.new_document)+'(?: -|$)')})
 if($main.Count -ne 1 -or !($main[0].Enabled)){throw 'Owned unsaved Editor main window changed; preserve session.'}
 $views=@($native.EnumChildControls($main[0].Hwnd)|Where-Object {$_.Hwnd -eq [long]$Receipt.document_view_hwnd -and $_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible})
 if($views.Count -ne 1){throw 'Owned unsaved Editor document view changed; preserve session.'}
 if(@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){throw 'Unexpected Editor modal before normal close; preserve session.'}
 $native.CloseMainWindow($main[0].Hwnd)
 $acknowledged=$false;$promptHwnd=0;$deadline=[DateTime]::UtcNow.AddSeconds(15)
 while(!$process.WaitForExit(150)){
  if($process.WaitForExit(0)){break}
  try{$dialogs=@($native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'})}
  catch{if($process.WaitForExit(1000)){break};throw}
  if($process.WaitForExit(0)){break}
  if($dialogs.Count){
   if($dialogs.Count -ne 1 -or $dialogs[0].Title -cne 'EasyBuilder Pro' -or ($acknowledged -and $dialogs[0].Hwnd -ne $promptHwnd)){throw 'Unknown Editor close prompt; preserve session.'}
   if(!$acknowledged){
    $body=$native.FindUniqueControlWithoutLabel($dialogs[0].Hwnd,65535,'Static')
    $expected='是否保存对 '+[string]$Receipt.new_document+' 的更改?'
    if($native.GetControlText($body.Hwnd,4096) -cne $expected -or (Hash ([string]$Receipt.bootstrap_path)) -cne [string]$Receipt.bootstrap_sha256){throw 'Unsaved Editor close prompt differs; preserve session.'}
    $native.ClickButton($dialogs[0].Hwnd,7,'否(&N)');$acknowledged=$true;$promptHwnd=$dialogs[0].Hwnd
   }
  }
  if([DateTime]::UtcNow -ge $deadline){throw 'Owned Editor did not exit after normal close; reconcile session.'}
 }
 if((Hash ([string]$Receipt.bootstrap_path)) -cne [string]$Receipt.bootstrap_sha256){throw 'Private Editor bootstrap changed during close.'}
 return @{closed=$true;normal_exit_verified=($process.ExitCode -eq 0);process_exit_code=$process.ExitCode;discarded_document=$Receipt.new_document;source_unchanged=$true}
}
function Get-WeinviewNativeUploadStatus($Receipt,[IntPtr]$Dialog) {
 $log=Get-WeinviewUploadControl $Dialog 1025 'ListBox'
 $lines=@(Get-WeinviewUploadList $log)
 $summaryPattern='(?i)^upload all\s*:\s*finished\s*\(\s*(\d+)\s+succeeded\s*,\s*(\d+)\s+failed\s*\)$'
 $failed=@($lines | Where-Object {
  if($_ -match $summaryPattern){[int]$Matches[2] -gt 0}
  else{$_ -match '(?i)(upload|上传|传输).{0,70}(fail|error|失败|错误)|failed\s*:\s*[1-9]|(fail|error|失败|错误).{0,70}(upload|上传|传输)'}
 })
 $stopped=@($lines | Where-Object {$_ -match '(?i)(upload|上传|传输).{0,70}(stop|cancel|中止|取消|停止)'})
 $success=@($lines | Where-Object {
  if($_ -match $summaryPattern){[int]$Matches[1] -eq 1 -and [int]$Matches[2] -eq 0}
  else{$_ -match '(?i)^上传.{0,70}(?:成功|完成)[!！。\s]*$'}
 })
 $state=[string]$Receipt.state
 $hash=$null
 $hasOutput=($Receipt.cxob_path -and (Test-Path -LiteralPath $Receipt.cxob_path -PathType Leaf) -and (Get-Item -LiteralPath $Receipt.cxob_path).Length -gt 0)
 if($state -in @('submitted','running_or_unresolved','stopped_requested')) {
  if($failed.Count){$state='failed'}
  elseif($stopped.Count){$state='stopped_vendor_reported'}
  elseif($success.Count -and $hasOutput){
   $hash=Get-WeinviewHandoffHash $Receipt.cxob_path
   $state='completed'
  }else{$state='running_or_unresolved'}
 }
 if($state -ceq 'completed'){
  if($failed.Count){$state='failed'}
  elseif(!$success.Count -or !$hasOutput){$state='running_or_unresolved'}
  elseif(!$hash){$hash=[string]$Receipt.cxob_sha256;if(!$hash){throw 'Completed native upload receipt is missing CXOB SHA256.'}}
 }
 $Receipt.state=$state
 if($state -ceq 'completed'){$Receipt.cxob_sha256=$hash}
 $Receipt.device_transfer_verified=($state -ceq 'completed')
 return @{receipt=$Receipt;state=$state;native_log=$lines;completion_evidence=$success;failure_evidence=$failed;stop_evidence=$stopped;cxob_path=$Receipt.cxob_path;cxob_sha256=$hash;target_ip=$Receipt.target_ip;native_upload_performed=($Receipt.native_upload_performed -eq $true);device_transfer_verified=($state -ceq 'completed');next_tool=$(if($state -ceq 'completed'){'weinview_field_handoff'}else{$null});next_action=$(if($state -ceq 'completed'){'accept_upload'}else{$null});after_accept_tool=$(if($state -ceq 'completed'){'weinview_project_recover'}else{$null})}
}
function Invoke-WeinviewNativeFieldUpload($Arguments,$Installation) {
 $ErrorActionPreference='Stop'
 Initialize-WeinviewUploadUi
 $action=[string]$Arguments.action
 if($action -ceq 'open') {
  if(!$Installation -or !$Arguments.model_key){throw 'field_upload open requires model_key from weinview_discover and a selected installation.'}
  . (Join-Path $PSScriptRoot 'ModelCatalog.ps1')
  . (Join-Path $PSScriptRoot 'ModelCreationOperation.ps1')
  . (Join-Path $PSScriptRoot 'NativeProjectRecoveryOperation.ps1')
  $model=Get-WeinviewModelProfile $Installation ([string]$Arguments.model_key)
  if([string]$model.format -cne 'cmtp'){throw 'field_upload currently supports cMT/CXOB models with original CMTP format only; this model format is not supported.'}
  if(([string]$model.series -cnotmatch '^cMT') -and ([string]$model.category -cnotmatch '^cMT')){throw 'field_upload currently supports original cMT/CXOB models only.'}
  $root=Workspace ([string]$Arguments.workspace_root)
  $output=Assert-WeinviewUploadOutput ([string]$Arguments.cxob_path)
  $output=Under $output $root
  $exe=[string]$Installation.exe_path;$install=[IO.Path]::GetDirectoryName($exe)
  $source=Get-WeinviewOriginalModelBootstrap $install 'cmtp'
  $startup=$source.path;$startupSha=$source.sha256
  $prefix=Under (Join-Path $root ('.weinview-upload-'+[guid]::NewGuid().ToString('N'))) $root
  $bootstrap=$prefix+'.bootstrap.cmtp'
  [IO.File]::Copy($startup,$bootstrap,$false)
  $s=$null;$dialog=$null;$receipt=$null
  try {
   $script:stage='upload_open_model_editor'
   $s=StartOwned $exe $bootstrap $false $true
   SetEditSession $s $bootstrap $exe
   $s.model_creation_close_path=$bootstrap;$s.model_creation_close_sha256=$startupSha
   $new=New-WeinviewOriginalModelDocument $s $model 'horizontal' $install 'cmtp' $prefix
   $views=@($s.native.EnumChildControls($s.main.Hwnd)|Where-Object {$_.Id -eq 59665 -and $_.Class -ceq 'AfxFrameOrView140u' -and $_.Visible})
   if($views.Count -ne 1){throw 'Unique newly created Editor document view required.'}
   $script:stage='upload_open_native_dialog'
   $entry=Open-WeinviewNativeUploadDialog $s $prefix
   $dialog=$entry.dialog
   $receipt=@{schema=1;kind='weinview-owned-native-upload';backend='easybuilder-editor';pid=$s.process.Id;exe_path=$exe;start_utc_ticks=$s.process.StartTime.ToUniversalTime().Ticks.ToString();main_hwnd=[long]$s.main.Hwnd;main_title=[string]$s.main.Title;document_view_hwnd=[long]$views[0].Hwnd;dialog_hwnd=[long]$dialog.Hwnd;upload_dialog_opened=$true;model_key=$model.key;native_model=[string]$new.native_model;new_document=[string]$new.new_document;bootstrap_path=$bootstrap;bootstrap_sha256=$startupSha;source_template_path=$startup;source_template_sha256=$startupSha;state='configured';cxob_path=$output;target_ip=$null;native_upload_performed=$false;device_transfer_verified=$false}
   $field=Get-WeinviewUploadControl ([IntPtr]$dialog.Hwnd) 2662 'Edit'
   if(-not [WeinviewUploadUi]::SetWindowText($field,$output) -or (Get-WeinviewUploadText $field) -cne $output){throw 'Original CXOB output readback differs.'}
   $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($s.process.Id,$s.process.StartTime.ToUniversalTime().Ticks,$exe)
   $combo=Get-WeinviewUploadControl ([IntPtr]$dialog.Hwnd) 1301 'ComboBox'
   $selected=[string]$property.ComboSelected($combo)
   if($selected -cne [string]$new.native_model){throw 'Original upload model selection differs from the newly created document.'}
   $receipt.model_selected_readback=$selected
   $receipt.entry_method=$entry.entry_method
   if((Hash $startup) -cne $startupSha -or (Hash $bootstrap) -cne $startupSha){throw 'Original upload model bootstrap changed.'}
   return $receipt
  } catch {
   $failure=$_
   if($receipt -and $dialog){try{$s.native.ClickButton($dialog.Hwnd,2,'关闭');$null=WaitFor {if(!@($s.native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $dialog.Hwnd}).Count){return $true}} 5;$cleanup=Close-WeinviewOwnedUploadEditor $receipt;$failure.Exception.Data['upload_open_cleanup']=$cleanup}catch{$failure.Exception.Data['upload_open_cleanup_error']=$_.Exception.Message}}
   elseif($s){$failure.Exception.Data['upload_open_cleanup']=Close-WeinviewModelCreationFailure $s}
   throw $failure
  }
 }
 $receipt=$Arguments.receipt
 if(!$receipt -or $receipt.kind -cne 'weinview-owned-native-upload' -or $receipt.schema -ne 1){throw 'Owned original cMT Upload receipt required.'}
 $process=Get-WeinviewUploadOwned $receipt
 $dialog=Get-WeinviewUploadDialog $receipt
 $editor=($receipt.backend -ceq 'easybuilder-editor')
 $field=Get-WeinviewUploadControl $dialog $(if($editor){2662}else{1020}) 'Edit'
 if((Get-WeinviewUploadText $field) -cne $receipt.cxob_path){throw 'Configured CXOB output changed.'}
 if($editor){
  $property=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($process.Id,$process.StartTime.ToUniversalTime().Ticks,[string]$receipt.exe_path)
  $combo=Get-WeinviewUploadControl $dialog 1301 'ComboBox'
  if([string]$property.ComboSelected($combo) -cne [string]$receipt.native_model){throw 'Configured original upload model changed.'}
 }
 if($action -ceq 'search_target') {
  if($receipt.state -cne 'configured'){throw 'Original upload must be configured before target search.'}
  $ip=Assert-WeinviewUploadTarget ([string]$Arguments.target_ip)
  $tab=@(Get-WeinviewUploadChildren $dialog | Where-Object {$_.class -like 'BCGPTabWnd:*'})
  if($tab.Count -ne 1){throw 'Original Upload network tabs unavailable.'}
  [void][WeinviewUploadUi]::SelectNetworkTab([IntPtr]$tab[0].hwnd,[int]$process.Id,'HMI 名称')
  $address=Get-WeinviewVisibleUploadControl $dialog 1001 'Edit'
  if(-not [WeinviewUploadUi]::SetWindowText($address,$ip) -or (Get-WeinviewUploadText $address) -cne $ip){throw 'Original HMI IP readback differs.'}
  $search=Get-WeinviewVisibleUploadControl $dialog 9001 'Button'
  [void][WeinviewUploadUi]::SendMessage($search,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $list=Get-WeinviewVisibleUploadControl $dialog 9003 'ListBox'
  $deadline=[DateTime]::UtcNow.AddSeconds(8)
  do{$rows=@(Get-WeinviewUploadList $list);$matches=@($rows|Where-Object {$_ -ceq $ip -or $_.StartsWith($ip+' (',[StringComparison]::Ordinal)});if($matches.Count -eq 1){break};Start-Sleep -Milliseconds 200}while([DateTime]::UtcNow -lt $deadline)
  if($matches.Count -ne 1){throw 'Exact HMI IP not discovered by original upload dialog.'}
  $index=[Array]::IndexOf($rows,$matches[0])
  [void][WeinviewUploadUi]::SendMessage($list,0x186,[IntPtr]$index,[IntPtr]::Zero)
  if([WeinviewUploadUi]::SendMessage($list,0x188,[IntPtr]::Zero,[IntPtr]::Zero).ToInt32() -ne $index){throw 'Original HMI target selection did not stick.'}
  $receipt.target_ip=$ip;$receipt.state='target_selected'
  return $receipt
 }
 if($action -ceq 'submit_upload') {
  if($receipt.state -cne 'target_selected' -or !$receipt.target_ip){throw 'Original discovered HMI target required.'}
  if(Test-Path -LiteralPath $receipt.cxob_path){throw 'Fresh CXOB output required at submission.'}
  $list=Get-WeinviewVisibleUploadControl $dialog 9003 'ListBox'
  $selected=[WeinviewUploadUi]::SendMessage($list,0x188,[IntPtr]::Zero,[IntPtr]::Zero).ToInt32()
  $rows=@(Get-WeinviewUploadList $list)
  if($selected -lt 0 -or $selected -ge $rows.Count -or !($rows[$selected] -ceq $receipt.target_ip -or $rows[$selected].StartsWith($receipt.target_ip+' (',[StringComparison]::Ordinal))){throw 'Single exact original HMI target selection required.'}
  $button=Get-WeinviewUploadControl $dialog 1002 'Button'
  if(-not [WeinviewUploadUi]::IsWindowEnabled($button)){throw 'Original upload action disabled.'}
  [void][WeinviewUploadUi]::SendMessage($button,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $receipt.state='submitted';$receipt.native_upload_performed=$true;$receipt.submitted_utc=[DateTime]::UtcNow.ToString('o')
  return $receipt
 }
 if($action -in @('status','wait')) {
  $deadline=[DateTime]::UtcNow.AddSeconds($(if($action -ceq 'wait'){[Math]::Min(60,[Math]::Max(1,[int]$Arguments.timeout_seconds))}else{0}))
  do {$result=Get-WeinviewNativeUploadStatus $receipt $dialog;if($result.state -in @('completed','failed','stopped_vendor_reported') -or $action -ceq 'status' -or [DateTime]::UtcNow -ge $deadline){return $result};Start-Sleep -Milliseconds 500} while($true)
 }
 if($action -ceq 'stop') {
  if($receipt.state -notin @('submitted','running_or_unresolved')){throw 'No active original upload to stop.'}
  $button=Get-WeinviewUploadControl $dialog $(if($editor){1508}else{3}) 'Button'
  if(-not [WeinviewUploadUi]::IsWindowEnabled($button)){throw 'Original stop action disabled.'}
  [void][WeinviewUploadUi]::SendMessage($button,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $receipt.state='stopped_requested'
  return Get-WeinviewNativeUploadStatus $receipt $dialog
 }
 if($action -ceq 'close') {
  $observed=Get-WeinviewNativeUploadStatus $receipt $dialog
  if($receipt.native_upload_performed -and $observed.state -notin @('completed','failed','stopped_vendor_reported')){throw 'Original upload is unresolved; retain session and query or stop it.'}
  $leave=Get-WeinviewUploadControl $dialog 2 'Button'
  [void][WeinviewUploadUi]::SendMessage($leave,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  if($editor){
   $ownedNative=New-Object PLCCode.Weinview.NativeControls($process.Id,[long]$receipt.start_utc_ticks,[string]$receipt.exe_path,1500)
   $null=WaitFor {if(!@($ownedNative.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){return $true}} 5
  }else{Start-Sleep -Milliseconds 300}
  $receipt.state=$observed.state
  if($editor){$closed=Close-WeinviewOwnedUploadEditor $receipt}
  else{$receipt.kind='weinview-owned-utility-upload';$closed=Close-WeinviewOwnedUploadShell $receipt}
  return @{closed=$closed.closed;normal_exit_verified=$closed.normal_exit_verified;last_native_status=$observed;cxob_path=$observed.cxob_path;cxob_sha256=$observed.cxob_sha256;device_transfer_verified=$observed.device_transfer_verified}
 }
 throw 'Unknown original cMT upload action.'
}
