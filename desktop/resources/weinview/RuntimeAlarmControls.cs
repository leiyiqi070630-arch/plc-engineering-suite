using System;using System.Collections.Generic;using System.Drawing;using System.Drawing.Imaging;using System.IO;using System.Runtime.InteropServices;using Accessibility;using System.Windows.Automation;
namespace PLC Engineering Suite.Weinview { public static class RuntimeAlarmControls {
 [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}
 [DllImport("user32.dll")][return:MarshalAs(UnmanagedType.Bool)]static extern bool PrintWindow(IntPtr h,IntPtr dc,uint flags);
 [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out R r);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindowEnabled(IntPtr h);
 [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int got);
 public sealed class Node {public string path,name,value,action,kind;public int role,state,count,process_id;public int[] bounds;}
 public sealed class Result {public List<Node> rows=new List<Node>();public bool provider_available,truncated;public string error;}
 static void Owned(long hwnd,int pid){uint actual;if(GetWindowThreadProcessId(new IntPtr(hwnd),out actual)==0||actual!=pid||!IsWindowVisible(new IntPtr(hwnd))||!IsWindowEnabled(new IntPtr(hwnd)))throw new Exception("Original visible enabled runtime HWND/PID required.");}
 public static void PrepareCallerDpi(){SetProcessDPIAware();}
 public static bool Is800Canvas(long hwnd,int pid){Owned(hwnd,pid);R r;return GetClientRect(new IntPtr(hwnd),out r)&&r.l==0&&r.t==0&&r.r==800&&r.b==480;}
 public static object Capture(long canvas,int pid,string output){
  SetProcessDPIAware();Owned(canvas,pid);R r;if(!GetClientRect(new IntPtr(canvas),out r)||r.l!=0||r.t!=0||r.r!=800||r.b!=480||File.Exists(output))throw new Exception("Exact800x480 original canvas/fresh PNG required.");
  long fg=GetForegroundWindow().ToInt64();bool ok;int colors=0;
  using(var image=new Bitmap(800,480,PixelFormat.Format32bppArgb)){
   using(var g=Graphics.FromImage(image)){g.Clear(Color.Magenta);IntPtr dc=g.GetHdc();try{ok=PrintWindow(new IntPtr(canvas),dc,2);}finally{g.ReleaseHdc(dc);}}
   Owned(canvas,pid);R after;if(!GetClientRect(new IntPtr(canvas),out after)||after.r!=r.r||after.b!=r.b)throw new Exception("Original runtime canvas changed during capture.");
   var seen=new HashSet<int>();for(int y=0;y<480;y+=8)for(int x=0;x<800;x+=8)seen.Add(image.GetPixel(x,y).ToArgb());colors=seen.Count;image.Save(output,ImageFormat.Png);
  }
  return new {canvas_hwnd=canvas,process_pid=pid,client_bounds=new int[]{0,0,800,480},print_window_succeeded=ok,color_count=colors,accepted=ok&&colors>1,foreground_before=fg,foreground_after=GetForegroundWindow().ToInt64(),capture_method="owned canvas PrintWindow(flags2)",input_performed=false};
 }
 static void Scan(IAccessible a,int id,string path,int depth,Result result,HashSet<long> seen){
  if(depth>8||result.rows.Count>=180){result.truncated=true;return;}
  if(id==0){IntPtr identity=Marshal.GetIUnknownForObject(a);try{if(!seen.Add(identity.ToInt64()))return;}finally{Marshal.Release(identity);}}
  int count=id==0?a.accChildCount:0;if(count<0||count>128)throw new Exception("Runtime MSAA branch exceeds128.");
  int x,y,w,h;a.accLocation(out x,out y,out w,out h,id);
  result.rows.Add(new Node{path=path,name=a.get_accName(id),value=a.get_accValue(id),action=a.get_accDefaultAction(id),role=Convert.ToInt32(a.get_accRole(id)),state=Convert.ToInt32(a.get_accState(id)),count=count,bounds=new int[]{x,y,w,h},kind="MSAA"});
  for(int i=0;i<count&&!result.truncated;i++){object[] items=new object[1];int got;int hr=AccessibleChildren(a,i,1,items,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Runtime MSAA child unavailable.");IAccessible child=items[0] as IAccessible;if(child!=null)Scan(child,0,path+"/index:"+i,depth+1,result,seen);else if(items[0] is int)Scan(a,(int)items[0],path+"/id:"+items[0],depth+1,result,seen);else throw new Exception("Runtime MSAA child type differs.");}
 }
 public static Result Msaa(long hwnd,int pid){
  Owned(hwnd,pid);var result=new Result();try{Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out a);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(a==null)throw new Exception("Actual runtime MSAA provider absent.");result.provider_available=true;Scan(a,0,"client",0,result,new HashSet<long>());}catch(Exception error){result.error=error.Message;}Owned(hwnd,pid);return result;
 }
 static void UiaScan(AutomationElement a,int pid,string path,int depth,Result result){
  if(depth>8||result.rows.Count>=180){result.truncated=true;return;}
  var p=a.Current;if(p.ProcessId!=pid)throw new Exception("Foreign runtime UIA provider rejected.");var b=p.BoundingRectangle;string value=null;object pattern;
  if(a.TryGetCurrentPattern(ValuePattern.Pattern,out pattern))value=((ValuePattern)pattern).Current.Value;
  result.rows.Add(new Node{path=path,name=p.Name,value=value,kind="UIA",role=p.ControlType.Id,process_id=p.ProcessId,bounds=new int[]{(int)b.X,(int)b.Y,(int)b.Width,(int)b.Height}});
  var walker=TreeWalker.RawViewWalker;var child=walker.GetFirstChild(a);int i=0;while(child!=null&&!result.truncated){if(i>=128)throw new Exception("Runtime UIA branch exceeds128.");UiaScan(child,pid,path+"/index:"+i,depth+1,result);child=walker.GetNextSibling(child);i++;}
 }
 public static Result Uia(long hwnd,int pid){
  Owned(hwnd,pid);var result=new Result();try{var a=AutomationElement.FromHandle(new IntPtr(hwnd));if(a==null)throw new Exception("Actual runtime UIA provider absent.");result.provider_available=true;UiaScan(a,pid,"root",0,result);}catch(Exception error){result.error=error.Message;}Owned(hwnd,pid);return result;
 }

 [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")]static extern bool ShowWindow(IntPtr hwnd,int command);
 [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr hwnd,uint command);
 [DllImport("user32.dll")]static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
 [DllImport("user32.dll")]static extern bool ClientToScreen(IntPtr hwnd,ref Point point);
 [DllImport("user32.dll")]static extern short GetAsyncKeyState(int key);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetWindowTextW(IntPtr hwnd,System.Text.StringBuilder text,int count);
 [DllImport("user32.dll")]static extern IntPtr GetAncestor(IntPtr hwnd,uint flags);
 [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetClassNameW(IntPtr hwnd,System.Text.StringBuilder text,int count);
 [DllImport("user32.dll",SetLastError=true)]static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
 [DllImport("user32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern IntPtr SendMessageTimeoutW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam,uint flags,uint timeout,out UIntPtr result);
 [DllImport("user32.dll")]static extern bool EnumWindows(EnumProc callback,IntPtr param);
 delegate bool EnumProc(IntPtr hwnd,IntPtr param);
 [StructLayout(LayoutKind.Sequential)]struct ThreadInfo {public uint size,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public R caretRect;}
 [DllImport("user32.dll")]static extern bool GetGUIThreadInfo(uint thread,ref ThreadInfo info);
 static string Sha(string path){using(var stream=File.OpenRead(path))using(var algorithm=System.Security.Cryptography.SHA256.Create())return BitConverter.ToString(algorithm.ComputeHash(stream)).Replace("-","");}
 static string Class(long hwnd){var text=new System.Text.StringBuilder(256);if(GetClassNameW(new IntPtr(hwnd),text,256)<=0)throw new Exception("Actual runtime class unavailable.");return text.ToString();}
 static void Identity(int pid,long ticks,string exe,string hash){
  using(var process=System.Diagnostics.Process.GetProcessById(pid)){if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase)||Path.GetFileName(exe)!="gui_e30.exe"||Sha(exe)!=hash)throw new Exception("Original runtime gui_e30 identity/SHA changed.");}
 }
 static void Pair(long canvas,long main,int pid){
  Owned(canvas,pid);Owned(main,pid);if(Class(canvas)!="fltk"||Class(main)!="fltk"||GetAncestor(new IntPtr(canvas),2).ToInt64()!=main||!Is800Canvas(canvas,pid))throw new Exception("Exact original fltk main/canvas ancestry required.");
  bool modal=false;Exception error=null;EnumProc callback=delegate(IntPtr hwnd,IntPtr ignored){try{uint owner;GetWindowThreadProcessId(hwnd,out owner);if(owner==pid&&IsWindowVisible(hwnd)&&Class(hwnd.ToInt64())=="#32770")modal=true;return true;}catch(Exception ex){error=ex;return false;}};
  bool complete=EnumWindows(callback,IntPtr.Zero);GC.KeepAlive(callback);if(error!=null||!complete||modal)throw new Exception("Unknown owned runtime modal or incomplete inspection.");
 }
 public static int[] ToClientBounds(long canvas,int pid,int[] bounds){
  Owned(canvas,pid);if(bounds==null||bounds.Length!=4||bounds[2]<=0||bounds[3]<=0)throw new Exception("Actual semantic row bounds required.");var first=new Point(bounds[0],bounds[1]);var last=new Point(bounds[0]+bounds[2],bounds[1]+bounds[3]);if(!ScreenToClient(new IntPtr(canvas),ref first)||!ScreenToClient(new IntPtr(canvas),ref last))throw new Exception("Actual row client mapping failed.");return new int[]{first.X,first.Y,last.X,last.Y};
 }
 public sealed class ClickEvidence {
  public int process_pid,client_x,client_y;public long creation_utc_ticks,main_hwnd,canvas_hwnd,foreground_before,foreground_after,active_hwnd,observed_utc_ticks,captured_utc_ticks;
  public string exe_path,exe_sha256,observed_utc,image_path,image_sha256;public bool activation_requested,posted,global_input,input_performed;public int[] al_rect,matched_bounds;public uint[] messages;public long[] lparams;
 }
 // cMT is a distinct original Qt viewport. The legacy fltk identity and click
 // contract below remain unchanged; this branch never writes HMI registers.
 static void CmtIdentity(int pid,long ticks,string exe,string hash){
  if(Path.GetFileName(exe)!="cMTViewer.exe"||hash!="C36E0F12CFAB28EF858B19AFD880B02C85C72CA1655D180C3C912D4806B8695A")throw new Exception("Pinned original cMT Viewer required.");
  using(var process=System.Diagnostics.Process.GetProcessById(pid)){if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase)||Sha(exe)!=hash)throw new Exception("Original cMT identity/SHA changed.");}
 }
 static string Title(long h){var text=new System.Text.StringBuilder(256);if(GetWindowTextW(new IntPtr(h),text,256)<=0)throw new Exception("Original cMT title unavailable.");return text.ToString();}
 static void CmtWindows(long main,long diag,int pid,bool requireViewport){
  uint actual;foreach(long h in new[]{main,diag})if(GetWindowThreadProcessId(new IntPtr(h),out actual)==0||actual!=(uint)pid||!IsWindowEnabled(new IntPtr(h)))throw new Exception("Original enabled cMT owner required.");
  if(main<=0||diag<=0||Class(main)!="Qt5QWindowOwnDCIcon"||Title(main)!="cMT Viewer ( Simulation )"||Class(diag)!="Qt5QWindowIcon"||Title(diag)!="Diagnoser"||GetWindow(new IntPtr(main),4)!=IntPtr.Zero||GetWindow(new IntPtr(diag),4).ToInt64()!=main)throw new Exception("Business-initialized original cMT main/Diagnoser required.");
  bool unknown=false;Exception error=null;EnumProc callback=delegate(IntPtr h,IntPtr ignored){try{uint owner;GetWindowThreadProcessId(h,out owner);if(owner==(uint)pid&&IsWindowVisible(h)&&h.ToInt64()!=main&&h.ToInt64()!=diag)unknown=true;return true;}catch(Exception ex){error=ex;return false;}};
  bool complete=EnumWindows(callback,IntPtr.Zero);GC.KeepAlive(callback);if(!complete||error!=null||unknown)throw new Exception("Unknown visible cMT popup; no input.");
  if(requireViewport&&(!IsWindowVisible(new IntPtr(main))||IsWindowVisible(new IntPtr(diag))||!Is800Canvas(main,pid)||GetAncestor(new IntPtr(main),2).ToInt64()!=main))throw new Exception("Unobscured original cMT 800x480 viewport required.");
 }
 public static void CmtVisibility(long main,long diag,int pid,long ticks,string exe,string hash,bool showMain,bool showDiag){
  CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,false);ShowWindow(new IntPtr(main),showMain?4:0);ShowWindow(new IntPtr(diag),showDiag?4:0);CmtWindows(main,diag,pid,false);
 }
 public static object CmtCurrentWindow(long main,long diag,int pid,long ticks,string exe,string hash){
  CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,false);if(!IsWindowVisible(new IntPtr(diag)))throw new Exception("Original visible Diagnoser required for window observation.");
  Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible combo;if(AccessibleObjectFromWindow(new IntPtr(diag),0xfffffffc,ref iid,out combo)!=0||combo==null)throw new Exception("Original Diagnoser provider required.");
  string route="client";foreach(int index in new[]{0,4,0,0,0,0,0}){int count=combo.accChildCount;if(count<1||count>128||index>=count)throw new Exception("Original current-window route absent.");object[] child=new object[1];int got;if(AccessibleChildren(combo,index,1,child,out got)<0||got!=1||!(child[0] is IAccessible))throw new Exception("Original current-window representation differs.");combo=(IAccessible)child[0];route+="/index:"+index;}
  int role=Convert.ToInt32(combo.get_accRole(0)),state=Convert.ToInt32(combo.get_accState(0));string name=combo.get_accName(0),value=combo.get_accValue(0);
  if(role!=46||(state&0x18001)!=0||name!=" Down"||combo.accChildCount!=1||value==null||value.Length>512)throw new Exception("Actual enabled visible original window combo required.");
  var match=System.Text.RegularExpressions.Regex.Match(value,@"\AWindow ([1-9][0-9]{0,4}): ([^\p{Cc}]+)\z");int number;if(!match.Success||!Int32.TryParse(match.Groups[1].Value,out number)||number>32767)throw new Exception("Actual bounded original window identity required.");
  CmtWindows(main,diag,pid,false);var now=DateTime.UtcNow;
  return new{tree=new{tree_path=route,role=role,state=state,name=name,value=value,child_count=1,window_number=number,window_name=match.Groups[2].Value,input_performed=false},observed_utc=now.ToString("o"),observed_utc_ticks=now.Ticks};
 }
 public static object CmtCapture(long main,long diag,int pid,long ticks,string exe,string hash,string output){
  if(SetThreadDpiAwarenessContext(new IntPtr(-4))==IntPtr.Zero)throw new Exception("Physical cMT DPI context required.");CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,true);if(File.Exists(output))throw new Exception("Fresh cMT row image required.");
  if(GetForegroundWindow().ToInt64()!=main&&!SetForegroundWindow(new IntPtr(main)))throw new Exception("foreground_activation_denied: Original cMT capture activation denied.");if(GetForegroundWindow().ToInt64()!=main)throw new Exception("Original cMT capture must be foreground.");long foreground=GetForegroundWindow().ToInt64();bool printed;int colors;string method;
  using(var bitmap=new Bitmap(800,480,PixelFormat.Format32bppArgb)){
   using(var graphics=Graphics.FromImage(bitmap)){graphics.Clear(Color.Magenta);IntPtr dc=graphics.GetHdc();try{printed=PrintWindow(new IntPtr(main),dc,2);}finally{graphics.ReleaseHdc(dc);}}
   var seen=new HashSet<int>();for(int y=0;y<480;y+=8)for(int x=0;x<800;x+=8)seen.Add(bitmap.GetPixel(x,y).ToArgb());method="owned cMT canvas PrintWindow(flags2)";
   // CN421 Qt PrintWindow includes nonclient chrome, even when it returns true.
   // Its row coordinates cannot be used as HMI client coordinates. Preserve the
   // observed return value, but always locate cMT rows in the physical client.
   {CmtWindows(main,diag,pid,true);if(GetForegroundWindow().ToInt64()!=main)throw new Exception("Original cMT foreground changed before physical capture.");var origin=new Point(0,0);if(!ClientToScreen(new IntPtr(main),ref origin))throw new Exception("Original cMT physical client origin required.");using(var graphics=Graphics.FromImage(bitmap))graphics.CopyFromScreen(origin.X,origin.Y,0,0,new Size(800,480),CopyPixelOperation.SourceCopy);method="owned cMT foreground client CopyFromScreen";seen.Clear();for(int y=0;y<480;y+=8)for(int x=0;x<800;x+=8)seen.Add(bitmap.GetPixel(x,y).ToArgb());}
   CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,true);if(GetForegroundWindow().ToInt64()!=main)throw new Exception("Original cMT foreground changed during capture.");colors=seen.Count;if(colors<=1)throw new Exception("Original cMT blank frame rejected.");bitmap.Save(output,ImageFormat.Png);
  }
  return new{canvas_hwnd=main,process_pid=pid,client_bounds=new int[]{0,0,800,480},print_window_succeeded=printed,color_count=colors,accepted=true,foreground_before=foreground,foreground_after=GetForegroundWindow().ToInt64(),capture_method=method,input_performed=false};
 }
 public static object CmtClick(long main,long diag,int pid,long ticks,string exe,string hash,int window,string windowName,int x,int y,int[] al,int[] match,string image,string imageHash,long capturedTicks){
  bool down=false;var proof=new ClickEvidence{process_pid=pid,creation_utc_ticks=ticks,exe_path=exe,exe_sha256=hash,main_hwnd=main,canvas_hwnd=main,client_x=x,client_y=y,al_rect=al,matched_bounds=match,image_path=image,image_sha256=imageHash,captured_utc_ticks=capturedTicks,global_input=false};object observation=null;
  try{
   if(SetThreadDpiAwarenessContext(new IntPtr(-4))==IntPtr.Zero)throw new Exception("Physical cMT DPI context required.");CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,true);
   try{ShowWindow(new IntPtr(diag),4);observation=CmtCurrentWindow(main,diag,pid,ticks,exe,hash);var tree=(object)observation.GetType().GetProperty("tree").GetValue(observation,null);if((int)tree.GetType().GetProperty("window_number").GetValue(tree,null)!=window||(string)tree.GetType().GetProperty("window_name").GetValue(tree,null)!=windowName)throw new Exception("weinview_alarm_base_window_mismatch: Actual window changed; no input.");}finally{ShowWindow(new IntPtr(diag),0);}
   if(al==null||al.Length!=4||match==null||match.Length!=4||al[0]<0||al[1]<0||al[2]<1||al[3]<1||al[0]+al[2]>800||al[1]+al[3]>480||match[0]<al[0]||match[1]<al[1]||match[2]>al[0]+al[2]||match[3]>al[1]+al[3]||match[0]>=match[2]||match[1]>=match[3]||x<match[0]||x>=match[2]||y<match[1]||y>=match[3])throw new Exception("Original cMT unique row bounds required.");
   proof.foreground_before=GetForegroundWindow().ToInt64();if(proof.foreground_before!=main){proof.activation_requested=true;if(!SetForegroundWindow(new IntPtr(main)))throw new Exception("foreground_activation_denied: Original cMT input activation denied.");}
   UIntPtr ignored;if(SendMessageTimeoutW(new IntPtr(main),0,UIntPtr.Zero,IntPtr.Zero,2,1000,out ignored)==IntPtr.Zero)throw new Exception("Original cMT queue unavailable.");uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(main),out owner);var info=new ThreadInfo{size=(uint)Marshal.SizeOf(typeof(ThreadInfo))};if(owner!=(uint)pid||thread==0||!GetGUIThreadInfo(thread,ref info)||GetForegroundWindow().ToInt64()!=main||info.active.ToInt64()!=main)throw new Exception("Original cMT foreground/active required.");foreach(int key in new[]{0x10,0x11,0x12,1,2})if(GetAsyncKeyState(key)<0)throw new Exception("Held native key/button; no cMT input.");
   if(DateTime.UtcNow.Ticks<capturedTicks||DateTime.UtcNow.Ticks-capturedTicks>=200000000||Sha(image)!=imageHash)throw new Exception("Original cMT row image stale or changed.");CmtIdentity(pid,ticks,exe,hash);CmtWindows(main,diag,pid,true);var point=new IntPtr((y<<16)|(x&65535));proof.messages=new uint[]{0x201,0x202};proof.lparams=new long[]{point.ToInt64(),point.ToInt64()};
   if(!PostMessageW(new IntPtr(main),0x201,new UIntPtr(1),point))throw new Exception("Original cMT down rejected; no retry.");down=true;if(!PostMessageW(new IntPtr(main),0x202,UIntPtr.Zero,point))throw new Exception("Original cMT up rejected; input possible, no retry.");proof.posted=true;proof.input_performed=true;proof.foreground_after=GetForegroundWindow().ToInt64();proof.active_hwnd=info.active.ToInt64();var now=DateTime.UtcNow;proof.observed_utc=now.ToString("o");proof.observed_utc_ticks=now.Ticks;return new{click=proof,window=observation};
  }catch(Exception error){error.Data["runtime_alarm_input_performed"]=down?(object)null:false;error.Data["runtime_alarm_click_evidence"]=proof;throw;}
 }
 public static ClickEvidence Click(long canvas,long main,int pid,long ticks,string exe,string exeHash,int x,int y,int[] al,int[] match,string image,string imageHash,long capturedTicks){
  bool down=false;var proof=new ClickEvidence{process_pid=pid,creation_utc_ticks=ticks,exe_path=exe,exe_sha256=exeHash,main_hwnd=main,canvas_hwnd=canvas,client_x=x,client_y=y,al_rect=al,matched_bounds=match,image_path=image,image_sha256=imageHash,captured_utc_ticks=capturedTicks,global_input=false};
  try{
   Identity(pid,ticks,exe,exeHash);Pair(canvas,main,pid);
   if(al==null||al.Length!=4||match==null||match.Length!=4||al[0]<0||al[1]<0||al[2]<1||al[3]<1||al[0]+al[2]>800||al[1]+al[3]>480||match[0]<al[0]||match[1]<al[1]||match[2]>al[0]+al[2]||match[3]>al[1]+al[3]||match[0]>=match[2]||match[1]>=match[3]||x<match[0]||x>=match[2]||y<match[1]||y>=match[3])throw new Exception("Actual unique row target must remain inside original AL bounds.");
   proof.foreground_before=GetForegroundWindow().ToInt64();
   if(proof.foreground_before!=main){proof.activation_requested=true;if(!SetForegroundWindow(new IntPtr(main)))throw new Exception("foreground_activation_denied: Original runtime main activation rejected.");}
   UIntPtr ignored;if(SendMessageTimeoutW(new IntPtr(main),0,UIntPtr.Zero,IntPtr.Zero,2,1000,out ignored)==IntPtr.Zero)throw new Exception("Original runtime queue did not complete bounded read-only refresh.");
   uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(main),out owner);var info=new ThreadInfo{size=(uint)Marshal.SizeOf(typeof(ThreadInfo))};
   if(owner!=pid||thread==0||!GetGUIThreadInfo(thread,ref info)||GetForegroundWindow().ToInt64()!=main||info.active.ToInt64()!=main)throw new Exception("Original runtime must actually be foreground/active before row input.");
   if(DateTime.UtcNow.Ticks<capturedTicks||DateTime.UtcNow.Ticks-capturedTicks>=200000000||Sha(image)!=imageHash)throw new Exception("Original row image stale or changed.");
   Pair(canvas,main,pid);Identity(pid,ticks,exe,exeHash);var point=new IntPtr((y<<16)|(x&65535));proof.messages=new uint[]{0x201,0x202};proof.lparams=new long[]{point.ToInt64(),point.ToInt64()};
   if(!PostMessageW(new IntPtr(canvas),0x201,new UIntPtr(1),point))throw new Exception("Original row target down message rejected; no retry.");down=true;
   if(!PostMessageW(new IntPtr(canvas),0x202,UIntPtr.Zero,point))throw new Exception("Original row target up message rejected; input outcome possible, no retry.");
   proof.posted=true;proof.input_performed=true;proof.foreground_after=GetForegroundWindow().ToInt64();proof.active_hwnd=info.active.ToInt64();var observed=DateTime.UtcNow;proof.observed_utc=observed.ToString("o");proof.observed_utc_ticks=observed.Ticks;return proof;
  }catch(Exception error){error.Data["runtime_alarm_input_performed"]=down?(object)null:false;error.Data["runtime_alarm_click_evidence"]=proof;throw;}
 }

}}
