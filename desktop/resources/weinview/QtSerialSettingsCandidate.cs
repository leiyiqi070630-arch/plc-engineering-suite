using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public sealed class SerialSettings {
  public string com_port, parity;
  public int baud_rate, data_bits, stop_bits;
 }
 public sealed class SerialSettingsResult {
  public SerialSettings before, actual;
  public string[] stage_trace;
 }
 // Resolve the live Qt COM page by its accessible labels and adjacent fields.
 // A changed or ambiguous page fails before any value is written.
 public sealed class QtSerialSettingsCandidate {
  public sealed class Node {
   public string Path, Name, Value, Action;
   public int Role, State, X, Y, Width, Height, Children;
   internal IAccessible Accessible;
   internal object Child;
   internal string Read(){return Accessible.get_accValue(Child)??"";}
  }
  readonly NativeControls native;
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible result);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int first,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int received);
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd,uint command);
  [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr hwnd);
  [StructLayout(LayoutKind.Sequential)] struct Point {public int X,Y;}
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int Left,Top,Right,Bottom;}
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wp,IntPtr lp);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
  public QtSerialSettingsCandidate(NativeControls native){if(native==null)throw new ArgumentNullException("native");this.native=native;}
  static string Text(Func<string> read){try{return read()??"";}catch(COMException){return "";}}
  static int Number(Func<object> read){try{return Convert.ToInt32(read());}catch(COMException){return -1;}}
  void Walk(IAccessible accessible,object child,string path,int depth,List<Node> found,ref int count){
   if(++count>1024||depth>12)throw new InvalidOperationException("Serial Qt accessibility tree exceeds bound.");
   int x=0,y=0,width=0,height=0;
   try{accessible.accLocation(out x,out y,out width,out height,child);}catch(COMException){}
   int children=child is int && (int)child!=0?0:accessible.accChildCount;
   // The original COM settings page exposes a 255-entry role-33 list.
   if(children<0||children>256)throw new InvalidOperationException("Serial Qt accessibility child count differs.");
   found.Add(new Node{Path=path,Name=Text(()=>accessible.get_accName(child)),Value=Text(()=>accessible.get_accValue(child)),Action=Text(()=>accessible.get_accDefaultAction(child)),Role=Number(()=>accessible.get_accRole(child)),State=Number(()=>accessible.get_accState(child)),X=x,Y=y,Width=width,Height=height,Children=children,Accessible=accessible,Child=child});
   if(children==0)return;
   object[] items=new object[children];int received;
   int hr=AccessibleChildren(accessible,0,children,items,out received);
   if(hr<0)Marshal.ThrowExceptionForHR(hr);
   if(received<0||received>children)throw new InvalidOperationException("Serial Qt accessibility child fetch count invalid.");
   for(int i=0;i<received;i++){
    IAccessible next=items[i] as IAccessible;
    if(next!=null)Walk(next,0,path+"/index:"+i,depth+1,found,ref count);
    else if(items[i] is int)Walk(accessible,items[i],path+"/id:"+items[i],depth+1,found,ref count);
    else throw new InvalidOperationException("Serial Qt accessibility child representation changed.");
   }
  }
  public Node[] Probe(long dialog){
   WindowInfo owner=null;foreach(WindowInfo window in native.EnumTopWindows())if(window.Hwnd==dialog)owner=window;
   if(owner==null||owner.Class!="#32770"||owner.Title!="设备设置"||!owner.Visible||!owner.Enabled)throw new InvalidOperationException("Owned serial settings modal required.");
   WindowInfo qt=null;foreach(WindowInfo child in native.EnumChildControls(dialog))if(child.Class=="Qt5QWindowIcon"&&child.Visible&&child.Enabled){if(qt!=null)throw new InvalidOperationException("Serial Qt root duplicated.");qt=child;}
   if(qt==null)throw new InvalidOperationException("Serial Qt root absent.");
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible accessible;
   int hr=AccessibleObjectFromWindow(new IntPtr(qt.Hwnd),0xFFFFFFFC,ref iid,out accessible);
   if(hr!=0||accessible==null)throw new InvalidOperationException("Serial Qt accessibility root unavailable.");
   var nodes=new List<Node>();int count=0;Walk(accessible,0,"client",0,nodes,ref count);
   return nodes.ToArray();
  }
  static readonly string[][] Labels={new[]{"COM Port","COM口","COM","通信端口","通讯端口","端口号"},new[]{"Baud Rate","Baudrate","波特率"},new[]{"Data Bits","Data Bit","资料位","数据位"},new[]{"Parity","奇偶校验","校验位","校验"},new[]{"Stop Bits","Stop Bit","停止位"}};
  static bool LabelIs(string actual,string expected){return String.Equals((actual??"").Trim().TrimEnd(':','：').Trim(),expected,StringComparison.OrdinalIgnoreCase);}
  static string Canonical(int index,string value){
   string v=(value??"").Trim();
   if(index==3){if(v=="无"||v.Equals("none",StringComparison.OrdinalIgnoreCase)||v=="无校验")return "none";if(v=="奇"||v.Equals("odd",StringComparison.OrdinalIgnoreCase)||v=="奇校验")return "odd";if(v=="偶"||v.Equals("even",StringComparison.OrdinalIgnoreCase)||v=="偶校验")return "even";throw new InvalidOperationException("Serial parity value unknown: "+v);}
   if(index==0){var match=System.Text.RegularExpressions.Regex.Match(v,@"^COM\s*([1-9][0-9]?)(?:\s*\*)?$",System.Text.RegularExpressions.RegexOptions.IgnoreCase);if(!match.Success)throw new InvalidOperationException("Serial COM value invalid: "+v);return "COM"+match.Groups[1].Value;}
   if(index==2){var bits=System.Text.RegularExpressions.Regex.Match(v,@"^([5-8]) Bits$",System.Text.RegularExpressions.RegexOptions.IgnoreCase);if(bits.Success)return bits.Groups[1].Value;}
   if(index==4){if(v.Equals("1 Bit",StringComparison.OrdinalIgnoreCase))return "1";if(v.Equals("2 Bits",StringComparison.OrdinalIgnoreCase))return "2";}
   int number;if(!Int32.TryParse(v,out number))throw new InvalidOperationException("Serial numeric value unknown: "+v);
   if((index==1&&(number<300||number>921600))||(index==2&&(number<5||number>8))||(index==4&&(number<1||number>2)))throw new InvalidOperationException("Serial numeric value out of range: "+v);
   return number.ToString();
  }
  static Node[] Fields(Node[] nodes){
   var result=new Node[5];var used=new HashSet<string>(StringComparer.Ordinal);
   for(int i=0;i<5;i++){
    var labels=new List<Node>();foreach(Node n in nodes)if(n.Role==41&&n.Width>0&&n.Height>0)foreach(string label in Labels[i])if(LabelIs(n.Name,label)){labels.Add(n);break;}
    if(labels.Count!=1)throw new InvalidOperationException("Serial semantic label absent or ambiguous: "+i);
    Node l=labels[0];var candidates=new List<Node>();int best=Int32.MaxValue;
    foreach(Node n in nodes){
     if(n.Role!=42&&n.Role!=46)continue;
     if(n.Width<=0||n.Height<=0||n.X<l.X+l.Width-4||Math.Abs((n.Y+n.Height/2)-(l.Y+l.Height/2))>Math.Max(l.Height,n.Height))continue;
     if((n.State&(1|64|32768|65536))!=0)continue;
     int distance=n.X-(l.X+l.Width);
     if(distance<best){best=distance;candidates.Clear();candidates.Add(n);}else if(distance==best)candidates.Add(n);
    }
    if(candidates.Count!=1||best>300||!used.Add(candidates[0].Path))throw new InvalidOperationException("Serial field missing or ambiguous beside label: "+l.Name);
    result[i]=candidates[0];
   }
   return result;
  }
  static SerialSettings ReadFields(Node[] fields){
   return new SerialSettings{com_port=Canonical(0,fields[0].Read()),baud_rate=Int32.Parse(Canonical(1,fields[1].Read())),data_bits=Int32.Parse(Canonical(2,fields[2].Read())),parity=Canonical(3,fields[3].Read()),stop_bits=Int32.Parse(Canonical(4,fields[4].Read()))};
  }
  public SerialSettings Read(long dialog){return ReadFields(Fields(Probe(dialog)));}
  static Node Button(Node[] nodes,string[] names){
   Node selected=null;foreach(Node n in nodes){if(n.Role!=43||n.Width<=0||n.Height<=0)continue;foreach(string name in names)if(LabelIs(n.Name,name)){if(selected!=null)throw new InvalidOperationException("Serial confirmation button ambiguous.");selected=n;break;}}
   if(selected==null)throw new InvalidOperationException("Serial confirmation button absent.");return selected;
  }
  public void Confirm(long dialog,bool accept){Node[] nodes=Probe(dialog);Node button=Button(nodes,accept?new[]{"确定","OK","Ok"}:new[]{"取消","Cancel"});button.Accessible.accDoDefaultAction(button.Child);}
  Node[] Popup(long dialog,out long menuQt){
   menuQt=0;
   WindowInfo popup=null;foreach(WindowInfo w in native.EnumTopWindows())if(w.Hwnd!=dialog&&w.Class=="#32770"&&w.Title==""&&w.Visible&&w.Enabled&&GetWindow(new IntPtr(w.Hwnd),4).ToInt64()==dialog&&GetParent(new IntPtr(w.Hwnd)).ToInt64()==dialog){if(popup!=null)throw new InvalidOperationException("Serial owned Qt menu duplicated.");popup=w;}
   if(popup==null)throw new InvalidOperationException("Serial owned Qt menu absent.");
   WindowInfo qt=null;foreach(WindowInfo w in native.EnumChildControls(popup.Hwnd))if(w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){if(qt!=null)throw new InvalidOperationException("Serial menu Qt child duplicated.");qt=w;}
   if(qt==null)throw new InvalidOperationException("Serial menu Qt child absent.");
   menuQt=qt.Hwnd;
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible accessible;int hr=AccessibleObjectFromWindow(new IntPtr(qt.Hwnd),0xFFFFFFFC,ref iid,out accessible);
   if(hr!=0||accessible==null)throw new InvalidOperationException("Serial menu accessibility unavailable.");
   var nodes=new List<Node>();int count=0;Walk(accessible,0,"popup",0,nodes,ref count);return nodes.ToArray();
  }
  Node[] VisibleMenu(long dialog,out long menuQt){
   menuQt=0;
   // CN421 can expose the opened list inside the existing settings Qt tree.
   // Collapsed lists stay at (0,0); accept only live, onscreen role-34 rows.
   var inline=new List<Node>();foreach(Node node in Probe(dialog))if(node.Role==34&&node.X>0&&node.Y>0&&node.Width>0&&node.Height>0&&(node.State&(1|64|32768|65536))==0)inline.Add(node);
   if(inline.Count>0){foreach(WindowInfo child in native.EnumChildControls(dialog))if(child.Class=="Qt5QWindowIcon"&&child.Visible&&child.Enabled){if(menuQt!=0)throw new InvalidOperationException("Serial Qt root duplicated.");menuQt=child.Hwnd;}if(menuQt==0)throw new InvalidOperationException("Serial Qt root absent.");return inline.ToArray();}
   return Popup(dialog,out menuQt);
  }
  void ClickExactMenuRow(long dialog,long menuQt,Node chosen){
   SetProcessDPIAware();
   uint dialogPid,menuPid,foregroundPid;GetWindowThreadProcessId(new IntPtr(dialog),out dialogPid);GetWindowThreadProcessId(new IntPtr(menuQt),out menuPid);
   IntPtr foreground=GetForegroundWindow();GetWindowThreadProcessId(foreground,out foregroundPid);
   if(dialogPid==0||menuPid!=dialogPid||foregroundPid!=dialogPid||(foreground.ToInt64()!=dialog&&foreground.ToInt64()!=menuQt&&foreground!=GetParent(new IntPtr(menuQt))))throw new InvalidOperationException("Exact owned serial menu foreground required.");
   Rect bounds;if(!GetWindowRect(new IntPtr(menuQt),out bounds)||chosen.Width<3||chosen.Height<3||chosen.X<bounds.Left||chosen.Y<bounds.Top||chosen.X+chosen.Width>bounds.Right||chosen.Y+chosen.Height>bounds.Bottom)throw new InvalidOperationException("Exact serial menu row outside owned Qt bounds.");
   Point point=new Point{X=chosen.X+chosen.Width/2,Y=chosen.Y+chosen.Height/2};if(!ScreenToClient(new IntPtr(menuQt),ref point)||point.X<0||point.Y<0||point.X>32767||point.Y>32767)throw new InvalidOperationException("Exact serial menu client point invalid.");
   IntPtr packed=new IntPtr((point.Y<<16)|(point.X&65535));if(!PostMessageW(new IntPtr(menuQt),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(menuQt),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Exact owned serial menu single click failed.");
  }
  void SelectCombo(long dialog,Node field,int index,string target){
   if(field.Role!=46||String.IsNullOrEmpty(field.Action))throw new InvalidOperationException("Original serial combo action absent.");
   field.Accessible.accDoDefaultAction(field.Child);
   Node[] menu=null;long menuQt=0;DateTime until=DateTime.UtcNow.AddSeconds(3);
   do{try{menu=VisibleMenu(dialog,out menuQt);break;}catch(InvalidOperationException e){if(e.Message!="Serial owned Qt menu absent."||DateTime.UtcNow>=until)throw;System.Threading.Thread.Sleep(50);}}while(true);
   Node chosen=null;foreach(Node node in menu)if(node.Role==34&&node.Width>0&&node.Height>0&&(node.State&(1|64|32768|65536))==0){if(index==0&&(node.Name??"").TrimEnd().EndsWith("*",StringComparison.Ordinal))continue;string value;try{value=Canonical(index,node.Name);}catch(InvalidOperationException){continue;}if(value==target){if(chosen!=null)throw new InvalidOperationException("Serial dropdown target duplicated.");chosen=node;}}
   if(chosen==null)throw new InvalidOperationException("Requested serial dropdown option absent or not actionable.");
   ClickExactMenuRow(dialog,menuQt,chosen);
  }
  public SerialSettingsResult Apply(long dialog,IDictionary<string,string> requested){
   if(requested==null||requested.Count==0)throw new ArgumentException("Explicit serial settings required.");
   Node[] fields=Fields(Probe(dialog));SerialSettings before=ReadFields(fields);
   string[] keys={"com_port","baud_rate","data_bits","parity","stop_bits"};var trace=new List<string>();
   for(int i=0;i<5;i++){
    string desired;if(!requested.TryGetValue(keys[i],out desired))continue;
    string canonical=Canonical(i,desired);if(Canonical(i,fields[i].Read())==canonical)continue;
    string nativeValue=canonical;
    if(i==3){string current=fields[i].Read();bool chinese=current=="无"||current=="奇"||current=="偶"||current.EndsWith("校验",StringComparison.Ordinal);if(chinese)nativeValue=canonical=="none"?"无":canonical=="odd"?"奇":"偶";}
    if(fields[i].Role==46)SelectCombo(dialog,fields[i],i,canonical);
    else try{fields[i].Accessible.set_accValue(fields[i].Child,nativeValue);}catch(COMException e){throw new InvalidOperationException("Original serial field rejected value for "+keys[i],e);}
    Node[] refreshed=null;string observed="";DateTime readUntil=DateTime.UtcNow.AddSeconds(3);
    do{refreshed=Fields(Probe(dialog));observed=refreshed[i].Read();string current=null;try{current=Canonical(i,observed);}catch(InvalidOperationException){}if(current==canonical)break;if(DateTime.UtcNow>=readUntil)throw new InvalidOperationException("Serial exact readback differs for "+keys[i]+": "+observed);System.Threading.Thread.Sleep(50);}while(true);
    fields=refreshed;trace.Add(keys[i]+"="+canonical);
   }
   SerialSettings actual=ReadFields(Fields(Probe(dialog)));
   foreach(var pair in requested){int i=Array.IndexOf(keys,pair.Key);if(i<0)throw new ArgumentException("Unknown serial field: "+pair.Key);string observed=i==0?actual.com_port:i==1?actual.baud_rate.ToString():i==2?actual.data_bits.ToString():i==3?actual.parity:actual.stop_bits.ToString();if(observed!=Canonical(i,pair.Value))throw new InvalidOperationException("Serial final readback differs for "+pair.Key);}
   Confirm(dialog,true);return new SerialSettingsResult{before=before,actual=actual,stage_trace=trace.ToArray()};
  }
 }
}
