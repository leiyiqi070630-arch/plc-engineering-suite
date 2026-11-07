using System;
using System.Collections.Generic;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
  // Edits the observed CN421 Qt enhanced-security table. Qt paints checkboxes
  // and the inline name editor inside ROLE_SYSTEM_CELL without child controls.
  public static class ProjectSecurityAccountControls {
    const int CheckRole=44, TextRole=42, CellRole=29;
    const int Checked=0x10, Unavailable=0x1, Invisible=0x8000;
    static readonly Guid AccessibleId=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");
    [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr hwnd,uint flags);
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr hwnd,StringBuilder name,int count);
    [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
    [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(Point point);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x,int y);
    [DllImport("user32.dll")] static extern void mouse_event(uint flags,uint dx,uint dy,uint data,UIntPtr extra);
    [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr key,IntPtr data);
    [DllImport("user32.dll")] static extern void keybd_event(byte key,byte scan,uint flags,UIntPtr extra);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern short VkKeyScanW(char character);
    [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiThreadInfo info);
    [StructLayout(LayoutKind.Sequential)] struct Point {public int X,Y;}
    [StructLayout(LayoutKind.Sequential)] struct Rect {public int Left,Top,Right,Bottom;}
    [StructLayout(LayoutKind.Sequential)] struct GuiThreadInfo {public uint Size,Flags;public IntPtr Active,Focus,Capture,MenuOwner,MoveSize,Caret;public Rect CaretRect;}

    static void TypeOwnedAccountText(long hwnd,int pid,string desired) {
      var keys=new short[desired.Length];
      for(int i=0;i<desired.Length;i++) {
        keys[i]=VkKeyScanW(desired[i]);
        if(keys[i]==-1||((keys[i]>>8)&0xff)>1)
          throw new InvalidOperationException("Account text contains a character unavailable to the native keyboard layout");
      }
      uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(hwnd),out owner);
      var gui=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
      if(thread==0||owner!=(uint)pid||!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd||
         GetForegroundWindow()!=GetAncestor(new IntPtr(hwnd),2))
        throw new InvalidOperationException("Owned Qt account editor focus changed before typing");
      foreach(short key in keys) {
        byte vk=(byte)(key&0xff);bool shift=(((key>>8)&1)!=0);
        try {
          if(shift)keybd_event(0x10,0,0,UIntPtr.Zero);
          keybd_event(vk,0,0,UIntPtr.Zero);
        } finally {
          keybd_event(vk,0,2,UIntPtr.Zero);
          if(shift)keybd_event(0x10,0,2,UIntPtr.Zero);
        }
      }
    }

    static IAccessible Table(long hwnd,int expectedPid) {
      uint owner;
      if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0 || owner!=(uint)expectedPid)
        throw new InvalidOperationException("Owned account table required");
      IAccessible root; Guid iid=AccessibleId;
      int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root);
      if(hr<0) Marshal.ThrowExceptionForHR(hr);
      var table=root.get_accChild(1) as IAccessible;
      if(table==null || table.accChildCount!=204) throw new InvalidOperationException("Account table shape changed");
      return table;
    }
    static IAccessible Cell(long hwnd,int pid,int row,int col) {
      if(row<0 || row>=11 || col<0 || col>=16) throw new ArgumentOutOfRangeException("row/column");
      var table=Table(hwnd,pid);
      int index=19+row*17+col;
      if(Convert.ToInt32(table.get_accRole(index))!=CellRole) throw new InvalidOperationException("Account cell role changed");
      var cell=table.get_accChild(index) as IAccessible;
      if(cell==null) throw new InvalidOperationException("Account cell accessibility provider unavailable");
      return cell;
    }
    static Rectangle CellBounds(long hwnd,int pid,int row,int col) {
      // The live r3 table evidence located the actual ROLE_SYSTEM_CELL child
      // with accLocation(0). The parent table's child-ID geometry is not the
      // painted cell contract used for the checkbox and editor clicks.
      var cell=Cell(hwnd,pid,row,col);
      int x,y,w,h;cell.accLocation(out x,out y,out w,out h,0);
      if(w<20||h<20||w>300||h>60) throw new InvalidOperationException("Native account cell bounds changed");
      return new Rectangle(x,y,w,h);
    }
    static IntPtr OwnedForeground(long hwnd,int pid) {
      var table=new IntPtr(hwnd);uint owner;
      if(GetWindowThreadProcessId(table,out owner)==0||owner!=(uint)pid)throw new InvalidOperationException("Owned account table required before foreground activation");
      var dialog=GetAncestor(table,2);
      var cls=new StringBuilder(64);
      if(dialog==IntPtr.Zero||dialog==table||!IsChild(dialog,table)||GetWindowThreadProcessId(dialog,out owner)==0||owner!=(uint)pid||!IsWindowVisible(dialog)||!IsWindowEnabled(dialog)||GetClassNameW(dialog,cls,cls.Capacity)==0||cls.ToString()!="#32770")
        throw new InvalidOperationException("Exact owned account modal unavailable before foreground activation");
      var foreground=GetForegroundWindow();
      if(foreground!=dialog) {
        SetForegroundWindow(dialog); // One activation attempt; never replay input.
        var until=DateTime.UtcNow.AddMilliseconds(1200);
        do {Thread.Sleep(40);foreground=GetForegroundWindow();if(foreground==dialog)break;} while(DateTime.UtcNow<until);
      }
      if(foreground!=dialog){uint actualPid=0;if(foreground!=IntPtr.Zero)GetWindowThreadProcessId(foreground,out actualPid);throw new InvalidOperationException("Owned account modal did not become foreground; expected_hwnd="+dialog.ToInt64()+", actual_hwnd="+foreground.ToInt64()+", actual_pid="+actualPid);}
      return dialog;
    }
    static void PhysicalClick(long hwnd,int pid,int row,int col,bool checkbox=false) {
      OwnedForeground(hwnd,pid);var bounds=CellBounds(hwnd,pid,row,col);
      int x=bounds.Left+bounds.Width/2,y=bounds.Top+bounds.Height/2;uint owner;
      if(GetWindowThreadProcessId(WindowFromPoint(new Point{X=x,Y=y}),out owner)==0||owner!=(uint)pid)
        throw new InvalidOperationException("Account cell is not on owned editor");
      if(!SetCursorPos(x,y)) throw new InvalidOperationException("Could not position account cell pointer");
      mouse_event(2,0,0,0,UIntPtr.Zero);
      if(checkbox)Thread.Sleep(45);
      mouse_event(4,0,0,0,UIntPtr.Zero);
    }
    static bool TryPaintedCheck(Rectangle r,Rectangle viewport,out bool value,out int maxEdges) {
      value=false;maxEdges=0;
      // Never classify pixels outside the owned table: a horizontally clipped
      // Qt cell can show a plausible left/top outline without its right edge.
      if(r.Left<viewport.Left||r.Right>viewport.Right||r.Top<viewport.Top||r.Bottom>viewport.Bottom)return false;
      using(var bitmap=new Bitmap(r.Width,r.Height))using(var graphics=Graphics.FromImage(bitmap)) {
        graphics.CopyFromScreen(r.Left,r.Top,0,0,bitmap.Size);
        int box=r.Height>=34?16:13;
        bool? result=null;
        for(int top=0;top<=r.Height-box;top++)for(int left=0;left<=r.Width-box;left++) {
          int edges=0,mark=0;
          for(int i=0;i<box;i++) {
            if(Border(bitmap.GetPixel(left+i,top)))edges++;
            if(Border(bitmap.GetPixel(left+i,top+box-1)))edges++;
            if(Border(bitmap.GetPixel(left,top+i)))edges++;
            if(Border(bitmap.GetPixel(left+box-1,top+i)))edges++;
          }
          if(edges>maxEdges)maxEdges=edges;
          if(edges<4*box-8)continue;
          int inset=box==16?3:2;
          for(int y=inset;y<box-inset;y++)for(int x=inset;x<box-inset;x++)if(Mark(bitmap.GetPixel(left+x,top+y)))mark++;
          bool checkedValue=mark>=(box==16?8:5);
          if(result.HasValue&&result.Value!=checkedValue)throw new InvalidOperationException("Account checkbox visual state ambiguous");
          result=checkedValue;
        }
        if(!result.HasValue)return false;
        value=result.Value;return true;
      }
    }
    static bool PaintedCheck(long hwnd,int pid,int row,int col) {
      OwnedForeground(hwnd,pid);
      Rect native; if(!GetWindowRect(new IntPtr(hwnd),out native)||native.Right<=native.Left||native.Bottom<=native.Top)
        throw new InvalidOperationException("Native account table bounds unavailable");
      var viewport=Rectangle.FromLTRB(native.Left,native.Top,native.Right,native.Bottom);
      var r=CellBounds(hwnd,pid,row,col);bool value;int maxEdges;
      if(TryPaintedCheck(r,viewport,out value,out maxEdges))return value;
      // r69: Class F's 16px box ends behind the table's right clip line.
      // Move only the owned Qt table's horizontal viewport, and accept a
      // result only after the complete original 13/16px outline is readable.
      for(int step=0;step<16;step++) {
        int direction=r.Left+r.Width/2<viewport.Left+viewport.Width/2?-1:1;
        int x=Math.Max(viewport.Left+20,Math.Min(viewport.Right-20,r.Left+r.Width/2));
        int y=Math.Max(viewport.Top+20,Math.Min(viewport.Bottom-20,r.Top+r.Height/2));
        uint packed=(uint)(ushort)(short)(direction*120);
        uint point=((uint)(ushort)y<<16)|(ushort)x;
        if(!PostMessageW(new IntPtr(hwnd),0x020e,new UIntPtr((ulong)packed<<16),new IntPtr((long)point)))
          throw new InvalidOperationException("Owned account table horizontal wheel delivery failed");
        Rectangle moved=r;var until=DateTime.UtcNow.AddMilliseconds(300);
        do {Thread.Sleep(30);moved=CellBounds(hwnd,pid,row,col);if(moved.Left!=r.Left)break;} while(DateTime.UtcNow<until);
        if((direction==1&&moved.Left>=r.Left)||(direction==-1&&moved.Left<=r.Left))
          throw new InvalidOperationException("Account table horizontal viewport did not move toward requested class; row="+row+", col="+col+", direction="+direction+", before_x="+r.Left+", after_x="+moved.Left);
        r=moved;
        if(TryPaintedCheck(r,viewport,out value,out maxEdges))return value;
      }
      throw new InvalidOperationException("Native painted account checkbox not fully visible after bounded horizontal scroll; row="+row+", col="+col+", cell="+r.Left+","+r.Top+","+r.Width+","+r.Height+", max_edges="+maxEdges);
    }
    static bool Border(Color c){return (c.R<100&&c.G<100&&c.B<100)||(c.R<40&&c.G>=85&&c.G<=165&&c.B>=175);}
    static bool Mark(Color c){return (c.R<100&&c.G<100&&c.B<100)||(c.R<40&&c.G>=85&&c.G<=165&&c.B>=175);}
    static void Find(IAccessible node,int role,int depth,List<IAccessible> found) {
      if(depth>2) return;
      int state=Convert.ToInt32(node.get_accState(0));
      if(Convert.ToInt32(node.get_accRole(0))==role && (state&(Unavailable|Invisible))==0) found.Add(node);
      if(depth==2) return;
      int count=node.accChildCount;
      if(count<0 || count>8) throw new InvalidOperationException("Account cell accessibility shape changed");
      for(int i=1;i<=count;i++) {
        var child=node.get_accChild(i) as IAccessible;
        if(child!=null) Find(child,role,depth+1,found);
      }
    }
    static IAccessible Unique(IAccessible cell,int role) {
      var found=new List<IAccessible>(); Find(cell,role,0,found);
      if(found.Count!=1) throw new InvalidOperationException("Unique native account control unavailable for role "+role);
      return found[0];
    }
    static bool CheckedValue(IAccessible check) { return (Convert.ToInt32(check.get_accState(0))&Checked)!=0; }
    public static bool ReadCheck(long hwnd,int pid,int row,int col) {
      if(col!=0 && (col<4 || col>15)) throw new ArgumentException("Only enable and A-L check columns are supported");
      var checks=new List<IAccessible>();Find(Cell(hwnd,pid,row,col),CheckRole,0,checks);
      if(checks.Count>1)throw new InvalidOperationException("Account checkbox accessibility ambiguous");
      return checks.Count==1?CheckedValue(checks[0]):PaintedCheck(hwnd,pid,row,col);
    }
    public static string ReadUserName(long hwnd,int pid,int row) {
      var cell=Cell(hwnd,pid,row,2);
      string value=null;try {value=cell.get_accValue(0);} catch(COMException) {}
      var editors=new List<IAccessible>(); Find(cell,TextRole,0,editors);
      if(editors.Count>1) throw new InvalidOperationException("Account user name editor is ambiguous");
      if(editors.Count==1) {
        string editorValue=null;try {editorValue=editors[0].get_accValue(0);} catch(COMException) {}
        if(value!=null && editorValue!=null && value!=editorValue)
          throw new InvalidOperationException("Account user name cell/editor values differ");
        if(editorValue!=null) value=editorValue;
      }
      if(value==null) throw new InvalidOperationException("Native account user name value unavailable");
      return value;
    }
    static T ClipboardAccess<T>(string stage,Func<T> action) {
      for(int attempt=0;attempt<10;attempt++) {
        try{return action();}
        catch(ExternalException error){if(attempt==9)throw new InvalidOperationException("Native clipboard "+stage+" unavailable after bounded retries",error);Thread.Sleep(50);}
      }
      throw new InvalidOperationException("Native clipboard operation unavailable");
    }
    static string CopyFocusedUserNameEditor(long hwnd,int pid) {
      OwnedForeground(hwnd,pid);
      var prior=ClipboardAccess("snapshot",()=>Clipboard.GetDataObject());
      string marker="PLC Engineering SuiteAccountRead-"+Guid.NewGuid().ToString("N");
      string copied=null;
      try {
        ClipboardAccess("marker_write",()=>{Clipboard.SetText(marker);return true;});
        uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(hwnd),out owner);
        var gui=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
        if(thread==0||owner!=(uint)pid||!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd)
          throw new InvalidOperationException("Account name editor did not retain owned Qt table focus");
        try {keybd_event(0x11,0,0,UIntPtr.Zero);keybd_event(0x41,0,0,UIntPtr.Zero);}
        finally {keybd_event(0x41,0,2,UIntPtr.Zero);keybd_event(0x11,0,2,UIntPtr.Zero);}
        Thread.Sleep(60);
        if(!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd||GetForegroundWindow()!=OwnedForeground(hwnd,pid))
          throw new InvalidOperationException("Account name editor lost owned focus before Copy");
        try {keybd_event(0x11,0,0,UIntPtr.Zero);keybd_event(0x43,0,0,UIntPtr.Zero);}
        finally {keybd_event(0x43,0,2,UIntPtr.Zero);keybd_event(0x11,0,2,UIntPtr.Zero);}
        var deadline=DateTime.UtcNow.AddSeconds(1);
        do {Thread.Sleep(40);copied=ClipboardAccess("unicode_read",()=>Clipboard.GetText(TextDataFormat.UnicodeText));if(!String.IsNullOrEmpty(copied)&&copied!=marker)break;} while(DateTime.UtcNow<deadline);
        if(copied==null||copied==marker||copied.Length==0||copied.Length>128||copied.IndexOfAny(new[]{'\r','\n','\t','\0'})>=0) {
          string state=copied==null?"no_unicode_text":copied==marker?"marker_unchanged":copied.Length==0?"empty":copied.Length>128?"over_bound":"invalid_control_character";
          var focus=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
          bool focusReadable=GetGUIThreadInfo(thread,ref focus);
          throw new InvalidOperationException("Account name was not copied as one complete native value; clipboard_state="+state+", copied_length="+(copied==null?0:copied.Length)+", focus_hwnd="+(focusReadable?focus.Focus.ToInt64():0)+", table_hwnd="+hwnd+", foreground_hwnd="+GetForegroundWindow().ToInt64());
        }
        return copied;
      } finally {
        ClipboardAccess("restore",()=>{if(prior==null)Clipboard.Clear();else Clipboard.SetDataObject(prior,true);return true;});
      }
    }
    static void CancelFocusedUserNameEditor(long hwnd,int pid) {
      var foreground=GetForegroundWindow();uint owner;
      if(foreground!=IntPtr.Zero&&IsChild(foreground,new IntPtr(hwnd))&&GetWindowThreadProcessId(foreground,out owner)!=0&&owner==(uint)pid){keybd_event(0x1B,0,0,UIntPtr.Zero);keybd_event(0x1B,0,2,UIntPtr.Zero);}
    }
    // Called only after opening a previously saved project, before any account
    // write. Never treat a value just submitted by SetText as persisted readback.
    public static string ReadStoredUserNameViaEditor(long hwnd,int pid,int row) {
      if(row<0||row>=11)throw new ArgumentOutOfRangeException("row");
      OwnedForeground(hwnd,pid);
      try {
        PhysicalClick(hwnd,pid,row,2);Thread.Sleep(80);PhysicalClick(hwnd,pid,row,2);
        return CopyFocusedUserNameEditor(hwnd,pid);
      } finally {
        // Escape abandons inline editing; the caller cancels System Parameters.
        CancelFocusedUserNameEditor(hwnd,pid);
      }
    }
    public static bool SetCheck(long hwnd,int pid,int row,int col,bool requested) {
      bool before=ReadCheck(hwnd,pid,row,col);
      string action="none";
      if(before!=requested) {
        var checks=new List<IAccessible>();Find(Cell(hwnd,pid,row,col),CheckRole,0,checks);
        if(checks.Count==1&&checks[0].get_accDefaultAction(0)=="Toggle"){action="accessibility_toggle";checks[0].accDoDefaultAction(0);}
        else {action="physical_click";PhysicalClick(hwnd,pid,row,col,true);}
        Thread.Sleep(180);
      }
      bool after=ReadCheck(hwnd,pid,row,col);
      if(col>=4 && after==before && after!=requested && action=="physical_click") {
        // Qt can use the first click to select the class cell. PhysicalClick
        // resolves its current accLocation again after ReadCheck's scrolling.
        PhysicalClick(hwnd,pid,row,col,true);
        Thread.Sleep(180);
        after=ReadCheck(hwnd,pid,row,col);
      }
      if(after!=requested) {var b=CellBounds(hwnd,pid,row,col);throw new InvalidOperationException("Native account checkbox readback differs; row="+row+", col="+col+", before="+before+", after="+after+", requested="+requested+", action="+action+", cell="+b.Left+","+b.Top+","+b.Width+","+b.Height);}
      return after;
    }
    public static bool SetText(long hwnd,int pid,int row,int col,string desired,bool password) {
      if(col!=(password?3:2) || desired==null || desired.Length==0 || desired.Length>128 || desired.IndexOf('\0')>=0)
        throw new ArgumentException("Account user name/password requires bounded nonempty text without NUL");
      if(!ReadCheck(hwnd,pid,row,0)) throw new InvalidOperationException("Enable account row before editing text");
      var cell=Cell(hwnd,pid,row,col);
      if(!password) {
        // Physical double-click selected user3 in the actual Qt cell. The Qt
        // table retained focus and accepted VK_PACKET/WM_CHAR, without Edit2510.
        PhysicalClick(hwnd,pid,row,col);Thread.Sleep(80);PhysicalClick(hwnd,pid,row,col);
        uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(hwnd),out owner);
        var gui=new GuiThreadInfo();gui.Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo));
        if(thread==0||!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd)
          throw new InvalidOperationException("Native account table did not retain Qt editor focus");
        try {
          // The first character activates the Qt inline editor after a disabled
          // account row is enabled. Confirm that editor before selecting text.
          if(!PostMessageW(new IntPtr(hwnd),0x100,new UIntPtr(0xE7),new IntPtr(1))||
             !PostMessageW(new IntPtr(hwnd),0x102,new UIntPtr(desired[0]),new IntPtr(1))||
             !PostMessageW(new IntPtr(hwnd),0x101,new UIntPtr(0xE7),new IntPtr(unchecked((int)0xC0000001))))
            throw new InvalidOperationException("Owned Qt account probe character delivery failed");
          Thread.Sleep(150);
          CopyFocusedUserNameEditor(hwnd,pid);
          try {keybd_event(0x11,0,0,UIntPtr.Zero);keybd_event(0x41,0,0,UIntPtr.Zero);}
          finally {keybd_event(0x41,0,2,UIntPtr.Zero);keybd_event(0x11,0,2,UIntPtr.Zero);}
          if(!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd||
             GetForegroundWindow()!=GetAncestor(new IntPtr(hwnd),2))
            throw new InvalidOperationException("Native account editor lost owned focus after select-all");
          TypeOwnedAccountText(hwnd,pid,desired);
          Thread.Sleep(150);
          string inEditor=CopyFocusedUserNameEditor(hwnd,pid);
          if(inEditor!=desired)throw new InvalidOperationException("Native account name editor did not retain the exact requested text before commit; expected_length="+desired.Length+", actual_length="+inEditor.Length);
        } catch {CancelFocusedUserNameEditor(hwnd,pid);throw;}
        if(!PostMessageW(new IntPtr(hwnd),0x100,new UIntPtr(13),new IntPtr(1))||
           !PostMessageW(new IntPtr(hwnd),0x101,new UIntPtr(13),new IntPtr(unchecked((int)0xC0000001))))
          throw new InvalidOperationException("Owned Qt account name commit failed");
        return true; // Submitted, not a claim of full native text readback.
      }
      var editors=new List<IAccessible>(); Find(cell,TextRole,0,editors);
      if(editors.Count==0) {
        string action=cell.get_accDefaultAction(0);
        if(action=="Edit") {
          cell.accDoDefaultAction(0);
          editors=new List<IAccessible>(); Find(Cell(hwnd,pid,row,col),TextRole,0,editors);
        } else if(password) {
          PhysicalClick(hwnd,pid,row,col);Thread.Sleep(80);PhysicalClick(hwnd,pid,row,col);
          uint owner;uint thread=GetWindowThreadProcessId(new IntPtr(hwnd),out owner);
          var gui=new GuiThreadInfo{Size=(uint)Marshal.SizeOf(typeof(GuiThreadInfo))};
          if(thread==0||owner!=(uint)pid||!GetGUIThreadInfo(thread,ref gui)||gui.Focus.ToInt64()!=hwnd||
             GetForegroundWindow()!=GetAncestor(new IntPtr(hwnd),2))
            throw new InvalidOperationException("Owned Qt password cell focus unavailable");
          try {
            if(!PostMessageW(new IntPtr(hwnd),0x100,new UIntPtr(0xE7),new IntPtr(1))||
               !PostMessageW(new IntPtr(hwnd),0x102,new UIntPtr(desired[0]),new IntPtr(1))||
               !PostMessageW(new IntPtr(hwnd),0x101,new UIntPtr(0xE7),new IntPtr(unchecked((int)0xC0000001))))
              throw new InvalidOperationException("Owned Qt password editor activation failed");
            Thread.Sleep(150);
            try {keybd_event(0x11,0,0,UIntPtr.Zero);keybd_event(0x41,0,0,UIntPtr.Zero);}
            finally {keybd_event(0x41,0,2,UIntPtr.Zero);keybd_event(0x11,0,2,UIntPtr.Zero);}
            TypeOwnedAccountText(hwnd,pid,desired);
            Thread.Sleep(150);
          } catch {CancelFocusedUserNameEditor(hwnd,pid);throw;}
          if(!PostMessageW(new IntPtr(hwnd),0x100,new UIntPtr(13),new IntPtr(1))||
             !PostMessageW(new IntPtr(hwnd),0x101,new UIntPtr(13),new IntPtr(unchecked((int)0xC0000001))))
            throw new InvalidOperationException("Owned Qt password editor commit failed");
          return true; // Write-only submission; runtime login must verify it.
        }
      }
      if(editors.Count!=1) throw new InvalidOperationException("Unique native account text editor unavailable");
      editors[0].set_accValue(0,desired);
      // A password is deliberately never read back, compared, or returned.
      if(!password && editors[0].get_accValue(0)!=desired)
        throw new InvalidOperationException("Native account user name readback differs");
      return true;
    }
  }
}
