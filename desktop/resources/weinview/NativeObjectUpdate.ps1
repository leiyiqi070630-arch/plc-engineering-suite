# Dialog-only compare-and-update. Caller confirms/saves/reopens and owns process lifecycle.
param([Parameter(Mandatory=$true)][string]$IdentityPath,[Parameter(Mandatory=$true)][string]$ProjectPath,[Parameter(Mandatory=$true)][string]$ExpectedSha256,[Parameter(Mandatory=$true)][long]$DialogHwnd,[Parameter(Mandatory=$true)][string]$ObjectId,[Parameter(Mandatory=$true)][string]$ExpectedObjectSha256,[Parameter(Mandatory=$true)][string]$ChangesPath,[Parameter(Mandatory=$true)][string]$OutputPath,[bool]$OwnedSemanticBackground=$false,[int]$CanvasWidth=800,[int]$CanvasHeight=480,$TagEvidence=$null,$PreparedNativeRead=$null)
$ErrorActionPreference='Stop';$canWrite=$false;$r=[ordered]@{schema='weinview-native-object-update/v1';status='failed';stage='preflight';confirmed=$false;saved=$false;reopened_verified=$false;mutation_state='none';before=$null;after=$null}
try{
 if(Test-Path -LiteralPath $OutputPath){throw 'Fresh receipt required'};$canWrite=$true
 . (Join-Path $PSScriptRoot 'ObjectContracts.ps1')
 if($ExpectedObjectSha256 -notmatch '^[A-Fa-f0-9]{64}$'){throw 'Expected canonical object SHA256 required'}
 function ReadActual([string]$suffix){$path=$OutputPath+'.'+$suffix+'.json';if(Test-Path -LiteralPath $path){throw 'Fresh read receipt required'};& (Join-Path $PSScriptRoot 'NativeObjectRead.ps1') -IdentityPath $IdentityPath -ProjectPath $ProjectPath -ExpectedSha256 $ExpectedSha256 -DialogHwnd $DialogHwnd -OutputPath $path -TagEvidence $TagEvidence;$read=Get-Content -LiteralPath $path -Raw -Encoding UTF8|ConvertFrom-Json;if($read.status -cne 'success' -or !$read.actual){throw 'Native object read unsupported/failed'};return $read}
 # The target workflow can hand over the read from this still-open dialog.
 # Other callers keep the standalone read path; no cross-session cache is used.
 $r.stage='read-before'
 if($PreparedNativeRead){
  if($PreparedNativeRead.dialog_hwnd -ne $DialogHwnd -or $PreparedNativeRead.object_id -cne $ObjectId -or $PreparedNativeRead.project_path -ine $ProjectPath -or $PreparedNativeRead.read.status -cne 'success' -or !$PreparedNativeRead.read.actual){throw 'Prepared native read must belong to the current open target dialog'}
  $beforeRead=$PreparedNativeRead.read
 }else{$beforeRead=ReadActual 'before'}
 $beforeActual=$beforeRead.actual;$before=CanonicalObject $ObjectId $beforeActual;$beforeHash=CanonicalObjectHash $before
 if($beforeHash -ine $ExpectedObjectSha256){throw 'Object contract hash mismatch; no write'};$r.before=@{object=$before;sha256=$beforeHash}
 $wanted=ConvertTo-Json -InputObject $before -Depth 12 -Compress|ConvertFrom-Json
 $changes=Get-Content -LiteralPath $ChangesPath -Raw -Encoding UTF8|ConvertFrom-Json;$names=@($changes.PSObject.Properties.Name)
  $shapeNames=@($names|Where-Object {$_ -cin @('use_shape','use_picture')});$requestedShape=[ordered]@{}
  if($shapeNames.Count -and $before.kind -cnotin @('numeric_display','bit_switch','bit_lamp','window_button')){throw 'Appearance shape requires Numeric, Bit or Window Button'}
  foreach($field in $shapeNames){if($changes.$field -isnot [bool]){throw 'Appearance shape switches must be Boolean'};$requestedShape[$field]=[bool]$changes.$field}
  $colorNames=@($names|Where-Object {$_ -cin @('numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','fill_rgb','border_rgb')})
  $readColorNames=if($colorNames.Count -and $before.kind -cin @('bit_switch','bit_lamp','window_button')){@('off_text_rgb','on_text_rgb')}else{$colorNames}
  $requestedColors=[ordered]@{}
  foreach($field in $colorNames){
   $allowedColors=switch -CaseSensitive ($before.kind){'text'{@('text_rgb')};'rectangle'{@('fill_rgb','border_rgb')};'numeric_display'{@('numeric_text_rgb')};{$_ -cin @('bit_switch','bit_lamp','window_button')}{@('off_text_rgb','on_text_rgb')};default{@()}}
   if($field -cnotin @($allowedColors)){throw 'Appearance RGB field does not match target kind'}
   $rgb=@($changes.$field);if($rgb.Count -ne 3){throw 'Appearance RGB requires three channels'}
   foreach($v in $rgb){if(($v -isnot [int] -and $v -isnot [long]) -or $v -lt 0 -or $v -gt 255){throw 'Appearance RGB channel must be byte integer'}}
   $requestedColors[$field]=[int[]]$rgb
  }
 if($before.kind -ceq 'rectangle'){
  if(!$names.Count -or @($names|Where-Object {$_ -cnotin @('rectangle','filled','corner','fill_rgb','border_rgb')}).Count){throw 'Existing native Rectangle accepts rect, filled, corner, fill_rgb and border_rgb only.'}
  if($names -ccontains 'rectangle'){
   $rect=@($changes.rectangle);if($rect.Count -ne 4){throw 'Four Rectangle layout integers required.'}
   foreach($value in $rect){if($value -isnot [int] -and $value -isnot [long]){throw 'Rectangle layout integers required.'}}
   if($rect[2] -lt 3 -or $rect[3] -lt 3){throw '矩形宽高最少3px，细线请改用3px矩形或已有SVG素材'}
   if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Rectangle layout must fit the actual selected window.'}
   $wanted.rectangle=@([int]$rect[0],[int]$rect[1],[int]$rect[2],[int]$rect[3])
  }
  if($names -ccontains 'filled'){
   if($changes.filled -isnot [bool]){throw 'Rectangle filled must be Boolean.'}
   $wanted.filled=[bool]$changes.filled
  }
  if($names -ccontains 'corner'){
   if($changes.corner -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.corner) -or $changes.corner.Length -gt 1024 -or $changes.corner -match '[\x00-\x1f]'){throw 'Exact native Rectangle corner choice required.'}
   $wanted.corner=[string]$changes.corner
  }
  if($colorNames -ccontains 'fill_rgb' -and !$wanted.filled){throw 'Rectangle fill_rgb requires filled=true'}
  $expected=CanonicalObject $ObjectId $wanted;$expectedHash=CanonicalObjectHash $expected
  if($expectedHash -ceq $beforeHash -and !$colorNames.Count){throw 'At least one substantive Rectangle change required.'}
  $identity=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json
  $native=[PLC Engineering Suite.Weinview.NativeControls]::new($identity.Pid,$identity.CreationTicks,$identity.Exe,800)
  $property=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($identity.Pid,$identity.CreationTicks,$identity.Exe)
  $dialog=@($native.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Title -ceq '矩形元件属性' -and $_.Visible -and $_.Enabled})
  if($dialog.Count -ne 1){throw 'Exact owned Rectangle property dialog required.'}
  $colorBefore=$null
  if($colorNames.Count){
   . (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1')
   # An unfilled rectangle may disable its interior picker. Do not invent its
   # previous RGB or toggle fill just to read it; a requested fill=true is applied below.
   $readColorNames=@($colorNames|Where-Object {$_ -cne 'fill_rgb' -or $before.filled})
   $colorBefore=Get-WeinviewRequestedAppearanceColors $IdentityPath $DialogHwnd 'rectangle' ([string[]]$readColorNames)
   $different=$false;foreach($field in $colorNames){if((@($colorBefore.$field) -join ',') -cne (@($requestedColors[$field]) -join ',')){$different=$true}}
   if($expectedHash -ceq $beforeHash -and !$different){throw 'At least one substantive Rectangle color or canonical change required.'}
  }
  $r.stage='apply-rectangle';$r.mutation_state='possible'
  if($names -ccontains 'filled' -or $names -ccontains 'corner'){
   $tab=$native.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
   $property.SelectTabExact($tab.Hwnd,' 形状')
   if($names -ccontains 'filled'){
    $fill=$native.FindUniqueControl($DialogHwnd,1217,'Button','填充')
    if($native.GetCheckboxState($fill.Hwnd) -ne $(if($wanted.filled){1}else{0})){$native.ClickButton($DialogHwnd,1217,'填充')}
    if($native.GetCheckboxState(($native.FindUniqueControl($DialogHwnd,1217,'Button','填充')).Hwnd) -ne $(if($wanted.filled){1}else{0})){throw 'Native Rectangle fill state differs.'}
   }
   if($names -ccontains 'corner'){
    $corner=$native.FindUniqueControlWithoutLabel($DialogHwnd,2067,'ComboBox')
    if(@($property.ComboItems($corner.Hwnd)|Where-Object {$_ -ceq $wanted.corner}).Count -ne 1){throw 'Requested Rectangle corner absent from original choices.'}
    if($property.ComboSelected($corner.Hwnd) -cne $wanted.corner){$property.SelectComboExact($corner.Hwnd,$wanted.corner)}
    if($property.ComboSelected($corner.Hwnd) -cne $wanted.corner){throw 'Native Rectangle corner selection differs.'}
   }
  }
  if($names -ccontains 'rectangle'){
   $rect=@($wanted.rectangle)
   $null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth $CanvasWidth -CanvasHeight $CanvasHeight -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3]
  }
  if($colorNames.Count){Set-WeinviewRequestedAppearanceColors $IdentityPath $DialogHwnd 'rectangle' ([pscustomobject]$requestedColors)}
  $r.stage='read-after';$afterRead=ReadActual 'after';$after=CanonicalObject $ObjectId $afterRead.actual
  if($names -ccontains 'rectangle'){$expected.width_percent=$after.width_percent;$expected.height_percent=$after.height_percent}
  $expectedHash=CanonicalObjectHash $expected;$afterHash=CanonicalObjectHash $after
  if($afterHash -cne $expectedHash){throw 'Requested Rectangle fields or preserved native shape differ after update.'}
  if($colorNames.Count){$r.appearance_color_evidence=[ordered]@{object_id=$ObjectId;before=$colorBefore;requested=[pscustomobject]$requestedColors;after=$null;native_rgb_verified=$false}}
  $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash;$r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;return
 }
 if($before.kind -ceq 'picture'){
  if($names.Count -ne 1 -or $names[0] -cne 'rectangle'){throw 'Existing Picture accepts a rectangle layout change only; use picture_apply to replace the resource.'}
  $rect=@($changes.rectangle);if($rect.Count -ne 4){throw 'Four Picture rectangle integers required.'}
  foreach($value in $rect){if($value -isnot [int] -and $value -isnot [long]){throw 'Picture rectangle integers required.'}}
  if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Picture rectangle must fit the actual selected window.'}
  $wanted.rectangle=@([int]$rect[0],[int]$rect[1],[int]$rect[2],[int]$rect[3])
  $expected=CanonicalObject $ObjectId $wanted;$expectedHash=CanonicalObjectHash $expected
  if($expectedHash -ceq $beforeHash){throw 'At least one substantive Picture layout change required.'}
  $r.stage='apply-picture-layout';$r.mutation_state='possible'
  $null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth $CanvasWidth -CanvasHeight $CanvasHeight -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3]
  $r.stage='read-after';$afterRead=ReadActual 'after';$after=CanonicalObject $ObjectId $afterRead.actual;$afterHash=CanonicalObjectHash $after
  if($afterHash -cne $expectedHash){throw 'Picture layout or preserved native resource identity differs after update.'}
  $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash;$r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;return
 }
 if($before.kind -ceq 'option_list'){
  if(!$names.Count -or @($names|Where-Object {$_ -cnotin @('rectangle','address','mode','options')}).Count){throw 'Existing Option List accepts rect, address, mode and ordinary options only.'}
  . (Join-Path $PSScriptRoot 'OptionListAdditionOperation.ps1')
  $candidate=[ordered]@{kind='option_list';rect=@($before.rectangle);device=$before.data.device;address_type=$before.data.address_type;address=[int]$before.data.address;data_type=$before.data.data_type;mode=$before.mode;options=@($before.options)}
  foreach($field in $names){$candidate[$(if($field -ceq 'rectangle'){'rect'}else{$field})]=$changes.$field}
  $validated=Assert-WeinviewOptionListInputs ([pscustomobject]$candidate) $CanvasWidth $CanvasHeight
  $wanted.rectangle=@($validated.rect);$wanted.data.address=[string]$validated.address;$wanted.mode=$validated.mode;$wanted.options=@($validated.options)
  $optionCount=@($wanted.options).Count
  $expected=CanonicalObject $ObjectId ([pscustomobject]@{kind='option_list';rectangle=@($wanted.rectangle);device=$wanted.data.device;address_type=$wanted.data.address_type;address=[int]$wanted.data.address;data_type=$wanted.data.data_type;mode=$wanted.mode;options=$wanted.options;error_row=[pscustomobject]@{index=$optionCount;item=([string]$optionCount+' (error)')}})
  $expectedHash=CanonicalObjectHash $expected;if($expectedHash -ceq $beforeHash){throw 'At least one substantive Option List change required.'}
  $i=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json;$n=[PLC Engineering Suite.Weinview.NativeControls]::new($i.Pid,$i.CreationTicks,$i.Exe,800);$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($i.Pid,$i.CreationTicks,$i.Exe)
  $dialog=@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Class -ceq '#32770' -and $_.Visible -and $_.Enabled});if($dialog.Count -ne 1){throw 'Exact owned existing Option List dialog required.'}
  $r.stage='apply-option-list';$r.mutation_state='possible'
  if(@($names|Where-Object {$_ -cin @('address','mode','options')}).Count){
   $observed=Set-WeinviewOptionListFields $n $p $DialogHwnd ([string]$dialog[0].Title) $validated
   if($observed.address -ne $validated.address -or $observed.mode -cne $validated.mode){throw 'Native Option List immediate update differs.'}
  }
  if($names -ccontains 'rectangle'){
   $rect=@($validated.rect)
   $null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth $CanvasWidth -CanvasHeight $CanvasHeight -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3]
  }
  $r.stage='read-after';$afterRead=ReadActual 'after';$after=CanonicalObject $ObjectId $afterRead.actual;$afterHash=CanonicalObjectHash $after
  if($afterHash -cne $expectedHash){throw 'Option List requested or preserved canonical fields differ after native update.'}
  $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash;$r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;return
 }
 if($before.kind -ceq 'trend' -and $names.Count -and !@($names|Where-Object {$_ -cnotin @('description','pixel_spacing','line_width','rectangle')}).Count){
  if($ObjectId -cnotmatch '^TD_[0-9]{1,5}$'){throw 'Existing native Trend identity required'}
  if($names -ccontains 'rectangle'){
   if($null -ne $before.display_unit -or $null -eq $before.rectangle){throw 'Actual TK Trend contour required for layout update'}
   $rect=@($changes.rectangle)
   if($rect.Count -ne 4 -or @($rect|Where-Object {$_ -isnot [int] -and $_ -isnot [long]}).Count -or $rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Trend rectangle must fit actual selected window'}
   $wanted.rectangle=@($rect|ForEach-Object {[int]$_})
  }
  if($names -ccontains 'description'){
   $value=$changes.description
   if($value -isnot [string] -or !$value.Trim().Length -or $value.Length -gt 256 -or $value -match '[\x00-\x1f\x7f-\x9f,"]'){throw 'Trend description must match native finite text contract'}
   $wanted.description=$value
  }
  if($names -ccontains 'pixel_spacing'){
   $value=$changes.pixel_spacing
   if(($value -isnot [int] -and $value -isnot [long]) -or $value -lt 1 -or $value -gt 800){throw 'Trend pixel spacing must be integer 1..800'}
   $wanted.pixel_spacing=[int]$value
  }
  if($names -ccontains 'line_width'){
   $value=$changes.line_width
   if(($value -isnot [int] -and $value -isnot [long]) -or $value -lt 1){throw 'Trend line width must be a positive native choice'}
   $wanted.line_width=[int]$value
  }
  $expected=CanonicalObject $ObjectId $wanted;$expectedHash=CanonicalObjectHash $expected
  if($expectedHash -ceq $beforeHash){throw 'At least one substantive Trend property change required'}
  $identity=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json
  $n=[PLC Engineering Suite.Weinview.NativeControls]::new($identity.Pid,$identity.CreationTicks,$identity.Exe,800)
  $p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($identity.Pid,$identity.CreationTicks,$identity.Exe)
  $main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))})
  if($main.Count -ne 1){throw 'Unique owned Trend main required'}
  $null=[PLC Engineering Suite.Weinview.TrendRibbonControls]::RequireDialog($n,$DialogHwnd,$main[0].Hwnd,'趋势图的属性')
  $tab=$n.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')
  $r.stage='apply-trend-general';$r.mutation_state='possible'
  if($names -ccontains 'description' -or $names -ccontains 'pixel_spacing'){
   $p.SelectTabExact($tab.Hwnd,'一般属性')
   foreach($field in @('description','pixel_spacing')){
    if($names -cnotcontains $field){continue}
    $id=if($field -ceq 'description'){1174}else{1993}
    $edit=$n.FindUniqueControlWithoutLabel($DialogHwnd,$id,'Edit')
    $value=[string]$wanted.$field
    $n.SetControlText($edit.Hwnd,$value)
    if($n.GetControlText($edit.Hwnd,4096) -cne $value){throw ('Native Trend edit readback differs: '+$field)}
   }
  }
  if($names -ccontains 'line_width'){
   $p.SelectTabExact($tab.Hwnd,'通道')
   $combo=$n.FindUniqueControlWithoutLabel($DialogHwnd,1299,'ComboBox')
   $value=[string]$wanted.line_width
   if(@($p.ComboItems($combo.Hwnd)|Where-Object {$_ -ceq $value}).Count -ne 1){throw 'Requested Trend line width absent from original choices'}
   if($p.ComboSelected($combo.Hwnd) -cne $value){$p.SelectComboExact($combo.Hwnd,$value)}
   if($p.ComboSelected($combo.Hwnd) -cne $value){throw 'Native Trend line width readback differs'}
  }
  if($names -ccontains 'rectangle'){
   $rect=@($wanted.rectangle)
   $null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth $CanvasWidth -CanvasHeight $CanvasHeight -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3]
  }
  $r.stage='read-after';$afterRead=ReadActual 'after';$after=CanonicalObject $ObjectId $afterRead.actual;$afterHash=CanonicalObjectHash $after
  if($afterHash -cne $expectedHash){throw 'Requested Trend fields or preserved native properties differ after update'}
  $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash;$r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;return
 }
 if($before.kind -ceq 'trend'){
  if([IO.Path]::GetExtension($ProjectPath) -ine '.cmtp' -or !$beforeRead.channel_y_axis_evidence -or !$names.Count -or @($names|Where-Object {$_ -cnotin @('channel_y_axes','y_axis_options')}).Count){throw 'Existing cMT Trend accepts only observed Y axis/range changes.'}
  $current=$beforeRead.channel_y_axis_evidence;$desired=ConvertTo-Json -InputObject $current -Depth 12 -Compress|ConvertFrom-Json
  $rows=@($desired.channels);if(!$rows.Count){throw 'Existing Trend native channel evidence absent'}
  if($names -ccontains 'channel_y_axes'){$patches=@($changes.channel_y_axes);if(!$patches.Count -or $patches.Count -gt $rows.Count){throw 'Trend Y axis update requires 1..channel_count patches'}
   $seen=New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
   foreach($patch in $patches){$fields=@($patch.PSObject.Properties.Name);if($fields.Count -lt 2 -or @($fields|Where-Object {$_ -cnotin @('label','axis','minimum','maximum')}).Count -or $patch.label -isnot [string] -or !$seen.Add($patch.label)){throw 'Unique Trend channel label with axis/range patch required'}
    $matches=@($rows|Where-Object {$_.label -ceq $patch.label});if($matches.Count -ne 1){throw 'Trend Y axis patch label absent from actual Sampling channels'};$target=$matches[0]
    if($fields -ccontains 'axis'){if($patch.axis -cnotin @('none','main','auxiliary')){throw 'Trend Y axis update choice invalid'};$target.axis=[string]$patch.axis;$target.native_axis=switch($target.axis){none{'无'} main{'主轴'} auxiliary{'辅助轴'}}}
    foreach($field in @('minimum','maximum')){if($fields -ccontains $field){if($patch.$field -isnot [int] -and $patch.$field -isnot [long] -and $patch.$field -isnot [double] -and $patch.$field -isnot [decimal]){throw 'Trend channel finite numeric range required'};$value=[double]$patch.$field;if([double]::IsNaN($value) -or [double]::IsInfinity($value) -or [math]::Abs($value) -gt [single]::MaxValue){throw 'Trend channel finite Float32 envelope required'};$target.$field=$value}}
    if([double]$target.minimum -ge [double]$target.maximum){throw 'Trend channel minimum must remain below maximum'}
   }
  }
  if($names -ccontains 'y_axis_options'){$optionFields=@($changes.y_axis_options.PSObject.Properties.Name);if(!$optionFields.Count -or @($optionFields|Where-Object {$_ -cnotin @('hide_when_channel_invisible','value_alignment')}).Count){throw 'Trend Y axis option patch invalid'}
   if($optionFields -ccontains 'hide_when_channel_invisible'){if($changes.y_axis_options.hide_when_channel_invisible -isnot [bool]){throw 'Trend hide-scale option must be Boolean'};$desired.hide_when_channel_invisible=[bool]$changes.y_axis_options.hide_when_channel_invisible}
   if($optionFields -ccontains 'value_alignment'){if($changes.y_axis_options.value_alignment -cnotin @('center_on_tick','full_text')){throw 'Trend alignment choice invalid'};$desired.value_alignment=[string]$changes.y_axis_options.value_alignment;$desired.native_value_alignment=if($desired.value_alignment -ceq 'full_text'){'完整显示'}else{'以刻度为中心'}}
  }
  $changed=$false;for($rowIndex=0;$rowIndex -lt $rows.Count;$rowIndex++){$old=$current.channels[$rowIndex];$new=$rows[$rowIndex];foreach($field in @('axis','minimum','maximum')){if([string]$old.$field -cne [string]$new.$field){$changed=$true}}}
  if([bool]$current.hide_when_channel_invisible -ne [bool]$desired.hide_when_channel_invisible -or [string]$current.value_alignment -cne [string]$desired.value_alignment){$changed=$true}
  if(!$changed){throw 'At least one substantive Trend Y axis change required'}
  $wanted.minimum=[double]$rows[0].minimum;$wanted.maximum=[double]$rows[0].maximum;$expected=CanonicalObject $ObjectId $wanted;$expectedHash=CanonicalObjectHash $expected
  $i=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json;$n=[PLC Engineering Suite.Weinview.NativeControls]::new($i.Pid,$i.CreationTicks,$i.Exe,800);$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($i.Pid,$i.CreationTicks,$i.Exe)
  $main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))});if($main.Count -ne 1){throw 'Unique owned Trend main required'}
  $tab=$n.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32');$labels=[string[]]@($rows|ForEach-Object {$_.label});$types=[string[]]@($beforeRead.channel_y_axis_evidence.channel_types)
  if($types.Count -ne $rows.Count -or @($types|Where-Object {[string]::IsNullOrWhiteSpace($_)}).Count){$p.SelectTabExact($tab.Hwnd,'通道');$observed=@([PLC Engineering Suite.Weinview.TrendRibbonControls]::ReadObservedChannels($n,$DialogHwnd,$main[0].Hwnd,'趋势图的属性'));$types=[string[]]@($observed|ForEach-Object {$_.data_type});if((@($observed|ForEach-Object {$_.label}) -join '|') -cne ($labels -join '|')){throw 'Existing Trend channel labels changed before update'}}
  $r.stage='apply-trend-y-axis';$r.mutation_state='possible';$r.channel_y_axis_before=$current
  if(@($rows|Where-Object {$_.axis -cne 'none'}).Count){$p.SelectTabExact($tab.Hwnd,'趋势图');$grid=$n.FindUniqueControl($DialogHwnd,1076,'Button','显示');if($n.GetCheckboxState($grid.Hwnd) -eq 0){$n.ClickButton($DialogHwnd,1076,'显示')};if($n.GetCheckboxState($grid.Hwnd) -ne 1){throw 'Trend Y axis Grid display prerequisite not enabled'}}
  if(@($rows|Where-Object {$_.minimum -ne $current.channels[$_.row-1].minimum -or $_.maximum -ne $current.channels[$_.row-1].maximum}).Count){$p.SelectTabExact($tab.Hwnd,'通道');$null=[PLC Engineering Suite.Weinview.TrendRibbonControls]::SetChannelRangesPerRow($n,$DialogHwnd,$main[0].Hwnd,'趋势图的属性',$labels,$types,[double[]]@($rows|ForEach-Object {$_.minimum}),[double[]]@($rows|ForEach-Object {$_.maximum}))}
  $p.SelectTabExact($tab.Hwnd,'Y 轴');$null=[PLC Engineering Suite.Weinview.TrendRibbonControls]::SetChannelAxes($n,$DialogHwnd,$main[0].Hwnd,'趋势图的属性',$labels,$types,[string[]]@($rows|ForEach-Object {$_.native_axis}))
  $hide=$n.FindUniqueControl($DialogHwnd,1332,'Button','通道数据不显示时隐藏通道 Y 刻度');$wantedHide=if($desired.hide_when_channel_invisible){1}else{0};if($n.GetCheckboxState($hide.Hwnd) -ne $wantedHide){$n.ClickButton($DialogHwnd,1332,'通道数据不显示时隐藏通道 Y 刻度')};if($n.GetCheckboxState($hide.Hwnd) -ne $wantedHide){throw 'Trend Y axis hide preference differs'}
  $align=$n.FindUniqueControlWithoutLabel($DialogHwnd,1370,'ComboBox');$wantedAlign=if($desired.value_alignment -ceq 'full_text'){'完整显示'}else{'以刻度为中心'};if($p.ComboSelected($align.Hwnd) -cne $wantedAlign){$p.SelectComboExact($align.Hwnd,$wantedAlign)};if($p.ComboSelected($align.Hwnd) -cne $wantedAlign){throw 'Trend Y axis alignment differs'}
  $r.stage='read-after';$afterRead=ReadActual 'after';$after=CanonicalObject $ObjectId $afterRead.actual;$afterHash=CanonicalObjectHash $after;$actualAxis=$afterRead.channel_y_axis_evidence
  if(!$actualAxis -or @($actualAxis.channels).Count -ne $rows.Count){throw 'Trend Y axis post-edit readback absent'}
  if(@($rows|Where-Object {$_.axis -cne 'none'}).Count -and !$actualAxis.grid_display_enabled){throw 'Trend Grid display turned off after edit'}
  for($rowIndex=0;$rowIndex -lt $rows.Count;$rowIndex++){$expectRow=$rows[$rowIndex];$actualRow=$actualAxis.channels[$rowIndex];foreach($field in @('row','label','axis','minimum','maximum')){if([string]$actualRow.$field -cne [string]$expectRow.$field){throw ('Trend Y axis preserved/requested field differs at row '+($rowIndex+1)+': '+$field)}}}
  if([bool]$actualAxis.hide_when_channel_invisible -ne [bool]$desired.hide_when_channel_invisible -or [string]$actualAxis.value_alignment -cne [string]$desired.value_alignment -or $afterHash -cne $expectedHash){throw 'Trend Y axis edit changed requested/preserved values or canonical fields'}
  $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash;$r.channel_y_axis_after=$actualAxis;$r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;return
 }
 $textFields=@('text','position','font_size','font','alignment')
   if(!$names.Count -or @($names|Where-Object {$_ -cnotin (@('description','rectangle','address','device_name','address_type','tag_name','data_type','labels','target_window','function_action','media','import_mode','delete_after_import','off_label','on_label','minimum','maximum','integer_digits','decimal_digits','operation_mode','security_class','numeric_font','numeric_size','label_font','label_size','numeric_text_rgb','off_text_rgb','on_text_rgb','text_rgb','use_shape','use_picture')+$textFields)}).Count){throw 'Only observed existing-object changes accepted'}
 if($names -ccontains 'tag_name' -and ($before.kind -cnotin @('numeric_display','bit_switch','bit_lamp') -or @($names|Where-Object {$_ -cin @('address','device_name','address_type')}).Count -or $changes.tag_name -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.tag_name) -or $changes.tag_name.Length -gt 256 -or $changes.tag_name -match '[\x00-\x1f]')){throw 'Exact native tag_name without direct address patch required'}
 if($names -ccontains 'data_type' -and ($before.kind -cne 'numeric_display' -or $changes.data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float','32-bit Signed','32-bit Unsigned'))){throw 'Actual supported numeric data_type required'}
 if($names -ccontains 'address' -and $before.kind -ceq 'numeric_display' -and $before.data.tag_name){throw 'Native tag-bound numeric address cannot be patched directly'}
 if($names -ccontains 'address' -and $before.kind -cin @('bit_switch','bit_lamp') -and $before.bit.tag_name){throw 'Native Tag-bound bit address cannot be patched directly'}
 $securityRequested=$names -ccontains 'security_class'
 if($securityRequested -and ($changes.security_class -isnot [string] -or $changes.security_class -cnotmatch '^(None|[A-L]|Administrator)$')){throw 'Object security_class requires None, A through L, or Administrator'}
 $tagBinding=$null
 if($names -ccontains 'tag_name'){
  if(!$TagEvidence){throw 'Same-project native tag export required for Tag rebind'}
  if(!('PLC Engineering Suite.Weinview.TagCsvCodec' -as [type])){Add-Type -Path (Join-Path $PSScriptRoot 'TagCsvCodec.cs') -ReferencedAssemblies 'System.dll'}
  . (Join-Path $PSScriptRoot 'NumericAddressBinding.ps1')
  $tagBinding=Resolve-WeinviewNumericTagRow $ProjectPath ([string]$changes.tag_name) $TagEvidence $ExpectedSha256
  if($before.kind -ceq 'numeric_display'){
   if($tagBinding.data_type -cne $(if($names -ccontains 'data_type'){$changes.data_type}else{$before.style.data_type})){throw 'Target Tag data type differs from requested/preserved numeric format'}
   $wanted.data.device=[string]$tagBinding.device;$wanted.data.address_type=[string]$tagBinding.address_type;$wanted.data.address=[string]$tagBinding.address;$wanted.data.tag_name=[string]$tagBinding.tag_name
  }else{
   $wanted.bit.device=[string]$tagBinding.device;$wanted.bit.address_type=[string]$tagBinding.address_type;$wanted.bit.address=[string]$tagBinding.address;$wanted.bit.tag_name=[string]$tagBinding.tag_name
  }
 }
 if($names -ccontains 'data_type'){$wanted.style.data_type=[string]$changes.data_type}
 foreach($field in @('integer_digits','decimal_digits')){
  if($names -ccontains $field){
   $value=$changes.$field
   if($before.kind -cne 'numeric_display' -or $wanted.style.data_type -cnotin @('16-bit Signed','16-bit Unsigned','32-bit Float','32-bit Signed','32-bit Unsigned') -or ($value -isnot [int] -and $value -isnot [long]) -or $value -lt 0){throw 'Numeric digits require a supported numeric format and a nonnegative integer'}
   $wanted.style.$field=([long]$value).ToString([Globalization.CultureInfo]::InvariantCulture)
  }
 }
  if($names -ccontains 'numeric_font'){
   if($before.kind -cne 'numeric_display' -or $changes.numeric_font -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.numeric_font) -or $changes.numeric_font.Length -gt 1024 -or $changes.numeric_font -match '[\x00-\x1f\x7f]'){throw 'Existing Numeric requires bounded exact numeric_font'}
   $wanted.style.font=[string]$changes.numeric_font
  }
  if($names -ccontains 'numeric_size'){
   if($before.kind -cne 'numeric_display' -or ($changes.numeric_size -isnot [int] -and $changes.numeric_size -isnot [long]) -or $changes.numeric_size -lt 1){throw 'Existing Numeric requires positive integer numeric_size'}
   $wanted.style.size=[string]$changes.numeric_size
  }
  if($names -ccontains 'label_font' -or $names -ccontains 'label_size'){
   if($before.kind -cnotin @('bit_switch','bit_lamp','window_button')){throw 'Label font and size require Bit or Window Button'}
   if($names -ccontains 'label_font'){
    if($changes.label_font -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.label_font) -or $changes.label_font.Length -gt 1024 -or $changes.label_font -match '[\x00-\x1f\x7f]'){throw 'Bounded exact label_font required'}
    foreach($state in @(0,1)){$wanted.labels[$state].font=[string]$changes.label_font}
   }
   if($names -ccontains 'label_size'){
    if(($changes.label_size -isnot [int] -and $changes.label_size -isnot [long]) -or $changes.label_size -lt 1){throw 'Positive integer label_size required'}
    foreach($state in @(0,1)){$wanted.labels[$state].size=[string]$changes.label_size}
   }
  }
 if($before.kind -ceq 'text'){
  if(@($names|Where-Object {$_ -cnotin ($textFields+@('text_rgb','security_class'))}).Count){throw 'Existing Text accepts only content/position/font/alignment/text_rgb/security class; no rectangle or register binding'}
  if($before.text_source -ceq 'label_library' -and $names -ccontains 'text'){throw 'Library-bound Text content must be changed through its native label reference, not the hidden literal editor'}
  . (Join-Path $PSScriptRoot 'CommonObjectsAdditionOperation.ps1')
  $textOptions=[ordered]@{kind='text';text=$before.text;position=@($before.x,$before.y);font_size=$before.font_size;font=$before.font;alignment=$before.alignment}
  foreach($field in $textFields){if($names -ccontains $field){$textOptions[$field]=$changes.$field}}
  $validatedText=@(Assert-WeinviewCommonObjectsInputs ([pscustomobject]$textOptions) 0 $CanvasWidth $CanvasHeight)[0]
  foreach($field in @('text','font_size','font','alignment')){$wanted.$field=$validatedText.$field}
  $wanted.x=$validatedText.position[0];$wanted.y=$validatedText.position[1]
 }elseif(@($names|Where-Object {$_ -cin $textFields}).Count){throw 'Text fields require an existing TX Text object'}
 if($names -ccontains 'operation_mode'){if($before.kind -cne 'bit_switch'){throw 'operation_mode applies only to an existing bit_switch'};$wanted.bit.operation_mode=Get-WeinviewNativeBitMode $changes.operation_mode}
  $bindingChange=($names -ccontains 'device_name' -or $names -ccontains 'address_type')
  if($bindingChange -and $before.kind -cnotin @('bit_switch','bit_lamp','numeric_display')){throw 'Direct binding requires existing Bit or Numeric object'}
  $bitBindingChange=($bindingChange -and $before.kind -cin @('bit_switch','bit_lamp'))
 if($bitBindingChange){
   if($names -cnotcontains 'device_name' -or $names -cnotcontains 'address_type' -or $names -cnotcontains 'address'){throw 'Bit binding replacement requires device_name, address_type and address together'}
  if($before.bit.tag_name){throw 'Native Tag-bound bit address cannot be patched directly'}
  foreach($field in @('device_name','address_type')){if($changes.$field -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.$field) -or $changes.$field.Length -gt 128 -or $changes.$field -match '[\x00-\x1f\x7f]'){throw 'Exact bounded native bit device/type required'}}
  $wanted.bit.device=[string]$changes.device_name;$wanted.bit.address_type=[string]$changes.address_type
 }
  $numericBindingChange=($bindingChange -and $before.kind -ceq 'numeric_display')
 if($numericBindingChange){
  if($before.data.tag_name -or $names -ccontains 'tag_name'){throw 'Numeric direct binding and native Tag selection are mutually exclusive'}
  foreach($field in @('device_name','address_type')){if($names -ccontains $field -and ($changes.$field -isnot [string] -or [string]::IsNullOrWhiteSpace($changes.$field) -or $changes.$field.Length -gt 128 -or $changes.$field -match '[\x00-\x1f\x7f]')){throw 'Exact native numeric device/type required'}}
  if($names -ccontains 'device_name'){$wanted.data.device=[string]$changes.device_name}
  if($names -ccontains 'address_type'){$wanted.data.address_type=[string]$changes.address_type}
 }
 if($names -ccontains 'description'){if($changes.description -isnot [string] -or $changes.description.Length -gt 64 -or $changes.description -match '[\x00-\x1f]'){throw 'Description bounded64/no controls required'};$wanted.description=$changes.description}
 if($names -ccontains 'rectangle'){$rect=@($changes.rectangle);if($rect.Count -ne 4){throw 'Four integer rectangle fields required'};foreach($v in $rect){if($v -isnot [int] -and $v -isnot [long]){throw 'Rectangle integers required'}};if($rect[0] -lt 0 -or $rect[1] -lt 0 -or $rect[2] -lt 1 -or $rect[3] -lt 1 -or $rect[0]+$rect[2] -gt $CanvasWidth -or $rect[1]+$rect[3] -gt $CanvasHeight){throw 'Rectangle TK800x480 bounds required'};$wanted.rectangle=$rect}
 if($names -ccontains 'address' -or $numericBindingChange){
  $address=0
  if($before.kind -cin @('bit_switch','bit_lamp')){
   $value=[string]$changes.address
   if($wanted.bit.device -ceq 'Local HMI'){
    if($wanted.bit.address_type -cne 'LB' -or ($changes.address -isnot [int] -and $changes.address -isnot [long]) -or ![int]::TryParse($value,[ref]$address) -or $address -lt 0 -or $address -gt 8999){throw 'Local LB0..8999 required'}
   }elseif([string]::IsNullOrWhiteSpace($value) -or $value.Length -gt 128 -or $value -match '[\x00-\x1f\x7f]'){throw 'Exact native external bit address text required'}
   $wanted.bit.address=$value
  }
  elseif($before.kind -ceq 'numeric_display'){
   if($before.data.tag_name){throw 'Native Tag-bound numeric address cannot be patched directly'}
   $candidate=if($names -ccontains 'address'){$changes.address}else{$before.data.address}
    if($wanted.data.device -ceq 'Local HMI' -and $wanted.data.address_type -ceq 'LW'){
     if(($candidate -isnot [int] -and $candidate -isnot [long] -and $names -ccontains 'address') -or ![int]::TryParse([string]$candidate,[ref]$address) -or $address -lt 0 -or $address -gt 65535){throw 'Local HMI LW numeric requires integer0..65535'}
    $wanted.data.address=[string]$address
   }else{
    $text=[string]$candidate
     if(($names -ccontains 'address' -and $candidate -isnot [string]) -or [string]::IsNullOrWhiteSpace($text) -or $text.Length -gt 128 -or $text -match '[\x00-\x1f\x7f]'){throw 'Exact native numeric address text required'}
    $wanted.data.address=$text
   }
  }
  else{throw 'Same-binding numeric or Local LB address required'}
 }
 if($before.kind -ceq 'numeric_display' -and !$wanted.data.tag_name -and $wanted.data.device -ceq 'Local HMI' -and $wanted.data.address_type -ceq 'LW' -and $wanted.style.data_type -clike '32-bit *'){
  $wordStart=0
  if(![int]::TryParse([string]$wanted.data.address,[ref]$wordStart) -or $wordStart -lt 0 -or $wordStart -gt 65534){throw 'Local HMI LW 32-bit numeric start must be integer0..65534'}
 }
 if($names -ccontains 'minimum' -or $names -ccontains 'maximum'){
  if($before.kind -cne 'numeric_display' -or $before.style.data_type -cne '16-bit Signed' -or $wanted.style.data_type -cne '16-bit Signed' -or $before.style.decimal_digits -cne '0'){throw 'Numeric limits require existing signed16 integer object'}
  $lo=0;$hi=0
  if(![int]::TryParse($before.style.minimum,[ref]$lo) -or ![int]::TryParse($before.style.maximum,[ref]$hi)){throw 'Existing numeric limits must be integer fields'}
  $limits=Get-WeinviewNumericLimits $changes $lo $hi
  foreach($field in @('minimum','maximum')){if($names -ccontains $field){$wanted.style.$field=[string]$limits.$field}}
 }
 if($names -ccontains 'labels'){
  if($before.kind -cnotin @('macro_button','window_button')){throw 'Labels require trigger-macro functionkey'};$ls=@($changes.labels);if($ls.Count -ne 2){throw 'Both exact label state0/1 required'}
  foreach($state in @(0,1)){$found=@($ls|Where-Object {([string]$_.state) -ceq [string]$state});if($found.Count -ne 1){throw 'Label states missing/duplicated'};$l=$found[0];if(@($l.PSObject.Properties.Name|Where-Object {$_ -cnotin @('state','text')}).Count -or $l.text -isnot [string] -or $l.text.Length -gt 4096 -or $l.text.IndexOf([char]0) -ge 0){throw 'Label state/text-only bounded4096 required'};$wanted.labels[$state].text=$l.text}
 }
 if($names -ccontains 'target_window'){
  if($before.kind -cne 'window_button' -or $before.window.action -cne '切换基本窗口' -or $changes.target_window -isnot [int] -and $changes.target_window -isnot [long] -or $changes.target_window -lt 10 -or $changes.target_window -gt 1999){throw 'Existing basic-window button and integer target10..1999 required'}
  $identity=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json;$tn=[PLC Engineering Suite.Weinview.NativeControls]::new($identity.Pid,$identity.CreationTicks,$identity.Exe,800);$tp=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($identity.Pid,$identity.CreationTicks,$identity.Exe)
  $tp.SelectTabExact(($tn.FindUniqueControlWithoutLabel($DialogHwnd,12320,'SysTabControl32')).Hwnd,'一般属性');$targets=[PLC Engineering Suite.Weinview.FunctionWindowTargetControls]::new($tn,'功能键的属性',(-not $OwnedSemanticBackground));$found=@()
  $cmtTarget=([IO.Path]::GetExtension($ProjectPath) -ieq '.cmtp')
  foreach($qt in @($tn.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$v=if($cmtTarget){$targets.InspectCmtNavigation($DialogHwnd,$qt.Hwnd)}else{$targets.Inspect($DialogHwnd,$qt.Hwnd)};if($v){$found+=$v}}
  if($found.Count -ne 1){throw 'Unique actual target combo required'};$items=@($found[0].Items|Where-Object {$_ -cmatch ('^'+$changes.target_window+'\. .+$')});if($items.Count -ne 1){throw 'Requested target must exist uniquely in native window list'}
  $targetText=$items[0];$targetSnapshot=$found[0];$wanted.window.target_window.number=[int]$changes.target_window;$wanted.window.target_window.name=$targetText.Substring($targetText.IndexOf('. ')+2)
 }
 $importFields=@($names|Where-Object {$_ -cin @('function_action','media','import_mode','delete_after_import')})
 if($importFields.Count){
  if($before.kind -cne 'window_button' -or $before.window.action -cne '导入用户账户' -or $names -ccontains 'target_window' -or $changes.function_action -cne 'import_user_accounts'){throw 'Only existing UserAccounts import Function Key can change import options'}
  if($names -ccontains 'media'){$nativeMedia=@{usb='U盘';usb2='U盘 2';sd='SD 卡'}[[string]$changes.media];if(!$nativeMedia){throw 'Exact UserAccounts import media required'};$wanted.window.media=$nativeMedia}
  if($names -ccontains 'import_mode'){$nativeMode=@{append='附加';overwrite='覆盖'}[[string]$changes.import_mode];if(!$nativeMode){throw 'Exact UserAccounts import mode required'};$wanted.window.import_mode=$nativeMode}
  if($names -ccontains 'delete_after_import'){if($changes.delete_after_import -isnot [bool]){throw 'Boolean UserAccounts delete-after-import required'};$wanted.window.delete_after_import=[bool]$changes.delete_after_import}
 }
 foreach($patch in @(@('off_label',0),@('on_label',1))){if($names -ccontains $patch[0]){if($before.kind -cnotin @('bit_switch','bit_lamp') -or $changes.($patch[0]) -isnot [string] -or $changes.($patch[0]).Length -gt 128 -or $changes.($patch[0]) -match '[\x00-\x1f]'){throw 'Bit label patch bounded128/no controls required'};$wanted.labels[$patch[1]].text=$changes.($patch[0])}}
 $expected=CanonicalObject $ObjectId $wanted;$expectedHash=CanonicalObjectHash $expected
 if($expectedHash -ceq $beforeHash -and !$securityRequested -and !$colorNames.Count -and !$shapeNames.Count){
  # The current owned dialog already satisfies every validated requested field.
  # Return its verified state without writing or rejecting an idempotent update.
  $r.after=$r.before;$r.expected_after_sha256=$expectedHash;$r.status='success';$r.stage='object-already-satisfied';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true;$r.unchanged=$true;return
 }
 $i=Get-Content -LiteralPath $IdentityPath -Raw -Encoding UTF8|ConvertFrom-Json;$n=[PLC Engineering Suite.Weinview.NativeControls]::new($i.Pid,$i.CreationTicks,$i.Exe,800);$p=[PLC Engineering Suite.Weinview.Research.NativePropertyCandidate]::new($i.Pid,$i.CreationTicks,$i.Exe)
 function C([int]$id,[string]$class){return $n.FindUniqueControlWithoutLabel($DialogHwnd,$id,$class)}
 function Tab([string]$name){$p.SelectTabExact((C 12320 'SysTabControl32').Hwnd,$name)}
 function BitGeneralReady {
  $controls=@($n.EnumChildControls($DialogHwnd))
  if(@($controls|Where-Object {$_.Id -eq 1646 -and $_.Class -ceq 'ComboBox' -and $_.Visible -and $_.Enabled}).Count -ne 1 -or @($controls|Where-Object {$_.Id -eq 2510 -and $_.Class -ceq 'Edit' -and $_.Visible -and $_.Enabled}).Count -ne 1){return $false}
  $dialog=@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Visible -and $_.Enabled});if($dialog.Count -ne 1){throw 'Exact owned bit property dialog required'}
  $types=[PLC Engineering Suite.Weinview.BitAddressTypeControls]::new($n,[string]$dialog[0].Title);$found=@()
  foreach($qt in @($controls|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$v=$types.InspectAny($DialogHwnd,$qt.Hwnd);if($v){$found+=,$v}}
  if($found.Count -gt 1){throw 'Bit address type control ambiguous on current property page'}
  return ($found.Count -eq 1)
 }
 function EnsureBitGeneral {if(BitGeneralReady){return};Tab '一般属性';if(!(BitGeneralReady)){throw 'Bit device, address and type controls absent after native tab selection'}}
  $colorBefore=$null
   if($colorNames.Count -or $shapeNames.Count){. (Join-Path $PSScriptRoot 'NativeAppearanceColorOperation.ps1')}
   if($colorNames.Count){$colorBefore=Get-WeinviewRequestedAppearanceColors $IdentityPath $DialogHwnd $before.kind ([string[]]$readColorNames);$different=$false;foreach($field in $colorNames){if((@($colorBefore.$field) -join ',') -cne (@($requestedColors[$field]) -join ',')){$different=$true}};if($expectedHash -ceq $beforeHash -and !$securityRequested -and !$different -and !$shapeNames.Count){throw 'At least one substantive color or canonical object change required'}}
 # The complete before read/hash is the sole write precondition. Native mutation guards remain strict.
 $r.stage='apply-fields';$r.mutation_state='possible'
 if($before.kind -ceq 'text'){
  Tab '文字/批注'
  foreach($field in @(@('font',1547),@('font_size',1439),@('alignment',1051))){if($wanted.($field[0]) -cne $before.($field[0])){$p.SelectComboExact((C $field[1] 'ComboBox').Hwnd,[string]$wanted.($field[0]))}}
  if($wanted.text -cne $before.text){
   $editor=C 1283 'RichEdit20W';$blur=$n.FindUniqueControl($DialogHwnd,1780,'Button','斜体')
   $r.text_focus_enter=$p.FocusTextEditor($DialogHwnd,$editor.Hwnd,$blur.Hwnd,'文字/批注的属性',$true)
   $p.SetRichTextExact($editor.Hwnd,$wanted.text)
   if($p.RichText($editor.Hwnd) -cne $wanted.text){throw 'Actual native CR Text readback differs'}
   $r.text_focus_leave=$p.FocusTextEditor($DialogHwnd,$editor.Hwnd,$blur.Hwnd,'文字/批注的属性',$false)
  }
  if($wanted.x -ne $before.x -or $wanted.y -ne $before.y){Tab '轮廓';foreach($field in @(@('x',1050),@('y',1052))){if($wanted.($field[0]) -ne $before.($field[0])){$n.SetControlText((C $field[1] 'Edit').Hwnd,[string]$wanted.($field[0]))}}}
 }
 if($names -ccontains 'description' -and $wanted.description -cne $before.description){if($before.kind -cin @('bit_switch','bit_lamp')){EnsureBitGeneral}else{Tab '一般属性'};if($before.kind -ceq 'window_button' -and [IO.Path]::GetExtension($ProjectPath) -ieq '.cmtp'){$cmtDescription=[PLC Engineering Suite.Weinview.FunctionWindowTargetControls]::new($n,'功能键的属性',(-not $OwnedSemanticBackground));$qt=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro' -and $_.Visible -and $_.Enabled});if($qt.Count -ne 1){throw 'Unique cMT function General page required'};if($before.window.action -ceq '导入用户账户'){$null=$cmtDescription.SetCmtAccountImportDescription($DialogHwnd,$qt[0].Hwnd,$before.description,$wanted.description)}else{$null=$cmtDescription.SetCmtDescription($DialogHwnd,$qt[0].Hwnd,$before.description,$wanted.description,[long](@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro'})[0].Hwnd),(Join-Path $PSScriptRoot 'QtElementBridge.exe'))}}else{$n.SetControlText((C 1174 'Edit').Hwnd,$wanted.description)}}
 # A native Tag row is filtered by the object's numeric format. Apply an explicit
 # format change before opening the native Tag picker in this same property edit.
 if($names -ccontains 'data_type' -and $wanted.style.data_type -cne $before.style.data_type){Tab '格式';$format=C 1952 'ComboBox';if(@($p.ComboItems($format.Hwnd)|Where-Object {$_ -ceq $wanted.style.data_type}).Count -ne 1){throw 'Requested numeric format absent from original native format choices'};$p.SelectComboExact($format.Hwnd,$wanted.style.data_type);if($p.ComboSelected($format.Hwnd) -cne $wanted.style.data_type){throw 'Numeric format selection did not read back'}}
  if($names -ccontains 'numeric_font' -and $wanted.style.font -cne $before.style.font){Tab '字体';$font=C 1547 'ComboBox';$p.SelectComboExact($font.Hwnd,$wanted.style.font);if($p.ComboSelected($font.Hwnd) -cne $wanted.style.font){throw 'Requested numeric font did not read back'}}
  if($names -ccontains 'numeric_size' -and $wanted.style.size -cne $before.style.size){Tab '字体';$size=C 1439 'ComboBox';$p.SelectComboExact($size.Hwnd,$wanted.style.size);if($n.GetControlText($size.Hwnd,4096) -cne $wanted.style.size){throw 'Requested numeric size did not read back'}}
 if($names -ccontains 'operation_mode' -and $wanted.bit.operation_mode -cne $before.bit.operation_mode){EnsureBitGeneral;$p.SelectComboExact((C 1151 'ComboBox').Hwnd,$wanted.bit.operation_mode)}
 if($bitBindingChange -or ($tagBinding -and $before.kind -cin @('bit_switch','bit_lamp'))){
  EnsureBitGeneral;$deviceCombo=C 1646 'ComboBox'
  if(@($p.ComboItems($deviceCombo.Hwnd)|Where-Object {$_ -ceq $wanted.bit.device}).Count -ne 1){throw 'Requested bit device absent from actual native project choices'}
  $p.SelectComboExact($deviceCombo.Hwnd,$wanted.bit.device)
  $bitDialog=@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd -and $_.Visible -and $_.Enabled});if($bitDialog.Count -ne 1){throw 'Exact owned bit property dialog required'}
  $types=[PLC Engineering Suite.Weinview.BitAddressTypeControls]::new($n,[string]$bitDialog[0].Title);$choices=@()
  foreach($qt in @($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$choice=$types.InspectAny($DialogHwnd,$qt.Hwnd);if($choice -and @($choice.Items|Where-Object {$_ -ceq $wanted.bit.address_type}).Count -eq 1){$choices+=,$choice}}
  if($choices.Count -ne 1){throw 'Unique requested native bit address type unavailable'}
  if($choices[0].Value -cne $wanted.bit.address_type){$null=$types.SelectExact($DialogHwnd,$choices[0].Hwnd,$choices[0].Value,$wanted.bit.address_type)}
 }
 if($tagBinding){
  $main=@($n.EnumTopWindows()|Where-Object {$_.Class -ceq 'EasyBuilderPro' -and $_.Visible -and $_.Title.Contains([IO.Path]::GetFileNameWithoutExtension($ProjectPath))})
  if($main.Count -ne 1){throw 'Unique owned project main required for Tag rebind'}
  $tagSession=[pscustomobject]@{native=$n;main=$main[0];process=(Get-Process -Id $i.Pid);fresh_copy_verified=$true;output_path=$ProjectPath;exe_path=$i.Exe}
  $tagTitle='数值的属性';if($before.kind -cne 'numeric_display'){$tagDialog=@($n.EnumTopWindows()|Where-Object {$_.Hwnd -eq $DialogHwnd});if($tagDialog.Count -ne 1){throw 'Exact owned bit property dialog required for Tag selection'};$tagTitle=[string]$tagDialog[0].Title}
  $r.tag_binding_evidence=Invoke-WeinviewNumericNativeTagSelection -Session $tagSession -DialogHwnd $DialogHwnd -ExpectedDescription ([string]$wanted.description) -TagBinding $tagBinding -ExpectedDialogTitle $tagTitle
 }
 if($before.kind -cin @('bit_switch','bit_lamp') -and $names -ccontains 'address' -and ($wanted.bit.address -cne $before.bit.address -or $bitBindingChange)){EnsureBitGeneral;$n.SetControlText((C 2510 'Edit').Hwnd,$wanted.bit.address)}
 if($numericBindingChange){
  Tab '一般属性';$device=C 1646 'ComboBox'
  if(@($p.ComboItems($device.Hwnd)|Where-Object {$_ -ceq $wanted.data.device}).Count -ne 1){throw 'Requested numeric device absent from current project'}
  $p.SelectComboExact($device.Hwnd,$wanted.data.device)
  $types=[PLC Engineering Suite.Weinview.NumericAddressTypeControls]::new($n,'数值的属性');$choices=@()
  foreach($qt in @($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Visible -and $_.Enabled})){$v=$types.Inspect($DialogHwnd,$qt.Hwnd,$wanted.data.address_type);if($v){$choices+=,$v}}
  if($choices.Count -ne 1){throw 'Requested numeric address type absent or ambiguous in original device'}
  if($choices[0].Value -cne $wanted.data.address_type){$null=$types.SelectExact($DialogHwnd,$choices[0].Hwnd,$choices[0].Value,$wanted.data.address_type,(Join-Path $PSScriptRoot 'QtElementBridge.exe'))}
 }
 if(($names -ccontains 'address' -or $numericBindingChange) -and ($wanted.data.address -cne $before.data.address -or $numericBindingChange)){Tab '一般属性';$n.SetControlText((C 2510 'Edit').Hwnd,$wanted.data.address)}

 $numericFormatChanged=($before.kind -ceq 'numeric_display' -and $wanted.style.data_type -cne $before.style.data_type)
 if($before.kind -ceq 'numeric_display' -and ($numericFormatChanged -or $names -ccontains 'integer_digits' -or $names -ccontains 'decimal_digits')){
  Tab '格式'
  $digitWrites=@()
  foreach($field in @(@('integer_digits',1196,1201),@('decimal_digits',1197,1202))){
   $key=[string]$field[0];$value=[long]0;$text=[string]$wanted.style.$key
   if($text -cnotmatch '^[0-9]+$' -or ![long]::TryParse($text,[ref]$value)){throw 'Requested or preserved numeric digit count is not a nonnegative integer'}
   $edit=C $field[1] 'Edit'
   if($n.GetControlText($edit.Hwnd,64) -ceq $text){continue}
   $spin=C $field[2] 'msctls_updown32'
   $range=$p.UpDownRange($spin.Hwnd)
   if($value -lt $range[0] -or $value -gt $range[1]){throw ('Numeric '+$key+' '+$text+' is outside the current native range '+$range[0]+'..'+$range[1])}
   $digitWrites+=,[pscustomobject]@{edit=$edit.Hwnd;spin=$spin.Hwnd;value=$value}
  }
  # A format change can reset both digit fields. Restore omitted fields as well
  # as applying explicit values, without adopting the reset native defaults.
  foreach($write in $digitWrites){$p.SetNumericDigits($write.edit,$write.spin,$write.value)}
 }
 if($names -ccontains 'minimum' -or $names -ccontains 'maximum'){
  Tab '格式'
  # Relax the upper bound first when needed, so valid disjoint range shifts do
  # not pass through an inverted intermediate range in the original dialog.
  $fields=if([int]$wanted.style.minimum -gt [int]$before.style.maximum){@(@('maximum',1203),@('minimum',1200))}else{@(@('minimum',1200),@('maximum',1203))}
  foreach($field in $fields){if($names -ccontains $field[0] -and $wanted.style.($field[0]) -cne $before.style.($field[0])){$n.SetControlText((C $field[1] 'Edit').Hwnd,$wanted.style.($field[0]))}}
 }
  if($names -ccontains 'labels' -or $names -ccontains 'off_label' -or $names -ccontains 'on_label' -or $names -ccontains 'label_font' -or $names -ccontains 'label_size'){
  Tab '标签';$combo=C 1208 'ComboBox';$original=$p.ComboSelected($combo.Hwnd)
   try{foreach($state in @(0,1)){
    $target=$wanted.labels[$state];$prior=$before.labels[$state]
    if($target.text -cne $prior.text -or $target.font -cne $prior.font -or $target.size -cne $prior.size){
     $p.SelectComboExact($combo.Hwnd,[string]$state)
     if($target.font -cne $prior.font){$p.SelectComboExact((C 1547 'ComboBox').Hwnd,[string]$target.font)}
     if($target.size -cne $prior.size){$p.SelectComboExact((C 1439 'ComboBox').Hwnd,[string]$target.size)}
     if($target.text -cne $prior.text){$p.SetRichTextExact((C 1283 'RichEdit20W').Hwnd,$target.text)}
     if($p.ComboSelected((C 1547 'ComboBox').Hwnd) -cne $target.font -or $n.GetControlText((C 1439 'ComboBox').Hwnd,4096) -cne $target.size){throw 'Native label font/size readback differs'}
    }
   }}
  finally{$p.SelectComboExact($combo.Hwnd,$original);if($p.ComboSelected($combo.Hwnd) -cne $original){throw 'Original label state not restored'}}
 }
  if($colorNames.Count){Set-WeinviewRequestedAppearanceColors $IdentityPath $DialogHwnd $before.kind ([pscustomobject]$requestedColors)}
 if($names -ccontains 'rectangle'){$rect=@($wanted.rectangle);$null=& (Join-Path $PSScriptRoot 'NativeRectangleCandidate.ps1') -Action Set -CanvasWidth $CanvasWidth -CanvasHeight $CanvasHeight -IdentityPath $IdentityPath -DialogHwnd $DialogHwnd -ProjectPath $ProjectPath -X $rect[0] -Y $rect[1] -Width $rect[2] -Height $rect[3]}
 if($names -ccontains 'target_window' -and $wanted.window.target_window.number -ne $before.window.target_window.number){Tab '一般属性';if($cmtTarget){$null=$targets.SelectCmtNavigation($DialogHwnd,$targetSnapshot.Hwnd,$targetSnapshot.Value,$targetText)}else{$null=$targets.SelectExact($DialogHwnd,$targetSnapshot.Hwnd,$targetSnapshot.Value,$targetText)}}
 if($importFields.Count -and ($wanted.window.media -cne $before.window.media -or $wanted.window.import_mode -cne $before.window.import_mode -or [bool]$wanted.window.delete_after_import -ne [bool]$before.window.delete_after_import)){
  Tab '一般属性';$qt=@($n.EnumChildControls($DialogHwnd)|Where-Object {$_.Class -ceq 'Qt5QWindowIcon' -and $_.Title -ceq 'EasyBuilder Pro' -and $_.Visible -and $_.Enabled});if($qt.Count -ne 1){throw 'Unique cMT Function Key General page required'}
  $importControls=[PLC Engineering Suite.Weinview.FunctionWindowTargetControls]::new($n,'功能键的属性',(-not $OwnedSemanticBackground));$null=$importControls.SetCmtAccountImport($DialogHwnd,$qt[0].Hwnd,[string]$wanted.window.media,[string]$wanted.window.import_mode,[bool]$wanted.window.delete_after_import)
 }
 if($securityRequested){
  if(!('PLC Engineering Suite.Weinview.ObjectSecurityClassControls' -as [type])){throw 'Joint native/security class dependencies required'}
  Tab '安全';$securityControl=[PLC Engineering Suite.Weinview.ObjectSecurityClassControls]::new($n);$securityBefore=$securityControl.ReadClass($DialogHwnd)
   if($expectedHash -ceq $beforeHash -and $securityBefore -ceq $changes.security_class -and !$shapeNames.Count){throw 'At least one substantive object change required'}
  $r.security_class_before=$securityBefore;$r.security_class_requested=[string]$changes.security_class
  $r.security_class_edit=$securityControl.SetClass($DialogHwnd,$securityBefore,[string]$changes.security_class)
 }
  if($shapeNames.Count){
   $r.stage='apply-appearance-shape'
   $shape=Set-WeinviewRequestedAppearanceShape $IdentityPath $DialogHwnd $before.kind ([pscustomobject]$requestedShape)
   $r.appearance_shape_evidence=[ordered]@{object_id=$ObjectId;before=$shape.before;requested=$shape.requested;after=$shape.after;changed=[bool]$shape.changed;scope=[string]$shape.scope}
  }
 $r.stage='read-after';$afterRead=ReadActual 'after';$afterActual=$afterRead.actual;$after=CanonicalObject $ObjectId $afterActual;$afterHash=CanonicalObjectHash $after
  if($colorNames.Count){$r.appearance_color_evidence=[ordered]@{object_id=$ObjectId;before=$colorBefore;requested=[pscustomobject]$requestedColors;after=$null;native_rgb_verified=$false}}
 if($names -ccontains 'data_type' -and $wanted.style.data_type -cne $before.style.data_type){
  if($after.style.data_type -cne $wanted.style.data_type){throw 'Native numeric format differs after selection'}
  foreach($field in @('minimum','maximum')){if([string]::IsNullOrWhiteSpace([string]$after.style.$field)){throw 'Numeric format native default field absent'};if($names -cnotcontains $field){$expected.style[$field]=[string]$after.style.$field}}
  $expectedHash=CanonicalObjectHash $expected
 }
 if($securityRequested){Tab '安全';$securityAfter=$securityControl.ReadClass($DialogHwnd);$r.security_class_after=$securityAfter;if($securityAfter -cne $changes.security_class){throw 'Native object security_class readback differs'}}
 $r.after=@{object=$after;sha256=$afterHash};$r.expected_after_sha256=$expectedHash
 if($afterHash -cne $expectedHash){throw 'Requested fields or preserved canonical fields differ after native update'}
 $r.status='success';$r.stage='unconfirmed-object-update-verified';$r.source_sha256=$ExpectedSha256;$r.native_fields_verified=$true
}catch{$r.error=$_.Exception.Message;throw}finally{if($canWrite){$r.finished_utc=[DateTime]::UtcNow.ToString('o');$r|ConvertTo-Json -Depth 16|Set-Content -LiteralPath $OutputPath -Encoding UTF8}}
