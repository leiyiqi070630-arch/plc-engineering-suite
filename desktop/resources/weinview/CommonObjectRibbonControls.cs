using System;using System.IO;using System.Drawing;using System.Drawing.Imaging;using System.Collections.Generic;using System.Runtime.InteropServices;using System.Security.Cryptography;using Accessibility;
namespace PLC Engineering Suite.Weinview {
 using System.Drawing.Drawing2D;
 public sealed class CommonTextRibbonEvidence {
  public string method,image_path,image_sha256,a_template_path,a_template_sha256,drawing_template_path,drawing_template_sha256;
  public int[] a_bounds,drawing_bounds,panel_bounds;public int a_candidate_count,drawing_candidate_count,dpi;public double a_rgb_error,drawing_rgb_error;
  public long main_hwnd,ribbon_hwnd,lparam;public uint[] messages;public bool click_posted,global_input,layout_reset,dialog_verified;
  public string semantic_name,semantic_action;public int semantic_role,semantic_state;public string observed_utc;
 }
  public sealed class CommonRectangleRibbonEvidence {public string method,image_path,image_sha256,rectangle_template_path,rectangle_template_sha256,drawing_template_path,drawing_template_sha256,observed_utc,semantic_name,semantic_action;public int[] rectangle_bounds,drawing_bounds,panel_bounds;public int rectangle_candidate_count,drawing_candidate_count,dpi,semantic_role,semantic_state;public double rectangle_rgb_error,drawing_rgb_error;public long main_hwnd,ribbon_hwnd,lparam;public uint[] messages;public bool click_posted,global_input,layout_reset;}
 // CN421 Text/Rectangle entry. Pinned glyphs are scaled to the actual owned-window DPI.
 public static class CommonObjectRibbonControls {
  const string ASha="0A2EF055263AD8E6248B7F3CCE73507AEF6F9020B3271B2A6B7030A3BFE98063",DSha="2D6830FE5DA6FD1D58EB916990A5B4B0C65B18BEC4BF1366C4E9C0633F8F35BF";
  const string RSha="F57FF0E01C751E0F68DB59CAD90AD5D6EF52546616F43E4A128AD68F9C86C78C";
  [StructLayout(LayoutKind.Sequential)]struct Point {public int x,y;}
  [DllImport("user32.dll")]static extern uint GetDpiForWindow(IntPtr hwnd);
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr hwnd,uint command);
  [DllImport("user32.dll",EntryPoint="GetWindowLongW")]static extern int GetWindowLongW(IntPtr hwnd,int index);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wp,IntPtr lp);
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible value);
  static string Sha(string path){using(var s=SHA256.Create())using(var f=File.OpenRead(path))return BitConverter.ToString(s.ComputeHash(f)).Replace("-","");}
  static Bitmap Load(string path){using(var raw=new Bitmap(path))return raw.Clone(new Rectangle(0,0,raw.Width,raw.Height),PixelFormat.Format32bppArgb);}
  static byte[] Pixels(Bitmap b){var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);try{if(d.Stride!=b.Width*4)throw new Exception("Packed bitmap required");var p=new byte[b.Width*b.Height*4];Marshal.Copy(d.Scan0,p,0,p.Length);return p;}finally{b.UnlockBits(d);}}
  static bool Dark(byte[] p,int i){int a=p[i],b=p[i+1],c=p[i+2];return Math.Max(a,Math.Max(b,c))<195&&Math.Max(a,Math.Max(b,c))-Math.Min(a,Math.Min(b,c))<15;}
  static bool Divider(byte[] p,int width,int x,int top,int bottom){int n=0;for(int y=top;y<bottom;y++){int i=(y*width+x)*4,c=p[i];if(c>=200&&c<=230&&p[i+1]==c&&p[i+2]==c)n++;}return n>=((bottom-top)*9+9)/10;}
  static bool Ink(byte[] p,int i,bool color){return Dark(p,i)||(color&&Math.Max(p[i],Math.Max(p[i+1],p[i+2]))-Math.Min(p[i],Math.Min(p[i+1],p[i+2]))>=20);}
  static int[] Match(byte[] current,int width,Bitmap template,int[] region,out double matchedError,bool color=false){
   int tw=template.Width,th=template.Height;var t=Pixels(template);int dark=-1;for(int i=0;i<tw*th;i++)if(Ink(t,i*4,color)){dark=i;break;}if(dark<0)throw new Exception("Known glyph template dark shape absent");
   int count=0,mx=0,my=0;matchedError=0;
   for(int y=region[1];y+th<=region[1]+region[3];y++)for(int x=region[0];x+tw<=region[0]+region[2];x++){
    if(!Ink(current,((y+dark/tw)*width+x+dark%tw)*4,color))continue;bool same=true;long error=0;
    for(int j=0;j<th&&same;j++)for(int i=0;i<tw;i++){int a=((y+j)*width+x+i)*4,z=(j*tw+i)*4;if(Ink(current,a,color)!=Ink(t,z,color)){same=false;break;}error+=Math.Abs(current[a]-t[z])+Math.Abs(current[a+1]-t[z+1])+Math.Abs(current[a+2]-t[z+2]);}
    double avg=error/(double)(tw*th*3);if(same&&avg<=1){count++;mx=x;my=y;matchedError=avg;}
   }
   if(count!=1)throw new Exception("Exactly one finite Text glyph match required; actual="+count);return new[]{mx,my,tw,th};
  }
  static int[] MatchScaledShape(byte[] current,int width,Bitmap template,int[] region,bool color,out double matchedError){
   var t=Pixels(template);int tw=template.Width,th=template.Height,count=0,mx=0,my=0,bestEqual=0,bestX=0,bestY=0;double bestMean=Double.MaxValue;matchedError=0;
   for(int y=region[1];y+th<=region[1]+region[3];y++)for(int x=region[0];x+tw<=region[0]+region[2];x++){
    int equal=0;long error=0;
    for(int j=0;j<th;j++)for(int i=0;i<tw;i++){int a=((y+j)*width+x+i)*4,z=(j*tw+i)*4;if(Ink(current,a,color)==Ink(t,z,color))equal++;error+=Math.Abs(current[a]-t[z])+Math.Abs(current[a+1]-t[z+1])+Math.Abs(current[a+2]-t[z+2]);}
    double mean=error/(double)(tw*th*3);if(equal>bestEqual||(equal==bestEqual&&mean<bestMean)){bestEqual=equal;bestMean=mean;bestX=x;bestY=y;}if(equal>=Math.Ceiling(tw*th*0.90)&&mean<(color?14:20)){count++;mx=x;my=y;matchedError=mean;}
   }
   if(count!=1)throw new Exception("Exactly one scaled "+(color?"Rectangle":"Text")+" shape match required; actual="+count+" best="+bestX+","+bestY+" shape="+bestEqual+"/"+(tw*th)+" error="+bestMean.ToString("F2"));return new[]{mx,my,tw,th};
  }
  public static int OwnedDpi(long main){int dpi=(int)GetDpiForWindow(new IntPtr(main));if(dpi<=0)throw new Exception("Actual owned window DPI unavailable");return dpi;}
  // Pure image inspection, used before input and available for offline source verification.
  public static CommonTextRibbonEvidence LocatePixels(string image,string aPath,string drawingPath){return LocatePixels(image,aPath,drawingPath,120);}
  public static CommonTextRibbonEvidence LocatePixels(string image,string aPath,string drawingPath,int dpi){
   if(Sha(aPath)!=ASha||Sha(drawingPath)!=DSha)throw new Exception("Pinned finite Text glyph assets required");
   using(var b=Load(image))using(var a=Load(aPath))using(var d=Load(drawingPath)){
    if(b.Width<500||b.Width>4096||b.Height<64||b.Height>400||a.Width!=18||a.Height!=20||d.Width!=33||d.Height!=17)throw new Exception("Verified CN421 glyph dimensions required");
    if(dpi<=0)throw new Exception("Actual owned window DPI required for Text shape");
    var p=Pixels(b);int top=b.Height/4,bottom=b.Height-7;double ae,de;
    if(dpi!=120){
     int panelRight=0;for(int x=1;x<b.Width;x++)if(Divider(p,b.Width,x,top,bottom)){panelRight=x;break;}
     double scale=dpi/120.0;int sw=(int)Math.Round(a.Width*scale),sh=(int)Math.Round(a.Height*scale);
     if(panelRight<Math.Round(80*scale)||panelRight>Math.Round(500*scale))throw new Exception("Unique actual Drawing panel boundary absent");
     if(sw<5||sh<5||sw>=panelRight-2||sh>=bottom-top)throw new Exception("Actual DPI Text shape dimensions invalid");
     using(var scaled=new Bitmap(sw,sh,PixelFormat.Format32bppArgb)){
      using(var g=Graphics.FromImage(scaled)){g.Clear(Color.White);g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.Half;g.CompositingMode=CompositingMode.SourceCopy;g.DrawImage(a,new Rectangle(0,0,sw,sh),new Rectangle(0,0,a.Width,a.Height),GraphicsUnit.Pixel);}
      var shape=MatchScaledShape(p,b.Width,scaled,new[]{1,top,panelRight-2,bottom-top},false,out ae);
      return new CommonTextRibbonEvidence {method="scaled_owned_unique_text_shape_drawing_panel",image_path=Path.GetFullPath(image),image_sha256=Sha(image),a_template_path=Path.GetFullPath(aPath),a_template_sha256=ASha,a_bounds=shape,panel_bounds=new[]{0,top,panelRight,bottom-top},a_candidate_count=1,drawing_candidate_count=0,a_rgb_error=ae,drawing_rgb_error=-1,global_input=false,layout_reset=false,dialog_verified=false,observed_utc=DateTime.UtcNow.ToString("o")};
     }
    }
    var ab=Match(p,b.Width,a,new[]{0,top,b.Width,b.Height-top},out ae);int center=ab[0]+ab[2]/2,left=0,right=b.Width-1;
    for(int x=center-1;x>=0;x--)if(Divider(p,b.Width,x,top,bottom)){left=x;break;}
    for(int x=center+1;x<b.Width;x++)if(Divider(p,b.Width,x,top,bottom)){right=x;break;}
    if(right-left<80||right-left>500||right==b.Width-1||ab[0]<=left||ab[0]+ab[2]>=right)throw new Exception("Expanded actual Drawing panel absent/ambiguous");
    int footer=top+(bottom-top)*2/3;var db=Match(p,b.Width,d,new[]{left+1,footer,right-left-2,bottom-footer},out de);
    return new CommonTextRibbonEvidence {method="fresh_owned_unique_text_and_drawing_glyphs",image_path=Path.GetFullPath(image),image_sha256=Sha(image),a_template_path=Path.GetFullPath(aPath),a_template_sha256=ASha,drawing_template_path=Path.GetFullPath(drawingPath),drawing_template_sha256=DSha,a_bounds=ab,drawing_bounds=db,panel_bounds=new[]{left,top,right-left,bottom-top},a_candidate_count=1,drawing_candidate_count=1,a_rgb_error=ae,drawing_rgb_error=de,global_input=false,layout_reset=false,dialog_verified=false,observed_utc=DateTime.UtcNow.ToString("o")};
   }
  }
  static void Guard(NativeControls n,NativeSemanticControls.RibbonProof p){
   if(n==null||p==null)throw new Exception("Original native ribbon ownership required");var current=ObjectRibbonControls.LocateOwnedRibbon(n,p.Main);
   if(current.Hwnd!=p.Hwnd||current.Left!=p.Left||current.Top!=p.Top||current.Width!=p.Width||current.Height!=p.Height||Sha(p.Path)!=p.Hash||(DateTime.UtcNow-p.CapturedUtc).TotalSeconds<0||(DateTime.UtcNow-p.CapturedUtc).TotalSeconds>20)throw new Exception("Fresh unchanged ribbon ownership/geometry/image required");
   if(Array.Exists(n.EnumTopWindows(),w=>w.Visible&&w.Class=="#32770"))throw new Exception("Unexpected modal before Text ribbon entry");
  }
  public static CommonTextRibbonEvidence ClickOwned(NativeControls n,NativeSemanticControls.RibbonProof capture,string aPath,string drawingPath){
   Guard(n,capture);int dpi=OwnedDpi(capture.Main);var result=LocatePixels(capture.Path,aPath,drawingPath,dpi);Guard(n,capture);
   result.main_hwnd=capture.Main;result.ribbon_hwnd=capture.Hwnd;result.dpi=dpi;
   var point=new Point{x=capture.Left+result.a_bounds[0]+result.a_bounds[2]/2,y=capture.Top+result.a_bounds[1]+result.a_bounds[3]/2};
   if(!ScreenToClient(new IntPtr(capture.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767)throw new Exception("Actual owned glyph center conversion failed");
   long lp=(point.y<<16)|point.x;result.lparam=lp;result.messages=new uint[]{0x201,0x202};
   if(!PostMessageW(new IntPtr(capture.Hwnd),0x201,new UIntPtr(1),new IntPtr(lp))||!PostMessageW(new IntPtr(capture.Hwnd),0x202,UIntPtr.Zero,new IntPtr(lp)))throw new Exception("Single owned Text glyph click failed; no retry");
   result.click_posted=true;n.EnumTopWindows();return result;
  }
  public static CommonRectangleRibbonEvidence LocateRectanglePixels(string image,string rectanglePath,string drawingPath){return LocateRectanglePixels(image,rectanglePath,drawingPath,120);}
  public static CommonRectangleRibbonEvidence LocateRectanglePixels(string image,string rectanglePath,string drawingPath,int dpi){
   if(Sha(rectanglePath)!=RSha||Sha(drawingPath)!=DSha)throw new Exception("Pinned finite Rectangle glyph assets required");
   using(var b=Load(image))using(var r=Load(rectanglePath))using(var d=Load(drawingPath)){
    if(b.Width<500||b.Width>4096||b.Height<64||b.Height>400||r.Width!=22||r.Height!=22||d.Width!=33||d.Height!=17)throw new Exception("Verified CN421 rectangle glyph dimensions required");
    if(dpi<=0)throw new Exception("Actual owned window DPI required for Rectangle shape");
    var p=Pixels(b);int top=b.Height/4,bottom=b.Height-7;double re,de;
    if(dpi!=120){
     int panelRight=0;for(int x=1;x<b.Width;x++)if(Divider(p,b.Width,x,top,bottom)){panelRight=x;break;}
     double scale=dpi/120.0;int sw=(int)Math.Round(r.Width*scale),sh=(int)Math.Round(r.Height*scale);
     if(panelRight<Math.Round(80*scale)||panelRight>Math.Round(500*scale))throw new Exception("Unique actual Drawing panel boundary absent");
     if(sw<5||sh<5||sw>=panelRight-2||sh>=bottom-top)throw new Exception("Actual DPI Rectangle shape dimensions invalid");
     using(var scaled=new Bitmap(sw,sh,PixelFormat.Format32bppArgb)){
      using(var g=Graphics.FromImage(scaled)){g.Clear(Color.White);g.InterpolationMode=InterpolationMode.NearestNeighbor;g.PixelOffsetMode=PixelOffsetMode.Half;g.CompositingMode=CompositingMode.SourceCopy;g.DrawImage(r,new Rectangle(0,0,sw,sh),new Rectangle(0,0,r.Width,r.Height),GraphicsUnit.Pixel);}
      var shape=MatchScaledShape(p,b.Width,scaled,new[]{1,top,panelRight-2,bottom-top},true,out re);
      return new CommonRectangleRibbonEvidence {method="scaled_owned_unique_rectangle_shape_drawing_panel",image_path=Path.GetFullPath(image),image_sha256=Sha(image),rectangle_template_path=Path.GetFullPath(rectanglePath),rectangle_template_sha256=RSha,rectangle_bounds=shape,panel_bounds=new[]{0,top,panelRight,bottom-top},rectangle_candidate_count=1,drawing_candidate_count=0,rectangle_rgb_error=re,global_input=false,layout_reset=false,observed_utc=DateTime.UtcNow.ToString("o")};
     }
    }
    var rb=Match(p,b.Width,r,new[]{0,top,b.Width,b.Height-top},out re,true);int center=rb[0]+rb[2]/2,left=0,right=b.Width-1;
    for(int x=center-1;x>=0;x--)if(Divider(p,b.Width,x,top,bottom)){left=x;break;}for(int x=center+1;x<b.Width;x++)if(Divider(p,b.Width,x,top,bottom)){right=x;break;}
    if(right-left<80||right-left>500||right==b.Width-1||rb[0]<=left||rb[0]+rb[2]>=right)throw new Exception("Expanded actual Rectangle Drawing panel absent/ambiguous");int footer=top+(bottom-top)*2/3;var db=Match(p,b.Width,d,new[]{left+1,footer,right-left-2,bottom-footer},out de);
    return new CommonRectangleRibbonEvidence {method="fresh_owned_unique_rectangle_and_drawing_glyphs",image_path=Path.GetFullPath(image),image_sha256=Sha(image),rectangle_template_path=Path.GetFullPath(rectanglePath),rectangle_template_sha256=RSha,drawing_template_path=Path.GetFullPath(drawingPath),drawing_template_sha256=DSha,rectangle_bounds=rb,drawing_bounds=db,panel_bounds=new[]{left,top,right-left,bottom-top},rectangle_candidate_count=1,drawing_candidate_count=1,rectangle_rgb_error=re,drawing_rgb_error=de,observed_utc=DateTime.UtcNow.ToString("o")};
   }
  }
  public static CommonRectangleRibbonEvidence ClickRectangleOwned(NativeControls n,NativeSemanticControls.RibbonProof capture,string rectanglePath,string drawingPath){
   Guard(n,capture);int dpi=OwnedDpi(capture.Main);var result=LocateRectanglePixels(capture.Path,rectanglePath,drawingPath,dpi);Guard(n,capture);result.main_hwnd=capture.Main;result.ribbon_hwnd=capture.Hwnd;result.dpi=dpi;
   var point=new Point{x=capture.Left+result.rectangle_bounds[0]+result.rectangle_bounds[2]/2,y=capture.Top+result.rectangle_bounds[1]+result.rectangle_bounds[3]/2};if(!ScreenToClient(new IntPtr(capture.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767)throw new Exception("Owned rectangle glyph center conversion failed");long lp=(point.y<<16)|point.x;result.lparam=lp;result.messages=new uint[]{0x201,0x202};
   if(!PostMessageW(new IntPtr(capture.Hwnd),0x201,new UIntPtr(1),new IntPtr(lp))||!PostMessageW(new IntPtr(capture.Hwnd),0x202,UIntPtr.Zero,new IntPtr(lp)))throw new Exception("Single owned Rectangle entry click failed; no retry");result.click_posted=true;n.EnumTopWindows();return result;
  }
  public static object InspectRectanglePalette(NativeControls n,PLC Engineering Suite.Weinview.Research.NativePropertyCandidate p,long main,long palette){
   int dialogs=0;bool exactMain=false,exactPalette=false;foreach(var w in n.EnumTopWindows()){if(w.Visible&&w.Class=="#32770"){dialogs++;if(w.Hwnd==palette&&w.Title=="属性"&&w.Enabled)exactPalette=true;}if(w.Hwnd==main&&w.Class=="EasyBuilderPro"&&w.Visible&&w.Enabled)exactMain=true;}
   if(dialogs!=1||!exactMain||!exactPalette||GetWindow(new IntPtr(palette),4).ToInt64()!=main)throw new Exception("Exact originally owned modeless palette/main required");
   foreach(var c in n.EnumChildControls(palette))if(c.Visible&&(c.Class=="SysTabControl32"||(c.Class=="Button"&&(c.Id==1||c.Id==2))))throw new Exception("Drawing palette must have no tabs/OK/Cancel");
   var fill=n.FindUniqueControl(palette,1217,"Button","填色");var corner=n.FindUniqueControlWithoutLabel(palette,2067,"ComboBox");int style=GetWindowLongW(new IntPtr(fill.Hwnd),-16)&15,state=n.GetCheckboxState(fill.Hwnd);string selected=p.ComboSelected(corner.Hwnd);
   if(style!=3||(state!=0&&state!=1)||String.IsNullOrEmpty(selected))throw new Exception("Native Rectangle palette shape controls unavailable");return new {palette_hwnd=palette,owner_hwnd=main,main_enabled=true,fill_control=fill,fill_style=style,fill_state=state,corner_control=corner,corner=selected,mode_defaults_verified=true};
  }
  sealed class Node {public IAccessible acc;public int child,role,state;public string action;}
  static void FindNamedEntry(IAccessible acc,int child,string exactName,int depth,ref int budget,List<Node> matches,HashSet<long> seen){
   if(++budget>128||depth>8)throw new Exception("Common object semantic traversal bound exceeded");
   if(child==0){IntPtr unk=Marshal.GetIUnknownForObject(acc);long identity=unk.ToInt64();Marshal.Release(unk);if(!seen.Add(identity))return;}
   string name=acc.get_accName(child);int role=Convert.ToInt32(acc.get_accRole(child));
   if(name==exactName&&(role==12||role==37||role==43))matches.Add(new Node {acc=acc,child=child,role=role,state=Convert.ToInt32(acc.get_accState(child)),action=acc.get_accDefaultAction(child)});
   if(child!=0)return;int count=acc.accChildCount;if(count<0||count>64)throw new Exception("Common object semantic branch bound exceeded");
   for(int i=1;i<=count;i++){object next=acc.get_accChild(i);var nested=next as IAccessible;if(nested!=null)FindNamedEntry(nested,0,exactName,depth+1,ref budget,matches,seen);else FindNamedEntry(acc,i,exactName,depth+1,ref budget,matches,seen);}
  }
  public static CommonTextRibbonEvidence TryInvokeSemanticOwned(NativeControls n,NativeSemanticControls.RibbonProof capture){
   Guard(n,capture);IAccessible root;var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int hr=AccessibleObjectFromWindow(new IntPtr(capture.Hwnd),0xfffffffc,ref iid,out root);if(hr<0||root==null)return null;
   try{int budget=0;var matches=new List<Node>();FindNamedEntry(root,0,"文字/批注",0,ref budget,matches,new HashSet<long>());if(matches.Count==0)return null;if(matches.Count!=1)throw new Exception("Exact semantic Text entry ambiguous");var item=matches[0];if((item.state&0x18001)!=0||String.IsNullOrEmpty(item.action))throw new Exception("Exact semantic Text entry disabled/not actionable");Guard(n,capture);item.acc.accDoDefaultAction(item.child);n.EnumTopWindows();return new CommonTextRibbonEvidence {method="owned_exact_text_semantic",image_path=capture.Path,image_sha256=capture.Hash,main_hwnd=capture.Main,ribbon_hwnd=capture.Hwnd,dpi=(int)GetDpiForWindow(new IntPtr(capture.Main)),semantic_name="文字/批注",semantic_role=item.role,semantic_state=item.state,semantic_action=item.action,click_posted=true,global_input=false,layout_reset=false,dialog_verified=false,observed_utc=DateTime.UtcNow.ToString("o")};}
   finally{if(Marshal.IsComObject(root))Marshal.ReleaseComObject(root);}
  }
  public static CommonRectangleRibbonEvidence TryInvokeRectangleSemanticOwned(NativeControls n,long main){
   var proof=ObjectRibbonControls.LocateOwnedRibbon(n,main);
   if(Array.Exists(n.EnumTopWindows(),w=>w.Visible&&w.Class=="#32770"))throw new Exception("Unexpected modal before Rectangle ribbon entry");
   IAccessible root;var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int hr=AccessibleObjectFromWindow(new IntPtr(proof.Hwnd),0xfffffffc,ref iid,out root);if(hr<0||root==null)return null;
   try{
    int budget=0;var matches=new List<Node>();FindNamedEntry(root,0,"矩形",0,ref budget,matches,new HashSet<long>());
    if(matches.Count==0)return null;if(matches.Count!=1)throw new Exception("Exact semantic Rectangle entry ambiguous");
    var item=matches[0];if((item.state&0x18001)!=0||String.IsNullOrEmpty(item.action))throw new Exception("Exact semantic Rectangle entry disabled/not actionable");
    var current=ObjectRibbonControls.LocateOwnedRibbon(n,main);if(current.Hwnd!=proof.Hwnd)throw new Exception("Owned Rectangle ribbon changed before invocation");
    if(Array.Exists(n.EnumTopWindows(),w=>w.Visible&&w.Class=="#32770"))throw new Exception("Unexpected modal before Rectangle invocation");
    item.acc.accDoDefaultAction(item.child);n.EnumTopWindows();
    return new CommonRectangleRibbonEvidence{method="owned_exact_rectangle_semantic",main_hwnd=main,ribbon_hwnd=proof.Hwnd,semantic_name="矩形",semantic_role=item.role,semantic_state=item.state,semantic_action=item.action,click_posted=true,global_input=false,layout_reset=false,observed_utc=DateTime.UtcNow.ToString("o")};
   }finally{if(Marshal.IsComObject(root))Marshal.ReleaseComObject(root);}
  }
 }
}
