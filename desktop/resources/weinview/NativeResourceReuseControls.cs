using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Drawing;
using System.Collections.Generic;
using Accessibility;
using PLCCode.Weinview;

namespace PLCCode.Weinview {
 public static class NativeResourceReuseControls {
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
  [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr h);
  [DllImport("user32.dll")] static extern int GetDlgCtrlID(IntPtr h);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr h,StringBuilder s,int n);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowTextW(IntPtr h,StringBuilder s,int n);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint message,UIntPtr w,IntPtr l);
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SendMessageTimeoutW(IntPtr h,uint message,UIntPtr w,IntPtr l,uint flags,uint timeout,out UIntPtr result);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out TileRect rect);
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out TileRect rect);
  [DllImport("user32.dll")] static extern bool PrintWindow(IntPtr h,IntPtr dc,uint flags);
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
  [DllImport("oleacc.dll")] static extern int WindowFromAccessibleObject(IAccessible accessible,out IntPtr hwnd);
  [StructLayout(LayoutKind.Sequential)] struct TileRect {public int left,top,right,bottom;}

  public static long TileParent(long manager,long numberButton) {
   IntPtr parent=GetParent(new IntPtr(numberButton));uint m,n,p;
   GetWindowThreadProcessId(new IntPtr(manager),out m);GetWindowThreadProcessId(new IntPtr(numberButton),out n);GetWindowThreadProcessId(parent,out p);
   if(parent==IntPtr.Zero||m==0||m!=n||m!=p||!IsChild(new IntPtr(manager),parent)||!IsChild(parent,new IntPtr(numberButton)))throw new Exception("Owned native picture tile hierarchy required");
   return parent.ToInt64();
  }
  static void ExactButton(long manager,long parent,long button,int expectedId,int pid,long ticks,string exe) {
   using(var process=Process.GetProcessById(pid))if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Owned vendor process lease differs");
   uint m,p,b;GetWindowThreadProcessId(new IntPtr(manager),out m);GetWindowThreadProcessId(new IntPtr(parent),out p);GetWindowThreadProcessId(new IntPtr(button),out b);
   if(m!=(uint)pid||p!=(uint)pid||b!=(uint)pid||!IsWindowVisible(new IntPtr(manager))||!IsWindowEnabled(new IntPtr(manager))||!IsWindowVisible(new IntPtr(button))||!IsWindowEnabled(new IntPtr(button))||!IsChild(new IntPtr(manager),new IntPtr(button))||!IsChild(new IntPtr(parent),new IntPtr(button))||GetDlgCtrlID(new IntPtr(button))!=expectedId)throw new Exception("Exact owned picture button required");
   var cls=new StringBuilder(128);var title=new StringBuilder(128);GetClassNameW(new IntPtr(button),cls,128);GetWindowTextW(new IntPtr(button),title,128);
   if(cls.ToString()!="Button"||title.Length!=0)throw new Exception("Observed blank native picture button differs");
  }
  public static void AddLibraryOnce(long manager,long button,int pid,long ticks,string exe) {
   ExactButton(manager,manager,button,2773,pid,ticks,exe);
   if(!PostMessageW(new IntPtr(button),0xF5,UIntPtr.Zero,IntPtr.Zero))throw new Exception("Native library add action was not posted");
  }
  public static void CopyPictureOnce(long manager,long parent,long button,int pid,long ticks,string exe) {
   ExactButton(manager,parent,button,2777,pid,ticks,exe);
   UIntPtr result;
   if(SendMessageTimeoutW(new IntPtr(button),0xF5,UIntPtr.Zero,IntPtr.Zero,2,5000,out result)==IntPtr.Zero)throw new Exception("Native picture copy did not finish; action was not replayed");
  }
  static bool HasSelectedPictureNode(IAccessible accessible,int child,IntPtr tile,int pid,int depth,ref int budget,HashSet<long> seen) {
   if(++budget>256||depth>12)throw new Exception("Picture selection provider traversal bound exceeded");
   if(child==0){IntPtr identity=Marshal.GetIUnknownForObject(accessible);long key=identity.ToInt64();Marshal.Release(identity);if(!seen.Add(key))return false;}
   int state=Convert.ToInt32(accessible.get_accState(child));
   if((state&2)!=0&&(state&0x18001)==0){
    IntPtr provider;int result=WindowFromAccessibleObject(accessible,out provider);if(result<0)Marshal.ThrowExceptionForHR(result);
    uint owner;GetWindowThreadProcessId(provider,out owner);
    if(owner!=(uint)pid)throw new Exception("Selected picture provider owner differs");
    if(provider==tile||IsChild(tile,provider))return true;
   }
   if(child!=0)return false;
   int count=accessible.accChildCount;if(count<0||count>128)throw new Exception("Picture selection provider child bound exceeded");
   if(count==0)return false;
   object[] children=new object[count];int obtained;int hr=AccessibleChildren(accessible,0,count,children,out obtained);
   if(hr<0)Marshal.ThrowExceptionForHR(hr);if(obtained!=count)throw new Exception("Picture selection provider changed during read");
   foreach(object item in children){
    var next=item as IAccessible;
    if(next!=null){if(HasSelectedPictureNode(next,0,tile,pid,depth+1,ref budget,seen))return true;}
    else if(item is int){if(HasSelectedPictureNode(accessible,(int)item,tile,pid,depth+1,ref budget,seen))return true;}
    else throw new Exception("Picture selection provider child representation differs");
   }
   return false;
  }
  public static long SelectedPictureTileFromAccessibility(long manager,long[] parents,int pid,long ticks,string exe) {
   using(var process=Process.GetProcessById(pid))if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Owned vendor process lease differs");
   uint managerPid;GetWindowThreadProcessId(new IntPtr(manager),out managerPid);
   if(managerPid!=(uint)pid||!IsWindowVisible(new IntPtr(manager))||!IsWindowEnabled(new IntPtr(manager))||parents==null||parents.Length<1||parents.Length>4096)throw new Exception("Owned picture manager and card directory required");
   long selected=0;var unique=new HashSet<long>();
   foreach(long parent in parents){
    IntPtr tile=new IntPtr(parent);uint owner;GetWindowThreadProcessId(tile,out owner);
    if(!unique.Add(parent)||owner!=(uint)pid||!IsChild(new IntPtr(manager),tile)||!IsWindowVisible(tile))throw new Exception("Owned unique picture card required");
    var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible accessible;
    int hr=AccessibleObjectFromWindow(tile,0xfffffffc,ref iid,out accessible);if(hr<0||accessible==null)continue;
    try{
     int budget=0;if(HasSelectedPictureNode(accessible,0,tile,pid,0,ref budget,new HashSet<long>())){
      if(selected!=0)throw new Exception("More than one actual picture card has MSAA selected state");
      selected=parent;
     }
    }finally{if(Marshal.IsComObject(accessible))Marshal.ReleaseComObject(accessible);}
   }
   return selected;
  }
  public static bool IsPictureTileSelected(long manager,long parent,int pid,long ticks,string exe) {
   using(var process=Process.GetProcessById(pid))if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Owned vendor process lease differs");
   if(!IsChild(new IntPtr(manager),new IntPtr(parent))||!IsWindowVisible(new IntPtr(manager))||!IsWindowVisible(new IntPtr(parent)))throw new Exception("Visible owned picture tile required");
   IntPtr oldDpi=SetThreadDpiAwarenessContext(new IntPtr(-4));
   if(oldDpi==IntPtr.Zero)throw new Exception("Picture tile thread DPI context unavailable");
   try {
    TileRect r;if(!GetWindowRect(new IntPtr(parent),out r))throw new Exception("Picture tile bounds unavailable");int width=r.right-r.left,height=r.bottom-r.top;
    if(width<100||width>600||height<80||height>300)throw new Exception("Observed picture tile dimensions changed");
    using(var image=new Bitmap(width,height))using(var graphics=Graphics.FromImage(image)){
     IntPtr dc=graphics.GetHdc();
     try {if(!PrintWindow(new IntPtr(parent),dc,2))throw new Exception("Owned picture tile PrintWindow failed");}
     finally {graphics.ReleaseHdc(dc);}
     int samples=0,yellow=0;
     foreach(int y in new[]{2,height-3})for(int x=6;x<width-6;x++){
      Color pixel=image.GetPixel(x,y);samples++;if(pixel.R>=240&&pixel.G>=230&&pixel.B<=80)yellow++;
     }
     if(yellow*10>=samples*8)return true;
     if(yellow*10<=samples)return false;
     throw new Exception("Picture tile selection border ambiguous");
    }
   } finally {if(SetThreadDpiAwarenessContext(oldDpi)==IntPtr.Zero)throw new Exception("Picture tile thread DPI context restore failed");}
  }
  public static void SelectPictureTileOnce(long manager,long parent,int pid,long ticks,string exe) {
   using(var process=Process.GetProcessById(pid))if(process.HasExited||process.StartTime.ToUniversalTime().Ticks!=ticks||!String.Equals(process.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase))throw new Exception("Owned vendor process lease differs");
   if(!IsChild(new IntPtr(manager),new IntPtr(parent))||!IsWindowVisible(new IntPtr(manager))||!IsWindowEnabled(new IntPtr(manager))||!IsWindowVisible(new IntPtr(parent))||!IsWindowEnabled(new IntPtr(parent)))throw new Exception("Interactive owned picture tile required");
   IntPtr oldDpi=SetThreadDpiAwarenessContext(new IntPtr(-4));
   if(oldDpi==IntPtr.Zero)throw new Exception("Picture tile thread DPI context unavailable");
   try {
    TileRect client;if(!GetClientRect(new IntPtr(parent),out client))throw new Exception("Picture tile client bounds unavailable");
    int width=client.right-client.left,height=client.bottom-client.top;
    if(width<1||height<1||width>32767||height>32767)throw new Exception("Picture tile client dimensions invalid");
    int x=client.left+width/2,y=client.top+height/2;
    IntPtr point=new IntPtr((y<<16)|(x&0xffff));
    if(!PostMessageW(new IntPtr(parent),0x201,new UIntPtr(1),point)||!PostMessageW(new IntPtr(parent),0x202,UIntPtr.Zero,point))throw new Exception("Observed picture tile selection was not posted");
   } finally {if(SetThreadDpiAwarenessContext(oldDpi)==IntPtr.Zero)throw new Exception("Picture tile thread DPI context restore failed");}
  }
 }
}
