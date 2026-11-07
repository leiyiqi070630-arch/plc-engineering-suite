using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;
using Accessibility;

public sealed class WindowCopyControls {
 readonly dynamic native;
 public WindowCopyControls(object owner) { native=owner; }
 [StructLayout(LayoutKind.Sequential)] struct Rect { public int l,t,r,b; }
 [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] values,out int got);
 [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out Rect r);
 [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll")] static extern bool IsChild(IntPtr p,IntPtr c);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr h);
 public static bool ScrollOwnedTreeRowOnce(long main,long tree,int pid,long ticks,string exe,int x,int y,int width,int height) {
  using(var process=Process.GetProcessById(pid))if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Owned vendor tree process lease differs");
  uint mp,tp;GetWindowThreadProcessId(new IntPtr(main),out mp);GetWindowThreadProcessId(new IntPtr(tree),out tp);Rect bounds;
  if(mp!=(uint)pid||tp!=(uint)pid||!IsChild(new IntPtr(main),new IntPtr(tree))||!IsWindowVisible(new IntPtr(tree))||!IsWindowEnabled(new IntPtr(tree))||!GetWindowRect(new IntPtr(tree),out bounds)||bounds.r-bounds.l<40||bounds.b-bounds.t<40)throw new Exception("Exact owned visible native directory tree required");
  if(width<2||height<2)throw new Exception("Actual native directory row bounds required");
  int centerY=y+height/2;
  if(centerY>=bounds.t+8&&centerY<bounds.b-8)return true;
  int delta=centerY>=bounds.b?-120:120,atX=(bounds.l+bounds.r)/2,atY=(bounds.t+bounds.b)/2;
  if(atX<0||atY<0||atX>32767||atY>32767)throw new Exception("Native directory wheel point outside screen");
  uint wheel=unchecked((uint)(delta<<16));
  if(!PostMessageW(new IntPtr(tree),0x20a,new UIntPtr(wheel),new IntPtr((atY<<16)|(atX&65535))))throw new Exception("Single native directory wheel delivery failed");
  if(!PostMessageW(new IntPtr(tree),0x115,new UIntPtr((uint)(delta<0?1:0)),IntPtr.Zero))throw new Exception("Single native directory scrollbar delivery failed");
  Thread.Sleep(100);return false;
 }
 static IAccessible Child(IAccessible a,int index) {
  var items=new object[1];int got;int hr=AccessibleChildren(a,index,1,items,out got);
  if(hr<0)Marshal.ThrowExceptionForHR(hr);
  if(got!=1||!(items[0] is IAccessible))throw new Exception("Observed interface child required");
  return (IAccessible)items[0];
 }
 static int Role(IAccessible a) { return Convert.ToInt32(a.get_accRole(0)); }
 static IAccessible UniqueRole(IAccessible root,int role,string action) {
  IAccessible found=null;var pending=new Queue<IAccessible>();pending.Enqueue(root);
  while(pending.Count!=0){
   var node=pending.Dequeue();
   if(Role(node)==role&&(action==null||String.Equals(node.get_accDefaultAction(0),action,StringComparison.Ordinal))){
    if(found!=null)throw new Exception("Ambiguous native destination accessibility element");found=node;continue;
   }
   if(role==42&&Role(node)==33)continue;
   for(int i=0;i<node.accChildCount;i++){
    var items=new object[1];int got;int hr=AccessibleChildren(node,i,1,items,out got);
    if(hr<0)Marshal.ThrowExceptionForHR(hr);
    if(got==1&&items[0] is IAccessible)pending.Enqueue((IAccessible)items[0]);
   }
  }
  if(found==null)throw new Exception("Native destination accessibility element unavailable");return found;
 }
 static int WindowNumber(string label) {
  if(String.IsNullOrWhiteSpace(label))return -1;
  int dot=label.IndexOf('.');if(dot<1||dot>5||dot+1>=label.Length||label[dot+1]!=' ')return -1;
  int number;return Int32.TryParse(label.Substring(0,dot),out number)?number:-1;
 }
 static IAccessible[] UnusedWindowRange(IAccessible list,int target,int count) {
  var found=new Dictionary<int,IAccessible>();
  for(int i=0;i<list.accChildCount;i++){
   var item=Child(list,i);int number=WindowNumber(item.get_accName(0));
   if(number<target||number>=target+count)continue;
   if(found.ContainsKey(number))throw new Exception("Duplicate native destination window number");found.Add(number,item);
  }
  var result=new IAccessible[count];
  for(int i=0;i<count;i++){
   int number=target+i;IAccessible item;
   if(!found.TryGetValue(number,out item))throw new Exception("Requested native destination window absent");
   if(Role(item)!=34||!String.Equals(item.get_accName(0),number+". [undefined window]",StringComparison.Ordinal)||(Convert.ToInt32(item.get_accState(0))&1)!=0)throw new Exception("Requested native destination is not an available empty window");
   result[i]=item;
  }
  return result;
 }
 static IAccessible Root(long h) {
  IAccessible a;Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");
  int hr=AccessibleObjectFromWindow(new IntPtr(h),0xfffffffc,ref iid,out a);
  if(hr!=0||a==null)throw new Exception("Original accessibility root unavailable");return a;
 }
 void Guard(long dialog,long qt,bool enabled) {
  int found=0,children=0;
  foreach(var w in native.EnumTopWindows()) {
   if(w.Visible&&w.Class=="#32770") {
    if(w.Hwnd!=dialog||w.Title!="窗口复制")throw new Exception("Unknown native modal");
    if(enabled&&!w.Enabled)throw new Exception("Window Copy must be enabled");found++;
   }
  }
  foreach(var w in native.EnumChildControls(dialog))if(w.Hwnd==qt&&w.Visible&&w.Enabled&&w.Class=="Qt5QWindowIcon")children++;
  if(found!=1||children!=1)throw new Exception("Unique owned copy destination required");
 }
 IAccessible Combo(long dialog,long qt,bool enabled) {
  Guard(dialog,qt,enabled);var combo=UniqueRole(Root(qt),46,"ShowMenu");
  var list=UniqueRole(combo,33,null);var edit=UniqueRole(combo,42,null);
  if(list.accChildCount<1||!String.Equals(edit.get_accValue(0),combo.get_accValue(0),StringComparison.Ordinal))throw new Exception("Observed original destination list differs");
  return combo;
 }
 public string Value(long dialog,long qt) { return Combo(dialog,qt,false).get_accValue(0); }
 public void OpenUnusedRangeMenu(long dialog,long qt,int target,int count) {
  var combo=Combo(dialog,qt,true);var list=UniqueRole(combo,33,null);
  if(target<10||target>1999||count<1||count>1990||target+count-1>1999)throw new Exception("Bounded ordinary destination range required");
  UnusedWindowRange(list,target,count);
  combo.accDoDefaultAction(0);
 }
 public long Popup(long dialog,long qt) {
  Guard(dialog,qt,false);uint dialogPid;GetWindowThreadProcessId(new IntPtr(dialog),out dialogPid);long found=0;
  foreach(var w in native.EnumTopWindows()) {
   if(!w.Visible||!w.Enabled||w.Class!="Qt5QWindowPopupDropShadowSaveBits"||w.Title!="EasyBuilder Pro")continue;
   uint popupPid;GetWindowThreadProcessId(new IntPtr(w.Hwnd),out popupPid);if(dialogPid==0||popupPid!=dialogPid)continue;
   try { UniqueRole(Root(w.Hwnd),33,null); } catch(Exception) { continue; }
   if(found!=0)throw new Exception("Ambiguous original destination popup");found=w.Hwnd;
  }
  return found;
 }
 public void CancelPopupOnce(long dialog,long qt) {
  long popup=Popup(dialog,qt);if(popup==0)return;
  if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(27),new IntPtr(1)))throw new Exception("Native menu cancellation delivery failed");
  DateTime until=DateTime.UtcNow.AddSeconds(3);
  while(Popup(dialog,qt)!=0){if(DateTime.UtcNow>=until)throw new Exception("Native menu cancellation not observed");Thread.Sleep(50);}
 }
 public string SelectVisibleUnusedRangeOnce(long dialog,long qt,long popup,int target,int count) {
  if(target<10||target>1999||count<1||count>1990||target+count-1>1999)throw new Exception("Bounded ordinary destination range required");
  string before=Value(dialog,qt);
  if(popup==0||Popup(dialog,qt)!=popup)throw new Exception("Original popup/current selection required");
  var list=UniqueRole(Root(popup),33,null);
  IAccessible chosen=UnusedWindowRange(list,target,count)[0];
  if(String.IsNullOrWhiteSpace(before)||chosen==null)throw new Exception("Native destination selection unavailable");
  string wanted=target+". [undefined window]";
  if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(36),new IntPtr(0x01470001))||!PostMessageW(new IntPtr(popup),0x101,new UIntPtr(36),new IntPtr(unchecked((int)0xC1470001))))throw new Exception("Native destination owned popup Home delivery failed");
  foreach(char character in target.ToString()+".")if(!PostMessageW(new IntPtr(popup),0x102,new UIntPtr((uint)character),new IntPtr(1)))throw new Exception("Native destination owned popup prefix delivery failed");
  DateTime selectionUntil=DateTime.UtcNow.AddSeconds(2);string selectedName=null;int selectedState=-1;
  do {
   if(Popup(dialog,qt)!=popup)throw new Exception("Native destination popup changed before exact target selection");
   try { chosen=UnusedWindowRange(UniqueRole(Root(popup),33,null),target,count)[0];selectedName=chosen.get_accName(0);selectedState=Convert.ToInt32(chosen.get_accState(0)); }
   catch(COMException e) { throw new Exception("Native destination selection readback unavailable: target="+wanted,e); }
   if(String.Equals(selectedName,wanted,StringComparison.Ordinal)&&(selectedState&6)==6)break;
   if(DateTime.UtcNow>=selectionUntil)throw new Exception("Native destination prefix did not select exact target: wanted="+wanted+" actual="+selectedName+" state=0x"+selectedState.ToString("X")+" combo="+Value(dialog,qt));
   Thread.Sleep(50);
  } while(true);
  if(Popup(dialog,qt)!=popup)throw new Exception("Native destination popup changed before Return commit");
  if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(13),new IntPtr(0x001C0001))||!PostMessageW(new IntPtr(popup),0x101,new UIntPtr(13),new IntPtr(unchecked((int)0xC01C0001))))throw new Exception("Native destination owned popup Return delivery failed");
  DateTime until=DateTime.UtcNow.AddSeconds(3);
  do { long current=Popup(dialog,qt);if(current==0){string value=Value(dialog,qt);if(String.Equals(value,wanted,StringComparison.Ordinal))return value;throw new Exception("Native destination selection readback differs after Return: wanted="+wanted+" actual="+value);}if(current!=popup)throw new Exception("Native destination popup changed after Return commit");Thread.Sleep(50); } while(DateTime.UtcNow<until);
  throw new Exception("Native destination Return not reflected by combo: target="+wanted+" state=0x"+selectedState.ToString("X"));
 }
}
