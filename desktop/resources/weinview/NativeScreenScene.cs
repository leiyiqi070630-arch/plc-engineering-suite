using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

namespace PLC Engineering Suite.Weinview.Research
{
 public sealed class CanvasNotPaintedException : InvalidOperationException
 {
  public int[] CanvasBox {get;private set;} public long PixelCount {get;private set;} public string ImagePath {get;private set;}
  public CanvasNotPaintedException(int[] box,long count,string path) : base("Actual selected native canvas must be painted; no zoom/layout reset") {CanvasBox=box;PixelCount=count;ImagePath=path;}
 }
 public sealed class SceneGeometryChangedException : InvalidOperationException
 {
  public int[] Before {get;private set;} public int[] After {get;private set;} public string ImagePath {get;private set;}
  public SceneGeometryChangedException(int[] before,int[] after,string path) : base("View moved during read-only capture") {Before=before;After=after;ImagePath=path;}
 }
 public sealed class SelectionRectangleEvidence {
  public int[] rectangle,bottom_right_handle; public int blue_handle_pixels; public long selection_view_hwnd;
  public bool native_selected_handle_readback;
 }
 public sealed class ScreenSceneEvidence
 {
  public long MainHwnd,ViewHwnd; public int[] ViewRect,CanvasBox,CanvasOriginClient;
  public int LogicalWidth=800,LogicalHeight=480; public bool Clipped=false;
  public bool DrawingPaletteRepositioned=false; public int[] OriginalDrawingPaletteRect;
  public string ImagePath,ImageSha256,CapturedUtc; public bool GlobalMouse=false,LayoutReset=false,PlacementOnly=false,GeometryOnly=false;
 }
 public sealed class NativeScreenScene
 {
  long observedDrawingPanel; int[] originalDrawingPanelRect;
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll",EntryPoint="GetWindowLongW")]static extern int GetWindowLongW(IntPtr h,int index);
  [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll",SetLastError=true)]static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int width,int height,uint flags);
  void ValidateDrawingPanel(long hwnd){
   ValidateProcess();var h=new IntPtr(hwnd);var m=new IntPtr(main);
   if(hwnd<=0||!Own(h)||Class(h)!="#32770"||Title(h)!="属性"||!IsWindowVisible(h)||!IsWindowEnabled(h)||GetWindow(h,4)!=m||!IsWindowEnabled(m))throw new InvalidOperationException("Exact owned enabled modeless drawing palette required");
   var n=new PLC Engineering Suite.Weinview.NativeControls(pid,ticks,exe,800);var controls=n.EnumChildControls(hwnd);
   foreach(var c in controls)if(c.Visible&&(c.Class=="SysTabControl32"||(c.Class=="Button"&&(c.Id==1||c.Id==2))))throw new InvalidOperationException("Drawing palette must have no tabs/OK/Cancel");
   var fill=n.FindUniqueControl(hwnd,1217,"Button","填色");var corner=n.FindUniqueControlWithoutLabel(hwnd,2067,"ComboBox");
   var p=new NativePropertyCandidate(pid,ticks,exe);
   int fillState=n.GetCheckboxState(fill.Hwnd);
   if((GetWindowLongW(new IntPtr(fill.Hwnd),-16)&15)!=3||(fillState!=0&&fillState!=1)||String.IsNullOrWhiteSpace(p.ComboSelected(corner.Hwnd)))throw new InvalidOperationException("Native rectangle palette must expose a valid fill state and corner choice");
  }
  bool ExactDrawingPalette(IntPtr h){if(observedDrawingPanel==0||h.ToInt64()!=observedDrawingPanel)return false;ValidateDrawingPanel(observedDrawingPanel);return true;}
  void ClearDrawingCanvas(Rect viewRect){
   if(observedDrawingPanel==0)return;ValidateDrawingPanel(observedDrawingPanel);
   Rect before;if(!GetWindowRect(new IntPtr(observedDrawingPanel),out before))throw new InvalidOperationException("Drawing palette bounds unavailable");
   if(!Intersects(before,viewRect))return;
   if(originalDrawingPanelRect!=null)throw new InvalidOperationException("Drawing palette moved into the canvas after positioning; no retry");
   originalDrawingPanelRect=new[]{before.L,before.T,before.R,before.B};
   int x=checked(viewRect.R+16),y=viewRect.T;
   if(!SetWindowPos(new IntPtr(observedDrawingPanel),IntPtr.Zero,x,y,0,0,0x0015))throw new InvalidOperationException("Owned drawing palette positioning failed");
   Rect after;if(!GetWindowRect(new IntPtr(observedDrawingPanel),out after)||after.L!=x||after.T!=y||after.R-after.L!=before.R-before.L||after.B-after.T!=before.B-before.T||Intersects(after,viewRect))throw new InvalidOperationException("Owned drawing palette positioning readback differs");
  }
  public NativeScreenScene(int processId,long creationUtcTicks,string executablePath,long mainHwnd,int windowNumber,string windowName,long drawingPanelHwnd){
   if(windowNumber<10||windowNumber>1999||String.IsNullOrWhiteSpace(windowName)||windowName.Length>1024)throw new ArgumentException("Exact ordinary drawing window required");foreach(char c in windowName)if(Char.IsControl(c))throw new ArgumentException("Control character in drawing window name");
   pid=processId;ticks=creationUtcTicks;exe=Path.GetFullPath(executablePath);main=mainHwnd;documentTitle=windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+" - "+windowName;placementOnly=true;SetProcessDPIAware();if(!IsProcessDPIAware())throw new InvalidOperationException("Physical-pixel DPI awareness required");
   ValidateDrawingPanel(drawingPanelHwnd);observedDrawingPanel=drawingPanelHwnd;
   ValidateMain();
  }
  readonly int pid;readonly long ticks;readonly string exe;readonly long main;readonly string documentTitle;readonly bool placementOnly;
  int logicalWidth=800,logicalHeight=480;
  void Dimensions(int width,int height){if(width<1||width>65535||height<1||height>65535)throw new ArgumentException("Actual native window dimensions required");logicalWidth=width;logicalHeight=height;}
  public NativeScreenScene(int processId,long creationUtcTicks,string executablePath,long mainHwnd,int windowNumber,string windowName,int width,int height)
   :this(processId,creationUtcTicks,executablePath,mainHwnd,windowNumber,windowName){Dimensions(width,height);}
  public NativeScreenScene(int processId,long creationUtcTicks,string executablePath,long mainHwnd,int windowNumber,string windowName,long drawingPanelHwnd,int width,int height)
   :this(processId,creationUtcTicks,executablePath,mainHwnd,windowNumber,windowName,drawingPanelHwnd){Dimensions(width,height);}
  delegate bool EnumProc(IntPtr h,IntPtr p);
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int L,T,R,B;}
  [StructLayout(LayoutKind.Sequential)] struct Point {public int X,Y;}
  [DllImport("kernel32.dll")]static extern IntPtr OpenProcess(uint a,bool i,int p);
  [DllImport("kernel32.dll")]static extern bool CloseHandle(IntPtr h);
  [DllImport("kernel32.dll")]static extern bool GetProcessTimes(IntPtr h,out long c,out long e,out long k,out long u);
  [DllImport("kernel32.dll")]static extern uint WaitForSingleObject(IntPtr h,uint ms);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode)]static extern bool QueryFullProcessImageNameW(IntPtr h,uint f,StringBuilder b,ref uint n);
  [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")]static extern bool IsProcessDPIAware();
  [DllImport("user32.dll")]static extern bool EnumWindows(EnumProc fn,IntPtr p);
  [DllImport("user32.dll")]static extern bool EnumChildWindows(IntPtr h,EnumProc fn,IntPtr p);
  [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")]static extern bool IsWindowEnabled(IntPtr h);
  [DllImport("user32.dll")]static extern bool IsChild(IntPtr p,IntPtr c);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")]static extern bool GetClientRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")]static extern bool ClientToScreen(IntPtr h,ref Point p);
  [DllImport("user32.dll")]static extern int GetDlgCtrlID(IntPtr h);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetClassNameW(IntPtr h,StringBuilder b,int n);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetWindowTextW(IntPtr h,StringBuilder b,int n);
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  public NativeScreenScene(int processId,long creationUtcTicks,string executablePath,long mainHwnd)
   : this(processId,creationUtcTicks,executablePath,mainHwnd,10,"WINDOW_010") {placementOnly=false;}
  public NativeScreenScene(int processId,long creationUtcTicks,string executablePath,long mainHwnd,int windowNumber,string windowName)
  {if(windowNumber<10||windowNumber>1999||String.IsNullOrWhiteSpace(windowName)||windowName.Length>1024)throw new ArgumentException("Exact created ordinary window identity required");foreach(char c in windowName)if(Char.IsControl(c))throw new ArgumentException("Control character in window name");placementOnly=true;documentTitle=windowNumber.ToString(System.Globalization.CultureInfo.InvariantCulture)+" - "+windowName;pid=processId;ticks=creationUtcTicks;exe=Path.GetFullPath(executablePath);main=mainHwnd;SetProcessDPIAware();if(!IsProcessDPIAware())throw new InvalidOperationException("Physical-pixel DPI awareness required");ValidateMain();}
  void ValidateProcess(){IntPtr h=OpenProcess(0x101000,false,pid);if(h==IntPtr.Zero)throw new InvalidOperationException("Own process absent");try{long c,e,k,u;uint n=32768;var b=new StringBuilder((int)n);if(WaitForSingleObject(h,0)!=258||!GetProcessTimes(h,out c,out e,out k,out u)||c+504911232000000000L!=ticks||!QueryFullProcessImageNameW(h,0,b,ref n)||!String.Equals(Path.GetFullPath(b.ToString()),exe,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Scene process identity mismatch");}finally{CloseHandle(h);}}
  bool Own(IntPtr h){uint p;return GetWindowThreadProcessId(h,out p)!=0&&p==pid;}
  string Class(IntPtr h){var b=new StringBuilder(256);GetClassNameW(h,b,b.Capacity);return b.ToString();}
  string Title(IntPtr h){var b=new StringBuilder(1024);GetWindowTextW(h,b,b.Capacity);return b.ToString();}
  void ValidateMain(){ValidateProcess();var m=new IntPtr(main);if(!Own(m)||Class(m)!="EasyBuilderPro"||!IsWindowVisible(m)||!IsWindowEnabled(m))throw new InvalidOperationException("Owned enabled main required");
   Exception error=null;int visits=0,ownCount=0;EnumWindows(delegate(IntPtr h,IntPtr p){if(++visits>8192){error=new InvalidOperationException("Desktop top-window visit bound");return false;}bool owned=Own(h);if(owned&&++ownCount>512){error=new InvalidOperationException("Own top-window bound");return false;}if(owned&&h!=m&&IsWindowVisible(h)&&Class(h)=="#32770"&&!ExactDrawingPalette(h)){error=new InvalidOperationException("Own modal blocks scene");return false;}return true;},IntPtr.Zero);if(error!=null)throw error;}
  IntPtr View(){ValidateMain();if(!System.Text.RegularExpressions.Regex.IsMatch(Title(new IntPtr(main)),@"\[\s*"+System.Text.RegularExpressions.Regex.Escape(documentTitle)+@"\s*\]\s*$"))throw new InvalidOperationException("Requested document is not active in owned main");var views=new List<IntPtr>();EnumChildWindows(new IntPtr(main),delegate(IntPtr h,IntPtr p){if(Own(h)&&IsWindowVisible(h)&&IsWindowEnabled(h)&&GetDlgCtrlID(h)==59665&&Class(h)=="AfxFrameOrView140u"&&Title(h).Trim()==documentTitle)views.Add(h);return true;},IntPtr.Zero);if(views.Count!=1)throw new InvalidOperationException("Unique requested document ID59665 view required");return views[0];}
  static bool Intersects(Rect a,Rect b){return a.L<b.R&&a.R>b.L&&a.T<b.B&&a.B>b.T;}
  bool ClickThroughLayeredOverlay(IntPtr h){int style=GetWindowLongW(h,-20);return(style&0x80020)==0x80020;}
  void Uncovered(Rect target){Exception error=null;bool found=false;int visits=0,ownCount=0;EnumWindows(delegate(IntPtr h,IntPtr p){if(++visits>8192){error=new InvalidOperationException("Desktop overlay visit bound");return false;}if(Own(h)&&++ownCount>512){error=new InvalidOperationException("Own overlay-window bound");return false;}if(h.ToInt64()==main){found=true;return false;}Rect r;if(IsWindowVisible(h)&&GetWindowRect(h,out r)&&Intersects(r,target)&&!ExactDrawingPalette(h)&&!ClickThroughLayeredOverlay(h)){uint overlayPid;GetWindowThreadProcessId(h,out overlayPid);
     string overlayProcessName="unavailable";
     try{if(overlayPid>0&&overlayPid<=Int32.MaxValue){using(var overlayProcess=System.Diagnostics.Process.GetProcessById((int)overlayPid)){overlayProcessName=overlayProcess.ProcessName;}}}
     catch(ArgumentException){}catch(InvalidOperationException){}catch(System.ComponentModel.Win32Exception){}
     error=new InvalidOperationException("Visible top-level overlay intersects owned view; hwnd="+h.ToInt64()+" pid="+overlayPid+" host_process_name="+overlayProcessName+" class="+Class(h)+" title="+Title(h)+" rect="+r.L+","+r.T+","+r.R+","+r.B+"; Do not terminate the host process based only on this dialog PID; system error dialogs may be hosted by csrss.exe.");return false;}return true;},IntPtr.Zero);if(error!=null)throw error;if(!found)throw new InvalidOperationException("Main not found in Z order");}
  public ScreenSceneEvidence CapturePlacement()
  {
   var view=View();Rect rect;if(!GetWindowRect(view,out rect))throw new InvalidOperationException("Placement view bounds unavailable");ClearDrawingCanvas(rect);
   int width=rect.R-rect.L,height=rect.B-rect.T;
   if(width<100||height<100||width>4096||height>4096)throw new InvalidOperationException("Placement view dimensions unsupported");
   Rect client;var clientOrigin=new Point();if(!GetClientRect(view,out client)||!ClientToScreen(view,ref clientOrigin))throw new InvalidOperationException("Actual native placement viewport unavailable");
   int clientLeft=clientOrigin.X-rect.L,clientTop=clientOrigin.Y-rect.T,clientWidth=client.R-client.L,clientHeight=client.B-client.T;
   bool clipped=logicalWidth>clientWidth-6||logicalHeight>clientHeight-6;
   int visibleWidth=clipped?Math.Min(logicalWidth,clientWidth-6):logicalWidth,visibleHeight=clipped?Math.Min(logicalHeight,clientHeight-6):logicalHeight;
   if(visibleWidth<20||visibleHeight<20)throw new InvalidOperationException("Native placement viewport is too small");
   int left=clientLeft+(clientWidth-visibleWidth)/2,top=clientTop+(clientHeight-visibleHeight)/2,right=left+visibleWidth,bottom=top+visibleHeight;
   if(left<2||top<2||right+2>=width||bottom+2>=height)throw new InvalidOperationException("Centered native placement canvas unavailable in viewport");
   // New objects receive their final geometry through native property controls.
   // Their initial input goes directly to the owned view HWND, without a screenshot.
   ValidateMain();
   return new ScreenSceneEvidence{MainHwnd=main,ViewHwnd=view.ToInt64(),ViewRect=new[]{rect.L,rect.T,rect.R,rect.B},CanvasBox=new[]{left,top,right,bottom},CanvasOriginClient=new[]{left-clientLeft,top-clientTop},ImagePath=null,ImageSha256=null,CapturedUtc=DateTime.UtcNow.ToString("o"),PlacementOnly=true,GeometryOnly=true,LogicalWidth=logicalWidth,LogicalHeight=logicalHeight,Clipped=clipped,DrawingPaletteRepositioned=originalDrawingPanelRect!=null,OriginalDrawingPaletteRect=originalDrawingPanelRect};
  }
  public ScreenSceneEvidence Capture(string imagePath)
  {
   var view=View();Rect rect;if(!GetWindowRect(view,out rect))throw new InvalidOperationException("View bounds unavailable");ClearDrawingCanvas(rect);int width=rect.R-rect.L,height=rect.B-rect.T;
   Rect client;var clientOrigin=new Point();if(!GetClientRect(view,out client)||!ClientToScreen(view,ref clientOrigin))throw new InvalidOperationException("Actual native viewport unavailable");int clientRight=clientOrigin.X-rect.L+client.R,clientBottom=clientOrigin.Y-rect.T+client.B;
   if(width<100||height<100||width>4096||height>4096)throw new InvalidOperationException("View dimensions unsupported");Uncovered(rect);
   string path=Path.GetFullPath(imagePath);if(File.Exists(path))throw new InvalidOperationException("Fresh screenshot path required");
   int clientLeft=clientOrigin.X-rect.L,clientTop=clientOrigin.Y-rect.T;
   int clientWidth=client.R-client.L,clientHeight=client.B-client.T;
    bool clipped=logicalWidth>clientWidth-6||logicalHeight>clientHeight-6;
    if(clipped&&!placementOnly)throw new InvalidOperationException("Native canvas exceeds current viewport; full geometry is required to select existing objects");
    // New objects only need a point inside the native view to finish creation.
    // Their final logical position and size are set through property controls.
    // Do not require a large HMI screen to fit the computer's physical viewport.
    int visibleWidth=clipped?Math.Min(logicalWidth,clientWidth-6):logicalWidth;
    int visibleHeight=clipped?Math.Min(logicalHeight,clientHeight-6):logicalHeight;
    if(visibleWidth<20||visibleHeight<20)throw new InvalidOperationException("Native placement viewport is too small");
    int canvasLeft=clientLeft+(clientWidth-visibleWidth)/2,canvasTop=clientTop+(clientHeight-visibleHeight)/2;
    int canvasRight=canvasLeft+visibleWidth,canvasBottom=canvasTop+visibleHeight;
   if(canvasLeft<2||canvasTop<2||canvasRight+2>=width||canvasBottom+2>=height)throw new InvalidOperationException("Centered native canvas boundary unavailable in viewport");
   int left=width,top=height,right=-1,bottom=-1;long lavender=0;
   using(var image=new Bitmap(width,height,PixelFormat.Format32bppArgb)){
    using(var graphics=Graphics.FromImage(image))graphics.CopyFromScreen(rect.L,rect.T,0,0,new Size(width,height),CopyPixelOperation.SourceCopy);
    ValidateMain();Rect after;if(!GetWindowRect(view,out after))throw new InvalidOperationException("View bounds unavailable after capture");if(after.L!=rect.L||after.T!=rect.T||after.R!=rect.R||after.B!=rect.B){image.Save(path,ImageFormat.Png);throw new SceneGeometryChangedException(new[]{rect.L,rect.T,rect.R,rect.B},new[]{after.L,after.T,after.R,after.B},path);}Uncovered(after);
    var data=image.LockBits(new Rectangle(0,0,width,height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
    try{if(data.Stride<=0)throw new InvalidOperationException("Unexpected bitmap stride");var pixels=new byte[data.Stride*height];Marshal.Copy(data.Scan0,pixels,0,pixels.Length);
     for(int y=0;y<height;y++)for(int x=0;x<width;x++){int pos=y*data.Stride+x*4;if(pixels[pos]==250&&pixels[pos+1]==230&&pixels[pos+2]==230){lavender++;if(x<left)left=x;if(x>right)right=x;if(y<top)top=y;if(y>bottom)bottom=y;}}
    }finally{image.UnlockBits(data);}
    image.Save(path,ImageFormat.Png);
    // The original window-setting table supplies logicalWidth/Height. The
    // owned view's client rectangle supplies the centered canvas position;
    // objects may cover most or all of its lavender background.
    int boundaryContrast=0;
    int midX=canvasLeft+visibleWidth/2,midY=canvasTop+visibleHeight/2;
    if(image.GetPixel(canvasLeft-2,midY).ToArgb()!=image.GetPixel(canvasLeft+2,midY).ToArgb())boundaryContrast++;
    if(image.GetPixel(canvasRight+1,midY).ToArgb()!=image.GetPixel(canvasRight-3,midY).ToArgb())boundaryContrast++;
    if(image.GetPixel(midX,canvasTop-2).ToArgb()!=image.GetPixel(midX,canvasTop+2).ToArgb())boundaryContrast++;
    if(image.GetPixel(midX,canvasBottom+1).ToArgb()!=image.GetPixel(midX,canvasBottom-3).ToArgb())boundaryContrast++;
    if(!clipped&&boundaryContrast<2)throw new CanvasNotPaintedException(new[]{canvasLeft,canvasTop,canvasRight,canvasBottom},lavender,path);
    left=canvasLeft;top=canvasTop;right=canvasRight-1;bottom=canvasBottom-1;
   }
   Rect paletteRect;if(observedDrawingPanel!=0&&GetWindowRect(new IntPtr(observedDrawingPanel),out paletteRect)&&Intersects(paletteRect,new Rect{L=rect.L+left,T=rect.T+top,R=rect.L+right+1,B=rect.T+bottom+1}))throw new InvalidOperationException("Drawing palette intersects actual canvas; no move/reset fallback");
   var origin=new Point();if(!ClientToScreen(view,ref origin))throw new InvalidOperationException("View client origin unavailable");ValidateMain();
   string hash;using(var sha=SHA256.Create())using(var file=File.OpenRead(path))hash=BitConverter.ToString(sha.ComputeHash(file)).Replace("-","");
    return new ScreenSceneEvidence{MainHwnd=main,ViewHwnd=view.ToInt64(),ViewRect=new[]{rect.L,rect.T,rect.R,rect.B},CanvasBox=new[]{left,top,right+1,bottom+1},CanvasOriginClient=new[]{rect.L+left-origin.X,rect.T+top-origin.Y},ImagePath=path,ImageSha256=hash,CapturedUtc=DateTime.UtcNow.ToString("o"),PlacementOnly=placementOnly,LogicalWidth=logicalWidth,LogicalHeight=logicalHeight,Clipped=clipped,DrawingPaletteRepositioned=originalDrawingPanelRect!=null,OriginalDrawingPaletteRect=originalDrawingPanelRect};
  }
  public object DrawTwoPointRectangle(ScreenSceneEvidence scene,int x,int y,int width,int height){
   if(observedDrawingPanel==0||scene==null||scene.MainHwnd!=main||scene.LogicalWidth!=logicalWidth||scene.LogicalHeight!=logicalHeight||DateTime.UtcNow-DateTime.Parse(scene.CapturedUtc).ToUniversalTime()>TimeSpan.FromSeconds(5))throw new InvalidOperationException("Fresh owned canvas/observed drawing palette required");
    if(x<0||y<0||width<1||height<1||x+width>logicalWidth||y+height>logicalHeight||(!scene.PlacementOnly&&(width<2||height<2)))throw new ArgumentException("Final rectangle dimensions must fit the actual selected canvas");ValidateDrawingPanel(observedDrawingPanel);
   if(!scene.GeometryOnly){string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(scene.ImagePath))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");if(hash!=scene.ImageSha256)throw new InvalidOperationException("Drawing scene image changed");}
   var view=View();Rect r;if(view.ToInt64()!=scene.ViewHwnd||!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])throw new InvalidOperationException("Drawing scene geometry changed");if(!scene.GeometryOnly)Uncovered(r);
   int sx=x,sy=y,sw=width,sh=height;
    if(scene.PlacementOnly){sx=8;sy=8;sw=Math.Min(64,scene.CanvasBox[2]-scene.CanvasBox[0]-16);sh=Math.Min(32,scene.CanvasBox[3]-scene.CanvasBox[1]-16);if(sw<2||sh<2)throw new InvalidOperationException("Visible initial rectangle footprint unavailable");if(scene.Clipped){sx=(scene.CanvasBox[2]-scene.CanvasBox[0]-sw)/2;sy=(scene.CanvasBox[3]-scene.CanvasBox[1]-sh)/2;}}
   int ax=scene.CanvasOriginClient[0]+sx,ay=scene.CanvasOriginClient[1]+sy,bx=ax+sw-1,by=ay+sh-1;IntPtr a=new IntPtr((ay<<16)|(ax&65535)),b=new IntPtr((by<<16)|(bx&65535));ValidateMain();
   Rect currentPalette;if(!GetWindowRect(new IntPtr(observedDrawingPanel),out currentPalette)||Intersects(currentPalette,new Rect{L=scene.ViewRect[0]+scene.CanvasBox[0],T=scene.ViewRect[1]+scene.CanvasBox[1],R=scene.ViewRect[0]+scene.CanvasBox[2],B=scene.ViewRect[1]+scene.CanvasBox[3]}))throw new InvalidOperationException("Drawing palette intersects actual canvas or bounds unavailable before input; no move/reset fallback");
   if(!PostMessageW(view,0x201,new UIntPtr(1),a))throw new InvalidOperationException("Drawing first point down failed; no replay");System.Threading.Thread.Sleep(80);
   if(!PostMessageW(view,0x202,UIntPtr.Zero,a))throw new InvalidOperationException("Drawing first point up failed; no replay");System.Threading.Thread.Sleep(80);
   if(!PostMessageW(view,0x200,UIntPtr.Zero,b))throw new InvalidOperationException("Drawing endpoint preview failed; no replay");System.Threading.Thread.Sleep(80);
   if(!PostMessageW(view,0x201,new UIntPtr(1),b)||!PostMessageW(view,0x202,UIntPtr.Zero,b))throw new InvalidOperationException("Drawing second point failed; no replay");
   return new {panel_hwnd=observedDrawingPanel,view_hwnd=view.ToInt64(),requested_rectangle=new[]{x,y,width,height},initial_rectangle=new[]{sx,sy,sw,sh},final_native_contour_required=scene.PlacementOnly,endpoints=new[]{sx,sy,sx+sw-1,sy+sh-1},messages=new uint[]{0x201,0x202,0x200,0x201,0x202},lparams=new long[]{a.ToInt64(),a.ToInt64(),b.ToInt64(),b.ToInt64(),b.ToInt64()},global_input=false,layout_reset=false,draw_posted=true};
  }
  public void CloseObservedDrawingPanel(){
   if(observedDrawingPanel==0)throw new InvalidOperationException("No originally observed drawing palette");var h=new IntPtr(observedDrawingPanel);ValidateProcess();
   if(IsWindowVisible(h)){ValidateDrawingPanel(observedDrawingPanel);if(originalDrawingPanelRect!=null){if(!SetWindowPos(h,IntPtr.Zero,originalDrawingPanelRect[0],originalDrawingPanelRect[1],0,0,0x0015))throw new InvalidOperationException("Owned drawing palette restore failed");Rect restored;if(!GetWindowRect(h,out restored)||restored.L!=originalDrawingPanelRect[0]||restored.T!=originalDrawingPanelRect[1]||restored.R!=originalDrawingPanelRect[2]||restored.B!=originalDrawingPanelRect[3])throw new InvalidOperationException("Owned drawing palette restore readback differs");originalDrawingPanelRect=null;}if(!PostMessageW(h,0x10,UIntPtr.Zero,IntPtr.Zero))throw new InvalidOperationException("Owned drawing palette close failed");var end=DateTime.UtcNow.AddSeconds(3);while(IsWindowVisible(h)&&DateTime.UtcNow<end){ValidateProcess();System.Threading.Thread.Sleep(50);}if(IsWindowVisible(h))throw new InvalidOperationException("Owned drawing palette did not close; no replay");}
   observedDrawingPanel=0;ValidateMain();
  }
  public void OpenExistingObject(ScreenSceneEvidence scene,int x,int y,int width,int height)
  {
   if(scene==null||scene.MainHwnd!=main||scene.PlacementOnly||DateTime.UtcNow-DateTime.Parse(scene.CapturedUtc).ToUniversalTime()>TimeSpan.FromSeconds(5))throw new InvalidOperationException("Fresh exact existing-object scene required");
   if(x<0||y<0||width<1||height<1||x+width>logicalWidth||y+height>logicalHeight)throw new ArgumentException("Source object rectangle out of canvas");
   var view=View();if(view.ToInt64()!=scene.ViewHwnd)throw new InvalidOperationException("View replaced");Rect r;if(!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])throw new InvalidOperationException("Scene geometry changed");Uncovered(r);
   int cx=scene.CanvasOriginClient[0]+x+width/2,cy=scene.CanvasOriginClient[1]+y+height/2;IntPtr lp=new IntPtr((cy<<16)|(cx&65535));
   uint[] messages={0x201,0x202,0x203,0x202};uint[] flags={1,0,1,0};ValidateMain();
   for(int i=0;i<messages.Length;i++)if(!PostMessageW(view,messages[i],new UIntPtr(flags[i]),lp))throw new InvalidOperationException("Owned view mouse-message post failed; no retry");
  }
  public void PlaceNewObject(ScreenSceneEvidence scene,int x,int y){
   if(scene==null||scene.MainHwnd!=main||scene.LogicalWidth!=logicalWidth||scene.LogicalHeight!=logicalHeight||DateTime.UtcNow-DateTime.Parse(scene.CapturedUtc).ToUniversalTime()>TimeSpan.FromSeconds(5)||x<0||y<0||x>=logicalWidth||y>=logicalHeight)throw new InvalidOperationException("Fresh bound placement scene/canvas point required");
   var view=View();Rect r;if(view.ToInt64()!=scene.ViewHwnd||!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])throw new InvalidOperationException("Placement scene geometry changed");if(!scene.GeometryOnly)Uncovered(r);
   int dx=scene.Clipped?(scene.CanvasBox[2]-scene.CanvasBox[0])/2:scene.PlacementOnly?(int)((long)x*(scene.CanvasBox[2]-scene.CanvasBox[0])/logicalWidth):x;
   int dy=scene.Clipped?(scene.CanvasBox[3]-scene.CanvasBox[1])/2:scene.PlacementOnly?(int)((long)y*(scene.CanvasBox[3]-scene.CanvasBox[1])/logicalHeight):y;
   int cx=scene.CanvasOriginClient[0]+dx,cy=scene.CanvasOriginClient[1]+dy;IntPtr lp=new IntPtr((cy<<16)|(cx&65535));ValidateMain();if(!PostMessageW(view,0x201,new UIntPtr(1),lp)||!PostMessageW(view,0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Owned view single placement click failed; no retry");
  }
  public object DragObservedSelectionHandle(ScreenSceneEvidence scene,int handleX,int handleY,int targetX,int targetY){
   if(scene==null||scene.MainHwnd!=main||scene.LogicalWidth!=logicalWidth||scene.LogicalHeight!=logicalHeight||scene.Clipped||DateTime.UtcNow-DateTime.Parse(scene.CapturedUtc).ToUniversalTime()>TimeSpan.FromSeconds(5))throw new InvalidOperationException("Fresh unclipped owned selected-object canvas required");
   if(handleX<0||handleY<0||targetX<0||targetY<0||handleX>=logicalWidth||targetX>=logicalWidth||handleY>=logicalHeight||targetY>=logicalHeight)throw new ArgumentException("Observed handle/target outside selected canvas");
   var view=View();Rect r;if(view.ToInt64()!=scene.ViewHwnd||!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])throw new InvalidOperationException("Selected-object scene geometry changed");Uncovered(r);
   int width=scene.CanvasBox[2]-scene.CanvasBox[0],height=scene.CanvasBox[3]-scene.CanvasBox[1];
   int sx=scene.CanvasOriginClient[0]+(int)((long)handleX*width/logicalWidth),sy=scene.CanvasOriginClient[1]+(int)((long)handleY*height/logicalHeight);
   int ex=scene.CanvasOriginClient[0]+(int)((long)targetX*width/logicalWidth),ey=scene.CanvasOriginClient[1]+(int)((long)targetY*height/logicalHeight);
   if(sx<0||sy<0||ex<0||ey<0||sx>32767||sy>32767||ex>32767||ey>32767)throw new InvalidOperationException("Selected-object client points unavailable");
   IntPtr start=new IntPtr((sy<<16)|(sx&65535)),end=new IntPtr((ey<<16)|(ex&65535));ValidateMain();
   if(!PostMessageW(view,0x200,UIntPtr.Zero,start)||!PostMessageW(view,0x201,new UIntPtr(1),start))throw new InvalidOperationException("Owned selected handle down failed");
   bool released=false;try{System.Threading.Thread.Sleep(80);if(!PostMessageW(view,0x200,new UIntPtr(1),end))throw new InvalidOperationException("Owned selected handle drag failed");System.Threading.Thread.Sleep(80);if(!PostMessageW(view,0x202,UIntPtr.Zero,end))throw new InvalidOperationException("Owned selected handle release failed");released=true;}finally{if(!released)PostMessageW(view,0x202,UIntPtr.Zero,end);}
   ValidateMain();return new {view_hwnd=view.ToInt64(),observed_handle=new[]{handleX,handleY},target_handle=new[]{targetX,targetY},client_start=new[]{sx,sy},client_end=new[]{ex,ey},native_rectangle_readback_required=true};
  }
  public object SelectObservedObjectPoint(ScreenSceneEvidence scene,int x,int y){
   if(scene==null||scene.MainHwnd!=main||scene.LogicalWidth!=logicalWidth||scene.LogicalHeight!=logicalHeight||scene.Clipped||
      DateTime.UtcNow-DateTime.Parse(scene.CapturedUtc).ToUniversalTime()>TimeSpan.FromSeconds(5)||
      x<0||y<0||x>=logicalWidth||y>=logicalHeight)
    throw new InvalidOperationException("Fresh unclipped owned interior object point required");
   var view=View();Rect r;
   if(view.ToInt64()!=scene.ViewHwnd||!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])
    throw new InvalidOperationException("Object selection view geometry changed");
   Uncovered(r);int width=scene.CanvasBox[2]-scene.CanvasBox[0],height=scene.CanvasBox[3]-scene.CanvasBox[1];
   int cx=scene.CanvasOriginClient[0]+(int)((long)x*width/logicalWidth),cy=scene.CanvasOriginClient[1]+(int)((long)y*height/logicalHeight);
   if(cx<0||cy<0||cx>32767||cy>32767)throw new InvalidOperationException("Object selection client point unavailable");
   IntPtr point=new IntPtr((cy<<16)|(cx&65535));ValidateMain();
   if(!PostMessageW(view,0x200,UIntPtr.Zero,point)||!PostMessageW(view,0x201,new UIntPtr(1),point)||
      !PostMessageW(view,0x202,UIntPtr.Zero,point))
    throw new InvalidOperationException("Owned object point selection message failed");
   return new {view_hwnd=view.ToInt64(),logical_point=new[]{x,y},client_point=new[]{cx,cy},
    native_selection_handle_readback_required=true,object_identity_verified=false};
  }
  public SelectionRectangleEvidence ReadObservedSelectionRectangle(ScreenSceneEvidence scene){
   if(scene==null||scene.MainHwnd!=main||scene.LogicalWidth!=logicalWidth||scene.LogicalHeight!=logicalHeight||scene.Clipped||scene.CanvasBox==null||scene.CanvasBox.Length!=4||scene.CanvasBox[2]-scene.CanvasBox[0]!=logicalWidth||scene.CanvasBox[3]-scene.CanvasBox[1]!=logicalHeight)throw new InvalidOperationException("Exact full native selected-object canvas required");
   var view=View();Rect r;if(view.ToInt64()!=scene.ViewHwnd||!GetWindowRect(view,out r)||r.L!=scene.ViewRect[0]||r.T!=scene.ViewRect[1]||r.R!=scene.ViewRect[2]||r.B!=scene.ViewRect[3])throw new InvalidOperationException("Selected-object view changed before handle read");
   var xs=new HashSet<int>();var ys=new HashSet<int>();int blue=0;
   using(var image=new Bitmap(scene.ImagePath)){
    if(image.Width!=r.R-r.L||image.Height!=r.B-r.T)throw new InvalidOperationException("Selected-object image/view dimensions differ");
    for(int y=scene.CanvasBox[1];y<scene.CanvasBox[3];y++)for(int x=scene.CanvasBox[0];x<scene.CanvasBox[2];x++){var color=image.GetPixel(x,y);if(color.R==0&&color.G==0&&color.B==255){blue++;xs.Add(x);ys.Add(y);}}
    var xvalues=new List<int>(xs);var yvalues=new List<int>(ys);xvalues.Sort();yvalues.Sort();
    if(blue!=288||xvalues.Count!=18||yvalues.Count!=18)throw new InvalidOperationException("Exactly eight native 6x6 blue selection handles required");
    for(int group=0;group<3;group++)for(int offset=1;offset<6;offset++)if(xvalues[group*6+offset]!=xvalues[group*6]+offset||yvalues[group*6+offset]!=yvalues[group*6]+offset)throw new InvalidOperationException("Native selection handle axes differ");
    for(int gy=0;gy<3;gy++)for(int gx=0;gx<3;gx++)for(int dy=0;dy<6;dy++)for(int dx=0;dx<6;dx++){
     var c=image.GetPixel(xvalues[gx*6]+dx,yvalues[gy*6]+dy);bool handle=c.R==0&&c.G==0&&c.B==255;if(handle==(gx==1&&gy==1))throw new InvalidOperationException("Native eight-handle pixel grid differs");
    }
    int left=xvalues[0]+6-scene.CanvasBox[0],top=yvalues[0]+6-scene.CanvasBox[1],right=xvalues[17]-6-scene.CanvasBox[0],bottom=yvalues[17]-6-scene.CanvasBox[1];
    if(left<0||top<0||right<left||bottom<top||right>=logicalWidth||bottom>=logicalHeight)throw new InvalidOperationException("Native selected rectangle outside canvas");
    return new SelectionRectangleEvidence{rectangle=new[]{left,top,right-left+1,bottom-top+1},bottom_right_handle=new[]{xvalues[12]+3-scene.CanvasBox[0],yvalues[12]+3-scene.CanvasBox[1]},blue_handle_pixels=blue,selection_view_hwnd=view.ToInt64(),native_selected_handle_readback=true};
   }
  }
  ScreenSceneEvidence CaptureObservedSelection(ScreenSceneEvidence before,string imagePath){
   var view=View();Rect r;
   if(view.ToInt64()!=before.ViewHwnd||!GetWindowRect(view,out r)||r.L!=before.ViewRect[0]||r.T!=before.ViewRect[1]||r.R!=before.ViewRect[2]||r.B!=before.ViewRect[3])
    throw new InvalidOperationException("Selected-object view changed after resize");
   Uncovered(r);string path=Path.GetFullPath(imagePath);
   if(File.Exists(path))throw new InvalidOperationException("Fresh selected-object image path required");
   using(var image=new Bitmap(r.R-r.L,r.B-r.T,PixelFormat.Format32bppArgb)){
    using(var graphics=Graphics.FromImage(image))graphics.CopyFromScreen(r.L,r.T,0,0,image.Size,CopyPixelOperation.SourceCopy);
    ValidateMain();Rect after;if(!GetWindowRect(view,out after)||after.L!=r.L||after.T!=r.T||after.R!=r.R||after.B!=r.B)
     throw new InvalidOperationException("Selected-object view moved during after capture");
    image.Save(path,ImageFormat.Png);
   }
   string hash;using(var sha=SHA256.Create())using(var file=File.OpenRead(path))hash=BitConverter.ToString(sha.ComputeHash(file)).Replace("-","");
   return new ScreenSceneEvidence{MainHwnd=before.MainHwnd,ViewHwnd=before.ViewHwnd,ViewRect=before.ViewRect,CanvasBox=before.CanvasBox,
    CanvasOriginClient=before.CanvasOriginClient,LogicalWidth=before.LogicalWidth,LogicalHeight=before.LogicalHeight,Clipped=before.Clipped,
    ImagePath=path,ImageSha256=hash,CapturedUtc=DateTime.UtcNow.ToString("o"),PlacementOnly=before.PlacementOnly};
  }
  public object ResizeObservedSelectionRectangle(ScreenSceneEvidence beforeScene,int[] expectedBefore,int[] requested,string afterImagePath){
   if(expectedBefore==null||expectedBefore.Length!=4||requested==null||requested.Length!=4||String.IsNullOrWhiteSpace(afterImagePath))
    throw new ArgumentException("Expected/target native rectangles and fresh after image path required");
   var observed=ReadObservedSelectionRectangle(beforeScene);
   for(int i=0;i<4;i++)if(observed.rectangle[i]!=expectedBefore[i])throw new InvalidOperationException("Selected native object rectangle differs from requested source");
   if(requested[0]!=expectedBefore[0]||requested[1]!=expectedBefore[1]||requested[2]<2||requested[3]<2||
      requested[0]<0||requested[1]<0||requested[0]+requested[2]>logicalWidth||requested[1]+requested[3]>logicalHeight)
    throw new InvalidOperationException("Only observed bottom-right resize at fixed native top-left is supported");
   int targetX=checked(requested[0]+requested[2]+3),targetY=checked(requested[1]+requested[3]+3);
   if(targetX>=logicalWidth||targetY>=logicalHeight)throw new InvalidOperationException("Native target handle outside canvas");
   var drag=DragObservedSelectionHandle(beforeScene,observed.bottom_right_handle[0],observed.bottom_right_handle[1],targetX,targetY);
   System.Threading.Thread.Sleep(120);
   var afterScene=CaptureObservedSelection(beforeScene,afterImagePath);
   var after=ReadObservedSelectionRectangle(afterScene);
   for(int i=0;i<4;i++)if(after.rectangle[i]!=requested[i])throw new InvalidOperationException("Native resized selection rectangle differs from request");
   return new {rectangle_before=observed.rectangle,rectangle_after=after.rectangle,requested_rectangle=requested,
    bottom_right_handle_before=observed.bottom_right_handle,bottom_right_handle_after=after.bottom_right_handle,
    native_selected_handle_readback=true,owned_drag=drag,after_scene=afterScene};
  }
  public void EndPlacement(){var view=View();ValidateMain();if(!PostMessageW(view,0x100,new UIntPtr(27),new IntPtr(0x00010001))||!PostMessageW(view,0x101,new UIntPtr(27),new IntPtr(unchecked((int)0xC0010001))))throw new InvalidOperationException("Owned view Escape placement end failed");} }
}
