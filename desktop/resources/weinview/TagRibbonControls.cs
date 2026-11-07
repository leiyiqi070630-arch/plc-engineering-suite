using System;using System.IO;using System.Runtime.InteropServices;using System.Security.Cryptography;
namespace PLCCode.Weinview {
 public static class TagRibbonControls {
 [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}[StructLayout(LayoutKind.Sequential)]struct P{public int x,y;}
 [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);[DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref P p);[DllImport("user32.dll")]static extern bool IsChild(IntPtr a,IntPtr b);[DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();[DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
 public static double[] FindIcon(NativeSemanticControls.RibbonProof proof,string iconPath){
 using(var icon=new System.Drawing.Bitmap(iconPath))using(var image=new System.Drawing.Bitmap(proof.Path)){
  if(icon.Width!=32||icon.Height!=32)throw new InvalidOperationException("Native address icon profile changed");
  var counts=new System.Collections.Generic.Dictionary<int,int>();for(int y=0;y<32;y++)for(int x=0;x<32;x++){int c=icon.GetPixel(x,y).ToArgb();counts[c]=counts.ContainsKey(c)?counts[c]+1:1;}
  int px=0,py=0,best=1025;for(int y=0;y<32;y++)for(int x=0;x<32;x++){int c=icon.GetPixel(x,y).ToArgb();if(counts[c]<best){px=x;py=y;best=counts[c];}}
  int probe=icon.GetPixel(px,py).ToArgb(),hits=0,hx=0,hy=0;
  for(int top=0;top<=image.Height-32;top++)for(int left=0;left<=image.Width-32;left++){
   if(image.GetPixel(left+px,top+py).ToArgb()!=probe)continue;bool same=true;
   for(int y=0;y<32&&same;y++)for(int x=0;x<32;x++)if(image.GetPixel(left+x,top+y).ToArgb()!=icon.GetPixel(x,y).ToArgb()){same=false;break;}
   if(same){hits++;hx=left+16;hy=top+16;}
  }
  if(hits!=1)throw new InvalidOperationException("Exactly one visible native address tag icon required; matches="+hits);return new double[]{hx,hy};
 }
 }
 public static void Click(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y,string label,string iconPath,bool requireIcon=true){
 if(proof!=null&&proof.OwnedBackgroundRender){
  if(label!="工程文件"&&label!="工过文亻牛"&&label!="工程文亻牛")throw new InvalidOperationException("Only exact Label project-file background action is supported");
  ObjectRibbonControls.Click(n,proof,x,y,label);return;
 }
 if(proof==null||(label!="工程文件"&&label!="工过文亻牛"&&label!="工程文亻牛"&&label!="地址"&&label!="t也址")||x<0||y<0||x>=proof.Width||y>=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Fresh exact numeric ribbon proof/foreground required");
 string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");if(hash!=proof.Hash)throw new InvalidOperationException("Ribbon proof changed");R r;if(!GetWindowRect(new IntPtr(proof.Hwnd),out r)||r.l!=proof.Left||r.t!=proof.Top||r.r-r.l!=proof.Width||r.b-r.t!=proof.Height)throw new InvalidOperationException("Ribbon geometry changed");
 if(requireIcon&&(label=="地址"||label=="t也址")){
 int left=(int)x-16,top=(int)y-16;
 if(left<0||top<0||left+32>proof.Width||top+32>proof.Height)throw new InvalidOperationException("Current tag icon region outside ribbon");
 using(var reference=new System.Drawing.Bitmap(iconPath))using(var image=new System.Drawing.Bitmap(proof.Path)){
  if(reference.Width!=32||reference.Height!=32)throw new InvalidOperationException("Native tag icon shape changed");
  for(int iy=0;iy<32;iy++)for(int ix=0;ix<32;ix++)if(reference.GetPixel(ix,iy).ToArgb()!=image.GetPixel(left+ix,top+iy).ToArgb())throw new InvalidOperationException("Tag ribbon icon/layout differs from verified native profile; no click or UI reset");
 }
 }
 int sx=proof.Left+(int)x,sy=proof.Top+(int)y;long qt=0;foreach(var c in n.EnumChildControls(proof.Main)){if(c.Class!="Qt5QWindowIcon"||!c.Visible||!c.Enabled||c.Title!="EasyBuilder Pro"||!IsChild(new IntPtr(proof.Main),new IntPtr(c.Hwnd)))continue;R b;if(GetWindowRect(new IntPtr(c.Hwnd),out b)&&b.l==proof.Left&&b.t==proof.Top&&b.r-b.l==proof.Width&&b.b-b.t==proof.Height&&sx>=b.l&&sx<b.r&&sy>=b.t&&sy<b.b){if(qt!=0)throw new InvalidOperationException("Numeric ribbon input Qt ambiguous");qt=c.Hwnd;}}
 if(qt==0)throw new InvalidOperationException("Tag ribbon input Qt unavailable");P p=new P{x=sx,y=sy};if(!ScreenToClient(new IntPtr(qt),ref p)||p.x<0||p.y<0||p.x>32767||p.y>32767)throw new InvalidOperationException("Tag ribbon client point invalid");IntPtr lp=new IntPtr((p.y<<16)|p.x);
 if(!PostMessageW(new IntPtr(qt),0x200,UIntPtr.Zero,lp))throw new InvalidOperationException("Tag ribbon pointer event failed");
 System.Threading.Thread.Sleep(80);n.EnumChildControls(proof.Main);if(GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Tag ribbon foreground changed before click");
 if(!PostMessageW(new IntPtr(qt),0x201,new UIntPtr(1),lp)||!PostMessageW(new IntPtr(qt),0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Tag ribbon single click failed");
 }
 }
}
