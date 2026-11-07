# Dot-source only. Caller owns GUI lifecycle and serial execution.
function Initialize-WeinviewDirectoryTypes {
 if(-not ('PLC Engineering Suite.Weinview.Research.WindowTreeControls' -as [type])){
  Add-Type -AssemblyName Accessibility
  Add-Type -Path @((Join-Path $PSScriptRoot 'NativePropertyCandidate.cs'),(Join-Path $PSScriptRoot 'WindowTreeControls.cs')) -ReferencedAssemblies @('System.dll',[Accessibility.IAccessible].Assembly.Location)
 }
}
function Get-WeinviewDirectoryBinding($Session){
 Initialize-WeinviewDirectoryTypes
 $id=Get-Content -LiteralPath $Session.identity_path -Raw -Encoding UTF8|ConvertFrom-Json
 if([IO.Path]::GetFullPath($id.Project) -ine [IO.Path]::GetFullPath($Session.project_path) -or $id.Exe -ine $Session.exe_path){throw 'Directory session project/exe mismatch'}
 $main=if($Session.main.Hwnd){[long]$Session.main.Hwnd}else{[long]$Session.main}
 $tree=[PLC Engineering Suite.Weinview.Research.WindowTreeControls]::new([int]$id.Pid,[long]$id.CreationTicks,[string]$id.Exe,$main,$false)
 $children=@($Session.native.EnumChildControls($main))
 $bars=@($children|Where-Object {$_.Title -ceq '目录树' -and $_.Class -like 'BCGPControlBar:*'})
 $leaves=@();foreach($candidate in $bars){$descendants=@($Session.native.EnumChildControls($candidate.Hwnd));$nested=@($bars|Where-Object {$_.Hwnd -ne $candidate.Hwnd -and $_.Hwnd -in @($descendants.Hwnd)});if($nested.Count -eq 0){$leaves+=$candidate}}
 $bars=$leaves
 if($bars.Count -ne 1){throw 'Unique native leaf directory bar required; explicitly show entry, no layout reset'}
 [pscustomobject]@{tree=$tree;main=$main;id=$id;children=$children;bar=$bars[0];source_sha=(Get-FileHash -LiteralPath $Session.project_path).Hash}
}
function Read-WeinviewWindowRows($Session,$Tree,[long]$TreeHwnd,[string]$TreePath,[int]$WindowNumber,$Identity){
 $hint=$Session.weinview_window_header_hint
 if($hint -and ($hint.tree_hwnd -ne $TreeHwnd -or $hint.tree_path -cne $TreePath -or $hint.window_number -ne $WindowNumber -or $hint.pid -ne $Identity.Pid -or $hint.creation_ticks -ne $Identity.CreationTicks)){$hint=$null}
 if($hint){$rows=@($Tree.WindowRows($TreeHwnd,$TreePath,$WindowNumber,[string]$hint.header_path,[string]$hint.header_name))}
 else{$rows=@($Tree.WindowRows($TreeHwnd,$TreePath,$WindowNumber))}
 if($rows.Count -lt 1 -or $rows[0].role -ne 36 -or $rows[0].name -cnotmatch ('^'+$WindowNumber+'\s*:\s*')){throw 'Actual requested window header absent after native directory read'}
 $fresh=[pscustomobject]@{tree_hwnd=$TreeHwnd;tree_path=$TreePath;window_number=$WindowNumber;pid=[int]$Identity.Pid;creation_ticks=[long]$Identity.CreationTicks;header_path=[string]$rows[0].path;header_name=[string]$rows[0].name}
 if($Session -is [Collections.IDictionary]){$Session['weinview_window_header_hint']=$fresh}
 else{$Session|Add-Member -NotePropertyName weinview_window_header_hint -NotePropertyValue $fresh -Force}
 return $rows
}
function Get-WeinviewWindowDirectory {
 param([Parameter(Mandatory=$true)]$Session)
 $number=if($Session.window_number){[int]$Session.window_number}else{10}
 if($number -lt 10 -or $number -gt 1999){throw 'Ordinary window number required'}
 $bridge=Join-Path $PSScriptRoot 'QtElementBridge.exe'
 $raw=$Session.native.InvokeQtElement([long]$Session.main.Hwnd,$bridge,('tree-read:'+$number))|ConvertFrom-Json
 if([string]$raw.window_label -cnotmatch ('^'+$number+' : ')){throw 'Native window heading differs'}
 $rows=@(foreach($label in @($raw.labels)){
  $match=[regex]::Match([string]$label,'(?:^|\s)([A-Z]+_[0-9]+)(?:\s|$)')
  if(!$match.Success){throw ('Native object label has no object identity: '+$label)}
  $id=$match.Groups[1].Value
  $kind=if($id -match '^(ND|NE)_'){'Numeric'}elseif($id -match '^FK_'){'Macro'}elseif($id -match '^(TS|BL)_'){'Bit'}elseif($id -match '^TX_'){'Text'}elseif($id -match '^DW_'){'Drawing'}elseif($id -match '^GP_'){'Picture'}elseif($id -match '^TD_'){'Trend'}elseif($id -match '^RV_'){'RecipeView'}elseif($id -match '^OL_'){'OptionList'}else{'Unsupported'}
  [pscustomobject]@{object_id=$id;kind=$kind;raw_label=[string]$label;semantic_path=('qt:'+$number+'|'+[string]$label)}
 })
 return [pscustomobject]@{tree_hwnd=[long]$Session.main.Hwnd;window_number=$number;window_name=[string]$raw.window_label;rows=$rows;restore_context=$null;read_route='native_qt_model';source_sha=(Get-FileHash -LiteralPath $Session.project_path).Hash;hmi_geometry_inferred=$false}
}
function Restore-WeinviewWindowDirectory {
 param([Parameter(Mandatory=$true)]$Session,$RestoreContext)
 if($null -eq $RestoreContext){return}
 $b=Get-WeinviewDirectoryBinding $Session
 if($RestoreContext.source_sha -and $RestoreContext.source_sha -cne $b.source_sha){throw 'Restore source SHA changed'}
 if($RestoreContext.pid -ne $b.id.Pid -or $RestoreContext.creation_ticks -ne $b.id.CreationTicks){throw 'Restore context process changed'}
 $tabs=@($b.tree.FindRole($RestoreContext.tab_hwnd,37));$target=@($tabs|Where-Object {$_.name -ceq $RestoreContext.label -and $_.action -ceq 'Switch'})
 if($target.Count -ne 1){throw 'Unique original dock tab absent'}
 $b.tree.SwitchTab($RestoreContext.tab_hwnd,$target[0].path,$target[0].name)
 if((Get-FileHash -LiteralPath $Session.project_path).Hash -cne $b.source_sha){throw 'Project changed during restore'}
}
