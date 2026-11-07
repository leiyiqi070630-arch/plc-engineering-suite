# Generates a manual, one-shot macro that submits one official enhanced-security
# Control Address command. Account values stay in the native UAC registers; this
# file never accepts or serializes a user name or password. The caller fills the
# native UAC fields (for example with the vendor's account windows 70-74) before
# triggering this macro, and reads the vendor-written result at base + 1.
# EBPro V6.10.01 User Manual, chapter 10, Enhanced Security Control Address.
function New-WeinviewRuntimeAccountMacro($Arguments) {
 if($null -eq $Arguments -or $Arguments -isnot [pscustomobject]){throw 'Runtime account macro arguments required.'}
 $names=@($Arguments.PSObject.Properties.Name)
 if(@(@('action','control_base','address_type')|Where-Object {$_ -cnotin $names}).Count -or @($names|Where-Object {$_ -cnotin @('action','control_base','address_type','classes')}).Count){throw 'Exact runtime account macro arguments required.'}
 $action=[string]$Arguments.action
 $commands=@{
  login_by_name=1
  login_by_index=2
  logout=3
  add_account=5
  delete_by_name=7
  delete_by_index=8
  set_privilege_by_name=9
  set_privilege_by_index=10
  set_password_by_name=11
  set_password_by_index=12
 }
 if(!$commands.ContainsKey($action)){throw 'Official runtime account command must be login/logout/add/delete/set privilege/set password.'}
 if(($Arguments.control_base -isnot [int] -and $Arguments.control_base -isnot [long]) -or $Arguments.control_base -lt 0 -or $Arguments.control_base -gt 65516){throw 'UAC control base must leave twenty consecutive word registers.'}
 $type=[string]$Arguments.address_type
 if($type -cnotin @('LW','PLW')){throw 'Official cMT UAC control address must be LW or PLW.'}
 $base=[int]$Arguments.control_base
 $mask=$null
 if($names -ccontains 'classes'){
  if($action -cnotin @('add_account','set_privilege_by_name','set_privilege_by_index')){throw 'Classes are only used by add/set privilege commands.'}
  $classes=@($Arguments.classes);if(!$classes.Count -or $classes.Count -gt 12){throw 'One to twelve classes A through L required.'}
  $mask=0
  foreach($class in $classes){
   $letter=[string]$class;if($letter -cnotmatch '^[A-L]$'){throw 'Privilege classes must be A through L.'}
   $bit=1 -shl ([int][char]$letter-[int][char]'A')
   if(($mask -band $bit) -ne 0){throw 'Duplicate privilege class.'}
   $mask=$mask -bor $bit
  }
 }
 $command=[int]$commands[$action]
 $source="macro_command main()`n"
 if($null -ne $mask){$source+="short privilege = $mask`nSetData(privilege, `"Local HMI`", $type, $($base+3), 1)`n"}
 $source+="short command = $command`nSetData(command, `"Local HMI`", $type, $base, 1)`nend macro_command`n"
 $required=@(switch($action){
  'login_by_name' {@('user_name','password')}
  'login_by_index' {@('user_index','password')}
  'logout' {@()}
  'add_account' {@('user_name','password')}
  'delete_by_name' {@('user_name')}
  'delete_by_index' {@('user_index')}
  'set_privilege_by_name' {@('user_name')}
  'set_privilege_by_index' {@('user_index')}
  'set_password_by_name' {@('user_name','password')}
  'set_password_by_index' {@('user_index','password')}
 })
 if($action -cin @('add_account','set_privilege_by_name','set_privilege_by_index') -and $null -eq $mask){$required+=@('user_privilege')}
 return [pscustomobject]@{
  action=$action
  command_code=$command
  address_type=$type
  control_base=$base
  required_parameter_registers=@($required)
  privilege_mask=$mask
  privilege_written_by_macro=($null -ne $mask)
  registers=[pscustomobject]@{command=$base;result=$base+1;user_index=$base+2;user_privilege=$base+3;user_name_start=$base+4;user_name_words=8;password_start=$base+12;password_words=8}
  macro_source=$source
  execution=[pscustomobject]@{startup=$false;periodic_interval_ms=$null}
  result_readback=[pscustomobject]@{device='Local HMI';address_type=$type;address=$base+1;words=1}
  scope='runtime account command on an HMI or client configured with this exact enhanced-security control address; does not edit project preset accounts'
 }
}
