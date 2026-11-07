using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public sealed class OptionListGridRow {
  public int index;
  public string item;
  public string value;
  public string text;
  public bool error;
 }
 public sealed class OptionListGridSnapshot {
  public long grid_hwnd;
  public OptionListGridRow[] rows;
 }
 public sealed class OptionListGridControls {
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible accessible,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr hwnd,StringBuilder name,int capacity);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern IntPtr SendMessageW(IntPtr hwnd,uint message,IntPtr wparam,IntPtr lparam);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern IntPtr SendMessageW(IntPtr hwnd,uint message,IntPtr wparam,string lparam);
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
  readonly NativeControls native;
  public OptionListGridControls(NativeControls native){if(native==null)throw new ArgumentNullException("native");this.native=native;}
  static IAccessible QtChild(IAccessible parent,int zeroIndex){var values=new object[1];int obtained;int hr=AccessibleChildren(parent,zeroIndex,1,values,out obtained);if(hr<0||obtained!=1||!(values[0] is IAccessible))throw new InvalidOperationException("Option List Qt MSAA child unavailable.");return (IAccessible)values[0];}
  static IAccessible CellObject(IAccessible row,int rowNumber,int column){
   var cell=row.get_accChild(column) as IAccessible;
   if(cell==null||cell.get_accName(0)!="Row "+rowNumber+", Column "+column||Convert.ToInt32(cell.get_accRole(0))!=29||cell.accChildCount!=1)throw new InvalidOperationException("Option List native mapping cell profile changed.");
   if(cell.get_accName(1)!="Row "+rowNumber+", Column "+column||Convert.ToInt32(cell.get_accRole(1))!=42)throw new InvalidOperationException("Option List native mapping cell child profile changed.");
   return cell;
  }
  static string Cell(IAccessible row,int rowNumber,int column){return CellObject(row,rowNumber,column).get_accValue(1)??"";}
  public OptionListGridSnapshot ReadRows(long dialog,string title){
   int pid=0;bool found=false;foreach(var window in native.EnumTopWindows())if(window.Hwnd==dialog){if(found||!window.Visible||!window.Enabled||window.Class!="#32770"||window.Title!=title)throw new InvalidOperationException("Exact owned Option List modal required.");pid=window.Pid;found=true;}
   if(!found||pid<=0)throw new InvalidOperationException("Option List modal disappeared.");
   long grid=0;foreach(var control in native.EnumChildControls(dialog))if(control.Id==1000&&control.Visible&&control.Enabled&&control.Class.StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)){if(grid!=0)throw new InvalidOperationException("Option List mapping grid ambiguous.");grid=control.Hwnd;}
   if(grid==0)throw new InvalidOperationException("Option List mapping grid unavailable.");
   uint owner;var className=new StringBuilder(128);if(GetWindowThreadProcessId(new IntPtr(grid),out owner)==0||owner!=(uint)pid||GetClassNameW(new IntPtr(grid),className,className.Capacity)==0||!className.ToString().StartsWith("BCGPGridCtrl:",StringComparison.Ordinal))throw new InvalidOperationException("Option List mapping grid ownership changed.");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(grid),0xfffffffc,ref iid,out root);
   if(hr<0||root==null||root.get_accName(0)!="GridControl"||Convert.ToInt32(root.get_accRole(0))!=24||root.accChildCount<2||root.accChildCount>257)throw new InvalidOperationException("Option List native mapping row count invalid.");
   var rows=new List<OptionListGridRow>();for(int i=1;i<=root.accChildCount;i++){
    var row=root.get_accChild(i) as IAccessible;if(row==null||row.get_accName(0)!="Row "+i||Convert.ToInt32(row.get_accRole(0))!=28||row.accChildCount!=3)throw new InvalidOperationException("Option List native mapping row changed.");
    rows.Add(new OptionListGridRow{index=i-1,item=Cell(row,i,1),value=Cell(row,i,2),text=Cell(row,i,3),error=i==root.accChildCount});
   }
   for(int i=0;i<rows.Count-1;i++)if(rows[i].item!=i.ToString(System.Globalization.CultureInfo.InvariantCulture))throw new InvalidOperationException("Option List ordinary item index changed.");
   if(rows[rows.Count-1].item!=(rows.Count-1).ToString(System.Globalization.CultureInfo.InvariantCulture)+" (error)")throw new InvalidOperationException("Option List dedicated error row changed.");
   return new OptionListGridSnapshot{grid_hwnd=grid,rows=rows.ToArray()};
  }
  IAccessible CountCombo(long dialog,string title,out IAccessible list){
   bool found=false;foreach(var window in native.EnumTopWindows())if(window.Hwnd==dialog){if(found||window.Class!="#32770"||window.Title!=title||!window.Visible||!window.Enabled)throw new InvalidOperationException("Exact owned Option List property dialog required.");found=true;}if(!found)throw new InvalidOperationException("Option List dialog disappeared.");
   long qt=0;foreach(var control in native.EnumChildControls(dialog))if(control.Class=="Qt5QWindowIcon"&&control.Visible&&control.Enabled){if(qt!=0)throw new InvalidOperationException("Option List Source Data Qt container ambiguous.");qt=control.Hwnd;}if(qt==0)throw new InvalidOperationException("Option List Source Data Qt container unavailable.");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible node;int hr=AccessibleObjectFromWindow(new IntPtr(qt),0xfffffffc,ref iid,out node);if(hr<0||node==null)throw new InvalidOperationException("Option List Source Data MSAA root unavailable.");
   for(int depth=0;depth<4;depth++){if(Convert.ToInt32(node.get_accRole(0))!=10||node.accChildCount!=(depth==3?7:1))throw new InvalidOperationException("Option List Source Data native Qt path changed.");if(depth<3){node=QtChild(node,0);}}
   var group=QtChild(node,6);if(Convert.ToInt32(group.get_accRole(0))!=20||group.get_accName(0)!="预设"||group.accChildCount!=2)throw new InvalidOperationException("Option List predefined source group changed.");
   var label=QtChild(group,0);var combo=QtChild(group,1);if(Convert.ToInt32(label.get_accRole(0))!=41||label.get_accName(0)!="项目数 :"||Convert.ToInt32(combo.get_accRole(0))!=46||combo.accChildCount!=1)throw new InvalidOperationException("Option List predefined item-count combo changed.");
   list=QtChild(combo,0);if(Convert.ToInt32(list.get_accRole(0))!=33||list.accChildCount<1||list.accChildCount>1024)throw new InvalidOperationException("Option List native item-count choice list invalid.");
   int count=list.accChildCount;foreach(int i in new int[]{0,count-1}){var item=QtChild(list,i);if(Convert.ToInt32(item.get_accRole(0))!=34||item.get_accName(0)!=(i+1).ToString(System.Globalization.CultureInfo.InvariantCulture))throw new InvalidOperationException("Option List item-count choice endpoints changed.");}
   return combo;
  }
  public int ReadPredefinedItemCount(long dialog,string title){IAccessible list;var combo=CountCombo(dialog,title,out list);int selected;if(!Int32.TryParse(combo.get_accValue(0),out selected)||selected<1||selected>list.accChildCount)throw new InvalidOperationException("Option List native predefined item count invalid.");return selected;
  }
  public int SelectPredefinedItemCount(long dialog,string title,int expectedBefore,int target){
   if(target<1)throw new ArgumentOutOfRangeException("target");
   IntPtr prior=SetThreadDpiAwarenessContext(new IntPtr(-4));if(prior==IntPtr.Zero)throw new InvalidOperationException("Per-monitor DPI context required for Option List count selection.");try{
    IAccessible list;var combo=CountCombo(dialog,title,out list);int count=list.accChildCount;if(target>count)throw new InvalidOperationException("Requested Option List count absent from native choices.");
    if(ReadPredefinedItemCount(dialog,title)!=expectedBefore)throw new InvalidOperationException("Option List predefined item count changed before selection.");if(target==expectedBefore)return target;
    if(combo.get_accDefaultAction(0)!="ShowMenu")throw new InvalidOperationException("Option List item-count menu action changed.");if(GetForegroundWindow().ToInt64()!=dialog)throw new InvalidOperationException("Foreground Option List dialog required before item-count selection.");
    combo.accDoDefaultAction(0);
    long popup=0;uint dialogPid;if(GetWindowThreadProcessId(new IntPtr(dialog),out dialogPid)==0)throw new InvalidOperationException("Owned Option List PID unavailable.");var deadline=DateTime.UtcNow.AddSeconds(3);
    do{foreach(var window in native.EnumTopWindows())if(window.Class=="Qt5QWindowPopupDropShadowSaveBits"&&window.Visible&&window.Enabled){uint owner;if(GetWindowThreadProcessId(new IntPtr(window.Hwnd),out owner)==0||owner!=dialogPid)continue;if(popup!=0&&popup!=window.Hwnd)throw new InvalidOperationException("Option List count popup ambiguous.");popup=window.Hwnd;}if(popup!=0)break;Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
    if(popup==0)throw new InvalidOperationException("Option List count menu did not appear; no replay.");
    var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(popup),0xfffffffc,ref iid,out root);if(hr<0||root==null||Convert.ToInt32(root.get_accRole(0))!=19||root.accChildCount<1)throw new InvalidOperationException("Option List count popup MSAA profile changed.");
    var popupList=QtChild(root,0);if(Convert.ToInt32(popupList.get_accRole(0))!=33||popupList.accChildCount!=count)throw new InvalidOperationException("Option List popup choices changed.");var item=QtChild(popupList,target-1);if(Convert.ToInt32(item.get_accRole(0))!=34||item.get_accName(0)!=target.ToString(System.Globalization.CultureInfo.InvariantCulture))throw new InvalidOperationException("Requested Option List popup item changed.");
    int x,y,width,height;item.accLocation(out x,out y,out width,out height,0);Rect bounds;if(!GetWindowRect(new IntPtr(popup),out bounds)||width<3||height<3)throw new InvalidOperationException("Requested Option List popup item geometry unavailable.");
    bool within=x>=bounds.left&&y>=bounds.top&&x+width<=bounds.right&&y+height<=bounds.bottom;
    if(!within){uint dpi=GetDpiForWindow(new IntPtr(popup));if(dpi<96||dpi>768)throw new InvalidOperationException("Owned Option List popup DPI unavailable.");double factor=96.0/dpi;x=(int)Math.Round(x*factor);y=(int)Math.Round(y*factor);width=(int)Math.Round(width*factor);height=(int)Math.Round(height*factor);within=x>=bounds.left&&y>=bounds.top&&x+width<=bounds.right&&y+height<=bounds.bottom;}
    if(!within)throw new InvalidOperationException("Requested Option List count is outside visible native popup; no speculative scroll.");
    var point=new Point{x=x+width/2,y=y+height/2};Rect client;if(!ScreenToClient(new IntPtr(popup),ref point)||!GetClientRect(new IntPtr(popup),out client)||point.x<0||point.y<0||point.x>=client.right||point.y>=client.bottom||point.x>32767||point.y>32767||GetForegroundWindow().ToInt64()!=popup)throw new InvalidOperationException("Option List popup target/foreground changed.");
    var packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(popup),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(popup),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Owned Option List count popup click failed; no retry.");
    deadline=DateTime.UtcNow.AddSeconds(3);do{bool stillOpen=false;foreach(var window in native.EnumTopWindows())if(window.Hwnd==popup&&window.Visible)stillOpen=true;if(!stillOpen){int after=ReadPredefinedItemCount(dialog,title);if(after!=target)throw new InvalidOperationException("Option List count popup closed without requested native value.");return after;}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
    throw new InvalidOperationException("Option List count popup did not close; no replay.");
   }finally{SetThreadDpiAwarenessContext(prior);}
  }
  public long BeginCellEdit(long dialog,string title,int itemIndex,int column,string expectedBefore){
   return BeginCellEditCore(dialog,title,itemIndex,column,expectedBefore,false);
  }
  public long BeginErrorTextEdit(long dialog,string title,int itemIndex,string expectedBefore){
   return BeginCellEditCore(dialog,title,itemIndex,3,expectedBefore,true);
  }
  long BeginCellEditCore(long dialog,string title,int itemIndex,int column,string expectedBefore,bool dedicatedErrorText){
   if(itemIndex<0||column!=2&&column!=3||expectedBefore==null)throw new ArgumentException("Exact Option List data/text cell required.");
   IntPtr prior=SetThreadDpiAwarenessContext(new IntPtr(-4));if(prior==IntPtr.Zero)throw new InvalidOperationException("Per-monitor DPI context required for Option List grid input.");try{
   var snapshot=ReadRows(dialog,title);if(dedicatedErrorText){if(itemIndex!=snapshot.rows.Length-1||column!=3)throw new InvalidOperationException("Exact dedicated Option List error-text row required.");}else if(itemIndex>=snapshot.rows.Length-1)throw new InvalidOperationException("Option List error row is not an ordinary item.");
   int rowNumber=itemIndex+1;var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(snapshot.grid_hwnd),0xfffffffc,ref iid,out root);
   if(hr<0||root==null||root.accChildCount!=snapshot.rows.Length||GetForegroundWindow().ToInt64()!=dialog)throw new InvalidOperationException("Fresh foreground Option List grid required.");
   var row=root.get_accChild(rowNumber) as IAccessible;if(row==null||row.accChildCount!=3)throw new InvalidOperationException("Option List row changed before edit.");
   var cell=CellObject(row,rowNumber,column);if((cell.get_accValue(1)??"")!=expectedBefore)throw new InvalidOperationException("Option List cell changed before edit.");
   int x,y,width,height;cell.accLocation(out x,out y,out width,out height,1);if(width<4||height<4)throw new InvalidOperationException("Option List cell geometry unavailable.");
   var point=new Point{x=x+width/2,y=y+height/2};Rect bounds;if(!ScreenToClient(new IntPtr(snapshot.grid_hwnd),ref point)||!GetClientRect(new IntPtr(snapshot.grid_hwnd),out bounds)||point.x<0||point.y<0||point.x>=bounds.right||point.y>=bounds.bottom||point.x>32767||point.y>32767)throw new InvalidOperationException("Option List cell outside exact owned grid.");
   long packed=(point.y<<16)|(point.x&65535);uint[] messages={0x201,0x202,0x203,0x202};uint[] flags={1,0,1,0};for(int i=0;i<messages.Length;i++)if(!PostMessageW(new IntPtr(snapshot.grid_hwnd),messages[i],new UIntPtr(flags[i]),new IntPtr(packed)))throw new InvalidOperationException("One owned Option List cell doubleclick failed; no replay.");
   var deadline=DateTime.UtcNow.AddSeconds(2);do{
    var editors=new List<long>();foreach(var control in native.EnumChildControls(dialog))if(control.Id==1&&control.Class=="Edit"&&control.Visible&&control.Enabled)editors.Add(control.Hwnd);
    if(editors.Count>1)throw new InvalidOperationException("Option List mapping editor ambiguous.");if(editors.Count==1){uint owner;GetWindowThreadProcessId(new IntPtr(editors[0]),out owner);uint dialogOwner;GetWindowThreadProcessId(new IntPtr(dialog),out dialogOwner);if(owner!=dialogOwner)throw new InvalidOperationException("Option List editor owner changed.");return editors[0];}
    Thread.Sleep(50);
   }while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Option List native mapping editor did not appear; no retry.");
   }finally{SetThreadDpiAwarenessContext(prior);}
  }
  public void ReplaceEditorText(long dialog,long editor,string replacement){
   if(replacement==null||editor==0)throw new ArgumentException("Exact Option List editor and replacement required.");
   bool found=false;foreach(var control in native.EnumChildControls(dialog))if(control.Hwnd==editor&&control.Id==1&&control.Class=="Edit"&&control.Visible&&control.Enabled){if(found)throw new InvalidOperationException("Option List editor duplicated.");found=true;}
   if(!found)throw new InvalidOperationException("Exact visible Option List editor disappeared.");
   SendMessageW(new IntPtr(editor),0xB1,IntPtr.Zero,new IntPtr(-1));
   SendMessageW(new IntPtr(editor),0xC2,new IntPtr(1),replacement);
   if(native.GetControlText(editor,4096)!=replacement)throw new InvalidOperationException("Option List native editor text differs before commit.");
  }
 }
}
