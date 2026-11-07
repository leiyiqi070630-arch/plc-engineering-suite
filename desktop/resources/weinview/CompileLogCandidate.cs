using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Accessibility;
namespace PLC Engineering Suite.Weinview {
 public sealed class CompileLogNode {public string Path {get;set;}public int Role {get;set;}public string Name {get;set;}}
 // 421 compile export log: five index:0 links, List role33, ListItem role34.
 // Read-only, no Value/State/Action/Sort/full-tree traversal. External watchdog required.
 public sealed class CompileLogCandidate {
  private readonly NativeControls native;
  [DllImport("oleacc.dll")] private static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible value);
  [DllImport("oleacc.dll")] private static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int obtained);
  public CompileLogCandidate(NativeControls boundNative){if(boundNative==null)throw new ArgumentNullException("boundNative");native=boundNative;}
  private long QtRoot(long dialogHwnd){
   WindowInfo dialog=null;foreach(var item in native.EnumTopWindows())if(item.Hwnd==dialogHwnd)dialog=item;
   if(dialog==null||dialog.Class!="#32770"||dialog.Title!="编译"||!dialog.Visible)throw new InvalidOperationException("Bound visible compile dialog required.");
   long root=0;foreach(var item in native.EnumChildControls(dialogHwnd))if(item.Visible&&item.Class=="Qt5QWindowIcon"){
    if(root!=0)throw new InvalidOperationException("Compile Qt root is not unique.");root=item.Hwnd;
   }if(root==0)throw new InvalidOperationException("Compile Qt root unavailable.");return root;
  }
  private static object Child(IAccessible parent,int index){
   var child=new object[1];int obtained;int hr=AccessibleChildren(parent,index,1,child,out obtained);
   if(hr<0)Marshal.ThrowExceptionForHR(hr);if(obtained!=1)throw new InvalidOperationException("Compile log child unavailable.");return child[0];
  }
  public CompileLogNode[] ReadRows(long dialogHwnd){
   long hwnd=QtRoot(dialogHwnd);var guid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible parent;
   int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xFFFFFFFC,ref guid,out parent);
   if(hr!=0||parent==null)throw new InvalidOperationException("Compile accessibility root HRESULT "+hr);
   int[] roles={10,10,10,16,10,33};string path="client";
   for(int depth=0;depth<roles.Length;depth++){
    if(Convert.ToInt32(parent.get_accRole(0))!=roles[depth])throw new InvalidOperationException("Compile log parent role changed at "+path);
    if(depth==roles.Length-1)break;
    if(parent.accChildCount<1)throw new InvalidOperationException("Compile log parent route unavailable at "+path);
    var child=Child(parent,0);parent=child as IAccessible;if(parent==null)throw new InvalidOperationException("Compile log parent route is not an interface.");path+="/index:0";
   }
   // Product payload limits; never truncate a complete compiler log.
   int count=parent.accChildCount;if(count<0||count>4096)throw new InvalidOperationException("Compile log row count outside 0..4096; no truncated success claim.");
   var result=new List<CompileLogNode>();int totalCharacters=0;
   for(int index=0;index<count;index++){
    object child=Child(parent,index);IAccessible acc=child as IAccessible;int id=0;
    if(acc==null){if(!(child is int))throw new InvalidOperationException("Unexpected compile row representation.");acc=parent;id=(int)child;}
    int role=Convert.ToInt32(acc.get_accRole(id));if(role!=34)throw new InvalidOperationException("Compile log row role differs from ListItem34.");
    string name=acc.get_accName(id)??"";if(name.Length>8192)throw new InvalidOperationException("Compile log row exceeds cap.");
    totalCharacters=checked(totalCharacters+name.Length);if(totalCharacters>1048576)throw new InvalidOperationException("Compile log exceeds 1048576 character payload cap; no truncated success claim.");
    result.Add(new CompileLogNode{Path=path+"/index:"+index,Role=role,Name=name});
   }
   if(parent.accChildCount!=count)throw new InvalidOperationException("Compile log changed while reading; retry after settling.");
   QtRoot(dialogHwnd);return result.ToArray();
  }
 }
}
