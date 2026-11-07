using System;using System.Collections.Generic;using System.Runtime.InteropServices;using Accessibility;
namespace PLCCode.Weinview { public static class ServerDeviceDirectoryControls {
 [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,out IAccessible a);
 [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] children,out int got);
 public sealed class Node {public string path,name,value,action;public int role,state,count;}
 static object Child(IAccessible a,int index){object[] items=new object[1];int got;int hr=AccessibleChildren(a,index,1,items,out got);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(got!=1)throw new Exception("Actual Qt child unavailable");return items[0];}
 static void Read(IAccessible a,int id,string path,int depth,List<Node> rows,HashSet<long> seen){
  if(depth>7||rows.Count>=200)throw new Exception("Small Qt semantic bound exceeded");
  if(id==0){IntPtr identity=Marshal.GetIUnknownForObject(a);try{if(!seen.Add(identity.ToInt64()))return;}finally{Marshal.Release(identity);}}
  int count=id==0?a.accChildCount:0;if(count<0||count>128)throw new Exception("Small Qt child count outside bound");
  var node=new Node{path=path,name=a.get_accName(id),value=a.get_accValue(id),action=a.get_accDefaultAction(id),role=Convert.ToInt32(a.get_accRole(id)),state=Convert.ToInt32(a.get_accState(id)),count=count};rows.Add(node);
  for(int i=0;i<count;i++){object child=Child(a,i);IAccessible nested=child as IAccessible;if(nested!=null)Read(nested,0,path+"/index:"+i,depth+1,rows,seen);else if(child is int)Read(a,(int)child,path+"/id:"+child,depth+1,rows,seen);else throw new Exception("Actual Qt child representation differs");}
 }
 public static Node[] Inspect(PLCCode.Weinview.NativeControls native,long dialog,long qt,string expectedTitle){
  int exact=0;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog&&w.Class=="#32770"&&w.Title==expectedTitle&&w.Visible&&w.Enabled)exact++;
  if(exact!=1)throw new Exception("Exact actually observed owned system-parameters required");exact=0;foreach(var c in native.EnumChildControls(dialog))if(c.Hwnd==qt&&c.Class=="Qt5QWindowIcon"&&c.Visible&&c.Enabled)exact++;
  if(exact!=1)throw new Exception("Actual owned visible Qt child required");
  Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;int hr=AccessibleObjectFromWindow(new IntPtr(qt),0xfffffffc,ref iid,out root);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(root==null)throw new Exception("Actual Qt provider unavailable");
  var rows=new List<Node>();Read(root,0,"client",0,rows,new HashSet<long>());native.EnumChildControls(dialog);return rows.ToArray();
 }
}

}
