// Private CN421 owned object ribbon entry; no production integration.
using System.Collections.Generic;using Accessibility;
using System;using System.IO;using System.Runtime.InteropServices;using System.Security.Cryptography;
namespace PLCCode.Weinview {
 public static class ObjectRibbonControls {
 [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}[StructLayout(LayoutKind.Sequential)]struct P{public int x,y;}
 [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);[DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out R r);[DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref P p);[DllImport("user32.dll")]static extern bool IsChild(IntPtr a,IntPtr b);[DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();[DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);

 [DllImport("user32.dll",SetLastError=true)][return:MarshalAs(UnmanagedType.Bool)]static extern bool PrintWindow(IntPtr h,IntPtr dc,uint flags);
 [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")]static extern IntPtr GetThreadDpiAwarenessContext();
 [DllImport("user32.dll",SetLastError=true)]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr value);
 [DllImport("user32.dll")]static extern int GetAwarenessFromDpiAwarenessContext(IntPtr value);
 [DllImport("user32.dll")]static extern uint GetDpiForWindow(IntPtr value);
 static string BackgroundHash(string path){using(var sha=SHA256.Create())using(var f=File.OpenRead(path))return BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");}
 static void BackgroundDpi(){SetProcessDPIAware();if(GetAwarenessFromDpiAwarenessContext(GetThreadDpiAwarenessContext())<1)throw new InvalidOperationException("Physical pixel capture requires DPI-aware caller");}
 static string ProofIdentity(NativeSemanticControls.RibbonProof p){return "main="+p.Main+",hwnd="+p.Hwnd+",rect="+p.Left+","+p.Top+","+p.Width+","+p.Height+",pid="+p.Pid+",ticks="+p.CreationUtcTicks+",dpi="+p.WindowDpi+",awareness="+p.CallerDpiAwareness+",main_bounds="+(p.MainBounds==null?"null":String.Join(",",p.MainBounds));}
 public static NativeSemanticControls.RibbonProof LocateOwnedBackgroundRibbon(NativeControls n,long main,string project,string projectSha){
  BackgroundDpi();if(n==null||String.IsNullOrEmpty(project)||String.IsNullOrEmpty(projectSha)||!String.Equals(BackgroundHash(project),projectSha,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Bound background project SHA required");
  int mains=0,pid=0;foreach(var top in n.EnumTopWindows()){if(top.Visible&&top.Class=="#32770")throw new InvalidOperationException("Owned modal blocks background ribbon");if(top.Hwnd==main&&top.Class=="EasyBuilderPro"&&top.Visible&&top.Enabled){mains++;pid=top.Pid;}}
  R mr,client;if(mains!=1||!GetWindowRect(new IntPtr(main),out mr)||!GetClientRect(new IntPtr(main),out client))throw new InvalidOperationException("Exact owned main geometry required");
  R ribbon=new R();long bar=0,qt=0;var children=n.EnumChildControls(main);
  foreach(var w in children){if(!w.Visible||!w.Enabled||!w.Class.StartsWith("EBRibbonBar:",StringComparison.Ordinal))continue;if(bar!=0||!IsChild(new IntPtr(main),new IntPtr(w.Hwnd))||!GetWindowRect(new IntPtr(w.Hwnd),out ribbon))throw new InvalidOperationException("Owned ribbon ambiguous");bar=w.Hwnd;}
  int width=ribbon.r-ribbon.l,height=ribbon.b-ribbon.t;if(bar==0||height<64||height>400||width<500||width!=client.r-client.l||ribbon.l<mr.l||ribbon.t<mr.t||ribbon.r>mr.r||ribbon.b>mr.b)throw new InvalidOperationException("Owned ribbon geometry differs");
  foreach(var w in children){R r;if(w.Class!="Qt5QWindowIcon"||w.Title!="EasyBuilder Pro"||!w.Visible||!w.Enabled||!IsChild(new IntPtr(main),new IntPtr(w.Hwnd)))continue;if(GetWindowRect(new IntPtr(w.Hwnd),out r)&&r.l==ribbon.l&&r.t==ribbon.t&&r.r==ribbon.r&&r.b==ribbon.b){if(qt!=0)throw new InvalidOperationException("Owned ribbon Qt ambiguous");qt=w.Hwnd;}}
  if(qt==0)throw new InvalidOperationException("Owned ribbon Qt absent");int dpi=(int)GetDpiForWindow(new IntPtr(main));if(dpi<=0)throw new InvalidOperationException("Actual window DPI absent");
  string ticks;using(var process=System.Diagnostics.Process.GetProcessById(pid))ticks=process.StartTime.ToUniversalTime().Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture);
  n.EnumTopWindows();if(!String.Equals(BackgroundHash(project),projectSha,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Background project changed");
  long foreground=GetForegroundWindow().ToInt64();return new NativeSemanticControls.RibbonProof{Main=main,Hwnd=qt,Left=ribbon.l,Top=ribbon.t,Width=width,Height=height,CapturedUtc=DateTime.UtcNow,OwnedBackgroundRender=true,CaptureMethod="owned-printwindow-main-ribbon-physical",CallerDpiAwareness=GetAwarenessFromDpiAwarenessContext(GetThreadDpiAwarenessContext()),WindowDpi=dpi,Pid=pid,CreationUtcTicks=ticks,ProjectPath=project,ProjectSha256=projectSha,ForegroundBefore=foreground,ForegroundAfter=foreground,MainBounds=new[]{mr.l,mr.t,mr.r-mr.l,mr.b-mr.t}};
 }
 static NativeSemanticControls.RibbonProof ReobserveBackground(NativeControls n,NativeSemanticControls.RibbonProof proof){
  if(!proof.OwnedBackgroundRender||proof.CaptureMethod!="owned-printwindow-main-ribbon-physical"||proof.CallerDpiAwareness<1)throw new InvalidOperationException("Exact owned render proof required");
  var current=LocateOwnedBackgroundRibbon(n,proof.Main,proof.ProjectPath,proof.ProjectSha256);
  if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height||current.Pid!=proof.Pid||current.CreationUtcTicks!=proof.CreationUtcTicks||current.WindowDpi!=proof.WindowDpi)throw new InvalidOperationException("Background identity/physical geometry changed; before="+ProofIdentity(proof)+"; current="+ProofIdentity(current));return current;
 }
 public static NativeSemanticControls.RibbonProof CaptureOwnedBackgroundRibbon(NativeControls n,long main,string project,string projectSha,string output){
  if(File.Exists(output)||!Directory.Exists(Path.GetDirectoryName(Path.GetFullPath(output))))throw new InvalidOperationException("Fresh PNG in existing directory required");
   for(int attempt=0;attempt<3;attempt++){
    var proof=LocateOwnedBackgroundRibbon(n,main,project,projectSha);int width=proof.Width,height=proof.Height;if(width<1||height<1||width>8192||height>8192||(long)width*height>16000000)throw new InvalidOperationException("Ribbon bitmap bound exceeded");
    bool printed;using(var full=new System.Drawing.Bitmap(width,height,System.Drawing.Imaging.PixelFormat.Format32bppArgb)){
     // WM_PRINT paints this Qt ribbon in its logical coordinate space. Obtain
     // those bounds in the matching DPI context, then map the render back to
     // the physical bounds used by the owned input target.
     IntPtr previousDpi=SetThreadDpiAwarenessContext(new IntPtr(-1));
     if(previousDpi==IntPtr.Zero)throw new InvalidOperationException("Logical ribbon render DPI context unavailable");
     System.Drawing.Bitmap logical=null;
     try{
      R logicalBounds;if(!GetWindowRect(new IntPtr(proof.Hwnd),out logicalBounds))throw new InvalidOperationException("Logical ribbon bounds unavailable");
      int logicalWidth=logicalBounds.r-logicalBounds.l,logicalHeight=logicalBounds.b-logicalBounds.t;
      if(logicalWidth<1||logicalHeight<1||logicalWidth>8192||logicalHeight>8192)throw new InvalidOperationException("Logical ribbon dimensions invalid");
      logical=new System.Drawing.Bitmap(logicalWidth,logicalHeight,System.Drawing.Imaging.PixelFormat.Format32bppArgb);
      using(var g=System.Drawing.Graphics.FromImage(logical)){g.Clear(System.Drawing.Color.Magenta);IntPtr dc=g.GetHdc();try{printed=PrintWindow(new IntPtr(proof.Hwnd),dc,2);}finally{g.ReleaseHdc(dc);}}
     }catch{if(logical!=null)logical.Dispose();throw;}
     finally{SetThreadDpiAwarenessContext(previousDpi);}
     using(logical)using(var g=System.Drawing.Graphics.FromImage(full)){
      g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode=System.Drawing.Drawing2D.PixelOffsetMode.Half;
      g.DrawImage(logical,new System.Drawing.Rectangle(0,0,width,height),new System.Drawing.Rectangle(0,0,logical.Width,logical.Height),System.Drawing.GraphicsUnit.Pixel);
     }
     var current=LocateOwnedBackgroundRibbon(n,main,project,projectSha);
     if(current.Hwnd!=proof.Hwnd||current.Pid!=proof.Pid||current.CreationUtcTicks!=proof.CreationUtcTicks||current.WindowDpi!=proof.WindowDpi)throw new InvalidOperationException("Background owned ribbon identity changed during render");
     bool moved=current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height;
     for(int i=0;i<4;i++)moved|=current.MainBounds[i]!=proof.MainBounds[i];
     if(moved){if(attempt==2)throw new InvalidOperationException("Owned main/ribbon geometry kept moving during render");continue;}
     using(var image=full.Clone(new System.Drawing.Rectangle(0,0,proof.Width,proof.Height),System.Drawing.Imaging.PixelFormat.Format32bppArgb)){
      var colors=new HashSet<int>();for(int y=0;y<image.Height;y++)for(int x=0;x<image.Width;x++)colors.Add(image.GetPixel(x,y).ToArgb());image.Save(output,System.Drawing.Imaging.ImageFormat.Png);
      proof.Path=output;proof.Hash=BackgroundHash(output);proof.PrintWindowSucceeded=printed;proof.ColorCount=colors.Count;proof.Accepted=printed&&colors.Count>1;proof.ForegroundAfter=GetForegroundWindow().ToInt64();return proof;
     }
    }
   }
   throw new InvalidOperationException("Owned main/ribbon geometry unavailable");
 }
 public static NativeSemanticControls.RibbonProof LocateOwnedRibbon(NativeControls n,long main){
  if(n==null)throw new ArgumentNullException("n");if(GetForegroundWindow().ToInt64()!=main)throw new InvalidOperationException("Owned main foreground required");
  R client;if(!GetClientRect(new IntPtr(main),out client))throw new InvalidOperationException("Main client rect absent");
  R ribbon=new R();long bar=0,qt=0;var children=n.EnumChildControls(main);
  foreach(var w in children){if(!w.Visible||!w.Enabled||!w.Class.StartsWith("EBRibbonBar:",StringComparison.Ordinal))continue;if(bar!=0)throw new InvalidOperationException("Native ribbon ambiguous");bar=w.Hwnd;if(!GetWindowRect(new IntPtr(bar),out ribbon))throw new InvalidOperationException("Native ribbon rect absent");}
  int width=ribbon.r-ribbon.l,height=ribbon.b-ribbon.t;if(bar==0||height<64||height>400||width<500||width!=client.r-client.l)throw new InvalidOperationException("Native ribbon geometry differs from own main");
  foreach(var w in children){if(w.Class!="Qt5QWindowIcon"||w.Title!="EasyBuilder Pro"||!w.Visible||!w.Enabled||!IsChild(new IntPtr(main),new IntPtr(w.Hwnd)))continue;R r;if(GetWindowRect(new IntPtr(w.Hwnd),out r)&&r.l==ribbon.l&&r.t==ribbon.t&&r.r==ribbon.r&&r.b==ribbon.b){if(qt!=0)throw new InvalidOperationException("Owned ribbon Qt ambiguous");qt=w.Hwnd;}}
  if(qt==0)throw new InvalidOperationException("Owned ribbon Qt absent");
  return new NativeSemanticControls.RibbonProof{Main=main,Hwnd=qt,Left=ribbon.l,Top=ribbon.t,Width=width,Height=height,CapturedUtc=DateTime.UtcNow};
 }
 public static ObjectRibbonSemantic.Item[] ReadOrInvokeOwned(NativeControls n,NativeSemanticControls.RibbonProof proof,string exactLabel){
  if(proof==null||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds<0||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Fresh owned semantic ribbon proof required");
  NativeSemanticControls.RibbonProof current;
  if(proof.OwnedBackgroundRender){
   if(proof.CaptureMethod!="owned-printwindow-main-ribbon-physical"||proof.CallerDpiAwareness<1)throw new InvalidOperationException("Exact owned semantic render proof required");
   current=LocateOwnedBackgroundRibbon(n,proof.Main,proof.ProjectPath,proof.ProjectSha256);
   if(current.Main!=proof.Main||current.Pid!=proof.Pid||current.CreationUtcTicks!=proof.CreationUtcTicks)throw new InvalidOperationException("Background semantic owner changed");
  }else{
   current=LocateOwnedRibbon(n,proof.Main);
   if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height)throw new InvalidOperationException("Semantic ribbon geometry/identity changed");
  }
  int pid=0;foreach(var w in n.EnumChildControls(proof.Main))if(w.Hwnd==current.Hwnd)pid=w.Pid;if(pid<=0||pid!=current.Pid&&proof.OwnedBackgroundRender)throw new InvalidOperationException("Bound ribbon PID unavailable");
  if(proof.OwnedBackgroundRender&&exactLabel!=null&&exactLabel!="元件"&&exactLabel!="数值"&&exactLabel!="资料/历史"&&exactLabel!="事件登录"&&exactLabel!="配方检视"&&exactLabel!="工程文件"&&exactLabel!="地址"&&exactLabel!="建立下载数据"&&exactLabel!="图片")throw new InvalidOperationException("Reviewed background ribbon label required");
  var result=ObjectRibbonSemantic.ReadOrInvoke(current.Hwnd,pid,exactLabel);n.EnumChildControls(proof.Main);return result;
 }
 public static void Click(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y,string label){
 if(proof==null||(label!="元件"&&label!="元亻牛"&&label!="数值"&&label!="功能键"&&label!="位状态切换开关"&&label!="资料/历史"&&label!="事件登录"&&label!="配方检视"&&label!="检视"&&label!="常用"&&label!="窗口列表"&&label!="窗口复制"&&label!="工程文件"&&label!="地址"&&label!="工过文亻牛"&&label!="工程文亻牛"&&label!="建立下载数据"&&label!="文字标签库"&&label!="项目选单"&&label!="图片")||Double.IsNaN(x)||Double.IsNaN(y)||Double.IsInfinity(x)||Double.IsInfinity(y)||x<0||y<0||x>=proof.Width||y>=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds<0||(!proof.OwnedBackgroundRender&&GetForegroundWindow().ToInt64()!=proof.Main))throw new InvalidOperationException("Fresh owned exact object ribbon proof/foreground required");
 if(proof.OwnedBackgroundRender){ReobserveBackground(n,proof);if(!proof.Accepted||!proof.PrintWindowSucceeded)throw new InvalidOperationException("Accepted owned render required for background input");}
 string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");if(hash!=proof.Hash)throw new InvalidOperationException("Ribbon proof changed");R r;if(!GetWindowRect(new IntPtr(proof.Hwnd),out r)||r.l!=proof.Left||r.t!=proof.Top||r.r-r.l!=proof.Width||r.b-r.t!=proof.Height)throw new InvalidOperationException("Ribbon geometry changed");
 int sx=proof.Left+(int)x,sy=proof.Top+(int)y;long qt=0;foreach(var c in n.EnumChildControls(proof.Main)){if(c.Class!="Qt5QWindowIcon"||!c.Visible||!c.Enabled||c.Title!="EasyBuilder Pro"||!IsChild(new IntPtr(proof.Main),new IntPtr(c.Hwnd)))continue;R b;if(GetWindowRect(new IntPtr(c.Hwnd),out b)&&b.l==proof.Left&&b.t==proof.Top&&b.r-b.l==proof.Width&&b.b-b.t==proof.Height&&sx>=b.l&&sx<b.r&&sy>=b.t&&sy<b.b){if(qt!=0)throw new InvalidOperationException("Object ribbon input Qt ambiguous");qt=c.Hwnd;}}
 if(qt==0||qt!=proof.Hwnd)throw new InvalidOperationException("Object ribbon input Qt unavailable or changed");P p=new P{x=sx,y=sy};if(!ScreenToClient(new IntPtr(qt),ref p)||p.x<0||p.y<0||p.x>32767||p.y>32767)throw new InvalidOperationException("Object ribbon client point invalid");IntPtr lp=new IntPtr((p.y<<16)|p.x);
 if(!PostMessageW(new IntPtr(qt),0x200,UIntPtr.Zero,lp))throw new InvalidOperationException("Object ribbon pointer event failed");
 System.Threading.Thread.Sleep(80);var current=proof.OwnedBackgroundRender?ReobserveBackground(n,proof):LocateOwnedRibbon(n,proof.Main);if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Object ribbon proof/geometry changed before click");
 if(!PostMessageW(new IntPtr(qt),0x201,new UIntPtr(1),lp)||!PostMessageW(new IntPtr(qt),0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Object ribbon single click failed");
 }
 }
}

namespace PLCCode.Weinview {
public static class ObjectRibbonSemantic {
 public sealed class Item {public string name,action;public int role,state;public long provider_hwnd;public bool provider_window_present;}
 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
 [DllImport("oleacc.dll")]static extern int WindowFromAccessibleObject(IAccessible a,out IntPtr h);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindowEnabled(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindow(IntPtr h);
 class Node {public IAccessible a;public int child;}
 static void Owner(long hwnd,int pid){uint owner;if(!IsWindow(new IntPtr(hwnd))||GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid||!IsWindowVisible(new IntPtr(hwnd))||!IsWindowEnabled(new IntPtr(hwnd)))throw new Exception("Live own Qt menu required");}
 static void Scan(Node n,long hwnd,int pid,List<Item> found,List<Node> targets,int depth,ref int budget,HashSet<long> seen){
  if(++budget>128||depth>8)throw new Exception("Menu traversal bound");
  if(n.child==0){IntPtr unk=Marshal.GetIUnknownForObject(n.a);long key=unk.ToInt64();Marshal.Release(unk);if(!seen.Add(key))return;}
  IntPtr provider;int hr=WindowFromAccessibleObject(n.a,out provider);if(hr<0)Marshal.ThrowExceptionForHR(hr);
  uint owner=0;bool present=IsWindow(provider);if(present){GetWindowThreadProcessId(provider,out owner);if(owner!=(uint)pid)throw new Exception("Foreign live menu provider rejected");}
  int role=0;try{role=Convert.ToInt32(n.a.get_accRole(n.child));}catch(InvalidCastException){if(n.child!=0)throw;}
  if(role==12||role==37||role==43){found.Add(new Item{name=n.a.get_accName(n.child),action=n.a.get_accDefaultAction(n.child),role=role,state=Convert.ToInt32(n.a.get_accState(n.child)),provider_hwnd=provider.ToInt64(),provider_window_present=present});targets.Add(n);return;}
  if(n.child!=0)return;int count=n.a.accChildCount;if(count<0||count>64)throw new Exception("Menu branch bound");
  object[] children=new object[count];int got;hr=AccessibleChildren(n.a,0,count,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=count)throw new Exception("Menu child collection changed");
  foreach(object child in children){Node next;if(child is int)next=new Node{a=n.a,child=(int)child};else if(child is IAccessible)next=new Node{a=(IAccessible)child};else throw new Exception("Menu child representation changed");Scan(next,hwnd,pid,found,targets,depth+1,ref budget,seen);}
 }
 public static Item[] ReadOrInvoke(long hwnd,int pid,string exactName){
  Owner(hwnd,pid);var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out a);if(hr<0||a==null){if(exactName!=null)throw new Exception("Ribbon provider absent during invocation");return new Item[0];}
  var found=new List<Item>();var targets=new List<Node>();int budget=0;Scan(new Node{a=a},hwnd,pid,found,targets,0,ref budget,new HashSet<long>());Owner(hwnd,pid);
   if(exactName!=null){if(exactName!="元件"&&exactName!="数值"&&exactName!="功能键"&&exactName!="位状态切换开关"&&exactName!="项目选单"&&exactName!="资料/历史"&&exactName!="事件登录"&&exactName!="配方检视"&&exactName!="工程文件"&&exactName!="建立下载数据"&&exactName!="图片")throw new Exception("Unreviewed ribbon label");int index=-1;for(int i=0;i<found.Count;i++)if(found[i].name==exactName){if(index!=-1)throw new Exception("Ambiguous exact menu label");index=i;}if(index<0||(found[index].state&0x18001)!=0||String.IsNullOrEmpty(found[index].action))throw new Exception("Enabled exact menu action absent");Owner(hwnd,pid);targets[index].a.accDoDefaultAction(targets[index].child);}
  return found.ToArray();
 }
}

}
