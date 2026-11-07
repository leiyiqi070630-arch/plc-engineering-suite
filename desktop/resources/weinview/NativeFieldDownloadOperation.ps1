# Windows PowerShell 5.1. Observed EasyDownload 6.10.02.421 controls.
# Actions: open, search_target, submit_download, status, wait, close.
# This module never claims HMI completion from a button click alone.
$script:weinviewDownloadUiType=@'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class WeinviewDownloadUi {
 public delegate bool ChildProc(IntPtr hwnd, IntPtr context);
 [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr hwnd, ChildProc callback, IntPtr context);
 [DllImport("user32.dll")] public static extern int GetDlgCtrlID(IntPtr hwnd);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd,StringBuilder text,int maximum);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd,StringBuilder text,int maximum);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern bool SetWindowText(IntPtr hwnd,string text);
 [DllImport("user32.dll")] public static extern bool IsWindowEnabled(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hwnd,uint message,IntPtr wparam,IntPtr lparam);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr hwnd,uint message,IntPtr wparam,StringBuilder lparam);
}
'@
function Initialize-WeinviewDownloadUi {
 if(-not ('WeinviewDownloadUi' -as [type])){Add-Type -TypeDefinition $script:weinviewDownloadUiType}
}
function Get-WeinviewDownloadControl([IntPtr]$Main,[int]$Id,[string]$Class,[string]$Caption='') {
 Initialize-WeinviewDownloadUi
 $matches=New-Object 'Collections.Generic.List[IntPtr]'
 $callback=[WeinviewDownloadUi+ChildProc]{param($hwnd,$context)
  if([WeinviewDownloadUi]::GetDlgCtrlID($hwnd) -ne $Id){return $true}
  $type=New-Object Text.StringBuilder 128;[void][WeinviewDownloadUi]::GetClassName($hwnd,$type,128)
  if($type.ToString() -cne $Class){return $true}
  if($Caption){$label=New-Object Text.StringBuilder 256;[void][WeinviewDownloadUi]::GetWindowText($hwnd,$label,256);if($label.ToString() -cne $Caption){return $true}}
  $matches.Add($hwnd);return $true
 }
 [void][WeinviewDownloadUi]::EnumChildWindows($Main,$callback,[IntPtr]::Zero)
 if($matches.Count -ne 1){throw "Original EasyDownload control $Id/$Class unavailable or ambiguous."}
 return $matches[0]
}
function Get-WeinviewDownloadText([IntPtr]$Hwnd) {
 $value=New-Object Text.StringBuilder 4096
 [void][WeinviewDownloadUi]::GetWindowText($Hwnd,$value,4096)
 return $value.ToString()
}
function Get-WeinviewDownloadList([IntPtr]$Hwnd) {
 $count=[WeinviewDownloadUi]::SendMessage($Hwnd,0x18B,[IntPtr]::Zero,[IntPtr]::Zero).ToInt32()
 if($count -lt 0 -or $count -gt 1024){throw 'Original EasyDownload list count unavailable.'}
 $items=@()
 for($i=0;$i -lt $count;$i++){$line=New-Object Text.StringBuilder 512;[void][WeinviewDownloadUi]::SendMessage($Hwnd,0x189,[IntPtr]$i,$line);$items+=,$line.ToString()}
 return ,$items
}
function Get-WeinviewDownloadOwned($Receipt) {
 $ownedPid=[int]$Receipt.pid;$process=Get-Process -Id $ownedPid -ErrorAction Stop
 $null=$process.Handle
 if($process.HasExited -or $process.Path -ine $Receipt.exe_path -or $process.StartTime.ToUniversalTime().Ticks -ne [long]$Receipt.start_utc_ticks -or $process.MainWindowHandle -eq 0 -or $process.MainWindowTitle -cne 'EasyDownload'){throw 'Original EasyDownload process identity changed.'}
 return $process
}
function Get-WeinviewNativeDownloadStatus($Receipt,[IntPtr]$Main) {
 $log=Get-WeinviewDownloadControl $Main 1027 'ListBox';$lines=@(Get-WeinviewDownloadList $log)
 $nativeSummary=@($lines|Where-Object {$_ -match '(?i)^download all\s*:\s*finished\s*\(\s*1 succeeded\s*,\s*0 failed\s*\)$'})
 $failed=@($lines|Where-Object {$_ -match '(?i)failed to download\s*:|^download all\s*:\s*finished\s*\(\s*\d+ succeeded\s*,\s*[1-9]\d* failed\s*\)$|(下载|download|传输|transfer).{0,60}(失败|错误|fail|error)'})
 $completed=@($nativeSummary)
 $state=if($failed.Count){'failed'}elseif($completed.Count -and $Receipt.state -ceq 'submitted'){'completed_vendor_reported'}elseif($Receipt.state -ceq 'submitted'){'running_or_unresolved'}else{$Receipt.state}
 return @{receipt=$Receipt;state=$state;native_log=$lines;completion_evidence=@($completed);failure_evidence=@($failed);device_transfer_verified=($state -ceq 'completed_vendor_reported')}
}
function Invoke-WeinviewNativeFieldDownload($Arguments,[string]$VendorDirectory) {
 $ErrorActionPreference='Stop';Initialize-WeinviewDownloadUi
 $action=[string]$Arguments.action
 if($action -ceq 'open'){
  if(@(Get-Process -Name EasyDownload -ErrorAction SilentlyContinue).Count){throw 'An EasyDownload session already exists.'}
  $nativeDirectory=[bool]$Arguments.native_download_directory
  if($nativeDirectory){
   $artifact=[IO.Path]::GetFullPath([string]$Arguments.native_download_directory)
   if(!(Test-Path -LiteralPath $artifact -PathType Container)){throw 'Existing original download data directory required.'}
   $seriesName=[string]$Arguments.series
   if(!$seriesName -or $seriesName -match '[\x00-\x1f]'){throw 'Exact original non-cMT Series required.'}
   $expected=$null
  }else{
   $artifact=Assert-WeinviewHandoffPath ([string]$Arguments.cxob_path) $true
   if([IO.Path]::GetExtension($artifact) -ine '.cxob' -or (Get-Item -LiteralPath $artifact).Length -le 0){throw 'Existing nonempty vendor CXOB required.'}
   $expected=[string]$Arguments.expected_cxob_sha256
   if($expected -cnotmatch '^[0-9A-Fa-f]{64}$' -or (Get-WeinviewHandoffHash $artifact) -ine $expected){throw 'CXOB SHA256 differs.'}
   $seriesName='cMT Series'
  }
  $vendor=[IO.Path]::GetFullPath($VendorDirectory);$exe=Join-Path $vendor 'EasyDownload.exe'
  if(!(Test-Path -LiteralPath $exe -PathType Leaf) -or (Get-AuthenticodeSignature -LiteralPath $exe).Status -ne 'Valid'){throw 'Signed installed EasyDownload required.'}
  $process=Start-Process -FilePath $exe -WorkingDirectory $vendor -WindowStyle Hidden -PassThru
  $ownedTicks=$process.StartTime.ToUniversalTime().Ticks
  try {
  $deadline=[DateTime]::UtcNow.AddSeconds(15)
  do{$process.Refresh();if($process.MainWindowHandle -ne 0 -and $process.MainWindowTitle -ceq 'EasyDownload'){break};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline)
  if($process.MainWindowHandle -eq 0 -or $process.MainWindowTitle -cne 'EasyDownload'){throw 'Original EasyDownload main window unavailable.'}
  $main=[IntPtr]$process.MainWindowHandle
  $series=Get-WeinviewDownloadControl $main 1098 'ComboBox'
  $count=[WeinviewDownloadUi]::SendMessage($series,0x146,[IntPtr]::Zero,[IntPtr]::Zero).ToInt32();$seriesIndex=-1
  for($i=0;$i -lt $count;$i++){$name=New-Object Text.StringBuilder 128;[void][WeinviewDownloadUi]::SendMessage($series,0x148,[IntPtr]$i,$name);if($name.ToString() -ceq $seriesName){if($seriesIndex -ge 0){throw 'Original Series entry ambiguous.'};$seriesIndex=$i}}
  if($seriesIndex -lt 0){throw 'Original Series entry unavailable.'}
  [void][WeinviewDownloadUi]::SendMessage($series,0x14E,[IntPtr]$seriesIndex,[IntPtr]::Zero)
  [void][WeinviewDownloadUi]::SendMessage($main,0x111,[IntPtr]((1 -shl 16)-bor 1098),$series)
  $folder=Get-WeinviewDownloadControl $main 1020 'Edit'
  if(-not [WeinviewDownloadUi]::SetWindowText($folder,$artifact) -or (Get-WeinviewDownloadText $folder) -cne $artifact){throw 'Original download source path readback differs.'}
  $receipt=@{schema=1;kind='weinview-owned-easydownload';pid=$process.Id;exe_path=$exe;start_utc_ticks=$process.StartTime.ToUniversalTime().Ticks;source_kind=if($nativeDirectory){'native_directory'}else{'cxob'};series=$seriesName;cxob_path=if($nativeDirectory){$null}else{$artifact};cxob_sha256=if($nativeDirectory){$null}else{$expected.ToUpperInvariant()};native_download_directory=if($nativeDirectory){$artifact}else{$null};state='configured';target_ip=$null;device_transfer_verified=$false}
  return $receipt
  } catch {
   $failure=$_
   $process.Refresh()
   if(-not $process.HasExited -and $process.Path -ieq $exe -and $process.StartTime.ToUniversalTime().Ticks -eq $ownedTicks){[void]$process.CloseMainWindow();[void]$process.WaitForExit(10000)}
   throw $failure
  }
 }
 $receipt=$Arguments.receipt
 if($receipt.kind -cne 'weinview-owned-easydownload' -or $receipt.schema -ne 1){throw 'Owned EasyDownload receipt required.'}
 $process=Get-WeinviewDownloadOwned $receipt;$main=[IntPtr]$process.MainWindowHandle
 if($action -ceq 'close'){
  $prior=if($receipt.state -ceq 'submitted'){Get-WeinviewNativeDownloadStatus $receipt $main}else{$null}
  [void]$process.CloseMainWindow();$null=$process.WaitForExit(10000)
  return @{closed=$process.HasExited;last_native_status=$prior;device_transfer_verified=($prior -and $prior.device_transfer_verified)}
 }
 $folder=Get-WeinviewDownloadControl $main 1020 'Edit'
 if($receipt.source_kind -ceq 'native_directory'){
  if((Get-WeinviewDownloadText $folder) -cne $receipt.native_download_directory -or !(Test-Path -LiteralPath ([string]$receipt.native_download_directory) -PathType Container)){throw 'Configured original download directory changed.'}
 }elseif((Get-WeinviewDownloadText $folder) -cne $receipt.cxob_path -or (Get-WeinviewHandoffHash $receipt.cxob_path) -ine $receipt.cxob_sha256){throw 'Configured CXOB changed.'}
 if($action -ceq 'search_target'){
  $ip=[string]$Arguments.target_ip
  $address=[Net.IPAddress]::None
  if(-not [Net.IPAddress]::TryParse($ip,[ref]$address) -or $address.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork -or $ip -cne $address.ToString()){throw 'Canonical IPv4 HMI address required.'}
  $field=Get-WeinviewDownloadControl $main 1001 'Edit';if(-not [WeinviewDownloadUi]::SetWindowText($field,$ip)){throw 'HMI IP field unavailable.'}
  if((Get-WeinviewDownloadText $field) -cne $ip){throw 'HMI IP readback differs.'}
  $search=Get-WeinviewDownloadControl $main 9001 'Button' '搜寻(&S)'
  [void][WeinviewDownloadUi]::SendMessage($search,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $list=Get-WeinviewDownloadControl $main 9003 'ListBox';$deadline=[DateTime]::UtcNow.AddSeconds(8);$rows=@()
  do{$rows=@(Get-WeinviewDownloadList $list);if(@($rows|Where-Object {$_ -ceq $ip -or $_.StartsWith($ip+' (',[StringComparison]::Ordinal)}).Count -eq 1){break};Start-Sleep -Milliseconds 200}while([DateTime]::UtcNow -lt $deadline)
  $matches=@($rows|Where-Object {$_ -ceq $ip -or $_.StartsWith($ip+' (',[StringComparison]::Ordinal)})
  if($matches.Count -ne 1){throw 'Exact HMI IP not discovered by original EasyDownload.'}
  $index=[Array]::IndexOf($rows,$matches[0]);[void][WeinviewDownloadUi]::SendMessage($list,0x186,[IntPtr]$index,[IntPtr]::Zero)
  $add=Get-WeinviewDownloadControl $main 1004 'Button' '新增';[void][WeinviewDownloadUi]::SendMessage($add,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $dest=Get-WeinviewDownloadControl $main 1025 'ListBox';$destinations=@(Get-WeinviewDownloadList $dest)
  if(@($destinations|Where-Object {$_ -ceq $ip -or $_.StartsWith($ip+' (',[StringComparison]::Ordinal)}).Count -ne 1){throw 'Exact target was not added to original destination list.'}
  $receipt.target_ip=$ip;$receipt.state='target_selected'
  return $receipt
 }
 if($action -ceq 'submit_download'){
  if($receipt.state -cne 'target_selected' -or !$receipt.target_ip){throw 'Original discovered HMI target required.'}
  $dest=Get-WeinviewDownloadControl $main 1025 'ListBox';$targets=@(Get-WeinviewDownloadList $dest)
  if($targets.Count -ne 1 -or !($targets[0] -ceq $receipt.target_ip -or $targets[0].StartsWith($receipt.target_ip+' (',[StringComparison]::Ordinal))){throw 'Single exact HMI destination required.'}
  $button=Get-WeinviewDownloadControl $main 1002 'Button' '下载'
  if(-not [WeinviewDownloadUi]::IsWindowEnabled($button)){throw 'Original download action disabled.'}
  [void][WeinviewDownloadUi]::SendMessage($button,0xF5,[IntPtr]::Zero,[IntPtr]::Zero)
  $receipt.state='submitted';$receipt.submitted_utc=[DateTime]::UtcNow.ToString('o')
  return $receipt
 }
 if($action -ceq 'status' -or $action -ceq 'wait'){
  $deadline=[DateTime]::UtcNow.AddSeconds($(if($action -ceq 'wait'){[Math]::Min(60,[Math]::Max(1,[int]$Arguments.timeout_seconds))}else{0}))
  do {
   $result=Get-WeinviewNativeDownloadStatus $receipt $main
   if($result.state -in @('failed','completed_vendor_reported') -or $action -ceq 'status' -or [DateTime]::UtcNow -ge $deadline){return $result}
   Start-Sleep -Milliseconds 500
  } while($true)
 }
 throw 'Unknown original EasyDownload action.'
}
