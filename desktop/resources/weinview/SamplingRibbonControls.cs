using System;using System.IO;using System.Runtime.InteropServices;using System.Security.Cryptography;
namespace PLC Engineering Suite.Weinview {
 // Finite sampling entry only; all coordinates originate in one fresh owned OCR image.
 public static class SamplingRibbonControls {
  [StructLayout(LayoutKind.Sequential)]struct Point {public int x,y;}
  [DllImport("user32.dll")]static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref Point point);
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint message,UIntPtr wp,IntPtr lp);
  static string Sha(string path){using(var s=SHA256.Create())using(var f=File.OpenRead(path))return BitConverter.ToString(s.ComputeHash(f)).Replace("-","");}
  public static long OwnerOf(NativeControls n,long hwnd){n.GetControlText(hwnd,4096);long owner=GetWindow(new IntPtr(hwnd),4).ToInt64();if(owner!=0)n.GetControlText(owner,4096);return owner;}
  public static object RequireDialog(NativeControls n,long hwnd,string title,long owner){
   return RequireDialogState(n,hwnd,title,owner,true);
  }
  public static object RequireDialogState(NativeControls n,long hwnd,string title,long owner,bool enabled){
   n.GetControlText(hwnd,4096);WindowInfo actual=null;foreach(var w in n.EnumTopWindows())if(w.Hwnd==hwnd)actual=w;
   if(actual==null||actual.Class!="#32770"||actual.Title!=title||!actual.Visible||actual.Enabled!=enabled||OwnerOf(n,hwnd)!=owner)throw new InvalidOperationException("Exact originally owned sampling dialog state and owner required");
   return new {hwnd=hwnd,title=actual.Title,pid=actual.Pid,owner_hwnd=owner,visible=actual.Visible,enabled=actual.Enabled};
  }
  public static object ActivateSuccessNotice(NativeControls n,long notice,long manager,long main){
   RequireDialogState(n,manager,"资料取样",main,false);RequireDialog(n,notice,"EasyBuilder Pro",manager);
   var children=n.EnumChildControls(notice);WindowInfo body=null,button=null;int bodies=0,buttons=0;
   foreach(var w in children){if(!w.Visible)continue;if(w.Class=="Static"&&w.Id==65535){body=w;bodies++;}if(w.Class=="Button"){button=w;buttons++;}}
   if(bodies!=1||buttons!=1||n.GetControlText(body.Hwnd,4096)!="成功"||button.Id!=2||button.Title!="确定"||!button.Enabled)throw new InvalidOperationException("Exact original success Notice controls required for finite activation");
   long before=GetForegroundWindow().ToInt64();bool requested=before!=notice;if(requested&&!SetForegroundWindow(new IntPtr(notice)))throw new InvalidOperationException("Owned sampling success Notice activation refused; no retry");
   n.EnumTopWindows();long after=GetForegroundWindow().ToInt64();if(after!=notice)throw new InvalidOperationException("Exact owned sampling success Notice foreground required; no retry");
   return new {notice_hwnd=notice,manager_hwnd=manager,main_hwnd=main,foreground_before=before,foreground_after=after,activation_requested=requested,foreground_verified=true,global_input=false};
  }
  public static object ActivateReplacementNotice(NativeControls n,long notice,long manager,long main){
   RequireDialogState(n,manager,"资料取样",main,false);RequireDialog(n,notice,"EasyBuilder Pro",manager);
   WindowInfo body=null;int bodies=0,buttons=0;bool yes=false,no=false,cancel=false;
   foreach(var w in n.EnumChildControls(notice)){if(!w.Visible)continue;if(w.Class=="Static"&&w.Id==65535){body=w;bodies++;}if(w.Class=="Button"){buttons++;if(!w.Enabled)throw new InvalidOperationException("Replacement confirmation button disabled");if(w.Id==6&&w.Title=="是(&Y)")yes=true;else if(w.Id==7&&w.Title=="否(&N)")no=true;else if(w.Id==2&&w.Title=="取消")cancel=true;else throw new InvalidOperationException("Unknown replacement confirmation button");}}
   if(bodies!=1||buttons!=3||!yes||!no||!cancel||n.GetControlText(body.Hwnd,4096)!="是否要删除现有的资料取样 ?")throw new InvalidOperationException("Exact native sampling replacement confirmation required");
   long before=GetForegroundWindow().ToInt64();bool requested=before!=notice;if(requested&&!SetForegroundWindow(new IntPtr(notice)))throw new InvalidOperationException("Owned sampling replacement Notice activation refused; no retry");
   n.EnumTopWindows();long after=GetForegroundWindow().ToInt64();if(after!=notice)throw new InvalidOperationException("Exact owned sampling replacement Notice foreground required; no retry");
   return new {notice_hwnd=notice,manager_hwnd=manager,main_hwnd=main,body="是否要删除现有的资料取样 ?",foreground_before=before,foreground_after=after,activation_requested=requested,foreground_verified=true,global_input=false};
  }
  public static object ActivateImportFile(NativeControls n,long dialog,long manager,long main,string candidatePath){
   RequireDialogState(n,manager,"资料取样",main,false);RequireDialog(n,dialog,"打开",manager);
   var edit=n.FindUniqueControlWithoutLabel(dialog,1148,"Edit");n.FindUniqueControlWithoutLabel(dialog,1136,"ComboBox");n.FindUniqueControl(dialog,1,"Button","打开(&O)");n.FindUniqueControl(dialog,2,"Button","取消");
   if(String.IsNullOrEmpty(candidatePath)||candidatePath.Length>4096||n.GetControlText(edit.Hwnd,4096)!=candidatePath)throw new InvalidOperationException("Actual owned Sampling import filename differs");
   long before=GetForegroundWindow().ToInt64();bool requested=before!=dialog;if(requested&&!SetForegroundWindow(new IntPtr(dialog)))throw new InvalidOperationException("Owned sampling file dialog activation refused; no retry");
   n.EnumTopWindows();long after=GetForegroundWindow().ToInt64();if(after!=dialog)throw new InvalidOperationException("Exact owned sampling file dialog foreground required; no retry");
   return new {file_dialog_hwnd=dialog,manager_hwnd=manager,main_hwnd=main,filename_edit_hwnd=edit.Hwnd,filename_control_id=1148,filename=candidatePath,foreground_before=before,foreground_after=after,activation_requested=requested,foreground_verified=true,global_input=false};
  }
  public static object ActivateExportSave(NativeControls n,long dialog,long manager,long main,long filenameEdit,long formatCombo,string path){
   RequireDialogState(n,manager,"资料取样",main,false);RequireDialog(n,dialog,"另存为",manager);
   var edit=n.FindUniqueControlWithoutLabel(dialog,1001,"Edit");n.FindUniqueControl(dialog,1,"Button","保存(&S)");n.FindUniqueControl(dialog,2,"Button","取消");
   bool formatPresent=false;foreach(var w in n.EnumChildControls(dialog))if(w.Hwnd==formatCombo&&w.Class=="ComboBox"&&w.Visible&&w.Enabled)formatPresent=true;
   if(edit.Hwnd!=filenameEdit||!formatPresent||String.IsNullOrEmpty(path)||path.Length>4096||n.GetControlText(edit.Hwnd,4096)!=path)throw new InvalidOperationException("Exact original Sampling Save filename/format controls required");
   long before=GetForegroundWindow().ToInt64();bool requested=before!=dialog;if(requested&&!SetForegroundWindow(new IntPtr(dialog)))throw new InvalidOperationException("Owned sampling Save dialog activation refused; no retry");
   n.EnumTopWindows();long after=GetForegroundWindow().ToInt64();if(after!=dialog)throw new InvalidOperationException("Exact owned sampling Save dialog foreground required; no retry");
   return new {save_dialog_hwnd=dialog,manager_hwnd=manager,main_hwnd=main,filename_edit_hwnd=edit.Hwnd,filename_control_id=1001,format_combo_hwnd=formatCombo,filename=path,foreground_before=before,foreground_after=after,activation_requested=requested,foreground_verified=true,global_input=false};
  }
  public static object ClickSampling(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y){
   if(proof==null||Double.IsNaN(x)||Double.IsNaN(y)||Double.IsInfinity(x)||Double.IsInfinity(y)||x<0||y<0||x>=proof.Width||y>=proof.Height*.75)throw new InvalidOperationException("Fresh sampling action band point required; footer rejected");
   uint dpi=GetDpiForWindow(new IntPtr(proof.Main));if(dpi!=96&&dpi!=120)throw new InvalidOperationException("Finite original 96/120 window DPI required; actual "+dpi);
   if((DateTime.UtcNow-proof.CapturedUtc).TotalSeconds<0||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||Sha(proof.Path)!=proof.Hash)throw new InvalidOperationException("CN421 fresh unchanged sampling ribbon image required");
   if(Array.Exists(n.EnumTopWindows(),w=>w.Visible&&w.Class=="#32770"))throw new InvalidOperationException("Unexpected modal before sampling entry");
   var live=ObjectRibbonControls.LocateOwnedRibbon(n,proof.Main);
   if(live.Hwnd!=proof.Hwnd||live.Left!=proof.Left||live.Top!=proof.Top||live.Width!=proof.Width||live.Height!=proof.Height)throw new InvalidOperationException("Sampling ribbon identity/geometry changed");
   var point=new Point{x=proof.Left+(int)x,y=proof.Top+(int)y};if(!ScreenToClient(new IntPtr(proof.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767)throw new InvalidOperationException("Sampling owned client point invalid");
   long lp=(point.y<<16)|point.x;
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x200,UIntPtr.Zero,new IntPtr(lp)))throw new InvalidOperationException("Owned sampling pointer message failed; no retry");
   System.Threading.Thread.Sleep(80);live=ObjectRibbonControls.LocateOwnedRibbon(n,proof.Main);
   if(live.Hwnd!=proof.Hwnd||live.Left!=proof.Left||live.Top!=proof.Top||live.Width!=proof.Width||live.Height!=proof.Height||GetDpiForWindow(new IntPtr(proof.Main))!=dpi||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20)throw new InvalidOperationException("Sampling proof/geometry changed before single click");
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x201,new UIntPtr(1),new IntPtr(lp))||!PostMessageW(new IntPtr(proof.Hwnd),0x202,UIntPtr.Zero,new IntPtr(lp)))throw new InvalidOperationException("Single owned sampling click failed; no retry");
   n.EnumTopWindows();return new {main_hwnd=proof.Main,ribbon_hwnd=proof.Hwnd,image_path=proof.Path,image_sha256=proof.Hash,geometry=new[]{proof.Left,proof.Top,proof.Width,proof.Height},dpi=dpi,client_point=new[]{point.x,point.y},lparam=lp,messages=new uint[]{0x200,0x201,0x202},click_posted=true,global_input=false,layout_reset=false,observed_utc=DateTime.UtcNow.ToString("o")};
  }
 }
}
