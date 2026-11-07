using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using PLCCode.Weinview;
using Accessibility;

public static class EventDialogControls {
 [StructLayout(LayoutKind.Sequential)] struct Rect {public int L,T,R,B;}
 [StructLayout(LayoutKind.Sequential)] struct GuiInfo {public uint Size,Flags;public IntPtr Active,Focus,Capture,MenuOwner,MoveSize,Caret;public Rect CaretRect;}
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiInfo info);
 [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr h,uint command);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
 [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint msg,UIntPtr w,IntPtr l);

 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int got);

 [DllImport("user32.dll")]static extern IntPtr GetParent(IntPtr h);
 public sealed class HistoryWearNode {public string path,name,value,action;public int role,state,count;}
 static void ReadHistoryWear(IAccessible a,int id,string path,int depth,List<HistoryWearNode> rows,HashSet<long> seen){
  if(depth>8||rows.Count>=180)throw new Exception("Small history Qt semantic bound exceeded");
  if(id==0){IntPtr identity=Marshal.GetIUnknownForObject(a);try{if(!seen.Add(identity.ToInt64()))return;}finally{Marshal.Release(identity);}}
  int count=id==0?a.accChildCount:0;if(count<0||count>128)throw new Exception("Small history Qt child count outside bound");
  int role=Convert.ToInt32(a.get_accRole(id));
  rows.Add(new HistoryWearNode{path=path,name=a.get_accName(id),value=a.get_accValue(id),action=(role==43||role==44)?a.get_accDefaultAction(id):null,role=role,state=Convert.ToInt32(a.get_accState(id)),count=count});
  for(int i=0;i<count;i++){object[] items=new object[1];int got;int hr=AccessibleChildren(a,i,1,items,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Actual history Qt child unavailable");IAccessible child=items[0] as IAccessible;if(child!=null)ReadHistoryWear(child,0,path+"/index:"+i,depth+1,rows,seen);else if(items[0] is int)ReadHistoryWear(a,(int)items[0],path+"/id:"+items[0],depth+1,rows,seen);else throw new Exception("Actual history Qt child representation differs");}
 }
 public static HistoryWearNode[] InspectWearWarning(PLCCode.Weinview.NativeControls native,long dialog,long property,long qt){
  return InspectWearWarning(native,dialog,property,qt,"native-event-v3-hw49");
 }
 public static HistoryWearNode[] InspectWearWarning(PLCCode.Weinview.NativeControls native,long dialog,long property,long qt,string profile){
  string managerTitle=profile=="native-event-v3-hw49"?"事件登录":profile=="native-event-v4-hw72"?"报警 (事件) 登录":null;if(managerTitle==null)throw new Exception("Original event profile required for storage-wear warning");
  int modals=0,managers=0;foreach(var w in native.EnumTopWindows()){if(w.Visible&&w.Class=="#32770"){modals++;if(w.Hwnd!=dialog&&w.Hwnd!=property)throw new Exception("Unknown concurrent history modal preserved");}if(w.Hwnd==property&&w.Class=="#32770"&&w.Title==managerTitle&&w.Visible)managers++;}if(modals!=2||managers!=1)throw new Exception("Exact history manager/wear pair required");
  int exact=0;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog&&w.Class=="#32770"&&w.Title=="Easy Builder Pro"&&w.Visible&&w.Enabled)exact++;
  if(exact!=1||GetWindow(new IntPtr(dialog),4).ToInt64()!=property)throw new Exception("Exact owned history message/property chain required");
  exact=0;foreach(var c in native.EnumChildControls(dialog))if(c.Hwnd==qt&&c.Class=="Qt5QWindowIcon"&&c.Visible&&c.Enabled)exact++;
  if(exact!=1||GetParent(new IntPtr(qt)).ToInt64()!=dialog)throw new Exception("Exact owned history Qt child required");
  Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int result=AccessibleObjectFromWindow(new IntPtr(qt),0xfffffffc,ref iid,out root);if(result<0)Marshal.ThrowExceptionForHR(result);if(root==null)throw new Exception("Actual history Qt provider unavailable");
  var rows=new List<HistoryWearNode>();ReadHistoryWear(root,0,"client",0,rows,new HashSet<long>());native.EnumChildControls(dialog);return rows.ToArray();
 }
 public static int AcknowledgeWearWarning(PLCCode.Weinview.NativeControls native,int pid,long dialog,long property,long qt){
  return AcknowledgeWearWarning(native,pid,dialog,property,qt,"native-event-v3-hw49");
 }
 public static int AcknowledgeWearWarning(PLCCode.Weinview.NativeControls native,int pid,long dialog,long property,long qt,string profile){
  var nodes=InspectWearWarning(native,dialog,property,qt,profile);int body=0,toggle=0,button=0;string path=null;
  foreach(var node in nodes){
   if(node.role==41&&node.name=="储存内存为有限写入寿命之储存组件, 高频率的数据写入可能加速耗损. 请于系统设计时评估写入频率, 并采取寿命管理机制, 以避免数据遗失风险. 请看产品安全手册 3.2.1 延长闪存寿命章节.")body++;
   if(node.role==44&&node.name=="不再显示此讯息"&&node.action=="Toggle"&&(node.state&0x18011)==0)toggle++;
   if(node.role==43&&node.name=="OK Enter"&&node.action=="Press"&&(node.state&0x18001)==0){button++;path=node.path;}
  }
  if(body!=1||toggle!=1||button!=1)throw new Exception("Actually read native storage wear notice changed; no acknowledgement");
  return OwnedMsaaAction.Execute(qt,pid,path,"OK Enter",43,"Invoke");
 }

 public static object InspectOrConfirm(NativeControls n,long main,long manager,long notice,int oldCount,bool confirm) {
  return InspectOrConfirm(n,main,manager,notice,oldCount,confirm,"native-event-v3-hw49");
 }
 public static object InspectOrConfirm(NativeControls n,long main,long manager,long notice,int oldCount,bool confirm,string profile) {
  string managerTitle;
  if(profile=="native-event-v3-hw49")managerTitle="事件登录";
  else if(profile=="native-event-v4-hw72")managerTitle="报警 (事件) 登录";
  else throw new InvalidOperationException("Observed native EventLog profile required");
  if(n==null||oldCount<1||oldCount>9999)throw new InvalidOperationException("Bound nonempty EventLog import required");
  WindowInfo mainInfo=null,managerInfo=null,noticeInfo=null;
  foreach(var w in n.EnumTopWindows()) {
   if(w.Hwnd==main)mainInfo=w;
   if(w.Hwnd==manager)managerInfo=w;
   if(w.Hwnd==notice)noticeInfo=w;
   if(w.Visible&&w.Class=="#32770"&&w.Hwnd!=manager&&w.Hwnd!=notice)throw new InvalidOperationException("Unexpected concurrent native import dialog");
  }
  if(mainInfo==null||mainInfo.Class!="EasyBuilderPro"||!mainInfo.Visible||managerInfo==null||!managerInfo.Visible||managerInfo.Title!=managerTitle||managerInfo.Class!="#32770"||noticeInfo==null||!noticeInfo.Visible||!noticeInfo.Enabled||noticeInfo.Title!="注意"||noticeInfo.Class!="#32770")throw new InvalidOperationException("Exact native EventLog manager/replacement notice required");
  var counter=n.FindUniqueControlWithoutLabel(manager,1290,"Static");
  var body=n.FindUniqueControlWithoutLabel(notice,65535,"Static");
  if(n.GetControlText(counter.Hwnd,64)!=oldCount+" / 10000"||n.GetControlText(body.Hwnd,128)!="删除现有的事件登录 ?")throw new InvalidOperationException("Actual replacement body/count differs");
  var yes=n.FindUniqueControl(notice,6,"Button","是(&Y)");
  var no=n.FindUniqueControl(notice,7,"Button","否(&N)");
  var cancel=n.FindUniqueControl(notice,2,"Button","取消");
  if(!yes.Visible||!yes.Enabled||!no.Visible||!no.Enabled||!cancel.Visible||!cancel.Enabled||!IsChild(new IntPtr(notice),new IntPtr(yes.Hwnd)))throw new InvalidOperationException("Exact replacement choice controls required");
  uint owner;var thread=GetWindowThreadProcessId(new IntPtr(notice),out owner);
  var gui=new GuiInfo{Size=(uint)Marshal.SizeOf(typeof(GuiInfo))};
  if(owner!=mainInfo.Pid||owner!=managerInfo.Pid||owner!=noticeInfo.Pid||!GetGUIThreadInfo(thread,ref gui))throw new InvalidOperationException("Bound native import GUI identity differs");
  long noticeOwner=GetWindow(new IntPtr(notice),4).ToInt64();
  long managerOwner=GetWindow(new IntPtr(manager),4).ToInt64();
  var evidence=new {main,manager,notice,pid=owner,thread,notice_owner=noticeOwner,manager_owner=managerOwner,active=gui.Active.ToInt64(),foreground=GetForegroundWindow().ToInt64(),body="删除现有的事件登录 ?",old_count=oldCount,confirm,global_input=false};
  if(confirm) {
   uint mainPid,managerPid;
   uint mainThread=GetWindowThreadProcessId(new IntPtr(main),out mainPid),managerThread=GetWindowThreadProcessId(new IntPtr(manager),out managerPid);
   // Observed CN421 replacement MessageBox has a NULL owner and is opened
   // on the exact main/manager GUI thread. Do not permit arbitrary dialogs.
   if(noticeOwner!=0||managerOwner!=main||thread!=mainThread||thread!=managerThread||mainPid!=owner||managerPid!=owner)throw new InvalidOperationException("Observed same-thread ownerless import notice binding differs");
   if(gui.Active.ToInt64()!=notice)throw new InvalidOperationException("Exact reviewed replacement notice must be active on its owned GUI thread");
   // The original app leaves its modeless EventLog manager enabled while this
   // owned MessageBox is active. Permit only this inspected finite pair.
   n.EnumChildControls(notice);n.EnumChildControls(manager);
   if(!PostMessageW(new IntPtr(yes.Hwnd),0x00F5,UIntPtr.Zero,IntPtr.Zero))throw new InvalidOperationException("Reviewed replacement button could not be posted");
  }
  return evidence;
 }
}
