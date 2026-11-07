using System;using System.Collections.Generic;using System.Runtime.InteropServices;using System.Threading;using Accessibility;
namespace PLCCode.Weinview {
 public sealed class BitAddressTypeSnapshot {public long Hwnd{get;set;}public string Value{get;set;}public string[] Items{get;set;}}
 // Only the actual small Qt address-type combo. No LW/RW assumptions, coordinates,
 // keyboard fallback or whole-window accessibility traversal. External COM watchdog required.
 public sealed class BitAddressTypeControls {
  readonly NativeControls native;readonly string dialogTitle;
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible a);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [StructLayout(LayoutKind.Sequential)]struct R{public int l,t,r,b;}
  [DllImport("user32.dll")]static extern IntPtr GetWindow(IntPtr h,uint command);
  [DllImport("user32.dll")]static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out R r);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref P p);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
  [StructLayout(LayoutKind.Sequential)]struct P{public int x,y;}
  long MenuPopup(long dialog,long qt){long found=0;foreach(var w in native.EnumTopWindows()){if(w.Class!="#32770"||w.Title!=""||!w.Visible||!w.Enabled||GetWindow(new IntPtr(w.Hwnd),4).ToInt64()!=dialog||GetParent(new IntPtr(w.Hwnd)).ToInt64()!=dialog)continue;if(found!=0)throw new InvalidOperationException("Owned address menu popup is ambiguous.");found=w.Hwnd;}return found;}
  public long CurrentMenuPopup(long dialog,long qt){Guard(dialog,qt,false);long popup=MenuPopup(dialog,qt);if(popup==0)throw new InvalidOperationException("Exact owned numeric menu popup unavailable.");return popup;}  public BitAddressTypeControls(NativeControls n) : this(n,"位状态切换开关/位状态指示灯的属性") {}
  public BitAddressTypeControls(NativeControls n,string expectedDialogTitle){if(n==null)throw new ArgumentNullException("n");if(expectedDialogTitle!="位状态切换开关/位状态指示灯的属性"&&expectedDialogTitle!="位状态指示灯/位状态切换开关的属性"&&expectedDialogTitle!="新增 位状态切换开关/位状态指示灯")throw new ArgumentException("Bit dialog title outside exact allowlist.");native=n;dialogTitle=expectedDialogTitle;}
  void Guard(long dialog,long qt,bool writing){WindowInfo d=null;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog)d=w;if(d==null||d.Class!="#32770"||d.Title!=dialogTitle||!d.Visible)throw new InvalidOperationException("Exact owned visible numeric property dialog required.");if(!d.Enabled&&(writing||MenuPopup(dialog,qt)==0))throw new InvalidOperationException("Disabled numeric parent requires its unique owned menu popup for read-only inspection.");int count=0;foreach(var w in native.EnumChildControls(dialog))if(w.Hwnd==qt&&w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled)count++;if(count!=1)throw new InvalidOperationException("Owned small Qt address control unavailable.");}
  static object Child(IAccessible a,int index){var b=new object[1];int got;int h=AccessibleChildren(a,index,1,b,out got);if(h<0)Marshal.ThrowExceptionForHR(h);if(got!=1)throw new InvalidOperationException("Qt address item disappeared.");return b[0];}
  static int Role(IAccessible a,int id){return Convert.ToInt32(a.get_accRole(id));}
  IAccessible Combo(long qt){IAccessible a;Guid g=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int h=AccessibleObjectFromWindow(new IntPtr(qt),0xFFFFFFFC,ref g,out a);if(h!=0||a==null)throw new InvalidOperationException("Numeric address MSAA root HRESULT "+h);for(int depth=0;depth<2;depth++){if(Role(a,0)!=10||a.accChildCount!=1)return null;a=Child(a,0) as IAccessible;if(a==null)return null;}if(Role(a,0)!=46||a.accChildCount!=1)return null;return a;}
  BitAddressTypeSnapshot Snapshot(long dialog,long qt,string requiredType,out IAccessible combo,out IAccessible list){Guard(dialog,qt,false);combo=Combo(qt);list=null;if(combo==null)return null;list=Child(combo,0) as IAccessible;if(list==null||Role(list,0)!=33)return null;int count=list.accChildCount;if(count<1||count>128)throw new InvalidOperationException("Qt address type count outside 1..128.");var items=new List<string>();var unique=new HashSet<string>(StringComparer.Ordinal);for(int i=0;i<count;i++){object c=Child(list,i);IAccessible a=c as IAccessible;int id=0;if(a==null){if(!(c is int))throw new InvalidOperationException("Address type item representation changed.");a=list;id=(int)c;}if(Role(a,id)!=34)return null;string name=a.get_accName(id);if(String.IsNullOrEmpty(name)||name.Length>128||name.IndexOf('\0')>=0||!unique.Add(name))throw new InvalidOperationException("Address type item absent, oversized or duplicated.");items.Add(name);}if(list.accChildCount!=count)throw new InvalidOperationException("Address type list changed during read.");if(requiredType!=null&&!unique.Contains(requiredType))return null;string value=combo.get_accValue(0);if(String.IsNullOrEmpty(value)||!unique.Contains(value))return null;Guard(dialog,qt,false);return new BitAddressTypeSnapshot{Hwnd=qt,Value=value,Items=items.ToArray()};}
  public BitAddressTypeSnapshot Inspect(long dialog,long qt,string requiredType){if(String.IsNullOrEmpty(requiredType)||requiredType.Length>128)throw new ArgumentException("Exact required type label is required.");IAccessible combo,list;return Snapshot(dialog,qt,requiredType,out combo,out list);}
  public BitAddressTypeSnapshot InspectAny(long dialog,long qt){IAccessible combo,list;return Snapshot(dialog,qt,null,out combo,out list);}
  public BitAddressTypeSnapshot SelectExact(long dialog,long qt,string expectedBefore,string target){
   if(String.IsNullOrEmpty(target)||target.Length>128)throw new ArgumentException("Exact native bit address type required.");
   IAccessible combo,list;var before=Snapshot(dialog,qt,target,out combo,out list);
   if(before==null||before.Value!=expectedBefore)throw new InvalidOperationException("Bit address type or before-value absent from native choices.");
   if(before.Value==target)return before;
   if(combo.get_accDefaultAction(0)!="ShowMenu")throw new InvalidOperationException("Bit address combo ShowMenu contract differs.");
   Guard(dialog,qt,true);combo.accDoDefaultAction(0);
   long popup=0;var deadline=DateTime.UtcNow.AddSeconds(3);
   do{popup=MenuPopup(dialog,qt);if(popup!=0)break;Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   if(popup==0)throw new InvalidOperationException("Owned bit address menu absent; no retry.");
   long menuQt=0;foreach(var w in native.EnumChildControls(popup))if(w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){if(menuQt!=0)throw new InvalidOperationException("Bit menu Qt child ambiguous.");menuQt=w.Hwnd;}
   if(menuQt==0)throw new InvalidOperationException("Bit menu Qt child absent.");
   Guid g=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible menu;int hr=AccessibleObjectFromWindow(new IntPtr(menuQt),0xFFFFFFFC,ref g,out menu);if(hr!=0||menu==null)throw new InvalidOperationException("Bit menu accessibility root absent.");
   int[] roles={10,10,10,10,18,16,10,10,33};for(int i=0;i<roles.Length;i++){if(Role(menu,0)!=roles[i])throw new InvalidOperationException("Bit menu role path changed.");if(i<roles.Length-1){menu=Child(menu,i==4?1:0) as IAccessible;if(menu==null)throw new InvalidOperationException("Bit menu child absent.");}}
   IAccessible chosen=null;int chosenId=0;for(int i=0;i<menu.accChildCount;i++){object c=Child(menu,i);IAccessible item=c as IAccessible;int id=0;if(item==null){if(!(c is int))throw new InvalidOperationException("Bit menu item representation changed.");item=menu;id=(int)c;}if(Role(item,id)!=34)throw new InvalidOperationException("Bit menu item role changed.");if(item.get_accName(id)==target){if(chosen!=null)throw new InvalidOperationException("Bit menu target duplicated.");chosen=item;chosenId=id;}}
   if(chosen==null||(Convert.ToInt32(chosen.get_accState(chosenId))&0x18001)!=0)throw new InvalidOperationException("Visible enabled native bit type target absent.");
   if(chosen.get_accDefaultAction(chosenId)!="Toggle")throw new InvalidOperationException("Exact bit item has no native Toggle action.");
   chosen.accDoDefaultAction(chosenId);
   if(MenuPopup(dialog,qt)==popup){if(!PostMessageW(new IntPtr(menuQt),0x100,new UIntPtr(13),new IntPtr(1))||!PostMessageW(new IntPtr(menuQt),0x101,new UIntPtr(13),new IntPtr(unchecked((int)0xC0000001))))throw new InvalidOperationException("Owned bit menu Enter dispatch failed.");}
   deadline=DateTime.UtcNow.AddSeconds(3);do{bool present=false,enabled=false;foreach(var w in native.EnumTopWindows()){if(w.Hwnd==popup)present=true;if(w.Hwnd==dialog)enabled=w.Enabled;}if(!present&&enabled){var after=Inspect(dialog,qt,target);if(after!=null&&after.Value==target)return after;throw new InvalidOperationException("Bit address menu closed without exact value.");}Thread.Sleep(50);}while(DateTime.UtcNow<deadline);
   throw new InvalidOperationException("Bit address menu did not close; no retry.");
  }
 }
}
