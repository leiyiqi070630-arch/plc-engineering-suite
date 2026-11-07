// Prepared CN421 adapter. No launch/save/global input. Only observed Alarm Display fields.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Accessibility;

namespace PLCCode.Weinview {
 public sealed class AlarmDisplayDialogControls {
  readonly NativeControls native; readonly int pid; readonly long ticks,main; readonly string exe;
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  [DllImport("oleacc.dll")] static extern int WindowFromAccessibleObject(IAccessible a,out IntPtr h);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr h,ref Point p);
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr h,ref Point p);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr h,uint flag);
  [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiState info);
  [DllImport("user32.dll")] static extern uint MapVirtualKeyW(uint code,uint map);
  [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int l,t,r,b;}
  [StructLayout(LayoutKind.Sequential)] struct GuiState {public uint size,flags;public IntPtr active,focus,capture,menu,movesize,caret;public Rect caretRect;}
  public sealed class Node {public string path,name,value,action;public int role,state,count;}
  sealed class Target {public IAccessible a;public int child;}
  public AlarmDisplayDialogControls(NativeControls n,int p,long t,string e,long m){
   if(n==null)throw new ArgumentNullException("n");native=n;pid=p;ticks=t;exe=e;main=m;Identity();
  }
  void Identity(){new Research.NativePropertyCandidate(pid,ticks,exe);int found=0;foreach(var w in native.EnumTopWindows())if(w.Hwnd==main&&w.Class=="EasyBuilderPro"&&w.Visible)found++;if(found!=1)throw new InvalidOperationException("Exact owned visible main required");}
  public void AssertDialog(long dialog,string title){
   if(title!="新增 报警显示"&&title!="报警显示的属性")throw new ArgumentException("Observed Alarm Display title required");
   Identity();int count=0,matched=0;foreach(var w in native.EnumTopWindows())if(w.Visible&&w.Class=="#32770"){count++;if(w.Hwnd==dialog&&w.Title==title&&w.Enabled)matched++;}
   if(count!=1||matched!=1)throw new InvalidOperationException("Unique exact owned enabled Alarm Display modal required");
  }
  void Provider(IAccessible a){IntPtr h;int hr=WindowFromAccessibleObject(a,out h);if(hr<0)Marshal.ThrowExceptionForHR(hr);uint owner;if(h==IntPtr.Zero||GetWindowThreadProcessId(h,out owner)==0||owner!=(uint)pid)throw new InvalidOperationException("Exact owned accessibility provider required");}
  static object Child(IAccessible a,int index){int count=a.accChildCount;if(index<0||index>=count||count>8192)throw new InvalidOperationException("Bounded current accessibility child required");object[] c=new object[1];int got;int hr=AccessibleChildren(a,index,1,c,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new InvalidOperationException("Accessibility child changed");return c[0];}
  static IAccessible Root(long h){var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(h),0xfffffffc,ref iid,out a);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(a==null)throw new InvalidOperationException("Owned accessibility root absent");return a;}
  void Qt(long dialog,long qt,string title){AssertDialog(dialog,title);int found=0;foreach(var c in native.EnumChildControls(dialog))if(c.Hwnd==qt&&c.Class=="Qt5QWindowIcon"&&c.Title=="EasyBuilder Pro"&&c.Visible&&c.Enabled)found++;if(found!=1||!IsChild(new IntPtr(dialog),new IntPtr(qt)))throw new InvalidOperationException("Unique owned visible property Qt required");}
  void Read(Target t,string path,int depth,List<Node> rows,HashSet<long> visited){
   if(depth>12||rows.Count>=512)throw new InvalidOperationException("Alarm property traversal bound exceeded");Provider(t.a);
   if(t.child==0){IntPtr u=Marshal.GetIUnknownForObject(t.a);try{if(!visited.Add(u.ToInt64()))return;}finally{Marshal.Release(u);}}
   int count=t.child==0?t.a.accChildCount:0;if(count<0||count>128)throw new InvalidOperationException("Alarm property branch bound exceeded");
   rows.Add(new Node{path=path,name=t.a.get_accName(t.child),value=t.a.get_accValue(t.child),action=t.a.get_accDefaultAction(t.child),role=Convert.ToInt32(t.a.get_accRole(t.child)),state=Convert.ToInt32(t.a.get_accState(t.child)),count=count});
   for(int i=0;i<count;i++){object child=Child(t.a,i);Target next;string part;if(child is IAccessible){next=new Target{a=(IAccessible)child};part="/index:"+i;}else if(child is int){next=new Target{a=t.a,child=(int)child};part="/id:"+child;}else throw new InvalidOperationException("Alarm property child representation changed");Read(next,path+part,depth+1,rows,visited);}
  }
  public Node[] Inspect(long dialog,long qt,string title){Qt(dialog,qt,title);var rows=new List<Node>();Read(new Target{a=Root(qt)},"client",0,rows,new HashSet<long>());Qt(dialog,qt,title);return rows.ToArray();}
  public sealed class HeadingEditEvidence {
   public int process_pid,before_state,after_state;
   public long creation_utc_ticks,dialog_hwnd,qt_hwnd;
   public string semantic_path,label,action;
   public bool requested,changed,global_input,native_edit_verified;
  }
  const string ObjectHeadingPath="client/index:0/index:0/index:0/index:5";
  Target ObjectHeading(long dialog,long qt,bool expected){
   Qt(dialog,qt,"报警显示的属性");
   var t=Resolve(qt,ObjectHeadingPath);int state=Convert.ToInt32(t.a.get_accState(t.child));
   if(t.child!=0||t.a.get_accName(t.child)!="使用元件标题"||Convert.ToInt32(t.a.get_accRole(t.child))!=44||t.a.get_accDefaultAction(t.child)!="Toggle"||(state&0x18001)!=0||((state&16)!=0)!=expected)throw new InvalidOperationException("Exact original enabled cMT heading checkbox changed");
   return t;
  }
  public HeadingEditEvidence SetObjectHeading(long dialog,long qt,bool expected,bool requested){
   var t=ObjectHeading(dialog,qt,expected);
   var proof=new HeadingEditEvidence{process_pid=pid,creation_utc_ticks=ticks,dialog_hwnd=dialog,qt_hwnd=qt,semantic_path=ObjectHeadingPath,label="使用元件标题",action="Toggle",before_state=Convert.ToInt32(t.a.get_accState(t.child)),requested=requested,changed=expected!=requested,global_input=false};
   if(proof.changed){t=ObjectHeading(dialog,qt,expected);t.a.accDoDefaultAction(t.child);}
   var deadline=DateTime.UtcNow.AddSeconds(3);
   do{Qt(dialog,qt,"报警显示的属性");var current=Resolve(qt,ObjectHeadingPath);int state=Convert.ToInt32(current.a.get_accState(current.child));if(current.child!=0||current.a.get_accName(current.child)!="使用元件标题"||Convert.ToInt32(current.a.get_accRole(current.child))!=44||current.a.get_accDefaultAction(current.child)!="Toggle"||(state&0x18001)!=0)throw new InvalidOperationException("Original cMT heading identity changed after input; no replay");if(((state&16)!=0)==requested){proof.after_state=state;proof.native_edit_verified=true;return proof;}Thread.Sleep(40);}while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Original heading checkbox readback differs; no toggle replay");
  }
  public sealed class SortColumn {public string item,label;public bool displayed;public int display_chars;}
  public sealed class SortEditEvidence {
   public string item,label,dialog_title,editor_class,before_text,requested_text,after_text;
   public int row_index,process_pid,editor_id,before_display_chars,requested_display_chars,after_display_chars;
   public long creation_utc_ticks,dialog_hwnd,grid_hwnd,editor_hwnd,editor_parent_hwnd,focus_hwnd;
   public int[] cell_bounds,editor_bounds,grid_client_point,grid_client_bounds;
   public uint[] selection_messages,commit_messages;public long[] commit_lparams;
   public bool changed,native_edit_verified,global_input;
  }
  static readonly string[] SortItems={"trigger_date","trigger_time","message"};
  static readonly string[] SortLabels={"触发日期","触发时间","讯息"};
  static readonly string[] MtSortItems={"trigger_date","trigger_time","message","occurrence_count","accumulated_time"};
  static readonly string[] MtSortLabels={"触发日期","触发时间","讯息","发生次数","累积时间"};
  static readonly string[] CmtSortItems={"trigger_date","trigger_time","message","occurrence_count","accumulated_time","priority","category","subcategory_1","subcategory_2"};
  static readonly string[] CmtSortLabels={"触发日期","触发时间","讯息","发生次数","累积时间","优先等级","类别","子类别 1","子类别 2"};
  long SortGrid(long dialog,string title){
   AssertDialog(dialog,title);long grid=0;int count=0;
   foreach(var c in native.EnumChildControls(dialog))if(c.Id==1000&&c.Visible&&c.Enabled&&c.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){grid=c.Hwnd;count++;}
   if(count!=1||GetAncestor(new IntPtr(grid),2).ToInt64()!=dialog)throw new InvalidOperationException("Unique original Alarm Display sort grid1000 required");
   foreach(var c in native.EnumChildControls(grid))if(c.Visible&&c.Class=="Edit")throw new InvalidOperationException("Uncommitted native sort editor blocks field inspection");
   return grid;
  }
  IAccessible SortCell(long grid,int rowIndex,int column){return SortCell(grid,rowIndex,column,3);}
  IAccessible SortCell(long grid,int rowIndex,int column,int rowCount){
   if((rowCount!=3&&rowCount!=5&&rowCount!=9)||rowIndex<0||rowIndex>=rowCount||column<0||column>2)throw new ArgumentException("Exact observed three/five/nine-row sort contract required");
   var root=Root(grid);Provider(root);
   if(root.get_accName(0)!="GridControl"||Convert.ToInt32(root.get_accRole(0))!=24||root.accChildCount!=rowCount)throw new InvalidOperationException("Exact original native sort row count required");
   var row=Child(root,rowIndex) as IAccessible;
   if(row==null||row.get_accName(0)!="Row "+(rowIndex+1)||Convert.ToInt32(row.get_accRole(0))!=28||row.accChildCount!=3)throw new InvalidOperationException("Original three-cell sort row required");
   var cell=Child(row,column) as IAccessible;Provider(row);
   if(cell==null||cell.get_accName(0)!="Row "+(rowIndex+1)+", Column "+(column+1)||Convert.ToInt32(cell.get_accRole(0))!=29||cell.accChildCount!=1)throw new InvalidOperationException("Original sort cell identity required");
   Provider(cell);object child=Child(cell,0);
   if(!(child is int)||(int)child!=1||(Convert.ToInt32(cell.get_accState(1))&0x18001)!=0)throw new InvalidOperationException("Visible enabled original simple cell child1 required");
   return cell;
  }
  public SortColumn[] ReadSortColumns(long dialog,string title){return ReadSortColumns(dialog,title,false);}
  public SortColumn[] ReadSortColumns(long dialog,string title,bool cmt){
   var items=cmt?CmtSortItems:SortItems;var labels=cmt?CmtSortLabels:SortLabels;
   long grid=SortGrid(dialog,title);
   if(!cmt){
    var root=Root(grid);Provider(root);
    // MT8071iE exposes the two additional rows in the same original grid.
    if(root.accChildCount==MtSortItems.Length){items=MtSortItems;labels=MtSortLabels;}
   }
   var result=new SortColumn[items.Length];
   for(int i=0;i<items.Length;i++){
    var toggle=SortCell(grid,i,0,items.Length);var label=SortCell(grid,i,1,items.Length);var value=SortCell(grid,i,2,items.Length);int chars;string text=value.get_accValue(0);
    if(Convert.ToInt32(toggle.get_accRole(1))!=44||toggle.get_accDefaultAction(1)!="Toggle"||Convert.ToInt32(label.get_accRole(1))!=42||label.get_accValue(0)!=labels[i]||label.get_accValue(1)!=labels[i]||Convert.ToInt32(value.get_accRole(1))!=42||value.get_accValue(1)!=text||!Int32.TryParse(text,NumberStyles.None,CultureInfo.InvariantCulture,out chars)||chars<0||chars>32767||chars.ToString(CultureInfo.InvariantCulture)!=text)throw new InvalidOperationException("Exact original sort label/check/value fields required");
    result[i]=new SortColumn{item=items[i],label=labels[i],displayed=(Convert.ToInt32(toggle.get_accState(1))&16)!=0,display_chars=chars};
   }
   if(SortGrid(dialog,title)!=grid)throw new InvalidOperationException("Original sort grid changed during reading");return result;
  }
  void SortInputGuard(long dialog){
   AssertDialog(dialog,"报警显示的属性");if(GetForegroundWindow().ToInt64()!=dialog)throw new InvalidOperationException("Original Alarm Display property modal must remain foreground");
   foreach(int key in new[]{0x10,0x11,0x12})if((GetAsyncKeyState(key)&0x8000)!=0)throw new InvalidOperationException("Held modifier forbids owned sort input");
  }
  GuiState SortEditor(long dialog,long grid,long edit,int[] cellBounds,string expectedText){
   SortInputGuard(dialog);int count=0;
   foreach(var c in native.EnumChildControls(dialog))if(c.Visible&&c.Enabled&&c.Class=="Edit"){count++;if(c.Hwnd!=edit||c.Id!=1||c.Pid!=pid)throw new InvalidOperationException("Actual sole native Edit1 identity differs");}
   Rect r;uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(edit),out owner);var state=new GuiState();state.size=(uint)Marshal.SizeOf(typeof(GuiState));
   if(count!=1||owner!=(uint)pid||thread==0||GetParent(new IntPtr(edit)).ToInt64()!=grid||!GetWindowRect(new IntPtr(edit),out r)||r.l<cellBounds[0]||r.t<cellBounds[1]||r.r>cellBounds[0]+cellBounds[2]||r.b>cellBounds[1]+cellBounds[3]||r.r<=r.l||r.b<=r.t||!GetGUIThreadInfo(thread,ref state)||state.active.ToInt64()!=dialog||state.focus.ToInt64()!=edit||native.GetControlText(edit,16)!=expectedText)throw new InvalidOperationException("Owned focused sort editor must contain exact text and remain inside original cell");
   return state;
  }
  public SortEditEvidence SetSortColumnChars(long dialog,string item,int expected,int requested){return SetSortColumnChars(dialog,item,expected,requested,false);}
  public SortEditEvidence SetSortColumnChars(long dialog,string item,int expected,int requested,bool cmt){
   int index=Array.IndexOf(SortItems,item);if(index<1||requested<0||requested>80||(index==2&&requested==0))throw new ArgumentException("Finite trigger_time0..80/message1..80 character counts required; adapter bound, not vendor limit");
   var before=ReadSortColumns(dialog,"报警显示的属性",cmt);if(before[index].display_chars!=expected)throw new InvalidOperationException("Original sort field changed before edit");
   var proof=new SortEditEvidence{item=item,label=SortLabels[index],row_index=index,process_pid=pid,creation_utc_ticks=ticks,dialog_hwnd=dialog,dialog_title="报警显示的属性",before_display_chars=expected,requested_display_chars=requested,before_text=expected.ToString(CultureInfo.InvariantCulture),requested_text=requested.ToString(CultureInfo.InvariantCulture),global_input=false};
   if(expected==requested){proof.after_display_chars=expected;proof.after_text=proof.before_text;proof.native_edit_verified=true;return proof;}
   SortInputGuard(dialog);long grid=SortGrid(dialog,"报警显示的属性");var cell=SortCell(grid,index,2,before.Length);int x,y,w,h;cell.accLocation(out x,out y,out w,out h,0);var point=new Point{x=x+w/2,y=y+h/2};Rect client;
   if(w<=0||h<=0||!ScreenToClient(new IntPtr(grid),ref point)||!GetClientRect(new IntPtr(grid),out client)||point.x<0||point.y<0||point.x>=client.r||point.y>=client.b||point.x>32767||point.y>32767)throw new InvalidOperationException("Fresh original sort cell must fit owned grid client");
   proof.grid_hwnd=grid;proof.cell_bounds=new[]{x,y,w,h};proof.grid_client_point=new[]{point.x,point.y};proof.grid_client_bounds=new[]{0,0,client.r,client.b};
   SortInputGuard(dialog);if(ReadSortColumns(dialog,"报警显示的属性",cmt)[index].display_chars!=expected)throw new InvalidOperationException("Native sort field changed before local doubleclick");
   int freshX,freshY,freshW,freshH;SortCell(grid,index,2,before.Length).accLocation(out freshX,out freshY,out freshW,out freshH,0);if(x!=freshX||y!=freshY||w!=freshW||h!=freshH)throw new InvalidOperationException("Native sort cell moved before local doubleclick");
   var packet=new IntPtr((point.y<<16)|(point.x&65535));uint[] messages={0x201,0x202,0x203,0x202};uint[] flags={1,0,1,0};for(int i=0;i<4;i++)if(!PostMessageW(new IntPtr(grid),messages[i],new UIntPtr(flags[i]),packet))throw new InvalidOperationException("Owned sort cell doubleclick failed; no replay");proof.selection_messages=messages;
   long edit=0;var deadline=DateTime.UtcNow.AddSeconds(3);
   do{SortInputGuard(dialog);int count=0;foreach(var c in native.EnumChildControls(dialog))if(c.Visible&&c.Enabled&&c.Class=="Edit"){count++;edit=c.Hwnd;}if(count>1)throw new InvalidOperationException("Ambiguous sort editor; preserve modal");if(count==1)break;Thread.Sleep(25);}while(DateTime.UtcNow<deadline);
   if(edit==0)throw new InvalidOperationException("Original sort editor did not appear; no doubleclick replay");
   SortEditor(dialog,grid,edit,proof.cell_bounds,proof.before_text);native.SetControlText(edit,proof.requested_text);var state=SortEditor(dialog,grid,edit,proof.cell_bounds,proof.requested_text);Rect editRect;if(!GetWindowRect(new IntPtr(edit),out editRect))throw new InvalidOperationException("Original sort editor bounds absent");
   proof.editor_hwnd=edit;proof.editor_parent_hwnd=GetParent(new IntPtr(edit)).ToInt64();proof.editor_class="Edit";proof.editor_id=1;proof.focus_hwnd=state.focus.ToInt64();proof.editor_bounds=new[]{editRect.l,editRect.t,editRect.r-editRect.l,editRect.b-editRect.t};
   uint scan=MapVirtualKeyW(0x0D,0);if(scan!=0x1C)throw new InvalidOperationException("Actual standard Enter scan code differs");long down=1|(scan<<16),up=down|0xC0000000L;SortEditor(dialog,grid,edit,proof.cell_bounds,proof.requested_text);
   if(!PostMessageW(new IntPtr(edit),0x100,new UIntPtr(0x0D),new IntPtr(down))||!PostMessageW(new IntPtr(edit),0x101,new UIntPtr(0x0D),new IntPtr(up)))throw new InvalidOperationException("Owned sort editor commit failed; no replay");proof.commit_messages=new uint[]{0x100,0x101};proof.commit_lparams=new[]{down,up};
   deadline=DateTime.UtcNow.AddSeconds(3);bool editing;
   do{SortInputGuard(dialog);editing=false;foreach(var c in native.EnumChildControls(grid))if(c.Visible&&c.Class=="Edit")editing=true;if(!editing)break;Thread.Sleep(25);}while(DateTime.UtcNow<deadline);
   if(editing)throw new InvalidOperationException("Original sort editor remains uncommitted; preserve modal");
   var after=ReadSortColumns(dialog,"报警显示的属性",cmt);if(after.Length!=before.Length)throw new InvalidOperationException("Native sort column profile changed during edit");for(int i=0;i<before.Length;i++)if(before[i].item!=after[i].item||before[i].label!=after[i].label||before[i].displayed!=after[i].displayed||after[i].display_chars!=(i==index?requested:before[i].display_chars))throw new InvalidOperationException("Native sort edit changed unrelated columns or failed readback");
   proof.after_display_chars=after[index].display_chars;proof.after_text=proof.after_display_chars.ToString(CultureInfo.InvariantCulture);proof.changed=true;proof.native_edit_verified=true;return proof;
  }
  void Tree(long h,int window){
   Identity();if(window!=0&&(window<10||window>1999))throw new ArgumentException("Ordinary window required");
   int m=0;foreach(var w in native.EnumTopWindows()){if(w.Visible&&w.Class=="#32770")throw new InvalidOperationException("Own modal blocks AL tree operation");if(w.Hwnd==main&&w.Enabled&&(window==0||Regex.IsMatch(w.Title,@"\[\s*"+window+@"\s*-\s*[^\]]+\]$")))m++;}
   if(m!=1||GetForegroundWindow().ToInt64()!=main)throw new InvalidOperationException("Exact selected owned foreground document required");
   int q=0;foreach(var c in native.EnumChildControls(main))if(c.Hwnd==h&&c.Class=="Qt5QWindowIcon"&&c.Visible&&c.Enabled)q++;
   if(q!=1||!IsChild(new IntPtr(main),new IntPtr(h)))throw new InvalidOperationException("Owned visible AL tree Qt required");
  }
  Target Resolve(long h,string path){var parts=path.Split('/');if(parts.Length>13||parts[0]!="client")throw new InvalidOperationException("Bounded current AL row path required");var t=new Target{a=Root(h)};Provider(t.a);for(int i=1;i<parts.Length;i++){if(t.child!=0)throw new InvalidOperationException("Simple child cannot descend");int index;if(parts[i].StartsWith("index:",StringComparison.Ordinal)&&Int32.TryParse(parts[i].Substring(6),out index)){object c=Child(t.a,index);if(c is IAccessible)t=new Target{a=(IAccessible)c};else if(c is int)t.child=(int)c;else throw new InvalidOperationException("AL row representation changed");}else if(parts[i].StartsWith("id:",StringComparison.Ordinal)&&Int32.TryParse(parts[i].Substring(3),out index)&&index>0)t.child=index;else throw new InvalidOperationException("AL path segment invalid");Provider(t.a);}return t;}
  int[] WindowRow(long tree,string path,string label,int number){
   if(number<10||number>1999||!Regex.IsMatch(label??"","^"+number+@"\s*:\s*[^\r\n]+$"))throw new ArgumentException("Exact observed ordinary window row required");
   var t=Resolve(tree,path);if(t.a.get_accName(t.child)!=label||Convert.ToInt32(t.a.get_accRole(t.child))!=36||t.a.get_accDefaultAction(t.child)!="Toggle"||(Convert.ToInt32(t.a.get_accState(t.child))&0x18001)!=0)throw new InvalidOperationException("Visible enabled exact window row changed");int x,y,w,h;t.a.accLocation(out x,out y,out w,out h,t.child);if(w<1||h<1)throw new InvalidOperationException("Window row geometry absent");return new[]{x,y,w,h};
  }
  public void OpenWindow(long tree,string path,string label,int number){
   Tree(tree,0);var row=WindowRow(tree,path,label,number);var point=new Point{x=row[0]+row[2]/2,y=row[1]+row[3]/2};Rect r;
   if(!ScreenToClient(new IntPtr(tree),ref point)||!GetClientRect(new IntPtr(tree),out r)||point.x<0||point.y<0||point.x>=r.r||point.y>=r.b||point.x>32767||point.y>32767)throw new InvalidOperationException("Observed window row outside own Qt client");
   Tree(tree,0);var fresh=WindowRow(tree,path,label,number);for(int i=0;i<4;i++)if(row[i]!=fresh[i])throw new InvalidOperationException("Window row moved before single doubleclick");
   // Expanded directory state does not prove an active MDI document. Always open once.
   var packet=new IntPtr((point.y<<16)|(point.x&65535));uint[] messages={0x201,0x202,0x203,0x202};uint[] flags={1,0,1,0};for(int i=0;i<4;i++)if(!PostMessageW(new IntPtr(tree),messages[i],new UIntPtr(flags[i]),packet))throw new InvalidOperationException("Owned window row doubleclick failed; no retry");
  }
  public sealed class CanvasEvidence {public Research.ScreenSceneEvidence frame;public long? pixel_count;public bool minimum_lavender_threshold_ignored;public string geometry_source="actual_owned_paint_bounds";}
   public CanvasEvidence CaptureCanvas(int number,string name,int canvasWidth,int canvasHeight,string path){
    var scene=new Research.NativeScreenScene(pid,ticks,exe,main,number,name,canvasWidth,canvasHeight);
   try{return new CanvasEvidence{frame=scene.Capture(path),pixel_count=null,minimum_lavender_threshold_ignored=false};}
   catch(Research.CanvasNotPaintedException failure){
     // The vendor AL interior obscures lavender. The frame must still match the
     // current native window dimensions; no other Scene exception is recoverable here.
    int[] box=failure.CanvasBox;int width=box[2]-box[0],height=box[3]-box[1];
     if(width!=canvasWidth||height!=canvasHeight||failure.PixelCount>=250000||failure.PixelCount<=0)throw;
    Identity();long view=0;string document=number+" - "+name;int found=0;
    foreach(var w in native.EnumTopWindows()){if(w.Visible&&w.Class=="#32770")throw new InvalidOperationException("Own modal blocks AL paint proof");if(w.Hwnd==main&&w.Enabled&&Regex.IsMatch(w.Title,@"\[\s*"+Regex.Escape(document)+@"\s*\]\s*$"))found++;}
    if(found!=1||GetForegroundWindow().ToInt64()!=main)throw new InvalidOperationException("Exact owned active foreground AL document required");
    foreach(var w in native.EnumChildControls(main))if(w.Id==59665&&w.Class=="AfxFrameOrView140u"&&w.Visible&&w.Enabled&&w.Title.Trim()==document){if(view!=0)throw new InvalidOperationException("AL active view ambiguous");view=w.Hwnd;}
    Rect r;if(view==0||!GetWindowRect(new IntPtr(view),out r))throw new InvalidOperationException("Actual owned AL view geometry absent");
    using(var bitmap=new System.Drawing.Bitmap(failure.ImagePath))if(bitmap.Width!=r.r-r.l||bitmap.Height!=r.b-r.t)throw new InvalidOperationException("AL captured view dimensions changed");
    if(box[0]<0||box[1]<0||box[2]>r.r-r.l||box[3]>r.b-r.t)throw new InvalidOperationException("AL canvas outside captured view");
    var origin=new Point();if(!ClientToScreen(new IntPtr(view),ref origin))throw new InvalidOperationException("AL owned view origin absent");string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(failure.ImagePath))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");
    // Original Capture already checked PID/ticks/exe, main/MDI, modal, foreground,
    // overlay, viewport before/after and wrote this image before its sole paint test.
     return new CanvasEvidence{pixel_count=failure.PixelCount,minimum_lavender_threshold_ignored=true,frame=new Research.ScreenSceneEvidence{MainHwnd=main,ViewHwnd=view,ViewRect=new[]{r.l,r.t,r.r,r.b},CanvasBox=box,CanvasOriginClient=new[]{r.l+box[0]-origin.x,r.t+box[1]-origin.y},ImagePath=failure.ImagePath,ImageSha256=hash,CapturedUtc=DateTime.UtcNow.ToString("o"),PlacementOnly=true,LogicalWidth=canvasWidth,LogicalHeight=canvasHeight,Clipped=false}};
   }
  }
 }

 // Reuses existing owned ribbon geometry proof. OCR aliases are candidates only;
 // the PS adapter requires the exact new native modal before any definition write.
 public static class AlarmDisplayRibbonControls {
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  [DllImport("oleacc.dll")]static extern int WindowFromAccessibleObject(IAccessible a,out IntPtr h);
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref Point p);
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  [StructLayout(LayoutKind.Sequential)]struct Point{public int x,y;}
  sealed class Target{public IAccessible a;public int child;}
  static void Validate(NativeControls n,NativeSemanticControls.RibbonProof proof){if(proof==null||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds<0||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Fresh owned alarm ribbon proof required");var p=ObjectRibbonControls.LocateOwnedRibbon(n,proof.Main);if(p.Hwnd!=proof.Hwnd||p.Left!=proof.Left||p.Top!=proof.Top||p.Width!=proof.Width||p.Height!=proof.Height)throw new InvalidOperationException("Alarm ribbon identity/geometry changed");}
  static void Scan(Target t,int pid,int depth,ref int budget,HashSet<long> seen,List<ObjectRibbonSemantic.Item> rows,List<Target> targets){
   if(++budget>128||depth>8)throw new InvalidOperationException("Alarm ribbon traversal bound");if(t.child==0){IntPtr u=Marshal.GetIUnknownForObject(t.a);try{if(!seen.Add(u.ToInt64()))return;}finally{Marshal.Release(u);}}
   IntPtr h;int hr=WindowFromAccessibleObject(t.a,out h);if(hr<0)Marshal.ThrowExceptionForHR(hr);uint owner;if(h!=IntPtr.Zero&&(GetWindowThreadProcessId(h,out owner)==0||owner!=(uint)pid))throw new InvalidOperationException("Foreign alarm ribbon provider rejected");
   int role=Convert.ToInt32(t.a.get_accRole(t.child));if(role==12||role==37||role==43){rows.Add(new ObjectRibbonSemantic.Item{name=t.a.get_accName(t.child),action=t.a.get_accDefaultAction(t.child),role=role,state=Convert.ToInt32(t.a.get_accState(t.child)),provider_hwnd=h.ToInt64(),provider_window_present=h!=IntPtr.Zero});targets.Add(t);return;}
   if(t.child!=0)return;int count=t.a.accChildCount;if(count<0||count>64)throw new InvalidOperationException("Alarm ribbon branch bound");object[] children=new object[count];int got;hr=AccessibleChildren(t.a,0,count,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=count)throw new InvalidOperationException("Alarm ribbon children changed");foreach(object c in children){Target next;if(c is IAccessible)next=new Target{a=(IAccessible)c};else if(c is int)next=new Target{a=t.a,child=(int)c};else throw new InvalidOperationException("Alarm ribbon representation changed");Scan(next,pid,depth+1,ref budget,seen,rows,targets);}
  }
  public static ObjectRibbonSemantic.Item[] ReadOrInvokeOwned(NativeControls n,NativeSemanticControls.RibbonProof proof,string exactLabel){
   Validate(n,proof);if(exactLabel!=null&&exactLabel!="报警显示"&&exactLabel!="资料/历史")throw new ArgumentException("Only observed alarm ribbon entries allowed");
   uint pid;if(GetWindowThreadProcessId(new IntPtr(proof.Hwnd),out pid)==0)throw new InvalidOperationException("Alarm ribbon PID absent");var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(proof.Hwnd),0xfffffffc,ref iid,out a);if(hr<0||a==null){if(exactLabel!=null)throw new InvalidOperationException("Alarm ribbon provider absent");return new ObjectRibbonSemantic.Item[0];}
   var rows=new List<ObjectRibbonSemantic.Item>();var targets=new List<Target>();int budget=0;Scan(new Target{a=a},(int)pid,0,ref budget,new HashSet<long>(),rows,targets);Validate(n,proof);
   if(exactLabel!=null){int index=-1;for(int i=0;i<rows.Count;i++)if(rows[i].name==exactLabel){if(index!=-1)throw new InvalidOperationException("Ambiguous exact alarm ribbon entry");index=i;}if(index<0||(rows[index].state&0x18001)!=0||String.IsNullOrEmpty(rows[index].action))throw new InvalidOperationException("Visible enabled exact alarm ribbon entry absent");Validate(n,proof);targets[index].a.accDoDefaultAction(targets[index].child);n.EnumTopWindows();}return rows.ToArray();
  }
  public static void Click(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y,string label){
   if((label!="报警显示"&&label!="资料/历史")||Double.IsNaN(x)||Double.IsNaN(y)||Double.IsInfinity(x)||Double.IsInfinity(y))throw new ArgumentException("Bounded alarm ribbon candidate required");Validate(n,proof);if(x<0||y<0||x>=proof.Width||y>=proof.Height)throw new InvalidOperationException("Alarm ribbon point outside capture");
   string hash;using(var sha=SHA256.Create())using(var stream=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","");if(hash!=proof.Hash)throw new InvalidOperationException("Alarm ribbon screenshot changed");var p=new Point{x=proof.Left+(int)x,y=proof.Top+(int)y};if(!ScreenToClient(new IntPtr(proof.Hwnd),ref p)||p.x<0||p.y<0||p.x>32767||p.y>32767)throw new InvalidOperationException("Alarm ribbon client conversion failed");var packet=new IntPtr((p.y<<16)|p.x);
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x200,UIntPtr.Zero,packet))throw new InvalidOperationException("Owned alarm pointer post failed");System.Threading.Thread.Sleep(80);Validate(n,proof);if(!PostMessageW(new IntPtr(proof.Hwnd),0x201,new UIntPtr(1),packet)||!PostMessageW(new IntPtr(proof.Hwnd),0x202,UIntPtr.Zero,packet))throw new InvalidOperationException("Owned alarm ribbon single click failed; no retry");
  }
 }
}
