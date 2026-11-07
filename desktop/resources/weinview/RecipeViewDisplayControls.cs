using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using Accessibility;
namespace PLCCode.Weinview {
 // Only the Recipe View field/display table: resolve rows by the vendor's item
 // names and the checkbox's MSAA Toggle action, without a model-specific ID.
 public static class RecipeViewDisplayControls {
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd,uint objectId,ref Guid iid,out IAccessible value);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int obtained);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr hwnd,StringBuilder name,int capacity);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
  [DllImport("user32.dll")] static extern bool ScreenToClient(IntPtr hwnd,ref Point point);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr hwnd,uint message,UIntPtr wp,IntPtr lp);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,ExactSpelling=true)] static extern uint MapVirtualKeyW(uint key,uint mapType);
  [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr hwnd,uint flags);
  [DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr hwnd);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32.dll")] static extern bool PrintWindow(IntPtr hwnd,IntPtr dc,uint flags);
  [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
  [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
  sealed class Row { public string Name; public IAccessible Toggle; public int ToggleChild; public bool Checked; public int X,Y,W,H; }
  static string Short(string value) {return value==null?null:(value.Length<=128?value:value.Substring(0,128));}
  static string Name(IAccessible a,object child) {try{return Short(a.get_accName(child));}catch(COMException){return null;}}
  static string Value(IAccessible a,object child) {try{return Short(a.get_accValue(child));}catch(COMException){return null;}}
  static int Role(IAccessible a,object child) {try{return Convert.ToInt32(a.get_accRole(child));}catch(COMException){return -1;}}
  static object Child(IAccessible parent,int index) {
   object[] result=new object[1];int obtained;
   if(AccessibleChildren(parent,index,1,result,out obtained)<0||obtained!=1)throw new InvalidOperationException("Recipe View Qt accessibility child changed");
   return result[0];
  }
  static void QtCombos(IAccessible node,int depth,ref int seen,List<object> result) {
   if(++seen>512||depth>8)throw new InvalidOperationException("Recipe View Qt combo diagnostic bound exceeded");
   if(Role(node,0)==46){
    var items=new List<string>();int count=node.accChildCount;
    if(count>=0&&count<=24)for(int i=0;i<count;i++){
     var list=Child(node,i) as IAccessible;if(list==null||Role(list,0)!=33)continue;
     int itemCount=list.accChildCount;if(itemCount<0||itemCount>256)continue;
     for(int j=0;j<itemCount&&items.Count<24;j++){
      var child=Child(list,j);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=list;
      if(Role(item,id)==34)items.Add(Name(item,id));
     }
    }
    result.Add(new {name=Name(node,0),value=Value(node,0),items=items.ToArray(),child_count=count});
   }
   if(depth==8)return;int children=node.accChildCount;if(children<0||children>128)throw new InvalidOperationException("Recipe View Qt accessibility breadth changed");
   for(int i=0;i<children;i++){var child=Child(node,i) as IAccessible;if(child!=null)QtCombos(child,depth+1,ref seen,result);}
  }
  public static object[] RecipeComboDiagnostics(long qt,int pid) {
   uint owner;var name=new StringBuilder(128);
   if(GetWindowThreadProcessId(new IntPtr(qt),out owner)==0||owner!=(uint)pid||GetClassNameW(new IntPtr(qt),name,name.Capacity)==0||name.ToString()!="Qt5QWindowIcon")throw new InvalidOperationException("Owned Recipe View Qt page required");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(qt),0xfffffffc,ref iid,out root)<0||root==null)throw new InvalidOperationException("Recipe View Qt accessibility unavailable");
   var result=new List<object>();int seen=0;QtCombos(root,0,ref seen,result);if(result.Count>24)throw new InvalidOperationException("Recipe View Qt combo count exceeds diagnostic bound");return result.ToArray();
  }
  static void FieldTables(IAccessible node,int depth,ref int seen,List<object> tables) {
   if(++seen>512||depth>9)throw new InvalidOperationException("Recipe View field diagnostic bound exceeded");
   if(Role(node,0)==24){
    var rows=new List<object>();int count=node.accChildCount;
    if(count>=0&&count<=256)for(int i=0;i<count&&rows.Count<24;i++){
     var child=Child(node,i);var row=child as IAccessible;object id=row==null?child:0;if(row==null)row=node;
     var cells=new List<object>();if(id is int&&Convert.ToInt32(id)==0&&row!=node){int cellCount=row.accChildCount;if(cellCount>=0&&cellCount<=24)for(int j=0;j<cellCount&&j<8;j++){
      var cellChild=Child(row,j);var cell=cellChild as IAccessible;object cellId=cell==null?cellChild:0;if(cell==null)cell=row;
      cells.Add(new {role=Role(cell,cellId),name=Name(cell,cellId),value=Value(cell,cellId)});
     }}
     rows.Add(new {role=Role(row,id),name=Name(row,id),value=Value(row,id),cells=cells.ToArray()});
    }
    tables.Add(new {role=24,name=Name(node,0),value=Value(node,0),row_count=count,rows=rows.ToArray()});
   }
   if(depth==9)return;int children=node.accChildCount;if(children<0||children>128)return;
   for(int i=0;i<children;i++){var child=Child(node,i) as IAccessible;if(child!=null)FieldTables(child,depth+1,ref seen,tables);}
  }
  public static object[] FieldTableDiagnostics(long hwnd,int pid){
   uint owner;var name=new StringBuilder(128);
   if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid||GetClassNameW(new IntPtr(hwnd),name,name.Capacity)==0||!(name.ToString()=="Qt5QWindowIcon"||name.ToString().StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)))throw new InvalidOperationException("Owned Recipe View candidate required");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root)<0||root==null)throw new InvalidOperationException("Recipe View candidate accessibility unavailable");
   var tables=new List<object>();int seen=0;FieldTables(root,0,ref seen,tables);if(tables.Count>24)throw new InvalidOperationException("Recipe View field table count exceeds diagnostic bound");return tables.ToArray();
  }
  static void FieldSurface(IAccessible node,object id,string path,int depth,List<object> result){
   if(result.Count>=512||depth>10)return;
   int state=-1;string action=null;int x=0,y=0,w=0,h=0;
   try{state=Convert.ToInt32(node.get_accState(id));}catch(COMException){}
   try{action=Short(node.get_accDefaultAction(id));}catch(COMException){}
   try{node.accLocation(out x,out y,out w,out h,id);}catch(COMException){}
   result.Add(new {path=path,role=Role(node,id),name=Name(node,id),value=Value(node,id),state=state,action=action,rect=new[]{x,y,w,h}});
   if(depth==10||!(id is int)||Convert.ToInt32(id)!=0)return;
   int count;try{count=node.accChildCount;}catch(COMException){return;}
   if(count<0||count>256)throw new InvalidOperationException("Recipe View field surface breadth changed");
   for(int i=0;i<count&&result.Count<512;i++){
    var child=Child(node,i);var accessible=child as IAccessible;
    if(accessible!=null)FieldSurface(accessible,0,path+"/"+i,depth+1,result);
    else FieldSurface(node,child,path+"/"+i,depth+1,result);
   }
  }
  public static object[] FieldSurfaceDiagnostics(long hwnd,int pid){
   uint owner;var name=new StringBuilder(128);
   if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid||GetClassNameW(new IntPtr(hwnd),name,name.Capacity)==0||!(name.ToString()=="Qt5QWindowIcon"||name.ToString().StartsWith("BCGPGridCtrl:",StringComparison.Ordinal)))throw new InvalidOperationException("Owned Recipe View field surface required");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root)<0||root==null)throw new InvalidOperationException("Recipe View field surface accessibility unavailable");
   var result=new List<object>();FieldSurface(root,0,"root",0,result);return result.ToArray();
  }
  sealed class SortAnchor {public IAccessible Enable,Combo,Ascending,Descending,List;public string Field;public string[] Fields;}
  static bool Checked(IAccessible node){return (Convert.ToInt32(node.get_accState(0))&16)!=0;}
  static void SortGroups(IAccessible node,int depth,ref int seen,List<IAccessible> found){
   if(++seen>512||depth>10)throw new InvalidOperationException("Recipe View sort accessibility bound exceeded");
   if(Role(node,0)==20&&Name(node,0)=="预设排列方式")found.Add(node);
   if(depth==10)return;int count=node.accChildCount;if(count<0||count>256)throw new InvalidOperationException("Recipe View sort accessibility breadth changed");
   for(int i=0;i<count;i++){var child=Child(node,i) as IAccessible;if(child!=null)SortGroups(child,depth+1,ref seen,found);}
  }
  static SortAnchor FindSort(NativeControls native,long dialog,int pid){
   var groups=new List<IAccessible>();foreach(var qt in native.EnumChildControls(dialog)){
    if(!qt.Visible||qt.Class!="Qt5QWindowIcon")continue;
    int seen=0;SortGroups(Root(qt.Hwnd,pid),0,ref seen,groups);
   }
   if(groups.Count!=1)throw new InvalidOperationException("Unique original Recipe View Default sort method group required");
   var group=groups[0];IAccessible enable=null,combo=null,ascending=null,descending=null;
   int count=group.accChildCount;if(count<4||count>12)throw new InvalidOperationException("Recipe View sort group children changed");
   for(int i=0;i<count;i++){var child=Child(group,i) as IAccessible;if(child==null)continue;
    string name=Name(child,0);int role=Role(child,0);
    if(role==44&&name=="启用"){if(enable!=null)throw new InvalidOperationException("Recipe View sort Enable duplicated");enable=child;}
    if(role==46&&name=="预设排列方式 Down"){if(combo!=null)throw new InvalidOperationException("Recipe View Sort by duplicated");combo=child;}
    if(role==45&&name=="顺序"){if(ascending!=null)throw new InvalidOperationException("Recipe View sort Ascending duplicated");ascending=child;}
    if(role==45&&name=="逆序"){if(descending!=null)throw new InvalidOperationException("Recipe View sort Descending duplicated");descending=child;}
   }
   if(enable==null||combo==null||ascending==null||descending==null)throw new InvalidOperationException("Recipe View sort native controls incomplete");
   var fields=new List<string>();IAccessible list=null;int lists=combo.accChildCount;
   if(lists<1||lists>4)throw new InvalidOperationException("Recipe View Sort by list unavailable");
   for(int i=0;i<lists;i++){var child=Child(combo,i) as IAccessible;if(child!=null&&Role(child,0)==33){if(list!=null)throw new InvalidOperationException("Recipe View Sort by list duplicated");list=child;}}
   if(list==null)throw new InvalidOperationException("Recipe View Sort by native list unavailable");
   int items=list.accChildCount;if(items<1||items>100)throw new InvalidOperationException("Recipe View Sort by field count invalid");
   for(int i=0;i<items;i++){var child=Child(list,i);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=list;
    if(Role(item,id)!=34)throw new InvalidOperationException("Recipe View Sort by field role changed");string field=Name(item,id);
    if(String.IsNullOrEmpty(field)||fields.Contains(field))throw new InvalidOperationException("Recipe View Sort by field missing or duplicated");fields.Add(field);
   }
   return new SortAnchor{Enable=enable,Combo=combo,Ascending=ascending,Descending=descending,List=list,Field=Value(combo,0),Fields=fields.ToArray()};
  }
  public static object ReadSort(NativeControls native,long dialog,int pid){
   var sort=FindSort(native,dialog,pid);bool up=Checked(sort.Ascending),down=Checked(sort.Descending);
   if(up==down)throw new InvalidOperationException("Recipe View sort direction not unique");
   if(String.IsNullOrEmpty(sort.Field)||Array.IndexOf(sort.Fields,sort.Field)<0)throw new InvalidOperationException("Recipe View Sort by value outside native fields");
   return new {enabled=Checked(sort.Enable),field=sort.Field,direction=up?"ascending":"descending",fields=sort.Fields};
  }
  sealed class SortPopupAnchor {public long Hwnd;public IAccessible List;}
  static void SortPopupLists(IAccessible node,int depth,ref int seen,List<IAccessible> found){
   if(++seen>512||depth>10)throw new InvalidOperationException("Recipe View Sort by popup accessibility bound exceeded");
   if(Role(node,0)==33){found.Add(node);return;}
   int count=node.accChildCount;if(count<0||count>256)throw new InvalidOperationException("Recipe View Sort by popup breadth changed");
   if(depth==10)return;
   for(int i=0;i<count;i++){var child=Child(node,i) as IAccessible;if(child!=null)SortPopupLists(child,depth+1,ref seen,found);}
  }
  static SortPopupAnchor FindSortPopup(NativeControls native,long dialog,int pid,string[] fields){
   SortPopupAnchor found=null;
   foreach(var window in native.EnumTopWindows()){
    if(window.Hwnd==dialog||!window.Visible||!window.Enabled||window.Pid!=pid||!window.Class.StartsWith("Qt5QWindowPopup",StringComparison.Ordinal))continue;
    IAccessible root;try{root=Root(window.Hwnd,pid,true);}catch(InvalidOperationException){continue;}
    var lists=new List<IAccessible>();int seen=0;SortPopupLists(root,0,ref seen,lists);if(lists.Count!=1)continue;
    var list=lists[0];if(list.accChildCount!=fields.Length)continue;
    bool exact=true;for(int i=0;i<fields.Length;i++){
     var child=Child(list,i);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=list;
     if(Role(item,id)!=34||!String.Equals(Name(item,id),fields[i],StringComparison.Ordinal)){exact=false;break;}
    }
    if(!exact)continue;
    if(found!=null)throw new InvalidOperationException("Recipe View Sort by matching owned popup duplicated");
    found=new SortPopupAnchor{Hwnd=window.Hwnd,List=list};
   }
   return found;
  }
  static void PostSortPopupKey(long hwnd,uint key){
   uint scan=MapVirtualKeyW(key,0);if(scan==0)throw new InvalidOperationException("Recipe View Sort by native key scan unavailable");
   uint down=1u|(scan<<16);if(key==0x24||key==0x28)down|=0x01000000u;
   uint up=down|0xC0000000u;IntPtr target=new IntPtr(hwnd);
   if(!PostMessageW(target,0x100,new UIntPtr(key),new IntPtr(unchecked((int)down)))||!PostMessageW(target,0x101,new UIntPtr(key),new IntPtr(unchecked((int)up))))throw new InvalidOperationException("Recipe View Sort by owned popup key delivery failed");
  }
  static bool SortPopupTargetSelected(IAccessible list,string[] fields,string field,out string observedName,out int observedState){
   if(list.accChildCount!=fields.Length)throw new InvalidOperationException("Recipe View Sort by popup field count changed");
   int focused=0;string selected=null;observedName=null;observedState=-1;
   for(int i=0;i<fields.Length;i++){
    var child=Child(list,i);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=list;
    string name=Name(item,id);if(Role(item,id)!=34||!String.Equals(name,fields[i],StringComparison.Ordinal))throw new InvalidOperationException("Recipe View Sort by popup field order changed");
    int state=Convert.ToInt32(item.get_accState(id));
    if((state&6)!=0||name==field){observedName=name;observedState=state;}
    if((state&6)==6){focused++;selected=name;observedName=name;observedState=state;}
   }
   return focused==1&&String.Equals(selected,field,StringComparison.Ordinal);
  }
  public static object SetSort(NativeControls native,long dialog,int pid,bool enabled,string field,string direction,string[] fields){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Recipe View sort selection");
   try{
   if(fields==null||fields.Length<1||Array.IndexOf(fields,field)<0||!(direction=="ascending"||direction=="descending"))throw new InvalidOperationException("Requested Recipe View sort field/direction invalid");
   var sort=FindSort(native,dialog,pid);if(Array.IndexOf(sort.Fields,field)<0)throw new InvalidOperationException("Requested sort field absent from native Recipe View list");
   if(!enabled&&!Checked(sort.Enable)&&sort.Field==field&&(Checked(sort.Ascending)?"ascending":"descending")==direction)return ReadSort(native,dialog,pid);
    if(!Checked(sort.Enable) && (enabled || sort.Field!=field || (Checked(sort.Ascending)?"ascending":"descending")!=direction))sort.Enable.accDoDefaultAction(0);
   sort=FindSort(native,dialog,pid);if(!Checked(sort.Enable))throw new InvalidOperationException("Recipe View sort Enable did not activate");
   if(sort.Field!=field){
    SortPopupAnchor popup=null;var until=DateTime.UtcNow.AddSeconds(3);
    sort.Combo.accDoDefaultAction(0);
    try{
     do{popup=FindSortPopup(native,dialog,pid,sort.Fields);if(popup!=null)break;System.Threading.Thread.Sleep(50);}while(DateTime.UtcNow<until);
     if(popup==null)throw new InvalidOperationException("Exact owned Recipe View Sort by field popup unavailable");
     PostSortPopupKey(popup.Hwnd,0x24);
     foreach(char character in field)if(!PostMessageW(new IntPtr(popup.Hwnd),0x102,new UIntPtr((uint)character),new IntPtr(1)))throw new InvalidOperationException("Recipe View Sort by owned popup field typeahead delivery failed");
     bool selected=false;string observedName=null;int observedState=-1;do{
      var current=FindSortPopup(native,dialog,pid,sort.Fields);
      if(current==null||current.Hwnd!=popup.Hwnd)throw new InvalidOperationException("Recipe View Sort by popup changed at stage=typeahead_selection; last="+(observedName??"<none>")+" state=0x"+observedState.ToString("X"));
      if(SortPopupTargetSelected(current.List,sort.Fields,field,out observedName,out observedState)){selected=true;break;}
      System.Threading.Thread.Sleep(50);
     }while(DateTime.UtcNow<until);
     if(!selected)throw new InvalidOperationException("Recipe View Sort by exact popup field not selected and focused at stage=typeahead_selection; wanted="+field+" last="+(observedName??"<none>")+" state=0x"+observedState.ToString("X"));
     PostSortPopupKey(popup.Hwnd,0x0D);
     do{sort=FindSort(native,dialog,pid);if(sort.Field==field)break;System.Threading.Thread.Sleep(50);}while(DateTime.UtcNow<until);
     if(sort.Field!=field)throw new InvalidOperationException("Recipe View Sort by selection did not commit after owned popup Enter");
    }catch{
     if(popup!=null)foreach(var window in native.EnumTopWindows())if(window.Hwnd==popup.Hwnd&&window.Visible&&window.Enabled&&window.Pid==pid&&window.Class.StartsWith("Qt5QWindowPopup",StringComparison.Ordinal)){try{PostSortPopupKey(popup.Hwnd,0x1B);}catch{}break;}
     throw;
    }
   }
   var directionNode=direction=="ascending"?sort.Ascending:sort.Descending;
   if(!Checked(directionNode)){directionNode.accDoDefaultAction(0);sort=FindSort(native,dialog,pid);if(!Checked(direction=="ascending"?sort.Ascending:sort.Descending))throw new InvalidOperationException("Recipe View sort direction did not commit");}
   if(!enabled){sort.Enable.accDoDefaultAction(0);sort=FindSort(native,dialog,pid);}
   var actual=ReadSort(native,dialog,pid);return actual;
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Recipe View sort DPI context restoration failed");}
  }
  sealed class RecipeAnchor {public long Qt;public IAccessible Combo;public IAccessible List;public string Selected;public int Item;}
  static void RecipeAnchors(IAccessible node,int depth,ref int seen,string recipe,long qt,List<RecipeAnchor> found) {
   if(++seen>512||depth>8)throw new InvalidOperationException("Recipe directory accessibility bound exceeded");
   if(Role(node,0)==46&&Name(node,0)=="配方目录 Down"){
    int count=node.accChildCount;if(count!=1)throw new InvalidOperationException("Original Recipe directory combo list changed");
    var list=Child(node,0) as IAccessible;if(list==null||Role(list,0)!=33)throw new InvalidOperationException("Original Recipe directory native list unavailable");
    int itemCount=list.accChildCount;if(itemCount<1||itemCount>256)throw new InvalidOperationException("Recipe directory list outside reviewed bound");
    string selected=Value(node,0);string target=recipe??selected;
    if(String.IsNullOrEmpty(target))throw new InvalidOperationException("Recipe directory native selection unavailable");
    int hit=-1;for(int i=0;i<itemCount;i++){var child=Child(list,i);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=list;if(Role(item,id)!=34)throw new InvalidOperationException("Recipe directory native item role changed");if(Name(item,id)==target){if(hit!=-1)throw new InvalidOperationException("Recipe name duplicated in native directory list");hit=i;}}
    if(hit>=0)found.Add(new RecipeAnchor{Qt=qt,Combo=node,List=list,Selected=selected,Item=hit});
   }
   if(depth==8)return;int children=node.accChildCount;if(children<0||children>128)throw new InvalidOperationException("Recipe directory accessibility breadth changed");
   for(int i=0;i<children;i++){var child=Child(node,i) as IAccessible;if(child!=null)RecipeAnchors(child,depth+1,ref seen,recipe,qt,found);}
  }
  static RecipeAnchor FindRecipe(NativeControls native,long dialog,int pid,string recipe,bool allowPopup=false) {
   if(recipe!=null&&String.IsNullOrEmpty(recipe))throw new ArgumentException("Current-project recipe name required");
   var found=new List<RecipeAnchor>();foreach(var qt in native.EnumChildControls(dialog)){
    if(!qt.Visible||(!qt.Enabled&&!allowPopup)||qt.Class!="Qt5QWindowIcon")continue;
    uint owner;if(GetWindowThreadProcessId(new IntPtr(qt.Hwnd),out owner)==0||owner!=(uint)pid)continue;
    var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
    if(AccessibleObjectFromWindow(new IntPtr(qt.Hwnd),0xfffffffc,ref iid,out root)<0||root==null)continue;
    int seen=0;RecipeAnchors(root,0,ref seen,recipe,qt.Hwnd,found);
   }
   if(found.Count!=1)throw new InvalidOperationException("Unique original Recipe directory Down control with exact current-project recipe item required");
   return found[0];
  }
  public static string ReadRecipeDirectory(NativeControls native,long dialog,int pid,string recipe){return FindRecipe(native,dialog,pid,recipe).Selected;}
  public static string ReadSelectedRecipeDirectory(NativeControls native,long dialog,int pid){return FindRecipe(native,dialog,pid,null).Selected;}
  public static string SelectRecipeDirectory(NativeControls native,long dialog,int pid,string recipe){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Recipe View directory selection");
   try{
   var anchor=FindRecipe(native,dialog,pid,recipe);if(anchor.Selected==recipe)return recipe;
   string action=anchor.Combo.get_accDefaultAction(0);
   if(!String.IsNullOrEmpty(action))anchor.Combo.accDoDefaultAction(0);
   else {
    int x,y,w,h;anchor.Combo.accLocation(out x,out y,out w,out h,0);Rect qtRect;
    if(!GetWindowRect(new IntPtr(anchor.Qt),out qtRect)||w<3||h<3||x<qtRect.left||y<qtRect.top||x+w>qtRect.right||y+h>qtRect.bottom)throw new InvalidOperationException("Recipe directory combo outside owned Qt page");
    var point=new Point{x=x+w/2,y=y+h/2};if(!ScreenToClient(new IntPtr(anchor.Qt),ref point))throw new InvalidOperationException("Recipe directory Qt point invalid");
    var packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(anchor.Qt),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(anchor.Qt),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Recipe directory native menu did not open");
   }
   anchor=FindRecipe(native,dialog,pid,recipe,true);var child=Child(anchor.List,anchor.Item);var item=child as IAccessible;object id=item==null?child:0;if(item==null)item=anchor.List;
   string itemAction=item.get_accDefaultAction(id);
   if(!String.IsNullOrEmpty(itemAction))item.accDoDefaultAction(id);
   else {
    int x,y,w,h;item.accLocation(out x,out y,out w,out h,id);WindowInfo popup=null;
    foreach(var window in native.EnumTopWindows())if(window.Hwnd!=dialog&&window.Visible&&window.Enabled&&window.Pid==pid&&(window.Class.StartsWith("Qt5QWindowPopup",StringComparison.Ordinal)||window.Class=="#32770")){
     Rect r;if(!GetWindowRect(new IntPtr(window.Hwnd),out r)||w<3||h<3||x<r.left||y<r.top||x+w>r.right||y+h>r.bottom)continue;
     if(popup!=null)throw new InvalidOperationException("Recipe directory popup ambiguous");popup=window;
    }
    if(popup==null)throw new InvalidOperationException("Exact native Recipe directory popup item unavailable");
    var point=new Point{x=x+w/2,y=y+h/2};if(!ScreenToClient(new IntPtr(popup.Hwnd),ref point))throw new InvalidOperationException("Recipe directory popup point invalid");
    var packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(popup.Hwnd),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(popup.Hwnd),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Recipe directory native item click failed");
   }
   var until=DateTime.UtcNow.AddSeconds(3);do{if(ReadRecipeDirectory(native,dialog,pid,recipe)==recipe)return recipe;System.Threading.Thread.Sleep(50);}while(DateTime.UtcNow<until);
   throw new InvalidOperationException("Recipe directory native value did not commit");
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Recipe View directory DPI context restoration failed");}
  }
  static IAccessible Root(long hwnd,int pid,bool allowPopup=false) {
   uint owner;var name=new StringBuilder(128);
   if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0||owner!=(uint)pid||GetClassNameW(new IntPtr(hwnd),name,name.Capacity)==0||!(name.ToString()=="Qt5QWindowIcon"||(allowPopup&&name.ToString().StartsWith("Qt5QWindowPopup",StringComparison.Ordinal))))throw new InvalidOperationException("Owned Recipe View Qt page required");
   var iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;
   if(AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root)<0||root==null)throw new InvalidOperationException("Recipe View Qt accessibility unavailable");
   return root;
  }
  static void FindFieldTables(IAccessible node,int depth,ref int seen,List<IAccessible> found){
   if(++seen>512||depth>10)throw new InvalidOperationException("Recipe View Qt field table bound exceeded");
   int count=node.accChildCount;
   if(Role(node,0)==24&&count>=6&&count<=303){
    var first=Child(node,1) as IAccessible;var second=Child(node,2) as IAccessible;
    if(first!=null&&second!=null&&Role(first,0)==25&&Name(first,0)=="项目名称"&&Role(second,0)==25&&Name(second,0)=="显示")found.Add(node);
   }
   if(depth==10)return;if(count<0||count>303)throw new InvalidOperationException("Recipe View Qt field breadth changed");
   for(int i=0;i<count;i++){var child=Child(node,i) as IAccessible;if(child!=null)FindFieldTables(child,depth+1,ref seen,found);}
  }
  static List<Row> Rows(long qt,int pid,string[] fieldNames,bool readCheckmarks=true,string evidencePath=null){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Recipe View Display rows and capture");
   try{
   if(fieldNames!=null&&(fieldNames.Length<1||fieldNames.Length>100||new HashSet<string>(fieldNames,StringComparer.Ordinal).Count!=fieldNames.Length))throw new InvalidOperationException("One to 100 distinct current-recipe field names required");
   var tables=new List<IAccessible>();int seen=0;FindFieldTables(Root(qt,pid),0,ref seen,tables);
   if(tables.Count!=1)throw new InvalidOperationException("Unique original Recipe View Qt field table required");
   var table=tables[0];int count=table.accChildCount;if(count<6||(count-3)%3!=0||(count-3)/3>100||(fieldNames!=null&&count!=3+fieldNames.Length*3))throw new InvalidOperationException("Recipe View Qt field count differs from current recipe definition");
   var rows=new List<Row>();var names=new HashSet<string>(StringComparer.Ordinal);for(int i=0;i<(count-3)/3;i++){
    var number=Child(table,3+i*3) as IAccessible;var field=Child(table,4+i*3) as IAccessible;var display=Child(table,5+i*3) as IAccessible;
    string actual=field==null?null:Name(field,0);
    if(number==null||field==null||display==null||Role(number,0)!=26||Name(number,0)!=(i+1).ToString()||Role(field,0)!=29||String.IsNullOrEmpty(actual)||!names.Add(actual)||(fieldNames!=null&&actual!=fieldNames[i])||Role(display,0)!=29||display.get_accDefaultAction(0)!="Toggle")throw new InvalidOperationException("Recipe View Qt field/display row changed");
    int x,y,w,h;display.accLocation(out x,out y,out w,out h,0);if(w<24||h<20)throw new InvalidOperationException("Recipe View Qt Display cell geometry unavailable");
    rows.Add(new Row{Name=actual,Toggle=display,ToggleChild=0,X=x,Y=y,W=w,H=h});
   }
   if(readCheckmarks)ReadCheckmarks(qt,pid,rows,evidencePath);return rows;
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Recipe View Display DPI context restoration failed");}
  }
  static bool TryReadCheckmarks(Bitmap image,Rect bounds,uint dpi,List<Row> rows){
   var states=new bool[rows.Count];for(int index=0;index<rows.Count;index++){
    // Qt MSAA accLocation and Win32 GetWindowRect are both physical screen pixels.
    var row=rows[index];int originX=(int)Math.Round(row.X+row.W/2.0)-bounds.left,originY=(int)Math.Round(row.Y+row.H/2.0)-bounds.top;
    int bestBorder=-1,bestInner=-1;
    // Original Qt renders either a 16-pixel or a 13-pixel square at the observed DPI.
    foreach(int side in new[]{16,13})for(int shiftY=-1;shiftY<=1;shiftY++)for(int shiftX=-1;shiftX<=1;shiftX++){
     int cx=originX+shiftX,cy=originY+shiftY,lo=side==16?-8:-6,hi=side==16?7:6;
     if(cx+lo<0||cy+lo<0||cx+hi>=image.Width||cy+hi>=image.Height)continue;
     int left=0,right=0,top=0,bottom=0,inner=0;
     for(int d=lo;d<=hi;d++){
      var l=image.GetPixel(cx+lo,cy+d);if(l.R<160&&l.G<160&&l.B<160)left++;
      var r=image.GetPixel(cx+hi,cy+d);if(r.R<160&&r.G<160&&r.B<160)right++;
      var t=image.GetPixel(cx+d,cy+lo);if(t.R<160&&t.G<160&&t.B<160)top++;
      var b=image.GetPixel(cx+d,cy+hi);if(b.R<160&&b.G<160&&b.B<160)bottom++;
     }
     int minEdge=side==16?14:12;
     if(left<minEdge||right<minEdge||top<minEdge||bottom<minEdge)continue;
     int innerRadius=side==16?5:4;
     for(int dy=-innerRadius;dy<=innerRadius;dy++)for(int dx=-innerRadius;dx<=innerRadius;dx++){
      var pixel=image.GetPixel(cx+dx,cy+dy);if(pixel.R<160&&pixel.G<160&&pixel.B<160)inner++;
     }
     int border=left+right+top+bottom;
     if(border>=minEdge*4&&border>bestBorder){bestBorder=border;bestInner=inner;}
    }
    if(bestBorder<48||(bestInner>2&&bestInner<8))return false;
    states[index]=bestInner>=8;
   }
   for(int i=0;i<rows.Count;i++)rows[i].Checked=states[i];return true;
  }
  static void SaveAmbiguous(Bitmap image,string path,List<Row> rows){
   if(String.IsNullOrEmpty(path))return;
   if(!Path.IsPathRooted(path)||!path.EndsWith(".png",StringComparison.OrdinalIgnoreCase)||File.Exists(path)||File.Exists(path+".cells.txt"))throw new InvalidOperationException("Fresh absolute Recipe Display evidence PNG path required");
   image.Save(path,ImageFormat.Png);
   var lines=new List<string>();foreach(var row in rows){string value=null;int state=-1,role=-1;try{value=row.Toggle.get_accValue(row.ToggleChild);}catch(COMException){}try{state=Convert.ToInt32(row.Toggle.get_accState(row.ToggleChild));}catch(COMException){}try{role=Convert.ToInt32(row.Toggle.get_accRole(row.ToggleChild));}catch(COMException){}lines.Add(row.Name+"|role="+role+"|state="+state+"|value="+(value??"<null>")+"|rect="+row.X+","+row.Y+","+row.W+","+row.H);}
   File.WriteAllLines(path+".cells.txt",lines.ToArray(),new UTF8Encoding(false));
  }
  static string CaptureAmbiguous(Bitmap image,string path,List<Row> rows){try{SaveAmbiguous(image,path,rows);return path;}catch(Exception e){return "capture_failed:"+e.GetType().Name+":"+e.Message;}}
  static void ReadCheckmarks(long qt,int pid,List<Row> rows,string evidencePath=null){
   var dialog=GetAncestor(new IntPtr(qt),2);uint owner;var className=new StringBuilder(128);Rect bounds;
   if(dialog==IntPtr.Zero||GetWindowThreadProcessId(dialog,out owner)==0||owner!=(uint)pid||GetClassNameW(dialog,className,className.Capacity)==0||className.ToString()!="#32770"||!GetWindowRect(dialog,out bounds))throw new InvalidOperationException("Owned Recipe View property dialog required for Display readback");
   int width=bounds.right-bounds.left,height=bounds.bottom-bounds.top;if(width<300||height<300||width>4096||height>4096)throw new InvalidOperationException("Recipe View dialog render bounds changed");
   uint dpi=GetDpiForWindow(dialog);if(dpi==0)throw new InvalidOperationException("Recipe View Display DPI unavailable");
    var deadline=DateTime.UtcNow.AddSeconds(3);
    do {
     using(var image=new Bitmap(width,height)){
      if(GetForegroundWindow()==dialog){
       using(var g=Graphics.FromImage(image))g.CopyFromScreen(bounds.left,bounds.top,0,0,new Size(width,height));
       Rect current;if(GetForegroundWindow()!=dialog||!GetWindowRect(dialog,out current)||current.left!=bounds.left||current.top!=bounds.top||current.right!=bounds.right||current.bottom!=bounds.bottom)throw new InvalidOperationException("Owned Recipe View dialog changed during Display capture");
       if(TryReadCheckmarks(image,bounds,dpi,rows))return;
       if(DateTime.UtcNow>=deadline)throw new InvalidOperationException("Recipe View Display checkbox image ambiguous after bounded render observation; evidence="+CaptureAmbiguous(image,evidencePath,rows));
      }else{
       bool printed;using(var g=Graphics.FromImage(image)){IntPtr dc=g.GetHdc();try{printed=PrintWindow(dialog,dc,2);}finally{g.ReleaseHdc(dc);}}
       if(printed&&TryReadCheckmarks(image,bounds,dpi,rows))return;
       throw new InvalidOperationException("Recipe View Display checkbox image ambiguous; owned dialog foreground required for readback; evidence="+CaptureAmbiguous(image,evidencePath,rows));
      }
     }
     System.Threading.Thread.Sleep(100);
    } while(true);
  }
  public static bool CanResolve(long qt,int pid,string[] fieldNames){try{Rows(qt,pid,fieldNames,false);return true;}catch(Exception){return false;}}
  public static object ReadDisplayed(long qt,int pid){return ReadDisplayed(qt,pid,null);}
  public static object ReadDisplayed(long qt,int pid,string[] fieldNames){return Rows(qt,pid,fieldNames).ConvertAll(r=>new {name=r.Name,displayed=r.Checked}).ToArray();}
  public static object ReadDisplayedWithEvidence(long qt,int pid,string evidencePath){return Rows(qt,pid,null,true,evidencePath).ConvertAll(r=>new {name=r.Name,displayed=r.Checked}).ToArray();}
  public static object ReadDisplayedFromIndices(long qt,int pid,uint[] indices){
   if(indices==null)throw new InvalidOperationException("Committed Recipe View Display indices required");
   var rows=Rows(qt,pid,null,false);var selected=new HashSet<uint>();
   foreach(uint index in indices)if(index>=(uint)rows.Count||!selected.Add(index))throw new InvalidOperationException("Recipe View Display index duplicated or outside native field rows");
   int ordinal=0;return rows.ConvertAll(r=>{int index=ordinal++;return new {name=r.Name,displayed=indices.Length==0||selected.Contains((uint)index)};}).ToArray();
  }
  static void ClickDisplayRow(long qt,Row row){
   uint dpi=GetDpiForWindow(new IntPtr(qt));if(dpi!=96&&dpi!=120)throw new InvalidOperationException("Recipe View Display DPI outside observed 96/120 profile");
   int left=row.X,top=row.Y,right=row.X+row.W,bottom=row.Y+row.H;
   Rect page;if(!GetWindowRect(new IntPtr(qt),out page)||left<page.left||top<page.top||right>page.right||bottom>page.bottom)throw new InvalidOperationException("Recipe View Display cell outside owned Qt page");
   var point=new Point{x=(left+right)/2,y=(top+bottom)/2};if(!ScreenToClient(new IntPtr(qt),ref point))throw new InvalidOperationException("Recipe View Display click point invalid");
   var packed=new IntPtr((point.y<<16)|(point.x&65535));if(!PostMessageW(new IntPtr(qt),0x201,new UIntPtr(1),packed)||!PostMessageW(new IntPtr(qt),0x202,UIntPtr.Zero,packed))throw new InvalidOperationException("Recipe View owned Display click failed");
  }
  public static object QueueDisplayed(long qt,int pid,string[] fieldNames,string[] currentDisplayed,string[] desired){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Recipe View Display click");
   try{
    if(fieldNames==null||currentDisplayed==null)throw new InvalidOperationException("Known current Recipe View Display fields required before queuing changes");
    if(desired==null||desired.Length<1)throw new InvalidOperationException("At least one displayed recipe field required");
    var rows=Rows(qt,pid,fieldNames,false);
    var known=new HashSet<string>(StringComparer.Ordinal);foreach(var row in rows)known.Add(row.Name);
    var current=new HashSet<string>(StringComparer.Ordinal);foreach(var field in currentDisplayed)if(!known.Contains(field)||!current.Add(field))throw new InvalidOperationException("Current displayed field absent or duplicated");
    var wanted=new HashSet<string>(StringComparer.Ordinal);foreach(var field in desired)if(!known.Contains(field)||!wanted.Add(field))throw new InvalidOperationException("Requested displayed field absent or duplicated");
    var before=rows.ConvertAll(r=>new {name=r.Name,displayed=current.Contains(r.Name)}).ToArray();
    var requested=rows.ConvertAll(r=>new {name=r.Name,displayed=wanted.Contains(r.Name)}).ToArray();
    var changes=new List<string>();foreach(var row in rows){if(current.Contains(row.Name)==wanted.Contains(row.Name))continue;ClickDisplayRow(qt,row);changes.Add(row.Name);}
    return new {before=before,requested=requested,changed=changes.ToArray(),pending_confirm=true};
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Recipe View Display DPI context restoration failed");}
  }
  public static object SetDisplayed(long qt,int pid,string[] fieldNames,string[] displayed){
   IntPtr previous=SetThreadDpiAwarenessContext(new IntPtr(-4));if(previous==IntPtr.Zero)throw new InvalidOperationException("Physical DPI context required for Recipe View Display click");
   try{
   if(displayed==null||displayed.Length<1)throw new InvalidOperationException("At least one displayed recipe field required");
   var wanted=new HashSet<string>(displayed,StringComparer.Ordinal);if(wanted.Count!=displayed.Length)throw new InvalidOperationException("Duplicate displayed recipe field");
   var before=Rows(qt,pid,fieldNames);foreach(var field in displayed)if(!Array.Exists(fieldNames,x=>x==field))throw new InvalidOperationException("Displayed field absent from current recipe definition");
   var changes=new List<string>();foreach(var row in before){bool target=wanted.Contains(row.Name);if(row.Checked==target)continue;
    ClickDisplayRow(qt,row);
    changes.Add(row.Name);
   }
   var after=before;
   if(changes.Count>0){
    var deadline=DateTime.UtcNow.AddSeconds(3);
    do{
     after=Rows(qt,pid,fieldNames);
     bool matched=true;foreach(var row in after)if(row.Checked!=wanted.Contains(row.Name)){matched=false;break;}
     if(matched)break;
     if(DateTime.UtcNow>=deadline)throw new InvalidOperationException("Recipe View Display checkbox final readback differs");
     System.Threading.Thread.Sleep(50);
    }while(true);
   }
   return new {before=before.ConvertAll(r=>new {name=r.Name,displayed=r.Checked}).ToArray(),after=after.ConvertAll(r=>new {name=r.Name,displayed=r.Checked}).ToArray(),changed=changes.ToArray(),readback="owned_original_dialog_render"};
   }finally{if(SetThreadDpiAwarenessContext(previous)==IntPtr.Zero)throw new InvalidOperationException("Recipe View Display DPI context restoration failed");}
  }
 }
}
