using System;using System.IO;using System.Runtime.InteropServices;using System.Security.Cryptography;
using System.Text;using Accessibility;
namespace PLCCode.Weinview {
 public sealed class TrendChannelRange { public int row; public string label; public double minimum; public double maximum; }
 public sealed class TrendChannelAxis { public int row; public string label; public string axis; }
 public sealed class TrendObservedChannel { public int row; public string label; public string data_type; public bool enabled; }
 public static class TrendRibbonControls {
  [StructLayout(LayoutKind.Sequential)]struct Point {public int x,y;}
  [StructLayout(LayoutKind.Sequential)]struct Rect {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)]struct GuiThreadInfo {public uint size,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public Rect caretRect;}
  [DllImport("user32.dll")]static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll")]static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref Point point);
  [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out Rect rect);
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out Rect rect);
  [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")]static extern int GetWindowLongW(IntPtr h,int index);
  [DllImport("user32.dll")]static extern bool IsWindowUnicode(IntPtr h);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern IntPtr WindowFromPoint(Point point);
  [DllImport("user32.dll")]static extern bool IsChild(IntPtr parent,IntPtr child);
  [DllImport("user32.dll")]static extern bool SetCursorPos(int x,int y);
  [DllImport("user32.dll")]static extern void mouse_event(uint flags,uint dx,uint dy,uint data,UIntPtr extra);
  [DllImport("user32.dll")]static extern bool GetGUIThreadInfo(uint thread,ref GuiThreadInfo info);
  [DllImport("user32.dll")]static extern IntPtr SendMessageW(IntPtr h,uint message,IntPtr wp,IntPtr lp);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern IntPtr SendMessageW(IntPtr h,uint message,IntPtr wp,string lp);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern IntPtr SendMessageW(IntPtr h,uint message,IntPtr wp,StringBuilder lp);
  [DllImport("user32.dll")]static extern IntPtr SendMessageW(IntPtr h,uint message,IntPtr wp,ref Rect lp);
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint message,UIntPtr wp,IntPtr lp);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetClassNameW(IntPtr h,StringBuilder name,int capacity);
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint objectId,ref Guid iid,out IAccessible value);
  static string Sha(string path){using(var s=SHA256.Create())using(var f=File.OpenRead(path))return BitConverter.ToString(s.ComputeHash(f)).Replace("-","");}
  public static object RequireDialog(NativeControls n,long dialog,long main,string title){
   if(title!="新增 趋势图"&&title!="趋势图的属性")throw new InvalidOperationException("Finite original Trend dialog title required");
   n.GetControlText(main,4096);WindowInfo actual=null;foreach(var w in n.EnumTopWindows()){if(w.Visible&&w.Class=="#32770"&&w.Hwnd!=dialog)throw new InvalidOperationException("Unknown competing owned Trend modal; preserve it");if(w.Hwnd==dialog)actual=w;}
   if(actual==null||!actual.Visible||!actual.Enabled||actual.Class!="#32770"||actual.Title!=title||GetWindow(new IntPtr(dialog),4).ToInt64()!=main)throw new InvalidOperationException("Exact own Trend dialog and original main owner required");
   return new {hwnd=dialog,pid=actual.Pid,title=actual.Title,owner_hwnd=main,visible=actual.Visible,enabled=actual.Enabled};
  }
  public static object ClickTrend(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y,string observedLabel){
   if(proof==null||(observedLabel!="趋势图"&&observedLabel!="趋势")||Double.IsNaN(x)||Double.IsNaN(y)||Double.IsInfinity(x)||Double.IsInfinity(y)||x<0||y<0||x>=proof.Width||y>=proof.Height)throw new InvalidOperationException("Actual finite Trend caption point required");
   uint dpi=GetDpiForWindow(new IntPtr(proof.Main));if(dpi!=96&&dpi!=120)throw new InvalidOperationException("Finite original 96/120 window DPI required; actual "+dpi);
   if((DateTime.UtcNow-proof.CapturedUtc).TotalSeconds<0||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||Sha(proof.Path)!=proof.Hash)throw new InvalidOperationException("CN421 fresh unchanged Trend ribbon required");
   if(Array.Exists(n.EnumTopWindows(),w=>w.Visible&&w.Class=="#32770"))throw new InvalidOperationException("Unexpected modal before Trend entry");
   var current=ObjectRibbonControls.LocateOwnedRibbon(n,proof.Main);
   if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height)throw new InvalidOperationException("Trend ribbon identity/geometry changed");
   var point=new Point{x=proof.Left+(int)x,y=proof.Top+(int)y};if(!ScreenToClient(new IntPtr(proof.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767)throw new InvalidOperationException("Owned Trend point conversion failed");
   long lp=(point.y<<16)|point.x;if(!PostMessageW(new IntPtr(proof.Hwnd),0x200,UIntPtr.Zero,new IntPtr(lp)))throw new InvalidOperationException("Owned Trend pointer message failed; no retry");
   System.Threading.Thread.Sleep(80);current=ObjectRibbonControls.LocateOwnedRibbon(n,proof.Main);
   if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height||GetDpiForWindow(new IntPtr(proof.Main))!=dpi||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Trend proof changed before click");
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x201,new UIntPtr(1),new IntPtr(lp))||!PostMessageW(new IntPtr(proof.Hwnd),0x202,UIntPtr.Zero,new IntPtr(lp)))throw new InvalidOperationException("Single owned Trend click failed; no replay");
   n.EnumTopWindows();return new {main_hwnd=proof.Main,ribbon_hwnd=proof.Hwnd,image_path=proof.Path,image_sha256=proof.Hash,geometry=new[]{proof.Left,proof.Top,proof.Width,proof.Height},observed_label=observedLabel,dpi=dpi,client_point=new[]{point.x,point.y},lparam=lp,messages=new uint[]{0x200,0x201,0x202},click_posted=true,global_input=false,layout_reset=false};
  }
  static IAccessible ChannelRoot(NativeControls n,long dialog,long main,string title,int count){
   RequireDialog(n,dialog,main,title);if(count<1)throw new InvalidOperationException("Current Sampling definition has no Trend channels");
   long grid=0;int grids=0;foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Enabled&&child.Id==1000&&child.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){grid=child.Hwnd;grids++;}
   if(grids!=1)throw new InvalidOperationException("Unique original Trend channel grid1000 required");
   int dialogPid=0;foreach(var window in n.EnumTopWindows())if(window.Hwnd==dialog)dialogPid=window.Pid;
   uint owner;var className=new StringBuilder(128);if(dialogPid==0||GetWindowThreadProcessId(new IntPtr(grid),out owner)==0||owner!=(uint)dialogPid||GetClassNameW(new IntPtr(grid),className,className.Capacity)==0||!className.ToString().StartsWith("BCGPGridCtrl:",StringComparison.Ordinal))throw new InvalidOperationException("Trend channel grid ownership changed");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(grid),0xfffffffc,ref iid,out root);
   if(hr<0||root==null||root.get_accName(0)!="GridControl"||Convert.ToInt32(root.get_accRole(0))!=24||root.accChildCount!=count)throw new InvalidOperationException("Original Trend channel row count differs from current Sampling definition");
   return root;
  }
  public static TrendObservedChannel[] ReadObservedChannels(NativeControls n,long dialog,long main,string title){
   RequireDialog(n,dialog,main,title);long grid=0;foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Enabled&&child.Id==1000&&child.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){if(grid!=0)throw new InvalidOperationException("Trend channel grid ambiguous");grid=child.Hwnd;}
   if(grid==0)throw new InvalidOperationException("Trend channel grid absent");uint owner;int dialogPid=0;foreach(var window in n.EnumTopWindows())if(window.Hwnd==dialog)dialogPid=window.Pid;
   if(dialogPid==0||GetWindowThreadProcessId(new IntPtr(grid),out owner)==0||owner!=(uint)dialogPid)throw new InvalidOperationException("Trend channel grid ownership changed");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(grid),0xfffffffc,ref iid,out root);
   if(hr<0||root==null||root.get_accName(0)!="GridControl"||Convert.ToInt32(root.get_accRole(0))!=24||root.accChildCount<1||root.accChildCount>256)throw new InvalidOperationException("Trend channel grid row count absent");
   var rows=new TrendObservedChannel[root.accChildCount];var seen=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
   for(int i=0;i<rows.Length;i++){int row=i+1;var r=root.get_accChild(row) as IAccessible;
    if(r==null||r.get_accName(0)!="Row "+row||Convert.ToInt32(r.get_accRole(0))!=28||r.accChildCount!=5)throw new InvalidOperationException("Trend channel row contract changed");
    var number=r.get_accChild(1) as IAccessible;var toggle=r.get_accChild(2) as IAccessible;var label=r.get_accChild(3) as IAccessible;var type=r.get_accChild(4) as IAccessible;
    if(number==null||toggle==null||label==null||type==null||number.get_accValue(1)!=row.ToString())throw new InvalidOperationException("Trend channel identity absent");
    string name=label.get_accValue(1),kind=type.get_accValue(1);if(String.IsNullOrEmpty(name)||!seen.Add(name)||kind!="16-bit Signed"&&kind!="16-bit Unsigned"&&kind!="32-bit Float")throw new InvalidOperationException("Trend channel label/type invalid");
    rows[i]=new TrendObservedChannel{row=row,label=name,data_type=kind,enabled=(Convert.ToInt32(toggle.get_accState(1))&16)!=0};
   }
   return rows;
  }
  static IAccessible ChannelCell(IAccessible root,int row,int column){
   var r=root.get_accChild(row) as IAccessible;if(r==null||r.get_accName(0)!="Row "+row||Convert.ToInt32(r.get_accRole(0))!=28||r.accChildCount!=5)throw new InvalidOperationException("Original Trend row changed");
   var cell=r.get_accChild(column) as IAccessible;if(cell==null||cell.get_accName(0)!="Row "+row+", Column "+column||Convert.ToInt32(cell.get_accRole(0))!=29||cell.accChildCount!=1)throw new InvalidOperationException("Original Trend cell changed");
   if(cell.get_accName(1)!="Row "+row+", Column "+column||Convert.ToInt32(cell.get_accRole(1))!=(column==2?44:42))throw new InvalidOperationException("Original Trend cell child role changed");return cell;
  }
  static bool[] ChannelStates(IAccessible root,string[] labels,string[] types){
   if(labels==null||types==null||labels.Length<1||types.Length!=labels.Length)throw new InvalidOperationException("Exact current Sampling channel list required");var states=new bool[labels.Length];
   for(int i=0;i<labels.Length;i++){int row=i+1;if(String.IsNullOrEmpty(labels[i])||types[i]!="16-bit Signed"&&types[i]!="16-bit Unsigned"&&types[i]!="32-bit Float"||ChannelCell(root,row,1).get_accValue(1)!=row.ToString()||ChannelCell(root,row,3).get_accValue(1)!=labels[i]||ChannelCell(root,row,4).get_accValue(1)!=types[i])throw new InvalidOperationException("Trend native rows differ from same-project Sampling labels/types");
    var toggle=ChannelCell(root,row,2);if(Convert.ToInt32(toggle.get_accRole(1))!=44||toggle.get_accDefaultAction(1)!="Toggle")throw new InvalidOperationException("Actual Trend channel checkbox action differs");states[i]=(Convert.ToInt32(toggle.get_accState(1))&16)!=0;}
   return states;
  }
  static void ClickChannel(NativeControls n,long dialog,long main,string title,IAccessible root,int row){
   RequireDialog(n,dialog,main,title);
   long grid=0;int grids=0;foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Enabled&&child.Id==1000&&child.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){grid=child.Hwnd;grids++;}
   if(grids!=1)throw new InvalidOperationException("Unique current Trend channel grid required");
   var cell=ChannelCell(root,row,2);if(Convert.ToInt32(cell.get_accRole(1))!=44||cell.get_accDefaultAction(1)!="Toggle"||(Convert.ToInt32(cell.get_accState(1))&16)!=0)throw new InvalidOperationException("Exact unchecked Trend channel action required");
   cell.accDoDefaultAction(1);
   var end=DateTime.UtcNow.AddSeconds(1);
   while((Convert.ToInt32(cell.get_accState(1))&16)==0&&DateTime.UtcNow<end)System.Threading.Thread.Sleep(20);
  }
  public static object EnableSamplingChannels(NativeControls n,long dialog,long main,string title,string[] labels,string[] types){
   var root=ChannelRoot(n,dialog,main,title,labels.Length);var before=ChannelStates(root,labels,types);
   for(int i=0;i<labels.Length;i++)if(!ChannelStates(root,labels,types)[i]){
    ClickChannel(n,dialog,main,title,root,i+1);
    root=ChannelRoot(n,dialog,main,title,labels.Length);
    if(!ChannelStates(root,labels,types)[i])throw new InvalidOperationException("Trend channel native checked readback failed at row "+(i+1));
   }
   var after=ChannelStates(root,labels,types);foreach(bool enabled in after)if(!enabled)throw new InvalidOperationException("Trend channel native checked readback differs");
   return new {labels=labels,types=types,before_checked=before,after_checked=after,channel_count=labels.Length,native_grid_verified=true,global_input=false};
  }
  public static object SelectChannelRow(NativeControls n,long dialog,long main,string title,string[] labels,string[] types,int row){
   if(labels==null||types==null||row<1||row>labels.Length)throw new ArgumentException("Actual Trend channel row required");
   var root=ChannelRoot(n,dialog,main,title,labels.Length);ChannelStates(root,labels,types);
   long grid=0;foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Enabled&&child.Id==1000&&child.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){if(grid!=0)throw new InvalidOperationException("Trend channel grid is ambiguous");grid=child.Hwnd;}
   if(grid==0)throw new InvalidOperationException("Owned Trend channel grid required");
   var cell=ChannelCell(root,row,3);if(cell.get_accValue(1)!=labels[row-1])throw new InvalidOperationException("Trend channel label changed before row selection");
   FocusOwnedControl(grid);
   int current=SelectedChannelRow(root);
   if(current==0){SendGridKey(grid,0x26);current=SelectedChannelRow(root);}
   if(current<1||current>labels.Length)throw new InvalidOperationException("Trend channel selection unavailable after native focus");
   while(current!=row){int expected=current+(current<row?1:-1);SendGridKey(grid,current<row?0x28:0x26);current=SelectedChannelRow(root);if(current!=expected)throw new InvalidOperationException("Trend channel keyboard selection did not advance to the next identified row");}
   root=ChannelRoot(n,dialog,main,title,labels.Length);ChannelStates(root,labels,types);
   var selected=root.get_accChild(row) as IAccessible;
   if(selected==null||(Convert.ToInt32(selected.get_accState(0))&6)!=6)throw new InvalidOperationException("Trend native row did not show selected/focused state");
   return new {row=row,label=labels[row-1],grid_hwnd=grid,method="owned_grid_keyboard",coordinates=false,grid_focus_verified=true,row_selected_verified=true};
  }
  static int SelectedChannelRow(IAccessible root){int selected=0;for(int i=1;i<=root.accChildCount;i++){var row=root.get_accChild(i) as IAccessible;if(row!=null&&(Convert.ToInt32(row.get_accState(0))&2)!=0){if(selected!=0)throw new InvalidOperationException("Trend channel selection is ambiguous");selected=i;}}return selected;}
  static void SendGridKey(long hwnd,int key){SendMessageW(new IntPtr(hwnd),0x100,new IntPtr(key),new IntPtr(1));SendMessageW(new IntPtr(hwnd),0x101,new IntPtr(key),new IntPtr(unchecked((int)0xc0000001)));}
  static void FocusOwnedControl(long hwnd){var h=new IntPtr(hwnd);uint owner;uint thread=GetWindowThreadProcessId(h,out owner);if(thread==0)throw new InvalidOperationException("Owned Trend control thread unavailable");SendMessageW(GetParent(h),0x28,h,new IntPtr(1));var state=new GuiThreadInfo();state.size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo));if(!GetGUIThreadInfo(thread,ref state)||(state.focus!=h&&!IsChild(h,state.focus)))throw new InvalidOperationException("Owned Trend element did not acquire focus");}
  public static object SetChannelRangeEdit(NativeControls n,long dialog,long main,string title,int id,string value){
   double parsed;if(id!=1297&&id!=1298||value==null||!Double.TryParse(value,System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out parsed)||Double.IsNaN(parsed)||Double.IsInfinity(parsed))throw new ArgumentException("Finite original Trend range edit required");
   RequireDialog(n,dialog,main,title);var edit=n.FindUniqueControlWithoutLabel(dialog,id,"Edit");
   FocusOwnedControl(edit.Hwnd);
   SendMessageW(new IntPtr(edit.Hwnd),0xB1,IntPtr.Zero,new IntPtr(-1));
   SendMessageW(new IntPtr(edit.Hwnd),0xC2,new IntPtr(1),value);
   double observed;if(!Double.TryParse(n.GetControlText(edit.Hwnd,64),System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out observed)||observed!=parsed)throw new InvalidOperationException("Trend range edit immediate native readback differs");
   return new {id=id,value=value,edit_hwnd=edit.Hwnd,edit_focus_verified=true,normal_edit_change=true};
  }
  public static TrendChannelRange[] ReadChannelRanges(NativeControls n,long dialog,long main,string title,string[] labels,string[] types){
   if(labels==null||types==null||labels.Length<1||labels.Length!=types.Length)throw new ArgumentException("Exact Trend channels required");
   var values=new TrendChannelRange[labels.Length];
   for(int i=0;i<labels.Length;i++){
    SelectChannelRow(n,dialog,main,title,labels,types,i+1);
    string minimum=n.GetControlText(n.FindUniqueControlWithoutLabel(dialog,1297,"Edit").Hwnd,64);
    string maximum=n.GetControlText(n.FindUniqueControlWithoutLabel(dialog,1298,"Edit").Hwnd,64);
    double min,max;if(!ReadRange(types[i],minimum,out min)||!ReadRange(types[i],maximum,out max)||min>=max)throw new InvalidOperationException("Trend native per-channel range invalid for actual type at row "+(i+1));
    values[i]=new TrendChannelRange{row=i+1,label=labels[i],minimum=min,maximum=max};
   }
   return values;
  }
  static bool ReadRange(string type,string text,out double value){
   value=0;if(!Double.TryParse(text,System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out value)||Double.IsNaN(value)||Double.IsInfinity(value))return false;
   if(type=="16-bit Signed")return value>=-32768&&value<=32767&&Math.Truncate(value)==value;
   if(type=="16-bit Unsigned")return value>=0&&value<=65535&&Math.Truncate(value)==value;
   if(type=="32-bit Float")return Math.Abs(value)<=Single.MaxValue;
   return false;
  }
  public static object SetChannelRanges(NativeControls n,long dialog,long main,string title,string[] labels,string[] types,double minimum,double maximum){
   if(labels==null||types==null||labels.Length<1||labels.Length!=types.Length||minimum>=maximum)throw new ArgumentException("Finite per-channel Trend range required");
   var minima=new double[labels.Length];var maxima=new double[labels.Length];for(int i=0;i<labels.Length;i++){minima[i]=minimum;maxima[i]=maximum;}
   return SetChannelRangesPerRow(n,dialog,main,title,labels,types,minima,maxima);
  }
  public static object SetChannelRangesPerRow(NativeControls n,long dialog,long main,string title,string[] labels,string[] types,double[] minima,double[] maxima){
   if(labels==null||types==null||minima==null||maxima==null||labels.Length<1||labels.Length!=types.Length||labels.Length!=minima.Length||labels.Length!=maxima.Length)throw new ArgumentException("Exact per-channel Trend ranges required");
   var before=ReadChannelRanges(n,dialog,main,title,labels,types);
   var written=new object[labels.Length];
   for(int i=0;i<labels.Length;i++){
    double checkedMin,checkedMax;if(minima[i]>=maxima[i]||!ReadRange(types[i],minima[i].ToString("R",System.Globalization.CultureInfo.InvariantCulture),out checkedMin)||!ReadRange(types[i],maxima[i].ToString("R",System.Globalization.CultureInfo.InvariantCulture),out checkedMax))throw new ArgumentException("Trend channel minimum/maximum invalid for actual type at row "+(i+1));
    if(before[i].minimum==minima[i]&&before[i].maximum==maxima[i]){written[i]=new {row=i+1,label=labels[i],changed=false};continue;}
    SelectChannelRow(n,dialog,main,title,labels,types,i+1);
    var min=SetChannelRangeEdit(n,dialog,main,title,1297,minima[i].ToString("R",System.Globalization.CultureInfo.InvariantCulture));
    var max=SetChannelRangeEdit(n,dialog,main,title,1298,maxima[i].ToString("R",System.Globalization.CultureInfo.InvariantCulture));
    written[i]=new {row=i+1,label=labels[i],minimum=min,maximum=max,changed=true};
   }
   var readback=ReadChannelRanges(n,dialog,main,title,labels,types);
   for(int i=0;i<readback.Length;i++)if(readback[i].minimum!=minima[i]||readback[i].maximum!=maxima[i])throw new InvalidOperationException("Trend native per-channel range changed after row commit");
   return new {written=written,after_row_commit=readback,all_rows_verified=true};
  }
  public static object ReadSamplingChannels(NativeControls n,long dialog,long main,string title,string[] labels,string[] types){
   var checkedStates=ChannelStates(ChannelRoot(n,dialog,main,title,labels.Length),labels,types);bool all=true;foreach(bool value in checkedStates)all=all&&value;
   return new {labels=labels,types=types,checked_states=checkedStates,channel_count=labels.Length,all_enabled=all,native_grid_verified=true};
  }
  static IAccessible AxisRoot(NativeControls n,long dialog,long main,string title,int count,out long grid){
   RequireDialog(n,dialog,main,title);grid=0;
   foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Enabled&&child.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){
    if(grid!=0)throw new InvalidOperationException("Trend Y axis grid is ambiguous");grid=child.Hwnd;
   }
   if(grid==0)throw new InvalidOperationException("Trend Y axis grid absent");
   uint owner;int dialogPid=0;foreach(var window in n.EnumTopWindows())if(window.Hwnd==dialog)dialogPid=window.Pid;
   if(dialogPid==0||GetWindowThreadProcessId(new IntPtr(grid),out owner)==0||owner!=(uint)dialogPid)throw new InvalidOperationException("Trend Y axis grid ownership changed");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   int hr=AccessibleObjectFromWindow(new IntPtr(grid),0xfffffffc,ref iid,out root);
   if(hr<0||root==null||root.get_accName(0)!="GridControl"||Convert.ToInt32(root.get_accRole(0))!=24||root.accChildCount!=count)throw new InvalidOperationException("Trend Y axis rows differ from current Sampling definition");
   return root;
  }
  public static TrendChannelAxis[] ReadChannelAxes(NativeControls n,long dialog,long main,string title,string[] labels,string[] types){
   if(labels==null||types==null||labels.Length<1||labels.Length!=types.Length)throw new ArgumentException("Exact Trend channels required");
   long grid;var root=AxisRoot(n,dialog,main,title,labels.Length,out grid);
   var values=new TrendChannelAxis[labels.Length];
   for(int i=0;i<labels.Length;i++){
    int row=i+1;var r=root.get_accChild(row) as IAccessible;
    if(r==null||r.get_accName(0)!="Row "+row||Convert.ToInt32(r.get_accRole(0))!=28||r.accChildCount!=5)throw new InvalidOperationException("Trend Y axis row changed");
    var label=r.get_accChild(3) as IAccessible;var type=r.get_accChild(4) as IAccessible;var axis=r.get_accChild(5) as IAccessible;
    if(label==null||type==null||axis==null||label.get_accValue(1)!=labels[i]||type.get_accValue(1)!=types[i]||axis.get_accName(0)!="Row "+row+", Column 5"||Convert.ToInt32(axis.get_accRole(0))!=29||axis.accChildCount!=1||Convert.ToInt32(axis.get_accRole(1))!=46)throw new InvalidOperationException("Trend Y axis channel identity or cell contract changed");
    values[i]=new TrendChannelAxis{row=row,label=labels[i],axis=axis.get_accValue(1)};
   }
   return values;
  }
  public static object SetChannelAxes(NativeControls n,long dialog,long main,string title,string[] labels,string[] types,string[] axes){
   if(axes==null||labels==null||types==null||axes.Length<1||axes.Length!=labels.Length||axes.Length!=types.Length)throw new ArgumentException("Exact Trend channel Y axes required");
   foreach(string axis in axes)if(axis!="无"&&axis!="主轴"&&axis!="辅助轴")throw new ArgumentException("Original Trend Y axis choice required");
   var actions=new object[axes.Length];
   for(int i=0;i<axes.Length;i++){
    long grid;var root=AxisRoot(n,dialog,main,title,labels.Length,out grid);var current=ReadChannelAxes(n,dialog,main,title,labels,types);
    if(current[i].axis==axes[i]){actions[i]=new {row=i+1,label=labels[i],axis=axes[i],changed=false};continue;}
    if(GetForegroundWindow().ToInt64()!=dialog)throw new InvalidOperationException("Foreground owned Trend Y axis dialog required");
    var row=root.get_accChild(i+1) as IAccessible;var cell=row==null?null:row.get_accChild(5) as IAccessible;
    if(cell==null||cell.get_accValue(1)!=current[i].axis||Convert.ToInt32(cell.get_accRole(1))!=46)throw new InvalidOperationException("Trend Y axis row changed before selection");
    FocusOwnedControl(grid);
    cell.accSelect(3,1);
    string action=cell.get_accDefaultAction(1);
    if(!String.IsNullOrEmpty(action))cell.accDoDefaultAction(1);else SendGridKey(grid,0x71);
    long edit=0;var ready=DateTime.UtcNow.AddSeconds(1);
    do{
     edit=0;foreach(var child in n.EnumChildControls(dialog))if(child.Visible&&child.Id==1&&child.Class=="Edit"&&IsChild(new IntPtr(grid),new IntPtr(child.Hwnd))){if(edit!=0)throw new InvalidOperationException("Trend Y axis inline editor ambiguous");edit=child.Hwnd;}
     if(edit!=0)break;System.Threading.Thread.Sleep(20);
    }while(DateTime.UtcNow<ready);
    if(edit==0||n.GetControlText(edit,128)!=current[i].axis)throw new InvalidOperationException("Trend Y axis semantic edit action did not open the identified cell; action="+action);
    FocusOwnedControl(edit);SendGridKey(edit,0x73);
    uint owner;if(GetWindowThreadProcessId(new IntPtr(grid),out owner)==0)throw new InvalidOperationException("Trend Y axis owner unavailable");
    long popup=0;ready=DateTime.UtcNow.AddSeconds(1);
    do{
     popup=0;foreach(var window in n.EnumTopWindows())if(window.Visible&&window.Class=="ComboLBox"){
      uint pid;if(GetWindowThreadProcessId(new IntPtr(window.Hwnd),out pid)==0||pid!=owner)continue;
      if(popup!=0)throw new InvalidOperationException("Trend Y axis choice popup ambiguous");popup=window.Hwnd;
     }
     if(popup!=0)break;System.Threading.Thread.Sleep(20);
    }while(DateTime.UtcNow<ready);
    if(popup==0||!IsWindowUnicode(new IntPtr(popup)))throw new InvalidOperationException("Owned Unicode Trend Y axis popup absent");
    int style=GetWindowLongW(new IntPtr(popup),-16);if((style&0x30)!=0&&(style&0x40)==0)throw new InvalidOperationException("Trend Y axis popup owner-draw labels unavailable");
    int count=SendMessageW(new IntPtr(popup),0x018B,IntPtr.Zero,IntPtr.Zero).ToInt32();if(count!=3)throw new InvalidOperationException("Trend Y axis original popup choice count changed");
    string[] expected={"无","主轴","辅助轴"};int selected=-1;
    for(int j=0;j<count;j++){int length=SendMessageW(new IntPtr(popup),0x018A,new IntPtr(j),IntPtr.Zero).ToInt32();if(length<1||length>16)throw new InvalidOperationException("Trend Y axis popup label invalid");var text=new StringBuilder(length+2);int copied=SendMessageW(new IntPtr(popup),0x0189,new IntPtr(j),text).ToInt32();if(copied!=length||text.ToString()!=expected[j])throw new InvalidOperationException("Trend Y axis original choices changed");if(expected[j]==axes[i])selected=j;}
    if(selected<0)throw new InvalidOperationException("Requested Trend Y axis not in original popup");
    SendGridKey(popup,0x24);for(int j=0;j<selected;j++)SendGridKey(popup,0x28);
    if(SendMessageW(new IntPtr(popup),0x0188,IntPtr.Zero,IntPtr.Zero).ToInt32()!=selected)throw new InvalidOperationException("Trend Y axis keyboard choice readback differs");
    SendGridKey(popup,0x0D);
    ready=DateTime.UtcNow.AddSeconds(1);TrendChannelAxis[] after;
    do{after=ReadChannelAxes(n,dialog,main,title,labels,types);if(after[i].axis==axes[i])break;System.Threading.Thread.Sleep(20);}while(DateTime.UtcNow<ready);
    if(after[i].axis!=axes[i])throw new InvalidOperationException("Trend Y axis row did not accept requested choice");
    actions[i]=new {row=i+1,label=labels[i],before=current[i].axis,axis=axes[i],changed=true,method="accessible_cell_owned_popup_keyboard",coordinates=false};
   }
   var verified=ReadChannelAxes(n,dialog,main,title,labels,types);for(int i=0;i<axes.Length;i++)if(verified[i].axis!=axes[i])throw new InvalidOperationException("Trend Y axis assignment changed after row commit");
   return new {actions=actions,after_row_commit=verified,all_rows_verified=true};
  }
 }
}
