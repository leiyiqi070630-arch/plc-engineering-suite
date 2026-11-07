using System;
using System.Runtime.InteropServices;
using Accessibility;

namespace PLCCode.Weinview {
 public sealed class NumericTagSettingsControls {
  readonly NativeControls native;
  [StructLayout(LayoutKind.Sequential)] struct Rect { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd,uint command);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
  [StructLayout(LayoutKind.Sequential)] struct GuiState { public uint Size,Flags; public IntPtr Active,Focus,Capture,MenuOwner,MoveSize,Caret; public Rect CaretRect; }
  [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiState state);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd, uint id, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible accessible, int start, int count, [Out, MarshalAs(UnmanagedType.LPArray, SizeParamIndex=2)] object[] children, out int got);

  public NumericTagSettingsControls(NativeControls native) { if(native==null) throw new ArgumentNullException("native"); this.native=native; }

  uint ActivatePropertyDialog(long numericDialog) {
   WindowInfo dialog=null;
   foreach(var window in native.EnumTopWindows()) if(window.Hwnd==numericDialog) dialog=window;
   if(dialog==null || dialog.Class!="#32770" || (dialog.Title!="数值的属性" && dialog.Title!="新增 数值" && dialog.Title!="位状态切换开关/位状态指示灯的属性" && dialog.Title!="位状态指示灯/位状态切换开关的属性" && dialog.Title!="新增 位状态切换开关/位状态指示灯") || !dialog.Visible || !dialog.Enabled) throw new InvalidOperationException("Exact native numeric or bit dialog required");
   uint dialogPid, foregroundPid;
   GetWindowThreadProcessId(new IntPtr(numericDialog),out dialogPid);
   if(dialogPid==0) throw new InvalidOperationException("Native numeric dialog process unavailable");
   if(GetForegroundWindow()!=new IntPtr(numericDialog) && !SetForegroundWindow(new IntPtr(numericDialog))) throw new InvalidOperationException("Native numeric dialog foreground activation refused");
   var foregroundDeadline=DateTime.UtcNow.AddSeconds(1);
   do {
    var foreground=GetForegroundWindow();
    GetWindowThreadProcessId(foreground,out foregroundPid);
    if(foreground==new IntPtr(numericDialog) && foregroundPid==dialogPid) break;
    System.Threading.Thread.Sleep(50);
   } while(DateTime.UtcNow<foregroundDeadline);
   var verifiedForeground=GetForegroundWindow();
   GetWindowThreadProcessId(verifiedForeground,out foregroundPid);
   if(verifiedForeground!=new IntPtr(numericDialog) || foregroundPid!=dialogPid) throw new InvalidOperationException("Native numeric dialog must own foreground");
   return dialogPid;
  }

  // Resume the same parent after read-only Address cancellation. No page change
  // or replayed click: only restore keyboard focus to its observed tab control.
  public void RestorePropertyFocus(long numericDialog,long closedAddressDialog) {
   foreach(var window in native.EnumTopWindows()) if(window.Hwnd==closedAddressDialog) throw new InvalidOperationException("Native Address read must close before restoring property focus");
   uint dialogPid=ActivatePropertyDialog(numericDialog);
   var tab=native.FindUniqueControlWithoutLabel(numericDialog,12320,"SysTabControl32");
   uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(numericDialog),out owner);
   if(thread==0 || owner!=dialogPid) throw new InvalidOperationException("Owned numeric property GUI thread unavailable");
   var state=new GuiState();state.Size=(uint)Marshal.SizeOf(typeof(GuiState));
   if(!GetGUIThreadInfo(thread,ref state)) throw new InvalidOperationException("Owned numeric property focus unavailable");
   if(state.Active==new IntPtr(numericDialog) && state.Focus==new IntPtr(tab.Hwnd)) return;
   if(!PostMessageW(new IntPtr(numericDialog),0x28,new UIntPtr(unchecked((ulong)tab.Hwnd)),new IntPtr(1))) throw new InvalidOperationException("Native numeric property focus dispatch failed");
   var deadline=DateTime.UtcNow.AddSeconds(1);
   do {
    state=new GuiState();state.Size=(uint)Marshal.SizeOf(typeof(GuiState));
    if(!GetGUIThreadInfo(thread,ref state)) throw new InvalidOperationException("Owned numeric property focus unavailable");
    if(GetForegroundWindow()==new IntPtr(numericDialog) && state.Active==new IntPtr(numericDialog) && state.Focus==new IntPtr(tab.Hwnd)) return;
    System.Threading.Thread.Sleep(20);
   } while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Native numeric property focus did not return after Address cancellation");
  }

  public long OpenAddress(long numericDialog,string bridgePath) {
   uint dialogPid=ActivatePropertyDialog(numericDialog);
   long main=0;foreach(var window in native.EnumTopWindows())if(window.Class=="EasyBuilderPro"&&window.Visible){if(main!=0)throw new InvalidOperationException("Owned editor is ambiguous");main=window.Hwnd;}
   if(main==0)throw new InvalidOperationException("Owned editor unavailable");
   native.InvokeQtElement(main,bridgePath,"address-open:"+numericDialog);
   long address=0;
   var deadline=DateTime.UtcNow.AddSeconds(6);
   do {
    address=0;
    foreach(var window in native.EnumTopWindows()) if(window.Class=="#32770" && window.Title=="地址" && window.Visible && window.Enabled && window.Pid==(int)dialogPid && GetWindow(new IntPtr(window.Hwnd),4).ToInt64()==numericDialog) { if(address!=0) throw new InvalidOperationException("Native Address dialog ambiguous"); address=window.Hwnd; }
    if(address!=0) break;
    System.Threading.Thread.Sleep(50);
   } while(DateTime.UtcNow<deadline);
   if(address==0) throw new InvalidOperationException("Native Address dialog did not open");
   return address;
  }
 }
}
