param(
  [Parameter(Mandatory = $true)]
  [string]$Action
)

$ErrorActionPreference = "Stop"
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-JsonResult {
  param([object]$Value)
  $Value | ConvertTo-Json -Depth 50 -Compress
}

function Get-InputObject {
  $raw = [Console]::In.ReadToEnd()
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return [pscustomobject]@{}
  }
  return $raw | ConvertFrom-Json
}

function Get-Prop {
  param([object]$Object, [string]$Name, [object]$Default = $null)
  if ($null -eq $Object) { return $Default }
  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) { return $Default }
  if ($null -eq $prop.Value) { return $Default }
  return $prop.Value
}

function Get-ViewMode {
  param([object]$InputObject, [string]$Default = "control")
  $mode = ("" + (Get-Prop $InputObject "viewMode" $Default)).Trim().ToLowerInvariant()
  switch ($mode) {
    "raw" { return "raw" }
    "control" { return "control" }
    "content" { return "content" }
    default { throw "viewMode must be one of: raw, control, content." }
  }
}

function Get-DetailLevel {
  param([object]$InputObject, [string]$Default = "compact")
  $level = ("" + (Get-Prop $InputObject "detailLevel" $Default)).Trim().ToLowerInvariant()
  switch ($level) {
    "compact" { return "compact" }
    "full" { return "full" }
    default { throw "detailLevel must be one of: compact, full." }
  }
}

function Get-ViewCondition {
  param([string]$ViewMode = "control", [bool]$IncludeOffscreen = $false)
  $condition = switch ($ViewMode) {
    "raw" { [System.Windows.Automation.Automation]::RawViewCondition }
    "content" { [System.Windows.Automation.Automation]::ContentViewCondition }
    default { [System.Windows.Automation.Automation]::ControlViewCondition }
  }
  if ($null -eq $condition) {
    $condition = [System.Windows.Automation.Condition]::TrueCondition
  }
  if (-not $IncludeOffscreen) {
    $visible = New-Object System.Windows.Automation.PropertyCondition -ArgumentList ([System.Windows.Automation.AutomationElement]::IsOffscreenProperty), $false
    $condition = New-Object System.Windows.Automation.AndCondition -ArgumentList $condition, $visible
  }
  return $condition
}

function Load-Assemblies {
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  Add-Type -AssemblyName WindowsBase
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing

  if (-not ("WindowsComputerUseNative" -as [type])) {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public static class WindowsComputerUseNative {
  [DllImport("user32.dll")]
  static extern bool SetProcessDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]
  static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]
  static extern bool SetProcessDPIAware();
  public static void UsePhysicalPixels() {
    // UIA uses physical desktop pixels. Match screenshot bounds and mouse input
    // before the first Screen/UIA query, including at 125% and mixed DPI.
    try {
      SetProcessDpiAwarenessContext(new IntPtr(-4));
      SetThreadDpiAwarenessContext(new IntPtr(-4));
    } catch (EntryPointNotFoundException) { SetProcessDPIAware(); }
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct INPUT { public uint type; public INPUTUNION data; }
  [StructLayout(LayoutKind.Explicit)]
  public struct INPUTUNION {
    [FieldOffset(0)] public KEYBDINPUT keyboard;
    [FieldOffset(0)] public MOUSEINPUT mouse;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct KEYBDINPUT { public ushort vk, scan; public uint flags, time; public UIntPtr extra; }
  [StructLayout(LayoutKind.Sequential)]
  public struct MOUSEINPUT { public int x, y; public uint data, flags, time; public UIntPtr extra; }
  [DllImport("user32.dll", SetLastError=true)]
  static extern uint SendInput(uint count, INPUT[] inputs, int size);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  public static extern short VkKeyScan(char character);
  [DllImport("dwmapi.dll")]
  public static extern int DwmFlush();
  [DllImport("user32.dll")]
  public static extern IntPtr GetAncestor(IntPtr window, uint flags);
  [DllImport("user32.dll")]
  public static extern bool IsWindow(IntPtr window);
  [DllImport("user32.dll")]
  public static extern bool IsIconic(IntPtr window);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  static extern IntPtr SendMessageTimeout(IntPtr window, uint message, UIntPtr wParam, IntPtr lParam, uint flags, uint timeout, out UIntPtr result);
  [DllImport("user32.dll", EntryPoint="GetWindowLongW")]
  static extern int GetWindowLong(IntPtr window, int index);

  static INPUT Key(ushort vk, ushort scan, uint flags) {
    INPUT input = new INPUT(); input.type=1;
    input.data.keyboard=new KEYBDINPUT { vk=vk, scan=scan, flags=flags };
    return input;
  }
  static void Send(List<INPUT> inputs) {
    if (inputs.Count==0) return;
    if (SendInput((uint)inputs.Count, inputs.ToArray(), Marshal.SizeOf(typeof(INPUT))) != inputs.Count)
      throw new InvalidOperationException("Windows rejected keyboard input (desktop focus or integrity level). Error "+Marshal.GetLastWin32Error());
  }
  public static void Chord(ushort[] keys) {
    List<INPUT> inputs=new List<INPUT>();
    foreach(ushort key in keys) inputs.Add(Key(key,0,0));
    for(int i=keys.Length-1;i>=0;i--) inputs.Add(Key(keys[i],0,2));
    Send(inputs);
  }
  public static void Text(string text) {
    List<INPUT> inputs=new List<INPUT>();
    for(int i=0;i<text.Length;i++) {
      char character=text[i];
      if(character=='\r' && i+1<text.Length && text[i+1]=='\n') continue;
      if(character=='\r' || character=='\n' || character=='\t') {
        ushort key=(ushort)(character=='\t'?9:13);
        inputs.Add(Key(key,0,0)); inputs.Add(Key(key,0,2));
      } else {
        inputs.Add(Key(0,character,4)); inputs.Add(Key(0,character,6));
      }
      if(inputs.Count>=128) { Send(inputs); inputs.Clear(); }
    }
    Send(inputs);
  }
  // GetWindowText cannot read another process's Edit control. WM_GETTEXT can,
  // with a timeout so a hung app cannot hang this backend.
  public static string ReadEditText(IntPtr window) {
    if(!IsWindow(window) || (GetWindowLong(window,-16)&0x20)!=0) return null;
    UIntPtr length;
    if(SendMessageTimeout(window,14,UIntPtr.Zero,IntPtr.Zero,3,250,out length)==IntPtr.Zero) return null;
    int count=(int)Math.Min(length.ToUInt64()+1,65537UL);
    IntPtr buffer=Marshal.AllocHGlobal(count*2);
    try {
      UIntPtr copied;
      if(SendMessageTimeout(window,13,(UIntPtr)count,buffer,3,250,out copied)==IntPtr.Zero) return null;
      return Marshal.PtrToStringUni(buffer,(int)Math.Min(copied.ToUInt64(),(ulong)count-1));
    } finally { Marshal.FreeHGlobal(buffer); }
  }
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll")]
  public static extern bool SetCursorPos(int X, int Y);

  [DllImport("user32.dll")]
  public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, UIntPtr dwExtraInfo);

  public const int MOUSEEVENTF_MOVE = 0x0001;
  public const int MOUSEEVENTF_LEFTDOWN = 0x0002;
  public const int MOUSEEVENTF_LEFTUP = 0x0004;
  public const int MOUSEEVENTF_RIGHTDOWN = 0x0008;
  public const int MOUSEEVENTF_RIGHTUP = 0x0010;
  public const int MOUSEEVENTF_MIDDLEDOWN = 0x0020;
  public const int MOUSEEVENTF_MIDDLEUP = 0x0040;
  public const int MOUSEEVENTF_WHEEL = 0x0800;
  public const int MOUSEEVENTF_HWHEEL = 0x01000;
}
"@
  }
  [WindowsComputerUseNative]::UsePhysicalPixels()
}

function Invoke-Safe {
  param([scriptblock]$Block, [object]$Default = $null)
  try {
    return & $Block
  } catch {
    return $Default
  }
}

function Get-ControlTypeName {
  param([object]$ControlType)
  if ($null -eq $ControlType) { return $null }
  $name = Invoke-Safe { $ControlType.ProgrammaticName } $null
  if ($null -eq $name) { return $null }
  return ($name -replace "^ControlType\.", "")
}

function Convert-Rect {
  param([object]$Rect)
  if ($null -eq $Rect) { return $null }
  $empty = Invoke-Safe { $Rect.IsEmpty } $true
  if ($empty) { return $null }
  $x = [int][Math]::Round($Rect.X)
  $y = [int][Math]::Round($Rect.Y)
  $width = [int][Math]::Round($Rect.Width)
  $height = [int][Math]::Round($Rect.Height)
  return [ordered]@{
    x = $x
    y = $y
    width = $width
    height = $height
    centerX = [int]($x + ($width / 2))
    centerY = [int]($y + ($height / 2))
  }
}

function Get-Patterns {
  param([System.Windows.Automation.AutomationElement]$Element)
  $items = New-Object System.Collections.Generic.List[string]
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern) } $false) { $items.Add("Invoke") }
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$pattern) } $false) { $items.Add("Value") }
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern, [ref]$pattern) } $false) { $items.Add("Toggle") }
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$pattern) } $false) { $items.Add("SelectionItem") }
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern, [ref]$pattern) } $false) { $items.Add("ExpandCollapse") }
  $pattern = $null
  if (Invoke-Safe { $Element.TryGetCurrentPattern([System.Windows.Automation.ScrollItemPattern]::Pattern, [ref]$pattern) } $false) { $items.Add("ScrollItem") }
  return ,([string[]]$items.ToArray())
}

function Get-ValueText {
  param([System.Windows.Automation.AutomationElement]$Element)
  if (Invoke-Safe { $Element.Current.IsPassword } $true) { return $null }
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.ValuePattern]::Pattern)
  if ($null -ne $pattern) { return Invoke-Safe { $pattern.Current.Value } $null }
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.TextPattern]::Pattern)
  if ($null -ne $pattern) { return Invoke-Safe { $pattern.DocumentRange.GetText(65536) } $null }
  $className = Invoke-Safe { $Element.Current.ClassName } ""
  $hwnd = Invoke-Safe { $Element.Current.NativeWindowHandle } 0
  if ($hwnd -ne 0 -and $className -match '^(Edit|RichEdit.*)$') {
    return [WindowsComputerUseNative]::ReadEditText([IntPtr]([int64]$hwnd))
  }
  return $null
}

function Get-ElementPattern {
  param([System.Windows.Automation.AutomationElement]$Element, [System.Windows.Automation.AutomationPattern]$Pattern)
  try { return $Element.GetCurrentPattern($Pattern) } catch { return $null }
}

function Convert-ElementInfo {
  param(
    [System.Windows.Automation.AutomationElement]$Element,
    [string]$Id = $null,
    [int]$Depth = 0,
    [string]$DetailLevel = "full"
  )

  $rect = Convert-Rect (Invoke-Safe { $Element.Current.BoundingRectangle } $null)
  $processId = Invoke-Safe { $Element.Current.ProcessId } $null
  $nativeHwnd = Invoke-Safe { $Element.Current.NativeWindowHandle } $null
  $info = [ordered]@{
    id = $Id
    depth = $Depth
    name = Invoke-Safe { $Element.Current.Name } ""
    automationId = Invoke-Safe { $Element.Current.AutomationId } ""
    className = Invoke-Safe { $Element.Current.ClassName } ""
    controlType = Get-ControlTypeName (Invoke-Safe { $Element.Current.ControlType } $null)
    boundingBox = $rect
    isEnabled = Invoke-Safe { $Element.Current.IsEnabled } $null
    isOffscreen = Invoke-Safe { $Element.Current.IsOffscreen } $null
    hasKeyboardFocus = Invoke-Safe { $Element.Current.HasKeyboardFocus } $null
  }
  if ($DetailLevel -eq "full") {
    $runtime = Invoke-Safe { [string]::Join(".", $Element.GetRuntimeId()) } $null
    $value = Get-ValueText $Element
    $patterns = [string[]](Get-Patterns $Element)
    $info["localizedControlType"] = Invoke-Safe { $Element.Current.LocalizedControlType } ""
    $info["processId"] = $processId
    $info["nativeWindowHandle"] = $nativeHwnd
    $info["runtimeId"] = $runtime
    $info["value"] = $value
    $info["patterns"] = $patterns
  } else {
    if ($Depth -le 1 -and $null -ne $processId) { $info["processId"] = $processId }
    if ($null -ne $nativeHwnd -and [int64]$nativeHwnd -ne 0) { $info["nativeWindowHandle"] = $nativeHwnd }
    if ($info.controlType -in @("Edit", "Document") -or $info.className -match '^(Edit|RichEdit.*)$') {
      $info["value"] = Get-ValueText $Element
    }
  }
  return $info
}

function Has-WindowTarget {
  param([object]$InputObject)
  if ($null -eq $InputObject) { return $false }
  $title = [string](Get-Prop $InputObject "windowTitle" "")
  $processId = Get-Prop $InputObject "processId" $null
  $hwnd = Get-Prop $InputObject "nativeWindowHandle" $null
  return (-not [string]::IsNullOrWhiteSpace($title)) -or ($null -ne $processId) -or ($null -ne $hwnd)
}

function Test-TargetMatch {
  param([object]$Info, [object]$InputObject)
  $title = [string](Get-Prop $InputObject "windowTitle" "")
  $processId = Get-Prop $InputObject "processId" $null
  $hwnd = Get-Prop $InputObject "nativeWindowHandle" $null

  if (-not [string]::IsNullOrWhiteSpace($title)) {
    $name = "" + $Info.name
    if ($name.IndexOf($title, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) { return $false }
  }
  if ($null -ne $processId -and [int]$Info.processId -ne [int]$processId) { return $false }
  if ($null -ne $hwnd -and [int64]$Info.nativeWindowHandle -ne [int64]$hwnd) { return $false }
  return $true
}

function Set-WindowForeground {
  param([System.Windows.Automation.AutomationElement]$Element)
  $hwnd = Invoke-Safe { $Element.Current.NativeWindowHandle } 0
  if ($hwnd -and $hwnd -ne 0) {
    $ptr = [IntPtr]([int64]$hwnd)
    if ([WindowsComputerUseNative]::GetAncestor([WindowsComputerUseNative]::GetForegroundWindow(), 2) -eq [WindowsComputerUseNative]::GetAncestor($ptr, 2)) { return }
    if ([WindowsComputerUseNative]::IsIconic($ptr)) {
      [WindowsComputerUseNative]::ShowWindow($ptr, 9) | Out-Null
      Start-Sleep -Milliseconds 80
    }
    [WindowsComputerUseNative]::SetForegroundWindow($ptr) | Out-Null
    Start-Sleep -Milliseconds 120
    if ([WindowsComputerUseNative]::GetAncestor([WindowsComputerUseNative]::GetForegroundWindow(), 2) -ne [WindowsComputerUseNative]::GetAncestor($ptr, 2)) {
      throw "Could not activate the requested window. Keyboard input was not sent."
    }
  }
}

function Assert-KeyboardTarget {
  param([object]$InputObject)
  Activate-TargetIfRequested $InputObject -ForInput $true
  $foreground = [WindowsComputerUseNative]::GetForegroundWindow()
  if ($foreground -eq [IntPtr]::Zero) { throw "No foreground desktop window is available. Keyboard input was not sent." }
  if (Has-WindowTarget $InputObject) {
    $target = Resolve-TargetWindow $InputObject
    $hwnd = [IntPtr]([int64]$target.Current.NativeWindowHandle)
    if ([WindowsComputerUseNative]::GetAncestor($foreground, 2) -ne [WindowsComputerUseNative]::GetAncestor($hwnd, 2)) {
      throw "The requested window is not foreground. Use activate=true; input was not sent to another app."
    }
  }
}

function Activate-TargetIfRequested {
  param([object]$InputObject, [bool]$ForInput = $false)
  if ((Has-WindowTarget $InputObject) -and [bool](Get-Prop $InputObject "activate" $ForInput)) {
    $target = Resolve-TargetWindow $InputObject
    Set-WindowForeground $target
  }
}

function Resolve-TargetWindow {
  param([object]$InputObject)
  if (-not (Has-WindowTarget $InputObject)) { return $null }

  $hwnd = Get-Prop $InputObject "nativeWindowHandle" $null
  if ($null -ne $hwnd) {
    if (-not [WindowsComputerUseNative]::IsWindow([IntPtr]([int64]$hwnd))) { throw "Target window no longer exists: $hwnd." }
    $element = Invoke-Safe { [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]([int64]$hwnd)) } $null
    if ($null -eq $element) { throw "No UI Automation window found for nativeWindowHandle '$hwnd'." }
    return $element
  }

  $root = [System.Windows.Automation.AutomationElement]::RootElement
  $children = Get-Children -Element $root -ViewMode "control" -IncludeOffscreen $true
  $fallback = $null
  for ($i = 0; $i -lt $children.Count; $i++) {
    $el = $children.Item($i)
    $info = Convert-ElementInfo -Element $el -Id "uia:root.$i" -Depth 1
    if (Test-TargetMatch -Info $info -InputObject $InputObject) {
      if (-not $info.isOffscreen) { return $el }
      if ($null -eq $fallback) { $fallback = $el }
    }
  }
  if ($null -ne $fallback) { return $fallback }
  throw "No top-level window matched the requested target."
}

function Get-ScopeRoot {
  param([string]$Scope, [object]$InputObject = $null)
  if ($Scope -eq "desktop") {
    return [System.Windows.Automation.AutomationElement]::RootElement
  }

  $target = Resolve-TargetWindow $InputObject
  if ($null -ne $target) {
    if ([bool](Get-Prop $InputObject "activate" $false)) {
      Set-WindowForeground $target
    }
    return $target
  }

  $hwnd = [WindowsComputerUseNative]::GetForegroundWindow()
  if ($hwnd -ne [IntPtr]::Zero) {
    $element = Invoke-Safe { [System.Windows.Automation.AutomationElement]::FromHandle($hwnd) } $null
    if ($null -ne $element) { return $element }
  }
  return [System.Windows.Automation.AutomationElement]::RootElement
}

function Get-Children {
  param(
    [System.Windows.Automation.AutomationElement]$Element,
    [string]$ViewMode = "control",
    [bool]$IncludeOffscreen = $false
  )
  $items = New-Object "System.Collections.Generic.List[System.Windows.Automation.AutomationElement]"
  try {
    $condition = Get-ViewCondition -ViewMode $ViewMode -IncludeOffscreen $IncludeOffscreen
    $collection = $Element.FindAll([System.Windows.Automation.TreeScope]::Children, $condition)
  } catch {
    return ,$items
  }
  if ($null -eq $collection) { return ,$items }
  for ($i = 0; $i -lt $collection.Count; $i++) {
    $child = $collection.Item($i)
    # Some providers report IsOffscreen=false even for minimized windows.
    # Do not traverse them (or our click-through frame) during desktop searches.
    $name = Invoke-Safe { $child.Current.Name } ""
    if ($name -eq "PLC Engineering Suite Computer Use Indicator") { continue }
    if (-not $IncludeOffscreen) {
      $hwnd = Invoke-Safe { [IntPtr]([int64]$child.Current.NativeWindowHandle) } ([IntPtr]::Zero)
      if ($hwnd -ne [IntPtr]::Zero -and [WindowsComputerUseNative]::IsIconic($hwnd)) { continue }
    }
    $items.Add($child)
  }
  return ,$items
}

function Convert-Tree {
  param(
    [System.Windows.Automation.AutomationElement]$Element,
    [string]$Path,
    [int]$Depth,
    [int]$MaxDepth,
    [ref]$Count,
    [int]$MaxNodes,
    [string]$ViewMode = "control",
    [bool]$IncludeOffscreen = $false,
    [string]$DetailLevel = "compact"
  )

  if ($Count.Value -ge $MaxNodes -or $script:TraversalClock.ElapsedMilliseconds -ge 8000) { return $null }
  $id = "uia:$Path"
  $info = Convert-ElementInfo -Element $Element -Id $id -Depth $Depth -DetailLevel $DetailLevel
  $Count.Value = $Count.Value + 1
  $childrenOut = New-Object System.Collections.Generic.List[object]

  if ($Depth -lt $MaxDepth) {
    $children = Get-Children -Element $Element -ViewMode $ViewMode -IncludeOffscreen $IncludeOffscreen
    if ($null -ne $children) {
      for ($i = 0; $i -lt $children.Count; $i++) {
        if ($Count.Value -ge $MaxNodes -or $script:TraversalClock.ElapsedMilliseconds -ge 8000) { break }
        $childPath = "$Path.$i"
        $child = Convert-Tree -Element $children.Item($i) -Path $childPath -Depth ($Depth + 1) -MaxDepth $MaxDepth -Count $Count -MaxNodes $MaxNodes -ViewMode $ViewMode -IncludeOffscreen $IncludeOffscreen -DetailLevel $DetailLevel
        if ($null -ne $child) { $childrenOut.Add($child) }
      }
    }
  }
  $info["children"] = @($childrenOut.ToArray())
  return $info
}

function Resolve-Element {
  param([string]$ElementId, [object]$InputObject = $null)
  if ([string]::IsNullOrWhiteSpace($ElementId)) {
    throw "elementId is required."
  }
  if ($ElementId -notmatch "^uia:(active|root)(\.\d+)*$") {
    throw "Unsupported element id '$ElementId'. Use an id from windows_computer_use_snapshot or windows_computer_use_accessibility_tree."
  }

  $path = $ElementId.Substring(4)
  $parts = $path.Split(".")
  $scopeName = $parts[0]
  $viewMode = Get-ViewMode $InputObject "control"
  $includeOffscreen = [bool](Get-Prop $InputObject "includeOffscreen" $false)
  $element = if ($scopeName -eq "root") {
    [System.Windows.Automation.AutomationElement]::RootElement
  } else {
    Get-ScopeRoot "active_window" $InputObject
  }

  for ($i = 1; $i -lt $parts.Length; $i++) {
    $index = [int]$parts[$i]
    $children = Get-Children -Element $element -ViewMode $viewMode -IncludeOffscreen $includeOffscreen
    if ($null -eq $children -or $index -lt 0 -or $index -ge $children.Count) {
      throw "Element path '$ElementId' is stale or out of range at segment $i."
    }
    $element = $children.Item($index)
  }
  return $element
}

function Get-PointFromArgs {
  param([object]$InputObject)
  Activate-TargetIfRequested $InputObject
  $elementId = Get-Prop $InputObject "elementId" $null
  if ($null -ne $elementId) {
    $el = Resolve-Element $elementId $InputObject
    $rect = Convert-Rect (Invoke-Safe { $el.Current.BoundingRectangle } $null)
    if ($null -eq $rect) { throw "Element '$elementId' has no clickable bounding box." }
    return [ordered]@{ x = $rect.centerX; y = $rect.centerY; element = $el; elementId = $elementId }
  }

  $x = Get-Prop $InputObject "x" $null
  $y = Get-Prop $InputObject "y" $null
  if ($null -eq $x -or $null -eq $y) {
    throw "Provide either elementId or x and y."
  }
  return [ordered]@{ x = [int]$x; y = [int]$y; element = $null; elementId = $null }
}

function Get-ButtonFlags {
  param([string]$Button)
  switch ($Button) {
    "right" { return @(0x0008, 0x0010) }
    "middle" { return @(0x0020, 0x0040) }
    default { return @(0x0002, 0x0004) }
  }
}

function Click-At {
  param([int]$X, [int]$Y, [string]$Button = "left", [int]$Count = 1)
  $flags = Get-ButtonFlags $Button
  [WindowsComputerUseNative]::SetCursorPos($X, $Y) | Out-Null
  Start-Sleep -Milliseconds 60
  for ($i = 0; $i -lt $Count; $i++) {
    [WindowsComputerUseNative]::mouse_event($flags[0], 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 30
    [WindowsComputerUseNative]::mouse_event($flags[1], 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 80
  }
}

function Move-ToPoint {
  param([int]$X, [int]$Y)
  [WindowsComputerUseNative]::SetCursorPos($X, $Y) | Out-Null
}

function Capture-Screenshot {
  param([object]$WindowBounds = $null)
  $bounds = [System.Windows.Forms.SystemInformation]::VirtualScreen
  if ($null -ne $WindowBounds) {
    $windowRect = New-Object System.Drawing.Rectangle ([int]$WindowBounds.x), ([int]$WindowBounds.y), ([int]$WindowBounds.width), ([int]$WindowBounds.height)
    $bounds = [System.Drawing.Rectangle]::Intersect($bounds, $windowRect)
  }
  if ($bounds.Width -le 0 -or $bounds.Height -le 0) { throw "The requested window has no visible screenshot area." }
  $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $stream = New-Object System.IO.MemoryStream
  try {
    # Apply capture exclusions on the compositor before reading pixels.
    [WindowsComputerUseNative]::DwmFlush() | Out-Null
    $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bitmap.Size)
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $stream.ToArray()
    return [ordered]@{
      mimeType = "image/png"
      base64 = [Convert]::ToBase64String($bytes)
      bounds = [ordered]@{
        x = $bounds.Left
        y = $bounds.Top
        width = $bounds.Width
        height = $bounds.Height
      }
    }
  } finally {
    $stream.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Get-TreeResult {
  param([string]$Scope, [int]$MaxDepth, [int]$MaxNodes, [object]$InputObject = $null)
  $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
  $script:TraversalClock = $stopwatch
  $viewMode = Get-ViewMode $InputObject "control"
  $includeOffscreen = [bool](Get-Prop $InputObject "includeOffscreen" $false)
  $detailLevel = Get-DetailLevel $InputObject "compact"
  $root = Get-ScopeRoot $Scope $InputObject
  $prefix = if ($Scope -eq "desktop") { "root" } else { "active" }
  $count = 0
  $tree = Convert-Tree -Element $root -Path $prefix -Depth 0 -MaxDepth $MaxDepth -Count ([ref]$count) -MaxNodes $MaxNodes -ViewMode $viewMode -IncludeOffscreen $includeOffscreen -DetailLevel $detailLevel
  $stopwatch.Stop()
  return [ordered]@{
    ok = $true
    scope = $Scope
    viewMode = $viewMode
    includeOffscreen = $includeOffscreen
    detailLevel = $detailLevel
    nodeCount = $count
    truncated = ($count -ge $MaxNodes -or $stopwatch.ElapsedMilliseconds -ge 8000)
    durationMs = [int]$stopwatch.ElapsedMilliseconds
    tree = $tree
  }
}

function Element-Matches {
  param([object]$Info, [string]$Query, [string]$ControlType)
  if (-not [string]::IsNullOrWhiteSpace($ControlType)) {
    if (($Info.controlType + "") -notlike "*$ControlType*") { return $false }
  }
  if ([string]::IsNullOrWhiteSpace($Query)) { return $true }
  $haystack = @(
    $Info.name,
    $Info.automationId,
    $Info.className,
    $Info.controlType,
    $Info.localizedControlType,
    $Info.value
  ) -join "`n"
  return $haystack.IndexOf($Query, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Search-Tree {
  param([object]$Node, [string]$Query, [string]$ControlType, [int]$MaxResults, [System.Collections.Generic.List[object]]$Results)
  if ($null -eq $Node -or $Results.Count -ge $MaxResults) { return }
  if (Element-Matches -Info $Node -Query $Query -ControlType $ControlType) {
    $copy = [ordered]@{}
    foreach ($prop in $Node.Keys) {
      if ($prop -ne "children") { $copy[$prop] = $Node[$prop] }
    }
    $Results.Add($copy)
  }
  foreach ($child in @($Node.children)) {
    if ($Results.Count -ge $MaxResults) { break }
    Search-Tree -Node $child -Query $Query -ControlType $ControlType -MaxResults $MaxResults -Results $Results
  }
}

function Find-Elements {
  param([object]$InputObject)
  $scope = Get-Prop $InputObject "scope" "active_window"
  $query = Get-Prop $InputObject "query" ""
  $controlType = Get-Prop $InputObject "controlType" ""
  $maxDepth = [int](Get-Prop $InputObject "maxDepth" 8)
  $maxNodes = [int](Get-Prop $InputObject "maxNodes" 1200)
  $maxResults = [int](Get-Prop $InputObject "maxResults" 25)
  $viewMode = Get-ViewMode $InputObject "control"
  $offscreen = [bool](Get-Prop $InputObject "includeOffscreen" $false)
  $clock = [System.Diagnostics.Stopwatch]::StartNew()
  $queue = New-Object System.Collections.Generic.Queue[object]
  $prefix = if ($scope -eq "desktop") { "root" } else { "active" }
  $queue.Enqueue(@{ element = (Get-ScopeRoot $scope $InputObject); path = $prefix; depth = 0 })
  $results = New-Object System.Collections.Generic.List[object]
  $count = 0
  while ($queue.Count -gt 0 -and $count -lt $maxNodes -and $results.Count -lt $maxResults -and $clock.ElapsedMilliseconds -lt 8000) {
    $node = $queue.Dequeue()
    $info = Convert-ElementInfo $node.element "uia:$($node.path)" $node.depth "compact"
    $count++
    if (Element-Matches $info $query $controlType) {
      $results.Add((Convert-ElementInfo $node.element "uia:$($node.path)" $node.depth "full"))
    }
    if ($node.depth -lt $maxDepth -and $clock.ElapsedMilliseconds -lt 8000) {
      $children = Get-Children $node.element $viewMode $offscreen
      for ($i = 0; $i -lt $children.Count; $i++) {
        $queue.Enqueue(@{ element = $children.Item($i); path = "$($node.path).$i"; depth = $node.depth + 1 })
      }
    }
  }
  return [ordered]@{ ok = $true; query = $query; results = @($results.ToArray()); scannedNodes = $count; truncated = ($queue.Count -gt 0); durationMs = [int]$clock.ElapsedMilliseconds }
}

function Convert-KeyChord {
  param([object[]]$Keys)
  $modifiers = New-Object 'System.Collections.Generic.List[System.UInt16]'
  $parts = New-Object 'System.Collections.Generic.List[System.String]'
  foreach ($keyRaw in $Keys) {
    $remaining = ("" + $keyRaw).Trim()
    while ($remaining -match '^(ctrl|control|alt|option|shift|cmd|meta|win|windows)\s*\+\s*(.+)$') {
      $parts.Add($matches[1])
      $remaining = $matches[2].Trim()
    }
    $parts.Add($remaining)
  }
  $main = $null
  foreach ($keyRaw in $parts) {
    $key = ("" + $keyRaw).Trim()
    $modifier = switch -Regex ($key.ToLowerInvariant()) {
      "^(ctrl|control)$" { 0x11; break }
      "^(alt|option)$" { 0x12; break }
      "^shift$" { 0x10; break }
      "^(cmd|meta|win|windows)$" { 0x5B; break }
      default { $null }
    }
    if ($null -ne $modifier) { if (-not $modifiers.Contains([System.UInt16]$modifier)) { $modifiers.Add([System.UInt16]$modifier) }; continue }
    if ($null -ne $main) { throw "keypress accepts one key or one chord. Use type_text for a sequence of characters." }
    $main = $key
  }
  if ([string]::IsNullOrWhiteSpace($main)) {
    if ($modifiers.Count -eq 1) { return ,([System.UInt16[]]$modifiers.ToArray()) }
    throw "Provide one key or a chord containing a non-modifier key."
  }
  $special = @{
    "enter" = 13; "return" = 13; "tab" = 9; "esc" = 27; "escape" = 27;
    "backspace" = 8; "delete" = 46; "del" = 46; "home" = 36;
    "end" = 35; "pageup" = 33; "pagedown" = 34; "up" = 38; "down" = 40;
    "left" = 37; "right" = 39; "space" = 32; "insert" = 45
  }
  $lower = $main.ToLowerInvariant()
  $virtualKey = if ($special.ContainsKey($lower)) { $special[$lower]
  } elseif ($lower -match '^f([1-9]|1[0-9]|2[0-4])$') { 0x6F + [int]$matches[1]
  } elseif ($main.Length -eq 1) {
    # Uppercase shortcut notation (Ctrl+A) does not imply holding Shift.
    $shortcutLetter = $main -match '^[a-z]$' -and ($modifiers.Contains([System.UInt16]0x11) -or $modifiers.Contains([System.UInt16]0x12) -or $modifiers.Contains([System.UInt16]0x5B))
    $mapped = if ($shortcutLetter) { [int][char]$main.ToUpperInvariant() } else { [int][WindowsComputerUseNative]::VkKeyScan([char]$main) }
    if ($mapped -eq -1) { throw "Key '$main' has no virtual key mapping. Use type_text for Unicode text." }
    if (($mapped -band 0x100) -ne 0 -and -not $modifiers.Contains([System.UInt16]0x10)) { $modifiers.Add(0x10) }
    if (($mapped -band 0x200) -ne 0 -and -not $modifiers.Contains([System.UInt16]0x11)) { $modifiers.Add(0x11) }
    if (($mapped -band 0x400) -ne 0 -and -not $modifiers.Contains([System.UInt16]0x12)) { $modifiers.Add(0x12) }
    $mapped -band 0xFF
  } else { throw "Unsupported key '$main'." }
  $modifiers.Add([System.UInt16]$virtualKey)
  return ,([System.UInt16[]]$modifiers.ToArray())
}

function Focus-Element {
  param([System.Windows.Automation.AutomationElement]$Element, [object]$InputObject)
  Assert-KeyboardTarget $InputObject
  try { $Element.SetFocus() } catch {
    $rect = Convert-Rect $Element.Current.BoundingRectangle
    if ($null -eq $rect -or $Element.Current.IsOffscreen -or -not $Element.Current.IsEnabled) {
      throw "Element cannot receive focus and has no visible enabled click target."
    }
    Click-At -X $rect.centerX -Y $rect.centerY
  }
  Assert-KeyboardTarget $InputObject
}

function Type-Text {
  param([string]$Text, [bool]$RestoreClipboard = $true)
  [WindowsComputerUseNative]::Text($Text)
  Start-Sleep -Milliseconds 80
}

function Invoke-ElementPattern {
  param([System.Windows.Automation.AutomationElement]$Element)
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.InvokePattern]::Pattern)
  if ($null -ne $pattern) {
    $pattern.Invoke()
    return "Invoke"
  }
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.TogglePattern]::Pattern)
  if ($null -ne $pattern) {
    $pattern.Toggle()
    return "Toggle"
  }
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.SelectionItemPattern]::Pattern)
  if ($null -ne $pattern) {
    $pattern.Select()
    return "SelectionItem"
  }
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.ExpandCollapsePattern]::Pattern)
  if ($null -ne $pattern) {
    $state = Invoke-Safe { $pattern.Current.ExpandCollapseState } $null
    if ($state -eq [System.Windows.Automation.ExpandCollapseState]::Collapsed) {
      $pattern.Expand()
    } else {
      $pattern.Collapse()
    }
    return "ExpandCollapse"
  }
  return $null
}

function Set-ElementValue {
  param([System.Windows.Automation.AutomationElement]$Element, [string]$Value)
  $pattern = Get-ElementPattern $Element ([System.Windows.Automation.ValuePattern]::Pattern)
  if ($null -ne $pattern) {
    $pattern.SetValue($Value)
    return "ValuePattern"
  }
  return $null
}

try {
  Load-Assemblies
  $inputObject = Get-InputObject

  switch ($Action) {
    "health" {
      $screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
      $active = Get-ScopeRoot "active_window"
      Write-JsonResult ([ordered]@{
        ok = $true
        platform = "Windows"
        powershell = $PSVersionTable.PSVersion.ToString()
        uiAutomation = $true
        screenshot = $true
        coordinateSpace = "physical_desktop_pixels"
        activeWindow = Convert-ElementInfo -Element $active -Id "uia:active" -Depth 0
        virtualScreen = [ordered]@{ x = $screen.Left; y = $screen.Top; width = $screen.Width; height = $screen.Height }
      })
    }
    "snapshot" {
      $scope = Get-Prop $inputObject "scope" "active_window"
      $includeScreenshot = [bool](Get-Prop $inputObject "includeScreenshot" $true)
      $maxDepth = [int](Get-Prop $inputObject "maxDepth" 5)
      $maxNodes = [int](Get-Prop $inputObject "maxNodes" 250)
      $treeResult = Get-TreeResult -Scope $scope -MaxDepth $maxDepth -MaxNodes $maxNodes -InputObject $inputObject
      if ($includeScreenshot) {
        $windowBounds = if ($scope -eq "desktop") { $null } else { $treeResult.tree.boundingBox }
        if ($scope -ne "desktop" -and $null -eq $windowBounds) { throw "The requested window has no screenshot bounds." }
        $treeResult.screenshot = Capture-Screenshot -WindowBounds $windowBounds
      }
      Write-JsonResult $treeResult
    }
    "tree" {
      $scope = Get-Prop $inputObject "scope" "active_window"
      $maxDepth = [int](Get-Prop $inputObject "maxDepth" 6)
      $maxNodes = [int](Get-Prop $inputObject "maxNodes" 500)
      Write-JsonResult (Get-TreeResult -Scope $scope -MaxDepth $maxDepth -MaxNodes $maxNodes -InputObject $inputObject)
    }
    "list_windows" {
      $includeInvisible = [bool](Get-Prop $inputObject "includeInvisible" $false)
      $maxWindows = [int](Get-Prop $inputObject "maxWindows" 50)
      $root = [System.Windows.Automation.AutomationElement]::RootElement
      $children = Get-Children -Element $root -ViewMode "control" -IncludeOffscreen $includeInvisible
      $windows = New-Object System.Collections.Generic.List[object]
      for ($i = 0; $i -lt $children.Count; $i++) {
        if ($windows.Count -ge $maxWindows) { break }
        $el = $children.Item($i)
        $info = Convert-ElementInfo -Element $el -Id "uia:root.$i" -Depth 1
        if (-not $includeInvisible -and $info.isOffscreen) { continue }
        $windows.Add($info)
      }
      Write-JsonResult ([ordered]@{ ok = $true; windows = @($windows.ToArray()) })
    }
    "find" {
      Write-JsonResult (Find-Elements $inputObject)
    }
    "element_info" {
      $elementId = Get-Prop $inputObject "elementId" $null
      if ($null -ne $elementId) {
        $el = Resolve-Element $elementId $inputObject
        Write-JsonResult ([ordered]@{ ok = $true; element = (Convert-ElementInfo -Element $el -Id $elementId -Depth 0) })
      } else {
        $x = [int](Get-Prop $inputObject "x" 0)
        $y = [int](Get-Prop $inputObject "y" 0)
        $point = New-Object System.Windows.Point($x, $y)
        $el = [System.Windows.Automation.AutomationElement]::FromPoint($point)
        Write-JsonResult ([ordered]@{ ok = $true; point = [ordered]@{ x = $x; y = $y }; element = (Convert-ElementInfo -Element $el -Id $null -Depth 0) })
      }
    }
    "click" {
      $point = Get-PointFromArgs $inputObject
      $button = Get-Prop $inputObject "button" "left"
      Click-At -X $point.x -Y $point.y -Button $button -Count 1
      Write-JsonResult ([ordered]@{ ok = $true; action = "click"; x = $point.x; y = $point.y; button = $button; elementId = $point.elementId })
    }
    "double_click" {
      $point = Get-PointFromArgs $inputObject
      $button = Get-Prop $inputObject "button" "left"
      Click-At -X $point.x -Y $point.y -Button $button -Count 2
      Write-JsonResult ([ordered]@{ ok = $true; action = "double_click"; x = $point.x; y = $point.y; button = $button; elementId = $point.elementId })
    }
    "move" {
      $point = Get-PointFromArgs $inputObject
      Move-ToPoint -X $point.x -Y $point.y
      Write-JsonResult ([ordered]@{ ok = $true; action = "move"; x = $point.x; y = $point.y; elementId = $point.elementId })
    }
    "drag" {
      Activate-TargetIfRequested $inputObject
      $path = @(Get-Prop $inputObject "path" @())
      if ($path.Count -lt 2) { throw "path must contain at least two points." }
      $button = Get-Prop $inputObject "button" "left"
      $flags = Get-ButtonFlags $button
      [WindowsComputerUseNative]::SetCursorPos([int]$path[0].x, [int]$path[0].y) | Out-Null
      Start-Sleep -Milliseconds 60
      [WindowsComputerUseNative]::mouse_event($flags[0], 0, 0, 0, [UIntPtr]::Zero)
      foreach ($pt in $path) {
        [WindowsComputerUseNative]::SetCursorPos([int]$pt.x, [int]$pt.y) | Out-Null
        Start-Sleep -Milliseconds 30
      }
      [WindowsComputerUseNative]::mouse_event($flags[1], 0, 0, 0, [UIntPtr]::Zero)
      Write-JsonResult ([ordered]@{ ok = $true; action = "drag"; points = $path.Count; button = $button })
    }
    "scroll" {
      $point = Get-PointFromArgs $inputObject
      $deltaY = [int](Get-Prop $inputObject "deltaY" 480)
      $deltaX = [int](Get-Prop $inputObject "deltaX" 0)
      [WindowsComputerUseNative]::SetCursorPos($point.x, $point.y) | Out-Null
      Start-Sleep -Milliseconds 40
      if ($deltaY -ne 0) {
        [WindowsComputerUseNative]::mouse_event(0x0800, 0, 0, -1 * $deltaY, [UIntPtr]::Zero)
      }
      if ($deltaX -ne 0) {
        [WindowsComputerUseNative]::mouse_event(0x01000, 0, 0, $deltaX, [UIntPtr]::Zero)
      }
      Write-JsonResult ([ordered]@{ ok = $true; action = "scroll"; x = $point.x; y = $point.y; deltaX = $deltaX; deltaY = $deltaY; elementId = $point.elementId })
    }
    "type_text" {
      Assert-KeyboardTarget $inputObject
      $text = [string](Get-Prop $inputObject "text" "")
      $restore = [bool](Get-Prop $inputObject "restoreClipboard" $true)
      Type-Text -Text $text -RestoreClipboard $restore
      Write-JsonResult ([ordered]@{ ok = $true; action = "type_text"; length = $text.Length; inputMethod = "SendInputUnicode"; clipboardUnchanged = $true })
    }
    "keypress" {
      Assert-KeyboardTarget $inputObject
      $keys = @(Get-Prop $inputObject "keys" @())
      $chord = Convert-KeyChord -Keys $keys
      [WindowsComputerUseNative]::Chord($chord)
      Write-JsonResult ([ordered]@{ ok = $true; action = "keypress"; keys = $keys; inputMethod = "SendInput" })
    }
    "focus" {
      $elementId = [string](Get-Prop $inputObject "elementId" "")
      $el = Resolve-Element $elementId $inputObject
      Focus-Element $el $inputObject
      Write-JsonResult ([ordered]@{ ok = $true; action = "focus"; elementId = $elementId })
    }
    "invoke" {
      $elementId = [string](Get-Prop $inputObject "elementId" "")
      $fallback = [bool](Get-Prop $inputObject "fallbackClick" $true)
      $el = Resolve-Element $elementId $inputObject
      $method = Invoke-ElementPattern -Element $el
      if ($null -eq $method -and $fallback) {
        $rect = Convert-Rect (Invoke-Safe { $el.Current.BoundingRectangle } $null)
        if ($null -eq $rect) { throw "Element has no invokable pattern and no bounding box for fallback click." }
        Click-At -X $rect.centerX -Y $rect.centerY -Button "left" -Count 1
        $method = "ClickFallback"
      }
      if ($null -eq $method) { throw "Element has no supported invokable pattern." }
      Write-JsonResult ([ordered]@{ ok = $true; action = "invoke"; elementId = $elementId; method = $method })
    }
    "set_value" {
      $elementId = [string](Get-Prop $inputObject "elementId" "")
      $value = [string](Get-Prop $inputObject "value" "")
      $fallback = [bool](Get-Prop $inputObject "fallbackType" $true)
      $restore = [bool](Get-Prop $inputObject "restoreClipboard" $true)
      $el = Resolve-Element $elementId $inputObject
      $method = Set-ElementValue -Element $el -Value $value
      if ($null -eq $method -and $fallback) {
        Focus-Element $el $inputObject
        [WindowsComputerUseNative]::Chord([System.UInt16[]]@(0x11, 0x41))
        Type-Text -Text $value -RestoreClipboard $restore
        $method = "FocusSelectAllTypeFallback"
      }
      if ($null -eq $method) { throw "Element has no ValuePattern and fallbackType is false." }
      $actual = Get-ValueText $el
      $readbackClock = [System.Diagnostics.Stopwatch]::StartNew()
      while ($null -ne $actual -and ($actual -replace "`r`n", "`n") -cne ($value -replace "`r`n", "`n") -and $readbackClock.ElapsedMilliseconds -lt 800) {
        Start-Sleep -Milliseconds 80
        $actual = Get-ValueText $el
      }
      if ($null -ne $actual -and ($actual -replace "`r`n", "`n") -cne ($value -replace "`r`n", "`n")) {
        throw "Input did not match the control's readback ($method; expected $($value.Length) characters, got $($actual.Length)). The value was not verified."
      }
      Write-JsonResult ([ordered]@{ ok = $true; action = "set_value"; elementId = $elementId; method = $method; length = $value.Length; verified = ($null -ne $actual) })
    }
    "activate_window" {
      if (-not (Has-WindowTarget $inputObject)) { throw "Provide windowTitle, processId, or nativeWindowHandle." }
      $el = Resolve-TargetWindow $inputObject
      Set-WindowForeground $el
      Write-JsonResult ([ordered]@{ ok = $true; action = "activate_window"; window = (Convert-ElementInfo -Element $el -Id "uia:active" -Depth 0) })
    }
    "wait" {
      $milliseconds = [int](Get-Prop $inputObject "milliseconds" 500)
      Start-Sleep -Milliseconds $milliseconds
      Write-JsonResult ([ordered]@{ ok = $true; action = "wait"; milliseconds = $milliseconds })
    }
    default {
      throw "Unknown action '$Action'."
    }
  }
} catch {
  Write-JsonResult ([ordered]@{
    ok = $false
    action = $Action
    error = $_.Exception.Message
    category = $_.CategoryInfo.Category.ToString()
    scriptStackTrace = $_.ScriptStackTrace
  })
  exit 1
}
