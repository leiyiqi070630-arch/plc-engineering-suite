# Internal 421 Chinese offline PLC device operation. No startup on load.
# Caller performs validated fresh-copy + StartOwned, stable Save, normal close,
# reopen + this Readback, then compares every field before persisted_verified=true.
function Invoke-WeinviewPlcConfiguration($Session,[string]$Mode,[string]$DeviceName,[string]$Ipv4,[int]$Port,[Nullable[int]]$Station=1,[string]$ExpectedIpv4='',[int]$ExpectedPort=0,[string]$Driver='MODBUS TCP/IP',[string]$Interface='ethernet',$SerialSettings=$null) {
 $ErrorActionPreference='Stop'
 if($Mode -cnotin @('Apply','Update','Readback','Inspect')){throw 'PLC mode must be Apply, Update, Readback or Inspect.'}
 $nativeInterface=switch($Interface){ethernet{'以太网'} rs232{'RS-232'} rs485_2w{'RS-485 2W'} rs485_4w{'RS-485 4W'} default{throw 'Unsupported native PLC interface.'}}
 $isSerial=($Interface -cne 'ethernet')
 if($isSerial -and $Driver -ceq 'MODBUS TCP/IP'){throw 'MODBUS TCP/IP driver requires Ethernet interface.'}
 Assert-WeinviewPlcCandidateSession $Session
 if(!$Session.exe_path){throw 'Kernel-verified dedicated exe_path required.'}
 if([string]::IsNullOrWhiteSpace($DeviceName) -or $DeviceName.Length -gt 64 -or $DeviceName -match '[\x00-\x1f\x7f]' -or [string]::IsNullOrWhiteSpace($Driver) -or $Driver.Length -gt 128 -or $Driver -match '[\x00-\x1f\x7f]' -or ($Driver -ceq 'MODBUS TCP/IP' -and $Station -ne 1) -or ($null -ne $Station -and ($Station -lt 0 -or $Station -gt 255)) -or (!$isSerial -and $Mode -cne 'Inspect' -and ($Port -lt 1 -or $Port -gt 65535))){throw 'Invalid finite PLC configuration arguments.'}
 if($isSerial){if($Ipv4 -or $Port -or $ExpectedIpv4 -or $ExpectedPort -or ($Mode -cin @('Apply','Update') -and !$SerialSettings)){throw 'Serial PLC settings require serial fields and no Ethernet endpoint.'}}
 elseif($Mode -cne 'Inspect'){$octets=$Ipv4.Split('.');if($octets.Count -ne 4){throw 'Canonical IPv4 required.'};foreach($o in $octets){$v=0;if($o -notmatch '^(0|[1-9][0-9]{0,2})$' -or ![int]::TryParse($o,[ref]$v) -or $v -gt 255){throw 'Canonical IPv4 required.'}}}
 if($Mode -ceq 'Update' -and ($ExpectedIpv4 -or $ExpectedPort)){
  if($ExpectedPort -lt 1 -or $ExpectedPort -gt 65535){throw 'Existing TCP port 1..65535 required.'}
  $oldOctets=$ExpectedIpv4.Split('.');if($oldOctets.Count -ne 4){throw 'Canonical existing IPv4 required.'};foreach($o in $oldOctets){$v=0;if($o -notmatch '^(0|[1-9][0-9]{0,2})$' -or ![int]::TryParse($o,[ref]$v) -or $v -gt 255){throw 'Canonical existing IPv4 required.'}}
 }
 $semantic=New-Object PLCCode.Weinview.NativeSemanticControls($Session.native)
 $properties=New-Object PLCCode.Weinview.Research.NativePropertyCandidate($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 function UntilPlc([scriptblock]$predicate){$deadline=[DateTime]::UtcNow.AddSeconds(30);do{$value=&$predicate;if($null -ne $value -and $value -ne $false){return $value};Start-Sleep -Milliseconds 100}while([DateTime]::UtcNow -lt $deadline);throw 'PLC semantic transition timed out.'}
 function CurrentDialog([string]$title,[int[]]$ids,[string]$allowedPredecessor=''){
  $d=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770'})
  if(!$d.Count){return $null}
  foreach($w in $d){if($w.Title -cne $title -and (!$allowedPredecessor -or $w.Title -cne $allowedPredecessor)){throw ('Unknown PLC dialog: '+$w.Title)}}
  # Only a caller's explicitly posted, known predecessor may remain during transition.
  $targets=@($d|Where-Object {$_.Title -ceq $title})
  if(!$targets.Count){return $null}
  if($d.Count -gt 1){if($allowedPredecessor -and @($d|Where-Object {$_.Title -ceq $allowedPredecessor}).Count){return $null};throw 'Unknown simultaneous enabled PLC modal; no acknowledgement.'}
  $target=$targets[0];$c=@($Session.native.EnumChildControls($target.Hwnd))
  foreach($id in $ids){
   $found=@($c|Where-Object {$_.Id -eq $id -and $_.Visible})
   if($found.Count -gt 1){throw 'PLC native ready control ID duplicated.'};if(!$found.Count -or !$found[0].Enabled){return $null}
   $expectedClass=if($id -eq 12320){'SysTabControl32'}elseif($id -in @(1616,2280)){'Edit'}elseif($id -eq 2506){'ListBox'}elseif($id -in @(1627,1623)){'Static'}else{'Button'}
   if($found[0].Class -cne $expectedClass){throw 'PLC native ready control class changed.'}
  }
  if($title -ceq '设备设置' -and !$isSerial){$qt=@($c|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled});if($qt.Count -gt 1){throw 'Endpoint Qt root duplicated.'};if(!$qt.Count){return $null}}elseif($title -cne '设备设置'){
  foreach($button in @(@{id=1;label='确定'},@{id=2;label='取消'})){
   $found=@($c|Where-Object {$_.Id -eq $button.id -and $_.Class -ceq 'Button' -and $_.Visible})
   if($found.Count -ne 1 -or !$found[0].Enabled -or !$found[0].Title){return $null};if($found[0].Title -cne $button.label){throw 'PLC native parent button label changed.'}
  }
  }
  return $target
 }
 function QtPage($dialog){$q=@($Session.native.EnumChildControls($dialog.Hwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled});if($q.Count -ne 1){throw 'PLC Qt page missing or not unique.'};return $q[0].Hwnd}
 $inspectionHash=(Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash
 try {
 $ribbon=Open-WeinviewSystemParametersRibbon $Session $semantic
 $system=UntilPlc {CurrentDialog '系统参数设置 ' @(12320,1,2)}
 $tab=$Session.native.FindUniqueControlWithoutLabel($system.Hwnd,12320,'SysTabControl32');$properties.SelectTabExact($tab.Hwnd,'设备')
 $page=QtPage $system;$entry='client/index:0/index:0/index:0/index:3/'
 $serialConfiguredBeforeInterface=$false
 if($Mode -ceq 'Apply'){
  # A name existing in the current branch is not silently overwritten.
  $existing=$Session.native.InvokeQtElement($Session.main.Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),('device-find:'+$DeviceName))|ConvertFrom-Json
  if($existing.matches -ne 0){throw 'PLC device name already exists; no overwrite.'}
  $null=$semantic.Execute($page,$entry+'index:0','新增设备/服务器...',43,'Invoke')
  $device=UntilPlc {CurrentDialog '设备属性' @(1616,1625) '系统参数设置 '}
  $driverButton=$Session.native.FindUniqueControlWithoutLabel($device.Hwnd,1625,'Button')
  if(!$driverButton.Title -or $driverButton.Title.Length -gt 256 -or $driverButton.Title -match '[\x00-\x1f]'){throw 'Current native driver caption is absent or invalid.'}
  # EBPro remembers the last chosen driver; never reset a user's default.
  if($driverButton.Title -cne $Driver){
   $Session.native.ClickButton($device.Hwnd,1625,$driverButton.Title)
   $selector=UntilPlc {CurrentDialog '设备属性' @(2506,1,2) '设备属性'}
   $selected=if($Driver -ceq 'MODBUS TCP/IP'){Select-WeinviewModbusDriverCandidate $Session $selector.Hwnd}else{Select-WeinviewExactDriverCandidate $Session $selector.Hwnd $Driver}
   $Session.native.ClickButton($selector.Hwnd,1,'确定')
   $deviceIds=if($Driver -ceq 'MODBUS TCP/IP'){@(1616,1627,1623,2280)}else{@(1616,1627,1623)}
   $device=UntilPlc {CurrentDialog '设备属性' $deviceIds '设备属性'}
  }
  if($isSerial){
   $interfaceCombo=$Session.native.FindUniqueControlWithoutLabel($device.Hwnd,1619,'ComboBox')
   $options=@($properties.ComboItems($interfaceCombo.Hwnd));if(@($options|Where-Object {$_ -ceq $nativeInterface}).Count -ne 1){throw 'Requested serial interface absent from this exact original device.'}
   $initialInterface=$properties.ComboSelected($interfaceCombo.Hwnd)
   if($initialInterface -cnotin @('RS-232','RS-485 2W','RS-485 4W')){throw 'Original serial driver did not open on a known serial interface.'}
   if($SerialSettings.PSObject.Properties.Name -ccontains 'com_port'){
    $driverReadback=Read-WeinviewEthernetDeviceCandidate $Session $device.Hwnd $Driver $initialInterface
    $fields=Set-WeinviewEthernetDeviceFieldsCandidate $Session $device.Hwnd $DeviceName $Driver $Station $initialInterface
    $Session.native.ClickButton($device.Hwnd,1620,'设置...')
    $ipDialog=UntilPlc {CurrentDialog '设备设置' @() '设备属性'}
    $serialResult=Invoke-WeinviewSerialSettingsCandidate $Session $ipDialog.Hwnd 'Apply' $SerialSettings
    $device=UntilPlc {CurrentDialog '设备属性' @(1616,1627,1623) '设备设置'}
    $ipDialog=$null
    $interfaceCombo=$Session.native.FindUniqueControlWithoutLabel($device.Hwnd,1619,'ComboBox')
    if($properties.ComboSelected($interfaceCombo.Hwnd) -cne $initialInterface){throw 'Serial HMI COM configuration changed the current native interface.'}
    if($initialInterface -cne $nativeInterface){$properties.SelectComboExact($interfaceCombo.Hwnd,$nativeInterface)}
    $fields=Read-WeinviewEthernetDeviceCandidate $Session $device.Hwnd $Driver $nativeInterface
    if($fields.device_name -cne $DeviceName -or ($null -ne $Station -and [string]$fields.station -cne [string]$Station)){throw 'Serial device identity changed after COM port and interface selection.'}
    $serialConfiguredBeforeInterface=$true
   }
   elseif($initialInterface -cne $nativeInterface){$properties.SelectComboExact($interfaceCombo.Hwnd,$nativeInterface)}
  }
  # A remembered driver and newly chosen interface must read back before writes.
  if(!$serialConfiguredBeforeInterface){
   $driverReadback=if($Driver -ceq 'MODBUS TCP/IP'){Read-WeinviewModbusCandidate $Session $device.Hwnd}else{Read-WeinviewEthernetDeviceCandidate $Session $device.Hwnd $Driver $nativeInterface}
   $fields=if($Driver -ceq 'MODBUS TCP/IP'){Set-WeinviewModbusStandardFieldsCandidate $Session $device.Hwnd $DeviceName $Station}else{Set-WeinviewEthernetDeviceFieldsCandidate $Session $device.Hwnd $DeviceName $Driver $Station $nativeInterface}
  }
 } else {
  $null=$Session.native.InvokeQtElement($Session.main.Hwnd,(Join-Path $PSScriptRoot 'QtElementBridge.exe'),('device-select:'+$DeviceName))
  # Selected alone is insufficient: subsequent native name/driver readback is mandatory.
  $null=$semantic.Execute($page,$entry+'index:4','设置...',43,'Invoke')
  $deviceIds=if($Driver -ceq 'MODBUS TCP/IP'){@(1616,1627,1623,2280)}else{@(1616,1627,1623)}
  $device=UntilPlc {CurrentDialog '设备属性' $deviceIds '系统参数设置 '}
  $fields=if($Driver -ceq 'MODBUS TCP/IP'){Read-WeinviewModbusCandidate $Session $device.Hwnd}else{Read-WeinviewEthernetDeviceCandidate $Session $device.Hwnd $Driver $nativeInterface}
 }
 if($fields.device_name -cne $DeviceName -or $fields.driver -cne $Driver -or ($null -ne $Station -and $Mode -cne 'Inspect' -and [string]$fields.station -cne [string]$Station) -or ([string]$fields.station).Length -gt 64 -or [string]$fields.station -match '[\x00-\x1f\x7f]'){throw 'Opened device context differs; no endpoint write.'}
 if($serialConfiguredBeforeInterface){$beforeEndpoint=$null;$endpoint=$null}
 else {
 $Session.native.ClickButton($device.Hwnd,1620,'设置...')
 $ipDialog=UntilPlc {CurrentDialog '设备设置' @() '设备属性'}
 if($isSerial){
  $serialResult=Invoke-WeinviewSerialSettingsCandidate $Session $ipDialog.Hwnd $Mode $SerialSettings
  $beforeEndpoint=$null;$endpoint=$null
 }else{
  $ipQt=QtPage $ipDialog
  $endpointReader=New-Object PLCCode.Weinview.QtModbusEndpointCandidate($Session.native)
  $beforeEndpoint=$endpointReader.Read($ipDialog.Hwnd)
  if($Mode -ceq 'Update' -and $ExpectedIpv4 -and ($beforeEndpoint.Ip -cne $ExpectedIpv4 -or $beforeEndpoint.Port -ne $ExpectedPort)){throw 'Existing device endpoint differs; no update.'}
  if($Mode -cin @('Apply','Update')){
   $endpoint=$endpointReader.SetExactByBoundMessages($ipDialog.Hwnd,$beforeEndpoint.Ip,$beforeEndpoint.Port,$Ipv4,$Port)
   $null=$semantic.Execute($ipQt,'client/index:0/index:0/index:0/index:3','确定',43,'Invoke')
  }else{
   $endpoint=$beforeEndpoint
   if($Mode -ceq 'Readback' -and ($endpoint.Ip -cne $Ipv4 -or $endpoint.Port -ne $Port)){throw 'Persisted endpoint differs.'}
   $null=$semantic.Execute($ipQt,'client/index:0/index:0/index:0/index:4','取消',43,'Invoke')
  }
 }
 }
 $deviceIds=if($Driver -ceq 'MODBUS TCP/IP'){@(1616,1627,1623,2280)}else{@(1616,1627,1623)}
 if(!$serialConfiguredBeforeInterface){$device=UntilPlc {CurrentDialog '设备属性' $deviceIds '设备设置'}}
 $fields=if($Driver -ceq 'MODBUS TCP/IP'){Read-WeinviewModbusCandidate $Session $device.Hwnd}else{Read-WeinviewEthernetDeviceCandidate $Session $device.Hwnd $Driver $nativeInterface}
 $expectedDisplay=if($isSerial){$fields.endpoint_display}elseif($Mode -ceq 'Inspect'){$endpoint.Ip+',  端口号='+$endpoint.Port}else{$Ipv4+',  端口号='+$Port}
 if($fields.device_name -cne $DeviceName -or $fields.driver -cne $Driver -or ($null -ne $Station -and $Mode -cne 'Inspect' -and [string]$fields.station -cne [string]$Station) -or $fields.endpoint_display -cne $expectedDisplay -or ($Driver -ceq 'MODBUS TCP/IP' -and $fields.udp -ne 0)){throw 'Native parent device name/driver/endpoint readback differs.'}
 if($Mode -cin @('Apply','Update')){$Session.native.ClickButton($device.Hwnd,1,'确定')}else{$Session.native.ClickButton($device.Hwnd,2,'取消')}
 $system=UntilPlc {CurrentDialog '系统参数设置 ' @(12320,1,2) '设备属性'}
 if($Mode -cin @('Apply','Update')){$Session.native.ClickButton($system.Hwnd,1,'确定')}else{$Session.native.ClickButton($system.Hwnd,2,'取消')}
 $null=UntilPlc {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -eq '#32770'}).Count){return $true}}
 return [pscustomobject]@{device_name=$fields.device_name;driver=$fields.driver;driver_id=$fields.driver_id;driver_version=$fields.driver_version;driver_file=$fields.driver_file;location=$fields.location;interface=$fields.interface;station=$fields.station;ipv4=if($isSerial){$null}else{$endpoint.Ip};port=if($isSerial){$null}else{$endpoint.Port};serial=if($isSerial){$serialResult.actual}else{$null};endpoint_display=$fields.endpoint_display;udp=$fields.udp;scope='offline_project_configuration';mode=$Mode;native_fields_verified=$true;persisted_verified=$false;previous_ipv4=if($isSerial){$null}else{$beforeEndpoint.Ip};previous_port=if($isSerial){$null}else{$beforeEndpoint.Port};previous_serial=if($isSerial){$serialResult.before}else{$null};endpoint_stage_trace=if($isSerial){@($serialResult.stage_trace)}else{@($endpointReader.StageTrace)};driver_selection_evidence=$selected;ribbon_evidence=$ribbon}
 } catch {
  $failure=$_;$cleanup=@{attempted=$false;known_dialogs_cancelled=@();hash_preserved=$false}
  try {
   $cleanup.hash_preserved=((Get-FileHash -LiteralPath $Session.output_path -Algorithm SHA256).Hash -ceq $inspectionHash)
   if(!$cleanup.hash_preserved){$cleanup.reason='Owned project bytes changed; preserve dialog'}
   else {
    $known=@(@{bound=$ipDialog;title='设备设置'},@{bound=$selector;title='设备属性'},@{bound=$device;title='设备属性'},@{bound=$system;title='系统参数设置 '})
    for($step=0;$step -lt 3;$step++){
     $modals=@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770'})
     if(!$modals.Count){break}
     $current=$modals[0];$matches=@($known|Where-Object {$_.bound -and $_.bound.Hwnd -eq $current.Hwnd -and $_.title -ceq $current.Title})
     if($modals.Count -ne 1 -or $matches.Count -ne 1){$cleanup.reason='Unknown owned modal; preserve';break}
     $item=$matches[0]
     $cleanup.attempted=$true
     if($item.title -ceq '设备设置'){
      if($isSerial){([PLCCode.Weinview.QtSerialSettingsCandidate]::new($Session.native)).Confirm($ipDialog.Hwnd,$false)}
      else {
      if(!$ipQt){throw 'Bound endpoint Qt page missing during failure cleanup'}
      $null=$semantic.Execute($ipQt,'client/index:0/index:0/index:0/index:4','取消',43,'Invoke')
      }
     }else{$Session.native.ClickButton($item.bound.Hwnd,2,'取消')}
     $cleanup.known_dialogs_cancelled+=@($item.title)
     $null=UntilPlc {if(!@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq '#32770' -and $_.Hwnd -eq $item.bound.Hwnd}).Count){return $true}}
    }
   }
  }catch{$cleanup.error=$_.Exception.Message}
  $failure.Exception.Data['plc_dialog_cleanup']=$cleanup
  throw $failure
 }
}
