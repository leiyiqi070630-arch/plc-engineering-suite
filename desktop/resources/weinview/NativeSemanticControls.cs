using System;
using System.Runtime.InteropServices;
internal class OwnedMsaaAction {
 [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint obj,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out Accessibility.IAccessible value);
 [DllImport("oleacc.dll")] static extern int AccessibleChildren(Accessibility.IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
 [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
 [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
 [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
 [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
 [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
 [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint msg,UIntPtr w,IntPtr l);
 internal class Target {public Accessibility.IAccessible acc;public int child;}
 internal static Target Resolve(long hwnd,int pid,string path) {
  uint actual;GetWindowThreadProcessId(new IntPtr(hwnd),out actual);if(actual!=(uint)pid)throw new Exception("Owner changed");
  var guid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");Accessibility.IAccessible root;
  int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),4294967292,ref guid,out root);if(hr!=0||root==null)throw new Exception("MSAA root unavailable");
  var target=new Target{acc=root,child=0};var parts=path.Split('/');
  if(parts.Length>12||parts[0]!="client")throw new Exception("Bounded path required");
  for(int n=1;n<parts.Length;n++){
   if(target.child!=0)throw new Exception("Leaf has no interface children");
   if(parts[n].StartsWith("id:")){target.child=Int32.Parse(parts[n].Substring(3));if(target.child<=0)throw new Exception("Invalid child ID");}
   else if(parts[n].StartsWith("index:")){
    int index=Int32.Parse(parts[n].Substring(6));if(index<0||index>=target.acc.accChildCount)throw new Exception("Child index no longer exists");
    object[] result=new object[1];int got;AccessibleChildren(target.acc,index,1,result,out got);if(got!=1)throw new Exception("Child unavailable");
    if(result[0] is int)target.child=(int)result[0];else if(result[0] is Accessibility.IAccessible)target=new Target{acc=(Accessibility.IAccessible)result[0],child=0};else throw new Exception("Unsupported child representation");
   }else throw new Exception("Unreviewed path segment");
  }
  return target;
 }
 public static int Execute(long hwnd,int pid,string path,string name,int role,string action){
  SetProcessDPIAware();var t=Resolve(hwnd,pid,path);if(t.acc.get_accName(t.child)!=name||Convert.ToInt32(t.acc.get_accRole(t.child))!=role)throw new Exception("Semantic target changed");
  int state=Convert.ToInt32(t.acc.get_accState(t.child));if((state&1)!=0)throw new Exception("Target unavailable");
  if(action=="ClickSemantic"){
   if(role!=36||(state&0x18000)!=0||!IsWindowVisible(new IntPtr(hwnd))||!IsWindowEnabled(new IntPtr(hwnd)))throw new Exception("Visible owned semantic tree item required");
   if((state&2)==0){
    if(t.acc.get_accDefaultAction(t.child)=="Toggle")t.acc.accDoDefaultAction(t.child);
    else t.acc.accSelect(2,t.child);
   }
   t=Resolve(hwnd,pid,path);state=Convert.ToInt32(t.acc.get_accState(t.child));
   if(t.acc.get_accName(t.child)!=name||(state&2)==0)throw new Exception("Native tree selection readback failed");return state;
  }
  if(action=="Select"){
   if(role!=36||(state&0x200000)==0)throw new Exception("Selectable tree item required");
   t.acc.accSelect(2,t.child);
   t=Resolve(hwnd,pid,path);if(t.acc.get_accName(t.child)!=name)throw new Exception("Selection target changed");
   state=Convert.ToInt32(t.acc.get_accState(t.child));if((state&2)==0)throw new Exception("Selected state readback failed");return state;
  }
  if(action=="Toggle"){
   if(role!=36||t.child!=0||t.acc.get_accDefaultAction(0)!="Toggle")throw new Exception("Qt leaf Toggle required");
   if((state&2)!=0)throw new Exception("Target is already selected; refuse toggle off");
   t.acc.accDoDefaultAction(0);
   t=Resolve(hwnd,pid,path);state=Convert.ToInt32(t.acc.get_accState(0));
   if(t.acc.get_accName(0)!=name||(state&2)==0)throw new Exception("Qt Toggle did not select intended model");return state;
  }
  if(action!="Invoke"||role!=43||t.child!=0||(state&0x18000)!=0||String.IsNullOrEmpty(t.acc.get_accDefaultAction(t.child)))throw new Exception("Visible leaf button with default action required");
  t.acc.accDoDefaultAction(t.child);return state;
 }
}
namespace PLCCode.Weinview {
 public sealed class NativeSemanticControls {
  readonly NativeControls native;
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(System.IntPtr h,out uint p);
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern System.IntPtr GetWindow(System.IntPtr h,uint command);
  [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)]struct R {public int l,t,r,b;}
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern bool GetWindowRect(System.IntPtr h,out R r);
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern bool GetClientRect(System.IntPtr h,out R r);
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern System.IntPtr GetForegroundWindow();
  [System.Runtime.InteropServices.DllImport("user32.dll")]static extern bool SetProcessDPIAware();
  [System.Runtime.InteropServices.DllImport("user32.dll",SetLastError=true)]static extern bool PostMessageW(System.IntPtr h,uint m,System.UIntPtr w,System.IntPtr l);
  [System.Runtime.InteropServices.DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(System.IntPtr hwnd,uint obj,ref System.Guid iid,[System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Interface)]out Accessibility.IAccessible value);
  public sealed class MigrationReportCloseReceipt {public string Title,SemanticRoot,ClosePath,Action;public long ModalHwnd;}
  const string MigrationReportTitle="工程文件迁移报告";
  const string MigrationClose="关闭";
  const string MigrationSave="保存文件";
  bool HasOwnedWindowAncestor(long window,long mainHwnd){
   uint mainPid;GetWindowThreadProcessId(new System.IntPtr(mainHwnd),out mainPid);
   var owner=GetWindow(new System.IntPtr(window),4);
   for(int depth=0;owner!=System.IntPtr.Zero&&depth<16;depth++){
    uint ownerPid;GetWindowThreadProcessId(owner,out ownerPid);
    if(ownerPid!=mainPid)return false;
    if(owner.ToInt64()==mainHwnd)return true;
    owner=GetWindow(owner,4);
   }
   return false;
  }
  void FindMigrationButtons(Accessibility.IAccessible acc,string path,int depth,ref int visited,System.Collections.Generic.List<string> close,System.Collections.Generic.List<string> save){
   if(++visited>128||depth>6)throw new System.Exception("Migration report semantic tree budget exceeded.");
   int role=System.Convert.ToInt32(acc.get_accRole(0));
   if(role==24)return; // Report rows can number in the thousands.
   if(role==43){string name=acc.get_accName(0);if(name==MigrationClose)close.Add(path);else if(name==MigrationSave)save.Add(path);}
   int count=acc.accChildCount;if(count<0||count>64)throw new System.Exception("Migration report semantic child budget exceeded.");
   for(int i=0;i<count;i++){
    object[] children=new object[1];int obtained;int hr=AccessibleChildren(acc,i,1,children,out obtained);
    if(hr<0)System.Runtime.InteropServices.Marshal.ThrowExceptionForHR(hr);
    if(obtained!=1)throw new System.Exception("Migration report semantic child unavailable.");
    var nested=children[0] as Accessibility.IAccessible;
    if(nested!=null)FindMigrationButtons(nested,path+"/index:"+i,depth+1,ref visited,close,save);
    else if(children[0] is int){int id=(int)children[0];if(System.Convert.ToInt32(acc.get_accRole(id))!=43)continue;string name=acc.get_accName(id);if(name==MigrationClose)close.Add(path+"/id:"+id);else if(name==MigrationSave)save.Add(path+"/id:"+id);}
    else throw new System.Exception("Migration report semantic child representation changed.");
   }
  }
  public MigrationReportCloseReceipt TryCloseProjectMigrationReport(long mainHwnd){
   var tops=native.EnumTopWindows();WindowInfo main=null,report=null;
   foreach(var w in tops)if(w.Hwnd==mainHwnd){main=w;break;}
   if(main==null||main.Class!="EasyBuilderPro"||!main.Visible)throw new System.Exception("Bound EasyBuilderPro main window required.");
   foreach(var w in tops){
    if(w.Class!="#32770"||w.Title!=MigrationReportTitle||!w.Visible)continue;
    if(!HasOwnedWindowAncestor(w.Hwnd,mainHwnd))continue;
    if(report!=null)throw new System.Exception("Owned migration report is ambiguous.");report=w;
   }
   if(report==null)return null;
   if(!report.Enabled)throw new System.Exception("Owned migration report is disabled.");
   WindowInfo qt=null;foreach(var w in native.EnumChildControls(report.Hwnd))if(w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){if(qt!=null)throw new System.Exception("Migration report Qt root is ambiguous.");qt=w;}
   if(qt==null)throw new System.Exception("Visible migration report Qt root unavailable.");
   var iid=new System.Guid("618736E0-3C3D-11CF-810C-00AA00389B71");Accessibility.IAccessible root;
   if(AccessibleObjectFromWindow(new System.IntPtr(qt.Hwnd),4294967292,ref iid,out root)!=0||root==null)throw new System.Exception("Migration report MSAA client unavailable.");
   int visited=0;var close=new System.Collections.Generic.List<string>();var save=new System.Collections.Generic.List<string>();FindMigrationButtons(root,"client",0,ref visited,close,save);
   if(close.Count!=1||save.Count!=1)throw new System.Exception("Unique migration report Close and Save buttons required.");
   uint pid;GetWindowThreadProcessId(new System.IntPtr(mainHwnd),out pid);
   var closeTarget=OwnedMsaaAction.Resolve(qt.Hwnd,(int)pid,close[0]);var saveTarget=OwnedMsaaAction.Resolve(qt.Hwnd,(int)pid,save[0]);
   if(closeTarget.child!=0||saveTarget.child!=0||closeTarget.acc.get_accName(0)!=MigrationClose||saveTarget.acc.get_accName(0)!=MigrationSave||System.Convert.ToInt32(closeTarget.acc.get_accRole(0))!=43||System.Convert.ToInt32(saveTarget.acc.get_accRole(0))!=43||closeTarget.acc.get_accDefaultAction(0)!="Press"||saveTarget.acc.get_accDefaultAction(0)!="Press"||(System.Convert.ToInt32(closeTarget.acc.get_accState(0))&0x18001)!=0||(System.Convert.ToInt32(saveTarget.acc.get_accState(0))&0x18001)!=0)throw new System.Exception("Migration report buttons changed.");
   var fresh=native.EnumTopWindows();bool stillOwned=false;foreach(var w in fresh)if(w.Hwnd==report.Hwnd&&w.Class=="#32770"&&w.Title==MigrationReportTitle&&w.Visible&&w.Enabled&&HasOwnedWindowAncestor(w.Hwnd,mainHwnd)){stillOwned=true;break;}
   if(!stillOwned)throw new System.Exception("Migration report changed before close.");
   bool stillChild=false;foreach(var w in native.EnumChildControls(report.Hwnd))if(w.Hwnd==qt.Hwnd&&w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){stillChild=true;break;}
   if(!stillChild)throw new System.Exception("Migration report Qt root changed before close.");
   OwnedMsaaAction.Execute(qt.Hwnd,(int)pid,close[0],MigrationClose,43,"Invoke");
   return new MigrationReportCloseReceipt{Title=MigrationReportTitle,ModalHwnd=report.Hwnd,SemanticRoot="Qt5QWindowIcon/client",ClosePath=close[0],Action="close_informational_report"};
  }
  public sealed class RibbonProof {public long Hwnd;public long Main;public int Left,Top,Width,Height;public string Path,Hash;public System.DateTime CapturedUtc;public bool OwnedBackgroundRender,PrintWindowSucceeded,Accepted;public int ColorCount,CallerDpiAwareness,WindowDpi,Pid;public long ForegroundBefore,ForegroundAfter;public int[] MainBounds;public string CaptureMethod,ProjectPath,ProjectSha256,CreationUtcTicks;}
  static string Sha(string path){using(var f=System.IO.File.OpenRead(path))using(var sha=System.Security.Cryptography.SHA256.Create())return System.BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");}
  public static string CreateLeftRibbonOcrImage(RibbonProof proof){return CreateLeftRibbonOcrImage(proof,700);}
  public static string CreateLeftRibbonOcrImage(RibbonProof proof,int sourceWidth){
   if(proof==null||System.DateTime.UtcNow<proof.CapturedUtc||(System.DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||Sha(proof.Path)!=proof.Hash)throw new System.Exception("Fresh unchanged owned ribbon image required for OCR crop");
   if(sourceWidth!=700&&sourceWidth!=1000)throw new System.Exception("Reviewed left ribbon OCR crop width required");
   string output=proof.Path+".left"+sourceWidth+"-2x.png";
   using(var source=new System.Drawing.Bitmap(proof.Path)){
    if(source.Width!=proof.Width||source.Height!=proof.Height||source.Width<sourceWidth||source.Height<64||source.Height>400)throw new System.Exception("Owned ribbon image dimensions differ before OCR crop");
    using(var target=new System.Drawing.Bitmap(sourceWidth*2,source.Height*2))using(var graphics=System.Drawing.Graphics.FromImage(target)){
     graphics.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
     graphics.DrawImage(source,new System.Drawing.Rectangle(0,0,target.Width,target.Height),new System.Drawing.Rectangle(0,0,sourceWidth,source.Height),System.Drawing.GraphicsUnit.Pixel);
     target.Save(output,System.Drawing.Imaging.ImageFormat.Png);
    }
   }
   return output;
  }

  // Finite exact masks for reviewed CN421 ribbon captions. The semantic
  // provider and OCR remain primary. No arbitrary pattern or global input.
  public sealed class CaptionMatch {public double X,Y;public string TemplateSha256;public int ExactMatches;}
  const string SystemParametersCaptionBits="AAAAAAAAAAAAAAAAAAAEQgCAIQB/gBAYAQAAICfx/j74BBBIAQBkgH8ciP/KJAAgD+FoEAAMIhQc4QQA/5whGd8wAEAhJzCRgDLGSQYD0gJxSDHAIQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const string SystemParametersCaptionSha="F56DFA48F76F99ED9D32A974C925BA0DF129298F20E612C2889983EAF9EF645B";
  const string ViewCaptionBits="//////////eeYH949vfBJCl/ZzKX5ANpfj/il8G0SX1odhf2T3H/fvZb9ANcP/////////A=";
  const string ViewCaptionSha="FABF2C70CC077B0E8EB038AFB8D1751E8431D73DEC864C72F9C8E1FED0B69647";
  const string WindowListCaptionBits="AAAAAAAAAAAAAAAAAAAAAAAAAAACAf4/EAAB/4AAQJ/4ARAAAAQAADRgADwn/gP/gAEBAAACCAARCf/AH0AA8EBEAwIAAIIBgAEQAAgRhABij/CAkJwH/AAIHBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const string WindowListCaptionSha="FDBBF3E4E0E379D57F23E118964114B44D8D27FEC475B15471CCC3EE845A61C7";
  const string ElementCaptionBits="//////////gB73///kv///bf//8wHwAJN/+3i7/5vX3/zfoB/u7ff+d2+/z4N9//////////4A==";
  const string ElementCaptionSha="FBBA9ACE907721EFF432837157470C5DB76B7AA352805FDB1CC8790703B03879";
  const string NumericCaptionBits="AAAAAAAAAAAAIAQgv8CAEIB98P4DJJBBRJP4CABBAggP4PmBBBIwP4HpBBBCEf8AAAAAAAAA";
  const string NumericCaptionSha="043EC30F8BA050F9A4C70B0A37187E8B0C6A9C457646A732EAAC9F7BDBC776AD";
  const string BitSwitchCaptionBits="AAAAAAAAAAAAAACICIAAEAAQP/AAACBFAACfgPACAgBf6iT/xAXogBD/wgBRAGB4IAgAgAAwEf8EgQEH9/+AAZAEQNIICICAIf/EiGIIBEBYBCEAwCBFCAQCog/xCAQBEAkgkBkQCAhAQAggUJQkkICAggwQX+MCHwE5sGgQgGAAAAAAAAAAAAAAAA==";
  const string BitSwitchCaptionSha="016E69F92F6E10ED98A8300D7B4FAC40813DEC5590536E878233B1FED7D28C9F";
  const string HistoryCaptionBits="////////////////////+7/Pv8AHz//QAEv0//z//mWGPk78AP+cPPvk78zv8zgBvsAMzv/APOvM7sAP/fuHjczvzv/ZuAOczuT//ZtPudnvH//wfPu9PPB/+PjPs4cIcH////8/////////////////////////";
  const string HistoryCaptionSha="5E43206B86686A7211408F053031F75E384976E483A9484C4D966A04DE04E8EC";
  public static CaptionMatch FindPinnedRibbonCaption(string imagePath,string label){
   int width,height;string encoded,templateSha;bool header;
   if(label=="系统参数"){width=53;height=18;encoded=SystemParametersCaptionBits;templateSha=SystemParametersCaptionSha;header=false;}
   else if(label=="检视"){width=28;height=15;encoded=ViewCaptionBits;templateSha=ViewCaptionSha;header=true;}
   else if(label=="窗口列表"){width=53;height=18;encoded=WindowListCaptionBits;templateSha=WindowListCaptionSha;header=false;}
   else if(label=="元件"){width=29;height=15;encoded=ElementCaptionBits;templateSha=ElementCaptionSha;header=true;}
   else if(label=="资料/历史"){width=60;height=16;encoded=HistoryCaptionBits;templateSha=HistoryCaptionSha;header=true;}
   else if(label=="数值"){width=27;height=16;encoded=NumericCaptionBits;templateSha=NumericCaptionSha;header=false;}
   else if(label=="位状态切换开关"){width=85;height=13;encoded=BitSwitchCaptionBits;templateSha=BitSwitchCaptionSha;header=false;}
   else throw new System.Exception("Unreviewed pinned ribbon caption; no input");
   var expected=System.Convert.FromBase64String(encoded);
   using(var bmp=new System.Drawing.Bitmap(imagePath)){
    if(bmp.Height!=131||bmp.Width<500||bmp.Width>10000)return null;
    var pixels=new bool[bmp.Width*bmp.Height];
    for(int y=0;y<bmp.Height;y++)for(int x=0;x<bmp.Width;x++){var c=bmp.GetPixel(x,y);pixels[y*bmp.Width+x]=(299*c.R+587*c.G+114*c.B)/1000<128;}
    int anchor=0;while(anchor<width*height&&(expected[anchor/8]&(1<<(7-anchor%8)))==0)anchor++;
    if(anchor==width*height)throw new System.Exception("Pinned caption mask has no ink");
    int firstTop=header?0:bmp.Height/4,lastTop=header?bmp.Height/4-height:bmp.Height-height;
    CaptionMatch found=null;
    for(int top=firstTop;top<=lastTop;top++)for(int left=0;left<=bmp.Width-width;left++){
     if(!pixels[(top+anchor/width)*bmp.Width+left+anchor%width])continue;
     bool same=true;for(int i=0;i<width*height;i++){bool bit=(expected[i/8]&(1<<(7-i%8)))!=0;if(pixels[(top+i/width)*bmp.Width+left+i%width]!=bit){same=false;break;}}
     if(!same)continue;if(found!=null)throw new System.Exception("Pinned ribbon caption is ambiguous; no input");
     found=new CaptionMatch{X=left+width/2.0,Y=top+height/2.0,TemplateSha256=templateSha,ExactMatches=1};
    }
    return found;
   }
  }
  public static CaptionMatch FindSystemParametersCaption(string imagePath){return FindPinnedRibbonCaption(imagePath,"系统参数");}
  public CaptionMatch ClickSystemParametersCaption(RibbonProof proof){
   if(proof==null||(System.DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||Sha(proof.Path)!=proof.Hash)throw new System.Exception("Fresh unchanged owned ribbon proof required");
   var match=FindSystemParametersCaption(proof.Path);if(match==null)return null;
   // Existing click revalidates PID, foreground, HWND/rectangle, frame SHA,
   // proof age and bounds independently of the pixel locator.
   ClickSystemParameters(proof,match.X,match.Y,"系统参数");return match;
  }
  public sealed class SystemParametersEntry {public long RibbonHwnd;public string Path,Label,Action;}
  bool FindSystemParametersEntries(Accessibility.IAccessible acc,int child,string path,int depth,ref int visited,System.Collections.Generic.List<long> seen,System.Collections.Generic.List<string> found){
   if(++visited>128||depth>8)return false;
   if(child==0){var identity=System.Runtime.InteropServices.Marshal.GetIUnknownForObject(acc);long key=identity.ToInt64();System.Runtime.InteropServices.Marshal.Release(identity);if(seen.Contains(key))return true;seen.Add(key);}
   int role=System.Convert.ToInt32(acc.get_accRole(child));int state=System.Convert.ToInt32(acc.get_accState(child));
   if((state&0x18001)!=0)return true;
   if((role==43||role==12)&&acc.get_accName(child)=="系统参数"&&!System.String.IsNullOrEmpty(acc.get_accDefaultAction(child)))found.Add(path);
   if(child!=0)return true;int count=acc.accChildCount;if(count<0||count>64)return false;
   var children=new object[count];int got;int hr=AccessibleChildren(acc,0,count,children,out got);if(hr<0||got!=count)return false;
   for(int i=0;i<got;i++){
    var nested=children[i] as Accessibility.IAccessible;
    if(nested!=null){if(!FindSystemParametersEntries(nested,0,path+"/index:"+i,depth+1,ref visited,seen,found))return false;}
    else if(children[i] is int){if(!FindSystemParametersEntries(acc,(int)children[i],path+"/id:"+children[i],depth+1,ref visited,seen,found))return false;}
    else return false;
   }
   return true;
  }
  public SystemParametersEntry TryInvokeSystemParameters(long main){
   SetProcessDPIAware();R rect;long hwnd=Ribbon(main,out rect);uint pid;GetWindowThreadProcessId(new System.IntPtr(hwnd),out pid);
   var iid=new System.Guid("618736E0-3C3D-11CF-810C-00AA00389B71");Accessibility.IAccessible root;
   if(AccessibleObjectFromWindow(new System.IntPtr(hwnd),0xfffffffc,ref iid,out root)!=0||root==null)return null;
   int visited=0;var found=new System.Collections.Generic.List<string>();
   // Some EBPro Qt ribbons expose no buttons. Only then use the existing
   // current-image fallback; a live accessible button needs no image/OCR.
   try{if(!FindSystemParametersEntries(root,0,"client",0,ref visited,new System.Collections.Generic.List<long>(),found))return null;}
   catch(System.Runtime.InteropServices.COMException){return null;}
   catch(System.InvalidCastException){return null;}
   catch(System.FormatException){return null;}
   if(found.Count==0)return null;if(found.Count!=1)throw new System.Exception("System-parameter semantic entry is ambiguous.");
   R current;if(Ribbon(main,out current)!=hwnd)throw new System.Exception("System-parameter ribbon owner changed.");
   var target=OwnedMsaaAction.Resolve(hwnd,(int)pid,found[0]);int role=System.Convert.ToInt32(target.acc.get_accRole(target.child));
   string action=target.acc.get_accDefaultAction(target.child);
   if(target.acc.get_accName(target.child)!="系统参数"||(role!=43&&role!=12)||(System.Convert.ToInt32(target.acc.get_accState(target.child))&0x18001)!=0||System.String.IsNullOrEmpty(action))throw new System.Exception("System-parameter semantic entry changed.");
   target.acc.accDoDefaultAction(target.child);
   return new SystemParametersEntry{RibbonHwnd=hwnd,Path=found[0],Label="系统参数",Action=action};
  }
  long Ribbon(long main,out R rect){
   native.EnumChildControls(main);if(GetForegroundWindow().ToInt64()!=main)throw new System.Exception("Owned main must be foreground for ribbon capture.");
   var children=native.EnumChildControls(main);R client;if(!GetClientRect(new System.IntPtr(main),out client))throw new System.Exception("Main client rect absent.");
   long bar=0;R ribbon=new R();foreach(var w in children)if(w.Visible&&w.Enabled&&w.Class.StartsWith("EBRibbonBar:",System.StringComparison.Ordinal)){if(bar!=0)throw new System.Exception("Native ribbon not unique.");bar=w.Hwnd;if(!GetWindowRect(new System.IntPtr(bar),out ribbon))throw new System.Exception("Native ribbon rect absent.");}
   int height=ribbon.b-ribbon.t,width=ribbon.r-ribbon.l;if(bar==0||height<64||height>400||width<500||width!=client.r-client.l)throw new System.Exception("Bound native ribbon size differs from owned main client.");
   long found=0;rect=new R();foreach(var w in children){if(w.Class!="Qt5QWindowIcon"||!w.Visible||!w.Enabled)continue;R r;if(!GetWindowRect(new System.IntPtr(w.Hwnd),out r))continue;if(r.l!=ribbon.l||r.t!=ribbon.t||r.r!=ribbon.r||r.b!=ribbon.b)continue;if(found!=0)throw new System.Exception("Ribbon Qt root is not unique.");found=w.Hwnd;rect=r;}if(found==0)throw new System.Exception("Bound Qt ribbon unavailable.");return found;
  }  public RibbonProof CaptureRibbon(long main,string path){SetProcessDPIAware();R rect;long h=Ribbon(main,out rect);if(System.IO.File.Exists(path))throw new System.Exception("Fresh ribbon evidence path required.");using(var bmp=new System.Drawing.Bitmap(rect.r-rect.l,rect.b-rect.t)){using(var g=System.Drawing.Graphics.FromImage(bmp))g.CopyFromScreen(rect.l,rect.t,0,0,bmp.Size);bmp.Save(path,System.Drawing.Imaging.ImageFormat.Png);}R now;if(Ribbon(main,out now)!=h||now.l!=rect.l||now.t!=rect.t||now.r!=rect.r||now.b!=rect.b)throw new System.Exception("Ribbon moved while capturing.");return new RibbonProof{Hwnd=h,Main=main,Left=rect.l,Top=rect.t,Width=rect.r-rect.l,Height=rect.b-rect.t,Path=path,Hash=Sha(path),CapturedUtc=System.DateTime.UtcNow};}
  public void ClickSystemParameters(RibbonProof proof,double x,double y,string exactOcrLabel){
   if(proof==null||(exactOcrLabel!="系统参数"&&exactOcrLabel!="系统莎数")||System.Double.IsNaN(x)||System.Double.IsNaN(y)||System.Double.IsInfinity(x)||System.Double.IsInfinity(y)||x<0||y<0||x>=proof.Width||y>=proof.Height)throw new System.Exception("Exact system-parameter label proof required.");
   if((System.DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||Sha(proof.Path)!=proof.Hash)throw new System.Exception("Ribbon screenshot stale or changed.");
   R r;if(Ribbon(proof.Main,out r)!=proof.Hwnd||r.l!=proof.Left||r.t!=proof.Top||r.r-r.l!=proof.Width||r.b-r.t!=proof.Height)throw new System.Exception("Ribbon owner/rect changed.");
   var point=new System.IntPtr(((int)y<<16)|((int)x&65535));var hwnd=new System.IntPtr(proof.Hwnd);
   // Qt selects the ribbon child under the pointer on WM_MOUSEMOVE. Sending
   // only button messages can silently target the previously hovered child.
   if(!PostMessageW(hwnd,0x200,System.UIntPtr.Zero,point))throw new System.Exception("System-parameter ribbon pointer event failed.");
   System.Threading.Thread.Sleep(80);
   if(Ribbon(proof.Main,out r)!=proof.Hwnd||r.l!=proof.Left||r.t!=proof.Top||r.r-r.l!=proof.Width||r.b-r.t!=proof.Height||(System.DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new System.Exception("Ribbon changed before system-parameter click.");
   if(!PostMessageW(hwnd,0x201,new System.UIntPtr(1),point)||!PostMessageW(hwnd,0x202,System.UIntPtr.Zero,point))throw new System.Exception("Owned system-parameter ribbon click failed.");
  }
  [System.Runtime.InteropServices.DllImport("oleacc.dll")]static extern int AccessibleChildren(Accessibility.IAccessible a,int start,int count,[System.Runtime.InteropServices.Out,System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int got);
  void FindCell(Accessibility.IAccessible a,string path,string name,int depth,ref int count,System.Collections.Generic.List<string> found){if(++count>128||depth>5)throw new System.Exception("Device tree semantic budget exceeded.");int role=System.Convert.ToInt32(a.get_accRole(0));if(role==36&&a.get_accName(0)==name)found.Add(path);int total=a.accChildCount;if(total<0||total>64)throw new System.Exception("Device tree child budget exceeded.");for(int i=0;i<total;i++){object[] c=new object[1];int got;int hr=AccessibleChildren(a,i,1,c,out got);if(hr<0)System.Runtime.InteropServices.Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new System.Exception("Device tree child unavailable.");var next=c[0] as Accessibility.IAccessible;if(next!=null)FindCell(next,path+"/index:"+i,name,depth+1,ref count,found);else if(c[0] is int){int id=(int)c[0];if(System.Convert.ToInt32(a.get_accRole(id))==36&&a.get_accName(id)==name)found.Add(path+"/id:"+id);}else throw new System.Exception("Device tree child representation changed.");}}
  public string FindUniqueDeviceRow(long root,string name){native.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new System.IntPtr(root),out pid);string path="client/index:0/index:0/index:0/index:2/index:0/index:0";var branch=OwnedMsaaAction.Resolve(root,(int)pid,path);if(branch.child!=0)throw new System.Exception("Device tree branch has no interface.");int count=0;var found=new System.Collections.Generic.List<string>();FindCell(branch.acc,path,name,0,ref count,found);if(found.Count==0)throw new System.Exception("Device name absent in actual device tree.");if(found.Count!=1)throw new System.Exception("Device name duplicated in actual device tree.");native.EnumChildControls(root);return found[0];}  public NativeSemanticControls(NativeControls n){if(n==null)throw new System.ArgumentNullException("n");native=n;}
  public int Execute(long root,string path,string name,int role,string action){native.EnumChildControls(root);uint p;GetWindowThreadProcessId(new System.IntPtr(root),out p);if(action=="ClickSemantic"){if(role!=36||string.IsNullOrEmpty(name))throw new System.Exception("Device row name required.");}else if(action=="Invoke"){if(role!=43||!(name=="新增设备/服务器..."||name=="设置..."||name=="确定"||name=="取消"))throw new System.Exception("PLC semantic button outside allowlist.");}else throw new System.Exception("PLC semantic action outside allowlist.");int state=OwnedMsaaAction.Execute(root,(int)p,path,name,role,action);native.EnumTopWindows();return state;}
 }
}
