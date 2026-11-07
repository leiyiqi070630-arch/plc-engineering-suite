using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using Accessibility;
using PLC Engineering Suite.Weinview.Research;

namespace PLC Engineering Suite.Weinview {
 public static class NativeAddressReplaceControls {
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,out IAccessible value);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SendMessageTimeoutW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam,uint flags,uint timeout,out UIntPtr result);
  sealed class ScopeOption {public string Name;public IAccessible Accessible;public int Child;}
  sealed class ScopeTree {public IAccessible Combo;public int ComboChild;public readonly List<ScopeOption> Options=new List<ScopeOption>();public readonly HashSet<string> Seen=new HashSet<string>();}
  public sealed class Match {public string location;public string description;}
  public sealed class FindResult {public Match[] matches;public int match_count;public int native_item_count;}

  static void Dialog(NativeControls n,long dialog,int pid){
   if(n==null||pid<=0)throw new ArgumentException("Bound native controls and PID required.");
   int found=0;
   foreach(WindowInfo w in n.EnumTopWindows())if(w.Hwnd==dialog&&w.Pid==pid&&w.Class=="#32770"&&w.Title=="寻找/替换"&&w.Visible&&w.Enabled)found++;
   if(found!=1)throw new InvalidOperationException("Owned visible Find/Replace dialog required.");
  }
  static WindowInfo Control(NativeControls n,long dialog,int id,string cls){return n.FindUniqueControlWithoutLabel(dialog,id,cls);}
  static void Checkbox(NativeControls n,long dialog,int id,string label,bool expected){
   long hwnd=Control(n,dialog,id,"Button").Hwnd;
   if(n.GetCheckboxState(hwnd)!=(expected?1:0))n.ClickButton(dialog,id,label);
   for(int attempt=0;attempt<10;attempt++){
    if(n.GetCheckboxState(hwnd)==(expected?1:0))return;
    Thread.Sleep(50);
   }
   throw new InvalidOperationException("Find/Replace checkbox readback failed: "+id);
  }
  static void Radio(NativeControls n,NativePropertyCandidate p,long dialog,int id,string label){
   long hwnd=Control(n,dialog,id,"Button").Hwnd;
   // A new vendor dialog can expose its child HWNDs before the UI thread can
   // answer BM_GETCHECK. Observe readiness without replaying a tab or click.
   int state=0;var readyUntil=DateTime.UtcNow.AddSeconds(2);
   for(;;){
    try{state=p.GetRadioState(hwnd);break;}
    catch(InvalidOperationException error){
     if(error.Message!="Bound control timeout/failure"||DateTime.UtcNow>=readyUntil)throw;
     Thread.Sleep(50);
    }
   }
   if(state==1)return;
   n.ClickButton(dialog,id,label);
   var settledUntil=DateTime.UtcNow.AddSeconds(3);
   for(;;){
    try{if(p.GetRadioState(hwnd)==1)return;}
    catch(InvalidOperationException error){
     if(error.Message!="Bound control timeout/failure")throw;
     if(DateTime.UtcNow>=settledUntil)throw new InvalidOperationException("Find/Replace radio "+id+" did not finish its single posted mode change.",error);
    }
    if(DateTime.UtcNow>=settledUntil)throw new InvalidOperationException("Find/Replace radio readback failed: "+id);
    Thread.Sleep(50);
   }
  }
  static void WalkScope(IAccessible node,int child,int depth,ScopeTree tree){
   if(depth>16)throw new InvalidOperationException("Find/Replace scope tree depth exceeded.");
   IntPtr identity=Marshal.GetIUnknownForObject(node);
   string key=identity.ToInt64().ToString(System.Globalization.CultureInfo.InvariantCulture)+":"+child.ToString(System.Globalization.CultureInfo.InvariantCulture);
   Marshal.Release(identity);
   if(!tree.Seen.Add(key))return;
   int role=Convert.ToInt32(node.get_accRole(child));
   if(role==46){
    if(tree.Combo!=null)throw new InvalidOperationException("Ambiguous native scope combo.");
    tree.Combo=node;tree.ComboChild=child;
   }
   if(role==34){tree.Options.Add(new ScopeOption{Name=node.get_accName(child),Accessible=node,Child=child});return;}
   if(child!=0)return;
   int count=node.accChildCount;
   if(count<0)throw new InvalidOperationException("Native scope branch count invalid.");
   if(count==0)return;
   object[] children=new object[count];int obtained;
   int hr=AccessibleChildren(node,0,count,children,out obtained);
   if(hr<0)Marshal.ThrowExceptionForHR(hr);
   if(obtained!=count)throw new InvalidOperationException("Native scope tree changed during read.");
   foreach(object item in children){
    if(item is int)WalkScope(node,(int)item,depth+1,tree);
    else if(item is IAccessible)WalkScope((IAccessible)item,0,depth+1,tree);
    else throw new InvalidOperationException("Unknown native scope node.");
   }
  }
  static ScopeTree ReadScopeTree(long hwnd,bool requireCombo){
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root);
   if(hr<0||root==null)throw new InvalidOperationException("Native scope accessibility provider absent.");
   var tree=new ScopeTree();WalkScope(root,0,0,tree);
   if((requireCombo&&tree.Combo==null)||tree.Options.Count<1)throw new InvalidOperationException("Native scope combo/options absent.");
   return tree;
  }
  static ScopeTree ReadScope(NativeControls n,long dialog){return ReadScopeTree(Control(n,dialog,0,"Qt5QWindowIcon").Hwnd,true);}
  static long Popup(NativeControls n,long dialog){
   WindowInfo owner=null;foreach(WindowInfo w in n.EnumTopWindows())if(w.Hwnd==dialog)owner=w;
   if(owner==null)throw new InvalidOperationException("Owned Find/Replace dialog disappeared.");
   long found=0;
   foreach(WindowInfo w in n.EnumTopWindows()){
    if(w.Pid!=owner.Pid||!w.Visible||!w.Enabled||w.Class!="Qt5QWindowPopupDropShadowSaveBits"||w.Title!="EasyBuilder Pro")continue;
    if(found!=0)throw new InvalidOperationException("Native scope popup ambiguous.");
    found=w.Hwnd;
   }
   return found;
  }
  static void CancelPopupOnce(NativeControls n,long dialog,long popup){
   if(popup==0||Popup(n,dialog)!=popup)return;
   if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(27),new IntPtr(1)))throw new InvalidOperationException("Owned scope popup Escape delivery failed.");
   var until=DateTime.UtcNow.AddSeconds(3);
   while(Popup(n,dialog)==popup){if(DateTime.UtcNow>=until)throw new InvalidOperationException("Owned scope popup cancellation not observed.");Thread.Sleep(50);}
  }
  static void SelectScope(NativeControls n,long dialog,string scope,int windowNumber){
   if(String.IsNullOrWhiteSpace(scope))throw new ArgumentException("Scope required.");
   ScopeTree tree=ReadScope(n,dialog);ScopeOption chosen=null;
   foreach(ScopeOption option in tree.Options){
    bool match=(scope=="project"&&(option.Name=="整个工程文件"||option.Name=="Whole Project"||option.Name=="Entire Project"))||
     (scope=="current_window"&&(option.Name=="当前窗口"||option.Name=="Current Window"))||
     (scope=="window"&&windowNumber>=0&&Regex.IsMatch(option.Name??"","^"+windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+@"\.\s+"));
    if(!match)continue;
    if(chosen!=null)throw new InvalidOperationException("Requested native scope is ambiguous.");chosen=option;
   }
   if(chosen==null)throw new InvalidOperationException("Requested native scope option absent.");
   string selected=tree.Combo.get_accValue(tree.ComboChild);
   if(selected==chosen.Name)return;
   if(tree.Combo.get_accDefaultAction(tree.ComboChild)!="ShowMenu")throw new InvalidOperationException("Native scope combo ShowMenu action absent.");
   tree.Combo.accDoDefaultAction(tree.ComboChild);
   long popup=0;
   try{
    var openUntil=DateTime.UtcNow.AddSeconds(2);
    do{popup=Popup(n,dialog);if(popup!=0)break;Thread.Sleep(50);}while(DateTime.UtcNow<openUntil);
    if(popup==0)throw new InvalidOperationException("Owned scope popup did not open.");
    string prefix=scope=="window"?windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+".":chosen.Name;
    if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(36),new IntPtr(0x01470001))||
       !PostMessageW(new IntPtr(popup),0x101,new UIntPtr(36),new IntPtr(unchecked((int)0xC1470001))))throw new InvalidOperationException("Owned scope popup Home delivery failed.");
    foreach(char character in prefix)if(!PostMessageW(new IntPtr(popup),0x102,new UIntPtr((uint)character),new IntPtr(1)))throw new InvalidOperationException("Owned scope popup prefix delivery failed.");
    var selectUntil=DateTime.UtcNow.AddSeconds(2);bool exact=false;
    do{
     if(Popup(n,dialog)!=popup)throw new InvalidOperationException("Owned scope popup changed before selection.");
     ScopeTree popupTree=ReadScopeTree(popup,false);int focused=0;string focusedName=null;
     foreach(ScopeOption option in popupTree.Options)if((Convert.ToInt32(option.Accessible.get_accState(option.Child))&6)==6){focused++;focusedName=option.Name;}
     if(focused==1&&focusedName==chosen.Name){exact=true;break;}
     if(DateTime.UtcNow>=selectUntil)break;
     Thread.Sleep(50);
    }while(true);
    if(!exact)throw new InvalidOperationException("Native scope prefix did not select the exact option: "+chosen.Name);
    if(Popup(n,dialog)!=popup)throw new InvalidOperationException("Owned scope popup changed before Return.");
    if(!PostMessageW(new IntPtr(popup),0x100,new UIntPtr(13),new IntPtr(0x001C0001))||
       !PostMessageW(new IntPtr(popup),0x101,new UIntPtr(13),new IntPtr(unchecked((int)0xC01C0001))))throw new InvalidOperationException("Owned scope popup Return delivery failed.");
    var commitUntil=DateTime.UtcNow.AddSeconds(3);
    do{
     long current=Popup(n,dialog);
     if(current==0){tree=ReadScope(n,dialog);selected=tree.Combo.get_accValue(tree.ComboChild);if(selected==chosen.Name)return;throw new InvalidOperationException("Native scope committed value differs: "+selected);}
     if(current!=popup)throw new InvalidOperationException("Owned scope popup changed after Return.");
     Thread.Sleep(50);
    }while(DateTime.UtcNow<commitUntil);
    throw new InvalidOperationException("Native scope Return did not close the popup.");
   }catch{
    if(popup!=0)CancelPopupOnce(n,dialog,popup);
    throw;
   }
  }
  static void SelectComboIfChanged(NativeControls n,NativePropertyCandidate p,long dialog,int id,string expected){
   long hwnd=Control(n,dialog,id,"ComboBox").Hwnd;
   if(p.ComboSelected(hwnd)==expected)return;
   p.SelectComboExact(hwnd,expected);
  }
  public static void Configure(NativeControls n,NativePropertyCandidate p,long dialog,int pid,string addressKind,string device,string area,string address,string targetDevice,string targetArea,string targetAddress,string scope,int windowNumber){
   Dialog(n,dialog,pid);if(p==null)throw new ArgumentNullException("p");
   if(String.IsNullOrWhiteSpace(device)||String.IsNullOrWhiteSpace(area)||String.IsNullOrWhiteSpace(address)||String.IsNullOrWhiteSpace(targetDevice)||String.IsNullOrWhiteSpace(targetArea)||String.IsNullOrWhiteSpace(targetAddress))throw new ArgumentException("Source and target address fields required.");
   long tab=Control(n,dialog,1226,"SysTabControl32").Hwnd;string tabName=null;
   foreach(string name in p.TabNames(tab))if(name=="地址"){if(tabName!=null)throw new InvalidOperationException("Address tab ambiguous.");tabName=name;}
   if(tabName==null)throw new InvalidOperationException("Address tab absent.");p.SelectTabExact(tab,tabName);
   int radioId;string radioLabel;
   if(String.Equals(addressKind,"bit",StringComparison.OrdinalIgnoreCase)||addressKind=="位地址"){radioId=1610;radioLabel="位地址";}
   else if(String.Equals(addressKind,"word",StringComparison.OrdinalIgnoreCase)||addressKind=="字地址"){radioId=1611;radioLabel="字地址";}
   else throw new ArgumentException("addressKind must be bit or word.");
   Radio(n,p,dialog,radioId,radioLabel);
   Checkbox(n,dialog,1895,"范围",false);Checkbox(n,dialog,2649,"系统寄存器",false);Checkbox(n,dialog,2651,"系统寄存器",false);
   Checkbox(n,dialog,2648,"用户自定义标签",false);Checkbox(n,dialog,2650,"用户自定义标签",false);Radio(n,p,dialog,1282,"替换为");
   SelectComboIfChanged(n,p,dialog,1646,device);
   SelectComboIfChanged(n,p,dialog,1081,area);
   n.SetControlText(Control(n,dialog,1609,"Edit").Hwnd,address);
   SelectComboIfChanged(n,p,dialog,1647,targetDevice);
   SelectComboIfChanged(n,p,dialog,1084,targetArea);
   n.SetControlText(Control(n,dialog,1492,"Edit").Hwnd,targetAddress);
   SelectScope(n,dialog,scope,windowNumber);Dialog(n,dialog,pid);
  }
  public static void ConfigureRange(NativeControls n,NativePropertyCandidate p,long dialog,int pid,string addressKind,string device,string area,string address,string addressEnd,string targetDevice,string targetArea,string targetAddress,int shift,string scope,int windowNumber){
   if(String.IsNullOrWhiteSpace(addressEnd)||shift==0)throw new ArgumentException("Finite native address range and nonzero shift required.");
   Configure(n,p,dialog,pid,addressKind,device,area,address,targetDevice,targetArea,targetAddress,scope,windowNumber);
   Checkbox(n,dialog,1895,"范围",true);
   n.SetControlText(Control(n,dialog,1613,"Edit").Hwnd,addressEnd);
   Radio(n,p,dialog,2549,"偏移");
   // Shift to uses the destination range's first address. The caller retains
   // the calculated delta for exact per-reference readback verification.
   n.SetControlText(Control(n,dialog,1492,"Edit").Hwnd,targetAddress);
   Dialog(n,dialog,pid);
  }
  static int ItemCount(long hwnd){
   UIntPtr result;IntPtr ok=SendMessageTimeoutW(new IntPtr(hwnd),0x1004,UIntPtr.Zero,IntPtr.Zero,34,800,out result);
   if(ok==IntPtr.Zero)throw new InvalidOperationException("Native find-result list count unavailable.");
   long count=IntPtr.Size==8?(long)result.ToUInt64():result.ToUInt32();
   if(count<0||count>100000)throw new InvalidOperationException("Native find-result list count invalid.");
   return (int)count;
  }
  static Match[] ReadMatches(long hwnd,int count){
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root);
   if(hr<0||root==null)throw new InvalidOperationException("Native find-result accessibility provider absent.");
   if(root.accChildCount<count)throw new InvalidOperationException("Native find-result items have not settled.");
   var rows=new Match[count];
   for(int i=0;i<count;i++){
    int child=i+1;
    if(Convert.ToInt32(root.get_accRole(child))!=34)throw new InvalidOperationException("Native find-result row role changed.");
    rows[i]=new Match{location=root.get_accName(child),description=root.get_accDescription(child)};
   }
   return rows;
  }
  public static FindResult Find(NativeControls n,long dialog,int pid){
   Dialog(n,dialog,pid);n.ClickButton(dialog,1605,"寻找");
   long list=Control(n,dialog,1604,"SysListView32").Hwnd;
   int count=0,last=-1,stable=0;Match[] rows=null;var deadline=DateTime.UtcNow.AddSeconds(3);
   do{
    Thread.Sleep(50);Dialog(n,dialog,pid);count=ItemCount(list);
    if(count!=last){last=count;stable=0;continue;}
    if(++stable<3)continue;
    try{rows=ReadMatches(list,count);break;}catch(InvalidOperationException){stable=0;}
   }while(DateTime.UtcNow<deadline);
   if(rows==null)throw new InvalidOperationException("Native find-result list did not settle.");
   if(ItemCount(list)!=count)throw new InvalidOperationException("Native find-result count changed after reading.");
   bool notFound=count==1&&(rows[0].location=="无法发现"||rows[0].location=="Cannot Find"||rows[0].location=="Not Found");
   return new FindResult{matches=notFound?new Match[0]:rows,match_count=notFound?0:count,native_item_count=count};
  }
  public static void ReplaceAll(NativeControls n,long dialog,int pid){
   Dialog(n,dialog,pid);
   WindowInfo button=n.FindUniqueControl(dialog,1608,"Button","全部替换");
   UIntPtr result;
   if(SendMessageTimeoutW(new IntPtr(button.Hwnd),0x00F5,UIntPtr.Zero,IntPtr.Zero,34,30000,out result)==IntPtr.Zero)
    throw new InvalidOperationException("Owned Replace All button did not complete within 30 seconds; command will not be replayed (Win32 "+Marshal.GetLastWin32Error()+").");
  }
  public static void Close(NativeControls n,long dialog,int pid){Dialog(n,dialog,pid);n.ClickButton(dialog,2,"关闭");}
 }
}
