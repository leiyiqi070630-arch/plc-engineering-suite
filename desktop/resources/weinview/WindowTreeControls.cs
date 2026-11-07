using System;using System.Runtime.InteropServices;using System.Text;using Accessibility;
namespace PLCCode.Weinview.Research {
 public class TreeState {public string path,name,action;public int role,state,children;public int[] screen_bounds;public long hwnd;}
 public class WindowTreeControls {
 readonly int pid;readonly long ticks,main;readonly string exe;readonly bool requireForeground;
 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
 [DllImport("oleacc.dll")]static extern int WindowFromAccessibleObject(IAccessible a,out IntPtr h);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindowEnabled(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetClassNameW(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
 [StructLayout(LayoutKind.Sequential)]struct Point{public int x,y;}
 [StructLayout(LayoutKind.Sequential)]struct Rect{public int l,t,r,b;}
 [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref Point p);
 [DllImport("user32.dll")]static extern bool ClientToScreen(IntPtr h,ref Point p);
 [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out Rect r);
 [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
 public TreeState ReadObject(long h,string path,string label,string objectId,string kind){if(kind!="Numeric"&&kind!="Macro"&&kind!="Bit"&&kind!="Text"&&kind!="Drawing"&&kind!="Picture"&&kind!="Trend"&&kind!="RecipeView"&&kind!="OptionList"&&kind!="AlarmDisplay")throw new Exception("Object kind required");string prefix=kind=="Numeric"?"(?:ND|NE)_":kind=="Bit"?"(?:TS|BL)_":kind=="Text"?"TX_":kind=="Drawing"?"DW_":kind=="Picture"?"GP_":kind=="Trend"?"TD_":kind=="RecipeView"?"RV_":kind=="OptionList"?"OL_":kind=="AlarmDisplay"?"AL_":"FK_";if(!System.Text.RegularExpressions.Regex.IsMatch(objectId,"^"+prefix+"[0-9]{1,5}$")||!System.Text.RegularExpressions.Regex.IsMatch(label,@"(?:^|\s)"+System.Text.RegularExpressions.Regex.Escape(objectId)+@"(?:\s|$)"))throw new Exception("Exact row object ID/type mismatch");var c=new StringBuilder(128);GetClassNameW(new IntPtr(h),c,128);if(c.ToString()!="Qt5QWindowIcon")throw new Exception("Qt object-tree root required");var t=Resolve(h,path);return State(t,h,path,label,36,t.a.get_accDefaultAction(t.child));}
 TreeState ReadDirectoryObject(long h,string path,string label,string objectId){if(!System.Text.RegularExpressions.Regex.IsMatch(objectId??"",@"^[A-Z]+_[0-9]{1,5}$")||!System.Text.RegularExpressions.Regex.IsMatch(label??"",@"(?:^|\s)"+System.Text.RegularExpressions.Regex.Escape(objectId)+@"(?:\s|$)"))throw new Exception("Exact native directory object ID/label required");var cls=new StringBuilder(128);GetClassNameW(new IntPtr(h),cls,128);if(cls.ToString()!="Qt5QWindowIcon")throw new Exception("Qt object-tree root required");var t=Resolve(h,path);Provider(t.a);if(t.a.get_accName(t.child)!=label||Convert.ToInt32(t.a.get_accRole(t.child))!=36)throw new Exception("Exact native object row changed");int x,y,w,height;t.a.accLocation(out x,out y,out w,out height,t.child);return new TreeState{hwnd=h,path=path,name=label,role=36,state=Convert.ToInt32(t.a.get_accState(t.child)),children=t.child==0?t.a.accChildCount:0,screen_bounds=new[]{x,y,w,height}};}
 public void InvokeOptionListDefaultAction(long h,string path,string label,string objectId){var row=ReadObject(h,path,label,objectId,"OptionList");if(row.action!="Toggle"||row.children!=0||(row.state&0x8000)!=0)throw new Exception("Exact visible Option List leaf action required");Guard(h);var t=Resolve(h,path);State(t,h,path,label,36,"Toggle");t.a.accDoDefaultAction(t.child);}
 void InvokeTree(long h,string operation,string label){
  GuardOwned(h);
  string bridge=Environment.GetEnvironmentVariable("PLCCODE_WEINVIEW_QT_ELEMENT_BRIDGE");
  if(String.IsNullOrEmpty(bridge))throw new Exception("Native Qt element bridge path unavailable");
  var native=new PLCCode.Weinview.NativeControls(pid,ticks,exe,1500);
  native.InvokeQtElement(main,bridge,operation+":"+label);
 }
 public void OpenObject(long h,string path,string label,string objectId,string kind){OpenObjectAtObservedRow(h,path,label,objectId,kind);}
 public TreeState EnsureNamedWindowVisible(long h,string path,string name){return State(Resolve(h,path),h,path,name,36,"Toggle");}
 public TreeState EnsureNamedObjectVisible(long h,string path,string label,string objectId,string kind){return ReadObject(h,path,label,objectId,kind);}
 public void ExpandWindowAtObservedRow(long h,string path,string name){var row=EnsureNamedWindowVisible(h,path,name);if((row.state&512)==0)InvokeTree(h,"tree-expand",name);}
 public void OpenNamedWindowAtObservedRow(long h,string path,string name){EnsureNamedWindowVisible(h,path,name);InvokeTree(h,"tree-open",name);}
 public void OpenObjectAtObservedRow(long h,string path,string label,string objectId,string kind){if(path!=null&&path.StartsWith("qt:",StringComparison.Ordinal)){InvokeTree(h,"tree-open",path.Substring(3));return;}ReadObject(h,path,label,objectId,kind);InvokeTree(h,"tree-open",label);}
 public void SelectObjectAtObservedRow(long h,string path,string label,string objectId){
  if(path!=null&&path.StartsWith("qt:",StringComparison.Ordinal)){InvokeTree(h,"tree-select",path.Substring(3));return;}ReadDirectoryObject(h,path,label,objectId);InvokeTree(h,"tree-select",label);
  DateTime end=DateTime.UtcNow.AddSeconds(2);
  do{if((ReadDirectoryObject(h,path,label,objectId).state&2)!=0)return;System.Threading.Thread.Sleep(25);}while(DateTime.UtcNow<end);
  throw new Exception("Native tree element did not become selected");
 }
 public TreeState ReadAddressDock(long h){return State(Resolve(h,"client/id:1"),h,"client/id:1","地址",37,"Switch");}
 public void RestoreAddressDock(long h){var t=Resolve(h,"client/id:1");State(t,h,"client/id:1","地址",37,"Switch");Guard(h);t.a.accDoDefaultAction(t.child);ReadAddressDock(h);}
 [DllImport("user32.dll")]static extern IntPtr GetParent(IntPtr h);
 public long Parent(long h){Owner(h);return GetParent(new IntPtr(h)).ToInt64();}
  public TreeState[] FindRole(long h,int role){GuardOwned(h);var found=new System.Collections.Generic.List<TreeState>();if(role==37){var cls=new StringBuilder(128);GetClassNameW(new IntPtr(h),cls,128);if(!cls.ToString().StartsWith("BCGPTabWnd:"))throw new Exception("Dock-tab discovery requires native BCGPTabWnd");var root=Resolve(h,"client");Provider(root.a);int count=root.a.accChildCount;if(count<0||count>128)throw new Exception("Direct dock-tab child bound128");for(int i=0;i<count;i++){object[] children=new object[1];int got;int hr=AccessibleChildren(root.a,i,1,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Direct dock-tab child absent");Target target;string path;if(children[0] is int){target=new Target{a=root.a,child=(int)children[0]};path="client/id:"+children[0];}else if(children[0] is IAccessible){target=new Target{a=(IAccessible)children[0]};path="client/index:"+i;}else throw new Exception("Direct dock-tab child representation changed");Provider(target.a);if(Convert.ToInt32(target.a.get_accRole(target.child))!=37)continue;found.Add(State(target,h,path,target.a.get_accName(target.child),37,target.a.get_accDefaultAction(target.child)));}GuardOwned(h);return found.ToArray();}var seen=new System.Collections.Generic.HashSet<long>();int budget=0;Find(Resolve(h,"client"),h,"client",role,0,ref budget,seen,found);GuardOwned(h);return found.ToArray();}
 void Find(Target t,long h,string path,int role,int depth,ref int budget,System.Collections.Generic.HashSet<long> seen,System.Collections.Generic.List<TreeState> found){if(++budget>128||depth>6)throw new Exception("Semantic discovery budget");Provider(t.a);if(t.child==0){var u=Marshal.GetIUnknownForObject(t.a);long identity=u.ToInt64();Marshal.Release(u);if(!seen.Add(identity))return;}int r=Convert.ToInt32(t.a.get_accRole(t.child));if(r==role){found.Add(State(t,h,path,t.a.get_accName(t.child),r,t.a.get_accDefaultAction(t.child)));return;}if(t.child!=0)return;int count=t.a.accChildCount;if(count<0||count>128)throw new Exception("Discovery branch exceeds128");for(int i=0;i<count;i++){object[] c=new object[1];int got;int hr=AccessibleChildren(t.a,i,1,c,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Discovery child absent");Target next;string part;if(c[0] is int){next=new Target{a=t.a,child=(int)c[0]};part="/id:"+c[0];}else if(c[0] is IAccessible){next=new Target{a=(IAccessible)c[0]};part="/index:"+i;}else throw new Exception("Discovery representation");Find(next,h,path+part,role,depth+1,ref budget,seen,found);}}
 public void SwitchTab(long h,string path,string name){var t=Resolve(h,path);State(t,h,path,name,37,"Switch");Guard(h);t.a.accDoDefaultAction(t.child);State(Resolve(h,path),h,path,name,37,"Switch");}
 public TreeState[] Window10Rows(long h,string treePath){return WindowRows(h,treePath,10);}
 // One MSAA child fetch for a complete directory inventory. The caller must
 // verify its own created-window set against every returned window heading.
 public TreeState[] AllWindowRows(long h,string treePath){
  var t=Resolve(h,treePath);if(t.child!=0||Convert.ToInt32(t.a.get_accRole(0))!=35)throw new Exception("Actual tree interface required");
  int count=t.a.accChildCount;if(count<0||count>8192)throw new Exception("Tree child bound8192");
  object[] children=new object[count];int got=0;
  if(count>0){int hr=AccessibleChildren(t.a,0,count,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);}
  if(got!=count)throw new Exception("Tree row full snapshot incomplete");
  var rows=new System.Collections.Generic.List<TreeState>(got);
  for(int i=0;i<got;i++){
   Target row;string path;
   if(children[i] is int){row=new Target{a=t.a,child=(int)children[i]};path=treePath+"/id:"+children[i];}
   else if(children[i] is IAccessible){row=new Target{a=(IAccessible)children[i]};path=treePath+"/index:"+i;}
   else throw new Exception("Tree row representation changed");
   Provider(row.a);string name=row.a.get_accName(row.child);
   if(name==null)throw new Exception("Tree row name unavailable");
   rows.Add(State(row,h,path,name,Convert.ToInt32(row.a.get_accRole(row.child)),row.a.get_accDefaultAction(row.child)));
  }
  if(t.a.accChildCount!=count)throw new Exception("Tree row count changed during full snapshot");
  GuardOwned(h);return rows.ToArray();
 }
 static int ObservedHeaderIndex(string treePath,string headerPath){
  if(String.IsNullOrEmpty(treePath)||String.IsNullOrEmpty(headerPath))return -1;
  string prefix=treePath+"/index:";
  if(!headerPath.StartsWith(prefix,StringComparison.Ordinal))return -1;
  string suffix=headerPath.Substring(prefix.Length);int index;
  if(!Int32.TryParse(suffix,System.Globalization.NumberStyles.None,System.Globalization.CultureInfo.InvariantCulture,out index)||index<0||index.ToString(System.Globalization.CultureInfo.InvariantCulture)!=suffix)return -1;
  return index;
 }
 static readonly System.Text.RegularExpressions.Regex WindowHeadingPattern=new System.Text.RegularExpressions.Regex(@"^\d+(?:\s*:\s*.*)?$");
 static bool TryWindowHeadingNumber(string name,out int number){
  number=0;if(!WindowHeadingPattern.IsMatch(name??""))return false;
  var digits=System.Text.RegularExpressions.Regex.Match(name,@"^\d+");
  return Int32.TryParse(digits.Value,System.Globalization.NumberStyles.None,System.Globalization.CultureInfo.InvariantCulture,out number);
 }
 bool TryWindowHeadingAt(Target parent,int index,out int number,out string name){
  number=0;name=null;object[] child=new object[1];int got;
  int hr=AccessibleChildren(parent.a,index,1,child,out got);if(hr<0||got!=1)return false;
  Target row;
  if(child[0] is int)row=new Target{a=parent.a,child=(int)child[0]};
  else if(child[0] is IAccessible)row=new Target{a=(IAccessible)child[0]};
  else return false;
  Provider(row.a);
  if(Convert.ToInt32(row.a.get_accRole(row.child))!=36)return false;
  name=row.a.get_accName(row.child);
  return TryWindowHeadingNumber(name,out number);
 }
 bool TryLocateWindowHeading(Target parent,int count,int wanted,out int start){
  start=0;int low=0,high=count-1;
  var observed=new System.Collections.Generic.Dictionary<int,int>();
  for(int round=0;round<16&&low<=high;round++){
   if(parent.a.accChildCount!=count)return false;
   int mid=low+(high-low)/2,foundIndex=-1,number=0;string name=null;
   for(int distance=0;distance<=8&&foundIndex<0;distance++){
    int first=mid-distance,second=mid+distance;
    if(first>=low&&TryWindowHeadingAt(parent,first,out number,out name))foundIndex=first;
    else if(distance>0&&second<=high&&TryWindowHeadingAt(parent,second,out number,out name))foundIndex=second;
   }
   if(foundIndex<0||parent.a.accChildCount!=count)return false;
   foreach(var previous in observed){if((previous.Key<foundIndex&&previous.Value>=number)||(previous.Key>foundIndex&&previous.Value<=number))return false;}
   observed[foundIndex]=number;
   if(number==wanted){
    if(!System.Text.RegularExpressions.Regex.IsMatch(name,"^"+wanted.ToString(System.Globalization.CultureInfo.InvariantCulture)+@"\s*:\s*"))return false;
    start=foundIndex;return true;
   }
   if(number<wanted)low=foundIndex+1;else high=foundIndex-1;
  }
  return false;
 }
 public TreeState[] WindowRows(long h,string treePath,int windowNumber){return WindowRows(h,treePath,windowNumber,null,null);}
 public TreeState[] WindowRows(long h,string treePath,int windowNumber,string headerPath,string expectedHeaderName){
  if(windowNumber<10||windowNumber>1999)throw new ArgumentException("Ordinary window10..1999 required");
  var t=Resolve(h,treePath);if(t.child!=0||Convert.ToInt32(t.a.get_accRole(0))!=35)throw new Exception("Actual tree interface required");
  int count=t.a.accChildCount;if(count<0||count>8192)throw new Exception("Tree child bound8192");
  int start=0,index=ObservedHeaderIndex(treePath,headerPath);bool validHint=false;
  if(index>=0&&index<count&&!String.IsNullOrEmpty(expectedHeaderName)&&System.Text.RegularExpressions.Regex.IsMatch(expectedHeaderName,"^"+windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+@"\s*:\s*")){
   object[] observed=new object[1];int actual;int hr=AccessibleChildren(t.a,index,1,observed,out actual);if(hr<0)Marshal.ThrowExceptionForHR(hr);
   if(actual!=1)throw new Exception("Observed window header child unavailable");
   if(observed[0] is IAccessible){var header=new Target{a=(IAccessible)observed[0]};Provider(header.a);if(header.a.get_accName(0)==expectedHeaderName&&Convert.ToInt32(header.a.get_accRole(0))==36){State(header,h,headerPath,expectedHeaderName,36,header.a.get_accDefaultAction(0));start=index;validHint=true;}}
   else if(!(observed[0] is int))throw new Exception("Observed window header representation changed");
  }
  if(!validHint&&count>0){int located;if(TryLocateWindowHeading(t,count,windowNumber,out located))start=located;}
  var rows=new System.Collections.Generic.List<TreeState>();bool active=false,complete=false;
  // A window header can be followed by thousands of unrelated window rows.
  // Fetch only a small next segment and stop at the next header instead of
  // creating COM proxies for the entire remaining directory on every edit.
  for(int offset=start;offset<count&&!complete;){
   if(t.a.accChildCount!=count)throw new Exception("Tree row count changed during window snapshot");
   int requested=Math.Min(32,count-offset);object[] children=new object[requested];int got=0;
   int hr=AccessibleChildren(t.a,offset,requested,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);
   if(got!=requested)throw new Exception("Tree row segment incomplete");
   for(int j=0;j<got;j++){
   int i=offset+j;
   Target row;string path;
   if(children[j] is int){row=new Target{a=t.a,child=(int)children[j]};path=treePath+"/id:"+children[j];}
   else if(children[j] is IAccessible){row=new Target{a=(IAccessible)children[j]};path=treePath+"/index:"+i;}
   else throw new Exception("Tree row representation changed");
   Provider(row.a);string name=row.a.get_accName(row.child);
   if(WindowHeadingPattern.IsMatch(name??"")){
    if(active){complete=true;break;}
    if(System.Text.RegularExpressions.Regex.IsMatch(name,"^"+windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+@"\s*:\s*")){active=true;rows.Add(State(row,h,path,name,36,row.a.get_accDefaultAction(row.child)));}
    continue;
   }
   if(active)rows.Add(State(row,h,path,name,Convert.ToInt32(row.a.get_accRole(row.child)),row.a.get_accDefaultAction(row.child)));
   }
   offset+=got;
  }
  if(t.a.accChildCount!=count)throw new Exception("Tree row count changed during window snapshot");
  GuardOwned(h);if(!active)throw new Exception("Requested created window row absent: "+windowNumber);
  return rows.ToArray();
 } public void ExpandNamedWindowRightResearch(long h,string path,string name){SetProcessDPIAware();var qtClass=new StringBuilder(128);GetClassNameW(new IntPtr(h),qtClass,128);if(qtClass.ToString()!="Qt5QWindowIcon")throw new Exception("Native Qt tree required");var t=Resolve(h,path);var state=State(t,h,path,name,36,"Toggle");LastFocusEvidence=new[]{Focus(h,state.state)};LastRightPacket=null;if((state.state&512)!=0)return;SetProcessDPIAware();if((state.state&0x8000)!=0||state.screen_bounds[2]<1||state.screen_bounds[3]<1)throw new Exception("Window tree row invisible");var point=new Point{x=state.screen_bounds[0]+state.screen_bounds[2]/2,y=state.screen_bounds[1]+state.screen_bounds[3]/2};if(!ScreenToClient(new IntPtr(h),ref point))throw new Exception("Window row client conversion failed");Rect bounds;if(!GetClientRect(new IntPtr(h),out bounds)||point.x<0||point.y<0||point.x>=bounds.r||point.y>=bounds.b||point.x>32767||point.y>32767)throw new Exception("Window row outside Qt client");Guard(h);var fresh=State(Resolve(h,path),h,path,name,36,"Toggle");for(int i=0;i<4;i++)if(fresh.screen_bounds[i]!=state.screen_bounds[i])throw new Exception("Window row moved before focus click");var packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(h),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(h),0x202,UIntPtr.Zero,packed))throw new Exception("Single semantic window focus click failed; no retry");DateTime deadline=DateTime.UtcNow.AddSeconds(2);FocusProof after=null;do{Guard(h);var selected=State(Resolve(h,path),h,path,name,36,"Toggle");after=Focus(h,selected.state);LastFocusEvidence=new[]{LastFocusEvidence[0],after};if((selected.state&2)!=0&&after.owner_pid==(uint)pid&&after.root_or_child&&after.hwnd!=0)break;System.Threading.Thread.Sleep(50);}while(DateTime.UtcNow<deadline);if(after==null||(after.selected_state&2)==0||after.owner_pid!=(uint)pid||!after.root_or_child||after.hwnd==0)throw new Exception("Semantic click did not verify selected plus owned native GUI focus; no RIGHT");Guard(h);var currentFocus=Focus(h,after.selected_state);if(currentFocus.hwnd!=after.hwnd||currentFocus.owner_pid!=(uint)pid||!currentFocus.root_or_child)throw new Exception("Native focus changed before RIGHT");uint scan=MapVirtualKeyW(0x27,0);if(scan==0||scan>255)throw new Exception("RIGHT native scan code unavailable/out of bound");uint down=1u|(scan<<16)|(1u<<24),up=down|(1u<<30)|(1u<<31);LastRightPacket=new RightPacketProof{virtual_key=0x27,scan_code=scan,key_down_lparam=down,key_up_lparam=up,focus_hwnd=after.hwnd};LastRightPacket.down_posted=PostMessageW(new IntPtr(after.hwnd),0x100,new UIntPtr(0x27),new IntPtr(unchecked((int)down)));if(!LastRightPacket.down_posted)throw new Exception("Single focused RIGHT down post failed; no retry");LastRightPacket.up_posted=PostMessageW(new IntPtr(after.hwnd),0x101,new UIntPtr(0x27),new IntPtr(unchecked((int)up)));if(!LastRightPacket.up_posted)throw new Exception("Single focused RIGHT up post failed; no retry");}
 [DllImport("user32.dll")]static extern uint MapVirtualKeyW(uint code,uint mapType);
 public class RightPacketProof {public uint virtual_key,scan_code,key_down_lparam,key_up_lparam;public long focus_hwnd;public bool down_posted,up_posted;}
 public RightPacketProof LastRightPacket {get;private set;}
 public class ExpansionProof {public string method,semantic_path,exact_name;public long qt_hwnd;public int[] screen_row_bounds,client_point;public int messages_posted;public bool posted;}
 public ExpansionProof LastExpansionEvidence {get;private set;}
 public void ExpandNamedWindow(long h,string path,string name){SetProcessDPIAware();var cls=new StringBuilder(128);GetClassNameW(new IntPtr(h),cls,128);if(cls.ToString()!="Qt5QWindowIcon")throw new Exception("Native Qt tree required");var row=State(Resolve(h,path),h,path,name,36,"Toggle");LastRightPacket=null;LastFocusEvidence=new[]{Focus(h,row.state)};LastExpansionEvidence=new ExpansionProof{method="semantic-row-doubleclick",semantic_path=path,exact_name=name,qt_hwnd=h,screen_row_bounds=row.screen_bounds};if((row.state&512)!=0){LastExpansionEvidence.method="already-expanded";return;}if((row.state&0x8000)!=0||row.screen_bounds[2]<1||row.screen_bounds[3]<1)throw new Exception("Window tree row invisible or empty");var point=new Point{x=row.screen_bounds[0]+row.screen_bounds[2]/2,y=row.screen_bounds[1]+row.screen_bounds[3]/2};if(!ScreenToClient(new IntPtr(h),ref point))throw new Exception("Window row Qt conversion failed");Rect bounds;if(!GetClientRect(new IntPtr(h),out bounds)||point.x<0||point.y<0||point.x>=bounds.r||point.y>=bounds.b||point.x>32767||point.y>32767)throw new Exception("Window row outside Qt client");LastExpansionEvidence.client_point=new[]{point.x,point.y};Guard(h);var fresh=State(Resolve(h,path),h,path,name,36,"Toggle");for(int i=0;i<4;i++)if(fresh.screen_bounds[i]!=row.screen_bounds[i])throw new Exception("Window row moved before single doubleclick");var lp=new IntPtr((point.y<<16)|(point.x&65535));uint[] messages={0x201,0x202,0x203,0x202};uint[] flags={1,0,1,0};for(int i=0;i<4;i++){if(!PostMessageW(new IntPtr(h),messages[i],new UIntPtr(flags[i]),lp))throw new Exception("Single semantic window doubleclick post failed; no fallback/retry");LastExpansionEvidence.messages_posted++;}LastExpansionEvidence.posted=true;}
 public class FocusProof {public long hwnd,root_hwnd;public uint thread_id,owner_pid;public bool root_or_child;public int selected_state;}
 public FocusProof[] LastFocusEvidence {get;private set;}
 [StructLayout(LayoutKind.Sequential)]struct GuiThreadInfo{public uint cbSize,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public Rect caretRect;}
 [DllImport("user32.dll")]static extern bool GetGUIThreadInfo(uint thread,ref GuiThreadInfo info);
 [DllImport("user32.dll")]static extern bool IsChild(IntPtr parent,IntPtr child);
 FocusProof Focus(long root,int selectedState){uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(root),out owner);if(owner!=(uint)pid||thread==0)throw new Exception("Focus root identity changed");var info=new GuiThreadInfo{cbSize=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};if(!GetGUIThreadInfo(thread,ref info))throw new Exception("Native GUI thread focus read failed");uint focusOwner=0;if(info.focus!=IntPtr.Zero)GetWindowThreadProcessId(info.focus,out focusOwner);return new FocusProof{hwnd=info.focus.ToInt64(),root_hwnd=root,thread_id=thread,owner_pid=focusOwner,root_or_child=info.focus.ToInt64()==root||IsChild(new IntPtr(root),info.focus),selected_state=selectedState};}
 delegate bool EnumProc(IntPtr h,IntPtr p);
 [DllImport("user32.dll")]static extern bool EnumWindows(EnumProc cb,IntPtr p);
 class Target {public IAccessible a;public int child;}
 public WindowTreeControls(int p,long t,string e,long m):this(p,t,e,m,true){} public WindowTreeControls(int p,long t,string e,long m,bool requireOwnedForeground){pid=p;ticks=t;exe=e;main=m;requireForeground=requireOwnedForeground;GuardOwned(m);}
 void Owner(long h){uint p;if(GetWindowThreadProcessId(new IntPtr(h),out p)==0||p!=(uint)pid)throw new Exception("Window owner changed: "+h);}
 void GuardOwned(long h){new NativePropertyCandidate(pid,ticks,exe);Owner(main);Owner(h);if(!IsWindowVisible(new IntPtr(main))||!IsWindowEnabled(new IntPtr(main))||!IsWindowVisible(new IntPtr(h))||!IsWindowEnabled(new IntPtr(h)))throw new Exception("Owned visible enabled windows required");int n=0;Exception error=null;EnumWindows(delegate(IntPtr w,IntPtr p){if(++n>8192){error=new Exception("Desktop modal visit bound");return false;}uint owner;GetWindowThreadProcessId(w,out owner);if(owner==(uint)pid&&IsWindowVisible(w)){var c=new StringBuilder(128);GetClassNameW(w,c,128);if(c.ToString()=="#32770"){error=new Exception("Own modal blocks tree operation");return false;}}return true;},IntPtr.Zero);if(error!=null)throw error;}
 void Guard(long h){GuardOwned(h);if(requireForeground&&GetForegroundWindow().ToInt64()!=main)throw new Exception("Owned foreground window required for input");}
 void Provider(IAccessible a){IntPtr h;int hr=WindowFromAccessibleObject(a,out h);if(hr<0)Marshal.ThrowExceptionForHR(hr);Owner(h.ToInt64());}
 Target Resolve(long h,string path){GuardOwned(h);var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(h),0xfffffffc,ref iid,out a);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(a==null)throw new Exception("MSAA root absent");var t=new Target{a=a};var parts=path.Split('/');if(parts.Length>13||parts[0]!="client")throw new Exception("Path bound");Provider(a);for(int i=1;i<parts.Length;i++){if(t.child!=0)throw new Exception("Simple child cannot descend");if(parts[i].StartsWith("id:")){t.child=int.Parse(parts[i].Substring(3));if(t.child<=0)throw new Exception("ChildID bound");}else if(parts[i].StartsWith("index:")){int index=int.Parse(parts[i].Substring(6));if(index<0||index>=t.a.accChildCount)throw new Exception("Path index unavailable");object[] c=new object[1];int got;hr=AccessibleChildren(t.a,index,1,c,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Child absent");if(c[0] is int)t.child=(int)c[0];else if(c[0] is IAccessible)t=new Target{a=(IAccessible)c[0]};else throw new Exception("Child representation changed");}else throw new Exception("Path segment invalid");Provider(t.a);}return t;}
 TreeState State(Target t,long h,string path,string name,int role,string action){Provider(t.a);if(t.a.get_accName(t.child)!=name||Convert.ToInt32(t.a.get_accRole(t.child))!=role||t.a.get_accDefaultAction(t.child)!=action)throw new Exception("Exact semantic target changed");int x,y,w,height;t.a.accLocation(out x,out y,out w,out height,t.child);return new TreeState{hwnd=h,path=path,name=name,role=role,action=action,state=Convert.ToInt32(t.a.get_accState(t.child)),children=t.child==0?t.a.accChildCount:0,screen_bounds=new[]{x,y,w,height}};}
 public TreeState Read(long h,string path,string kind){string name=kind=="Dock"?"目录树":"10 : WINDOW_010";int role=kind=="Dock"?37:36;string action=kind=="Dock"?"Switch":"Toggle";return State(Resolve(h,path),h,path,name,role,action);}
 public void SwitchDockTab(long h,string path){var t=Resolve(h,path);State(t,h,path,"目录树",37,"Switch");Guard(h);t.a.accDoDefaultAction(t.child);Read(h,path,"Dock");}
 public void ExpandWindow(long h,string path){ExpandNamedWindow(h,path,"10 : WINDOW_010");}
 }
}
