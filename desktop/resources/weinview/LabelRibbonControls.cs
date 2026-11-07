using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace PLCCode.Weinview {
 public static class LabelRibbonControls {
  [StructLayout(LayoutKind.Sequential)] struct R { public int l,t,r,b; }
  [StructLayout(LayoutKind.Sequential)] struct P { public int x,y; }
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out R r);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr h,ref P p);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool IsChild(IntPtr a,IntPtr b);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  // The older 32px icon template came from a foreground capture. The same
  // CN421 icon has different antialiasing in the owned PrintWindow image.
  public static double[] FindOwnedLabelIcon(NativeSemanticControls.RibbonProof proof,string iconPath) {
   if(proof==null||!proof.OwnedBackgroundRender||!proof.Accepted||proof.Width<32||proof.Height<32)
    throw new InvalidOperationException("Reviewed owned CN421 Label ribbon required");
   using(var icon=new System.Drawing.Bitmap(iconPath))using(var image=new System.Drawing.Bitmap(proof.Path)){
    if(icon.Width!=32||icon.Height!=32||image.Width!=proof.Width||image.Height!=proof.Height)
     throw new InvalidOperationException("Label icon/ribbon dimensions changed");
    int[] template=new int[32*32],pixels=new int[checked(image.Width*image.Height)];
    double iconEnergy=0;for(int y=0;y<32;y++)for(int x=0;x<32;x++){
     var c=icon.GetPixel(x,y);int rgb=c.ToArgb();template[y*32+x]=rgb;
     iconEnergy+=(double)c.R*c.R+(double)c.G*c.G+(double)c.B*c.B;
    }
    for(int y=0;y<image.Height;y++)for(int x=0;x<image.Width;x++)pixels[y*image.Width+x]=image.GetPixel(x,y).ToArgb();
    double best=Double.PositiveInfinity;int bestX=-1,bestY=-1;int distinct=0;
    // Search the observed complete owned ribbon; accept one close icon shape only.
    for(int top=0;top<=image.Height-32;top++)for(int left=0;left<=image.Width-32;left++){
     int green=pixels[(top+20)*image.Width+left+10];
     int gr=(green>>16)&255,gg=(green>>8)&255,gb=green&255;
     if(gg-gr<25||gg-gb<10)continue;
     double difference=0,screenEnergy=0;
     for(int y=0;y<32;y++)for(int x=0;x<32;x++){
      int a=template[y*32+x],b=pixels[(top+y)*image.Width+left+x];
      int br=(b>>16)&255,bg=(b>>8)&255,bb=b&255;
      int dr=((a>>16)&255)-br,dg=((a>>8)&255)-bg,db=(a&255)-bb;
      difference+=(double)dr*dr+(double)dg*dg+(double)db*db;
      screenEnergy+=(double)br*br+(double)bg*bg+(double)bb*bb;
     }
     double score=difference/Math.Sqrt(iconEnergy*screenEnergy);
     if(score>=0.045)continue;
     if(score<best){if(bestX>=0&&(Math.Abs(bestX-left)>16||Math.Abs(bestY-top)>16))distinct++;best=score;bestX=left;bestY=top;}
     else if(bestX>=0&&(Math.Abs(bestX-left)>16||Math.Abs(bestY-top)>16))distinct++;
    }
    if(bestX<0||distinct!=0)throw new InvalidOperationException("Unique owned Label icon shape unavailable");
    return new double[]{bestX+16,bestY+16};
   }
  }
  public static void ClickLabel(NativeControls n,NativeSemanticControls.RibbonProof proof,int x,int y) {
   if(proof!=null&&proof.OwnedBackgroundRender){ObjectRibbonControls.Click(n,proof,x,y,"文字标签库");return;}
   if(proof==null||x<0||y<0||x>=proof.Width||y>=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Fresh owned Label ribbon proof required");
   string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");
   if(hash!=proof.Hash)throw new InvalidOperationException("Label ribbon capture changed");
   R rect;if(!GetWindowRect(new IntPtr(proof.Hwnd),out rect)||rect.l!=proof.Left||rect.t!=proof.Top||rect.r-rect.l!=proof.Width||rect.b-rect.t!=proof.Height)throw new InvalidOperationException("Label ribbon geometry changed");
   long qt=0;int sx=proof.Left+x,sy=proof.Top+y;
   foreach(var c in n.EnumChildControls(proof.Main)){
    if(c.Class!="Qt5QWindowIcon"||!c.Visible||!c.Enabled||c.Title!="EasyBuilder Pro"||!IsChild(new IntPtr(proof.Main),new IntPtr(c.Hwnd)))continue;
    R b;if(GetWindowRect(new IntPtr(c.Hwnd),out b)&&b.l==rect.l&&b.t==rect.t&&b.r==rect.r&&b.b==rect.b){if(qt!=0)throw new InvalidOperationException("Label ribbon input ambiguous");qt=c.Hwnd;}
   }
   if(qt==0)throw new InvalidOperationException("Label ribbon input unavailable");
   P p=new P{x=sx,y=sy};if(!ScreenToClient(new IntPtr(qt),ref p)||p.x<0||p.y<0||p.x>32767||p.y>32767)throw new InvalidOperationException("Label ribbon point invalid");
   IntPtr lp=new IntPtr((p.y<<16)|p.x);
   if(!PostMessageW(new IntPtr(qt),0x200,UIntPtr.Zero,lp))throw new InvalidOperationException("Label ribbon move failed");
   System.Threading.Thread.Sleep(80);n.EnumChildControls(proof.Main);
   if(GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Label ribbon foreground changed");
   if(!PostMessageW(new IntPtr(qt),0x201,new UIntPtr(1),lp)||!PostMessageW(new IntPtr(qt),0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Label ribbon click failed");
  }
 }
}
