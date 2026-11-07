using System;using System.Collections.Generic;using System.Runtime.InteropServices;using System.Threading;using Accessibility;
namespace PLCCode.Weinview {
 public sealed class NumericAddressTypeSnapshot {public long Hwnd{get;set;}public string Value{get;set;}public string NativeValue{get;set;}public string[] Items{get;set;}}
 // Only the actual small Qt address-type combo. No LW/RW assumptions, coordinates,
 // keyboard fallback or whole-window accessibility traversal. External COM watchdog required.
 public sealed class NumericAddressTypeControls {
  readonly NativeControls native;readonly string dialogTitle;
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible a);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll")]static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);
  long MenuPopup(long dialog,long qt){long found=0;foreach(var w in native.EnumTopWindows()){if(w.Class!="#32770"||w.Title!=""||!w.Visible||!w.Enabled||GetWindow(new IntPtr(w.Hwnd),4).ToInt64()!=dialog||GetParent(new IntPtr(w.Hwnd)).ToInt64()!=dialog)continue;if(found!=0)throw new InvalidOperationException("Owned address menu popup is ambiguous.");found=w.Hwnd;}return found;}
  long OwnedTagPopup(long dialog){uint dialogPid;GetWindowThreadProcessId(new IntPtr(dialog),out dialogPid);if(dialogPid==0)throw new InvalidOperationException("Native Address owner PID unavailable.");long found=0;foreach(var w in native.EnumTopWindows()){if(w.Class!="#32770"||w.Title!=""||!w.Visible||w.Pid!=(int)dialogPid)continue;long owner=GetWindow(new IntPtr(w.Hwnd),4).ToInt64(),parent=GetParent(new IntPtr(w.Hwnd)).ToInt64();if(owner!=dialog&&parent!=dialog)continue;if(found!=0)throw new InvalidOperationException("Owned native Tag popup is ambiguous.");found=w.Hwnd;}return found;}
  public long CurrentMenuPopup(long dialog,long qt){Guard(dialog,qt,false);long popup=MenuPopup(dialog,qt);if(popup==0)throw new InvalidOperationException("Exact owned numeric menu popup unavailable.");return popup;}  public NumericAddressTypeControls(NativeControls n) : this(n,"数值的属性") {}
  public NumericAddressTypeControls(NativeControls n,string expectedDialogTitle){if(n==null)throw new ArgumentNullException("n");if(expectedDialogTitle!="数值的属性"&&expectedDialogTitle!="新增 数值"&&expectedDialogTitle!="地址"&&expectedDialogTitle!="新增 项目选单"&&expectedDialogTitle!="项目选单的属性")throw new ArgumentException("Numeric dialog title outside exact allowlist.");native=n;dialogTitle=expectedDialogTitle;}
  void Guard(long dialog,long qt,bool writing){WindowInfo d=null;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog)d=w;if(d==null||d.Class!="#32770"||d.Title!=dialogTitle||!d.Visible)throw new InvalidOperationException("Exact owned visible numeric property dialog required.");if(!d.Enabled&&(writing||(dialogTitle=="地址"?OwnedTagPopup(dialog):MenuPopup(dialog,qt))==0))throw new InvalidOperationException("Disabled numeric parent requires its unique owned menu popup for read-only inspection.");int count=0;foreach(var w in native.EnumChildControls(dialog))if(w.Hwnd==qt&&w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled)count++;if(count!=1)throw new InvalidOperationException("Owned small Qt address control unavailable.");}
  static object Child(IAccessible a,int index){var b=new object[1];int got;int h=AccessibleChildren(a,index,1,b,out got);if(h<0)Marshal.ThrowExceptionForHR(h);if(got!=1)throw new InvalidOperationException("Qt address item disappeared.");return b[0];}
  static int Role(IAccessible a,int id){return Convert.ToInt32(a.get_accRole(id));}
  IAccessible Combo(long qt){IAccessible a;Guid g=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int h=AccessibleObjectFromWindow(new IntPtr(qt),0xFFFFFFFC,ref g,out a);if(h!=0||a==null)throw new InvalidOperationException("Numeric address MSAA root HRESULT "+h);for(int depth=0;depth<2;depth++){if(Role(a,0)!=10||a.accChildCount!=1)return null;a=Child(a,0) as IAccessible;if(a==null)return null;}if(Role(a,0)!=46||a.accChildCount!=1)return null;return a;}
  NumericAddressTypeSnapshot Snapshot(long dialog,long qt,string requiredType,out IAccessible combo,out IAccessible list){Guard(dialog,qt,false);combo=Combo(qt);list=null;if(combo==null)return null;list=Child(combo,0) as IAccessible;if(list==null||Role(list,0)!=33)return null;int count=list.accChildCount;if(count<1||count>128)throw new InvalidOperationException("Qt address type count outside 1..128.");var items=new List<string>();var unique=new HashSet<string>(StringComparer.Ordinal);for(int i=0;i<count;i++){object c=Child(list,i);IAccessible a=c as IAccessible;int id=0;if(a==null){if(!(c is int))throw new InvalidOperationException("Address type item representation changed.");a=list;id=(int)c;}if(Role(a,id)!=34)return null;string name=a.get_accName(id);if(String.IsNullOrEmpty(name)||name.Length>256||name.IndexOf('\0')>=0||!unique.Add(name))throw new InvalidOperationException("Address type item absent, oversized or duplicated.");items.Add(name);}if(list.accChildCount!=count)throw new InvalidOperationException("Address type list changed during read.");if(requiredType!=null&&!unique.Contains(requiredType))return null;string value=combo.get_accValue(0);if(String.IsNullOrEmpty(value)||!unique.Contains(value))return null;Guard(dialog,qt,false);return new NumericAddressTypeSnapshot{Hwnd=qt,Value=value,NativeValue=value,Items=items.ToArray()};}
  public NumericAddressTypeSnapshot Inspect(long dialog,long qt,string requiredType){if(String.IsNullOrEmpty(requiredType)||requiredType.Length>256)throw new ArgumentException("Exact required type label is required.");IAccessible combo,list;return Snapshot(dialog,qt,requiredType,out combo,out list);}
  public NumericAddressTypeSnapshot InspectAny(long dialog,long qt){IAccessible combo,list;return Snapshot(dialog,qt,null,out combo,out list);}
  public NumericAddressTypeSnapshot InspectAddressTagDisplayAny(long dialog,long qt){if(dialogTitle!="地址")throw new InvalidOperationException("Original Address dialog required for native Tag display.");Guard(dialog,qt,false);var combo=Combo(qt);if(combo==null)return null;var list=Child(combo,0) as IAccessible;if(list==null||Role(list,0)!=33||list.accChildCount<1||list.accChildCount>128)return null;string raw=combo.get_accValue(0);if(String.IsNullOrEmpty(raw)||raw.Length>512||raw.IndexOf('\0')>=0)return null;Guard(dialog,qt,false);return new NumericAddressTypeSnapshot{Hwnd=qt,Value=raw,NativeValue=raw,Items=new string[0]};}
  public NumericAddressTypeSnapshot ConfirmAddressTagDisplay(long dialog,long qt,string tagName,string exactNativeDisplay){if(String.IsNullOrEmpty(tagName)||String.IsNullOrEmpty(exactNativeDisplay)||exactNativeDisplay.Length>512)throw new ArgumentException("Exact native Tag name/display required.");var observed=InspectAddressTagDisplayAny(dialog,qt);if(observed==null||!String.Equals(observed.NativeValue,exactNativeDisplay,StringComparison.Ordinal))return null;observed.Value=tagName;return observed;}
  [StructLayout(LayoutKind.Sequential)]struct P{public int x,y;}
  [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref P p);
  [DllImport("user32.dll",SetLastError=true)]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  sealed class TagNode {public IAccessible Acc;public int Id;}
  void WalkTag(IAccessible a,int id,int depth,ref int budget,List<TagNode> found){
   if(++budget>4096||depth>16)throw new InvalidOperationException("Native Tag popup accessibility traversal exceeded bound.");
   found.Add(new TagNode{Acc=a,Id=id});if(id!=0)return;
   int count=a.accChildCount;if(count<0||count>1024)throw new InvalidOperationException("Native Tag popup branch exceeded bound.");
   for(int i=0;i<count;i++){object c=Child(a,i);if(c is IAccessible)WalkTag((IAccessible)c,0,depth+1,ref budget,found);else if(c is int)WalkTag(a,(int)c,depth+1,ref budget,found);else throw new InvalidOperationException("Native Tag popup child representation changed.");}
  }
  List<TagNode> TagNodes(long popup,out long qt){
   qt=0;foreach(var w in native.EnumChildControls(popup))if(w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){if(qt!=0)throw new InvalidOperationException("Native Tag popup Qt child ambiguous.");qt=w.Hwnd;}
   if(qt==0)throw new InvalidOperationException("Native Tag popup Qt child absent.");
   IAccessible root;Guid g=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int hr=AccessibleObjectFromWindow(new IntPtr(qt),0xFFFFFFFC,ref g,out root);if(hr!=0||root==null)throw new InvalidOperationException("Native Tag popup accessibility root absent.");
   int budget=0;var nodes=new List<TagNode>();WalkTag(root,0,0,ref budget,nodes);return nodes;
  }
  static string TagName(TagNode n){try{return n.Acc.get_accName(n.Id);}catch{return null;}}
  static string TagValue(TagNode n){try{return n.Acc.get_accValue(n.Id);}catch{return null;}}
  static int TagState(TagNode n){return Convert.ToInt32(n.Acc.get_accState(n.Id));}
  static TagNode OneTagNode(List<TagNode> nodes,int role,string name,string value,bool readOnly){TagNode one=null;foreach(var n in nodes){if(Role(n.Acc,n.Id)!=role)continue;int state=TagState(n);if(readOnly&&(state&64)==0)continue;if(name!=null&&TagName(n)!=name)continue;if(value!=null&&TagValue(n)!=value)continue;if(one!=null)throw new InvalidOperationException("Native Tag popup semantic target duplicated.");one=n;}return one;}
  static string ReadOnlyTagValue(List<TagNode> nodes){string value=null;foreach(var n in nodes){if(Role(n.Acc,n.Id)!=42||(TagState(n)&64)==0)continue;string candidate=TagValue(n);if(String.IsNullOrEmpty(candidate))continue;if(value!=null&&value!=candidate)throw new InvalidOperationException("Native Tag popup read-only values ambiguous.");value=candidate;}return value;}
  string AddressValue(long qt){try{var combo=Combo(qt);return combo==null?"<combo unavailable>":(combo.get_accValue(0)??"<null>");}catch(Exception e){return "<read error "+e.GetType().Name+">";}}
  void SearchTag(long dialog,long comboQt,long popup,long qt,List<TagNode> nodes,string target){
   TagNode field=null;foreach(var n in nodes){if(Role(n.Acc,n.Id)!=42||(TagState(n)&64)!=0||n.Acc.get_accDefaultAction(n.Id)!="SetFocus")continue;if(field!=null)throw new InvalidOperationException("Native Tag popup search field ambiguous.");field=n;}
   if(field==null)throw new InvalidOperationException("Native Tag popup editable search field absent.");
   if(GetForegroundWindow().ToInt64()!=popup&&GetForegroundWindow().ToInt64()!=qt)throw new InvalidOperationException("Native Tag popup must own foreground for search.");
   field.Acc.accDoDefaultAction(field.Id);if((TagState(field)&4)==0)throw new InvalidOperationException("Native Tag popup search focus not verified.");
   try{field.Acc.set_accValue(field.Id,target);}catch(Exception e){throw new InvalidOperationException("Native Tag popup search cannot accept exact text.",e);}
   if(TagValue(field)!=target||OwnedTagPopup(dialog)!=popup)throw new InvalidOperationException("Native Tag popup exact search readback differs.");
  }
  NumericAddressTypeSnapshot CommitNativeTagPopup(long dialog,long comboQt,long popup,string expectedBefore,string target,string exactNativeDisplay){
   SetProcessDPIAware();if(OwnedTagPopup(dialog)!=popup)throw new InvalidOperationException("Native Tag popup identity changed.");
   long qt;var nodes=TagNodes(popup,out qt);TagNode row=null;
   foreach(var n in nodes){if(Role(n.Acc,n.Id)!=29||TagName(n)!=target)continue;if(row!=null)throw new InvalidOperationException("Exact native Tag Name cell duplicated.");row=n;}
   if(row==null||(TagState(row)&0x10000)!=0){SearchTag(dialog,comboQt,popup,qt,nodes,target);nodes=TagNodes(popup,out qt);row=null;foreach(var n in nodes){if(Role(n.Acc,n.Id)!=29||TagName(n)!=target)continue;if(row!=null)throw new InvalidOperationException("Filtered native Tag Name cell duplicated.");row=n;}}
   if(row==null||row.Acc.get_accDefaultAction(row.Id)!="Toggle"||(TagState(row)&0x18001)!=0)throw new InvalidOperationException("Visible exact native Tag table row unavailable.");
    row.Acc.accDoDefaultAction(row.Id);
    DateTime selectionDeadline=DateTime.UtcNow.AddSeconds(3);bool selected=false;string displayedTag=null;
    do{
     long current=OwnedTagPopup(dialog);
     if(current==0){var closed=ConfirmAddressTagDisplay(dialog,comboQt,target,exactNativeDisplay);if(closed!=null)return closed;throw new InvalidOperationException("Native Tag popup closed after Name click; address selector="+AddressValue(comboQt)+", expected="+exactNativeDisplay+".");}
     if(current!=popup)throw new InvalidOperationException("Native Tag popup identity changed after row action.");
     nodes=TagNodes(popup,out qt);displayedTag=ReadOnlyTagValue(nodes);var displayed=OneTagNode(nodes,42,null,target,true);
    if(displayed!=null){
     var ok=OneTagNode(nodes,43,"Ok",null,false);if(ok==null||ok.Acc.get_accDefaultAction(ok.Id)!="Press")throw new InvalidOperationException("Native Tag popup Ok action absent.");ok.Acc.accDoDefaultAction(ok.Id);selected=true;break;
    }
    Thread.Sleep(50);
   }while(DateTime.UtcNow<selectionDeadline);
    if(!selected)throw new InvalidOperationException("Native Tag Name click did not update read-only Tag field; displayed="+(displayedTag??"<unavailable>")+", expected="+target+".");
    DateTime deadline=DateTime.UtcNow.AddSeconds(3);do{if(OwnedTagPopup(dialog)==0){WindowInfo parent=null;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog)parent=w;if(parent==null||!parent.Enabled)throw new InvalidOperationException("Native Tag popup closed without enabled Address parent.");var after=ConfirmAddressTagDisplay(dialog,comboQt,target,exactNativeDisplay);if(after!=null)return after;throw new InvalidOperationException("Native Tag popup closed without exact selector value; displayed="+(displayedTag??"<unavailable>")+", address selector="+AddressValue(comboQt)+", expected="+exactNativeDisplay+".");}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Native Tag popup did not close after exact selection.");
  }
  public NumericAddressTypeSnapshot CommitVisibleMenuExact(long dialog,long comboQt,long popup,string expectedBefore,string target,string bridgePath){
   SetProcessDPIAware();if(CurrentMenuPopup(dialog,comboQt)!=popup)throw new InvalidOperationException("Numeric menu popup identity differs.");
   // SelectExact verifies the source before ShowMenu. Reading the disabled
   // parent's MSAA combo while its modal popup is open can block Qt's event loop.
   long main=0;foreach(var w in native.EnumTopWindows())if(w.Class=="EasyBuilderPro"&&w.Visible){if(main!=0)throw new InvalidOperationException("Owned editor main window is ambiguous.");main=w.Hwnd;}
   if(main==0||String.IsNullOrEmpty(bridgePath))throw new InvalidOperationException("Owned editor and numeric type element bridge required.");
   // QListWidget accessibility Toggle only selects a row. The original editor
   // commits through itemClicked; invoke its exact model item once.
   native.InvokeQtElement(main,bridgePath,"numeric-type-select:"+dialog+"|"+popup+"|"+target);
   DateTime deadline=DateTime.UtcNow.AddSeconds(3);do{bool present=false,enabled=false;foreach(var w in native.EnumTopWindows()){if(w.Hwnd==popup)present=true;if(w.Hwnd==dialog)enabled=w.Enabled;}if(!present&&enabled){var after=Inspect(dialog,comboQt,target);if(after!=null&&after.Value==target)return after;throw new InvalidOperationException("Closed menu did not commit exact combo value.");}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);throw new InvalidOperationException("Menu close/parent enable/value commit not verified; no retry.");
  }  public NumericAddressTypeSnapshot OpenMenuExact(long dialog,long qt,string expectedBefore){
   IAccessible combo,list;var before=Snapshot(dialog,qt,expectedBefore,out combo,out list);
   if(before==null||before.Value!=expectedBefore)throw new InvalidOperationException("Qt address menu before-value differs.");
   if(combo.get_accDefaultAction(0)!="ShowMenu")throw new InvalidOperationException("Qt address combo ShowMenu contract differs.");
   Guard(dialog,qt,true);combo.accDoDefaultAction(0);
   // ShowMenu disables its parent before the owned popup becomes visible.
   // Wait for that one popup instead of inspecting the transient disabled state.
   DateTime deadline=DateTime.UtcNow.AddSeconds(3);while(MenuPopup(dialog,qt)==0&&DateTime.UtcNow<deadline)Thread.Sleep(25);
   if(MenuPopup(dialog,qt)==0)throw new InvalidOperationException("Exact owned address menu did not appear; no retry.");
   return before; // Menu opened once; the committed value is read after closure.
  }  public NumericAddressTypeSnapshot SelectExact(long dialog,long qt,string expectedBefore,string target,string bridgePath){
   IAccessible combo,list;var before=Snapshot(dialog,qt,target,out combo,out list);
   if(before==null||before.Value!=expectedBefore)throw new InvalidOperationException("Qt address type before-value differs.");
   if(before.Value==target)return before;
   OpenMenuExact(dialog,qt,expectedBefore); // One ShowMenu action, never a hidden-item Toggle.
   DateTime deadline=DateTime.UtcNow.AddSeconds(3);long popup=0;
   do{popup=MenuPopup(dialog,qt);if(popup!=0)break;Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   if(popup==0)throw new InvalidOperationException("Exact owned address menu did not appear; no retry.");
   return CommitVisibleMenuExact(dialog,qt,popup,expectedBefore,target,bridgePath);
  }
   public NumericAddressTypeSnapshot SelectVisibleMenuExact(long dialog,long qt,string expectedBefore,string target,string exactNativeDisplay,long mainHwnd,string bridgePath){
    if(String.IsNullOrEmpty(target)||target.Length>256)throw new ArgumentException("Exact native Tag name required.");
    if(String.IsNullOrEmpty(exactNativeDisplay)||exactNativeDisplay.Length>512||exactNativeDisplay!=target&&!exactNativeDisplay.StartsWith(target+" (",StringComparison.Ordinal))throw new ArgumentException("Exact native Tag display derived from same-project CSV required.");
    var before=InspectAddressTagDisplayAny(dialog,qt);var combo=Combo(qt);
    if(before==null||before.NativeValue!=expectedBefore||combo==null)throw new InvalidOperationException("Native Tag selector source differs.");
    if(before.NativeValue==exactNativeDisplay)return ConfirmAddressTagDisplay(dialog,qt,target,exactNativeDisplay);
   if(combo.get_accDefaultAction(0)!="ShowMenu")throw new InvalidOperationException("Native Tag combo ShowMenu contract differs.");
   Guard(dialog,qt,true);combo.accDoDefaultAction(0);
   DateTime deadline=DateTime.UtcNow.AddSeconds(3);long popup=0;
   do{popup=OwnedTagPopup(dialog);if(popup!=0)break;Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   if(popup==0)throw new InvalidOperationException("Native Tag menu did not appear; no retry.");
    native.InvokeQtElement(mainHwnd,bridgePath,"tag-select:"+target);
    deadline=DateTime.UtcNow.AddSeconds(3);
    do{if(OwnedTagPopup(dialog)==0){var after=ConfirmAddressTagDisplay(dialog,qt,target,exactNativeDisplay);if(after!=null)return after;throw new InvalidOperationException("Native tag selection did not commit the exact address display.");}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
    throw new InvalidOperationException("Native tag confirmation did not close its popup.");
  }
 }
}
