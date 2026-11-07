using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
namespace PLCCode.Weinview {
 public static class TagQtControls {
  [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
  [DllImport("user32.dll")]static extern IntPtr GetForegroundWindow();
  [StructLayout(LayoutKind.Sequential)]struct Rect {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)]struct Point {public int x,y;}
  [DllImport("user32.dll")]static extern bool GetWindowRect(IntPtr h,out Rect r);
  [DllImport("user32.dll")]static extern bool ScreenToClient(IntPtr h,ref Point p);
  [DllImport("user32.dll")]static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")]static extern bool PostMessageW(IntPtr h,uint m,UIntPtr w,IntPtr l);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(Accessibility.IAccessible p,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int got);
  sealed class Found {public string path;public OwnedMsaaAction.Target target;}
  static void Walk(OwnedMsaaAction.Target t,string path,string name,int role,string value,int depth,ref int budget,List<Found> found){
   if(++budget>512 || depth>12)throw new Exception("Bounded import accessibility tree exceeded");
   int state=Convert.ToInt32(t.acc.get_accState(t.child));
   if((state&0x18001)==0 && Convert.ToInt32(t.acc.get_accRole(t.child))==role && (name==null || t.acc.get_accName(t.child)==name) && (value==null || t.acc.get_accValue(t.child)==value))found.Add(new Found{path=path,target=t});
   if(t.child!=0)return;
   int count=t.acc.accChildCount;if(count<0 || count>128)throw new Exception("Import child count outside bound");
   for(int i=0;i<count;i++){object[] c=new object[1];int got;if(AccessibleChildren(t.acc,i,1,c,out got)<0 || got!=1)throw new Exception("Import accessibility child unavailable");
    OwnedMsaaAction.Target next;
    if(c[0] is int)next=new OwnedMsaaAction.Target{acc=t.acc,child=(int)c[0]};
    else{var a=c[0] as Accessibility.IAccessible;if(a==null)throw new Exception("Import accessibility representation changed");next=new OwnedMsaaAction.Target{acc=a,child=0};}
    Walk(next,path+"/index:"+i,name,role,value,depth+1,ref budget,found);
   }
  }
  static OwnedMsaaAction.Target Find(NativeControls native,long root,string name,int role,string value,bool optional=false){
   // MSAA resolves and invokes the exact owned element; no global input is sent.
   native.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new IntPtr(root),out pid);
   var matches=new List<Found>();int budget=0;Walk(OwnedMsaaAction.Resolve(root,(int)pid,"client"),"client",name,role,value,0,ref budget,matches);
   if(matches.Count==0 && optional)return null;
   if(matches.Count!=1)throw new Exception("Unique visible semantic import target required: "+name);
   var selected=OwnedMsaaAction.Resolve(root,(int)pid,matches[0].path);
   if((Convert.ToInt32(selected.acc.get_accState(selected.child))&0x18001)!=0 || Convert.ToInt32(selected.acc.get_accRole(selected.child))!=role || (name!=null && selected.acc.get_accName(selected.child)!=name) || (value!=null && selected.acc.get_accValue(selected.child)!=value))throw new Exception("Import semantic target changed");
   return selected;
  }
  public static void Invoke(NativeControls n,long root,string name){
   if(name!="浏览" && name!="导入" && name!="取消")throw new Exception("Tag import button outside allowlist");
   var t=Find(n,root,name,43,null);if(t.acc.get_accDefaultAction(t.child)!="Press")throw new Exception("Import Press action required");t.acc.accDoDefaultAction(t.child);n.EnumTopWindows();
  }
  public static bool Checkbox(NativeControls n,long root,string name,bool desired){
   if(name!="移除旧标签" && name!="用新标签替换现有标签")throw new Exception("Tag import checkbox outside allowlist");
   var t=Find(n,root,name,44,null);bool value=(Convert.ToInt32(t.acc.get_accState(t.child))&16)!=0;
   if(value!=desired){if(t.acc.get_accDefaultAction(t.child)!="Toggle")throw new Exception("Import Toggle action required");t.acc.accDoDefaultAction(t.child);}
   t=Find(n,root,name,44,null);value=(Convert.ToInt32(t.acc.get_accState(t.child))&16)!=0;if(value!=desired)throw new Exception("Import checkbox readback differs");return value;
  }
  public static bool FileValueReady(NativeControls n,long root,string path){
   n.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new IntPtr(root),out pid);
   int budget=0;var fields=new List<Found>();Walk(OwnedMsaaAction.Resolve(root,(int)pid,"client"),"client",null,42,null,0,ref budget,fields);
   int matches=0;foreach(var f in fields){string value=f.target.acc.get_accValue(f.target.child);if(value!=null && String.Equals(value.Replace('/','\\'),path,StringComparison.OrdinalIgnoreCase))matches++;}
   if(matches>1)throw new Exception("Native import filename duplicated");return matches==1;
  }
  public static string[] VisibleFileFields(NativeControls n,long root){
   n.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new IntPtr(root),out pid);int budget=0;var fields=new List<Found>();Walk(OwnedMsaaAction.Resolve(root,(int)pid,"client"),"client",null,42,null,0,ref budget,fields);
   var result=new List<string>();foreach(var f in fields)result.Add(f.path+" | "+f.target.acc.get_accName(f.target.child)+" | "+f.target.acc.get_accValue(f.target.child));return result.ToArray();
  }
  static OwnedMsaaAction.Target GridChild(OwnedMsaaAction.Target parent,int index){
   object[] children=new object[1];int got;if(parent.child!=0||AccessibleChildren(parent.acc,index,1,children,out got)<0||got!=1)throw new Exception("Native tag grid child unavailable");
   var acc=children[0] as Accessibility.IAccessible;if(acc!=null)return new OwnedMsaaAction.Target{acc=acc,child=0};
   if(children[0] is int)return new OwnedMsaaAction.Target{acc=parent.acc,child=(int)children[0]};throw new Exception("Native tag grid child representation changed");
  }
  public static int SelectExistingTag(NativeControls n,long root,string name){
   n.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new IntPtr(root),out pid);
   var grid=OwnedMsaaAction.Resolve(root,(int)pid,"client");if(grid.child!=0||Convert.ToInt32(grid.acc.get_accRole(0))!=24)throw new Exception("Native tag table role required");
   int count=grid.acc.accChildCount;if(count<1||count>4096)throw new Exception("Native tag row count outside bound");
   string path=null,cellName=null;int matches=0;
   for(int i=0;i<count;i++){
    var row=GridChild(grid,i);if(row.child!=0||Convert.ToInt32(row.acc.get_accRole(0))!=28)throw new Exception("Native tag row role changed");int cells=row.acc.accChildCount;if(cells<1||cells>64)throw new Exception("Native tag column count outside bound");
    for(int j=0;j<cells;j++){var cell=GridChild(row,j);if(Convert.ToInt32(cell.acc.get_accRole(cell.child))==29&&cell.acc.get_accValue(cell.child)==name&&(Convert.ToInt32(cell.acc.get_accState(cell.child))&0x18001)==0){matches++;path="client/index:"+i+"/index:"+j;cellName=cell.acc.get_accName(cell.child);}}
   }
   if(matches!=1)throw new Exception("Exactly one visible native tag name cell required; matches="+matches);
   var selected=OwnedMsaaAction.Resolve(root,(int)pid,path);int state=Convert.ToInt32(selected.acc.get_accState(selected.child));if(selected.acc.get_accValue(selected.child)!=name||selected.acc.get_accName(selected.child)!=cellName||Convert.ToInt32(selected.acc.get_accRole(selected.child))!=29||(state&0x18001)!=0||(state&0x200000)==0)throw new Exception("Native tag cell changed before selection");
   selected.acc.accSelect(2,selected.child);
   selected=OwnedMsaaAction.Resolve(root,(int)pid,path);state=Convert.ToInt32(selected.acc.get_accState(selected.child));if(selected.acc.get_accValue(selected.child)!=name||(state&2)==0)throw new Exception("Native tag selection readback differs");return state;
  }
  public static int ReadEmptyTable(NativeControls n,long root){
   n.EnumChildControls(root);uint pid;GetWindowThreadProcessId(new IntPtr(root),out pid);
   var grid=OwnedMsaaAction.Resolve(root,(int)pid,"client");
   if(grid.child!=0||Convert.ToInt32(grid.acc.get_accRole(0))!=24||grid.acc.accChildCount!=0)throw new Exception("Original tag table is not empty");
   return grid.acc.accChildCount;
  }
  public static bool TryOpenLibrary(NativeControls n,long root){
   OwnedMsaaAction.Target t;
   try{t=Find(n,root,"地址标签库",43,null,true);}
   catch(Exception e){if(e.Message=="Import accessibility child unavailable")return false;throw;}
   if(t==null)return false;
   if(t.acc.get_accDefaultAction(t.child)!="Press")throw new Exception("Address tag library Press action required");t.acc.accDoDefaultAction(t.child);n.EnumTopWindows();return true;
  }
 }
}
