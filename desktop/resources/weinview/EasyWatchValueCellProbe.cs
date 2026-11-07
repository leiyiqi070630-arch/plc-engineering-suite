using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public sealed class EasyWatchValueCellProbe {
  readonly int pid; readonly long ticks; readonly string exe;
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint obj,ref Guid iid,out IAccessible a);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int obtained);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint owner);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr h,int show);
  [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr h,ref Point p);
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out Rect r);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,ExactSpelling=true,SetLastError=true)] static extern int GetClassNameW(IntPtr h,[Out] StringBuilder text,int count);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,ExactSpelling=true)] static extern uint MapVirtualKeyW(uint key,uint mapType);
  [DllImport("user32.dll",ExactSpelling=true)] static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll",ExactSpelling=true)] static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll",ExactSpelling=true)] static extern IntPtr GetAncestor(IntPtr h,uint flags);
  [DllImport("user32.dll",ExactSpelling=true)] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll",ExactSpelling=true)]
  [return:MarshalAs(UnmanagedType.Bool)] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll",ExactSpelling=true)] static extern int GetDlgCtrlID(IntPtr h);
  [DllImport("user32.dll",ExactSpelling=true)]
  [return:MarshalAs(UnmanagedType.Bool)] static extern bool GetWindowRect(IntPtr h,out Rect r);
  [UnmanagedFunctionPointer(CallingConvention.Winapi)]
  [return:MarshalAs(UnmanagedType.Bool)] delegate bool WriterEnumProc(IntPtr h,IntPtr state);
  [DllImport("user32.dll",ExactSpelling=true,SetLastError=true)]
  [return:MarshalAs(UnmanagedType.Bool)] static extern bool EnumWindows(WriterEnumProc callback,IntPtr state);
  [DllImport("user32.dll",ExactSpelling=true,SetLastError=true)]
  [return:MarshalAs(UnmanagedType.Bool)] static extern bool EnumChildWindows(IntPtr parent,WriterEnumProc callback,IntPtr state);
  [StructLayout(LayoutKind.Sequential)] struct WriterGuiThreadInfo {public uint size,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public Rect caretRect;}
  [DllImport("user32.dll",ExactSpelling=true,SetLastError=true)]
  [return:MarshalAs(UnmanagedType.Bool)] static extern bool GetGUIThreadInfo(uint thread,ref WriterGuiThreadInfo info);
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int l,t,r,b;}
  public EasyWatchValueCellProbe(int processId,long creationTicks,string executablePath) {pid=processId;ticks=creationTicks;exe=executablePath;}
  IntPtr Owned(long hwnd) {
   using(var p=Process.GetProcessById(pid)) {
    if(p.HasExited || p.StartTime.ToUniversalTime().Ticks!=ticks || !String.Equals(p.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("EasyWatch process identity changed.");
   }
   var h=new IntPtr(hwnd);uint owner;GetWindowThreadProcessId(h,out owner);
   if(owner!=pid || !IsWindowVisible(h) || !IsWindowEnabled(h))throw new InvalidOperationException("Owned visible enabled EasyWatch window required.");
   return h;
  }
  IAccessible Accessible(IntPtr h,int role) {
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;
   if(AccessibleObjectFromWindow(h,0xfffffffc,ref iid,out a)!=0 || a==null || Convert.ToInt32(a.get_accRole(0))!=role)throw new InvalidOperationException("Actual EasyWatch MSAA role differs.");
   return a;
  }
  static IAccessible[] Children(IAccessible a,int expected) {
   if(a.accChildCount!=expected)throw new InvalidOperationException("Actual EasyWatch MSAA child count differs.");
   var raw=new object[expected];int got;
   if(expected>0 && (AccessibleChildren(a,0,expected,raw,out got)<0 || got!=expected))throw new InvalidOperationException("Actual EasyWatch children incomplete.");
   var result=new IAccessible[expected];
   for(int i=0;i<expected;i++) {result[i]=raw[i] as IAccessible;if(result[i]==null)throw new InvalidOperationException("Actual EasyWatch child provider absent.");}
   return result;
  }
  IAccessible[] Rows(long hwnd,int expected) {
   if(expected<1 || expected>8)throw new ArgumentOutOfRangeException("expected");
   var rows=Children(Accessible(Owned(hwnd),24),expected);
   foreach(var row in rows)if(Convert.ToInt32(row.get_accRole(0))!=28 || row.accChildCount!=7)throw new InvalidOperationException("Actual seven-cell monitor row required.");
   return rows;
  }
  // Finite writable Local-HMI LB/bool actions. Posted messages are not proof of a changed runtime value.
  public sealed class WritableValueEvidence {
   public string action,exe_path,row_name,monitor_name,before_raw_value,editor_text,child_name,child_value,observed_utc,editor_class,editor_text_source,main_title;
   public object expected_value,before_value; public int process_pid,address,port,child_id,child_role,child_state,grid_pid,editor_pid,editor_id,editor_count,value_cell_role,value_cell_state,row_role,row_state;
   public long creation_utc_ticks,grid_hwnd,editor_hwnd,editor_parent_hwnd,focus_hwnd,observed_utc_ticks,main_hwnd,foreground_hwnd,active_hwnd;
   public string[] before_cells;
   public int[] value_cell_bounds,client_center,grid_client_rect,editor_bounds;
   public int[] modifier_keys;
   public short[] modifier_states;
   public uint[] messages;
   public long[] lparams;
   public object requested_value; public int? virtual_key;
   public uint? scan_code;
   public bool selection_posted,begin_edit_posted,editor_validated,commit_posted,editor_visible,editor_enabled,activation_requested,activated;
  }
  sealed class WritableTarget {public IntPtr Grid;public IAccessible ValueCell;public WritableValueEvidence Evidence;public string NumericFormat;}
  static string WriterClass(IntPtr hwnd) {
   var value=new StringBuilder(256);int count=GetClassNameW(hwnd,value,value.Capacity);
   if(count<=0 || count>=value.Capacity-1)throw new InvalidOperationException("Actual owned window class unreadable/truncated.");return value.ToString();
  }
  void AssertWriterNoModal() {
   bool modal=false;Exception error=null;
   WriterEnumProc callback=delegate(IntPtr hwnd,IntPtr ignored) {
    try {uint owner;GetWindowThreadProcessId(hwnd,out owner);if(owner==pid && IsWindowVisible(hwnd) && WriterClass(hwnd)=="#32770")modal=true;return true;}
    catch(Exception ex){error=ex;return false;}
   };
   bool complete=EnumWindows(callback,IntPtr.Zero);GC.KeepAlive(callback);
   if(error!=null)throw new InvalidOperationException("Owned writer modal inspection failed.",error);
   if(!complete || modal)throw new InvalidOperationException("Owned writer modal present or enumeration incomplete.");
  }
  void AssertWriterWindow(long hwnd) {var h=Owned(hwnd);if(IsIconic(h))throw new InvalidOperationException("Owned writer window must be restored.");AssertWriterNoModal();}
  static short[] WriterModifierStates() {var states=new short[3];int[] keys={0x10,0x11,0x12};for(int i=0;i<3;i++){states[i]=GetAsyncKeyState(keys[i]);if((states[i]&0x8000)!=0)throw new InvalidOperationException("Shift/Ctrl/Alt pressed; writer key not posted.");}return states;}
  static void AssertWriterModifiersNone() {WriterModifierStates();}
  long WriterFocus(IntPtr hwnd) {
   uint owner;uint thread=GetWindowThreadProcessId(hwnd,out owner);var info=new WriterGuiThreadInfo{size=(uint)Marshal.SizeOf(typeof(WriterGuiThreadInfo))};
   if(thread==0 || owner!=pid || !GetGUIThreadInfo(thread,ref info))throw new InvalidOperationException("Owned writer GUI-thread focus unavailable.");return info.focus.ToInt64();
  }
  void AssertWriterForeground(WritableTarget target,bool activateOnce) {
   var main=GetAncestor(target.Grid,2);if(main==IntPtr.Zero)throw new InvalidOperationException("Actual writable grid main ancestor absent.");AssertWriterWindow(main.ToInt64());
   string title=new NativeControls(pid,ticks,exe,1000).GetControlText(main.ToInt64(),128);
   if(!WriterClass(main).StartsWith("Afx:",StringComparison.Ordinal) || title!="PLC Engineering SuiteWritable - EasyWatch")throw new InvalidOperationException("Actual private file-loaded writable EasyWatch main required.");
   bool requested=false;
   if(GetForegroundWindow()!=main && activateOnce){requested=true;if(!SetForegroundWindow(main))throw new InvalidOperationException("Owned fresh EasyWatch foreground activation denied; no input.");new NativeControls(pid,ticks,exe,1000).GetControlText(main.ToInt64(),128);}
   if(GetForegroundWindow()!=main)throw new InvalidOperationException("Owned fresh EasyWatch main must be foreground.");
   uint owner;uint thread=GetWindowThreadProcessId(main,out owner);var info=new WriterGuiThreadInfo{size=(uint)Marshal.SizeOf(typeof(WriterGuiThreadInfo))};
   if(owner!=pid || thread==0 || !GetGUIThreadInfo(thread,ref info) || info.active!=main)throw new InvalidOperationException("Actual owned Watch GUI thread must activate its main.");
   target.Evidence.main_hwnd=main.ToInt64();target.Evidence.main_title=title;target.Evidence.foreground_hwnd=GetForegroundWindow().ToInt64();target.Evidence.active_hwnd=info.active.ToInt64();target.Evidence.activation_requested=requested;target.Evidence.activated=true;target.Evidence.focus_hwnd=info.focus.ToInt64();AssertWriterWindow(main.ToInt64());
  }
  static void AssertNumericText(string format,string text,double number) {
   if(String.IsNullOrEmpty(text) || text.Length>64 || Double.IsNaN(number) || Double.IsInfinity(number))throw new ArgumentException("Finite numeric text/value required.");
   if(format=="uint16") {int n;if(!Int32.TryParse(text,NumberStyles.None,CultureInfo.InvariantCulture,out n) || n<0 || n>65535 || n!=number || text!=n.ToString(CultureInfo.InvariantCulture))throw new ArgumentException("Exact unsigned16 text/value required.");}
   else if(format=="int32" || format=="uint32") {long n;long min=format=="int32"?-2147483648L:0L,max=format=="int32"?2147483647L:4294967295L;if(!Int64.TryParse(text,NumberStyles.AllowLeadingSign,CultureInfo.InvariantCulture,out n) || n<min || n>max || n!=number || text!=n.ToString(CultureInfo.InvariantCulture))throw new ArgumentException("Exact32-bit integer text/value required.");}
   else if(format=="float32") {float f;if(!Single.TryParse(text,NumberStyles.Float,CultureInfo.InvariantCulture,out f) || Single.IsNaN(f) || Single.IsInfinity(f) || (double)f!=number || (double)(float)number!=number)throw new ArgumentException("Displayed finite Single numeric equality required; binary precision is not verified.");}
   else throw new ArgumentException("Unknown numeric format.");
  }
  WritableTarget ReadWritableTarget(long gridHwnd,string name,int address,int port,bool expected,string numericFormat=null,string expectedText=null,double expectedNumber=0) {
   if(numericFormat!=null && numericFormat!="uint16" && numericFormat!="float32" && numericFormat!="int32" && numericFormat!="uint32")throw new ArgumentException("Finite numeric format required.");
   if(numericFormat!=null)AssertNumericText(numericFormat,expectedText,expectedNumber);
   if(address<0 || address>((numericFormat=="float32" || numericFormat=="int32" || numericFormat=="uint32")?8998:8999) || name!=(numericFormat==null?"PLC Engineering Suite_Writable_LB":"PLC Engineering Suite_Writable_LW")+address.ToString(CultureInfo.InvariantCulture))throw new ArgumentException("Exact writable LB0..8999 monitor name/address required.");
   if(port<1 || port>65535)throw new ArgumentOutOfRangeException("port");
   SetProcessDPIAware();AssertWriterWindow(gridHwnd);var h=Owned(gridHwnd);var row=Rows(gridHwnd,1)[0];
   if(row.get_accName(0)!="Row 1")throw new InvalidOperationException("Actual writable monitor must be the single Row 1.");
   var cells=Children(row,7);var values=new string[7];
   for(int i=0;i<7;i++){if(Convert.ToInt32(cells[i].get_accRole(0))!=29)throw new InvalidOperationException("Actual writable cell role differs.");values[i]=cells[i].get_accValue(0);if(values[i]==null || values[i].Length>512)throw new InvalidOperationException("Actual writable cell value absent/oversized.");}
   string[] metadata={name,"Connected","Local Host ( "+port.ToString(CultureInfo.InvariantCulture)+" )  : HMI",(numericFormat==null?"LB : ":"LW : ")+address.ToString(CultureInfo.InvariantCulture),numericFormat==null?"Bit":(numericFormat=="uint16"?"16-bit Unsigned":numericFormat=="int32"?"32-bit Signed":numericFormat=="uint32"?"32-bit Unsigned":"32-bit Float"),"500 ms"};
   for(int i=0;i<6;i++)if(values[i]!=metadata[i])throw new InvalidOperationException("Actual writable monitor metadata differs.");
   object prior=numericFormat==null?(object)expected:(object)expectedNumber;if(values[6]!=(numericFormat==null?(expected ? "True" : "False"):expectedText))throw new InvalidOperationException("Actual writable value differs from expected exact bool text.");
   string raw=row.get_accValue(0);if(raw!=String.Join(", ",values))throw new InvalidOperationException("Actual writable row raw value differs from seven cells.");
   var cell=cells[6];if((Convert.ToInt32(cell.get_accState(0))&0x18001)!=0)throw new InvalidOperationException("Actual writable Value cell unavailable.");
   int x,y,w,height;cell.accLocation(out x,out y,out w,out height,0);
   if(w<10 || height<10 || w>1600 || height>120)throw new InvalidOperationException("Actual writable Value cell geometry unavailable.");
   var center=new Point{x=x+w/2,y=y+height/2};Rect rect;
   if(!ScreenToClient(h,ref center) || !GetClientRect(h,out rect) || center.x<0 || center.y<0 || center.x>=rect.r || center.y>=rect.b || center.x>32767 || center.y>32767)throw new InvalidOperationException("Actual writable Value cell outside owned grid.");
   AssertWriterWindow(gridHwnd);var observed=DateTime.UtcNow;
   uint gridPid;GetWindowThreadProcessId(h,out gridPid);
   return new WritableTarget{Grid=h,ValueCell=cell,NumericFormat=numericFormat,Evidence=new WritableValueEvidence{process_pid=pid,creation_utc_ticks=ticks,exe_path=exe,grid_pid=(int)gridPid,grid_hwnd=gridHwnd,row_name="Row 1",monitor_name=name,address=address,port=port,expected_value=numericFormat==null?(object)expected:(object)expectedNumber,before_value=prior,before_cells=values,before_raw_value=raw,value_cell_role=Convert.ToInt32(cell.get_accRole(0)),value_cell_state=Convert.ToInt32(cell.get_accState(0)),row_role=Convert.ToInt32(row.get_accRole(0)),row_state=Convert.ToInt32(row.get_accState(0)),value_cell_bounds=new int[]{x,y,w,height},client_center=new int[]{center.x,center.y},grid_client_rect=new int[]{rect.l,rect.t,rect.r,rect.b},observed_utc=observed.ToString("o"),observed_utc_ticks=observed.Ticks}};
  }
  void AssertWriterFocusedTextChild(WritableTarget target) {
   if(target.ValueCell.accChildCount!=1)throw new InvalidOperationException("Actual writable Value exactly one text child required.");
   var raw=new object[1];int obtained;
   if(AccessibleChildren(target.ValueCell,0,1,raw,out obtained)<0 || obtained!=1 || !(raw[0] is int) || (int)raw[0]!=1)throw new InvalidOperationException("Actual writable VT_I4 text child1 required.");
   string name=target.ValueCell.get_accName(1),value=target.ValueCell.get_accValue(1);int role=Convert.ToInt32(target.ValueCell.get_accRole(1)),state=Convert.ToInt32(target.ValueCell.get_accState(1));
   if(name!="Row 1, Column 7" || value!=target.Evidence.before_cells[6] || role!=(target.NumericFormat==null?46:42) || (state&0x18041)!=0 || (state&4)==0)throw new InvalidOperationException("Actual writable child1 role/value/available-focused state differs.");
   target.Evidence.child_id=1;target.Evidence.child_role=role;target.Evidence.child_state=state;target.Evidence.child_name=name;target.Evidence.child_value=value;
  }
  public WritableValueEvidence SelectWritableValueCell(long gridHwnd,string name,int address,int port,bool expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="select_writable_value_cell";AssertWriterForeground(target,true);var center=target.Evidence.client_center;var lp=new IntPtr((center[1]<<16)|center[0]);AssertWriterWindow(gridHwnd);
   if(!PostMessageW(target.Grid,0x201,new UIntPtr(1),lp) || !PostMessageW(target.Grid,0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Owned writable Value-cell selection failed; no retry.");
   target.Evidence.messages=new uint[]{0x201,0x202};target.Evidence.lparams=new long[]{lp.ToInt64(),lp.ToInt64()};target.Evidence.selection_posted=true;return target.Evidence;
  }
  public WritableValueEvidence BeginWritableValueEdit(long gridHwnd,string name,int address,int port,bool expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="begin_writable_value_edit_F2";AssertWriterForeground(target,false);AssertWriterFocusedTextChild(target);target.Evidence.focus_hwnd=WriterFocus(target.Grid);if(target.Evidence.focus_hwnd!=gridHwnd)throw new InvalidOperationException("Actual owned thread focus must be the writable grid before F2.");target.Evidence.modifier_keys=new int[]{0x10,0x11,0x12};target.Evidence.modifier_states=WriterModifierStates();uint scan=MapVirtualKeyW(0x71,0);
   if(scan!=0x3C)throw new InvalidOperationException("Actual standard F2 scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWriterWindow(gridHwnd);AssertWriterModifiersNone();
   if(!PostMessageW(target.Grid,0x100,new UIntPtr(0x71),new IntPtr(down)) || !PostMessageW(target.Grid,0x101,new UIntPtr(0x71),new IntPtr(up)))throw new InvalidOperationException("Owned grid F2 posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x71;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.begin_edit_posted=true;return target.Evidence;
  }
  void AssertWritableEditor(WritableTarget target,long editHwnd,bool requested,string requestedText=null,double requestedNumber=0) {
   if(target.NumericFormat!=null)AssertNumericText(target.NumericFormat,requestedText,requestedNumber);
   AssertWriterWindow(editHwnd);AssertWriterWindow(target.Evidence.grid_hwnd);AssertWriterForeground(target,false);var edit=Owned(editHwnd);
   if(WriterClass(edit)!="Edit" || GetDlgCtrlID(edit)!=1 || GetParent(edit)!=target.Grid)throw new InvalidOperationException("Actual writer editor must be Edit1/direct grid child.");
   int editors=0;Exception error=null;
   WriterEnumProc callback=delegate(IntPtr hwnd,IntPtr ignored) {
    try{if(IsWindowVisible(hwnd) && IsWindowEnabled(hwnd) && WriterClass(hwnd)=="Edit"){uint owner;GetWindowThreadProcessId(hwnd,out owner);if(owner!=pid || hwnd!=edit || GetDlgCtrlID(hwnd)!=1 || GetParent(hwnd)!=target.Grid)throw new InvalidOperationException("Actual writable editor ambiguous.");editors++;}return true;}
    catch(Exception ex){error=ex;return false;}
   };
   EnumChildWindows(target.Grid,callback,IntPtr.Zero);GC.KeepAlive(callback);
   if(error!=null)throw new InvalidOperationException("Actual writable editor enumeration failed.",error);
   if(editors!=1)throw new InvalidOperationException("Exactly one actual visible enabled writable editor required.");
   Rect bounds;if(!GetWindowRect(edit,out bounds))throw new InvalidOperationException("Actual writable editor bounds unavailable.");var cell=target.Evidence.value_cell_bounds;
   if(bounds.r<=bounds.l || bounds.b<=bounds.t || bounds.l<cell[0] || bounds.t<cell[1] || bounds.r>cell[0]+cell[2] || bounds.b>cell[1]+cell[3])throw new InvalidOperationException("Actual writable editor must be contained in actual Value cell.");
   string text=new NativeControls(pid,ticks,exe,1000).GetControlText(editHwnd,target.NumericFormat==null?16:64);
   if(text!=(target.NumericFormat==null?(requested ? "True" : "False"):requestedText))throw new InvalidOperationException("Actual writable editor text differs from requested exact bool.");
   long focus=WriterFocus(edit);if(focus!=editHwnd)throw new InvalidOperationException("Actual owned thread focus must be writable editor.");AssertWriterModifiersNone();AssertWriterWindow(editHwnd);AssertWriterWindow(target.Evidence.grid_hwnd);
   uint editorPid;GetWindowThreadProcessId(edit,out editorPid);
   target.Evidence.editor_hwnd=editHwnd;target.Evidence.editor_parent_hwnd=GetParent(edit).ToInt64();target.Evidence.focus_hwnd=focus;target.Evidence.editor_bounds=new int[]{bounds.l,bounds.t,bounds.r-bounds.l,bounds.b-bounds.t};target.Evidence.editor_text=text;target.Evidence.requested_value=target.NumericFormat==null?(object)requested:(object)requestedNumber;target.Evidence.editor_validated=true;target.Evidence.editor_id=GetDlgCtrlID(edit);target.Evidence.editor_class=WriterClass(edit);target.Evidence.editor_visible=IsWindowVisible(edit);target.Evidence.editor_enabled=IsWindowEnabled(edit);target.Evidence.editor_count=editors;target.Evidence.editor_pid=(int)editorPid;target.Evidence.editor_text_source="NativeControls.GetControlText/WM_GETTEXT";target.Evidence.modifier_keys=new int[]{0x10,0x11,0x12};target.Evidence.modifier_states=WriterModifierStates();
  }
  public WritableValueEvidence ValidateWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,bool expected,bool requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="validate_writable_value_editor";AssertWritableEditor(target,editHwnd,requested);return target.Evidence;
  }
  public WritableValueEvidence CommitWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,bool expected,bool requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="commit_writable_value_editor_Enter";AssertWritableEditor(target,editHwnd,requested);uint scan=MapVirtualKeyW(0x0D,0);
   if(scan!=0x1C)throw new InvalidOperationException("Actual standard Enter scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWritableEditor(target,editHwnd,requested);AssertWriterModifiersNone();var edit=Owned(editHwnd);
   if(!PostMessageW(edit,0x100,new UIntPtr(0x0D),new IntPtr(down)) || !PostMessageW(edit,0x101,new UIntPtr(0x0D),new IntPtr(up)))throw new InvalidOperationException("Owned writable editor Enter posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x0D;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.commit_posted=true;return target.Evidence;
  }

  public WritableValueEvidence SelectWritableValueCell(long gridHwnd,string name,int address,int port,string numericFormat,string expectedText,double expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,false,numericFormat,expectedText,expected);target.Evidence.action="select_writable_value_cell";AssertWriterForeground(target,true);var center=target.Evidence.client_center;var lp=new IntPtr((center[1]<<16)|center[0]);AssertWriterWindow(gridHwnd);
   if(!PostMessageW(target.Grid,0x201,new UIntPtr(1),lp) || !PostMessageW(target.Grid,0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Owned writable Value-cell selection failed; no retry.");
   target.Evidence.messages=new uint[]{0x201,0x202};target.Evidence.lparams=new long[]{lp.ToInt64(),lp.ToInt64()};target.Evidence.selection_posted=true;return target.Evidence;
  }
  public WritableValueEvidence BeginWritableValueEdit(long gridHwnd,string name,int address,int port,string numericFormat,string expectedText,double expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,false,numericFormat,expectedText,expected);target.Evidence.action="begin_writable_value_edit_F2";AssertWriterForeground(target,false);AssertWriterFocusedTextChild(target);target.Evidence.focus_hwnd=WriterFocus(target.Grid);if(target.Evidence.focus_hwnd!=gridHwnd)throw new InvalidOperationException("Actual owned thread focus must be the writable grid before F2.");target.Evidence.modifier_keys=new int[]{0x10,0x11,0x12};target.Evidence.modifier_states=WriterModifierStates();uint scan=MapVirtualKeyW(0x71,0);
   if(scan!=0x3C)throw new InvalidOperationException("Actual standard F2 scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWriterWindow(gridHwnd);AssertWriterModifiersNone();
   if(!PostMessageW(target.Grid,0x100,new UIntPtr(0x71),new IntPtr(down)) || !PostMessageW(target.Grid,0x101,new UIntPtr(0x71),new IntPtr(up)))throw new InvalidOperationException("Owned grid F2 posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x71;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.begin_edit_posted=true;return target.Evidence;
  }
  public WritableValueEvidence ValidateWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,string numericFormat,string expectedText,double expected,string requestedText,double requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,false,numericFormat,expectedText,expected);target.Evidence.action="validate_writable_value_editor";AssertWritableEditor(target,editHwnd,false,requestedText,requested);return target.Evidence;
  }
  public WritableValueEvidence CommitWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,string numericFormat,string expectedText,double expected,string requestedText,double requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,false,numericFormat,expectedText,expected);target.Evidence.action="commit_writable_value_editor_Enter";AssertWritableEditor(target,editHwnd,false,requestedText,requested);uint scan=MapVirtualKeyW(0x0D,0);
   if(scan!=0x1C)throw new InvalidOperationException("Actual standard Enter scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWritableEditor(target,editHwnd,false,requestedText,requested);AssertWriterModifiersNone();var edit=Owned(editHwnd);
   if(!PostMessageW(edit,0x100,new UIntPtr(0x0D),new IntPtr(down)) || !PostMessageW(edit,0x101,new UIntPtr(0x0D),new IntPtr(up)))throw new InvalidOperationException("Owned writable editor Enter posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x0D;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.commit_posted=true;return target.Evidence;
  }
 }
}
