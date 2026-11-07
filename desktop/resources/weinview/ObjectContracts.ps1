function Get-WeinviewNativeBitMode($OperationMode) {
 if($OperationMode -isnot [string]){throw 'String bit operation_mode required'}
 switch -CaseSensitive ($OperationMode) {
  'toggle' {return '切换开关'}
  'set_on' {return '设为 ON'}
  'set_off' {return '设为 OFF'}
  'momentary' {return '复归型'}
  default {throw 'Only toggle/set_on/set_off/momentary bit operation_mode supported'}
 }
}
function CanonicalObject([string]$id,$actual) {
 if($id -and $actual -and $actual.kind -ceq 'alarm_display'){
  if($id -cnotmatch '^AL_[0-9]{1,5}$' -or $actual.object_id -cne $id){throw 'Actual Alarm Display directory identity required'}
  $canonical=[ordered]@{};foreach($property in $actual.PSObject.Properties){$canonical[$property.Name]=$property.Value}
  if($canonical.Count -lt 16 -or $canonical.kind -cne 'alarm_display' -or @($canonical.rect).Count -ne 4 -or $canonical.description -isnot [string] -or $canonical.font_size -isnot [string]){throw 'Observed Alarm Display property record required'}
  return $canonical
 }
 if($id -and $actual -and $actual.kind -ceq 'picture'){
  if($id -cnotmatch '^GP_[0-9]{1,5}$'){throw 'Actual Picture directory identity required.'}
  $rect=@($actual.rectangle);if($rect.Count -ne 4){throw 'Actual Picture rectangle required.'}
  foreach($value in $rect){if($value -isnot [int] -and $value -isnot [long]){throw 'Actual Picture integer rectangle required.'}}
  if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -le 0 -or $rect[3] -le 0){throw 'Actual Picture position and dimensions required.'}
  if($actual.project_picture_index -isnot [int] -or $actual.project_picture_index -lt 0 -or $actual.project_picture_index -gt 65535 -or $actual.state_count -isnot [int] -or $actual.state_count -lt 1 -or $actual.state_count -gt 255){throw 'Actual Picture project index and state count required.'}
  if($actual.picture_name -isnot [string] -or !$actual.picture_name -or $actual.picture_name.Length -gt 1024 -or $actual.picture_name -match '[\x00-\x1f\x7f-\x9f]'){throw 'Actual Picture name required.'}
  return [ordered]@{object_id=$id;kind='picture';rectangle=@([int]$rect[0],[int]$rect[1],[int]$rect[2],[int]$rect[3]);project_picture_index=[int]$actual.project_picture_index;picture_name=[string]$actual.picture_name;state_count=[int]$actual.state_count}
 }
 if($id -and $actual -and $actual.kind -ceq 'option_list'){
  if($id -cnotmatch '^OL_[0-9]{1,5}$'){throw 'Actual Option List directory identity required.'}
  $rect=@($actual.rectangle);if($rect.Count -ne 4){throw 'Actual Option List rectangle required.'}
  foreach($v in $rect){if($v -isnot [int] -and $v -isnot [long]){throw 'Actual Option List integer rectangle required.'}}
  if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -le 0 -or $rect[3] -le 0){throw 'Actual Option List positive rectangle required.'}
  if($actual.device -cne 'Local HMI' -or $actual.address_type -cne 'LW' -or $actual.data_type -cne '16-bit Unsigned' -or ($actual.address -isnot [int] -and $actual.address -isnot [long]) -or $actual.address -lt 0 -or $actual.address -gt 65535 -or $actual.mode -cnotin @('list','dropdown')){throw 'Option List native binding outside implemented profile.'}
  $items=@($actual.options);if(!$items.Count){throw 'Actual Option List ordinary options required.'}
  $choices=@();foreach($item in $items){if($item.text -isnot [string] -or [string]::IsNullOrWhiteSpace($item.text) -or $item.text.Length -gt 4096 -or ($item.value -isnot [int] -and $item.value -isnot [long]) -or $item.value -lt 0 -or $item.value -gt 65535){throw 'Actual Option List text/unsigned16 value required.'};$choices+=[ordered]@{text=[string]$item.text;value=[int]$item.value}}
  if(!$actual.error_row -or $actual.error_row.index -ne $choices.Count -or $actual.error_row.item -cne ($choices.Count.ToString([Globalization.CultureInfo]::InvariantCulture)+' (error)')){throw 'Dedicated native Option List error row required.'}
  return [ordered]@{object_id=$id;kind='option_list';rectangle=@([int]$rect[0],[int]$rect[1],[int]$rect[2],[int]$rect[3]);data=[ordered]@{device='Local HMI';address_type='LW';address=[string]$actual.address;data_type='16-bit Unsigned'};mode=[string]$actual.mode;options=$choices}
 }
 if($id -and $actual -and $actual.kind -ceq 'recipe_view'){
  if($id -cnotmatch '^RV_[0-9]{1,5}$' -or $actual.recipe_name -isnot [string] -or [string]::IsNullOrWhiteSpace($actual.recipe_name) -or $actual.recipe_name.Length -gt 128){throw 'Finite original Recipe View identity/name required'}
  $fields=@($actual.field_names|ForEach-Object {[string]$_});$display=@($actual.displayed_fields|ForEach-Object {[string]$_})
  if($fields.Count -lt 1 -or $fields.Count -gt 100 -or $display.Count -gt 100 -or @($fields|Select-Object -Unique).Count -ne $fields.Count -or @($display|Select-Object -Unique).Count -ne $display.Count -or @($display|Where-Object {$_ -cnotin $fields}).Count){throw 'Finite original Recipe View Display fields required'}
  if($actual.sort_enabled -isnot [bool] -or $actual.sort_by -cnotin $fields -or $actual.sort_direction -cnotin @('ascending','descending')){throw 'Original Recipe View native sort settings required'}
  return [ordered]@{object_id=$id;kind='recipe_view';recipe_name=[string]$actual.recipe_name;field_names=$fields;displayed_fields=$display;sort_enabled=[bool]$actual.sort_enabled;sort_by=[string]$actual.sort_by;sort_direction=[string]$actual.sort_direction}
 }
 if($id -and $actual -and $actual.kind -ceq 'trend'){
  if($id -cnotmatch '^TD_[0-9]{1,5}$'){throw 'Finite Trend directory identity required'}
  foreach($field in @('description','sampling_label','sampling_description')){
   if($actual.$field -isnot [string] -or $actual.$field.Length -gt 1024 -or ($field -cne 'description' -and !$actual.$field)){throw 'Actual bounded Trend string required'}
   foreach($character in $actual.$field.ToCharArray()){if([char]::IsControl($character)){throw 'Trend string control character rejected'}}
  }
  $mode=$null;$unit=$null
  if($null -ne $actual.display_mode){if($actual.display_mode -isnot [string] -or !$actual.display_mode -or $actual.display_mode.Length -gt 1024){throw 'Actual bounded Trend display mode required'};$mode=[string]$actual.display_mode}
  if($null -ne $actual.display_unit){if($actual.display_unit -cnotin @('毫米','时间','像素')){throw 'Actual native Trend display unit required'};$unit=[string]$actual.display_unit}
  if($actual.sampling_index -isnot [int] -or $actual.sampling_index -le 0 -or $actual.sampling_label -cne ($actual.sampling_index.ToString([Globalization.CultureInfo]::InvariantCulture)+'. '+$actual.sampling_description)){throw 'Actual Trend sampling full label/index/description mismatch'}
  foreach($field in @('pixel_spacing','line_width')){if($actual.$field -isnot [int] -or $actual.$field -le 0){throw 'Actual positive Trend spacing/width integer required'}}
  foreach($field in @('minimum','maximum')){if($actual.$field -isnot [int] -and $actual.$field -isnot [long] -and $actual.$field -isnot [double] -and $actual.$field -isnot [decimal]){throw 'Actual Trend finite numeric range required'};$value=[double]$actual.$field;if([double]::IsNaN($value) -or [double]::IsInfinity($value) -or [math]::Abs($value) -gt [single]::MaxValue){throw 'Actual Trend range outside Float32 envelope'}}
  if([double]$actual.minimum -ge [double]$actual.maximum){throw 'Actual Trend minimum must be below maximum'}
  $hasTrendGeometry=($null -ne $actual.rectangle)
  $cmtCanvasGeometry=($hasTrendGeometry -and $null -ne $unit -and $null -eq $mode)
  if($hasTrendGeometry -and $cmtCanvasGeometry){if($null -ne $actual.aspect_locked -or $null -ne $actual.width_percent -or $null -ne $actual.height_percent){throw 'cMT canvas rectangle must not invent absent contour controls'}}
  elseif($hasTrendGeometry){foreach($field in @('width_percent','height_percent')){if($actual.$field -isnot [int] -or $actual.$field -lt 0){throw 'Actual nonnegative Trend percentage integer required'}};if($actual.aspect_locked -isnot [bool]){throw 'Actual Trend aspect Boolean required'}}
  elseif($null -ne $actual.aspect_locked -or $null -ne $actual.width_percent -or $null -ne $actual.height_percent){throw 'Unread Trend geometry must stay entirely null'}
  foreach($field in @('pixel_mode','time_mode','pause_enabled')){if($null -ne $actual.$field -and $actual.$field -isnot [bool]){throw 'Actual optional legacy Trend Boolean state required'}}
  foreach($field in @('dynamic_spacing','inspection_enabled','time_export_enabled','range_from_register','channel_control_enabled')){if($actual.$field -isnot [bool]){throw 'Actual Trend Boolean state required'}}
  $rectangle=$null;$aspect=$null;$widthPercent=$null;$heightPercent=$null
  if($hasTrendGeometry){$values=@($actual.rectangle);if($values.Count -ne 4){throw 'Four actual Trend rectangle integers required'};foreach($value in $values){if($value -isnot [int]){throw 'Actual Trend rectangle int32 required'}};if($values[0] -lt 0 -or $values[1] -lt 0 -or $values[2] -le 0 -or $values[3] -le 0){throw 'Actual finite Trend position/dimensions required'};$rectangle=@([int]$values[0],[int]$values[1],[int]$values[2],[int]$values[3]);if(!$cmtCanvasGeometry){$aspect=[bool]$actual.aspect_locked;$widthPercent=[int]$actual.width_percent;$heightPercent=[int]$actual.height_percent}}
  return [ordered]@{object_id=$id;kind='trend';description=[string]$actual.description;sampling_label=[string]$actual.sampling_label;sampling_index=[int]$actual.sampling_index;sampling_description=[string]$actual.sampling_description;display_mode=$mode;display_unit=$unit;pixel_spacing=[int]$actual.pixel_spacing;pixel_mode=$actual.pixel_mode;time_mode=$actual.time_mode;dynamic_spacing=[bool]$actual.dynamic_spacing;pause_enabled=$actual.pause_enabled;inspection_enabled=[bool]$actual.inspection_enabled;time_export_enabled=[bool]$actual.time_export_enabled;range_from_register=[bool]$actual.range_from_register;minimum=[double]$actual.minimum;maximum=[double]$actual.maximum;line_width=[int]$actual.line_width;channel_control_enabled=[bool]$actual.channel_control_enabled;rectangle=$rectangle;aspect_locked=$aspect;width_percent=$widthPercent;height_percent=$heightPercent}
 }
 if($id -and $actual -and $actual.kind -ceq 'text'){
  if($id -cnotmatch '^TX_[0-9]{1,5}$' -or $actual.text -isnot [string] -or $actual.text.Length -gt 4096 -or $actual.text.IndexOf([char]0) -ge 0){throw 'Finite native Text identity/content required'}
  if($actual.text_source -cnotin @('literal','label_library')){throw 'Observed native Text source required'}
  if($actual.text_source -ceq 'label_library'){
   if($actual.label_name -isnot [string] -or [string]::IsNullOrWhiteSpace($actual.label_name) -or $actual.label_name.Length -gt 1024){throw 'Observed Text label library name required'}
   foreach($character in $actual.label_name.ToCharArray()){if([char]::IsControl($character)){throw 'Text label name control character rejected'}}
  }elseif($null -ne $actual.label_name){throw 'Literal Text must not have a label library name'}
  foreach($character in $actual.text.ToCharArray()){if([char]::IsControl($character) -and $character -ne [char]13){throw 'Text finite profile retains native CR only; other controls rejected'}}
  if($actual.font_size -isnot [int] -or $actual.font_size -le 0 -or $actual.x -isnot [int] -or $actual.y -isnot [int] -or $actual.x -lt 0 -or $actual.y -lt 0 -or $actual.comment -isnot [bool]){throw 'Finite native Text integer position/font size and Boolean comment required'}
  foreach($field in @('font','alignment','blink')){if($actual.$field -isnot [string] -or !$actual.$field -or $actual.$field.Length -gt 1024){throw 'Actual bounded Text font/alignment/blink required'};foreach($character in $actual.$field.ToCharArray()){if([char]::IsControl($character)){throw 'Text combo control character rejected'}}}
  $labelName=$null;if($actual.text_source -ceq 'label_library'){$labelName=[string]$actual.label_name}
  return [ordered]@{object_id=$id;kind='text';text=[string]$actual.text;text_source=[string]$actual.text_source;label_name=$labelName;font_size=[int]$actual.font_size;font=[string]$actual.font;alignment=[string]$actual.alignment;blink=[string]$actual.blink;comment=[bool]$actual.comment;x=[int]$actual.x;y=[int]$actual.y}
 }
 if($id -and $actual -and $actual.kind -ceq 'rectangle'){
  if($id -cnotmatch '^DW_[0-9]{1,5}$' -or $actual.filled -isnot [bool] -or $actual.corner -isnot [string] -or !$actual.corner -or $actual.corner.Length -gt 1024){throw 'Finite Rectangle identity/filled/observed corner string required'}
  foreach($character in $actual.corner.ToCharArray()){if([char]::IsControl($character)){throw 'Rectangle corner control character rejected'}}
  $values=@($actual.rectangle);if($values.Count -ne 4){throw 'Four actual Rectangle integers required'}
  foreach($v in $values){if($v -isnot [int]){throw 'Actual Rectangle integer required'}}
  if($values[0] -lt 0 -or $values[1] -lt 0 -or $values[2] -le 0 -or $values[3] -le 0){throw 'Finite Rectangle nonnegative position/positive dimensions required'}
  foreach($field in @('width_percent','height_percent')){if($actual.$field -isnot [int] -or $actual.$field -lt 0){throw 'Actual nonnegative Rectangle percentage integer required'}}
  return [ordered]@{object_id=$id;kind='rectangle';rectangle=@([int]$values[0],[int]$values[1],[int]$values[2],[int]$values[3]);filled=[bool]$actual.filled;corner=[string]$actual.corner;width_percent=[int]$actual.width_percent;height_percent=[int]$actual.height_percent}
 }
 if(!$id -or !$actual -or $actual.kind -cnotin @('numeric_display','macro_button','window_button','bit_switch','bit_lamp')){throw 'Canonical supported object/id required'}
 $rect=@($actual.rectangle);if($rect.Count -ne 4){throw 'Canonical rectangle must contain4values'};$rectangle=@();foreach($v in $rect){$rectangle+=[int]$v}
 $data=$null;$style=$null;$macro=$null;$labels=@()
 if($actual.kind -ceq 'numeric_display'){
  $tagName=if($null -ne $actual.data.tag_name -and [string]$actual.data.tag_name -ne ''){[string]$actual.data.tag_name}else{$null}
  $data=[ordered]@{device=[string]$actual.data.device;address_type=[string]$actual.data.address_type;address=[string]$actual.data.address;tag_name=$tagName;input_enabled=[bool]$actual.data.input_enabled}
   $nativeFont=if($actual.native_font){[string]$actual.native_font}else{[string]$actual.style.font}
   if([string]::IsNullOrWhiteSpace($nativeFont) -or $nativeFont.Length -gt 1024 -or $nativeFont -match '[\x00-\x1f\x7f]'){throw 'Actual bounded numeric font required'}
   $nativeSize=if($actual.native_size){[string]$actual.native_size}else{[string]$actual.style.size}
   $parsedSize=[long]0
   if($nativeSize -cnotmatch '^[0-9]+$' -or ![long]::TryParse($nativeSize,[ref]$parsedSize) -or $parsedSize -lt 1){throw 'Actual positive numeric font size required'}
   $style=[ordered]@{data_type=[string]$actual.style.data_type;integer_digits=[string]$actual.style.integer_digits;decimal_digits=[string]$actual.style.decimal_digits;minimum=[string]$actual.style.minimum;maximum=[string]$actual.style.maximum;font=$nativeFont;size=$nativeSize}
 }else{
  if($actual.kind -ceq 'macro_button'){$macro=[ordered]@{id=[int]$actual.macro.id;name=[string]$actual.macro.name}}
  foreach($state in @(0,1)){$found=@($actual.labels|Where-Object {[int]$_.state -eq $state});if($found.Count -ne 1){throw 'Canonical labels exactlystate0and1 required'};$l=$found[0];$labels+=[ordered]@{state=$state;font=[string]$l.font;size=[string]$l.size;text=[string]$l.text}}
 }
 $canonical=[ordered]@{object_id=$id;kind=[string]$actual.kind;description=[string]$actual.description;rectangle=$rectangle;data=$data;style=$style;macro=$macro;labels=$labels}
 if($actual.kind -ceq 'window_button'){
  $w=$actual.window
  if([int]$w.trigger_on_release -notin @(0,1)){throw 'Exact native function trigger state required'}
  if($w.action -ceq '切换基本窗口'){
   if([int]$w.target_window.number -lt 10 -or [int]$w.target_window.number -gt 1999 -or !$w.target_window.name){throw 'Exact basic-window navigation contract required'}
   $canonical.window=[ordered]@{action='切换基本窗口';target_window=[ordered]@{number=[int]$w.target_window.number;name=[string]$w.target_window.name};trigger_on_release=[int]$w.trigger_on_release}
  }elseif($w.action -ceq '导入用户账户'){
   if($w.target_window -or $w.media -cnotin @('U盘','U盘 2','SD 卡') -or $w.import_mode -cnotin @('附加','覆盖') -or $w.delete_after_import -isnot [bool]){throw 'Exact original UserAccounts import function options required'}
   $canonical.window=[ordered]@{action='导入用户账户';target_window=$null;media=[string]$w.media;import_mode=[string]$w.import_mode;delete_after_import=[bool]$w.delete_after_import;trigger_on_release=[int]$w.trigger_on_release}
  }else{throw 'Observed native function action required'}
 }
 if($actual.kind -ceq 'bit_switch'){
  $bit=$actual.bit;$address=0
  $tagName=if($null -ne $bit.tag_name -and [string]$bit.tag_name -ne ''){[string]$bit.tag_name}else{$null}
  if($tagName -and ($tagName.Length -gt 256 -or $tagName -match '[\x00-\x1f]')){throw 'Exact native bit Tag name required'}
  if($bit.operation_mode -cnotin @('设为 ON','设为 OFF','切换开关','复归型') -or [string]::IsNullOrWhiteSpace([string]$bit.device) -or [string]::IsNullOrWhiteSpace([string]$bit.address_type) -or [string]::IsNullOrWhiteSpace([string]$bit.address) -or ([string]$bit.device).Length -gt 128 -or ([string]$bit.address_type).Length -gt 128 -or ([string]$bit.address).Length -gt 128 -or ([string]$bit.device+[string]$bit.address_type+[string]$bit.address) -match '[\x00-\x1f\x7f]'){throw 'Verified native bit-switch binding fields required'}
  if($bit.device -ceq 'Local HMI' -and !$tagName -and ($bit.address_type -cne 'LB' -or ![int]::TryParse([string]$bit.address,[ref]$address) -or $address -lt 0 -or $address -gt 8999)){throw 'Verified Local LB switch contract required'}
  foreach($key in @('distinct_read_write','inverted','trigger_on_release','macro_enabled')){if($bit.$key -isnot [bool] -or $bit.$key){throw 'Unsupported bit flags rejected'}}
  $canonical.bit=[ordered]@{device=[string]$bit.device;address_type=[string]$bit.address_type;address=[string]$bit.address;tag_name=$tagName;operation_mode=[string]$bit.operation_mode;distinct_read_write=$false;inverted=$false;trigger_on_release=$false;macro_enabled=$false}
 }
 if($actual.kind -ceq 'bit_lamp'){
  $bit=$actual.bit;$address=0
  $tagName=if($null -ne $bit.tag_name -and [string]$bit.tag_name -ne ''){[string]$bit.tag_name}else{$null}
  if($tagName -and ($tagName.Length -gt 256 -or $tagName -match '[\x00-\x1f]')){throw 'Exact native bit Tag name required'}
  if($id -cnotmatch '^BL_[0-9]{1,5}$' -or $bit.operation_mode -cne '位状态指示灯' -or [string]::IsNullOrWhiteSpace([string]$bit.device) -or [string]::IsNullOrWhiteSpace([string]$bit.address_type) -or [string]::IsNullOrWhiteSpace([string]$bit.address) -or ([string]$bit.device).Length -gt 128 -or ([string]$bit.address_type).Length -gt 128 -or ([string]$bit.address).Length -gt 128 -or ([string]$bit.device+[string]$bit.address_type+[string]$bit.address) -match '[\x00-\x1f\x7f]' -or $bit.inverted -isnot [bool] -or $bit.inverted){throw 'Verified native BL bit binding contract required'}
  if($bit.device -ceq 'Local HMI' -and !$tagName -and ($bit.address_type -cne 'LB' -or ![int]::TryParse([string]$bit.address,[ref]$address) -or $address -lt 0 -or $address -gt 8999)){throw 'Verified native BL Local LB lamp contract required'}
  $keys=if($bit -is [Collections.IDictionary]){@($bit.Keys)}else{@($bit.PSObject.Properties.Name)}
  if($keys.Count -notin @(5,6) -or @($keys|Where-Object {$_ -cnotin @('device','address_type','address','tag_name','operation_mode','inverted')}).Count){throw 'Lamp fields must not invent hidden switch flags'}
  $canonical.bit=[ordered]@{device=[string]$bit.device;address_type=[string]$bit.address_type;address=[string]$bit.address;tag_name=$tagName;operation_mode='位状态指示灯';inverted=$false}
 }
 return $canonical
}
function CanonicalObjectHash($canonical){$json=ConvertTo-Json -InputObject $canonical -Depth 12 -Compress;$bytes=[Text.UTF8Encoding]::new($false).GetBytes($json);$sha=[Security.Cryptography.SHA256]::Create();try{return [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-','')}finally{$sha.Dispose()}}

# Retain every captured field, including finite read-only records, when adding a control.
# Text currently exposes its anchor, not its full bounds; report that gap explicitly.
function Get-WeinviewAdditionProtection($Objects,[int]$CanvasWidth=800,[int]$CanvasHeight=480,$AlarmDisplays=@()){
 if($CanvasWidth -lt 1 -or $CanvasWidth -gt 65535 -or $CanvasHeight -lt 1 -or $CanvasHeight -gt 65535){throw 'Actual selected native window dimensions required'}
 $occupied=@();$descriptions=@{};$ids=@{};$complete=$true;$alarmMap=@{}
 foreach($alarm in @($AlarmDisplays)){
  if($alarm.object_id -cnotmatch '^AL_[0-9]{1,5}$' -or $alarmMap.ContainsKey($alarm.object_id) -or $alarm.native_fields_verified -ne $true -or $alarm.full_properties_verified -ne $false -or $alarm.actual.object_id -cne $alarm.object_id -or $alarm.actual.kind -cne 'alarm_display' -or $alarm.observed_properties_sha256 -cne (Get-WeinviewAlarmDisplayPropertyHash $alarm.actual) -or $alarm.observed_properties_json -cne ($alarm.actual|ConvertTo-Json -Depth 8 -Compress)){throw 'Unique exact original observed AL fields/hash required'}
  $alarmMap[$alarm.object_id]=$alarm
 }
 foreach($old in @($Objects)){
  if($old.supported -eq $false -and $old.kind -ceq 'directory_only' -and $old.unsupported_reason -ceq 'properties-not-read-during-addition' -and $old.object_id -and $old.raw_label -and @($old.editable_fields).Count -eq 0){if($ids.ContainsKey($old.object_id)){throw 'Native directory identity duplicated'};$ids[$old.object_id]=$null;$complete=$false;continue}
  if($old.supported -eq $false -and $old.kind -ceq 'unsupported' -and $old.object_id -cmatch '^AL_[0-9]{1,5}$' -and $old.unsupported_reason -ceq 'native-object-kind-not-implemented' -and @($old.editable_fields).Count -eq 0 -and $alarmMap.ContainsKey($old.object_id)){
   if($ids.ContainsKey($old.object_id)){throw 'Original AL identity duplicated'};$ids[$old.object_id]=$null;$alarm=$alarmMap[$old.object_id];$rectangle=@($alarm.actual.rect)
   if($rectangle.Count -ne 4){throw 'Observed AL rectangle required'};foreach($v in $rectangle){if(($v -isnot [int] -and $v -isnot [long]) -or $v -lt 0){throw 'Observed AL rectangle integers required'}}
   if($rectangle[2] -le 0 -or $rectangle[3] -le 0 -or $rectangle[0]+$rectangle[2] -gt $CanvasWidth -or $rectangle[1]+$rectangle[3] -gt $CanvasHeight){throw 'Observed AL rectangle outside actual canvas'}
   $occupied+=,@($rectangle);if($alarm.actual.description){$descriptions[[string]$alarm.actual.description]=$true};continue
  }
  if(!$old.supported -or $old.kind -cnotin @('numeric_display','macro_button','window_button','bit_switch','bit_lamp','text','rectangle','trend','option_list') -or !$old.object_id -or $ids.ContainsKey($old.object_id)){throw 'Unique supported captured objects required before addition'}
  if((CanonicalObjectHash (CanonicalObject $old.object_id $old)) -cne $old.object_sha256){throw 'Caller before fields do not match canonical hash'}
  $ids[$old.object_id]=$old.object_sha256
  if($old.kind -ceq 'text' -or ($old.kind -ceq 'trend' -and $null -eq $old.rectangle)){$complete=$false}else{
   $rectangle=@($old.rectangle);if($rectangle.Count -ne 4){throw 'Captured native rectangle required'}
   foreach($v in $rectangle){if(($v -isnot [int] -and $v -isnot [long]) -or $v -lt 0){throw 'Nonnegative integer captured rectangle required'}}
   if($rectangle[2] -le 0 -or $rectangle[3] -le 0 -or $rectangle[0]+$rectangle[2] -gt $CanvasWidth -or $rectangle[1]+$rectangle[3] -gt $CanvasHeight){throw 'Captured rectangle outside selected canvas'}
   $occupied+=,@($rectangle)
  }
  if($old.description){$descriptions[[string]$old.description]=$true}
 }
 if(@($alarmMap.Keys|Where-Object {!$ids.ContainsKey($_)}).Count){throw 'Observed AL field records require original directory membership'}
 return [pscustomobject]@{occupied=$occupied;descriptions=$descriptions;ids=$ids;bounding_boxes_verified=$complete;collision_verified=$complete;collision_verification_scope=if(@($Objects|Where-Object {$_.kind -ceq 'directory_only'}).Count){'requested rectangles; existing bounds unread'}elseif($complete){'requested and captured native rectangles'}else{'requested and captured native rectangles; text extents are not currently read'}}
}


# Pure signed16 engineering-range validation shared by add and guarded update.
function Get-WeinviewNumericLimits($Value,[int]$DefaultMinimum=-32768,[int]$DefaultMaximum=32767) {
 $limits=@{minimum=$DefaultMinimum;maximum=$DefaultMaximum}
 foreach($field in @('minimum','maximum')) {
  $present=if($Value -is [Collections.IDictionary]){$Value.Contains($field)}else{@($Value.PSObject.Properties.Name) -ccontains $field}
  if($present) {
   $number=$Value.$field
   if(($number -isnot [int] -and $number -isnot [long]) -or $number -lt -32768 -or $number -gt 32767){throw 'Numeric limits must be strict signed16 integers'}
   $limits[$field]=[int]$number
  }
 }
 if($limits.minimum -lt -32768 -or $limits.maximum -gt 32767 -or $limits.minimum -gt $limits.maximum){throw 'Numeric minimum must not exceed maximum within signed16 range'}
 return [pscustomobject]$limits
}
