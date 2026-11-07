// CN421 owned ribbon entry only; semantic provider first, fresh OCR click fallback.
using System.Collections.Generic;using Accessibility;
using System;using System.IO;using System.Runtime.InteropServices;using System.Security.Cryptography;
namespace PLCCode.Weinview {
 public static class WindowRibbonControls {
 [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}[StructLayout(LayoutKind.Sequential)]struct P{public int x,y;}
 [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);[DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref P p);[DllImport("user32.dll")]static extern bool IsChild(IntPtr a,IntPtr b);[DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();[DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
 public static void Click(NativeControls n,NativeSemanticControls.RibbonProof proof,double x,double y,string label){
 if(proof==null||(label!="检视"&&label!="常用"&&label!="窗口列表"&&label!="窗口复制")||x<0||y<0||x>=proof.Width||y>=proof.Height||(DateTime.UtcNow-proof.CapturedUtc).TotalSeconds>20||GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Fresh owned exact window ribbon proof/foreground required");
 string hash;using(var sha=SHA256.Create())using(var f=File.OpenRead(proof.Path))hash=BitConverter.ToString(sha.ComputeHash(f)).Replace("-","");if(hash!=proof.Hash)throw new InvalidOperationException("Ribbon proof changed");R r;if(!GetWindowRect(new IntPtr(proof.Hwnd),out r)||r.l!=proof.Left||r.t!=proof.Top||r.r-r.l!=proof.Width||r.b-r.t!=proof.Height)throw new InvalidOperationException("Ribbon geometry changed");
 int sx=proof.Left+(int)x,sy=proof.Top+(int)y;long qt=0;foreach(var c in n.EnumChildControls(proof.Main)){if(c.Class!="Qt5QWindowIcon"||!c.Visible||!c.Enabled||c.Title!="EasyBuilder Pro"||!IsChild(new IntPtr(proof.Main),new IntPtr(c.Hwnd)))continue;R b;if(GetWindowRect(new IntPtr(c.Hwnd),out b)&&b.l==proof.Left&&b.t==proof.Top&&b.r-b.l==proof.Width&&b.b-b.t==proof.Height&&sx>=b.l&&sx<b.r&&sy>=b.t&&sy<b.b){if(qt!=0)throw new InvalidOperationException("Window ribbon input Qt ambiguous");qt=c.Hwnd;}}
 if(qt==0)throw new InvalidOperationException("Window ribbon input Qt unavailable");P p=new P{x=sx,y=sy};if(!ScreenToClient(new IntPtr(qt),ref p)||p.x<0||p.y<0||p.x>32767||p.y>32767)throw new InvalidOperationException("Window ribbon client point invalid");IntPtr lp=new IntPtr((p.y<<16)|p.x);
 if(!PostMessageW(new IntPtr(qt),0x200,UIntPtr.Zero,lp))throw new InvalidOperationException("Window ribbon pointer event failed");
 System.Threading.Thread.Sleep(80);n.EnumChildControls(proof.Main);if(GetForegroundWindow().ToInt64()!=proof.Main)throw new InvalidOperationException("Window ribbon foreground changed before click");
 if(!PostMessageW(new IntPtr(qt),0x201,new UIntPtr(1),lp)||!PostMessageW(new IntPtr(qt),0x202,UIntPtr.Zero,lp))throw new InvalidOperationException("Window ribbon single click failed");
 }
 }
}

namespace PLCCode.Weinview {
public static class WindowRibbonSemantic {
 public sealed class Item {public string name,action;public int role,state;public long provider_hwnd;public bool provider_window_present;}
 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
 [DllImport("oleacc.dll")]static extern int WindowFromAccessibleObject(IAccessible a,out IntPtr h);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindowEnabled(IntPtr h);
 [DllImport("user32.dll")]static extern bool IsWindow(IntPtr h);
 class Node {public IAccessible a;public int child;}
 static void Owner(long hwnd,int pid){uint owner;if(!IsWindow(new IntPtr(hwnd))||GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid||!IsWindowVisible(new IntPtr(hwnd))||!IsWindowEnabled(new IntPtr(hwnd)))throw new Exception("Live own Qt menu required");}
 static void Scan(Node n,long hwnd,int pid,List<Item> found,List<Node> targets,int depth,ref int budget,HashSet<long> seen){
  if(++budget>128||depth>8)throw new Exception("Menu traversal bound");
  if(n.child==0){IntPtr unk=Marshal.GetIUnknownForObject(n.a);long key=unk.ToInt64();Marshal.Release(unk);if(!seen.Add(key))return;}
  IntPtr provider;int hr=WindowFromAccessibleObject(n.a,out provider);if(hr<0)Marshal.ThrowExceptionForHR(hr);
  uint owner=0;bool present=IsWindow(provider);if(present){GetWindowThreadProcessId(provider,out owner);if(owner!=(uint)pid)throw new Exception("Foreign live menu provider rejected");}
  int role=0;try{role=Convert.ToInt32(n.a.get_accRole(n.child));}catch(InvalidCastException){if(n.child!=0)throw;}
  if(role==12||role==37||role==43){found.Add(new Item{name=n.a.get_accName(n.child),action=n.a.get_accDefaultAction(n.child),role=role,state=Convert.ToInt32(n.a.get_accState(n.child)),provider_hwnd=provider.ToInt64(),provider_window_present=present});targets.Add(n);return;}
  if(n.child!=0)return;int count=n.a.accChildCount;if(count<0||count>64)throw new Exception("Menu branch bound");
  object[] children=new object[count];int got;hr=AccessibleChildren(n.a,0,count,children,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=count)throw new Exception("Menu child collection changed");
  foreach(object child in children){Node next;if(child is int)next=new Node{a=n.a,child=(int)child};else if(child is IAccessible)next=new Node{a=(IAccessible)child};else throw new Exception("Menu child representation changed");Scan(next,hwnd,pid,found,targets,depth+1,ref budget,seen);}
 }
 public static Item[] ReadOrInvoke(long hwnd,int pid,string exactName){
  Owner(hwnd,pid);var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out a);if(hr<0||a==null){if(exactName!=null)throw new Exception("Ribbon provider absent during invocation");return new Item[0];}
  var found=new List<Item>();var targets=new List<Node>();int budget=0;Scan(new Node{a=a},hwnd,pid,found,targets,0,ref budget,new HashSet<long>());Owner(hwnd,pid);
  if(exactName!=null){if(exactName!="检视"&&exactName!="常用"&&exactName!="窗口列表"&&exactName!="窗口复制")throw new Exception("Unreviewed ribbon label");int index=-1;for(int i=0;i<found.Count;i++)if(found[i].name==exactName){if(index!=-1)throw new Exception("Ambiguous exact menu label");index=i;}if(index<0||(found[index].state&1)!=0||String.IsNullOrEmpty(found[index].action))throw new Exception("Enabled exact menu action absent");Owner(hwnd,pid);targets[index].a.accDoDefaultAction(targets[index].child);}
  return found.ToArray();
 }
}

}
