using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public sealed class EasyWatchValuesControls {
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
  public sealed class Row { public string Name; public string Value; public string[] Cells; public int Role; public int State; }
  // Only the pinned EasyWatch 6.10.02.421 local, 500ms document shape.
  // Complete bytes match native readonly 1/4/7/8 and writable 1/6 specimens.
  // Writable configurations retain the existing user-register bounds.
  public static byte[] ReadonlyConfiguration(int port,int[] addresses,string[] formats) {
   return LocalConfiguration(port,addresses,formats,false);
  }
  public static byte[] WritableConfiguration(int port,int[] addresses,string[] formats) {
   return LocalConfiguration(port,addresses,formats,true);
  }
  static byte[] LocalConfiguration(int port,int[] addresses,string[] formats,bool writable) {
   if(port<1||port>65535||addresses==null||formats==null||addresses.Length<1||addresses.Length>8||addresses.Length!=formats.Length)throw new ArgumentException("Finite readonly local monitor configuration required.");
   var seen=new HashSet<string>(StringComparer.Ordinal);
   for(int i=0;i<addresses.Length;i++) {
    int n=addresses[i];string f=formats[i];
    if(n<0||n>9999||!seen.Add((f=="bool"?"LB:":"LW:")+n.ToString(CultureInfo.InvariantCulture))||!(f=="bool"||f=="int16"||f=="uint16"||f=="float32"||f=="int32"||f=="uint32")||
       (f=="bool"&&n>8999&&n!=9043)||(f=="uint16"&&n>8999)||(f=="float32"&&n>8998)||((f=="int32"||f=="uint32")&&n>9998)||
       (writable&&(n>8999||((f=="float32"||f=="int32"||f=="uint32")&&n>8998))))throw new ArgumentException("Existing local monitor address, format and write bounds required.");
   }
   using(var stream=new MemoryStream())using(var writer=new BinaryWriter(stream)) {
    var a=new ReadonlyArchive(writer);
    a.Class("CEasyWatchDoc",false);
    a.Class("CTargetHMIManager",false);a.Word(1);
    a.Class("CTargetHMI",true);writer.Write(new byte[]{127,0,0,1});a.Word(port);
    a.Class("CAddressPageManager",false);a.Word(1);
    a.Class("CAddressPage",true);a.Text("New Page");
    a.Class("CWatchItemManager",false);a.Word(addresses.Length);
    for(int i=0;i<addresses.Length;i++) {
     int n=addresses[i];string f=formats[i];bool bit=f=="bool";
     int code=f=="uint16"?6:f=="int16"?7:f=="uint32"?8:f=="int32"?9:f=="float32"?10:0;
     a.Class("CMonitorItem",true);
     a.Class("CAddressValue",false);writer.Write((byte)(writable?0:1));
     a.Class("CAddressInfo",false);writer.Write((byte)255);writer.Write((byte)0);a.Dword(bit?0:8);writer.Write((byte)0);
     a.Text(n.ToString(CultureInfo.InvariantCulture));a.Dword(bit?n/16:n);
     a.Class(bit?"CAddressType_Bit":"CAddressType_Numeric",true);
     a.Class("CAddressType",false);a.Dword(code);if(bit)writer.Write((byte)(n%16));
     a.Class("CLocation_None",true);a.Class("CDeviceLocation",false);
     a.Class("CUpdateCycle",false);a.Class("CCycleItem",false);a.Dword(500);a.Dword(0);
     a.Class("CWatchBaseItem",false);
     a.Text((writable?"PLC Engineering Suite_Writable_":"PLC Engineering Suite_Readonly_")+(bit?"LB":"LW")+n.ToString(CultureInfo.InvariantCulture));
     a.Text("Local Host ( "+port.ToString(CultureInfo.InvariantCulture)+" ) ");a.Text("New Page");
    }
    writer.Flush();return stream.ToArray();
   }
  }
  sealed class ReadonlyArchive {
   readonly BinaryWriter writer;readonly Dictionary<string,int> classes=new Dictionary<string,int>(StringComparer.Ordinal);int next=1;
   public ReadonlyArchive(BinaryWriter w){writer=w;}
   public void Word(int n){writer.Write((ushort)n);}
   public void Dword(int n){writer.Write((uint)n);}
   public void Class(string name,bool instance) {
    int tag;
    if(classes.TryGetValue(name,out tag))Word(0x8000|tag);
    else {classes.Add(name,next++);var bytes=Encoding.ASCII.GetBytes(name);Word(0xffff);Word(1);Word(bytes.Length);writer.Write(bytes);}
    if(instance)next++;
   }
   public void Text(string s) {
    if(s.Length>=255)throw new InvalidOperationException("Bounded native configuration string required.");
    writer.Write(new byte[]{255,254,255});writer.Write((byte)s.Length);writer.Write(Encoding.Unicode.GetBytes(s));
   }
  }
  public EasyWatchValuesControls(int processId,long creationTicks,string executablePath) {pid=processId;ticks=creationTicks;exe=executablePath;}
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
  public Row[] ReadRows(long hwnd,int expected) {
   var rows=Rows(hwnd,expected);var result=new List<Row>();
   foreach(var row in rows) {
    var cells=Children(row,7);var values=new string[7];
    for(int i=0;i<7;i++) {
     if(Convert.ToInt32(cells[i].get_accRole(0))!=29)throw new InvalidOperationException("Actual monitor cell role differs.");
     values[i]=cells[i].get_accValue(0);
     if(values[i]==null || values[i].Length>512)throw new InvalidOperationException("Actual monitor cell value absent or oversized.");
    }
    result.Add(new Row{Name=row.get_accName(0),Value=row.get_accValue(0),Cells=values,Role=28,State=Convert.ToInt32(row.get_accState(0))});
   }
   Owned(hwnd);return result.ToArray();
  }
  public void Restore(long hwnd) {var h=Owned(hwnd);if(IsIconic(h)&&!ShowWindowAsync(h,9))throw new InvalidOperationException("Owned EasyWatch restore failed.");}
  public string SelectNameCell(long hwnd,int expected,string exactName) {
   SetProcessDPIAware();var h=Owned(hwnd);IAccessible selected=null;
   foreach(var row in Rows(hwnd,expected)) {
    var cell=Children(row,7)[0];
    if(Convert.ToInt32(cell.get_accRole(0))!=29)throw new InvalidOperationException("Actual name cell role differs.");
    if(cell.get_accValue(0)==exactName){if(selected!=null)throw new InvalidOperationException("Ambiguous exact monitor name.");selected=cell;}
   }
   if(selected==null)throw new InvalidOperationException("Exact monitor name absent.");
   int x,y,w,ht;selected.accLocation(out x,out y,out w,out ht,0);
   if(w<20 || ht<10 || w>1600 || ht>120)throw new InvalidOperationException("Actual name cell bounds unavailable.");
   var p=new Point{x=x+w/2,y=y+ht/2};Rect r;
   if(!ScreenToClient(h,ref p)||!GetClientRect(h,out r)||p.x<0||p.y<0||p.x>=r.r||p.y>=r.b||p.x>32767||p.y>32767)throw new InvalidOperationException("Actual name cell outside owned grid.");
   var lp=new IntPtr((p.y<<16)|p.x);Owned(hwnd);
   if(!PostMessageW(h,0x201,new UIntPtr(1),lp)||!PostMessageW(h,0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Owned name-cell selection failed.");
   return "MSAA name-cell bounds "+x+","+y+","+w+","+ht+"; client "+p.x+","+p.y;
  }
  public void Command(long hwnd,uint command) {
   if(command!=0x8059 && command!=0x805A)throw new InvalidOperationException("Unreviewed EasyWatch command.");
   if(!PostMessageW(Owned(hwnd),0x111,new UIntPtr(command),IntPtr.Zero))throw new InvalidOperationException("Owned EasyWatch command failed.");
  }
  public void Close(long hwnd) {if(!PostMessageW(Owned(hwnd),0x10,UIntPtr.Zero,IntPtr.Zero))throw new InvalidOperationException("Owned EasyWatch normal close failed.");}

  // Finite writable Local-HMI LW/int16 actions. Posted messages are not proof of a changed runtime value.
  public sealed class WritableValueEvidence {
   public string action,exe_path,row_name,monitor_name,before_raw_value,editor_text,child_name,child_value,observed_utc,editor_class,editor_text_source,main_title;
   public int process_pid,address,port,expected_value,before_value,child_id,child_role,child_state,grid_pid,editor_pid,editor_id,editor_count,value_cell_role,value_cell_state,row_role,row_state;
   public long creation_utc_ticks,grid_hwnd,editor_hwnd,editor_parent_hwnd,focus_hwnd,observed_utc_ticks,main_hwnd,foreground_hwnd,active_hwnd;
   public string[] before_cells;
   public int[] value_cell_bounds,client_center,grid_client_rect,editor_bounds;
   public int[] modifier_keys;
   public short[] modifier_states;
   public uint[] messages;
   public long[] lparams;
   public int? requested_value,virtual_key;
   public uint? scan_code;
   public bool selection_posted,begin_edit_posted,editor_validated,commit_posted,editor_visible,editor_enabled,activation_requested,activated;
  }
  sealed class WritableTarget {public IntPtr Grid;public IAccessible ValueCell;public WritableValueEvidence Evidence;}
  static void AssertInt16(int value,string name) {if(value<Int16.MinValue || value>Int16.MaxValue)throw new ArgumentOutOfRangeException(name,"Signed int16 required.");}
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
  WritableTarget ReadWritableTarget(long gridHwnd,string name,int address,int port,int expected) {
   if(address<0 || address>8999 || name!="PLC Engineering Suite_Writable_LW"+address.ToString(CultureInfo.InvariantCulture))throw new ArgumentException("Exact writable LW0..8999 monitor name/address required.");
   if(port<1 || port>65535)throw new ArgumentOutOfRangeException("port");AssertInt16(expected,"expected");
   SetProcessDPIAware();AssertWriterWindow(gridHwnd);var h=Owned(gridHwnd);var row=Rows(gridHwnd,1)[0];
   if(row.get_accName(0)!="Row 1")throw new InvalidOperationException("Actual writable monitor must be the single Row 1.");
   var cells=Children(row,7);var values=new string[7];
   for(int i=0;i<7;i++){if(Convert.ToInt32(cells[i].get_accRole(0))!=29)throw new InvalidOperationException("Actual writable cell role differs.");values[i]=cells[i].get_accValue(0);if(values[i]==null || values[i].Length>512)throw new InvalidOperationException("Actual writable cell value absent/oversized.");}
   string[] metadata={name,"Connected","Local Host ( "+port.ToString(CultureInfo.InvariantCulture)+" )  : HMI","LW : "+address.ToString(CultureInfo.InvariantCulture),"16-bit Signed","500 ms"};
   for(int i=0;i<6;i++)if(values[i]!=metadata[i])throw new InvalidOperationException("Actual writable monitor metadata differs.");
   short prior;if(!Int16.TryParse(values[6],NumberStyles.AllowLeadingSign,CultureInfo.InvariantCulture,out prior) || prior!=expected)throw new InvalidOperationException("Actual writable value differs from expected signed int16.");
   string raw=row.get_accValue(0);if(raw!=String.Join(", ",values))throw new InvalidOperationException("Actual writable row raw value differs from seven cells.");
   var cell=cells[6];if((Convert.ToInt32(cell.get_accState(0))&0x18001)!=0)throw new InvalidOperationException("Actual writable Value cell unavailable.");
   int x,y,w,height;cell.accLocation(out x,out y,out w,out height,0);
   if(w<10 || height<10 || w>1600 || height>120)throw new InvalidOperationException("Actual writable Value cell geometry unavailable.");
   var center=new Point{x=x+w/2,y=y+height/2};Rect rect;
   if(!ScreenToClient(h,ref center) || !GetClientRect(h,out rect) || center.x<0 || center.y<0 || center.x>=rect.r || center.y>=rect.b || center.x>32767 || center.y>32767)throw new InvalidOperationException("Actual writable Value cell outside owned grid.");
   AssertWriterWindow(gridHwnd);var observed=DateTime.UtcNow;
   uint gridPid;GetWindowThreadProcessId(h,out gridPid);
   return new WritableTarget{Grid=h,ValueCell=cell,Evidence=new WritableValueEvidence{process_pid=pid,creation_utc_ticks=ticks,exe_path=exe,grid_pid=(int)gridPid,grid_hwnd=gridHwnd,row_name="Row 1",monitor_name=name,address=address,port=port,expected_value=expected,before_value=prior,before_cells=values,before_raw_value=raw,value_cell_role=Convert.ToInt32(cell.get_accRole(0)),value_cell_state=Convert.ToInt32(cell.get_accState(0)),row_role=Convert.ToInt32(row.get_accRole(0)),row_state=Convert.ToInt32(row.get_accState(0)),value_cell_bounds=new int[]{x,y,w,height},client_center=new int[]{center.x,center.y},grid_client_rect=new int[]{rect.l,rect.t,rect.r,rect.b},observed_utc=observed.ToString("o"),observed_utc_ticks=observed.Ticks}};
  }
  void AssertWriterFocusedTextChild(WritableTarget target) {
   if(target.ValueCell.accChildCount!=1)throw new InvalidOperationException("Actual writable Value exactly one text child required.");
   var raw=new object[1];int obtained;
   if(AccessibleChildren(target.ValueCell,0,1,raw,out obtained)<0 || obtained!=1 || !(raw[0] is int) || (int)raw[0]!=1)throw new InvalidOperationException("Actual writable VT_I4 text child1 required.");
   string name=target.ValueCell.get_accName(1),value=target.ValueCell.get_accValue(1);int role=Convert.ToInt32(target.ValueCell.get_accRole(1)),state=Convert.ToInt32(target.ValueCell.get_accState(1));
   if(name!="Row 1, Column 7" || value!=target.Evidence.before_cells[6] || role!=42 || (state&0x18041)!=0 || (state&4)==0)throw new InvalidOperationException("Actual writable child1 role/value/available-focused state differs.");
   target.Evidence.child_id=1;target.Evidence.child_role=role;target.Evidence.child_state=state;target.Evidence.child_name=name;target.Evidence.child_value=value;
  }
  public WritableValueEvidence SelectWritableValueCell(long gridHwnd,string name,int address,int port,int expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="select_writable_value_cell";AssertWriterForeground(target,true);var center=target.Evidence.client_center;var lp=new IntPtr((center[1]<<16)|center[0]);AssertWriterWindow(gridHwnd);
   if(!PostMessageW(target.Grid,0x201,new UIntPtr(1),lp) || !PostMessageW(target.Grid,0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Owned writable Value-cell selection failed; no retry.");
   target.Evidence.messages=new uint[]{0x201,0x202};target.Evidence.lparams=new long[]{lp.ToInt64(),lp.ToInt64()};target.Evidence.selection_posted=true;return target.Evidence;
  }
  public WritableValueEvidence BeginWritableValueEdit(long gridHwnd,string name,int address,int port,int expected) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="begin_writable_value_edit_F2";AssertWriterForeground(target,false);AssertWriterFocusedTextChild(target);target.Evidence.focus_hwnd=WriterFocus(target.Grid);if(target.Evidence.focus_hwnd!=gridHwnd)throw new InvalidOperationException("Actual owned thread focus must be the writable grid before F2.");target.Evidence.modifier_keys=new int[]{0x10,0x11,0x12};target.Evidence.modifier_states=WriterModifierStates();uint scan=MapVirtualKeyW(0x71,0);
   if(scan!=0x3C)throw new InvalidOperationException("Actual standard F2 scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWriterWindow(gridHwnd);AssertWriterModifiersNone();
   if(!PostMessageW(target.Grid,0x100,new UIntPtr(0x71),new IntPtr(down)) || !PostMessageW(target.Grid,0x101,new UIntPtr(0x71),new IntPtr(up)))throw new InvalidOperationException("Owned grid F2 posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x71;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.begin_edit_posted=true;return target.Evidence;
  }
  void AssertWritableEditor(WritableTarget target,long editHwnd,int requested) {
   AssertInt16(requested,"requested");AssertWriterWindow(editHwnd);AssertWriterWindow(target.Evidence.grid_hwnd);AssertWriterForeground(target,false);var edit=Owned(editHwnd);
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
   string text=new NativeControls(pid,ticks,exe,1000).GetControlText(editHwnd,16);
   if(text!=requested.ToString(CultureInfo.InvariantCulture))throw new InvalidOperationException("Actual writable editor text differs from requested signed int16.");
   long focus=WriterFocus(edit);if(focus!=editHwnd)throw new InvalidOperationException("Actual owned thread focus must be writable editor.");AssertWriterModifiersNone();AssertWriterWindow(editHwnd);AssertWriterWindow(target.Evidence.grid_hwnd);
   uint editorPid;GetWindowThreadProcessId(edit,out editorPid);
   target.Evidence.editor_hwnd=editHwnd;target.Evidence.editor_parent_hwnd=GetParent(edit).ToInt64();target.Evidence.focus_hwnd=focus;target.Evidence.editor_bounds=new int[]{bounds.l,bounds.t,bounds.r-bounds.l,bounds.b-bounds.t};target.Evidence.editor_text=text;target.Evidence.requested_value=requested;target.Evidence.editor_validated=true;target.Evidence.editor_id=GetDlgCtrlID(edit);target.Evidence.editor_class=WriterClass(edit);target.Evidence.editor_visible=IsWindowVisible(edit);target.Evidence.editor_enabled=IsWindowEnabled(edit);target.Evidence.editor_count=editors;target.Evidence.editor_pid=(int)editorPid;target.Evidence.editor_text_source="NativeControls.GetControlText/WM_GETTEXT";target.Evidence.modifier_keys=new int[]{0x10,0x11,0x12};target.Evidence.modifier_states=WriterModifierStates();
  }
  public WritableValueEvidence ValidateWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,int expected,int requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="validate_writable_value_editor";AssertWritableEditor(target,editHwnd,requested);return target.Evidence;
  }
  public WritableValueEvidence CommitWritableValueEditor(long gridHwnd,long editHwnd,string name,int address,int port,int expected,int requested) {
   var target=ReadWritableTarget(gridHwnd,name,address,port,expected);target.Evidence.action="commit_writable_value_editor_Enter";AssertWritableEditor(target,editHwnd,requested);uint scan=MapVirtualKeyW(0x0D,0);
   if(scan!=0x1C)throw new InvalidOperationException("Actual standard Enter scan code differs.");int down=unchecked((int)(1u|(scan<<16))),up=unchecked((int)(1u|(scan<<16)|0xC0000000u));AssertWritableEditor(target,editHwnd,requested);AssertWriterModifiersNone();var edit=Owned(editHwnd);
   if(!PostMessageW(edit,0x100,new UIntPtr(0x0D),new IntPtr(down)) || !PostMessageW(edit,0x101,new UIntPtr(0x0D),new IntPtr(up)))throw new InvalidOperationException("Owned writable editor Enter posting failed; no retry.");
   target.Evidence.messages=new uint[]{0x100,0x101};target.Evidence.virtual_key=0x0D;target.Evidence.scan_code=scan;target.Evidence.lparams=new long[]{down,up};target.Evidence.commit_posted=true;return target.Evidence;
  }
 }
}

// Existing Object table only: no monitor creation; value edits stay in the owned Diagnoser.
namespace PLC Engineering Suite.Weinview {
 public static class CmtObjectValuesControls {
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint obj,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible a);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int obtained);
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint owner);
  [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr hwnd);
  [DllImport("user32.dll")]static extern uint MapVirtualKeyW(uint code,uint mapType);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr hwnd,ref EditPoint point);
  [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr hwnd,out Bounds rect);
  [DllImport("user32.dll",SetLastError=true)]static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wp,IntPtr lp);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,ExactSpelling=true,SetLastError=true)]static extern bool SystemParametersInfoW(uint action,uint parameter,out uint value,uint update);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,ExactSpelling=true,SetLastError=true)]static extern int GetLocaleInfoEx(string localeName,uint localeType,[Out]StringBuilder value,int capacity);
  [StructLayout(LayoutKind.Sequential)]struct Bounds {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)]struct EditPoint {public int x,y;}
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out Bounds r);
  static string UserDecimalSeparator(){
   var value=new StringBuilder(16);int length=GetLocaleInfoEx(null,0x0000000Eu,value,value.Capacity);
   if(length!=2||value.Length!=1||Char.IsControl(value[0]))throw new InvalidOperationException("Windows user decimal separator must be one non-control character.");
   return value.ToString();
  }
  sealed class TableMatch {public IAccessible Table;public string Path;public object[] Children;public int[] Bounds;public int[][] HeaderBounds;}
  sealed class ObjectTableChangedException : InvalidOperationException {public ObjectTableChangedException():base("Object table changed during read."){}}
  static object[] Fetch(IAccessible a,int count){var children=new object[count];int obtained=0;if(count>0&&(AccessibleChildren(a,0,count,children,out obtained)<0||obtained!=count))throw new InvalidOperationException("Owned MSAA discovery children incomplete.");return children;}
  static TableMatch Discover(IAccessible root,int[] diagnoserBounds){
   var level=new List<Tuple<IAccessible,string>>{Tuple.Create(root,"client")};int visited=0;
   for(int depth=0;level.Count>0&&depth<=12;depth++){
    var matches=new List<TableMatch>();var branches=new List<Tuple<IAccessible,string,int,object[]>>();
    foreach(var item in level){
     if(++visited>2048)throw new InvalidOperationException("Owned Diagnoser semantic discovery bound exceeded.");
     var node=item.Item1;string path=item.Item2;int role=Convert.ToInt32(node.get_accRole(0)),count=node.accChildCount;if(count<0||count>2048)throw new InvalidOperationException("Owned Diagnoser semantic branch count invalid.");
     object[] children=null;bool candidate=false;
     if(role==35&&count>=5&&count<=1500&&count%5==0){
      children=Fetch(node,count);string[] names={"Name","Address","Type","Length","Value"};bool header=true;
      for(int i=0;i<5;i++){IAccessible a=children[i] as IAccessible;int child=0;if(a==null){if(!(children[i] is int)){header=false;break;}a=node;child=(int)children[i];}if(child<0||Convert.ToInt32(a.get_accRole(child))!=25||a.get_accName(child)!=names[i]){header=false;break;}}
      if(header){candidate=true;try{var tableBounds=Rectangle(node,0);var headerBounds=new int[5][];bool visible=true;for(int i=0;i<5;i++){IAccessible a=children[i] as IAccessible;int child=0;if(a==null){a=node;child=(int)children[i];}headerBounds[i]=Rectangle(a,child);if(!Contains(tableBounds,headerBounds[i])||!Contains(diagnoserBounds,headerBounds[i])){visible=false;break;}}if(visible)matches.Add(new TableMatch{Table=node,Path=path,Children=children,Bounds=tableBounds,HeaderBounds=headerBounds});}catch(COMException){}catch(InvalidOperationException){}}
     }
     if(!candidate&&count>0&&depth<12)branches.Add(Tuple.Create(node,path,count,children));
    }
    if(matches.Count>1)throw new InvalidOperationException("Ambiguous five-column Object tables.");
    if(matches.Count==1)return matches[0];
    var next=new List<Tuple<IAccessible,string>>();
    foreach(var branch in branches){var children=branch.Item4??Fetch(branch.Item1,branch.Item3);for(int i=0;i<branch.Item3;i++){var child=children[i] as IAccessible;if(child!=null){next.Add(Tuple.Create(child,branch.Item2+"/index:"+i));if(next.Count>2048)throw new InvalidOperationException("Owned Diagnoser semantic discovery bound exceeded.");}else if(!(children[i] is int))throw new InvalidOperationException("Owned Diagnoser semantic representation changed.");}}
    level=next;
   }
   throw new InvalidOperationException("Visible five-column Object table absent.");
  }
  static int[] Rectangle(IAccessible a,int child){int x,y,w,h;a.accLocation(out x,out y,out w,out h,child);if(w<1||h<1||((long)x+w)>int.MaxValue||((long)y+h)>int.MaxValue)throw new InvalidOperationException("Owned Diagnoser accessible rectangle unavailable.");return new[]{x,y,w,h};}
  static bool Contains(int[] outer,int[] inner){return inner[0]>=outer[0]&&inner[1]>=outer[1]&&(long)inner[0]+inner[2]<=(long)outer[0]+outer[2]&&(long)inner[1]+inner[3]<=(long)outer[1]+outer[3];}
  static WindowInfo[] Guard(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd){
   WindowInfo main=null,diag=null;
   foreach(var w in native.EnumTopWindows()){if(w.Hwnd==mainHwnd&&w.Class=="Qt5QWindowOwnDCIcon"&&w.Title=="cMT Viewer ( Simulation )")main=w;else if(w.Hwnd==diagnoserHwnd&&w.Class=="Qt5QWindowIcon"&&w.Title=="Diagnoser")diag=w;else if(w.Visible)throw new InvalidOperationException("Unknown visible cMT window; no input.");}
   uint actual;GetWindowThreadProcessId(new IntPtr(diagnoserHwnd),out actual);
   if(main==null||diag==null||!main.Enabled||!diag.Enabled||!diag.Visible||actual!=(uint)pid||GetWindow(new IntPtr(mainHwnd),4)!=IntPtr.Zero||GetWindow(new IntPtr(diagnoserHwnd),4).ToInt64()!=mainHwnd)throw new InvalidOperationException("Original cMT main/visible Diagnoser owner chain required.");
   return new WindowInfo[]{main,diag};
  }
  public static Dictionary<string,object> Read(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for owned Diagnoser bounds.");
   try{
    for(int attempt=1;attempt<=3;attempt++){
     try{return ReadCore(native,pid,mainHwnd,diagnoserHwnd);}
     catch(COMException ex){
      if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw;
      if(attempt==3)throw new InvalidOperationException("Object snapshot failed after three attempts: "+ex.Message,ex);
     }
     catch(ObjectTableChangedException ex){if(attempt==3)throw new InvalidOperationException("Object table changed during three snapshot attempts.",ex);}
    }
    throw new InvalidOperationException("Object snapshot attempt bound exceeded.");
   }
   finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Owned Diagnoser DPI context restoration failed.");}
  }
  static Dictionary<string,object> ReadCore(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd){
   var windows=Guard(native,pid,mainHwnd,diagnoserHwnd);Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(diagnoserHwnd),0xFFFFFFFC,ref iid,out root)!=0||root==null)throw new InvalidOperationException("Owned Diagnoser MSAA root unavailable.");
   Bounds nativeBounds;if(!GetWindowRect(new IntPtr(diagnoserHwnd),out nativeBounds)||nativeBounds.right<=nativeBounds.left||nativeBounds.bottom<=nativeBounds.top)throw new InvalidOperationException("Owned Diagnoser native rectangle unavailable.");
   var diagnoserBounds=new[]{nativeBounds.left,nativeBounds.top,nativeBounds.right-nativeBounds.left,nativeBounds.bottom-nativeBounds.top};var found=Discover(root,diagnoserBounds);var table=found.Table;var children=found.Children;int count=children.Length;var tableBounds=found.Bounds;var headerBounds=found.HeaderBounds;
   string[] headers={"Name","Address","Type","Length","Value"};var cells=new List<Dictionary<string,object>>(count);int textChars=0;
   for(int i=0;i<count;i++){IAccessible a=table;int child=0;if(children[i] is int){child=(int)children[i];if(child<=0)throw new InvalidOperationException("Invalid Object cell ID.");}else if(children[i] is IAccessible){a=(IAccessible)children[i];}else throw new InvalidOperationException("Unsupported actual Object cell representation.");
    int role;string name;try{role=Convert.ToInt32(a.get_accRole(child));name=a.get_accName(child);}catch(COMException ex){throw new COMException("Object cell index "+i+" path "+found.Path+"/index:"+i+" read failed: "+ex.Message,ex.ErrorCode);}if(role!=(i<5?25:36)||(i<5&&name!=headers[i]))throw new InvalidOperationException("Actual Object header/cell role differs.");textChars+=name==null?0:name.Length;if(textChars>1048576)throw new InvalidOperationException("Object text exceeds product payload cap.");
    cells.Add(new Dictionary<string,object>{{"index",i},{"path",found.Path+"/index:"+i},{"role",role},{"state",null},{"name",name},{"value",null}});
   }
   if(table.accChildCount!=count)throw new ObjectTableChangedException();Guard(native,pid,mainHwnd,diagnoserHwnd);
   var visibility=new Dictionary<string,object>{{"method","native_window_and_accessible_rectangles"},{"diagnoser_bounds",diagnoserBounds},{"table_bounds",tableBounds},{"header_bounds",headerBounds}};
   return new Dictionary<string,object>{{"main",windows[0]},{"diagnoser",windows[1]},{"diagnoser_owner_hwnd",mainHwnd},{"tree_path",found.Path},{"tree_role",35},{"child_count",count},{"cells",cells.ToArray()},{"visibility_evidence",visibility},{"input_performed",false}};
  }
  public static Dictionary<string,object> ReadRequested(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,string[] addressTexts){
   if(native==null||addressTexts==null||addressTexts.Length<1||addressTexts.Length>8)throw new ArgumentException("One to eight exact Object addresses required.");
   var requested=new HashSet<string>(StringComparer.Ordinal);foreach(string address in addressTexts)if(String.IsNullOrEmpty(address)||!requested.Add(address))throw new ArgumentException("Object addresses must be nonempty and unique.");
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for owned Diagnoser bounds.");
   try{
    for(int attempt=1;attempt<=3;attempt++){
     try{return ReadRequestedCore(native,pid,mainHwnd,diagnoserHwnd,requested);}
     catch(COMException ex){if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw;if(attempt==3)throw new InvalidOperationException("Requested Object snapshot failed after three attempts: "+ex.Message,ex);}
     catch(ObjectTableChangedException ex){if(attempt==3)throw new InvalidOperationException("Object table changed during three requested snapshot attempts.",ex);}
    }
    throw new InvalidOperationException("Requested Object snapshot attempt bound exceeded.");
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Owned Diagnoser DPI context restoration failed.");}
  }
  static Dictionary<string,object> ReadRequestedCore(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,HashSet<string> requested){
   var windows=Guard(native,pid,mainHwnd,diagnoserHwnd);Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(diagnoserHwnd),0xFFFFFFFC,ref iid,out root)!=0||root==null)throw new InvalidOperationException("Owned Diagnoser MSAA root unavailable.");
   Bounds nativeBounds;if(!GetWindowRect(new IntPtr(diagnoserHwnd),out nativeBounds)||nativeBounds.right<=nativeBounds.left||nativeBounds.bottom<=nativeBounds.top)throw new InvalidOperationException("Owned Diagnoser native rectangle unavailable.");
   var diagnoserBounds=new[]{nativeBounds.left,nativeBounds.top,nativeBounds.right-nativeBounds.left,nativeBounds.bottom-nativeBounds.top};var found=Discover(root,diagnoserBounds);int count=found.Children.Length;
   var rows=new List<Dictionary<string,object>>();var foundAddresses=new HashSet<string>(StringComparer.Ordinal);int textChars=0;
   for(int row=1;row<count/5;row++){
    int first=row*5;string address=CellName(found,first+1);if(!requested.Contains(address))continue;
    string device=CellName(found,first);if(device!="Local HMI")continue;
    string type=CellName(found,first+2),length=CellName(found,first+3),value=CellName(found,first+4);
    textChars+=(address==null?0:address.Length)+(type==null?0:type.Length)+(length==null?0:length.Length)+(value==null?0:value.Length);
    if(textChars>1048576)throw new InvalidOperationException("Requested Object text exceeds product payload cap.");
    rows.Add(new Dictionary<string,object>{{"row_index",row},{"device",device},{"address_text",address},{"native_type",type},{"native_length",length},{"native_text",value}});foundAddresses.Add(address);
   }
   if(found.Table.accChildCount!=count)throw new ObjectTableChangedException();Guard(native,pid,mainHwnd,diagnoserHwnd);
   if(foundAddresses.Count!=requested.Count)throw new InvalidOperationException("Requested Local HMI Object address absent.");
   var visibility=new Dictionary<string,object>{{"method","native_window_and_accessible_rectangles"},{"diagnoser_bounds",diagnoserBounds},{"table_bounds",found.Bounds},{"header_bounds",found.HeaderBounds}};
   return new Dictionary<string,object>{{"main",windows[0]},{"diagnoser",windows[1]},{"diagnoser_owner_hwnd",mainHwnd},{"tree_path",found.Path},{"tree_role",35},{"child_count",count},{"scope","requested_local_hmi"},{"headers",new[]{"Name","Address","Type","Length","Value"}},{"visibility_evidence",visibility},{"rows",rows.ToArray()},{"input_performed",false}};
  }
  static string CellName(TableMatch table,int index){IAccessible a=table.Children[index] as IAccessible;int child=0;if(a==null){if(!(table.Children[index] is int))throw new InvalidOperationException("Object cell representation changed.");a=table.Table;child=(int)table.Children[index];}if(child<0||Convert.ToInt32(a.get_accRole(child))!=(index<5?25:36))throw new InvalidOperationException("Object cell role changed.");return a.get_accName(child);}
  sealed class ValueEditTarget {public int Row;public int[] CellBounds,TableBounds,HeaderBounds;public Bounds NativeBounds;public bool Visible;}
  static ValueEditTarget ResolveTargetOnce(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,string addressText,string nativeType,string expectedText){
   Guard(native,pid,mainHwnd,diagnoserHwnd);Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(diagnoserHwnd),0xFFFFFFFC,ref iid,out root)!=0||root==null)throw new InvalidOperationException("Owned Diagnoser MSAA root unavailable.");
   Bounds nativeBounds;if(!GetWindowRect(new IntPtr(diagnoserHwnd),out nativeBounds)||nativeBounds.right<=nativeBounds.left||nativeBounds.bottom<=nativeBounds.top)throw new InvalidOperationException("Owned Diagnoser native rectangle unavailable.");
   int[] diagnoserBounds={nativeBounds.left,nativeBounds.top,nativeBounds.right-nativeBounds.left,nativeBounds.bottom-nativeBounds.top};var table=Discover(root,diagnoserBounds);int count=table.Children.Length;
   var matches=new List<int>();for(int row=0;row<(count-5)/5;row++){int first=5+row*5;if(CellName(table,first+1)!=addressText)continue;
    if(CellName(table,first)!="Local HMI")continue;
    if(CellName(table,first+2)!=nativeType||CellName(table,first+3)!="1"||CellName(table,first+4)!=expectedText)throw new InvalidOperationException("Object Local HMI same-address row type, length or current value differs.");matches.Add(row);
   }
   if(matches.Count==0)throw new InvalidOperationException("Exact Local HMI Object value row absent.");
   int chosen=-1;int[] cellBounds=null;bool visible=false;foreach(int row in matches){int index=5+row*5+4;IAccessible a=table.Children[index] as IAccessible;int child=0;if(a==null){a=table.Table;child=(int)table.Children[index];}int[] rect=Rectangle(a,child);bool onScreen=Contains(diagnoserBounds,rect)&&Contains(table.Bounds,rect)&&rect[1]>=table.HeaderBounds[4][1]+table.HeaderBounds[4][3];if(chosen<0||onScreen){chosen=row;cellBounds=rect;visible=onScreen;}if(onScreen)break;}
   if(chosen<0)throw new InvalidOperationException("Actual Object value cell absent.");
   if(table.Table.accChildCount!=count)throw new ObjectTableChangedException();Guard(native,pid,mainHwnd,diagnoserHwnd);
   return new ValueEditTarget{Row=chosen,CellBounds=cellBounds,TableBounds=table.Bounds,HeaderBounds=table.HeaderBounds[4],NativeBounds=nativeBounds,Visible=visible};
  }
  static ValueEditTarget ResolveTarget(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,string addressText,string nativeType,string expectedText){
   for(int attempt=1;attempt<=3;attempt++){
    try{return ResolveTargetOnce(native,pid,mainHwnd,diagnoserHwnd,addressText,nativeType,expectedText);}
    catch(COMException ex){if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw;if(attempt==3)throw new InvalidOperationException("Object value target failed after three discovery attempts: "+ex.Message,ex);}
    catch(ObjectTableChangedException ex){if(attempt==3)throw new InvalidOperationException("Object value table changed during three discovery attempts.",ex);}
   }
   throw new InvalidOperationException("Object value target discovery attempt bound exceeded.");
  }
  sealed class SelectorNode {public IAccessible Accessible;public int Child;}
  static IAccessible SelectorRoot(long hwnd,int pid){
   uint owner;if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid)throw new InvalidOperationException("Owned cMT window selector root required.");
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(hwnd),0xFFFFFFFC,ref iid,out root)!=0||root==null)throw new InvalidOperationException("Owned cMT window selector MSAA root unavailable.");
   return root;
  }
  static List<SelectorNode> SelectorNodes(IAccessible root,int wantedRole,string wantedName){
   var queue=new Queue<SelectorNode>();queue.Enqueue(new SelectorNode{Accessible=root});var found=new List<SelectorNode>();int visited=0;
   while(queue.Count>0){
    if(++visited>8192)throw new InvalidOperationException("Owned cMT window selector discovery bound exceeded.");
    var node=queue.Dequeue();int role=Convert.ToInt32(node.Accessible.get_accRole(node.Child));
    if(role==wantedRole&&(wantedName==null||node.Accessible.get_accName(node.Child)==wantedName)){found.Add(node);continue;}
    // The page selector is outside the Object data table. Traversing every
    // monitored cell adds cross-process COM calls without locating this control.
    if(wantedRole==46&&role==35)continue;
    if(node.Child!=0)continue;
    int count=node.Accessible.accChildCount;if(count<0||count>8192)throw new InvalidOperationException("Owned cMT window selector child count invalid.");
    foreach(object child in Fetch(node.Accessible,count)){
     if(child is IAccessible)queue.Enqueue(new SelectorNode{Accessible=(IAccessible)child});
     else if(child is int)queue.Enqueue(new SelectorNode{Accessible=node.Accessible,Child=(int)child});
     else throw new InvalidOperationException("Owned cMT window selector child representation changed.");
    }
   }
   return found;
  }
  static SelectorNode WindowSelectorCombo(long diagnoserHwnd,int pid){
   var matches=SelectorNodes(SelectorRoot(diagnoserHwnd,pid),46," Down");var candidates=new List<SelectorNode>();var values=new List<string>();
   foreach(var node in matches){string value=node.Accessible.get_accValue(node.Child)??"";if(values.Count<6)values.Add(value.Length>64?value.Substring(0,64):value);if(System.Text.RegularExpressions.Regex.IsMatch(value,@"\AWindow [1-9][0-9]{0,4}: [^\p{Cc}]+\z"))candidates.Add(node);}
   if(candidates.Count!=1)throw new InvalidOperationException("Actual cMT window selector candidates="+candidates.Count+" among Down="+matches.Count+" values=["+String.Join(" | ",values.ToArray())+(matches.Count>values.Count?" | ...":"")+"]");
   return candidates[0];
  }
  static void PostSelectorKey(long diagnoserHwnd,uint key){
   uint scan=MapVirtualKeyW(key,0);if(scan==0)throw new InvalidOperationException("Original cMT selector key scan unavailable.");
   uint down=1u|(scan<<16);if(key==0x24||key==0x23||key==0x26||key==0x28)down|=0x01000000u;
   uint up=down|0xC0000000u;IntPtr hwnd=new IntPtr(diagnoserHwnd);
   if(!PostMessageW(hwnd,0x100,new UIntPtr(key),new IntPtr(unchecked((int)down)))||!PostMessageW(hwnd,0x101,new UIntPtr(key),new IntPtr(unchecked((int)up))))throw new InvalidOperationException("Owned cMT selector keyboard posting failed.");
  }
  public static Dictionary<string,object> SelectWindow(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,int windowNumber,string windowName){
   return SelectWindowCore(native,pid,mainHwnd,diagnoserHwnd,windowNumber,windowName,true);
  }
  public static Dictionary<string,object> SelectWindowByNumber(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,int windowNumber){
   return SelectWindowCore(native,pid,mainHwnd,diagnoserHwnd,windowNumber,null,false);
  }
  static Dictionary<string,object> SelectWindowCore(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,int windowNumber,string windowName,bool exactName){
   if(native==null||windowNumber<1||windowNumber>4095||(exactName&&(String.IsNullOrWhiteSpace(windowName)||windowName.Length>128)))throw new ArgumentException("Valid cMT window number and, for value writes, exact name required.");
   if(windowName!=null)foreach(char character in windowName)if(Char.IsControl(character))throw new ArgumentException("cMT window name contains a control character.");
   Guard(native,pid,mainHwnd,diagnoserHwnd);native.ActivateOwnedTopLevel(diagnoserHwnd,"Qt5QWindowIcon");
   string prefix="Window "+windowNumber.ToString(CultureInfo.InvariantCulture)+": ";
   string expected=prefix+windowName;
   var combo=WindowSelectorCombo(diagnoserHwnd,pid);string before=combo.Accessible.get_accValue(combo.Child);
   if(!exactName&&before.StartsWith(prefix,StringComparison.Ordinal)){windowName=before.Substring(prefix.Length);expected=before;}
   if(before==expected)return new Dictionary<string,object>{{"profile","weinview-cn421-cmt-object-window-select-v1"},{"window_number",windowNumber},{"window_name",windowName},{"before",before},{"after",before},{"input_performed",false},{"fixed_coordinate_input",false},{"observed_window_count",1},{"navigation_key_count",0},{"method","owned_msaa_selector_and_native_keyboard"},{"selected",true},{"diagnostic_window_hwnd",diagnoserHwnd}};
   combo.Accessible.accSelect(1,combo.Child);combo.Accessible.accDoDefaultAction(combo.Child);
   WindowInfo popup=null;var popupDeadline=DateTime.UtcNow.AddSeconds(2);
   do{
    var matches=new List<WindowInfo>();foreach(var w in native.EnumTopWindows())if(w.Visible&&w.Enabled&&w.Class=="Qt5QWindowPopupDropShadowSaveBits"&&w.Title=="cMTViewer"&&w.Pid==pid)matches.Add(w);
    if(matches.Count>1)throw new InvalidOperationException("Multiple owned cMT window selector popups.");
    if(matches.Count==1){popup=matches[0];break;}
    System.Threading.Thread.Sleep(25);
   }while(DateTime.UtcNow<popupDeadline);
   if(popup==null)throw new InvalidOperationException("Owned cMT window selector popup did not open.");
   List<SelectorNode> rows=null;int target=-1;var observedNames=new List<string>();var rowsDeadline=DateTime.UtcNow.AddSeconds(2);
   do{
    target=-1;observedNames.Clear();
    try{
     rows=SelectorNodes(SelectorRoot(popup.Hwnd,pid),34,null);
     for(int i=0;i<rows.Count;i++){
      string name=rows[i].Accessible.get_accName(rows[i].Child);
      if(!System.Text.RegularExpressions.Regex.IsMatch(name??"",@"\AWindow [1-9][0-9]{0,3}: [^\p{Cc}]+\z"))throw new InvalidOperationException("Actual cMT window selector item name differs.");
      observedNames.Add(name);
      if(exactName?name==expected:name.StartsWith(prefix,StringComparison.Ordinal)){if(target>=0)throw new InvalidOperationException("Requested cMT window selector item duplicated.");target=i;if(!exactName){expected=name;windowName=name.Substring(prefix.Length);}}
     }
     if(target>=0)break;
    }catch(COMException ex){if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw;}
    System.Threading.Thread.Sleep(25);
   }while(DateTime.UtcNow<rowsDeadline);
   if(rows==null||rows.Count<1||target<0){PostSelectorKey(diagnoserHwnd,0x1B);throw new InvalidOperationException("Requested cMT window "+expected+" absent from actual selector list. Observed: "+String.Join(" | ",observedNames.ToArray()));}
   combo=WindowSelectorCombo(diagnoserHwnd,pid);combo.Accessible.accSelect(1,combo.Child);
   bool fromEnd=rows.Count-1-target<target;uint edge=fromEnd?0x23u:0x24u,arrow=fromEnd?0x26u:0x28u;int arrows=fromEnd?rows.Count-1-target:target;
   PostSelectorKey(diagnoserHwnd,edge);System.Threading.Thread.Sleep(50);
   for(int i=0;i<arrows;i++)PostSelectorKey(diagnoserHwnd,arrow);
   System.Threading.Thread.Sleep(50);PostSelectorKey(diagnoserHwnd,0x0D);
   string after=null;var deadline=DateTime.UtcNow.AddSeconds(2);
   do{var current=WindowSelectorCombo(diagnoserHwnd,pid);after=current.Accessible.get_accValue(current.Child);if(after==expected)break;System.Threading.Thread.Sleep(25);}while(DateTime.UtcNow<deadline);
   if(after!=expected)throw new InvalidOperationException("Requested cMT window selector value not observed after native keyboard navigation.");
   Guard(native,pid,mainHwnd,diagnoserHwnd);
   return new Dictionary<string,object>{{"profile","weinview-cn421-cmt-object-window-select-v1"},{"window_number",windowNumber},{"window_name",windowName},{"before",before},{"after",after},{"input_performed",true},{"fixed_coordinate_input",false},{"observed_window_count",rows.Count},{"navigation_key_count",arrows+2},{"method","owned_msaa_selector_and_native_keyboard"},{"selected",true},{"diagnostic_window_hwnd",diagnoserHwnd}};
  }
  public static Dictionary<string,object> BeginValueEdit(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,string addressText,string nativeType,string expectedText){
   if(native==null||String.IsNullOrEmpty(addressText)||String.IsNullOrEmpty(nativeType)||expectedText==null)throw new ArgumentException("Exact Object address, type and current value required.");
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Object value edit.");
   try{
    Guard(native,pid,mainHwnd,diagnoserHwnd);native.ActivateOwnedTopLevel(diagnoserHwnd,"Qt5QWindowIcon");
    var target=ResolveTarget(native,pid,mainHwnd,diagnoserHwnd,addressText,nativeType,expectedText);
    Dictionary<string,object> scrollEvidence=null;
    if(!target.Visible){
     int[] table=target.TableBounds,cell=target.CellBounds,header=target.HeaderBounds;
     int left=Math.Max(table[0],target.NativeBounds.left),right=Math.Min(checked(table[0]+table[2]),target.NativeBounds.right),top=Math.Max(Math.Max(table[1],target.NativeBounds.top),checked(header[1]+header[3])),bottom=Math.Min(checked(table[1]+table[3]),target.NativeBounds.bottom);
     if(cell[0]<left||checked(cell[0]+cell[2])>right)throw new InvalidOperationException("Object value cell is horizontally outside the actual table viewport.");
     if(top>=bottom||cell[3]<1)throw new InvalidOperationException("Actual Object table viewport or row height unavailable for native wheel input.");
     int distance=cell[1]<top?top-cell[1]:checked(cell[1]+cell[3])-bottom;
     if(distance<=0)throw new InvalidOperationException("Object value cell is not fully visible for a reason native table wheel cannot resolve.");
     uint lines;if(!SystemParametersInfoW(0x68,0,out lines,0)||lines==0)throw new InvalidOperationException("Native wheel scroll lines unavailable.");
     int rowHeight=cell[3],pageHeight=bottom-top;
     int pageCapacity=Math.Max(rowHeight,(pageHeight/rowHeight)*rowHeight);
     long inputLimit=((long)distance+pageCapacity-1)/pageCapacity+1;
     if(inputLimit<1||inputLimit>273)throw new InvalidOperationException("Object value row exceeds bounded native table wheel pages.");
     var pages=new List<Dictionary<string,object>>();
     for(int page=0;page<inputLimit&&!target.Visible;page++){
      cell=target.CellBounds;
      bool above=cell[1]<top;
      int remaining=above?top-cell[1]:checked(cell[1]+cell[3])-bottom;
      if(remaining<=0)throw new InvalidOperationException("Object value cell is not fully visible for a reason native table wheel cannot resolve.");
      int pageDistance=Math.Min(remaining,pageCapacity);
      long steps=lines==uint.MaxValue?((long)pageDistance+pageHeight-1)/pageHeight:(((long)pageDistance+rowHeight-1)/rowHeight+1+lines-1)/lines;
      if(steps<1||steps>273)throw new InvalidOperationException("Object value row exceeds one signed native wheel input.");
      int delta=checked((int)(steps*120))*(above?1:-1);
      int x=cell[0]+cell[2]/2,y=top+(bottom-top)/2;
      if(x<short.MinValue||x>short.MaxValue||y<short.MinValue||y>short.MaxValue)throw new InvalidOperationException("Actual table wheel screen point exceeds native message coordinates.");
      IntPtr wheelPoint=new IntPtr(unchecked((int)(((uint)(ushort)y<<16)|(ushort)x)));
      UIntPtr wheel=new UIntPtr(unchecked((uint)((ushort)delta)<<16));
      Bounds wheelWindow;if(GetForegroundWindow().ToInt64()!=diagnoserHwnd||!GetWindowRect(new IntPtr(diagnoserHwnd),out wheelWindow)||wheelWindow.left!=target.NativeBounds.left||wheelWindow.top!=target.NativeBounds.top||wheelWindow.right!=target.NativeBounds.right||wheelWindow.bottom!=target.NativeBounds.bottom)throw new InvalidOperationException("Owned Diagnoser foreground or bounds changed before table wheel input.");
      Guard(native,pid,mainHwnd,diagnoserHwnd);
      if(!PostMessageW(new IntPtr(diagnoserHwnd),0x020A,wheel,wheelPoint))throw new InvalidOperationException("Owned Object table wheel posting failed; no retry.");
      pages.Add(new Dictionary<string,object>{{"method","one_native_table_wheel"},{"table_bounds",target.TableBounds},{"cell_bounds_before",cell},{"wheel_delta",delta},{"point",new[]{x,y}},{"input_posted",true}});
      var deadline=DateTime.UtcNow.AddSeconds(2);ValueEditTarget advanced=null;
      do{
       var probe=ResolveTarget(native,pid,mainHwnd,diagnoserHwnd,addressText,nativeType,expectedText);
       if(probe.Row!=target.Row||probe.NativeBounds.left!=target.NativeBounds.left||probe.NativeBounds.top!=target.NativeBounds.top||probe.NativeBounds.right!=target.NativeBounds.right||probe.NativeBounds.bottom!=target.NativeBounds.bottom||probe.CellBounds[0]!=cell[0]||probe.CellBounds[2]!=cell[2]||probe.CellBounds[3]!=cell[3])throw new InvalidOperationException("Object value row identity, window or cell bounds changed during table wheel.");
       for(int i=0;i<4;i++)if(probe.TableBounds[i]!=table[i]||probe.HeaderBounds[i]!=header[i])throw new InvalidOperationException("Object table or header bounds changed during table wheel.");
       if((above&&probe.CellBounds[1]<cell[1])||(!above&&probe.CellBounds[1]>cell[1]))throw new InvalidOperationException("Object value row moved opposite the requested table wheel direction.");
       if(probe.Visible||probe.CellBounds[1]!=cell[1]){advanced=probe;break;}
       System.Threading.Thread.Sleep(40);
      }while(DateTime.UtcNow<deadline);
      if(advanced==null)throw new InvalidOperationException("Exact Object value row did not advance after native table wheel; no retry.");
      target=advanced;
     }
     if(!target.Visible)throw new InvalidOperationException("Exact Object value cell did not become fully visible within bounded native table wheel pages.");
     scrollEvidence=pages.Count==1?pages[0]:new Dictionary<string,object>{{"method","native_table_wheel_pages"},{"pages",pages}};
    }
    IntPtr foreground=GetForegroundWindow();uint foregroundPid;if(foreground==IntPtr.Zero||GetWindowThreadProcessId(foreground,out foregroundPid)==0||foregroundPid!=(uint)pid)throw new InvalidOperationException("Original cMT foreground required before Object value input.");
    Bounds current;if(!GetWindowRect(new IntPtr(diagnoserHwnd),out current)||current.left!=target.NativeBounds.left||current.top!=target.NativeBounds.top||current.right!=target.NativeBounds.right||current.bottom!=target.NativeBounds.bottom)throw new InvalidOperationException("Diagnoser moved before Object value input.");
    var point=new EditPoint{x=target.CellBounds[0]+target.CellBounds[2]/2,y=target.CellBounds[1]+target.CellBounds[3]/2};if(!ScreenToClient(new IntPtr(diagnoserHwnd),ref point))throw new InvalidOperationException("Object value client point unavailable.");Bounds client;
    if(!GetClientRect(new IntPtr(diagnoserHwnd),out client)||point.x<client.left||point.y<client.top||point.x>=client.right||point.y>=client.bottom||point.x>32767||point.y>32767)throw new InvalidOperationException("Object value point outside owned Diagnoser client.");
    IntPtr hwnd=new IntPtr(diagnoserHwnd),packed=new IntPtr((point.y<<16)|(point.x&65535));Guard(native,pid,mainHwnd,diagnoserHwnd);
    if(!PostMessageW(hwnd,0x201,new UIntPtr(1),packed)||!PostMessageW(hwnd,0x202,UIntPtr.Zero,packed)||!PostMessageW(hwnd,0x203,new UIntPtr(1),packed)||!PostMessageW(hwnd,0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Owned Object value double-click posting failed; no retry.");
    var result=new Dictionary<string,object>{{"row_index",target.Row+1},{"address_text",addressText},{"native_type",nativeType},{"value_text",expectedText},{"cell_bounds",target.CellBounds},{"input_posted",true}};
    if(scrollEvidence!=null)result.Add("scroll_evidence",scrollEvidence);
    return result;
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Object value edit DPI context restoration failed.");}
  }
  public static Dictionary<string,object> CommitValueEdit(NativeControls native,int pid,long mainHwnd,long diagnoserHwnd,string addressText,string nativeType,string expectedText,string requestedText){
   if(native==null||String.IsNullOrEmpty(addressText)||String.IsNullOrEmpty(nativeType)||expectedText==null||String.IsNullOrEmpty(requestedText))throw new ArgumentException("Exact Object address, type, old value and bounded requested text required.");
   if(nativeType=="Bit"){
    if((expectedText!="true"&&expectedText!="false")||(requestedText!="true"&&requestedText!="false"))throw new ArgumentException("Exact lowercase Bit Object editor values required.");
   }else if(nativeType=="32-bit Float"){
    float value=0;
    if(requestedText.Length>64||!System.Text.RegularExpressions.Regex.IsMatch(requestedText,@"^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$")||!Single.TryParse(requestedText,NumberStyles.Float,CultureInfo.InvariantCulture,out value)||Single.IsNaN(value)||Single.IsInfinity(value))throw new ArgumentException("Finite invariant Float32 Object editor text required.");
   }else if(requestedText.Length>11||!System.Text.RegularExpressions.Regex.IsMatch(requestedText,"^-?[0-9]+$"))throw new ArgumentException("Bounded ASCII integer Object editor text required.");
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Object value commit.");
   try{
    var target=ResolveTarget(native,pid,mainHwnd,diagnoserHwnd,addressText,nativeType,expectedText);if(!target.Visible)throw new InvalidOperationException("Commit requires the exact visible Object value cell.");Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
    if(AccessibleObjectFromWindow(new IntPtr(diagnoserHwnd),0xFFFFFFFC,ref iid,out root)!=0||root==null)throw new InvalidOperationException("Owned Diagnoser MSAA root unavailable for focused editor.");
    var editor=root.accFocus as IAccessible;if(editor==null)throw new InvalidOperationException("Original Object inline editor is not the Diagnoser MSAA focus.");
    object nested=editor.accFocus;if(nested!=null&&(!(nested is int)||(int)nested!=0))throw new InvalidOperationException("Original Object inline editor focus changed.");
    int role=Convert.ToInt32(editor.get_accRole(0)),state=Convert.ToInt32(editor.get_accState(0));bool bit=nativeType=="Bit",floatEditor=nativeType=="32-bit Float";string before=bit?editor.get_accName(0):editor.get_accValue(0);int[] rect=Rectangle(editor,0);
    // The Float spin's MSAA value is its numeric backing value, not the active edit text.
    if((bit?role!=44:role!=52)||(!floatEditor&&before!=expectedText)||(state&4)==0||(state&0x18001)!=0||!Contains(target.CellBounds,rect)||(bit&&((state&16)!=0)!=(expectedText=="true")))throw new InvalidOperationException("Focused Object editor does not match the visible target value cell and old text/state.");
    IntPtr foreground=GetForegroundWindow();uint foregroundPid;if(foreground==IntPtr.Zero||GetWindowThreadProcessId(foreground,out foregroundPid)==0||foregroundPid!=(uint)pid)throw new InvalidOperationException("Original Viewer foreground required before Object value commit.");
    Bounds current;if(!GetWindowRect(new IntPtr(diagnoserHwnd),out current)||current.left!=target.NativeBounds.left||current.top!=target.NativeBounds.top||current.right!=target.NativeBounds.right||current.bottom!=target.NativeBounds.bottom)throw new InvalidOperationException("Diagnoser moved before Object value commit.");
    Guard(native,pid,mainHwnd,diagnoserHwnd);
    if(bit){
     bool checkedBefore=(state&16)!=0,toggled=checkedBefore!=(requestedText=="true");
     if(editor.get_accDefaultAction(0)!="Toggle")throw new InvalidOperationException("Focused Bit Object checkbox has no exact Toggle action.");
     if(toggled)editor.accDoDefaultAction(0);
     var bitDeadline=DateTime.UtcNow.AddSeconds(2);string bitObserved=null;bool checkedAfter=false;int observedState=0;
     do{try{bitObserved=editor.get_accName(0);observedState=Convert.ToInt32(editor.get_accState(0));checkedAfter=(observedState&16)!=0;}catch(COMException ex){if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw new InvalidOperationException("Bit Object checkbox readback failed before Enter.",ex);}if(bitObserved==requestedText&&checkedAfter==(requestedText=="true")&&(observedState&4)!=0)break;System.Threading.Thread.Sleep(40);}while(DateTime.UtcNow<bitDeadline);
     if(bitObserved!=requestedText||checkedAfter!=(requestedText=="true")||(observedState&4)==0)throw new InvalidOperationException("Bit Object checkbox did not reach exact requested label and checked state before Enter.");
     uint bitEnterScan=MapVirtualKeyW(0x0D,0);if(bitEnterScan==0)throw new InvalidOperationException("Object editor Enter scan code unavailable; no commit posted.");
     int bitDown=unchecked((int)(1u|(bitEnterScan<<16))),bitUp=unchecked((int)((uint)bitDown|0xC0000000u));IntPtr bitHwnd=new IntPtr(diagnoserHwnd);
     if(!PostMessageW(bitHwnd,0x100,new UIntPtr(0x0D),new IntPtr(bitDown))||!PostMessageW(bitHwnd,0x101,new UIntPtr(0x0D),new IntPtr(bitUp)))throw new InvalidOperationException("Owned Bit Object editor Enter posting failed; no retry.");
     return new Dictionary<string,object>{{"address_text",addressText},{"native_type",nativeType},{"editor_before",before},{"editor_text",requestedText},{"editor_bounds",rect},{"editor_role",role},{"commit_posted",true},{"editor_checked_before",checkedBefore},{"editor_checked_after",checkedAfter},{"toggle_performed",toggled}};
    }
    string decimalSeparator=null,inputText=requestedText;
    if(floatEditor){
     decimalSeparator=UserDecimalSeparator();
     inputText=requestedText.Replace(".",decimalSeparator);
    }
    uint endScan=MapVirtualKeyW(0x23,0),backScan=MapVirtualKeyW(0x08,0),enterScan=MapVirtualKeyW(0x0D,0);if(endScan==0||backScan==0||enterScan==0)throw new InvalidOperationException("Object editor key scan code unavailable; no input posted.");
    IntPtr hwnd=new IntPtr(diagnoserHwnd);int endDown=unchecked((int)(1u|(endScan<<16)|0x01000000u)),endUp=unchecked((int)((uint)endDown|0xC0000000u));
    if(!PostMessageW(hwnd,0x100,new UIntPtr(0x23),new IntPtr(endDown))||!PostMessageW(hwnd,0x101,new UIntPtr(0x23),new IntPtr(endUp)))throw new InvalidOperationException("Owned Object editor End posting failed; editor may already be modified; Enter was not posted.");
    System.Threading.Thread.Sleep(20);
    int backDown=unchecked((int)(1u|(backScan<<16))),backUp=unchecked((int)((uint)backDown|0xC0000000u));
    for(int i=0;i<(floatEditor?64:expectedText.Length);i++){if(!PostMessageW(hwnd,0x100,new UIntPtr(0x08),new IntPtr(backDown))||!PostMessageW(hwnd,0x101,new UIntPtr(0x08),new IntPtr(backUp)))throw new InvalidOperationException("Owned Object editor Backspace posting failed; editor may already be modified; Enter was not posted.");System.Threading.Thread.Sleep(20);}
    foreach(char character in inputText){
     if(floatEditor&&(character=='.'||character==',')){
      uint decimalKey=character=='.'?0xBEu:0xBCu,decimalScan=MapVirtualKeyW(decimalKey,0);if(decimalScan==0)throw new InvalidOperationException("Float Object native decimal scan code unavailable; Enter was not posted.");
      int decimalDown=unchecked((int)(1u|(decimalScan<<16))),decimalUp=unchecked((int)((uint)decimalDown|0xC0000000u));
      if(!PostMessageW(hwnd,0x100,new UIntPtr(decimalKey),new IntPtr(decimalDown))||!PostMessageW(hwnd,0x102,new UIntPtr((uint)character),new IntPtr(decimalDown))||!PostMessageW(hwnd,0x101,new UIntPtr(decimalKey),new IntPtr(decimalUp)))throw new InvalidOperationException("Owned Float Object decimal posting failed; editor may already be modified; Enter was not posted.");
     }else if(!PostMessageW(hwnd,0x100,new UIntPtr(0xE7),new IntPtr(1))||!PostMessageW(hwnd,0x102,new UIntPtr((uint)character),new IntPtr(1))||!PostMessageW(hwnd,0x101,new UIntPtr(0xE7),new IntPtr(unchecked((int)0xC0000001))))throw new InvalidOperationException("Owned Object editor packet posting failed; editor may already be modified; Enter was not posted.");
     System.Threading.Thread.Sleep(20);
    }
    string observed=null;
    if(floatEditor){
     observed=editor.get_accValue(0);float backingValue;
     if(String.IsNullOrEmpty(observed)||observed.Length>64||!System.Text.RegularExpressions.Regex.IsMatch(observed,@"^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$")||!Single.TryParse(observed,NumberStyles.Float,CultureInfo.InvariantCulture,out backingValue)||Single.IsNaN(backingValue)||Single.IsInfinity(backingValue))throw new InvalidOperationException("Float Object spin backing value is not finite bounded numeric text; Enter was not posted.");
    }else{
     var deadline=DateTime.UtcNow.AddSeconds(2);do{try{observed=editor.get_accValue(0);}catch(COMException ex){if(ex.ErrorCode!=unchecked((int)0x80004005)&&ex.ErrorCode!=unchecked((int)0x80010105))throw new InvalidOperationException("Object editor readback failed; editor may already be modified; Enter was not posted.",ex);}if(observed==requestedText)break;System.Threading.Thread.Sleep(40);}while(DateTime.UtcNow<deadline);
     if(observed!=requestedText)throw new InvalidOperationException("Object editor text did not reach requested value within two seconds; editor may already be modified; Enter was not posted.");
    }
    int down=unchecked((int)(1u|(enterScan<<16))),up=unchecked((int)((uint)down|0xC0000000u));
    if(!PostMessageW(hwnd,0x100,new UIntPtr(0x0D),new IntPtr(down))||!PostMessageW(hwnd,0x101,new UIntPtr(0x0D),new IntPtr(up)))throw new InvalidOperationException("Owned Object editor Enter posting failed; no retry.");
    var receipt=new Dictionary<string,object>{{"address_text",addressText},{"native_type",nativeType},{"editor_before",before},{"editor_text",requestedText},{"editor_bounds",rect},{"editor_role",role},{"commit_posted",true}};
    if(floatEditor){receipt.Add("editor_text_verified",false);receipt.Add("editor_observed_value_before_enter",observed);receipt.Add("editor_input_text",inputText);receipt.Add("editor_input_decimal_separator",decimalSeparator);}
    return receipt;
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Object value commit DPI context restoration failed.");}
  }
 }
}
