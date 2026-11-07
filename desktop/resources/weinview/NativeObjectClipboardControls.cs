using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

namespace PLC Engineering Suite.Weinview {
 public static class NativeObjectClipboardControls {
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam);
  [DllImport("user32.dll")] static extern uint GetClipboardSequenceNumber();
  [DllImport("user32.dll")] static extern IntPtr GetClipboardOwner();
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint RegisterClipboardFormatW(string name);
  [DllImport("user32.dll",SetLastError=true)] static extern bool OpenClipboard(IntPtr hwnd);
  [DllImport("user32.dll",SetLastError=true)] static extern bool CloseClipboard();
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr GetClipboardData(uint format);
  [DllImport("user32.dll",SetLastError=true)] static extern bool EmptyClipboard();
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SetClipboardData(uint format,IntPtr memory);
  [DllImport("kernel32.dll",SetLastError=true)] static extern UIntPtr GlobalSize(IntPtr memory);
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr GlobalLock(IntPtr memory);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GlobalUnlock(IntPtr memory);
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr GlobalAlloc(uint flags,UIntPtr bytes);
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr GlobalFree(IntPtr memory);

  public sealed class CopyReceipt {
   public readonly uint command;
   public readonly uint clipboard_sequence;
   public readonly long bytes;
   public readonly int owner_pid;
   public readonly long main_hwnd;
   public readonly long view_hwnd;
   public readonly string document_title;
   internal CopyReceipt(uint command,uint sequence,long bytes,int pid,long main,long view,string title){
    this.command=command;clipboard_sequence=sequence;this.bytes=bytes;owner_pid=pid;main_hwnd=main;view_hwnd=view;document_title=title;
   }
  }
  public sealed class OpaqueCopyPayload {
   public readonly long bytes;
   internal readonly byte[] data;
   internal readonly uint command;
   public readonly string source_exe_path;
   internal OpaqueCopyPayload(byte[] data,uint command,string sourceExePath){
    this.data=data;bytes=data.LongLength;this.command=command;source_exe_path=sourceExePath;
   }
  }
  sealed class ClipboardSnapshot {public uint Sequence;public long Bytes;public int OwnerPid;}

  static void CheckCanvas(NativeControls native,long main,long view,string title,int pid,string exePath){
   if(native==null||pid<=0||String.IsNullOrWhiteSpace(title)||String.IsNullOrWhiteSpace(exePath))throw new ArgumentException("Bound native document and executable required.");
   string full=Path.GetFullPath(exePath);
   using(var process=Process.GetProcessById(pid))if(!String.Equals(Path.GetFullPath(process.MainModule.FileName),full,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Owned EasyBuilder executable differs from accelerator source.");
   int mains=0;
   foreach(WindowInfo item in native.EnumTopWindows())if(item.Hwnd==main&&item.Pid==pid&&item.Class=="EasyBuilderPro"&&item.Visible&&item.Enabled)mains++;
   if(mains!=1)throw new InvalidOperationException("Owned visible EasyBuilder main window required.");
   int views=0;
   foreach(WindowInfo item in native.EnumChildControls(main))if(item.Hwnd==view&&item.Pid==pid&&item.Id==59665&&item.Class=="AfxFrameOrView140u"&&item.Title==title&&item.Visible&&item.Enabled)views++;
   if(views!=1)throw new InvalidOperationException("Exact owned visible document canvas required.");
  }
  static ClipboardSnapshot ReadClipboard(uint format){
   uint sequence=GetClipboardSequenceNumber();
   IntPtr owner=GetClipboardOwner();uint pid=0;
   if(sequence==0||owner==IntPtr.Zero||GetWindowThreadProcessId(owner,out pid)==0||pid==0)return null;
   if(!OpenClipboard(IntPtr.Zero))return null;
   long bytes;
   try{
    IntPtr data=GetClipboardData(format);
    if(data==IntPtr.Zero)return null;
    ulong size=GlobalSize(data).ToUInt64();
    if(size==0||size>long.MaxValue)return null;
    bytes=(long)size;
   }finally{CloseClipboard();}
   if(GetClipboardSequenceNumber()!=sequence||GetClipboardOwner()!=owner)return null;
   return new ClipboardSnapshot{Sequence=sequence,Bytes=bytes,OwnerPid=(int)pid};
  }
  static uint ClipboardFormat(){uint format=RegisterClipboardFormatW("EBClipboardObject");if(format==0)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject clipboard format unavailable.");return format;}

  public static uint SelectAll(NativeControls native,long main,long view,string documentTitle,int pid,string exePath){
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   const uint command=26220;
   if(!PostMessageW(new IntPtr(view),0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned canvas Select All command was not posted.");
   return command;
  }
  public static CopyReceipt Copy(NativeControls native,long main,long view,string documentTitle,int pid,string exePath){
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   uint command=NativeRecoveryMenuControls.ReadCopyAccelerator(exePath),format=ClipboardFormat(),before=GetClipboardSequenceNumber();
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   if(!PostMessageW(new IntPtr(view),0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned canvas Copy command was not posted.");
   DateTime deadline=DateTime.UtcNow.AddSeconds(2);
   do{
    ClipboardSnapshot snapshot=ReadClipboard(format);
    if(snapshot!=null&&snapshot.Sequence!=before&&snapshot.OwnerPid==pid)return new CopyReceipt(command,snapshot.Sequence,snapshot.Bytes,pid,main,view,documentTitle);
    Thread.Sleep(25);
   }while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Copy did not refresh owned EBClipboardObject clipboard data.");
  }
  public static OpaqueCopyPayload CapturePayload(NativeControls native,long main,long view,string documentTitle,int pid,string exePath,CopyReceipt receipt){
   if(receipt==null||receipt.main_hwnd!=main||receipt.view_hwnd!=view||receipt.document_title!=documentTitle||receipt.owner_pid!=pid)throw new InvalidOperationException("Copy receipt does not match this owned document.");
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   uint format=ClipboardFormat();
   IntPtr owner=GetClipboardOwner();
   ClipboardSnapshot snapshot=ReadClipboard(format);
   if(snapshot==null||snapshot.Sequence!=receipt.clipboard_sequence||snapshot.Bytes!=receipt.bytes||snapshot.OwnerPid!=pid)throw new InvalidOperationException("EBClipboardObject clipboard changed before payload capture.");
   if(owner==IntPtr.Zero||GetClipboardOwner()!=owner||GetClipboardSequenceNumber()!=receipt.clipboard_sequence)throw new InvalidOperationException("EBClipboardObject clipboard changed before payload capture.");
   if(!OpenClipboard(IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject clipboard unavailable for payload capture.");
   byte[] data;
   try{
    if(GetClipboardSequenceNumber()!=receipt.clipboard_sequence||GetClipboardOwner()!=owner)throw new InvalidOperationException("EBClipboardObject clipboard changed during payload capture.");
    IntPtr handle=GetClipboardData(format);
    if(handle==IntPtr.Zero)throw new InvalidOperationException("EBClipboardObject clipboard data unavailable for payload capture.");
    ulong size=GlobalSize(handle).ToUInt64();
    if(size==0||size!=(ulong)receipt.bytes||size>Int32.MaxValue)throw new InvalidOperationException("EBClipboardObject payload size changed or exceeds byte array capacity.");
    IntPtr memory=GlobalLock(handle);
    if(memory==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject payload lock failed.");
    try{data=new byte[(int)size];Marshal.Copy(memory,data,0,data.Length);}
    finally{GlobalUnlock(handle);}
    if(GetClipboardSequenceNumber()!=receipt.clipboard_sequence||GetClipboardOwner()!=owner)throw new InvalidOperationException("EBClipboardObject clipboard changed during payload capture.");
   }finally{CloseClipboard();}
   if(GetClipboardSequenceNumber()!=receipt.clipboard_sequence||GetClipboardOwner()!=owner)throw new InvalidOperationException("EBClipboardObject clipboard changed during payload capture.");
   return new OpaqueCopyPayload(data,receipt.command,Path.GetFullPath(exePath));
  }
  public static CopyReceipt PublishPayload(NativeControls native,long main,long view,string documentTitle,int pid,string exePath,OpaqueCopyPayload payload){
   if(payload==null||payload.data==null||payload.data.Length==0||payload.bytes!=payload.data.LongLength)throw new InvalidOperationException("Original EBClipboardObject payload required.");
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   if(!String.Equals(Path.GetFullPath(exePath),payload.source_exe_path,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Source and target EasyBuilder installations differ.");
   uint format=ClipboardFormat();
   IntPtr handle=GlobalAlloc(2,new UIntPtr((uint)payload.data.Length));
   if(handle==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject payload allocation failed.");
   try{
    IntPtr memory=GlobalLock(handle);
    if(memory==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject payload lock failed.");
    try{Marshal.Copy(payload.data,0,memory,payload.data.Length);}
    finally{GlobalUnlock(handle);}
    CheckCanvas(native,main,view,documentTitle,pid,exePath);
    if(!OpenClipboard(new IntPtr(view)))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Target clipboard unavailable for payload publication.");
    try{
     if(!EmptyClipboard())throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Target clipboard could not be emptied.");
     if(SetClipboardData(format,handle)==IntPtr.Zero)throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"EBClipboardObject payload publication failed.");
     handle=IntPtr.Zero;
    }finally{CloseClipboard();}
    ClipboardSnapshot snapshot=ReadClipboard(format);
    if(snapshot==null||snapshot.OwnerPid!=pid||snapshot.Bytes!=payload.bytes)throw new InvalidOperationException("Published EBClipboardObject owner or size differs from target payload.");
    return new CopyReceipt(payload.command,snapshot.Sequence,payload.bytes,pid,main,view,documentTitle);
   }finally{if(handle!=IntPtr.Zero)GlobalFree(handle);}
  }
  public static uint Paste(NativeControls native,long main,long view,string documentTitle,int pid,string exePath,CopyReceipt receipt){
   if(receipt==null||receipt.main_hwnd!=main||receipt.view_hwnd!=view||receipt.document_title!=documentTitle||receipt.owner_pid!=pid)throw new InvalidOperationException("Copy receipt does not match this owned document.");
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   uint command=NativeRecoveryMenuControls.ReadPasteAccelerator(exePath);
   ClipboardSnapshot snapshot=ReadClipboard(ClipboardFormat());
   if(snapshot==null||snapshot.Sequence!=receipt.clipboard_sequence||snapshot.Bytes!=receipt.bytes||snapshot.OwnerPid!=receipt.owner_pid)throw new InvalidOperationException("EBClipboardObject clipboard changed before Paste.");
   CheckCanvas(native,main,view,documentTitle,pid,exePath);
   if(GetClipboardSequenceNumber()!=receipt.clipboard_sequence)throw new InvalidOperationException("Clipboard changed before Paste command.");
   if(!PostMessageW(new IntPtr(view),0x111,new UIntPtr(command),IntPtr.Zero))throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error(),"Owned canvas Paste command was not posted.");
   return command;
  }
 }
}
