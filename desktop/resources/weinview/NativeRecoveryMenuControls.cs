using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public static class NativeRecoveryMenuControls {
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint id,ref Guid iid,out IAccessible value);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll")] static extern bool IsWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr hwnd,StringBuilder text,int maximum);
  [DllImport("user32.dll",ExactSpelling=true)] static extern int GetDlgCtrlID(IntPtr hwnd);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr LoadLibraryExW(string file,IntPtr reserved,uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool FreeLibrary(IntPtr module);
  delegate bool ResourceNameCallback(IntPtr module,IntPtr type,IntPtr name,IntPtr context);
  delegate bool ResourceLanguageCallback(IntPtr module,IntPtr type,IntPtr name,ushort language,IntPtr context);
  [DllImport("kernel32.dll",EntryPoint="EnumResourceNamesW",SetLastError=true)] static extern bool EnumResourceNames(IntPtr module,IntPtr type,ResourceNameCallback callback,IntPtr context);
  [DllImport("kernel32.dll",EntryPoint="EnumResourceLanguagesW",SetLastError=true)] static extern bool EnumResourceLanguages(IntPtr module,IntPtr type,IntPtr name,ResourceLanguageCallback callback,IntPtr context);
  [DllImport("kernel32.dll",EntryPoint="FindResourceExW",SetLastError=true)] static extern IntPtr FindResourceEx(IntPtr module,IntPtr type,IntPtr name,ushort language);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint SizeofResource(IntPtr module,IntPtr resource);
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr LoadResource(IntPtr module,IntPtr resource);
  [DllImport("kernel32.dll")] static extern IntPtr LockResource(IntPtr resource);
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  sealed class Row {public string Name,Action;public int Role,State;public IAccessible Accessible;public int Child;}
  static void CheckOwner(long hwnd,int pid){uint owner;if(!IsWindow(new IntPtr(hwnd))||!IsWindowVisible(new IntPtr(hwnd))||!IsWindowEnabled(new IntPtr(hwnd))||GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid)throw new InvalidOperationException("Owned visible native menu required.");}
  static uint ReadAccelerator(string exePath,int virtualKey,int modifiers,string shortcut){
   if(String.IsNullOrWhiteSpace(exePath)||!File.Exists(exePath))throw new InvalidOperationException("Actual EasyBuilder executable required for accelerator read.");
   IntPtr module=LoadLibraryExW(Path.GetFullPath(exePath),IntPtr.Zero,0x22); // DATAFILE | IMAGE_RESOURCE: resource mapping only.
   if(module==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Cannot map original accelerator resources.");
   try{
    var commands=new HashSet<uint>();Exception failure=null;
    ResourceLanguageCallback readLanguage=delegate(IntPtr mapped,IntPtr type,IntPtr name,ushort language,IntPtr context){
     try{
      IntPtr resource=FindResourceEx(mapped,type,name,language);
      if(resource==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Original accelerator language resource absent.");
      uint size=SizeofResource(mapped,resource);
      if(size==0||size>1048576||size%8!=0)throw new InvalidOperationException("Original accelerator entry size invalid.");
      IntPtr handle=LoadResource(mapped,resource),bytes=handle==IntPtr.Zero?IntPtr.Zero:LockResource(handle);
      if(bytes==IntPtr.Zero)throw new InvalidOperationException("Original accelerator resource bytes unavailable.");
      for(int offset=0;offset<(int)size;offset+=8){
       int flags=(ushort)Marshal.ReadInt16(bytes,offset),key=(ushort)Marshal.ReadInt16(bytes,offset+2);
       if(key==virtualKey&&(flags&0x1d)==(1|modifiers))commands.Add((uint)(ushort)Marshal.ReadInt16(bytes,offset+4));
      }
      return true;
     }catch(Exception error){failure=error;return false;}
    };
    ResourceNameCallback readName=delegate(IntPtr mapped,IntPtr type,IntPtr name,IntPtr context){
     if(!EnumResourceLanguages(mapped,type,name,readLanguage,IntPtr.Zero)&&failure==null)failure=new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Cannot enumerate original accelerator languages.");
     return failure==null;
    };
    if(!EnumResourceNames(module,new IntPtr(9),readName,IntPtr.Zero)&&failure==null)failure=new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Cannot enumerate original accelerator tables.");
    if(failure!=null)throw failure;
    if(commands.Count!=1)throw new InvalidOperationException("Unique "+shortcut+" accelerator command unavailable.");
    foreach(uint command in commands)return command;
    throw new InvalidOperationException(shortcut+" accelerator command absent.");
   }finally{FreeLibrary(module);}
  }
  public static uint ReadUploadAccelerator(string exePath){return ReadAccelerator(exePath,119,0,"unmodified F8");}
  public static uint ReadFindAddressAccelerator(string exePath){return ReadAccelerator(exePath,70,8,"Ctrl+F");}
  public static uint ReadCopyAccelerator(string exePath){return ReadAccelerator(exePath,67,8,"Ctrl+C");}
  public static uint ReadPasteAccelerator(string exePath){return ReadAccelerator(exePath,86,8,"Ctrl+V");}
  public static uint ReadDirectionAccelerator(string exePath,int virtualKey){
   if(virtualKey<37||virtualKey>40)throw new ArgumentException("Only unmodified arrow-key accelerators are supported.");
   return ReadAccelerator(exePath,virtualKey,0,"unmodified arrow key");
  }
  public static uint OpenUploadFromAccelerator(long mainHwnd,int pid,string exePath){
   CheckOwner(mainHwnd,pid);
   var cls=new StringBuilder(128);
   if(GetClassNameW(new IntPtr(mainHwnd),cls,cls.Capacity)==0||cls.ToString()!="EasyBuilderPro")throw new InvalidOperationException("Owned EasyBuilder main window required.");
   string full=Path.GetFullPath(exePath);
   using(var process=Process.GetProcessById(pid))if(!String.Equals(Path.GetFullPath(process.MainModule.FileName),full,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Owned EasyBuilder executable differs from accelerator source.");
   uint command=ReadUploadAccelerator(full);
   CheckOwner(mainHwnd,pid);
   if(!PostMessageW(new IntPtr(mainHwnd),0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned upload accelerator command was not posted.");
   return command;
  }
  public static uint PrepareFindAddressFromMainAccelerator(long mainHwnd,int pid,string exePath){
   CheckOwner(mainHwnd,pid);
   var cls=new StringBuilder(128);
   if(GetClassNameW(new IntPtr(mainHwnd),cls,cls.Capacity)==0||cls.ToString()!="EasyBuilderPro")throw new InvalidOperationException("Owned EasyBuilder main window required.");
   string full=Path.GetFullPath(exePath);
   using(var process=Process.GetProcessById(pid))if(!String.Equals(Path.GetFullPath(process.MainModule.FileName),full,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Owned EasyBuilder executable differs from accelerator source.");
   uint command=ReadFindAddressAccelerator(full);
   CheckOwner(mainHwnd,pid);
   if(!PostMessageW(new IntPtr(mainHwnd),0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned main find-address accelerator command was not posted.");
   return command;
  }
  public static uint OpenFindAddressFromAccelerator(long viewHwnd,int pid,string exePath){
   CheckOwner(viewHwnd,pid);
   var cls=new StringBuilder(128);
   IntPtr view=new IntPtr(viewHwnd);
   if(GetClassNameW(view,cls,cls.Capacity)==0||cls.ToString()!="AfxFrameOrView140u"||GetDlgCtrlID(view)!=59665)throw new InvalidOperationException("Owned EasyBuilder document canvas required.");
   string full=Path.GetFullPath(exePath);
   using(var process=Process.GetProcessById(pid))if(!String.Equals(Path.GetFullPath(process.MainModule.FileName),full,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Owned EasyBuilder executable differs from accelerator source.");
   uint command=ReadFindAddressAccelerator(full);
   CheckOwner(viewHwnd,pid);
   cls.Clear();
   if(GetClassNameW(view,cls,cls.Capacity)==0||cls.ToString()!="AfxFrameOrView140u"||GetDlgCtrlID(view)!=59665)throw new InvalidOperationException("Owned EasyBuilder document canvas changed.");
   if(!PostMessageW(view,0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned find-address accelerator command was not posted.");
   return command;
  }
  public static void ClickFileRibbon(NativeControls native,NativeSemanticControls.RibbonProof proof,int pid,double x,double y){
   if(proof==null||x<0||y<0||x>=100||y>=25||GetForegroundWindow().ToInt64()!=proof.Main||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Fresh left-header File caption proof required.");
   CheckOwner(proof.Hwnd,pid);Rect rect;if(!GetWindowRect(new IntPtr(proof.Hwnd),out rect)||rect.left!=proof.Left||rect.top!=proof.Top||rect.right-rect.left!=proof.Width||rect.bottom-rect.top!=proof.Height)throw new InvalidOperationException("Native File ribbon geometry changed.");
   string hash;using(var sha=SHA256.Create())using(var stream=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","");if(hash!=proof.Hash)throw new InvalidOperationException("Native File caption proof changed.");
   int sx=proof.Left+(int)x,sy=proof.Top+(int)y;Point client=new Point{x=sx,y=sy};if(!ScreenToClient(new IntPtr(proof.Hwnd),ref client)||client.x<0||client.y<0||client.x>32767||client.y>32767)throw new InvalidOperationException("Native File caption point outside ribbon.");
   native.EnumChildControls(proof.Main);IntPtr packed=new IntPtr((client.y<<16)|client.x);
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x200,UIntPtr.Zero,packed)||!PostMessageW(new IntPtr(proof.Hwnd),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(proof.Hwnd),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Owned File ribbon click failed.");
  }
  static void Walk(IAccessible value,int child,int depth,ref int budget,List<Row> rows,HashSet<long> seen){
   if(++budget>128||depth>8)throw new InvalidOperationException("Native recovery menu traversal bound.");
   if(child==0){IntPtr ptr=Marshal.GetIUnknownForObject(value);long key=ptr.ToInt64();Marshal.Release(ptr);if(!seen.Add(key))return;}
   int role;try{role=Convert.ToInt32(value.get_accRole(child));}catch{if(child!=0)throw;role=0;}
   if(role==12||role==37||role==43){rows.Add(new Row{Name=value.get_accName(child),Action=value.get_accDefaultAction(child),Role=role,State=Convert.ToInt32(value.get_accState(child)),Accessible=value,Child=child});return;}
   if(child!=0)return;int count=value.accChildCount;if(count<0||count>64)throw new InvalidOperationException("Native recovery menu branch bound.");
   object[] children=new object[count];int obtained;int hr=AccessibleChildren(value,0,count,children,out obtained);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(obtained!=count)throw new InvalidOperationException("Native recovery menu changed while reading.");
   foreach(object item in children){if(item is int)Walk(value,(int)item,depth+1,ref budget,rows,seen);else if(item is IAccessible)Walk((IAccessible)item,0,depth+1,ref budget,rows,seen);else throw new InvalidOperationException("Unknown native menu node.");}
  }
  public static object[] ReadOrInvoke(long hwnd,int pid,string exactName){
   CheckOwner(hwnd,pid);if(!String.IsNullOrEmpty(exactName)&&exactName!="文件"&&exactName!="反编译"&&exactName!="反编译..."&&exactName!="上传 (HMI->PC) F8")throw new InvalidOperationException("Unreviewed native recovery menu command.");
   Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root);if(hr<0||root==null)throw new InvalidOperationException("Native recovery menu accessibility provider absent.");
   var rows=new List<Row>();int budget=0;Walk(root,0,0,ref budget,rows,new HashSet<long>());CheckOwner(hwnd,pid);
   if(!String.IsNullOrEmpty(exactName)){Row target=null;foreach(Row row in rows)if(row.Name==exactName){if(target!=null)throw new InvalidOperationException("Native recovery menu command ambiguous.");target=row;}
    if(target==null||String.IsNullOrEmpty(target.Action)||(target.State&1)!=0)throw new InvalidOperationException("Native recovery menu command unavailable.");
    target.Accessible.accDoDefaultAction(target.Child);
   }
   var output=new List<object>();foreach(Row row in rows)output.Add(new {name=row.Name,action=row.Action,role=row.Role,state=row.State});return output.ToArray();
  }
 }
}
