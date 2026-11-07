using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace PLC Engineering Suite.Weinview {
 public static class RecipeDatabaseControls {
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessageW(IntPtr h,uint message,UIntPtr w,IntPtr l);
  static string Sha(string path) { using(var stream=File.OpenRead(path))using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-",""); }
  // CN421's current Data/History ribbon exposes no recipe caption through MSAA
  // and OCR reads its icon as graphics. The observed finite icon location is
  // used only with a fresh owned screenshot and the native dialog readback.
  public static void Open(NativeControls native,NativeSemanticControls.RibbonProof proof) {
   bool observedLayout=proof!=null&&((proof.Width==2780&&proof.Height==131)||(proof.Width==2560&&proof.Height==151));
   if(native==null||proof==null||proof.Hwnd==0||proof.Main==0||!observedLayout||
      string.IsNullOrEmpty(proof.Path)||!File.Exists(proof.Path)||!String.Equals(Sha(proof.Path),proof.Hash,StringComparison.OrdinalIgnoreCase)||
      (DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||(!proof.OwnedBackgroundRender&&GetForegroundWindow().ToInt64()!=proof.Main))
      throw new InvalidOperationException("Fresh owned CN421 Recipe Database ribbon proof required");
   if(proof.OwnedBackgroundRender&&(!proof.Accepted||!proof.PrintWindowSucceeded||proof.CaptureMethod!="owned-printwindow-main-ribbon-physical"))
      throw new InvalidOperationException("Accepted owned Recipe Database render required");
   var current=proof.OwnedBackgroundRender?
      ObjectRibbonControls.LocateOwnedBackgroundRibbon(native,proof.Main,proof.ProjectPath,proof.ProjectSha256):
      ObjectRibbonControls.LocateOwnedRibbon(native,proof.Main);
   if(current.Hwnd!=proof.Hwnd||current.Left!=proof.Left||current.Top!=proof.Top||current.Width!=proof.Width||current.Height!=proof.Height)
      throw new InvalidOperationException("Owned Recipe Database ribbon changed");
   // Both points are inside the Recipe Database icon in their respective
   // observed CN421 physical-pixel ribbon captures.
   int x=proof.Width==2560?550:462,y=proof.Height==151?60:50;
   var packed=new IntPtr((y<<16)|x);var hwnd=new IntPtr(proof.Hwnd);
   if(!PostMessageW(hwnd,0x201,new UIntPtr(1),packed)||!PostMessageW(hwnd,0x202,UIntPtr.Zero,packed))
      throw new InvalidOperationException("Native Recipe Database ribbon input failed");
  }
 }
}
