# Finite CN421/TK realtime Trend. Caller owns clone/save/normal close/reopen.
function Set-WeinviewTrendDefaultAppearance($Session,$Dialog,[int]$Width,[int]$PixelSpacing) {
 if($Width -le 0 -or $PixelSpacing -le 0){throw 'Trend canvas width and sample spacing required'}
 if([IO.Path]::GetExtension([string]$Session.project_path) -ine '.cmtp'){throw 'Observed cMT Trend appearance required'}
 . (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1')
 $n=$Session.native;$h=[long]$Dialog.Hwnd
 $p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32');$p.SelectTabExact($tab.Hwnd,'趋势图')
 $grid=$n.FindUniqueControl($h,1076,'Button','显示');$original=$n.GetCheckboxState($grid.Hwnd)
 if($original -notin @(0,1)){throw 'Native Trend grid state unavailable'}
 try {
  if($original -eq 0){$n.ClickButton($h,1076,'显示')}
  $readyUntil=[DateTime]::UtcNow.AddSeconds(2)
  do {
   $readyEdits=@($n.EnumChildControls($h)|Where-Object {$_.Visible -and $_.Enabled -and $_.Class -ceq 'Edit' -and $_.Id -in @(1716,1717)})
   if($n.GetCheckboxState($grid.Hwnd) -eq 1 -and $readyEdits.Count -eq 2){break}
   if([DateTime]::UtcNow -ge $readyUntil){throw 'Trend grid controls did not become ready after the native checkbox action'}
   Start-Sleep -Milliseconds 20
  } while($true)
  # The interval is measured in sample points. Keep roughly eight columns,
  # independent of the drawing width and requested distance between samples.
  $interval=[int][Math]::Max(10,[Math]::Min(1000,[Math]::Ceiling($Width/(80.0*$PixelSpacing))*10))
  foreach($setting in @(@(1716,$interval),@(1717,4))){
   $edit=$n.FindUniqueControlWithoutLabel($h,[int]$setting[0],'Edit')
   $n.SetControlText($edit.Hwnd,[string]$setting[1])
   if($n.GetControlText($edit.Hwnd,32) -cne [string]$setting[1]){throw 'Trend grid interval readback differs'}
  }
  $gridRgb=@(Invoke-WeinviewAppearanceColor Set $Session.identity_path $h -Rgb @(224,231,239) -ColorButtonId 1039)
  $dateRgb=@(Invoke-WeinviewAppearanceColor Set $Session.identity_path $h -Rgb @(100,116,139) -ColorButtonId 1455)
  return [pscustomobject]@{interval_points=$interval;y_divisions=4;grid_rgb=$gridRgb;date_time_rgb=$dateRgb}
 } finally {
  if($original -eq 0 -and $n.GetCheckboxState($grid.Hwnd) -eq 1){$n.ClickButton($h,1076,'显示')}
 }
}
function Test-WeinviewFiniteTrendRange($Value) {
 if($Value -isnot [int] -and $Value -isnot [long] -and $Value -isnot [double] -and $Value -isnot [decimal]){return $false}
 $number=[double]$Value
 return (![double]::IsNaN($number) -and ![double]::IsInfinity($number) -and [math]::Abs($number) -le [single]::MaxValue)
}
function Assert-WeinviewTrendTypedRange([string]$Type,$Minimum,$Maximum) {
 if(!(Test-WeinviewFiniteTrendRange $Minimum) -or !(Test-WeinviewFiniteTrendRange $Maximum) -or [double]$Minimum -ge [double]$Maximum){throw 'Finite Trend channel minimum below maximum required'}
 switch -CaseSensitive ($Type) {
  '16-bit Signed' {if([double]$Minimum -lt -32768 -or [double]$Maximum -gt 32767 -or [math]::Truncate([double]$Minimum) -ne [double]$Minimum -or [math]::Truncate([double]$Maximum) -ne [double]$Maximum){throw 'Signed native channel requires 16-bit integer range'}}
  '16-bit Unsigned' {if([double]$Minimum -lt 0 -or [double]$Maximum -gt 65535 -or [math]::Truncate([double]$Minimum) -ne [double]$Minimum -or [math]::Truncate([double]$Maximum) -ne [double]$Maximum){throw 'Unsigned native channel requires 16-bit integer range'}}
  '32-bit Float' {}
  default {throw 'Observed native Trend channel data type required'}
 }
}
function Get-WeinviewTrendSamplingBinding($SamplingRows,[string]$Description) {
 $matching=@();for($i=0;$i -lt @($SamplingRows).Count;$i++){if($SamplingRows[$i].header_fields[1] -ceq $Description){$matching+=,[pscustomobject]@{block=$SamplingRows[$i];index=($i+1)}}}
 if($matching.Count -ne 1){throw 'Unique actual sampling description required for Trend.'}
 $configuration=$matching[0].block.finite_configuration
 if(!$configuration -or !$configuration.device -or !$configuration.address_type -or !$configuration.address.ToString() -or ($configuration.period_ms -isnot [int] -and $configuration.period_ms -isnot [long]) -or $configuration.period_ms -lt 1 -or ($null -ne $configuration.maximum_records -and (($configuration.maximum_records -isnot [int] -and $configuration.maximum_records -isnot [long]) -or $configuration.maximum_records -lt 1))){throw 'Trend binding requires an actual positive native sampling period and finite record capacity when present.'}
 $channels=@();if($null -ne $configuration.channels -and @($configuration.channels).Count){$channels=@($configuration.channels)}elseif($configuration.channel_count -eq 1 -and $configuration.data_type){$channels=@([pscustomobject]@{label=[string]$configuration.channel_description;data_type=[string]$configuration.data_type;word_width=1})}
 if($channels.Count -lt 1 -or $channels.Count -ne [int]$configuration.channel_count){throw 'Actual Sampling channel count is absent or inconsistent.'}
 for($i=0;$i -lt $channels.Count;$i++){if(!$channels[$i].label -or $channels[$i].data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float')){throw 'Actual Sampling channel type/label is outside the native CSV contract.'}}
 return [pscustomobject]@{sampling_description=$Description;sampling_index=[int]$matching[0].index;sampling_label=([string]$matching[0].index+'. '+$Description);device=[string]$configuration.device;address_type=[string]$configuration.address_type;address=$configuration.address;period_ms=[int]$configuration.period_ms;maximum_records=$configuration.maximum_records;channel_count=$channels.Count;channels=$channels}
}
function ConvertTo-WeinviewTrendPublicBinding($Binding) {
 if($null -eq $Binding -or !$Binding.sampling_description -or !$Binding.sampling_label -or $Binding.sampling_index -lt 1 -or $null -eq $Binding.address){throw 'Native Trend sampling binding required.'}
 return [pscustomobject]@{sampling_description=$Binding.sampling_description;sampling_index=[int]$Binding.sampling_index;sampling_label=$Binding.sampling_label;address=$Binding.address}
}
function Assert-WeinviewTrendInputs($Objects,[int]$BeforeObjectCount=0,[int]$CanvasWidth=65535,[int]$CanvasHeight=65535) {
 $items=@($Objects);if($items.Count -lt 1 -or $items.Count -gt 4){throw 'Trend new1..4 required.'}
 $result=@();$seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
 foreach($o in $items){
  if($null -eq $o){throw 'Trend object required.'}
  $keys=if($o -is [Collections.IDictionary]){@($o.Keys)}else{@($o.PSObject.Properties.Name)}
  if($keys.Count -lt 7 -or $keys.Count -gt 9 -or @($keys|Where-Object {$_ -cnotin @('kind','description','sampling_description','rect','minimum','maximum','pixel_spacing','channel_y_axes','y_axis_options')}).Count -or $o.kind -cne 'trend'){throw 'Exact finite Trend fields required.'}
  $channelAxes=$null
  if($keys -ccontains 'channel_y_axes'){
   $channelAxes=@($o.channel_y_axes);if($channelAxes.Count -lt 1 -or $channelAxes.Count -gt 256){throw 'Trend channel_y_axes requires finite nonempty complete list.'}
   $axisLabels=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
   foreach($axis in $channelAxes){$axisKeys=if($axis -is [Collections.IDictionary]){@($axis.Keys)}else{@($axis.PSObject.Properties.Name)}
    if($axisKeys.Count -ne 4 -or @($axisKeys|Where-Object {$_ -cnotin @('label','axis','minimum','maximum')}).Count -or $axis.label -isnot [string] -or !$axis.label.Trim() -or !$axisLabels.Add($axis.label) -or $axis.axis -cnotin @('none','main','auxiliary') -or !(Test-WeinviewFiniteTrendRange $axis.minimum) -or !(Test-WeinviewFiniteTrendRange $axis.maximum) -or [double]$axis.minimum -ge [double]$axis.maximum){throw 'Exact Trend channel axis/label/finite range required.'}
   }
  }
  $axisOptions=$null
  if($keys -ccontains 'y_axis_options'){$axisOptions=$o.y_axis_options;$optionKeys=if($axisOptions -is [Collections.IDictionary]){@($axisOptions.Keys)}else{@($axisOptions.PSObject.Properties.Name)}
   if($optionKeys.Count -ne 2 -or @($optionKeys|Where-Object {$_ -cnotin @('hide_when_channel_invisible','value_alignment')}).Count -or $axisOptions.hide_when_channel_invisible -isnot [bool] -or $axisOptions.value_alignment -cnotin @('center_on_tick','full_text')){throw 'Exact Trend Y axis option fields required.'}
  }
  foreach($field in @('description','sampling_description')){$value=$o.$field;if($value -isnot [string] -or !$value.Trim().Length -or $value.Length -gt 256 -or $value -match '[\x00-\x1f\x7f-\x9f,"]'){throw 'Trend names1..256UTF16 require nonblank/no controls/comma/quote.'};$null=[Text.UTF8Encoding]::new($false,$true).GetBytes($value)}
  if(!$seen.Add($o.description)){throw 'New Trend descriptions must be unique.'}
  foreach($field in @('minimum','maximum')){if(!(Test-WeinviewFiniteTrendRange $o.$field)){throw 'Finite native Trend range required.'}}
  if(($o.pixel_spacing -isnot [int] -and $o.pixel_spacing -isnot [long]) -or [double]$o.minimum -ge [double]$o.maximum -or $o.pixel_spacing -lt 1 -or $o.pixel_spacing -gt 800){throw 'Native finite min<max and product spacing1..800 required.'}
  if($channelAxes -and ($channelAxes[0].minimum -ne $o.minimum -or $channelAxes[0].maximum -ne $o.maximum)){throw 'Trend first channel range must equal the canonical minimum and maximum.'}
  $rect=@($o.rect);if($rect.Count -ne 4){throw 'Trend rectangle requires four integers.'};foreach($v in $rect){if($v -isnot [int] -and $v -isnot [long]){throw 'Trend strict rectangle integers required.'}}
  if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[0] -ge $CanvasWidth -or $rect[1] -ge $CanvasHeight -or $rect[2] -lt 20 -or $rect[3] -lt 20 -or $rect[2] -gt $CanvasWidth -or $rect[3] -gt $CanvasHeight -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Trend product20x20 minimum rectangle must fit selected800x480.'}
  $entry=[ordered]@{kind='trend';description=$o.description;sampling_description=$o.sampling_description;rect=@($rect|ForEach-Object {[int]$_});minimum=[double]$o.minimum;maximum=[double]$o.maximum;pixel_spacing=[int]$o.pixel_spacing}
  if($channelAxes){$entry.channel_y_axes=@($channelAxes|ForEach-Object {[pscustomobject]@{label=[string]$_.label;axis=[string]$_.axis;minimum=[double]$_.minimum;maximum=[double]$_.maximum}})}
  if($axisOptions){$entry.y_axis_options=[pscustomobject]@{hide_when_channel_invisible=[bool]$axisOptions.hide_when_channel_invisible;value_alignment=[string]$axisOptions.value_alignment}}
  $result+=[pscustomobject]$entry
 }
 return $result
}

function Get-WeinviewTrendExpectedChannelYAxes($Requested,$Binding) {
 $channels=@($Binding.channels);$specified=if($null -ne $Requested.channel_y_axes){@($Requested.channel_y_axes)}else{@()}
 if($specified.Count -and $specified.Count -ne $channels.Count){throw 'Trend channel_y_axes must cover every actual Sampling channel.'}
 $result=@();for($i=0;$i -lt $channels.Count;$i++){
  $channel=$channels[$i];$requestedAxis=if($specified.Count){$specified[$i]}else{$null}
  if($requestedAxis -and $requestedAxis.label -cne $channel.label){throw 'Trend channel_y_axes must follow actual Sampling label order.'}
  $axis=if($requestedAxis){[string]$requestedAxis.axis}else{'none'}
  $nativeAxis=switch($axis){none{'无'} main{'主轴'} auxiliary{'辅助轴'} default{throw 'Unknown requested Trend Y axis.'}}
  $minimum=if($requestedAxis){[double]$requestedAxis.minimum}else{[double]$Requested.minimum}
  $maximum=if($requestedAxis){[double]$requestedAxis.maximum}else{[double]$Requested.maximum}
  Assert-WeinviewTrendTypedRange ([string]$channel.data_type) $minimum $maximum
  $result+=[pscustomobject]@{row=$i+1;label=[string]$channel.label;axis=$axis;native_axis=$nativeAxis;minimum=$minimum;maximum=$maximum}
 }
 return $result
}

function Assert-WeinviewTrendChannelYAxes($Evidence,$Expected,$Requested) {
 if(!$Evidence -or @($Evidence.channels).Count -ne @($Expected).Count){throw 'Actual per-channel Trend Y axis evidence absent.'}
 if(@($Expected|Where-Object {$_.axis -cne 'none'}).Count -and !$Evidence.grid_display_enabled){throw 'Trend Y axis Grid display prerequisite not enabled.'}
 for($i=0;$i -lt @($Expected).Count;$i++){$want=$Expected[$i];$actual=$Evidence.channels[$i]
  if([int]$actual.row -ne [int]$want.row -or [string]$actual.label -cne [string]$want.label -or [string]$actual.axis -cne [string]$want.axis -or [double]$actual.minimum -ne [double]$want.minimum -or [double]$actual.maximum -ne [double]$want.maximum){throw ('Trend Y axis/range native readback differs at channel '+($i+1))}
 }
 if($Requested.y_axis_options){if($Evidence.options_available -ne $true){throw 'Requested Trend Y axis options are not available in the current native page.'};if([bool]$Evidence.hide_when_channel_invisible -ne [bool]$Requested.y_axis_options.hide_when_channel_invisible -or [string]$Evidence.value_alignment -cne [string]$Requested.y_axis_options.value_alignment){throw 'Trend Y axis options native readback differs.'}}
}

function Read-WeinviewTrendDialog($Session,$Dialog,[string]$ObjectId,$SamplingBinding=$null) {
 $n=$Session.native;$h=[long]$Dialog.Hwnd;$title=[string]$Dialog.Title
 if($title -cne '趋势图的属性' -or $ObjectId -cnotmatch '^TD_[0-9]{1,5}$'){throw 'Existing exact Trend title and real TD identity required.'}
 $identity=[PLCCode.Weinview.TrendRibbonControls]::RequireDialog($n,$h,$Session.main.Hwnd,$title)
 $p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
 $tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32')
 $tabs=@($p.TabNames($tab.Hwnd)) -join '|'
 if($tabs -cnotin @('一般属性|趋势图|通道|Y 轴|安全|图片|轮廓','一般属性|显示|趋势图|通道|Y 轴|数据格式|安全|图片|轮廓','一般属性|显示|趋势图|通道|Y 轴|数据格式|安全|图片')){throw 'Observed existing Trend tab profile differs.'}
 function TrendTab([string]$name){$null=[PLCCode.Weinview.TrendRibbonControls]::RequireDialog($n,$h,$Session.main.Hwnd,$title);$p.SelectTabExact($tab.Hwnd,$name)}
 function TrendControl([int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($h,$id,$class)}
 function TrendInteger([int]$id){$text=$n.GetControlText((TrendControl $id 'Edit').Hwnd,64);$value=0;if(![int]::TryParse($text,[ref]$value)){throw 'Trend finite integer profile required.'};return [int]$value}
 function TrendRange([int]$id){$text=$n.GetControlText((TrendControl $id 'Edit').Hwnd,64);$value=0.0;if(![double]::TryParse($text,[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture,[ref]$value) -or [double]::IsNaN($value) -or [double]::IsInfinity($value)){throw 'Trend finite native range required.'};return [double]$value}
 function TrendState([int]$id,[string]$label){$control=$n.FindUniqueControl($h,$id,'Button',$label);$state=if($id -in @(1991,1735)){$p.GetRadioState($control.Hwnd)}else{$n.GetCheckboxState($control.Hwnd)};if($state -notin @(0,1)){throw 'Actual Trend standard checkbox/radio state required.'};return [bool]($state -eq 1)}
 TrendTab '一般属性';$description=$n.GetControlText((TrendControl 1174 'Edit').Hwnd,4096);$samplingControl=TrendControl 1097 'ComboBox';$label=$p.ComboSelected($samplingControl.Hwnd)
 if(@($p.ComboItems($samplingControl.Hwnd)|Where-Object {$_ -ceq $label}).Count -ne 1){throw 'Exact selected Trend sampling label must be unique.'}
 $samplingMatch=[regex]::Match($label,'^([1-9][0-9]{0,2})\. (.+)$');if(!$samplingMatch.Success -or [int]$samplingMatch.Groups[1].Value -gt 256){throw 'Actual Trend sampling index/full label format required.'}
 $isCmt=([IO.Path]::GetExtension([string]$Session.project_path) -ieq '.cmtp');$mode=$null;$unit=$null
 if($isCmt){$unitControl=TrendControl 1338 'ComboBox';$unit=$p.ComboSelected($unitControl.Hwnd);if($unit -cnotin @('毫米','时间','像素') -or @($p.ComboItems($unitControl.Hwnd)|Where-Object {$_ -ceq $unit}).Count -ne 1){throw 'Actual cMT Trend distance unit selection required.'}}
 else{$modeControl=@($n.EnumChildControls($h)|Where-Object {$_.Id -eq 2057 -and $_.Class -ceq 'ComboBox' -and $_.Visible});if($modeControl.Count -gt 1){throw 'Trend display mode control ambiguous.'};if($modeControl.Count -eq 1){$mode=$p.ComboSelected($modeControl[0].Hwnd)}}
 $spacing=TrendInteger 1993
 $dynamic=TrendState 2010 '动态调整两取样绘点间距';$inspection=TrendState 2009 '启用';$timeExport=TrendState 2011 '启用'
 $pixel=$null;$time=$null;$pause=$null
 if(!$isCmt){foreach($entry in @(@(1991,'像素'),@(1735,'时间'),@(2008,'启用'))){$control=@($n.EnumChildControls($h)|Where-Object {$_.Id -eq [int]$entry[0] -and $_.Class -ceq 'Button' -and $_.Visible});if($control.Count -gt 1){throw 'Trend legacy state control ambiguous.'};if($control.Count -eq 1){$value=TrendState ([int]$entry[0]) ([string]$entry[1]);switch([int]$entry[0]){1991{$pixel=$value}1735{$time=$value}2008{$pause=$value}}}}}
 $gridDisplay=$null;if($SamplingBinding -and $isCmt){TrendTab '趋势图';$gridDisplay=TrendState 1076 '显示'}
 TrendTab '通道';$channelEvidence=$null;$channelRanges=$null
 if($SamplingBinding){$channels=@($SamplingBinding.channels);$labels=[string[]]@($channels|ForEach-Object {$_.label});$types=[string[]]@($channels|ForEach-Object {$_.data_type});$channelEvidence=[PLCCode.Weinview.TrendRibbonControls]::ReadSamplingChannels($n,$h,$Session.main.Hwnd,$title,$labels,$types);if(!$channelEvidence.all_enabled){throw 'Native Trend channel checked readback differs.'};$channelRanges=@([PLCCode.Weinview.TrendRibbonControls]::ReadChannelRanges($n,$h,$Session.main.Hwnd,$title,$labels,$types))}
 if($isCmt -and $SamplingBinding){$null=[PLCCode.Weinview.TrendRibbonControls]::SelectChannelRow($n,$h,$Session.main.Hwnd,$title,$labels,$types,1);$range=TrendState 1688 '取自寄存器';$minimum=[double]$channelRanges[0].minimum;$maximum=[double]$channelRanges[0].maximum;$widthRaw=$p.ComboSelected((TrendControl 1299 'ComboBox').Hwnd);$channelControl=TrendState 1689 '启用'}
 else{$range=TrendState 1688 '取自寄存器';$minimum=TrendRange 1297;$maximum=TrendRange 1298;$widthRaw=$p.ComboSelected((TrendControl 1299 'ComboBox').Hwnd);$channelControl=TrendState 1689 '启用';if($channelRanges){$minimum=[double]$channelRanges[0].minimum;$maximum=[double]$channelRanges[0].maximum}}
 $width=0;if(![int]::TryParse($widthRaw,[ref]$width) -or $width -le 0){throw 'Actual Trend line-width integer required.'}
 $channelAxes=$null;$channelYAxisEvidence=$null
 if($SamplingBinding -and $isCmt){TrendTab 'Y 轴';$channelAxes=@([PLCCode.Weinview.TrendRibbonControls]::ReadChannelAxes($n,$h,$Session.main.Hwnd,$title,$labels,$types))
  $optionControls=@($n.EnumChildControls($h));$hideControls=@($optionControls|Where-Object {$_.Id -eq 1332 -and $_.Class -ceq 'Button'});$alignmentControls=@($optionControls|Where-Object {$_.Id -eq 1370 -and $_.Class -ceq 'ComboBox'})
  if($hideControls.Count -gt 1 -or $alignmentControls.Count -gt 1){throw 'Trend Y axis option controls are ambiguous.'}
  if($hideControls.Count -eq 1 -and $hideControls[0].Title -cne '通道数据不显示时隐藏通道 Y 刻度'){throw 'Actual Trend Y axis hide option label changed.'}
  $optionsAvailable=($hideControls.Count -eq 1 -and $alignmentControls.Count -eq 1 -and $hideControls[0].Visible -and $hideControls[0].Enabled -and $alignmentControls[0].Visible -and $alignmentControls[0].Enabled)
  $hide=$null;$alignment=$null;$alignmentText=$null
  if($optionsAvailable){
   $hide=TrendState 1332 '通道数据不显示时隐藏通道 Y 刻度';$alignmentControl=$alignmentControls[0];$alignmentText=$p.ComboSelected($alignmentControl.Hwnd);$alignmentItems=@($p.ComboItems($alignmentControl.Hwnd))
   if(($alignmentItems -join '|') -cne '以刻度为中心|完整显示'){throw 'Actual Trend Y axis value alignment choices changed.'}
   $alignment=switch($alignmentText){'以刻度为中心'{'center_on_tick'} '完整显示'{'full_text'} default{throw 'Actual Trend Y axis value alignment changed.'}}
  }
  $rows=@();for($i=0;$i -lt $channelAxes.Count;$i++){$axis=switch([string]$channelAxes[$i].axis){'无'{'none'} '主轴'{'main'} '辅助轴'{'auxiliary'} default{throw 'Actual Trend Y axis choice changed.'}}
   $rows+=[pscustomobject]@{row=$i+1;label=[string]$channelAxes[$i].label;axis=$axis;native_axis=[string]$channelAxes[$i].axis;minimum=[double]$channelRanges[$i].minimum;maximum=[double]$channelRanges[$i].maximum}}
  $channelYAxisEvidence=[pscustomobject]@{grid_display_enabled=[bool]$gridDisplay;channels=$rows;options_available=[bool]$optionsAvailable;hide_when_channel_invisible=$hide;value_alignment=$alignment;native_value_alignment=$alignmentText}
 }
 $rect=$null;$aspect=$null;$widthPercent=$null;$heightPercent=$null
 if(!$isCmt){TrendTab '轮廓';$rect=@(foreach($id in @(1050,1052,1045,1044)){TrendInteger $id});$aspect=TrendState 1602 '保持长/宽比例';$widthPercent=TrendInteger 1056;$heightPercent=TrendInteger 1060}
 $actual=[ordered]@{kind='trend';description=$description;sampling_label=$label;sampling_index=[int]$samplingMatch.Groups[1].Value;sampling_description=$samplingMatch.Groups[2].Value;display_mode=$mode;display_unit=$unit;pixel_spacing=$spacing;pixel_mode=$pixel;time_mode=$time;dynamic_spacing=$dynamic;pause_enabled=$pause;inspection_enabled=$inspection;time_export_enabled=$timeExport;range_from_register=$range;minimum=$minimum;maximum=$maximum;line_width=[int]$width;channel_control_enabled=$channelControl;rectangle=$rect;aspect_locked=$aspect;width_percent=$widthPercent;height_percent=$heightPercent}
 return [pscustomobject]@{actual=$actual;dialog_identity=$identity;sampling_channels_enabled_evidence=$channelEvidence;channel_range_evidence=$channelRanges;channel_axis_evidence=$channelAxes;channel_y_axis_evidence=$channelYAxisEvidence;full_properties_verified=$false;channel_grid_values_verified=$false}
}

function Assert-WeinviewTrendCreated($Actual,$Requested,$Binding,$YAxisEvidence=$null) {
 $differences=@()
 $expectedAxes=@(Get-WeinviewTrendExpectedChannelYAxes $Requested $Binding)
 foreach($field in @('kind','description','sampling_label','sampling_index','sampling_description','pixel_spacing','minimum','maximum')){
  $expected=switch($field){kind{'trend'} sampling_label{$Binding.sampling_label} sampling_index{$Binding.sampling_index} minimum{$expectedAxes[0].minimum} maximum{$expectedAxes[0].maximum} default{$Requested.$field}}
  if([string]$Actual.$field -cne [string]$expected){$differences+=($field+': expected='+[string]$expected+' actual='+[string]$Actual.$field)}
 }
 if($null -eq $Actual.rectangle -or (@($Actual.rectangle) -join ',') -cne (@($Requested.rect) -join ',')){$differences+=('rectangle: expected='+(@($Requested.rect)-join ',')+' actual='+(@($Actual.rectangle)-join ','))}
 if($differences.Count){throw ('Confirmed requested Trend fields differ from native readback: '+($differences -join '; '))}
 if($YAxisEvidence){Assert-WeinviewTrendChannelYAxes $YAxisEvidence $expectedAxes $Requested}
 elseif($Requested.channel_y_axes -or $Requested.y_axis_options){throw 'Requested Trend Y axis readback absent.'}
}

function Read-WeinviewTrendSnapshot($Session,[string]$SourceSha256,[string]$EvidencePrefix,[string]$BridgeRoot,[string[]]$TargetObjectIds=@(),$Created=@()) {
 $snapshot=Read-WeinviewAdditionSnapshot $Session $SourceSha256 $EvidencePrefix $BridgeRoot
 $targetEvidence=@{}
 foreach($id in @($TargetObjectIds)){
  $created=@($Created|Where-Object {$_.object_id -ceq $id});if($created.Count -ne 1){throw 'Trend target creation identity required.'}
  $row=@($snapshot.directory.rows|Where-Object {$_.object_id -ceq $id -and $_.kind -ceq 'Trend'});if($row.Count -ne 1){throw 'Unique native Trend target directory row required.'}
  $geometry=Read-WeinviewTrendNativeGeometry $Session $id ($EvidencePrefix+'.'+$id+'.native-geometry.json')
  $rect=@($geometry.rectangle)
  $directory=Get-WeinviewWindowDirectory -Session $Session
  try{$target=@($directory.rows|Where-Object {$_.object_id -ceq $id -and $_.kind -ceq 'Trend'});if($target.Count -ne 1){throw 'Native Trend target changed before property read.'};$dialog=Open-WeinviewDirectoryObject $Session $directory $target[0]
   try{$read=Read-WeinviewTrendDialog $Session $dialog $id $created[0].sampling_binding;$read.actual.rectangle=@($rect);Assert-WeinviewTrendCreated $read.actual $created[0].requested $created[0].sampling_binding $read.channel_y_axis_evidence;$record=New-WeinviewObjectRecord $id $read.actual}finally{Close-WeinviewScreenDialog $Session $dialog $false}
  }finally{if($directory.restore_context -and !@($Session.native.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $directory.restore_context}}
  $snapshot.objects=@($snapshot.objects|ForEach-Object {if($_.object_id -ceq $id){$record}else{$_}})
  $targetEvidence[$id]=$read
 }
 $screenSnapshot=[pscustomobject]@{screen=$snapshot.screen;window_name=$snapshot.window_name;objects=$snapshot.objects;directory=$snapshot.directory;canvas_width=$snapshot.canvas_width;canvas_height=$snapshot.canvas_height;directory_only_scope=$true}
 return [pscustomobject]@{screen_snapshot=$screenSnapshot;alarm_displays=@();target_evidence=$targetEvidence;directory_only_scope=$true}
}
function Read-WeinviewTrendNativeGeometry($Session,[string]$ObjectId,[string]$EvidencePath) {
 if($ObjectId -cnotmatch '^TD_[0-9]{1,5}$'){throw 'Exact native Trend ID required for geometry read.'}
 $inventory=Get-WeinviewWindowObjectInventory $Session
 if($inventory.read_route -cne 'native_host' -or [int]$inventory.window_number -ne [int]$Session.window_number){throw 'Current native-host Trend window inventory required.'}
 $rows=@($inventory.rows|Where-Object {$_.object_id -ceq $ObjectId -and $_.kind -ceq 'Trend' -and $_.native_kind -ceq '趋势图'})
 if($rows.Count -ne 1){throw 'Unique native-host Trend geometry row required.'}
 $box=@($rows[0].raw_native_bbox)
 if($box.Count -ne 4){throw 'Native-host Trend bbox must have four fields.'}
 $values=@();foreach($part in $box){$value=0;if(![int]::TryParse([string]$part,[ref]$value) -or $value -lt 0){throw 'Native-host Trend bbox must contain nonnegative integers.'};$values+=,[int]$value}
 if($values[2] -ge [int]::MaxValue -or $values[3] -ge [int]::MaxValue){throw 'Native-host Trend bbox extent overflows.'}
 $rect=@($values[0],$values[1],($values[2]+1),($values[3]+1))
 if(([long]$rect[0]+$rect[2]) -gt [int]$Session.window_width -or ([long]$rect[1]+$rect[3]) -gt [int]$Session.window_height){throw 'Native-host Trend bbox exceeds selected canvas.'}
 $result=[pscustomobject]@{object_id=$ObjectId;window_number=[int]$inventory.window_number;read_route='native_host';native_kind=[string]$rows[0].native_kind;raw_native_bbox=$box;rectangle=$rect;extent_rule='raw_width_height_plus_one'}
 if($EvidencePath){WritePrivateJson $EvidencePath $result}
 return $result
}
function Read-WeinviewTrendSelectedRectangle($Session,$Scene,$Guard,[string]$ObjectId,$ExpectedRect,[string]$Prefix,[bool]$Resize=$false) {
 if($Resize){
  # A freshly placed native Trend still has the vendor's default size, which
  # may extend beyond the canvas. Apply the requested contour before validating
  # the persisted geometry; the final read below still requires a full fit.
  $requested=@($ExpectedRect)
  if($requested.Count -ne 4){throw 'Four requested Trend rectangle values required'}
  foreach($value in $requested){if(($value -isnot [int] -and $value -isnot [long]) -or $value -lt 0){throw 'Nonnegative integer Trend rectangle required'}}
  if($requested[2] -lt 1 -or $requested[3] -lt 1 -or ([long]$requested[0]+$requested[2]) -gt [int]$Session.window_width -or ([long]$requested[1]+$requested[3]) -gt [int]$Session.window_height){throw 'Requested Trend rectangle must fit the selected canvas'}
  $directory=Get-WeinviewWindowDirectory -Session $Session
  $row=@($directory.rows|Where-Object {$_.object_id -ceq $ObjectId -and $_.kind -ceq 'Trend'})
  if($row.Count -ne 1){throw 'Exact Trend directory element required for geometry'}
  $dialog=Open-WeinviewDirectoryObject $Session $directory $row[0]
  $n=$Session.native;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path)
  $tab=$n.FindUniqueControlWithoutLabel($dialog.Hwnd,12320,'SysTabControl32')
  if(@($p.TabNames($tab.Hwnd)) -cnotcontains '轮廓'){throw 'Native Trend contour element is unavailable; coordinate resizing is disabled'}
  $p.SelectTabExact($tab.Hwnd,'轮廓')
  $aspect=$n.FindUniqueControl($dialog.Hwnd,1602,'Button','保持长/宽比例')
  if($n.GetCheckboxState($aspect.Hwnd) -eq 1){$n.ClickButton($dialog.Hwnd,1602,'保持长/宽比例')}
  for($i=0;$i -lt 4;$i++){$edit=$n.FindUniqueControlWithoutLabel($dialog.Hwnd,(@(1050,1052,1045,1044)[$i]),'Edit');$n.SetControlText($edit.Hwnd,[string]$ExpectedRect[$i])}
  Close-WeinviewScreenDialog $Session $dialog $true
  $after=Read-WeinviewTrendNativeGeometry $Session $ObjectId ($Prefix+'.native-after.json')
  if((@($after.rectangle) -join ',') -cne (@($ExpectedRect) -join ',')){throw 'Native-host Trend rectangle differs after contour update.'}
  return [int[]]@($after.rectangle)
 }
 $geometry=Read-WeinviewTrendNativeGeometry $Session $ObjectId ($Prefix+'.native-before.json')
 return [int[]]@($geometry.rectangle)
}

function Assert-WeinviewTrendsPersisted($Applied,$Reopened,$Session=$null) {
 Assert-WeinviewAdditionSnapshots $Applied.after_snapshot.screen_snapshot $Reopened.screen_snapshot 0
 foreach($old in @($Applied.objects)){$actual=@($Reopened.screen_snapshot.objects|Where-Object {$_.object_id -ceq $old.object_id});if($actual.Count -ne 1 -or !$actual[0].supported -or $actual[0].kind -cne 'trend' -or $actual[0].object_sha256 -cne $old.object_sha256 -or $actual[0].canonical_json -cne $old.canonical_json){throw 'New finite Trend canonical differs after actual save/reopen.'}}
 $bound=@($Applied.creation_evidence|Where-Object {$_.sampling_binding.channel_count -ge 1})
 foreach($created in $bound){
  $read=$Reopened.target_evidence[[string]$created.object_id]
  $savedRecord=@($Reopened.screen_snapshot.objects|Where-Object {$_.object_id -ceq $created.object_id})
  if(!$read -or $savedRecord.Count -ne 1){throw 'Persisted selected Trend target evidence missing.'}
  $read.actual.rectangle=@($savedRecord[0].rectangle)
  Assert-WeinviewTrendCreated $read.actual $created.requested $created.sampling_binding $read.channel_y_axis_evidence
  $created|Add-Member -NotePropertyName persisted_sampling_channels_enabled_evidence -NotePropertyValue $read.sampling_channels_enabled_evidence -Force
  $created|Add-Member -NotePropertyName persisted_channel_y_axis_evidence -NotePropertyValue $read.channel_y_axis_evidence -Force
 }
}

function Invoke-WeinviewTrendAddition($Session,$Objects,[string]$SourceSha256,$BeforeSnapshot,[string]$BridgeRoot) {
 foreach($file in @('PlcConfigurationCandidate.ps1','ScreenWorkflow.ps1','ObjectRibbonAction.ps1','CommonObjectsAdditionOperation.ps1','AlarmDisplayOperation.ps1','SamplingCsvCodec.ps1','SamplingRibbonAction.ps1','SamplingOperation.ps1','TrendRibbonAction.ps1')){. (Join-Path $BridgeRoot $file)}
 Assert-WeinviewAlarmDisplayProfile $Session $SourceSha256
 $prefix=$Session.output_path+'.trends-'+[guid]::NewGuid().ToString('N')
 $items=@(Assert-WeinviewTrendInputs $Objects)
 $samplingRead=Invoke-WeinviewSamplingRead $Session ($prefix+'.sampling.csv') $SourceSha256
 if(!$samplingRead.native_export_verified -or $samplingRead.empty_csv_derived -or $samplingRead.native_empty_table_verified){throw 'Actual nonempty same-source Sampling native export required for Trend binding.'}
 $sampling=$samplingRead.sampling_csv;$samplingRows=@($sampling.blocks|Where-Object {$_.is_sampling});$bindings=@()
 foreach($o in $items){$binding=Get-WeinviewTrendSamplingBinding $samplingRows $o.sampling_description;$bindings+=,$binding}
 $before=Read-WeinviewTrendSnapshot $Session $SourceSha256 ($prefix+'.before') $BridgeRoot
 if($BeforeSnapshot){Assert-WeinviewAdditionSnapshots $BeforeSnapshot.screen_snapshot $before.screen_snapshot 0}
 $items=@(Assert-WeinviewTrendInputs $Objects @($before.screen_snapshot.objects).Count ([int]$Session.window_width) ([int]$Session.window_height))
 $n=$Session.native;$p=[PLCCode.Weinview.Research.NativePropertyCandidate]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path);$semantic=[PLCCode.Weinview.NativeSemanticControls]::new($n);$isCmt=([IO.Path]::GetExtension([string]$Session.project_path) -ieq '.cmtp')
 if([int]$before.screen_snapshot.directory.window_number -ne [int]$Session.window_number){throw 'Trend directory differs from verified selected window.'}
 $scene=[PLCCode.Weinview.Research.NativeScreenScene]::new($Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd,[int]$Session.window_number,[string]$Session.window_name,[int]$Session.window_width,[int]$Session.window_height)
 $canvasGuard=[PLCCode.Weinview.AlarmDisplayDialogControls]::new($n,$Session.process.Id,$Session.process.StartTime.ToUniversalTime().Ticks,$Session.exe_path,$Session.main.Hwnd)
 function TrendSet([long]$h,[int]$id,[string]$value){$c=$n.FindUniqueControlWithoutLabel($h,$id,'Edit');$n.SetControlText($c.Hwnd,$value);if($n.GetControlText($c.Hwnd,4096) -cne $value){throw 'Actual Trend edit immediate readback differs.'}}
 function TrendRequiredState([long]$h,[int]$id,[string]$label,[int]$state){$control=$n.FindUniqueControl($h,$id,'Button',$label);$actual=if($id -in @(1991,1735)){$p.GetRadioState($control.Hwnd)}else{$n.GetCheckboxState($control.Hwnd)};if($actual -ne $state){throw 'Actual default Trend state differs; no speculative setters.'}}
 $records=@();$evidence=@();$confirmedReads=@{};$restore=$null
 try{for($i=0;$i -lt $items.Count;$i++){
  $o=$items[$i];$binding=$bindings[$i];$expectedAxes=@(Get-WeinviewTrendExpectedChannelYAxes $o $binding)
  if(!$isCmt -and ($o.channel_y_axes -or $o.y_axis_options)){throw 'Requested Trend Y axis customization requires the observed cMT native page.'}
  $directory=Get-WeinviewWindowDirectory -Session $Session;if(!$restore){$restore=$directory.restore_context};$oldIds=@($directory.rows|ForEach-Object {$_.object_id})
  $journal=[ordered]@{phase='entry';requested=$o;sampling_binding=$binding;entry=$null;placement=$null;paint_evidence=$null;object_id=$null;native_fields_verified=$false;channel_grid_values_verified=$false;full_properties_verified=$false}
  $journalPath=$prefix+'.'+$i+'.creation.json'
  try{
   $entry=Invoke-WeinviewTrendRibbon $Session $semantic;$journal.entry=$entry;$dialog=$entry.dialog;$h=$dialog.Hwnd;$tab=$n.FindUniqueControlWithoutLabel($h,12320,'SysTabControl32')
   $newTabs=@($p.TabNames($tab.Hwnd)) -join '|'
   if($newTabs -cnotin @('一般属性|趋势图|通道|Y 轴|安全|图片','一般属性|显示|趋势图|通道|Y 轴|数据格式|安全|图片')){throw 'Actual new Trend six/eight-tab profile required.'}
   $p.SelectTabExact($tab.Hwnd,'一般属性');$journal.phase='configure_general';TrendSet $h 1174 $o.description;TrendSet $h 1993 ([string]$o.pixel_spacing)
   $combo=$n.FindUniqueControlWithoutLabel($h,1097,'ComboBox');if(@($p.ComboItems($combo.Hwnd)|Where-Object {$_ -ceq $binding.sampling_label}).Count -ne 1){throw 'Requested full original sampling Combo label not unique.'};$p.SelectComboExact($combo.Hwnd,$binding.sampling_label);if($p.ComboSelected($combo.Hwnd) -cne $binding.sampling_label){throw 'Actual Trend sampling selection differs.'}
   if($isCmt -and @($expectedAxes|Where-Object {$_.axis -cne 'none'}).Count){$p.SelectTabExact($tab.Hwnd,'趋势图');$gridDisplay=$n.FindUniqueControl($h,1076,'Button','显示');$beforeGrid=$n.GetCheckboxState($gridDisplay.Hwnd);if($beforeGrid -notin @(0,1)){throw 'Native Trend Grid display state unknown.'};if($beforeGrid -eq 0){$n.ClickButton($h,1076,'显示')};if($n.GetCheckboxState($gridDisplay.Hwnd) -ne 1){throw 'Trend Y axis Grid display prerequisite not enabled.'};$journal['y_axis_grid_display_evidence']=[pscustomobject]@{control_id=1076;label='显示';before=$beforeGrid;after=1}}
   if($isCmt){$journal.default_appearance=Set-WeinviewTrendDefaultAppearance $Session $dialog ([int]$o.rect[2]) ([int]$o.pixel_spacing)}
   $p.SelectTabExact($tab.Hwnd,'通道');$journal.phase='configure_channel'
   $channels=@($binding.channels);$journal['sampling_channels_enabled_evidence']=[PLCCode.Weinview.TrendRibbonControls]::EnableSamplingChannels($n,$h,$Session.main.Hwnd,'新增 趋势图',[string[]]@($channels|ForEach-Object {$_.label}),[string[]]@($channels|ForEach-Object {$_.data_type}))
   $journal['channel_range_write_evidence']=[PLCCode.Weinview.TrendRibbonControls]::SetChannelRangesPerRow($n,$h,$Session.main.Hwnd,'新增 趋势图',[string[]]@($channels|ForEach-Object {$_.label}),[string[]]@($channels|ForEach-Object {$_.data_type}),[double[]]@($expectedAxes|ForEach-Object {$_.minimum}),[double[]]@($expectedAxes|ForEach-Object {$_.maximum}))
   if($isCmt -and ($o.channel_y_axes -or $o.y_axis_options)){$p.SelectTabExact($tab.Hwnd,'Y 轴');$journal.phase='configure_y_axis'
    $journal['channel_axis_write_evidence']=[PLCCode.Weinview.TrendRibbonControls]::SetChannelAxes($n,$h,$Session.main.Hwnd,'新增 趋势图',[string[]]@($channels|ForEach-Object {$_.label}),[string[]]@($channels|ForEach-Object {$_.data_type}),[string[]]@($expectedAxes|ForEach-Object {$_.native_axis}))
    if($o.y_axis_options){$hideControl=$n.FindUniqueControl($h,1332,'Button','通道数据不显示时隐藏通道 Y 刻度');$wantedHide=if($o.y_axis_options.hide_when_channel_invisible){1}else{0};if($n.GetCheckboxState($hideControl.Hwnd) -ne $wantedHide){$n.ClickButton($h,1332,'通道数据不显示时隐藏通道 Y 刻度')};if($n.GetCheckboxState($hideControl.Hwnd) -ne $wantedHide){throw 'Trend Y axis hide preference differs.'}
     $alignControl=$n.FindUniqueControlWithoutLabel($h,1370,'ComboBox');$wantedAlignment=if($o.y_axis_options.value_alignment -ceq 'full_text'){'完整显示'}else{'以刻度为中心'};if((@($p.ComboItems($alignControl.Hwnd)) -join '|') -cne '以刻度为中心|完整显示'){throw 'Trend Y axis alignment choices changed.'};$p.SelectComboExact($alignControl.Hwnd,$wantedAlignment);if($p.ComboSelected($alignControl.Hwnd) -cne $wantedAlignment){throw 'Trend Y axis alignment native selection differs.'}}
   }
   Close-WeinviewScreenDialog $Session $dialog $true;$journal.phase='placement';$null=$n.EnumTopWindows()
   $placement=$scene.CapturePlacement();$journal.placement=$placement;$scene.PlaceNewObject($placement,$o.rect[0],$o.rect[1]);$scene.EndPlacement()
   $freshDirectory=Get-WeinviewWindowDirectory -Session $Session;$fresh=@($freshDirectory.rows|Where-Object {$_.object_id -cnotin $oldIds});if($fresh.Count -ne 1 -or $fresh[0].kind -cne 'Trend' -or $fresh[0].object_id -cnotmatch '^TD_[0-9]{1,5}$' -or @($freshDirectory.rows).Count -ne $oldIds.Count+1){throw 'One actual new TD directory record required; reviewed shared Trend integration must be ready.'};$journal.object_id=$fresh[0].object_id
   if($isCmt){$journal.phase='exact_canvas_rectangle';$journal.native_rectangle=Read-WeinviewTrendSelectedRectangle $Session $scene $canvasGuard $journal.object_id $o.rect ($prefix+'.'+$i+'.'+$journal.object_id) $true;if((@($journal.native_rectangle)-join ',') -cne (@($o.rect)-join ',')){throw 'Native selected Trend rectangle differs from requested size.'}}
   if(!$isCmt){$property=Open-WeinviewDirectoryObject $Session $freshDirectory $fresh[0];$null=[PLCCode.Weinview.TrendRibbonControls]::RequireDialog($n,$property.Hwnd,$Session.main.Hwnd,'趋势图的属性');$propertyTab=$n.FindUniqueControlWithoutLabel($property.Hwnd,12320,'SysTabControl32');$p.SelectTabExact($propertyTab.Hwnd,'轮廓');$journal.phase='exact_contour'
    TrendRequiredState $property.Hwnd 1602 '保持长/宽比例' 0;for($r=0;$r -lt 4;$r++){TrendSet $property.Hwnd (@(1050,1052,1045,1044)[$r]) ([string]$o.rect[$r])};foreach($id in @(1056,1060)){if($n.GetControlText(($n.FindUniqueControlWithoutLabel($property.Hwnd,$id,'Edit')).Hwnd,64) -cne '100'){throw 'Actual Trend geometry percentage changed.'}}
    Close-WeinviewScreenDialog $Session $property $true}
   $journal.phase='read_confirmed_property';$confirmedDirectory=Get-WeinviewWindowDirectory -Session $Session;$row=@($confirmedDirectory.rows|Where-Object {$_.object_id -ceq $journal.object_id});if($row.Count -ne 1 -or $row[0].kind -cne 'Trend'){throw 'Confirmed TD identity changed.'};$property=Open-WeinviewDirectoryObject $Session $confirmedDirectory $row[0]
   try{$read=Read-WeinviewTrendDialog $Session $property $journal.object_id $binding;if($isCmt){$read.actual.rectangle=@($journal.native_rectangle)};$journal['confirmed_read']=$read;Assert-WeinviewTrendCreated $read.actual $o $binding $read.channel_y_axis_evidence}finally{Close-WeinviewScreenDialog $Session $property $false}
   $record=New-WeinviewObjectRecord $journal.object_id $read.actual;$records+=$record;$confirmedReads[[string]$journal.object_id]=$read;$journal['confirmed_read']=$read;$journal.native_fields_verified=$true;$journal.phase='complete';$evidence+=[pscustomobject]@{object_id=$journal.object_id;requested=$o;sampling_binding=$binding;sampling_channels_enabled_evidence=$journal['sampling_channels_enabled_evidence'];channel_y_axis_evidence=$read.channel_y_axis_evidence;native_creation_journal=$journalPath}
  }catch{$journal['error']=$_.Exception.Message;throw}finally{WritePrivateJson $journalPath $journal}
 }}finally{if($restore -and !@($n.EnumTopWindows()|Where-Object {$_.Visible -and $_.Class -ceq '#32770'}).Count){Restore-WeinviewWindowDirectory -Session $Session -RestoreContext $restore}}
 # Each new Trend was reopened and read above. Check the final directory once;
 # do not open every unchanged property dialog a second time in the same step.
 $after=Read-WeinviewTrendSnapshot $Session $SourceSha256 ($prefix+'.after') $BridgeRoot
 Assert-WeinviewAdditionSnapshots $before.screen_snapshot $after.screen_snapshot $records.Count
 foreach($record in $records){
  $row=@($after.screen_snapshot.directory.rows|Where-Object {$_.object_id -ceq $record.object_id -and $_.kind -ceq 'Trend'})
  if($row.Count -ne 1){throw 'Confirmed Trend is absent from final native directory'}
  $after.screen_snapshot.objects=@($after.screen_snapshot.objects|ForEach-Object {if($_.object_id -ceq $record.object_id){$record}else{$_}})
 }
 $after.target_evidence=$confirmedReads
 if((Hash $Session.output_path) -ine $SourceSha256){throw 'Trend creation unexpectedly saved project bytes.'}
 $publicBindings=@(foreach($binding in $bindings){ConvertTo-WeinviewTrendPublicBinding $binding})
 return [pscustomobject]@{operation='trend_addition';profile='weinview-cn421-tk800x480-native-trend-v1';objects=$records;creation_evidence=$evidence;before_snapshot=$before;after_snapshot=$after;sampling_csv=$sampling;sampling_export_evidence=$samplingRead.native_export_evidence;sampling_bindings=$publicBindings;sampling_channel_bindings=$bindings;sampling_binding_verified=$true;new_objects_created=$true;untouched_objects_verified=$true;untouched_objects_verification_scope='native directory ID/kind/label/order only; new target fields read';native_fields_verified=$true;source_sha256=$SourceSha256;source_unchanged=$true;full_properties_verified=$false;channel_grid_values_verified=$false;bounding_boxes_verified=$false;collision_verified=$false;persisted_verified=$false;saved=$false;reopened_verified=$false;native_evidence_prefix=$prefix}
}
