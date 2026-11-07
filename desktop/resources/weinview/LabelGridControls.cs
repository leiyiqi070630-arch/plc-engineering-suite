using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace PLCCode.Weinview {
 // Navigate the owned MFC grid with its keyboard row commands. The caller
 // verifies the resulting label name in the native Text property dialog.
 public static class LabelGridControls {
  [StructLayout(LayoutKind.Sequential)] struct Rect { public int Left,Top,Right,Bottom; }
  [StructLayout(LayoutKind.Sequential)] struct GuiThreadInfo {
   public uint Size,Flags;
   public IntPtr Active,Focus,Capture,MenuOwner,MoveSize,Caret;
   public Rect CaretRect;
  }
  [StructLayout(LayoutKind.Sequential)] struct MouseInput {
   public int X,Y;
   public uint Data,Flags,Time;
   public UIntPtr Extra;
  }
  [StructLayout(LayoutKind.Sequential)] struct KeyboardInput {
   public ushort Vk,Scan;
   public uint Flags,Time;
   public UIntPtr Extra;
  }
  [StructLayout(LayoutKind.Explicit)] struct InputUnion {
   [FieldOffset(0)] public MouseInput Mouse;
   [FieldOffset(0)] public KeyboardInput Keyboard;
  }
  [StructLayout(LayoutKind.Sequential)] struct Input { public uint Type; public InputUnion Union; }
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
  [DllImport("user32.dll")] static extern int GetDlgCtrlID(IntPtr hwnd);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,ExactSpelling=true)]
  static extern int GetClassNameW(IntPtr hwnd,StringBuilder text,int maximum);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] static extern bool AttachThreadInput(uint source,uint target,bool attach);
  [DllImport("user32.dll")] static extern IntPtr SetFocus(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiThreadInfo info);
  [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll")] static extern uint SendInput(uint count,Input[] input,int size);
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SendMessageTimeoutW(
   IntPtr hwnd,uint message,UIntPtr wparam,IntPtr lparam,uint flags,uint timeout,out UIntPtr result);

  static string ClassName(IntPtr hwnd) {
   var text=new StringBuilder(128);
   if(GetClassNameW(hwnd,text,text.Capacity)==0)
    throw new InvalidOperationException("Native Label Library control class unavailable");
   return text.ToString();
  }
  static void InputKey(ushort key,bool release,int inputSize) {
   var input=new Input{Type=1,Union=new InputUnion{
    Keyboard=new KeyboardInput{Vk=key,Flags=release?2u:0u}
   }};
   if(SendInput(1,new[]{input},inputSize)!=1)
    throw new InvalidOperationException("Native Label Library keyboard input failed");
  }
  static void JumpToEdge(ushort key,int inputSize) {
   bool controlDown=false,keyDown=false;
   try {
    InputKey(0x11,false,inputSize);controlDown=true;
    InputKey(key,false,inputSize);keyDown=true;
    InputKey(key,true,inputSize);keyDown=false;
   } finally {
    try {
     if(keyDown)InputKey(key,true,inputSize);
    } finally {
     if(controlDown)InputKey(0x11,true,inputSize);
    }
   }
  }
  static void Arrow(IntPtr grid,ushort key,DateTime deadline) {
   if(DateTime.UtcNow>=deadline)
    throw new TimeoutException("Native Label Library row navigation deadline exceeded");
   UIntPtr ignored;
   if(SendMessageTimeoutW(grid,0x0100,new UIntPtr(key),new IntPtr(1),34,250,out ignored)==IntPtr.Zero)
    throw new InvalidOperationException("Native Label Library arrow key down failed");
   if(SendMessageTimeoutW(grid,0x0101,new UIntPtr(key),new IntPtr(unchecked((int)0xC0000001)),34,250,out ignored)==IntPtr.Zero)
    throw new InvalidOperationException("Native Label Library arrow key up failed");
  }
  public static int SelectRow(long libraryHwnd,long gridHwnd,int zeroIndex,int selectedIndex,int labelCount) {
   if(labelCount<1||labelCount>4096||zeroIndex<0||zeroIndex>=labelCount||
      selectedIndex<0||selectedIndex>=labelCount)
    throw new ArgumentException("Bounded target/current native label rows required");
   var library=new IntPtr(libraryHwnd);
   var grid=new IntPtr(gridHwnd);
   uint owner,gridOwner;
   uint thread=GetWindowThreadProcessId(grid,out gridOwner);
   uint libraryThread=GetWindowThreadProcessId(library,out owner);
   if(libraryHwnd<=0||gridHwnd<=0||thread==0||libraryThread!=thread||
      owner==0||owner!=gridOwner||GetForegroundWindow()!=library||
      !IsChild(library,grid)||!IsWindowVisible(library)||!IsWindowEnabled(library)||
      !IsWindowVisible(grid)||!IsWindowEnabled(grid)||GetDlgCtrlID(grid)!=1696||
      ClassName(library)!="#32770"||ClassName(grid)!="MFCGridCtrl")
    throw new InvalidOperationException("Owned foreground Label Library grid required");
   foreach(int key in new[]{0x10,0x11,0x12})
    if((GetAsyncKeyState(key)&0x8000)!=0)
     throw new InvalidOperationException("Native Label Library modifier already active");
   uint currentThread=GetCurrentThreadId();
   bool attached=false;
   try {
    if(thread!=currentThread) {
     attached=AttachThreadInput(currentThread,thread,true);
     if(!attached)throw new InvalidOperationException("Native Label Library focus attachment failed");
    }
    SetFocus(grid);
    var state=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
    if(GetForegroundWindow()!=library||!GetGUIThreadInfo(thread,ref state)||state.Focus!=grid)
     throw new InvalidOperationException("Native Label Library grid did not acquire focus");
    int direct=Math.Abs(zeroIndex-selectedIndex);
    int fromHome=1+zeroIndex;
    int fromEnd=1+labelCount-1-zeroIndex;
    int start=selectedIndex;
    int inputSize=Marshal.SizeOf(typeof(Input));
    if(inputSize!=(IntPtr.Size==8?40:28))
     throw new InvalidOperationException("Native Label Library keyboard input layout changed");
    if(fromHome<direct&&fromHome<=fromEnd) {
     JumpToEdge(0x24,inputSize);start=0;
     Thread.Sleep(60);
    } else if(fromEnd<direct&&fromEnd<fromHome) {
     JumpToEdge(0x23,inputSize);start=labelCount-1;
     Thread.Sleep(60);
    }
    DateTime deadline=DateTime.UtcNow.AddSeconds(20);
    ushort direction=zeroIndex<start?(ushort)0x26:(ushort)0x28;
    for(int row=0;row<Math.Abs(zeroIndex-start);row++)Arrow(grid,direction,deadline);
    state=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
    if(GetForegroundWindow()!=library||!GetGUIThreadInfo(thread,ref state)||state.Focus!=grid)
     throw new InvalidOperationException("Native Label Library grid lost focus during row navigation");
    return zeroIndex;
   } finally {
    if(attached)AttachThreadInput(currentThread,thread,false);
   }
  }
 }
}
