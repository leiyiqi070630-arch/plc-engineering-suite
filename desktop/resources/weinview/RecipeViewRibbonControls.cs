using System;
using System.Runtime.InteropServices;
namespace PLC Engineering Suite.Weinview {
 public static class RecipeViewRibbonControls {
  [StructLayout(LayoutKind.Sequential)] struct Point { public int x,y; }
  [DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wp,IntPtr lp);
  public static object ClickRecipeView(NativeControls native,NativeSemanticControls.RibbonProof proof,double x,double y,string observedLabel) {
   if(native==null||proof==null||observedLabel!="配方检视"||Double.IsNaN(x)||Double.IsNaN(y)||x<0||y<0||x>=proof.Width||y>=proof.Height) throw new InvalidOperationException("Fresh exact Recipe View caption point required");
   if(proof.OwnedBackgroundRender){
    var ownedDpi=GetDpiForWindow(new IntPtr(proof.Main));
    if(ownedDpi!=96&&ownedDpi!=120) throw new InvalidOperationException("Original Recipe View ribbon DPI unsupported");
    ObjectRibbonControls.Click(native,proof,x,y,observedLabel);
    return new {ribbon_hwnd=proof.Hwnd,observed_label=observedLabel,dpi=ownedDpi,owned_background_render=true,global_input=false};
   }
   var now=ObjectRibbonControls.LocateOwnedRibbon(native,proof.Main);
   if(now.Hwnd!=proof.Hwnd||now.Left!=proof.Left||now.Top!=proof.Top||now.Width!=proof.Width||now.Height!=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20) throw new InvalidOperationException("Owned Recipe View ribbon changed");
   var dpi=GetDpiForWindow(new IntPtr(proof.Main));
   if(dpi!=96&&dpi!=120) throw new InvalidOperationException("Original Recipe View ribbon DPI unsupported");
   var point=new Point{x=proof.Left+(int)x,y=proof.Top+(int)y};
   if(!ScreenToClient(new IntPtr(proof.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767) throw new InvalidOperationException("Recipe View ribbon point invalid");
   long lparam=(point.y<<16)|point.x;
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x200,UIntPtr.Zero,new IntPtr(lparam))) throw new InvalidOperationException("Recipe View pointer move failed");
   System.Threading.Thread.Sleep(80);
   now=ObjectRibbonControls.LocateOwnedRibbon(native,proof.Main);
   if(now.Hwnd!=proof.Hwnd||now.Left!=proof.Left||now.Top!=proof.Top||now.Width!=proof.Width||now.Height!=proof.Height||GetDpiForWindow(new IntPtr(proof.Main))!=dpi) throw new InvalidOperationException("Recipe View ribbon changed before click");
   if(!PostMessageW(new IntPtr(proof.Hwnd),0x201,new UIntPtr(1),new IntPtr(lparam))||!PostMessageW(new IntPtr(proof.Hwnd),0x202,UIntPtr.Zero,new IntPtr(lparam))) throw new InvalidOperationException("Recipe View owned click failed");
   return new {ribbon_hwnd=proof.Hwnd,observed_label=observedLabel,dpi=dpi,client_point=new[]{point.x,point.y},global_input=false};
  }
 }
}
