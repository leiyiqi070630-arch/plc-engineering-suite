using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;
using Accessibility;

namespace PLC Engineering Suite.Weinview {
 public sealed class ObjectSecurityClassControls {
  readonly NativeControls native;
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out Rect rect);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr h,ref Point point);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr h,uint message,UIntPtr wp,IntPtr lp);
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  static readonly string[] Labels={"无","类别 : A","类别 : B","类别 : C","类别 : D","类别 : E","类别 : F","类别 : G","类别 : H","类别 : I","类别 : J","类别 : K","类别 : L","类别 : Administrator"};
  public ObjectSecurityClassControls(NativeControls nativeControls){if(nativeControls==null)throw new ArgumentNullException("nativeControls");native=nativeControls;}
  static object Child(IAccessible a,int index){object[] c=new object[1];int got;int hr=AccessibleChildren(a,index,1,c,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new InvalidOperationException("Object security child changed");return c[0];}
  static int Role(IAccessible a,object id){return Convert.ToInt32(a.get_accRole(id));}
  static IAccessible Root(long hwnd){var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible a;int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out a);if(hr<0||a==null)throw new InvalidOperationException("Object security accessibility root absent");return a;}
  static IAccessible ObjectChild(IAccessible parent,int index){var value=Child(parent,index) as IAccessible;if(value==null)throw new InvalidOperationException("Object security node representation changed");return value;}
  static string NativeLabel(string value){if(value=="None")return Labels[0];if(value=="Administrator")return Labels[13];if(value!=null&&value.Length==1&&value[0]>='A'&&value[0]<='L')return "类别 : "+value;throw new ArgumentException("Object security class must be None, A through L, or Administrator");}
  static string PublicLabel(string value){if(value==Labels[0])return "None";if(value==Labels[13])return "Administrator";if(value!=null&&value.StartsWith("类别 : ",StringComparison.Ordinal)&&value.Length==6&&value[5]>='A'&&value[5]<='L')return value.Substring(5);throw new InvalidOperationException("Actual object security class is outside native list");}
  sealed class Anchor {public long qt;public IAccessible combo,list;public string value;public int pid;}
  Anchor Find(long dialog,bool allowPopup=false){
   WindowInfo d=null;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog)d=w;
   if(d==null||d.Class!="#32770"||!d.Visible||(!d.Enabled&&!allowPopup))throw new InvalidOperationException("Owned object property dialog required");
   var found=new List<Anchor>();foreach(var control in native.EnumChildControls(dialog)){
    if(!control.Visible||(!control.Enabled&&!allowPopup)||control.Class!="Qt5QWindowIcon")continue;
    uint owner;if(GetWindowThreadProcessId(new IntPtr(control.Hwnd),out owner)==0||owner!=(uint)d.Pid)continue;
    IAccessible page=Root(control.Hwnd);for(int depth=0;depth<3;depth++){if(Role(page,0)!=10||page.accChildCount!=1){page=null;break;}page=ObjectChild(page,0);}if(page==null)continue;
    for(int groupIndex=0;groupIndex<page.accChildCount;groupIndex++){
     var group=Child(page,groupIndex) as IAccessible;if(group==null||Role(group,0)!=20||group.get_accName(0)!="用户限制")continue;
     IAccessible combo=null;int labels=0;for(int i=0;i<group.accChildCount;i++){var item=Child(group,i) as IAccessible;if(item==null)continue;if(Role(item,0)==41&&item.get_accName(0)=="操作类别 :")labels++;if(Role(item,0)==46&&item.get_accName(0)=="用户限制 Down"){if(combo!=null)throw new InvalidOperationException("Object class combo duplicated");combo=item;}}
     if(labels!=1||combo==null||combo.accChildCount!=1)continue;
     var list=ObjectChild(combo,0);if(Role(list,0)!=33||list.accChildCount!=Labels.Length)continue;
     for(int i=0;i<Labels.Length;i++){object child=Child(list,i);IAccessible item=child as IAccessible;object id=item==null?child:0;if(item==null){if(!(child is int))throw new InvalidOperationException("Object class item representation changed");item=list;}if(Role(item,id)!=34||item.get_accName(id)!=Labels[i])throw new InvalidOperationException("Original object class labels/order changed");}
     string value=combo.get_accValue(0);PublicLabel(value);found.Add(new Anchor{qt=control.Hwnd,combo=combo,list=list,value=value,pid=d.Pid});
    }
   }
   if(found.Count!=1)throw new InvalidOperationException("Exact original object Security class control unavailable or ambiguous");return found[0];
  }
  public string ReadClass(long dialog){return PublicLabel(Find(dialog).value);}
  public object SetClass(long dialog,string expected,string requested){
   string oldLabel=NativeLabel(expected),target=NativeLabel(requested);var before=Find(dialog);if(before.value!=oldLabel)throw new InvalidOperationException("Original object class changed before input");
   if(target==oldLabel)return new {before=expected,after=requested,changed=false,native_readback=true,global_input=false};
   int x,y,w,h;before.combo.accLocation(out x,out y,out w,out h,0);Rect qtRect;if(!GetWindowRect(new IntPtr(before.qt),out qtRect)||w<3||h<3||x<qtRect.left||y<qtRect.top||x+w>qtRect.right||y+h>qtRect.bottom)throw new InvalidOperationException("Object class combo outside owned Qt page");
   var click=new Point{x=x+w/2,y=y+h/2};if(!ScreenToClient(new IntPtr(before.qt),ref click)||click.x<0||click.y<0||click.x>32767||click.y>32767)throw new InvalidOperationException("Object class combo point invalid");
   var packed=new IntPtr((click.y<<16)|(click.x&65535));if(!PostMessageW(new IntPtr(before.qt),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(before.qt),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Owned object class menu did not open");
   WindowInfo popup=null;DateTime deadline=DateTime.UtcNow.AddSeconds(3);int itemIndex=Array.IndexOf(Labels,target);int ix=0,iy=0,iw=0,ih=0;
   do{
    var fresh=Find(dialog,true);object child=Child(fresh.list,itemIndex);IAccessible item=child as IAccessible;object id=item==null?child:0;if(item==null)item=fresh.list;item.accLocation(out ix,out iy,out iw,out ih,id);
    popup=null;foreach(var window in native.EnumTopWindows())if(window.Hwnd!=dialog&&window.Visible&&window.Enabled&&window.Pid==fresh.pid&&(window.Class.StartsWith("Qt5QWindowPopup",StringComparison.Ordinal)||window.Class=="#32770")){Rect r;if(!GetWindowRect(new IntPtr(window.Hwnd),out r)||iw<3||ih<3||ix<r.left||iy<r.top||ix+iw>r.right||iy+ih>r.bottom)continue;if(popup!=null)throw new InvalidOperationException("Object class popup ambiguous");popup=window;}
    if(popup!=null)break;Thread.Sleep(50);
   }while(DateTime.UtcNow<deadline);
   if(popup==null)throw new InvalidOperationException("Exact visible object class menu item unavailable; no guessed selection");
   var point=new Point{x=ix+iw/2,y=iy+ih/2};if(!ScreenToClient(new IntPtr(popup.Hwnd),ref point)||point.x<0||point.y<0||point.x>32767||point.y>32767)throw new InvalidOperationException("Object class popup point invalid");
   packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(popup.Hwnd),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(popup.Hwnd),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Owned object class item click failed");
   deadline=DateTime.UtcNow.AddSeconds(3);do{try{if(ReadClass(dialog)==requested)return new {before=expected,after=requested,changed=true,native_readback=true,global_input=false};}catch(InvalidOperationException){}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Object class native value did not commit; no replay");
  }
 }
}
